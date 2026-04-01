# API Contract: Child

Base path: `/child/*`

This document describes the current child-facing contract intended for a student client.

## Authentication

- Protected endpoints require `Authorization: Bearer <token>`
- Login endpoint:
  - `POST /child/auth/login`

### `POST /child/auth/login`
- Auth: Public
- Purpose: Login as child using username/password
- Request:

```json
{
  "username": "kidtester",
  "password": "childpass123"
}
```

- Response:

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user_type": "child",
  "child_id": "child-id",
  "child_name": "Kid Tester",
  "username": "kidtester"
}
```

## Profile

### `GET /child/me`
- Auth: Child
- Purpose: Read current child profile
- Response:

```json
{
  "id": "child-id",
  "name": "Kid Tester",
  "birth_date": "2018-04-01T00:00:00+00:00",
  "username": "kidtester",
  "current_coins": 500,
  "level": 3,
  "nickname": "Kiddo",
  "gender": "female",
  "avatar_url": null,
  "personality": ["curious"],
  "interests": ["drawing", "stories"],
  "strengths": ["logic"],
  "challenges": ["patience"],
  "initial_traits": {
    "overall_traits": {
      "independence": 60,
      "emotional": 55,
      "discipline": 58,
      "social": 57,
      "logic": 62
    }
  }
}
```

## Tasks

### Endpoints
- `GET /child/me/tasks`
- `POST /child/me/tasks/{task_id}/start`
- `POST /child/me/tasks/{child_task_id}/complete`
- `GET /child/me/tasks/{task_id}/status`
- `POST /child/me/tasks/{task_id}/giveup`
- `GET /child/me/tasks/unassigned`
- `GET /child/me/tasks/completed`

### `GET /child/me/tasks`
- Query:
  - `limit`
  - `category`
  - `status`
- Response item:

```json
{
  "id": "child-task-id",
  "status": "assigned",
  "assigned_at": "2026-04-01T00:00:00+00:00",
  "completed_at": null,
  "priority": "medium",
  "due_date": null,
  "progress": 0,
  "notes": null,
  "custom_title": null,
  "custom_reward_coins": null,
  "custom_category": null,
  "unity_type": "choice",
  "task": {
    "id": "task-id",
    "title": "Logic Blocks",
    "description": "Solve a simple block puzzle.",
    "category": "Logic",
    "type": "logic",
    "difficulty": 2,
    "suggested_age_range": "6-8",
    "reward_coins": 50,
    "reward_badge_name": null,
    "unity_type": "choice"
  }
}
```

### `POST /child/me/tasks/{task_id}/start`
- Request body:

```json
{
  "due_date": null,
  "priority": null,
  "notes": null,
  "custom_title": null,
  "custom_reward_coins": null,
  "custom_category": null
}
```

- Response:

```json
{
  "id": "child-task-id",
  "status": "in_progress",
  "assigned_at": "2026-04-01T00:00:00+00:00",
  "completed_at": null
}
```

### `POST /child/me/tasks/{child_task_id}/complete`
- Response:

```json
{
  "message": "Task completed successfully! Waiting for parent verification."
}
```

### `GET /child/me/tasks/{task_id}/status`
- Response:

```json
{
  "status": "assigned"
}
```

### `POST /child/me/tasks/{task_id}/giveup`
- Response:

```json
{
  "message": "Task marked as given up successfully.",
  "status": "giveup"
}
```

## Rewards

### Endpoints
- `POST /child/me/rewards/redeem`
- `GET /child/me/rewards/inventory`
- `POST /child/me/rewards/avatar/equip`

### `POST /child/me/rewards/redeem`
- Request:

```json
{
  "reward_id": "reward-id"
}
```

- Response:

```json
{
  "id": "redemption-request-id",
  "message": "Redemption request created. Waiting for parent approval.",
  "cost": 100
}
```

### `GET /child/me/rewards/inventory`
- Response item:

```json
{
  "id": "child-reward-id",
  "earned_at": "2026-04-01T00:00:00+00:00",
  "is_equipped": false,
  "reward": {
    "id": "reward-id",
    "name": "Focus Badge",
    "description": "Awarded for strong focus.",
    "type": "badge",
    "image_url": null
  }
}
```

### `POST /child/me/rewards/avatar/equip?reward_id=<reward-id>`
- Response:

```json
{
  "message": "Skin equipped successfully.",
  "reward_id": "reward-id"
}
```

## Interactions

### Endpoints
- `POST /child/me/interactions/chat`
- `GET /child/me/interactions/logs`
- `GET /child/me/interactions/history`

### `POST /child/me/interactions/chat`
- Request:

```json
{
  "message": "Con dang rat vui",
  "context": null
}
```

- Response:

```json
{
  "message": "Interaction recorded successfully.",
  "avatar_response": "Xin chao, minh o day de giup ban!"
}
```

### `GET /child/me/interactions/logs`
- Response:

```json
{
  "emotions": [
    {"name": "Happy", "value": 3},
    {"name": "Curious", "value": 1}
  ]
}
```

### `GET /child/me/interactions/history`
- Query:
  - `limit`
- Response item:

```json
{
  "id": "interaction-id",
  "timestamp": "2026-04-01T00:00:00+00:00",
  "user_input": "Con dang rat vui",
  "avatar_response": "Xin chao, minh o day de giup ban!",
  "detected_emotion": "Happy"
}
```

## Games

### Endpoints
- `GET /child/me/games`
- `POST /child/me/games/{game_id}/start`
- `POST /child/me/games/sessions/{session_id}/submit`

### `GET /child/me/games`
- Response item:

```json
{
  "id": "game-id",
  "name": "Memory Match",
  "description": "Match the pairs.",
  "linked_skill": "logic"
}
```

### `POST /child/me/games/{game_id}/start`
- Response:

```json
{
  "id": "session-id",
  "start_time": "2026-04-01T00:00:00+00:00",
  "end_time": null,
  "score": 0,
  "behavior_data": {}
}
```

### `POST /child/me/games/sessions/{session_id}/submit`
- Request:

```json
{
  "score": 95,
  "behavior_data": {
    "focus": "high",
    "persistence": "steady"
  }
}
```

- Response:

```json
{
  "message": "Game session recorded successfully."
}
```

## Main child flows

### Task flow

```text
login
-> get /child/me
-> get /child/me/tasks
-> post /child/me/tasks/{task_id}/start
-> post /child/me/tasks/{child_task_id}/complete
-> wait for parent verification
```

### Reward flow

```text
get /child/me/rewards/inventory
-> post /child/me/rewards/redeem
-> wait for parent approval
-> get /child/me/rewards/inventory
-> post /child/me/rewards/avatar/equip
```

### Interaction flow

```text
post /child/me/interactions/chat
-> get /child/me/interactions/logs
-> get /child/me/interactions/history
```

### Game flow

```text
get /child/me/games
-> post /child/me/games/{game_id}/start
-> post /child/me/games/sessions/{session_id}/submit
```

## Frontend integration notes

- Child client should only use `/child/*`, never `/parent/*`.
- `child_id` is encoded in the child token and resolved server-side.
- For task completion, use:
  - task library id for `start`
  - child task id for `complete`
- Reward redemption is asynchronous and requires parent approval before the reward appears in inventory.
