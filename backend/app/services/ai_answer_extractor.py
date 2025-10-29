"""
AI Answer Extractor Service

Uses OpenAI GPT-4o Mini to intelligently extract student answers from natural
conversational voice responses. Handles complex scenarios like:
- Changed mind ("I think A, no wait, B")
- Process of elimination ("A is wrong, so B")
- Thinking aloud ("2+3=5, so the answer is B")
- Uncertainty ("Maybe A or C, I'll guess C")
"""

import os
import json
import logging
from typing import Dict, List, Optional
from openai import OpenAI

logger = logging.getLogger(__name__)


class AIAnswerExtractor:
    """
    Service for extracting student answer intent using GPT-4o Mini.

    Features:
    - Natural language understanding
    - Reasoning capture
    - Confidence scoring
    - Uncertainty detection
    """

    def __init__(self):
        """Initialize with OpenAI client."""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")

        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o-mini"  # Cost-effective, accurate

    async def extract_answer_intent(
        self,
        transcribed_text: str,
        question_stem: str,
        question_options: List[Dict[str, str]]
    ) -> Dict:
        """
        Extract student's final answer choice from transcribed speech.

        Args:
            transcribed_text: What the student said
            question_stem: The question text
            question_options: List of {option_id: "A", value: "167"}

        Returns:
            Dict with:
            {
                "selected_answer": "B",
                "confidence": 0.85,
                "reasoning": "Student calculated 345-178=167",
                "changed_mind": false,
                "uncertainty_markers": ["maybe", "not sure"],
                "extraction_method": "ai_gpt4_mini"
            }
        """
        logger.info(f"Extracting answer intent from: '{transcribed_text}'")

        try:
            # Build the prompt
            prompt = self._build_extraction_prompt(
                transcribed_text,
                question_stem,
                question_options
            )

            # Call GPT-4o Mini with structured output
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at understanding Grade 4 student responses to mathematics questions. Extract the student's final answer choice and reasoning."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.1,  # Low temperature for consistency
                max_tokens=200
            )

            # Parse the JSON response
            result_text = response.choices[0].message.content
            result = json.loads(result_text)

            # Add metadata
            result["extraction_method"] = "ai_gpt4_mini"
            result["tokens_used"] = response.usage.total_tokens

            logger.info(f"AI extracted answer: {result.get('selected_answer')} (confidence: {result.get('confidence')})")

            return result

        except Exception as e:
            logger.error(f"AI extraction failed: {str(e)}")
            return {
                "selected_answer": None,
                "confidence": 0.0,
                "reasoning": None,
                "changed_mind": False,
                "uncertainty_markers": [],
                "extraction_method": "ai_failed",
                "error": str(e)
            }

    def _build_extraction_prompt(
        self,
        transcribed_text: str,
        question_stem: str,
        question_options: List[Dict[str, str]]
    ) -> str:
        """Build the GPT-4 Mini prompt for answer extraction."""

        # Format options for prompt
        options_text = "\n".join([
            f"{opt['option_id']}. {opt['value']}"
            for opt in question_options
        ])

        prompt = f"""**Question:**
{question_stem}

**Answer Options:**
{options_text}

**Student's Verbal Response:**
"{transcribed_text}"

**Task:**
Analyze the student's response and extract:
1. Which answer option (A, B, C, or D) did they ultimately choose?
2. What was their reasoning or thought process?
3. How confident do they seem? (0.0 = very uncertain, 1.0 = very confident)
4. Did they change their mind during the response?
5. What uncertainty markers did they use? (e.g., "maybe", "not sure", "hmm")

**Special Cases:**
- If they mention multiple options but then choose one, extract the FINAL choice
- If they say "A is wrong, so B", extract B as the answer
- If they calculate or explain, capture their reasoning
- If they're very uncertain, assign low confidence (< 0.5)

**Output Format (JSON):**
{{
  "selected_answer": "B",
  "confidence": 0.85,
  "reasoning": "Brief summary of student's thinking process",
  "changed_mind": false,
  "uncertainty_markers": ["maybe", "not sure"]
}}

If you cannot determine a clear answer, set selected_answer to null and confidence to 0.0."""

        return prompt


# Singleton instance
_extractor_instance: Optional[AIAnswerExtractor] = None


def get_ai_answer_extractor() -> AIAnswerExtractor:
    """Get or create the singleton AI answer extractor instance."""
    global _extractor_instance
    if _extractor_instance is None:
        _extractor_instance = AIAnswerExtractor()
    return _extractor_instance
