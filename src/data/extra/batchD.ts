// Batch D of Hines' "Molecules of Structure": four molecules that previously lived only inside
// combined pages — Smooth (higher-order), Extrapolation, Weighted Split and Estimated Remaining
// Duration. Same shape as molecules.ts, diagramMeta.ts, lessons.ts and presets.ts — merged into
// the app's records elsewhere.
import type { Model } from "@/data/molecules";
import type { FlowMeta } from "@/data/diagramMeta";
import type { Lesson } from "@/data/lessons";
import type { Preset } from "@/data/presets";

const C = { acc: "#2545ff", acc2: "#d9480f", good: "#0f8a5f", pink: "#c2255c" }; // same series palette as molecules.ts

// Fastest a backlog can be worked off, however many people are assigned to it (weeks).
const MIN_TASK_TIME = 0.5;
// Weighted Split example: every person completes one task a week.
const PRODUCTIVITY = 1;

export const MODELS_D: Record<string, Model> = {
  // ======================= DELAYS & DECAYS =======================
  smoothHigher: {
    name: "Smooth (Higher-Order)",
    title: "Smooth (higher-order) — a cascade of smooths",
    timeUnit: "yr",
    unitY: "stuff",
    lede: "Chain first-order smooths so that each one is the goal of the next. The last one starts slowly, gains speed, then slows for the final approach — people who are slow to notice a change but do catch on completely.",
    stocks: [
      { id: "smooth1", label: "Smooth1", init: 20, scale: 100, color: C.acc },
      { id: "smooth2", label: "Smooth2", init: 20, scale: 100, color: C.acc2 },
      { id: "smooth3", label: "Smooth3", init: 20, scale: 100, color: C.good },
    ],
    params: [
      { id: "goal", label: "Goal", min: 0, max: 100, step: 1, value: 80, unit: "stuff" },
      { id: "time1", label: "Smoothing time 1", min: 0.5, max: 8, step: 0.5, value: 2, unit: "yr" },
      { id: "time2", label: "Smoothing time 2", min: 0.5, max: 8, step: 0.5, value: 2, unit: "yr" },
      { id: "time3", label: "Smoothing time 3", min: 0.5, max: 8, step: 0.5, value: 2, unit: "yr" },
    ],
    rates: (s, p) => {
      const gap1 = p.goal - s.smooth1;
      const gap2 = s.smooth1 - s.smooth2;
      const gap3 = s.smooth2 - s.smooth3;
      return {
        gap1,
        gap2,
        gap3,
        updating1: gap1 / Math.max(0.1, p.time1),
        updating2: gap2 / Math.max(0.1, p.time2),
        updating3: gap3 / Math.max(0.1, p.time3),
      };
    },
    derivs: (_s, _p, r) => ({ smooth1: r.updating1, smooth2: r.updating2, smooth3: r.updating3 }),
    diagram: {
      stocks: {
        smooth1: { x: 345, y: 22, w: 130, h: 56 },
        smooth2: { x: 345, y: 102, w: 130, h: 56 },
        smooth3: { x: 345, y: 182, w: 130, h: 56 },
      },
      flows: [
        { id: "updating1", pts: [[40, 50], [345, 50]], to: "smooth1", max: 30 },
        { id: "updating2", pts: [[40, 130], [345, 130]], to: "smooth2", max: 15, color: C.acc2 },
        { id: "updating3", pts: [[40, 210], [345, 210]], to: "smooth3", max: 10, color: C.good },
      ],
    },
    cld: {
      vars: [
        { id: "gl", label: "Goal", x: 60, y: 135 },
        { id: "s1", label: "Smooth1", x: 180, y: 135 },
        { id: "s2", label: "Smooth2", x: 315, y: 135 },
        { id: "s3", label: "Smooth3", x: 450, y: 135 },
      ],
      links: [
        { from: "gl", to: "s1", sign: "+", curve: 0, note: "gap 1" },
        { from: "s1", to: "s2", sign: "+", curve: 0, note: "gap 2" },
        { from: "s2", to: "s3", sign: "+", curve: 0, note: "gap 3" },
        { from: "s1", to: "s1", sign: "−", self: true },
        { from: "s2", to: "s2", sign: "−", self: true },
        { from: "s3", to: "s3", sign: "−", self: true },
      ],
      loops: [{ type: "B", label: "B1", x: 180, y: 60 }, { type: "B", label: "B2", x: 315, y: 60 }, { type: "B", label: "B3", x: 450, y: 60 }],
      caption:
        '<span class="chip chipB">B1</span> <span class="chip chipB">B2</span> <span class="chip chipB">B3</span> Three gap-closing loops in a row. Each smooth closes the gap to the one before it, and information only moves forward: nothing feeds back from Smooth3 to Smooth1. Right after a step in the goal Smooth2 has not moved, so <b>gap 3 is zero</b> and Smooth3 starts flat — the origin of the S-shape.',
    },
    desc: `<p>Hines' <b>cascaded smooth</b>. A higher-order smooth is a cascade of two or more first-order smooths in which <b>each smooth becomes the goal of the one that follows</b>. The stock of the final smooth is usually treated as the output — the variable that is ultimately adjusting toward the goal. This page draws the cascade itself, so the three curves are a first-, a second- and a third-order smooth of the same goal: Smooth1 chases at once, Smooth3 hesitates, accelerates and then eases in.</p>
    <div class="eq">Smooth1 = INTEG(Gap1 / smoothing time1),&nbsp; Gap1 = goal − Smooth1<br/>Smooth2 = INTEG(Gap2 / smoothing time2),&nbsp; Gap2 = Smooth1 − Smooth2<br/>Smooth3 = INTEG(Gap3 / smoothing time3),&nbsp; Gap3 = Smooth2 − Smooth3</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it when an adjustment should <b>start out slowly, gain speed, and then slow for the final approach</b> — when people are slow to perceive a change at first but ultimately do catch on completely. The usual case gives every stage the same smoothing time, the aggregate lag divided by the order; the average lag of the output is the sum of the stage times. Because it is an information delay nothing is conserved: each flow comes from a cloud, not from the stock before it. Hines' cascaded coflow is built on it.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — a change in true infection rates passing through testing, then reporting, then public belief before behaviour responds.</li>
      <li><b>Business</b> — a shift in demand perceived first by sales, then by planning, then by the board that approves capacity.</li>
      <li><b>Sustainability</b> — evidence of a changing climate filtering from measurement to scientific consensus to public concern.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    All three smooths start at 20, the goal is 80 and each smoothing time is 2 years. After 2 years Smooth1 has closed about 64% of the gap (≈ 58.5), Smooth2 about 26% (≈ 35.8) and Smooth3 only about 8% (≈ 24.5): it has barely started. Smooth3 is half-way (50) at about 5.3 years, against about 1.4 years for Smooth1, and all three are within one unit of the goal by year 17. Set the times to 5, 0.5 and 0.5 — the same 6-year total — and Smooth3 loses most of its S-shape, because one long stage dominates the cascade.</div>
    <h4>Caveats</h4>
    <p>The book initialises every smooth in equilibrium (Smooth1 at the goal, Smooth2 at Smooth1, and so on). Here they start at 20 so that there is a step to respond to.</p>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Smooth (higher-order).</li>
    </ul>`,
  },

  // ======================= EXPECTATIONS =======================
  extrapolation: {
    name: "Extrapolation",
    title: "Extrapolation (forecast from the fractional trend)",
    timeUnit: "yr",
    unitY: "quantity",
    lede: "Take the latest observation and grow it by the perceived fractional trend, first across the perception lag to reach today, then across the forecast horizon to reach the future.",
    stocks: [
      { id: "actual", label: "Actual quantity", init: 100, scale: 600, color: C.acc },
      { id: "perceived", label: "Perceived quantity", init: 100, scale: 600, color: C.acc2 },
      { id: "historical", label: "Historical quantity", init: 100, scale: 600, color: C.pink, chartHidden: true },
      { id: "extrapolatedDisp", label: "Extrapolated quantity", init: 100, scale: 600, color: C.good, chartHidden: false },
    ],
    params: [
      { id: "growth", label: "Growth of actual quantity", min: -5, max: 8, step: 0.5, value: 3, unit: "%/yr" },
      { id: "timeToPerceive", label: "Time to perceive quantity", min: 0.5, max: 6, step: 0.5, value: 2, unit: "yr" },
      { id: "trendDuration", label: "Duration over which to calculate trend", min: 1, max: 10, step: 0.5, value: 3, unit: "yr" },
      { id: "forecastHorizon", label: "Forecast horizon", min: 0, max: 10, step: 0.5, value: 5, unit: "yr" },
    ],
    rates: (s, p) => {
      const duration = Math.max(0.1, p.trendDuration);
      const fractionalTrend = (s.perceived - s.historical) / (Math.max(1e-6, s.historical) * duration);
      const extrapolated = s.perceived * (1 + fractionalTrend * (p.timeToPerceive + p.forecastHorizon));
      return {
        fractionalTrend,
        extrapolated,
        changeInActual: s.actual * (p.growth / 100),
        perceiving: (s.actual - s.perceived) / Math.max(0.1, p.timeToPerceive),
        changeInHistorical: (s.perceived - s.historical) / duration,
      };
    },
    derivs: (s, _p, r) => ({
      actual: r.changeInActual,
      perceived: r.perceiving,
      historical: r.changeInHistorical,
      extrapolatedDisp: (r.extrapolated - s.extrapolatedDisp) / 0.1,
    }),
    diagram: {
      stocks: {
        actual: { x: 345, y: 22, w: 130, h: 56 },
        perceived: { x: 345, y: 102, w: 130, h: 56 },
        historical: { x: 345, y: 182, w: 130, h: 56 },
      },
      flows: [
        { id: "changeInActual", pts: [[40, 50], [345, 50]], to: "actual", max: 20 },
        { id: "perceiving", pts: [[40, 130], [345, 130]], to: "perceived", max: 20, color: C.acc2 },
        { id: "changeInHistorical", pts: [[40, 210], [345, 210]], to: "historical", max: 20, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "act", label: "Actual", x: 70, y: 70 },
        { id: "per", label: "Perceived", x: 240, y: 70 },
        { id: "his", label: "Historical", x: 430, y: 70 },
        { id: "ft", label: "Fractional trend", x: 335, y: 160 },
        { id: "fh", label: "Forecast horizon", x: 82, y: 160 },
        { id: "ex", label: "Extrapolated quantity", x: 200, y: 240 },
      ],
      links: [
        { from: "act", to: "per", sign: "+", curve: 0 },
        { from: "per", to: "his", sign: "+", curve: 0 },
        { from: "per", to: "per", sign: "−", self: true },
        { from: "his", to: "his", sign: "−", self: true },
        { from: "per", to: "ft", sign: "+", curve: 12 },
        { from: "his", to: "ft", sign: "−", curve: -12 },
        { from: "per", to: "ex", sign: "+", curve: 0 },
        { from: "ft", to: "ex", sign: "+", curve: -12 },
        { from: "fh", to: "ex", sign: "+", curve: 0 },
      ],
      loops: [{ type: "B", label: "B1", x: 312, y: 32 }, { type: "B", label: "B2", x: 498, y: 32 }],
      caption:
        '<span class="chip chipB">B1</span> the perceived quantity is a smooth of the actual one; <span class="chip chipB">B2</span> the historical quantity is a smooth of the perceived one. Their gap, as a fraction of the historical quantity per year, is the <b>fractional trend</b> — that much is the Trend molecule. Extrapolation adds the last step: perceived quantity × (1 + trend × (perception time + forecast horizon)). The forecast feeds nothing back until you use it in a decision.',
    },
    desc: `<p>Extrapolation works on the <b>fractional trend</b>, the output of a Trend molecule. The forecast is simply the current observation — the perceived quantity — multiplied by a factor for how much it will have grown by the end of the forecast horizon. The observation is necessarily lagged, so the factor covers two stretches of time: the <b>time to perceive</b> brings the observation forward to today, and the <b>forecast horizon</b> carries it from today into the future. Hines notes that this degree of exactness is unknown in the literature and unlikely to characterise real trend extrapolations.</p>
    <div class="eq">ExtrapolatedQuantity = PerceivedQuantity × (1 + FractionalTrend × (TimeToPerceiveQuantity + ForecastHorizon))<br/>FractionalTrend = (PerceivedQuantity − HistoricalQuantity) / (HistoricalQuantity × DurationOverWhichToCalculateTrend)<br/>PerceivedQuantity = SMOOTH(ActualQuantity, TimeToPerceiveQuantity);&nbsp; d(HistoricalQuantity)/dt = (PerceivedQuantity − HistoricalQuantity) / Duration</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it when a decision has to be sized for <b>conditions at some point in the future</b>: how much to order, or how much construction to start, so that the right amount arrives when the order is filled or the plant comes on line. Set the forecast horizon to that delivery or construction delay. The forecast is accurate for a quantity that grows exponentially; it lags and then overshoots whenever the trend changes.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Operations</b> — ordering today for the demand expected when the supplier delivers.</li>
      <li><b>Healthcare</b> — commissioning beds or training places for the patient numbers expected when they become available.</li>
      <li><b>Sustainability</b> — starting generating capacity now for the electricity demand expected when it is commissioned.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    The actual quantity starts at 100 and grows 3% a year; everything starts in equilibrium, so the trend starts at zero and takes about a decade to be recognised. By year 30 the actual quantity is about 246, the perceived quantity about 232 (2 years behind) and the historical quantity about 213, giving a fractional trend of <code>(232 − 213) / (213 × 3) ≈ 3.0%</code> a year. The 5-year forecast is <code>232 × (1 + 0.03 × (2 + 5)) ≈ 280</code>. Five years later the actual quantity turns out to be about 285: the forecast is about 2% low, because the molecule extrapolates in a straight line while the quantity compounds. Drop the horizon to 0 and the extrapolation sits on top of today's actual quantity, not on the lagging perception.</div>
    <h4>Caveats</h4>
    <p>Extrapolation inside an otherwise oscillatory system will often make it more oscillatory — which may be realistic. The molecule uses a <b>linear</b> extrapolation, which is roughly correct; the precise forecast would bring the perception lag forward linearly and then compound continuously up to the horizon. In this app the actual quantity is a stock growing at a constant fractional rate, added so there is something to forecast.</p>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Extrapolation.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 16 — forecasts and the TREND function.</li>
    </ul>`,
  },

  // ======================= ALLOCATION =======================
  weightedSplit: {
    name: "Weighted Split",
    title: "Weighted Split (managerial weights on three backlogs)",
    timeUnit: "wk",
    unitY: "tasks",
    lede: "A Proportional Split in which each claim is first multiplied by a managerial weight, so preference or bias tilts the allocation away from what the claims alone would give.",
    stocks: [
      { id: "tasksA", label: "Tasks A", init: 30, scale: 60, color: C.acc },
      { id: "tasksB", label: "Tasks B", init: 30, scale: 60, color: C.acc2 },
      { id: "tasksC", label: "Tasks C", init: 30, scale: 60, color: C.good },
    ],
    params: [
      { id: "resources", label: "Resources", min: 2, max: 24, step: 1, value: 12, unit: "people" },
      { id: "newTasks", label: "New tasks (each type)", min: 0, max: 8, step: 0.5, value: 4, unit: "/wk" },
      { id: "weightA", label: "Weight for A", min: 0, max: 4, step: 0.25, value: 2, unit: "dmnl" },
      { id: "weightB", label: "Weight for B", min: 0, max: 4, step: 0.25, value: 1, unit: "dmnl" },
      { id: "weightC", label: "Weight for C", min: 0, max: 4, step: 0.25, value: 1, unit: "dmnl" },
    ],
    rates: (s, p) => {
      const wsA = s.tasksA * p.weightA; // WeightedStrengthOfA'sClaim
      const wsB = s.tasksB * p.weightB;
      const wsC = s.tasksC * p.weightC;
      const total = wsA + wsB + wsC; // TotalClaimStrength
      const rel = (x: number) => (total > 1e-9 ? x / total : 1 / 3); // RelativeStrengthOfClaim
      const resA = p.resources * rel(wsA);
      const resB = p.resources * rel(wsB);
      const resC = p.resources * rel(wsC);
      return {
        resA,
        resB,
        resC,
        inA: p.newTasks,
        inB: p.newTasks,
        inC: p.newTasks,
        doneA: Math.min(resA * PRODUCTIVITY, s.tasksA / MIN_TASK_TIME),
        doneB: Math.min(resB * PRODUCTIVITY, s.tasksB / MIN_TASK_TIME),
        doneC: Math.min(resC * PRODUCTIVITY, s.tasksC / MIN_TASK_TIME),
      };
    },
    derivs: (_s, _p, r) => ({ tasksA: r.inA - r.doneA, tasksB: r.inB - r.doneB, tasksC: r.inC - r.doneC }),
    diagram: {
      stocks: { tasksA: { x: 355, y: 20, w: 110, h: 60 }, tasksB: { x: 355, y: 100, w: 110, h: 60 }, tasksC: { x: 355, y: 180, w: 110, h: 60 } },
      flows: [
        { id: "inA", pts: [[40, 50], [355, 50]], to: "tasksA", max: 8 },
        { id: "inB", pts: [[130, 130], [355, 130]], to: "tasksB", max: 8, color: C.acc2 },
        { id: "inC", pts: [[40, 210], [355, 210]], to: "tasksC", max: 8, color: C.good },
        { id: "doneA", pts: [[465, 50], [785, 50]], from: "tasksA", max: 8 },
        { id: "doneB", pts: [[465, 130], [695, 130]], from: "tasksB", max: 8, color: C.acc2 },
        { id: "doneC", pts: [[465, 210], [785, 210]], from: "tasksC", max: 8, color: C.good },
      ],
    },
    cld: {
      vars: [
        { id: "ta", label: "Tasks A", x: 60, y: 110 },
        { id: "wa", label: "Weight for A", x: 230, y: 35 },
        { id: "ws", label: "Weighted claim of A", x: 230, y: 110 },
        { id: "ot", label: "Other weighted claims", x: 400, y: 40 },
        { id: "rel", label: "Relative strength of A", x: 400, y: 180 },
        { id: "ra", label: "Resources for A", x: 250, y: 240 },
        { id: "da", label: "Completing A", x: 70, y: 240 },
      ],
      links: [
        { from: "ta", to: "ws", sign: "+", curve: 0 },
        { from: "wa", to: "ws", sign: "+", curve: 0 },
        { from: "ws", to: "rel", sign: "+", curve: -14 },
        { from: "ot", to: "rel", sign: "−", curve: 0 },
        { from: "rel", to: "ra", sign: "+", curve: -14 },
        { from: "ra", to: "da", sign: "+", curve: 0 },
        { from: "da", to: "ta", sign: "−", curve: 0 },
      ],
      loops: [{ type: "B", label: "B1", x: 200, y: 178 }],
      caption:
        '<span class="chip chipB">B1</span> As in a Proportional Split, a bigger backlog is a stronger claim, wins more people and is worked down faster. The new arrow is <b>Weight for A</b>: it scales the claim before the shares are worked out, so a favoured task wins more people than its backlog alone would earn. The loop then runs that backlog down until its <i>weighted</i> claim is back in line with the others.',
    },
    desc: `<p>This molecule adds a <b>managerial weight</b> to the Proportional Split. Each claim's strength is multiplied by its weight, and the resource is divided according to each <i>weighted</i> strength relative to the total of the weighted strengths. The weights stand for managerial preferences — conscious or unconscious, logical or illogical — and can be constants, as here, or respond to other conditions in the model. The example is the book's: a flexible workforce divided among three kinds of task, where each backlog is the claim.</p>
    <div class="eq">ResourcesForA = Resources × RelativeStrengthOfA'sClaim<br/>RelativeStrengthOfA'sClaim = WeightedStrengthOfA'sClaim / TotalClaimStrength<br/>WeightedStrengthOfA'sClaim = StrengthOfA'sClaim × WeightForA<br/>TotalClaimStrength = sum of the three weighted strengths</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it when an allocation follows the claims <b>but not even-handedly</b>: some claimant is favoured, or should be. With all weights equal it is exactly a Proportional Split. Hines' example is an R&amp;D effort in which managers weight commercialization more heavily as unit sales decline — a weight that responds to the state of the model.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>R&amp;D</b> — engineers split across research, development and commercialization, with commercialization favoured when sales are falling.</li>
      <li><b>Healthcare</b> — theatre sessions shared across specialties by waiting list, with cancer lists given extra weight.</li>
      <li><b>Sustainability</b> — scarce water shared among users by request, with drinking water weighted above irrigation.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Twelve people, three backlogs of 30 tasks, 4 new tasks a week of each type. With A weighted 2 and the others 1 the weighted claims are 60, 30 and 30, so A gets <code>12 × 60/120 = 6</code> people and B and C get 3 each — an unweighted split would give 4 each. A is now completing 6 a week against 4 arriving, so it shrinks, while B and C grow. Capacity equals total arrivals, so the total stays at 90 and the backlogs settle where the weighted claims are equal: <b>18, 36 and 36</b> (<code>18 × 2 = 36 × 1</code>), with 4 people on each. The bias does not change long-run staffing, which has to match arrivals; it decides <b>whose work waits</b>.</div>
    <h4>Caveats</h4>
    <p>As with the Proportional Split, the structure allocates <b>all</b> of the resource even if that over-allocates to one or more claims. To keep stocks non-negative this app caps each completion rate at <code>Tasks / 0.5 wk</code>, and fixes productivity at one task per person per week; neither is part of the molecule.</p>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Weighted Split.</li>
    </ul>`,
  },

  // ======================= PRODUCTIVITY & PROJECTS =======================
  estRemaining: {
    name: "Estimated Remaining Duration",
    title: "Estimated Remaining Duration (work to do ÷ anticipated rate)",
    timeUnit: "wk",
    unitY: "weeks",
    lede: "The time left on a job is the work still to do divided by the rate at which we anticipate doing it. The estimate is only as good as the anticipated rate.",
    stocks: [
      { id: "workToDo", label: "Work to do (sq ft)", init: 6000, scale: 6000, color: C.acc, chartHidden: true },
      { id: "durationDisp", label: "Duration till complete", init: 24, scale: 40, color: C.acc2, chartHidden: false },
    ],
    params: [
      { id: "anticipatedRate", label: "Anticipated rate of accomplishing work", min: 50, max: 400, step: 10, value: 250, unit: "sq ft/wk" },
      { id: "actualRate", label: "Actual rate of accomplishing work", min: 0, max: 400, step: 10, value: 200, unit: "sq ft/wk" },
    ],
    rates: (s, p) => ({
      durationTillComplete: s.workToDo / Math.max(1, p.anticipatedRate),
      accomplishing: s.workToDo > 0 ? p.actualRate : 0,
    }),
    derivs: (s, _p, r) => ({ workToDo: -r.accomplishing, durationDisp: (r.durationTillComplete - s.durationDisp) / 0.1 }),
    diagram: {
      stocks: { workToDo: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [{ id: "accomplishing", pts: [[460, 150], [785, 150]], from: "workToDo", max: 400, color: C.good }],
    },
    cld: {
      vars: [
        { id: "acc", label: "Accomplishing work", x: 120, y: 60 },
        { id: "wtd", label: "Work to do", x: 120, y: 195 },
        { id: "ant", label: "Anticipated rate", x: 380, y: 60 },
        { id: "dur", label: "Duration till complete", x: 380, y: 195 },
      ],
      links: [
        { from: "acc", to: "wtd", sign: "−", curve: 0 },
        { from: "wtd", to: "dur", sign: "+", curve: 0 },
        { from: "ant", to: "dur", sign: "−", curve: 0 },
      ],
      loops: [],
      caption:
        'No stocks in the molecule and no loops: <b>Duration till complete</b> is a ratio, more work to do lengthening it and a higher anticipated rate shortening it. The Work to do stock and the flow draining it are added here so the estimate has something to track. Nothing feeds back from the estimate until it is compared with a deadline — the Schedule Pressure molecule.',
    },
    desc: `<p>The estimated duration to completion is simply the amount of work left divided by the rate at which we can do the work. The molecule has no stock; here the work to do is a stock — square feet still to paint, in the book's units — drained by the <b>actual</b> rate of accomplishing work, while the estimate uses the <b>anticipated</b> rate. Keeping the two apart shows what the estimate can and cannot tell you: when the crew is slower than anticipated, each week that passes takes less than a week off the estimate. The chart shows the estimate; the stock is in the diagram.</p>
    <div class="eq">DurationTillComplete = WorkToDo / AnticipatedRateOfAccomplishingWork</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it in project models wherever someone has to judge <b>how long the remaining work will take</b>. Add the current time and it becomes the Estimated Completion Date. Hines also points out its kinship with Residence Time: the same ratio can be read as the estimated average time an individual task spends in the stock of work to do, in which case it deserves a different name.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Projects</b> — weeks left on a construction or software job from the work outstanding and the planned rate of progress.</li>
      <li><b>Healthcare</b> — how long a waiting list will take to clear at the planned number of procedures per week.</li>
      <li><b>Sustainability</b> — years left in a retrofit programme from homes outstanding and the planned installation rate.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    There are 6,000 square feet to do and the crew anticipates 250 a week, so the estimate is <code>6000 / 250 = 24</code> weeks. They actually manage 200 a week. Each week takes only <code>200 / 250 = 0.8</code> weeks off the estimate, so at week 24 — the date first promised — 1,200 square feet remain and the estimate still reads <code>1200 / 250 = 4.8</code> weeks. The job really finishes at week <code>6000 / 200 = 30</code>. Set the anticipated rate to 200 as well and the estimate starts at 30 and falls exactly one week per week.</div>
    <h4>Caveats</h4>
    <p>If people or productivity can be zero, protect against dividing by zero in the equation for the duration; the anticipated-rate slider here stops at 50 for that reason.</p>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Estimated Remaining Duration.</li>
    </ul>`,
  },
};

export const FLOW_META_D: Record<string, Record<string, FlowMeta>> = {
  smoothHigher: {
    updating1: { name: "updating smooth1", eq: "(goal − Smooth1) / smoothing time 1", in: ["goal", "smooth1", "time1"], loop: "B" },
    updating2: { name: "updating smooth2", eq: "(Smooth1 − Smooth2) / smoothing time 2", in: ["smooth1", "smooth2", "time2"], loop: "B" },
    updating3: { name: "updating smooth3", eq: "(Smooth2 − Smooth3) / smoothing time 3", in: ["smooth2", "smooth3", "time3"], loop: "B" },
  },
  extrapolation: {
    changeInActual: { name: "change in actual quantity", eq: "Actual quantity × growth / 100", in: ["actual", "growth"], loop: "R" },
    perceiving: {
      name: "change in perceived quantity",
      eq: "(Actual quantity − Perceived quantity) / time to perceive quantity",
      in: ["actual", "perceived", "timeToPerceive"],
      loop: "B",
    },
    changeInHistorical: {
      name: "change in historical quantity",
      eq: "(Perceived quantity − Historical quantity) / duration over which to calculate trend",
      in: ["perceived", "historical", "trendDuration"],
      loop: "B",
    },
  },
  weightedSplit: {
    inA: { name: "new tasks A", eq: "new tasks", in: ["newTasks"] },
    inB: { name: "new tasks B", eq: "new tasks", in: ["newTasks"] },
    inC: { name: "new tasks C", eq: "new tasks", in: ["newTasks"] },
    doneA: { name: "completing A", eq: "MIN(resources × (A × weight A / total weighted claim), A / 0.5)", in: ["tasksA", "resources", "weightA"], loop: "B" },
    doneB: { name: "completing B", eq: "MIN(resources × (B × weight B / total weighted claim), B / 0.5)", in: ["tasksB", "resources", "weightB"], loop: "B" },
    doneC: { name: "completing C", eq: "MIN(resources × (C × weight C / total weighted claim), C / 0.5)", in: ["tasksC", "resources", "weightC"], loop: "B" },
  },
  estRemaining: {
    accomplishing: { name: "accomplishing work", eq: "actual rate of accomplishing work (0 once Work to do is empty)", in: ["workToDo", "actualRate"] },
  },
};

export const DIAGRAM_EXTRA_D: Record<string, { stocks: [string, string][]; aux?: [string, string][] }> = {
  smoothHigher: {
    stocks: [
      ["Smooth1", "INTEG(Gap1 / smoothing time 1, 20)"],
      ["Smooth2", "INTEG(Gap2 / smoothing time 2, 20)"],
      ["Smooth3", "INTEG(Gap3 / smoothing time 3, 20)"],
    ],
    aux: [
      ["Gap1", "goal − Smooth1"],
      ["Gap2", "Smooth1 − Smooth2"],
      ["Gap3", "Smooth2 − Smooth3"],
      ["average lag of Smooth3", "smoothing time 1 + smoothing time 2 + smoothing time 3"],
    ],
  },
  extrapolation: {
    stocks: [
      ["Actual quantity", "INTEG(Actual quantity × growth / 100, 100)"],
      ["Perceived quantity", "INTEG((Actual quantity − Perceived quantity) / time to perceive quantity, 100)"],
      ["Historical quantity", "INTEG((Perceived quantity − Historical quantity) / duration over which to calculate trend, 100)"],
    ],
    aux: [
      ["Extrapolated quantity", "Perceived quantity × (1 + fractional trend × (time to perceive quantity + forecast horizon))"],
      ["fractional trend", "(Perceived quantity − Historical quantity) / (Historical quantity × duration over which to calculate trend)"],
    ],
  },
  weightedSplit: {
    stocks: [
      ["Tasks A", "INTEG(new tasks − completing A, 30)"],
      ["Tasks B", "INTEG(new tasks − completing B, 30)"],
      ["Tasks C", "INTEG(new tasks − completing C, 30)"],
    ],
    aux: [
      ["resources for A", "Resources × relative strength of A's claim"],
      ["relative strength of A's claim", "weighted strength of A's claim / total claim strength"],
      ["weighted strength of A's claim", "Tasks A × weight for A"],
      ["total claim strength", "sum of the three weighted strengths"],
      ["productivity", "1 task/person/wk"],
    ],
  },
  estRemaining: {
    stocks: [["Work to do", "INTEG(−accomplishing work, 6000)"]],
    aux: [
      ["Duration till complete", "Work to do / anticipated rate of accomplishing work"],
      ["actual completion", "week 6000 / actual rate of accomplishing work"],
    ],
  },
};

export const LESSONS_D: Record<string, Lesson> = {
  smoothHigher: {
    q: "The goal steps from 20 to 80 and each of the three smoothing times is 2 years. After 2 years Smooth1 has closed about 64% of the gap. Roughly how much has Smooth3 closed?",
    options: ["about 64%", "about 26%", "about 8%", "nothing at all"],
    answer: 2,
    explain: "Smooth3 chases Smooth2, which chases Smooth1, so at first there is no gap for it to close. After one stage time a third-order smooth has covered only about 8% of the step (Smooth3 ≈ 24.5); Smooth2 is at about 26%. That slow start is the point of a higher-order smooth.",
    preset: { goal: 80, time1: 2, time2: 2, time3: 2 },
  },
  extrapolation: {
    q: "The actual quantity grows steadily at 3% a year and takes 2 years to perceive. With the forecast horizon set to 0, the extrapolated quantity settles…",
    options: ["on the perceived quantity, 2 years behind", "on today's actual quantity", "well above today's actual quantity", "at zero"],
    answer: 1,
    explain: "With a zero horizon the factor is 1 + trend × time to perceive, which is exactly what is needed to carry the lagged observation forward to today. The extrapolation is a 'nowcast' of the actual quantity, about 6% above the perceived one.",
    preset: { growth: 3, timeToPerceive: 2, trendDuration: 3, forecastHorizon: 0 },
  },
  weightedSplit: {
    q: "Twelve people share three backlogs of 30 tasks; 4 new tasks of each type arrive every week. A is weighted 2, B and C are weighted 1. Backlog A settles near…",
    options: ["30", "18", "15", "0"],
    answer: 1,
    explain: "Arrivals are equal, so in the end each task needs 4 people — an equal share, which requires equal weighted claims: A × 2 = B × 1 = C × 1. The total stays at 90, so A = 18 and B = C = 36. The weight moves the queue, not the long-run staffing.",
    preset: { resources: 12, newTasks: 4, weightA: 2, weightB: 1, weightC: 1 },
  },
  estRemaining: {
    q: "6,000 sq ft to do; the crew anticipates 250 sq ft/wk (estimate: 24 weeks) but actually manages 200. At week 24, what does Duration till complete read?",
    options: ["0 weeks", "4.8 weeks", "6 weeks", "24 weeks"],
    answer: 1,
    explain: "After 24 weeks 4,800 sq ft are done and 1,200 remain. The estimate still divides by the anticipated rate: 1200 / 250 = 4.8 weeks. The truth, at the actual rate, is 1200 / 200 = 6 weeks.",
    preset: { anticipatedRate: 250, actualRate: 200 },
  },
};

export const PRESETS_D: Record<string, Preset[]> = {
  smoothHigher: [
    { label: "Equal stages (2, 2, 2)", params: { goal: 80, time1: 2, time2: 2, time3: 2 } },
    { label: "One long stage (5, 0.5, 0.5)", params: { goal: 80, time1: 5, time2: 0.5, time3: 0.5 } },
    { label: "Slow to catch on (4, 4, 4)", params: { goal: 80, time1: 4, time2: 4, time3: 4 } },
  ],
  extrapolation: [
    { label: "5-year forecast", params: { growth: 3, timeToPerceive: 2, trendDuration: 3, forecastHorizon: 5 } },
    { label: "Nowcast (horizon 0)", params: { growth: 3, timeToPerceive: 2, trendDuration: 3, forecastHorizon: 0 } },
    { label: "Decline (−3%/yr)", params: { growth: -3, timeToPerceive: 2, trendDuration: 3, forecastHorizon: 5 } },
  ],
  weightedSplit: [
    { label: "A favoured (weight 2)", params: { resources: 12, newTasks: 4, weightA: 2, weightB: 1, weightC: 1 } },
    { label: "Equal weights (proportional)", params: { resources: 12, newTasks: 4, weightA: 1, weightB: 1, weightC: 1 } },
    { label: "A neglected (weight 0.5)", params: { resources: 12, newTasks: 4, weightA: 0.5, weightB: 1, weightC: 1 } },
  ],
  estRemaining: [
    { label: "Slower than anticipated", params: { anticipatedRate: 250, actualRate: 200 } },
    { label: "As anticipated", params: { anticipatedRate: 200, actualRate: 200 } },
    { label: "Faster than anticipated", params: { anticipatedRate: 150, actualRate: 200 } },
  ],
};

// Immediate parents, using app keys. Follows the book's "Immediate Parents".
export const LINEAGE_D: Record<string, string[]> = {
  smoothHigher: ["smooth", "cascade"], // Smooth (first order), Cascaded levels
  extrapolation: ["trend"],
  weightedSplit: ["propSplit"],
  estRemaining: ["reducingBacklog"], // Reducing backlog by doing work (other batch)
};
