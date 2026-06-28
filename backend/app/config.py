from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = Field(
        default="postgresql://user:password@localhost:5432/climatetwin",
        description="PostgreSQL connection string"
    )
    
    # Redis
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection string"
    )
    
    # Security
    SECRET_KEY: str = Field(
        default="change-me-in-production",
        description="JWT secret key"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = True
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://climatetwin.vercel.app",
    ]
    
    # AI/ML
    MODEL_PATH: str = "./models/trained"
    DATASET_PATH: str = "./datasets"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
