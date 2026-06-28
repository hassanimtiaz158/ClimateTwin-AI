"""Projection engine tests — projections, trends, actions, edge cases."""

import pytest
from app.ai.pipeline import ClimatePipeline, ProjectionExplainer, ACTION_IMPACT_TABLE, INDICATORS


@pytest.fixture
def pipeline():
    return ClimatePipeline()


@pytest.fixture
def explainer():
    return ProjectionExplainer()


# ── Basic Pipeline Tests ───────────────────────────────────────

class TestPipelineBasic:

    def test_pipeline_returns_projections(self, pipeline):
        results = pipeline.run(
            actions=[], start_year=2024, end_year=2030, region="Global"
        )
        assert len(results) == 7

    def test_pipeline_year_range(self, pipeline):
        results = pipeline.run(
            actions=[], start_year=2025, end_year=2035, region="Global"
        )
        assert results[0]["year"] == 2025
        assert results[-1]["year"] == 2035
        assert len(results) == 11

    def test_all_indicators_present(self, pipeline):
        results = pipeline.run(
            actions=[], start_year=2024, end_year=2026, region="Global"
        )
        for indicator in INDICATORS:
            assert indicator in results[0], f"Missing: {indicator}"

    def test_uncertainty_bounds_present(self, pipeline):
        results = pipeline.run(
            actions=[], start_year=2024, end_year=2026, region="Global"
        )
        for proj in results:
            for indicator in INDICATORS:
                assert f"{indicator}_low" in proj
                assert f"{indicator}_high" in proj
                assert proj[f"{indicator}_low"] <= proj[indicator] + 0.01
                assert proj[f"{indicator}_high"] >= proj[indicator] - 0.01


# ── Natural Trend Tests ────────────────────────────────────────

class TestNaturalTrends:

    def test_temperature_increases_without_action(self, pipeline):
        results = pipeline.run(
            actions=[], start_year=2024, end_year=2034, region="Global"
        )
        first_temp = results[0]["temperature_change"]
        last_temp = results[-1]["temperature_change"]
        assert last_temp > first_temp

    def test_co2_increases_without_action(self, pipeline):
        results = pipeline.run(
            actions=[], start_year=2024, end_year=2034, region="Global"
        )
        assert results[-1]["co2_level"] > results[0]["co2_level"]

    def test_forest_cover_decreases_without_action(self, pipeline):
        results = pipeline.run(
            actions=[], start_year=2024, end_year=2034, region="Global"
        )
        assert results[-1]["forest_cover"] < results[0]["forest_cover"]

    def test_heatwave_frequency_increases(self, pipeline):
        results = pipeline.run(
            actions=[], start_year=2024, end_year=2034, region="Global"
        )
        assert results[-1]["heatwave_frequency"] > results[0]["heatwave_frequency"]


# ── Action Impact Tests ────────────────────────────────────────

class TestActionImpacts:

    def test_reforestation_increases_forest_cover(self, pipeline):
        baseline = pipeline.run(
            actions=[], start_year=2024, end_year=2034, region="Global"
        )
        with_ref = pipeline.run(
            actions=["reforestation"], start_year=2024, end_year=2034, region="Global"
        )
        assert with_ref[-1]["forest_cover"] > baseline[-1]["forest_cover"]

    def test_renewable_energy_reduces_co2(self, pipeline):
        baseline = pipeline.run(
            actions=[], start_year=2024, end_year=2034, region="Global"
        )
        with_re = pipeline.run(
            actions=["renewable_energy"], start_year=2024, end_year=2034, region="Global"
        )
        assert with_re[-1]["co2_level"] < baseline[-1]["co2_level"]

    def test_emission_reduction_reduces_co2(self, pipeline):
        baseline = pipeline.run(
            actions=[], start_year=2024, end_year=2034, region="Global"
        )
        with_er = pipeline.run(
            actions=["emission_reduction"], start_year=2024, end_year=2034, region="Global"
        )
        assert with_er[-1]["co2_level"] < baseline[-1]["co2_level"]

    def test_water_conservation_reduces_water_stress(self, pipeline):
        baseline = pipeline.run(
            actions=[], start_year=2024, end_year=2034, region="Global"
        )
        with_wc = pipeline.run(
            actions=["water_conservation"], start_year=2024, end_year=2034, region="Global"
        )
        assert with_wc[-1]["water_stress"] <= baseline[-1]["water_stress"]

    def test_multiple_actions_have_cumulative_effect(self, pipeline):
        single = pipeline.run(
            actions=["reforestation"], start_year=2024, end_year=2034, region="Global"
        )
        multiple = pipeline.run(
            actions=["reforestation", "water_conservation"],
            start_year=2024, end_year=2034, region="Global",
        )
        assert multiple[-1]["water_stress"] < single[-1]["water_stress"]

    def test_all_actions_combined(self, pipeline):
        results = pipeline.run(
            actions=list(ACTION_IMPACT_TABLE.keys()),
            start_year=2024, end_year=2034, region="Global",
        )
        assert results[-1]["temperature_change"] < results[-1]["baseline_temperature"]

    def test_unknown_action_ignored(self, pipeline):
        results = pipeline.run(
            actions=["nonexistent_action"],
            start_year=2024, end_year=2030, region="Global",
        )
        assert len(results) == 7


