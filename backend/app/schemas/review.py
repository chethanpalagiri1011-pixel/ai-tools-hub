from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime

class ReviewCreate(BaseModel):
    rating: float = Field(..., ge=1.0, le=5.0)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    user_name: Optional[str] = "Customer"
    product_id: int
    rating: float
    comment: Optional[str]
    created_at: datetime

class ProductReviewSummary(BaseModel):
    average_rating: float
    reviews_count: int
    reviews: List[ReviewResponse]
