"""
AI Diagnostic Analyzer Service
Provides deep diagnostic reasoning about learner errors, identifies root causes,
and generates personalized intervention strategies.

This service answers: "WHY did the learner make this mistake and HOW do we fix it?"
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
from app.services.ai_service import get_ai_service
from app.data.misconceptions_taxonomy import MISCONCEPTIONS_TAXONOMY

logger = logging.getLogger(__name__)


class DiagnosticAnalyzer:
    """
    AI-powered diagnostic analyzer that thinks like a great teacher:
    1. Observes the error pattern
    2. Hypothesizes about the underlying misconception
    3. Identifies prerequisite skill gaps
    4. Recommends targeted interventions
    5. Predicts success likelihood
    """

    def __init__(self):
        self.ai_service = get_ai_service()

    def diagnose_learner_error(
        self,
        question_content: str,
        correct_answer: str,
        learner_answer: str,
        question_type: str,
        grade: int,
        topic: str,
        show_work: Optional[str] = None,
        learner_history: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """
        Comprehensive diagnostic analysis of a learner's error.

        Returns a diagnostic report with:
        - Root cause hypothesis
        - Misconception identification
        - Prerequisite gaps
        - Intervention strategies
        - Success predictions
        """

        # Build diagnostic prompt
        system_prompt = """You are an expert diagnostic mathematics teacher analyzing a South African learner's error using the CAPS curriculum.

