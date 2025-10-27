from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from app.db.database import get_db
from app.models.models import Misconception
from app.schemas.schemas import MisconceptionTrendSchema

router = APIRouter()

@router.get("/", response_model=List[MisconceptionTrendSchema])
def get_misconceptions(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all misconceptions with filtering"""
    query = db.query(Misconception)

    if category and category != "all":
        query = query.filter(Misconception.category == category)
    if severity:
        query = query.filter(Misconception.severity == severity)

    misconceptions = query.offset(skip).limit(limit).all()

    # Convert to schema format
    result = []
    for misc in misconceptions:
        weekly_occ = json.loads(misc.weekly_occurrences) if misc.weekly_occurrences else []
        prereq_skills = json.loads(misc.prerequisite_skills) if misc.prerequisite_skills else []

        # Mock recommended interventions
        recommended = [
            {"type": "manipulative", "description": "Use hands-on manipulatives"},
            {"type": "video", "description": "Watch conceptual explanation video"},
            {"type": "practice", "description": "Targeted practice problems"}
        ]

        result.append(MisconceptionTrendSchema(
            misconceptionId=misc.id,
            name=misc.name,
            description=misc.description or "",
            category=misc.category or "",
            weeklyOccurrences=weekly_occ,
            totalAffected=misc.total_affected,
            interventionsCreated=2,  # Mock
            resolutionRate=misc.resolution_rate,
            averageTimeToResolve=misc.average_time_to_resolve,
            severity=misc.severity.value,
            prerequisiteSkills=prereq_skills,
            recommendedInterventions=recommended
        ))

    return result
