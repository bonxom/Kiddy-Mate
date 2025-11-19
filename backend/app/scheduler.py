from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.routers.reports import generate_weekly_reports

scheduler = AsyncIOScheduler()

scheduler.add_job(
    generate_weekly_reports,
    trigger=CronTrigger(day_of_week="sun", hour=0),
    id="weekly_report_job",
    replace_existing=True
)
scheduler.start()