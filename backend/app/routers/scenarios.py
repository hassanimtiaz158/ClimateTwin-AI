from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.scenario import ScenarioCreate, ScenarioResponse
from app.services.scenario_service import ScenarioService

router = APIRouter()


@router.post("/", response_model=ScenarioResponse)
async def create_scenario(
    config: ScenarioCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new climate scenario."""
    service = ScenarioService(db)
    scenario = await service.create(config)
    return scenario


@router.get("/{scenario_id}", response_model=ScenarioResponse)
async def get_scenario(
    scenario_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get scenario by ID."""
    service = ScenarioService(db)
    scenario = await service.get(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario


@router.get("/", response_model=List[ScenarioResponse])
async def list_scenarios(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    """List all scenarios."""
    service = ScenarioService(db)
    scenarios = await service.list(skip=skip, limit=limit)
    return scenarios
