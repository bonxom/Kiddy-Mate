import os
from pathlib import Path

import httpx
from dotenv import load_dotenv

APP_DIR = Path(__file__).resolve().parent
ENV_PATH = APP_DIR / ".env"

if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)

API_KEY_ENV = "NCP_API_KEY"
ENDPOINT_ENV = "NCP_CLOVASTUDIO_ENDPOINT"


def main():
    api_key = os.getenv(API_KEY_ENV)
    if not api_key:
        print(f"❌ Error: Missing API key. Please set environment variable {API_KEY_ENV}.")
        return

    endpoint = os.getenv(ENDPOINT_ENV)
    if not endpoint:
        print(f"❌ Error: Missing endpoint. Please set environment variable {ENDPOINT_ENV}.")
        return

    user_input = input("Nhập câu hỏi của bạn: ").strip()
    if not user_input:
        print("Không có nội dung để gửi.")
        return

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    request_body = {
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": user_input},
        ],
        "temperature": 0.7,
        "top_p": 0.9,
        "max_tokens": 512,
        "stream": False,
    }

    with httpx.Client(timeout=30.0) as client:
        response = client.post(endpoint, headers=headers, json=request_body)

    if response.status_code != 200:
        print(f"❌ HTTP {response.status_code}: {response.text}")
        return

    try:
        body = response.json()
    except Exception as e:
        print(f"❌ JSON decode error: {e}")
        print(response.text)
        return

    # HyperCLOVA X có thể trả về theo 2 dạng:
    # 1. {"result": {"message": {"content": "..."}}}
    # 2. {"result": {"output_text": "..."}}
    # 3. {"choices": [{"message": {"content": "..."}}]} (OpenAI-style)
    text = None

    if "choices" in body:
        # OpenAI-style
        text = (
            body["choices"][0]
            .get("message", {})
            .get("content", "")
        )
    elif "result" in body:
        result = body["result"]
        if isinstance(result, dict):
            text = (
                result.get("output_text")
                or result.get("message", {}).get("content")
                or result.get("text")
            )

    if not text:
        print("❌ Không lấy được kết quả hợp lệ.")
        print("Phản hồi đầy đủ:", body)
        return

    print("\n💬 Trả lời:")
    print(text.strip())


if __name__ == "__main__":
    main()
