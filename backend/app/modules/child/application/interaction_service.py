from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel

from app.core.security.child_context import ChildAuthContext, build_child_auth_context
from app.modules.child.domain.interaction_gateways import ChildInteractionGateway
from app.modules.child.domain.interaction_repositories import ChildInteractionRepository
from app.modules.child.infrastructure.interaction_gateway import LLMChildInteractionGateway
from app.modules.child.infrastructure.interaction_repository import BeanieChildInteractionRepository
from app.modules.children.domain.models import Child
from app.modules.interactions.domain.models import InteractionLog


class ChatRequest(BaseModel):
    user_input: Optional[str] = None
    message: Optional[str] = None
    context: Optional[str] = None

    def get_user_input(self) -> str:
        if self.user_input:
            return self.user_input
        if self.message:
            return self.message
        raise ValueError("Either 'user_input' or 'message' field is required")


def _child_context(child: Child) -> ChildAuthContext:
    return build_child_auth_context(child=child)


def _repository(repository: ChildInteractionRepository | None = None) -> ChildInteractionRepository:
    return repository or BeanieChildInteractionRepository()


def _gateway(gateway: ChildInteractionGateway | None = None) -> ChildInteractionGateway:
    return gateway or LLMChildInteractionGateway()


async def chat(
    request: ChatRequest,
    child: Child,
    context: ChildAuthContext | None = None,
    repository: ChildInteractionRepository | None = None,
    gateway: ChildInteractionGateway | None = None,
) -> dict:
    _ = context or _child_context(child)
    repo = _repository(repository)
    llm_gateway = _gateway(gateway)
    user_input = request.get_user_input()

    if request.context:
        prompt = f"Context: {request.context}\nUser asks: {user_input}"
    else:
        prompt = f"User asks: {user_input}"

    avatar_response = llm_gateway.generate_avatar_response(prompt)
    detected_emotion = llm_gateway.detect_emotion(user_input)
    interaction_log = InteractionLog(
        child=child,  # type: ignore[arg-type]
        user_input=user_input,
        avatar_response=avatar_response,
        detected_emotion=detected_emotion,
    )
    await repo.create_log(interaction_log)
    return {"message": "Interaction recorded successfully.", "avatar_response": avatar_response}


async def get_logs(
    child: Child,
    context: ChildAuthContext | None = None,
    repository: ChildInteractionRepository | None = None,
) -> dict[str, list[dict[str, Any]]]:
    _ = context or _child_context(child)
    repo = _repository(repository)
    logs = await repo.list_logs(child)

    emotion_counts: dict[str, int] = {}
    for log in logs:
        emotion = log.detected_emotion or "Neutral"
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1

    emotions = [
        {"name": emotion.capitalize(), "value": count}
        for emotion, count in emotion_counts.items()
    ]
    if not emotions:
        emotions = [
            {"name": "Happy", "value": 0},
            {"name": "Sad", "value": 0},
            {"name": "Neutral", "value": 0},
        ]
    return {"emotions": emotions}


async def get_history(
    child: Child,
    limit: Optional[int] = 20,
    context: ChildAuthContext | None = None,
    repository: ChildInteractionRepository | None = None,
) -> list[dict[str, Any]]:
    _ = context or _child_context(child)
    repo = _repository(repository)
    logs = await repo.list_logs(child)
    logs.sort(key=lambda log: log.timestamp, reverse=True)
    logs = logs[: limit or 20]
    return [
        {
            "id": str(log.id),
            "timestamp": log.timestamp.isoformat(),
            "user_input": log.user_input,
            "avatar_response": log.avatar_response,
            "detected_emotion": log.detected_emotion or "Neutral",
        }
        for log in logs
    ]
