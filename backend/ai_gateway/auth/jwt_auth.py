from __future__ import annotations

from typing import Any

from fastapi import Request, status
from jose import JWTError, jwt
from pydantic import BaseModel, Field
from starlette.middleware.base import BaseHTTPMiddleware

from ai_gateway.config import GatewaySettings
from ai_gateway.errors import GatewayError, build_error_payload
from ai_gateway.request_context import get_request_id


class AuthenticatedChild(BaseModel):
    child_id: str
    username: str | None = None
    display_name: str | None = None
    claims: dict[str, Any] = Field(default_factory=dict)


def _decode_child_token(token: str, settings: GatewaySettings) -> AuthenticatedChild:
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    if payload.get("type") != "child":
        raise GatewayError(
            code="invalid_token_type",
            message="Gateway only accepts child access tokens.",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    child_id = str(payload.get("child_id") or payload.get("sub") or "").strip()
    if not child_id:
        raise GatewayError(
            code="invalid_token_claims",
            message="Child token is missing child_id/sub claim.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    return AuthenticatedChild(
        child_id=child_id,
        username=payload.get("child_username"),
        display_name=payload.get("child_name") or payload.get("display_name"),
        claims=payload,
    )


class JwtAuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, settings: GatewaySettings) -> None:
        super().__init__(app)
        self.settings = settings

    async def dispatch(self, request: Request, call_next):
        if (
            not request.url.path.startswith("/runtime/")
            or request.method.upper() == "OPTIONS"
            or request.url.path == "/runtime/v1/health"
        ):
            return await call_next(request)

        if not self.settings.AI_GATEWAY_REQUIRE_AUTH:
            return await call_next(request)

        authorization = request.headers.get("Authorization", "").strip()
        if not authorization.startswith("Bearer "):
            return self._build_error_response(
                request,
                code="missing_bearer_token",
                message="Bearer token is required for runtime gateway access.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        token = authorization[len("Bearer ") :].strip()
        try:
            request.state.authenticated_child = _decode_child_token(token, self.settings)
        except GatewayError as exc:
            return self._build_error_response(
                request,
                code=exc.code,
                message=exc.message,
                status_code=exc.status_code,
                details=exc.details,
            )
        except JWTError:
            return self._build_error_response(
                request,
                code="invalid_token",
                message="Bearer token is invalid or expired.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        return await call_next(request)

    @staticmethod
    def _build_error_response(
        request: Request,
        *,
        code: str,
        message: str,
        status_code: int,
        details: dict[str, Any] | None = None,
    ):
        from fastapi.responses import JSONResponse

        return JSONResponse(
            status_code=status_code,
            content=build_error_payload(
                request,
                code=code,
                message=message,
                details=details,
            ),
            headers={"WWW-Authenticate": "Bearer", "X-Request-Id": get_request_id(request)},
        )


def require_authenticated_child(request: Request) -> AuthenticatedChild:
    authenticated_child = getattr(request.state, "authenticated_child", None)
    if authenticated_child is None:
        raise GatewayError(
            code="authentication_required",
            message="Runtime gateway authentication is required.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    return authenticated_child
