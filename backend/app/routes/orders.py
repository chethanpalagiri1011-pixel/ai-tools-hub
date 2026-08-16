from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.schemas.order import OrderCheckoutRequest, OrderResponse, OrderStatusUpdate
from app.services.order_service import OrderService
from app.utils.dependencies import get_current_user, require_role
from app.models.user import User, UserRole

router = APIRouter()

@router.post("/checkout", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def checkout_order(
    checkout_in: OrderCheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer: Place order, process mock payment, update stock, and clear cart."""
    return await OrderService.checkout(db, current_user, checkout_in)

@router.get("", response_model=List[OrderResponse])
async def list_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer/Admin: View order history. Customers view their own; Admins view all."""
    return await OrderService.list_user_orders(db, current_user)

@router.get("/{id_or_tracking}", response_model=OrderResponse)
async def get_order_details(
    id_or_tracking: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer/Admin: View detailed status & item breakdown for a specific order."""
    return await OrderService.get_order(db, id_or_tracking, current_user)

@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    status_in: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_role([UserRole.ADMIN]))
):
    """Admin-only: Update fulfillment status (shipped, delivered, cancelled)."""
    return await OrderService.update_order_status(db, order_id, status_in)
