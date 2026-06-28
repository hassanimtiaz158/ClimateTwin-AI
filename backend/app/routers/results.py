"""
Results Router - Retrieve projection results.
"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.projection import ProjectionResponse
from app.services.projection_service import ProjectionService

router = APIRouter()


@router.get(
    "/{run_id}",
    response_model=ProjectionResponse,
    summary="Get simulation results",
)
async def get_results(
    run_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve projection results for a completed simulation run.

    Returns:
    - Scenario details
    - Yearly projections (temperature, CO2, etc.)
    - Summary metrics

    - **run_id**: The simulation run ID
    """
    service = ProjectionService(db)
    results = await service.get_results(run_id)

    if not results:
        raise HTTPException(
            status_code=404,
            detail="Results not found or simulation not completed",
        )

    return results
