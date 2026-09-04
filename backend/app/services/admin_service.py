from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc
from sqlalchemy.orm import selectinload
from typing import Dict, Any

from app.models.user import User, UserRole
from app.models.product import Product
from app.models.order import Order, OrderStatus

class AdminService:
    @staticmethod
    async def get_admin_dashboard(db: AsyncSession) -> Dict[str, Any]:
        # Total Users
        users_cnt = (await db.execute(select(func.count(User.id)))).scalar() or 0
        
        # Total Products & Low Stock Products
        products_cnt = (await db.execute(select(func.count(Product.id)).filter(Product.is_active == True))).scalar() or 0
        low_stock_res = await db.execute(
            select(Product).filter(Product.is_active == True, Product.stock <= 10).limit(10)
        )
        low_stock_products = [
            {"id": p.id, "name": p.name, "stock": p.stock, "price": p.price} for p in low_stock_res.scalars().all()
        ]

        # Total Orders & Total Revenue
        orders_cnt = (await db.execute(select(func.count(Order.id)))).scalar() or 0
        revenue = (await db.execute(
            select(func.sum(Order.total)).filter(Order.status != OrderStatus.CANCELLED)
        )).scalar() or 0.0

        # Recent Orders
        recent_orders_res = await db.execute(
            select(Order)
            .options(selectinload(Order.user))
            .order_by(Order.created_at.desc())
            .limit(5)
        )
        recent_orders = [
            {
                "id": o.id,
                "tracking_number": o.tracking_number,
                "customer_name": o.user.name if o.user else "Customer",
                "total": o.total,
                "status": o.status.value,
                "created_at": o.created_at.isoformat() if o.created_at else None
            } for o in recent_orders_res.scalars().all()
        ]

        return {
            "total_users": users_cnt,
            "total_products": products_cnt,
            "total_orders": orders_cnt,
            "total_revenue": round(float(revenue), 2),
            "low_stock_count": len(low_stock_products),
            "low_stock_products": low_stock_products,
            "recent_orders": recent_orders
        }

    @staticmethod
    async def get_seller_dashboard(db: AsyncSession, seller_id: int) -> Dict[str, Any]:
        # Seller Products
        prod_res = await db.execute(
            select(Product).filter(Product.seller_id == seller_id, Product.is_active == True)
        )
        seller_products = prod_res.scalars().all()

        low_stock = [
            {"id": p.id, "name": p.name, "stock": p.stock, "price": p.price}
            for p in seller_products if p.stock <= 10
        ]

        return {
            "total_products": len(seller_products),
            "low_stock_count": len(low_stock),
            "low_stock_products": low_stock,
            "seller_products": [
                {"id": p.id, "name": p.name, "price": p.price, "stock": p.stock, "rating": p.rating}
                for p in seller_products
            ]
        }
