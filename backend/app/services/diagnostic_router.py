"""
Diagnostic Router Service.

Manages adaptive navigation through diagnostic assessment decision trees.
Routes learners to the next item/probe based on their responses and maintains
diagnostic state (suspected/confirmed misconceptions).
"""

import logging
import re
from typing import Dict, Any, Optional, Tuple, List
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.diagnostic_models import (
    DiagnosticSession,
    DiagnosticResult,
    DiagnosticForm,
    DiagnosticItem,
    DiagnosticProbe,
    FormItemMap,
    Misconception,
    MisconceptionSeverityEnum,
)
from app.models.models import (
    AIGeneratedQuestion,
    AIGeneratedMisconception,
    AdaptiveDecisionTree,
)
from app.schemas.diagnostic_schemas import (
    DiagnosticSessionStateSchema,
    DiagnosticResultSchema,
    NextNodeRequest,
    NextNodeResponse,
    MisconceptionSeverity,
    GenerateDiagnosticFormRequest,
)
from app.services.diagnostic_generator import DiagnosticGenerator

logger = logging.getLogger(__name__)


class DiagnosticRouter:
    """
    Routes learners through diagnostic decision trees and builds evidence for misconceptions.

    Responsibilities:
    1. Navigate decision tree based on learner responses
    2. Update misconception confidence scores
    3. Determine when to stop (terminal node or high confidence)
    4. Generate final diagnostic result
    """

    def __init__(self, db: Session):
        """
        Initialize router with database session.

        Args:
            db: SQLAlchemy database session
        """
        self.db = db

    # ========================================================================
    # Session Management
    # ========================================================================

    def start_session(self, learner_id: str, form_id: str) -> DiagnosticSessionStateSchema:
        """
        Start a new diagnostic session for a learner.

        Args:
            learner_id: ID of the learner
            form_id: ID of the diagnostic form to take

        Returns:
            Initial session state

        Raises:
            ValueError: If form not found
        """
        # Fetch form from database
        form = self.db.query(DiagnosticForm).filter(DiagnosticForm.form_id == form_id).first()
        if form and self._looks_like_mock_form(form):
            form = None

        if not form:
            form = self._create_or_generate_form(form_id)

        # Create session
        session = DiagnosticSession(
            session_id=self._generate_session_id(),
            learner_id=learner_id,
            form_id=form_id,
            current_node_id=form.root_item_id,
            visited_nodes=[],
            responses={},
            suspected_misconceptions={},
            confirmed_misconceptions=[],
            status="in_progress",
        )

        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)

        # Also fetch the first question to return with the session
        first_node = self.get_current_node(session.session_id)

        # Create response with first question embedded
        response = DiagnosticSessionStateSchema(
            session_id=session.session_id,
            learner_id=session.learner_id,
            form_id=session.form_id,
            current_node_id=session.current_node_id,
            visited_nodes=session.visited_nodes,
            responses=session.responses,
            suspected_misconceptions=session.suspected_misconceptions,
            confirmed_misconceptions=session.confirmed_misconceptions,
            started_at=session.started_at,
            current_node=first_node,
        )

        return response

    def get_current_node(self, session_id: str) -> Dict[str, Any]:
        """
        Get the current item/probe for a session.

        Args:
            session_id: Session ID

        Returns:
            Current node (item or probe) as dict

        Raises:
            ValueError: If session not found or decision tree invalid
        """
        session = self._get_session(session_id)
        form = self.db.query(DiagnosticForm).filter(DiagnosticForm.form_id == session.form_id).first()
        
        if not form:
            raise ValueError(f"Form {session.form_id} not found for session {session_id}")

        # Find current node in form's decision tree
        decision_tree = form.decision_tree  # JSON containing all nodes
        
        if not decision_tree:
            raise ValueError(f"Form {session.form_id} has no decision tree data")

        current_node = decision_tree.get("nodes", {}).get(session.current_node_id)
        if not current_node:
            raise ValueError(f"Current node {session.current_node_id} not found in decision tree for form {session.form_id}")

        return current_node

    # ========================================================================
    # Navigation
    # ========================================================================

    def _create_or_generate_form(self, form_id: str) -> DiagnosticForm:
        """Generate a diagnostic form via OpenAI or fall back to mock content."""
        try:
            request = self._build_generation_request(form_id)
            generator = DiagnosticGenerator(db=self.db)
            response = generator.generate_diagnostic_form(request)
            form = self._persist_generated_form(response.form)
            logger.info("Generated diagnostic form %s via OpenAI", form.form_id)
            return form
        except Exception as exc:  # noqa: BLE001 - we want to log any failure and fallback
            logger.warning(
                "Falling back to mock diagnostic form '%s' due to generation error: %s",
                form_id,
                exc,
            )
            return self._create_mock_diagnostic_form(form_id)

    def _build_generation_request(self, form_id: str) -> GenerateDiagnosticFormRequest:
        """Create a generation request heuristic based on the form identifier."""
        grade_level = 4
        match = re.search(r"g(\d+)", form_id, re.IGNORECASE)
        if match:
            try:
                grade_level = max(1, min(12, int(match.group(1))))
            except ValueError:
                grade_level = 4

        content_area = "Numbers.Operations.Addition"
        if grade_level >= 5:
            content_area = "Numbers.Operations.Fractions"

        caps_objective_id = f"CAPS-G{grade_level}-NUM-ADD-01"

        return GenerateDiagnosticFormRequest(
            caps_objective_id=caps_objective_id,
            grade_level=grade_level,
            content_area=content_area,
            max_items=5,
            max_time_minutes=8,
            include_visuals=False,
            reading_level_max=grade_level,
        )

    def _persist_generated_form(self, form_schema) -> DiagnosticForm:
        """Persist a generated diagnostic form and return the ORM instance."""
        root_item_schema = form_schema.items[0]

        root_item = self.db.query(DiagnosticItem).filter(
            DiagnosticItem.item_id == root_item_schema.item_id
        ).first()

        root_payload = root_item_schema.model_dump(mode="json")

        if not root_item:
            root_item = DiagnosticItem(
                item_id=root_item_schema.item_id,
                item_type="root",
                caps_objective_id=root_item_schema.caps_objective_id,
                content_area=root_item_schema.content_area,
                grade_level=root_item_schema.grade_level,
                stem=root_item_schema.stem,
                context=root_item_schema.context,
                visual_aid_url=root_item_schema.visual_aid_url,
                dok_level=root_item_schema.dok_level.value
                if hasattr(root_item_schema.dok_level, "value")
                else str(root_item_schema.dok_level),
                estimated_time_seconds=root_item_schema.estimated_time_seconds,
                reading_level=root_item_schema.reading_level,
                correct_answer=root_item_schema.correct_answer.model_dump(mode="json"),
                distractors=[d.model_dump(mode="json") for d in root_item_schema.distractors],
                validated=getattr(form_schema, "validated", False),
            )
            self.db.add(root_item)
        else:
            root_item.stem = root_item_schema.stem
            root_item.context = root_item_schema.context
            root_item.visual_aid_url = root_item_schema.visual_aid_url
            root_item.dok_level = root_item_schema.dok_level.value if hasattr(
                root_item_schema.dok_level, "value"
            ) else str(root_item_schema.dok_level)
            root_item.estimated_time_seconds = root_item_schema.estimated_time_seconds
            root_item.reading_level = root_item_schema.reading_level
            root_item.correct_answer = root_item_schema.correct_answer.model_dump(mode="json")
            root_item.distractors = [d.model_dump(mode="json") for d in root_item_schema.distractors]

        # Upsert probes
        for probe_schema in form_schema.probes:
            probe = self.db.query(DiagnosticProbe).filter(
                DiagnosticProbe.probe_id == probe_schema.probe_id
            ).first()
            if not probe:
                probe = DiagnosticProbe(
                    probe_id=probe_schema.probe_id,
                    probe_type=probe_schema.probe_type.value
                    if hasattr(probe_schema.probe_type, "value")
                    else str(probe_schema.probe_type),
                    parent_item_id=probe_schema.parent_item_id,
                    misconception_tag=probe_schema.misconception_tag,
                    stem=probe_schema.stem,
                    correct_answer=probe_schema.correct_answer.model_dump(mode="json"),
                    distractors=[d.model_dump(mode="json") for d in probe_schema.distractors],
                    confirms_misconception=probe_schema.confirms_misconception,
                    scaffolding_hint=probe_schema.scaffolding_hint,
                    micro_intervention_id=probe_schema.micro_intervention_id,
                )
                self.db.add(probe)
            else:
                probe.probe_type = probe_schema.probe_type.value if hasattr(
                    probe_schema.probe_type, "value"
                ) else str(probe_schema.probe_type)
                probe.parent_item_id = probe_schema.parent_item_id
                probe.misconception_tag = probe_schema.misconception_tag
                probe.stem = probe_schema.stem
                probe.correct_answer = probe_schema.correct_answer.model_dump(mode="json")
                probe.distractors = [d.model_dump(mode="json") for d in probe_schema.distractors]
                probe.confirms_misconception = probe_schema.confirms_misconception
                probe.scaffolding_hint = probe_schema.scaffolding_hint
                probe.micro_intervention_id = probe_schema.micro_intervention_id

        # Build decision tree map expected by router
        nodes: Dict[str, Any] = {
            root_item_schema.item_id: root_payload,
            **{p.probe_id: p.model_dump(mode="json") for p in form_schema.probes},
        }
        edges = [edge.model_dump(mode="json") for edge in form_schema.edges]

        form_record = self.db.query(DiagnosticForm).filter(
            DiagnosticForm.form_id == form_schema.form_id
        ).first()

        if not form_record:
            form_record = DiagnosticForm(
                form_id=form_schema.form_id,
                title=form_schema.title,
                caps_objective_id=form_schema.caps_objective_id,
                grade_level=form_schema.grade_level,
                root_item_id=form_schema.root_item_id,
                decision_tree={"nodes": nodes, "edges": edges},
                max_time_minutes=form_schema.max_time_minutes,
                max_depth=form_schema.max_depth,
                validated=getattr(form_schema, "validated", False),
                pilot_approved=getattr(form_schema, "pilot_approved", False),
                version=getattr(form_schema, "version", 1),
            )
            self.db.add(form_record)
        else:
            form_record.title = form_schema.title
            form_record.caps_objective_id = form_schema.caps_objective_id
            form_record.grade_level = form_schema.grade_level
            form_record.root_item_id = form_schema.root_item_id
            form_record.decision_tree = {"nodes": nodes, "edges": edges}
            form_record.max_time_minutes = form_schema.max_time_minutes
            form_record.max_depth = form_schema.max_depth

        if not self.db.query(FormItemMap).filter(
            FormItemMap.form_id == form_schema.form_id,
            FormItemMap.item_id == root_item_schema.item_id,
        ).first():
            self.db.add(
                FormItemMap(
                    form_id=form_schema.form_id,
                    item_id=root_item_schema.item_id,
                    sequence_order=0,
                )
            )

        self.db.commit()

        return form_record

    def _looks_like_mock_form(self, form: DiagnosticForm) -> bool:
        """Heuristically determine if a stored form is the legacy mock version."""
        try:
            nodes = (form.decision_tree or {}).get("nodes", {})
            root = nodes.get(form.root_item_id)
            if not root:
                return False
            stem = root.get("stem", "").lower()
            return "345 + 278" in stem
        except Exception:  # noqa: BLE001 - defensive; if malformed, treat as non-mock
            return False

    def next_node(self, request: NextNodeRequest) -> NextNodeResponse:
        """
        Process learner's response and navigate to next node.

        Main orchestration method that:
        1. Records response
        2. Updates misconception confidence
        3. Determines next node
        4. Checks for terminal conditions
        5. Generates result if done

        Args:
            request: Contains session_id, learner's response, time spent

        Returns:
            Next node to show OR final diagnostic result
        """
        session = self._get_session(request.session_id)

        # Step 1: Record response
        session.responses[session.current_node_id] = request.response
        session.visited_nodes.append(session.current_node_id)
        session.last_activity_at = datetime.utcnow()

        # Step 2: Update diagnostic state
        self._update_misconception_confidence(session, request.response)

        # Step 3: Determine next node
        next_node_id = self._find_next_node(session, request.response)

        # Step 4: Check terminal conditions
        terminal = self._check_terminal(session, next_node_id)

        if terminal:
            # Generate final result
            result = self._generate_result(session)
            # Persist result for analytics and reporting
            self._persist_result(session, result)
            session.status = "completed"
            session.completed_at = datetime.utcnow()
            session.total_time_seconds = int((datetime.utcnow() - session.started_at).total_seconds())

            self.db.commit()

            return NextNodeResponse(
                session_id=session.session_id,
                terminal=True,
                next_node=None,
                result=result,
                progress={
                    "nodes_visited": len(session.visited_nodes),
                    "completion": 1.0,
                },
            )
        else:
            # Update current node and continue
            session.current_node_id = next_node_id
            self.db.commit()

            next_node_content = self.get_current_node(session.session_id)

            return NextNodeResponse(
                session_id=session.session_id,
                terminal=False,
                next_node=next_node_content,
                result=None,
                progress=self._calculate_progress(session),
            )

    def _find_next_node(self, session: DiagnosticSession, response: str) -> Optional[str]:
        """
        Find the next node based on current node and learner's response.

        Uses the decision tree edges to navigate.

        Args:
            session: Current session
            response: Option selected by learner (e.g., "A")

        Returns:
            Next node ID or None if terminal
        """
        form = self.db.query(DiagnosticForm).filter(DiagnosticForm.form_id == session.form_id).first()
        decision_tree = form.decision_tree

        # Find matching edge
        edges = decision_tree.get("edges", [])
        matching_edge = next(
            (
                edge
                for edge in edges
                if edge["from_node_id"] == session.current_node_id and edge["option_selected"] == response
            ),
            None,
        )

        if matching_edge:
            return matching_edge.get("to_node_id")  # May be None (terminal)
        else:
            # No matching edge - shouldn't happen with valid responses
            return None

    # ========================================================================
    # Misconception Tracking
    # ========================================================================

    def _update_misconception_confidence(self, session: DiagnosticSession, response: str) -> None:
        """
        Update misconception confidence scores based on learner's response.

        Args:
            session: Current session
            response: Option selected by learner
        """
        form = self.db.query(DiagnosticForm).filter(DiagnosticForm.form_id == session.form_id).first()
        decision_tree = form.decision_tree

        # Find edge for this response
        edges = decision_tree.get("edges", [])
        matching_edge = next(
            (
                edge
                for edge in edges
                if edge["from_node_id"] == session.current_node_id and edge["option_selected"] == response
            ),
            None,
        )

        if not matching_edge:
            return

        misconception_tag = matching_edge.get("misconception_tag")
        confidence_delta = matching_edge.get("confidence_delta", 0.0)

        if misconception_tag and confidence_delta != 0.0:
            # Update confidence
            current_confidence = session.suspected_misconceptions.get(misconception_tag, 0.0)
            new_confidence = max(0.0, min(1.0, current_confidence + confidence_delta))

            session.suspected_misconceptions[misconception_tag] = new_confidence

            # Confirm if confidence exceeds threshold
            if new_confidence >= 0.85 and misconception_tag not in session.confirmed_misconceptions:
                session.confirmed_misconceptions.append(misconception_tag)

    # ========================================================================
    # Terminal Conditions
    # ========================================================================

    def _check_terminal(self, session: DiagnosticSession, next_node_id: Optional[str]) -> bool:
        """
        Determine if session should end.

        Terminal conditions:
        1. next_node_id is None (reached end of decision tree)
        2. High confidence in diagnosis (>=0.9 for any misconception)
        3. Maximum depth reached
        4. Timeout (optional)

        Args:
            session: Current session
            next_node_id: Next node to navigate to (or None)

        Returns:
            True if session should terminate
        """
        # Condition 1: No next node
        if next_node_id is None:
            return True

        # Condition 2: High confidence diagnosis
        if any(conf >= 0.9 for conf in session.suspected_misconceptions.values()):
            return True

        # Condition 3: Maximum depth
        form = self.db.query(DiagnosticForm).filter(DiagnosticForm.form_id == session.form_id).first()
        if len(session.visited_nodes) >= form.max_depth + 1:  # +1 for root
            return True

        return False

    # ========================================================================
    # Result Generation
    # ========================================================================

    def _generate_result(self, session: DiagnosticSession) -> DiagnosticResultSchema:
        """
        Generate final diagnostic result from session evidence.

        Args:
            session: Completed diagnostic session

        Returns:
            Diagnostic result with findings and recommendations
        """
        # Identify primary misconception (highest confidence)
        primary_misconception = None
        if session.suspected_misconceptions:
            primary_misconception = max(
                session.suspected_misconceptions.items(), key=lambda x: x[1]
            )[0]

        # Determine severity
        severity = self._determine_severity(session.suspected_misconceptions, session.confirmed_misconceptions)

        # Generate teacher summary
        teacher_summary = self._generate_teacher_summary(
            session, primary_misconception, severity
        )

        # Generate learner feedback
        learner_feedback = self._generate_learner_feedback(session, primary_misconception)

        # Recommend interventions
        recommended_interventions = self._recommend_interventions(session.confirmed_misconceptions)

        # Extract key evidence
        key_evidence = self._extract_key_evidence(session)

        # Calculate confidence score
        confidence_score = self._calculate_confidence_score(session)

        # Create result
        result = DiagnosticResultSchema(
            session_id=session.session_id,
            learner_id=session.learner_id,
            form_id=session.form_id,
            primary_misconception=primary_misconception,
            all_misconceptions=session.suspected_misconceptions,
            severity=severity,
            response_path=session.visited_nodes,
            key_evidence=key_evidence,
            recommended_interventions=recommended_interventions,
            teacher_summary=teacher_summary,
            learner_feedback=learner_feedback,
            total_time_seconds=int((datetime.utcnow() - session.started_at).total_seconds()),
            confidence_score=confidence_score,
        )

        # Save result to database
        db_result = DiagnosticResult(
            session_id=session.session_id,
            learner_id=session.learner_id,
            form_id=session.form_id,
            primary_misconception=primary_misconception,
            all_misconceptions=session.suspected_misconceptions,
            severity=severity.value,
            response_path=session.visited_nodes,
            key_evidence=key_evidence,
            recommended_interventions=recommended_interventions,
            teacher_summary=teacher_summary,
            learner_feedback=learner_feedback,
            total_time_seconds=result.total_time_seconds,
            confidence_score=confidence_score,
        )

        self.db.add(db_result)
        self.db.commit()

        return result

    def _determine_severity(
        self, suspected: Dict[str, float], confirmed: List[str]
    ) -> MisconceptionSeverity:
        """
        Determine overall severity of identified misconceptions.

        Args:
            suspected: Dict of misconception_tag → confidence
            confirmed: List of confirmed misconception tags

        Returns:
            Severity level
        """
        if not suspected:
            return MisconceptionSeverity.LOW

        # Query database for severity of confirmed misconceptions
        if confirmed:
            misconceptions = (
                self.db.query(Misconception)
                .filter(Misconception.id.in_(confirmed))
                .all()
            )

            severities = [m.severity for m in misconceptions]

            if any(s.value == "critical" for s in severities):
                return MisconceptionSeverity.CRITICAL
            elif any(s.value == "high" for s in severities):
                return MisconceptionSeverity.HIGH
            elif any(s.value == "medium" for s in severities):
                return MisconceptionSeverity.MEDIUM

        # If only suspected (not confirmed), downgrade by one level
        max_confidence = max(suspected.values())
        if max_confidence >= 0.7:
            return MisconceptionSeverity.MEDIUM
        else:
            return MisconceptionSeverity.LOW

    def _generate_teacher_summary(
        self, session: DiagnosticSession, primary_misconception: Optional[str], severity: MisconceptionSeverity
    ) -> str:
        """Generate plain-language summary for teacher."""
        if not primary_misconception:
            return "Learner demonstrated mastery of this objective. No significant misconceptions detected."

        # Fetch misconception details
        misc = self.db.query(Misconception).filter(Misconception.id == primary_misconception).first()

        if not misc:
            return f"Learner shows difficulty with this concept (confidence: {session.suspected_misconceptions.get(primary_misconception, 0):.0%})."

        summary = f"**Primary Misconception Detected**: {misc.name}\n\n"
        summary += f"**Severity**: {severity.value.upper()}\n\n"
        summary += f"**Description**: {misc.description}\n\n"
        summary += f"**Confidence**: {session.suspected_misconceptions.get(primary_misconception, 0):.0%}\n\n"

        if len(session.confirmed_misconceptions) > 1:
            summary += f"**Additional Concerns**: {len(session.confirmed_misconceptions) - 1} other misconceptions detected.\n\n"

        summary += "**Recommended Action**: Assign targeted micro-intervention focusing on this misconception."

        return summary

    def _generate_learner_feedback(self, session: DiagnosticSession, primary_misconception: Optional[str]) -> str:
        """Generate encouraging, growth-oriented feedback for learner."""
        if not primary_misconception:
            return "Great work! You've shown a strong understanding of this topic. Keep up the excellent effort!"

        misc = self.db.query(Misconception).filter(Misconception.id == primary_misconception).first()

        # Generate encouraging, child-friendly feedback
        if not session.confirmed_misconceptions:
            feedback = "🌟 Great job completing the assessment! You're showing strong understanding. "
            feedback += "Your teacher will review your work and help you keep growing your math skills. "
            feedback += "Keep up the awesome work!"
        else:
            feedback = "🌟 Awesome work completing the assessment! You did a great job. "
            feedback += "We noticed a few areas where some extra practice will help you become even better. "
            feedback += "Your teacher will work with you on fun activities to help these concepts click. "
            feedback += "Every mathematician learns by practicing - you're doing great!"

        return feedback

    def _recommend_interventions(self, confirmed_misconceptions: List[str]) -> List[str]:
        """
        Recommend micro-interventions based on confirmed misconceptions.

        Args:
            confirmed_misconceptions: List of confirmed misconception tags

        Returns:
            List of intervention pathway IDs
        """
        # In future, this would query an interventions database
        # For now, return placeholder intervention IDs
        return [f"INTERVENTION-{tag}" for tag in confirmed_misconceptions]

    def _extract_key_evidence(self, session: DiagnosticSession) -> List[str]:
        """Extract most diagnostic responses as evidence."""
        # Return node IDs where high-confidence misconceptions were triggered
        evidence = []
        for node_id, response in session.responses.items():
            # Check if this response led to high confidence update
            # (simplified - in production, would track per-response confidence deltas)
            if session.suspected_misconceptions:
                evidence.append(f"{node_id}: selected {response}")

        return evidence[:3]  # Top 3 most telling responses

    def _calculate_confidence_score(self, session: DiagnosticSession) -> float:
        """
        Calculate overall confidence in the diagnosis.

        Based on:
        - Number of probes completed
        - Consistency of evidence
        - Confidence in primary misconception

        Args:
            session: Diagnostic session

        Returns:
            Confidence score (0.0 - 1.0)
        """
        if not session.suspected_misconceptions:
            return 1.0  # High confidence in "no misconceptions"

        # Base confidence on highest misconception confidence
        max_confidence = max(session.suspected_misconceptions.values())

        # Boost if multiple probes confirmed
        probe_count = len(session.visited_nodes) - 1  # Subtract root
        probe_boost = min(0.2, probe_count * 0.1)

        return min(1.0, max_confidence + probe_boost)

    # ========================================================================
    # Progress Tracking
    # ========================================================================

    def _calculate_progress(self, session: DiagnosticSession) -> Dict[str, Any]:
        """
        Calculate progress indicators for UI display.

        Args:
            session: Current session

        Returns:
            Progress dict with nodes visited, estimated completion, etc.
        """
        form = self.db.query(DiagnosticForm).filter(DiagnosticForm.form_id == session.form_id).first()

        nodes_visited = len(session.visited_nodes)
        max_nodes = form.max_depth + 1  # +1 for root

        return {
            "nodes_visited": nodes_visited,
            "max_nodes": max_nodes,
            "completion": nodes_visited / max_nodes,
            "path_description": f"Step {nodes_visited} of up to {max_nodes}",
        }

    # ========================================================================
    # Persistence
    # ========================================================================

    def _persist_result(self, session: DiagnosticSession, result: DiagnosticResultSchema) -> None:
        """Persist DiagnosticResult row for a completed session."""
        existing = (
            self.db.query(DiagnosticResult)
            .filter(DiagnosticResult.session_id == session.session_id)
            .first()
        )
        if existing:
            return

        # Map schema enum to model enum
        severity = (
            MisconceptionSeverityEnum(result.severity.value)
            if hasattr(result.severity, "value")
            else MisconceptionSeverityEnum(str(result.severity))
        )

        row = DiagnosticResult(
            session_id=result.session_id,
            learner_id=result.learner_id,
            form_id=result.form_id,
            primary_misconception=result.primary_misconception,
            all_misconceptions=result.all_misconceptions,
            severity=severity,
            response_path=result.response_path,
            key_evidence=result.key_evidence,
            recommended_interventions=result.recommended_interventions,
            teacher_summary=result.teacher_summary,
            learner_feedback=result.learner_feedback,
            completed_at=result.completed_at,
            total_time_seconds=result.total_time_seconds,
            confidence_score=result.confidence_score,
        )
        self.db.add(row)
        self.db.commit()

    # ========================================================================
    # Utilities
    # ========================================================================

    def _get_session(self, session_id: str) -> DiagnosticSession:
        """
        Fetch session from database.

        Args:
            session_id: Session ID

        Returns:
            DiagnosticSession

        Raises:
            ValueError: If session not found
        """
        session = self.db.query(DiagnosticSession).filter(DiagnosticSession.session_id == session_id).first()
        if not session:
            raise ValueError(f"Session {session_id} not found")
        return session

    def _generate_session_id(self) -> str:
        """Generate unique session ID."""
        import uuid
        return f"SESSION-{uuid.uuid4().hex[:16].upper()}"

    def _create_mock_diagnostic_form(self, form_id: str) -> DiagnosticForm:
        """
        Create diagnostic form from AI-generated questions in the database.

        Loads CAPS-compliant Grade 4 questions that were pre-generated by
        the AI question generator and builds an adaptive decision tree.

        Args:
            form_id: ID for the new form

        Returns:
            Created DiagnosticForm with AI questions
        """
        import json
        from datetime import datetime

        # Check if form already exists
        existing_form = self.db.query(DiagnosticForm).filter(DiagnosticForm.form_id == form_id).first()
        if existing_form:
            logger.info("Diagnostic form '%s' already exists, returning existing form", form_id)
            return existing_form

        # Load AI-generated questions from database
        ai_questions = (
            self.db.query(AIGeneratedQuestion)
            .filter(AIGeneratedQuestion.validated == True)  # noqa: E712
            .filter(AIGeneratedQuestion.grade_level == 4)
            .order_by(AIGeneratedQuestion.difficulty_level, AIGeneratedQuestion.item_id)
            .limit(3)  # Use first 3 questions for diagnostic
            .all()
        )

        if not ai_questions or len(ai_questions) < 3:
            raise ValueError(
                f"Not enough AI-generated questions in database. Found {len(ai_questions)}, need at least 3. "
                "Run scripts/generate_questions.py to generate questions."
            )

        logger.info(f"Loaded {len(ai_questions)} AI-generated questions for form {form_id}")

        # Build decision tree from AI questions
        nodes = {}
        edges = []

        for idx, q in enumerate(ai_questions):
            # Parse distractors JSON
            distractors_data = json.loads(q.distractors) if isinstance(q.distractors, str) else q.distractors

            # Get misconceptions for this question
            misconceptions = (
                self.db.query(AIGeneratedMisconception)
                .filter(AIGeneratedMisconception.question_id == q.id)
                .all()
            )

            # Build distractor list with misconception info
            distractors = []
            for dist in distractors_data:
                # Find matching misconception
                matching_misc = next(
                    (m for m in misconceptions if m.distractor_option == dist["option_id"]),
                    None
                )

                distractors.append({
                    "option_id": dist["option_id"],
                    "value": dist["value"],
                    "misconception_tag": matching_misc.misconception_tag if matching_misc else f"MISC-{idx}-{dist['option_id']}",
                    "rationale": dist.get("rationale", dist.get("misconception_tag", "Common error")),
                    "confidence_weight": dist.get("confidence_weight", 0.5)
                })

            # Create node
            nodes[q.item_id] = {
                "item_id": q.item_id,
                "type": "item",
                "stem": q.stem,
                "correct_answer": {
                    "option_id": q.correct_answer_option,
                    "value": q.correct_answer_value,
                    "reasoning": q.correct_answer_reasoning or "Correct CAPS method"
                },
                "distractors": distractors,
                "estimated_time_seconds": q.estimated_time_seconds or 45
            }

            # Create edges (adaptive routing)
            next_item_id = ai_questions[idx + 1].item_id if idx < len(ai_questions) - 1 else None

            # Correct answer edge
            edges.append({
                "from_node_id": q.item_id,
                "option_selected": q.correct_answer_option,
                "to_node_id": next_item_id,
                "misconception_tag": None,
                "confidence_delta": 0.0
            })

            # Distractor edges
            for dist in distractors:
                # Find matching misconception for confidence weight
                matching_misc = next((m for m in misconceptions if m.distractor_option == dist["option_id"]), None)

                edges.append({
                    "from_node_id": q.item_id,
                    "option_selected": dist["option_id"],
                    "to_node_id": next_item_id,
                    "misconception_tag": dist["misconception_tag"],
                    "confidence_delta": matching_misc.confidence_weight if matching_misc else dist.get("confidence_weight", 0.5)
                })

        decision_tree = {
            "nodes": nodes,
            "edges": edges
        }

        # Create and persist form
        root_item_id = ai_questions[0].item_id

        form = DiagnosticForm(
            form_id=form_id,
            title=f"Grade 4 Mathematics Diagnostic - AI-Generated (CAPS)",
            caps_objective_id=ai_questions[0].caps_objective or "CAPS-G4-NUM-01",
            grade_level=4,
            root_item_id=root_item_id,
            decision_tree=decision_tree,
            max_time_minutes=5,
            max_depth=len(ai_questions),
            validated=True,
            pilot_approved=True,
            version=1,
            created_at=datetime.utcnow()
        )

        self.db.add(form)
        self.db.commit()
        self.db.refresh(form)

        logger.info(f"Created AI-powered diagnostic form '{form_id}' with {len(ai_questions)} questions")
        return form
