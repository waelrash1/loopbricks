"""LoopBricks: system dynamics molecules you can run, combine and study in Python.

    import loopbricks as lb
    m = lb.molecule("stockmgmt")
    df = m.run(preset="Oscillation (ignores it)")
    m.plot(df)

The models are the same files the LoopBricks web app runs, and give the same numbers.
"""
from .expr import ExprError, LoopBricksError, LoopBricksWarning, compile_expr, name_key
from .model import Model, ModelError, UnknownNameError, molecule, molecules

__version__ = "0.2.0"  # the only place the version is written; pyproject.toml reads it from here
__all__ = ["Model", "LoopBricksError", "LoopBricksWarning", "ModelError", "ExprError", "UnknownNameError", "molecule", "molecules", "compile_expr", "name_key", "__version__"]
