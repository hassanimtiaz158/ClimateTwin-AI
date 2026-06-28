from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.recommendation import RecommendationResponse
from app.services.recommendation_service import RecommendationService

router = APIRouter()


@router.get("/{run_id}", response_model=RecommendationResponse)
async def get_recommendations(
    run_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get AI-generated recommendations for a simulation."""
    service = RecommendationService(db)
    recommendations = await service.generate(run_id)
    
    if not recommendations:
        raise HTTPException(status_code=404, detail="Simulation not found or not completed")
    
    return recommendations
