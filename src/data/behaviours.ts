import { MODELS, type Model } from "@/data/molecules";
import { DT, freshState, initParams, stepOnce } from "@/sim/engine";
import { PRESETS } from "@/data/presets";

// Which behaviour each molecule produces, read off its own default run and its presets (no pulses).
// Every line on the molecule's chart (stocks not hidden from it, and the derived display lines) is run for RUN_LENGTH time units and
// classified by classify() below. A molecule produces a behaviour if any of its stocks does; a
// molecule whose stocks fit none (flat, linear, a single hump) gets no tag. Checked by scripts/behaviours-test.ts.

export const BEHAVIOURS = ["growth", "decay", "goal", "sshape", "oscillation", "delay"] as const;
export type Behaviour = (typeof BEHAVIOURS)[number];
export const BEHAVIOUR_LABEL: Record<Behaviour, string> = {
  growth: "Growth",
  decay: "Decay",
  goal: "Goal seeking",
  sshape: "S-shaped growth",
  oscillation: "Oscillation",
  delay: "Delayed response",
};

export const RUN_LENGTH = 60; // time units, the same horizon scripts/check.ts runs every molecule for

// The heuristic, on one series y over equal time steps:
// 1. flat: total range under 1% of its size: no tag.
// 2. turning points: count swings larger than 10% of the range. Two or more: oscillation. Exactly one
//    (a hump or a single overshoot): no tag.
// 3. monotone: compare slopes. v0 = slope at the start, vmax = steepest slope, vend = slope at the end.
//    - rising and still steepening at the end (vend >= 0.5 vmax, vend >= 2 v0), and steepening throughout
//      (the slope halfway through is between 5% and 80% of vend, so flat-then-straight does not count): growth.
//    - settling (vend < 0.1 vmax):
//      - steepest at the start (v0 >= 0.9 vmax) and clearly curved (slope halved by the time half the
//        change is done, so a straight run to a stop does not count): decay if it falls to near zero,
//        otherwise goal seeking.
//      - steepest in the middle (v0 < 0.5 vmax): an S curve. Rising in a molecule with a reinforcing loop:
//        S-shaped growth. In a molecule with no reinforcing loop: delayed response.
export function classify(y: number[], hasR: boolean): Behaviour | null {
  const n = y.length;
  if (n < 10) return null;
  const lo = Math.min(...y);
  const hi = Math.max(...y);
  const range = hi - lo;
  if (!(range > 1e-2 * Math.max(Math.abs(hi), Math.abs(lo))) || range < 1e-9) return null;

  // zigzag filter: a turning point is a reversal that moves more than 10% of the range
  const swing = 0.1 * range;
  let turns = 0;
  let dir = 0; // 0 until the first real move, then +1 rising, -1 falling
  let ext = y[0]; // the running extreme in the current direction
  let hiE = y[0];
  let loE = y[0];
  for (const v of y) {
    if (dir === 0) {
      hiE = Math.max(hiE, v);
      loE = Math.min(loE, v);
      if (v - loE > swing) [dir, ext] = [1, v];
      else if (hiE - v > swing) [dir, ext] = [-1, v];
    } else if (dir * (v - ext) > 0) ext = v;
    else if (Math.abs(ext - v) > swing) {
      turns++;
      [dir, ext] = [-dir, v];
    }
  }
  if (turns >= 2) return "oscillation";
  if (turns === 1) return null;

  const up = y[n - 1] > y[0];
  const v = y.slice(1).map((x, i) => Math.abs(x - y[i]));
  const vmax = Math.max(...v);
  const v0 = v[0];
  const vend = v[v.length - 1];
  if (vend >= 0.5 * vmax) {
    const vmid = v[v.length >> 1];
    return up && vend >= 2 * v0 && vmid > 0.05 * vend && vmid < 0.8 * vend ? "growth" : null;
  }
  if (vend >= 0.1 * vmax) return null;
  if (v0 >= 0.9 * vmax) {
    const half = y.findIndex((x) => Math.abs(x - y[0]) >= 0.5 * Math.abs(y[n - 1] - y[0]));
    if (half < 1 || v[Math.min(half, v.length - 1)] > 0.75 * v0) return null; // straight line, not a curve
    return !up && Math.abs(y[n - 1]) < 0.05 * Math.abs(y[0]) ? "decay" : "goal";
  }
  if (v0 < 0.5 * vmax) return hasR ? (up ? "sshape" : null) : "delay";
  return null;
}

export type BehaviourRun = { tags: Behaviour[]; series: { id: string; tag: Behaviour | null; y: number[] }[] };
// A molecule's default run, plus each preset run that adds a behaviour the default does not show.
export type MoleculeBehaviour = BehaviourRun & { presets: (BehaviourRun & { label: string })[]; all: Behaviour[] };

export function runDefault(m: Model, params?: Record<string, number>): BehaviourRun {
  const p = { ...initParams(m), ...params };
  const stocks = m.stocks.filter((x) => !x.hidden && !x.chartHidden);
  let s = freshState(m, p);
  const ys = stocks.map((x) => [s[x.id]]);
  for (let i = 0; i < RUN_LENGTH / DT; i++) {
    s = stepOnce(m, s, p, DT).state;
    stocks.forEach((x, j) => ys[j].push(s[x.id]));
  }
  const hasR = m.cld.loops.some((l) => l.type === "R");
  const series = stocks.map((x, j) => ({ id: x.id, tag: classify(ys[j], hasR), y: ys[j] }));
  const tags = BEHAVIOURS.filter((b) => series.some((x) => x.tag === b));
  return { tags, series };
}

function runAll(k: string, m: Model): MoleculeBehaviour {
  const base = runDefault(m);
  const presets = (PRESETS[k] ?? [])
    .map((pr) => ({ label: pr.label, ...runDefault(m, pr.params) }))
    .filter((r) => r.tags.some((b) => !base.tags.includes(b)));
  const all = BEHAVIOURS.filter((b) => base.tags.includes(b) || presets.some((r) => r.tags.includes(b)));
  return { ...base, presets, all };
}

// Every molecule and its presets: about 150,000 Euler steps, a few tens of milliseconds. Memoised for the session.
let cache: Record<string, MoleculeBehaviour> | null = null;
export function behaviourRuns(): Record<string, MoleculeBehaviour> {
  if (!cache) cache = Object.fromEntries(Object.entries(MODELS).map(([k, m]) => [k, runAll(k, m)]));
  return cache;
}
