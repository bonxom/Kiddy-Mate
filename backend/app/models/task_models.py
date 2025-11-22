from beanie import Document
from typing import Optional
import enum

class UnityType(str, enum.Enum):
    LIFE = "life"           
    CHOICE = "choice"       
    TALK = "talk"           

class TaskCategory(str, enum.Enum):
    INDEPENDENCE = "Independence"
    LOGIC = "Logic"
    PHYSICAL = "Physical"
    CREATIVITY = "Creativity"
    SOCIAL = "Social"
    ACADEMIC = "Academic"
    
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
    unity_type: Optional[UnityType] = None  

    class Settings:
        name = "tasks"  