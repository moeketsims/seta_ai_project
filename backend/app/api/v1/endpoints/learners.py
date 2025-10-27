from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.models import Learner, User, SkillMastery
from app.schemas.schemas import Learner as LearnerSchema

router = APIRouter()

@router.get("/", response_model=List[LearnerSchema])
def get_learners(
    skip: int = 0,
    limit: int = 100,
    class_id: Optional[str] = None,
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all learners with optional filtering"""
    query = db.query(Learner)

    if class_id:
        query = query.filter(Learner.class_id == class_id)
    if risk_level:
        query = query.filter(Learner.risk_level == risk_level)

    learners = query.offset(skip).limit(limit).all()
    return learners

@router.get("/{learner_id}", response_model=LearnerSchema)
def get_learner(learner_id: str, db: Session = Depends(get_db)):
    """Get a specific learner"""
    learner = db.query(Learner).filter(Learner.id == learner_id).first()
    if not learner:
        raise HTTPException(status_code=404, detail="Learner not found")
    return learner

@router.get("/{learner_id}/skills")
def get_learner_skills(learner_id: str, db: Session = Depends(get_db)):
    """Get skill mastery for a learner"""
    skill_mastery = db.query(SkillMastery).filter(
        SkillMastery.learner_id == learner_id
    ).all()

    return skill_mastery
