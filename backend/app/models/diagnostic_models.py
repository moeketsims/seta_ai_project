"""
SQLAlchemy database models for diagnostic assessment system.

Stores:
- Misconception taxonomy
- Generated diagnostic items, probes, and forms
- Learner diagnostic sessions and results
"""

from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime,
    ForeignKey, JSON, Enum as SQLEnum, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.db.base_class import Base


# ============================================================================
# Enums
# ============================================================================

class MisconceptionSeverityEnum(str, enum.Enum):
    """Severity levels for misconceptions."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ProbeTypeEnum(str, enum.Enum):
    """Types of diagnostic probes."""
    QUICK_CONFIRMER = "quick_confirmer"
    ERROR_MODEL_PROBE = "error_model_probe"
    TRANSFER_PROBE = "transfer_probe"
    PREREQUISITE_CHECK = "prerequisite_check"


class DOKLevelEnum(str, enum.Enum):
    """Depth of Knowledge levels."""
    RECALL = "recall"
    SKILL_CONCEPT = "skill_concept"
    STRATEGIC = "strategic"
    EXTENDED = "extended"


# ============================================================================
# Misconception Taxonomy
# ============================================================================

class Misconception(Base):
    """
    A documented mathematical misconception.

    Example: "Multiplication always makes bigger" (believing a×b always > max(a,b))
    """
    __tablename__ = "misconceptions"

    id = Column(Integer, primary_key=True, index=True)
    tag = Column(String(50), unique=True, nullable=False, index=True)  # e.g., "MISC-NUM-037"
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)

    # CAPS alignment
    caps_objective_ids = Column(JSON, nullable=False, default=list)  # List of affected objectives
    content_areas = Column(JSON, nullable=False, default=list)  # ["Numbers.Operations", etc.]
    grade_levels = Column(JSON, nullable=False, default=list)  # [4, 5, 6]

    # Classification
    severity = Column(SQLEnum(MisconceptionSeverityEnum), nullable=False, default=MisconceptionSeverityEnum.MEDIUM)
    cognitive_type = Column(String(100))  # e.g., "procedural", "conceptual", "strategic"

    # Relationships
    prerequisite_misconception_ids = Column(JSON, default=list)  # Tags of prerequisite misconceptions
    related_misconception_ids = Column(JSON, default=list)

    # Evidence patterns
    evidence_patterns = Column(JSON, default=list)  # List of typical error patterns
    common_triggers = Column(JSON, default=list)  # Situations that trigger this misconception

    # Interventions
    intervention_strategies = Column(JSON, default=list)  # Brief intervention approaches
    resource_links = Column(JSON, default=list)  # Links to materials

    # Metadata
    source = Column(String(200))  # Research paper, educator input, etc.
    verified = Column(Boolean, default=False)
    usage_count = Column(Integer, default=0)  # How many items reference this

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    diagnostic_items = relationship("DiagnosticItem", secondary="item_misconception_map", back_populates="target_misconceptions")

    def __repr__(self):
        return f"<Misconception {self.tag}: {self.name}>"


# ============================================================================
# Diagnostic Items and Probes
# ============================================================================

class DiagnosticItem(Base):
    """
    A diagnostic assessment item with misconception-tagged distractors.

    Each item is designed so every wrong answer reveals specific thinking.
    """
    __tablename__ = "diagnostic_items"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(String(100), unique=True, nullable=False, index=True)
    item_type = Column(String(20), default="root")  # "root" or "probe"

    # CAPS alignment
    caps_objective_id = Column(String(100), nullable=False, index=True)
    content_area = Column(String(100), nullable=False)
    grade_level = Column(Integer, nullable=False, index=True)

    # Content
    stem = Column(Text, nullable=False)
    context = Column(Text)
    visual_aid_url = Column(String(500))

    # Cognitive metadata
    dok_level = Column(SQLEnum(DOKLevelEnum), nullable=False)
    estimated_time_seconds = Column(Integer, default=60)
    reading_level = Column(Integer)

    # Answer structure (stored as JSON for flexibility)
    correct_answer = Column(JSON, nullable=False)  # {option_id, value, reasoning, mastery_evidence}
    distractors = Column(JSON, nullable=False)  # List of distractor objects

    # Generation and validation
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    generated_by = Column(String(50), default="AI")  # "AI" or user_id
    validated = Column(Boolean, default=False)
    validation_notes = Column(Text)
    pilot_approved = Column(Boolean, default=False)

    # Usage statistics
    times_used = Column(Integer, default=0)
    avg_time_seconds = Column(Float)
    correct_rate = Column(Float)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    target_misconceptions = relationship("Misconception", secondary="item_misconception_map", back_populates="diagnostic_items")
    forms = relationship("DiagnosticForm", secondary="form_item_map", back_populates="items")
    probes = relationship("DiagnosticProbe", back_populates="parent_item", foreign_keys="DiagnosticProbe.parent_item_id")

    def __repr__(self):
        return f"<DiagnosticItem {self.item_id} (Grade {self.grade_level})>"


class DiagnosticProbe(Base):
    """
    A follow-up probe that investigates a specific misconception deeper.

    Triggered when learner selects a particular distractor.
    """
    __tablename__ = "diagnostic_probes"

    id = Column(Integer, primary_key=True, index=True)
    probe_id = Column(String(100), unique=True, nullable=False, index=True)
    probe_type = Column(SQLEnum(ProbeTypeEnum), nullable=False)

    # Parent relationship
    parent_item_id = Column(String(100), ForeignKey("diagnostic_items.item_id"), nullable=False)
    misconception_tag = Column(String(50), ForeignKey("misconceptions.tag"), nullable=False)

    # Content (similar to DiagnosticItem)
    stem = Column(Text, nullable=False)
    correct_answer = Column(JSON, nullable=False)
    distractors = Column(JSON, nullable=False)

    # Probe-specific
    confirms_misconception = Column(Boolean, default=True)
    scaffolding_hint = Column(Text)
    micro_intervention_id = Column(String(100))  # Reference to intervention pathway

    # Metadata
    depth_level = Column(Integer, default=1)  # How deep in the probe tree (1, 2, 3...)
    estimated_time_seconds = Column(Integer, default=45)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    parent_item = relationship("DiagnosticItem", back_populates="probes", foreign_keys=[parent_item_id])
    misconception = relationship("Misconception")

    def __repr__(self):
        return f"<DiagnosticProbe {self.probe_id} ({self.probe_type})>"


class DiagnosticForm(Base):
    """
    A complete diagnostic assessment form - a decision tree of items and probes.

    Teachers generate these and assign them to learners.
    """
    __tablename__ = "diagnostic_forms"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(200), nullable=False)

    # CAPS alignment
    caps_objective_id = Column(String(100), nullable=False, index=True)
    grade_level = Column(Integer, nullable=False, index=True)

    # Tree structure
    root_item_id = Column(String(100), ForeignKey("diagnostic_items.item_id"), nullable=False)
    decision_tree = Column(JSON, nullable=False)  # Full edge list for navigation

    # Constraints
    max_time_minutes = Column(Integer, default=8)
    max_depth = Column(Integer, default=3)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String(100))  # Teacher ID
    validated = Column(Boolean, default=False)
    pilot_approved = Column(Boolean, default=False)
    version = Column(Integer, default=1)

    # Usage statistics
    times_assigned = Column(Integer, default=0)
    times_completed = Column(Integer, default=0)
    avg_completion_time_seconds = Column(Float)

    # Relationships
    items = relationship("DiagnosticItem", secondary="form_item_map", back_populates="forms")
    sessions = relationship("DiagnosticSession", back_populates="form")

    def __repr__(self):
        return f"<DiagnosticForm {self.form_id}: {self.title}>"


# ============================================================================
# Association Tables
# ============================================================================

class ItemMisconceptionMap(Base):
    """Maps diagnostic items to the misconceptions they target."""
    __tablename__ = "item_misconception_map"

    item_id = Column(String(100), ForeignKey("diagnostic_items.item_id"), primary_key=True)
    misconception_tag = Column(String(50), ForeignKey("misconceptions.tag"), primary_key=True)
    is_primary = Column(Boolean, default=False)  # Whether this is the main misconception


class FormItemMap(Base):
    """Maps forms to their constituent items."""
    __tablename__ = "form_item_map"

    form_id = Column(String(100), ForeignKey("diagnostic_forms.form_id"), primary_key=True)
    item_id = Column(String(100), ForeignKey("diagnostic_items.item_id"), primary_key=True)
    sequence_order = Column(Integer)  # For display order


# ============================================================================
# Learner Sessions and Results
# ============================================================================

class DiagnosticSession(Base):
    """
    A learner's journey through a diagnostic form.

    Tracks responses, navigation path, and builds diagnostic evidence.
    """
    __tablename__ = "diagnostic_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, nullable=False, index=True)

    # Participants
    learner_id = Column(String(100), nullable=False, index=True)  # FK to User
    form_id = Column(String(100), ForeignKey("diagnostic_forms.form_id"), nullable=False)

    # Navigation state
    current_node_id = Column(String(100), nullable=False)  # Current item/probe
    visited_nodes = Column(JSON, default=list)  # Path through tree
    responses = Column(JSON, default=dict)  # node_id → option_selected

    # Diagnostic state
    suspected_misconceptions = Column(JSON, default=dict)  # tag → confidence
    confirmed_misconceptions = Column(JSON, default=list)  # List of confirmed tags

    # Session timing
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    last_activity_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))
    total_time_seconds = Column(Integer)

    # Status
    status = Column(String(20), default="in_progress")  # "in_progress", "completed", "abandoned"

    # Relationships
    form = relationship("DiagnosticForm", back_populates="sessions")
    result = relationship("DiagnosticResult", back_populates="session", uselist=False)

    # Indexes for queries
    __table_args__ = (
        Index('ix_diagnostic_sessions_learner_status', 'learner_id', 'status'),
    )

    def __repr__(self):
        return f"<DiagnosticSession {self.session_id} (Learner {self.learner_id})>"


class DiagnosticResult(Base):
    """
    Final diagnostic findings after a learner completes a form.

    This drives personalized pathway assignment and teacher interventions.
    """
    __tablename__ = "diagnostic_results"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), ForeignKey("diagnostic_sessions.session_id"), unique=True, nullable=False)

    learner_id = Column(String(100), nullable=False, index=True)
    form_id = Column(String(100), ForeignKey("diagnostic_forms.form_id"), nullable=False)

    # Findings
    primary_misconception = Column(String(50), ForeignKey("misconceptions.tag"))
    all_misconceptions = Column(JSON, nullable=False)  # tag → confidence
    severity = Column(SQLEnum(MisconceptionSeverityEnum), nullable=False)

    # Evidence
    response_path = Column(JSON, nullable=False)  # List of node IDs visited
    key_evidence = Column(JSON, default=list)  # Most diagnostic responses

    # Recommendations
    recommended_interventions = Column(JSON, default=list)  # Pathway IDs
    teacher_summary = Column(Text, nullable=False)
    learner_feedback = Column(Text, nullable=False)

    # Metadata
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    total_time_seconds = Column(Integer, nullable=False)
    confidence_score = Column(Float, nullable=False)  # 0.0 - 1.0

    # Teacher actions
    reviewed_by_teacher = Column(Boolean, default=False)
    teacher_notes = Column(Text)
    interventions_assigned = Column(JSON, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    session = relationship("DiagnosticSession", back_populates="result")

    # Indexes
    __table_args__ = (
        Index('ix_diagnostic_results_learner_completed', 'learner_id', 'completed_at'),
    )

    def __repr__(self):
        return f"<DiagnosticResult for Session {self.session_id}>"


# ============================================================================
# Quality and Analytics
# ============================================================================

class DiagnosticItemQuality(Base):
    """
    Quality metrics for diagnostic items based on learner interactions.

    Used for A/B testing, calibration, and item retirement decisions.
    """
    __tablename__ = "diagnostic_item_quality"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(String(100), ForeignKey("diagnostic_items.item_id"), unique=True, nullable=False)

    # Usage stats
    times_presented = Column(Integer, default=0)
    times_answered = Column(Integer, default=0)
    abandonment_rate = Column(Float, default=0.0)

    # Response distribution
    option_frequencies = Column(JSON, default=dict)  # option_id → count
    avg_time_seconds = Column(Float)

    # Diagnostic power
    distractor_effectiveness = Column(JSON, default=dict)  # option_id → diagnostic_lift
    misconception_detection_rate = Column(JSON, default=dict)  # misconception_tag → P(misc | distractor)

    # Clarity metrics
    clarity_flags = Column(Integer, default=0)  # Teacher reports of ambiguity
    clarity_score = Column(Float)  # Derived from abandonment, flags, etc.

    # Calibration
    last_calibrated_at = Column(DateTime(timezone=True))
    calibration_notes = Column(Text)

    # Decisions
    retired = Column(Boolean, default=False)
    retirement_reason = Column(String(200))

    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<DiagnosticItemQuality for {self.item_id}>"
