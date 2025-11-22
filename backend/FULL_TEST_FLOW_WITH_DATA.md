# Full Test Flow - Parent & Child Sessions (With Actual Data)

**Generated:** 2025-11-22 11:34:53

## 📋 Test Data Summary

### Parent Account
- **Email:** `demo@kiddymate.com`
- **Password:** `demo123`
- **Token:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0`
- **User ID:** `69212e1ee592f0f7e4ac383d`

### Child Account
- **Email:** `emma@kiddymate.com`
- **Password:** `emma123`
- **Token:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k`
- **Child Profile ID:** `69212e1ee592f0f7e4ac3840`
- **Name:** Emma Johnson (Emmy)
- **Coins:** 125, **Level:** 3

### Sample IDs
- **Task ID:** `69212e1fe592f0f7e4ac3848`
- **Child Task ID:** `69212e1fe592f0f7e4ac3885`
- **Unassigned Task ID:** `69212e1fe592f0f7e4ac3883`
- **In Progress Task ID:** `69212e1fe592f0f7e4ac3880`
- **Need Verify Task ID:** `69212e1fe592f0f7e4ac387e`
- **Completed Task ID:** `69212e1fe592f0f7e4ac3879`
- **Giveup Task ID:** `69212e1fe592f0f7e4ac3882`
- **Reward ID:** `69212e1fe592f0f7e4ac3864`
- **Game ID:** `69212e1fe592f0f7e4ac38a7`
- **Assessment ID:** `69212e1fe592f0f7e4ac3846`
- **Report ID:** `69212e20e592f0f7e4ac38be`

---

# 🧑‍💼 PHIÊN TEST PARENT

## BƯỚC 1: Authentication & Setup

