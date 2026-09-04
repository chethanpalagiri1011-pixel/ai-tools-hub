import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from app.config import settings

@pytest.mark.asyncio
async def test_phase8_mobile_otp_authentication_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        
        # 1. Invalid Mobile Format Test
        invalid_res = await ac.post("/api/v1/auth/send-otp", json={"phone": "12345"})
        assert invalid_res.status_code == 400
        assert "valid 10-digit Indian mobile number" in invalid_res.json()["detail"]

        # 2. Production Mode Execution Test (OTP_DEVELOPMENT_MODE=False)
        original_dev_mode = settings.OTP_DEVELOPMENT_MODE
        settings.OTP_DEVELOPMENT_MODE = False
        prod_res = await ac.post("/api/v1/auth/send-otp", json={"phone": "+919999988888"})
        assert prod_res.status_code == 200
        assert prod_res.json()["provider"] in ["TWILIO", "TWILIO_PENDING_CREDENTIALS"]

        # 3. Test Offline Dev Mode Execution for Test Suite (OTP_DEVELOPMENT_MODE=True)
        settings.OTP_DEVELOPMENT_MODE = True
        test_phone = "+919111122222"
        send_res = await ac.post("/api/v1/auth/send-otp", json={"phone": test_phone})
        assert send_res.status_code == 200
        send_data = send_res.json()
        assert send_data["resend_cooldown_seconds"] == 30
        dev_otp = send_data.get("dev_otp")
        assert dev_otp is not None
        assert len(dev_otp) == 6

        # 4. Rate Limiting Test (Send OTP again within 30s -> 429)
        cooldown_res = await ac.post("/api/v1/auth/send-otp", json={"phone": test_phone})
        assert cooldown_res.status_code == 429
        assert "seconds before requesting another OTP" in cooldown_res.json()["detail"]

        # 5. Invalid OTP Test
        bad_otp_res = await ac.post("/api/v1/auth/verify-otp", json={"phone": test_phone, "otp": "000000"})
        assert bad_otp_res.status_code == 400
        assert "incorrect" in bad_otp_res.json()["detail"]

        # 6. Verify Valid OTP for New User -> Prompts Profile Completion
        verify_res = await ac.post("/api/v1/auth/verify-otp", json={"phone": test_phone, "otp": dev_otp})
        assert verify_res.status_code == 200
        verify_data = verify_res.json()
        assert verify_data["is_new_user"] is True

        # 7. Complete Profile for New User
        profile_res = await ac.post("/api/v1/auth/complete-profile", json={
            "phone": test_phone,
            "name": "Phase8 Real SMS User",
            "email": "realsms_user@shopeasy.com"
        })
        assert profile_res.status_code == 201
        profile_data = profile_res.json()
        assert "access_token" in profile_data
        token = profile_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 8. Test Protected API Access with OTP JWT Token
        me_res = await ac.get("/api/v1/users/me", headers=headers)
        assert me_res.status_code == 200
        assert me_res.json()["name"] == "Phase8 Real SMS User"

        # Restore original dev_mode
        settings.OTP_DEVELOPMENT_MODE = original_dev_mode
