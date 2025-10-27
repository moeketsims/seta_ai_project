"""
Pathway Builder Service
Generates personalized learning pathways based on diagnostic results and skill gaps.
"""

import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta

from app.services.ai_service import get_ai_service, AIServiceError

logger = logging.getLogger(__name__)


class PathwayBuilder:
    """
    Service for generating personalized learning pathways.
    Creates sequenced learning activities based on learner needs.
    """

    def __init__(self):
        self.ai_service = get_ai_service()

    def create_pathway(
        self,
        learner_id: str,
        current_skills: List[str],
        target_skills: List[str],
        grade: int,
        diagnostic_results: Optional[Dict[str, Any]] = None,
        misconceptions: Optional[List[Dict[str, Any]]] = None,
        timeframe_weeks: int = 8,
        learning_style: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a personalized learning pathway.

        Args:
            learner_id: Unique learner identifier
            current_skills: Skills the learner has mastered
            target_skills: Skills the learner needs to develop
            grade: Learner's grade level
            diagnostic_results: Recent assessment results
            misconceptions: Detected misconceptions to address
            timeframe_weeks: Duration for pathway completion
            learning_style: Learner's preferred learning style

        Returns:
            Dict with complete pathway including steps, activities, and timeline
        """
        try:
            # Use AI to generate pathway
            pathway_data = self._generate_pathway_with_ai(
                learner_id=learner_id,
                current_skills=current_skills,
                target_skills=target_skills,
                grade=grade,
                diagnostic_results=diagnostic_results,
                misconceptions=misconceptions,
                timeframe_weeks=timeframe_weeks,
                learning_style=learning_style
            )

            # Add metadata
            pathway_data["pathway_id"] = f"path_{learner_id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
            pathway_data["learner_id"] = learner_id
            pathway_data["created_at"] = datetime.utcnow().isoformat()
            pathway_data["status"] = "active"
            pathway_data["progress"] = 0.0

            return pathway_data

        except AIServiceError as e:
            logger.error(f"AI service error during pathway generation: {e}")
            raise
        except Exception as e:
            logger.error(f"Error creating pathway: {e}")
            raise

    def _generate_pathway_with_ai(
        self,
        learner_id: str,
        current_skills: List[str],
        target_skills: List[str],
        grade: int,
        diagnostic_results: Optional[Dict[str, Any]],
        misconceptions: Optional[List[Dict[str, Any]]],
        timeframe_weeks: int,
        learning_style: Optional[str]
    ) -> Dict[str, Any]:
        """Use AI to generate learning pathway"""

        system_prompt = """You are an expert mathematics curriculum designer for South African CAPS curriculum.

Create a personalized learning pathway that:
- Starts with prerequisite skills
- Addresses specific misconceptions
- Builds progressively toward target skills
- Uses appropriate pedagogical strategies
- Includes varied activity types (visual models, practice, real-world problems)
- Is realistic for the given timeframe

Respond in JSON format:
{
    "name": "pathway name (engaging, personalized)",
    "description": "brief description",
    "duration_weeks": number,
    "difficulty_progression": "gradual|moderate|accelerated",
    "steps": [
        {
            "week": number,
            "skill": "skill name",
            "description": "what learner will master",
            "activities": [
                {
                    "type": "video|practice|manipulative|game|assessment",
                    "title": "activity title",
                    "description": "brief description",
                    "duration_minutes": number
                }
            ],
            "misconceptions_addressed": ["list if applicable"],
            "success_criteria": "how to know mastery achieved",
            "estimated_hours": number
        }
    ],
    "prerequisites": ["skills needed before starting"],
    "milestones": [
        {
            "week": number,
            "title": "milestone name",
            "criteria": "what learner should achieve"
        }
    ],
    "support_resources": ["recommended resources"]
}"""

        misconception_text = ""
        if misconceptions:
            misc_list = [f"- {m.get('name', 'Unknown')}: {m.get('description', '')}" for m in misconceptions]
            misconception_text = "\n".join(misc_list)

        diagnostic_text = ""
        if diagnostic_results:
            diagnostic_text = f"Recent performance: {diagnostic_results.get('average_score', 'N/A')}%"

        user_prompt = f"""Create a personalized learning pathway for a Grade {grade} learner.

Current Skills Mastered:
{', '.join(current_skills) if current_skills else 'None'}

Target Skills to Develop:
{', '.join(target_skills)}

{f"Misconceptions to Address:\n{misconception_text}" if misconception_text else ""}

{diagnostic_text if diagnostic_text else ""}

Timeframe: {timeframe_weeks} weeks
{f"Learning Style: {learning_style}" if learning_style else ""}

Create an engaging, achievable pathway aligned with CAPS curriculum."""

        messages = [
            self.ai_service.create_system_message(system_prompt),
            self.ai_service.create_user_message(user_prompt)
        ]

        result = self.ai_service.get_completion(
            messages=messages,
            json_mode=True,
            temperature=0.7,  # Higher creativity for varied pathways
            max_tokens=1500
        )

        pathway = json.loads(result["content"])
        pathway["ai_cost"] = result["cost"]
        pathway["ai_usage"] = result["usage"]

        return pathway


# Singleton instance
_pathway_builder_instance: Optional[PathwayBuilder] = None

def get_pathway_builder() -> PathwayBuilder:
    """Get or create singleton PathwayBuilder instance"""
    global _pathway_builder_instance

    if _pathway_builder_instance is None:
        _pathway_builder_instance = PathwayBuilder()

    return _pathway_builder_instance
