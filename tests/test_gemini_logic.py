import os
import sys
codex/voeg-gemini-cli-toe-voor-ai-functies
from unittest.mock import patch, MagicMock
import requests_mock
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from gemini_logic import ask, SYSTEM_PROMPT


def test_gemini_ask_success():
codex/voeg-gemini-cli-toe-voor-ai-functies
    with patch("gemini_logic.genai") as mock_genai:
        model = mock_genai.GenerativeModel.return_value
        model.generate_content.return_value = MagicMock(text="hi")

        result = ask("Hello?", "sk-test")

        mock_genai.configure.assert_called_with(api_key="sk-test")
        mock_genai.GenerativeModel.assert_called_with(
            "gemini-pro", system_instruction=SYSTEM_PROMPT
        )
        model.generate_content.assert_called_with("Hello?")
        assert result["text"] == "hi"


def test_gemini_ask_env_fallback(monkeypatch):
    with patch("gemini_logic.genai") as mock_genai:
        model = mock_genai.GenerativeModel.return_value
        model.generate_content.return_value = MagicMock(text="hello")
        monkeypatch.setenv("GEMINI_API_KEY", "env-test")

        result = ask("Yo")

        mock_genai.configure.assert_called_with(api_key="env-test")
        assert result["text"] == "hello"


def test_gemini_ask_error():
    with patch("gemini_logic.genai") as mock_genai:
        model = mock_genai.GenerativeModel.return_value
        model.generate_content.side_effect = RuntimeError("oops")

        with pytest.raises(RuntimeError):
    with requests_mock.Mocker() as m:
        m.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
            json={"candidates": [{"content": {"parts": [{"text": "hi"}]}}]},
            status_code=200,
        )
        result = ask("Hello?", "sk-test")
        assert result["text"] == "hi"
        history = m.request_history[0]
        assert "sk-test" in history.url


def test_gemini_ask_env_fallback(monkeypatch):
    with requests_mock.Mocker() as m:
        m.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
            json={"candidates": [{"content": {"parts": [{"text": "hello"}]}}]},
            status_code=200,
        )
        monkeypatch.setenv("GEMINI_API_KEY", "env-test")
        result = ask("Yo")
        assert result["text"] == "hello"
        history = m.request_history[0]
        assert "env-test" in history.url


def test_gemini_ask_error():
    with requests_mock.Mocker() as m:
        m.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
            status_code=500,
            json={"error": "oops"},
        )
        with pytest.raises(Exception):
            ask("Hi", "sk-test")
