import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from types import SimpleNamespace
from uuid import uuid4

import pytest_asyncio
from beanie import Link, init_beanie
from httpx import ASGITransport, AsyncClient
from mongomock_motor import AsyncMongoMockClient

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))
os.environ.setdefault("DATABASE_URL", "mongodb://localhost:27017")
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")

from app.core.time import utc_now
import app.bootstrap.app_factory as app_factory
import app.modules.ai.application.generation_service as generation_service
import app.modules.children.application.children_service as children_service
import app.modules.dashboard.application.dashboard_service as dashboard_service
import app.modules.interactions.application.interaction_service as interaction_service
import app.modules.parent.application.onboarding_service as onboarding_service
import app.modules.reports.application.report_service as report_service
from app.bootstrap.app_factory import create_app
from app.models.beanie_models import (
    Child,
    ChildDevelopmentAssessment,
    ChildReward,
    ChildTask,
    GameSession,
    InteractionLog,
    MiniGame,
    RedemptionRequest,
    Report,
    Reward,
    Task,
    User,
)
from app.models.childtask_models import ChildTaskPriority, ChildTaskStatus, UnityType as ChildTaskUnityType
from app.models.reward_models import RewardType
from app.models.task_models import TaskCategory, TaskType, UnityType as TaskUnityType
from app.services.auth import create_access_token, hash_password


def _stub_assessment_analysis(*args, **kwargs):
    return {
        "overall_traits": {
            "independence": 72,
            "emotional": 68,
            "discipline": 70,
            "social": 66,
            "logic": 74,
        },
        "explanations": {
            "independence": "Strong routine building.",
            "emotional": "Stable emotional awareness.",
            "discipline": "Good consistency.",
            "social": "Positive interaction patterns.",
            "logic": "Solid reasoning ability.",
        },
        "recommended_focus": ["Social", "Emotional"],
    }


def _stub_openai_response(prompt: str, system_instruction: str | None = None, max_tokens: int = 1024) -> str:
    if "Generate a report with the following structure" in prompt:
        return json.dumps(
            {
                "summary_text": "Child shows steady progress and healthy engagement.",
                "insights": {
                    "tasks_completed": 2,
                    "tasks_verified": 1,
                    "emotion_trends": {"Happy": 50, "Confident": 30, "Engaged": 20},
                    "most_common_emotion": "Happy",
                    "emotional_analysis": "Task completion patterns suggest positive engagement.",
                    "task_performance": "Strong completion in logic and social tasks.",
                    "strengths": ["Consistency", "Curiosity"],
                    "areas_for_improvement": ["Patience"],
                },
                "suggestions": {
                    "focus": "Social growth",
                    "recommended_activities": ["Group puzzle", "Story sharing"],
                    "parenting_tips": ["Praise effort", "Keep routines stable"],
                    "emotional_support": "Use reflective questions after tasks.",
                },
            }
        )

    if "EMOTION ANALYSIS FROM REPORT" in prompt:
        return json.dumps(
            [
                {
                    "title": "Feelings Story Time",
                    "description": "Read a story and talk about how characters feel.",
                    "category": "Social",
                    "type": "emotion",
                    "difficulty": 2,
                    "suggested_age_range": "6-8",
                    "reward_coins": 80,
                    "unity_type": "talk",
                }
            ]
        )

    return "Stub response"


def _stub_gemini_response(prompt: str, system_instruction: str | None = None, max_tokens: int = 1024) -> str:
    if "Evaluate and score 5 aspects" in prompt:
        return json.dumps(
            {
                "logic": 77,
                "independence": 70,
                "emotional": 68,
                "discipline": 72,
                "social": 74,
            }
        )

    if "REQUIREMENT: Create 1 task appropriate for this child." in prompt:
        return json.dumps(
            [
                {
                    "title": "Morning Routine Check",
                    "description": "Complete a simple morning routine independently.",
                    "category": "Independence",
                    "type": "logic",
                    "difficulty": 2,
                    "suggested_age_range": "6-8",
                    "reward_coins": 60,
                    "reward_badge_name": "Routine Star",
                    "unity_type": "life",
                }
            ]
        )

    return "Xin chao, minh o day de giup ban!"


async def _stub_generate_initial_tasks_for_child(child_id: str) -> None:
    return None


