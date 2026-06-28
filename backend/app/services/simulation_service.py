from typing import List, Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.scenario import Scenario
from app.models.simulation_run import SimulationRun
from app.models.projection_result import ProjectionResult
from app.services.projection_engine import ProjectionEngine


class SimulationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.engine = ProjectionEngine()

    async def get_scenario(self, scenario_id: UUID) -> Optional[Scenario]:
        """Get scenario by ID."""
        result = await self.db.execute(
            select(Scenario).where(Scenario.id == scenario_id)
        )
        return result.scalar_one_or_none()

    async def create_run(self, scenario_id: UUID) -> SimulationRun:
        """Create a new simulation run."""
        run = SimulationRun(
            scenario_id=scenario_id,
            status="pending",
        )
        self.db.add(run)
        await self.db.flush()
        await self.db.refresh(run)
        return run

    async def execute(self, run_id: UUID) -> None:
        """Execute the simulation."""
        # Get run
        result = await self.db.execute(
            select(SimulationRun).where(SimulationRun.id == run_id)
        )
        run = result.scalar_one()
        
        # Update status
        run.status = "running"
        run.started_at = datetime.utcnow()
        await self.db.flush()

        try:
            # Get scenario
            scenario = await self.get_scenario(run.scenario_id)
            
            # Run projection engine
            projections = self.engine.run(
                actions=scenario.actions,
                start_year=scenario.start_year,
                end_year=scenario.end_year,
                region=scenario.region,
            )
            
            # Save projections
            for proj in projections:
                projection = ProjectionResult(
                    simulation_run_id=run_id,
                    year=proj["year"],
                    indicator="composite",
                    value=proj["temperature"],
                    confidence_low=proj.get("temp_low"),
                    confidence_high=proj.get("temp_high"),
                    baseline_value=proj["baseline"],
                )
                self.db.add(projection)
            
            # Update status
            run.status = "completed"
            run.completed_at = datetime.utcnow()
            
        except Exception as e:
            run.status = "failed"
            run.error_message = str(e)
            raise
            
        await self.db.flush()

    async def get_history(self, skip: int = 0, limit: int = 50) -> List[SimulationRun]:
        """Get simulation history."""
        result = await self.db.execute(
            select(SimulationRun)
            .offset(skip)
            .limit(limit)
            .order_by(SimulationRun.created_at.desc())
        )
        return list(result.scalars().all())
