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
    cart_router, orders_router, payments_router, recommendations_router, chatbot_router,
    wishlist_router, reviews_router, admin_router, addresses_router
)

async def seed_initial_data():
    """Initializes tables and seeds default categories, products, and admin account if empty."""
    from sqlalchemy import text
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        try:
            await conn.execute(text("ALTER TABLE products ADD COLUMN image_url VARCHAR(500)"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT 0"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN phone_verified_at DATETIME"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN dob VARCHAR(20)"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN gender VARCHAR(20)"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)"))
        except Exception:
            pass

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
        default_categories = [
            ("Electronics", "electronics", "Gadgets, devices, and electronics"),
            ("Fashion", "fashion", "Apparel and stylish wear"),
            ("Accessories", "accessories", "Bags, carrying gear, and personal accessories"),
            ("Gaming", "gaming", "Console, PC gaming, and controllers"),
            ("Home & Living", "home-living", "Kitchen appliances and home decor"),
            ("Sports", "sports", "Fitness gear and equipment"),
            ("Beauty", "beauty", "Skincare, serums, and cosmetics"),
            ("Books", "books", "Programming and literature"),
            ("Automotive", "automotive", "Car accessories and gadgets"),
            ("Toys & Games", "toys-games", "Action figures, board games, and LEGO")
        ]
        if not categories or len(categories) < len(default_categories):
            cat_map = {}
            for name, slug, desc in default_categories:
                c_res = await db.execute(select(Category).filter(Category.name == name))
                cat_obj = c_res.scalars().first()
                if not cat_obj:
                    cat_obj = Category(name=name, slug=slug, description=desc)
                    db.add(cat_obj)
                    await db.flush()
                cat_map[name] = cat_obj.id
        else:
            cat_map = {c.name: c.id for c in categories}

        # Seed 100+ realistic products
        prod_res = await db.execute(select(Product))
        existing_prods = prod_res.scalars().all()

        base_catalog = [
            # Electronics (15 items)
            ("Sony WH-1000XM5 Wireless Headphones", "Electronics", 29990.0, 34990.0, "🎧", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", "Sale", "sale", 4.9, 450, "Industry-leading noise canceling headphones with dual processors.", ["#333", "#silver"], 55),
            ("Apple Watch Series 9 GPS 45mm", "Electronics", 41900.0, 44900.0, "⌚", "https://images.unsplash.com/photo-1523275335684-37898b6baf30", "Popular", "popular", 4.9, 820, "Advanced health sensors, S9 SiP, super-bright Retina display.", ["#333", "#silver", "#gold"], 40),
            ("Apple MacBook Pro 16\" M3 Max", "Electronics", 249900.0, 269900.0, "💻", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8", "Trending", "trending", 4.9, 210, "Liquid Retina XDR display, up to 128GB unified memory.", ["#333", "#silver"], 20),
            ("Samsung Galaxy S24 Ultra 512GB", "Electronics", 129999.0, 139999.0, "📱", "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf", "New", "new", 4.8, 310, "Galaxy AI, 200MP camera with nightography, S Pen included.", ["#333", "#gold", "#4a90d9"], 35),
            ("Samsung Galaxy A54 5G Smartphone", "Electronics", 18999.0, 21999.0, "📱", "https://images.unsplash.com/photo-1598327105666-5b89351aff97", "Popular", "popular", 4.8, 640, "50MP OIS camera, 120Hz Super AMOLED display, 5000mAh battery.", ["#333", "#4a90d9"], 60),
            ("OnePlus Nord CE 3 Lite 5G Phone", "Electronics", 17999.0, 19999.0, "📱", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9", "Sale", "sale", 4.7, 820, "108MP camera system, 67W SUPERVOOC fast charging.", ["#4CAF50", "#333"], 75),
            ("Xiaomi Redmi Note 13 Pro 5G Phone", "Electronics", 16999.0, 18999.0, "📱", "https://images.unsplash.com/photo-1565849904461-04a58ad377e0", "Trending", "trending", 4.8, 950, "200MP camera, 1.5K 120Hz AMOLED display, Snapdragon processor.", ["#333", "#silver"], 80),
            ("Realme 12 Pro 5G Smartphone", "Electronics", 19999.0, 22999.0, "📱", "https://images.unsplash.com/photo-1574944985070-8f338c34253a", "New", "new", 4.7, 430, "Sony IMX882 OIS camera, luxury watch design finish.", ["#gold", "#4a90d9"], 45),
            ("JBL Flip 6 Waterproof Bluetooth Speaker", "Electronics", 9999.0, 12999.0, "🔊", "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1", "Sale", "sale", 4.7, 510, "12 hours battery life, IP67 waterproof and dustproof.", ["#333", "#e94560", "#4a90d9"], 60),
            ("Dell XPS 15 OLED Touch Laptop", "Electronics", 189900.0, 219900.0, "💻", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45", "Sale", "sale", 4.7, 195, "3.5K OLED touchscreen, Intel Core i9, RTX 4070 graphics.", ["#silver"], 18),
            ("Canon EOS R6 Mark II Mirrorless Camera", "Electronics", 249900.0, 279900.0, "📷", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32", "Trending", "trending", 4.9, 140, "24.2 MP full-frame sensor, 40 fps continuous shooting.", ["#333"], 12),
            ("Apple iPad Air 10.9\" M1 Chip", "Electronics", 59900.0, 64900.0, "📱", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0", "Popular", "popular", 4.8, 670, "Liquid Retina display, Touch ID, Wi-Fi 6, all-day battery.", ["#silver", "#4a90d9"], 45),
            ("Bose QuietComfort Ultra Earbuds", "Electronics", 28900.0, 34900.0, "🎧", "https://images.unsplash.com/photo-1590658268037-6bf12165a8df", "New", "new", 4.8, 230, "World-class noise cancellation and spatialized audio.", ["#333", "#silver"], 50),
            ("Anker 737 Power Bank 24,000mAh", "Electronics", 9999.0, 11999.0, "🔋", "https://images.unsplash.com/photo-1609592424109-dd9892f1b177", "Popular", "popular", 4.9, 890, "140W fast charging output, digital smart display.", ["#333"], 90),
            ("Logitech MX Master 3S Wireless Mouse", "Electronics", 8995.0, 10995.0, "🖱️", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7", "Trending", "trending", 4.9, 1120, "Quiet clicks, 8K DPI tracking on any surface.", ["#333", "#silver"], 70),
            ("ASUS ROG Swift 32\" 4K 144Hz Monitor", "Electronics", 74990.0, 84990.0, "🖥️", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf", "Sale", "sale", 4.8, 160, "Quantum Dot IPS display, 1ms GTG response time.", ["#333"], 22),
            ("GoPro HERO12 Black Action Camera", "Electronics", 39990.0, 44990.0, "📹", "https://images.unsplash.com/photo-1564466809058-bf81182fe979", "New", "new", 4.7, 340, "5.3K video resolution, HDR, HyperSmooth 6.0 stabilization.", ["#333"], 35),
            ("Kindle Paperwhite 16GB Display", "Electronics", 13999.0, 14999.0, "📖", "https://images.unsplash.com/photo-1592496001020-d31bd830651f", "Popular", "popular", 4.9, 1450, "6.8\" glare-free 300 ppi display, adjustable warm light.", ["#333"], 80),
            ("Sonos Beam Gen 2 Smart Soundbar", "Electronics", 49990.0, 54990.0, "🔊", "https://images.unsplash.com/photo-1545454675-3531b543be5d", "Trending", "trending", 4.8, 280, "Dolby Atmos 3D audio, Apple AirPlay 2 support.", ["#333", "#fff"], 25),

            # Fashion (15 items)
            ("Levi's 501 Original Fit Jeans", "Fashion", 3999.0, 4999.0, "👖", "https://images.unsplash.com/photo-1542272604-780c36856d62", "Popular", "popular", 4.7, 850, "The iconic straight fit with classic button fly.", ["#4a90d9", "#333"], 100),
            ("Nike Tech Fleece Full-Zip Hoodie", "Fashion", 8995.0, 9995.0, "🧥", "https://images.unsplash.com/photo-1556905055-8f358a7a47b2", "Trending", "trending", 4.8, 620, "Lightweight warmth with sleek modern tailored silhouette.", ["#333", "#silver"], 65),
            ("Adidas Ultraboost Light Running Shoes", "Fashion", 17999.0, 19999.0, "👟", "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2", "Sale", "sale", 4.9, 740, "Lightest Boost cushioning ever made for ultimate energy return.", ["#333", "#fff", "#e94560"], 80),
            ("Ray-Ban Classic Aviator Sunglasses", "Fashion", 9290.0, 10500.0, "🕶️", "https://images.unsplash.com/photo-1511499767150-a48a237f0083", "Popular", "popular", 4.8, 930, "G-15 green crystal lenses with golden metal frame.", ["#gold", "#333"], 55),
            ("Zara Tailored Wool Blend Blazer", "Fashion", 8990.0, 10990.0, "👔", "https://images.unsplash.com/photo-1594938298603-c8148c4dae35", "New", "new", 4.6, 180, "Structured shoulder pads, notch lapels, flap pockets.", ["#333", "#4a4a4a"], 40),
            ("Puma Suede Classic XXI Sneakers", "Fashion", 5999.0, 6999.0, "👟", "https://images.unsplash.com/photo-1608231387042-66d1773070a5", "Sale", "sale", 4.7, 430, "Soft suede upper with synthetic leather lining.", ["#333", "#4a90d9"], 90),
            ("North Face Antora Waterproof Jacket", "Fashion", 8990.0, 10990.0, "🧥", "https://images.unsplash.com/photo-1544441893-675973e31985", "Popular", "popular", 4.8, 510, "DryVent 2L shell with non-PFC durable water repellent.", ["#333", "#e94560"], 45),
            ("Tommy Hilfiger Cotton Polo Shirt", "Fashion", 3999.0, 4999.0, "👕", "https://images.unsplash.com/photo-1581655353564-df123a1eb820", "Sale", "sale", 4.6, 320, "Breathable cotton pique fabric with signature flag embroidery.", ["#333", "#fff", "#e94560"], 85),
            ("Calvin Klein Modern Cotton Bralette", "Fashion", 2499.0, 2999.0, "👚", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f", "Popular", "popular", 4.8, 1200, "Soft cotton stretch blend with classic logo band.", ["#333", "#fff", "#silver"], 110),
            ("Champion Reverse Weave Crewneck", "Fashion", 4999.0, 5999.0, "🧥", "https://images.unsplash.com/photo-1578587018452-892bacefd3f2", "Trending", "trending", 4.7, 490, "Heavyweight 12 oz. fleece cut on the cross-grain.", ["#333", "#silver"], 70),
            ("Under Armour Training Joggers", "Fashion", 3999.0, 4999.0, "👖", "https://images.unsplash.com/photo-1552902865-b72c031ac5ea", "New", "new", 4.6, 260, "Armour Fleece is light, breathable and stretches for mobility.", ["#333", "#silver"], 60),
            ("Dr. Martens 1460 Smooth Leather Boots", "Fashion", 15999.0, 17999.0, "🥾", "https://images.unsplash.com/photo-1520639888713-7851133b1ed0", "Trending", "trending", 4.8, 780, "8-eye boot with signature yellow welt stitching.", ["#333"], 35),
            ("Fossil Men's Gen 6 Leather Belt", "Fashion", 2495.0, 2995.0, "👔", "https://images.unsplash.com/photo-1624222247344-550fb60583dc", "Sale", "sale", 4.5, 140, "100% genuine leather with vintage nickel hardware.", ["#8B4513", "#333"], 95),
            ("Columbia Steens Mountain Fleece", "Fashion", 3999.0, 4999.0, "🧥", "https://images.unsplash.com/photo-1548883354-7622d03aca27", "Popular", "popular", 4.8, 890, "MTR filament fleece fabric with zipper closure.", ["#333", "#4a90d9"], 75),
            ("Vans Old Skool Canvas Sneakers", "Fashion", 5499.0, 6499.0, "👟", "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77", "Popular", "popular", 4.9, 1650, "Side stripe suede and canvas skate shoe.", ["#333", "#fff"], 120),

            # Accessories (10 items)
            ("Herschel Little America Backpack", "Accessories", 7999.0, 8999.0, "🎒", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62", "Popular", "popular", 4.8, 670, "Signature striped fabric liner with padded 15\" sleeve.", ["#333", "#8B4513"], 50),
            ("Fossil Minimalist Stainless Steel Watch", "Accessories", 11995.0, 13995.0, "⌚", "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9", "Trending", "trending", 4.7, 430, "44mm case size, quartz movement with chronograph display.", ["#silver", "#gold"], 40),
            ("Bellroy Slim Leather Minimalist Wallet", "Accessories", 5999.0, 6999.0, "👛", "https://images.unsplash.com/photo-1627123424574-724758594e93", "New", "new", 4.9, 350, "Holds 4–12 cards and folded bills with RFID protection.", ["#8B4513", "#333"], 80),
            ("Samsonite Omni 28\" Hardside Luggage", "Accessories", 14999.0, 17999.0, "🧳", "https://images.unsplash.com/photo-1565026057447-ba90a3d07d66", "Sale", "sale", 4.8, 290, "Micro-diamond polycarbonate texture, 360 spinner wheels.", ["#silver", "#333"], 25),
            ("Peak Design Everyday Messenger Bag", "Accessories", 19999.0, 22999.0, "💼", "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3", "Trending", "trending", 4.9, 180, "MagLatch hardware, FlexFold dividers, weatherproof 400D shell.", ["#333", "#4a4a4a"], 20),
            ("Oakley Holbrook Prizm Sport Glasses", "Accessories", 11290.0, 12990.0, "🕶️", "https://images.unsplash.com/photo-1572635196237-14b3f281503f", "Popular", "popular", 4.8, 510, "Prizm lenses enhance color, contrast, and detail.", ["#333", "#4a90d9"], 45),
            ("Secrid Slimfold Aluminum Card Protector", "Accessories", 4999.0, 5999.0, "💳", "https://images.unsplash.com/photo-1606503153255-59d8b8b82176", "New", "new", 4.9, 820, "Patented lever mechanism slides cards out with one click.", ["#silver", "#333"], 90),
            ("Travelambo Leather Passport Holder", "Accessories", 1299.0, 1699.0, "📘", "https://images.unsplash.com/photo-1544816155-12df9643f363", "Sale", "sale", 4.6, 940, "Built-in RFID blocking keeps personal info secure.", ["#8B4513", "#333"], 150),
            ("Casio G-Shock Rugged Sport Watch", "Accessories", 7995.0, 9995.0, "⌚", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa", "Popular", "popular", 4.9, 1340, "200M water resistance, shock resistant, 1/100 sec stopwatch.", ["#333"], 65),
            ("Timbuk2 Classic Messenger Bag M", "Accessories", 8999.0, 10999.0, "💼", "https://images.unsplash.com/photo-1546938576-6e6a64f317cc", "Sale", "sale", 4.7, 390, "Cordura nylon construction with waterproof TPU liner.", ["#333"], 40),

            # Gaming (10 items)
            ("PlayStation 5 Console Slim Edition", "Gaming", 49990.0, 54990.0, "🎮", "https://images.unsplash.com/photo-1606813907291-d86efa9b94db", "Popular", "popular", 4.9, 1850, "Harness the power of a custom CPU, GPU, and SSD with Integrated I/O.", ["#fff", "#333"], 30),
            ("Xbox Series X 1TB Console", "Gaming", 48990.0, 53990.0, "🎮", "https://images.unsplash.com/photo-1621259182978-fbf93132d53d", "Trending", "trending", 4.8, 1240, "12 teraflops of raw graphic processing power, 4K gaming at up to 120 FPS.", ["#333"], 25),
            ("Nintendo Switch OLED Model White", "Gaming", 31990.0, 34990.0, "🕹️", "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e", "Popular", "popular", 4.9, 2100, "Vibrant 7-inch OLED screen with wide adjustable stand.", ["#fff", "#333", "#e94560"], 40),
            ("Razer BlackWidow V4 Pro Keyboard", "Gaming", 17999.0, 19999.0, "⌨️", "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae", "New", "new", 4.8, 380, "Command dial, 8 dedicated macro keys, magnetic wrist rest.", ["#333"], 35),
            ("Logitech G Pro X Superlight Mouse", "Gaming", 11995.0, 13995.0, "🖱️", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7", "Trending", "trending", 4.9, 920, "Ultra-lightweight under 63 grams with HERO 25K sensor.", ["#333", "#fff"], 50),
            ("SteelSeries Arctis Nova Pro Wireless", "Gaming", 29999.0, 32999.0, "🎧", "https://images.unsplash.com/photo-1546435770-a3e426bf472b", "Popular", "popular", 4.9, 540, "Active Noise Cancellation with Dual Wireless Connection.", ["#333"], 28),
            ("ASUS ROG Ally Gaming Handheld Z1", "Gaming", 69990.0, 74990.0, "🕹️", "https://images.unsplash.com/photo-1550745165-9bc0b252726f", "New", "new", 4.7, 410, "120Hz FHD display powered by Windows 11 and AMD Z1 Extreme.", ["#fff"], 20),
            ("Secretlab TITAN EVO Gaming Chair", "Gaming", 44900.0, 49900.0, "💺", "https://images.unsplash.com/photo-1598550476439-6847785fcea6", "Trending", "trending", 4.9, 710, "Pebble seat base with 4-way L-ADAPT lumbar support system.", ["#333", "#silver"], 15),
            ("Elgato Stream Deck MK.2 Controller", "Gaming", 13999.0, 15999.0, "🎛️", "https://images.unsplash.com/photo-1563770660941-20978e870e26", "Sale", "sale", 4.9, 680, "15 customizable LCD keys to control apps and platforms.", ["#333"], 45),
            ("Samsung Odyssey G9 49\" Curved Monitor", "Gaming", 119990.0, 139990.0, "🖥️", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf", "Sale", "sale", 4.8, 230, "Dual QHD resolution, 1000R curvature, 240Hz refresh rate.", ["#333", "#fff"], 10),

            # Home & Living (10 items)
            ("Dyson V15 Detect Cordless Vacuum", "Home & Living", 62900.0, 69900.0, "🧹", "https://images.unsplash.com/photo-1589923188900-85dae523342b", "Trending", "trending", 4.9, 480, "Laser reveals invisible dust, piezometer counts particles.", ["#gold", "#silver"], 20),
            ("Instant Pot Duo Plus 9-in-1 Cooker", "Home & Living", 9999.0, 11999.0, "🍲", "https://images.unsplash.com/photo-1544025162-d76694265947", "Popular", "popular", 4.8, 1420, "Pressure cooker, slow cooker, rice cooker, yogurt maker.", ["#silver"], 60),
            ("Nespresso VertuoPlus Coffee Machine", "Home & Living", 14999.0, 16999.0, "☕", "https://images.unsplash.com/photo-1517668808822-9ebe02afd2a4", "Sale", "sale", 4.8, 890, "Centrifusion technology brews double espresso and coffee.", ["#333", "#silver"], 45),
            ("Philips Hue White & Color Starter Kit", "Home & Living", 14999.0, 17999.0, "💡", "https://images.unsplash.com/photo-1550985616-10810253b84d", "Popular", "popular", 4.7, 560, "16 million colors, automated smart lighting with Hue Bridge.", ["#fff"], 40),
            ("COSORI Air Fryer Max XL 5.8 Quart", "Home & Living", 8999.0, 10999.0, "🍳", "https://images.unsplash.com/photo-1585515320310-259814833e62", "Popular", "popular", 4.9, 2300, "13 1-touch customizable cooking functions, nonstick basket.", ["#333"], 75),
            ("Levoit Core 400S Smart Air Purifier", "Home & Living", 16999.0, 18999.0, "🌬️", "https://images.unsplash.com/photo-1585771724684-38269d6639fd", "Trending", "trending", 4.8, 370, "HEPA filter captures 99.97% of airborne particles.", ["#fff"], 30),
            ("KitchenAid Artisan Stand Mixer 5-Qt", "Home & Living", 39990.0, 44990.0, "🥣", "https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48", "Popular", "popular", 4.9, 980, "10 speeds, tilt-head design with 5-quart stainless bowl.", ["#e94560", "#silver"], 25),
            ("Ninja Creami Ice Cream Maker", "Home & Living", 18999.0, 21999.0, "🍦", "https://images.unsplash.com/photo-1563805042-7684c019e1cb", "Trending", "trending", 4.8, 640, "Turns frozen bases into ice cream, sorbets, and gelato.", ["#333", "#silver"], 35),
            ("NutriBullet Pro 900W Blender", "Home & Living", 7999.0, 8999.0, "🥤", "https://images.unsplash.com/photo-1570222094114-d054a817e56b", "Sale", "sale", 4.7, 1150, "Nutrient extractor blades break down tough ingredients.", ["#silver", "#333"], 80),
            ("Brumate Hopsulator Duo Can Cooler", "Home & Living", 2499.0, 2999.0, "🍺", "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd", "New", "new", 4.8, 420, "2-in-1 insulator converts into 12oz tumbler.", ["#333", "#4a90d9"], 100),

            # Sports (10 items)
            ("Bowflex SelectTech 552 Dumbbells", "Sports", 34990.0, 41990.0, "🏋️", "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2", "Popular", "popular", 4.9, 1320, "Adjusts from 5 to 52.5 lbs in 2.5 lb increments.", ["#333", "#e94560"], 20),
            ("Lululemon Align High-Rise Pant 25\"", "Sports", 8900.0, 9900.0, "🧘", "https://images.unsplash.com/photo-1506629082925-23688b0729fe", "Popular", "popular", 4.9, 1780, "Buttery-soft Nulu fabric with weightless sensation.", ["#333", "#e94560"], 65),
            ("Garmin Forerunner 265 Running Watch", "Sports", 42990.0, 46990.0, "⌚", "https://images.unsplash.com/photo-1510017803434-a899398421b3", "New", "new", 4.8, 410, "AMOLED display, morning report, training readiness score.", ["#333", "#4a90d9"], 35),
            ("Hydro Flask 32 oz Wide Mouth Bottle", "Sports", 3495.0, 3995.0, "🍼", "https://images.unsplash.com/photo-1602143407151-7111542de6e8", "Popular", "popular", 4.9, 2400, "TempShield double-wall vacuum insulation keeps cold 24h.", ["#4a90d9", "#333", "#e94560"], 120),
            ("Manduka PRO Yoga Mat 6mm", "Sports", 11999.0, 12999.0, "🧘", "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f", "Trending", "trending", 4.8, 620, "High-density cushion, lifetime warranty, closed-cell material.", ["#333", "#4CAF50"], 45),
            ("Theragun PRO Percussive Therapy Massager", "Sports", 49990.0, 54990.0, "💆", "https://images.unsplash.com/photo-1519823551278-64ac92734fb1", "Sale", "sale", 4.9, 390, "OLED screen, 60 lbs max force, 300-min total battery.", ["#333"], 18),
            ("Peloton Bike+ Indoor Exercise Bike", "Sports", 219900.0, 239900.0, "🚴", "https://images.unsplash.com/photo-1517649763962-0c623266010b", "Trending", "trending", 4.9, 850, "23.8\" HD rotating touchscreen, Auto-Follow resistance.", ["#333"], 8),
            ("Coleman Sundome 4-Person Camping Tent", "Sports", 6999.0, 8999.0, "⛺", "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4", "Popular", "popular", 4.7, 1150, "WeatherTec system with patented welded floors.", ["#4CAF50", "#4a90d9"], 40),
            ("Spalding NBA Zi/O Indoor Outdoor Basketball", "Sports", 2999.0, 3499.0, "🏀", "https://images.unsplash.com/photo-1546519638-68e109498ffc", "Sale", "sale", 4.8, 980, "Composite leather cover with foam backing.", ["#8B4513"], 90),
            ("Titleist Pro V1 Golf Balls 12-Pack", "Sports", 4499.0, 4999.0, "⛳", "https://images.unsplash.com/photo-1535131749006-b7f58c99034b", "Popular", "popular", 4.9, 1420, "Cast urethane elastomer cover system for maximum distance.", ["#fff"], 110),

            # Beauty (10 items)
            ("CeraVe Hydrating Facial Cleanser 16oz", "Beauty", 1299.0, 1599.0, "🧴", "https://images.unsplash.com/photo-1556228720-195a672e8a03", "Popular", "popular", 4.8, 3100, "With hyaluronic acid, ceramics, and glycerin.", ["#fff"], 140),
            ("La Roche-Posay Anthelios SPF 50 Sunscreen", "Beauty", 2499.0, 2999.0, "☀️", "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908", "Trending", "trending", 4.9, 1850, "Cell-Ox Shield technology with broad spectrum UVA/UVB.", ["#fff"], 95),
            ("Dyson Airwrap Multi-Styler Complete", "Beauty", 45900.0, 49900.0, "💇", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e", "Trending", "trending", 4.9, 920, "Uses Coanda airflow to curl, shape, and hide flyaways.", ["#gold", "#silver"], 15),
            ("Estée Lauder Advanced Night Repair Serum", "Beauty", 8900.0, 9900.0, "💧", "https://images.unsplash.com/photo-1620916566398-39f1143ab7be", "Popular", "popular", 4.8, 1450, "Chronolux Power Signal technology reduces signs of aging.", ["#gold"], 50),
            ("Olaplex No. 3 Hair Perfector 3.3oz", "Beauty", 2950.0, 3400.0, "💇", "https://images.unsplash.com/photo-1608248597359-99464528d227", "Popular", "popular", 4.8, 2400, "Reduces breakage and visibly strengthens hair.", ["#fff"], 110),
            ("Sol de Janeiro Brazilian Bum Bum Cream", "Beauty", 3800.0, 4200.0, "🧴", "https://images.unsplash.com/photo-1608248545293-1fe627376c9b", "Trending", "trending", 4.9, 1680, "Infused with Guaraná extract for visible skin smoothing.", ["#gold"], 70),
            ("MAC Velvet Teddy Matte Lipstick", "Beauty", 1950.0, 2200.0, "💄", "https://images.unsplash.com/photo-1586495777744-4413f21062fa", "Popular", "popular", 4.7, 1920, "Iconic deep beige nude color with zero-shine matte finish.", ["#e94560"], 130),
            ("Paula's Choice 2% BHA Liquid Exfoliant", "Beauty", 2700.0, 3100.0, "✨", "https://images.unsplash.com/photo-1617897903246-719242758050", "Trending", "trending", 4.9, 2900, "Salicylic acid unclogs pores & smooths wrinkles.", ["#fff"], 85),
            ("Philips Norelco Series 9000 Shaver", "Beauty", 18999.0, 21999.0, "🪒", "https://images.unsplash.com/photo-1621607512214-68297480165e", "Sale", "sale", 4.8, 490, "Dual SteelPrecision blades, Pressure Guard sensor.", ["#333", "#silver"], 30),
            ("Chanel Bleu de Chanel Eau de Parfum 3.4oz", "Beauty", 12500.0, 14000.0, "🧪", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e", "Popular", "popular", 4.9, 1150, "Aromatic-woody fragrance with amber and musky notes.", ["#333"], 40),

            # Books (10 items)
            ("Clean Code by Robert C. Martin", "Books", 1499.0, 1899.0, "📚", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c", "Popular", "popular", 4.9, 1820, "A Handbook of Agile Software Craftsmanship for modern developers.", [], 150),
            ("System Design Interview by Alex Xu", "Books", 2499.0, 2999.0, "📘", "https://images.unsplash.com/photo-1532012197267-da84d127e765", "Trending", "trending", 4.9, 1420, "An insider's guide to system design questions in top tech interviews.", [], 120),
            ("Atomic Habits by James Clear", "Books", 599.0, 799.0, "📗", "https://images.unsplash.com/photo-1589829085413-56de8ae18c73", "Popular", "popular", 4.9, 3400, "An easy & proven way to build good habits & break bad ones.", [], 200),
            ("Designing Data-Intensive Applications", "Books", 2999.0, 3499.0, "📙", "https://images.unsplash.com/photo-1512820790803-83ca734da794", "Trending", "trending", 4.9, 980, "The big ideas behind reliable, scalable, and maintainable systems.", [], 90),
            ("The Pragmatic Programmer 20th Anniv", "Books", 2799.0, 3299.0, "📕", "https://images.unsplash.com/photo-1497633762265-9d179a990aa6", "Popular", "popular", 4.9, 1110, "Your journey to mastery in software development.", [], 80),
            ("Psychology of Money by Morgan Housel", "Books", 399.0, 499.0, "💵", "https://images.unsplash.com/photo-1553729459-efe14ef6055d", "Popular", "popular", 4.8, 2200, "Timeless lessons on wealth, greed, and happiness.", [], 180),
            ("Introduction to Algorithms (CLRS 4th)", "Books", 4999.0, 5999.0, "💻", "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8", "New", "new", 4.9, 650, "Comprehensive lead reference for modern algorithms.", [], 60),
            ("Python Crash Course 3rd Edition", "Books", 1899.0, 2299.0, "🐍", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5", "Popular", "popular", 4.8, 1680, "A hands-on, project-based introduction to programming.", [], 140),
            ("Deep Learning by Ian Goodfellow", "Books", 4499.0, 5299.0, "🧠", "https://images.unsplash.com/photo-1509228468518-180dd4864904", "New", "new", 4.9, 430, "The definitive textbook on deep learning AI architectures.", [], 50),
            ("Refactoring by Martin Fowler", "Books", 3299.0, 3899.0, "🛠️", "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", "Sale", "sale", 4.9, 790, "Improving the design of existing code base.", [], 75),

            # Automotive (5 items)
            ("Anker ROAV Dash Cam Duo Dual 1080p", "Automotive", 7999.0, 9999.0, "📹", "https://images.unsplash.com/photo-1503376780353-7e6692767b70", "Popular", "popular", 4.8, 380, "Dual FHD 1080p wide angle lenses, night vision, G-sensor.", ["#333"], 40),
            ("NOCO Boost Plus GB40 Lithium Jump Starter", "Automotive", 7995.0, 9995.0, "🔋", "https://images.unsplash.com/photo-1486006920555-c77dce18193b", "Popular", "popular", 4.9, 1950, "1000 Amp 12V portable car battery booster pack.", ["#333", "#e94560"], 60),
            ("Baseus Wireless Car Phone Charger Mount", "Automotive", 2499.0, 2999.0, "📱", "https://images.unsplash.com/photo-1583394838336-acd977736f90", "New", "new", 4.7, 520, "15W fast auto-clamping Qi wireless sensor mount.", ["#333"], 85),
            ("Chemical Guys 16-Piece Car Wash Kit", "Automotive", 7999.0, 8999.0, "🧽", "https://images.unsplash.com/photo-1607860108855-64acf2078ed9", "Sale", "sale", 4.8, 870, "Complete car detailing bucket with foam gun & microfiber.", ["#333", "#4a90d9"], 30),
            ("AstroAI Portable Air Compressor 150PSI", "Automotive", 2499.0, 2999.0, "🚗", "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98", "Popular", "popular", 4.8, 1420, "Digital tire inflator with LED emergency light.", ["#333", "#gold"], 110),

            # Toys & Games (5 items)
            ("LEGO Star Wars Millennium Falcon 75257", "Toys & Games", 14999.0, 16999.0, "🚀", "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60", "Popular", "popular", 4.9, 1280, "Iconic starship model kit with 1,351 pieces.", ["#silver"], 35),
            ("DJI Mini 3 Pro Drone 4K Camera", "Toys & Games", 62900.0, 69900.0, "🛸", "https://images.unsplash.com/photo-1527977966376-1c8408f9f108", "Trending", "trending", 4.9, 640, "Under 249g lightweight drone, 4K/60fps HDR video, 34-min flight.", ["#silver"], 18),
            ("Catan Board Game 5th Edition", "Toys & Games", 3499.0, 3999.0, "🎲", "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09", "Popular", "popular", 4.8, 2400, "Picture yourself in the era of discoveries: trade, build, settle.", [], 90),
            ("Hasbro Monopoly Classic Board Game", "Toys & Games", 1499.0, 1899.0, "🏠", "https://images.unsplash.com/photo-1611891487122-207579d67d98", "Sale", "sale", 4.7, 3100, "Fast-dealing property trading game for the whole family.", [], 140),
            ("Tamagotchi Pix Interactive Cyber Pet", "Toys & Games", 3299.0, 3999.0, "🐣", "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088", "New", "new", 4.6, 430, "Camera & touch buttons to feed, nurture, and customize your pet.", ["#e94560", "#4a90d9"], 70)
        ]

        # Force reseed if count mismatch or prices are old USD (< 300)
        needs_reseed = not existing_prods or len(existing_prods) < len(base_catalog) or any(p.price < 300 for p in existing_prods)
        if needs_reseed:
            for old_p in existing_prods:
                await db.delete(old_p)
            await db.flush()

            for name, cat_name, price, old_price, emoji, img, badge, tag, rating, revs, desc, colors, stock in base_catalog:
                cat_id = cat_map.get(cat_name)
                p = Product(
                    name=name,
                    category_id=cat_id,
                    price=price,
                    old_price=old_price,
                    emoji=emoji,
                    image_url=img,
                    badge=badge,
                    rating=rating,
                    reviews_count=revs,
                    tag=tag,
                    description=desc,
                    colors=colors,
                    stock=stock,
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
app.include_router(wishlist_router, prefix=f"{prefix}/wishlist", tags=["Wishlist"])
app.include_router(reviews_router, prefix=f"{prefix}", tags=["Product Reviews"])
app.include_router(orders_router, prefix=f"{prefix}/orders", tags=["Orders & Checkout"])
app.include_router(payments_router, prefix=f"{prefix}/payments", tags=["Payments"])
app.include_router(recommendations_router, prefix=f"{prefix}/recommendations", tags=["AI Recommendations"])
app.include_router(chatbot_router, prefix=f"{prefix}/chatbot", tags=["AI Support Chatbot"])
app.include_router(addresses_router, prefix=f"{prefix}/addresses", tags=["Delivery Addresses"])
app.include_router(admin_router, prefix=f"{prefix}/admin", tags=["Admin & Seller Dashboard"])

from fastapi.responses import FileResponse
import os

HTML_FILE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "basic.html"))

@app.get("/")
async def root():
    if os.path.exists(HTML_FILE_PATH):
        return FileResponse(HTML_FILE_PATH)
    return {
        "app_name": settings.APP_NAME,
        "version": "1.0.0",
        "status": "healthy",
        "docs_url": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "ok", "database": "connected"}
