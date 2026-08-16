from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from app.models.payment import Payment, PaymentStatus
from app.models.order import Order
from app.schemas.payment import PaymentCreateRequest, PaymentResponse
from app.utils.helpers import generate_transaction_id

class PaymentService:
    @staticmethod
    async def create_mock_payment(db: AsyncSession, payment_in: PaymentCreateRequest, user_id: int) -> PaymentResponse:
        # Check order existence
        res = await db.execute(select(Order).filter(Order.id == payment_in.order_id))
        order = res.scalars().first()
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        if order.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        # Check if payment already exists
        p_res = await db.execute(select(Payment).filter(Payment.order_id == payment_in.order_id))
        existing = p_res.scalars().first()
        if existing:
            return PaymentResponse.model_validate(existing)

        new_payment = Payment(
            transaction_id=generate_transaction_id(),
            order_id=order.id,
            amount=order.total,
            payment_method=payment_in.payment_method or "mock_card",
            status=PaymentStatus.SUCCESS,
            gateway_response="[MOCK GATEWAY] Transaction approved successfully"
        )
        db.add(new_payment)
        await db.commit()
        await db.refresh(new_payment)
        return PaymentResponse.model_validate(new_payment)

    @staticmethod
    async def get_payment_by_transaction_id(db: AsyncSession, transaction_id: str, user_id: int) -> PaymentResponse:
        res = await db.execute(select(Payment).filter(Payment.transaction_id == transaction_id))
        payment = res.scalars().first()
        if not payment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment transaction not found")

        # Verify ownership
        order_res = await db.execute(select(Order).filter(Order.id == payment.order_id))
        order = order_res.scalars().first()
        if order and order.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        return PaymentResponse.model_validate(payment)
