"""Every notebook must run from top to bottom without errors (with the package from this checkout)."""
import os
from pathlib import Path

import pytest

nbformat = pytest.importorskip("nbformat")
nbclient = pytest.importorskip("nbclient")

NOTEBOOKS = sorted((Path(__file__).parents[2] / "notebooks").glob("*.ipynb"))


@pytest.mark.parametrize("path", NOTEBOOKS, ids=[p.name for p in NOTEBOOKS])
def test_notebook_runs(path, monkeypatch):
    monkeypatch.setenv("MPLBACKEND", "Agg")
    monkeypatch.setenv("PYTHONPATH", str(Path(__file__).parents[1]) + os.pathsep + os.environ.get("PYTHONPATH", ""))
    nb = nbformat.read(path, as_version=4)
    nbclient.NotebookClient(nb, timeout=180, kernel_name="python3").execute()
