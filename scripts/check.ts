// integrity + simulation smoke test over every molecule
import { MODELS, GROUPS } from "@/data/molecules";
import { FLOW_META, DIAGRAM_EXTRA } from "@/data/diagramMeta";
import { LESSONS } from "@/data/lessons";
import { PRESETS } from "@/data/presets";
import { LINEAGE } from "@/data/catalog";
import { lintCld } from "@/lib/cldGeometry";
import { lintSf } from "@/lib/sfLint";
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
const nCases = DOMAINS.reduce((n, d) => n + d.cases.length, 0), nChecks = DOMAINS.reduce((n, d) => n + d.cases.reduce((m, c) => m + (c.checks?.length ?? 0), 0), 0);
console.log(all.length, "molecules,", GROUPS.length, "groups,", DOMAINS.length, "fields,", nCases, "cases,", nChecks, "behaviour checks");
console.log([...new Set(errs)].join("\n") || "all checks pass");
