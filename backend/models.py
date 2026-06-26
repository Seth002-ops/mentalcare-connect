from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    user_type = Column(String, nullable=False)  # 'client' or 'therapist'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, index=True, nullable=False)
    sender_type = Column(String, nullable=False)  # 'client' or 'therapist'
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
    created_at = Column(DateTime(timezone=True), server_default=func.now())