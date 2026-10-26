"""ai: replies replay by request, agents call tools, and a changed request has no reply."""
import json

import pytest

from loopbricks import ai


def test_ask_replays_and_detects_a_changed_request(tmp_path, monkeypatch):
    monkeypatch.delenv("LB_AI_LIVE", raising=False)
    replay = str(tmp_path / "r.json")
    ai.author(lambda: ai.ask("2 + 2?", replay=replay), ["4"], replay=replay, how="test")
    assert ai.ask("2 + 2?", replay=replay) == "4"
    assert json.loads((tmp_path / "r.json").read_text()).popitem()[1]["how"] == "test"
    with pytest.raises(ai.MissingReply):
        ai.ask("2 + 3?", replay=replay)


def test_agent_calls_tools_and_feeds_results_back(tmp_path, monkeypatch):
    monkeypatch.delenv("LB_AI_LIVE", raising=False)
    replay = str(tmp_path / "r.json")

    def add(a: float, b: float) -> float:
        """a plus b"""
        return a + b

    run = lambda: ai.agent("add 2 and 3", {"add": add}, replay=replay)
    ai.author(run, ['{"thought": "use the tool", "tool": "add", "args": {"a": 2, "b": 3}}',
                    'I will answer now. {"thought": "done", "answer": "5"}'], replay=replay, how="test")
    steps = run()
    assert steps[0]["result"] == 5 and steps[1]["answer"] == "5"
    # a tool that gives a different result changes the request, so the second reply no longer replays
    def wrong(a: float, b: float) -> float:
        """a plus b"""
        return a * b

    with pytest.raises(ai.MissingReply):
        ai.agent("add 2 and 3", {"add": wrong}, replay=replay)
