// Model builder tests: arrays, links, JSON, and every export. The Python script and notebook are run with python3
// (numpy, pandas, matplotlib) and must give the same final stocks as the app. Run with: npm run test:builder
import { execFile } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { TEMPLATES, fromJSON, removeElement, renameElement, series, simulate, template, toJSON, validate, elements, type BModel } from "@/lib/builder";
import { exportFiles, markdownDoc, notebook, pysdNotebook, pysdScript, pythonScript, requirementsTxt, resultsCsv, slug, xmile } from "@/lib/exports";
import { notebookFor } from "@/lib/notebook";
import { SPECS } from "@/lib/spec";

const run = promisify(execFile);
const errs: string[] = [];
const fail = (s: string) => errs.push(s);
const clone = (m: BModel): BModel => JSON.parse(JSON.stringify(m));
// JSON with sorted keys, so field order does not matter
const canon = (v: unknown): string =>
  Array.isArray(v) ? `[${v.map(canon).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).filter((k) => (v as Record<string, unknown>)[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${canon((v as Record<string, unknown>)[k])}`).join(",")}}` : JSON.stringify(v);

// a three-region population, with a scalar total through SUM and a drawn link
const regions: BModel = template("regions");

// every function, scalar and arrayed, for the Python translation
const sink: BModel = {
  name: "Kitchen sink",
  timeUnit: "day",
  T: 30,
  dt: 0.5,
  dims: [{ name: "Patch", elements: ["A", "B", "C", "D"] }],
  stocks: [
    { id: "s1", name: "Tank", init: "50", x: 0, y: 0, nonNegative: true },
    { id: "s2", name: "Grass", init: "10, 40, 25, 5", x: 0, y: 0, dim: "Patch", nonNegative: true },
    { id: "s3", name: "Seed bank", init: "total_grass / 4", x: 0, y: 0, dim: "Patch" },
  ],
  flows: [
    { id: "f1", name: "Fill", to: "s1", eq: "STEP(3, 5) + PULSE(20, 2, 0) + PULSE(4, 10, 3) + RAMP(0.5, 12) + TABLE(TIME, 0, 0, 10, 2, 20, 1)", x: 0, y: 0 },
    { id: "f2", name: "Spill", from: "s1", eq: "IF(Tank > 60, (Tank - 60) / 2, 0) + MIN(Tank, 4, 10 * DT) + ABS(-1) * (Tank < 5) + 2 ^ -1 - -2 ^ 2 / 4 + LN(EXP(1)) * SQRT(4) / 2", x: 0, y: 0 },
    { id: "f3", name: "Growth", to: "s2", eq: "IF(Grass > MEAN(Grass), 0.02, 0.1) * Grass * (1 - Grass / capacity) + TABLE(Grass / capacity, 0, 0, 0.5, 1, 1, 0) + MAX(rain, Grass / 100, 0.1)", x: 0, y: 0, dim: "Patch" },
    { id: "f4", name: "Grazing", from: "s2", eq: "MIN(Grass, herd * (Grass > 3) * share)", x: 0, y: 0, dim: "Patch" },
    { id: "f5", name: "Seeding", to: "s3", eq: "Grass * 0.01 + STEP(1, 8)", x: 0, y: 0, dim: "Patch" },
  ],
  vars: [
    { id: "v1", name: "Capacity", eq: "100, 80, 60, 120", x: 0, y: 0, dim: "Patch" },
    { id: "v2", name: "Rain", eq: "0.5 + PULSE(1, 6, 2)", x: 0, y: 0 },
    { id: "v3", name: "Herd", eq: "3 + RAMP(0.1, 10)", x: 0, y: 0 },
    { id: "v4", name: "Share", eq: "Grass / SUM(Grass)", x: 0, y: 0, dim: "Patch" },
    { id: "v5", name: "Total grass", eq: "SUM(Grass) + VMIN(Grass) - VMAX(Grass) + 0 * MEAN(Grass)", x: 0, y: 0 },
    { id: "v6", name: "Flat", eq: "5 + TIME", x: 0, y: 0, dim: "Patch", units: "days" },
    { id: "v7", name: "Lambda", eq: "2", x: 0, y: 0, note: "named after a Python keyword" },
  ],
  links: [{ from: "v7", to: "v6" }],
};

// ---------------------------------------------------------------------------------------------------
// arrays and links in the app
{
  const r = simulate(regions, Number.MAX_SAFE_INTEGER);
  if (!r.ok) fail(`regions: run failed: ${r.issues.map((i) => i.msg).join("; ")}`);
  else {
    const last = (k: string) => r.values[k][r.values[k].length - 1];
    const want = (p0: number, b: number) => p0 * Math.pow(1 + 0.25 * (b - 0.015), 200);
    if (Math.abs(last("s1[North]") / want(1000, 0.04) - 1) > 1e-9 || Math.abs(last("s1[East]") / want(300, 0.02) - 1) > 1e-9) fail("regions: each region should grow at its own rate");
    if (Math.abs(last("v3") - (last("s1[North]") + last("s1[South]") + last("s1[East]"))) > 1e-6) fail("regions: Total population should be the SUM of the regions");
    if ("s1" in r.values) fail("regions: an arrayed stock should have no unsubscripted series");
    if (series(regions, { ...regions.stocks[0] }).map((s) => s.key).join() !== "s1[North],s1[South],s1[East]") fail("regions: series keys");
  }
  const issues = (m: BModel) => validate(m).issues.map((i) => `${i.level} ${i.id ?? "-"} ${i.field}: ${i.msg}`).join("\n");
  const expect = (what: string, m: BModel, want: string[]) => {
    const got = issues(m);
    for (const w of want) if (!got.includes(w)) fail(`validation (${what}): missing "${w}" in\n${got}`);
  };
  let m = clone(regions);
  m.vars[0].eq = "0.04, 0.03";
  expect("wrong count", m, ["error v1 eq: Equation: Region has 3 elements (North, South, East), but 2 values are given."]);
  m = clone(regions);
  m.vars[2].eq = "Population * 2";
  expect("scalar reads array", m, ["error v3 eq: Population is an array over Region: use SUM(Population) or MEAN(Population)."]);
  m = clone(regions);
  m.dims!.push({ name: "Age", elements: ["Young", "Old"] });
  m.flows[1].dim = "Age";
  m.vars.push({ id: "v9", name: "Per age", eq: "Population / 2", x: 0, y: 0, dim: "Age" });
  expect("mismatched dims", m, ["error f2 dim: It drains Population, which is an array over Region, so the flow must be over Region too.", "error v9 eq: Population is an array over Region, but this is over Age."]);
  m = clone(regions);
  m.links!.push({ from: "v2", to: "v3" });
  expect("unused link", m, ["warn v3 eq: You drew an arrow from Death fraction, but its equation does not use Death_fraction."]);
  if (validate(m).issues.some((i) => i.level === "error")) fail("an unused link should only warn");
  m = clone(regions);
  m.vars[1].eq = "1, 2";
  m.vars[2].eq = "SUM(Death_fraction)";
  m.stocks[0].dim = "Regions";
  expect("lists, reducers, unknown dims", m, ["error v2 eq: Equation: a list of values needs a dimension", "error v3 eq: SUM(Death_fraction) needs an arrayed element", 'error s1 dim: There is no dimension called "Regions".']);
  m = clone(regions);
  m.dims = [{ name: "Region", elements: ["North", "North", "9x"] }];
  expect("bad dimension", m, ['error - dim: Dimension Region lists "North" twice.', 'error - dim: Dimension Region: "9x" is not a usable element name']);
  // links follow elements by id
  const renamed = renameElement(regions, "s1", "People");
  if (renamed.links?.length !== 1 || renamed.vars[2].eq !== "SUM(People)" || validate(renamed).issues.length) fail(`rename: links should survive and SUM(Population) become SUM(People): ${issues(renamed)}`);
  if (removeElement(regions, "v3").links?.length !== 0) fail("remove: links to a removed element should go");
  // JSON keeps dims, links, dim and note
  for (const mm of [regions, sink]) if (canon(fromJSON(toJSON(mm))) !== canon(mm)) fail(`${mm.name}: JSON round trip changed the model`);
}

// ---------------------------------------------------------------------------------------------------
// exports, for every template, the examples above and every shared spec
const models: BModel[] = [...TEMPLATES.map((t) => template(t.id)), sink, ...Object.values(SPECS).map((s) => clone(s.model))];
const root = mkdtempSync(join(tmpdir(), "loopbricks-builder-"));
const py = (args: string[], cwd: string) => run("python3", args, { cwd, env: { ...process.env, MPLBACKEND: "Agg", PYTHONWARNINGS: "ignore" }, maxBuffer: 64 << 20 });
const jobs: (() => Promise<void>)[] = [];
// PySD is optional: set PYSD_PYTHON to a python that has pysd installed to also run every model in PySD
const PYSD = process.env.PYSD_PYTHON;
const pysd = (args: string[], cwd: string) => run(PYSD!, args, { cwd, env: { ...process.env, MPLBACKEND: "Agg", PYTHONWARNINGS: "ignore" }, maxBuffer: 64 << 20 });
const xmileFiles: string[] = [];

models.forEach((m, k) => {
  const tag = `${m.name} (${k})`;
  const res = simulate(m, Number.MAX_SAFE_INTEGER);
  if (!res.ok) return fail(`${tag}: run failed: ${res.issues.map((i) => i.msg).join("; ")}`);
  if (canon(fromJSON(toJSON(m))) !== canon(fromJSON(toJSON(fromJSON(toJSON(m)))))) fail(`${tag}: JSON round trip is not stable`);
  if (simulate(fromJSON(toJSON(m)), Number.MAX_SAFE_INTEGER).values[Object.keys(res.values)[0]]?.join() !== res.values[Object.keys(res.values)[0]]?.join()) fail(`${tag}: JSON round trip changes the run`);
  const dir = join(root, String(k));
  mkdirSync(dir);
  const files = exportFiles(m, res);
  const names = files.map((f) => f.name).join();
  const s = slug(m);
  if (names !== [`${s}.py`, "requirements.txt", `${s}.ipynb`, `${s}.json`, `${s}.xmile`, `${s}_pysd.py`, `${s}_pysd.ipynb`, `${s}.md`, `${s}-results.csv`].join()) fail(`${tag}: export file names ${names}`);
  if (exportFiles(m).some((f) => f.name.endsWith(".csv"))) fail(`${tag}: no results file without a run`);
  for (const f of files) if (/[\u2013\u2014]/.test(f.text) && !/[\u2013\u2014]/.test(toJSON(m))) fail(`${tag}: ${f.name} has an en or em dash`);
  // CSV header and size
  const csv = resultsCsv(m, res).trim().split("\n");
  const labels = elements(m).flatMap((e) => series(m, e).map((x) => x.label));
  if (csv[0] !== ["time", ...labels].join(",") || csv.length !== res.times.length + 1) fail(`${tag}: results CSV header or length`);
  if (!markdownDoc(m).startsWith(`# ${m.name}`) || !requirementsTxt(m).includes("numpy>=")) fail(`${tag}: markdown or requirements`);
  // notebook shape
  const nb = JSON.parse(notebook(m));
  if (notebookFor(m) !== notebook(m)) fail(`${tag}: notebookFor should be the exported notebook`);
  const ids = nb.cells.map((c: { id: string }) => c.id);
  if (nb.nbformat !== 4 || nb.nbformat_minor !== 5 || new Set(ids).size !== ids.length || nb.cells.some((c: { outputs?: unknown[] }) => c.outputs?.length)) fail(`${tag}: notebook format`);
  const code = nb.cells.filter((c: { cell_type: string }) => c.cell_type === "code").map((c: { source: string[] }) => c.source.join("")).join("\n\n");
  writeFileSync(join(dir, `${s}.py`), pythonScript(m));
  writeFileSync(join(dir, "notebook.py"), code);
  writeFileSync(join(dir, `${s}.xmile`), xmile(m));
  xmileFiles.push(join(dir, `${s}.xmile`));
  // final stocks in the app
  const want = new Map(m.stocks.flatMap((st) => series(m, st)).map((x) => [x.label, res.values[x.key][res.values[x.key].length - 1]]));
  jobs.push(async () => {
    try {
      await py([`${s}.py`], dir);
    } catch (e) {
      return fail(`${tag}: the Python script failed:\n${(e as { stderr?: string }).stderr ?? e}`);
    }
    const out = readFileSync(join(dir, `${s}-results.csv`), "utf8").trim().split("\n");
    const head = out[0].split(","), last = out[out.length - 1].split(",").map(Number);
    if (out.length !== res.times.length + 1) fail(`${tag}: Python gave ${out.length - 1} rows, the app ${res.times.length}`);
    for (const [label, v] of want) {
      const j = head.indexOf(label), got = last[j];
      if (j < 0) fail(`${tag}: no column ${label} in the Python results`);
      else if (!(Math.abs(got - v) <= 1e-6 * Math.max(1, Math.abs(v)))) fail(`${tag}: ${label} ends at ${got} in Python, ${v} in the app`);
    }
    try {
      await py(["notebook.py"], dir);
    } catch (e) {
      fail(`${tag}: the notebook's code failed:\n${(e as { stderr?: string }).stderr ?? e}`);
    }
    if (!PYSD) return;
    // the PySD script: load it without running its main block, then run the model and compare final stocks
    const pdir = join(dir, "pysd");
    mkdirSync(pdir);
    writeFileSync(join(pdir, `${s}_pysd.py`), pysdScript(m));
    const pnb = JSON.parse(pysdNotebook(m)).cells.filter((c: { cell_type: string }) => c.cell_type === "code").map((c: { source: string[] }) => c.source.join("")).join("\n\n");
    writeFileSync(join(pdir, "pysd_notebook.py"), pnb.replace(/plt\.show\(\)/g, "pass"));
    try {
      await pysd(["-c", `import runpy, json\nns = runpy.run_path(${JSON.stringify(`${s}_pysd.py`)})\ndf = ns["model"].run()\njson.dump({c: float(df[c].iloc[-1]) for c in ns["STOCKS"]}, open("final.json", "w"))`], pdir);
      const got = JSON.parse(readFileSync(join(pdir, "final.json"), "utf8")) as Record<string, number>;
      for (const [label, v] of want)
        if (!(Math.abs(got[label] - v) <= 1e-6 * Math.max(1, Math.abs(v)))) fail(`${tag}: ${label} ends at ${got[label]} in PySD, ${v} in the app`);
      await pysd(["pysd_notebook.py"], pdir);
    } catch (e) {
      fail(`${tag}: PySD failed:\n${((e as { stderr?: string }).stderr ?? String(e)).slice(-1500)}`);
    }
  });
});

async function main() {
  const queue = [...jobs];
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (queue.length) await queue.shift()!();
  }));
  try {
    await py(["-c", "import sys, xml.dom.minidom\nfor f in sys.argv[1:]:\n    d = xml.dom.minidom.parse(f)\n    assert d.documentElement.namespaceURI == 'http://docs.oasis-open.org/xmile/ns/XMILE/v1.0', f", ...xmileFiles], root);
  } catch (e) {
    fail(`XMILE does not parse:\n${(e as { stderr?: string }).stderr ?? e}`);
  }
  if (errs.length) {
    console.error(errs.join("\n\n"));
    console.error(`\n${errs.length} problem${errs.length === 1 ? "" : "s"} (files in ${root})`);
    process.exit(1);
  }
  console.log(`${models.length} models exported and run in Python${PYSD ? " and PySD" : " (set PYSD_PYTHON to also run them in PySD)"}`);
  console.log("builder tests pass");
}
main();
