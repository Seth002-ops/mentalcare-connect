import csv
import io
import json
import logging
import os
import re
import secrets
import shutil
import smtplib
from collections import defaultdict
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from time import time

import uvicorn
from dotenv import load_dotenv
from fastapi import (
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    Request,
    UploadFile,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse, Response
from fastapi.staticfiles import StaticFiles
from jose import jwt
from jose.exceptions import JWTError
from openai import AsyncOpenAI
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import func, inspect, text

load_dotenv()

from database import Base, SessionLocal, engine, get_db
from models import (
    AiChatMessage,
    EmailVerificationToken,
    MoodEntry,
    PlatformWithdrawal,
    RageRoom,
    RageRoomBooking,
    RageRoomPackage,
    Review,
    SessionBooking,
    SessionNote,
    TherapistAvailability,
    University,
    User,
)
from sanitize import sanitize_text

# Optional models. If these do not exist yet, the app will still import.
try:
    from models import Notification
except ImportError:
    Notification = None

try:
    from models import Wallet
except ImportError:
    Wallet = None

from auth import create_access_token, get_current_user
from config import settings
from crud import (
    add_to_wallet,
    authenticate_user,
    create_booking,
    create_message,
    create_notification,
    create_review,
    create_user,
    create_withdrawal,
    deduct_from_wallet,
    get_admin_stats,
    get_ai_chat_history,
    get_all_users,
    get_all_withdrawals,
    get_booking_by_id,
    get_bookings_for_user,
    get_messages_by_room,
    get_or_create_wallet,
    get_recent_moods,
    get_review_by_booking,
    get_reviews_for_therapist,
    get_unread_count,
    get_user_by_email,
    get_user_by_id,
    get_user_notifications,
    get_user_withdrawals,
    log_mood_entry,
    mark_all_notifications_read,
    mark_notification_read,
    save_ai_message,
    simulate_payment,
    toggle_user_active,
    update_withdrawal_status,
)
from schemas import (
    AdminStatsResponse,
    AdminUserResponse,
    AiChatHistoryResponse,
    BookingCreate,
    MessageCreate,
    MessageResponse,
    MoodEntryCreate,
    MoodEntryResponse,
    NotificationResponse,
    PaymentRequest,
    ReviewCreate,
    ReviewResponse,
    SessionNoteCreate,
    SessionNoteResponse,
    StudentSignupRequest,
    TherapistProfileUpdate,
    TherapistVerificationResponse,
    UniversityCreate,
    UniversityResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)

# =========================
# BASIC CONFIG
# =========================

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_ROOT = os.path.join(BASE_DIR, "uploads")
LICENSE_DIR = os.path.join(UPLOAD_ROOT, "licenses")
PROFILE_DIR = os.path.join(UPLOAD_ROOT, "profiles")
ROOM_IMAGE_DIR = os.path.join(UPLOAD_ROOT, "rooms")

for directory in [UPLOAD_ROOT, LICENSE_DIR, PROFILE_DIR, ROOM_IMAGE_DIR]:
    os.makedirs(directory, exist_ok=True)

FEATURE_FLAGS = getattr(settings, "FEATURE_FLAGS", {}) or {}


def is_feature_enabled(feature_name: str) -> bool:
    return bool(FEATURE_FLAGS.get(feature_name, False))


def safe_sanitize(value: str | None) -> str:
    """
    Sanitize text safely.
    Prevents crashes when value is None.
    """
    if value is None:
        return ""
    try:
        return sanitize_text(str(value))
    except Exception:
        return str(value)


def get_display_name(user: User | None) -> str:
    if not user:
        return "Unknown"
    return user.name or user.email or "Unknown"


def set_if_exists(obj, attr: str, value):
    """
    Safely set an attribute only if the SQLAlchemy model has it.
    """
    if obj is None:
        return
    if hasattr(obj, attr):
        try:
            setattr(obj, attr, value)
        except Exception as exc:
            logger.debug(
                "set_if_exists failed for %s.%s: %s", type(obj).__name__, attr, exc
            )


def get_table_columns(model) -> set:
    try:
        return {column.name for column in model.__table__.columns}
    except Exception:
        return set()


def create_with_columns(model, data: dict):
    """
    Create a model instance using only columns that actually exist.
    Helps avoid errors when models are still evolving.
    """
    cols = get_table_columns(model)
    filtered = {}

    for key, value in data.items():
        if key in cols:
            filtered[key] = value

    # Common alias support
    if "client_id" in data and "client_id" not in cols and "user_id" in cols:
        filtered["user_id"] = data["client_id"]

    if "rage_room_id" in data and "rage_room_id" not in cols and "room_id" in cols:
        filtered["room_id"] = data["rage_room_id"]

    return model(**filtered)


def add_column_if_missing(table_name: str, column_name: str, column_type: str):
    """
    Lightweight SQLite migration helper.
    This does not replace Alembic, but helps during MVP development.
    """
    try:
        insp = inspect(engine)
        if table_name not in insp.get_table_names():
            return

        existing_columns = [col["name"] for col in insp.get_columns(table_name)]

        if column_name not in existing_columns:
            with engine.begin() as conn:
                conn.execute(
                    text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}")
                )
            print(f"Added column {column_name} to table {table_name}")
    except Exception as exc:
        print(f"Migration check failed for {table_name}.{column_name}: {exc}")


def ensure_schema():
    """
    Add commonly needed optional columns for MVP features.
    """
    add_column_if_missing("rage_rooms", "image_url", "TEXT")
    add_column_if_missing("session_bookings", "video_room_id", "TEXT")
    add_column_if_missing("rage_room_packages", "student_price", "FLOAT")

    add_column_if_missing("rage_room_bookings", "signer_name", "TEXT")
    add_column_if_missing("rage_room_bookings", "signer_id_number", "TEXT")
    add_column_if_missing("rage_room_bookings", "is_student_rate", "BOOLEAN DEFAULT 0")
    add_column_if_missing("rage_room_bookings", "waiver_signed_at", "DATETIME")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    Base.metadata.create_all(bind=engine)

    # Lightweight development migrations
    ensure_schema()

    yield


# =========================
# FASTAPI APP
# =========================

app = FastAPI(
    title=getattr(settings, "PROJECT_NAME", "Mecac API"),
    lifespan=lifespan,
    # Docs are disabled by default (security tests require this).
    # Set DEBUG=true in the environment to enable locally.
    docs_url="/docs" if getattr(settings, "DEBUG", False) else None,
    redoc_url="/redoc" if getattr(settings, "DEBUG", False) else None,
    openapi_url="/openapi.json" if getattr(settings, "DEBUG", False) else None,
)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory=UPLOAD_ROOT), name="uploads")


# =========================
# CORS
# =========================

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "https://mecac-backend.onrender.com",
    "https://mentalcare-connect.vercel.app",
    "https://mentalcare-connect-gold.vercel.app",
    "https://mentalcare-connect-zdfn.vercel.app",
    "https://mentalcare-connect-zdfn-git-master-seth002-ops-projects.vercel.app",
    "https://mentalcare-connect-zdfn-rbx5v7aq5-seth002-ops-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# =========================
# RATE LIMITING
# =========================

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# =========================
# LOGIN LOCKOUT
# =========================

login_attempts = defaultdict(list)
MAX_ATTEMPTS = 5
LOCKOUT_DURATION = 300


def check_login_lockout(ip: str) -> bool:
    now = time()
    login_attempts[ip] = [
        (timestamp, attempts)
        for timestamp, attempts in login_attempts[ip]
        if now - timestamp < LOCKOUT_DURATION
    ]
    total_attempts = sum(attempts for _, attempts in login_attempts[ip])
    return total_attempts >= MAX_ATTEMPTS


def record_failed_attempt(ip: str):
    login_attempts[ip].append((time(), 1))


def clear_attempts(ip: str):
    login_attempts[ip] = []


# =========================
# SECURITY MIDDLEWARE
# =========================

STATIC_PUBLIC_PREFIXES = (
    "/uploads/",
    "/static/",
    "/.well-known/",
    "/ws",
)


def is_public_path(path: str, method: str) -> bool:
    """
    Paths that do not require JWT authentication.
    """
    if method == "OPTIONS":
        return True

    if path in {
        "/",
        "/api/health",
        "/favicon.ico",
        "/docs",
        "/openapi.json",
        "/redoc",
        "/uploads",
    }:
        return True

    if path.startswith("/auth/"):
        return True

    if path.startswith(STATIC_PUBLIC_PREFIXES):
        return True

    # Public rage room listing
    if path == "/rage-rooms" and method == "GET":
        return True

    # Public therapist reviews
    if path.startswith("/reviews/therapist/") and method == "GET":
        return True

    # Public university list for student signup
    return path == "/universities" and method == "GET"


