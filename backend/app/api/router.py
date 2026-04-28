from fastapi import APIRouter
from app.api.endpoints import auth, invoice, chat

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(invoice.router, prefix="/invoice", tags=["invoice"])
router.include_router(chat.router, prefix="/chat", tags=["chat"])
