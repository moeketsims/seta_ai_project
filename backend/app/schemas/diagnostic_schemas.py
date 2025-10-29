"""
Pydantic schemas for AI-generated diagnostic assessments.

These schemas define the structure for:
- Diagnostic items with misconception-tagged distractors
- Adaptive probes that dive deeper into specific misconceptions
- Decision trees that map learner responses to root causes
"""

from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field, field_validator
from datetime import datetime


class MisconceptionSeverity(str, Enum):
    """Severity levels for identified misconceptions."""
    LOW = "low"           # Minor conceptual gap, easily remediated
    MEDIUM = "medium"     # Significant gap requiring targeted intervention
    HIGH = "high"         # Fundamental misunderstanding blocking progress
    CRITICAL = "critical" # Systemic gap affecting multiple topics


class ProbeType(str, Enum):
    """Types of follow-up probes to confirm misconceptions."""
    QUICK_CONFIRMER = "quick_confirmer"        # One-step check of the same concept
    ERROR_MODEL_PROBE = "error_model_probe"    # Apply same flawed rule in new context
    TRANSFER_PROBE = "transfer_probe"          # Same concept, different representation
    PREREQUISITE_CHECK = "prerequisite_check"  # Check if foundational skill is missing


class DOKLevel(str, Enum):
    """Depth of Knowledge levels aligned to CAPS cognitive demands."""
    RECALL = "recall"                    # Level 1: Remember facts
    SKILL_CONCEPT = "skill_concept"      # Level 2: Apply procedures
    STRATEGIC_THINKING = "strategic"     # Level 3: Reasoning, planning
    EXTENDED_THINKING = "extended"       # Level 4: Investigation, complex reasoning


class DiagnosticDistractorSchema(BaseModel):
    """
    A distractor (incorrect option) mapped to a specific misconception.

    Each distractor is a deliberate probe into learner thinking.
    """
    option_id: str = Field(..., description="Unique identifier (e.g., 'A', 'B', 'C')")
    value: str = Field(..., description="The distractor value/answer")
    misconception_tag: str = Field(..., description="Code referencing misconception database (e.g., 'MISC-NUM-037')")
    rationale: str = Field(..., description="Why this distractor targets this misconception")
    evidence_suggests: str = Field(..., description="What selecting this reveals about learner thinking")
    confidence_weight: float = Field(
        default=0.7,
        ge=0.0,
        le=1.0,
        description="Confidence that this choice indicates the tagged misconception"
    )
    next_probe_id: Optional[str] = Field(None, description="ID of follow-up probe to confirm this misconception")
    teacher_note: Optional[str] = Field(None, description="Guidance for teacher intervention")

    @field_validator('option_id')
    @classmethod
    def validate_option_id(cls, v: str) -> str:
        if not v or len(v) > 5:
            raise ValueError("option_id must be 1-5 characters")
        return v.upper()


class DiagnosticCorrectAnswerSchema(BaseModel):
    """The correct answer with reasoning and evidence of mastery."""
    option_id: str = Field(..., description="Correct option identifier")
    value: str = Field(..., description="The correct answer")
    reasoning: str = Field(..., description="Expected correct reasoning process")
    mastery_evidence: str = Field(..., description="What selecting this reveals about learner understanding")


class DiagnosticItemSchema(BaseModel):
    """
    A single diagnostic item with correct answer and misconception-mapped distractors.

    This is the core unit of diagnostic assessment generation.
    """
    item_id: str = Field(..., description="Unique item identifier")
    caps_objective_id: str = Field(..., description="CAPS curriculum objective this assesses")
    grade_level: int = Field(..., ge=0, le=12, description="Grade level (0=Grade R)")
    content_area: str = Field(..., description="CAPS content area (e.g., 'Numbers.Operations.Fractions')")

    # Item content
    stem: str = Field(..., description="The question/problem statement")
    context: Optional[str] = Field(None, description="Real-world context or scenario")
    visual_aid_url: Optional[str] = Field(None, description="URL to diagram/image if needed")

    # Cognitive metadata
    dok_level: DOKLevel = Field(..., description="Depth of Knowledge level")
    estimated_time_seconds: int = Field(default=60, ge=15, le=300, description="Expected time to complete")
    reading_level: Optional[int] = Field(None, description="Flesch-Kincaid grade level")

    # Answer options
    correct_answer: DiagnosticCorrectAnswerSchema
    distractors: List[DiagnosticDistractorSchema] = Field(
        ...,
        min_length=2,
        max_length=5,
        description="2-5 misconception-tagged distractors"
    )

    # Generation metadata
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    validated: bool = Field(default=False, description="Whether item passed validation gates")
    validation_notes: Optional[str] = Field(None)

    @field_validator('distractors')
    @classmethod
    def validate_unique_options(cls, v: List[DiagnosticDistractorSchema], info) -> List[DiagnosticDistractorSchema]:
        """Ensure all option_ids are unique across distractors and correct answer."""
        correct_id = info.data.get('correct_answer')
        if correct_id:
            all_ids = [correct_id.option_id] + [d.option_id for d in v]
            if len(all_ids) != len(set(all_ids)):
                raise ValueError("All option_ids must be unique")
        return v


