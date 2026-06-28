from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.simulation import SimulationRequest, SimulationResponse
from app.services.simulation_service import SimulationService

router = APIRouter()


@router.post("/", response_model=SimulationResponse)
async def run_simulation(
    request: SimulationRequest,
    db: AsyncSession = Depends(get_db),
):
    """Start a climate simulation for a scenario."""
    service = SimulationService(db)
    
    # Verify scenario exists
    scenario = await service.get_scenario(request.scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    # Create simulation run
    run = await service.create_run(request.scenario_id)
    
    # Execute simulation (in production, this would be a background task)
    await service.execute(run.id)
    
    return SimulationResponse(
        run_id=run.id,
        status="completed",
        message="Simulation completed successfully",
    )
