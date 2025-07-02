import os
from transformers import pipeline

# Default small model to load if none provided
DEFAULT_MODEL = "sshleifer/tiny-gpt2"

_pipeline = None
_model_name = None


def _get_pipeline(model_name: str):
    """Load and cache the transformers pipeline for text generation."""
    global _pipeline, _model_name
    if _pipeline is None or model_name != _model_name:
        _pipeline = pipeline("text-generation", model=model_name)
        _model_name = model_name
    return _pipeline


def ask(question: str, model_name: str | None = None):
    """Generate a response using a Hugging Face model and return ``{"text": ...}``."""
    model_name = model_name or os.getenv("HF_MODEL", DEFAULT_MODEL)
    nlp = _get_pipeline(model_name)
    outputs = nlp(question, max_new_tokens=20)
    text = outputs[0].get("generated_text", "")
    return {"text": text}
