from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.routers.reports import generate_weekly_reports
from app.routers.generate import generate_auto_tasks_for_all_children
from app.routers.dashboard import update_skills_for_all_children

scheduler = AsyncIOScheduler()

# Weekly report generation (Sunday at midnight)
scheduler.add_job(
    generate_weekly_reports,
    trigger=CronTrigger(day_of_week="sun", hour=0),
    id="weekly_report_job",
    replace_existing=True
)

# Auto-generate tasks for all children (daily at 8:00 AM)
scheduler.add_job(
    generate_auto_tasks_for_all_children,
    trigger=CronTrigger(hour=8, minute=0),  # 8:00 AM daily
    id="auto_generate_tasks_job",
    replace_existing=True
)

# Update skills for all children (daily at 9:00 AM, after task generation)
scheduler.add_job(
    update_skills_for_all_children,
    trigger=CronTrigger(hour=9, minute=0),  # 9:00 AM daily
    id="update_skills_job",
    replace_existing=True
)

scheduler.start()