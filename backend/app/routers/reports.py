from fastapi import APIRouter, HTTPException, status, Depends
from beanie import Link
from app.models.report_models import Report
from app.models.childtask_models import ChildTask, ChildTaskStatus
from app.models.task_models import Task
from app.models.interactionlog_models import InteractionLog
from app.schemas.schemas import ReportPublic
from app.dependencies import verify_child_ownership, extract_id_from_link, get_child_tasks_by_child, fetch_link_or_get_object
from app.models.child_models import Child
from app.services.llm import generate_openai_response
from app.models.user_models import User
from app.dependencies import verify_parent_token
from typing import List, Dict, Any
from datetime import datetime, timedelta
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/{child_id}", response_model=List[ReportPublic])
async def get_reports(
    child: Child = Depends(verify_child_ownership)
):
    """Get all reports for a child"""
    child_id_str = str(child.id)
    logger.info(f"Fetching reports for child_id: {child_id_str}")
    
    # Fetch all reports and filter by child_id
    all_reports = await Report.find_all().to_list()
    logger.info(f"Total reports in database: {len(all_reports)}")
    child_reports = []
    
    for report in all_reports:
        report_child_id = extract_id_from_link(report.child) if hasattr(report, 'child') else None
        logger.debug(f"Report {report.id}: child_id={report_child_id}, target={child_id_str}")
        if report_child_id == child_id_str:
            child_reports.append(report)
    
    logger.info(f"Found {len(child_reports)} reports for child {child_id_str}")
    
    return [
        ReportPublic(
            id=str(r.id),
            period_start=r.period_start,
            period_end=r.period_end,
            generated_at=r.generated_at,
            summary_text=r.summary_text,
            insights=r.insights,
            suggestions=r.suggestions,
        )
        for r in child_reports
    ]

@router.get("/{child_id}/{report_id}", response_model=ReportPublic)
async def get_report(
    child_id: str,
    report_id: str,
    child: Child = Depends(verify_child_ownership)
):
    report = await Report.get(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found."
        )

    link_child_id = extract_id_from_link(report.child)
    if link_child_id != str(child.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this report."
        )
    
    return ReportPublic(
        id=str(report.id),
        period_start=report.period_start,
        period_end=report.period_end,
        generated_at=report.generated_at,
        summary_text=report.summary_text,
        insights=report.insights,
        suggestions=report.suggestions,
    )

async def generate_weekly_reports():
    """Generate weekly reports for all children"""
    from datetime import timedelta
    
    children = await Child.find_all().to_list()
    for child in children:
        period_end = datetime.utcnow()
        period_start = period_end - timedelta(days=7)
        
        # Get all tasks and filter
        all_tasks = await ChildTask.find_all().to_list()
        child_id_str = str(child.id)
        tasks_completed = sum(
            1 for t in all_tasks
            if (extract_id_from_link(t.child) == child_id_str and
                t.status == ChildTaskStatus.COMPLETED and
                t.completed_at is not None and
                t.completed_at >= period_start and
                t.completed_at <= period_end)
        )
        
        new_report = Report(
            child=child,  # type: ignore
            period_start=period_start,
            period_end=period_end,
            summary_text=f"Weekly report for {child.name}. Completed {tasks_completed} tasks.",
            insights={"tasks_completed": tasks_completed},
            suggestions={"focus": "Continue practicing daily tasks"}
        )
        await new_report.insert()

