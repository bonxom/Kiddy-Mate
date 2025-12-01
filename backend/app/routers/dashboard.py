from fastapi import APIRouter, Depends, HTTPException, status
from beanie import Link
from app.models.child_models import Child
from app.models.childtask_models import ChildTask, ChildTaskStatus, ChildTaskPriority
from app.models.reward_models import ChildReward
from app.models.task_models import Task, TaskCategory, TaskType, UnityType as TaskUnityType
from app.models.report_models import Report
from app.models.childtask_models import UnityType as ChildTaskUnityType
from app.dependencies import verify_child_ownership, get_child_tasks_by_child, fetch_link_or_get_object, extract_id_from_link, verify_parent_token
from app.services.llm import generate_openai_response
from app.models.user_models import User
from app.schemas.schemas import ChildTaskWithDetails, TaskPublic
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class CategoryProgressItem(BaseModel):
    name: str
    completed: int
    total: int
    percentage: int

@router.get("/{child_id}", response_model=Dict)
async def get_dashboard(
    child: Child = Depends(verify_child_ownership)
):
    """
    Get comprehensive dashboard statistics for a child.
    
    Returns:
        - Child basic info (name, level, coins)
        - Task completion metrics (completed, total, rate)
        - Badge/reward count
        
    All counts are calculated in real-time from database.
    Frontend should use child.coins directly.
    """
    # Get all child tasks using optimized helper
    tasks_for_child = await get_child_tasks_by_child(child)
    
    # Count completed tasks
    tasks_completed = sum(
        1 for t in tasks_for_child 
        if t.status == ChildTaskStatus.COMPLETED
    )

    # Count badges earned
    child_id_str = str(child.id)
    all_rewards = await ChildReward.find_all().to_list()
    badges_earned = sum(
        1 for r in all_rewards 
        if extract_id_from_link(r.child) == child_id_str
    )

    # Total tasks
    total_tasks = len(tasks_for_child)

    # Calculate completion rate
    completion_rate = round((tasks_completed / total_tasks * 100), 1) if total_tasks > 0 else 0

    return {
        "child": {
            "name": child.name,
            "level": child.level,
            "coins": child.current_coins
        },
        "tasks_completed": tasks_completed,
        "badges_earned": badges_earned,
        "completion_rate": completion_rate
    }

@router.get("/{child_id}/category-progress", response_model=List[CategoryProgressItem])
async def get_category_progress(
    child: Child = Depends(verify_child_ownership)
):
    """
    Get task progress grouped by category for a child.
    
    Returns a list of categories with:
    - name: Category name (Creativity, Social, Academic, etc.)
    - completed: Number of completed tasks in this category
    - total: Total number of tasks in this category
    - percentage: Completion percentage (0-100)
    
    Categories are normalized: IQ -> Logic, EQ -> Social
    """
    # Get all child tasks
    child_tasks = await get_child_tasks_by_child(child)
    
    # Initialize category map with all standard categories
    categories = ['Independence', 'Logic', 'Physical', 'Creativity', 'Social', 'Academic']
    category_map: Dict[str, Dict[str, int]] = {}
    
    for cat in categories:
        category_map[cat] = {'completed': 0, 'total': 0}
    
    # Process tasks and normalize category names
    for ct in child_tasks:
        if not ct.task:
            continue
            
        # Fetch task if it's a Link reference
        task = await fetch_link_or_get_object(ct.task, Task)
        
        # Ensure task is actually a Task instance
        if not task or not isinstance(task, Task):
            continue
            
        if not hasattr(task, 'category') or not task.category:
            continue
        
        # Normalize legacy categories (IQ -> Logic, EQ -> Social)
        category = task.category
        if category == 'IQ':
            category = 'Logic'
        elif category == 'EQ':
            category = 'Social'
        
        # Only process known categories
        if category in category_map:
            category_map[category]['total'] += 1
            if ct.status == ChildTaskStatus.COMPLETED:
                category_map[category]['completed'] += 1
    
    # Build response with percentages
    result = []
    for cat_name, data in category_map.items():
        total = data['total']
        completed = data['completed']
        percentage = round((completed / total * 100)) if total > 0 else 0
        
        result.append(CategoryProgressItem(
            name=cat_name,
            completed=completed,
            total=total,
            percentage=percentage
        ))
    
    return result

