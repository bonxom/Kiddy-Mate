from fastapi import APIRouter, Depends
from beanie import Link
from pydantic import BaseModel
from app.dependencies import verify_child_ownership
from app.models.interactionlog_models import InteractionLog
from app.models.child_models import Child
from app.services.llm import generate_gemini_response, generate_openai_response
from typing import List, Dict, Any, Optional
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter()

def detect_emotion_from_text(user_input: str) -> str:
    """
    Detect emotion from user input using LLM.
    Returns one of: Happy, Sad, Angry, Excited, Scared, Neutral, Curious, Frustrated, Proud, Worried
    """
    try:
        system_instruction = (
            "You are an emotion detection expert. "
            "Analyze the text and return ONLY the primary emotion as a single word. "
            "Choose from: Happy, Sad, Angry, Excited, Scared, Neutral, Curious, Frustrated, Proud, Worried. "
            "Return ONLY the emotion word, no explanations, no punctuation, no extra text."
        )
        
        prompt = f"""
Analyze this child's message and detect the primary emotion:
"{user_input}"

Return ONLY one word: Happy, Sad, Angry, Excited, Scared, Neutral, Curious, Frustrated, Proud, or Worried.
"""
        
        emotion = generate_openai_response(prompt, system_instruction, max_tokens=20)
        emotion = emotion.strip().capitalize()
        
        # Validate emotion is in the list
        valid_emotions = ["Happy", "Sad", "Angry", "Excited", "Scared", "Neutral", "Curious", "Frustrated", "Proud", "Worried"]
        if emotion not in valid_emotions:
            logger.warning(f"Invalid emotion detected: {emotion}, defaulting to Neutral")
            return "Neutral"
        
        return emotion
    except Exception as e:
        logger.error(f"Failed to detect emotion: {e}")
        return "Neutral"

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
        logger.error(f"Error generating avatar response: {e}")
        avatar_response = "Sorry, I'm currently busy. Please ask again later!"

    # Detect emotion from user input
    detected_emotion = None
    try:
        detected_emotion = detect_emotion_from_text(user_input)
        logger.info(f"Detected emotion: {detected_emotion} from input: {user_input[:50]}")
    except Exception as e:
        logger.error(f"Failed to detect emotion: {e}")
        detected_emotion = "Neutral"

    interaction_log = InteractionLog(
        child=child,  # type: ignore
        user_input=user_input,
        avatar_response=avatar_response,
        detected_emotion=detected_emotion
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

@router.get("/{child_id}/interact/history", response_model=List[Dict[str, Any]])
async def get_interaction_history(
    child_id: str,
    limit: Optional[int] = 20,
    child: Child = Depends(verify_child_ownership)
):
    """
    Get full interaction history (chat logs) for a child.
    Returns list of interactions with user_input, avatar_response, timestamp, and detected_emotion.
    """
    from app.dependencies import extract_id_from_link
    
    logger.info(f"Fetching interaction history for child_id: {child_id}, child.id: {child.id}")
    
    # Fetch all logs and filter by child ID (more reliable than query with Link)
    all_logs = await InteractionLog.find_all().to_list()
    child_id_str = str(child.id)
    
    # Filter logs for this child
    child_logs = []
    for log in all_logs:
        log_child_id = extract_id_from_link(log.child) if hasattr(log, 'child') else None
        if log_child_id == child_id_str:
            child_logs.append(log)
    
    # Sort by timestamp descending and limit
    child_logs.sort(key=lambda x: x.timestamp, reverse=True)
    child_logs = child_logs[:limit or 20]
    
    logger.info(f"Found {len(child_logs)} interaction logs for child {child_id} (from {len(all_logs)} total logs)")
    
    result = [
        {
            "id": str(log.id),
            "timestamp": log.timestamp.isoformat(),
            "user_input": log.user_input,
            "avatar_response": log.avatar_response,
            "detected_emotion": log.detected_emotion or "Neutral"
        }
        for log in child_logs
    ]
    
    logger.info(f"Returning {len(result)} interaction logs")
    return result