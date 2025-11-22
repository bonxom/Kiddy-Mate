# Chiến Lược Tối Ưu Generate Task Theo Category

## 🎯 Mục Tiêu

- **Mỗi ngày gen 1 lần** (8:00 AM)
- **Gen 2 tasks cho mỗi category** nhưng **ưu tiên categories cần cải thiện**
- **Tối ưu input** dựa trên `initial_traits` và task history của từng child

## 📊 Mapping Traits → Categories

### Trait to Category Mapping:

```python
TRAIT_TO_CATEGORY_MAP = {
    "independence": "Independence",
    "discipline": "Independence",  # Discipline cũng thuộc Independence
    "emotional": "Social",  # Emotional intelligence → Social
    "social": "Social",
    "logic": "Logic"
}

# Categories không có trong traits (cần gen đều):
# - Physical
# - Creativity
# - Academic
```

### Category Priority Calculation:

```python
def calculate_category_priority(child: Child) -> Dict[str, float]:
    """
    Tính priority cho mỗi category dựa trên:
    1. Trait scores (từ initial_traits)
    2. Task completion history
    3. Giveup tasks history

    Returns: Dict[category, priority_score]
    Priority score: 0-100, càng thấp càng cần cải thiện
    """
    priorities = {}

    # 1. Tính từ initial_traits
    if child.initial_traits and "overall_traits" in child.initial_traits:
        traits = child.initial_traits["overall_traits"]

        # Independence category
        independence_score = traits.get("independence", 50)
        discipline_score = traits.get("discipline", 50)
        priorities["Independence"] = (independence_score + discipline_score) / 2

        # Social category
        emotional_score = traits.get("emotional", 50)
        social_score = traits.get("social", 50)
        priorities["Social"] = (emotional_score + social_score) / 2

        # Logic category
        priorities["Logic"] = traits.get("logic", 50)

        # Categories không có trong traits → default 50
        priorities["Physical"] = 50
        priorities["Creativity"] = 50
        priorities["Academic"] = 50

    # 2. Điều chỉnh dựa trên task history
    # Nếu có nhiều giveup tasks trong category → giảm priority
    # Nếu có nhiều completed tasks → tăng priority (nhưng vẫn cần gen để duy trì)

    return priorities
```

## ⚙️ Strategy: Smart Category Selection

### Approach 1: Focus on Weak Areas (Recommended)

**Logic:**

- Xác định **top 3-4 categories có điểm thấp nhất** (cần cải thiện)
- Gen **2 tasks cho mỗi category** trong top này
- Tổng: **6-8 tasks** mỗi lần gen

**Ưu điểm:**

- Tập trung vào areas cần cải thiện
- Không quá nhiều tasks
- Personalized cho từng child

**Ví dụ:**

```
Child có traits:
- Independence: 30 (thấp)
- Social: 25 (thấp nhất)
- Logic: 70 (tốt)
- Physical: 40 (thấp)
- Creativity: 60 (OK)
- Academic: 50 (trung bình)

→ Gen 2 tasks cho: Social, Independence, Physical
→ Tổng: 6 tasks
```

### Approach 2: Balanced Coverage

**Logic:**

- Gen **1 task cho mỗi category** (6 categories)
- Nhưng **ưu tiên categories có điểm thấp** (gen 2 tasks cho top 2 thấp nhất)
- Tổng: **8 tasks** (6 + 2)

**Ưu điểm:**

- Đảm bảo coverage đầy đủ
- Vẫn focus vào weak areas

### Approach 3: Dynamic Based on Active Tasks

**Logic:**

- Phân tích **active tasks hiện tại** theo category
- Gen để **fill gaps** trong categories chưa có task
- Ưu tiên categories có điểm thấp

**Ví dụ:**

```
Active tasks hiện tại:
- Independence: 2 tasks
- Logic: 1 task
- Social: 0 tasks ← Gen 2 tasks
- Physical: 0 tasks ← Gen 2 tasks
- Creativity: 1 task
- Academic: 0 tasks ← Gen 2 tasks

→ Gen 6 tasks để fill gaps
```