class DiagnosticProbeSchema(BaseModel):
    """
    A follow-up probe that dives deeper into a specific misconception.

    Probes are triggered when a learner selects a particular distractor.
    """
    probe_id: str = Field(..., description="Unique probe identifier")
    probe_type: ProbeType = Field(..., description="Type of diagnostic probe")
    parent_item_id: str = Field(..., description="Item that triggered this probe")
    misconception_tag: str = Field(..., description="Misconception being investigated")

    # Probe content (same structure as diagnostic item)
    stem: str
    context: Optional[str] = Field(None, description="Real-world context or scenario")
    visual_aid_url: Optional[str] = Field(None, description="URL to diagram/image if needed")
    correct_answer: DiagnosticCorrectAnswerSchema
    distractors: List[DiagnosticDistractorSchema]

    # Cognitive metadata
    dok_level: DOKLevel = Field(default=DOKLevel.SKILL_CONCEPT, description="Depth of Knowledge level")
    estimated_time_seconds: int = Field(default=45, ge=15, le=300, description="Expected time to complete")
    reading_level: Optional[int] = Field(None, description="Flesch-Kincaid grade level")

    # Probe-specific metadata
    confirms_misconception: bool = Field(
        default=True,
        description="Whether this probe confirms (True) or refutes (False) the parent misconception"
    )
    scaffolding_hint: Optional[str] = Field(None, description="Optional hint if this is 3rd+ probe")
    micro_intervention_id: Optional[str] = Field(None, description="5-10min intervention to assign if confirmed")


class DecisionEdgeSchema(BaseModel):
    """
    An edge in the diagnostic decision tree.

    Maps: (current_node, learner_response) → (next_node, updated_diagnosis)
    """
    from_node_id: str = Field(..., description="Current item/probe ID")
    option_selected: str = Field(..., description="Learner's chosen option")
    to_node_id: Optional[str] = Field(None, description="Next probe ID, or None if terminal")
    misconception_tag: Optional[str] = Field(None, description="Misconception indicated by this edge")
    confidence_delta: float = Field(
        default=0.0,
        ge=-1.0,
        le=1.0,
        description="Change in confidence for this misconception (-1 to +1)"
    )


class DiagnosticFormSchema(BaseModel):
    """
    A complete diagnostic assessment form - a tree of items and probes.

    This is what teachers generate/assign and what learners take.
    """
    form_id: str = Field(..., description="Unique form identifier")
    title: str = Field(..., description="Human-readable form title")
    caps_objective_id: str = Field(..., description="Primary CAPS objective assessed")
    grade_level: int = Field(..., ge=0, le=12)

    # Tree structure
    root_item_id: str = Field(..., description="Starting item ID")
    items: List[DiagnosticItemSchema] = Field(..., min_length=1, description="All items in the tree")
    probes: List[DiagnosticProbeSchema] = Field(default_factory=list, description="Follow-up probes")
    edges: List[DecisionEdgeSchema] = Field(..., description="Decision tree edges")

    # Constraints
    max_time_minutes: int = Field(default=8, ge=3, le=15, description="Maximum time for entire form")
    max_depth: int = Field(default=3, ge=1, le=5, description="Maximum probe depth per branch")

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = Field(None, description="Teacher/admin ID")
    validated: bool = Field(default=False)
    pilot_approved: bool = Field(default=False, description="Whether this form is production-ready")
    version: int = Field(default=1)


