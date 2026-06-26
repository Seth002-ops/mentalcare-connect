from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional
import re

ALLOWED_USER_TYPES = {"client", "therapist"}

class UserBase(BaseModel):
    email: EmailStr
    user_type: str

    @validator("user_type")
    def validate_user_type(cls, value):
        if value not in ALLOWED_USER_TYPES:
            raise ValueError("user_type must be either 'client' or 'therapist'")
        return value

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

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
    is_active: bool
    created_at: datetime
    
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
            raise ValueError("sender_type must be either 'client' or 'therapist'")
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