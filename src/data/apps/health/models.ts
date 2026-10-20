// Runnable simulations for the healthcare case library.
// Three are purpose-built health models; the rest reuse a Hines molecule under health names ("skins"),
// so a learner sees the same structure they met in the catalogue doing a clinical job.
import type { Model } from "@/data/molecules";
import type { FlowMeta } from "@/data/diagramMeta";
import { built, skins, type Skin } from "@/data/apps/sim";

const C = { acc: "#2545ff", acc2: "#d9480f", good: "#0f8a5f", pink: "#c2255c", info: "#6b74a6" };
const N = 10000; // epidemic population

const sir: Model = {
  name: "Epidemic (SIR)",
  title: "Epidemic with vaccination and distancing",
  timeUnit: "day",
  unitY: "people",
  lede: "Susceptible, infected, recovered: the Kermack–McKendrick structure behind every outbreak model.",
  stocks: [
    { id: "s", label: "Susceptible", init: N - 10, scale: N, color: C.acc },
    { id: "i", label: "Infected", init: 10, scale: N / 2, color: C.pink },
    { id: "r", label: "Recovered or immune", init: 0, scale: N, color: C.good },
  ],
  params: [
    { id: "r0", label: "Basic reproduction number R₀", min: 0.5, max: 8, step: 0.1, value: 3, unit: "" },
    { id: "dur", label: "Infectious period", min: 2, max: 21, step: 0.5, value: 7, unit: "days" },
    { id: "dist", label: "Contact reduction", min: 0, max: 80, step: 1, value: 0, unit: "%" },
    { id: "vacc", label: "Vaccination rate", min: 0, max: 5, step: 0.1, value: 0, unit: "%/day" },
  ],
  rates: (s, p) => {
    const beta = (p.r0 * (1 - p.dist / 100)) / p.dur;
    return { infect: (beta * s.s * s.i) / N, recover: s.i / p.dur, vaccinate: (p.vacc / 100) * s.s };
  },
  derivs: (_s, _p, r) => ({ s: -r.infect - r.vaccinate, i: r.infect - r.recover, r: r.recover + r.vaccinate }),
  diagram: {
    stocks: {
      s: { x: 110, y: 80, w: 100, h: 100 },
      i: { x: 355, y: 80, w: 100, h: 100 },
      r: { x: 600, y: 80, w: 100, h: 100 },
    },
    flows: [
      { id: "infect", pts: [[210, 130], [355, 130]], from: "s", to: "i", max: 2000, color: C.pink },
      { id: "recover", pts: [[455, 130], [600, 130]], from: "i", to: "r", max: 2000 },
      { id: "vaccinate", pts: [[160, 180], [160, 222], [650, 222], [650, 180]], from: "s", to: "r", max: 500, color: C.good },
    ],
  },
  cld: {
    vars: [
      { id: "s", label: "Susceptible", x: 90, y: 70 },
      { id: "i", label: "Infected", x: 400, y: 70 },
      { id: "f", label: "Infections", x: 245, y: 200 },
      { id: "rec", label: "Recoveries", x: 450, y: 215 },
    ],
    links: [
      { from: "i", to: "f", sign: "+", curve: -40 },
      { from: "f", to: "i", sign: "+", curve: -40 },
      { from: "s", to: "f", sign: "+", curve: 40 },
      { from: "f", to: "s", sign: "−", curve: 40 },
      { from: "i", to: "rec", sign: "+", curve: 30 },
      { from: "rec", to: "i", sign: "−", curve: 30 },
    ],
    loops: [
      { type: "R", label: "R1", x: 330, y: 130 },
      { type: "B", label: "B1", x: 160, y: 130 },
      { type: "B", label: "B2", x: 470, y: 150 },
    ],
    caption:
      '<span class="chip chipR">R</span> More infected people make more infections (contagion). <span class="chip chipB">B</span> Each infection uses up a susceptible, and each infected person eventually recovers. The outbreak turns when R₀ × (susceptible share) falls below 1, which is why vaccinating a share <code>1 − 1/R₀</code> of the population prevents spread.',
  },
  desc: "",
};

