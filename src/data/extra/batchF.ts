// Batch F: two system archetypes as runnable molecules (Senge 1990), built from the same parts as the book's molecules.
// Tragedy of the commons: two fleets grow on their own catch while sharing one renewable stock.
// Shifting the burden: quick fixes relieve the symptom, but patched problems return and firefighting crowds out the
// capability that would solve them for good.
import type { Model } from "@/data/molecules";
import type { FlowMeta } from "@/data/diagramMeta";
import type { Lesson } from "@/data/lessons";
import type { Preset } from "@/data/presets";

const C = { acc: "#2545ff", acc2: "#d9480f", good: "#0f8a5f", pink: "#c2255c" }; // same series palette as molecules.ts
const K = 100; // carrying capacity of the fishery, thousand tonnes
const EPS = 1e-9;

// catch per boat falls with the stock; a total catch limit, when set, caps the fleets' combined catch
function fishery(s: Record<string, number>, p: Record<string, number>) {
  const perBoatPotential = (p.catchFull * s.res) / K;
  const potential = (s.fa + s.fb) * perBoatPotential;
  const harvest = p.quota > 0 ? Math.min(potential, p.quota) : potential;
  const perBoat = harvest / (s.fa + s.fb + EPS);
  return { harvest, signal: perBoat / p.breakEven - 1 }; // signal > 0: boats pay, so fleets grow
}

// quick fixes take team capacity first; what is left builds capability
function burden(s: Record<string, number>, p: Record<string, number>) {
  const quick = Math.min(p.share * s.prob, p.capacity);
  return { quick, spare: Math.max(0, 1 - quick / p.capacity) };
}

