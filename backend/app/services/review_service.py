from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from fastapi import HTTPException, status
from typing import List

from app.models.review import Review
from app.models.product import Product
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse, ProductReviewSummary

class ReviewService:
    @staticmethod
    async def get_product_reviews(db: AsyncSession, product_id: int) -> ProductReviewSummary:
        res = await db.execute(
            select(Review)
            .options(selectinload(Review.user))
            .filter(Review.product_id == product_id)
            .order_by(Review.created_at.desc())
        )
        reviews = res.scalars().all()

        review_responses = []
        total_rating = 0.0

        for r in reviews:
            total_rating += r.rating
            user_name = r.user.name if r.user else "Customer"
            review_responses.append(
                ReviewResponse(
                    id=r.id,
                    user_id=r.user_id,
                    user_name=user_name,
                    product_id=r.product_id,
                    rating=r.rating,
                    comment=r.comment,
                    created_at=r.created_at
                )
            )

        avg_rating = round(total_rating / len(reviews), 1) if reviews else 5.0

        return ProductReviewSummary(
            average_rating=avg_rating,
            reviews_count=len(reviews),
            reviews=review_responses
        )

    @staticmethod
    async def create_review(db: AsyncSession, user: User, product_id: int, review_in: ReviewCreate) -> ReviewResponse:
        # Check product
        p_res = await db.execute(select(Product).filter(Product.id == product_id))
        product = p_res.scalars().first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        # Check existing review by user
        r_res = await db.execute(
            select(Review).filter(Review.user_id == user.id, Review.product_id == product_id)
        )
        existing = r_res.scalars().first()

        if existing:
            existing.rating = review_in.rating
            existing.comment = review_in.comment
            review_obj = existing
        else:
            review_obj = Review(
                user_id=user.id,
                product_id=product_id,
                rating=review_in.rating,
                comment=review_in.comment
            )
            db.add(review_obj)

        await db.commit()
        await db.refresh(review_obj)

        # Update product average rating & review count
        all_reviews = await db.execute(select(Review.rating).filter(Review.product_id == product_id))
        ratings = [r[0] for r in all_reviews.all()]
        product.rating = round(sum(ratings) / len(ratings), 1) if ratings else 5.0
        product.reviews_count = len(ratings)
        await db.commit()

        return ReviewResponse(
            id=review_obj.id,
            user_id=user.id,
            user_name=user.name,
            product_id=product_id,
            rating=review_obj.rating,
            comment=review_obj.comment,
            created_at=review_obj.created_at
        )

    @staticmethod
    async def delete_review(db: AsyncSession, user: User, review_id: int) -> dict:
        r_res = await db.execute(select(Review).filter(Review.id == review_id))
        review = r_res.scalars().first()
        if not review:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

        if user.role != "admin" and review.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        prod_id = review.product_id
        await db.delete(review)
        await db.commit()

        # Recalculate product rating
        p_res = await db.execute(select(Product).filter(Product.id == prod_id))
        product = p_res.scalars().first()
        if product:
            all_reviews = await db.execute(select(Review.rating).filter(Review.product_id == prod_id))
            ratings = [r[0] for r in all_reviews.all()]
            product.rating = round(sum(ratings) / len(ratings), 1) if ratings else 5.0
            product.reviews_count = len(ratings)
            await db.commit()

        return {"message": "Review deleted successfully"}
