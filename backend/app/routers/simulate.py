"""
Simulation Router - Run climate projection simulations.
"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.simulation import SimulationRequest, SimulationResponse
from app.services.simulation_service import SimulationService

router = APIRouter()


@router.post(
    "/",
    response_model=SimulationResponse,
    summary="Run a climate simulation",
)
async def run_simulation(
    request: SimulationRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Execute a climate projection simulation for the given scenario.

    The simulation will:
    1. Validate the scenario exists
    2. Create a simulation run record
    3. Execute the projection engine
    4. Store results in the database
    5. Return the run ID and status

    - **scenario_id**: ID of the scenario to simulate
    """
    service = SimulationService(db)

    # Verify scenario exists
    scenario = await service.get_scenario(request.scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    # Create simulation run
    run = await service.create_run(request.scenario_id)

    # Execute simulation
    try:
        await service.execute(run.id)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Simulation failed: {str(e)}",
        )

    return SimulationResponse(
        run_id=run.id,
        status="completed",
        message="Simulation completed successfully",
    )
