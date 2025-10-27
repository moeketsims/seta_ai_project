from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from app.db.database import get_db
from app.models.models import Skill, SkillMastery, LearningPathway, Learner
from app.schemas.schemas import Skill as SkillSchema, LearningPathwaySchema, SkillNodeSchema

router = APIRouter()

@router.get("/", response_model=List[SkillSchema])
def get_skills(
    skip: int = 0,
    limit: int = 100,
    grade: int = None,
    db: Session = Depends(get_db)
):
    """Get all skills"""
    query = db.query(Skill)

    if grade:
        query = query.filter(Skill.grade == grade)

    skills = query.offset(skip).limit(limit).all()

    # Convert to schema format
    result = []
    for skill in skills:
        prerequisites = json.loads(skill.prerequisites) if skill.prerequisites else []
        result.append(SkillSchema(
            id=skill.id,
            name=skill.name,
            description=skill.description,
            topic=skill.topic,
            grade=skill.grade,
            blooms_level=skill.blooms_level,
            prerequisites=prerequisites,
            average_time_to_master=skill.average_time_to_master
        ))

    return result

@router.get("/pathway/{pathway_id}", response_model=LearningPathwaySchema)
def get_learning_pathway(pathway_id: str, db: Session = Depends(get_db)):
    """Get learning pathway with skill progression"""
    pathway = db.query(LearningPathway).filter(LearningPathway.id == pathway_id).first()
    if not pathway:
        raise HTTPException(status_code=404, detail="Pathway not found")

    skill_ids = json.loads(pathway.skill_ids) if pathway.skill_ids else []
    skills = db.query(Skill).filter(Skill.id.in_(skill_ids)).all()

    # Build skill nodes with mastery data
    skill_nodes = []
    for skill in skills:
        # Get learner distribution for this skill
        mastery_records = db.query(SkillMastery).filter(SkillMastery.skill_id == skill.id).all()

        not_started = db.query(Learner).filter(
            ~Learner.id.in_([m.learner_id for m in mastery_records])
        ).count()

        developing = sum(1 for m in mastery_records if 1 <= m.mastery_level < 60)
        proficient = sum(1 for m in mastery_records if 60 <= m.mastery_level < 80)
        mastered = sum(1 for m in mastery_records if m.mastery_level >= 80)

        avg_mastery = sum(m.mastery_level for m in mastery_records) / len(mastery_records) if mastery_records else 0

        # Get prerequisites and next skills
        prerequisites = json.loads(skill.prerequisites) if skill.prerequisites else []
        next_skills = [s.id for s in skills if skill.id in json.loads(s.prerequisites or '[]')]

        skill_nodes.append(SkillNodeSchema(
            skillId=skill.id,
            name=skill.name,
            topic=skill.topic or "",
            masteryLevel=avg_mastery,
            prerequisites=prerequisites,
            learnersAtLevel={
                "notStarted": not_started,
                "developing": developing,
                "proficient": proficient,
                "mastered": mastered
            },
            averageTimeToMaster=skill.average_time_to_master,
            commonBlockers=[],  # Would query from misconceptions
            nextSkills=next_skills
        ))

    return LearningPathwaySchema(
        pathwayId=pathway.id,
        name=pathway.name,
        description=pathway.description or "",
        targetGrade=pathway.target_grade or 4,
        skills=skill_nodes,
        completionRate=pathway.completion_rate,
        estimatedDuration=pathway.estimated_duration
    )
