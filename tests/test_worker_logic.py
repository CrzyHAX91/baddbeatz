import requests
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import requests_mock
import pytest

from worker_logic import ask, SYSTEM_PROMPT


def test_worker_ask_success():
    with requests_mock.Mocker() as m:
        m.post(
            "https://api.openai.com/v1/chat/completions",
            json={"id": "123", "choices": [{"message": {"content": "hello"}}]},
            status_code=200,
        )
        result = ask("Hello?", "sk-test")
        assert result["id"] == "123"
        history = m.request_history[0]
        assert history.json()["messages"][0]["content"] == SYSTEM_PROMPT
        assert history.headers["Authorization"] == "Bearer sk-test"


def test_worker_ask_error():
    with requests_mock.Mocker() as m:
        m.post(
            "https://api.openai.com/v1/chat/completions",
            status_code=500,
            json={"error": "oops"},
        )
        with pytest.raises(requests.exceptions.HTTPError):
            ask("Hi", "sk-test")

