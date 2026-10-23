// Everything the builder can export, as text. Each function takes the learner's model (and, for results, a run) and
// returns file contents; the builder turns them into downloads. Contract shared by the builder UI.
import { elements, inflows, isConstant, outflows, series, toJSON, validate, type BDim, type BModel, type Checked, type Element, type RunResult } from "@/lib/builder";
import { REDUCERS, literal, nameKey, refName, type Node } from "@/lib/expr";

export type ExportFile = { name: string; mime: string; text: string };

// a file name from the model name: "Stock management" -> "stock-management"
export const slug = (m: BModel) =>
  m.name.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "model";

const one = (s?: string) => (s ?? "").replace(/\s+/g, " ").trim(); // learner text on a single line, for comments
const plural = (n: number, w: string, ws = w + "s") => `${n} ${n === 1 ? w : ws}`;
const isConst = (e: Element) => e.kind === "var" && isConstant(e);
const numText = (s: string) => String(Number(s.trim().replace("−", "-")));
const KIND = { stock: "stock", flow: "flow", var: "auxiliary" } as const;

// the model in a sentence: "1 stock (Water), 2 flows (Faucet, Drain) and 1 constant (Drain time)"
function summary(m: BModel) {
  const els = elements(m);
  const group = (es: Element[], w: string, ws?: string) => (es.length ? `${plural(es.length, w, ws)} (${es.map((e) => e.name).join(", ")})` : "");
  const parts = [group(m.stocks.map((s) => ({ ...s, kind: "stock" as const })), "stock"), group(m.flows.map((f) => ({ ...f, kind: "flow" as const })), "flow"), group(els.filter((e) => e.kind === "var" && !isConst(e)), "auxiliary", "auxiliaries"), group(els.filter(isConst), "constant")].filter(Boolean);
  return parts.length ? parts.slice(0, -1).join(", ") + (parts.length > 1 ? " and " : "") + parts[parts.length - 1] : "no elements yet";
}
// what an element is, for a comment: "Drain: flow out of Water [litres/minute]. note"
function role(m: BModel, e: Element, d?: BDim) {
  const name = (id?: string) => m.stocks.find((s) => s.id === id)?.name;
  const where = e.kind === "flow" ? [e.to && `into ${name(e.to)}`, e.from && `out of ${name(e.from)}`].filter(Boolean).join(" and ") : "";
  const kind = isConst(e) ? "constant" : KIND[e.kind];
  return one(`${e.name}: ${kind}${where ? " " + where : ""}${d ? `, one value per ${d.name}` : ""}${e.units?.trim() ? ` [${e.units.trim()}]` : ""}${e.note?.trim() ? `. ${e.note.trim()}` : ""}`);
}
// the order initial values are worked out in: whatever each stock's initial value needs, then the stock
function initOrder(m: BModel, chk: Checked) {
  const out: Element[] = [], seen = new Set<string>();
  const visit = (e: Element) => {
    if (seen.has(e.id)) return;
    seen.add(e.id);
    for (const r of chk.code.get(e.id)?.refs ?? []) {
      const d = chk.byKey.get(r);
      if (d) visit(d);
    }
    if (!isConst(e)) out.push(e);
  };
  elements(m).filter((e) => e.kind === "stock").forEach(visit);
  return out;
}
// names an equation reads directly (not through SUM and friends): does an arrayed equation give an array by itself?
function readsArray(n: Node, arrayed: (key: string) => boolean): boolean {
  if (n.k === "name") return arrayed(n.key);
  if (n.k === "neg") return readsArray(n.a, arrayed);
  if (n.k === "bin") return readsArray(n.a, arrayed) || readsArray(n.b, arrayed);
  if (n.k === "call") return !REDUCERS.has(n.f) && n.args.some((a) => readsArray(a, arrayed));
  return false;
}
const tablePoints = (n: Extract<Node, { k: "call" }>) => {
  const pts = n.args.slice(1).map((a) => literal(a)!);
  return { xs: pts.filter((_, j) => j % 2 === 0), ys: pts.filter((_, j) => j % 2 === 1) };
};
const CMP: Record<string, string> = { "<": "<", "<=": "<=", ">": ">", ">=": ">=", "=": "==", "<>": "!=" };

// ---------------------------------------------------------------------------------------------------
// Python

const PY_TAKEN = new Set(
  (
    "False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda " +
    "nonlocal not or pass raise return try while with yield match case type _ np pd plt t dt T i n c row rows unknown df ax step pulse ramp table " +
    "simulate overrides min max abs sum float int len range print dict list set round zip open any all id str map filter input object sorted " +
    "format next iter vars pow bool hash help dir exec eval compile globals locals super slice sys json os math fine"
  ).split(" "),
);
const UPPER_TAKEN = new Set(["CONSTANTS", "STOCK_COLUMNS"]);

type Py = { m: BModel; chk: Checked; els: Element[]; id: (key: string) => string; ids: Map<string, string>; dimId: (d: BDim) => string; used: Set<string> };

function pyContext(m: BModel): Py {
  const chk = validate(m), els = elements(m);
  const taken = new Set(PY_TAKEN), ids = new Map<string, string>();
  const ident = (s: string) => (/^[\p{L}_][\p{L}\p{N}_]*$/u.test(s) ? s : "x_" + s.replace(/[^\p{L}\p{N}_]/gu, "_"));
  for (const e of els) {
    let id = ident(nameKey(e.name) || "unnamed");
    while (taken.has(id)) id += "_";
    taken.add(id), ids.set(e.id, id);
  }
  const dimIds = new Map<string, string>(), upper = new Set(UPPER_TAKEN);
  for (const d of m.dims ?? []) {
    let id = ident(nameKey(d.name).toUpperCase() || "DIM");
    while (upper.has(id) || taken.has(id)) id += "_";
    upper.add(id), dimIds.set(nameKey(d.name), id);
  }
  return {
    m,
    chk,
    els,
    ids,
    id: (key) => {
      const e = chk.byKey.get(key);
      return e ? ids.get(e.id)! : ident(key);
    },
    dimId: (d) => dimIds.get(nameKey(d.name)) ?? "DIM",
    used: new Set(),
  };
}

