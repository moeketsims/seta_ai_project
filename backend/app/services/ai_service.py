"""
Core AI Service - OpenAI Integration Wrapper
Handles all OpenAI API interactions with error handling, rate limiting, and cost tracking.
"""

import os
import time
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from openai import OpenAI, OpenAIError, RateLimitError, APIConnectionError
import tiktoken

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIServiceError(Exception):
    """Custom exception for AI service errors"""
    pass

class AIService:
    """
    Core service for OpenAI API interactions.
    Provides error handling, cost tracking, and graceful fallbacks.
    """

    def __init__(self):
        """Initialize OpenAI client with configuration from environment"""
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "2000"))
        self.temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))

        if not self.api_key:
            raise AIServiceError("OPENAI_API_KEY not found in environment variables")

        self.client = OpenAI(api_key=self.api_key)
        self.encoding = tiktoken.encoding_for_model("gpt-4")  # Works for all GPT-4 variants

        # Cost tracking (per 1M tokens as of 2025)
        self.pricing = {
            "gpt-4o": {"input": 2.50, "output": 10.00},
            "gpt-4o-mini": {"input": 0.15, "output": 0.60},
            "gpt-3.5-turbo": {"input": 0.50, "output": 1.50}
        }

        logger.info(f"AIService initialized with model: {self.model}")

    def count_tokens(self, text: str) -> int:
        """Count tokens in a text string"""
        try:
            return len(self.encoding.encode(text))
        except Exception as e:
            logger.warning(f"Error counting tokens: {e}, estimating instead")
            return len(text) // 4  # Rough estimate: 1 token ≈ 4 characters

    def calculate_cost(self, input_tokens: int, output_tokens: int, model: str = None) -> float:
        """Calculate cost in USD for token usage"""
        model = model or self.model

        if model not in self.pricing:
            logger.warning(f"Pricing not found for model {model}, using gpt-4o-mini rates")
            model = "gpt-4o-mini"

        input_cost = (input_tokens / 1_000_000) * self.pricing[model]["input"]
        output_cost = (output_tokens / 1_000_000) * self.pricing[model]["output"]

        return input_cost + output_cost

    def get_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        json_mode: bool = False,
        retry_count: int = 3,
        retry_delay: float = 1.0
    ) -> Dict[str, Any]:
        """
        Get completion from OpenAI with error handling and retries.

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model to use (defaults to instance model)
            temperature: Sampling temperature (defaults to instance temperature)
            max_tokens: Maximum tokens in response (defaults to instance max_tokens)
            json_mode: Whether to request JSON output format
            retry_count: Number of retries on failure
            retry_delay: Delay between retries in seconds

        Returns:
            Dict with keys: 'content', 'usage', 'cost', 'model', 'timestamp'

        Raises:
            AIServiceError: If all retries fail
        """
        model = model or self.model
        temperature = temperature if temperature is not None else self.temperature
        max_tokens = max_tokens or self.max_tokens

        start_time = time.time()
        last_error = None

        for attempt in range(retry_count):
            try:
                # Prepare request parameters
                request_params = {
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }

                if json_mode:
                    request_params["response_format"] = {"type": "json_object"}

                # Make API call
                response = self.client.chat.completions.create(**request_params)

                # Extract response data
                content = response.choices[0].message.content
                usage = response.usage

                # Calculate cost
                cost = self.calculate_cost(
                    input_tokens=usage.prompt_tokens,
                    output_tokens=usage.completion_tokens,
                    model=model
                )

                # Calculate response time
                response_time = time.time() - start_time

                # Log usage
                self._log_usage(
                    model=model,
                    input_tokens=usage.prompt_tokens,
                    output_tokens=usage.completion_tokens,
                    cost=cost,
                    response_time=response_time
                )

                return {
                    "content": content,
                    "usage": {
                        "prompt_tokens": usage.prompt_tokens,
                        "completion_tokens": usage.completion_tokens,
                        "total_tokens": usage.total_tokens
                    },
                    "cost": cost,
                    "model": model,
                    "timestamp": datetime.utcnow().isoformat(),
                    "response_time": response_time
                }

            except RateLimitError as e:
                last_error = e
                logger.warning(f"Rate limit hit (attempt {attempt + 1}/{retry_count}): {e}")
                if attempt < retry_count - 1:
                    time.sleep(retry_delay * (attempt + 1))  # Exponential backoff

            except APIConnectionError as e:
                last_error = e
                logger.warning(f"API connection error (attempt {attempt + 1}/{retry_count}): {e}")
                if attempt < retry_count - 1:
                    time.sleep(retry_delay)

            except OpenAIError as e:
                last_error = e
                logger.error(f"OpenAI error (attempt {attempt + 1}/{retry_count}): {e}")
                if attempt < retry_count - 1:
                    time.sleep(retry_delay)

            except Exception as e:
                last_error = e
                logger.error(f"Unexpected error (attempt {attempt + 1}/{retry_count}): {e}")
                if attempt < retry_count - 1:
                    time.sleep(retry_delay)

        # All retries failed
        error_msg = f"AI service failed after {retry_count} attempts: {last_error}"
        logger.error(error_msg)
        raise AIServiceError(error_msg)

    def _log_usage(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int,
        cost: float,
        response_time: float
    ):
        """Log API usage for monitoring and cost tracking"""
        logger.info(
            f"AI Usage | Model: {model} | "
            f"Input: {input_tokens} tokens | "
            f"Output: {output_tokens} tokens | "
            f"Cost: ${cost:.6f} | "
            f"Time: {response_time:.2f}s"
        )

    def create_system_message(self, content: str) -> Dict[str, str]:
        """Helper to create system message"""
        return {"role": "system", "content": content}

    def create_user_message(self, content: str) -> Dict[str, str]:
        """Helper to create user message"""
        return {"role": "user", "content": content}

    def create_assistant_message(self, content: str) -> Dict[str, str]:
        """Helper to create assistant message"""
        return {"role": "assistant", "content": content}

    def health_check(self) -> Dict[str, Any]:
        """
        Check if OpenAI API is accessible and working.

        Returns:
            Dict with status information
        """
        try:
            # Send minimal test request
            messages = [
                self.create_system_message("You are a helpful assistant."),
                self.create_user_message("Say 'OK'")
            ]

            result = self.get_completion(
                messages=messages,
                max_tokens=10,
                retry_count=1
            )

            return {
                "status": "healthy",
                "model": self.model,
                "api_accessible": True,
                "test_cost": result["cost"],
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "model": self.model,
                "api_accessible": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }


# Singleton instance
_ai_service_instance: Optional[AIService] = None

def get_ai_service() -> AIService:
    """
    Get or create singleton AIService instance.
    Use this function to get the AI service throughout the application.
    """
    global _ai_service_instance

    if _ai_service_instance is None:
        _ai_service_instance = AIService()

    return _ai_service_instance
