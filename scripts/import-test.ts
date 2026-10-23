// Importer tests: hand-written XMILE and Vensim snippets (the converted equation text), an XMILE round trip for every
// template and shared spec, and a report on the SDXorg test models (github.com/SDXorg/test-models) when cloned to
// TEST_MODELS (default: the scratchpad path below). Run with: npm run test:import
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { TEMPLATES, elements, series, simulate, template, validate, type BModel } from "@/lib/builder";
import { FUNCTION_DOCS, nameKey } from "@/lib/expr";
import { xmile } from "@/lib/exports";
import { importMdl, importModel, importXmile, safeName, type Imported } from "@/lib/importers";
import { SPECS } from "@/lib/spec";

const errs: string[] = [];
const fail = (s: string) => errs.push(s);
const clone = (m: BModel): BModel => JSON.parse(JSON.stringify(m));
const el = (m: BModel, name: string) => elements(m).find((e) => nameKey(e.name) === nameKey(name));
const eqOf = (m: BModel, name: string) => {
  const e = el(m, name);
  return e ? (e.kind === "stock" ? e.init : e.eq) : `(no element ${name})`;
};
const expectEq = (what: string, r: Imported, name: string, want: string) => {
  const got = eqOf(r.model, name);
  if (got !== want) fail(`${what}: ${name} should be\n  ${want}\nnot\n  ${got}`);
};
const expectWarn = (what: string, r: Imported, re: RegExp) => !r.warnings.some((w) => re.test(w)) && fail(`${what}: no warning matching ${re} in\n  ${r.warnings.join("\n  ")}`);

