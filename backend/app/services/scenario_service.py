from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.scenario import Scenario
from app.schemas.scenario import ScenarioCreate


class ScenarioService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, config: ScenarioCreate) -> Scenario:
        """Create a new scenario."""
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
            select(Scenario).offset(skip).limit(limit).order_by(Scenario.created_at.desc())
        )
        return list(result.scalars().all())
