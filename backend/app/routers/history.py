from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.simulation import SimulationStatus
from app.services.simulation_service import SimulationService

router = APIRouter()


@router.get("/", response_model=List[SimulationStatus])
async def get_history(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """Get simulation history."""
    service = SimulationService(db)
    runs = await service.get_history(skip=skip, limit=limit)
    return runs
