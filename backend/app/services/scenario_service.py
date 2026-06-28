"""
Scenario Service - Business logic for scenario CRUD operations.
"""

import logging
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.scenario import Scenario
from app.schemas.scenario import ScenarioCreate

logger = logging.getLogger(__name__)


class ScenarioService:
    """Handles scenario creation, retrieval, and listing."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, config: ScenarioCreate) -> Scenario:
        """Create a new climate scenario."""
        logger.info(f"Creating scenario: {config.name} ({config.region})")

        scenario = Scenario(
            name=config.name,
            region=config.region,
            actions=config.actions,
            start_year=config.start_year,
            end_year=config.end_year,
        )
        self.db.add(scenario)
        await self.db.flush()
        await self.db.refresh(scenario)

        logger.info(f"Scenario created: {scenario.id}")
        return scenario

    async def get(self, scenario_id: UUID) -> Optional[Scenario]:
        """Get scenario by ID."""
        result = await self.db.execute(
            select(Scenario).where(Scenario.id == scenario_id)
        )
        return result.scalar_one_or_none()

    async def list(self, skip: int = 0, limit: int = 100) -> List[Scenario]:
        """List scenarios with pagination."""
        result = await self.db.execute(
            select(Scenario)
            .offset(skip)
            .limit(limit)
            .order_by(Scenario.created_at.desc())
        )
        return list(result.scalars().all())

    async def count(self) -> int:
        """Count total scenarios."""
        result = await self.db.execute(select(func.count(Scenario.id)))
        return result.scalar_one()

    async def delete(self, scenario_id: UUID) -> bool:
        """Delete a scenario by ID."""
        scenario = await self.get(scenario_id)
        if not scenario:
            return False
        await self.db.delete(scenario)
        await self.db.flush()
        logger.info(f"Scenario deleted: {scenario_id}")
        return True
