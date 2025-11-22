import logging
import json
from typing import Optional, Dict, Any

import httpx
try:
    import google.generativeai as genai
    GEMINI_SDK_AVAILABLE = True
except ImportError:
    GEMINI_SDK_AVAILABLE = False
    logging.warning("google-generativeai not installed, falling back to REST API")

from app.config import settings

DEFAULT_SYSTEM_INSTRUCTION = (
    "You are a friendly Vietnamese assistant named Dat, helping children. "
    "Please answer in detail, easy to understand, using 3-5 sentences, and be encouraging. "
    "When asked who you are, briefly introduce yourself (name is Dat)."
)

DEFAULT_TIMEOUT = 30.0


def _get_credentials() -> tuple[str, str]:
    api_key = settings.NCP_API_KEY
    endpoint = settings.NCP_CLOVASTUDIO_ENDPOINT
    if not api_key:
        raise RuntimeError("NCP_API_KEY is not configured")
    if not endpoint:
        raise RuntimeError("NCP_CLOVASTUDIO_ENDPOINT is not configured")
    return api_key, endpoint


def _extract_text_from_body(body: Dict[str, Any]) -> Optional[str]:
    if not isinstance(body, dict):
        return None

    choices = body.get("choices")
    if isinstance(choices, list) and choices:
        first_choice = choices[0] or {}
        message = first_choice.get("message", {})
        if isinstance(message, dict):
            text = message.get("content") or message.get("text")
            if text:
                return text

    result = body.get("result")
    if isinstance(result, dict):
        text = (
            result.get("output_text")
            or result.get("message", {}).get("content")
            or result.get("text")
        )
        if text:
            return text

    message = body.get("message")
    if isinstance(message, dict):
        text = message.get("content") or message.get("text")
        if text:
            return text

    text = body.get("output_text") or body.get("text")
    return text