class DiagnosticSessionStateSchema(BaseModel):
    """
    Runtime state for a learner taking a diagnostic assessment.

    Tracks path through decision tree and accumulates evidence.
    """
    session_id: str
    learner_id: str
    form_id: str

    # Navigation state
    current_node_id: str = Field(..., description="Current item/probe being shown")
    visited_nodes: List[str] = Field(default_factory=list, description="Path through tree")
    responses: Dict[str, str] = Field(default_factory=dict, description="node_id → option_selected")

    # Diagnostic state
    suspected_misconceptions: Dict[str, float] = Field(
        default_factory=dict,
        description="misconception_tag → confidence score (0-1)"
    )
    confirmed_misconceptions: List[str] = Field(
        default_factory=list,
        description="Misconceptions confirmed by multiple probes"
    )

    # Session metadata
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    total_time_seconds: Optional[int] = None

    # Current node payload (item or probe)
    current_node: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Current diagnostic item/probe content for the learner to answer"
    )


class DiagnosticResultSchema(BaseModel):
    """
    Final diagnostic result after learner completes the form.

    This is what teachers see and what triggers personalized pathways.
    """
    session_id: str
    learner_id: str
    form_id: str

    # Findings
    primary_misconception: Optional[str] = Field(None, description="Highest-confidence misconception")
    all_misconceptions: Dict[str, float] = Field(..., description="All detected misconceptions with confidence")
    severity: MisconceptionSeverity = Field(..., description="Overall severity of gaps")

    # Evidence
    response_path: List[str] = Field(..., description="Sequence of nodes visited")
    key_evidence: List[str] = Field(..., description="Most telling responses")

    # Recommendations
    recommended_interventions: List[str] = Field(..., description="Micro-pathway IDs to assign")
    teacher_summary: str = Field(..., description="Plain-language summary for teacher")
    learner_feedback: str = Field(..., description="Encouraging, growth-oriented feedback for learner")

    # Metadata
    completed_at: datetime = Field(default_factory=datetime.utcnow)
    total_time_seconds: int
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Overall confidence in diagnosis")


# ============================================================================
# Generation Request/Response Schemas
# ============================================================================

class GenerateDiagnosticFormRequest(BaseModel):
    """Request to generate a new diagnostic form via AI."""
    caps_objective_id: str = Field(..., description="CAPS objective to assess")
    grade_level: int = Field(..., ge=0, le=12)
    content_area: str = Field(..., description="e.g., 'Numbers.Operations.Fractions'")

    # Optional constraints
    max_items: int = Field(default=5, ge=3, le=8, description="Max items in tree")
    max_time_minutes: int = Field(default=8, ge=3, le=15)
    include_visuals: bool = Field(default=False, description="Whether to generate visual aids")
    reading_level_max: Optional[int] = Field(None, description="Max Flesch-Kincaid level")

    # Teacher preferences
    focus_misconceptions: Optional[List[str]] = Field(None, description="Specific misconceptions to target")
    avoid_contexts: Optional[List[str]] = Field(None, description="Contexts to avoid (e.g., 'sports', 'money')")


class GenerateDiagnosticFormResponse(BaseModel):
    """Response containing the generated diagnostic form."""
    form: DiagnosticFormSchema
    generation_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="LLM usage, validation results, etc."
    )
    warnings: List[str] = Field(default_factory=list, description="Any generation warnings")


class ValidateItemRequest(BaseModel):
    """Request to validate a single diagnostic item."""
    item: DiagnosticItemSchema


class ValidateItemResponse(BaseModel):
    """Validation results for a diagnostic item."""
    valid: bool
    item_id: str
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    math_check_passed: bool = Field(..., description="Whether mathematical correctness was verified")
    ambiguity_score: float = Field(..., ge=0.0, le=1.0, description="0=clear, 1=ambiguous")
    misconception_coverage: Dict[str, bool] = Field(
        ...,
        description="misconception_tag → whether it exists in database"
    )


class NextNodeRequest(BaseModel):
    """Request to get the next node in a diagnostic session."""
    session_id: str
    response: str = Field(..., description="Option selected by learner (e.g., 'A')")
    time_spent_seconds: int = Field(..., ge=0)


class NextNodeResponse(BaseModel):
    """Response with the next item/probe or terminal result."""
    session_id: str
    terminal: bool = Field(..., description="Whether this is the end of the assessment")
    next_node: Optional[Dict[str, Any]] = Field(None, description="Next item/probe to show")
    result: Optional[DiagnosticResultSchema] = Field(None, description="Final result if terminal")
    progress: Dict[str, Any] = Field(
        default_factory=dict,
        description="Progress indicators (nodes visited, estimated completion)"
    )