# ── Value Clamping ─────────────────────────────────────────────

class TestValueClamping:

    def test_forest_cover_0_to_100(self, pipeline):
        results = pipeline.run(
            actions=["reforestation"] * 3,
            start_year=2024, end_year=2050, region="Global",
        )
        for r in results:
            assert 0 <= r["forest_cover"] <= 100

    def test_co2_level_bounds(self, pipeline):
        results = pipeline.run(
            actions=[], start_year=2024, end_year=2050, region="Global",
        )
        for r in results:
            assert 150 <= r["co2_level"] <= 1000

    def test_temperature_bounds(self, pipeline):
        results = pipeline.run(
            actions=[], start_year=2024, end_year=2050, region="Global",
        )
        for r in results:
            assert -10 <= r["temperature_change"] <= 10

    def test_biodiversity_score_0_to_1(self, pipeline):
        results = pipeline.run(
            actions=[], start_year=2024, end_year=2050, region="Global",
        )
        for r in results:
            assert 0 <= r["biodiversity_score"] <= 1

    def test_water_stress_0_to_1(self, pipeline):
        results = pipeline.run(
            actions=[], start_year=2024, end_year=2050, region="Global",
        )
        for r in results:
            assert 0 <= r["water_stress"] <= 1


# ── Edge Cases ─────────────────────────────────────────────────

class TestEdgeCases:

    def test_same_start_end_year(self, pipeline):
        results = pipeline.run(
            actions=[], start_year=2024, end_year=2024, region="Global"
        )
        assert len(results) == 1

    def test_long_projection(self, pipeline):
        results = pipeline.run(
            actions=[], start_year=2024, end_year=2050, region="Global"
        )
        assert len(results) == 27

    def test_baseline_projection_keys(self, pipeline):
        results = pipeline.run(
            actions=[], start_year=2024, end_year=2026, region="Global"
        )
        for r in results:
            assert "baseline_temperature" in r
            assert "baseline_co2" in r


# ── ProjectionExplainer ────────────────────────────────────────

class TestExplainer:

    def test_explain_with_projections(self, explainer, pipeline):
        projections = pipeline.run(
            actions=["reforestation"],
            start_year=2024, end_year=2034, region="Global",
        )
        result = explainer.explain(projections=projections, actions=["reforestation"])
        assert "temp_change" in result
        assert "co2_change" in result
        assert "actions_applied" in result
        assert "projection_years" in result
        assert result["actions_applied"] == 1

    def test_explain_empty_projections(self, explainer):
        result = explainer.explain(projections=[], actions=[])
        assert result["summary"] == "No projections available"

    def test_explain_multiple_actions(self, explainer, pipeline):
        projections = pipeline.run(
            actions=["reforestation", "renewable_energy"],
            start_year=2024, end_year=2030, region="Global",
        )
        result = explainer.explain(projections=projections, actions=["reforestation", "renewable_energy"])
        assert result["actions_applied"] == 2