// an equation as Python, from its parse tree; vec: the element is an array, so choices are made element by element
function py(n: Node, x: Py, vec: boolean): [string, number] {
  const w = (c: Node, min: number) => {
    const [s, p] = py(c, x, vec);
    return p < min ? `(${s})` : s;
  };
  const a = (c: Node) => py(c, x, vec)[0];
  const cond = (c: Node) => (c.k === "bin" && CMP[c.op] ? `${w(c.a, 2)} ${CMP[c.op]} ${w(c.b, 2)}` : a(c));
  switch (n.k) {
    case "num": return [String(n.v), 6];
    case "name": return [x.id(n.key), 6];
    case "time": return ["t", 6];
    case "dt": return ["dt", 6];
    case "neg": return ["-" + w(n.a, 4), 4];
    case "bin":
      if (n.op === "+" || n.op === "-") return [`${w(n.a, 2)} ${n.op} ${w(n.b, 3)}`, 2];
      if (n.op === "*" || n.op === "/") return [`${w(n.a, 3)} ${n.op} ${w(n.b, 4)}`, 3];
      if (n.op === "^") return [`${w(n.a, 6)} ** ${w(n.b, 4)}`, 5];
      return [`1.0 * (${cond(n)})`, 3]; // a comparison as 1 or 0, as in the app
    case "call": {
      const args = n.args.map(a);
      switch (n.f) {
        case "MIN": case "MAX": {
          if (!vec) return [`${n.f.toLowerCase()}(${args.join(", ")})`, 6];
          const f = n.f === "MIN" ? "np.minimum" : "np.maximum";
          return [args.reduceRight((acc, s) => `${f}(${s}, ${acc})`), 6];
        }
        case "ABS": return [`abs(${args[0]})`, 6];
        case "EXP": return [`np.exp(${args[0]})`, 6];
        case "LN": return [`np.log(${args[0]})`, 6];
        case "SQRT": return [`np.sqrt(${args[0]})`, 6];
        case "IF": return vec ? [`np.where(${cond(n.args[0])}, ${args[1]}, ${args[2]})`, 6] : [`(${args[1]} if ${cond(n.args[0])} else ${args[2]})`, 6];
        case "STEP": return x.used.add("step"), [`step(${args[0]}, ${args[1]}, t)`, 6];
        case "PULSE": return x.used.add("pulse"), [`pulse(${args[0]}, ${args[1]}, ${args[2]}, t, dt)`, 6];
        case "RAMP": return x.used.add("ramp"), [`ramp(${args[0]}, ${args[1]}, t)`, 6];
        case "TABLE": {
          const { xs, ys } = tablePoints(n);
          return x.used.add("table"), [`table(${args[0]}, [${xs.join(", ")}], [${ys.join(", ")}])`, 6];
        }
        case "SUM": return [`np.sum(${args[0]})`, 6];
        case "MEAN": return [`np.mean(${args[0]})`, 6];
        case "VMIN": return [`np.min(${args[0]})`, 6];
        case "VMAX": return [`np.max(${args[0]})`, 6];
      }
    }
  }
  throw new Error("cannot translate " + JSON.stringify(n));
}

// the right-hand side for an element: a list, or its equation (an array where the element is arrayed)
function pyRhs(x: Py, e: Element) {
  const d = x.chk.dims.get(e.id), list = x.chk.lists.get(e.id), c = x.chk.code.get(e.id);
  if (list) return `np.array([${list.join(", ")}], dtype=float)`;
  if (!c) return "0.0  # this equation does not compile in the builder; fix it there";
  const s = py(c.ast, x, !!d)[0];
  const arrayed = (key: string) => {
    const r = x.chk.byKey.get(key);
    return !!r && x.chk.dims.has(r.id);
  };
  return d && !readsArray(c.ast, arrayed) ? `np.full(len(${x.dimId(d)}), ${s}, dtype=float)` : s;
}

const HELPERS: Record<string, string> = {
  step: `def step(height, start, t):
    """STEP(height, start): 0 before time start, height from then on. The 1e-9 absorbs rounding in t = i * dt."""
    return _plain(np.where(t >= start - 1e-9, height, 0.0))`,
  pulse: `def pulse(height, start, width, t, dt):
    """PULSE(height, start, width): height for width time units from start, else 0. A width of 0 lasts one step."""
    width = np.where(np.asarray(width) > 0, width, dt)
    return _plain(np.where((t >= start - 1e-9) & (t < start + width - 1e-9), height, 0.0))`,
  ramp: `def ramp(slope, start, t):
    """RAMP(slope, start): 0 until start, then rising by slope per time unit."""
    return _plain(np.where(t > start, slope * (t - start), 0.0))`,
  table: `def table(x, xs, ys):
    """TABLE(x, x1, y1, x2, y2, ...): straight lines between the points, flat beyond the ends (what np.interp does)."""
    return _plain(np.interp(x, xs, ys))`,
};
const PLAIN = `def _plain(x):
    """A single number back as a float, an array as an array: np.where always returns an array."""
    x = np.asarray(x, dtype=float)
    return float(x) if x.ndim == 0 else x`;

