// Registry of application domains, and the cross-domain helpers the pages use.
import { MODELS } from "@/data/molecules";
import type { AppCase, Domain, Ref, Run } from "@/data/apps/types";
import { runModel, sampleModel } from "@/data/apps/sim";
import { HEALTH } from "@/data/apps/health/cases";
import { ENVIRONMENT } from "@/data/apps/environment";
import { BUSINESS } from "@/data/apps/business";
import { PROJECTS } from "@/data/apps/projects";
import { ECONOMICS } from "@/data/apps/economics";
import { SOCIAL } from "@/data/apps/social";

export const DOMAINS: Domain[] = [HEALTH, ENVIRONMENT, BUSINESS, PROJECTS, ECONOMICS, SOCIAL].filter((d) => d.cases.length > 0);
export const domainById = (id?: string) => DOMAINS.find((d) => d.id === id);
export const caseIn = (d: Domain | undefined, id?: string) => d?.cases.find((c) => c.id === id);

// One table of references; scripts/check.ts fails if two domains use the same key for different works.
export const REFS: Record<string, Ref> = Object.assign({}, ...DOMAINS.map((d) => d.refs));
// The step-by-step guide is written for health but applies to any policy model.
export const GUIDE = HEALTH.practice!;

export type Hit = { domain: Domain; c: AppCase };
export const ALL_CASES: Hit[] = DOMAINS.flatMap((domain) => domain.cases.map((c) => ({ domain, c })));
export const casesUsing = (moleculeKey: string) => ALL_CASES.filter(({ c }) => c.molecules.includes(moleculeKey));

// Case-insensitive match on everything a learner might type: subject, setting, method or molecule.
export function searchApps(query: string, domain?: Domain, theme?: string): Hit[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return ALL_CASES.filter(({ domain: d, c }) => {
    if ((domain && d !== domain) || (theme && c.theme !== theme)) return false;
    const hay = [c.title, c.summary, c.question, c.theme, c.level, d.name, ...c.tags, ...c.molecules.map((k) => MODELS[k]?.name ?? "")].join(" ").toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

// "Homer and Hirsch 2006", "Sterman 2000", "Jones et al. 2006"
export function shortCite(k: string) {
  const [authors, rest] = REFS[k].text.split(" (");
  const names = authors.split(", ").filter((a) => a !== "et al.").map((a) => a.replace(/ [A-Z-]+$/, ""));
  const many = names.length > 2 || authors.includes("et al.");
  return `${many ? names[0] + " et al." : names.join(" and ")} ${rest.slice(0, 4)}`;
}

// The behaviour checks run the case's simulator headlessly, from its defaults, to the domain's stop time.
export const runnerFor = (d: Domain, c: AppCase): Run => (params = {}, T) => runModel(d.models[c.sim!], params, T ?? d.stop[c.sim!]);

// Each case's behaviour checks, run once and remembered: the cards and the case page share the result.
const checkCache = new Map<AppCase, { claim: string; ok: boolean }[]>();
export function checkResults(d: Domain, c: AppCase) {
  if (!c.sim || !c.checks) return [];
  let r = checkCache.get(c);
  if (!r) {
    const run = runnerFor(d, c);
    r = c.checks.map((k) => {
      try {
        return { claim: k.claim, ok: k.test(run) };
      } catch {
        return { claim: k.claim, ok: false };
      }
    });
    checkCache.set(c, r);
  }
  return r;
}

// A field's signature behaviour: of its runnable cases (first scenario each), the one whose curves move most,
// scored by total up-and-down travel relative to scale, so a flat steady state never represents a field
const sketchCache = new Map<Domain, ReturnType<typeof sketchOf>>();
function sketchOf(d: Domain, c: AppCase) {
  const m = d.models[c.sim!];
  const series = sampleModel(m, c.presets?.[0]?.params ?? {}, d.stop[c.sim!]);
  const lines = series.map((ys, i) => ({ ys, color: m.stocks[i].color, hidden: m.stocks[i].hidden || m.stocks[i].chartHidden })).filter((l) => !l.hidden);
  const max = Math.max(1e-9, ...lines.flatMap((l) => l.ys));
  const score = lines.reduce((t, l) => t + l.ys.reduce((u, y, j) => u + (j ? Math.abs(y - l.ys[j - 1]) : 0), 0) / max, 0);
  return { title: c.title, lines, score };
}
export function fieldSketch(d: Domain) {
  if (!sketchCache.has(d)) {
    const all = d.cases.filter((c) => c.sim).map((c) => sketchOf(d, c));
    sketchCache.set(d, all.sort((a, b) => b.score - a.score)[0] ?? null);
  }
  return sketchCache.get(d) ?? null;
}
