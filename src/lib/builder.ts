// The learner's own stock-and-flow model: its shape, checks, Euler simulation, templates and storage.
import { NAME_RE, RESERVED, nameKey, refName, renameRefs, tryCompile, type Compiled, type Scope } from "@/lib/expr";

export type BStock = { id: string; name: string; init: string; x: number; y: number; units?: string; nonNegative?: boolean }; // nonNegative: a physical stock floored at zero, as in the app's molecules
export type BFlow = { id: string; name: string; from?: string; to?: string; eq: string; x: number; y: number; units?: string };
export type BVar = { id: string; name: string; eq: string; x: number; y: number; units?: string }; // an auxiliary, or a constant when eq is a number
export type BModel = { name: string; timeUnit: string; T: number; dt: number; stocks: BStock[]; flows: BFlow[]; vars: BVar[] };
export type Kind = "stock" | "flow" | "var";
export type Element = (BStock & { kind: "stock" }) | (BFlow & { kind: "flow" }) | (BVar & { kind: "var" });
export type Field = "name" | "eq" | "init" | "from" | "to" | "units" | "settings";
export type Issue = { id?: string; field: Field; level: "error" | "warn"; msg: string };

export const STORAGE_KEY = "loopbricks-builder";
export const MAX_STEPS = 100_000;

export const elements = (m: BModel): Element[] => [
  ...m.stocks.map((s) => ({ ...s, kind: "stock" as const })),
  ...m.flows.map((f) => ({ ...f, kind: "flow" as const })),
  ...m.vars.map((v) => ({ ...v, kind: "var" as const })),
];
export const findElement = (m: BModel, id: string | null | undefined): Element | undefined => (id ? elements(m).find((e) => e.id === id) : undefined);
export const isConstant = (v: { eq: string }) => /^\s*[-−]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?\s*$/.test(v.eq);
export const inflows = (m: BModel, id: string) => m.flows.filter((f) => f.to === id);
export const outflows = (m: BModel, id: string) => m.flows.filter((f) => f.from === id);

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
  return {
    ...m,
    stocks: m.stocks.map((s) => ({ ...s, name: s.id === id ? name : s.name, init: fix(s.init) })),
    flows: m.flows.map((f) => ({ ...f, name: f.id === id ? name : f.name, eq: fix(f.eq) })),
    vars: m.vars.map((v) => ({ ...v, name: v.id === id ? name : v.name, eq: fix(v.eq) })),
  };
}

// remove an element; flows that touched a removed stock open onto a cloud at that end
export function removeElement(m: BModel, id: string): BModel {
  return {
    ...m,
    stocks: m.stocks.filter((s) => s.id !== id),
    flows: m.flows.filter((f) => f.id !== id).map((f) => ({ ...f, from: f.from === id ? undefined : f.from, to: f.to === id ? undefined : f.to })),
    vars: m.vars.filter((v) => v.id !== id),
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
};

// Check the whole model. Errors stop a run; warnings do not.
export function validate(m: BModel): Checked {
  const issues: Issue[] = [];
  const els = elements(m);
  const err = (id: string | undefined, field: Field, msg: string) => issues.push({ id, field, level: "error", msg });
  const warn = (id: string | undefined, field: Field, msg: string) => issues.push({ id, field, level: "warn", msg });

  // settings
  if (!(m.T > 0) || !Number.isFinite(m.T)) err(undefined, "settings", "Stop time must be a number above 0.");
  if (!(m.dt > 0) || !Number.isFinite(m.dt)) err(undefined, "settings", "The time step (dt) must be a number above 0.");
  else if (m.dt > m.T) err(undefined, "settings", "The time step (dt) is longer than the whole run.");
  else if (m.T / m.dt > MAX_STEPS) err(undefined, "settings", `That is ${Math.round(m.T / m.dt).toLocaleString()} steps; use a larger dt (at most ${MAX_STEPS.toLocaleString()} steps).`);
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

  // equations
  const code = new Map<string, Compiled>();
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
    const src = e.kind === "stock" ? e.init : e.eq;
    const what = e.kind === "stock" ? "Initial value" : "Equation";
    if (!src.trim()) {
      err(e.id, field, e.kind === "stock" ? "Give it an initial value." : e.kind === "flow" ? "Write an equation for this flow (a rate)." : "Write an equation, or a number for a constant.");
      continue;
    }
    const r = tryCompile(src);
    if (!r.ok) {
      err(e.id, field, `${what}: ${r.error.message}`);
      continue;
    }
    code.set(e.id, r.c);
    for (const ref of r.c.refs) {
      if (!byKey.has(ref)) err(e.id, field, `${what} uses "${ref}", which is not in the model.${suggest(ref)}`);
      else if (byKey.get(ref)!.id === e.id && e.kind === "stock") err(e.id, field, "A stock's initial value can't refer to the stock itself.");
    }
  }

  // flows: ends must exist, and a flow can't run from a cloud to a cloud
  const stockIds = new Set(m.stocks.map((s) => s.id));
  for (const f of m.flows) {
    if (f.from && !stockIds.has(f.from)) err(f.id, "from", "It starts at a stock that no longer exists.");
    if (f.to && !stockIds.has(f.to)) err(f.id, "to", "It ends at a stock that no longer exists.");
    if (!f.from && !f.to) err(f.id, "from", "Connect it to a stock. A cloud is allowed at one end, not both.");
    if (f.from && f.from === f.to) err(f.id, "to", "It starts and ends at the same stock, so it would change nothing.");
  }
  for (const s of m.stocks) if (!inflows(m, s.id).length && !outflows(m, s.id).length) warn(s.id, "init", "No flow fills or drains it, so it will never change.");

  // circular definitions among flows and variables (stocks break every feedback loop, so they are not in this graph)
  const rates = els.filter((e) => e.kind !== "stock");
  const deps = new Map<string, string[]>();
  for (const e of rates) {
    const refs = code.get(e.id)?.refs ?? [];
    deps.set(e.id, refs.map((k) => byKey.get(k)).filter((x): x is Element => !!x && x.kind !== "stock").map((x) => x.id));
  }
  // Tarjan's algorithm: components come out dependencies first, which is the evaluation order
  const order: string[] = [];
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
      const selfLoop = comp.length === 1 && (deps.get(v) ?? []).includes(v);
      if (comp.length > 1 || selfLoop) {
        const names = comp.reverse().map((id) => findElement(m, id)!.name);
        const loop = [...names, names[0]].map(refName).join(" → ");
        for (const id of comp) err(id, "eq", selfLoop ? "Its equation refers to itself. Only a stock can feed back on itself." : `Circular definition: ${loop}. Every feedback loop needs a stock in it.`);
      } else order.push(v);
    }
  };
  rates.forEach((e) => !index.has(e.id) && strong(e.id));

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
  return { issues, byKey, code, order };
}

