# Hướng dẫn test ngắn gọn

1) Chạy server
```bash
uvicorn main:app --reload
```
Mở docs: http://localhost:8000/docs

2) Đăng nhập (JSON) – POST /auth/login
```json
{ "email": "parent1@example.com", "password": "password123" }
```
Copy access_token và Authorize (Bearer <token>).

3) Lấy child_id – GET /children/children
Chọn id của “Bé An”.

4) Tasks
- GET /children/{child_id}/tasks
- GET /children/{child_id}/tasks/suggested
- Bắt đầu task: POST /children/{child_id}/tasks/{task_id}/start
- Hoàn thành: POST /children/{child_id}/tasks/{child_task_id}/complete
- Verify: POST /children/{child_id}/tasks/{child_task_id}/verify

5) Inventory/Rewards
- GET /children/{child_id}/inventory
- Equip skin: POST /children/{child_id}/avatar/equip?reward_id={reward_id}

6) Games
- GET /children/{child_id}/games
- Start: POST /children/{child_id}/games/{game_id}/start
- Submit: POST /children/{child_id}/games/sessions/{session_id}/submit
Body submit ví dụ:
```json
{ "score": 95, "behavior_data": { "time_spent": 1200 } }
```

7) Chat
- POST /children/{child_id}/interact/chat
```json
{ "user_input": "Xin chào" }
```

8) Dashboard & Reports
- GET /dashboard/{child_id}
- GET /reports/reports/{child_id}
- GET /reports/reports/{child_id}/{report_id}

Ghi chú:
- Luôn copy id từ response trước đó để dùng cho bước sau.
- Nếu popup OAuth2 không hoạt động, thêm thủ công header Authorization: Bearer <token>.

## Kết nối MongoDB

1. Cài MongoDB (hoặc tạo cluster MongoDB Atlas) và đảm bảo service đang chạy.
2. Ở thư mục gốc project, tạo file `.env` nếu chưa có, với nội dung ví dụ:
```env
DATABASE_URL=mongodb://localhost:27017
DATABASE_NAME=kiddy_mate_db
```
   - `DATABASE_URL`: connection string tới MongoDB (có thể thay bằng URL của MongoDB Atlas).
   - `DATABASE_NAME`: tên database, mặc định là `kiddy_mate_db` nếu không khai báo.
3. Khởi động lại server (`uvicorn main:app --reload`), Beanie sẽ tự tạo các collection trong MongoDB nếu chưa tồn tại.

## BƯỚC 5: Xem Tasks Của Bé An (Có Sẵn)

### GET `/children/{child_id}/tasks`

**Path Parameter:** `child_id` - ID của "Bé An" từ bước 4

**Response:**
```json
[
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k4",
    "status": "verified",
    "assigned_at": "2025-01-10T00:00:00",
    "completed_at": "2025-01-11T00:00:00",
    "task": {
      "id": "...",
      "title": "Giải bài toán đơn giản",
      "reward_coins": 10,
      "reward_badge_name": "Badge Toán Học Cơ Bản"
    }
  },
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "status": "completed",
    "assigned_at": "2025-01-12T00:00:00",
    "completed_at": "2025-01-13T00:00:00",
    "task": {
      "id": "...",
      "title": "Nhận biết cảm xúc",
      "reward_coins": 15,
      "reward_badge_name": "Badge Nhận Biết Cảm Xúc"
    }
  },
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k6",
    "status": "in_progress",
    "assigned_at": "2025-01-14T00:00:00",
    "completed_at": null,
    "task": {
      "id": "...",
      "title": "Giải câu đố logic",
      "reward_coins": 20,
      "reward_badge_name": "Badge Logic Nâng Cao"
    }
  }
]
```

**Quan sát:**
- Task 1: `verified` (đã verify, nhận coins và badge)
- Task 2: `completed` (đã hoàn thành, chờ verify)
- Task 3: `in_progress` (đang làm)

**Lưu lại:** `id` của child_task có status `completed` (ví dụ: `65a1b2c3d4e5f6g7h8i9j0k5`)

---

## BƯỚC 6: Verify Task Đã Completed

### POST `/children/{child_id}/tasks/{child_task_id}/verify`

**Path Parameters:**
- `child_id`: ID của "Bé An"
- `child_task_id`: ID của task có status `completed` (bước 5)

**Response:**
```json
{
  "message": "Task verified successfully."
}
```

**Kết quả:**
- Bé An nhận thêm 15 coins (từ 50 → 65 coins)
- Nhận badge "Badge Nhận Biết Cảm Xúc" (nếu chưa có)

---

## BƯỚC 7: Kiểm Tra Dashboard Sau Khi Verify

### GET `/dashboard/{child_id}`

**Path Parameter:** `child_id` - ID của "Bé An"

**Response:**
```json
{
  "child": {
    "name": "Bé An",
    "level": 2,
    "coins": 65
  },
  "tasks_completed": 2,
  "badges_earned": 2
}
```

