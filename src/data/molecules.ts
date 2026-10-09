import { MODELS_A } from "@/data/extra/batchA";
import { MODELS_B } from "@/data/extra/batchB";
import { MODELS_C } from "@/data/extra/batchC";
import { MODELS_E } from "@/data/extra/batchE";
import { MODELS_D } from "@/data/extra/batchD";
import type { Vars } from "@/sim/engine";

export type Stock = { id: string; label: string; init: number; scale: number; color: string; hidden?: boolean; chartHidden?: boolean };
export type Param = { id: string; label: string; min: number; max: number; step: number; value: number; unit: string };
export type FlowGeo = { id: string; pts: [number, number][]; from?: string; to?: string; max: number; color?: string };
export type StockGeo = { x: number; y: number; w: number; h: number };
export type CldVar = { id: string; label: string; x: number; y: number };
export type CldLink = { from: string; to: string; sign: "+" | "−"; curve?: number; self?: boolean; note?: string };
export type CldLoop = { type: "B" | "R"; label: string; x: number; y: number };

export type Model = {
  name: string;
  title: string;
  timeUnit: string;
  unitY: string;
  lede: string;
  stocks: Stock[];
  params: Param[];
  rates: (s: Vars, p: Vars) => Vars;
  derivs: (s: Vars, p: Vars, r: Vars) => Vars;
  diagram: { stocks: Record<string, StockGeo>; flows: FlowGeo[] };
  cld: { vars: CldVar[]; links: CldLink[]; loops: CldLoop[]; caption: string };
  desc: string;
};

const C = { acc: "#2545ff", acc2: "#d9480f", good: "#0f8a5f", pink: "#c2255c" };

