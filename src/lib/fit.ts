// How well a simulated series matches observed data, and a small optimiser that tunes parameters to fit it.
// The statistics follow the usual system dynamics practice (Sterman 1984): report the error size and
// decompose the mean squared error into bias (Um), unequal variation (Us) and unequal covariation (Uc).
import type { Model } from "@/data/molecules";
import { DT, freshState, initParams, stepOnce } from "@/sim/engine";
import type { RefData } from "@/lib/runs";

export type Fit = { n: number; rmse: number; mape: number | null; r2: number; um: number; us: number; uc: number };

export function fitStats(sim: number[], obs: number[]): Fit | null {
  const n = Math.min(sim.length, obs.length);
  if (n < 2) return null;
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const s = sim.slice(0, n), a = obs.slice(0, n);
  const ms = mean(s), ma = mean(a);
  const ss = Math.sqrt(mean(s.map((x) => (x - ms) ** 2))), sa = Math.sqrt(mean(a.map((x) => (x - ma) ** 2)));
  const cov = mean(s.map((x, i) => (x - ms) * (a[i] - ma)));
  const r = ss > 0 && sa > 0 ? cov / (ss * sa) : 0;
  const mse = mean(s.map((x, i) => (x - a[i]) ** 2));
  const nz = a.map((x, i) => [x, s[i]]).filter(([x]) => Math.abs(x) > 1e-12);
  const mape = nz.length ? mean(nz.map(([x, y]) => Math.abs(y - x) / Math.abs(x))) : null;
  // MSE = (ms − ma)² + (ss − sa)² + 2(1 − r)·ss·sa, so the three shares sum to 1
  const share = (v: number) => (mse > 0 ? v / mse : 0);
  return { n, rmse: Math.sqrt(mse), mape, r2: r * r, um: share((ms - ma) ** 2), us: share((ss - sa) ** 2), uc: share(2 * (1 - r) * ss * sa) };
}

// simulate once and read each reference stock at its data times
export function simulateAt(m: Model, params: Record<string, number>, refs: RefData[]): Record<string, number[]> {
  const T = Math.max(...refs.flatMap((r) => r.points.map((p) => p[0])));
  const want = refs.map((r) => ({ r, i: 0, out: [] as number[] }));
  let s = freshState(m), t = 0;
  const p = { ...initParams(m), ...params };
  const take = () =>
    want.forEach((w) => {
      while (w.i < w.r.points.length && w.r.points[w.i][0] <= t + DT / 2) (w.out.push(s[w.r.stock]), w.i++);
    });
  take();
  while (t < T + DT / 2) {
    s = stepOnce(m, s, p, DT).state;
    t += DT;
    take();
  }
  return Object.fromEntries(want.map((w) => [w.r.id, w.out]));
}

// sum of squared errors over every reference set, each scaled by its own spread so stocks of different size count equally
export function objective(m: Model, params: Record<string, number>, refs: RefData[]) {
  const got = simulateAt(m, params, refs);
  return refs.reduce((tot, r) => {
    const obs = r.points.map((p) => p[1]);
    const scale = Math.max(1e-9, Math.max(...obs) - Math.min(...obs), Math.abs(obs[0]));
    return tot + got[r.id].reduce((e, v, i) => e + ((v - obs[i]) / scale) ** 2, 0);
  }, 0);
}

// Nelder–Mead in the unit box of the chosen sliders: small, derivative-free and good enough for a handful of parameters.
// ponytail: local search from the current settings; for many parameters or noisy fits, restart from several points or use MCMC.
export function calibrate(m: Model, start: Record<string, number>, ids: string[], refs: RefData[], maxEval = 400) {
  const box = ids.map((id) => m.params.find((p) => p.id === id)!);
  const toParams = (u: number[]) => {
    const out = { ...start };
    u.forEach((x, i) => {
      const b = box[i], v = b.min + Math.min(1, Math.max(0, x)) * (b.max - b.min);
      out[b.id] = b.step > 0 ? Math.round(v / b.step) * b.step : v;
    });
    return out;
  };
  const f = (u: number[]) => objective(m, toParams(u), refs);
  const x0 = box.map((b) => (start[b.id] - b.min) / (b.max - b.min || 1));
  let simplex = [x0, ...x0.map((_, i) => x0.map((v, j) => (j === i ? (v < 0.85 ? v + 0.15 : v - 0.15) : v)))].map((x) => ({ x, f: f(x) }));
  let evals = simplex.length;
  const before = simplex[0].f;
  while (evals < maxEval) {
    simplex.sort((a, b) => a.f - b.f);
    const best = simplex[0], worst = simplex[simplex.length - 1], second = simplex[simplex.length - 2];
    if (Math.abs(worst.f - best.f) < 1e-10 * (1 + Math.abs(best.f))) break;
    const c = x0.map((_, j) => simplex.slice(0, -1).reduce((s, p) => s + p.x[j], 0) / (simplex.length - 1));
    const along = (k: number) => c.map((v, j) => v + k * (worst.x[j] - v));
    const r = { x: along(-1), f: 0 };
    r.f = f(r.x), evals++;
    if (r.f < best.f) {
      const e = { x: along(-2), f: 0 };
      e.f = f(e.x), evals++;
      simplex[simplex.length - 1] = e.f < r.f ? e : r;
    } else if (r.f < second.f) simplex[simplex.length - 1] = r;
    else {
      const k = { x: along(0.5), f: 0 };
      k.f = f(k.x), evals++;
      if (k.f < worst.f) simplex[simplex.length - 1] = k;
      else {
        simplex = simplex.map((p, i) => (i === 0 ? p : { x: p.x.map((v, j) => best.x[j] + 0.5 * (v - best.x[j])), f: 0 }));
        simplex.slice(1).forEach((p) => ((p.f = f(p.x)), evals++));
      }
    }
  }
  simplex.sort((a, b) => a.f - b.f);
  return { params: toParams(simplex[0].x), before, after: simplex[0].f, evals };
}