// The script in parts, so the notebook can put markdown between them.
function pyParts(m: BModel) {
  const x = pyContext(m), { chk, els, ids } = x, s = slug(m);
  const consts = els.filter(isConst), dims = m.dims ?? [];
  const cols = (e: Element) => series(m, e).map((c) => c.label);
  const stockCols = m.stocks.flatMap((st) => cols({ ...st, kind: "stock" }));
  const lit = (v: string) => JSON.stringify(v); // a Python string literal (JSON escapes are valid Python)

  // dimensions and constants
  const top: string[] = [];
  if (dims.length) {
    top.push("# Dimensions: an arrayed element holds one value per element of its dimension, as a numpy vector in this order.");
    for (const d of dims) top.push(`${x.dimId(d)} = [${d.elements.map(lit).join(", ")}]`);
    top.push("");
  }
  top.push("# Constants: the numbers you choose. Change them here, or for one run: simulate(name=value).");
  for (const e of consts) top.push(`${ids.get(e.id)} = ${chk.lists.has(e.id) ? `np.array([${chk.lists.get(e.id)!.join(", ")}])` : numText(e.kind === "var" ? e.eq : "0")}  # ${role(m, e, chk.dims.get(e.id))}`);
  if (!consts.length) top.push("# (this model has none yet)");
  top.push(`CONSTANTS = {${consts.map((e) => `${lit(ids.get(e.id)!)}: ${ids.get(e.id)}`).join(", ")}}`);
  top.push("");
  top.push("# The stock columns of the results, for the summary and the chart.");
  top.push(`STOCK_COLUMNS = [${stockCols.map(lit).join(", ")}]`);

  // the simulation (built first, so we know which helpers it uses)
  const I = "    ", II = I + I, III = II + I;
  const assign = (e: Element, ind: string) => [`${ind}# ${role(m, e, chk.dims.get(e.id))}`, `${ind}${ids.get(e.id)} = ${pyRhs(x, e)}`];
  const sim: string[] = [
    `def simulate(T=${m.T}, dt=${m.dt}, **overrides):`,
    `${I}"""Run the model from time 0 to T in steps of dt (Euler's method); one row of the result per step.`,
    "",
    `${I}Change constants for one run by name, for example simulate(${consts[0] ? `${ids.get(consts[0].id)}=...` : "dt=0.1"}).`,
    `${I}"""`,
    `${I}unknown = set(overrides) - set(CONSTANTS)`,
    `${I}if unknown:  # a misspelt name would otherwise be ignored without a word`,
    `${II}raise TypeError(f"not a constant of this model: {', '.join(sorted(unknown))}")`,
    `${I}c = {**CONSTANTS, **overrides}  # this run's constants: the defaults above, with any overrides`,
  ];
  for (const e of consts) {
    const d = chk.dims.get(e.id), id = ids.get(e.id)!;
    sim.push(d ? `${I}${id} = np.full(len(${x.dimId(d)}), c[${lit(id)}], dtype=float)  # one value per ${d.name}; a single number is repeated` : `${I}${id} = c[${lit(id)}]`);
  }
  sim.push(`${I}n = int(T / dt + 0.5)  # the number of steps, T / dt rounded`, `${I}t = 0.0`, "");
  const inits = initOrder(m, chk);
  if (inits.length) sim.push(`${I}# Initial values at time 0. Each stock starts from its initial value; anything a stock needs is worked out first.`);
  for (const e of inits) sim.push(...assign(e, I));
  sim.push("", `${I}rows = []`, `${I}for i in range(n + 1):`, `${II}t = i * dt  # i * dt rather than t += dt, so rounding errors do not build up`);
  const rates = chk.order.map((id) => els.find((e) => e.id === id)!).filter((e) => !isConst(e));
  if (rates.length) sim.push(`${II}# Flows and auxiliaries from the current stocks, each after everything it depends on.`);
  for (const e of rates) sim.push(...assign(e, II));
  sim.push(`${II}# Record this step: one column per element, and one per element of an array (Name[element]).`, `${II}row = {"time": t}`);
  for (const e of els.filter((e) => !isConst(e))) {
    const d = chk.dims.get(e.id), id = ids.get(e.id)!;
    sim.push(d ? `${II}row.update(zip([${cols(e).map(lit).join(", ")}], ${id}))` : `${II}row[${lit(e.name)}] = ${id}`);
  }
  sim.push(`${II}rows.append(row)`, `${II}if i == n:`, `${III}break  # the last step is recorded; nothing moves beyond T`);
  if (m.stocks.length) sim.push(`${II}# Euler step: each stock moves on by dt times (inflows minus outflows), all from this same moment.`);
  for (const st of m.stocks) {
    const id = ids.get(st.id)!, ins = inflows(m, st.id).map((f) => ids.get(f.id)!), outs = outflows(m, st.id).map((f) => ids.get(f.id)!);
    if (!ins.length && !outs.length) {
      sim.push(`${II}# ${st.name} has no flows, so it keeps its initial value.`);
      continue;
    }
    const net = (ins.length ? ins.join(" + ") : "") + (outs.length ? `${ins.length ? " " : ""}- ${outs.length > 1 ? `(${outs.join(" + ")})` : outs[0]}` : "");
    const next = `${id} + dt * ${ins.length + outs.length > 1 ? `(${net})` : net}`;
    if (st.nonNegative) sim.push(`${II}${id} = ${chk.dims.has(st.id) ? "np.maximum" : "max"}(0.0, ${next})  # floored at zero: a physical stock cannot go below empty`);
    else sim.push(`${II}${id} = ${next}`);
  }
  sim.push(`${I}return pd.DataFrame(rows).set_index("time")`);

  const used = [...x.used];
  const helpers = used.length ? [PLAIN, ...used.sort().map((h) => HELPERS[h])].join("\n\n\n") : "";
  const title = m.name || "My model";
  const plotLines = (ind: string) =>
    stockCols.length
      ? [`${ind}ax = df[STOCK_COLUMNS].plot(title=${lit(title)})`, `${ind}ax.set_xlabel(${lit(`Time (${m.timeUnit || "time"})`)})`]
      : [`${ind}print("This model has no stocks yet, so there is nothing to plot.")`];
  const main = [
    `if __name__ == "__main__":`,
    `${I}df = simulate()`,
    `${I}# A summary: about ten evenly spaced rows of the stocks.`,
    `${I}print(df[STOCK_COLUMNS].iloc[:: max(1, len(df) // 10)].to_string())`,
    `${I}df.to_csv(${lit(`${s}-results.csv`)})  # every step and every column, for a spreadsheet`,
    `${I}print(${lit(`Saved every step to ${s}-results.csv`)})`,
    ...plotLines(I),
    ...(stockCols.length ? [`${I}plt.savefig(${lit(`${s}.png`)}, dpi=150, bbox_inches="tight")`] : []),
    `${I}if plt.get_backend().lower() != "agg":  # Agg only draws to files (on a server, or with MPLBACKEND=Agg)`,
    `${II}plt.show()`,
  ].join("\n");
  const run = ["df = simulate()", ...plotLines(""), "plt.show()"].join("\n");
  return { x, s, consts, stockCols, top: top.join("\n"), helpers, sim: sim.join("\n"), main, run, imports: "import numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt" };
}

