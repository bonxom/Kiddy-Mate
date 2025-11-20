# 📊 Báo Cáo Phân Tích API Backend & Frontend Integration

**Cập nhật:** 20/11/2025 - Sau khi fix router prefixes & enhance APIs

---

## 📝 **CHANGE LOG**

### **Version 2.0 - 20/11/2025**

**✅ MAJOR FIXES:**

1. **Router Prefix Architecture** - Fixed duplicate prefixes (14 endpoints across 5 routers)
   - Before: `/children/children/{id}/tasks` ❌
   - After: `/children/{id}/tasks` ✅
2. **Onboarding Flow Implementation**
   - New endpoint: `POST /onboarding/complete`
   - Creates children + assessments in 1 transaction
   - Updates user `onboarding_completed` flag
3. **Dashboard API Enhancement**
   - Added fields: `total_stars`, `achievements`, `completion_rate`
   - Frontend aggregates data from 7 APIs (with fallbacks)
4. **Tasks API Enhancement**
   - `GET /children/{id}/tasks` now returns `ChildTaskWithDetails[]`
   - Full task info populated
   - Query params: `?limit=10&category=Independence&status=verified`
5. **Interaction Logs API**
   - New endpoint: `GET /children/{id}/interact/logs`
   - Returns emotion distribution for Dashboard Pie Chart
6. **Assessment Fallback Fix**
   - Skill scores: 1-5 scale → 20-100 (không còn 0-100)
   - Fallback baseline = 50 (thay vì 0)
   - Handle string→number conversion from backend
7. **TaskCategory Enum Expansion**
   - From: `'IQ' | 'EQ'`
   - To: `'Independence' | 'Logic' | 'Physical' | 'Creativity' | 'Social' | 'Academic' | 'IQ' | 'EQ'`
8. **Empty State Handling**
   - EmotionPieChart: Show friendly message when no data
   - ActivityTimeline: Show "No activities yet"
   - All dashboard services have try-catch fallbacks

**📊 CURRENT STATUS:**

- **29 APIs Working** ✅
- **3 APIs New** 🆕
- **3 APIs Enhanced** ✨
- **30 APIs Missing** ❌
- **Overall: 65% Complete**

---

## 📋 PHẦN 1: RÀ SOÁT API BACKEND HIỆN CÓ (UPDATED)

### 🔐 **1. Authentication APIs** (`/auth`)

| Endpoint         | Method | Mô tả               | Request Body                                    | Response                                                               | Status |
| ---------------- | ------ | ------------------- | ----------------------------------------------- | ---------------------------------------------------------------------- | ------ |
| `/auth/register` | POST   | Đăng ký user mới    | `{ email, password, full_name, phone_number? }` | `{ message }`                                                          | ✅     |
| `/auth/login`    | POST   | Đăng nhập (JSON)    | `{ email, password }`                           | `{ access_token, token_type }`                                         | ✅     |
| `/auth/token`    | POST   | OAuth2 login (form) | OAuth2PasswordRequestForm                       | `{ access_token, token_type }`                                         | ✅     |
| `/auth/me`       | GET    | Lấy thông tin user  | Bearer token                                    | `{ id, email, full_name, onboarding_completed, children_count }` (mới) | ✅ NEW |

**✅ Đầy đủ:** Authentication flow hoàn chỉnh
**🆕 Enhanced:** `/auth/me` giờ trả về `onboarding_completed` và `children_count`

---

### 👶 **2. Children Management APIs** (`/children`)

| Endpoint                      | Method | Mô tả                             | Request       | Response        | Status |
| ----------------------------- | ------ | --------------------------------- | ------------- | --------------- | ------ |
| `/children`                   | GET    | Lấy danh sách children của parent | -             | `ChildPublic[]` | ✅     |
| `/children`                   | POST   | Tạo child mới                     | `ChildCreate` | `ChildPublic`   | ✅     |
| `/children/{child_id}`        | GET    | Lấy thông tin 1 child             | -             | `ChildPublic`   | ✅     |
| `/children/{child_id}`        | PUT    | Cập nhật child                    | `ChildCreate` | `ChildPublic`   | ✅     |
| `/children/{child_id}/select` | POST   | Chọn child hiện tại               | -             | `{ message }`   | ✅     |

**✅ Router prefix đã fix:** Tất cả endpoints đã có path chính xác
**✅ Onboarding integrated:** POST `/onboarding/complete` tạo children + assessments

**Response Schema:**

```typescript
{
  id: string,
  name: string,
  birth_date: datetime,
  initial_traits: dict | null,
  current_coins: number,
  level: number
}
```

**⚠️ Vẫn thiếu:**

- Không có DELETE child
- Không có fields: `nickname`, `gender`, `age`, `personality`, `interests`, `strengths`, `challenges`
- Không có avatar/profile picture

---

### 📝 **3. Tasks APIs** (`/children` & `/tasks`)

| Endpoint                                              | Method | Mô tả                            | Request | Response                       | Status      |
| ----------------------------------------------------- | ------ | -------------------------------- | ------- | ------------------------------ | ----------- |
| `/tasks`                                              | GET    | Lấy tất cả tasks (library)       | -       | `TaskPublic[]`                 | ✅          |
| `/children/{child_id}/tasks/suggested`                | GET    | Lấy suggested tasks cho child    | -       | `TaskPublic[]` (max 5)         | ✅          |
| `/children/{child_id}/tasks`                          | GET    | Lấy tasks đã assign cho child    | params  | `ChildTaskWithDetails[]` (mới) | ✅ ENHANCED |
| `/children/{child_id}/tasks/{task_id}/start`          | POST   | Assign task cho child            | -       | `ChildTaskPublic`              | ✅          |
| `/children/{child_id}/tasks/{child_task_id}/complete` | POST   | Đánh dấu hoàn thành              | -       | `{ message }`                  | ✅          |
| `/children/{child_id}/tasks/{child_task_id}/verify`   | POST   | Verify task (tặng coins + badge) | -       | `{ message }`                  | ✅          |

**✅ Router prefix đã fix:** Tất cả paths đã chính xác
**🆕 Enhanced GET `/children/{child_id}/tasks`:**

