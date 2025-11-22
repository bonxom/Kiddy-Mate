"""
LLM Integration Router
Handles task generation and scoring using LLM with context from child data.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from app.models.child_models import Child, ChildDevelopmentAssessment
from app.models.childtask_models import ChildTask, ChildTaskStatus, UnityType as ChildTaskUnityType
from app.models.task_models import Task, TaskCategory, TaskType, UnityType as TaskUnityType
from app.dependencies import verify_parent_token, verify_child_ownership, get_child_tasks_by_child, extract_id_from_link, fetch_link_or_get_object
from app.services.auth import get_current_user
from app.models.user_models import User
from app.services.llm import generate_gemini_response
from app.schemas.schemas import ChildTaskPublic, TaskPublic, ChildTaskWithDetails
from datetime import datetime
import json
import logging
import re

router = APIRouter()

logger = logging.getLogger(__name__)

class GenerateTasksRequest(BaseModel):
    prompt: str = Field(..., description="Prompt for LLM to generate tasks")

class ScoreRequest(BaseModel):
    prompt: str = Field(..., description="Prompt for LLM to generate score")

class ScoreResponse(BaseModel):
    logic: int = Field(..., ge=0, le=100, description="Logic score (0-100)")
    independence: int = Field(..., ge=0, le=100, description="Independence score (0-100)")
    emotional: int = Field(..., ge=0, le=100, description="Emotional intelligence score (0-100)")
    discipline: int = Field(..., ge=0, le=100, description="Discipline score (0-100)")
    social: int = Field(..., ge=0, le=100, description="Social score (0-100)")

class GeneratedTaskSchema(BaseModel):
    """Schema for validating LLM-generated task JSON"""
    title: str
    description: str
    category: str
    type: str
    difficulty: int = Field(ge=1, le=5)
    suggested_age_range: str
    reward_coins: int = Field(ge=0, le=1000)
    reward_badge_name: Optional[str] = None
    unity_type: str

async def build_child_context(child_id: str) -> Dict[str, Any]:
    """
    Build comprehensive context for LLM from:
    1. Assessment data
    2. Completed tasks
    3. Giveup tasks
    
    Returns a dictionary with all context data formatted for LLM.
    """
    child = await Child.get(child_id)
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found."
        )
    
    context = {
        "child_info": {
            "name": child.name,
            "nickname": child.nickname,
            "age": _calculate_age(child.birth_date),
            "personality": child.personality or [],
            "interests": child.interests or [],
            "strengths": child.strengths or [],
            "challenges": child.challenges or [],
        },
        "assessment": {},
        "completed_tasks": [],
        "giveup_tasks": []
    }
    
    
    assessment = None
    try:
        assessment = await ChildDevelopmentAssessment.find_one(
            ChildDevelopmentAssessment.child.id == child.id  # type: ignore
        )
    except Exception:
        all_assessments = await ChildDevelopmentAssessment.find_all().to_list()
        child_id_str = str(child.id)
        for ass in all_assessments:
            ass_child_id = extract_id_from_link(ass.child) if hasattr(ass, 'child') else None
            if ass_child_id == child_id_str:
                assessment = ass
                break
    
    if assessment:
        context["assessment"] = {
            "discipline_autonomy": assessment.discipline_autonomy or {},
            "emotional_intelligence": assessment.emotional_intelligence or {},
            "social_interaction": assessment.social_interaction or {}
        }
    
    all_child_tasks = await get_child_tasks_by_child(child)
    completed_tasks = [ct for ct in all_child_tasks if ct.status == ChildTaskStatus.COMPLETED]
    completed_tasks = sorted(completed_tasks, key=lambda x: x.completed_at if x.completed_at else datetime.min, reverse=True)[:10]
    
    for ct in completed_tasks:
        task = await fetch_link_or_get_object(ct.task, Task) if ct.task else None
        if task:
            context["completed_tasks"].append({
                "title": task.title,
                "category": task.category.value if hasattr(task.category, 'value') else str(task.category),
                "difficulty": task.difficulty,
                "completed_at": ct.completed_at.isoformat() if ct.completed_at else None
            })
    
    giveup_tasks = [ct for ct in all_child_tasks if ct.status == ChildTaskStatus.GIVEUP]
    giveup_tasks = sorted(giveup_tasks, key=lambda x: x.assigned_at, reverse=True)[:10]
    
    for ct in giveup_tasks:
        task = await fetch_link_or_get_object(ct.task, Task) if ct.task else None
        if task:
            context["giveup_tasks"].append({
                "title": task.title,
                "category": task.category.value if hasattr(task.category, 'value') else str(task.category),
                "difficulty": task.difficulty,
                "assigned_at": ct.assigned_at.isoformat()
            })
    
    return context

def _calculate_age(birth_date: datetime) -> int:
    """Calculate age from birth date"""
    today = datetime.utcnow()
    age = today.year - birth_date.year
    if today.month < birth_date.month or (today.month == birth_date.month and today.day < birth_date.day):
        age -= 1
    return age

# ============== AUTO-GENERATION HELPER FUNCTIONS ==============

# Mapping traits to categories
TRAIT_TO_CATEGORY_MAP = {
    "independence": "Independence",
    "discipline": "Independence",
    "emotional": "Social",
    "social": "Social",
    "logic": "Logic"
}

# All task categories
ALL_CATEGORIES = ["Independence", "Logic", "Physical", "Creativity", "Social", "Academic"]

# Config values
MIN_TASKS_PER_GENERATION = 2
MAX_TASKS_PER_GENERATION = 8
TASKS_PER_CATEGORY = 2
PRIORITY_THRESHOLD = 50

def calculate_category_priority(child: Child) -> Dict[str, float]:
    """
    Tính priority cho mỗi category dựa trên initial_traits.
    Priority score: 0-100, càng thấp càng cần cải thiện.
    """
    priorities = {}
    
    # Initialize all categories with default priority
    for category in ALL_CATEGORIES:
        priorities[category] = 50.0  # Default neutral score
    
    # Calculate from initial_traits
    if child.initial_traits and "overall_traits" in child.initial_traits:
        traits = child.initial_traits["overall_traits"]
        
        # Independence category (average of independence + discipline)
        independence_score = float(traits.get("independence", 50))
        discipline_score = float(traits.get("discipline", 50))
        priorities["Independence"] = (independence_score + discipline_score) / 2.0
        
        # Social category (average of emotional + social)
        emotional_score = float(traits.get("emotional", 50))
        social_score = float(traits.get("social", 50))
        priorities["Social"] = (emotional_score + social_score) / 2.0
        
        # Logic category
        priorities["Logic"] = float(traits.get("logic", 50))
        
        # Physical, Creativity, Academic: keep default 50
        # (can be adjusted based on task history later)
    
    return priorities

async def get_active_tasks_by_category(child: Child) -> Dict[str, int]:
    """
    Đếm số active tasks theo category.
    Active tasks = ASSIGNED, IN_PROGRESS, NEED_VERIFY, UNASSIGNED
    """
    active_statuses = [
        ChildTaskStatus.ASSIGNED,
        ChildTaskStatus.IN_PROGRESS,
        ChildTaskStatus.NEED_VERIFY,
        ChildTaskStatus.UNASSIGNED
    ]
    
    all_child_tasks = await get_child_tasks_by_child(child)
    active_tasks = [ct for ct in all_child_tasks if ct.status in active_statuses]
    
    # Count by category
    category_count = {category: 0 for category in ALL_CATEGORIES}
    
    for ct in active_tasks:
        category = None
        
        # Get category from task
        if ct.task:
            task = await fetch_link_or_get_object(ct.task, Task)
            if task and hasattr(task, 'category'):
                category = task.category.value if hasattr(task.category, 'value') else str(task.category)
        elif ct.task_data:
            category = ct.task_data.category.value if hasattr(ct.task_data.category, 'value') else str(ct.task_data.category)
        elif ct.custom_category:
            category = ct.custom_category.value if hasattr(ct.custom_category, 'value') else str(ct.custom_category)
        
        # Map IQ/EQ to Logic/Social
        if category == "IQ":
            category = "Logic"
        elif category == "EQ":
            category = "Social"
        
        if category and category in category_count:
            category_count[category] += 1
    
    return category_count

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
            categories_to_generate[category] = TASKS_PER_CATEGORY
    
    # Strategy B: Focus on weak areas (nếu chưa đủ)
    if sum(categories_to_generate.values()) < 4:
        # Sắp xếp categories theo priority (thấp nhất = cần cải thiện nhất)
        sorted_categories = sorted(
            priorities.items(),
            key=lambda x: x[1]  # Sort by priority score (lower = worse)
        )
        
        # Lấy top 3 categories có điểm thấp nhất
        for category, priority_score in sorted_categories[:3]:
            if category not in categories_to_generate:
                categories_to_generate[category] = TASKS_PER_CATEGORY
            elif categories_to_generate[category] < TASKS_PER_CATEGORY:
                categories_to_generate[category] = TASKS_PER_CATEGORY
    
    # Strategy C: Ensure minimum coverage
    # Đảm bảo có ít nhất 1 task cho mỗi category (nếu chưa có)
    for category in ALL_CATEGORIES:
        if category not in categories_to_generate:
            if active_tasks.get(category, 0) == 0:
                categories_to_generate[category] = 1
    
    # Limit: Tối đa MAX_TASKS_PER_GENERATION tasks mỗi lần gen
    total_tasks = sum(categories_to_generate.values())
    if total_tasks > MAX_TASKS_PER_GENERATION:
        # Giảm số lượng tasks, ưu tiên categories có priority thấp nhất
        sorted_by_priority = sorted(
            categories_to_generate.items(),
            key=lambda x: priorities.get(x[0], 50)
        )
        categories_to_generate = {}
        remaining = MAX_TASKS_PER_GENERATION
        for category, count in sorted_by_priority:
            if remaining >= count:
                categories_to_generate[category] = count
                remaining -= count
            elif remaining > 0:
                categories_to_generate[category] = remaining
                remaining = 0
            else:
                break
    
    # Ensure minimum
    if sum(categories_to_generate.values()) < MIN_TASKS_PER_GENERATION:
        # Add at least 2 tasks for lowest priority category
        sorted_by_priority = sorted(
            priorities.items(),
            key=lambda x: x[1]
        )
        for category, _ in sorted_by_priority:
            if category not in categories_to_generate:
                categories_to_generate[category] = MIN_TASKS_PER_GENERATION
                break
    
    return categories_to_generate

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
        focus = "This is a weak area that needs significant improvement. Create tasks that are engaging and build foundational skills. Make them easier and more encouraging."
    elif priority_score < 60:
        focus = "This area needs moderate improvement. Create tasks that challenge but are achievable. Balance difficulty appropriately."
    else:
        focus = "This is a strength area. Create tasks that maintain and further develop these skills. Can be slightly more challenging."
    
    child_info = child_context.get('child_info', {})
    interests = child_info.get('interests', [])
    interests_text = ', '.join(interests) if interests else 'Not specified'
    
    completed_tasks_text = "No completed tasks yet."
    if child_context.get('completed_tasks'):
        completed_tasks_text = "\n".join([
            f"- {task.get('title', 'N/A')} (Category: {task.get('category', 'N/A')}, Difficulty: {task.get('difficulty', 'N/A')})"
            for task in child_context['completed_tasks'][:5]  # Last 5 completed
        ])
    
    giveup_tasks_text = "No tasks given up yet."
    if child_context.get('giveup_tasks'):
        giveup_tasks_text = "\n".join([
            f"- {task.get('title', 'N/A')} (Category: {task.get('category', 'N/A')}, Difficulty: {task.get('difficulty', 'N/A')})"
            for task in child_context['giveup_tasks'][:5]  # Last 5 given up
        ])
    
    prompt = f"""
