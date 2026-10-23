// The learner's own stock-and-flow model: its shape, checks, Euler simulation, templates and storage.
import { NAME_RE, REDUCERS, RESERVED, SEED_ARG, STATEFUL, evaluator, expand, literal, nameKey, refName, renameRefs, slotKey, tryCompile, unparse, walk, type Compiled, type Node, type Scope } from "@/lib/expr";

// dim: the name of a dimension in BModel.dims, or several separated by commas ("Region, Age") for a multi-dimensional
// array; the element then holds one value per combination. Its equation or initial value applies to every combination;
// a comma list ("10, 20, 30") gives one value per combination in row-major order (last dimension fastest).
// eqs: per-element equations (a stock's initial values) that override the general one, keyed by element ("North", or
// "North,Young" over two dimensions); the general equation applies to the rest.
export type BStock = { id: string; name: string; init: string; x: number; y: number; units?: string; nonNegative?: boolean; dim?: string; note?: string; eqs?: Record<string, string> }; // nonNegative: a physical stock floored at zero, as in the app's molecules
export type BFlow = { id: string; name: string; from?: string; to?: string; eq: string; x: number; y: number; units?: string; dim?: string; note?: string; eqs?: Record<string, string> };
// data: a time series [time, value][] read from a CSV; the variable then takes the value interpolated at TIME (linear,
// held flat outside the data unless extrapolate is true) and its eq is ignored.
export type BVar = { id: string; name: string; eq: string; x: number; y: number; units?: string; dim?: string; note?: string; data?: [number, number][]; extrapolate?: boolean; eqs?: Record<string, string> }; // an auxiliary, or a constant when eq is a number
// A dimension (subscript range), e.g. { name: "Region", elements: ["North", "South"] }.
// of: makes this dimension a subrange of another (its elements are a subset of that dimension's elements).
export type BDim = { name: string; elements: string[]; of?: string };
// An information arrow the modeller drew, from one element to another (by id). Arrows implied by equations are still drawn
// automatically; a drawn arrow that the target's equation does not use is flagged.
export type BLink = { from: string; to: string };
// start: the start time (default 0); T is the stop time. saveEvery: how often results are kept (default dt).
// plot: the element ids drawn in the results chart (default: every stock).
export type BModel = { name: string; timeUnit: string; T: number; dt: number; start?: number; saveEvery?: number; plot?: string[]; stocks: BStock[]; flows: BFlow[]; vars: BVar[]; dims?: BDim[]; links?: BLink[] };
export type Kind = "stock" | "flow" | "var";
export type Element = (BStock & { kind: "stock" }) | (BFlow & { kind: "flow" }) | (BVar & { kind: "var" });
export type Field = "name" | "eq" | "init" | "from" | "to" | "units" | "settings" | "dim" | "data"; // dim: an element's dimension, or (with no id) the dimension list; data: a variable's time series
export type Issue = { id?: string; field: Field; level: "error" | "warn"; msg: string };

export const STORAGE_KEY = "loopbricks-builder";
export const MAX_STEPS = 100_000;

export const elements = (m: BModel): Element[] => [
  ...m.stocks.map((s) => ({ ...s, kind: "stock" as const })),
  ...m.flows.map((f) => ({ ...f, kind: "flow" as const })),
  ...m.vars.map((v) => ({ ...v, kind: "var" as const })),
];
export const findElement = (m: BModel, id: string | null | undefined): Element | undefined => (id ? elements(m).find((e) => e.id === id) : undefined);
const NUM = String.raw`\s*[-−]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?\s*`;
const LIST_RE = new RegExp(`^${NUM}(,${NUM})+$`);
// "10, 20, 30": one number per element of an arrayed element's dimension
export const parseList = (src: string): number[] | null => (LIST_RE.test(src) ? src.split(",").map((x) => +x.trim().replace("−", "-")) : null);
// per-element equations, if any
export const hasEqs = (e: { eqs?: Record<string, string> }) => !!e.eqs && Object.keys(e.eqs).length > 0;
// a number, or a list of numbers for an arrayed constant (a data variable, or one with per-element equations, is never a constant)
export const isConstant = (v: { eq: string; data?: unknown; eqs?: Record<string, string> }) => !v.data && !hasEqs(v) && (new RegExp(`^${NUM}$`).test(v.eq) || LIST_RE.test(v.eq));
export const inflows = (m: BModel, id: string) => m.flows.filter((f) => f.to === id);
export const outflows = (m: BModel, id: string) => m.flows.filter((f) => f.from === id);

