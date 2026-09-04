import re
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from typing import Dict, Any, Optional

from app.config import settings
from app.models.otp import OTPVerification
from app.models.user import User, UserRole
from app.services.sms_service import SmsService
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.schemas.user import UserResponse

class OtpService:
    @staticmethod
    def clean_and_validate_indian_phone(phone: str) -> str:
        clean = phone.strip().replace(" ", "").replace("-", "")
        if clean.startswith("+91"):
            num = clean[3:]
        elif clean.startswith("0"):
            num = clean[1:]
        else:
            num = clean
            
        if not re.match(r"^[6-9]\d{9}$", num):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
            )
        return f"+91{num}"

    @staticmethod
    async def send_otp(db: AsyncSession, phone: str) -> Dict[str, Any]:
        formatted_phone = OtpService.clean_and_validate_indian_phone(phone)
        now = datetime.now(timezone.utc)

        # Rate Limiting: Check 30-second resend cooldown
        res = await db.execute(
            select(OTPVerification)
            .filter(OTPVerification.phone == formatted_phone)
            .order_by(OTPVerification.created_at.desc())
        )
        last_otp = res.scalars().first()

        if last_otp:
            # Handle timezone comparison
            created_at = last_otp.created_at
            if created_at and created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)
                
            time_diff = (now - created_at).total_seconds() if created_at else 999
            if time_diff < 30:
                retry_after = int(30 - time_diff)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Please wait {retry_after} seconds before requesting another OTP."
                )

        # Generate cryptographic 6-digit OTP
        otp = str(random.randint(100000, 999999))
        otp_hashed = get_password_hash(otp)
        expires_at = now + timedelta(minutes=5)

        new_otp_rec = OTPVerification(
            phone=formatted_phone,
            otp_hash=otp_hashed,
            expires_at=expires_at,
            attempts=0,
            resend_attempts=(last_otp.resend_attempts + 1) if last_otp else 1,
            verified=False
        )
        db.add(new_otp_rec)
        await db.commit()

        # Dispatch SMS
        sms_res = SmsService.send_otp_sms(formatted_phone, otp)
        
        # Mask phone number for UI display
        masked_phone = f"+91 ******{formatted_phone[-4:]}"

        resp = {
            "message": "We've sent a verification code to your mobile.",
            "phone": formatted_phone,
            "masked_phone": masked_phone,
            "resend_cooldown_seconds": 30,
            "provider": sms_res.get("provider", "TWILIO")
        }
        if settings.OTP_DEVELOPMENT_MODE and "dev_otp" in sms_res:
            resp["dev_otp"] = sms_res["dev_otp"]

        return resp

    @staticmethod
    async def verify_otp(db: AsyncSession, phone: str, otp: str) -> Dict[str, Any]:
        formatted_phone = OtpService.clean_and_validate_indian_phone(phone)
        otp_str = otp.strip()
        now = datetime.now(timezone.utc)

        # Fetch latest unverified OTP
        res = await db.execute(
            select(OTPVerification)
            .filter(OTPVerification.phone == formatted_phone, OTPVerification.verified == False)
            .order_by(OTPVerification.created_at.desc())
        )
        otp_rec = res.scalars().first()

        if not otp_rec:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No pending OTP request found for this mobile number. Please request a new OTP."
            )

        # Check maximum 5 attempts limit
        if otp_rec.attempts >= 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Too many attempts. Please request a new OTP."
            )

        # Check Expiration
        expires_at = otp_rec.expires_at
        if expires_at and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if now > expires_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP has expired. Please request a new OTP."
            )

        # Increment attempt counter
        otp_rec.attempts += 1

        # Verify Password / Hash
        if not verify_password(otp_str, otp_rec.otp_hash):
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The OTP you entered is incorrect."
            )

        # Mark OTP as verified
        otp_rec.verified = True
        await db.commit()

        # Check if User exists in PostgreSQL
        user_res = await db.execute(select(User).filter(User.phone == formatted_phone))
        user = user_res.scalars().first()

        if user:
            # Mark phone_verified
            user.phone_verified = True
            user.phone_verified_at = now
            await db.commit()
            await db.refresh(user)

            # Generate Access Token
            access_token = create_access_token(subject=user.id)
            return {
                "is_new_user": False,
                "message": "Login successful!",
                "access_token": access_token,
                "user": UserResponse.model_validate(user)
            }
        else:
            return {
                "is_new_user": True,
                "message": "Mobile number verified! Please complete your profile.",
                "phone": formatted_phone
            }

    @staticmethod
    async def complete_profile(db: AsyncSession, phone: str, name: str, email: Optional[str] = None) -> Dict[str, Any]:
        formatted_phone = OtpService.clean_and_validate_indian_phone(phone)
        name_clean = name.strip()

        if len(name_clean) < 2:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Full Name must be at least 2 characters.")

        # Ensure user does not already exist
        existing = await db.execute(select(User).filter(User.phone == formatted_phone))
        if existing.scalars().first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account already exists for this phone number.")

        now = datetime.now(timezone.utc)
        new_user = User(
            name=name_clean,
            email=email.strip().lower() if email and email.strip() else None,
            phone=formatted_phone,
            phone_verified=True,
            phone_verified_at=now,
            role=UserRole.CUSTOMER,
            is_active=True
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        access_token = create_access_token(subject=new_user.id)
        return {
            "message": "Profile created successfully!",
            "access_token": access_token,
            "user": UserResponse.model_validate(new_user)
        }
