import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_order_checkout_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Register user
        reg_res = await ac.post("/api/v1/auth/register", json={
            "name": "Order Tester",
            "email": "order_user@example.com",
            "password": "password123"
        })
        token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Add item to cart
        await ac.post("/api/v1/cart/items", json={"product_id": 1, "quantity": 1}, headers=headers)

        # Checkout
        checkout_res = await ac.post("/api/v1/orders/checkout", json={
            "shipping_address": "123 Test St",
            "coupon_code": "SAVE10",
            "payment_method": "mock_card"
        }, headers=headers)

        assert checkout_res.status_code == 201
        order = checkout_res.json()
        assert order["status"] == "paid"
        assert len(order["items"]) == 1
        assert order["discount"] > 0
