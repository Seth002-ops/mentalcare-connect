from database import SessionLocal
from models import University
from datetime import datetime, timedelta

db = SessionLocal()

existing = db.query(University).filter(University.email_domain == "karu.ac.ke").first()
if existing:
    print(f" Karatina University already exists.")
    db.close()
    exit()

uni = University(
    name="Karatina University",
    email_domain="karu.ac.ke",
    subscription_tier="growth",
    subscription_expires=datetime.utcnow() + timedelta(days=180),
    rage_room_credit_pool=500,
    is_active=True,
)
db.add(uni)
db.commit()
db.close()

print(" Karatina University added!")
print("    Domain: karu.ac.ke")
print("    Rage room credits: 500")
print("    Subscription expires: 6 months from now")