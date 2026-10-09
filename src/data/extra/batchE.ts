// Batch E — Hines, "Molecules of Structure": the five molecules that previously lived only
// inside the combined "Productivity, Overtime & Fatigue" and "Doing Work" pages.
// Productivity (PDY), Effect of Fatigue, Overtime, Producing, Reducing Backlog by Doing Work.
import type { Model } from "@/data/molecules";
import type { FlowMeta } from "@/data/diagramMeta";
import type { Lesson } from "@/data/lessons";
import type { Preset } from "@/data/presets";

const C = { acc: "#2545ff", acc2: "#d9480f", good: "#0f8a5f", pink: "#c2255c" }; // same series palette as molecules.ts
const GREY = "#8b98a9"; // reference / bookkeeping series

const DT = 0.1; // engine step — used only by display-only stocks and the overdraft bookkeeping
const EPS = 1e-6; // divide-by-zero guard
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ---- illustrative "user defined functions" for Productivity (input 1 = normal → effect 1) ----
const pFatigue = (f: number) => clamp(1 - 0.5 * (f - 1), 0.4, 1.1); // tired people work slower
const pPressure = (sp: number) => clamp(1 + 0.4 * (sp - 1), 0.7, 1.3); // pressure makes people work FASTER
const pAdequacy = (w: number) => clamp(w, 0, 1); // not enough work on hand → idle time
const pSkill = (k: number) => clamp(0.4 + 0.6 * k, 0.4, 1.3);
const productivityOf = (p: Record<string, number>) =>
  p.normalPDY * pFatigue(p.fatigue) * pPressure(p.sched) * pAdequacy(p.adequacy) * pSkill(p.skill);
// Effect of fatigue on PDY f: 1 at Fatigue = 1, falling by `slope` per unit of fatigue above 1.
const fatigueEffect = (fatigue: number, slope: number) => clamp(1 - slope * (fatigue - 1), 0, 1.2);

