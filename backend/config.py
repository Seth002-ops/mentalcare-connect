import os
import base64
import secrets
from cryptography.fernet import Fernet

class Settings:
    SECRET_KEY = os.getenv("SECRET_KEY")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

    SQLALCHEMY_DATABASE_URL = os.getenv("SQLALCHEMY_DATABASE_URL", "sqlite:///./afya_care.db")
    BACKEND_CORS_ORIGINS = [origin.strip() for origin in os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000").split(",") if origin.strip()]

    ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
    if ENCRYPTION_KEY:
        if isinstance(ENCRYPTION_KEY, str):
            ENCRYPTION_KEY = ENCRYPTION_KEY.encode()
        try:
            Fernet(ENCRYPTION_KEY)
        except Exception as exc:
            raise ValueError("ENCRYPTION_KEY must be a valid Fernet key") from exc
    else:
        ENCRYPTION_KEY = Fernet.generate_key()
        print("WARNING: ENCRYPTION_KEY is not set. A transient key was generated. Set ENCRYPTION_KEY in the environment for persistent encryption.")

    if not SECRET_KEY:
        SECRET_KEY = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode()
        print("WARNING: SECRET_KEY is not set. A transient secret was generated. Set SECRET_KEY in the environment for persistent authentication.")

    PROJECT_NAME = "Afya Care Connect API"

settings = Settings()