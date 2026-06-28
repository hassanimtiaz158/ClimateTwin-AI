"""
ClimateTwin AI — Database Layer

Async SQLAlchemy engine, session factory, and FastAPI dependency.
"""

from __future__ import annotations

import logging
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

logger = logging.getLogger(__name__)


# ── URL normalisation ──────────────────────────────────────────
def _to_async_url(url: str) -> str:
    """Ensure the database URL uses the async driver."""
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if url.startswith("sqlite://"):
        return url.replace("sqlite://", "sqlite+aiosqlite://", 1)
    return url


_async_url = _to_async_url(settings.DATABASE_URL)

# ── Engine ─────────────────────────────────────────────────────
_engine_kwargs: dict = dict(
    echo=settings.DEBUG,
    pool_pre_ping=True,
)

if "sqlite" in _async_url:
    _engine_kwargs.update(poolclass=None, connect_args={"check_same_thread": False})
else:
    _engine_kwargs.update(pool_size=10, max_overflow=20, pool_recycle=3600)

engine = create_async_engine(_async_url, **_engine_kwargs)
logger.info("Database engine ready (%s)", _async_url.split("@")[-1] if "@" in _async_url else _async_url)

# ── Session factory ────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ── Base model ─────────────────────────────────────────────────
class Base(DeclarativeBase):
    """Declarative base for all ORM models."""


# ── FastAPI dependency ─────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yield a database session and ensure proper cleanup.

    Usage in a router::

        from fastapi import Depends
        from app.database import get_db

        @router.get("/")
        async def handler(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            logger.exception("Session error — rolled back")
            raise
        finally:
            await session.close()


# ── Helpers ────────────────────────────────────────────────────
async def init_db() -> None:
    """Create all tables (dev convenience — use Alembic in prod)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("All tables created.")


async def close_db() -> None:
    """Dispose the engine connection pool."""
    await engine.dispose()
    logger.info("Database engine disposed.")
