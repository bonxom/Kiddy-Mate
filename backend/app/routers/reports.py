from fastapi import APIRouter, HTTPException, status, Depends
from beanie import Link
from app.models.report_models import Report
from app.models.childtask_models import ChildTask, ChildTaskStatus
from app.models.interactionlog_models import InteractionLog
from app.schemas.schemas import ReportPublic
from app.dependencies import verify_child_ownership, extract_id_from_link, get_child_tasks_by_child
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
            "You are an expert child development analyst. "
            "Analyze the provided child data and generate a comprehensive report with insights and suggestions. "
            "Focus on emotional patterns, task completion patterns, and areas for improvement. "
            "Return ONLY valid JSON, no markdown, no extra text."
        )
        
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
- Completed: {len(tasks_completed)}
- In Progress: {len(tasks_in_progress)}
- Given Up: {len(tasks_given_up)}

EMOTION DISTRIBUTION:
{json.dumps(emotion_counts, ensure_ascii=False, indent=2)}

RECENT INTERACTIONS (last 10):
{json.dumps(interaction_logs[-10:] if len(interaction_logs) > 10 else interaction_logs, ensure_ascii=False, indent=2)}

Generate a report with the following structure (JSON only):
{{
  "summary_text": "A comprehensive summary of the child's progress and emotional state (2-3 paragraphs)",
  "insights": {{
    "tasks_completed": {len(tasks_completed)},
    "tasks_verified": {len([t for t in tasks_completed if t.completed_at])},
    "emotion_trends": {json.dumps(emotion_counts, ensure_ascii=False)},
    "most_common_emotion": "The most frequently detected emotion",
    "emotional_analysis": "Detailed analysis of emotional patterns and what they indicate",
    "task_performance": "Analysis of task completion patterns",
    "strengths": ["List of observed strengths"],
    "areas_for_improvement": ["List of areas that need attention"]
  }},
  "suggestions": {{
    "focus": "Main focus area for next period",
    "recommended_activities": ["List of recommended activities"],
    "parenting_tips": ["List of parenting tips based on the analysis"],
    "emotional_support": "Specific suggestions for emotional support"
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
            
            # Create and save report
            new_report = Report(
                child=child,  # type: ignore
                period_start=period_start,
                period_end=period_end,
                generated_at=datetime.utcnow(),
                summary_text=report_data.get("summary_text", f"Report for {child.name}"),
                insights=report_data.get("insights", {}),
                suggestions=report_data.get("suggestions", {})
            )
            await new_report.insert()
            
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
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response: {e}")
            logger.error(f"Response: {llm_response[:500]}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to parse LLM response: {str(e)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating report: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {str(e)}"
        )
