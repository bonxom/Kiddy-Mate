from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime
import enum

# Import enums from models for consistency
from app.models.task_models import TaskCategory, TaskType
from app.models.childtask_models import ChildTaskStatus
from app.models.reward_models import RewardType

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class UserPublic(UserInDB):
    pass

class ChildBase(BaseModel):
    name: str
    birth_date: datetime
    initial_traits: Optional[dict]

class ChildCreate(ChildBase):
    pass

class ChildInDB(ChildBase):
    id: str
    current_coins: int
    level: int
    model_config = ConfigDict(from_attributes=True)

class ChildPublic(ChildInDB):
    pass

###### Store answers of parents
class DisciplineAutonomyAnswers(BaseModel):
    completes_personal_tasks: Optional[str] = None
    keeps_personal_space_tidy: Optional[str] = None
    finishes_simple_chores: Optional[str] = None
    follows_screen_time_rules: Optional[str] = None
    struggles_with_activity_transitions: Optional[str] = None

class EmotionalIntelligenceAnswers(BaseModel):
    expresses_big_emotions_with_aggression: Optional[str] = None
    verbalizes_emotions: Optional[str] = None
    shows_empathy: Optional[str] = None
    displays_excessive_worry: Optional[str] = None
    owns_mistakes: Optional[str] = None

class SocialInteractionAnswers(BaseModel):
    joins_peer_groups_confidently: Optional[str] = None
    shares_and_waits_turns: Optional[str] = None
    resolves_conflict_with_words: Optional[str] = None
    prefers_solo_play: Optional[str] = None
    asks_for_help_politely: Optional[str] = None
#########

class ChildAssessmentBase(BaseModel):
    discipline_autonomy: DisciplineAutonomyAnswers
    emotional_intelligence: EmotionalIntelligenceAnswers
    social_interaction: SocialInteractionAnswers

class ChildAssessmentCreate(ChildAssessmentBase):
    pass

class ChildAssessmentUpdate(BaseModel):
    discipline_autonomy: Optional[DisciplineAutonomyAnswers] = None
    emotional_intelligence: Optional[EmotionalIntelligenceAnswers] = None
    social_interaction: Optional[SocialInteractionAnswers] = None

class ChildAssessmentInDB(ChildAssessmentBase):
    id: str
    child_id: str
    parent_id: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class ChildAssessmentPublic(ChildAssessmentInDB):
    pass

class TaskBase(BaseModel):
    title: str
    description: str
    category: TaskCategory
    type: TaskType
    difficulty: int
    suggested_age_range: str

class TaskCreate(TaskBase):
    pass

class TaskInDB(TaskBase):
    id: str
    reward_coins: int = 50
    reward_badge_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class TaskPublic(TaskInDB):
    pass

class ChildTaskBase(BaseModel):
    status: ChildTaskStatus
    assigned_at: datetime
    completed_at: Optional[datetime]

class ChildTaskCreate(ChildTaskBase):
    child_id: int
    task_id: int

class ChildTaskInDB(ChildTaskBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class ChildTaskPublic(ChildTaskInDB):
    pass

class ChildTaskWithDetails(BaseModel):
    """Child task with populated task details for dashboard"""
    id: str
    status: ChildTaskStatus
    assigned_at: datetime
    completed_at: Optional[datetime]
    task: TaskPublic  # Full task details
    model_config = ConfigDict(from_attributes=True)

class RewardBase(BaseModel):
    name: str
    description: str
    type: RewardType
    image_url: Optional[str]

class RewardCreate(RewardBase):
    pass

class RewardInDB(RewardBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class RewardPublic(RewardInDB):
    pass

class ChildRewardBase(BaseModel):
    earned_at: datetime

class ChildRewardCreate(ChildRewardBase):
    child_id: int
    reward_id: int

class ChildRewardInDB(ChildRewardBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class ChildRewardPublic(ChildRewardInDB):
    pass

class MiniGameBase(BaseModel):
    name: str
    description: str
    linked_skill: str

class MiniGameCreate(MiniGameBase):
    pass

class MiniGameInDB(MiniGameBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class MiniGamePublic(MiniGameInDB):
    pass

class GameSessionBase(BaseModel):
    start_time: datetime
    end_time: Optional[datetime]
    score: Optional[int]
    behavior_data: Optional[dict]

class GameSessionCreate(GameSessionBase):
    child_id: int
    game_id: int

class GameSessionInDB(GameSessionBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class GameSessionPublic(GameSessionInDB):
    pass

class InteractionLogBase(BaseModel):
    timestamp: datetime
    user_input: str
    avatar_response: str
    detected_emotion: Optional[str]

class InteractionLogCreate(InteractionLogBase):
    child_id: int

class InteractionLogInDB(InteractionLogBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class InteractionLogPublic(InteractionLogInDB):
    pass

class ReportBase(BaseModel):
    period_start: datetime
    period_end: datetime
    generated_at: datetime
    summary_text: str
    insights: Optional[dict]
    suggestions: Optional[dict]

class ReportCreate(ReportBase):
    child_id: int

class ReportInDB(ReportBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class ReportPublic(ReportInDB):
    pass