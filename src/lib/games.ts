// Decision games (management flight simulators). Each engine is a pure stepping function over plain,
// JSON-safe state, so the page can save a game to localStorage and scripts/check.ts can test it.
import { MODELS } from "@/data/molecules";
import { DT, initParams, stepOnce, type Vars } from "@/sim/engine";

// ===================================================================================================
// 1. Beer game: retailer, wholesaler, distributor, factory. Orders travel up the chain with a
// 2-week delay and beer travels down with a 2-week delay. The factory's orders go to a supplier that
// always fills them, with the same delays, so every stage has a 4-week lead time.
export const BEER = { weeks: 36, inv0: 12, flow0: 4, delay: 2, holding: 0.5, backlogCost: 1, stepWeek: 5, demand0: 4, demand1: 8 };
export const STAGES = ["Retailer", "Wholesaler", "Distributor", "Factory"] as const;
export const beerDemand = (week: number) => (week < BEER.stepWeek ? BEER.demand0 : BEER.demand1);

// Sterman (1989) anchoring and adjustment: order = MAX(0, expected orders + α (S' − S − β SL)), with expected
// orders smoothed by θ. Values near his average estimates across 44 teams.
export const STERMAN = { theta: 0.36, alpha: 0.26, beta: 0.34, target: 17 };
// A good policy: the same structure, but the supply line counts in full (β = 1) against a desired supply line
// of expected orders × lead time, so orders already on the way are not ordered again.
export const GOOD = { theta: 0.2, adjust: 4, target: 12, lead: 4 };

export type BeerStage = {
  inv: number;
  backlog: number;
  ship: number[]; // beer on its way to this stage, next week first
  mail: number[]; // this stage's orders on their way upstream, next week first
  expected: number; // smoothed incoming orders
  onOrder: number; // supply line: ordered but not yet received
  incoming: number; // order received this week
  received: number; // beer received this week
  shipped: number; // beer sent downstream this week
};
export type BeerGame = {
  role: number | null; // stage the learner plays, null when all four are computer players
  week: number; // the week waiting for orders, 1..36
  done: boolean;
  stages: BeerStage[];
  hist: { demand: number[]; incoming: number[][]; orders: number[][]; inv: number[][]; backlog: number[][]; cost: number[][] };
};
export type BeerRule = (st: BeerStage) => number;

export const stermanOrder: BeerRule = (st) => {
  const { alpha, beta, target } = STERMAN;
  return Math.max(0, Math.round(st.expected + alpha * (target - (st.inv - st.backlog) - beta * st.onOrder)));
};
export const goodOrder: BeerRule = (st) => {
  const { adjust, target, lead } = GOOD;
  return Math.max(0, Math.round(st.expected + (target - (st.inv - st.backlog)) / adjust + (st.expected * lead - st.onOrder) / adjust));
};

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

// receive beer and orders, ship what we can, and book this week's costs
function beerOpen(g: BeerGame, theta: (i: number) => number) {
  const S = g.stages, d = beerDemand(g.week);
  S.forEach((st) => {
    st.received = st.ship.shift() ?? 0;
    st.inv += st.received;
    st.onOrder -= st.received;
  });
  S[3].ship.push(S[3].mail.shift() ?? 0); // the supplier fills the factory's orders in full
  S.forEach((st, i) => {
    st.incoming = i === 0 ? d : S[i - 1].mail.shift() ?? 0;
    st.expected = theta(i) * st.incoming + (1 - theta(i)) * st.expected;
    const want = st.incoming + st.backlog;
    st.shipped = Math.min(st.inv, want);
    st.inv -= st.shipped;
    st.backlog = want - st.shipped;
    if (i > 0) S[i - 1].ship.push(st.shipped);
    g.hist.incoming[i].push(st.incoming);
    g.hist.inv[i].push(st.inv);
    g.hist.backlog[i].push(st.backlog);
    g.hist.cost[i].push(BEER.holding * st.inv + BEER.backlogCost * st.backlog);
  });
  g.hist.demand.push(d);
}

