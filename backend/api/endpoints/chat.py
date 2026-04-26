from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_service import ai_service

router = APIRouter()

class ChatRequest(BaseModel):
    invoice_id: str
    message: str
    invoice_data: dict

class ChatResponse(BaseModel):
    reply: str
    action: str = "none"

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    reply = await ai_service.chat_with_invoice(request.invoice_data, request.message)
    return {"reply": reply}
