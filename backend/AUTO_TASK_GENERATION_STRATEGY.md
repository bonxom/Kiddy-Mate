# Chiến Lược Tự Động Generate Task Cho Child

## 📋 Tổng Quan

Hệ thống sẽ tự động generate task mới cho mỗi child dựa trên **hybrid approach** kết hợp:

1. **Time-based trigger**: Gen vào đầu ngày (8:00 AM mỗi ngày)
2. **Threshold-based check**: Chỉ gen khi số task active < threshold
3. **Rate limiting**: Tối đa 1 lần gen/ngày/child

## 🎯 Định Nghĩa "Active Tasks"

**Active tasks** = Tasks có status:

- `ASSIGNED` - Đã assign, chờ làm
- `IN_PROGRESS` - Đang làm
- `NEED_VERIFY` - Cần verify
- `UNASSIGNED` - Đã gen nhưng chưa assign (từ auto-generation)

**Inactive tasks** = Tasks có status:

- `COMPLETED` - Đã hoàn thành
- `GIVEUP` - Đã bỏ cuộc
- `MISSED` - Đã bỏ lỡ

## ⚙️ Logic Generate Task

### Điều Kiện Generate:

1. **Time Trigger**:

   - Chạy vào **8:00 AM mỗi ngày** (có thể config)
   - Sử dụng APScheduler với CronTrigger

2. **Threshold Check**:

   - Chỉ gen khi: `active_tasks_count < MIN_ACTIVE_TASKS`
   - `MIN_ACTIVE_TASKS = 3` (có thể config theo age/level)

3. **Rate Limiting**:

   - Tối đa **1 lần gen/ngày/child**
   - Track bằng field `last_auto_generated_at` trong Child model

4. **Số Lượng Task Gen**:
   - Gen **1 task** mỗi lần (để tránh quá tải)
   - Nếu active tasks = 0 → gen 2-3 tasks để có buffer

### Flow Chi Tiết:

```
Mỗi ngày 8:00 AM:
  For each child:
    1. Check: last_auto_generated_at < today
       → Nếu đã gen hôm nay → Skip

    2. Count active tasks:
       active_count = count(ASSIGNED, IN_PROGRESS, NEED_VERIFY, UNASSIGNED)

    3. Check threshold:
       If active_count < MIN_ACTIVE_TASKS (3):
         → Generate 1 task (hoặc 2-3 nếu active_count = 0)
         → Update last_auto_generated_at = now
         → Status = UNASSIGNED (parent có thể review trước khi assign)
       Else:
         → Skip (đã đủ task)
```

## 📊 Cấu Hình

### Default Values:

```python
MIN_ACTIVE_TASKS = 3  # Số task tối thiểu cần có
MAX_ACTIVE_TASKS = 10  # Số task tối đa (không gen nếu vượt)
GENERATION_TIME = "08:00"  # Giờ gen task (8:00 AM)
TASKS_PER_GENERATION = 1  # Số task gen mỗi lần
```

### Theo Age/Level:

```python
# Trẻ nhỏ (6-8 tuổi): Ít task hơn
if age < 9:
    MIN_ACTIVE_TASKS = 2
    TASKS_PER_GENERATION = 1

# Trẻ lớn (9-12 tuổi): Nhiều task hơn
elif age < 13:
    MIN_ACTIVE_TASKS = 3
    TASKS_PER_GENERATION = 1

# Trẻ lớn hơn (13+): Nhiều task nhất
else:
    MIN_ACTIVE_TASKS = 4
    TASKS_PER_GENERATION = 1
```

## 🔄 Edge Cases

### 1. Child mới tạo (chưa có task):

- Gen ngay 2-3 tasks để có buffer
- Không cần đợi đến 8:00 AM

### 2. Child hoàn thành task nhanh:

- Nếu active tasks < MIN_ACTIVE_TASKS và chưa gen hôm nay
- Có thể gen thêm (nhưng vẫn giới hạn 1 lần/ngày)

### 3. Child không hoàn thành task:

- Không gen thêm nếu active tasks >= MIN_ACTIVE_TASKS
- Tránh tích lũy quá nhiều task

### 4. Parent manually assign task:

- Không ảnh hưởng đến auto-generation
- Chỉ tính vào active tasks count

## 📝 Implementation Plan

### 1. Thêm field vào Child model:

```python
last_auto_generated_at: Optional[datetime] = None
```

### 2. Tạo function generate_auto_tasks():

```python
async def generate_auto_tasks_for_all_children():
    """
    Generate tasks for all children that meet criteria.
    Called by scheduler at 8:00 AM daily.
    """
    # Get all children
    # For each child:
    #   - Check last_auto_generated_at
    #   - Count active tasks
    #   - Generate if needed
```

### 3. Thêm vào scheduler:

```python
scheduler.add_job(
    generate_auto_tasks_for_all_children,
    trigger=CronTrigger(hour=8, minute=0),  # 8:00 AM daily
    id="auto_generate_tasks_job",
    replace_existing=True
)
```

### 4. Optional: Manual trigger endpoint:

```python
@router.post("/children/{child_id}/generate/auto")
async def manual_trigger_auto_generate(
    child_id: str,
    child: Child = Depends(verify_child_ownership)
):
    """
    Manually trigger auto-generation for a child.
    Useful for testing or immediate generation.
    """
```

## ✅ Lợi Ích

1. **Predictable**: Gen vào giờ cố định, dễ quản lý
2. **Flexible**: Điều chỉnh theo số lượng task hiện tại
3. **Efficient**: Không gen quá nhiều, tránh lãng phí
4. **User-friendly**: Parent có thể review task trước khi assign (status = UNASSIGNED)
5. **Scalable**: Dễ mở rộng với nhiều rules khác

## 🎨 UX Flow

1. **8:00 AM**: Hệ thống tự động gen task
2. **Parent mở app**: Thấy notification "X tasks mới được đề xuất"
3. **Parent review**: Xem task trong "Unassigned Tasks" tab
4. **Parent assign**: Chọn task và assign cho child
5. **Child nhận task**: Bắt đầu làm task

## 📈 Metrics để Monitor

- Số task được gen mỗi ngày
- Số task được assign (tỷ lệ sử dụng)
- Thời gian trung bình từ gen → assign
- Số task bị bỏ qua (không assign)
