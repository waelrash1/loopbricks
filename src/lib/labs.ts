// Data and computations behind the calibration and sensitivity labs. Pure functions, so scripts/check.ts can test them.
import { MODELS } from "@/data/molecules";
import { fitStats, simulateAt } from "@/lib/fit";
import { DT, freshState, initParams, stepOnce } from "@/sim/engine";
import type { RefData } from "@/lib/runs";

// ---- calibration lab -------------------------------------------------------------------------
// A hidden decision maker manages a stock with the stock-management rule. Its two behavioural
// parameters are set near the average Sterman (2000, p. 694) estimated for beer-game players:
// stock adjustment time 3.85 weeks and weight on the supply line 0.34, rounded to the sliders' steps.
export const CAL_MODEL = MODELS.stockmgmt;
export const CAL_FIXED = { demand: 10, desInv: 100, acq: 6 };
export const CAL_TRUTH = { adj: 4, slw: 0.35 };
export const CAL_TIMES = Array.from({ length: 21 }, (_, i) => i * 2); // weeks 0..40
export const CAL_HOLDOUT = 16; // fit on weeks 0..16, test on the rest

// fixed pseudo-random noise (Park–Miller), so every learner sees the same "observations"
function noise(n: number, seed = 7, amp = 6) {
  let s = seed;
  return Array.from({ length: n }, () => ((s = (s * 16807) % 2147483647) / 2147483647 - 0.5) * amp);
}

export const calRef = (points: [number, number][]): RefData => ({ id: "obs", name: "Observed inventory", stock: "inv", visible: true, points });

export const CAL_DATA: [number, number][] = (() => {
  const clean = simulateAt(CAL_MODEL, { ...CAL_FIXED, ...CAL_TRUTH }, [calRef(CAL_TIMES.map((t) => [t, 0]))]).obs;
  const e = noise(clean.length);
  return CAL_TIMES.map((t, i) => [t, Math.round((clean[i] + e[i]) * 10) / 10]);
})();

// the run for a guess, read at the data times; and its fit to the data up to `upto`
export function calRun(guess: { adj: number; slw: number }) {
  return simulateAt(CAL_MODEL, { ...CAL_FIXED, ...guess }, [calRef(CAL_DATA)]).obs;
}
export function calFit(guess: { adj: number; slw: number }, from = 0, to = 40) {
  const sim = calRun(guess);
  const idx = CAL_DATA.map((p, i) => [p, i] as const).filter(([p]) => p[0] >= from && p[0] <= to);
  return fitStats(idx.map(([, i]) => sim[i]), idx.map(([p]) => p[1]))!;
}

// RMSE over a grid of the two parameters: the "error landscape" the optimiser searches
export const CAL_ADJ = Array.from({ length: 23 }, (_, i) => 1 + i * 0.5); // 1..12
export const CAL_SLW = Array.from({ length: 21 }, (_, i) => Math.round(i * 5) / 100); // 0..1
export function calGrid() {
  return CAL_ADJ.map((adj) => CAL_SLW.map((slw) => calFit({ adj, slw }).rmse));
}

// ---- sensitivity lab ------------------------------------------------------------------------
// Monte Carlo: sample each chosen parameter uniformly within ±spread of its base value (clamped to
// the slider), simulate, and collect one stock's trajectory at n evenly spaced times.
export function lcg(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function monteCarlo(key: string, base: Record<string, number>, vary: string[], spread: number, stock: string, T: number, runs: number, seed = 11, samples = 61) {
  const m = MODELS[key];
  const rnd = lcg(seed);
  const times = Array.from({ length: samples }, (_, i) => (i * T) / (samples - 1));
  const every = Math.round(T / (samples - 1) / DT);
  const out: { params: Record<string, number>; ys: number[] }[] = [];
  for (let r = 0; r < runs; r++) {
    const p = { ...initParams(m), ...base };
    vary.forEach((id) => {
      const d = m.params.find((x) => x.id === id)!;
      const v = p[id] * (1 + spread * (2 * rnd() - 1));
      p[id] = Math.min(d.max, Math.max(d.min, v));
    });
    let s = freshState(m);
    const ys = [s[stock]];
    for (let i = 1; i <= every * (samples - 1); i++) {
      s = stepOnce(m, s, p, DT).state;
      if (i % every === 0) ys.push(s[stock]);
    }
    out.push({ params: p, ys });
  }
  return { times, runs: out };
}

// percentile of each column across runs, for confidence bands
export function band(runs: number[][], q: number) {
  return runs[0].map((_, j) => {
    const col = runs.map((r) => r[j]).sort((a, b) => a - b);
    const k = (col.length - 1) * q, lo = Math.floor(k), hi = Math.ceil(k);
    return col[lo] + (col[hi] - col[lo]) * (k - lo);
  });
}

// does a run overshoot? it passes its final level by more than 10% of the distance it travelled
export function overshoots(ys: number[]) {
  const start = ys[0], end = ys[ys.length - 1], travel = Math.abs(end - start) || 1;
  const beyond = end >= start ? Math.max(...ys) - end : end - Math.min(...ys);
  return beyond > 0.1 * travel;
}

// does a run oscillate? at least two turning points of meaningful size
export function oscillates(ys: number[]) {
  const span = Math.max(...ys) - Math.min(...ys) || 1;
  let turns = 0;
  for (let i = 1; i < ys.length - 1; i++) {
    const a = ys[i] - ys[i - 1], b = ys[i + 1] - ys[i];
    if (a * b < 0 && Math.abs(a) + Math.abs(b) > span * 0.01) turns++;
  }
  return turns >= 2;
}
