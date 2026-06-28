from typing import Optional, Dict
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


class DatasetUpload(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    source: Optional[str] = None
    region: str = Field(default="Global")
    date_range: Optional[Dict[str, str]] = None


class DatasetResponse(BaseModel):
    id: UUID
    name: str
    source: Optional[str]
    region: str
    date_range: Optional[Dict[str, str]]
    record_count: int
    created_at: datetime

    class Config:
        from_attributes = True