const patientFlow: Model = {
  name: "Hospital patient flow",
  title: "Emergency admissions, beds and delayed discharge",
  timeUnit: "day",
  unitY: "patients",
  lede: "Patients queue in the emergency department for a bed, stay for treatment, then wait again for a place in community care.",
  stocks: [
    { id: "wait", label: "Waiting in ED for a bed", init: 10, scale: 200, color: C.pink },
    { id: "ward", label: "In hospital, needing care", init: 405, scale: 600, color: C.acc },
    { id: "fit", label: "Medically fit, awaiting discharge", init: 45, scale: 300, color: C.acc2 },
  ],
  params: [
    { id: "arrivals", label: "Emergency admissions", min: 50, max: 130, step: 1, value: 90, unit: "/day" },
    { id: "beds", label: "Beds", min: 400, max: 650, step: 5, value: 500, unit: "" },
    { id: "los", label: "Length of acute stay", min: 2, max: 9, step: 0.1, value: 4.5, unit: "days" },
    { id: "outCap", label: "Community care placements", min: 50, max: 130, step: 1, value: 95, unit: "/day" },
  ],
  rates: (s, p) => {
    const free = Math.max(0, p.beds - s.ward - s.fit);
    return {
      arrive: p.arrivals,
      admit: Math.min(s.wait, free) / 0.2, // a free bed is filled within a few hours
      becomeFit: s.ward / p.los,
      discharge: Math.min(s.fit / 0.5, p.outCap),
    };
  },
  derivs: (_s, _p, r) => ({ wait: r.arrive - r.admit, ward: r.admit - r.becomeFit, fit: r.becomeFit - r.discharge }),
  diagram: {
    stocks: {
      wait: { x: 110, y: 80, w: 100, h: 100 },
      ward: { x: 355, y: 80, w: 100, h: 100 },
      fit: { x: 600, y: 80, w: 100, h: 100 },
    },
    flows: [
      { id: "arrive", pts: [[20, 130], [110, 130]], to: "wait", max: 150 },
      { id: "admit", pts: [[210, 130], [355, 130]], from: "wait", to: "ward", max: 150 },
      { id: "becomeFit", pts: [[455, 130], [600, 130]], from: "ward", to: "fit", max: 150 },
      { id: "discharge", pts: [[700, 130], [800, 130]], from: "fit", max: 150, color: C.good },
    ],
  },
  cld: {
    vars: [
      { id: "w", label: "ED waiting", x: 80, y: 70 },
      { id: "a", label: "Admissions", x: 260, y: 70 },
      { id: "o", label: "Beds occupied", x: 440, y: 70 },
      { id: "fb", label: "Free beds", x: 350, y: 205 },
      { id: "d", label: "Delayed discharges", x: 130, y: 205 },
    ],
    links: [
      { from: "w", to: "a", sign: "+", curve: -30 },
      { from: "a", to: "w", sign: "−", curve: -30 },
      { from: "a", to: "o", sign: "+", curve: -20 },
      { from: "o", to: "fb", sign: "−", curve: -20 },
      { from: "fb", to: "a", sign: "+", curve: -10 },
      { from: "d", to: "fb", sign: "−", curve: 0 },
    ],
    loops: [
      { type: "B", label: "B1", x: 140, y: 40 },
      { type: "B", label: "B2", x: 350, y: 120 },
    ],
    caption:
      '<span class="chip chipB">B</span> Admissions empty the ED queue, and fill beds, which limits further admissions. Patients waiting for community care keep their bed, so a shortfall in placements shows up as a <b>queue in the emergency department</b>, two steps upstream of where the problem is.',
  },
  desc: "",
};

