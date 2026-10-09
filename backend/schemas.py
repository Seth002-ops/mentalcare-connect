from datetime import datetime

from pydantic import BaseModel, EmailStr

# ============ AUTH & USER SCHEMAS ============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None
    user_type: str = "client" 


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_type: str | None = None


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str | None = None
    user_type: str
    is_active: bool = True
    terms_accepted: bool = False
    created_at: datetime | None = None
    verification_status: str | None = None
    specializations: str | None = None
    bio: str | None = None
    experience_years: int | None = None
    hourly_rate: float | None = None
    license_number: str | None = None
    profile_photo_url: str | None = None
    languages: str | None = None
    rating: float | None = None
    university_id: int | None = None
    is_verified_student: bool | None = None

    class Config:
        from_attributes = True


class AdminUserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str | None = None
    user_type: str
    is_active: bool = True
    terms_accepted: bool = False
    created_at: datetime | None = None
    verification_status: str | None = None
    university_id: int | None = None
    is_verified_student: bool | None = None

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
    name: str | None = None
    university_id: int


# ============ THERAPIST SCHEMAS ============

class TherapistProfileUpdate(BaseModel):
    name: str | None = None
    specializations: str | None = None
    bio: str | None = None
    experience_years: int | None = None
    hourly_rate: float | None = None
    license_number: str | None = None
    languages: str | None = None


class TherapistVerificationResponse(BaseModel):
    id: int
    email: EmailStr
    name: str | None = None
    user_type: str
    verification_status: str | None = None
    specializations: str | None = None
    bio: str | None = None
    experience_years: int | None = None
    hourly_rate: float | None = None
    license_number: str | None = None
    license_document_path: str | None = None
    languages: str | None = None
    profile_photo_url: str | None = None
    created_at: datetime | None = None

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
    timestamp: datetime | None = None
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
    message: str | None = None
    transaction_id: str | None = None
    phone: str | None = None
    amount: float | None = None


# ============ MOOD SCHEMAS ============

class MoodEntryCreate(BaseModel):
    mood_score: str
    note: str | None = ""
    entry_date: str | None = None

    class Config:
        from_attributes = True

class MoodEntryResponse(BaseModel):
    id: int
    client_id: int
    mood_score: str
    note: str | None = None
    entry_date: datetime | None = None

    class Config:
        from_attributes = True
class MoodLogResponse(BaseModel):
    mood: MoodEntryResponse
# ============ REVIEW SCHEMAS ============

class ReviewCreate(BaseModel):
    booking_id: int
    therapist_id: int
    rating: int
    comment: str | None = None


class ReviewResponse(BaseModel):
    id: int
    booking_id: int
    client_id: int | None = None
    therapist_id: int
    rating: int
    comment: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


# ============ NOTIFICATION SCHEMAS ============

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    message: str
    type: str | None = None
    is_read: bool = False
    created_at: datetime | None = None

    class Config:
        from_attributes = True


# ============ AI CHAT SCHEMAS ============

class AiChatHistoryResponse(BaseModel):
    id: int
    user_id: int | None = None
    role: str
    content: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True


# ============ RAGE ROOM SCHEMAS ============

class RageRoomCreate(BaseModel):
    name: str
    location: str | None = None
    description: str | None = None
    available_days: str | None = None
    available_hours: str | None = None
    is_active: bool = True


class RageRoomPackageResponse(BaseModel):
    id: int
    rage_room_id: int | None = None
    name: str
    tier: str | None = None
    price: float
    duration_minutes: int | None = None
    description: str | None = None
    student_price: float | None = None

    class Config:
        from_attributes = True


class RageRoomResponse(BaseModel):
    id: int
    name: str
    location: str | None = None
    description: str | None = None
    available_days: str | None = None
    available_hours: str | None = None
    is_active: bool = True
    created_at: datetime | None = None
    packages: list[RageRoomPackageResponse] = []

    class Config:
        from_attributes = True


class RageRoomPackageCreate(BaseModel):
    name: str
    tier: str | None = None
    price: float
    duration_minutes: int | None = None
    description: str | None = None
    student_price: float | None = None


class RageRoomBookingCreate(BaseModel):
    package_id: int
    rage_room_id: int | None = None
    scheduled_time: datetime
    use_student_rate: bool = False
    signer_name: str | None = None
    signer_id_number: str | None = None


# ============ UNIVERSITY SCHEMAS ============

class UniversityCreate(BaseModel):
    name: str
    email_domain: str
    subscription_tier: str | None = None
    subscription_expires: datetime | None = None
    rage_room_credit_pool: int = 0
    is_active: bool = True


class UniversityResponse(BaseModel):
    id: int
    name: str
    email_domain: str
    subscription_tier: str | None = None
    subscription_expires: datetime | None = None
    rage_room_credit_pool: int = 0
    is_active: bool = True
    created_at: datetime | None = None

    class Config:
        from_attributes = True


# ============ SESSION NOTE SCHEMAS (NEW) ============

class SessionNoteCreate(BaseModel):
    subjective: str | None = None
    objective: str | None = None
    assessment: str | None = None
    plan: str | None = None
    private_notes: str | None = None
    risk_level: str | None = "low"
    follow_up_required: bool | None = False
    treatment_approach: str | None = None
    techniques_used: str | None = None
    


class SessionNoteResponse(BaseModel):
    id: int
    booking_id: int
    therapist_id: int
    client_id: int
    subjective: str | None = None
    objective: str | None = None
    assessment: str | None = None
    plan: str | None = None
    private_notes: str | None = None
    risk_level: str | None = None
    follow_up_required: bool = False
    treatment_approach: str | None = None
    techniques_used: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True