const EULER =
  "A stock is something that accumulates: water in a tub, people in a town, units in a warehouse. Flows are the rates " +
  "that fill and drain the stocks, per unit of time. Auxiliaries are values worked out along the way, and constants are " +
  "numbers you choose. Euler's method steps through time: work out every flow from the current stocks, then move each " +
  "stock on by dt * (inflows - outflows), and repeat until the stop time.";

function tips(m: BModel, consts: Element[], ids: Map<string, string>) {
  const c = consts[0], cname = c ? ids.get(c.id) : "a_constant";
  return [
    `Halve dt (simulate(dt=${m.dt / 2})) and check the results barely change. If they do, dt is too large for this model.`,
    `Keep units consistent: a flow into a stock measured in people must be in people per ${m.timeUnit || "time unit"}.`,
    `Constants sit at the top of the file. Change them there, or for one run: simulate(${cname}=...).`,
    "simulate() returns a pandas DataFrame indexed by time: df.to_csv(\"run.csv\") or df.to_excel(\"run.xlsx\") saves it.",
  ];
}
const docText = (s: string) => s.replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"');
const wrap = (s: string, width: number, ind: string) => {
  const out: string[] = [];
  let line = "";
  for (const word of s.split(" ")) {
    if (line && (line + " " + word).length > width) out.push(ind + line), (line = word);
    else line = line ? line + " " + word : word;
  }
  return [...out, ind + line].join("\n");
};

// A standalone Python script (numpy, pandas, matplotlib) that simulates the model with Euler's method, commented line
// by line, with a header that explains the model, how to install and run it, and tips. Arrays become numpy vectors.
export function pythonScript(m: BModel): string {
  const p = pyParts(m), name = docText(m.name || "My model");
  const header = [
    `"""${name}: a stock-and-flow model exported from the LoopBricks model builder.`,
    "",
    "What it is",
    wrap(docText(`${summary(m)}, simulated from time 0 to ${m.T} (in ${m.timeUnit || "time units"}) in steps of dt = ${m.dt}.`), 112, "    "),
    "",
    "How to run it",
    "    pip install -r requirements.txt",
    `    python ${p.s}.py`,
    wrap(`It prints a summary table, saves every step to ${p.s}-results.csv and draws a chart of the stocks (saved as ${p.s}.png).`, 112, "    "),
    "",
    "How it works",
    wrap(EULER, 112, "    "),
    "",
    "Tips",
    ...tips(m, p.consts, p.x.ids).map((t) => wrap("- " + docText(t), 112, "    ").replace(/^ {4}- /, "    - ").replace(/\n {4}/g, "\n      ")),
    '"""',
  ].join("\n");
  return [header, p.imports, p.top, ...(p.helpers ? [p.helpers] : []), p.sim, p.main].join("\n\n\n") + "\n";
}

// requirements.txt for the script and the notebook
export function requirementsTxt(m: BModel): string {
  return [`# For ${slug(m)}.py and ${slug(m)}.ipynb, exported from LoopBricks: pip install -r requirements.txt`, "numpy>=1.24", "pandas>=2.0", "matplotlib>=3.7", "# To open the notebook outside Colab, also:", "# jupyter>=1.0", "# For the PySD versions (_pysd.py, _pysd.ipynb), also:", "# pysd>=3.14", ""].join("\n");
}

