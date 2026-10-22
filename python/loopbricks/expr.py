"""The LoopBricks equation language, ported from the app (src/lib/expr.ts) so both give identical numbers.

Numbers, names, + - * / ^, unary minus, parentheses, comparisons < <= > >= = <> (true is 1, false is 0) and
MIN, MAX, ABS, EXP, LN, SQRT, IF(cond, a, b), STEP(height, time), PULSE(height, start, width), RAMP(slope, start),
TABLE(x, x1, y1, x2, y2, ...) (straight lines between the points, flat beyond the ends) and TIME.
Names ignore case; spaces and underscores are the same; "quoted names" may contain spaces.
Arithmetic follows JavaScript so edge cases match the app: x/0 is +-inf (0/0 is nan), roots and logs of
negative numbers are nan, and overflow is inf rather than an exception.

Every equation compiles two ways from the same syntax tree: to plain Python for one run (Compiled.__call__) and to
numpy array operations for many runs at once (Compiled.vectorized), with the same arithmetic.
"""
from __future__ import annotations

import math
import re
from dataclasses import dataclass, field
from typing import Callable, Dict, List

import numpy as np

Scope = Dict[str, float]  # keys from name_key(); TIME and DT live under the upper-case keys


class LoopBricksError(ValueError):
    """Every error the package raises on purpose is one of these, with a message meant for people."""


class LoopBricksWarning(UserWarning):
    pass


class ExprError(LoopBricksError):
    def __init__(self, msg: str, pos: int):
        super().__init__(msg)
        self.pos = pos


def name_key(name: str) -> str:
    return re.sub(r"[\s_]+", "_", name.strip().lower())


FUNCS = {"MIN": (2, 99), "MAX": (2, 99), "ABS": (1, 1), "EXP": (1, 1), "LN": (1, 1), "SQRT": (1, 1), "IF": (3, 3), "STEP": (2, 2), "PULSE": (3, 3), "RAMP": (2, 2), "TABLE": (5, 999), "TIME": (0, 0)}
OPS = {"+": "+", "-": "-", "−": "-", "–": "-", "*": "*", "×": "*", "·": "*", "/": "/", "÷": "/", "^": "^", "(": "(", ")": ")", ",": ",", "<": "<", ">": ">", "=": "=", "≤": "<=", "≥": ">=", "≠": "<>"}
CMP = ("<", "<=", ">", ">=", "=", "<>")
_NUM = re.compile(r"([0-9]+\.?[0-9]*|\.[0-9]+)([eE][+-]?[0-9]+)?")  # ASCII digits only, as in the app
_NAME = re.compile(r"[^\W\d]\w*")


@dataclass
class Tok:
    t: str  # num, name, op, end
    p: int
    v: object = None
    raw: str = ""
    quoted: bool = False


def _at(p: int) -> str:
    return f"at character {p + 1}"


def _show(t: Tok) -> str:
    if t.t == "end":
        return "the end"
    if t.t == "name":
        return f'"{t.raw}"'
    return f'"{t.v}"'


def tokenize(src: str) -> List[Tok]:
    out: List[Tok] = []
    i = 0
    while i < len(src):
        c = src[i]
        if c.isspace():
            i += 1
            continue
        m = _NUM.match(src, i)
        if m:
            out.append(Tok("num", i, float(m.group(0))))
            i = m.end()
            if i < len(src) and (src[i].isalpha() or src[i] == "_"):
                raise ExprError(f"A number runs into a name {_at(i)}; put * between them", i)
            continue
        m = _NAME.match(src, i)
        if m:
            out.append(Tok("name", i, name_key(m.group(0)), m.group(0)))
            i = m.end()
            continue
        if c == '"':
            close = src.find('"', i + 1)
            if close < 0:
                raise ExprError(f"Missing closing quote for the name that starts {_at(i)}", i)
            raw = src[i + 1 : close]
            if not raw.strip():
                raise ExprError(f"Empty quoted name {_at(i)}", i)
            out.append(Tok("name", i, name_key(raw), raw, True))
            i = close + 1
            continue
        two = src[i : i + 2]
        if two in ("<=", ">=", "<>", "!="):
            out.append(Tok("op", i, "<>" if two == "!=" else two))
            i += 2
            continue
        if c in OPS:
            out.append(Tok("op", i, OPS[c]))
            i += 1
            continue
        raise ExprError(f'Unexpected character "{c}" {_at(i)}', i)
    out.append(Tok("end", len(src)))
    return out


