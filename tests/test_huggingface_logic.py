import os
import sys
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import huggingface_logic


def test_hf_ask_success(monkeypatch):
    calls = {}

    def fake_pipeline(task, model=None):
        calls['task'] = task
        calls['model'] = model
        def run(prompt, max_new_tokens=20):
            calls['prompt'] = prompt
            calls['max_new_tokens'] = max_new_tokens
            return [{"generated_text": "hi"}]
        return run
    monkeypatch.setattr(huggingface_logic, 'pipeline', fake_pipeline)
    result = huggingface_logic.ask("Hello?", "test-model")
    assert result["text"] == "hi"
    assert calls['task'] == 'text-generation'
    assert calls['model'] == 'test-model'


def test_hf_ask_env_fallback(monkeypatch):
    def fake_pipeline(task, model=None):
        def run(prompt, max_new_tokens=20):
            return [{"generated_text": "hello"}]
        return run
    monkeypatch.setattr(huggingface_logic, 'pipeline', fake_pipeline)
    monkeypatch.setenv("HF_MODEL", "env-model")
    result = huggingface_logic.ask("Yo")
    assert result["text"] == "hello"


def test_hf_ask_error(monkeypatch):
    def fake_pipeline(task, model=None):
        raise RuntimeError("boom")
    monkeypatch.setattr(huggingface_logic, 'pipeline', fake_pipeline)
    with pytest.raises(RuntimeError):
        huggingface_logic.ask("Hi", "bad-model")
