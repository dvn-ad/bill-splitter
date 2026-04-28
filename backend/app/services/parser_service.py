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
        data = json.loads(text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail=_PARSE_ERROR)

    try:
        return Invoice(**data)
    except (ValidationError, Exception):
        raise HTTPException(status_code=422, detail=_PARSE_ERROR)