export const MODELS_E: Record<string, Model> = {
  productivity: {
    name: "Productivity (PDY)",
    title: "Productivity (PDY)",
    timeUnit: "mo",
    unitY: "widgets (one worker)",
    lede: "How fast one worker produces: a normal productivity multiplied by the effects of fatigue, schedule pressure, work adequacy and average skill. Each effect is 1 under normal conditions.",
    stocks: [
      { id: "made", label: "Made by one worker", init: 0, scale: 300, color: C.acc },
      { id: "ref", label: "At normal PDY", init: 0, scale: 300, color: GREY },
      { id: "pdy", label: "Productivity (/p·mo)", init: 4.0392, scale: 10, color: C.good, chartHidden: true },
    ],
    params: [
      { id: "normalPDY", label: "Normal productivity", min: 1, max: 10, step: 0.5, value: 5, unit: "/p·mo" },
      { id: "fatigue", label: "Fatigue", min: 0.5, max: 2, step: 0.05, value: 1.3, unit: "×" },
      { id: "sched", label: "Schedule pressure", min: 0.5, max: 2, step: 0.05, value: 1.2, unit: "×" },
      { id: "adequacy", label: "Work adequacy", min: 0, max: 1.5, step: 0.05, value: 1, unit: "×" },
      { id: "skill", label: "Average skill", min: 0.2, max: 1.5, step: 0.05, value: 0.8, unit: "×" },
    ],
    rates: (_s, p) => ({
      producing: productivityOf(p), // Productivity = NormalProductivity × four effects (× one worker)
      atNormal: p.normalPDY,
    }),
    // the molecule itself is algebraic; the stocks only accumulate one worker's output so the result can be watched
    derivs: (s, _p, r) => ({ made: r.producing, ref: r.atNormal, pdy: (r.producing - s.pdy) / DT }),
    diagram: {
      stocks: { made: { x: 345, y: 90, w: 130, h: 120 } },
      flows: [{ id: "producing", pts: [[40, 150], [345, 150]], to: "made", max: 10, color: C.good }],
    },
    cld: {
      vars: [
        { id: "fat", label: "Fatigue", x: 85, y: 40 },
        { id: "sp", label: "Schedule pressure", x: 95, y: 102 },
        { id: "wa", label: "Work adequacy", x: 85, y: 164 },
        { id: "sk", label: "Average skill", x: 85, y: 226 },
        { id: "np", label: "Normal PDY", x: 300, y: 40 },
        { id: "pd", label: "Productivity", x: 300, y: 133 },
        { id: "out", label: "Output", x: 445, y: 133 },
      ],
      links: [
        { from: "fat", to: "pd", sign: "−" },
        { from: "sp", to: "pd", sign: "+" },
        { from: "wa", to: "pd", sign: "+" },
        { from: "sk", to: "pd", sign: "+" },
        { from: "np", to: "pd", sign: "+" },
        { from: "pd", to: "out", sign: "+" },
      ],
      loops: [],
      caption:
        '<span class="chip chipB">open</span> Productivity is <b>normal productivity × four effects</b>, each equal to 1 under normal conditions. Fatigue lowers it; schedule pressure, adequate work and skill raise it. Note the sign on schedule pressure: it is <b>positive</b> here (people work faster) and negative in the Quality molecule (they make more mistakes). There are no levels in the molecule, so no endogenous dynamics.',
    },
    desc: `<p><b>Productivity</b> — "PDY" in the early Pugh-Roberts project models — is the speed at which a single worker (or machine, or other resource) produces. Hines formulates it as a multivariate anchoring-and-adjustment: start from a <b>normal productivity</b> and multiply by one effect for each condition that moves it. The four effects he shows are illustrative but common in project models: fatigue, schedule pressure, work adequacy and average skill. Whether the work is done <i>correctly</i> is a separate question, answered by the Quality molecule, which has the same structure with different functions. The book version has no stock; here one worker's output is accumulated next to a reference line at normal productivity so the combined effect is visible.</p>
    <div class="eq">Productivity = NormalProductivity × EffectOfFatigue × EffectOfSchedulePressure × EffectOfWorkAdequacy × EffectAverageSkill</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it wherever the rate of work per person <b>responds to working conditions</b> rather than staying fixed: it supplies the productivity term of Producing. Each effect is a function you define, passing through 1 at the normal value of its input. The functions used here are simple straight lines with limits — replace them with your own tables.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — patients seen per clinician per day, lower after weeks of long shifts and higher when the waiting room is full.</li>
      <li><b>Sustainability</b> — retrofits completed per installer crew, limited by crew experience and by whether enough surveyed homes are ready to work on.</li>
      <li><b>Projects</b> — drawings or lines of code per engineer during a deadline push.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Normal productivity is 5 widgets per person per month. Fatigue 1.3 gives an effect of <code>1 − 0.5 × 0.3 = 0.85</code>; schedule pressure 1.2 gives <code>1 + 0.4 × 0.2 = 1.08</code>; work adequacy 1 gives 1; average skill 0.8 gives <code>0.4 + 0.6 × 0.8 = 0.88</code>. Productivity = <code>5 × 0.85 × 1.08 × 1 × 0.88 ≈ 4.04</code>. Over 60 months one worker makes about <b>242</b> widgets against <b>300</b> at normal productivity. Set work adequacy to 0 and productivity is 0, whatever the other effects say — multiplied effects let any one of them stop the work.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Productivity (PDY) (parent: Multivariate Anchoring and Adjustment).</li>
      <li>Abdel-Hamid, T. &amp; Madnick, S. E. (1991). <i>Software Project Dynamics: An Integrated Approach</i>. Prentice Hall.</li>
    </ul>`,
  },

  effectFatigue: {
    name: "Effect of Fatigue",
    title: "Effect of Fatigue",
    timeUnit: "mo",
    unitY: "fraction",
    lede: "Fatigue is a smooth of overtime, measured in the same units as overtime. A function of fatigue then gives its effect on productivity (or quality).",
    stocks: [
      { id: "fatigue", label: "Fatigue", init: 1, scale: 2, color: C.pink },
      { id: "effect", label: "Effect on PDY", init: 1, scale: 1.2, color: C.good },
    ],
    params: [
      { id: "overtime", label: "Overtime", min: 0.5, max: 2, step: 0.05, value: 1.5, unit: "×" },
      { id: "timeToFatigue", label: "Time to get fatigued", min: 0.5, max: 12, step: 0.5, value: 3, unit: "mo" },
      { id: "slope", label: "Strength of effect", min: 0, max: 1, step: 0.05, value: 0.6, unit: "" },
    ],
    rates: (s, p) => {
      const net = (p.overtime - s.fatigue) / p.timeToFatigue; // GettingFatigued = (Overtime − Fatigue) / TimeToGetFatigued
      return {
        gettingFatigued: Math.max(0, net),
        recovering: Math.max(0, -net),
        effect: fatigueEffect(s.fatigue, p.slope), // Effect of fatigue on PDY f(Fatigue)
      };
    },
    derivs: (s, _p, r) => ({ fatigue: r.gettingFatigued - r.recovering, effect: (r.effect - s.effect) / DT }),
    diagram: {
      stocks: { fatigue: { x: 345, y: 90, w: 130, h: 120 } },
      flows: [
        { id: "gettingFatigued", pts: [[40, 150], [345, 150]], to: "fatigue", max: 0.3, color: C.pink },
        { id: "recovering", pts: [[475, 150], [785, 150]], from: "fatigue", max: 0.3, color: C.good },
      ],
    },
    cld: {
      vars: [
        { id: "ot", label: "Overtime", x: 90, y: 110 },
        { id: "fa", label: "Fatigue", x: 255, y: 110 },
        { id: "ef", label: "Effect on PDY", x: 430, y: 110 },
      ],
      links: [
        { from: "ot", to: "fa", sign: "+" },
        { from: "fa", to: "fa", sign: "−", self: true },
        { from: "fa", to: "ef", sign: "−", note: "via f" },
      ],
      loops: [{ type: "B", label: "B1", x: 207, y: 67 }],
      caption:
        '<span class="chip chipB">B1</span> Fatigue closes its gap to the current level of overtime over the time to get fatigued — a first-order smooth. The effect on productivity is a function of fatigue, not of overtime itself, so it arrives with the same lag: hours go up today, productivity sags over the following months, and recovery after the hours come down is just as slow.',
    },
    desc: `<p>"Fatigue" is an abstract idea, and working hard wears people down only gradually. Hines' formulation handles both points at once: <b>fatigue is a smooth of overtime</b>. It starts at 1 (a normal day) and moves toward whatever overtime is being worked; the <b>time to get fatigued</b> is the lag between starting to work at some overtime level and feeling its full effect. Because fatigue is measured in the same units as overtime, the effect function is easy to parameterise: ask what productivity would be after working at each overtime level <i>for a very long time</i>. The function here is a straight line through (1, 1) whose slope you set with the strength slider. Hines draws one two-way flow, GettingFatigued; it is shown here as two one-way flows, getting fatigued and recovering.</p>
    <div class="eq">Fatigue = INTEG( (Overtime − Fatigue) / TimeToGetFatigued, 1 );&nbsp; Effect of fatigue on PDY = f( Fatigue )</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it wherever <b>sustained extra effort has a delayed cost</b>. Feed overtime in from the Overtime molecule and send the effect out to Productivity or, through a different function, to Quality. On its own it has one input and one output, which makes it a convenient building block.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — ward staff covering vacancies with extra shifts: output per hour slips over the following weeks, not on the first long day.</li>
      <li><b>Sustainability</b> — field crews working extended hours through a planting or harvest season.</li>
      <li><b>Projects</b> — a software or construction team in a prolonged crunch.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Overtime steps to 1.5 and stays there; time to get fatigued is 3 months. Fatigue starts at 1 and covers about 63% of the gap in the first 3 months: <code>1 + 0.5 × 0.63 ≈ 1.32</code>, and it is within 0.01 of 1.5 by month 12. With strength 0.6 the effect is <code>1 − 0.6 × (Fatigue − 1)</code>: about <b>0.81</b> at month 3 and settling at <code>1 − 0.6 × 0.5 = 0.70</code>. So people working 50% more hours end up 30% less productive per hour: <code>1.5 × 0.70 = 1.05</code> of normal output for 1.5 times the hours.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Effect of Fatigue (parents: Smooth (first order), Univariate Anchoring and Adjustment).</li>
    </ul>`,
  },

  overtime: {
    name: "Overtime",
    title: "Overtime (Required Overtime)",
    timeUnit: "wk",
    unitY: "tasks",
    lede: "Indicated overtime is the number of workers we wish we had divided by the number we actually have. A limiting function turns it into the overtime people will really work.",
    stocks: [
      { id: "done", label: "Work accomplished", init: 0, scale: 3200, color: C.good },
      { id: "shortfall", label: "Work fallen behind", init: 0, scale: 600, color: C.pink },
      { id: "ot", label: "Overtime (×)", init: 1.3, scale: 2, color: C.acc, chartHidden: true },
    ],
    params: [
      { id: "desiredRate", label: "Desired accomplishing rate", min: 0, max: 150, step: 5, value: 60, unit: "/wk" },
      { id: "productivity", label: "Productivity", min: 1, max: 10, step: 0.5, value: 4, unit: "/p·wk" },
      { id: "workers", label: "Workers", min: 0, max: 30, step: 1, value: 10, unit: "ppl" },
      { id: "maxOvertime", label: "Overtime limit", min: 1, max: 2, step: 0.05, value: 1.3, unit: "×" },
    ],
    rates: (_s, p) => {
      const desiredPeople = p.desiredRate / Math.max(p.productivity, EPS); // DesiredPeople = DesiredAccomplishingRate / productivity
      const indicated = desiredPeople / Math.max(p.workers, EPS); // IndicatedOvertime = DesiredPeople / Workers (guarded)
      const overtime = Math.min(p.maxOvertime, indicated); // Overtime = Overtime f(IndicatedOvertime)
      const accomplishing = p.workers * p.productivity * overtime;
      return { accomplishing, fallingBehind: Math.max(0, p.desiredRate - accomplishing), overtime };
    },
    // the molecule itself is algebraic; the stocks only accumulate its consequences
    derivs: (s, _p, r) => ({ done: r.accomplishing, shortfall: r.fallingBehind, ot: (r.overtime - s.ot) / DT }),
    diagram: {
      stocks: {
        done: { x: 345, y: 40, w: 130, h: 90 },
        shortfall: { x: 345, y: 160, w: 130, h: 90 },
      },
      flows: [
        { id: "accomplishing", pts: [[40, 85], [345, 85]], to: "done", max: 150, color: C.good },
        { id: "fallingBehind", pts: [[40, 205], [345, 205]], to: "shortfall", max: 60, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "dr", label: "Desired rate", x: 75, y: 45 },
        { id: "pr", label: "Productivity", x: 75, y: 238 },
        { id: "dp", label: "Desired people", x: 185, y: 132 },
        { id: "wk", label: "Workers", x: 300, y: 225 },
        { id: "io", label: "Indicated overtime", x: 350, y: 50 },
        { id: "ot", label: "Overtime", x: 455, y: 168 },
        { id: "lim", label: "Overtime limit", x: 420, y: 245 },
      ],
      links: [
        { from: "dr", to: "dp", sign: "+", curve: -14 },
        { from: "pr", to: "dp", sign: "−", curve: 14, note: "divides" },
        { from: "dp", to: "io", sign: "+", curve: -16 },
        { from: "wk", to: "io", sign: "−", note: "divides" },
        { from: "io", to: "ot", sign: "+", curve: -14, note: "capped" },
        { from: "lim", to: "ot", sign: "+" },
      ],
      loops: [],
      caption:
        '<span class="chip chipB">open</span> No levels and no loop: <b>desired people</b> come from the work flow required, <b>indicated overtime</b> is desired people ÷ workers, and the overtime function passes it through only up to a practical limit. In a full project model the loop closes outside this molecule — overtime raises the work rate, which lowers the work remaining and with it the desired accomplishing rate.',
    },
    desc: `<p>How much overtime does the work call for? Overtime is measured as a fraction of a normal day. If there were no limits it would simply be the number of workers we wish we had divided by the number we do have — the <b>indicated overtime</b>. In practice overtime is limited by the hours in a day, by management policy and by what people are willing to do, and the <b>overtime function</b> represents that limit. Desired people comes from the Desired Workforce from Workflow molecule: the rate at which work must be accomplished, divided by productivity. The book version has no stock; the two stocks here accumulate what the workers accomplish at the resulting overtime and how much of the desired work flow they miss.</p>
    <div class="eq">Overtime = f( IndicatedOvertime );&nbsp; IndicatedOvertime = DesiredPeople / Workers;&nbsp; DesiredPeople = DesiredAccomplishingRate / productivity</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it in project and service models where <b>hours flex before headcount does</b>. Overtime responds at once, while the Workforce molecule adjusts slowly, so the two are normally used together. Hines' caveat: if the workforce can be zero, protect the division in indicated overtime. His technical note: any formulation of "people needed to get the work done" will serve as desired people. The function here is the simplest one — <code>MIN(overtime limit, indicated overtime)</code>.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — a ward needing 15 nurses' worth of care with 10 on the roster: extra shifts cover part of the gap, up to what working-time rules allow.</li>
      <li><b>Sustainability</b> — storm-repair crews on extended days after a flood, limited by safe working hours.</li>
      <li><b>Projects</b> — an engineering team behind schedule, asked for evenings and weekends before any hiring is approved.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    The schedule needs 60 tasks/wk and each person does 4 tasks/wk in a normal week, so desired people = <code>60 ÷ 4 = 15</code>. With 10 workers, indicated overtime = <code>15 ÷ 10 = 1.5</code>. The limit is 1.3, so overtime = <b>1.3</b> and the team accomplishes <code>10 × 4 × 1.3 = 52</code> tasks/wk — 8 short. After 60 weeks 3,120 tasks are done and 480 have fallen behind. Raise the limit to 1.5 or more, or the workforce to 15, and nothing falls behind.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Overtime (parents: Workforce, Univariate Anchoring and Adjustment, Desired Workforce from Workflow).</li>
      <li>Lyneis, J. M. &amp; Ford, D. N. (2007). "System dynamics applied to project management: a survey, assessment, and directions for future research." <i>System Dynamics Review</i> 23(2–3): 157–189.</li>
    </ul>`,
  },

  producing: {
    name: "Producing",
    title: "Producing (Workers × Productivity)",
    timeUnit: "mo",
    unitY: "drawings",
    lede: "Workers times their productivity gives what they produce or accomplish. One multiplication, used in almost every model that has people doing work.",
    stocks: [
      { id: "produced", label: "Drawings produced", init: 0, scale: 1200, color: C.good },
      { id: "rate", label: "Producing (/mo)", init: 20, scale: 60, color: C.acc, chartHidden: true },
    ],
    params: [
      { id: "workers", label: "Workers", min: 0, max: 30, step: 1, value: 10, unit: "ppl" },
      { id: "productivity", label: "Productivity", min: 0.5, max: 10, step: 0.5, value: 2, unit: "/p·mo" },
    ],
    rates: (_s, p) => ({ producing: p.workers * p.productivity }), // producing = workers × productivity
    // the molecule itself is algebraic; the stock only counts what has been produced
    derivs: (s, _p, r) => ({ produced: r.producing, rate: (r.producing - s.rate) / DT }),
    diagram: {
      stocks: { produced: { x: 440, y: 90, w: 130, h: 120 } },
      flows: [{ id: "producing", pts: [[40, 150], [440, 150]], to: "produced", max: 60, color: C.good }],
    },
    cld: {
      vars: [
        { id: "wk", label: "Workers", x: 100, y: 65 },
        { id: "pd", label: "Productivity", x: 100, y: 205 },
        { id: "pr", label: "Producing", x: 265, y: 135 },
        { id: "out", label: "Drawings produced", x: 425, y: 135 },
      ],
      links: [
        { from: "wk", to: "pr", sign: "+", curve: -16 },
        { from: "pd", to: "pr", sign: "+", curve: 16 },
        { from: "pr", to: "out", sign: "+" },
      ],
      loops: [],
      caption:
        '<span class="chip chipB">open</span> The molecule is the single line <b>producing = workers × productivity</b>. More workers or more productive workers produce more, in exact proportion. It has no levels and so no behaviour of its own; the stock on the right is only a counter so the rate has something to fill.',
    },
    desc: `<p>The plainest statement of how work gets done: <b>workers times their productivity yields what they accomplish or produce</b>. It is the Action from Resource molecule with the resource named "workers" and the ability named "productivity". Hines lists it separately because so much is built on it: fill a stock with it and you have Building Inventory by Doing Work, drain a stock with it and you have Reducing Backlog by Doing Work, turn it around and you have Desired Workforce from Workflow and Estimated Productivity. The book version has no stock; a simple counter of drawings produced is added here.</p>
    <div class="eq">producing = workers × productivity</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it for <b>any flow that people (or machines) generate by working</b>. Keep workers and productivity as separate variables even when both are constant, because each has its own causes: workers change through hiring and attrition, productivity through skill, fatigue and pressure. Check the units: people × drawings/person/month = drawings/month.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — vaccinations given per month = vaccinators × vaccinations per vaccinator.</li>
      <li><b>Sustainability</b> — homes insulated per month = installer crews × homes per crew.</li>
      <li><b>Operations</b> — production in Forrester's market-growth and workforce-inventory models = workforce × productivity.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    10 workers each produce 2 drawings a month, so producing = <code>10 × 2 = 20</code> drawings/mo: 400 drawings after 20 months and 1,200 after 60, a straight line. Halve the workers to 5 and double productivity to 4 and nothing changes — <code>5 × 4 = 20</code>. Set workers to 0 and producing is 0 however productive they would have been.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Producing (parent: Action from Resource).</li>
      <li>Forrester, J. W. (1968). "Market Growth as Influenced by Capital Investment." <i>Industrial Management Review</i>.</li>
    </ul>`,
  },

  reducingBacklog: {
    name: "Reducing Backlog by Doing Work",
    title: "Reducing Backlog by Doing Work",
    timeUnit: "mo",
    unitY: "tasks",
    lede: "A stock of work to do is drained by workers × productivity. With both constant it falls in a straight line, and nothing in the molecule stops it at zero.",
    stocks: [
      { id: "workToDo", label: "Work to do", init: 1200, scale: 1200, color: C.acc2 },
      { id: "overdrawn", label: "Overdrawn (below zero)", init: 0, scale: 1200, color: GREY },
    ],
    params: [
      { id: "workers", label: "Workers", min: 0, max: 30, step: 1, value: 10, unit: "ppl" },
      { id: "productivity", label: "Productivity", min: 0.5, max: 10, step: 0.5, value: 4, unit: "/p·mo" },
    ],
    // Deliberately unprotected, as in the book: producing never looks at the stock it drains.
    rates: (s, p) => {
      const producing = p.workers * p.productivity;
      const covered = Math.min(producing, s.workToDo / DT); // the part that real work to do can still cover
      return { producing, overdrawing: producing - covered };
    },
    // WorkToDo = INTEG(−producing); the simulator pins it at zero, and "overdrawn" keeps count of how far below zero it would be
    derivs: (_s, _p, r) => ({ workToDo: -r.producing, overdrawn: r.overdrawing }),
    diagram: {
      stocks: { workToDo: { x: 250, y: 90, w: 130, h: 120 } },
      flows: [{ id: "producing", pts: [[380, 150], [785, 150]], from: "workToDo", max: 100, color: C.good }],
    },
    cld: {
      vars: [
        { id: "wk", label: "Workers", x: 100, y: 65 },
        { id: "pd", label: "Productivity", x: 100, y: 205 },
        { id: "pr", label: "Producing", x: 265, y: 135 },
        { id: "wt", label: "Work to do", x: 425, y: 135 },
      ],
      links: [
        { from: "wk", to: "pr", sign: "+", curve: -16 },
        { from: "pd", to: "pr", sign: "+", curve: 16 },
        { from: "pr", to: "wt", sign: "−" },
      ],
      loops: [],
      caption:
        '<span class="chip chipB">open</span> Producing drains work to do, and <b>no arrow runs back</b> from the stock to the rate. That is why the decline is a straight line rather than a curve, and why nothing prevents the stock from being drained below zero. Adding the missing link — less work on hand lowers productivity — gives Level Protected by PDY.',
    },
    desc: `<p>Take a stock of work to do and make its outflow a Producing molecule: that is the whole structure. <b>Work to do declines</b>, and if workers and productivity are constant it declines linearly. Hines states the caveat plainly: nothing in this molecule prevents work to do from going negative. In Vensim the stock would simply carry on below zero. This simulator pins every stock at zero, so a second counter is added here — <b>overdrawn</b> — showing how far below zero the molecule's own arithmetic has gone. There is no inflow of new work in the book version, and none here.</p>
    <div class="eq">WorkToDo = INTEG( −producing );&nbsp; producing = workers × productivity</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it as the core of any <b>backlog, queue or project scope worked off by people</b>, and as the starting point for Estimated Remaining Duration (work to do ÷ producing). Use it unprotected only where you are sure the stock cannot run out within the run; otherwise go on to Level Protected by PDY. Its mirror image, filling a stock with a producing molecule, is Building Inventory by Doing Work.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — a waiting list of elective cases worked off by a surgical team.</li>
      <li><b>Sustainability</b> — a register of homes awaiting retrofit, cleared by installer crews.</li>
      <li><b>Projects</b> — remaining tasks in a design phase, the classic project-model stock.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    10 workers at 4 tasks per person per month produce <code>10 × 4 = 40</code> tasks/mo. Starting from 1,200 tasks, work to do is <code>1200 − 40 × 15 = 600</code> at month 15 and reaches zero at month <code>1200 ÷ 40 = 30</code>. The workers do not stop: by month 40 the equation gives <code>1200 − 40 × 40 = −400</code>, shown here as work to do 0 with <b>400</b> overdrawn, and by month 60 the overdraft is 1,200. Double the workers to 20 and the stock empties in 15 months instead.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Reducing Backlog by Doing Work (parent: Producing; used by Estimated Remaining Duration and Level Protected by PDY).</li>
    </ul>`,
  },
};

