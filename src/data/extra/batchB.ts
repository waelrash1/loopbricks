// Batch B of Hines' "Molecules of Structure": sea-anchor pricing, proportional / nonlinear
// splits, and the "action from resource" family. Same shape as molecules.ts, diagramMeta.ts,
// lessons.ts and presets.ts: merged into the app's records elsewhere.
import type { Model } from "@/data/molecules";
import type { FlowMeta } from "@/data/diagramMeta";
import type { Lesson } from "@/data/lessons";
import type { Preset } from "@/data/presets";

const C = { acc: "#2545ff", acc2: "#d9480f", good: "#0f8a5f", pink: "#c2255c" }; // same series palette as molecules.ts

// Pressure to change price = EffectOfInventoryOnPrice f × EffectOfMarketShareOnPrice f.
// Both tables pass through (1, 1) and are bounded, so no slider position can divide by zero.
//   inventory effect  : 2 / (1 + rel)      → 2 at empty shelves, 1 at target, falls toward 0 when glutted
//   market-share effect: 2·rel / (1 + rel) → 0 at no share, 1 at target, saturates toward 2
const pricePressure = (inventory: number, targetInventory: number, relMarketShare: number) => {
  const relInv = inventory / Math.max(1, targetInventory);
  const effInv = 2 / (1 + relInv);
  const effMs = (2 * relMarketShare) / (1 + relMarketShare);
  return effInv * effMs;
};

// Fastest a backlog can be worked off, however many people are assigned to it (weeks).
const MIN_TASK_TIME = 0.5;

