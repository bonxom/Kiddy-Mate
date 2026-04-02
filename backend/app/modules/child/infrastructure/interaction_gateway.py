from __future__ import annotations

import logging

from app.core.locale import build_output_language_instruction, localize_message
from app.modules.child.domain.interaction_gateways import ChildInteractionGateway
from app.services.llm import generate_gemini_response, generate_openai_response

logger = logging.getLogger(__name__)

VALID_EMOTIONS = {
    "Happy",
    "Sad",
    "Angry",
    "Excited",
    "Scared",
    "Neutral",
    "Curious",
    "Frustrated",
    "Proud",
    "Worried",
}


def detect_emotion_from_text(user_input: str) -> str:
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
    try:
        emotion = generate_openai_response(prompt, system_instruction, max_tokens=20).strip().capitalize()
        if emotion not in VALID_EMOTIONS:
            logger.warning("Invalid emotion detected: %s, defaulting to Neutral", emotion)
            return "Neutral"
        return emotion
    except Exception as exc:
        logger.error("Failed to detect emotion: %s", exc)
        return "Neutral"


def generate_child_avatar_response(prompt: str) -> str:
    system_instruction = (
        "You are a friendly assistant named Dat, helping children. "
        "Keep your response warm, practical, and easy to understand for a child. "
        + build_output_language_instruction()
    )
    return generate_gemini_response(prompt, system_instruction)


class LLMChildInteractionGateway(ChildInteractionGateway):
    def generate_avatar_response(self, prompt: str) -> str:
        try:
            return generate_child_avatar_response(prompt)
        except Exception as exc:
            logger.error("Error generating avatar response: %s", exc)
            return localize_message(
                "Sorry, I'm currently busy. Please ask again later!",
                "Minh dang ban mot chut. Ban thu lai sau nhe!",
            )

    def detect_emotion(self, user_input: str) -> str:
        return detect_emotion_from_text(user_input)
