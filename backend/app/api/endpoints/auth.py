from fastapi import APIRouter, Depends, HTTPException
from app.models.auth import LoginRequest, LoginResponse
from app.core.config import Settings, get_settings
from app.core.security import create_access_token

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, settings: Settings = Depends(get_settings)):
    if body.username != settings.APP_USERNAME or body.password != settings.APP_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": body.username})
    return {"access_token": token, "token_type": "bearer"}
