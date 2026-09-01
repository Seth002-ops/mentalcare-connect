
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
from sanitize import sanitize_text
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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

# Initialize Groq AI client
client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title=settings.PROJECT_NAME)

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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

# --- SECURITY HEADERS MIDDLEWARE ---
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)

    # Prevent browsers from MIME-sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"

    # Prevent your API from being embedded in iframes (Clickjacking protection)
    response.headers["X-Frame-Options"] = "DENY"

    # Controls referrer information
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    # Basic browser XSS filter for older browsers
    response.headers["X-XSS-Protection"] = "1; mode=block"

    # Content Security Policy for API responses
    response.headers["Content-Security-Policy"] = "frame-ancestors 'none';"

    # HSTS (Forces HTTPS in production, safe to ignore on local HTTP)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response

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
@limiter.limit("3/minute")
def register(request: Request, user: UserCreate, db=Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # SECURITY: Force user_type to "client" - ignore any client-provided value
    user_data = user.dict()
    user_data["user_type"] = "client"  # Always create clients through public registration
    
    created_user = create_user(db, user_data)

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

    # SECURITY: Validate file extension
    if not file.filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    file_extension = file.filename.split(".")[-1].lower()
    allowed_extensions = ["pdf", "jpg", "jpeg", "png"]
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File extension .{file_extension} not allowed")

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

    # SECURITY: Validate file extension
    if not file.filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    file_extension = file.filename.split(".")[-1].lower()
    allowed_extensions = ["jpg", "jpeg", "png", "webp"]
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File extension .{file_extension} not allowed")

    # Limit file size to 5MB
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")

    # Create safe filename
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
    
    # SECURITY: Sanitize message content
    message.content = sanitize_text(message.content)
    
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
    # SECURITY: Bound pagination parameters
    limit = min(max(limit, 1), 100)  # Between 1 and 100
    skip = max(skip, 0)  # No negative skip
    
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
    review.comment = sanitize_text(review.comment)

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
- Use bullet points (-) for lists instead of numbered lists when possible.
- Always use **Kenyan English** spelling and cultural references.
- Be warm, empathetic, and conversational. Never robotic or clinical.
- End with a gentle question or encouragement to keep the conversation going."""


async def generate_ai_response(messages: List[Dict]):
    """Stream AI response from Groq API."""
    try:
        stream = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=400,
            temperature=0.7,
            stream=True
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    except Exception as e:
        yield f"Error: {str(e)}"


@app.post("/ai/chat")
@limiter.limit("10/minute")
async def ai_chat(request: Request, chat_request: AIChatRequest, db=Depends(get_db), current_user=Depends(get_current_user)):
    user_message = chat_request.messages[-1].content if chat_request.messages else ""
    
    # Check for crisis keywords
    if detect_crisis(user_message):
        return {
            "response": KENYA_CRISIS_RESOURCES,
            "crisis_detected": True
        }

    # Get recent conversation history
    history = get_ai_chat_history(db, current_user.id, limit=10)
    history_messages = [
        {"role": msg.role, "content": msg.content}
        for msg in reversed(history[:-1])
    ]

    # Build messages for Groq
    messages = [
        {"role": "system", "content": MECAC_SYSTEM_PROMPT},
        *history_messages,
        {"role": "user", "content": user_message}
    ]

    # Stream the response
    full_response = ""
    async for chunk in generate_ai_response(messages):
        full_response += chunk

    # Save to database
    save_ai_message(db, current_user.id, "user", user_message)
    save_ai_message(db, current_user.id, "assistant", full_response)

    return {"response": full_response, "crisis_detected": False}


@app.get("/ai/history", response_model=List[AiChatHistoryResponse])
def get_chat_history(db=Depends(get_db), current_user=Depends(get_current_user)):
    history = get_ai_chat_history(db, current_user.id, limit=20)
    return list(reversed(history))


@app.delete("/ai/history")
def clear_chat_history(db=Depends(get_db), current_user=Depends(get_current_user)):
    messages = db.query(AiChatMessage).filter(AiChatMessage.user_id == current_user.id).all()
    for msg in messages:
        db.delete(msg)
    db.commit()
    return {"message": "Chat history cleared"}


# ============ SESSION NOTES ROUTES ============

@app.post("/bookings/{booking_id}/notes", response_model=SessionNoteResponse)
def create_or_update_session_note(
    booking_id: int,
    note_data: SessionNoteCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can write clinical notes")

    # SECURITY: Sanitize all note fields
    note_data.subjective = sanitize_text(note_data.subjective)
    note_data.objective = sanitize_text(note_data.objective)
    note_data.assessment = sanitize_text(note_data.assessment)
    note_data.plan = sanitize_text(note_data.plan)
    note_data.private_notes = sanitize_text(note_data.private_notes)
    note_data.techniques_used = sanitize_text(note_data.techniques_used)

    booking = get_booking_by_id(db, booking_id)
    if not booking or booking.therapist_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to write notes for this booking")

    # Check if note already exists
    existing_note = db.query(SessionNote).filter(SessionNote.booking_id == booking_id).first()
    
    if existing_note:
        # Update existing note
        for field, value in note_data.dict(exclude_unset=True).items():
            setattr(existing_note, field, value)
        db.commit()
        db.refresh(existing_note)
        return existing_note
    else:
        # Create new note
        new_note = SessionNote(
            booking_id=booking_id,
            therapist_id=current_user.id,
            **note_data.dict()
        )
        db.add(new_note)
        db.commit()
        db.refresh(new_note)
        return new_note


@app.get("/bookings/{booking_id}/notes", response_model=SessionNoteResponse)
def get_session_note(booking_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can view clinical notes")

    booking = get_booking_by_id(db, booking_id)
    if not booking or booking.therapist_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to view notes for this booking")

    note = db.query(SessionNote).filter(SessionNote.booking_id == booking_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="No notes found for this booking")
    
    return note


# ============ STUDENT SIGNUP & VERIFICATION ============

@app.post("/auth/student-signup", response_model=Token)
def student_signup(student: StudentSignupRequest, db=Depends(get_db)):
    # Check if email domain matches a university
    email_domain = student.email.split("@")[-1].lower()
    university = db.query(University).filter(
        University.email_domain == email_domain,
        University.is_active == True
    ).first()

    if not university:
        raise HTTPException(
            status_code=400,
            detail="Your university is not registered or not active. Please use your personal email to sign up."
        )

    # Check if email already exists
    existing_user = get_user_by_email(db, student.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user with university association
    new_user = User(
        email=student.email,
        hashed_password=student.password,  # Should be hashed in production
        name=student.name,
        user_type="client",
        university_id=university.id,
        is_verified_student=False,
        terms_accepted=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate verification token
    token = secrets.token_urlsafe(32)
    verification_token = EmailVerificationToken(
        user_id=new_user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=24)
    )
    db.add(verification_token)
    db.commit()

    # Send verification email
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    verify_link = f"{frontend_url}/verify-email?token={token}"

    try:
        email_user = os.getenv("EMAIL_USER", "")
        email_password = os.getenv("EMAIL_PASSWORD", "")
        
        if email_user and email_password:
            msg = MIMEMultipart()
            msg['From'] = email_user
            msg['To'] = student.email
            msg['Subject'] = "Verify Your Student Email - Afya Care Connect"
            
            body = f"""
            Hello {student.name},
            
            Thank you for signing up for Afya Care Connect with your {university.name} email!
            
            Please click the link below to verify your student status and unlock special pricing:
            
            {verify_link}
            
            This link expires in 24 hours.
            
            Best regards,
            The Afya Care Connect Team
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(email_user, email_password)
            server.send_message(msg)
            server.quit()
    except Exception as e:
        print(f"Failed to send verification email: {e}")

    access_token = create_access_token(
        data={"user_id": new_user.id, "user_type": new_user.user_type}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": new_user.user_type
    }


@app.get("/auth/verify-email")
def verify_email(token: str, db=Depends(get_db)):
    verification = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.token == token,
        EmailVerificationToken.is_used == False,
    ).first()

    if not verification or verification.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    user = get_user_by_id(db, verification.user_id)
    if user:
        user.is_verified_student = True
        verification.is_used = True
        db.commit()

    return {"success": True, "message": "Email verified! You now have access to student pricing."}


