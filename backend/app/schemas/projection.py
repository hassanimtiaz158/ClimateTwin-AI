"""
Projection Schemas - Response models for projection results.
"""

from typing import List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class ProjectionResult(BaseModel):
    """Single year projection data point."""
    model_config = ConfigDict(from_attributes=True)

    year: int
    temperature: float
    co2_emissions: float
    baseline: float
    baseline_co2: float


class SimulationMetrics(BaseModel):
    """Summary metrics for a simulation."""
    model_config = ConfigDict(from_attributes=True)

    temp_change: float = Field(..., description="Temperature change in Celsius")
    co2_reduction: float = Field(..., description="CO2 reduction percentage")
    renewable_pct: float = Field(..., description="Renewable energy percentage")
    aqi: int = Field(..., description="Air Quality Index")


class ProjectionResponse(BaseModel):
    """Full projection response."""
    run_id: UUID
    scenario: dict
    projections: List[ProjectionResult]
    metrics: SimulationMetrics
