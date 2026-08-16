from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.schemas.user import UserUpdate, UserAdminUpdate, UserResponse
from app.services.user_service import UserService
from app.utils.dependencies import get_current_user, require_role
from app.models.user import User, UserRole

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Fetch current user's profile details."""
    return UserResponse.model_validate(current_user)

@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user's own profile (name, email, phone, password). Role cannot be changed here."""
    return await UserService.update_profile(db, current_user, update_data)

@router.get("", response_model=List[UserResponse])
async def list_all_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_role([UserRole.ADMIN]))
):
    """Admin-only: List all registered users."""
    return await UserService.list_all_users(db)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_role([UserRole.ADMIN]))
):
    """Admin-only: Get user details by ID."""
    return await UserService.get_user_by_id(db, user_id)

@router.put("/{user_id}", response_model=UserResponse)
async def admin_update_user(
    user_id: int,
    update_data: UserAdminUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_role([UserRole.ADMIN]))
):
    """Admin-only: Update user roles, active status, or profile info."""
    return await UserService.admin_update_user(db, user_id, update_data)
