"""Run LoopBricks models in Python with the same equations, order of evaluation and Euler steps as the app."""
from __future__ import annotations

import difflib
import json
import math
import warnings
from copy import deepcopy
from importlib import resources
from pathlib import Path
from typing import Callable, Dict, Iterable, List, Optional, Union

import numpy as np

from .expr import Compiled, ExprError, LoopBricksError, LoopBricksWarning, compile_expr, name_key


class ModelError(LoopBricksError):
    pass


class UnknownNameError(LoopBricksError, KeyError):
    """A name the model (or the package) does not have. Also a KeyError, so code written for 0.1 still works."""

    __str__ = BaseException.__str__  # KeyError would print the message in quotes


def _unknown(what: str, name, options: Iterable[str], listing: str = "") -> UnknownNameError:
    """'No parameter "x". Did you mean "y"? You can set: ...' with difflib's closest guess."""
    options = list(options)
    msg = f'No {what} "{name}".'
    close = difflib.get_close_matches(str(name), options, n=1, cutoff=0.6) or difflib.get_close_matches(name_key(str(name)), options, n=1, cutoff=0.6)
    close = close or [o for o in options if len(str(name)) >= 3 and str(name).lower() in o.lower()][:1]  # "Stable" for "Stable (sees pipeline)"
    if close:
        msg += f' Did you mean "{close[0]}"?'
    return UnknownNameError(f'{msg} {listing or "Choices"}: {", ".join(options) or "none"}.')


def _num(v: float) -> str:
    """A number as it would be typed into an equation: 10 rather than 10.0."""
    v = float(v)
    return str(int(v)) if v.is_integer() and abs(v) < 1e15 else repr(v)


class _Ranges(dict):
    """Slider ranges by Python-friendly name; the app's element ids work too (m.ranges["slw"])."""

    def __init__(self, items: dict, ids: Dict[str, str]):
        super().__init__(items)
        self._ids = ids

    def _name(self, k):
        return k if super().__contains__(k) else self._ids.get(k, k)

    def __getitem__(self, k):
        return super().__getitem__(self._name(k))

    def __contains__(self, k):
        return super().__contains__(self._name(k))

    def get(self, k, default=None):
        return super().get(self._name(k), default)


class _Fixed:
    """Stands in for a compiled equation: an exogenous input (a function of time) or one constant per batch run."""

    refs: List[str] = []

    def __init__(self, fn: Callable[[dict], object]):
        self.fn = fn

    def __call__(self, s):
        return self.fn(s)

    def vectorized(self):
        return self.fn


def _input_fn(name: str, src) -> Callable[[float], float]:
    """An input as a function of time: a pandas Series (linear between its points, flat beyond) or a callable."""
    import pandas as pd

    if isinstance(src, pd.Series):
        src = src.sort_index()
        try:
            x, y = np.asarray(src.index, dtype=float), np.asarray(src.values, dtype=float)
        except (TypeError, ValueError):
            raise ModelError(f'inputs["{name}"]: the Series needs numbers, indexed by time (numbers too)') from None
        if len(x) == 0 or not (np.isfinite(x).all() and np.isfinite(y).all()):
            raise ModelError(f'inputs["{name}"]: the Series is empty or has missing or infinite values')
        if (np.diff(x) == 0).any():
            raise ModelError(f'inputs["{name}"]: the Series has two values for the same time')
        return lambda t: float(np.interp(t, x, y))
    if callable(src):

        def call(t: float) -> float:
            try:
                return float(src(t))
            except (TypeError, ValueError):
                raise ModelError(f'inputs["{name}"] must return one number for each time; at time {t:g} it returned {src(t)!r}') from None

        return call
    raise ModelError(f'inputs["{name}"] must be a pandas Series indexed by time or a function of time, not {type(src).__name__}')


