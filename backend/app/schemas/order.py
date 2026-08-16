from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.order import OrderStatus

class OrderCheckoutRequest(BaseModel):
    shipping_address: Optional[str] = "Standard Delivery Address"
    coupon_code: Optional[str] = None
    payment_method: Optional[str] = "mock_card"

class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int]
    product_name: str
    price: float
    quantity: int

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    tracking_number: str
    user_id: int
    subtotal: float
    discount: float
    shipping_fee: float
    total: float
    status: OrderStatus
    shipping_address: Optional[str]
    coupon_code: Optional[str]
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
