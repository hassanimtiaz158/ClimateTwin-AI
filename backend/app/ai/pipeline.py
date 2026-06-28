"""Climate Projection Pipeline v1.

This module orchestrates the AI/ML pipeline for climate projections.
It handles data loading, preprocessing, model execution, and result generation
for 8 climate indicators.
"""

from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np

from app.services.climate_data_loader import get_data_loader, ClimateDataRecord


# ── 8 Climate Indicators ──────────────────────────────────────
INDICATORS = [
    "temperature_change",
    "co2_level",
    "air_quality_index",
    "forest_cover",
    "biodiversity_score",
    "water_stress",
    "heatwave_frequency",
    "flood_risk",
]

# ── Action Impact Table ───────────────────────────────────────
ACTION_IMPACT_TABLE = {
    "reforestation": {
        "forest_cover": 0.15,
        "biodiversity_score": 0.10,
        "co2_level": -0.08,
        "flood_risk": -0.04,
        "water_stress": -0.02,
        "temperature_change": -0.01,
    },
    "renewable_energy": {
        "co2_level": -0.18,
        "air_quality_index": -0.10,
        "temperature_change": -0.025,
        "heatwave_frequency": -0.03,
    },
    "ev_adoption": {
        "co2_level": -0.12,
        "air_quality_index": -0.08,
        "temperature_change": -0.01,
    },
    "emission_reduction": {
        "co2_level": -0.22,
        "air_quality_index": -0.12,
        "temperature_change": -0.03,
        "heatwave_frequency": -0.02,
    },
    "public_transit": {
        "co2_level": -0.10,
        "air_quality_index": -0.06,
        "temperature_change": -0.008,
    },
    "water_conservation": {
        "water_stress": -0.15,
        "biodiversity_score": 0.05,
        "flood_risk": -0.02,
    },
}


class ClimatePipeline:
    """Main pipeline for climate projection processing."""

    def __init__(self):
        self.data_loader = get_data_loader()

    def run(
        self,
        actions: List[str],
        start_year: int,
        end_year: int,
        region: str,
        dataset_path: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Execute the full pipeline for 8 indicators."""
        # Step 1: Load historical data
        historical_records = self._load_historical_data(region, dataset_path)

        # Step 2: Get baseline
        baseline = self._get_baseline(historical_records, start_year)

        # Step 3: Calculate action impacts
        action_effects = self._calculate_action_effects(actions)

        # Step 4: Generate projections for each year
        projections = []
        for year in range(start_year, end_year + 1):
            year_offset = year - start_year
            projection = self._project_year(
                baseline=baseline,
                action_effects=action_effects,
                year=year,
                year_offset=year_offset,
            )
            projections.append(projection)

        return projections

    def _load_historical_data(
        self, region: str, dataset_path: Optional[str]
    ) -> List[ClimateDataRecord]:
        """Load historical climate data."""
        if dataset_path:
            # Load from custom file
            filename = dataset_path.split("/")[-1].split("\\")[-1]
            dataset = self.data_loader.load_csv(filename, region)
            return dataset.records

        # Try to load region-specific data
        region_file = f"{region.lower().replace(' ', '_')}_climate_data.csv"
        try:
            dataset = self.data_loader.load_csv(region_file, region)
            return dataset.records
        except FileNotFoundError:
            # Fallback to global data
            dataset = self.data_loader.load_csv("global_climate_data.csv", "Global")
            return dataset.records

    def _get_baseline(
        self, records: List[ClimateDataRecord], start_year: int
    ) -> Dict[str, float]:
        """Get baseline values for projection start."""
        # Find closest record to start_year
        baseline_record = min(records, key=lambda r: abs(r.year - start_year))

        return {
            "temperature": baseline_record.temperature,
            "co2_level": baseline_record.co2_level,
            "air_quality_index": baseline_record.air_quality_index,
            "forest_cover": baseline_record.forest_cover,
            "biodiversity_score": baseline_record.biodiversity_score,
            "water_stress": 0.5,  # Default if not in data
            "heatwave_frequency": baseline_record.heatwave_frequency,
            "flood_risk": baseline_record.flood_risk,
        }

    def _calculate_action_effects(self, actions: List[str]) -> Dict[str, float]:
        """Calculate cumulative effects of selected actions."""
        effects = {indicator: 0.0 for indicator in INDICATORS}

        for action in actions:
            if action in ACTION_IMPACT_TABLE:
                for indicator, impact in ACTION_IMPACT_TABLE[action].items():
                    effects[indicator] += impact

        return effects

    def _project_year(
        self,
        baseline: Dict[str, float],
        action_effects: Dict[str, float],
        year: int,
        year_offset: int,
    ) -> Dict[str, Any]:
        """Project all 8 indicators for a single year."""
        # Natural trend rates (per year without action)
        natural_trends = {
            "temperature_change": 0.03,       # +0.03C/year
            "co2_level": 2.5,                  # +2.5 ppm/year
            "air_quality_index": 0.5,          # +0.5 AQI/year (worsening)
            "forest_cover": -0.3,              # -0.3%/year (deforestation)
            "biodiversity_score": -0.005,      # -0.005/year
            "water_stress": 0.01,              # +0.01/year
            "heatwave_frequency": 0.5,         # +0.5 days/year
            "flood_risk": 0.005,               # +0.005/year
        }

        projection = {"year": year}
        uncertainty = 0.05 * year_offset  # Uncertainty grows with time

        for indicator in INDICATORS:
            baseline_val = baseline.get(indicator, 0)
            natural_rate = natural_trends.get(indicator, 0)
            action_effect = action_effects.get(indicator, 0)

            # Project value: baseline + natural trend * years + action effect * years
            projected = baseline_val + (natural_rate * year_offset) + (action_effect * year_offset * abs(baseline_val))

            # Add some noise for realism
            noise = np.random.normal(0, abs(projected) * 0.01) if projected != 0 else 0
            projected += noise

            # Clamp to valid ranges
            if indicator == "temperature_change":
                projected = max(-10, min(10, projected))
            elif indicator in ["co2_level"]:
                projected = max(150, min(1000, projected))
            elif indicator in ["air_quality_index"]:
                projected = max(0, min(500, projected))
            elif indicator in ["forest_cover"]:
                projected = max(0, min(100, projected))
            elif indicator in ["biodiversity_score", "water_stress", "flood_risk"]:
                projected = max(0, min(1, projected))
            elif indicator in ["heatwave_frequency"]:
                projected = max(0, min(365, int(projected)))

            projection[indicator] = round(projected, 3)
            projection[f"{indicator}_low"] = round(projected - uncertainty, 3)
            projection[f"{indicator}_high"] = round(projected + uncertainty, 3)

        # Calculate baseline projection (no action) for comparison
        projection["baseline_temperature"] = round(
            baseline["temperature"] + (natural_trends["temperature_change"] * year_offset), 2
        )
        projection["baseline_co2"] = round(
            baseline["co2_level"] + (natural_trends["co2_level"] * year_offset), 1
        )

        return projection


class ProjectionExplainer:
    """Generates explanations for projections."""

    def explain(
        self,
        projections: List[Dict[str, Any]],
        actions: List[str],
    ) -> Dict[str, Any]:
        """Generate human-readable explanations."""
        if not projections:
            return {"summary": "No projections available"}

        first = projections[0]
        last = projections[-1]

        temp_change = last["temperature_change"] - first["temperature_change"]
        co2_change = last["co2_level"] - first["co2_level"]

        return {
            "temp_change": round(temp_change, 2),
            "co2_change": round(co2_change, 1),
            "actions_applied": len(actions),
            "projection_years": len(projections),
        }