export const FLOW_META_E: Record<string, Record<string, FlowMeta>> = {
  productivity: {
    producing: {
      name: "producing (one worker)",
      eq: "NormalProductivity × EffectOfFatigue × EffectOfSchedulePressure × EffectOfWorkAdequacy × EffectAverageSkill",
      in: ["normalPDY", "fatigue", "sched", "adequacy", "skill"],
    },
  },
  effectFatigue: {
    gettingFatigued: { name: "getting fatigued", eq: "MAX(0, (Overtime − Fatigue) / TimeToGetFatigued)", in: ["overtime", "timeToFatigue", "fatigue"], loop: "B" },
    recovering: { name: "recovering", eq: "MAX(0, (Fatigue − Overtime) / TimeToGetFatigued)", in: ["overtime", "timeToFatigue", "fatigue"], loop: "B" },
  },
  overtime: {
    accomplishing: { name: "accomplishing", eq: "Workers × productivity × Overtime", in: ["workers", "productivity", "desiredRate", "maxOvertime"] },
    fallingBehind: { name: "falling behind", eq: "MAX(0, DesiredAccomplishingRate − accomplishing)", in: ["desiredRate", "workers", "productivity", "maxOvertime"] },
  },
  producing: {
    producing: { name: "producing", eq: "workers × productivity", in: ["workers", "productivity"] },
  },
  reducingBacklog: {
    producing: { name: "producing", eq: "workers × productivity", in: ["workers", "productivity"] },
  },
};

