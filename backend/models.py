from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.sql import func
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    user_type = Column(String, nullable=False)
    name = Column(String, nullable=True)
    terms_accepted = Column(Boolean, default=False)
    terms_accepted_at = Column(DateTime(timezone=True), nullable=True)
    verification_status = Column(String, default="incomplete")
    specializations = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    experience_years = Column(Integer, nullable=True)
    hourly_rate = Column(Integer, nullable=True)
    license_number = Column(String, nullable=True)
    license_document_path = Column(String, nullable=True)
    profile_photo_url = Column(String, nullable=True, default=None)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=True)
    is_verified_student = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, index=True, nullable=False)
    sender_type = Column(String, nullable=False)
    encrypted_content = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    is_encrypted = Column(Boolean, default=True)


class SessionBooking(Base):
    __tablename__ = "session_bookings"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    therapist_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scheduled_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default="scheduled")
    amount = Column(Integer, nullable=False)
    payment_status = Column(String, default="pending")
    platform_fee = Column(Integer, nullable=True)
    therapist_earning = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    therapist_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    booking_id = Column(Integer, ForeignKey("session_bookings.id"), nullable=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Availability(Base):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)
    therapist_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    day_of_week = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)


class MoodEntry(Base):
    __tablename__ = "mood_entries"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mood_score = Column(String, nullable=False)
    note = Column(Text, nullable=True)
    entry_date = Column(DateTime(timezone=True), server_default=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class FileAttachment(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("session_bookings.id"), nullable=False)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("session_bookings.id"), nullable=False)
    amount = Column(Float, nullable=False)
    method = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")
    transaction_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AiChatHistory(Base):
    __tablename__ = "ai_chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class PlatformWithdrawal(Base):
    __tablename__ = "platform_withdrawals"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Integer, nullable=False)
    destination = Column(String, nullable=False)
    account_details = Column(String, nullable=False)
    status = Column(String, default="pending")
    requested_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    balance = Column(Float, default=0)
    total_earned = Column(Float, default=0)
    total_withdrawn = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Withdrawal(Base):
    __tablename__ = "withdrawals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount_requested = Column(Float, nullable=False)
    platform_fee = Column(Float, nullable=False)
    amount_sent = Column(Float, nullable=False)
    mpesa_phone = Column(String, nullable=False)
    status = Column(String, default="pending")
    admin_note = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)

    

# ============ RAGE ROOM MODELS ============
class RageRoom(Base):
    __tablename__ = "rage_rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    available_days = Column(String, nullable=False)
    available_hours = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RageRoomPackage(Base):
    __tablename__ = "rage_room_packages"

    id = Column(Integer, primary_key=True, index=True)
    rage_room_id = Column(Integer, ForeignKey("rage_rooms.id"), nullable=False)
    tier = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, default=30)
    price = Column(Integer, nullable=False)
    student_price = Column(Integer, nullable=True)


class RageRoomBooking(Base):
    __tablename__ = "rage_room_bookings"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rage_room_id = Column(Integer, ForeignKey("rage_rooms.id"), nullable=False)
    package_id = Column(Integer, ForeignKey("rage_room_packages.id"), nullable=False)
    scheduled_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default="pending")
    amount = Column(Integer, nullable=False)
    payment_status = Column(String, default="pending")
    payment_method = Column(String, nullable=True)
    platform_fee = Column(Integer, nullable=True)
    is_student_rate = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
        # Liability Waiver Fields
    waiver_signed = Column(Boolean, default=False)
    waiver_signed_at = Column(DateTime(timezone=True), nullable=True)
    signer_name = Column(String, nullable=True)
    signer_id_number = Column(String, nullable=True)

    

# ============ UNIVERSITY & VERIFICATION MODELS ============
class University(Base):
    __tablename__ = "universities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email_domain = Column(String, nullable=False)
    subscription_tier = Column(String, default="starter")
    subscription_expires = Column(DateTime(timezone=True), nullable=True)
    rage_room_credit_pool = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    
# ============ THERAPIST AVAILABILITY MODEL ============
class TherapistAvailability(Base):
    __tablename__ = "therapist_availabilities"

    id = Column(Integer, primary_key=True, index=True)
    therapist_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
    start_time = Column(String, nullable=False)    # e.g., "09:00"
    end_time = Column(String, nullable=False)      # e.g., "17:00"
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())