class Model:
    """A stock-and-flow model: stocks, flows between them (or to and from outside), and variables.

    Load one with `molecule("stockmgmt")`, `Model.from_file(path)` or `Model.from_spec(dict)`; the dict may be a
    LoopBricks spec, a file exported from the app's model builder, or a bare model. Models do not change once made:
    with_equation, with_init and with_params return edited copies.
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
        self._check()
        raw = self.spec.get("params", {})
        self.ranges: Dict[str, dict] = _Ranges({self._key.get(k, k): dict(r) for k, r in raw.items()}, dict(self._key))

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

    def _find(self, name: str, kinds=("stock", "flow", "var")) -> Optional[dict]:
        """An element by its name (any case, spaces or underscores) or else its id."""
        e = self._by_key.get(name_key(str(name)))
        if e is None and name in self._key:
            e = self._by_key[self._key[name]]
        return e if e is not None and e["kind"] in kinds else None

    @property
    def params(self) -> Dict[str, float]:
        """Constants you can change in run(), by Python-friendly name, with their default values.

        A variable with an equation (Desired supply line = Demand * Acquisition_delay) is not listed: it is worked out
        from the others. Replace it with with_equation(), or with an exogenous series through run(inputs=...).
        """
        out = {}
        for v in self.vars:
            try:
                out[name_key(v["name"])] = float(v["eq"])
            except ValueError:
                pass
        return out

    def preset(self, label: str) -> Dict[str, float]:
        for p in self.presets:
            if p["label"].lower() == str(label).lower():
                return dict(p["params"])
        raise _unknown("preset", label, [p["label"] for p in self.presets], "Presets")

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

    # ---- edited copies -------------------------------------------------------------------------------------------
    def _edited(self, changes: Dict[str, tuple]) -> "Model":
        """A new model with changes {element id: (field, new text)}; the new equations are checked as usual."""
        spec = deepcopy(self.spec)
        for group in ("stocks", "flows", "vars"):
            for e in spec["model"].get(group, []):
                if e["id"] in changes:
                    field, value = changes[e["id"]]
                    e[field] = value
        return Model(spec)

    def _element(self, name: str, what: str = "element") -> dict:
        e = self._find(name)
        if e is None:
            raise _unknown(what, name, [name_key(x["name"]) for x in self._elements()], "Elements")
        return e

    def with_equation(self, name: str, eq: str) -> "Model":
        """A copy with a new equation for a flow or variable, e.g. m.with_equation("Demand", "10 + STEP(5, 10)")."""
        e = self._element(name, "flow or variable")
        if e["kind"] == "stock":
            raise ModelError(f'{e["name"]} is a stock: it changes only through its flows. Use with_init("{e["name"]}", ...) to change where it starts.')
        return self._edited({e["id"]: ("eq", str(eq))})

    def with_init(self, stock: str, value: Union[float, str]) -> "Model":
        """A copy where a stock starts at a number or an expression, e.g. m.with_init("Inventory", 80)."""
        e = self._element(stock, "stock")
        if e["kind"] != "stock":
            raise ModelError(f'{e["name"]} is not a stock, so it has no initial value. Use with_equation("{e["name"]}", ...) instead.')
        return self._edited({e["id"]: ("init", value if isinstance(value, str) else _num(value))})

    def with_params(self, **defaults: float) -> "Model":
        """A copy with new default values for constants, e.g. m.with_params(supply_line_weight=0)."""
        return self._edited({vid: ("eq", _num(v)) for vid, v in self._override(defaults).items()})

    # ---- checking run() arguments --------------------------------------------------------------------------------
    def _not_settable(self, e: dict) -> str:
        n = e["name"]
        if e["kind"] == "stock":
            return f'{n} is a stock: run() cannot set it, because its value comes from its flows. To change where it starts, use with_init("{n}", value).'
        what = "a flow" if e["kind"] == "flow" else "a variable"
        return (f'{n} is {what} worked out from "{e["eq"]}", so it is not a constant you can set. '
                f'Replace it with with_equation("{n}", ...), or feed it a series with run(inputs={{"{n}": ...}}).')

    def _override(self, params: Dict[str, float]) -> Dict[str, float]:
        """Map run() keywords (an element id or a name) to the constant they set, checking each."""
        settable = self.params
        out = {}
        var_ids = {v["id"] for v in self.vars}
        for k, val in params.items():
            # a variable's id first (presets use them), then a variable's name, then any element, to explain
            e = self._by_key[self._key[k]] if k in var_ids else self._find(k, ("var",)) or self._find(k)
            if e is None:
                raise _unknown("parameter", k, settable, "You can set")
            if name_key(e["name"]) not in settable:
                raise ModelError(self._not_settable(e))
            try:
                x = float(val)
            except (TypeError, ValueError):
                raise ModelError(f"{k} must be a number, not {val!r}") from None
            if not math.isfinite(x):
                raise ModelError(f"{k} must be a finite number, not {x}")
            out[e["id"]] = x
        return out

    def _inputs(self, inputs: Optional[dict]) -> Dict[str, _Fixed]:
        out = {}
        for k, src in (inputs or {}).items():
            e = self._find(k)
            if e is None:
                raise _unknown("variable or flow", k, [name_key(x["name"]) for x in self.flows + self.vars], "Inputs can replace")
            if e["kind"] == "stock":
                raise ModelError(f'{e["name"]} is a stock: an input can replace a flow or variable, not a stock. Use with_init("{e["name"]}", ...) to change where it starts.')
            fn = _input_fn(e["name"], src)
            out[e["id"]] = _Fixed(lambda s, fn=fn: fn(s["TIME"]))
        return out

    def _times(self, T, dt):
        T = self.T if T is None else T
        dt = self.dt if dt is None else dt
        try:
            T, dt = float(T), float(dt)
        except (TypeError, ValueError):
            raise ModelError(f"T and dt must be numbers, not {T!r} and {dt!r}") from None
        # ponytail: T = 0 is allowed (one row, the initial values); notebook 13 uses it to read an effect at time 0
        if not math.isfinite(T) or T < 0:
            raise ModelError(f"T (how long to run) must be a positive number, not {T:g}")
        if not math.isfinite(dt) or dt <= 0:
            raise ModelError(f"dt (the time step) must be a positive number, not {dt:g}")
        return T, dt

    def _keep(self, include) -> List[str]:
        if isinstance(include, str):
            if include == "all":
                return [e["id"] for e in self._elements()]
            if include == "stocks":
                return [s["id"] for s in self.stocks]
            close = difflib.get_close_matches(include, ["all", "stocks"], n=1)
            hint = f' Did you mean "{close[0]}"?' if close else ""
            raise ModelError(f'include must be "all", "stocks" or a list of names, not "{include}".{hint}')
        return [self._element(n, "variable")["id"] for n in include]

    def _code_for(self, preset, params, inputs) -> Dict[str, object]:
        settings = self._override({**(self.preset(preset) if preset else {}), **params})
        fed = self._inputs(inputs)
        both = set(settings) & set(fed)
        if both:
            raise ModelError(f"{', '.join(self._by_key[self._key[i]]['name'] for i in both)}: set either as a parameter or as an input, not both")
        code: Dict[str, object] = dict(self._code)
        for vid, x in settings.items():
            code[vid] = compile_expr(repr(x))
        code.update(fed)
        return code

    @staticmethod
    def _choice(what: str, value: str, options: List[str]) -> None:
        if value not in options:
            raise _unknown(what, value, options, "Use one of")

    # ---- simulation ----------------------------------------------------------------------------------------------
    def _bad(self, eid: str, v, t: float, runs: Optional[list] = None) -> str:
        where = ""
        if runs is not None:  # many runs at once: report the first one that went wrong
            v = np.broadcast_to(v, (len(runs),))
            j = int(np.argmax(~np.isfinite(v)))
            v, where = float(v[j]), f" in run {runs[j]!r}"
        # the same message as the app's model builder
        v = "NaN" if math.isnan(v) else ("Infinity" if v > 0 else "-Infinity")
        return f"{self._by_key[self._key[eid]]['name']} gave {v} at time {round(t, 6):g}{where}. Look for a division by zero, a root or log of a negative number, or explosive growth."

    def _simulate(self, code: Dict[str, object], T: float, dt: float, method: str, keep: List[str], runs: Optional[list] = None):
        """Step from time 0 to T and record the elements in keep at every step.

        One run works on floats. With runs (a list of run labels) every value is instead a numpy array with one entry
        per run; the steps and the arithmetic are the same, so each run gives the numbers run() would give.
        """
        vec = runs is not None
        ev = {eid: (c.vectorized() if vec else c) for eid, c in code.items()}
        steps = math.floor(T / dt + 0.5)  # Math.round in the app; Python's round() sends halves to even
        s: Dict[str, object] = {"TIME": 0.0, "DT": dt}

        def check(eid: str, v, t: float) -> None:
            if not (np.isfinite(v).all() if vec else math.isfinite(v)):
                raise ModelError(self._bad(eid, v, t, runs))

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
            s[self._key[eid]] = ev[eid](s)
            busy.discard(eid)
            done.add(eid)

        for e in self._elements():
            init(e["id"])
        for st in self.stocks:
            check(st["id"], s[self._key[st["id"]]], 0.0)

        stocks = [(st["id"], self._key[st["id"]], bool(st.get("nonNegative")), [self._key[f["id"]] for f in self.flows if f.get("to") == st["id"]], [self._key[f["id"]] for f in self.flows if f.get("from") == st["id"]]) for st in self.stocks]

        def rates(t: float) -> None:
            """Every flow and variable at time t, from the stock values now in s."""
            s["TIME"] = t
            for eid in self._order:
                v = s[self._key[eid]] = ev[eid](s)
                check(eid, v, t)

        def net() -> list:
            """Inflows minus outflows for each stock."""
            out = []
            for _, _, _, ins, outs in stocks:
                total_in = 0.0
                for k in ins:
                    total_in += s[k]
                total_out = 0.0
                for k in outs:
                    total_out += s[k]
                out.append(total_in - total_out)
            return out

        keys = [self._key[i] for i in keep]
        rows: list = []
        times: List[float] = []
        clipped: Dict[str, float] = {}
        for i in range(steps + 1):
            t = i * dt
            rates(t)
            times.append(round(t, 10))
            rows.append([s[k] for k in keys])
            if i == steps:
                break
            k1 = net()
            if method == "euler":
                nxt = [s[key] + dt * d for (_, key, _, _, _), d in zip(stocks, k1)]
            else:  # rk4: three more looks at the rates within the step; floors only at its end
                start = [s[key] for _, key, _, _, _ in stocks]

                def stage(frac: float, k: list) -> list:
                    for (_, key, _, _, _), x0, d in zip(stocks, start, k):
                        s[key] = x0 + frac * dt * d
                    rates(t + frac * dt)
                    return net()

                k2 = stage(0.5, k1)
                k3 = stage(0.5, k2)
                k4 = stage(1.0, k3)
                nxt = [x0 + dt / 6 * (a + 2 * b + 2 * c + d) for x0, a, b, c, d in zip(start, k1, k2, k3, k4)]
            for (sid, key, floor, _, _), v in zip(stocks, nxt):
                check(sid, v, t + dt)
                if floor:
                    if np.any(v < 0) if vec else v < 0:  # the floor is about to change the value
                        clipped.setdefault(self._by_key[key]["name"], round(t + dt, 10))
                    v = np.maximum(0.0, v) if vec else max(0.0, v)
                s[key] = v
        return times, rows, clipped

    def _warn_clips(self, clipped: Dict[str, float]) -> None:
        held = ", ".join(f"{n} (from time {t:g})" for n, t in clipped.items())
        warnings.warn(
            f"The floor at zero held up {held}: an outflow asked for more than the stock held, so the flows and the "
            'stock no longer add up exactly. The first times are in df.attrs["clipped"]; warn_clips=False hides this.',
            LoopBricksWarning,
            stacklevel=3,
        )

    def _labels(self, keep: List[str], columns: str) -> List[str]:
        self._choice("columns option", columns, ["name", "key"])
        names = [self._by_key[self._key[i]]["name"] for i in keep]
        return [name_key(n) for n in names] if columns == "key" else names

    def _units(self, keep: List[str], labels: List[str]) -> Dict[str, str]:
        return {lab: self._by_key[self._key[i]].get("units", "") for i, lab in zip(keep, labels)}

    def run(self, T: Optional[float] = None, dt: Optional[float] = None, preset: Optional[str] = None, include="all", *,
            inputs: Optional[dict] = None, method: str = "euler", columns: str = "name", warn_clips: bool = True, **params: float):
        """Simulate and return a pandas DataFrame indexed by time.

        T and dt default to the model's own settings. preset applies one of the model's named presets first;
        keyword arguments then set constants, for example run(supply_line_weight=0).

        include: "all" (default), "stocks", or a list of element names.
        inputs: {name: series or function} replaces a flow or variable by an exogenous input: a pandas Series indexed
            by time (straight lines between its points, flat beyond its ends) or a function of time.
        method: "euler" (default, the app's method and the only one that matches it) or "rk4" (fourth-order
            Runge-Kutta; floors at zero apply at the end of each full step).
        columns: "name" (default, "Supply line") or "key" (snake_case, "supply_line").
        warn_clips: warn when a floor at zero changed a stock. df.attrs["clipped"] gives {stock: first time} either
            way, and df.attrs["units"] the units of each column.
        """
        import pandas as pd

        T, dt = self._times(T, dt)
        self._choice("method", method, ["euler", "rk4"])
        keep = self._keep(include)
        labels = self._labels(keep, columns)
        code = self._code_for(preset, params, inputs)
        times, rows, clipped = self._simulate(code, T, dt, method, keep)
        df = pd.DataFrame(rows, index=pd.Index(times, name=f"time ({self.time_unit})" if self.time_unit else "time"), columns=labels)
        df.attrs["units"] = self._units(keep, labels)
        df.attrs["clipped"] = clipped
        if clipped and warn_clips:
            self._warn_clips(clipped)
        return df

    def run_batch(self, params, T: Optional[float] = None, dt: Optional[float] = None, include="stocks", *,
                  inputs: Optional[dict] = None, method: str = "euler", columns: str = "name", warn_clips: bool = True):
        """Many runs at once, one per row of params, worked out together with numpy.

        params: a pandas DataFrame (one row per run, columns named like run()'s keywords) or a list of dicts.
        Constants a row leaves out keep their defaults. Each run gives the same numbers as run() with those settings.

        Returns a tidy pandas DataFrame with columns run, time, variable, value: run is the row's label in params
        (0, 1, 2, ... for a list), so results join back to the settings, and it plots straight away with seaborn or
        groupby. For an array, pivot one variable:
            out[out.variable == "Inventory"].pivot(index="time", columns="run", values="value")
        include defaults to "stocks"; the other options are as in run(). attrs["clipped"] gives each stock the
        first time a floor held it at zero in any run.
        """
        import pandas as pd

        if isinstance(params, pd.DataFrame):
            runs, rows = list(params.index), params.to_dict("records")
        else:
            rows = [dict(r) for r in params]
            runs = list(range(len(rows)))
        if not rows:
            raise ModelError("params has no rows: give one row (or one dict) per run")
        T, dt = self._times(T, dt)
        self._choice("method", method, ["euler", "rk4"])
        keep = self._keep(include)
        labels = self._labels(keep, columns)
        code = self._code_for(None, {}, inputs)
        defaults = self.params
        names = list(dict.fromkeys(k for r in rows for k in r))
        for k in names:
            vid = next(iter(self._override({k: 0.0})))  # checks the name
            if vid in code and isinstance(code[vid], _Fixed):
                raise ModelError(f"{k}: set either as a parameter or as an input, not both")
            values = [r.get(k, defaults[self._key[vid]]) for r in rows]
            try:
                arr = np.array(values, dtype=float)
            except (TypeError, ValueError):
                raise ModelError(f"params[{k!r}] must hold numbers") from None
            if not np.isfinite(arr).all():
                raise ModelError(f"params[{k!r}] has missing or infinite values (run {runs[int(np.argmax(~np.isfinite(arr)))]!r})")
            code[vid] = _Fixed(lambda s, arr=arr: arr)
        n = len(runs)
        with np.errstate(all="ignore"):  # inf and nan are values here, checked after each step, as in run()
            times, recorded, clipped = self._simulate(code, T, dt, method, keep, runs)
        nt, nk = len(times), len(keep)
        data = np.empty((nt, nk, n))  # time, variable, run
        for i, row in enumerate(recorded):
            for j, v in enumerate(row):
                data[i, j] = v  # a constant fills every run
        out = pd.DataFrame({
            "run": pd.Index(runs).take(np.tile(np.repeat(np.arange(n), nt), nk)),
            "time": np.tile(times, nk * n),
            "variable": pd.Categorical.from_codes(np.repeat(np.arange(nk), n * nt), categories=labels),
            "value": data.transpose(1, 2, 0).ravel(),
        })
        out.attrs["units"] = self._units(keep, labels)
        out.attrs["clipped"] = clipped
        if clipped and warn_clips:
            self._warn_clips(clipped)
        return out

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
        raise _unknown("molecule", key, molecules(), "Available")
    return Model(json.loads(path.read_text(encoding="utf-8")))
