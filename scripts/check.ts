// integrity + simulation smoke test over every molecule
import { MODELS, GROUPS } from "@/data/molecules";
import { FLOW_META, DIAGRAM_EXTRA } from "@/data/diagramMeta";
import { LESSONS } from "@/data/lessons";
import { PRESETS } from "@/data/presets";
import { LINEAGE } from "@/data/catalog";
import { lintCld } from "@/lib/cldGeometry";
import { stepOnce, freshState, initParams, DT } from "@/sim/engine";
import { DOMAINS, GUIDE, runnerFor } from "@/data/apps";
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
const nCases = DOMAINS.reduce((n, d) => n + d.cases.length, 0), nChecks = DOMAINS.reduce((n, d) => n + d.cases.reduce((m, c) => m + (c.checks?.length ?? 0), 0), 0);
console.log(all.length, "molecules,", GROUPS.length, "groups,", DOMAINS.length, "fields,", nCases, "cases,", nChecks, "behaviour checks");
console.log([...new Set(errs)].join("\n") || "all checks pass");
