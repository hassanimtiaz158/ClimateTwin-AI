"""
Dataset Model
─────────────
Metadata for uploaded climate datasets (CSV / Parquet / JSON).
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.types import GUID, JSONColumn


class Dataset(Base):
    """An uploaded climate dataset."""

    __tablename__ = "datasets"

    # ── Columns ───────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    region: Mapped[str] = mapped_column(String(100), nullable=False, default="Global")
    date_range: Mapped[Optional[dict]] = mapped_column(
        JSONColumn(default=None), nullable=True
    )
    file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    record_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<Dataset {self.name!r} ({self.region})>"