async def _generate_report_internal(child: Child) -> Report:
    """
    Internal helper function to generate a report for a child.
    Can be called from other routers.
    """
    # Set period (last 7 days by default)
    period_end = datetime.utcnow()
    period_start = period_end - timedelta(days=7)
    
    # Collect task data
    all_child_tasks = await get_child_tasks_by_child(child)
    tasks_completed = [
        ct for ct in all_child_tasks 
        if ct.status == ChildTaskStatus.COMPLETED 
        and ct.completed_at 
        and period_start <= ct.completed_at <= period_end
    ]
    tasks_in_progress = [
        ct for ct in all_child_tasks 
        if ct.status in [ChildTaskStatus.ASSIGNED, ChildTaskStatus.IN_PROGRESS]
    ]
    tasks_given_up = [
        ct for ct in all_child_tasks 
        if ct.status == ChildTaskStatus.GIVEUP
        and ct.assigned_at
        and period_start <= ct.assigned_at <= period_end
    ]
    
    # Collect interaction logs and emotions
    all_logs = await InteractionLog.find_all().to_list()
    child_id_str = str(child.id)
    interaction_logs = []
    emotion_counts = {}
    
    for log in all_logs:
        log_child_id = extract_id_from_link(log.child) if hasattr(log, 'child') else None
        if log_child_id == child_id_str and period_start <= log.timestamp <= period_end:
            interaction_logs.append({
                "timestamp": log.timestamp.isoformat(),
                "user_input": log.user_input,
                "avatar_response": log.avatar_response,
                "detected_emotion": log.detected_emotion or "Neutral"
            })
            emotion = log.detected_emotion or "Neutral"
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    # Analyze task patterns for emotion inference
    # Group tasks by category and status to infer emotional state
    task_category_breakdown = {}
    for task in all_child_tasks:
        if task.assigned_at and period_start <= task.assigned_at <= period_end:
            # Get task category
            task_obj = await fetch_link_or_get_object(task.task, Task) if task.task else None
            category = task_obj.category.value if task_obj else (task.custom_category.value if task.custom_category else "Other")
            
            if category not in task_category_breakdown:
                task_category_breakdown[category] = {
                    "completed": 0,
                    "in_progress": 0,
                    "given_up": 0,
                    "total": 0
                }
            
            task_category_breakdown[category]["total"] += 1
            if task.status == ChildTaskStatus.COMPLETED:
                task_category_breakdown[category]["completed"] += 1
            elif task.status in [ChildTaskStatus.ASSIGNED, ChildTaskStatus.IN_PROGRESS]:
                task_category_breakdown[category]["in_progress"] += 1
            elif task.status == ChildTaskStatus.GIVEUP:
                task_category_breakdown[category]["given_up"] += 1
    
    # Calculate completion rate
    total_tasks_in_period = sum(stats["total"] for stats in task_category_breakdown.values())
    completed_tasks_in_period = sum(stats["completed"] for stats in task_category_breakdown.values())
    completion_rate = (completed_tasks_in_period / total_tasks_in_period * 100) if total_tasks_in_period > 0 else 0
    
    # Calculate age
    age = datetime.utcnow().year - child.birth_date.year
    if datetime.utcnow().month < child.birth_date.month or (
        datetime.utcnow().month == child.birth_date.month and 
        datetime.utcnow().day < child.birth_date.day
    ):
        age -= 1
    
    # Build context for LLM
    context_data = {
        "child_info": {
            "name": child.name,
            "nickname": child.nickname,
            "age": age,
            "personality": child.personality or [],
            "interests": child.interests or [],
            "strengths": child.strengths or [],
            "challenges": child.challenges or []
        },
        "period": {
            "start": period_start.isoformat(),
            "end": period_end.isoformat()
        },
        "tasks": {
            "completed": len(tasks_completed),
            "in_progress": len(tasks_in_progress),
            "given_up": len(tasks_given_up)
        },
        "emotions": emotion_counts,
        "interactions": {
            "total": len(interaction_logs),
            "recent_logs": interaction_logs[-10:] if len(interaction_logs) > 10 else interaction_logs
        }
    }
    
    # Use LLM to generate report
    system_instruction = (
        "You are an expert child development analyst specializing in emotional intelligence and behavioral patterns. "
        "Analyze the provided child data and generate a comprehensive report with insights and suggestions. "
        "IMPORTANT: Even if there are no recorded emotions from interactions, you MUST infer emotional state from: "
        "1. Task completion patterns (high completion = positive emotions, giveups = frustration) "
        "2. Task categories (Social/Creativity tasks suggest positive engagement, Academic difficulty may indicate stress) "
        "3. Completion rate trends (improving = confidence, declining = discouragement) "
        "4. Child's personality, interests, and strengths "
        "Always provide emotion_trends with at least 2-3 emotions inferred from task patterns, even if no direct emotion data exists. "
        "Return ONLY valid JSON, no markdown, no extra text."
    )
    
    # Build task details for emotion inference (only completed tasks in period)
    task_details = []
    for task in tasks_completed[:10]:  # Show up to 10 completed tasks
        task_obj = await fetch_link_or_get_object(task.task, Task) if task.task else None
        if task_obj:
            task_details.append({
                "title": task_obj.title,
                "category": task_obj.category.value,
                "difficulty": task_obj.difficulty,
                "completed_at": task.completed_at.isoformat() if task.completed_at else None
            })
    
    # If no tasks in period, use all tasks for context
    if total_tasks_in_period == 0:
        # Use all tasks for broader context
        all_tasks_for_context = [ct for ct in all_child_tasks if ct.status == ChildTaskStatus.COMPLETED]
        for task in all_tasks_for_context[:5]:  # Show up to 5 most recent completed tasks
            task_obj = await fetch_link_or_get_object(task.task, Task) if task.task else None
            if task_obj:
                task_details.append({
                    "title": task_obj.title,
                    "category": task_obj.category.value,
                    "difficulty": task_obj.difficulty,
                    "completed_at": task.completed_at.isoformat() if task.completed_at else None,
                    "note": "Completed outside this period"
                })
    
    prompt = f"""
Analyze the following child data and generate a comprehensive report:

CHILD INFORMATION:
- Name: {child.name}
- Age: {age}
- Personality: {', '.join(child.personality or []) or 'Not specified'}
- Interests: {', '.join(child.interests or []) or 'Not specified'}
- Strengths: {', '.join(child.strengths or []) or 'Not specified'}
- Challenges: {', '.join(child.challenges or []) or 'Not specified'}

PERIOD: {period_start.strftime('%Y-%m-%d')} to {period_end.strftime('%Y-%m-%d')}

TASK STATISTICS:
- Completed: {len(tasks_completed)} (Completion Rate: {completion_rate:.1f}%)
- In Progress: {len(tasks_in_progress)}
- Given Up: {len(tasks_given_up)}

TASK BREAKDOWN BY CATEGORY:
{json.dumps(task_category_breakdown, ensure_ascii=False, indent=2)}

RECENT COMPLETED TASKS (for emotion inference):
{json.dumps(task_details, ensure_ascii=False, indent=2)}

RECORDED EMOTIONS FROM INTERACTIONS:
{json.dumps(emotion_counts, ensure_ascii=False, indent=2) if emotion_counts else "No recorded emotions from interactions in this period."}

RECENT INTERACTIONS (last 10):
{json.dumps(interaction_logs[-10:] if len(interaction_logs) > 10 else interaction_logs, ensure_ascii=False, indent=2) if interaction_logs else "No interactions recorded in this period."}

EMOTION INFERENCE GUIDELINES:
1. If recorded emotions exist: Use them as primary source, but also consider task patterns for context
2. If NO recorded emotions: Infer emotions from task patterns:
   - High completion rate (>70%) + mostly Social/Creativity tasks → Happy, Excited, Confident
   - High completion rate + Academic/Logic tasks → Proud, Satisfied, Determined
   - Low completion rate (<50%) or many giveups → Frustrated, Discouraged, but also check if tasks are too difficult
   - Improving completion rate over time → Growing confidence, Positive
   - Many in-progress tasks → Engaged, Curious, Motivated
   - Mix of categories completed → Balanced, Well-rounded, Content
3. Consider child's personality: Active child completing Physical tasks → Energetic, Happy
4. Consider age-appropriateness: Age-appropriate tasks completed → Confident, Successful
5. ALWAYS provide at least 2-3 emotions with estimated percentages, even if inferred

Generate a report with the following structure (JSON only):
{{
  "summary_text": "A comprehensive summary of the child's progress and emotional state (2-3 paragraphs). If no direct emotion data, infer from task patterns.",
  "insights": {{
    "tasks_completed": {len(tasks_completed)},
    "tasks_verified": {len([t for t in tasks_completed if t.completed_at])},
    "emotion_trends": {{
      "MUST provide a dictionary with at least 2-3 emotions and their estimated counts/percentages. "
      "If no recorded emotions, infer from task completion patterns. "
      "Example: {{'Happy': 40, 'Confident': 30, 'Engaged': 20}} or {{'Frustrated': 30, 'Determined': 25, 'Neutral': 20}} "
      "based on task patterns. Use percentages that add up to roughly 100."
    }},
    "most_common_emotion": "The most frequently detected emotion OR the most likely inferred emotion from task patterns. NEVER return 'N/A' or 'None'.",
    "emotional_analysis": "Detailed analysis of emotional patterns. If no recorded emotions, analyze inferred emotions from task completion patterns, categories, and completion rates. Explain what the task patterns suggest about the child's emotional state. NEVER say 'lack of recorded emotions' - instead, explain what the task data indicates about their feelings.",
    "task_performance": "Analysis of task completion patterns, including which categories show strength and which need support",
    "strengths": ["List of observed strengths based on task completion and patterns"],
    "areas_for_improvement": ["List of areas that need attention"]
  }},
  "suggestions": {{
    "focus": "Main focus area for next period",
    "recommended_activities": ["List of recommended activities"],
    "parenting_tips": ["List of parenting tips based on the analysis"],
    "emotional_support": "Specific suggestions for emotional support based on inferred or recorded emotions"
  }}
}}
"""
    
    # Call LLM
    llm_response = generate_openai_response(prompt, system_instruction, max_tokens=2000)
    
    # Parse JSON response
    try:
        # Clean response
        response_text = llm_response.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        report_data = json.loads(response_text)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM response as JSON: {llm_response}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse report data: {str(e)}"
        )
    
    # Ensure insights exist
    insights = report_data.get("insights", {})
    
    # Fallback: If no emotion_trends or empty, infer from task patterns
    emotion_trends = insights.get("emotion_trends", {})
    if not emotion_trends or (isinstance(emotion_trends, dict) and len(emotion_trends) == 0):
        logger.info(f"No emotion_trends from LLM, inferring from task patterns for child {child.name}")
        # Infer emotions from task completion patterns
        inferred_emotions = {}
        
        if completion_rate >= 70:
            # High completion rate suggests positive emotions
            if task_category_breakdown.get("Social", {}).get("completed", 0) > 0:
                inferred_emotions["Happy"] = 40
                inferred_emotions["Confident"] = 30
            elif task_category_breakdown.get("Creativity", {}).get("completed", 0) > 0:
                inferred_emotions["Excited"] = 35
                inferred_emotions["Engaged"] = 30
            else:
                inferred_emotions["Satisfied"] = 35
                inferred_emotions["Proud"] = 25
            inferred_emotions["Motivated"] = 20
        elif completion_rate >= 50:
            # Moderate completion rate
            inferred_emotions["Determined"] = 30
            inferred_emotions["Neutral"] = 25
            if len(tasks_given_up) > 0:
                inferred_emotions["Frustrated"] = 20
            else:
                inferred_emotions["Hopeful"] = 20
            inferred_emotions["Persistent"] = 15
        else:
            # Low completion rate
            if len(tasks_given_up) > len(tasks_completed):
                inferred_emotions["Frustrated"] = 35
                inferred_emotions["Discouraged"] = 25
            else:
                inferred_emotions["Challenged"] = 30
                inferred_emotions["Determined"] = 25
            inferred_emotions["Neutral"] = 20
            inferred_emotions["Hopeful"] = 15
        
        # Normalize to percentages (roughly)
        total = sum(inferred_emotions.values())
        if total > 0:
            emotion_trends = {k: int((v / total) * 100) for k, v in inferred_emotions.items()}
        else:
            # Ultimate fallback: neutral state
            emotion_trends = {"Neutral": 50, "Calm": 30, "Content": 20}
        
        logger.info(f"Inferred emotion_trends: {emotion_trends}")
        insights["emotion_trends"] = emotion_trends
    
    # Ensure most_common_emotion exists
    if not insights.get("most_common_emotion") or insights.get("most_common_emotion") in ["N/A", "None", "null"]:
        if emotion_trends and isinstance(emotion_trends, dict):
            most_common = max(emotion_trends.items(), key=lambda x: x[1])[0] if emotion_trends else "Neutral"
            insights["most_common_emotion"] = most_common
        else:
            insights["most_common_emotion"] = "Neutral"
    
    # Ensure emotional_analysis doesn't say "lack of recorded emotions"
    emotional_analysis = insights.get("emotional_analysis", "")
    if "lack of recorded emotions" in emotional_analysis.lower() or "cannot be performed" in emotional_analysis.lower():
        # Replace with task-based analysis
        if completion_rate >= 70:
            insights["emotional_analysis"] = (
                f"Based on task completion patterns, {child.name} shows strong positive engagement. "
                f"With a {completion_rate:.1f}% completion rate, the child demonstrates {insights.get('most_common_emotion', 'positive')} emotions "
                f"and consistent motivation. The variety of completed tasks across different categories suggests "
                f"a well-rounded emotional state and healthy curiosity."
            )
        elif completion_rate >= 50:
            insights["emotional_analysis"] = (
                f"Task completion patterns indicate {child.name} is working through challenges with determination. "
                f"The {completion_rate:.1f}% completion rate shows persistence, though some tasks may be more challenging. "
                f"The child appears {insights.get('most_common_emotion', 'focused')} and committed to improvement."
            )
        else:
            insights["emotional_analysis"] = (
                f"Task patterns suggest {child.name} may be facing some challenges, with a {completion_rate:.1f}% completion rate. "
                f"This could indicate the need for more age-appropriate tasks or additional support. "
                f"The child shows {insights.get('most_common_emotion', 'resilience')} in continuing to attempt tasks."
            )
    
    # Update insights with fallback values
    report_data["insights"] = insights
    
    # Create report
    new_report = Report(
        child=Link(child, Child),
        period_start=period_start,
        period_end=period_end,
        generated_at=datetime.utcnow(),
        summary_text=report_data.get("summary_text", ""),
        insights=insights,
        suggestions=report_data.get("suggestions", {})
    )
    await new_report.insert()
    child_id_str = str(child.id)
    logger.info(f"Generated report {new_report.id} for child {child_id_str}")
    
    return new_report

@router.post("/{child_id}/generate", response_model=ReportPublic)
async def generate_report(
    child_id: str,
    child: Child = Depends(verify_child_ownership),
    current_user: User = Depends(verify_parent_token)
):
    """
    Generate a comprehensive report about a child.
    Collects data from tasks, interactions, and emotions, then uses LLM to analyze and create insights.
    """
    try:
        new_report = await _generate_report_internal(child)
        
        logger.info(f"✅ Generated report for child {child.name} (ID: {child_id})")
        
        return ReportPublic(
            id=str(new_report.id),
            period_start=new_report.period_start,
            period_end=new_report.period_end,
            generated_at=new_report.generated_at,
            summary_text=new_report.summary_text,
            insights=new_report.insights,
            suggestions=new_report.suggestions
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating report: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {str(e)}"
        )