export function beerNew(role: number | null, rules: BeerRule[] = [stermanOrder, stermanOrder, stermanOrder, stermanOrder]): BeerGame {
  const { inv0, flow0 } = BEER;
  const g: BeerGame = {
    role,
    week: 1,
    done: false,
    stages: STAGES.map(() => ({ inv: inv0, backlog: 0, ship: [flow0, flow0], mail: [flow0, flow0], expected: flow0, onOrder: 4 * flow0, incoming: flow0, received: 0, shipped: 0 })),
    hist: { demand: [], incoming: [[], [], [], []], orders: [[], [], [], []], inv: [[], [], [], []], backlog: [[], [], [], []], cost: [[], [], [], []] },
  };
  beerOpen(g, (i) => thetaOf(rules[i]));
  return g;
}
const thetaOf = (r: BeerRule) => (r === goodOrder ? GOOD.theta : STERMAN.theta);

// place this week's orders (the learner's for their role, the rule's for the others) and open the next week
export function beerAdvance(g0: BeerGame, learnerOrder = 0, rules: BeerRule[] = [stermanOrder, stermanOrder, stermanOrder, stermanOrder]): BeerGame {
  if (g0.done) return g0;
  const g = clone(g0);
  g.stages.forEach((st, i) => {
    const o = i === g.role ? Math.max(0, Math.round(learnerOrder)) : rules[i](st);
    st.mail.push(o);
    st.onOrder += o;
    g.hist.orders[i].push(o);
  });
  if (g.week >= BEER.weeks) return { ...g, done: true };
  g.week++;
  beerOpen(g, (i) => thetaOf(rules[i]));
  return g;
}

// play a whole game with one rule at every stage, or replay a learner's orders at their stage
export function beerRun(rule: BeerRule | BeerRule[] = stermanOrder, role: number | null = null, orders: number[] = []): BeerGame {
  const rules = Array.isArray(rule) ? rule : [rule, rule, rule, rule];
  let g = beerNew(role, rules);
  while (!g.done) g = beerAdvance(g, orders[g.week - 1] ?? 0, rules);
  return g;
}
// the computer chain with one stage switched to the good policy
export const beerGoodSeat = (seat: number) => beerRun(STAGES.map((_, i) => (i === seat ? goodOrder : stermanOrder)));
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const beerCost = (g: BeerGame, stage?: number) => (stage === undefined ? sum(g.hist.cost.map(sum)) : sum(g.hist.cost[stage]));
export const beerPeak = (g: BeerGame, stage: number) => Math.max(...g.hist.orders[stage]);

// ===================================================================================================
// 2. Fishery: the tragedyCommons molecule run a year at a time. The learner sets Fleet A directly;
// Fleet B grows and shrinks by the molecule's own rule, as long as its boats pay.
export const FISH = { years: 30, boatCost: 1, msy: 10, bestBoats: 15, bestStock: 62.5, bestCatchPerYear: 9.375, bestProfitPerYear: 5.625 };
// money in $ million: a kt of fish sells for $1m, a boat costs $0.25m a year to run (the break-even catch)
// and $1m to build. Scrapping a boat returns nothing.
// Best sustainable outcome for the whole fishery: profit = N × stock/100 − 0.25 N with the stock in balance at
// 100 (1 − N/40), which peaks at N = 15 boats, a stock of 62.5, a catch of 9.375 kt and $5.625m a year.
const TC = MODELS.tragedyCommons;
export type FishGame = {
  year: number; // years played
  done: boolean;
  s: Vars; // res, fa, fb
  quota: number;
  auto: boolean; // Fleet A follows the molecule's rule instead of the learner
  hist: { res: number[]; fa: number[]; fb: number[]; profitA: number[]; profitB: number[]; catchTotal: number[]; changes: number[] };
};
export function fishNew(quota = 0, auto = false): FishGame {
  const s: Vars = {};
  TC.stocks.forEach((x) => (s[x.id] = x.init));
  return { year: 0, done: false, s, quota, auto, hist: { res: [s.res], fa: [s.fa], fb: [s.fb], profitA: [0], profitB: [0], catchTotal: [], changes: [] } };
}
export const fishCatchPerBoat = (res: number) => (initParams(TC).catchFull * res) / 100;