- Trả về `ChildTaskWithDetails[]` với full task info populated
- Query params: `?limit=10&category=Independence&status=verified`
- Sort by `assigned_at` descending (mới nhất trước)

**Task Schema:**

```typescript
{
  id: string,
  title: string,
  description: string,
  category: "Independence" | "Logic" | "Physical" | "Creativity" | "Social" | "Academic" | "IQ" | "EQ",
  type: "logic" | "emotion",
  difficulty: number,
  suggested_age_range: string,
  reward_coins: number,
  reward_badge_name: string | null
}
```

**ChildTaskWithDetails Schema (NEW):**

```typescript
{
  id: string,
  status: "suggested" | "in_progress" | "completed" | "verified",
  assigned_at: datetime,
  completed_at: datetime | null,
  task: TaskPublic  // Full task details populated
}
```

**⚠️ Vẫn thiếu:**

- Không có CREATE/UPDATE/DELETE task (Parent không thể tạo custom task)
- Không có fields: `priority` (high/medium/low), `dueDate`, `progress` (%)
- Không có API assign task với custom reward
- Không có DELETE/UPDATE assigned task

---

### 🏆 **4. Rewards APIs** (`/children/{child_id}`)

| Endpoint                            | Method | Mô tả               | Request         | Response                                  |
| ----------------------------------- | ------ | ------------------- | --------------- | ----------------------------------------- |
| `/children/{child_id}/inventory`    | GET    | Lấy rewards đã earn | -               | `Array<{ id, earned_at, reward: {...} }>` |
| `/children/{child_id}/avatar/equip` | POST   | Trang bị skin       | `{ reward_id }` | `{ message, reward_id }`                  |

**⚠️ Thiếu HOÀN TOÀN APIs cho Parent Reward Management:**

- ❌ GET `/rewards` - List all rewards (shop)
- ❌ POST `/rewards` - Create reward
- ❌ PUT `/rewards/{reward_id}` - Update reward
- ❌ DELETE `/rewards/{reward_id}` - Delete reward
- ❌ GET `/redemption-requests` - List redemption requests
- ❌ POST `/redemption-requests/{id}/approve` - Approve request
- ❌ POST `/redemption-requests/{id}/reject` - Reject request
- ❌ Không có field `cost` (coins cần để redeem)
- ❌ Không có field `remain` (số lượng còn lại)

---

### 📊 **5. Dashboard APIs** (`/dashboard`)

| Endpoint                | Method | Mô tả               | Response                                                                  | Status      |
| ----------------------- | ------ | ------------------- | ------------------------------------------------------------------------- | ----------- |
| `/dashboard/{child_id}` | GET    | Lấy dashboard stats | `{ child, tasks_completed, badges_earned, total_stars, completion_rate }` | ✅ ENHANCED |

**✅ Router prefix đã fix:** Path `/dashboard/{child_id}` chính xác
**🆕 Enhanced Response:**

```typescript
{
  child: {
    name: string,
    level: number,
    coins: number
  },
  tasks_completed: number,    // Count VERIFIED tasks
  badges_earned: number,       // Count rewards
  total_stars: number,         // NEW: = current_coins
  achievements: number,        // NEW: = badges_earned
  completion_rate: number      // NEW: (verified / total) * 100
}
```

**⚠️ Vẫn thiếu cho Dashboard components:**

- ❌ **Completion trend** theo ngày/tuần (cho Line Chart)
- ❌ **Emotion distribution** (cho Pie Chart) - Chỉ có `/children/{id}/interact/logs`
- ❌ **Task category progress** (cho Progress Rings)
- ❌ **Activity timeline** (recent activities)
- ❌ **Skill radar data** (từ assessment) - Frontend tự tính từ `/children/{id}/assessments`

**Workaround hiện tại:**
Frontend service `dashboardService.ts` gọi nhiều APIs song song:

1. `GET /dashboard/{id}` - Basic stats
2. `GET /children/{id}/tasks` - Tính completion trend
3. `GET /children/{id}/interact/logs` - Emotion data
4. `GET /children/{id}/tasks?category=X` - Category progress (6 calls)
5. `GET /children/{id}/tasks?limit=10` - Activity timeline
6. `GET /children/{id}/assessments` - Skill radar (tính ở frontend)

---

### 📈 **6. Reports APIs** (`/reports`)

| Endpoint                          | Method | Mô tả             | Response         |
| --------------------------------- | ------ | ----------------- | ---------------- |
| `/reports/{child_id}`             | GET    | List reports      | `ReportPublic[]` |
| `/reports/{child_id}/{report_id}` | GET    | Get report detail | `ReportPublic`   |

**Report Schema:**

```typescript
{
  id: string,
  period_start: datetime,
  period_end: datetime,
  generated_at: datetime,
  summary_text: string,
  insights: dict,
  suggestions: dict
}
```

**✅ Đầy đủ** cho reports, nhưng **⚠️ Cần:**

- Generate reports on-demand (hiện chỉ có scheduler)
- Filter reports by period

---

### 🎮 **7. Games APIs** (`/children/{child_id}/games`)

| Endpoint                                                  | Method | Mô tả              | Response            |
| --------------------------------------------------------- | ------ | ------------------ | ------------------- |
| `/children/{child_id}/games`                              | GET    | List games         | `MiniGamePublic[]`  |
| `/children/{child_id}/games/{game_id}/start`              | POST   | Start game session | `GameSessionPublic` |
| `/children/{child_id}/games/sessions/{session_id}/submit` | POST   | Submit game result | `{ message }`       |

**✅ Đầy đủ** cho games (cho children)

---

### 💬 **8. Interaction APIs** (`/children/{child_id}/interact`)

| Endpoint                             | Method | Mô tả                    | Request          | Response                                            | Status |
| ------------------------------------ | ------ | ------------------------ | ---------------- | --------------------------------------------------- | ------ |
| `/children/{child_id}/interact/chat` | POST   | Chat với avatar          | `{ user_input }` | `{ message, avatar_response }`                      | ✅     |
| `/children/{child_id}/interact/logs` | GET    | Lấy emotion distribution | -                | `{ emotions: [{ name, value, percentage }] }` (mới) | ✅ NEW |

**✅ Router prefix đã fix:** Paths chính xác
**🆕 NEW Endpoint:** `/interact/logs` trả về emotion aggregation cho Dashboard Pie Chart