## 🎯 Recommended Strategy: Hybrid Approach

Kết hợp cả 3 approaches:

```python
async def determine_categories_to_generate(child: Child) -> Dict[str, int]:
    """
    Xác định categories cần gen và số lượng tasks cho mỗi category.

    Returns: Dict[category, number_of_tasks]
    """
    # 1. Tính priority cho mỗi category
    priorities = calculate_category_priority(child)

    # 2. Phân tích active tasks hiện tại
    active_tasks = await get_active_tasks_by_category(child)

    # 3. Xác định categories cần gen
    categories_to_generate = {}

    # Strategy A: Fill gaps (categories chưa có task)
    for category in ALL_CATEGORIES:
        if active_tasks.get(category, 0) == 0:
            # Category chưa có task → gen 2 tasks
            categories_to_generate[category] = 2

    # Strategy B: Focus on weak areas (nếu chưa đủ)
    if sum(categories_to_generate.values()) < 4:
        # Sắp xếp categories theo priority (thấp nhất = cần cải thiện nhất)
        sorted_categories = sorted(
            priorities.items(),
            key=lambda x: x[1]  # Sort by priority score (lower = worse)
        )

        # Lấy top 2-3 categories có điểm thấp nhất
        for category, priority_score in sorted_categories[:3]:
            if category not in categories_to_generate:
                categories_to_generate[category] = 2
            elif categories_to_generate[category] < 2:
                categories_to_generate[category] = 2

    # Strategy C: Ensure minimum coverage
    # Đảm bảo có ít nhất 1 task cho mỗi category (nếu chưa có)
    for category in ALL_CATEGORIES:
        if category not in categories_to_generate:
            if active_tasks.get(category, 0) == 0:
                categories_to_generate[category] = 1

    # Limit: Tối đa 8 tasks mỗi lần gen
    total_tasks = sum(categories_to_generate.values())
    if total_tasks > 8:
        # Giảm số lượng tasks, ưu tiên categories có priority thấp nhất
        sorted_by_priority = sorted(
            categories_to_generate.items(),
            key=lambda x: priorities.get(x[0], 50)
        )
        categories_to_generate = {}
        remaining = 8
        for category, count in sorted_by_priority:
            if remaining >= count:
                categories_to_generate[category] = count
                remaining -= count
            elif remaining > 0:
                categories_to_generate[category] = remaining
                remaining = 0
            else:
                break

    return categories_to_generate
```

## 📝 Implementation Flow

### 1. Update Child Model

```python
class Child(Document):
    # ... existing fields ...
    last_auto_generated_at: Optional[datetime] = None
```

### 2. Create Category Analysis Function

```python
async def analyze_category_needs(child: Child) -> Dict[str, Any]:
    """
    Phân tích nhu cầu generate task theo category.

    Returns:
    {
        "priorities": Dict[str, float],  # Priority score cho mỗi category
        "active_tasks_by_category": Dict[str, int],  # Số active tasks theo category
        "categories_to_generate": Dict[str, int]  # Categories cần gen và số lượng
    }
    """
    # Calculate priorities from initial_traits
    priorities = calculate_category_priority(child)

    # Count active tasks by category
    active_tasks = await get_active_tasks_by_category(child)

    # Determine categories to generate
    categories_to_generate = await determine_categories_to_generate(child)

    return {
        "priorities": priorities,
        "active_tasks_by_category": active_tasks,
        "categories_to_generate": categories_to_generate
    }
```

### 3. Batch Generation Function

```python
async def generate_tasks_for_categories(
    child: Child,
    categories_to_generate: Dict[str, int]
) -> List[ChildTask]:
    """
    Generate tasks cho các categories được chỉ định.

    Args:
        child: Child object
        categories_to_generate: Dict[category, number_of_tasks]

    Returns:
        List of created ChildTask objects
    """
    created_tasks = []

    # Build context once (reuse for all categories)
    context = await build_child_context(str(child.id))

    # Generate tasks for each category
    for category, count in categories_to_generate.items():
        for i in range(count):
            try:
                # Generate 1 task for this category
                task = await generate_single_task_for_category(
                    child=child,
                    category=category,
                    context=context
                )
                created_tasks.append(task)
            except Exception as e:
                logging.error(f"Failed to generate task for category {category}: {e}")
                continue

    return created_tasks
```