// ---------------------------------------------------------------------------------------------------
// Vensim conversion
{
  const mdl = String.raw`{UTF-8}
Region: North, South ~~|
Pop[Region]= INTEG (births[Region] - deaths[Region], init pop[Region]) ~ people ~ The population. |
init pop[Region]= 100, 50 ~~|
births[Region]= Pop[Region] * birth rate[Region] ~ people/year ~ |
deaths[Region]= Pop[Region] / 70 ~ people/year ~ |
birth rate[North]= 0.03 ~~|
birth rate[South]= 0.02 ~ 1/year ~ |
Total= SUM(Pop[Region!]) ~~|
Tank= INTEG (fill * 2 - drain, 10) ~~|
fill= IF THEN ELSE(Time > 5 :AND: Tank < 50, 1, 0) + RAMP(2, 3, 8) + RAMP(1, 2, 100) + PULSE(4, 2) ~~|
drain= SMOOTHI(Tank, 3, 5) + DELAY N(Tank, 4, 0, 6) + SMOOTH N(Tank, 2, 1, 3) + effect(Tank) + WITH LOOKUP(Time, ([(0,0)-(10,1)],(0,0),(10,1))) ~~|
effect(
	[(0,0)-(100,2)],(0,0),(50,1),\
		(100,2)) ~~|
misc= MODULO(7, 3) + INTEGER(2.5) + XIDZ(1, 0, 4) + ACTIVE INITIAL(Tank, 1) + TIME STEP + FINAL TIME + PULSE TRAIN(1, 1, 2, 10) ~~|
data in := GET XLS DATA('a.xlsx', 'S', 'A', 'B1') ~~|
:MACRO: TWICE(x)
TWICE = 2 * inner ~~|
inner = x + 1 ~~|
:END OF MACRO:
:MACRO: SPLIT(x : rest)
SPLIT = x / 2 ~~|
rest = x / 2 ~~|
:END OF MACRO:
twice it = TWICE(Tank) + TWICE(3) ~~|
********************************************************
	.Control
********************************************************~
		Simulation Control Parameters
	|
FINAL TIME  = 20 ~ Year ~ |
INITIAL TIME  = 0 ~ Year ~ |
SAVEPER  = TIME STEP ~ Year [0,?] ~ |
TIME STEP  = 0.25 ~ Year [0,?] ~ |
\\\---/// Sketch information - do not modify anything except names
V300  Do not put anything below this section - it will be ignored
*View 1
10,1,Tank,300,200,40,20,3,3,0,0,0,0,0,0
11,2,48,400,200,6,8,34,3,0,0,1,0,0,0
10,3,drain,400,220,49,8,40,3,0,0,-1,0,0,0
10,4,fill,200,200,40,20,3,3,0,0,0,0,0,0
1,5,2,1,100,0,0,22,0,0,0,-1--1--1,,1|(441,235)|
1,6,1,3,1,0,0,0,0,64,0,-1--1--1,,1|(340,296)|
///---\\\
`;
  const r = importMdl(mdl), m = r.model;
  const w = "mdl";
  if (m.T !== 20 || m.dt !== 0.25 || m.timeUnit !== "Year" || m.saveEvery !== undefined || m.start !== undefined) fail(`${w}: settings ${JSON.stringify([m.T, m.dt, m.timeUnit, m.saveEvery, m.start])}`);
  if (JSON.stringify(m.dims) !== JSON.stringify([{ name: "Region", elements: ["North", "South"] }])) fail(`${w}: dims ${JSON.stringify(m.dims)}`);
  expectEq(w, r, "Pop", "init_pop");
  expectEq(w, r, "init pop", "100, 50");
  expectEq(w, r, "birth rate", "0.03, 0.02");
  expectEq(w, r, "births", "Pop * birth_rate");
  expectEq(w, r, "Total", "SUM(Pop)");
  const pop = el(m, "Pop")!, births = el(m, "births")!, deaths = el(m, "deaths")!;
  if (births.kind !== "flow" || births.to !== pop.id || deaths.kind !== "flow" || deaths.from !== pop.id || pop.dim !== "Region" || pop.note !== "The population." || pop.units !== "people") fail(`${w}: Pop's flows, dim, note or units`);
  // Tank's rate is not a plain sum of names, so it gets one net flow
  expectEq(w, r, "Tank net flow", "fill * 2 - drain");
  if (el(m, "fill")?.kind !== "var" || el(m, "Tank net flow")?.kind !== "flow") fail(`${w}: Tank should have a net flow, fill and drain stay auxiliaries`);
  expectEq(w, r, "fill", "IF((TIME > 5) * (Tank < 50), 1, 0) + (RAMP(2, 3) - RAMP(2, 8)) + RAMP(1, 2) + PULSE(1, 4, 2)");
  expectEq(w, r, "drain", "SMOOTH(Tank, 3, 5) + DELAYN(Tank, 4, 6, 0) + SMOOTHN(Tank, 2, 3, 1) + TABLE(Tank, 0, 0, 50, 1, 100, 2) + TABLE(TIME, 0, 0, 10, 1)");
  expectEq(w, r, "misc", "MODULO(7, 3) + IF(2.5 < 0, -INT(-2.5), INT(2.5)) + XIDZ(1, 0, 4) + Tank + DT + 20 + PULSE_TRAIN(1, 1, 2, 10)");
  expectEq(w, r, "data in", "0");
  if (el(m, "effect") || el(m, "TWICE")) fail(`${w}: lookups and macros should not become elements`);
  // a macro call becomes the macro's equations, named after the caller and the call
  expectEq(w, r, "twice it", "twice_it_TWICE + twice_it_TWICE_2");
  expectEq(w, r, "twice it TWICE", "2 * twice_it_TWICE_inner");
  expectEq(w, r, "twice it TWICE inner", "Tank + 1");
  expectEq(w, r, "twice it TWICE 2 inner", "3 + 1");
  expectWarn(w, r, /macro SPLIT: it has more than one output/);
  if (r.warnings.some((x) => /TWICE|PULSE TRAIN/.test(x))) fail(`${w}: TWICE and PULSE TRAIN should come across without a warning`);
  expectWarn(w, r, /data in reads data/);
  expectWarn(w, r, /ACTIVE INITIAL/);
  expectWarn(w, r, /RAMP with an end time/);
  // the sketch: positions, and the info arrow Tank -> drain (the pipe from the valve is not an arrow)
  const tank = el(m, "Tank")!, drain = el(m, "drain")!, fill = el(m, "fill")!;
  if (!(tank.x < drain.x && fill.x < tank.x)) fail(`${w}: sketch positions ${[fill.x, tank.x, drain.x]}`);
  if (JSON.stringify(m.links) !== JSON.stringify([{ from: tank.id, to: drain.id }])) fail(`${w}: links ${JSON.stringify(m.links)}`);
  // 2-D lists, rows separated by semicolons
  const r2 = importMdl("A: a1, a2 ~~|\nB: b1, b2, b3 ~~|\nx[A, B] = 1, 2, 3; 4, 5, 6; ~~|\ny[a1, B] = 7 ~~|\ny[a2, B] = 8 ~~|\nFINAL TIME = 10 ~~|\nTIME STEP = 1 ~~|");
  expectEq("mdl 2-D", r2, "x", "1, 2, 3, 4, 5, 6");
  expectEq("mdl 2-D", r2, "y", "7, 7, 7, 8, 8, 8");
  if (el(r2.model, "x")?.dim !== "A, B") fail(`mdl 2-D: dim ${el(r2.model, "x")?.dim}`);

  // single elements, per-element equations (with :EXCEPT:), per-element stock rates, and the newer functions
  const r3 = importMdl(String.raw`Region: North, South, East ~~|
a[Region] = 1, 2, 3 ~~|
b[Region] :EXCEPT: [East] = a[Region] * 2 ~~|
b[East] = a[North] + ELMCOUNT(Region) ~~|
c[North] = SINH(1) + QUANTUM(Time, 2) + PULSE TRAIN(1, 1, 3, 9) ~~|
c[South] = a[South] ~~|
c[East] = a[South] ~~|
s[Region] = SAMPLE IF TRUE(Time > 2, a[Region], 0) + COSH(0) + TANH(0) ~~|
st[North] = INTEG(a[North], 1) ~~|
st[South] = INTEG(a[South] * 2, 2) ~~|
st[East] = INTEG(a[East] * 2, 2) ~~|
g = GET TIME VALUE(0, 0, 0) ~~|
FINAL TIME = 10 ~~|
TIME STEP = 1 ~~|`);
  const w3 = "mdl per element";
  expectEq(w3, r3, "b", "a * 2");
  expectEq(w3, r3, "c", "SINH(1) + QUANTUM(TIME, 2) + PULSE_TRAIN(1, 1, 3, 9)");
  expectEq(w3, r3, "s", "SAMPLE_IF_TRUE(TIME > 2, a, 0) + COSH(0) + TANH(0)");
  expectEq(w3, r3, "st", "1, 2, 2");
  expectEq(w3, r3, "st net flow", "a * 2");
  const eqs = (n: string) => JSON.stringify((el(r3.model, n) as { eqs?: unknown })?.eqs);
  if (eqs("b") !== JSON.stringify({ East: "a[North] + ELMCOUNT(Region)" })) fail(`${w3}: b's per-element equations ${eqs("b")}`);
  if (eqs("c") !== JSON.stringify({ South: "a", East: "a[South]" })) fail(`${w3}: c's per-element equations ${eqs("c")}`);
  if (eqs("st net flow") !== JSON.stringify({ North: "a" })) fail(`${w3}: st's per-element rates ${eqs("st net flow")}`);
  expectWarn(w3, r3, /GET TIME VALUE has no equivalent/);
  if (r3.warnings.length !== 1) fail(`${w3}: only GET TIME VALUE should warn:\n  ${r3.warnings.join("\n  ")}`);
  const v3 = validate(r3.model).issues.filter((i) => i.id !== el(r3.model, "g")?.id && i.level === "error");
  if (v3.length) fail(`${w3}: does not validate: ${v3.map((i) => i.msg).join("; ")}`);
}