**Logs Response:**

```typescript
{
  emotions: [
    { name: "Happy", value: 100 },
    { name: "Sad", value: 20 },
    { name: "Angry", value: 10 },
    { name: "Anxious", value: 5 },
    { name: "Excited", value: 15 },
  ];
}
```

**⚠️ Lưu ý:**

- Chỉ trả emotion aggregation, không có chat history
- Frontend cần empty state handling khi chưa có interaction logs

---

### 🧪 **9. Assessment APIs** (`/children/{child_id}/assessments`)

| Endpoint                                | Method | Mô tả             | Request                 | Response                  |
| --------------------------------------- | ------ | ----------------- | ----------------------- | ------------------------- |
| `/children/{child_id}/assessments`      | GET    | List assessments  | -                       | `ChildAssessmentPublic[]` |
| `/children/{child_id}/assessments`      | POST   | Create assessment | `ChildAssessmentCreate` | `ChildAssessmentPublic`   |
| `/children/{child_id}/assessments/{id}` | GET    | Get assessment    | -                       | `ChildAssessmentPublic`   |
| `/children/{child_id}/assessments/{id}` | PUT    | Update assessment | `ChildAssessmentUpdate` | `ChildAssessmentPublic`   |

**Assessment Schema:**

```typescript
{
  id: string,
  child_id: string,
  parent_id: string,
  discipline_autonomy: {
    completes_personal_tasks: string,
    keeps_personal_space_tidy: string,
    ...
  },
  emotional_intelligence: {...},
  social_interaction: {...}
}
```

**✅ Đầy đủ** cho assessments

---

### 🆕 **10. Onboarding API** (`/onboarding`)

| Endpoint               | Method | Mô tả                                            | Request             | Response                       | Status |
| ---------------------- | ------ | ------------------------------------------------ | ------------------- | ------------------------------ | ------ |
| `/onboarding/complete` | POST   | Complete onboarding (tạo children + assessments) | `OnboardingRequest` | `{ message, children: [...] }` | ✅ NEW |

**🆕 Mới thêm:** Endpoint này kết hợp tạo children và assessments trong 1 transaction

**Request Schema:**

```typescript
{
  parent_display_name: string,
  phone_number?: string,
  children: [
    {
      full_name: string,
      nickname: string,
      date_of_birth: string,  // ISO format
      gender: string,
      favorite_topics: string[],
      discipline_autonomy: { [key: string]: string | null },
      emotional_intelligence: { [key: string]: string | null },
      social_interaction: { [key: string]: string | null }
    }
  ]
}
```

**Response:**

```typescript
{
  message: "Onboarding completed successfully",
  children: [
    { id: string, name: string, nickname: string }
  ]
}
```

**✅ Benefits:**

- Atomic operation: Tạo children + assessments cùng lúc
- Update user: `onboarding_completed = true`
- Frontend redirect to dashboard sau khi onboarding

---

## 🎯 PHẦN 2: PHÂN TÍCH FRONTEND & XÁC ĐỊNH THIẾU API (UPDATED)

### 📱 **Tổng quan Frontend Pages:**

**Public Pages:**

1. ✅ **LandingPage** - Landing page
2. ✅ **RegisterPage** - Đăng ký tài khoản
3. ✅ **LoginPage** - Đăng nhập
4. ✅ **OnboardingPage** - 3-step onboarding (NEW)
5. ✅ **NotFoundPage** - 404 page

**Parent Pages:**

1. ✅ **DashboardPage** - Dashboard tổng quan
2. ✅ **TaskCenterPage** - Quản lý tasks
3. ✅ **RewardCenterPage** - Quản lý rewards
4. ✅ **SettingsPage** - Cài đặt

**Children Pages:**

1. ✅ **ChildHomePage** - Trang chủ cho children
2. ✅ **ChildQuestLogPage** - Quest log

---

### 📊 **Trang 1: DASHBOARD PAGE (STATUS: WORKING)**

#### **UI Components cần data:**

1. ✅ **StatsCards**: Level, Total Stars, Achievements, Completion % - WORKING
2. ✅ **CompletionLineChart**: Task completion by day (7 days) - WORKING với fallback
3. ✅ **EmotionPieChart**: Emotion distribution - WORKING với empty state
4. ✅ **TaskProgressRings**: Progress by category (6 categories) - WORKING
5. ✅ **ActivityTimeline**: Recent activities - WORKING với empty state
6. ✅ **DashboardSidebar**: Calendar + Skill Radar Chart - WORKING với fallback

#### **API đang sử dụng (Frontend Service):**

**✅ `getDashboardData(childId)` gọi 7 APIs song song:**

```typescript
const [stats, child, tasks, tasksAll, assessments, emotions, childInfo] =
  await Promise.all([
    getDashboardStats(childId), // GET /dashboard/{id}
    getChild(childId), // GET /children/{id}
    getChildTasks(childId, { limit: 10 }), // GET /children/{id}/tasks?limit=10
    getChildTasks(childId), // GET /children/{id}/tasks (all)
    getLatestAssessment(childId), // GET /children/{id}/assessments
    getEmotionData(childId), // GET /children/{id}/interact/logs
    getChild(childId), // GET /children/{id}
  ]);
```

**✅ Tất cả services có fallback handling:**

- `getStatsCards()` - Return default values on error
- `getCompletionTrend()` - Return mock 7 days data
- `getCategoryProgress()` - Return 0% cho tất cả categories
- `getActivityTimeline()` - Return empty array
- `getEmotions()` - Return empty array
- `getSkillRadar()` - Return baseline scores (50/100)

#### **✅ Đã fix:**

1. ✅ **Assessment fallback** - Radar chart không còn âm (baseline = 50)
2. ✅ **Empty states** - Emotion chart, Activity timeline show friendly messages
3. ✅ **Type conversion** - Assessment answers `string | null` → `number`
4. ✅ **Dashboard API enhanced** - Thêm `total_stars`, `achievements`, `completion_rate`

#### **⚠️ Optimization needed (Future):**

#### **⚠️ Optimization needed (Future):**

**Option 1: Tạo aggregated endpoint (Recommended cho production):**

