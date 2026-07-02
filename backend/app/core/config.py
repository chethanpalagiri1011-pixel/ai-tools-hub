import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Tools Hub"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = "supersecretkey_please_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # App
    APP_NAME: str = "AI Tools Hub"
    DEBUG: bool = True
    CORS_ORIGINS: list = ["http://localhost:3000", "https://ai-tools-hub-xxxx.vercel.app", "*"]
    
    # Database
    DATABASE_URL: str = "sqlite:///./ai_tools_hub.db"
    
    # External APIs (Optional for startup)
    OPENAI_API_KEY: str = ""
    STABILITY_API_KEY: str = ""

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()