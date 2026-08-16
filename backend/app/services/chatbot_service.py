from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, Dict, Any
from app.models.user import User
from app.models.order import Order
from app.models.product import Product

class ChatbotService:
    FAQ_RESPONSES = {
        "shipping": "We offer free standard shipping on all orders over $50.00! Standard delivery takes 3-5 business days.",
        "return": "We accept returns within 30 days of receipt. Products must be in original condition with tags attached.",
        "payment": "We accept all major credit cards, debit cards, and mock test payments during checkout.",
        "contact": "You can reach customer support at support@shopeasy.com or call us at +1 (800) 555-0199."
    }

    @staticmethod
    async def process_chat_message(
        db: AsyncSession,
        message: str,
        user: Optional[User] = None
    ) -> Dict[str, Any]:
        msg_lower = message.strip().lower()

        # Check for order tracking inquiry
        if "order" in msg_lower or "track" in msg_lower or "status" in msg_lower:
            if not user:
                return {
                    "response": "To check your order status, please log in to your account.",
                    "requires_auth": True
                }
            
            # Fetch latest order for current authenticated user
            res = await db.execute(
                select(Order)
                .filter(Order.user_id == user.id)
                .order_by(Order.created_at.desc())
            )
            latest_order = res.scalars().first()
            if not latest_order:
                return {
                    "response": f"Hello {user.name}! You don't have any placed orders yet.",
                    "intent": "order_status"
                }
            return {
                "response": f"Hi {user.name}! Your latest order #{latest_order.tracking_number} is currently '{latest_order.status.value}'. Total: ${latest_order.total:.2f}.",
                "intent": "order_status",
                "order_details": {
                    "tracking_number": latest_order.tracking_number,
                    "status": latest_order.status.value,
                    "total": latest_order.total
                }
            }

        # Check for Product search inquiries
        if "find" in msg_lower or "search" in msg_lower or "looking for" in msg_lower or "buy" in msg_lower:
            keywords = [w for w in msg_lower.split() if len(w) > 3 and w not in ["find", "search", "looking", "want", "show"]]
            if keywords:
                searchTerm = keywords[0]
                res = await db.execute(
                    select(Product)
                    .filter(Product.is_active == True, Product.name.iloclike(f"%{searchTerm}%"))
                    .limit(3)
                )
                matches = res.scalars().all()
                if matches:
                    names = ", ".join([f"{p.emoji} {p.name} (${p.price})" for p in matches])
                    return {
                        "response": f"Here are some products matching '{searchTerm}': {names}",
                        "intent": "product_search"
                    }

        # Check FAQs
        for key, resp in ChatbotService.FAQ_RESPONSES.items():
            if key in msg_lower:
                return {"response": resp, "intent": "faq"}

        # Default fallback response
        return {
            "response": "Hello! I am your ShopEasy AI Assistant. I can help you search products, answer FAQs about shipping and returns, or check your order status!",
            "intent": "general"
        }
