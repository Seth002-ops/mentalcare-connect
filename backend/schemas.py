from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


# ============ AUTH & USER SCHEMAS ============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_type: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    user_type: str
    is_active: bool = True
    terms_accepted: bool = False
    created_at: Optional[datetime] = None
    verification_status: Optional[str] = None
    specializations: Optional[str] = None
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    hourly_rate: Optional[float] = None
    license_number: Optional[str] = None
    profile_photo_url: Optional[str] = None
    languages: Optional[str] = None
    rating: Optional[float] = None
    university_id: Optional[int] = None
    is_verified_student: Optional[bool] = None

    class Config:
        from_attributes = True


class AdminUserResponse(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    user_type: str
    is_active: bool = True
    terms_accepted: bool = False
    created_at: Optional[datetime] = None
    verification_status: Optional[str] = None
    university_id: Optional[int] = None
    is_verified_student: Optional[bool] = None

    class Config:
        from_attributes = True


class AdminStatsResponse(BaseModel):
    total_users: int = 0
    total_clients: int = 0
    total_therapists: int = 0
    total_bookings: int = 0
    total_revenue: float = 0.0


class StudentSignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    university_id: int


# ============ THERAPIST SCHEMAS ============

class TherapistProfileUpdate(BaseModel):
    name: Optional[str] = None
    specializations: Optional[str] = None
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    hourly_rate: Optional[float] = None
    license_number: Optional[str] = None
    languages: Optional[str] = None


class TherapistVerificationResponse(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    user_type: str
    verification_status: Optional[str] = None
    specializations: Optional[str] = None
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    hourly_rate: Optional[float] = None
    license_number: Optional[str] = None
    license_document_path: Optional[str] = None
    languages: Optional[str] = None
    profile_photo_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ MESSAGE SCHEMAS ============

class MessageCreate(BaseModel):
    room_id: int
    content: str
    sender_type: str


class MessageResponse(BaseModel):
    id: int
    room_id: int
    content: str
    sender_type: str
    timestamp: Optional[datetime] = None
    encrypted: bool = False

    class Config:
        from_attributes = True


# ============ BOOKING SCHEMAS ============

class BookingCreate(BaseModel):
    therapist_id: int
    scheduled_time: datetime
    amount: float


class PaymentRequest(BaseModel):
    booking_id: int
    phone: str
    amount: float


class PaymentResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    transaction_id: Optional[str] = None
    phone: Optional[str] = None
    amount: Optional[float] = None


# ============ MOOD SCHEMAS ============

class MoodEntryCreate(BaseModel):
    mood: str
    notes: Optional[str] = None
    intensity: Optional[int] = None


class MoodEntryResponse(BaseModel):
    id: int
    mood: str
    notes: Optional[str] = None
    intensity: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ REVIEW SCHEMAS ============

class ReviewCreate(BaseModel):
    booking_id: int
    therapist_id: int
    rating: int
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    booking_id: int
    client_id: Optional[int] = None
    therapist_id: int
    rating: int
    comment: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ NOTIFICATION SCHEMAS ============

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    message: str
    type: Optional[str] = None
    is_read: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ AI CHAT SCHEMAS ============

class AiChatHistoryResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    role: str
    content: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ RAGE ROOM SCHEMAS ============

class RageRoomCreate(BaseModel):
    name: str
    location: Optional[str] = None
    description: Optional[str] = None
    available_days: Optional[str] = None
    available_hours: Optional[str] = None
    is_active: bool = True


class RageRoomPackageResponse(BaseModel):
    id: int
    rage_room_id: Optional[int] = None
    name: str
    tier: Optional[str] = None
    price: float
    duration_minutes: Optional[int] = None
    description: Optional[str] = None
    student_price: Optional[float] = None

    class Config:
        from_attributes = True


class RageRoomResponse(BaseModel):
    id: int
    name: str
    location: Optional[str] = None
    description: Optional[str] = None
    available_days: Optional[str] = None
    available_hours: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    packages: List[RageRoomPackageResponse] = []

    class Config:
        from_attributes = True


class RageRoomPackageCreate(BaseModel):
    name: str
    tier: Optional[str] = None
    price: float
    duration_minutes: Optional[int] = None
    description: Optional[str] = None
    student_price: Optional[float] = None


class RageRoomBookingCreate(BaseModel):
    package_id: int
    rage_room_id: Optional[int] = None
    scheduled_time: datetime
    use_student_rate: bool = False
    signer_name: Optional[str] = None
    signer_id_number: Optional[str] = None


# ============ UNIVERSITY SCHEMAS ============

class UniversityCreate(BaseModel):
    name: str
    email_domain: str
    subscription_tier: Optional[str] = None
    subscription_expires: Optional[datetime] = None
    rage_room_credit_pool: int = 0
    is_active: bool = True


class UniversityResponse(BaseModel):
    id: int
    name: str
    email_domain: str
    subscription_tier: Optional[str] = None
    subscription_expires: Optional[datetime] = None
    rage_room_credit_pool: int = 0
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ SESSION NOTE SCHEMAS (NEW) ============

class SessionNoteCreate(BaseModel):
    subjective: Optional[str] = None
    objective: Optional[str] = None
    assessment: Optional[str] = None
    plan: Optional[str] = None
    private_notes: Optional[str] = None
    risk_level: Optional[str] = "low"
    follow_up_required: Optional[bool] = False
    treatment_approach: Optional[str] = None
    techniques_used: Optional[str] = None
    


class SessionNoteResponse(BaseModel):
    id: int
    booking_id: int
    therapist_id: int
    client_id: int
    subjective: Optional[str] = None
    objective: Optional[str] = None
    assessment: Optional[str] = None
    plan: Optional[str] = None
    private_notes: Optional[str] = None
    risk_level: Optional[str] = None
    follow_up_required: bool = False
    treatment_approach: Optional[str] = None
    techniques_used: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True