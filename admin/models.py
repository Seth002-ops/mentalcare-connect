from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    hashed_password = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.String(50), nullable=False)  # 'client' or 'therapist'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'user_type': self.user_type,
            'is_active': self.is_active,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

class Message(db.Model):
    __tablename__ = "messages"
    
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    sender_type = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    encrypted = db.Column(db.Boolean, default=True)
    
    @property
    def decrypted_content(self):
        return self.content
    
    def to_dict(self):
        return {
            'id': self.id,
            'room_id': self.room_id,
            'content': self.content,
            'sender_type': self.sender_type,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'encrypted': self.encrypted
        }

class SessionBooking(db.Model):
    __tablename__ = "session_bookings"
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, nullable=False)
    therapist_id = db.Column(db.Integer, nullable=False)
    scheduled_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50), default='pending')
    amount = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'therapist_id': self.therapist_id,
            'scheduled_time': self.scheduled_time.strftime('%Y-%m-%d %H:%M:%S'),
            'status': self.status,
            'amount': self.amount,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
