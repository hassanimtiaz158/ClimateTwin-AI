"""Model tests."""

import pytest
from datetime import datetime, timezone

from app.models import Scenario, SimulationRun, ProjectionResult, Dataset


def test_scenario_creation():
    """Test scenario model creation with new sliders."""
    scenario = Scenario(
        name="Test Scenario",
        city="Tokyo",
        country="Japan",
        target_year=2035,
        reforestation_slider=0.7,
        renewable_energy_slider=0.5,
        ev_adoption_slider=0.3,
        emission_reduction_slider=0.0,
        public_transit_slider=0.2,
        water_conservation_slider=0.4,
        notes="Testing model creation",
    )

    assert scenario.name == "Test Scenario"
    assert scenario.city == "Tokyo"
    assert scenario.country == "Japan"
    assert scenario.target_year == 2035
    assert scenario.reforestation_slider == 0.7
    assert scenario.notes == "Testing model creation"

    # Test derived properties
    assert scenario.region == "Tokyo, Japan"
    assert "reforestation" in scenario.actions
    assert "renewable_energy" in scenario.actions
    assert "ev_adoption" in scenario.actions
    assert "public_transit" in scenario.actions
    assert "water_conservation" in scenario.actions
    assert "emission_reduction" not in scenario.actions  # 0.0 < 0.1 threshold
    assert scenario.start_year == datetime.now(timezone.utc).year
    assert scenario.end_year == 2035


def test_scenario_actions_from_sliders():
    """Test that actions are derived from slider values."""
    scenario = Scenario(
        name="Actions Test",
        city="Global",
        country="Global",
        target_year=2030,
        reforestation_slider=0.8,       # > 0.1 -> active
        renewable_energy_slider=0.4,    # > 0.1 -> active
        ev_adoption_slider=0.0,         # < 0.1 -> inactive
        emission_reduction_slider=0.9,  # > 0.1 -> active
        public_transit_slider=0.3,      # > 0.1 -> active
        water_conservation_slider=0.6,  # > 0.1 -> active
    )

    actions = scenario.actions
    assert "reforestation" in actions
    assert "renewable_energy" in actions
    assert "ev_adoption" not in actions
    assert "emission_reduction" in actions
    assert "public_transit" in actions
    assert "water_conservation" in actions


def test_simulation_run_creation():
    """Test simulation run model creation."""
    run = SimulationRun(
        scenario_id="test-id",
        status="pending",
    )

    assert run.scenario_id == "test-id"
    assert run.status == "pending"
    assert run.started_at is None


def test_projection_result_creation():
    """Test projection result model creation."""
    result = ProjectionResult(
        simulation_run_id="run-id",
        year=2030,
        indicator="temperature",
        value=15.5,
        confidence_low=15.0,
        confidence_high=16.0,
    )

    assert result.year == 2030
    assert result.value == 15.5
    assert result.confidence_low == 15.0


def test_dataset_creation():
    """Test dataset model creation."""
    dataset = Dataset(
        name="Climate Data 2024",
        source="NOAA",
        region="Global",
        record_count=1000,
    )

    assert dataset.name == "Climate Data 2024"
    assert dataset.source == "NOAA"
    assert dataset.record_count == 1000
