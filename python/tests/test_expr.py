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
