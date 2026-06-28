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


# ── Create ─────────────────────────────────────────────────────
class ScenarioCreate(BaseModel):
    """Payload for creating a new climate scenario."""

    name: str = Field(..., min_length=3, max_length=100, description="Scenario name")
    city: str = Field(default="Global", max_length=100, description="Target city")
    country: str = Field(default="Global", max_length=100, description="Target country")
    target_year: int = Field(default=2035, ge=2025, le=2050, description="Projection target year")

    # ── Sustainability policy sliders (0.0 - 1.0) ────────────
    reforestation_slider: float = Field(default=0.0, ge=0.0, le=1.0, description="Tree planting & reforestation effort")
    renewable_energy_slider: float = Field(default=0.0, ge=0.0, le=1.0, description="Renewable energy adoption level")
    ev_adoption_slider: float = Field(default=0.0, ge=0.0, le=1.0, description="Electric vehicle adoption rate")
    emission_reduction_slider: float = Field(default=0.0, ge=0.0, le=1.0, description="Industrial emission reduction strength")
    public_transit_slider: float = Field(default=0.0, ge=0.0, le=1.0, description="Public transport investment level")
    water_conservation_slider: float = Field(default=0.0, ge=0.0, le=1.0, description="Water conservation level")

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
    reforestation_slider: float
    renewable_energy_slider: float
    ev_adoption_slider: float
    emission_reduction_slider: float
    public_transit_slider: float
    water_conservation_slider: float

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
    reforestation_slider: float
    renewable_energy_slider: float
    ev_adoption_slider: float
    emission_reduction_slider: float
    public_transit_slider: float
    water_conservation_slider: float
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
    reforestation_slider: Optional[float] = Field(None, ge=0.0, le=1.0)
    renewable_energy_slider: Optional[float] = Field(None, ge=0.0, le=1.0)
    ev_adoption_slider: Optional[float] = Field(None, ge=0.0, le=1.0)
    emission_reduction_slider: Optional[float] = Field(None, ge=0.0, le=1.0)
    public_transit_slider: Optional[float] = Field(None, ge=0.0, le=1.0)
    water_conservation_slider: Optional[float] = Field(None, ge=0.0, le=1.0)

    notes: Optional[str] = Field(None, max_length=2000)


# ── Backward-compatible aliases ────────────────────────────────
ScenarioResponse = ScenarioRead
ScenarioList = ScenarioSummary