// dimensions: "Region, Age" names two; an element over both holds one value per combination
export const dimNames = (dim?: string) => (dim ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const findDim = (m: BModel, name?: string) => (name ? m.dims?.find((d) => nameKey(d.name) === nameKey(name)) : undefined);
// an element's dimensions in order, matched by name as names are (case and spaces aside); undefined for a single value
export const axesOf = (m: BModel, e: { dim?: string }): BDim[] | undefined => {
  const ds = dimNames(e.dim).map((n) => findDim(m, n));
  return ds.length && ds.every(Boolean) ? (ds as BDim[]) : undefined;
};
// several dimensions as one: every combination in row-major order (last dimension fastest), named "North,Young"
export const product = (ds: BDim[]): BDim =>
  ds.length === 1 ? ds[0] : { name: ds.map((d) => d.name).join(", "), elements: ds.reduce<string[]>((acc, d) => acc.flatMap((a) => d.elements.map((x) => (a ? `${a},${x}` : x))), [""]) };
// an element's dimension, or the product of its dimensions
export const dimOf = (m: BModel, e: { dim?: string }) => {
  const a = axesOf(m, e);
  return a && product(a);
};
// a is the dimension b, or a subrange of it (following of)
export function within(m: BModel, a: BDim, b: BDim) {
  for (let d: BDim | undefined = a, i = 0; d && i < 20; d = findDim(m, d.of), i++) if (nameKey(d.name) === nameKey(b.name)) return true;
  return false;
}
// a can be read where b is expected: it is b, a subrange of it, or (as Vensim allows) a dimension whose elements are all b's
export const fits = (m: BModel, a: BDim, b: BDim) => within(m, a, b) || a.elements.every((x) => b.elements.some((y) => nameKey(x) === nameKey(y)));
// Which element of X (over xa) an equation over mine reads at the combination at (one element name per dimension of
// mine): X's dimensions are matched to mine by name, and a subrange of mine reads its parent on the shared elements.
// ponytail: matching by dimension, as the equations have no subscripts; with a dimension twice (Region x Region) the first wins.
export function pick(m: BModel, mine: BDim[], at: string[], xa: BDim[]): string | undefined {
  const out: string[] = [];
  for (const d of xa) {
    const i = mine.findIndex((a) => fits(m, a, d));
    if (i < 0) return undefined;
    out.push(at[i]);
  }
  return out.join(",");
}
// One subscript of a reference X[...] at X's dimension d: the element it names, or (a dimension name) the position of my
// dimension it follows, "this element"; or why it cannot be read.
export function subAt(m: BModel, mine: BDim[] | undefined, d: BDim, s: string): { el: string } | { axis: number } | { err: string } {
  const el = d.elements.find((x) => nameKey(x) === nameKey(s));
  if (el !== undefined) return { el };
  const D = findDim(m, s);
  if (!D) return { err: `"${s}" is not an element of ${d.name}` };
  const j = mine ? mine.findIndex((a) => fits(m, a, D) && fits(m, a, d)) : -1;
  return j < 0 ? { err: `${D.name} stands for "this element" only in an equation over ${D.name} (or a subrange of it) whose elements are in ${d.name}` } : { axis: j };
}
// The element of X (over xa) a reference reads at the combination at of mine: from its subscripts if it has them,
// otherwise matched by dimension (see pick). undefined for a single value.
export function resolve(m: BModel, mine: BDim[] | undefined, at: string[] | undefined, xa: BDim[] | undefined, sub?: string[]): string | undefined {
  if (!xa) return undefined;
  if (!sub) return mine && at ? pick(m, mine, at, xa) : undefined;
  if (sub.length !== xa.length) return undefined;
  const out: string[] = [];
  for (let i = 0; i < xa.length; i++) {
    const r = subAt(m, mine, xa[i], sub[i]);
    if ("err" in r || ("axis" in r && !at)) return undefined;
    out.push("el" in r ? r.el : at![r.axis]);
  }
  return out.join(",");
}
// An equation for the combination at of mine with every arrayed reference made explicit (Population[North]), so it reads
// the same with no dimension around it: how a per-element equation becomes a plain single-value one.
export function fixAt(m: BModel, n: Node, mine: BDim[], at: string[]): Node {
  const axes = new Map(elements(m).map((e) => [nameKey(e.name), axesOf(m, e)]));
  const go = (x: Node): Node => {
    if (x.k === "name") {
      const el = resolve(m, mine, at, axes.get(x.key), x.sub);
      return el === undefined ? x : { ...x, sub: el.split(",") };
    }
    if (x.k === "neg") return { k: "neg", a: go(x.a) };
    if (x.k === "bin") return { ...x, a: go(x.a), b: go(x.b) };
    if (x.k === "call") return REDUCERS.has(x.f) || x.f === "ELMCOUNT" ? x : { ...x, args: x.args.map(go) };
    return x;
  };
  return go(n);
}
// the series a run gives for an element: one for a single value, one per element of its dimensions ("Population[North]",
// "Population[North,Young]")
export const series = (m: BModel, e: { id: string; name: string; dim?: string }) => {
  const d = dimOf(m, e);
  return d ? d.elements.map((x) => ({ key: `${e.id}[${x}]`, label: `${e.name}[${x}]` })) : [{ key: e.id, label: e.name }];
};
// a data variable as the lookup over TIME it is
export const dataEq = (v: BVar) => `${v.extrapolate ? "TABLE_EXTRAP" : "TABLE"}(TIME, ${v.data!.map(([t, y]) => `${t}, ${y}`).join(", ")})`;
// the text an element is worked out from: a stock's initial value, a data variable's lookup, or the equation
export const sourceOf = (e: Element) => (e.kind === "stock" ? e.init : e.kind === "var" && e.data ? dataEq(e) : e.eq);
// a number known before the run: a plain number, or the name of a single-valued constant
export function constNum(m: BModel, n: Node | undefined): number | undefined {
  const v = n && literal(n);
  if (v !== undefined || n?.k !== "name") return v;
  const e = m.vars.find((x) => nameKey(x.name) === n.key);
  return e && !e.dim && isConstant(e) && !parseList(e.eq) ? +e.eq.trim().replace("−", "-") : undefined;
}
// hidden elements (the stocks inside a DELAY3, say) have ids like "f1~2": the owner's id, a tilde, a number
export const isHidden = (id: string) => id.includes("~");
export const ownerOf = (id: string) => id.split("~")[0];

export function newId(m: BModel, prefix: "s" | "f" | "v") {
  const used = new Set(elements(m).map((e) => e.id));
  let n = 1;
  while (used.has(prefix + n)) n++;
  return prefix + n;
}
// a fresh name not already taken: "Stock 2", "flow 3"
export function freshName(m: BModel, base: string) {
  const used = new Set(elements(m).map((e) => nameKey(e.name)));
  if (!used.has(nameKey(base))) return base;
  let n = 2;
  while (used.has(nameKey(`${base} ${n}`))) n++;
  return `${base} ${n}`;
}

// rename an element and rewrite references to it, unless the new name collides with another element
export function renameElement(m: BModel, id: string, name: string): BModel {
  const el = findElement(m, id);
  if (!el) return m;
  const oldKey = nameKey(el.name), newKey = nameKey(name);
  const clash = elements(m).some((e) => e.id !== id && nameKey(e.name) === newKey);
  const rewrite = oldKey && newKey && oldKey !== newKey && !clash && NAME_RE.test(name.trim());
  const fix = (s: string) => (rewrite ? renameRefs(s, oldKey, name) : s);
  const eqs = (e: { eqs?: Record<string, string> }) => (e.eqs ? { eqs: Object.fromEntries(Object.entries(e.eqs).map(([k, v]) => [k, fix(v)])) } : {});
  return {
    ...m,
    stocks: m.stocks.map((s) => ({ ...s, name: s.id === id ? name : s.name, init: fix(s.init), ...eqs(s) })),
    flows: m.flows.map((f) => ({ ...f, name: f.id === id ? name : f.name, eq: fix(f.eq), ...eqs(f) })),
    vars: m.vars.map((v) => ({ ...v, name: v.id === id ? name : v.name, eq: fix(v.eq), ...eqs(v) })),
  };
}

// remove an element; flows that touched a removed stock open onto a cloud at that end
export function removeElement(m: BModel, id: string): BModel {
  return {
    ...m,
    stocks: m.stocks.filter((s) => s.id !== id),
    flows: m.flows.filter((f) => f.id !== id).map((f) => ({ ...f, from: f.from === id ? undefined : f.from, to: f.to === id ? undefined : f.to })),
    vars: m.vars.filter((v) => v.id !== id),
    ...(m.links ? { links: m.links.filter((l) => l.from !== id && l.to !== id) } : {}),
    ...(m.plot ? { plot: m.plot.filter((p) => p !== id) } : {}),
  };
}

// ---------------------------------------------------------------------------------------------------
// units: a light check that each flow is measured in its stock's units per time unit
const normUnit = (u: string) =>
  u
    .toLowerCase()
    .replace(/\s+per\s+/g, "/")
    .replace(/\s+/g, "")
    .replace(/([a-z])s\b/g, "$1"); // weeks = week
export function unitsMatch(stockUnits: string, flowUnits: string, timeUnit: string) {
  return normUnit(flowUnits) === normUnit(`${stockUnits}/${timeUnit}`);
}

// edit distance, to suggest a name when one is misspelt
function lev(a: string, b: string) {
  const d = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = t;
    }
  }
  return d[b.length];
}

export type Checked = {
  issues: Issue[];
  byKey: Map<string, Element>;
  code: Map<string, Compiled>; // element id -> compiled equation (initial value for stocks)
  order: string[]; // flows and variables, each after everything it depends on
  dims: Map<string, BDim>; // element id -> its dimension (the product of its dimensions), for arrayed elements
  axes: Map<string, BDim[]>; // element id -> its dimensions in order, for arrayed elements
  lists: Map<string, number[]>; // element id -> one value per element, when written as a list ("10, 20, 30")
  cells: Map<string, Map<string, Compiled>>; // element id -> per-element equations, by element ("North,Young" as in dims)
  model: BModel; // the model these describe
  sim: Checked; // the model as it runs, stateful functions turned into hidden elements (see lower); itself when there are none
};

// every name an element's equations read, the general one and any per element
export const refsOf = (chk: Pick<Checked, "code" | "cells">, id: string) => [...new Set([...(chk.code.get(id)?.refs ?? []), ...[...(chk.cells.get(id)?.values() ?? [])].flatMap((c) => c.refs)])];

// every name an equation reads, with the reducer around it if any (SUM(X) reads X as a whole), or its subscripts
function reads(n: Node, f: (key: string, reducer?: string, sub?: string[]) => void) {
  if (n.k === "name") f(n.key, undefined, n.sub);
  else if (n.k === "call" && n.f === "ELMCOUNT") return;
  else if (n.k === "call" && REDUCERS.has(n.f) && n.args[0]?.k === "name") f(n.args[0].key, n.f);
  else if (n.k === "neg") reads(n.a, f);
  else if (n.k === "bin") (reads(n.a, f), reads(n.b, f));
  else if (n.k === "call") n.args.forEach((a) => reads(a, f));
}

const dataProblem = (d: unknown): string | undefined => {
  if (!Array.isArray(d) || d.length < 2) return "Data: give at least 2 points (time, value), so there is a line to read between them.";
  if (d.some((p) => !Array.isArray(p) || p.length !== 2 || !p.every((x) => typeof x === "number" && Number.isFinite(x)))) return "Data: every point must be a time and a value, both plain numbers.";
  for (let i = 1; i < d.length; i++) if (!(d[i][0] > d[i - 1][0])) return `Data: the times must increase, but ${d[i][0]} comes after ${d[i - 1][0]}.`;
};

