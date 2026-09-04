from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.address import Address
from app.models.user import User
from app.schemas.address import AddressCreate, AddressUpdate, AddressResponse

class AddressService:
    @staticmethod
    async def list_user_addresses(db: AsyncSession, user: User) -> List[AddressResponse]:
        res = await db.execute(
            select(Address)
            .filter(Address.user_id == user.id)
            .order_by(Address.is_default.desc(), Address.id.desc())
        )
        addresses = res.scalars().all()
        return [AddressResponse.model_validate(a) for a in addresses]

    @staticmethod
    async def create_address(db: AsyncSession, user: User, addr_in: AddressCreate) -> AddressResponse:
        # If set as default, unset previous default addresses
        if addr_in.is_default:
            prev_res = await db.execute(select(Address).filter(Address.user_id == user.id, Address.is_default == True))
            for prev in prev_res.scalars().all():
                prev.is_default = False

        new_addr = Address(
            user_id=user.id,
            full_name=addr_in.full_name,
            mobile=addr_in.mobile,
            house_no=addr_in.house_no,
            street=addr_in.street,
            city=addr_in.city,
            state=addr_in.state,
            pincode=addr_in.pincode,
            country=addr_in.country or "India",
            address_type=addr_in.address_type or "Home",
            is_default=addr_in.is_default or False
        )
        db.add(new_addr)
        await db.commit()
        await db.refresh(new_addr)
        return AddressResponse.model_validate(new_addr)

    @staticmethod
    async def update_address(db: AsyncSession, user: User, address_id: int, addr_in: AddressUpdate) -> AddressResponse:
        res = await db.execute(select(Address).filter(Address.id == address_id, Address.user_id == user.id))
        addr = res.scalars().first()
        if not addr:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")

        if addr_in.is_default:
            prev_res = await db.execute(select(Address).filter(Address.user_id == user.id, Address.is_default == True))
            for prev in prev_res.scalars().all():
                prev.is_default = False

        for k, v in addr_in.model_dump(exclude_unset=True).items():
            setattr(addr, k, v)

        await db.commit()
        await db.refresh(addr)
        return AddressResponse.model_validate(addr)

    @staticmethod
    async def delete_address(db: AsyncSession, user: User, address_id: int) -> dict:
        res = await db.execute(select(Address).filter(Address.id == address_id, Address.user_id == user.id))
        addr = res.scalars().first()
        if not addr:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")

        await db.delete(addr)
        await db.commit()
        return {"message": "Address deleted successfully"}
