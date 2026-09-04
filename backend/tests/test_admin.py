import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_admin_dashboard_access():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Login default seed admin
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "admin@shopeasy.com",
            "password": "admin123"
        })
        assert login_res.status_code == 200
        admin_token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {admin_token}"}

        # Fetch admin dashboard
        dash_res = await ac.get("/api/v1/admin/dashboard", headers=headers)
        assert dash_res.status_code == 200
        stats = dash_res.json()
        assert "total_users" in stats
        assert "total_products" in stats
        assert "total_revenue" in stats

        # Customer role blocked test
        cust_reg = await ac.post("/api/v1/auth/register", json={
            "name": "Normal Customer",
            "email": "normal_cust@example.com",
            "password": "password123"
        })
        cust_token = cust_reg.json()["access_token"]
        cust_headers = {"Authorization": f"Bearer {cust_token}"}

        forbidden_res = await ac.get("/api/v1/admin/dashboard", headers=cust_headers)
        assert forbidden_res.status_code == 403
