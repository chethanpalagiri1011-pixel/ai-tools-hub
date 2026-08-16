from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from typing import List, Optional

from app.models.order import Order, OrderItem, OrderStatus
from app.models.cart import CartItem
from app.models.product import Product
from app.models.payment import Payment, PaymentStatus
from app.models.user import User
from app.schemas.order import OrderCheckoutRequest, OrderResponse, OrderStatusUpdate
from app.utils.helpers import generate_tracking_number, generate_transaction_id

class OrderService:
    @staticmethod
    async def checkout(db: AsyncSession, user: User, checkout_in: OrderCheckoutRequest) -> OrderResponse:
        # Fetch cart items
        res = await db.execute(
            select(CartItem)
            .options(selectinload(CartItem.product))
            .filter(CartItem.user_id == user.id)
        )
        cart_items = res.scalars().all()

        if not cart_items:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

        subtotal = 0.0
        order_items_to_create = []

        # Validate stock & calculate subtotal
        for item in cart_items:
            if not item.product or not item.product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product with ID {item.product_id} is no longer available"
                )
            if item.product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{item.product.name}'. Available: {item.product.stock}"
                )
            
            item_subtotal = item.product.price * item.quantity
            subtotal += item_subtotal

            order_items_to_create.append({
                "product_id": item.product.id,
                "product_name": item.product.name,
                "price": item.product.price,
                "quantity": item.quantity
            })

        # Calculate discount
        discount_pct = 0.0
        if checkout_in.coupon_code:
            code = checkout_in.coupon_code.strip().upper()
            if code == "SAVE20":
                discount_pct = 20.0
            elif code == "SAVE10":
                discount_pct = 10.0

        discount = (subtotal * discount_pct) / 100.0
        shipping_fee = 0.0 if subtotal >= 50.0 else 5.99
        total = round(max(0.0, subtotal - discount + shipping_fee), 2)

        tracking_num = generate_tracking_number()

        # Begin atomic order creation
        new_order = Order(
            tracking_number=tracking_num,
            user_id=user.id,
            subtotal=round(subtotal, 2),
            discount=round(discount, 2),
            shipping_fee=round(shipping_fee, 2),
            total=total,
            status=OrderStatus.PAID,  # Mock payment immediately marks order as PAID
            shipping_address=checkout_in.shipping_address or "Standard Shipping Address",
            coupon_code=checkout_in.coupon_code
        )
        db.add(new_order)
        await db.flush()  # to get new_order.id

        # Deduct stock & create order items
        for oi in order_items_to_create:
            # Deduct stock
            p_res = await db.execute(select(Product).filter(Product.id == oi["product_id"]))
            p = p_res.scalars().first()
            if p:
                p.stock -= oi["quantity"]

            order_item = OrderItem(
                order_id=new_order.id,
                product_id=oi["product_id"],
                product_name=oi["product_name"],
                price=oi["price"],
                quantity=oi["quantity"]
            )
            db.add(order_item)

        # Create Mock Payment record
        payment = Payment(
            transaction_id=generate_transaction_id(),
            order_id=new_order.id,
            amount=total,
            payment_method=checkout_in.payment_method or "mock_card",
            status=PaymentStatus.SUCCESS,
            gateway_response="Mock payment approved successfully"
        )
        db.add(payment)

        # Delete user's cart items
        for item in cart_items:
            await db.delete(item)

        await db.commit()

        # Reload complete order with items
        order_res = await db.execute(
            select(Order)
            .options(selectinload(Order.items))
            .filter(Order.id == new_order.id)
        )
        completed_order = order_res.scalars().first()
        return OrderResponse.model_validate(completed_order)

    @staticmethod
    async def list_user_orders(db: AsyncSession, user: User) -> List[OrderResponse]:
        query = select(Order).options(selectinload(Order.items))
        if user.role != "admin":
            query = query.filter(Order.user_id == user.id)
        query = query.order_by(Order.created_at.desc())

        res = await db.execute(query)
        orders = res.scalars().all()
        return [OrderResponse.model_validate(o) for o in orders]

    @staticmethod
    async def get_order(db: AsyncSession, order_id_or_tracking: str, user: User) -> OrderResponse:
        query = select(Order).options(selectinload(Order.items))
        if order_id_or_tracking.isdigit():
            query = query.filter(Order.id == int(order_id_or_tracking))
        else:
            query = query.filter(Order.tracking_number == order_id_or_tracking)

        res = await db.execute(query)
        order = res.scalars().first()

        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        # Customer can only view own order unless admin
        if user.role != "admin" and order.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        return OrderResponse.model_validate(order)

    @staticmethod
    async def update_order_status(db: AsyncSession, order_id: int, status_in: OrderStatusUpdate) -> OrderResponse:
        res = await db.execute(
            select(Order).options(selectinload(Order.items)).filter(Order.id == order_id)
        )
        order = res.scalars().first()
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        order.status = status_in.status
        await db.commit()
        await db.refresh(order)
        return OrderResponse.model_validate(order)
