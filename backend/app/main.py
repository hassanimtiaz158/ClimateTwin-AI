from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine
from app.models import Base
from app.routers import scenarios, simulate, results, recommendations, datasets, history
from app.middleware import setup_middleware

app = FastAPI(
    title="ClimateTwin AI API",
    description="AI-powered climate scenario simulation platform",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup additional middleware
setup_middleware(app)

# Include routers
app.include_router(scenarios.router, prefix="/api/scenarios", tags=["Scenarios"])
app.include_router(simulate.router, prefix="/api/simulate", tags=["Simulation"])
app.include_router(results.router, prefix="/api/results", tags=["Results"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["AI Recommendations"])
app.include_router(datasets.router, prefix="/api/datasets", tags=["Datasets"])


@app.on_event("startup")
async def startup():
    # Create tables (for development - use Alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/")
async def root():
    return {
        "name": "ClimateTwin AI API",
        "version": "1.0.0",
        "docs": "/docs" if settings.DEBUG else "disabled",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
