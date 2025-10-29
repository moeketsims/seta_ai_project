from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, JSON, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.database import Base

# Enums
class UserRole(str, enum.Enum):
    TEACHER = "teacher"
    LEARNER = "learner"
    ADMIN = "admin"

class AssessmentType(str, enum.Enum):
    WEEKLY_DIAGNOSTIC = "weekly_diagnostic"
    FORMATIVE = "formative"
    SUMMATIVE = "summative"
    DIAGNOSTIC = "diagnostic"

class QuestionType(str, enum.Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    NUMERIC = "numeric"
    WORD_PROBLEM = "word_problem"
    FILL_BLANK = "fill_blank"

class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class TrendDirection(str, enum.Enum):
    IMPROVING = "improving"
    STABLE = "stable"
    DECLINING = "declining"

# Models
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    classes_taught = relationship("Class", back_populates="teacher")
    learner_profile = relationship("Learner", back_populates="user", uselist=False)

class Class(Base):
    __tablename__ = "classes"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    grade = Column(Integer, nullable=False)
    teacher_id = Column(String, ForeignKey("users.id"))
    school_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    teacher = relationship("User", back_populates="classes_taught")
    learners = relationship("Learner", back_populates="class_obj")

class Learner(Base):
    __tablename__ = "learners"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    class_id = Column(String, ForeignKey("classes.id"))
    grade = Column(Integer, nullable=False)
    current_level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    risk_score = Column(Float, default=0.0)
    risk_level = Column(SQLEnum(RiskLevel), default=RiskLevel.LOW)
    trend_direction = Column(SQLEnum(TrendDirection), default=TrendDirection.STABLE)
    engagement_score = Column(Float, default=0.0)
    attendance_rate = Column(Float, default=100.0)
    completion_rate = Column(Float, default=100.0)
    time_on_task = Column(Float, default=0.0)
    last_active = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="learner_profile")
    class_obj = relationship("Class", back_populates="learners")
    skill_mastery = relationship("SkillMastery", back_populates="learner")
    assessment_results = relationship("AssessmentResult", back_populates="learner")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    topic = Column(String)
    grade = Column(Integer)
    blooms_level = Column(String)
    prerequisites = Column(JSON, default=[])  # List of prerequisite skill IDs
    average_time_to_master = Column(Integer, default=14)  # days

    # Relationships
    mastery_records = relationship("SkillMastery", back_populates="skill")

class SkillMastery(Base):
    __tablename__ = "skill_mastery"

    id = Column(Integer, primary_key=True, index=True)
    learner_id = Column(String, ForeignKey("learners.id"))
    skill_id = Column(String, ForeignKey("skills.id"))
    mastery_level = Column(Float, default=0.0)  # 0-100
    attempts = Column(Integer, default=0)
    last_practiced = Column(DateTime, default=datetime.utcnow)
    trend = Column(SQLEnum(TrendDirection), default=TrendDirection.STABLE)

    # Relationships
    learner = relationship("Learner", back_populates="skill_mastery")
    skill = relationship("Skill", back_populates="mastery_records")

class Misconception(Base):
    __tablename__ = "misconceptions"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)  # multiplication, division, fractions, etc.
    severity = Column(SQLEnum(RiskLevel))
    total_affected = Column(Integer, default=0)
    resolution_rate = Column(Float, default=0.0)
    average_time_to_resolve = Column(Integer, default=21)  # days
    prerequisite_skills = Column(JSON, default=[])
    weekly_occurrences = Column(JSON, default=[])  # [{week, count, affectedLearners}]

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    type = Column(SQLEnum(AssessmentType), nullable=False)
    grade = Column(Integer, nullable=False)
    duration = Column(Integer)  # minutes
    total_marks = Column(Integer)
    topics = Column(JSON, default=[])
    created_by = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    published = Column(Boolean, default=False)

    # Relationships
    questions = relationship("Question", secondary="assessment_questions", back_populates="assessments")
    results = relationship("AssessmentResult", back_populates="assessment")

class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, index=True)
    type = Column(SQLEnum(QuestionType), nullable=False)
    content = Column(Text, nullable=False)
    options = Column(JSON)  # For multiple choice
    correct_answer = Column(String)
    explanation = Column(Text)
    marks = Column(Integer, default=1)
    difficulty = Column(Integer, default=3)  # 1-5
    blooms_level = Column(String)
    skill_ids = Column(JSON, default=[])
    misconception_ids = Column(JSON, default=[])
    representations = Column(JSON, default=[])  # ['diagram', 'manipulative', etc.]
    average_time = Column(Float, default=60.0)  # seconds
    correct_rate = Column(Float, default=0.0)  # percentage

    # Relationships
    assessments = relationship("Assessment", secondary="assessment_questions", back_populates="questions")

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(String, ForeignKey("assessments.id"))
    question_id = Column(String, ForeignKey("questions.id"))
    order = Column(Integer)