// A Jupyter notebook: explanation of the model in markdown, the same commented code split into cells, a plot,
// tips and exercises. Runs in Colab or locally with only the requirements above.
export function notebook(m: BModel): string {
  const p = pyParts(m), title = m.name || "My model";
  let n = 0;
  const lines = (src: string) => src.split("\n").map((l, i, a) => (i < a.length - 1 ? l + "\n" : l));
  const cell = (type: "markdown" | "code", src: string) => {
    const id = `cell-${++n}`; // nbformat 4.5 wants an id on every cell
    return type === "code" ? { id, cell_type: "code", metadata: {}, execution_count: null, outputs: [], source: lines(src) } : { id, cell_type: "markdown", metadata: {}, source: lines(src) };
  };
  const els = elements(m);
  const item = (e: Element) => {
    const eq = e.kind === "stock" ? e.init : e.eq;
    return `- **${e.name}**${e.dim ? ` (one per ${e.dim})` : ""}: \`${one(eq)}\`${e.units?.trim() ? ` ${e.units.trim()}` : ""}${e.note?.trim() ? `. ${one(e.note)}` : ""}`;
  };
  const stockLines = m.stocks.map((st) => {
    const fl = (fs: { name: string }[]) => fs.map((f) => f.name).join(", ");
    const ins = inflows(m, st.id), outs = outflows(m, st.id);
    return `- **${st.name}**${st.units?.trim() ? ` (${st.units.trim()})` : ""}: ${[ins.length && `filled by ${fl(ins)}`, outs.length && `drained by ${fl(outs)}`].filter(Boolean).join(", ") || "no flows yet"}`;
  });
  const c = p.consts[0], cid = c && p.x.ids.get(c.id);
  const cells = [
    cell(
      "markdown",
      [
        `# ${title}`,
        "",
        `Exported from the [LoopBricks model builder](https://waelrash1.github.io/loopbricks/#/learn/build): ${summary(m)}. Run the cells in order.`,
        "",
        EULER,
        ...(stockLines.length ? ["", "The stocks:", "", ...stockLines] : []),
        ...((m.dims ?? []).length ? ["", "Arrays: " + (m.dims ?? []).map((d) => `${d.name} has the elements ${d.elements.join(", ")}`).join("; ") + ". An arrayed element is a numpy vector with one value per element."] : []),
      ].join("\n"),
    ),
    cell("code", `# Run this cell first. Colab already has these packages; elsewhere it installs any that are missing.\nimport importlib.util, subprocess, sys\nmissing = [p for p in ("numpy", "pandas", "matplotlib") if importlib.util.find_spec(p) is None]\nif missing:\n    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", *missing])\n\n${p.imports}`),
    cell("markdown", `## Constants\n\nThe numbers you choose. Change one here and run the cells below again, or pass it to \`simulate()\` for a single run.`),
    cell("code", p.top),
    ...(p.helpers ? [cell("markdown", "## Helper functions\n\nThe builder's time functions (STEP, PULSE, RAMP) and lookup tables (TABLE), written for numpy so they work on single values and arrays alike."), cell("code", p.helpers)] : []),
    cell(
      "markdown",
      [
        "## The simulation",
        "",
        "Each pass of the loop is one time step. First every flow and auxiliary is worked out from the current stocks, in an order where each comes after everything it uses. Then every stock moves on by dt times its inflows minus its outflows.",
        "",
        ...els.filter((e) => !isConst(e)).map(item),
      ].join("\n"),
    ),
    cell("code", p.sim),
    cell("markdown", `## Run it\n\n\`simulate()\` returns a pandas DataFrame with one row per time step (time in ${m.timeUnit || "time units"}).`),
    cell("code", p.run),
    cell("code", "# about ten evenly spaced rows\ndf.iloc[:: max(1, len(df) // 10)]"),
    cell(
      "markdown",
      [
        "## Try it",
        "",
        `1. **Change a constant.** ${c ? `The cell below doubles ${c.name} for one run and draws both runs. Which way did the stocks move, and why?` : "This model has no constants yet. Add one in the builder (a variable whose equation is a number) and export again."}`,
        `2. **Halve dt.** The second cell runs again with dt = ${m.dt / 2}. If the final values barely change, dt = ${m.dt} is small enough; if they change a lot, the results depend on the step, not the model.`,
        "3. **Extend the model.** Add a flow or an auxiliary to the `simulate` function: compute it in the loop after what it uses, record it in `row`, and include it in a stock's Euler step if it fills or drains one.",
      ].join("\n"),
    ),
    ...(c && p.stockCols.length
      ? [cell("code", `df2 = simulate(${cid}=2 * ${cid})\nax = df[STOCK_COLUMNS].plot(title="${cid} doubled (dashed)")\ndf2[STOCK_COLUMNS].plot(ax=ax, linestyle="--", legend=False)\nplt.show()`)]
      : []),
    cell("code", `fine = simulate(dt=${m.dt / 2})\nprint("largest change in a final value:", (fine.iloc[-1] - df.iloc[-1]).abs().max())`),
  ];
  return JSON.stringify({ nbformat: 4, nbformat_minor: 5, metadata: { kernelspec: { name: "python3", display_name: "Python 3", language: "python" }, language_info: { name: "python" } }, cells }, null, 1) + "\n";
}

// ---------------------------------------------------------------------------------------------------
// XMILE

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
type Gf = { name: string; eqn: string; xs: number[]; ys: number[]; dim?: BDim };
type Xm = { chk: Checked; gfs: Gf[]; owner: Element; taken: Set<string>; pysd?: boolean };