class AnalyzeEmotionReportRequest(BaseModel):
    report_id: Optional[str] = None

class GetEmotionAnalyticsRequest(BaseModel):
    report_id: Optional[str] = None  # Nếu None, dùng report mới nhất

class EmotionAnalyticsResponse(BaseModel):
    emotions: List[Dict[str, Any]]  # [{name: "Happy", value: 10}, ...]
    most_common_emotion: Optional[str] = None
    emotion_trends: Dict[str, int] = {}
    emotional_analysis: Optional[str] = None
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    report_id: Optional[str] = None

@router.get("/{child_id}/emotion-analytics", response_model=EmotionAnalyticsResponse)
async def get_emotion_analytics(
    child_id: str,
    report_id: Optional[str] = None,
    child: Child = Depends(verify_child_ownership),
    current_user: User = Depends(verify_parent_token)
):
    """
    Get emotion analytics from a report for visualization in EmotionPieChart.
    If report_id is provided, uses that specific report. Otherwise, uses the most recent report.
    
    Returns emotion distribution data in format suitable for pie chart:
    - emotions: List of {name: str, value: int} for pie chart
    - most_common_emotion: Most frequently detected emotion
    - emotion_trends: Full emotion distribution dictionary
    - emotional_analysis: Text analysis of emotional patterns
    """
    try:
        # Get report (most recent if report_id not provided)
        report = None
        if report_id:
            report = await Report.get(report_id)
            if not report:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Report not found."
                )
            # Verify report belongs to child
            report_child_id = extract_id_from_link(report.child)
            if report_child_id != str(child.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Report does not belong to this child."
                )
        else:
            # Get most recent report for this child
            child_id_str = str(child.id)
            logger.info(f"Looking for most recent report for child_id: {child_id_str}")
            
            # Try Beanie query first
            try:
                from beanie.operators import In
                child_id_obj = child.id
                child_reports = await Report.find(Report.child.id == child_id_obj).to_list()
                logger.info(f"Found {len(child_reports)} reports using Beanie query")
            except Exception as e:
                logger.warning(f"Beanie query failed, falling back to manual filter: {e}")
                child_reports = []
            
            # Fallback: fetch all and filter manually
            if not child_reports:
                all_reports = await Report.find_all().to_list()
                child_reports = []
                for r in all_reports:
                    r_child_id = extract_id_from_link(r.child) if hasattr(r, 'child') else None
                    if r_child_id == child_id_str:
                        child_reports.append(r)
                logger.info(f"Found {len(child_reports)} reports using manual filter")
            
            if not child_reports:
                # No reports found - return empty analytics
                logger.info(f"No reports found for child {child_id_str}. Returning empty analytics.")
                return EmotionAnalyticsResponse(
                    emotions=[],
                    most_common_emotion=None,
                    emotion_trends={},
                    emotional_analysis=None,
                    period_start=None,
                    period_end=None,
                    report_id=None
                )
            else:
                # Sort by generated_at descending and get most recent
                child_reports.sort(key=lambda x: x.generated_at, reverse=True)
                report = child_reports[0]
                logger.info(f"Using most recent report: {report.id}, generated at: {report.generated_at}")
        
        # Extract emotion data from report
        insights = report.insights or {}
        emotion_trends = insights.get("emotion_trends", {})
        most_common_emotion = insights.get("most_common_emotion", None)
        emotional_analysis = insights.get("emotional_analysis", None)
        
        # Convert emotion_trends dict to list format for pie chart
        # Format: [{name: "Happy", value: 10}, {name: "Sad", value: 5}, ...]
        emotions_list = []
        if emotion_trends and isinstance(emotion_trends, dict):
            for emotion_name, count in emotion_trends.items():
                if isinstance(count, (int, float)) and count > 0:
                    emotions_list.append({
                        "name": emotion_name.capitalize(),
                        "value": int(count)
                    })
        
        # Sort by value descending for better visualization
        emotions_list.sort(key=lambda x: x["value"], reverse=True)
        
        logger.info(f"Returning emotion analytics: {len(emotions_list)} emotions, most common: {most_common_emotion}")
        
        return EmotionAnalyticsResponse(
            emotions=emotions_list,
            most_common_emotion=most_common_emotion,
            emotion_trends=emotion_trends,
            emotional_analysis=emotional_analysis,
            period_start=report.period_start,
            period_end=report.period_end,
            report_id=str(report.id)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting emotion analytics: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get emotion analytics: {str(e)}"
        )

