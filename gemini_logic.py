import os
import google.generativeai as genai

SYSTEM_PROMPT = "You are an AI DJ assistant for TheBadGuyHimself."


def ask(question: str, api_key: str | None = None):
  # codex/update-testing-section-in-readme
    """Query the Gemini API and return the response JSON."""
    api_key = api_key or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-pro", system_instruction=SYSTEM_PROMPT)
    result = model.generate_content(question)
    return {"text": result.text}
