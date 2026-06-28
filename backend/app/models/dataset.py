"""
Dataset Model - Metadata for uploaded climate datasets.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    source = Column(String(255), nullable=True)
    region = Column(String(100), nullable=False, default="Global")
    date_range = Column(JSON, nullable=True)
    file_path = Column(String(500), nullable=True)
    record_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<Dataset {self.name} ({self.region})>"
