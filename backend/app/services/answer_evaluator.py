"""
Answer Evaluator Service
AI-powered evaluation of learner answers with partial credit and detailed feedback.
"""

import json
import logging
from typing import Dict, Any, Optional, List
from enum import Enum

from app.services.ai_service import get_ai_service, AIServiceError

logger = logging.getLogger(__name__)


class QuestionType(str, Enum):
    """Types of questions that can be evaluated"""
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    NUMERIC = "numeric"
    WORD_PROBLEM = "word_problem"
    FILL_BLANK = "fill_blank"
    SHOW_WORK = "show_work"


class AnswerEvaluator:
    """
    Service for evaluating learner answers using AI.
    Provides intelligent grading with partial credit and detailed feedback.
    """

    def __init__(self):
        self.ai_service = get_ai_service()

    def evaluate_answer(
        self,
        question_content: str,
        correct_answer: str,
        learner_answer: str,
        question_type: str,
        max_score: int = 10,
        grade: Optional[int] = None,
        show_work: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Evaluate a learner's answer with AI.

        Args:
            question_content: The question text
            correct_answer: The correct answer(s)
            learner_answer: The learner's submitted answer
            question_type: Type of question (numeric, word_problem, etc.)
            max_score: Maximum possible score
            grade: Learner's grade level (for appropriate feedback)
            show_work: Optional work shown by learner
            context: Additional context for evaluation

        Returns:
            Dict with evaluation results including score, feedback, and analysis
        """
        try:
            # Handle simple cases without AI
            if not learner_answer or learner_answer.strip() == "":
                return self._create_result(
                    is_correct=False,
                    score=0,
                    max_score=max_score,
                    feedback="No answer provided.",
                    requires_attention=False
                )

            # Route to appropriate evaluation method
            if question_type == QuestionType.NUMERIC:
                return self._evaluate_numeric(
                    question_content, correct_answer, learner_answer,
                    max_score, grade, show_work
                )
            elif question_type in [QuestionType.WORD_PROBLEM, QuestionType.SHOW_WORK]:
                return self._evaluate_word_problem(
                    question_content, correct_answer, learner_answer,
                    max_score, grade, show_work
                )
            elif question_type == QuestionType.MULTIPLE_CHOICE:
                return self._evaluate_multiple_choice(
                    correct_answer, learner_answer, max_score
                )
            elif question_type == QuestionType.TRUE_FALSE:
                return self._evaluate_true_false(
                    correct_answer, learner_answer, max_score
                )
            else:
                # Default to AI evaluation
                return self._evaluate_with_ai(
                    question_content, correct_answer, learner_answer,
                    question_type, max_score, grade, show_work
                )

        except AIServiceError as e:
            logger.error(f"AI service error during evaluation: {e}")
            return self._create_error_result(
                max_score=max_score,
                error=f"AI evaluation failed: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error during evaluation: {e}")
            return self._create_error_result(
                max_score=max_score,
                error=f"Evaluation error: {str(e)}"
            )

    def _evaluate_numeric(
        self,
        question_content: str,
        correct_answer: str,
        learner_answer: str,
        max_score: int,
        grade: Optional[int],
        show_work: Optional[str]
    ) -> Dict[str, Any]:
        """Evaluate numeric answers with tolerance for equivalent forms"""

        # Build prompt for AI evaluation
        system_prompt = """You are an expert mathematics teacher evaluating learner answers.
For numeric answers, consider:
- Different equivalent forms (e.g., 1.25 = 5/4 = 1 1/4)
- Reasonable rounding
- Units and notation
- Common mistakes

Respond in JSON format with:
{
    "is_correct": boolean,
    "score": number (0 to max_score),
    "feedback": "specific feedback",
    "equivalent": boolean (if answer is mathematically equivalent),
    "error_type": "description of error if wrong" or null
}"""

        user_prompt = f"""Question: {question_content}

Correct Answer: {correct_answer}
Learner's Answer: {learner_answer}
{"Show Work: " + show_work if show_work else ""}
Max Score: {max_score}
Grade Level: {grade or "Unknown"}

Evaluate this numeric answer."""

        messages = [
            self.ai_service.create_system_message(system_prompt),
            self.ai_service.create_user_message(user_prompt)
        ]

        result = self.ai_service.get_completion(
            messages=messages,
            json_mode=True,
            temperature=0.3,  # Lower temperature for consistent grading
            max_tokens=500
        )

        evaluation = json.loads(result["content"])

        return self._create_result(
            is_correct=evaluation.get("is_correct", False),
            score=evaluation.get("score", 0),
            max_score=max_score,
            feedback=evaluation.get("feedback", ""),
            partial_credit=evaluation.get("score", 0) > 0 and not evaluation.get("is_correct"),
            equivalent_answer=evaluation.get("equivalent", False),
            error_type=evaluation.get("error_type"),
            ai_cost=result["cost"],
            ai_usage=result["usage"]
        )

    def _evaluate_word_problem(
        self,
        question_content: str,
        correct_answer: str,
        learner_answer: str,
        max_score: int,
        grade: Optional[int],
        show_work: Optional[str]
    ) -> Dict[str, Any]:
        """Evaluate word problems with focus on reasoning and methodology"""

        system_prompt = """You are an expert mathematics teacher evaluating word problem solutions.
Consider:
- Correct final answer
- Valid mathematical reasoning
- Appropriate methodology
- Partial credit for correct steps even if final answer is wrong
- Common misconceptions

Assign partial credit generously for correct reasoning.

Respond in JSON format:
{
    "is_correct": boolean,
    "score": number (0 to max_score),
    "feedback": "detailed, encouraging feedback",
    "methodology_correct": boolean,
    "final_answer_correct": boolean,
    "strengths": ["what they did well"],
    "improvements": ["what to work on"],
    "misconception_detected": "description" or null
}"""

        user_prompt = f"""Question: {question_content}

Correct Answer: {correct_answer}
Learner's Answer: {learner_answer}
{"Work Shown:\n" + show_work if show_work else ""}
Max Score: {max_score}
Grade Level: {grade or "Unknown"}

Evaluate this word problem solution. Be encouraging and specific."""

        messages = [
            self.ai_service.create_system_message(system_prompt),
            self.ai_service.create_user_message(user_prompt)
        ]

        result = self.ai_service.get_completion(
            messages=messages,
            json_mode=True,
            temperature=0.4,
            max_tokens=800
        )

        evaluation = json.loads(result["content"])

        return self._create_result(
            is_correct=evaluation.get("is_correct", False),
            score=evaluation.get("score", 0),
            max_score=max_score,
            feedback=evaluation.get("feedback", ""),
            partial_credit=evaluation.get("score", 0) > 0 and not evaluation.get("is_correct"),
            methodology_correct=evaluation.get("methodology_correct"),
            strengths=evaluation.get("strengths", []),
            improvements=evaluation.get("improvements", []),
            misconception=evaluation.get("misconception_detected"),
            ai_cost=result["cost"],
            ai_usage=result["usage"]
        )

    def _evaluate_multiple_choice(
        self,
        correct_answer: str,
        learner_answer: str,
        max_score: int
    ) -> Dict[str, Any]:
        """Simple exact match for multiple choice"""
        is_correct = learner_answer.strip().upper() == correct_answer.strip().upper()

        return self._create_result(
            is_correct=is_correct,
            score=max_score if is_correct else 0,
            max_score=max_score,
            feedback="Correct!" if is_correct else f"Incorrect. The correct answer is {correct_answer}.",
            requires_attention=False
        )

    def _evaluate_true_false(
        self,
        correct_answer: str,
        learner_answer: str,
        max_score: int
    ) -> Dict[str, Any]:
        """Simple exact match for true/false"""
        # Normalize answers
        correct = correct_answer.strip().lower()
        learner = learner_answer.strip().lower()

        # Handle variations
        true_variations = ["true", "t", "yes", "1", "correct"]
        false_variations = ["false", "f", "no", "0", "incorrect"]

        if correct in true_variations:
            is_correct = learner in true_variations
        elif correct in false_variations:
            is_correct = learner in false_variations
        else:
            is_correct = learner == correct

        return self._create_result(
            is_correct=is_correct,
            score=max_score if is_correct else 0,
            max_score=max_score,
            feedback="Correct!" if is_correct else f"Incorrect. The correct answer is {correct_answer}.",
            requires_attention=False
        )

    def _evaluate_with_ai(
        self,
        question_content: str,
        correct_answer: str,
        learner_answer: str,
        question_type: str,
        max_score: int,
        grade: Optional[int],
        show_work: Optional[str]
    ) -> Dict[str, Any]:
        """Generic AI evaluation for any question type"""

        system_prompt = """You are an expert mathematics teacher evaluating learner answers.
Be fair, encouraging, and specific in your feedback.

Respond in JSON format:
{
    "is_correct": boolean,
    "score": number (0 to max_score),
    "feedback": "specific, encouraging feedback"
}"""

        user_prompt = f"""Question: {question_content}
Question Type: {question_type}
Correct Answer: {correct_answer}
Learner's Answer: {learner_answer}
Max Score: {max_score}

Evaluate this answer."""

        messages = [
            self.ai_service.create_system_message(system_prompt),
            self.ai_service.create_user_message(user_prompt)
        ]

        result = self.ai_service.get_completion(
            messages=messages,
            json_mode=True,
            temperature=0.3,
            max_tokens=500
        )

        evaluation = json.loads(result["content"])

        return self._create_result(
            is_correct=evaluation.get("is_correct", False),
            score=evaluation.get("score", 0),
            max_score=max_score,
            feedback=evaluation.get("feedback", ""),
            ai_cost=result["cost"],
            ai_usage=result["usage"]
        )

    def _create_result(
        self,
        is_correct: bool,
        score: int,
        max_score: int,
        feedback: str,
        partial_credit: bool = False,
        equivalent_answer: bool = False,
        error_type: Optional[str] = None,
        methodology_correct: Optional[bool] = None,
        strengths: Optional[List[str]] = None,
        improvements: Optional[List[str]] = None,
        misconception: Optional[str] = None,
        requires_attention: bool = True,
        ai_cost: Optional[float] = None,
        ai_usage: Optional[Dict[str, int]] = None
    ) -> Dict[str, Any]:
        """Create standardized evaluation result"""
        return {
            "is_correct": is_correct,
            "score": score,
            "max_score": max_score,
            "percentage": (score / max_score * 100) if max_score > 0 else 0,
            "feedback": feedback,
            "partial_credit": partial_credit,
            "equivalent_answer": equivalent_answer,
            "error_type": error_type,
            "methodology_correct": methodology_correct,
            "strengths": strengths,
            "improvements": improvements,
            "misconception_detected": misconception,
            "requires_teacher_review": requires_attention and partial_credit,
            "ai_evaluation": {
                "used": ai_cost is not None,
                "cost": ai_cost,
                "usage": ai_usage
            }
        }

    def _create_error_result(self, max_score: int, error: str) -> Dict[str, Any]:
        """Create error result for failed evaluations"""
        return {
            "is_correct": False,
            "score": 0,
            "max_score": max_score,
            "percentage": 0,
            "feedback": "Evaluation could not be completed automatically. Requires manual grading.",
            "error": error,
            "requires_teacher_review": True,
            "ai_evaluation": {
                "used": False,
                "error": error
            }
        }


# Singleton instance
_answer_evaluator_instance: Optional[AnswerEvaluator] = None

def get_answer_evaluator() -> AnswerEvaluator:
    """Get or create singleton AnswerEvaluator instance"""
    global _answer_evaluator_instance

    if _answer_evaluator_instance is None:
        _answer_evaluator_instance = AnswerEvaluator()

    return _answer_evaluator_instance