// Every check but the order of evaluation (see validate).
function check(m: BModel) {
  const issues: Issue[] = [];
  const els = elements(m);
  const err = (id: string | undefined, field: Field, msg: string) => issues.push({ id, field, level: "error", msg });
  const warn = (id: string | undefined, field: Field, msg: string) => issues.push({ id, field, level: "warn", msg });

  // settings
  const start = m.start ?? 0, span = m.T - start;
  if (!Number.isFinite(start)) err(undefined, "settings", "Start time must be a number.");
  else if (!(m.T > start) || !Number.isFinite(m.T)) err(undefined, "settings", start ? `Stop time must be a number after the start time (${start}).` : "Stop time must be a number above 0.");
  if (!(m.dt > 0) || !Number.isFinite(m.dt)) err(undefined, "settings", "The time step (dt) must be a number above 0.");
  else if (m.dt > span) err(undefined, "settings", "The time step (dt) is longer than the whole run.");
  else if (span / m.dt > MAX_STEPS) err(undefined, "settings", `That is ${Math.round(span / m.dt).toLocaleString()} steps; use a larger dt (at most ${MAX_STEPS.toLocaleString()} steps).`);
  if (m.saveEvery !== undefined && m.dt > 0) {
    const k = m.saveEvery / m.dt;
    if (!(m.saveEvery > 0) || !Number.isFinite(m.saveEvery)) err(undefined, "settings", "Save every must be a number above 0.");
    else if (Math.abs(k - Math.round(k)) > 1e-9 * Math.max(1, k) || Math.round(k) < 1) err(undefined, "settings", `Save every must be a whole number of time steps (dt = ${m.dt}), such as ${m.dt}, ${2 * m.dt} or ${4 * m.dt}.`);
  }
  if (!m.timeUnit.trim()) warn(undefined, "settings", "Name the time unit (for example weeks), so rates read as units per week.");

  // names
  const byKey = new Map<string, Element>();
  const counts = new Map<string, number>();
  els.forEach((e) => counts.set(nameKey(e.name), (counts.get(nameKey(e.name)) ?? 0) + 1));
  for (const e of els) {
    const k = nameKey(e.name);
    if (!e.name.trim()) err(e.id, "name", "Give it a name.");
    else if (!NAME_RE.test(e.name.trim())) err(e.id, "name", "Names may use letters, digits, spaces and underscores, and must start with a letter.");
    else if (RESERVED.has(k)) err(e.id, "name", `"${e.name}" is a reserved word; choose another name.`);
    else if ((counts.get(k) ?? 0) > 1) err(e.id, "name", `Another element is also called "${e.name}". Names must be unique.`);
    if (k && !byKey.has(k)) byKey.set(k, e);
  }

  // dimensions
  const dimByKey = new Map<string, BDim>();
  for (const d of m.dims ?? []) {
    const k = nameKey(d.name);
    if (!NAME_RE.test(d.name.trim())) err(undefined, "dim", `Dimension "${d.name}": names may use letters, digits, spaces and underscores, and must start with a letter.`);
    else if (dimByKey.has(k)) err(undefined, "dim", `Two dimensions are called "${d.name}".`);
    if (!d.elements.length) err(undefined, "dim", `Dimension ${d.name} has no elements. List them, for example North, South.`);
    const seenEl = new Set<string>();
    for (const x of d.elements) {
      if (!NAME_RE.test(x.trim())) err(undefined, "dim", `Dimension ${d.name}: "${x}" is not a usable element name (letters, digits, spaces and underscores, starting with a letter).`);
      else if (seenEl.has(nameKey(x))) err(undefined, "dim", `Dimension ${d.name} lists "${x}" twice.`);
      seenEl.add(nameKey(x));
    }
    if (d.of !== undefined) {
      const p = findDim(m, d.of);
      if (!p) err(undefined, "dim", `Dimension ${d.name} is a subrange of "${d.of}", but there is no dimension called that.`);
      else if (within(m, p, d)) err(undefined, "dim", `Dimension ${d.name} cannot be a subrange of itself.`);
      else for (const x of d.elements) if (!p.elements.some((y) => nameKey(y) === nameKey(x))) err(undefined, "dim", `Dimension ${d.name}: "${x}" is not an element of ${p.name}, so it cannot be in a subrange of it.`);
    }
    if (k && !dimByKey.has(k)) dimByKey.set(k, d);
  }
  const axes = new Map<string, BDim[]>(), dims = new Map<string, BDim>();
  for (const e of els) {
    if (!e.dim) continue;
    const names = dimNames(e.dim), ds = names.map((n) => dimByKey.get(nameKey(n)));
    const missing = names.filter((_, i) => !ds[i]), twice = names.find((n, i) => names.findIndex((x) => nameKey(x) === nameKey(n)) !== i);
    if (missing.length) missing.forEach((n) => err(e.id, "dim", `There is no dimension called "${n}".`));
    else if (twice) err(e.id, "dim", `It lists ${twice} twice: name each dimension once.`);
    else axes.set(e.id, ds as BDim[]), dims.set(e.id, product(ds as BDim[]));
  }

  // equations
  const code = new Map<string, Compiled>();
  const lists = new Map<string, number[]>();
  const suggest = (k: string) => {
    let best = "", bd = 3;
    byKey.forEach((e, key) => {
      const d = lev(k, key);
      if (d < bd) (bd = d), (best = e.name);
    });
    return best ? ` Did you mean ${refName(best)}?` : "";
  };
  for (const e of els) {
    const field: Field = e.kind === "stock" ? "init" : "eq";
    const what = e.kind === "stock" ? "Initial value" : "Equation";
    if (e.kind === "var" && e.data) {
      const msg = dataProblem(e.data);
      if (msg) {
        err(e.id, "data", msg);
        continue;
      }
    }
    const src = sourceOf(e);
    if (!src.trim()) {
      err(e.id, field, e.kind === "stock" ? "Give it an initial value." : e.kind === "flow" ? "Write an equation for this flow (a rate)." : "Write an equation, or a number for a constant.");
      continue;
    }
    const list = parseList(src);
    if (list) {
      const d = dims.get(e.id);
      if (!e.dim) err(e.id, field, `${what}: a list of values needs a dimension, so each value has an element to belong to. Choose one, or give a single value.`);
      else if (d && list.length !== d.elements.length) err(e.id, field, `${what}: ${d.name} has ${d.elements.length} element${d.elements.length === 1 ? "" : "s"} (${d.elements.join(", ")}), but ${list.length} values are given.`);
      else if (d) lists.set(e.id, list);
      continue;
    }
    const r = tryCompile(src);
    if (!r.ok) {
      err(e.id, field, `${what}: ${r.error.message}`);
      continue;
    }
    code.set(e.id, r.c);
    checkCode(e, field, what, r.c);
  }

  // per-element equations: each for an element (combination) of its dimensions, checked as the general one is
  const cells = new Map<string, Map<string, Compiled>>();
  for (const e of els) {
    if (!hasEqs(e)) continue;
    const field: Field = e.kind === "stock" ? "init" : "eq", mine = axes.get(e.id), own = new Map<string, Compiled>();
    if (!e.dim) err(e.id, field, "Per-element equations need an array: give it a dimension, or remove them.");
    if (!mine) continue;
    cells.set(e.id, own);
    for (const [k, src] of Object.entries(e.eqs!)) {
      const parts = k.split(",").map((x) => x.trim()), label = `For ${parts.join(", ")}`;
      const miss = parts.findIndex((x, i) => !mine[i]?.elements.some((y) => nameKey(y) === nameKey(x)));
      if (parts.length !== mine.length) err(e.id, field, `${label}: name one element of each of ${mine.map((d) => d.name).join(", ")}, such as ${mine.map((d) => d.elements[0]).join(",")}.`);
      else if (miss >= 0) err(e.id, field, `${label}: "${parts[miss]}" is not an element of ${mine[miss].name}.`);
      else {
        const at = parts.map((x, i) => mine[i].elements.find((y) => nameKey(y) === nameKey(x))!).join(",");
        const r = tryCompile(src);
        if (own.has(at)) err(e.id, field, `${label}: there are two equations for it.`);
        else if (!src.trim()) err(e.id, field, `${label}: the equation is empty.`);
        else if (!r.ok) err(e.id, field, `${label}: ${r.error.message}`);
        else own.set(at, r.c), checkCode(e, field, label, r.c, `${label}: `);
      }
    }
  }
  // the checks on one compiled equation: names, functions with memory, arrays
  function checkCode(e: Element, field: Field, what: string, c: Compiled, pre = "") {
    for (const ref of c.refs) {
      if (!byKey.has(ref)) err(e.id, field, `${what} uses "${ref}", which is not in the model.${suggest(ref)}`);
      else if (byKey.get(ref)!.id === e.id && e.kind === "stock") err(e.id, field, "A stock's initial value can't refer to the stock itself.");
    }
    // functions with memory: orders and fixed delay times are known before the run
    walk(c.ast, (n) => {
      if (n.k !== "call") return;
      if (n.f === "ELMCOUNT" && n.args[0].k === "name" && !findDim(m, n.args[0].raw)) err(e.id, field, `${pre}ELMCOUNT(${n.args[0].raw}): there is no dimension called ${n.args[0].raw}.`);
      if (n.f === "DELAYN" || n.f === "SMOOTHN") {
        const k = constNum(m, n.args[2]);
        if (!(k !== undefined && Number.isInteger(k) && k >= 1)) err(e.id, field, `${what}: the order of ${n.f} must be a whole number of at least 1, written as a number or the name of a constant, such as ${n.f}(input, 6, 3).`);
      }
      if (n.f === "DELAY_FIXED") {
        const d = constNum(m, n.args[1]);
        if (!(d !== undefined && d >= 0)) err(e.id, field, `${what}: DELAY_FIXED needs a fixed delay time, a number or the name of a constant (at least 0), such as DELAY_FIXED(input, 4, 0).`);
      }
    });
    // arrays: matching dimensions read element by element, a single value broadcasts, anything else needs a reducer
    // or subscripts that pick elements out
    const mine = axes.get(e.id), told = new Set<string>();
    reads(c.ast, (key, reducer, sub) => {
      const x = byKey.get(key), xa = x && axes.get(x.id), xd = x && dims.get(x.id), tag = key + (reducer ?? "") + (sub ? `[${sub.join()}]` : "");
      if (!x || told.has(tag)) return;
      const X = refName(x.name);
      if (sub) {
        if (!x.dim) err(e.id, field, `${pre}${X} is a single value, so it has no elements to pick: write ${X} without [ ].`);
        else if (!xa) return;
        else if (sub.length !== xa.length) err(e.id, field, `${pre}${X} is an array over ${xd!.name}: give one element (or dimension) for each, such as ${X}[${xa.map((d) => refName(d.elements[0])).join(", ")}].`);
        else {
          const bad = xa.map((d, i) => subAt(m, mine, d, sub[i])).find((r) => "err" in r) as { err: string } | undefined;
          if (!bad) return;
          err(e.id, field, `${pre}${X}[${sub.join(", ")}]: ${bad.err}.`);
        }
      } else if (reducer && !xd && !x.dim) err(e.id, field, `${pre}${reducer}(${X}) needs an arrayed element, but ${X} is a single value.`);
      else if (!reducer && xd && !mine) err(e.id, field, `${pre}${X} is an array over ${xd.name}: use SUM(${X}) or MEAN(${X}), or pick an element, ${X}[${refName(xd.elements[0])}].`);
      else if (!reducer && xa && mine && pick(m, mine, mine.map((d) => d.elements[0]), xa) === undefined)
        err(e.id, field, `${pre}${X} is an array over ${xd!.name}, but this is over ${dims.get(e.id)!.name}. Each of its dimensions must be one of these (or one these are a subrange of) to be read element by element; use SUM(${X}) or MEAN(${X}) for a single value.`);
      else return;
      told.add(tag);
    });
  }

  // drawn arrows the target does not use (arrows implied by equations need no drawing, so only unused ones are flagged)
  for (const l of m.links ?? []) {
    const a = findElement(m, l.from), b = findElement(m, l.to);
    if (!a || !b || !(code.has(b.id) || lists.has(b.id))) continue;
    if (!refsOf({ code, cells }, b.id).includes(nameKey(a.name)))
      warn(b.id, b.kind === "stock" ? "init" : "eq", `You drew an arrow from ${a.name}, but ${b.kind === "stock" ? "its initial value" : "its equation"} does not use ${refName(a.name)}. Use it, or delete the arrow.`);
  }

  // flows: ends must exist, and a flow can't run from a cloud to a cloud
  const stockIds = new Set(m.stocks.map((s) => s.id));
  const dk = (id: string) => (axes.get(id) ?? []).map((d) => nameKey(d.name)).join(",");
  for (const f of m.flows) {
    if (f.from && !stockIds.has(f.from)) err(f.id, "from", "It starts at a stock that no longer exists.");
    if (f.to && !stockIds.has(f.to)) err(f.id, "to", "It ends at a stock that no longer exists.");
    if (!f.from && !f.to) err(f.id, "from", "Connect it to a stock. A cloud is allowed at one end, not both.");
    if (f.from && f.from === f.to) err(f.id, "to", "It starts and ends at the same stock, so it would change nothing.");
    for (const [end, sid] of [["from", f.from], ["to", f.to]] as const) {
      const st = m.stocks.find((x) => x.id === sid);
      if (!st || dk(st.id) === dk(f.id) || (st.dim && !axes.has(st.id)) || (f.dim && !axes.has(f.id))) continue;
      const sd = dims.get(st.id);
      err(f.id, "dim", `It ${end === "from" ? "drains" : "fills"} ${st.name}, which is ${sd ? `an array over ${sd.name}` : "a single value"}, so the flow must be ${sd ? `over ${sd.name} too` : "a single value too"}.`);
    }
  }
  for (const s of m.stocks) if (!inflows(m, s.id).length && !outflows(m, s.id).length) warn(s.id, "init", "No flow fills or drains it, so it will never change.");

  // units: warnings only
  const unitOf = (id?: string) => m.stocks.find((s) => s.id === id)?.units?.trim();
  for (const f of m.flows) {
    const fu = f.units?.trim();
    if (!fu || !m.timeUnit.trim()) continue;
    for (const [end, sid] of [["from", f.from], ["to", f.to]] as const) {
      const su = unitOf(sid);
      if (su && !unitsMatch(su, fu, m.timeUnit)) {
        const s = m.stocks.find((x) => x.id === sid)!;
        warn(f.id, "units", `Units: it ${end === "from" ? "drains" : "fills"} ${s.name} (${su}), so expect ${su}/${m.timeUnit}, not ${fu}.`);
      }
    }
  }
  return { issues, byKey, code, dims, axes, lists, cells };
}