// an equation in XMILE syntax; mine: the dimension of the element it belongs to
function xm(n: Node, x: Xm, mine: BDim | undefined): [string, number] {
  const w = (c: Node, min: number) => {
    const [s, p] = xm(c, x, mine);
    return p < min ? `(${s})` : s;
  };
  const a = (c: Node) => xm(c, x, mine)[0];
  const cmp = (c: Node) => (c.k === "bin" && CMP[c.op] ? `${w(c.a, 2)} ${c.op} ${w(c.b, 2)}` : `${w(c, 2)} <> 0`);
  const ref = (key: string, whole: boolean) => {
    const e = x.chk.byKey.get(key), d = e && x.chk.dims.get(e.id);
    const name = e ? refName(e.name) : key;
    // PySD reads a whole array the Vensim way, Name[Dim!]; standard XMILE (Stella) uses Name[*]
    const all = x.pysd && d ? `${refName(d.name)}!` : "*";
    return d ? `${name}[${whole ? all : mine ? refName(mine.name) : all}]` : name;
  };
  switch (n.k) {
    case "num": return [String(n.v), 6];
    case "name": return [ref(n.key, false), 6];
    case "time": return ["TIME", 6];
    case "dt": return [x.pysd ? "TIME_STEP" : "DT", 6]; // PySD names the time step TIME STEP, as Vensim does
    case "neg": return ["-" + w(n.a, 4), 4];
    case "bin":
      if (n.op === "+" || n.op === "-") return [`${w(n.a, 2)} ${n.op} ${w(n.b, 3)}`, 2];
      if (n.op === "*" || n.op === "/") return [`${w(n.a, 3)} ${n.op} ${w(n.b, 4)}`, 3];
      if (n.op === "^") return [`${w(n.a, 6)}^${w(n.b, 6)}`, 5];
      return [`(IF ${cmp(n)} THEN 1 ELSE 0)`, 6]; // a comparison as 1 or 0, as in the builder
    case "call": {
      const args = n.args.map(a);
      switch (n.f) {
        case "MIN": case "MAX": return [args.reduceRight((acc, s) => `${n.f}(${s}, ${acc})`), 6];
        case "ABS": case "EXP": case "LN": case "SQRT": return [`${n.f}(${args[0]})`, 6];
        case "IF": return [`(IF ${cmp(n.args[0])} THEN ${args[1]} ELSE ${args[2]})`, 6];
        case "STEP": case "RAMP": return [`${n.f}(${args.join(", ")})`, 6];
        case "PULSE": {
          // XMILE's PULSE is a train of spikes; the builder's is a rectangle, which is a step up then a step down
          const DTn = x.pysd ? "TIME_STEP" : "DT";
          const wl = literal(n.args[2]), width = wl === undefined ? `(IF ${w(n.args[2], 2)} > 0 THEN ${args[2]} ELSE ${DTn})` : wl > 0 ? w(n.args[2], 3) : DTn;
          return [`(STEP(${args[0]}, ${args[1]}) - STEP(${args[0]}, ${w(n.args[1], 2)} + ${width}))`, 6];
        }
        case "TABLE": {
          // a lookup becomes a graphical function on a helper auxiliary whose equation is the input
          let name = `${x.owner.name} lookup`, k = 2;
          while (x.taken.has(nameKey(name))) name = `${x.owner.name} lookup ${k++}`;
          x.taken.add(nameKey(name));
          x.gfs.push({ name, eqn: args[0], ...tablePoints(n), dim: mine });
          return [refName(name) + (mine ? `[${refName(mine.name)}]` : ""), 6];
        }
        case "SUM": return [`SUM(${ref((n.args[0] as { key: string }).key, true)})`, 6];
        case "MEAN": {
          // PySD has no MEAN for XMILE: a sum over the number of elements gives the same value
          const k = (n.args[0] as { key: string }).key, d = x.chk.dims.get(x.chk.byKey.get(k)?.id ?? "");
          return x.pysd && d ? [`(SUM(${ref(k, true)}) / ${d.elements.length})`, 6] : [`MEAN(${ref(k, true)})`, 6];
        }
        case "VMIN": case "VMAX": return [`${n.f.slice(1)}(${ref((n.args[0] as { key: string }).key, true)})`, 6];
      }
    }
  }
  throw new Error("cannot translate " + JSON.stringify(n));
}

const gfXml = (g: { xs: number[]; ys: number[] }, ind: string) =>
  [
    `${ind}<gf>`,
    `${ind}  <xscale min="${g.xs[0]}" max="${g.xs[g.xs.length - 1]}"/>`,
    `${ind}  <yscale min="${Math.min(...g.ys)}" max="${Math.max(...g.ys)}"/>`,
    `${ind}  <xpts>${g.xs.join(",")}</xpts>`,
    `${ind}  <ypts>${g.ys.join(",")}</ypts>`,
    `${ind}</gf>`,
  ];

// XMILE 1.0 (the open standard read by Stella and, with an import step, Vensim), arrays as dimensions.
// pysd: write the variant PySD's XMILE reader accepts (whole arrays as Name[Dim!], per-element values as one comma list).
export function xmile(m: BModel, opts: { pysd?: boolean } = {}): string {
  const chk = validate(m), els = elements(m);
  const taken = new Set(els.map((e) => nameKey(e.name)));
  const gfs: Gf[] = [];
  const I = "      ";
  const vars: string[] = [];
  const dimXml = (d: BDim | undefined, ind: string) => (d ? [`${ind}<dimensions>`, `${ind}  <dim name="${esc(d.name)}"/>`, `${ind}</dimensions>`] : []);
  for (const e of els) {
    const tag = e.kind === "stock" ? "stock" : e.kind === "flow" ? "flow" : "aux";
    const d = chk.dims.get(e.id), list = chk.lists.get(e.id), c = chk.code.get(e.id);
    const out = [`${I}<${tag} name="${esc(e.name)}">`, ...dimXml(d, I + "  ")];
    if (list && d && opts.pysd) out.push(`${I}  <eqn>${list.join(", ")}</eqn>`);
    else if (list && d) d.elements.forEach((el, j) => out.push(`${I}  <element subscript="${esc(el)}">`, `${I}    <eqn>${list[j]}</eqn>`, `${I}  </element>`));
    else if (c && e.kind !== "stock" && c.ast.k === "call" && c.ast.f === "TABLE") {
      // the whole equation is a lookup: the element itself gets the graphical function
      out.push(`${I}  <eqn>${esc(xm(c.ast.args[0], { chk, gfs, owner: e, taken, pysd: opts.pysd }, d)[0])}</eqn>`, ...gfXml(tablePoints(c.ast), I + "  "));
    } else if (c) out.push(`${I}  <eqn>${esc(xm(c.ast, { chk, gfs, owner: e, taken, pysd: opts.pysd }, d)[0])}</eqn>`);
    else out.push(`${I}  <eqn>${esc((e.kind === "stock" ? e.init : e.eq).trim())}</eqn>`, `${I}  <!-- this equation does not compile in the builder; fix it there -->`);
    if (e.kind === "stock") {
      inflows(m, e.id).forEach((f) => out.push(`${I}  <inflow>${esc(refName(f.name))}</inflow>`));
      outflows(m, e.id).forEach((f) => out.push(`${I}  <outflow>${esc(refName(f.name))}</outflow>`));
      if (e.nonNegative) out.push(`${I}  <non_negative/>`);
    }
    if (e.units?.trim()) out.push(`${I}  <units>${esc(e.units.trim())}</units>`);
    if (e.note?.trim()) out.push(`${I}  <doc>${esc(e.note.trim())}</doc>`);
    out.push(`${I}</${tag}>`);
    vars.push(...out);
  }
  for (const g of gfs) vars.push(`${I}<aux name="${esc(g.name)}">`, ...dimXml(g.dim, I + "  "), `${I}  <eqn>${esc(g.eqn)}</eqn>`, ...gfXml(g, I + "  "), `${I}  <doc>Lookup table from the builder's TABLE function.</doc>`, `${I}</aux>`);
  const dims = m.dims ?? [];
  return [
    `<?xml version="1.0" encoding="utf-8"?>`,
    `<xmile version="1.0" xmlns="http://docs.oasis-open.org/xmile/ns/XMILE/v1.0">`,
    `  <header>`,
    `    <name>${esc(m.name)}</name>`,
    `    <vendor>LoopBricks</vendor>`,
    `    <product version="1.0" lang="en">LoopBricks model builder</product>`,
    ...(dims.length ? [`    <options>`, `      <uses_arrays maximum_dimensions="1"/>`, `    </options>`] : []),
    `  </header>`,
    `  <sim_specs method="Euler" time_units="${esc(m.timeUnit)}">`,
    `    <start>0</start>`,
    `    <stop>${m.T}</stop>`,
    `    <dt>${m.dt}</dt>`,
    `  </sim_specs>`,
    ...(dims.length ? [`  <dimensions>`, ...dims.flatMap((d) => [`    <dim name="${esc(d.name)}">`, ...d.elements.map((el) => `      <elem name="${esc(el)}"/>`), `    </dim>`]), `  </dimensions>`] : []),
    `  <model>`,
    `    <variables>`,
    ...vars,
    `    </variables>`,
    `  </model>`,
    `</xmile>`,
    "",
  ].join("\n");
}

