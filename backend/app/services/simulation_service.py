"""
Simulation Service - Orchestrates simulation execution.
"""

import asyncio
import logging
from typing import Any, Dict, List, Optional
from uuid import UUID
from datetime import datetime, timezone

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
        logger.info("Creating simulation run for scenario: %s", scenario_id)

        run = SimulationRun(
            scenario_id=scenario_id,
            status="pending",
        )
        self.db.add(run)
        await self.db.flush()
        await self.db.refresh(run)

        logger.info("Simulation run created: %s", run.id)
        return run

    async def execute_with_projections(self, run_id: UUID) -> List[Dict[str, Any]]:
        """Execute the simulation and return projections."""
        logger.info("Executing simulation: %s", run_id)

        result = await self.db.execute(
            select(SimulationRun).where(SimulationRun.id == run_id)
        )
        run = result.scalar_one()

        run.status = "running"
        run.started_at = datetime.now(timezone.utc)
        await self.db.flush()

        try:
            scenario = await self.get_scenario(run.scenario_id)
            if not scenario:
                raise ValueError(f"Scenario {run.scenario_id} not found")

            projections = await asyncio.get_event_loop().run_in_executor(
                None,
                self.projection_engine.run,
                scenario.actions,
                scenario.start_year,
                scenario.end_year,
                scenario.region,
            )

            for proj in projections:
                record = ProjectionResult(
                    simulation_run_id=run_id,
                    year=proj["year"],
                    indicator="composite",
                    value=proj["temperature_change"],
                    confidence_low=proj.get("temperature_change_low"),
                    confidence_high=proj.get("temperature_change_high"),
                    baseline_value=proj.get("baseline_temperature"),
                )
                self.db.add(record)

            run.status = "completed"
            run.completed_at = datetime.now(timezone.utc)
            await self.db.flush()
            logger.info("Simulation completed: %s", run_id)

            return projections

        except Exception as exc:
            run.status = "failed"
            run.error_message = str(exc)
            run.completed_at = datetime.now(timezone.utc)
            await self.db.flush()
            logger.error("Simulation failed: %s - %s", run_id, exc)
            raise

    async def get_history(self, skip: int = 0, limit: int = 50) -> List[SimulationRun]:
        """Get simulation history."""
        result = await self.db.execute(
            select(SimulationRun)
            .offset(skip)
            .limit(limit)
            .order_by(SimulationRun.created_at.desc())
        )
        return list(result.scalars().all())
