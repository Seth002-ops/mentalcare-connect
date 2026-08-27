from dotenv import load_dotenv
load_dotenv()

from database import SessionLocal
from models import SessionBooking

db = SessionLocal()
bookings = db.query(SessionBooking).all()

if not bookings:
    print("No bookings found. Book a session first!")
else:
    for b in bookings:
        b.status = "completed"
    db.commit()
    print(f"Marked {len(bookings)} booking(s) as completed!")

db.close()