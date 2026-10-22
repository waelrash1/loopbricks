// Social systems and public policy case library.
// Every reference below was checked against Crossref, OpenAlex or a catalogue record (Oct 2026);
// findings quote the abstract or full text. Every runnable case is a skin of a catalogue molecule.
import type { AppCase, DataSource, Domain, Ref } from "@/data/apps/types";
import { skins, type Skin } from "@/data/apps/sim";

const THEMES = ["Cities, housing and infrastructure", "Crime, drugs and justice", "Welfare and education", "Information and policy design"] as const;

const REFS: Record<string, Ref> = {
  forrester1969: { text: "Forrester JW (1969). Urban Dynamics. MIT Press." },
  forrester1971: { text: "Forrester JW (1971). Counterintuitive behavior of social systems. Technology Review 73(3):52-68." },
  alfeld1995: { text: "Alfeld LE (1995). Urban dynamics: the first fifty years. System Dynamics Review 11(3):199-217.", doi: "10.1002/sdr.4260110303" },
  ghaffarzadegan2011: { text: "Ghaffarzadegan N, Lyneis J, Richardson GP (2011). How small system dynamics models can help the public policy process. System Dynamics Review 27(1):22-44.", doi: "10.1002/sdr.442" },
  marcal2023: { text: "Marçal KE, Fowler PJ, Hovmand PS (2023). Feedback dynamics of the low-income rental housing market: exploring policy responses to COVID-19. System Dynamics Review 39(4):371-403.", doi: "10.1002/sdr.1746" },
  homer1993: { text: "Homer JB (1993). A system dynamics model of national cocaine prevalence. System Dynamics Review 9(1):49-78.", doi: "10.1002/sdr.4260090104" },
  homer1993enf: { text: "Homer JB (1993). Projecting the impact of law enforcement on cocaine prevalence: a system dynamics approach. Journal of Drug Issues 23(2):281-295.", doi: "10.1177/002204269302300208" },
  olaya2018: { text: "Olaya C, Gómez-Quintero J, Navarrete AC (2018). Crime and punishment as a social system: the case of prison overcrowding. Kybernetes 47(2):369-391.", doi: "10.1108/K-05-2017-0190" },
  zagonel2004: { text: "Zagonel AA, Rohrbaugh J, Richardson GP, Andersen DF (2004). Using simulation models to address 'what if' questions about welfare reform. Journal of Policy Analysis and Management 23(4):890-901.", doi: "10.1002/pam.20054" },
  mendes2019: { text: "Mendes JP, Aleluia M (2019). Aging effects in public policy making. System Dynamics Review 35(3):232-254.", doi: "10.1002/sdr.1639" },
  larson2014: { text: "Larson RC, Ghaffarzadegan N, Xue Y (2014). Too many PhD graduates or too few academic job openings: the basic reproductive number R0 in academia. Systems Research and Behavioral Science 31(6):745-750.", doi: "10.1002/sres.2210" },
  daley1964: { text: "Daley DJ, Kendall DG (1964). Epidemics and rumours. Nature 204(4963):1118.", doi: "10.1038/2041118a0" },
  vosoughi2018: { text: "Vosoughi S, Roy D, Aral S (2018). The spread of true and false news online. Science 359(6380):1146-1151.", doi: "10.1126/science.aap9559" },
  sterman2000: { text: "Sterman JD (2000). Business Dynamics: Systems Thinking and Modeling for a Complex World. Irwin/McGraw-Hill." },
  sterman2006: { text: "Sterman JD (2006). Learning from evidence in a complex world. Am J Public Health 96(3):505-514.", doi: "10.2105/AJPH.2005.066043", pmid: "16449579" },
  fallahfini2010: { text: "Fallah-Fini S, Rahmandad H, Triantis K, de la Garza JM (2010). Optimizing highway maintenance operations: dynamic considerations. System Dynamics Review 26(3):216-238.", doi: "10.1002/sdr.449" },
  rashedi2016: { text: "Rashedi R, Hegazy T (2016). Holistic analysis of infrastructure deterioration and rehabilitation using system dynamics. Journal of Infrastructure Systems 22(1):04015016.", doi: "10.1061/(ASCE)IS.1943-555X.0000273" },
  friedman2006: { text: "Friedman S (2006). Is counter-productive policy creating serious consequences? The case of highway maintenance. System Dynamics Review 22(4):371-394.", doi: "10.1002/sdr.351" },
};

