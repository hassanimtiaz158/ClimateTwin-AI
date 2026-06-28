"""
ClimateTwin AI — Pydantic Schemas

Import every public schema here so routers can do::

    from app.schemas import ScenarioCreate, ScenarioRead
"""

from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.schemas.scenario import (
    ScenarioCreate,
    ScenarioRead,
    ScenarioSummary,
    ScenarioUpdate,
    ScenarioResponse,
    ScenarioList,
)
from app.schemas.simulation import (
    SimulationRequest,
    SimulationRunRead,
    SimulationRunSummary,
    SimulationResponse,
    SimulationStatus,
)
from app.schemas.projection import (
    ProjectionPoint,
    ProjectionResponse,
    SimulationMetrics,
    ProjectionResult,
)
from app.schemas.recommendation import (
    RecommendationAction,
    RecommendationResponse,
)
from app.schemas.dataset import (
    DatasetUpload,
    DatasetRead,
    DatasetSummary,
    DatasetResponse,
)

__all__ = [
    # User
    "UserCreate",
    "UserRead",
    "UserUpdate",
    # Scenario
    "ScenarioCreate",
    "ScenarioRead",
    "ScenarioSummary",
    "ScenarioUpdate",
    "ScenarioResponse",
    "ScenarioList",
    # Simulation
    "SimulationRequest",
    "SimulationRunRead",
    "SimulationRunSummary",
    "SimulationResponse",
    "SimulationStatus",
    # Projection
    "ProjectionPoint",
    "ProjectionResponse",
    "SimulationMetrics",
    "ProjectionResult",
    # Recommendation
    "RecommendationAction",
    "RecommendationResponse",
    # Dataset
    "DatasetUpload",
    "DatasetRead",
    "DatasetSummary",
    "DatasetResponse",
]
