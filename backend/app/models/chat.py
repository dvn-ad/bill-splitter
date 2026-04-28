from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel
from app.models.invoice import Invoice


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    invoice: Invoice
    history: List[ChatMessage]


class ActionResponse(BaseModel):
    operation: str
    variables: Dict[str, Any]
    expression: str
    result: Any
    explanation: str
    updated_invoice: Optional[Invoice] = None
