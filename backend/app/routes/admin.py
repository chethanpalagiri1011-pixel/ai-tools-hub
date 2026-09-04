from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.database import get_db
from app.services.admin_service import AdminService
from app.utils.dependencies import require_role
from app.models.user import User, UserRole

router = APIRouter()

@router.get("/dashboard")
async def get_admin_dashboard(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_role([UserRole.ADMIN]))
) -> Dict[str, Any]:
    """Admin-only: Retrieve marketplace sales, orders, products, low stock alerts, and user metrics."""
    return await AdminService.get_admin_dashboard(db)

@router.get("/seller/dashboard")
async def get_seller_dashboard(
    db: AsyncSession = Depends(get_db),
    seller: User = Depends(require_role([UserRole.ADMIN, UserRole.SELLER]))
) -> Dict[str, Any]:
    """Admin/Seller: Retrieve seller product metrics and inventory status."""
    return await AdminService.get_seller_dashboard(db, seller.id)