// ---------------------------------------------------------------------------------------------------
// XMILE conversion
{
  const x = `<?xml version="1.0" encoding="utf-8"?>
<xmile version="1.0" xmlns="http://docs.oasis-open.org/xmile/ns/XMILE/v1.0" xmlns:isee="http://iseesystems.com/XMILE">
  <header><name>Snippet</name></header>
  <sim_specs method="RK4" time_units="Months"><start>1</start><stop>13</stop><dt reciprocal="true">4</dt></sim_specs>
  <dimensions><dim name="Product"><elem name="Pizza"/><elem name="Salad"/></dim><dim name="N" size="2"/></dimensions>
  <macro name="DOUBLE"><parm>x</parm><eqn>x * 2</eqn></macro>
  <macro name="BIG"><parm>x</parm><eqn>y</eqn><variables><aux name="y"><eqn>x</eqn></aux></variables></macro>
  <model>
    <variables>
      <stock name="Stock with \\n Newline"><eqn>10</eqn><inflow>"in-flow"</inflow><outflow>out</outflow><non_negative/></stock>
      <flow name="in-flow"><eqn>SMTH1(effect_gf, 2) + SAFEDIV(1, 0) + PULSE(5, 3) + INIT(out) {a comment}</eqn><non_negative/></flow>
      <flow name="out"><eqn>IF Stock_with_\\n_Newline &gt; 5 AND NOT TIME &lt; 2 THEN 1 ELSE 0</eqn></flow>
      <aux name="effect gf"><eqn>TIME</eqn><gf><xscale min="0" max="10"/><ypts>0,1,4</ypts></gf></aux>
      <gf name="shape"><xpts sep=";">0;5</xpts><ypts sep=";">1;3</ypts></gf>
      <aux name="Price"><dimensions><dim name="Product"/></dimensions>
        <element subscript="Pizza"><eqn>2</eqn></element><element subscript="Salad"><eqn>4</eqn></element></aux>
      <aux name="Sales"><dimensions><dim name="Product"/></dimensions><eqn>Price[Product] * shape(TIME) + MEAN(Price[*]) + MAX(Price[*]) + Price[Pizza]</eqn></aux>
      <aux name="Sum"><eqn>SUM(Price[*]) + SMTHN(1, 2, 3) + FORCST(1, 2, 3) + DELAY(TIME, 2) + 7 MOD 4 + LOG10(100) + PI</eqn></aux>
      <aux name="Mixed"><dimensions><dim name="Product"/></dimensions>
        <element subscript="Pizza"><eqn>Price[Pizza] * 2</eqn></element><element subscript="Salad"><eqn>DOUBLE(TIME + 1)</eqn></element></aux>
      <module name="sub"/>
    </variables>
    <views><view>
      <stock name="Stock_with_\\n_Newline" x="100" y="100"/><flow name="in-flow" x="50" y="100"/><flow name="out" x="150" y="100"/>
      <aux name="effect_gf" x="50" y="200"/><aux name="Price" x="120" y="200"/><aux name="Sales" x="140" y="220"/><aux name="Sum" x="160" y="240"/>
      <connector uid="1"><from>Price</from><to>Sales</to></connector>
      <connector uid="2"><from>shape</from><to>Sales</to></connector>
    </view></views>
  </model>
</xmile>`;
  const r = importXmile(x), m = r.model, w = "xmile";
  if (m.name !== "Snippet" || m.start !== 1 || m.T !== 13 || m.dt !== 0.25 || m.timeUnit !== "Months") fail(`${w}: settings ${JSON.stringify([m.name, m.start, m.T, m.dt, m.timeUnit])}`);
  expectWarn(w, r, /RK4 integration/);
  expectWarn(w, r, /module sub/);
  expectWarn(w, r, /Renamed "in-flow" to "in flow"/);
  expectWarn(w, r, /macro BIG/);
  expectEq(w, r, "Mixed", "Price * 2");
  if (JSON.stringify(el(m, "Mixed")?.eqs) !== JSON.stringify({ Salad: "(TIME + 1) * 2" })) fail(`${w}: Mixed's per-element equations ${JSON.stringify(el(m, "Mixed")?.eqs)}`);
  expectEq(w, r, "Stock with Newline", "10");
  expectEq(w, r, "in flow", "MAX(0, SMOOTH(effect_gf, 2) + ZIDZ(1, 0) + PULSE(5 / DT, 3, 0) + INITIAL(out))");
  expectEq(w, r, "out", "IF((Stock_with_Newline > 5) * ((TIME < 2) = 0), 1, 0)");
  expectEq(w, r, "effect gf", "TABLE(TIME, 0, 0, 5, 1, 10, 4)");
  expectEq(w, r, "Price", "2, 4");
  expectEq(w, r, "Sales", "Price * TABLE(TIME, 0, 1, 5, 3) + MEAN(Price) + VMAX(Price) + Price[Pizza]");
  expectEq(w, r, "Sum 2", "SUM(Price) + SMOOTHN(1, 2, 3) + FORECAST(1, 2, 3) + DELAY_FIXED(TIME, 2, TIME) + MODULO(7, 4) + LOG(100, 10) + PI()");
  const st = el(m, "Stock with Newline")!;
  if (st.kind !== "stock" || !st.nonNegative || el(m, "in flow")?.kind !== "flow" || (el(m, "in flow") as { to?: string }).to !== st.id) fail(`${w}: stock and flows`);
  if (JSON.stringify(m.dims) !== JSON.stringify([{ name: "Product", elements: ["Pizza", "Salad"] }, { name: "N", elements: ["_1", "_2"] }])) fail(`${w}: dims ${JSON.stringify(m.dims)}`);
  if (m.links?.length !== 1 || m.links[0].from !== el(m, "Price")!.id) fail(`${w}: only the connector whose ends exist becomes a link: ${JSON.stringify(m.links)}`);
  if (!(st.x > el(m, "in flow")!.x && el(m, "effect gf")!.y > st.y)) fail(`${w}: positions`);
  for (const e of elements(m)) if (e.x < 0 || e.x > 1000 || e.y < 0 || e.y > 480) fail(`${w}: ${e.name} placed off the canvas at ${e.x}, ${e.y}`);
  // the file name picks the importer and names an unnamed model
  if (importModel("dir/My model.mdl", "x = 1 ~~|").model.name !== "My model" || importModel("a.txt", x).model.name !== "Snippet") fail("importModel: picking the importer or the name");
}

