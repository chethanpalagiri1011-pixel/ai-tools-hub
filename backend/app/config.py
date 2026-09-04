import os
from pydantic_settings import BaseSettings
from typing import List, Union

class Settings(BaseSettings):
    APP_NAME: str = "ShopEasy E-Commerce API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "super-secret-key-change-in-production-environment"
    API_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "sqlite+aiosqlite:///./shopeasy.db"
    DATABASE_URL_SYNC: str = "sqlite:///./shopeasy.db"

    JWT_SECRET_KEY: str = "jwt-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    CORS_ORIGINS: Union[str, List[str]] = "*"

    MOCK_PAYMENT_ENABLED: bool = True
    LLM_API_KEY: str = ""

    # Real SMS OTP Settings
    OTP_DEVELOPMENT_MODE: bool = False
    SMS_PROVIDER: str = "TWILIO"
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    MSG91_AUTH_KEY: str = ""
    FAST2SMS_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def get_cors_origins(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, str):
            if self.CORS_ORIGINS == "*":
                return ["*"]
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        return self.CORS_ORIGINS

    @property
    def get_async_db_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    @property
    def get_sync_db_url(self) -> str:
        url = self.DATABASE_URL_SYNC
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

settings = Settings()
