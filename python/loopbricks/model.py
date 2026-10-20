"""Run LoopBricks models in Python with the same equations, order of evaluation and Euler steps as the app."""
from __future__ import annotations

import json
from copy import deepcopy
from importlib import resources
from pathlib import Path
from typing import Dict, List, Optional, Union

from .expr import Compiled, ExprError, compile_expr, name_key


class ModelError(ValueError):
    pass


class Model:
    """A stock-and-flow model: stocks, flows between them (or to and from outside), and variables.

    Load one with `molecule("stockmgmt")`, `Model.from_file(path)` or `Model.from_spec(dict)`; the dict may be a
    LoopBricks spec, a file exported from the app's model builder, or a bare model.
    """

    def __init__(self, spec: dict):
        if spec.get("format") in ("loopbricks-model", "loopbricks-builder") or "model" in spec:
            self.spec = deepcopy(spec)
            m = spec["model"]
        else:
            self.spec = {"format": "loopbricks-model", "version": 1, "model": deepcopy(spec)}
            m = spec
        self.name: str = m.get("name", "Model")
        self.time_unit: str = m.get("timeUnit", "")
        self.T: float = float(m.get("T", 50))
        self.dt: float = float(m.get("dt", 0.25))
        self.stocks: List[dict] = deepcopy(m.get("stocks", []))
        self.flows: List[dict] = deepcopy(m.get("flows", []))
        self.vars: List[dict] = deepcopy(m.get("vars", []))
        self.presets: List[dict] = deepcopy(self.spec.get("presets", []))
        self.ranges: Dict[str, dict] = deepcopy(self.spec.get("params", {}))
        self._check()

    # ---- loading -------------------------------------------------------------------------------------------------
    @classmethod
    def from_spec(cls, spec: dict) -> "Model":
        return cls(spec)

    @classmethod
    def from_file(cls, path: Union[str, Path]) -> "Model":
        return cls(json.loads(Path(path).read_text(encoding="utf-8")))

    # ---- structure -----------------------------------------------------------------------------------------------
    def _elements(self) -> List[dict]:
        return [dict(e, kind="stock") for e in self.stocks] + [dict(e, kind="flow") for e in self.flows] + [dict(e, kind="var") for e in self.vars]

    def _check(self) -> None:
        self._key: Dict[str, str] = {}
        by_key: Dict[str, dict] = {}
        for e in self._elements():
            k = name_key(e["name"])
            if k in by_key:
                raise ModelError(f'Two elements are called "{e["name"]}"')
            by_key[k] = e
            self._key[e["id"]] = k
        self._by_key = by_key
        self._code: Dict[str, Compiled] = {}
        for e in self._elements():
            src = e["init"] if e["kind"] == "stock" else e["eq"]
            try:
                c = compile_expr(str(src))
            except ExprError as err:
                raise ModelError(f'{e["name"]}: {err}') from None
            for r in c.refs:
                if r not in by_key:
                    raise ModelError(f'{e["name"]}: unknown name "{r}"')
            self._code[e["id"]] = c
        for f in self.flows:
            for end in ("from", "to"):
                if f.get(end) and f[end] not in {s["id"] for s in self.stocks}:
                    raise ModelError(f'{f["name"]}: no stock with id "{f[end]}"')
        # rates (flows and variables) in dependency order; stocks break every loop
        order: List[str] = []
        state: Dict[str, int] = {}
        rate_ids = {e["id"] for e in self.flows + self.vars}

        def visit(eid: str, path: List[str]) -> None:
            if state.get(eid) == 2:
                return
            if state.get(eid) == 1:
                names = [self._by_key[self._key[x]]["name"] for x in path[path.index(eid) :]]
                raise ModelError("These depend on each other with no stock between them: " + " → ".join(names))
            state[eid] = 1
            for r in self._code[eid].refs:
                dep = self._by_key[r]
                if dep["id"] in rate_ids:
                    visit(dep["id"], path + [dep["id"]])
            state[eid] = 2
            order.append(eid)

        for e in self.flows + self.vars:
            visit(e["id"], [e["id"]])
        self._order = order

    @property
    def params(self) -> Dict[str, float]:
        """Constants you can change in run(), by Python-friendly name, with their default values."""
        out = {}
        for v in self.vars:
            try:
                out[name_key(v["name"])] = float(v["eq"])
            except ValueError:
                pass
        return out

    def preset(self, label: str) -> Dict[str, float]:
        for p in self.presets:
            if p["label"].lower() == label.lower():
                return dict(p["params"])
        raise KeyError(f'No preset "{label}". Presets: {", ".join(p["label"] for p in self.presets)}')

    def equations(self) -> str:
        """Every equation, stocks in INTEG form."""
        lines = [self.name, "", "Stocks:"]
        for s in self.stocks:
            ins = [f["name"] for f in self.flows if f.get("to") == s["id"]]
            outs = [f["name"] for f in self.flows if f.get("from") == s["id"]]
            net = " + ".join(ins) + "".join(f" − {o}" for o in outs) if ins or outs else "0"
            lines.append(f'  {s["name"]} = INTEG({net}, {s["init"]})')
        lines += ["", "Flows:"] + [f'  {f["name"]} = {f["eq"]}' for f in self.flows]
        lines += ["", "Variables:"] + [f'  {v["name"]} = {v["eq"]}' for v in self.vars]
        return "\n".join(lines)

    def __repr__(self) -> str:
        return f"<Model {self.name!r}: {len(self.stocks)} stocks, {len(self.flows)} flows, {len(self.vars)} variables; params {self.params}>"

    # ---- simulation ----------------------------------------------------------------------------------------------
    def _override(self, params: Dict[str, float]) -> Dict[str, str]:
        """Map run() keywords (an element id or a name) to the variable they replace."""
        ids = {v["id"]: v for v in self.vars}
        names = {name_key(v["name"]): v for v in self.vars}
        out = {}
        for k, val in params.items():
            v = ids.get(k) or names.get(name_key(k))
            if v is None:
                raise KeyError(f'No variable "{k}". You can set: {", ".join(self.params) or "nothing"}')
            out[v["id"]] = str(float(val))
        return out

    def run(self, T: Optional[float] = None, dt: Optional[float] = None, preset: Optional[str] = None, include: str = "all", **params: float):
        """Simulate with Euler's method and return a pandas DataFrame indexed by time.

        T and dt default to the model's own settings. preset applies one of the model's named presets first;
        keyword arguments then set constants, for example run(supply_line_weight=0). include="stocks" keeps
        only the stocks.
        """
        import pandas as pd

        settings = {**(self.preset(preset) if preset else {}), **params}
        code = dict(self._code)
        for vid, src in self._override(settings).items():
            code[vid] = compile_expr(src)
        T = float(self.T if T is None else T)
        dt = float(self.dt if dt is None else dt)
        steps = round(T / dt)
        s: Dict[str, float] = {"TIME": 0.0, "DT": dt}
        ids = [e["id"] for e in self._elements()]

        # initial values, worked out in whatever order they need, so a stock may start at a variable's value
        done, busy = set(), set()

        def init(eid: str) -> None:
            if eid in done:
                return
            if eid in busy:
                raise ModelError(f'The initial value of {self._by_key[self._key[eid]]["name"]} depends on itself')
            busy.add(eid)
            for r in code[eid].refs:
                init(self._by_key[r]["id"])
            s[self._key[eid]] = code[eid](s)
            busy.discard(eid)
            done.add(eid)

        for eid in ids:
            init(eid)

        stocks = [(st["id"], self._key[st["id"]], bool(st.get("nonNegative")), [self._key[f["id"]] for f in self.flows if f.get("to") == st["id"]], [self._key[f["id"]] for f in self.flows if f.get("from") == st["id"]]) for st in self.stocks]
        rows: List[List[float]] = []
        times: List[float] = []
        for i in range(steps + 1):
            t = i * dt
            s["TIME"] = t
            for eid in self._order:
                s[self._key[eid]] = code[eid](s)
            times.append(round(t, 10))
            rows.append([s[self._key[eid]] for eid in ids])
            if i == steps:
                break
            nxt = []
            for _, key, _, ins, outs in stocks:
                total_in = 0.0
                for k in ins:
                    total_in += s[k]
                total_out = 0.0
                for k in outs:
                    total_out += s[k]
                nxt.append(s[key] + dt * (total_in - total_out))
            for (_, key, floor, _, _), v in zip(stocks, nxt):
                s[key] = max(0.0, v) if floor else v

        names = {e["id"]: e["name"] for e in self._elements()}
        df = pd.DataFrame(rows, index=pd.Index(times, name=f"time ({self.time_unit})" if self.time_unit else "time"), columns=[names[i] for i in ids])
        if include == "stocks":
            df = df[[st["name"] for st in self.stocks]]
        return df

    def plot(self, df=None, columns: Optional[List[str]] = None, ax=None, **run_kwargs):
        """Plot stocks (or the given columns) against time; runs the model first unless a DataFrame is given."""
        import matplotlib.pyplot as plt

        df = self.run(**run_kwargs) if df is None else df
        cols = columns or [st["name"] for st in self.stocks]
        if not cols:
            print("The model has no stocks to plot yet. Add a stock, or pass columns=[...] to plot flows or variables.")
            return None
        ax = ax or plt.subplots(figsize=(8, 4))[1]
        df[cols].plot(ax=ax)
        ax.set_xlabel(df.index.name)
        ax.set_title(self.name)
        ax.grid(alpha=0.3)
        return ax


def _spec_dir():
    return resources.files("loopbricks") / "spec"


def molecules() -> List[str]:
    """Keys of the molecules shipped with the package."""
    return sorted(p.name[:-5] for p in _spec_dir().iterdir() if p.name.endswith(".json"))


def molecule(key: str) -> Model:
    """A LoopBricks molecule, with the same equations, defaults and presets as the app."""
    path = _spec_dir() / f"{key}.json"
    if not path.is_file():
        raise KeyError(f'No molecule "{key}". Available: {", ".join(molecules())}')
    return Model(json.loads(path.read_text(encoding="utf-8")))
