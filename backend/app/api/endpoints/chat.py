from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError
from app.models.chat import ChatRequest, ActionResponse
from app.core.dependencies import get_current_user
from app.services import ai_service

router = APIRouter()


@router.post("/message", response_model=ActionResponse)
async def chat_message(
    body: ChatRequest,
    current_user: str = Depends(get_current_user),
):
    raw = await ai_service.chat(
        message=body.message,
        invoice=body.invoice,
        history=body.history,
    )
    try:
        return ActionResponse(**raw)
    except (ValidationError, Exception):
        raise HTTPException(status_code=422, detail="Invalid response from AI")