export const DIAGRAM_EXTRA_E: Record<string, { stocks: [string, string][]; aux?: [string, string][] }> = {
  productivity: {
    stocks: [
      ["Made by one worker", "INTEG(Productivity × 1 person, 0)"],
      ["At normal PDY", "INTEG(NormalProductivity × 1 person, 0)"],
    ],
    aux: [
      ["Productivity", "NormalProductivity × the four effects"],
      ["EffectOfFatigueOnProductivity", "f(Fatigue) = 1 − 0.5 × (Fatigue − 1), limited to 0.4 … 1.1"],
      ["EffectOfSchedulePressureOnProductivity", "f(SchedulePressure) = 1 + 0.4 × (SchedulePressure − 1), limited to 0.7 … 1.3"],
      ["EffectOfWorkAdequacyOnProductivity", "f(WorkAdequacy) = WorkAdequacy, limited to 0 … 1"],
      ["EffectAverageSkillOnProductivity", "f(AverageSkill) = 0.4 + 0.6 × AverageSkill, limited to 0.4 … 1.3"],
    ],
  },
  effectFatigue: {
    stocks: [["Fatigue", "INTEG(getting fatigued − recovering, 1)"]],
    aux: [
      ["GettingFatigued (net)", "(Overtime − Fatigue) / TimeToGetFatigued"],
      ["Effect of fatigue on PDY", "f(Fatigue) = 1 − strength × (Fatigue − 1), limited to 0 … 1.2"],
    ],
  },
  overtime: {
    stocks: [
      ["Work accomplished", "INTEG(accomplishing, 0)"],
      ["Work fallen behind", "INTEG(falling behind, 0)"],
    ],
    aux: [
      ["DesiredPeople", "DesiredAccomplishingRate / productivity"],
      ["IndicatedOvertime", "DesiredPeople / Workers"],
      ["Overtime", "Overtime f(IndicatedOvertime) = MIN(overtime limit, IndicatedOvertime)"],
    ],
  },
  producing: {
    stocks: [["Drawings produced", "INTEG(producing, 0)"]],
    aux: [["producing", "workers × productivity"]],
  },
  reducingBacklog: {
    stocks: [
      ["WorkToDo", "INTEG(−producing, 1200)  — pinned at zero by the simulator"],
      ["Overdrawn", "INTEG(the part of producing that WorkToDo can no longer cover, 0)"],
    ],
    aux: [
      ["producing", "workers × productivity  — no link back from WorkToDo"],
      ["time to empty", "WorkToDo / producing"],
    ],
  },
};

