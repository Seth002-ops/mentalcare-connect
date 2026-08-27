from database import SessionLocal
from models import RageRoomPackage, User

db = SessionLocal()

# 1. Fix student prices to token amounts
prices = {"basic": 100, "regular": 150, "premium": 200}
for pkg in db.query(RageRoomPackage).all():
    if pkg.tier in prices:
        pkg.student_price = prices[pkg.tier]
db.commit()
print("✅ Student prices updated: Basic=100, Regular=150, Premium=200")

# 2. Move therapists approved without a license back to pending
fixed = 0
for t in db.query(User).filter(User.user_type == "therapist").all():
    if t.verification_status == "approved" and not t.license_document_path:
        t.verification_status = "pending"
        fixed += 1
db.commit()
print(f"✅ {fixed} unlicensed therapist(s) moved back to pending approval")

db.close()