from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.database import get_db
from app.services.chatbot_service import ChatbotService
from app.utils.dependencies import get_current_user_optional
from app.models.user import User

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

@router.post("")
@router.post("/message")
async def chatbot_reply(
    chat_in: ChatRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """AI Customer Support Chatbot endpoint for FAQs, product search assistance, and order status lookups."""
    return await ChatbotService.process_chat_message(
        db, 
        message=chat_in.message, 
        user=current_user,
        context=chat_in.context
    )
