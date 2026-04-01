# API Contract: Parent

Base path: `/parent/*`

This document describes the current parent-facing backend contract as implemented in the refactored backend.

## Authentication

- Protected endpoints require `Authorization: Bearer <token>`
- Parent login endpoints:
  - `POST /parent/auth/register`
  - `POST /parent/auth/login`
  - `POST /parent/auth/token`
- Parent-only protection is enforced on `/parent/*` routes except public registration/login/onboarding.

## Response conventions

- Most success responses are JSON objects.
- Validation or permission failures return:

```json
{
  "detail": "Human-readable error message"
}
```

- Reward shop endpoints expose canonical snake_case fields and legacy aliases for backward compatibility:
  - canonical: `image_url`, `cost_coins`, `stock_quantity`
  - legacy aliases: `url_thumbnail`, `cost`, `remain`

## Parent Auth

### `POST /parent/auth/register`
- Auth: Public
- Purpose: Create a parent account
- Request:

```json
{
  "email": "parent@example.com",
  "password": "password123",
  "full_name": "Parent Name",
  "phone_number": "0900123456"
}
```

- Response:

```json
{
  "message": "Registration successful."
}
```

### `POST /parent/auth/login`
- Auth: Public
- Purpose: Login with JSON payload
- Request:

```json
{
  "email": "parent@example.com",
  "password": "password123"
}
```

