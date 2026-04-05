from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable
from typing import Any

import httpx

from ai_gateway.errors import GatewayError

RETRYABLE_STATUS_CODES = {408, 409, 425, 429, 500, 502, 503, 504}


def _extract_upstream_error(response: httpx.Response) -> dict[str, Any]:
    try:
        payload = response.json()
    except ValueError:
        payload = {"text": response.text}
    return payload if isinstance(payload, dict) else {"payload": payload}


def _message_from_upstream(error_payload: dict[str, Any], default_message: str) -> str:
    error_node = error_payload.get("error")
    if isinstance(error_node, dict):
        return str(error_node.get("message") or error_node.get("status") or default_message)
    if isinstance(error_node, str) and error_node.strip():
        return error_node
    if isinstance(error_payload.get("message"), str) and error_payload["message"].strip():
        return str(error_payload["message"])
    if isinstance(error_payload.get("text"), str) and error_payload["text"].strip():
        return str(error_payload["text"])
    return default_message


async def execute_with_retry(
    operation: Callable[[], Awaitable[httpx.Response]],
    *,
    retries: int,
    retry_backoff_seconds: float,
    upstream_name: str,
) -> httpx.Response:
    attempt = 0
    while True:
        try:
            response = await operation()
        except httpx.TimeoutException as exc:
            if attempt < retries:
                attempt += 1
                await asyncio.sleep(retry_backoff_seconds * attempt)
                continue

            raise GatewayError(
                code=f"{upstream_name}_timeout",
                message=f"{upstream_name} timed out.",
                status_code=504,
            ) from exc
        except httpx.HTTPError as exc:
            raise GatewayError(
                code=f"{upstream_name}_network_error",
                message=f"{upstream_name} request failed before a response was received.",
                status_code=502,
                details={"error": str(exc)},
            ) from exc

        if response.status_code < 400:
            return response

        error_payload = _extract_upstream_error(response)
        if response.status_code in RETRYABLE_STATUS_CODES and attempt < retries:
            attempt += 1
            await asyncio.sleep(retry_backoff_seconds * attempt)
            continue

        raise GatewayError(
            code=f"{upstream_name}_upstream_error",
            message=_message_from_upstream(error_payload, f"{upstream_name} request failed."),
            status_code=502,
            details={
                "upstreamStatus": response.status_code,
                "upstreamPayload": error_payload,
            },
        )
