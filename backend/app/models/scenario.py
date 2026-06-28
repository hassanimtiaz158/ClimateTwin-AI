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
    reforestation_slider: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    renewable_energy_slider: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    ev_adoption_slider: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    emission_reduction_slider: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    public_transit_slider: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    water_conservation_slider: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

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
        """Derive active actions from slider values (>= 0.1 threshold)."""
        active = []
        slider_map = {
            "reforestation": self.reforestation_slider,
            "renewable_energy": self.renewable_energy_slider,
            "ev_adoption": self.ev_adoption_slider,
            "emission_reduction": self.emission_reduction_slider,
            "public_transit": self.public_transit_slider,
            "water_conservation": self.water_conservation_slider,
        }
        for action, value in slider_map.items():
            if value >= 0.1:
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
