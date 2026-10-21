"""Clear outputs from every notebook. Rendering the book runs the notebooks and saves their outputs into them;
the committed notebooks stay clean so Colab opens them fresh (npm run check enforces it)."""
import json
import pathlib

for p in sorted(pathlib.Path(__file__).parents[1].joinpath("notebooks").glob("*.ipynb")):
    nb = json.loads(p.read_text())
    for c in nb["cells"]:
        if c["cell_type"] == "code":
            c["outputs"], c["execution_count"] = [], None
        c.get("metadata", {}).pop("execution", None)
    p.write_text(json.dumps(nb, indent=1, ensure_ascii=False) + "\n")
