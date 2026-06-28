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
    """Test scenario creation with new sliders."""
    scenario_data = {
        "name": "Test Scenario",
        "city": "New York",
        "country": "USA",
        "target_year": 2035,
        "reforestation_slider": 0.7,
        "renewable_energy_slider": 0.5,
        "ev_adoption_slider": 0.3,
        "emission_reduction_slider": 0.0,
        "public_transit_slider": 0.2,
        "water_conservation_slider": 0.4,
        "notes": "Testing new scenario fields",
    }
    response = await client.post("/api/scenarios/", json=scenario_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Scenario"
    assert data["city"] == "New York"
    assert data["country"] == "USA"
    assert data["target_year"] == 2035
    assert data["reforestation_slider"] == 0.7
    assert "id" in data
    # Verify derived fields work
    assert data["region"] == "New York, USA"
    assert "reforestation" in data["actions"]
    assert "renewable_energy" in data["actions"]
    assert data["start_year"] == 2024
    assert data["end_year"] == 2035


@pytest.mark.asyncio
async def test_list_scenarios(client: AsyncClient):
    """Test listing scenarios."""
    response = await client.get("/api/scenarios/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_update_scenario(client: AsyncClient):
    """Test updating a scenario."""
    # Create first
    scenario_data = {
        "name": "Update Test",
        "city": "London",
        "country": "UK",
        "target_year": 2040,
    }
    create_response = await client.post("/api/scenarios/", json=scenario_data)
    scenario_id = create_response.json()["id"]

    # Update
    update_data = {
        "city": "Manchester",
        "emission_reduction_slider": 0.8,
        "notes": "Updated notes",
    }
    response = await client.patch(f"/api/scenarios/{scenario_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["city"] == "Manchester"
    assert data["emission_reduction_slider"] == 0.8
    assert data["notes"] == "Updated notes"


@pytest.mark.asyncio
async def test_delete_scenario(client: AsyncClient):
    """Test deleting a scenario."""
    scenario_data = {
        "name": "Delete Test",
        "city": "Berlin",
        "country": "Germany",
    }
    create_response = await client.post("/api/scenarios/", json=scenario_data)
    scenario_id = create_response.json()["id"]

    response = await client.delete(f"/api/scenarios/{scenario_id}")
    assert response.status_code == 204

    # Verify deleted
    get_response = await client.get(f"/api/scenarios/{scenario_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_run_simulation(client: AsyncClient):
    """Test running a simulation."""
    scenario_data = {
        "name": "Simulation Test",
        "city": "Paris",
        "country": "France",
        "target_year": 2030,
        "renewable_energy_slider": 0.6,
        "reforestation_slider": 0.4,
        "ev_adoption_slider": 0.5,
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
    assert "projections" in data
    assert "metrics" in data
    assert "chart_data" in data
    assert "recommendations" in data


@pytest.mark.asyncio
async def test_run_inline_simulation(client: AsyncClient):
    """Test running an inline simulation without creating a scenario first."""
    sim_response = await client.post(
        "/api/simulate/",
        json={
            "city": "Tokyo",
            "country": "Japan",
            "target_year": 2035,
            "renewable_energy_slider": 0.7,
            "reforestation_slider": 0.5,
            "ev_adoption_slider": 0.6,
        }
    )
    assert sim_response.status_code == 200
    data = sim_response.json()
    assert data["status"] == "completed"
    assert len(data["projections"]) > 0


@pytest.mark.asyncio
async def test_get_history(client: AsyncClient):
    """Test getting simulation history."""
    response = await client.get("/api/history/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
