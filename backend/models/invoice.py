from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class InvoiceItem(BaseModel):
    name: str
    quantity: int
    price: float
    total: float

class InvoiceData(BaseModel):
    merchant_name: Optional[str] = None
    date: Optional[str] = None
    items: List[InvoiceItem]
    subtotal: float
    tax: float
    service_charge: Optional[float] = 0
    total: float

class InvoiceResponse(BaseModel):
    id: str
    image_url: str
    data: InvoiceData
    created_at: datetime
