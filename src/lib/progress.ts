// What this learner has opened, kept on their own device. No account, no server: if storage is blocked
// the app still works, it just can't remember.
import { useSyncExternalStore } from "react";

const KEY = "loopbricks-progress";
let seen: Set<string> = new Set();
try {
  seen = new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
} catch {
  // storage blocked or corrupt: start empty
}
let snapshot = seen;
const subs = new Set<() => void>();

// keys are molecule keys ("bathtub") or application cases ("health/epidemic")
export function markSeen(key: string) {
  if (seen.has(key)) return;
  seen = new Set(seen).add(key);
  snapshot = seen;
  try {
    localStorage.setItem(KEY, JSON.stringify([...seen]));
  } catch {
    // not remembered across visits, still shown this session
  }
  subs.forEach((f) => f());
}

export function forgetAll() {
  seen = new Set();
  snapshot = seen;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
  subs.forEach((f) => f());
}

export const useSeen = () =>
  useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => snapshot
  );
