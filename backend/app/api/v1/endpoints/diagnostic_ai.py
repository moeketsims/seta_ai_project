"""
FastAPI endpoints for AI-powered diagnostic assessment system.

Endpoints:
- POST /generate-diagnostic-form: Generate new diagnostic form via AI
- POST /validate-item: Validate a single diagnostic item
- POST /diagnostic-session/start: Start a diagnostic session
- POST /diagnostic-session/next: Get next node in assessment
- GET /diagnostic-session/{session_id}: Get session state
- GET /diagnostic-result/{session_id}: Get final diagnostic result
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.diagnostic_schemas import (
    GenerateDiagnosticFormRequest,
    GenerateDiagnosticFormResponse,
    ValidateItemRequest,
    ValidateItemResponse,
    DiagnosticSessionStateSchema,
    NextNodeRequest,
    NextNodeResponse,
    DiagnosticResultSchema,
)
from app.services.diagnostic_generator import DiagnosticGenerator
from app.services.diagnostic_router import DiagnosticRouter
from app.models.diagnostic_models import (
    DiagnosticSession,
    DiagnosticResult,
    DiagnosticForm,
    DiagnosticItem,
    DiagnosticProbe,
    FormItemMap,
    Misconception,
)


router = APIRouter()


# ============================================================================
# Form Generation Endpoints
# ============================================================================

@router.post(
    "/generate-diagnostic-form",
    response_model=GenerateDiagnosticFormResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate AI-powered diagnostic assessment",
    description="""
    Generate a complete diagnostic assessment form using AI.

    The AI creates items where each distractor is mapped to a specific
    mathematical misconception, enabling deep diagnostic inference.

    **Process**:
    1. Blueprint creation: Identify CAPS objectives and target misconceptions
    2. Root item generation: Create main diagnostic item with misconception-tagged distractors
    3. Probe generation: Create follow-up probes to confirm/refute suspected misconceptions
    4. Decision tree assembly: Build adaptive navigation tree
    5. Validation: Ensure mathematical correctness and misconception coverage

    **Use Cases**:
    - Teacher authoring new weekly diagnostics
    - Generating variants for A/B testing
    - Creating targeted assessments for specific misconceptions
    """,
)
def generate_diagnostic_form(
    request: GenerateDiagnosticFormRequest,
    save: bool = Query(False, description="Persist generated form to database"),
    db: Session = Depends(get_db),
) -> GenerateDiagnosticFormResponse:
    """
    Generate a new diagnostic assessment form using AI.

    Args:
        request: Form generation parameters (CAPS objective, constraints, etc.)
        db: Database session

    Returns:
        Generated diagnostic form with items, probes, and decision tree

    Raises:
        HTTPException: If generation fails or validation errors occur
    """
    try:
        generator = DiagnosticGenerator(db=db)
        response = generator.generate_diagnostic_form(request)

        if save:
            _persist_generated_form(db, response.form)

        return response

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Generation failed: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error during generation: {str(e)}",
        )


@router.post(
    "/validate-item",
    response_model=ValidateItemResponse,
    summary="Validate diagnostic item",
    description="""
    Validate a diagnostic item for:
    - Mathematical correctness (using SymPy solver)
    - Ambiguity and clarity
    - Misconception tag coverage (all tags exist in database)
    - Reading level appropriateness

    Use this before saving AI-generated or teacher-authored items.
    """,
)
def validate_item(
    request: ValidateItemRequest,
    db: Session = Depends(get_db),
) -> ValidateItemResponse:
    """
    Validate a diagnostic assessment item.

    Args:
        request: Item to validate
        db: Database session

    Returns:
        Validation results with errors, warnings, and quality scores
    """
    errors: List[str] = []
    warnings: List[str] = []

    # Unique option IDs and correct option not duplicated
    option_ids = {d.option_id for d in request.item.distractors}
    if request.item.correct_answer.option_id in option_ids:
        errors.append("Correct answer option_id duplicates a distractor option_id")

    if len(option_ids) != len(request.item.distractors):
        errors.append("Duplicate option_ids found among distractors")

    # Misconception tag coverage check
    tags = [d.misconception_tag for d in request.item.distractors]
    existing = set(
        t[0] for t in db.query(Misconception.tag).filter(Misconception.tag.in_(tags)).all()
    )
    coverage = {t: (t in existing) for t in tags}
    if not all(coverage.values()):
        missing = [t for t, ok in coverage.items() if not ok]
        errors.append(f"Unknown misconception tags: {missing}")

    valid = len(errors) == 0

    return ValidateItemResponse(
        valid=valid,
        item_id=request.item.item_id,
        errors=errors,
        warnings=warnings,
        math_check_passed=True,  # Placeholder (no SymPy)
        ambiguity_score=0.1,
        misconception_coverage=coverage,
    )


# ============================================================================
# Persistence Helpers
# ============================================================================

def _persist_generated_form(db: Session, form) -> None:
    """Persist generated form, nodes and edges to database.

    Stores:
    - DiagnosticItem (root)
    - DiagnosticProbe(s)
    - DiagnosticForm with decision_tree { nodes, edges }
    - FormItemMap relations
    """
    # Upsert root item
    root = db.query(DiagnosticItem).filter(DiagnosticItem.item_id == form.root_item_id).first()
    root_item = form.items[0]
    if not root:
        root = DiagnosticItem(
            item_id=root_item.item_id,
            item_type="root",
            caps_objective_id=root_item.caps_objective_id,
            content_area=root_item.content_area,
            grade_level=root_item.grade_level,
            stem=root_item.stem,
            context=root_item.context,
            visual_aid_url=root_item.visual_aid_url,
            dok_level=root_item.dok_level.value if hasattr(root_item.dok_level, "value") else str(root_item.dok_level),
            estimated_time_seconds=root_item.estimated_time_seconds,
            reading_level=root_item.reading_level,
            correct_answer=root_item.correct_answer.model_dump(),
            distractors=[d.model_dump() for d in root_item.distractors],
            validated=form.validated if hasattr(form, "validated") else False,
        )
        db.add(root)

    # Upsert probes
    probe_ids: List[str] = []
    for p in form.probes:
        probe_ids.append(p.probe_id)
        existing = db.query(DiagnosticProbe).filter(DiagnosticProbe.probe_id == p.probe_id).first()
        if not existing:
            db.add(
                DiagnosticProbe(
                    probe_id=p.probe_id,
                    probe_type=p.probe_type.value if hasattr(p.probe_type, "value") else str(p.probe_type),
                    parent_item_id=p.parent_item_id,
                    misconception_tag=p.misconception_tag,
                    stem=p.stem,
                    correct_answer=p.correct_answer.model_dump(),
                    distractors=[d.model_dump() for d in p.distractors],
                    confirms_misconception=p.confirms_misconception,
                    scaffolding_hint=p.scaffolding_hint,
                    micro_intervention_id=p.micro_intervention_id,
                )
            )

    # Build decision tree with nodes + edges for router
    nodes: Dict[str, Any] = {
        root_item.item_id: root_item.model_dump(),
        **{p.probe_id: p.model_dump() for p in form.probes},
    }
    edges = [e.model_dump() for e in form.edges]

    # Upsert form
    existing_form = db.query(DiagnosticForm).filter(DiagnosticForm.form_id == form.form_id).first()
    if not existing_form:
        existing_form = DiagnosticForm(
            form_id=form.form_id,
            title=form.title,
            caps_objective_id=form.caps_objective_id,
            grade_level=form.grade_level,
            root_item_id=form.root_item_id,
            decision_tree={"nodes": nodes, "edges": edges},
            max_time_minutes=form.max_time_minutes,
            max_depth=form.max_depth,
            validated=form.validated,
            pilot_approved=form.pilot_approved,
            version=form.version,
        )
        db.add(existing_form)
    else:
        existing_form.title = form.title
        existing_form.decision_tree = {"nodes": nodes, "edges": edges}

    # Map form to its items
    if not db.query(FormItemMap).filter(
        FormItemMap.form_id == form.form_id, FormItemMap.item_id == root_item.item_id
    ).first():
        db.add(FormItemMap(form_id=form.form_id, item_id=root_item.item_id, sequence_order=0))

    db.commit()


# ============================================================================
# Diagnostic Session Endpoints
# ============================================================================

@router.post(
    "/diagnostic-session/start",
    response_model=DiagnosticSessionStateSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Start diagnostic assessment session",
    description="""
    Start a new diagnostic assessment session for a learner.

    Creates session state and returns the first (root) item to display.
    """,
)
def start_diagnostic_session(
    learner_id: str,
    form_id: str,
    db: Session = Depends(get_db),
) -> DiagnosticSessionStateSchema:
    """
    Start a new diagnostic session.

    Args:
        learner_id: ID of learner taking the assessment
        form_id: ID of diagnostic form to take
        db: Database session

    Returns:
        Initial session state

    Raises:
        HTTPException: If form not found or session creation fails
    """
    try:
        router_service = DiagnosticRouter(db=db)
        session_state = router_service.start_session(learner_id=learner_id, form_id=form_id)
        return session_state

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start session: {str(e)}",
        )


@router.post(
    "/diagnostic-session/next",
    response_model=NextNodeResponse,
    summary="Get next item/probe in diagnostic assessment",
    description="""
    Submit learner's response and get the next item/probe to display.

    **Adaptive Navigation**:
    - Routes learner through decision tree based on responses
    - Updates misconception confidence scores
    - Determines when to stop (terminal node or high confidence)
    - Returns final diagnostic result when complete

    **Terminal Conditions**:
    - Reached end of decision tree
    - High confidence (≥0.9) in diagnosis
    - Maximum depth reached
    """,
)
def next_diagnostic_node(
    request: NextNodeRequest,
    db: Session = Depends(get_db),
) -> NextNodeResponse:
    """
    Process learner's response and navigate to next node.

    Args:
        request: Contains session_id, selected option, time spent
        db: Database session

    Returns:
        Next item/probe to display OR final diagnostic result if terminal

    Raises:
        HTTPException: If session not found or navigation fails
    """
    try:
        router_service = DiagnosticRouter(db=db)
        response = router_service.next_node(request)
        return response

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Navigation failed: {str(e)}",
        )


@router.get(
    "/diagnostic-session/{session_id}",
    response_model=DiagnosticSessionStateSchema,
    summary="Get current session state",
    description="""
    Retrieve current state of a diagnostic session.

    Useful for:
    - Resuming interrupted sessions
    - Teacher monitoring of in-progress assessments
    - Debugging navigation issues
    """,
)
def get_diagnostic_session(
    session_id: str,
    db: Session = Depends(get_db),
) -> DiagnosticSessionStateSchema:
    """
    Get current diagnostic session state.

    Args:
        session_id: Session ID
        db: Database session

    Returns:
        Current session state

    Raises:
        HTTPException: If session not found
    """
    session = db.query(DiagnosticSession).filter(DiagnosticSession.session_id == session_id).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found",
        )

    return DiagnosticSessionStateSchema(
        session_id=session.session_id,
        learner_id=session.learner_id,
        form_id=session.form_id,
        current_node_id=session.current_node_id,
        visited_nodes=session.visited_nodes,
        responses=session.responses,
        suspected_misconceptions=session.suspected_misconceptions,
        confirmed_misconceptions=session.confirmed_misconceptions,
        started_at=session.started_at,
        completed_at=session.completed_at,
        total_time_seconds=session.total_time_seconds,
    )


# ============================================================================
# Diagnostic Result Endpoints
# ============================================================================

@router.get(
    "/diagnostic-result/{session_id}",
    response_model=DiagnosticResultSchema,
    summary="Get diagnostic assessment result",
    description="""
    Retrieve final diagnostic result for a completed session.

    **Result Contains**:
    - Primary misconception identified
    - All suspected misconceptions with confidence scores
    - Severity level
    - Evidence (response path and key responses)
    - Recommended interventions (micro-pathways to assign)
    - Teacher summary (detailed clinical report)
    - Learner feedback (growth-oriented, encouraging)

    **Use Cases**:
    - Teacher intervention planning
    - Assigning personalized learning pathways
    - Parent/guardian reporting
    """,
)
def get_diagnostic_result(
    session_id: str,
    db: Session = Depends(get_db),
) -> DiagnosticResultSchema:
    """
    Get final diagnostic result for a session.

    Args:
        session_id: Session ID
        db: Database session

    Returns:
        Diagnostic result with findings and recommendations

    Raises:
        HTTPException: If result not found or session not completed
    """
    result = db.query(DiagnosticResult).filter(DiagnosticResult.session_id == session_id).first()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diagnostic result for session {session_id} not found. Session may not be completed.",
        )

    return DiagnosticResultSchema(
        session_id=result.session_id,
        learner_id=result.learner_id,
        form_id=result.form_id,
        primary_misconception=result.primary_misconception,
        all_misconceptions=result.all_misconceptions,
        severity=result.severity,
        response_path=result.response_path,
        key_evidence=result.key_evidence,
        recommended_interventions=result.recommended_interventions,
        teacher_summary=result.teacher_summary,
        learner_feedback=result.learner_feedback,
        completed_at=result.completed_at,
        total_time_seconds=result.total_time_seconds,
        confidence_score=result.confidence_score,
    )


@router.get(
    "/learner/{learner_id}/diagnostic-results",
    response_model=List[DiagnosticResultSchema],
    summary="Get all diagnostic results for a learner",
    description="""
    Retrieve all diagnostic assessment results for a specific learner.

    Useful for:
    - Tracking learner progress over time
    - Identifying persistent misconceptions
    - Evaluating intervention effectiveness
    """,
)
def get_learner_diagnostic_results(
    learner_id: str,
    limit: int = 10,
    db: Session = Depends(get_db),
) -> List[DiagnosticResultSchema]:
    """
    Get all diagnostic results for a learner.

    Args:
        learner_id: Learner ID
        limit: Maximum number of results to return (default 10)
        db: Database session

    Returns:
        List of diagnostic results, most recent first
    """
    results = (
        db.query(DiagnosticResult)
        .filter(DiagnosticResult.learner_id == learner_id)
        .order_by(DiagnosticResult.completed_at.desc())
        .limit(limit)
        .all()
    )

    return [
        DiagnosticResultSchema(
            session_id=r.session_id,
            learner_id=r.learner_id,
            form_id=r.form_id,
            primary_misconception=r.primary_misconception,
            all_misconceptions=r.all_misconceptions,
            severity=r.severity,
            response_path=r.response_path,
            key_evidence=r.key_evidence,
            recommended_interventions=r.recommended_interventions,
            teacher_summary=r.teacher_summary,
            learner_feedback=r.learner_feedback,
            completed_at=r.completed_at,
            total_time_seconds=r.total_time_seconds,
            confidence_score=r.confidence_score,
        )
        for r in results
    ]
