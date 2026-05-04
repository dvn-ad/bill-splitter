import base64
import json
import google.generativeai as genai
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
You are a bill splitting assistant. You help users analyze and split invoices.

You have access to the following invoice data:
{invoice_json}

The user's conversation history is:
{chat_history}

You must ALWAYS respond with a single valid JSON object. No explanation outside the JSON.
No markdown, no backticks.

Use this exact schema:
{{
  "operation": <string>,
  "variables": <object of values used>,
  "expression": <human-readable equation string>,
  "result": <computed value — number, array, or object>,
  "explanation": <friendly natural language summary>,
  "updated_invoice": <full updated invoice object, or null if unchanged>
}}

Supported operations:
- split_equal         → divide total by N people. variables: {{"people": N}}
- split_by_item       → assign specific items to specific people. variables: {{"item_assignments": {{"Person": ["Item1", "Item2"]}}}}
- exclude_item        → remove an item and recalculate total. variables: {{"item_name": "string"}}
- exclude_charge      → remove tax or service_charge and recalculate. variables: {{"charge_type": "tax"|"service_charge"}}
- sum_category        → sum items matching a description. variables: {{"category": "string"}}
- update_item_price   → correct a misread item price and recalculate. variables: {{"item_name": "string", "new_price": number}}

Rules for splitting:
1. When splitting by item, you MUST distribute item quantities correctly. If an item has quantity > 1 and multiple people are mentioned, assign that item to EVERY person who shared it. The backend will handle the math.
   - Example: "Alice and Bob shared the 2 pizzas" -> {{"item_assignments": {{"Alice": ["pizza"], "Bob": ["pizza"]}}}}
2. Always distribute tax and service charge PROPORTIONALLY based on each person's subtotal.
3. All monetary values in the JSON result must be raw numbers. NEVER include currency symbols, thousands separators (dots/commas), or string formatting.
4. For IDR, round results to the nearest integer. For USD, round to 2 decimal places.
5. In the "explanation" field, provide a friendly summary of WHAT was done, but AVOID listing specific final monetary amounts for each person (e.g., say "The bill was split between 5 people" instead of "Andi pays Rp 56.650"). The final amounts will be displayed in a table automatically.

If the user's request is unclear, set operation to "clarify" and use the
explanation field to ask a follow-up question.\
"""


def _get_model(name: str) -> genai.GenerativeModel:
    settings = get_settings()
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel(
        name,
        generation_config={"response_mime_type": "application/json"}
    )


async def extract_invoice(image_base64: str, media_type: str) -> str:
    model = _get_model("gemini-2.5-flash-lite")
    image_bytes = base64.b64decode(image_base64)
    response = await model.generate_content_async([
        _INVOICE_PARSING_PROMPT,
        {"mime_type": media_type, "data": image_bytes},
    ])
    return response.text


async def chat(message: str, invoice: Invoice, history: list[ChatMessage]) -> dict:
    invoice_json = invoice.model_dump_json(indent=2)
    history_text = "\n".join(f"{m.role}: {m.content}" for m in history)

    system_prompt = _CHAT_SYSTEM_PROMPT.format(
        invoice_json=invoice_json,
        chat_history=history_text,
    )

    model = _get_model("gemini-2.5-flash-lite")
    response = await model.generate_content_async([system_prompt, message])

    return json.loads(response.text)