@pytest_asyncio.fixture
async def api_context(monkeypatch):
    mock_client = AsyncMongoMockClient()
    test_db = mock_client[f"kiddy_mate_test_{uuid4().hex}"]

    async def compatible_list_collection_names(*args, **kwargs):
        kwargs.pop("authorizedCollections", None)
        kwargs.pop("nameOnly", None)
        proxy_db = test_db.__dict__["_AsyncMongoMockDatabase__database"]
        return proxy_db.list_collection_names(*args, **kwargs)

    test_db.list_collection_names = compatible_list_collection_names  # type: ignore[method-assign]

    async def init_test_database() -> None:
        User.model_rebuild(_types_namespace={"Child": Child})
        Reward.model_rebuild(_types_namespace={"User": User})
        await init_beanie(
            database=test_db,
            document_models=[
                User,
                Child,
                ChildDevelopmentAssessment,
                Task,
                Reward,
                ChildReward,
                RedemptionRequest,
                MiniGame,
                GameSession,
                InteractionLog,
                Report,
                ChildTask,
            ],
        )

    async def noop_scheduler() -> None:
        return None

    monkeypatch.setattr(app_factory, "init_database", init_test_database)
    monkeypatch.setattr(app_factory, "startup_scheduler", noop_scheduler)
    monkeypatch.setattr(app_factory, "shutdown_scheduler", noop_scheduler)

    monkeypatch.setattr(onboarding_service, "analyze_assessment_with_chatgpt", _stub_assessment_analysis)
    monkeypatch.setattr(children_service, "analyze_assessment_with_chatgpt", _stub_assessment_analysis)
    monkeypatch.setattr(generation_service, "generate_gemini_response", _stub_gemini_response)
    monkeypatch.setattr(interaction_service, "generate_gemini_response", _stub_gemini_response)
    monkeypatch.setattr(report_service, "generate_openai_response", _stub_openai_response)
    monkeypatch.setattr(dashboard_service, "generate_openai_response", _stub_openai_response)
    monkeypatch.setattr(generation_service, "generate_initial_tasks_for_child", _stub_generate_initial_tasks_for_child)

    app = create_app()
    await init_test_database()

    parent = User(
        email="parent@example.com",
        password_hash=hash_password("password123"),
        full_name="Parent Tester",
        phone_number="0123456789",
        onboarding_completed=True,
    )
    await parent.insert()

    child = Child(
        parent=Link(parent, User),  # type: ignore[arg-type]
        name="Kid Tester",
        birth_date=utc_now() - timedelta(days=8 * 365),
        username="kidtester",
        password_hash=hash_password("childpass123"),
        nickname="Kiddo",
        gender="female",
        personality=["curious"],
        interests=["drawing", "stories"],
        strengths=["logic"],
        challenges=["patience"],
        initial_traits={
            "overall_traits": {
                "independence": 60,
                "emotional": 55,
                "discipline": 58,
                "social": 57,
                "logic": 62,
            },
            "explanations": {},
            "recommended_focus": ["Social"],
        },
        current_coins=500,
        level=3,
    )
    await child.insert()

    assessment = ChildDevelopmentAssessment(
        child=Link(child, Child),  # type: ignore[arg-type]
        parent=Link(parent, User),  # type: ignore[arg-type]
        discipline_autonomy={"completes_personal_tasks": "4"},
        emotional_intelligence={"shows_empathy": "4"},
        social_interaction={"shares_and_waits_turns": "3"},
    )
    await assessment.insert()

    task_logic = Task(
        title="Logic Blocks",
        description="Solve a simple block puzzle.",
        category=TaskCategory.LOGIC,
        type=TaskType.LOGIC,
        difficulty=2,
        suggested_age_range="6-8",
        reward_coins=50,
        unity_type=TaskUnityType.CHOICE,
    )
    await task_logic.insert()

    task_social = Task(
        title="Share a Story",
        description="Tell a short story to a parent.",
        category=TaskCategory.SOCIAL,
        type=TaskType.EMOTION,
        difficulty=2,
        suggested_age_range="6-8",
        reward_coins=40,
        unity_type=TaskUnityType.TALK,
    )
    await task_social.insert()

    task_physical = Task(
        title="Stretch Time",
        description="Do a 5-minute stretching routine.",
        category=TaskCategory.PHYSICAL,
        type=TaskType.LOGIC,
        difficulty=1,
        suggested_age_range="6-8",
        reward_coins=30,
        unity_type=TaskUnityType.LIFE,
    )
    await task_physical.insert()

    assigned_task = ChildTask(
        child=Link(child, Child),  # type: ignore[arg-type]
        task=Link(task_logic, Task),  # type: ignore[arg-type]
        status=ChildTaskStatus.ASSIGNED,
        assigned_at=utc_now() - timedelta(days=1),
        priority=ChildTaskPriority.MEDIUM,
        unity_type=ChildTaskUnityType.CHOICE,
    )
    await assigned_task.insert()

    completed_task = ChildTask(
        child=Link(child, Child),  # type: ignore[arg-type]
        task=Link(task_social, Task),  # type: ignore[arg-type]
        status=ChildTaskStatus.COMPLETED,
        assigned_at=utc_now() - timedelta(days=2),
        completed_at=utc_now() - timedelta(days=1),
        priority=ChildTaskPriority.HIGH,
        unity_type=ChildTaskUnityType.TALK,
    )
    await completed_task.insert()

    unassigned_task = ChildTask(
        child=Link(child, Child),  # type: ignore[arg-type]
        task=Link(task_physical, Task),  # type: ignore[arg-type]
        status=ChildTaskStatus.UNASSIGNED,
        assigned_at=utc_now() - timedelta(hours=4),
        priority=ChildTaskPriority.LOW,
        unity_type=ChildTaskUnityType.LIFE,
    )
    await unassigned_task.insert()

    verify_task = ChildTask(
        child=Link(child, Child),  # type: ignore[arg-type]
        task=Link(task_logic, Task),  # type: ignore[arg-type]
        status=ChildTaskStatus.NEED_VERIFY,
        assigned_at=utc_now() - timedelta(hours=6),
        completed_at=utc_now() - timedelta(hours=1),
        priority=ChildTaskPriority.MEDIUM,
        unity_type=ChildTaskUnityType.CHOICE,
    )
    await verify_task.insert()

    reject_task = ChildTask(
        child=Link(child, Child),  # type: ignore[arg-type]
        task=Link(task_social, Task),  # type: ignore[arg-type]
        status=ChildTaskStatus.NEED_VERIFY,
        assigned_at=utc_now() - timedelta(hours=5),
        completed_at=utc_now() - timedelta(hours=1),
        priority=ChildTaskPriority.MEDIUM,
        unity_type=ChildTaskUnityType.TALK,
    )
    await reject_task.insert()

    giveup_task = ChildTask(
        child=Link(child, Child),  # type: ignore[arg-type]
        task=Link(task_physical, Task),  # type: ignore[arg-type]
        status=ChildTaskStatus.GIVEUP,
        assigned_at=utc_now() - timedelta(days=3),
        priority=ChildTaskPriority.LOW,
        unity_type=ChildTaskUnityType.LIFE,
    )
    await giveup_task.insert()

    reward_badge = Reward(
        name="Focus Badge",
        description="Awarded for strong focus.",
        type=RewardType.BADGE,
        cost_coins=100,
        stock_quantity=5,
        created_by=Link(parent, User),  # type: ignore[arg-type]
    )
    await reward_badge.insert()

    reward_skin = Reward(
        name="Star Cape",
        description="A shiny avatar skin.",
        type=RewardType.SKIN,
        cost_coins=120,
        stock_quantity=3,
        created_by=Link(parent, User),  # type: ignore[arg-type]
    )
    await reward_skin.insert()

    child_reward = ChildReward(
        child=Link(child, Child),  # type: ignore[arg-type]
        reward=Link(reward_skin, Reward),  # type: ignore[arg-type]
        is_equipped=False,
    )
    await child_reward.insert()

    report = Report(
        child=Link(child, Child),  # type: ignore[arg-type]
        period_start=utc_now() - timedelta(days=7),
        period_end=utc_now(),
        summary_text="Weekly summary",
        insights={
            "emotion_trends": {"Happy": 60, "Curious": 40},
            "most_common_emotion": "Happy",
            "emotional_analysis": "Positive outlook",
            "strengths": ["Curiosity"],
            "areas_for_improvement": ["Patience"],
        },
        suggestions={
            "focus": "Social growth",
            "recommended_activities": ["Story sharing"],
            "parenting_tips": ["Encourage reflection"],
            "emotional_support": "Talk about feelings",
        },
    )
    await report.insert()

    game = MiniGame(
        name="Memory Match",
        description="Match the pairs.",
        linked_skill="logic",
    )
    await game.insert()

    interaction = InteractionLog(
        child=Link(child, Child),  # type: ignore[arg-type]
        user_input="Con rat vui",
        avatar_response="Tuyet voi!",
        detected_emotion="Happy",
    )
    await interaction.insert()

    parent_token = create_access_token({"sub": parent.email})
    child_token = create_access_token({"sub": str(child.id), "type": "child"})

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield SimpleNamespace(
            app=app,
            client=client,
            parent=parent,
            child=child,
            assessment=assessment,
            tasks=SimpleNamespace(
                logic=task_logic,
                social=task_social,
                physical=task_physical,
                assigned=assigned_task,
                completed=completed_task,
                unassigned=unassigned_task,
                verify=verify_task,
                reject=reject_task,
                giveup=giveup_task,
            ),
            rewards=SimpleNamespace(
                badge=reward_badge,
                skin=reward_skin,
                inventory=child_reward,
            ),
            report=report,
            game=game,
            headers=SimpleNamespace(
                parent={"Authorization": f"Bearer {parent_token}"},
                child={"Authorization": f"Bearer {child_token}"},
            ),
        )
