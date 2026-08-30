import asyncio
import os
import smtplib
import secrets
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pydantic import BaseModel
from openai import AsyncOpenAI
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import uvicorn
from jose import jwt
from jose.exceptions import JWTError
import shutil

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import engine, get_db, Base, SessionLocal
from models import User, Message, SessionBooking, Review, PlatformWithdrawal, RageRoom, RageRoomPackage, RageRoomBooking, University, EmailVerificationToken, TherapistAvailability, SessionNote
from schemas import (
    UserCreate, UserLogin, Token, UserResponse, MessageCreate,
    MessageResponse, BookingCreate, PaymentRequest, PaymentResponse,
    MoodEntryCreate, MoodEntryResponse, ReviewCreate, ReviewResponse,
    NotificationResponse, AdminUserResponse, AdminStatsResponse,
    TherapistProfileUpdate, TherapistVerificationResponse, AiChatHistoryResponse,
    RageRoomCreate, RageRoomResponse, RageRoomPackageCreate,
    RageRoomPackageResponse, RageRoomBookingCreate,
    UniversityCreate, UniversityResponse, StudentSignupRequest,
    SessionNoteCreate, SessionNoteResponse
)
from crud import (
    get_user_by_email, get_user_by_id, authenticate_user, create_user,
    create_message, get_messages_by_room, create_booking, simulate_payment,
    get_booking_by_id, get_bookings_for_user, get_recent_moods, log_mood_entry,
    create_review, get_reviews_for_therapist, get_review_by_booking,
    create_notification, get_user_notifications, get_unread_count,
    mark_notification_read, mark_all_notifications_read, get_all_users,
    get_admin_stats, toggle_user_active, save_ai_message, get_ai_chat_history,
    add_to_wallet, get_or_create_wallet, create_withdrawal, get_user_withdrawals,
    get_all_withdrawals, get_withdrawal_by_id, update_withdrawal_status,
    deduct_from_wallet, get_wallet
)
from auth import create_access_token, get_current_user
from config import settings
from sqlalchemy import func
from datetime import timedelta

# Initialize Groq AI client
client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

from fastapi.staticfiles import StaticFiles

app = FastAPI(title=settings.PROJECT_NAME)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PUBLIC_PATHS = {"/", "/auth/register", "/auth/login", "/auth/student-signup", "/auth/verify-email", "/api/health", "/universities"}

# Crisis detection
CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "self harm", "self-harm",
    "hurt myself", "don't want to live", "want to die", "no reason to live",
    "better off dead", "can't go on", "end it all", "take my own life"
]

KENYA_CRISIS_RESOURCES = """I'm really concerned about what you're sharing, and I want you to know you're not alone. Please reach out for immediate help:

🇰🇪 Kenya Crisis Lines:
• Befrienders Kenya: 0722 178 177
• Kenya Red Cross: 1199
• National Emergency: 999 / 112

You deserve support right now. Please call one of these numbers, or reach out to someone you trust. Your life matters."""


def detect_crisis(message: str) -> bool:
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in CRISIS_KEYWORDS)


def apply_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


@app.middleware("http")
async def enforce_authentication(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)

    path = request.url.path
    if path in {"/docs", "/openapi.json", "/redoc"}:
        return await call_next(request)

    is_public = (
        path in PUBLIC_PATHS
        or path.startswith("/static")
        or path.startswith("/uploads")
        or path.startswith("/favicon.ico")
        or path.startswith("/ws")
    )

    if not is_public:
        auth_header = request.headers.get("authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Authentication required"})

        token = auth_header.split(" ", 1)[1]
        try:
            jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        except JWTError:
            return JSONResponse(status_code=401, content={"detail": "Invalid or expired token"})

    response = await call_next(request)
    return apply_security_headers(response)


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: int):
        await websocket.accept()
        self.active_connections.setdefault(room_id, []).append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: int):
        if room_id in self.active_connections:
            self.active_connections[room_id] = [
                c for c in self.active_connections[room_id] if c != websocket
            ]
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast_to_room(self, room_id: int, message: str, sender: WebSocket):
        for connection in self.active_connections.get(room_id, []):
            if connection != sender:
                try:
                    await connection.send_text(message)
                except Exception:
                    pass


manager = ConnectionManager()


# ================= ROUTES =================

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Backend is connected"}


@app.post("/auth/register", response_model=Token)
def register(user: UserCreate, db=Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    created_user = create_user(db, user.dict())

    # FIX: Therapists must wait for admin approval
    if created_user.user_type == "therapist":
        created_user.verification_status = "pending"
        db.commit()
        db.refresh(created_user)

    access_token = create_access_token(
        data={"user_id": created_user.id, "user_type": created_user.user_type}
    )
    return {"access_token": access_token, "token_type": "bearer", "user_type": created_user.user_type}
@app.post("/auth/login", response_model=Token)
@limiter.limit("5/minute")
def login(request: Request, user_login: UserLogin, db=Depends(get_db)):
    user = authenticate_user(db, user_login.email, user_login.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"user_id": user.id, "user_type": user.user_type})
    return {"access_token": access_token, "token_type": "bearer", "user_type": user.user_type}


@app.get("/users/me", response_model=UserResponse)
def get_current_user_profile(db=Depends(get_db), current_user=Depends(get_current_user)):
    return current_user


@app.get("/users/me/student-status")
def get_student_status(db=Depends(get_db), current_user=Depends(get_current_user)):
    return {
        "is_verified_student": bool(current_user.is_verified_student),
        "university_id": current_user.university_id,
    }


@app.post("/terms/accept")
def accept_terms(db=Depends(get_db), current_user=Depends(get_current_user)):
    current_user.terms_accepted = True
    current_user.terms_accepted_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return {
        "message": "Terms accepted successfully",
        "terms_accepted": True,
        "terms_accepted_at": current_user.terms_accepted_at
    }


# ============ THERAPIST REGISTRATION ROUTES ============
UPLOAD_DIR = "uploads/licenses"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/therapist/upload-license")
async def upload_license(
    file: UploadFile = File(...),
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can upload licenses")

    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF, JPG, and PNG files are allowed")

    file_extension = file.filename.split(".")[-1]
    safe_filename = f"license_{current_user.id}_{int(datetime.now().timestamp())}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    current_user.license_document_path = file_path

    if current_user.verification_status == "incomplete":
        current_user.verification_status = "pending"

    db.commit()
    db.refresh(current_user)

    return {
        "message": "License uploaded! Your profile is now pending admin approval.",
        "file_path": file_path,
        "verification_status": current_user.verification_status
    }

@app.post("/therapist/profile-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can upload profile photos")

    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WEBP images are allowed")

    # Limit file size to 5MB
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")

    # Create safe filename
    file_extension = file.filename.split(".")[-1].lower()
    safe_filename = f"profile_{current_user.id}_{int(datetime.now().timestamp())}.{file_extension}"
    
    # Save file
    upload_dir = "uploads/profiles"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, safe_filename)
    
    with open(file_path, "wb") as f:
        f.write(contents)

    # Delete old photo if exists (save disk space)
    if current_user.profile_photo_url:
        old_path = current_user.profile_photo_url.lstrip("/")
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except:
                pass

    # Update user record with URL path (frontend uses /uploads/...)
    photo_url = f"/uploads/profiles/{safe_filename}"
    current_user.profile_photo_url = photo_url
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile photo uploaded successfully!",
        "photo_url": photo_url,
    }

