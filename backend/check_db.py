from database import SessionLocal
from models import User

db = SessionLocal()
users = db.query(User).all()

print("\n========== DATABASE USERS ==========")
if not users:
    print("No users found in the database!")

for u in users:
    status = getattr(u, 'verification_status', 'COLUMN_MISSING')
    print(f"ID: {u.id} | Email: {u.email} | Type: {u.user_type} | Status: {status}")
print("====================================\n")

db.close()