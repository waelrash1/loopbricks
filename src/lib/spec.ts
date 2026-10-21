// Shared model specifications: one JSON file per model, run by this app (through the builder engine) and by the
// Python package `loopbricks`, which ships the same files. scripts/check.ts proves both give the same numbers.
import { simulate, type BModel } from "@/lib/builder";
import { SPEC_FILES } from "@/lib/specIndex";

export type Spec = {
  format: "loopbricks-model";
  version: number;
  key: string;
  title: string;
  description: string;
  model: BModel;
  params: Record<string, { min: number; max: number; step: number }>; // keyed by var id; ids match the app molecule's param ids
  presets: { label: string; params: Record<string, number> }[];
};

export const SPECS: Record<string, Spec> = Object.fromEntries((SPEC_FILES as Spec[]).map((s) => [s.key, s]));

// the model with some constants replaced, ready to simulate
export function withParams(spec: Spec, params: Record<string, number> = {}, opts: { T?: number; dt?: number } = {}): BModel {
  const m: BModel = JSON.parse(JSON.stringify(spec.model));
  m.vars = m.vars.map((v) => (v.id in params ? { ...v, eq: String(params[v.id]) } : v));
  if (opts.T) m.T = opts.T;
  if (opts.dt) m.dt = opts.dt;
  return m;
}

// stock trajectories by stock id, one value per time step
export function runSpec(spec: Spec, params: Record<string, number> = {}, opts: { T?: number; dt?: number } = {}) {
  const m = withParams(spec, params, opts);
  const r = simulate(m, Number.MAX_SAFE_INTEGER);
  if (!r.ok) throw new Error(`${spec.key}: ${r.issues.map((i) => i.msg).join("; ")}`);
  return { times: r.times, stocks: Object.fromEntries(m.stocks.map((s) => [s.id, r.values[s.id]])) };
}
