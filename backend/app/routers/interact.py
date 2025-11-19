from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.dependencies import verify_child_ownership
from app.models.interactionlog_models import InteractionLog
from app.models.child_models import Child
from app.services.llm import generate_gemini_response

router = APIRouter()

class ChatRequest(BaseModel):
    user_input: str

@router.post("/children/{child_id}/interact/chat", response_model=dict)
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
        child=child,
        user_input=request.user_input,
        avatar_response=avatar_response
    )
    await interaction_log.insert()

    return {"message": "Ghi nhận tương tác thành công.", "avatar_response": avatar_response}
