import math
import re

import pytest

from loopbricks import ExprError, Model, compile_expr


def ev(src, TIME=0.0, **scope):
    return compile_expr(src)({"TIME": TIME, **{k.lower(): v for k, v in scope.items()}})


def test_precedence():
    assert ev("2 + 3 * 4") == 14
    assert ev("-2 ^ 2") == -4
    assert ev("2 ^ -1") == 0.5
    assert ev("2 ^ 3 ^ 2") == 512
    assert ev("1 + 2 < 4") == 1
    assert ev("(1 + 2) * 3 − 1") == 8  # the Unicode minus works too
    assert ev("6 ÷ 3 × 2") == 4


def test_functions():
    assert ev("MAX(1, 5, 3)") == 5
    assert ev("IF(x > 2, 10, 20)", x=3) == 10
    assert ev("STEP(5, 10)", TIME=9.9) == 0 and ev("STEP(5, 10)", TIME=10) == 5
    assert ev("PULSE(2, 3, 1)", TIME=3.5) == 2 and ev("PULSE(2, 3, 1)", TIME=4) == 0
    assert ev("RAMP(2, 1)", TIME=4) == 6


def test_javascript_arithmetic():
    assert ev("1 / 0") == math.inf and ev("-1 / 0") == -math.inf and math.isnan(ev("0 / 0"))
    assert math.isnan(ev("SQRT(-1)")) and ev("LN(0)") == -math.inf and math.isnan(ev("(-8) ^ 0.5"))


def test_names_ignore_case_and_spaces():
    assert ev('Desired_inventory + "desired inventory"', desired_inventory=3) == 6


@pytest.mark.parametrize(
    "src,msg",
    [("2 (3)", "operator missing"), ("MAX(1)", "takes at least 2"), ("(1 + 2", 'Missing ")"'), ("2x", "runs into a name"), ("FOO(1)", "Unknown function")],
)
def test_errors(src, msg):
    with pytest.raises(ExprError, match=re.escape(msg)):
        compile_expr(src)


def test_builder_export_loads_and_runs():
    exported = {
        "format": "loopbricks-builder",
        "version": 1,
        "model": {
            "name": "Bathtub",
            "timeUnit": "minute",
            "T": 40,
            "dt": 0.25,
            "stocks": [{"id": "s1", "name": "Water", "init": "0", "x": 0, "y": 0}],
            "flows": [
                {"id": "f1", "name": "Faucet", "to": "s1", "eq": "10", "x": 0, "y": 0},
                {"id": "f2", "name": "Drain", "from": "s1", "eq": "Water / Drain_time", "x": 0, "y": 0},
            ],
            "vars": [{"id": "v1", "name": "Drain time", "eq": "5", "x": 0, "y": 0}],
        },
    }
    df = Model.from_spec(exported).run()
    assert df["Water"].iloc[-1] == pytest.approx(50 * (1 - 0.95**160), abs=1e-9)  # Euler with dt 0.25 and drain time 5


# The app's JavaScript arithmetic, where Python's differs: NaN spreads, -0 counts, halves round up, digits are ASCII.
@pytest.mark.parametrize("src", ["MIN(5, SQRT(-1))", "MAX(SQRT(-1), 5)", "1^SQRT(-1)", "(-1)^(1/0)"])
def test_nan_spreads_like_javascript(src):
    assert math.isnan(ev(src))


def test_max_of_zeros_is_plus_zero():
    assert ev("1/MAX(-0, 0)") == math.inf


def test_unicode_digits_rejected():
    with pytest.raises(ExprError):
        compile_expr("2٣ + 1")


def _one_stock(eq, T=5, dt=1):
    return Model.from_spec({"name": "x", "T": T, "dt": dt, "stocks": [{"id": "s", "name": "S", "init": "10", "x": 0, "y": 0}],
                            "flows": [{"id": "f", "name": "Out", "from": "s", "eq": eq, "x": 0, "y": 0}], "vars": []})


def test_non_finite_values_stop_the_run():
    from loopbricks.model import ModelError
    with pytest.raises(ModelError, match="Out gave Infinity at time 2"):
        _one_stock("1/(TIME-2)").run()


def test_step_count_rounds_halves_up():
    assert list(_one_stock("0", T=10, dt=4).run().index) == [0, 4, 8, 12]  # Math.round(2.5) = 3 steps, as in the app


# TABLE: the same cases as scripts/check.ts, so the app and the package give the same numbers
TABLE = "TABLE(x, 0, 0, 10, 1, 20, 0.5)"


@pytest.mark.parametrize(
    "src,x,want",
    [(TABLE, -5, 0), (TABLE, 0, 0), (TABLE, 2.5, 0.25), (TABLE, 10, 1), (TABLE, 15, 0.75), (TABLE, 20, 0.5), (TABLE, 1e9, 0.5),
     ("TABLE(x, -1, 2, 1, -2)", 0.5, -1), ("TABLE(x / 2, -1, 2, 1, -2)", -4, 2)],
)
def test_table(src, x, want):
    assert ev(src, x=x) == want


def test_table_of_nan_is_nan():
    assert math.isnan(ev("TABLE(x, 0, 0, 1, 1)", x=math.nan))


@pytest.mark.parametrize(
    "src,msg",
    [("TABLE(x, 0, 1)", "at least 2 points"), ("TABLE(x, 0, 1, 2)", "a y for every x"), ("TABLE(x, 0, 1, a, 2)", "plain numbers"),
     ("TABLE(x, 0, 1, 0, 2)", "must increase: 0 comes after 0"), ("TABLE(x, 2, 1, 1, 2)", "must increase"), ("TABLE + 1", "is a function")],
)
def test_table_errors(src, msg):
    with pytest.raises(ExprError, match=re.escape(msg)):
        compile_expr(src)
