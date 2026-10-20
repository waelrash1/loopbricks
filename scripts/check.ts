// integrity + simulation smoke test over every molecule
import { MODELS, GROUPS } from "@/data/molecules";
import { FLOW_META, DIAGRAM_EXTRA } from "@/data/diagramMeta";
import { LESSONS } from "@/data/lessons";
import { PRESETS } from "@/data/presets";
import { LINEAGE } from "@/data/catalog";
import { lintCld } from "@/lib/cldGeometry";
import { stepOnce, freshState, initParams, DT } from "@/sim/engine";
import { DOMAINS, GUIDE, runnerFor } from "@/data/apps";
import { calibrate, fitStats, simulateAt } from "@/lib/fit";
import { METHOD_PAGES, METHOD_REFS } from "@/data/methods";
import { CAL_DATA, CAL_FIXED, CAL_HOLDOUT, CAL_MODEL, CAL_TRUTH, calFit, calRef, monteCarlo, overshoots } from "@/lib/labs";
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
  const half = calibrate(CAL_MODEL, { ...CAL_FIXED, adj: 9, slw: 0.9 }, ["adj", "slw"], [calRef(CAL_DATA.filter(([t]) => t <= CAL_HOLDOUT))]);
  const g = { adj: half.params.adj, slw: half.params.slw };
  // right structure: held-back error stays near the noise; wrong structure (supply line ignored): it jumps
  if (calFit(g, CAL_HOLDOUT + 0.01, 40).rmse > 1.5 * calFit(g, 0, CAL_HOLDOUT).rmse) errs.push("calibration lab: with the right structure, held-back error should stay near in-sample error");
  const wrong = calibrate(CAL_MODEL, { ...CAL_FIXED, adj: 9, slw: 0 }, ["adj"], [calRef(CAL_DATA.filter(([t]) => t <= CAL_HOLDOUT))]);
  const gw = { adj: wrong.params.adj, slw: 0 };
  if (!(calFit(gw, CAL_HOLDOUT + 0.01, 40).rmse > 3 * calFit(gw, 0, CAL_HOLDOUT).rmse)) errs.push("calibration lab: the wrong structure should fail badly on held-back data");
  const pol = monteCarlo("stockmgmt", { slw: 0.5, acq: 6 }, ["slw", "acq"], 1, "inv", 80, 100, 5).runs;
  const cost = (ys: number[]) => ys.reduce((t, y) => t + Math.abs(y - 100), 0) / ys.length;
  const one = (p: Record<string, number>) => monteCarlo("stockmgmt", p, [], 0, "inv", 80, 1).runs[0].ys;
  if (!pol.every((w) => cost(one({ ...w.params, slw: 1 })) <= cost(one({ ...w.params, slw: 0 })))) errs.push("sensitivity lab: counting the supply line should never hurt");
  const shares = monteCarlo("stockmgmt", { slw: 0.5, acq: 6, adj: 4 }, ["slw", "acq", "adj"], 1, "inv", 80, 200, 13).runs.filter((r) => overshoots(r.ys)).length / 200;
  if (shares < 0.05 || shares > 0.95) errs.push(`sensitivity lab: behaviour-mode experiment should mix modes, got ${shares}`);
}
const nCases = DOMAINS.reduce((n, d) => n + d.cases.length, 0), nChecks = DOMAINS.reduce((n, d) => n + d.cases.reduce((m, c) => m + (c.checks?.length ?? 0), 0), 0);
console.log(all.length, "molecules,", GROUPS.length, "groups,", DOMAINS.length, "fields,", nCases, "cases,", nChecks, "behaviour checks");
console.log([...new Set(errs)].join("\n") || "all checks pass");
