# inspect_db.py
from database import SessionLocal
from models import University, User, RageRoom, RageRoomPackage

db = SessionLocal()

print("=" * 60)
print("MECAC LOCAL DATABASE INSPECTION")
print("=" * 60)

# Universities
unis = db.query(University).all()
active_unis = [u for u in unis if u.is_active]
print(f"\n[UNIVERSITIES] Total: {len(unis)} | Active: {len(active_unis)}")
for u in unis[:5]:
    print(f"  - {u.name} ({u.email_domain}) {'✓ Active' if u.is_active else '✗ Inactive'}")
if len(unis) > 5:
    print(f"  ... and {len(unis) - 5} more")

# Users
print("\n[USERS]")
for user_type in ["admin", "therapist", "client"]:
    count = db.query(User).filter(User.user_type == user_type).count()
    print(f"  - {user_type.title()}: {count}")

# Rage Rooms
print("\n[RAGE ROOMS]")
rooms = db.query(RageRoom).all()
for r in rooms:
    pkg_count = db.query(RageRoomPackage).filter(RageRoomPackage.rage_room_id == r.id).count()
    print(f"  - {r.name} ({r.location}) | {pkg_count} packages | Active: {r.is_active}")

# Packages
print("\n[RAGE ROOM PACKAGES]")
pkgs = db.query(RageRoomPackage).all()
for p in pkgs:
    print(f"  - {p.name} | {p.duration_minutes}min | KSh {p.price} | Tier: {p.tier}")

print("\n" + "=" * 60)
db.close()