# AST nodes are tuples: ("num", v) ("time",) ("dt",) ("name", key, raw) ("neg", a) ("bin", op, a, b) ("call", f, [args])
def parse(src: str):
    if not src.strip():
        raise ExprError("The equation is empty", 0)
    toks = tokenize(src)
    i = 0

    def peek() -> Tok:
        return toks[i]

    def is_op(v: str) -> bool:
        return peek().t == "op" and peek().v == v

    def expect(v: str, open_tok: Tok | None = None):
        nonlocal i
        if is_op(v):
            i += 1
            return
        t = peek()
        if v == ")" and open_tok is not None:
            raise ExprError(f'Missing ")" to close the "(" {_at(open_tok.p)}; found {_show(t)} {_at(t.p)}', t.p)
        raise ExprError(f'Expected "{v}" but found {_show(t)} {_at(t.p)}', t.p)

    def cmp():
        nonlocal i
        a = add()
        while peek().t == "op" and peek().v in CMP:
            op = toks[i].v
            i += 1
            a = ("bin", op, a, add())
        return a

    def add():
        nonlocal i
        a = mul()
        while is_op("+") or is_op("-"):
            op = toks[i].v
            i += 1
            a = ("bin", op, a, mul())
        return a

    def mul():
        nonlocal i
        a = unary()
        while is_op("*") or is_op("/"):
            op = toks[i].v
            i += 1
            a = ("bin", op, a, unary())
        return a

    # -2^2 is -(2^2), and 2^-1 works: unary sits below power, and the exponent is itself unary
    def unary():
        nonlocal i
        if is_op("-"):
            i += 1
            return ("neg", unary())
        if is_op("+"):
            i += 1
            return unary()
        return power()

    def power():
        nonlocal i
        a = primary()
        if is_op("^"):
            i += 1
            return ("bin", "^", a, unary())
        return a

    def primary():
        nonlocal i
        t = peek()
        if t.t == "num":
            i += 1
            return ("num", t.v)
        if t.t == "op" and t.v == "(":
            i += 1
            e = cmp()
            expect(")", t)
            return e
        if t.t == "name":
            i += 1
            upper = t.raw.upper()
            if not t.quoted and is_op("("):
                open_tok = toks[i]
                i += 1
                if upper not in FUNCS:
                    raise ExprError(f'Unknown function "{t.raw}" {_at(t.p)}. Functions: {", ".join(FUNCS)}', t.p)
                args = []
                if not is_op(")"):
                    args.append(cmp())
                    while is_op(","):
                        i += 1
                        args.append(cmp())
                expect(")", open_tok)
                if upper == "TABLE":
                    _table_args(args, t.p)
                lo, hi = FUNCS[upper]
                if not lo <= len(args) <= hi:
                    want = f"{lo}" if lo == hi else (f"at least {lo}" if hi > 10 else f"{lo} to {hi}")
                    s = "" if lo == 1 and hi == 1 else "s"
                    raise ExprError(f"{upper} takes {want} argument{s}, not {len(args)} ({_at(t.p)})", t.p)
                return ("time",) if upper == "TIME" else ("call", upper, args)
            if not t.quoted and upper == "TIME":
                return ("time",)
            if not t.quoted and upper == "DT":
                return ("dt",)
            if not t.quoted and upper in FUNCS:
                raise ExprError(f"{upper} is a function: write {upper}(...) {_at(t.p)}", t.p)
            return ("name", t.v, t.raw)
        if t.t == "end":
            raise ExprError(f'The equation ends too early: expected a number, a name or "(" {_at(t.p)}', t.p)
        raise ExprError(f"Unexpected {_show(t)} {_at(t.p)}", t.p)

    e = cmp()
    t = peek()
    if t.t != "end":
        if t.t == "op" and t.v == ")":
            raise ExprError(f'Unexpected ")" {_at(t.p)}: there is no "(" to match it', t.p)
        raise ExprError(f"Unexpected {_show(t)} {_at(t.p)}; is an operator missing?", t.p)
    return e