export const MODELS: Record<string, Model> = {
  bathtub: {
    name: "Bathtub",
    title: "Bathtub",
    timeUnit: "yr",
    unitY: "units",
    lede: "One stock, one inflow, one outflow — the atom of system dynamics. Every other molecule is built from this.",
    stocks: [{ id: "level", label: "Level", init: 50, scale: 200, color: C.acc }],
    params: [
      { id: "inflow", label: "Inflow", min: 0, max: 30, step: 0.5, value: 10, unit: "/yr" },
      { id: "outflow", label: "Outflow", min: 0, max: 30, step: 0.5, value: 8, unit: "/yr" },
    ],
    rates: (s, p) => ({ in: p.inflow, out: s.level > 0 ? p.outflow : 0 }),
    derivs: (_s, _p, r) => ({ level: r.in - r.out }),
    diagram: {
      stocks: { level: { x: 350, y: 95, w: 120, h: 120 } },
      flows: [
        { id: "in", pts: [[40, 155], [350, 155]], to: "level", max: 30 },
        { id: "out", pts: [[470, 155], [780, 155]], from: "level", max: 30 },
      ],
    },
    cld: {
      vars: [
        { id: "in", label: "Inflow", x: 95, y: 65 },
        { id: "lv", label: "Level", x: 260, y: 150 },
        { id: "out", label: "Outflow", x: 430, y: 65 },
      ],
      links: [
        { from: "in", to: "lv", sign: "+", curve: -26 },
        { from: "out", to: "lv", sign: "−", curve: 26 },
      ],
      loops: [],
      caption:
        '<span class="chip chipB">open</span> No closed loop: both flows are set from outside, so the level just integrates whatever it is given. The instant you make the outflow depend on the level (e.g. <code>out = Level/τ</code>) a <b>balancing loop</b> appears — that is the next molecule, <b>Decay</b>.',
    },
    desc: `<p>A bathtub <b>accumulates the difference</b> between its inflow and outflow. The water level rises when the tap exceeds the drain and falls when it does not. Critically, a stock has <b>memory</b>: it holds the running integral of net flow, so its value depends on the entire past, not just the current rate.</p>
    <div class="eq">Level(t) = Level₀ + ∫₀ᵗ ( Inflow − Outflow ) dt</div>
    <div class="whenbox"><h4>When to use it</h4>
    Reach for a bathtub whenever something <b>persists and accumulates</b> — any quantity that has a "how much is here right now?" answer that carries over between periods. It is the first structure you draw in almost every model. If a variable can be drained and refilled and remembers its past, it is a stock.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — hospital beds occupied (admissions − discharges); a blood-bank or vaccine stockpile (deliveries − usage/expiry).</li>
      <li><b>Sustainability</b> — a reservoir or aquifer (recharge − withdrawal); landfill volume; atmospheric CO₂ (emissions − net absorption).</li>
      <li><b>Business</b> — workforce (hiring − attrition); inventory or cash (production/revenue − sales/spend).</li>
      <li><b>Finance</b> — debt or savings: anything filled and drained over time.</li>
    </ul>
    <h4>The key lesson</h4>
    <p>Set inflow above outflow → the level rises <i>forever</i>; there is nothing to stop it. The level keeps climbing even while the inflow is <b>falling</b>, as long as inflow stays above outflow. Misreading this — assuming a stock falls when its inflow falls — is the classic "stock–flow failure" Sterman documented even in trained adults.</p>
    <p class="small">Physical stocks should not go negative; here the drain stops at empty — a first hint of first-order feedback, formalized in Decay and the Protected-Level molecules.</p>
    <div class="worked"><h4>Worked example</h4>
    A reservoir holds 50 Mm³. Inflow (rain + rivers) is 10 Mm³/yr and withdrawals 8 Mm³/yr, so it gains 2 Mm³/yr and reaches <b>70 Mm³ after 10 years</b>. Raise withdrawals to 12 Mm³/yr and it instead <i>falls</i> 2 Mm³/yr — even though the inflow never changed. The level tracks the <b>net</b> flow, not either flow alone.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Forrester, J. W. (1961). <i>Industrial Dynamics</i>. MIT Press — origin of stock/flow accounting in SD.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 6 "Stocks and Flows". Irwin/McGraw-Hill.</li>
      <li>Meadows, D. H. (2008). <i>Thinking in Systems: A Primer</i> — stocks as the memory of a system.</li>
      <li>Sterman, J. D. &amp; Booth Sweeney, L. (2007). "Understanding public complacency about climate change: adults' mental models of climate change violate conservation of matter." <i>Climatic Change</i> 80: 213–238 — the CO₂ "bathtub" study.</li>
    </ul>`,
  },

  cascade: {
    name: "Cascaded Levels",
    title: "Cascaded Levels (Chain)",
    timeUnit: "mo",
    unitY: "units",
    lede: "Material accumulates at several points in series; each stage drains into the next with a delay. This is how time-lags are built.",
    stocks: [
      { id: "l1", label: "Stage 1", init: 60, scale: 70, color: C.acc },
      { id: "l2", label: "Stage 2", init: 0, scale: 70, color: C.acc2 },
      { id: "l3", label: "Stage 3", init: 0, scale: 70, color: C.good },
    ],
    params: [
      { id: "inflow", label: "Inflow", min: 0, max: 20, step: 0.5, value: 0, unit: "/mo" },
      { id: "tau", label: "Stage delay τ", min: 1, max: 12, step: 0.5, value: 4, unit: "mo" },
    ],
    rates: (s, p) => ({ in: p.inflow, f12: s.l1 / p.tau, f23: s.l2 / p.tau, out: s.l3 / p.tau }),
    derivs: (_s, _p, r) => ({ l1: r.in - r.f12, l2: r.f12 - r.f23, l3: r.f23 - r.out }),
    diagram: {
      stocks: {
        l1: { x: 120, y: 105, w: 100, h: 100 },
        l2: { x: 360, y: 105, w: 100, h: 100 },
        l3: { x: 600, y: 105, w: 100, h: 100 },
      },
      flows: [
        { id: "in", pts: [[20, 155], [120, 155]], to: "l1", max: 20 },
        { id: "f12", pts: [[220, 155], [360, 155]], from: "l1", to: "l2", max: 20 },
        { id: "f23", pts: [[460, 155], [600, 155]], from: "l2", to: "l3", max: 20 },
        { id: "out", pts: [[700, 155], [800, 155]], from: "l3", max: 20 },
      ],
    },
    cld: {
      vars: [
        { id: "s1", label: "Stage 1", x: 120, y: 135 },
        { id: "s2", label: "Stage 2", x: 280, y: 135 },
        { id: "s3", label: "Stage 3", x: 440, y: 135 },
      ],
      links: [
        { from: "s1", to: "s2", sign: "+", curve: -22 },
        { from: "s2", to: "s3", sign: "+", curve: -22 },
        { from: "s1", to: "s1", sign: "−", self: true },
        { from: "s2", to: "s2", sign: "−", self: true },
        { from: "s3", to: "s3", sign: "−", self: true },
      ],
      loops: [
        { type: "B", label: "B1", x: 120, y: 60 },
        { type: "B", label: "B2", x: 280, y: 60 },
        { type: "B", label: "B3", x: 440, y: 60 },
      ],
      caption:
        '<span class="chip chipB">B×3</span> Each stock drains in proportion to itself — a <b>balancing loop</b> that makes each stage approach emptiness exponentially. Chained together, the three first-order loops form a <b>third-order material delay</b>: the output is a smeared, delayed echo of the input.',
    },
    desc: `<p>A chain of stocks. Each outflow equals its own stock divided by an average delay τ, so the more is in a stage, the faster it leaves. A pulse entering stage 1 is <b>spread out and delayed</b> as it travels — it arrives later and flatter at each successive stage.</p>
    <div class="eq">flow(i → i+1) = Stageᵢ / τ&nbsp;&nbsp;&nbsp;(first-order outflow)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use a chain when a process <b>genuinely takes time</b> and material is "in the pipe" at multiple points at once, so you care about work-in-progress, not just the endpoints. It is the right structure whenever output lags input and you need a realistic, smooth delay rather than a hard fixed lag. The number of stages tunes the shape: more stages → sharper, more pipeline-like delay.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — patient pathway: ED → ward → rehab → discharge; or a drug moving through body compartments (pharmacokinetics).</li>
      <li><b>Epidemiology (SEIR)</b> — susceptible → exposed → infectious → recovered.</li>
      <li><b>Sustainability</b> — carbon through soil → biomass → atmosphere pools; multi-stage waste recycling.</li>
      <li><b>Supply chain & demographics</b> — raw → WIP → finished goods; age cohorts ageing into the next bracket.</li>
    </ul>
    <h4>Try this</h4>
    <p>Start with stage 1 full and inflow = 0 (the default), then play: watch the bulge travel downstream and flatten — a <b>distributed material delay</b>. Lower τ and the pulse passes through faster and sharper.</p>
    <div class="worked"><h4>Worked example</h4>
    A patient pathway ED → ward → rehab, each stage with average dwell τ = 4 days. A surge of 60 arrivals at the ED is felt in rehab about <b>3 × 4 = 12 days later</b>, and arrives <i>spread over a week</i> rather than as a spike. The total mean delay of an <i>n</i>-stage first-order chain is <code>n·τ</code>; more stages → a sharper, more pipeline-like delay (an Erlang/​gamma shape).</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 11 "Delays" — first- and higher-order material delays.</li>
      <li>Forrester, J. W. (1961). <i>Industrial Dynamics</i>. MIT Press.</li>
      <li>Kermack, W. O. &amp; McKendrick, A. G. (1927). "A contribution to the mathematical theory of epidemics." <i>Proc. R. Soc. Lond. A</i> 115: 700–721 — the S→E→I→R compartment chain.</li>
      <li>Hines, J. <i>Molecules of Structure</i> — Cascaded Levels / Aging Chain.</li>
    </ul>`,
  },

  conversion: {
    name: "Conversion",
    title: "Conversion",
    timeUnit: "mo",
    unitY: "qty",
    lede: "Material changes form — and units — as it flows between stocks: ore becomes metal, orders become product.",
    stocks: [
      { id: "raw", label: "Raw (tons)", init: 100, scale: 120, color: C.acc2 },
      { id: "fin", label: "Finished (units)", init: 0, scale: 160, color: C.good },
    ],
    params: [
      { id: "feed", label: "Feed in", min: 0, max: 30, step: 0.5, value: 10, unit: "t/mo" },
      { id: "tau", label: "Process time τ", min: 1, max: 12, step: 0.5, value: 4, unit: "mo" },
      { id: "yield", label: "Yield", min: 0.2, max: 5, step: 0.1, value: 2, unit: " u/t" },
    ],
    rates: (s, p) => {
      const conv = s.raw / p.tau;
      return { in: p.feed, conv, made: conv * p.yield, out: s.fin / 6 };
    },
    derivs: (_s, _p, r) => ({ raw: r.in - r.conv, fin: r.made - r.out }),
    diagram: {
      stocks: { raw: { x: 150, y: 105, w: 110, h: 100 }, fin: { x: 520, y: 105, w: 110, h: 100 } },
      flows: [
        { id: "in", pts: [[40, 155], [150, 155]], to: "raw", max: 30 },
        { id: "made", pts: [[260, 155], [520, 155]], from: "raw", to: "fin", max: 30, color: C.good },
        { id: "out", pts: [[630, 155], [790, 155]], from: "fin", max: 30 },
      ],
    },
    cld: {
      vars: [
        { id: "raw", label: "Raw", x: 150, y: 135 },
        { id: "fin", label: "Finished", x: 360, y: 135 },
      ],
      links: [
        { from: "raw", to: "fin", sign: "+", curve: -26, note: "× yield" },
        { from: "raw", to: "raw", sign: "−", self: true },
        { from: "fin", to: "fin", sign: "−", self: true },
      ],
      loops: [
        { type: "B", label: "B1", x: 150, y: 60 },
        { type: "B", label: "B2", x: 360, y: 60 },
      ],
      caption:
        '<span class="chip chipB">B×2</span> Structurally a two-stock chain with the same balancing drains — but the link from Raw to Finished carries a <b>yield multiplier</b>, so the quantity (and the units) change as material crosses it.',
    },
    desc: `<p>Like a chain, but the flow leaving one stock is <b>multiplied by a conversion factor</b> before it enters the next. The units, and often the meaning, change across the link — two tons of ore may yield three units of metal. The two stocks are measured in different units and must be tracked separately.</p>
    <div class="eq">made = ( Raw / τ ) × yield&nbsp;&nbsp;&nbsp;[units] = [material/time] × [units/material]</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use conversion when material <b>transforms into something measured differently</b> and a ratio governs the exchange — input and output cannot share a unit. Whenever you would write "X tons gives Y units," or efficiency/yield matters to the answer, this is the molecule. (If the yield were 1 and units matched, you would just use a plain chain.)</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — vaccine doses → immunised people; donated plasma → therapy units.</li>
      <li><b>Sustainability</b> — sunlight → kWh (solar yield); waste (tons) → recycled material (units); biomass → biofuel.</li>
      <li><b>Manufacturing & energy</b> — ore (tons) → metal (units); fuel (litres) → electricity (kWh), with efficiency.</li>
      <li><b>Finance / FX</b> — one currency → another at a rate.</li>
    </ul>
    <h4>Try this</h4>
    <p>Raise the yield and the finished stock outpaces the raw stock that feeds it — conversion is where stock-and-flow modelling cleanly separates <i>quantity</i> from <i>kind</i>.</p>
    <div class="worked"><h4>Worked example</h4>
    A smelter draws ore at Raw/τ = 2 tons/day and the yield is 1.5 units/ton, so once the process fills it produces <b>3 finished units/day</b>. Double the yield to 3 u/t and output doubles to 6 units/day for the <i>same</i> ore draw — the conversion factor, not the throughput, sets the output. Always dimension-check: [units/day] = [tons/day] × [units/ton]. ✓</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Conversion.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 13 — formulating rate equations and dimensional consistency (every equation must balance units).</li>
    </ul>`,
  },

  split: {
    name: "Split Flow",
    title: "Split Flow",
    timeUnit: "mo",
    unitY: "units",
    lede: "One inflow divides between destinations by a fraction — the basis of allocation, routing, and market share.",
    stocks: [
      { id: "a", label: "Channel A", init: 0, scale: 120, color: C.acc },
      { id: "b", label: "Channel B", init: 0, scale: 120, color: C.pink },
    ],
    params: [
      { id: "inflow", label: "Inflow", min: 0, max: 30, step: 0.5, value: 14, unit: "/mo" },
      { id: "frac", label: "Fraction → A", min: 0, max: 1, step: 0.02, value: 0.6, unit: "" },
      { id: "tau", label: "Drain τ", min: 1, max: 12, step: 0.5, value: 5, unit: "mo" },
    ],
    rates: (s, p) => ({
      in: p.inflow,
      toA: p.inflow * p.frac,
      toB: p.inflow * (1 - p.frac),
      outA: s.a / p.tau,
      outB: s.b / p.tau,
    }),
    derivs: (_s, _p, r) => ({ a: r.toA - r.outA, b: r.toB - r.outB }),
    diagram: {
      stocks: { a: { x: 480, y: 35, w: 110, h: 90 }, b: { x: 480, y: 175, w: 110, h: 90 } },
      flows: [
        { id: "toA", pts: [[120, 150], [300, 150], [300, 80], [480, 80]], to: "a", max: 30 },
        { id: "toB", pts: [[120, 150], [300, 150], [300, 220], [480, 220]], to: "b", max: 30, color: C.pink },
        { id: "outA", pts: [[590, 80], [790, 80]], from: "a", max: 30 },
        { id: "outB", pts: [[590, 220], [790, 220]], from: "b", max: 30 },
      ],
    },
    cld: {
      vars: [
        { id: "in", label: "Inflow", x: 260, y: 55 },
        { id: "a", label: "Channel A", x: 130, y: 175 },
        { id: "b", label: "Channel B", x: 390, y: 175 },
      ],
      links: [
        { from: "in", to: "a", sign: "+", curve: 24, note: "× f" },
        { from: "in", to: "b", sign: "+", curve: -24, note: "× (1−f)" },
        { from: "a", to: "a", sign: "−", self: true },
        { from: "b", to: "b", sign: "−", self: true },
      ],
      loops: [
        { type: "B", label: "B1", x: 130, y: 245 },
        { type: "B", label: "B2", x: 390, y: 245 },
      ],
      caption:
        '<span class="chip chipB">B×2</span> The inflow splits by fraction <code>f</code> and <code>1−f</code>; the parts always sum to the whole (<b>conservation</b>). Each channel drains itself (balancing). Make <code>f</code> depend on the channels\' relative attractiveness and you have built the <b>market-share</b> molecule.',
    },
    desc: `<p>A single inflow is allocated between destinations by a fraction. <b>Conservation always holds</b>: whatever is not routed to A goes to B, so the parts sum to the inflow exactly. At steady state each stock settles at <code>flowᵢ × τ</code> (Little's Law: stock = throughput × residence time).</p>
    <div class="eq">to A = Inflow × f&nbsp;&nbsp;|&nbsp;&nbsp;to B = Inflow × (1 − f)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use a split whenever one flow must be <b>divided among parallel destinations</b> and you need the shares to add up. With a fixed fraction it is simple allocation; make the fraction <b>endogenous</b> — a function of price, quality, or attractiveness — and the same structure produces competitive dynamics, tipping, and lock-in. It is the seed of every market-share and choice model.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — triage splits arrivals to ICU vs ward vs discharge; a health budget split across services.</li>
      <li><b>Sustainability</b> — a waste stream split recycle / compost / landfill; the energy mix split renewable vs fossil.</li>
      <li><b>Market share</b> — demand split across competing products by attractiveness.</li>
      <li><b>Operations</b> — leads, tickets or arrivals routed across teams.</li>
    </ul>
    <h4>Try this</h4>
    <p>Slide the fraction and watch the two stocks trade dominance while their total stays tied to the inflow — conservation in action.</p>
    <div class="worked"><h4>Worked example</h4>
    A support desk takes 14 tickets/day; 60% route to team A, which handles a ticket in an average of 5 days. By <b>Little's Law</b> team A's open queue settles at <code>14 × 0.6 × 5 = 42</code> tickets, and team B at <code>14 × 0.4 × 5 = 28</code> — together 70, exactly throughput (14/day) × residence time (5 days). Shift the split and the totals move, but they always sum to the inflow.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Little, J. D. C. (1961). "A proof for the queuing formula: L = λW." <i>Operations Research</i> 9(3): 383–387 — steady-state stock = throughput × residence time.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 13–15 — market share via relative attractiveness (logit-style allocation).</li>
      <li>Hines, J. <i>Molecules of Structure</i> — Split Flow / Market Share.</li>
    </ul>`,
  },

  broken: {
    name: "Broken Cascade",
    title: "Broken Cascade",
    timeUnit: "mo",
    unitY: "units",
    lede: "A chain where material can leak out mid-stream instead of always advancing — the structure behind funnels and yield loss.",
    stocks: [
      { id: "l1", label: "Stage 1", init: 80, scale: 90, color: C.acc },
      { id: "l2", label: "Stage 2", init: 0, scale: 60, color: C.good },
    ],
    params: [
      { id: "inflow", label: "Inflow", min: 0, max: 20, step: 0.5, value: 0, unit: "/mo" },
      { id: "tau", label: "Flow τ", min: 1, max: 12, step: 0.5, value: 4, unit: "mo" },
      { id: "leak", label: "Leak fraction", min: 0, max: 0.9, step: 0.02, value: 0.3, unit: "" },
    ],
    rates: (s, p) => {
      const exit = s.l1 / p.tau;
      return { in: p.inflow, leak: exit * p.leak, fwd: exit * (1 - p.leak), out: s.l2 / p.tau };
    },
    derivs: (_s, _p, r) => ({ l1: r.in - r.leak - r.fwd, l2: r.fwd - r.out }),
    diagram: {
      stocks: { l1: { x: 150, y: 75, w: 110, h: 100 }, l2: { x: 520, y: 75, w: 110, h: 100 } },
      flows: [
        { id: "in", pts: [[40, 125], [150, 125]], to: "l1", max: 20 },
        { id: "fwd", pts: [[260, 125], [520, 125]], from: "l1", to: "l2", max: 20 },
        { id: "leak", pts: [[205, 175], [205, 290]], from: "l1", max: 20, color: C.pink },
        { id: "out", pts: [[630, 125], [790, 125]], from: "l2", max: 20 },
      ],
    },
    cld: {
      vars: [
        { id: "s1", label: "Stage 1", x: 130, y: 140 },
        { id: "s2", label: "Stage 2", x: 360, y: 140 },
        { id: "lk", label: "Lost", x: 130, y: 245 },
      ],
      links: [
        { from: "s1", to: "s2", sign: "+", curve: -22, note: "×(1−L)" },
        { from: "s1", to: "lk", sign: "+", curve: 18, note: "×L" },
        { from: "s1", to: "s1", sign: "−", self: true },
        { from: "s2", to: "s2", sign: "−", self: true },
      ],
      loops: [
        { type: "B", label: "B1", x: 130, y: 65 },
        { type: "B", label: "B2", x: 360, y: 65 },
      ],
      caption:
        '<span class="chip chipB">B×2</span> Material leaving stage 1 forks: a fraction <code>L</code> leaks away (lost) and only <code>1−L</code> advances. Same balancing drains as a chain, but the leak means <b>the downstream stock can never receive everything that started upstream</b>.',
    },
    desc: `<p>A cascade with a side exit. Some fraction of what leaves stage 1 is lost (the pink leak) rather than passed forward, so only the surviving fraction reaches stage 2. Stack several of these and a small per-stage loss compounds into a large end-to-end loss.</p>
    <div class="eq">forward = (Stage1/τ)(1 − L)&nbsp;&nbsp;|&nbsp;&nbsp;leak = (Stage1/τ)·L</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use a broken cascade for any <b>pipeline with attrition</b> — where things progress <i>or</i> drop out at each step, and you need to model both the survivors and the losses. If the only question were "how long does it take," a plain chain suffices; reach for the broken cascade specifically when <b>conversion rate / yield</b> is the thing you are trying to explain or improve.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — the care cascade: diagnosed → linked to care → treated → controlled, with drop-off at each step (HIV, hypertension, diabetes).</li>
      <li><b>Sustainability</b> — recycling: collected → sorted → reprocessed, losing contaminated material at each stage; water-network leakage.</li>
      <li><b>Sales / hiring funnel</b> — leads or applicants advance or drop out at each stage.</li>
      <li><b>Manufacturing & trials</b> — units pass inspection or are scrapped; trial participants complete or drop out.</li>
    </ul>
    <h4>Try this</h4>
    <p>Push the leak fraction toward 0.9 — almost nothing reaches stage 2. This is exactly why funnel <i>conversion rates</i> dominate end-to-end yield far more than throughput speed does.</p>
    <div class="worked"><h4>Worked example</h4>
    A four-stage funnel that passes 70% at each step (leak = 0.30) has an end-to-end yield of <code>0.7⁴ ≈ 0.24</code> — under a quarter survive, from a "small" 30% loss per stage. In the <b>HIV care cascade</b>, if 85% are diagnosed, 80% of those linked to care, 75% retained, and 90% virally suppressed, only <code>0.85 × 0.80 × 0.75 × 0.90 ≈ 46%</code> reach the goal — which is why interventions target the <i>weakest</i> step, not overall volume.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Gardner, E. M., McLees, M. P., Steiner, J. F., del Rio, C. &amp; Burman, W. J. (2011). "The spectrum of engagement in HIV care and its relevance to test-and-treat strategies." <i>Clinical Infectious Diseases</i> 52(6): 793–800 — the care cascade.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i> — yield, scrap and coflow structures.</li>
      <li>Hines, J. <i>Molecules of Structure</i> — Broken Cascade / Split Flow.</li>
    </ul>`,
  },

  // ============================ DELAYS & DECAYS ============================
  decay: {
    name: "Decay",
    title: "Decay (Exponential)",
    timeUnit: "yr",
    unitY: "units",
    lede: "Outflow proportional to the stock itself — the first closed loop. The stock falls fast when full, slowly when nearly empty: exponential decline.",
    stocks: [{ id: "q", label: "Stock", init: 100, scale: 110, color: C.acc }],
    params: [{ id: "tau", label: "Decay time τ", min: 1, max: 20, step: 0.5, value: 5, unit: "yr" }],
    rates: (s, p) => ({ out: s.q / p.tau }),
    derivs: (_s, _p, r) => ({ q: -r.out }),
    diagram: {
      stocks: { q: { x: 300, y: 90, w: 130, h: 120 } },
      flows: [{ id: "out", pts: [[430, 150], [785, 150]], from: "q", max: 25 }],
    },
    cld: {
      vars: [
        { id: "q", label: "Stock", x: 175, y: 135 },
        { id: "o", label: "Outflow", x: 370, y: 135 },
      ],
      links: [
        { from: "q", to: "o", sign: "+", curve: -34 },
        { from: "o", to: "q", sign: "−", curve: 34 },
      ],
      loops: [{ type: "B", label: "B1", x: 272, y: 135 }],
      caption:
        '<span class="chip chipB">B1</span> The single <b>balancing loop</b> that defines first-order feedback: more in the stock → larger outflow (+) → which drains the stock (−). The bigger the stock, the harder it drains, so the stock approaches zero exponentially — never by a straight line.',
    },
    desc: `<p>The outflow is no longer set from outside — it is <b>proportional to the stock</b>: <code>outflow = Stock / τ</code>. That single dependency closes a balancing loop, the simplest feedback in system dynamics. A full stock drains quickly; as it empties the outflow shrinks, so the decline tapers off and approaches zero asymptotically.</p>
    <div class="eq">dStock/dt = − Stock / τ&nbsp;&nbsp;⇒&nbsp;&nbsp;Stock(t) = Stock₀ · e^(−t/τ)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use decay whenever a quantity <b>disappears at a rate set by how much is present</b> and there is no replenishment driving it — radioactive material, a drug clearing the body, a cohort leaving at a constant <i>per-capita</i> rate, the run-off of an unmaintained balance. If the outflow is a fixed amount instead of a fraction of the stock, you want a plain Bathtub, not decay.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — drug elimination (pharmacokinetics): plasma concentration falls exponentially with clearance half-life; antibody titres waning after vaccination.</li>
      <li><b>Sustainability</b> — pollutant breakdown in soil/water; radioactive decay of waste; capital/infrastructure depreciation.</li>
      <li><b>Business</b> — customer base with constant churn and no new sign-ups; forgetting/obsolescence of stored knowledge.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    A drug with elimination time τ = 5 h starts at 100 mg. After 5 h it is <code>100·e⁻¹ ≈ 36.8 mg</code> (63% gone); after 10 h, <code>13.5 mg</code>. The <b>half-life</b> is <code>t½ = τ·ln2 = 5 × 0.693 ≈ 3.5 h</code> — the time to fall by half, constant at every level. That constancy is the signature of first-order decay.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 11 "Delays" — first-order material delays and exponential decay.</li>
      <li>Forrester, J. W. (1961). <i>Industrial Dynamics</i>. MIT Press — first-order negative feedback.</li>
      <li>Meadows, D. H. (2008). <i>Thinking in Systems</i> — balancing (stabilizing) feedback loops.</li>
    </ul>`,
  },

  residence: {
    name: "Residence Time",
    title: "Residence Time",
    timeUnit: "mo",
    unitY: "units",
    lede: "A stock fed by a steady inflow and drained in proportion to itself settles where inflow balances outflow — and the average time a unit stays is τ.",
    stocks: [{ id: "q", label: "In service", init: 0, scale: 60, color: C.acc }],
    params: [
      { id: "inflow", label: "Inflow", min: 0, max: 20, step: 0.5, value: 8, unit: "/mo" },
      { id: "tau", label: "Avg residence τ", min: 1, max: 12, step: 0.5, value: 5, unit: "mo" },
    ],
    rates: (s, p) => ({ in: p.inflow, out: s.q / p.tau }),
    derivs: (_s, _p, r) => ({ q: r.in - r.out }),
    diagram: {
      stocks: { q: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [
        { id: "in", pts: [[40, 150], [330, 150]], to: "q", max: 20 },
        { id: "out", pts: [[460, 150], [785, 150]], from: "q", max: 20 },
      ],
    },
    cld: {
      vars: [
        { id: "in", label: "Inflow", x: 110, y: 70 },
        { id: "q", label: "Stock", x: 240, y: 160 },
        { id: "o", label: "Outflow", x: 410, y: 160 },
      ],
      links: [
        { from: "in", to: "q", sign: "+", curve: -22 },
        { from: "q", to: "o", sign: "+", curve: -46 },
        { from: "o", to: "q", sign: "−", curve: -46 },
      ],
      loops: [{ type: "B", label: "B1", x: 325, y: 160 }],
      caption:
        '<span class="chip chipB">B1</span> Same balancing drain as Decay, now fed by a constant inflow. The loop pulls the stock toward the level where <b>outflow = inflow</b>; at that equilibrium the average time a unit spends inside equals <b>τ = Stock / outflow</b>.',
    },
    desc: `<p>Combine a steady inflow with a proportional outflow (<code>out = Stock/τ</code>) and the balancing loop drives the stock to <b>equilibrium where outflow equals inflow</b>. There the stock holds at <code>inflow × τ</code>, and τ is exactly the <b>average residence time</b> — how long a typical unit stays before leaving. This is the dynamic form of Little's Law.</p>
    <div class="eq">Equilibrium Stock = Inflow × τ&nbsp;&nbsp;⇔&nbsp;&nbsp;τ = Stock / Outflow (residence time)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use this view whenever you need to reason about <b>how long things stay</b>, not just how many there are — occupancy, dwell time, length of stay, time-in-system. It converts between a stock you can count and a duration you care about: measure any two of {stock, throughput, residence time} and the third follows.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — hospital length of stay: beds occupied = admissions/day × average stay; ED crowding.</li>
      <li><b>Sustainability</b> — atmospheric residence time of CO₂ or methane; water residence time in a lake or reservoir.</li>
      <li><b>Operations</b> — work-in-process and cycle time on a production line; average tenure of staff.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    A ward admits 8 patients/month and the average stay is τ = 5 months, so at equilibrium it holds <code>8 × 5 = 40</code> patients. Cut the stay to 4 months and occupancy falls to 32 — without changing admissions at all. Conversely, observing 40 occupied beds with 8 admits/month <i>implies</i> a 5-month average stay (<code>τ = 40 / 8</code>).</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Little, J. D. C. (1961). "A proof for the queuing formula: L = λW." <i>Operations Research</i> 9(3): 383–387.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 11 — residence time and the link between stocks, flows and delays.</li>
      <li>Hines, J. <i>Molecules of Structure</i> — Residence Time.</li>
    </ul>`,
  },

  material: {
    name: "Material Delay",
    title: "Material Delay (3rd order)",
    timeUnit: "wk",
    unitY: "units",
    lede: "A physical thing genuinely takes time to traverse — mail, shipping, a pipeline. Output is a delayed, conservation-respecting echo of the input.",
    stocks: [
      { id: "l1", label: "In transit ①", init: 0, scale: 40, color: C.acc },
      { id: "l2", label: "In transit ②", init: 0, scale: 40, color: C.acc2 },
      { id: "l3", label: "In transit ③", init: 0, scale: 40, color: C.good },
    ],
    params: [
      { id: "inflow", label: "Inflow", min: 0, max: 16, step: 0.5, value: 8, unit: "/wk" },
      { id: "delay", label: "Transit delay", min: 2, max: 18, step: 0.5, value: 9, unit: "wk" },
    ],
    rates: (s, p) => {
      const st = p.delay / 3;
      return { in: p.inflow, f1: s.l1 / st, f2: s.l2 / st, out: s.l3 / st };
    },
    derivs: (_s, _p, r) => ({ l1: r.in - r.f1, l2: r.f1 - r.f2, l3: r.f2 - r.out }),
    diagram: {
      stocks: {
        l1: { x: 110, y: 95, w: 95, h: 100 },
        l2: { x: 355, y: 95, w: 95, h: 100 },
        l3: { x: 600, y: 95, w: 95, h: 100 },
      },
      flows: [
        { id: "in", pts: [[20, 145], [110, 145]], to: "l1", max: 16 },
        { id: "f1", pts: [[205, 145], [355, 145]], from: "l1", to: "l2", max: 16 },
        { id: "f2", pts: [[450, 145], [600, 145]], from: "l2", to: "l3", max: 16 },
        { id: "out", pts: [[695, 145], [800, 145]], from: "l3", max: 16 },
      ],
    },
    cld: {
      vars: [
        { id: "s1", label: "Transit ①", x: 120, y: 135 },
        { id: "s2", label: "Transit ②", x: 280, y: 135 },
        { id: "s3", label: "Transit ③", x: 440, y: 135 },
      ],
      links: [
        { from: "s1", to: "s2", sign: "+", curve: -22 },
        { from: "s2", to: "s3", sign: "+", curve: -22 },
        { from: "s1", to: "s1", sign: "−", self: true },
        { from: "s2", to: "s2", sign: "−", self: true },
        { from: "s3", to: "s3", sign: "−", self: true },
      ],
      loops: [
        { type: "B", label: "B1", x: 120, y: 60 },
        { type: "B", label: "B2", x: 280, y: 60 },
        { type: "B", label: "B3", x: 440, y: 60 },
      ],
      caption:
        '<span class="chip chipB">B×3</span> A material delay <i>is</i> a cascade — three balancing stages, total delay = sum of stage times. What this molecule names is the <b>input→output timing</b>: nothing is lost (conservation), but the output is shifted later in time and smeared into an S-shaped (Erlang) response.',
    },
    desc: `<p>Material that must physically move takes time and is "in transit" the whole way. Modelled as a third-order delay (three stocks, each with average time <code>delay/3</code>), a steady inflow produces a matching outflow only <b>after</b> the pipe fills, and a one-off pulse comes out later and spread over time. Crucially, material is <b>conserved</b> — everything that goes in eventually comes out.</p>
    <div class="eq">Output ≈ Input(t − delay)&nbsp;&nbsp;|&nbsp;&nbsp;In-transit stock = Inflow × delay (Little's Law)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use a material delay for anything <b>physically en route</b> where you must track what is in the pipe: shipments, mail, a supply line, construction, a queue that cannot be skipped. Use a <i>material</i> delay (not an information delay/Smooth) when the thing delayed is conserved stuff. Higher order ⇒ a sharper, more "pipeline-like" arrival; first order ⇒ the most spread-out, leaky-tank response.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — vaccine cold-chain shipping from plant to clinic; lab specimens in transit to a central facility.</li>
      <li><b>Sustainability</b> — pollutant transport through a river system; CO₂ moving between ocean mixing layers.</li>
      <li><b>Supply chain</b> — goods in shipping (the delay that drives the Beer Game "bullwhip"); orders in the postal/logistics pipeline.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Goods ship at 8 units/week with a 9-week transit. Once the pipe is full, output is also 8/week — but a step up in shipments is not felt at the destination for ~9 weeks. The <b>in-transit inventory</b> is <code>8 × 9 = 72</code> units (throughput × delay). Underestimating this pipeline is the classic cause of over-ordering and the bullwhip effect.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 11 "Delays" (material vs. information) and ch. 17–18 (the Beer Distribution Game).</li>
      <li>Forrester, J. W. (1961). <i>Industrial Dynamics</i>. MIT Press — DELAY functions.</li>
      <li>Hines, J. <i>Molecules of Structure</i> — Material Delay.</li>
    </ul>`,
  },

  aging: {
    name: "Aging Chain",
    title: "Aging Chain",
    timeUnit: "yr",
    unitY: "people",
    lede: "A cascade through age or maturity classes — cohorts ageing into the next bracket while some leave. The structure behind every population pyramid.",
    stocks: [
      { id: "young", label: "Youth (0–18)", init: 300, scale: 600, color: C.acc },
      { id: "adult", label: "Working (18–65)", init: 800, scale: 1200, color: C.acc2 },
      { id: "old", label: "Elderly (65+)", init: 200, scale: 400, color: C.good },
    ],
    params: [
      { id: "births", label: "Births", min: 0, max: 40, step: 1, value: 20, unit: "/yr" },
      { id: "tY", label: "Youth duration", min: 5, max: 25, step: 1, value: 18, unit: "yr" },
      { id: "tA", label: "Adult duration", min: 20, max: 50, step: 1, value: 45, unit: "yr" },
      { id: "tO", label: "Elder lifespan", min: 5, max: 30, step: 1, value: 15, unit: "yr" },
    ],
    rates: (s, p) => ({ in: p.births, aYA: s.young / p.tY, aAO: s.adult / p.tA, deaths: s.old / p.tO }),
    derivs: (_s, _p, r) => ({ young: r.in - r.aYA, adult: r.aYA - r.aAO, old: r.aAO - r.deaths }),
    diagram: {
      stocks: {
        young: { x: 110, y: 95, w: 95, h: 100 },
        adult: { x: 355, y: 95, w: 95, h: 100 },
        old: { x: 600, y: 95, w: 95, h: 100 },
      },
      flows: [
        { id: "in", pts: [[20, 145], [110, 145]], to: "young", max: 40 },
        { id: "aYA", pts: [[205, 145], [355, 145]], from: "young", to: "adult", max: 40 },
        { id: "aAO", pts: [[450, 145], [600, 145]], from: "adult", to: "old", max: 40 },
        { id: "deaths", pts: [[695, 145], [800, 145]], from: "old", max: 40, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "y", label: "Youth", x: 120, y: 135 },
        { id: "a", label: "Working", x: 280, y: 135 },
        { id: "o", label: "Elderly", x: 440, y: 135 },
      ],
      links: [
        { from: "y", to: "a", sign: "+", curve: -22 },
        { from: "a", to: "o", sign: "+", curve: -22 },
        { from: "y", to: "y", sign: "−", self: true },
        { from: "a", to: "a", sign: "−", self: true },
        { from: "o", to: "o", sign: "−", self: true },
      ],
      loops: [
        { type: "B", label: "B1", x: 120, y: 60 },
        { type: "B", label: "B2", x: 280, y: 60 },
        { type: "B", label: "B3", x: 440, y: 60 },
      ],
      caption:
        '<span class="chip chipB">B×3</span> A chain whose stages are <b>age brackets</b>. Each cohort drains by ageing into the next (and the last by death). The equilibrium size of each stock is <code>flow-in × bracket-duration</code>, so the durations set the shape of the population pyramid — and a birth surge echoes up the chain for decades.',
    },
    desc: `<p>An aging chain is a cascade where the stages are <b>classes of age or maturity</b> and the "flow" between them is ageing. Each bracket holds, at equilibrium, <code>throughput × bracket duration</code> — so longer-lived brackets are larger. A change in births or longevity propagates slowly up the chain, which is why demographic momentum lasts generations.</p>
    <div class="eq">Cohort size (equilibrium) = Flow-in × bracket duration</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use an aging chain when <b>position in a sequence of classes matters and entities can only move forward</b> — age groups, equipment vintages, tenure bands, disease stages. Reach for it (rather than a plain chain) when you specifically care about the <b>distribution across classes</b> and the long echo of a one-time change.
    <br><br><b>Aging chain "with PDY":</b> attach a <i>coflow</i> of an attribute — productivity, skill, capital value — that rides along with each cohort, so you track not just <i>how many</i> are in each class but <i>how productive/valuable</i> they are (e.g. experience rising with tenure, machines losing efficiency with age).</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare / demography</b> — population by age cohort; disease progression stages; a screening programme's age bands.</li>
      <li><b>Sustainability</b> — building or vehicle stock by vintage (drives retrofit and emissions planning); forest stands by age class.</li>
      <li><b>Business</b> — workforce by tenure (with an experience coflow); installed equipment by vintage and depreciation.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    With 20 births/yr, youth lasting 18 yr, working life 45 yr and 15 yr in the elder bracket, equilibrium cohorts are <code>20×18 = 360</code> youth, <code>20×45 = 900</code> working, <code>20×15 = 300</code> elderly. Drop births to 10/yr and every bracket eventually halves — but the elderly bracket keeps growing for decades first, because today's elderly were born under the old, higher birth rate. That lag is <b>demographic momentum</b>.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 12 "Coflows and Aging Chains".</li>
      <li>Meadows, D. H. (2008). <i>Thinking in Systems</i> — population age-structure and momentum.</li>
      <li>Hines, J. <i>Molecules of Structure</i> — Aging Chain / Aging Chain with PDY.</li>
    </ul>`,
  },

  smooth: {
    name: "Smooth",
    title: "Smooth (Information Delay)",
    timeUnit: "wk",
    unitY: "level",
    lede: "Exponential averaging of a noisy or shifting signal — perception lags reality. First-order chases smoothly; higher-order responds in an S-shape.",
    stocks: [
      { id: "input", label: "Input signal", init: 30, scale: 100, color: "#8b98a9" },
      { id: "s1", label: "1st-order smooth", init: 30, scale: 100, color: C.acc },
      { id: "m1", label: "", init: 30, scale: 100, color: C.acc2, hidden: true },
      { id: "m2", label: "", init: 30, scale: 100, color: C.acc2, hidden: true },
      { id: "s3", label: "3rd-order smooth", init: 30, scale: 100, color: C.good },
    ],
    params: [
      { id: "target", label: "Input level", min: 0, max: 100, step: 1, value: 70, unit: "" },
      { id: "tau", label: "Smoothing time τ", min: 1, max: 20, step: 0.5, value: 6, unit: "wk" },
    ],
    rates: (s, p) => ({
      adj1: Math.abs(s.input - s.s1) / p.tau,
      adj3: Math.abs(s.m2 - s.s3) / (p.tau / 3),
    }),
    // input snaps to the target (one DT) so it reads as a step the smooths then chase.
    derivs: (s, p) => {
      const st = p.tau / 3;
      return {
        input: (p.target - s.input) / 0.1,
        s1: (s.input - s.s1) / p.tau,
        m1: (s.input - s.m1) / st,
        m2: (s.m1 - s.m2) / st,
        s3: (s.m2 - s.s3) / st,
      };
    },
    diagram: {
      stocks: {
        input: { x: 110, y: 95, w: 120, h: 110 },
        s1: { x: 470, y: 35, w: 160, h: 90 },
        s3: { x: 470, y: 175, w: 160, h: 90 },
      },
      flows: [
        { id: "adj1", pts: [[230, 150], [360, 150], [360, 80], [470, 80]], from: "input", to: "s1", max: 12 },
        { id: "adj3", pts: [[230, 150], [360, 150], [360, 220], [470, 220]], from: "input", to: "s3", max: 12, color: C.good },
      ],
    },
    cld: {
      vars: [
        { id: "in", label: "Input", x: 260, y: 60 },
        { id: "p1", label: "1st-order", x: 130, y: 175 },
        { id: "p3", label: "3rd-order", x: 390, y: 175 },
      ],
      links: [
        { from: "in", to: "p1", sign: "+", curve: 26, note: "gap" },
        { from: "in", to: "p3", sign: "+", curve: -26, note: "gap" },
        { from: "p1", to: "p1", sign: "−", self: true },
        { from: "p3", to: "p3", sign: "−", self: true },
      ],
      loops: [
        { type: "B", label: "B1", x: 130, y: 245 },
        { type: "B", label: "B3", x: 390, y: 245 },
      ],
      caption:
        '<span class="chip chipB">B</span> A smooth is a <b>balancing loop closing the gap</b> to the input: change = (input − perceived)/τ. One stage gives a smooth exponential chase (1st-order); chaining three gives an <b>S-shaped</b> response that is initially flat, then accelerates — a more realistic model of perception, belief, and expectation forming.',
    },
    desc: `<p>A smooth (a.k.a. exponential smoothing or an <b>information delay</b>) tracks a signal but lags it: the perceived value adjusts toward the input by a fraction <code>1/τ</code> each period. Unlike a material delay, <b>nothing is conserved</b> — this is belief catching up to reality, not stuff moving. A <b>first-order</b> smooth chases immediately but never overshoots; a <b>higher-order</b> smooth (a cascade of smooths) starts sluggishly and ramps up in an S-curve, which better matches how perceptions actually form.</p>
    <div class="eq">d(Perceived)/dt = ( Input − Perceived ) / τ&nbsp;&nbsp;⇒&nbsp;&nbsp;step response 1 − e^(−t/τ)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use a smooth for any <b>expected, perceived, reported, or averaged</b> quantity that lags the true value — expected demand, perceived quality, a moving average, sensor or reporting lag, reputation. Use an <i>information</i> delay (Smooth), not a material delay, when the thing delayed is a signal you can copy freely (no conservation). Pick higher order when the real response is clearly S-shaped rather than an instant exponential chase.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — perceived risk of an outbreak lagging real case counts (drives delayed behaviour change); a 7-day average of reported cases.</li>
      <li><b>Sustainability</b> — public concern about climate tracking, with delay, the underlying signal; smoothed air-quality indices.</li>
      <li><b>Business</b> — demand forecasts as smoothed sales; perceived product quality adjusting slowly to actual quality.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    With τ = 6 weeks, after the input steps up the <b>first-order</b> smooth closes 63% of the gap in 6 wk, 86% in 12 wk, 95% in 18 wk (1 − e^(−t/τ)). The <b>third-order</b> smooth (three τ/3 = 2-wk stages) reaches the same final value but starts almost flat, then accelerates through the middle — an S-curve. Move the <b>Input level</b> slider mid-run and watch reality jump while perception eases over.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 11 "Delays" — information delays, first- vs. higher-order smoothing.</li>
      <li>Forrester, J. W. (1961). <i>Industrial Dynamics</i>. MIT Press — the SMOOTH function.</li>
      <li>Hines, J. <i>Molecules of Structure</i> — Smooth (first order) / Smooth (higher order).</li>
    </ul>`,
  },

  // ======================= GOAL-SEEKING & CONTROL =======================
  closegap: {
    name: "Close Gap",
    title: "Close Gap (Goal-Seeking)",
    timeUnit: "wk",
    unitY: "level",
    lede: "The control reflex of every managed system: move a stock toward a goal at a rate set by the gap and an adjustment time.",
    stocks: [{ id: "actual", label: "Actual", init: 20, scale: 100, color: C.acc }],
    params: [
      { id: "goal", label: "Goal", min: 0, max: 100, step: 1, value: 60, unit: "" },
      { id: "at", label: "Adjustment time", min: 1, max: 20, step: 0.5, value: 5, unit: "wk" },
    ],
    rates: (s, p) => ({ adj: Math.max(0, (p.goal - s.actual) / p.at) }),
    derivs: (s, p) => ({ actual: (p.goal - s.actual) / p.at }),
    diagram: {
      stocks: { actual: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [{ id: "adj", pts: [[40, 150], [330, 150]], to: "actual", max: 16 }],
    },
    cld: {
      vars: [
        { id: "g", label: "Goal", x: 110, y: 65 },
        { id: "a", label: "Actual", x: 130, y: 185 },
        { id: "adj", label: "Adjustment", x: 390, y: 125 },
      ],
      links: [
        { from: "g", to: "adj", sign: "+", curve: -20 },
        { from: "a", to: "adj", sign: "−", curve: 46 },
        { from: "adj", to: "a", sign: "+", curve: 46 },
      ],
      loops: [{ type: "B", label: "B1", x: 262, y: 155 }],
      caption:
        '<span class="chip chipB">B1</span> A <b>balancing loop</b> to a target: the gap (Goal − Actual) drives an adjustment that raises Actual, which shrinks the gap. The bigger the gap, the faster the move; as Actual nears Goal the correction fades — exponential approach with no overshoot (first order).',
    },
    desc: `<p>Goal-seeking is the most common managerial structure: a flow set to <b>close the gap</b> between where a stock is and where you want it. The adjustment time sets how aggressively — short = fast and twitchy, long = slow and smooth. (Structurally this is the same first-order loop as Decay and Smooth, but here the target is an explicit, possibly moving, goal rather than zero or a signal.)</p>
    <div class="eq">flow = ( Goal − Actual ) / adjustment time&nbsp;&nbsp;⇒&nbsp;&nbsp;Actual → Goal exponentially</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use Close Gap for any <b>deliberately controlled</b> quantity steered toward a target — a thermostat, hiring to a headcount plan, restocking to a target inventory, a central bank moving rates toward a goal. The moment a real <b>delay</b> sits between the decision and its effect, this loop starts to <b>overshoot and oscillate</b> — which is exactly the Stock Management molecule next door.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — staffing a unit up to a safe nurse-to-patient ratio; titrating a drug dose toward a target level.</li>
      <li><b>Sustainability</b> — adjusting harvest/withdrawal toward a sustainable target; a building's thermostat.</li>
      <li><b>Business</b> — adjusting capacity, price, or headcount toward a desired level.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Actual = 20, Goal = 60, adjustment time = 5 wk. The first week's correction is <code>(60−20)/5 = 8</code>/wk; as the gap shrinks the correction shrinks. After one adjustment time (5 wk) about <b>63%</b> of the gap is closed (Actual ≈ 45), after 3× ≈ 95% (Actual ≈ 58). Shorten the adjustment time and it snaps to the goal faster.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 8 — closing loops and goal-seeking behavior.</li>
      <li>Forrester, J. W. (1961). <i>Industrial Dynamics</i>. MIT Press.</li>
      <li>Hines, J. <i>Molecules of Structure</i> — Close Gap / First-Order Stock Adjustment.</li>
    </ul>`,
  },

  stockmgmt: {
    name: "Stock Management",
    title: "Stock Management (with Supply Line)",
    timeUnit: "wk",
    unitY: "units",
    lede: "Ordering to refill a stock through an acquisition delay. Ignore what's already on order and you over-order — the root of oscillation and the bullwhip.",
    stocks: [
      { id: "sl", label: "Supply line", init: 60, scale: 160, color: C.acc2 },
      { id: "inv", label: "Inventory", init: 60, scale: 200, color: C.acc },
    ],
    params: [
      { id: "demand", label: "Demand", min: 2, max: 20, step: 0.5, value: 10, unit: "/wk" },
      { id: "desInv", label: "Desired inventory", min: 40, max: 200, step: 5, value: 100, unit: "" },
      { id: "adj", label: "Inventory adj time", min: 1, max: 12, step: 0.5, value: 4, unit: "wk" },
      { id: "acq", label: "Acquisition delay", min: 1, max: 12, step: 0.5, value: 6, unit: "wk" },
      { id: "slw", label: "Supply-line weight", min: 0, max: 1, step: 0.05, value: 1, unit: "" },
    ],
    rates: (s, p) => {
      const acquisition = s.sl / p.acq;
      const desiredSL = p.demand * p.acq;
      const orders = Math.max(0, p.demand + (p.desInv - s.inv) / p.adj + (desiredSL - p.slw * s.sl) / p.adj);
      return { orders, acquisition, sales: p.demand };
    },
    derivs: (_s, _p, r) => ({ sl: r.orders - r.acquisition, inv: r.acquisition - r.sales }),
    diagram: {
      stocks: { sl: { x: 230, y: 95, w: 130, h: 110 }, inv: { x: 520, y: 95, w: 130, h: 110 } },
      flows: [
        { id: "orders", pts: [[40, 150], [230, 150]], to: "sl", max: 28 },
        { id: "acquisition", pts: [[360, 150], [520, 150]], from: "sl", to: "inv", max: 28 },
        { id: "sales", pts: [[650, 150], [790, 150]], from: "inv", max: 28, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "ord", label: "Orders", x: 130, y: 55 },
        { id: "inv", label: "Inventory", x: 390, y: 55 },
        { id: "sl", label: "Supply line", x: 130, y: 185 },
        { id: "acq", label: "Acquisition", x: 390, y: 185 },
      ],
      links: [
        { from: "inv", to: "ord", sign: "−", curve: -22 },
        { from: "ord", to: "sl", sign: "+", curve: -46 },
        { from: "sl", to: "acq", sign: "+", curve: 46 },
        { from: "acq", to: "inv", sign: "+", curve: 22 },
        { from: "acq", to: "sl", sign: "−", curve: 46 },
        { from: "sl", to: "ord", sign: "−", curve: -46 },
      ],
      loops: [{ type: "B", label: "B1", x: 260, y: 112 }, { type: "B", label: "B2", x: 260, y: 185 }, { type: "B", label: "B3", x: 130, y: 120 }],
      caption:
        '<span class="chip chipB">B1</span> inventory control + <span class="chip chipB">B2</span> supply-line control, and <span class="chip chipB">B3</span> the supply line draining as orders arrive. Low inventory → more orders → more on order → more arrivals → inventory recovers. The second loop matters: if managers under-weight the <b>supply line</b> (orders already placed), they keep ordering for stock that is already coming → overshoot and oscillation.',
    },
    desc: `<p>You refill an inventory by placing orders that arrive only after an <b>acquisition delay</b>. Good control needs two corrections: one for the inventory gap, and one for the <b>supply line</b> (orders in the pipeline). The classic error — and the engine of the Beer Game bullwhip — is to discount the supply line: you keep ordering for stock that is already on its way, overshoot, then have to dump the excess.</p>
    <div class="eq">orders = demand + (desired inv − inventory)/τ + (desired SL − w·supply line)/τ</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use this whenever there is a <b>delay between deciding and receiving</b> and you manage a buffer against demand — purchasing, hiring (with a recruiting/training pipeline), capacity expansion, cash management. Set <b>supply-line weight</b> below 1 to reproduce the instability: the lower the weight and the longer the acquisition delay, the bigger the overshoot and the longer the oscillation.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — ordering PPE / vaccines with a long lead time; panic-buying and gluts during COVID-19.</li>
      <li><b>Sustainability</b> — commissioning power capacity or housing with multi-year build delays (boom–bust cycles).</li>
      <li><b>Supply chain</b> — the Beer Distribution Game; semiconductor and commodity cycles.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Demand 10/wk, acquisition delay 6 wk ⇒ the pipeline should hold <code>10 × 6 = 60</code> units (desired supply line). Start inventory at 60, below the desired 100. With supply-line weight = 1 the system glides to inventory 100, orders settle at 10/wk. Set the weight to 0 and the same shortfall produces repeated <b>over-ordering, overshoot, and damped oscillation</b> — try it.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 17–19 — the stock-management structure and the Beer Distribution Game.</li>
      <li>Sterman, J. D. (1989). "Modeling managerial behavior: misperceptions of feedback in a dynamic decision making experiment." <i>Management Science</i> 35(3): 321–339.</li>
      <li>Hines, J. <i>Molecules of Structure</i> — Stock Adjustment / Pipeline Correction.</li>
    </ul>`,
  },

  // ============================ EXPECTATIONS ============================
  trend: {
    name: "Trend",
    title: "Trend & Extrapolation",
    timeUnit: "mo",
    unitY: "level",
    lede: "Perception lags a moving signal, and the gap between the two reveals its growth rate — which forecasters then extrapolate forward.",
    stocks: [
      { id: "input", label: "Actual", init: 100, scale: 400, color: C.acc },
      { id: "ppv", label: "Perceived", init: 100, scale: 400, color: C.acc2 },
    ],
    params: [
      { id: "g", label: "True growth", min: -5, max: 15, step: 0.5, value: 6, unit: "%/mo" },
      { id: "tp", label: "Perception time", min: 1, max: 12, step: 0.5, value: 4, unit: "mo" },
    ],
    rates: (s, p) => ({ grow: Math.max(0, s.input * (p.g / 100)), perceive: Math.abs(s.input - s.ppv) / p.tp }),
    derivs: (s, p) => ({ input: s.input * (p.g / 100), ppv: (s.input - s.ppv) / p.tp }),
    diagram: {
      stocks: { input: { x: 230, y: 95, w: 130, h: 110 }, ppv: { x: 520, y: 95, w: 130, h: 110 } },
      flows: [
        { id: "grow", pts: [[40, 150], [230, 150]], to: "input", max: 30 },
        { id: "perceive", pts: [[360, 150], [520, 150]], to: "ppv", max: 30, color: C.acc2 },
      ],
    },
    cld: {
      vars: [
        { id: "inp", label: "Actual", x: 130, y: 80 },
        { id: "per", label: "Perceived", x: 360, y: 80 },
        { id: "tr", label: "Perceived trend", x: 245, y: 195 },
      ],
      links: [
        { from: "inp", to: "per", sign: "+", curve: -22 },
        { from: "per", to: "per", sign: "−", self: true },
        { from: "inp", to: "tr", sign: "+", curve: 24 },
        { from: "per", to: "tr", sign: "−", curve: -24 },
      ],
      loops: [{ type: "B", label: "B1", x: 455, y: 45 }],
      caption:
        '<span class="chip chipB">B1</span> The perceived value chases the actual (a smooth). The <b>gap</b> between them is information: divide it by the perceived level and the perception time and you recover the signal\'s fractional <b>growth rate</b>, which a forecast extrapolates into the future.',
    },
    desc: `<p>To act on a changing variable you first have to perceive its <b>rate of change</b>. The Trend structure smooths the actual value into a perceived value; the persistent gap between them encodes the growth rate. Extrapolating that rate forward gives a forecast — useful, but note it <b>always lags</b> and, when the trend turns, it overshoots in the wrong direction.</p>
    <div class="eq">perceived trend = (Actual − Perceived) / (Perceived × perception time)&nbsp;·&nbsp; forecast = Actual × (1 + trend × horizon)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use Trend whenever decisions depend on a <b>growth rate or forecast</b> rather than a level — demand planning, capacity expansion, budgeting, investment. Its built-in lag is also a <i>warning</i> structure: trend-following amplifies cycles and turns late, which is why extrapolative expectations destabilize markets and supply chains.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — projecting outbreak case-growth to plan surge capacity (and over-/under-shooting at the turns).</li>
      <li><b>Sustainability</b> — extrapolating energy demand or emissions to size long-lived infrastructure.</li>
      <li><b>Business / finance</b> — sales forecasts from recent growth; momentum/trend-following in markets.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Actual grows 6%/month. After the perception settles, Perceived trails Actual by a roughly constant ratio, and the recovered trend reads ≈ 6%/month. A 3-month forecast is then <code>Actual × (1 + 0.06 × 3) ≈ Actual × 1.18</code>. Flip True growth negative mid-run: watch Perceived keep <i>rising</i> for a while before catching the downturn — the cost of the lag.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 16 — forecasts, the TREND function and extrapolative expectations.</li>
      <li>Hines, J. <i>Molecules of Structure</i> — Trend / Extrapolation.</li>
    </ul>`,
  },

  // ============================== COFLOWS ==============================
  coflow: {
    name: "Coflow",
    title: "Coflow (Attribute Tracking)",
    timeUnit: "yr",
    unitY: "yrs experience",
    lede: "An attribute — skill, quality, age, cost — rides along with material as it flows. Track the total and divide to get the average.",
    stocks: [
      { id: "people", label: "Headcount", init: 50, scale: 120, color: C.acc, chartHidden: true },
      { id: "totExp", label: "Total experience", init: 100, scale: 2000, color: C.acc2, chartHidden: true },
      { id: "avgExp", label: "Avg experience", init: 2, scale: 12, color: C.good },
    ],
    params: [
      { id: "hire", label: "Hiring", min: 0, max: 20, step: 0.5, value: 8, unit: "/yr" },
      { id: "tenure", label: "Avg tenure", min: 2, max: 20, step: 0.5, value: 6, unit: "yr" },
      { id: "hireExp", label: "Hire experience", min: 0, max: 8, step: 0.5, value: 0, unit: "yr" },
    ],
    rates: (s, p) => ({ hireFlow: p.hire, quitFlow: s.people / p.tenure }),
    // experience accrues at 1 yr/yr for everyone; leavers carry the average out.
    derivs: (s, p) => {
      const quit = s.people / p.tenure;
      const avg = s.totExp / Math.max(s.people, 1e-6);
      return {
        people: p.hire - quit,
        totExp: p.hire * p.hireExp + s.people * 1 - quit * avg,
        avgExp: (s.totExp / Math.max(s.people, 1e-6) - s.avgExp) / 0.1,
      };
    },
    diagram: {
      stocks: { people: { x: 150, y: 95, w: 120, h: 110 }, totExp: { x: 470, y: 95, w: 150, h: 110 } },
      flows: [
        { id: "hireFlow", pts: [[40, 150], [150, 150]], to: "people", max: 20 },
        { id: "quitFlow", pts: [[270, 150], [380, 150]], from: "people", max: 20, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "h", label: "Headcount", x: 130, y: 92 },
        { id: "e", label: "Total experience", x: 380, y: 92 },
        { id: "a", label: "Avg experience", x: 255, y: 195 },
      ],
      links: [
        { from: "h", to: "e", sign: "+", curve: -22 },
        { from: "e", to: "a", sign: "+", curve: -24 },
        { from: "h", to: "a", sign: "−", curve: 24 },
        { from: "h", to: "h", sign: "−", self: true },
        { from: "e", to: "e", sign: "−", self: true },
      ],
      loops: [{ type: "B", label: "B1", x: 70, y: 40 }, { type: "B", label: "B2", x: 320, y: 40 }],
      caption:
        'A <b>coflow</b> carries a conserved <i>extensive</i> total (total experience) alongside the main stock (headcount). The thing you care about is the <i>intensive</i> ratio — <b>average experience = total ÷ headcount</b>. Inflows add at the new-hire attribute; outflows leave at the current average. <span class="chip chipB">B1</span> Quits drain headcount in proportion to its size, and <span class="chip chipB">B2</span> each quitter takes the average experience away with them.',
    },
    desc: `<p>Often you care not just about <i>how many</i> but about an <b>attribute of the population</b>: average experience, average quality, average age, unit cost. A coflow tracks the conserved <b>total</b> of that attribute as material enters and leaves, and you divide by the headcount to read the <b>average</b>. New units enter at their own attribute value; departing units carry out the current average.</p>
    <div class="eq">Avg = Total attribute / Stock&nbsp;·&nbsp; d(Total)/dt = inflow·attr_in + accrual − outflow·Avg</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use a coflow whenever the <b>average property</b> of a stock drives behavior and that property changes as units flow in and out — rapid hiring dilutes average experience, ageing equipment lowers average reliability, new low-cost units cut average cost. Reach for it when "how good / how old / how costly on average" matters as much as "how many".</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — average clinical experience of nursing staff during rapid expansion (affects error rates and productivity).</li>
      <li><b>Sustainability</b> — average efficiency of a vehicle or building fleet as new, cleaner units replace old ones.</li>
      <li><b>Business</b> — average unit cost of inventory (FIFO/average costing); average skill of a growing workforce.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    50 staff hold 100 person-years of experience → average 2 yr. Everyone gains 1 yr/yr (+50/yr), hiring adds 8 rookies/yr at 0 yr, and leavers (≈8/yr at the 6-yr tenure) carry out the average. The average climbs toward the equilibrium set by tenure and accrual; <b>hire faster and the average falls</b> even though total experience keeps rising — the dilution effect that surprises growing teams.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 12 "Coflows and Aging Chains".</li>
      <li>Hines, J. <i>Molecules of Structure</i> — Coflow (Hines &amp; Traditional) / Coflow with Experience.</li>
    </ul>`,
  },

  // =========================== GROWTH & LIMITS ===========================
  growth: {
    name: "Population Growth",
    title: "Exponential Growth (Reinforcing Loop)",
    timeUnit: "yr",
    unitY: "population",
    lede: "The first reinforcing loop: more begets more. Births feed back to grow the very stock that produces them — accelerating, compounding growth.",
    stocks: [{ id: "pop", label: "Population", init: 100, scale: 1200, color: C.good }],
    params: [
      { id: "birth", label: "Birth rate", min: 0, max: 12, step: 0.5, value: 5, unit: "%/yr" },
      { id: "death", label: "Death rate", min: 0, max: 12, step: 0.5, value: 2, unit: "%/yr" },
    ],
    rates: (s, p) => ({ births: s.pop * (p.birth / 100), deaths: s.pop * (p.death / 100) }),
    derivs: (_s, _p, r) => ({ pop: r.births - r.deaths }),
    diagram: {
      stocks: { pop: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [
        { id: "births", pts: [[40, 150], [330, 150]], to: "pop", max: 80 },
        { id: "deaths", pts: [[460, 150], [785, 150]], from: "pop", max: 80, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "p", label: "Population", x: 255, y: 135 },
        { id: "b", label: "Births", x: 110, y: 60 },
        { id: "d", label: "Deaths", x: 410, y: 60 },
      ],
      links: [
        { from: "p", to: "b", sign: "+", curve: 46 },
        { from: "b", to: "p", sign: "+", curve: 46 },
        { from: "p", to: "d", sign: "+", curve: -46 },
        { from: "d", to: "p", sign: "−", curve: -46 },
      ],
      loops: [{ type: "R", label: "R1", x: 182, y: 98 }, { type: "B", label: "B1", x: 332, y: 98 }],
      caption:
        '<span class="chip chipR">R1</span> birth loop (reinforcing) + <span class="chip chipB">B1</span> death loop (balancing). More population → more births → more population: a <b>reinforcing loop</b> driving exponential growth whenever births outrun deaths. Both flows are proportional to the stock — the hallmark of pure compounding.',
    },
    desc: `<p>When a flow is <b>proportional to the stock that it feeds</b>, the loop reinforces itself and the stock grows exponentially — each addition enlarges the base that generates the next. Net fractional growth is birth rate minus death rate; while it is positive, growth <b>accelerates without limit</b> (until something eventually pushes back — see Constrained Growth).</p>
    <div class="eq">dPop/dt = (b − d)·Pop&nbsp;&nbsp;⇒&nbsp;&nbsp;Pop(t) = Pop₀·e^((b−d)t),&nbsp; doubling time ≈ 70 / (net % rate)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use a reinforcing loop for anything that <b>compounds</b> — populations, money at interest, viral spread, installed base with network effects, knowledge building on knowledge. It is the engine behind every "hockey-stick". Remember: pure exponential growth is always temporary in the real world; it is the part of the story <i>before</i> a limit bites.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — early-phase epidemic spread before susceptibles deplete; bacterial growth in culture.</li>
      <li><b>Sustainability</b> — population and resource-use growth (the driver behind <i>Limits to Growth</i>).</li>
      <li><b>Finance</b> — compound interest and reinvested returns; doubling via the rule of 70.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Birth 5%/yr, death 2%/yr → net 3%/yr. The population doubles roughly every <code>70 / 3 ≈ 23 years</code> and keeps doubling on that schedule: 100 → 200 → 400 → 800. Drop births below deaths (net negative) and the same structure runs in reverse — exponential <i>decline</i>.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 8 — reinforcing feedback and exponential growth.</li>
      <li>Meadows, D. H. (2008). <i>Thinking in Systems</i> — reinforcing loops and doubling time.</li>
      <li>Meadows, D. H. et al. (1972). <i>The Limits to Growth</i>. Universe Books.</li>
    </ul>`,
  },

  logistic: {
    name: "Constrained Growth",
    title: "Constrained Growth (Limits to Growth)",
    timeUnit: "yr",
    unitY: "population",
    lede: "A reinforcing loop meets a balancing one: growth that is exponential at first, then bends over and saturates at a carrying capacity — the S-curve.",
    stocks: [{ id: "pop", label: "Population", init: 10, scale: 240, color: C.acc }],
    params: [
      { id: "r", label: "Growth rate", min: 1, max: 40, step: 1, value: 18, unit: "%/yr" },
      { id: "K", label: "Carrying capacity", min: 50, max: 400, step: 10, value: 200, unit: "" },
    ],
    rates: (s, p) => {
      const frac = p.r / 100;
      return { births: s.pop * frac, crowding: s.pop * frac * (s.pop / p.K) };
    },
    derivs: (_s, _p, r) => ({ pop: r.births - r.crowding }),
    diagram: {
      stocks: { pop: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [
        { id: "births", pts: [[40, 150], [330, 150]], to: "pop", max: 40 },
        { id: "crowding", pts: [[460, 150], [785, 150]], from: "pop", max: 40, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "p", label: "Population", x: 255, y: 135 },
        { id: "b", label: "Net growth", x: 110, y: 60 },
        { id: "c", label: "Crowding", x: 410, y: 60 },
      ],
      links: [
        { from: "p", to: "b", sign: "+", curve: 46 },
        { from: "b", to: "p", sign: "+", curve: 46 },
        { from: "p", to: "c", sign: "+", curve: -46 },
        { from: "c", to: "p", sign: "−", curve: -46 },
      ],
      loops: [{ type: "R", label: "R1", x: 182, y: 98 }, { type: "B", label: "B1", x: 332, y: 98 }],
      caption:
        '<span class="chip chipR">R1</span> growth + <span class="chip chipB">B1</span> crowding. Early on the population is far below capacity, R1 dominates → near-exponential. As it approaches K the crowding term grows, B1 takes over, and growth halts at the <b>carrying capacity</b>. The <b>shift in loop dominance</b> is what bends the curve into an S.',
    },
    desc: `<p>No real quantity grows forever. Couple a reinforcing growth loop to a balancing loop that strengthens as the stock rises — competition for food, market, space — and you get <b>S-shaped (logistic) growth</b>: exponential while resources are ample, then bending over to level off at the carrying capacity <b>K</b>. This is the <i>Limits to Growth</i> archetype, the single most common pattern in real systems.</p>
    <div class="eq">dPop/dt = r·Pop·(1 − Pop/K)&nbsp;&nbsp;⇒&nbsp;&nbsp;S-curve, inflection at Pop = K/2</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use constrained growth whenever a reinforcing process runs into a <b>finite limit</b> — market saturation, a niche filling, a resource depleting, a network maturing. The key diagnostic question of the archetype: <i>what is the limit, and is it fixed or can it be moved?</i> Pushing harder on growth once near K does little; the leverage is in the constraint.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — epidemic case counts saturating as the susceptible pool is exhausted; bacterial growth to stationary phase.</li>
      <li><b>Sustainability</b> — a fishery or forest approaching its carrying capacity; population vs. food/land limits.</li>
      <li><b>Business</b> — product or platform adoption levelling off at market potential.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    r = 18%/yr, K = 200, starting at 10. Early growth is ≈ 18%/yr (doubling ~ every 4 yr), so 10 → 20 → 40 …; at Pop = 100 (= K/2) the growth rate is <b>fastest in absolute terms</b>, then it slows and asymptotes to <b>200</b>, never exceeding it. Raise K and the ceiling lifts; raise r and it reaches the same ceiling sooner.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Meadows, D. H. et al. (1972). <i>The Limits to Growth</i>. Universe Books — the archetype at global scale.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 9 "S-Shaped Growth, Saturation and Overshoot".</li>
      <li>Verhulst, P.-F. (1838). "Notice sur la loi que la population suit dans son accroissement." — the logistic equation.</li>
    </ul>`,
  },

  diffusion: {
    name: "Diffusion",
    title: "Diffusion (Bass / Contagion)",
    timeUnit: "wk",
    unitY: "people",
    lede: "Adoption spreads by two channels: a steady trickle of innovators, plus word-of-mouth where each adopter recruits more — an epidemic of ideas.",
    stocks: [
      { id: "pot", label: "Potential", init: 1000, scale: 1000, color: C.acc2 },
      { id: "adopt", label: "Adopters", init: 0, scale: 1000, color: C.good },
    ],
    params: [
      { id: "p", label: "Innovation p", min: 0, max: 5, step: 0.1, value: 1, unit: "%" },
      { id: "q", label: "Imitation q", min: 0, max: 40, step: 1, value: 18, unit: "%" },
    ],
    rates: (s, p) => {
      const N = s.pot + s.adopt;
      const adoption = (p.p / 100 + (p.q / 100) * (s.adopt / N)) * s.pot;
      return { adoption };
    },
    derivs: (_s, _p, r) => ({ pot: -r.adoption, adopt: r.adoption }),
    diagram: {
      stocks: { pot: { x: 230, y: 95, w: 130, h: 110 }, adopt: { x: 520, y: 95, w: 130, h: 110 } },
      flows: [{ id: "adoption", pts: [[360, 150], [520, 150]], from: "pot", to: "adopt", max: 80, color: C.good }],
    },
    cld: {
      vars: [
        { id: "pot", label: "Potential", x: 120, y: 90 },
        { id: "ad", label: "Adopters", x: 400, y: 90 },
        { id: "f", label: "Adoption", x: 260, y: 195 },
      ],
      links: [
        { from: "ad", to: "f", sign: "+", curve: -46 },
        { from: "f", to: "ad", sign: "+", curve: -46 },
        { from: "pot", to: "f", sign: "+", curve: 46 },
        { from: "f", to: "pot", sign: "−", curve: 46 },
      ],
      loops: [{ type: "R", label: "R1", x: 330, y: 142 }, { type: "B", label: "B1", x: 190, y: 142 }],
      caption:
        '<span class="chip chipR">R1</span> word-of-mouth (more adopters → more contacts → more adoption) + <span class="chip chipB">B1</span> market saturation (adoption depletes the potential pool). R1 dominates early for take-off; B1 wins as potential runs out — together an <b>S-shaped</b> adoption curve.',
    },
    desc: `<p>New products, behaviors and infections spread the same way. A small <b>innovation</b> term (external influence — ads, index cases) seeds adoption; then an <b>imitation</b> term (internal influence — word-of-mouth, contagion) takes over as each adopter recruits others. Growth accelerates until the pool of potential adopters runs dry, then saturates: the classic adoption S-curve.</p>
    <div class="eq">adoption = ( p + q · Adopters/N ) · Potential&nbsp;&nbsp;(N = Potential + Adopters)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use diffusion for anything spreading through a population by <b>contact or influence</b> — product adoption, epidemics, rumors, social norms, technology standards. Big <b>q</b> (strong word-of-mouth/contagion) gives explosive, late, sharp take-off; big <b>p</b> gives an earlier but gentler rise. It is the structural cousin of the epidemic models (SIR) and of logistic growth.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — spread of an infectious disease; uptake of a new treatment or vaccine among clinicians.</li>
      <li><b>Sustainability</b> — adoption of solar panels, EVs or heat pumps through peer effects and incentives.</li>
      <li><b>Business</b> — new-product adoption (Bass forecasting); viral apps and social platforms.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    1000 potential adopters, p = 1%, q = 18%. Week 1 is almost all innovation: <code>≈ 0.01 × 1000 = 10</code> adopters. Once a few hundred have adopted, the imitation term <code>q·A/N</code> dominates and adoption peaks near the middle of the market, then falls as Potential empties — Adopters → 1000, an S-curve. Raise q and the take-off comes later but far steeper.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Bass, F. M. (1969). "A new product growth for model consumer durables." <i>Management Science</i> 15(5): 215–227.</li>
      <li>Rogers, E. M. (2003). <i>Diffusion of Innovations</i> (5th ed.). Free Press.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 9–10 — diffusion and epidemic models.</li>
    </ul>`,
  },

  // ===================== CONSTRAINTS & NONLINEARITY =====================
  ceiling: {
    name: "Ceiling",
    title: "Ceiling (Capacity Constraint)",
    timeUnit: "wk",
    unitY: "units",
    lede: "A hard limit imposed with MIN(): a flow runs at its desired rate until headroom shrinks, then throttles so the stock approaches a cap without overshooting.",
    stocks: [{ id: "q", label: "Stock", init: 10, scale: 120, color: C.acc }],
    params: [
      { id: "base", label: "Desired inflow", min: 0, max: 30, step: 1, value: 14, unit: "/wk" },
      { id: "ceil", label: "Ceiling", min: 20, max: 120, step: 5, value: 100, unit: "" },
      { id: "at", label: "Approach time", min: 0.5, max: 8, step: 0.5, value: 2, unit: "wk" },
    ],
    rates: (s, p) => ({ in: Math.max(0, Math.min(p.base, (p.ceil - s.q) / p.at)) }),
    derivs: (_s, _p, r) => ({ q: r.in }),
    diagram: {
      stocks: { q: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [{ id: "in", pts: [[40, 150], [330, 150]], to: "q", max: 30 }],
    },
    cld: {
      vars: [
        { id: "c", label: "Ceiling", x: 110, y: 65 },
        { id: "q", label: "Stock", x: 130, y: 185 },
        { id: "f", label: "Inflow", x: 390, y: 125 },
      ],
      links: [
        { from: "c", to: "f", sign: "+", curve: -20 },
        { from: "q", to: "f", sign: "−", curve: 46 },
        { from: "f", to: "q", sign: "+", curve: 46 },
      ],
      loops: [{ type: "B", label: "B1", x: 262, y: 155 }],
      caption:
        '<span class="chip chipB">B1</span> A balancing loop that is <b>dormant then decisive</b>. While the stock is far below the ceiling the inflow runs flat-out at its desired rate (the loop is slack); as headroom <code>(ceiling − stock)</code> shrinks, MIN() switches the inflow to the throttled branch and the stock eases up to the cap.',
    },
    desc: `<p>Real flows hit hard limits — capacity, space, a budget, a physical maximum — usually expressed with <b>MIN()</b> (or MAX for a floor). Here the inflow is <code>MIN(desired, headroom/approach time)</code>: constant while there is plenty of room (a straight ramp), then bending down as the ceiling nears. The <b>kink</b> where MIN switches branches is the signature of a constraint.</p>
    <div class="eq">inflow = MIN( desired inflow, (ceiling − stock) / approach time )</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use a ceiling/floor whenever a rate is <b>capped by something that can bind</b> — you can't ship more than you have, fill past capacity, spend past a budget, or go below zero. Use the explicit MIN/MAX form (rather than smooth saturation) when the limit is genuinely <b>hard</b> and you want to see <i>when</i> it starts to bite. A <b>Floor</b> is the mirror image with MAX().</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — admissions capped by available beds or ventilators; throughput limited by theatre capacity.</li>
      <li><b>Sustainability</b> — a reservoir filling to its spillway; renewable output capped by installed capacity / grid limits.</li>
      <li><b>Operations</b> — production limited by plant capacity; shipments limited by on-hand inventory (a protected level).</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Desired inflow 14/wk, ceiling 100, approach time 2 wk. While headroom exceeds <code>14 × 2 = 28</code> the stock climbs a straight line at 14/wk. Once the stock passes 72 (headroom &lt; 28) MIN flips to the throttled branch and the inflow tapers, easing the stock up to <b>100</b> without overshoot. Shorten the approach time and the corner gets sharper — closer to a hard clip.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 13–14 — nonlinear functions, MIN/MAX and capacity constraints.</li>
      <li>Hines, J. <i>Molecules of Structure</i> — Ceiling / Floor / Capacity Utilization / Level Protected by Flow.</li>
    </ul>`,
  },

  // ==================== ALLOCATION & COMPETITION ====================
  marketshare: {
    name: "Market Share",
    title: "Market Share (Success to the Successful)",
    timeUnit: "mo",
    unitY: "customers",
    lede: "Demand is split by relative attractiveness — and when attractiveness grows with size, the bigger player pulls ahead until it locks in the market.",
    stocks: [
      { id: "a", label: "Product A", init: 105, scale: 400, color: C.acc },
      { id: "b", label: "Product B", init: 95, scale: 400, color: C.pink },
    ],
    params: [
      { id: "inflow", label: "New customers", min: 5, max: 40, step: 1, value: 20, unit: "/mo" },
      { id: "network", label: "Network effect", min: 0, max: 1, step: 0.05, value: 0.7, unit: "" },
      { id: "churn", label: "Churn time", min: 4, max: 36, step: 1, value: 18, unit: "mo" },
    ],
    rates: (s, p) => {
      // attractiveness ∝ base^φ; φ>1 (network effect) makes the bigger base win superlinearly → lock-in.
      const phi = 1 + 2 * p.network;
      const wa = Math.pow(s.a, phi);
      const wb = Math.pow(s.b, phi);
      const shareA = wa / (wa + wb + 1e-9);
      return { toA: p.inflow * shareA, toB: p.inflow * (1 - shareA), outA: s.a / p.churn, outB: s.b / p.churn };
    },
    derivs: (_s, _p, r) => ({ a: r.toA - r.outA, b: r.toB - r.outB }),
    diagram: {
      stocks: { a: { x: 480, y: 35, w: 150, h: 90 }, b: { x: 480, y: 175, w: 150, h: 90 } },
      flows: [
        { id: "toA", pts: [[120, 150], [300, 150], [300, 80], [480, 80]], to: "a", max: 40 },
        { id: "toB", pts: [[120, 150], [300, 150], [300, 220], [480, 220]], to: "b", max: 40, color: C.pink },
        { id: "outA", pts: [[630, 80], [790, 80]], from: "a", max: 40 },
        { id: "outB", pts: [[630, 220], [790, 220]], from: "b", max: 40 },
      ],
    },
    cld: {
      vars: [
        { id: "a", label: "A's base", x: 130, y: 90 },
        { id: "sa", label: "A's share", x: 390, y: 90 },
        { id: "b", label: "B's base", x: 255, y: 200 },
      ],
      links: [
        { from: "a", to: "sa", sign: "+", curve: -46 },
        { from: "sa", to: "a", sign: "+", curve: -46 },
        { from: "b", to: "sa", sign: "−", curve: 46 },
        { from: "sa", to: "b", sign: "−", curve: 46 },
        { from: "a", to: "a", sign: "−", self: true },
        { from: "b", to: "b", sign: "−", self: true },
      ],
      loops: [{ type: "R", label: "R1", x: 260, y: 90 }, { type: "R", label: "R2", x: 322, y: 146 }, { type: "B", label: "B1", x: 72, y: 42 }, { type: "B", label: "B2", x: 186, y: 244 }],
      caption:
        '<span class="chip chipR">R1</span> success to the successful: a bigger installed base raises attractiveness → wins a bigger share of new customers → grows the base further. The two products share one pool, so A\'s gain is B\'s loss — a tiny early lead can compound into <b>winner-take-all lock-in</b>. <span class="chip chipR">R2</span> is the same loop seen from B’s side: a larger B base cuts A’s share, which leaves more new customers for B. <span class="chip chipB">B1</span> <span class="chip chipB">B2</span> Churn drains each base in proportion to its size, which is what stops the totals growing without limit.',
    },
    desc: `<p>When one inflow is split by <b>relative attractiveness</b>, and attractiveness itself rises with installed base (network effects, reputation, ecosystem), the split becomes a <b>reinforcing loop</b>. Small initial differences amplify: the leader wins more of each new cohort, grows faster, becomes more attractive still. This is the <i>Success to the Successful</i> archetype and the source of path dependence and lock-in.</p>
    <div class="eq">share_A = base_A^φ / (base_A^φ + base_B^φ),&nbsp; φ = 1 + 2·network&nbsp; (φ &gt; 1 ⇒ increasing returns)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use this when competitors <b>draw from a shared pool</b> and an advantage feeds on itself — platforms, standards, marketplaces, talent attraction, even attention. Turn the <b>network effect</b> to 0 and shares track intrinsic attractiveness (a stable split); turn it up and the system tips to one winner, with the outcome decided by small early events rather than steady-state merit.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — referral concentration: busier centers attract more cases and expertise, reinforcing volume–outcome advantages.</li>
      <li><b>Sustainability</b> — competing standards/infrastructure (e.g. EV charging networks) tipping toward a dominant format.</li>
      <li><b>Business / tech</b> — platform and standards wars (VHS vs. Betamax, dominant marketplaces); increasing-returns lock-in.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Start nearly tied (A = 105, B = 95) with a strong network effect (0.7). A's slight edge wins it just over half of each 20-customer cohort, so it grows a little faster, becomes more attractive, and the gap <b>widens every month</b> until A dominates and B fades. Set the network effect to 0 and the same start stays a near-even, stable split — the asymmetry no longer compounds.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Senge, P. M. (1990). <i>The Fifth Discipline</i> — "Success to the Successful" systems archetype.</li>
      <li>Arthur, W. B. (1989). "Competing technologies, increasing returns, and lock-in by historical events." <i>Economic Journal</i> 99: 116–131.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 10 — path dependence and positive feedback.</li>
    </ul>`,
  },

  // ================= PROTECTED LEVELS & FULFILLMENT =================
  floor: {
    name: "Floor",
    title: "Floor (Lower Bound)",
    timeUnit: "wk",
    unitY: "units",
    lede: "The mirror of a ceiling: a stock drains toward a minimum and the outflow throttles so it never crosses the floor — MAX() instead of MIN().",
    stocks: [{ id: "q", label: "Stock", init: 100, scale: 110, color: C.acc }],
    params: [
      { id: "base", label: "Desired outflow", min: 0, max: 30, step: 1, value: 14, unit: "/wk" },
      { id: "floor", label: "Floor", min: 0, max: 90, step: 5, value: 30, unit: "" },
      { id: "at", label: "Approach time", min: 0.5, max: 8, step: 0.5, value: 2, unit: "wk" },
    ],
    rates: (s, p) => ({ out: Math.max(0, Math.min(p.base, (s.q - p.floor) / p.at)) }),
    derivs: (_s, _p, r) => ({ q: -r.out }),
    diagram: {
      stocks: { q: { x: 300, y: 90, w: 130, h: 120 } },
      flows: [{ id: "out", pts: [[430, 150], [785, 150]], from: "q", max: 30 }],
    },
    cld: {
      vars: [
        { id: "fl", label: "Floor", x: 110, y: 65 },
        { id: "q", label: "Stock", x: 130, y: 185 },
        { id: "o", label: "Outflow", x: 390, y: 125 },
      ],
      links: [
        { from: "fl", to: "o", sign: "−", curve: -20 },
        { from: "q", to: "o", sign: "+", curve: 46 },
        { from: "o", to: "q", sign: "−", curve: 46 },
      ],
      loops: [{ type: "B", label: "B1", x: 262, y: 155 }],
      caption:
        '<span class="chip chipB">B1</span> A balancing loop that bites from below. While the stock is well above the floor it drains at the desired rate; as the gap <code>(Stock − floor)</code> shrinks, MAX/MIN throttles the outflow so the stock eases down to the floor and stops — the continuous version of MAX().',
    },
    desc: `<p>A floor is a ceiling turned upside-down. The outflow runs at its desired rate until the stock nears a minimum, then tapers so the stock approaches the floor without crossing it. Hines builds this as a smooth (graphical-function) version of <code>MAX()</code>; here we use the equivalent throttled-flow form for a clean, no-overshoot approach.</p>
    <div class="eq">outflow = MAX(0, MIN(desired, (Stock − floor) / approach time))</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use a floor whenever a stock has a <b>protected minimum</b> it must not breach — a minimum cash reserve, safety stock, a reservoir's dead-pool / minimum ecological flow, a strategic buffer. It is the lower-bound twin of the Ceiling molecule; pair the two to box a stock inside a corridor.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — a blood-bank or PPE stockpile drawn down only to a mandated minimum reserve.</li>
      <li><b>Sustainability</b> — reservoir releases capped so the level never drops below the minimum ecological / dead-storage level.</li>
      <li><b>Finance</b> — spending throttled to keep a minimum cash balance.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Stock 100, desired outflow 14/wk, floor 30, approach time 2 wk. While the stock exceeds <code>30 + 14×2 = 58</code> it drains a straight 14/wk; once it falls below 58 (headroom &lt; 28) the outflow tapers, easing the stock down to <b>30</b> and holding there. Lower the approach time for a harder, more clip-like floor.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Floor (continuous MAX) / Ceiling.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 13–14 — nonlinear functions, MIN/MAX and bounds.</li>
    </ul>`,
  },

  protLevel: {
    name: "Level Protected by Level",
    title: "Level Protected by Level",
    timeUnit: "wk",
    unitY: "units",
    lede: "Keep a stock non-negative by multiplying its outflow by a smooth effect that fades to zero as the stock empties — gentler and more accurate than IF-THEN-ELSE.",
    stocks: [{ id: "level", label: "Inventory", init: 100, scale: 120, color: C.acc }],
    params: [
      { id: "inflow", label: "Replenishment", min: 0, max: 15, step: 0.5, value: 4, unit: "/wk" },
      { id: "desiredOut", label: "Desired draining", min: 0, max: 25, step: 0.5, value: 12, unit: "/wk" },
      { id: "protectBelow", label: "Protect below", min: 5, max: 60, step: 1, value: 25, unit: "" },
    ],
    rates: (s, p) => {
      const effect = Math.max(0, Math.min(1, s.level / p.protectBelow));
      return { in: p.inflow, out: p.desiredOut * effect };
    },
    derivs: (_s, _p, r) => ({ level: r.in - r.out }),
    diagram: {
      stocks: { level: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [
        { id: "in", pts: [[40, 150], [330, 150]], to: "level", max: 15 },
        { id: "out", pts: [[460, 150], [785, 150]], from: "level", max: 25 },
      ],
    },
    cld: {
      vars: [
        { id: "lv", label: "Level", x: 150, y: 150 },
        { id: "dr", label: "Draining", x: 380, y: 150 },
        { id: "de", label: "Desired", x: 260, y: 60 },
      ],
      links: [
        { from: "lv", to: "dr", sign: "+", curve: -46, note: "via effect" },
        { from: "dr", to: "lv", sign: "−", curve: -46 },
        { from: "de", to: "dr", sign: "+", curve: 22 },
      ],
      loops: [{ type: "B", label: "B1", x: 260, y: 150 }],
      caption:
        '<span class="chip chipB">B1</span> The outflow is the desired rate times an <b>effect of the level on draining</b> that falls smoothly to 0 as the stock empties. Low level → smaller effect → less draining → the stock cannot be pulled negative. A smooth multiplier, not a hard IF-THEN switch.',
    },
    desc: `<p>Physical stocks must never go negative, yet a constant desired outflow would happily drive them below zero. The fix: multiply the desired outflow by an <b>effect of level</b> — a smooth function of the relative level that equals 1 when there is plenty and ramps to 0 as the stock approaches empty. Hines favours this over <code>IF-THEN-ELSE</code> because it is less prone to integration error and is correct for aggregate stocks (a real inventory of many SKUs runs low gradually, not all at once).</p>
    <div class="eq">draining = desired × MIN(1, Level / protect-below)&nbsp;&nbsp;(effect → 0 as Level → 0)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use this whenever an outflow is driven by <b>demand that can exceed supply</b> and the stock represents an aggregate that depletes gradually — finished-goods inventory shipped against orders, a labour pool assigned to tasks, a fund drawn down. Prefer it to a hard MIN when you want a smooth, realistic taper rather than an abrupt cutoff.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — dispensing from a drug stock: as it runs low, fulfilment of new requests tapers rather than going negative.</li>
      <li><b>Sustainability</b> — water allocation easing off as a reservoir approaches empty.</li>
      <li><b>Operations</b> — shipping from finished-goods inventory; service capacity drawn from a shrinking staff pool.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Replenishment 4/wk, desired draining 12/wk, protect-below 25. Because demand (12) exceeds supply (4), the level falls until the effect throttles draining to match inflow: <code>effect = 4/12 = 0.33</code>, so the level settles at <code>25 × 0.33 ≈ 8.3</code> — low but firmly positive, never negative. Raise replenishment above desired draining and the stock simply fills.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Level Protected by Level.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 13–14 — non-negativity, smooth effects vs. IF-THEN-ELSE.</li>
    </ul>`,
  },

  protFlow: {
    name: "Level Protected by Flow",
    title: "Level Protected by Flow",
    timeUnit: "wk",
    unitY: "units",
    lede: "Cap the outflow at the most the stock can physically supply — you cannot drain faster than Level ÷ fastest-draining-time, so it never goes negative.",
    stocks: [{ id: "level", label: "On hand", init: 80, scale: 100, color: C.acc }],
    params: [
      { id: "inflow", label: "Replenishment", min: 0, max: 15, step: 0.5, value: 3, unit: "/wk" },
      { id: "desiredOut", label: "Desired draining", min: 0, max: 25, step: 0.5, value: 10, unit: "/wk" },
      { id: "fastest", label: "Fastest draining time", min: 0.5, max: 6, step: 0.5, value: 2, unit: "wk" },
    ],
    rates: (s, p) => ({ in: p.inflow, out: Math.min(p.desiredOut, s.level / p.fastest) }),
    derivs: (_s, _p, r) => ({ level: r.in - r.out }),
    diagram: {
      stocks: { level: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [
        { id: "in", pts: [[40, 150], [330, 150]], to: "level", max: 15 },
        { id: "out", pts: [[460, 150], [785, 150]], from: "level", max: 25 },
      ],
    },
    cld: {
      vars: [
        { id: "lv", label: "Level", x: 150, y: 150 },
        { id: "dr", label: "Draining", x: 380, y: 150 },
        { id: "de", label: "Desired", x: 260, y: 60 },
      ],
      links: [
        { from: "lv", to: "dr", sign: "+", curve: -46, note: "max = L/τ" },
        { from: "dr", to: "lv", sign: "−", curve: -46 },
        { from: "de", to: "dr", sign: "+", curve: 22 },
      ],
      loops: [{ type: "B", label: "B1", x: 260, y: 150 }],
      caption:
        '<span class="chip chipB">B1</span> The maximum possible outflow is <code>Level / fastest-draining-time</code>; actual draining is the smaller of desired and that maximum. When the stock is high the cap is slack (desired wins); when it is low the cap binds and draining decays with the level — so the stock can never be over-drained.',
    },
    desc: `<p>An alternative non-negativity guard: rather than scaling by an effect, <b>cap the outflow at the maximum the stock can deliver</b>. The fastest you could empty the stock is <code>Level / fastest-draining-time</code>; actual draining is <code>MIN(desired, that maximum)</code>. With a high stock the desired rate flows freely; as it empties the cap takes over and the outflow tapers exponentially toward zero.</p>
    <div class="eq">draining = MIN( desired draining, Level / fastest draining time )</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use protection-by-flow when there is a genuine <b>maximum extraction rate</b> tied to how much is present — you can't withdraw more cash than the balance, ship more than is on hand, or pump faster than the well allows. It's the sharper, MIN-based cousin of "protected by level"; choose it when the limit is a hard physical maximum rather than a gradual reluctance.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — administering doses limited by vials on hand; throughput limited by remaining supplies.</li>
      <li><b>Sustainability</b> — extraction capped by remaining recoverable resource (groundwater, fishery).</li>
      <li><b>Finance / operations</b> — withdrawals capped by account balance; shipments capped by on-hand inventory.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    On hand 80, desired draining 10/wk, fastest draining time 2 wk. The cap starts at <code>80/2 = 40 ≥ 10</code>, so it drains the full 10/wk. With replenishment only 3/wk the level falls; once it reaches <code>desired × fastest = 10 × 2 = 20</code>, the cap (<code>20/2 = 10</code>) equals desired and below that the outflow follows <code>Level/2</code>, decaying toward — but never reaching — zero. Equilibrium where <code>Level/2 = 3</code> ⇒ Level ≈ 6.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Level Protected by Flow (uses max-outflow cap + Go-to-Zero).</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 13–14 — capacity-limited rates and non-negativity.</li>
    </ul>`,
  },

  backlogFlow: {
    name: "Backlog Protected by Flow",
    title: "Backlog Shipping Protected by Flow",
    timeUnit: "mo",
    unitY: "orders",
    lede: "Orders pile into a backlog; you ship them at the rate needed to clear in a target time — capped by capacity. The backlog can never be shipped negative.",
    stocks: [{ id: "backlog", label: "Backlog", init: 60, scale: 130, color: C.acc2 }],
    params: [
      { id: "orders", label: "Order rate", min: 0, max: 25, step: 1, value: 12, unit: "/mo" },
      { id: "shipTime", label: "Desired ship time", min: 1, max: 10, step: 0.5, value: 3, unit: "mo" },
      { id: "capacity", label: "Shipping capacity", min: 0, max: 30, step: 1, value: 10, unit: "/mo" },
    ],
    rates: (s, p) => ({ in: p.orders, ship: Math.min(s.backlog / p.shipTime, p.capacity) }),
    derivs: (_s, _p, r) => ({ backlog: r.in - r.ship }),
    diagram: {
      stocks: { backlog: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [
        { id: "in", pts: [[40, 150], [330, 150]], to: "backlog", max: 25 },
        { id: "ship", pts: [[460, 150], [785, 150]], from: "backlog", max: 25, color: C.good },
      ],
    },
    cld: {
      vars: [
        { id: "bk", label: "Backlog", x: 160, y: 150 },
        { id: "sh", label: "Shipping", x: 400, y: 150 },
        { id: "cap", label: "Capacity", x: 280, y: 60 },
      ],
      links: [
        { from: "bk", to: "sh", sign: "+", curve: -46, note: "B/τ" },
        { from: "sh", to: "bk", sign: "−", curve: -46 },
        { from: "cap", to: "sh", sign: "+", curve: 22 },
      ],
      loops: [{ type: "B", label: "B1", x: 278, y: 150 }],
      caption:
        '<span class="chip chipB">B1</span> Desired shipping is <code>Backlog / desired-ship-time</code> (a "go-to-zero" rate that empties the backlog over the target time); actual shipping is the smaller of that and capacity. When orders exceed capacity the backlog grows; when capacity is ample it shrinks to <code>orders × ship-time</code>.',
    },
    desc: `<p>A backlog of unfilled orders accumulates inflowing orders and is reduced by shipping. The desired shipping rate is set to clear the backlog over a target time (<code>Backlog / desired-ship-time</code> — the Go-to-Zero structure), but actual shipping is <b>capped by capacity</b>. Because desired shipping is proportional to the backlog, the backlog can never be shipped below zero — that's the "protected by flow".</p>
    <div class="eq">shipping = MIN( Backlog / desired-ship-time, capacity )</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use this for any <b>queue of work cleared at a capacity-limited rate</b> — order fulfilment, a service or repair backlog, a support-ticket queue, a waiting list. It tells you when capacity is the binding constraint (backlog grows without bound) versus when service time is (backlog settles at <code>throughput × ship-time</code>).</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — a surgical or diagnostic waiting list cleared at theatre/scanner capacity.</li>
      <li><b>Sustainability</b> — permit or grid-connection application backlogs processed at agency capacity.</li>
      <li><b>Operations</b> — order backlog shipped at warehouse capacity; help-desk ticket queue.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Orders 12/mo, capacity 10/mo. Desired shipping would clear the backlog in 3 months, but it is capped at 10 — and 10 &lt; 12, so the backlog <b>grows by 2/mo without limit</b>: capacity is the binding constraint. Raise capacity above 12 and the backlog instead falls to its steady level <code>orders × ship-time = 12 × 3 = 36</code>.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Backlog Shipping Protected by Flow / Go-to-Zero.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 18 — order fulfilment, backlogs and service-time vs. capacity limits.</li>
    </ul>`,
  },

  backlogLevel: {
    name: "Backlog Protected by Level",
    title: "Backlog Shipping Protected by Level",
    timeUnit: "mo",
    unitY: "units",
    lede: "Ship to clear a backlog — but you can only ship what's in stock. Shipping draws down inventory and tapers as inventory runs low: two coupled balancing loops.",
    stocks: [
      { id: "backlog", label: "Backlog", init: 30, scale: 120, color: C.acc2 },
      { id: "inventory", label: "Inventory", init: 100, scale: 160, color: C.acc },
    ],
    params: [
      { id: "orders", label: "Order rate", min: 0, max: 25, step: 1, value: 12, unit: "/mo" },
      { id: "shipTime", label: "Desired ship time", min: 1, max: 8, step: 0.5, value: 2, unit: "mo" },
      { id: "producing", label: "Production", min: 0, max: 25, step: 1, value: 12, unit: "/mo" },
      { id: "protectInv", label: "Full-service inventory", min: 20, max: 120, step: 5, value: 60, unit: "" },
    ],
    rates: (s, p) => {
      const desiredShip = s.backlog / p.shipTime;
      const invEffect = Math.max(0, Math.min(1, s.inventory / p.protectInv));
      const ship = desiredShip * invEffect;
      return { orders: p.orders, producing: p.producing, fulfilling: ship, shipping: ship };
    },
    derivs: (_s, _p, r) => ({ backlog: r.orders - r.fulfilling, inventory: r.producing - r.shipping }),
    diagram: {
      stocks: { backlog: { x: 150, y: 30, w: 120, h: 90 }, inventory: { x: 150, y: 175, w: 120, h: 90 } },
      flows: [
        { id: "orders", pts: [[40, 75], [150, 75]], to: "backlog", max: 25 },
        { id: "fulfilling", pts: [[270, 75], [470, 75]], from: "backlog", max: 25, color: C.good },
        { id: "producing", pts: [[40, 220], [150, 220]], to: "inventory", max: 25 },
        { id: "shipping", pts: [[270, 220], [470, 220]], from: "inventory", max: 25, color: C.good },
      ],
    },
    cld: {
      vars: [
        { id: "bk", label: "Backlog", x: 110, y: 45 },
        { id: "inv", label: "Inventory", x: 110, y: 228 },
        { id: "sh", label: "Shipping", x: 390, y: 135 },
      ],
      links: [
        { from: "bk", to: "sh", sign: "+", curve: -46, note: "desired" },
        { from: "sh", to: "bk", sign: "−", curve: -46 },
        { from: "inv", to: "sh", sign: "+", curve: 46, note: "effect" },
        { from: "sh", to: "inv", sign: "−", curve: 46 },
      ],
      loops: [{ type: "B", label: "B1", x: 250, y: 88 }, { type: "B", label: "B2", x: 250, y: 184 }],
      caption:
        '<span class="chip chipB">B1</span> backlog clearing + <span class="chip chipB">B2</span> inventory protection. Shipping is driven by the backlog (<code>Backlog/τ</code>) but multiplied by an inventory effect that fades as stock runs low — so you ship only what you have. Shipping both reduces the backlog and consumes inventory.',
    },
    desc: `<p>The make-to-stock fulfilment structure. Shipping is pulled by the backlog (clear it over a target time) but <b>protected by the inventory level</b>: an effect multiplier fades to zero as inventory empties, so you can never ship goods you don't have. The same shipping rate both fulfils orders (drains the backlog) and consumes inventory (drained by shipping, refilled by production).</p>
    <div class="eq">shipping = (Backlog / desired-ship-time) × MIN(1, Inventory / full-service inventory)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use this whenever <b>fulfilment depends on stock availability</b> — a backlog you'd love to clear but can only serve from finished inventory. It exposes the interaction that one-stock models miss: a big backlog cannot be worked off if inventory is starved, so production (not just shipping policy) gates delivery. The core of supply-chain and Beer-Game service dynamics.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — a waiting list served only as supplies/beds (inventory) allow; vaccination backlog limited by doses on hand.</li>
      <li><b>Sustainability</b> — installation backlog (heat pumps, EV chargers) limited by available hardware stock.</li>
      <li><b>Operations</b> — make-to-stock order fulfilment: orders ship from finished-goods inventory replenished by production.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Orders 12/mo, ship time 2 mo, production 12/mo, full-service inventory 60. If inventory is healthy (≥ 60) the effect is 1 and shipping clears the backlog toward <code>orders × ship-time = 24</code>. Cut production below 12 and inventory falls; once it drops under 60 the effect throttles shipping, the backlog swells, and <b>delivery is now gated by production, not by shipping policy</b> — try lowering Production mid-run.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Backlog Shipping Protected by Level.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 18 — make-to-stock supply chains, inventory-constrained shipping.</li>
    </ul>`,
  },

  // ================== NONLINEAR / VALUATION UTILITIES ==================
  capacityUtil: {
    name: "Capacity Utilization",
    title: "Capacity Utilization",
    timeUnit: "wk",
    unitY: "units",
    lede: "Production rises with desired output but bends over as it nears capacity — a smooth utilization curve, the graceful cousin of a hard ceiling.",
    stocks: [{ id: "inventory", label: "Inventory", init: 50, scale: 200, color: C.acc }],
    params: [
      { id: "capacity", label: "Capacity", min: 10, max: 40, step: 1, value: 20, unit: "/wk" },
      { id: "demand", label: "Demand", min: 0, max: 40, step: 1, value: 18, unit: "/wk" },
      { id: "targetInv", label: "Target inventory", min: 50, max: 200, step: 10, value: 100, unit: "" },
      { id: "adj", label: "Restock time", min: 1, max: 8, step: 0.5, value: 3, unit: "wk" },
    ],
    rates: (s, p) => {
      const desired = p.demand + (p.targetInv - s.inventory) / p.adj;
      const indicated = Math.max(0, desired) / p.capacity;
      const util = 1 - Math.exp(-1.3 * indicated);
      return { prod: p.capacity * util, sales: p.demand };
    },
    derivs: (_s, _p, r) => ({ inventory: r.prod - r.sales }),
    diagram: {
      stocks: { inventory: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [
        { id: "prod", pts: [[40, 150], [330, 150]], to: "inventory", max: 40 },
        { id: "sales", pts: [[460, 150], [785, 150]], from: "inventory", max: 40, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "inv", label: "Inventory", x: 130, y: 150 },
        { id: "prod", label: "Production", x: 370, y: 150 },
        { id: "cap", label: "Capacity", x: 260, y: 60 },
      ],
      links: [
        { from: "inv", to: "prod", sign: "−", curve: -46, note: "restock" },
        { from: "prod", to: "inv", sign: "+", curve: -46 },
        { from: "cap", to: "prod", sign: "+", curve: 22 },
      ],
      loops: [{ type: "B", label: "B1", x: 248, y: 150 }],
      caption:
        '<span class="chip chipB">B1</span> Production is <code>capacity × utilization</code>, where utilization rises with desired output but saturates near 1 — so output approaches, but cannot freely exceed, capacity. A soft, diminishing-returns version of the Ceiling.',
    },
    desc: `<p>Capacity utilization sets production as a <b>fraction of capacity actually used</b>: as desired output climbs toward capacity, utilization rises but with diminishing returns, so production bends smoothly below the capacity line rather than hitting a hard wall. (Modellers sometimes let utilization exceed 1 — overtime, skipped maintenance — to represent straining past rated capacity.)</p>
    <div class="eq">production = capacity × utilization( desired production / capacity )</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it when a facility's output <b>softly saturates</b> near a rated maximum rather than clipping abruptly — factories, power plants, clinics, networks. Prefer it over the MIN-based Ceiling when you want realistic diminishing returns and the option of straining beyond rated capacity.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — hospital throughput as occupancy approaches 100% (and care quality degrades past it).</li>
      <li><b>Sustainability</b> — a grid or renewable plant operating near rated output; curtailment near limits.</li>
      <li><b>Operations</b> — factory production vs. installed capacity; server utilization.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Capacity 20/wk, demand 18/wk: desired ≈ 18, indicated ≈ 0.9, utilization ≈ 1 − e^(−1.17) ≈ 0.69, production ≈ 14/wk — already short of demand, so inventory drifts down and pushes desired (hence utilization) higher. Raise capacity and production rises to meet demand; push demand past capacity and output saturates while inventory drains.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Capacity Utilization / Ceiling.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 14 — capacity and utilization formulations.</li>
    </ul>`,
  },

  weightedAvg: {
    name: "Weighted Average",
    title: "Weighted Average",
    timeUnit: "wk",
    unitY: "level",
    lede: "Blend two sources into one estimate by a weight — then let a stock track that blend. The basis of combining forecasts, signals, or opinions.",
    stocks: [{ id: "estimate", label: "Estimate", init: 50, scale: 120, color: C.acc }],
    params: [
      { id: "srcA", label: "Source A", min: 0, max: 100, step: 1, value: 70, unit: "" },
      { id: "srcB", label: "Source B", min: 0, max: 100, step: 1, value: 30, unit: "" },
      { id: "weightA", label: "Weight on A", min: 0, max: 1, step: 0.05, value: 0.6, unit: "" },
      { id: "tau", label: "Adjust time", min: 1, max: 12, step: 0.5, value: 4, unit: "wk" },
    ],
    rates: (s, p) => {
      const blend = p.weightA * p.srcA + (1 - p.weightA) * p.srcB;
      return { adjust: (blend - s.estimate) / p.tau };
    },
    derivs: (_s, _p, r) => ({ estimate: r.adjust }),
    diagram: {
      stocks: { estimate: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [{ id: "adjust", pts: [[40, 150], [330, 150]], to: "estimate", max: 16 }],
    },
    cld: {
      vars: [
        { id: "a", label: "Source A", x: 110, y: 60 },
        { id: "b", label: "Source B", x: 410, y: 60 },
        { id: "e", label: "Estimate", x: 260, y: 165 },
      ],
      links: [
        { from: "a", to: "e", sign: "+", curve: -22 },
        { from: "b", to: "e", sign: "+", curve: 22 },
        { from: "e", to: "e", sign: "−", self: true },
      ],
      loops: [{ type: "B", label: "B1", x: 260, y: 235 }],
      caption:
        'The estimate chases a <b>weighted blend</b> of two sources: <code>w·A + (1−w)·B</code>. The weight (often itself a function of relative reliability or recency) decides how much each source pulls. A balancing loop closes the estimate onto the blend.',
    },
    desc: `<p>A weighted average combines two inputs into one, with a weight controlling the mix. Here a stock smooths toward the blend, so changing a source or the weight moves the estimate with a lag. The weight is frequently <b>endogenous</b> — a function of how reliable, recent, or large each source is.</p>
    <div class="eq">blend = w · Source A + (1 − w) · Source B</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it to <b>combine multiple signals</b> into a single driver — blending a short- and long-term forecast, fusing sensor readings, mixing expert and data-driven estimates, or averaging price across channels. Make the weight depend on relative confidence to model attention shifting between sources.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — blending a fast (recent cases) and slow (seasonal baseline) signal into an outbreak estimate.</li>
      <li><b>Sustainability</b> — combining short- and long-range demand forecasts to size capacity.</li>
      <li><b>Finance</b> — weighting analyst vs. model forecasts; blended price indices.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Source A = 70, Source B = 30, weight 0.6 → blend = <code>0.6×70 + 0.4×30 = 54</code>, which the estimate eases toward. Slide the weight to 1 and the estimate heads for 70 (A only); to 0 and it heads for 30 (B only).</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Weighted Average / Weighted Split.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 16 — combining information sources.</li>
    </ul>`,
  },

  presentValue: {
    name: "Present Value",
    title: "Present Value (Discounting)",
    timeUnit: "yr",
    unitY: "$",
    lede: "A future stream of cash is worth less the longer you wait. Accumulate each flow discounted by elapsed time and you get its present value.",
    stocks: [
      { id: "pv", label: "Present value", init: 0, scale: 300, color: C.good },
      { id: "clock", label: "elapsed", init: 0, scale: 50, color: C.acc, hidden: true },
    ],
    params: [
      { id: "cashFlow", label: "Cash flow", min: 0, max: 50, step: 1, value: 20, unit: "$/yr" },
      { id: "r", label: "Discount rate", min: 1, max: 20, step: 0.5, value: 8, unit: "%/yr" },
    ],
    rates: (s, p) => {
      const discount = Math.exp(-(p.r / 100) * s.clock);
      return { discounting: p.cashFlow * discount };
    },
    derivs: (_s, _p, r) => ({ pv: r.discounting, clock: 1 }),
    diagram: {
      stocks: { pv: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [{ id: "discounting", pts: [[40, 150], [330, 150]], to: "pv", max: 22 }],
    },
    cld: {
      vars: [
        { id: "t", label: "Elapsed time", x: 120, y: 80 },
        { id: "df", label: "Discount factor", x: 380, y: 80 },
        { id: "pv", label: "Present value", x: 250, y: 190 },
      ],
      links: [
        { from: "t", to: "df", sign: "−", curve: -22 },
        { from: "df", to: "pv", sign: "+", curve: 22 },
      ],
      loops: [],
      caption:
        'As time elapses the <b>discount factor</b> <code>e^(−r·t)</code> shrinks, so each later dollar adds less to the accumulated present value. No feedback loop — just time eroding the worth of future flows.',
    },
    desc: `<p>Money later is worth less than money now. Present value accumulates a cash-flow stream, each unit discounted by how far in the future it arrives: <code>e^(−r·t)</code>. Early flows count almost fully; distant ones barely move the total, so the present value rises with ever-smaller increments toward a finite limit.</p>
    <div class="eq">PV = ∫ cash flow · e^(−r·t) dt&nbsp;&nbsp;⇒&nbsp;&nbsp;perpetuity PV = cash flow / r</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use present value to <b>compare flows across time</b> — investment appraisal (NPV), valuing a bond or annuity, weighing a long-term policy's future benefits against present costs. The discount rate encodes how steeply the future is devalued; small changes in it swing long-horizon valuations a lot.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — cost-effectiveness of prevention: discounting future health benefits (QALYs) against today's spend.</li>
      <li><b>Sustainability</b> — the climate "discount rate" debate — how much to value far-future damages today.</li>
      <li><b>Finance</b> — NPV of a project; pricing bonds and annuities.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    A perpetual $20/yr at an 8% discount rate is worth <code>20 / 0.08 = $250</code> today — the present value climbs steeply at first, then crawls toward 250 as distant years contribute almost nothing. Halve the discount rate to 4% and the same stream is worth $500: the far future suddenly matters far more.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Present Value.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i> — discounting and valuation of flows.</li>
    </ul>`,
  },

  // ======================= ANCHORING & PRICING =======================
  seaAnchor: {
    name: "Sea Anchor & Adjustment",
    title: "Sea Anchor & Adjustment",
    timeUnit: "mo",
    unitY: "level",
    lede: "Judge a value relative to a slowly-drifting anchor — but if the anchor chases the value it produces, expectations become self-fulfilling and drift without limit.",
    stocks: [
      { id: "anchor", label: "Anchor", init: 100, scale: 260, color: C.acc2 },
      { id: "valueDisp", label: "Value", init: 100, scale: 260, color: C.acc, chartHidden: false },
    ],
    params: [
      { id: "pressure", label: "Adjustment pressure", min: 0.5, max: 2, step: 0.05, value: 1, unit: "×" },
      { id: "timeToChange", label: "Anchor lag", min: 1, max: 24, step: 1, value: 6, unit: "mo" },
    ],
    rates: (s, p) => {
      const value = s.anchor * p.pressure;
      return { value, changeAnchor: (value - s.anchor) / p.timeToChange };
    },
    derivs: (s, p, r) => ({ anchor: r.changeAnchor, valueDisp: (r.value - s.valueDisp) / 0.1 }),
    diagram: {
      stocks: { anchor: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [{ id: "changeAnchor", pts: [[40, 150], [330, 150]], to: "anchor", max: 18 }],
    },
    cld: {
      vars: [
        { id: "an", label: "Anchor", x: 150, y: 150 },
        { id: "v", label: "Value", x: 380, y: 150 },
        { id: "pr", label: "Pressure", x: 260, y: 60 },
      ],
      links: [
        { from: "an", to: "v", sign: "+", curve: -46 },
        { from: "v", to: "an", sign: "+", curve: -46, note: "anchor drifts" },
        { from: "pr", to: "v", sign: "+", curve: 22 },
      ],
      loops: [{ type: "R", label: "R1", x: 266, y: 150 }],
      caption:
        '<span class="chip chipR">R1</span> The value is the anchor times an adjustment; the anchor then drifts toward the value it produced. Sustained pressure makes the value pull the anchor up, which lifts the value again — a <b>reinforcing drift</b> with no fundamental to stop it (the Protected variant ties the anchor to a real reference).',
    },
    desc: `<p>People judge magnitudes relative to a reference (the "anchor") and adjust from it. In a <b>sea anchor</b>, that reference is not fixed — it slowly drifts toward whatever value is currently produced. Useful for sticky expectations, but dangerous: under sustained pressure the value drags the anchor along, which raises the value again, and the whole thing drifts without limit. The <i>Protected</i> Sea Anchor cures this by tying the anchor to a genuine fundamental.</p>
    <div class="eq">value = Anchor × adjustment;&nbsp; d(Anchor)/dt = (value − Anchor) / anchor lag</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use a sea anchor for <b>self-referential expectations</b> — wages anchored on recent wages, prices on recent prices, "normal" demand on recent demand. It explains inertia and, more importantly, runaway drift: inflation spirals, asset bubbles, and ratchets where there is no external anchor pulling the system back.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — "acceptable" waiting times drifting upward as each year's backlog re-anchors expectations.</li>
      <li><b>Sustainability</b> — shifting-baseline syndrome: each generation anchors "natural" on a degraded reference.</li>
      <li><b>Finance</b> — asset-price bubbles and wage–price spirals from self-referential anchoring.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    With pressure = 1 the value equals the anchor (100) and nothing drifts. Set pressure = 1.15 and hold it: the value (115) pulls the anchor up, which lifts the value again — anchor and value <b>climb without bound</b>, the signature of an unprotected sea anchor. Return pressure to 1 and it locks in at the new, higher level (hysteresis).</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Sea Anchor &amp; Adjustment / Protected Sea Anchor.</li>
      <li>Tversky, A. &amp; Kahneman, D. (1974). "Judgment under uncertainty: heuristics and biases." <i>Science</i> 185: 1124–1131 — anchoring &amp; adjustment.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 16 — anchoring formulations.</li>
    </ul>`,
  },

  smoothPricing: {
    name: "Smooth Pricing",
    title: "Smooth Pricing",
    timeUnit: "yr",
    unitY: "$/unit",
    lede: "Prices are sticky: they ease toward an indicated price (set by cost and market pressure) over time rather than jumping — a smooth applied to price.",
    stocks: [
      { id: "price", label: "Price", init: 10, scale: 26, color: C.good },
      { id: "indicatedDisp", label: "Indicated price", init: 10, scale: 26, color: C.acc2, chartHidden: false },
    ],
    params: [
      { id: "refPrice", label: "Reference price", min: 5, max: 20, step: 0.5, value: 10, unit: "$" },
      { id: "pressure", label: "Market pressure", min: 0.5, max: 2, step: 0.05, value: 1, unit: "×" },
      { id: "tau", label: "Price adj time", min: 0.5, max: 12, step: 0.5, value: 4, unit: "yr" },
    ],
    rates: (s, p) => {
      const indicated = p.refPrice * p.pressure;
      return { indicated, changing: (indicated - s.price) / p.tau };
    },
    derivs: (s, p, r) => ({ price: r.changing, indicatedDisp: (r.indicated - s.indicatedDisp) / 0.1 }),
    diagram: {
      stocks: { price: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [{ id: "changing", pts: [[40, 150], [330, 150]], to: "price", max: 6 }],
    },
    cld: {
      vars: [
        { id: "ind", label: "Indicated price", x: 150, y: 150 },
        { id: "pr", label: "Price", x: 390, y: 150 },
        { id: "ps", label: "Pressure", x: 270, y: 60 },
      ],
      links: [
        { from: "ind", to: "pr", sign: "+", curve: -24 },
        { from: "pr", to: "pr", sign: "−", self: true },
        { from: "ps", to: "ind", sign: "+", curve: 22 },
      ],
      loops: [{ type: "B", label: "B1", x: 342, y: 107 }],
      caption:
        '<span class="chip chipB">B1</span> Price is a stock that smooths toward an <b>indicated price</b> = reference × market pressure (effects of inventory, market share, cost). The adjustment time is the price stickiness — long lags mean price chases conditions slowly.',
    },
    desc: `<p>Prices rarely jump to the "right" level — they are <b>sticky</b>, easing toward an indicated price over an adjustment time. The indicated price is the underlying/reference price scaled by market pressure (effects of inventory coverage, market share, costs). Modelling price as a smooth captures menu costs, contracts, and the reluctance to change list prices.</p>
    <div class="eq">price = SMOOTH(indicated price, τ);&nbsp; indicated = reference × market pressure</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use smooth pricing whenever <b>price adjusts with a lag</b> to cost or demand signals — most real markets. The adjustment time governs how fast firms re-price; short lags give responsive (sometimes volatile) prices, long lags give stable but slow-to-clear markets and can drive inventory cycles.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — reimbursement / drug prices adjusting slowly to cost and utilization pressure.</li>
      <li><b>Sustainability</b> — carbon or electricity prices easing toward scarcity signals.</li>
      <li><b>Business</b> — list prices responding with a lag to inventory coverage and competition.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Reference $10, market pressure 1.0 → indicated $10, price holds. Bump pressure to 1.3 (tight inventory): indicated jumps to $13 but the price eases up over ~τ = 4 yr, closing 63% of the gap in the first 4 years. Shorten τ for snappier re-pricing.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Smooth Pricing / Sea Anchor Pricing.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 5 &amp; 11 — sticky prices as information delays.</li>
    </ul>`,
  },

  // ======================= PRODUCTIVITY & PROJECTS =======================
  prodFatigue: {
    name: "Productivity & Fatigue",
    title: "Productivity, Overtime & Fatigue",
    timeUnit: "wk",
    unitY: "× normal",
    lede: "Overtime lifts output now but builds fatigue that erodes productivity later — push too hard and total output falls below normal. The backfire of crunch.",
    stocks: [
      { id: "fatigue", label: "Fatigue", init: 1, scale: 2, color: C.pink },
      { id: "relOutput", label: "Output (× normal)", init: 1, scale: 1.6, color: C.good, chartHidden: false },
    ],
    params: [
      { id: "overtime", label: "Overtime", min: 1, max: 1.6, step: 0.05, value: 1, unit: "×" },
      { id: "timeToFatigue", label: "Time to fatigue", min: 1, max: 12, step: 0.5, value: 4, unit: "wk" },
      { id: "workforce", label: "Workforce", min: 0, max: 50, step: 1, value: 20, unit: "ppl" },
      { id: "normalPDY", label: "Normal productivity", min: 1, max: 10, step: 0.5, value: 5, unit: "u/p" },
    ],
    rates: (s, p) => {
      const effect = Math.max(0.3, Math.min(1.1, 2 - s.fatigue));
      const relOut = p.overtime * effect;
      return { gettingFatigued: (p.overtime - s.fatigue) / p.timeToFatigue, relOut, output: p.workforce * p.normalPDY * relOut };
    },
    derivs: (s, _p, r) => ({ fatigue: r.gettingFatigued, relOutput: (r.relOut - s.relOutput) / 0.1 }),
    diagram: {
      stocks: { fatigue: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [{ id: "gettingFatigued", pts: [[40, 150], [330, 150]], to: "fatigue", max: 0.6 }],
    },
    cld: {
      vars: [
        { id: "ot", label: "Overtime", x: 120, y: 70 },
        { id: "fa", label: "Fatigue", x: 120, y: 200 },
        { id: "out", label: "Output", x: 390, y: 135 },
      ],
      links: [
        { from: "ot", to: "out", sign: "+", curve: -24 },
        { from: "ot", to: "fa", sign: "+", curve: 22 },
        { from: "fa", to: "out", sign: "−", curve: 22 },
        { from: "fa", to: "fa", sign: "−", self: true },
      ],
      loops: [{ type: "B", label: "B1", x: 200, y: 240 }],
      caption:
        '<span class="chip chipB">B1</span> Overtime boosts output immediately (+) but also builds fatigue (a smooth of overtime), and fatigue cuts productivity (−) with a delay. The delayed balancing loop is why crunch <b>feels</b> productive at first and then backfires.',
    },
    desc: `<p>Pushing hours up raises output — but not for free. <b>Fatigue</b> accumulates as a smooth of overtime, and rising fatigue erodes productivity (and quality). Past a point the productivity loss outweighs the extra hours and <b>output per the same workforce drops below normal</b>. The effect is delayed, so the damage shows up weeks after the decision to crunch.</p>
    <div class="eq">Fatigue = SMOOTH(overtime, τ);&nbsp; output = workforce × normal PDY × overtime × effect(Fatigue)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it wherever <b>effort can be pushed past sustainable levels</b> — project crunch, hospital staff overload, emergency response. It's the structure behind "the 90-hour week that ships less than the 40-hour week," and it warns against treating overtime as free capacity.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — staff working sustained overtime: more hours, more errors and burnout, falling effective output.</li>
      <li><b>Sustainability</b> — over-working land or equipment past maintenance, degrading long-run yield.</li>
      <li><b>Projects</b> — software/construction crunch eroding productivity and quality.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    At overtime = 1.0, fatigue settles at 1.0, the effect is 1.0, and relative output = 1.0 (normal). Push overtime to 1.4 and hold: output jumps to ~1.4× at first, but fatigue climbs toward 1.4, the effect falls to ≈ 2 − 1.4 = 0.6, and relative output settles at <code>1.4 × 0.6 ≈ 0.84</code> — <b>below</b> normal. The crunch ends up shipping less.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Productivity (PDY) / Effect of Fatigue / Overtime / Producing.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 2 &amp; project chapters — fatigue, overtime and the "burnout" loop.</li>
    </ul>`,
  },

  reworkCycle: {
    name: "Rework Cycle",
    title: "Rework Cycle (Work Accomplishment)",
    timeUnit: "wk",
    unitY: "tasks",
    lede: "Work gets done — but a fraction is done wrong, hides as undiscovered rework, and flows back. The reason projects are '90% done' for half their life.",
    stocks: [
      { id: "workToDo", label: "Work to do", init: 1000, scale: 1000, color: C.acc2 },
      { id: "undiscovered", label: "Undiscovered rework", init: 0, scale: 500, color: C.pink },
      { id: "workDone", label: "Work done", init: 0, scale: 1000, color: C.good },
    ],
    params: [
      { id: "capacity", label: "Work capacity", min: 20, max: 200, step: 5, value: 90, unit: "/wk" },
      { id: "quality", label: "Quality", min: 0.5, max: 1, step: 0.02, value: 0.8, unit: "" },
      { id: "discoverTime", label: "Rework discovery time", min: 1, max: 16, step: 0.5, value: 5, unit: "wk" },
    ],
    rates: (s, p) => {
      const accomplishing = Math.min(p.capacity, s.workToDo / 0.5);
      return {
        correct: accomplishing * p.quality,
        rework: accomplishing * (1 - p.quality),
        discovering: s.undiscovered / p.discoverTime,
      };
    },
    derivs: (_s, _p, r) => ({
      workToDo: r.discovering - r.correct - r.rework,
      undiscovered: r.rework - r.discovering,
      workDone: r.correct,
    }),
    diagram: {
      stocks: {
        workToDo: { x: 120, y: 90, w: 110, h: 100 },
        workDone: { x: 600, y: 90, w: 110, h: 100 },
        undiscovered: { x: 360, y: 200, w: 130, h: 80 },
      },
      flows: [
        { id: "correct", pts: [[230, 140], [600, 140]], from: "workToDo", to: "workDone", max: 90, color: C.good },
        { id: "rework", pts: [[175, 190], [175, 240], [360, 240]], from: "workToDo", to: "undiscovered", max: 90, color: C.pink },
        { id: "discovering", pts: [[490, 240], [550, 240], [550, 110], [230, 110]], from: "undiscovered", to: "workToDo", max: 90 },
      ],
    },
    cld: {
      vars: [
        { id: "wtd", label: "Work to do", x: 130, y: 95 },
        { id: "ur", label: "Undiscovered rework", x: 380, y: 95 },
        { id: "q", label: "Quality", x: 130, y: 225 },
      ],
      links: [
        { from: "wtd", to: "ur", sign: "+", curve: -58, note: "× (1−q)" },
        { from: "ur", to: "wtd", sign: "+", curve: -58, note: "discovery" },
        { from: "q", to: "ur", sign: "−", curve: 20 },
        { from: "wtd", to: "wtd", sign: "−", self: true },
      ],
      loops: [{ type: "R", label: "R1", x: 255, y: 95 }, { type: "B", label: "B1", x: 70, y: 40 }],
      caption:
        '<span class="chip chipR">R1</span> the rework loop. Work accomplished at less-than-perfect quality creates <b>undiscovered rework</b>, which is later discovered and flows <i>back</i> into work-to-do — so the apparent progress overstates real progress. Lower quality → more recirculation → a longer tail. <span class="chip chipB">B1</span> Doing the work is what drains work-to-do; the project ends only when this loop outruns the rework coming back.',
    },
    desc: `<p>The defining structure of project dynamics. Work is accomplished at some rate; a fraction (= quality) is done correctly and leaves as finished, while the rest becomes <b>undiscovered rework</b> — done, believed complete, but actually wrong. After a discovery delay it surfaces and flows back into the work-to-do pile. The result: progress looks fast early (the "90% done" illusion) but the hidden rework tail drags completion out far beyond the naïve estimate.</p>
    <div class="eq">correct = accomplished × quality;&nbsp; rework = accomplished × (1 − quality);&nbsp; discovering = Undiscovered / discovery time</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use the rework cycle for any <b>knowledge or construction work where errors hide</b> and must be reworked — software, engineering, design, audits, large programmes. It explains chronic schedule overruns, the danger of cutting quality to hit a date (it lengthens the project), and why late-discovered rework is so costly.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — clinical documentation or coding redone after audits; care plans revised after missed findings.</li>
      <li><b>Sustainability</b> — retrofit/construction defects discovered late and redone, inflating cost and time.</li>
      <li><b>Projects</b> — software defects and design rework — the classic Cooper/Sterman project model.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    1000 tasks, quality 0.8: of each batch accomplished, 80% finish and 20% become undiscovered rework that returns weeks later to be redone (again at 80% quality). All work eventually completes — <b>mass is conserved, work done → 1000</b> — but it takes far longer than 1000 ÷ capacity. Drop quality to 0.6 and watch the rework tail balloon; raise it toward 1.0 and the project converges fast.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Cooper, K. G. (1980). "Naval ship production: a claim settled and a framework built." <i>Interfaces</i> 10(6) — the rework cycle.</li>
      <li>Hines, J. <i>Molecules of Structure</i> — Work Accomplishment Structure / Quality.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. on project dynamics.</li>
    </ul>`,
  },

  estCompletion: {
    name: "Estimated Completion",
    title: "Estimated Completion Date",
    timeUnit: "wk",
    unitY: "tasks",
    lede: "Divide work remaining by the work rate to estimate time to finish — but if scope creeps as fast as you work, the finish line never arrives.",
    stocks: [{ id: "workRemaining", label: "Work remaining", init: 500, scale: 600, color: C.acc }],
    params: [
      { id: "workRate", label: "Work rate", min: 10, max: 80, step: 5, value: 30, unit: "/wk" },
      { id: "scopeCreep", label: "Scope creep", min: 0, max: 40, step: 1, value: 0, unit: "/wk" },
    ],
    rates: (s, p) => ({ in: p.scopeCreep, accomplishing: Math.min(p.workRate, s.workRemaining / 0.5) }),
    derivs: (_s, _p, r) => ({ workRemaining: r.in - r.accomplishing }),
    diagram: {
      stocks: { workRemaining: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [
        { id: "in", pts: [[40, 150], [330, 150]], to: "workRemaining", max: 40, color: C.pink },
        { id: "accomplishing", pts: [[460, 150], [785, 150]], from: "workRemaining", max: 80, color: C.good },
      ],
    },
    cld: {
      vars: [
        { id: "wr", label: "Work remaining", x: 150, y: 150 },
        { id: "ac", label: "Accomplishing", x: 390, y: 150 },
        { id: "sc", label: "Scope creep", x: 270, y: 60 },
      ],
      links: [
        { from: "wr", to: "ac", sign: "+", curve: -46 },
        { from: "ac", to: "wr", sign: "−", curve: -46 },
        { from: "sc", to: "wr", sign: "+", curve: 22 },
      ],
      loops: [{ type: "B", label: "B1", x: 272, y: 150 }],
      caption:
        '<span class="chip chipB">B1</span> Accomplishing drains work remaining, which shrinks the estimated duration <code>(work remaining ÷ work rate)</code>. Scope creep adds work back: when creep approaches the work rate, the estimate stops falling — the deadline recedes as fast as you advance.',
    },
    desc: `<p>The simplest forecast in any project: <b>estimated remaining duration = work remaining ÷ work rate</b>, and the estimated completion date is now plus that. It is honest only if the work rate is steady and scope is fixed. Add <b>scope creep</b> — new work arriving as you go — and the estimate becomes a moving target: if creep matches the work rate, the project is perpetually "a few weeks out."</p>
    <div class="eq">estimated remaining duration = Work remaining / work rate</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it to model <b>completion forecasts and how they mislead</b> — anywhere progress is tracked against a deadline. It pairs naturally with the Rework Cycle (undiscovered rework <i>is</i> hidden scope) to explain why estimates are optimistic and deadlines slip.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — clearing a surgical waiting list while new referrals keep arriving.</li>
      <li><b>Sustainability</b> — decarbonization/retrofit programmes whose targets recede as scope expands.</li>
      <li><b>Projects</b> — software and construction completion estimates under requirements churn.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    500 tasks at 30/wk with no scope creep ⇒ estimated duration 500 ÷ 30 ≈ 17 wk, and the estimate counts steadily down to zero. Set scope creep to 30/wk (= the work rate) and work remaining holds flat — the estimated duration is stuck and the completion date <b>never arrives</b>. Even 20/wk of creep stretches 17 weeks into ~50.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Estimated Remaining Duration / Estimated Completion Date.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i> — schedule pressure and completion estimates.</li>
    </ul>`,
  },

  agingPDY: {
    name: "Aging Chain with PDY",
    title: "Aging Chain with Productivity",
    timeUnit: "yr",
    unitY: "people",
    lede: "An aging chain carrying a productivity coflow: rookies, experienced and veterans each produce differently, so rapid hiring can raise headcount yet cut output per person.",
    stocks: [
      { id: "rookies", label: "Rookies", init: 100, scale: 400, color: C.acc },
      { id: "experienced", label: "Experienced", init: 200, scale: 600, color: C.acc2 },
      { id: "gray", label: "Veterans", init: 50, scale: 300, color: C.good },
    ],
    params: [
      { id: "hiring", label: "Hiring", min: 0, max: 40, step: 1, value: 20, unit: "/yr" },
      { id: "tMature", label: "Time to mature", min: 1, max: 10, step: 0.5, value: 3, unit: "yr" },
      { id: "tExp", label: "Experienced tenure", min: 10, max: 40, step: 1, value: 25, unit: "yr" },
      { id: "tGray", label: "Veteran tenure", min: 3, max: 15, step: 1, value: 8, unit: "yr" },
    ],
    rates: (s, p) => ({
      hire: p.hiring,
      mature: s.rookies / p.tMature,
      senior: s.experienced / p.tExp,
      retire: s.gray / p.tGray,
      production: s.rookies * 0.5 + s.experienced * 1.0 + s.gray * 0.8,
    }),
    derivs: (_s, _p, r) => ({ rookies: r.hire - r.mature, experienced: r.mature - r.senior, gray: r.senior - r.retire }),
    diagram: {
      stocks: {
        rookies: { x: 110, y: 95, w: 95, h: 100 },
        experienced: { x: 355, y: 95, w: 95, h: 100 },
        gray: { x: 600, y: 95, w: 95, h: 100 },
      },
      flows: [
        { id: "hire", pts: [[20, 145], [110, 145]], to: "rookies", max: 40 },
        { id: "mature", pts: [[205, 145], [355, 145]], from: "rookies", to: "experienced", max: 40 },
        { id: "senior", pts: [[450, 145], [600, 145]], from: "experienced", to: "gray", max: 40 },
        { id: "retire", pts: [[695, 145], [800, 145]], from: "gray", max: 40, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "r", label: "Rookies", x: 120, y: 135 },
        { id: "e", label: "Experienced", x: 280, y: 135 },
        { id: "g", label: "Veterans", x: 440, y: 135 },
      ],
      links: [
        { from: "r", to: "e", sign: "+", curve: -22 },
        { from: "e", to: "g", sign: "+", curve: -22 },
        { from: "r", to: "r", sign: "−", self: true },
        { from: "e", to: "e", sign: "−", self: true },
        { from: "g", to: "g", sign: "−", self: true },
      ],
      loops: [
        { type: "B", label: "B1", x: 120, y: 60 },
        { type: "B", label: "B2", x: 280, y: 60 },
        { type: "B", label: "B3", x: 440, y: 60 },
      ],
      caption:
        '<span class="chip chipB">B×3</span> An aging chain with a <b>productivity coflow</b>: each cohort produces at its own rate (rookies 0.5, experienced 1.0, veterans 0.8 ×). Total output is the productivity-weighted sum, so the mix — not just the headcount — drives production.',
    },
    desc: `<p>Combine an aging chain with a coflow of <b>productivity</b>: each cohort (rookies, experienced, veterans) contributes output at its own rate, and total production is the weighted sum. This exposes a trap rapid scaling hides: hiring fast swells the rookie cohort, so headcount rises while <b>output per person falls</b> until the newcomers mature — the staffing-up productivity dip.</p>
    <div class="eq">production = Σ cohort × cohort productivity&nbsp;&nbsp;(rookie 0.5, experienced 1.0, veteran 0.8)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it when both the <b>size and the maturity mix</b> of a population drive an outcome — workforces during rapid growth, equipment fleets of mixed vintage, a user base where tenure changes value. It is the aging-chain answer to "we doubled headcount but output barely moved."</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — output and safety during rapid clinical hiring, until new staff gain experience.</li>
      <li><b>Sustainability</b> — fleet/plant output by vintage as efficient new units replace ageing ones.</li>
      <li><b>Business</b> — engineering throughput during fast scaling (the onboarding productivity dip).</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    At equilibrium with 20 hires/yr: rookies ≈ 60, experienced ≈ 500, veterans ≈ 160, giving production ≈ <code>60×0.5 + 500×1.0 + 160×0.8 = 658</code>. Now spike hiring: the rookie cohort balloons, headcount jumps, but production per person sags because rookies produce at half rate — recovering only as they mature into the experienced cohort.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Aging Chain with PDY.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 12 — coflows and aging chains.</li>
    </ul>`,
  },

  workforce: {
    name: "Workforce",
    title: "Workforce (Hiring & Firing)",
    timeUnit: "yr",
    unitY: "people",
    lede: "Move the workforce toward a desired level by hiring or firing — but the adjustment takes time, so the actual workforce always trails the target.",
    stocks: [{ id: "workforce", label: "Workforce", init: 40, scale: 110, color: C.acc }],
    params: [
      { id: "desired", label: "Desired workforce", min: 0, max: 100, step: 1, value: 60, unit: "" },
      { id: "tHire", label: "Time to hire/fire", min: 0.5, max: 12, step: 0.5, value: 4, unit: "yr" },
    ],
    rates: (s, p) => {
      const adjust = (p.desired - s.workforce) / p.tHire;
      return { hiring: Math.max(0, adjust), firing: Math.max(0, -adjust) };
    },
    derivs: (_s, _p, r) => ({ workforce: r.hiring - r.firing }),
    diagram: {
      stocks: { workforce: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [
        { id: "hiring", pts: [[40, 150], [330, 150]], to: "workforce", max: 20 },
        { id: "firing", pts: [[460, 150], [785, 150]], from: "workforce", max: 20, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "de", label: "Desired", x: 110, y: 65 },
        { id: "wf", label: "Workforce", x: 130, y: 185 },
        { id: "hf", label: "Hiring / firing", x: 390, y: 125 },
      ],
      links: [
        { from: "de", to: "hf", sign: "+", curve: -20 },
        { from: "wf", to: "hf", sign: "−", curve: 46 },
        { from: "hf", to: "wf", sign: "+", curve: 46 },
      ],
      loops: [{ type: "B", label: "B1", x: 262, y: 155 }],
      caption:
        '<span class="chip chipB">B1</span> The workforce is a first-order adjustment (a stock-adjustment / smooth) toward the desired level: the gap drives hiring or firing, which closes the gap. The time-to-hire is the lag that makes the workforce trail its target — a key source of labor and production cycles.',
    },
    desc: `<p>The labor stock-adjustment molecule: hire when short of the desired workforce, lay off when over, at a rate set by the gap and a hiring/firing time. Structurally it is Close Gap / first-order stock adjustment applied to people, and its delay is what makes employment <b>lag demand</b> — the seed of hiring cycles and the workforce–inventory oscillator.</p>
    <div class="eq">hiring − firing = (desired workforce − Workforce) / time to hire-or-fire</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it whenever <b>headcount adjusts toward a target with delay</b> — staffing to workload, scaling a team, capacity expansion. Couple "desired workforce" to a backlog or production goal and the hiring lag generates the classic boom-bust labor cycle; it also feeds the Aging-Chain-with-PDY onboarding dip.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — recruiting nurses toward a safe-staffing target through long hiring pipelines.</li>
      <li><b>Sustainability</b> — building a green-jobs / installer workforce to meet rollout targets.</li>
      <li><b>Business</b> — scaling (and over-correcting) headcount with demand.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Workforce 40, desired 60, time to hire 4 yr ⇒ first-year hiring ≈ (60 − 40)/4 = 5 people/yr, tapering as the gap closes; ~63% of the gap is shut after 4 yr. Drop desired below the current workforce and the same loop runs in reverse as firing. Shorten the hiring time for a faster (but choppier) response.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Workforce / First-Order Stock Adjustment.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 19–20 — labor and the workforce–inventory oscillator.</li>
    </ul>`,
  },

  // ============= EFFECT FUNCTIONS, COFLOW CASCADE, DOING WORK =============
  effectFunction: {
    name: "Effect Function",
    title: "Effect of a Dimensionless Input",
    timeUnit: "wk",
    unitY: "level",
    lede: "The building block behind every 'effect of X on Y' multiplier: normalize an input by a reference, then run that ratio through a nonlinear function.",
    stocks: [{ id: "result", label: "Result", init: 50, scale: 130, color: C.acc }],
    params: [
      { id: "input", label: "Input", min: 0, max: 200, step: 5, value: 100, unit: "" },
      { id: "reference", label: "Reference", min: 10, max: 200, step: 5, value: 100, unit: "" },
      { id: "normalFlow", label: "Normal flow", min: 0, max: 30, step: 1, value: 15, unit: "/wk" },
      { id: "drainTau", label: "Drain time", min: 2, max: 20, step: 1, value: 8, unit: "wk" },
    ],
    rates: (s, p) => {
      const relative = p.input / p.reference;
      const effect = (2 * relative) / (1 + relative); // table: 0→0, 1→1, ∞→2
      return { inflow: p.normalFlow * effect, outflow: s.result / p.drainTau };
    },
    derivs: (_s, _p, r) => ({ result: r.inflow - r.outflow }),
    diagram: {
      stocks: { result: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [
        { id: "inflow", pts: [[40, 150], [330, 150]], to: "result", max: 30 },
        { id: "outflow", pts: [[460, 150], [785, 150]], from: "result", max: 30, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "in", label: "Input", x: 110, y: 60 },
        { id: "ef", label: "Effect", x: 380, y: 60 },
        { id: "res", label: "Result", x: 250, y: 175 },
      ],
      links: [
        { from: "in", to: "ef", sign: "+", curve: -22, note: "÷ reference" },
        { from: "ef", to: "res", sign: "+", curve: 22 },
        { from: "res", to: "res", sign: "−", self: true },
      ],
      loops: [{ type: "B", label: "B1", x: 250, y: 248 }],
      caption:
        'The input is divided by a reference to make it <b>dimensionless</b> (input/reference), then a nonlinear table function maps that ratio to a multiplier. Normalizing first is what lets one curve be reused everywhere — judging "1.5× normal" is far easier than judging a raw number.',
    },
    desc: `<p>Almost every nonlinear relationship in a system-dynamics model — effect of schedule pressure on productivity, of inventory coverage on price, of fatigue on quality — is built this same way: take an input, divide by a <b>reference</b> to get a dimensionless ratio, and pass it through a table (lookup) function calibrated so the ratio 1.0 maps to the multiplier 1.0 (normal). Here the curve is <code>2·rel/(1+rel)</code>: zero at zero, 1 at the reference, saturating at 2.</p>
    <div class="eq">relative input = Input / Reference;&nbsp; effect = f(relative input)&nbsp; [f(1) = 1]</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use this pattern for <b>any soft, saturating influence</b> of one variable on a rate. Normalizing by a reference makes the curve portable and easy to calibrate from judgment ("at half-normal staffing, productivity is ~0.7"). It underlies the multipliers in Pricing, Productivity, Quality, Protected Levels and Capacity Utilization.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — effect of bed occupancy (relative to capacity) on care quality / mortality.</li>
      <li><b>Sustainability</b> — effect of price relative to a reference on adoption or demand.</li>
      <li><b>Projects</b> — effect of schedule pressure (required vs. normal rate) on productivity.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    At input = reference, relative = 1, effect = 1, so inflow = normal flow and the result settles at <code>normal × drain time = 15 × 8 = 120</code>. Double the input: relative = 2, effect = <code>2·2/3 ≈ 1.33</code>, inflow rises and the result climbs to ~160. Halve it: effect ≈ 0.67, result falls to ~80.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Dimensionless Input to Function.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 14 — formulating table functions normalized to a reference.</li>
    </ul>`,
  },

  cascadedCoflow: {
    name: "Cascaded Coflow",
    title: "Cascaded Coflow",
    timeUnit: "wk",
    unitY: "$/unit",
    lede: "An attribute riding along a multi-stage chain: as units flow through and value is added at each stage, the average attribute builds up stage by stage.",
    stocks: [
      { id: "wip1", label: "WIP stage 1", init: 32, scale: 60, color: C.acc, chartHidden: true },
      { id: "wip2", label: "WIP stage 2", init: 0, scale: 60, color: C.acc2, chartHidden: true },
      { id: "attr1", label: "cost in 1", init: 32, scale: 200, color: C.acc, hidden: true },
      { id: "attr2", label: "cost in 2", init: 0, scale: 200, color: C.acc2, hidden: true },
      { id: "avg1", label: "Avg cost · stage 1", init: 1, scale: 8, color: C.acc },
      { id: "avg2", label: "Avg cost · stage 2", init: 1, scale: 8, color: C.good },
    ],
    params: [
      { id: "input", label: "Input", min: 0, max: 20, step: 0.5, value: 8, unit: "/wk" },
      { id: "tau", label: "Stage time", min: 1, max: 10, step: 0.5, value: 4, unit: "wk" },
      { id: "inCost", label: "Input cost", min: 0.5, max: 3, step: 0.1, value: 1, unit: "$/u" },
      { id: "valueAdd", label: "Value added", min: 0, max: 2, step: 0.1, value: 0.5, unit: "$/u·wk" },
    ],
    rates: (s, p) => {
      const a1 = s.attr1 / Math.max(s.wip1, 1e-6);
      const a2 = s.attr2 / Math.max(s.wip2, 1e-6);
      const f12 = s.wip1 / p.tau;
      const f23 = s.wip2 / p.tau;
      return { in: p.input, f12, f23, costIn: p.input * p.inCost, cost12: f12 * a1, cost23: f23 * a2, accr1: s.wip1 * p.valueAdd, accr2: s.wip2 * p.valueAdd, a1, a2 };
    },
    derivs: (s, _p, r) => ({
      wip1: r.in - r.f12,
      wip2: r.f12 - r.f23,
      attr1: r.costIn + r.accr1 - r.cost12,
      attr2: r.cost12 + r.accr2 - r.cost23,
      avg1: (r.a1 - s.avg1) / 0.1,
      avg2: (r.a2 - s.avg2) / 0.1,
    }),
    diagram: {
      stocks: { wip1: { x: 150, y: 95, w: 110, h: 100 }, wip2: { x: 470, y: 95, w: 110, h: 100 } },
      flows: [
        { id: "in", pts: [[40, 145], [150, 145]], to: "wip1", max: 20 },
        { id: "f12", pts: [[260, 145], [470, 145]], from: "wip1", to: "wip2", max: 20 },
        { id: "f23", pts: [[580, 145], [790, 145]], from: "wip2", max: 20 },
      ],
    },
    cld: {
      vars: [
        { id: "w1", label: "Avg cost ①", x: 150, y: 135 },
        { id: "w2", label: "Avg cost ②", x: 360, y: 135 },
        { id: "va", label: "Value added", x: 255, y: 55 },
      ],
      links: [
        { from: "w1", to: "w2", sign: "+", curve: -22, note: "carried" },
        { from: "va", to: "w1", sign: "+", curve: 20 },
        { from: "va", to: "w2", sign: "+", curve: 20 },
        { from: "w1", to: "w1", sign: "−", self: true },
        { from: "w2", to: "w2", sign: "−", self: true },
      ],
      loops: [{ type: "B", label: "B1", x: 95, y: 200 }, { type: "B", label: "B2", x: 420, y: 200 }],
      caption:
        'A coflow running alongside a cascade: each stage carries its accumulated attribute (here cost) forward with the material, and adds more. So the <b>average attribute rises stage by stage</b> — stage 2 units are worth more than stage 1 units, which are worth more than raw inputs. <span class="chip chipB">B1</span> <span class="chip chipB">B2</span> Each stage’s average is a balancing loop of its own: it keeps mixing toward the attribute of what flows in, at a pace set by the stage’s residence time.',
    },
    desc: `<p>Extend a coflow across a multi-stage chain. Material flows stage 1 → stage 2 → out; an attribute (cost, embodied quality, accumulated processing) rides with it, carried forward at the current average and topped up by <b>value added</b> in each stage. The result is a rising staircase of average attribute — exactly how unit cost accumulates along a production line, or how embodied effort builds through work-in-process.</p>
    <div class="eq">avg cost (stage i) = total cost (stage i) / WIP (stage i);&nbsp; carried forward + value added each stage</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use a cascaded coflow when an <b>attribute accumulates as material progresses through stages</b> — and you need the average at each stage, not just the endpoints. It's the multi-stage generalization of the Coflow molecule (which tracks one stock's average).</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — cumulative cost or accumulated treatment intensity as a patient moves through care stages.</li>
      <li><b>Sustainability</b> — embodied carbon building up through manufacturing stages of a product.</li>
      <li><b>Operations</b> — work-in-process unit cost rising from raw → sub-assembly → finished (process costing).</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Input units cost $1 each; each stage (4 wk dwell) adds $0.5/unit·wk ⇒ roughly +$2/unit per stage. So stage-1 average cost settles near $3 and stage-2 near $5 — the attribute climbs as material cascades, even though the unit counts in each stage are equal at equilibrium.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Cascaded Coflow (Hines &amp; Traditional).</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 12 — coflows.</li>
    </ul>`,
  },

  doingWork: {
    name: "Doing Work",
    title: "Doing Work (Producing & Backlog)",
    timeUnit: "wk",
    unitY: "tasks",
    lede: "Resources do work at rate = workforce × productivity, draining a backlog and building completed output. The engine that turns people into accomplishment.",
    stocks: [
      { id: "backlog", label: "Backlog", init: 600, scale: 700, color: C.acc2 },
      { id: "output", label: "Completed", init: 0, scale: 700, color: C.good },
    ],
    params: [
      { id: "workforce", label: "Workforce", min: 0, max: 50, step: 1, value: 20, unit: "ppl" },
      { id: "productivity", label: "Productivity", min: 1, max: 10, step: 0.5, value: 4, unit: "/p·wk" },
      { id: "newWork", label: "New work", min: 0, max: 30, step: 1, value: 0, unit: "/wk" },
    ],
    rates: (s, p) => ({ in: p.newWork, accomplishing: Math.min(p.workforce * p.productivity, s.backlog / 0.5) }),
    derivs: (_s, _p, r) => ({ backlog: r.in - r.accomplishing, output: r.accomplishing }),
    diagram: {
      stocks: { backlog: { x: 150, y: 90, w: 120, h: 100 }, output: { x: 560, y: 90, w: 120, h: 100 } },
      flows: [
        { id: "in", pts: [[40, 140], [150, 140]], to: "backlog", max: 30, color: C.pink },
        { id: "accomplishing", pts: [[270, 140], [560, 140]], from: "backlog", to: "output", max: 100, color: C.good },
      ],
    },
    cld: {
      vars: [
        { id: "wf", label: "Workforce", x: 110, y: 60 },
        { id: "ac", label: "Doing work", x: 360, y: 60 },
        { id: "bk", label: "Backlog", x: 235, y: 185 },
      ],
      links: [
        { from: "wf", to: "ac", sign: "+", curve: -22 },
        { from: "bk", to: "ac", sign: "+", curve: 46, note: "if work remains" },
        { from: "ac", to: "bk", sign: "−", curve: 46 },
      ],
      loops: [{ type: "B", label: "B1", x: 297, y: 122 }],
      caption:
        '<span class="chip chipB">B1</span> The work rate is <b>workforce × productivity</b> (the "producing" molecule) — it drains the backlog and accumulates completed output. Backlog protection means the rate can never finish more work than remains; this same rate can equally <i>build inventory</i> or <i>reduce a backlog</i>.',
    },
    desc: `<p>The converter at the heart of every project and operations model: resources turned into accomplishment at <code>rate = workforce × productivity</code>. That rate simultaneously <b>reduces a backlog of work to do</b> and <b>builds a stock of completed output</b> — Hines' "Producing", "Reducing Backlog by Doing Work" and "Building Inventory by Doing Work" are all this one structure. (Rearranged, the same relation gives Resources-from-Action, Ability-from-Action and Estimated Productivity = output ÷ effort.)</p>
    <div class="eq">accomplishing = workforce × productivity&nbsp;(capped by remaining work)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it wherever <b>a resource converts effort into results</b> — staff completing tasks, machines producing units, a crew clearing a queue. Chain several in series for a <b>Doing-Work Cascade</b> (stage A feeds stage B…), or feed its rate from a workforce that itself adjusts (Workforce molecule) and erodes under overtime (Productivity &amp; Fatigue) to assemble a full project model.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — clinicians clearing a caseload; throughput = staff × cases-per-staff.</li>
      <li><b>Sustainability</b> — installers completing retrofits; crews × installs-per-crew.</li>
      <li><b>Operations</b> — production = workers × productivity building finished-goods inventory.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    20 people at productivity 4 do <code>20 × 4 = 80</code> tasks/wk, clearing a 600-task backlog in about 7.5 weeks while completed output rises to 600. Double the workforce and the rate doubles (≈ 4 wk). Set new-work above 80/wk and the backlog grows instead — capacity is then the binding constraint.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Producing / Reducing Backlog by Doing Work / Building Inventory by Doing Work / Doing Work Cascade.</li>
      <li>Forrester, J. W. (1968). "Market Growth as Influenced by Capital Investment." — the workforce-inventory oscillator.</li>
    </ul>`,
  },

  schedulePressure: {
    name: "Schedule Pressure",
    title: "Scheduled Completion & Pressure",
    timeUnit: "wk",
    unitY: "tasks",
    lede: "A fixed deadline plus work remaining creates schedule pressure: the closer the date and the more work left, the harder the team pushes — self-pacing toward the deadline.",
    stocks: [
      { id: "workRemaining", label: "Work remaining", init: 400, scale: 450, color: C.acc },
      { id: "clock", label: "elapsed", init: 0, scale: 50, color: C.acc, hidden: true },
    ],
    params: [
      { id: "scheduled", label: "Scheduled date", min: 5, max: 40, step: 1, value: 15, unit: "wk" },
      { id: "baseRate", label: "Normal work rate", min: 10, max: 50, step: 1, value: 25, unit: "/wk" },
    ],
    rates: (s, p) => {
      const timeLeft = Math.max(p.scheduled - s.clock, 0.25);
      const requiredRate = s.workRemaining / timeLeft;
      const pressure = requiredRate / p.baseRate;
      const effect = Math.max(0.5, Math.min(2, pressure)); // push 0.5×–2× normal
      const workRate = Math.min(p.baseRate * effect, s.workRemaining / 0.25);
      return { workRate, pressure, requiredRate };
    },
    derivs: (_s, _p, r) => ({ workRemaining: -r.workRate, clock: 1 }),
    diagram: {
      stocks: { workRemaining: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [{ id: "workRate", pts: [[460, 150], [785, 150]], from: "workRemaining", max: 50, color: C.good }],
    },
    cld: {
      vars: [
        { id: "wr", label: "Work remaining", x: 130, y: 70 },
        { id: "pr", label: "Schedule pressure", x: 380, y: 70 },
        { id: "rate", label: "Work rate", x: 255, y: 195 },
      ],
      links: [
        { from: "wr", to: "pr", sign: "+", curve: -22, note: "÷ time left" },
        { from: "pr", to: "rate", sign: "+", curve: 22 },
        { from: "rate", to: "wr", sign: "−", curve: -26 },
      ],
      loops: [{ type: "B", label: "B1", x: 255, y: 95 }],
      caption:
        '<span class="chip chipB">B1</span> Required rate = work remaining ÷ time-to-deadline; the ratio of that to the normal rate is <b>schedule pressure</b>, which pushes the work rate up (capped at 2× here). The loop self-paces the team to hit the date — until the cap binds and the deadline slips.',
    },
    desc: `<p>Give a project a fixed scheduled completion date and the gap between <b>required</b> and <b>normal</b> work rates becomes schedule pressure. Mild pressure lifts the work rate (overtime, focus); the loop effectively paces effort to land on the deadline. But effort has a ceiling — when the required rate exceeds what pressure can deliver (here 2× normal), the cap binds and the date slips. Couple this to Productivity &amp; Fatigue and the rework cycle and you get the full, sobering picture of why crunch often fails.</p>
    <div class="eq">schedule pressure = (Work remaining / time to deadline) / normal rate;&nbsp; work rate = normal × effect(pressure)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it whenever a <b>fixed deadline drives effort</b> — projects, deliveries, regulatory or seasonal cut-offs. It explains end-of-project crunch, the limits of "just work harder," and (with fatigue/rework attached) why pushing pressure past a point lengthens rather than shortens the schedule.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — clearing a backlog before a target/reporting date; surge effort as a deadline nears.</li>
      <li><b>Sustainability</b> — racing to a fixed net-zero or compliance date as remaining work mounts.</li>
      <li><b>Projects</b> — software/construction crunch toward a launch date.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    400 tasks, deadline 15 wk, normal rate 25/wk. The required rate starts at <code>400/15 ≈ 27/wk</code> (pressure ≈ 1.07), so the team works slightly above normal and the rate tracks "finish on time." If you tighten the deadline so the required rate would exceed 50/wk (2× cap), the cap binds, work continues at 50/wk, and tasks remain <b>past the scheduled date</b> — the schedule slips.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Scheduled Completion Date / Estimated Completion Date.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i> — schedule pressure in project dynamics.</li>
    </ul>`,
  },

  // ============== MULTI-WAY SPLIT & PROTECTED SEA ANCHOR ==============
  multiSplit: {
    name: "Multidimensional Split",
    title: "Multidimensional Split",
    timeUnit: "mo",
    unitY: "units",
    lede: "One inflow divided across many channels by relative weights that always sum to the whole — the N-way generalization of Split Flow.",
    stocks: [
      { id: "chA", label: "Channel A", init: 0, scale: 120, color: C.acc },
      { id: "chB", label: "Channel B", init: 0, scale: 120, color: C.acc2 },
      { id: "chC", label: "Channel C", init: 0, scale: 120, color: C.good },
    ],
    params: [
      { id: "inflow", label: "Inflow", min: 0, max: 30, step: 1, value: 15, unit: "/mo" },
      { id: "wA", label: "Weight A", min: 0, max: 10, step: 1, value: 5, unit: "" },
      { id: "wB", label: "Weight B", min: 0, max: 10, step: 1, value: 3, unit: "" },
      { id: "wC", label: "Weight C", min: 0, max: 10, step: 1, value: 2, unit: "" },
      { id: "tau", label: "Drain τ", min: 1, max: 12, step: 0.5, value: 5, unit: "mo" },
    ],
    rates: (s, p) => {
      const tot = p.wA + p.wB + p.wC || 1;
      return {
        toA: (p.inflow * p.wA) / tot,
        toB: (p.inflow * p.wB) / tot,
        toC: (p.inflow * p.wC) / tot,
        outA: s.chA / p.tau,
        outB: s.chB / p.tau,
        outC: s.chC / p.tau,
      };
    },
    derivs: (_s, _p, r) => ({ chA: r.toA - r.outA, chB: r.toB - r.outB, chC: r.toC - r.outC }),
    diagram: {
      stocks: { chA: { x: 480, y: 25, w: 110, h: 70 }, chB: { x: 480, y: 120, w: 110, h: 70 }, chC: { x: 480, y: 215, w: 110, h: 70 } },
      flows: [
        { id: "toA", pts: [[110, 155], [320, 155], [320, 60], [480, 60]], to: "chA", max: 30 },
        { id: "toB", pts: [[110, 155], [320, 155], [480, 155]], to: "chB", max: 30, color: C.acc2 },
        { id: "toC", pts: [[110, 155], [320, 155], [320, 250], [480, 250]], to: "chC", max: 30, color: C.good },
        { id: "outA", pts: [[590, 60], [790, 60]], from: "chA", max: 30 },
        { id: "outB", pts: [[590, 155], [790, 155]], from: "chB", max: 30 },
        { id: "outC", pts: [[590, 250], [790, 250]], from: "chC", max: 30 },
      ],
    },
    cld: {
      vars: [
        { id: "in", label: "Inflow", x: 260, y: 55 },
        { id: "a", label: "A", x: 110, y: 175 },
        { id: "b", label: "B", x: 260, y: 175 },
        { id: "c", label: "C", x: 410, y: 175 },
      ],
      links: [
        { from: "in", to: "a", sign: "+", curve: 22, note: "wA/Σ" },
        { from: "in", to: "b", sign: "+", curve: 0 },
        { from: "in", to: "c", sign: "+", curve: -22, note: "wC/Σ" },
        { from: "a", to: "a", sign: "−", self: true },
        { from: "b", to: "b", sign: "−", self: true },
        { from: "c", to: "c", sign: "−", self: true },
      ],
      loops: [{ type: "B", label: "B1", x: 110, y: 245 }, { type: "B", label: "B2", x: 260, y: 245 }, { type: "B", label: "B3", x: 410, y: 245 }],
      caption:
        '<span class="chip chipB">B1</span> <span class="chip chipB">B2</span> <span class="chip chipB">B3</span> The inflow is divided by normalized weights <code>wᵢ / Σw</code>, so the shares always sum to one and the whole inflow is conserved. Each channel drains itself. This is Split Flow extended to any number of destinations (and the basis of Weighted &amp; Nonlinear Split).',
    },
    desc: `<p>The general allocation molecule: one inflow distributed across several channels in proportion to relative weights. Normalizing by the sum of weights guarantees the shares add to one — <b>conservation across all dimensions</b>. Make the weights functions of attractiveness, price or claim strength and you have Weighted, Nonlinear, or Market-Share splits; here they're explicit sliders.</p>
    <div class="eq">to channel i = Inflow × wᵢ / Σ w&nbsp;&nbsp;(Σ shares = 1)</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it whenever one flow feeds <b>three or more parallel destinations</b> and the shares must sum to the whole — budgets across departments, demand across regions/SKUs, patients across services, energy across sources. The two-channel Split Flow is the special case; this handles arbitrary dimensions.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — triage splitting arrivals across ICU / ward / outpatient by acuity weights.</li>
      <li><b>Sustainability</b> — generation split across solar / wind / gas by an evolving energy mix.</li>
      <li><b>Business</b> — marketing budget allocated across channels by expected ROI weights.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Inflow 15/mo with weights 5 : 3 : 2 (Σ = 10) sends 7.5, 4.5, 3.0 to A, B, C — summing exactly to 15. At steady state each channel holds <code>shareᵢ × τ</code> (Little's Law per channel). Slide a weight and the three trade share while the total stays pinned to the inflow.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Multidimensional Split / Weighted Split / Proportional Split.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 13–15 — allocation and share structures.</li>
    </ul>`,
  },

  protectedSeaAnchor: {
    name: "Protected Sea Anchor",
    title: "Protected Sea Anchor & Adjustment",
    timeUnit: "mo",
    unitY: "level",
    lede: "Tie the drifting anchor partly to a credible fundamental and the runaway spiral is cured — the same structure, now stable. Protection is the fix for self-reference.",
    stocks: [
      { id: "anchor", label: "Anchor", init: 100, scale: 280, color: C.acc2 },
      { id: "valueDisp", label: "Value", init: 100, scale: 280, color: C.acc, chartHidden: false },
    ],
    params: [
      { id: "pressure", label: "Adjustment pressure", min: 0.5, max: 2, step: 0.05, value: 1.2, unit: "×" },
      { id: "fundamental", label: "Fundamental", min: 50, max: 150, step: 5, value: 100, unit: "" },
      { id: "protection", label: "Protection", min: 0, max: 1, step: 0.05, value: 0.5, unit: "" },
      { id: "timeToChange", label: "Anchor lag", min: 1, max: 24, step: 1, value: 6, unit: "mo" },
    ],
    rates: (s, p) => {
      const value = s.anchor * p.pressure;
      const target = (1 - p.protection) * value + p.protection * p.fundamental;
      return { value, changeAnchor: (target - s.anchor) / p.timeToChange };
    },
    derivs: (s, p, r) => ({ anchor: r.changeAnchor, valueDisp: (r.value - s.valueDisp) / 0.1 }),
    diagram: {
      stocks: { anchor: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [{ id: "changeAnchor", pts: [[40, 150], [330, 150]], to: "anchor", max: 18 }],
    },
    cld: {
      vars: [
        { id: "an", label: "Anchor", x: 150, y: 150 },
        { id: "v", label: "Value", x: 390, y: 150 },
        { id: "fu", label: "Fundamental", x: 260, y: 60 },
      ],
      links: [
        { from: "an", to: "v", sign: "+", curve: -46 },
        { from: "v", to: "an", sign: "+", curve: -46, note: "drift" },
        { from: "fu", to: "an", sign: "+", curve: 0, note: "protect" },
        { from: "an", to: "an", sign: "−", self: true },
      ],
      loops: [{ type: "R", label: "R1", x: 270, y: 150 }, { type: "B", label: "B1", x: 215, y: 228 }],
      caption:
        '<span class="chip chipR">R1</span> the same self-referential drift as the plain Sea Anchor + <span class="chip chipB">B1</span> a protective pull toward a fundamental. The anchor chases a blend of the value it produces and a credible fundamental; any protection &gt; 0 bounds the spiral, so it settles instead of running away.',
    },
    desc: `<p>The Sea Anchor's flaw is runaway drift — with nothing fundamental to hold it, sustained pressure spirals. The <b>protected</b> version blends the anchor's target between the value it produces and a credible <b>fundamental</b> reference. Even a little protection turns the unbounded reinforcing drift into a stable equilibrium: expectations stay anchored to reality.</p>
    <div class="eq">target = (1 − protection)·value + protection·fundamental;&nbsp; Anchor → target</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it wherever <b>a credible reference disciplines self-referential expectations</b> — a central bank's inflation target anchoring wage/price expectations, a published benchmark anchoring valuations, a standard anchoring "normal." It's the structural argument for why credible anchors prevent spirals; set protection to 0 to recover the unprotected drift.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — clinical targets/guidelines anchoring "acceptable" performance against backsliding baselines.</li>
      <li><b>Sustainability</b> — science-based reference budgets anchoring policy against shifting baselines.</li>
      <li><b>Finance</b> — credible inflation targeting damping wage–price spirals; benchmark-anchored valuations.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Pressure 1.2 with protection 0 spirals without limit (the plain Sea Anchor). Add protection 0.5 toward a fundamental of 100 and the anchor settles at <code>0.5×100 / (1 − 0.5×1.2) = 50 / 0.4 = 125</code> — elevated but <b>bounded</b>. Raise protection toward 1 and it stays near the fundamental however hard the pressure pushes.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Protected Sea Anchor &amp; Adjustment / Protected Sea Anchor Pricing.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 16 — anchoring with fundamentals.</li>
    </ul>`,
  },
  // molecules added from the book's remaining entries (src/data/extra)
  ...MODELS_A,
  ...MODELS_B,
  ...MODELS_C,
  ...MODELS_D,
  ...MODELS_E,
};

export const MODEL_KEYS = Object.keys(MODELS);

export const GROUPS: { title: string; keys: string[] }[] = [
  { title: "Accumulation primitives", keys: ["bathtub", "cascade", "conversion", "split", "broken"] },
  { title: "Delays & decays", keys: ["goToZero", "decay", "residence", "material", "aging", "smooth", "smoothHigher"] },
  { title: "Goal-seeking & control", keys: ["closegap", "stockAdjust", "stockmgmt", "lowVisPipeline", "workforce"] },
  { title: "Expectations & valuation", keys: ["trend", "extrapolation", "weightedAvg", "presentValue"] },
  { title: "Coflows", keys: ["coflow", "coflowExperience", "agingPDY", "cascadedCoflow"] },
  { title: "Growth & limits", keys: ["growth", "logistic", "diffusion"] },
  { title: "Constraints & nonlinearity", keys: ["ceiling", "floor", "capacityUtil", "effectFunction"] },
  { title: "Protected levels & fulfillment", keys: ["protLevel", "protFlow", "backlogFlow", "backlogLevel"] },
  { title: "Anchoring & pricing", keys: ["univariateAnchor", "multivariateAnchor", "seaAnchor", "protectedSeaAnchor", "seaAnchorPricing", "protSeaAnchorPricing", "smoothPricing"] },
  { title: "Allocation & competition", keys: ["propSplit", "weightedSplit", "multiSplit", "nonlinearSplit", "marketshare"] },
  { title: "Resources & actions", keys: ["actionFromResource", "financialFlow", "resourcesFromAction", "workforceFromBudget", "abilityFromAction"] },
  {
    title: "Productivity & projects",
    keys: [
      "prodFatigue", "productivity", "effectFatigue", "quality", "doingWork", "producing", "reducingBacklog", "estProductivity", "desiredWorkforce", "overtime",
      "protByPDY", "buildingInventory", "doingWorkCascade", "cascadeProtByPDY", "reworkCycle", "estRemaining", "estCompletion", "schedulePressure",
    ],
  },
];
