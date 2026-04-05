from __future__ import annotations

import time
import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

REQUEST_ID_HEADER = "X-Request-Id"
PROCESS_TIME_HEADER = "X-Process-Time-Ms"


def ensure_request_id(request: Request) -> str:
    existing = getattr(request.state, "request_id", None)
    if existing:
        return existing

    request_id = request.headers.get(REQUEST_ID_HEADER, "").strip() or uuid.uuid4().hex
    request.state.request_id = request_id
    return request_id


def get_request_id(request: Request) -> str:
    return ensure_request_id(request)


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = ensure_request_id(request)
        started_at = time.perf_counter()
        request.state.started_at = started_at

        response = await call_next(request)

        latency_ms = int((time.perf_counter() - started_at) * 1000)
        request.state.latency_ms = latency_ms
        response.headers.setdefault(REQUEST_ID_HEADER, request_id)
        response.headers.setdefault(PROCESS_TIME_HEADER, str(latency_ms))
        return response
