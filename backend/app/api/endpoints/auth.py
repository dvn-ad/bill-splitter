from fastapi import APIRouter, Depends, HTTPException, Response
from app.models.auth import LoginRequest
from app.core.config import Settings, get_settings
from app.core.security import create_access_token
from app.core.dependencies import get_current_user

router = APIRouter()


@router.post("/login")
def login(body: LoginRequest, response: Response, settings: Settings = Depends(get_settings)):
    if body.username != settings.APP_USERNAME or body.password != settings.APP_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": body.username})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        path="/",
    )
    return {"message": "ok"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"message": "ok"}


@router.get("/me")
def me(username: str = Depends(get_current_user)):
    return {"username": username}
