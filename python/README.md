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
