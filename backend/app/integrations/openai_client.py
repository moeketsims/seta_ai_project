"""
OpenAI integration wrapper used by diagnostic services.

Centralizes loading API credentials from environment variables, applies
consistent defaults, and provides helper methods for requesting structured
JSON completions that power diagnostic question generation.
"""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass
from typing import Any, Dict, Optional

from openai import OpenAI, OpenAIError, APIConnectionError, RateLimitError
from dotenv import load_dotenv, find_dotenv

logger = logging.getLogger(__name__)


class OpenAIClientError(RuntimeError):
    """Raised when the OpenAI integration fails after retries."""


@dataclass(frozen=True)
class OpenAISettings:
    """Runtime settings for OpenAI usage."""

    api_key: str
    model: str
    temperature: float
    max_tokens: int

    @staticmethod
    def from_env() -> "OpenAISettings":
        # Ensure environment variables are loaded regardless of current working directory
        dotenv_path = find_dotenv()
        if dotenv_path:
            load_dotenv(dotenv_path=dotenv_path, override=False)

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise OpenAIClientError("OPENAI_API_KEY environment variable is missing.")

        model = os.getenv("OPENAI_DIAGNOSTIC_MODEL", os.getenv("OPENAI_MODEL", "gpt-4o-mini"))
        temperature = float(os.getenv("OPENAI_DIAGNOSTIC_TEMPERATURE", os.getenv("OPENAI_TEMPERATURE", "0.7")))
        max_tokens = int(os.getenv("OPENAI_DIAGNOSTIC_MAX_TOKENS", os.getenv("OPENAI_MAX_TOKENS", "1800")))

        return OpenAISettings(
            api_key=api_key,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
        )


class OpenAIClient:
    """Thin wrapper around the OpenAI SDK with JSON convenience helpers."""

    def __init__(self, settings: Optional[OpenAISettings] = None):
        self.settings = settings or OpenAISettings.from_env()
        self._client = OpenAI(api_key=self.settings.api_key)

    def json_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        *,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        retry_attempts: int = 3,
    ) -> Dict[str, Any]:
        """
        Request a JSON-formatted completion and parse the response.

        Args:
            system_prompt: The system instructions supplied to the model.
            user_prompt: The user content describing generation requirements.
            temperature: Optional override of sampling temperature.
            max_tokens: Optional override for completion tokens.
            retry_attempts: Number of times to retry on transient failures.

        Returns:
            Parsed JSON dictionary response from the model.

        Raises:
            OpenAIClientError: If the request ultimately fails or JSON parsing fails.
        """
        temperature = temperature if temperature is not None else self.settings.temperature
        max_tokens = max_tokens or self.settings.max_tokens

        last_error: Optional[Exception] = None

        for attempt in range(1, retry_attempts + 1):
            try:
                result = self._client.chat.completions.create(
                    model=self.settings.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=temperature,
                    max_tokens=max_tokens,
                    response_format={"type": "json_object"},
                )

                content = result.choices[0].message.content or "{}"
                return self._parse_json(content)

            except (RateLimitError, APIConnectionError) as exc:
                last_error = exc
                logger.warning("OpenAI transient error (attempt %s/%s): %s", attempt, retry_attempts, exc)
            except OpenAIError as exc:
                last_error = exc
                logger.error("OpenAI API error (attempt %s/%s): %s", attempt, retry_attempts, exc)
                break  # non-retriable SDK error
            except json.JSONDecodeError as exc:
                logger.error("Failed to parse JSON response: %s", exc)
                raise OpenAIClientError(f"Malformed JSON returned by model: {exc}") from exc

        raise OpenAIClientError(f"OpenAI request failed after {retry_attempts} attempts: {last_error}")

    @staticmethod
    def _parse_json(payload: str) -> Dict[str, Any]:
        """Strip optional fences and parse JSON."""
        text = payload.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return json.loads(text.strip())


def get_openai_client() -> OpenAIClient:
    """Factory for lazily creating an OpenAI client instance."""
    return OpenAIClient()