CHILD INFORMATION:
Name: {child_info.get('name', 'N/A')}
Nickname: {child_info.get('nickname', 'N/A')}
Age: {child_info.get('age', 'N/A')}
Interests: {interests_text}
Personality: {', '.join(child_info.get('personality', [])) or 'Not specified'}
Strengths: {', '.join(child_info.get('strengths', [])) or 'Not specified'}
Challenges: {', '.join(child_info.get('challenges', [])) or 'Not specified'}

TARGET CATEGORY: {category}
CATEGORY PRIORITY SCORE: {priority_score:.1f}/100
FOCUS: {focus}

COMPLETED TASKS (to build upon):
{completed_tasks_text}

GIVEN UP TASKS (to avoid similar difficulty/style):
{giveup_tasks_text}

REQUIREMENT: 
Create EXACTLY 1 task in the "{category}" category that:
1. Is appropriate for this child's age ({child_info.get('age', 'N/A')}) and current skill level
2. Addresses the focus area: {focus}
3. Is engaging and matches the child's interests: {interests_text}
4. Avoids repeating tasks the child has given up on (check the list above)
5. Builds on tasks the child has successfully completed (check the list above)
6. Has appropriate difficulty based on priority score ({priority_score:.1f}/100)

Return ONLY a JSON object (not array) with these exact fields:
{{
  "title": "Task title",
  "description": "Detailed description",
  "category": "{category}",
  "type": "logic" or "emotion",
  "difficulty": 1-5,
  "suggested_age_range": "e.g., 6-10",
  "reward_coins": 0-1000,
  "unity_type": "life" or "choice" or "talk"
}}
"""
    
    return prompt

async def generate_single_task_for_category(
    child: Child,
    category: str,
    context: Dict[str, Any],
    priority_score: float
) -> ChildTask:
    """
    Generate 1 task cho 1 category cụ thể.
    Returns created ChildTask object.
    """
    # Build category-specific prompt
    user_prompt = build_category_specific_prompt(context, category, priority_score)
    
    system_instruction = (
        "You are a child education expert. "
        "Your task is to create appropriate tasks for children based on assessment information and task completion history. "
        "\n\nIMPORTANT: You MUST return ONLY a valid JSON object (not array), no explanations, no markdown code blocks, no additional text. "
        "Return only a pure JSON object with the exact fields specified in the prompt.\n\n"
    )
    
    # Call LLM
    max_tokens = 1024  # Enough for 1 task
    logger.info(f"Generating task for category '{category}' (priority: {priority_score:.1f})")
    llm_response = generate_gemini_response(user_prompt, system_instruction, max_tokens=max_tokens)
    
    # Parse JSON (expecting single object, not array)
    try:
        parsed_response = _parse_llm_json_response(llm_response)
        
        # Handle both object and array responses
        if isinstance(parsed_response, list):
            if len(parsed_response) > 0:
                task_data = parsed_response[0]
            else:
                raise ValueError("Empty array response from LLM")
        elif isinstance(parsed_response, dict):
            task_data = parsed_response
        else:
            raise ValueError(f"Unexpected response type: {type(parsed_response)}")
        
        # Validate and normalize
        validated_task = _validate_task_schema(task_data)
        
        # Ensure category matches
        if validated_task.category != category:
            logger.warning(f"LLM returned category '{validated_task.category}' but requested '{category}'. Using requested category.")
            # Create a new validated task with correct category
            task_dict = task_data.copy()
            task_dict['category'] = category
            validated_task = _validate_task_schema(task_dict)
        
        # Find or create Task in library
        task = await Task.find_one(Task.title == validated_task.title)
        if not task:
            # Create new task
            task = Task(
                title=validated_task.title,
                description=validated_task.description,
                category=TaskCategory(validated_task.category),
                type=TaskType(validated_task.type),
                difficulty=validated_task.difficulty,
                suggested_age_range=validated_task.suggested_age_range,
                reward_coins=validated_task.reward_coins,
                reward_badge_name=validated_task.reward_badge_name,
                unity_type=TaskUnityType(validated_task.unity_type)
            )
            await task.insert()
        else:
            # Update unity_type if not set
            if not task.unity_type:
                task.unity_type = TaskUnityType(validated_task.unity_type)
                await task.save()
        
        # Create ChildTask with status='unassigned'
        from beanie import Link
        child_task = ChildTask(
            child=child,  # type: ignore
            task=task,  # type: ignore
            status=ChildTaskStatus.UNASSIGNED,
            unity_type=ChildTaskUnityType(validated_task.unity_type),
            assigned_at=datetime.utcnow()
        )
        await child_task.insert()
        
        logger.info(f"✅ Generated task '{validated_task.title}' for category '{category}'")
        return child_task
        
    except Exception as e:
        logger.error(f"Failed to generate task for category {category}: {e}")
        raise

def _parse_llm_json_response(response_text: str) -> Any:
    """
    Parse LLM JSON response, handling various formats.
    Tries to extract JSON from markdown code blocks or plain JSON.
    More robust error handling and JSON cleaning.
    
    Returns: Dict, List, or Any (depending on JSON structure)
    """
    if not response_text or not response_text.strip():
        raise ValueError("Empty response from LLM")
    
    original_text = response_text
    
    
    if "```json" in response_text:
        start = response_text.find("```json") + 7
        end = response_text.find("```", start)
        if end == -1:
            
            response_text = response_text[start:].strip()
        else:
            response_text = response_text[start:end].strip()
    elif "```" in response_text:
        start = response_text.find("```") + 3
        end = response_text.find("```", start)
        if end == -1:
            response_text = response_text[start:].strip()
        else:
            response_text = response_text[start:end].strip()
    
    
    
    first_brace = response_text.find('{')
    first_bracket = response_text.find('[')
    
    if first_brace != -1 and (first_bracket == -1 or first_brace < first_bracket):
        
        last_brace = response_text.rfind('}')
        if last_brace != -1 and last_brace > first_brace:
            response_text = response_text[first_brace:last_brace + 1]
    elif first_bracket != -1:
        
        last_bracket = response_text.rfind(']')
        if last_bracket != -1 and last_bracket > first_bracket:
            response_text = response_text[first_bracket:last_bracket + 1]
        else:
            
            
            open_brackets = response_text[first_bracket:].count('[')
            close_brackets = response_text[first_bracket:].count(']')
            open_braces = response_text[first_bracket:].count('{')
            close_braces = response_text[first_bracket:].count('}')
            
            
            if open_brackets > close_brackets or open_braces > close_braces:
                
                temp_text = response_text[first_bracket:]
                
                brace_count = 0
                last_complete_pos = -1
                for i, char in enumerate(temp_text):
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            last_complete_pos = i
                
                if last_complete_pos != -1:
                    
                    response_text = response_text[first_bracket:first_bracket + last_complete_pos + 1] + ']'
                else:
                    
                    response_text = response_text[first_bracket:] + '}' * (open_braces - close_braces) + ']' * (open_brackets - close_brackets)
    
    
    response_text = response_text.strip()
    
    
    
    import re
    response_text = re.sub(r',\s*}', '}', response_text)
    response_text = re.sub(r',\s*]', ']', response_text)
    
    try:
        return json.loads(response_text)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM JSON response: {e}")
        logger.error(f"Error position: {e.pos}")
        logger.error(f"Full response text length: {len(original_text)}")
        logger.error(f"Cleaned response text length: {len(response_text)}")
        logger.error(f"Response text (first 2000 chars): {original_text[:2000]}")
        
        
        if first_bracket != -1:
            
            objects = []
            current_obj = ""
            brace_count = 0
            in_string = False
            escape_next = False
            
            for i, char in enumerate(response_text[first_bracket + 1:], start=first_bracket + 1):
                if escape_next:
                    escape_next = False
                    current_obj += char
                    continue
                
                if char == '\\':
                    escape_next = True
                    current_obj += char
                    continue
                
                if char == '"' and not escape_next:
                    in_string = not in_string
                
                if not in_string:
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                
                current_obj += char
                
                if not in_string and brace_count == 0 and current_obj.strip().startswith('{'):
                    try:
                        obj = json.loads(current_obj.strip())
                        objects.append(obj)
                        current_obj = ""
                    except json.JSONDecodeError:
                        pass
            
            if objects:
                logger.info(f"Successfully extracted {len(objects)} valid objects from incomplete JSON")
                return {"tasks": objects}  # type: ignore
        
        raise ValueError(f"Invalid JSON response from LLM: {str(e)}")

def _validate_task_schema(task_data: Dict[str, Any]) -> GeneratedTaskSchema:
    """Validate and normalize task data from LLM"""
    try:
        # Validate category
        category_value = task_data.get("category", "").upper()
        valid_categories = [cat.value for cat in TaskCategory]
        if category_value not in valid_categories:
            # Try to map common variations
            category_mapping = {
                "INDEPENDENCE": "Independence",
                "LOGIC": "Logic",
                "PHYSICAL": "Physical",
                "CREATIVITY": "Creativity",
                "SOCIAL": "Social",
                "ACADEMIC": "Academic",
                "IQ": "IQ",
                "EQ": "EQ"
            }
            category_value = category_mapping.get(category_value, "Independence")
        else:
            category_value = TaskCategory(category_value).value
        
        # Validate type
        type_value = task_data.get("type", "logic").lower()
        if type_value not in ["logic", "emotion"]:
            type_value = "logic"
        
        # Validate unity_type
        unity_type_value = task_data.get("unity_type", "life").lower()
        if unity_type_value not in ["life", "choice", "talk"]:
            unity_type_value = "life"
        
        return GeneratedTaskSchema(
            title=task_data.get("title", "Untitled Task"),
            description=task_data.get("description", ""),
            category=category_value,
            type=type_value,
            difficulty=int(task_data.get("difficulty", 1)),
            suggested_age_range=task_data.get("suggested_age_range", "5-10"),
            reward_coins=int(task_data.get("reward_coins", 50)),
            reward_badge_name=task_data.get("reward_badge_name"),
            unity_type=unity_type_value
        )
    except Exception as e:
        logger.error(f"Failed to validate task schema: {e}")
        raise ValueError(f"Invalid task data: {str(e)}")

# ============== ENDPOINTS ==============

@router.post("/children/{child_id}/generate/chat", response_model=List[ChildTaskWithDetails])
async def generate_tasks(
    child_id: str,
    request: GenerateTasksRequest,
    child: Child = Depends(verify_child_ownership),
    current_user: User = Depends(verify_parent_token)
):
    """
    Generate tasks for a child using LLM with context.
    
    Flow:
    1. Build context from Assessment, Completed Tasks, Giveup Tasks
    2. Call LLM with prompt + context
    3. Parse JSON response
    4. Validate schema
    5. Create ChildTask records with status='unassigned'
    """
    try:
        # 1. Build context
        context = await build_child_context(child_id)
        
        # 2. Prepare LLM prompt
        system_instruction = (
            "You are a child education expert. "
            "Your task is to create appropriate tasks for children based on assessment information and task completion history. "
            "\n\nIMPORTANT: You MUST return ONLY a valid JSON array, no explanations, no markdown code blocks, no additional text. "
            "Return only a pure JSON array.\n\n"
            "Each task object in the array must have the following fields:\n"
            "- title (string): Task title\n"
            "- description (string): Detailed description\n"
            "- category (string): One of: Independence, Logic, Physical, Creativity, Social, Academic, IQ, EQ\n"
            "- type (string): logic or emotion\n"
            "- difficulty (number): From 1 to 5\n"
            "- suggested_age_range (string): Example '5-10'\n"
            "- reward_coins (number): From 0 to 1000\n"
            "- reward_badge_name (string, optional): Reward badge name\n"
            "- unity_type (string): One of: life, choice, talk\n\n"
            "Example correct JSON format with 1 task:\n"
            '[{"title": "Clean room", "description": "Help child clean their own room", "category": "Independence", "type": "logic", "difficulty": 2, "suggested_age_range": "6-8", "reward_coins": 50, "unity_type": "life"}]'
        )
        
        child_info_text = f"""