export const MODELS_B: Record<string, Model> = {
  // ======================= ANCHORING & PRICING =======================
  seaAnchorPricing: {
    name: "Sea Anchor Pricing",
    title: "Sea Anchor Pricing (price form)",
    timeUnit: "yr",
    unitY: "$/widget",
    lede: "Price setters bump price above or below an underlying 'fair' price when inventory or market share press on them, and the underlying price then drifts toward whatever price they set.",
    stocks: [
      { id: "underlyingPrice", label: "Underlying price", init: 10, scale: 90, color: C.acc2 },
      { id: "priceDisp", label: "Price", init: 11.43, scale: 90, color: C.good, chartHidden: false },
    ],
    params: [
      { id: "inventory", label: "Inventory", min: 0, max: 200, step: 5, value: 75, unit: "widgets" },
      { id: "targetInventory", label: "Target inventory", min: 20, max: 200, step: 5, value: 100, unit: "widgets" },
      { id: "relMarketShare", label: "Relative market share", min: 0.5, max: 1.5, step: 0.05, value: 1, unit: "×" },
      { id: "timeToChange", label: "Time to change underlying price", min: 1, max: 20, step: 0.5, value: 4, unit: "yr" },
    ],
    rates: (s, p) => {
      const pressure = pricePressure(p.inventory, p.targetInventory, p.relMarketShare);
      const price = s.underlyingPrice * pressure;
      return { pressure, price, changeInUnderlyingPrice: (price - s.underlyingPrice) / p.timeToChange };
    },
    derivs: (s, _p, r) => ({ underlyingPrice: r.changeInUnderlyingPrice, priceDisp: (r.price - s.priceDisp) / 0.1 }),
    diagram: {
      stocks: { underlyingPrice: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [{ id: "changeInUnderlyingPrice", pts: [[40, 150], [330, 150]], to: "underlyingPrice", max: 1.5 }],
    },
    cld: {
      vars: [
        { id: "inv", label: "Relative inventory", x: 110, y: 55 },
        { id: "ps", label: "Pressure to change price", x: 330, y: 55 },
        { id: "pr", label: "Price", x: 400, y: 165 },
        { id: "up", label: "Underlying price", x: 150, y: 165 },
      ],
      links: [
        { from: "inv", to: "ps", sign: "−", curve: -18 },
        { from: "ps", to: "pr", sign: "+", curve: -18 },
        { from: "up", to: "pr", sign: "+", curve: -46 },
        { from: "pr", to: "up", sign: "+", curve: -46, note: "re-anchors" },
      ],
      loops: [{ type: "R", label: "R1", x: 295, y: 165 }],
      caption:
        '<span class="chip chipR">R1</span> Price is the underlying price times the <b>pressure to change price</b>; the underlying price then drifts toward the price just set. Hold the pressure above 1 and each bump is absorbed into the "fair" price and bumped again: <b>exponential growth</b>. Hold it below 1 and the same loop grinds the price toward zero.',
    },
    desc: `<p>Hines' formulation of price setting. Price setters carry a sense of a fair or <b>underlying price</b>. Pressures, usually relative inventory, here also relative market share, make them <b>bump</b> the price above or below it. Then they wait, if the pressure persists, the bumped price is gradually absorbed into their idea of the underlying price, and they bump again. It is the Sea Anchor &amp; Adjustment molecule with the adjustment written as a product of effect functions. Here low inventory raises price through <code>2/(1 + relative inventory)</code> and market share above target raises it through <code>2·rel/(1 + rel)</code>; both equal 1 at target.</p>
    <div class="eq">Price = UnderlyingPrice × pressureToChangePrice<br/>d(UnderlyingPrice)/dt = (Price − UnderlyingPrice) / Time to change underlying price<br/>pressureToChangePrice = EffectOfInventoryOnPrice × EffectOfMarketShareOnPrice</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it when a price has <b>no fixed reference</b> and is set by repeatedly nudging the last price: the modeller does not need to know the equilibrium price, the structure finds it. Because the loop is reinforcing, the price only stops moving when the pressure returns to exactly 1, so in a full model inventory or market share must respond to price and close the loop. The book also gives a <i>margin form</i> (price = cost × margin, with an underlying margin anchored the same way).</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Finance</b>: interest rates, the price of money: Hines cites the System Dynamics National Model as the classic use.</li>
      <li><b>Commodities</b>: traders marking prices up while stocks are short and down while they are long.</li>
      <li><b>Healthcare</b>: agency staffing rates ratcheting up for as long as shifts stay unfilled.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Inventory 75 against a target of 100 gives relative inventory 0.75 and an inventory effect of <code>2 / 1.75 ≈ 1.14</code>; market share is at target (effect 1), so pressure ≈ 1.14. Price jumps at once from $10 to about $11.43, and the underlying price then grows at <code>(1.14 − 1) / 4 ≈ 3.6%</code> per year: doubling roughly every 19-20 years, to about $29 after 30 years with the price about 14% above it throughout. Set inventory back to 100 and the price drops to the underlying price and both freeze at the new, higher level.</div>
    <h4>Caveats</h4>
    <p>Aggressive policies (a short time constant, a steep effect) can produce price explosions. And if the underlying price ever reaches zero it is stuck there, because every bump is a multiple of zero: the reason for Protected Sea Anchor Pricing.</p>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i>, Sea Anchor Pricing.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, price setting by anchoring and adjustment (hill-climbing).</li>
    </ul>`,
  },

  protSeaAnchorPricing: {
    name: "Protected Sea Anchor Pricing",
    title: "Protected Sea Anchor Pricing",
    timeUnit: "yr",
    unitY: "$/widget",
    lede: "Sea Anchor Pricing with a floor: the underlying price cannot sink below the lowest price that price setters regard as fair or sustainable, so the price can never get stuck at zero.",
    stocks: [
      { id: "underlyingPrice", label: "Underlying price", init: 10, scale: 20, color: C.acc2 },
      { id: "priceDisp", label: "Price", init: 8, scale: 20, color: C.good, chartHidden: false },
    ],
    params: [
      { id: "inventory", label: "Inventory", min: 0, max: 200, step: 5, value: 150, unit: "widgets" },
      { id: "targetInventory", label: "Target inventory", min: 20, max: 200, step: 5, value: 100, unit: "widgets" },
      { id: "relMarketShare", label: "Relative market share", min: 0.5, max: 1.5, step: 0.05, value: 1, unit: "×" },
      { id: "minPrice", label: "Minimum underlying price", min: 0, max: 12, step: 0.5, value: 6, unit: "$" },
      { id: "timeToChange", label: "Time to change underlying price", min: 1, max: 20, step: 0.5, value: 5, unit: "yr" },
    ],
    rates: (s, p) => {
      const pressure = pricePressure(p.inventory, p.targetInventory, p.relMarketShare);
      const price = s.underlyingPrice * pressure;
      const indicated = Math.max(price, p.minPrice);
      return { pressure, price, indicated, changeInUnderlyingPrice: (indicated - s.underlyingPrice) / p.timeToChange };
    },
    derivs: (s, _p, r) => ({ underlyingPrice: r.changeInUnderlyingPrice, priceDisp: (r.price - s.priceDisp) / 0.1 }),
    diagram: {
      stocks: { underlyingPrice: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [{ id: "changeInUnderlyingPrice", pts: [[40, 150], [330, 150]], to: "underlyingPrice", max: 1.5 }],
    },
    cld: {
      vars: [
        { id: "ps", label: "Pressure to change price", x: 120, y: 40 },
        { id: "mn", label: "Minimum underlying price", x: 395, y: 40 },
        { id: "pr", label: "Price", x: 90, y: 205 },
        { id: "ind", label: "Indicated underlying price", x: 270, y: 115 },
        { id: "up", label: "Underlying price", x: 400, y: 205 },
      ],
      links: [
        { from: "ps", to: "pr", sign: "+", curve: 14 },
        { from: "pr", to: "ind", sign: "+", curve: -14 },
        { from: "mn", to: "ind", sign: "+", curve: -14 },
        { from: "ind", to: "up", sign: "+", curve: -16 },
        { from: "up", to: "pr", sign: "+", curve: -20 },
        { from: "up", to: "up", sign: "−", self: true },
      ],
      loops: [{ type: "R", label: "R1", x: 255, y: 168 }, { type: "B", label: "B1", x: 486, y: 240 }],
      caption:
        '<span class="chip chipR">R1</span> is the sea-anchor loop: price re-anchors the underlying price that produced it. <span class="chip chipB">B1</span> takes over when the price falls below the <b>minimum underlying price</b>: the indicated value becomes the minimum, a constant, so the underlying price simply closes the gap to it and stops falling.',
    },
    desc: `<p>Sea Anchor Pricing has one bad corner: under sustained downward pressure the underlying price decays toward zero, and at zero it is stuck for good. The protected version adds a <b>minimum underlying price</b>: what price setters regard as the lowest fair or sustainable price, perhaps the cost of the product. The underlying price chases the larger of the current price and that minimum. Note what is protected: the <i>underlying</i> price. The price itself can still be bumped below the floor while pressure stays low.</p>
    <div class="eq">Price = UnderlyingPrice × pressureToChangePrice<br/>IndicatedUnderlyingPrice = MAX(Price, MinimumUnderlyingPrice)<br/>d(UnderlyingPrice)/dt = (IndicatedUnderlyingPrice − UnderlyingPrice) / Time to change underlying price</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it whenever a sea-anchored price <b>can approach zero</b> during a glut or a price war and must be able to recover afterwards. The floor does nothing while the price is above it, so behaviour is identical to Sea Anchor Pricing in normal conditions; set the minimum to 0 to see the unprotected collapse.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Finance</b>: interest rates in the System Dynamics National Model, Hines' classic example.</li>
      <li><b>Business</b>: a cost floor under list prices during a prolonged inventory glut.</li>
      <li><b>Sustainability</b>: a carbon price floor that stops an oversupplied permit market from collapsing to nothing.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Inventory 150 against a target of 100 gives an inventory effect of <code>2 / 2.5 = 0.8</code>, so the price is 80% of the underlying price: $8 at the start. For about 7 years the price is still above the $6 minimum and the underlying price decays at <code>(0.8 − 1) / 5 = −4%</code> per year. Once it passes $7.50 the price (80% of it) drops below $6, the MAX switches to the minimum, and the underlying price levels off at <b>$6</b> with the price at <code>6 × 0.8 = $4.80</code>. With the minimum at 0 the underlying price would be about $0.90 after 60 years and still falling.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i>, Protected Sea Anchor Pricing (and Protected Sea Anchoring and Adjustment).</li>
    </ul>`,
  },

  // ======================= ALLOCATION =======================
  propSplit: {
    name: "Proportional Split",
    title: "Proportional Split (people across three backlogs)",
    timeUnit: "wk",
    unitY: "tasks",
    lede: "Divide a resource among competing claims in proportion to the strength of each claim. Here the claims are three backlogs of work and the resource is a flexible team.",
    stocks: [
      { id: "tasksA", label: "Tasks A", init: 20, scale: 100, color: C.acc },
      { id: "tasksB", label: "Tasks B", init: 60, scale: 100, color: C.acc2 },
      { id: "tasksC", label: "Tasks C", init: 20, scale: 100, color: C.good },
    ],
    params: [
      { id: "resources", label: "Resources", min: 2, max: 20, step: 1, value: 10, unit: "people" },
      { id: "productivity", label: "Productivity", min: 0.5, max: 2, step: 0.1, value: 1, unit: "tasks/person/wk" },
      { id: "arrA", label: "New tasks A", min: 0, max: 10, step: 0.5, value: 5, unit: "/wk" },
      { id: "arrB", label: "New tasks B", min: 0, max: 10, step: 0.5, value: 3, unit: "/wk" },
      { id: "arrC", label: "New tasks C", min: 0, max: 10, step: 0.5, value: 2, unit: "/wk" },
    ],
    rates: (s, p) => {
      const total = s.tasksA + s.tasksB + s.tasksC; // TotalClaimStrength
      const rel = (x: number) => (total > 1e-9 ? x / total : 1 / 3); // RelativeStrengthOfClaim
      const resA = p.resources * rel(s.tasksA);
      const resB = p.resources * rel(s.tasksB);
      const resC = p.resources * rel(s.tasksC);
      return {
        resA,
        resB,
        resC,
        inA: p.arrA,
        inB: p.arrB,
        inC: p.arrC,
        doneA: Math.min(resA * p.productivity, s.tasksA / MIN_TASK_TIME),
        doneB: Math.min(resB * p.productivity, s.tasksB / MIN_TASK_TIME),
        doneC: Math.min(resC * p.productivity, s.tasksC / MIN_TASK_TIME),
      };
    },
    derivs: (_s, _p, r) => ({ tasksA: r.inA - r.doneA, tasksB: r.inB - r.doneB, tasksC: r.inC - r.doneC }),
    diagram: {
      stocks: { tasksA: { x: 355, y: 25, w: 110, h: 70 }, tasksB: { x: 355, y: 120, w: 110, h: 70 }, tasksC: { x: 355, y: 215, w: 110, h: 70 } },
      flows: [
        { id: "inA", pts: [[40, 60], [355, 60]], to: "tasksA", max: 10 },
        { id: "inB", pts: [[40, 155], [355, 155]], to: "tasksB", max: 10, color: C.acc2 },
        { id: "inC", pts: [[40, 250], [355, 250]], to: "tasksC", max: 10, color: C.good },
        { id: "doneA", pts: [[465, 60], [785, 60]], from: "tasksA", max: 10 },
        { id: "doneB", pts: [[465, 155], [785, 155]], from: "tasksB", max: 10, color: C.acc2 },
        { id: "doneC", pts: [[465, 250], [785, 250]], from: "tasksC", max: 10, color: C.good },
      ],
    },
    cld: {
      vars: [
        { id: "ta", label: "Tasks A (claim)", x: 110, y: 55 },
        { id: "rel", label: "Relative strength of A", x: 380, y: 55 },
        { id: "ra", label: "Resources for A", x: 380, y: 200 },
        { id: "da", label: "Completing A", x: 110, y: 200 },
        { id: "ot", label: "Other claims", x: 250, y: 128 },
      ],
      links: [
        { from: "ta", to: "rel", sign: "+", curve: -16 },
        { from: "ot", to: "rel", sign: "−", curve: 10 },
        { from: "rel", to: "ra", sign: "+", curve: -16 },
        { from: "ra", to: "da", sign: "+", curve: -16 },
        { from: "da", to: "ta", sign: "−", curve: -16 },
      ],
      loops: [{ type: "B", label: "B1", x: 250, y: 172 }],
      caption:
        '<span class="chip chipB">B1</span> A bigger backlog is a stronger claim, wins a bigger share of the people, and is worked down faster: one balancing loop per claim. Because every share is <code>claim / total claim</code>, the shares always sum to one and <b>all</b> of the resource is always handed out, needed or not.',
    },
    desc: `<p>The root allocation molecule. Each claim on a resource is represented by its <b>strength</b>, and the resource is split according to each claim's strength relative to the total. Hines' classic example is used here: a flexible workforce divided among kinds of task, where each backlog of tasks <i>is</i> the claim, so the total claim is the total work waiting. Each group then completes tasks at <code>people × productivity</code>.</p>
    <div class="eq">ResourcesForA = Resources × RelativeStrengthOfA'sClaim<br/>RelativeStrengthOfA'sClaim = StrengthOfA'sClaim / TotalClaimStrength<br/>TotalClaimStrength = StrengthOfA'sClaim + StrengthOfB'sClaim + StrengthOfC'sClaim</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it to share <b>one scarce, flexible resource among two or more claimants</b> when no claimant is favoured: people across task types, budget across requests, capacity across product lines. The claims must be in the same units. It is the parent of Weighted Split (add managerial bias), Multidimensional Split and Nonlinear Split.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>R&amp;D</b>: one pool of engineers split across research, development and commercialization in proportion to the work waiting in each.</li>
      <li><b>Healthcare</b>: float nurses assigned across wards in proportion to each ward's waiting patients.</li>
      <li><b>Sustainability</b>: a fixed water allocation shared among farms in proportion to their requests.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Ten people, 100 tasks waiting: 20 in A, 60 in B, 20 in C. B's claim is 60% of the total, so B gets <code>10 × 60/100 = 6</code> people and A and C get 2 each. New tasks arrive at 5, 3 and 2 a week, exactly the team's capacity of 10 a week, so the total stays at 100 while the mix shifts: A is completing only 2 a week against 5 arriving, so it grows; B is completing 6 against 3, so it shrinks. Each backlog approaches <code>100 × arrivals / capacity</code>, i.e. <b>50, 30 and 20</b>, with a time constant of <code>100 / 10 = 10</code> weeks, and the people end up split 5 : 3 : 2.</div>
    <h4>Caveats</h4>
    <p>The formulation allocates <b>all</b> of the resource even when that is more than a claim needs; re-allocating the excess takes extra structure. To keep stocks non-negative this app caps each completion rate at <code>Tasks / 0.5 wk</code>, so with surplus capacity the backlogs settle at half a week of arrivals rather than exactly zero, that cap is an addition, not part of the molecule.</p>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i>, Proportional Split.</li>
    </ul>`,
  },

  nonlinearSplit: {
    name: "Nonlinear Split",
    title: "Nonlinear Split (with a minimum share)",
    timeUnit: "wk",
    unitY: "units",
    lede: "Split a quantity between two claimants by relative claim strength, but pass that indicated fraction through a lookup first: for example so that neither side ever gets less than a minimum share.",
    stocks: [
      { id: "a", label: "Held by A", init: 0, scale: 120, color: C.acc },
      { id: "b", label: "Held by B", init: 0, scale: 120, color: C.pink },
    ],
    params: [
      { id: "totalQuantity", label: "Total quantity", min: 0, max: 40, step: 1, value: 20, unit: "/wk" },
      { id: "strengthA", label: "Strength of A's claim", min: 0, max: 10, step: 0.5, value: 9, unit: "" },
      { id: "strengthB", label: "Strength of B's claim", min: 0, max: 10, step: 0.5, value: 1, unit: "" },
      { id: "minFraction", label: "Minimum fraction", min: 0, max: 0.5, step: 0.05, value: 0.2, unit: "" },
      { id: "tau", label: "Holding time", min: 1, max: 12, step: 0.5, value: 5, unit: "wk" },
    ],
    rates: (s, p) => {
      const totalClaim = p.strengthA + p.strengthB;
      const indicated = totalClaim > 0 ? p.strengthA / totalClaim : 0.5; // IndicatedFractionToA
      const fraction = Math.min(1 - p.minFraction, Math.max(p.minFraction, indicated)); // FractionToA f
      const toA = p.totalQuantity * fraction;
      return { indicated, fraction, toA, toB: p.totalQuantity - toA, outA: s.a / p.tau, outB: s.b / p.tau };
    },
    derivs: (_s, _p, r) => ({ a: r.toA - r.outA, b: r.toB - r.outB }),
    diagram: {
      stocks: { a: { x: 480, y: 35, w: 110, h: 90 }, b: { x: 480, y: 175, w: 110, h: 90 } },
      flows: [
        { id: "toA", pts: [[120, 150], [300, 150], [300, 80], [480, 80]], to: "a", max: 40 },
        { id: "toB", pts: [[120, 150], [300, 150], [300, 220], [480, 220]], to: "b", max: 40, color: C.pink },
        { id: "outA", pts: [[590, 80], [790, 80]], from: "a", max: 40 },
        { id: "outB", pts: [[590, 220], [790, 220]], from: "b", max: 40 },
      ],
    },
    cld: {
      vars: [
        { id: "sa", label: "Strength of A's claim", x: 110, y: 50 },
        { id: "sb", label: "Strength of B's claim", x: 110, y: 215 },
        { id: "ind", label: "Indicated fraction", x: 245, y: 132 },
        { id: "fr", label: "Fraction to A", x: 435, y: 132 },
        { id: "qa", label: "Quantity to A", x: 435, y: 50 },
        { id: "qb", label: "Quantity to B", x: 435, y: 215 },
      ],
      links: [
        { from: "sa", to: "ind", sign: "+", curve: -12 },
        { from: "sb", to: "ind", sign: "−", curve: 12 },
        { from: "ind", to: "fr", sign: "+", curve: 0, note: "f( )" },
        { from: "fr", to: "qa", sign: "+", curve: 0 },
        { from: "fr", to: "qb", sign: "−", curve: 0 },
      ],
      loops: [],
      caption:
        'No stocks in the molecule itself, so no loops: it is a decision rule. Relative claim strength gives an <b>indicated</b> fraction; a lookup <code>f</code> bends it into the actual fraction (here flat at the minimum share and at one minus the minimum). B gets whatever A does not, so the two parts always sum to the total. The two holding stocks are only there to make the split visible.',
    },
    desc: `<p>Start from a Proportional Split between two claimants, then run the indicated fraction through a <b>lookup function</b> to capture what a straight proportion cannot: most often that each claim must receive a certain minimum fraction. B's quantity is the remainder, so everything is allocated. The book leaves <code>FractionToA f</code> as a user-defined function; the one used here follows the 45° line between a floor at the minimum fraction and a ceiling at one minus it.</p>
    <div class="eq">QuantityToA = TotalQuantity × FractionToA;&nbsp; QuantityToB = TotalQuantity − QuantityToA<br/>FractionToA = f(IndicatedFractionToA);&nbsp; IndicatedFractionToA = StrengthOfA'sClaim / totalClaim<br/>here f(x) = MIN(1 − minimum, MAX(minimum, x))</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it for a <b>two-way allocation where the response to claim strength is not proportional</b>: protected minimum shares, saturation, thresholds, or a bias toward one side. Hines lists it as the parent of Ceiling, Floor and Weighted Average, which are the same split with one half hidden.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Business</b>: engineering time split between new features and maintenance, with maintenance never allowed below 20%.</li>
      <li><b>Healthcare</b>: theatre time split between emergency and elective surgery with a guaranteed elective minimum.</li>
      <li><b>Sustainability</b>: river flow split between abstraction and a protected environmental minimum flow.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Claims of 9 and 1 give an indicated fraction to A of <code>9 / 10 = 0.9</code>. With a minimum fraction of 0.2 the lookup caps A at 0.8, so of 20 units a week A receives <code>20 × 0.8 = 16</code> and B receives <code>20 − 16 = 4</code>: twice the 2 a plain proportional split would give it. With a holding time of 5 weeks the stocks settle at <code>16 × 5 = 80</code> and <code>4 × 5 = 20</code>. Set the minimum to 0 and it reverts to a proportional split (18 and 2).</div>
    <h4>Caveats</h4>
    <p>All of the quantity is allocated, so if each claim is a request it is possible to hand a claimant more than it asked for. Avoiding that takes careful thought and extra structure.</p>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i>, Nonlinear Split.</li>
    </ul>`,
  },

  // ======================= RESOURCES & ACTIONS =======================
  actionFromResource: {
    name: "Action from Resource",
    title: "Action from Resource (flow = resources × ability)",
    timeUnit: "mo",
    unitY: "gallons",
    lede: "An action, a flow, is a resource multiplied by its ability to create that flow, i.e. its productivity. One of the three basic ways to create a flow.",
    stocks: [{ id: "tank", label: "Tank", init: 0, scale: 150, color: C.acc }],
    params: [
      { id: "resources", label: "Resources", min: 0, max: 30, step: 1, value: 10, unit: "resources" },
      { id: "ability", label: "Resource ability to create flow", min: 0, max: 6, step: 0.25, value: 3, unit: "gal/mo/resource" },
      { id: "drainTau", label: "Drain time", min: 1, max: 12, step: 0.5, value: 4, unit: "mo" },
    ],
    rates: (s, p) => ({ flow: p.resources * p.ability, outflow: s.tank / p.drainTau }),
    derivs: (_s, _p, r) => ({ tank: r.flow - r.outflow }),
    diagram: {
      stocks: { tank: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [
        { id: "flow", pts: [[40, 150], [330, 150]], to: "tank", max: 60 },
        { id: "outflow", pts: [[460, 150], [785, 150]], from: "tank", max: 60, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "rs", label: "Resources", x: 110, y: 55 },
        { id: "ab", label: "Ability to create flow", x: 110, y: 205 },
        { id: "fl", label: "Flow", x: 270, y: 130 },
        { id: "tk", label: "Tank", x: 420, y: 130 },
      ],
      links: [
        { from: "rs", to: "fl", sign: "+", curve: -14 },
        { from: "ab", to: "fl", sign: "+", curve: 14 },
        { from: "fl", to: "tk", sign: "+", curve: 0 },
        { from: "tk", to: "tk", sign: "−", self: true },
      ],
      loops: [{ type: "B", label: "B1", x: 372, y: 87 }],
      caption:
        'The molecule is the two arrows into <b>Flow</b>: resources times their ability to create the flow. It has no stocks and no loops of its own. The tank and its drain (<span class="chip chipB">B1</span>) are added here only so the flow has somewhere to go.',
    },
    desc: `<p>The simplest way to make something happen in a model: multiply a <b>resource</b> (people, machines, pumps) by its <b>ability to create the action</b>: its productivity, to get a flow. Hines names it as one of three general ways to create an action, the other two being Close Gap and Go to Zero. The molecule has no stock; here the flow fills a tank that drains with a first-order delay so you can watch it.</p>
    <div class="eq">flow = resources × resourceAbilityToCreateFlow</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it whenever a rate is <b>driven by capacity</b> rather than by a goal: production from a workforce, service from staff, spending from headcount. Check the units: ability must be flow units per resource (gallons/month/resource) so that the product is a flow. It is the parent of Producing, Financial Flow from Resource, Resources from Action and Ability from Action, which are this one equation renamed or rearranged.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Operations</b>: production = workers × productivity.</li>
      <li><b>Healthcare</b>: patients treated per day = clinicians × patients per clinician per day.</li>
      <li><b>Sustainability</b>: generation = installed turbines × output per turbine.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Ten pumps, each able to move 3 gallons a month, create a flow of <code>10 × 3 = 30</code> gallons a month. With a drain time of 4 months the tank settles where outflow equals inflow: <code>30 × 4 = 120</code> gallons, about 63% of the way there after 4 months. Double either the pumps or their ability and the flow doubles to 60 and the tank heads for 240.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i>, Action from Resource.</li>
    </ul>`,
  },

  financialFlow: {
    name: "Financial Flow from Resource",
    title: "Financial Flow from Resource (spending = workers × wage)",
    timeUnit: "mo",
    unitY: "$k",
    lede: "The continuing rent of a resource, wages, lease payments, interest, is the resource multiplied by its rent per unit per period.",
    stocks: [{ id: "cash", label: "Cash", init: 500, scale: 1000, color: C.good }],
    params: [
      { id: "workers", label: "Workers", min: 0, max: 50, step: 1, value: 20, unit: "people" },
      { id: "wage", label: "Wage", min: 2, max: 12, step: 0.5, value: 5, unit: "$k/person/mo" },
      { id: "revenue", label: "Revenue", min: 0, max: 200, step: 5, value: 80, unit: "$k/mo" },
    ],
    rates: (_s, p) => ({ revenue: p.revenue, spending: p.workers * p.wage }),
    derivs: (_s, _p, r) => ({ cash: r.revenue - r.spending }),
    diagram: {
      stocks: { cash: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [
        { id: "revenue", pts: [[40, 150], [330, 150]], to: "cash", max: 200 },
        { id: "spending", pts: [[460, 150], [785, 150]], from: "cash", max: 200, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "wk", label: "Workers", x: 100, y: 55 },
        { id: "wg", label: "Wage", x: 100, y: 205 },
        { id: "sp", label: "Spending", x: 255, y: 130 },
        { id: "ca", label: "Cash", x: 410, y: 130 },
        { id: "rv", label: "Revenue", x: 410, y: 45 },
      ],
      links: [
        { from: "wk", to: "sp", sign: "+", curve: -14 },
        { from: "wg", to: "sp", sign: "+", curve: 14 },
        { from: "sp", to: "ca", sign: "−", curve: 0 },
        { from: "rv", to: "ca", sign: "+", curve: 0 },
      ],
      loops: [],
      caption:
        'No stocks in the molecule and no loops: <b>spending</b> is simply workers times wage, an Action from Resource whose "ability" is a rent in dollars per person per month. The cash stock is added here to show what the flow does; nothing feeds back from cash to headcount until you build that link yourself.',
    },
    desc: `<p>Action from Resource applied to money. The financial flow is the resource multiplied by its <b>rent</b>, which has units of money per resource per time. Whether it is an expense or an income stream depends on the viewpoint: a wage is an expense to the employer and income to the employee; a lease payment is an expense to the occupier and income to the owner; interest is an expense to the borrower and income to the lender. Here the flow is an employer's payroll draining a cash balance that revenue refills.</p>
    <div class="eq">spending = workers × wage</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it for any <b>recurring cost or income that scales with a stock of resources</b>: payroll from headcount, lease cost from floor space, interest from debt, subscription revenue from customers. Combined with Resources from Action it gives Workforce from Budget.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Business</b>: payroll = headcount × average salary.</li>
      <li><b>Healthcare</b>: agency staffing cost = agency shifts filled × rate per shift.</li>
      <li><b>Finance</b>: interest paid = debt × interest rate.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Twenty workers at $5k a month each cost <code>20 × 5 = $100k</code> a month. Revenue is $80k a month, so cash falls by $20k a month and the $500k in the bank lasts <code>500 / 20 = 25</code> months. Cut the team to 16 and spending equals revenue (<code>16 × 5 = 80</code>): cash holds steady.</div>
    <h4>Caveats</h4>
    <p>Hines lists none for the molecule. In this app the cash stock simply stops at zero: payroll keeps being "paid" out of nothing, because the molecule itself contains no rule for what happens when the money runs out.</p>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i>, Financial Flow from Resource.</li>
    </ul>`,
  },

  resourcesFromAction: {
    name: "Resources from Action",
    title: "Resources from Action (resources = desired flow ÷ ability)",
    timeUnit: "mo",
    unitY: "resources",
    lede: "Turn Action from Resource around: divide the flow you want by what one resource can do, and you have the resources you need.",
    stocks: [
      { id: "resources", label: "Resources", init: 5, scale: 40, color: C.acc },
      { id: "requiredDisp", label: "Resources required", init: 20, scale: 40, color: C.acc2, chartHidden: false },
    ],
    params: [
      { id: "desiredFlow", label: "Desired flow", min: 0, max: 120, step: 5, value: 60, unit: "gal/mo" },
      { id: "ability", label: "Resource ability to create flow", min: 0.5, max: 6, step: 0.25, value: 3, unit: "gal/mo/resource" },
      { id: "adjTime", label: "Time to acquire resources", min: 1, max: 12, step: 0.5, value: 4, unit: "mo" },
    ],
    rates: (s, p) => {
      const required = p.desiredFlow / Math.max(0.01, p.ability);
      return { required, flow: s.resources * p.ability, acquiring: (required - s.resources) / p.adjTime };
    },
    derivs: (s, _p, r) => ({ resources: r.acquiring, requiredDisp: (r.required - s.requiredDisp) / 0.1 }),
    diagram: {
      stocks: { resources: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [{ id: "acquiring", pts: [[40, 150], [330, 150]], to: "resources", max: 5 }],
    },
    cld: {
      vars: [
        { id: "df", label: "Desired flow", x: 100, y: 55 },
        { id: "ab", label: "Ability to create flow", x: 100, y: 205 },
        { id: "rq", label: "Resources required", x: 265, y: 130 },
        { id: "rs", label: "Resources", x: 425, y: 130 },
      ],
      links: [
        { from: "df", to: "rq", sign: "+", curve: -14 },
        { from: "ab", to: "rq", sign: "−", curve: 14 },
        { from: "rq", to: "rs", sign: "+", curve: 0 },
        { from: "rs", to: "rs", sign: "−", self: true },
      ],
      loops: [{ type: "B", label: "B1", x: 377, y: 87 }],
      caption:
        'The molecule is the two arrows into <b>Resources required</b>: more desired flow needs more resources, more able resources need fewer. It has no stocks. The Resources stock and its gap-closing loop (<span class="chip chipB">B1</span>) are added here to show the requirement being used as a goal.',
    },
    desc: `<p>Action from Resource says <code>flow = resources × ability</code>. Rearranged, it answers a planning question: given the flow we want and the productivity of one resource, <b>how many resources do we need</b> (or, given the flow we observe, how many must we have)? The molecule has no stock; here the result is used as the goal of a simple Close Gap so a stock of resources adjusts toward it.</p>
    <div class="eq">resources = DesiredFlow / resourceAbilityToCreateFlow</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it to convert a <b>target rate into a target capacity</b>: desired production into desired workforce, required throughput into required beds or machines, a budget into affordable headcount. It usually feeds a hiring or capacity-acquisition structure as its goal. If ability can approach zero, protect the division.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Operations</b>: desired workforce = desired production / productivity.</li>
      <li><b>Healthcare</b>: clinicians needed = expected appointments per week / appointments per clinician per week.</li>
      <li><b>Sustainability</b>: turbines needed = target generation / output per turbine.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    We want 60 gallons a month and each pump moves 3, so we need <code>60 / 3 = 20</code> pumps. Starting with 5 and taking 4 months to close the gap, the first month's acquisition rate is <code>(20 − 5) / 4 = 3.75</code> pumps a month and the stock approaches 20, where the actual flow <code>20 × 3</code> equals the 60 desired. Raise ability to 6 and the requirement halves to 10.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i>, Resources from Action.</li>
    </ul>`,
  },

  workforceFromBudget: {
    name: "Workforce from Budget",
    title: "Workforce from Budget (people = budget ÷ average wage)",
    timeUnit: "yr",
    unitY: "people",
    lede: "Divide the workforce budget by the average wage to get the number of people you can afford: the goal that hiring then chases.",
    stocks: [
      { id: "workforce", label: "Workforce", init: 20, scale: 100, color: C.acc },
      { id: "desiredDisp", label: "Desired people", init: 50, scale: 100, color: C.acc2, chartHidden: false },
    ],
    params: [
      { id: "budget", label: "Workforce budget", min: 500, max: 6000, step: 100, value: 3000, unit: "$k/yr" },
      { id: "avgWage", label: "Average wage", min: 30, max: 150, step: 5, value: 60, unit: "$k/person/yr" },
      { id: "tHire", label: "Time to adjust workforce", min: 0.5, max: 6, step: 0.5, value: 2, unit: "yr" },
    ],
    rates: (s, p) => {
      const desired = p.budget / Math.max(1, p.avgWage);
      return { desired, spending: s.workforce * p.avgWage, hiring: (desired - s.workforce) / p.tHire };
    },
    derivs: (s, _p, r) => ({ workforce: r.hiring, desiredDisp: (r.desired - s.desiredDisp) / 0.1 }),
    diagram: {
      stocks: { workforce: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [{ id: "hiring", pts: [[40, 150], [330, 150]], to: "workforce", max: 20 }],
    },
    cld: {
      vars: [
        { id: "bg", label: "Workforce budget", x: 95, y: 50 },
        { id: "wg", label: "Average wage", x: 95, y: 215 },
        { id: "dp", label: "Desired people", x: 250, y: 130 },
        { id: "wf", label: "Workforce", x: 405, y: 130 },
        { id: "sp", label: "Spending", x: 405, y: 222 },
      ],
      links: [
        { from: "bg", to: "dp", sign: "+", curve: -14 },
        { from: "wg", to: "dp", sign: "−", curve: 14 },
        { from: "dp", to: "wf", sign: "+", curve: 0 },
        { from: "wf", to: "wf", sign: "−", self: true },
        { from: "wf", to: "sp", sign: "+", curve: 0 },
        { from: "wg", to: "sp", sign: "+", curve: 20 },
      ],
      loops: [{ type: "B", label: "B1", x: 357, y: 87 }],
      caption:
        'The molecule is the two arrows into <b>Desired people</b>: budget divided by average wage. It has no stocks. The Workforce stock and its hiring loop (<span class="chip chipB">B1</span>) are added here; when the workforce reaches the desired number, spending (workforce × wage, a Financial Flow from Resource) equals the budget.',
    },
    desc: `<p>The two previous molecules combined. Financial Flow from Resource says <code>spending = workers × wage</code>; Resources from Action turns a flow into the resources behind it. Put together: the budget is the spending flow we are allowed, the wage is the rent of one person, so <b>budget ÷ average wage</b> is the workforce we can afford. Here that number is the goal of a hiring loop.</p>
    <div class="eq">DesiredPeople = WorkforceBudget / averageWage</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it when <b>headcount is set by money rather than by workload</b>: sales forces funded as a share of revenue, grant-funded teams, public services with a fixed pay bill. Hines' classic example is Forrester's <i>Market Growth as Influenced by Capital Investment</i>, where the sales budget sets the size of the sales force.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Business</b>: a sales force sized by the share of revenue allocated to selling.</li>
      <li><b>Healthcare</b>: nursing establishment set by a ward's pay budget and the average cost per nurse.</li>
      <li><b>Research</b>: the number of postdocs a grant can support.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    A budget of $3,000k a year and an average wage of $60k give <code>3000 / 60 = 50</code> desired people. Starting from 20 with a 2-year adjustment time, hiring begins at <code>(50 − 20) / 2 = 15</code> people a year and the workforce approaches 50, at which point spending is <code>50 × 60 = $3,000k</code>: the whole budget. Let the average wage rise to $75k with the budget unchanged and the affordable workforce falls to <code>3000 / 75 = 40</code>.</div>
    <h4>Caveats</h4>
    <p>If the average wage can go to zero, protect against dividing by zero (the slider here stops at $30k).</p>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i>, Workforce from Budget.</li>
      <li>Forrester, J. W. (1968). "Market growth as influenced by capital investment." <i>Industrial Management Review</i> 9(2): 83-105.</li>
    </ul>`,
  },
};

export const FLOW_META_B: Record<string, Record<string, FlowMeta>> = {
  seaAnchorPricing: {
    changeInUnderlyingPrice: {
      name: "change in underlying price",
      eq: "(Price − Underlying price) / time to change,  Price = Underlying price × pressure",
      in: ["underlyingPrice", "inventory", "targetInventory", "relMarketShare", "timeToChange"],
      loop: "R",
    },
  },
  protSeaAnchorPricing: {
    changeInUnderlyingPrice: {
      name: "change in underlying price",
      eq: "(MAX(Price, minimum underlying price) − Underlying price) / time to change",
      in: ["underlyingPrice", "inventory", "targetInventory", "relMarketShare", "minPrice", "timeToChange"],
      loop: "B",
    },
  },
  propSplit: {
    inA: { name: "new tasks A", eq: "new tasks A", in: ["arrA"] },
    inB: { name: "new tasks B", eq: "new tasks B", in: ["arrB"] },
    inC: { name: "new tasks C", eq: "new tasks C", in: ["arrC"] },
    doneA: { name: "completing A", eq: "MIN(resources × (A / total tasks) × productivity, A / 0.5)", in: ["tasksA", "resources", "productivity"], loop: "B" },
    doneB: { name: "completing B", eq: "MIN(resources × (B / total tasks) × productivity, B / 0.5)", in: ["tasksB", "resources", "productivity"], loop: "B" },
    doneC: { name: "completing C", eq: "MIN(resources × (C / total tasks) × productivity, C / 0.5)", in: ["tasksC", "resources", "productivity"], loop: "B" },
  },
  nonlinearSplit: {
    toA: { name: "quantity to A", eq: "total quantity × fraction to A", in: ["totalQuantity", "strengthA", "strengthB", "minFraction"] },
    toB: { name: "quantity to B", eq: "total quantity − quantity to A", in: ["totalQuantity", "strengthA", "strengthB", "minFraction"] },
    outA: { name: "use by A", eq: "Held by A / holding time", in: ["a", "tau"], loop: "B" },
    outB: { name: "use by B", eq: "Held by B / holding time", in: ["b", "tau"], loop: "B" },
  },
  actionFromResource: {
    flow: { name: "flow", eq: "resources × resource ability to create flow", in: ["resources", "ability"] },
    outflow: { name: "drain", eq: "Tank / drain time", in: ["tank", "drainTau"], loop: "B" },
  },
  financialFlow: {
    revenue: { name: "revenue", eq: "revenue", in: ["revenue"] },
    spending: { name: "spending", eq: "workers × wage", in: ["workers", "wage"] },
  },
  resourcesFromAction: {
    acquiring: {
      name: "acquiring resources",
      eq: "(desired flow / ability − Resources) / time to acquire",
      in: ["desiredFlow", "ability", "resources", "adjTime"],
      loop: "B",
    },
  },
  workforceFromBudget: {
    hiring: {
      name: "net hiring",
      eq: "(budget / average wage − Workforce) / time to adjust",
      in: ["budget", "avgWage", "workforce", "tHire"],
      loop: "B",
    },
  },
};

export const DIAGRAM_EXTRA_B: Record<string, { stocks: [string, string][]; aux?: [string, string][] }> = {
  seaAnchorPricing: {
    stocks: [["Underlying price", "INTEG((Price − Underlying price) / time to change, 10)"]],
    aux: [
      ["Price", "Underlying price × pressure to change price"],
      ["pressure to change price", "effect of inventory × effect of market share"],
      ["effect of inventory on price", "2 / (1 + Inventory / Target inventory)"],
      ["effect of market share on price", "2·rel / (1 + rel),  rel = relative market share"],
    ],
  },
  protSeaAnchorPricing: {
    stocks: [["Underlying price", "INTEG((Indicated underlying price − Underlying price) / time to change, 10)"]],
    aux: [
      ["Price", "Underlying price × pressure to change price"],
      ["Indicated underlying price", "MAX(Price, Minimum underlying price)"],
      ["pressure to change price", "effect of inventory × effect of market share"],
      ["effect of inventory on price", "2 / (1 + Inventory / Target inventory)"],
      ["effect of market share on price", "2·rel / (1 + rel),  rel = relative market share"],
    ],
  },
  propSplit: {
    stocks: [
      ["Tasks A", "INTEG(new tasks A − completing A, 20)"],
      ["Tasks B", "INTEG(new tasks B − completing B, 60)"],
      ["Tasks C", "INTEG(new tasks C − completing C, 20)"],
    ],
    aux: [
      ["resources for A", "Resources × relative strength of A's claim"],
      ["relative strength of A's claim", "Tasks A / total claim strength"],
      ["total claim strength", "Tasks A + Tasks B + Tasks C"],
    ],
  },
  nonlinearSplit: {
    stocks: [
      ["Held by A", "INTEG(quantity to A − use by A, 0)"],
      ["Held by B", "INTEG(quantity to B − use by B, 0)"],
    ],
    aux: [
      ["fraction to A", "MIN(1 − minimum, MAX(minimum, indicated fraction to A))"],
      ["indicated fraction to A", "strength of A's claim / total claim"],
      ["total claim", "strength of A's claim + strength of B's claim"],
    ],
  },
  actionFromResource: {
    stocks: [["Tank", "INTEG(flow − drain, 0)"]],
    aux: [["steady state", "Tank = resources × ability × drain time"]],
  },
  financialFlow: {
    stocks: [["Cash", "INTEG(revenue − spending, 500)"]],
    aux: [["spending", "workers × wage"]],
  },
  resourcesFromAction: {
    stocks: [["Resources", "INTEG((resources required − Resources) / time to acquire, 5)"]],
    aux: [
      ["resources required", "desired flow / resource ability to create flow"],
      ["actual flow", "Resources × resource ability to create flow"],
    ],
  },
  workforceFromBudget: {
    stocks: [["Workforce", "INTEG((desired people − Workforce) / time to adjust, 20)"]],
    aux: [
      ["desired people", "workforce budget / average wage"],
      ["spending", "Workforce × average wage"],
    ],
  },
};

export const LESSONS_B: Record<string, Lesson> = {
  seaAnchorPricing: {
    q: "Inventory is held at 75% of target, so the pressure to change price stays at about 1.14. Over the next 30 years the price will…",
    options: ["jump 14% and then stay there", "keep rising exponentially", "rise, then return to $10", "oscillate around $10"],
    answer: 1,
    explain: "Each bump is absorbed into the underlying price and then bumped again: the underlying price grows at (1.14 − 1)/4 ≈ 3.6%/yr, from $10 to about $29 in 30 years. Only a pressure of exactly 1 stops it.",
    preset: { inventory: 75, targetInventory: 100, relMarketShare: 1, timeToChange: 4 },
  },
  protSeaAnchorPricing: {
    q: "A glut (inventory 150 vs target 100) holds the pressure at 0.8. The minimum underlying price is $6 and the underlying price starts at $10. Where does the underlying price end up?",
    options: ["$0", "$4.80", "$6", "$10"],
    answer: 2,
    explain: "It decays 4%/yr until the price (80% of it) drops below $6; from then on MAX picks the minimum and the underlying price settles at $6. The price itself sits lower, at 6 × 0.8 = $4.80.",
    preset: { inventory: 150, targetInventory: 100, relMarketShare: 1, minPrice: 6, timeToChange: 5 },
  },
  propSplit: {
    q: "Ten people (capacity 10 tasks/wk) share backlogs of 20, 60 and 20. New tasks arrive at 5, 3 and 2 a week. Backlog A, which starts at 20, settles near…",
    options: ["20", "33", "50", "0"],
    answer: 2,
    explain: "Arrivals equal capacity, so the total stays at 100. Each backlog must hold the share of the total that earns it enough people to match its arrivals: A = 100 × 5/10 = 50 (B = 30, C = 20).",
    preset: { resources: 10, productivity: 1, arrA: 5, arrB: 3, arrC: 2 },
  },
  nonlinearSplit: {
    q: "Total 20/wk, claims of 9 (A) and 1 (B), minimum fraction 0.2. How much does B receive each week?",
    options: ["2", "4", "10", "0"],
    answer: 1,
    explain: "The indicated fraction to A is 0.9, but the lookup caps it at 1 − 0.2 = 0.8. A gets 16 and B gets 20 − 16 = 4, double its proportional 2.",
    preset: { totalQuantity: 20, strengthA: 9, strengthB: 1, minFraction: 0.2, tau: 5 },
  },
  actionFromResource: {
    q: "Ten pumps, each able to move 3 gal/mo, fill a tank that drains with a 4-month time constant. Starting empty, the tank settles at…",
    options: ["30 gallons", "40 gallons", "120 gallons", "it keeps rising"],
    answer: 2,
    explain: "flow = resources × ability = 10 × 3 = 30 gal/mo. The tank levels off where drain = flow: Tank / 4 = 30, so Tank = 120.",
    preset: { resources: 10, ability: 3, drainTau: 4 },
  },
  financialFlow: {
    q: "20 workers at $5k/mo each, revenue $80k/mo, $500k in the bank. How long does the cash last?",
    options: ["5 months", "about 6 months", "25 months", "indefinitely"],
    answer: 2,
    explain: "spending = workers × wage = 20 × 5 = $100k/mo. Net cash flow is 80 − 100 = −$20k/mo, so 500 / 20 = 25 months.",
    preset: { workers: 20, wage: 5, revenue: 80 },
  },
  resourcesFromAction: {
    q: "We want a flow of 60 gal/mo and each pump can move 3 gal/mo. Starting with 5 pumps, the stock of pumps heads toward…",
    options: ["5", "20", "63", "180"],
    answer: 1,
    explain: "resources = desired flow / ability = 60 / 3 = 20. Divide, do not multiply: abler resources mean fewer are needed.",
    preset: { desiredFlow: 60, ability: 3, adjTime: 4 },
  },
  workforceFromBudget: {
    q: "The workforce budget is $3,000k/yr and the average wage is $75k. Starting from 20 people, the workforce heads toward…",
    options: ["20", "40", "50", "75"],
    answer: 1,
    explain: "Desired people = budget / average wage = 3000 / 75 = 40. At $60k the same budget bought 50: a pay rise with a flat budget means fewer people.",
    preset: { budget: 3000, avgWage: 75, tHire: 2 },
  },
};

export const PRESETS_B: Record<string, Preset[]> = {
  seaAnchorPricing: [
    { label: "Shortage (price climbs)", params: { inventory: 75, targetInventory: 100, relMarketShare: 1, timeToChange: 4 } },
    { label: "Neutral (pressure = 1)", params: { inventory: 100, targetInventory: 100, relMarketShare: 1, timeToChange: 4 } },
    { label: "Glut (decays toward 0)", params: { inventory: 150, targetInventory: 100, relMarketShare: 1, timeToChange: 4 } },
  ],
  protSeaAnchorPricing: [
    { label: "Glut with $6 floor", params: { inventory: 150, targetInventory: 100, relMarketShare: 1, minPrice: 6, timeToChange: 5 } },
    { label: "Glut, no floor", params: { inventory: 150, targetInventory: 100, relMarketShare: 1, minPrice: 0, timeToChange: 5 } },
    { label: "Shortage (floor idle)", params: { inventory: 75, targetInventory: 100, relMarketShare: 1, minPrice: 6, timeToChange: 5 } },
  ],
  propSplit: [
    { label: "Capacity = arrivals", params: { resources: 10, productivity: 1, arrA: 5, arrB: 3, arrC: 2 } },
    { label: "Overloaded", params: { resources: 7, productivity: 1, arrA: 5, arrB: 3, arrC: 2 } },
    { label: "Surplus capacity", params: { resources: 14, productivity: 1, arrA: 5, arrB: 3, arrC: 2 } },
  ],
  nonlinearSplit: [
    { label: "Minimum share binds", params: { totalQuantity: 20, strengthA: 9, strengthB: 1, minFraction: 0.2, tau: 5 } },
    { label: "Plain proportional", params: { totalQuantity: 20, strengthA: 9, strengthB: 1, minFraction: 0, tau: 5 } },
    { label: "Forced 50 / 50", params: { totalQuantity: 20, strengthA: 9, strengthB: 1, minFraction: 0.5, tau: 5 } },
  ],
  actionFromResource: [
    { label: "10 pumps × 3", params: { resources: 10, ability: 3, drainTau: 4 } },
    { label: "Double the resources", params: { resources: 20, ability: 3, drainTau: 4 } },
    { label: "Half the ability", params: { resources: 10, ability: 1.5, drainTau: 4 } },
  ],
  financialFlow: [
    { label: "Burning cash", params: { workers: 20, wage: 5, revenue: 80 } },
    { label: "Break-even", params: { workers: 16, wage: 5, revenue: 80 } },
    { label: "Building cash", params: { workers: 12, wage: 5, revenue: 80 } },
  ],
  resourcesFromAction: [
    { label: "Need 20", params: { desiredFlow: 60, ability: 3, adjTime: 4 } },
    { label: "Abler resources", params: { desiredFlow: 60, ability: 6, adjTime: 4 } },
    { label: "Double the target", params: { desiredFlow: 120, ability: 3, adjTime: 4 } },
  ],
  workforceFromBudget: [
    { label: "Can afford 50", params: { budget: 3000, avgWage: 60, tHire: 2 } },
    { label: "Pay rise", params: { budget: 3000, avgWage: 75, tHire: 2 } },
    { label: "Budget cut", params: { budget: 900, avgWage: 60, tHire: 2 } },
  ],
};

// Immediate parents, using app keys. Follows the book's "Immediate Parents".
export const LINEAGE_B: Record<string, string[]> = {
  seaAnchorPricing: ["seaAnchor"],
  protSeaAnchorPricing: ["protectedSeaAnchor", "seaAnchorPricing"],
  propSplit: [],
  // Book: "Univariate anchoring and adjustment, Proportional split". Univariate anchoring is not
  // in the app; effectFunction (Dmnl input to function, its ultimate parent) is the nearest ancestor.
  nonlinearSplit: ["propSplit", "effectFunction"],
  actionFromResource: [],
  financialFlow: ["actionFromResource"],
  resourcesFromAction: ["actionFromResource"],
  workforceFromBudget: ["resourcesFromAction", "financialFlow"],
};
