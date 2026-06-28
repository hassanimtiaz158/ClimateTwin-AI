from typing import List
from uuid import UUID
from pydantic import BaseModel, Field


class RecommendationAction(BaseModel):
    title: str
    description: str
    priority: str = Field(..., pattern="^(high|medium|low)$")
    impact: str


class RecommendationResponse(BaseModel):
    run_id: UUID
    summary: str
    findings: List[str]
    actions: List[RecommendationAction]
    confidence: float = Field(..., ge=0, le=100, description="Confidence percentage")
