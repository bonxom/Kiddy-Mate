from app.scheduler import scheduler


async def startup_scheduler() -> None:
    """Start APScheduler only once during app startup."""
    if not scheduler.running:
        scheduler.start()


async def shutdown_scheduler() -> None:
    """Shutdown APScheduler gracefully when the app stops."""
    if scheduler.running:
        scheduler.shutdown()
