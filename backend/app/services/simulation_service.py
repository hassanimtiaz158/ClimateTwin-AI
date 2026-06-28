"""
Simulation Service - Orchestrates simulation execution.
"""

import logging
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.scenario import Scenario
from app.models.simulation_run import SimulationRun
from app.models.projection_result import ProjectionResult
from app.services.projection_engine import ProjectionEngine

logger = logging.getLogger(__name__)


class SimulationService:
    """Manages simulation lifecycle: creation, execution, and history."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.projection_engine = ProjectionEngine()

    async def get_scenario(self, scenario_id: UUID) -> Optional[Scenario]:
        """Retrieve a scenario by ID."""
        result = await self.db.execute(
            select(Scenario).where(Scenario.id == scenario_id)
        )
        return result.scalar_one_or_none()

    async def create_run(self, scenario_id: UUID) -> SimulationRun:
        """Create a new simulation run record."""
        logger.info(f"Creating simulation run for scenario: {scenario_id}")

        run = SimulationRun(
            scenario_id=scenario_id,
            status="pending",
        )
        self.db.add(run)
        await self.db.flush()
        await self.db.refresh(run)

        logger.info(f"Simulation run created: {run.id}")
        return run

    async def execute(self, run_id: UUID) -> None:
        """Execute the simulation and store results."""
        logger.info(f"Executing simulation: {run_id}")

        # Fetch run record
        result = await self.db.execute(
            select(SimulationRun).where(SimulationRun.id == run_id)
        )
        run = result.scalar_one()

        # Update to running
        run.status = "running"
        run.started_at = datetime.utcnow()
        await self.db.flush()

        try:
            # Fetch associated scenario
            scenario = await self.get_scenario(run.scenario_id)
            if not scenario:
                raise ValueError(f"Scenario {run.scenario_id} not found")

            # Run projection engine
            projections = self.projection_engine.run(
                actions=scenario.actions,
                start_year=scenario.start_year,
                end_year=scenario.end_year,
                region=scenario.region,
            )

            # Persist projection results
            for proj in projections:
                record = ProjectionResult(
                    simulation_run_id=run_id,
                    year=proj["year"],
                    indicator="composite",
                    value=proj["temperature"],
                    confidence_low=proj.get("temp_low"),
                    confidence_high=proj.get("temp_high"),
                    baseline_value=proj["baseline"],
                )
                self.db.add(record)

            # Mark completed
            run.status = "completed"
            run.completed_at = datetime.utcnow()
            logger.info(f"Simulation completed: {run_id}")

        except Exception as exc:
            run.status = "failed"
            run.error_message = str(exc)
            run.completed_at = datetime.utcnow()
            logger.error(f"Simulation failed: {run_id} - {exc}")
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
