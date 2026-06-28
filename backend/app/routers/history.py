"""
History Router - View past simulation runs.
"""

from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.simulation import SimulationStatus
from app.services.simulation_service import SimulationService

router = APIRouter()


@router.get(
    "/",
    response_model=List[SimulationStatus],
    summary="Get simulation history",
)
async def get_history(
    skip: int = Query(0, ge=0, description="Records to skip"),
    limit: int = Query(50, ge=1, le=200, description="Max records to return"),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve simulation history with pagination.

    Returns a list of simulation runs ordered by creation date (newest first).
    """
    service = SimulationService(db)
    runs = await service.get_history(skip=skip, limit=limit)
    return runs
