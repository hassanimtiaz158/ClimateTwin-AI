"""
Scenario Model - Stores climate scenario configurations.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Integer, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    name = Column(String(255), nullable=False)
    region = Column(String(100), nullable=False, default="Global")
    actions = Column(JSON, nullable=False, default=list)
    start_year = Column(Integer, nullable=False, default=2024)
    end_year = Column(Integer, nullable=False, default=2034)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="scenarios", lazy="selectin")
    simulation_runs = relationship(
        "SimulationRun", back_populates="scenario", lazy="selectin", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Scenario {self.name} ({self.region})>"
