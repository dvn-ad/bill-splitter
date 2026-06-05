from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError
from sqlalchemy.orm import Session
from app.models.chat import ChatRequest, ActionResponse
from app.core.dependencies import get_current_user
from app.db.base import get_db
from app.db.models import SavedInvoice
from app.services import ai_service, calculation_service, user_service

router = APIRouter()


@router.post("/message", response_model=ActionResponse)
async def chat_message(
    body: ChatRequest,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    raw = await ai_service.chat(
        message=body.message,
        invoice=body.invoice,
        history=body.history,
    )
    
    # Recalculate if operation is split_by_item for accuracy
    if raw.get("operation") == "split_by_item":
        assignments = raw.get("variables", {}).get("item_assignments")
        if assignments:
            try:
                charge_assignments = raw.get("variables", {}).get("charge_assignments")
                results = calculation_service.recalculate_split_by_item(
                    body.invoice, assignments, charge_assignments
                )
                raw["result"] = results
                
                # Update explanation with the corrected numbers to avoid mismatch
                currency = body.invoice.currency
                summary = "\n".join([f"- {name}: {currency} {amount}" for name, amount in results.items()])
                # if "explanation" in raw:
                #     raw["explanation"] += f"\n\nRecalculated breakdown:\n{summary}"
            except Exception:
                pass
    elif raw.get("operation") == "split_equal":
        people = raw.get("variables", {}).get("people")
        if people:
            try:
                result = calculation_service.recalculate_split_equal(
                    body.invoice, int(people)
                )
                raw["result"] = result
                currency = body.invoice.currency
                if "explanation" in raw:
                    raw["explanation"] += f"\n\nEach person pays: {currency} {result}"
            except Exception:
                pass

    # Fix updated_invoice totals if AI mutated the invoice
    if raw.get("updated_invoice"):
        try:
            updated = raw["updated_invoice"]
            # Recalculate subtotal
            subtotal = sum(item["subtotal"] for item in updated.get("items", []))
            updated["subtotal"] = subtotal
            # Recalculate total
            total = subtotal + updated.get("tax", 0) + updated.get("service_charge", 0)
            if updated.get("currency") == "IDR":
                updated["total"] = round(total)
            else:
                updated["total"] = round(total, 2)
        except Exception:
            pass

    # Save changes to DB if invoice_id is provided
    if body.invoice_id:
        user = user_service.get_user(db, current_user)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        saved_invoice = (
            db.query(SavedInvoice)
            .filter(SavedInvoice.id == body.invoice_id, SavedInvoice.user_id == user.id)
            .first()
        )
        if saved_invoice:
            # Sync invoice data
            if raw.get("updated_invoice"):
                saved_invoice.invoice_data = raw["updated_invoice"]
            else:
                saved_invoice.invoice_data = body.invoice.dict()
            
            # Sync chat history
            new_history = [h.dict() for h in body.history]
            new_history.append({"role": "user", "content": body.message, "operation": None, "result": None})
            new_history.append({
                "role": "assistant",
                "content": raw.get("explanation"),
                "operation": raw.get("operation"),
                "result": raw.get("result")
            })
            saved_invoice.chat_history = new_history
            
            db.add(saved_invoice)
            db.commit()

    try:
        return ActionResponse(**raw)
    except (ValidationError, Exception):
        raise HTTPException(status_code=422, detail="Invalid response from AI")

