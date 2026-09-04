import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_reviews_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Register user
        reg = await ac.post("/api/v1/auth/register", json={
            "name": "Reviewer User",
            "email": "reviewer_user@example.com",
            "password": "password123"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Post review for product 1
        post_res = await ac.post("/api/v1/products/1/reviews", json={
            "rating": 5.0,
            "comment": "Amazing sound quality!"
        }, headers=headers)
        assert post_res.status_code == 201
        review_data = post_res.json()
        assert review_data["rating"] == 5.0

        # View reviews for product 1
        get_res = await ac.get("/api/v1/products/1/reviews")
        assert get_res.status_code == 200
        summary = get_res.json()
        assert summary["reviews_count"] >= 1
        assert summary["average_rating"] > 0
