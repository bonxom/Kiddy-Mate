from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from ai_gateway.request_context import get_request_id

logger = logging.getLogger("ai_gateway.errors")


@dataclass(slots=True)
class GatewayError(Exception):
    code: str
    message: str
    status_code: int = status.HTTP_400_BAD_REQUEST
    details: dict[str, Any] | None = None


def build_error_payload(
    request: Request,
    *,
    code: str,
    message: str,
    details: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "requestId": get_request_id(request),
        "error": {
            "code": code,
            "message": message,
            "details": details or {},
        },
    }


async def gateway_error_handler(request: Request, exc: GatewayError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=build_error_payload(
            request,
            code=exc.code,
            message=exc.message,
            details=exc.details,
        ),
    )


async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=build_error_payload(
            request,
            code="validation_error",
            message="Request validation failed.",
            details={"issues": exc.errors()},
        ),
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled gateway exception for %s", request.url.path, exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=build_error_payload(
            request,
            code="internal_server_error",
            message="An unexpected gateway error occurred.",
        ),
    )
