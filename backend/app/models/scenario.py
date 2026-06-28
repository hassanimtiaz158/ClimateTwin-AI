"""
Scenario Model
──────────────
A user-defined climate scenario containing location,
sustainability policy sliders, and target year.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.types import GUID


# ── Action impact mapping (for backward compatibility) ────────
ACTION_IMPACT_TABLE = {
    "renewable_energy": {
        "renewable_energy_slider": 1.0,
        "co2_emissions": -0.15,
        "air_quality_index": -0.08,
    },
    "public_transit": {
        "public_transit_slider": 1.0,
        "co2_emissions": -0.10,
        "air_quality_index": -0.05,
    },
    "reforestation": {
        "reforestation_slider": 1.0,
        "forest_cover": 0.12,
        "biodiversity_score": 0.08,
    },
    "carbon_tax": {
        "carbon_tax_slider": 1.0,
        "co2_emissions": -0.20,
        "energy_efficiency": 0.10,
    },
    "waste_reduction": {
        "green_innovation_slider": 0.5,
        "air_quality_index": -0.03,
    },
    "green_buildings": {
        "energy_efficiency": 0.15,
        "renewable_energy_slider": 0.3,
    },
}


class Scenario(Base):
    """A climate scenario configuration."""

    __tablename__ = "scenarios"
    __table_args__ = (
        Index("ix_scenarios_user_id", "user_id"),
        Index("ix_scenarios_city", "city"),
        Index("ix_scenarios_country", "country"),
    )

    # ── Columns ───────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, default="Global")
    country: Mapped[str] = mapped_column(String(100), nullable=False, default="Global")
    target_year: Mapped[int] = mapped_column(Integer, nullable=False, default=2035)

    # ── Sustainability policy sliders (0.0 - 1.0) ────────────
    renewable_energy_slider: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    public_transit_slider: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    reforestation_slider: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    carbon_tax_slider: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    green_innovation_slider: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    # ── Metadata ──────────────────────────────────────────────
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # ── Relationships ─────────────────────────────────────────
    user: Mapped[Optional["User"]] = relationship(  # noqa: F821
        "User", back_populates="scenarios", lazy="selectin"
    )
    simulation_runs: Mapped[list["SimulationRun"]] = relationship(  # noqa: F821
        "SimulationRun",
        back_populates="scenario",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    # ── Backward-compatible properties ────────────────────────
    @property
    def region(self) -> str:
        """Derive region from city/country for backward compatibility."""
        if self.city and self.country and self.country != "Global":
            return f"{self.city}, {self.country}" if self.city != "Global" else self.country
        return self.city or "Global"

    @property
    def actions(self) -> list[str]:
        """Derive active actions from slider values (>= 0.5 threshold)."""
        active = []
        slider_map = {
            "renewable_energy": self.renewable_energy_slider,
            "public_transit": self.public_transit_slider,
            "reforestation": self.reforestation_slider,
            "carbon_tax": self.carbon_tax_slider,
            "green_buildings": 1.0 if self.green_innovation_slider >= 0.5 else 0.0,
            "waste_reduction": 1.0 if self.green_innovation_slider >= 0.3 else 0.0,
        }
        for action, value in slider_map.items():
            if value >= 0.5:
                active.append(action)
        return active

    @property
    def start_year(self) -> int:
        """Always start from current year (2024)."""
        return 2024

    @property
    def end_year(self) -> int:
        """Alias for target_year."""
        return self.target_year

    def __repr__(self) -> str:
        return f"<Scenario {self.name!r} ({self.city}, {self.country})>"
