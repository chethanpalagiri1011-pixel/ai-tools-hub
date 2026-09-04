import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from main import app
from app.database import Base, async_engine

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

@pytest.mark.asyncio
async def test_user_profile_and_addresses():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register user directly
        reg_res = await ac.post("/api/v1/auth/register", json={
            "name": "Phase3 Test User",
            "email": "phase3user@shopeasy.com",
            "phone": "+919876543210",
            "password": "Password123!"
        })
        assert reg_res.status_code == 201
        token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Fetch profile /me
        me_res = await ac.get("/api/v1/users/me", headers=headers)
        assert me_res.status_code == 200
        user_data = me_res.json()
        assert user_data["name"] == "Phase3 Test User"
        assert user_data["email"] == "phase3user@shopeasy.com"

        # Update profile with dob, gender, avatar_url
        update_res = await ac.put("/api/v1/users/me", headers=headers, json={
            "name": "Phase3 Updated User",
            "dob": "1995-08-15",
            "gender": "Male",
            "avatar_url": "https://example.com/avatar.jpg"
        })
        assert update_res.status_code == 200
        updated = update_res.json()
        assert updated["name"] == "Phase3 Updated User"
        assert updated["dob"] == "1995-08-15"
        assert updated["gender"] == "Male"
        assert updated["avatar_url"] == "https://example.com/avatar.jpg"

        # Create saved address
        addr_res = await ac.post("/api/v1/addresses", headers=headers, json={
            "full_name": "Phase3 Updated User",
            "mobile": "9876543210",
            "house_no": "Flat 402",
            "street": "MG Road",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "560001",
            "country": "India",
            "address_type": "Home"
        })
        assert addr_res.status_code == 201
        addr = addr_res.json()
        assert addr["city"] == "Bengaluru"
        assert addr["pincode"] == "560001"

        # List saved addresses
        list_addr = await ac.get("/api/v1/addresses", headers=headers)
        assert list_addr.status_code == 200
        addrs = list_addr.json()
        assert len(addrs) >= 1
