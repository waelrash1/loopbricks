import { FLOW_META_A, DIAGRAM_EXTRA_A } from "@/data/extra/batchA";
import { FLOW_META_B, DIAGRAM_EXTRA_B } from "@/data/extra/batchB";
import { FLOW_META_C, DIAGRAM_EXTRA_C } from "@/data/extra/batchC";
import { FLOW_META_E, DIAGRAM_EXTRA_E } from "@/data/extra/batchE";
import { FLOW_META_D, DIAGRAM_EXTRA_D } from "@/data/extra/batchD";
// Presentation metadata for proper Vensim/Stella-style stock-flow diagrams.
// Kept separate from the validated model core in molecules.ts.
//   FLOW_META[modelId][flowId] = { name, eq, in, loop? }
//     name : flow variable name shown at the valve
//     eq   : human-readable rate equation (matches molecules.ts rates())
//     in   : determinant ids — params (→ constant nodes) and stocks (→ feedback arrows)
//     loop : if this flow closes a feedback loop with a stock, its polarity (B/R)
//   DIAGRAM_EXTRA[modelId] = { stocks:[name,eq][], aux?:[name,eq][] }  — for the equation panel

//     loop may also be keyed by stock id when one flow closes loops of different polarity
export type FlowMeta = { name: string; eq: string; in: string[]; loop?: "B" | "R" | Record<string, "B" | "R"> };
export const FLOW_META: Record<string, Record<string, FlowMeta>> = {
  bathtub: {
    in: { name: "Inflow", eq: "inflow", in: ["inflow"] },
    out: { name: "Outflow", eq: "outflow", in: ["outflow"] },
  },
  cascade: {
    in: { name: "inflow", eq: "inflow", in: ["inflow"] },
    f12: { name: "flow 1→2", eq: "Stage1 / τ", in: ["l1", "tau"], loop: "B" },
    f23: { name: "flow 2→3", eq: "Stage2 / τ", in: ["l2", "tau"], loop: "B" },
    out: { name: "outflow", eq: "Stage3 / τ", in: ["l3", "tau"], loop: "B" },
  },
  conversion: {
    in: { name: "feed", eq: "feed", in: ["feed"] },
    made: { name: "production", eq: "(Raw / τ) × yield", in: ["raw", "tau", "yield"], loop: "B" },
    out: { name: "shipments", eq: "Finished / 6", in: ["fin"], loop: "B" },
  },
  split: {
    toA: { name: "to A", eq: "Inflow × f", in: ["inflow", "frac"] },
    toB: { name: "to B", eq: "Inflow × (1 − f)", in: ["inflow", "frac"] },
    outA: { name: "drain A", eq: "A / τ", in: ["a", "tau"], loop: "B" },
    outB: { name: "drain B", eq: "B / τ", in: ["b", "tau"], loop: "B" },
  },
  broken: {
    in: { name: "inflow", eq: "inflow", in: ["inflow"] },
    fwd: { name: "advance", eq: "(Stage1 / τ)(1 − L)", in: ["l1", "tau", "leak"], loop: "B" },
    leak: { name: "leak (lost)", eq: "(Stage1 / τ) · L", in: ["l1", "tau", "leak"], loop: "B" },
    out: { name: "outflow", eq: "Stage2 / τ", in: ["l2", "tau"], loop: "B" },
  },
  decay: {
    out: { name: "decay", eq: "Stock / τ", in: ["q", "tau"], loop: "B" },
  },
  residence: {
    in: { name: "inflow", eq: "inflow", in: ["inflow"] },
    out: { name: "outflow", eq: "Stock / τ", in: ["q", "tau"], loop: "B" },
  },
  material: {
    in: { name: "inflow", eq: "inflow", in: ["inflow"] },
    f1: { name: "flow 1→2", eq: "Transit1 / (delay/3)", in: ["l1", "delay"], loop: "B" },
    f2: { name: "flow 2→3", eq: "Transit2 / (delay/3)", in: ["l2", "delay"], loop: "B" },
    out: { name: "arrivals", eq: "Transit3 / (delay/3)", in: ["l3", "delay"], loop: "B" },
  },
  aging: {
    in: { name: "births", eq: "births", in: ["births"] },
    aYA: { name: "maturation", eq: "Youth / τ_youth", in: ["young", "tY"], loop: "B" },
    aAO: { name: "retirement", eq: "Working / τ_adult", in: ["adult", "tA"], loop: "B" },
    deaths: { name: "deaths", eq: "Elderly / τ_elder", in: ["old", "tO"], loop: "B" },
  },
  smooth: {
    adj1: { name: "adjust (1st)", eq: "(Input − Perceived₁) / τ", in: ["input", "s1", "tau"], loop: "B" },
    adj3: { name: "adjust (3rd)", eq: "(stage₂ − Perceived₃) / (τ/3)", in: ["s3", "tau"], loop: "B" },
  },
  closegap: {
    adj: { name: "adjustment", eq: "(Goal − Actual) / AT", in: ["goal", "actual", "at"], loop: "B" },
  },
  stockmgmt: {
    orders: {
      name: "order rate",
      eq: "MAX(0, demand + (desInv − Inventory)/τ + (desiredSL − w·SupplyLine)/τ)",
      in: ["demand", "desInv", "inv", "sl", "adj", "acq", "slw"],
      loop: "B",
    },
    acquisition: { name: "acquisition", eq: "SupplyLine / acquisition delay", in: ["sl", "acq"], loop: "B" },
    sales: { name: "sales", eq: "demand", in: ["demand"] },
  },
  trend: {
    grow: { name: "growth", eq: "Actual × g", in: ["input", "g"], loop: "R" },
    perceive: { name: "perception", eq: "(Actual − Perceived) / τ_p", in: ["input", "ppv", "tp"], loop: "B" },
  },
  coflow: {
    hireFlow: { name: "hiring", eq: "hire", in: ["hire"] },
    quitFlow: { name: "attrition", eq: "Headcount / tenure", in: ["people", "tenure"], loop: "B" },
  },
  growth: {
    births: { name: "births", eq: "Population × b", in: ["pop", "birth"], loop: "R" },
    deaths: { name: "deaths", eq: "Population × d", in: ["pop", "death"], loop: "B" },
  },
  logistic: {
    births: { name: "growth", eq: "r × Population", in: ["pop", "r"], loop: "R" },
    crowding: { name: "crowding deaths", eq: "r × Population × (Population / K)", in: ["pop", "r", "K"], loop: "B" },
  },
  diffusion: {
    adoption: { name: "adoption", eq: "(p + q · Adopters/N) × Potential", in: ["pot", "adopt", "p", "q"], loop: { pot: "B", adopt: "R" } },
  },
  ceiling: {
    in: { name: "inflow", eq: "MIN(desired, (ceiling − Stock) / approach time)", in: ["base", "ceil", "q", "at"], loop: "B" },
  },
  marketshare: {
    toA: { name: "wins → A", eq: "new × share_A", in: ["inflow", "a", "b", "network"], loop: "R" },
    toB: { name: "wins → B", eq: "new × (1 − share_A)", in: ["inflow", "a", "b", "network"], loop: "R" },
    outA: { name: "churn A", eq: "A / churn time", in: ["a", "churn"], loop: "B" },
    outB: { name: "churn B", eq: "B / churn time", in: ["b", "churn"], loop: "B" },
  },
  floor: {
    out: { name: "drain", eq: "MAX(0, MIN(desired, (Stock − floor)/approach time))", in: ["q", "base", "floor", "at"], loop: "B" },
  },
  protLevel: {
    in: { name: "replenish", eq: "replenishment", in: ["inflow"] },
    out: { name: "draining", eq: "desired × MIN(1, Level / protect-below)", in: ["level", "desiredOut", "protectBelow"], loop: "B" },
  },
  protFlow: {
    in: { name: "replenish", eq: "replenishment", in: ["inflow"] },
    out: { name: "draining", eq: "MIN(desired, Level / fastest draining time)", in: ["level", "desiredOut", "fastest"], loop: "B" },
  },
  backlogFlow: {
    in: { name: "orders", eq: "order rate", in: ["orders"] },
    ship: { name: "shipping", eq: "MIN(Backlog / desired ship time, capacity)", in: ["backlog", "shipTime", "capacity"], loop: "B" },
  },
  backlogLevel: {
    orders: { name: "orders", eq: "order rate", in: ["orders"] },
    fulfilling: { name: "fulfilling", eq: "(Backlog/ship time) × MIN(1, Inventory/full-service)", in: ["backlog", "shipTime", "inventory", "protectInv"], loop: "B" },
    producing: { name: "producing", eq: "production", in: ["producing"] },
    shipping: { name: "shipping", eq: "(Backlog/ship time) × MIN(1, Inventory/full-service)", in: ["backlog", "shipTime", "inventory", "protectInv"], loop: "B" },
  },
  capacityUtil: {
    prod: { name: "production", eq: "capacity × utilization(desired / capacity)", in: ["capacity", "demand", "inventory", "targetInv", "adj"], loop: "B" },
    sales: { name: "sales", eq: "demand", in: ["demand"] },
  },
  weightedAvg: {
    adjust: { name: "adjust to blend", eq: "(w·A + (1−w)·B − estimate) / τ", in: ["srcA", "srcB", "weightA", "tau", "estimate"], loop: "B" },
  },
  presentValue: {
    discounting: { name: "discounting", eq: "cash flow × e^(−r·t)", in: ["cashFlow", "r"] },
  },
  seaAnchor: {
    changeAnchor: { name: "change anchor", eq: "(value − Anchor) / anchor lag", in: ["anchor", "pressure", "timeToChange"], loop: "R" },
  },
  smoothPricing: {
    changing: { name: "changing price", eq: "(indicated price − Price) / adj time", in: ["price", "refPrice", "pressure", "tau"], loop: "B" },
  },
  prodFatigue: {
    gettingFatigued: { name: "getting fatigued", eq: "(overtime − Fatigue) / time to fatigue", in: ["overtime", "fatigue", "timeToFatigue"], loop: "B" },
  },
  reworkCycle: {
    correct: { name: "correct work", eq: "accomplishing × quality", in: ["workToDo", "capacity", "quality"], loop: "B" },
    rework: { name: "creating rework", eq: "accomplishing × (1 − quality)", in: ["workToDo", "capacity", "quality"], loop: "B" },
    discovering: { name: "discovering rework", eq: "Undiscovered / discovery time", in: ["undiscovered", "discoverTime"], loop: "R" },
  },
  estCompletion: {
    in: { name: "scope creep", eq: "scope creep", in: ["scopeCreep"] },
    accomplishing: { name: "accomplishing", eq: "MIN(work rate, Work remaining / 0.5)", in: ["workRemaining", "workRate"], loop: "B" },
  },
  agingPDY: {
    hire: { name: "hiring", eq: "hiring", in: ["hiring"] },
    mature: { name: "maturing", eq: "Rookies / time to mature", in: ["rookies", "tMature"], loop: "B" },
    senior: { name: "becoming senior", eq: "Experienced / experienced tenure", in: ["experienced", "tExp"], loop: "B" },
    retire: { name: "retiring", eq: "Veterans / veteran tenure", in: ["gray", "tGray"], loop: "B" },
  },
  workforce: {
    hiring: { name: "hiring", eq: "MAX(0, (desired − Workforce) / time to hire)", in: ["desired", "workforce", "tHire"], loop: "B" },
    firing: { name: "firing", eq: "MAX(0, (Workforce − desired) / time to hire)", in: ["desired", "workforce", "tHire"], loop: "B" },
  },
  effectFunction: {
    inflow: { name: "modulated flow", eq: "normal flow × effect(Input / Reference)", in: ["normalFlow", "input", "reference"] },
    outflow: { name: "drain", eq: "Result / drain time", in: ["result", "drainTau"], loop: "B" },
  },
  cascadedCoflow: {
    in: { name: "input", eq: "input", in: ["input"] },
    f12: { name: "stage 1→2", eq: "WIP1 / stage time", in: ["wip1", "tau"], loop: "B" },
    f23: { name: "completion", eq: "WIP2 / stage time", in: ["wip2", "tau"], loop: "B" },
  },
  doingWork: {
    in: { name: "new work", eq: "new work", in: ["newWork"] },
    accomplishing: { name: "doing work", eq: "workforce × productivity (capped by backlog)", in: ["workforce", "productivity", "backlog"], loop: "B" },
  },
  schedulePressure: {
    workRate: { name: "work rate", eq: "normal rate × effect(schedule pressure)", in: ["workRemaining", "baseRate", "scheduled"], loop: "B" },
  },
  multiSplit: {
    toA: { name: "to A", eq: "inflow × wA / Σw", in: ["inflow", "wA", "wB", "wC"] },
    toB: { name: "to B", eq: "inflow × wB / Σw", in: ["inflow", "wA", "wB", "wC"] },
    toC: { name: "to C", eq: "inflow × wC / Σw", in: ["inflow", "wA", "wB", "wC"] },
    outA: { name: "drain A", eq: "A / τ", in: ["chA", "tau"], loop: "B" },
    outB: { name: "drain B", eq: "B / τ", in: ["chB", "tau"], loop: "B" },
    outC: { name: "drain C", eq: "C / τ", in: ["chC", "tau"], loop: "B" },
  },
  protectedSeaAnchor: {
    changeAnchor: { name: "change anchor", eq: "(target − Anchor) / lag,  target = (1−p)·value + p·fundamental", in: ["anchor", "pressure", "fundamental", "protection", "timeToChange"], loop: "B" },
  },
  // molecules added from the book's remaining entries (src/data/extra)
  ...FLOW_META_A,
  ...FLOW_META_B,
  ...FLOW_META_C,
  ...FLOW_META_D,
  ...FLOW_META_E,
};