const SKINS: Record<string, Skin> = {
  soc_urbanHousing: {
    base: "aging",
    name: "Urban housing aging chain",
    unitY: "thousand dwellings",
    stocks: {
      young: { label: "New housing", init: 300, scale: 700 },
      adult: { label: "Mid-life housing", init: 600, scale: 1200 },
      old: { label: "Declining housing", init: 300, scale: 700 },
    },
    params: {
      births: { label: "Construction", unit: "k/yr" },
      tY: { label: "Years as new housing", value: 15 },
      tA: { label: "Years in mid-life", value: 30 },
      tO: { label: "Years before demolition", value: 15 },
    },
    flows: {
      in: ["construction", "dwellings built per year"],
      aYA: ["ageing into mid-life", "New housing / years as new"],
      aAO: ["ageing into decline", "Mid-life housing / years in mid-life"],
      deaths: ["demolition", "Declining housing / years before demolition"],
    },
  },
  soc_cocaine: {
    base: "broken",
    name: "Drug use: casual and compulsive",
    timeUnit: "yr",
    unitY: "hundred thousand users",
    stocks: { l1: { label: "Casual users", init: 80 }, l2: { label: "Compulsive users", init: 0 } },
    params: {
      inflow: { label: "New users", unit: "/yr" },
      tau: { label: "Years in each stage", unit: "yr" },
      leak: { label: "Share of casual users who quit", value: 0.8 },
    },
    flows: {
      in: ["initiation", "new users per year"],
      fwd: ["becoming compulsive", "(Casual users / years in stage)(1 − quit share)"],
      leak: ["quitting casual use", "(Casual users / years in stage) × quit share"],
      out: ["leaving compulsive use", "Compulsive users / years in stage"],
    },
  },
  soc_welfare: {
    base: "backlogFlow",
    name: "Welfare caseload",
    unitY: "thousand families",
    stocks: { backlog: { label: "Families receiving assistance", init: 100, scale: 300 } },
    params: {
      orders: { label: "New cases", unit: "k/mo" },
      shipTime: { label: "Typical time to move into work", min: 3, max: 36, step: 1, value: 12, unit: "mo" },
      capacity: { label: "Job placements the agency can make", unit: "k/mo" },
    },
    flows: { in: ["new cases", "new cases per month"], ship: ["leaving for work", "MIN(Caseload / typical time, placement capacity)"] },
  },
  soc_prison: {
    base: "residence",
    name: "Prison population",
    timeUnit: "yr",
    unitY: "thousand prisoners",
    stocks: { q: { label: "People in prison", init: 50, scale: 100 } },
    params: {
      inflow: { label: "Prison admissions", max: 60, value: 25, unit: "k/yr" },
      tau: { label: "Average time served", min: 0.5, max: 10, value: 2, unit: "yr" },
    },
    flows: { in: ["admissions", "admissions per year"], out: ["releases", "People in prison / average time served"] },
  },
  soc_teachers: {
    base: "agingPDY",
    name: "Teaching workforce by career stage",
    unitY: "teachers",
    stocks: {
      rookies: { label: "Early-career teachers", init: 60, scale: 300 },
      experienced: { label: "Mid-career teachers", init: 500, scale: 800 },
      gray: { label: "Teachers near retirement", init: 300, scale: 400 },
    },
    params: {
      hiring: { label: "Teachers hired" },
      tMature: { label: "Early-career years", value: 5 },
      tExp: { label: "Mid-career years" },
      tGray: { label: "Years before retiring" },
    },
    flows: {
      hire: ["hiring", "teachers hired per year"],
      mature: ["becoming mid-career", "Early-career / early-career years"],
      senior: ["nearing retirement", "Mid-career / mid-career years"],
      retire: ["retiring", "Near retirement / years before retiring"],
    },
  },
  soc_rumour: {
    base: "diffusion",
    name: "Spread of a rumour",
    timeUnit: "day",
    unitY: "thousand people",
    stocks: { pot: { label: "Not yet reached" }, adopt: { label: "Believe and share it" } },
    params: {
      p: { label: "Exposure from outside sources p", unit: "%/day" },
      q: { label: "Spread through contacts q", unit: "%/day" },
    },
    flows: { adoption: ["new believers", "(p + q × Sharing / N) × Not yet reached"] },
  },
  soc_roads: {
    base: "doingWork",
    name: "Road maintenance backlog",
    timeUnit: "yr",
    unitY: "km of road",
    stocks: { backlog: { label: "Road needing repair" }, output: { label: "Road repaired (cumulative)", scale: 3000 } },
    params: {
      workforce: { label: "Repair crews", unit: "crews" },
      productivity: { label: "Repairs per crew", unit: "km/crew·yr" },
      newWork: { label: "Road falling into disrepair", max: 150, step: 5, value: 90, unit: "km/yr" },
    },
    flows: { in: ["deterioration", "km falling into disrepair per year"], accomplishing: ["repairs", "MIN(crews × repairs per crew, Backlog / 0.5 yr)"] },
  },
};

const MODELS = skins(SKINS);
const STOP: Record<string, number> = { soc_urbanHousing: 100, soc_cocaine: 40, soc_welfare: 72, soc_prison: 30, soc_teachers: 40, soc_rumour: 60, soc_roads: 30 };

const timeToReach = (run: (p: Record<string, number>, T: number) => { end: Record<string, number> }, params: Record<string, number>, level: number) => {
  for (let t = 1; t <= 200; t++) if (run(params, t).end.adopt >= level) return t;
  return Infinity;
};

