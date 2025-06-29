import os
import sys
import requests_mock
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from gemini_logic import ask, SYSTEM_PROMPT


def test_gemini_ask_success():
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
