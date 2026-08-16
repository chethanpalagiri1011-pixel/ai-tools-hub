from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.product_service import ProductService
from app.utils.dependencies import get_current_user, require_role
from app.models.user import User, UserRole

router = APIRouter()

@router.get("", response_model=List[ProductResponse])
async def list_products(
    search: Optional[str] = Query(None, description="Search term for product name or description"),
    category: Optional[str] = Query(None, description="Filter by category name or slug"),
    tag: Optional[str] = Query(None, description="Filter by tag (sale, new, popular, trending)"),
    sort: Optional[str] = Query(None, description="Sort order: price-low, price-high, rating, name"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Public API: Fetch list of products with search, category/tag filtering, sorting, and pagination."""
    return await ProductService.list_products(
        db, search=search, category=category, tag=tag, sort=sort, skip=skip, limit=limit
    )

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product_details(product_id: int, db: AsyncSession = Depends(get_db)):
    """Public API: Get detailed product info by ID."""
    return await ProductService.get_product_by_id(db, product_id)

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role([UserRole.ADMIN, UserRole.SELLER]))
):
    """Admin/Seller: Add a new product to inventory."""
    return await ProductService.create_product(db, product_in, seller_id=user.id)

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role([UserRole.ADMIN, UserRole.SELLER]))
):
    """Admin/Seller: Update an existing product."""
    return await ProductService.update_product(db, product_id, product_in, user)

@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role([UserRole.ADMIN, UserRole.SELLER]))
):
    """Admin/Seller: Deactivate/delete a product."""
    return await ProductService.delete_product(db, product_id, user)
