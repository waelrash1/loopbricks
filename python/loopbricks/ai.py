"""Language models as modelling partners: ask one a question, or let one work as an agent with tools.

    from loopbricks import ai
    text = ai.ask("List the stocks in this story: ...", replay="data/ai/c17.json")
    steps = ai.agent("Find a capacity that clears the list", {"simulate": simulate},
                     replay="data/ai/c17.json")

Every reply is kept in a replay file, keyed by a hash of the whole request (model, system prompt, messages),
so a chapter runs anywhere, offline and free, and gives the same text every time. A request that changes,
even by one character or one number in a tool result, has no reply yet and raises MissingReply.

Set LB_AI_LIVE=1 and ANTHROPIC_API_KEY to send requests that have no reply to a live model; the new replies
are added to the replay file. LB_AI_MODEL chooses the model.
"""
from __future__ import annotations

import hashlib
import inspect
import json
import os
import re
from datetime import date
from pathlib import Path
from urllib.parse import urlparse
from urllib.error import HTTPError
from urllib.request import urlopen

MODEL = os.environ.get("LB_AI_MODEL", "claude-opus-5-5")
SHOW = 4000  # characters of a tool result passed back to the model

PROTOCOL = """You can use these tools, which are Python functions:
{menu}

Reply with exactly one JSON object and nothing else. To call a tool:
{{"thought": "<why, in one or two sentences>", "tool": "<name>", "args": {{<keyword arguments>}}}}
To finish:
{{"thought": "<why you are done>", "answer": "<your answer>"}}
Use the results the tools return; never invent a number a tool could give you."""


class MissingReply(LookupError):
    """No recorded reply for a request, and no live model to ask."""


def _local(replay: str) -> Path:
    # a replay read from a URL is written next to the notebook, under its own file name
    return Path(Path(urlparse(replay).path).name) if str(replay).startswith("http") else Path(replay)


def _load(replay: str) -> dict:
    local = _local(replay)
    if local.exists():
        return json.loads(local.read_text())
    if str(replay).startswith("http"):
        try:
            with urlopen(replay) as r:
                return json.loads(r.read())
        except HTTPError as e:
            if e.code == 404:  # not published yet: no replies
                return {}
            raise
    return {}


def records(replay: str) -> dict:
    """Every recorded reply in a replay file, by key: {"text", "how", "date"}."""
    return _load(replay)


