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
            # Save split data if this is a split operation
            if raw.get("operation") in ("split_by_item", "split_equal") and raw.get("result") is not None:
                saved_invoice.split_data = {
                    "operation": raw["operation"],
                    "variables": raw.get("variables", {}),
                    "result": raw["result"]
                }
            
            # Recalculate split if split_data exists and invoice is updated
            if raw.get("updated_invoice") and saved_invoice.split_data:
                try:
                    from app.models.invoice import Invoice
                    updated_invoice_obj = Invoice(**raw["updated_invoice"])
                    
                    split_op = saved_invoice.split_data.get("operation")
                    split_vars = saved_invoice.split_data.get("variables", {})
                    
                    if split_op == "split_by_item":
                        assignments = split_vars.get("item_assignments")
                        if assignments:
                            charge_assignments = split_vars.get("charge_assignments")
                            new_result = calculation_service.recalculate_split_by_item(
                                updated_invoice_obj, assignments, charge_assignments
                            )
                            saved_invoice.split_data = {
                                "operation": split_op,
                                "variables": split_vars,
                                "result": new_result
                            }
                            # Append updated summary to explanation
                            currency = updated_invoice_obj.currency
                            summary = "\n".join([f"- {name}: {currency} {amount}" for name, amount in new_result.items()])
                            if "explanation" in raw:
                                raw["explanation"] += f"\n\n**Updated split breakdown:**\n{summary}"
                    elif split_op == "split_equal":
                        people = split_vars.get("people")
                        if people:
                            new_result = calculation_service.recalculate_split_equal(
                                updated_invoice_obj, int(people)
                            )
                            saved_invoice.split_data = {
                                "operation": split_op,
                                "variables": split_vars,
                                "result": new_result
                            }
                            currency = updated_invoice_obj.currency
                            if "explanation" in raw:
                                raw["explanation"] += f"\n\n**Updated split breakdown:**\nEach person pays: {currency} {new_result}"
                except Exception as e:
                    print(f"Error recalculating split data: {e}")

            # Sync invoice data
            if raw.get("updated_invoice"):
                saved_invoice.invoice_data = raw["updated_invoice"]
                # Update invoice name dynamically with the new total
                try:
                    currency = raw["updated_invoice"].get("currency")
                    total = raw["updated_invoice"].get("total")
                    if currency == "IDR":
                        amount_str = f"Rp {int(total):,}"
                    else:
                        amount_str = f"${total:.2f}"
                    
                    if " (" in saved_invoice.name:
                        base_name = saved_invoice.name.split(" (")[0]
                        saved_invoice.name = f"{base_name} ({amount_str})"
                except Exception as e:
                    print(f"Error updating invoice name: {e}")
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

