"""
ProjectionResult Model
──────────────────────
Stores the raw output of the projection engine — one row per year × indicator.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.types import GUID


class ProjectionResult(Base):
    """A single projection data point (year + indicator)."""

    __tablename__ = "projection_results"
    __table_args__ = (
        Index("ix_proj_run_id", "simulation_run_id"),
        Index("ix_proj_year", "year"),
        Index("ix_proj_indicator", "indicator"),
    )

    # ── Columns ───────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    simulation_run_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("simulation_runs.id", ondelete="CASCADE"), nullable=False
    )
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    indicator: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    confidence_low: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    confidence_high: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    baseline_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # ── Relationships ─────────────────────────────────────────
    simulation_run: Mapped["SimulationRun"] = relationship(  # noqa: F821
        "SimulationRun", back_populates="projections", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Projection {self.year}: {self.indicator}={self.value}>"