const CASES: AppCase[] = [
  {
    id: "urban-dynamics",
    title: "Urban dynamics: housing that ages faster than the jobs it serves",
    theme: "Cities, housing and infrastructure",
    level: "Intermediate",
    summary: "Housing moves from new to mid-life to declining, and how long a city keeps old buildings decides how much of its stock is in decline.",
    question: "Should a declining city build more low-cost housing, or remove old housing and make room for jobs?",
    sim: "soc_urbanHousing",
    presets: [
      { label: "Steady city", params: { births: 20, tY: 15, tA: 30, tO: 15 } },
      { label: "Construction slows", params: { births: 8, tY: 15, tA: 30, tO: 15 } },
      { label: "Old housing kept longer", params: { births: 20, tY: 15, tA: 30, tO: 30 } },
      { label: "Demolish and rebuild", params: { births: 30, tY: 15, tA: 30, tO: 8 } },
    ],
    map: [
      ["Stock: New housing", "Premium dwellings, recently built"],
      ["Stock: Mid-life housing", "Ordinary worker housing"],
      ["Stock: Declining housing", "Old, low-cost housing, where Forrester located urban decline"],
      ["Flow: demolition", "Declining housing / years before demolition: the city's renewal policy"],
      ["Missing here", "Business structures (new, mature and declining enterprise) and three population classes. Forrester's model ages all of them together."],
    ],
    molecules: ["aging", "cascade", "coflow"],
    evidence: [
      "Forrester (1971), summarising Urban Dynamics: job creation, job training, financial aid and low-cost housing programmes all 'lie between neutral and detrimental almost irrespective of the criteria used for judgment'. A low-cost housing programme alone 'draws more low-income people' and makes the area less attractive to those who create jobs.",
      "In the same article, as industrial buildings age, employment opportunities decline, so 'jobs decline and population rises while buildings age'.",
      "Alfeld (1995) looks back 25 years after Urban Dynamics and argues the model and method still have a role in shaping urban policy.",
      "Ghaffarzadegan, Lyneis and Richardson (2011) use urban planning as one of two examples of how small models give accessible, insightful policy lessons.",
    ],
    validation: "Neither the Alfeld (1995) nor the Ghaffarzadegan et al. (2011) abstract reports calibration statistics. The small model here is checked against an exact aging-chain result: in steady state each stage holds construction × the years spent in it.",
    insight:
      "Every building ages, so a city's mix of housing is set by its construction rate and by how long it keeps old buildings. Keeping declining housing longer swells exactly the stock that, in Forrester's analysis, attracts more people than the city has jobs for.",
    tryThis: [
      "Run Old housing kept longer. How much declining housing does the city end with, compared with the steady city?",
      "Run Construction slows. Which stock falls first, and how long does declining housing take to respond?",
      "Find a demolition time and construction rate that halve declining housing without shrinking the total stock.",
    ],
    data: [
      ["Housing stock by age of building", "Census and housing surveys (American Housing Survey; national censuses)"],
      ["Completions and demolitions", "Building permit and completion statistics"],
      ["Vacancy and condition", "Housing surveys; local property records"],
      ["Jobs by location", "Business registers and labour-force surveys"],
    ],
    practice: [
      "This small model ages housing only. Forrester's argument depends on how housing, jobs and population interact, so add business and population chains before drawing policy conclusions.",
      "Use one time constant per stage only as a first cut: a first-order outflow lets some new buildings decline almost at once.",
      "Count dwellings, not buildings, if the policy question is about who can live there.",
    ],
    checks: [
      { claim: "Keeping declining housing 30 years instead of 15 doubles it, to construction × 30 years (600 thousand)", test: (run) => Math.abs(run({ births: 20, tY: 15, tA: 30, tO: 30 }).end.old / 600 - 1) < 0.05 },
      { claim: "When construction slows, declining housing grows from a quarter to nearly a third of the stock within 30 years", test: (run) => { const r = run({ births: 8, tY: 15, tA: 30, tO: 15 }, 30).end, s = r.old / (r.young + r.adult + r.old); return s > 0.29 && s < 0.33; } },
      { claim: "Demolishing sooner while building more cuts declining housing even though the total stock grows", test: (run) => { const a = run({ births: 20, tO: 15 }).end, b = run({ births: 30, tO: 8 }).end; return b.old < a.old && b.young + b.adult + b.old > a.young + a.adult + a.old; } },
    ],
    refs: ["forrester1969", "forrester1971", "alfeld1995", "ghaffarzadegan2011"],
    tags: ["urban", "city", "housing", "urban renewal", "slums", "jobs", "Forrester", "aging chain", "demolition"],
  },
  {
    id: "rental-housing",
    title: "Evictions, arrears and the low-income rental market",
    theme: "Cities, housing and infrastructure",
    level: "Advanced",
    summary: "Tenants' arrears and landlords' decisions feed back on each other, so pausing evictions moves the problem rather than ending it.",
    question: "Did eviction moratoriums and emergency rental assistance prevent housing loss, or delay it?",
    map: [
      ["Stocks", "Households renting, households in arrears, rental and mortgage arrears in dollars, available low-income units, households doubled up or homeless"],
      ["Flows", "Falling behind, catching up, eviction, landlords leaving the market"],
      ["Loops", "Arrears weaken landlords' finances, which reduces units and raises rents, which pushes more tenants into arrears"],
    ],
    molecules: ["cascade", "coflow", "backlogFlow", "split"],
    evidence: [
      "Marçal, Fowler and Hovmand (2023) model tenant and landlord decisions in the low-income rental market before and after pandemic protections. Simulations suggest the eviction moratorium and federal emergency rental assistance prevented a tidal wave of evictions, but rental arrears, overcrowding and homelessness remain elevated.",
      "The same study concludes that failing to address underlying financial hardship and limited affordable housing undermines recovery.",
    ],
    validation: "The Marçal et al. (2023) abstract reports no calibration statistics.",
    insight: "A moratorium stops the eviction flow but not the accumulation of arrears behind it. When the protection ends, the stock that built up decides what happens next.",
    tryThis: [
      "Open Backlog Flow and treat the backlog as households in arrears. What happens to the backlog if the outflow (eviction) is set to zero for a year?",
      "Sketch the loop between landlords' arrears, units on the market and rents. Is it reinforcing or balancing?",
    ],
    data: [
      ["Eviction filings", "Eviction Lab; court records"],
      ["Rents and affordable units", "American Housing Survey; national housing statistics"],
      ["Rental assistance paid", "Programme reports"],
    ],
    practice: [
      "Keep arrears in dollars as a coflow of households in arrears: the size of the debt, not only the number of households, decides whether tenants can catch up.",
      "Model landlords as decision makers too. Their exits change the stock of units everyone else competes for.",
    ],
    refs: ["marcal2023"],
    tags: ["housing", "eviction", "rent", "arrears", "homelessness", "moratorium", "COVID-19", "landlords"],
  },
  {
    id: "cocaine",
    title: "Drug enforcement and cocaine prevalence",
    theme: "Crime, drugs and justice",
    level: "Intermediate",
    summary: "Casual users either quit or become compulsive users, so compulsive use keeps growing for years after new use has peaked.",
    question: "How much would tougher or softer enforcement change cocaine use, and how soon would it show?",
    sim: "soc_cocaine",
    presets: [
      { label: "New use stops", params: { inflow: 0, tau: 4, leak: 0.8 } },
      { label: "Steady new use", params: { inflow: 10, tau: 4, leak: 0.8 } },
      { label: "New use halved", params: { inflow: 5, tau: 4, leak: 0.8 } },
      { label: "More users escalate", params: { inflow: 10, tau: 4, leak: 0.6 } },
    ],
    map: [
      ["Stock: Casual users", "Occasional users, mostly of powder cocaine"],
      ["Stock: Compulsive users", "Heavy, dependent users (crack cocaine grew this stock)"],
      ["Flow: initiation", "Where enforcement acts in this small model: supply and price shape how many people start"],
      ["Share who quit", "How many casual users stop rather than escalate"],
    ],
    molecules: ["broken", "cascade", "diffusion"],
    evidence: [
      "Homer (1993, System Dynamics Review): a system dynamics model reproduces a variety of national indicator data on cocaine use and supply over 15 years and estimates the underlying prevalence. Sensitivity tests explain why compulsive use of crack grew while casual use of powder declined.",
      "Homer (1993, Journal of Drug Issues) applies the model to relaxing enforcement, represented as fewer arrests or drug seizures. The uncertainties are few, well defined and partly bounded by history and logic, and the model still gives credible projections.",
    ],
    validation: "Homer's model was tested by reproducing national indicator data over a 15-year period, with sensitivity tests on its assumptions. The abstracts report no fit statistics.",
    insight:
      "Compulsive use is fed by casual use with a delay, so the two can move in opposite directions: casual use falls while compulsive use is still rising. A policy that cuts initiation pays off first in casual use and only years later in the harder stock.",
    tryThis: [
      "Run New use stops. In which year do compulsive users peak, while casual use has been falling from the start?",
      "Compare Steady new use with More users escalate. How much larger is the compulsive stock in the long run?",
      "Compare Steady new use with New use halved. How many years does each take for compulsive users to come within 10% of their final level?",
    ],
    data: [
      ["Self-reported use by frequency", "National Survey on Drug Use and Health (SAMHSA)"],
      ["Treatment admissions and emergency visits", "Treatment episode data; hospital records"],
      ["Arrests, seizures and price", "Law-enforcement statistics; UNODC"],
      ["Overdose deaths", "Vital statistics"],
    ],
    practice: [
      "This small model uses one time constant for both stages and lets enforcement act only on initiation. Homer's model links supply, price and use; add those links before testing enforcement itself.",
      "Survey data undercount heavy users. Estimate compulsive use from treatment, emergency and arrest indicators together, as Homer did.",
      "Illustrative numbers only: replace them with national estimates before quoting results.",
    ],
    checks: [
      { claim: "After new use stops, compulsive use keeps rising for years while casual use falls from the start", test: (run) => { const r = run({ inflow: 0, tau: 4, leak: 0.8 }); return r.tMax.l2 > 2 && r.tMax.l1 === 0; } },
      { claim: "With steady new use, casual users settle at new users × years in stage (40) and compulsive users at new users × escalating share × years (8)", test: (run) => { const r = run({ inflow: 10, tau: 4, leak: 0.8 }).end; return Math.abs(r.l1 / 40 - 1) < 0.03 && Math.abs(r.l2 / 8 - 1) < 0.03; } },
      { claim: "If 40% of casual users escalate instead of 20%, the long-run compulsive stock doubles", test: (run) => Math.abs(run({ inflow: 10, tau: 4, leak: 0.6 }).end.l2 / run({ inflow: 10, tau: 4, leak: 0.8 }).end.l2 - 2) < 0.1 },
    ],
    refs: ["homer1993", "homer1993enf"],
    tags: ["cocaine", "crack", "drugs", "drug policy", "enforcement", "prevalence", "addiction", "law enforcement"],
  },
  {
    id: "prison-population",
    title: "Sentencing, admissions and prison population",
    theme: "Crime, drugs and justice",
    level: "Starter",
    summary: "The prison population equals admissions × time served, so longer sentences fill prisons, but only after years.",
    question: "What happens to prison numbers, and when, if sentences get longer or fewer people are sent to prison?",
    sim: "soc_prison",
    presets: [
      { label: "Today", params: { inflow: 25, tau: 2 } },
      { label: "Sentences 50% longer", params: { inflow: 25, tau: 3 } },
      { label: "Diversion cuts admissions", params: { inflow: 18, tau: 2 } },
      { label: "Longer sentences and diversion", params: { inflow: 18, tau: 3 } },
    ],
    map: [
      ["Stock: People in prison", "Sentenced and remand prisoners"],
      ["Flow: admissions", "Set by crime, policing, charging and sentencing practice"],
      ["Average time served", "Sentence length after remission and parole"],
      ["Missing here", "Reoffending after release, and the delayed response of prison building to overcrowding"],
    ],
    molecules: ["residence", "bathtub", "stockmgmt"],
    evidence: [
      "Olaya, Gómez-Quintero and Navarrete (2018) explain the rising, oscillating pattern of prison overcrowding in Colombia over 20 years as the result of many laws that raise sanctions ('legislative inflation'): harsher legislation and longer prison terms boost long-term overcrowding and further cycles of crime control and overcrowding.",
      "The same study attributes the oscillation to balancing loops with material and information delays, coupled with reinforcing loops.",
    ],
    validation: "Olaya et al. (2018) test their dynamic hypothesis with a system dynamics simulation model; the abstract reports no fit statistics. The small model here is checked against Little's law: in steady state, population = admissions × time served.",
    insight:
      "A sentencing law acts on the outflow, so its full effect arrives only after a full average sentence has passed. Because the cost arrives long after the decision, it is easy to keep adding sanctions: the 'legislative inflation' Olaya et al. describe.",
    tryThis: [
      "Run Sentences 50% longer. How long until the prison population reaches 90% of its new level?",
      "Find the admissions rate that keeps the population at 50 thousand with 3-year sentences.",
      "Sketch the loop the model leaves out: overcrowding → prison building, with a delay of years. Is it balancing or reinforcing, and what does the delay do?",
    ],
    data: [
      ["Admissions, releases and population", "Bureau of Justice Statistics; national prison statistics"],
      ["Time served by offence", "Release cohorts in prison records"],
      ["Capacity and occupancy", "World Prison Brief; prison service reports"],
      ["Reconviction after release", "Reoffending statistics by release cohort"],
    ],
    practice: [
      "This small model has one stock and no reoffending. Add a stock of released people who return at a reconviction rate to see how recidivism inflates admissions.",
      "Separate remand from sentenced prisoners: their times in custody differ by an order of magnitude.",
      "To reproduce Olaya et al.'s oscillations, add capacity as a second stock built with a long delay in response to overcrowding.",
    ],
    checks: [
      { claim: "With sentences 50% longer, the population settles at admissions × time served = 75 thousand", test: (run) => Math.abs(run({ inflow: 25, tau: 3 }).end.q / 75 - 1) < 0.02 },
      { claim: "One year after sentences lengthen, less than a third of the eventual rise has happened", test: (run) => run({ inflow: 25, tau: 3 }, 1).end.q - 50 < 25 / 3 },
      { claim: "Cutting admissions to 18 thousand offsets most of the rise from longer sentences", test: (run) => Math.abs(run({ inflow: 18, tau: 3 }).end.q - 50) < 0.2 * 25 },
    ],
    refs: ["olaya2018"],
    tags: ["prison", "incarceration", "sentencing", "criminal justice", "overcrowding", "Little's law", "recidivism"],
  },
  {
    id: "welfare-reform",
    title: "Welfare reform: caseloads, placements and time limits",
    theme: "Welfare and education",
    level: "Starter",
    summary: "A welfare caseload is a backlog: it settles only if the agency can move families into work as fast as new cases arrive.",
    question: "If new rules push families toward work, will the caseload fall, and what limits how fast?",
    sim: "soc_welfare",
    presets: [
      { label: "Placements short of new cases", params: { orders: 12, shipTime: 12, capacity: 10 } },
      { label: "Enough placements", params: { orders: 12, shipTime: 12, capacity: 16 } },
      { label: "Recession: more new cases", params: { orders: 18, shipTime: 12, capacity: 16 } },
      { label: "Faster case work", params: { orders: 12, shipTime: 6, capacity: 16 } },
    ],
    map: [
      ["Stock: Families receiving assistance", "The caseload"],
      ["Flow: new cases", "Applications approved each month"],
      ["Flow: leaving for work", "Limited both by how quickly families find work and by how many placements caseworkers can arrange"],
      ["Missing here", "Families who leave without work, and those who return to the caseload"],
    ],
    molecules: ["backlogFlow", "workforce", "cascade"],
    evidence: [
      "Zagonel, Rohrbaugh, Richardson and Andersen (2004) describe using simulation models to answer 'what if' questions about welfare reform for New York State and its counties.",
      "Ghaffarzadegan, Lyneis and Richardson (2011) use social welfare as one of two examples of how small system dynamics models give accessible policy lessons.",
    ],
    validation: "The Zagonel et al. (2004) article has no published abstract and we could not check its full text, so this library reports no validation detail for it. The small model here is checked against two exact results: a settled caseload equals new cases × time to leave, and a capacity-bound caseload grows by (new cases − placements) each month.",
    insight:
      "When placements are the bottleneck, the caseload grows in a straight line no matter how strict the rules are. Only when capacity exceeds new cases does the caseload settle, at new cases × the time families take to leave.",
    tryThis: [
      "Run Placements short of new cases. By how much does the caseload grow each month once placements are binding?",
      "Run Recession. What placement capacity would stop the caseload growing?",
      "Compare Enough placements with Faster case work. Which halves the caseload, and why does extra capacity alone not?",
    ],
    data: [
      ["Caseload and new cases", "TANF caseload data (US Administration for Children and Families); national benefit statistics"],
      ["Exits to work and returns", "Administrative records linked to employment data"],
      ["Caseworker numbers and caseloads", "Agency staffing records"],
      ["Local labour market", "Labour-force surveys"],
    ],
    practice: [
      "Split exits into leaving for work and leaving without work: time limits raise the second, and those families often return.",
      "Add caseworkers as a stock with hiring delays before testing staffing policies.",
      "Build the model with the county and state staff who run the programme; they know where the delays are.",
    ],
    checks: [
      { claim: "When placements (10k/mo) fall short of new cases (12k/mo), the caseload grows by 2 thousand a month", test: (run) => Math.abs(run({ orders: 12, shipTime: 12, capacity: 10 }, 72).end.backlog - run({ orders: 12, shipTime: 12, capacity: 10 }, 60).end.backlog - 24) < 0.5 },
      { claim: "With enough placements the caseload settles at new cases × time to leave = 144 thousand", test: (run) => Math.abs(run({ orders: 12, shipTime: 12, capacity: 16 }).end.backlog / 144 - 1) < 0.03 },
      { claim: "Faster case work halves the settled caseload", test: (run) => Math.abs(run({ orders: 12, shipTime: 6, capacity: 16 }).end.backlog / 72 - 1) < 0.03 },
    ],
    refs: ["zagonel2004", "ghaffarzadegan2011"],
    tags: ["welfare", "welfare reform", "TANF", "caseload", "benefits", "employment", "social services", "time limits"],
  },
  {
    id: "teacher-workforce",
    title: "Teacher workforce planning",
    theme: "Welfare and education",
    level: "Intermediate",
    summary: "An older teaching workforce means a retirement wave, so a hiring freeze that looks safe today leaves gaps years later.",
    question: "With falling pupil numbers, should a government stop hiring teachers, or will retirements open vacancies anyway?",
    sim: "soc_teachers",
    presets: [
      { label: "Current hiring (20 a year)", params: { hiring: 20, tMature: 5, tExp: 25, tGray: 8 } },
      { label: "Hiring freeze (5 a year)", params: { hiring: 5, tMature: 5, tExp: 25, tGray: 8 } },
      { label: "Replace retirements (35 a year)", params: { hiring: 35, tMature: 5, tExp: 25, tGray: 8 } },
    ],
    map: [
      ["Stock: Early-career teachers", "Newly qualified and probationary teachers"],
      ["Stock: Mid-career teachers", "The core of the workforce"],
      ["Stock: Teachers near retirement", "Starting full in this run: an older workforce hired in an earlier boom"],
      ["Flow: retiring", "Teachers near retirement / years before retiring"],
    ],
    molecules: ["agingPDY", "aging", "stockmgmt"],
    evidence: [
      "Mendes and Aleluia (2019): the Portuguese government feared that falling birth rates would make tenured teachers redundant, and its hiring became more conservative. A model of three goal-seeking aging chain arrays estimated the teachers needed in each school district and subject.",
      "Its results were used to set and allocate tenured teacher vacancies in 2015. The model showed redundancy concerns were unfounded and that hiring for all vacancies was justified, a result the authors say would have been hard to anticipate because of the delays involved.",
    ],
    validation: "The Mendes and Aleluia (2019) model was used to set real vacancies in 2015; the abstract reports no fit statistics. The small model here is checked against the aging-chain steady state.",
    insight:
      "Retirements are set by hiring decades ago, not by today's pupil numbers. A workforce with a large older cohort loses teachers fast whatever the hiring policy, so a freeze compounds a shortage that is already on its way.",
    tryThis: [
      "Run Current hiring. Does the workforce grow or shrink, and why, when 20 are hired every year?",
      "Run Hiring freeze. Compare early-career and near-retirement teachers after 5 years. Which stock tells you about the freeze?",
      "Find the hiring rate that keeps the total close to its starting level over 40 years.",
    ],
    data: [
      ["Teachers by age, subject and district", "Ministry of education staff records; UNESCO Institute for Statistics"],
      ["Retirement ages and exits", "Pension and payroll data"],
      ["Pupil projections", "Births and population projections"],
      ["Trainee numbers", "Teacher-training enrolment statistics"],
    ],
    practice: [
      "This small model hires only into the early-career stage and uses one average time per stage. Mendes and Aleluia used arrays by district and subject; shortages are local even when the national total looks fine.",
      "Set desired teachers from pupils and class sizes, not from a fixed student-teacher ratio, which only extends past trends.",
    ],
    checks: [
      { claim: "With an older workforce, hiring 20 a year still lets the teaching force shrink, because retirements outpace hiring", test: (run) => { const r = run({ hiring: 20 }).end; return r.rookies + r.experienced + r.gray < 860; } },
      { claim: "A hiring freeze shows up in early-career teachers within 5 years but barely touches those near retirement", test: (run) => { const a = run({ hiring: 20 }, 5).end, b = run({ hiring: 5 }, 5).end; return b.rookies < 0.6 * a.rookies && b.gray > 0.97 * a.gray; } },
      { claim: "In the long run the workforce settles at hiring × total career length (35 × 38 = 1,330)", test: (run) => { const r = run({ hiring: 35 }, 300).end; return Math.abs((r.rookies + r.experienced + r.gray) / 1330 - 1) < 0.03; } },
    ],
    refs: ["mendes2019"],
    tags: ["teachers", "education", "schools", "workforce planning", "retirement", "hiring freeze", "aging chain"],
  },
  {
    id: "phd-pipeline",
    title: "How many PhDs can academia absorb?",
    theme: "Welfare and education",
    level: "Starter",
    summary: "Each professor trains many PhDs over a career but frees only one post, so most graduates must find work outside academia.",
    question: "What share of PhD graduates can ever hold an academic post, and what would change it?",
    map: [
      ["Stocks", "PhD students → graduates → faculty, with faculty retiring"],
      ["Flows", "Enrolment (proportional to faculty), graduation, hiring into vacancies, retirement"],
      ["R₀", "PhDs graduated per professor over a whole career"],
    ],
    molecules: ["growth", "aging", "split"],
    evidence: [
      "Larson, Ghaffarzadegan and Xue (2014): a US engineering professor graduates 7.8 PhDs on average over a career, and only one can replace that professor. In steady state only 12.8% of PhD graduates can hold academic positions in the US.",
      "The authors conclude that the system in many places is saturated, far beyond its capacity to absorb new PhDs at current rates.",
    ],
    validation: "Larson et al. (2014) derive R₀ from career-length and graduation data; the abstract reports no calibration statistics.",
    insight: "With a fixed number of posts, the academic share of graduates is 1/R₀. Training more PhDs per professor lowers that share; it cannot raise the number of posts.",
    tryThis: [
      "Open Population Growth and treat faculty as the population. Set deaths to 3%/yr (a career of about 33 years) and births to 12%/yr, an R₀ of about 4, half the engineering figure. How fast would faculty numbers have to grow for every graduate to find a post?",
      "Open Split. With 12.8% of graduates going to academia, how many graduates a year does each new academic post imply?",
    ],
    data: [
      ["Doctorates awarded by field", "NSF Survey of Earned Doctorates; national statistics"],
      ["Faculty numbers and retirements", "University staffing records; NCES"],
      ["Career outcomes of graduates", "Graduate destination surveys"],
    ],
    practice: ["State R₀ by field: it varies widely, and so does the share of graduates who can find academic posts.", "Count postdocs as a separate stock: it is where the queue for posts builds up."],
    refs: ["larson2014"],
    tags: ["PhD", "academia", "higher education", "R0", "faculty", "careers", "pipeline"],
  },
  {
    id: "rumours",
    title: "Rumours and misinformation spreading through contact",
    theme: "Information and policy design",
    level: "Starter",
    summary: "A rumour spreads like an infection: slowly at first, then fast through contacts, until few people are left to reach.",
    question: "How much does slowing person-to-person sharing, through fact-checking or friction, delay a false story?",
    sim: "soc_rumour",
    presets: [
      { label: "Broadcast-led", params: { p: 2, q: 5 } },
      { label: "Word of mouth", params: { p: 0.1, q: 25 } },
      { label: "Viral", params: { p: 0.1, q: 40 } },
      { label: "Fact-checking halves sharing", params: { p: 0.1, q: 12 } },
    ],
    map: [
      ["Stock: Not yet reached", "People who have not heard or believed the story"],
      ["Stock: Believe and share it", "People who have taken it up"],
      ["p", "Exposure from outside the network: broadcast, search, advertising"],
      ["q", "Spread through contacts: the reinforcing loop"],
      ["Missing here", "People who stop sharing or are corrected. Daley and Kendall's rumour model adds this stifling stock."],
    ],
    molecules: ["diffusion", "logistic", "cascade"],
    evidence: [
      "Vosoughi, Roy and Aral (2018) studied about 126,000 verified true and false news stories tweeted by about 3 million people more than 4.5 million times from 2006 to 2017. Falsehood diffused significantly farther, faster, deeper and more broadly than the truth in all categories, most of all for political news.",
      "In the same study, robots spread true and false news at the same rate, so false news spreads more because humans are more likely to share it.",
      "Daley and Kendall (1964) adapted the epidemic model to the spread of rumours. Sterman (2000, ch. 9) treats epidemics and adoption as the same S-shaped structure.",
    ],
    validation: "Vosoughi et al. (2018) is an observational study, not a simulation; true and false stories were classified using six independent fact-checking organisations that agreed on 95 to 98% of classifications.",
    insight:
      "Spread through contacts is a reinforcing loop, so its strength sets how fast a story takes off, while outside exposure mainly sets when it starts. Halving sharing nearly doubles the time a story takes to reach half the population, because it weakens the loop that drives growth.",
    tryThis: [
      "Compare Word of mouth with Fact-checking halves sharing. How many days later is half the population reached?",
      "Set q to 0. What now drives the spread, and what shape does the curve take?",
      "Run Viral. Why does the story reach almost everyone in this model, when real rumours die out?",
    ],
    data: [
      ["Shares and cascades", "Platform research data; academic data-sharing programmes"],
      ["Fact-check verdicts", "Fact-checking organisations' databases"],
      ["Belief and exposure", "Opinion surveys"],
    ],
    practice: [
      "Add a stock of people who stop sharing (stiflers) before using this for policy: it is why real rumours burn out before reaching everyone.",
      "Separate seeing a story from believing and sharing it; most interventions act on the step between them.",
      "Fit p and q to early cascade counts, but expect them to change as platforms and people respond.",
    ],
    checks: [
      { claim: "Growth through contact is S-shaped: reaching the first 10% takes longer than going from 10% to 50%", test: (run) => { const p = { p: 0.1, q: 25 }, t10 = timeToReach(run, p, 100), t50 = timeToReach(run, p, 500); return t10 > t50 - t10; } },
      { claim: "Halving sharing delays the day half the population is reached by about three-quarters (from about 23 to about 40 days)", test: (run) => { const r = timeToReach(run, { p: 0.1, q: 12 }, 500) / timeToReach(run, { p: 0.1, q: 25 }, 500); return r > 1.6 && r < 1.9; } },
      { claim: "With no one stopping, the story eventually reaches almost everyone", test: (run) => run({ p: 0.1, q: 25 }, 200).end.adopt > 990 },
    ],
    refs: ["vosoughi2018", "daley1964", "sterman2000"],
    tags: ["misinformation", "rumour", "fake news", "social media", "diffusion", "contagion", "social norms", "fact-checking"],
  },
  {
    id: "road-maintenance",
    title: "Infrastructure maintenance backlog",
    theme: "Cities, housing and infrastructure",
    level: "Starter",
    summary: "Roads fall into disrepair at a steady rate; if repair capacity is below that rate, the backlog grows every year.",
    question: "How many crews does a road network need, and how long will it take to clear the backlog?",
    sim: "soc_roads",
    presets: [
      { label: "Crews short of deterioration", params: { workforce: 20, productivity: 4, newWork: 90 } },
      { label: "Funding for 30 crews", params: { workforce: 30, productivity: 4, newWork: 90 } },
      { label: "Budget cut to 15 crews", params: { workforce: 15, productivity: 4, newWork: 90 } },
    ],
    map: [
      ["Stock: Road needing repair", "The maintenance backlog, in km"],
      ["Flow: deterioration", "Km falling below the repair threshold each year"],
      ["Flow: repairs", "Crews × km per crew, until the backlog is too small to keep them busy"],
      ["Missing here", "Feedback from the backlog to deterioration: neglected roads decay faster and cost more to fix"],
    ],
    molecules: ["doingWork", "backlogFlow", "reworkCycle"],
    evidence: [
      "Fallah-Fini et al. (2010) built a micro-level simulation of highway deterioration and renewal, calibrated it with data from eight road sections in Virginia, and coupled it with optimisation. Alternative priority-setting schemes improved on current maintenance practice.",
      "Rashedi and Hegazy (2016) developed a system dynamics model of asset deterioration, rehabilitation and cost from causal loop diagrams, and tested it on a network of 1,000 assets over a 50-year plan under different budgets, actions and fund allocations.",
      "Friedman (2006) shows how regional development damages small-town roads, raises pressure on budgets and can lead to avoidable accidents, and that conflicting studies have made road-maintenance policy difficult.",
    ],
    validation: "Fallah-Fini et al. (2010) calibrated their model to data from eight road sections in Virginia. Rashedi and Hegazy (2016) tested theirs on a 1,000-asset network over 50 years; the abstract reports no calibration statistics. The Friedman (2006) abstract reports none.",
    insight:
      "The backlog changes at the gap between deterioration and repair capacity, so a small gap is invisible for years and then large. Once repair falls short, deferral is a straight-line ramp, and every year of it adds to the work a later budget must clear.",
    tryThis: [
      "Run Crews short of deterioration. How much does the backlog grow each year?",
      "Run Funding for 30 crews. How many years until the backlog is down to a working minimum?",
      "Find the smallest number of crews that stops the backlog growing.",
    ],
    data: [
      ["Pavement and bridge condition", "Highway Performance Monitoring System; national road condition surveys"],
      ["Maintenance spending and crews", "Highway agency budgets"],
      ["Deterioration rates", "Pavement management system records"],
      ["Overall condition grades", "ASCE Infrastructure Report Card"],
    ],
    practice: [
      "This small model keeps deterioration constant. Add the feedback from poor condition to faster deterioration and higher repair cost: it is what makes deferral expensive.",
      "Track road in several condition states (good, fair, poor) as an aging chain; repairs that catch roads early cost less.",
      "Treat budget, crews and contractor capacity separately: money cannot buy repairs faster than crews can do them.",
    ],
    checks: [
      { claim: "With repair capacity 80 km/yr against 90 km/yr of deterioration, the backlog grows by 10 km a year", test: (run) => Math.abs(run({ workforce: 20, productivity: 4, newWork: 90 }).end.backlog - (600 + 10 * 30)) < 3 },
      { claim: "A budget cut to 15 crews makes the backlog grow three times as fast", test: (run) => Math.abs((run({ workforce: 15 }).end.backlog - 600) / (run({ workforce: 20 }).end.backlog - 600) - 3) < 0.05 },
      { claim: "With 30 crews the 600 km backlog is cleared to a working minimum within 20 years, but not within 15", test: (run) => run({ workforce: 30 }, 20).end.backlog < 50 && run({ workforce: 30 }, 15).end.backlog > 100 },
    ],
    refs: ["fallahfini2010", "rashedi2016", "friedman2006"],
    tags: ["infrastructure", "roads", "highways", "maintenance", "backlog", "deferred maintenance", "asset management", "public works"],
  },
  {
    id: "policy-resistance",
    title: "Policy resistance: why obvious fixes backfire",
    theme: "Information and policy design",
    level: "Advanced",
    summary: "Social systems respond to interventions through feedback that policy makers do not see, so well-meant programmes often fail or make problems worse.",
    question: "Before launching a programme, how can a policy team find out whether the system will push back?",
    map: [
      ["The intervention", "A programme aimed at a visible symptom (housing shortage, crime, a caseload)"],
      ["The response", "Other actors adjust: people move, landlords exit, offenders adapt, budgets shift"],
      ["Loop B (compensating feedback)", "The adjustment cancels or reverses the intended effect, usually after a delay"],
    ],
    molecules: ["closegap", "stockmgmt", "seaAnchor", "effectFunction"],
    evidence: [
      "Forrester (1971): social systems 'belong to the class called multi-loop nonlinear feedback systems', and they tend to draw attention 'to the very points at which an attempt to intervene will fail'. A downward spiral develops 'in which the presumed solution makes the difficulty worse'.",
      "Sterman (2006): policies to promote public health and welfare often fail or worsen the problems they target. Complexity hides delayed and distal effects, and common mental models lead to erroneous but self-confirming inferences, so learning fails even when evidence is strong.",
      "Ghaffarzadegan, Lyneis and Richardson (2011) argue that small system dynamics models can address these difficulties in the policy process and give accessible lessons.",
    ],
    validation: "Forrester (1971) and Sterman (2006) are essays that draw on simulation work rather than report a single fitted model.",
    insight:
      "Policy resistance comes from feedback outside the policy maker's boundary. Drawing the loops that respond to an intervention, and simulating them, is cheaper than discovering them after implementation.",
    tryThis: [
      "Pick a programme from this library (low-cost housing, longer sentences, a hiring freeze). Draw the loop that could undo it, and say how long its delay is.",
      "Open Stock Management and run Oscillation. Which decision rule here stands in for a policy maker who ignores the pipeline?",
    ],
    data: [
      ["Behaviour over time of the problem", "Official statistics, before and after past interventions"],
      ["How other actors respond", "Interviews, case studies and group model building with stakeholders"],
    ],
    practice: [
      "Draw the boundary wide enough to include the actors who respond to the policy, not only those it targets.",
      "Keep the model small enough to explain, and test whether its lesson survives added structure.",
      "Ask what happened after similar programmes elsewhere: past behaviour over time is the best evidence of hidden feedback.",
    ],
    refs: ["forrester1971", "sterman2006", "ghaffarzadegan2011"],
    tags: ["policy resistance", "unintended consequences", "counterintuitive", "feedback", "public policy", "systems thinking"],
  },
];

