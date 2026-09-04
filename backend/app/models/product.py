from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), index=True, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    old_price = Column(Float, nullable=True)
    emoji = Column(String(10), default="📦", nullable=False)
    image_url = Column(String(500), nullable=True)
    badge = Column(String(50), nullable=True)  # e.g., 'Sale', 'New', 'Popular'
    tag = Column(String(50), index=True, nullable=True)    # e.g., 'sale', 'new', 'popular', 'trending'
    rating = Column(Float, default=5.0, nullable=False)
    reviews_count = Column(Integer, default=0, nullable=False)
    colors = Column(JSON, default=list, nullable=False) # List of color hex/strings
    stock = Column(Integer, default=100, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("Category", back_populates="products")
    seller = relationship("User", back_populates="products")
    cart_items = relationship("CartItem", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")
