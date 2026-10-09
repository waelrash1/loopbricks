// Batch C — Hines, "Molecules of Structure": the producing / project family.
// Ability from Action, Estimated Productivity, Desired Workforce from Workflow,
// Level Protected by PDY, Building Inventory by Doing Work, Doing Work Cascade,
// Cascade Protected by PDY.
import type { Model } from "@/data/molecules";
import type { FlowMeta } from "@/data/diagramMeta";
import type { Lesson } from "@/data/lessons";
import type { Preset } from "@/data/presets";

const C = { acc: "#2545ff", acc2: "#d9480f", good: "#0f8a5f", pink: "#c2255c" }; // same series palette as molecules.ts

const EPS = 1e-6; // divide-by-zero guard
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
// Fixed constants of the protected cascade (kept off the slider panel).
const CASCADE_PDY = 2; // productivityA = normalPDY B, C, D  [widgets/(person·mo)]

export const MODELS_C: Record<string, Model> = {
  abilityFromAction: {
    name: "Ability from Action",
    title: "Ability from Action (Implied Productivity)",
    timeUnit: "mo",
    unitY: "units / resource / mo",
    lede: "If you can see the flow and count the resources producing it, their ability is simply flow ÷ resource. The same relation as Action from Resource, read backwards.",
    stocks: [{ id: "ability", label: "Measured ability", init: 2, scale: 12, color: C.acc }],
    params: [
      { id: "flow", label: "Flow", min: 0, max: 120, step: 5, value: 60, unit: "/mo" },
      { id: "resource", label: "Resource", min: 1, max: 30, step: 1, value: 10, unit: "" },
      { id: "measureTime", label: "Measuring time", min: 0.5, max: 8, step: 0.5, value: 2, unit: "mo" },
    ],
    rates: (s, p) => {
      const ability = p.flow / Math.max(p.resource, EPS); // Ability = Flow / Resource
      const adjust = (ability - s.ability) / p.measureTime;
      return { up: Math.max(0, adjust), down: Math.max(0, -adjust) };
    },
    derivs: (_s, _p, r) => ({ ability: r.up - r.down }),
    diagram: {
      stocks: { ability: { x: 345, y: 90, w: 130, h: 120 } },
      flows: [
        { id: "up", pts: [[40, 150], [345, 150]], to: "ability", max: 3 },
        { id: "down", pts: [[475, 150], [785, 150]], from: "ability", max: 3, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "fl", label: "Flow", x: 95, y: 60 },
        { id: "re", label: "Resource", x: 95, y: 200 },
        { id: "ab", label: "Ability", x: 250, y: 130 },
        { id: "me", label: "Measured ability", x: 420, y: 130 },
      ],
      links: [
        { from: "fl", to: "ab", sign: "+", curve: -18 },
        { from: "re", to: "ab", sign: "−", curve: 18, note: "divides" },
        { from: "ab", to: "me", sign: "+" },
        { from: "me", to: "me", sign: "−", self: true },
      ],
      loops: [{ type: "B", label: "B1", x: 372, y: 87 }],
      caption:
        'The molecule itself is one algebraic line with no stock and no loop: <b>Ability = Flow ÷ Resource</b>. More flow from the same resources means more ability; the same flow from more resources means less. <span class="chip chipB">B1</span> is only the measuring wrapper added here so there is something to watch — the measured figure closes its gap to the implied ability over the measuring time.',
    },
    desc: `<p>Action from Resource says <code>flow = resource × ability</code>. Often you know the other two terms: you can count the resources and you can observe what they turn out. Rearranging gives the <b>ability</b> — the productivity each unit of resource must have. Hines lists this as a molecule in its own right because modellers reach for it constantly, usually to back out a productivity figure. The book version has <b>no stock</b>; here the result is fed through a short measuring delay so the tank has something to show.</p>
    <div class="eq">Ability = Flow / Resource</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it whenever a <b>productivity, yield or throughput-per-unit figure has to be inferred</b> from an observed flow rather than assumed: output per worker, litres per pump, cases per clinician. It is the first half of Estimated Productivity. Hines' one caveat: if the resource can fall to zero, protect the division.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — discharges per month ÷ beds gives throughput per bed; consultations ÷ clinicians gives caseload per clinician.</li>
      <li><b>Sustainability</b> — water delivered ÷ pumps in service; energy generated ÷ installed turbines.</li>
      <li><b>Operations</b> — units shipped ÷ machines running; tasks closed ÷ engineers on the project.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    A pumping station delivers 60 units/mo with 10 pumps, so ability = <code>60 ÷ 10 = 6</code> units per pump per month. The measured figure starts at 2 and closes the gap with a 2-month measuring time: about 4.6 after 2 months and 5.9 by month 8. Put 20 pumps on the same 60 units/mo and the implied ability halves to <b>3</b> — more resources for the same flow means each one is doing less.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Ability from Action (a rearrangement of Action from Resource).</li>
    </ul>`,
  },

  estProductivity: {
    name: "Estimated Productivity",
    title: "Estimated Productivity (Output ÷ Workforce)",
    timeUnit: "mo",
    unitY: "widgets / person / mo",
    lede: "Managers cannot see productivity directly, so they infer it: work being accomplished divided by the workforce doing it. The estimate is only as good as the flow they can observe.",
    stocks: [
      { id: "workToDo", label: "Work to do", init: 1500, scale: 1500, color: C.acc2, chartHidden: true },
      { id: "perceived", label: "Perceived PDY", init: 2, scale: 10, color: C.acc },
    ],
    params: [
      { id: "workforce", label: "Workforce", min: 1, max: 30, step: 1, value: 10, unit: "ppl" },
      { id: "actualPDY", label: "Actual productivity", min: 1, max: 10, step: 0.5, value: 5, unit: "/p·mo" },
      { id: "perceptionTime", label: "Perception time", min: 0.5, max: 8, step: 0.5, value: 3, unit: "mo" },
    ],
    rates: (s, p) => {
      // Producing molecule, capped so the work stock cannot be overdrawn
      const accomplishing = Math.min(p.workforce * p.actualPDY, s.workToDo / 0.5);
      const estimatedPDY = accomplishing / Math.max(p.workforce, EPS); // EstimatedPDY = WorkBeingAccomplished / Workforce
      const adjust = (estimatedPDY - s.perceived) / p.perceptionTime;
      return { accomplishing, up: Math.max(0, adjust), down: Math.max(0, -adjust) };
    },
    derivs: (_s, _p, r) => ({ workToDo: -r.accomplishing, perceived: r.up - r.down }),
    diagram: {
      stocks: {
        // two separate chains, stacked so their clouds don't collide
        workToDo: { x: 345, y: 40, w: 130, h: 90 },
        perceived: { x: 345, y: 160, w: 130, h: 90 },
      },
      flows: [
        { id: "accomplishing", pts: [[475, 85], [785, 85]], from: "workToDo", max: 150, color: C.good },
        { id: "up", pts: [[40, 205], [345, 205]], to: "perceived", max: 2 },
        { id: "down", pts: [[475, 205], [785, 205]], from: "perceived", max: 2, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "wf", label: "Workforce", x: 90, y: 135 },
        { id: "wa", label: "Work accomplished", x: 250, y: 55 },
        { id: "ep", label: "Estimated PDY", x: 250, y: 215 },
        { id: "pp", label: "Perceived PDY", x: 430, y: 135 },
      ],
      links: [
        { from: "wf", to: "wa", sign: "+", curve: 18, note: "× actual PDY" },
        { from: "wa", to: "ep", sign: "+", curve: -14 },
        { from: "wf", to: "ep", sign: "−", curve: 18, note: "divides" },
        { from: "ep", to: "pp", sign: "+", curve: 18 },
        { from: "pp", to: "pp", sign: "−", self: true },
      ],
      loops: [{ type: "B", label: "B1", x: 382, y: 92 }],
      caption:
        'Workforce appears twice: it <b>raises</b> the work accomplished and it is the <b>divisor</b> of the estimate, so the two paths cancel and headcount alone does not move estimated productivity. <span class="chip chipB">B1</span> Perceived productivity then closes its gap to the estimate over the perception time, as Hines suggests in his technical note.',
    },
    desc: `<p>Combine Producing with Ability from Action and you get the estimate every project manager carries around: <b>estimated productivity = work being accomplished ÷ workforce</b>. Hines adds a warning in his technical note: real managers cannot know an instantaneous flow, so either the work flow or the resulting estimate should pass through a <b>smooth</b> before anyone acts on it. This version does the second — a perceived productivity that trails the raw estimate. The work comes from a finite stock of work to do, which exposes the estimate's blind spot: when the work runs out, output per head collapses even though nobody became less capable.</p>
    <div class="eq">EstimatedPDY = WorkBeingAccomplished / Workforce</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it wherever <b>a decision depends on believed productivity rather than true productivity</b> — staffing plans, completion forecasts, overtime decisions. Feed the perceived value into Desired Workforce from Workflow or Estimated Remaining Duration and the lag and bias of the estimate become part of the model's behaviour.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — cases closed per clinician per month, used to set rosters; it dips when referrals dry up, not when skill falls.</li>
      <li><b>Sustainability</b> — retrofits completed per installer crew, used to plan a programme's staffing.</li>
      <li><b>Projects</b> — drawings or story points per engineer, read off the last few reporting periods.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    10 people at an actual productivity of 5 accomplish <code>10 × 5 = 50</code> widgets/mo, so the estimate is <code>50 ÷ 10 = 5</code>. Perceived productivity starts at 2 and, with a 3-month perception time, reaches about 3.9 after 3 months and 4.9 by month 12. The 1,500 widgets of work last <code>1500 ÷ 50 = 30</code> months; after that the accomplishing rate drops to zero, the estimate follows it, and perceived productivity decays back toward zero — idle people look unproductive.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Estimated Productivity (parents: Ability from Action, Producing).</li>
    </ul>`,
  },

  desiredWorkforce: {
    name: "Desired Workforce from Workflow",
    title: "Desired Workforce from Workflow",
    timeUnit: "wk",
    unitY: "people",
    lede: "Work out the rate at which work must be accomplished, divide by productivity, and you have the number of people you need. Producing, run backwards.",
    stocks: [{ id: "workforce", label: "Workforce", init: 10, scale: 60, color: C.acc }],
    params: [
      { id: "desiredRate", label: "Desired accomplishing rate", min: 0, max: 200, step: 5, value: 120, unit: "/wk" },
      { id: "productivity", label: "Productivity", min: 1, max: 10, step: 0.5, value: 4, unit: "/p·wk" },
      { id: "adjTime", label: "Time to adjust workforce", min: 1, max: 12, step: 0.5, value: 4, unit: "wk" },
    ],
    rates: (s, p) => {
      const desiredPeople = p.desiredRate / Math.max(p.productivity, EPS); // DesiredPeople = DesiredAccomplishingRate / productivity
      const adjust = (desiredPeople - s.workforce) / p.adjTime;
      return { hiring: Math.max(0, adjust), releasing: Math.max(0, -adjust) };
    },
    derivs: (_s, _p, r) => ({ workforce: r.hiring - r.releasing }),
    diagram: {
      stocks: { workforce: { x: 345, y: 90, w: 130, h: 120 } },
      flows: [
        { id: "hiring", pts: [[40, 150], [345, 150]], to: "workforce", max: 10 },
        { id: "releasing", pts: [[475, 150], [785, 150]], from: "workforce", max: 10, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "dr", label: "Desired rate", x: 85, y: 55 },
        { id: "pr", label: "Productivity", x: 85, y: 205 },
        { id: "dp", label: "Desired people", x: 240, y: 130 },
        { id: "hi", label: "Hiring", x: 400, y: 60 },
        { id: "wf", label: "Workforce", x: 400, y: 205 },
      ],
      links: [
        { from: "dr", to: "dp", sign: "+", curve: -16 },
        { from: "pr", to: "dp", sign: "−", curve: 16, note: "divides" },
        { from: "dp", to: "hi", sign: "+", curve: -16 },
        { from: "hi", to: "wf", sign: "+", curve: -64 },
        { from: "wf", to: "hi", sign: "−", curve: -64 },
      ],
      loops: [{ type: "B", label: "B1", x: 400, y: 132 }],
      caption:
        'The molecule is the left half: <b>desired people = desired accomplishing rate ÷ productivity</b> — a higher required rate needs more people, higher productivity needs fewer. <span class="chip chipB">B1</span> is the Workforce molecule it normally feeds: hiring closes the gap between desired and actual headcount, so the workforce trails the target.',
    },
    desc: `<p>Producing answers "how much will these people accomplish?" This molecule asks the planner's question instead: <b>"how many people does this work flow need?"</b> The key input, Hines stresses, is the rate at which work must be accomplished to finish on time. Divide that by productivity (possibly a <i>perceived</i> productivity) and the required headcount drops out. On its own it has no stock; here the result drives a simple workforce adjustment so you can watch the consequences of the target moving.</p>
    <div class="eq">DesiredPeople = DesiredAccomplishingRate / productivity</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it in almost any project or service model, wherever <b>staffing responds to workload</b>. Feed the desired accomplishing rate from work remaining ÷ time remaining, and use the result as the target of a Workforce molecule or, divided by the people you actually have, as the indicated overtime.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — nurses required = patient contacts needed per week ÷ contacts one nurse can deliver.</li>
      <li><b>Sustainability</b> — installer crews required to hit an annual heat-pump target at the going installs-per-crew.</li>
      <li><b>Projects</b> — engineers needed to clear the remaining drawings by the deadline.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    The schedule calls for 120 tasks/wk and each person does 4 tasks/wk, so desired people = <code>120 ÷ 4 = 30</code>. Starting from 10 people with a 4-week adjustment time, the workforce reaches about 22.7 after 4 weeks and 29 by week 12. Raise productivity to 6 and the same work flow needs only <code>120 ÷ 6 = 20</code> people — which is why a wrong productivity belief translates directly into over- or under-staffing.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Desired Workforce from Workflow (used by the Overtime molecule).</li>
    </ul>`,
  },

  protByPDY: {
    name: "Level Protected by PDY",
    title: "Level Protected by PDY (Productivity)",
    timeUnit: "mo",
    unitY: "tasks",
    lede: "Stop workers draining a backlog below zero by letting their productivity fall as the work runs thin: no tasks left means nothing to be productive on.",
    stocks: [{ id: "remaining", label: "Remaining work", init: 300, scale: 300, color: C.acc }],
    params: [
      { id: "workers", label: "Workers", min: 0, max: 20, step: 1, value: 10, unit: "ppl" },
      { id: "normalPDY", label: "Normal PDY", min: 1, max: 10, step: 0.5, value: 5, unit: "/p·mo" },
      { id: "required", label: "Work for full PDY", min: 20, max: 150, step: 5, value: 60, unit: "tasks" },
      { id: "newWork", label: "New work", min: 0, max: 60, step: 1, value: 0, unit: "/mo" },
    ],
    rates: (s, p) => {
      const relative = s.remaining / Math.max(p.required, EPS); // RelativeRemainingWork
      const productivity = p.normalPDY * clamp01(relative); // normalPDY × EffectOfRemainingWorkOnPDY
      return { in: p.newWork, producing: p.workers * productivity };
    },
    derivs: (_s, _p, r) => ({ remaining: r.in - r.producing }),
    diagram: {
      stocks: { remaining: { x: 330, y: 90, w: 130, h: 120 } },
      flows: [
        { id: "in", pts: [[40, 150], [330, 150]], to: "remaining", max: 60, color: C.pink },
        { id: "producing", pts: [[460, 150], [785, 150]], from: "remaining", max: 100, color: C.good },
      ],
    },
    cld: {
      vars: [
        { id: "rw", label: "Remaining work", x: 110, y: 170 },
        { id: "pd", label: "Productivity", x: 250, y: 60 },
        { id: "pr", label: "Producing", x: 400, y: 170 },
        { id: "wk", label: "Workers", x: 440, y: 60 },
      ],
      links: [
        { from: "rw", to: "pd", sign: "+", curve: -18, note: "via effect" },
        { from: "pd", to: "pr", sign: "+", curve: -18 },
        { from: "wk", to: "pr", sign: "+", curve: 10 },
        { from: "pr", to: "rw", sign: "−", curve: -26 },
      ],
      loops: [{ type: "B", label: "B1", x: 250, y: 140 }],
      caption:
        '<span class="chip chipB">B1</span> Less remaining work → lower productivity → less producing → remaining work falls more slowly. The loop is dormant while work is plentiful (the effect sits at 1 and the stock falls in a straight line) and takes over once remaining work drops below the amount needed for full productivity.',
    },
    desc: `<p>Reducing Backlog by Doing Work has a flaw: constant workers at constant productivity keep "producing" after the backlog reaches zero and drive it negative. Hines' cure is to recognise that <b>productivity must reach zero when there is nothing left to do</b>. Below a certain amount of remaining work, people cannot stay fully occupied — some tasks are waiting on a slow step, or the only tasks left are outside a worker's specialty — so productivity is normal PDY times an effect of relative remaining work. The effect here is the simplest table: 1 when work is plentiful, falling in a straight line to 0 at empty.</p>
    <div class="eq">producing = workers × normalPDY × f( RemainingWork / RequiredWorkForFullProductivity )</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it whenever <b>people drain a stock of work</b> and that stock could run out: project backlogs, queues of cases, stages of a development pipeline. It is the people-driven twin of Level Protected by Level. Hines' second version sets the threshold from the workforce itself — <code>required work = workers × work needed to keep one worker occupied</code>.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — a lab team clearing a test backlog: once few samples remain, staff wait on analyser runs and throughput per person drops.</li>
      <li><b>Sustainability</b> — a retrofit crew finishing a district: the last scattered homes take longer per job.</li>
      <li><b>Projects</b> — the tail end of a design phase, where the remaining drawings do not fit the remaining specialists.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    300 tasks, 10 workers, normal PDY 5: work falls at <code>10 × 5 = 50</code> tasks/mo. An unprotected stock would hit zero at month 6 and go negative. Here, once 60 tasks remain (month 4.8) productivity scales down as <code>5 × remaining/60</code>, giving a time constant of <code>60 ÷ 50 = 1.2</code> months: about 21 tasks are left at month 6 and about 3 at month 8.4 — always positive. Add 20 tasks/mo of new work and the backlog settles where producing equals inflow: <code>60 × 20/50 = 24</code> tasks.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Level Protected by PDY (parents: Reducing Backlog by Doing Work, Univariate Anchoring and Adjustment).</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>, ch. 14 — formulating table functions normalized to a reference.</li>
    </ul>`,
  },

  buildingInventory: {
    name: "Building Inventory by Doing Work",
    title: "Building Inventory by Doing Work",
    timeUnit: "mo",
    unitY: "widgets",
    lede: "People working fill a stock: the inflow is workers × productivity. With both constant, inventory climbs in a straight line.",
    stocks: [{ id: "inventory", label: "Inventory", init: 100, scale: 1300, color: C.good }],
    params: [
      { id: "workers", label: "Workers", min: 0, max: 30, step: 1, value: 10, unit: "ppl" },
      { id: "productivity", label: "Productivity", min: 0.5, max: 10, step: 0.5, value: 2, unit: "/p·mo" },
      { id: "shipments", label: "Shipments", min: 0, max: 60, step: 1, value: 0, unit: "/mo" },
    ],
    rates: (s, p) => ({
      producing: p.workers * p.productivity,
      shipping: Math.min(p.shipments, s.inventory / 0.5), // optional drain, cannot overdraw the stock
    }),
    derivs: (_s, _p, r) => ({ inventory: r.producing - r.shipping }),
    diagram: {
      stocks: { inventory: { x: 345, y: 90, w: 130, h: 120 } },
      flows: [
        { id: "producing", pts: [[40, 150], [345, 150]], to: "inventory", max: 60, color: C.good },
        { id: "shipping", pts: [[475, 150], [785, 150]], from: "inventory", max: 60, color: C.pink },
      ],
    },
    cld: {
      vars: [
        { id: "wk", label: "Workers", x: 90, y: 60 },
        { id: "pd", label: "Productivity", x: 90, y: 200 },
        { id: "pr", label: "Producing", x: 250, y: 130 },
        { id: "iv", label: "Inventory", x: 420, y: 130 },
      ],
      links: [
        { from: "wk", to: "pr", sign: "+", curve: -16 },
        { from: "pd", to: "pr", sign: "+", curve: 16 },
        { from: "pr", to: "iv", sign: "+" },
      ],
      loops: [],
      caption:
        '<span class="chip chipB">open</span> No feedback loop: workers and productivity set the producing rate from outside, and inventory just integrates it. Close a loop from inventory back to the workforce (hire when inventory is low) and you have the workforce-inventory oscillator; let the "inventory" be the workforce itself and you have population growth.',
    },
    desc: `<p>The mirror image of Reducing Backlog by Doing Work: the <b>inflow</b> to a stock is a Producing molecule, <code>workers × productivity</code>. Nothing limits the stock from above, so with constant workers and productivity it rises linearly for as long as you let it run. Hines' version has only the inflow; an optional shipments outflow (zero by default) is added here so you can see what the inventory does once something draws on it.</p>
    <div class="eq">Inventory = INTEG( producing );&nbsp; producing = workers × productivity</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it whenever <b>a stock is filled by people (or machines) working</b>: finished goods from a production line, completed designs from engineers, trained staff from instructors. It is the supply half of any production model and the first stage of a Doing Work Cascade.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — vaccine doses filled by a production team, accumulating in a stockpile ahead of a campaign.</li>
      <li><b>Sustainability</b> — hectares replanted = planting crews × hectares per crew, accumulating as restored forest.</li>
      <li><b>Operations</b> — finished-goods inventory built by the factory workforce.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    10 workers each make 2 widgets/mo, so producing = <code>10 × 2 = 20</code> widgets/mo. Starting from 100 with no shipments, inventory is <code>100 + 20 × 20 = 500</code> after 20 months and 1,300 after 60 — a straight line. Set shipments to 20/mo and the line goes flat at whatever level it had; set them above 20 and the stock is run down instead.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Building Inventory by Doing Work (used by Population Growth and Doing Work Cascade).</li>
    </ul>`,
  },

  doingWorkCascade: {
    name: "Doing Work Cascade",
    title: "Doing Work Cascade (Unprotected)",
    timeUnit: "mo",
    unitY: "widgets",
    lede: "A chain of stocks where every flow is people working: each stage's workers pull from the stock behind them and push into the one ahead. Stocks rise or fall in straight lines.",
    stocks: [
      { id: "invA", label: "Inventory A", init: 100, scale: 260, color: C.acc },
      { id: "invB", label: "Inventory B", init: 20, scale: 260, color: C.acc2 },
      { id: "invC", label: "Inventory C", init: 60, scale: 260, color: C.good },
    ],
    params: [
      { id: "workersA", label: "Workers A", min: 0, max: 15, step: 1, value: 5, unit: "ppl" },
      { id: "workersB", label: "Workers B", min: 0, max: 15, step: 1, value: 6, unit: "ppl" },
      { id: "workersC", label: "Workers C", min: 0, max: 15, step: 1, value: 4, unit: "ppl" },
      { id: "workersD", label: "Workers D", min: 0, max: 15, step: 1, value: 4, unit: "ppl" },
      { id: "productivity", label: "Productivity", min: 0.5, max: 5, step: 0.5, value: 2, unit: "/p·mo" },
    ],
    // Deliberately unprotected, as in the book: no flow looks at the stock it drains.
    rates: (_s, p) => ({
      pA: p.workersA * p.productivity,
      pB: p.workersB * p.productivity,
      pC: p.workersC * p.productivity,
      pD: p.workersD * p.productivity,
    }),
    derivs: (_s, _p, r) => ({ invA: r.pA - r.pB, invB: r.pB - r.pC, invC: r.pC - r.pD }),
    diagram: {
      stocks: {
        invA: { x: 120, y: 105, w: 100, h: 100 },
        invB: { x: 360, y: 105, w: 100, h: 100 },
        invC: { x: 600, y: 105, w: 100, h: 100 },
      },
      flows: [
        { id: "pA", pts: [[40, 155], [120, 155]], to: "invA", max: 40 },
        { id: "pB", pts: [[220, 155], [360, 155]], from: "invA", to: "invB", max: 40 },
        { id: "pC", pts: [[460, 155], [600, 155]], from: "invB", to: "invC", max: 40 },
        { id: "pD", pts: [[700, 155], [785, 155]], from: "invC", max: 40 },
      ],
    },
    cld: {
      vars: [
        { id: "pa", label: "Producing A", x: 62, y: 60 },
        { id: "pb", label: "Producing B", x: 192, y: 60 },
        { id: "pc", label: "Producing C", x: 328, y: 60 },
        { id: "pd", label: "Producing D", x: 458, y: 60 },
        { id: "ia", label: "Inventory A", x: 125, y: 195 },
        { id: "ib", label: "Inventory B", x: 260, y: 195 },
        { id: "ic", label: "Inventory C", x: 395, y: 195 },
      ],
      links: [
        { from: "pa", to: "ia", sign: "+" },
        { from: "pb", to: "ia", sign: "−" },
        { from: "pb", to: "ib", sign: "+" },
        { from: "pc", to: "ib", sign: "−" },
        { from: "pc", to: "ic", sign: "+" },
        { from: "pd", to: "ic", sign: "−" },
      ],
      loops: [],
      caption:
        '<span class="chip chipB">open</span> Every arrow runs from a producing rate to a stock and none runs back. Each rate is simply <b>workers × productivity</b>, so a stock rises or falls linearly according to the difference between the crew filling it and the crew draining it. Because no crew looks at the stock it draws from, nothing stops a stock being overdrawn — the gap that Cascade Protected by PDY closes.',
    },
    desc: `<p>Take Cascaded Levels and make every flow a Producing molecule: stage A's workers build inventory A, stage B's workers move it on to B, and so on down the chain. With constant crews the stocks move in <b>straight lines</b> — up where the upstream crew is stronger, down where the downstream crew is. Hines gives each stage its own productivity; a single shared productivity is used here to keep the sliders manageable.</p>
    <div class="eq">Inventory<sub>i</sub> = INTEG( producing<sub>i</sub> − producing<sub>i+1</sub> );&nbsp; producing<sub>i</sub> = workers<sub>i</sub> × productivity<sub>i</sub></div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it as the skeleton of any <b>multi-stage process staffed stage by stage</b> — an R&amp;D pipeline, a production line, a claims process. But heed Hines' caveat: nothing prevents these levels going negative. In Vensim an overdrawn stock simply drops below zero; this simulator pins stocks at zero instead, so an emptied stage keeps "passing on" items that were never there. In real models, protect each flow (see Cascade Protected by PDY).</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — referral → assessment → treatment, each step worked by its own team.</li>
      <li><b>Sustainability</b> — collected → sorted → reprocessed material in a recycling chain.</li>
      <li><b>R&amp;D</b> — research → development → launch, Hines' classic "R&amp;D chain".</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Crews of 5, 6, 4 and 4 at productivity 2 give rates of 10, 12, 8 and 8 widgets/mo. Inventory A changes by <code>10 − 12 = −2</code>/mo, B by <code>12 − 8 = +4</code>/mo and C by <code>8 − 8 = 0</code>. So A falls from 100 to 60 in 20 months and is empty at month 50; B climbs from 20 to 100 over the same 20 months; C holds at 60. After month 50 the flaw shows: B's crew still books 12/mo out of an empty stock.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Doing Work Cascade (parents: Cascaded Levels, Building Inventory by Doing Work, Reducing Backlog by Doing Work).</li>
    </ul>`,
  },

  cascadeProtByPDY: {
    name: "Cascade Protected by PDY",
    title: "Cascade Protected by PDY",
    timeUnit: "mo",
    unitY: "widgets",
    lede: "A doing-work chain in which each crew's productivity depends on how much is in the stock it draws from. Starve a stage and it slows down instead of pulling its stock below zero.",
    stocks: [
      { id: "invB", label: "Inventory B", init: 150, scale: 160, color: C.acc },
      { id: "invC", label: "Inventory C", init: 60, scale: 160, color: C.acc2 },
      { id: "invD", label: "Inventory D", init: 60, scale: 160, color: C.good },
    ],
    params: [
      { id: "workersA", label: "Workers A", min: 0, max: 30, step: 1, value: 10, unit: "ppl" },
      { id: "workersB", label: "Workers B", min: 0, max: 30, step: 1, value: 14, unit: "ppl" },
      { id: "workersC", label: "Workers C", min: 0, max: 30, step: 1, value: 12, unit: "ppl" },
      { id: "workersD", label: "Workers D", min: 0, max: 30, step: 1, value: 16, unit: "ppl" },
      { id: "required", label: "Work for full PDY", min: 10, max: 200, step: 5, value: 60, unit: "" },
    ],
    rates: (s, p) => {
      const req = Math.max(p.required, EPS);
      const pdy = (level: number) => CASCADE_PDY * clamp01(level / req); // normalPDY × effect(relative remaining work)
      return {
        pA: p.workersA * CASCADE_PDY, // first stage draws from outside the chain
        pB: p.workersB * pdy(s.invB),
        pC: p.workersC * pdy(s.invC),
        pD: p.workersD * pdy(s.invD),
      };
    },
    derivs: (_s, _p, r) => ({ invB: r.pA - r.pB, invC: r.pB - r.pC, invD: r.pC - r.pD }),
    diagram: {
      stocks: {
        invB: { x: 120, y: 105, w: 100, h: 100 },
        invC: { x: 360, y: 105, w: 100, h: 100 },
        invD: { x: 600, y: 105, w: 100, h: 100 },
      },
      flows: [
        { id: "pA", pts: [[40, 155], [120, 155]], to: "invB", max: 60 },
        { id: "pB", pts: [[220, 155], [360, 155]], from: "invB", to: "invC", max: 60 },
        { id: "pC", pts: [[460, 155], [600, 155]], from: "invC", to: "invD", max: 60 },
        { id: "pD", pts: [[700, 155], [785, 155]], from: "invD", max: 60 },
      ],
    },
    cld: {
      vars: [
        { id: "pa", label: "Producing A", x: 80, y: 235 },
        { id: "ib", label: "Inventory B", x: 125, y: 135 },
        { id: "yb", label: "Productivity B", x: 265, y: 45 },
        { id: "pb", label: "Producing B", x: 405, y: 135 },
        { id: "ic", label: "Inventory C", x: 405, y: 235 },
      ],
      links: [
        { from: "pa", to: "ib", sign: "+", curve: -10 },
        { from: "ib", to: "yb", sign: "+", curve: -18, note: "via effect" },
        { from: "yb", to: "pb", sign: "+", curve: -18 },
        { from: "pb", to: "ib", sign: "−", curve: -28 },
        { from: "pb", to: "ic", sign: "+", curve: -10 },
      ],
      loops: [{ type: "B", label: "B1", x: 265, y: 115 }],
      caption:
        '<span class="chip chipB">B1</span> One stage of the chain, repeated at B, C and D: a low stock lowers the productivity of the crew draining it, which slows the outflow and protects the stock. Each stage\'s outflow is also the next stage\'s inflow, so a shortage upstream travels down the chain as a gentle slowdown rather than as negative inventories.',
    },
    desc: `<p>Apply Level Protected by PDY to every stage of a Doing Work Cascade. People working still move material from stock to stock, but the <b>productivity of each crew is a function of the stock it drains</b>: normal PDY times an effect of that stock relative to the amount needed for full productivity. The first crew (A) works from outside the chain at a fixed productivity. Normal PDY is fixed at 2 widgets per person per month for every stage here; Hines' own illustration uses 5 workers per stage, PDY 5 and a requirement of 15.</p>
    <div class="eq">producing<sub>i</sub> = workers<sub>i</sub> × normalPDY × f( Inventory<sub>i</sub> / RequiredWorkForFullProductivity<sub>i</sub> )</div>
    <div class="whenbox"><h4>When to use it</h4>
    Use it for any <b>staffed pipeline that must stay physically sensible</b> when stages are unbalanced or the feed stops: R&amp;D chains, multi-step service processes, production lines with stage-specific crews. A stage with too few workers piles work up in front of it; a stage with too many runs its stock down to the level where its crew is only as productive as its feed allows.</div>
    <h4>Real-world examples</h4>
    <ul>
      <li><b>Healthcare</b> — triage → diagnostics → treatment: an over-staffed downstream step idles rather than treating patients who have not arrived.</li>
      <li><b>Sustainability</b> — collection → sorting → reprocessing of recyclables with separate crews.</li>
      <li><b>R&amp;D</b> — Hines' "R&amp;D balance chain": research, development and launch teams competing for balance.</li>
    </ul>
    <div class="worked"><h4>Worked example</h4>
    Crew A (10 people × 2) feeds 20 widgets/mo. Crews B, C and D could do 28, 24 and 32 at full productivity, all more than the feed, so each stock settles where its crew is throttled to 20/mo: <code>B = 60 × 20/28 ≈ 43</code>, <code>C = 60 × 20/24 = 50</code>, <code>D = 60 × 20/32 = 37.5</code>. On the way, B's initial pile of 150 lets crew B run flat out at 28, which briefly swells C before the chain settles. Set workers A to 0 and all three stocks drain toward zero without ever crossing it.</div>
    <h4>References</h4>
    <ul class="refs">
      <li>Hines, J. <i>Molecules of Structure</i> — Cascade Protected by PDY (parents: Level Protected by PDY, Doing Work Cascade).</li>
    </ul>`,
  },
};