@router.post("/{child_id}/analyze-emotion-report", response_model=List[ChildTaskWithDetails])
async def analyze_emotion_report_and_generate_tasks(
    child_id: str,
    request: AnalyzeEmotionReportRequest = AnalyzeEmotionReportRequest(),
    child: Child = Depends(verify_child_ownership),
    current_user: User = Depends(verify_parent_token)
):
    """
    Analyze emotion report and generate new tasks based on the analysis.
    If report_id is provided, uses that specific report. Otherwise, uses the most recent report.
    Generates up to 20 tasks based on emotional patterns and insights.
    """
    try:
        # Get report (most recent if report_id not provided)
        report = None
        if request.report_id:
            report = await Report.get(request.report_id)
            if not report:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Report not found."
                )
            # Verify report belongs to child
            report_child_id = extract_id_from_link(report.child)
            if report_child_id != str(child.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Report does not belong to this child."
                )
        else:
            # Get most recent report for this child
            # Use same logic as get_reports endpoint
            child_id_str = str(child.id)
            logger.info(f"Looking for reports for child_id: {child_id_str}")
            
            # Try Beanie query first - use child ID instead of full object
            try:
                from beanie.operators import In
                # Use child ID for query instead of full Child object
                child_id_obj = child.id
                child_reports = await Report.find(Report.child.id == child_id_obj).to_list()
                logger.info(f"Found {len(child_reports)} reports using Beanie query")
            except Exception as e:
                logger.warning(f"Beanie query failed, falling back to manual filter: {e}")
                child_reports = []
            
            # Fallback: fetch all and filter manually
            if not child_reports:
                all_reports = await Report.find_all().to_list()
                logger.info(f"Total reports in database: {len(all_reports)}")
                child_reports = []
                for r in all_reports:
                    r_child_id = extract_id_from_link(r.child) if hasattr(r, 'child') else None
                    logger.debug(f"Report {r.id}: child_id={r_child_id}, target={child_id_str}")
                    if r_child_id == child_id_str:
                        child_reports.append(r)
                logger.info(f"Found {len(child_reports)} reports using manual filter")
            
            if not child_reports:
                # No reports found - automatically generate one
                logger.info(f"No reports found for child {child_id_str}. Auto-generating report...")
                try:
                    # Import the helper function from reports router
                    from app.routers.reports import _generate_report_internal
                    report = await _generate_report_internal(child)
                    logger.info(f"✅ Auto-generated report {report.id} for child {child_id_str}")
                    # Use the newly generated report
                except Exception as e:
                    logger.error(f"Failed to auto-generate report: {e}", exc_info=True)
                    # If auto-generation fails, return helpful error
                    error_detail = (
                        f"No reports found for this child (ID: {child_id_str}). "
                        "Failed to auto-generate report. Please generate a report first using the 'Generate Report' button."
                    )
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=error_detail
                    )
            else:
                # Sort by generated_at descending and get most recent
                child_reports.sort(key=lambda x: x.generated_at, reverse=True)
                report = child_reports[0]
                logger.info(f"Using most recent report: {report.id}, generated at: {report.generated_at}")
        
        # Get emotion data from report
        emotion_trends = report.insights.get("emotion_trends", {}) if report.insights else {}
        emotional_analysis = report.insights.get("emotional_analysis", "") if report.insights else ""
        most_common_emotion = report.insights.get("most_common_emotion", "Neutral") if report.insights else "Neutral"
        areas_for_improvement = report.insights.get("areas_for_improvement", []) if report.insights else []
        strengths = report.insights.get("strengths", []) if report.insights else []
        
        # Calculate age
        age = datetime.utcnow().year - child.birth_date.year
        if datetime.utcnow().month < child.birth_date.month or (
            datetime.utcnow().month == child.birth_date.month and 
            datetime.utcnow().day < child.birth_date.day
        ):
            age -= 1
        
        # Get existing tasks to avoid duplicates
        all_child_tasks = await get_child_tasks_by_child(child)
        existing_task_titles = set()
        for ct in all_child_tasks:
            if ct.task:
                task = await fetch_link_or_get_object(ct.task, Task)
                if task:
                    existing_task_titles.add(task.title.lower())
            elif ct.task_data:
                existing_task_titles.add(ct.task_data.title.lower())
            if ct.custom_title:
                existing_task_titles.add(ct.custom_title.lower())
        
        # Build prompt for LLM to generate tasks based on emotion analysis
        system_instruction = (
            "You are a child education expert specializing in emotional intelligence and task design. "
            "Based on emotion analysis from a child's report, generate appropriate tasks that address emotional needs and development areas. "
            "Return ONLY valid JSON array, no markdown, no extra text. Maximum 20 tasks."
        )
        
        prompt = f"""
CHILD INFORMATION:
- Name: {child.name}
- Age: {age}
- Interests: {', '.join(child.interests or []) or 'Not specified'}
- Strengths: {', '.join(strengths) or 'Not specified'}
- Areas for Improvement: {', '.join(areas_for_improvement) or 'Not specified'}

EMOTION ANALYSIS FROM REPORT:
- Most Common Emotion: {most_common_emotion}
- Emotion Trends: {json.dumps(emotion_trends, ensure_ascii=False)}
- Emotional Analysis: {emotional_analysis}

REPORT SUMMARY:
{report.summary_text}

REPORT SUGGESTIONS:
{json.dumps(report.suggestions, ensure_ascii=False, indent=2) if report.suggestions else 'None'}

EXISTING TASK TITLES (avoid duplicates):
{', '.join(list(existing_task_titles)[:20]) or 'None'}

REQUIREMENT:
Generate tasks (maximum 20) that:
1. Address the emotional patterns identified in the report
2. Support areas for improvement
3. Build on the child's strengths
4. Are appropriate for age {age}
5. Match the child's interests: {', '.join(child.interests or []) or 'General activities'}
6. Have unique titles (not in existing tasks list)

Return a JSON array of task objects. Each task must have:
{{
  "title": "Unique task title",
  "description": "Detailed description",
  "category": "One of: Independence, Logic, Physical, Creativity, Social, Academic",
  "type": "logic" or "emotion",
  "difficulty": 1-5,
  "suggested_age_range": "e.g., 6-10",
  "reward_coins": 0-1000,
  "unity_type": "life" or "choice" or "talk"
}}

Generate up to 20 tasks. Focus on emotional development and addressing the insights from the report.
"""
        
        # Call LLM
        logger.info(f"Analyzing emotion report and generating tasks for child {child.name}")
        llm_response = generate_openai_response(prompt, system_instruction, max_tokens=4000)
        
        # Parse JSON response
        try:
            # Clean response - remove markdown code blocks
            response_text = llm_response.strip()
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
            
            # Extract JSON array
            first_bracket = response_text.find('[')
            last_bracket = response_text.rfind(']')
            if first_bracket != -1 and last_bracket != -1 and last_bracket > first_bracket:
                response_text = response_text[first_bracket:last_bracket + 1]
            else:
                # Try to find JSON object instead
                first_brace = response_text.find('{')
                last_brace = response_text.rfind('}')
                if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
                    # Single object, wrap in array
                    response_text = '[' + response_text[first_brace:last_brace + 1] + ']'
            
            response_text = response_text.strip()
            
            # Remove trailing commas
            import re
            response_text = re.sub(r',\s*}', '}', response_text)
            response_text = re.sub(r',\s*]', ']', response_text)
            
            tasks_data = json.loads(response_text)
            
            if not isinstance(tasks_data, list):
                tasks_data = [tasks_data]
            
            # Limit to 20 tasks
            tasks_data = tasks_data[:20]
            
            logger.info(f"Parsed {len(tasks_data)} tasks from LLM response")
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response: {e}")
            logger.error(f"Response (first 1000 chars): {llm_response[:1000]}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to parse LLM response: {str(e)}"
            )
        
        # Create tasks
        created_tasks = []
        failed_count = 0
        skipped_count = 0
        inserted_count = 0  # Track how many tasks were actually inserted to DB
        
        for task_data in tasks_data:
            try:
                # Validate and normalize task data
                title = task_data.get("title", "Untitled Task").strip()
                if not title:
                    logger.warning(f"Skipping empty task title")
                    skipped_count += 1
                    continue
                
                if title.lower() in existing_task_titles:
                    logger.warning(f"Skipping duplicate task: {title}")
                    skipped_count += 1
                    continue
                
                # Validate category
                category_str = task_data.get("category", "Independence")
                try:
                    category = TaskCategory(category_str)
                except ValueError:
                    # Try to map common variations
                    category_mapping = {
                        "IQ": "IQ",
                        "EQ": "EQ"
                    }
                    if category_str in category_mapping:
                        category = TaskCategory(category_mapping[category_str])
                    else:
                        category = TaskCategory.INDEPENDENCE
                
                # Validate type
                type_str = task_data.get("type", "logic").lower()
                if type_str not in ["logic", "emotion"]:
                    type_str = "logic"
                task_type = TaskType(type_str)
                
                # Validate unity_type
                unity_type_str = task_data.get("unity_type", "life").lower()
                if unity_type_str not in ["life", "choice", "talk"]:
                    unity_type_str = "life"
                unity_type = TaskUnityType(unity_type_str)
                
                # Validate difficulty
                difficulty = int(task_data.get("difficulty", 3))
                if difficulty < 1:
                    difficulty = 1
                elif difficulty > 5:
                    difficulty = 5
                
                # Check if task already exists in library
                existing_task = await Task.find_one(Task.title == title)
                if not existing_task:
                    # Create new task in library
                    task = Task(
                        title=title,
                        description=task_data.get("description", ""),
                        category=category,
                        type=task_type,
                        difficulty=difficulty,
                        suggested_age_range=task_data.get("suggested_age_range", f"{age}-{age+2}"),
                        reward_coins=int(task_data.get("reward_coins", 50)),
                        reward_badge_name=task_data.get("reward_badge_name"),
                        unity_type=unity_type
                    )
                    await task.insert()
                else:
                    task = existing_task
                    # Update unity_type if not set
                    if not task.unity_type:
                        task.unity_type = unity_type
                        await task.save()
                
                # Create ChildTask with status='unassigned'
                child_task = ChildTask(
                    child=child,  # type: ignore
                    task=task,  # type: ignore
                    status=ChildTaskStatus.UNASSIGNED,
                    unity_type=ChildTaskUnityType(unity_type_str),
                    assigned_at=datetime.utcnow(),
                    priority=ChildTaskPriority.MEDIUM
                )
                await child_task.insert()
                inserted_count += 1  # Track successful insertions
                
                # Add to existing titles to avoid duplicates in this batch
                existing_task_titles.add(title.lower())
                
                # Build response - wrap in try-catch to handle serialization errors
                try:
                    created_tasks.append(
                    ChildTaskWithDetails(
                        id=str(child_task.id),
                        status=child_task.status,
                        assigned_at=child_task.assigned_at,
                        completed_at=child_task.completed_at,
                        priority=child_task.priority.value if child_task.priority else None,
                        due_date=child_task.due_date,
                        progress=child_task.progress,
                        notes=child_task.notes,
                        custom_title=child_task.custom_title,
                        custom_reward_coins=child_task.custom_reward_coins,
                        custom_category=child_task.custom_category,
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
                    logger.warning(f"Failed to build response for task {title}, but task was inserted: {e}")
                    # Task was inserted, just couldn't build response - continue
                    continue
                
            except Exception as e:
                logger.error(f"Failed to create task: {e}")
                logger.error(f"Task data: {json.dumps(task_data, ensure_ascii=False)}")
                failed_count += 1
                continue
        
        # Check if any tasks were actually inserted, even if response building failed
        if inserted_count == 0 and not created_tasks:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create any tasks. {failed_count} tasks failed, {skipped_count} tasks skipped (duplicates)."
            )
        
        # If tasks were inserted but response building failed, fetch from DB
        if inserted_count > 0 and len(created_tasks) == 0:
            logger.warning(f"Tasks were inserted ({inserted_count}) but response building failed. Fetching from DB...")
            try:
                # Fetch recently created unassigned tasks
                all_child_tasks = await get_child_tasks_by_child(child)
                recent_unassigned = [
                    ct for ct in all_child_tasks 
                    if ct.status == ChildTaskStatus.UNASSIGNED 
                    and ct.assigned_at and (datetime.utcnow() - ct.assigned_at).total_seconds() < 120
                ]
                recent_unassigned.sort(key=lambda x: x.assigned_at, reverse=True)
                
                # Build response from recent tasks
                for ct in recent_unassigned[:inserted_count]:
                    task = await fetch_link_or_get_object(ct.task, Task) if ct.task else None
                    if task:
                        try:
                            created_tasks.append(
                                ChildTaskWithDetails(
                                    id=str(ct.id),
                                    status=ct.status,
                                    assigned_at=ct.assigned_at,
                                    completed_at=ct.completed_at,
                                    priority=ct.priority.value if ct.priority else None,
                                    due_date=ct.due_date,
                                    progress=ct.progress or 0,
                                    notes=ct.notes,
                                    custom_title=ct.custom_title,
                                    custom_reward_coins=ct.custom_reward_coins,
                                    custom_category=ct.custom_category,
                                    unity_type=ct.unity_type.value if ct.unity_type else None,
                                    task=TaskPublic(
                                        id=str(task.id),
                                        title=task.title,
                                        description=task.description or "",
                                        category=task.category,
                                        type=task.type,
                                        difficulty=task.difficulty,
                                        suggested_age_range=task.suggested_age_range,
                                        reward_coins=task.reward_coins,
                                        reward_badge_name=task.reward_badge_name,
                                        unity_type=task.unity_type.value if task.unity_type else None,
                                    )
                                )
                            )
                        except Exception as e2:
                            logger.warning(f"Failed to build response for task {task.title}: {e2}")
                            continue
                
                if created_tasks:
                    logger.info(f"Successfully built response for {len(created_tasks)} tasks from DB")
            except Exception as e:
                logger.error(f"Failed to fetch tasks from DB: {e}", exc_info=True)
        
        # If we still have no tasks in response but tasks were inserted, return success with message
        if inserted_count > 0 and len(created_tasks) == 0:
            logger.warning(f"Tasks were inserted ({inserted_count}) but couldn't build response. Returning success message.")
            # Return empty list but with 200 status - frontend will refresh to see new tasks
            return []
        
        logger.info(f"✅ Created {len(created_tasks)} tasks from emotion report analysis (failed: {failed_count})")
        
        # Return created tasks - wrap in try-catch to handle serialization errors
        try:
            return created_tasks
        except Exception as e:
            logger.error(f"Error serializing response, but tasks were created: {e}", exc_info=True)
            # Tasks were already inserted, so return a simplified response
            # Fetch the created tasks again to build response
            try:
                all_child_tasks = await get_child_tasks_by_child(child)
                recent_unassigned = [
                    ct for ct in all_child_tasks 
                    if ct.status == ChildTaskStatus.UNASSIGNED 
                    and ct.assigned_at and (datetime.utcnow() - ct.assigned_at).total_seconds() < 60
                ]
                recent_unassigned.sort(key=lambda x: x.assigned_at, reverse=True)
                
                # Build simplified response from recent tasks
                simplified_tasks = []
                for ct in recent_unassigned[:len(created_tasks)]:
                    task = await fetch_link_or_get_object(ct.task, Task) if ct.task else None
                    if task:
                        simplified_tasks.append(
                            ChildTaskWithDetails(
                                id=str(ct.id),
                                status=ct.status,
                                assigned_at=ct.assigned_at,
                                completed_at=ct.completed_at,
                                priority=ct.priority.value if ct.priority else None,
                                due_date=ct.due_date,
                                progress=ct.progress or 0,
                                notes=ct.notes,
                                custom_title=ct.custom_title,
                                custom_reward_coins=ct.custom_reward_coins,
                                custom_category=ct.custom_category,
                                unity_type=ct.unity_type.value if ct.unity_type else None,
                                task=TaskPublic(
                                    id=str(task.id),
                                    title=task.title,
                                    description=task.description or "",
                                    category=task.category,
                                    type=task.type,
                                    difficulty=task.difficulty,
                                    suggested_age_range=task.suggested_age_range,
                                    reward_coins=task.reward_coins,
                                    reward_badge_name=task.reward_badge_name,
                                    unity_type=task.unity_type.value if task.unity_type else None,
                                )
                            )
                        )
                
                if simplified_tasks:
                    logger.info(f"Returning {len(simplified_tasks)} tasks from fallback response")
                    return simplified_tasks
            except Exception as e2:
                logger.error(f"Failed to build fallback response: {e2}", exc_info=True)
            
            # Last resort: raise error but tasks are already in DB
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Tasks were created but failed to return response. Please refresh to see new tasks. Error: {str(e)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing emotion report: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze emotion report and generate tasks: {str(e)}"
        )

# ============== SKILLS DEVELOPMENT UPDATE ==============

async def calculate_skills_from_task_history(child: Child, child_tasks: List[ChildTask]) -> Dict[str, int]:
    """
    Calculate skill scores based on task completion history.
    
    Logic:
    1. Get all completed tasks grouped by category
    2. Calculate completion rate and average difficulty for each category
    3. Map categories to skills:
       - Independence: Independence category tasks
       - Discipline: Independence category tasks (same as Independence)
       - Emotional: Social category tasks
       - Social: Social category tasks
       - Logic: Logic category tasks
    
    Returns: Dict with skill scores (0-100)
    """
    # Initialize skill scores with base values from initial_traits
    base_scores = {
        "independence": 50,
        "discipline": 50,
        "emotional": 50,
        "social": 50,
        "logic": 50
    }
    
    # Get base scores from initial_traits if available
    if child.initial_traits and "overall_traits" in child.initial_traits:
        traits = child.initial_traits["overall_traits"]
        base_scores = {
            "independence": traits.get("independence", 50),
            "discipline": traits.get("discipline", 50),
            "emotional": traits.get("emotional", 50),
            "social": traits.get("social", 50),
            "logic": traits.get("logic", 50)
        }
    
    # Group tasks by category
    category_stats: Dict[str, Dict[str, float]] = {}
    
    for ct in child_tasks:
        if not ct.task:
            continue
        
        task = await fetch_link_or_get_object(ct.task, Task)
        if not task or not isinstance(task, Task):
            continue
        
        # Normalize category
        category = task.category.value if hasattr(task.category, 'value') else str(task.category)
        if category == 'IQ':
            category = 'Logic'
        elif category == 'EQ':
            category = 'Social'
        
        if category not in category_stats:
            category_stats[category] = {
                'total': 0,
                'completed': 0,
                'total_difficulty': 0,
                'completed_difficulty': 0,
                'recent_completed': 0  # Completed in last 7 days
            }
        
        category_stats[category]['total'] += 1
        difficulty = task.difficulty if hasattr(task, 'difficulty') else 3
        category_stats[category]['total_difficulty'] += difficulty
        
        if ct.status == ChildTaskStatus.COMPLETED:
            category_stats[category]['completed'] += 1
            category_stats[category]['completed_difficulty'] += difficulty
            
            # Check if completed recently (last 7 days)
            if ct.completed_at:
                days_ago = (datetime.utcnow() - ct.completed_at).days
                if days_ago <= 7:
                    category_stats[category]['recent_completed'] += 1
    
    # Calculate skill improvements based on task completion
    # Independence and Discipline: from Independence category
    if 'Independence' in category_stats:
        stats = category_stats['Independence']
        if stats['total'] > 0:
            completion_rate = (stats['completed'] / stats['total']) * 100
            avg_difficulty = stats['completed_difficulty'] / stats['completed'] if stats['completed'] > 0 else 0
            recent_bonus = min(stats['recent_completed'] * 2, 10)  # Up to 10 points bonus for recent completions
            
            # Improvement = completion_rate * 0.5 + difficulty_bonus + recent_bonus
            improvement = (completion_rate * 0.5) + (avg_difficulty * 2) + recent_bonus
            base_scores["independence"] = min(100, int(base_scores["independence"] + improvement))
            base_scores["discipline"] = min(100, int(base_scores["discipline"] + improvement))
    
    # Social and Emotional: from Social category
    if 'Social' in category_stats:
        stats = category_stats['Social']
        if stats['total'] > 0:
            completion_rate = (stats['completed'] / stats['total']) * 100
            avg_difficulty = stats['completed_difficulty'] / stats['completed'] if stats['completed'] > 0 else 0
            recent_bonus = min(stats['recent_completed'] * 2, 10)
            
            improvement = (completion_rate * 0.5) + (avg_difficulty * 2) + recent_bonus
            base_scores["social"] = min(100, int(base_scores["social"] + improvement))
            base_scores["emotional"] = min(100, int(base_scores["emotional"] + improvement))
    
    # Logic: from Logic category
    if 'Logic' in category_stats:
        stats = category_stats['Logic']
        if stats['total'] > 0:
            completion_rate = (stats['completed'] / stats['total']) * 100
            avg_difficulty = stats['completed_difficulty'] / stats['completed'] if stats['completed'] > 0 else 0
            recent_bonus = min(stats['recent_completed'] * 2, 10)
            
            improvement = (completion_rate * 0.5) + (avg_difficulty * 2) + recent_bonus
            base_scores["logic"] = min(100, int(base_scores["logic"] + improvement))
    
    return base_scores

async def update_child_skills(child: Child) -> bool:
    """
    Update child's skills based on task completion history.
    Updates initial_traits.overall_traits with new calculated scores.
    
    Returns: True if updated, False if no update needed
    """
    try:
        # Get all child tasks
        child_tasks = await get_child_tasks_by_child(child)
        
        # Calculate new skill scores
        new_scores = await calculate_skills_from_task_history(child, child_tasks)
        
        # Get current scores for comparison
        current_scores = {}
        if child.initial_traits and "overall_traits" in child.initial_traits:
            current_scores = child.initial_traits["overall_traits"]
        
        # Check if there's a significant change (at least 1 point difference)
        has_changes = False
        for skill, new_value in new_scores.items():
            current_value = current_scores.get(skill, 50)
            if abs(new_value - current_value) >= 1:
                has_changes = True
                break
        
        if not has_changes:
            logger.debug(f"No significant skill changes for {child.name}, skipping update")
            return False
        
        # Update initial_traits
        if not child.initial_traits:
            child.initial_traits = {}
        
        if "overall_traits" not in child.initial_traits:
            child.initial_traits["overall_traits"] = {}
        
        # Update scores
        child.initial_traits["overall_traits"].update(new_scores)
        
        # Preserve other fields in initial_traits
        if "explanations" not in child.initial_traits:
            child.initial_traits["explanations"] = {}
        if "recommended_focus" not in child.initial_traits:
            child.initial_traits["recommended_focus"] = []
        
        await child.save()
        logger.info(f"✅ Updated skills for {child.name}: {new_scores}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to update skills for {child.name}: {e}", exc_info=True)
        return False

@router.post("/{child_id}/update-skills", response_model=Dict)
async def manual_update_skills(
    child_id: str,
    child: Child = Depends(verify_child_ownership),
    current_user: User = Depends(verify_parent_token)
):
    """
    Manually trigger skills update for a child.
    Useful for testing or immediate update.
    """
    try:
        updated = await update_child_skills(child)
        if updated:
            return {
                "message": "Skills updated successfully",
                "skills": child.initial_traits.get("overall_traits", {}) if child.initial_traits else {}
            }
        else:
            return {
                "message": "No significant changes detected, skills remain the same",
                "skills": child.initial_traits.get("overall_traits", {}) if child.initial_traits else {}
            }
    except Exception as e:
        logger.error(f"Error updating skills: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update skills: {str(e)}"
        )

async def update_skills_for_all_children():
    """
    Update skills for all children based on their task completion history.
    Called by scheduler daily.
    """
    from app.models.child_models import Child
    
    logger.info("🔄 Starting skills update for all children...")
    
    try:
        all_children = await Child.find_all().to_list()
        logger.info(f"Found {len(all_children)} children to process")
        
        updated_count = 0
        skipped_count = 0
        error_count = 0
        
        for child in all_children:
            try:
                updated = await update_child_skills(child)
                if updated:
                    updated_count += 1
                else:
                    skipped_count += 1
            except Exception as e:
                logger.error(f"Error updating skills for {child.name}: {e}")
                error_count += 1
                continue
        
        logger.info(f"✅ Skills update completed: {updated_count} updated, {skipped_count} skipped, {error_count} errors")
        
    except Exception as e:
        logger.error(f"Critical error in skills update: {e}", exc_info=True)
        raise