def request_key(messages: list, system: str = "", reasoning: bool = False, model: str = MODEL) -> str:
    """The replay key of a request: the first 16 hex digits of a hash of everything sent."""
    blob = json.dumps({"model": model, "system": system, "reasoning": reasoning, "messages": messages},
                      sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(blob.encode()).hexdigest()[:16]


def _live(messages: list, system: str, reasoning: bool, model: str) -> str:
    import anthropic  # only needed for live calls: pip install anthropic

    kw = {"model": model, "max_tokens": 16000, "messages": messages}
    if system:
        kw["system"] = system
    if reasoning:
        kw["thinking"] = {"type": "adaptive"}  # the model decides how long to think before it answers
    r = anthropic.Anthropic().messages.create(**kw)
    return "".join(b.text for b in r.content if b.type == "text")


def complete(messages: list, *, replay: str, system: str = "", reasoning: bool = False, model: str = MODEL) -> str:
    """The model's reply to a conversation (a list of {"role", "content"} messages), from the replay file or live."""
    key = request_key(messages, system, reasoning, model)
    rec = _load(replay).get(key)
    if rec is not None:
        return rec["text"]
    if os.environ.get("LB_AI_LIVE") == "1":
        text = _live(messages, system, reasoning, model)
        record(replay, key, text, how=f"live call to {model}")
        return text
    pending = _local(replay).with_suffix(".pending.json")
    pending.write_text(json.dumps({"key": key, "model": model, "system": system, "reasoning": reasoning,
                                   "messages": messages}, indent=1, ensure_ascii=False))
    raise MissingReply(f"no recorded reply {key} in {replay}. Set LB_AI_LIVE=1 and ANTHROPIC_API_KEY to ask a "
                       f"live model; the request is in {pending}")


def record(replay: str, key: str, text: str, how: str) -> None:
    """Add a reply to a replay file, saying how it was made (a live call, or written for the book)."""
    data = _load(replay)
    data[key] = {"text": text, "how": how, "date": date.today().isoformat()}
    _local(replay).parent.mkdir(parents=True, exist_ok=True)
    _local(replay).write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")


def ask(prompt: str, *, replay: str, system: str = "", reasoning: bool = False, model: str = MODEL) -> str:
    """One question, one answer. reasoning=True asks a reasoning model to think before it answers."""
    return complete([{"role": "user", "content": prompt}], replay=replay, system=system, reasoning=reasoning,
                    model=model)


def ask_json(prompt: str, **kw):
    """ask(), then read the first JSON object or list in the reply."""
    return _json(ask(prompt, **kw))


def _json(text: str):
    m = re.search(r"[\[{].*[\]}]", text, re.S)  # from the first bracket to the last
    if not m:
        raise ValueError(f"no JSON in the reply: {text[:200]!r}")
    return json.loads(m.group(0))


def _show(result) -> str:
    text = result.to_string() if hasattr(result, "to_string") else (
        result if isinstance(result, str) else json.dumps(result, default=str))
    return text if len(text) <= SHOW else text[:SHOW] + f"\n[... {len(text) - SHOW} more characters cut]"


def agent(task: str, tools: dict, *, replay: str, system: str = "", reasoning: bool = False,
          max_steps: int = 10, model: str = MODEL) -> list[dict]:
    """Let a model work on a task with tools, one step at a time, and return the steps.

    tools maps names to Python functions; the model sees each one's signature and docstring. At each step
    the model replies with one JSON object, either a tool call or a final answer. The tool runs here, in
    Python, and its result goes back to the model as the next message. The loop stops at an answer or
    after max_steps. Each step is a dict with "thought" and either "tool", "args" and "result", or "answer".
    """
    menu = "\n".join(f"- {n}{inspect.signature(f)}: {inspect.getdoc(f) or ''}" for n, f in tools.items())
    system = (system + "\n\n" if system else "") + PROTOCOL.format(menu=menu)
    messages = [{"role": "user", "content": task}]
    steps = []
    for _ in range(max_steps):
        text = complete(messages, replay=replay, system=system, reasoning=reasoning, model=model)
        messages.append({"role": "assistant", "content": text})
        try:
            step = _json(text)
        except ValueError:
            step = {"thought": text, "tool": None, "args": {}}
        steps.append(step)
        if "answer" in step:
            return steps
        name, args = step.get("tool"), step.get("args") or {}
        if name not in tools:
            result = f"error: no tool called {name!r}; the tools are {sorted(tools)}"
        else:
            try:
                result = tools[name](**args)
            except Exception as e:  # a failed tool is information for the model, not the end of the run
                result = f"error: {type(e).__name__}: {e}"
        step["result"] = result
        messages.append({"role": "user", "content": "Result: " + _show(result)})
    steps.append({"thought": f"stopped after {max_steps} steps without an answer", "answer": None})
    return steps


def show(steps: list[dict], width: int = 100) -> None:
    """Print an agent's steps: what it thought, what it called, what came back, and its answer."""
    for i, s in enumerate(steps, 1):
        print(f"{i}. {s.get('thought', '')}")
        if "answer" in s:
            print(f"   answer: {s['answer']}")
        else:
            args = ", ".join(f"{k}={v!r}" for k, v in (s.get("args") or {}).items())
            res = " ".join(_show(s.get("result")).split())
            print(f"   {s.get('tool')}({args}) -> {res[:width]}{' ...' if len(res) > width else ''}")


def author(run, replies: list[str], *, replay: str, how: str) -> None:
    """Write a replay file without a live model: call run(), answer each MissingReply with the next reply.

    For authors only. run is a function that makes the same ask() or agent() calls as the notebook; replies
    are the texts to record, in order. Every reply is recorded with how, so readers can see it was written,
    not returned by a live call.
    """
    queue = list(replies)
    while True:
        try:
            run()
            _local(replay).with_suffix(".pending.json").unlink(missing_ok=True)
            return
        except MissingReply:
            if not queue:
                raise
            req = json.loads(_local(replay).with_suffix(".pending.json").read_text())
            record(replay, req["key"], queue.pop(0), how)
