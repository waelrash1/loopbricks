// Batch A: additional molecules from Hines, "Molecules of Structure".
// Same shapes as molecules.ts / diagramMeta.ts / lessons.ts / presets.ts; merged by the catalog.
import type { Model } from "@/data/molecules";
import type { FlowMeta } from "@/data/diagramMeta";
import type { Lesson } from "@/data/lessons";
import type { Preset } from "@/data/presets";

const C = { acc: "#2545ff", acc2: "#d9480f", good: "#0f8a5f", pink: "#c2255c" }; // same series palette as molecules.ts

const DT = 0.1; // engine step: used only to stop a flow emptying a stock past zero
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ---- illustrative "user defined functions" (all pass through the neutral point) ----
// Univariate anchoring: Adjustment f(pressure) = pressure ^ strength  → f(1) = 1 for any strength.
const adjF = (pressure: number, strength: number) => Math.pow(Math.max(pressure, 1e-6), strength);
// Multivariate anchoring: three fixed shapes, each f(1) = 1.
const mvF1 = (x: number) => Math.sqrt(Math.max(x, 0)); // rises, less than proportionally
const mvF2 = (x: number) => 1 / Math.sqrt(Math.max(x, 1e-6)); // falls
const mvF3 = (x: number) => Math.max(x, 0); // proportional
// Quality effects: input 1 = normal → effect 1.
const qFatigue = (f: number) => clamp(1 - 0.4 * (f - 1), 0.4, 1.1);
const qPressure = (sp: number) => clamp(1 - 0.3 * (sp - 1), 0.4, 1.1);
const qAdequacy = (w: number) => clamp(0.5 + 0.5 * w, 0.5, 1.05);
const qSkill = (k: number) => clamp(0.4 + 0.6 * k, 0.4, 1.1);
const qualityOf = (p: Record<string, number>) =>
  clamp(p.normalQ * qFatigue(p.fatigue) * qPressure(p.sched) * qAdequacy(p.adequacy) * qSkill(p.skill), 0, 1);

