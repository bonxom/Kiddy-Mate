import pytest

from app.models.beanie_models import (
    Child,
    ChildDevelopmentAssessment,
    ChildReward,
    ChildTask,
    GameSession,
    InteractionLog,
    RedemptionRequest,
    Report,
    Reward,
    User,
)
from app.models.childtask_models import ChildTaskStatus
from app.models.user_models import UserRole
from app.shared.query_helpers import extract_id_from_link


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def _register_and_login_parent(
    client,
    *,
    email: str,
    password: str,
    full_name: str,
) -> dict[str, str]:
    register_response = await client.post(
        "/parent/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": full_name,
        },
    )
    assert register_response.status_code == 200

    login_response = await client.post(
        "/parent/auth/login",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    return _auth_headers(token)


async def _login_parent(client, *, email: str, password: str) -> dict[str, str]:
    login_response = await client.post(
        "/parent/auth/login",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    return _auth_headers(token)


async def _login_child(client, *, username: str, password: str) -> dict[str, str]:
    login_response = await client.post(
        "/child/auth/login",
        json={"username": username, "password": password},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    return _auth_headers(token)


async def _find_child_by_username(username: str) -> Child:
    child = await Child.find_one(Child.username == username)
    assert child is not None
    return child


async def _count_reports_for_child(child_id: str) -> int:
    reports = await Report.find_all().to_list()
    return sum(1 for report in reports if extract_id_from_link(report.child) == child_id)


async def _count_rewards_for_child(child_id: str) -> int:
    rewards = await ChildReward.find_all().to_list()
    return sum(1 for reward in rewards if extract_id_from_link(reward.child) == child_id)


@pytest.mark.asyncio
async def test_parent_end_to_end_flow_from_registration_to_dashboard_and_report(api_context):
    client = api_context.client

    parent_headers = await _register_and_login_parent(
        client,
        email="flow-parent@example.com",
        password="flow-parent-pass",
        full_name="Flow Parent",
    )

    onboarding_response = await client.post(
        "/parent/onboarding/complete",
        json={
            "parent_email": "flow-parent@example.com",
            "parent_display_name": "Flow Parent Updated",
            "phone_number": "0900123456",
            "children": [
                {
                    "full_name": "Flow Child",
                    "nickname": "FlowKid",
                    "date_of_birth": "2018-01-10",
                    "gender": "male",
                    "username": "flow-child",
                    "password": "flow-child-pass",
                    "favorite_topics": ["space", "stories"],
                    "personality": ["curious"],
                    "interests": ["space", "stories"],
                    "strengths": ["focus"],
                    "challenges": ["patience"],
                    "discipline_autonomy": {"completes_personal_tasks": "4"},
                    "emotional_intelligence": {"shows_empathy": "4"},
                    "social_interaction": {"shares_and_waits_turns": "3"},
                }
            ],
        },
    )
    assert onboarding_response.status_code == 200
    assert onboarding_response.json()["children"][0]["name"] == "Flow Child"

    parent = await User.find_one(User.email == "flow-parent@example.com")
    assert parent is not None
    assert parent.onboarding_completed is True
    assert parent.full_name == "Flow Parent Updated"

    onboarded_child = await _find_child_by_username("flow-child")
    assert extract_id_from_link(onboarded_child.parent) == str(parent.id)

    assessments = await ChildDevelopmentAssessment.find_all().to_list()
    onboarded_assessment = next(
        (assessment for assessment in assessments if extract_id_from_link(assessment.child) == str(onboarded_child.id)),
        None,
    )
    assert onboarded_assessment is not None

    create_second_child = await client.post(
        "/parent/children",
        json={
            "name": "Second Flow Child",
            "birth_date": "2019-02-05T00:00:00Z",
            "nickname": "SecondKid",
            "gender": "female",
            "interests": ["music"],
            "username": "second-flow-child",
            "password": "second-flow-pass",
        },
        headers=parent_headers,
    )
    assert create_second_child.status_code == 200
    second_child_id = create_second_child.json()["id"]

    update_second_child = await client.put(
        f"/parent/children/{second_child_id}",
        json={"nickname": "SecondKidUpdated"},
        headers=parent_headers,
    )
    assert update_second_child.status_code == 200
    assert update_second_child.json()["nickname"] == "SecondKidUpdated"

    select_second_child = await client.post(
        f"/parent/children/{second_child_id}/select",
        headers=parent_headers,
    )
    assert select_second_child.status_code == 200

    create_badge_reward = await client.post(
        "/parent/shop/rewards",
        json={
            "name": "Flow Completion Badge",
            "description": "Granted after finishing the parent flow task.",
            "type": "badge",
            "cost_coins": 10,
            "stock_quantity": 5,
        },
        headers=parent_headers,
    )
    assert create_badge_reward.status_code == 201
    reward_id = create_badge_reward.json()["id"]

    reward = await Reward.get(reward_id)
    assert reward is not None
    assert extract_id_from_link(reward.created_by) == str(parent.id)

    create_task = await client.post(
        "/parent/tasks",
        json={
            "title": "Flow Library Task",
            "description": "Complete the full parent-child E2E flow.",
            "category": "Logic",
            "type": "logic",
            "difficulty": 2,
            "suggested_age_range": "6-8",
            "reward_coins": 80,
            "reward_badge_name": "Flow Completion Badge",
            "unity_type": "choice",
        },
        headers=parent_headers,
    )
    assert create_task.status_code == 200
    task_id = create_task.json()["id"]

    assign_task = await client.post(
        f"/parent/children/{onboarded_child.id}/tasks/{task_id}/assign",
        json={"notes": "Assigned from the parent business flow test."},
        headers=parent_headers,
    )
    assert assign_task.status_code == 200
    child_task_id = assign_task.json()["id"]
    assert assign_task.json()["status"] == "assigned"

    child_headers = await _login_child(
        client,
        username="flow-child",
        password="flow-child-pass",
    )

    child_tasks_before = await client.get("/child/me/tasks", headers=child_headers)
    assert child_tasks_before.status_code == 200
    assert any(task["task"]["id"] == task_id for task in child_tasks_before.json())

    start_task = await client.post(
        f"/child/me/tasks/{task_id}/start",
        json={},
        headers=child_headers,
    )
    assert start_task.status_code == 200
    assert start_task.json()["id"] == child_task_id

    child_task = await ChildTask.get(child_task_id)
    assert child_task is not None
    assert child_task.status == ChildTaskStatus.IN_PROGRESS

    complete_task = await client.post(
        f"/child/me/tasks/{child_task_id}/complete",
        headers=child_headers,
    )
    assert complete_task.status_code == 200

    child_task = await ChildTask.get(child_task_id)
    assert child_task is not None
    assert child_task.status == ChildTaskStatus.NEED_VERIFY
    assert child_task.progress == 100

    child_before_verify = await Child.get(onboarded_child.id)
    assert child_before_verify is not None
    coins_before_verify = child_before_verify.current_coins

    verify_task = await client.post(
        f"/parent/children/{onboarded_child.id}/tasks/{child_task_id}/verify",
        headers=parent_headers,
    )
    assert verify_task.status_code == 200

    verified_child = await Child.get(onboarded_child.id)
    assert verified_child is not None
    assert verified_child.current_coins == coins_before_verify + 80

    child_task = await ChildTask.get(child_task_id)
    assert child_task is not None
    assert child_task.status == ChildTaskStatus.COMPLETED

    earned_rewards_count = await _count_rewards_for_child(str(onboarded_child.id))
    assert earned_rewards_count >= 1

    inventory_response = await client.get("/child/me/rewards/inventory", headers=child_headers)
    assert inventory_response.status_code == 200
    assert any(
        reward_item["reward"]["name"] == "Flow Completion Badge"
        for reward_item in inventory_response.json()
    )

    dashboard_response = await client.get(
        f"/parent/dashboard/{onboarded_child.id}",
        headers=parent_headers,
    )
    assert dashboard_response.status_code == 200
    dashboard = dashboard_response.json()
    assert dashboard["child"]["coins"] == verified_child.current_coins
    assert dashboard["tasks_completed"] >= 1
    assert dashboard["badges_earned"] >= 1
    assert dashboard["completion_rate"] > 0

    category_progress_response = await client.get(
        f"/parent/dashboard/{onboarded_child.id}/category-progress",
        headers=parent_headers,
    )
    assert category_progress_response.status_code == 200
    assert any(item["total"] >= 1 for item in category_progress_response.json())

    reports_before = await _count_reports_for_child(str(onboarded_child.id))
    generate_report = await client.post(
        f"/parent/reports/{onboarded_child.id}/generate",
        headers=parent_headers,
    )
    assert generate_report.status_code == 200
    generated_report = generate_report.json()
    assert generated_report["summary_text"]

    reports_after = await _count_reports_for_child(str(onboarded_child.id))
    assert reports_after == reports_before + 1

    list_reports = await client.get(
        f"/parent/reports/{onboarded_child.id}",
        headers=parent_headers,
    )
    assert list_reports.status_code == 200
    assert any(report["id"] == generated_report["id"] for report in list_reports.json())

    get_report = await client.get(
        f"/parent/reports/{onboarded_child.id}/{generated_report['id']}",
        headers=parent_headers,
    )
    assert get_report.status_code == 200
    assert get_report.json()["id"] == generated_report["id"]

    delete_second_child = await client.delete(
        f"/parent/children/{second_child_id}",
        headers=parent_headers,
    )
    assert delete_second_child.status_code == 200
    assert await Child.get(second_child_id) is None


@pytest.mark.asyncio
async def test_parent_account_lifecycle_flow_covers_parent_auth_namespace(api_context):
    client = api_context.client

    parent_email = "account-flow-parent@example.com"
    initial_password = "account-flow-pass"
    updated_password = "account-flow-pass-2"
    child_account_email = "account-flow-child@example.com"

    parent_headers = await _register_and_login_parent(
        client,
        email=parent_email,
        password=initial_password,
        full_name="Account Flow Parent",
    )

    create_child = await client.post(
        "/parent/children",
        json={
            "name": "Account Flow Child",
            "birth_date": "2018-09-01T00:00:00Z",
            "nickname": "AccountKid",
            "gender": "female",
            "interests": ["music"],
            "username": "account-flow-child",
            "password": "account-child-pass",
        },
        headers=parent_headers,
    )
    assert create_child.status_code == 200
    child_id = create_child.json()["id"]

    list_children = await client.get("/parent/children", headers=parent_headers)
    assert list_children.status_code == 200
    assert any(child["id"] == child_id for child in list_children.json())

    child_detail = await client.get(
        f"/parent/children/{child_id}",
        headers=parent_headers,
    )
    assert child_detail.status_code == 200
    assert child_detail.json()["name"] == "Account Flow Child"

    me_response = await client.get("/parent/auth/me", headers=parent_headers)
    assert me_response.status_code == 200
    assert me_response.json()["email"] == parent_email
    assert me_response.json()["children_count"] == 1

    update_profile = await client.put(
        "/parent/auth/me",
        json={"full_name": "Account Flow Parent Updated", "phone_number": "0900111222"},
        headers=parent_headers,
    )
    assert update_profile.status_code == 200
    assert update_profile.json()["user"]["full_name"] == "Account Flow Parent Updated"

    notification_get = await client.get(
        "/parent/auth/me/notification-settings",
        headers=parent_headers,
    )
    assert notification_get.status_code == 200
    assert notification_get.json()["email"]["enabled"] is True

    notification_put = await client.put(
        "/parent/auth/me/notification-settings",
        json={
            "email": {
                "enabled": True,
                "coin_redemption": False,
                "task_reminders": True,
                "emotional_trends": True,
                "weekly_reports": True,
            },
            "push": {
                "enabled": True,
                "coin_redemption": True,
                "task_reminders": True,
                "emotional_trends": False,
                "weekly_reports": False,
            },
        },
        headers=parent_headers,
    )
    assert notification_put.status_code == 200
    assert notification_put.json()["settings"]["push"]["enabled"] is True

    register_child_account = await client.post(
        "/parent/auth/register/child",
        json={
            "email": child_account_email,
            "password": "child-account-pass",
            "full_name": "Account Flow Child User",
            "child_id": child_id,
        },
        headers=parent_headers,
    )
    assert register_child_account.status_code == 200
    child_user = await User.find_one(User.email == child_account_email)
    assert child_user is not None
    assert child_user.role == UserRole.CHILD

    change_password = await client.put(
        "/parent/auth/me/password",
        json={
            "current_password": initial_password,
            "new_password": updated_password,
        },
        headers=parent_headers,
    )
    assert change_password.status_code == 200

    token_response = await client.post(
        "/parent/auth/token",
        data={"username": parent_email, "password": updated_password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert token_response.status_code == 200
    refreshed_headers = _auth_headers(token_response.json()["access_token"])

    logout_response = await client.post("/parent/auth/logout", headers=refreshed_headers)
    assert logout_response.status_code == 200

    delete_account = await client.request(
        "DELETE",
        "/parent/auth/me",
        json={"confirmation": "DELETE", "password": updated_password},
        headers=refreshed_headers,
    )
    assert delete_account.status_code == 200

    assert await User.find_one(User.email == parent_email) is None
    assert await Child.get(child_id) is None


@pytest.mark.asyncio
async def test_parent_assessment_and_task_moderation_flow_covers_remaining_parent_task_routes(api_context):
    client = api_context.client
    parent_headers = await _login_parent(
        client,
        email="parent@example.com",
        password="password123",
    )
    child_headers = await _login_child(
        client,
        username="kidtester",
        password="childpass123",
    )
    child_id = str(api_context.child.id)

    create_simple_assessment = await client.post(
        f"/parent/children/{child_id}/assessments/simple",
        json={
            "logic_score": 8,
            "independence_score": 7,
            "emotional_score": 6,
            "discipline_score": 7,
            "social_score": 8,
            "notes": "Quick parent check-in after first week.",
        },
        headers=parent_headers,
    )
    assert create_simple_assessment.status_code == 200
    simple_assessment_id = create_simple_assessment.json()["id"]

    create_detailed_assessment = await client.post(
        f"/parent/children/{child_id}/assessments",
        json={
            "discipline_autonomy": {
                "completes_personal_tasks": "4",
                "keeps_personal_space_tidy": "4",
                "finishes_simple_chores": "3",
                "follows_screen_time_rules": "4",
                "struggles_with_activity_transitions": "2",
            },
            "emotional_intelligence": {
                "expresses_big_emotions_with_aggression": "2",
                "verbalizes_emotions": "4",
                "shows_empathy": "4",
                "displays_excessive_worry": "2",
                "owns_mistakes": "3",
            },
            "social_interaction": {
                "joins_peer_groups_confidently": "3",
                "shares_and_waits_turns": "4",
                "resolves_conflict_with_words": "3",
                "prefers_solo_play": "2",
                "asks_for_help_politely": "4",
            },
        },
        headers=parent_headers,
    )
    assert create_detailed_assessment.status_code == 200
    detailed_assessment_id = create_detailed_assessment.json()["id"]

    list_assessments = await client.get(
        f"/parent/children/{child_id}/assessments",
        headers=parent_headers,
    )
    assert list_assessments.status_code == 200
    assessment_ids = {assessment["id"] for assessment in list_assessments.json()}
    assert simple_assessment_id in assessment_ids
    assert detailed_assessment_id in assessment_ids

    get_assessment = await client.get(
        f"/parent/children/{child_id}/assessments/{detailed_assessment_id}",
        headers=parent_headers,
    )
    assert get_assessment.status_code == 200
    assert get_assessment.json()["id"] == detailed_assessment_id

    update_assessment = await client.put(
        f"/parent/children/{child_id}/assessments/{simple_assessment_id}",
        json={"social_interaction": {"shares_and_waits_turns": "5"}},
        headers=parent_headers,
    )
    assert update_assessment.status_code == 200
    assert update_assessment.json()["social_interaction"]["shares_and_waits_turns"] == "5"

    library_before = await client.get("/parent/tasks", headers=parent_headers)
    assert library_before.status_code == 200

    create_library_task = await client.post(
        "/parent/tasks",
        json={
            "title": "Parent Moderation Flow Task",
            "description": "A task used to validate parent task moderation flows.",
            "category": "Logic",
            "type": "logic",
            "difficulty": 2,
            "suggested_age_range": "6-8",
            "reward_coins": 55,
            "unity_type": "choice",
        },
        headers=parent_headers,
    )
    assert create_library_task.status_code == 200
    task_id = create_library_task.json()["id"]

    update_library_task = await client.put(
        f"/parent/tasks/{task_id}",
        json={"reward_coins": 65, "description": "Updated by parent moderation flow."},
        headers=parent_headers,
    )
    assert update_library_task.status_code == 200
    assert update_library_task.json()["reward_coins"] == 65

    suggested_tasks = await client.get(
        f"/parent/children/{child_id}/tasks/suggested",
        headers=parent_headers,
    )
    assert suggested_tasks.status_code == 200
    assert any(task["id"] == task_id for task in suggested_tasks.json())

    list_child_tasks = await client.get(
        f"/parent/children/{child_id}/tasks",
        headers=parent_headers,
    )
    assert list_child_tasks.status_code == 200
    assert len(list_child_tasks.json()) >= 1

    assign_task = await client.post(
        f"/parent/children/{child_id}/tasks/{task_id}/assign",
        json={"notes": "Parent assigned this during moderation flow."},
        headers=parent_headers,
    )
    assert assign_task.status_code == 200
    assigned_child_task_id = assign_task.json()["id"]

    update_assigned_task = await client.put(
        f"/parent/children/{child_id}/tasks/{assigned_child_task_id}",
        json={"progress": 50, "notes": "Half complete after parent review."},
        headers=parent_headers,
    )
    assert update_assigned_task.status_code == 200
    assert update_assigned_task.json()["progress"] == 50

    child_start_task = await client.post(
        f"/child/me/tasks/{task_id}/start",
        json={},
        headers=child_headers,
    )
    assert child_start_task.status_code == 200
    assert child_start_task.json()["id"] == assigned_child_task_id

    child_complete_task = await client.post(
        f"/child/me/tasks/{assigned_child_task_id}/complete",
        headers=child_headers,
    )
    assert child_complete_task.status_code == 200
    completed_task = await ChildTask.get(assigned_child_task_id)
    assert completed_task is not None
    assert completed_task.status == ChildTaskStatus.NEED_VERIFY

    reject_verification = await client.post(
        f"/parent/children/{child_id}/tasks/{api_context.tasks.reject.id}/reject",
        headers=parent_headers,
    )
    assert reject_verification.status_code == 200

    create_and_assign = await client.post(
        f"/parent/children/{child_id}/tasks/create-and-assign",
        json={
            "title": "Parent Created Custom Task",
            "description": "Created and assigned in one parent flow.",
            "category": "Academic",
            "type": "logic",
            "difficulty": 3,
            "suggested_age_range": "6-8",
            "reward_coins": 70,
            "notes": "Custom assignment note",
        },
        headers=parent_headers,
    )
    assert create_and_assign.status_code == 200
    custom_child_task_id = create_and_assign.json()["id"]

    child_giveup_task = await client.post(
        f"/child/me/tasks/{api_context.tasks.physical.id}/giveup",
        headers=child_headers,
    )
    assert child_giveup_task.status_code == 200

    giveup_list = await client.post(
        f"/parent/children/{child_id}/tasks/giveup",
        headers=parent_headers,
    )
    assert giveup_list.status_code == 200
    assert any(task["id"] == str(api_context.tasks.unassigned.id) for task in giveup_list.json())

    delete_custom_child_task = await client.delete(
        f"/parent/children/{child_id}/tasks/{custom_child_task_id}",
        headers=parent_headers,
    )
    assert delete_custom_child_task.status_code == 200
    assert await ChildTask.get(custom_child_task_id) is None

    delete_library_task = await client.delete(
        f"/parent/tasks/{task_id}",
        headers=parent_headers,
    )
    assert delete_library_task.status_code == 200


@pytest.mark.asyncio
async def test_parent_monitoring_reward_and_ai_flow_covers_remaining_parent_routes(api_context):
    client = api_context.client
    parent_headers = await _login_parent(
        client,
        email="parent@example.com",
        password="password123",
    )
    child_headers = await _login_child(
        client,
        username="kidtester",
        password="childpass123",
    )
    child_id = str(api_context.child.id)

    parent_inventory = await client.get(
        f"/parent/children/{child_id}/inventory",
        headers=parent_headers,
    )
    assert parent_inventory.status_code == 200
    assert any(item["reward"]["id"] == str(api_context.rewards.skin.id) for item in parent_inventory.json())

    parent_games = await client.get(
        f"/parent/children/{child_id}/games",
        headers=parent_headers,
    )
    assert parent_games.status_code == 200
    assert any(game["id"] == str(api_context.game.id) for game in parent_games.json())

    interaction_chat = await client.post(
        f"/parent/children/{child_id}/interact/chat",
        json={"message": "Hom nay con thay the nao sau khi hoan thanh bai hoc?"},
        headers=parent_headers,
    )
    assert interaction_chat.status_code == 200
    assert interaction_chat.json()["avatar_response"]

    interaction_logs = await client.get(
        f"/parent/children/{child_id}/interact/logs",
        headers=parent_headers,
    )
    assert interaction_logs.status_code == 200
    assert "emotions" in interaction_logs.json()

    interaction_history = await client.get(
        f"/parent/children/{child_id}/interact/history",
        headers=parent_headers,
    )
    assert interaction_history.status_code == 200
    assert any("Hom nay con thay the nao" in entry["user_input"] for entry in interaction_history.json())

    shop_rewards = await client.get("/parent/shop/rewards", headers=parent_headers)
    assert shop_rewards.status_code == 200

    create_reward = await client.post(
        "/parent/shop/rewards",
        json={
            "name": "Parent Flow Sticker Pack",
            "description": "Reward managed entirely from parent monitoring flow.",
            "type": "item",
            "cost_coins": 30,
            "stock_quantity": 4,
        },
        headers=parent_headers,
    )
    assert create_reward.status_code == 201
    reward_id = create_reward.json()["id"]

    update_reward = await client.put(
        f"/parent/shop/rewards/{reward_id}",
        json={"cost_coins": 45, "description": "Updated reward description"},
        headers=parent_headers,
    )
    assert update_reward.status_code == 200
    assert update_reward.json()["cost"] == 45

    update_quantity = await client.patch(
        f"/parent/shop/rewards/{reward_id}/quantity",
        params={"delta": 3},
        headers=parent_headers,
    )
    assert update_quantity.status_code == 200
    assert update_quantity.json()["remain"] == 7

    approve_reward_request = await client.post(
        "/child/me/rewards/redeem",
        json={"reward_id": str(api_context.rewards.badge.id)},
        headers=child_headers,
    )
    assert approve_reward_request.status_code == 200
    approve_request_id = approve_reward_request.json()["id"]

    reject_reward_request = await client.post(
        "/child/me/rewards/redeem",
        json={"reward_id": reward_id},
        headers=child_headers,
    )
    assert reject_reward_request.status_code == 200
    reject_request_id = reject_reward_request.json()["id"]

    pending_redemptions = await client.get(
        "/parent/shop/redemption-requests",
        params={"status": "pending"},
        headers=parent_headers,
    )
    assert pending_redemptions.status_code == 200
    pending_ids = {request["id"] for request in pending_redemptions.json()}
    assert approve_request_id in pending_ids
    assert reject_request_id in pending_ids

    approve_redemption = await client.post(
        f"/parent/shop/redemption-requests/{approve_request_id}/approve",
        headers=parent_headers,
    )
    assert approve_redemption.status_code == 200

    reject_redemption = await client.post(
        f"/parent/shop/redemption-requests/{reject_request_id}/reject",
        headers=parent_headers,
    )
    assert reject_redemption.status_code == 200

    updated_inventory = await client.get(
        f"/parent/children/{child_id}/inventory",
        headers=parent_headers,
    )
    assert updated_inventory.status_code == 200
    assert any(item["reward"]["id"] == str(api_context.rewards.badge.id) for item in updated_inventory.json())

    emotion_analytics = await client.get(
        f"/parent/dashboard/{child_id}/emotion-analytics",
        headers=parent_headers,
    )
    assert emotion_analytics.status_code == 200
    assert emotion_analytics.json()["most_common_emotion"] == "Happy"

    analyze_emotion_report = await client.post(
        f"/parent/dashboard/{child_id}/analyze-emotion-report",
        headers=parent_headers,
    )
    assert analyze_emotion_report.status_code == 200
    assert len(analyze_emotion_report.json()) >= 1

    update_skills = await client.post(
        f"/parent/dashboard/{child_id}/update-skills",
        headers=parent_headers,
    )
    assert update_skills.status_code == 200
    assert "skills" in update_skills.json()

    generate_tasks = await client.post(
        f"/parent/children/{child_id}/generate/chat",
        json={"prompt": "Create one encouraging social task for this child."},
        headers=parent_headers,
    )
    assert generate_tasks.status_code == 200
    assert len(generate_tasks.json()) >= 1

    score_child = await client.post(
        f"/parent/children/{child_id}/score/chat",
        json={"prompt": "Evaluate the child's current development state."},
        headers=parent_headers,
    )
    assert score_child.status_code == 200
    assert score_child.json()["logic"] >= 0

    auto_generate = await client.post(
        f"/parent/children/{child_id}/generate/auto",
        headers=parent_headers,
    )
    assert auto_generate.status_code == 200
    assert "generated_tasks" in auto_generate.json()

    delete_reward = await client.delete(
        f"/parent/shop/rewards/{reward_id}",
        headers=parent_headers,
    )
    assert delete_reward.status_code == 204
    assert await Reward.get(reward_id) is None


@pytest.mark.asyncio
async def test_child_end_to_end_runtime_flow_for_tasks_rewards_interactions_and_games(api_context):
    client = api_context.client

    child_headers = await _login_child(
        client,
        username="kidtester",
        password="childpass123",
    )

    me_response = await client.get("/child/me", headers=child_headers)
    assert me_response.status_code == 200
    assert me_response.json()["name"] == "Kid Tester"

    tasks_response = await client.get("/child/me/tasks", headers=child_headers)
    assert tasks_response.status_code == 200
    tasks = tasks_response.json()
    assert any(task["id"] == str(api_context.tasks.assigned.id) for task in tasks)

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
    assert extract_id_from_link(redemption_request.reward) == str(api_context.rewards.badge.id)

    child_before_approval = await Child.get(api_context.child.id)
    assert child_before_approval is not None
    coins_before_approval = child_before_approval.current_coins

    approve_redemption = await client.post(
        f"/parent/shop/redemption-requests/{redemption_request_id}/approve",
        headers=api_context.headers.parent,
    )
    assert approve_redemption.status_code == 200

    updated_redemption = await RedemptionRequest.get(redemption_request_id)
    assert updated_redemption is not None
    assert updated_redemption.status == "approved"

    child_after_approval = await Child.get(api_context.child.id)
    assert child_after_approval is not None
    assert child_after_approval.current_coins == coins_before_approval - api_context.rewards.badge.cost_coins

    inventory_after = await client.get("/child/me/rewards/inventory", headers=child_headers)
    assert inventory_after.status_code == 200
    assert len(inventory_after.json()) == inventory_before_count + 1
    assert any(
        reward_item["reward"]["id"] == str(api_context.rewards.badge.id)
        for reward_item in inventory_after.json()
    )

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

    logs_before = await InteractionLog.find_all().to_list()
    logs_before_count = sum(
        1 for log in logs_before if extract_id_from_link(log.child) == str(api_context.child.id)
    )

    child_chat = await client.post(
        "/child/me/interactions/chat",
        json={"message": "Con vua hoan thanh bai tap va rat vui"},
        headers=child_headers,
    )
    assert child_chat.status_code == 200
    assert child_chat.json()["avatar_response"]

    logs_after = await InteractionLog.find_all().to_list()
    logs_after_count = sum(
        1 for log in logs_after if extract_id_from_link(log.child) == str(api_context.child.id)
    )
    assert logs_after_count == logs_before_count + 1

    child_logs = await client.get("/child/me/interactions/logs", headers=child_headers)
    assert child_logs.status_code == 200
    assert "emotions" in child_logs.json()
    assert len(child_logs.json()["emotions"]) >= 1

    child_history = await client.get("/child/me/interactions/history", headers=child_headers)
    assert child_history.status_code == 200
    assert any(
        interaction["user_input"] == "Con vua hoan thanh bai tap va rat vui"
        for interaction in child_history.json()
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