Name: {context['child_info'].get('name', 'N/A')}
Nickname: {context['child_info'].get('nickname', 'N/A')}
Age: {context['child_info'].get('age', 'N/A')}
Personality: {', '.join(context['child_info'].get('personality', [])) or 'Not set'}
Interests: {', '.join(context['child_info'].get('interests', [])) or 'Not set'}
Strengths: {', '.join(context['child_info'].get('strengths', [])) or 'Not set'}
Challenges: {', '.join(context['child_info'].get('challenges', [])) or 'Not set'}
"""
        
        assessment_text = "No development assessment available."
        if context['assessment']:
            assessment_text = f"""
Discipline and Autonomy: {json.dumps(context['assessment'].get('discipline_autonomy', {}), ensure_ascii=False)}
Emotional Intelligence: {json.dumps(context['assessment'].get('emotional_intelligence', {}), ensure_ascii=False)}
Social Interaction: {json.dumps(context['assessment'].get('social_interaction', {}), ensure_ascii=False)}
"""
        
        completed_tasks_text = "No completed tasks yet."
        if context['completed_tasks']:
            completed_tasks_text = "\n".join([
                f"- {task.get('title', 'N/A')} (Difficulty: {task.get('difficulty', 'N/A')}, Category: {task.get('category', 'N/A')})"
                for task in context['completed_tasks']
            ])
        
        giveup_tasks_text = "No tasks given up yet."
        if context['giveup_tasks']:
            giveup_tasks_text = "\n".join([
                f"- {task.get('title', 'N/A')} (Difficulty: {task.get('difficulty', 'N/A')}, Category: {task.get('category', 'N/A')})"
                for task in context['giveup_tasks']
            ])
        
        user_prompt = f"""
