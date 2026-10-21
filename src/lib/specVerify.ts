// Is a shared spec a faithful copy of its app molecule? Same stocks and starting values, same parameters with the
// same defaults and slider ranges, same presets, and the same stock values at every time step for the defaults,
// every preset and the lesson's preset. Used by scripts/check.ts and scripts/spec-verify.ts.
import { MODELS } from "@/data/molecules";
import { PRESETS } from "@/data/presets";
import { LESSONS } from "@/data/lessons";
import { DT, freshState, initParams, stepOnce } from "@/sim/engine";
import { runSpec, type Spec } from "@/lib/spec";

const T = 60; // time units compared, at the app's DT
const TOL = 1e-9; // relative difference allowed at any step

export function verifySpec(spec: Spec): string[] {
  const e: string[] = [];
  const m = MODELS[spec.key];
  if (!m) return [`no app molecule called "${spec.key}"`];
  if (spec.model.dt !== DT) e.push(`model.dt should be ${DT}, the app's time step`);

  const stocks = new Map(spec.model.stocks.map((s) => [s.id, s]));
  for (const st of m.stocks) {
    const s = stocks.get(st.id);
    if (!s) e.push(`missing stock "${st.id}"`);
    else {
      // a start worked out from the parameters is an expression in the spec; the trajectory checks below compare it
      const fromParams = !!m.initFrom && st.id in m.initFrom(initParams(m), {}, {});
      if (!fromParams && Number(s.init) !== st.init) e.push(`stock "${st.id}" starts at ${s.init}, the app at ${st.init}`);
      if (fromParams && /^[\d.]+$/.test(s.init)) e.push(`stock "${st.id}" starts from the parameters in the app, so the spec needs an expression, not ${s.init}`);
      if (!s.nonNegative) e.push(`stock "${st.id}" needs "nonNegative": true (the app floors every stock at zero)`);
    }
  }
  for (const id of stocks.keys()) if (!m.stocks.some((s) => s.id === id)) e.push(`stock "${id}" is not in the app molecule`);

  // the app always steps at DT = 0.1, so a literal "/ 0.1" matches it there but goes wrong at any other dt
  for (const x of [...spec.model.flows, ...spec.model.vars]) if (/\/\s*0?\.1(?![0-9])/.test(x.eq)) e.push(`"${x.name}" divides by 0.1: write DT so it holds at any time step`);
  const vars = new Map(spec.model.vars.map((v) => [v.id, v]));
  for (const p of m.params) {
    const v = vars.get(p.id);
    if (!v) e.push(`missing parameter variable "${p.id}"`);
    else if (Number(v.eq) !== p.value || !/^\s*[-−]?[\d.]+([eE][+-]?\d+)?\s*$/.test(v.eq)) e.push(`parameter "${p.id}" should be the number ${p.value}, not "${v.eq}"`);
    const r = spec.params[p.id];
    if (!r || r.min !== p.min || r.max !== p.max || r.step !== p.step) e.push(`params.${p.id} should be { min: ${p.min}, max: ${p.max}, step: ${p.step} }`);
  }
  for (const id of Object.keys(spec.params)) if (!m.params.some((p) => p.id === id)) e.push(`params.${id} is not an app parameter`);

  const want = (PRESETS[spec.key] ?? []).map((p) => JSON.stringify([p.label, p.params]));
  const got = spec.presets.map((p) => JSON.stringify([p.label, p.params]));
  if (JSON.stringify(want) !== JSON.stringify(got)) e.push(`presets differ from the app's: expected ${want.join(" ") || "none"}`);
  for (const pr of spec.presets) for (const k of Object.keys(pr.params)) if (!m.params.some((x) => x.id === k)) e.push(`preset "${pr.label}" sets "${k}", which is not a parameter of this molecule`);
  if (e.length) return e;

  const runs: [string, Record<string, number>][] = [["defaults", {}], ...(PRESETS[spec.key] ?? []).map((p) => [`preset "${p.label}"`, p.params] as [string, Record<string, number>])];
  if (LESSONS[spec.key]?.preset) runs.push(["lesson preset", LESSONS[spec.key].preset!]);
  for (const [label, params] of runs) {
    let run;
    try {
      run = runSpec(spec, params, { T, dt: DT });
    } catch (err) {
      e.push(`${label}: the spec does not run: ${(err as Error).message}`);
      continue;
    }
    const p = { ...initParams(m), ...params };
    let s = freshState(m, p);
    for (let i = 0; i < run.times.length; i++) {
      const bad = m.stocks.find((st) => Math.abs(run.stocks[st.id][i] - s[st.id]) > TOL * Math.max(1, Math.abs(s[st.id])));
      if (bad) {
        e.push(`${label}: stock "${bad.id}" at t = ${run.times[i]} is ${run.stocks[bad.id][i]}, the app has ${s[bad.id]}`);
        break;
      }
      s = stepOnce(m, s, p, DT).state;
    }
  }
  return e;
}
