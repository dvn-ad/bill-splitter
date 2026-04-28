import json
from fastapi import HTTPException
from pydantic import ValidationError
from app.models.invoice import Invoice

_PARSE_ERROR = "Could not extract invoice from image. Please try a clearer photo."


def validate_and_clean(raw_text: str) -> Invoice:
    text = raw_text.strip()
    # Strip accidental markdown code fences
    if text.startswith("```"):
        text = text.split("\n", 1)[-1]
        if text.endswith("```"):
            text = text[:-3].strip()

    try:
        invoice_data = json.loads(text)
        
        # Ensure mathematical consistency
        items = invoice_data.get("items", [])
        for item in items:
            item["subtotal"] = item.get("price", 0) * item.get("quantity", 0)
            
        subtotal = sum(item["subtotal"] for item in items)
        invoice_data["subtotal"] = subtotal
        
        total = subtotal + invoice_data.get("tax", 0) + invoice_data.get("service_charge", 0)
        if invoice_data.get("currency") == "IDR":
            invoice_data["total"] = round(total)
        else:
            invoice_data["total"] = round(total, 2)
            
        return Invoice(**invoice_data)
    except (json.JSONDecodeError, ValidationError, Exception):
        raise HTTPException(status_code=422, detail=_PARSE_ERROR)
