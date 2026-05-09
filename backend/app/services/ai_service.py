import base64
import json
from google import genai
from google.genai import types
from app.core.config import get_settings
from app.models.invoice import Invoice
from app.models.chat import ChatMessage

_INVOICE_PARSING_PROMPT = """\
You are an invoice data extractor.

Extract the following from the receipt image and return ONLY valid JSON.
No explanation, no markdown, no backticks.

Return this exact schema:
{
  "currency": "IDR" or "USD",
  "subtotal": <number>,
  "tax": <number or 0>,
  "service_charge": <number or 0>,
  "total": <number>,
  "items": [
    {
      "name": <string>,
      "price": <unit price as number>,
      "quantity": <integer>,
      "subtotal": <price * quantity>
    }
  ]
}

Rules:
- Detect currency from symbols (Rp = IDR, $ = USD)
- If tax or service charge is not present, use 0
- All prices must be plain numbers, no currency symbols or formatting
- Do not infer or guess items not visible in the image
- IDR values must be integers (no decimals)\
"""

_CHAT_SYSTEM_PROMPT = """\
You are a friendly, casual bill-splitting assistant. You help users understand and split their receipts.

You have access to the following invoice data:
{invoice_json}

The user's conversation history is:
{chat_history}

Always respond with a single valid JSON object. No explanation outside the JSON. No markdown, no backticks.

Use this schema:
{{
  "operation": null,
  "variables": {{}},
  "expression": null,
  "result": null,
  "explanation": <your reply as a natural, conversational string>,
  "updated_invoice": null
}}

BY DEFAULT, just chat. Answer questions, make observations, crack a joke if it fits — write the way a helpful friend would text. Set operation, variables, expression, result, and updated_invoice all to null/empty. Everything goes in "explanation".

ONLY set a non-null "operation" when the user explicitly asks you to perform a calculation:
- "split equally between N people" → operation: "split_equal", variables: {{"people": N}}
- "split by item / who pays for what" → operation: "split_by_item", variables: {{"item_assignments": {{"Person": ["Item1", "Item2"]}}}}
- "exclude / remove an item" → operation: "exclude_item", variables: {{"item_name": "string"}}
- "exclude / remove tax or service charge" → operation: "exclude_charge", variables: {{"charge_type": "tax"|"service_charge"}}
- "sum a category" → operation: "sum_category", variables: {{"category": "string"}}
- "fix / update a price" → operation: "update_item_price", variables: {{"item_name": "string", "new_price": number}}

Rules that apply when an operation IS triggered:
1. split_by_item: if an item has quantity > 1 and multiple people shared it, assign it to EVERY one of them — the backend handles the math. Example: "Alice and Bob shared the 2 pizzas" → {{"item_assignments": {{"Alice": ["pizza"], "Bob": ["pizza"]}}}}
2. Always distribute tax and service charge PROPORTIONALLY based on each person's subtotal.
3. All monetary values must be raw numbers — no currency symbols, no thousands separators.
4. IDR: round to nearest integer. USD: round to 2 decimal places.\
"""


def _get_client() -> genai.Client:
    settings = get_settings()
    return genai.Client(api_key=settings.GEMINI_API_KEY)


_JSON_CONFIG = types.GenerateContentConfig(response_mime_type="application/json")
_MODEL = "gemini-2.5-flash-lite"


async def extract_invoice(image_base64: str, media_type: str) -> str:
    client = _get_client()
    image_bytes = base64.b64decode(image_base64)
    response = await client.aio.models.generate_content(
        model=_MODEL,
        contents=[
            _INVOICE_PARSING_PROMPT,
            types.Part.from_bytes(data=image_bytes, mime_type=media_type),
        ],
        config=_JSON_CONFIG,
    )
    return response.text


async def chat(message: str, invoice: Invoice, history: list[ChatMessage]) -> dict:
    invoice_json = invoice.model_dump_json(indent=2)
    history_text = "\n".join(f"{m.role}: {m.content}" for m in history)

    system_prompt = _CHAT_SYSTEM_PROMPT.format(
        invoice_json=invoice_json,
        chat_history=history_text,
    )

    client = _get_client()
    response = await client.aio.models.generate_content(
        model=_MODEL,
        contents=[system_prompt, message],
        config=_JSON_CONFIG,
    )
    return json.loads(response.text)