export const LESSONS_E: Record<string, Lesson> = {
  productivity: {
    q: "Normal productivity is 5 widgets per person per month. Schedule pressure rises to 1.5 while fatigue, work adequacy and skill stay normal (1). Productivity becomes…",
    options: ["4.25 — pressure slows people down", "5 — pressure only affects quality", "6 — pressure makes people work faster", "7.5 — in proportion to the pressure"],
    answer: 2,
    explain: "The effect of schedule pressure on productivity slopes upward: 1 + 0.4 × 0.5 = 1.2, so productivity = 5 × 1.2 = 6 and one worker makes 360 widgets in 60 months instead of 300. The same pressure pushes quality down in the Quality molecule — faster work, more mistakes.",
    preset: { normalPDY: 5, fatigue: 1, sched: 1.5, adequacy: 1, skill: 1 },
  },
  effectFatigue: {
    q: "Fatigue starts at 1. Overtime steps to 1.5 and stays there, and the time to get fatigued is 3 months. After 3 months fatigue is about…",
    options: ["1.5 — it follows overtime at once", "1.32 — about two-thirds of the way", "1.17 — one-third of the way", "1.0 — nothing yet"],
    answer: 1,
    explain: "Fatigue is a first-order smooth of overtime, so after one time constant it has closed about 63% of the gap: 1 + 0.5 × 0.63 ≈ 1.32. The effect on productivity lags with it — about 0.81 at month 3, heading for 0.70.",
    preset: { overtime: 1.5, timeToFatigue: 3, slope: 0.6 },
  },
  overtime: {
    q: "The work needs 60 tasks/wk at 4 tasks per person per week. With 10 workers and an overtime limit of 1.3, some work falls behind. Five more workers join (15 in all). Overtime becomes…",
    options: ["1.5", "1.3 — still at the limit", "1.0 — a normal week", "0.67"],
    answer: 2,
    explain: "DesiredPeople = 60 ÷ 4 = 15, so IndicatedOvertime = 15 ÷ 15 = 1.0. That is under the limit, so overtime is 1.0, the team accomplishes all 60 tasks/wk and nothing falls behind.",
    preset: { desiredRate: 60, productivity: 4, workers: 15, maxOvertime: 1.3 },
  },
  producing: {
    q: "10 workers at 2 drawings each per month produce 20 drawings/mo. The team is cut to 5 workers, but their productivity doubles to 4. Producing is now…",
    options: ["10 drawings/mo", "20 drawings/mo", "40 drawings/mo", "9 drawings/mo"],
    answer: 1,
    explain: "producing = workers × productivity = 5 × 4 = 20 drawings/mo, the same as 10 × 2. The count of drawings produced still reaches 1,200 at month 60.",
    preset: { workers: 5, productivity: 4 },
  },
  reducingBacklog: {
    q: "1,200 tasks, 10 workers, 4 tasks per person per month. Going strictly by the molecule's equations, work to do at month 40 is…",
    options: ["400 tasks", "0 — the workers stop when the work runs out", "−400 tasks", "1,200 — nothing changes without new work"],
    answer: 2,
    explain: "producing = 10 × 4 = 40 tasks/mo regardless of the stock, so WorkToDo = 1200 − 40 × 40 = −400. Nothing in the molecule stops the workers at zero. The simulator pins the stock at 0 from month 30 and shows the 400 as overdrawn.",
    preset: { workers: 10, productivity: 4 },
  },
};

