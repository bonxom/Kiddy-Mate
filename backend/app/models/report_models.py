from beanie import Document, Link
from datetime import datetime
from typing import Optional, Dict
from app.models.child_models import Child

class Report(Document):
    child: Link[Child]
    period_start: datetime
    period_end: datetime
    generated_at: datetime = datetime.utcnow()
    summary_text: str
    insights: Optional[Dict]
    suggestions: Optional[Dict]

    class Settings:
        name = "reports"