export const MODELS_A: Record<string, Model> = {
  // ============================== GO TO ZERO ==============================
  goToZero: {
    name: "Go To Zero",
    title: "Go To Zero (Action That Empties a Stock)",
    timeUnit: "mo",
    unitY: "widgets",
    lede: "The action that would take a quantity to zero over a given time is simply the quantity divided by that time. It is the seed of every decay, delay and drain.",
    stocks: [
      { id: "cur", label: "Current value", init: 100, scale: 100, color: C.acc },
      { id: "plan", label: "If action held constant", init: 100, scale: 100, color: C.acc2 },
    ],
    params: [
      { id: "tau", label: "Time to go to zero", min: 1, max: 20, step: 0.5, value: 5, unit: "mo" },
      { id: "inflow", label: "Replenishment", min: 0, max: 20, step: 0.5, value: 0, unit: "/mo" },
    ],
    rates: (s, p) => ({
      in: p.inflow,
      action: s.cur / p.tau, // ActionToGoToZero = CurrentValue / timeToGoToZero (recomputed every instant)
      planOut: Math.min(100 / p.tau, s.plan / DT), // the same action frozen at its initial value
    }),
    derivs: (_s, _p, r) => ({ cur: r.in - r.action, plan: -r.planOut }),
    diagram: {
      stocks: { cur: { x: 150, y: 95, w: 120, h: 110 }, plan: { x: 520, y: 95, w: 120, h: 110 } },
      flows: [
        { id: "in", pts: [[40, 150], [150, 150]], to: "cur", max: 20 },
        { id: "action", pts: [[270, 150], [395, 150]], from: "cur", max: 30, color: C.pink },
        { id: "planOut", pts: [[640, 150], [785, 150]], from: "plan", max: 30, color: C.acc2 },
      ],
    },
    cld: {
      vars: [
        { id: "cv", label: "Current value", x: 120, y: 160 },
        { id: "act", label: "Action to go to zero", x: 390, y: 160 },
        { id: "t", label: "Time to go to zero", x: 390, y: 50 },
      ],
      links: [
        { from: "cv", to: "act", sign: "+", curve: -46 },
        { from: "act", to: "cv", sign: "−", curve: -46 },
        { from: "t", to: "act", sign: "−" },
      ],
      loops: [{ type: "B", label: "B1", x: 242, y: 160 }],
      caption:
        '<span class="chip chipB">B1</span> The action is the current value divided by the time allowed. On its own the formula has no stock and no behavior; wire the action back as the <b>outflow</b> of the value it reads and you get a balancing loop: the action shrinks as the value shrinks, so the value approaches zero but never arrives on schedule.',
    },
    desc: `<p>Go To Zero is the smallest molecule in Hines' collection and has no parents: to drive a quantity to zero over a given time, act at a rate equal to the <b>quantity divided by that time</b>. If the action stayed constant the quantity would hit zero exactly on schedule (the orange stock). Usually it does not stay constant: the action itself lowers the current value, so the action keeps shrinking and the quantity only approaches zero (the blue stock).</p>
    <div class="eq">ActionToGoToZero = CurrentValue / timeToGoToZero</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it whenever you need a <b>flow that empties something</b>: the outflow of a decay or a material delay, or the desired shipping rate that would clear a backlog. Keep the time strictly positive, if <code>timeToGoToZero</code> is a variable, make sure it can never reach zero. Add <b>Replenishment</b> here and the same action holds the value at <code>inflow × time</code>, which is the Residence Time molecule.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b>: the treatment rate needed to clear a waiting list within a target time.</li>
      <li><b>Sustainability</b>: the write-off rate that retires a stock of obsolete equipment over its remaining life.</li>
      <li><b>Operations</b>: desired shipping = backlog ÷ target delivery delay.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Current value 100 widgets, time to go to zero 5 months ⇒ action = <code>100 / 5 = 20 widgets/mo</code>. Held constant at 20, the orange stock is empty at exactly month 5. Recomputed as the value falls, the blue stock still holds about <b>37</b> at month 5 and about 5 at month 15 (three time constants). Set Replenishment to 8/mo and the blue stock settles where the action equals the inflow: <code>8 × 5 = 40</code>.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i>, Go To Zero.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, first-order linear negative feedback and exponential decay.</li>
    </ul>`,
  },

  // ===================== FIRST-ORDER STOCK ADJUSTMENT =====================
  stockAdjust: {
    name: "First-Order Stock Adjustment",
    title: "First-Order Stock Adjustment (Replace + Correct)",
    timeUnit: "mo",
    unitY: "widgets",
    lede: "Keep a stock at its desired level with a two-part stocking decision: replace whatever flows out, and add a little extra to close the gap.",
    stocks: [{ id: "level", label: "Level", init: 40, scale: 130, color: C.acc }],
    params: [
      { id: "out", label: "outFlow", min: 0, max: 30, step: 0.5, value: 10, unit: "/mo" },
      { id: "desired", label: "Desired level", min: 20, max: 200, step: 5, value: 100, unit: "" },
      { id: "adj", label: "Adjustment time", min: 1, max: 12, step: 0.5, value: 4, unit: "mo" },
      { id: "repl", label: "Replacement fraction", min: 0, max: 1, step: 0.05, value: 1, unit: "" },
    ],
    rates: (s, p) => {
      const gap = p.desired - s.level;
      const toAdjust = gap / p.adj; // StockingToAdjustLevelToDesired
      const forReplacement = p.repl * p.out; // StockingForReplacement (book: = outFlow, i.e. fraction 1)
      return {
        stocking: Math.max(0, toAdjust + forReplacement), // cannot "un-stock"
        outflow: Math.min(p.out, s.level / DT),
      };
    },
    derivs: (_s, _p, r) => ({ level: r.stocking - r.outflow }),
    diagram: {
      stocks: { level: { x: 350, y: 95, w: 120, h: 120 } },
      flows: [
        { id: "stocking", pts: [[40, 155], [350, 155]], to: "level", max: 40 },
        { id: "outflow", pts: [[470, 155], [785, 155]], from: "level", max: 40, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "des", label: "Desired level", x: 80, y: 50 },
        { id: "gap", label: "Gap", x: 230, y: 50 },
        { id: "stk", label: "Stocking", x: 420, y: 50 },
        { id: "lvl", label: "Level", x: 230, y: 185 },
        { id: "out", label: "outFlow", x: 430, y: 185 },
      ],
      links: [
        { from: "des", to: "gap", sign: "+" },
        { from: "gap", to: "stk", sign: "+" },
        { from: "stk", to: "lvl", sign: "+", curve: -14 },
        { from: "lvl", to: "gap", sign: "−" },
        { from: "out", to: "lvl", sign: "−" },
        { from: "out", to: "stk", sign: "+", note: "replacement" },
      ],
      loops: [{ type: "B", label: "B1", x: 285, y: 95 }],
      caption:
        '<span class="chip chipB">B1</span> A gap between desired and actual level raises stocking, which raises the level and closes the gap. The <b>replacement</b> link is not part of the loop: it simply cancels the outflow, so the loop only has to deal with the gap. Remove it and the stock settles permanently short of its goal.',
    },
    desc: `<p>The heart of this molecule is the <b>stocking decision</b>, which has two parts. First, order whatever is being used up (<i>StockingForReplacement</i>), that alone keeps the level where it is. Second, order a bit more or a bit less to move the level to its desired value (<i>StockingToAdjustLevelToDesired</i>), in the usual goal-gap way. Structurally it is a smooth with one piece added to take care of the outflow, and it behaves like a smooth whatever the outflow is.</p>
    <div class="eq">Stocking = (DesiredLevel − Level) / AdjustmentTime + outFlow</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it when a decision maker tops up a stock that is continuously drained and <b>supply is immediate</b> (off-the-shelf purchasing, cash transfers, staffing from a ready pool). If what you order arrives only after a delay you must also account for the supply pipeline: see the pipeline-correction molecules. Slide <b>Replacement fraction</b> below 1 to see why the replacement term matters: the level then rests below its goal by <code>(1 − fraction) × outFlow × AdjustmentTime</code>.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b>: a ward restocking consumables from the hospital store: replace what was used, plus a correction toward par level.</li>
      <li><b>Sustainability</b>: topping up a reservoir or strategic reserve against a steady draw.</li>
      <li><b>Business</b>: purchasing to hold a finished-goods inventory against shipments.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Level 40, desired 100, adjustment time 4 months, outflow 10/mo. Gap = 60, so stocking = <code>60/4 + 10 = 25/mo</code> and the level rises at a net 15/mo. The gap decays like a smooth: about 22 left after 4 months (level ≈ 78) and about 3 after 12 months (level ≈ 97). Now set Replacement fraction to 0: stocking is only <code>gap/4</code>, which balances the 10/mo outflow at a gap of 40: the level stalls at <b>60</b>.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i>, First-Order Stock Adjustment.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 17: the stock-management structure.</li>
    </ul>`,
  },

  // ================== LOW-VISIBILITY PIPELINE CORRECTION ==================
  lowVisPipeline: {
    name: "Low-Visibility Pipeline Correction",
    title: "Low-Visibility Pipeline Correction (Orders Not Received)",
    timeUnit: "wk",
    unitY: "cases",
    lede: "Adjust an inventory through a supplier you cannot see into: track only the orders you have placed but not received, and infer the delivery delay from them.",
    stocks: [
      { id: "onr", label: "Orders not received", init: 60, scale: 160, color: C.acc2 },
      { id: "s1", label: "", init: 30, scale: 100, color: C.acc2, hidden: true }, // supplier's first stage (invisible to the buyer)
      { id: "inv", label: "Inventory", init: 60, scale: 160, color: C.acc },
    ],
    params: [
      { id: "ship", label: "Shipping", min: 2, max: 20, step: 0.5, value: 10, unit: "/wk" },
      { id: "tInv", label: "Time to correct inventory", min: 1, max: 12, step: 0.5, value: 4, unit: "wk" },
      { id: "tPipe", label: "Time to correct pipeline", min: 1, max: 12, step: 0.5, value: 4, unit: "wk" },
      { id: "delay", label: "Supplier delay", min: 2, max: 12, step: 0.5, value: 6, unit: "wk" },
      { id: "aware", label: "Awareness of pipeline", min: 0, max: 1, step: 0.05, value: 1, unit: "" },
    ],
    rates: (s, p) => {
      const DESIRED_INV = 100;
      const stage = p.delay / 2; // supplier = two hidden first-order stages
      const receiving = Math.max(0, s.onr - s.s1) / stage; // Receiving Product = Orders being fulfilled
      // CalculatedDeliveryDelay = Orders Not Received / Orders being fulfilled (guarded, capped at 30 wk)
      const calcDelay = Math.min(30, s.onr / Math.max(receiving, 1e-6));
      const required = p.ship * calcDelay; // RequiredOrdersInPipeline = ForecastedDemand × delay
      const pipelineGap = (required - s.onr) * p.aware; // OrderPipelineGap
      const corrPipe = pipelineGap / p.tPipe;
      const corrInv = (DESIRED_INV - s.inv) / p.tInv;
      return {
        ordering: Math.max(0, corrPipe + p.ship + corrInv),
        receiving,
        shipping: Math.min(p.ship, s.inv / DT),
      };
    },
    derivs: (s, p, r) => ({
      onr: r.ordering - r.receiving,
      s1: r.ordering - s.s1 / (p.delay / 2),
      inv: r.receiving - r.shipping,
    }),
    diagram: {
      stocks: { onr: { x: 220, y: 95, w: 140, h: 110 }, inv: { x: 520, y: 95, w: 130, h: 110 } },
      flows: [
        { id: "ordering", pts: [[40, 150], [220, 150]], to: "onr", max: 30 },
        { id: "receiving", pts: [[360, 150], [520, 150]], from: "onr", to: "inv", max: 30 },
        { id: "shipping", pts: [[650, 150], [788, 150]], from: "inv", max: 30, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "ord", label: "Ordering", x: 130, y: 55 },
        { id: "inv", label: "Inventory", x: 400, y: 55 },
        { id: "onr", label: "Orders not received", x: 130, y: 190 },
        { id: "rec", label: "Receiving", x: 400, y: 190 },
      ],
      links: [
        { from: "inv", to: "ord", sign: "−", curve: -22 },
        { from: "ord", to: "onr", sign: "+", curve: -46 },
        { from: "onr", to: "rec", sign: "+", curve: 46 },
        { from: "rec", to: "inv", sign: "+", curve: 22 },
        { from: "rec", to: "onr", sign: "−", curve: 46 },
        { from: "onr", to: "ord", sign: "−", curve: -46, note: "× awareness" },
      ],
      loops: [{ type: "B", label: "B1", x: 265, y: 112 }, { type: "B", label: "B2", x: 265, y: 190 }, { type: "B", label: "B3", x: 130, y: 122 }],
      caption:
        '<span class="chip chipB">B1</span> inventory correction and <span class="chip chipB">B2</span> pipeline correction, plus <span class="chip chipB">B3</span> the pipeline emptying as product is received. The buyer cannot see inside the supplier, only the count of <b>orders not received</b>. Dividing that count by the rate at which orders are being fulfilled gives a calculated delivery delay, and from it the pipeline that <i>should</i> exist. Low <b>awareness</b> weakens B2: the same order is effectively placed more than once.',
    },
    desc: `<p>As in First-Order Stock Adjustment, ordering replaces what is shipped and corrects the inventory gap. This molecule adds the hidden part of inventory: product that has been ordered but has <b>not yet been received</b>. The decision maker has no view of the supplier's process, so the pipeline is tracked as a simple count, and the delivery delay is <i>calculated</i> from that count and the current receiving rate. In steady state the orders not received equal the ordering rate times the time it takes to receive them.</p>
    <div class="eq">Ordering = MAX(0, ReplacementOrdering + inventoryCorrection + correctionForOrdersInPipeline)<br/>correctionForOrdersInPipeline = (ForecastedDemand × CalculatedDeliveryDelay − OrdersNotReceived) × Awareness / TimeToCorrectOrderPipeline<br/>CalculatedDeliveryDelay = OrdersNotReceived / OrdersBeingFulfilled</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it for a buyer who orders from an <b>outside supplier</b> and knows only what is outstanding: each stage of the Beer Game is largely this structure. The usual mistake is not keeping track of orders not received; represent it with a small <b>Awareness of pipeline</b> and the result is oscillation. If the decision maker can see the stages of the supply process, use High-Visibility Pipeline Correction (Stock Management in this app) instead.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b>: a pharmacy ordering from a wholesaler: it knows its open purchase orders, not the wholesaler's stock or production.</li>
      <li><b>Sustainability</b>: a utility ordering transformers or turbines from a manufacturer with an opaque order book.</li>
      <li><b>Supply chain</b>: a retailer or distributor in the Beer Distribution Game.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Shipping 10 cases/wk and a supplier that takes 6 wk ⇒ the pipeline should hold <code>10 × 6 = 60</code> cases, which is where Orders Not Received starts. Inventory starts at 60 against a desired 100 (fixed here), so the first order is <code>10 + (100 − 60)/4 + 0 = 20 cases/wk</code>. With awareness = 1 the pipeline bulges to about 84 cases and the inventory climbs to 100 <b>without overshooting</b>. Set awareness to 0 and the pipeline swells to about 98, the inventory overshoots to about 117, and both keep swinging for the rest of the run. Either way the pipeline heads back to 60.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i>, Low-Visibility Pipeline Correction.</li>
      <li>Sterman, J. D. (1989). "Modeling managerial behavior: misperceptions of feedback in a dynamic decision making experiment." <i>Management Science</i> 35(3): 321-339.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 17: supply-line adjustment.</li>
    </ul>`,
  },

  // ========================= COFLOW WITH EXPERIENCE =========================
  coflowExperience: {
    name: "Coflow with Experience",
    title: "Coflow with Experience (Hines Form)",
    timeUnit: "yr",
    unitY: "yrs experience",
    lede: "A workforce in which new people arrive with less experience and everyone gains a year of experience per year. Hiring dilutes the average; time rebuilds it.",
    stocks: [
      { id: "wf", label: "Workforce", init: 80, scale: 250, color: C.acc, chartHidden: true },
      { id: "avg", label: "Average experience", init: 8, scale: 12, color: C.good },
    ],
    params: [
      { id: "hire", label: "Hiring", min: 0, max: 30, step: 0.5, value: 20, unit: "/yr" },
      { id: "ttq", label: "Time to quit or retire", min: 2, max: 20, step: 0.5, value: 8, unit: "yr" },
      { id: "newExp", label: "Avg experience of new hire", min: 0, max: 10, step: 0.5, value: 0, unit: "yr" },
    ],
    rates: (s, p) => {
      // 1 / experience dilution time = hiring / Workforce (capped so an empty workforce cannot blow up the step)
      const dilFrac = Math.min(5, p.hire / Math.max(s.wf, 1e-6));
      const change = (p.newExp - s.avg) * dilFrac; // Change in average experience
      return {
        hiring: p.hire,
        attrition: s.wf / p.ttq,
        gain: 1, // rate of experience gain = 1 year per year
        dilute: Math.max(0, -change),
        change,
      };
    },
    derivs: (_s, _p, r) => ({ wf: r.hiring - r.attrition, avg: r.gain + r.change }),
    diagram: {
      // two separate chains, stacked so their clouds don't collide
      stocks: { wf: { x: 345, y: 40, w: 130, h: 90 }, avg: { x: 345, y: 160, w: 130, h: 90 } },
      flows: [
        { id: "hiring", pts: [[40, 85], [345, 85]], to: "wf", max: 30 },
        { id: "attrition", pts: [[475, 85], [785, 85]], from: "wf", max: 30, color: C.pink },
        { id: "gain", pts: [[40, 205], [345, 205]], to: "avg", max: 1.5, color: C.good },
        { id: "dilute", pts: [[475, 205], [785, 205]], from: "avg", max: 2, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "hire", label: "Hiring", x: 75, y: 130 },
        { id: "wf", label: "Workforce", x: 230, y: 55 },
        { id: "att", label: "Attrition", x: 420, y: 55 },
        { id: "dil", label: "Dilution", x: 230, y: 200 },
        { id: "avg", label: "Avg experience", x: 420, y: 200 },
      ],
      links: [
        { from: "hire", to: "wf", sign: "+" },
        { from: "wf", to: "att", sign: "+", curve: -46 },
        { from: "att", to: "wf", sign: "−", curve: -46 },
        { from: "hire", to: "dil", sign: "+" },
        { from: "wf", to: "dil", sign: "−" },
        { from: "dil", to: "avg", sign: "−", curve: -46 },
        { from: "avg", to: "dil", sign: "+", curve: -46 },
      ],
      loops: [{ type: "B", label: "B1", x: 325, y: 55 }, { type: "B", label: "B2", x: 322, y: 200 }],
      caption:
        '<span class="chip chipB">B1</span> attrition sizes the workforce. <span class="chip chipB">B2</span> newcomers pull the average toward their own experience, at a speed set by the <b>dilution time = Workforce / hiring</b>; the more experienced the average, the more each hire dilutes it. Outside the loops, everyone gains one year of experience per year.',
    },
    desc: `<p>This molecule modifies the regular coflow by adding a <b>steady accumulation of experience</b> as time goes by. Hines gives two equivalent versions. The traditional one carries a stock of total experience and divides by the workforce (that is the app's Coflow entry). The <b>Hines version</b> shown here holds the <i>average</i> directly as a stock: it rises by one year per year and is pulled toward the new hires' experience over the dilution time. The average can then feed an effect on productivity or quality.</p>
    <div class="eq">Average experience = INTEG(Change in average experience + rate of experience gain)<br/>Change in average experience = (avg experience of new hire − Average experience) / (Workforce / hiring)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it when the <b>experience mix</b> of a workforce drives results and the workforce is growing, shrinking or turning over. It answers the question traditional headcount models miss: how green is the team right now? Note what attrition does not do here, leavers are assumed to carry out the average, so only hiring and the passage of time move the average.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b>: average clinical experience on a ward during a rapid recruitment drive.</li>
      <li><b>Sustainability</b>: skill base of an installer workforce (heat pumps, solar) scaling up quickly.</li>
      <li><b>Business</b>: a start-up doubling its engineering team; a firm facing a retirement wave.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Start in the equilibrium for hiring 10/yr and an 8-year stay: workforce <code>10 × 8 = 80</code>, average experience <code>0 + 8 = 8</code> years. Now hire 20 rookies a year. Dilution time is <code>80 / 20 = 4</code> years, so the average first falls at <code>1 − 8/4 = −1</code> year per year. It bottoms out near 6.1 years around year 6, then recovers as the workforce grows toward 160 and the dilution time lengthens to 8 years: ending back at <b>8 years</b>. In equilibrium the average is new-hire experience plus the time people stay, whatever the hiring rate.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i>, Coflow with Experience (Traditional and Hines versions).</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 12 "Coflows and Aging Chains".</li>
    </ul>`,
  },

  // ==================== UNIVARIATE ANCHORING & ADJUSTMENT ====================
  univariateAnchor: {
    name: "Univariate Anchoring and Adjustment",
    title: "Univariate Anchoring and Adjustment",
    timeUnit: "wk",
    unitY: "value",
    lede: "People rarely work a quantity out from scratch. They start from a known value, the anchor, and adjust it for one piece of information.",
    stocks: [
      { id: "judged", label: "Value in use", init: 100, scale: 260, color: C.acc },
      { id: "ind", label: "value = Adjustment × anchor", init: 122.5, scale: 260, color: C.acc2 },
    ],
    params: [
      { id: "anchor", label: "Anchor", min: 20, max: 200, step: 5, value: 100, unit: "" },
      { id: "current", label: "Current value of variable", min: 20, max: 200, step: 5, value: 150, unit: "" },
      { id: "normal", label: "Normal value of variable", min: 50, max: 200, step: 5, value: 100, unit: "" },
      { id: "strength", label: "Adjustment strength", min: -1, max: 1, step: 0.1, value: 0.5, unit: "" },
    ],
    rates: (s, p) => {
      const pressure = p.current / p.normal; // PressureToAdjustAwayFromTheAnchor
      const value = p.anchor * adjF(pressure, p.strength); // value = Adjustment × anchor
      return { value, adjusting: Math.abs(value - s.judged) / 2 };
    },
    // the molecule itself is algebraic; "Value in use" follows it over 2 wk only so the adjustment is visible
    derivs: (s, _p, r) => ({ judged: (r.value - s.judged) / 2, ind: (r.value - s.ind) / DT }),
    diagram: {
      stocks: { judged: { x: 340, y: 90, w: 130, h: 120 } },
      flows: [{ id: "adjusting", pts: [[40, 150], [340, 150]], to: "judged", max: 25 }],
    },
    cld: {
      vars: [
        { id: "cur", label: "Current value", x: 80, y: 50 },
        { id: "nor", label: "Normal value", x: 80, y: 190 },
        { id: "pr", label: "Pressure", x: 215, y: 120 },
        { id: "adj", label: "Adjustment", x: 350, y: 60 },
        { id: "anc", label: "Anchor", x: 350, y: 215 },
        { id: "val", label: "Value", x: 460, y: 140 },
      ],
      links: [
        { from: "cur", to: "pr", sign: "+" },
        { from: "nor", to: "pr", sign: "−" },
        { from: "pr", to: "adj", sign: "+", note: "f( ), f(1) = 1" },
        { from: "adj", to: "val", sign: "+" },
        { from: "anc", to: "val", sign: "+" },
      ],
      loops: [],
      caption:
        'No loops and no stocks in the molecule itself: a <b>pressure</b> (current ÷ normal) is passed through a user-defined function that contains the point (1, 1), and the result multiplies the <b>anchor</b>. The link from pressure to adjustment is drawn positive; a negative <b>adjustment strength</b> reverses it.',
    },
    desc: `<p>Anchoring and adjustment is a common judgmental strategy. Rather than solving a problem from scratch, people take a known quantity: the <b>anchor</b>, and adjust it for new information. Hines' example: I do not know the distance from London to Hamburg, but I know London to Berlin, and Hamburg is closer, so I adjust that figure down "a bit". In the structure, the anchor is multiplied by the effect of one piece of information, and that effect has a neutral value of 1. The function used here is <code>pressure<sup>strength</sup></code>, which passes through (1, 1) for any strength.</p>
    <div class="eq">value = Adjustment × anchor;&nbsp; Adjustment = f(PressureToAdjustAwayFromTheAnchor)&nbsp; [f(1) = 1]<br/>Pressure = currentValueOfSomeVariable / normalValueOfSomeVariable</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it to model how someone judges an "appropriate" value, and as a practical way to write a function whose <b>equilibrium is easy to change</b>: at normal conditions the value simply equals the anchor. People using this heuristic in the real world often <b>fail to adjust enough</b>: an adjustment strength below 1 reproduces that.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b>: planned staffing = normal staffing adjusted for today's occupancy relative to normal.</li>
      <li><b>Sustainability</b>: household energy use = usual use adjusted for price relative to the customary price.</li>
      <li><b>Business</b>: this year's budget = last year's, nudged for sales relative to plan.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Anchor 100, current value 150, normal value 100 ⇒ pressure = 1.5. With strength 0.5 the adjustment is <code>1.5<sup>0.5</sup> ≈ 1.22</code>, so value ≈ <b>122</b>: well short of the 150 a fully proportional adjustment (strength 1) would give. The molecule has no stocks and no dynamics; in this demo the blue "Value in use" starts at 100 and follows the orange algebraic value with a 2-week lag purely so you can watch the adjustment happen.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i>, Univariate Anchoring and Adjustment.</li>
      <li>Tversky, A. &amp; Kahneman, D. (1974). "Judgment under uncertainty: heuristics and biases." <i>Science</i> 185: 1124-1131, anchoring &amp; adjustment.</li>
      <li>Hogarth, R. M. (1987). <i>Judgement and Choice</i> (2nd ed.). Wiley.</li>
    </ul>`,
  },

  // =================== MULTIVARIATE ANCHORING & ADJUSTMENT ===================
  multivariateAnchor: {
    name: "Multivariate Anchoring and Adjustment",
    title: "Multivariate Anchoring and Adjustment",
    timeUnit: "wk",
    unitY: "value",
    lede: "Something that depends on many things: take a normal value, the anchor, and multiply it by one adjustment per factor, each neutral at 1.",
    stocks: [
      { id: "judged", label: "Value in use", init: 100, scale: 260, color: C.acc },
      { id: "ind", label: "value = anchor × adjustments", init: 180, scale: 260, color: C.acc2 },
    ],
    params: [
      { id: "anchor", label: "Anchor", min: 20, max: 200, step: 5, value: 100, unit: "" },
      { id: "p1", label: "Pressure #1", min: 0.25, max: 4, step: 0.05, value: 2.25, unit: "×" },
      { id: "p2", label: "Pressure #2", min: 0.25, max: 4, step: 0.05, value: 1, unit: "×" },
      { id: "p3", label: "Pressure #3", min: 0.25, max: 2, step: 0.05, value: 1.2, unit: "×" },
    ],
    rates: (s, p) => {
      // value = Anchor × Adjustment #1 × Adjustment #2 × Adjustment #3
      const value = p.anchor * mvF1(p.p1) * mvF2(p.p2) * mvF3(p.p3);
      return { value, adjusting: Math.abs(value - s.judged) / 2 };
    },
    derivs: (s, _p, r) => ({ judged: (r.value - s.judged) / 2, ind: (r.value - s.ind) / DT }),
    diagram: {
      stocks: { judged: { x: 340, y: 90, w: 130, h: 120 } },
      flows: [{ id: "adjusting", pts: [[40, 150], [340, 150]], to: "judged", max: 40 }],
    },
    cld: {
      vars: [
        { id: "p1", label: "Pressure #1", x: 80, y: 60 },
        { id: "p2", label: "Pressure #2", x: 80, y: 140 },
        { id: "p3", label: "Pressure #3", x: 80, y: 220 },
        { id: "a1", label: "Adjustment #1", x: 255, y: 60 },
        { id: "a2", label: "Adjustment #2", x: 255, y: 140 },
        { id: "a3", label: "Adjustment #3", x: 255, y: 220 },
        { id: "anc", label: "Anchor", x: 440, y: 50 },
        { id: "val", label: "Value", x: 440, y: 140 },
      ],
      links: [
        { from: "p1", to: "a1", sign: "+" },
        { from: "p2", to: "a2", sign: "−" },
        { from: "p3", to: "a3", sign: "+" },
        { from: "a1", to: "val", sign: "+" },
        { from: "a2", to: "val", sign: "+" },
        { from: "a3", to: "val", sign: "+" },
        { from: "anc", to: "val", sign: "+" },
      ],
      loops: [],
      caption:
        'Each <b>pressure</b> is a current value divided by its normal value. Each runs through its own user-defined function to give an <b>adjustment</b> that equals 1 when nothing is unusual, and the adjustments multiply the anchor. Here #1 raises the value (√), #2 lowers it (1/√) and #3 is proportional. No loops, no stocks.',
    },
    desc: `<p>The multivariate version adjusts one anchor for <b>several factors at once</b>. Hines' example is judging how long a paper will take: start from the usual one week, lengthen it 10% for being tired, shorten it 15% because the subject is familiar, and so on. A normal (or maximum, or minimum) value is multiplied by a series of effects, each with a neutral value of 1. The formulation exists because early simulation languages offered single-input table functions only; a product of one-input functions is easy to picture and easy to explain. The three functions here are <code>√p₁</code>, <code>1/√p₂</code> and <code>p₃</code>.</p>
    <div class="eq">value = Anchor × Adjustment #1 × Adjustment #2 × Adjustment #3<br/>Adjustment #i = f<sub>i</sub>(currentValue #i / normalValue #i)&nbsp; [f<sub>i</sub>(1) = 1]</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it for any rate or judgment that is a <b>function of many things</b>: productivity, quality, birth and death rates, desired price. It is the parent of the Productivity, Quality and Sea Anchor molecules. One caution from Hines: modelers tend to <b>over-estimate the strength of the effects</b> when first setting them, and because effects multiply, several modest ones compound into a large swing.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b>: length of stay = normal stay × effect of occupancy × effect of staffing × effect of case mix.</li>
      <li><b>Sustainability</b>: the birth and death rates in Forrester's World Dynamics, each a normal rate times effects of food, crowding, pollution and material standard of living.</li>
      <li><b>Projects</b>: productivity = normal productivity × effects of fatigue, schedule pressure and skill.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Anchor 100; pressure #1 = 2.25 gives adjustment <code>√2.25 = 1.5</code>; pressure #2 = 1 gives 1; pressure #3 = 1.2 gives 1.2. Value = <code>100 × 1.5 × 1 × 1.2 = 180</code>. Raise pressure #2 to 4 and its adjustment halves (<code>1/√4 = 0.5</code>), bringing the value to 90. As in the univariate demo, the blue "Value in use" lags the orange algebraic value by 2 weeks only to make the change visible.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i>, Multivariate Anchoring and Adjustment.</li>
      <li>Forrester, J. W. (1971). <i>World Dynamics</i>. Wright-Allen Press: multiplicative effects on birth and death rates.</li>
      <li>Hogarth, R. M. (1987). <i>Judgement and Choice</i> (2nd ed.). Wiley.</li>
    </ul>`,
  },

  // ================================ QUALITY ================================
  quality: {
    name: "Quality",
    title: "Quality (Fraction of Work Done Correctly)",
    timeUnit: "wk",
    unitY: "tasks",
    lede: "Quality is the fraction of work being done correctly: a normal value multiplied by the effects of fatigue, schedule pressure, work adequacy and skill, capped at 1.",
    stocks: [
      { id: "todo", label: "Work to do", init: 400, scale: 400, color: "#8b98a9" },
      { id: "okWork", label: "Done correctly", init: 0, scale: 400, color: C.good },
      { id: "flawed", label: "Done with flaws", init: 0, scale: 400, color: C.pink },
      { id: "qPct", label: "Quality (%)", init: 68.9, scale: 100, color: C.acc, chartHidden: true },
    ],
    params: [
      { id: "normalQ", label: "Normal quality", min: 0.5, max: 1, step: 0.01, value: 0.9, unit: "" },
      { id: "fatigue", label: "Fatigue", min: 0.5, max: 2, step: 0.05, value: 1.25, unit: "×" },
      { id: "sched", label: "Schedule pressure", min: 0.5, max: 2, step: 0.05, value: 1.5, unit: "×" },
      { id: "adequacy", label: "Work adequacy", min: 0, max: 1.5, step: 0.05, value: 1, unit: "×" },
      { id: "skill", label: "Average skill", min: 0.2, max: 1.5, step: 0.05, value: 1, unit: "×" },
    ],
    rates: (s, p) => {
      const q = qualityOf(p); // MIN(1, NormalQuality × four effects)
      const doing = Math.min(10, s.todo / DT); // 10 tasks/wk until the job is done
      return { correct: doing * q, flaws: doing * (1 - q), q };
    },
    derivs: (s, _p, r) => ({
      todo: -(r.correct + r.flaws),
      okWork: r.correct,
      flawed: r.flaws,
      qPct: (r.q * 100 - s.qPct) / DT,
    }),
    diagram: {
      stocks: {
        todo: { x: 90, y: 95, w: 120, h: 110 },
        okWork: { x: 580, y: 40, w: 130, h: 85 },
        flawed: { x: 580, y: 170, w: 130, h: 85 },
      },
      flows: [
        { id: "correct", pts: [[210, 125], [400, 125], [400, 82], [580, 82]], from: "todo", to: "okWork", max: 10, color: C.good },
        { id: "flaws", pts: [[210, 175], [400, 175], [400, 212], [580, 212]], from: "todo", to: "flawed", max: 10, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "fat", label: "Fatigue", x: 85, y: 40 },
        { id: "sp", label: "Schedule pressure", x: 95, y: 102 },
        { id: "wa", label: "Work adequacy", x: 85, y: 164 },
        { id: "sk", label: "Average skill", x: 85, y: 226 },
        { id: "q", label: "Quality", x: 290, y: 133 },
        { id: "ok", label: "Correct work", x: 435, y: 70 },
        { id: "bad", label: "Flawed work", x: 435, y: 200 },
      ],
      links: [
        { from: "fat", to: "q", sign: "−" },
        { from: "sp", to: "q", sign: "−" },
        { from: "wa", to: "q", sign: "+" },
        { from: "sk", to: "q", sign: "+" },
        { from: "q", to: "ok", sign: "+" },
        { from: "q", to: "bad", sign: "−" },
      ],
      loops: [],
      caption:
        'Quality is <b>normal quality × four effects</b>, each equal to 1 under normal conditions, limited to at most 1. Fatigue and schedule pressure lower it; adequate work and skill raise it. It splits the work being done into the part done correctly and the part done with flaws. There are no levels in the molecule, so no endogenous dynamics.',
    },
    desc: `<p>In project models, <b>quality</b> is defined as the fraction of work that is being done correctly; productivity, the speed at which work gets done, correct or not, is defined separately. Quality is a multivariate anchoring-and-adjustment: a normal value multiplied by illustrative but common effects of fatigue, schedule pressure, work adequacy and average skill. The same things usually affect productivity too, through different functions: schedule pressure makes people work <i>faster</i> (positive slope for productivity) and make <i>more mistakes</i> (negative slope for quality).</p>
    <div class="eq">Quality = MIN(1, NormalQuality × EffectOfFatigue × EffectOfSchedulePressure × EffectOfWorkAdequacy × EffectAverageSkill)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it wherever a share of output is defective and that share responds to working conditions: it is the input that drives the Rework Cycle. Quality must stay between 0 and 1. Table functions seldom go below zero but may go above one, so the product can exceed 1; the <b>MIN</b> in the equation is the standard guard.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b>: the fraction of procedures completed without error, falling with long shifts and a rushed list.</li>
      <li><b>Sustainability</b>: the share of building retrofits installed to specification by a hurried, newly trained workforce.</li>
      <li><b>Projects</b>: error-free design or code as a share of work done during a deadline crunch.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    A 400-task job is worked at 10 tasks/wk, so it takes 40 weeks. Normal quality 0.9; fatigue 1.25 gives an effect of <code>1 − 0.4 × 0.25 = 0.90</code>; schedule pressure 1.5 gives <code>1 − 0.3 × 0.5 = 0.85</code>; adequacy and skill are normal (1). Quality = <code>0.9 × 0.90 × 0.85 ≈ 0.69</code>, so about <b>275</b> tasks end up done correctly and about <b>125</b> carry flaws. Return fatigue and pressure to 1 and only 40 are flawed.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i>, Quality.</li>
      <li>Abdel-Hamid, T. &amp; Madnick, S. E. (1991). <i>Software Project Dynamics: An Integrated Approach</i>. Prentice Hall.</li>
      <li>Lyneis, J. M. &amp; Ford, D. N. (2007). "System dynamics applied to project management: a survey, assessment, and directions for future research." <i>System Dynamics Review</i> 23(2-3): 157-189.</li>
    </ul>`,
  },
};