**Xác nhận:**
- `coins` đã tăng từ 50 lên 65 (hoặc cao hơn nếu đã verify trước đó)
- `tasks_completed` = 2 (2 tasks đã verified)
- `badges_earned` = 2 (2 badges đã nhận)

---

## BƯỚC 8: Xem Inventory (Phần Thưởng Đã Nhận)

### GET `/children/{child_id}/inventory`

**Path Parameter:** `child_id` - ID của "Bé An"

**Response:**
```json
[
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k7",
    "earned_at": "2025-01-11T00:00:00",
    "reward": {
      "id": "...",
      "name": "Badge Toán Học Cơ Bản",
      "description": "Hoàn thành bài toán đầu tiên",
      "type": "badge",
      "image_url": "https://example.com/badges/math-basic.png"
    }
  },
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k8",
    "earned_at": "2025-01-12T00:00:00",
    "reward": {
      "id": "...",
      "name": "Skin Siêu Anh Hùng",
      "description": "Skin avatar siêu anh hùng",
      "type": "skin",
      "image_url": "https://example.com/skins/superhero.png"
    }
  },
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k9",
    "earned_at": "2025-01-15T00:00:00",
    "reward": {
      "id": "...",
      "name": "Badge Nhận Biết Cảm Xúc",
      "description": "Hiểu được cảm xúc của người khác",
      "type": "badge",
      "image_url": "https://example.com/badges/emotion-recognition.png"
    }
  }
]
```

**Quan sát:**
- Có 2-3 rewards (badges và skins)
- Có thể thấy badge mới nhận từ bước 6

**Lưu lại:** `id` của reward có `type: "skin"` (ví dụ: `65a1b2c3d4e5f6g7h8i9j0k8`)

---

## BƯỚC 9: Xem Tasks Được Đề Xuất

### GET `/children/{child_id}/tasks/suggested`

**Path Parameter:** `child_id` - ID của "Bé An"

**Response:** Array các tasks chưa được assign cho Bé An

**Ví dụ:**
```json
[
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k10",
    "title": "Thể hiện sự đồng cảm",
    "description": "Kể về cách bạn an ủi một người bạn buồn",
    "category": "EQ",
    "type": "emotion",
    "difficulty": 2,
    "suggested_age_range": "8-10",
    "reward_coins": 25,
    "reward_badge_name": "Badge Đồng Cảm"
  },
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k11",
    "title": "Bài toán phức tạp",
    "description": "Giải bài toán: (5 + 3) × 2 = ?",
    "category": "IQ",
    "type": "logic",
    "difficulty": 3,
    "suggested_age_range": "10-12",
    "reward_coins": 30,
    "reward_badge_name": "Badge Toán Học Nâng Cao"
  }
]
```

**Lưu lại:** `id` của một task (ví dụ: `65a1b2c3d4e5f6g7h8i9j0k10`)

---

## BƯỚC 10: Bắt Đầu Task Mới

### POST `/children/{child_id}/tasks/{task_id}/start`

**Path Parameters:**
- `child_id`: ID của "Bé An"
- `task_id`: ID của task từ bước 9

**Response:**
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k12",
  "status": "in_progress",
  "assigned_at": "2025-01-15T10:35:00",
  "completed_at": null
}
```

**Lưu lại:** `id` của child_task mới (ví dụ: `65a1b2c3d4e5f6g7h8i9j0k12`)

---

## BƯỚC 11: Hoàn Thành Task Mới

### POST `/children/{child_id}/tasks/{child_task_id}/complete`

**Path Parameters:**
- `child_id`: ID của "Bé An"
- `child_task_id`: ID của child_task từ bước 10

**Response:**
```json
{
  "message": "Task completed successfully."
}
```

---

## BƯỚC 12: Verify Task Mới

### POST `/children/{child_id}/tasks/{child_task_id}/verify`

**Path Parameters:**
- `child_id`: ID của "Bé An"
- `child_task_id`: ID của child_task từ bước 10

**Response:**
```json
{
  "message": "Task verified successfully."
}
```

**Kết quả:**
- Bé An nhận thêm 25 coins (từ 65 → 90 coins)
- Nhận badge "Badge Đồng Cảm"

---

## BƯỚC 13: Kiểm Tra Dashboard Lần 2

### GET `/dashboard/{child_id}`

**Response:**
```json
{
  "child": {
    "name": "Bé An",
    "level": 2,
    "coins": 90
  },
  "tasks_completed": 3,
  "badges_earned": 3
}
```

**Xác nhận:**
- `coins` đã tăng lên 90
- `tasks_completed` = 3
- `badges_earned` = 3

---

## BƯỚC 14: Xem Danh Sách Games

### GET `/children/{child_id}/games`

**Path Parameter:** `child_id` - ID của "Bé An"

**Response:**
```json
[
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k13",
    "name": "Trò chơi Logic",
    "description": "Rèn luyện tư duy logic qua các câu đố",
    "linked_skill": "Logic"
  },
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k14",
    "name": "Trò chơi Sáng Tạo",
    "description": "Phát triển khả năng sáng tạo",
    "linked_skill": "Creativity"
  },
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k15",
    "name": "Trò chơi Giao Tiếp",
    "description": "Cải thiện kỹ năng giao tiếp xã hội",
    "linked_skill": "Social"
  },
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k16",
    "name": "Trò chơi Toán Học",
    "description": "Luyện tập toán học vui nhộn",
    "linked_skill": "Math"
  }
]
```

**Lưu lại:** `id` của một game (ví dụ: `65a1b2c3d4e5f6g7h8i9j0k13`)

---

## BƯỚC 15: Bắt Đầu Game Session

### POST `/children/{child_id}/games/{game_id}/start`

**Path Parameters:**
- `child_id`: ID của "Bé An"
- `game_id`: ID của game từ bước 14

**Response:**
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k17",
  "start_time": "2025-01-15T10:45:00",
  "end_time": null,
  "score": null,
  "behavior_data": null
}
```

