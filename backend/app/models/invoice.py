from typing import List, Literal
from pydantic import BaseModel


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