- Response:

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer"
}
```

### `POST /parent/auth/token`
- Auth: Public
- Purpose: OAuth2-style form login
- Form fields: `username=<email>`, `password=<password>`
- Response: same as `/parent/auth/login`

### `POST /parent/auth/logout`
- Auth: Parent
- Purpose: Logout current parent session
- Response:

```json
{
  "message": "Logout successful"
}
```

### `POST /parent/auth/register/child`
- Auth: Parent
- Purpose: Link a child login account to an existing child profile
- Request:

```json
{
  "email": "child-account@example.com",
  "password": "child-password",
  "full_name": "Child Account",
  "child_id": "child-object-id"
}
```

- Response:

```json
{
  "message": "Child account created successfully.",
  "user_id": "user-object-id",
  "child_id": "child-object-id"
}
```

### `GET /parent/auth/me`
- Auth: Parent
- Purpose: Read current parent profile
- Response:

```json
{
  "id": "user-id",
  "email": "parent@example.com",
  "full_name": "Parent Name",
  "phone_number": "0900123456",
  "role": "parent",
  "onboarding_completed": true,
  "created_at": "2026-04-01T00:00:00+00:00",
  "children_count": 2
}
```

### `PUT /parent/auth/me`
- Auth: Parent
- Purpose: Update profile
- Request:

```json
{
  "full_name": "Updated Parent Name",
  "phone_number": "0900999888"
}
```

### `PUT /parent/auth/me/password`
- Auth: Parent
- Purpose: Change password
- Request:

```json
{
  "current_password": "old-password",
  "new_password": "new-password"
}
```

### `DELETE /parent/auth/me`
- Auth: Parent
- Purpose: Delete parent account and associated child-owned data
- Request:

```json
{
  "confirmation": "DELETE",
  "password": "current-password"
}
```

### `GET /parent/auth/me/notification-settings`
### `PUT /parent/auth/me/notification-settings`
- Auth: Parent
- Purpose: Read or update notification preferences
- Response / request shape:

```json
{
  "email": {
    "enabled": true,
    "coin_redemption": true,
    "task_reminders": true,
    "emotional_trends": false,
    "weekly_reports": true
  },
  "push": {
    "enabled": false,
    "coin_redemption": false,
    "task_reminders": true,
    "emotional_trends": false,
    "weekly_reports": false
  }
}
```

## Onboarding

### `POST /parent/onboarding/complete`
- Auth: Public
- Purpose: Complete parent onboarding and create the first child
- Request:

```json
{
  "parent_email": "parent@example.com",
  "parent_display_name": "Parent Name",
  "phone_number": "0900123456",
  "children": [
    {
      "full_name": "Kid Name",
      "nickname": "Kid",
      "date_of_birth": "2018-05-01",
      "gender": "male",
      "username": "kid-login",
      "password": "kid-password",
      "favorite_topics": ["space"],
      "personality": ["curious"],
      "interests": ["space"],
      "strengths": ["focus"],
      "challenges": ["patience"],
      "discipline_autonomy": {"completes_personal_tasks": "4"},
      "emotional_intelligence": {"shows_empathy": "4"},
      "social_interaction": {"shares_and_waits_turns": "3"}
    }
  ]
}
```

## Children

### Endpoints
- `POST /parent/children`
- `GET /parent/children`
- `GET /parent/children/{child_id}`
- `PUT /parent/children/{child_id}`
- `POST /parent/children/{child_id}/select`
- `DELETE /parent/children/{child_id}`

### Child payload

```json
{
  "name": "Kid Name",
  "birth_date": "2018-04-01T00:00:00Z",
  "nickname": "Kid",
  "gender": "female",
  "interests": ["music"],
  "username": "kid-login",
  "password": "kid-password"
}
```

### Child response

```json
{
  "id": "child-id",
  "name": "Kid Name",
  "birth_date": "2018-04-01T00:00:00+00:00",
  "username": "kid-login",
  "current_coins": 0,
  "level": 1,
  "nickname": "Kid",
  "gender": "female",
  "avatar_url": null,
  "personality": [],
  "interests": ["music"],
  "strengths": [],
  "challenges": [],
  "initial_traits": {}
}
```

## Assessments

### Endpoints
- `POST /parent/children/{child_id}/assessments`
- `POST /parent/children/{child_id}/assessments/simple`
- `GET /parent/children/{child_id}/assessments`
- `GET /parent/children/{child_id}/assessments/{assessment_id}`
- `PUT /parent/children/{child_id}/assessments/{assessment_id}`

### Detailed assessment request

```json
{
  "discipline_autonomy": {
    "completes_personal_tasks": "4",
    "keeps_personal_space_tidy": "4",
    "finishes_simple_chores": "3",
    "follows_screen_time_rules": "4",
    "struggles_with_activity_transitions": "2"
  },
  "emotional_intelligence": {
    "expresses_big_emotions_with_aggression": "2",
    "verbalizes_emotions": "4",
    "shows_empathy": "4",
    "displays_excessive_worry": "2",
    "owns_mistakes": "3"
  },
  "social_interaction": {
    "joins_peer_groups_confidently": "3",
    "shares_and_waits_turns": "4",
    "resolves_conflict_with_words": "3",
    "prefers_solo_play": "2",
    "asks_for_help_politely": "4"
  }
}
```

### Simple assessment request

```json
{
  "logic_score": 8,
  "independence_score": 7,
  "emotional_score": 6,
  "discipline_score": 7,
  "social_score": 8,
  "notes": "Quick assessment"
}
```

## Task Library

### Endpoints
- `GET /parent/tasks`
- `POST /parent/tasks`
- `PUT /parent/tasks/{task_id}`
- `DELETE /parent/tasks/{task_id}`

### Request

```json
{
  "title": "Paint Shapes",
  "description": "Paint three geometric shapes.",
  "category": "Creativity",
  "type": "logic",
  "difficulty": 2,
  "suggested_age_range": "6-8",
  "reward_coins": 55,
  "reward_badge_name": null,
  "unity_type": "choice"
}
```

## Parent Child Tasks

### Endpoints
- `GET /parent/children/{child_id}/tasks/suggested`
- `GET /parent/children/{child_id}/tasks`
- `POST /parent/children/{child_id}/tasks/{task_id}/assign`
- `POST /parent/children/{child_id}/tasks/{child_task_id}/verify`
- `POST /parent/children/{child_id}/tasks/{child_task_id}/reject`
- `PUT /parent/children/{child_id}/tasks/{child_task_id}`
- `POST /parent/children/{child_id}/tasks/create-and-assign`
- `DELETE /parent/children/{child_id}/tasks/{child_task_id}`
- `POST /parent/children/{child_id}/tasks/giveup`

### Assigned task response

```json
{
  "id": "child-task-id",
  "status": "assigned",
  "assigned_at": "2026-04-01T00:00:00+00:00",
  "completed_at": null,
  "priority": "medium",
  "due_date": null,
  "progress": 0,
  "notes": "Assigned from parent UI",
  "custom_title": null,
  "custom_reward_coins": null,
  "custom_category": null,
  "unity_type": "choice",
  "task": {
    "id": "task-id",
    "title": "Paint Shapes",
    "description": "Paint three geometric shapes.",
    "category": "Creativity",
    "type": "logic",
    "difficulty": 2,
    "suggested_age_range": "6-8",
    "reward_coins": 55,
    "reward_badge_name": null,
    "unity_type": "choice"
  }
}
```

## Reward Shop

### Endpoints
- `GET /parent/shop/rewards`
- `POST /parent/shop/rewards`
- `PUT /parent/shop/rewards/{reward_id}`
- `DELETE /parent/shop/rewards/{reward_id}`
- `PATCH /parent/shop/rewards/{reward_id}/quantity`
- `GET /parent/shop/redemption-requests`
- `POST /parent/shop/redemption-requests/{request_id}/approve`
- `POST /parent/shop/redemption-requests/{request_id}/reject`

### Reward request

```json
{
  "name": "Sticker Pack",
  "description": "A fun sticker pack.",
  "type": "item",
  "image_url": null,
  "cost_coins": 40,
  "stock_quantity": 5,
  "is_active": true
}
```

### Reward response

```json
{
  "id": "reward-id",
  "name": "Sticker Pack",
  "description": "A fun sticker pack.",
  "type": "item",
  "image_url": null,
  "cost_coins": 40,
  "stock_quantity": 5,
  "is_active": true,
  "url_thumbnail": null,
  "cost": 40,
  "remain": 5
}
```

### Redemption request response

```json
{
  "id": "request-id",
  "child_name": "Kid Tester",
  "child_id": "child-id",
  "reward_name": "Sticker Pack",
  "reward_id": "reward-id",
  "requested_at": "2026-04-01",
  "cost_coins": 40,
  "status": "pending",
  "child": "Kid Tester",
  "childId": "child-id",
  "rewardName": "Sticker Pack",
  "rewardId": "reward-id",
  "dateCreated": "2026-04-01",
  "cost": 40
}
```

## Reports

### Endpoints
- `GET /parent/reports/{child_id}`
- `GET /parent/reports/{child_id}/{report_id}`
- `POST /parent/reports/{child_id}/generate`

### Report response

```json
{
  "id": "report-id",
  "summary_text": "Child shows steady progress and healthy engagement.",
  "period_start": "2026-03-25T00:00:00+00:00",
  "period_end": "2026-04-01T00:00:00+00:00",
  "insights": {
    "tasks_completed": 2,
    "tasks_verified": 1,
    "emotion_trends": {"Happy": 50, "Confident": 30, "Engaged": 20},
    "most_common_emotion": "Happy"
  },
  "suggestions": {
    "focus": "Social growth",
    "recommended_activities": ["Group puzzle", "Story sharing"]
  }
}
```

## Dashboard

### Endpoints
- `GET /parent/dashboard/{child_id}`
- `GET /parent/dashboard/{child_id}/category-progress`
- `GET /parent/dashboard/{child_id}/emotion-analytics`
- `POST /parent/dashboard/{child_id}/analyze-emotion-report`
- `POST /parent/dashboard/{child_id}/update-skills`

## Parent Child Inventory, Interactions, Games, AI

### Endpoints
- `GET /parent/children/{child_id}/inventory`
- `POST /parent/children/{child_id}/interact/chat`
- `GET /parent/children/{child_id}/interact/logs`
- `GET /parent/children/{child_id}/interact/history`
- `GET /parent/children/{child_id}/games`
- `POST /parent/children/{child_id}/generate/chat`
- `POST /parent/children/{child_id}/score/chat`
- `POST /parent/children/{child_id}/generate/auto`

## Main parent flow

```text
register
-> login
-> onboarding or create child
-> create/update task library item
-> assign task to child
-> child completes task
-> parent verifies task
-> parent reads dashboard / reports / reward requests
```

## Frontend integration notes

- Use `access_token` from `/parent/auth/login` or `/parent/auth/token` for all protected routes.
- Prefer canonical reward fields in new frontend code:
  - `image_url`
  - `cost_coins`
  - `stock_quantity`
- Keep support for legacy aliases if old UI code still expects:
  - `url_thumbnail`
  - `cost`
  - `remain`
