"""
Seed script to populate database with comprehensive mock data
Run with: python -m app.db.seed
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models.models import (
    User, Class, Learner, Skill, SkillMastery, Misconception,
    Assessment, Question, AssessmentQuestion, AssessmentResult,
    Intervention, LearningPathway
)
from datetime import datetime, timedelta
import json

def seed_database():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print("Seeding users...")
        # Teacher users
        teacher1 = User(
            id="teacher-001",
            email="nandi.mokoena@school.ac.za",
            first_name="Nandi",
            last_name="Mokoena",
            role="teacher",
            hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Le",  # hashed "password"
            created_at=datetime.utcnow()
        )

        teacher2 = User(
            id="teacher-002",
            email="thabo.dlamini@school.ac.za",
            first_name="Thabo",
            last_name="Dlamini",
            role="teacher",
            hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Le",
            created_at=datetime.utcnow()
        )

        db.add_all([teacher1, teacher2])

        print("Seeding classes...")
        class1 = Class(
            id="class-g4a",
            name="Grade 4A",
            grade=4,
            teacher_id="teacher-001",
            school_id="school-001",
            created_at=datetime.utcnow()
        )

        class2 = Class(
            id="class-g4b",
            name="Grade 4B",
            grade=4,
            teacher_id="teacher-001",
            school_id="school-001",
            created_at=datetime.utcnow()
        )

        class3 = Class(
            id="class-g5a",
            name="Grade 5A",
            grade=5,
            teacher_id="teacher-002",
            school_id="school-001",
            created_at=datetime.utcnow()
        )

        db.add_all([class1, class2, class3])

        print("Seeding learners...")
        # Create 50 learner users and learner profiles
        learners_data = []
        for i in range(1, 51):
            user_id = f"learner-{i:03d}"
            user = User(
                id=user_id,
                email=f"learner{i}@school.ac.za",
                first_name=f"Learner",
                last_name=f"Name{i}",
                role="learner",
                hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Le",
                created_at=datetime.utcnow()
            )

            # Distribute learners across classes
            class_id = "class-g4a" if i <= 20 else ("class-g4b" if i <= 35 else "class-g5a")
            grade = 4 if i <= 35 else 5

            # Vary risk levels
            risk_score = 30 + (i * 1.5) % 70
            if risk_score >= 80:
                risk_level = "critical"
            elif risk_score >= 65:
                risk_level = "high"
            elif risk_score >= 50:
                risk_level = "medium"
            else:
                risk_level = "low"

            learner = Learner(
                id=f"learner-{i:03d}",
                user_id=user_id,
                class_id=class_id,
                grade=grade,
                current_level=1 + (i % 5),
                xp=100 + (i * 50),
                streak_days=i % 30,
                risk_score=risk_score,
                risk_level=risk_level,
                trend_direction=["improving", "stable", "declining"][i % 3],
                engagement_score=40.0 + (i % 60),
                attendance_rate=60.0 + (i % 40),
                completion_rate=50.0 + (i % 50),
                time_on_task=10.0 + (i % 40),
                last_active=datetime.utcnow() - timedelta(days=i % 10)
            )

            db.add(user)
            db.add(learner)
            learners_data.append(learner)

        print("Seeding skills...")
        skills_data = [
            {"id": "skill-001", "name": "Number Recognition", "topic": "Numbers & Operations", "grade": 4, "blooms_level": "knowledge", "prerequisites": []},
            {"id": "skill-002", "name": "Place Value (Whole Numbers)", "topic": "Numbers & Operations", "grade": 4, "blooms_level": "comprehension", "prerequisites": ["skill-001"]},
            {"id": "skill-003", "name": "Addition & Subtraction Basics", "topic": "Numbers & Operations", "grade": 4, "blooms_level": "application", "prerequisites": ["skill-001"]},
            {"id": "skill-004", "name": "Decimal Place Value", "topic": "Numbers & Operations", "grade": 4, "blooms_level": "comprehension", "prerequisites": ["skill-002"]},
            {"id": "skill-005", "name": "Fraction Basics", "topic": "Numbers & Operations", "grade": 4, "blooms_level": "comprehension", "prerequisites": ["skill-002"]},
            {"id": "skill-006", "name": "Multiplication Basics", "topic": "Numbers & Operations", "grade": 4, "blooms_level": "application", "prerequisites": ["skill-003"]},
            {"id": "skill-007", "name": "Decimal Multiplication", "topic": "Numbers & Operations", "grade": 4, "blooms_level": "application", "prerequisites": ["skill-004", "skill-006"]},
            {"id": "skill-008", "name": "Decimal Division", "topic": "Numbers & Operations", "grade": 4, "blooms_level": "application", "prerequisites": ["skill-004", "skill-006"]},
            {"id": "skill-009", "name": "Fraction Operations", "topic": "Numbers & Operations", "grade": 4, "blooms_level": "application", "prerequisites": ["skill-005"]},
            {"id": "skill-010", "name": "Advanced Decimal & Fraction Operations", "topic": "Numbers & Operations", "grade": 5, "blooms_level": "analysis", "prerequisites": ["skill-007", "skill-008", "skill-009"]},
        ]

        for skill_data in skills_data:
            skill = Skill(
                id=skill_data["id"],
                name=skill_data["name"],
                description=f"Master {skill_data['name']} skills",
                topic=skill_data["topic"],
                grade=skill_data["grade"],
                blooms_level=skill_data["blooms_level"],
                prerequisites=json.dumps(skill_data["prerequisites"]),
                average_time_to_master=14 + (len(skill_data["prerequisites"]) * 7)
            )
            db.add(skill)

        print("Seeding skill mastery records...")
        # Create skill mastery for each learner
        for learner in learners_data[:20]:  # First 20 learners
            for skill_data in skills_data:
                mastery_level = 40.0 + ((hash(learner.id + skill_data["id"]) % 60))
                skill_mastery = SkillMastery(
                    learner_id=learner.id,
                    skill_id=skill_data["id"],
                    mastery_level=mastery_level,
                    attempts=5 + (hash(learner.id) % 15),
                    last_practiced=datetime.utcnow() - timedelta(days=hash(learner.id) % 30),
                    trend=["improving", "stable", "declining"][hash(learner.id + skill_data["id"]) % 3]
                )
                db.add(skill_mastery)

        print("Seeding misconceptions...")
        misconceptions_data = [
            {
                "id": "MISC-001",
                "name": "Multiplication Always Increases",
                "description": "Belief that multiplying always results in a larger number",
                "category": "multiplication",
                "severity": "high",
                "total_affected": 23,
                "resolution_rate": 67.0,
                "average_time_to_resolve": 21,
                "weekly_occurrences": [{"week": i, "count": 22 - i, "affectedLearners": 17 - i} for i in range(1, 13)]
            },
            {
                "id": "MISC-002",
                "name": "Division Always Makes Smaller",
                "description": "Thinking division always results in smaller quotient",
                "category": "division",
                "severity": "critical",
                "total_affected": 28,
                "resolution_rate": 54.0,
                "average_time_to_resolve": 28,
                "weekly_occurrences": [{"week": i, "count": 12 + (i % 10), "affectedLearners": 10 + (i % 7)} for i in range(1, 13)]
            },
            {
                "id": "MISC-003",
                "name": "Longer Decimal = Larger Number",
                "description": "Comparing decimals by digit count rather than place value",
                "category": "decimals",
                "severity": "medium",
                "total_affected": 18,
                "resolution_rate": 72.0,
                "average_time_to_resolve": 18,
                "weekly_occurrences": [{"week": i, "count": 14 - i, "affectedLearners": 11 - i} for i in range(1, 13)]
            },
            {
                "id": "MISC-004",
                "name": "Equals Sign Means Answer",
                "description": "Viewing equals as command rather than relation",
                "category": "algebra",
                "severity": "low",
                "total_affected": 12,
                "resolution_rate": 83.0,
                "average_time_to_resolve": 14,
                "weekly_occurrences": [{"week": i, "count": 10 - i, "affectedLearners": 8 - i} for i in range(1, 13)]
            },
            {
                "id": "MISC-006",
                "name": "Larger Denominator = Larger Fraction",
                "description": "Thinking larger denominators mean larger fractions",
                "category": "fractions",
                "severity": "medium",
                "total_affected": 15,
                "resolution_rate": 78.0,
                "average_time_to_resolve": 16,
                "weekly_occurrences": [{"week": i, "count": 10 - (i // 2), "affectedLearners": 8 - (i // 2)} for i in range(1, 13)]
            },
        ]

        for misc_data in misconceptions_data:
            misconception = Misconception(
                id=misc_data["id"],
                name=misc_data["name"],
                description=misc_data["description"],
                category=misc_data["category"],
                severity=misc_data["severity"],
                total_affected=misc_data["total_affected"],
                resolution_rate=misc_data["resolution_rate"],
                average_time_to_resolve=misc_data["average_time_to_resolve"],
                prerequisite_skills=json.dumps(["skill-004", "skill-005"]),
                weekly_occurrences=json.dumps(misc_data["weekly_occurrences"])
            )
            db.add(misconception)

        print("Seeding questions...")
        questions_data = [
            {
                "id": "q-001",
                "type": "multiple_choice",
                "content": "What is 0.5 × 4?",
                "options": ["0.2", "2", "4.5", "20"],
                "correct_answer": "2",
                "explanation": "When multiplying 0.5 by 4, think of it as 'half of 4', which equals 2.",
                "marks": 2,
                "difficulty": 2,
                "blooms_level": "application",
                "skill_ids": ["skill-007"],
                "misconception_ids": ["MISC-001"],
                "representations": ["diagram", "manipulative"],
                "average_time": 85.0,
                "correct_rate": 45.0
            },
            {
                "id": "q-002",
                "type": "multiple_choice",
                "content": "Which decimal is larger: 0.7 or 0.23?",
                "options": ["0.7", "0.23", "They are equal", "Cannot determine"],
                "correct_answer": "0.7",
                "explanation": "0.7 is the same as 0.70, which is larger than 0.23.",
                "marks": 2,
                "difficulty": 2,
                "blooms_level": "comprehension",
                "skill_ids": ["skill-004"],
                "misconception_ids": ["MISC-003"],
                "representations": ["diagram"],
                "average_time": 45.0,
                "correct_rate": 62.0
            },
            {
                "id": "q-003",
                "type": "multiple_choice",
                "content": "Is this equation true or false? 8 = 3 + 5",
                "options": ["True", "False"],
                "correct_answer": "True",
                "explanation": "The equals sign means both sides have the same value.",
                "marks": 1,
                "difficulty": 2,
                "blooms_level": "comprehension",
                "skill_ids": ["skill-003"],
                "misconception_ids": ["MISC-004"],
                "representations": ["manipulative"],
                "average_time": 35.0,
                "correct_rate": 78.0
            },
            {
                "id": "q-004",
                "type": "numeric",
                "content": "Calculate: 4 ÷ 0.5 = ?",
                "options": None,
                "correct_answer": "8",
                "explanation": "Dividing by 0.5 is the same as asking 'how many halves are in 4?'",
                "marks": 3,
                "difficulty": 3,
                "blooms_level": "application",
                "skill_ids": ["skill-008"],
                "misconception_ids": ["MISC-002"],
                "representations": ["diagram", "manipulative"],
                "average_time": 92.0,
                "correct_rate": 38.0
            },
            {
                "id": "q-005",
                "type": "multiple_choice",
                "content": "Which fraction is larger: 1/4 or 1/8?",
                "options": ["1/4", "1/8", "They are equal"],
                "correct_answer": "1/4",
                "explanation": "1/4 means the whole is divided into 4 parts. Fewer parts means each part is larger.",
                "marks": 2,
                "difficulty": 2,
                "blooms_level": "comprehension",
                "skill_ids": ["skill-005"],
                "misconception_ids": ["MISC-006"],
                "representations": ["diagram", "manipulative"],
                "average_time": 48.0,
                "correct_rate": 71.0
            },
        ]

        for q_data in questions_data:
            question = Question(
                id=q_data["id"],
                type=q_data["type"],
                content=q_data["content"],
                options=json.dumps(q_data["options"]) if q_data["options"] else None,
                correct_answer=q_data["correct_answer"],
                explanation=q_data["explanation"],
                marks=q_data["marks"],
                difficulty=q_data["difficulty"],
                blooms_level=q_data["blooms_level"],
                skill_ids=json.dumps(q_data["skill_ids"]),
                misconception_ids=json.dumps(q_data["misconception_ids"]),
                representations=json.dumps(q_data["representations"]),
                average_time=q_data["average_time"],
                correct_rate=q_data["correct_rate"]
            )
            db.add(question)

        print("Seeding assessments...")
        assessment1 = Assessment(
            id="assess-week12-g4",
            title="Week 12 Diagnostic - Grade 4",
            description="Weekly diagnostic covering multiplication, division, and fractions",
            type="weekly_diagnostic",
            grade=4,
            duration=30,
            total_marks=10,
            topics=json.dumps(["Decimal Operations", "Fractions"]),
            created_by="teacher-001",
            created_at=datetime.utcnow() - timedelta(days=7),
            published=True
        )
        db.add(assessment1)

        # Link questions to assessment
        for idx, q_id in enumerate(["q-001", "q-002", "q-003", "q-004", "q-005"]):
            link = AssessmentQuestion(
                assessment_id="assess-week12-g4",
                question_id=q_id,
                order=idx + 1
            )
            db.add(link)

        print("Seeding interventions...")
        interventions_data = [
            {
                "id": "int-001",
                "name": "Decimal Multiplication Bootcamp",
                "type": "manipulative",
                "target_misconception": "Multiplication Always Increases",
                "target_skill": "Decimal Multiplication",
                "duration": 14,
                "learners_enrolled": 23,
                "learners_completed": 21,
                "before_metrics": {"averageScore": 42, "masteryLevel": 38, "confidenceScore": 35},
                "after_metrics": {"averageScore": 78, "masteryLevel": 72, "confidenceScore": 68},
                "improvement": {"scoreGain": 36, "masteryGain": 34, "confidenceGain": 33},
                "effectiveness": "excellent",
                "cost_per_learner": 15.5,
                "time_investment": 4.5,
                "teacher_feedback": "The hands-on manipulatives made a huge difference.",
                "learner_satisfaction": 4.6,
                "recommendation_score": 9.2
            },
            {
                "id": "int-002",
                "name": "Division by Fractions Remediation",
                "type": "one-on-one",
                "target_misconception": "Division Always Makes Smaller",
                "target_skill": "Division with Fractions",
                "duration": 21,
                "learners_enrolled": 15,
                "learners_completed": 14,
                "before_metrics": {"averageScore": 35, "masteryLevel": 32, "confidenceScore": 28},
                "after_metrics": {"averageScore": 65, "masteryLevel": 61, "confidenceScore": 58},
                "improvement": {"scoreGain": 30, "masteryGain": 29, "confidenceGain": 30},
                "effectiveness": "good",
                "cost_per_learner": 45.0,
                "time_investment": 8.0,
                "teacher_feedback": "One-on-one sessions allowed me to address individual misconceptions.",
                "learner_satisfaction": 4.3,
                "recommendation_score": 7.8
            },
        ]

        for int_data in interventions_data:
            intervention = Intervention(
                id=int_data["id"],
                name=int_data["name"],
                type=int_data["type"],
                target_misconception=int_data["target_misconception"],
                target_skill=int_data["target_skill"],
                created=datetime.utcnow() - timedelta(days=30),
                duration=int_data["duration"],
                learners_enrolled=int_data["learners_enrolled"],
                learners_completed=int_data["learners_completed"],
                before_metrics=json.dumps(int_data["before_metrics"]),
                after_metrics=json.dumps(int_data["after_metrics"]),
                improvement=json.dumps(int_data["improvement"]),
                effectiveness=int_data["effectiveness"],
                cost_per_learner=int_data["cost_per_learner"],
                time_investment=int_data["time_investment"],
                teacher_feedback=int_data["teacher_feedback"],
                learner_satisfaction=int_data["learner_satisfaction"],
                recommendation_score=int_data["recommendation_score"]
            )
            db.add(intervention)

        print("Seeding learning pathway...")
        pathway = LearningPathway(
            id="pathway-g4-numbers",
            name="Grade 4 - Numbers & Operations Mastery",
            description="Complete pathway from basic number recognition through advanced decimal and fraction operations",
            target_grade=4,
            skill_ids=json.dumps([f"skill-{i:03d}" for i in range(1, 11)]),
            completion_rate=45.0,
            estimated_duration=16
        )
        db.add(pathway)

        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