// ---------------------------------------------------------------------------------------------------
// results and documentation

// The run as CSV: time, then one column per element (one per array element, named "Name[element]").
export function resultsCsv(m: BModel, res: RunResult): string {
  const cell = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const cols = elements(m).flatMap((e) => series(m, e)).filter((c) => res.values[c.key]);
  return [["time", ...cols.map((c) => cell(c.label))].join(","), ...res.times.map((t, i) => [t, ...cols.map((c) => res.values[c.key][i])].join(","))].join("\n") + "\n";
}

// A readable Markdown document of the model: purpose line, every element with its equation, units and note, grouped.
export function markdownDoc(m: BModel): string {
  const els = elements(m), out: string[] = [`# ${m.name || "My model"}`, "", `A stock-and-flow model from the LoopBricks model builder: ${summary(m)}.`, ""];
  out.push("## Settings", "", `- Time unit: ${m.timeUnit || "not set"}`, `- Stop time: ${m.T}`, `- Time step (dt): ${m.dt}`, "- Integration: Euler", "");
  if (m.dims?.length) out.push("## Dimensions", "", ...m.dims.map((d) => `- **${d.name}**: ${d.elements.join(", ")}`), "");
  const name = (id?: string) => m.stocks.find((s) => s.id === id)?.name;
  const section = (title: string, es: Element[]) => {
    if (!es.length) return;
    out.push(`## ${title}`, "");
    for (const e of es) {
      out.push(`### ${e.name}${e.dim ? ` [${e.dim}]` : ""}`, "");
      out.push(e.kind === "stock" ? `- Initial value: \`${one(e.init)}\`` : `- ${isConst(e) ? "Value" : "Equation"}: \`${one(e.eq)}\``);
      if (e.kind === "stock") {
        const ins = inflows(m, e.id).map((f) => f.name), outs = outflows(m, e.id).map((f) => f.name);
        out.push(`- Inflows: ${ins.join(", ") || "none"}. Outflows: ${outs.join(", ") || "none"}.`);
        if (e.nonNegative) out.push("- Never below zero.");
      }
      if (e.kind === "flow") out.push(`- From ${name(e.from) ?? "a cloud (outside the model)"} to ${name(e.to) ?? "a cloud (outside the model)"}.`);
      if (e.units?.trim()) out.push(`- Units: ${e.units.trim()}`);
      if (e.note?.trim()) out.push("", e.note.trim());
      out.push("");
    }
  };
  section("Stocks", els.filter((e) => e.kind === "stock"));
  section("Flows", els.filter((e) => e.kind === "flow"));
  section("Auxiliaries", els.filter((e) => e.kind === "var" && !isConst(e)));
  section("Constants", els.filter(isConst));
  return out.join("\n").replace(/\n+$/, "") + "\n";
}

// ---------------------------------------------------------------------------------------------------
// PySD (https://pysd.tools): the same model as XMILE, translated and run by PySD

const pyStr = (s: string) => JSON.stringify(s); // a Python string literal (JSON strings are valid Python)
function pysdParts(m: BModel) {
  const els = elements(m);
  const stockCols = els.filter((e) => e.kind === "stock").flatMap((e) => series(m, e).map((c) => c.label));
  const constant = m.vars.find((v) => isConstant(v) && !v.dim && !v.eq.includes(","));
  const tips = [
    constant ? `Change a constant for one run: model.run(params={${pyStr(constant.name)}: ${+constant.eq * 2}}).` : "Change a constant for one run: model.run(params={\"Name\": value}).",
    "Feed in a time series instead of a constant: params={\"Name\": pandas.Series(values, index=times)}.",
    `Check the time step: model.run(time_step=${m.dt / 2}) should give nearly the same results.`,
    stockCols.length ? `Start from other stock values: model.run(initial_condition=(0, {${pyStr(stockCols[0].replace(/\[.*$/, ""))}: 0})).` : "Start from other stock values with initial_condition=(time, {name: value}).",
    "model.doc lists every variable with its units and type: compare it with the builder.",
  ];
  // the XMILE travels as a Python string; JSON escaping keeps quotes and backslashes safe
  return { stockCols, tips, xml: pyStr(xmile(m, { pysd: true })) };
}

