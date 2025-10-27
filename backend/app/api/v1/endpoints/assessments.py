from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.models import Assessment, Question, AssessmentQuestion
from app.schemas.schemas import Assessment as AssessmentSchema, AssessmentWithQuestions, Question as QuestionSchema

router = APIRouter()

@router.get("/", response_model=List[AssessmentSchema])
def get_assessments(
    skip: int = 0,
    limit: int = 100,
    grade: Optional[int] = None,
    type: Optional[str] = None,
    published: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get all assessments with optional filtering"""
    query = db.query(Assessment)

    if grade is not None:
        query = query.filter(Assessment.grade == grade)
    if type is not None:
        query = query.filter(Assessment.type == type)
    if published is not None:
        query = query.filter(Assessment.published == published)

    assessments = query.offset(skip).limit(limit).all()
    return assessments

@router.get("/{assessment_id}", response_model=AssessmentWithQuestions)
def get_assessment(assessment_id: str, db: Session = Depends(get_db)):
    """Get a specific assessment with its questions"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Get questions for this assessment
    question_links = db.query(AssessmentQuestion).filter(
        AssessmentQuestion.assessment_id == assessment_id
    ).order_by(AssessmentQuestion.order).all()

    question_ids = [link.question_id for link in question_links]
    questions = db.query(Question).filter(Question.id.in_(question_ids)).all()

    # Sort questions by order
    questions_dict = {q.id: q for q in questions}
    ordered_questions = [questions_dict[qid] for qid in question_ids if qid in questions_dict]

    # Convert to dict and add questions
    assessment_dict = {
        "id": assessment.id,
        "title": assessment.title,
        "description": assessment.description,
        "type": assessment.type,
        "grade": assessment.grade,
        "duration": assessment.duration,
        "total_marks": assessment.total_marks,
        "topics": assessment.topics,
        "created_by": assessment.created_by,
        "created_at": assessment.created_at,
        "published": assessment.published,
        "questions": ordered_questions
    }

    return assessment_dict

@router.get("/questions/all", response_model=List[QuestionSchema])
def get_all_questions(
    skip: int = 0,
    limit: int = 100,
    difficulty: Optional[int] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all questions with optional filtering"""
    query = db.query(Question)

    if difficulty is not None:
        query = query.filter(Question.difficulty == difficulty)
    if type is not None:
        query = query.filter(Question.type == type)

    questions = query.offset(skip).limit(limit).all()
    return questions

@router.get("/questions/{question_id}", response_model=QuestionSchema)
def get_question(question_id: str, db: Session = Depends(get_db)):
    """Get a specific question"""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question
