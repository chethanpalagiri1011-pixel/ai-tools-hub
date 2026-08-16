from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from typing import List
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.utils.helpers import slugify

class CategoryService:
    @staticmethod
    async def list_categories(db: AsyncSession) -> List[CategoryResponse]:
        result = await db.execute(select(Category).order_by(Category.name.asc()))
        categories = result.scalars().all()
        return [CategoryResponse.model_validate(c) for c in categories]

    @staticmethod
    async def get_category(db: AsyncSession, category_id: int) -> CategoryResponse:
        result = await db.execute(select(Category).filter(Category.id == category_id))
        cat = result.scalars().first()
        if not cat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        return CategoryResponse.model_validate(cat)

    @staticmethod
    async def create_category(db: AsyncSession, cat_data: CategoryCreate) -> CategoryResponse:
        slug = cat_data.slug or slugify(cat_data.name)
        existing = await db.execute(select(Category).filter((Category.name == cat_data.name) | (Category.slug == slug)))
        if existing.scalars().first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category already exists")

        new_cat = Category(
            name=cat_data.name,
            slug=slug,
            description=cat_data.description
        )
        db.add(new_cat)
        await db.commit()
        await db.refresh(new_cat)
        return CategoryResponse.model_validate(new_cat)

    @staticmethod
    async def update_category(db: AsyncSession, category_id: int, update_data: CategoryUpdate) -> CategoryResponse:
        result = await db.execute(select(Category).filter(Category.id == category_id))
        cat = result.scalars().first()
        if not cat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        if update_data.name is not None:
            cat.name = update_data.name
            cat.slug = update_data.slug or slugify(update_data.name)
        if update_data.description is not None:
            cat.description = update_data.description

        await db.commit()
        await db.refresh(cat)
        return CategoryResponse.model_validate(cat)

    @staticmethod
    async def delete_category(db: AsyncSession, category_id: int) -> dict:
        result = await db.execute(select(Category).filter(Category.id == category_id))
        cat = result.scalars().first()
        if not cat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        await db.delete(cat)
        await db.commit()
        return {"message": "Category deleted successfully"}