class AssessmentResult(Base):
    __tablename__ = "assessment_results"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(String, ForeignKey("assessments.id"))
    learner_id = Column(String, ForeignKey("learners.id"))
    score = Column(Float)
    total_marks = Column(Integer)
    percentage = Column(Float)
    time_taken = Column(Integer)  # seconds
    answers = Column(JSON)  # {questionId: answer}
    completed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    assessment = relationship("Assessment", back_populates="results")
    learner = relationship("Learner", back_populates="assessment_results")

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String)  # video, practice, manipulative, one-on-one, etc.
    target_misconception = Column(String)
    target_skill = Column(String)
    created = Column(DateTime, default=datetime.utcnow)
    duration = Column(Integer)  # days
    learners_enrolled = Column(Integer, default=0)
    learners_completed = Column(Integer, default=0)
    before_metrics = Column(JSON)  # {averageScore, masteryLevel, confidenceScore}
    after_metrics = Column(JSON)
    improvement = Column(JSON)  # {scoreGain, masteryGain, confidenceGain}
    effectiveness = Column(String)  # excellent, good, moderate, poor
    cost_per_learner = Column(Float, default=0.0)
    time_investment = Column(Float, default=0.0)  # hours
    teacher_feedback = Column(Text)
    learner_satisfaction = Column(Float, default=0.0)  # 1-5
    recommendation_score = Column(Float, default=0.0)  # 1-10

class InterventionQueue(Base):
    """
    Teacher's intervention queue - tracks individual learner misconceptions
    that need teacher attention.
    """
    __tablename__ = "intervention_queue"

    id = Column(Integer, primary_key=True, index=True)
    learner_id = Column(String, ForeignKey("learners.id"), nullable=False)
    teacher_id = Column(String, ForeignKey("users.id"), nullable=False)
    misconception_id = Column(String, ForeignKey("misconceptions.id"))
    assessment_result_id = Column(Integer, ForeignKey("assessment_results.id"))

    # Detection metadata
    detected_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    severity = Column(SQLEnum(RiskLevel), default=RiskLevel.MEDIUM)
    confidence = Column(Float, default=0.85)  # AI confidence score (0-1)

    # Intervention status
    status = Column(String, default='pending')  # pending, in_progress, resolved
    assigned_at = Column(DateTime)
    started_at = Column(DateTime)
    resolved_at = Column(DateTime)

    # AI-generated content
    misconception_name = Column(String)  # Human-readable name
    remediation_strategy = Column(Text)  # AI-generated intervention plan
    estimated_time_weeks = Column(Integer, default=3)  # From taxonomy
    prerequisite_skills = Column(JSON, default=[])  # Skills to address first

    # Teacher notes
    notes = Column(Text)
    effectiveness_rating = Column(Integer)  # 1-5 after resolution

    # Relationships
    learner = relationship("Learner")
    teacher = relationship("User")
    assessment_result = relationship("AssessmentResult")
    misconception = relationship("Misconception")

class LearningPathway(Base):
    __tablename__ = "learning_pathways"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    target_grade = Column(Integer)
    skill_ids = Column(JSON, default=[])  # Ordered list of skill IDs
    completion_rate = Column(Float, default=0.0)
    estimated_duration = Column(Integer, default=16)  # weeks

# ============================================================================
# AI-Generated Questions System
# ============================================================================

class AIGeneratedQuestion(Base):
    """AI-generated CAPS-compliant mathematics questions."""
    __tablename__ = "ai_generated_questions"

    id = Column(String, primary_key=True, index=True)
    item_id = Column(String, unique=True, nullable=False, index=True)
    stem = Column(Text, nullable=False)
    correct_answer_option = Column(String, nullable=False)
    correct_answer_value = Column(String, nullable=False)
    correct_answer_reasoning = Column(Text)
    distractors = Column(Text, nullable=False)  # JSON string
    grade_level = Column(Integer, default=4)
    caps_topic = Column(String, default="Numbers, Operations & Relationships")
    caps_objective = Column(String)
    difficulty_level = Column(String, nullable=False)
    prerequisite_skills = Column(Text)  # JSON string
    estimated_time_seconds = Column(Integer, default=45)
    generated_at = Column(DateTime, default=datetime.utcnow)
    generated_by = Column(String, default="openai-gpt4")
    validated = Column(Boolean, default=False)
    validation_notes = Column(Text)
    usage_count = Column(Integer, default=0)
    success_rate = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AIGeneratedMisconception(Base):
    """Misconceptions detected through AI-generated question distractors."""
    __tablename__ = "ai_generated_misconceptions"

    id = Column(String, primary_key=True, index=True)
    misconception_tag = Column(String, unique=True, nullable=False, index=True)
    question_id = Column(String, ForeignKey("ai_generated_questions.id", ondelete="CASCADE"), nullable=False)
    description = Column(Text, nullable=False)
    distractor_option = Column(String, nullable=False)
    rationale = Column(Text, nullable=False)
    confidence_weight = Column(Float, default=0.5)
    remediation_strategy = Column(Text)
    grade_level = Column(Integer, default=4)
    caps_topic = Column(String, default="Numbers, Operations & Relationships")
    created_at = Column(DateTime, default=datetime.utcnow)


class AdaptiveDecisionTree(Base):
    """Decision tree for adaptive question routing."""
    __tablename__ = "adaptive_decision_tree"

    id = Column(Integer, primary_key=True, autoincrement=True)
    form_id = Column(String, nullable=False, index=True)
    from_node_id = Column(String, nullable=False, index=True)
    option_selected = Column(String, nullable=False)
    to_node_id = Column(String, nullable=True)  # NULL = terminal node
    misconception_tag = Column(String, nullable=True)
    confidence_delta = Column(Float, default=0.0)
    difficulty_progression = Column(String, nullable=False)  # increase, maintain, decrease, terminal
    created_at = Column(DateTime, default=datetime.utcnow)
