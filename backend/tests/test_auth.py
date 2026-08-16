import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "connected"}

@pytest.mark.asyncio
async def test_user_registration_and_login():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Register
        reg_payload = {
            "name": "Test Customer",
            "email": "customer_test@example.com",
            "password": "password123",
            "phone": "+1234567890",
            "role": "customer"
        }
        res_reg = await ac.post("/api/v1/auth/register", json=reg_payload)
        assert res_reg.status_code == 201
        data = res_reg.json()
        assert "access_token" in data
        assert data["user"]["email"] == "customer_test@example.com"

        # Login
        login_payload = {
            "email": "customer_test@example.com",
            "password": "password123"
        }
        res_login = await ac.post("/api/v1/auth/login", json=login_payload)
        assert res_login.status_code == 200
        assert "access_token" in res_login.json()