const DATA_SOURCES: DataSource[] = [
  { name: "American Housing Survey", url: "https://www.census.gov/programs-surveys/ahs.html", what: "US housing stock by age, condition, cost and occupancy", scope: "Housing and infrastructure" },
  { name: "Eviction Lab", url: "https://evictionlab.org/", what: "US eviction filings and judgments by place and time", scope: "Housing and infrastructure" },
  { name: "FHWA Highway Statistics", url: "https://www.fhwa.dot.gov/policyinformation/statistics.cfm", what: "US road length, condition, use and spending", scope: "Housing and infrastructure" },
  { name: "Bureau of Justice Statistics", url: "https://bjs.ojp.gov/", what: "US prison admissions, releases, population, time served and recidivism", scope: "Crime, drugs and justice" },
  { name: "World Prison Brief", url: "https://www.prisonstudies.org/", what: "Prison population, rates and occupancy by country", scope: "Crime, drugs and justice" },
  { name: "UNODC data portal", url: "https://dataunodc.un.org/", what: "Drug use, seizures, prices and crime statistics by country", scope: "Crime, drugs and justice" },
  { name: "SAMHSA data, including the National Survey on Drug Use and Health", url: "https://www.samhsa.gov/data/", what: "US self-reported substance use by frequency, age and drug, and treatment admissions", scope: "Crime, drugs and justice" },
  { name: "UNESCO Institute for Statistics", url: "https://uis.unesco.org/", what: "Teachers, enrolment, completion and education spending by country", scope: "Welfare and education" },
  { name: "National Center for Education Statistics", url: "https://nces.ed.gov/", what: "US teachers, pupils, schools, doctorates and faculty", scope: "Welfare and education" },
  { name: "US Administration for Children and Families TANF data", url: "https://www.acf.hhs.gov/ofa/programs/tanf/data-reports", what: "Welfare caseloads, recipients and expenditure by state and month", scope: "Welfare and education" },
];

export const SOCIAL: Domain = {
  id: "social",
  name: "Social systems and public policy",
  short: "Public policy",
  blurb: "Cities and housing, drugs and prisons, welfare caseloads, teachers, rumours and the policies that backfire.",
  themes: THEMES,
  cases: CASES,
  refs: REFS,
  models: MODELS,
  stop: STOP,
  dataSources: DATA_SOURCES,
};
