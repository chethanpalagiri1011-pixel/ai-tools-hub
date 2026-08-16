import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_cart_operations():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Register user
        reg_res = await ac.post("/api/v1/auth/register", json={
            "name": "Cart Tester",
            "email": "cart_user@example.com",
            "password": "password123"
        })
        token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Add product to cart
        add_res = await ac.post("/api/v1/cart/items", json={"product_id": 1, "quantity": 2}, headers=headers)
        assert add_res.status_code == 201
        cart_data = add_res.json()
        assert cart_data["item_count"] == 2

        # View cart
        view_res = await ac.get("/api/v1/cart", headers=headers)
        assert view_res.status_code == 200
        assert len(view_res.json()["items"]) == 1
