import logging
from typing import Optional, Dict, Any

import httpx

from app.config import settings

DEFAULT_SYSTEM_INSTRUCTION = (
    "You are a friendly Vietnamese assistant named Dat, helping children. "
    "Please answer in detail, easy to understand, using 3-5 sentences, and be encouraging. "
    "When asked who you are, briefly introduce yourself (name is Dat)."
)

DEFAULT_TIMEOUT = 30.0


def _get_credentials() -> tuple[str, str]:
    api_key = settings.NCP_API_KEY
    endpoint = settings.NCP_CLOVASTUDIO_ENDPOINT
    if not api_key:
        raise RuntimeError("NCP_API_KEY is not configured")
    if not endpoint:
        raise RuntimeError("NCP_CLOVASTUDIO_ENDPOINT is not configured")
    return api_key, endpoint


def _extract_text_from_body(body: Dict[str, Any]) -> Optional[str]:
    if not isinstance(body, dict):
        return None

    choices = body.get("choices")
    if isinstance(choices, list) and choices:
        first_choice = choices[0] or {}
        message = first_choice.get("message", {})
        if isinstance(message, dict):
            text = message.get("content") or message.get("text")
            if text:
                return text

    result = body.get("result")
    if isinstance(result, dict):
        text = (
            result.get("output_text")
            or result.get("message", {}).get("content")
            or result.get("text")
        )
        if text:
            return text

    message = body.get("message")
    if isinstance(message, dict):
        text = message.get("content") or message.get("text")
        if text:
            return text

    text = body.get("output_text") or body.get("text")
    return text


def _call_clova_api(prompt: str, instruction: str, max_tokens: int = 1024) -> str:
    api_key, endpoint = _get_credentials()
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    request_body = {
        "messages": [
            {"role": "system", "content": instruction},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "top_p": 0.9,
        "max_tokens": max_tokens,
        "stream": False,
    }

    try:
        with httpx.Client(timeout=DEFAULT_TIMEOUT) as client:
            response = client.post(endpoint, headers=headers, json=request_body)
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise RuntimeError(
            f"HTTP {exc.response.status_code}: {exc.response.text}"
        ) from exc
    except httpx.HTTPError as exc:
        raise RuntimeError(f"HTTP error contacting Clova Studio: {exc}") from exc

    try:
        body = response.json()
    except ValueError as exc:
        raise RuntimeError(f"Invalid JSON response: {exc}") from exc

    text = _extract_text_from_body(body)
    if not text:
        raise RuntimeError(f"Could not extract text from response: {body}")
    return text.strip()


def generate_gemini_response(prompt: str, system_instruction: Optional[str] = None, max_tokens: int = 1024) -> str:
    """
    Generate a response using NCP Clova Studio (HyperCLOVA X) API.
    
    Args:
        prompt: User prompt
        system_instruction: System instruction (optional)
        max_tokens: Maximum tokens in response (default: 1024)
    """
    instruction = system_instruction or DEFAULT_SYSTEM_INSTRUCTION
    try:
        return _call_clova_api(prompt, instruction, max_tokens)
    except Exception as exc:
        logging.error("Failed to generate Clova response: %s", exc)
        return "Sorry, I haven't thought of an answer yet. Please try asking again!"