def set_security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("X-XSS-Protection", "1; mode=block")
    response.headers.setdefault("Content-Security-Policy", "frame-ancestors 'none';")
    response.headers.setdefault(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains",
    )
    return response


@app.middleware("http")
async def auth_and_security_middleware(request: Request, call_next):
    """
    Central authentication guard + security headers.
    CORS preflight requests are allowed through.
    """
    path = request.url.path
    method = request.method

    if not is_public_path(path, method):
        auth_header = request.headers.get("authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Authentication required"},
            )

        token = auth_header.split(" ", 1)[1]

        try:
            jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM],
            )
        except JWTError:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or expired token"},
            )

    response = await call_next(request)
    return set_security_headers(response)


# =========================
# WEBSOCKET MANAGER
# =========================

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: int):
        await websocket.accept()
        self.active_connections.setdefault(room_id, []).append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: int):
        if room_id in self.active_connections:
            self.active_connections[room_id] = [
                connection
                for connection in self.active_connections[room_id]
                if connection != websocket
            ]
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast_to_room(self, room_id: int, message: str, sender: WebSocket):
        for connection in self.active_connections.get(room_id, []):
            if connection != sender:
                try:
                    await connection.send_text(message)
                except Exception as exc:
                    logger.debug("Websocket send failed: %s", exc)


manager = ConnectionManager()


# =========================
# AI CLIENT
# =========================

client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)


# =========================
# CRISIS DETECTION
# =========================

CRISIS_KEYWORDS = [
    "suicide",
    "kill myself",
    "end my life",
    "self harm",
    "self-harm",
    "hurt myself",
    "don't want to live",
    "want to die",
    "no reason to live",
    "better off dead",
    "can't go on",
    "end it all",
    "take my own life",
]

KENYA_CRISIS_RESOURCES = """I'm really concerned about what you're sharing, and I want you to know you're not alone. Please reach out for immediate help:

Kenya Crisis Lines:
- Befrienders Kenya: 0722 178 177
- Kenya Red Cross: 1199
- National Emergency: 999 / 112

You deserve support right now. Please call one of these numbers, or reach out to someone you trust. Your life matters."""


def detect_crisis(message: str) -> bool:
    message_lower = str(message or "").lower()
    return any(keyword in message_lower for keyword in CRISIS_KEYWORDS)


# =========================
# HELPERS
# =========================

def serialize_wallet(wallet) -> dict:
    if not wallet:
        return {
            "balance": 0,
            "total_earned": 0,
            "total_withdrawn": 0,
            "available_balance": 0,
        }

    balance = float(getattr(wallet, "balance", 0) or 0)
    total_earned = float(getattr(wallet, "total_earned", 0) or 0)
    total_withdrawn = float(getattr(wallet, "total_withdrawn", 0) or 0)

    return {
        "balance": balance,
        "total_earned": total_earned,
        "total_withdrawn": total_withdrawn,
        "available_balance": balance,
    }


def serialize_withdrawal(withdrawal) -> dict:
    return {
        "id": getattr(withdrawal, "id", None),
        "therapist_id": getattr(withdrawal, "therapist_id", getattr(withdrawal, "user_id", None)),
        "amount": float(getattr(withdrawal, "amount", 0) or 0),
        "mpesa_phone": getattr(withdrawal, "mpesa_phone", getattr(withdrawal, "phone", None)),
        "status": getattr(withdrawal, "status", "pending"),
        "reference_code": getattr(withdrawal, "reference_code", None),
        "created_at": getattr(withdrawal, "created_at", None),
        "processed_at": getattr(withdrawal, "processed_at", None),
    }


def serialize_university_row(db, university) -> dict:
    student_count = 0
    try:
        student_count = (
            db.query(User)
            .filter(
                User.university_id == university.id,
                User.is_verified_student == True,
            )
            .count()
        )
    except Exception:
        student_count = 0

    return {
        "id": university.id,
        "name": university.name,
        "email_domain": university.email_domain,
        "subscription_tier": getattr(university, "subscription_tier", None),
        "is_active": bool(getattr(university, "is_active", True)),
        "student_count": student_count,
        "created_at": getattr(university, "created_at", None),
    }


def get_rage_room_owner_column():
    cols = get_table_columns(RageRoomBooking)
    if "client_id" in cols:
        return "client_id"
    if "user_id" in cols:
        return "user_id"
    return None


# =========================
# LOCAL PYDANTIC MODELS
# =========================

class AIMessage(BaseModel):
    role: str
    content: str


class AIChatRequest(BaseModel):
    messages: list[AIMessage]


class SOAPRequest(BaseModel):
    booking_id: int
    rough_notes: str = ""


class PackageIn(BaseModel):
    name: str
    description: str = ""
    duration_minutes: int = 30
    price: float = 0
    student_price: float | None = None
    tier: str = "standard"


class RageRoomBookRequest(BaseModel):
    rage_room_id: int
    package_id: int
    scheduled_time: datetime
    use_student_rate: bool = False
    signer_name: str
    signer_id_number: str


# =========================
# ROOT / HEALTH
# =========================

