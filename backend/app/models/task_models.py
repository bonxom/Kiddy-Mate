from beanie import Document
from typing import Optional
import enum

class TaskCategory(str, enum.Enum):
    INDEPENDENCE = "Independence"
    LOGIC = "Logic"
    PHYSICAL = "Physical"
    CREATIVITY = "Creativity"
    SOCIAL = "Social"
    ACADEMIC = "Academic"
    # Backward compatibility
    IQ = "IQ"
    EQ = "EQ"

class TaskType(str, enum.Enum):
    LOGIC = "logic"
    EMOTION = "emotion"

class Task(Document):
    title: str
    description: str
    category: TaskCategory
    type: TaskType
    difficulty: int
    suggested_age_range: str
    reward_coins: int = 50
    reward_badge_name: Optional[str] = None

    class Settings:
        name = "tasks"  