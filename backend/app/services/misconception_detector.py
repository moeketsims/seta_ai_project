"""
Misconception Detector Service
AI-powered detection of mathematical misconceptions from learner errors.
Maps errors to CAPS taxonomy and provides targeted remediation strategies.
"""

import json
import logging
from typing import Dict, Any, Optional, List

from app.services.ai_service import get_ai_service, AIServiceError
from app.data.misconceptions_taxonomy import (
    get_all_misconceptions,
    get_misconceptions_by_grade,
    get_misconception_by_id,
    search_misconceptions
)

logger = logging.getLogger(__name__)


class MisconceptionDetector:
    """
    Service for detecting mathematical misconceptions using AI.
    Analyzes wrong answers to identify specific conceptual errors.
    """

    def __init__(self):
        self.ai_service = get_ai_service()
        self.taxonomy = get_all_misconceptions()

    def detect_from_answer(
        self,
        question_content: str,
        correct_answer: str,
        learner_answer: str,
        question_type: str,
        grade: Optional[int] = None,
        show_work: Optional[str] = None,
        topic: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Detect misconceptions from a wrong answer.

        Args:
            question_content: The question text
            correct_answer: The correct answer
            learner_answer: The learner's incorrect answer
            question_type: Type of question
            grade: Learner's grade level
            show_work: Optional work shown by learner
            topic: Optional mathematics topic/strand

        Returns:
            Dict with detected misconceptions and remediation suggestions
        """
        try:
            # Quick check: if answer is correct, no misconception
            if self._answers_match(correct_answer, learner_answer):
                return self._create_result(
                    detected=False,
                    message="Answer is correct, no misconception detected"
                )

            # Get relevant misconceptions for this grade
            relevant_misconceptions = []
            if grade:
                relevant_misconceptions = get_misconceptions_by_grade(grade)
            else:
                relevant_misconceptions = self.taxonomy

            # Use AI to analyze the error
            ai_analysis = self._analyze_error_with_ai(
                question_content=question_content,
                correct_answer=correct_answer,
                learner_answer=learner_answer,
                question_type=question_type,
                show_work=show_work,
                topic=topic,
                grade=grade
            )

            # Match AI analysis to taxonomy
            matched_misconception = self._match_to_taxonomy(
                ai_analysis=ai_analysis,
                relevant_misconceptions=relevant_misconceptions,
                grade=grade
            )

            if matched_misconception:
                return self._create_detailed_result(
                    detected=True,
                    misconception=matched_misconception,
                    ai_analysis=ai_analysis,
                    confidence=ai_analysis.get("confidence", 0.85)
                )
            else:
                # Misconception detected but not in taxonomy
                return self._create_result(
                    detected=True,
                    misconception_name=ai_analysis.get("misconception_name", "Unknown Error Pattern"),
                    description=ai_analysis.get("description", ""),
                    severity="MEDIUM",
                    confidence=ai_analysis.get("confidence", 0.70),
                    remediation=ai_analysis.get("remediation_suggestion", ""),
                    in_taxonomy=False,
                    ai_analysis=ai_analysis
                )

        except AIServiceError as e:
            logger.error(f"AI service error during misconception detection: {e}")
            return self._create_error_result(error=str(e))
        except Exception as e:
            logger.error(f"Unexpected error during misconception detection: {e}")
            return self._create_error_result(error=str(e))

    def _analyze_error_with_ai(
        self,
        question_content: str,
        correct_answer: str,
        learner_answer: str,
        question_type: str,
        show_work: Optional[str],
        topic: Optional[str],
        grade: Optional[int]
    ) -> Dict[str, Any]:
        """Use AI to analyze the error and identify potential misconception"""

        system_prompt = """You are an expert mathematics education researcher specializing in identifying mathematical misconceptions in South African CAPS curriculum.

Analyze the learner's error and identify the underlying misconception. Consider:
- What conceptual misunderstanding led to this error?
- Is this a procedural error or conceptual misunderstanding?
- What incorrect rule or belief might the learner hold?
- How does this error fit common misconception patterns?

Respond in JSON format:
{
    "misconception_detected": boolean,
    "misconception_name": "brief name for the misconception",
    "description": "detailed explanation of the misconception",
    "error_pattern": "what pattern suggests this misconception",
    "confidence": number (0-1, how confident are you),
    "category": "NUMBER_OPERATIONS|FRACTIONS|DECIMALS|ALGEBRA|GEOMETRY|MEASUREMENT|DATA",
    "severity": "LOW|MEDIUM|HIGH|CRITICAL",
    "remediation_suggestion": "specific teaching strategy to address this",
    "prerequisite_gaps": ["skills learner might be missing"],
    "alternative_explanations": ["other possible reasons for error"]
}"""

        user_prompt = f"""Question: {question_content}
Question Type: {question_type}
{f"Topic/Strand: {topic}" if topic else ""}
{f"Grade Level: {grade}" if grade else ""}

Correct Answer: {correct_answer}
Learner's Answer: {learner_answer}
{f"Work Shown:\n{show_work}" if show_work else "No work shown"}

Analyze this error and identify the underlying misconception."""

        messages = [
            self.ai_service.create_system_message(system_prompt),
            self.ai_service.create_user_message(user_prompt)
        ]

        result = self.ai_service.get_completion(
            messages=messages,
            json_mode=True,
            temperature=0.4,  # Moderate temperature for balanced analysis
            max_tokens=800
        )

        analysis = json.loads(result["content"])
        analysis["ai_cost"] = result["cost"]
        analysis["ai_usage"] = result["usage"]

        return analysis

    def _match_to_taxonomy(
        self,
        ai_analysis: Dict[str, Any],
        relevant_misconceptions: List[Dict[str, Any]],
        grade: Optional[int]
    ) -> Optional[Dict[str, Any]]:
        """
        Match AI-detected misconception to taxonomy.
        Uses fuzzy matching on name, description, and error patterns.
        """
        if not ai_analysis.get("misconception_detected"):
            return None

        ai_name = ai_analysis.get("misconception_name", "").lower()
        ai_description = ai_analysis.get("description", "").lower()
        ai_pattern = ai_analysis.get("error_pattern", "").lower()

        best_match = None
        best_score = 0.0

        for misc in relevant_misconceptions:
            score = 0.0

            # Match on name
            if any(word in misc["name"].lower() for word in ai_name.split()):
                score += 0.4

            # Match on description keywords
            desc_keywords = set(ai_description.split())
            tax_desc_keywords = set(misc["description"].lower().split())
            overlap = len(desc_keywords.intersection(tax_desc_keywords))
            if overlap > 3:
                score += 0.3

            # Match on category
            if ai_analysis.get("category") == misc["category"]:
                score += 0.2

            # Match on example errors
            for example in misc["example_errors"]:
                if any(word in example.lower() for word in ai_pattern.split()):
                    score += 0.1
                    break

            if score > best_score and score > 0.5:  # Threshold for match
                best_score = score
                best_match = misc

        return best_match

    def detect_class_patterns(
        self,
        learner_errors: List[Dict[str, Any]],
        grade: int
    ) -> Dict[str, Any]:
        """
        Analyze multiple learner errors to find class-wide misconception patterns.

        Args:
            learner_errors: List of dicts with question, answer, learner data
            grade: Class grade level

        Returns:
            Dict with class-wide misconception analysis
        """
        try:
            # Count misconception frequency
            misconception_counts = {}
            total_errors = len(learner_errors)

            for error in learner_errors:
                detection = self.detect_from_answer(
                    question_content=error.get("question_content"),
                    correct_answer=error.get("correct_answer"),
                    learner_answer=error.get("learner_answer"),
                    question_type=error.get("question_type", "numeric"),
                    grade=grade
                )

                if detection.get("detected"):
                    misc_id = detection.get("misconception_id")
                    if misc_id:
                        if misc_id not in misconception_counts:
                            misconception_counts[misc_id] = {
                                "misconception": detection.get("misconception"),
                                "count": 0,
                                "affected_learners": []
                            }
                        misconception_counts[misc_id]["count"] += 1
                        misconception_counts[misc_id]["affected_learners"].append(
                            error.get("learner_id")
                        )

            # Sort by frequency
            sorted_misconceptions = sorted(
                misconception_counts.items(),
                key=lambda x: x[1]["count"],
                reverse=True
            )

            # Calculate statistics
            top_misconceptions = []
            for misc_id, data in sorted_misconceptions[:5]:  # Top 5
                percentage = (data["count"] / total_errors * 100) if total_errors > 0 else 0
                top_misconceptions.append({
                    "misconception_id": misc_id,
                    "name": data["misconception"]["name"],
                    "count": data["count"],
                    "percentage": round(percentage, 1),
                    "severity": data["misconception"]["severity"],
                    "affected_learners": list(set(data["affected_learners"])),
                    "remediation_strategy": data["misconception"]["remediation_strategy"]
                })

            return {
                "total_errors_analyzed": total_errors,
                "unique_misconceptions": len(misconception_counts),
                "top_misconceptions": top_misconceptions,
                "grade": grade,
                "requires_intervention": any(
                    m["severity"] in ["HIGH", "CRITICAL"] and m["percentage"] > 30
                    for m in top_misconceptions
                )
            }

        except Exception as e:
            logger.error(f"Error detecting class patterns: {e}")
            return {
                "error": str(e),
                "total_errors_analyzed": 0
            }

    def _answers_match(self, correct: str, learner: str) -> bool:
        """Simple check if answers match (case-insensitive, whitespace-trimmed)"""
        return correct.strip().lower() == learner.strip().lower()

    def _create_result(
        self,
        detected: bool,
        misconception_name: Optional[str] = None,
        description: Optional[str] = None,
        severity: Optional[str] = None,
        confidence: float = 0.0,
        remediation: Optional[str] = None,
        in_taxonomy: bool = True,
        ai_analysis: Optional[Dict[str, Any]] = None,
        message: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create standardized misconception detection result"""
        return {
            "detected": detected,
            "misconception_name": misconception_name,
            "description": description,
            "severity": severity,
            "confidence": confidence,
            "in_taxonomy": in_taxonomy,
            "remediation_strategy": remediation,
            "ai_analysis": ai_analysis,
            "message": message
        }

    def _create_detailed_result(
        self,
        detected: bool,
        misconception: Dict[str, Any],
        ai_analysis: Dict[str, Any],
        confidence: float
    ) -> Dict[str, Any]:
        """Create detailed result with matched taxonomy misconception"""
        return {
            "detected": detected,
            "misconception_id": misconception["id"],
            "misconception": {
                "name": misconception["name"],
                "description": misconception["description"],
                "category": misconception["category"],
                "severity": misconception["severity"],
                "example_errors": misconception["example_errors"],
                "detection_patterns": misconception["detection_patterns"]
            },
            "confidence": confidence,
            "in_taxonomy": True,
            "remediation": {
                "strategy": misconception["remediation_strategy"],
                "prerequisite_skills": misconception["prerequisite_skills"],
                "estimated_time_weeks": misconception["estimated_remediation_time"]
            },
            "ai_analysis": {
                "error_pattern": ai_analysis.get("error_pattern"),
                "alternative_explanations": ai_analysis.get("alternative_explanations", []),
                "cost": ai_analysis.get("ai_cost"),
                "usage": ai_analysis.get("ai_usage")
            }
        }

    def _create_error_result(self, error: str) -> Dict[str, Any]:
        """Create error result"""
        return {
            "detected": False,
            "error": error,
            "message": "Misconception detection failed. Manual review recommended."
        }


# Singleton instance
_misconception_detector_instance: Optional[MisconceptionDetector] = None

def get_misconception_detector() -> MisconceptionDetector:
    """Get or create singleton MisconceptionDetector instance"""
    global _misconception_detector_instance

    if _misconception_detector_instance is None:
        _misconception_detector_instance = MisconceptionDetector()

    return _misconception_detector_instance
