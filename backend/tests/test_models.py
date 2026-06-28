"""Model tests."""

import pytest
from datetime import datetime

from app.models import Scenario, SimulationRun, ProjectionResult, Dataset


def test_scenario_creation():
    """Test scenario model creation."""
    scenario = Scenario(
        name="Test Scenario",
        region="Global",
        actions=["renewable_energy", "public_transit"],
        start_year=2024,
        end_year=2034,
    )
    
    assert scenario.name == "Test Scenario"
    assert scenario.region == "Global"
    assert len(scenario.actions) == 2
    assert scenario.start_year == 2024
    assert scenario.end_year == 2034


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