@app.get("/")
def read_root():
    return {
        "message": "Mecac API",
        "status": "healthy",
        "features": [
            "JWT authentication",
            "Secure chat",
            "Therapist booking",
            "M-Pesa payment simulation",
            "AI support companion",
            "Rage rooms",
            "University student pricing",
        ],
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Backend is connected"}


# =========================
# AUTH ROUTES
# =========================

@app.post("/auth/register")
@limiter.limit("3/minute")
def register(request: Request, user: UserCreate, db=Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_data = user.dict()

    # Security: prevent public registration as admin
    if user_data.get("user_type") == "admin":
        user_data["user_type"] = "client"

    # Only allow client or therapist through public registration
    if user_data.get("user_type") not in ["client", "therapist"]:
        user_data["user_type"] = "client"

    # Therapists start incomplete until profile/license is submitted
    if user_data.get("user_type") == "therapist":
        user_data["verification_status"] = "incomplete"

    created_user = create_user(db, user_data)

    access_token = create_access_token(
        data={
            "user_id": created_user.id,
            "user_type": created_user.user_type,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": created_user.user_type,
    }


@app.post("/auth/login")
@limiter.limit("5/minute")
def login(request: Request, user_login: UserLogin, db=Depends(get_db)):
    client_ip = get_remote_address(request)

    if check_login_lockout(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Too many failed attempts. Please try again in 5 minutes.",
        )

    user = authenticate_user(db, user_login.email, user_login.password)

    if not user:
        record_failed_attempt(client_ip)
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    clear_attempts(client_ip)

    access_token = create_access_token(
        data={
            "user_id": user.id,
            "user_type": user.user_type,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": user.user_type,
    }


@app.post("/auth/student-signup")
def student_signup(student: StudentSignupRequest, db=Depends(get_db)):
    email_domain = student.email.split("@")[-1].lower()

    university = (
        db.query(University)
        .filter(
            University.email_domain == email_domain,
            University.is_active == True,
        )
        .first()
    )

    if not university:
        raise HTTPException(
            status_code=400,
            detail="Your university is not registered or not active. Please use your personal email to sign up.",
        )

    existing_user = get_user_by_email(db, student.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_data = {
        "email": student.email,
        "password": student.password,
        "name": student.name,
        "user_type": "client",
        "university_id": university.id,
        "is_verified_student": False,
        "terms_accepted": False,
    }

    new_user = create_user(db, user_data)

    token = secrets.token_urlsafe(32)

    verification_token = EmailVerificationToken(
        user_id=new_user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=24),
    )
    db.add(verification_token)
    db.commit()

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    verify_link = f"{frontend_url}/verify-email?token={token}"

    try:
        email_user = os.getenv("EMAIL_USER", "")
        email_password = os.getenv("EMAIL_PASSWORD", "")

        if email_user and email_password:
            msg = MIMEMultipart()
            msg["From"] = email_user
            msg["To"] = student.email
            msg["Subject"] = "Verify Your Student Email - Mecac"

            body = f"""
Hello {student.name},

Thank you for signing up for Mecac with your {university.name} email.

Please click the link below to verify your student status and unlock special pricing:

{verify_link}

This link expires in 24 hours.

Best regards,
The Mecac Team
"""

            msg.attach(MIMEText(body, "plain"))

            server = smtplib.SMTP("smtp.gmail.com", 587)
            server.starttls()
            server.login(email_user, email_password)
            server.send_message(msg)
            server.quit()
    except Exception as exc:
        print(f"Failed to send verification email: {exc}")

    access_token = create_access_token(
        data={
            "user_id": new_user.id,
            "user_type": new_user.user_type,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": new_user.user_type,
    }


@app.get("/auth/verify-email")
def verify_email(token: str, db=Depends(get_db)):
    verification = (
        db.query(EmailVerificationToken)
        .filter(
            EmailVerificationToken.token == token,
            EmailVerificationToken.is_used == False,
        )
        .first()
    )

    if not verification or verification.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    user = get_user_by_id(db, verification.user_id)

    if user:
        set_if_exists(user, "is_verified_student", True)
        set_if_exists(verification, "is_used", True)
        db.commit()

    return {
        "success": True,
        "message": "Email verified! You now have access to student pricing.",
    }


# =========================
# USER ROUTES
# =========================

@app.get("/users/me", response_model=UserResponse)
def get_current_user_profile(db=Depends(get_db), current_user=Depends(get_current_user)):
    return current_user


@app.get("/users/me/student-status")
def get_student_status(db=Depends(get_db), current_user=Depends(get_current_user)):
    return {
        "is_verified_student": bool(getattr(current_user, "is_verified_student", False)),
        "university_id": getattr(current_user, "university_id", None),
    }


@app.post("/terms/accept")
def accept_terms(db=Depends(get_db), current_user=Depends(get_current_user)):
    set_if_exists(current_user, "terms_accepted", True)
    set_if_exists(current_user, "terms_accepted_at", datetime.utcnow())
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Terms accepted successfully",
        "terms_accepted": bool(getattr(current_user, "terms_accepted", False)),
        "terms_accepted_at": getattr(current_user, "terms_accepted_at", None),
    }


@app.get("/users", response_model=list[UserResponse])
def list_users(
    user_type: str | None = None,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.user_type != "admin" and user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only admins may list users")

    query = db.query(User)

    if user_type:
        query = query.filter(User.user_type == user_type)

    if user_type == "therapist":
        query = query.filter(User.verification_status == "approved")

    return query.all()


@app.get("/users/{user_id}", response_model=UserResponse)
def read_user(
    user_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    user = get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    is_self = current_user.id == user_id
    is_admin = current_user.user_type == "admin"
    is_public_therapist = (
        user.user_type == "therapist"
        and getattr(user, "verification_status", None) == "approved"
    )

    if not (is_self or is_admin or is_public_therapist):
        raise HTTPException(status_code=403, detail="Not allowed to view this profile")

    return user


# =========================
# UNIVERSITIES
# =========================

@app.get("/universities")
def list_public_universities(db=Depends(get_db)):
    universities = db.query(University).filter(University.is_active == True).all()

    return [
        {
            "id": university.id,
            "name": university.name,
            "email_domain": university.email_domain,
        }
        for university in universities
    ]


# =========================
# THERAPIST ROUTES
# =========================

@app.post("/therapist/upload-license")
def upload_license(
    file: UploadFile = File(...),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can upload licenses")

    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF, JPG, and PNG files are allowed")

    if not file.filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    file_extension = file.filename.rsplit(".", 1)[-1].lower()
    allowed_extensions = ["pdf", "jpg", "jpeg", "png"]

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File extension .{file_extension} not allowed",
        )

    safe_filename = f"license_{current_user.id}_{int(datetime.now().timestamp())}.{file_extension}"
    physical_path = os.path.join(LICENSE_DIR, safe_filename)
    relative_path = os.path.relpath(physical_path, BASE_DIR).replace("\\", "/")

    with open(physical_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    set_if_exists(current_user, "license_document_path", relative_path)

    if getattr(current_user, "verification_status", None) == "incomplete":
        set_if_exists(current_user, "verification_status", "pending")

    db.commit()
    db.refresh(current_user)

    return {
        "message": "License uploaded! Your profile is now pending admin approval.",
        "file_path": relative_path,
        "verification_status": getattr(current_user, "verification_status", "pending"),
    }


@app.post("/therapist/profile-photo")
def upload_profile_photo(
    file: UploadFile = File(...),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can upload profile photos")

    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WEBP images are allowed")

    if not file.filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    file_extension = file.filename.rsplit(".", 1)[-1].lower()
    allowed_extensions = ["jpg", "jpeg", "png", "webp"]

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File extension .{file_extension} not allowed",
        )

    contents = file.file.read()

    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")

    safe_filename = f"profile_{current_user.id}_{int(datetime.now().timestamp())}.{file_extension}"
    physical_path = os.path.join(PROFILE_DIR, safe_filename)
    relative_path = os.path.relpath(physical_path, BASE_DIR).replace("\\", "/")
    photo_url = f"/{relative_path}"

    with open(physical_path, "wb") as f:
        f.write(contents)

    old_url = getattr(current_user, "profile_photo_url", None)

    if old_url and old_url.startswith("/uploads/"):
        old_relative = old_url.lstrip("/")
        old_physical = os.path.join(BASE_DIR, old_relative)

        if os.path.exists(old_physical):
            try:
                os.remove(old_physical)
            except Exception as exc:
                logger.debug(
                    "Failed to remove old profile photo %s: %s", old_physical, exc
                )

    set_if_exists(current_user, "profile_photo_url", photo_url)
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
    current_user=Depends(get_current_user),
):
    if current_user.user_type != "therapist":
        raise HTTPException(
            status_code=403,
            detail="Only therapists can update therapist profile",
        )

    for field, value in profile.dict(exclude_unset=True).items():
        set_if_exists(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return current_user


@app.get("/therapist/status", response_model=TherapistVerificationResponse)
def get_therapist_status(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can view this")

    return current_user


@app.get("/therapist/earnings")
def therapist_earnings(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can view earnings")

    wallet = get_or_create_wallet(db, current_user.id)
    withdrawals = get_user_withdrawals(db, current_user.id)

    total_withdrawn = 0.0

    for withdrawal in withdrawals:
        status = getattr(withdrawal, "status", "pending")
        if status in ["completed", "paid", "processed"]:
            total_withdrawn += float(getattr(withdrawal, "amount", 0) or 0)

    serialized_wallet = serialize_wallet(wallet)
    serialized_wallet["total_withdrawn"] = total_withdrawn

    return serialized_wallet


@app.get("/therapist/withdrawals")
def therapist_withdrawals(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can view withdrawals")

    withdrawals = get_user_withdrawals(db, current_user.id)
    return [serialize_withdrawal(w) for w in withdrawals]


@app.post("/therapist/withdraw")
def therapist_withdraw(
    amount: float,
    mpesa_phone: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can withdraw earnings")

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")

    if amount < 500:
        raise HTTPException(status_code=400, detail="Minimum withdrawal is KSh 500")

    if not mpesa_phone:
        raise HTTPException(status_code=400, detail="M-Pesa phone number is required")

    wallet = get_or_create_wallet(db, current_user.id)
    balance = float(getattr(wallet, "balance", 0) or 0)

    if amount > balance:
        raise HTTPException(status_code=400, detail="Amount exceeds available balance")

    withdrawal = create_withdrawal(db, current_user.id, amount, mpesa_phone)
    deduct_from_wallet(db, current_user.id, amount)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to process withdrawal")

    create_notification(
        db,
        user_id=current_user.id,
        message=f"Withdrawal request of KSh {amount} submitted to {mpesa_phone}.",
        type="withdrawal",
    )

    return {
        "message": "Withdrawal request submitted.",
        "withdrawal_id": getattr(withdrawal, "id", None),
        "amount": amount,
        "mpesa_phone": mpesa_phone,
    }


# =========================
# THERAPIST AVAILABILITY
# =========================

# 30-minute booking grid used to generate slots from availability windows.
SLOT_GRID_MINUTES = 30
TIME_RE = re.compile(r"^([01]\d|2[0-3]):([0-5]\d)$")


def _parse_hhmm(value: str) -> int:
    """Convert 'HH:MM' to minutes since midnight. Raises ValueError if invalid."""
    match = TIME_RE.match(str(value or "").strip())
    if not match:
        raise ValueError(f"Invalid time format: {value!r}. Expected HH:MM.")
    return int(match.group(1)) * 60 + int(match.group(2))


def _minutes_to_hhmm(minutes: int) -> str:
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


class AvailabilitySlotIn(BaseModel):
    day_of_week: int  # 0 = Monday ... 6 = Sunday
    start_time: str  # "HH:MM"
    end_time: str  # "HH:MM"
    is_available: bool = True


@app.get("/therapist/availability")
def get_availability(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can view availability")

    rows = (
        db.query(TherapistAvailability)
        .filter(TherapistAvailability.therapist_id == current_user.id)
        .order_by(TherapistAvailability.day_of_week.asc(), TherapistAvailability.start_time.asc())
        .all()
    )

    return [
        {
            "id": row.id,
            "day_of_week": row.day_of_week,
            "start_time": row.start_time,
            "end_time": row.end_time,
            "is_available": bool(getattr(row, "is_available", True)),
        }
        for row in rows
    ]


@app.post("/therapist/availability")
def save_availability(
    slots: list[AvailabilitySlotIn],
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Replace the therapist's full weekly schedule with the submitted slots."""
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can set availability")

    # Validate before touching the database so nothing is saved on a bad payload.
    for slot in slots:
        if not 0 <= slot.day_of_week <= 6:
            raise HTTPException(status_code=400, detail="day_of_week must be 0 (Monday) to 6 (Sunday)")
        try:
            start = _parse_hhmm(slot.start_time)
            end = _parse_hhmm(slot.end_time)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        if end <= start:
            raise HTTPException(
                status_code=400,
                detail=f"End time must be after start time ({slot.start_time} - {slot.end_time})",
            )

    db.query(TherapistAvailability).filter(
        TherapistAvailability.therapist_id == current_user.id
    ).delete()

    for slot in slots:
        db.add(
            TherapistAvailability(
                therapist_id=current_user.id,
                day_of_week=slot.day_of_week,
                start_time=slot.start_time,
                end_time=slot.end_time,
                is_available=True,
            )
        )

    db.commit()

    return {
        "message": "Schedule saved successfully!",
        "slots_saved": len(slots),
    }


@app.get("/therapist/stats")
def therapist_stats(db=Depends(get_db), current_user=Depends(get_current_user)):
    """Aggregate stats for the therapist dashboard cards."""
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can view stats")

    bookings = (
        db.query(SessionBooking)
        .filter(SessionBooking.therapist_id == current_user.id)
        .all()
    )

    total_sessions = len(bookings)
    completed_sessions = sum(1 for b in bookings if b.status == "completed")

    wallet = get_or_create_wallet(db, current_user.id)
    total_earnings = float(getattr(wallet, "total_earned", 0) or 0)

    avg_rating = 0.0
    review_count = 0
    try:
        avg_rating, review_count = (
            db.query(func.coalesce(func.avg(Review.rating), 0.0), func.count(Review.id))
            .filter(Review.therapist_id == current_user.id)
            .one()
        )
        avg_rating = float(avg_rating or 0)
        review_count = int(review_count or 0)
    except Exception as exc:
        logger.debug("Failed to compute rating stats: %s", exc)

    completion_rate = round((completed_sessions / total_sessions) * 100) if total_sessions else 0

    return {
        "average_rating": round(avg_rating, 1),
        "review_count": review_count,
        "total_earnings": total_earnings,
        "completed_sessions": completed_sessions,
        "total_sessions": total_sessions,
        "completion_rate": completion_rate,
    }


@app.get("/therapist/{therapist_id}/available-slots")
def get_available_slots(
    therapist_id: int,
    date: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Public-to-authenticated listing of bookable 30-minute slots for a
    therapist on a given date (YYYY-MM-DD), based on their weekly schedule.
    Already-booked times are excluded.
    """
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="date must be YYYY-MM-DD")

    therapist = get_user_by_id(db, therapist_id)
    if not therapist or therapist.user_type != "therapist":
        raise HTTPException(status_code=404, detail="Therapist not found")

    # JS day-of-week: 0=Sunday ... 6=Saturday. Schedule uses 0=Monday ... 6=Sunday.
    js_dow = (target_date.weekday() + 1) % 7
    schedule_dow = (js_dow - 1) % 7

    windows = (
        db.query(TherapistAvailability)
        .filter(
            TherapistAvailability.therapist_id == therapist_id,
            TherapistAvailability.day_of_week == schedule_dow,
            TherapistAvailability.is_available == True,
        )
        .all()
    )

    # 30-minute grid across the availability windows; last slot must END by window close.
    slot_set: set[str] = set()
    for window in windows:
        start = _parse_hhmm(window.start_time)
        end = _parse_hhmm(window.end_time)
        t = start
        while t + SLOT_GRID_MINUTES <= end:
            slot_set.add(_minutes_to_hhmm(t))
            t += SLOT_GRID_MINUTES

    # Exclude slots already taken by non-cancelled bookings on that date.
    day_start = datetime(target_date.year, target_date.month, target_date.day)
    day_end = day_start + timedelta(days=1)
    taken = (
        db.query(SessionBooking)
        .filter(
            SessionBooking.therapist_id == therapist_id,
            SessionBooking.scheduled_time >= day_start,
            SessionBooking.scheduled_time < day_end,
            SessionBooking.status != "cancelled",
        )
        .all()
    )
    for booking in taken:
        booked_hhmm = booking.scheduled_time.strftime("%H:%M")
        slot_set.discard(booked_hhmm)

    return {
        "date": date,
        "therapist_id": therapist_id,
        "available_slots": sorted(slot_set),
    }


# =========================
# MESSAGE ROUTES
# =========================

@app.post("/messages", response_model=MessageResponse)
def create_chat_message(
    message: MessageCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    booking = get_booking_by_id(db, message.room_id)

    if not booking or current_user.id not in {booking.client_id, booking.therapist_id}:
        raise HTTPException(status_code=403, detail="Unauthorized to post in this room")

    if message.sender_type != current_user.user_type:
        raise HTTPException(status_code=400, detail="sender_type must match authenticated user")

    clean_content = safe_sanitize(message.content)
    message.content = clean_content

    db_message = create_message(db, message.dict())

    return {
        "id": db_message.id,
        "room_id": db_message.room_id,
        "content": clean_content,
        "sender_type": db_message.sender_type,
        "timestamp": db_message.timestamp,
        "encrypted": True,
    }


@app.get("/messages/{room_id}", response_model=list[MessageResponse])
def read_messages(
    room_id: int,
    skip: int = 0,
    limit: int = 100,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    limit = min(max(limit, 1), 100)
    skip = max(skip, 0)

    booking = get_booking_by_id(db, room_id)

    if not booking or current_user.id not in {booking.client_id, booking.therapist_id}:
        raise HTTPException(status_code=403, detail="Unauthorized to access this room")

    return get_messages_by_room(db, room_id, skip=skip, limit=limit)


# =========================
# BOOKING ROUTES
# =========================

DEFAULT_SESSION_FEE = 1500


@app.post("/bookings")
def create_session_booking(
    booking: BookingCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Only clients may book sessions")

    therapist = get_user_by_id(db, booking.therapist_id)

    if not therapist or therapist.user_type != "therapist":
        raise HTTPException(status_code=404, detail="Therapist not found")

    if getattr(therapist, "verification_status", None) != "approved":
        raise HTTPException(status_code=400, detail="This therapist is not yet approved")

    booking_data = booking.dict()
    booking_data["client_id"] = current_user.id
    booking_data["payment_status"] = "pending"
    booking_data["amount"] = (
        getattr(therapist, "session_rate", None)
        or getattr(therapist, "hourly_rate", None)
        or DEFAULT_SESSION_FEE
    )

    db_booking = create_booking(db, booking_data)

    client_name = get_display_name(current_user)

    try:
        time_label = booking.scheduled_time.strftime("%B %d at %I:%M %p")
    except Exception:
        time_label = str(booking.scheduled_time)

    create_notification(
        db,
        user_id=booking.therapist_id,
        message=f"New booking from {client_name} on {time_label}",
        type="booking",
    )

    return {
        "booking_id": db_booking.id,
        "status": "confirmed",
    }


@app.get("/bookings/me")
def get_my_bookings(db=Depends(get_db), current_user=Depends(get_current_user)):
    bookings = get_bookings_for_user(db, current_user.id)

    result = []

    for booking in bookings:
        client = get_user_by_id(db, booking.client_id)
        therapist = get_user_by_id(db, booking.therapist_id)

        result.append(
            {
                "id": booking.id,
                "client_id": booking.client_id,
                "therapist_id": booking.therapist_id,
                "scheduled_time": booking.scheduled_time,
                "status": booking.status,
                "amount": booking.amount,
                "payment_status": booking.payment_status,
                "platform_fee": getattr(booking, "platform_fee", 0),
                "therapist_earning": getattr(booking, "therapist_earning", 0),
                "client_name": get_display_name(client),
                "therapist_name": get_display_name(therapist),
            }
        )

    return result


@app.get("/bookings/{booking_id}")
def read_booking(
    booking_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    booking = get_booking_by_id(db, booking_id)

    if not booking or current_user.id not in {booking.client_id, booking.therapist_id}:
        raise HTTPException(status_code=404, detail="Booking not found")

    client = get_user_by_id(db, booking.client_id)
    therapist = get_user_by_id(db, booking.therapist_id)

    return {
        "id": booking.id,
        "client_id": booking.client_id,
        "therapist_id": booking.therapist_id,
        "scheduled_time": booking.scheduled_time,
        "status": booking.status,
        "amount": booking.amount,
        "payment_status": booking.payment_status,
        "platform_fee": getattr(booking, "platform_fee", 0),
        "therapist_earning": getattr(booking, "therapist_earning", 0),
        "client_name": get_display_name(client),
        "therapist_name": get_display_name(therapist),
    }


@app.get("/bookings/{booking_id}/video-room")
def get_video_room(
    booking_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    booking = get_booking_by_id(db, booking_id)

    if not booking or current_user.id not in {booking.client_id, booking.therapist_id}:
        raise HTTPException(status_code=404, detail="Booking not found")

    room_id = getattr(booking, "video_room_id", None)

    if not room_id:
        room_id = f"mecac-session-{secrets.token_urlsafe(8)}"
        set_if_exists(booking, "video_room_id", room_id)
        db.commit()
        db.refresh(booking)

    return {
        "room_id": room_id,
        "booking_id": booking.id,
    }


# =========================
# PAYMENT ROUTES
# =========================

PLATFORM_COMMISSION_RATE = 0.15


@app.post("/payments/simulate")
def process_payment(
    payment: PaymentRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not is_feature_enabled("payments_enabled"):
        raise HTTPException(
            status_code=503,
            detail="Payments are temporarily unavailable. Sessions are currently free and sponsored.",
        )

    booking = get_booking_by_id(db, payment.booking_id)

    if not booking or booking.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized booking payment")

    amount = float(getattr(booking, "amount", 0) or 0)
    result = simulate_payment(payment.phone, amount)

    if result.get("success"):
        set_if_exists(booking, "payment_status", "completed")

        platform_fee = int(amount * PLATFORM_COMMISSION_RATE)
        therapist_earning = amount - platform_fee

        set_if_exists(booking, "platform_fee", platform_fee)
        set_if_exists(booking, "therapist_earning", therapist_earning)

        add_to_wallet(db, booking.therapist_id, therapist_earning)

        db.commit()

        create_notification(
            db,
            user_id=current_user.id,
            message=f"Payment of KSh {amount} confirmed. Your session is booked!",
            type="payment",
        )

        create_notification(
            db,
            user_id=booking.therapist_id,
            message=f"Payment received! KSh {therapist_earning} has been added to your earnings.",
            type="payment",
        )

    return result


# =========================
# MOOD ROUTES
# =========================

@app.get("/mood/entries", response_model=list[MoodEntryResponse])
def get_my_moods(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Only clients can track moods")

    return get_recent_moods(db, current_user.id)


@app.post("/mood/log", response_model=MoodEntryResponse)
def log_mood(
    mood: MoodEntryCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Only clients can track moods")

    new_entry = log_mood_entry(db, current_user.id, mood.dict())
    return new_entry


class MoodLogSimple(BaseModel):
    mood: str
    note: str | None = None


# Aliased mood endpoints used by the client dashboard.
@app.get("/moods/today")
def get_mood_today(db=Depends(get_db), current_user=Depends(get_current_user)):
    start_of_today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    entry = (
        db.query(MoodEntry)
        .filter(
            MoodEntry.client_id == current_user.id,
            MoodEntry.entry_date >= start_of_today,
        )
        .order_by(MoodEntry.entry_date.desc())
        .first()
    )

    if not entry:
        return {"logged": False, "mood": None}

    return {
        "logged": True,
        "mood": entry.mood_score,
        "note": entry.note,
        "entry_date": entry.entry_date,
    }


@app.get("/moods/week")
def get_mood_week(db=Depends(get_db), current_user=Depends(get_current_user)):
    week_ago = (datetime.utcnow() - timedelta(days=6)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )

    entries = (
        db.query(MoodEntry)
        .filter(
            MoodEntry.client_id == current_user.id,
            MoodEntry.entry_date >= week_ago,
        )
        .order_by(MoodEntry.entry_date.asc())
        .all()
    )

    return [
        {
            "date": entry.entry_date.date().isoformat() if entry.entry_date else None,
            "mood": entry.mood_score,
            "note": entry.note,
        }
        for entry in entries
        if entry.entry_date
    ]


@app.post("/moods")
def log_mood_simple(
    payload: MoodLogSimple,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Only clients can track moods")

    clean_note = safe_sanitize(payload.note) if payload.note else None

    new_entry = log_mood_entry(
        db,
        current_user.id,
        {"mood_score": payload.mood, "note": clean_note},
    )

    return {
        "logged": True,
        "mood": new_entry.mood_score,
        "note": new_entry.note,
        "entry_date": new_entry.entry_date,
    }


# =========================
# WEBSOCKET ROUTES
# =========================

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
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
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


# =========================
# REVIEW ROUTES
# =========================

@app.post("/reviews", response_model=ReviewResponse)
def submit_review(
    review: ReviewCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Only clients can submit reviews")

    review.comment = safe_sanitize(review.comment)

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


@app.get("/reviews/therapist/{therapist_id}", response_model=list[ReviewResponse])
def get_therapist_reviews(therapist_id: int, db=Depends(get_db)):
    return get_reviews_for_therapist(db, therapist_id)


@app.get("/reviews/me", response_model=list[ReviewResponse])
def get_my_reviews(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Only clients have reviews")

    return (
        db.query(Review)
        .filter(Review.client_id == current_user.id)
        .order_by(Review.created_at.desc())
        .all()
    )


# =========================
# NOTIFICATION ROUTES
# =========================

@app.get("/notifications/me", response_model=list[NotificationResponse])
def get_my_notifications(db=Depends(get_db), current_user=Depends(get_current_user)):
    return get_user_notifications(db, current_user.id)


@app.get("/notifications/unread-count")
def get_my_unread_count(db=Depends(get_db), current_user=Depends(get_current_user)):
    count = get_unread_count(db, current_user.id)
    return {"count": count}


@app.put("/notifications/{notification_id}/read")
def read_notification(
    notification_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
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


# =========================
# ADMIN ROUTES
# =========================

def require_admin(current_user=Depends(get_current_user)):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@app.get("/admin/stats", response_model=AdminStatsResponse)
def admin_get_stats(db=Depends(get_db), admin=Depends(require_admin)):
    return get_admin_stats(db)


@app.get("/admin/analytics/timeseries")
def get_admin_analytics(
    days: int = 30,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    days = max(1, min(days, 365))
    start_date = datetime.utcnow() - timedelta(days=days)

    revenue_query = (
        db.query(
            func.date(SessionBooking.scheduled_time).label("date"),
            func.sum(SessionBooking.amount).label("revenue"),
            func.count(SessionBooking.id).label("bookings"),
        )
        .filter(
            SessionBooking.status == "completed",
            SessionBooking.scheduled_time >= start_date,
        )
        .group_by(func.date(SessionBooking.scheduled_time))
        .all()
    )

    revenue_dict = {
        str(row.date): {
            "revenue": float(row.revenue or 0),
            "bookings": int(row.bookings or 0),
        }
        for row in revenue_query
    }

    users_query = (
        db.query(
            func.date(User.created_at).label("date"),
            func.count(User.id).label("count"),
        )
        .filter(User.created_at >= start_date)
        .group_by(func.date(User.created_at))
        .all()
    )

    users_dict = {str(row.date): int(row.count or 0) for row in users_query}

    rage_query = (
        db.query(
            func.date(RageRoomBooking.scheduled_time).label("date"),
            func.count(RageRoomBooking.id).label("count"),
            func.sum(RageRoomBooking.amount).label("revenue"),
        )
        .filter(
            RageRoomBooking.scheduled_time >= start_date,
            RageRoomBooking.payment_status == "completed",
        )
        .group_by(func.date(RageRoomBooking.scheduled_time))
        .all()
    )

    rage_dict = {
        str(row.date): {
            "count": int(row.count or 0),
            "revenue": float(row.revenue or 0),
        }
        for row in rage_query
    }

    timeline = []

    for i in range(days):
        current_date = (datetime.utcnow() - timedelta(days=days - 1 - i)).date()
        date_str = current_date.isoformat()

        revenue_data = revenue_dict.get(date_str, {"revenue": 0, "bookings": 0})
        rage_data = rage_dict.get(date_str, {"count": 0, "revenue": 0})

        timeline.append(
            {
                "date": date_str,
                "revenue": revenue_data["revenue"],
                "bookings": revenue_data["bookings"],
                "new_users": users_dict.get(date_str, 0),
                "rage_bookings": rage_data["count"],
                "rage_revenue": rage_data["revenue"],
            }
        )

    return timeline


@app.get("/admin/users", response_model=list[AdminUserResponse])
def admin_list_users(
    user_type: str | None = None,
    search: str | None = None,
    db=Depends(get_db),
    admin=Depends(require_admin),
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
        "is_active": user.is_active,
    }


@app.get("/admin/export/users")
def admin_export_users(db=Depends(get_db), admin=Depends(require_admin)):
    users = get_all_users(db)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Email", "Name", "Type", "Active", "Terms Accepted", "Created At"])

    for user in users:
        writer.writerow(
            [
                user.id,
                user.email,
                user.name or "N/A",
                user.user_type,
                "Yes" if user.is_active else "No",
                "Yes" if getattr(user, "terms_accepted", False) else "No",
                user.created_at.strftime("%Y-%m-%d %H:%M:%S") if user.created_at else "N/A",
            ]
        )

    output.seek(0)

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=users_export.csv"},
    )


@app.put("/admin/therapists/{user_id}/approve")
def admin_approve_therapist(user_id: int, db=Depends(get_db), admin=Depends(require_admin)):
    user = get_user_by_id(db, user_id)

    if not user or user.user_type != "therapist":
        raise HTTPException(status_code=404, detail="Therapist not found")

    set_if_exists(user, "verification_status", "approved")
    db.commit()
    db.refresh(user)

    create_notification(
        db,
        user_id=user.id,
        message="Your therapist account has been approved! You can now accept clients.",
        type="system",
    )

    return {
        "message": "Therapist approved",
        "user_id": user.id,
    }


@app.put("/admin/therapists/{user_id}/reject")
def admin_reject_therapist(user_id: int, db=Depends(get_db), admin=Depends(require_admin)):
    user = get_user_by_id(db, user_id)

    if not user or user.user_type != "therapist":
        raise HTTPException(status_code=404, detail="Therapist not found")

    set_if_exists(user, "verification_status", "rejected")
    db.commit()
    db.refresh(user)

    create_notification(
        db,
        user_id=user.id,
        message="Your therapist application has been rejected. Please contact support.",
        type="system",
    )

    return {
        "message": "Therapist rejected",
        "user_id": user.id,
    }


@app.get("/admin/therapists/pending", response_model=list[TherapistVerificationResponse])
def admin_get_pending_therapists(db=Depends(get_db), admin=Depends(require_admin)):
    return (
        db.query(User)
        .filter(
            User.user_type == "therapist",
            User.verification_status == "pending",
        )
        .order_by(User.created_at.desc())
        .all()
    )


@app.get("/admin/bookings")
def admin_get_all_bookings(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    bookings = (
        db.query(SessionBooking)
        .order_by(SessionBooking.scheduled_time.desc())
        .limit(100)
        .all()
    )

    result = []

    for booking in bookings:
        client = get_user_by_id(db, booking.client_id)
        therapist = get_user_by_id(db, booking.therapist_id)

        result.append(
            {
                "id": booking.id,
                "client_name": get_display_name(client),
                "therapist_name": get_display_name(therapist),
                "scheduled_time": booking.scheduled_time,
                "amount": booking.amount,
                "status": booking.status,
                "payment_status": booking.payment_status,
            }
        )

    return result


@app.put("/admin/bookings/{booking_id}/refund")
def refund_booking(
    booking_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    booking = get_booking_by_id(db, booking_id)

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    set_if_exists(booking, "status", "refunded")
    set_if_exists(booking, "payment_status", "refunded")
    db.commit()
    db.refresh(booking)

    return {
        "success": True,
        "message": "Booking refunded successfully",
    }


@app.post("/admin/withdraw-platform-earnings")
def admin_withdraw_earnings(
    amount: int,
    destination: str,
    account_details: str,
    db=Depends(get_db),
    admin=Depends(require_admin),
):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")

    withdrawal = PlatformWithdrawal(
        amount=amount,
        destination=destination,
        account_details=account_details,
        status="pending",
        requested_by=admin.id,
    )

    db.add(withdrawal)
    db.commit()

    return {
        "message": f"Withdrawal request of KSh {amount} submitted successfully",
        "withdrawal_id": withdrawal.id,
    }


@app.get("/admin/withdrawals")
def admin_list_withdrawals(db=Depends(get_db), admin=Depends(require_admin)):
    withdrawals = get_all_withdrawals(db)
    return [serialize_withdrawal(w) for w in withdrawals]


@app.put("/admin/withdrawals/{withdrawal_id}/status")
def admin_update_withdrawal_status(
    withdrawal_id: int,
    status: str,
    db=Depends(get_db),
    admin=Depends(require_admin),
):
    withdrawal = update_withdrawal_status(db, withdrawal_id, status)

    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")

    return serialize_withdrawal(withdrawal)


# =========================
# RAGE ROOM ROUTES
# =========================

@app.get("/rage-rooms")
def list_rage_rooms(db=Depends(get_db)):
    rooms = db.query(RageRoom).filter(RageRoom.is_active == True).all()
    result = []

    for room in rooms:
        packages = (
            db.query(RageRoomPackage)
            .filter(RageRoomPackage.rage_room_id == room.id)
            .all()
        )

        result.append(
            {
                "id": room.id,
                "name": room.name,
                "location": room.location,
                "description": room.description,
                "capacity": getattr(room, "capacity", None),
                "price_per_hour": getattr(room, "price_per_hour", None),
                "available_days": room.available_days,
                "available_hours": room.available_hours,
                "image_url": getattr(room, "image_url", None),
                "packages": [
                    {
                        "id": package.id,
                        "name": package.name,
                        "description": package.description,
                        "duration_minutes": package.duration_minutes,
                        "price": package.price,
                        "student_price": getattr(package, "student_price", None),
                        "tier": getattr(package, "tier", "standard"),
                    }
                    for package in packages
                ],
            }
        )

    return result


@app.post("/rage-rooms")
def create_rage_room(
    name: str = Form(...),
    location: str = Form(...),
    description: str = Form(""),
    capacity: int = Form(4),
    price_per_hour: float = Form(0),
    available_days: str = Form("Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday"),
    available_hours: str = Form("9:00 AM - 9:00 PM"),
    image: UploadFile = File(None),
    db=Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    image_url = None

    if image and image.filename:
        contents = image.file.read()

        if len(contents) > 2 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Image too large. Maximum size is 2MB.")

        file_extension = image.filename.rsplit(".", 1)[-1].lower() if "." in image.filename else "jpg"
        allowed_extensions = ["jpg", "jpeg", "png", "webp"]

        if file_extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Only JPG, PNG, WEBP images are allowed")

        safe_filename = f"room_{int(datetime.now().timestamp())}.{file_extension}"
        physical_path = os.path.join(ROOM_IMAGE_DIR, safe_filename)
        relative_path = os.path.relpath(physical_path, BASE_DIR).replace("\\", "/")
        image_url = f"/{relative_path}"

        with open(physical_path, "wb") as f:
            f.write(contents)

    room_data = {
        "name": name,
        "location": location,
        "description": description,
        "capacity": capacity,
        "price_per_hour": price_per_hour,
        "available_days": available_days,
        "available_hours": available_hours,
        "is_active": True,
        "owner_id": current_user.id,
    }

    room = create_with_columns(RageRoom, room_data)

    if image_url:
        set_if_exists(room, "image_url", image_url)

    db.add(room)
    db.commit()
    db.refresh(room)

    return {
        "id": room.id,
        "message": "Rage room registered",
        "image_url": getattr(room, "image_url", image_url),
    }


@app.post("/rage-rooms/{room_id}/packages")
def add_rage_room_package(
    room_id: int,
    pkg: PackageIn,
    db=Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    room = db.query(RageRoom).filter(RageRoom.id == room_id).first()

    if not room:
        raise HTTPException(status_code=404, detail="Rage room not found")

    package_data = {
        "rage_room_id": room_id,
        "name": pkg.name,
        "description": pkg.description,
        "duration_minutes": pkg.duration_minutes,
        "price": pkg.price,
        "student_price": pkg.student_price,
        "tier": pkg.tier,
    }

    package = create_with_columns(RageRoomPackage, package_data)

    db.add(package)
    db.commit()
    db.refresh(package)

    return {
        "message": "Package added",
        "package_id": package.id,
    }


@app.post("/rage-rooms/book")
def book_rage_room(
    payload: RageRoomBookRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    room = (
        db.query(RageRoom)
        .filter(
            RageRoom.id == payload.rage_room_id,
            RageRoom.is_active == True,
        )
        .first()
    )

    if not room:
        raise HTTPException(status_code=404, detail="Rage room not found")

    package = (
        db.query(RageRoomPackage)
        .filter(
            RageRoomPackage.id == payload.package_id,
            RageRoomPackage.rage_room_id == room.id,
        )
        .first()
    )

    if not package:
        raise HTTPException(status_code=404, detail="Rage room package not found")

    amount = float(getattr(package, "price", 0) or 0)
    is_student_rate = False

    student_price = getattr(package, "student_price", None)

    if (
        payload.use_student_rate
        and getattr(current_user, "is_verified_student", False)
        and student_price is not None
    ):
        amount = float(student_price)
        is_student_rate = True

    booking_data = {
        "client_id": current_user.id,
        "rage_room_id": room.id,
        "package_id": package.id,
        "scheduled_time": payload.scheduled_time,
        "amount": amount,
        "payment_status": "pending",
        "status": "pending",
        "is_student_rate": is_student_rate,
        "signer_name": safe_sanitize(payload.signer_name),
        "signer_id_number": safe_sanitize(payload.signer_id_number),
        "waiver_signed_at": datetime.utcnow(),
    }

    booking = create_with_columns(RageRoomBooking, booking_data)

    db.add(booking)
    db.commit()
    db.refresh(booking)

    create_notification(
        db,
        user_id=current_user.id,
        message=f"Rage room booking created for {room.name}. Complete payment to confirm.",
        type="rage_room",
    )

    return {
        "booking_id": booking.id,
        "amount": amount,
        "status": "pending",
        "message": "Booking created. Proceed to payment.",
    }


@app.post("/rage-rooms/pay")
def pay_rage_room_booking(
    booking_id: int,
    phone: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    owner_column = get_rage_room_owner_column()

    if not owner_column:
        raise HTTPException(status_code=500, detail="RageRoomBooking model is missing owner column")

    booking = (
        db.query(RageRoomBooking)
        .filter(
            RageRoomBooking.id == booking_id,
            getattr(RageRoomBooking, owner_column) == current_user.id,
        )
        .first()
    )

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    payment_status = getattr(booking, "payment_status", "pending")

    if payment_status == "completed":
        return {
            "success": True,
            "message": "Payment already completed.",
        }

    amount = float(getattr(booking, "amount", 0) or 0)

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid booking amount")

    result = simulate_payment(phone, amount)

    if result.get("success"):
        set_if_exists(booking, "payment_status", "completed")
        set_if_exists(booking, "status", "confirmed")
        db.commit()

        create_notification(
            db,
            user_id=current_user.id,
            message=f"Rage room payment of KSh {amount} confirmed.",
            type="rage_room",
        )

    return result


@app.get("/rage-rooms/bookings/me")
def my_rage_room_bookings(db=Depends(get_db), current_user=Depends(get_current_user)):
    owner_column = get_rage_room_owner_column()

    if not owner_column:
        return []

    bookings = (
        db.query(RageRoomBooking)
        .filter(getattr(RageRoomBooking, owner_column) == current_user.id)
        .order_by(RageRoomBooking.id.desc())
        .all()
    )

    result = []

    for booking in bookings:
        package_id = getattr(booking, "package_id", None)
        room_id = getattr(booking, "rage_room_id", getattr(booking, "room_id", None))

        package = db.get(RageRoomPackage, package_id) if package_id else None
        room = db.get(RageRoom, room_id) if room_id else None

        result.append(
            {
                "id": booking.id,
                "package_name": getattr(package, "name", "Rage Room Package") if package else "Rage Room Package",
                "room_name": getattr(room, "name", "Rage Room") if room else "Rage Room",
                "scheduled_time": getattr(booking, "scheduled_time", None),
                "amount": float(getattr(booking, "amount", 0) or 0),
                "payment_status": getattr(booking, "payment_status", "pending"),
                "status": getattr(booking, "status", "pending"),
                "is_student_rate": bool(getattr(booking, "is_student_rate", False)),
            }
        )

    return result


# =========================
# AI ROUTES
# =========================

MECAC_SYSTEM_PROMPT = """You are a compassionate AI mental health support companion for Mecac, a professional mental health platform.

Your Core Rules:
1. NEVER output raw JSON, curly brackets {}, or code blocks. Just output plain text.
2. NEVER provide clinical diagnoses or replace professional therapy.
3. If someone expresses thoughts of self-harm, immediately provide crisis resources (Befrienders Kenya: 0722 178 177).
4. Remind users that you are an AI support tool, not a replacement for their therapist.

Formatting and Style Rules (CRITICAL):
- Keep responses SHORT and concise (max 3-4 short sentences or a brief list).
- Use bold text to emphasize key actions, important words, or steps.
- Use bullet points (-) for lists instead of numbered lists when possible.
- Always use Kenyan English spelling and cultural references.
- Be warm, empathetic, and conversational. Never robotic or clinical.
- End with a gentle question or encouragement to keep the conversation going."""


async def generate_ai_response(messages: list[dict]):
    try:
        stream = await client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=messages,
            max_tokens=400,
            temperature=0.7,
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    except Exception as exc:
        yield f"Error: {exc!s}"


@app.post("/ai/chat")
@limiter.limit("10/minute")
async def ai_chat(
    request: Request,
    chat_request: AIChatRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_message = ""

    if chat_request.messages:
        user_message = safe_sanitize(chat_request.messages[-1].content)

    if detect_crisis(user_message):
        return {
            "message": KENYA_CRISIS_RESOURCES,
            "response": KENYA_CRISIS_RESOURCES,
            "crisis_detection": True,
        }

    raw_history = get_ai_chat_history(db, current_user.id, limit=10)

    # Assuming get_ai_chat_history returns newest first.
    # Reverse to get chronological order.
    history_asc = list(reversed(raw_history)) if raw_history else []
    context_messages = [
        {"role": message.role, "content": message.content}
        for message in history_asc[-10:]
    ]

    messages = [
        {"role": "system", "content": MECAC_SYSTEM_PROMPT},
        *context_messages,
        {"role": "user", "content": user_message},
    ]

    full_response = ""

    async for chunk in generate_ai_response(messages):
        full_response += chunk

    save_ai_message(db, current_user.id, "user", user_message)
    save_ai_message(db, current_user.id, "assistant", full_response)

    return {
        "message": full_response,
        "response": full_response,
        "crisis_detection": False,
    }


@app.get("/ai/history", response_model=list[AiChatHistoryResponse])
def get_chat_history(db=Depends(get_db), current_user=Depends(get_current_user)):
    history = get_ai_chat_history(db, current_user.id, limit=20)
    return list(reversed(history))


@app.delete("/ai/history")
def clear_chat_history(db=Depends(get_db), current_user=Depends(get_current_user)):
    messages = (
        db.query(AiChatMessage)
        .filter(AiChatMessage.user_id == current_user.id)
        .all()
    )

    for message in messages:
        db.delete(message)

    db.commit()

    return {"message": "Chat history cleared"}


@app.post("/ai/therapist/soap")
async def generate_soap_note(
    req: SOAPRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    AI Agent: Drafts a SOAP note based on chat history and rough notes.
    """
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can use the AI agent")

    booking = get_booking_by_id(db, req.booking_id)

    if not booking or booking.therapist_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized booking")

    messages = get_messages_by_room(db, req.booking_id, skip=0, limit=100)
    chat_transcript = "\n".join(
        [f"{message.sender_type}: {message.content}" for message in messages]
    )

    rough_notes = safe_sanitize(req.rough_notes)

    if not chat_transcript and not rough_notes:
        raise HTTPException(status_code=400, detail="No chat history or rough notes to analyze.")

    prompt = f"""
You are an expert clinical AI assistant drafting a SOAP note for a licensed therapist in Kenya.
Based on the chat transcript and the therapist's rough notes, draft a professional SOAP note.
Use objective, clinical language. Do not provide a definitive medical diagnosis if uncertain.

Therapist's rough notes: {rough_notes or "None provided"}

Chat Transcript:
{chat_transcript}

Output ONLY valid JSON with these exact keys:
{{
  "subjective": "What the client reported, felt, or expressed.",
  "objective": "Observable facts, therapist's observations, and chat context.",
  "assessment": "Clinical impression, progress evaluation, or formulation.",
  "plan": "Next steps, homework, coping strategies, or follow-up plan."
}}
"""

    try:
        response = await client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=800,
            response_format={"type": "json_object"},
        )

        raw_text = response.choices[0].message.content

        if not raw_text or raw_text.strip() == "":
            raise ValueError("Model returned empty response")

        soap_data = json.loads(raw_text)
        return soap_data

    except Exception as exc:
        print(f"AI SOAP Generation Error: {exc}")

        return {
            "subjective": "Client presented for session.",
            "objective": "Session conducted via chat platform.",
            "assessment": "Progress ongoing.",
            "plan": "Continue current treatment plan.",
        }


@app.get("/ai/client/insights")
async def get_client_mood_insights(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Only clients can access mood insights")

    if not is_feature_enabled("ai_mood_insights"):
        raise HTTPException(status_code=503, detail="AI mood insights are currently unavailable")

    week_ago = datetime.utcnow() - timedelta(days=7)

    moods = (
        db.query(MoodEntry)
        .filter(
            MoodEntry.client_id == current_user.id,
            MoodEntry.entry_date >= week_ago,
        )
        .order_by(MoodEntry.entry_date.asc())
        .all()
    )

    if not moods:
        return {
            "has_data": False,
            "summary": "You haven't logged any moods this week yet. Start tracking to get personalized insights!",
            "should_talk_to_therapist": False,
            "reason": "",
            "suggestion": "",
            "mood_data": [],
        }

    mood_list = [
        {
            "date": mood.entry_date.strftime("%A"),
            "score": mood.mood_score,
            "note": safe_sanitize(mood.note),
        }
        for mood in moods
    ]

    prompt = f"""You are an AI assistant that analyzes mood data and outputs STRICT JSON.

Mood Data:
{mood_list}

Analyze the data and return a JSON object with these exact keys:
- "summary": A 2-sentence warm summary of their emotional week.
- "should_talk_to_therapist": A boolean (true or false) indicating if they should talk to a professional.
- "reason": A brief reason for the boolean above.
- "suggestion": One gentle, actionable self-care tip.

IMPORTANT: Output ONLY the raw JSON object. Do not include markdown, do not include explanations.
Example:
{{"summary": "You had a mixed week.", "should_talk_to_therapist": false, "reason": "Your mood is generally stable.", "suggestion": "Try a 10-minute daily walk."}}
"""

    try:
        response = await client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that only outputs valid JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=400,
            response_format={"type": "json_object"},
        )

        raw_text = response.choices[0].message.content

        if not raw_text or raw_text.strip() == "":
            raise ValueError("Model returned empty response")

        insight = json.loads(raw_text)

        return {
            "has_data": True,
            "summary": insight.get("summary", "You've been tracking your moods this week. Keep it up!"),
            "should_talk_to_therapist": bool(insight.get("should_talk_to_therapist", False)),
            "reason": insight.get("reason", ""),
            "suggestion": insight.get("suggestion", "Take a few minutes to relax today."),
            "mood_data": mood_list,
        }

    except Exception as exc:
        print(f"AI Mood Insights Error: {exc}")

        return {
            "has_data": True,
            "summary": "We noticed you've been tracking your moods this week. Thank you for checking in with yourself!",
            "should_talk_to_therapist": False,
            "reason": "Keep logging your moods to get more personalized AI insights.",
            "suggestion": "Try to take 5 minutes today for a short walk or deep breathing.",
            "mood_data": mood_list,
        }


@app.get("/ai/client/recommend-therapist")
def recommend_therapist(db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Only clients can get therapist recommendations")

    if not is_feature_enabled("smart_booking"):
        raise HTTPException(status_code=503, detail="Smart booking is currently unavailable")

    therapists = (
        db.query(User)
        .filter(
            User.user_type == "therapist",
            User.verification_status == "approved",
            User.is_active == True,
        )
        .limit(10)
        .all()
    )

    if not therapists:
        return {
            "therapist": None,
            "message": "No therapists are currently available. Please check back soon.",
        }

    best_match = None

    if getattr(current_user, "is_verified_student", False) and getattr(current_user, "university_id", None):
        university_therapist = (
            db.query(User)
            .filter(
                User.user_type == "therapist",
                User.verification_status == "approved",
                User.is_active == True,
                User.university_id == current_user.university_id,
            )
            .first()
        )

        if university_therapist:
            best_match = university_therapist

    if not best_match:
        best_match = therapists[0]

    return {
        "therapist": {
            "id": best_match.id,
            "name": best_match.name,
            "profile_photo_url": getattr(best_match, "profile_photo_url", None),
            "specialty": getattr(best_match, "specialty", "General Counselling"),
            "rating": getattr(best_match, "rating", 4.5),
        },
        "message": f"Based on your needs, I recommend {best_match.name}. They specialize in supporting clients with stress and emotional wellbeing.",
    }


@app.post("/bookings/one-click")
def one_click_booking(
    therapist_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Only clients can book sessions")

    if not is_feature_enabled("sponsored_sessions"):
        raise HTTPException(status_code=503, detail="Sponsored sessions are currently unavailable")

    therapist = get_user_by_id(db, therapist_id)

    if not therapist or therapist.user_type != "therapist":
        raise HTTPException(status_code=404, detail="Therapist not found")

    if getattr(therapist, "verification_status", None) != "approved":
        raise HTTPException(status_code=400, detail="This therapist is not yet approved")

    scheduled_time = datetime.utcnow() + timedelta(days=1)

    booking_data = {
        "client_id": current_user.id,
        "therapist_id": therapist_id,
        "scheduled_time": scheduled_time,
        "amount": 0,
        "payment_status": "sponsored",
        "status": "confirmed",
        "platform_fee": 0,
        "therapist_earning": 0,
    }

    db_booking = create_booking(db, booking_data)

    client_name = get_display_name(current_user)

    create_notification(
        db,
        user_id=therapist_id,
        message=f"New sponsored booking from {client_name}. Session is free for the client (platform-funded).",
        type="booking",
    )

    create_notification(
        db,
        user_id=current_user.id,
        message=f"Your session with {therapist.name} is confirmed for tomorrow. No payment required!",
        type="booking",
    )

    return {
        "booking_id": db_booking.id,
        "status": "confirmed",
        "message": f"Session booked with {therapist.name}! No payment required.",
        "scheduled_time": scheduled_time.isoformat(),
    }


# =========================
# SESSION NOTES
# =========================

@app.post("/bookings/{booking_id}/notes", response_model=SessionNoteResponse)
def create_or_update_session_note(
    booking_id: int,
    note_data: SessionNoteCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can write clinical notes")

    note_data.subjective = safe_sanitize(note_data.subjective)
    note_data.objective = safe_sanitize(note_data.objective)
    note_data.assessment = safe_sanitize(note_data.assessment)
    note_data.plan = safe_sanitize(note_data.plan)
    note_data.private_notes = safe_sanitize(note_data.private_notes)
    note_data.techniques_used = safe_sanitize(note_data.techniques_used)

    booking = get_booking_by_id(db, booking_id)

    if not booking or booking.therapist_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to write notes for this booking")

    existing_note = (
        db.query(SessionNote)
        .filter(SessionNote.booking_id == booking_id)
        .first()
    )

    if existing_note:
        for field, value in note_data.dict(exclude_unset=True).items():
            set_if_exists(existing_note, field, value)

        db.commit()
        db.refresh(existing_note)
        return existing_note

    note_payload = note_data.dict()
    note_payload["booking_id"] = booking_id
    note_payload["therapist_id"] = current_user.id

    new_note = create_with_columns(SessionNote, note_payload)

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note


@app.get("/bookings/{booking_id}/notes", response_model=SessionNoteResponse)
def get_session_note(
    booking_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.user_type != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can view clinical notes")

    booking = get_booking_by_id(db, booking_id)

    if not booking or booking.therapist_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to view notes for this booking")

    note = (
        db.query(SessionNote)
        .filter(SessionNote.booking_id == booking_id)
        .first()
    )

    if not note:
        raise HTTPException(status_code=404, detail="No notes found for this booking")

    return note


# =========================
# ADMIN UNIVERSITY MANAGEMENT
# =========================

def admin_university_list(db):
    universities = db.query(University).all()
    return [serialize_university_row(db, university) for university in universities]


@app.get("/admin/universities")
def admin_list_universities(db=Depends(get_db), admin=Depends(require_admin)):
    return admin_university_list(db)


@app.get("/admin/universities/list")
def admin_list_universities_alias(db=Depends(get_db), admin=Depends(require_admin)):
    return admin_university_list(db)


@app.post("/admin/universities", response_model=UniversityResponse)
def admin_create_university(
    university: UniversityCreate,
    db=Depends(get_db),
    admin=Depends(require_admin),
):
    new_uni = University(**university.dict())
    db.add(new_uni)
    db.commit()
    db.refresh(new_uni)
    return new_uni


@app.put("/admin/universities/{uni_id}/toggle-active")
def admin_toggle_university(
    uni_id: int,
    db=Depends(get_db),
    admin=Depends(require_admin),
):
    university = db.query(University).filter(University.id == uni_id).first()

    if not university:
        raise HTTPException(status_code=404, detail="University not found")

    university.is_active = not getattr(university, "is_active", True)
    db.commit()
    db.refresh(university)

    return {
        "message": f"University {'activated' if university.is_active else 'deactivated'}",
        "is_active": university.is_active,
    }


# =========================
# SECURITY DISCLOSURE
# =========================

@app.get("/.well-known/security.txt")
def security_txt():
    content = """Contact: mailto:admin@mecac.co.ke
Expires: 2026-12-31T23:59:59.000Z
Preferred-Languages: en, sw
Canonical: https://mecac-backend.onrender.com/.well-known/security.txt
Policy: We take security seriously. Please report vulnerabilities responsibly.
"""
    return PlainTextResponse(content=content, media_type="text/plain")


# =========================
# RUN
# =========================

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
    )