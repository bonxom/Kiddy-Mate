"""
LLM Integration Router
Handles task generation and scoring using LLM with context from child data.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
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

def _parse_llm_json_response(response_text: str) -> Dict[str, Any]:
    """
    Parse LLM JSON response, handling various formats.
    Tries to extract JSON from markdown code blocks or plain JSON.
    More robust error handling and JSON cleaning.
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

