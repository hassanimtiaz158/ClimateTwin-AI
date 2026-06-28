"""
SimulationRun Model
───────────────────
Tracks the lifecycle of a single simulation: pending → running → completed|failed.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.types import GUID, StringEnum

# ── Constants ──────────────────────────────────────────────────
_STATUSES = ("pending", "running", "completed", "failed")


class SimulationRun(Base):
    """One execution of the projection engine against a scenario."""

    __tablename__ = "simulation_runs"
    __table_args__ = (
        Index("ix_sim_runs_scenario_id", "scenario_id"),
        Index("ix_sim_runs_status", "status"),
    )

    # ── Columns ───────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    scenario_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("scenarios.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        StringEnum(_STATUSES, name="simulation_status"),
        default="pending",
        nullable=False,
    )
    error_message: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # ── Relationships ─────────────────────────────────────────
    scenario: Mapped["Scenario"] = relationship(  # noqa: F821
        "Scenario", back_populates="simulation_runs", lazy="selectin"
    )
    projections: Mapped[list["ProjectionResult"]] = relationship(  # noqa: F821
        "ProjectionResult",
        back_populates="simulation_run",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<SimulationRun {self.id} [{self.status}]>"
