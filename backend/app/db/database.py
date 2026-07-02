import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# If we are on Render, they provide a DATABASE_URL for Postgres.
# Otherwise, we use our local SQLite database.
DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    # Render's Postgres URLs start with postgres:// but SQLAlchemy requires postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL)
else:
    # Local SQLite
    DATABASE_URL = "sqlite:///./ai_tools_hub.db"
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