Your goal: Understand WHY the learner made this mistake (not just that it's wrong) and HOW to help them.

Analyze following the diagnostic process:
1. ERROR PATTERN: What specific mistake did they make?
2. REASONING HYPOTHESIS: What might they be thinking? What's their flawed logic?
3. MISCONCEPTION: Which mathematical misconception is this?
4. PREREQUISITE GAPS: What foundational skills might they be missing?
5. ROOT CAUSE: Is this conceptual confusion, procedural error, or missing foundation?
6. INTERVENTION: What specific teaching approach will address this?

Respond in JSON format with diagnostic_reasoning that a teacher can understand and act on."""

        user_prompt = f"""DIAGNOSTIC ASSESSMENT:

Question: {question_content}
Correct Answer: {correct_answer}
Learner's Answer: {learner_answer}
Grade: {grade}
Topic: {topic}
Question Type: {question_type}
{f"Show Work: {show_work}" if show_work else ""}

{self._format_learner_history(learner_history) if learner_history else ""}

Provide a comprehensive diagnostic analysis in JSON:
{{
  "error_pattern": "Specific mistake observed",
  "learner_reasoning_hypothesis": "What the learner might be thinking",
  "misconception_identified": {{
    "name": "Name of misconception",
    "description": "Clear explanation",
    "severity": "HIGH|MEDIUM|LOW",
    "confidence": 0.85
  }},
  "prerequisite_gaps": [
    {{"skill": "Skill name", "importance": "HIGH|MEDIUM|LOW", "CAPS_strand": "Strand name"}}
  ],
  "root_cause_analysis": {{
    "category": "CONCEPTUAL|PROCEDURAL|FOUNDATIONAL",
    "explanation": "Why this is the root issue",
    "evidence": "What in their work shows this"
  }},
  "intervention_strategies": [
    {{
      "strategy_type": "CONCRETE_MANIPULATIVES|VISUAL_MODELS|WORKED_EXAMPLES|PEER_TEACHING|ONE_ON_ONE",
      "description": "Specific activity to do",
      "duration_minutes": 15,
      "success_likelihood": 0.80,
      "resources_needed": ["Resource 1", "Resource 2"],
      "teaching_points": ["Key point 1", "Key point 2"]
    }}
  ],
  "personalized_talking_points": [
    "Exact question to ask in 1:1 session",
    "Prompt to check understanding"
  ],
  "similar_learners_pattern": "Are other learners showing this same error?",
  "progression_pathway": [
    {{"step": 1, "milestone": "First achievement", "estimated_days": 3}},
    {{"step": 2, "milestone": "Next achievement", "estimated_days": 5}}
  ],
  "red_flags": ["Warning sign 1", "Warning sign 2"],
  "quick_win_opportunity": "Fastest way to show improvement"
}}"""

        try:
            result = self.ai_service.get_completion(
                messages=[
                    self.ai_service.create_system_message(system_prompt),
                    self.ai_service.create_user_message(user_prompt)
                ],
                temperature=0.7,
                json_mode=True
            )

            import json
            diagnostic = json.loads(result["content"])

            # Enrich with taxonomy data
            diagnostic = self._enrich_with_taxonomy(diagnostic)

            # Add metadata
            diagnostic["ai_analysis"] = {
                "cost": result["cost"],
                "usage": result["usage"],
                "timestamp": result["timestamp"]
            }

            logger.info(f"Diagnostic analysis complete. Cost: ${result['cost']:.6f}")

            return diagnostic

        except Exception as e:
            logger.error(f"Diagnostic analysis failed: {e}")
            return self._fallback_diagnosis(
                question_content, learner_answer, correct_answer, topic
            )

    def analyze_class_patterns(
        self,
        class_id: str,
        assessment_results: List[Dict[str, Any]],
        timeframe_days: int = 7
    ) -> Dict[str, Any]:
        """
        Analyze patterns across an entire class to identify systemic issues.
        Answers: "What's happening with this class and why?"
        """

        # Extract common error patterns
        error_patterns = self._extract_error_patterns(assessment_results)

        system_prompt = """You are an expert mathematics education consultant analyzing class-wide patterns in a South African CAPS classroom.

Your goal: Identify SYSTEMIC issues affecting multiple learners and recommend CLASS-LEVEL interventions.

Look for:
- Shared misconceptions (>30% of class)
- Topic-specific struggles
- Curriculum pacing issues
- Teaching approach effectiveness
- Prerequisites that were missed by the class

Think like a master teacher conducting data-driven instruction."""

        user_prompt = f"""CLASS-WIDE DIAGNOSTIC:

Class ID: {class_id}
Assessment Period: Last {timeframe_days} days
Total Learners: {len(assessment_results)}

ERROR PATTERNS DETECTED:
{self._format_error_patterns(error_patterns)}

COMMON MISTAKES:
{self._format_common_mistakes(assessment_results)}

Provide class-level diagnostic in JSON:
{{
  "class_health_status": "STRONG|MODERATE|CONCERNING|CRITICAL",
  "systemic_issues": [
    {{
      "issue": "Issue description",
      "affected_learners_percent": 0.45,
      "severity": "HIGH|MEDIUM|LOW",
      "likely_cause": "Root cause explanation",
      "evidence": "What data shows this"
    }}
  ],
  "curriculum_pacing_analysis": {{
    "current_pace": "TOO_FAST|APPROPRIATE|TOO_SLOW",
    "recommendations": "Specific pacing adjustments",
    "topics_to_revisit": ["Topic 1", "Topic 2"]
  }},
  "teaching_approach_insights": {{
    "what_is_working": ["Effective approach 1"],
    "what_needs_adjustment": ["Struggling area 1"],
    "recommended_shifts": ["Teaching strategy 1"]
  }},
  "grouping_recommendations": [
    {{
      "group_type": "REMEDIATION|ENRICHMENT|PEER_TEACHING",
      "learner_ids": ["id1", "id2"],
      "focus_area": "Specific skill",
      "estimated_sessions": 3
    }}
  ],
  "intervention_priorities": [
    {{
      "priority": 1,
      "action": "Specific action to take",
      "urgency": "THIS_WEEK|NEXT_WEEK|THIS_MONTH",
      "expected_impact": "HIGH|MEDIUM|LOW"
    }}
  ],
  "positive_trends": ["Good thing 1", "Good thing 2"],
  "resource_needs": ["Resource 1", "Resource 2"]
}}"""

        try:
            result = self.ai_service.get_completion(
                messages=[
                    self.ai_service.create_system_message(system_prompt),
                    self.ai_service.create_user_message(user_prompt)
                ],
                temperature=0.6,
                json_mode=True
            )

            import json
            analysis = json.loads(result["content"])

            analysis["ai_analysis"] = {
                "cost": result["cost"],
                "usage": result["usage"],
                "timestamp": result["timestamp"]
            }

            return analysis

        except Exception as e:
            logger.error(f"Class pattern analysis failed: {e}")
            return {"error": str(e), "status": "failed"}

    def predict_intervention_success(
        self,
        learner_profile: Dict[str, Any],
        intervention_type: str,
        misconception_id: str,
        historical_data: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """
        Predict likelihood of intervention success for this specific learner.
        Answers: "Will this intervention work for THIS learner?"
        """

        system_prompt = """You are an expert at predicting educational intervention effectiveness based on learner profiles and historical patterns.

Analyze the learner's profile and predict intervention success using evidence-based practices."""

        user_prompt = f"""INTERVENTION SUCCESS PREDICTION:

Learner Profile:
{self._format_learner_profile(learner_profile)}

Proposed Intervention: {intervention_type}
Target Misconception: {misconception_id}

{self._format_historical_interventions(historical_data) if historical_data else ""}

Predict intervention effectiveness in JSON:
{{
  "success_probability": 0.75,
  "confidence_level": 0.85,
  "predicted_outcomes": {{
    "best_case": "Most likely positive outcome",
    "expected_case": "Realistic outcome",
    "worst_case": "Risk if intervention fails"
  }},
  "success_factors": ["Factor that increases success"],
  "risk_factors": ["Factor that might hinder success"],
  "optimization_tips": ["How to make intervention more effective"],
  "alternative_approaches": [
    {{"approach": "Alternative method", "success_probability": 0.65}}
  ],
  "estimated_timeline": {{
    "days_to_first_improvement": 3,
    "days_to_mastery": 14
  }},
  "monitoring_checkpoints": [
    {{"day": 3, "check": "What to assess"}}
  ]
}}"""

        try:
            result = self.ai_service.get_completion(
                messages=[
                    self.ai_service.create_system_message(system_prompt),
                    self.ai_service.create_user_message(user_prompt)
                ],
                temperature=0.5,
                json_mode=True
            )

            import json
            prediction = json.loads(result["content"])

            prediction["ai_analysis"] = {
                "cost": result["cost"],
                "usage": result["usage"],
                "timestamp": result["timestamp"]
            }

            return prediction

        except Exception as e:
            logger.error(f"Intervention prediction failed: {e}")
            return {"success_probability": 0.5, "confidence_level": 0.3, "error": str(e)}

    def generate_diagnostic_insights(
        self,
        dashboard_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate AI-powered insights for the teacher dashboard.
        Answers: "What should the teacher pay attention to RIGHT NOW?"
        """

        system_prompt = """You are an AI teaching assistant that provides actionable insights to busy teachers.

Your goal: Surface the MOST IMPORTANT things the teacher should know and act on TODAY.

Be specific, actionable, and data-driven. Speak like a helpful colleague, not a robot."""

        user_prompt = f"""DASHBOARD DIAGNOSTIC:

{self._format_dashboard_data(dashboard_data)}

Generate 3-5 prioritized insights in JSON:
{{
  "urgent_alerts": [
    {{
      "type": "AT_RISK_LEARNER|CLASS_PATTERN|MISCONCEPTION_SPIKE|ENGAGEMENT_DROP",
      "message": "Clear, actionable alert message",
      "learners_affected": ["learner_id"],
      "recommended_action": "Specific next step",
      "urgency": "TODAY|THIS_WEEK|THIS_MONTH",
      "impact_if_ignored": "Consequence of inaction"
    }}
  ],
  "positive_highlights": [
    {{
      "message": "Good news the teacher should celebrate",
      "evidence": "Data that shows this"
    }}
  ],
  "pattern_observations": [
    {{
      "pattern": "Interesting trend noticed",
      "interpretation": "What this might mean",
      "suggested_investigation": "What to look into"
    }}
  ],
  "quick_wins": [
    {{
      "action": "Easy action with big impact",
      "estimated_time": "5 minutes",
      "expected_outcome": "Result"
    }}
  ],
  "predictive_warnings": [
    {{
      "prediction": "What might happen next week",
      "probability": 0.70,
      "prevention_strategy": "How to prevent it"
    }}
  ]
}}"""

        try:
            result = self.ai_service.get_completion(
                messages=[
                    self.ai_service.create_system_message(system_prompt),
                    self.ai_service.create_user_message(user_prompt)
                ],
                temperature=0.7,
                json_mode=True
            )

            import json
            insights = json.loads(result["content"])

            insights["ai_analysis"] = {
                "cost": result["cost"],
                "usage": result["usage"],
                "timestamp": result["timestamp"],
                "generated_at": datetime.utcnow().isoformat()
            }

            return insights

        except Exception as e:
            logger.error(f"Dashboard insights generation failed: {e}")
            return {"urgent_alerts": [], "error": str(e)}

    # Helper methods

    def _format_learner_history(self, history: List[Dict]) -> str:
        """Format learner's recent assessment history"""
        if not history:
            return ""

        history_str = "\nLEARNER HISTORY (Recent Assessments):\n"
        for item in history[-5:]:  # Last 5 assessments
            history_str += f"- {item.get('topic')}: {item.get('score')}% (Mistake: {item.get('error_pattern', 'N/A')})\n"
        return history_str

    def _format_error_patterns(self, patterns: Dict) -> str:
        """Format error patterns for AI analysis"""
        output = ""
        for pattern, count in patterns.items():
            output += f"- {pattern}: {count} learners\n"
        return output

    def _format_common_mistakes(self, results: List[Dict]) -> str:
        """Extract and format common mistakes"""
        mistakes = {}
        for result in results:
            error = result.get('error_pattern', 'Unknown')
            mistakes[error] = mistakes.get(error, 0) + 1

        output = ""
        for mistake, count in sorted(mistakes.items(), key=lambda x: x[1], reverse=True)[:5]:
            output += f"- {mistake}: {count} learners ({(count/len(results)*100):.0f}%)\n"
        return output

    def _format_learner_profile(self, profile: Dict) -> str:
        """Format learner profile for AI analysis"""
        return f"""
Grade: {profile.get('grade')}
Current Performance: {profile.get('avg_performance')}%
Engagement Level: {profile.get('engagement_score')}/10
Learning Style: {profile.get('learning_style', 'Unknown')}
Previous Interventions: {', '.join(profile.get('previous_interventions', []))}
Attendance Rate: {profile.get('attendance_rate')}%
"""

    def _format_historical_interventions(self, history: List[Dict]) -> str:
        """Format historical intervention data"""
        if not history:
            return ""

        output = "\nPREVIOUS INTERVENTIONS:\n"
        for intervention in history:
            success = "✓ Successful" if intervention.get('successful') else "✗ Not effective"
            output += f"- {intervention.get('type')}: {success} ({intervention.get('date')})\n"
        return output

    def _format_dashboard_data(self, data: Dict) -> str:
        """Format dashboard data for AI insights"""
        return f"""
Total Learners: {data.get('total_learners')}
Average Performance: {data.get('avg_performance')}%
At-Risk Learners: {data.get('at_risk_count')} ({data.get('at_risk_percent')}%)
Trending Topics: {', '.join(data.get('struggling_topics', []))}
Recent Assessment: {data.get('last_assessment_date')}
Completion Rate: {data.get('completion_rate')}%
Engagement Trend: {data.get('engagement_trend')}
"""

    def _extract_error_patterns(self, results: List[Dict]) -> Dict[str, int]:
        """Extract common error patterns from results"""
        patterns = {}
        for result in results:
            pattern = result.get('error_pattern', 'Unknown error')
            patterns[pattern] = patterns.get(pattern, 0) + 1
        return patterns

    def _enrich_with_taxonomy(self, diagnostic: Dict) -> Dict:
        """Enrich diagnostic with taxonomy data if misconception is identified"""
        misc_id = diagnostic.get('misconception_identified', {}).get('id')
        if misc_id and misc_id in MISCONCEPTIONS_TAXONOMY:
            taxonomy_data = MISCONCEPTIONS_TAXONOMY[misc_id]
            diagnostic['misconception_identified']['taxonomy'] = taxonomy_data
        return diagnostic

    def _fallback_diagnosis(
        self, question: str, learner_answer: str, correct_answer: str, topic: str
    ) -> Dict:
        """Provide basic fallback diagnosis if AI fails"""
        return {
            "error_pattern": f"Incorrect answer: gave '{learner_answer}' instead of '{correct_answer}'",
            "learner_reasoning_hypothesis": "Unable to generate detailed hypothesis",
            "misconception_identified": {
                "name": "Unknown misconception",
                "severity": "MEDIUM",
                "confidence": 0.3
            },
            "root_cause_analysis": {
                "category": "UNKNOWN",
                "explanation": "AI analysis unavailable",
                "evidence": "Fallback mode"
            },
            "intervention_strategies": [
                {
                    "strategy_type": "ONE_ON_ONE",
                    "description": f"Review {topic} concepts with learner",
                    "duration_minutes": 10,
                    "success_likelihood": 0.6
                }
            ],
            "status": "fallback",
            "error": "AI diagnostic service unavailable"
        }


# Singleton instance
_diagnostic_analyzer_instance: Optional[DiagnosticAnalyzer] = None

def get_diagnostic_analyzer() -> DiagnosticAnalyzer:
    """Get or create singleton DiagnosticAnalyzer instance"""
    global _diagnostic_analyzer_instance

    if _diagnostic_analyzer_instance is None:
        _diagnostic_analyzer_instance = DiagnosticAnalyzer()

    return _diagnostic_analyzer_instance
