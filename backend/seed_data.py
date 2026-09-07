# backend/seed_data.py
# Run once with:  python seed_data.py
# Seeds only platform-level data (universities, admin, rage rooms).
# Real therapists and clients register through the normal signup flow.
from sqlalchemy.orm import sessionmaker

# Reuse your app's existing database connection
try:
    from database import engine
except ImportError:
    from main import engine

from models import Base, University, User, RageRoom, RageRoomPackage


# Reuse your app's password hasher, whichever style you use
def _get_hasher():
    try:
        from main import hash_password
        return hash_password
    except ImportError:
        pass
    try:
        from main import pwd_context
        return lambda p: pwd_context.hash(p)
    except ImportError:
        import bcrypt
        return lambda p: bcrypt.hashpw(p.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


hash_password = _get_hasher()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

UNIVERSITIES = [
    ("University of Nairobi", "uonbi.ac.ke"), ("Kenyatta University", "ku.ac.ke"),
    ("Karatina University", "karu.ac.ke"), ("Moi University", "mu.ac.ke"),
    ("Egerton University", "egerton.ac.ke"), ("Jomo Kenyatta University (JKUAT)", "jkuat.ac.ke"),
    ("Maseno University", "maseno.ac.ke"), ("Masinde Muliro University (MMUST)", "mmust.ac.ke"),
    ("Dedan Kimathi University (DeKUT)", "dkut.ac.ke"), ("Chuka University", "chuka.ac.ke"),
    ("Pwani University", "pu.ac.ke"), ("Laikipia University", "laikipia.ac.ke"),
    ("Meru University (MUST)", "must.ac.ke"), ("Embu University", "embuni.ac.ke"),
    ("Kirinyaga University", "kyu.ac.ke"), ("Machakos University", "mksu.ac.ke"),
    ("Kisii University", "kisiiuniversity.ac.ke"), ("South Eastern Kenya University (SEKU)", "seku.ac.ke"),
    ("Multimedia University of Kenya", "mmu.ac.ke"), ("Technical University of Kenya (TUK)", "tukenya.ac.ke"),
    ("Technical University of Mombasa (TUM)", "tum.ac.ke"), ("Jaramogi Oginga Odinga University (JOOUST)", "jooust.ac.ke"),
    ("Garissa University", "garissauniversity.ac.ke"), ("University of Eldoret", "uoeld.ac.ke"),
    ("Kibabii University", "kibu.ac.ke"), ("Maasai Mara University", "mmarau.ac.ke"),
    ("Strathmore University", "strathmore.edu"), ("USIU-Africa", "usiu.ac.ke"),
    ("Catholic University of Eastern Africa (CUEA)", "cuea.edu"), ("Kenya Methodist University (KeMU)", "kemu.ac.ke"),
    ("Daystar University", "daystar.ac.ke"), ("Kabarak University", "kabarak.ac.ke"),
    ("Africa Nazarene University", "anu.ac.ke"), ("Mount Kenya University (MKU)", "mku.ac.ke"),
    ("KCA University", "kca.ac.ke"), ("Zetech University", "zetech.ac.ke"),
    ("Riara University", "riarauniversity.ac.ke"), ("Scott Christian University", "scott.ac.ke"),
    ("Presbyterian University of East Africa (PUEA)", "puea.ac.ke"), ("Gretsa University", "gretsauniversity.ac.ke"),
    ("Pioneer International University", "piu.ac.ke"), ("East African University", "eau.ac.ke"),
    ("Adventist University of Africa", "aua.ac.ke"), ("International Centre for Mission Studies", "icms.ac.ke"),
    ("Pan Africa Christian University", "pac.ac.ke"), ("Nairobi Aviation College", "nairobaviation.ac.ke"),
    ("Inoorero University", "inu.ac.ke"), ("Management University of Africa", "mua.ac.ke"),
    ("Kiriri Women's University", "kwust.ac.ke"), ("Umma University", "umma.ac.ke"),
    ("University of Kabianga", "kabianga.ac.ke"),
]


def set_attrs(obj, candidates: dict):
    """Only set attributes that actually exist on the model - prevents crashes."""
    for key, value in candidates.items():
        if hasattr(obj, key):
            setattr(obj, key, value)


def make_user(email, password, user_type, name):
    user = User()
    user.email = email
    user.name = name
    user.user_type = user_type
    set_attrs(user, {
        "hashed_password": hash_password(password),
        "password_hash": hash_password(password),
        "is_verified": True,
        "email_verified": True,
        "is_active": True,
    })
    return user


def seed():
    db = SessionLocal()
    try:
                # 1. UNIVERSITIES (seeded as INACTIVE - admin activates after payment)
        added = 0
        for name, domain in UNIVERSITIES:
            if not db.query(University).filter_by(email_domain=domain).first():
                uni = University()
                set_attrs(uni, {
                    "name": name,
                    "email_domain": domain,
                    "is_active": False,
                })
                db.add(uni)
                added += 1
        db.commit()
        print(f"Universities added: {added} (all INACTIVE, awaiting admin approval)")
        # 2. ADMIN ACCOUNT (only admin is seeded; all other users register naturally)
        if not db.query(User).filter_by(email="admin@mecac.co.ke").first():
            db.add(make_user("admin@mecac.co.ke", "Admin@123456", "admin", "MECAC Admin"))
            db.commit()
            print("Admin created: admin@mecac.co.ke / Admin@123456")
        else:
            print("Admin already exists")

        # 3. RAGE ROOM + PACKAGES (business catalog)
        room = db.query(RageRoom).first()
        if not room:
            admin_user = db.query(User).filter(User.user_type == "admin").first()
            room = RageRoom()
            room_attrs = {
                "name": "MECAC Rage Room - Nairobi",
                "location": "Westlands, Nairobi",
                "description": "A safe, fully-equipped space to smash, break, and release stress. Full protective gear provided.",
                "capacity": 4,
                "price_per_hour": 3000.0,
                "price": 3000.0,
                "is_active": True,
                "available_days": "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
                "available_hours": "9:00 AM - 9:00 PM",
            }
            if admin_user and hasattr(room, "owner_id"):
                room_attrs["owner_id"] = admin_user.id
            set_attrs(room, room_attrs)
            db.add(room)
            db.commit()
            db.refresh(room)
            print("Rage Room created")
        else:
            print("Rage Room already exists")

        packages = [
            ("Quick Smash", "15 minutes of smashing. 10 items to break. Perfect for a quick stress release.", 15, 1500.0, "basic", 10),
            ("Stress Buster", "30 minutes of smashing. 25 items to break. Our most popular package.", 30, 2500.0, "standard", 25),
            ("Full Rage Mode", "60 minutes of unrestricted smashing. 50+ items including furniture. Go all out!", 60, 4500.0, "premium", 50),
            ("Group Smash Party", "Up to 4 people. 60 minutes. 100+ items. Perfect for birthdays, breakups, or team bonding!", 60, 8000.0, "group", 100),
        ]
        added = 0
        for name, desc, mins, price, tier, items in packages:
            if not db.query(RageRoomPackage).filter_by(name=name).first():
                pkg = RageRoomPackage()
                set_attrs(pkg, {
                    "rage_room_id": room.id,
                    "name": name,
                    "description": desc,
                    "duration_minutes": mins,
                    "price": price,
                    "tier": tier,
                    "items_to_break": items,
                })
                db.add(pkg)
                added += 1
        db.commit()
        print(f"Rage Room packages added: {added}")

        print("\nSEEDING COMPLETE!")
        print("Universities, admin, and rage rooms are ready.")
        print("Real therapists and clients will register through the normal signup flow.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Seeding database...")
    seed()