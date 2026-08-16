from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Callable

from app.database import get_db
from app.models.user import User, UserRole
from app.utils.security import decode_access_token
from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login", auto_error=False)

async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    user_id = payload["sub"]
    try:
        user_id_int = int(user_id)
    except ValueError:
        return None
    result = await db.execute(select(User).filter(User.id == user_id_int))
    user = result.scalars().first()
    if not user or not user.is_active:
        return None
    return user

async def get_current_user(
    token: str = Depends(OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login")),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise credentials_exception
    user_id = payload["sub"]
    try:
        user_id_int = int(user_id)
    except ValueError:
        raise credentials_exception
    
    result = await db.execute(select(User).filter(User.id == user_id_int))
    user = result.scalars().first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is inactive or non-existent"
        )
    return user

def require_role(allowed_roles: List[UserRole]) -> Callable:
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Allowed roles: {[r.value for r in allowed_roles]}"
            )
        return current_user
    return role_checker
