from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from app.db.database import get_db
from app.models.models import Intervention
from app.schemas.schemas import InterventionDataSchema

router = APIRouter()

@router.get("/", response_model=List[InterventionDataSchema])
def get_interventions(
    skip: int = 0,
    limit: int = 100,
    type: Optional[str] = None,
    effectiveness: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all interventions with optional filtering"""
    query = db.query(Intervention)

    if type:
        query = query.filter(Intervention.type == type)
    if effectiveness:
        query = query.filter(Intervention.effectiveness == effectiveness)

    interventions = query.offset(skip).limit(limit).all()

    # Convert to schema format
    result = []
    for intervention in interventions:
        result.append(InterventionDataSchema(
            interventionId=intervention.id,
            name=intervention.name,
            type=intervention.type,
            targetMisconception=intervention.target_misconception,
            targetSkill=intervention.target_skill,
            created=intervention.created,
            duration=intervention.duration,
            learnersEnrolled=intervention.learners_enrolled,
            learnersCompleted=intervention.learners_completed,
            beforeMetrics=json.loads(intervention.before_metrics) if intervention.before_metrics else {},
            afterMetrics=json.loads(intervention.after_metrics) if intervention.after_metrics else {},
            improvement=json.loads(intervention.improvement) if intervention.improvement else {},
            effectiveness=intervention.effectiveness,
            costPerLearner=intervention.cost_per_learner,
            timeInvestment=intervention.time_investment,
            teacherFeedback=intervention.teacher_feedback,
            learnerSatisfaction=intervention.learner_satisfaction,
            recommendationScore=intervention.recommendation_score
        ))

    return result