def _call_clova_api(prompt: str, instruction: str, max_tokens: int = 1024) -> str:
    api_key, endpoint = _get_credentials()
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    request_body = {
        "messages": [
            {"role": "system", "content": instruction},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "top_p": 0.9,
        "max_tokens": max_tokens,
        "stream": False,
    }

    try:
        with httpx.Client(timeout=DEFAULT_TIMEOUT) as client:
            response = client.post(endpoint, headers=headers, json=request_body)
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise RuntimeError(
            f"HTTP {exc.response.status_code}: {exc.response.text}"
        ) from exc
    except httpx.HTTPError as exc:
        raise RuntimeError(f"HTTP error contacting Clova Studio: {exc}") from exc

    try:
        body = response.json()
    except ValueError as exc:
        raise RuntimeError(f"Invalid JSON response: {exc}") from exc

    text = _extract_text_from_body(body)
    if not text:
        raise RuntimeError(f"Could not extract text from response: {body}")
    return text.strip()


def generate_gemini_response(prompt: str, system_instruction: Optional[str] = None, max_tokens: int = 1024) -> str:
    """
    Generate a response using NCP Clova Studio (HyperCLOVA X) API.
    
    Args:
        prompt: User prompt
        system_instruction: System instruction (optional)
        max_tokens: Maximum tokens in response (default: 1024)
    """
    instruction = system_instruction or DEFAULT_SYSTEM_INSTRUCTION
    try:
        return _call_clova_api(prompt, instruction, max_tokens)
    except Exception as exc:
        logging.error("Failed to generate Clova response: %s", exc)
        return "Sorry, I haven't thought of an answer yet. Please try asking again!"


def analyze_assessment_with_chatgpt(
    child_info: Dict[str, Any],
    assessment_answers: Dict[str, Dict[str, Optional[str]]],
    questions_data: Dict[str, Dict[str, str]]
) -> Dict[str, Any]:
    """
    Analyze child assessment answers using ChatGPT API and return trait scores.
    
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
    
    # Build the prompt for ChatGPT
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
        logging.info("Successfully called ChatGPT API")
        
    except ImportError:
        raise RuntimeError("openai package not installed. Run: pip install openai")
    except Exception as e:
        error_msg = str(e)
        if "401" in error_msg or "Invalid API key" in error_msg:
            raise RuntimeError(f"Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file.") from e
        elif "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            raise RuntimeError(f"OpenAI API quota/rate limit exceeded. Please check your billing/quota settings.") from e
        else:
            logging.error(f"ChatGPT API error: {error_msg[:200]}")
            raise RuntimeError(f"Failed to call ChatGPT API: {error_msg[:200]}") from e
    
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
        logging.error(f"Failed to parse JSON from ChatGPT response: {exc}")
        logging.error(f"Response text: {text[:500] if text else 'No text'}")
        raise RuntimeError(f"Failed to parse JSON response: {exc}") from exc
    except (KeyError, ValueError) as exc:
        logging.error(f"Invalid response structure from ChatGPT: {exc}")
        raise RuntimeError(f"Invalid response structure: {exc}") from exc


def analyze_assessment_with_gemini(
    child_info: Dict[str, Any],
    assessment_answers: Dict[str, Dict[str, Optional[str]]],
    questions_data: Dict[str, Dict[str, str]]
) -> Dict[str, Any]:
    """
    Analyze child assessment answers using Gemini API and return trait scores.
    
    Args:
        child_info: Dictionary containing child information (name, age, gender, etc.)
        assessment_answers: Dictionary with keys: discipline_autonomy, emotional_intelligence, social_interaction
                          Each contains question_id -> rating (1-5) mappings
        questions_data: Dictionary mapping question_id to question text and category
    
    Returns:
        Dictionary with overall_traits, explanations, and recommended_focus
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured in environment variables")
    
    # Build the prompt for Gemini
    prompt = _build_assessment_prompt(child_info, assessment_answers, questions_data)
    
    # Try using SDK first (more reliable), fallback to REST API
    text = None
    
    if GEMINI_SDK_AVAILABLE:
        try:
            genai.configure(api_key=api_key)
            
            # First, try to list available models
            try:
                available_models = [m.name.split('/')[-1] for m in genai.list_models() 
                                  if 'generateContent' in m.supported_generation_methods]
                logging.info(f"Available Gemini models: {available_models}")
                
                # Try available models first
                models_to_try = available_models[:3] if available_models else []
            except Exception as e:
                logging.warning(f"Could not list models: {e}, using default list")
                models_to_try = []
            
            # Fallback to default list if no models found (use newer models first)
            if not models_to_try:
                models_to_try = [
                    "gemini-2.0-flash",  # Newer, faster model
                    "gemini-2.5-flash",  # Latest flash model
                    "gemini-2.0-flash-exp",  # Experimental
                    "gemini-1.5-pro",  # Older but stable
                    "gemini-pro",  # Legacy
                ]
            
            for model_name in models_to_try:
                try:
                    model = genai.GenerativeModel(model_name)
                    response = model.generate_content(prompt)
                    text = response.text
                    logging.info(f"Successfully called Gemini API with SDK using model {model_name}")
                    break
                except Exception as e:
                    error_msg = str(e)
                    # Check if it's a quota error - don't fallback, raise immediately
                    if "429" in error_msg or "quota" in error_msg.lower() or "Quota exceeded" in error_msg:
                        logging.error(f"Gemini API quota exceeded. Please check your billing/quota: {error_msg[:200]}")
                        raise RuntimeError(f"Gemini API quota exceeded. Please check your billing/quota settings. Visit https://ai.google.dev/gemini-api/docs/rate-limits for more info.") from e
                    logging.warning(f"Model {model_name} failed with SDK: {error_msg[:200]}, trying next...")
                    continue
        except RuntimeError:
            # Re-raise quota errors
            raise
        except Exception as e:
            logging.warning(f"Gemini SDK failed: {e}, falling back to REST API")
    
    # Fallback to REST API if SDK not available or failed
    if not text:
        # Use newer models that actually exist
        models_to_try = [
            ("gemini-2.0-flash", "v1beta"),
            ("gemini-2.5-flash", "v1beta"),
            ("gemini-2.0-flash-exp", "v1beta"),
            ("gemini-1.5-pro", "v1beta"),
            ("gemini-pro", "v1beta"),
        ]
        
        headers = {
            "Content-Type": "application/json",
        }
        
        request_body = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        last_error = None
        response = None
        for model_name, api_version in models_to_try:
            endpoint = f"https://generativelanguage.googleapis.com/{api_version}/models/{model_name}:generateContent?key={api_key}"
            
            try:
                with httpx.Client(timeout=DEFAULT_TIMEOUT) as client:
                    response = client.post(endpoint, headers=headers, json=request_body)
                    response.raise_for_status()
                    logging.info(f"Successfully called Gemini API with REST using model {model_name} (v{api_version})")
                    break
            except httpx.HTTPStatusError as exc:
                last_error = exc
                if exc.response.status_code == 404:
                    logging.warning(f"Model {model_name} (v{api_version}) not found (404), trying next...")
                    continue
                else:
                    logging.error(f"Gemini API HTTP error: {exc.response.status_code} - {exc.response.text}")
                    raise RuntimeError(f"Gemini API error: {exc.response.status_code}") from exc
            except httpx.HTTPError as exc:
                last_error = exc
                logging.warning(f"Gemini API HTTP error with {model_name}: {exc}, trying next...")
                continue
        else:
            if last_error:
                logging.error(f"All Gemini models failed. Last error: {last_error}")
                raise RuntimeError(f"Failed to contact Gemini API with any model. Last error: {last_error}") from last_error
            else:
                raise RuntimeError("Failed to contact Gemini API: No models available")
        
        if response is None:
            raise RuntimeError("Failed to get response from Gemini API")
        
        try:
            body = response.json()
        except ValueError as exc:
            logging.error(f"Invalid JSON response from Gemini: {exc}")
            raise RuntimeError(f"Invalid JSON response from Gemini: {exc}") from exc
        
        # Extract text from REST API response
        try:
            candidates = body.get("candidates", [])
            if not candidates:
                raise RuntimeError("No candidates in Gemini response")
            
            content = candidates[0].get("content", {})
            parts = content.get("parts", [])
            if not parts:
                raise RuntimeError("No parts in Gemini response")
            
            text = parts[0].get("text", "")
            if not text:
                raise RuntimeError("Empty text in Gemini response")
        except (KeyError, IndexError) as exc:
            logging.error(f"Invalid response structure from Gemini: {exc}")
            logging.error(f"Response: {body}")
            raise RuntimeError(f"Invalid response structure: {exc}") from exc
    
    if not text:
        raise RuntimeError("Failed to get text response from Gemini API")
    
    # Parse JSON from response (remove markdown code blocks if present)
    try:
        text = text.strip()
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
        logging.error(f"Failed to parse JSON from Gemini response: {exc}")
        logging.error(f"Response text: {text[:500] if text else 'No text'}")
        raise RuntimeError(f"Failed to parse JSON response: {exc}") from exc
    except (KeyError, ValueError) as exc:
        logging.error(f"Invalid response structure from Gemini: {exc}")
        raise RuntimeError(f"Invalid response structure: {exc}") from exc


def _build_assessment_prompt(
    child_info: Dict[str, Any],
    assessment_answers: Dict[str, Dict[str, Optional[str]]],
    questions_data: Dict[str, Dict[str, str]]
) -> str:
    """Build the prompt for Gemini API to analyze assessment."""
    
    # Extract child information
    child_name = child_info.get("name", "the child")
    child_age = child_info.get("age", "unknown")
    child_gender = child_info.get("gender", "")
    
    prompt = f"""You are an analysis engine in a system that includes:
- Frontend (FE) collecting Parent account info → Child Information → Assessment Questionnaire.
- Backend (BE) receiving this data and sending it to Gemini for scoring.
- Database storing the final computed traits (initial_traits).

System Flow:
1. Parent registers account → fills personal information.
2. Parent proceeds to the Child Information form.
3. Parent completes the Assessment Questionnaire (questions defined in assessmentQuestions.ts).
4. FE sends all collected data to BE.
5. BE calls Gemini (you) with Child Info + Assessment Answers.
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