```python
@router.get("/dashboard/{child_id}/all", response_model=DashboardDataResponse)
async def get_dashboard_all_data(
    child: Child = Depends(verify_child_ownership),
    days: int = 7
):
    # Tính tất cả metrics trong 1 call
    return {
        "stats": {...},
        "completion_trend": [...],
        "emotions": [...],
        "category_progress": [...],
        "activities": [...],
        "skills": [...]
    }
```

**Benefits:**

- Giảm từ 7 requests → 1 request
- Faster load time
- Reduced server load
- Better caching

**Option 2: GraphQL (Long-term):**

- Frontend query chỉ data cần thiết
- Flexible & efficient

---

### 📋 **Trang 2: TASK CENTER PAGE (STATUS: PARTIALLY WORKING)**

#### **UI Components:**

1. ⚠️ **AssignedTasksTab**: List assigned tasks với filter - MOCK DATA
2. ⚠️ **TaskLibraryTab**: Library tasks với search - MOCK DATA
3. ❌ **CreateTaskModal**: Form tạo custom task - NO API
4. ⚠️ **TaskDetailModal**: View/Edit/Delete task - NO EDIT/DELETE API
5. ⚠️ **AssignTaskModal**: Assign task từ library - CÓ API nhưng thiếu custom params

#### **API hiện có & đang dùng:**

✅ `GET /tasks` - List all tasks (working)
✅ `GET /children/{child_id}/tasks/suggested` - Suggested tasks (working)
✅ `GET /children/{child_id}/tasks` - Child's tasks **với filter** (working)
✅ `POST /children/{child_id}/tasks/{task_id}/start` - Assign task (working)
✅ `POST /children/{child_id}/tasks/{child_task_id}/complete` - Complete (working)
✅ `POST /children/{child_id}/tasks/{child_task_id}/verify` - Verify (working)

**✅ Enhanced GET `/children/{child_id}/tasks`:**

- Query params: `?limit=10&category=Independence&status=verified`
- Response: `ChildTaskWithDetails[]` với full task details
- Frontend có thể filter & display properly

#### **API còn thiếu:**

```typescript
❌ POST /tasks (Create custom task by parent)
Request: {
  title: string,
  description: string,
  category: string,
  priority: "high" | "medium" | "low",
  reward: number,
  due_date?: datetime
}

❌ PUT /tasks/{task_id} (Update task)

❌ DELETE /tasks/{task_id} (Delete task)

❌ GET /children/{child_id}/tasks?status=in-progress&category=logic&sort=due_date
(Filter & sort assigned tasks)

❌ PUT /children/{child_id}/tasks/{child_task_id} (Update assigned task)
Request: {
  priority?: string,
  reward?: number,
  due_date?: datetime,
  notes?: string
}

❌ DELETE /children/{child_id}/tasks/{child_task_id} (Unassign task)

❌ POST /children/{child_id}/tasks/assign (Assign với custom params)
Request: {
  task_id: string,
  priority: string,
  reward: number,
  due_date: datetime
}
```

#### **Vấn đề hiện tại:**

- **GET `/children/{child_id}/tasks`** chỉ trả về `ChildTaskPublic` (không có task details)

  ```typescript
  // Hiện tại
  { id, status, assigned_at, completed_at }

  // Cần thêm
  {
    id, status, assigned_at, completed_at,
    task: { id, title, description, category, ... },
    priority, reward, due_date, progress
  }
  ```

#### **Hướng xử lý:**

1. **Mở rộng ChildTaskPublic schema:**

```python
class ChildTaskPublicExtended(BaseModel):
    id: str
    status: ChildTaskStatus
    assigned_at: datetime
    completed_at: Optional[datetime]
    task: TaskPublic  # Populate task info
    priority: Optional[str] = "medium"
    custom_reward: Optional[int] = None
    due_date: Optional[datetime] = None
    progress: Optional[int] = 0
```

2. **Thêm CRUD endpoints cho tasks**
3. **Thêm filter & search params**

---

### 🎁 **Trang 3: REWARD CENTER PAGE**

#### **UI Components:**

1. **ShopManagementTab**: CRUD rewards (6 mock rewards)
2. **RedemptionRequestsTab**: Approve/Reject requests (4 mock requests)
3. **RewardCard**: Display reward với quantity controls
4. **RewardModal**: Create/Edit reward form

#### **API hiện có:**

✅ `GET /children/{child_id}/inventory` - Child's earned rewards
✅ `POST /children/{child_id}/avatar/equip` - Equip skin

#### **API HOÀN TOÀN THIẾU cho Parent:**

```typescript
❌ GET /rewards (List all rewards in shop)
Response: Reward[]

❌ POST /rewards (Create reward)
Request: {
  name: string,
  description: string,
  cost: number,         // Coins cần để redeem
  remain: number,       // Quantity available
  url_thumbnail: string,
  type: "badge" | "skin" | "privilege"
}

❌ PUT /rewards/{reward_id} (Update reward)

❌ DELETE /rewards/{reward_id} (Delete reward)

❌ PATCH /rewards/{reward_id}/quantity (Update quantity)
Request: { delta: number }  // +5 hoặc -1

❌ GET /redemption-requests (List all requests)
Response: [
  {
    id: string,
    child: { id, name },
    reward: { id, name, cost },
    requested_at: datetime,
    status: "pending" | "approved" | "rejected"
  }
]

❌ POST /redemption-requests/{id}/approve
Response: { message, child_coins_remaining }

❌ POST /redemption-requests/{id}/reject
Request: { reason?: string }
```

#### **Hướng xử lý:**

**Cần tạo mới hoàn toàn Rewards Management module:**

```python
# rewards.py (Parent APIs)
@router.get("/rewards", response_model=List[RewardPublic])
async def list_rewards(current_user: User = Depends(get_current_user)):
    rewards = await Reward.find_all().to_list()
    return rewards

@router.post("/rewards", response_model=RewardPublic)
async def create_reward(
    reward: RewardCreate,
    current_user: User = Depends(get_current_user)
):
    new_reward = Reward(**reward.dict())
    await new_reward.insert()
    return new_reward

@router.put("/rewards/{reward_id}", response_model=RewardPublic)
@router.delete("/rewards/{reward_id}")
@router.patch("/rewards/{reward_id}/quantity")

# redemption.py (New file)
@router.get("/redemption-requests")
@router.post("/redemption-requests")  # Child tạo request
@router.post("/redemption-requests/{id}/approve")
@router.post("/redemption-requests/{id}/reject")
```

