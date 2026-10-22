"""run() options, edited copies and the messages people see when something is wrong."""
import math
import warnings

import pandas as pd
import pytest

import loopbricks as lb
from loopbricks import LoopBricksError, LoopBricksWarning, Model, ModelError


@pytest.fixture
def sm():
    return lb.molecule("stockmgmt")


def leaky(floor=True, out="3", T=6, dt=1):
    return Model.from_spec({"name": "Leaky", "T": T, "dt": dt, "stocks": [{"id": "s", "name": "Tank", "init": "10", "nonNegative": floor, "units": "litres"}],
                            "flows": [{"id": "f", "name": "Drain", "from": "s", "eq": out}], "vars": []})


# ---- errors --------------------------------------------------------------------------------------------------------
def test_errors_share_a_base_and_old_names_still_work():
    assert issubclass(lb.ModelError, LoopBricksError) and issubclass(lb.ExprError, LoopBricksError) and issubclass(LoopBricksError, ValueError)
    with pytest.raises(KeyError):  # 0.1 raised KeyError for unknown names; that still catches them
        lb.molecule("stockmgnt")


@pytest.mark.parametrize(
    "call,msg",
    [(lambda m: m.run(suply_line_weight=0), 'Did you mean "supply_line_weight"'),
     (lambda m: m.run(preset="Stable"), 'Did you mean "Stable (sees pipeline)"'),
     (lambda m: m.run(inputs={"Demmand": lambda t: 1}), 'Did you mean "demand"'),
     (lambda m: m.run(include=["Inventry"]), 'Did you mean "inventory"'),
     (lambda m: lb.molecule("stockmgnt"), 'Did you mean "stockmgmt"')],
)
def test_did_you_mean(sm, call, msg):
    with pytest.raises(LoopBricksError, match=lb.expr.re.escape(msg)):
        call(sm)


@pytest.mark.parametrize("kw,msg", [({"T": -1}, "T (how long"), ({"dt": 0}, "dt (the time step)"), ({"dt": math.nan}, "dt (the time step)"),
                                    ({"T": math.inf}, "T (how long"), ({"include": "stock"}, 'Did you mean "stocks"'), ({"method": "rk5"}, 'Did you mean "rk4"'),
                                    ({"columns": "keys"}, 'Did you mean "key"'), ({"demand": "lots"}, "must be a number")])
def test_bad_run_arguments(sm, kw, msg):
    with pytest.raises(LoopBricksError, match=lb.expr.re.escape(msg)):
        sm.run(**kw)


def test_expressions_and_stocks_are_not_settable_and_say_why(sm):
    with pytest.raises(ModelError, match="worked out from"):
        sm.run(desired_supply_line=50)
    with pytest.raises(ModelError, match="with_init"):
        sm.run(inventory=50)
    assert "desired_supply_line" not in sm.params


def test_ranges_by_name_or_id(sm):
    assert sm.ranges["supply_line_weight"] == sm.ranges["slw"] == {"min": 0, "max": 1, "step": 0.05}
    assert "slw" in sm.ranges and list(sm.ranges)[0] == "demand"


# ---- output --------------------------------------------------------------------------------------------------------
def test_columns_units_and_include(sm):
    df = sm.run(columns="key", include=["Inventory", "Orders"])
    assert list(df.columns) == ["inventory", "orders"]
    assert df.attrs["units"] == {"inventory": "units", "orders": "units/week"}
    assert list(sm.run(include="stocks").columns) == ["Supply line", "Inventory"]


def test_zero_length_run_gives_the_initial_values(sm):
    assert len(sm.run(T=0)) == 1


# ---- inputs and edited copies --------------------------------------------------------------------------------------
def test_series_input_is_interpolated_and_held_flat(sm):
    df = sm.run(inputs={"Demand": pd.Series([10.0, 20.0], index=[0.0, 10.0])})
    assert df.loc[5.0, "Demand"] == 15 and df.loc[30.0, "Demand"] == 20 and df.loc[0.0, "Demand"] == 10


def test_function_input_matches_the_same_equation(sm):
    fed = sm.run(dt=0.25, inputs={"demand": lambda t: 10 + 5 * (t >= 5)})
    edited = sm.with_equation("Demand", "10 + STEP(5, 5)").run(dt=0.25)
    pd.testing.assert_frame_equal(fed, edited)


def test_input_errors(sm):
    with pytest.raises(ModelError, match="not a stock"):
        sm.run(inputs={"Inventory": lambda t: 1})
    with pytest.raises(ModelError, match="a pandas Series indexed by time or a function of time"):
        sm.run(inputs={"Demand": [1, 2]})
    with pytest.raises(ModelError, match="not both"):
        sm.run(demand=3, inputs={"Demand": lambda t: 1})


def test_edited_copies_leave_the_original_alone(sm):
    m2 = sm.with_params(supply_line_weight=0).with_init("Inventory", 80)
    assert m2.params["supply_line_weight"] == 0 and sm.params["supply_line_weight"] == 1
    assert m2.run().iloc[0]["Inventory"] == 80 and sm.run().iloc[0]["Inventory"] == 60
    pd.testing.assert_frame_equal(m2.run(), sm.with_init("Inventory", "Desired_inventory * 0.8").run(supply_line_weight=0))


def test_edit_errors(sm):
    with pytest.raises(ModelError, match="with_init"):
        sm.with_equation("Inventory", "5")
    with pytest.raises(ModelError, match="Orders: "):
        sm.with_equation("Orders", "MAX(1")
    with pytest.raises(ModelError, match="not a stock"):
        sm.with_init("Demand", 5)


# ---- integrators and floors ----------------------------------------------------------------------------------------
def test_rk4_is_far_more_accurate_than_euler():
    decay = leaky(floor=False, out="Tank", T=2, dt=0.1)
    exact = 10 * math.exp(-2)
    euler, rk4 = decay.run()["Tank"].iloc[-1], decay.run(method="rk4")["Tank"].iloc[-1]
    assert abs(rk4 - exact) < 1e-5 < abs(euler - exact)


def test_clips_are_recorded_and_warned_once():
    with pytest.warns(LoopBricksWarning, match="Tank"):
        df = leaky().run()
    assert df.attrs["clipped"] == {"Tank": 4.0} and df["Tank"].tolist() == [10, 7, 4, 1, 0, 0, 0]
    with warnings.catch_warnings():
        warnings.simplefilter("error")
        assert leaky().run(warn_clips=False).attrs["clipped"] == {"Tank": 4.0}
        assert leaky(floor=False).run().attrs["clipped"] == {}
