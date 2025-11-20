from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.dependencies import verify_child_ownership
from app.models.interactionlog_models import InteractionLog
from app.models.child_models import Child
from app.services.llm import generate_gemini_response
from typing import List, Dict, Any

router = APIRouter()

class ChatRequest(BaseModel):
    user_input: str

@router.post("/{child_id}/interact/chat", response_model=dict)
async def interact_with_child(
    child_id: str,
    request: ChatRequest,
    child: Child = Depends(verify_child_ownership)
):
    prompt = f"Người dùng hỏi: {request.user_input}"
    try:
        avatar_response = generate_gemini_response(prompt)
    except Exception as e:
        print(f"Error generating avatar response: {e}")
        avatar_response = "Xin lỗi, hiện tại mình đang bận, bạn hỏi lại sau nhé!"

    interaction_log = InteractionLog(
        child=child, # type: ignore
        user_input=request.user_input,
        avatar_response=avatar_response
    )
    await interaction_log.insert()

    return {"message": "Ghi nhận tương tác thành công.", "avatar_response": avatar_response}

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
    
    # Count emotions
    emotion_counts = {}
    for log in logs:
        emotion = log.detected_emotion or "Neutral"
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    # Format for frontend pie chart
    emotions = [
        {"name": emotion.capitalize(), "value": count}
        for emotion, count in emotion_counts.items()
    ]
    
    # If no emotions detected, return default data
    if not emotions:
        emotions = [
            {"name": "Happy", "value": 0},
            {"name": "Sad", "value": 0},
            {"name": "Neutral", "value": 0}
        ]
    
    return {"emotions": emotions}