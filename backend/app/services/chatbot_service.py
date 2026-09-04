import re
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_, desc
from typing import Optional, Dict, Any, List
from app.models.user import User
from app.models.order import Order
from app.models.product import Product
from app.models.category import Category

class ChatbotService:
    CATEGORY_MAPPINGS = {
        "smartphone": "Electronics",
        "headphone": "Electronics",
        "earphone": "Electronics",
        "playstation": "Gaming",
        "computer": "Electronics",
        "macbook": "Electronics",
        "earbud": "Electronics",
        "speaker": "Electronics",
        "monitor": "Electronics",
        "backpack": "Accessories",
        "sunglass": "Accessories",
        "cleanser": "Beauty",
        "sunscreen": "Beauty",
        "lipstick": "Beauty",
        "sneaker": "Fashion",
        "vacuum": "Home & Living",
        "purifier": "Home & Living",
        "coffee": "Home & Living",
        "fryer": "Home & Living",
        "laptop": "Electronics",
        "iphone": "Electronics",
        "mobile": "Electronics",
        "camera": "Electronics",
        "watch": "Electronics",
        "drone": "Toys & Games",
        "phone": "Electronics",
        "shoe": "Fashion",
        "boot": "Fashion",
        "jean": "Fashion",
        "hoodie": "Fashion",
        "jacket": "Fashion",
        "blazer": "Fashion",
        "shirt": "Fashion",
        "wallet": "Accessories",
        "bag": "Accessories",
        "game": "Gaming",
        "console": "Gaming",
        "xbox": "Gaming",
        "switch": "Gaming",
        "serum": "Beauty",
        "book": "Books"
    }

    BRANDS = [
        "apple", "samsung", "sony", "nike", "levi's", "levis", "adidas", "dell", 
        "bose", "jbl", "gopro", "canon", "anker", "logitech", "asus", "dyson", 
        "ray-ban", "playstation", "xbox", "nintendo", "razer", "steelseries",
        "fossil", "herschel", "samsonite", "instant pot", "nespresso", "philips",
        "garmin", "lululemon", "bowflex", "cerave", "mac", "olaplex", "oneplus",
        "xiaomi", "redmi", "realme", "hp"
    ]

    FAQ_RESPONSES = {
        "shipping": "We offer free standard delivery on all orders over ₹500 across India! Standard shipping takes 2-4 business days.",
        "delivery": "Standard delivery takes 2-4 business days. Express same-day delivery is available in major metro cities.",
        "return": "We accept easy 30-day hassle-free returns! Items must be unused with original tag and packaging.",
        "cancellation": "You can cancel your order anytime before it enters the 'SHIPPED' status directly from your Orders page.",
        "payment": "We accept credit/debit cards, UPI (GPay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD).",
        "contact": "Contact our 24/7 customer support team at support@shopeasy.in or call toll-free at 1800-123-7467."
    }

    @staticmethod
    def _parse_max_price(text: str) -> Optional[float]:
        text_clean = text.lower().replace(",", "").replace("₹", "").replace("rs", "")
        
        k_match = re.search(r'(?:under|below|less than|within|around|\b)\s*(\d+(?:\.\d+)?)\s*k\b', text_clean)
        if k_match:
            return float(k_match.group(1)) * 1000.0

        num_match = re.search(r'(?:under|below|less than|within|max|budget)\s*(\d+)', text_clean)
        if num_match:
            return float(num_match.group(1))
        
        digits_match = re.findall(r'\b\d{3,7}\b', text_clean)
        if digits_match:
            return float(digits_match[0])
            
        return None

    @staticmethod
    def _extract_brand(text: str) -> Optional[str]:
        text_lower = text.lower()
        sorted_brands = sorted(ChatbotService.BRANDS, key=len, reverse=True)
        for b in sorted_brands:
            if b in text_lower:
                return b
        return None

    @staticmethod
    def _extract_keyword(text: str) -> Optional[str]:
        text_lower = text.lower()
        sorted_kws = sorted(ChatbotService.CATEGORY_MAPPINGS.keys(), key=len, reverse=True)
        for kw in sorted_kws:
            if kw in text_lower:
                return kw
        return None

    @staticmethod
    async def process_chat_message(
        db: AsyncSession,
        message: str,
        user: Optional[User] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        msg_raw = message.strip()
        msg_lower = msg_raw.lower()
        ctx = context or {}

        # 1. Greetings
        if msg_lower in ["hi", "hello", "hey", "namaste", "good morning", "good evening", "greetings"]:
            return {
                "message": "Hi! 👋 Welcome to ShopEasy AI. What are you looking for today? (e.g. phones under ₹20,000, laptops for college, headphones under ₹3,000)",
                "intent": "GREETING",
                "products": [],
                "context": {}
            }

        # 2. Order Status / Order History
        if any(w in msg_lower for w in ["order", "track", "status", "shipped", "package", "my order"]):
            if not user:
                return {
                    "message": "Please log in to your ShopEasy account to view your live order details and tracking status.",
                    "intent": "ORDER_STATUS",
                    "requires_auth": True,
                    "products": [],
                    "context": ctx
                }
            
            res = await db.execute(
                select(Order)
                .filter(Order.user_id == user.id)
                .order_by(Order.created_at.desc())
            )
            orders = res.scalars().all()
            if not orders:
                return {
                    "message": f"Hi {user.name}! You haven't placed any orders yet. Explore our top deals and start shopping today!",
                    "intent": "ORDER_STATUS",
                    "products": [],
                    "context": ctx
                }
            
            latest = orders[0]
            status_desc = {
                "pending": "Order Received & Pending Confirmation",
                "confirmed": "Confirmed & Packing in Warehouse",
                "processing": "Processing & Quality Checked",
                "shipped": "Shipped & In Transit",
                "out_for_delivery": "Out for Delivery Today!",
                "delivered": "Delivered Successfully",
                "cancelled": "Order Cancelled"
            }.get(latest.status.value, latest.status.value)

            return {
                "message": f"Hi {user.name}! Your latest order #{latest.tracking_number} is currently **{status_desc}**. Total Amount: ₹{latest.total:,.2f}.",
                "intent": "ORDER_STATUS",
                "products": [],
                "order_details": {
                    "tracking_number": latest.tracking_number,
                    "status": latest.status.value,
                    "total": latest.total
                },
                "context": ctx
            }

        # 3. FAQs
        for faq_key, faq_resp in ChatbotService.FAQ_RESPONSES.items():
            if faq_key in msg_lower:
                return {
                    "message": faq_resp,
                    "intent": "GENERAL_FAQ",
                    "products": [],
                    "context": ctx
                }

        # 4. Check for Specific Product Model Search (e.g., "iPhone 15", "iPhone 17", "Galaxy A54")
        model_match = re.search(r'\b(iphone\s*\d+|galaxy\s*\w+|macbook\s*\w+|redmi\s*note\s*\d+|nord\s*\d*)\b', msg_lower)
        if model_match:
            target_model = model_match.group(0).strip()
            # Search PostgreSQL for exact model match
            model_res = await db.execute(
                select(Product).filter(
                    Product.is_active == True,
                    Product.name.ilike(f"%{target_model}%")
                )
            )
            model_products = model_res.scalars().all()
            if not model_products:
                return {
                    "message": f"Sorry, {target_model.title()} is currently not available on ShopEasy.",
                    "intent": "PRODUCT_SEARCH",
                    "products": [],
                    "context": ctx
                }
            
            # Check stock
            in_stock_models = [p for p in model_products if p.stock > 0]
            if not in_stock_models:
                return {
                    "message": f"Sorry, {target_model.title()} is currently out of stock on ShopEasy.",
                    "intent": "PRODUCT_SEARCH",
                    "products": [],
                    "context": ctx
                }
            
            prod_list = [{
                "id": p.id, "name": p.name, "price": p.price, "old_price": p.old_price,
                "rating": p.rating, "reviews_count": p.reviews_count, "emoji": p.emoji,
                "image_url": p.image_url, "badge": p.badge, "stock": p.stock
            } for p in in_stock_models]

            return {
                "message": f"Great! Here is the {target_model.title()} available on ShopEasy:",
                "intent": "PRODUCT_SEARCH",
                "products": prod_list,
                "context": ctx
            }

        # 5. Extract Parameters from message + context chaining
        extracted_keyword = ChatbotService._extract_keyword(msg_lower) or ctx.get("keyword")
        extracted_brand = ChatbotService._extract_brand(msg_lower) or ctx.get("brand")
        extracted_price = ChatbotService._parse_max_price(msg_lower) or ctx.get("max_price")

        new_ctx = {}
        if extracted_keyword: new_ctx["keyword"] = extracted_keyword
        if extracted_brand: new_ctx["brand"] = extracted_brand
        if extracted_price: new_ctx["max_price"] = extracted_price

        # 6. Database Product Query Construction
        query = select(Product).filter(Product.is_active == True, Product.stock > 0)

        # Keyword filter
        if extracted_keyword:
            query = query.filter(
                or_(
                    Product.name.ilike(f"%{extracted_keyword}%"),
                    Product.description.ilike(f"%{extracted_keyword}%")
                )
            )

        # Brand filter
        if extracted_brand:
            query = query.filter(
                or_(
                    Product.name.ilike(f"%{extracted_brand}%"),
                    Product.description.ilike(f"%{extracted_brand}%")
                )
            )

        # Price filter
        if extracted_price:
            query = query.filter(Product.price <= extracted_price)

        # General text search fallback if no brand/keyword detected
        if not extracted_keyword and not extracted_brand and not extracted_price:
            words = [w for w in msg_lower.split() if len(w) > 2 and w not in ["need", "want", "show", "give", "find", "have", "look", "buy"]]
            if words:
                search_term = words[0]
                query = query.filter(
                    or_(
                        Product.name.ilike(f"%{search_term}%"),
                        Product.description.ilike(f"%{search_term}%")
                    )
                )

        # Rating / Discount sorting
        if any(w in msg_lower for w in ["highly rated", "top rated", "best", "4 star", "4.5"]):
            query = query.filter(Product.rating >= 4.5).order_by(desc(Product.rating))
        else:
            query = query.order_by(desc(Product.rating))

        query = query.limit(6)
        res = await db.execute(query)
        matched_products = res.scalars().all()

        # Format Product List for Response
        prod_list = []
        for p in matched_products:
            prod_list.append({
                "id": p.id,
                "name": p.name,
                "price": p.price,
                "old_price": p.old_price,
                "rating": p.rating,
                "reviews_count": p.reviews_count,
                "emoji": p.emoji,
                "image_url": p.image_url,
                "badge": p.badge,
                "stock": p.stock
            })

        # 7. Generate Natural Language Response (No Fake Substitutes)
        if prod_list:
            parts = []
            if extracted_brand: parts.append(extracted_brand.title())
            if extracted_keyword: parts.append(extracted_keyword.title() + "s")
            else: parts.append("Products")
            
            title_str = " ".join(parts)
            if extracted_price:
                price_formatted = f"₹{extracted_price:,.0f}"
                reply_msg = f"I found {len(prod_list)} {title_str} under {price_formatted} currently available on ShopEasy:"
            else:
                reply_msg = f"Here are {title_str} matching your search available on ShopEasy:"

            return {
                "message": reply_msg,
                "intent": "PRODUCT_SEARCH",
                "products": prod_list,
                "context": new_ctx
            }
        else:
            # Explicit unavailable response (Zero hallucinated products)
            query_desc = []
            if extracted_brand: query_desc.append(extracted_brand.title())
            if extracted_keyword: query_desc.append(extracted_keyword.lower() + "s")
            if extracted_price: query_desc.append(f"under ₹{extracted_price:,.0f}")

            search_summary = " ".join(query_desc) if query_desc else msg_raw
            return {
                "message": f"Sorry, no matching {search_summary} are currently available on ShopEasy.",
                "intent": "PRODUCT_SEARCH",
                "products": [],
                "context": new_ctx
            }