export const MODELS_F: Record<string, Model> = {
  tragedyCommons: {
    name: "Tragedy of the Commons",
    title: "Tragedy of the Commons (shared renewable resource)",
    timeUnit: "yr",
    unitY: "kt of fish / boats",
    lede: "Two fleets fish one stock. Each grows while its boats pay, and each boat's catch falls as the shared stock falls. Nobody chooses the collapse; the structure does.",
    stocks: [
      { id: "res", label: "Fish stock (kt)", init: 90, scale: 100, color: C.good, floor: true },
      { id: "fa", label: "Fleet A (boats)", init: 4, scale: 80, color: C.acc, floor: true },
      { id: "fb", label: "Fleet B (boats)", init: 4, scale: 80, color: C.acc2, floor: true },
    ],
    params: [
      { id: "r", label: "Regrowth rate", min: 0.1, max: 1, step: 0.05, value: 0.4, unit: "/yr" },
      { id: "catchFull", label: "Max catch per boat", min: 0.5, max: 3, step: 0.1, value: 1, unit: "kt/yr" },
      { id: "breakEven", label: "Break-even catch", min: 0.1, max: 1, step: 0.05, value: 0.25, unit: "kt/yr" },
      { id: "gA", label: "Fleet A expansion", min: 0, max: 1, step: 0.05, value: 0.4, unit: "/yr" },
      { id: "gB", label: "Fleet B expansion", min: 0, max: 1, step: 0.05, value: 0.4, unit: "/yr" },
      { id: "quota", label: "Catch limit (0 = none)", min: 0, max: 10, step: 0.5, value: 0, unit: "kt/yr" },
    ],
    rates: (s, p) => {
      const { harvest, signal } = fishery(s, p);
      return {
        regen: p.r * s.res * (1 - s.res / K),
        harvest,
        buildA: s.fa * p.gA * Math.max(0, signal),
        scrapA: s.fa * p.gA * Math.max(0, -signal),
        buildB: s.fb * p.gB * Math.max(0, signal),
        scrapB: s.fb * p.gB * Math.max(0, -signal),
      };
    },
    derivs: (_s, _p, r) => ({ res: r.regen - r.harvest, fa: r.buildA - r.scrapA, fb: r.buildB - r.scrapB }),
    diagram: {
      stocks: { res: { x: 345, y: 30, w: 140, h: 90 }, fa: { x: 150, y: 180, w: 110, h: 90 }, fb: { x: 545, y: 180, w: 110, h: 90 } },
      flows: [
        { id: "regen", pts: [[120, 75], [345, 75]], to: "res", max: 12, color: C.good },
        { id: "harvest", pts: [[485, 75], [700, 75]], from: "res", max: 20, color: C.good },
        { id: "buildA", pts: [[40, 225], [150, 225]], to: "fa", max: 10 },
        { id: "scrapA", pts: [[260, 225], [350, 225]], from: "fa", max: 10 },
        { id: "buildB", pts: [[450, 225], [545, 225]], to: "fb", max: 10, color: C.acc2 },
        { id: "scrapB", pts: [[655, 225], [780, 225]], from: "fb", max: 10, color: C.acc2 },
      ],
    },
    cld: {
      size: [560, 300],
      vars: [
        { id: "fs", label: "Fish stock", x: 280, y: 40 },
        { id: "cpb", label: "Catch per boat", x: 280, y: 165 },
        { id: "fa", label: "Fleet A", x: 70, y: 110 },
        { id: "ac", label: "Fleet A's catch", x: 130, y: 260 },
        { id: "fb", label: "Fleet B", x: 490, y: 110 },
        { id: "bc", label: "Fleet B's catch", x: 430, y: 260 },
      ],
      links: [
        { from: "fa", to: "fs", sign: "−", curve: -30 },
        { from: "fb", to: "fs", sign: "−", curve: 30 },
        { from: "fs", to: "cpb", sign: "+" },
        { from: "cpb", to: "ac", sign: "+" },
        { from: "cpb", to: "bc", sign: "+" },
        { from: "fa", to: "ac", sign: "+", curve: -45 },
        { from: "ac", to: "fa", sign: "+", curve: -45 },
        { from: "fb", to: "bc", sign: "+", curve: 45 },
        { from: "bc", to: "fb", sign: "+", curve: 45 },
      ],
      loops: [
        { type: "R", label: "R1", x: 98, y: 186 },
        { type: "R", label: "R2", x: 462, y: 186 },
        { type: "B", label: "B1", x: 190, y: 140 },
        { type: "B", label: "B2", x: 370, y: 140 },
      ],
      caption:
        '<span class="chip chipR">R1</span><span class="chip chipR">R2</span> Each fleet grows on its own catch: more boats, more catch, more money for boats. <span class="chip chipB">B1</span><span class="chip chipB">B2</span> Both fleets draw down the <b>same</b> stock, so every boat\'s catch falls. Each fleet gains the whole of its own catch but bears only part of the fall in the stock, so both keep building until boats stop paying, by which point the stock is far below the level that gives the largest sustainable catch.',
    },
    desc: `<p>A renewable resource regrows fastest at half its carrying capacity (logistic growth). Two users harvest it. Each one's capital grows while its boats earn more than they cost and shrinks when they earn less. The catch per boat depends on the <b>shared</b> stock, so each fleet's expansion lowers everyone's returns. The archetype is Hardin's tragedy of the commons; the formulation is the standard open-access fishery of bioeconomics.</p>
    <div class="eq">Fish = INTEG(regrowth − catch, 90) ; regrowth = r × Fish × (1 − Fish / 100)<br>catch per boat = CatchFull × Fish / 100 ; catch = (FleetA + FleetB) × catch per boat (capped by the limit if one is set)<br>FleetA = INTEG(FleetA × growthA × (catch per boat / BreakEven − 1), 4) ; Fleet B likewise</div>
    <div class="whenbox"><h3>When to use it</h3>
    Whenever several actors draw on one stock that regrows (fish, grazing land, groundwater, antibiotic effectiveness, a shared IT budget, a team's attention) and each actor's reward comes from its own use while the cost is shared. The lever is in the structure, not in any one actor's restraint: try the catch limit.</div>
    <h3>Real-world examples</h3>
    <ul>
      <li><b>Fisheries</b>: fleets build boats in the good years and the stock collapses, as in the Grand Banks cod fishery.</li>
      <li><b>Healthcare</b>: every prescriber benefits from an antibiotic, while resistance is shared by all.</li>
      <li><b>Organisations</b>: teams all draw on one shared platform or specialist group until queues make it useless to everyone.</li>
    </ul>
    <div class="worked"><h3>Worked example</h3>
    With r = 0.4 the largest sustainable catch is <code>r × 100 / 4 = 10</code> kt a year, at a stock of 50. A boat breaks even when it catches 0.25 kt, which happens when the stock is <code>0.25 / 1 × 100 = 25</code>. Open access therefore drives the stock towards 25, half the best level, and the overshoot on the way takes it to about 9 within ten years. Stop Fleet B expanding and the stock still falls to about 9: Fleet A simply takes the catch B left. Set a total catch limit of 8 and the stock holds near 72 with a steady catch of 8, more than open access lands on average.</div>
    <h3>References</h3>
    <ul class="refs">
      <li>Hardin, G. (1968). The tragedy of the commons. <i>Science</i>, 162(3859), 1243-1248.</li>
      <li>Senge, P. M. (1990). <i>The Fifth Discipline</i>. Doubleday. Appendix 2, system archetypes.</li>
      <li>Moxnes, E. (1998). Not only the tragedy of the commons: misperceptions of bioeconomics. <i>Management Science</i>, 44(9), 1234-1248.</li>
      <li>Ostrom, E. (1990). <i>Governing the Commons</i>. Cambridge University Press.</li>
    </ul>`,
  },

  shiftingBurden: {
    name: "Shifting the Burden",
    title: "Shifting the Burden (quick fixes and the capability trap)",
    timeUnit: "wk",
    unitY: "problems / capability index",
    lede: "Quick fixes make problems disappear for now, but patched problems come back, and every hour spent firefighting is an hour not spent on the capability that would stop problems at the source.",
    stocks: [
      { id: "prob", label: "Open problems", init: 73, scale: 300, color: C.pink, floor: true },
      { id: "patched", label: "Patched problems", init: 292, scale: 700, color: "#8b98a9", chartHidden: true, floor: true },
      { id: "cap", label: "Capability (0-100)", init: 53, scale: 100, color: C.good },
    ],
    params: [
      { id: "load", label: "Problem load", min: 2, max: 20, step: 0.5, value: 10, unit: "/wk" },
      { id: "share", label: "Share patched quickly", min: 0, max: 1, step: 0.05, value: 0.5, unit: "" },
      { id: "tRet", label: "Patch life", min: 2, max: 20, step: 1, value: 8, unit: "wk" },
      { id: "capacity", label: "Team capacity", min: 40, max: 160, step: 5, value: 80, unit: "fixes/wk" },
      { id: "tBuild", label: "Time to build skill", min: 4, max: 40, step: 1, value: 12, unit: "wk" },
    ],
    rates: (s, p) => {
      const { quick, spare } = burden(s, p);
      return {
        arise: p.load * (1.5 - s.cap / 100), // weak capability lets more problems through
        quick,
        resurface: s.patched / p.tRet,
        solve: ((1 - p.share) * s.prob * (s.cap / 100)) / 2, // a fundamental fix takes about 2 weeks and needs capability
        build: (spare * (100 - s.cap)) / p.tBuild,
        erode: s.cap / 25, // skills and practices fade without use, over about 25 weeks
      };
    },
    derivs: (_s, _p, r) => ({ prob: r.arise - r.quick + r.resurface - r.solve, patched: r.quick - r.resurface, cap: r.build - r.erode }),
    diagram: {
      stocks: { cap: { x: 520, y: 22, w: 130, h: 85 }, prob: { x: 230, y: 160, w: 130, h: 100 }, patched: { x: 520, y: 170, w: 130, h: 90 } },
      flows: [
        { id: "build", pts: [[400, 64], [520, 64]], to: "cap", max: 6, color: C.good },
        { id: "erode", pts: [[650, 64], [785, 64]], from: "cap", max: 6, color: C.good },
        { id: "arise", pts: [[40, 215], [230, 215]], to: "prob", max: 15, color: C.pink },
        { id: "quick", pts: [[360, 192], [520, 192]], from: "prob", to: "patched", max: 80, color: C.pink },
        { id: "resurface", pts: [[520, 240], [360, 240]], from: "patched", to: "prob", max: 80, color: "#8b98a9" },
        { id: "solve", pts: [[242, 160], [242, 118], [150, 118]], from: "prob", max: 20, color: C.pink },
      ],
    },
    cld: {
      size: [560, 300],
      vars: [
        { id: "op", label: "Open problems", x: 90, y: 150 },
        { id: "qf", label: "Quick fixes", x: 290, y: 60 },
        { id: "pp", label: "Patched problems", x: 470, y: 60 },
        { id: "ff", label: "Fundamental fixes", x: 290, y: 245 },
        { id: "cap", label: "Capability", x: 470, y: 175 },
      ],
      links: [
        { from: "op", to: "qf", sign: "+", curve: 45 },
        { from: "qf", to: "op", sign: "−", curve: 45 },
        { from: "op", to: "ff", sign: "+", curve: -45 },
        { from: "ff", to: "op", sign: "−", curve: -45 },
        { from: "qf", to: "pp", sign: "+", curve: 18 },
        { from: "pp", to: "op", sign: "+", curve: -95, note: "delay" },
        { from: "qf", to: "cap", sign: "−" },
        { from: "cap", to: "ff", sign: "+" },
      ],
      loops: [
        { type: "B", label: "B1", x: 190, y: 105 },
        { type: "B", label: "B2", x: 190, y: 200 },
        { type: "R", label: "R1", x: 330, y: 205 },
        { type: "R", label: "R2", x: 430, y: 118 },
      ],
      caption:
        '<span class="chip chipB">B1</span> <b>Quick fixes</b> remove open problems within a week. <span class="chip chipB">B2</span> <b>Fundamental fixes</b> remove them for good, but only as fast as capability allows. <span class="chip chipR">R1</span> Quick fixes use up the team, so less capability is built, fewer problems are fixed at the source, and more need quick fixes: the burden shifts. <span class="chip chipR">R2</span> Patched problems come back after a <b>delay</b> and need patching again.',
    },
    desc: `<p>A team faces a steady flow of problems. It can <b>patch</b> them quickly or <b>fix</b> them properly. A patch makes the problem disappear from the open list at once, but after a while the patch fails and the problem returns. A proper fix is slower and depends on the team's <b>capability</b> (skills, tools, maintained equipment), which is built with whatever capacity is left after firefighting, and fades if not maintained. This is Senge's shifting-the-burden archetype, and the capability trap that Repenning and Sterman found in manufacturing and product development.</p>
    <div class="eq">quick fixes = MIN(Share × OpenProblems, Capacity) ; resurfacing = Patched / TimeUntilPatchFails<br>fundamental fixes = (1 − Share) × OpenProblems × Capability/100 / 2 wk<br>Capability = INTEG((1 − quick fixes / Capacity) × (100 − Capability) / TimeToBuild − Capability / 25 wk, 53)<br>problems arising = Load × (1.5 − Capability/100)</div>
    <div class="whenbox"><h3>When to use it</h3>
    Whenever a fast, visible remedy competes with a slow one for the same people or money: firefighting against preventive maintenance, overtime against hiring and training, painkillers against physiotherapy, short-term loans against restructuring. Watch the first weeks after a policy change, then the next year: the two tell opposite stories.</div>
    <h3>Real-world examples</h3>
    <ul>
      <li><b>Manufacturing</b>: reactive repairs crowd out preventive maintenance, so breakdowns rise (the DuPont maintenance case).</li>
      <li><b>Healthcare</b>: agency staff cover shortages while recruitment and training of permanent staff stall.</li>
      <li><b>Software</b>: hot-fixes ship on time while technical debt builds and slows every later change.</li>
    </ul>
    <div class="worked"><h3>Worked example</h3>
    The model starts in balance: half the problems are patched, 73 are open and capability is 53. Raise the share patched to 0.8 and open problems <b>fall</b> to about 63 within 8 weeks: the policy looks right. But capability erodes (about 28 by week 40) because firefighting takes more of the team, fewer problems are fixed at the source, and by week 48 the quick fixes need the whole team. After that problems climb without limit, past 750 by week 104. Lower the share to 0.2 instead and open problems <b>rise</b> to about 84 at first, then fall to 32 as capability grows to 66: worse before better.</div>
    <h3>References</h3>
    <ul class="refs">
      <li>Senge, P. M. (1990). <i>The Fifth Discipline</i>. Doubleday. Appendix 2, system archetypes.</li>
      <li>Repenning, N. P. &amp; Sterman, J. D. (2001). Nobody ever gets credit for fixing problems that never happened. <i>California Management Review</i>, 43(4), 64-88.</li>
      <li>Sterman, J. D. (2000). <i>Business Dynamics</i>. Irwin/McGraw-Hill. The DuPont maintenance case, pp. 66-79.</li>
    </ul>`,
  },
};

