"""
ClimateTwin AI - FastAPI Application Entry Point
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine, Base

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# ---------------------
# Lifespan (startup / shutdown)
# ---------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown."""
    # --- STARTUP ---
    logger.info("Starting ClimateTwin AI API...")
    logger.info(f"DEBUG mode: {settings.DEBUG}")

    # Create database tables (dev only — use Alembic in production)
    if settings.DEBUG:
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created/verified.")
        except Exception as exc:
            logger.warning(f"Could not connect to database on startup: {exc}")
            logger.warning("Set DATABASE_URL to a running PostgreSQL instance or use SQLite.")

    yield  # App is running

    # --- SHUTDOWN ---
    logger.info("Shutting down ClimateTwin AI API...")
    await engine.dispose()
    logger.info("Database connections closed.")


# ---------------------
# Application Factory
# ---------------------
def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    application = FastAPI(
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

    # --- CORS Middleware ---
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Request Timing Middleware ---
    @application.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        import time
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = f"{process_time:.4f}"
        return response

    # --- Global Exception Handler ---
    @application.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    # --- Register Routers ---
    from app.routers import (
        scenarios,
        simulate,
        results,
        recommendations,
        datasets,
        history,
    )

    application.include_router(scenarios.router, prefix="/api/scenarios", tags=["Scenarios"])
    application.include_router(simulate.router, prefix="/api/simulate", tags=["Simulation"])
    application.include_router(results.router, prefix="/api/results", tags=["Results"])
    application.include_router(history.router, prefix="/api/history", tags=["History"])
    application.include_router(
        recommendations.router, prefix="/api/recommendations", tags=["AI Recommendations"]
    )
    application.include_router(datasets.router, prefix="/api/datasets", tags=["Datasets"])

    # --- Health & Root Endpoints ---
    @application.get("/", tags=["Root"])
    async def root():
        return {
            "name": "ClimateTwin AI API",
            "version": "1.0.0",
            "status": "running",
            "docs": "/docs" if settings.DEBUG else "disabled",
        }

    @application.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "healthy", "version": "1.0.0"}

    return application


# ---------------------
# Create app instance
# ---------------------
app = create_app()
