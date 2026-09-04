import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_complete_phase6_checkout_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register & Login Customer
        email = "phase6_test@shopeasy.com"
        password = "password123"
        reg_res = await ac.post("/api/v1/auth/register", json={
            "name": "Phase6 Tester",
            "email": email,
            "password": password,
            "phone": "9876543210"
        })
        assert reg_res.status_code in [201, 400]

        login_res = await ac.post("/api/v1/auth/login", json={
            "email": email,
            "password": password
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get Products & Add to Cart
        prod_res = await ac.get("/api/v1/products?limit=5")
        assert prod_res.status_code == 200
        products = prod_res.json()
        assert len(products) > 0
        target_product = products[0]
        initial_stock = target_product["stock"]

        cart_add_res = await ac.post("/api/v1/cart/items", json={
            "product_id": target_product["id"],
            "quantity": 2
        }, headers=headers)
        assert cart_add_res.status_code == 201

        # 3. Address API: Invalid Mobile Validation Test
        invalid_addr = await ac.post("/api/v1/addresses", json={
            "full_name": "Phase6 Tester",
            "mobile": "123",  # Invalid
            "house_no": "123",
            "street": "MG Road",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "560001"
        }, headers=headers)
        assert invalid_addr.status_code == 422

        # 4. Address API: Save Valid Address
        valid_addr_res = await ac.post("/api/v1/addresses", json={
            "full_name": "Phase6 Tester",
            "mobile": "9876543210",
            "house_no": "456, Palm Heights",
            "street": "Indiranagar 100ft Road",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "560038",
            "address_type": "Home",
            "is_default": True
        }, headers=headers)
        assert valid_addr_res.status_code == 201
        addr_data = valid_addr_res.json()
        assert addr_data["city"] == "Bengaluru"

        # 5. List Saved Addresses
        list_addr_res = await ac.get("/api/v1/addresses", headers=headers)
        assert list_addr_res.status_code == 200
        assert len(list_addr_res.json()) >= 1

        # 6. Checkout Order
        checkout_res = await ac.post("/api/v1/orders/checkout", json={
            "shipping_address": f"{addr_data['full_name']}, {addr_data['house_no']}, {addr_data['street']}, {addr_data['city']} - {addr_data['pincode']}",
            "payment_method": "mock_upi"
        }, headers=headers)
        assert checkout_res.status_code == 201
        order_data = checkout_res.json()
        assert order_data["status"] == "confirmed"
        order_id = order_data["id"]

        # Verify stock deduction
        prod_check_res = await ac.get(f"/api/v1/products/{target_product['id']}")
        assert prod_check_res.json()["stock"] == initial_stock - 2

        # 7. Get My Orders
        orders_res = await ac.get("/api/v1/orders", headers=headers)
        assert orders_res.status_code == 200
        assert any(o["id"] == order_id for o in orders_res.json())

        # 8. Cancel Order & Verify Stock Return
        cancel_res = await ac.post(f"/api/v1/orders/{order_id}/cancel", headers=headers)
        assert cancel_res.status_code == 200
        assert cancel_res.json()["status"] == "cancelled"

        prod_restored_res = await ac.get(f"/api/v1/products/{target_product['id']}")
        assert prod_restored_res.json()["stock"] == initial_stock
