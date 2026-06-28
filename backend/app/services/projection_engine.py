"""Projection Engine for Climate Simulations.

This module coordinates the AI pipeline to generate climate projections
based on user-defined scenarios and actions.
"""

from typing import List, Dict, Any, Optional
import os

from app.ai.pipeline import ClimatePipeline, ProjectionExplainer, INDICATORS


class ProjectionEngine:
    """Main engine for running climate projections."""

    def __init__(self):
        self.pipeline = ClimatePipeline()
        self.explainer = ProjectionExplainer()

    def run(
        self,
        actions: List[str],
        start_year: int,
        end_year: int,
        region: str = "Global",
        dataset_path: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Execute climate projection simulation."""
        # Check for custom dataset
        if dataset_path and os.path.exists(dataset_path):
            return self.pipeline.run(
                actions=actions,
                start_year=start_year,
                end_year=end_year,
                region=region,
                dataset_path=dataset_path,
            )

        # Use default pipeline with sample data
        return self.pipeline.run(
            actions=actions,
            start_year=start_year,
            end_year=end_year,
            region=region,
        )

    def run_with_explanation(
        self,
        actions: List[str],
        start_year: int,
        end_year: int,
        region: str = "Global",
    ) -> Dict[str, Any]:
        """Run projection and generate explanations."""
        projections = self.run(
            actions=actions,
            start_year=start_year,
            end_year=end_year,
            region=region,
        )

        explanation = self.explainer.explain(
            projections=projections,
            actions=actions,
        )

        return {
            "projections": projections,
            "explanation": explanation,
        }

    def run_batch(
        self,
        scenarios: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """Run multiple scenarios in batch."""
        results = []

        for scenario in scenarios:
            result = self.run(
                actions=scenario.get("actions", []),
                start_year=scenario.get("start_year", 2024),
                end_year=scenario.get("end_year", 2034),
                region=scenario.get("region", "Global"),
            )
            results.append({
                "scenario": scenario,
                "projections": result,
            })

        return results
