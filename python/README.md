# loopbricks (Python)

System dynamics molecules you can run, combine and study in Python. The models are the same JSON files the
[LoopBricks app](https://waelrash1.github.io/loopbricks/) runs, and a test in the app's repository checks that both
give the same numbers step for step.

```python
import loopbricks as lb

m = lb.molecule("stockmgmt")
print(m.equations())
df = m.run(preset="Oscillation (ignores it)")   # a pandas DataFrame indexed by time
m.plot(df)
m.run(supply_line_weight=0.5, T=100)            # change any constant by name
```

Install in Colab or locally:

```
pip install "loopbricks @ git+https://github.com/waelrash1/loopbricks.git@main#subdirectory=python"
```

Models exported from the app's model builder load with `lb.Model.from_file("my-model.json")`.

## More than one run

```python
import numpy as np, pandas as pd

# Monte Carlo: 1,000 runs at once, one per row; columns are the constants you can set (m.params)
rng = np.random.default_rng(1)
settings = pd.DataFrame({"supply_line_weight": rng.uniform(0, 1, 1000), "acquisition_delay": rng.uniform(2, 10, 1000)})
out = m.run_batch(settings)          # tidy: columns run, time, variable, value (stocks only unless include="all")
inv = out[out.variable == "Inventory"].pivot(index="time", columns="run", values="value")  # time x run array
```

`run_batch` works out every run together with numpy and gives the same numbers as calling `run()` once per row
(about 0.03 s for 1,000 runs of `stockmgmt` on a laptop, against about 2.5 s in a loop). `run` in the result is the row's label
in `settings`, so results join back to their inputs.

## Inputs, edits and options

```python
demand = pd.Series([10, 10, 15, 15], index=[0, 10, 10.1, 60])   # straight lines between points, flat beyond
m.run(inputs={"Demand": demand})                                # or a function: inputs={"Demand": lambda t: ...}
m2 = m.with_params(supply_line_weight=0).with_init("Inventory", 80).with_equation("Demand", "10 + STEP(5, 10)")
df = m.run(method="rk4", columns="key", include=["Inventory", "Orders"])
df.attrs["units"], df.attrs["clipped"]
```

- Equations may use `TABLE(x, x1, y1, x2, y2, ...)`, a lookup: straight lines between the points, flat beyond the ends.
- `method="rk4"` uses fourth-order Runge-Kutta. Only the default, `"euler"`, gives the app's numbers.
- When a stock that cannot go negative is held at zero, the run records the first time in `df.attrs["clipped"]` and
  warns once (`warn_clips=False` turns the warning off).
- Mistakes raise `lb.LoopBricksError` (a `ValueError`) with a suggestion where a name is misspelt.

## Licence

The code is under the MIT licence (see `LICENSE`). The book text and app prose are CC BY 4.0; see `LICENSE-text.md`
in the repository.

## Sources and independence

LoopBricks is an independent project. Its simulation engines (TypeScript in the app, Python in the `loopbricks` package) and all model files were written from scratch; no Vensim or Stella files or software are used. The molecules are our own implementations of the structures described in Jim Hines' *Molecules of Structure*, and their names are his. LoopBricks is not affiliated with or endorsed by Jim Hines, Ventana Systems or isee systems. Vensim is a trademark of Ventana Systems, Inc.; Stella is a trademark of isee systems, inc.
