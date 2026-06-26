from datetime import datetime
from sqlalchemy.orm import Session
from models import User, Message, SessionBooking
from passlib.context import CryptContext
from cryptography.fernet import Fernet
from config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
cipher_suite = Fernet(settings.ENCRYPTION_KEY)

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_booking_by_id(db: Session, booking_id: int):
    return db.query(SessionBooking).filter(SessionBooking.id == booking_id).first()


def get_bookings_for_user(db: Session, user_id: int):
    return db.query(SessionBooking).filter(
        (SessionBooking.client_id == user_id) | (SessionBooking.therapist_id == user_id)
    ).order_by(SessionBooking.scheduled_time.asc()).all()


def create_user(db: Session, user: dict):
    hashed_password = pwd_context.hash(user["password"])
    db_user = User(
        email=user["email"],
        hashed_password=hashed_password,
        user_type=user["user_type"]
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user or not pwd_context.verify(password, user.hashed_password):
        return False
    return user


def create_message(db: Session, message: dict):
    encrypted_content = cipher_suite.encrypt(message["content"].encode()).decode()
    db_message = Message(
        room_id=message["room_id"],
        sender_type=message["sender_type"],
        encrypted_content=encrypted_content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def get_messages_by_room(db: Session, room_id: int, skip: int = 0, limit: int = 100):
    messages = db.query(Message).filter(Message.room_id == room_id)\
                 .order_by(Message.timestamp.asc())\
                 .offset(skip)\
                 .limit(limit).all()
    decrypted_messages = []
    for message in messages:
        decrypted_content = cipher_suite.decrypt(message.encrypted_content.encode()).decode()
        decrypted_messages.append({
            "id": message.id,
            "room_id": message.room_id,
            "content": decrypted_content,
            "sender_type": message.sender_type,
            "timestamp": message.timestamp,
            "encrypted": True
        })
    return decrypted_messages


def create_booking(db: Session, booking: dict):
    db_booking = SessionBooking(**booking)
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


def simulate_payment(phone: str, amount: int) -> dict:
    # Simulate M-PESA validation with secure phone validation
    if len(phone) >= 10 and phone.startswith(("2547", "2541")) and amount > 0:
        return {
            "success": True,
            "transaction_id": f"TXN{int(datetime.now().timestamp())}",
            "message": "Payment successful"
        }
    return {
        "success": False,
        "transaction_id": None,
        "message": "Invalid phone number or amount"
    }