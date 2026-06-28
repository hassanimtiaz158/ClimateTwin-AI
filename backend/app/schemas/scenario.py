"""
Scenario Schemas
────────────────
Pydantic models for scenario CRUD operations.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Valid climate actions (for backward compatibility) ────────
VALID_ACTIONS = frozenset({
    "renewable_energy",
    "public_transit",
    "reforestation",
    "carbon_tax",
    "waste_reduction",
    "green_buildings",
})


# ── Create ─────────────────────────────────────────────────────
class ScenarioCreate(BaseModel):
    """Payload for creating a new climate scenario."""

    name: str = Field(..., min_length=3, max_length=100, description="Scenario name")
    city: str = Field(default="Global", max_length=100, description="Target city")
    country: str = Field(default="Global", max_length=100, description="Target country")
    target_year: int = Field(default=2035, ge=2025, le=2050, description="Projection target year")

    # ── Sustainability policy sliders (0.0 - 1.0) ────────────
    renewable_energy_slider: float = Field(default=0.0, ge=0.0, le=1.0, description="Renewable energy adoption level")
    public_transit_slider: float = Field(default=0.0, ge=0.0, le=1.0, description="Public transit investment level")
    reforestation_slider: float = Field(default=0.0, ge=0.0, le=1.0, description="Reforestation effort level")
    carbon_tax_slider: float = Field(default=0.0, ge=0.0, le=1.0, description="Carbon tax strength level")
    green_innovation_slider: float = Field(default=0.0, ge=0.0, le=1.0, description="Green innovation investment level")

    notes: Optional[str] = Field(None, max_length=2000, description="Optional notes")


# ── Read ───────────────────────────────────────────────────────
class ScenarioRead(BaseModel):
    """Full scenario record returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: Optional[UUID] = None
    name: str
    city: str
    country: str
    target_year: int

    # ── Sustainability policy sliders ─────────────────────────
    renewable_energy_slider: float
    public_transit_slider: float
    reforestation_slider: float
    carbon_tax_slider: float
    green_innovation_slider: float

    # ── Derived fields (backward compatibility) ───────────────
    region: str
    actions: List[str]
    start_year: int
    end_year: int

    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ScenarioSummary(BaseModel):
    """Lightweight scenario representation for lists."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    city: str
    country: str
    target_year: int
    renewable_energy_slider: float
    public_transit_slider: float
    reforestation_slider: float
    carbon_tax_slider: float
    green_innovation_slider: float
    region: str
    actions: List[str]
    created_at: datetime


# ── Update ─────────────────────────────────────────────────────
class ScenarioUpdate(BaseModel):
    """Partial update for a scenario (only fields that can change)."""

    name: Optional[str] = Field(None, min_length=3, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    target_year: Optional[int] = Field(None, ge=2025, le=2050)

    # ── Sustainability policy sliders ─────────────────────────
    renewable_energy_slider: Optional[float] = Field(None, ge=0.0, le=1.0)
    public_transit_slider: Optional[float] = Field(None, ge=0.0, le=1.0)
    reforestation_slider: Optional[float] = Field(None, ge=0.0, le=1.0)
    carbon_tax_slider: Optional[float] = Field(None, ge=0.0, le=1.0)
    green_innovation_slider: Optional[float] = Field(None, ge=0.0, le=1.0)

    notes: Optional[str] = Field(None, max_length=2000)


# ── Backward-compatible aliases ────────────────────────────────
ScenarioResponse = ScenarioRead
ScenarioList = ScenarioSummary
