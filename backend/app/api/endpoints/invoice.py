from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.models.invoice import Invoice
from app.core.dependencies import get_current_user
from app.services import ai_service, parser_service

router = APIRouter()


class ParseRequest(BaseModel):
    image_base64: str
    media_type: str


@router.post("/parse", response_model=Invoice)
async def parse_invoice(
    body: ParseRequest,
    current_user: str = Depends(get_current_user),
):
    raw_text = await ai_service.extract_invoice(body.image_base64, body.media_type)
    invoice = parser_service.validate_and_clean(raw_text)
    return invoice
