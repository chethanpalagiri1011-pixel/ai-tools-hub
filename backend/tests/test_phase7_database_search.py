import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_phase7_database_driven_search_and_chatbot():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        
        # 1. TEST 1: "I need a phone" -> Live PostgreSQL query
        res1 = await ac.post("/api/v1/chatbot/message", json={"message": "I need a phone"})
        assert res1.status_code == 200
        data1 = res1.json()
        assert "products" in data1
        assert len(data1["products"]) > 0
        for p in data1["products"]:
            assert p["stock"] > 0
            assert "phone" in p["name"].lower() or "smartphone" in p["name"].lower() or "mobile" in p["name"].lower() or "charger" in p["name"].lower()

        # 2. TEST 2: "I need a phone under ₹30,000" -> Budget query
        res2 = await ac.post("/api/v1/chatbot/message", json={"message": "I need a phone under ₹30,000"})
        assert res2.status_code == 200
        data2 = res2.json()
        assert len(data2["products"]) > 0
        for p in data2["products"]:
            assert p["price"] <= 30000.0
            assert p["stock"] > 0

        # 3. TEST 3: Exact Model Search for existing product ("Samsung Galaxy A54")
        res3 = await ac.post("/api/v1/chatbot/message", json={"message": "Samsung Galaxy A54"})
        assert res3.status_code == 200
        data3 = res3.json()
        assert len(data3["products"]) > 0
        assert "Samsung Galaxy A54" in data3["products"][0]["name"]

        # 4. TEST 4: Non-existent product ("iPhone 17") -> Zero hallucinated products
        res4 = await ac.post("/api/v1/chatbot/message", json={"message": "I need iPhone 17"})
        assert res4.status_code == 200
        data4 = res4.json()
        assert len(data4["products"]) == 0
        assert "currently not available" in data4["message"]

        # 5. TEST 5: Brand search ("Show Samsung phones") -> Only Samsung products
        res5 = await ac.post("/api/v1/chatbot/message", json={"message": "Show Samsung phones"})
        assert res5.status_code == 200
        data5 = res5.json()
        assert len(data5["products"]) > 0
        for p in data5["products"]:
            assert "samsung" in p["name"].lower()

        # 6. TEST 6: Dedicated Search API GET /api/v1/products/search
        search_res = await ac.get("/api/v1/products/search?q=laptop&max_price=200000&in_stock=true")
        assert search_res.status_code == 200
        search_data = search_res.json()
        assert "total" in search_data
        assert "items" in search_data
        assert search_data["total"] >= 1
        for item in search_data["items"]:
            assert item["price"] <= 200000.0
            assert item["stock"] > 0
