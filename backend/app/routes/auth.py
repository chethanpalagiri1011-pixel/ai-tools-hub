from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.services.auth_service import AuthService
from app.services.otp_service import OtpService
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

class SendOTPRequest(BaseModel):
    phone: str = Field(..., description="10-digit Indian mobile number")

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str = Field(..., min_length=6, max_length=6)

class CompleteProfileRequest(BaseModel):
    phone: str
    name: str = Field(..., min_length=2, max_length=100)
    email: Optional[str] = None

@router.post("/send-otp", status_code=status.HTTP_200_OK)
async def send_otp(req: SendOTPRequest, db: AsyncSession = Depends(get_db)):
    """Validate Indian mobile number, rate limit requests, and dispatch 6-digit OTP."""
    return await OtpService.send_otp(db, req.phone)

@router.post("/verify-otp", status_code=status.HTTP_200_OK)
async def verify_otp(req: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    """Verify hashed OTP, validate expiration & attempts limit, and issue JWT or prompt profile completion."""
    return await OtpService.verify_otp(db, req.phone, req.otp)

@router.post("/complete-profile", status_code=status.HTTP_201_CREATED)
async def complete_profile(req: CompleteProfileRequest, db: AsyncSession = Depends(get_db)):
    """Create customer profile for verified phone number and return JWT token."""
    return await OtpService.complete_profile(db, req.phone, req.name, req.email)

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Legacy/Admin Register: Register a new user."""
    return await AuthService.register(db, user_data)

@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Legacy/Admin Login: Authenticate user via password and return JWT access token."""
    return await AuthService.login(db, login_data)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get profile of current authenticated user."""
    return UserResponse.model_validate(current_user)

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh access token for logged-in user."""
    from app.utils.security import create_access_token
    token = create_access_token(subject=current_user.id)
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(current_user)
    )
