"""Schema validation tests for Pydantic models."""

import pytest
from pydantic import ValidationError
from uuid import uuid4

from app.schemas.scenario import ScenarioCreate, ScenarioUpdate
from app.schemas.simulation import SimulationRequest
from app.schemas.recommendation import RecommendationAction, RecommendationResponse


# ── ScenarioCreate ─────────────────────────────────────────────

class TestScenarioCreate:

    def test_valid_minimal(self):
        s = ScenarioCreate(name="Test Scenario")
        assert s.name == "Test Scenario"
        assert s.city == "Global"
        assert s.country == "Global"
        assert s.target_year == 2035
        assert s.reforestation_slider == 0.0

    def test_valid_full(self):
        s = ScenarioCreate(
            name="Full Scenario",
            city="Lisbon",
            country="Portugal",
            target_year=2040,
            reforestation_slider=0.8,
            renewable_energy_slider=0.6,
            ev_adoption_slider=0.5,
            emission_reduction_slider=0.7,
            public_transit_slider=0.4,
            water_conservation_slider=0.9,
            notes="Test notes",
        )
        assert s.city == "Lisbon"
        assert s.reforestation_slider == 0.8

    def test_name_too_short(self):
        with pytest.raises(ValidationError):
            ScenarioCreate(name="ab")

    def test_name_too_long(self):
        with pytest.raises(ValidationError):
            ScenarioCreate(name="x" * 101)

    def test_name_exact_boundaries(self):
        s3 = ScenarioCreate(name="abc")
        assert s3.name == "abc"
        s100 = ScenarioCreate(name="x" * 100)
        assert len(s100.name) == 100

    def test_target_year_too_early(self):
        with pytest.raises(ValidationError):
            ScenarioCreate(name="Test", target_year=2024)

    def test_target_year_too_late(self):
        with pytest.raises(ValidationError):
            ScenarioCreate(name="Test", target_year=2051)

    def test_target_year_boundaries(self):
        s2025 = ScenarioCreate(name="Test", target_year=2025)
        assert s2025.target_year == 2025
        s2050 = ScenarioCreate(name="Test", target_year=2050)
        assert s2050.target_year == 2050

    def test_slider_below_zero(self):
        with pytest.raises(ValidationError):
            ScenarioCreate(name="Test", reforestation_slider=-0.1)

    def test_slider_above_one(self):
        with pytest.raises(ValidationError):
            ScenarioCreate(name="Test", reforestation_slider=1.1)

    def test_slider_boundaries(self):
        s0 = ScenarioCreate(name="Test", reforestation_slider=0.0)
        assert s0.reforestation_slider == 0.0
        s1 = ScenarioCreate(name="Test", reforestation_slider=1.0)
        assert s1.reforestation_slider == 1.0

    def test_all_sliders_at_zero(self):
        s = ScenarioCreate(name="Test")
        assert s.reforestation_slider == 0.0
        assert s.renewable_energy_slider == 0.0
        assert s.ev_adoption_slider == 0.0
        assert s.emission_reduction_slider == 0.0
        assert s.public_transit_slider == 0.0
        assert s.water_conservation_slider == 0.0

    def test_all_sliders_at_one(self):
        s = ScenarioCreate(
            name="Test",
            reforestation_slider=1.0,
            renewable_energy_slider=1.0,
            ev_adoption_slider=1.0,
            emission_reduction_slider=1.0,
            public_transit_slider=1.0,
            water_conservation_slider=1.0,
        )
        assert s.reforestation_slider == 1.0

    def test_notes_too_long(self):
        with pytest.raises(ValidationError):
            ScenarioCreate(name="Test", notes="x" * 2001)

    def test_notes_exact_limit(self):
        s = ScenarioCreate(name="Test", notes="x" * 2000)
        assert len(s.notes) == 2000

    def test_notes_none_allowed(self):
        s = ScenarioCreate(name="Test", notes=None)
        assert s.notes is None

    def test_city_country_max_length(self):
        with pytest.raises(ValidationError):
            ScenarioCreate(name="Test", city="x" * 101)
        with pytest.raises(ValidationError):
            ScenarioCreate(name="Test", country="x" * 101)


