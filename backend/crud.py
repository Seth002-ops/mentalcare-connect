from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import User, Message, SessionBooking, MoodEntry, Review, Notification, AiChatHistory
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
        user_type=user["user_type"],
        name=user.get("name"),
        # 🌟 CRITICAL FIX: Therapists start as "incomplete", not "pending"
        verification_status="incomplete" if user["user_type"] == "therapist" else "approved"
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


# ============ WAVE 2: MOOD TRACKER CRUD ============
def get_recent_moods(db: Session, client_id: int):
    return db.query(MoodEntry).filter(MoodEntry.client_id == client_id)\
             .order_by(MoodEntry.entry_date.desc()).limit(7).all()


def log_mood_entry(db: Session, client_id: int, mood: dict):
    db_mood = MoodEntry(client_id=client_id, **mood)
    db.add(db_mood)
    db.commit()
    db.refresh(db_mood)
    return db_mood


# ============ REVIEWS CRUD ============
def create_review(db: Session, review: dict):
    db_review = Review(**review)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


def get_reviews_for_therapist(db: Session, therapist_id: int):
    return db.query(Review).filter(Review.therapist_id == therapist_id)\
             .order_by(Review.created_at.desc()).all()


def get_review_by_booking(db: Session, booking_id: int):
    return db.query(Review).filter(Review.booking_id == booking_id).first()


# ============ NOTIFICATIONS CRUD ============
def create_notification(db: Session, user_id: int, message: str, type: str):
    db_notification = Notification(user_id=user_id, message=message, type=type)
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


def get_user_notifications(db: Session, user_id: int):
    return db.query(Notification).filter(Notification.user_id == user_id)\
             .order_by(Notification.created_at.desc()).limit(20).all()


def get_unread_count(db: Session, user_id: int):
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()


def mark_notification_read(db: Session, notification_id: int):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification:
        notification.is_read = True
        db.commit()
    return notification


def mark_all_notifications_read(db: Session, user_id: int):
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()


# ============ ADMIN CRUD ============
def get_all_users(db: Session, user_type: Optional[str] = None, search: Optional[str] = None):
    query = db.query(User)
    if user_type:
        query = query.filter(User.user_type == user_type)
    if search:
        query = query.filter(
            (User.email.contains(search)) | (User.name.contains(search))
        )
    return query.order_by(User.created_at.desc()).all()


def get_admin_stats(db: Session):
    total_users = db.query(User).count()
    total_clients = db.query(User).filter(User.user_type == "client").count()
    total_therapists = db.query(User).filter(User.user_type == "therapist").count()
    total_bookings = db.query(SessionBooking).count()
    completed_bookings = db.query(SessionBooking).filter(SessionBooking.status == "completed").count()
    pending_bookings = db.query(SessionBooking).filter(SessionBooking.status.in_(["pending", "confirmed"])).count()
    
    # Total revenue (all payments from clients)
    revenue_result = db.query(func.sum(SessionBooking.amount)).filter(
        SessionBooking.payment_status == "completed"
    ).scalar()
    total_revenue = revenue_result or 0
    
    # 💰 Platform earnings (15% commission from all completed payments)
    platform_revenue_result = db.query(func.sum(SessionBooking.platform_fee)).filter(
        SessionBooking.payment_status == "completed"
    ).scalar()
    total_platform_revenue = platform_revenue_result or 0
    
    # 💰 Total paid to therapists
    therapist_payouts_result = db.query(func.sum(SessionBooking.therapist_earning)).filter(
        SessionBooking.payment_status == "completed"
    ).scalar()
    total_therapist_payouts = therapist_payouts_result or 0
    
    total_reviews = db.query(Review).count()
    avg_rating_result = db.query(func.avg(Review.rating)).scalar()
    average_rating = round(float(avg_rating_result), 2) if avg_rating_result else 0.0
    
    total_messages = db.query(Message).count()
    total_mood_entries = db.query(MoodEntry).count()
    
    return {
        "total_users": total_users,
        "total_clients": total_clients,
        "total_therapists": total_therapists,
        "total_bookings": total_bookings,
        "completed_bookings": completed_bookings,
        "pending_bookings": pending_bookings,
        "total_revenue": total_revenue,
        "total_platform_revenue": total_platform_revenue,
        "total_therapist_payouts": total_therapist_payouts,
        "total_reviews": total_reviews,
        "average_rating": average_rating,
        "total_messages": total_messages,
        "total_mood_entries": total_mood_entries,
    }

def toggle_user_active(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.is_active = not user.is_active
        db.commit()
        db.refresh(user)
    return user


# ============ AI CHAT HISTORY CRUD ============
def save_ai_message(db: Session, user_id: int, role: str, content: str):
    db_message = AiChatHistory(user_id=user_id, role=role, content=content)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def get_ai_chat_history(db: Session, user_id: int, limit: int = 10):
    return db.query(AiChatHistory).filter(
        AiChatHistory.user_id == user_id
    ).order_by(AiChatHistory.created_at.desc()).limit(limit).all()

from models import Wallet, Withdrawal

# ============ WALLET CRUD ============
def get_or_create_wallet(db: Session, user_id: int):
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    if not wallet:
        wallet = Wallet(user_id=user_id, balance=0, total_earned=0, total_withdrawn=0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet


def add_to_wallet(db: Session, user_id: int, amount: float):
    wallet = get_or_create_wallet(db, user_id)
    wallet.balance += amount
    wallet.total_earned += amount
    db.commit()
    db.refresh(wallet)
    return wallet


def deduct_from_wallet(db: Session, user_id: int, amount: float):
    wallet = get_or_create_wallet(db, user_id)
    if wallet.balance < amount:
        return None
    wallet.balance -= amount
    wallet.total_withdrawn += amount
    db.commit()
    db.refresh(wallet)
    return wallet


def get_wallet(db: Session, user_id: int):
    return get_or_create_wallet(db, user_id)


# ============ WITHDRAWAL CRUD ============
def create_withdrawal(db: Session, withdrawal: dict):
    db_withdrawal = Withdrawal(**withdrawal)
    db.add(db_withdrawal)
    db.commit()
    db.refresh(db_withdrawal)
    return db_withdrawal


def get_user_withdrawals(db: Session, user_id: int):
    return db.query(Withdrawal).filter(
        Withdrawal.user_id == user_id
    ).order_by(Withdrawal.created_at.desc()).all()


def get_all_withdrawals(db: Session, status: Optional[str] = None):
    query = db.query(Withdrawal)
    if status:
        query = query.filter(Withdrawal.status == status)
    return query.order_by(Withdrawal.created_at.desc()).all()


def get_withdrawal_by_id(db: Session, withdrawal_id: int):
    return db.query(Withdrawal).filter(Withdrawal.id == withdrawal_id).first()


def update_withdrawal_status(db: Session, withdrawal_id: int, status: str, admin_note: Optional[str] = None):
    withdrawal = db.query(Withdrawal).filter(Withdrawal.id == withdrawal_id).first()
    if withdrawal:
        withdrawal.status = status
        if admin_note:
            withdrawal.admin_note = admin_note
        if status in ("approved", "rejected"):
            withdrawal.processed_at = datetime.utcnow()
        db.commit()
        db.refresh(withdrawal)
    return withdrawal