### 4. Optimized LLM Prompt

```python
def build_category_specific_prompt(
    child_context: Dict[str, Any],
    category: str,
    priority_score: float
) -> str:
    """
    Build prompt tối ưu cho từng category.
    """
    # Determine focus based on priority
    if priority_score < 40:
        focus = "This is a weak area that needs significant improvement. Create tasks that are engaging and build foundational skills."
    elif priority_score < 60:
        focus = "This area needs moderate improvement. Create tasks that challenge but are achievable."
    else:
        focus = "This is a strength area. Create tasks that maintain and further develop these skills."

    prompt = f"""
    CHILD INFORMATION:
    {format_child_info(child_context['child_info'])}

    DEVELOPMENT ASSESSMENT:
    {format_assessment(child_context['assessment'])}

    TASK HISTORY:
    Completed: {format_tasks(child_context['completed_tasks'])}
    Given Up: {format_tasks(child_context['giveup_tasks'])}

    TARGET CATEGORY: {category}
    CATEGORY PRIORITY SCORE: {priority_score}/100
    FOCUS: {focus}

    REQUIREMENT:
    Create 1 task in the "{category}" category that:
    1. Is appropriate for this child's age and current skill level
    2. Addresses the focus area mentioned above
    3. Is engaging and matches the child's interests: {child_context['child_info'].get('interests', [])}
    4. Avoids repeating tasks the child has given up on
    5. Builds on tasks the child has successfully completed

    Return ONLY a JSON object (not array) with the task details.
    """

    return prompt
```

## 🎨 Example Output

### Scenario 1: Child với weak Social skills

```python
# Child traits:
priorities = {
    "Independence": 45,
    "Social": 25,  # Very weak
    "Logic": 70,
    "Physical": 50,
    "Creativity": 60,
    "Academic": 55
}

# Active tasks:
active_tasks = {
    "Independence": 1,
    "Social": 0,  # No tasks
    "Logic": 2,
    "Physical": 0,  # No tasks
    "Creativity": 1,
    "Academic": 0  # No tasks
}

# Categories to generate:
categories_to_generate = {
    "Social": 2,      # Weak area + no tasks
    "Physical": 2,    # No tasks
    "Academic": 2,    # No tasks
    "Independence": 1 # Weak area but has 1 task
}

# Total: 7 tasks
```

### Scenario 2: Child balanced

```python
# Child traits:
priorities = {
    "Independence": 60,
    "Social": 65,
    "Logic": 70,
    "Physical": 55,
    "Creativity": 60,
    "Academic": 58
}

# Active tasks:
active_tasks = {
    "Independence": 1,
    "Social": 1,
    "Logic": 1,
    "Physical": 1,
    "Creativity": 1,
    "Academic": 1
}

# Categories to generate:
categories_to_generate = {
    "Physical": 1,    # Lowest priority
    "Academic": 1     # Second lowest
}

# Total: 2 tasks (minimal, vì đã có đủ tasks)
```

## ✅ Benefits

1. **Personalized**: Tập trung vào areas cần cải thiện của từng child
2. **Efficient**: Không gen quá nhiều tasks không cần thiết
3. **Balanced**: Đảm bảo coverage đầy đủ các categories
4. **Smart**: Phân tích task history để tránh lặp lại
5. **Scalable**: Dễ điều chỉnh logic theo nhu cầu

## 📈 Configuration

```python
# Config values
MIN_TASKS_PER_GENERATION = 2  # Tối thiểu 2 tasks
MAX_TASKS_PER_GENERATION = 8  # Tối đa 8 tasks
TASKS_PER_CATEGORY = 2  # Mỗi category gen 2 tasks
PRIORITY_THRESHOLD = 50  # Categories có priority < 50 được ưu tiên
```