### 1.1. Login Parent
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "demo@kiddymate.com",
  "password": "demo123"
}
```

**Authorization Token (sau khi login):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Expected:** 200 OK với `access_token`

---

### 1.2. Get Current User Info
**Endpoint:** `GET /auth/me`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Expected:** 200 OK với user info, role = "parent", children_count

---

## BƯỚC 2: Child Management

### 2.1. Get All Children
**Endpoint:** `GET /children/`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Expected:** 200 OK với array các children

---

### 2.2. Get Specific Child
**Endpoint:** `GET /children/{child_id}`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Expected:** 200 OK với child details

---

### 2.3. Update Child Profile
**Endpoint:** `PUT /children/{child_id}`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Request Body:**
```json
{
  "nickname": "Updated Emmy",
  "interests": ["reading", "drawing", "coding"]
}
```

**Note:** Tất cả các fields trong request body đều optional. Chỉ cần gửi các fields muốn update.

**Expected:** 200 OK với updated child info

---

## BƯỚC 3: Task Library Management (Parent)

### 3.1. List All Tasks
**Endpoint:** `GET /tasks`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Expected:** 200 OK với array các tasks

---

### 3.2. Create Custom Task
**Endpoint:** `POST /tasks`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Request Body:**
```json
{
  "title": "Custom Task - Test",
  "description": "A custom task created by parent for testing",
  "category": "Independence",
  "type": "logic",
  "difficulty": 2,
  "suggested_age_range": "5-8",
  "reward_coins": 20,
  "unity_type": "life"
}
```

**Expected:** 201 Created với task info

---

## BƯỚC 4: Child Task Management (Parent View)

### 4.1. View All Child Tasks
**Endpoint:** `GET /children/{child_id}/tasks`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Expected:** 200 OK với array các child tasks

---

### 4.2. View Suggested Tasks for Child
**Endpoint:** `GET /children/{child_id}/tasks/suggested`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Expected:** 200 OK với array các suggested tasks

---

### 4.3. Update Child Task
**Endpoint:** `PUT /children/{child_id}/tasks/{child_task_id}`

**Path Parameters:**
- `child_id`: `69212e1ee592f0f7e4ac3840`
- `child_task_id`: `69212e1fe592f0f7e4ac3885`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Request Body:**
```json
{
  "priority": "high",
  "due_date": "2024-12-31T23:59:59",
  "notes": "Important task - updated by parent"
}
```

**Expected:** 200 OK với updated child task

---

## BƯỚC 5: Parent-Only Functions

### 5.1. Verify/Approve Completed Task
**Endpoint:** `POST /children/{child_id}/tasks/{child_task_id}/verify`

**Path Parameters:**
- `child_id`: `69212e1ee592f0f7e4ac3840`
- `child_task_id`: `69212e1fe592f0f7e4ac387e`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Expected:** 200 OK với success message và rewards awarded

---

### 5.2. View Giveup Tasks
**Endpoint:** `POST /children/{child_id}/tasks/giveup`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Expected:** 200 OK với array các tasks có status = "giveup"

---

### 5.3. Generate Tasks Using LLM
**Endpoint:** `POST /children/{child_id}/generate/chat`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Request Body:**
```json
{
  "prompt": "Tạo nhiệm vụ phù hợp với Emma Johnson, tập trung vào tính độc lập và logic"
}
```

**Expected:** 200 OK với array các ChildTask với status = "unassigned"

---

### 5.4. Score Child Performance Using LLM
**Endpoint:** `POST /children/{child_id}/score/chat`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Request Body:**
```json
{
  "prompt": "Đánh giá tổng thể khả năng của Emma Johnson dựa trên lịch sử hoàn thành nhiệm vụ"
}
```

**Expected:** 200 OK với 5 metrics: Logic, Independence, Emotional, Discipline, Social

---

## BƯỚC 6: Dashboard & Reports (Parent)

### 6.1. View Child Dashboard
**Endpoint:** `GET /dashboard/{child_id}`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Expected:** 200 OK với dashboard stats (tasks_completed, badges_earned, completion_rate)

---

### 6.2. View Child Reports
**Endpoint:** `GET /reports/reports/{child_id}`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Expected:** 200 OK với array các reports

---

### 6.3. View Specific Report
**Endpoint:** `GET /reports/reports/{child_id}/{report_id}`

**Path Parameters:**
- `child_id`: `69212e1ee592f0f7e4ac3840`
- `report_id`: `69212e20e592f0f7e4ac38be`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Expected:** 200 OK với report details

---

## BƯỚC 7: Assessments (Parent)

### 7.1. Create Assessment
**Endpoint:** `POST /children/{child_id}/assessments`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Request Body:**
```json
{
  "logic_score": 8,
  "independence_score": 7,
  "emotional_score": 9,
  "discipline_score": 6,
  "social_score": 8,
  "notes": "Child is doing well overall - test assessment"
}
```

**Expected:** 201 Created với assessment info

---

### 7.2. List Assessments
**Endpoint:** `GET /children/{child_id}/assessments`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Expected:** 200 OK với array các assessments

---

### 7.3. Update Assessment
**Endpoint:** `PUT /children/{child_id}/assessments/{assessment_id}`

**Path Parameters:**
- `child_id`: `69212e1ee592f0f7e4ac3840`
- `assessment_id`: `69212e1fe592f0f7e4ac3846`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Request Body:**
```json
{
  "logic_score": 9,
  "notes": "Updated assessment - test"
}
```

**Expected:** 200 OK với updated assessment

---

## BƯỚC 8: Rewards & Shop (Parent View)

### 8.1. View Reward Shop
**Endpoint:** `GET /shop/rewards`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Expected:** 200 OK với array các rewards available

---

### 8.2. View Child Inventory
**Endpoint:** `GET /children/{child_id}/inventory`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Expected:** 200 OK với array các rewards child đã có

---

## BƯỚC 9: Profile Management (Parent)

### 9.1. Update Profile
**Endpoint:** `PUT /auth/me`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Request Body:**
```json
{
  "full_name": "Sarah Johnson (Updated)",
  "phone_number": "+1234567890"
}
```

**Expected:** 200 OK với updated profile

---

### 9.2. Get Notification Settings
**Endpoint:** `GET /auth/me/notification-settings`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Expected:** 200 OK với notification settings

---

# 👶 PHIÊN TEST CHILD

## BƯỚC 1: Authentication & Setup

### 1.1. Login Child Account
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "emma@kiddymate.com",
  "password": "emma123"
}
```

**Authorization Token (sau khi login):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 200 OK với `access_token`

---

### 1.2. Get Current User Info
**Endpoint:** `GET /auth/me`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 200 OK với user info, role = "child", child_profile info

---