const chronic: Model = {
  name: "Chronic disease progression",
  title: "Risk factor, disease and complications",
  timeUnit: "yr",
  unitY: "people",
  lede: "A population moves from no risk, to at-risk, to diagnosed disease, to complications. Prevention acts early in the chain; care quality acts late.",
  stocks: [
    { id: "well", label: "No risk factor", init: 7000, scale: 10000, color: C.good },
    { id: "risk", label: "At risk", init: 2000, scale: 5000, color: C.acc },
    { id: "dis", label: "With disease", init: 800, scale: 3000, color: C.acc2 },
    { id: "comp", label: "With complications", init: 200, scale: 1500, color: C.pink },
  ],
  params: [
    { id: "onset", label: "Risk-factor onset", min: 0, max: 8, step: 0.1, value: 3, unit: "%/yr" },
    { id: "prog", label: "Progression to disease", min: 0, max: 15, step: 0.1, value: 6, unit: "%/yr" },
    { id: "reach", label: "Prevention programme reach", min: 0, max: 100, step: 1, value: 0, unit: "%" },
    { id: "care", label: "Care quality (risk controlled)", min: 0, max: 100, step: 1, value: 40, unit: "%" },
  ],
  // ponytail: fixed effect sizes. Prevention cuts progression by 58% for those reached (lifestyle arm, Knowler 2002);
  // good control halves complication onset. Make them sliders if learners need to test the evidence.
  rates: (s, p) => ({
    entry: 150,
    onset: (p.onset / 100) * s.well,
    progress: (p.prog / 100) * (1 - 0.58 * (p.reach / 100)) * s.risk,
    complicate: 0.08 * (1 - 0.5 * (p.care / 100)) * s.dis,
    deaths: s.comp / 8,
  }),
  derivs: (_s, _p, r) => ({ well: r.entry - r.onset, risk: r.onset - r.progress, dis: r.progress - r.complicate, comp: r.complicate - r.deaths }),
  diagram: {
    stocks: {
      well: { x: 70, y: 80, w: 92, h: 100 },
      risk: { x: 255, y: 80, w: 92, h: 100 },
      dis: { x: 440, y: 80, w: 92, h: 100 },
      comp: { x: 625, y: 80, w: 92, h: 100 },
    },
    flows: [
      { id: "entry", pts: [[8, 130], [70, 130]], to: "well", max: 400 },
      { id: "onset", pts: [[162, 130], [255, 130]], from: "well", to: "risk", max: 400 },
      { id: "progress", pts: [[347, 130], [440, 130]], from: "risk", to: "dis", max: 400 },
      { id: "complicate", pts: [[532, 130], [625, 130]], from: "dis", to: "comp", max: 400 },
      { id: "deaths", pts: [[717, 130], [805, 130]], from: "comp", max: 400, color: C.pink },
    ],
  },
  cld: {
    vars: [
      { id: "w", label: "No risk", x: 50, y: 150 },
      { id: "r", label: "At risk", x: 175, y: 150 },
      { id: "d", label: "Disease", x: 300, y: 150 },
      { id: "c", label: "Complicated", x: 450, y: 150 },
      { id: "pv", label: "Prevention", x: 240, y: 245 },
      { id: "cq", label: "Care quality", x: 395, y: 245 },
    ],
    links: [
      { from: "w", to: "r", sign: "+", curve: -22 },
      { from: "r", to: "d", sign: "+", curve: -22 },
      { from: "d", to: "c", sign: "+", curve: -22 },
      { from: "pv", to: "d", sign: "−", curve: 0 },
      { from: "cq", to: "c", sign: "−", curve: 0 },
      { from: "w", to: "w", sign: "−", self: true },
      { from: "r", to: "r", sign: "−", self: true },
      { from: "d", to: "d", sign: "−", self: true },
    ],
    loops: [
      { type: "B", label: "B1", x: 50, y: 80 },
      { type: "B", label: "B2", x: 175, y: 80 },
      { type: "B", label: "B3", x: 300, y: 80 },
    ],
    caption:
      '<span class="chip chipB">B×3</span> Each stage drains into the next, so the chain behaves like an aging chain. Prevention slows the flow into disease and pays off over years; better care slows the flow into complications and pays off sooner. Neither shows up in prevalence right away, because the stocks are large compared with the flows.',
  },
  desc: "",
};

