from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    scenario_id: UUID = Field(..., description="Scenario ID to simulate")


class SimulationResponse(BaseModel):
    run_id: UUID
    status: str
    message: str = "Simulation started successfully"


class SimulationStatus(BaseModel):
    id: UUID
    scenario_id: UUID
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True