def _literal(n):
    """The value of a plain number, or a minus sign and a number; None for anything else."""
    if n[0] == "num":
        return n[1]
    if n[0] == "neg" and n[1][0] == "num":
        return -n[1][1]
    return None


def _js(v: float) -> str:
    return str(int(v)) if v.is_integer() else repr(v)  # 2 rather than 2.0, as JavaScript prints it


def _table_args(args: list, p: int) -> None:
    """TABLE's points must be numbers, in pairs, at least two, with x increasing."""
    pts = args[1:]
    if len(pts) % 2:
        raise ExprError(f"TABLE needs a y for every x: after the input, give the points as x, y pairs ({_at(p)})", p)
    if len(pts) < 4:
        raise ExprError(f"TABLE needs an input and at least 2 points: TABLE(input, x1, y1, x2, y2, ...) ({_at(p)})", p)
    nums = [_literal(a) for a in pts]
    if any(v is None for v in nums):
        raise ExprError(f"TABLE points must be plain numbers, not names or formulas ({_at(p)})", p)
    for j in range(2, len(nums), 2):
        if not nums[j] > nums[j - 2]:
            raise ExprError(f"TABLE x values must increase: {_js(nums[j])} comes after {_js(nums[j - 2])} ({_at(p)})", p)


def _points(args: list):
    pts = [_literal(a) for a in args[1:]]
    return pts[0::2], pts[1::2]


def table(x: float, xs: List[float], ys: List[float]) -> float:
    """Piecewise linear between the points, flat beyond the ends (as Vensim lookups behave)."""
    if math.isnan(x):
        return math.nan
    n = len(xs) - 1
    if x <= xs[0]:
        return ys[0]
    if x >= xs[n]:
        return ys[n]
    i = 0
    while x >= xs[i + 1]:
        i += 1
    return ys[i] + (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]) * (x - xs[i])


# ---- JavaScript-compatible arithmetic ----------------------------------------------------------------------------
def _div(a: float, b: float) -> float:
    if b == 0:
        if a == 0 or math.isnan(a):
            return math.nan
        return math.copysign(math.inf, a) * (math.copysign(1.0, b))
    return a / b


def _minmax(fn, xs: list) -> float:
    # like Math.min/Math.max: any NaN gives NaN, and -0 counts as less than 0
    if any(math.isnan(x) for x in xs):
        return math.nan
    return fn(xs, key=lambda x: (x, math.copysign(1.0, x)))


def _pow(a: float, b: float) -> float:
    if math.isnan(a) or math.isnan(b) or (abs(a) == 1 and math.isinf(b)):
        return math.nan  # JavaScript: 1 ** NaN and (-1) ** Infinity are NaN, Python says 1
    try:
        return math.pow(a, b)
    except ValueError:  # negative base, fractional exponent; or 0 to a negative power
        if a == 0 and b < 0:
            odd = float(b).is_integer() and int(b) % 2 == 1
            return math.copysign(math.inf, a) if odd else math.inf  # (-0) ^ -1 is -inf in JavaScript
        return math.nan
    except OverflowError:
        return math.inf if a > 0 or float(b).is_integer() and int(b) % 2 == 0 else -math.inf


def _ln(a: float) -> float:
    if a == 0:
        return -math.inf
    if a < 0 or math.isnan(a):
        return math.nan
    return math.log(a)


def _sqrt(a: float) -> float:
    return math.sqrt(a) if a >= 0 else math.nan


def _exp(a: float) -> float:
    try:
        return math.exp(a)
    except OverflowError:
        return math.inf


Fn = Callable[[Scope], float]


