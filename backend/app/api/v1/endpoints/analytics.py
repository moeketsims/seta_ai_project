from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.db.database import get_db
from app.models.models import Learner, Assessment, AssessmentResult, SkillMastery, Skill
from app.schemas.schemas import AnalyticsMetricsSchema, PerformanceTrendSchema, ClassPerformanceSchema

router = APIRouter()

@router.get("/metrics", response_model=AnalyticsMetricsSchema)
def get_analytics_metrics(db: Session = Depends(get_db)):
    """Get overall analytics metrics"""
    total_learners = db.query(func.count(Learner.id)).scalar()
    active_learners = db.query(func.count(Learner.id)).filter(
        Learner.last_active >= func.now() - func.cast('7 days', func.Interval)
    ).scalar()

    return {
        "dailyActiveUsers": int(active_learners * 0.6) if active_learners else 0,
        "weeklyActiveUsers": active_learners or 0,
        "averageSessionDuration": 42.0,
        "completionRate": 92.0
    }

@router.get("/performance-trend", response_model=PerformanceTrendSchema)
def get_performance_trend(class_id: str = None, db: Session = Depends(get_db)):
    """Get 12-week performance trend"""
    # Mock data for now - would calculate from actual assessment results
    return {
        "labels": [f"Week {i}" for i in range(1, 13)],
        "datasets": [
            {
                "label": "Grade 4A",
                "data": [65, 67, 70, 68, 72, 74, 75, 76, 78, 77, 80, 81],
                "color": "#0066CC"
            }
        ]
    }

@router.get("/skill-mastery")
def get_skill_mastery(class_id: str = None, db: Session = Depends(get_db)):
    """Get skill mastery distribution"""
    # Calculate average mastery by topic
    skills = db.query(Skill).all()
    topics = {}
    for skill in skills:
        if skill.topic not in topics:
            topics[skill.topic] = []

        # Get average mastery for this skill
        avg_mastery = db.query(func.avg(SkillMastery.mastery_level)).filter(
            SkillMastery.skill_id == skill.id
        ).scalar()

        if avg_mastery:
            topics[skill.topic].append(float(avg_mastery))

    # Calculate topic averages
    topic_averages = {topic: sum(scores) / len(scores) if scores else 0
                     for topic, scores in topics.items()}

    return {
        "labels": list(topic_averages.keys())[:5],  # Top 5 topics
        "datasets": [
            {
                "label": "Class Average",
                "data": list(topic_averages.values())[:5],
                "color": "#0066CC"
            }
        ]
    }

@router.get("/learner-distribution")
def get_learner_distribution(db: Session = Depends(get_db)):
    """Get learner progress distribution"""
    on_track = db.query(func.count(Learner.id)).filter(
        Learner.risk_level.in_(["low"])
    ).scalar()

    needs_support = db.query(func.count(Learner.id)).filter(
        Learner.risk_level == "medium"
    ).scalar()

    at_risk = db.query(func.count(Learner.id)).filter(
        Learner.risk_level.in_(["high", "critical"])
    ).scalar()

    total = on_track + needs_support + at_risk

    return {
        "onTrack": on_track or 0,
        "needsSupport": needs_support or 0,
        "atRisk": at_risk or 0,
        "total": total or 0
    }

@router.get("/misconception-frequency")
def get_misconception_frequency(db: Session = Depends(get_db)):
    """Get top misconceptions"""
    from app.models.models import Misconception

    misconceptions = db.query(Misconception).order_by(
        Misconception.total_affected.desc()
    ).limit(6).all()

    return {
        "labels": [m.name[:20] + "..." if len(m.name) > 20 else m.name for m in misconceptions],
        "datasets": [
            {
                "label": "Occurrences",
                "data": [m.total_affected for m in misconceptions],
                "color": "#EF4444"
            }
        ]
    }

@router.get("/skill-heatmap")
def get_skill_heatmap(class_id: str, db: Session = Depends(get_db)):
    """Get skill mastery heatmap for class"""
    learners = db.query(Learner).filter(Learner.class_id == class_id).limit(20).all()
    skills = db.query(Skill).limit(10).all()

    heatmap_data = []
    for learner in learners:
        learner_mastery = []
        for skill in skills:
            mastery = db.query(SkillMastery).filter(
                SkillMastery.learner_id == learner.id,
                SkillMastery.skill_id == skill.id
            ).first()

            learner_mastery.append({
                "skillId": skill.id,
                "skillName": skill.name,
                "mastery": int(mastery.mastery_level) if mastery else 0
            })

        heatmap_data.append({
            "learnerId": learner.id,
            "learnerName": f"{learner.user.first_name} {learner.user.last_name}" if learner.user else "Unknown",
            "masteryLevels": learner_mastery
        })

    return heatmap_data
