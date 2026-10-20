"""LoopBricks: system dynamics molecules you can run, combine and study in Python.

    import loopbricks as lb
    m = lb.molecule("stockmgmt")
    df = m.run(preset="Oscillation (ignores it)")
    m.plot(df)

The models are the same files the LoopBricks web app runs, and give the same numbers.
"""
from .expr import ExprError, compile_expr, name_key
from .model import Model, ModelError, molecule, molecules

__version__ = "0.1.0"
__all__ = ["Model", "ModelError", "ExprError", "molecule", "molecules", "compile_expr", "name_key", "__version__"]
