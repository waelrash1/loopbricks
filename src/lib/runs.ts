// Saved runs and reference data, one shelf per model, kept in this browser only (no account, no server).
// Export and import move them between computers or to a class.
import { useSyncExternalStore } from "react";

export type SavedRun = {
  id: string;
  name: string;
  params: Record<string, number>;
  times: number[];
  series: Record<string, number[]>; // stock id → values at `times`
  visible: boolean;
  saved: string; // ISO date
};
// observed data for one stock: the reference mode a model should reproduce
export type RefData = { id: string; name: string; stock: string; points: [number, number][]; visible: boolean };
export type Shelf = { runs: SavedRun[]; refs: RefData[] };

export const MAX_RUNS = 6;
const PREFIX = "loopbricks-runs:";
const EMPTY: Shelf = { runs: [], refs: [] };
const cache = new Map<string, Shelf>();
const subs = new Map<string, Set<() => void>>();

export function getShelf(key: string): Shelf {
  if (!cache.has(key)) {
    let shelf = EMPTY;
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw) shelf = { ...EMPTY, ...JSON.parse(raw) };
    } catch {
      // storage blocked or corrupt: start with an empty shelf
    }
    cache.set(key, shelf);
  }
  return cache.get(key)!;
}

// returns false when the browser refused to store it (quota or privacy mode); the shelf still updates for this visit
export function setShelf(key: string, next: Shelf): boolean {
  cache.set(key, next);
  let ok = true;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(next));
  } catch {
    ok = false;
  }
  subs.get(key)?.forEach((f) => f());
  return ok;
}

export const useShelf = (key: string) =>
  useSyncExternalStore(
    (f) => {
      if (!subs.has(key)) subs.set(key, new Set());
      subs.get(key)!.add(f);
      return () => subs.get(key)!.delete(f);
    },
    () => getShelf(key)
  );

export const newId = () => Math.random().toString(36).slice(2, 9);

// keep at most n evenly spaced points, always including the last, so saved runs stay small
export function thin(times: number[], series: number[][], n = 400) {
  if (times.length <= n) return { times: [...times], series: series.map((s) => [...s]) };
  const idx = Array.from({ length: n }, (_, i) => Math.round((i / (n - 1)) * (times.length - 1)));
  return { times: idx.map((i) => times[i]), series: series.map((s) => idx.map((i) => s[i])) };
}

// value of a series at time t by linear interpolation; undefined outside the run
export function at(times: number[], ys: number[], t: number): number | undefined {
  if (!times.length || t < times[0] - 1e-9 || t > times[times.length - 1] + 1e-9) return undefined;
  let lo = 0, hi = times.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (times[mid] <= t) lo = mid;
    else hi = mid;
  }
  const span = times[hi] - times[lo];
  return span <= 0 ? ys[lo] : ys[lo] + ((ys[hi] - ys[lo]) * (t - times[lo])) / span;
}

// "time,value" lines, with or without a header, commas, semicolons, tabs or spaces
export function parsePoints(text: string): [number, number][] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim().split(/[,;\t ]+/).map(Number))
    .filter((r) => r.length >= 2 && Number.isFinite(r[0]) && Number.isFinite(r[1]))
    .map((r) => [r[0], r[1]] as [number, number])
    .sort((a, b) => a[0] - b[0]);
}

export function download(name: string, data: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
