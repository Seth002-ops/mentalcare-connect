from database import SessionLocal
from models import RageRoom, RageRoomPackage

db = SessionLocal()

existing = db.query(RageRoom).first()
if existing:
    print(f"⚠️ Rage room already exists: {existing.name}")
    print("   Delete afya_care.db to recreate, or skip this step.")
    db.close()
    exit()

room = RageRoom(
    name="Mecac Rage Room — Nairobi",
    location="Westlands, Nairobi",
    description="Kenya's first therapeutic rage room. Release anger safely, then track how much calmer you feel in our cool-down corner.",
    available_days="Mon-Sat",
    available_hours="09:00-18:00",
    is_active=True,
    owner_id=None,
)
db.add(room)
db.commit()
db.refresh(room)

# Save values BEFORE closing the session
room_name = room.name
room_location = room.location

packages = [
    RageRoomPackage(
        rage_room_id=room.id,
        tier="basic",
        name="Release",
        description="30 min • 25-30 bottles & plates • 2 lightweight aluminum tools • full safety gear • cool-down mood check-in",
        duration_minutes=30,
        price=1500,
        student_price=1100,
    ),
    RageRoomPackage(
        rage_room_id=room.id,
        tier="regular",
        name="Let It Out",
        description="60 min • 50-70 items + small electronics • 4 lightweight tools • play your own music • cool-down mood check-in",
        duration_minutes=60,
        price=2500,
        student_price=1900,
    ),
    RageRoomPackage(
        rage_room_id=room.id,
        tier="premium",
        name="Total Destruction",
        description="90 min • furniture + TV/printer on stands • all tools incl. sledgehammer • video recording included • cool-down mood check-in",
        duration_minutes=90,
        price=4000,
        student_price=3100,
    ),
]
db.add_all(packages)
db.commit()
db.close()

print("✅ Rage room created successfully!")
print(f"   📍 {room_name} — {room_location}")
print(f"   🌱 Basic (Release):       KSh 1,500 | Student: KSh 1,100")
print(f"   🔥 Regular (Let It Out):  KSh 2,500 | Student: KSh 1,900")
print(f"   💥 Premium (Total Dest.): KSh 4,000 | Student: KSh 3,100")