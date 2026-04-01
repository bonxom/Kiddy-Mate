from beanie import Document, Link
from datetime import datetime
from typing import Optional, Dict
from pydantic import Field

from app.core.time import utc_now
from app.models.child_models import Child

class Report(Document):
    child: Link[Child]
    period_start: datetime
    period_end: datetime
    generated_at: datetime = Field(default_factory=utc_now)
    summary_text: str
    insights: Optional[Dict]
    suggestions: Optional[Dict]

    class Settings:
        name = "reports"
