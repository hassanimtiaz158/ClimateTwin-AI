"""
ClimateTwin AI — FastAPI Application

Production-quality entry point.  Run with::

    uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import close_db, engine, init_db
from app.middleware import register_middleware

# ── Logging ────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("climatetwin")


# ── Lifespan ───────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Startup / shutdown lifecycle hooks."""
    logger.info("ClimateTwin AI API starting …  DEBUG=%s", settings.DEBUG)

    # ── Production safety checks ────────────────────────────
    if not settings.DEBUG:
        if not settings.SECRET_KEY:
            logger.critical(
                "SECRET_KEY is empty in production! "
                "JWT tokens will be insecure. Set SECRET_KEY env var."
            )
        if not settings.DATABASE_URL.startswith("postgresql"):
            logger.warning(
                "Using SQLite in production. "
                "Switch to PostgreSQL for persistent storage."
            )

    # Dev convenience: auto-create tables.  Use Alembic in production.
    if settings.DEBUG:
        try:
            await init_db()
        except Exception as exc:
            logger.warning("DB init skipped — %s", exc)

    yield  # ── app is running ──

    logger.info("ClimateTwin AI API shutting down …")
    await close_db()


# ── Application factory ────────────────────────────────────────
def create_app() -> FastAPI:
    """Build and return the fully-configured FastAPI application."""

    _app = FastAPI(
        title="ClimateTwin AI API",
        description=(
            "AI-powered climate scenario simulation platform. "
            "Create scenarios, run projections, and get AI recommendations."
        ),
        version="1.0.0",
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────
    _app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Custom middleware (timing, etc.) ──────────────────────
    register_middleware(_app)

    # ── Global error handler ──────────────────────────────────
    from fastapi import HTTPException

    @_app.exception_handler(Exception)
    async def _unhandled(request: Request, exc: Exception):
        if isinstance(exc, HTTPException):
            raise exc
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    # ── Core endpoints (no router needed) ─────────────────────
    @_app.get("/", tags=["Root"], summary="API root")
    async def root():
        """
        Public root endpoint.

        Returns basic API information and current status.
        """
        return {
            "name": "ClimateTwin AI API",
            "version": "1.0.0",
            "status": "running",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "docs": "/docs" if settings.DEBUG else "disabled",
            "environment": "development" if settings.DEBUG else "production",
        }

    @_app.get("/health", tags=["Health"], summary="Health check")
    async def health():
        """
        Health check endpoint used by load balancers, Docker, and monitoring.

        Always returns 200 when the process is alive.
        """
        return {
            "status": "healthy",
            "version": "1.0.0",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "uptime": time.process_time(),
        }

    # ── Register API routers ──────────────────────────────────
    _register_routers(_app)

    return _app


def _register_routers(app: FastAPI) -> None:
    """Import and mount all API routers."""
    from app.routers import (
        datasets,
        history,
        recommendations,
        results,
        scenarios,
        simulate,
    )

    routers = [
        (scenarios.router,       "/api/scenarios",       "Scenarios"),
        (simulate.router,        "/api/simulate",        "Simulation"),
        (results.router,         "/api/results",         "Results"),
        (history.router,         "/api/history",         "History"),
        (recommendations.router, "/api/recommendations", "AI Recommendations"),
        (datasets.router,        "/api/datasets",        "Datasets"),
    ]

    for router, prefix, tag in routers:
        app.include_router(router, prefix=prefix, tags=[tag])


# ── Module-level app instance (used by uvicorn) ───────────────
app = create_app()
