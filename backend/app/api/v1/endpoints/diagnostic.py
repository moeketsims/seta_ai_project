from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from app.db.database import get_db
from app.models.models import Assessment, Question, AssessmentQuestion, AssessmentResult, Learner
from app.schemas.schemas import WeeklyDiagnosticSchema, QuestionAnalysisSchema

router = APIRouter()

@router.get("/weekly/{assessment_id}", response_model=WeeklyDiagnosticSchema)
def get_weekly_diagnostic(assessment_id: str, db: Session = Depends(get_db)):
    """Get deep dive data for a weekly diagnostic assessment"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Get questions
    question_links = db.query(AssessmentQuestion).filter(
        AssessmentQuestion.assessment_id == assessment_id
    ).order_by(AssessmentQuestion.order).all()

    question_ids = [link.question_id for link in question_links]
    questions = db.query(Question).filter(Question.id.in_(question_ids)).all()

    # Get results
    results = db.query(AssessmentResult).filter(
        AssessmentResult.assessment_id == assessment_id
    ).all()

    # Calculate completion rate
    total_learners = db.query(Learner).filter(Learner.grade == assessment.grade).count()
    completion_rate = (len(results) / total_learners * 100) if total_learners > 0 else 0

    # Calculate average score
    avg_score = sum(r.percentage for r in results) / len(results) if results else 0

    # Build question analysis
    question_analysis = []
    for question in questions:
        # Parse misconception IDs
        misconception_ids = json.loads(question.misconception_ids) if question.misconception_ids else []
        misconception_data = None
        if misconception_ids:
            from app.models.models import Misconception
            misc = db.query(Misconception).filter(Misconception.id == misconception_ids[0]).first()
            if misc:
                misconception_data = {
                    "id": misc.id,
                    "name": misc.name,
                    "frequency": misc.total_affected
                }

        # Parse skills
        skill_ids = json.loads(question.skill_ids) if question.skill_ids else []

        # Build common wrong answers (mock data - would calculate from actual results)
        common_wrong = []
        if question.options:
            options = json.loads(question.options)
            for opt in options:
                if opt != question.correct_answer:
                    common_wrong.append({
                        "answer": opt,
                        "percentage": 15,  # Mock data
                        "possibleReasoning": "Possible misconception"
                    })

        question_analysis.append(QuestionAnalysisSchema(
            questionId=question.id,
            content=question.content,
            correctRate=question.correct_rate,
            averageTime=question.average_time,
            misconceptionTriggered=misconception_data,
            skillsTested=skill_ids,
            commonWrongAnswers=common_wrong[:3]  # Top 3
        ))

    return WeeklyDiagnosticSchema(
        assessmentId=assessment.id,
        title=assessment.title,
        weekNumber=12,  # Mock - would extract from assessment metadata
        grade=assessment.grade,
        completionRate=completion_rate,
        averageScore=avg_score,
        questions=question_analysis,
        participantCount=len(results),
        dateCompleted=assessment.created_at
    )

@router.get("/at-risk")
def get_at_risk_learners(db: Session = Depends(get_db)):
    """Get at-risk learners with predictive analytics"""
    from app.schemas.schemas import AtRiskLearnerSchema

    learners = db.query(Learner).filter(
        Learner.risk_level.in_(["high", "critical"])
    ).limit(10).all()

    at_risk_data = []
    for learner in learners:
        user = learner.user
        name = f"{user.first_name} {user.last_name}" if user else "Unknown"

        # Mock risk factors and predictions
        at_risk_data.append(AtRiskLearnerSchema(
            learnerId=learner.id,
            name=name,
            grade=learner.grade,
            riskScore=learner.risk_score,
            riskLevel=learner.risk_level.value,
            trendDirection=learner.trend_direction.value,
            riskFactors=[
                {"factor": "Declining Performance", "weight": 35, "description": "Scores dropped recently"},
                {"factor": "Low Engagement", "weight": 28, "description": f"Attendance at {learner.attendance_rate:.0f}%"}
            ],
            predictedOutcome={
                "nextAssessmentScore": max(20, int(learner.risk_score - 10)),
                "confidenceInterval": [max(15, int(learner.risk_score - 15)), max(25, int(learner.risk_score - 5))],
                "probabilityOfFailure": min(95, int(learner.risk_score)),
                "daysUntilIntervention": 3 if learner.risk_level.value == "critical" else 7
            },
            recommendedActions=[
                {"priority": "urgent", "action": "Schedule one-on-one session", "estimatedImpact": 25},
                {"priority": "high", "action": "Assign remediation pathway", "estimatedImpact": 18}
            ],
            recentPerformance=[
                {"week": i, "score": max(20, int(70 - i * 5))} for i in range(5, 13)
            ],
            engagementMetrics={
                "attendanceRate": learner.attendance_rate,
                "completionRate": learner.completion_rate,
                "timeOnTask": learner.time_on_task,
                "lastActive": learner.last_active.isoformat()
            }
        ))

    return at_risk_data
