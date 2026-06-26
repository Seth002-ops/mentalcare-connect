from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List
from jose import jwt
from jose.exceptions import JWTError
from database import engine, get_db, Base, SessionLocal
from models import User, Message, SessionBooking
from schemas import (
    UserCreate, UserLogin, Token, MessageCreate, MessageResponse,
    BookingCreate, PaymentRequest, PaymentResponse
)
from crud import (
    get_user_by_email, get_user_by_id, authenticate_user, create_message,
    get_messages_by_room, create_booking, simulate_payment, get_booking_by_id,
    get_bookings_for_user
)
from auth import create_access_token, get_current_user
from config import settings

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Routes
@app.post("/auth/register", response_model=Token)
def register(user: UserCreate, db=Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    created_user = create_user(db, user.dict())
    access_token = create_access_token(data={"user_id": created_user.id, "user_type": created_user.user_type})
    return {"access_token": access_token, "token_type": "bearer", "user_type": created_user.user_type}


@app.post("/auth/login", response_model=Token)
def login(user_login: UserLogin, db=Depends(get_db)):
    user = authenticate_user(db, user_login.email, user_login.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"user_id": user.id, "user_type": user.user_type})
    return {"access_token": access_token, "token_type": "bearer", "user_type": user.user_type}


@app.post("/messages", response_model=MessageResponse)
def create_chat_message(
    message: MessageCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    booking = get_booking_by_id(db, message.room_id)
    if not booking or current_user.id not in {booking.client_id, booking.therapist_id}:
        raise HTTPException(status_code=403, detail="Unauthorized to post in this room")

    if message.sender_type != current_user.user_type:
        raise HTTPException(status_code=400, detail="sender_type must match authenticated user")

    db_message = create_message(db, message.dict())
    return {
        "id": db_message.id,
        "room_id": db_message.room_id,
        "content": message.content,
        "sender_type": db_message.sender_type,
        "timestamp": db_message.timestamp,
        "encrypted": True
    }


@app.get("/messages/{room_id}", response_model=List[MessageResponse])
def read_messages(
    room_id: int,
    skip: int = 0,
    limit: int = 100,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    booking = get_booking_by_id(db, room_id)
    if not booking or current_user.id not in {booking.client_id, booking.therapist_id}:
        raise HTTPException(status_code=403, detail="Unauthorized to access this room")
    messages = get_messages_by_room(db, room_id, skip=skip, limit=limit)
    return messages


@app.post("/bookings")
def create_session_booking(
    booking: BookingCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Only clients may book sessions")

    therapist = get_user_by_id(db, booking.therapist_id)
    if not therapist or therapist.user_type != "therapist":
        raise HTTPException(status_code=404, detail="Therapist not found")

    booking_data = booking.dict()
    booking_data["client_id"] = current_user.id
    booking_data["payment_status"] = "pending"
    db_booking = create_booking(db, booking_data)
    return {"booking_id": db_booking.id, "status": "confirmed"}


@app.get("/bookings/me")
def get_my_bookings(
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    bookings = get_bookings_for_user(db, current_user.id)
    return [
        {
            "id": booking.id,
            "client_id": booking.client_id,
            "therapist_id": booking.therapist_id,
            "scheduled_time": booking.scheduled_time,
            "status": booking.status,
            "amount": booking.amount,
            "payment_status": booking.payment_status,
        }
        for booking in bookings
    ]


@app.post("/payments/simulate", response_model=PaymentResponse)
def process_payment(
    payment: PaymentRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    booking = get_booking_by_id(db, payment.booking_id)
    if not booking or booking.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized booking payment")

    result = simulate_payment(payment.phone, payment.amount)
    if result["success"]:
        booking.payment_status = "completed"
        db.commit()
    return PaymentResponse(**result)


# WebSocket Routes
@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: int):
    auth_header = websocket.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        await websocket.close(code=1008)
        return

    token = auth_header.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
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

    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"room:{room_id}:{data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/")
def read_root():
    return {
        "message": "Afya Care Connect API 🚀",
        "status": "healthy",
        "features": [
            "✅ End-to-end encrypted chat",
            "✅ JWT authentication",
            "✅ SQLite + SQLAlchemy",
            "✅ WebSocket real-time chat",
            "✅ M-PESA payment simulation"
        ]
    }


@app.get("/docs")
async def custom_swagger_ui_html():
    return {"message": "Interactive API docs at /docs"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )