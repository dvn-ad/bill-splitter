from fastapi import Cookie, HTTPException
from jose import JWTError, jwt
from app.core.config import get_settings
from app.services.redis_service import is_blacklisted


def get_current_user(access_token: str | None = Cookie(None)) -> str:
    if access_token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    settings = get_settings()
    try:
        payload = jwt.decode(access_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        sub: str = payload.get("sub")
        jti: str = payload.get("jti")
        if sub is None:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        if jti and is_blacklisted(jti):
            raise HTTPException(status_code=401, detail="Token has been revoked")
        return sub
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
