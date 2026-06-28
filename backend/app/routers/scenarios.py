"""
Scenarios Router - CRUD operations for climate scenarios.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.scenario import ScenarioCreate, ScenarioResponse, ScenarioUpdate
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
    Create a new climate scenario with location and policy sliders.

    - **name**: Unique scenario name (3-100 chars)
    - **city**: Target city (default: "Global")
    - **country**: Target country (default: "Global")
    - **target_year**: Projection target year (2025-2050)
    - **renewable_energy_slider**: 0.0-1.0
    - **public_transit_slider**: 0.0-1.0
    - **reforestation_slider**: 0.0-1.0
    - **carbon_tax_slider**: 0.0-1.0
    - **green_innovation_slider**: 0.0-1.0
    - **notes**: Optional notes
    """
    service = ScenarioService(db)
    scenario = await service.create(config)
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


@router.patch(
    "/{scenario_id}",
    response_model=ScenarioResponse,
    summary="Update a scenario",
)
async def update_scenario(
    scenario_id: UUID,
    data: ScenarioUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Partially update a scenario. Only provided fields are updated.

    - **name**: Scenario name (3-100 chars)
    - **city**: Target city
    - **country**: Target country
    - **target_year**: Projection target year (2025-2050)
    - **renewable_energy_slider**: 0.0-1.0
    - **public_transit_slider**: 0.0-1.0
    - **reforestation_slider**: 0.0-1.0
    - **carbon_tax_slider**: 0.0-1.0
    - **green_innovation_slider**: 0.0-1.0
    - **notes**: Optional notes
    """
    service = ScenarioService(db)
    scenario = await service.update(scenario_id, data)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario


@router.delete(
    "/{scenario_id}",
    status_code=204,
    summary="Delete a scenario",
)
async def delete_scenario(
    scenario_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Delete a scenario and all associated simulation runs."""
    service = ScenarioService(db)
    deleted = await service.delete(scenario_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Scenario not found")