CHILD INFORMATION:
{child_info_text}

DEVELOPMENT ASSESSMENT:
{assessment_text}

COMPLETED TASKS:
{completed_tasks_text}

GIVEN UP TASKS:
{giveup_tasks_text}

PARENT REQUEST:
{request.prompt}

REQUIREMENT: Create 1 task appropriate for this child.

IMPORTANT - READ CAREFULLY:
1. You MUST create EXACTLY 1 task, no less, no more
2. Return ONLY a JSON array with EXACTLY 1 element, no explanations, no markdown code blocks, no other text
3. Task must have all fields: title, description, category, type, difficulty, suggested_age_range, reward_coins, unity_type
4. JSON array must have exactly 1 object: [{{"title": "...", "description": "...", ...}}]
"""
        
        # 3. Call LLM with sufficient max_tokens for 1 task
        # Since we only generate 1 task at a time, 2048 tokens should be more than enough
        max_tokens = 2048
        logger.info(f"Calling LLM with max_tokens={max_tokens} for 1 task")
        llm_response = generate_gemini_response(user_prompt, system_instruction, max_tokens=max_tokens)
        logger.info(f"LLM raw response length: {len(llm_response)} chars")
        logger.debug(f"LLM raw response (first 2000 chars): {llm_response[:2000]}")
        
        # 4. Parse JSON
        try:
            parsed_response = _parse_llm_json_response(llm_response)
            logger.info(f"Parsed response type: {type(parsed_response)}")
            
            # Handle both array and object with array property
            if isinstance(parsed_response, dict):
                tasks_data = parsed_response.get("tasks", parsed_response.get("data", []))
                logger.info(f"Found tasks in dict with keys: {parsed_response.keys()}")
            else:
                tasks_data = parsed_response
            
            if not isinstance(tasks_data, list):
                logger.warning(f"Tasks data is not a list, converting. Type: {type(tasks_data)}")
                tasks_data = [tasks_data]
            
            logger.info(f"Total tasks parsed from LLM: {len(tasks_data)}")
            
        except Exception as e:
            logger.error(f"Failed to parse LLM response: {e}")
            logger.error(f"LLM response (first 2000 chars): {llm_response[:2000]}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to parse LLM response: {str(e)}"
            )
        
        # 5. Validate and create tasks
        logger.info(f"Processing {len(tasks_data)} tasks from LLM, requested 1")
        created_child_tasks = []
        failed_tasks = []
        for idx, task_data in enumerate(tasks_data[:1]):  # Only process first task
            task_title = task_data.get('title', 'N/A')
            logger.info(f"Processing task {idx + 1}/1: {task_title}")
            try:
                validated_task = _validate_task_schema(task_data)
                
                # Find or create Task in library
                task = await Task.find_one(Task.title == validated_task.title)
                if not task:
                    # Create new task
                    task = Task(
                        title=validated_task.title,
                        description=validated_task.description,
                        category=TaskCategory(validated_task.category),
                        type=TaskType(validated_task.type),
                        difficulty=validated_task.difficulty,
                        suggested_age_range=validated_task.suggested_age_range,
                        reward_coins=validated_task.reward_coins,
                        reward_badge_name=validated_task.reward_badge_name,
                        unity_type=TaskUnityType(validated_task.unity_type)
                    )
                    await task.insert()
                else:
                    # Update unity_type if not set
                    if not task.unity_type:
                        task.unity_type = TaskUnityType(validated_task.unity_type)
                        await task.save()
                
                # Create ChildTask with status='unassigned'
                from beanie import Link
                child_task = ChildTask(
                    child=child,  # type: ignore
                    task=task,  # type: ignore
                    status=ChildTaskStatus.UNASSIGNED,
                    unity_type=ChildTaskUnityType(validated_task.unity_type),
                    assigned_at=datetime.utcnow()
                )
                await child_task.insert()
                
                # Fetch task details for response (task is already available, no need to fetch)
                created_child_tasks.append(
                    ChildTaskWithDetails(
                        id=str(child_task.id),
                        status=child_task.status,
                        assigned_at=child_task.assigned_at,
                        completed_at=child_task.completed_at,
                        priority=None,
                        due_date=None,
                        progress=0,
                        notes=None,
                        unity_type=child_task.unity_type.value if child_task.unity_type else None,
                        task=TaskPublic(
                            id=str(task.id),
                            title=task.title,
                            description=task.description,
                            category=task.category,
                            type=task.type,
                            difficulty=task.difficulty,
                            suggested_age_range=task.suggested_age_range,
                            reward_coins=task.reward_coins,
                            reward_badge_name=task.reward_badge_name,
                            unity_type=task.unity_type.value if task.unity_type else None
                        )
                    )
                )
                
            except Exception as e:
                logger.error(f"Failed to create task {idx + 1} from LLM data: {e}")
                logger.error(f"Task data: {json.dumps(task_data, ensure_ascii=False, indent=2)}")
                failed_tasks.append({"index": idx + 1, "error": str(e), "data": task_data})
                # Continue with other tasks instead of failing completely
                continue
        
        if not created_child_tasks:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create any tasks from LLM response."
            )
        
        # Log warning if no tasks created
        if not created_child_tasks:
            logger.warning(
                f"Failed to create task. LLM returned {len(tasks_data)} tasks, {len(failed_tasks)} failed validation."
            )
            if failed_tasks:
                logger.warning(f"Failed tasks details: {json.dumps(failed_tasks, ensure_ascii=False, indent=2)}")
            if len(tasks_data) == 0:
                logger.warning("LLM returned no tasks")
        
        return created_child_tasks
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in generate_tasks: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate tasks: {str(e)}"
        )

@router.post("/children/{child_id}/score/chat", response_model=ScoreResponse)
async def score_child(
    child_id: str,
    request: ScoreRequest,
    child: Child = Depends(verify_child_ownership),
    current_user: User = Depends(verify_parent_token)
):
    """
    Generate score/grade for a child using LLM with context.
    
    Returns 5 scores:
    - Logic
    - Independence
    - Emotional (Emotional Intelligence)
    - Discipline
    - Social
    """
    try:
        # 1. Build context
        context = await build_child_context(child_id)
        
        system_instruction = (
            "You are a child development assessment expert. "
            "Your task is to evaluate and score 5 aspects of child development based on assessment information and task completion history. "
            "Return the result as JSON with 5 fields: logic, independence, emotional, discipline, social. "
            "Each score from 0-100."
        )
        
        user_prompt = f"""
