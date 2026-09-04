from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.products import router as products_router
from app.routes.categories import router as categories_router
from app.routes.cart import router as cart_router
from app.routes.orders import router as orders_router
from app.routes.payments import router as payments_router
from app.routes.recommendations import router as recommendations_router
from app.routes.chatbot import router as chatbot_router
from app.routes.wishlist import router as wishlist_router
from app.routes.reviews import router as reviews_router
from app.routes.admin import router as admin_router
from app.routes.addresses import router as addresses_router

__all__ = [
    "auth_router", "users_router", "products_router", "categories_router",
    "cart_router", "orders_router", "payments_router", "recommendations_router",
    "chatbot_router", "wishlist_router", "reviews_router", "admin_router", "addresses_router"
]
