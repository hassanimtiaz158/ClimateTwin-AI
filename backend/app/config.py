"""
ClimateTwin AI — Application Configuration

All settings are loaded from environment variables (or a .env file).
"""

from __future__ import annotations

import json
from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central settings object populated from env / .env."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── Database ──────────────────────────────────────────────
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./climatetwin.db",
        description="Database connection string. Supports PostgreSQL and SQLite.",
    )

    # ── Redis (optional) ─────────────────────────────────────
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection string.",
    )
    USE_REDIS: bool = Field(default=False, description="Enable Redis caching layer.")

    # ── Security ─────────────────────────────────────────────
    SECRET_KEY: str = Field(
        default="",
        description="JWT signing secret. MUST be set in production.",
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30, ge=1, le=1440, description="JWT token lifetime in minutes."
    )
    ALGORITHM: str = Field(default="HS256", description="JWT algorithm.")

    # ── Server ───────────────────────────────────────────────
    API_HOST: str = Field(default="0.0.0.0", description="Uvicorn bind host.")
    API_PORT: int = Field(default=8000, ge=1, le=65535, description="Uvicorn bind port.")
    DEBUG: bool = Field(default=False, description="Toggle debug / dev mode.")

    # ── CORS ─────────────────────────────────────────────────
    # Declared as str (not list[str]) so pydantic-settings treats it as a
    # scalar and passes the raw env value through to the validator instead of
    # calling json.loads() on it. The validator handles JSON arrays,
    # comma-separated strings, single origins, and None/"" (→ default).
    CORS_ORIGINS: str = Field(
        default=(
            "http://localhost:3000,"
            "http://localhost:5173,"
            "http://127.0.0.1:3000,"
            "http://127.0.0.1:5173"
        ),
        description="Origins allowed by CORS. Accepts JSON array, comma-separated string, or a single origin.",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _parse_cors_origins(cls, v: str | list | None) -> list[str]:
        if v is None:
            return []
        if isinstance(v, list):
            return [str(o).strip() for o in v if str(o).strip()]
        s = str(v).strip()
        # pydantic-settings may wrap env values in extra quotes
        if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
            s = s[1:-1].strip()
        if not s:
            return []
        if s.startswith("["):
            try:
                parsed = json.loads(s)
                return [str(o).strip() for o in parsed if str(o).strip()]
            except json.JSONDecodeError:
                pass
        return [o.strip() for o in s.split(",") if o.strip()]

    # ── AI / ML ──────────────────────────────────────────────
    MODEL_PATH: str = Field(
        default="./models/trained", description="Directory for trained ML models."
    )
    DATASET_PATH: str = Field(
        default="./datasets", description="Directory for climate datasets."
    )
    DEFAULT_FORECAST_YEARS: int = Field(
        default=10, ge=1, le=30, description="Default projection horizon."
    )

    # ── Rate limiting ────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = Field(
        default=60, ge=1, description="Max requests per minute per client."
    )

    @field_validator("DATABASE_URL")
    @classmethod
    def _validate_db_url(cls, v: str) -> str:
        allowed = ("postgresql://", "postgresql+asyncpg://", "sqlite://", "sqlite+aiosqlite://")
        if not v.startswith(allowed):
            msg = f"DATABASE_URL must start with one of {allowed}"
            raise ValueError(msg)
        return v


@lru_cache()
def get_settings() -> Settings:
    """Return a cached singleton of Settings."""
    return Settings()


settings = get_settings()
