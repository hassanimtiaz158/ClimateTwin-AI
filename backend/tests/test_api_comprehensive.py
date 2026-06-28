"""Comprehensive API integration tests — error handling, edge cases, validation."""

import pytest
from httpx import AsyncClient


# ── 404 Error Handling ─────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_nonexistent_scenario(client: AsyncClient):
    response = await client.get("/api/scenarios/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_nonexistent_scenario(client: AsyncClient):
    response = await client.patch(
        "/api/scenarios/00000000-0000-0000-0000-000000000000",
        json={"name": "Updated"},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_nonexistent_scenario(client: AsyncClient):
    response = await client.delete("/api/scenarios/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


# ── Validation Errors (422) ────────────────────────────────────

@pytest.mark.asyncio
async def test_create_scenario_missing_name(client: AsyncClient):
    response = await client.post("/api/scenarios/", json={"city": "Berlin"})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_scenario_empty_body(client: AsyncClient):
    response = await client.post("/api/scenarios/", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_scenario_name_too_short(client: AsyncClient):
    response = await client.post("/api/scenarios/", json={"name": "ab"})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_scenario_invalid_target_year(client: AsyncClient):
    response = await client.post(
        "/api/scenarios/",
        json={"name": "Test", "target_year": 2020},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_scenario_slider_out_of_range(client: AsyncClient):
    response = await client.post(
        "/api/scenarios/",
        json={"name": "Test", "reforestation_slider": 1.5},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_scenario_negative_slider(client: AsyncClient):
    response = await client.post(
        "/api/scenarios/",
        json={"name": "Test", "renewable_energy_slider": -0.5},
    )
    assert response.status_code == 422


# ── Scenario CRUD Edge Cases ───────────────────────────────────

@pytest.mark.asyncio
async def test_create_and_get_scenario(client: AsyncClient):
    create_resp = await client.post(
        "/api/scenarios/",
        json={"name": "Edge Case Test", "city": "Rome", "country": "Italy"},
    )
    scenario_id = create_resp.json()["id"]
    get_resp = await client.get(f"/api/scenarios/{scenario_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["city"] == "Rome"


@pytest.mark.asyncio
async def test_list_scenarios_pagination(client: AsyncClient):
    for i in range(5):
        await client.post("/api/scenarios/", json={"name": f"Pagination Test {i}"})
    resp = await client.get("/api/scenarios/?skip=2&limit=2")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2


@pytest.mark.asyncio
async def test_update_only_name(client: AsyncClient):
    create_resp = await client.post(
        "/api/scenarios/", json={"name": "Original Name", "city": "Madrid"}
    )
    scenario_id = create_resp.json()["id"]
    patch_resp = await client.patch(
        f"/api/scenarios/{scenario_id}", json={"name": "New Name"}
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["name"] == "New Name"
    assert patch_resp.json()["city"] == "Madrid"


@pytest.mark.asyncio
async def test_update_only_sliders(client: AsyncClient):
    create_resp = await client.post(
        "/api/scenarios/", json={"name": "Slider Test"}
    )
    scenario_id = create_resp.json()["id"]
    patch_resp = await client.patch(
        f"/api/scenarios/{scenario_id}",
        json={"reforestation_slider": 0.9, "ev_adoption_slider": 0.3},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["reforestation_slider"] == 0.9
    assert patch_resp.json()["ev_adoption_slider"] == 0.3


@pytest.mark.asyncio
async def test_delete_then_get_returns_404(client: AsyncClient):
    create_resp = await client.post(
        "/api/scenarios/", json={"name": "Delete Me"}
    )
    scenario_id = create_resp.json()["id"]
    del_resp = await client.delete(f"/api/scenarios/{scenario_id}")
    assert del_resp.status_code == 204
    get_resp = await client.get(f"/api/scenarios/{scenario_id}")
    assert get_resp.status_code == 404


# ── Inline Simulation Edge Cases ───────────────────────────────

@pytest.mark.asyncio
async def test_inline_simulation_defaults(client: AsyncClient):
    response = await client.post("/api/simulate/", json={})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["scenario_id"] is not None


@pytest.mark.asyncio
async def test_inline_simulation_all_sliders_max(client: AsyncClient):
    response = await client.post(
        "/api/simulate/",
        json={
            "city": "Test",
            "country": "Test",
            "target_year": 2030,
            "reforestation_slider": 1.0,
            "renewable_energy_slider": 1.0,
            "ev_adoption_slider": 1.0,
            "emission_reduction_slider": 1.0,
            "public_transit_slider": 1.0,
            "water_conservation_slider": 1.0,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["projections"]) > 0
    assert "metrics" in data
    assert "chart_data" in data


@pytest.mark.asyncio
async def test_inline_simulation_all_sliders_zero(client: AsyncClient):
    response = await client.post(
        "/api/simulate/",
        json={
            "target_year": 2030,
            "reforestation_slider": 0.0,
            "renewable_energy_slider": 0.0,
            "ev_adoption_slider": 0.0,
            "emission_reduction_slider": 0.0,
            "public_transit_slider": 0.0,
            "water_conservation_slider": 0.0,
        },
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_simulation_invalid_target_year(client: AsyncClient):
    response = await client.post(
        "/api/simulate/", json={"target_year": 2020}
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_simulation_invalid_slider_value(client: AsyncClient):
    response = await client.post(
        "/api/simulate/", json={"reforestation_slider": 2.0}
    )
    assert response.status_code == 422


# ── Simulation with Existing Scenario ──────────────────────────

@pytest.mark.asyncio
async def test_simulate_existing_scenario(client: AsyncClient):
    create_resp = await client.post(
        "/api/scenarios/",
        json={
            "name": "Simulate This",
            "city": "Oslo",
            "country": "Norway",
            "reforestation_slider": 0.6,
            "renewable_energy_slider": 0.8,
        },
    )
    scenario_id = create_resp.json()["id"]
    sim_resp = await client.post(
        "/api/simulate/", json={"scenario_id": scenario_id}
    )
    assert sim_resp.status_code == 200
    data = sim_resp.json()
    assert data["status"] == "completed"
    assert data["scenario_id"] == scenario_id


@pytest.mark.asyncio
async def test_simulate_nonexistent_scenario(client: AsyncClient):
    response = await client.post(
        "/api/simulate/",
        json={"scenario_id": "00000000-0000-0000-0000-000000000000"},
    )
    assert response.status_code == 404


# ── Result Verification ────────────────────────────────────────

@pytest.mark.asyncio
async def test_simulation_result_structure(client: AsyncClient):
    response = await client.post(
        "/api/simulate/",
        json={"city": "Test", "country": "Test", "target_year": 2035},
    )
    data = response.json()
    assert "run_id" in data
    assert "scenario_id" in data
    assert "projections" in data
    assert "metrics" in data
    assert "chart_data" in data
    assert "recommendations" in data
    assert isinstance(data["projections"], list)
    assert isinstance(data["metrics"], dict)
    assert isinstance(data["chart_data"], dict)


@pytest.mark.asyncio
async def test_simulation_has_all_indicators(client: AsyncClient):
    response = await client.post("/api/simulate/", json={"target_year": 2030})
    data = response.json()
    first_proj = data["projections"][0]
    for key in [
        "year",
        "temperature_change",
        "co2_level",
        "air_quality_index",
        "forest_cover",
        "biodiversity_score",
        "water_stress",
        "heatwave_frequency",
        "flood_risk",
    ]:
        assert key in first_proj, f"Missing indicator: {key}"


@pytest.mark.asyncio
async def test_simulation_metrics_keys(client: AsyncClient):
    response = await client.post("/api/simulate/", json={"target_year": 2030})
    metrics = response.json()["metrics"]
    for key in [
        "temperature_change",
        "co2_change",
        "air_quality_change",
        "forest_cover_change",
        "biodiversity_change",
        "water_stress_change",
        "heatwave_change",
        "flood_risk_change",
    ]:
        assert key in metrics, f"Missing metric: {key}"


# ── History & Recommendations ──────────────────────────────────

@pytest.mark.asyncio
async def test_history_empty(client: AsyncClient):
    response = await client.get("/api/history/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_history_after_simulation(client: AsyncClient):
    await client.post(
        "/api/simulate/", json={"city": "History", "target_year": 2030}
    )
    response = await client.get("/api/history/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_recommendations_nonexistent_run(client: AsyncClient):
    response = await client.get(
        "/api/recommendations/00000000-0000-0000-0000-000000000000"
    )
    assert response.status_code in [404, 200]


@pytest.mark.asyncio
async def test_datasets_list(client: AsyncClient):
    response = await client.get("/api/datasets/")
    assert response.status_code == 200
