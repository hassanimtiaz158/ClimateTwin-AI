"""
Projection Service - Retrieves and formats projection results.
"""

import logging
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.simulation_run import SimulationRun
from app.models.projection_result import ProjectionResult
from app.models.scenario import Scenario
from app.schemas.projection import (
    ProjectionResponse,
    ProjectionResult as ProjectionResultSchema,
    SimulationMetrics,
)

logger = logging.getLogger(__name__)


class ProjectionService:
    """Handles fetching and formatting projection results."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_results(self, run_id: UUID) -> Optional[ProjectionResponse]:
        """Get formatted projection results for a completed run."""

        # Fetch run
        run_result = await self.db.execute(
            select(SimulationRun).where(SimulationRun.id == run_id)
        )
        run = run_result.scalar_one_or_none()

        if not run or run.status != "completed":
            return None

        # Fetch scenario
        scenario_result = await self.db.execute(
            select(Scenario).where(Scenario.id == run.scenario_id)
        )
        scenario = scenario_result.scalar_one()

        # Fetch projections
        proj_result = await self.db.execute(
            select(ProjectionResult)
            .where(ProjectionResult.simulation_run_id == run_id)
            .order_by(ProjectionResult.year)
        )
        projections = list(proj_result.scalars().all())

        # Build response
        projection_data = [
            ProjectionResultSchema(
                year=p.year,
                temperature=p.value,
                co2_emissions=round(p.value * 15, 1),  # Simplified mapping
                baseline=p.baseline_value or p.value,
                baseline_co2=round((p.baseline_value or p.value) * 15, 1),
            )
            for p in projections
        ]

        metrics = self._compute_metrics(projections)

        return ProjectionResponse(
            run_id=run_id,
            scenario={
                "name": scenario.name,
                "region": scenario.region,
                "actions": scenario.actions,
            },
            projections=projection_data,
            metrics=metrics,
        )

    @staticmethod
    def _compute_metrics(projections: list) -> SimulationMetrics:
        """Derive summary metrics from projection data."""
        if not projections:
            return SimulationMetrics(
                temp_change=0.0, co2_reduction=0.0, renewable_pct=0.0, aqi=50,
            )

        first_val = projections[0].value
        last_val = projections[-1].value
        delta = round(last_val - first_val, 2)

        return SimulationMetrics(
            temp_change=delta,
            co2_reduction=round(abs(delta) * 10, 1),
            renewable_pct=round(45 + abs(delta) * 5, 1),
            aqi=max(0, round(50 - abs(delta) * 5)),
        )