@app.put("/therapist/profile")
def update_therapist_profile(
    profile: TherapistProfileUpdate,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can update therapist profile")

    for field, value in profile.dict(exclude_unset=True).items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@app.get("/therapist/status", response_model=TherapistVerificationResponse)
def get_therapist_status(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can view this")
    return current_user


# ============ MESSAGES ROUTES ============

@app.post("/messages", response_model=MessageResponse)
def create_chat_message(message: MessageCreate, db=Depends(get_db), current_user=Depends(get_current_user)):
    booking = get_booking_by_id(db, message.room_id)
    if not booking or current_user.id not in {booking.client_id, booking.therapist_id}:
        raise HTTPException(status_code=403, detail="Unauthorized to post in this room")
    if message.sender_type != current_user.user_type:
        raise HTTPException(status_code=400, detail="sender_type must match authenticated user")
    db_message = create_message(db, message.dict())
    return {
        "id": db_message.id,
        "room_id": db_message.room_id,
        "content": message.content,
        "sender_type": db_message.sender_type,
        "timestamp": db_message.timestamp,
        "encrypted": True,
    }


@app.get("/messages/{room_id}", response_model=List[MessageResponse])
def read_messages(room_id: int, skip: int = 0, limit: int = 100, db=Depends(get_db), current_user=Depends(get_current_user)):
    booking = get_booking_by_id(db, room_id)
    if not booking or current_user.id not in {booking.client_id, booking.therapist_id}:
        raise HTTPException(status_code=403, detail="Unauthorized to access this room")
    return get_messages_by_room(db, room_id, skip=skip, limit=limit)


# ============ BOOKINGS ROUTES ============

@app.post("/bookings")
def create_session_booking(booking: BookingCreate, db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Only clients may book sessions")
    therapist = get_user_by_id(db, booking.therapist_id)
    if not therapist or therapist.user_type != "therapist":
        raise HTTPException(status_code=404, detail="Therapist not found")
    if therapist.verification_status != "approved":
        raise HTTPException(status_code=400, detail="This therapist is not yet approved")

    booking_data = booking.dict()
    booking_data["client_id"] = current_user.id
    booking_data["payment_status"] = "pending"
    db_booking = create_booking(db, booking_data)

    client_name = current_user.name or "A client"
    create_notification(
        db,
        user_id=booking.therapist_id,
        message=f"New booking from {client_name} on {booking.scheduled_time.strftime('%B %d at %I:%M %p')}",
        type="booking"
    )

    return {"booking_id": db_booking.id, "status": "confirmed"}


@app.get("/bookings/me")
def get_my_bookings(db=Depends(get_db), current_user=Depends(get_current_user)):
    bookings = get_bookings_for_user(db, current_user.id)
    user_names = {}

    def get_user_name(user_id: int) -> str:
        if user_id not in user_names:
            user = get_user_by_id(db, user_id)
            user_names[user_id] = user.name or user.email if user else "Unknown"
        return user_names[user_id]

    return [
        {
            "id": b.id,
            "client_id": b.client_id,
            "therapist_id": b.therapist_id,
            "scheduled_time": b.scheduled_time,
            "status": b.status,
            "amount": b.amount,
            "payment_status": b.payment_status,
            "platform_fee": b.platform_fee,
            "therapist_earning": b.therapist_earning,
            "client_name": get_user_name(b.client_id),
            "therapist_name": get_user_name(b.therapist_id),
        }
        for b in bookings
    ]


@app.get("/bookings/{booking_id}")
def read_booking(booking_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    booking = get_booking_by_id(db, booking_id)
    if not booking or current_user.id not in {booking.client_id, booking.therapist_id}:
        raise HTTPException(status_code=404, detail="Booking not found")

    def get_user_name(user_id: int) -> str:
        user = get_user_by_id(db, user_id)
        return user.name or user.email if user else "Unknown"

    return {
        "id": booking.id,
        "client_id": booking.client_id,
        "therapist_id": booking.therapist_id,
        "scheduled_time": booking.scheduled_time,
        "status": booking.status,
        "amount": booking.amount,
        "payment_status": booking.payment_status,
        "platform_fee": booking.platform_fee,
        "therapist_earning": booking.therapist_earning,
        "client_name": get_user_name(booking.client_id),
        "therapist_name": get_user_name(booking.therapist_id),
    }

# ============ TELEHEALTH VIDEO CALL ROUTES ============

@app.get("/bookings/{booking_id}/video-room")
def get_video_room(booking_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    booking = get_booking_by_id(db, booking_id)
    if not booking or current_user.id not in {booking.client_id, booking.therapist_id}:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Generate a private room ID if one doesn't exist yet
    if not booking.video_room_id:
        booking.video_room_id = f"mecac-session-{secrets.token_urlsafe(8)}"
        db.commit()
        db.refresh(booking)

    return {"room_id": booking.video_room_id, "booking_id": booking.id}

# ============ USERS ROUTES ============

@app.get("/users", response_model=List[UserResponse])
def list_users(user_type: Optional[str] = None, db=Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(User)
    if user_type:
        query = query.filter(User.user_type == user_type)
    if user_type == "therapist":
        query = query.filter(User.verification_status == "approved")
    return query.all()


@app.get("/users/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ============ PAYMENTS ROUTES ============

PLATFORM_COMMISSION_RATE = 0.15


@app.post("/payments/simulate", response_model=PaymentResponse)
def process_payment(payment: PaymentRequest, db=Depends(get_db), current_user=Depends(get_current_user)):
    booking = get_booking_by_id(db, payment.booking_id)
    if not booking or booking.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized booking payment")

    result = simulate_payment(payment.phone, payment.amount)
    if result["success"]:
        booking.payment_status = "completed"

        total_amount = payment.amount
        platform_fee = int(total_amount * PLATFORM_COMMISSION_RATE)
        therapist_earning = total_amount - platform_fee

        booking.platform_fee = platform_fee
        booking.therapist_earning = therapist_earning

        add_to_wallet(db, booking.therapist_id, therapist_earning)

        db.commit()

        create_notification(
            db,
            user_id=current_user.id,
            message=f"Payment of KSh {payment.amount} confirmed. Your session is booked!",
            type="payment"
        )

        create_notification(
            db,
            user_id=booking.therapist_id,
            message=f"Payment received! KSh {therapist_earning} has been added to your earnings.",
            type="payment"
        )

    return PaymentResponse(**result)


# ============ MOOD ROUTES ============

@app.get("/mood/entries", response_model=List[MoodEntryResponse])
def get_my_moods(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Only clients can track moods")
    return get_recent_moods(db, current_user.id)


@app.post("/mood/log", response_model=MoodEntryResponse)
def log_mood(mood: MoodEntryCreate, db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Only clients can track moods")
    return log_mood_entry(db, current_user.id, mood.dict())


# ============ WEBSOCKET ROUTES ============

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: int):
    auth_header = websocket.headers.get("authorization")
    token = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
    else:
        token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=1008)
        return

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise JWTError()
    except JWTError:
        await websocket.close(code=1008)
        return

    db = SessionLocal()
    try:
        booking = get_booking_by_id(db, room_id)
        if not booking or user_id not in {booking.client_id, booking.therapist_id}:
            await websocket.close(code=1008)
            return
    finally:
        db.close()

    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast_to_room(room_id, f"room:{room_id}:{data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)


@app.get("/")
def read_root():
    return {"message": "Mecac API", "status": "healthy"}


# ============ REVIEWS ROUTES ============

@app.post("/reviews", response_model=ReviewResponse)
def submit_review(review: ReviewCreate, db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Only clients can submit reviews")

    booking = get_booking_by_id(db, review.booking_id)
    if not booking or booking.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to review this booking")
    if booking.status != "completed":
        raise HTTPException(status_code=400, detail="Can only review completed sessions")
    if booking.therapist_id != review.therapist_id:
        raise HTTPException(status_code=400, detail="Therapist ID mismatch")

    existing = get_review_by_booking(db, review.booking_id)
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this session")

    review_data = review.dict()
    review_data["client_id"] = current_user.id
    return create_review(db, review_data)


@app.get("/reviews/therapist/{therapist_id}", response_model=List[ReviewResponse])
def get_therapist_reviews(therapist_id: int, db=Depends(get_db)):
    return get_reviews_for_therapist(db, therapist_id)


@app.get("/reviews/me", response_model=List[ReviewResponse])
def get_my_reviews(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Only clients have reviews")
    return db.query(Review).filter(Review.client_id == current_user.id).order_by(Review.created_at.desc()).all()


# ============ NOTIFICATIONS ROUTES ============

@app.get("/notifications/me", response_model=List[NotificationResponse])
def get_my_notifications(db=Depends(get_db), current_user=Depends(get_current_user)):
    return get_user_notifications(db, current_user.id)


@app.get("/notifications/unread-count")
def get_my_unread_count(db=Depends(get_db), current_user=Depends(get_current_user)):
    count = get_unread_count(db, current_user.id)
    return {"count": count}


@app.put("/notifications/{notification_id}/read")
def read_notification(notification_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    notification = mark_notification_read(db, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return {"message": "Marked as read"}


@app.put("/notifications/read-all")
def read_all_notifications(db=Depends(get_db), current_user=Depends(get_current_user)):
    mark_all_notifications_read(db, current_user.id)
    return {"message": "All notifications marked as read"}


# ============ ADMIN ROUTES ============

def require_admin(current_user=Depends(get_current_user)):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@app.get("/admin/stats", response_model=AdminStatsResponse)
def admin_get_stats(db=Depends(get_db), admin=Depends(require_admin)):
    return get_admin_stats(db)

# ============ ADMIN ANALYTICS TIME-SERIES ============

@app.get("/admin/analytics/timeseries")
def get_admin_analytics(
    days: int = 30,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Daily revenue from completed bookings
    revenue_query = db.query(
        func.date(SessionBooking.scheduled_time).label('date'),
        func.sum(SessionBooking.amount).label('revenue'),
        func.count(SessionBooking.id).label('bookings')
    ).filter(
        SessionBooking.status == 'completed',
        SessionBooking.scheduled_time >= start_date
    ).group_by(func.date(SessionBooking.scheduled_time)).all()
    
    revenue_dict = {str(row.date): {'revenue': float(row.revenue or 0), 'bookings': int(row.bookings)} for row in revenue_query}
    
    # Daily new users
    users_query = db.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('count')
    ).filter(
        User.created_at >= start_date
    ).group_by(func.date(User.created_at)).all()
    
    users_dict = {str(row.date): int(row.count) for row in users_query}
    
    # Daily rage room bookings
    rage_query = db.query(
        func.date(RageRoomBooking.scheduled_time).label('date'),
        func.count(RageRoomBooking.id).label('count'),
        func.sum(RageRoomBooking.amount).label('revenue')
    ).filter(
        RageRoomBooking.scheduled_time >= start_date,
        RageRoomBooking.payment_status == 'completed'
    ).group_by(func.date(RageRoomBooking.scheduled_time)).all()
    
    rage_dict = {str(row.date): {'count': int(row.count), 'revenue': float(row.revenue or 0)} for row in rage_query}
    
    # Build the timeline
    timeline = []
    for i in range(days):
        date = (datetime.utcnow() - timedelta(days=days - 1 - i)).date()
        date_str = str(date)
        
        rev_data = revenue_dict.get(date_str, {'revenue': 0, 'bookings': 0})
        
        timeline.append({
            'date': date.strftime('%b %d'),
            'revenue': rev_data['revenue'],
            'bookings': rev_data['bookings'],
            'new_users': users_dict.get(date_str, 0),
            'rage_bookings': rage_dict.get(date_str, {}).get('count', 0),
            'rage_revenue': rage_dict.get(date_str, {}).get('revenue', 0),
        })
    
    return timeline


@app.get("/admin/users", response_model=List[AdminUserResponse])
def admin_list_users(
    user_type: Optional[str] = None,
    search: Optional[str] = None,
    db=Depends(get_db),
    admin=Depends(require_admin)
):
    return get_all_users(db, user_type=user_type, search=search)


@app.get("/admin/users/{user_id}", response_model=AdminUserResponse)
def admin_get_user(user_id: int, db=Depends(get_db), admin=Depends(require_admin)):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.put("/admin/users/{user_id}/toggle-active")
def admin_toggle_user(user_id: int, db=Depends(get_db), admin=Depends(require_admin)):
    user = toggle_user_active(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "message": f"User {'activated' if user.is_active else 'deactivated'} successfully",
        "user_id": user.id,
        "is_active": user.is_active
    }


@app.get("/admin/export/users")
def admin_export_users(db=Depends(get_db), admin=Depends(require_admin)):
    from fastapi.responses import Response
    import csv
    import io

    users = get_all_users(db)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Email", "Name", "Type", "Active", "Terms Accepted", "Created At"])

    for user in users:
        writer.writerow([
            user.id,
            user.email,
            user.name or "N/A",
            user.user_type,
            "Yes" if user.is_active else "No",
            "Yes" if user.terms_accepted else "No",
            user.created_at.strftime("%Y-%m-%d %H:%M:%S") if user.created_at else "N/A"
        ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=users_export.csv"}
    )


@app.put("/admin/therapists/{user_id}/approve")
def admin_approve_therapist(user_id: int, db=Depends(get_db), admin=Depends(require_admin)):
    user = get_user_by_id(db, user_id)
    if not user or user.user_type != "therapist":
        raise HTTPException(status_code=404, detail="Therapist not found")
    user.verification_status = "approved"
    db.commit()
    db.refresh(user)

    create_notification(
        db,
        user_id=user.id,
        message="Your therapist account has been approved! You can now accept clients.",
        type="system"
    )

    return {"message": "Therapist approved", "user_id": user.id}


@app.put("/admin/therapists/{user_id}/reject")
def admin_reject_therapist(user_id: int, db=Depends(get_db), admin=Depends(require_admin)):
    user = get_user_by_id(db, user_id)
    if not user or user.user_type != "therapist":
        raise HTTPException(status_code=404, detail="Therapist not found")
    user.verification_status = "rejected"
    db.commit()
    db.refresh(user)

    create_notification(
        db,
        user_id=user.id,
        message="Your therapist application has been rejected. Please contact support.",
        type="system"
    )

    return {"message": "Therapist rejected", "user_id": user.id}


@app.get("/admin/therapists/pending", response_model=List[TherapistVerificationResponse])
def admin_get_pending_therapists(db=Depends(get_db), admin=Depends(require_admin)):
    return db.query(User).filter(
        User.user_type == "therapist",
        User.verification_status == "pending"
    ).order_by(User.created_at.desc()).all()


# ============ ADMIN PLATFORM WITHDRAWALS ============

@app.post("/admin/withdraw-platform-earnings")
def admin_withdraw_earnings(
    amount: int,
    destination: str,
    account_details: str,
    db=Depends(get_db),
    admin=Depends(require_admin)
):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")

    withdrawal = PlatformWithdrawal(
        amount=amount,
        destination=destination,
        account_details=account_details,
        status="pending",
        requested_by=admin.id
    )
    db.add(withdrawal)
    db.commit()

    return {
        "message": f"Withdrawal request of KSh {amount} submitted successfully",
        "withdrawal_id": withdrawal.id
    }


# ============ AI ROUTES ============

class AIMessage(BaseModel):
    role: str
    content: str


class AIChatRequest(BaseModel):
    messages: List[AIMessage]


MECAC_SYSTEM_PROMPT = """You are a compassionate AI mental health support companion for Afya Care Connect, a professional mental health platform. 

Your Core Rules:
1. NEVER output raw JSON, curly brackets {}, or code blocks. Just output plain text.
2. NEVER provide clinical diagnoses or replace professional therapy.
3. If someone expresses thoughts of self-harm, immediately provide crisis resources (Befrienders Kenya: 0722 178 177).
4. Remind users that you are an AI support tool, not a replacement for their therapist.

Formatting & Style Rules (CRITICAL):
- Keep responses SHORT and concise (max 3-4 short sentences or a brief list).
- Use **bold text** to emphasize key actions, important words, or steps.
- Use bullet points (-) for lists instead of long paragraphs.
- Do not use literal '\\n' characters in your text; just use actual line breaks.
- Always respond with warmth, validation, and non-judgment.
"""

AI_MODEL = os.getenv("AI_MODEL", "openai/gpt-oss-120b")


@app.get("/ai/history", response_model=List[AiChatHistoryResponse])
def get_ai_history(db=Depends(get_db), current_user=Depends(get_current_user)):
    history = get_ai_chat_history(db, current_user.id, limit=20)
    return list(reversed(history))


@app.post("/ai/chat")
@limiter.limit("10/minute")
async def ai_chat(request: Request, chat_request: AIChatRequest, db=Depends(get_db), current_user=Depends(get_current_user)):
    user_message = chat_request.messages[-1].content if chat_request.messages else ""

    if detect_crisis(user_message):
        save_ai_message(db, current_user.id, "user", user_message)
        save_ai_message(db, current_user.id, "assistant", KENYA_CRISIS_RESOURCES)
        db.commit()
        return {"message": KENYA_CRISIS_RESOURCES}

    if user_message:
        save_ai_message(db, current_user.id, "user", user_message)
        db.commit()

    history = get_ai_chat_history(db, current_user.id, limit=10)
    history_messages = [
        {"role": msg.role, "content": msg.content}
        for msg in reversed(history[:-1])
    ]

    api_messages = [{"role": "system", "content": MECAC_SYSTEM_PROMPT}]
    api_messages.extend(history_messages)
    api_messages.append({"role": "user", "content": user_message})

    try:
        response = await client.chat.completions.create(
            model=AI_MODEL,
            messages=api_messages,
            temperature=0.7,
            max_tokens=300,
            stream=False,
        )

        raw_content = response.choices[0].message.content if response.choices else None
        ai_message = raw_content if isinstance(raw_content, str) else "I'm here to support you. Please try again."

        save_ai_message(db, current_user.id, "assistant", ai_message)
        db.commit()

        return {"message": ai_message}

    except Exception as e:
        print(f"AI Error: {e}")
        return {"message": "I'm here to support you. Please try again."}


# ============ THERAPIST EARNINGS & WITHDRAWALS ============

@app.get("/therapist/earnings")
def get_my_earnings(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can view earnings")

    wallet = get_wallet(db, current_user.id)
    withdrawals = get_user_withdrawals(db, current_user.id)

    return {
        "balance": wallet.balance,
        "total_earned": wallet.total_earned,
        "total_withdrawn": wallet.total_withdrawn,
        "withdrawals": [
            {
                "id": w.id,
                "amount_requested": w.amount_requested,
                "platform_fee": w.platform_fee,
                "amount_sent": w.amount_sent,
                "mpesa_phone": w.mpesa_phone,
                "status": w.status,
                "admin_note": w.admin_note,
                "created_at": w.created_at.isoformat() if w.created_at else None,
                "processed_at": w.processed_at.isoformat() if w.processed_at else None,
            }
            for w in withdrawals
        ]
    }


@app.post("/therapist/withdraw")
def request_withdrawal(
    amount: float,
    mpesa_phone: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can withdraw")

    if amount < 500:
        raise HTTPException(status_code=400, detail="Minimum withdrawal is KSh 500")

    wallet = get_wallet(db, current_user.id)
    if wallet.balance < amount:
        raise HTTPException(status_code=400, detail=f"Insufficient balance. Available: KSh {wallet.balance}")

    if not mpesa_phone.startswith("254") or len(mpesa_phone) != 12:
        raise HTTPException(status_code=400, detail="Enter valid M-Pesa number (e.g., 254712345678)")

    platform_fee = amount * PLATFORM_COMMISSION_RATE
    amount_sent = amount - platform_fee

    deduct_from_wallet(db, current_user.id, amount)

    withdrawal = create_withdrawal(db, {
        "user_id": current_user.id,
        "amount_requested": amount,
        "platform_fee": platform_fee,
        "amount_sent": amount_sent,
        "mpesa_phone": mpesa_phone,
        "status": "pending"
    })

    create_notification(
        db,
        user_id=1,
        message=f"New withdrawal request: KSh {amount} from {current_user.name or current_user.email}",
        type="system"
    )

    return {
        "message": f"Withdrawal request of KSh {amount} submitted. You will receive KSh {amount_sent} after 15% platform fee.",
        "withdrawal_id": withdrawal.id
    }


# ============ ADMIN WITHDRAWAL MANAGEMENT ============

@app.get("/admin/withdrawals")
def admin_get_withdrawals(status: Optional[str] = None, db=Depends(get_db), admin=Depends(require_admin)):
    withdrawals = get_all_withdrawals(db, status=status)

    result = []
    for w in withdrawals:
        user = get_user_by_id(db, w.user_id)
        result.append({
            "id": w.id,
            "user_name": user.name or user.email if user else "Unknown",
            "user_email": user.email if user else "N/A",
            "amount_requested": w.amount_requested,
            "platform_fee": w.platform_fee,
            "amount_sent": w.amount_sent,
            "mpesa_phone": w.mpesa_phone,
            "status": w.status,
            "admin_note": w.admin_note,
            "created_at": w.created_at.isoformat() if w.created_at else None,
            "processed_at": w.processed_at.isoformat() if w.processed_at else None,
        })
    return result


@app.put("/admin/withdrawals/{withdrawal_id}/approve")
def admin_approve_withdrawal(withdrawal_id: int, db=Depends(get_db), admin=Depends(require_admin)):
    withdrawal = get_withdrawal_by_id(db, withdrawal_id)
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    if withdrawal.status != "pending":
        raise HTTPException(status_code=400, detail="Withdrawal already processed")

    withdrawal = update_withdrawal_status(db, withdrawal_id, "approved", admin_note=f"Approved by {admin.name or admin.email}")

    create_notification(
        db,
        user_id=withdrawal.user_id,
        message=f"Your withdrawal of KSh {withdrawal.amount_sent} has been approved! It will be sent to {withdrawal.mpesa_phone}.",
        type="payment"
    )

    return {"message": "Withdrawal approved", "withdrawal_id": withdrawal_id}


@app.put("/admin/withdrawals/{withdrawal_id}/reject")
def admin_reject_withdrawal(withdrawal_id: int, note: Optional[str] = None, db=Depends(get_db), admin=Depends(require_admin)):
    withdrawal = get_withdrawal_by_id(db, withdrawal_id)
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    if withdrawal.status != "pending":
        raise HTTPException(status_code=400, detail="Withdrawal already processed")

    add_to_wallet(db, withdrawal.user_id, withdrawal.amount_requested)

    withdrawal = update_withdrawal_status(db, withdrawal_id, "rejected", admin_note=note or "Rejected by admin")

    create_notification(
        db,
        user_id=withdrawal.user_id,
        message=f"Your withdrawal request was rejected. KSh {withdrawal.amount_requested} has been refunded to your balance.",
        type="payment"
    )

    return {"message": "Withdrawal rejected and refunded", "withdrawal_id": withdrawal_id}


# ============ SESSION NOTES & BOOKING COMPLETION ROUTES ============

@app.put("/bookings/{booking_id}/complete")
def complete_booking(booking_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    booking = get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.therapist_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the therapist can complete this session")

    booking.status = "completed"
    db.commit()
    db.refresh(booking)

    create_notification(
        db,
        user_id=booking.client_id,
        message="Your session has been marked as completed. Don't forget to leave a review!",
        type="system"
    )

    return {"message": "Session marked as completed", "booking_id": booking_id}


@app.put("/bookings/{booking_id}/confirm")
def confirm_booking(booking_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    booking = get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.therapist_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the therapist can confirm this session")

    booking.status = "confirmed"
    db.commit()
    db.refresh(booking)

    create_notification(
        db,
        user_id=booking.client_id,
        message="Your session has been confirmed by your therapist!",
        type="booking"
    )

    return {"message": "Session confirmed", "booking_id": booking_id}


@app.put("/bookings/{booking_id}/cancel")
def cancel_booking(booking_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    booking = get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.client_id != current_user.id and booking.therapist_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to cancel this session")

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)

    notify_user_id = booking.therapist_id if current_user.id == booking.client_id else booking.client_id
    create_notification(
        db,
        user_id=notify_user_id,
        message="A session has been cancelled.",
        type="booking"
    )

    return {"message": "Session cancelled", "booking_id": booking_id}

# ============ SECURE CLINICAL SESSION NOTES ROUTES ============

@app.get("/therapist/session-notes", response_model=List[SessionNoteResponse])
def list_my_session_notes(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can view clinical notes")
    return db.query(SessionNote).filter(
        SessionNote.therapist_id == current_user.id
    ).order_by(SessionNote.updated_at.desc()).all()


@app.get("/therapist/session-notes/{booking_id}", response_model=SessionNoteResponse)
def get_session_note(booking_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can access clinical notes")

    booking = get_booking_by_id(db, booking_id)
    if not booking or booking.therapist_id != current_user.id:
        raise HTTPException(status_code=404, detail="Booking not found")

    note = db.query(SessionNote).filter(SessionNote.booking_id == booking_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="No notes found for this session")
    return note


@app.post("/therapist/session-notes/{booking_id}", response_model=SessionNoteResponse)
def create_or_update_session_note(
    booking_id: int,
    note_data: SessionNoteCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can write clinical notes")

    booking = get_booking_by_id(db, booking_id)
    if not booking or booking.therapist_id != current_user.id:
        raise HTTPException(status_code=404, detail="Booking not found")

    existing_note = db.query(SessionNote).filter(SessionNote.booking_id == booking_id).first()

    if existing_note:
        existing_note.subjective = note_data.subjective
        existing_note.objective = note_data.objective
        existing_note.assessment = note_data.assessment
        existing_note.plan = note_data.plan
        existing_note.private_notes = note_data.private_notes
        existing_note.risk_level = note_data.risk_level or "low"
        existing_note.follow_up_required = bool(note_data.follow_up_required)
        existing_note.updated_at = datetime.utcnow()
        existing_note.treatment_approach = note_data.treatment_approach
        existing_note.techniques_used = note_data.techniques_used
        db.commit()
        db.refresh(existing_note)
        return existing_note

    new_note = SessionNote(
        booking_id=booking.id,
        therapist_id=booking.therapist_id,
        client_id=booking.client_id,
        subjective=note_data.subjective,
        objective=note_data.objective,
        assessment=note_data.assessment,
        plan=note_data.plan,
        private_notes=note_data.private_notes,
        risk_level=note_data.risk_level or "low",
        follow_up_required=bool(note_data.follow_up_required),
        treatment_approach=note_data.treatment_approach,
        techniques_used=note_data.techniques_used,
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note

# ============ THERAPIST CLIENTS ROUTES ============

@app.get("/therapist/clients")
def get_therapist_clients(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can view clients")

    bookings = get_bookings_for_user(db, current_user.id)

    client_map = {}
    for booking in bookings:
        client_id = booking.client_id
        if client_id not in client_map:
            client = get_user_by_id(db, client_id)
            client_map[client_id] = {
                "id": client_id,
                "name": client.name or client.email if client else "Unknown",
                "email": client.email if client else "N/A",
                "total_sessions": 0,
                "completed_sessions": 0,
                "last_session": None,
            }

        client_map[client_id]["total_sessions"] += 1
        if booking.status == "completed":
            client_map[client_id]["completed_sessions"] += 1

        if client_map[client_id]["last_session"] is None or booking.scheduled_time > client_map[client_id]["last_session"]:
            client_map[client_id]["last_session"] = booking.scheduled_time

    return list(client_map.values())


# ============ RAGE ROOM ROUTES ============

@app.get("/rage-rooms", response_model=List[RageRoomResponse])
def list_rage_rooms(db=Depends(get_db), current_user=Depends(get_current_user)):
    rooms = db.query(RageRoom).filter(RageRoom.is_active == True).order_by(RageRoom.created_at.desc()).all()
    result = []
    for room in rooms:
        packages = db.query(RageRoomPackage).filter(RageRoomPackage.rage_room_id == room.id).all()
        result.append({
            "id": room.id,
            "name": room.name,
            "location": room.location,
            "description": room.description,
            "available_days": room.available_days,
            "available_hours": room.available_hours,
            "is_active": room.is_active,
            "created_at": room.created_at,
            "packages": packages,
        })
    return result


@app.post("/rage-rooms", response_model=RageRoomResponse)
def create_rage_room(room: RageRoomCreate, db=Depends(get_db), admin=Depends(require_admin)):
    db_room = RageRoom(**room.dict())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return {
        "id": db_room.id,
        "name": db_room.name,
        "location": db_room.location,
        "description": db_room.description,
        "available_days": db_room.available_days,
        "available_hours": db_room.available_hours,
        "is_active": db_room.is_active,
        "created_at": db_room.created_at,
        "packages": [],
    }


@app.post("/rage-rooms/{room_id}/packages", response_model=RageRoomPackageResponse)
def add_rage_room_package(room_id: int, package: RageRoomPackageCreate, db=Depends(get_db), admin=Depends(require_admin)):
    room = db.query(RageRoom).filter(RageRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Rage room not found")
    db_package = RageRoomPackage(rage_room_id=room_id, **package.dict())
    db.add(db_package)
    db.commit()
    db.refresh(db_package)
    return db_package


@app.put("/rage-rooms/{room_id}/toggle-active")
def toggle_rage_room(room_id: int, db=Depends(get_db), admin=Depends(require_admin)):
    db_room = db.query(RageRoom).filter(RageRoom.id == room_id).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Rage room not found")
    db_room.is_active = not db_room.is_active
    db.commit()
    db.refresh(db_room)
    return {"message": f"Rage room {'activated' if db_room.is_active else 'deactivated'}", "is_active": db_room.is_active}


@app.post("/rage-rooms/book")
def book_rage_room(booking: RageRoomBookingCreate, db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Only clients can book rage rooms")

    package = db.query(RageRoomPackage).filter(RageRoomPackage.id == booking.package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")

    room = db.query(RageRoom).filter(RageRoom.id == package.rage_room_id, RageRoom.is_active == True).first()
    if not room:
        raise HTTPException(status_code=404, detail="Rage room not found")

    # FIXED: Student rate logic is now OUTSIDE the "if not room" block
    if booking.use_student_rate:
        if not current_user.is_verified_student:
            raise HTTPException(status_code=403, detail="You must verify your student email first. Go to Settings to verify.")

        uni = db.query(University).filter(University.id == current_user.university_id).first()
        if not uni or not uni.is_active:
            raise HTTPException(status_code=403, detail="Your university subscription is not active.")
        if uni.rage_room_credit_pool <= 0:
            raise HTTPException(status_code=403, detail="Your university has no remaining rage room credits. Full price applies.")

        STUDENT_TOKEN = {"basic": 100, "regular": 150, "premium": 200}
        amount = STUDENT_TOKEN.get(package.tier, package.price)
        is_student = True

        uni.rage_room_credit_pool -= 1
        db.commit()
    else:
        amount = package.price
        is_student = False

    db_booking = RageRoomBooking(
        client_id=current_user.id,
        rage_room_id=room.id,
        package_id=package.id,
        scheduled_time=booking.scheduled_time,
        amount=amount,
        status="pending",
        payment_status="pending",
        is_student_rate=is_student,
        waiver_signed=True,
        waiver_signed_at=datetime.utcnow(),
        signer_name=booking.signer_name,
        signer_id_number=booking.signer_id_number,
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    return {"booking_id": db_booking.id, "amount": amount, "status": "pending", "is_student_rate": is_student}


@app.get("/rage-rooms/bookings/me")
def my_rage_bookings(db=Depends(get_db), current_user=Depends(get_current_user)):
    bookings = db.query(RageRoomBooking).filter(
        RageRoomBooking.client_id == current_user.id
    ).order_by(RageRoomBooking.created_at.desc()).all()

    result = []
    for b in bookings:
        room = db.query(RageRoom).filter(RageRoom.id == b.rage_room_id).first()
        package = db.query(RageRoomPackage).filter(RageRoomPackage.id == b.package_id).first()
        result.append({
            "id": b.id,
            "rage_room_id": b.rage_room_id,
            "room_name": room.name if room else "Unknown",
            "location": room.location if room else "",
            "package_name": package.name if package else "Unknown",
            "tier": package.tier if package else "",
            "scheduled_time": b.scheduled_time,
            "duration_minutes": package.duration_minutes if package else 60,
            "status": b.status,
            "amount": b.amount,
            "payment_status": b.payment_status,
            "payment_method": b.payment_method,
            "is_student_rate": b.is_student_rate,
        })
    return result


@app.post("/rage-rooms/pay")
def pay_rage_booking(booking_id: int, phone: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    booking = db.query(RageRoomBooking).filter(RageRoomBooking.id == booking_id).first()
    if not booking or booking.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized booking")

    result = simulate_payment(phone, booking.amount)
    if result["success"]:
        booking.payment_status = "completed"
        booking.status = "confirmed"
        booking.payment_method = "in_app"
        booking.platform_fee = int(booking.amount * PLATFORM_COMMISSION_RATE)
        db.commit()

        create_notification(
            db,
            user_id=current_user.id,
            message=f"Payment of KSh {booking.amount} confirmed. Your rage room session is booked!",
            type="payment"
        )

    return PaymentResponse(**result)


@app.put("/rage-rooms/bookings/{booking_id}/confirm-onsite")
def confirm_onsite_payment(booking_id: int, db=Depends(get_db), admin=Depends(require_admin)):
    booking = db.query(RageRoomBooking).filter(RageRoomBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.payment_status = "completed"
    booking.status = "confirmed"
    booking.payment_method = "on_site"
    booking.platform_fee = int(booking.amount * PLATFORM_COMMISSION_RATE)
    db.commit()

    create_notification(
        db,
        user_id=booking.client_id,
        message=f"On-site payment confirmed for your rage room session. See you there!",
        type="payment"
    )

    return {"message": "On-site payment confirmed", "booking_id": booking_id}


@app.get("/admin/rage-bookings")
def admin_get_rage_bookings(db=Depends(get_db), admin=Depends(require_admin)):
    bookings = db.query(RageRoomBooking).order_by(RageRoomBooking.created_at.desc()).all()
    result = []
    for b in bookings:
        room = db.query(RageRoom).filter(RageRoom.id == b.rage_room_id).first()
        package = db.query(RageRoomPackage).filter(RageRoomPackage.id == b.package_id).first()
        client = get_user_by_id(db, b.client_id)
        result.append({
            "id": b.id,
            "client_name": client.name or client.email if client else "Unknown",
            "room_name": room.name if room else "Unknown",
            "package_name": package.name if package else "Unknown",
            "scheduled_time": b.scheduled_time,
            "amount": b.amount,
            "payment_status": b.payment_status,
            "payment_method": b.payment_method,
            "platform_fee": b.platform_fee,
            "is_student_rate": b.is_student_rate,
            "status": b.status,
        })
    return result


# ============ UNIVERSITY ROUTES ============

@app.get("/universities", response_model=List[UniversityResponse])
def list_universities(db=Depends(get_db)):
    return db.query(University).filter(University.is_active == True).all()


@app.post("/admin/universities", response_model=UniversityResponse)
def create_university(uni: UniversityCreate, db=Depends(get_db), admin=Depends(require_admin)):
    existing = db.query(University).filter(University.email_domain == uni.email_domain).first()
    if existing:
        raise HTTPException(status_code=400, detail="University with this email domain already exists")
    db_uni = University(**uni.dict())
    db.add(db_uni)
    db.commit()
    db.refresh(db_uni)
    return db_uni


@app.put("/admin/universities/{uni_id}/toggle-active")
def toggle_university(uni_id: int, db=Depends(get_db), admin=Depends(require_admin)):
    uni = db.query(University).filter(University.id == uni_id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="University not found")
    uni.is_active = not uni.is_active
    db.commit()
    return {"message": f"University {'activated' if uni.is_active else 'deactivated'}", "is_active": uni.is_active}


@app.put("/admin/universities/{uni_id}/add-credits")
def add_university_credits(uni_id: int, credits: int, db=Depends(get_db), admin=Depends(require_admin)):
    uni = db.query(University).filter(University.id == uni_id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="University not found")
    uni.rage_room_credit_pool += credits
    db.commit()
    return {"message": f"Added {credits} credits", "new_total": uni.rage_room_credit_pool}


# ============ STUDENT SIGNUP & EMAIL VERIFICATION ============

@app.post("/auth/student-signup")
def student_signup(data: StudentSignupRequest, db=Depends(get_db)):
    uni = db.query(University).filter(University.id == data.university_id, University.is_active == True).first()
    if not uni:
        raise HTTPException(status_code=404, detail="University not found or inactive")

    # FIXED: Use endswith() to support subdomain emails like seth.ihiga24@s.karu.ac.ke
    email_domain = data.email.split("@")[-1].lower()
    if not email_domain.endswith(uni.email_domain.lower()):
        raise HTTPException(status_code=400, detail=f"Email must end with @{uni.email_domain}")

    existing = get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash(data.password)

    new_user = User(
        email=data.email,
        hashed_password=hashed_password,
        user_type="client",
        name=data.name,
        university_id=uni.id,
        is_verified_student=False,
        terms_accepted=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=24)
    verification = EmailVerificationToken(
        user_id=new_user.id,
        token=token,
        expires_at=expires_at,
    )
    db.add(verification)
    db.commit()

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    verify_link = f"{frontend_url}/verify-email?token={token}"

    # FIXED: Proper indentation for email sending
    try:
        email_user = os.getenv("EMAIL_USER", "")
        email_password = os.getenv("EMAIL_PASSWORD", "")
        email_host = os.getenv("EMAIL_HOST", "smtp.gmail.com")
        email_port = int(os.getenv("EMAIL_PORT", "587"))

        if not email_user or not email_password:
            print("⚠️ EMAIL_USER or EMAIL_PASSWORD not set in .env")
            print(f"   🔗 Manual link: {verify_link}")
        else:
            msg = MIMEMultipart("alternative")
            msg["From"] = f"Mecac Care Connect <{email_user}>"
            msg["To"] = data.email
            msg["Subject"] = "Verify your Mecac student account"

            html_body = f"""
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem;">
                <h2 style="color: #2E7D32; margin-bottom: 0.5rem;">Welcome to Mecac, {data.name or 'Student'}!</h2>
                <p style="color: #374151;">You signed up as a <strong>{uni.name}</strong> student.</p>
                <p style="color: #374151;">Click the button below to verify your email and unlock student pricing (KSh 100/150/200 for rage room sessions).</p>
                <div style="margin: 1.5rem 0;">
                    <a href="{verify_link}" style="display: inline-block; padding: 14px 28px; background: #2E7D32; color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 1rem;">Verify My Email</a>
                </div>
                <p style="color: #9CA3AF; font-size: 0.8rem; border-top: 1px solid #E5E7EB; padding-top: 1rem;">
                    This link expires in 24 hours. If you didn't sign up, ignore this email.<br>
                    Mecac Care Connect — Kenya's Mental Health Platform
                </p>
            </div>
            """

            msg.attach(MIMEText(html_body, "html"))

            server = smtplib.SMTP(email_host, email_port)
            server.starttls()
            server.login(email_user, email_password)
            server.sendmail(email_user, data.email, msg.as_string())
            server.quit()

            print(f" Verification email sent to {data.email}")

    except Exception as e:
        print(f" Email send failed: {e}")
        print(f"    Manual link: {verify_link}")

    return {
        "requires_verification": True,
        "message": "Verification email sent! Check your inbox, click the link, then log in.",
    }


@app.get("/auth/verify-email")
def verify_email(token: str, db=Depends(get_db)):
    verification = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.token == token,
        EmailVerificationToken.is_used == False,
    ).first()

    if not verification:
        return {"success": False, "message": "Invalid or expired verification link."}

    if verification.expires_at < datetime.utcnow():
        return {"success": False, "message": "Verification link has expired. Please sign up again."}

    user = get_user_by_id(db, verification.user_id)
    if user:
        user.is_verified_student = True
        verification.is_used = True
        db.commit()

    return {"success": True, "message": "Email verified! You now have access to student pricing."}


# ============ ADMIN UNIVERSITY MANAGEMENT ============

@app.get("/admin/universities/list")
def admin_list_universities(db=Depends(get_db), admin=Depends(require_admin)):
    unis = db.query(University).order_by(University.created_at.desc()).all()
    result = []
    for uni in unis:
        student_count = db.query(User).filter(User.university_id == uni.id, User.is_verified_student == True).count()
        result.append({
            "id": uni.id,
            "name": uni.name,
            "email_domain": uni.email_domain,
            "subscription_tier": uni.subscription_tier,
            "subscription_expires": uni.subscription_expires,
            "rage_room_credit_pool": uni.rage_room_credit_pool,
            "is_active": uni.is_active,
            "student_count": student_count,
            "created_at": uni.created_at,
        })
    return result


# ============ THERAPIST AVAILABILITY ROUTES ============

@app.get("/therapist/availability")
def get_my_availability(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can view availability")
    
    slots = db.query(TherapistAvailability).filter(
        TherapistAvailability.therapist_id == current_user.id
    ).order_by(TherapistAvailability.day_of_week, TherapistAvailability.start_time).all()
    
    return [
        {
            "id": slot.id,
            "day_of_week": slot.day_of_week,
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "is_available": slot.is_available,
        }
        for slot in slots
    ]


@app.post("/therapist/availability")
def set_availability(
    availability_data: List[dict],
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can set availability")
    
    # Delete existing availability
    db.query(TherapistAvailability).filter(
        TherapistAvailability.therapist_id == current_user.id
    ).delete()
    
    # Add new availability slots
    for slot in availability_data:
        new_slot = TherapistAvailability(
            therapist_id=current_user.id,
            day_of_week=slot["day_of_week"],
            start_time=slot["start_time"],
            end_time=slot["end_time"],
            is_available=slot.get("is_available", True)
        )
        db.add(new_slot)
    
    db.commit()
    return {"message": "Availability updated successfully", "slots_count": len(availability_data)}


@app.get("/therapist/{therapist_id}/available-slots")
def get_available_slots(
    therapist_id: int,
    date: str,
    db=Depends(get_db)
):
    from datetime import datetime as dt
    
    # Parse the date (format: YYYY-MM-DD)
    try:
        selected_date = dt.strptime(date, "%Y-%m-%d")
        day_of_week = selected_date.weekday()  # 0 = Monday, 6 = Sunday
    except:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Get therapist's availability for this day
    slots = db.query(TherapistAvailability).filter(
        TherapistAvailability.therapist_id == therapist_id,
        TherapistAvailability.day_of_week == day_of_week,
        TherapistAvailability.is_available == True
    ).all()
    
    # Get existing bookings for this therapist on this date
    existing_bookings = db.query(SessionBooking).filter(
        SessionBooking.therapist_id == therapist_id,
        func.date(SessionBooking.scheduled_time) == date
    ).all()
    
    booked_times = [booking.scheduled_time.strftime("%H:%M") for booking in existing_bookings]
    
    # Generate available time slots
    available_slots = []
    for slot in slots:
        start_hour = int(slot.start_time.split(":")[0])
        end_hour = int(slot.end_time.split(":")[0])
        
        for hour in range(start_hour, end_hour):
            time_str = f"{hour:02d}:00"
            if time_str not in booked_times:
                available_slots.append(time_str)
    
    return {
        "date": date,
        "day_of_week": day_of_week,
        "available_slots": sorted(available_slots)
    }

# ============ THERAPIST PERFORMANCE METRICS ============

@app.get("/therapist/stats")
def get_therapist_stats(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Therapist access required")

    all_bookings = db.query(SessionBooking).filter(
        SessionBooking.therapist_id == current_user.id
    ).all()
    completed = [b for b in all_bookings if b.status == 'completed']

    def earning(b):
        e = getattr(b, 'therapist_earning', None)
        if e is not None:
            return float(e)
        return float(b.amount or 0) * 0.85

    total_earnings = sum(earning(b) for b in completed)

    reviews = db.query(Review).filter(Review.therapist_id == current_user.id).all()
    avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0
    completion_rate = (len(completed) / len(all_bookings) * 100) if all_bookings else 0

    return {
        "total_sessions": len(all_bookings),
        "completed_sessions": len(completed),
        "total_earnings": round(total_earnings, 2),
        "review_count": len(reviews),
        "average_rating": round(avg_rating, 1),
        "completion_rate": round(completion_rate, 1),
    }

# ============ ADMIN BOOKING MANAGEMENT & REFUNDS ============

@app.get("/admin/bookings")
def get_all_bookings(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    bookings = db.query(SessionBooking).order_by(SessionBooking.scheduled_time.desc()).limit(100).all()
    result = []
    for b in bookings:
        client = get_user_by_id(db, b.client_id)
        therapist = get_user_by_id(db, b.therapist_id)
        result.append({
            "id": b.id,
            "client_name": (client.name or client.email) if client else "Unknown",
            "therapist_name": (therapist.name or therapist.email) if therapist else "Unknown",
            "scheduled_time": b.scheduled_time,
            "amount": b.amount,
            "status": b.status,
            "payment_status": b.payment_status,
        })
    return result


@app.put("/admin/bookings/{booking_id}/refund")
def refund_booking(booking_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    booking = get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = "refunded"
    booking.payment_status = "refunded"
    db.commit()
    db.refresh(booking)
    return {"success": True, "message": "Booking refunded successfully"}
# ============ MAIN ENTRY POINT ============

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")