// The order flows and variables are worked out in, and the circular definitions that make an order impossible.
// Stocks break every feedback loop, so they are not in this graph.
function orderOf(m: BModel, chk: Pick<Checked, "code" | "cells">, byKey: Map<string, Element>) {
  const rates = elements(m).filter((e) => e.kind !== "stock");
  const deps = new Map<string, string[]>();
  for (const e of rates) {
    const refs = refsOf(chk, e.id);
    deps.set(e.id, refs.map((k) => byKey.get(k)).filter((x): x is Element => !!x && x.kind !== "stock").map((x) => x.id));
  }
  // Tarjan's algorithm: components come out dependencies first, which is the evaluation order
  const order: string[] = [], loops: { ids: string[]; self: boolean }[] = [];
  const index = new Map<string, number>(), low = new Map<string, number>(), onStack = new Set<string>(), stack: string[] = [];
  let n = 0;
  const strong = (v: string) => {
    index.set(v, n), low.set(v, n), n++;
    stack.push(v), onStack.add(v);
    for (const w of deps.get(v) ?? []) {
      if (!index.has(w)) (strong(w), low.set(v, Math.min(low.get(v)!, low.get(w)!)));
      else if (onStack.has(w)) low.set(v, Math.min(low.get(v)!, index.get(w)!));
    }
    if (low.get(v) === index.get(v)) {
      const comp: string[] = [];
      let w: string;
      do (w = stack.pop()!), onStack.delete(w), comp.push(w);
      while (w !== v);
      const self = comp.length === 1 && (deps.get(v) ?? []).includes(v);
      if (comp.length > 1 || self) loops.push({ ids: comp.reverse(), self });
      else order.push(v);
    }
  };
  rates.forEach((e) => !index.has(e.id) && strong(e.id));
  return { order, loops };
}

