from database import SessionLocal
from models import User

db = SessionLocal()

print("🔧 Forcing all non-approved therapists to 'pending'...")

therapists = db.query(User).filter(User.user_type == "therapist").all()
fixed = 0

for t in therapists:
    # If they have no license, they should be pending
    if not t.license_document_path and t.verification_status != "rejected":
        old_status = t.verification_status
        t.verification_status = "pending"
        fixed += 1
        print(f"  {t.email}: '{old_status}' -> 'pending'")

db.commit()
db.close()

print(f"\n✅ Fixed {fixed} therapist(s)")