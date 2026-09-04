import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_wishlist_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Register user
        reg = await ac.post("/api/v1/auth/register", json={
            "name": "Wishlist User",
            "email": "wishlist_user@example.com",
            "password": "password123"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Add to wishlist
        add_res = await ac.post("/api/v1/wishlist/items", json={"product_id": 1}, headers=headers)
        assert add_res.status_code == 201

        # View wishlist
        view_res = await ac.get("/api/v1/wishlist", headers=headers)
        assert view_res.status_code == 200
        items = view_res.json()
        assert len(items) == 1
        assert items[0]["product_id"] == 1

        # Move to cart
        move_res = await ac.post("/api/v1/wishlist/items/1/move-to-cart", headers=headers)
        assert move_res.status_code == 200

        # Check cart
        cart_res = await ac.get("/api/v1/cart", headers=headers)
        assert cart_res.json()["item_count"] == 1
