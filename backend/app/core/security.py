import uuid
from datetime import datetime, timedelta, timezone
from jose import jwt
from app.core.config import get_settings


def create_access_token(data: dict) -> str:
    settings = get_settings()
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload["exp"] = expire
    payload["jti"] = str(uuid.uuid4())
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
