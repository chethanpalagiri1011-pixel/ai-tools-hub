from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_, desc, asc, func
from fastapi import HTTPException, status
from typing import List, Optional, Dict, Any
from app.models.product import Product
from app.models.category import Category
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from sqlalchemy.orm import selectinload

class ProductService:
    @staticmethod
    async def list_products(
        db: AsyncSession,
        search: Optional[str] = None,
        category: Optional[str] = None,
        tag: Optional[str] = None,
        sort: Optional[str] = None,
        skip: int = 0,
        limit: int = 200
    ) -> List[ProductResponse]:
        query = select(Product).options(selectinload(Product.category)).filter(Product.is_active == True)

        if category and category.lower() != "all":
            query = query.join(Product.category).filter(
                or_(Category.name.ilike(f"%{category}%"), Category.slug.ilike(f"%{category}%"))
            )

        if tag and tag.lower() != "all":
            query = query.filter(Product.tag == tag.lower())

        if search:
            query = query.filter(
                or_(
                    Product.name.ilike(f"%{search}%"),
                    Product.description.ilike(f"%{search}%"),
                    Product.badge.ilike(f"%{search}%")
                )
            )

        if sort == "price-low":
            query = query.order_by(asc(Product.price))
        elif sort == "price-high":
            query = query.order_by(desc(Product.price))
        elif sort == "rating":
            query = query.order_by(desc(Product.rating))
        elif sort == "name":
            query = query.order_by(asc(Product.name))
        else:
            query = query.order_by(desc(Product.id))

        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        products = result.scalars().all()

        responses = []
        for p in products:
            resp = ProductResponse.model_validate(p)
            if p.category:
                resp.category_name = p.category.name
            responses.append(resp)
        return responses

    @staticmethod
    async def search_products(
        db: AsyncSession,
        q: Optional[str] = None,
        category: Optional[str] = None,
        brand: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        in_stock: Optional[bool] = None,
        sort: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> Dict[str, Any]:
        query = select(Product).options(selectinload(Product.category)).filter(Product.is_active == True)

        if category and category.lower() != "all":
            query = query.join(Product.category).filter(
                or_(Category.name.ilike(f"%{category}%"), Category.slug.ilike(f"%{category}%"))
            )

        if q:
            term = f"%{q.strip()}%"
            query = query.filter(
                or_(
                    Product.name.ilike(term),
                    Product.description.ilike(term),
                    Product.badge.ilike(term),
                    Product.tag.ilike(term)
                )
            )

        if brand:
            query = query.filter(
                or_(
                    Product.name.ilike(f"%{brand}%"),
                    Product.description.ilike(f"%{brand}%")
                )
            )

        if min_price is not None:
            query = query.filter(Product.price >= min_price)

        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        if in_stock:
            query = query.filter(Product.stock > 0)

        # Count total matching items
        count_query = select(func.count()).select_from(query.subquery())
        count_res = await db.execute(count_query)
        total = count_res.scalar_one()

        if sort == "price-low":
            query = query.order_by(asc(Product.price))
        elif sort == "price-high":
            query = query.order_by(desc(Product.price))
        elif sort == "rating":
            query = query.order_by(desc(Product.rating))
        elif sort == "name":
            query = query.order_by(asc(Product.name))
        else:
            query = query.order_by(desc(Product.id))

        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        products = result.scalars().all()

        items = []
        for p in products:
            resp = ProductResponse.model_validate(p)
            if p.category:
                resp.category_name = p.category.name
            items.append(resp)

        return {
            "total": total,
            "skip": skip,
            "limit": limit,
            "items": items
        }

    @staticmethod
    async def get_product_by_id(db: AsyncSession, product_id: int) -> ProductResponse:
        result = await db.execute(select(Product).options(selectinload(Product.category)).filter(Product.id == product_id))
        product = result.scalars().first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        resp = ProductResponse.model_validate(product)
        if product.category:
            resp.category_name = product.category.name
        return resp

    @staticmethod
    async def create_product(db: AsyncSession, product_data: ProductCreate, seller_id: int) -> ProductResponse:
        new_product = Product(
            name=product_data.name,
            description=product_data.description,
            price=product_data.price,
            old_price=product_data.old_price,
            emoji=product_data.emoji or "📦",
            badge=product_data.badge,
            tag=product_data.tag,
            rating=product_data.rating or 5.0,
            reviews_count=product_data.reviews_count or 0,
            colors=product_data.colors or [],
            stock=product_data.stock if product_data.stock is not None else 100,
            is_active=product_data.is_active if product_data.is_active is not None else True,
            category_id=product_data.category_id,
            seller_id=seller_id
        )
        db.add(new_product)
        await db.commit()
        await db.refresh(new_product)
        return ProductResponse.model_validate(new_product)

    @staticmethod
    async def update_product(db: AsyncSession, product_id: int, update_data: ProductUpdate, user: User) -> ProductResponse:
        result = await db.execute(select(Product).filter(Product.id == product_id))
        product = result.scalars().first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        if user.role != "admin" and product.seller_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this product")

        for key, value in update_data.model_dump(exclude_unset=True).items():
            setattr(product, key, value)

        await db.commit()
        await db.refresh(product)
        return ProductResponse.model_validate(product)

    @staticmethod
    async def delete_product(db: AsyncSession, product_id: int, user: User) -> dict:
        result = await db.execute(select(Product).filter(Product.id == product_id))
        product = result.scalars().first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        if user.role != "admin" and product.seller_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this product")

        product.is_active = False
        await db.commit()
        return {"message": "Product deactivated successfully"}