## BƯỚC 2: Dashboard & Profile (Child)

### 2.1. View Own Dashboard
**Endpoint:** `GET /dashboard/{child_id}`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 200 OK với dashboard stats (coins: 125, level: 3, tasks_completed, badges_earned)

---

### 2.2. View Own Profile
**Endpoint:** `GET /children/{child_id}`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 200 OK với child profile details

---

## BƯỚC 3: Task Management (Child-Only)

### 3.1. View All My Tasks
**Endpoint:** `GET /children/{child_id}/tasks`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 200 OK với array các tasks của child

---

### 3.2. View Suggested Tasks
**Endpoint:** `GET /children/{child_id}/tasks/suggested`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 200 OK với array các suggested tasks

---

### 3.3. View Unassigned Tasks
**Endpoint:** `POST /children/{child_id}/tasks/unassigned`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 200 OK với array các tasks có status = "unassigned"

---

### 3.4. Start a Task
**Endpoint:** `POST /children/{child_id}/tasks/{task_id}/start`

**Path Parameters:**
- `child_id`: `69212e1ee592f0f7e4ac3840`
- `task_id`: `69212e1fe592f0f7e4ac3848`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 201 Created với ChildTask có status = "assigned"

---

### 3.5. Check Task Status
**Endpoint:** `GET /children/{child_id}/tasks/{task_id}/status`

**Path Parameters:**
- `child_id`: `69212e1ee592f0f7e4ac3840`
- `task_id`: `69212e1fe592f0f7e4ac3848`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 200 OK với `{"status": "assigned"}` hoặc status hiện tại

---

### 3.6. Update Task Progress
**Endpoint:** `PUT /children/{child_id}/tasks/{child_task_id}`

**Path Parameters:**
- `child_id`: `69212e1ee592f0f7e4ac3840`
- `child_task_id`: `69212e1fe592f0f7e4ac3885`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Request Body:**
```json
{
  "progress": 50,
  "notes": "Halfway done!"
}
```

**Expected:** 200 OK với updated child task

---

### 3.7. Complete a Task
**Endpoint:** `POST /children/{child_id}/tasks/{child_task_id}/complete`

**Path Parameters:**
- `child_id`: `69212e1ee592f0f7e4ac3840`
- `child_task_id`: `69212e1fe592f0f7e4ac3880`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 200 OK với message "Nhiệm vụ đã hoàn thành! Đang chờ phụ huynh xác nhận." và status = "need_verify"

---

### 3.8. View Completed Tasks
**Endpoint:** `GET /children/{child_id}/tasks/completed`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 200 OK với array các tasks có status = "completed"

---

### 3.9. Give Up on a Task
**Endpoint:** `POST /children/{child_id}/tasks/{task_id}/giveup`

**Path Parameters:**
- `child_id`: `69212e1ee592f0f7e4ac3840`
- `task_id`: `69212e1fe592f0f7e4ac3880`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 200 OK với message và status = "giveup"

---

## BƯỚC 4: Games (Child)

### 4.1. View Available Games
**Endpoint:** `GET /children/{child_id}/games`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 200 OK với array các mini games

---

### 4.2. Start a Game Session
**Endpoint:** `POST /children/{child_id}/games/{game_id}/start`

**Path Parameters:**
- `child_id`: `69212e1ee592f0f7e4ac3840`
- `game_id`: `69212e1fe592f0f7e4ac38a7`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 201 Created với GameSession

---

## BƯỚC 5: Rewards & Shop (Child)

### 5.1. View Reward Shop
**Endpoint:** `GET /shop/rewards`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 200 OK với array các rewards available

---

### 5.2. Redeem Reward
**Endpoint:** `POST /children/{child_id}/redeem`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Request Body:**
```json
{
  "reward_id": "69212e1fe592f0f7e4ac3864",
  "quantity": 1
}
```

**Expected:** 200 OK với success message và updated coins (current: 125)

---

### 5.3. View My Inventory
**Endpoint:** `GET /children/{child_id}/inventory`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 200 OK với array các rewards child đã có

---

## BƯỚC 6: Interactions & Chat (Child)

### 6.1. Chat with Bot
**Endpoint:** `POST /children/{child_id}/interact/chat`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Request Body:**
```json
{
  "message": "Xin chào! Hôm nay em muốn làm gì?",
  "context": "greeting"
}
```