export type RunResult = { ok: boolean; times: number[]; values: Record<string, number[]>; issues: Issue[] };

// Euler integration: rates from the current stocks, then stock(t + dt) = stock(t) + dt * (inflows - outflows)
export function simulate(m: BModel, maxPoints = 1000): RunResult {
  const chk = validate(m);
  const errors = chk.issues.filter((i) => i.level === "error");
  const values: Record<string, number[]> = {};
  const times: number[] = [];
  if (errors.length) return { ok: false, times, values, issues: errors };
  const els = elements(m);
  els.forEach((e) => (values[e.id] = []));
  const steps = Math.round(m.T / m.dt);
  const stride = Math.max(1, Math.ceil(steps / maxPoints));
  const s: Scope = { TIME: 0, DT: m.dt };
  const keyOf = new Map(els.map((e) => [e.id, nameKey(e.name)]));
  const bad = (e: Element, v: number, t: number): RunResult => {
    const what = e.kind === "stock" ? (t === 0 ? "Its initial value" : "It") : "Its equation";
    return {
      ok: false,
      times,
      values,
      issues: [{ id: e.id, field: e.kind === "stock" ? "init" : "eq", level: "error", msg: `${what} gave ${v} at time ${+t.toFixed(6)}. Look for a division by zero, a root or log of a negative number, or explosive growth.` }],
    };
  };

  // initial values: work through whatever each one needs, so a stock may start at desired_inventory
  const busy = new Set<string>(), done = new Set<string>();
  const initOf = (e: Element): string | null => {
    if (done.has(e.id)) return null;
    if (busy.has(e.id)) return e.name;
    busy.add(e.id);
    const c = chk.code.get(e.id)!;
    for (const r of c.refs) {
      const d = chk.byKey.get(r)!;
      const loop = initOf(d);
      if (loop) return loop;
    }
    s[keyOf.get(e.id)!] = c.eval(s);
    busy.delete(e.id), done.add(e.id);
    return null;
  };
  for (const e of els) {
    const loop = initOf(e);
    if (loop) return { ok: false, times, values, issues: [{ id: e.id, field: e.kind === "stock" ? "init" : "eq", level: "error", msg: `Its initial value depends on itself through ${loop}. Give a stock a number to start from.` }] };
  }
  for (const st of m.stocks) if (!Number.isFinite(s[keyOf.get(st.id)!])) return bad({ ...st, kind: "stock" }, s[keyOf.get(st.id)!], 0);

  const rates = chk.order.map((id) => ({ e: els.find((x) => x.id === id)!, key: keyOf.get(id)!, f: chk.code.get(id)! }));
  const stocks = m.stocks.map((st) => ({ st, key: keyOf.get(st.id)!, ins: inflows(m, st.id).map((f) => keyOf.get(f.id)!), outs: outflows(m, st.id).map((f) => keyOf.get(f.id)!) }));
  for (let i = 0; i <= steps; i++) {
    const t = i * m.dt;
    s.TIME = t;
    for (const r of rates) {
      const v = r.f.eval(s);
      if (!Number.isFinite(v)) return bad(r.e, v, t);
      s[r.key] = v;
    }
    if (i % stride === 0 || i === steps) {
      times.push(+t.toFixed(10));
      for (const e of els) values[e.id].push(s[keyOf.get(e.id)!]);
    }
    if (i === steps) break;
    const next = stocks.map(({ key, ins, outs }) => s[key] + m.dt * (ins.reduce((a, k) => a + s[k], 0) - outs.reduce((a, k) => a + s[k], 0)));
    for (let j = 0; j < stocks.length; j++) {
      if (!Number.isFinite(next[j])) return bad({ ...stocks[j].st, kind: "stock" }, next[j], t + m.dt);
      s[stocks[j].key] = stocks[j].st.nonNegative ? Math.max(0, next[j]) : next[j];
    }
  }
  return { ok: true, times, values, issues: [] };
}

