from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.database import get_db
from app.schemas.product import ProductResponse
from app.services.recommendation_service import RecommendationService
from app.utils.dependencies import get_current_user_optional
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[ProductResponse])
async def get_recommendations(
    limit: int = Query(4, ge=1, le=20),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """AI/Rule Recommendation Engine: Returns personalized product recommendations based on cart & history."""
    user_id = current_user.id if current_user else None
    return await RecommendationService.get_recommendations_for_user(db, user_id=user_id, limit=limit)

@router.get("/{user_id}", response_model=List[ProductResponse])
async def get_recommendations_for_user_id(
    user_id: int,
    limit: int = Query(4, ge=1, le=20),
    db: AsyncSession = Depends(get_db)
):
    """Targeted recommendation for specific user ID."""
    return await RecommendationService.get_recommendations_for_user(db, user_id=user_id, limit=limit)
