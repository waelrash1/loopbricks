// Model builder tests: arrays, links, JSON, functions with memory, data, and every export. The Python script and
// notebook are run with python3 (numpy, pandas, matplotlib) and must give the same final stocks as the app (random
// models only roughly, as numpy draws other numbers). Run with: npm run test:builder
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

// every function added for PySD parity, data with and without extrapolation, a start time, a save interval, two
// dimensions (one transposed) and a subrange
const every: BModel = {
  name: "Every function",
  timeUnit: "week",
  start: 2,
  T: 14,
  dt: 0.25,
  saveEvery: 0.5,
  dims: [
    { name: "Region", elements: ["North", "South", "East"] },
    { name: "Coastal", elements: ["North", "South"], of: "Region" },
    { name: "Age", elements: ["Young", "Old"] },
  ],
  stocks: [
    { id: "s1", name: "Population", init: "10, 20, 30, 40, 50, 60", x: 0, y: 0, dim: "Region, Age" },
    { id: "s2", name: "Harbour", init: "SUM(Population) / 10 + Base", x: 0, y: 0, dim: "Coastal" },
    { id: "s3", name: "Tank", init: "5", x: 0, y: 0 },
    { id: "s4", name: "Cohort", init: "1", x: 0, y: 0, dim: "Age, Region" },
  ],
  flows: [
    { id: "f1", name: "Births", to: "s1", eq: "Population * birth_rate + DELAY1(Population * 0.01, 2) + DELAYN(Population * 0.01, 3, 4, 0.5) + 0.01 * Cohort", x: 0, y: 0, dim: "Region, Age" },
    { id: "f2", name: "Deaths", from: "s1", eq: "SMOOTHN(Population * 0.02, 2, 2) + SMOOTH3(Population * 0.01, 3, 1) + DELAY3(Population * 0.01, 1 + TIME / 10)", x: 0, y: 0, dim: "Region, Age" },
    { id: "f3", name: "Landing", to: "s2", eq: "Base * 0.1 + SMOOTH(Harbour, 2) * 0.05 + DELAY_FIXED(Base + TIME, 1.5, 3)", x: 0, y: 0, dim: "Coastal" },
    { id: "f4", name: "Fill", to: "s3", eq: "DELAY3(Signal, 2) + DELAY1(Signal, 1, 4) + Rainfall + Demand + Maths * 0.01 + Trend_of_signal + Forecast_signal * 0.1 + First_signal + Total * 0.001 + Late", x: 0, y: 0 },
    { id: "f5", name: "Drain", from: "s3", eq: "Tank / 4 + INITIAL(Tank) * 0.01", x: 0, y: 0 },
    { id: "f6", name: "Ageing", to: "s4", eq: "Population * 0.01", x: 0, y: 0, dim: "Age, Region" },
  ],
  vars: [
    { id: "v1", name: "Base", eq: "1, 2, 3", x: 0, y: 0, dim: "Region" },
    { id: "v2", name: "Birth rate", eq: "0.01, 0.02, 0.03", x: 0, y: 0, dim: "Region" },
    { id: "v3", name: "Signal", eq: "5 + STEP(2, 4) + RAMP(0.3, 8) + SIN(TIME) + COS(TIME / 2) + TAN(0.1 * TIME)", x: 0, y: 0 },
    { id: "v4", name: "Maths", eq: "LOG(8, 2) + POWER(2, 3) + INT(-2.5) + INT(2.5) + MODULO(-7, 3) + MODULO(7, 3) + ARCSIN(0.5) + ARCCOS(0.5) + ARCTAN(1) + PI() + ZIDZ(1, 0) + ZIDZ(1, 4) + XIDZ(1, 0, 7) + XIDZ(3, 2, 7) + TABLE_EXTRAP(TIME, 3, 1, 5, 2) + TABLE_EXTRAP(-TIME, 0, 0, 1, 1)", x: 0, y: 0 },
    { id: "v5", name: "Trend of signal", eq: "TREND(Signal, 3, 0.05)", x: 0, y: 0 },
    { id: "v6", name: "Forecast signal", eq: "FORECAST(Signal, 3, 2)", x: 0, y: 0 },
    { id: "v7", name: "First signal", eq: "INITIAL(Signal)", x: 0, y: 0 },
    { id: "v8", name: "Rainfall", eq: "", data: [[0, 1], [5, 3], [10, 2]], x: 0, y: 0 },
    { id: "v9", name: "Demand", eq: "", data: [[3, 2], [6, 4], [8, 3]], extrapolate: true, x: 0, y: 0 },
    { id: "v10", name: "Total", eq: "SUM(Population) + PROD(Base) + MEAN(Harbour) + VMIN(Population) + VMAX(Population)", x: 0, y: 0 },
    { id: "v11", name: "Trend check", eq: "TREND(Signal, 3, 0)", x: 0, y: 0 },
    { id: "v12", name: "Late", eq: "DELAY_FIXED(TIME, 1.5, -1)", x: 0, y: 0 },
  ],
};
// random numbers, arrayed and not, seeded and not
const noise: BModel = {
  name: "Noise",
  timeUnit: "day",
  T: 200,
  dt: 1,
  dims: [{ name: "Patch", elements: ["A", "B"] }],
  stocks: [{ id: "s1", name: "Level", init: "0", x: 0, y: 0, dim: "Patch" }],
  flows: [{ id: "f1", name: "Change", to: "s1", eq: "RANDOM_UNIFORM(0, 1) + RANDOM_NORMAL(-1, 1, 0, 0.5, 42)", x: 0, y: 0, dim: "Patch" }],
  vars: [{ id: "v1", name: "U", eq: "RANDOM_UNIFORM(0, 1, 7)", x: 0, y: 0 }],
};
// one CSV line as cells (labels of arrays over two dimensions hold a comma, so they come quoted)
const cells = (line: string) => [...line.matchAll(/("(?:[^"]|"")*"|[^,]*)(?:,|$)/g)].slice(0, -1).map((x) => x[1].replace(/^"|"$/g, "").replace(/""/g, '"'));
const isRandom = (m: BModel) => /RANDOM_/i.test(JSON.stringify(m));

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
  for (const mm of [regions, sink, every, noise]) if (canon(fromJSON(toJSON(mm))) !== canon(mm)) fail(`${mm.name}: JSON round trip changed the model`);

  // the new rules
  m = clone(every);
  m.flows[0].eq = "DELAYN(Population, 3, 2.5)";
  m.vars[3].eq = "DELAY_FIXED(Signal, Signal, 0)";
  m.vars[4].eq = "SMOOTHN(Signal, 3, Signal)";
  m.vars[7].data = [[0, 1]];
  m.vars[8].data = [[0, 1], [0, 2]];
  m.vars[11].data = [[0, 1], [1, NaN]];
  m.start = 20;
  m.saveEvery = 0.3;
  m.dims![1].elements = ["North", "West"];
  m.stocks[0].init = "1, 2, 3";
  m.stocks[2].dim = "Region, Region";
  m.vars.push({ id: "v20", name: "Wide", eq: "Harbour", x: 0, y: 0, dim: "Region" });
  expect("new rules", m, [
    "error f1 eq: Equation: the order of DELAYN must be a whole number of at least 1",
    "error v4 eq: Equation: DELAY_FIXED needs a fixed delay time",
    "error v5 eq: Equation: the order of SMOOTHN must be a whole number",
    "error v8 data: Data: give at least 2 points",
    "error v9 data: Data: the times must increase, but 0 comes after 0.",
    "error v12 data: Data: every point must be a time and a value, both plain numbers.",
    "error - settings: Stop time must be a number after the start time (20).",
    "error - settings: Save every must be a whole number of time steps (dt = 0.25)",
    'error - dim: Dimension Coastal: "West" is not an element of Region',
    "error s1 init: Initial value: Region, Age has 6 elements",
    "error s3 dim: It lists Region twice",
    "error v20 eq: Harbour is an array over Coastal, but this is over Region.",
  ]);
  m = clone(every);
  m.dims![1].of = "Regions";
  expect("unknown parent", m, ['error - dim: Dimension Coastal is a subrange of "Regions", but there is no dimension called that.']);
  // a delay or smooth is a stock, so it breaks a loop; TREND reads its input at once, so it does not
  m = clone(template("bathtub"));
  m.vars.push({ id: "v8", name: "a", eq: "DELAY1(b, 2, 0) + SMOOTH(b, 3, 1)", x: 0, y: 0 }, { id: "v9", name: "b", eq: "a + 1", x: 0, y: 0 });
  if (validate(m).issues.some((i) => i.level === "error") || !simulate(m).ok) fail(`a loop through DELAY1 and SMOOTH should run: ${issues(m)}`);
  m.vars[1].eq = "TREND(b, 2, 0)";
  expect("loop through TREND", m, ["error v8 eq: Circular definition: b → a → b."]);

  // the app's numbers for what PySD does not check on its own
  const ev = simulate(every, Number.MAX_SAFE_INTEGER);
  if (!ev.ok) fail(`every: run failed: ${ev.issues.map((i) => i.msg).join("; ")}`);
  else {
    if (ev.times.length !== 25 || ev.times[0] !== 2 || ev.times[24] !== 14) fail(`every: times should run from 2 to 14 every 0.5, got ${ev.times.length} from ${ev.times[0]} to ${ev.times[ev.times.length - 1]}`);
    if (series(every, every.stocks[0]).map((x) => x.key).join() !== "s1[North,Young],s1[North,Old],s1[South,Young],s1[South,Old],s1[East,Young],s1[East,Old]") fail("every: 2-D series keys");
    if (series(every, every.stocks[0])[1].label !== "Population[North,Old]" || !ev.values["s4[Old,East]"] || !ev.values["s2[South]"] || Object.keys(ev.values).some((k) => k.includes("~"))) fail("every: values keys");
    ev.times.forEach((t, i) => {
      const late = ev.values.v12[i], want = t >= 3.5 - 1e-9 ? t - 1.5 : -1;
      if (Math.abs(late - want) > 1e-9) fail(`every: DELAY_FIXED(TIME, 1.5, -1) at ${t} gave ${late}, expected ${want}`);
      const f = ev.values.v6[i], g = ev.values.v3[i] * (1 + ev.values.v11[i] * 2);
      if (Math.abs(f - g) > 1e-9) fail(`every: FORECAST should be input * (1 + TREND * horizon) at ${t}: ${f} vs ${g}`);
      if (ev.values.v7[i] !== ev.values.v3[0]) fail("every: INITIAL should hold the first value");
    });
    const maths = ev.values.v4[0], t0 = 2;
    const wantMaths = 3 + 8 - 2 + 2 - 1 + 1 + Math.asin(0.5) + Math.acos(0.5) + Math.atan(1) + Math.PI + 0 + 0.25 + 7 + 1.5 + 1 + 0.5 * (t0 - 3) + -t0;
    if (Math.abs(maths - wantMaths) > 1e-9) fail(`every: Maths at the start gave ${maths}, expected ${wantMaths}`);
    if (ev.values.v8[0] !== 1.8 || Math.abs(ev.values.v9[0] - 4 / 3) > 1e-12 || Math.abs(ev.values.v9[24]) > 1e-12) fail(`every: data at the start ${ev.values.v8[0]}, ${ev.values.v9[0]}; extrapolated or held at 14: ${ev.values.v9[24]}`);
  }
  // random: the same run twice, different streams per element, and the right spread
  const n1 = simulate(noise, Number.MAX_SAFE_INTEGER), n2 = simulate(fromJSON(toJSON(noise)), Number.MAX_SAFE_INTEGER);
  if (!n1.ok || JSON.stringify(n1.values) !== JSON.stringify(n2.values)) fail("noise: two runs with the same seeds should be the same");
  else {
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    if (n1.values["f1[A]"].join() === n1.values["f1[B]"].join()) fail("noise: each element should draw its own numbers");
    if (Math.abs(mean(n1.values.v1) - 0.5) > 0.08 || Math.abs(mean(n1.values["f1[A]"]) - 0.5) > 0.15) fail(`noise: means ${mean(n1.values.v1)}, ${mean(n1.values["f1[A]"])}`);
    if (n1.values["f1[B]"].some((v) => v < -1 || v > 2)) fail("noise: RANDOM_NORMAL should stay within its limits");
  }
}