# ============ ADMIN UNIVERSITY MANAGEMENT ============

@app.get("/admin/universities/list")
def admin_list_universities(db=Depends(get_db), admin=Depends(require_admin)):
    universities = db.query(University).all()
    result = []
    for uni in universities:
        student_count = db.query(User).filter(User.university_id == uni.id, User.is_verified_student == True).count()
        result.append({
            "id": uni.id,
            "name": uni.name,
            "email_domain": uni.email_domain,
            "subscription_tier": uni.subscription_tier,
            "is_active": uni.is_active,
            "student_count": student_count,
            "created_at": uni.created_at
        })
    return result


@app.post("/admin/universities", response_model=UniversityResponse)
def admin_create_university(
    university: UniversityCreate,
    db=Depends(get_db),
    admin=Depends(require_admin)
):
    new_uni = University(**university.dict())
    db.add(new_uni)
    db.commit()
    db.refresh(new_uni)
    return new_uni


@app.put("/admin/universities/{uni_id}/toggle-active")
def admin_toggle_university(uni_id: int, db=Depends(get_db), admin=Depends(require_admin)):
    uni = db.query(University).filter(University.id == uni_id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="University not found")
    
    uni.is_active = not uni.is_active
    db.commit()
    db.refresh(uni)
    
    return {
        "message": f"University {'activated' if uni.is_active else 'deactivated'}",
        "is_active": uni.is_active
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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)