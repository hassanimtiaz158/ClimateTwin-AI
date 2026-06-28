"""
Scenario Schemas
────────────────
Pydantic models for scenario CRUD operations.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ── Valid climate actions ──────────────────────────────────────
VALID_ACTIONS = frozenset({
    "renewable_energy",
    "public_transit",
    "reforestation",
    "carbon_tax",
    "waste_reduction",
    "green_buildings",
})

VALID_REGIONS = frozenset({
    "Global",
    "North America",
    "Europe",
    "Asia Pacific",
    "Africa",
    "South America",
    "Middle East",
})


# ── Create ─────────────────────────────────────────────────────
class ScenarioCreate(BaseModel):
    """Payload for creating a new climate scenario."""

    name: str = Field(..., min_length=3, max_length=100, description="Scenario name")
    region: str = Field(default="Global", description="Target region")
    actions: List[str] = Field(..., min_length=1, description="Climate actions to simulate")
    start_year: int = Field(default=2024, ge=2024, le=2030, description="Projection start year")
    end_year: int = Field(default=2034, ge=2025, le=2035, description="Projection end year")


# ── Read ───────────────────────────────────────────────────────
class ScenarioRead(BaseModel):
    """Full scenario record returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: Optional[UUID] = None
    name: str
    region: str
    actions: List[str]
    start_year: int
    end_year: int
    created_at: datetime
    updated_at: datetime


class ScenarioSummary(BaseModel):
    """Lightweight scenario representation for lists."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    region: str
    actions: List[str]
    start_year: int
    end_year: int
    created_at: datetime


# ── Update ─────────────────────────────────────────────────────
class ScenarioUpdate(BaseModel):
    """Partial update for a scenario (only fields that can change)."""

    name: Optional[str] = Field(None, min_length=3, max_length=100)
    region: Optional[str] = None
    actions: Optional[List[str]] = Field(None, min_length=1)
    start_year: Optional[int] = Field(None, ge=2024, le=2030)
    end_year: Optional[int] = Field(None, ge=2025, le=2035)


# ── Backward-compatible aliases ────────────────────────────────
# Existing routers import ScenarioResponse / ScenarioList — map them here.
ScenarioResponse = ScenarioRead
ScenarioList = ScenarioSummary
