"""
Audio Service - OpenAI Whisper (STT) + TTS Integration

Provides speech-to-text transcription and text-to-speech synthesis
for multimodal diagnostic assessments.
"""

import os
import re
import tempfile
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import logging

from openai import OpenAI
from fastapi import UploadFile

logger = logging.getLogger(__name__)


class AudioService:
    """
    Service for audio processing using OpenAI APIs.

    Features:
    - Speech-to-text (Whisper API)
    - Text-to-speech (TTS API)
    - Smart answer matching (fuzzy logic)
    """

    def __init__(self):
        """Initialize AudioService with OpenAI client."""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")

        self.client = OpenAI(api_key=api_key)
        self.supported_audio_formats = [
            "flac", "mp3", "mp4", "mpeg", "mpga",
            "m4a", "ogg", "wav", "webm"
        ]

    # ========================================================================
    # Speech-to-Text (Whisper)
    # ========================================================================

    async def transcribe_audio(
        self,
        audio_file: UploadFile,
        language: str = "en"
    ) -> Dict[str, str]:
        """
        Transcribe audio file to text using OpenAI Whisper.

        Args:
            audio_file: Uploaded audio file
            language: Language code (en, af, etc.)

        Returns:
            Dict with transcription results:
            {
                "text": "The transcribed text",
                "language": "en",
                "duration": 5.2
            }

        Raises:
            ValueError: If audio format not supported
            Exception: If transcription fails
        """
        logger.info(f"Transcribing audio file: {audio_file.filename}")

        # Validate file format
        file_ext = Path(audio_file.filename).suffix.lstrip('.').lower()
        if file_ext not in self.supported_audio_formats:
            raise ValueError(
                f"Unsupported audio format: {file_ext}. "
                f"Supported: {', '.join(self.supported_audio_formats)}"
            )

        try:
            # Create temporary file for upload
            with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=f".{file_ext}"
            ) as temp_file:
                # Write uploaded content to temp file
                content = await audio_file.read()
                temp_file.write(content)
                temp_file_path = temp_file.name

            # Call OpenAI Whisper API
            with open(temp_file_path, "rb") as audio:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio,
                    language=language if language != "auto" else None,
                    response_format="verbose_json"  # Get metadata
                )

            # Clean up temp file
            os.unlink(temp_file_path)

            result = {
                "text": transcript.text.strip(),
                "language": transcript.language if hasattr(transcript, 'language') else language,
                "duration": transcript.duration if hasattr(transcript, 'duration') else 0
            }

            logger.info(f"Transcription successful: {result['text'][:50]}...")
            return result

        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}")
            raise Exception(f"Failed to transcribe audio: {str(e)}")

    # ========================================================================
    # Text-to-Speech (TTS)
    # ========================================================================

    async def synthesize_speech(
        self,
        text: str,
        voice: str = "alloy",
        speed: float = 1.0
    ) -> bytes:
        """
        Convert text to speech using OpenAI TTS.

        Args:
            text: Text to convert to speech
            voice: Voice name (alloy, echo, fable, onyx, nova, shimmer)
            speed: Playback speed (0.25 to 4.0)

        Returns:
            Audio data as bytes (mp3 format)

        Raises:
            ValueError: If voice invalid or text empty
            Exception: If synthesis fails
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")

        valid_voices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]
        if voice not in valid_voices:
            raise ValueError(f"Invalid voice: {voice}. Valid: {', '.join(valid_voices)}")

        if not (0.25 <= speed <= 4.0):
            raise ValueError("Speed must be between 0.25 and 4.0")

        logger.info(f"Synthesizing speech: {text[:50]}... (voice={voice})")

        try:
            response = self.client.audio.speech.create(
                model="tts-1",  # or "tts-1-hd" for higher quality
                voice=voice,
                input=text,
                speed=speed
            )

            audio_data = response.content
            logger.info(f"Speech synthesis successful: {len(audio_data)} bytes")
            return audio_data

        except Exception as e:
            logger.error(f"Speech synthesis failed: {str(e)}")
            raise Exception(f"Failed to synthesize speech: {str(e)}")

    # ========================================================================
    # Smart Answer Matching
    # ========================================================================

    def match_answer_to_option(
        self,
        transcribed_text: str,
        question_options: List[Dict[str, str]],
        question_stem: str = ""
    ) -> Dict[str, any]:
        """
        Match transcribed text to a question option using fuzzy logic.

        Handles:
        - Number matching: "twenty" → "20"
        - Letter matching: "B" → option_id "B"
        - Value matching: "one hundred forty-five" → "145"
        - Phrase matching: "I think it's A" → option_id "A"

        Args:
            transcribed_text: What the learner said
            question_options: List of {option_id, value} dicts
            question_stem: Optional question text for context

        Returns:
            {
                "matched_option_id": "A",
                "matched_value": "20",
                "confidence": 0.95,
                "method": "letter_reference"
            }
            or None if no match found
        """
        text_lower = transcribed_text.lower().strip()
        logger.info(f"Matching answer: '{text_lower}' to {len(question_options)} options")

        # Strategy 1: Direct letter reference (A, B, C, D)
        letter_match = self._match_by_letter(text_lower, question_options)
        if letter_match:
            return letter_match

        # Strategy 2: Numeric value extraction
        number_match = self._match_by_number(text_lower, question_options)
        if number_match:
            return number_match

        # Strategy 3: Exact text match
        text_match = self._match_by_exact_text(text_lower, question_options)
        if text_match:
            return text_match

        # No match found
        logger.warning(f"No match found for: '{text_lower}'")
        return {
            "matched_option_id": None,
            "matched_value": None,
            "confidence": 0.0,
            "method": "no_match",
            "suggestions": [opt["value"] for opt in question_options[:2]]
        }

    def _match_by_letter(self, text: str, options: List[Dict]) -> Optional[Dict]:
        """Match by letter reference (A, B, C, D)."""
        # Extract single letter (A-Z) - more flexible pattern
        # Matches: "A", "D.", "option A", "I think B", etc.
        letter_pattern = r'(?:^|\s|option\s+)([A-D])(?:\s|$|[.,!?])'
        matches = re.findall(letter_pattern, text.upper(), re.IGNORECASE)

        if matches:
            letter = matches[0].upper()
            logger.info(f"Extracted letter: {letter} from text: '{text}'")
            for opt in options:
                if opt["option_id"].upper() == letter:
                    logger.info(f"Matched to option: {opt['option_id']}")
                    return {
                        "matched_option_id": opt["option_id"],
                        "matched_value": opt["value"],
                        "confidence": 0.95,
                        "method": "letter_reference"
                    }

        logger.warning(f"No letter match found in: '{text}'")
        return None

    def _match_by_number(self, text: str, options: List[Dict]) -> Optional[Dict]:
        """Match by extracting numbers from text."""
        # Convert words to numbers
        text_numbers = self._words_to_numbers(text)

        # Extract all numbers from text
        number_pattern = r'-?\d+\.?\d*'
        extracted_numbers = re.findall(number_pattern, text_numbers)

        if not extracted_numbers:
            return None

        # Try to match each extracted number to options
        for num_str in extracted_numbers:
            for opt in options:
                opt_value = str(opt["value"]).strip()

                # Direct match
                if num_str == opt_value:
                    return {
                        "matched_option_id": opt["option_id"],
                        "matched_value": opt_value,
                        "confidence": 0.90,
                        "method": "number_extraction"
                    }

                # Fuzzy numeric match (e.g., "145" matches "145.0")
                try:
                    if float(num_str) == float(opt_value):
                        return {
                            "matched_option_id": opt["option_id"],
                            "matched_value": opt_value,
                            "confidence": 0.85,
                            "method": "fuzzy_number"
                        }
                except (ValueError, TypeError):
                    continue

        return None

    def _match_by_exact_text(self, text: str, options: List[Dict]) -> Optional[Dict]:
        """Match by exact text in option value."""
        for opt in options:
            opt_value = str(opt["value"]).lower().strip()

            # Exact match
            if opt_value in text or text in opt_value:
                return {
                    "matched_option_id": opt["option_id"],
                    "matched_value": opt["value"],
                    "confidence": 0.80,
                    "method": "text_match"
                }

        return None

    def _words_to_numbers(self, text: str) -> str:
        """Convert number words to digits."""
        # Simple mapping for common numbers in Grade 4
        number_words = {
            "zero": "0", "one": "1", "two": "2", "three": "3", "four": "4",
            "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9",
            "ten": "10", "eleven": "11", "twelve": "12", "thirteen": "13",
            "fourteen": "14", "fifteen": "15", "sixteen": "16", "seventeen": "17",
            "eighteen": "18", "nineteen": "19", "twenty": "20", "thirty": "30",
            "forty": "40", "fifty": "50", "sixty": "60", "seventy": "70",
            "eighty": "80", "ninety": "90", "hundred": "100", "thousand": "1000"
        }

        result = text
        for word, digit in number_words.items():
            result = re.sub(r'\b' + word + r'\b', digit, result, flags=re.IGNORECASE)

        # Handle compound numbers like "twenty one" → "21"
        result = re.sub(r'(\d+)\s+(\d+)', r'\1\2', result)

        return result


# ============================================================================
# Service Instance
# ============================================================================

_audio_service: Optional[AudioService] = None


def get_audio_service() -> AudioService:
    """Get or create AudioService singleton."""
    global _audio_service
    if _audio_service is None:
        _audio_service = AudioService()
    return _audio_service
