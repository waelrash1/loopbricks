import type { Model } from "@/data/molecules";

export const DT = 0.1;
export type Vars = Record<string, number>;
export type History = { times: number[]; series: number[][] };

export function freshState(m: Model): Vars {
  const s: Vars = {};
  m.stocks.forEach((x) => (s[x.id] = x.init));
  return s;
}
export function initParams(m: Model): Vars {
  const p: Vars = {};
  m.params.forEach((x) => (p[x.id] = x.value));
  return p;
}
export function freshHistory(m: Model): History {
  return { times: [], series: m.stocks.map(() => []) };
}

export function stepOnce(m: Model, s: Vars, p: Vars, dt: number) {
  const r = m.rates(s, p);
  const d = m.derivs(s, p, r);
  const ns: Vars = {};
  m.stocks.forEach((x) => (ns[x.id] = Math.max(0, s[x.id] + d[x.id] * dt)));
  return { state: ns, rates: r };
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