// one year: the learner's change to Fleet A happens at once, then the year runs in steps of DT
export function fishAdvance(g0: FishGame, change = 0): FishGame {
  if (g0.done) return g0;
  const g = clone(g0);
  const p: Vars = { ...initParams(TC), quota: g.quota, gA: g.auto ? initParams(TC).gA : 0 };
  let s = { ...g.s };
  const c = g.auto ? 0 : Math.max(-s.fa, Math.round(change));
  s.fa += c;
  let profitA = -Math.max(0, c) * FISH.boatCost, profitB = 0, total = 0;
  for (let k = 0; k < Math.round(1 / DT); k++) {
    const { state, rates } = stepOnce(TC, s, p, DT);
    const boats = s.fa + s.fb || 1;
    const catchA = (rates.harvest * s.fa) / boats, catchB = (rates.harvest * s.fb) / boats;
    profitA += (catchA - p.breakEven * s.fa - FISH.boatCost * rates.buildA) * DT;
    profitB += (catchB - p.breakEven * s.fb - FISH.boatCost * rates.buildB) * DT;
    total += rates.harvest * DT;
    s = g.auto ? state : { ...state, fa: s.fa };
  }
  g.s = s;
  g.year++;
  const h = g.hist;
  h.res.push(s.res);
  h.fa.push(s.fa);
  h.fb.push(s.fb);
  h.profitA.push(h.profitA[h.profitA.length - 1] + profitA);
  h.profitB.push(h.profitB[h.profitB.length - 1] + profitB);
  h.catchTotal.push(total);
  h.changes.push(c);
  g.done = g.year >= FISH.years;
  return g;
}
// replay: both fleets follow the molecule's rule, with or without a total catch limit
export function fishRun(quota = 0, auto = true, changes: number[] = []): FishGame {
  let g = fishNew(quota, auto);
  while (!g.done) g = fishAdvance(g, changes[g.year] ?? 0);
  return g;
}
export const fishProfit = (g: FishGame) => ({ a: g.hist.profitA[g.year], b: g.hist.profitB[g.year] });

// ===================================================================================================
// 3. Firefighting: the shiftingBurden molecule, four weeks per turn, the learner setting the share patched.
export const FIRE = { weeks: 104, turn: 4 };
const SB = MODELS.shiftingBurden;
export type FireGame = { week: number; done: boolean; s: Vars; hist: { prob: number[]; cap: number[]; shares: number[] } };
export function fireNew(): FireGame {
  const s: Vars = {};
  SB.stocks.forEach((x) => (s[x.id] = x.init));
  return { week: 0, done: false, s, hist: { prob: [s.prob], cap: [s.cap], shares: [] } };
}
export function fireAdvance(g0: FireGame, share: number): FireGame {
  if (g0.done) return g0;
  const g = clone(g0);
  const p = { ...initParams(SB), share: Math.min(1, Math.max(0, share)) };
  const per = Math.round(1 / DT);
  for (let w = 0; w < FIRE.turn; w++) {
    for (let k = 0; k < per; k++) g.s = stepOnce(SB, g.s, p, DT).state;
    g.hist.prob.push(g.s.prob);
    g.hist.cap.push(g.s.cap);
  }
  g.hist.shares.push(p.share);
  g.week += FIRE.turn;
  g.done = g.week >= FIRE.weeks;
  return g;
}
export function fireRun(shares: number | number[]): FireGame {
  let g = fireNew();
  for (let t = 0; !g.done; t++) g = fireAdvance(g, typeof shares === "number" ? shares : shares[t] ?? 0.5);
  return g;
}
// average open problems over the weeks played (lower is better)
export const fireScore = (g: FireGame) => sum(g.hist.prob.slice(1)) / Math.max(1, g.hist.prob.length - 1);
