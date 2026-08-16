from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.payment import PaymentCreateRequest, PaymentResponse
from app.services.payment_service import PaymentService
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/create", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment_in: PaymentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer: Create mock payment transaction for an existing order."""
    return await PaymentService.create_mock_payment(db, payment_in, current_user.id)

@router.get("/{transaction_id}", response_model=PaymentResponse)
async def get_payment_status(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Customer: Retrieve mock payment status by transaction ID."""
    return await PaymentService.get_payment_by_transaction_id(db, transaction_id, current_user.id)
