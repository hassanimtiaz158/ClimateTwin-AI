"""
Dataset Schemas - Request/response models for dataset operations.
"""

from typing import Optional, Dict
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class DatasetUpload(BaseModel):
    """Schema for dataset upload metadata."""
    name: str = Field(..., min_length=1, max_length=255)
    source: Optional[str] = None
    region: str = Field(default="Global")
    date_range: Optional[Dict[str, str]] = None


class DatasetResponse(BaseModel):
    """Schema for dataset response."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    source: Optional[str]
    region: str
    date_range: Optional[Dict[str, str]]
    record_count: int
    created_at: datetime
