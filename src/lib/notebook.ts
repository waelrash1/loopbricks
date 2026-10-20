// Python notebooks that go with the app: where they live, how to open them in Colab, and how to turn a model from
// the builder into a notebook. The notebooks run the `loopbricks` Python package on the same model files as the app.
import type { BModel } from "@/lib/builder";

// ponytail: notebooks and the package live on the book branch for now; switch to "main" when it is merged
const REPO = "waelrash1/loopbricks", BRANCH = "book";
export const INSTALL = `loopbricks @ git+https://github.com/${REPO}.git@${BRANCH}#subdirectory=python`;
export const colabUrl = (file: string) => `https://colab.research.google.com/github/${REPO}/blob/${BRANCH}/notebooks/${file}`;
export const rawUrl = (file: string) => `https://raw.githubusercontent.com/${REPO}/${BRANCH}/notebooks/${file}`;

export const NOTEBOOKS = [{ file: "01-stocks-flows-and-feedback.ipynb", title: "Stocks, flows and feedback in Python", molecules: ["bathtub", "closegap", "stockmgmt"] }];
export const notebooksFor = (key: string) => NOTEBOOKS.filter((n) => n.molecules.includes(key));

const installCell = `# Run this cell first. In Colab it installs the loopbricks package, which takes about ten seconds.
try:
    import loopbricks as lb
except ImportError:
    import subprocess, sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "${INSTALL}"])
    import loopbricks as lb
import json
import matplotlib.pyplot as plt`;

const lines = (src: string) => src.split("\n").map((l, i, a) => (i < a.length - 1 ? l + "\n" : l));
let n = 0;
const cell = (type: "markdown" | "code", src: string) => {
  const id = `cell-${++n}`; // nbformat 4.5 wants an id on every cell
  return type === "code" ? { id, cell_type: "code", metadata: {}, execution_count: null, outputs: [], source: lines(src) } : { id, cell_type: "markdown", metadata: {}, source: lines(src) };
};

// A notebook that loads this model and runs it. The model travels as JSON inside a raw Python string; quotes are
// escaped as ' so the string can never close early, and json.loads turns them back.
export function notebookFor(m: BModel): string {
  const spec = JSON.stringify({ format: "loopbricks-builder", version: 1, model: m }, null, 1).replace(/'/g, "\\u0027");
  const cells = [
    cell("markdown", `# ${m.name || "My model"}\n\nExported from the [LoopBricks model builder](https://waelrash1.github.io/loopbricks/#/learn/build). Run the cells in order. Change the equations in the model below, or set constants in \`run()\`, for example \`model.run(T=100)\`.`),
    cell("code", installCell),
    cell("code", `model = lb.Model.from_spec(json.loads(r'''${spec}'''))\nprint(model.equations())`),
    cell("code", `df = model.run()\nmodel.plot(df)\ndf.iloc[:: max(1, len(df) // 10)]`),
    cell("markdown", "## Explore\n\nEvery constant can be changed by name. `model.params` lists them with their values."),
    cell("code", "model.params"),
  ];
  return JSON.stringify({ nbformat: 4, nbformat_minor: 5, metadata: { kernelspec: { name: "python3", display_name: "Python 3", language: "python" }, language_info: { name: "python" } }, cells }, null, 1);
}
