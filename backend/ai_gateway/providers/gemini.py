from __future__ import annotations

from dataclasses import dataclass

import httpx

from ai_gateway.config import GatewaySettings
from ai_gateway.errors import GatewayError
from ai_gateway.providers.http import execute_with_retry


@dataclass(slots=True)
class GeminiResult:
    text: str
    provider: str
    model: str


class GeminiProvider:
    provider_name = "gemini"

    def __init__(self, client: httpx.AsyncClient, settings: GatewaySettings) -> None:
        self.client = client
        self.settings = settings

    async def generate_text(
        self,
        *,
        user_message: str,
        system_prompt: str | None,
        conversation_context: str | None,
        model_override: str | None,
        temperature: float | None,
        max_output_tokens: int | None,
        request_id: str,
    ) -> GeminiResult:
        if not self.settings.GEMINI_API_KEY:
            raise GatewayError(
                code="gemini_not_configured",
                message="GEMINI_API_KEY is not configured for the gateway.",
                status_code=500,
            )

        model = (model_override or self.settings.GEMINI_MODEL).strip()
        prompt_sections = [section.strip() for section in [system_prompt, conversation_context] if section and section.strip()]
        prompt_sections.append(user_message.strip())
        composite_prompt = "\n\n".join(prompt_sections)

        payload = {
            "contents": [{"parts": [{"text": composite_prompt}]}],
            "generationConfig": {
                "temperature": temperature if temperature is not None else self.settings.GEMINI_TEMPERATURE,
                "maxOutputTokens": max_output_tokens if max_output_tokens is not None else self.settings.GEMINI_MAX_OUTPUT_TOKENS,
            },
        }

        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

        response = await execute_with_retry(
            lambda: self.client.post(
                endpoint,
                params={"key": self.settings.GEMINI_API_KEY},
                json=payload,
                headers={"Content-Type": "application/json", "X-Request-Id": request_id},
            ),
            retries=self.settings.AI_GATEWAY_MAX_RETRIES,
            retry_backoff_seconds=self.settings.AI_GATEWAY_RETRY_BACKOFF_SECONDS,
            upstream_name="gemini",
        )

        data = response.json()
        candidates = data.get("candidates") or []
        if not candidates:
            raise GatewayError(
                code="gemini_empty_response",
                message="Gemini returned no candidates.",
                status_code=502,
                details={"upstreamPayload": data},
            )

        candidate = candidates[0] or {}
        content = candidate.get("content") or {}
        parts = content.get("parts") or []
        if not parts or not isinstance(parts[0], dict) or not str(parts[0].get("text") or "").strip():
            raise GatewayError(
                code="gemini_invalid_response",
                message="Gemini response did not contain usable text.",
                status_code=502,
                details={"upstreamPayload": data},
            )

        return GeminiResult(
            text=str(parts[0]["text"]).strip(),
            provider=self.provider_name,
            model=model,
        )
