from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class ProjectionResult(BaseModel):
    year: int
    temperature: float
    co2_emissions: float
    baseline: float
    baseline_co2: float

    class Config:
        from_attributes = True


class SimulationMetrics(BaseModel):
    temp_change: float = Field(..., description="Temperature change in Celsius")
    co2_reduction: float = Field(..., description="CO2 reduction percentage")
    renewable_pct: float = Field(..., description="Renewable energy percentage")
    aqi: int = Field(..., description="Air Quality Index")


class ProjectionResponse(BaseModel):
    run_id: UUID
    scenario: dict
    projections: List[ProjectionResult]
    metrics: SimulationMetrics
