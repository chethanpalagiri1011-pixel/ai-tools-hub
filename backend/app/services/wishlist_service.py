from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from typing import List

from app.models.wishlist import WishlistItem
from app.models.product import Product
from app.schemas.wishlist import WishlistItemResponse
from app.services.cart_service import CartService
from app.schemas.cart import CartItemCreate

class WishlistService:
    @staticmethod
    async def get_user_wishlist(db: AsyncSession, user_id: int) -> List[WishlistItemResponse]:
        res = await db.execute(
            select(WishlistItem)
            .options(selectinload(WishlistItem.product).selectinload(Product.category))
            .filter(WishlistItem.user_id == user_id)
            .order_by(WishlistItem.created_at.desc())
        )
        items = res.scalars().all()
        responses = []
        for item in items:
            if item.product and item.product.is_active:
                responses.append(WishlistItemResponse.model_validate(item))
        return responses

    @staticmethod
    async def add_to_wishlist(db: AsyncSession, user_id: int, product_id: int) -> WishlistItemResponse:
        # Verify product exists
        p_res = await db.execute(select(Product).filter(Product.id == product_id, Product.is_active == True))
        product = p_res.scalars().first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        # Check existing
        w_res = await db.execute(
            select(WishlistItem).filter(WishlistItem.user_id == user_id, WishlistItem.product_id == product_id)
        )
        existing = w_res.scalars().first()
        if existing:
            # Already in wishlist, return existing
            res = await db.execute(
                select(WishlistItem)
                .options(selectinload(WishlistItem.product).selectinload(Product.category))
                .filter(WishlistItem.id == existing.id)
            )
            return WishlistItemResponse.model_validate(res.scalars().first())

        new_item = WishlistItem(user_id=user_id, product_id=product_id)
        db.add(new_item)
        await db.commit()

        res = await db.execute(
            select(WishlistItem)
            .options(selectinload(WishlistItem.product).selectinload(Product.category))
            .filter(WishlistItem.id == new_item.id)
        )
        return WishlistItemResponse.model_validate(res.scalars().first())

    @staticmethod
    async def remove_from_wishlist(db: AsyncSession, user_id: int, product_id: int) -> dict:
        w_res = await db.execute(
            select(WishlistItem).filter(WishlistItem.user_id == user_id, WishlistItem.product_id == product_id)
        )
        item = w_res.scalars().first()
        if item:
            await db.delete(item)
            await db.commit()
        return {"message": "Product removed from wishlist"}

    @staticmethod
    async def move_to_cart(db: AsyncSession, user_id: int, product_id: int) -> dict:
        # Add to cart
        await CartService.add_to_cart(db, user_id, CartItemCreate(product_id=product_id, quantity=1))
        # Remove from wishlist
        await WishlistService.remove_from_wishlist(db, user_id, product_id)
        return {"message": "Moved product from wishlist to cart"}
