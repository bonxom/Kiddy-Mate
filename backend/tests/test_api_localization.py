import json

import pytest

import app.modules.ai.application.generation_service as generation_service
import app.modules.reports.application.report_service as report_service


async def _login_child(client, *, username: str, password: str) -> dict[str, str]:
    response = await client.post(
        "/child/auth/login",
        json={"username": username, "password": password},
    )
    assert response.status_code == 200
    payload = response.json()
    return {"Authorization": f"Bearer {payload['access_token']}"}


@pytest.mark.asyncio
async def test_root_and_errors_respect_request_locale(api_context):
    client = api_context.client

    root_response = await client.get("/", headers={"Accept-Language": "vi-VN,vi;q=0.9"})
    assert root_response.status_code == 200
    assert root_response.headers["content-language"] == "vi"
    assert root_response.json()["message"] == "Chao mung ban den voi KiddyMate API!"

    child_headers = await _login_child(
        client,
        username="kidtester",
        password="childpass123",
    )
    child_headers["X-Language"] = "vi"

    forbidden_response = await client.get("/parent/children", headers=child_headers)
    assert forbidden_response.status_code == 403
    assert forbidden_response.headers["content-language"] == "vi"
    assert "phu huynh" in forbidden_response.json()["detail"].lower()

    complete_response = await client.post(
        f"/child/me/tasks/{api_context.tasks.assigned.id}/complete",
        headers=child_headers,
    )
    assert complete_response.status_code == 200
    assert "phu huynh xac minh" in complete_response.json()["message"].lower()


@pytest.mark.asyncio
async def test_report_generation_passes_language_requirement_to_llm(api_context, monkeypatch):
    captured: dict[str, str] = {}

    def localized_report_stub(
        prompt: str,
        system_instruction: str | None = None,
        max_tokens: int = 1024,
        **_: object,
    ) -> str:
        captured["prompt"] = prompt
        captured["system_instruction"] = system_instruction or ""
        return json.dumps(
            {
                "summary_text": "Bao cao tien do bang tieng Viet.",
                "insights": {
                    "tasks_completed": 2,
                    "tasks_verified": 1,
                    "emotion_trends": {"Happy": 60, "Curious": 40},
                    "most_common_emotion": "Happy",
                    "emotional_analysis": "Phan tich cam xuc bang tieng Viet.",
                    "task_performance": "Tien do tot.",
                    "strengths": ["Curiosity"],
                    "areas_for_improvement": ["Patience"],
                },
                "suggestions": {
                    "focus": "Social growth",
                    "recommended_activities": ["Story sharing"],
                    "parenting_tips": ["Encourage reflection"],
                    "emotional_support": "Talk about feelings",
                },
            }
        )

    monkeypatch.setattr(report_service, "generate_openai_response", localized_report_stub)

    response = await api_context.client.post(
        f"/parent/reports/{api_context.child.id}/generate",
        headers={**api_context.headers.parent, "X-Language": "vi"},
    )

    assert response.status_code == 200
    assert response.headers["content-language"] == "vi"
    assert "vietnamese" in captured["system_instruction"].lower()
    assert "language requirement" in captured["prompt"].lower()


@pytest.mark.asyncio
async def test_parent_ai_generation_passes_language_requirement_to_llm(api_context, monkeypatch):
    captured: dict[str, str] = {}

    def localized_generation_stub(
        prompt: str,
        system_instruction: str | None = None,
        max_tokens: int = 1024,
    ) -> str:
        captured["prompt"] = prompt
        captured["system_instruction"] = system_instruction or ""
        return json.dumps(
            [
                {
                    "title": "Nhiem vu giao tiep",
                    "description": "Noi mot dieu tich cuc voi nguoi than.",
                    "category": "Social",
                    "type": "emotion",
                    "difficulty": 2,
                    "suggested_age_range": "6-8",
                    "reward_coins": 60,
                    "unity_type": "talk",
                }
            ]
        )

    monkeypatch.setattr(generation_service, "generate_gemini_response", localized_generation_stub)

    response = await api_context.client.post(
        f"/parent/children/{api_context.child.id}/generate/chat",
        json={"prompt": "Generate one social task."},
        headers={**api_context.headers.parent, "X-Language": "vi"},
    )

    assert response.status_code == 200
    assert response.headers["content-language"] == "vi"
    assert "vietnamese" in captured["system_instruction"].lower()
