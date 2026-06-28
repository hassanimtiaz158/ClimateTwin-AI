"""
ClimateTwin AI - Application Configuration

Loads settings from environment variables and .env file.
"""

from typing import List
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ----------------------------
    # Database
    # ----------------------------
    DATABASE_URL: str = Field(
        default="postgresql://user:password@localhost:5432/climatetwin",
        description="PostgreSQL connection string",
    )

    # ----------------------------
    # Redis (optional for caching)
    # ----------------------------
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection string",
    )
    USE_REDIS: bool = Field(default=False, description="Enable Redis caching")

    # ----------------------------
    # Security
    # ----------------------------
    SECRET_KEY: str = Field(
        default="super-secret-change-in-production",
        description="JWT signing key",
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30, ge=1, le=1440, description="Token expiry in minutes"
    )
    ALGORITHM: str = Field(default="HS256", description="JWT algorithm")

    # ----------------------------
    # API Server
    # ----------------------------
    API_HOST: str = Field(default="0.0.0.0", description="API bind host")
    API_PORT: int = Field(default=8000, ge=1, le=65535, description="API bind port")
    DEBUG: bool = Field(default=True, description="Enable debug mode")

    # ----------------------------
    # CORS
    # ----------------------------
    ALLOWED_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "https://climatetwin.vercel.app",
        ],
        description="Allowed CORS origins",
    )

    # ----------------------------
    # AI / ML
    # ----------------------------
    MODEL_PATH: str = Field(
        default="./models/trained", description="Path to trained ML models"
    )
    DATASET_PATH: str = Field(
        default="./datasets", description="Path to climate datasets"
    )
    DEFAULTFORECAST_YEARS: int = Field(
        default=10, ge=1, le=30, description="Default projection horizon"
    )

    # ----------------------------
    # Rate Limiting
    # ----------------------------
    RATE_LIMIT_PER_MINUTE: int = Field(
        default=60, ge=1, description="Requests per minute limit"
    )

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        """Ensure DATABASE_URL uses a supported driver."""
        valid_prefixes = [
            "postgresql://",
            "postgresql+asyncpg://",
            "sqlite://",
            "sqlite+aiosqlite://",
        ]
        if not any(v.startswith(p) for p in valid_prefixes):
            raise ValueError(
                f"DATABASE_URL must start with one of: {valid_prefixes}"
            )
        return v


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()


settings = get_settings()
