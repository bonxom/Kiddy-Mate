from __future__ import annotations

from fastapi import Request

from ai_gateway.config import GatewaySettings


def get_settings(request: Request) -> GatewaySettings:
    return request.app.state.gateway_settings


def get_runtime_service(request: Request):
    return request.app.state.runtime_service
