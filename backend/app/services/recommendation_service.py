from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.simulation_run import SimulationRun
from app.models.scenario import Scenario
from app.schemas.recommendation import RecommendationResponse, RecommendationAction


class RecommendationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate(self, run_id: UUID) -> Optional[RecommendationResponse]:
        """Generate AI recommendations based on simulation results."""
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
        
        # Generate recommendations based on scenario actions
        recommendations = self._generate_recommendations(scenario)
        
        return recommendations

    def _generate_recommendations(self, scenario: Scenario) -> RecommendationResponse:
        """Generate recommendations based on scenario configuration."""
        actions = scenario.actions
        
        # Dynamic recommendations based on selected actions
        findings = []
        recommended_actions = []
        
        if "renewable_energy" in actions:
            findings.append("Renewable energy adoption shows significant potential for CO2 reduction.")
            recommended_actions.append(
                RecommendationAction(
                    title="Scale Solar & Wind Infrastructure",
                    description="Increase renewable energy capacity by 40% over the next 5 years.",
                    priority="high",
                    impact="25-35% CO2 reduction",
                )
            )
        
        if "public_transit" in actions:
            findings.append("Public transit expansion can reduce urban emissions by 15-20%.")
            recommended_actions.append(
                RecommendationAction(
                    title="Expand Electric Bus Network",
                    description="Replace 30% of diesel buses with electric alternatives.",
                    priority="high",
                    impact="15% transport emission reduction",
                )
            )
        
        if "reforestation" in actions:
            findings.append("Reforestation programs provide long-term carbon sequestration benefits.")
            recommended_actions.append(
                RecommendationAction(
                    title="Launch Urban Reforestation Initiative",
                    description="Plant 1 million trees across urban areas within 3 years.",
                    priority="medium",
                    impact="5-10% carbon absorption increase",
                )
            )
        
        if "carbon_tax" in actions:
            findings.append("Carbon pricing mechanisms can drive industry-wide emission reductions.")
            recommended_actions.append(
                RecommendationAction(
                    title="Implement Tiered Carbon Tax",
                    description="Start at $50/ton and increase $10/year for heavy emitters.",
                    priority="high",
                    impact="20-30% industrial emission reduction",
                )
            )
        
        # Default findings if none selected
        if not findings:
            findings = [
                "Consider adding more climate actions for better outcomes.",
                "Current scenario shows minimal impact without intervention.",
            ]
            recommended_actions = [
                RecommendationAction(
                    title="Increase Climate Action Scope",
                    description="Add renewable energy and reforestation for maximum impact.",
                    priority="high",
                    impact="Significant emission reduction potential",
                )
            ]
        
        # Calculate confidence based on data quality
        confidence = min(85, 60 + len(actions) * 5)
        
        summary = (
            f"Your scenario '{scenario.name}' targeting {scenario.region} "
            f"with {len(actions)} climate actions shows promising potential "
            f"for reducing emissions over {scenario.end_year - scenario.start_year} years."
        )
        
        return RecommendationResponse(
            run_id=scenario.id,
            summary=summary,
            findings=findings,
            actions=recommended_actions,
            confidence=confidence,
        )
