// Registry of application domains, and the cross-domain helpers the pages use.
import { MODELS } from "@/data/molecules";
import type { AppCase, Domain, Ref, Run } from "@/data/apps/types";
import { runModel } from "@/data/apps/sim";
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