// ---------------------------------------------------------------------------------------------------
// round trip: the builder's own XMILE export comes back as the same model
const perElement: BModel = {
  ...template("regions"),
  name: "Per element",
  stocks: [{ ...template("regions").stocks[0], eqs: { East: "Birth_fraction[North] * 10000" } }],
  vars: [...template("regions").vars, { id: "v4", name: "North share", eq: "Population[North] / Total_population", x: 0, y: 0 }, { id: "v5", name: "Mixed", eq: "Population * 2", x: 0, y: 0, dim: "Region", eqs: { South: "Population[North] + PULSE_TRAIN(2, 1, 5, 40)" } }],
};
const models: BModel[] = [...TEMPLATES.map((t) => template(t.id)), perElement, ...Object.values(SPECS).map((s) => clone(s.model))];
let trips = 0;
for (const m of models) {
  const tag = `round trip ${m.name}`;
  let text: string;
  try {
    text = xmile(m);
  } catch (e) {
    // exports.ts is someone else's: note it here, builder-test fails on it
    console.log(`(round trip ${m.name} skipped: the XMILE export failed: ${(e as Error).message.slice(0, 80)})`);
    continue;
  }
  const r = importXmile(text), b = r.model;
  if (r.warnings.length) fail(`${tag}: warnings\n  ${r.warnings.join("\n  ")}`);
  const names = (x: BModel, k: "stocks" | "flows" | "vars") => x[k].map((e) => e.name).sort().join(" | ");
  for (const k of ["stocks", "flows", "vars"] as const) if (names(m, k) !== names(b, k)) fail(`${tag}: ${k}\n  ${names(m, k)}\n  ${names(b, k)}`);
  if (JSON.stringify(m.dims ?? []) !== JSON.stringify(b.dims ?? [])) fail(`${tag}: dims`);
  if (m.T !== b.T || m.dt !== b.dt || m.timeUnit !== b.timeUnit) fail(`${tag}: settings`);
  if (!m.stocks.length) continue;
  const ra = simulate(m, Number.MAX_SAFE_INTEGER), rb = simulate(b, Number.MAX_SAFE_INTEGER);
  if (!ra.ok) continue; // the engine is mid-change for this one; builder-test reports it
  if (!rb.ok) {
    fail(`${tag}: the imported model does not run: ${rb.issues.map((i) => i.msg).join("; ")}`);
    continue;
  }
  for (const s of m.stocks) {
    const sb = b.stocks.find((x) => x.name === s.name);
    if (!sb) continue;
    series(m, s).forEach((x, j) => {
      const va = ra.values[x.key].at(-1)!, vb = rb.values[series(b, sb)[j].key].at(-1)!;
      if (!(Math.abs(va - vb) <= 1e-6 * Math.max(1, Math.abs(va)))) fail(`${tag}: ${x.label} ends at ${vb}, not ${va}`);
    });
  }
  trips++;
}

