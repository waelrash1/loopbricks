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

## Sources and independence

LoopBricks is an independent project. Its simulation engines (TypeScript in the app, Python in the `loopbricks` package) and all model files were written from scratch; no Vensim or Stella files or software are used. The molecules are our own implementations of the structures described in Jim Hines' *Molecules of Structure*, and their names are his. LoopBricks is not affiliated with or endorsed by Jim Hines, Ventana Systems or isee systems. Vensim is a trademark of Ventana Systems, Inc.; Stella is a trademark of isee systems, inc.