# ── ScenarioUpdate ─────────────────────────────────────────────

class TestScenarioUpdate:

    def test_empty_update(self):
        u = ScenarioUpdate()
        assert u.name is None

    def test_partial_update(self):
        u = ScenarioUpdate(name="Updated")
        assert u.name == "Updated"
        assert u.city is None

    def test_name_too_short(self):
        with pytest.raises(ValidationError):
            ScenarioUpdate(name="ab")

    def test_target_year_boundaries(self):
        u = ScenarioUpdate(target_year=2025)
        assert u.target_year == 2025
        u2 = ScenarioUpdate(target_year=2050)
        assert u2.target_year == 2050

    def test_slider_boundaries(self):
        u = ScenarioUpdate(reforestation_slider=0.0)
        assert u.reforestation_slider == 0.0
        u2 = ScenarioUpdate(renewable_energy_slider=1.0)
        assert u2.renewable_energy_slider == 1.0

    def test_slider_out_of_range(self):
        with pytest.raises(ValidationError):
            ScenarioUpdate(reforestation_slider=-0.1)
        with pytest.raises(ValidationError):
            ScenarioUpdate(reforestation_slider=1.1)


# ── SimulationRequest ──────────────────────────────────────────

class TestSimulationRequest:

    def test_empty_request(self):
        r = SimulationRequest()
        assert r.scenario_id is None

    def test_inline_scenario(self):
        r = SimulationRequest(
            city="Berlin",
            country="Germany",
            target_year=2035,
            renewable_energy_slider=0.7,
        )
        assert r.city == "Berlin"
        assert r.renewable_energy_slider == 0.7

    def test_invalid_target_year(self):
        with pytest.raises(ValidationError):
            SimulationRequest(target_year=2024)
        with pytest.raises(ValidationError):
            SimulationRequest(target_year=2051)

    def test_invalid_slider(self):
        with pytest.raises(ValidationError):
            SimulationRequest(reforestation_slider=-0.1)
        with pytest.raises(ValidationError):
            SimulationRequest(reforestation_slider=1.1)

    def test_scenario_id_with_inline(self):
        r = SimulationRequest(
            scenario_id=uuid4(),
            city="Tokyo",
        )
        assert r.scenario_id is not None
        assert r.city == "Tokyo"


# ── RecommendationAction ───────────────────────────────────────

class TestRecommendationAction:

    def test_valid(self):
        a = RecommendationAction(
            title="Do X",
            description="Because Y",
            priority="high",
            impact="20% reduction",
        )
        assert a.priority == "high"

    def test_invalid_priority(self):
        with pytest.raises(ValidationError):
            RecommendationAction(
                title="Do X",
                description="Because Y",
                priority="urgent",
                impact="20% reduction",
            )

    def test_priority_boundaries(self):
        RecommendationAction(title="X", description="Y", priority="low", impact="Z")
        RecommendationAction(title="X", description="Y", priority="medium", impact="Z")


# ── RecommendationResponse ─────────────────────────────────────

class TestRecommendationResponse:

    def test_valid(self):
        r = RecommendationResponse(
            run_id=uuid4(),
            summary="Test summary",
            findings=["finding1"],
            actions=[],
            confidence=80.0,
        )
        assert r.confidence == 80.0

    def test_confidence_below_zero(self):
        with pytest.raises(ValidationError):
            RecommendationResponse(
                run_id=uuid4(),
                summary="s",
                findings=[],
                actions=[],
                confidence=-1,
            )

    def test_confidence_above_100(self):
        with pytest.raises(ValidationError):
            RecommendationResponse(
                run_id=uuid4(),
                summary="s",
                findings=[],
                actions=[],
                confidence=101,
            )

    def test_confidence_boundaries(self):
        RecommendationResponse(run_id=uuid4(), summary="s", findings=[], actions=[], confidence=0)
        RecommendationResponse(run_id=uuid4(), summary="s", findings=[], actions=[], confidence=100)
