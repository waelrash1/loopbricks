// Helpers shared by every domain: dress a molecule in domain names, register purpose-built models,
// and run a model headlessly for the behaviour checks.
import { MODELS, type Model, type Param, type Stock } from "@/data/molecules";
import { DIAGRAM_EXTRA, FLOW_META, type FlowMeta } from "@/data/diagramMeta";
import { DT, freshState, initParams, stepOnce } from "@/sim/engine";
import type { RunResult } from "@/data/apps/types";

// A molecule under domain names. Flow entries are [name, equation in the case's words].
export type Skin = {
  base: string;
  name: string;
  title?: string;
  timeUnit?: string;
  unitY?: string;
  stocks?: Record<string, Partial<Stock>>;
  params?: Record<string, Partial<Param>>;
  flows?: Record<string, [string, string]>;
};

export const SKIN_BASE: Record<string, string> = {};
export const isBuilt = (key: string) => !(key in SKIN_BASE);

export function skin(key: string, s: Skin): Model {
  const b = MODELS[s.base];
  if (!b) throw new Error(`skin ${key}: unknown molecule ${s.base}`);
  if (FLOW_META[key] && SKIN_BASE[key] !== s.base) throw new Error(`model key ${key} is already taken`);
  SKIN_BASE[key] = s.base;
  // ponytail: registers the renamed flows in the shared tables so the diagram and equations panel work unchanged
  FLOW_META[key] = Object.fromEntries(Object.entries(FLOW_META[s.base]).map(([id, f]) => [id, s.flows?.[id] ? { ...f, name: s.flows[id][0], eq: s.flows[id][1] } : f]));
  return {
    ...b,
    name: s.name,
    title: s.title ?? s.name,
    timeUnit: s.timeUnit ?? b.timeUnit,
    unitY: s.unitY ?? b.unitY,
    stocks: b.stocks.map((x) => ({ ...x, ...s.stocks?.[x.id] })),
    params: b.params.map((x) => ({ ...x, ...s.params?.[x.id] })),
  };
}
export const skins = (all: Record<string, Skin>) => Object.fromEntries(Object.entries(all).map(([k, s]) => [k, skin(k, s)]));

// A purpose-built model: its diagram labels and equations go into the shared tables.
export function built(key: string, model: Model, flows: Record<string, FlowMeta>, equations: { stocks: [string, string][]; aux?: [string, string][] }): Model {
  if (FLOW_META[key]) throw new Error(`model key ${key} is already taken`);
  FLOW_META[key] = flows;
  DIAGRAM_EXTRA[key] = equations;
  return model;
}

export function runModel(m: Model, params: Record<string, number>, T: number): RunResult {
  let s = freshState(m);
  const p = { ...initParams(m), ...params };
  const r: RunResult = { end: s, max: { ...s }, min: { ...s }, tMax: Object.fromEntries(Object.keys(s).map((k) => [k, 0])) };
  for (let i = 1; i <= Math.round(T / DT); i++) {
    s = stepOnce(m, s, p, DT).state;
    for (const k in s) {
      if (s[k] > r.max[k]) (r.max[k] = s[k]), (r.tMax[k] = i * DT);
      if (s[k] < r.min[k]) r.min[k] = s[k];
    }
  }
  r.end = s;
  return r;
}