export const FLOW_META_C: Record<string, Record<string, FlowMeta>> = {
  abilityFromAction: {
    up: { name: "revising up", eq: "MAX(0, (Flow / Resource − Measured ability) / measuring time)", in: ["flow", "resource", "measureTime", "ability"], loop: "B" },
    down: { name: "revising down", eq: "MAX(0, (Measured ability − Flow / Resource) / measuring time)", in: ["flow", "resource", "measureTime", "ability"], loop: "B" },
  },
  estProductivity: {
    accomplishing: { name: "work being accomplished", eq: "MIN(workforce × actual productivity, Work to do / 0.5)", in: ["workforce", "actualPDY", "workToDo"], loop: "B" },
    up: { name: "revising up", eq: "MAX(0, (EstimatedPDY − Perceived PDY) / perception time)", in: ["workforce", "perceptionTime", "perceived"], loop: "B" },
    down: { name: "revising down", eq: "MAX(0, (Perceived PDY − EstimatedPDY) / perception time)", in: ["workforce", "perceptionTime", "perceived"], loop: "B" },
  },
  desiredWorkforce: {
    hiring: { name: "hiring", eq: "MAX(0, (DesiredPeople − Workforce) / time to adjust)", in: ["desiredRate", "productivity", "adjTime", "workforce"], loop: "B" },
    releasing: { name: "releasing", eq: "MAX(0, (Workforce − DesiredPeople) / time to adjust)", in: ["desiredRate", "productivity", "adjTime", "workforce"], loop: "B" },
  },
  protByPDY: {
    in: { name: "new work", eq: "new work", in: ["newWork"] },
    producing: { name: "producing", eq: "workers × normalPDY × MIN(1, Remaining work / work for full PDY)", in: ["workers", "normalPDY", "required", "remaining"], loop: "B" },
  },
  buildingInventory: {
    producing: { name: "producing", eq: "workers × productivity", in: ["workers", "productivity"] },
    shipping: { name: "shipping", eq: "MIN(shipments, Inventory / 0.5)", in: ["shipments", "inventory"], loop: "B" },
  },
  doingWorkCascade: {
    pA: { name: "producingA", eq: "workersA × productivity", in: ["workersA", "productivity"] },
    pB: { name: "producingB", eq: "workersB × productivity", in: ["workersB", "productivity"] },
    pC: { name: "producingC", eq: "workersC × productivity", in: ["workersC", "productivity"] },
    pD: { name: "producingD", eq: "workersD × productivity", in: ["workersD", "productivity"] },
  },
  cascadeProtByPDY: {
    pA: { name: "producingA", eq: "workersA × productivityA  (productivityA = 2)", in: ["workersA"] },
    pB: { name: "producingB", eq: "workersB × normalPDY × MIN(1, InventoryB / work for full PDY)", in: ["workersB", "required", "invB"], loop: "B" },
    pC: { name: "producingC", eq: "workersC × normalPDY × MIN(1, InventoryC / work for full PDY)", in: ["workersC", "required", "invC"], loop: "B" },
    pD: { name: "producingD", eq: "workersD × normalPDY × MIN(1, InventoryD / work for full PDY)", in: ["workersD", "required", "invD"], loop: "B" },
  },
};

