import { SPECS, runSpec } from "@/lib/spec";

const r12 = (v: number) => +v.toPrecision(12);
export function goldenData() {
  return Object.fromEntries(
    Object.values(SPECS).map((spec) => [
      spec.key,
      [{ label: "Defaults", params: {} as Record<string, number> }, ...spec.presets].map(({ label, params }) => {
        const run = runSpec(spec, params);
        const every = Math.round(1 / spec.model.dt);
        const keep = (xs: number[]) => xs.filter((_, i) => i % every === 0).map(r12);
        return { label, params, times: keep(run.times), stocks: Object.fromEntries(Object.entries(run.stocks).map(([k, v]) => [k, keep(v)])) };
      }),
    ])
  );
}
