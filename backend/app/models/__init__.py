"""
ClimateTwin AI — ORM Models

Import all models here so Alembic and ``Base.metadata.create_all`` can discover them.
"""

from app.models.user import User
from app.models.scenario import Scenario
from app.models.simulation_run import SimulationRun
from app.models.projection_result import ProjectionResult
from app.models.dataset import Dataset

__all__ = [
    "User",
    "Scenario",
    "SimulationRun",
    "ProjectionResult",
    "Dataset",
]