// ---------------------------------------------------------------------------------------------------
// exports, for every template, the examples above and every shared spec
const models: BModel[] = [...TEMPLATES.map((t) => template(t.id)), sink, every, noise, ...Object.values(SPECS).map((s) => clone(s.model))];
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
  if (cells(csv[0]).join("|") !== ["time", ...labels].join("|") || csv.length !== res.times.length + 1) fail(`${tag}: results CSV header or length`);
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
  // random models: numpy and PySD draw other numbers, so only the size of the result is compared
  const tol = isRandom(m) ? 0.4 : 1e-6;
  jobs.push(async () => {
    try {
      await py([`${s}.py`], dir);
    } catch (e) {
      return fail(`${tag}: the Python script failed:\n${(e as { stderr?: string }).stderr ?? e}`);
    }
    const out = readFileSync(join(dir, `${s}-results.csv`), "utf8").trim().split("\n");
    const head = cells(out[0]), last = cells(out[out.length - 1]).map(Number);
    if (out.length !== res.times.length + 1) fail(`${tag}: Python gave ${out.length - 1} rows, the app ${res.times.length}`);
    for (const [label, v] of want) {
      const j = head.indexOf(label), got = last[j];
      if (j < 0) fail(`${tag}: no column ${label} in the Python results`);
      else if (!(Math.abs(got - v) <= tol * Math.max(1, Math.abs(v)))) fail(`${tag}: ${label} ends at ${got} in Python, ${v} in the app`);
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
      await pysd(["-c", `import runpy, json\nns = runpy.run_path(${JSON.stringify(`${s}_pysd.py`)})\ndf = ns["model"].run(saveper=ns["SAVEPER"])\njson.dump({"rows": len(df), "first": float(df.index[0]), "final": {c: float(df[c].iloc[-1]) for c in ns["STOCKS"]}}, open("final.json", "w"))`], pdir);
      const out = JSON.parse(readFileSync(join(pdir, "final.json"), "utf8")) as { rows: number; first: number; final: Record<string, number> };
      if (out.rows !== res.times.length || out.first !== res.times[0]) fail(`${tag}: PySD kept ${out.rows} rows from ${out.first}, the app ${res.times.length} from ${res.times[0]}`);
      for (const [label, v] of want)
        if (!(Math.abs(out.final[label] - v) <= tol * Math.max(1, Math.abs(v)))) fail(`${tag}: ${label} ends at ${out.final[label]} in PySD, ${v} in the app`);
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