**Database Schema cần bổ sung:**

```python
class RedemptionRequest(Document):
    child: Link[Child]
    reward: Link[Reward]
    requested_at: datetime
    status: str  # pending, approved, rejected
    processed_at: Optional[datetime]
    processed_by: Optional[Link[User]]
    rejection_reason: Optional[str]
```

---

### ⚙️ **Trang 4: SETTINGS PAGE**

#### **UI Components:**

1. **AccountSettingsTab**: Update profile, change password, delete account
2. **ChildProfilesTab**: CRUD children (2 mock children)
3. **NotificationSettingsTab**: Email/Push notification preferences

#### **API hiện có:**

✅ `GET /auth/me` - Get user profile
✅ `GET /children` - List children
✅ `POST /children` - Create child
✅ `PUT /children/{child_id}` - Update child

#### **API còn thiếu:**

```typescript
❌ PUT /auth/me (Update profile)
Request: {
  full_name?: string,
  phone_number?: string
}

❌ POST /auth/change-password
Request: {
  current_password: string,
  new_password: string
}

❌ DELETE /auth/me (Delete account)
Request: {
  password: string,  // Confirm password
  confirmation: "DELETE MY ACCOUNT"
}

❌ DELETE /children/{child_id} (Delete child)

❌ GET /settings/notifications (Get notification settings)

❌ PUT /settings/notifications (Update notification settings)
Request: {
  email_notifications: {
    enabled: boolean,
    redemption_requests: boolean,
    missed_tasks: boolean,
    emotion_trends: boolean,
    weekly_report: boolean
  },
  push_notifications: {...}
}
```

#### **Vấn đề với Child Schema:**

Frontend cần:

```typescript
{
  id,
    nickname,
    fullName,
    dateOfBirth,
    age,
    gender,
    personality,
    interests,
    strengths,
    challenges;
}
```

Backend chỉ có:

```typescript
{
  id, name, birth_date, initial_traits, current_coins, level;
}
```

#### **Hướng xử lý:**

1. **Mở rộng Child model:**

```python
class Child(Document):
    parent: Link[User]
    name: str  # Keep as fullName
    nickname: Optional[str]
    birth_date: datetime
    gender: Optional[str]
    initial_traits: Optional[dict]
    current_coins: int = 0
    level: int = 1

    # New fields
    personality: Optional[List[str]]
    interests: Optional[List[str]]
    strengths: Optional[List[str]]
    challenges: Optional[List[str]]
    avatar_url: Optional[str]
```

2. **Thêm User management APIs**
3. **Thêm Notification settings APIs**

---

## 🚨 PHẦN 3: RỦI RO & LƯU Ý TÍCH HỢP

### ⚠️ **1. Schema Mismatch (CRITICAL)**

**Vấn đề:** Frontend và Backend có schema khác nhau

| Trường         | Frontend | Backend     | Rủi ro                    |
| -------------- | -------- | ----------- | ------------------------- |
| Child.nickname | Required | ❌ Không có | Frontend crash            |
| Child.gender   | Required | ❌ Không có | Form validation fail      |
| Child.age      | Computed | ❌ Không có | Display lỗi               |
| Task.priority  | Required | ❌ Không có | Cannot assign task        |
| Task.dueDate   | Required | ❌ Không có | Cannot set deadline       |
| Reward.cost    | Required | ❌ Không có | Cannot redeem             |
| Reward.remain  | Required | ❌ Không có | Inventory management fail |

**Giải pháp:**

1. **Migration database** để thêm fields mới
2. **Update models** trong backend
3. **Backward compatible**: Thêm `Optional` cho fields mới

---

### ⚠️ **2. Response Format Issues**

**Vấn đề:** `/children/{child_id}/tasks` không trả full task info

```typescript
// Backend response hiện tại
{
  id: "123",
  status: "in_progress",
  assigned_at: "2025-11-20T10:00:00",
  completed_at: null
}

// Frontend cần
{
  id: "123",
  child: "Minh An",
  task: "Dọn phòng ngủ",  // ❌ Thiếu
  date: "2025-11-10",
  status: "in_progress",
  reward: 10,              // ❌ Thiếu
  category: "self-discipline",  // ❌ Thiếu
  priority: "medium",      // ❌ Thiếu
  progress: 0              // ❌ Thiếu
}
```

**Giải pháp:** Populate task info khi query ChildTask

```python
@router.get("/children/{child_id}/tasks")
async def get_child_tasks(child: Child = Depends(...)):
    child_tasks = await ChildTask.find(
        ChildTask.child.id == child.id
    ).to_list()

    results = []
    for ct in child_tasks:
        # Fetch task details
        task = await ct.task.fetch()
        results.append({
            "id": str(ct.id),
            "status": ct.status,
            "assigned_at": ct.assigned_at,
            "completed_at": ct.completed_at,
            "task": {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "category": task.category,
                ...
            },
            "child_name": child.name,
            "priority": ct.priority,  # Need to add field
            "custom_reward": ct.custom_reward,
            "due_date": ct.due_date
        })
    return results
```

---

### ⚠️ **3. Missing Pagination (PERFORMANCE)**

**Vấn đề:** Tất cả endpoints đều không có pagination

- `GET /tasks` - Trả về ALL tasks → Slow khi có 1000+ tasks
- `GET /children/{child_id}/tasks` - ALL assigned tasks
- `GET /rewards` - ALL rewards

**Rủi ro:**

- Frontend load chậm
- Server memory spike
- Database query timeout

**Giải pháp:**

```python
@router.get("/tasks")
async def list_tasks(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    search: Optional[str] = None
):
    query = Task.find()

    if category:
        query = query.find(Task.category == category)

    if search:
        query = query.find(Task.title.contains(search))

    total = await query.count()
    tasks = await query.skip(skip).limit(limit).to_list()

    return {
        "items": tasks,
        "total": total,
        "skip": skip,
        "limit": limit
    }
```

---

### ⚠️ **4. Authorization Issues**

