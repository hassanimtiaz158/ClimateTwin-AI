"""
ClimateTwin AI — Pydantic Schemas

Import every public schema here so routers can do::

    from app.schemas import ScenarioCreate, ScenarioRead
"""

from app.schemas.scenario import (
    ScenarioCreate,
    ScenarioRead,
    ScenarioUpdate,
    ScenarioResponse,
)
from app.schemas.simulation import (
    SimulationRequest,
    SimulationRunRead,
    SimulationRunSummary,
    SimulationResultResponse,
)
from app.schemas.recommendation import (
    RecommendationAction,
    RecommendationResponse,
)
from app.schemas.dataset import (
    DatasetUpload,
    DatasetRead,
    DatasetResponse,
)

__all__ = [
    # Scenario
    "ScenarioCreate",
    "ScenarioRead",
    "ScenarioUpdate",
    "ScenarioResponse",
    # Simulation
    "SimulationRequest",
    "SimulationRunRead",
    "SimulationRunSummary",
    "SimulationResultResponse",
    # Recommendation
    "RecommendationAction",
    "RecommendationResponse",
    # Dataset
    "DatasetUpload",
    "DatasetRead",
    "DatasetResponse",
]