// A function with memory as plain stock-and-flow structure, the way Vensim and PySD define it, so the simulation, the
// Python export and PySD all integrate it with the same Euler steps:
//   DELAYN(input, D, n, init): n stocks in a row, each draining into the next at stock / (D / n); the input fills the
//     first and the output is the last outflow. Each starts holding init * D / n (init defaults to the input).
//     DELAY1 and DELAY3 are orders 1 and 3.
//   SMOOTHN(input, T, n, init): n stocks, each closing its gap to the one before (the first to the input) at
//     gap / (T / n); the output is the last. Each starts at init (default: the input). SMOOTH and SMOOTH3: orders 1, 3.
//   TREND(input, A, g0): an average, a SMOOTH of the input over A starting at input / (1 + g0 * A);
//     the output is ZIDZ(input - average, A * ABS(average)), so the trend starts at g0.
//   FORECAST(input, A, H): input * (1 + TREND(input, A, 0) * H).
//   INITIAL(x): a stock that starts at x and never moves.
//   DELAY_FIXED(input, D, init): a pipeline of round(D / dt) stocks (at least 1), each taking the one before's value
//     every step, so the output is exactly the input D ago; init before that.
//   SAMPLE_IF_TRUE(c, input, init): a stock holding the last sample (starting at init) and the output IF(c, input,
//     held); each step the stock moves to the output, as PySD's SampleIfTrue does.
// ELMCOUNT(Dim) becomes its number. A per-element equation that needs hidden elements is first made explicit (fixAt),
// so they are single values.
// A random function without a seed gets one fixed for its place in the model. keep: calls to leave in place (an
// export that writes them as its own builtins).
export function lower(m: BModel, keep: (n: Extract<Node, { k: "call" }>) => boolean = () => false): BModel {
  const taken = new Set(elements(m).map((e) => nameKey(e.name)));
  const fresh = (base: string) => {
    let n = base, k = 2;
    while (taken.has(nameKey(n))) n = `${base} ${k++}`;
    taken.add(nameKey(n));
    return n;
  };
  const out: BModel = { ...m, stocks: [], flows: [], vars: [] };
  let changed = false;
  for (const e of elements(m)) {
    const src = sourceOf(e), r = !(e.kind === "var" && e.data) && !parseList(src) ? tryCompile(src) : undefined;
    let calls = 0, hid = 0, memo = 0, touched = false, where = "";
    const ref = (name: string): Node => ({ k: "name", key: nameKey(name), raw: refName(name), p: 0 });
    const num = (v: number): Node => ({ k: "num", v });
    const bin = (op: string, a: Node, b: Node): Node => ({ k: "bin", op, a, b });
    const call = (f: string, ...args: Node[]): Node => ({ k: "call", f, args });
    const add = <T extends Kind>(kind: T, x: Record<string, unknown>) => {
      const el = { id: `${e.id}~${++hid}`, x: e.x, y: e.y, ...(e.dim && !where ? { dim: e.dim } : {}), ...x };
      if (kind === "stock") out.stocks.push(el as BStock);
      else if (kind === "flow") out.flows.push({ eq: "", ...el } as BFlow);
      else out.vars.push(el as BVar);
      return el.id;
    };
    const lowerCall = (n: Extract<Node, { k: "call" }>): Node => {
      const F = n.f, a = n.args, k = ++memo;
      const order = F === "DELAY1" || F === "SMOOTH" ? 1 : F === "DELAY3" || F === "SMOOTH3" ? 3 : F === "DELAYN" || F === "SMOOTHN" ? constNum(m, a[2]) : 1;
      const fixed = F === "DELAY_FIXED" ? constNum(m, a[1]) : 0;
      if (order === undefined || !Number.isInteger(order) || order < 1 || fixed === undefined || fixed < 0) return n; // validate has said why
      const base = `${e.name}${where} ${F.toLowerCase().replace(/_/g, " ")}${k > 1 ? ` ${k}` : ""}`;
      const note = (part: string) => `Part of ${F}(${a.map(unparse).join(", ")}) in ${e.name}: ${part}.`;
      let inp = a[0];
      // an input that is a formula gets its own auxiliary, so it is worked out once per step
      if (F !== "INITIAL" && F !== "SAMPLE_IF_TRUE" && inp.k !== "name" && inp.k !== "num") {
        const v = fresh(`${base} input`);
        add("var", { name: v, eq: unparse(inp), note: note("its input") });
        inp = ref(v);
      }
      const names = (what: string, n: number) => Array.from({ length: n }, (_, i) => fresh(n > 1 ? `${base} ${what} ${i + 1}` : `${base} ${what}`));
      switch (F) {
        case "DELAY1": case "DELAY3": case "DELAYN": {
          const init = (F === "DELAYN" ? a[3] : a[2]) ?? inp, each = order === 1 ? a[1] : bin("/", a[1], num(order));
          const st = names("stage", order), ids = st.map((s, i) => add("stock", { name: s, init: unparse(bin("*", init, each)), note: note(`stage ${i + 1} of ${order}, holding what is in transit`) }));
          add("flow", { name: fresh(`${base} in`), to: ids[0], eq: unparse(inp), note: note("the input entering the delay") });
          const outs = st.map((s, i) => fresh(`${base} out${order > 1 ? ` ${i + 1}` : ""}`));
          outs.forEach((o, i) => add("flow", { name: o, from: ids[i], to: ids[i + 1], eq: unparse(bin("/", ref(st[i]), each)), note: note(i === order - 1 ? "the output: what leaves the last stage" : `from stage ${i + 1} to stage ${i + 2}`) }));
          return ref(outs[order - 1]);
        }
        case "SMOOTH": case "SMOOTH3": case "SMOOTHN": {
          const init = (F === "SMOOTHN" ? a[3] : a[2]) ?? inp, each = order === 1 ? a[1] : bin("/", a[1], num(order));
          const st = names("stage", order), ids = st.map((s, i) => add("stock", { name: s, init: unparse(init), note: note(order > 1 ? `stage ${i + 1} of ${order}` : "the smoothed value") }));
          st.forEach((s, i) => add("flow", { name: fresh(`${base} change${order > 1 ? ` ${i + 1}` : ""}`), to: ids[i], eq: unparse(bin("/", bin("-", i ? ref(st[i - 1]) : inp, ref(s)), each)), note: note("closing part of the gap each time unit") }));
          return ref(st[order - 1]);
        }
        case "TREND": case "FORECAST": {
          const A = a[1], avg = fresh(`${base} average`);
          const id = add("stock", { name: avg, init: unparse(F === "TREND" ? bin("/", inp, bin("+", num(1), bin("*", a[2], A))) : inp), note: note("the input smoothed over the averaging time") });
          add("flow", { name: fresh(`${base} change`), to: id, eq: unparse(bin("/", bin("-", inp, ref(avg)), A)), note: note("the average closing its gap to the input") });
          const trend = call("ZIDZ", bin("-", inp, ref(avg)), bin("*", A, call("ABS", ref(avg))));
          return F === "TREND" ? trend : bin("*", inp, bin("+", num(1), bin("*", trend, a[2])));
        }
        case "INITIAL": {
          const v = fresh(`${base}`);
          add("stock", { name: v, init: unparse(a[0]), note: note("the value at the start, held") });
          return ref(v);
        }
        case "DELAY_FIXED": {
          // ponytail: one stock per time step of the delay, so a long delay at a small dt makes a long model
          const n = Math.round(Math.max(fixed / m.dt, 1) + 1e-6), st = names("slot", n);
          const ids = st.map((s, i) => add("stock", { name: s, init: unparse(a[2]), note: note(`slot ${i + 1} of ${n} in the pipeline`) }));
          st.forEach((s, i) => add("flow", { name: fresh(`${base} shift${n > 1 ? ` ${i + 1}` : ""}`), to: ids[i], eq: unparse(bin("/", bin("-", i ? ref(st[i - 1]) : inp, ref(s)), { k: "dt" })), note: note("moving the pipeline on one step") }));
          return ref(st[n - 1]);
        }
        case "SAMPLE_IF_TRUE": {
          const held = fresh(`${base} held`), v = fresh(`${base} value`);
          const id = add("stock", { name: held, init: unparse(a[2]), note: note("the value last sampled") });
          add("var", { name: v, eq: unparse(call("IF", a[0], a[1], ref(held))), note: note("the input while the condition holds, otherwise the value held") });
          add("flow", { name: fresh(`${base} sample`), to: id, eq: unparse(bin("/", bin("-", ref(v), ref(held)), { k: "dt" })), note: note("moving the held value on to this step's value") });
          return ref(v);
        }
      }
      return n;
    };
    const rw = (n: Node): Node => {
      if (n.k === "neg") return { k: "neg", a: rw(n.a) };
      if (n.k === "bin") return { ...n, a: rw(n.a), b: rw(n.b) };
      if (n.k !== "call") return n;
      if (n.f === "ELMCOUNT") {
        const d = n.args[0].k === "name" ? findDim(m, n.args[0].raw) : undefined;
        return d ? ((touched = true), num(d.elements.length)) : n;
      }
      const c = ++calls, args = n.args.map(rw);
      if (n.f in SEED_ARG && args.length === SEED_ARG[n.f]) (args.push(num(seedFor(e.id, c))), (touched = true));
      const x = { ...n, args };
      if (!STATEFUL.has(n.f) || keep(x)) return x;
      touched = true;
      return lowerCall(x);
    };
    const ast = r?.ok ? rw(r.c.ast) : undefined;
    const text = ast && touched ? unparse(ast) : undefined;
    changed ||= !!text;
    // per-element equations, each lowered on its own into single-valued hidden elements
    const mine = axesOf(m, e);
    const eqs = e.eqs && mine
      ? Object.fromEntries(Object.entries(e.eqs).map(([k, s]) => {
          const rr = tryCompile(s), at = k.split(",").map((x) => x.trim());
          if (!rr.ok || at.length !== mine.length) return [k, s];
          (touched = false), (where = ` ${at.join(" ")}`);
          const a = rw(fixAt(m, rr.c.ast, mine, at));
          where = "";
          return [k, touched ? ((changed = true), unparse(a)) : s];
        }))
      : undefined;
    const own = eqs ? { eqs } : {};
    if (e.kind === "stock") out.stocks.push({ ...m.stocks.find((x) => x.id === e.id)!, ...(text ? { init: text } : {}), ...own });
    else if (e.kind === "flow") out.flows.push({ ...m.flows.find((x) => x.id === e.id)!, ...(text ? { eq: text } : {}), ...own });
    else out.vars.push({ ...m.vars.find((x) => x.id === e.id)!, ...(text ? { eq: text } : {}), ...own });
  }
  return changed ? out : m;
}
// a seed for a random call without one, fixed by where it sits: its element's id and its place in the equation
const seedFor = (id: string, c: number) => {
  let h = 7;
  for (const ch of `${id}:${c}`) h = (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0;
  return h % 100000;
};

// Check the whole model. Errors stop a run; warnings do not. The checks read the model as written; the order of
// evaluation (and so circular definitions) comes from the model as it runs, where a DELAY or SMOOTH is a stock and so
// breaks a loop as any stock does.
export function validate(m: BModel): Checked {
  const base = check(m);
  const low = lower(m);
  const run = low === m ? base : check(low);
  const { order, loops } = orderOf(low, run, run.byKey);
  const sim: Checked = { ...run, order, model: low } as Checked;
  sim.sim = sim;
  const told = new Set<string>();
  for (const { ids, self } of loops) {
    const owners = [...new Set(ids.map(ownerOf))], names = owners.map((id) => findElement(m, id)!.name);
    const loop = [...names, names[0]].map(refName).join(" → ");
    for (const id of owners) {
      if (told.has(id)) continue;
      told.add(id);
      const e = findElement(m, id)!;
      base.issues.push({ id, field: e.kind === "stock" ? "init" : "eq", level: "error", msg: self || owners.length === 1 ? "Its equation refers to itself. Only a stock can feed back on itself." : `Circular definition: ${loop}. Every feedback loop needs a stock in it.` });
    }
  }
  return { ...base, order: order.filter((id) => !isHidden(id)), model: m, sim };
}

// values: keyed by element id for single values, and by `${id}[${element}]` for each element of an arrayed one
// (`${id}[North,Young]` over two dimensions). Hidden elements are not in it.
export type RunResult = { ok: boolean; times: number[]; values: Record<string, number[]>; issues: Issue[] };

// Euler integration: rates from the current stocks, then stock(t + dt) = stock(t) + dt * (inflows - outflows).
// Arrays are flattened into slots, one per element, each a plain scalar equation (see expand), so the loop below
// never needs to know about them. A row is kept every saveEvery (and at the stop time).
export function simulate(m: BModel, maxPoints = 1000): RunResult {
  const top = validate(m);
  const errors = top.issues.filter((i) => i.level === "error");
  const values: Record<string, number[]> = {};
  const times: number[] = [];
  if (errors.length) return { ok: false, times, values, issues: errors };
  const chk = top.sim, low = chk.model, els = elements(low);
  const start = m.start ?? 0, steps = Math.round((m.T - start) / m.dt), save = Math.max(1, Math.round((m.saveEvery ?? m.dt) / m.dt));
  const stride = save * Math.max(1, Math.ceil(steps / save / maxPoints));
  const s: Scope = { TIME: start, DT: m.dt };
  const axesBy = (key: string) => chk.axes.get(chk.byKey.get(key)?.id ?? "");
  const scalarAt = (n: { key: string; sub?: string[] }) => resolve(low, undefined, undefined, axesBy(n.key), n.sub);
  const all = (key: string) => chk.dims.get(chk.byKey.get(key)?.id ?? "")?.elements;
  // slots: [values key, scope key, compiled rule] for each value an element holds
  type Slot = { vk: string; sk: string; at?: string; f: (s: Scope) => number };
  const slots = new Map<string, Slot[]>();
  for (const e of els) {
    const key = nameKey(e.name), ax = chk.axes.get(e.id), d = chk.dims.get(e.id), list = chk.lists.get(e.id), c = chk.code.get(e.id)!, cells = chk.cells.get(e.id);
    slots.set(
      e.id,
      ax && d
        ? d.elements.map((x, j) => {
            const at = x.split(",");
            const pickAt = (n: { key: string; sub?: string[] }) => resolve(low, ax, at, axesBy(n.key), n.sub);
            const own = cells?.get(x);
            return { vk: `${e.id}[${x}]`, sk: slotKey(key, x), at: x, f: own ? evaluator(expand(own.ast, pickAt, all), j) : list ? () => list[j] : evaluator(expand(c.ast, pickAt, all), j) };
          })
        : [{ vk: e.id, sk: key, f: evaluator(chk.dims.size ? expand(c.ast, scalarAt, all) : c.ast) }],
    );
  }
  slots.forEach((ss, id) => !isHidden(id) && ss.forEach((sl) => (values[sl.vk] = [])));
  const owner = (e: Element): Element => (isHidden(e.id) ? findElement(m, ownerOf(e.id))! : e);
  const bad = (el: Element, sl: Slot, v: number, t: number): RunResult => {
    const e = owner(el), hid = el !== e;
    const what = e.kind === "stock" ? (t === start && !hid ? "Its initial value" : "It") : "Its equation";
    return {
      ok: false,
      times,
      values,
      issues: [{ id: e.id, field: e.kind === "stock" ? "init" : "eq", level: "error", msg: `${what} gave ${v} at time ${+t.toFixed(6)}${sl.at ? ` for ${sl.at}` : ""}${hid ? ` (inside ${el.name})` : ""}. Look for a division by zero, a root or log of a negative number, or explosive growth.` }],
    };
  };

  // initial values: work through whatever each one needs, so a stock may start at desired_inventory
  const busy = new Set<string>(), done = new Set<string>();
  const initOf = (e: Element): string | null => {
    if (done.has(e.id)) return null;
    if (busy.has(e.id)) return owner(e).name;
    busy.add(e.id);
    for (const r of refsOf(chk, e.id)) {
      const d = chk.byKey.get(r)!;
      const loop = initOf(d);
      if (loop) return loop;
    }
    for (const sl of slots.get(e.id)!) s[sl.sk] = sl.f(s);
    busy.delete(e.id), done.add(e.id);
    return null;
  };
  for (const e of els) {
    const loop = initOf(e);
    if (loop) {
      const o = owner(e);
      return { ok: false, times, values, issues: [{ id: o.id, field: o.kind === "stock" ? "init" : "eq", level: "error", msg: `Its initial value depends on itself through ${loop}. Give a stock a number to start from.` }] };
    }
  }
  for (const st of low.stocks) for (const sl of slots.get(st.id)!) if (!Number.isFinite(s[sl.sk])) return bad({ ...st, kind: "stock" }, sl, s[sl.sk], start);

  const rates = chk.order.flatMap((id) => {
    const e = els.find((x) => x.id === id)!;
    return slots.get(id)!.map((sl) => ({ e, sl }));
  });
  // a flow has its stocks' dimensions, so slot j of a stock is filled by slot j of each of its flows
  const stocks = low.stocks.flatMap((st) =>
    slots.get(st.id)!.map((sl, j) => ({ st, sl, key: sl.sk, ins: inflows(low, st.id).map((f) => slots.get(f.id)![j].sk), outs: outflows(low, st.id).map((f) => slots.get(f.id)![j].sk) })),
  );
  const shown = [...slots].filter(([id]) => !isHidden(id)).flatMap(([, ss]) => ss);
  for (let i = 0; i <= steps; i++) {
    const t = start + i * m.dt;
    s.TIME = t;
    for (const r of rates) {
      const v = r.sl.f(s);
      if (!Number.isFinite(v)) return bad(r.e, r.sl, v, t);
      s[r.sl.sk] = v;
    }
    if (i % stride === 0 || i === steps) {
      times.push(+t.toFixed(10));
      for (const sl of shown) values[sl.vk].push(s[sl.sk]);
    }
    if (i === steps) break;
    const next = stocks.map(({ key, ins, outs }) => s[key] + m.dt * (ins.reduce((a, k) => a + s[k], 0) - outs.reduce((a, k) => a + s[k], 0)));
    for (let j = 0; j < stocks.length; j++) {
      if (!Number.isFinite(next[j])) return bad({ ...stocks[j].st, kind: "stock" }, stocks[j].sl, next[j], t + m.dt);
      s[stocks[j].key] = stocks[j].st.nonNegative ? Math.max(0, next[j]) : next[j];
    }
  }
  return { ok: true, times, values, issues: [] };
}

// ---------------------------------------------------------------------------------------------------
// a data series in words: "data, 4 points from time 2020 to 2030, straight lines between them"
export const dataText = (v: BVar) => {
  const d = v.data ?? [];
  return `data, ${d.length} point${d.length === 1 ? "" : "s"}${d.length ? ` from time ${d[0][0]} to ${d[d.length - 1][0]}` : ""}, straight lines between them, ${v.extrapolate ? "continued along the end slopes" : "held flat"} beyond`;
};
// equations as text, stocks in INTEG form
export function equationGroups(m: BModel) {
  const u = (x?: string) => (x?.trim() ? `  [${x.trim()}]` : "");
  const name = (id: string) => refName(m.flows.find((f) => f.id === id)!.name);
  const lhs = (e: { name: string; dim?: string }) => refName(e.name) + (e.dim ? `[${e.dim}]` : "");
  // per-element equations follow the general one, which then holds for the other elements
  const own = (e: { name: string; eqs?: Record<string, string> }, line: (eq: string) => string) => Object.entries(e.eqs ?? {}).map(([k, v]) => `${refName(e.name)}[${k}] = ${line(v.trim() || "?")}`);
  return [
    {
      title: "Stocks",
      lines: m.stocks.flatMap((s) => {
        const net = [...inflows(m, s.id).map((f) => name(f.id)), ...outflows(m, s.id).map((f) => "- " + name(f.id))].join(" + ").replace(/\+ - /g, "- ").replace(/^- /, "-");
        return [`${lhs(s)} = INTEG(${net || "0"}, ${s.init.trim() || "?"})${u(s.units)}`, ...own(s, (v) => `INTEG(${net || "0"}, ${v})`)];
      }),
    },
    { title: "Flows", lines: m.flows.flatMap((f) => [`${lhs(f)} = ${f.eq.trim() || "?"}${u(f.units)}`, ...own(f, (v) => v)]) },
    { title: "Auxiliaries and constants", lines: m.vars.flatMap((v) => [`${lhs(v)} = ${v.data ? dataText(v) : v.eq.trim() || "?"}${u(v.units)}`, ...own(v, (x) => x)]) },
    { title: "Dimensions", lines: (m.dims ?? []).map((d) => `${d.name}: ${d.elements.join(", ")}${d.of ? ` (a subrange of ${d.of})` : ""}`) },
    { title: "Settings", lines: [`Time unit: ${m.timeUnit || "?"}`, `Start time: ${m.start ?? 0}`, `Stop time: ${m.T}`, `Time step (dt): ${m.dt}`, `Save every: ${m.saveEvery ?? m.dt}`, "Integration: Euler"] },
  ].filter((g) => g.lines.length);
}
export const equationsText = (m: BModel) => [m.name, "", ...equationGroups(m).flatMap((g) => [`${g.title}:`, ...g.lines.map((l) => "  " + l), ""])].join("\n").trim() + "\n";

// ---------------------------------------------------------------------------------------------------
// JSON and storage
export const toJSON = (m: BModel) => JSON.stringify({ format: "loopbricks-builder", version: 1, model: m }, null, 2);

export function fromJSON(text: string): BModel {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("That file is not valid JSON.");
  }
  const o = raw as Record<string, unknown>;
  const m = (o && typeof o === "object" && "model" in o ? o.model : o) as Record<string, unknown>;
  if (!m || typeof m !== "object" || !Array.isArray(m.stocks) || !Array.isArray(m.flows) || !Array.isArray(m.vars)) throw new Error("That file is not a LoopBricks model: it needs stocks, flows and vars lists.");
  const str = (v: unknown, d = "") => (typeof v === "string" ? v : typeof v === "number" ? String(v) : d);
  const num = (v: unknown, d: number) => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() && Number.isFinite(+v) ? +v : d);
  const seen = new Set<string>();
  const id = (v: unknown, what: string) => {
    const s = str(v);
    if (!s) throw new Error(`A ${what} has no id.`);
    if (seen.has(s)) throw new Error(`Two elements share the id "${s}".`);
    seen.add(s);
    return s;
  };
  const opt = (v: unknown) => (typeof v === "string" && v ? v : undefined);
  const rec = (x: unknown) => (x && typeof x === "object" ? (x as Record<string, unknown>) : {});
  const eqs = (o: Record<string, unknown>) => {
    const e = Object.entries(rec(o.eqs)).filter(([, v]) => typeof v === "string" || typeof v === "number");
    return e.length ? { eqs: Object.fromEntries(e.map(([k, v]) => [k, str(v)])) } : {};
  };
  const extra = (o: Record<string, unknown>) => ({ ...(opt(o.dim) ? { dim: opt(o.dim) } : {}), ...(opt(o.note) ? { note: opt(o.note) } : {}), ...eqs(o) });
  const dims = Array.isArray(m.dims) ? m.dims.map(rec).map((d) => ({ name: str(d.name), elements: Array.isArray(d.elements) ? d.elements.map((x) => str(x)) : [], ...(opt(d.of) ? { of: opt(d.of) } : {}) })) : undefined;
  const data = (v: Record<string, unknown>) => ({
    ...(Array.isArray(v.data) ? { data: v.data.map((p) => (Array.isArray(p) ? [num(p[0], NaN), num(p[1], NaN)] : [NaN, NaN]) as [number, number]) } : {}),
    ...(v.extrapolate === true ? { extrapolate: true } : {}),
  });
  const optNum = (k: "start" | "saveEvery") => (m[k] !== undefined && m[k] !== null && Number.isFinite(num(m[k], NaN)) ? { [k]: num(m[k], 0) } : {});
  const links = Array.isArray(m.links) ? m.links.map(rec).map((l) => ({ from: str(l.from), to: str(l.to) })).filter((l) => l.from && l.to) : undefined;
  return {
    name: str(m.name, "Imported model"),
    timeUnit: str(m.timeUnit, "time"),
    T: num(m.T, 50),
    dt: num(m.dt, 0.25),
    ...optNum("start"),
    ...optNum("saveEvery"),
    stocks: (m.stocks as unknown[]).map(rec).map((s) => ({ id: id(s.id, "stock"), name: str(s.name), init: str(s.init, "0"), x: num(s.x, 200), y: num(s.y, 200), units: opt(s.units), nonNegative: s.nonNegative === true || undefined, ...extra(s) })),
    flows: (m.flows as unknown[]).map(rec).map((f) => ({ id: id(f.id, "flow"), name: str(f.name), from: opt(f.from), to: opt(f.to), eq: str(f.eq), x: num(f.x, 300), y: num(f.y, 200), units: opt(f.units), ...extra(f) })),
    vars: (m.vars as unknown[]).map(rec).map((v) => ({ id: id(v.id, "variable"), name: str(v.name), eq: str(v.eq), x: num(v.x, 300), y: num(v.y, 320), units: opt(v.units), ...extra(v), ...data(v) })),
    ...(dims ? { dims } : {}),
    ...(links ? { links } : {}),
    ...(Array.isArray(m.plot) ? { plot: m.plot.filter((x): x is string => typeof x === "string") } : {}),
  };
}

