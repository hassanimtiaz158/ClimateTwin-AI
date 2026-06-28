"""
ClimateTwin AI - Database Configuration

Async SQLAlchemy engine, session factory, and dependency injection.
"""

import logging
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.config import settings

logger = logging.getLogger(__name__)


# ---------------------
# Engine
# ---------------------
def _build_database_url(url: str) -> str:
    """Convert synchronous PostgreSQL URL to async driver URL."""
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if url.startswith("sqlite://"):
        return url.replace("sqlite://", "sqlite+aiosqlite://", 1)
    return url


async_database_url = _build_database_url(settings.DATABASE_URL)

engine = create_async_engine(
    async_database_url,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
    # Use NullPool for SQLite (test) to avoid pool issues
    connect_args={"check_same_thread": False} if "sqlite" in async_database_url else {},
    poolclass=NullPool if "sqlite" in async_database_url else None,
)

logger.info(f"Database engine created for: {async_database_url.split('@')[-1]}")


# ---------------------
# Session Factory
# ---------------------
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ---------------------
# Base Model
# ---------------------
class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


# ---------------------
# Dependency
# ---------------------
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session.

    Usage:
        @router.get("/")
        async def handler(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            logger.exception("Database session error — rolled back")
            raise
        finally:
            await session.close()


# ---------------------
# Helper
# ---------------------
async def init_db() -> None:
    """Create all tables (dev convenience — use Alembic in prod)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("All tables created.")


async def close_db() -> None:
    """Dispose of the engine connection pool."""
    await engine.dispose()
    logger.info("Database engine disposed.")
