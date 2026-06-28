"""
Simulation Schemas
─────────────────
Pydantic models for simulation run operations.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ── Request ────────────────────────────────────────────────────
class SimulationRequest(BaseModel):
    """Payload for triggering a simulation run."""

    scenario_id: Optional[UUID] = Field(None, description="Scenario ID to simulate (if exists)")
    
    # ── Inline scenario fields (if scenario_id not provided) ──
    city: Optional[str] = Field(None, max_length=100, description="Target city")
    country: Optional[str] = Field(None, max_length=100, description="Target country")
    target_year: Optional[int] = Field(None, ge=2025, le=2050, description="Projection target year")
    
    # ── Sustainability policy sliders ─────────────────────────
    renewable_energy_slider: Optional[float] = Field(None, ge=0.0, le=1.0)
    public_transit_slider: Optional[float] = Field(None, ge=0.0, le=1.0)
    reforestation_slider: Optional[float] = Field(None, ge=0.0, le=1.0)
    carbon_tax_slider: Optional[float] = Field(None, ge=0.0, le=1.0)
    green_innovation_slider: Optional[float] = Field(None, ge=0.0, le=1.0)


# ── Read ───────────────────────────────────────────────────────
class SimulationRunRead(BaseModel):
    """Full simulation run record."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    scenario_id: UUID
    status: str
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime


class SimulationRunSummary(BaseModel):
    """Lightweight run representation for history lists."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    scenario_id: UUID
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime


# ── Response ───────────────────────────────────────────────────
class SimulationResponse(BaseModel):
    """Response after starting a simulation (legacy)."""

    run_id: UUID
    status: str
    message: str = "Simulation started successfully"


class SimulationMetrics(BaseModel):
    """Key metrics from the simulation."""

    temperature_change: float
    co2_change: float
    air_quality_change: float
    forest_cover_change: float
    biodiversity_change: float
    water_stress_change: float
    heatwave_change: float
    flood_risk_change: float


class ChartDataPoint(BaseModel):
    """Data point for frontend charts."""

    year: int
    value: float
    baseline: Optional[float] = None
    label: Optional[str] = None


class SimulationResultResponse(BaseModel):
    """Unified response from POST /api/simulate with full results."""

    run_id: UUID
    scenario_id: UUID
    status: str
    message: str

    # ── Projections (8 indicators × years) ────────────────────
    projections: List[Dict[str, Any]]

    # ── Summary metrics ───────────────────────────────────────
    metrics: SimulationMetrics

    # ── Chart data (ready for frontend Recharts) ──────────────
    chart_data: Dict[str, List[ChartDataPoint]]

    # ── Recommendations (AI-generated) ────────────────────────
    recommendations: List[Dict[str, Any]]


# ── Backward-compatible aliases ────────────────────────────────
SimulationStatus = SimulationRunSummary