def _build(n) -> Fn:
    k = n[0]
    if k == "num":
        v = n[1]
        return lambda s: v
    if k == "time":
        return lambda s: s.get("TIME", 0.0)
    if k == "dt":
        return lambda s: s.get("DT", 1.0)
    if k == "name":
        key = n[1]

        def get(s: Scope) -> float:
            if key not in s:
                raise ExprError(f'Unknown name "{n[2]}"', 0)
            return s[key]

        return get
    if k == "neg":
        a = _build(n[1])
        return lambda s: -a(s)
    if k == "bin":
        op, a, b = n[1], _build(n[2]), _build(n[3])
        return {
            "+": lambda s: a(s) + b(s),
            "-": lambda s: a(s) - b(s),
            "*": lambda s: a(s) * b(s),
            "/": lambda s: _div(a(s), b(s)),
            "^": lambda s: _pow(a(s), b(s)),
            "<": lambda s: float(a(s) < b(s)),
            "<=": lambda s: float(a(s) <= b(s)),
            ">": lambda s: float(a(s) > b(s)),
            ">=": lambda s: float(a(s) >= b(s)),
            "=": lambda s: float(a(s) == b(s)),
            "<>": lambda s: float(a(s) != b(s)),
        }[op]
    f, args = n[1], [_build(x) for x in n[2]]

    def t(s: Scope) -> float:
        return s.get("TIME", 0.0)

    if f == "MIN":
        return lambda s: _minmax(min, [g(s) for g in args])
    if f == "MAX":
        return lambda s: _minmax(max, [g(s) for g in args])
    if f == "ABS":
        return lambda s: abs(args[0](s))
    if f == "EXP":
        return lambda s: _exp(args[0](s))
    if f == "LN":
        return lambda s: _ln(args[0](s))
    if f == "SQRT":
        return lambda s: _sqrt(args[0](s))
    if f == "IF":  # only the chosen branch is evaluated
        return lambda s: args[1](s) if args[0](s) != 0 else args[2](s)
    if f == "STEP":
        return lambda s: args[0](s) if t(s) >= args[1](s) - 1e-9 else 0.0
    if f == "PULSE":

        def pulse(s: Scope) -> float:
            start = args[1](s)
            w = args[2](s) if args[2](s) > 0 else s.get("DT", 1.0)  # a zero width lasts one time step
            return args[0](s) if start - 1e-9 <= t(s) < start + w - 1e-9 else 0.0

        return pulse
    if f == "RAMP":
        return lambda s: args[0](s) * (t(s) - args[1](s)) if t(s) > args[1](s) else 0.0
    if f == "TABLE":
        xs, ys = _points(n[2])
        return lambda s: table(args[0](s), xs, ys)
    raise ExprError(f"unknown function {f}", 0)


# ---- the same equations on numpy arrays (one value per run) -----------------------------------------------------
# Each helper gives element by element what the scalar version above gives, including NaN, -0 and infinities.
def _np_pow(a, b):
    r = np.power(a, b)
    return np.where(np.isnan(a) | np.isnan(b) | ((np.abs(a) == 1) & np.isinf(b)), np.nan, r)


def _np_min(a, b):
    tie = a == b  # only -0 and 0 can tie with different results; Math.min picks -0
    return np.where(tie, np.where(np.signbit(a), a, b), np.minimum(a, b))


def _np_max(a, b):
    tie = a == b
    return np.where(tie, np.where(np.signbit(a), b, a), np.maximum(a, b))


def _np_ln(a):
    return np.where(a == 0, -np.inf, np.log(a))


def _np_table(x, xs, ys):
    xs_a, ys_a = np.array(xs), np.array(ys)
    i = np.clip(np.searchsorted(xs_a, x, side="right") - 1, 0, len(xs) - 2)  # the segment x falls in
    x0, x1, y0, y1 = xs_a[i], xs_a[i + 1], ys_a[i], ys_a[i + 1]
    inside = y0 + (y1 - y0) / (x1 - x0) * (x - x0)
    return np.where(np.isnan(x), np.nan, np.where(x <= xs[0], ys[0], np.where(x >= xs[-1], ys[-1], inside)))


