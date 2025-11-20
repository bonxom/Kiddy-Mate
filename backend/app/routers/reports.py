from fastapi import APIRouter, HTTPException, status, Depends
from app.models.report_models import Report
from app.models.childtask_models import ChildTask, ChildTaskStatus
from app.schemas.schemas import ReportPublic
from app.dependencies import verify_child_ownership
from app.models.child_models import Child
from typing import List
from datetime import datetime

router = APIRouter()

@router.get("/reports/{child_id}", response_model=List[ReportPublic])
async def get_reports(
    child: Child = Depends(verify_child_ownership)
):
    reports = await Report.find(Report.child.id == child.id).to_list()
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
        for r in reports
    ]

@router.get("/reports/{child_id}/{report_id}", response_model=ReportPublic)
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

    link_child_id = None
    if getattr(report.child, "id", None) is not None:
        link_child_id = str(report.child.id)
    elif getattr(report.child, "ref", None) is not None:
        ref_obj = report.child.ref
        link_child_id = str(getattr(ref_obj, "id", ref_obj))
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
        
        tasks_completed = await ChildTask.find(
            ChildTask.child.id == child.id,
            ChildTask.status == ChildTaskStatus.COMPLETED,
            ChildTask.completed_at >= period_start,
            ChildTask.completed_at <= period_end
        ).count()
        
        new_report = Report(
            child=child,
            period_start=period_start,
            period_end=period_end,
            summary_text=f"Weekly report for {child.name}. Completed {tasks_completed} tasks.",
            insights={"tasks_completed": tasks_completed},
            suggestions={"focus": "Continue practicing daily tasks"}
        )
        await new_report.insert()
