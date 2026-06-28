"""
Simulation Schemas - Request/response models for simulation runs.
"""

from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class SimulationRequest(BaseModel):
    """Schema for requesting a simulation."""
    scenario_id: UUID = Field(..., description="Scenario ID to simulate")


class SimulationResponse(BaseModel):
    """Schema for simulation response."""
    run_id: UUID
    status: str
    message: str = "Simulation started successfully"


class SimulationStatus(BaseModel):
    """Schema for simulation status."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    scenario_id: UUID
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
