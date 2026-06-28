"""Model tests."""

import pytest
from datetime import datetime

from app.models import Scenario, SimulationRun, ProjectionResult, Dataset


def test_scenario_creation():
    """Test scenario model creation with new fields."""
    scenario = Scenario(
        name="Test Scenario",
        city="Tokyo",
        country="Japan",
        target_year=2035,
        renewable_energy_slider=0.7,
        public_transit_slider=0.5,
        reforestation_slider=0.3,
        carbon_tax_slider=0.0,
        green_innovation_slider=0.2,
        notes="Testing model creation",
    )
    
    assert scenario.name == "Test Scenario"
    assert scenario.city == "Tokyo"
    assert scenario.country == "Japan"
    assert scenario.target_year == 2035
    assert scenario.renewable_energy_slider == 0.7
    assert scenario.notes == "Testing model creation"
    
    # Test derived properties
    assert scenario.region == "Tokyo, Japan"
    assert "renewable_energy" in scenario.actions
    assert "public_transit" in scenario.actions
    assert "reforestation" not in scenario.actions  # 0.3 < 0.5 threshold
    assert scenario.start_year == 2024
    assert scenario.end_year == 2035


def test_scenario_actions_from_sliders():
    """Test that actions are derived from slider values."""
    scenario = Scenario(
        name="Actions Test",
        city="Global",
        country="Global",
        target_year=2030,
        renewable_energy_slider=0.8,  # > 0.5 -> active
        public_transit_slider=0.4,    # < 0.5 -> inactive
        reforestation_slider=0.6,     # > 0.5 -> active
        carbon_tax_slider=0.9,        # > 0.5 -> active
        green_innovation_slider=0.7,  # > 0.5 -> green_buildings & waste_reduction
    )
    
    actions = scenario.actions
    assert "renewable_energy" in actions
    assert "public_transit" not in actions
    assert "reforestation" in actions
    assert "carbon_tax" in actions
    assert "green_buildings" in actions
    assert "waste_reduction" in actions


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
