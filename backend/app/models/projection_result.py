"""
ProjectionResult Model - Stores individual projection data points.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class ProjectionResult(Base):
    __tablename__ = "projection_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    simulation_run_id = Column(
        UUID(as_uuid=True),
        ForeignKey("simulation_runs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    year = Column(Integer, nullable=False)
    indicator = Column(String(100), nullable=False)
    value = Column(Float, nullable=False)
    confidence_low = Column(Float, nullable=True)
    confidence_high = Column(Float, nullable=True)
    baseline_value = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    simulation_run = relationship("SimulationRun", back_populates="projections", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Projection {self.year}: {self.indicator}={self.value}>"
