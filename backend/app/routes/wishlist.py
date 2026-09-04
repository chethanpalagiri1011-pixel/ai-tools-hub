from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.schemas.wishlist import WishlistItemCreate, WishlistItemResponse
from app.services.wishlist_service import WishlistService
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[WishlistItemResponse])
async def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer: View all products saved in current user's wishlist."""
    return await WishlistService.get_user_wishlist(db, current_user.id)

@router.post("/items", response_model=WishlistItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(
    wish_in: WishlistItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer: Add product to wishlist."""
    return await WishlistService.add_to_wishlist(db, current_user.id, wish_in.product_id)

@router.delete("/items/{product_id}")
async def remove_from_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer: Remove product from wishlist."""
    return await WishlistService.remove_from_wishlist(db, current_user.id, product_id)

@router.post("/items/{product_id}/move-to-cart")
async def move_wishlist_to_cart(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer: Move product from wishlist directly to shopping cart."""
    return await WishlistService.move_to_cart(db, current_user.id, product_id)
