"""
Simulation Router - Run climate projection simulations.
"""

import logging
from typing import Dict, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.simulation import (
    SimulationRequest,
    SimulationResultResponse,
    SimulationMetrics,
    ChartDataPoint,
)
from app.services.simulation_service import SimulationService
from app.models.scenario import Scenario

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/",
    response_model=SimulationResultResponse,
    summary="Run a climate simulation",
)
async def run_simulation(
    request: SimulationRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Execute a climate projection simulation.

    Accepts either:
    - **scenario_id**: ID of an existing scenario to simulate
    - **Inline fields**: city, country, target_year, and policy sliders

    Returns unified response with:
    - **projections**: 8 climate indicators projected over time
    - **metrics**: Summary of key changes
    - **chart_data**: Data formatted for Recharts frontend
    - **recommendations**: AI-generated actionable insights
    """
    service = SimulationService(db)

    # Resolve scenario (either from ID or inline fields)
    if request.scenario_id:
        scenario = await service.get_scenario(request.scenario_id)
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
    else:
        # Create inline scenario via service (avoids bypassing service layer)
        scenario = await service.create_inline_scenario(
            city=request.city or "Global",
            country=request.country or "Global",
            target_year=request.target_year if request.target_year is not None else 2035,
            reforestation_slider=request.reforestation_slider if request.reforestation_slider is not None else 0.0,
            renewable_energy_slider=request.renewable_energy_slider if request.renewable_energy_slider is not None else 0.0,
            ev_adoption_slider=request.ev_adoption_slider if request.ev_adoption_slider is not None else 0.0,
            emission_reduction_slider=request.emission_reduction_slider if request.emission_reduction_slider is not None else 0.0,
            public_transit_slider=request.public_transit_slider if request.public_transit_slider is not None else 0.0,
            water_conservation_slider=request.water_conservation_slider if request.water_conservation_slider is not None else 0.0,
        )

    # Create simulation run
    run = await service.create_run(scenario.id)

    # Execute simulation
    try:
        projections = await service.execute_with_projections(run.id)
    except Exception as e:
        logger.exception("Simulation failed for run %s", run.id)
        # Rollback the inline scenario and run on failure
        if not request.scenario_id:
            await db.delete(scenario)
            await db.flush()
        raise HTTPException(
            status_code=500,
            detail="Simulation failed. Please try again.",
        )

    # Calculate summary metrics
    metrics = _calculate_metrics(projections)

    # Format chart data
    chart_data = _format_chart_data(projections)

    # Generate recommendations
    recommendations = _generate_recommendations(projections, scenario)

    # Commit all changes so the recommendations endpoint (different session)
    # can see the run, scenario, and projection rows.
    await db.commit()

    return SimulationResultResponse(
        run_id=run.id,
        scenario_id=scenario.id,
        status="completed",
        message="Simulation completed successfully",
        reforestation_slider=scenario.reforestation_slider,
        renewable_energy_slider=scenario.renewable_energy_slider,
        ev_adoption_slider=scenario.ev_adoption_slider,
        emission_reduction_slider=scenario.emission_reduction_slider,
        public_transit_slider=scenario.public_transit_slider,
        water_conservation_slider=scenario.water_conservation_slider,
        city=scenario.city,
        country=scenario.country,
        target_year=scenario.end_year,
        projections=projections,
        metrics=metrics,
        chart_data=chart_data,
        recommendations=recommendations,
    )


def _calculate_metrics(projections: list) -> SimulationMetrics:
    """Calculate summary metrics from projections."""
    if not projections:
        return SimulationMetrics(
            temperature_change=0,
            co2_change=0,
            air_quality_change=0,
            forest_cover_change=0,
            biodiversity_change=0,
            water_stress_change=0,
            heatwave_change=0,
            flood_risk_change=0,
        )

    first = projections[0]
    last = projections[-1]

    return SimulationMetrics(
        temperature_change=round(last["temperature_change"] - first["temperature_change"], 3),
        co2_change=round(last["co2_level"] - first["co2_level"], 1),
        air_quality_change=round(last["air_quality_index"] - first["air_quality_index"], 2),
        forest_cover_change=round(last["forest_cover"] - first["forest_cover"], 2),
        biodiversity_change=round(last["biodiversity_score"] - first["biodiversity_score"], 3),
        water_stress_change=round(last["water_stress"] - first["water_stress"], 3),
        heatwave_change=round(last["heatwave_frequency"] - first["heatwave_frequency"], 1),
        flood_risk_change=round(last["flood_risk"] - first["flood_risk"], 3),
    )


def _format_chart_data(projections: list) -> Dict[str, List[ChartDataPoint]]:
    """Format projections into chart-ready data."""
    indicators = [
        "temperature_change",
        "co2_level",
        "air_quality_index",
        "forest_cover",
        "biodiversity_score",
        "water_stress",
        "heatwave_frequency",
        "flood_risk",
    ]

    chart_data = {}
    for indicator in indicators:
        points = []
        for proj in projections:
            points.append(ChartDataPoint(
                year=proj["year"],
                value=proj.get(indicator, 0),
                baseline=proj.get(f"baseline_{indicator}"),
                label=indicator.replace("_", " ").title(),
            ))
        chart_data[indicator] = points

    return chart_data


def _generate_recommendations(projections: list, scenario: Scenario) -> list:
    """Generate AI recommendations based on projections."""
    recommendations = []

    if not projections:
        return recommendations

    last = projections[-1]

    # Temperature recommendation
    if last["temperature_change"] > 0.5:
        recommendations.append({
            "category": "temperature",
            "priority": "high",
            "title": "Urgent: Temperature Rising",
            "description": f"Temperature projected to rise by {last['temperature_change']:.2f}C. Consider increasing renewable energy adoption.",
            "action": "renewable_energy",
            "confidence": 0.85,
        })

    # CO2 recommendation
    if last["co2_level"] > 450:
        recommendations.append({
            "category": "co2",
            "priority": "high",
            "title": "CO2 Levels Critical",
            "description": f"CO2 projected to reach {last['co2_level']:.0f} ppm. Implement carbon reduction measures.",
            "action": "emission_reduction",
            "confidence": 0.9,
        })

    # Forest cover
    if last["forest_cover"] < 25:
        recommendations.append({
            "category": "forest",
            "priority": "medium",
            "title": "Forest Cover Declining",
            "description": f"Forest cover projected at {last['forest_cover']:.1f}%. Expand reforestation efforts.",
            "action": "reforestation",
            "confidence": 0.8,
        })

    # Air quality
    if last["air_quality_index"] > 50:
        recommendations.append({
            "category": "air_quality",
            "priority": "medium",
            "title": "Air Quality Worsening",
            "description": f"AQI projected at {last['air_quality_index']:.0f}. Invest in public transit and EVs.",
            "action": "public_transit",
            "confidence": 0.75,
        })

    # Heatwave frequency
    if last["heatwave_frequency"] > 20:
        recommendations.append({
            "category": "heatwave",
            "priority": "medium",
            "title": "Heatwave Days Increasing",
            "description": f"Projected {last['heatwave_frequency']:.0f} heatwave days/year. Increase tree planting.",
            "action": "reforestation",
            "confidence": 0.7,
        })

    # Biodiversity
    if last["biodiversity_score"] < 0.5:
        recommendations.append({
            "category": "biodiversity",
            "priority": "low",
            "title": "Biodiversity at Risk",
            "description": f"Biodiversity score projected at {last['biodiversity_score']:.2f}. Protect natural habitats.",
            "action": "reforestation",
            "confidence": 0.7,
        })

    # Water stress
    if last["water_stress"] > 0.6:
        recommendations.append({
            "category": "water",
            "priority": "medium",
            "title": "Water Stress Increasing",
            "description": f"Water stress projected at {last['water_stress']:.2f}. Implement water conservation.",
            "action": "water_conservation",
            "confidence": 0.75,
        })

    # Default recommendation if no issues
    if not recommendations:
        recommendations.append({
            "category": "general",
            "priority": "low",
            "title": "Scenario On Track",
            "description": "Current projections show manageable climate impacts. Continue monitoring.",
            "action": None,
            "confidence": 0.6,
        })

    return recommendations
