from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import async_engine, Base, AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.product import Product
from app.utils.security import get_password_hash
from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.rate_limit import SimpleRateLimitMiddleware
from app.middleware.error_handler import setup_error_handlers
from app.routes import (
    auth_router, users_router, products_router, categories_router,
    cart_router, orders_router, payments_router, recommendations_router, chatbot_router
)

async def seed_initial_data():
    """Initializes tables and seeds default categories, products, and admin account if empty."""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        from sqlalchemy.future import select
        # Check admin user
        admin_res = await db.execute(select(User).filter(User.email == "admin@shopeasy.com"))
        if not admin_res.scalars().first():
            admin_user = User(
                name="Admin User",
                email="admin@shopeasy.com",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN
            )
            db.add(admin_user)

        # Check default seller user
        seller_res = await db.execute(select(User).filter(User.email == "seller@shopeasy.com"))
        seller_user = seller_res.scalars().first()
        if not seller_user:
            seller_user = User(
                name="ShopEasy Official Seller",
                email="seller@shopeasy.com",
                hashed_password=get_password_hash("seller123"),
                role=UserRole.SELLER
            )
            db.add(seller_user)
            await db.flush()

        # Seed categories if empty
        cat_res = await db.execute(select(Category))
        categories = cat_res.scalars().all()
        if not categories:
            cat_map = {}
            default_categories = [
                ("Electronics", "electronics", "Gadgets, devices, and electronics"),
                ("Fashion", "fashion", "Apparel and stylish wear"),
                ("Accessories", "accessories", "Bags, carrying gear, and personal accessories"),
                ("Gaming", "gaming", "Console, PC gaming, and controllers"),
                ("Home & Living", "home-living", "Kitchen appliances and home decor"),
                ("Sports", "sports", "Fitness gear and equipment"),
                ("Beauty", "beauty", "Skincare, serums, and cosmetics"),
                ("Books", "books", "Programming and literature")
            ]
            for name, slug, desc in default_categories:
                cat = Category(name=name, slug=slug, description=desc)
                db.add(cat)
                await db.flush()
                cat_map[name] = cat.id
        else:
            cat_map = {c.name: c.id for c in categories}

        # Seed products if empty
        prod_res = await db.execute(select(Product))
        if not prod_res.scalars().first():
            sample_products = [
                { "name": "Wireless Headphones", "category": "Electronics", "price": 79.99, "old_price": 129.99, "emoji": "🎧", "badge": "Sale", "rating": 4.5, "reviews_count": 128, "tag": "sale", "description": "Premium wireless headphones with noise cancellation and 30-hour battery life.", "colors": ["#333", "#e94560", "#4a90d9"], "stock": 50 },
                { "name": "Smart Watch Pro", "category": "Electronics", "price": 199.99, "old_price": None, "emoji": "⌚", "badge": "New", "rating": 4.8, "reviews_count": 89, "tag": "new", "description": "Advanced smartwatch with health tracking, GPS, and 7-day battery.", "colors": ["#333", "#silver", "#gold"], "stock": 40 },
                { "name": "Running Sneakers", "category": "Fashion", "price": 59.99, "old_price": 89.99, "emoji": "👟", "badge": "Popular", "rating": 4.6, "reviews_count": 245, "tag": "popular", "description": "Lightweight and comfortable running shoes with advanced cushioning technology.", "colors": ["#fff", "#333", "#e94560"], "stock": 60 },
                { "name": "Laptop Backpack", "category": "Accessories", "price": 45.99, "old_price": None, "emoji": "🎒", "badge": "New", "rating": 4.4, "reviews_count": 67, "tag": "new", "description": "Water-resistant laptop backpack with USB charging port and anti-theft design.", "colors": ["#333", "#1a1a2e", "#4a4a4a"], "stock": 35 },
                { "name": "Gaming Controller", "category": "Gaming", "price": 49.99, "old_price": 69.99, "emoji": "🎮", "badge": "Sale", "rating": 4.7, "reviews_count": 312, "tag": "sale", "description": "Wireless gaming controller compatible with PC, PS4, and mobile devices.", "colors": ["#333", "#fff", "#e94560"], "stock": 80 },
                { "name": "Coffee Maker", "category": "Home & Living", "price": 89.99, "old_price": None, "emoji": "☕", "badge": "Popular", "rating": 4.9, "reviews_count": 156, "tag": "popular", "description": "Programmable coffee maker with built-in grinder and thermal carafe.", "colors": ["#333", "#silver"], "stock": 25 },
                { "name": "Sunglasses", "category": "Fashion", "price": 29.99, "old_price": 49.99, "emoji": "🕶️", "badge": "Sale", "rating": 4.3, "reviews_count": 94, "tag": "sale", "description": "UV400 polarized sunglasses with lightweight titanium frame.", "colors": ["#333", "#8B4513", "#gold"], "stock": 100 },
                { "name": "Bluetooth Speaker", "category": "Electronics", "price": 39.99, "old_price": None, "emoji": "🔊", "badge": "New", "rating": 4.6, "reviews_count": 178, "tag": "new", "description": "360-degree sound with waterproof design and 12-hour playtime.", "colors": ["#333", "#e94560", "#4a90d9"], "stock": 45 },
                { "name": "Yoga Mat", "category": "Sports", "price": 34.99, "old_price": 54.99, "emoji": "🧘", "badge": "Sale", "rating": 4.5, "reviews_count": 203, "tag": "sale", "description": "Non-slip eco-friendly yoga mat with alignment lines.", "colors": ["#e94560", "#4a90d9", "#4CAF50"], "stock": 70 },
                { "name": "Face Serum", "category": "Beauty", "price": 24.99, "old_price": None, "emoji": "🧴", "badge": "Trending", "rating": 4.7, "reviews_count": 89, "tag": "trending", "description": "Hyaluronic acid face serum for deep hydration and anti-aging.", "colors": ["#gold", "#silver"], "stock": 90 },
                { "name": "Mechanical Keyboard", "category": "Electronics", "price": 119.99, "old_price": 159.99, "emoji": "⌨️", "badge": "Sale", "rating": 4.8, "reviews_count": 267, "tag": "sale", "description": "RGB mechanical keyboard with tactile switches and programmable keys.", "colors": ["#333", "#fff"], "stock": 30 },
                { "name": "Book: Design Patterns", "category": "Books", "price": 19.99, "old_price": None, "emoji": "📚", "badge": "Popular", "rating": 4.9, "reviews_count": 512, "tag": "popular", "description": "Essential guide to software design patterns for modern developers.", "colors": [], "stock": 150 }
            ]
            for p_dict in sample_products:
                cat_id = cat_map.get(p_dict["category"])
                p = Product(
                    name=p_dict["name"],
                    category_id=cat_id,
                    price=p_dict["price"],
                    old_price=p_dict["old_price"],
                    emoji=p_dict["emoji"],
                    badge=p_dict["badge"],
                    rating=p_dict["rating"],
                    reviews_count=p_dict["reviews_count"],
                    tag=p_dict["tag"],
                    description=p_dict["description"],
                    colors=p_dict["colors"],
                    stock=p_dict["stock"],
                    seller_id=seller_user.id if seller_user else None
                )
                db.add(p)

        await db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Run schema creation and data seeding
    await seed_initial_data()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise Async FastAPI E-Commerce Backend Server for ShopEasy Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Exception handlers
