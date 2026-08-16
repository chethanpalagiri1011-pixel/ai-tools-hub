from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.user import User
from app.schemas.user import UserUpdate, UserAdminUpdate, UserResponse
from app.utils.security import get_password_hash

class UserService:
    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> UserResponse:
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return UserResponse.model_validate(user)

    @staticmethod
    async def update_profile(db: AsyncSession, user: User, update_data: UserUpdate) -> UserResponse:
        if update_data.name is not None:
            user.name = update_data.name
        if update_data.phone is not None:
            user.phone = update_data.phone
        if update_data.email is not None and update_data.email != user.email:
            # Check uniqueness
            result = await db.execute(select(User).filter(User.email == update_data.email))
            if result.scalars().first():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already taken")
            user.email = update_data.email
        if update_data.password:
            user.hashed_password = get_password_hash(update_data.password)

        await db.commit()
        await db.refresh(user)
        return UserResponse.model_validate(user)

    @staticmethod
    async def list_all_users(db: AsyncSession) -> List[UserResponse]:
        result = await db.execute(select(User).order_by(User.id.desc()))
        users = result.scalars().all()
        return [UserResponse.model_validate(u) for u in users]

    @staticmethod
    async def admin_update_user(db: AsyncSession, user_id: int, update_data: UserAdminUpdate) -> UserResponse:
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        if update_data.name is not None:
            user.name = update_data.name
        if update_data.email is not None and update_data.email != user.email:
            user.email = update_data.email
        if update_data.phone is not None:
            user.phone = update_data.phone
        if update_data.role is not None:
            user.role = update_data.role
        if update_data.is_active is not None:
            user.is_active = update_data.is_active

        await db.commit()
        await db.refresh(user)
        return UserResponse.model_validate(user)
