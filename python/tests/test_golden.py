"""The Python engine must reproduce the app's numbers: golden.json is written by the app (npm run golden)."""
import json
import math
from pathlib import Path

import pytest

import loopbricks as lb

GOLDEN = json.loads((Path(__file__).parent / "golden.json").read_text())
CASES = [(key, run) for key, runs in GOLDEN.items() for run in runs]


@pytest.mark.parametrize("key,run", CASES, ids=[f'{k}-{r["label"]}' for k, r in CASES])
def test_matches_app(key, run):
    m = lb.molecule(key)
    df = m.run(**run["params"])
    every = round(1 / m.dt)
    sampled = df.iloc[::every]
    assert list(sampled.index) == pytest.approx(run["times"])
    for st in m.stocks:
        got, want = sampled[st["name"]].tolist(), run["stocks"][st["id"]]
        for g, w in zip(got, want):
            assert math.isclose(g, w, rel_tol=1e-9, abs_tol=1e-9), f'{st["name"]}: {g} != {w}'


def test_every_molecule_has_golden_data():
    assert sorted(GOLDEN) == lb.molecules()
