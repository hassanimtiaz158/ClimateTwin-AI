"""API integration tests."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    """Test health check endpoint."""
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_root_endpoint(client: AsyncClient):
    """Test root endpoint."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ClimateTwin AI API"


@pytest.mark.asyncio
async def test_create_scenario(client: AsyncClient):
    """Test scenario creation."""
    scenario_data = {
        "name": "Test Scenario",
        "region": "Global",
        "actions": ["renewable_energy", "public_transit"],
        "start_year": 2024,
        "end_year": 2034,
    }
    response = await client.post("/api/scenarios/", json=scenario_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Scenario"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_scenarios(client: AsyncClient):
    """Test listing scenarios."""
    response = await client.get("/api/scenarios/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_run_simulation(client: AsyncClient):
    """Test running a simulation."""
    # First create a scenario
    scenario_data = {
        "name": "Simulation Test",
        "region": "Europe",
        "actions": ["reforestation"],
        "start_year": 2024,
        "end_year": 2029,
    }
    scenario_response = await client.post("/api/scenarios/", json=scenario_data)
    scenario_id = scenario_response.json()["id"]
    
    # Run simulation
    sim_response = await client.post(
        "/api/simulate/",
        json={"scenario_id": scenario_id}
    )
    assert sim_response.status_code == 200
    data = sim_response.json()
    assert data["status"] == "completed"


@pytest.mark.asyncio
async def test_get_history(client: AsyncClient):
    """Test getting simulation history."""
    response = await client.get("/api/history/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