export const FLOW_META_A: Record<string, Record<string, FlowMeta>> = {
  goToZero: {
    in: { name: "replenishment", eq: "replenishment", in: ["inflow"] },
    action: { name: "action to go to zero", eq: "Current value / time to go to zero", in: ["cur", "tau"], loop: "B" },
    planOut: { name: "constant action", eq: "100 / time to go to zero (initial action, held until empty)", in: ["tau"] },
  },
  stockAdjust: {
    stocking: {
      name: "stocking",
      eq: "MAX(0, (Desired level − Level) / adjustment time + replacement fraction × outFlow)",
      in: ["desired", "level", "adj", "out", "repl"],
      loop: "B",
    },
    outflow: { name: "outFlow", eq: "outFlow", in: ["out"] },
  },
  lowVisPipeline: {
    ordering: {
      name: "ordering",
      eq: "MAX(0, shipping + (100 − Inventory)/t_inv + (shipping × calc. delay − OrdersNotReceived) × awareness / t_pipe)",
      in: ["ship", "inv", "onr", "tInv", "tPipe", "aware"],
      loop: "B",
    },
    receiving: { name: "receiving product", eq: "supplier's last stage / (supplier delay / 2)", in: ["onr", "delay"], loop: "B" },
    shipping: { name: "shipping", eq: "shipping", in: ["ship"] },
  },
  coflowExperience: {
    hiring: { name: "hiring", eq: "hiring", in: ["hire"] },
    attrition: { name: "attrition", eq: "Workforce / time to quit or retire", in: ["wf", "ttq"], loop: "B" },
    gain: { name: "experience gain", eq: "rate of experience gain = 1 yr/yr", in: [] },
    dilute: {
      name: "dilution by new hires",
      eq: "(Average experience − new-hire experience) × hiring / Workforce",
      in: ["avg", "newExp", "hire", "wf"],
      loop: "B",
    },
  },
  univariateAnchor: {
    adjusting: {
      name: "adopting the value",
      eq: "(anchor × (current / normal)^strength − Value in use) / 2",
      in: ["anchor", "current", "normal", "strength", "judged"],
      loop: "B",
    },
  },
  multivariateAnchor: {
    adjusting: {
      name: "adopting the value",
      eq: "(anchor × √p₁ × 1/√p₂ × p₃ − Value in use) / 2",
      in: ["anchor", "p1", "p2", "p3", "judged"],
      loop: "B",
    },
  },
  quality: {
    correct: { name: "doing work correctly", eq: "work rate × Quality", in: ["normalQ", "fatigue", "sched", "adequacy", "skill"] },
    flaws: { name: "doing work with flaws", eq: "work rate × (1 − Quality)", in: ["normalQ", "fatigue", "sched", "adequacy", "skill"] },
  },
};

