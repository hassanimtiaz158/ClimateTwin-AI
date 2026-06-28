"""
Dataset Schemas
───────────────
Pydantic models for dataset upload and retrieval.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ── Upload ─────────────────────────────────────────────────────
class DatasetUpload(BaseModel):
    """Metadata sent alongside the file upload."""

    name: str = Field(..., min_length=1, max_length=255, description="Dataset name")
    source: Optional[str] = Field(None, description="Data origin (e.g. NOAA, NASA)")
    region: str = Field(default="Global", description="Geographic coverage")
    date_range: Optional[Dict[str, str]] = Field(
        None, description='{"start": "2000-01-01", "end": "2023-12-31"}'
    )


# ── Read ───────────────────────────────────────────────────────
class DatasetRead(BaseModel):
    """Dataset record returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    source: Optional[str] = None
    region: str
    date_range: Optional[Dict[str, Any]] = None
    file_path: Optional[str] = None
    record_count: int
    created_at: datetime
    updated_at: datetime


class DatasetSummary(BaseModel):
    """Lightweight representation for list views."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    source: Optional[str] = None
    region: str
    record_count: int
    created_at: datetime


# ── Backward-compatible alias ──────────────────────────────────
DatasetResponse = DatasetRead
