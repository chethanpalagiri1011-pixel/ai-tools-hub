from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class PlanType(str, enum.Enum):
    free = "Free"
    pro  = "Pro"
    team = "Team"

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False)
    email      = Column(String(255), unique=True, index=True, nullable=False)
    password   = Column(String(255), nullable=False)
    phone      = Column(String(30), nullable=True)
    plan       = Column(Enum(PlanType), default=PlanType.free)
    credits    = Column(Integer, default=50)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    history = relationship("GenerationHistory", back_populates="user", cascade="all, delete-orphan")


class GenerationHistory(Base):
    __tablename__ = "generation_history"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    type       = Column(String(20), nullable=False)  # image|summary|caption|prompt
    prompt     = Column(Text, nullable=True)
    result     = Column(Text, nullable=True)
    metadata_  = Column(Text, nullable=True)  # JSON blob for extra data
    saved      = Column(Boolean, default=False)
    credits_used = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="history")
