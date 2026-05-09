from datetime import datetime, timezone
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.models.auth import LoginRequest, RegisterRequest
from app.core.config import get_settings
from app.core.security import create_access_token
from app.core.dependencies import get_current_user
from app.db.base import get_db
from app.services.user_service import create_user, get_user, verify_password
from app.services.redis_service import blacklist_token

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if get_user(db, body.username):
        raise HTTPException(status_code=409, detail="Username already taken")
    create_user(db, body.username, body.password)
    return {"message": "Account created"}


@router.post("/login")
def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = get_user(db, body.username)
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.username})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="none",
        secure=True,
        path="/",
    )
    return {"message": "ok"}


@router.post("/logout")
def logout(response: Response, access_token: str | None = Cookie(None)):
    if access_token:
        settings = get_settings()
        try:
            payload = jwt.decode(
                access_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
            )
            jti = payload.get("jti")
            exp = payload.get("exp")
            if jti and exp:
                ttl = int(exp - datetime.now(timezone.utc).timestamp())
                if ttl > 0:
                    blacklist_token(jti, ttl)
        except JWTError:
            pass
    response.delete_cookie(key="access_token", path="/", samesite="none", secure=True)
    return {"message": "ok"}


@router.get("/me")
def me(username: str = Depends(get_current_user)):
    return {"username": username}
