"""Recommendation service tests — data-driven recs, edge cases, confidence."""

import pytest
from uuid import uuid4

from app.models.scenario import Scenario
from app.models.simulation_run import SimulationRun
from app.models.projection_result import ProjectionResult
from app.services.recommendation_service import RecommendationService


@pytest.fixture
def service(db_session):
    return RecommendationService(db_session)


async def _create_scenario(db_session, **kwargs) -> Scenario:
    defaults = {
        "name": "Test Scenario",
        "city": "Test",
        "country": "Test",
        "target_year": 2035,
        "reforestation_slider": 0.0,
        "renewable_energy_slider": 0.0,
        "ev_adoption_slider": 0.0,
        "emission_reduction_slider": 0.0,
        "public_transit_slider": 0.0,
        "water_conservation_slider": 0.0,
    }
    defaults.update(kwargs)
    scenario = Scenario(**defaults)
    db_session.add(scenario)
    await db_session.flush()
    return scenario


async def _create_run(db_session, scenario_id) -> SimulationRun:
    run = SimulationRun(scenario_id=scenario_id, status="completed")
    db_session.add(run)
    await db_session.flush()
    return run


async def _add_projection(db_session, run_id, year, value):
    proj = ProjectionResult(
        simulation_run_id=run_id,
        year=year,
        indicator="temperature_change",
        value=value,
    )
    db_session.add(proj)
    await db_session.flush()


# ── Basic Generation ───────────────────────────────────────────

class TestBasicGeneration:

    @pytest.mark.asyncio
    async def test_returns_none_for_nonexistent_run(self, service):
        result = await service.generate(uuid4())
        assert result is None

    @pytest.mark.asyncio
    async def test_returns_none_for_pending_run(self, db_session, service):
        scenario = await _create_scenario(db_session)
        run = SimulationRun(scenario_id=scenario.id, status="pending")
        db_session.add(run)
        await db_session.flush()
        result = await service.generate(run.id)
        assert result is None

    @pytest.mark.asyncio
    async def test_returns_response_for_completed_run(self, db_session, service):
        scenario = await _create_scenario(db_session)
        run = await _create_run(db_session, scenario.id)
        await _add_projection(db_session, run.id, 2024, 1.0)
        await _add_projection(db_session, run.id, 2034, 1.5)
        result = await service.generate(run.id)
        assert result is not None
        assert result.run_id == scenario.id

    @pytest.mark.asyncio
    async def test_findings_populated(self, db_session, service):
        scenario = await _create_scenario(db_session)
        run = await _create_run(db_session, scenario.id)
        await _add_projection(db_session, run.id, 2024, 1.0)
        await _add_projection(db_session, run.id, 2034, 2.0)
        result = await service.generate(run.id)
        assert len(result.findings) > 0


# ── High Temperature Projections ───────────────────────────────

class TestHighTemperatureProjections:

    @pytest.mark.asyncio
    async def test_temperature_rise_triggers_renewable_rec(self, db_session, service):
        scenario = await _create_scenario(
            db_session,
            renewable_energy_slider=0.2,
            emission_reduction_slider=0.2,
        )
        run = await _create_run(db_session, scenario.id)
        await _add_projection(db_session, run.id, 2024, 1.0)
        await _add_projection(db_session, run.id, 2034, 2.0)
        result = await service.generate(run.id)
        titles = [a.title for a in result.actions]
        assert "Accelerate Renewable Energy Transition" in titles


# ── No Action Recommendations ──────────────────────────────────

class TestNoActionRecommendations:

    @pytest.mark.asyncio
    async def test_no_actions_triggers_rec(self, db_session, service):
        scenario = await _create_scenario(
            db_session,
            reforestation_slider=0.0,
            renewable_energy_slider=0.0,
            ev_adoption_slider=0.0,
            emission_reduction_slider=0.0,
            public_transit_slider=0.0,
            water_conservation_slider=0.0,
        )
        run = await _create_run(db_session, scenario.id)
        result = await service.generate(run.id)
        titles = [a.title for a in result.actions]
        assert "Select Climate Actions" in titles


