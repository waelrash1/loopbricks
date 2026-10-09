// Navigation metadata derived from the molecule data: tour order, family tree, group blurbs, search aliases.
import { GROUPS, MODELS } from "@/data/molecules";
import { LINEAGE_A } from "@/data/extra/batchA";
import { LINEAGE_B } from "@/data/extra/batchB";
import { LINEAGE_C } from "@/data/extra/batchC";
import { LINEAGE_E } from "@/data/extra/batchE";
import { LINEAGE_D } from "@/data/extra/batchD";

// "builds on" lineage — mirrors Hines' Immediate Parents, used to show the taxonomy.
export const LINEAGE: Record<string, string[]> = {
  bathtub: [],
  cascade: ["bathtub"],
  conversion: ["cascade"],
  broken: ["cascade", "split"],
  split: ["bathtub"],
  decay: ["bathtub", "goToZero"],
  residence: ["decay"],
  material: ["cascade", "decay"],
  aging: ["cascade"],
  smooth: ["decay"],
  closegap: ["smooth"],
  stockmgmt: ["closegap"],
  workforce: ["closegap"],
  trend: ["smooth"],
  weightedAvg: ["split"],
  presentValue: ["decay"],
  coflow: ["bathtub"],
  agingPDY: ["aging", "coflow"],
  cascadedCoflow: ["cascade", "coflow"],
  growth: ["bathtub"],
  logistic: ["growth", "ceiling"],
  diffusion: ["growth", "split"],
  ceiling: ["closegap"],
  floor: ["ceiling"],
  capacityUtil: ["ceiling", "effectFunction"],
  effectFunction: [],
  protLevel: ["decay", "effectFunction"],
  protFlow: ["decay"],
  backlogFlow: ["protFlow"],
  backlogLevel: ["protLevel"],
  seaAnchor: ["smooth"],
  protectedSeaAnchor: ["seaAnchor"],
  smoothPricing: ["smooth"],
  marketshare: ["split", "growth"],
  multiSplit: ["weightedSplit"],
  prodFatigue: ["productivity", "effectFatigue", "overtime"],
  reworkCycle: ["cascade", "broken"],
  estCompletion: ["estRemaining"],
  doingWork: ["producing", "reducingBacklog"],
  schedulePressure: ["effectFunction", "estCompletion"],
  ...LINEAGE_A,
  ...LINEAGE_B,
  ...LINEAGE_C,
  ...LINEAGE_D,
  ...LINEAGE_E,
  // parents the book names that only exist now that the full set is in
  nonlinearSplit: ["propSplit", "univariateAnchor"],
  abilityFromAction: ["actionFromResource"],
  desiredWorkforce: ["resourcesFromAction", "producing"],
  estProductivity: ["abilityFromAction", "producing"],
  buildingInventory: ["producing"],
  doingWorkCascade: ["cascade", "buildingInventory", "reducingBacklog"],
  protByPDY: ["reducingBacklog", "univariateAnchor"],
};

export const GROUP_BLURB: Record<string, string> = {
  "Accumulation primitives": "The atoms: how things pile up. Everything descends from the Bathtub.",
  "Delays & decays": "First-order feedback — stock-proportional outflows give lags and exponential decline.",
  "Goal-seeking & control": "Balancing loops that drive a stock toward a target (with delays that can oscillate).",
  "Expectations & valuation": "Perceiving rates of change, blending signals, and discounting the future.",
  "Coflows": "An attribute — skill, cost, age — riding along with the material it flows with.",
  "Growth & limits": "Reinforcing loops, and what happens when they meet a balancing limit (S-curves).",
  "Constraints & nonlinearity": "Caps, floors and the dimensionless effect-function behind every multiplier.",
  "Protected levels & fulfillment": "Keeping physical stocks non-negative; shipping limited by stock or capacity.",
  "Anchoring & pricing": "Self-referential expectations, their runaway drift, and the fix — plus sticky prices.",
  "Allocation & competition": "Dividing a flow among destinations; attractiveness that compounds into lock-in.",
  "Resources & actions": "The one-line conversions between what you have and what you do: people into output, output into money, money into people.",
  "Productivity & projects": "Turning resources into work — fatigue, rework, schedule pressure, completion.",
};

// Book molecules that live inside a combined page, so a search for the book's name still lands somewhere.
// Book names that differ from the page name, so a search for the book's wording still lands somewhere.
export const ALIASES: Record<string, string[]> = {
  stockmgmt: ["High-Visibility Pipeline Correction"],
  reworkCycle: ["Work Accomplishment Structure"],
  effectFunction: ["Dimensionless Input to Function"],
  schedulePressure: ["Scheduled Completion Date"],
  stockAdjust: ["First-Order Stock Adjustment"],
  growth: ["Population Growth"],
};

export const TOUR = GROUPS.flatMap((g) => g.keys);
export const groupOf = (key: string) => GROUPS.find((g) => g.keys.includes(key))?.title ?? "";
export const parentsOf = (key: string) => (LINEAGE[key] ?? []).filter((p) => MODELS[p]);
export const childrenOf = (key: string) => TOUR.filter((k) => (LINEAGE[k] ?? []).includes(key));

// Case-insensitive match on name, long title and book aliases. Returns the alias that matched, if any.
export function search(query: string): { key: string; via?: string }[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return TOUR.flatMap((key) => {
    const m = MODELS[key];
    if (m.name.toLowerCase().includes(q) || m.title.toLowerCase().includes(q)) return [{ key }];
    const via = (ALIASES[key] ?? []).find((a) => a.toLowerCase().includes(q));
    return via ? [{ key, via }] : [];
  });
}