export const DIAGRAM_EXTRA_C: Record<string, { stocks: [string, string][]; aux?: [string, string][] }> = {
  abilityFromAction: {
    stocks: [["Measured ability", "INTEG(revising up − revising down, 2)"]],
    aux: [["Ability", "Flow / Resource"]],
  },
  estProductivity: {
    stocks: [
      ["Work to do", "INTEG(−work being accomplished, 1500)"],
      ["Perceived PDY", "INTEG(revising up − revising down, 2)"],
    ],
    aux: [["EstimatedPDY", "WorkBeingAccomplished / Workforce"]],
  },
  desiredWorkforce: {
    stocks: [["Workforce", "INTEG(hiring − releasing, 10)"]],
    aux: [["DesiredPeople", "DesiredAccomplishingRate / productivity"]],
  },
  protByPDY: {
    stocks: [["RemainingWork", "INTEG(new work − producing, 300)"]],
    aux: [
      ["RelativeRemainingWork", "RemainingWork / RequiredWorkForFullProductivity"],
      ["EffectOfRemainingWorkOnPDY", "f(RelativeRemainingWork) = MIN(1, relative)"],
      ["productivity", "normalPDY × EffectOfRemainingWorkOnPDY"],
      ["equilibrium (with new work)", "RemainingWork* = required × new work / (workers × normalPDY)"],
    ],
  },
  buildingInventory: {
    stocks: [["Inventory", "INTEG(producing − shipping, 100)"]],
    aux: [["producing", "workers × productivity"]],
  },
  doingWorkCascade: {
    stocks: [
      ["InventoryA", "INTEG(producingA − producingB, 100)"],
      ["InventoryB", "INTEG(producingB − producingC, 20)"],
      ["InventoryC", "INTEG(producingC − producingD, 60)"],
    ],
    aux: [["producing (each stage)", "workers × productivity  — no link back from any stock"]],
  },
  cascadeProtByPDY: {
    stocks: [
      ["InventoryB", "INTEG(producingA − producingB, 150)"],
      ["InventoryC", "INTEG(producingB − producingC, 60)"],
      ["InventoryD", "INTEG(producingC − producingD, 60)"],
    ],
    aux: [
      ["RelativeRemainingWork (each stage)", "Inventory / RequiredWorkForFullProductivity"],
      ["productivity (B, C, D)", "normalPDY × MIN(1, RelativeRemainingWork),  normalPDY = 2"],
      ["equilibrium", "Inventory* = required × producingA / (workers × normalPDY)"],
    ],
  },
};

