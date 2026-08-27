from database import SessionLocal
from models import User

db = SessionLocal()
# Find all therapists who are stuck in "pending" and move them to "incomplete"
therapists = db.query(User).filter(
    User.user_type == "therapist", 
    User.verification_status == "pending"
).all()

for t in therapists:
    t.verification_status = "incomplete"

db.commit()
db.close()
print(f"✅ Fixed {len(therapists)} therapists! They will now see the profile page.")