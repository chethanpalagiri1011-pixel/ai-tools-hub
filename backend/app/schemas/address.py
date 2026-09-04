from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import re

class AddressCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    mobile: str = Field(..., description="10-digit Indian mobile number")
    house_no: str = Field(..., min_length=1, max_length=100)
    street: str = Field(..., min_length=2, max_length=200)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    pincode: str = Field(..., description="6-digit Indian PIN code")
    country: Optional[str] = "India"
    address_type: Optional[str] = "Home"  # Home, Work, Other
    is_default: Optional[bool] = False

    @field_validator("mobile")
    def validate_indian_mobile(cls, v: str) -> str:
        clean = v.strip().replace(" ", "").replace("-", "").replace("+91", "")
        if not re.match(r"^[6-9]\d{9}$", clean):
            raise ValueError("Mobile number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.")
        return clean

    @field_validator("pincode")
    def validate_indian_pincode(cls, v: str) -> str:
        clean = v.strip()
        if not re.match(r"^\d{6}$", clean):
            raise ValueError("PIN code must be a valid 6-digit Indian postal code.")
        return clean

class AddressUpdate(BaseModel):
    full_name: Optional[str] = None
    mobile: Optional[str] = None
    house_no: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: Optional[str] = None
    address_type: Optional[str] = None
    is_default: Optional[bool] = None

class AddressResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    mobile: str
    house_no: str
    street: str
    city: str
    state: str
    pincode: str
    country: str
    address_type: str
    is_default: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
