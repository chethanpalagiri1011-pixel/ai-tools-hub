from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.schemas.address import AddressCreate, AddressUpdate, AddressResponse
from app.services.address_service import AddressService
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[AddressResponse])
async def list_addresses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer: List all saved delivery addresses."""
    return await AddressService.list_user_addresses(db, current_user)

@router.post("", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
async def create_address(
    addr_in: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer: Save a new delivery address."""
    return await AddressService.create_address(db, current_user, addr_in)

@router.put("/{address_id}", response_model=AddressResponse)
async def update_address(
    address_id: int,
    addr_in: AddressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer: Edit an existing saved delivery address."""
    return await AddressService.update_address(db, current_user, address_id, addr_in)

@router.delete("/{address_id}")
async def delete_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer: Delete a saved delivery address."""
    return await AddressService.delete_address(db, current_user, address_id)