**Expected:** 200 OK với bot response

---

### 6.2. View Interaction Logs
**Endpoint:** `GET /children/{child_id}/interact/logs`

**Path Parameter:**
- `child_id`: `69212e1ee592f0f7e4ac3840`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 200 OK với interaction logs

---

## BƯỚC 7: Profile Management (Child)

### 7.1. Update Profile
**Endpoint:** `PUT /auth/me`

**Authorization:** Bearer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Request Body:**
```json
{
  "full_name": "Emma Johnson (Updated)"
}
```

**Expected:** 200 OK với updated profile

---

## BƯỚC 8: Error Cases & Security Tests

### 8.1. Child Cannot Access Parent-Only Endpoints
**Endpoint:** `POST /children/{child_id}/tasks/{child_task_id}/verify`

**Path Parameters:**
- `child_id`: `69212e1ee592f0f7e4ac3840`
- `child_task_id`: `69212e1fe592f0f7e4ac387e`

**Authorization:** Bearer Token (Child Token)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbW1hQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.Jpgbj0xzb3YUNICGPdHwBJLTpzdpeCjouY2F79iez-k
```

**Expected:** 403 Forbidden - "This endpoint requires parent role"

---

### 8.2. Parent Cannot Access Child-Only Endpoints
**Endpoint:** `POST /children/{child_id}/tasks/{child_task_id}/complete`

**Path Parameters:**
- `child_id`: `69212e1ee592f0f7e4ac3840`
- `child_task_id`: `69212e1fe592f0f7e4ac3885`

**Authorization:** Bearer Token (Parent Token)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGtpZGR5bWF0ZS5jb20iLCJleHAiOjE3NjM3ODc4NDB9.k8xoG6PZqWndC-qQZpF4prB_vKPFSiAV9men8rC7Hi0
```

**Expected:** 403 Forbidden - "This endpoint requires child role"

---

### 8.3. Invalid Token
**Endpoint:** `GET /auth/me`

**Authorization:** Bearer Token
```
invalid_token_12345
```

**Expected:** 401 Unauthorized - "Could not validate credentials"

---

## 📝 Test Checklist

### Parent Session Checklist
- [ ] Authentication (login, me)
- [ ] Child Management (list, get, update)
- [ ] Task Library (list, create)
- [ ] View Child Tasks
- [ ] Verify/Approve Tasks
- [ ] Generate Tasks (LLM)
- [ ] Score Child (LLM)
- [ ] View Giveup Tasks
- [ ] Dashboard & Reports
- [ ] Assessments (create, list, update)
- [ ] Profile Management

### Child Session Checklist
- [ ] Authentication (login, me)
- [ ] View Dashboard
- [ ] View Tasks (all, suggested, unassigned, completed)
- [ ] Start Task
- [ ] Complete Task
- [ ] Give Up Task
- [ ] Check Task Status
- [ ] Update Task Progress
- [ ] Play Games
- [ ] Redeem Rewards
- [ ] View Inventory
- [ ] Chat with Bot
- [ ] Profile Management
- [ ] Security Tests (cannot access parent endpoints)

---

## 🔍 Notes

1. **Tokens:** Tokens in this file are generated at extraction time. If they expire, login again to get new tokens.

2. **IDs:** All IDs are from actual database. Copy and paste directly into Swagger.

3. **Swagger Usage:**
   - Open Swagger UI at `http://localhost:8000/docs`
   - Click "Authorize" button (🔓 icon)
   - Paste token vào "Value" field: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Click "Authorize" và "Close"
   - Tất cả requests sẽ tự động include token

4. **Path Parameters:** Copy ID values từ phần "Sample IDs" ở đầu file và paste vào Swagger path parameters.

5. **Request Body:** Copy JSON từ file này và paste vào Swagger request body editor.

6. **Status Flow:**
   - `unassigned` → `assigned` (start task)
   - `assigned` → `in_progress` (start working)
   - `in_progress` → `need_verify` (complete task)
   - `need_verify` → `completed` (parent verify)
   - `in_progress` → `giveup` (give up)

7. **Coins:** Child currently has 125 coins. Check reward costs before redeeming.