export const PRESETS_E: Record<string, Preset[]> = {
  productivity: [
    { label: "Tired, pushed, less skilled", params: { normalPDY: 5, fatigue: 1.3, sched: 1.2, adequacy: 1, skill: 0.8 } },
    { label: "All normal", params: { normalPDY: 5, fatigue: 1, sched: 1, adequacy: 1, skill: 1 } },
    { label: "Short of work", params: { normalPDY: 5, fatigue: 1, sched: 1, adequacy: 0.4, skill: 1 } },
  ],
  effectFatigue: [
    { label: "Sustained crunch", params: { overtime: 1.5, timeToFatigue: 3, slope: 0.6 } },
    { label: "Slow to tire", params: { overtime: 1.5, timeToFatigue: 10, slope: 0.6 } },
    { label: "Short weeks (rested)", params: { overtime: 0.7, timeToFatigue: 3, slope: 0.6 } },
  ],
  overtime: [
    { label: "Capped by the limit", params: { desiredRate: 60, productivity: 4, workers: 10, maxOvertime: 1.3 } },
    { label: "Enough people", params: { desiredRate: 60, productivity: 4, workers: 15, maxOvertime: 1.3 } },
    { label: "Productivity slips", params: { desiredRate: 60, productivity: 3, workers: 10, maxOvertime: 1.3 } },
  ],
  producing: [
    { label: "10 workers × 2", params: { workers: 10, productivity: 2 } },
    { label: "5 workers × 4 (same output)", params: { workers: 5, productivity: 4 } },
    { label: "Double the team", params: { workers: 20, productivity: 2 } },
  ],
  reducingBacklog: [
    { label: "Straight-line decline", params: { workers: 10, productivity: 4 } },
    { label: "Double the workers", params: { workers: 20, productivity: 4 } },
    { label: "Small team (unfinished at month 60)", params: { workers: 4, productivity: 4 } },
  ],
};

// Immediate parents as the book lists them, using app keys.
export const LINEAGE_E: Record<string, string[]> = {
  productivity: ["multivariateAnchor"],
  effectFatigue: ["smooth", "univariateAnchor"],
  overtime: ["workforce", "univariateAnchor", "desiredWorkforce"],
  producing: ["actionFromResource"],
  reducingBacklog: ["producing"],
};
