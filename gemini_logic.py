import os
import requests

SYSTEM_PROMPT = "You are an AI DJ assistant for TheBadGuyHimself."


def ask(question: str, api_key: str | None = None):
    """Query the Gemini API and return the response JSON."""
    api_key = api_key or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set")

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-pro:generateContent"
    )
    params = {"key": api_key}
    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": f"{SYSTEM_PROMPT}\n{question}"}]}
        ]
    }
    response = requests.post(url, params=params, json=payload, timeout=10)
    response.raise_for_status()
    data = response.json()
    text = (
        data.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("text", "")
    )
    return {"text": text}