Child Context:
- Information: {json.dumps(context['child_info'], ensure_ascii=False, indent=2)}
- Development Assessment: {json.dumps(context['assessment'], ensure_ascii=False, indent=2)}
- Completed Tasks: {json.dumps(context['completed_tasks'], ensure_ascii=False, indent=2)}
- Given Up Tasks: {json.dumps(context['giveup_tasks'], ensure_ascii=False, indent=2)}

Request: {request.prompt}

Evaluate and score 5 aspects (0-100): logic, independence, emotional, discipline, social.
Return JSON object with these fields.
"""
        
        # 3. Call LLM
        llm_response = generate_gemini_response(user_prompt, system_instruction)
        
        # 4. Parse JSON
        try:
            parsed_response = _parse_llm_json_response(llm_response)
        except Exception as e:
            logger.error(f"Failed to parse LLM response: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to parse LLM response: {str(e)}"
            )
        
        # 5. Validate and extract scores
        try:
            scores = ScoreResponse(
                logic=int(parsed_response.get("logic", 50)),
                independence=int(parsed_response.get("independence", 50)),
                emotional=int(parsed_response.get("emotional", 50)),
                discipline=int(parsed_response.get("discipline", 50)),
                social=int(parsed_response.get("social", 50))
            )
        except Exception as e:
            logger.error(f"Failed to validate score response: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Invalid score data from LLM: {str(e)}"
            )
        
        return scores
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in score_child: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate score: {str(e)}"
        )

# ============== INITIAL TASK GENERATION (for new children) ==============

async def generate_initial_tasks_for_child(child_id: str):
    """
    Generate initial tasks for a newly created child.
    This function runs in background and does NOT block the main flow.
    
    Logic:
    - Gen 2 tasks cho mỗi category (tổng 12 tasks)
    - Không check threshold (child mới chưa có task)
    - Không check last_auto_generated_at
    - Status = UNASSIGNED (parent review trước)
    
    This should be called asynchronously using asyncio.create_task()
    to avoid blocking the main request.
    """
    try:
        child = await Child.get(child_id)
        if not child:
            logger.warning(f"Child {child_id} not found for initial task generation")
            return
        
        logger.info(f"🎯 Starting initial task generation for new child: {child.name} (ID: {child_id})")
        
        # Build context
        context = await build_child_context(child_id)
        priorities = calculate_category_priority(child)
        
        # For new children, generate 2 tasks for each category
        # This gives parent a good selection to start with
        categories_to_generate = {category: 2 for category in ALL_CATEGORIES}
        
        # Limit to MAX_TASKS_PER_GENERATION to avoid overwhelming
        total_tasks = sum(categories_to_generate.values())
        if total_tasks > MAX_TASKS_PER_GENERATION:
            # Prioritize categories with lower priority scores (need improvement)
            sorted_by_priority = sorted(
                priorities.items(),
                key=lambda x: x[1]
            )
            categories_to_generate = {}
            remaining = MAX_TASKS_PER_GENERATION
            for category, _ in sorted_by_priority:
                if remaining >= 2:
                    categories_to_generate[category] = 2
                    remaining -= 2
                elif remaining > 0:
                    categories_to_generate[category] = remaining
                    remaining = 0
                else:
                    break
        
        # Generate tasks for each category
        generated_count = 0
        for category, count in categories_to_generate.items():
            priority_score = priorities.get(category, 50)
            
            for _ in range(count):
                try:
                    await generate_single_task_for_category(
                        child=child,
                        category=category,
                        context=context,
                        priority_score=priority_score
                    )
                    generated_count += 1
                    
                    # Small delay to avoid rate limiting
                    import asyncio
                    await asyncio.sleep(0.3)
                    
                except Exception as e:
                    logger.error(f"❌ Failed to generate initial task for {child.name}, category {category}: {e}")
                    continue
        
        # Update last_auto_generated_at
        child.last_auto_generated_at = datetime.utcnow()
        await child.save()
        
        logger.info(f"✅ Generated {generated_count} initial tasks for {child.name}")
        
    except Exception as e:
        logger.error(f"❌ Error in initial task generation for child {child_id}: {e}", exc_info=True)
        # Don't raise - this is background task, errors should be logged only

# ============== AUTO-GENERATION SCHEDULER FUNCTION ==============

async def generate_auto_tasks_for_all_children():
    """
    Auto-generate tasks for all children that meet criteria.
    Called by scheduler at 8:00 AM daily.
    
    Logic:
    1. Check if child already generated today
    2. Count active tasks
    3. Determine categories to generate
    4. Generate tasks for each category
    """
    from app.models.child_models import Child
    
    logger.info("🔄 Starting auto-task generation for all children...")
    
    try:
        # Get all children
        all_children = await Child.find_all().to_list()
        logger.info(f"Found {len(all_children)} children to process")
        
        today = datetime.utcnow().date()
        total_generated = 0
        total_skipped = 0
        total_errors = 0
        
        # Process children in batches to avoid overwhelming the system
        batch_size = 5
        for i in range(0, len(all_children), batch_size):
            batch = all_children[i:i + batch_size]
            
            # Process batch concurrently but with limit
            for child in batch:
                try:
                    # Check if already generated today
                    if child.last_auto_generated_at:
                        last_gen_date = child.last_auto_generated_at.date()
                        if last_gen_date >= today:
                            logger.debug(f"⏭️  Skipping {child.name}: already generated today")
                            total_skipped += 1
                            continue
                    
                    # Count active tasks
                    active_tasks = await get_active_tasks_by_category(child)
                    total_active = sum(active_tasks.values())
                    
                    # Check threshold (only generate if active tasks < threshold)
                    MIN_ACTIVE_TASKS = 3
                    if total_active >= MIN_ACTIVE_TASKS:
                        logger.debug(f"⏭️  Skipping {child.name}: has {total_active} active tasks (threshold: {MIN_ACTIVE_TASKS})")
                        total_skipped += 1
                        continue
                    
                    # Determine categories to generate
                    categories_to_generate = await determine_categories_to_generate(child)
                    
                    if not categories_to_generate:
                        logger.debug(f"⏭️  Skipping {child.name}: no categories to generate")
                        total_skipped += 1
                        continue
                    
                    logger.info(f"📝 Generating tasks for {child.name}: {categories_to_generate}")
                    
                    # Build context once (reuse for all categories)
                    context = await build_child_context(str(child.id))
                    priorities = calculate_category_priority(child)
                    
                    # Generate tasks for each category
                    generated_count = 0
                    for category, count in categories_to_generate.items():
                        priority_score = priorities.get(category, 50)
                        
                        for _ in range(count):
                            try:
                                await generate_single_task_for_category(
                                    child=child,
                                    category=category,
                                    context=context,
                                    priority_score=priority_score
                                )
                                generated_count += 1
                                
                                # Small delay between generations to avoid rate limiting
                                import asyncio
                                await asyncio.sleep(0.5)
                                
                            except Exception as e:
                                logger.error(f"❌ Failed to generate task for {child.name}, category {category}: {e}")
                                continue
                    
                    if generated_count > 0:
                        # Update last_auto_generated_at
                        child.last_auto_generated_at = datetime.utcnow()
                        await child.save()
                        total_generated += generated_count
                        logger.info(f"✅ Generated {generated_count} tasks for {child.name}")
                    else:
                        total_errors += 1
                        
                except Exception as e:
                    logger.error(f"❌ Error processing child {child.name}: {e}", exc_info=True)
                    total_errors += 1
                    continue
            
            # Delay between batches to avoid overwhelming the system
            if i + batch_size < len(all_children):
                import asyncio
                await asyncio.sleep(1)
        
        logger.info(f"✅ Auto-generation completed: {total_generated} tasks generated, {total_skipped} skipped, {total_errors} errors")
        
    except Exception as e:
        logger.error(f"❌ Critical error in auto-generation: {e}", exc_info=True)
        raise

@router.post("/children/{child_id}/generate/auto", response_model=dict)
async def manual_trigger_auto_generate(
    child_id: str,
    child: Child = Depends(verify_child_ownership),
    current_user: User = Depends(verify_parent_token)
):
    """
    Manually trigger auto-generation for a specific child.
    Useful for testing or immediate generation.
    Bypasses daily limit check.
    """
    try:
        # Count active tasks
        active_tasks = await get_active_tasks_by_category(child)
        total_active = sum(active_tasks.values())
        
        # Determine categories to generate
        categories_to_generate = await determine_categories_to_generate(child)
        
        if not categories_to_generate:
            return {
                "message": "No categories need task generation",
                "active_tasks": total_active,
                "categories_to_generate": {}
            }
        
        # Build context
        context = await build_child_context(child_id)
        priorities = calculate_category_priority(child)
        
        # Generate tasks
        generated_tasks = []
        for category, count in categories_to_generate.items():
            priority_score = priorities.get(category, 50)
            
            for _ in range(count):
                try:
                    task = await generate_single_task_for_category(
                        child=child,
                        category=category,
                        context=context,
                        priority_score=priority_score
                    )
                    generated_tasks.append({
                        "id": str(task.id),
                        "category": category
                    })
                except Exception as e:
                    logger.error(f"Failed to generate task for category {category}: {e}")
                    continue
        
        # Update last_auto_generated_at
        child.last_auto_generated_at = datetime.utcnow()
        await child.save()
        
        return {
            "message": f"Successfully generated {len(generated_tasks)} tasks",
            "generated_tasks": generated_tasks,
            "categories": categories_to_generate
        }
        
    except Exception as e:
        logger.error(f"Error in manual auto-generation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate tasks: {str(e)}"
        )

