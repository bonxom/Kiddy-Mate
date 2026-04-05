from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class GatewayModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


class RuntimeMetadata(GatewayModel):
    requestId: str
    latencyMs: int
    provider: str