// ---------------------------------------------------------------------------------------------------
// equations as text, stocks in INTEG form
export function equationGroups(m: BModel) {
  const u = (x?: string) => (x?.trim() ? `  [${x.trim()}]` : "");
  const name = (id: string) => refName(m.flows.find((f) => f.id === id)!.name);
  return [
    {
      title: "Stocks",
      lines: m.stocks.map((s) => {
        const net = [...inflows(m, s.id).map((f) => name(f.id)), ...outflows(m, s.id).map((f) => "- " + name(f.id))].join(" + ").replace(/\+ - /g, "- ").replace(/^- /, "-");
        return `${refName(s.name)} = INTEG(${net || "0"}, ${s.init.trim() || "?"})${u(s.units)}`;
      }),
    },
    { title: "Flows", lines: m.flows.map((f) => `${refName(f.name)} = ${f.eq.trim() || "?"}${u(f.units)}`) },
    { title: "Auxiliaries and constants", lines: m.vars.map((v) => `${refName(v.name)} = ${v.eq.trim() || "?"}${u(v.units)}`) },
    { title: "Settings", lines: [`Time unit: ${m.timeUnit || "?"}`, `Stop time: ${m.T}`, `Time step (dt): ${m.dt}`, "Integration: Euler"] },
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
  return {
    name: str(m.name, "Imported model"),
    timeUnit: str(m.timeUnit, "time"),
    T: num(m.T, 50),
    dt: num(m.dt, 0.25),
    stocks: (m.stocks as unknown[]).map(rec).map((s) => ({ id: id(s.id, "stock"), name: str(s.name), init: str(s.init, "0"), x: num(s.x, 200), y: num(s.y, 200), units: opt(s.units) })),
    flows: (m.flows as unknown[]).map(rec).map((f) => ({ id: id(f.id, "flow"), name: str(f.name), from: opt(f.from), to: opt(f.to), eq: str(f.eq), x: num(f.x, 300), y: num(f.y, 200), units: opt(f.units) })),
    vars: (m.vars as unknown[]).map(rec).map((v) => ({ id: id(v.id, "variable"), name: str(v.name), eq: str(v.eq), x: num(v.x, 300), y: num(v.y, 320), units: opt(v.units) })),
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
        { id: "f2", name: "Drain", from: "s1", eq: "Water / drain_time", x: 680, y: 200, units: "litres/minute" },
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
        { id: "f1", name: "Births", to: "s1", eq: "Population * birth_fraction", x: 260, y: 200, units: "people/year" },
        { id: "f2", name: "Deaths", from: "s1", eq: "Population * death_fraction", x: 680, y: 200, units: "people/year" },
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
        { id: "s1", name: "Supply line", init: "desired_supply_line", x: 360, y: 240, units: "units" },
        { id: "s2", name: "Inventory", init: "desired_inventory", x: 680, y: 240, units: "units" },
      ],
      flows: [
        {
          id: "f1",
          name: "Orders",
          to: "s1",
          eq: "MAX(0, demand + (desired_inventory - Inventory) / inventory_adjustment_time + (desired_supply_line - Supply_line) / supply_line_adjustment_time)",
          x: 170,
          y: 240,
          units: "units/week",
        },
        { id: "f2", name: "Acquisition", from: "s1", to: "s2", eq: "Supply_line / acquisition_delay", x: 520, y: 240, units: "units/week" },
        { id: "f3", name: "Shipments", from: "s2", eq: "demand", x: 860, y: 240, units: "units/week" },
      ],
      vars: [
        { id: "v1", name: "Demand", eq: "10 + STEP(5, 10)", x: 860, y: 400, units: "units/week" },
        { id: "v2", name: "Desired inventory", eq: "100", x: 560, y: 80, units: "units" },
        { id: "v3", name: "Inventory adjustment time", eq: "4", x: 300, y: 80, units: "weeks" },
        { id: "v4", name: "Acquisition delay", eq: "6", x: 470, y: 350, units: "weeks" },
        { id: "v5", name: "Desired supply line", eq: "demand * acquisition_delay", x: 270, y: 410, units: "units" },
        { id: "v6", name: "Supply line adjustment time", eq: "8", x: 110, y: 380, units: "weeks" },
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
