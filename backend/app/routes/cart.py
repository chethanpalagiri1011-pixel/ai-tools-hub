from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database import get_db
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartSummaryResponse
from app.services.cart_service import CartService
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("", response_model=CartSummaryResponse)
async def get_cart(
    coupon_code: Optional[str] = Query(None, description="Optional coupon code (SAVE10, SAVE20)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer: View items, subtotal, discounts, shipping, and total for current user cart."""
    return await CartService.get_user_cart(db, current_user.id, coupon_code=coupon_code)

@router.post("/items", response_model=CartSummaryResponse, status_code=status.HTTP_201_CREATED)
async def add_item_to_cart(
    cart_in: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer: Add product to cart."""
    return await CartService.add_to_cart(db, current_user.id, cart_in)

@router.put("/items/{item_id}", response_model=CartSummaryResponse)
async def update_cart_item(
    item_id: int,
    item_in: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer: Update cart item quantity."""
    return await CartService.update_cart_item(db, current_user.id, item_id, item_in)

@router.delete("/items/{item_id}", response_model=CartSummaryResponse)
async def remove_item_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer: Remove specific item from cart."""
    return await CartService.remove_cart_item(db, current_user.id, item_id)

@router.delete("")
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer: Empty all items from shopping cart."""
    await CartService.clear_cart(db, current_user.id)
    return {"message": "Cart cleared successfully"}
