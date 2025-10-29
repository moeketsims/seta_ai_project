"""
Audio API Endpoints

Provides endpoints for:
- Speech-to-text transcription (Whisper)
- Text-to-speech synthesis (TTS)
- Voice answer matching for assessments
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import io
import logging

from app.services.audio_service import get_audio_service, AudioService
from app.services.ai_answer_extractor import get_ai_answer_extractor
from app.schemas.audio_schemas import EnhancedTranscriptionResponse

logger = logging.getLogger(__name__)
router = APIRouter()


# ============================================================================
# Request/Response Models
# ============================================================================

class SynthesizeSpeechRequest(BaseModel):
    """Request model for text-to-speech."""
    text: str = Field(..., min_length=1, max_length=4096, description="Text to convert to speech")
    voice: str = Field(default="alloy", description="Voice name (alloy, echo, fable, onyx, nova, shimmer)")
    speed: float = Field(default=1.0, ge=0.25, le=4.0, description="Playback speed (0.25-4.0)")


class TranscriptionResponse(BaseModel):
    """Response model for audio transcription."""
    success: bool
    transcription: str
    language: str
    duration: float
    matched_option: Optional[Dict] = None
    error: Optional[str] = None


class MatchAnswerRequest(BaseModel):
    """Request model for answer matching."""
    transcribed_text: str
    question_options: List[Dict[str, str]]  # [{"option_id": "A", "value": "20"}, ...]
    question_stem: Optional[str] = None


class MatchAnswerResponse(BaseModel):
    """Response model for answer matching."""
    matched_option_id: Optional[str]
    matched_value: Optional[str]
    confidence: float
    method: str
    suggestions: Optional[List[str]] = None


# ============================================================================
# Endpoints
# ============================================================================

@router.post(
    "/transcribe",
    response_model=EnhancedTranscriptionResponse,
    summary="Transcribe audio to text with AI answer extraction",
    description="Upload an audio file and receive a text transcription using OpenAI Whisper with intelligent answer extraction"
)
async def transcribe_audio(
    audio_file: UploadFile = File(..., description="Audio file (webm, mp3, wav, etc.)"),
    language: str = Form("en"),
    match_options: Optional[str] = Form(None),  # JSON string of options
    question_stem: Optional[str] = Form(None),  # Question text for AI context
    audio_service: AudioService = Depends(get_audio_service)
):
    """
    Transcribe audio file to text.

    Supports:
    - File formats: webm, mp3, wav, m4a, ogg, flac
    - Languages: en (English), af (Afrikaans), auto-detect
    - Optional answer matching if question_options provided

    Returns:
    - Transcribed text
    - Optional matched answer option
    """
    try:
        # Validate file
        if not audio_file.filename:
            raise HTTPException(status_code=400, detail="No file provided")

        logger.info(f"Transcribing audio: {audio_file.filename} (language={language})")

        # Transcribe audio
        transcription_result = await audio_service.transcribe_audio(
            audio_file=audio_file,
            language=language
        )

        # If match_options provided, use AI to extract answer intent
        matched_option_id = None
        matched_value = None
        confidence = 0.0
        extraction_method = "none"
        student_reasoning = None
        uncertainty_markers = []
        changed_mind = False
        error_message = None

        if match_options:
            try:
                import json
                options_list = json.loads(match_options)

                # Use AI extractor if question_stem provided, otherwise fallback to regex
                if question_stem and question_stem.strip():
                    # AI-powered extraction
                    logger.info("Using AI-powered answer extraction")
                    ai_extractor = get_ai_answer_extractor()
                    ai_result = await ai_extractor.extract_answer_intent(
                        transcribed_text=transcription_result["text"],
                        question_stem=question_stem,
                        question_options=options_list
                    )

                    matched_option_id = ai_result.get("selected_answer")
                    confidence = ai_result.get("confidence", 0.0)
                    student_reasoning = ai_result.get("reasoning")
                    changed_mind = ai_result.get("changed_mind", False)
                    uncertainty_markers = ai_result.get("uncertainty_markers", [])
                    extraction_method = ai_result.get("extraction_method", "ai_gpt4_mini")
                    error_message = ai_result.get("error")

                    # Find the matched value
                    if matched_option_id:
                        for opt in options_list:
                            if opt["option_id"] == matched_option_id:
                                matched_value = opt["value"]
                                break
                else:
                    # Fallback to regex matching
                    logger.info("Using regex fallback for answer matching")
                    match_result = audio_service.match_answer_to_option(
                        transcribed_text=transcription_result["text"],
                        question_options=options_list
                    )
                    matched_option_id = match_result.get("matched_option_id")
                    matched_value = match_result.get("matched_value")
                    confidence = match_result.get("confidence", 0.0)
                    extraction_method = "regex_fallback"

            except (json.JSONDecodeError, Exception) as e:
                logger.warning(f"Failed to extract answer: {e}")
                error_message = str(e)

        return EnhancedTranscriptionResponse(
            success=True,
            transcription=transcription_result["text"],
            language=transcription_result["language"],
            duration=transcription_result["duration"],
            matched_option_id=matched_option_id,
            matched_value=matched_value,
            confidence=confidence,
            extraction_method=extraction_method,
            student_reasoning=student_reasoning,
            uncertainty_markers=uncertainty_markers,
            changed_mind=changed_mind,
            error=error_message
        )

    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to transcribe audio: {str(e)}"
        )


@router.post(
    "/synthesize",
    summary="Convert text to speech",
    description="Generate audio from text using OpenAI TTS",
    response_class=StreamingResponse
)
async def synthesize_speech(
    request: SynthesizeSpeechRequest,
    audio_service: AudioService = Depends(get_audio_service)
):
    """
    Convert text to speech (TTS).

    Args:
        text: Text to convert (max 4096 chars)
        voice: Voice name (alloy, echo, fable, onyx, nova, shimmer)
        speed: Playback speed (0.25 to 4.0)

    Returns:
        Audio stream (mp3 format)
    """
    try:
        logger.info(f"Synthesizing speech: {request.text[:50]}... (voice={request.voice})")

        # Generate speech
        audio_data = await audio_service.synthesize_speech(
            text=request.text,
            voice=request.voice,
            speed=request.speed
        )

        # Return audio as streaming response
        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3",
                "Cache-Control": "public, max-age=3600"  # Cache for 1 hour
            }
        )

    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.error(f"Speech synthesis error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to synthesize speech: {str(e)}"
        )


@router.post(
    "/match-answer",
    response_model=MatchAnswerResponse,
    summary="Match transcribed text to answer option",
    description="Use fuzzy logic to match spoken answer to multiple choice options"
)
async def match_answer(
    request: MatchAnswerRequest,
    audio_service: AudioService = Depends(get_audio_service)
):
    """
    Match transcribed text to a question option.

    Uses fuzzy matching to handle:
    - Number words: "twenty" → "20"
    - Letter references: "I think it's B" → option B
    - Verbal expressions: "one hundred forty-five" → "145"

    Args:
        transcribed_text: What the learner said
        question_options: List of answer options with option_id and value
        question_stem: Optional question text for context

    Returns:
        Matched option ID, value, and confidence score
    """
    try:
        logger.info(f"Matching answer: '{request.transcribed_text}' to {len(request.question_options)} options")

        match_result = audio_service.match_answer_to_option(
            transcribed_text=request.transcribed_text,
            question_options=request.question_options,
            question_stem=request.question_stem or ""
        )

        return MatchAnswerResponse(**match_result)

    except Exception as e:
        logger.error(f"Answer matching error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to match answer: {str(e)}"
        )


@router.get(
    "/question/{question_id}",
    summary="Get pre-generated TTS for question",
    description="Retrieve cached or generate TTS audio for a specific question",
    response_class=StreamingResponse
)
async def get_question_audio(
    question_id: str,
    voice: str = "alloy",
    audio_service: AudioService = Depends(get_audio_service)
):
    """
    Get TTS audio for a specific question.

    TODO: Implement caching layer to avoid regenerating same questions.

    Args:
        question_id: ID of the diagnostic question
        voice: Voice name for TTS

    Returns:
        Audio stream (mp3)
    """
    try:
        # TODO: Fetch question text from database
        # For now, return error
        raise HTTPException(
            status_code=501,
            detail="Question audio caching not yet implemented. Use /synthesize endpoint."
        )

    except Exception as e:
        logger.error(f"Question audio error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/voices",
    summary="List available TTS voices",
    description="Get list of available voices for text-to-speech"
)
async def list_voices():
    """
    List available TTS voices.

    Returns:
        List of voice names with descriptions
    """
    return {
        "voices": [
            {"name": "alloy", "description": "Neutral, balanced voice"},
            {"name": "echo", "description": "Male, calm voice"},
            {"name": "fable", "description": "Expressive, storytelling voice"},
            {"name": "onyx", "description": "Deep, authoritative voice"},
            {"name": "nova", "description": "Female, friendly voice"},
            {"name": "shimmer", "description": "Warm, engaging voice"}
        ],
        "default": "alloy",
        "recommended_for_grade4": "nova"  # Friendly female voice for young learners
    }