type Eq = [string, string];
export const DIAGRAM_EXTRA: Record<string, { stocks: Eq[]; aux?: Eq[] }> = {
  bathtub: { stocks: [["Level", "INTEG(Inflow − Outflow, 50)"]] },
  cascade: {
    stocks: [
      ["Stage1", "INTEG(inflow − flow 1→2, 60)"],
      ["Stage2", "INTEG(flow 1→2 − flow 2→3, 0)"],
      ["Stage3", "INTEG(flow 2→3 − outflow, 0)"],
    ],
  },
  conversion: {
    stocks: [
      ["Raw", "INTEG(feed − production/yield, 100)"],
      ["Finished", "INTEG(production − shipments, 0)"],
    ],
    aux: [["conversion", "Raw / τ  (tons/mo converted)"]],
  },
  split: {
    stocks: [
      ["Channel A", "INTEG(to A − drain A, 0)"],
      ["Channel B", "INTEG(to B − drain B, 0)"],
    ],
  },
  broken: {
    stocks: [
      ["Stage1", "INTEG(inflow − advance − leak, 80)"],
      ["Stage2", "INTEG(advance − outflow, 0)"],
    ],
  },
  decay: { stocks: [["Stock", "INTEG(−decay, 100)"]], aux: [["solution", "Stock(t) = Stock₀ · e^(−t/τ)"]] },
  residence: { stocks: [["Stock", "INTEG(inflow − outflow, 0)"]], aux: [["equilibrium", "Stock* = inflow × τ ; τ = residence time"]] },
  material: {
    stocks: [
      ["Transit1", "INTEG(inflow − flow 1→2, 0)"],
      ["Transit2", "INTEG(flow 1→2 − flow 2→3, 0)"],
      ["Transit3", "INTEG(flow 2→3 − arrivals, 0)"],
    ],
    aux: [["stage time", "delay / 3"], ["in-transit", "Σ Transit = inflow × delay"]],
  },
  aging: {
    stocks: [
      ["Youth", "INTEG(births − maturation, 300)"],
      ["Working", "INTEG(maturation − retirement, 800)"],
      ["Elderly", "INTEG(retirement − deaths, 200)"],
    ],
    aux: [["cohort (eq.)", "flow-in × bracket duration"]],
  },
  smooth: {
    stocks: [
      ["Perceived₁", "INTEG(adjust(1st), 30) = SMOOTH(Input, τ)"],
      ["Perceived₃", "SMOOTH3(Input, τ) — three τ/3 stages"],
    ],
    aux: [["Input", "step to 'Input level' (the signal being tracked)"]],
  },
  closegap: { stocks: [["Actual", "INTEG(adjustment, 20)"]], aux: [["gap", "Goal − Actual"]] },
  stockmgmt: {
    stocks: [
      ["Supply line", "INTEG(order rate − acquisition, 60)"],
      ["Inventory", "INTEG(acquisition − sales, 60)"],
    ],
    aux: [["desired supply line", "demand × acquisition delay"]],
  },
  trend: {
    stocks: [
      ["Actual", "INTEG(growth, 100) — grows at g %/mo"],
      ["Perceived", "INTEG(perception, 100) = SMOOTH(Actual, τ_p)"],
    ],
    aux: [
      ["perceived trend", "(Actual − Perceived) / (Perceived · τ_p)"],
      ["forecast", "Actual × (1 + trend × horizon)"],
    ],
  },
  coflow: {
    stocks: [
      ["Headcount", "INTEG(hiring − attrition, 50)"],
      ["Total experience", "INTEG(hire·hireExp + Headcount·1 − attrition·avg, 100)"],
      ["Avg experience", "Total experience / Headcount"],
    ],
    aux: [["average", "Total experience ÷ Headcount (intensive attribute)"]],
  },
  growth: { stocks: [["Population", "INTEG(births − deaths, 100)"]], aux: [["doubling time", "≈ 70 / (b − d)%"]] },
  logistic: { stocks: [["Population", "INTEG(growth − crowding deaths, 10)"]], aux: [["net rate", "r · Pop · (1 − Pop/K)"], ["equilibrium", "Pop* = K (carrying capacity)"]] },
  diffusion: {
    stocks: [
      ["Potential", "INTEG(−adoption, 1000)"],
      ["Adopters", "INTEG(adoption, 0)"],
    ],
    aux: [["market size", "N = Potential + Adopters"]],
  },
  ceiling: { stocks: [["Stock", "INTEG(inflow, 10)"]], aux: [["headroom", "ceiling − Stock"]] },
  marketshare: {
    stocks: [
      ["Product A", "INTEG(wins→A − churn A, 105)"],
      ["Product B", "INTEG(wins→B − churn B, 95)"],
    ],
    aux: [
      ["φ (returns)", "1 + 2 × network effect"],
      ["share_A", "Aᵠ / (Aᵠ + Bᵠ)"],
    ],
  },
  floor: { stocks: [["Stock", "INTEG(−drain, 100)"]], aux: [["headroom", "Stock − floor"]] },
  protLevel: {
    stocks: [["Inventory", "INTEG(replenish − draining, 100)"]],
    aux: [["effect of level", "MIN(1, Level / protect-below)"], ["equilibrium", "Level* = protect-below × inflow/desired"]],
  },
  protFlow: {
    stocks: [["On hand", "INTEG(replenish − draining, 80)"]],
    aux: [["max outflow", "Level / fastest draining time"]],
  },
  backlogFlow: {
    stocks: [["Backlog", "INTEG(orders − shipping, 60)"]],
    aux: [["desired shipping", "Backlog / desired ship time"], ["steady backlog", "orders × ship time (if capacity ample)"]],
  },
  backlogLevel: {
    stocks: [
      ["Backlog", "INTEG(orders − fulfilling, 30)"],
      ["Inventory", "INTEG(producing − shipping, 100)"],
    ],
    aux: [
      ["desired shipping", "Backlog / desired ship time"],
      ["inventory effect", "MIN(1, Inventory / full-service inventory)"],
      ["shipping", "desired shipping × inventory effect (= fulfilling)"],
    ],
  },
  capacityUtil: {
    stocks: [["Inventory", "INTEG(production − sales, 50)"]],
    aux: [["desired production", "demand + (target − Inventory)/restock"], ["utilization", "1 − e^(−1.3 × desired/capacity)"]],
  },
  weightedAvg: { stocks: [["Estimate", "INTEG(adjust to blend, 50)"]], aux: [["blend", "w·A + (1−w)·B"]] },
  presentValue: {
    stocks: [["Present value", "INTEG(discounting, 0)"], ["elapsed time", "INTEG(1, 0)"]],
    aux: [["discount factor", "e^(−r · elapsed)"], ["perpetuity limit", "cash flow / r"]],
  },
  seaAnchor: {
    stocks: [["Anchor", "INTEG((value − Anchor)/anchor lag, 100)"]],
    aux: [["value", "Anchor × adjustment pressure"]],
  },
  smoothPricing: {
    stocks: [["Price", "INTEG((indicated − Price)/adj time, 10)"]],
    aux: [["indicated price", "reference price × market pressure"]],
  },
  prodFatigue: {
    stocks: [["Fatigue", "INTEG((overtime − Fatigue)/time to fatigue, 1)"]],
    aux: [
      ["effect on PDY", "MIN(1.1, MAX(0.3, 2 − Fatigue))"],
      ["output", "workforce × normal PDY × overtime × effect"],
      ["relative output", "overtime × effect (× normal)"],
    ],
  },
  reworkCycle: {
    stocks: [
      ["Work to do", "INTEG(discovering − correct − rework, 1000)"],
      ["Undiscovered rework", "INTEG(rework − discovering, 0)"],
      ["Work done", "INTEG(correct work, 0)"],
    ],
    aux: [["accomplishing", "MIN(capacity, Work to do / 0.5)"]],
  },
  estCompletion: {
    stocks: [["Work remaining", "INTEG(scope creep − accomplishing, 500)"]],
    aux: [["remaining duration", "Work remaining / work rate"], ["completion date", "now + remaining duration"]],
  },
  agingPDY: {
    stocks: [
      ["Rookies", "INTEG(hiring − maturing, 100)"],
      ["Experienced", "INTEG(maturing − becoming senior, 200)"],
      ["Veterans", "INTEG(becoming senior − retiring, 50)"],
    ],
    aux: [["production", "Rookies×0.5 + Experienced×1.0 + Veterans×0.8"]],
  },
  workforce: { stocks: [["Workforce", "INTEG(hiring − firing, 40)"]], aux: [["gap", "desired − Workforce"]] },
  effectFunction: {
    stocks: [["Result", "INTEG(modulated flow − drain, 50)"]],
    aux: [["relative input", "Input / Reference"], ["effect", "2·rel / (1 + rel)  [f(1)=1]"]],
  },
  cascadedCoflow: {
    stocks: [
      ["WIP stage 1", "INTEG(input − stage 1→2, 32)"],
      ["WIP stage 2", "INTEG(stage 1→2 − completion, 0)"],
      ["Avg cost · stage 1", "cost in stage 1 / WIP stage 1"],
      ["Avg cost · stage 2", "cost in stage 2 / WIP stage 2"],
    ],
    aux: [["coflow", "cost carried with units + value added each stage"]],
  },
  doingWork: {
    stocks: [
      ["Backlog", "INTEG(new work − doing work, 600)"],
      ["Completed", "INTEG(doing work, 0)"],
    ],
    aux: [["work rate", "workforce × productivity  (the 'producing' molecule)"]],
  },
  schedulePressure: {
    stocks: [["Work remaining", "INTEG(−work rate, 400)"], ["elapsed", "INTEG(1, 0)"]],
    aux: [
      ["time to deadline", "scheduled date − elapsed"],
      ["required rate", "Work remaining / time to deadline"],
      ["schedule pressure", "required rate / normal rate"],
    ],
  },
  multiSplit: {
    stocks: [
      ["Channel A", "INTEG(to A − drain A, 0)"],
      ["Channel B", "INTEG(to B − drain B, 0)"],
      ["Channel C", "INTEG(to C − drain C, 0)"],
    ],
    aux: [["share i", "wᵢ / (wA + wB + wC)"], ["steady level i", "shareᵢ × inflow × τ"]],
  },
  protectedSeaAnchor: {
    stocks: [["Anchor", "INTEG((target − Anchor)/lag, 100)"]],
    aux: [
      ["value", "Anchor × adjustment pressure"],
      ["target", "(1 − protection)·value + protection·fundamental"],
      ["equilibrium", "protection·fundamental / (1 − (1−protection)·pressure)"],
    ],
  },
  // molecules added from the book's remaining entries (src/data/extra)
  ...DIAGRAM_EXTRA_A,
  ...DIAGRAM_EXTRA_B,
  ...DIAGRAM_EXTRA_C,
  ...DIAGRAM_EXTRA_D,
  ...DIAGRAM_EXTRA_E,
};
