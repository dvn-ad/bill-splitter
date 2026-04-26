from fastapi import APIRouter
from api.endpoints import invoice, chat

api_router = APIRouter()
api_router.include_router(invoice.router, prefix="/invoice", tags=["invoice"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