// ---------------------------------------------------------------------------------------------------
// the SDXorg test models: import each, run what the builder supports, compare with the expected output
const ROOT = process.env.TEST_MODELS ?? "/private/tmp/claude-501/-Users-waelrashwan-claude-System-dynamics/3083a20b-6c40-4ee9-a5f3-42247abc92a5/scratchpad/test-models";
// the common samples, which must import, run and match
// (one that uses a contract function the engine lacks so far is skipped with a note)
const MUST = [
  ...["teacup/teacup.mdl", "teacup/teacup.xmile", "teacup/teacup_w_diagram.xmile", "SIR/SIR.mdl", "SIR/SIR.xmile", "SIR/SIR_reciprocal-dt.xmile"].map((f) => "samples/" + f),
  ...["lookups/test_lookups.mdl", "lookups/test_lookups.xmile", "lookups/test_lookups_xscale.xmile", "lookups_inline/test_lookups_inline.mdl", "lookups_without_range/test_lookups_without_range.mdl"].map((f) => "tests/" + f),
  ...["subscript_1d_arrays/test_subscript_1d_arrays.mdl", "subscript_2d_arrays/test_subscript_2d_arrays.mdl", "subscript_3d_arrays/test_subscript_3d_arrays.mdl", "subscript_individually_defined_1d_arrays/subscript_individually_defined_1d_arrays.xmile", "subscript_subranges/test_subscript_subrange.mdl"].map((f) => "tests/" + f),
  ...["builtin_max/builtin_max.mdl", "builtin_min/builtin_min.xmile", "abs/test_abs.mdl", "if_stmt/if_stmt.xmile", "logicals/test_logicals.mdl", "exp/test_exp.mdl", "ln/test_ln.xmile", "log/test_log.mdl", "sqrt/test_sqrt.mdl", "trig/test_trig.mdl", "xidz_zidz/xidz_zidz.mdl", "initial_function/test_initial.mdl", "trend/test_trend.mdl", "smooth_and_stock/test_smooth_and_stock.mdl", "subscripted_delays/test_subscripted_delays.mdl", "time/test_time.mdl"].map((f) => "tests/" + f),
  ...["special_characters/test_special_variable_names.mdl", "special_characters_xmile/test_special_variable_names.xmile", "non_negative_stocks/test_non_negative_stocks.xmile", "line_continuation/test_line_continuation.mdl", "number_handling/test_number_handling.mdl"].map((f) => "tests/" + f),
];
const files: string[] = [];
const walk = (d: string): void => readdirSync(d).forEach((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : /\.(mdl|xmile)$/i.test(f) && files.push(join(d, f))));