export const DIAGRAM_EXTRA_A: Record<string, { stocks: [string, string][]; aux?: [string, string][] }> = {
  goToZero: {
    stocks: [
      ["Current value", "INTEG(replenishment − action to go to zero, 100)"],
      ["If action held constant", "INTEG(−constant action, 100)"],
    ],
    aux: [
      ["ActionToGoToZero", "CurrentValue / timeToGoToZero"],
      ["with replenishment", "Current value* = replenishment × time to go to zero"],
    ],
  },
  stockAdjust: {
    stocks: [["Level", "INTEG(stocking − outFlow, 40)  [book: starts at DesiredLevel]"]],
    aux: [
      ["Gap", "DesiredLevel − Level"],
      ["StockingToAdjustLevelToDesired", "Gap / AdjustmentTime"],
      ["StockingForReplacement", "replacement fraction × outFlow  [book: = outFlow]"],
      ["resting level", "Desired − (1 − fraction) × outFlow × AdjustmentTime"],
    ],
  },
  lowVisPipeline: {
    stocks: [
      ["Orders not received", "INTEG(ordering − orders being fulfilled, 60)"],
      ["Inventory", "INTEG(receiving product − shipping, 60)"],
    ],
    aux: [
      ["orders being fulfilled", "= receiving product (supplier: two hidden stages of delay/2)"],
      ["CalculatedDeliveryDelay", "OrdersNotReceived / orders being fulfilled  (≤ 30 wk)"],
      ["RequiredOrdersInPipeline", "ForecastedDemand × CalculatedDeliveryDelay ; forecast = shipping"],
      ["OrderPipelineGap", "(Required − OrdersNotReceived) × AwarenessOfPipeline"],
      ["inventoryCorrection", "(DesiredInventory − Inventory) / timeToCorrectInventory ; desired = 100"],
    ],
  },
  coflowExperience: {
    stocks: [
      ["Workforce", "INTEG(hiring − attrition, 80)"],
      ["Average experience", "INTEG(change in average experience + rate of experience gain, 8)"],
    ],
    aux: [
      ["change in average experience", "(avg experience of new hire − Average experience) / experience dilution time"],
      ["experience dilution time", "Workforce / hiring"],
      ["equilibrium", "Average* = new-hire experience + time to quit or retire"],
    ],
  },
  univariateAnchor: {
    stocks: [["Value in use", "INTEG((value − Value in use) / 2, 100)  [display lag, not in the book]"]],
    aux: [
      ["value", "Adjustment × anchor"],
      ["Adjustment", "f(Pressure) = Pressure ^ strength  [f(1) = 1]"],
      ["PressureToAdjustAwayFromTheAnchor", "currentValueOfSomeVariable / normalValueOfSomeVariable"],
    ],
  },
  multivariateAnchor: {
    stocks: [["Value in use", "INTEG((value − Value in use) / 2, 100)  [display lag, not in the book]"]],
    aux: [
      ["value", "Anchor × Adjustment #1 × Adjustment #2 × Adjustment #3"],
      ["Adjustment #1", "√(Pressure #1)"],
      ["Adjustment #2", "1 / √(Pressure #2)"],
      ["Adjustment #3", "Pressure #3"],
      ["Pressure #i", "currentValue #i / normalValue #i"],
    ],
  },
  quality: {
    stocks: [
      ["Work to do", "INTEG(−work rate, 400) ; work rate = 10 tasks/wk"],
      ["Done correctly", "INTEG(work rate × Quality, 0)"],
      ["Done with flaws", "INTEG(work rate × (1 − Quality), 0)"],
    ],
    aux: [
      ["Quality", "MIN(1, NormalQuality × the four effects)"],
      ["EffectOfFatigueOnQuality", "1 − 0.4·(Fatigue − 1), limited to 0.4 … 1.1"],
      ["EffectOfSchedulePressureOnQuality", "1 − 0.3·(SchedulePressure − 1), limited to 0.4 … 1.1"],
      ["EffectOfWorkAdequacyOnQuality", "0.5 + 0.5·WorkAdequacy, limited to 0.5 … 1.05"],
      ["EffectAverageSkillOnQuality", "0.4 + 0.6·AverageSkill, limited to 0.4 … 1.1"],
    ],
  },
};

