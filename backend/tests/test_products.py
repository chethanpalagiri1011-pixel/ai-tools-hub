import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_list_products_and_details():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # List products
        response = await ac.get("/api/v1/products")
        assert response.status_code == 200
        products = response.json()
        assert isinstance(products, list)
        assert len(products) > 0

        # Get details of first product
        prod_id = products[0]["id"]
        detail_res = await ac.get(f"/api/v1/products/{prod_id}")
        assert detail_res.status_code == 200
        assert detail_res.json()["id"] == prod_id
