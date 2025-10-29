from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from app.integrations.openai_client import (
    OpenAIClient,
    OpenAIClientError,
    OpenAISettings,
    get_openai_client,
)
from app.schemas.diagnostic_schemas import (
    DiagnosticItemSchema,
    DiagnosticProbeSchema,
    DiagnosticFormSchema,
    DiagnosticDistractorSchema,
    DiagnosticCorrectAnswerSchema,
    DecisionEdgeSchema,
    GenerateDiagnosticFormRequest,
    GenerateDiagnosticFormResponse,
    MisconceptionSeverity,
    ProbeType,
    DOKLevel,
)
from app.models.diagnostic_models import Misconception


class DiagnosticGenerator:
    """
    Generates diagnostic assessment forms using AI.

    Each generated item has distractors mapped to specific misconceptions,
    enabling deep diagnostic inference from learner responses.
    """

    def __init__(
        self,
        db: Session,
        api_key: Optional[str] = None,
        client: Optional[OpenAIClient] = None,
    ):
        """
        Initialize generator with database session and AI client.

        Args:
            db: SQLAlchemy database session
            api_key: Optional OpenAI API key override
            client: Optional pre-configured OpenAI client
        """
        self.db = db
        if client is not None:
            self.client = client
        else:
            if api_key:
                base_settings = OpenAISettings.from_env()
                override = OpenAISettings(
                    api_key=api_key,
                    model=base_settings.model,
                    temperature=base_settings.temperature,
                    max_tokens=base_settings.max_tokens,
                )
                self.client = OpenAIClient(settings=override)
            else:
                self.client = get_openai_client()

        self.model = self.client.settings.model

    # ========================================================================
    # Main Generation Pipeline
    # ========================================================================

    def generate_diagnostic_form(
        self, request: GenerateDiagnosticFormRequest
    ) -> GenerateDiagnosticFormResponse:
        """
        Generate a complete diagnostic form from CAPS objective.

        Pipeline:
        1. Create blueprint (spec + misconceptions)
        2. Generate root item
        3. Generate probes for key distractors
        4. Build decision tree
        5. Validate entire form

        Args:
            request: Form generation request

        Returns:
            Generated and validated diagnostic form
        """
        # Step 1: Blueprint
        blueprint = self._create_blueprint(request)

        # Step 2: Generate root item
        root_item = self._generate_root_item(blueprint)

        # Step 3: Generate probes for top misconceptions
        probes = self._generate_probes(root_item, blueprint, max_probes=request.max_items - 1)

        # Step 4: Build decision tree edges
        edges = self._build_decision_edges(root_item, probes)

        # Step 5: Assemble form
        form = DiagnosticFormSchema(
            form_id=self._generate_form_id(request),
            title=self._generate_title(request),
            caps_objective_id=request.caps_objective_id,
            grade_level=request.grade_level,
            root_item_id=root_item.item_id,
            items=[root_item],
            probes=probes,
            edges=edges,
            max_time_minutes=request.max_time_minutes,
            max_depth=min(3, len(probes)),
        )

        # Step 6: Final validation
        warnings = self._validate_form(form)

        return GenerateDiagnosticFormResponse(
            form=form,
            generation_metadata={
                "blueprint": blueprint,
                "generation_timestamp": datetime.utcnow().isoformat(),
                "model": self.model,
            },
            warnings=warnings,
        )

    # ========================================================================
    # Step 1: Blueprint Creation
    # ========================================================================

    def _create_blueprint(self, request: GenerateDiagnosticFormRequest) -> Dict[str, Any]:
        """
        Create assessment blueprint: what to assess and which misconceptions to target.

        Args:
            request: Generation request

        Returns:
            Blueprint dict with CAPS details, misconceptions, constraints
        """
        # Fetch relevant misconceptions from database
        misconceptions = self._fetch_misconceptions(
            content_area=request.content_area,
            grade_level=request.grade_level,
            focus_tags=request.focus_misconceptions,
        )

        blueprint = {
            "caps_objective_id": request.caps_objective_id,
            "grade_level": request.grade_level,
            "content_area": request.content_area,
            "target_misconceptions": misconceptions[:5],  # Top 5
            "constraints": {
                "max_time_minutes": request.max_time_minutes,
                "include_visuals": request.include_visuals,
                "reading_level_max": request.reading_level_max,
                "avoid_contexts": request.avoid_contexts or [],
            },
            "dok_level": DOKLevel.SKILL_CONCEPT,  # Default, can be inferred from objective
        }

        return blueprint

    def _fetch_misconceptions(
        self,
        content_area: str,
        grade_level: int,
        focus_tags: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Fetch relevant misconceptions from database.

        Args:
            content_area: CAPS content area (e.g., "Numbers.Operations.Fractions")
            grade_level: Target grade
            focus_tags: Optional specific misconception tags to prioritize

        Returns:
            List of misconception dicts
        """
        # Pull all misconceptions once and filter in Python to support legacy schema
        records: List[Misconception] = self.db.query(Misconception).all()

        def severity_value(m: Misconception) -> str:
            severity = getattr(m, "severity", None)
            if severity is None:
                return "medium"
            return getattr(severity, "value", str(severity)) or "medium"

        def matches_focus(m: Misconception) -> bool:
            if not focus_tags:
                return False
            identifier = getattr(m, "id", None) or getattr(m, "tag", None)
            return identifier in focus_tags

        def matches_content(m: Misconception) -> bool:
            category = (getattr(m, "category", "") or "").lower()
            topic = content_area.split(".")[-1].lower()
            return topic in category if category else True

        # Prioritize focus tags if provided
        prioritized = [m for m in records if matches_focus(m)] if focus_tags else []

        remaining = [m for m in records if m not in prioritized and matches_content(m)]

        ordered = sorted(prioritized, key=severity_value, reverse=True) + sorted(
            remaining, key=severity_value, reverse=True
        )

        misconceptions = ordered[:5]

        result: List[Dict[str, Any]] = []
        for m in misconceptions:
            identifier = getattr(m, "id", None) or getattr(m, "tag", None) or "MISC-UNKNOWN"
            evidence = getattr(m, "weekly_occurrences", None) or []
            if not evidence and getattr(m, "description", None):
                evidence = [getattr(m, "description")]

            result.append(
                {
                    "tag": identifier,
                    "name": getattr(m, "name", identifier),
                    "description": getattr(m, "description", ""),
                    "severity": severity_value(m),
                    "evidence_patterns": evidence,
                }
            )

        return result

    # ========================================================================
    # Step 2: Root Item Generation
    # ========================================================================

    def _generate_root_item(self, blueprint: Dict[str, Any]) -> DiagnosticItemSchema:
        """
        Generate the root diagnostic item using OpenAI Chat Completions.

        Args:
            blueprint: Assessment blueprint

        Returns:
            Validated diagnostic item with misconception-mapped distractors
        """
        prompt = self._build_root_item_prompt(blueprint)

        try:
            item_json = self.client.json_completion(
                system_prompt=self._get_system_prompt(),
                user_prompt=prompt,
                max_tokens=1200,
            )
        except OpenAIClientError as exc:
            raise ValueError(f"Failed to generate diagnostic root item: {exc}") from exc

        # Convert to schema
        item = DiagnosticItemSchema(**item_json)

        # Generate unique ID
        item.item_id = f"ITEM-{blueprint['caps_objective_id']}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        return item

    def _build_root_item_prompt(self, blueprint: Dict[str, Any]) -> str:
        """Build the prompt for generating the root diagnostic item."""
        misconceptions_text = "\n".join(
            [
                f"- **{m['tag']}**: {m['name']}\n  Description: {m['description']}\n  Evidence: {', '.join(m['evidence_patterns'][:2])}"
                for m in blueprint["target_misconceptions"]
            ]
        )

        constraints_text = ""
        if blueprint["constraints"]["avoid_contexts"]:
            constraints_text += f"\n- Avoid contexts: {', '.join(blueprint['constraints']['avoid_contexts'])}"
        if blueprint["constraints"]["reading_level_max"]:
            constraints_text += f"\n- Maximum reading level: Grade {blueprint['constraints']['reading_level_max']}"

        prompt = f"""
Generate a diagnostic mathematics assessment item for the South African CAPS curriculum.

**CAPS Context:**
- Objective: {blueprint['caps_objective_id']}
- Grade Level: {blueprint['grade_level']}
- Content Area: {blueprint['content_area']}
- Depth of Knowledge: {blueprint['dok_level'].value}

**Target Misconceptions:**
{misconceptions_text}

**Requirements:**
1. Create a clear, unambiguous question stem appropriate for Grade {blueprint['grade_level']}
2. Generate ONE correct answer with detailed reasoning
3. Generate 3-4 DIAGNOSTIC distractors where EACH distractor:
   - Is designed to be selected by learners with a SPECIFIC misconception from the list above
   - Maps to exactly ONE misconception tag
   - Has a clear rationale explaining why a learner with that misconception would choose it
   - Includes "evidence_suggests" text describing what this choice reveals about thinking
4. Ensure all distractors are plausible (not obviously wrong)
5. Use South African contexts where appropriate (but not required)
{constraints_text}

**Output Format:**
Return ONLY valid JSON matching this structure (no markdown, no explanation):

{{
  "caps_objective_id": "{blueprint['caps_objective_id']}",
  "grade_level": {blueprint['grade_level']},
  "content_area": "{blueprint['content_area']}",
  "stem": "Clear question text here...",
  "context": "Optional real-world scenario (null if not needed)",
  "visual_aid_url": null,
  "dok_level": "{blueprint['dok_level'].value}",
  "estimated_time_seconds": 60,
  "reading_level": {blueprint['grade_level']},
  "correct_answer": {{
    "option_id": "A",
    "value": "The correct answer value",
    "reasoning": "Step-by-step correct reasoning process",
    "mastery_evidence": "What this reveals about learner's understanding"
  }},
  "distractors": [
    {{
      "option_id": "B",
      "value": "Distractor value",
      "misconception_tag": "MISC-XXX-NNN",
      "rationale": "Why learner with this misconception would choose this",
      "evidence_suggests": "What this choice reveals about their thinking",
      "confidence_weight": 0.8,
      "next_probe_id": null,
      "teacher_note": "Brief intervention guidance"
    }}
  ]
}}

**Critical:** Each distractor MUST map to a misconception from the target list above. Do not invent new misconceptions.
"""

        return prompt

    def _get_system_prompt(self) -> str:
        """System prompt defining the diagnostic generation task."""
        return """You are an expert mathematics educator and assessment designer specializing in diagnostic assessment for the South African CAPS curriculum.

Your task is to generate diagnostic assessment items where EVERY incorrect answer option (distractor) is deliberately designed to diagnose a SPECIFIC mathematical misconception.

Key principles:
1. **Diagnostic Distractors**: Each wrong answer must target a known misconception, not just be "plausible but wrong"
2. **Evidence-Based**: Each distractor reveals specific thinking patterns
3. **CAPS-Aligned**: Questions must match South African curriculum objectives
4. **Clear and Unambiguous**: No trick questions; learners should fail due to misconceptions, not confusing wording
5. **Grade-Appropriate**: Language, context, and cognitive demand must match grade level

You will be provided with:
- A CAPS objective to assess
- A list of known misconceptions to target
- Constraints (time, reading level, contexts to avoid)

Generate items that allow teachers to quickly identify the ROOT CAUSE of learner errors, not just that they got it wrong."""

    # ========================================================================
    # Step 3: Probe Generation
    # ========================================================================

    def _generate_probes(
        self,
        root_item: DiagnosticItemSchema,
        blueprint: Dict[str, Any],
        max_probes: int = 3,
    ) -> List[DiagnosticProbeSchema]:
        """
        Generate follow-up probes for the most important misconceptions.

        Args:
            root_item: The root diagnostic item
            blueprint: Assessment blueprint
            max_probes: Maximum number of probes to generate

        Returns:
            List of diagnostic probes
        """
        probes = []

        # Identify top misconceptions to probe (from distractors with highest confidence)
        distractor_misconceptions = sorted(
            [
                (d["misconception_tag"], d["confidence_weight"])
                for d in root_item.distractors
            ],
            key=lambda x: x[1],
            reverse=True,
        )[:max_probes]

        for misconception_tag, _ in distractor_misconceptions:
            # Find full misconception details
            misconception_details = next(
                (m for m in blueprint["target_misconceptions"] if m["tag"] == misconception_tag),
                None,
            )

            if misconception_details:
                probe = self._generate_single_probe(
                    root_item=root_item,
                    misconception=misconception_details,
                    blueprint=blueprint,
                )
                probes.append(probe)

        return probes

    def _generate_single_probe(
        self,
        root_item: DiagnosticItemSchema,
        misconception: Dict[str, Any],
        blueprint: Dict[str, Any],
    ) -> DiagnosticProbeSchema:
        """
        Generate a single probe for a specific misconception.

        Args:
            root_item: Parent diagnostic item
            misconception: Misconception to probe
            blueprint: Assessment blueprint

        Returns:
            Diagnostic probe
        """
        prompt = f"""
Generate a follow-up PROBE item to confirm/refute the misconception: **{misconception['tag']}** - {misconception['name']}.

**Context:**
The learner just answered this root item and selected a distractor suggesting they have this misconception:

Root Item Stem: {root_item.stem}

Misconception: {misconception['description']}

**Task:**
Create an ERROR MODEL PROBE: present the SAME flawed rule in a NEW context. If the learner applies the same misconception, they'll get it wrong again.

**Requirements:**
1. New context/numbers, but tests the same underlying concept
2. If they have the misconception, they should confidently choose a specific wrong answer
3. If they DON'T have the misconception, correct answer should be clear
4. Keep it quick (30-45 seconds)
5. 2-3 distractors total (one targeting the misconception, others less important)

**Output Format (JSON only):**
{{
  "probe_id": "PROBE-{misconception['tag']}-{root_item.item_id[-6:]}",
  "probe_type": "error_model_probe",
  "parent_item_id": "{root_item.item_id}",
  "misconception_tag": "{misconception['tag']}",
  "stem": "New question that would trigger same misconception...",
  "context": null,
  "visual_aid_url": null,
  "dok_level": "skill_concept",
  "estimated_time_seconds": 45,
  "reading_level": {root_item.reading_level or root_item.grade_level},
  "correct_answer": {{
    "option_id": "A",
    "value": "Correct value",
    "reasoning": "Correct reasoning",
    "mastery_evidence": "Shows they don't have the misconception"
  }},
  "distractors": [
    {{
      "option_id": "B",
      "value": "Value that misconception would produce",
      "misconception_tag": "{misconception['tag']}",
      "rationale": "Applying the flawed rule leads to this answer",
      "evidence_suggests": "Confirms the misconception is present",
      "confidence_weight": 0.9,
      "next_probe_id": null,
      "teacher_note": "Strong evidence of misconception - assign intervention"
    }}
  ],
  "confirms_misconception": true,
  "scaffolding_hint": null,
  "micro_intervention_id": null
}}
"""

        try:
            probe_json = self.client.json_completion(
                system_prompt=self._get_system_prompt(),
                user_prompt=prompt,
                max_tokens=800,
            )
        except OpenAIClientError as exc:
            raise ValueError(
                f"Failed to generate diagnostic probe for {misconception['tag']}: {exc}"
            ) from exc

        return DiagnosticProbeSchema(**probe_json)

    # ========================================================================
    # Step 4: Decision Tree Construction
    # ========================================================================

    def _build_decision_edges(
        self,
        root_item: DiagnosticItemSchema,
        probes: List[DiagnosticProbeSchema],
    ) -> List[DecisionEdgeSchema]:
        """
        Build decision tree edges mapping (node, response) → next_node.

        Args:
            root_item: Root diagnostic item
            probes: List of follow-up probes

        Returns:
            List of decision edges
        """
        edges = []

        # Map each root distractor to its probe (if exists)
        for distractor in root_item.distractors:
            # Find probe for this misconception
            probe = next(
                (p for p in probes if p.misconception_tag == distractor.misconception_tag),
                None,
            )

            edge = DecisionEdgeSchema(
                from_node_id=root_item.item_id,
                option_selected=distractor.option_id,
                to_node_id=probe.probe_id if probe else None,
                misconception_tag=distractor.misconception_tag,
                confidence_delta=distractor.confidence_weight,
            )
            edges.append(edge)

        # Correct answer edge (terminal)
        edges.append(
            DecisionEdgeSchema(
                from_node_id=root_item.item_id,
                option_selected=root_item.correct_answer.option_id,
                to_node_id=None,  # Terminal
                misconception_tag=None,
                confidence_delta=0.0,
            )
        )

        # Probe edges (all terminal for now - could extend to depth 3)
        for probe in probes:
            # Correct answer on probe → learner doesn't have misconception
            edges.append(
                DecisionEdgeSchema(
                    from_node_id=probe.probe_id,
                    option_selected=probe.correct_answer.option_id,
                    to_node_id=None,
                    misconception_tag=probe.misconception_tag,
                    confidence_delta=-0.5,  # Reduce confidence in misconception
                )
            )

            # Wrong answers on probe → confirms misconception
            for distractor in probe.distractors:
                edges.append(
                    DecisionEdgeSchema(
                        from_node_id=probe.probe_id,
                        option_selected=distractor.option_id,
                        to_node_id=None,
                        misconception_tag=probe.misconception_tag,
                        confidence_delta=0.9,  # High confidence confirmation
                    )
                )

        return edges

    # ========================================================================
    # Step 5: Validation
    # ========================================================================

    def _validate_form(self, form: DiagnosticFormSchema) -> List[str]:
        """
        Validate the entire diagnostic form for quality and correctness.

        Args:
            form: Generated diagnostic form

        Returns:
            List of warnings (empty if perfect)
        """
        warnings = []

        # Check 1: All misconception tags exist in database
        all_tags = set()
        for item in form.items:
            all_tags.update(d.misconception_tag for d in item.distractors)
        for probe in form.probes:
            all_tags.add(probe.misconception_tag)

        db_tags = set(
            tag[0]
            for tag in self.db.query(Misconception.tag).filter(Misconception.tag.in_(all_tags)).all()
        )

        missing_tags = all_tags - db_tags
        if missing_tags:
            warnings.append(f"Misconception tags not in database: {missing_tags}")

        # Check 2: Estimated time doesn't exceed max
        total_time = sum(item.estimated_time_seconds for item in form.items) + sum(
            p.estimated_time_seconds for p in form.probes
        )
        if total_time > form.max_time_minutes * 60:
            warnings.append(f"Estimated total time ({total_time}s) exceeds max ({form.max_time_minutes}min)")

        # Check 3: All edges reference valid nodes
        all_node_ids = {form.root_item_id} | {item.item_id for item in form.items} | {p.probe_id for p in form.probes}
        for edge in form.edges:
            if edge.from_node_id not in all_node_ids:
                warnings.append(f"Edge references invalid from_node: {edge.from_node_id}")
            if edge.to_node_id and edge.to_node_id not in all_node_ids:
                warnings.append(f"Edge references invalid to_node: {edge.to_node_id}")

        return warnings

    # ========================================================================
    # Utilities
    # ========================================================================

    def _generate_form_id(self, request: GenerateDiagnosticFormRequest) -> str:
        """Generate unique form ID."""
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        objective_short = request.caps_objective_id.replace(".", "-")[:20]
        return f"FORM-{objective_short}-G{request.grade_level}-{timestamp}"

    def _generate_title(self, request: GenerateDiagnosticFormRequest) -> str:
        """Generate human-readable form title."""
        return f"Grade {request.grade_level} Diagnostic: {request.content_area}"
