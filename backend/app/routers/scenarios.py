"""
Scenarios Router - CRUD operations for climate scenarios.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.scenario import ScenarioCreate, ScenarioResponse
from app.services.scenario_service import ScenarioService

router = APIRouter()


@router.post(
    "/",
    response_model=ScenarioResponse,
    status_code=201,
    summary="Create a new scenario",
)
async def create_scenario(
    config: ScenarioCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new climate scenario with selected actions and parameters.

    - **name**: Unique scenario name (3-100 chars)
    - **region**: Target region (e.g., "Global", "Europe")
    - **actions**: List of climate actions to simulate
    - **start_year**: Simulation start year (>= 2024)
    - **end_year**: Simulation end year (<= 2035)
    """
    service = ScenarioService(db)
    scenario = await service.create(config)
    return scenario


@router.get(
    "/{scenario_id}",
    response_model=ScenarioResponse,
    summary="Get scenario by ID",
)
async def get_scenario(
    scenario_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a single scenario by its unique ID."""
    service = ScenarioService(db)
    scenario = await service.get(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario


@router.get(
    "/",
    response_model=List[ScenarioResponse],
    summary="List all scenarios",
)
async def list_scenarios(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Max records to return"),
    db: AsyncSession = Depends(get_db),
):
    """List all scenarios with pagination, ordered by creation date (newest first)."""
    service = ScenarioService(db)
    scenarios = await service.list(skip=skip, limit=limit)
    return scenarios
