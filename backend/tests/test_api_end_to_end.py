import pytest


@pytest.mark.asyncio
async def test_parent_auth_and_profile_endpoints(api_context):
    client = api_context.client

    register_response = await client.post(
        "/parent/auth/register",
        json={
            "email": "new-parent@example.com",
            "password": "password123",
            "full_name": "New Parent",
        },
    )
    assert register_response.status_code == 200

    login_response = await client.post(
        "/parent/auth/login",
        json={"email": "parent@example.com", "password": "password123"},
    )
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()

    token_response = await client.post(
        "/parent/auth/token",
        data={"username": "parent@example.com", "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert token_response.status_code == 200

    me_response = await client.get("/parent/auth/me", headers=api_context.headers.parent)
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "parent@example.com"

    update_response = await client.put(
        "/parent/auth/me",
        json={"full_name": "Updated Parent", "phone_number": "0987654321"},
        headers=api_context.headers.parent,
    )
    assert update_response.status_code == 200
    assert update_response.json()["user"]["full_name"] == "Updated Parent"

    password_response = await client.put(
        "/parent/auth/me/password",
        json={"current_password": "password123", "new_password": "password456"},
        headers=api_context.headers.parent,
    )
    assert password_response.status_code == 200

    notification_get = await client.get(
        "/parent/auth/me/notification-settings",
        headers=api_context.headers.parent,
    )
    assert notification_get.status_code == 200

    notification_put = await client.put(
        "/parent/auth/me/notification-settings",
        json={
            "email": {"enabled": True, "weekly_reports": True},
            "push": {"enabled": False, "weekly_reports": False},
        },
        headers=api_context.headers.parent,
    )
    assert notification_put.status_code == 200

    logout_response = await client.post("/parent/auth/logout", headers=api_context.headers.parent)
    assert logout_response.status_code == 200


@pytest.mark.asyncio
async def test_onboarding_children_and_assessment_endpoints(api_context):
    client = api_context.client

    onboarding_response = await client.post(
        "/parent/onboarding/complete",
        json={
            "parent_email": "parent@example.com",
            "parent_display_name": "Parent Tester",
            "phone_number": "0111222333",
            "children": [
                {
                    "full_name": "Onboarded Child",
                    "nickname": "Onb",
                    "date_of_birth": "2018-05-01",
                    "gender": "male",
                    "username": "onboarded-kid",
                    "password": "onboardpass",
                    "favorite_topics": ["space"],
                    "personality": ["active"],
                    "interests": ["space"],
                    "strengths": ["focus"],
                    "challenges": ["waiting"],
                    "discipline_autonomy": {"completes_personal_tasks": "4"},
                    "emotional_intelligence": {"shows_empathy": "4"},
                    "social_interaction": {"shares_and_waits_turns": "3"},
                }
            ],
        },
    )
    assert onboarding_response.status_code == 200

    list_children = await client.get("/parent/children", headers=api_context.headers.parent)
    assert list_children.status_code == 200
    assert len(list_children.json()) >= 2

    create_child = await client.post(
        "/parent/children",
        json={
            "name": "API Child",
            "birth_date": "2018-04-01T00:00:00Z",
            "nickname": "API",
            "gender": "female",
            "interests": ["music"],
            "username": "api-child",
            "password": "api-child-pass",
        },
        headers=api_context.headers.parent,
    )
    assert create_child.status_code == 200
    created_child_id = create_child.json()["id"]

    child_detail = await client.get(
        f"/parent/children/{api_context.child.id}",
        headers=api_context.headers.parent,
    )
    assert child_detail.status_code == 200

    update_child = await client.put(
        f"/parent/children/{api_context.child.id}",
        json={"nickname": "Updated Kiddo"},
        headers=api_context.headers.parent,
    )
    assert update_child.status_code == 200
    assert update_child.json()["nickname"] == "Updated Kiddo"

    select_child = await client.post(
        f"/parent/children/{api_context.child.id}/select",
        headers=api_context.headers.parent,
    )
    assert select_child.status_code == 200

    create_assessment = await client.post(
        f"/parent/children/{api_context.child.id}/assessments",
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
        headers=api_context.headers.parent,
    )
    assert create_assessment.status_code == 200
    assessment_id = create_assessment.json()["id"]

    list_assessments = await client.get(
        f"/parent/children/{api_context.child.id}/assessments",
        headers=api_context.headers.parent,
    )
    assert list_assessments.status_code == 200

    get_assessment = await client.get(
        f"/parent/children/{api_context.child.id}/assessments/{assessment_id}",
        headers=api_context.headers.parent,
    )
    assert get_assessment.status_code == 200

    update_assessment = await client.put(
        f"/parent/children/{api_context.child.id}/assessments/{assessment_id}",
        json={"social_interaction": {"shares_and_waits_turns": "5"}},
        headers=api_context.headers.parent,
    )
    assert update_assessment.status_code == 200

    delete_child = await client.delete(
        f"/parent/children/{created_child_id}",
        headers=api_context.headers.parent,
    )
    assert delete_child.status_code == 200


@pytest.mark.asyncio
async def test_task_library_and_parent_child_task_endpoints(api_context):
    client = api_context.client

    list_library = await client.get("/parent/tasks", headers=api_context.headers.parent)
    assert list_library.status_code == 200

    create_library_task = await client.post(
        "/parent/tasks",
        json={
            "title": "Paint Shapes",
            "description": "Paint three geometric shapes.",
            "category": "Creativity",
            "type": "logic",
            "difficulty": 2,
            "suggested_age_range": "6-8",
            "reward_coins": 55,
            "unity_type": "choice",
        },
        headers=api_context.headers.parent,
    )
    assert create_library_task.status_code == 200
    new_task_id = create_library_task.json()["id"]

    update_library_task = await client.put(
        f"/parent/tasks/{new_task_id}",
        json={"reward_coins": 65},
        headers=api_context.headers.parent,
    )
    assert update_library_task.status_code == 200

    suggested = await client.get(
        f"/parent/children/{api_context.child.id}/tasks/suggested",
        headers=api_context.headers.parent,
    )
    assert suggested.status_code == 200

    child_tasks = await client.get(
        f"/parent/children/{api_context.child.id}/tasks",
        headers=api_context.headers.parent,
    )
    assert child_tasks.status_code == 200

    start_task = await client.post(
        f"/parent/children/{api_context.child.id}/tasks/{api_context.tasks.logic.id}/start",
        json={},
        headers=api_context.headers.child,
    )
    assert start_task.status_code == 200

    assign_task = await client.post(
        f"/parent/children/{api_context.child.id}/tasks/{new_task_id}/assign",
        json={},
        headers=api_context.headers.parent,
    )
    assert assign_task.status_code == 200
    assigned_child_task_id = assign_task.json()["id"]

    create_and_assign = await client.post(
        f"/parent/children/{api_context.child.id}/tasks/create-and-assign",
        json={
            "title": "Custom Task",
            "description": "A custom embedded task.",
            "category": "Academic",
            "type": "logic",
            "difficulty": 3,
            "suggested_age_range": "6-8",
            "reward_coins": 75,
        },
        headers=api_context.headers.parent,
    )
    assert create_and_assign.status_code == 200
    created_child_task_id = create_and_assign.json()["id"]

    update_assigned = await client.put(
        f"/parent/children/{api_context.child.id}/tasks/{assigned_child_task_id}",
        json={"progress": 50, "notes": "Halfway there"},
        headers=api_context.headers.parent,
    )
    assert update_assigned.status_code == 200

    complete_task = await client.post(
        f"/parent/children/{api_context.child.id}/tasks/{assigned_child_task_id}/complete",
        headers=api_context.headers.child,
    )
    assert complete_task.status_code == 200

    verify_task = await client.post(
        f"/parent/children/{api_context.child.id}/tasks/{api_context.tasks.verify.id}/verify",
        headers=api_context.headers.parent,
    )
    assert verify_task.status_code == 200

    reject_task = await client.post(
        f"/parent/children/{api_context.child.id}/tasks/{api_context.tasks.reject.id}/reject",
        headers=api_context.headers.parent,
    )
    assert reject_task.status_code == 200

    task_status = await client.get(
        f"/parent/children/{api_context.child.id}/tasks/{api_context.tasks.logic.id}/status",
        headers=api_context.headers.child,
    )
    assert task_status.status_code == 200

    giveup_task = await client.post(
        f"/parent/children/{api_context.child.id}/tasks/{api_context.tasks.physical.id}/giveup",
        headers=api_context.headers.parent,
    )
    assert giveup_task.status_code == 200

    unassigned = await client.post(
        f"/parent/children/{api_context.child.id}/tasks/unassigned",
        headers=api_context.headers.child,
    )
    assert unassigned.status_code == 200

    giveup_list = await client.post(
        f"/parent/children/{api_context.child.id}/tasks/giveup",
        headers=api_context.headers.parent,
    )
    assert giveup_list.status_code == 200

    completed = await client.get(
        f"/parent/children/{api_context.child.id}/tasks/completed",
        headers=api_context.headers.child,
    )
    assert completed.status_code == 200

    delete_assigned = await client.delete(
        f"/parent/children/{api_context.child.id}/tasks/{created_child_task_id}",
        headers=api_context.headers.parent,
    )
    assert delete_assigned.status_code == 200

    delete_library_task = await client.delete(
        f"/parent/tasks/{new_task_id}",
        headers=api_context.headers.parent,
    )
    assert delete_library_task.status_code == 200


@pytest.mark.asyncio
async def test_reports_dashboard_interactions_and_ai_endpoints(api_context):
    client = api_context.client

    reports = await client.get(
        f"/parent/reports/{api_context.child.id}",
        headers=api_context.headers.parent,
    )
    assert reports.status_code == 200

    report_detail = await client.get(
        f"/parent/reports/{api_context.child.id}/{api_context.report.id}",
        headers=api_context.headers.parent,
    )
    assert report_detail.status_code == 200

    generate_report = await client.post(
        f"/parent/reports/{api_context.child.id}/generate",
        headers=api_context.headers.parent,
    )
    assert generate_report.status_code == 200

    dashboard = await client.get(
        f"/parent/dashboard/{api_context.child.id}",
        headers=api_context.headers.parent,
    )
    assert dashboard.status_code == 200

    category_progress = await client.get(
        f"/parent/dashboard/{api_context.child.id}/category-progress",
        headers=api_context.headers.parent,
    )
    assert category_progress.status_code == 200

    emotion_analytics = await client.get(
        f"/parent/dashboard/{api_context.child.id}/emotion-analytics",
        headers=api_context.headers.parent,
    )
    assert emotion_analytics.status_code == 200

    analyze_emotion_report = await client.post(
        f"/parent/dashboard/{api_context.child.id}/analyze-emotion-report",
        headers=api_context.headers.parent,
    )
    assert analyze_emotion_report.status_code == 200

    update_skills = await client.post(
        f"/parent/dashboard/{api_context.child.id}/update-skills",
        headers=api_context.headers.parent,
    )
    assert update_skills.status_code == 200

    interaction_chat = await client.post(
        f"/parent/children/{api_context.child.id}/interact/chat",
        json={"message": "Hom nay con rat vui"},
        headers=api_context.headers.parent,
    )
    assert interaction_chat.status_code == 200

    interaction_logs = await client.get(
        f"/parent/children/{api_context.child.id}/interact/logs",
        headers=api_context.headers.parent,
    )
    assert interaction_logs.status_code == 200

    interaction_history = await client.get(
        f"/parent/children/{api_context.child.id}/interact/history",
        headers=api_context.headers.parent,
    )
    assert interaction_history.status_code == 200

    generate_tasks = await client.post(
        f"/parent/children/{api_context.child.id}/generate/chat",
        json={"prompt": "Create a confidence-building task"},
        headers=api_context.headers.parent,
    )
    assert generate_tasks.status_code == 200

    score_child = await client.post(
        f"/parent/children/{api_context.child.id}/score/chat",
        json={"prompt": "Score the child development state"},
        headers=api_context.headers.parent,
    )
    assert score_child.status_code == 200
    assert score_child.json()["logic"] >= 0

    auto_generate = await client.post(
        f"/parent/children/{api_context.child.id}/generate/auto",
        headers=api_context.headers.parent,
    )
    assert auto_generate.status_code == 200


@pytest.mark.asyncio
async def test_rewards_games_and_child_endpoints(api_context):
    client = api_context.client

    child_login = await client.post(
        "/child/auth/login",
        json={"username": "kidtester", "password": "childpass123"},
    )
    assert child_login.status_code == 200
    assert child_login.json()["user_type"] == "child"

    child_me = await client.get("/child/me", headers=api_context.headers.child)
    assert child_me.status_code == 200
    assert child_me.json()["name"] == "Kid Tester"

    child_tasks = await client.get("/child/me/tasks", headers=api_context.headers.child)
    assert child_tasks.status_code == 200

    child_inventory = await client.get(
        "/child/me/rewards/inventory",
        headers=api_context.headers.child,
    )
    assert child_inventory.status_code == 200

    redeem_reward = await client.post(
        "/child/me/rewards/redeem",
        json={"reward_id": str(api_context.rewards.badge.id)},
        headers=api_context.headers.child,
    )
    assert redeem_reward.status_code == 200
    redemption_request_id = redeem_reward.json()["id"]

    shop_rewards = await client.get("/parent/shop/rewards", headers=api_context.headers.parent)
    assert shop_rewards.status_code == 200

    approve_redemption = await client.post(
        f"/parent/shop/redemption-requests/{redemption_request_id}/approve",
        headers=api_context.headers.parent,
    )
    assert approve_redemption.status_code == 200

    create_reward = await client.post(
        "/parent/shop/rewards",
        json={
            "name": "Sticker Pack",
            "description": "A fun sticker pack.",
            "type": "item",
            "cost_coins": 40,
            "stock_quantity": 5,
        },
        headers=api_context.headers.parent,
    )
    assert create_reward.status_code == 201
    created_reward_id = create_reward.json()["id"]

    update_reward = await client.put(
        f"/parent/shop/rewards/{created_reward_id}",
        json={"cost_coins": 45},
        headers=api_context.headers.parent,
    )
    assert update_reward.status_code == 200

    update_quantity = await client.patch(
        f"/parent/shop/rewards/{created_reward_id}/quantity",
        params={"delta": 2},
        headers=api_context.headers.parent,
    )
    assert update_quantity.status_code == 200

    pending_requests = await client.get(
        "/parent/shop/redemption-requests",
        headers=api_context.headers.parent,
    )
    assert pending_requests.status_code == 200

    reject_request = await client.post(
        f"/parent/children/{api_context.child.id}/redeem",
        json={"reward_id": created_reward_id},
        headers=api_context.headers.child,
    )
    assert reject_request.status_code == 200
    reject_request_id = reject_request.json()["id"]

    reject_redemption = await client.post(
        f"/parent/shop/redemption-requests/{reject_request_id}/reject",
        headers=api_context.headers.parent,
    )
    assert reject_redemption.status_code == 200

    equip_avatar = await client.post(
        "/child/me/rewards/avatar/equip",
        params={"reward_id": str(api_context.rewards.skin.id)},
        headers=api_context.headers.child,
    )
    assert equip_avatar.status_code == 200

    game_list = await client.get("/child/me/games", headers=api_context.headers.child)
    assert game_list.status_code == 200

    start_game = await client.post(
        f"/child/me/games/{api_context.game.id}/start",
        headers=api_context.headers.child,
    )
    assert start_game.status_code == 200
    session_id = start_game.json()["id"]

    submit_game = await client.post(
        f"/child/me/games/sessions/{session_id}/submit",
        json={"score": 95, "behavior_data": {"focus": "high"}},
        headers=api_context.headers.child,
    )
    assert submit_game.status_code == 200

    child_chat = await client.post(
        "/child/me/interactions/chat",
        json={"message": "Con dang rat vui"},
        headers=api_context.headers.child,
    )
    assert child_chat.status_code == 200

    child_logs = await client.get(
        "/child/me/interactions/logs",
        headers=api_context.headers.child,
    )
    assert child_logs.status_code == 200

    child_history = await client.get(
        "/child/me/interactions/history",
        headers=api_context.headers.child,
    )
    assert child_history.status_code == 200

    delete_reward = await client.delete(
        f"/parent/shop/rewards/{created_reward_id}",
        headers=api_context.headers.parent,
    )
    assert delete_reward.status_code == 204
