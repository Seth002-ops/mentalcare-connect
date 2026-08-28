from database import Base, engine
from models import SessionNote

Base.metadata.create_all(bind=engine)

print("✅ Session notes table created successfully.")