"""
AI API Endpoints
Provides endpoints for AI-powered features including health checks,
answer evaluation, misconception detection, and content generation.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime

from app.services.ai_service import get_ai_service, AIServiceError
from app.services.answer_evaluator import get_answer_evaluator
from app.services.misconception_detector import get_misconception_detector
from app.services.pathway_builder import get_pathway_builder
from app.services.diagnostic_analyzer import get_diagnostic_analyzer

router = APIRouter()


# ============================================================================
# Response Models
# ============================================================================

class AIHealthResponse(BaseModel):
    """Response model for AI health check"""
    status: str
    model: str
    api_accessible: bool
    test_cost: Optional[float] = None
    error: Optional[str] = None
    timestamp: str


class AIUsageStats(BaseModel):
    """AI usage statistics"""
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class AIResponse(BaseModel):
    """Base response model for AI operations"""
    success: bool
    data: Optional[Dict[str, Any]] = None
    usage: Optional[AIUsageStats] = None
    cost: Optional[float] = None
    model: str
    response_time: Optional[float] = None
    timestamp: str
    error: Optional[str] = None


class NarrationMetric(BaseModel):
    """Individual metric surfaced to the LLM."""

    label: str
    value: str
    emphasis: Optional[Literal["positive", "negative", "neutral"]] = None
    context: Optional[str] = None


class NarrationCallout(BaseModel):
    """Optional callout or annotation for the widget."""

    title: str
    detail: str


class GenerateNarrationRequest(BaseModel):
    """Payload sent from the dashboard widget to request narration copy."""

    model_config = ConfigDict(populate_by_name=True)

    widget_id: str = Field(..., alias="widgetId")
    widget_label: str = Field(..., alias="widgetLabel")
    audience: Literal["teacher", "leader", "analyst"]
    timeframe: Optional[str] = None
    focus: Optional[str] = None
    summary: str
    metrics: List[NarrationMetric]
    callouts: Optional[List[NarrationCallout]] = None
    recommendations: Optional[List[str]] = None
    data_timestamp: Optional[str] = Field(None, alias="dataTimestamp")


class NarrationResponse(BaseModel):
    """LLM generated narration transcript for a dashboard widget."""

    transcript: str
    usage: Optional[AIUsageStats] = None
    cost: Optional[float] = None
    model: str
    timestamp: str


class NarrationChatTurn(BaseModel):
    """One exchange in the narration follow-up chat."""

    role: Literal["user", "assistant"]
    content: str


class NarrationChatRequest(BaseModel):
    """Follow-up question anchored to a narration payload."""

    payload: GenerateNarrationRequest
    question: str
    history: List[NarrationChatTurn] = Field(default_factory=list)


class NarrationChatResponse(BaseModel):
    """AI response to a follow-up narration question."""

    answer: str
    usage: Optional[AIUsageStats] = None
    cost: Optional[float] = None
    model: str
    timestamp: str


def _build_narration_prompt(request: GenerateNarrationRequest) -> str:
    """Convert the structured dashboard payload into a natural-language prompt."""

    lines: List[str] = []
    lines.append(f"Widget: {request.widget_label}")
    lines.append(f"Audience: {request.audience}")
    if request.timeframe:
        lines.append(f"Timeframe: {request.timeframe}")
    if request.focus:
        lines.append(f"Focus: {request.focus}")
    if request.data_timestamp:
        lines.append(f"Data timestamp: {request.data_timestamp}")

    lines.append("Summary: " + request.summary)

    if request.metrics:
        lines.append("Metrics:")
        for metric in request.metrics:
            detail = f"- {metric.label}: {metric.value}"
            if metric.context:
                detail += f" ({metric.context})"
            if metric.emphasis:
                detail += f" | emphasis: {metric.emphasis}"
            lines.append(detail)

    if request.callouts:
        lines.append("Callouts:")
        for callout in request.callouts:
            lines.append(f"- {callout.title}: {callout.detail}")

    if request.recommendations:
        lines.append("Proposed actions:")
        for rec in request.recommendations:
            lines.append(f"- {rec}")

    return "\n".join(lines)


def _build_followup_messages(
    ai_service,
    payload: GenerateNarrationRequest,
    question: str,
    history: List[NarrationChatTurn],
) -> List[Dict[str, str]]:
    """Compose chat completion messages for a follow-up narration question."""

    context_prompt = _build_narration_prompt(payload)

    messages: List[Dict[str, str]] = [
        ai_service.create_system_message(
            "You are an instructional coach helping teachers interpret dashboard data. "
            "Answer concisely (≤120 words), reference only provided metrics, and end with 'Next Step:' guidance."
        ),
        ai_service.create_user_message(
            "Dashboard context:\n" + context_prompt
        ),
        ai_service.create_assistant_message(
            "Understood. I will answer questions about this dashboard context."
        ),
    ]

    for turn in history:
        if turn.role == "assistant":
            messages.append(ai_service.create_assistant_message(turn.content))
        else:
            messages.append(ai_service.create_user_message(turn.content))

    messages.append(ai_service.create_user_message(question))
    return messages


@router.post("/dashboard-narration", response_model=NarrationResponse)
async def generate_dashboard_narration(request: GenerateNarrationRequest):
    """Generate a teacher-friendly explanation for a dashboard widget."""

    try:
        ai_service = get_ai_service()

        system_prompt = (
            "You are an instructional coach who explains analytics to South African teachers. "
            "Keep language clear, concise, and action oriented. Reference only the numbers provided. "
            "If data indicates concern, suggest classroom moves. Use two short paragraphs; include a final line titled 'Next Step:' "
            "with one actionable suggestion."  # ensures consistent structure
        )

        user_prompt = _build_narration_prompt(request)

        completion = ai_service.get_completion(
            messages=[
                ai_service.create_system_message(system_prompt),
                ai_service.create_user_message(user_prompt),
            ],
            max_tokens=400,
            temperature=0.6,
        )

        transcript = completion["content"].strip()

        return NarrationResponse(
            transcript=transcript,
            usage=AIUsageStats(**completion["usage"]),
            cost=completion["cost"],
            model=completion["model"],
            timestamp=completion["timestamp"],
        )

    except AIServiceError as exc:
        raise HTTPException(status_code=503, detail=f"AI service error: {exc}")
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=500, detail=f"Failed to generate narration: {exc}")


@router.post("/dashboard-narration/chat", response_model=NarrationChatResponse)
async def continue_dashboard_narration(request: NarrationChatRequest):
    """Answer a follow-up question about a dashboard widget."""

    try:
        ai_service = get_ai_service()
        messages = _build_followup_messages(
            ai_service=ai_service,
            payload=request.payload,
            question=request.question,
            history=request.history,
        )

        completion = ai_service.get_completion(
            messages=messages,
            max_tokens=380,
            temperature=0.65,
        )

        answer = completion["content"].strip()

        return NarrationChatResponse(
            answer=answer,
            usage=AIUsageStats(**completion["usage"]),
            cost=completion["cost"],
            model=completion["model"],
            timestamp=completion["timestamp"],
        )

    except AIServiceError as exc:
        raise HTTPException(status_code=503, detail=f"AI service error: {exc}")
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=500, detail=f"Failed to answer question: {exc}")


# ============================================================================
# Health Check Endpoints
# ============================================================================

@router.get("/health", response_model=AIHealthResponse)
async def check_ai_health():
    """
    Check OpenAI API health and accessibility.
    This endpoint performs a minimal test request to verify the API is working.

    Returns:
        AIHealthResponse with status information and test cost
    """
    try:
        ai_service = get_ai_service()
        health_status = ai_service.health_check()
        return AIHealthResponse(**health_status)

    except Exception as e:
        return AIHealthResponse(
            status="error",
            model="unknown",
            api_accessible=False,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/status")
async def get_ai_status():
    """
    Get current AI service configuration and status.
    Does not make external API calls.

    Returns:
        Configuration and status information
    """
    try:
        ai_service = get_ai_service()
        return {
            "status": "initialized",
            "model": ai_service.model,
            "max_tokens": ai_service.max_tokens,
            "temperature": ai_service.temperature,
            "pricing": ai_service.pricing.get(ai_service.model, {}),
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get AI status: {str(e)}"
        )


@router.post("/test")
async def test_ai_completion():
    """
    Test endpoint to verify AI completion works.
    Sends a simple test message and returns the response.

    Returns:
        AIResponse with test completion details
    """
    try:
        ai_service = get_ai_service()

        messages = [
            ai_service.create_system_message(
                "You are a helpful mathematics teacher assistant for South African CAPS curriculum."
            ),
            ai_service.create_user_message(
                "Respond with a single sentence confirming you are ready to assist with mathematics education."
            )
        ]

        result = ai_service.get_completion(messages=messages, max_tokens=100)

        return AIResponse(
            success=True,
            data={"message": result["content"]},
            usage=AIUsageStats(**result["usage"]),
            cost=result["cost"],
            model=result["model"],
            response_time=result["response_time"],
            timestamp=result["timestamp"]
        )

    except AIServiceError as e:
        raise HTTPException(
            status_code=503,
            detail=f"AI service error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )


# ============================================================================
# Answer Evaluation Endpoints (Phase 1)
# ============================================================================

class EvaluateAnswerRequest(BaseModel):
    """Request model for answer evaluation"""
    question_id: Optional[str] = None
    question_content: str = Field(..., description="The question text")
    correct_answer: str = Field(..., description="The correct answer(s)")
    learner_answer: str = Field(..., description="The learner's submitted answer")
    question_type: str = Field(default="numeric", description="Type of question")
    max_score: int = Field(default=10, ge=1, le=100, description="Maximum possible score")
    grade: Optional[int] = Field(None, ge=1, le=12, description="Learner's grade level")
    show_work: Optional[str] = Field(None, description="Work shown by learner")
    learner_id: Optional[str] = None


class EvaluationResponse(BaseModel):
    """Response model for answer evaluation"""
    question_id: Optional[str] = None
    learner_id: Optional[str] = None
    is_correct: bool
    score: int
    max_score: int
    percentage: float
    feedback: str
    partial_credit: bool = False
    equivalent_answer: bool = False
    error_type: Optional[str] = None
    methodology_correct: Optional[bool] = None
    strengths: Optional[List[str]] = None
    improvements: Optional[List[str]] = None
    misconception_detected: Optional[str] = None
    requires_teacher_review: bool = False
    ai_evaluation: Dict[str, Any]
    timestamp: str


@router.post("/evaluate-answer", response_model=EvaluationResponse)
async def evaluate_answer(request: EvaluateAnswerRequest):
    """
    Evaluate a learner's answer using AI.

    This endpoint provides intelligent grading with:
    - Partial credit for partially correct answers
    - Recognition of equivalent answer forms
    - Detailed, encouraging feedback
    - Misconception detection
    - Methodology evaluation for word problems

    Args:
        request: EvaluateAnswerRequest with question and answer details

    Returns:
        EvaluationResponse with score, feedback, and analysis
    """
    try:
        evaluator = get_answer_evaluator()

        result = evaluator.evaluate_answer(
            question_content=request.question_content,
            correct_answer=request.correct_answer,
            learner_answer=request.learner_answer,
            question_type=request.question_type,
            max_score=request.max_score,
            grade=request.grade,
            show_work=request.show_work
        )

        return EvaluationResponse(
            question_id=request.question_id,
            learner_id=request.learner_id,
            timestamp=datetime.utcnow().isoformat(),
            **result
        )

    except Exception as e:
        logger.error(f"Error evaluating answer: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to evaluate answer: {str(e)}"
        )


# ============================================================================
# Misconception Detection Endpoints (Phase 2)
# ============================================================================

class DetectMisconceptionRequest(BaseModel):
    """Request model for misconception detection"""
    question_id: Optional[str] = None
    question_content: str = Field(..., description="The question text")
    correct_answer: str = Field(..., description="The correct answer")
    learner_answer: str = Field(..., description="The learner's incorrect answer")
    question_type: str = Field(default="numeric", description="Type of question")
    grade: Optional[int] = Field(None, ge=1, le=12, description="Learner's grade level")
    show_work: Optional[str] = Field(None, description="Work shown by learner")
    topic: Optional[str] = Field(None, description="Mathematics topic/strand")
    learner_id: Optional[str] = None


class MisconceptionResponse(BaseModel):
    """Response model for misconception detection"""
    detected: bool
    misconception_id: Optional[str] = None
    misconception: Optional[Dict[str, Any]] = None
    confidence: float
    in_taxonomy: bool
    remediation: Optional[Dict[str, Any]] = None
    ai_analysis: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
    error: Optional[str] = None
    timestamp: str


class ClassPatternRequest(BaseModel):
    """Request model for class-wide misconception pattern detection"""
    learner_errors: List[Dict[str, Any]] = Field(..., description="List of learner errors to analyze")
    grade: int = Field(..., ge=1, le=12, description="Class grade level")


class ClassPatternResponse(BaseModel):
    """Response model for class misconception patterns"""
    total_errors_analyzed: int
    unique_misconceptions: int
    top_misconceptions: List[Dict[str, Any]]
    grade: int
    requires_intervention: bool
    timestamp: str


@router.post("/detect-misconception", response_model=MisconceptionResponse)
async def detect_misconception(request: DetectMisconceptionRequest):
    """
    Detect mathematical misconceptions from wrong answers.

    This endpoint analyzes learner errors to identify underlying conceptual
    misunderstandings. It:
    - Uses AI to analyze the error pattern
    - Maps to CAPS misconception taxonomy (20+ documented misconceptions)
    - Provides targeted remediation strategies
    - Identifies prerequisite skill gaps

    Particularly useful for:
    - Understanding why learners made specific errors
    - Planning targeted interventions
    - Tracking misconception prevalence across classes
    - Personalizing learning pathways

    Args:
        request: DetectMisconceptionRequest with question and answer details

    Returns:
        MisconceptionResponse with detected misconception and remediation
    """
    try:
        detector = get_misconception_detector()

        result = detector.detect_from_answer(
            question_content=request.question_content,
            correct_answer=request.correct_answer,
            learner_answer=request.learner_answer,
            question_type=request.question_type,
            grade=request.grade,
            show_work=request.show_work,
            topic=request.topic
        )

        return MisconceptionResponse(
            timestamp=datetime.utcnow().isoformat(),
            **result
        )

    except Exception as e:
        logger.error(f"Error detecting misconception: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to detect misconception: {str(e)}"
        )


@router.post("/class-misconceptions", response_model=ClassPatternResponse)
async def analyze_class_misconceptions(request: ClassPatternRequest):
    """
    Analyze class-wide misconception patterns from multiple learner errors.

    This endpoint identifies common misconceptions affecting a class:
    - Analyzes multiple learner errors in batch
    - Finds patterns across the class
    - Ranks misconceptions by frequency
    - Flags high-priority interventions needed

    Use this to:
    - Plan whole-class interventions
    - Identify systemic teaching gaps
    - Prioritize remediation efforts
    - Track progress over time

    Args:
        request: ClassPatternRequest with learner errors and grade

    Returns:
        ClassPatternResponse with top misconceptions and statistics
    """
    try:
        detector = get_misconception_detector()

        result = detector.detect_class_patterns(
            learner_errors=request.learner_errors,
            grade=request.grade
        )

        return ClassPatternResponse(
            timestamp=datetime.utcnow().isoformat(),
            **result
        )

    except Exception as e:
        logger.error(f"Error analyzing class patterns: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze class patterns: {str(e)}"
        )


# ============================================================================
# Learning Pathway Generation (Phase 3)
# ============================================================================

class CreatePathwayRequest(BaseModel):
    """Request model for pathway creation"""
    learner_id: str
    current_skills: List[str] = Field(default_factory=list)
    target_skills: List[str]
    grade: int = Field(..., ge=1, le=12)
    diagnostic_results: Optional[Dict[str, Any]] = None
    misconceptions: Optional[List[Dict[str, Any]]] = None
    timeframe_weeks: int = Field(default=8, ge=1, le=52)
    learning_style: Optional[str] = None


@router.post("/create-pathway")
async def create_learning_pathway(request: CreatePathwayRequest):
    """Generate personalized learning pathway for a learner"""
    try:
        builder = get_pathway_builder()

        pathway = builder.create_pathway(
            learner_id=request.learner_id,
            current_skills=request.current_skills,
            target_skills=request.target_skills,
            grade=request.grade,
            diagnostic_results=request.diagnostic_results,
            misconceptions=request.misconceptions,
            timeframe_weeks=request.timeframe_weeks,
            learning_style=request.learning_style
        )

        return pathway

    except Exception as e:
        logger.error(f"Error creating pathway: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Diagnostic Intelligence Endpoints (Phase 4)
# ============================================================================

class DiagnosticRequest(BaseModel):
    """Request model for diagnostic analysis"""
    question_content: str
    correct_answer: str
    learner_answer: str
    question_type: str
    grade: int
    topic: str
    show_work: Optional[str] = None
    learner_history: Optional[List[Dict[str, Any]]] = None


class ClassPatternRequest(BaseModel):
    """Request model for class pattern analysis"""
    class_id: str
    assessment_results: List[Dict[str, Any]]
    timeframe_days: int = 7


class InterventionPredictionRequest(BaseModel):
    """Request model for intervention success prediction"""
    learner_profile: Dict[str, Any]
    intervention_type: str
    misconception_id: str
    historical_data: Optional[List[Dict[str, Any]]] = None


class DashboardInsightsRequest(BaseModel):
    """Request model for dashboard insights"""
    dashboard_data: Dict[str, Any]


@router.post("/diagnose-error")
async def diagnose_learner_error(request: DiagnosticRequest):
    """
    Deep diagnostic analysis of a learner's error.

    Returns comprehensive analysis including:
    - Root cause hypothesis
    - Misconception identification
    - Prerequisite skill gaps
    - Personalized intervention strategies
    - Success predictions

    **This is the core AI feature that scales a diagnostic teacher.**
    """
    try:
        analyzer = get_diagnostic_analyzer()

        diagnosis = analyzer.diagnose_learner_error(
            question_content=request.question_content,
            correct_answer=request.correct_answer,
            learner_answer=request.learner_answer,
            question_type=request.question_type,
            grade=request.grade,
            topic=request.topic,
            show_work=request.show_work,
            learner_history=request.learner_history
        )

        return diagnosis

    except Exception as e:
        logger.error(f"Error in diagnostic analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-class-patterns")
async def analyze_class_patterns(request: ClassPatternRequest):
    """
    Analyze patterns across an entire class to identify systemic issues.

    Returns:
    - Shared misconceptions affecting >30% of class
    - Curriculum pacing analysis
    - Teaching approach effectiveness
    - Learner grouping recommendations
    - Prioritized intervention strategies

    **Helps teachers understand: "What's happening with this class and why?"**
    """
    try:
        analyzer = get_diagnostic_analyzer()

        analysis = analyzer.analyze_class_patterns(
            class_id=request.class_id,
            assessment_results=request.assessment_results,
            timeframe_days=request.timeframe_days
        )

        return analysis

    except Exception as e:
        logger.error(f"Error in class pattern analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict-intervention")
async def predict_intervention_success(request: InterventionPredictionRequest):
    """
    Predict likelihood of intervention success for a specific learner.

    Returns:
    - Success probability (0-1)
    - Confidence level
    - Success/risk factors
    - Optimization tips
    - Alternative approaches
    - Estimated timeline

    **Answers: "Will this intervention work for THIS learner?"**
    """
    try:
        analyzer = get_diagnostic_analyzer()

        prediction = analyzer.predict_intervention_success(
            learner_profile=request.learner_profile,
            intervention_type=request.intervention_type,
            misconception_id=request.misconception_id,
            historical_data=request.historical_data
        )

        return prediction

    except Exception as e:
        logger.error(f"Error in intervention prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/dashboard-insights")
async def generate_dashboard_insights(request: DashboardInsightsRequest):
    """
    Generate AI-powered insights for the teacher dashboard.

    Returns:
    - Urgent alerts (at-risk learners, misconception spikes)
    - Positive highlights (celebrate wins)
    - Pattern observations (interesting trends)
    - Quick wins (high-impact, low-effort actions)
    - Predictive warnings (what might happen next)

    **Surfaces the MOST IMPORTANT things teachers should know TODAY.**
    """
    try:
        analyzer = get_diagnostic_analyzer()

        insights = analyzer.generate_diagnostic_insights(
            dashboard_data=request.dashboard_data
        )

        return insights

    except Exception as e:
        logger.error(f"Error generating dashboard insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Placeholder endpoints for future phases
# ============================================================================

@router.get("/features")
async def list_ai_features():
    """
    List all available AI features and their implementation status.

    Returns:
        List of AI features with status
    """
    return {
        "features": [
            {
                "name": "Health Check",
                "endpoint": "/api/v1/ai/health",
                "status": "implemented",
                "phase": 0,
                "description": "Check AI API connectivity and status"
            },
            {
                "name": "Answer Evaluation",
                "endpoint": "/api/v1/ai/evaluate-answer",
                "status": "implemented",
                "phase": 1,
                "description": "Grade learner answers with AI"
            },
            {
                "name": "Misconception Detection",
                "endpoint": "/api/v1/ai/detect-misconception",
                "status": "implemented",
                "phase": 2,
                "description": "Identify mathematical misconceptions from wrong answers"
            },
            {
                "name": "Class Misconception Analysis",
                "endpoint": "/api/v1/ai/class-misconceptions",
                "status": "implemented",
                "phase": 2,
                "description": "Analyze class-wide misconception patterns"
            },
            {
                "name": "Learning Pathway Generation",
                "endpoint": "/api/v1/ai/create-pathway",
                "status": "implemented",
                "phase": 3,
                "description": "Generate personalized learning sequences"
            },
            {
                "name": "Question Generation",
                "endpoint": "/api/v1/ai/generate-questions",
                "status": "planned",
                "phase": 4,
                "description": "Create CAPS-aligned assessment questions"
            },
            {
                "name": "Content Generation",
                "endpoint": "/api/v1/ai/generate-explanation",
                "status": "planned",
                "phase": 4,
                "description": "Generate explanations and remediation content"
            },
            {
                "name": "Error Diagnostic Analysis",
                "endpoint": "/api/v1/ai/diagnose-error",
                "status": "implemented",
                "phase": 4,
                "description": "Deep diagnostic analysis of learner errors with root cause identification"
            },
            {
                "name": "Class Pattern Analysis",
                "endpoint": "/api/v1/ai/analyze-class-patterns",
                "status": "implemented",
                "phase": 4,
                "description": "Identify systemic issues affecting multiple learners in a class"
            },
            {
                "name": "Intervention Success Prediction",
                "endpoint": "/api/v1/ai/predict-intervention",
                "status": "implemented",
                "phase": 4,
                "description": "Predict effectiveness of interventions for specific learners"
            },
            {
                "name": "Dashboard AI Insights",
                "endpoint": "/api/v1/ai/dashboard-insights",
                "status": "implemented",
                "phase": 4,
                "description": "Real-time AI-powered insights and alerts for teachers"
            },
            {
                "name": "Question Generation",
                "endpoint": "/api/v1/ai/generate-questions",
                "status": "planned",
                "phase": 5,
                "description": "Create CAPS-aligned assessment questions"
            },
            {
                "name": "Content Generation",
                "endpoint": "/api/v1/ai/generate-explanation",
                "status": "planned",
                "phase": 5,
                "description": "Generate explanations and remediation content"
            }
        ],
        "current_phase": 4,
        "total_features": 12,
        "implemented_features": 9,
        "timestamp": datetime.utcnow().isoformat()
    }
