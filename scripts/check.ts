// integrity + simulation smoke test over every molecule
import { MODELS, GROUPS } from "@/data/molecules";
import { FLOW_META, DIAGRAM_EXTRA } from "@/data/diagramMeta";
import { LESSONS } from "@/data/lessons";
import { PRESETS } from "@/data/presets";
import { LINEAGE } from "@/data/catalog";
import { lintCld } from "@/lib/cldGeometry";
import { stepOnce, freshState, initParams, DT } from "@/sim/engine";
import { HEALTH_MODELS, SIM_STOP, isBuilt } from "@/data/health/models";
import { CASES, REFS, PRACTICE } from "@/data/health/cases";
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
// healthcare library: every case points at real molecules, refs and a simulator its presets fit
if (new Set(CASES.map((c) => c.id)).size !== CASES.length) errs.push("duplicate healthcare case id");
PRACTICE.flatMap((p) => p.refs).forEach((r) => !REFS[r] && errs.push(`practice: unknown ref ${r}`));
for (const c of CASES) {
  c.molecules.forEach((k) => !MODELS[k] && errs.push(`case ${c.id}: unknown molecule ${k}`));
  c.refs.forEach((r) => !REFS[r] && errs.push(`case ${c.id}: unknown ref ${r}`));
  if (!c.sim) continue;
  const m = HEALTH_MODELS[c.sim];
  if (!m) { errs.push(`case ${c.id}: unknown simulator ${c.sim}`); continue; }
  const ids = new Set(m.params.map((p) => p.id));
  for (const pr of c.presets ?? []) {
    Object.entries(pr.params).forEach(([id, v]) => {
      const p = m.params.find((x) => x.id === id);
      if (!ids.has(id)) errs.push(`case ${c.id}: preset "${pr.label}" sets unknown ${id}`);
      else if (v < p!.min || v > p!.max) errs.push(`case ${c.id}: preset "${pr.label}" puts ${id}=${v} outside the slider`);
    });
    let s = freshState(m);
    const p = { ...initParams(m), ...pr.params };
    for (let i = 0; i < 120 / DT; i++) s = stepOnce(m, s, p, DT).state;
    if (Object.values(s).some((v) => !Number.isFinite(v))) errs.push(`case ${c.id}: non-finite state`);
  }
}
for (const [k, m] of Object.entries(HEALTH_MODELS)) {
  if (!SIM_STOP[k]) errs.push(`health model ${k}: no stop time`); // check: SIM_STOP
  m.diagram.flows.forEach((f) => !FLOW_META[k]?.[f.id] && errs.push(`health model ${k}: flow ${f.id} has no meta`));
  if (isBuilt(k)) lintCld(m.cld).forEach((e) => errs.push(`health model ${k}: causal loop diagram: ${e}`));
}
console.log(all.length, "molecules,", GROUPS.length, "groups,", CASES.length, "healthcare cases");
console.log([...new Set(errs)].join("\n") || "all checks pass");
