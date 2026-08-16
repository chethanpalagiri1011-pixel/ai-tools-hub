from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.utils.security import verify_password, get_password_hash, create_access_token

class AuthService:
    @staticmethod
    async def register(db: AsyncSession, user_data: UserCreate) -> TokenResponse:
        # Check if email already exists
        result = await db.execute(select(User).filter(User.email == user_data.email))
        existing_user = result.scalars().first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        
        hashed_pw = get_password_hash(user_data.password)
        new_user = User(
            name=user_data.name,
            email=user_data.email,
            hashed_password=hashed_pw,
            phone=user_data.phone,
            role=user_data.role or UserRole.CUSTOMER
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        token = create_access_token(subject=new_user.id)
        return TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(new_user)
        )

    @staticmethod
    async def login(db: AsyncSession, login_data: UserLogin) -> TokenResponse:
        result = await db.execute(select(User).filter(User.email == login_data.email))
        user = result.scalars().first()
        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is inactive"
            )

        token = create_access_token(subject=user.id)
        return TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user)
        )
