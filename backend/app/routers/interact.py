from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.dependencies import verify_child_ownership
from app.models.interactionlog_models import InteractionLog
from app.models.child_models import Child
from app.services.llm import generate_gemini_response
from typing import List, Dict, Any, Optional

router = APIRouter()

class ChatRequest(BaseModel):
    user_input: Optional[str] = None
    message: Optional[str] = None
    context: Optional[str] = None
    
    def get_user_input(self) -> str:
        """Get user input from either user_input or message field"""
        if self.user_input:
            return self.user_input
        if self.message:
            return self.message
        raise ValueError("Either 'user_input' or 'message' field is required")

@router.post("/{child_id}/interact/chat", response_model=dict)
async def interact_with_child(
    child_id: str,
    request: ChatRequest,
    child: Child = Depends(verify_child_ownership)
):
    try:
        user_input = request.get_user_input()
    except ValueError as e:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    
    if request.context:
        prompt = f"Context: {request.context}\nUser asks: {user_input}"
    else:
        prompt = f"User asks: {user_input}"
    
    try:
        avatar_response = generate_gemini_response(prompt)
    except Exception as e:
        print(f"Error generating avatar response: {e}")
        avatar_response = "Sorry, I'm currently busy. Please ask again later!"

    interaction_log = InteractionLog(
        child=child,
        user_input=user_input,
        avatar_response=avatar_response
    )
    await interaction_log.insert()

    return {"message": "Interaction recorded successfully.", "avatar_response": avatar_response}

@router.get("/{child_id}/interact/logs", response_model=Dict[str, List[Dict[str, Any]]])
async def get_interaction_logs(
    child_id: str,
    child: Child = Depends(verify_child_ownership)
):
    """
    Get interaction logs and aggregate emotion data for dashboard.
    Returns emotion distribution for pie chart visualization.
    """
    logs = await InteractionLog.find({"child.$id": child.id}).to_list()
    
    emotion_counts = {}
    for log in logs:
        emotion = log.detected_emotion or "Neutral"
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    emotions = [
        {"name": emotion.capitalize(), "value": count}
        for emotion, count in emotion_counts.items()
    ]
    
    if not emotions:
        emotions = [
            {"name": "Happy", "value": 0},
            {"name": "Sad", "value": 0},
            {"name": "Neutral", "value": 0}
        ]
    
    return {"emotions": emotions}