// integrity + simulation smoke test over every molecule
import { MODELS, GROUPS } from "@/data/molecules";
import { FLOW_META, DIAGRAM_EXTRA } from "@/data/diagramMeta";
import { LESSONS } from "@/data/lessons";
import { PRESETS } from "@/data/presets";
import { LINEAGE } from "@/data/catalog";
import { lintCld } from "@/lib/cldGeometry";
import { lintSf } from "@/lib/sfLint";
import { SPECS, runSpec } from "@/lib/spec";
import { goldenData } from "@/lib/golden";
import { readFileSync } from "node:fs";
import { stepOnce, freshState, initParams, DT } from "@/sim/engine";
import { DOMAINS, GUIDE, runnerFor } from "@/data/apps";
import { calibrate, fitStats, simulateAt } from "@/lib/fit";
import { METHOD_PAGES, METHOD_REFS } from "@/data/methods";
import { BOOK_TOC } from "@/data/sterman";
import { MODULES } from "@/data/learn/modules";
import { ARCHETYPES } from "@/data/learn/archetypes";
import { OBJECTIVES, QUIZ } from "@/data/learn/quiz";
import { STEPS } from "@/data/learn/steps";
import { MODULE_CONTENT } from "@/data/learn";
import { sampleModel } from "@/data/apps/sim";
import { CAL_DATA, CAL_FIXED, CAL_MODEL, CAL_TRUTH, calHoldout, calRef, monteCarlo, overshoots, policyTest } from "@/lib/labs";
import { beerCost, beerPeak, beerRun, fireRun, fireScore, fishProfit, fishRun, goodOrder } from "@/lib/games";
const errs: string[] = [];
const keys = GROUPS.flatMap((g) => g.keys);
const all = Object.keys(MODELS);
if (new Set(keys).size !== keys.length) errs.push("duplicate key in GROUPS");
all.filter((k) => !keys.includes(k)).forEach((k) => errs.push(`${k}: not in any group`));
keys.filter((k) => !MODELS[k]).forEach((k) => errs.push(`${k}: in GROUPS but no model`));
for (const k of all) {
  const m = MODELS[k];
  if (!LESSONS[k]) errs.push(`${k}: no lesson`);
  if (!FLOW_META[k]) errs.push(`${k}: no flow meta`);
  if (!DIAGRAM_EXTRA[k]) errs.push(`${k}: no equations`);
  if (!(k in LINEAGE)) errs.push(`${k}: no lineage`);
  (LINEAGE[k] ?? []).forEach((p) => !MODELS[p] && errs.push(`${k}: unknown parent ${p}`));
  m.diagram.flows.forEach((f) => !FLOW_META[k]?.[f.id] && errs.push(`${k}: flow ${f.id} has no meta`));
  lintCld(m.cld).forEach((e) => errs.push(`${k}: causal loop diagram: ${e}`));
  const runs = [initParams(m), ...(PRESETS[k] ?? []).map((p) => ({ ...initParams(m), ...p.params })), { ...initParams(m), ...(LESSONS[k]?.preset ?? {}) }];
  for (const p of runs) {
    let s = freshState(m);
    for (let i = 0; i < 60 / DT; i++) {
      const r = stepOnce(m, s, p, DT);
      s = r.state;
      m.diagram.flows.forEach((f) => !Number.isFinite(r.rates[f.id]) && errs.push(`${k}: rate ${f.id} not finite`));
      if (Object.values(s).some((v) => !Number.isFinite(v))) { errs.push(`${k}: non-finite state`); break; }
    }
  }
}
// application library: every case points at real molecules and refs, carries a validation note,
// and every runnable case passes its own behaviour checks
const refText: Record<string, string> = {};
for (const d of DOMAINS) {
  Object.entries(d.refs).forEach(([k, r]) => {
    if (refText[k] && refText[k] !== r.text) errs.push(`${d.id}: ref key ${k} is used by another field for a different work`);
    refText[k] = r.text;
    if (!/\(\d{4}\)/.test(r.text)) errs.push(`${d.id}: ref ${k} has no (year)`);
  });
  if (new Set(d.cases.map((c) => c.id)).size !== d.cases.length) errs.push(`${d.id}: duplicate case id`);
  for (const c of d.cases) {
    const id = `${d.id}/${c.id}`;
    if (!d.themes.includes(c.theme)) errs.push(`${id}: theme "${c.theme}" is not one of the field's themes`);
    c.molecules.forEach((k) => !MODELS[k] && errs.push(`${id}: unknown molecule ${k}`));
    c.refs.forEach((r) => !d.refs[r] && errs.push(`${id}: ref ${r} is not in the field's refs`));
    if (!c.refs.length) errs.push(`${id}: no references`);
    if (!c.validation) errs.push(`${id}: no validation note`);
    if (!c.sim) continue;
    const m = d.models[c.sim];
    if (!m) { errs.push(`${id}: unknown simulator ${c.sim}`); continue; }
    if (!d.stop[c.sim]) errs.push(`${id}: no stop time for ${c.sim}`);
    if ((c.checks?.length ?? 0) < 2) errs.push(`${id}: a runnable case needs at least two behaviour checks`);
    for (const pr of c.presets ?? []) {
      Object.entries(pr.params).forEach(([pid, v]) => {
        const p = m.params.find((x) => x.id === pid);
        if (!p) errs.push(`${id}: preset "${pr.label}" sets unknown ${pid}`);
        else if (v < p.min || v > p.max) errs.push(`${id}: preset "${pr.label}" puts ${pid}=${v} outside the slider`);
      });
      let st = freshState(m);
      const pp = { ...initParams(m), ...pr.params };
      for (let i = 0; i < (d.stop[c.sim] * 2) / DT; i++) st = stepOnce(m, st, pp, DT).state;
      if (Object.values(st).some((v) => !Number.isFinite(v))) errs.push(`${id}: preset "${pr.label}" goes non-finite`);
    }
    const run = runnerFor(d, c);
    for (const k of c.checks ?? []) {
      let ok = false;
      try { ok = k.test(run); } catch (e) { errs.push(`${id}: check throws: ${k.claim}: ${e}`); }
      if (!ok) errs.push(`${id}: check fails: ${k.claim}`);
    }
  }
  for (const [k, m] of Object.entries(d.models)) {
    m.diagram.flows.forEach((f) => !FLOW_META[k]?.[f.id] && errs.push(`${d.id} model ${k}: flow ${f.id} has no meta`));
    lintCld(m.cld).forEach((e) => errs.push(`${d.id} model ${k}: causal loop diagram: ${e}`));
  }
}
GUIDE.flatMap((p) => p.refs).forEach((r) => !refText[r] && errs.push(`guide: unknown ref ${r}`));
// fit statistics and calibration: exact cases with known answers
{
  const obs = [1, 3, 2, 5, 4, 6];
  const same = fitStats(obs, obs)!;
  if (same.rmse !== 0 || Math.abs(same.r2 - 1) > 1e-12) errs.push("fit: identical series should have zero error and R² 1");
  const shifted = fitStats(obs.map((x) => x + 2), obs)!;
  if (Math.abs(shifted.rmse - 2) > 1e-12 || Math.abs(shifted.um - 1) > 1e-9) errs.push("fit: a constant offset is all bias (Um = 1)");
  const any = fitStats([2, 1, 4, 3, 7, 5], obs)!;
  if (Math.abs(any.um + any.us + any.uc - 1) > 1e-9) errs.push("fit: Theil shares must sum to 1");
  // recover a decay time of 9 from data made with it, starting the search at 5
  const m = MODELS.decay;
  const truth = { id: "t", name: "truth", stock: "q", visible: true, points: [] as [number, number][] };
  const ts = [0, 2, 4, 6, 8, 10, 15, 20];
  const made = simulateAt(m, { tau: 9 }, [{ ...truth, points: ts.map((t) => [t, 0] as [number, number]) }]).t;
  truth.points = ts.map((t, i) => [t, made[i]]);
  const cal = calibrate(m, { tau: 5 }, ["tau"], [truth]);
  if (Math.abs(cal.params.tau - 9) > 0.3) errs.push(`calibrate: expected decay time near 9, got ${cal.params.tau}`);
}
for (const p of METHOD_PAGES) {
  [...p.refs, ...p.sections.flatMap((x) => x.cite ?? [])].forEach((k) => !METHOD_REFS[k] && errs.push(`methods/${p.id}: unknown ref ${k}`));
  if (p.tryIt && !/^\/(m|apps|tree|tour|methods)\//.test(p.tryIt.hash)) errs.push(`methods/${p.id}: try-it link ${p.tryIt.hash} is not an app route`);
}
// the labs teach claims that must stay true
{
  const cal = calibrate(CAL_MODEL, { ...CAL_FIXED, adj: 9, slw: 0.9 }, ["adj", "slw"], [calRef(CAL_DATA)]);
  if (Math.abs(cal.params.adj - CAL_TRUTH.adj) > 0.5 || Math.abs(cal.params.slw - CAL_TRUTH.slw) > 0.051) errs.push(`calibration lab: search ends at ${cal.params.adj}, ${cal.params.slw}, not near the hidden ${CAL_TRUTH.adj}, ${CAL_TRUTH.slw}`);
  if (cal.trace.length !== cal.evals) errs.push("calibration lab: the trace must record every evaluation");
  // hold-out test: the right structure keeps fitting the held-back weeks; the wrong one (weight on the
  // supply line it sees but not on the pipeline it wants) fits the early weeks nearly as well, then fails
  const right = calHoldout(), wrong = calHoldout(true);
  if (right.outErr > 1.5 * right.inErr) errs.push("calibration lab: with the right structure, held-back error should stay near in-sample error");
  if (!(wrong.inErr < 1.5 * right.inErr)) errs.push("calibration lab: the wrong structure should fit the early weeks nearly as well as the right one");
  if (!(wrong.outErr > 3 * wrong.inErr && wrong.outErr > 5 * right.outErr)) errs.push("calibration lab: the wrong structure should fail badly on held-back data");
  // policy sensitivity, scored by the glut: counting the supply line never adds overshoot; reacting faster
  // helps far more often where managers count at least half of it
  const pol = policyTest(100);
  if (pol.pipeline !== 1) errs.push("sensitivity lab: counting the supply line should never add to the glut");
  if (!(pol.fasterHi > 2 * pol.fasterLo && pol.fasterHi - pol.fasterLo > 0.2)) errs.push("sensitivity lab: whether reacting faster helps should depend on the weight on the supply line");
  if (!(pol.fasterGap > 0.9 && pol.pipelineGap < 0.9)) errs.push("sensitivity lab: on the average-gap score the ranking of the two policies should flip, as the lab says");
  const shares = monteCarlo("stockmgmt", { slw: 0.5, acq: 6, adj: 4 }, ["slw", "acq", "adj"], 1, "inv", 80, 200, 13).runs.filter((r) => overshoots(r.ys)).length / 200;
  if (shares < 0.05 || shares > 0.95) errs.push(`sensitivity lab: behaviour-mode experiment should mix modes, got ${shares}`);
}
// study guide: every written chapter is substantial, its diagrams readable and its links real
const ROUTE = /^\/(m\/[A-Za-z]+|apps\/[a-z-]+\/[a-z0-9-]+|apps\/[a-z-]+|tree(\/[A-Za-z]+)?|methods\/[a-z-]+|learn(\/[a-z-]+)?|tour\/\d+)$/;
for (const t of BOOK_TOC) {
  const c = t.chapter;
  if (!c) continue;
  const id = `book/${t.id}`;
  if (c.id !== t.id) errs.push(`${id}: id field says ${c.id}`);
  if (c.bigIdeas.length < 6) errs.push(`${id}: needs at least 6 big ideas`);
  if (c.diagrams.length < 2) errs.push(`${id}: needs at least 2 diagrams`);
  if (c.exercises.length < 4) errs.push(`${id}: needs at least 4 exercises`);
  if (c.pitfalls.length < 3) errs.push(`${id}: needs at least 3 pitfalls`);
  if (new Set(c.diagrams.map((d) => d.title)).size !== c.diagrams.length) errs.push(`${id}: diagram titles must be unique`);
  c.molecules.forEach((k) => !MODELS[k] && errs.push(`${id}: unknown molecule ${k}`));
  c.formulations.forEach((f) => f.molecule && !MODELS[f.molecule] && errs.push(`${id}: formulation ${f.name} names unknown molecule ${f.molecule}`));
  c.exercises.forEach((x) => x.link && !ROUTE.test(x.link.hash) && errs.push(`${id}: exercise link ${x.link.hash} is not an app route`));
  c.exercises.forEach((x) => { const m = x.link?.hash.match(/^\/m\/(\w+)/); if (m && !MODELS[m[1]]) errs.push(`${id}: exercise links unknown molecule ${m[1]}`); });
  c.diagrams.forEach((d) => {
    if (d.kind === "cld") lintCld(d.cld).forEach((e) => errs.push(`${id} diagram "${d.title}": ${e}`));
    if (d.kind === "sf") lintSf(d).forEach((e) => errs.push(`${id} diagram "${d.title}": ${e}`));
    if (d.kind === "cycle" && (d.nodes.length < 3 || d.nodes.length > 8)) errs.push(`${id} diagram "${d.title}": a cycle needs 3 to 8 nodes`);
    if (d.kind === "cycle" && d.nodes.some((n) => n.length > 44)) errs.push(`${id} diagram "${d.title}": cycle labels must be 44 characters or fewer`);
    if (d.kind === "sequence" && (d.steps.length < 2 || d.steps.length > 8)) errs.push(`${id} diagram "${d.title}": a sequence needs 2 to 8 steps`);
  });
  const text = JSON.stringify(c);
  if (/\u2014/.test(text) || text.includes("\u2014") || text.includes("—")) errs.push(`${id}: no em dashes in study-guide text`);
}
// curriculum: modules draw on real notes; archetypes are readable; quizzes are well formed
{
  const ids = new Set(MODULES.map((m) => m.id));
  if (ids.size !== MODULES.length) errs.push("learn: duplicate module id");
  for (const m of MODULES) {
    m.from.forEach((f) => !BOOK_TOC.find((t) => t.id === f)?.chapter && errs.push(`learn/${m.id}: draws on missing notes ${f}`));
    m.prereqs.forEach((p) => !ids.has(p) && errs.push(`learn/${m.id}: unknown prerequisite ${p}`));
    m.deeper?.forEach((d) => !ROUTE.test(d.hash) && errs.push(`learn/${m.id}: link ${d.hash} is not an app route`));
    const q = QUIZ[m.id];
    if (q) q.forEach((x, i) => (x.answer < 0 || x.answer >= x.options.length) && errs.push(`learn/${m.id}: quiz ${i + 1} answer out of range`));
    if (Object.keys(QUIZ).length && (!q || q.length < 3)) errs.push(`learn/${m.id}: needs at least 3 quiz questions`);
    if (Object.keys(OBJECTIVES).length && !(OBJECTIVES[m.id]?.length >= 3)) errs.push(`learn/${m.id}: needs at least 3 objectives`);
  }
  for (const a of ARCHETYPES) {
    lintCld(a.cld).forEach((e) => errs.push(`learn/archetype ${a.id}: ${e}`));
    a.molecules.forEach((k) => !MODELS[k] && errs.push(`learn/archetype ${a.id}: unknown molecule ${k}`));
    a.cases.forEach((c) => !ROUTE.test(c.hash) && errs.push(`learn/archetype ${a.id}: link ${c.hash} is not an app route`));
  }
  // steps: every idea once, every diagram and equation once, every reference resolves, runs stay finite
  for (const c of MODULE_CONTENT) {
    const steps = STEPS[c.def.id];
    if (!steps) continue;
    const tag = `learn/${c.def.id} steps`;
    const once = (kind: string, all: string[], used: (string | undefined)[]) => {
      const u = used.filter(Boolean) as string[];
      u.forEach((x) => !all.includes(x) && errs.push(`${tag}: unknown ${kind} "${x}"`));
      all.forEach((x) => { const n = u.filter((y) => y === x).length; if (n !== 1) errs.push(`${tag}: ${kind} "${x}" used ${n} times`); });
    };
    once("idea", c.bigIdeas.map((b) => b.title), steps.flatMap((s) => s.ideas));
    once("diagram", c.diagrams.map((d) => d.title), steps.map((s) => s.diagram));
    once("equation", c.formulations.map((f) => f.name), steps.map((s) => s.formulation));
    if (c.def.id === "archetypes") once("archetype", ARCHETYPES.map((a) => a.id), steps.map((s) => s.archetype));
    for (const s of steps) {
      if (s.example && !c.examples.some((x) => x.title === s.example)) errs.push(`${tag}: unknown example "${s.example}"`);
      s.exercises?.forEach((k) => !c.exercises[k] && errs.push(`${tag}: no exercise ${k}`));
      if (s.run) {
        const m = MODELS[s.run.molecule];
        if (!m) { errs.push(`${tag}: unknown molecule ${s.run.molecule}`); continue; }
        Object.entries(s.run.params ?? {}).forEach(([k, v]) => {
          const d = m.params.find((x) => x.id === k);
          if (!d || v < d.min || v > d.max) errs.push(`${tag} "${s.title}": param ${k}=${v} outside the slider`);
        });
        if (sampleModel(m, s.run.params ?? {}, s.run.T, 20).flat().some((v) => !Number.isFinite(v))) errs.push(`${tag} "${s.title}": run is not finite`);
      }
    }
  }
  const text = JSON.stringify([ARCHETYPES, QUIZ, OBJECTIVES, MODULES, STEPS]);
  if (text.includes("—")) errs.push("learn: no em dashes");
  // the notes must stand alone, not point into a book's chapters
  for (const t of BOOK_TOC) {
    const body = JSON.stringify(t.chapter ?? {});
    if (/\b(this|the) chapter\b|\bchapter \d/i.test(body)) errs.push(`learn notes ${t.id}: refers to a book chapter`);
  }
}
// decision games: the engines must behave as the debriefs say
{
  const comp = beerRun(), good = beerRun(goodOrder);
  if (!(beerPeak(comp, 3) > beerPeak(comp, 0))) errs.push("games/beer: computer chain does not amplify orders upstream");
  if (!(beerCost(good) < beerCost(comp))) errs.push("games/beer: good policy does not cost less than the computer chain");
  if (beerCost(beerRun(undefined, 2, comp.hist.orders[2])) !== beerCost(comp)) errs.push("games/beer: replaying the computer's orders changes the result");
  const open = fishRun(0), limit = fishRun(8), held = fishRun(0, false, []);
  if (!(open.hist.res[30] < 25 && limit.hist.res[30] > 60)) errs.push("games/fishery: catch limit does not protect the stock");
  if (!(fishProfit(held).a > fishProfit(held).b)) errs.push("games/fishery: a restrained Fleet A should out-earn expanding Fleet B");
  const lo = fireRun(0.2), hi = fireRun(0.8);
  if (!(hi.hist.prob[8] < lo.hist.prob[8] && hi.hist.prob[104] > lo.hist.prob[104] && fireScore(hi) > fireScore(lo))) errs.push("games/firefighting: no better before worse");
}
// model builder: the expression engine and the starter templates
import { compile as exprCompile, tryCompile as exprTry } from "@/lib/expr";
import { TEMPLATES, simulate as bSimulate, template as bTemplate, validate as bValidate } from "@/lib/builder";
{
  const ev = (s: string, sc: Record<string, number> = {}) => exprCompile(s).eval({ TIME: 0, DT: 1, ...sc });
  const cases: [string, number, Record<string, number>?][] = [
    ["1 + 2 * 3", 7], ["(1 + 2) * 3", 9], ["2 ^ 3 ^ 2", 512], ["-2 ^ 2", -4], ["2 ^ -1", 0.5], ["10 − 4 − 3", 3], ["8 / 4 / 2", 1], ["3 × 4", 12], ["1 + 2 < 4", 1],
    ["2 <> 2", 0], ["3 >= 3", 1], ["MIN(3, 1, 2) + max(1, 5)", 6], ["ABS(-2) + SQRT(9) + LN(EXP(2))", 7], ["IF(a > 1, 10, 1 / 0)", 10, { a: 2 }],
    ["STEP(5, 10)", 0, { TIME: 9.75 }], ["STEP(5, 10)", 5, { TIME: 10 }], ["PULSE(4, 2, 1)", 4, { TIME: 2.5 }], ["PULSE(4, 2, 1)", 0, { TIME: 3 }], ["RAMP(2, 5)", 6, { TIME: 8 }],
    ["TIME * 2", 6, { TIME: 3 }], ['"Birth fraction" * Population', 30, { birth_fraction: 0.03, population: 1000 }],
  ];
  for (const [src, want, sc] of cases) {
    const got = ev(src, sc);
    if (Math.abs(got - want) > 1e-9) errs.push(`expr: ${src} gave ${got}, expected ${want}`);
  }
  if (exprCompile("a * b + A").refs.join() !== "a,b") errs.push("expr: references should be a,b");
  for (const [src, hint] of [["1 +", "character 4"], ["(1 + 2", 'Missing ")"'], ["1 + 2)", 'Unexpected ")"'], ["FOO(1)", "Unknown function"], ["MIN(1)", "at least 2"], ["2 $ 3", 'Unexpected character "$"'], ["", "empty"]]) {
    const r = exprTry(src);
    if (r.ok || !r.error.message.includes(hint)) errs.push(`expr: "${src}" should fail with "${hint}", got ${r.ok ? "no error" : r.error.message}`);
  }
  try {
    ev("x + 1");
    errs.push("expr: an unknown name should throw");
  } catch (e) {
    if (!String(e).includes('Unknown name "x"')) errs.push(`expr: unknown name message: ${e}`);
  }
  // every template is clean, runs, and gives the textbook behaviour
  for (const t of TEMPLATES) {
    bValidate(bTemplate(t.id)).issues.forEach((i) => errs.push(`builder ${t.id}: ${i.msg}`));
    const r = bSimulate(bTemplate(t.id));
    if (!r.ok) errs.push(`builder ${t.id}: run failed: ${r.issues.map((i) => i.msg).join("; ")}`);
  }
  const at = (id: string, r: ReturnType<typeof bSimulate>, t: number) => r.values[id][r.times.findIndex((x) => x >= t - 1e-9)];
  const end = (id: string, r: ReturnType<typeof bSimulate>) => r.values[id][r.values[id].length - 1];
  const bath = bSimulate(bTemplate("bathtub"));
  if (Math.abs(end("s1", bath) - 50) > 0.5 || bath.values.s1.some((v, i, a) => i > 0 && v < a[i - 1])) errs.push("builder bathtub: water should rise steadily to 50 litres");
  const pop = bSimulate(bTemplate("population"));
  if (Math.abs(end("s1", pop) / (1000 * Math.exp(2)) - 1) > 0.01 || Math.abs(at("s1", pop, 34.75) / 2000 - 1) > 0.02) errs.push("builder population: should grow exponentially, doubling in about 35 years");
  const sm = bSimulate(bTemplate("stock-management"));
  const inv = sm.values.s2, ord = sm.values.f1;
  if (at("s2", sm, 10) !== 100 || Math.min(...inv) > 90 || Math.abs(end("s2", sm) - 100) > 1 || Math.max(...ord) < 16 || Math.abs(end("s1", sm) - 90) > 1)
    errs.push(`builder stock management: expected a dip, recovery to 100 and amplified orders (min ${Math.min(...inv).toFixed(1)}, end ${end("s2", sm).toFixed(1)}, peak orders ${Math.max(...ord).toFixed(1)})`);
  // the checks catch what learners get wrong
  const bad = bTemplate("bathtub");
  bad.vars.push({ id: "v8", name: "a", eq: "b + 1", x: 0, y: 0 }, { id: "v9", name: "b", eq: "a", x: 0, y: 0 }, { id: "v7", name: "Water", eq: "1", x: 0, y: 0 });
  bad.flows.push({ id: "f9", name: "leak", eq: "drian_time", x: 0, y: 0 });
  const msgs = bValidate(bad).issues.map((i) => `${i.id}: ${i.msg}`).join("\n");
  for (const want of ["v8: Circular", "v9: Circular", "v7: Another element", "s1: Another element", "f9: Connect it", "Did you mean Drain_time?"]) if (!msgs.includes(want)) errs.push(`builder validation: missing "${want}"`);
  const zero = bTemplate("bathtub");
  zero.vars[0].eq = "0";
  const zr = bSimulate(zero);
  if (zr.ok || zr.issues[0]?.id !== "f2") errs.push("builder: a division by zero should stop the run and blame the drain");
}
// shared specs: each must reproduce its app molecule step for step, and the Python reference file must be current
for (const spec of Object.values(SPECS)) {
  const m = MODELS[spec.key];
  if (!m) { errs.push(`spec ${spec.key}: no molecule of that name`); continue; }
  for (const { label, params } of [{ label: "defaults", params: {} as Record<string, number> }, ...spec.presets]) {
    const run = runSpec(spec, params);
    const p = { ...initParams(m), ...params };
    let st = freshState(m), worst = 0;
    run.times.forEach((_, i) => {
      for (const id of Object.keys(run.stocks)) worst = Math.max(worst, Math.abs(run.stocks[id][i] - st[id]) / Math.max(1, Math.abs(st[id])));
      st = stepOnce(m, st, p, DT).state;
    });
    if (worst > 1e-9) errs.push(`spec ${spec.key} (${label}): differs from the app molecule by ${worst.toExponential(2)}`);
  }
}
try {
  const onDisk = readFileSync("python/tests/golden.json", "utf8");
  if (onDisk !== JSON.stringify(goldenData(), null, 1) + "\n") errs.push("python/tests/golden.json is out of date: run npm run golden");
} catch {
  errs.push("python/tests/golden.json is missing: run npm run golden");
}
const nCases = DOMAINS.reduce((n, d) => n + d.cases.length, 0), nChecks = DOMAINS.reduce((n, d) => n + d.cases.reduce((m, c) => m + (c.checks?.length ?? 0), 0), 0);
console.log(all.length, "molecules,", GROUPS.length, "groups,", DOMAINS.length, "fields,", nCases, "cases,", nChecks, "behaviour checks");
console.log([...new Set(errs)].join("\n") || "all checks pass");
