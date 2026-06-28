"""
Projection Schemas
──────────────────
Pydantic models for projection results and summary metrics.
"""

from __future__ import annotations

from typing import Any, Dict, List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ── Single data point ──────────────────────────────────────────
class ProjectionPoint(BaseModel):
    """One year of projection data."""

    model_config = ConfigDict(from_attributes=True)

    year: int
    temperature: float = Field(..., description="Projected temperature (°C)")
    co2_emissions: float = Field(..., description="Projected CO₂ (Mt)")
    baseline: float = Field(..., description="Baseline temperature without action")
    baseline_co2: float = Field(..., description="Baseline CO₂ without action")


# ── Summary metrics ────────────────────────────────────────────
class ProjectionMetrics(BaseModel):
    """Aggregated metrics across the full projection horizon."""

    model_config = ConfigDict(from_attributes=True)

    temp_change: float = Field(..., description="Net temperature change (°C)")
    co2_reduction: float = Field(..., description="CO₂ reduction (%)")
    renewable_pct: float = Field(..., description="Renewable energy share (%)")
    aqi: int = Field(..., description="Air Quality Index")


# ── Full response ──────────────────────────────────────────────
class ProjectionResponse(BaseModel):
    """Complete projection result returned by the API."""

    run_id: UUID
    scenario: Dict[str, Any]
    projections: List[ProjectionPoint]
    metrics: ProjectionMetrics


# ── Backward-compatible alias ──────────────────────────────────
ProjectionResult = ProjectionPoint