setup_error_handlers(app)

# Custom Middlewares
app.add_middleware(LoggingMiddleware)
app.add_middleware(SimpleRateLimitMiddleware, requests_per_minute=200)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
prefix = settings.API_PREFIX
app.include_router(auth_router, prefix=f"{prefix}/auth", tags=["Authentication"])
app.include_router(users_router, prefix=f"{prefix}/users", tags=["Users"])
app.include_router(products_router, prefix=f"{prefix}/products", tags=["Products"])
app.include_router(categories_router, prefix=f"{prefix}/categories", tags=["Categories"])
app.include_router(cart_router, prefix=f"{prefix}/cart", tags=["Shopping Cart"])
app.include_router(orders_router, prefix=f"{prefix}/orders", tags=["Orders & Checkout"])
app.include_router(payments_router, prefix=f"{prefix}/payments", tags=["Payments"])
app.include_router(recommendations_router, prefix=f"{prefix}/recommendations", tags=["AI Recommendations"])
app.include_router(chatbot_router, prefix=f"{prefix}/chatbot", tags=["AI Support Chatbot"])

@app.get("/")
async def root():
    return {
        "app_name": settings.APP_NAME,
        "version": "1.0.0",
        "status": "healthy",
        "docs_url": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "ok", "database": "connected"}
