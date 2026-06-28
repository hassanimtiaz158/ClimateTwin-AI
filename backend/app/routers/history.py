"""
History Router - View past simulation runs with pagination.
"""

import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.simulation import PaginatedHistoryResponse
from app.services.simulation_service import SimulationService

router = APIRouter()


@router.get(
    "/",
    response_model=PaginatedHistoryResponse,
    summary="Get simulation history",
)
async def get_history(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve simulation history with pagination.

    Returns a paginated list of simulation runs ordered by creation date (newest first).
    """
    service = SimulationService(db)
    total = await service.get_history_count()
    skip = (page - 1) * page_size
    runs = await service.get_history(skip=skip, limit=page_size)

    return PaginatedHistoryResponse(
        items=runs,
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total > 0 else 0,
    )