// A Python script that writes the model as XMILE, translates it with PySD and runs it.
export function pysdScript(m: BModel): string {
  const p = pysdParts(m), s = slug(m), title = m.name || "My model";
  return [
    `"""${title}: run with PySD`,
    "",
    "PySD (https://pysd.tools; Martin-Martinez et al. 2022, JOSS 7(78):4329) is an open-source Python library",
    "that runs system dynamics models saved as Vensim (.mdl) or XMILE (Stella) files: it translates the model",
    "into Python and integrates it with Euler's method. This script carries your LoopBricks model as XMILE,",
    `writes it next to itself as ${s}.xmile, has PySD translate it, and runs it.`,
    "",
    "Install:  pip install pysd matplotlib",
    `Run:      python ${s}_pysd.py`,
    "",
    "Tips",
    ...p.tips.map((t) => "- " + t),
    '"""',
    "import pathlib",
    "",
    "import matplotlib.pyplot as plt",
    "import pysd",
    "",
    `XMILE = ${p.xml}`,
    "",
    "# PySD reads a file, so write the model out first; translating also writes a .py file next to it",
    `path = pathlib.Path(__file__).with_name(${pyStr(s + ".xmile")})`,
    'path.write_text(XMILE, encoding="utf-8")',
    "model = pysd.read_xmile(str(path))",
    `STOCKS = ${JSON.stringify(p.stockCols)}  # the stock columns in PySD's results`,
    "",
    'if __name__ == "__main__":',
    "    # what PySD understood: compare names, units and types with the builder",
    '    print(model.doc[["Real Name", "Units", "Type"]].to_string(index=False))',
    "    df = model.run()  # a pandas DataFrame indexed by time, one column per variable",
    "    if STOCKS:",
    '        print("\\nFinal values:")',
    "        print(df[STOCKS].iloc[-1].to_string())",
    `        ax = df[STOCKS].plot(title=${pyStr(title + " (PySD)")})`,
    `        ax.set_xlabel(${pyStr(m.timeUnit)})`,
    "        plt.tight_layout()",
    "        plt.show()",
    "",
  ].join("\n");
}

// The same as a notebook, with an explanation and things to try.
export function pysdNotebook(m: BModel): string {
  const p = pysdParts(m), s = slug(m), title = m.name || "My model";
  let n = 0;
  const lines = (src: string) => src.split("\n").map((l, i, a) => (i < a.length - 1 ? l + "\n" : l));
  const cell = (type: "markdown" | "code", src: string) => {
    const id = `cell-${++n}`;
    return type === "code" ? { id, cell_type: "code", metadata: {}, execution_count: null, outputs: [], source: lines(src) } : { id, cell_type: "markdown", metadata: {}, source: lines(src) };
  };
  const cells = [
    cell("markdown", `# ${title}: run with PySD\n\n[PySD](https://pysd.tools) is an open-source Python library that runs system dynamics models saved as Vensim (.mdl) or XMILE (Stella) files. It translates the model into Python and integrates it with Euler's method, the same way the LoopBricks builder does, so the numbers should match the builder's run.\n\nThis notebook carries your model as XMILE. Run the cells in order.`),
    cell("code", `# Run this cell first. In Colab it installs PySD, which takes about half a minute.\ntry:\n    import pysd\nexcept ImportError:\n    import subprocess, sys\n    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "pysd"])\n    import pysd\nimport pathlib\nimport matplotlib.pyplot as plt`),
    cell("markdown", "## The model\n\nPySD reads a file, so the model is written out as XMILE first. Translating it also writes a Python file next to it: open that file to see the code PySD generated."),
    cell("code", `XMILE = ${p.xml}\npath = pathlib.Path(${pyStr(s + ".xmile")})\npath.write_text(XMILE, encoding="utf-8")\nmodel = pysd.read_xmile(str(path))\nmodel.doc[["Real Name", "Units", "Type"]]`),
    cell("markdown", "## Run it\n\n`model.run()` returns a pandas DataFrame indexed by time, with one column per variable."),
    cell("code", `STOCKS = ${JSON.stringify(p.stockCols)}\ndf = model.run()\nif STOCKS:\n    ax = df[STOCKS].plot(title=${pyStr(title)})\n    ax.set_xlabel(${pyStr(m.timeUnit)})\n    plt.show()\ndf[STOCKS].iloc[:: max(1, len(df) // 10)]`),
    cell("markdown", "## Try it\n\n" + p.tips.map((t, i) => `${i + 1}. ${t}`).join("\n")),
    cell("code", `# the time-step check: halving dt should hardly change the final values\nfine = model.run(time_step=${m.dt / 2}, return_columns=STOCKS)\nprint("largest change in a final value:", (fine[STOCKS].iloc[-1] - df[STOCKS].iloc[-1]).abs().max())`),
  ];
  return JSON.stringify({ nbformat: 4, nbformat_minor: 5, metadata: { kernelspec: { name: "python3", display_name: "Python 3", language: "python" }, language_info: { name: "python" } }, cells }, null, 1) + "\n";
}

// All of the above that make sense for this model and run, ready to download.
export function exportFiles(m: BModel, res?: RunResult): ExportFile[] {
  const s = slug(m);
  return [
    { name: `${s}.py`, mime: "text/x-python", text: pythonScript(m) },
    { name: "requirements.txt", mime: "text/plain", text: requirementsTxt(m) },
    { name: `${s}.ipynb`, mime: "application/x-ipynb+json", text: notebook(m) },
    { name: `${s}.json`, mime: "application/json", text: toJSON(m) },
    { name: `${s}.xmile`, mime: "application/xml", text: xmile(m) },
    { name: `${s}_pysd.py`, mime: "text/x-python", text: pysdScript(m) },
    { name: `${s}_pysd.ipynb`, mime: "application/x-ipynb+json", text: pysdNotebook(m) },
    { name: `${s}.md`, mime: "text/markdown", text: markdownDoc(m) },
    ...(res?.ok ? [{ name: `${s}-results.csv`, mime: "text/csv", text: resultsCsv(m, res) }] : []),
  ];
}
