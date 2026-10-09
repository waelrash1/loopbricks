import { PRESETS_A } from "@/data/extra/batchA";
import { PRESETS_B } from "@/data/extra/batchB";
import { PRESETS_C } from "@/data/extra/batchC";
import { PRESETS_E } from "@/data/extra/batchE";
import { PRESETS_D } from "@/data/extra/batchD";
// Scenario presets per molecule — one-click interesting parameter sets.
export type Preset = { label: string; params: Record<string, number> };

export const PRESETS: Record<string, Preset[]> = {
  bathtub: [
    { label: "Filling", params: { inflow: 14, outflow: 6 } },
    { label: "Draining", params: { inflow: 3, outflow: 12 } },
    { label: "Steady state", params: { inflow: 8, outflow: 8 } },
  ],
  cascade: [
    { label: "Pulse through", params: { inflow: 0, tau: 4 } },
    { label: "Steady inflow", params: { inflow: 10, tau: 4 } },
    { label: "Fast (low τ)", params: { inflow: 10, tau: 1.5 } },
  ],
  conversion: [
    { label: "High yield", params: { feed: 10, tau: 4, yield: 4 } },
    { label: "Low yield", params: { feed: 10, tau: 4, yield: 0.6 } },
  ],
  split: [
    { label: "60 / 40", params: { inflow: 14, frac: 0.6, tau: 5 } },
    { label: "Winner takes all", params: { inflow: 14, frac: 1, tau: 5 } },
    { label: "Even split", params: { inflow: 14, frac: 0.5, tau: 5 } },
  ],
  broken: [
    { label: "Low leak", params: { inflow: 0, tau: 4, leak: 0.1 } },
    { label: "High leak", params: { inflow: 0, tau: 4, leak: 0.8 } },
  ],
  decay: [
    { label: "Fast decay", params: { tau: 2 } },
    { label: "Slow decay", params: { tau: 15 } },
  ],
  residence: [
    { label: "Short stay", params: { inflow: 8, tau: 2 } },
    { label: "Long stay", params: { inflow: 8, tau: 10 } },
  ],
  material: [
    { label: "Pulse through", params: { inflow: 0, delay: 9 } },
    { label: "Steady pipeline", params: { inflow: 8, delay: 9 } },
    { label: "Long transit", params: { inflow: 8, delay: 16 } },
  ],
  aging: [
    { label: "Baby boom", params: { births: 35, tY: 18, tA: 45, tO: 15 } },
    { label: "Birth decline", params: { births: 8, tY: 18, tA: 45, tO: 15 } },
    { label: "Longer lives", params: { births: 20, tY: 18, tA: 45, tO: 28 } },
  ],
  smooth: [
    { label: "Step up", params: { target: 80, tau: 6 } },
    { label: "Slow (τ=15)", params: { target: 80, tau: 15 } },
    { label: "Snappy (τ=2)", params: { target: 80, tau: 2 } },
  ],
  closegap: [
    { label: "Reach goal", params: { goal: 60, at: 5 } },
    { label: "Aggressive", params: { goal: 60, at: 1.5 } },
    { label: "Sluggish", params: { goal: 60, at: 15 } },
  ],
  stockmgmt: [
    { label: "Stable (sees pipeline)", params: { demand: 10, desInv: 100, adj: 4, acq: 6, slw: 1 } },
    { label: "Oscillation (ignores it)", params: { demand: 10, desInv: 100, adj: 4, acq: 6, slw: 0 } },
    { label: "Long lead time", params: { demand: 10, desInv: 100, adj: 4, acq: 12, slw: 0.3 } },
  ],
  trend: [
    { label: "Steady growth", params: { g: 6, tp: 4 } },
    { label: "Turning point", params: { g: -4, tp: 4 } },
  ],
  coflow: [
    { label: "Steady team", params: { hire: 8, tenure: 6, hireExp: 0 } },
    { label: "Rapid hiring (dilution)", params: { hire: 18, tenure: 6, hireExp: 0 } },
    { label: "Hire veterans", params: { hire: 8, tenure: 6, hireExp: 5 } },
  ],
  growth: [
    { label: "Growing", params: { birth: 5, death: 2 } },
    { label: "Declining", params: { birth: 2, death: 5 } },
    { label: "Stable", params: { birth: 3, death: 3 } },
  ],
  logistic: [
    { label: "S-curve", params: { r: 18, K: 200 } },
    { label: "Fast to cap", params: { r: 35, K: 200 } },
    { label: "Higher capacity", params: { r: 18, K: 350 } },
  ],
  diffusion: [
    { label: "Word-of-mouth", params: { p: 1, q: 18 } },
    { label: "Ad-driven", params: { p: 4, q: 5 } },
    { label: "Viral", params: { p: 0.5, q: 35 } },
  ],
  ceiling: [
    { label: "Approach cap", params: { base: 14, ceil: 100, at: 2 } },
    { label: "Hard clip", params: { base: 14, ceil: 100, at: 0.5 } },
  ],
  marketshare: [
    { label: "Lock-in", params: { inflow: 20, network: 0.7, churn: 18 } },
    { label: "No network effect", params: { inflow: 20, network: 0, churn: 18 } },
    { label: "Winner takes all", params: { inflow: 20, network: 1, churn: 18 } },
  ],
  floor: [
    { label: "Settle on floor", params: { base: 14, ceil: 100, floor: 30, at: 2 } },
    { label: "Hard floor", params: { base: 14, floor: 30, at: 0.5 } },
  ],
  protLevel: [
    { label: "Demand > supply", params: { inflow: 4, desiredOut: 12, protectBelow: 25 } },
    { label: "Supply > demand", params: { inflow: 12, desiredOut: 6, protectBelow: 25 } },
  ],
  protFlow: [
    { label: "Drain to limit", params: { inflow: 3, desiredOut: 10, fastest: 2 } },
    { label: "Slow extraction", params: { inflow: 3, desiredOut: 10, fastest: 5 } },
  ],
  backlogFlow: [
    { label: "Capacity-bound (grows)", params: { orders: 12, shipTime: 3, capacity: 10 } },
    { label: "Service-bound (settles)", params: { orders: 12, shipTime: 3, capacity: 20 } },
  ],
  backlogLevel: [
    { label: "Healthy stock", params: { orders: 12, shipTime: 2, producing: 12, protectInv: 60 } },
    { label: "Starve production", params: { orders: 12, shipTime: 2, producing: 5, protectInv: 60 } },
  ],
  capacityUtil: [
    { label: "Demand < capacity", params: { capacity: 25, demand: 15, targetInv: 100, adj: 3 } },
    { label: "Demand > capacity", params: { capacity: 15, demand: 25, targetInv: 100, adj: 3 } },
  ],
  weightedAvg: [
    { label: "Favor A", params: { srcA: 70, srcB: 30, weightA: 0.8, tau: 4 } },
    { label: "Even blend", params: { srcA: 70, srcB: 30, weightA: 0.5, tau: 4 } },
  ],
  presentValue: [
    { label: "8% discount", params: { cashFlow: 20, r: 8 } },
    { label: "Low (4%)", params: { cashFlow: 20, r: 4 } },
    { label: "High (16%)", params: { cashFlow: 20, r: 16 } },
  ],
  seaAnchor: [
    { label: "Stable", params: { pressure: 1, timeToChange: 6 } },
    { label: "Runaway drift", params: { pressure: 1.2, timeToChange: 6 } },
  ],
  smoothPricing: [
    { label: "Demand shock", params: { refPrice: 10, pressure: 1.4, tau: 4 } },
    { label: "Sticky (slow)", params: { refPrice: 10, pressure: 1.4, tau: 10 } },
  ],
  prodFatigue: [
    { label: "Normal hours", params: { overtime: 1, timeToFatigue: 4, workforce: 20, normalPDY: 5 } },
    { label: "Crunch (backfires)", params: { overtime: 1.4, timeToFatigue: 4, workforce: 20, normalPDY: 5 } },
  ],
  reworkCycle: [
    { label: "High quality", params: { capacity: 90, quality: 0.95, discoverTime: 5 } },
    { label: "Low quality (long tail)", params: { capacity: 90, quality: 0.6, discoverTime: 5 } },
  ],
  estCompletion: [
    { label: "Fixed scope (finishes)", params: { workRate: 30, scopeCreep: 0 } },
    { label: "Scope creep (recedes)", params: { workRate: 30, scopeCreep: 28 } },
  ],
  agingPDY: [
    { label: "Steady", params: { hiring: 20, tMature: 3, tExp: 25, tGray: 8 } },
    { label: "Rapid hiring (dilution)", params: { hiring: 40, tMature: 3, tExp: 25, tGray: 8 } },
  ],
  workforce: [
    { label: "Ramp up", params: { desired: 80, tHire: 4 } },
    { label: "Downsize", params: { desired: 20, tHire: 4 } },
  ],
  effectFunction: [
    { label: "At reference (1×)", params: { input: 100, reference: 100, normalFlow: 15, drainTau: 8 } },
    { label: "Input high (2×)", params: { input: 200, reference: 100, normalFlow: 15, drainTau: 8 } },
    { label: "Input low", params: { input: 40, reference: 100, normalFlow: 15, drainTau: 8 } },
  ],
  cascadedCoflow: [
    { label: "Value added", params: { input: 8, tau: 4, inCost: 1, valueAdd: 0.5 } },
    { label: "No value added", params: { input: 8, tau: 4, inCost: 1, valueAdd: 0 } },
  ],
  doingWork: [
    { label: "Clear backlog", params: { workforce: 20, productivity: 4, newWork: 0 } },
    { label: "Backlog grows", params: { workforce: 10, productivity: 4, newWork: 60 } },
  ],
  schedulePressure: [
    { label: "On schedule", params: { scheduled: 15, baseRate: 25 } },
    { label: "Tight deadline (slips)", params: { scheduled: 8, baseRate: 25 } },
  ],
  multiSplit: [
    { label: "5 : 3 : 2", params: { inflow: 15, wA: 5, wB: 3, wC: 2, tau: 5 } },
    { label: "Even", params: { inflow: 15, wA: 1, wB: 1, wC: 1, tau: 5 } },
    { label: "A dominant", params: { inflow: 15, wA: 8, wB: 1, wC: 1, tau: 5 } },
  ],
  protectedSeaAnchor: [
    { label: "Unprotected (drifts)", params: { pressure: 1.2, fundamental: 100, protection: 0, timeToChange: 6 } },
    { label: "Protected (stable)", params: { pressure: 1.2, fundamental: 100, protection: 0.5, timeToChange: 6 } },
    { label: "Strong anchor", params: { pressure: 1.4, fundamental: 100, protection: 0.9, timeToChange: 6 } },
  ],
  // molecules added from the book's remaining entries (src/data/extra)
  ...PRESETS_A,
  ...PRESETS_B,
  ...PRESETS_C,
  ...PRESETS_D,
  ...PRESETS_E,
};
