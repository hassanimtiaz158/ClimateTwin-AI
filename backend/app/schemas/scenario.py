"""
Scenario Schemas - Request/response models for scenarios.
"""

from typing import List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ScenarioCreate(BaseModel):
    """Schema for creating a new scenario."""
    name: str = Field(..., min_length=3, max_length=100, description="Scenario name")
    region: str = Field(default="Global", description="Target region")
    actions: List[str] = Field(..., min_length=1, description="List of climate actions")
    start_year: int = Field(default=2024, ge=2024, le=2030, description="Simulation start year")
    end_year: int = Field(default=2034, ge=2025, le=2035, description="Simulation end year")


class ScenarioResponse(BaseModel):
    """Schema for scenario response."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    region: str
    actions: List[str]
    start_year: int
    end_year: int
    created_at: datetime


class ScenarioList(BaseModel):
    """Schema for scenario list item."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    region: str
    actions: List[str]
    created_at: datetime
