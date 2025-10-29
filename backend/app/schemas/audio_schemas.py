"""
Audio Service Schemas

Pydantic models for audio transcription and AI answer extraction.
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class EnhancedTranscriptionResponse(BaseModel):
    """Enhanced response model for audio transcription with AI extraction."""

    # Transcription
    success: bool
    transcription: str
    language: str
    duration: float

    # Extracted Answer (AI-powered)
    matched_option_id: Optional[str] = None
    matched_value: Optional[str] = None
    confidence: float = 0.0
    extraction_method: str = "none"  # "ai_gpt4_mini", "regex_fallback", "none"

    # Pedagogical Insights
    student_reasoning: Optional[str] = None
    uncertainty_markers: List[str] = Field(default_factory=list)
    changed_mind: bool = False

    # Metadata
    error: Optional[str] = None


class AIExtractionResult(BaseModel):
    """Result from AI answer extraction."""

    selected_answer: Optional[str]  # "A", "B", "C", "D" or None
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: Optional[str] = None
    changed_mind: bool = False
    uncertainty_markers: List[str] = Field(default_factory=list)
    extraction_method: str = "ai_gpt4_mini"
    tokens_used: Optional[int] = None
    error: Optional[str] = None
