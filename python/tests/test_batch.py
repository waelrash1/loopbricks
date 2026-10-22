"""run_batch() must give, for every run, exactly the numbers run() gives with the same settings."""
import numpy as np
import pandas as pd
import pytest

import loopbricks as lb
from loopbricks import ModelError


def settings(m, n, seed):
    rng = np.random.default_rng(seed)
    return [{k: float(rng.uniform(r["min"], r["max"])) for k, r in m.ranges.items()} for _ in range(n)]


def assert_same(m, out, rows, **kw):
    for j, row in enumerate(rows):
        df = m.run(**row, **kw)
        got = out[out.run == j].pivot(index="time", columns="variable", values="value")[list(df.columns)]
        assert np.array_equal(got.index.values, df.index.values)
        diff = np.abs(got.values - df.values)
        assert np.all(diff <= 1e-12 * np.maximum(1.0, np.abs(df.values))), f"run {j}: largest difference {diff.max()}"


@pytest.mark.parametrize("key", lb.molecules())
def test_batch_matches_run(key):
    m = lb.molecule(key)
    rows = settings(m, 3, seed=len(key))
    out = m.run_batch(rows, include="all", warn_clips=False)
    assert_same(m, out, rows, warn_clips=False)


def test_batch_with_rk4_inputs_and_table():
    m = lb.molecule("stockmgmt").with_equation("Supply line weight", "TABLE(TIME, 0, 0, 30, 1)")
    rows = settings(m, 4, seed=1)
    for r in rows:
        r.pop("supply_line_weight"), r.pop("demand")
    demand = pd.Series([10.0, 15.0, 12.0], index=[0.0, 20.0, 40.0])
    out = m.run_batch(rows, include="all", method="rk4", inputs={"Demand": demand})
    assert_same(m, out, rows, method="rk4", inputs={"Demand": demand})


def test_dataframe_rows_keep_their_labels_and_missing_columns_keep_defaults():
    m = lb.molecule("stockmgmt")
    params = pd.DataFrame({"supply_line_weight": [0.0, 1.0]}, index=["ignores", "sees"])
    out = m.run_batch(params, T=20)
    assert set(out.run) == {"ignores", "sees"} and list(out.columns) == ["run", "time", "variable", "value"]
    sees = out[(out.run == "sees") & (out.variable == "Inventory")].value.values
    assert np.array_equal(sees, m.run(T=20)["Inventory"].values)
    assert out.attrs["units"] == {"Supply line": "units", "Inventory": "units"}


def test_batch_errors():
    m = lb.molecule("stockmgmt")
    with pytest.raises(ModelError, match="no rows"):
        m.run_batch([])
    with pytest.raises(lb.LoopBricksError, match='Did you mean "demand"'):
        m.run_batch([{"demnd": 1}])
    with pytest.raises(ModelError, match="missing"):
        m.run_batch(pd.DataFrame({"demand": [1.0, None]}))
    with pytest.raises(ModelError, match="in run 1"):
        m.with_equation("Orders", "1 / (Demand - 3)").run_batch([{"demand": 4}, {"demand": 3}])
