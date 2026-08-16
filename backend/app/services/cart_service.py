from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.cart import CartItem
from app.models.product import Product
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartSummaryResponse, CartItemResponse
from app.schemas.product import ProductResponse

class CartService:
    @staticmethod
    async def get_user_cart(db: AsyncSession, user_id: int, coupon_code: str = None) -> CartSummaryResponse:
        result = await db.execute(
            select(CartItem)
            .options(selectinload(CartItem.product))
            .filter(CartItem.user_id == user_id)
        )
        cart_items = result.scalars().all()

        item_responses = []
        subtotal = 0.0
        item_count = 0

        for item in cart_items:
            if not item.product or not item.product.is_active:
                continue
            item_count += item.quantity
            item_subtotal = item.product.price * item.quantity
            subtotal += item_subtotal

            prod_resp = ProductResponse.model_validate(item.product)
            item_responses.append(
                CartItemResponse(
                    id=item.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    product=prod_resp
                )
            )

        applied_discount_pct = 0.0
        if coupon_code:
            code_upper = coupon_code.strip().upper()
            if code_upper == "SAVE20":
                applied_discount_pct = 20.0
            elif code_upper == "SAVE10":
                applied_discount_pct = 10.0

        discount = (subtotal * applied_discount_pct) / 100.0
        shipping_fee = 0.0 if subtotal >= 50.0 or subtotal == 0.0 else 5.99
        total = max(0.0, subtotal - discount + shipping_fee)

        return CartSummaryResponse(
            items=item_responses,
            item_count=item_count,
            subtotal=round(subtotal, 2),
            discount=round(discount, 2),
            shipping_fee=round(shipping_fee, 2),
            total=round(total, 2)
        )

    @staticmethod
    async def add_to_cart(db: AsyncSession, user_id: int, cart_in: CartItemCreate) -> CartSummaryResponse:
        # Check if product exists and has stock
        p_res = await db.execute(select(Product).filter(Product.id == cart_in.product_id))
        product = p_res.scalars().first()
        if not product or not product.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found or inactive")
        if product.stock < cart_in.quantity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock for product")

        item_res = await db.execute(
            select(CartItem).filter(CartItem.user_id == user_id, CartItem.product_id == cart_in.product_id)
        )
        existing_item = item_res.scalars().first()

        if existing_item:
            new_qty = existing_item.quantity + cart_in.quantity
            if product.stock < new_qty:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock available")
            existing_item.quantity = new_qty
        else:
            new_item = CartItem(
                user_id=user_id,
                product_id=cart_in.product_id,
                quantity=cart_in.quantity
            )
            db.add(new_item)

        await db.commit()
        return await CartService.get_user_cart(db, user_id)

    @staticmethod
    async def update_cart_item(db: AsyncSession, user_id: int, item_id: int, item_in: CartItemUpdate) -> CartSummaryResponse:
        item_res = await db.execute(
            select(CartItem)
            .options(selectinload(CartItem.product))
            .filter(CartItem.id == item_id, CartItem.user_id == user_id)
        )
        item = item_res.scalars().first()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

        if item_in.quantity <= 0:
            await db.delete(item)
        else:
            if item.product and item.product.stock < item_in.quantity:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock")
            item.quantity = item_in.quantity

        await db.commit()
        return await CartService.get_user_cart(db, user_id)

    @staticmethod
    async def remove_cart_item(db: AsyncSession, user_id: int, item_id: int) -> CartSummaryResponse:
        item_res = await db.execute(
            select(CartItem).filter(CartItem.id == item_id, CartItem.user_id == user_id)
        )
        item = item_res.scalars().first()
        if item:
            await db.delete(item)
            await db.commit()
        return await CartService.get_user_cart(db, user_id)

    @staticmethod
    async def clear_cart(db: AsyncSession, user_id: int) -> None:
        items_res = await db.execute(select(CartItem).filter(CartItem.user_id == user_id))
        for item in items_res.scalars().all():
            await db.delete(item)
        await db.commit()