export const LESSONS_C: Record<string, Lesson> = {
  abilityFromAction: {
    q: "A flow of 60 units/mo is produced by 20 resources. The measured ability settles at…",
    options: ["1,200 per resource", "3 per resource", "0.33 per resource", "80 per resource"],
    answer: 1,
    explain: "Ability = Flow ÷ Resource = 60 ÷ 20 = 3 units per resource per month. The measured figure starts at 2 and closes the gap over the measuring time.",
    preset: { flow: 60, resource: 20, measureTime: 2 },
  },
  estProductivity: {
    q: "10 people accomplish 50 widgets/mo. The workforce is doubled to 20 at the same actual productivity. While work lasts, estimated productivity…",
    options: ["doubles to 10", "halves to 2.5", "stays at 5", "falls to 0"],
    answer: 2,
    explain: "Work accomplished doubles to 100/mo, and 100 ÷ 20 = 5: headcount cancels out of the estimate. Perceived PDY climbs to 5 just as before — the only difference is that the 1,500 widgets run out in 15 months instead of 30, after which the estimate collapses.",
    preset: { workforce: 20, actualPDY: 5, perceptionTime: 3 },
  },
  desiredWorkforce: {
    q: "The schedule needs 120 tasks/wk. Productivity is 6 tasks per person per week. The workforce, starting from 10, heads toward…",
    options: ["720 people", "30 people", "20 people", "it stays at 10"],
    answer: 2,
    explain: "DesiredPeople = 120 ÷ 6 = 20. Hiring closes the gap from 10 over the adjustment time, so the workforce approaches 20 and stops.",
    preset: { desiredRate: 120, productivity: 6, adjTime: 4 },
  },
  protByPDY: {
    q: "300 tasks, 10 workers, normal PDY 5 (50 tasks/mo), full productivity needs 60 tasks on hand. At month 6 — when an unprotected backlog would hit zero — remaining work is about…",
    options: ["0, exactly finished", "about 21, and still shrinking", "60, stuck there", "−10, overdrawn"],
    answer: 1,
    explain: "Work falls at 50/mo until 60 remain (month 4.8). From there productivity scales with remaining/60, so the stock decays with a 60 ÷ 50 = 1.2-month time constant: 60 × e⁻¹ ≈ 22 at month 6 in exact terms, about 21 in this step-by-step simulation. It keeps approaching zero but never crosses it.",
    preset: { workers: 10, normalPDY: 5, required: 60, newWork: 0 },
  },
  buildingInventory: {
    q: "Inventory starts at 100. Ten workers each make 2 widgets/mo and nothing is shipped. After 20 months inventory is…",
    options: ["120", "300", "500", "levelling off near 200"],
    answer: 2,
    explain: "producing = 10 × 2 = 20 widgets/mo, so inventory = 100 + 20 × 20 = 500. With constant workers and productivity the rise is a straight line with nothing to slow it.",
    preset: { workers: 10, productivity: 2, shipments: 0 },
  },
  doingWorkCascade: {
    q: "Stage A has 2 workers, stage B has 8 (productivity 2). Inventory A empties around month 8. After that, crew B's producing rate is…",
    options: ["0 — nothing left to work on", "4/mo — only what crew A supplies", "16/mo — unchanged", "falling gradually"],
    answer: 2,
    explain: "producingB = workersB × productivity = 8 × 2 = 16/mo, and nothing in this molecule connects it to Inventory A. The empty stock is ignored (in Vensim it would go negative; here it is pinned at zero), so Inventory B keeps filling with widgets that were never made. That is the flaw Cascade Protected by PDY fixes.",
    preset: { workersA: 2, workersB: 8, workersC: 4, workersD: 4, productivity: 2 },
  },
  cascadeProtByPDY: {
    q: "Crew A stops completely (0 workers) while crews B, C and D keep working. The three inventories…",
    options: ["go negative one after another", "drop to zero in a straight line and stop dead", "drain smoothly toward zero, never below", "stay where they are"],
    answer: 2,
    explain: "As each stock falls below the amount needed for full productivity, the crew draining it becomes less productive, so the outflow fades in step with the stock. The shortage passes down the chain as a slowdown: B empties first, then C, then D, all approaching zero without crossing it.",
    preset: { workersA: 0, workersB: 14, workersC: 12, workersD: 16, required: 60 },
  },
};