export const FLOW_META_F: Record<string, Record<string, FlowMeta>> = {
  tragedyCommons: {
    regen: { name: "regrowth", eq: "r × Fish × (1 − Fish / 100)", in: ["r", "res"], loop: { res: "R" } },
    harvest: { name: "catch", eq: "(FleetA + FleetB) × CatchFull × Fish / 100, capped by the catch limit", in: ["fa", "fb", "res", "quota"], loop: { res: "B" } },
    buildA: { name: "building (A)", eq: "FleetA × growthA × MAX(0, catch per boat / BreakEven − 1)", in: ["fa", "res", "gA", "breakEven"], loop: { fa: "R" } },
    scrapA: { name: "scrapping (A)", eq: "FleetA × growthA × MAX(0, 1 − catch per boat / BreakEven)", in: ["fa", "res"] },
    buildB: { name: "building (B)", eq: "FleetB × growthB × MAX(0, catch per boat / BreakEven − 1)", in: ["fb", "res", "gB", "breakEven"], loop: { fb: "R" } },
    scrapB: { name: "scrapping (B)", eq: "FleetB × growthB × MAX(0, 1 − catch per boat / BreakEven)", in: ["fb", "res"] },
  },
  shiftingBurden: {
    arise: { name: "problems arising", eq: "Load × (1.5 − Capability / 100)", in: ["load", "cap"] },
    quick: { name: "quick fixes", eq: "MIN(Share × OpenProblems, Capacity)", in: ["share", "prob", "capacity"], loop: { prob: "B" } },
    resurface: { name: "patches failing", eq: "Patched / TimeUntilPatchFails", in: ["patched", "tRet"] },
    solve: { name: "fundamental fixes", eq: "(1 − Share) × OpenProblems × Capability / 100 / 2 wk", in: ["prob", "cap"], loop: { prob: "B" } },
    build: { name: "building capability", eq: "(1 − quick fixes / Capacity) × (100 − Capability) / TimeToBuild", in: ["capacity", "tBuild", "cap"] },
    erode: { name: "capability fading", eq: "Capability / 25 wk", in: ["cap"], loop: { cap: "B" } },
  },
};

