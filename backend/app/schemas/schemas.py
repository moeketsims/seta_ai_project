from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class UserRole(str, Enum):
    TEACHER = "teacher"
    LEARNER = "learner"
    ADMIN = "admin"

class AssessmentType(str, Enum):
    WEEKLY_DIAGNOSTIC = "weekly_diagnostic"
    FORMATIVE = "formative"
    SUMMATIVE = "summative"
    DIAGNOSTIC = "diagnostic"

class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    NUMERIC = "numeric"
    WORD_PROBLEM = "word_problem"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class TrendDirection(str, Enum):
    IMPROVING = "improving"
    STABLE = "stable"
    DECLINING = "declining"

# Base Schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class LearnerBase(BaseModel):
    grade: int
    current_level: Optional[int] = 1
    xp: Optional[int] = 0

class Learner(LearnerBase):
    id: str
    user_id: str
    class_id: Optional[str]
    streak_days: int
    risk_score: float
    risk_level: RiskLevel
    trend_direction: TrendDirection
    engagement_score: float
    attendance_rate: float
    completion_rate: float
    time_on_task: float
    last_active: datetime

    class Config:
        from_attributes = True

class SkillBase(BaseModel):
    name: str
    description: Optional[str]
    topic: Optional[str]
    grade: Optional[int]
    blooms_level: Optional[str]

class Skill(SkillBase):
    id: str
    prerequisites: List[str]
    average_time_to_master: int

    class Config:
        from_attributes = True

class SkillMasteryBase(BaseModel):
    mastery_level: float

class SkillMastery(SkillMasteryBase):
    id: int
    learner_id: str
    skill_id: str
    attempts: int
    last_practiced: datetime
    trend: TrendDirection

    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    type: QuestionType
    content: str
    correct_answer: str
    explanation: str
    marks: int
    difficulty: int
    blooms_level: str

class Question(QuestionBase):
    id: str
    options: Optional[List[str]]
    skill_ids: List[str]
    misconception_ids: List[str]
    representations: List[str]
    average_time: float
    correct_rate: float

    class Config:
        from_attributes = True
        populate_by_name = True  # Allow using both snake_case and camelCase

    @field_validator('options', mode='before')
    @classmethod
    def parse_options(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            import json
            return json.loads(v)
        return v

    @field_validator('skill_ids', mode='before')
    @classmethod
    def parse_skill_ids(cls, v):
        if isinstance(v, str):
            import json
            return json.loads(v)
        return v

    @field_validator('misconception_ids', mode='before')
    @classmethod
    def parse_misconception_ids(cls, v):
        if isinstance(v, str):
            import json
            return json.loads(v)
        return v

    @field_validator('representations', mode='before')
    @classmethod
    def parse_representations(cls, v):
        if isinstance(v, str):
            import json
            return json.loads(v)
        return v

class QuestionAnalysisSchema(BaseModel):
    questionId: str
    content: str
    correctRate: float
    averageTime: float
    misconceptionTriggered: Optional[Dict[str, Any]]
    skillsTested: List[str]
    commonWrongAnswers: List[Dict[str, Any]]

class AssessmentBase(BaseModel):
    title: str
    description: str
    type: AssessmentType
    grade: int
    duration: int
    total_marks: int

class Assessment(AssessmentBase):
    id: str
    topics: List[str]
    created_by: str
    created_at: datetime
    published: bool

    class Config:
        from_attributes = True

    @field_validator('topics', mode='before')
    @classmethod
    def parse_topics(cls, v):
        if isinstance(v, str):
            import json
            return json.loads(v)
        return v

class AssessmentWithQuestions(Assessment):
    questions: List[Question]

class WeeklyDiagnosticSchema(BaseModel):
    assessmentId: str
    title: str
    weekNumber: int
    grade: int
    completionRate: float
    averageScore: float
    questions: List[QuestionAnalysisSchema]
    participantCount: int
    dateCompleted: datetime

class MisconceptionBase(BaseModel):
    name: str
    description: str
    category: str
    severity: RiskLevel

class Misconception(MisconceptionBase):
    id: str
    total_affected: int
    resolution_rate: float
    average_time_to_resolve: int
    prerequisite_skills: List[str]
    weekly_occurrences: List[Dict[str, Any]]

    class Config:
        from_attributes = True

class MisconceptionTrendSchema(BaseModel):
    misconceptionId: str
    name: str
    description: str
    category: str
    weeklyOccurrences: List[Dict[str, Any]]
    totalAffected: int
    interventionsCreated: int
    resolutionRate: float
    averageTimeToResolve: int
    severity: str
    prerequisiteSkills: List[str]
    recommendedInterventions: List[Dict[str, Any]]

class InterventionBase(BaseModel):
    name: str
    type: str
    target_misconception: str
    target_skill: str

class Intervention(InterventionBase):
    id: str
    created: datetime
    duration: int
    learners_enrolled: int
    learners_completed: int
    before_metrics: Dict[str, Any]
    after_metrics: Dict[str, Any]
    improvement: Dict[str, Any]
    effectiveness: str
    cost_per_learner: float
    time_investment: float
    teacher_feedback: Optional[str]
    learner_satisfaction: float
    recommendation_score: float

    class Config:
        from_attributes = True

class InterventionDataSchema(BaseModel):
    interventionId: str
    name: str
    type: str
    targetMisconception: str
    targetSkill: str
    created: datetime
    duration: int
    learnersEnrolled: int
    learnersCompleted: int
    beforeMetrics: Dict[str, Any]
    afterMetrics: Dict[str, Any]
    improvement: Dict[str, Any]
    effectiveness: str
    costPerLearner: float
    timeInvestment: float
    teacherFeedback: Optional[str]
    learnerSatisfaction: float
    recommendationScore: float

class SkillNodeSchema(BaseModel):
    skillId: str
    name: str
    topic: str
    masteryLevel: float
    prerequisites: List[str]
    learnersAtLevel: Dict[str, int]
    averageTimeToMaster: int
    commonBlockers: List[str]
    nextSkills: List[str]

class LearningPathwaySchema(BaseModel):
    pathwayId: str
    name: str
    description: str
    targetGrade: int
    skills: List[SkillNodeSchema]
    completionRate: float
    estimatedDuration: int

class AtRiskLearnerSchema(BaseModel):
    learnerId: str
    name: str
    grade: int
    riskScore: float
    riskLevel: str
    trendDirection: str
    riskFactors: List[Dict[str, Any]]
    predictedOutcome: Dict[str, Any]
    recommendedActions: List[Dict[str, Any]]
    recentPerformance: List[Dict[str, Any]]
    engagementMetrics: Dict[str, Any]

class AnalyticsMetricsSchema(BaseModel):
    dailyActiveUsers: int
    weeklyActiveUsers: int
    averageSessionDuration: float
    completionRate: float

class PerformanceTrendSchema(BaseModel):
    labels: List[str]
    datasets: List[Dict[str, Any]]

class ClassPerformanceSchema(BaseModel):
    classId: str
    className: str
    averageScore: float
    learnersCount: int
    onTrack: int
    needsSupport: int
    atRisk: int
