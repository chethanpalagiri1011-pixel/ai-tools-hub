from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.payment import PaymentStatus

class PaymentCreateRequest(BaseModel):
    order_id: int
    payment_method: Optional[str] = "mock_card"

class PaymentResponse(BaseModel):
    id: int
    transaction_id: str
    order_id: int
    amount: float
    payment_method: str
    status: PaymentStatus
    gateway_response: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
