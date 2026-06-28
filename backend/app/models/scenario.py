"""
Scenario Model
──────────────
A user-defined climate scenario containing selected actions,
target region, and projection year range.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.types import GUID, JSONColumn


class Scenario(Base):
    """A climate scenario configuration."""

    __tablename__ = "scenarios"
    __table_args__ = (
        Index("ix_scenarios_user_id", "user_id"),
        Index("ix_scenarios_region", "region"),
    )

    # ── Columns ───────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    region: Mapped[str] = mapped_column(String(100), nullable=False, default="Global")
    actions: Mapped[list] = mapped_column(
        JSONColumn(default=list), nullable=False, default=list
    )
    start_year: Mapped[int] = mapped_column(Integer, nullable=False, default=2024)
    end_year: Mapped[int] = mapped_column(Integer, nullable=False, default=2034)
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

    def __repr__(self) -> str:
        return f"<Scenario {self.name!r} ({self.region})>"
