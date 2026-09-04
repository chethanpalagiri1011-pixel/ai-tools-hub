from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    old_price: Optional[float] = None
    emoji: Optional[str] = "📦"
    image_url: Optional[str] = None
    badge: Optional[str] = None
    tag: Optional[str] = None
    rating: Optional[float] = 5.0
    reviews_count: Optional[int] = 0
    colors: Optional[List[str]] = []
    stock: Optional[int] = 100
    is_active: Optional[bool] = True
    category_id: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    old_price: Optional[float] = None
    emoji: Optional[str] = None
    image_url: Optional[str] = None
    badge: Optional[str] = None
    tag: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    colors: Optional[List[str]] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None
    category_id: Optional[int] = None

class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seller_id: Optional[int] = None
    category_name: Optional[str] = None
    created_at: datetime