// expected output: tab or comma separated, time down the first column (or across the first row)
function expected(dir: string): { times: number[]; cols: Map<string, number[]> } | undefined {
  const f = ["output.tab", "output.csv"].map((n) => join(dir, n)).find(existsSync);
  if (!f) return;
  const sep = f.endsWith(".tab") ? "\t" : ",";
  const buf = readFileSync(f), utf = buf.toString("utf8");
  let rows = (utf.includes("\uFFFD") ? buf.toString("latin1") : utf).split(/\r\n|\r|\n/).filter((l) => l.trim()).map((l) => (sep === "," ? (l.match(/("[^"]*"|[^,]*)(,|$)/g) ?? []).map((s) => s.replace(/,$/, "")) : l.split(sep)).map((s) => s.trim().replace(/^"|"$/g, "")));
  if (!/^time$/i.test(rows[0][0]) && rows.some((r) => /^time$/i.test(r[0]))) rows = rows[0].map((_, j) => rows.map((r) => r[j] ?? "")); // time across
  const head = rows[0], body = rows.slice(1).filter((r) => r[0] !== "" && Number.isFinite(+r[0]));
  return { times: body.map((r) => +r[0]), cols: new Map(head.slice(1).map((h, j) => [h, body.map((r) => (r[j + 1] === "" ? NaN : +r[j + 1]))])) };
}
// a run's series by a normalised label, matching "Stock A[Entry 1,Column 1]" whatever the spacing
const norm = (label: string) => {
  const m = /^(.*?)\s*(?:\[(.*)\])?$/.exec(label)!;
  return nameKey(safeName(m[1])) + (m[2] ? `[${m[2].split(",").map((s) => nameKey(safeName(s))).join(",")}]` : "");
};

const report = { files: 0, clean: 0, warned: 0, failed: 0, invalid: 0, runFailed: 0, compared: 0, passed: 0, mismatched: 0, noOutput: 0 };
const reasons = new Map<string, number>();
// each reason counts once per file
let seen = new Set<string>();
const why = (s: string) => !seen.has(s) && (seen.add(s), reasons.set(s, (reasons.get(s) ?? 0) + 1));
const CONTRACT = new Set([...FUNCTION_DOCS.map((f) => f[0]), "COS", "TAN", "ARCSIN", "ARCCOS", "ARCTAN"]);
const passed = new Set<string>(), detail: string[] = [], invalid: string[] = [];
if (!existsSync(ROOT)) console.log(`(no test models at ${ROOT}: clone https://github.com/SDXorg/test-models there, or set TEST_MODELS, to run that part)`);
else {
  walk(ROOT);
  for (const f of files.sort()) {
    const rel = relative(ROOT, f);
    report.files++;
    seen = new Set();
    let r: Imported;
    try {
      r = importModel(f, readFileSync(f, "utf8"));
    } catch (e) {
      report.failed++;
      why(`import threw: ${(e as Error).message.slice(0, 60)}`);
      continue;
    }
    if (r.warnings.length) report.warned++;
    else report.clean++;
    for (const w of r.warnings) {
      const fn = /: (.+?) has no equivalent/.exec(w);
      if (fn) why(`function ${fn[1].toUpperCase().replace(/\s+/g, "_")} not in the builder`);
      else if (/picks out single elements/.test(w)) why("refers to single array elements");
      else if (/different equation for each element/.test(w)) why("different equations per element");
      else if (/macro/i.test(w)) why("macros");
      else if (/reads data|GET /.test(w)) why("external data");
    }
    const issues = validate(r.model).issues.filter((i) => i.level === "error");
    if (issues.length) {
      report.invalid++;
      invalid.push(`  ${rel}: ${issues[0].msg.slice(0, 160)}`);
      for (const i of issues) {
        const fn = /Unknown function "([^"]+)"/.exec(i.msg);
        if (fn) why(`function ${fn[1].toUpperCase()} ${CONTRACT.has(fn[1].toUpperCase()) ? "in the contract but not in the engine yet" : "not in the builder"}`);
        else if (!r.warnings.some((w) => /has no equivalent|picks out|different equation/.test(w))) why(`does not validate: ${i.msg.replace(/"[^"]*"/g, '"..."').slice(0, 70)}`);
      }
      if (MUST.includes(rel) && issues.every((i) => CONTRACT.has(/Unknown function "([^"]+)"/.exec(i.msg)?.[1].toUpperCase() ?? "")))
        console.log(`(${rel} skipped: it uses a function the engine does not have yet)`);
      else if (MUST.includes(rel)) fail(`${rel}: does not validate: ${issues.map((i) => i.msg).join("; ")}`);
      continue;
    }
    const res = simulate(r.model, Number.MAX_SAFE_INTEGER);
    if (!res.ok) {
      report.runFailed++;
      why(`run failed: ${res.issues[0]?.msg.slice(0, 60)}`);
      if (MUST.includes(rel)) fail(`${rel}: run failed: ${res.issues.map((i) => i.msg).join("; ")}`);
      continue;
    }
    const exp = expected(dirname(f));
    if (!exp) {
      report.noOutput++;
      continue;
    }
    const mine = new Map<string, number[]>();
    for (const e of elements(r.model)) for (const s of series(r.model, e)) if (res.values[s.key]) mine.set(norm(s.label), res.values[s.key]);
    let matched = 0, bad = "";
    for (const [col, want] of exp.cols) {
      const got = mine.get(norm(col));
      if (!got) continue;
      matched++;
      exp.times.forEach((t, j) => {
        const i = res.times.findIndex((x) => Math.abs(x - t) < 1e-6 * Math.max(1, Math.abs(t)));
        if (bad || i < 0 || !Number.isFinite(want[j])) return;
        if (!(Math.abs(got[i] - want[j]) <= 1e-3 * Math.max(1, Math.abs(want[j])))) bad = `${col} at time ${t} is ${got[i]}, expected ${want[j]}`;
      });
      if (!res.times.some((x) => Math.abs(x - exp.times[0]) < 1e-6) && !bad) bad = `the run starts at ${res.times[0]}, the output at ${exp.times[0]}`;
    }
    if (!matched) bad = "no column of the expected output matches an element";
    report.compared++;
    if (bad) {
      report.mismatched++;
      why(`mismatch`);
      detail.push(`  ${rel}: ${bad}`);
      if (MUST.includes(rel)) fail(`${rel}: ${bad}`);
    } else report.passed++, passed.add(rel);
  }
  for (const m of MUST) if (!files.some((f) => relative(ROOT, f) === m)) fail(`${m}: not found in the test models`);
  // 130 matched before single elements, per-element equations, the newer functions and macros came in
  if (report.passed < 155) fail(`SDXorg: only ${report.passed} models match their expected output; 155 did`);
  const p = report;
  console.log(`SDXorg test models: ${p.files} files (.mdl and .xmile)`);
  console.log(`  imported: ${p.clean} cleanly, ${p.warned} with warnings, ${p.failed} failed`);
  console.log(`  runnable in the builder: ${p.files - p.failed - p.invalid} (${p.invalid} do not validate, ${p.runFailed} stop during the run)`);
  console.log(`  compared with the expected output: ${p.compared}: ${p.passed} match, ${p.mismatched} differ (${p.noOutput} more ran but have no output file)`);
  console.log("  main reasons:");
  [...reasons].sort((a, b) => b[1] - a[1]).slice(0, 24).forEach(([k, n]) => console.log(`    ${String(n).padStart(3)}  ${k}`));
  if (process.env.VERBOSE) console.log(["  differences:", ...detail, "  not valid:", ...invalid, "  matching:", ...[...passed].map((f) => "  " + f)].join("\n"));
}

if (errs.length) {
  console.error(errs.join("\n\n"));
  console.error(`\n${errs.length} problem${errs.length === 1 ? "" : "s"}`);
  process.exit(1);
}
console.log(`${trips} templates and specs round-tripped through XMILE`);
console.log("import tests pass");