export const DIAGRAM_EXTRA_F: Record<string, { stocks: [string, string][]; aux?: [string, string][] }> = {
  tragedyCommons: {
    stocks: [
      ["Fish stock", "INTEG(regrowth − catch, 90)"],
      ["Fleet A", "INTEG(building boats (A) − scrapping boats (A), 4)"],
      ["Fleet B", "INTEG(building boats (B) − scrapping boats (B), 4)"],
    ],
    aux: [
      ["catch per boat", "CatchFull × Fish / 100, or the limit shared over all boats when a catch limit binds"],
      ["profit signal", "catch per boat / BreakEven − 1"],
      ["largest sustainable catch", "r × 100 / 4, at a fish stock of 50"],
    ],
  },
  shiftingBurden: {
    stocks: [
      ["Open problems", "INTEG(problems arising + patches failing − quick fixes − fundamental fixes, 73)"],
      ["Patched problems", "INTEG(quick fixes − patches failing, 292)"],
      ["Capability", "INTEG(building capability − capability fading, 53)"],
    ],
    aux: [["spare capacity", "1 − quick fixes / Capacity: what firefighting leaves for building capability"]],
  },
};

export const LESSONS_F: Record<string, Lesson> = {
  tragedyCommons: {
    q: "To protect the fish, Fleet B stops expanding (its expansion set to 0) while Fleet A carries on. Ten years later the fish stock is…",
    options: ["much higher than if both expanded: B's restraint saved it", "about as low as if both expanded: Fleet A takes the catch B gave up", "higher for a while, then exactly as before", "lower, because Fleet B's boats now catch more each"],
    answer: 1,
    explain: "With both fleets expanding the stock falls from 90 to about 9 by year 10; with Fleet B held at 4 boats it still falls to about 9, because Fleet A grows to about 76 boats at its peak instead of 43. As long as boats pay, someone builds them. Only a limit on the total catch protects the stock.",
    preset: { gB: 0 },
  },
  shiftingBurden: {
    q: "Starting from balance, the share of problems patched quickly rises from 0.5 to 0.8. Over the following year, open problems…",
    options: ["rise at once and keep rising", "fall at first, then climb far above where they started", "fall and stay lower", "do not change, because the team's capacity is the same"],
    answer: 1,
    explain: "Patches clear the list fast, so open problems fall from 73 to about 63 within 8 weeks. But firefighting leaves less capacity for building capability, which fades from 53 to about 20 by week 48, so fewer problems are fixed at the source and more come back. By week 104 over 750 problems are open: better before worse.",
    preset: { share: 0.8 },
  },
};

