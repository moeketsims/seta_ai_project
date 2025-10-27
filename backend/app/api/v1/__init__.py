from fastapi import APIRouter
from app.api.v1.endpoints import (
    assessments,
    analytics,
    learners,
    diagnostic,
    interventions,
    skills,
    misconceptions,
    ai,
)
from app.api.v1.endpoints import diagnostic_ai

api_router = APIRouter()

api_router.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(learners.router, prefix="/learners", tags=["learners"])
api_router.include_router(diagnostic.router, prefix="/diagnostic", tags=["diagnostic"])
api_router.include_router(interventions.router, prefix="/interventions", tags=["interventions"])
api_router.include_router(skills.router, prefix="/skills", tags=["skills"])
api_router.include_router(misconceptions.router, prefix="/misconceptions", tags=["misconceptions"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(diagnostic_ai.router, prefix="/diagnostic-ai", tags=["diagnostic-ai"])