const flowMeta: Record<string, Record<string, FlowMeta>> = {
  sir: {
    infect: { name: "infection", eq: "R₀ × (1 − reduction) / period × S × I / N", in: ["s", "i", "r0", "dur", "dist"], loop: { s: "B", i: "R" } },
    recover: { name: "recovery", eq: "Infected / infectious period", in: ["i", "dur"], loop: "B" },
    vaccinate: { name: "vaccination", eq: "vaccination rate × Susceptible", in: ["s", "vacc"], loop: "B" },
  },
  patientFlow: {
    arrive: { name: "emergency admissions", eq: "admissions per day", in: ["arrivals"] },
    admit: { name: "admission to ward", eq: "MIN(Waiting, free beds) / 0.2 day", in: ["wait", "ward", "fit", "beds"], loop: { wait: "B", ward: "B" } },
    becomeFit: { name: "becoming medically fit", eq: "In hospital / length of stay", in: ["ward", "los"], loop: "B" },
    discharge: { name: "discharge", eq: "MIN(Awaiting / 0.5 day, placements)", in: ["fit", "outCap"], loop: "B" },
  },
  chronic: {
    entry: { name: "entering adulthood", eq: "150 per year", in: [] },
    onset: { name: "risk onset", eq: "onset rate × No risk", in: ["well", "onset"], loop: "B" },
    progress: { name: "progression", eq: "progression × (1 − 0.58 × reach) × At risk", in: ["risk", "prog", "reach"], loop: "B" },
    complicate: { name: "complications", eq: "8% × (1 − 0.5 × care) × Disease", in: ["dis", "care"], loop: "B" },
    deaths: { name: "deaths", eq: "Complications / 8 yr", in: ["comp"], loop: "B" },
  },
};
const extra = {
  sir: {
    stocks: [
      ["Susceptible", "INTEG(− infection − vaccination, N − 10)"],
      ["Infected", "INTEG(infection − recovery, 10)"],
      ["Recovered or immune", "INTEG(recovery + vaccination, 0)"],
    ] as [string, string][],
    aux: [["effective R", "R₀ × (1 − reduction) × S / N"], ["herd immunity threshold", "1 − 1 / R₀"]] as [string, string][],
  },
  patientFlow: {
    stocks: [
      ["Waiting in ED", "INTEG(arrivals − admission, 10)"],
      ["In hospital", "INTEG(admission − becoming fit, 405)"],
      ["Awaiting discharge", "INTEG(becoming fit − discharge, 45)"],
    ] as [string, string][],
    aux: [["free beds", "MAX(0, beds − In hospital − Awaiting discharge)"], ["occupancy", "(In hospital + Awaiting discharge) / beds"]] as [string, string][],
  },
  chronic: {
    stocks: [
      ["No risk factor", "INTEG(entry − onset, 7000)"],
      ["At risk", "INTEG(onset − progression, 2000)"],
      ["With disease", "INTEG(progression − complications, 800)"],
      ["With complications", "INTEG(complications − deaths, 200)"],
    ] as [string, string][],
  },
};

