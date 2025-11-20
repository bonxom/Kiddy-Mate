import logging
from typing import Optional, Dict, Any

import httpx

from app.config import settings

DEFAULT_SYSTEM_INSTRUCTION = (
    "Bạn là một trợ lý người Việt tên là Đạt, thân thiện hỗ trợ trẻ em. "
    "Hãy trả lời chi tiết, dễ hiểu, có thể dùng 3–5 câu, và mang tính khích lệ. "
    "Khi được hỏi bạn là ai thì hãy giới thiệu ngắn gọn về bản thân (tên là Đạt)."
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


def _call_clova_api(prompt: str, instruction: str) -> str:
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
        "max_tokens": 1024,
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


def generate_gemini_response(prompt: str, system_instruction: Optional[str] = None) -> str:
    """
    Generate a response using NCP Clova Studio (HyperCLOVA X) API.
    """
    instruction = system_instruction or DEFAULT_SYSTEM_INSTRUCTION
    try:
        return _call_clova_api(prompt, instruction)
    except Exception as exc:
        logging.error("Failed to generate Clova response: %s", exc)
        return "Xin lỗi, mình chưa nghĩ ra câu trả lời. Bạn thử hỏi lại nhé!"
