import type { Model } from "@/data/molecules";

export const DT = 0.1;
export type Vars = Record<string, number>;
export type History = { times: number[]; series: number[][] };

export function freshState(m: Model, p: Vars = initParams(m)): Vars {
  const s: Vars = {};
  m.stocks.forEach((x) => (s[x.id] = x.init));
  return withDerived(m, m.initFrom ? { ...s, ...m.initFrom(p, s, m.rates(s, p)) } : s, p);
}
export function initParams(m: Model): Vars {
  const p: Vars = {};
  m.params.forEach((x) => (p[x.id] = x.value));
  return p;
}
export function freshHistory(m: Model): History {
  return { times: [], series: m.stocks.map(() => []) };
}

// derived series are auxiliaries shown on the chart: worked out from the state, never integrated
function withDerived(m: Model, s: Vars, p: Vars): Vars {
  const ds = m.stocks.filter((x) => x.derived);
  if (!ds.length) return s;
  const r = m.rates(s, p);
  ds.forEach((x) => (s[x.id] = x.derived!(s, p, r)));
  return s;
}

// One Euler step. Only stocks marked floor are held at zero, and clipped names those the floor caught this step:
// an outflow asked for more than the stock held, which a well-formed model avoids (see scripts/check.ts).
export function stepOnce(m: Model, s: Vars, p: Vars, dt: number) {
  const r = m.rates(s, p);
  const d = m.derivs(s, p, r);
  const ns: Vars = { ...s };
  const clipped: string[] = [];
  for (const x of m.stocks) {
    if (x.derived) continue;
    const v = s[x.id] + d[x.id] * dt;
    // ponytail: a shortfall within rounding (1e-9 of the stock) is not counted as a clip
    if (x.floor && v < -1e-9 * Math.max(1, Math.abs(s[x.id]))) clipped.push(x.id);
    ns[x.id] = x.floor ? Math.max(0, v) : v;
  }
  return { state: withDerived(m, ns, p), rates: r, clipped };
}

const MAXPTS = 600;
export function pushHistory(h: History, m: Model, s: Vars, t: number) {
  h.times.push(t);
  if (h.times.length > MAXPTS) h.times.shift();
  m.stocks.forEach((x, i) => {
    h.series[i].push(s[x.id]);
    if (h.series[i].length > MAXPTS) h.series[i].shift();
  });
}