const SKINS: Record<string, Skin> = {
  hivCascade: {
    base: "broken",
    name: "HIV care cascade",
    unitY: "people",
    stocks: { l1: { label: "Diagnosed, not yet on treatment" }, l2: { label: "On treatment" } },
    params: {
      inflow: { label: "New diagnoses", value: 10 },
      tau: { label: "Time in each stage", unit: "mo" },
      leak: { label: "Share lost to follow-up", value: 0.3 },
    },
    flows: {
      in: ["new diagnoses", "diagnoses per month"],
      fwd: ["starting treatment", "(Diagnosed / τ)(1 − lost share)"],
      leak: ["lost to follow-up", "(Diagnosed / τ) × lost share"],
      out: ["leaving care", "On treatment / τ"],
    },
  },
  bodyWeight: {
    base: "closegap",
    name: "Body weight and energy balance",
    timeUnit: "mo",
    unitY: "kg",
    stocks: { actual: { label: "Body weight (kg)", init: 95, scale: 120 } },
    params: {
      goal: { label: "Weight the new intake supports", min: 60, max: 110, step: 1, value: 85, unit: "kg" },
      at: { label: "Time constant", min: 3, max: 36, step: 1, value: 17, unit: "mo" },
    },
    flows: { adj: ["weight change", "(supported weight − Body weight) / time constant"] },
  },
  ageingCare: {
    base: "aging",
    name: "Population ageing",
    unitY: "thousand people",
    stocks: { young: { label: "Children (0–17)" }, adult: { label: "Working age (18–64)" }, old: { label: "Older people (65+)" } },
    params: { births: { label: "Births", unit: "k/yr" }, tO: { label: "Life expectancy at 65" } },
    flows: { in: ["births", "births"], aYA: ["turning 18", "Children / 18 yr"], aAO: ["turning 65", "Working age / 47 yr"], deaths: ["deaths", "Older / life expectancy at 65"] },
  },
  waitingList: {
    base: "backlogFlow",
    name: "Elective waiting list",
    unitY: "patients",
    stocks: { backlog: { label: "Waiting list" } },
    params: {
      orders: { label: "Referrals", unit: "k/mo" },
      shipTime: { label: "Target wait", unit: "mo" },
      capacity: { label: "Treatment capacity", unit: "k/mo" },
    },
    flows: { in: ["referrals", "referrals per month"], ship: ["treated", "MIN(Waiting list / target wait, capacity)"] },
  },
  mentalHealthAccess: {
    base: "backlogFlow",
    name: "Access to mental-health care",
    unitY: "people",
    stocks: { backlog: { label: "Waiting for care" } },
    params: {
      orders: { label: "People seeking care", unit: "/mo" },
      shipTime: { label: "Target wait", unit: "mo" },
      capacity: { label: "Service capacity", unit: "/mo" },
    },
    flows: { in: ["seeking care", "referrals per month"], ship: ["starting care", "MIN(Waiting / target wait, capacity)"] },
  },
  supplyChain: {
    base: "stockmgmt",
    name: "Vaccine and medicine supply",
    unitY: "thousand doses",
    stocks: { sl: { label: "Doses on order" }, inv: { label: "Doses in clinics" } },
    params: {
      demand: { label: "Doses used", unit: "k/wk" },
      desInv: { label: "Target stock" },
      adj: { label: "Stock adjustment time" },
      acq: { label: "Delivery lead time" },
      slw: { label: "Counts doses on order" },
    },
    flows: { orders: ["orders", "use + stock gap / τ + pipeline gap / τ"], acquisition: ["deliveries", "On order / lead time"], sales: ["doses used", "doses used per week"] },
  },
  physicianPipeline: {
    base: "stockmgmt",
    name: "Clinician training pipeline",
    timeUnit: "yr",
    unitY: "clinicians",
    stocks: { sl: { label: "In training" }, inv: { label: "Practising clinicians" } },
    params: {
      demand: { label: "Retirements and exits", unit: "/yr" },
      desInv: { label: "Clinicians needed" },
      adj: { label: "Planning horizon", unit: "yr" },
      acq: { label: "Training duration", unit: "yr" },
      slw: { label: "Planners count trainees" },
    },
    flows: {
      orders: ["training places", "exits + workforce gap / τ + trainee gap / τ"],
      acquisition: ["qualifying", "In training / training duration"],
      sales: ["exits", "retirements and exits"],
    },
  },
  nurseFatigue: {
    base: "prodFatigue",
    name: "Nurse overtime and fatigue",
    unitY: "× normal",
    stocks: { fatigue: { label: "Fatigue" }, relOutput: { label: "Care delivered (× normal)" } },
    params: { overtime: { label: "Hours worked (× contract)" }, workforce: { label: "Nurses on the ward", unit: "" }, normalPDY: { label: "Care per nurse-hour" } },
    flows: { gettingFatigued: ["getting fatigued", "(hours worked − Fatigue) / time to fatigue"] },
  },
  outbreakDiffusion: {
    base: "diffusion",
    name: "Spread through contact",
    unitY: "people",
    stocks: { pot: { label: "Not yet affected" }, adopt: { label: "Affected" } },
    params: { p: { label: "Outside exposure p" }, q: { label: "Spread through contact q" } },
    flows: { adoption: ["new cases", "(p + q · Affected / N) × Not yet affected"] },
  },
};

export const HEALTH_MODELS: Record<string, Model> = {
  sir: built("sir", sir, flowMeta.sir, extra.sir),
  patientFlow: built("patientFlow", patientFlow, flowMeta.patientFlow, extra.patientFlow),
  chronic: built("chronic", chronic, flowMeta.chronic, extra.chronic),
  ...skins(SKINS),
};

// where each run should stop so the interesting part fills the chart (in the model's own time unit)
export const SIM_STOP: Record<string, number> = {
  sir: 150, patientFlow: 60, chronic: 30, hivCascade: 36, bodyWeight: 48, ageingCare: 100, waitingList: 60,
  mentalHealthAccess: 36, supplyChain: 60, physicianPipeline: 40, nurseFatigue: 30, outbreakDiffusion: 52,
};