export function saveModel(m: BModel) {
  try {
    localStorage.setItem(STORAGE_KEY, toJSON(m));
    return true;
  } catch {
    return false;
  }
}
export function loadModel(): BModel | null {
  try {
    const t = localStorage.getItem(STORAGE_KEY);
    return t ? fromJSON(t) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------------------------------
// templates to start from
export type Template = { id: string; label: string; blurb: string; model: BModel };
export const TEMPLATES: Template[] = [
  {
    id: "bathtub",
    label: "Bathtub",
    blurb: "One stock with an inflow and an outflow. The drain empties faster as the water rises, so the level settles where outflow equals inflow.",
    model: {
      name: "Bathtub",
      timeUnit: "minute",
      T: 40,
      dt: 0.25,
      stocks: [{ id: "s1", name: "Water", init: "0", x: 470, y: 200, units: "litres" }],
      flows: [
        { id: "f1", name: "Faucet", to: "s1", eq: "10", x: 260, y: 200, units: "litres/minute" },
        { id: "f2", name: "Drain", from: "s1", eq: "Water / Drain_time", x: 680, y: 200, units: "litres/minute" },
      ],
      vars: [{ id: "v1", name: "Drain time", eq: "5", x: 740, y: 320, units: "minutes" }],
    },
  },
  {
    id: "population",
    label: "Population",
    blurb: "Births and deaths as fractions of the population. Births dominate, so the reinforcing loop drives exponential growth.",
    model: {
      name: "Population",
      timeUnit: "year",
      T: 100,
      dt: 0.25,
      stocks: [{ id: "s1", name: "Population", init: "1000", x: 470, y: 200, units: "people" }],
      flows: [
        { id: "f1", name: "Births", to: "s1", eq: "Population * Birth_fraction", x: 260, y: 200, units: "people/year" },
        { id: "f2", name: "Deaths", from: "s1", eq: "Population * Death_fraction", x: 680, y: 200, units: "people/year" },
      ],
      vars: [
        { id: "v1", name: "Birth fraction", eq: "0.03", x: 200, y: 320, units: "1/year" },
        { id: "v2", name: "Death fraction", eq: "0.01", x: 740, y: 320, units: "1/year" },
      ],
    },
  },
  {
    id: "stock-management",
    label: "Stock management",
    blurb: "A supply line and an inventory with the ordering rule: replace expected losses and close part of each gap. Demand steps up in week 10.",
    model: {
      name: "Stock management",
      timeUnit: "week",
      T: 80,
      dt: 0.25,
      stocks: [
        { id: "s1", name: "Supply line", init: "Desired_supply_line", x: 360, y: 240, units: "units" },
        { id: "s2", name: "Inventory", init: "Desired_inventory", x: 680, y: 240, units: "units" },
      ],
      flows: [
        {
          id: "f1",
          name: "Orders",
          to: "s1",
          eq: "MAX(0, Demand + (Desired_inventory - Inventory) / Inventory_adjustment_time + (Desired_supply_line - Supply_line) / Supply_line_adjustment_time)",
          x: 170,
          y: 240,
          units: "units/week",
        },
        { id: "f2", name: "Acquisition", from: "s1", to: "s2", eq: "Supply_line / Acquisition_delay", x: 520, y: 240, units: "units/week" },
        { id: "f3", name: "Shipments", from: "s2", eq: "Demand", x: 860, y: 240, units: "units/week" },
      ],
      vars: [
        { id: "v1", name: "Demand", eq: "10 + STEP(5, 10)", x: 860, y: 400, units: "units/week" },
        { id: "v2", name: "Desired inventory", eq: "100", x: 560, y: 80, units: "units" },
        { id: "v3", name: "Inventory adjustment time", eq: "4", x: 300, y: 80, units: "weeks" },
        { id: "v4", name: "Acquisition delay", eq: "6", x: 470, y: 350, units: "weeks" },
        { id: "v5", name: "Desired supply line", eq: "Demand * Acquisition_delay", x: 270, y: 410, units: "units" },
        { id: "v6", name: "Supply line adjustment time", eq: "8", x: 110, y: 380, units: "weeks" },
      ],
    },
  },
  {
    id: "regions",
    label: "Regional population (arrays)",
    blurb: "One population per region, held as an array: each region grows at its own birth fraction, and SUM adds the regions up into a single total.",
    model: {
      name: "Regional population",
      timeUnit: "year",
      T: 50,
      dt: 0.25,
      dims: [{ name: "Region", elements: ["North", "South", "East"] }],
      stocks: [{ id: "s1", name: "Population", init: "1000, 600, 300", x: 470, y: 200, units: "people", dim: "Region", note: "One stock per region: a list gives each region its own starting value." }],
      flows: [
        { id: "f1", name: "Births", to: "s1", eq: "Population * Birth_fraction", x: 260, y: 200, units: "people/year", dim: "Region", note: "Element by element: births in the North use the North's population and birth fraction." },
        { id: "f2", name: "Deaths", from: "s1", eq: "Population * Death_fraction", x: 680, y: 200, units: "people/year", dim: "Region" },
      ],
      vars: [
        { id: "v1", name: "Birth fraction", eq: "0.04, 0.03, 0.02", x: 200, y: 320, units: "1/year", dim: "Region" },
        { id: "v2", name: "Death fraction", eq: "0.015", x: 740, y: 320, units: "1/year", note: "A single value: every region uses it." },
        { id: "v3", name: "Total population", eq: "SUM(Population)", x: 470, y: 380, units: "people", note: "SUM turns the array into one number." },
      ],
      links: [{ from: "s1", to: "v3" }],
    },
  },
  {
    id: "delays",
    label: "Delays and smoothing",
    blurb: "Orders step up in week 5. A material delay (DELAY3) delivers them bunched about the delay time later; a first-order delay (DELAY1) starts at once and creeps; smoothing (SMOOTH) is how slowly people believe the new level.",
    model: {
      name: "Delays and smoothing",
      timeUnit: "week",
      T: 30,
      dt: 0.125,
      stocks: [{ id: "s1", name: "Delivered", init: "0", x: 700, y: 200, units: "units", note: "Everything received so far." }],
      flows: [
        { id: "f1", name: "Deliveries", to: "s1", eq: "DELAY3(Orders, Delay_time)", x: 490, y: 200, units: "units/week", note: "Three stocks in a row, each holding a third of the delay: what was ordered arrives bunched around the delay time later." },
      ],
      vars: [
        { id: "v1", name: "Orders", eq: "10 + STEP(10, 5)", x: 260, y: 200, units: "units/week" },
        { id: "v2", name: "Delay time", eq: "4", x: 490, y: 340, units: "weeks" },
        { id: "v3", name: "Deliveries first order", eq: "DELAY1(Orders, Delay_time)", x: 260, y: 340, units: "units/week", note: "The same delay with one stock: deliveries start rising at once and creep up. Compare it with Deliveries. Its curve is the same as Perceived orders: a first-order material delay and first-order smoothing follow the same path; the delay conserves what is in transit, the smooth is only a belief." },
        { id: "v4", name: "Perceived orders", eq: "SMOOTH(Orders, Delay_time)", x: 260, y: 80, units: "units/week", note: "An information delay: the belief closes part of its gap to the real orders each week." },
        { id: "v5", name: "Order trend", eq: "TREND(Orders, Delay_time, 0)", x: 490, y: 80, units: "1/week", note: "How fast orders are growing, as a fraction per week, against their smoothed level." },
      ],
      plot: ["v1", "f1", "v3", "v4"],
    },
  },
  {
    id: "data-noise",
    label: "Data and noise",
    blurb: "Rainfall comes from a data series, read off by straight lines between the points, with random noise on top. The run starts in 2020 and keeps one row a year.",
    model: {
      name: "Data and noise",
      timeUnit: "year",
      start: 2020,
      T: 2030,
      dt: 0.25,
      saveEvery: 1,
      stocks: [{ id: "s1", name: "Reservoir", init: "300", x: 520, y: 200, units: "megalitres" }],
      flows: [
        { id: "f1", name: "Inflow", to: "s1", eq: "Rainfall * Catchment * (1 + Noise)", x: 300, y: 200, units: "megalitres/year" },
        { id: "f2", name: "Release", from: "s1", eq: "Reservoir / Residence_time", x: 740, y: 200, units: "megalitres/year" },
      ],
      vars: [
        { id: "v1", name: "Rainfall", eq: "", data: [[2020, 600], [2022, 750], [2025, 520], [2028, 680], [2030, 640]], x: 200, y: 330, units: "mm/year", note: "A data series: measured values at a few times, with straight lines between them." },
        { id: "v2", name: "Catchment", eq: "0.2", x: 330, y: 80, units: "megalitres/mm" },
        { id: "v3", name: "Noise", eq: "RANDOM_NORMAL(-0.3, 0.3, 0, 0.1)", x: 420, y: 330, note: "A new draw every time step: weather the data does not show. The same seed gives the same run every time." },
        { id: "v4", name: "Residence time", eq: "2", x: 800, y: 330, units: "years" },
      ],
    },
  },
  {
    id: "blank",
    label: "Blank",
    blurb: "An empty canvas. Start with the stock: what accumulates?",
    model: { name: "My model", timeUnit: "week", T: 50, dt: 0.25, stocks: [], flows: [], vars: [] },
  },
];
export const template = (id: string): BModel => JSON.parse(JSON.stringify(TEMPLATES.find((t) => t.id === id)!.model));
