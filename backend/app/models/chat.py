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
    operation: Optional[str] = None
    variables: Optional[Dict[str, Any]] = None
    expression: Optional[str] = None
    result: Optional[Any] = None
    explanation: str
    updated_invoice: Optional[Invoice] = None
