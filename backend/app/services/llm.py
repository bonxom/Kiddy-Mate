import logging
import json
from typing import Optional, Dict, Any

from app.config import settings

DEFAULT_SYSTEM_INSTRUCTION = (
    "You are a friendly Vietnamese assistant named Dat, helping children. "
    "Please answer in detail, easy to understand, using 3-5 sentences, and be encouraging. "
    "When asked who you are, briefly introduce yourself (name is Dat)."
)

DEFAULT_TIMEOUT = 30.0


def generate_openai_response(prompt: str, system_instruction: Optional[str] = None, max_tokens: int = 1024) -> str:
    """
    Generate a response using OpenAI API.
    
    Args:
        prompt: User prompt
        system_instruction: System instruction (optional)
        max_tokens: Maximum tokens in response (default: 1024)
    
    Returns:
        Generated text response
    """
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured in environment variables")
    
    instruction = system_instruction or DEFAULT_SYSTEM_INSTRUCTION
    
    try:
        from openai import OpenAI
        
        client = OpenAI(api_key=api_key)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Use cheaper model, can change to "gpt-4o" for better quality
            messages=[
                {
                    "role": "system",
                    "content": instruction
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=max_tokens
        )
        
        text = response.choices[0].message.content
        if not text:
            raise RuntimeError("Empty response from OpenAI API")
        
        logging.info("Successfully called OpenAI API")
        return text.strip()
        
    except ImportError:
        raise RuntimeError("openai package not installed. Run: pip install openai")
    except Exception as e:
        error_msg = str(e)
        if "401" in error_msg or "Invalid API key" in error_msg:
            raise RuntimeError(f"Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file.") from e
        elif "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            raise RuntimeError(f"OpenAI API quota/rate limit exceeded. Please check your billing/quota settings.") from e
        else:
            logging.error(f"OpenAI API error: {error_msg[:200]}")
            raise RuntimeError(f"Failed to call OpenAI API: {error_msg[:200]}") from e


# Alias for backward compatibility (keep old function name)
def generate_gemini_response(prompt: str, system_instruction: Optional[str] = None, max_tokens: int = 1024) -> str:
    """
    Generate a response using OpenAI API.
    This function is kept for backward compatibility.
    The name is misleading - it actually uses OpenAI, not Gemini.
    
    Args:
        prompt: User prompt
        system_instruction: System instruction (optional)
        max_tokens: Maximum tokens in response (default: 1024)
    """
    return generate_openai_response(prompt, system_instruction, max_tokens)


def analyze_assessment_with_chatgpt(
    child_info: Dict[str, Any],
    assessment_answers: Dict[str, Dict[str, Optional[str]]],
    questions_data: Dict[str, Dict[str, str]]
) -> Dict[str, Any]:
    """
    Analyze child assessment answers using OpenAI API and return trait scores.
    
    Args:
        child_info: Dictionary containing child information (name, age, gender, etc.)
        assessment_answers: Dictionary with keys: discipline_autonomy, emotional_intelligence, social_interaction
                          Each contains question_id -> rating (1-5) mappings
        questions_data: Dictionary mapping question_id to question text and category
    
    Returns:
        Dictionary with overall_traits, explanations, and recommended_focus
    """
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured in environment variables")
    
    # Build the prompt for OpenAI
    prompt = _build_assessment_prompt(child_info, assessment_answers, questions_data)
    
    try:
        from openai import OpenAI
        
        client = OpenAI(api_key=api_key)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Use cheaper model, can change to "gpt-4o" for better quality
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert child development analyst. Analyze assessment data and return ONLY valid JSON, no markdown, no extra text."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=2000,
            response_format={"type": "json_object"}  # Force JSON response
        )
        
        text = response.choices[0].message.content
        logging.info("Successfully called OpenAI API for assessment analysis")
        
    except ImportError:
        raise RuntimeError("openai package not installed. Run: pip install openai")
    except Exception as e:
        error_msg = str(e)
        if "401" in error_msg or "Invalid API key" in error_msg:
            raise RuntimeError(f"Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file.") from e
        elif "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            raise RuntimeError(f"OpenAI API quota/rate limit exceeded. Please check your billing/quota settings.") from e
        else:
            logging.error(f"OpenAI API error: {error_msg[:200]}")
            raise RuntimeError(f"Failed to call OpenAI API: {error_msg[:200]}") from e
    
    # Parse JSON from response
    try:
        text = text.strip()
        # Remove markdown code blocks if present
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        result = json.loads(text)
        
        # Validate the structure
        if "overall_traits" not in result:
            raise ValueError("Missing 'overall_traits' in response")
        if "explanations" not in result:
            raise ValueError("Missing 'explanations' in response")
        if "recommended_focus" not in result:
            raise ValueError("Missing 'recommended_focus' in response")
        
        # Validate trait scores are 0-100
        required_traits = ["independence", "emotional", "discipline", "social", "logic"]
        for trait in required_traits:
            if trait not in result["overall_traits"]:
                raise ValueError(f"Missing trait '{trait}' in overall_traits")
            score = result["overall_traits"][trait]
            if not isinstance(score, int) or score < 0 or score > 100:
                raise ValueError(f"Invalid score for '{trait}': {score} (must be 0-100)")
        
        return result
        
    except json.JSONDecodeError as exc:
        logging.error(f"Failed to parse JSON from OpenAI response: {exc}")
        logging.error(f"Response text: {text[:500] if text else 'No text'}")
        raise RuntimeError(f"Failed to parse JSON response: {exc}") from exc
    except (KeyError, ValueError) as exc:
        logging.error(f"Invalid response structure from OpenAI: {exc}")
        raise RuntimeError(f"Invalid response structure: {exc}") from exc