**Lưu lại:** `id` của session (ví dụ: `65a1b2c3d4e5f6g7h8i9j0k17`)

---

## BƯỚC 16: Submit Game Session

### POST `/children/{child_id}/games/sessions/{session_id}/submit`

**Path Parameters:**
- `child_id`: ID của "Bé An"
- `session_id`: ID của session từ bước 15

**Request Body:**
```json
{
  "score": 95,
  "behavior_data": {
    "time_spent": 1200,
    "attempts": 2,
    "accuracy": 0.95,
    "focus_level": "very_high"
  }
}
```

**Response:**
```json
{
  "message": "Game session submitted successfully."
}
```

---

## BƯỚC 17: Test Interaction (Chat với Avatar)

### POST `/children/{child_id}/interact/chat`

**Path Parameter:** `child_id` - ID của "Bé An"

**Request Body:**
```json
{
  "user_input": "Xin chào, bạn tên gì?"
}
```

**Response:**
```json
{
  "message": "Interaction logged successfully.",
  "avatar_response": "Đây là phản hồi mẫu."
}
```

Interaction được lưu vào database

---

## BƯỚC 18: Xem Reports

### GET `/reports/{child_id}`

**Path Parameter:** `child_id` - ID của "Bé An"

**Response:**
```json
[
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k18",
    "period_start": "2025-01-01T00:00:00",
    "period_end": "2025-01-31T00:00:00",
    "generated_at": "2025-02-01T00:00:00",
    "summary_text": "Bé An đã có tiến bộ tốt trong tháng 1. Hoàn thành 2 tasks và nhận được 1 badge. Cần tiếp tục phát triển kỹ năng logic.",
    "insights": {
      "tasks_completed": 2,
      "tasks_verified": 1,
      "coins_earned": 25,
      "strengths": ["logic", "creativity"],
      "areas_for_improvement": ["emotional intelligence"]
    },
    "suggestions": {
      "focus": "Nên làm thêm các tasks về cảm xúc",
      "recommended_tasks": ["Nhận biết cảm xúc", "Thể hiện sự đồng cảm"],
      "games": "Chơi thêm Trò chơi Giao Tiếp"
    }
  }
]
```

**Lưu lại:** `id` của report (ví dụ: `65a1b2c3d4e5f6g7h8i9j0k18`)

---

## BƯỚC 19: Xem Chi Tiết Report

### GET `/reports/{child_id}/{report_id}`

**Path Parameters:**
- `child_id`: ID của "Bé An"
- `report_id`: ID của report từ bước 18

**Response:** Report object với đầy đủ thông tin

---

## BƯỚC 20: Equip Avatar Skin

### POST `/children/{child_id}/avatar/equip`

**Path Parameter:** `child_id` - ID của "Bé An"

**Query Parameter:** `reward_id` - ID của reward (skin) từ inventory (bước 8)

**Response:**
```json
{
  "message": "Avatar skin equipped successfully.",
  "reward_id": "65a1b2c3d4e5f6g7h8i9j0k8"
}
```

Chỉ có thể equip rewards có `type: "skin"`

---

## BƯỚC 21: Test với Bé Bình

Lặp lại các bước 5-20 với **Bé Bình** để test:
- Child khác của cùng parent
- Dữ liệu khác (30 coins, level 1, 1 task, 1 reward)

---

## BƯỚC 22: Test với Parent 2

1. **Đăng xuất:** Xóa token trong Swagger (click "Authorize" → "Logout")
2. **Đăng nhập mới:** `parent2@example.com` / `password123`
3. **Xem children:** GET `/children/children` → Thấy **Bé Chi** (100 coins, level 3)
4. **Test các API tương tự** với Bé Chi

---