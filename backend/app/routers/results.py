from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.projection import ProjectionResponse
from app.services.projection_service import ProjectionService

router = APIRouter()


@router.get("/{run_id}", response_model=ProjectionResponse)
async def get_results(
    run_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get projection results for a simulation run."""
    service = ProjectionService(db)
    results = await service.get_results(run_id)
    
    if not results:
        raise HTTPException(status_code=404, detail="Results not found")
    
    return results
