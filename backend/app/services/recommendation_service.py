from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from typing import List, Optional
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.cart import CartItem
from app.schemas.product import ProductResponse

class RecommendationService:
    @staticmethod
    async def get_recommendations_for_user(
        db: AsyncSession,
        user_id: Optional[int] = None,
        limit: int = 4
    ) -> List[ProductResponse]:
        """
        AI/Rule-based hybrid recommendation system.
        If user_id is provided, analyzes past order items and cart activity to find preferred categories.
        Falls back to highest rated and trending/popular products.
        """
        preferred_category_ids = set()

        if user_id:
            # 1. Fetch user's cart item category IDs
            cart_res = await db.execute(
                select(Product.category_id)
                .join(CartItem, CartItem.product_id == Product.id)
                .filter(CartItem.user_id == user_id, Product.category_id.isnot(None))
            )
            for cat_id in cart_res.scalars().all():
                preferred_category_ids.add(cat_id)

            # 2. Fetch user's past order item category IDs
            order_res = await db.execute(
                select(Product.category_id)
                .join(OrderItem, OrderItem.product_id == Product.id)
                .join(Order, OrderItem.order_id == Order.id)
                .filter(Order.user_id == user_id, Product.category_id.isnot(None))
            )
            for cat_id in order_res.scalars().all():
                preferred_category_ids.add(cat_id)

        query = select(Product).filter(Product.is_active == True)

        if preferred_category_ids:
            query = query.filter(Product.category_id.in_(list(preferred_category_ids)))

        query = query.order_by(desc(Product.rating), desc(Product.reviews_count)).limit(limit)
        res = await db.execute(query)
        recommended_products = res.scalars().all()

        # If not enough category-matched products, fallback to top-rated general products
        if len(recommended_products) < limit:
            fallback_limit = limit - len(recommended_products)
            existing_ids = [p.id for p in recommended_products]
            fb_query = (
                select(Product)
                .filter(Product.is_active == True, Product.id.notin_(existing_ids) if existing_ids else True)
                .order_by(desc(Product.rating), desc(Product.price))
                .limit(fallback_limit)
            )
            fb_res = await db.execute(fb_query)
            recommended_products.extend(fb_res.scalars().all())

        return [ProductResponse.model_validate(p) for p in recommended_products]
