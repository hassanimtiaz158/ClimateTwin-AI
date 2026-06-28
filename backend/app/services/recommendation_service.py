"""
Recommendation Service - AI-powered climate recommendations.
"""

import logging
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.simulation_run import SimulationRun
from app.models.projection_result import ProjectionResult
from app.models.scenario import Scenario
from app.schemas.recommendation import RecommendationResponse, RecommendationAction

logger = logging.getLogger(__name__)


class RecommendationService:
    """Generates data-driven AI recommendations based on simulation results."""

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
        scenario = scenario_result.scalar_one_or_none()

        if not scenario:
            return None

        # Get projection results
        proj_result = await self.db.execute(
            select(ProjectionResult)
            .where(ProjectionResult.simulation_run_id == run_id)
            .order_by(ProjectionResult.year)
        )
        projections = list(proj_result.scalars().all())

        # Generate data-driven recommendations
        recommendations = self._generate_data_driven_recommendations(
            scenario=scenario,
            projections=projections,
        )

        return recommendations

    def _generate_data_driven_recommendations(
        self,
        scenario: Scenario,
        projections: List[ProjectionResult],
    ) -> RecommendationResponse:
        """Generate recommendations based on actual projection data."""
        actions = scenario.actions
        findings: List[str] = []
        recommended_actions: List[RecommendationAction] = []

        # Analyze projections if available
        if projections and len(projections) >= 2:
            first_val = projections[0].value
            last_val = projections[-1].value
            temp_change = last_val - first_val

            # Temperature analysis
            if temp_change > 0.5:
                findings.append(
                    f"Temperature projected to rise by {temp_change:.2f}C. "
                    "Immediate action needed to limit warming."
                )
                recommended_actions.append(
                    RecommendationAction(
                        title="Accelerate Renewable Energy Transition",
                        description=(
                            "Increase renewable energy adoption to at least 70% "
                            "of total energy production within 5 years."
                        ),
                        priority="high",
                        impact=f"{abs(temp_change) * 10:.0f}% temperature reduction potential",
                    )
                )
            elif temp_change < 0:
                findings.append(
                    f"Temperature change is negative ({temp_change:.2f}C), "
                    "indicating effective climate measures."
                )

            # CO2 analysis (derived from temperature)
            if temp_change > 0.3:
                findings.append(
                    "CO2 levels continue to rise. Carbon pricing recommended."
                )
                if "emission_reduction" not in actions:
                    recommended_actions.append(
                        RecommendationAction(
                            title="Implement Carbon Tax",
                            description=(
                                "Introduce a carbon tax starting at $50/ton, "
                                "increasing $10/year to drive emission reductions."
                            ),
                            priority="high",
                            impact="20-30% industrial emission reduction",
                        )
                    )
        else:
            # No projection data - use scenario analysis
            if not actions:
                findings.append(
                    "No climate actions selected. Current trajectory shows "
                    "continued environmental degradation."
                )
                recommended_actions.append(
                    RecommendationAction(
                        title="Select Climate Actions",
                        description=(
                            "Choose at least 2-3 climate actions to see meaningful "
                            "impact on projections."
                        ),
                        priority="high",
                        impact="Foundation for emission reduction",
                    )
                )

        # Missing action recommendations
        missing_actions = self._identify_missing_actions(actions, scenario)
        for missing in missing_actions:
            recommended_actions.append(missing)

        # Scenario-specific recommendations based on sliders
        slider_recs = self._analyze_slider_values(scenario)
        recommended_actions.extend(slider_recs)

        # Default findings
        if not findings:
            findings = [
                f"Scenario '{scenario.name}' configured for {scenario.city}, {scenario.country}.",
                f"Target year: {scenario.target_year}.",
                f"Active policies: {len(actions)} actions selected.",
            ]

        # Calculate confidence based on data completeness
        confidence = self._calculate_confidence(scenario, projections)

        summary = self._generate_summary(scenario, actions, projections)

        return RecommendationResponse(
            run_id=scenario.id,
            summary=summary,
            findings=findings,
            actions=recommended_actions[:6],  # Limit to 6 recommendations
            confidence=confidence,
        )

    def _identify_missing_actions(
        self, current_actions: List[str], scenario: Scenario
    ) -> List[RecommendationAction]:
        """Identify high-value actions not yet selected."""
        missing = []

        # Check for high-impact missing actions
        if "renewable_energy" not in current_actions and scenario.renewable_energy_slider < 0.3:
            missing.append(
                RecommendationAction(
                    title="Add Renewable Energy Policy",
                    description=(
                        "Renewable energy adoption can reduce CO2 emissions by 15-25%. "
                        "Consider increasing the renewable energy slider."
                    ),
                    priority="high",
                    impact="15-25% CO2 reduction",
                )
            )

        if "reforestation" not in current_actions and scenario.reforestation_slider < 0.3:
            missing.append(
                RecommendationAction(
                    title="Add Reforestation Program",
                    description=(
                        "Reforestation provides long-term carbon sequestration "
                        "and biodiversity benefits."
                    ),
                    priority="medium",
                    impact="5-10% carbon absorption increase",
                )
            )

        if "emission_reduction" not in current_actions and scenario.emission_reduction_slider < 0.3:
            missing.append(
                RecommendationAction(
                    title="Implement Emission Reduction Targets",
                    description=(
                        "Setting binding emission reduction targets drives "
                        "industry-wide cuts and generates green investment."
                    ),
                    priority="high",
                    impact="20-30% industrial emission reduction",
                )
            )

        return missing[:2]  # Limit to top 2

    def _analyze_slider_values(self, scenario: Scenario) -> List[RecommendationAction]:
        """Generate recommendations based on slider configurations."""
        recs = []

        # Very low sliders
        sliders = {
            "reforestation": scenario.reforestation_slider,
            "renewable_energy": scenario.renewable_energy_slider,
            "ev_adoption": scenario.ev_adoption_slider,
            "emission_reduction": scenario.emission_reduction_slider,
            "public_transit": scenario.public_transit_slider,
            "water_conservation": scenario.water_conservation_slider,
        }

        low_sliders = [k for k, v in sliders.items() if v < 0.2]
        if len(low_sliders) >= 3:
            recs.append(
                RecommendationAction(
                    title="Increase Policy Ambition",
                    description=(
                        "Multiple policy sliders are below 20%. Consider increasing "
                        "ambition across reforestation, renewable energy, and transit."
                    ),
                    priority="medium",
                    impact="Significant emission reduction potential",
                )
            )

        return recs

    def _calculate_confidence(
        self, scenario: Scenario, projections: List[ProjectionResult]
    ) -> float:
        """Calculate confidence score based on data completeness."""
        base_confidence = 60.0

        # Boost for having projections
        if projections and len(projections) >= 3:
            base_confidence += 15.0

        # Boost for specific location
        if scenario.city != "Global":
            base_confidence += 5.0

        # Boost for having actions
        num_actions = len(scenario.actions)
        base_confidence += min(num_actions * 3, 15)

        return min(base_confidence, 95.0)

    def _generate_summary(
        self,
        scenario: Scenario,
        actions: List[str],
        projections: List[ProjectionResult],
    ) -> str:
        """Generate a natural language summary."""
        location = f"{scenario.city}, {scenario.country}" if scenario.city != "Global" else "Global"
        years = scenario.target_year - 2024

        if projections and len(projections) >= 2:
            temp_change = projections[-1].value - projections[0].value
            trend = "warming" if temp_change > 0 else "cooling"
            return (
                f"Climate simulation for {location} over {years} years shows "
                f"a {trend} trend of {abs(temp_change):.2f}C. "
                f"With {len(actions)} active policies, the scenario "
                f"targets {scenario.target_year} with measurable impact."
            )
        else:
            return (
                f"Climate scenario for {location} targeting {scenario.target_year} "
                f"with {len(actions)} sustainability actions configured."
            )