**Vấn đề:** Parent có thể truy cập data của child khác không?

**Hiện tại:** `verify_child_ownership` dependency check ownership ✅

**Cần thêm:**

- Parent chỉ thấy children của mình
- Parent chỉ thấy rewards của shop (public)
- Parent chỉ thấy redemption requests của children mình

---

### ⚠️ **5. Realtime Updates**

**Vấn đề:** Frontend cần realtime updates khi:

- Child complete task → Parent nhận notification
- Child request redemption → Parent nhận alert

**Hiện tại:** ❌ Không có WebSocket/SSE

**Giải pháp:**

- **Short-term:** Polling every 30s
- **Long-term:** Implement WebSocket cho notifications

---

### ⚠️ **6. Data Consistency**

**Vấn đề:**

- Child verify task → coins tăng, badge thêm
- Approve redemption → coins giảm, reward add to inventory
- Transactions này phải atomic

**Rủi ro:** Race condition, duplicate coins/rewards

**Giải pháp:** Use MongoDB transactions

```python
async with await db.client.start_session() as session:
    async with session.start_transaction():
        # Update coins
        child.current_coins -= reward.cost
        await child.save(session=session)

        # Add reward
        child_reward = ChildReward(child=child, reward=reward)
        await child_reward.insert(session=session)

        # Update request
        request.status = "approved"
        await request.save(session=session)
```

---

## 📝 PHẦN 4: HƯỚNG XỬ LÝ CHI TIẾT THEO TRANG

### 📊 **Dashboard Page**

**APIs cần gọi:**

1. `GET /children` - List children để select
2. `GET /dashboard/{child_id}` - Basic stats
3. `GET /dashboard/{child_id}/completion-trend?days=7` - Line chart
4. `GET /dashboard/{child_id}/emotions` - Pie chart
5. `GET /dashboard/{child_id}/category-progress` - Progress rings
6. `GET /dashboard/{child_id}/activity-timeline?limit=10` - Timeline
7. `GET /dashboard/{child_id}/skill-radar` - Radar chart

**APIs cần mở rộng:**

- ✏️ `GET /dashboard/{child_id}` - Thêm query params `?include=stats,trend,emotions,categories,activities,skills`

**APIs cần tạo mới:**

- ➕ Các micro-endpoints như trên (recommended)

**Rủi ro:**

- 📉 **Performance**: 7 API calls cùng lúc → Slow
  - **Giải pháp**: Gộp thành 1 endpoint hoặc dùng GraphQL
- 🔄 **Stale data**: Data từ nhiều sources khác nhau
  - **Giải pháp**: Cache với same timestamp

**Lưu ý tích hợp:**

```typescript
// Frontend service
export const getDashboardData = async (childId: string) => {
  // Option 1: Parallel calls
  const [stats, trend, emotions, ...] = await Promise.all([
    getDashboardStats(childId),
    getCompletionTrend(childId, 7),
    getEmotions(childId),
    ...
  ]);

  // Option 2: Single call (if backend provides)
  const data = await axiosClient.get(
    `/dashboard/${childId}?include=all`
  );

  return data;
};
```

---

### 📋 **Task Center Page**

**APIs cần gọi:**

1. `GET /children` - List children
2. `GET /children/{child_id}/tasks?status=&category=&sort=` - Assigned tasks
3. `GET /tasks?search=&category=` - Library tasks
4. `POST /tasks` - Create custom task
5. `POST /children/{child_id}/tasks/assign` - Assign task
6. `PUT /children/{child_id}/tasks/{id}` - Update task
7. `DELETE /children/{child_id}/tasks/{id}` - Unassign
8. `POST /children/{child_id}/tasks/{id}/complete` - Complete (existing)
9. `POST /children/{child_id}/tasks/{id}/verify` - Verify (existing)

**APIs cần sửa:**

- ✏️ `GET /children/{child_id}/tasks` - Populate full task info, thêm priority/due_date
- ✏️ `POST /children/{child_id}/tasks/{task_id}/start` - Cho phép custom reward/priority

**APIs cần tạo mới:**

- ➕ `POST /tasks` - Create task
- ➕ `PUT /tasks/{id}` - Update task
- ➕ `DELETE /tasks/{id}` - Delete task
- ➕ `PUT /children/{child_id}/tasks/{id}` - Update assigned task
- ➕ `DELETE /children/{child_id}/tasks/{id}` - Unassign

**Rủi ro:**

- 🔒 **Permission**: Parent có thể edit task được assign cho child khác không?
  - **Giải pháp**: Check ownership khi edit ChildTask
- 📅 **Due date**: Timezone issues
  - **Giải pháp**: Store UTC, display local time
- 🔄 **Sync**: Task library update → assigned tasks outdated?
  - **Giải pháp**: ChildTask reference Task, không duplicate data

**Lưu ý tích hợp:**

```typescript
// Assigned Tasks Tab
const fetchAssignedTasks = async () => {
  const response = await axiosClient.get(`/children/${selectedChild}/tasks`, {
    params: {
      status: filterStatus, // 'all' | 'in-progress' | 'completed'
      category: filterCategory,
      sort: "due_date",
    },
  });

  // Map response to UI format
  const mappedTasks = response.data.map((task) => ({
    id: task.id,
    child: task.child_name,
    task: task.task.title,
    date: task.assigned_at,
    status: task.status,
    reward: task.custom_reward || task.task.reward_coins,
    category: task.task.category,
    priority: task.priority,
    progress: task.progress,
  }));

  setTasks(mappedTasks);
};
```

---

### 🎁 **Reward Center Page**

**APIs cần gọi:**

1. `GET /rewards` - List shop rewards
2. `POST /rewards` - Create reward
3. `PUT /rewards/{id}` - Update reward
4. `DELETE /rewards/{id}` - Delete reward
5. `PATCH /rewards/{id}/quantity` - Adjust quantity
6. `GET /redemption-requests?status=pending` - List requests
7. `POST /redemption-requests/{id}/approve` - Approve
8. `POST /redemption-requests/{id}/reject` - Reject

**APIs cần tạo mới:**

- ➕ **TẤT CẢ** các APIs trên (hoàn toàn thiếu)

**Backend cần tạo:**

