from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional
from datetime import datetime
import enum


from app.models.task_models import TaskCategory, TaskType
from app.models.childtask_models import ChildTaskStatus, ChildTaskPriority
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
    initial_traits: Optional[dict] = None
    nickname: Optional[str] = None
    gender: Optional[str] = None
    avatar_url: Optional[str] = None
    personality: Optional[list[str]] = None
    interests: Optional[list[str]] = None
    strengths: Optional[list[str]] = None
    challenges: Optional[list[str]] = None

class ChildCreate(ChildBase):
    pass

class ChildUpdate(BaseModel):
    """Schema for updating child profile - all fields optional"""
    name: Optional[str] = None
    birth_date: Optional[datetime] = None
    initial_traits: Optional[dict] = None
    nickname: Optional[str] = None
    gender: Optional[str] = None
    avatar_url: Optional[str] = None
    personality: Optional[list[str]] = None
    interests: Optional[list[str]] = None
    strengths: Optional[list[str]] = None
    challenges: Optional[list[str]] = None

class ChildInDB(ChildBase):
    id: str
    current_coins: int
    level: int
    model_config = ConfigDict(from_attributes=True)

class ChildPublic(ChildInDB):
    nickname: Optional[str] = None
    gender: Optional[str] = None
    avatar_url: Optional[str] = None
    personality: Optional[list[str]] = None
    interests: Optional[list[str]] = None
    strengths: Optional[list[str]] = None
    challenges: Optional[list[str]] = None


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


class ChildAssessmentBase(BaseModel):
    discipline_autonomy: DisciplineAutonomyAnswers
    emotional_intelligence: EmotionalIntelligenceAnswers
    social_interaction: SocialInteractionAnswers

class ChildAssessmentCreate(ChildAssessmentBase):
    pass


class SimpleAssessmentCreate(BaseModel):
    """Simplified assessment schema with simple scores (1-10)"""
    logic_score: Optional[int] = Field(None, ge=1, le=10, description="Logic/Problem-solving score (1-10)")
    independence_score: Optional[int] = Field(None, ge=1, le=10, description="Independence score (1-10)")
    emotional_score: Optional[int] = Field(None, ge=1, le=10, description="Emotional intelligence score (1-10)")
    discipline_score: Optional[int] = Field(None, ge=1, le=10, description="Discipline/Autonomy score (1-10)")
    social_score: Optional[int] = Field(None, ge=1, le=10, description="Social interaction score (1-10)")
    notes: Optional[str] = None
    
    def to_detailed_assessment(self) -> ChildAssessmentCreate:
        """Convert simple scores to detailed assessment format"""
        
        def score_to_frequency(score: Optional[int]) -> str:
            if score is None:
                return "sometimes"
            if score <= 3:
                return "rarely"
            elif score <= 7:
                return "sometimes"
            else:
                return "often"
        
        
        discipline_score = self.discipline_score or 5
        emotional_score = self.emotional_score or 5
        social_score = self.social_score or 5
        
        discipline_freq = score_to_frequency(discipline_score)
        emotional_freq = score_to_frequency(emotional_score)
        social_freq = score_to_frequency(social_score)
        
        return ChildAssessmentCreate(
            discipline_autonomy=DisciplineAutonomyAnswers(
                completes_personal_tasks=discipline_freq,
                keeps_personal_space_tidy=discipline_freq,
                finishes_simple_chores=discipline_freq,
                follows_screen_time_rules=discipline_freq,
                struggles_with_activity_transitions="rarely" if discipline_score >= 7 else "sometimes"
            ),
            emotional_intelligence=EmotionalIntelligenceAnswers(
                expresses_big_emotions_with_aggression="rarely" if emotional_score >= 7 else "sometimes",
                verbalizes_emotions=emotional_freq,
                shows_empathy=emotional_freq,
                displays_excessive_worry="rarely" if emotional_score >= 7 else "sometimes",
                owns_mistakes=emotional_freq
            ),
            social_interaction=SocialInteractionAnswers(
                joins_peer_groups_confidently=social_freq,
                shares_and_waits_turns=social_freq,
                resolves_conflict_with_words=social_freq,
                prefers_solo_play="rarely" if social_score >= 7 else "sometimes",
                asks_for_help_politely=social_freq
            )
        )

class ChildAssessmentUpdate(BaseModel):
    discipline_autonomy: Optional[DisciplineAutonomyAnswers] = None
    emotional_intelligence: Optional[EmotionalIntelligenceAnswers] = None
    social_interaction: Optional[SocialInteractionAnswers] = None


