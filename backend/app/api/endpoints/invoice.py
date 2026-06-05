from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models.invoice import Invoice, SavedInvoiceResponse
from app.core.dependencies import get_current_user
from app.db.base import get_db
from app.db.models import SavedInvoice
from app.services import ai_service, parser_service, user_service

router = APIRouter()


class ParseRequest(BaseModel):
    image_base64: str
    media_type: str


@router.post("/parse", response_model=SavedInvoiceResponse)
async def parse_invoice(
    body: ParseRequest,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = user_service.get_user(db, current_user)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    raw_text = await ai_service.extract_invoice(body.image_base64, body.media_type)
    invoice = parser_service.validate_and_clean(raw_text)

    # Format invoice name nicely
    if invoice.currency == "IDR":
        amount_str = f"Rp {int(invoice.total):,}"
    else:
        amount_str = f"${invoice.total:.2f}"
    invoice_name = f"Invoice - {datetime.now().strftime('%b %d, %H:%M')} ({amount_str})"

    # Save to database
    welcome_message = {
        "role": "assistant",
        "content": "Invoice loaded! Check the 'Receipt' tab to see details, then ask me to split it.",
        "operation": None,
        "result": None
    }
    db_invoice = SavedInvoice(
        user_id=user.id,
        name=invoice_name,
        invoice_data=invoice.dict(),
        chat_history=[welcome_message],
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)

    return db_invoice


@router.get("", response_model=List[SavedInvoiceResponse])
def get_saved_invoices(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = user_service.get_user(db, current_user)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return (
        db.query(SavedInvoice)
        .filter(SavedInvoice.user_id == user.id)
        .order_by(SavedInvoice.created_at.desc())
        .all()
    )


@router.delete("/{invoice_id}")
def delete_saved_invoice(
    invoice_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = user_service.get_user(db, current_user)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    db_invoice = (
        db.query(SavedInvoice)
        .filter(SavedInvoice.id == invoice_id, SavedInvoice.user_id == user.id)
        .first()
    )
    if not db_invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )

    db.delete(db_invoice)
    db.commit()
    return {"message": "Invoice deleted"}