export const PRESETS_F: Record<string, Preset[]> = {
  tragedyCommons: [
    { label: "Open access", params: { r: 0.4, catchFull: 1, breakEven: 0.25, gA: 0.4, gB: 0.4, quota: 0 } },
    { label: "One fleet holds back", params: { r: 0.4, catchFull: 1, breakEven: 0.25, gA: 0.4, gB: 0, quota: 0 } },
    { label: "Catch limit of 8", params: { r: 0.4, catchFull: 1, breakEven: 0.25, gA: 0.4, gB: 0.4, quota: 8 } },
    { label: "Slow-growing stock", params: { r: 0.2, catchFull: 1, breakEven: 0.25, gA: 0.4, gB: 0.4, quota: 0 } },
  ],
  shiftingBurden: [
    { label: "Balanced", params: { load: 10, share: 0.5, tRet: 8, capacity: 80, tBuild: 12 } },
    { label: "Firefighting", params: { load: 10, share: 0.8, tRet: 8, capacity: 80, tBuild: 12 } },
    { label: "Invest in the fix", params: { load: 10, share: 0.2, tRet: 8, capacity: 80, tBuild: 12 } },
    { label: "Patches fail fast", params: { load: 10, share: 0.5, tRet: 3, capacity: 80, tBuild: 12 } },
  ],
};

export const LINEAGE_F: Record<string, string[]> = {
  tragedyCommons: ["logistic", "actionFromResource"],
  shiftingBurden: ["closegap", "decay"],
};
