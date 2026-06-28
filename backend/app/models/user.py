"""
User Model
──────────
Stores user accounts.  Auth is optional for the MVP (anonymous users
are supported via a NULL user_id on scenarios).
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.types import GUID, StringEnum

# ── Constants ──────────────────────────────────────────────────
_ROLES = ("citizen", "researcher", "government", "ngo")


class User(Base):
    """A registered user of the platform."""

    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_email", "email", unique=True),
    )

    # ── Columns ───────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        StringEnum(_ROLES, name="user_role"), default="citizen", nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # ── Relationships ─────────────────────────────────────────
    scenarios: Mapped[list["Scenario"]] = relationship(  # noqa: F821
        "Scenario", back_populates="user", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<User {self.email!r}>"