export const LESSONS_A: Record<string, Lesson> = {
  goToZero: {
    q: "Current value 100, time to go to zero 5 months, and the action is recomputed as the value falls. At month 5 the value is…",
    options: ["exactly 0", "about 37", "about 50", "still 100"],
    answer: 1,
    explain: "The action starts at 100/5 = 20/mo, which would empty the stock in exactly 5 months if it stayed constant (the orange stock). But the action shrinks with the value, so the decline is exponential: 100·e⁻¹ ≈ 37 is left after one time constant.",
    preset: { tau: 5, inflow: 0 },
  },
  stockAdjust: {
    q: "Outflow 10/mo, desired level 100, adjustment time 4 mo, but nobody orders replacement (replacement fraction 0). The level settles at…",
    options: ["100", "60", "40", "0"],
    answer: 1,
    explain: "Without the replacement term, stocking = gap/4 must cover the whole 10/mo outflow, which takes a standing gap of 10 × 4 = 40. The level rests at 100 − 40 = 60. Ordering what is used up removes that steady-state error.",
    preset: { out: 10, desired: 100, adj: 4, repl: 0 },
  },
  lowVisPipeline: {
    q: "Shipping is 10 cases/wk and the supplier takes 6 wk to deliver. Once things settle, Orders Not Received holds…",
    options: ["0 cases", "10 cases", "60 cases", "100 cases"],
    answer: 2,
    explain: "In steady state the pipeline equals the ordering rate times the time it takes to receive orders: 10 × 6 = 60 cases. This inventory-on-the-way is never zero: the piece most Beer Game players forget to track.",
    preset: { ship: 10, tInv: 4, tPipe: 4, delay: 6, aware: 1 },
  },
  coflowExperience: {
    q: "A steady team (80 people, 8 yr average experience) doubles its hiring of rookies from 10 to 20 a year and keeps it there. Average experience…",
    options: ["halves and stays at 4 yr", "dips, then returns to 8 yr", "rises steadily", "is unchanged throughout"],
    answer: 1,
    explain: "The surge of rookies dilutes the average at first (to about 6.1 yr). But equilibrium average = new-hire experience + time people stay = 0 + 8, whatever the hiring rate, so once the workforce has grown to 160 the average is back at 8 yr.",
    preset: { hire: 20, ttq: 8, newExp: 0 },
  },
  univariateAnchor: {
    q: "Anchor 100. The variable is at 4× its normal value (200 vs 50) and the adjustment function is the square root of the pressure. The value is…",
    options: ["100", "200", "400", "50"],
    answer: 1,
    explain: "Pressure = 200/50 = 4, adjustment = √4 = 2, value = 2 × 100 = 200. A fully proportional adjustment would have given 400: a strength below 1 is the classic under-adjustment from the anchor.",
    preset: { anchor: 100, current: 200, normal: 50, strength: 0.5 },
  },
  multivariateAnchor: {
    q: "Anchor 100, and the three adjustments come out at 2, 0.5 and 1.5. The value is…",
    options: ["400", "150", "100", "300"],
    answer: 1,
    explain: "Adjustments multiply the anchor, they are not added: 100 × 2 × 0.5 × 1.5 = 150. (Pressures 4, 4 and 1.5 give √4 = 2, 1/√4 = 0.5 and 1.5.)",
    preset: { anchor: 100, p1: 4, p2: 4, p3: 1.5 },
  },
  quality: {
    q: "Normal quality is 0.95. A rested, unhurried team earns effects of 1.1 (fatigue) and 1.1 (schedule pressure); the other effects are 1. Quality is…",
    options: ["1.15", "1.00", "0.95", "0.86"],
    answer: 1,
    explain: "The product is 0.95 × 1.1 × 1.1 ≈ 1.15, but quality is a fraction of work done correctly and cannot exceed 1: the MIN function caps it at 1.00, so no flawed work accumulates.",
    preset: { normalQ: 0.95, fatigue: 0.5, sched: 0.5, adequacy: 1, skill: 1 },
  },
};

