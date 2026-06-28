"""
User Schemas
────────────
Pydantic models for user CRUD operations.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ── Create ─────────────────────────────────────────────────────
class UserCreate(BaseModel):
    """Payload for creating a new user account."""

    email: EmailStr = Field(..., description="Unique email address")
    name: str = Field(..., min_length=1, max_length=255, description="Display name")
    password: str = Field(..., min_length=8, max_length=128, description="Plain-text password")
    role: str = Field(
        default="citizen",
        pattern="^(citizen|researcher|government|ngo)$",
        description="User role",
    )


# ── Read ───────────────────────────────────────────────────────
class UserRead(BaseModel):
    """Public user profile (no password)."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    name: str
    role: str
    created_at: datetime


# ── Update ─────────────────────────────────────────────────────
class UserUpdate(BaseModel):
    """Partial update for a user profile."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[str] = Field(None, pattern="^(citizen|researcher|government|ngo)$")
