"""
Diagnostic Router Service.

Manages adaptive navigation through diagnostic assessment decision trees.
Routes learners to the next item/probe based on their responses and maintains
diagnostic state (suspected/confirmed misconceptions).
"""

from typing import Dict, Any, Optional, Tuple, List
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.diagnostic_models import (
    DiagnosticSession,
    DiagnosticResult,
    DiagnosticForm,
    Misconception,
    MisconceptionSeverityEnum,
)
from app.schemas.diagnostic_schemas import (
    DiagnosticSessionStateSchema,
    DiagnosticResultSchema,
    NextNodeRequest,
    NextNodeResponse,
    MisconceptionSeverity,
)


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
        if not form:
            raise ValueError(f"Diagnostic form {form_id} not found")

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
        )

    def get_current_node(self, session_id: str) -> Dict[str, Any]:
        """
        Get the current item/probe for a session.

        Args:
            session_id: Session ID

        Returns:
            Current node (item or probe) as dict

        Raises:
            ValueError: If session not found
        """
        session = self._get_session(session_id)
        form = self.db.query(DiagnosticForm).filter(DiagnosticForm.form_id == session.form_id).first()

        # Find current node in form's decision tree
        decision_tree = form.decision_tree  # JSON containing all nodes

        current_node = decision_tree.get("nodes", {}).get(session.current_node_id)
        if not current_node:
            raise ValueError(f"Current node {session.current_node_id} not found in decision tree")

        return current_node

    # ========================================================================
    # Navigation
    # ========================================================================

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
                .filter(Misconception.tag.in_(confirmed))
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
        misc = self.db.query(Misconception).filter(Misconception.tag == primary_misconception).first()

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

        misc = self.db.query(Misconception).filter(Misconception.tag == primary_misconception).first()

        feedback = "Thank you for completing this diagnostic assessment. "
        feedback += "Your teacher will review your results and provide personalized support to help you master this concept. "
        feedback += "\n\nRemember: Making mistakes is an important part of learning! "
        feedback += "We've identified some areas where extra practice will help you build confidence."

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