def _build_np(n) -> Fn:
    k = n[0]
    if k == "num":
        v = n[1]
        return lambda s: v
    if k == "time":
        return lambda s: s.get("TIME", 0.0)
    if k == "dt":
        return lambda s: s.get("DT", 1.0)
    if k == "name":
        key, raw = n[1], n[2]

        def get(s):
            if key not in s:
                raise ExprError(f'Unknown name "{raw}"', 0)
            return s[key]

        return get
    if k == "neg":
        a = _build_np(n[1])
        return lambda s: np.negative(a(s))
    if k == "bin":
        op, a, b = n[1], _build_np(n[2]), _build_np(n[3])
        return {
            "+": lambda s: np.add(a(s), b(s)),
            "-": lambda s: np.subtract(a(s), b(s)),
            "*": lambda s: np.multiply(a(s), b(s)),
            "/": lambda s: np.divide(a(s), b(s)),
            "^": lambda s: _np_pow(a(s), b(s)),
            "<": lambda s: np.less(a(s), b(s)) * 1.0,
            "<=": lambda s: np.less_equal(a(s), b(s)) * 1.0,
            ">": lambda s: np.greater(a(s), b(s)) * 1.0,
            ">=": lambda s: np.greater_equal(a(s), b(s)) * 1.0,
            "=": lambda s: np.equal(a(s), b(s)) * 1.0,
            "<>": lambda s: np.not_equal(a(s), b(s)) * 1.0,
        }[op]
    f, args = n[1], [_build_np(x) for x in n[2]]

    def t(s):
        return s.get("TIME", 0.0)

    def fold(pick):
        def run(s):
            acc = args[0](s)
            for g in args[1:]:
                acc = pick(acc, g(s))
            return acc

        return run

    if f == "MIN":
        return fold(_np_min)
    if f == "MAX":
        return fold(_np_max)
    if f == "ABS":
        return lambda s: np.abs(args[0](s))
    if f == "EXP":
        return lambda s: np.exp(args[0](s))
    if f == "LN":
        return lambda s: _np_ln(args[0](s))
    if f == "SQRT":
        return lambda s: np.sqrt(args[0](s))
    if f == "IF":  # both branches are worked out, for every run, then each run takes its own
        return lambda s: np.where(np.not_equal(args[0](s), 0), args[1](s), args[2](s))
    if f == "STEP":
        return lambda s: np.where(t(s) >= np.subtract(args[1](s), 1e-9), args[0](s), 0.0)
    if f == "PULSE":

        def pulse(s):
            start, w = args[1](s), args[2](s)
            w = np.where(np.greater(w, 0), w, s.get("DT", 1.0))
            return np.where((start - 1e-9 <= t(s)) & (t(s) < start + w - 1e-9), args[0](s), 0.0)

        return pulse
    if f == "RAMP":
        return lambda s: np.where(t(s) > args[1](s), np.multiply(args[0](s), t(s) - args[1](s)), 0.0)
    if f == "TABLE":
        xs, ys = _points(n[2])
        return lambda s: _np_table(args[0](s), xs, ys)
    raise ExprError(f"unknown function {f}", 0)


def _refs(n, out: List[str]) -> List[str]:
    k = n[0]
    if k == "name":
        out.append(n[1])
    elif k == "neg":
        _refs(n[1], out)
    elif k == "bin":
        _refs(n[2], out)
        _refs(n[3], out)
    elif k == "call":
        for a in n[2]:
            _refs(a, out)
    return out


@dataclass
class Compiled:
    src: str
    ast: tuple
    refs: List[str] = field(default_factory=list)
    fn: Fn = None  # type: ignore[assignment]

    def __call__(self, scope: Scope) -> float:
        return self.fn(scope)

    def vectorized(self) -> Fn:
        """The same equation on numpy arrays; call it inside np.errstate(all="ignore") as Model.run_batch does."""
        if not hasattr(self, "_np"):
            self._np = _build_np(self.ast)
        return self._np


def compile_expr(src: str) -> Compiled:
    ast = parse(src)
    return Compiled(src, ast, list(dict.fromkeys(_refs(ast, []))), _build(ast))