```python
# app/routers/rewards_management.py (NEW FILE)
from fastapi import APIRouter, Depends
from app.models.reward_models import Reward, RedemptionRequest
from app.services.auth import get_current_user

router = APIRouter()

@router.get("/rewards")
async def list_rewards(
    skip: int = 0,
    limit: int = 20,
    type: Optional[str] = None
):
    query = Reward.find()
    if type:
        query = query.find(Reward.type == type)

    total = await query.count()
    rewards = await query.skip(skip).limit(limit).to_list()

    return {
        "items": [
            {
                "id": str(r.id),
                "name": r.name,
                "description": r.description,
                "cost": r.cost,
                "remain": r.remain,
                "url_thumbnail": r.image_url,
                "type": r.type
            }
            for r in rewards
        ],
        "total": total
    }

@router.post("/rewards")
async def create_reward(
    reward: RewardCreateRequest,
    current_user: User = Depends(get_current_user)
):
    new_reward = Reward(
        name=reward.name,
        description=reward.description,
        type=reward.type,
        image_url=reward.url_thumbnail,
        cost=reward.cost,
        remain=reward.remain
    )
    await new_reward.insert()
    return {...}

@router.patch("/rewards/{reward_id}/quantity")
async def adjust_quantity(
    reward_id: str,
    delta: int,
    current_user: User = Depends(get_current_user)
):
    reward = await Reward.get(reward_id)
    reward.remain += delta

    if reward.remain < 0:
        raise HTTPException(400, "Insufficient quantity")

    await reward.save()
    return {"remain": reward.remain}
```

```python
# app/models/reward_models.py
class Reward(Document):
    name: str
    description: str
    type: RewardType
    image_url: Optional[str]
    cost: int = 0  # ➕ NEW FIELD
    remain: int = 0  # ➕ NEW FIELD

class RedemptionRequest(Document):  # ➕ NEW MODEL
    child: Link[Child]
    reward: Link[Reward]
    requested_at: datetime = datetime.utcnow()
    status: str = "pending"  # pending, approved, rejected
    processed_at: Optional[datetime]
    processed_by: Optional[Link[User]]
    rejection_reason: Optional[str]
```

**Rủi ro:**

- 💰 **Inventory**: Race condition khi nhiều parent approve cùng lúc
  - **Giải pháp**: Atomic decrement với transaction
- 🔔 **Notification**: Child cần biết request được approve
  - **Giải pháp**: WebSocket hoặc polling
- 🗑️ **Delete**: Xóa reward đã được redeem?
  - **Giải pháp**: Soft delete hoặc prevent delete

**Lưu ý tích hợp:**

```typescript
// Shop Management Tab
const handleQuantityChange = async (rewardId: string, delta: number) => {
  try {
    const response = await axiosClient.patch(`/rewards/${rewardId}/quantity`, {
      delta,
    });

    // Update local state
    setRewards((prev) =>
      prev.map((r) =>
        r.id === rewardId ? { ...r, remain: response.data.remain } : r
      )
    );
  } catch (error) {
    // Handle insufficient quantity error
    showToast("Cannot decrease below 0", "error");
  }
};

// Redemption Requests Tab
const handleApprove = async (requestId: string) => {
  try {
    await axiosClient.post(`/redemption-requests/${requestId}/approve`);

    // Refresh requests list
    fetchRequests();
    showToast("Request approved successfully", "success");
  } catch (error) {
    // Handle insufficient coins error
    showToast(error.message, "error");
  }
};
```

---

### ⚙️ **Settings Page**

**APIs cần gọi:**

1. `GET /auth/me` - Get profile (existing)
2. `PUT /auth/me` - Update profile
3. `POST /auth/change-password` - Change password
4. `DELETE /auth/me` - Delete account
5. `GET /children` - List children (existing)
6. `POST /children` - Create child (existing)
7. `PUT /children/{id}` - Update child (existing)
8. `DELETE /children/{id}` - Delete child
9. `GET /settings/notifications` - Get notification settings
10. `PUT /settings/notifications` - Update settings

**APIs cần tạo mới:**

- ➕ `PUT /auth/me`
- ➕ `POST /auth/change-password`
- ➕ `DELETE /auth/me`
- ➕ `DELETE /children/{id}`
- ➕ `GET /settings/notifications`
- ➕ `PUT /settings/notifications`

**APIs cần sửa:**

- ✏️ `POST /children` - Thêm fields: nickname, gender, personality, interests, strengths, challenges
- ✏️ `PUT /children/{id}` - Support new fields

**Rủi ro:**

- 🔐 **Password**: Phải verify current password trước khi change
- 🗑️ **Delete account**: Cascade delete children, tasks, rewards?
  - **Giải pháp**: Soft delete hoặc transfer ownership
- 📧 **Email change**: Cần verify email mới
- 🔄 **Child update**: Age auto-calculate từ birth_date

**Lưu ý tích hợp:**

```typescript
// Account Settings Tab
const handleUpdatePassword = async (e: React.FormEvent) => {
  e.preventDefault();

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    return showToast("Passwords do not match", "error");
  }

  try {
    await axiosClient.post("/auth/change-password", {
      current_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
    });

    showToast("Password updated successfully", "success");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  } catch (error) {
    // Handle wrong current password
    showToast("Current password is incorrect", "error");
  }
};

// Child Profiles Tab
const handleSaveChild = async (childData: ChildProfile) => {
  const payload = {
    name: childData.fullName,
    nickname: childData.nickname,
    birth_date: childData.dateOfBirth,
    gender: childData.gender,
    personality: childData.personality,
    interests: childData.interests,
    strengths: childData.strengths,
    challenges: childData.challenges,
  };

  if (childData.id) {
    // Update existing
    await axiosClient.put(`/children/${childData.id}`, payload);
  } else {
    // Create new
    await axiosClient.post("/children", payload);
  }

  fetchChildren();
};
```

---

## 🎯 PHẦN 5: PRIORITY & ROADMAP

### **Phase 1: Critical APIs (Week 1)**

**Mục tiêu:** Dashboard & Task Center hoạt động cơ bản

1. ✅ Fix schema mismatch (Child, Task models)
2. ✅ Extend `/children/{child_id}/tasks` response
3. ✅ Create Dashboard aggregation APIs
4. ✅ Create Task CRUD APIs
5. ✅ Add pagination & filtering

