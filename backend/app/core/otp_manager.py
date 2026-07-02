import random
import string
import time
from typing import Optional

# In-memory OTP store: { email: { otp, expires_at, name, password } }
_otp_store: dict = {}

OTP_EXPIRY_SECONDS = 600  # 10 minutes

def generate_otp() -> str:
    """Generate a 6-digit numeric OTP."""
    return "".join(random.choices(string.digits, k=6))

def store_otp(email: str, otp: str, name: str, password_hash: str):
    """Store OTP with registration data and expiry."""
    _otp_store[email.lower()] = {
        "otp": otp,
        "expires_at": time.time() + OTP_EXPIRY_SECONDS,
        "name": name,
        "password_hash": password_hash,
        "attempts": 0,
    }

def verify_otp(email: str, otp: str) -> dict:
    """
    Verify OTP for an email.
    Returns: { valid: bool, data: dict | None, error: str | None }
    """
    key = email.lower()
    record = _otp_store.get(key)

    if not record:
        return {"valid": False, "error": "No OTP found. Please request a new one."}

    if time.time() > record["expires_at"]:
        del _otp_store[key]
        return {"valid": False, "error": "OTP has expired. Please request a new one."}

    record["attempts"] += 1
    if record["attempts"] > 5:
        del _otp_store[key]
        return {"valid": False, "error": "Too many attempts. Please request a new OTP."}

    if record["otp"] != otp.strip():
        remaining = 5 - record["attempts"]
        return {"valid": False, "error": f"Incorrect OTP. {remaining} attempts left."}

    # Valid — return stored registration data and clean up
    data = {
        "name": record["name"],
        "password_hash": record["password_hash"],
    }
    del _otp_store[key]
    return {"valid": True, "data": data, "error": None}

def get_otp_for_debug(email: str) -> Optional[str]:
    """Debug helper — returns current OTP for an email (dev only)."""
    record = _otp_store.get(email.lower())
    return record["otp"] if record else None
