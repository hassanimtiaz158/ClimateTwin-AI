"""
Recommendation Schemas
──────────────────────
Pydantic models for AI-generated recommendations.
"""

from __future__ import annotations

from typing import List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RecommendationAction(BaseModel):
    """A single actionable recommendation."""

    title: str = Field(..., description="Short recommendation title")
    description: str = Field(..., description="Detailed explanation")
    priority: str = Field(..., pattern="^(high|medium|low)$", description="Priority level")
    impact: str = Field(..., description="Expected impact (e.g. '25% CO₂ reduction')")


class RecommendationResponse(BaseModel):
    """Full set of AI recommendations for a simulation run."""

    model_config = ConfigDict(from_attributes=True)

    run_id: UUID
    summary: str
    findings: List[str]
    actions: List[RecommendationAction]
    confidence: float = Field(
        ..., ge=0, le=100, description="Model confidence score (%)"
    )