def _build_assessment_prompt(
    child_info: Dict[str, Any],
    assessment_answers: Dict[str, Dict[str, Optional[str]]],
    questions_data: Dict[str, Dict[str, str]]
) -> str:
    """Build the prompt for OpenAI API to analyze assessment."""
    
    # Extract child information
    child_name = child_info.get("name", "the child")
    child_age = child_info.get("age", "unknown")
    child_gender = child_info.get("gender", "")
    
    prompt = f"""You are an analysis engine in a system that includes:
- Frontend (FE) collecting Parent account info → Child Information → Assessment Questionnaire.
- Backend (BE) receiving this data and sending it to OpenAI for scoring.
- Database storing the final computed traits (initial_traits).

System Flow:
1. Parent registers account → fills personal information.
2. Parent proceeds to the Child Information form.
3. Parent completes the Assessment Questionnaire (questions defined in assessmentQuestions.ts).
4. FE sends all collected data to BE.
5. BE calls OpenAI (you) with Child Info + Assessment Answers.
6. You must analyze the answers and generate 5 trait scores for Skills Development:
   - Independence
   - Emotional
   - Discipline
   - Social
   - Logic

Scoring Requirements:
- Each metric must be an integer from 0 to 100.
- Scoring interpretation:
  - 0–25 = Very Low
  - 26–50 = Low
  - 51–75 = Good
  - 76–100 = Excellent
- You must infer realistic scoring based on questionnaire answers (Likert scale 1–5 or actual content).
- Provide short explanations (1–2 sentences each).

Your output will be saved directly into the database under "initial_traits".
Therefore, you MUST ALWAYS output strict JSON in the following schema:

{{
  "overall_traits": {{
    "independence": <0-100>,
    "emotional": <0-100>,
    "discipline": <0-100>,
    "social": <0-100>,
    "logic": <0-100>
  }},
  "explanations": {{
    "independence": "Short explanation...",
    "emotional": "Short explanation...",
    "discipline": "Short explanation...",
    "social": "Short explanation...",
    "logic": "Short explanation..."
  }},
  "recommended_focus": ["Skill1", "Skill2", ...] 
}}

Rules:
- Output must be VALID JSON only. No markdown, no extra text.
- Do not include any fields other than the required JSON.
- recommended_focus should contain 2–4 skills with the lowest scores.
- All values must be logically consistent with the questionnaire.

CHILD INFORMATION:
- Name: {child_name}
- Age: {child_age}
- Gender: {child_gender}

ASSESSMENT ANSWERS:
"""
    
    # Add discipline_autonomy answers
    if "discipline_autonomy" in assessment_answers:
        prompt += "\n=== DISCIPLINE & AUTONOMY ===\n"
        for q_id, rating in assessment_answers["discipline_autonomy"].items():
            if rating:
                if q_id in questions_data:
                    q_text = questions_data[q_id].get("question", q_id)
                    prompt += f"Q: {q_text}\nA: {rating}/5\n\n"
                else:
                    # Fallback if question ID not found in mapping
                    prompt += f"Q: {q_id}\nA: {rating}/5\n\n"
    
    # Add emotional_intelligence answers
    if "emotional_intelligence" in assessment_answers:
        prompt += "\n=== EMOTIONAL INTELLIGENCE ===\n"
        for q_id, rating in assessment_answers["emotional_intelligence"].items():
            if rating:
                if q_id in questions_data:
                    q_text = questions_data[q_id].get("question", q_id)
                    prompt += f"Q: {q_text}\nA: {rating}/5\n\n"
                else:
                    # Fallback if question ID not found in mapping
                    prompt += f"Q: {q_id}\nA: {rating}/5\n\n"
    
    # Add social_interaction answers
    if "social_interaction" in assessment_answers:
        prompt += "\n=== SOCIAL INTERACTION ===\n"
        for q_id, rating in assessment_answers["social_interaction"].items():
            if rating:
                if q_id in questions_data:
                    q_text = questions_data[q_id].get("question", q_id)
                    prompt += f"Q: {q_text}\nA: {rating}/5\n\n"
                else:
                    # Fallback if question ID not found in mapping
                    prompt += f"Q: {q_id}\nA: {rating}/5\n\n"
    
    prompt += "\nNow analyze the assessment and return ONLY the JSON response as specified above. No markdown, no explanations outside the JSON."
    
    return prompt
