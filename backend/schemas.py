from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional, List
import re

ALLOWED_USER_TYPES = {"client", "therapist", "admin"}


class UserBase(BaseModel):
    email: EmailStr
    user_type: str
    name: Optional[str] = None

    @validator("user_type")
    def validate_user_type(cls, value):
        if value not in ALLOWED_USER_TYPES:
            raise ValueError("user_type must be either 'client', 'therapist', or 'admin'")
        return value


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

    @validator('name', always=True)
    def therapist_requires_name(cls, value, values):
        if values.get('user_type') == 'therapist' and (not value or not value.strip()):
            raise ValueError('Therapists must provide their professional name')
        return value

    @validator('password')
    def password_strength(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    name: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    # ============ TERMS ACCEPTANCE FIELDS ============
    terms_accepted: bool = False
    terms_accepted_at: Optional[datetime] = None
    # =================================================
    
    # ============ THERAPIST VERIFICATION FIELDS ============
    verification_status: Optional[str] = None
    specializations: Optional[str] = None
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    hourly_rate: Optional[int] = None
    license_number: Optional[str] = None
    languages: Optional[str] = None
    # =======================================================
    profile_photo_url: Optional[str] = None
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: str


class MessageBase(BaseModel):
    room_id: int
    content: str = Field(..., min_length=1, max_length=2000)
    sender_type: str

    @validator("sender_type")
    def validate_sender_type(cls, value):
        if value not in ALLOWED_USER_TYPES:
            raise ValueError("sender_type must be either 'client', 'therapist', or 'admin'")
        return value


class MessageCreate(MessageBase):
    pass


class MessageResponse(MessageBase):
    id: int
    timestamp: datetime
    encrypted: bool

    class Config:
        from_attributes = True


class BookingCreate(BaseModel):
    therapist_id: int
    scheduled_time: datetime
    amount: int

    @validator("therapist_id", "amount")
    def positive_int(cls, value):
        if value <= 0:
            raise ValueError("Value must be greater than zero")
        return value

    @validator("scheduled_time")
    def scheduled_time_in_future(cls, value):
        if value <= datetime.utcnow():
            raise ValueError("scheduled_time must be in the future")
        return value


class PaymentRequest(BaseModel):
    phone: str
    amount: int
    booking_id: int

    @validator("phone")
    def validate_phone(cls, value):
        if not re.fullmatch(r"254[17]\d{8}", value):
            raise ValueError("Phone number must be in the format 2547XXXXXXXX or 2541XXXXXXXX")
        return value

    @validator("amount")
    def amount_positive(cls, value):
        if value <= 0:
            raise ValueError("Amount must be greater than zero")
        return value


class PaymentResponse(BaseModel):
    success: bool
    transaction_id: Optional[str]
    message: str


# ============ WAVE 2: MOOD TRACKER SCHEMAS ============
class MoodEntryCreate(BaseModel):
    mood_score: str  # "excellent", "good", "neutral", "low", "very_low"
    note: Optional[str] = None


class MoodEntryResponse(BaseModel):
    id: int
    mood_score: str
    note: Optional[str]
    entry_date: datetime

    class Config:
        from_attributes = True


# ============ REVIEWS SCHEMAS ============
class ReviewCreate(BaseModel):
    therapist_id: int
    booking_id: int
    rating: int = Field(..., ge=1, le=5)  # Must be 1-5
    comment: Optional[str] = None

    @validator('therapist_id', 'booking_id')
    def positive_int(cls, value):
        if value <= 0:
            raise ValueError("Value must be greater than zero")
        return value


class ReviewResponse(BaseModel):
    id: int
    client_id: int
    therapist_id: int
    booking_id: Optional[int]
    rating: int
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ============ NOTIFICATIONS SCHEMAS ============
class NotificationResponse(BaseModel):
    id: int
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ ADMIN SCHEMAS ============
class AdminUserResponse(BaseModel):
    id: int
    email: EmailStr
    user_type: str
    name: Optional[str]
    is_active: bool
    terms_accepted: bool
    terms_accepted_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class AdminStatsResponse(BaseModel):
    total_users: int
    total_clients: int
    total_therapists: int
    total_bookings: int
    completed_bookings: int
    pending_bookings: int
    total_revenue: int
    total_platform_revenue: int      # ← Your 15% earnings
    total_therapist_payouts: int     # ← What therapists earned
    total_reviews: int
    average_rating: float
    total_messages: int
    total_mood_entries: int


# ============ THERAPIST REGISTRATION SCHEMAS ============
class TherapistProfileUpdate(BaseModel):
    specializations: Optional[str] = None
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    hourly_rate: Optional[int] = None
    license_number: Optional[str] = None
    languages: Optional[str] = None


class TherapistVerificationResponse(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    user_type: str
    verification_status: str
    profile_photo_url: Optional[str] = None   # ← SAME indent
    specializations: Optional[str] = None
    experience_years: Optional[int] = None
    hourly_rate: Optional[float] = None
    license_number: Optional[str] = None
    languages: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============ AI CHAT HISTORY SCHEMAS ============
class AiChatHistoryResponse(BaseModel):
    id: int
    user_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

        

# ============ RAGE ROOM SCHEMAS ============
class RageRoomPackageCreate(BaseModel):
    tier: str
    name: str
    description: Optional[str] = None
    duration_minutes: int = 30
    price: int
    student_price: Optional[int] = None


class RageRoomPackageResponse(RageRoomPackageCreate):
    id: int
    rage_room_id: int

    class Config:
        from_attributes = True


class RageRoomCreate(BaseModel):
    name: str
    location: str
    description: Optional[str] = None
    available_days: str
    available_hours: str


class RageRoomResponse(BaseModel):
    id: int
    name: str
    location: str
    description: Optional[str] = None
    available_days: str
    available_hours: str
    is_active: bool
    created_at: datetime
    packages: List[RageRoomPackageResponse] = []

    class Config:
        from_attributes = True


class RageRoomBookingCreate(BaseModel):
    rage_room_id: int
    package_id: int
    scheduled_time: datetime
    use_student_rate: bool = False

    

# ============ UNIVERSITY SCHEMAS ============
class UniversityCreate(BaseModel):
    name: str
    email_domain: str
    subscription_tier: str = "starter"
    rage_room_credit_pool: int = 0


class UniversityResponse(BaseModel):
    id: int
    name: str
    email_domain: str
    subscription_tier: str
    rage_room_credit_pool: int
    is_active: bool

    class Config:
        from_attributes = True


class StudentSignupRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    university_id: int