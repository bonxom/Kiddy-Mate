import pytest
from beanie import Link

from app.models.beanie_models import (
    Child,
    ChildReward,
    ChildTask,
    GameSession,
    InteractionLog,
    RedemptionRequest,
    User,
    UserRole,
)
from app.models.childtask_models import ChildTaskStatus
from app.services.auth import hash_password
from app.shared.query_helpers import extract_id_from_link


async def _login_child(client, *, username: str, password: str) -> dict[str, str]:
    response = await client.post(
        "/child/auth/login",
        json={"username": username, "password": password},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["user_type"] == "child"
    assert payload["username"] == username
    return {"Authorization": f"Bearer {payload['access_token']}"}


@pytest.mark.asyncio
async def test_child_auth_and_profile_module_flow(api_context):
    client = api_context.client

    child_headers = await _login_child(
        client,
        username="kidtester",
        password="childpass123",
    )

    me_response = await client.get("/child/me", headers=child_headers)
    assert me_response.status_code == 200
    payload = me_response.json()
    assert payload["id"] == str(api_context.child.id)
    assert payload["name"] == api_context.child.name
    assert payload["username"] == api_context.child.username
    assert payload["current_coins"] == api_context.child.current_coins


@pytest.mark.asyncio
async def test_child_auth_accepts_legacy_child_email_credentials(api_context):
    client = api_context.client

    # Simulate legacy data where Child has no username/password credentials.
    api_context.child.username = None
    api_context.child.password_hash = None
    await api_context.child.save()

    legacy_email = "legacy-child@example.com"
    legacy_password = "legacy-pass-123"
    legacy_user = User(
        email=legacy_email,
        password_hash=hash_password(legacy_password),
        full_name=api_context.child.name,
        role=UserRole.CHILD,
        child_profile=Link(api_context.child, Child),
    )
    await legacy_user.insert()

    response = await client.post(
        "/child/auth/login",
        json={"username": legacy_email, "password": legacy_password},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["user_type"] == "child"
    assert payload["child_id"] == str(api_context.child.id)


@pytest.mark.asyncio
async def test_child_tasks_module_flow(api_context):
    client = api_context.client
    child_headers = await _login_child(
        client,
        username="kidtester",
        password="childpass123",
    )

    list_tasks = await client.get("/child/me/tasks", headers=child_headers)
    assert list_tasks.status_code == 200
    task_ids = {item["id"] for item in list_tasks.json()}
    assert str(api_context.tasks.assigned.id) in task_ids

    task_status_before = await client.get(
        f"/child/me/tasks/{api_context.tasks.logic.id}/status",
        headers=child_headers,
    )
    assert task_status_before.status_code == 200
    assert task_status_before.json()["status"] in {"assigned", "in_progress", "need_verify", "completed"}

    start_task = await client.post(
        f"/child/me/tasks/{api_context.tasks.logic.id}/start",
        json={},
        headers=child_headers,
    )
    assert start_task.status_code == 200
    assert start_task.json()["id"] == str(api_context.tasks.assigned.id)

    started_child_task = await ChildTask.get(api_context.tasks.assigned.id)
    assert started_child_task is not None
    assert started_child_task.status == ChildTaskStatus.IN_PROGRESS

    task_status_after_start = await client.get(
        f"/child/me/tasks/{api_context.tasks.logic.id}/status",
        headers=child_headers,
    )
    assert task_status_after_start.status_code == 200
    assert task_status_after_start.json()["status"] == "in_progress"

    complete_task = await client.post(
        f"/child/me/tasks/{api_context.tasks.assigned.id}/complete",
        headers=child_headers,
    )
    assert complete_task.status_code == 200

    completed_pending_task = await ChildTask.get(api_context.tasks.assigned.id)
    assert completed_pending_task is not None
    assert completed_pending_task.status == ChildTaskStatus.NEED_VERIFY
    assert completed_pending_task.progress == 100

    unassigned_tasks = await client.get("/child/me/tasks/unassigned", headers=child_headers)
    assert unassigned_tasks.status_code == 200
    assert any(task["id"] == str(api_context.tasks.unassigned.id) for task in unassigned_tasks.json())

    giveup_task = await client.post(
        f"/child/me/tasks/{api_context.tasks.physical.id}/giveup",
        headers=child_headers,
    )
    assert giveup_task.status_code == 200

    giveup_child_task = await ChildTask.get(api_context.tasks.unassigned.id)
    assert giveup_child_task is not None
    assert giveup_child_task.status == ChildTaskStatus.GIVEUP

    completed_tasks = await client.get("/child/me/tasks/completed", headers=child_headers)
    assert completed_tasks.status_code == 200
    assert any(task["id"] == str(api_context.tasks.completed.id) for task in completed_tasks.json())


@pytest.mark.asyncio
async def test_child_rewards_module_flow(api_context):
    client = api_context.client
    child_headers = await _login_child(
        client,
        username="kidtester",
        password="childpass123",
    )

    inventory_before = await client.get("/child/me/rewards/inventory", headers=child_headers)
    assert inventory_before.status_code == 200
    inventory_before_count = len(inventory_before.json())

    redeem_reward = await client.post(
        "/child/me/rewards/redeem",
        json={"reward_id": str(api_context.rewards.badge.id)},
        headers=child_headers,
    )
    assert redeem_reward.status_code == 200
    redemption_request_id = redeem_reward.json()["id"]

    redemption_request = await RedemptionRequest.get(redemption_request_id)
    assert redemption_request is not None
    assert redemption_request.status == "pending"
    assert extract_id_from_link(redemption_request.child) == str(api_context.child.id)

    approve_redemption = await client.post(
        f"/parent/shop/redemption-requests/{redemption_request_id}/approve",
        headers=api_context.headers.parent,
    )
    assert approve_redemption.status_code == 200

    inventory_after = await client.get("/child/me/rewards/inventory", headers=child_headers)
    assert inventory_after.status_code == 200
    assert len(inventory_after.json()) == inventory_before_count + 1
    assert any(item["reward"]["id"] == str(api_context.rewards.badge.id) for item in inventory_after.json())

    equip_avatar = await client.post(
        "/child/me/rewards/avatar/equip",
        params={"reward_id": str(api_context.rewards.skin.id)},
        headers=child_headers,
    )
    assert equip_avatar.status_code == 200

    child_rewards = await ChildReward.find_all().to_list()
    equipped_skin = next(
        (
            reward
            for reward in child_rewards
            if extract_id_from_link(reward.child) == str(api_context.child.id)
            and extract_id_from_link(reward.reward) == str(api_context.rewards.skin.id)
        ),
        None,
    )
    assert equipped_skin is not None
    assert equipped_skin.is_equipped is True


@pytest.mark.asyncio
async def test_child_interactions_module_flow(api_context):
    client = api_context.client
    child_headers = await _login_child(
        client,
        username="kidtester",
        password="childpass123",
    )

    logs_before = await InteractionLog.find_all().to_list()
    count_before = sum(1 for log in logs_before if extract_id_from_link(log.child) == str(api_context.child.id))

    child_chat = await client.post(
        "/child/me/interactions/chat",
        json={"message": "Con da hoan thanh viec hoc va cam thay rat vui"},
        headers=child_headers,
    )
    assert child_chat.status_code == 200
    assert child_chat.json()["avatar_response"]

    logs_after = await InteractionLog.find_all().to_list()
    count_after = sum(1 for log in logs_after if extract_id_from_link(log.child) == str(api_context.child.id))
    assert count_after == count_before + 1

    child_logs = await client.get("/child/me/interactions/logs", headers=child_headers)
    assert child_logs.status_code == 200
    assert "emotions" in child_logs.json()
    assert len(child_logs.json()["emotions"]) >= 1

    child_history = await client.get("/child/me/interactions/history", headers=child_headers)
    assert child_history.status_code == 200
    assert any(
        entry["user_input"] == "Con da hoan thanh viec hoc va cam thay rat vui"
        for entry in child_history.json()
    )


@pytest.mark.asyncio
async def test_child_games_module_flow(api_context):
    client = api_context.client
    child_headers = await _login_child(
        client,
        username="kidtester",
        password="childpass123",
    )

    game_list = await client.get("/child/me/games", headers=child_headers)
    assert game_list.status_code == 200
    assert any(game["id"] == str(api_context.game.id) for game in game_list.json())

    start_game = await client.post(
        f"/child/me/games/{api_context.game.id}/start",
        headers=child_headers,
    )
    assert start_game.status_code == 200
    session_id = start_game.json()["id"]

    submit_game = await client.post(
        f"/child/me/games/sessions/{session_id}/submit",
        json={"score": 95, "behavior_data": {"focus": "high", "persistence": "steady"}},
        headers=child_headers,
    )
    assert submit_game.status_code == 200

    game_session = await GameSession.get(session_id)
    assert game_session is not None
    assert game_session.score == 95
    assert game_session.end_time is not None
    assert game_session.behavior_data["focus"] == "high"
