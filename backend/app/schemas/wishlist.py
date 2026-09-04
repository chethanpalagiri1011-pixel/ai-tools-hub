from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.schemas.product import ProductResponse

class WishlistItemCreate(BaseModel):
    product_id: int

class WishlistItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    product_id: int
    created_at: datetime
    product: ProductResponse