class SimpleAssessmentUpdate(BaseModel):
    """Simplified assessment update schema with simple scores (1-10)"""
    logic_score: Optional[int] = Field(None, ge=1, le=10, description="Logic/Problem-solving score (1-10)")
    independence_score: Optional[int] = Field(None, ge=1, le=10, description="Independence score (1-10)")
    emotional_score: Optional[int] = Field(None, ge=1, le=10, description="Emotional intelligence score (1-10)")
    discipline_score: Optional[int] = Field(None, ge=1, le=10, description="Discipline/Autonomy score (1-10)")
    social_score: Optional[int] = Field(None, ge=1, le=10, description="Social interaction score (1-10)")
    notes: Optional[str] = None
    
    def to_detailed_update(self, existing_assessment: 'ChildDevelopmentAssessment') -> ChildAssessmentUpdate:
        """Convert simple scores to detailed assessment update format"""
        from app.models.child_models import ChildDevelopmentAssessment
        
        
        def score_to_frequency(score: Optional[int]) -> str:
            if score is None:
                return "sometimes"
            if score <= 3:
                return "rarely"
            elif score <= 7:
                return "sometimes"
            else:
                return "often"
        
        
        existing_da = existing_assessment.discipline_autonomy or {}
        existing_ei = existing_assessment.emotional_intelligence or {}
        existing_si = existing_assessment.social_interaction or {}
        
        
        discipline_autonomy = None
        emotional_intelligence = None
        social_interaction = None
        
        if self.discipline_score is not None:
            discipline_freq = score_to_frequency(self.discipline_score)
            discipline_autonomy = DisciplineAutonomyAnswers(
                completes_personal_tasks=discipline_freq,
                keeps_personal_space_tidy=discipline_freq,
                finishes_simple_chores=discipline_freq,
                follows_screen_time_rules=discipline_freq,
                struggles_with_activity_transitions="rarely" if self.discipline_score >= 7 else "sometimes"
            )
        
        if self.emotional_score is not None:
            emotional_freq = score_to_frequency(self.emotional_score)
            emotional_intelligence = EmotionalIntelligenceAnswers(
                expresses_big_emotions_with_aggression="rarely" if self.emotional_score >= 7 else "sometimes",
                verbalizes_emotions=emotional_freq,
                shows_empathy=emotional_freq,
                displays_excessive_worry="rarely" if self.emotional_score >= 7 else "sometimes",
                owns_mistakes=emotional_freq
            )
        
        if self.social_score is not None:
            social_freq = score_to_frequency(self.social_score)
            social_interaction = SocialInteractionAnswers(
                joins_peer_groups_confidently=social_freq,
                shares_and_waits_turns=social_freq,
                resolves_conflict_with_words=social_freq,
                prefers_solo_play="rarely" if self.social_score >= 7 else "sometimes",
                asks_for_help_politely=social_freq
            )
        
        
        if self.logic_score is not None:
            
            logic_freq = score_to_frequency(self.logic_score)
            if discipline_autonomy is None:
                
                discipline_autonomy = DisciplineAutonomyAnswers(
                    completes_personal_tasks=logic_freq,
                    keeps_personal_space_tidy=logic_freq,
                    finishes_simple_chores=logic_freq,
                    follows_screen_time_rules=logic_freq,
                    struggles_with_activity_transitions="rarely" if self.logic_score >= 7 else "sometimes"
                )
            else:
                
                discipline_autonomy.completes_personal_tasks = logic_freq
                discipline_autonomy.finishes_simple_chores = logic_freq
        
        if self.independence_score is not None:
            
            independence_freq = score_to_frequency(self.independence_score)
            if discipline_autonomy is None:
                discipline_autonomy = DisciplineAutonomyAnswers(
                    completes_personal_tasks=independence_freq,
                    keeps_personal_space_tidy=independence_freq,
                    finishes_simple_chores=independence_freq,
                    follows_screen_time_rules=independence_freq,
                    struggles_with_activity_transitions="rarely" if self.independence_score >= 7 else "sometimes"
                )
            else:
                
                discipline_autonomy.completes_personal_tasks = independence_freq
                discipline_autonomy.keeps_personal_space_tidy = independence_freq
        
        return ChildAssessmentUpdate(
            discipline_autonomy=discipline_autonomy,
            emotional_intelligence=emotional_intelligence,
            social_interaction=social_interaction
        )

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
    reward_coins: Optional[int] = 50
    reward_badge_name: Optional[str] = None
    unity_type: Optional[str] = None  

class TaskCreate(TaskBase):
    pass

class TaskInDB(TaskBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class TaskPublic(TaskInDB):
    unity_type: Optional[str] = None  

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
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    progress: int = 0
    notes: Optional[str] = None
    # Custom override fields
    custom_title: Optional[str] = None
    custom_reward_coins: Optional[int] = None
    custom_category: Optional[TaskCategory] = None
    unity_type: Optional[str] = None  
    task: TaskPublic  
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