# ── Missing Action Recommendations ─────────────────────────────

class TestMissingActionRecommendations:

    @pytest.mark.asyncio
    async def test_low_renewable_triggers_rec(self, db_session, service):
        scenario = await _create_scenario(
            db_session,
            renewable_energy_slider=0.05,
            reforestation_slider=0.5,
        )
        run = await _create_run(db_session, scenario.id)
        result = await service.generate(run.id)
        titles = [a.title for a in result.actions]
        assert "Add Renewable Energy Policy" in titles

    @pytest.mark.asyncio
    async def test_low_reforestation_triggers_rec(self, db_session, service):
        scenario = await _create_scenario(
            db_session,
            reforestation_slider=0.05,
            renewable_energy_slider=0.5,
        )
        run = await _create_run(db_session, scenario.id)
        result = await service.generate(run.id)
        titles = [a.title for a in result.actions]
        assert "Add Reforestation Program" in titles

    @pytest.mark.asyncio
    async def test_low_emission_reduction_triggers_rec(self, db_session, service):
        scenario = await _create_scenario(
            db_session,
            emission_reduction_slider=0.05,
            reforestation_slider=0.5,
        )
        run = await _create_run(db_session, scenario.id)
        result = await service.generate(run.id)
        titles = [a.title for a in result.actions]
        assert "Implement Emission Reduction Targets" in titles


# ── Slider Analysis ────────────────────────────────────────────

class TestSliderAnalysis:

    @pytest.mark.asyncio
    async def test_multiple_low_sliders_triggers_ambition_rec(self, db_session, service):
        scenario = await _create_scenario(
            db_session,
            reforestation_slider=0.05,
            renewable_energy_slider=0.05,
            ev_adoption_slider=0.05,
        )
        run = await _create_run(db_session, scenario.id)
        await _add_projection(db_session, run.id, 2024, 1.0)
        await _add_projection(db_session, run.id, 2034, 1.0)
        result = await service.generate(run.id)
        titles = [a.title for a in result.actions]
        assert "Increase Policy Ambition" in titles


# ── Confidence Score ───────────────────────────────────────────

class TestConfidence:

    @pytest.mark.asyncio
    async def test_confidence_in_range(self, db_session, service):
        scenario = await _create_scenario(db_session, city="Test", country="Test")
        run = await _create_run(db_session, scenario.id)
        await _add_projection(db_session, run.id, 2024, 1.0)
        await _add_projection(db_session, run.id, 2034, 1.0)
        await _add_projection(db_session, run.id, 2030, 1.0)
        result = await service.generate(run.id)
        assert 0 <= result.confidence <= 100

    @pytest.mark.asyncio
    async def test_higher_confidence_with_projections(self, db_session, service):
        scenario = await _create_scenario(db_session, city="Test", country="Test")
        run = await _create_run(db_session, scenario.id)
        for year in range(2024, 2035):
            await _add_projection(db_session, run.id, year, 1.0)
        result = await service.generate(run.id)
        assert result.confidence >= 70


# ── Summary Generation ─────────────────────────────────────────

class TestSummary:

    @pytest.mark.asyncio
    async def test_summary_with_projections(self, db_session, service):
        scenario = await _create_scenario(db_session, city="Paris", country="France")
        run = await _create_run(db_session, scenario.id)
        await _add_projection(db_session, run.id, 2024, 1.0)
        await _add_projection(db_session, run.id, 2034, 1.5)
        result = await service.generate(run.id)
        assert "Paris" in result.summary

    @pytest.mark.asyncio
    async def test_summary_without_projections(self, db_session, service):
        scenario = await _create_scenario(db_session, city="London", country="UK")
        run = await _create_run(db_session, scenario.id)
        result = await service.generate(run.id)
        assert "London" in result.summary
