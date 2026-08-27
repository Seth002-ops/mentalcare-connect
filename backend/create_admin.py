from dotenv import load_dotenv
load_dotenv()

from database import SessionLocal
from models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = SessionLocal()

# Check if admin already exists
existing_admin = db.query(User).filter(User.email == "admin@mecac.co.ke").first()
if existing_admin:
    print("Admin already exists!")
else:
    admin = User(
        email="admin@mecac.co.ke",
        hashed_password=pwd_context.hash("Admin@123456"),
        user_type="admin",
        name="Platform Admin",
        terms_accepted=True
    )
    db.add(admin)
    db.commit()
    print("Admin created successfully!")
    print("Email: admin@mecac.co.ke")
    print("Password: Admin@123456")

db.close()