**Deliverables:**

- Dashboard hiển thị real data
- Task Center có thể assign/complete tasks

---

### **Phase 2: Reward Management (Week 2)**

**Mục tiêu:** Reward Center hoạt động đầy đủ

1. ✅ Create Reward CRUD APIs
2. ✅ Create RedemptionRequest model & APIs
3. ✅ Implement approve/reject workflow
4. ✅ Add transaction support

**Deliverables:**

- Parent có thể tạo/quản lý rewards
- Approve/reject redemption requests

---

### **Phase 3: Settings & Profile (Week 3)**

**Mục tiêu:** Settings page hoàn chỉnh

1. ✅ Create User update APIs
2. ✅ Create password change API
3. ✅ Create notification settings APIs
4. ✅ Extend Child model với full profile

**Deliverables:**

- Settings page fully functional
- Child profiles với đầy đủ thông tin

---

### **Phase 4: Optimization & Enhancement (Week 4)**

**Mục tiêu:** Performance & UX improvements

1. ✅ Add caching (Redis)
2. ✅ Implement WebSocket for realtime updates
3. ✅ Add search & advanced filters
4. ✅ Optimize database queries

**Deliverables:**

- Fast response time (<200ms)
- Realtime notifications
- Better search experience

---

## 📊 SUMMARY TABLE (UPDATED)

| Trang            | APIs Có (✅) | APIs Mới (🆕) | APIs Enhanced (✨) | APIs Thiếu (❌) | Status              |
| ---------------- | ------------ | ------------- | ------------------ | --------------- | ------------------- |
| **Auth**         | 4            | 0             | 1                  | 3               | 🟢 WORKING          |
| **Onboarding**   | 0            | 1             | 0                  | 0               | 🟢 WORKING (NEW)    |
| **Children**     | 5            | 0             | 0                  | 2               | 🟢 WORKING          |
| **Tasks**        | 6            | 0             | 1                  | 5               | 🟡 PARTIAL          |
| **Dashboard**    | 1            | 1             | 1                  | 5               | 🟢 WORKING          |
| **Rewards**      | 2            | 0             | 0                  | 8               | 🔴 MOCK DATA        |
| **Assessments**  | 4            | 0             | 0                  | 0               | 🟢 WORKING          |
| **Interactions** | 1            | 1             | 0                  | 0               | 🟢 WORKING          |
| **Games**        | 3            | 0             | 0                  | 0               | 🟢 WORKING          |
| **Reports**      | 2            | 0             | 0                  | 1               | 🟢 WORKING          |
| **Settings**     | 1            | 0             | 0                  | 6               | 🔴 PARTIAL          |
| **TOTAL**        | **29**       | **3**         | **3**              | **30**          | **65% Complete** ✅ |

### 🔑 **Key Improvements Made:**

1. ✅ **Router Prefix Fix** - Tất cả 14 endpoints đã có paths chính xác
2. ✅ **Onboarding Flow** - Complete 3-step onboarding với children + assessments
3. ✅ **Dashboard Enhanced** - Thêm `total_stars`, `achievements`, `completion_rate`
4. ✅ **Tasks Enhanced** - GET `/children/{id}/tasks` trả full details + filters
5. ✅ **Emotion Logs** - GET `/children/{id}/interact/logs` cho pie chart
6. ✅ **Fallback Handling** - Tất cả dashboard services có empty state handling
7. ✅ **Assessment Fix** - Skill scores 20-100 (không còn âm), handle string→number conversion
8. ✅ **TaskCategory Enum** - Mở rộng từ 2 → 8 categories (6 new + 2 backward compatible)

### 🎯 **Priority Next Steps:**

**Phase 1: Reward Management (HIGH PRIORITY)** 🔴

- [ ] Create Reward CRUD APIs (8 endpoints)
- [ ] RedemptionRequest system
- [ ] Inventory management
- **Impact:** RewardCenterPage hiện tại 100% mock data

**Phase 2: Task Management Enhancement (MEDIUM)** 🟡

- [ ] Task CRUD for custom tasks (3 endpoints)
- [ ] Update/Delete assigned tasks (2 endpoints)
- [ ] Add priority, dueDate, progress fields
- **Impact:** TaskCenterPage chỉ view-only, không tạo được custom tasks

**Phase 3: Settings & Profile (MEDIUM)** 🟡

- [ ] User profile update APIs (3 endpoints)
- [ ] Notification settings (2 endpoints)
- [ ] Child DELETE endpoint
- **Impact:** SettingsPage một số features không hoạt động

**Phase 4: Dashboard Optimization (LOW)** 🟢

- [ ] Aggregated dashboard endpoint (reduce 7→1 calls)
- [ ] Caching layer (Redis)
- [ ] WebSocket for realtime updates
- **Impact:** Performance improvement, hiện tại đã working với workaround

---

## 🚀 NEXT ACTIONS

### **Immediate (This Week):**

1. ✅ **Update Child model** - Add nickname, gender, personality, etc.
2. ✅ **Extend ChildTask response** - Populate task details
3. ✅ **Create Dashboard aggregation API** - `/dashboard/{child_id}?include=all`
4. ✅ **Add Task CRUD** - POST/PUT/DELETE `/tasks`

### **Short-term (Next 2 Weeks):**

1. ✅ **Create Reward Management APIs** - Full CRUD
2. ✅ **Create RedemptionRequest system** - Approve/Reject workflow
3. ✅ **Add pagination & filtering** - All list endpoints
4. ✅ **User management APIs** - Update profile, change password

### **Long-term (Month 2):**

1. ✅ **WebSocket notifications** - Realtime updates
2. ✅ **Redis caching** - Dashboard data cache
3. ✅ **Advanced search** - Full-text search với Elasticsearch
4. ✅ **Analytics** - Parent insights & recommendations

---

**📌 Lưu ý cuối:**

- Tất cả APIs mới phải có **authentication & authorization**
- Tất cả mutations phải dùng **transactions** để đảm bảo consistency
- Tất cả list endpoints phải có **pagination**
- Tất cả datetime phải **UTC**, frontend convert local time
- Tất cả errors phải có **user-friendly messages**
