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
async def test_phase2_product_details_and_cart_quantity():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Fetch list of products
        res = await ac.get("/api/v1/products")
        assert res.status_code == 200
        products = res.json()
        assert len(products) > 0
        first_product_id = products[0]["id"]

        # Fetch single product details via GET /api/v1/products/{id}
        prod_res = await ac.get(f"/api/v1/products/{first_product_id}")
        assert prod_res.status_code == 200
        prod = prod_res.json()
        assert prod["id"] == first_product_id
        assert "name" in prod
        assert "price" in prod
        assert "stock" in prod

        # Fetch invalid product ID (returns 404)
        invalid_res = await ac.get("/api/v1/products/999999")
        assert invalid_res.status_code == 404

        # Register a test user
        reg_res = await ac.post("/api/v1/auth/register", json={
            "name": "Phase2 Tester",
            "email": "phase2tester@shopeasy.com",
            "password": "Password123!"
        })
        assert reg_res.status_code == 201
        token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Add to cart with custom quantity (e.g. qty=3)
        add_cart_res = await ac.post("/api/v1/cart/items", headers=headers, json={
            "product_id": first_product_id,
            "quantity": 3
        })
        assert add_cart_res.status_code == 201

        # Fetch cart and verify quantity
        cart_res = await ac.get("/api/v1/cart", headers=headers)
        assert cart_res.status_code == 200
        cart = cart_res.json()
        assert len(cart["items"]) == 1
        assert cart["items"][0]["product_id"] == first_product_id
        assert cart["items"][0]["quantity"] == 3