export const PRESETS_C: Record<string, Preset[]> = {
  abilityFromAction: [
    { label: "10 resources", params: { flow: 60, resource: 10, measureTime: 2 } },
    { label: "Same flow, 20 resources", params: { flow: 60, resource: 20, measureTime: 2 } },
    { label: "Double the flow", params: { flow: 120, resource: 10, measureTime: 2 } },
  ],
  estProductivity: [
    { label: "Baseline", params: { workforce: 10, actualPDY: 5, perceptionTime: 3 } },
    { label: "Double the workforce", params: { workforce: 20, actualPDY: 5, perceptionTime: 3 } },
    { label: "Slow to perceive", params: { workforce: 10, actualPDY: 8, perceptionTime: 8 } },
  ],
  desiredWorkforce: [
    { label: "Staff up", params: { desiredRate: 120, productivity: 4, adjTime: 4 } },
    { label: "Higher productivity", params: { desiredRate: 120, productivity: 6, adjTime: 4 } },
    { label: "Workload falls", params: { desiredRate: 20, productivity: 4, adjTime: 4 } },
  ],
  protByPDY: [
    { label: "Run the backlog down", params: { workers: 10, normalPDY: 5, required: 60, newWork: 0 } },
    { label: "Steady new work", params: { workers: 10, normalPDY: 5, required: 60, newWork: 20 } },
    { label: "Early taper", params: { workers: 10, normalPDY: 5, required: 150, newWork: 0 } },
  ],
  buildingInventory: [
    { label: "Pure build-up", params: { workers: 10, productivity: 2, shipments: 0 } },
    { label: "Shipments = production", params: { workers: 10, productivity: 2, shipments: 20 } },
    { label: "Shipments outrun production", params: { workers: 5, productivity: 2, shipments: 30 } },
  ],
  doingWorkCascade: [
    { label: "Unbalanced crews", params: { workersA: 5, workersB: 6, workersC: 4, workersD: 4, productivity: 2 } },
    { label: "Balanced line", params: { workersA: 5, workersB: 5, workersC: 5, workersD: 5, productivity: 2 } },
    { label: "Starve stage A (the flaw)", params: { workersA: 2, workersB: 8, workersC: 4, workersD: 4, productivity: 2 } },
  ],
  cascadeProtByPDY: [
    { label: "Settling chain", params: { workersA: 10, workersB: 14, workersC: 12, workersD: 16, required: 60 } },
    { label: "Feed stops", params: { workersA: 0, workersB: 14, workersC: 12, workersD: 16, required: 60 } },
    { label: "Bottleneck at C", params: { workersA: 10, workersB: 14, workersC: 8, workersD: 16, required: 60 } },
  ],
};

// Immediate parents, using app keys. Book parents not present in the app are mapped
// to the nearest existing molecule (see notes):
//   Action from Resource / Resources from Action / Producing → doingWork
//   Univariate Anchoring and Adjustment (child of Dmnl Input to Function) → effectFunction
export const LINEAGE_C: Record<string, string[]> = {
  abilityFromAction: ["doingWork"],
  estProductivity: ["abilityFromAction", "doingWork"],
  desiredWorkforce: ["doingWork"],
  protByPDY: ["doingWork", "effectFunction"],
  buildingInventory: ["doingWork"],
  doingWorkCascade: ["cascade", "buildingInventory", "doingWork"],
  cascadeProtByPDY: ["protByPDY", "doingWorkCascade"],
};
