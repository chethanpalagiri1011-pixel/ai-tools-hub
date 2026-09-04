from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.review import ReviewCreate, ReviewResponse, ProductReviewSummary
from app.services.review_service import ReviewService
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/products/{product_id}/reviews", response_model=ProductReviewSummary)
async def get_product_reviews(product_id: int, db: AsyncSession = Depends(get_db)):
    """Public API: Get reviews and average rating for a specific product."""
    return await ReviewService.get_product_reviews(db, product_id)

@router.post("/products/{product_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_product_review(
    product_id: int,
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer: Submit rating and review comment for a product."""
    return await ReviewService.create_review(db, current_user, product_id, review_in)

@router.delete("/reviews/{review_id}")
async def delete_product_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer/Admin: Delete product review."""
    return await ReviewService.delete_review(db, current_user, review_id)