export const PRESETS_A: Record<string, Preset[]> = {
  goToZero: [
    { label: "Quick (τ = 2)", params: { tau: 2, inflow: 0 } },
    { label: "Slow (τ = 12)", params: { tau: 12, inflow: 0 } },
    { label: "With replenishment", params: { tau: 5, inflow: 8 } },
  ],
  stockAdjust: [
    { label: "Replace + correct", params: { out: 10, desired: 100, adj: 4, repl: 1 } },
    { label: "No replacement ordering", params: { out: 10, desired: 100, adj: 4, repl: 0 } },
    { label: "Slow adjustment", params: { out: 10, desired: 100, adj: 10, repl: 1 } },
  ],
  lowVisPipeline: [
    { label: "Tracks the pipeline", params: { ship: 10, tInv: 4, tPipe: 4, delay: 6, aware: 1 } },
    { label: "Ignores the pipeline", params: { ship: 10, tInv: 4, tPipe: 4, delay: 6, aware: 0 } },
    { label: "Boom and bust (slow supplier)", params: { ship: 10, tInv: 2, tPipe: 4, delay: 12, aware: 0 } },
  ],
  coflowExperience: [
    { label: "Steady team", params: { hire: 10, ttq: 8, newExp: 0 } },
    { label: "Hiring surge (dilution)", params: { hire: 20, ttq: 8, newExp: 0 } },
    { label: "Hire veterans", params: { hire: 20, ttq: 8, newExp: 5 } },
  ],
  univariateAnchor: [
    { label: "Under-adjust (√)", params: { anchor: 100, current: 150, normal: 100, strength: 0.5 } },
    { label: "Proportional", params: { anchor: 100, current: 150, normal: 100, strength: 1 } },
    { label: "Inverse effect", params: { anchor: 100, current: 150, normal: 100, strength: -1 } },
  ],
  multivariateAnchor: [
    { label: "All normal", params: { anchor: 100, p1: 1, p2: 1, p3: 1 } },
    { label: "Offsetting pressures", params: { anchor: 100, p1: 4, p2: 4, p3: 1 } },
    { label: "Compounding pressures", params: { anchor: 100, p1: 2.25, p2: 0.45, p3: 1.2 } },
  ],
  quality: [
    { label: "Normal conditions", params: { normalQ: 0.9, fatigue: 1, sched: 1, adequacy: 1, skill: 1 } },
    { label: "Deadline crunch", params: { normalQ: 0.9, fatigue: 1.5, sched: 2, adequacy: 1, skill: 1 } },
    { label: "Green team", params: { normalQ: 0.9, fatigue: 1, sched: 1, adequacy: 1, skill: 0.4 } },
  ],
};

// immediate parents, using app keys; follows the book's "Immediate Parents"
export const LINEAGE_A: Record<string, string[]> = {
  goToZero: [], // book: none
  stockAdjust: ["smooth"], // Smooth (first order)
  lowVisPipeline: ["stockAdjust", "split", "residence"], // First-order stock adjustment, Split flow, Residence time
  coflowExperience: ["coflow"], // Coflow
  univariateAnchor: ["effectFunction"], // Dimensionless input to function
  multivariateAnchor: ["univariateAnchor"], // Univariate anchoring and adjustment
  quality: ["multivariateAnchor"], // Multivariate anchoring and adjustment
};
