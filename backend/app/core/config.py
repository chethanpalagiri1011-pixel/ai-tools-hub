from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./ai_tools_hub.db"

    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # App
    APP_NAME: str = "AI Tools Hub"
    DEBUG: bool = True
    CORS_ORIGINS: list = ["http://localhost:3000"]

    # Email
    GMAIL_ADDRESS: str
    GMAIL_APP_PASSWORD: str

    class Config:
        env_file = ".env"

settings = Settings()