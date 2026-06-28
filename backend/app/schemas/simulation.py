"""
Simulation Schemas
──────────────────
Pydantic models for simulation run operations.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ── Request ────────────────────────────────────────────────────
class SimulationRequest(BaseModel):
    """Payload for triggering a simulation run."""

    scenario_id: UUID = Field(..., description="Scenario ID to simulate")


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
    """Response after starting a simulation."""

    run_id: UUID
    status: str
    message: str = "Simulation started successfully"


# ── Backward-compatible aliases ────────────────────────────────
SimulationStatus = SimulationRunSummary
