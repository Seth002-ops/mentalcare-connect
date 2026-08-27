from database import SessionLocal
from models import User

db = SessionLocal()

print("=" * 60)
print("THERAPIST STATUS DIAGNOSTIC")
print("=" * 60)

therapists = db.query(User).filter(User.user_type == "therapist").all()

if not therapists:
    print("\n❌ No therapists found in database!")
else:
    for t in therapists:
        print(f"\n📧 Email: {t.email}")
        print(f"   user_type: {t.user_type}")
        print(f"   verification_status: '{t.verification_status}'")
        print(f"   license_document_path: {t.license_document_path}")
        print(f"   is_active: {t.is_active}")

print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
print(f"Total therapists: {len(therapists)}")
print(f"  approved: {sum(1 for t in therapists if t.verification_status == 'approved')}")
print(f"  pending:  {sum(1 for t in therapists if t.verification_status == 'pending')}")
print(f"  rejected: {sum(1 for t in therapists if t.verification_status == 'rejected')}")
print(f"  other:    {sum(1 for t in therapists if t.verification_status not in ['approved', 'pending', 'rejected'])}")

db.close()