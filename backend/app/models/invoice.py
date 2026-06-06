from typing import List, Literal, Any, Dict, Optional
from pydantic import BaseModel
from datetime import datetime


class InvoiceItem(BaseModel):
    name: str
    price: float
    quantity: int
    subtotal: float


class Invoice(BaseModel):
    currency: Literal["IDR", "USD"]
    subtotal: float
    tax: float
    service_charge: float
    total: float
    items: List[InvoiceItem]


class SavedInvoiceResponse(BaseModel):
    id: int
    name: str
    invoice_data: Invoice
    chat_history: List[Dict[str, Any]]
    split_data: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

