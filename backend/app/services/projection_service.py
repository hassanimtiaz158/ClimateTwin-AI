from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.simulation_run import SimulationRun
from app.models.projection_result import ProjectionResult
from app.models.scenario import Scenario
from app.schemas.projection import ProjectionResponse, ProjectionResult as ProjectionResultSchema, SimulationMetrics


class ProjectionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_results(self, run_id: UUID) -> Optional[ProjectionResponse]:
        """Get projection results for a simulation run."""
        # Get simulation run
        result = await self.db.execute(
            select(SimulationRun).where(SimulationRun.id == run_id)
        )
        run = result.scalar_one_or_none()
        
        if not run or run.status != "completed":
            return None
        
        # Get scenario
        scenario_result = await self.db.execute(
            select(Scenario).where(Scenario.id == run.scenario_id)
        )
        scenario = scenario_result.scalar_one()
        
        # Get projections
        projections_result = await self.db.execute(
            select(ProjectionResult)
            .where(ProjectionResult.simulation_run_id == run_id)
            .order_by(ProjectionResult.year)
        )
        projections = list(projections_result.scalars().all())
        
        # Calculate metrics
        metrics = self._calculate_metrics(projections)
        
        # Format response
        projection_data = [
            ProjectionResultSchema(
                year=p.year,
                temperature=p.value,
                co2_emissions=p.value * 15,  # Simplified calculation
                baseline=p.baseline_value or p.value,
                baseline_co2=(p.baseline_value or p.value) * 15,
            )
            for p in projections
        ]
        
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

    def _calculate_metrics(self, projections: list) -> SimulationMetrics:
        """Calculate summary metrics from projections."""
        if not projections:
            return SimulationMetrics(
                temp_change=0,
                co2_reduction=0,
                renewable_pct=0,
                aqi=50,
            )
        
        first_temp = projections[0].value
        last_temp = projections[-1].value
        temp_change = round(last_temp - first_temp, 2)
        
        return SimulationMetrics(
            temp_change=temp_change,
            co2_reduction=round(abs(temp_change) * 10, 1),
            renewable_pct=round(45 + abs(temp_change) * 5, 1),
            aqi=round(50 - abs(temp_change) * 5),
        )
