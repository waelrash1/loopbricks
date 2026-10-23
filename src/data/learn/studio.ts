// The modelling studio: practice briefs for the first half of the modelling process, where most students struggle.
// Each brief starts from a messy brief, people who disagree and a table of evidence, and asks the student to
// articulate the problem, set the boundary, draw the causal loop diagram (checked against a model answer), sort
// the variables into stocks, flows and auxiliaries, and write the stock and flow equations.
// The organisations and figures are invented for teaching; the structures follow the studies in `refs`.
import type { Model } from "@/data/molecules";

export type Kind = "Stock" | "Flow" | "Auxiliary" | "Constant";

export type StudioCase = {
  id: string;
  field: string;
  title: string;
  brief: string;
  voices: { who: string; said: string }[];
  evidence: { title: string; unit: string; x: string[]; series: { name: string; values: number[] }[]; note: string };
  articulate: { q: string; answer: string }[];
  boundary: { endogenous: string[]; exogenous: string[]; excluded: string[] };
  cldTask: string;
  cld: Model["cld"];
  sorting: { name: string; kind: Kind; unit: string }[];
  stocks: { name: string; unit: string; inflows: string[]; outflows: string[] }[];
  equations: string[];
  policies: { q: string; hint: string }[];
  critique: string[];
  refs: string[];
  related: { label: string; hash: string }[];
};

export const STUDIO: StudioCase[] = [
  {
    id: "agency-nurses",
    field: "Health",
    title: "A hospital that cannot stop paying for agency nurses",
    brief:
      "A 600-bed teaching hospital fills its nursing gaps with agency staff. Four years ago agency shifts were a small top-up; now they cost more than the hospital's whole training and recruitment budget, and the finance director wants them capped. The director of nursing says a cap would close wards. Vacancies have risen every year even though the hospital hires more nurses than before, because more are leaving, and exit interviews mention workload and short staffing. The board has asked for an analysis before it sets next year's budget.",
    voices: [
      { who: "Finance director", said: "Agency spending is the problem. Cap it and the managers will find another way." },
      { who: "Director of nursing", said: "Agency nurses are the only thing keeping wards open. The problem is that we cannot recruit fast enough." },
      { who: "Ward sister", said: "When we are short, the permanent staff carry the load, and then they leave too." },
    ],
    evidence: {
      title: "Nursing workforce, year by year",
      unit: "nurses (whole-time equivalent) and agency shifts per week",
      x: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
      series: [
        { name: "Permanent nurses", values: [1180, 1150, 1110, 1080, 1040] },
        { name: "Vacancies", values: [60, 95, 135, 170, 210] },
        { name: "Agency shifts per week", values: [180, 320, 470, 610, 760] },
        { name: "Nurses leaving per year", values: [130, 150, 175, 195, 220] },
      ],
      note: "Invented teaching data. Hiring rose from 120 to 180 a year over the same period.",
    },
    articulate: [
      {
        q: "State the problem as behaviour over time, not as an event or a single number.",
        answer: "Permanent nursing numbers have fallen for five years while agency use has grown four-fold, and leavers have risen each year. The worry is not this year's agency bill but a trend in which the fix appears to feed the problem.",
      },
      {
        q: "Whose decision will the model support, and what is its purpose?",
        answer: "The board's budget decision: how to split money between agency cover, recruitment, training and retention so that the permanent workforce stops shrinking without closing wards. The model is for comparing those policies, not for predicting next year's vacancies to the nurse.",
      },
      {
        q: "Choose a time unit and a time horizon, and justify them.",
        answer: "Months, over five to eight years. Training a nurse takes about three years, so a shorter horizon cannot show whether investing in the pipeline pays off. Monthly steps capture turnover and agency decisions, which change faster than yearly budgets.",
      },
      {
        q: "Sketch the reference mode: what happened, what is feared and what is hoped for.",
        answer: "Past: permanent nurses falling, agency shifts and leavers rising together. Feared: the decline accelerates as each leaver raises the workload on those who stay. Hoped: agency use peaks and falls back as the permanent workforce recovers, with vacancies under 3% within five years.",
      },
    ],
    boundary: {
      endogenous: ["Permanent nurses", "Vacancies (staffing gap)", "Agency shifts", "Workload per nurse", "Nurses leaving", "Recruitment and training spending"],
      exogenous: ["Patient demand (beds and acuity)", "Agency day rates", "National supply of newly qualified nurses", "Total workforce budget"],
      excluded: ["Medical staff and other professions", "Pay negotiations", "Individual wards and specialties", "Patient outcomes (named as a follow-on question)"],
    },
    cldTask: "Use the seven variables to draw the feedback structure behind the evidence. Look for a quick fix, a slow fundamental fix, a side effect that undermines the fundamental fix, and a loop that turns short staffing into more leavers.",
    cld: {
      vars: [
        { id: "agency", label: "Agency shifts", x: 330, y: 45 },
        { id: "gap", label: "Staffing gap", x: 330, y: 170 },
        { id: "budget", label: "Training budget", x: 590, y: 105 },
        { id: "hire", label: "Permanent hiring", x: 590, y: 255 },
        { id: "perm", label: "Permanent nurses", x: 330, y: 300 },
        { id: "work", label: "Workload per nurse", x: 95, y: 170 },
        { id: "leave", label: "Nurses leaving", x: 95, y: 300 },
      ],
      links: [
        { from: "gap", to: "agency", sign: "+", curve: 30 },
        { from: "agency", to: "gap", sign: "−", curve: 30 },
        { from: "agency", to: "budget", sign: "−" },
        { from: "budget", to: "hire", sign: "+" },
        { from: "gap", to: "hire", sign: "+", note: "delay" },
        { from: "hire", to: "perm", sign: "+" },
        { from: "perm", to: "gap", sign: "−" },
        { from: "gap", to: "work", sign: "+" },
        { from: "work", to: "leave", sign: "+" },
        { from: "leave", to: "perm", sign: "−" },
      ],
      loops: [
        { type: "B", label: "B1", x: 262, y: 108 },
        { type: "B", label: "B2", x: 420, y: 250 },
        { type: "R", label: "R1", x: 470, y: 140 },
        { type: "R", label: "R2", x: 210, y: 240 },
      ],
      caption:
        '<span class="chip chipB">B1</span> <b>Quick fix</b>: agency shifts close the gap within days. <span class="chip chipB">B2</span> <b>Fundamental fix</b>: hiring and training close it for good, but only after a long delay. <span class="chip chipR">R1</span> <b>Side effect</b>: agency spending drains the budget that pays for recruitment, weakening B2. <span class="chip chipR">R2</span> <b>Exodus</b>: a bigger gap means more work for those who stay, so more of them leave. Together this is shifting the burden with an eroding fundamental solution.',
      size: [680, 340],
    },
    sorting: [
      { name: "Permanent nurses", kind: "Stock", unit: "nurses" },
      { name: "Nurses in training", kind: "Stock", unit: "nurses" },
      { name: "Hiring", kind: "Flow", unit: "nurses/month" },
      { name: "Nurses leaving", kind: "Flow", unit: "nurses/month" },
      { name: "Staffing gap", kind: "Auxiliary", unit: "nurses" },
      { name: "Workload per nurse", kind: "Auxiliary", unit: "dimensionless (1 = normal)" },
      { name: "Normal turnover rate", kind: "Constant", unit: "1/month" },
      { name: "Training time", kind: "Constant", unit: "months" },
    ],
    stocks: [
      { name: "Nurses in training", unit: "nurses", inflows: ["Training starts"], outflows: ["Graduations"] },
      { name: "Permanent nurses", unit: "nurses", inflows: ["Graduations", "Hiring of qualified nurses"], outflows: ["Nurses leaving"] },
    ],
    equations: [
      "Graduations = Nurses in training / Training time",
      "Nurses leaving = Permanent nurses × Normal turnover rate × f(Workload per nurse), with f(1) = 1 and f rising above 1",
      "Staffing gap = MAX(0, Required nurses − Permanent nurses)",
      "Workload per nurse = Required nurses / (Permanent nurses + Agency cover)",
      "Agency cover = Staffing gap × Agency fill fraction (agency nurses carry a higher cost per shift)",
      "Training starts = Training budget / Cost per trainee, where Training budget = Workforce budget − Agency spending",
    ],
    policies: [
      { q: "Cap agency spending at this year's level. What happens to wards in the first year, and to the permanent workforce after three?", hint: "B1 weakens at once, so the gap and workload rise before B2 can respond. Look for a worse-before-better path." },
      { q: "Protect the training budget from agency overspend instead of capping agency use.", hint: "This cuts the link from agency spending to the training budget, breaking R1 without removing the quick fix." },
      { q: "Invest in retention (lower the effect of workload on leaving).", hint: "This weakens R2 directly. Compare how fast it acts with the three-year training delay." },
    ],
    critique: [
      "The model treats nurses as one pool. Experience matters: new graduates need support from experienced colleagues, so losing senior nurses may hurt more than the head count shows. How would a coflow of experience change the policy ranking?",
      "Agency nurses are drawn from the same national labour market. If many hospitals rely on agencies, permanent nurses may leave to work for agencies. Is the national market a boundary you can defend?",
    ],
    refs: ["senge1990", "wolstenholme2003", "homer1985", "sterman2000"],
    related: [
      { label: "Nurse staffing case", hash: "/apps/health/nurse-staffing" },
      { label: "Workforce planning case", hash: "/apps/health/workforce-planning" },
      { label: "Shifting the burden archetype", hash: "/learn/draw/arch-shifting-the-burden" },
      { label: "Aging chain molecule", hash: "/m/aging" },
    ],
  },
  {
    id: "promotion-bullwhip",
    field: "Supply chain",
    title: "Steady shoppers, swinging factory orders",
    brief:
      "A dairy brand sells through a national supermarket chain. Shoppers buy roughly the same amount every week, apart from planned promotions. Yet the orders the chain sends to the dairy's factory swing between half and twice the average, and the factory pays for overtime one month and idle lines the next. The supermarket's buyers order to keep shelves full; the factory blames them for erratic ordering. Both sides want a fix before the next promotion season.",
    voices: [
      { who: "Supermarket buyer", said: "We order what we need to keep the shelves full. If the factory delivered on time we would not need to over-order." },
      { who: "Factory planner", said: "Their orders make no sense. Sales are flat and orders double." },
      { who: "Category manager", said: "Promotions only last two weeks. I don't see how they can disrupt a whole quarter." },
    ],
    evidence: {
      title: "Shopper sales and orders to the factory, by week",
      unit: "pallets per week",
      x: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"],
      series: [
        { name: "Shopper sales", values: [100, 100, 140, 140, 100, 100, 100, 100, 100, 100, 100, 100] },
        { name: "Orders to factory", values: [100, 105, 190, 230, 120, 40, 55, 120, 150, 110, 80, 90] },
      ],
      note: "Invented teaching data. A two-week promotion in weeks 3 and 4; delivery takes about three weeks.",
    },
    articulate: [
      {
        q: "State the problem as behaviour over time.",
        answer: "A brief, 40% rise in shopper sales produces a swing in factory orders more than twice as large, followed by a slump and a second, smaller swing. Orders oscillate for weeks after sales have returned to normal.",
      },
      {
        q: "Whose decision will the model support, and what is its purpose?",
        answer: "The supermarket's ordering rule and the information it shares with the dairy. The purpose is to explain why orders amplify sales and to test ordering and information policies that damp the swing.",
      },
      {
        q: "Choose a time unit and a time horizon.",
        answer: "Weeks, over about six months: long enough to see a promotion and the full swing that follows it, short enough that the shopper demand pattern is known.",
      },
      {
        q: "Sketch the reference mode.",
        answer: "Past: orders overshoot sales, collapse below them, and ring for two or three cycles. Hoped for: orders rise with sales and come back without overshoot.",
      },
    ],
    boundary: {
      endogenous: ["Store inventory", "Supply line (orders placed but not yet delivered)", "Orders to the factory", "Demand forecast", "Desired inventory"],
      exogenous: ["Shopper sales, including promotions", "Delivery lead time", "Factory capacity (assumed sufficient)"],
      excluded: ["Pricing and competitor promotions", "Individual stores", "Spoilage and shelf life (a possible extension)"],
    },
    cldTask: "Draw the stock management structure in the supermarket's ordering. Include the loop managers attend to and the one they tend to ignore.",
    cld: {
      vars: [
        { id: "desired", label: "Desired inventory", x: 115, y: 40 },
        { id: "forecast", label: "Demand forecast", x: 355, y: 40 },
        { id: "gap", label: "Inventory gap", x: 115, y: 150 },
        { id: "orders", label: "Orders placed", x: 355, y: 150 },
        { id: "line", label: "Supply line", x: 585, y: 235 },
        { id: "inv", label: "Inventory", x: 115, y: 260 },
        { id: "deliv", label: "Deliveries", x: 355, y: 260 },
        { id: "sales", label: "Shopper sales", x: 585, y: 40 },
      ],
      links: [
        { from: "sales", to: "forecast", sign: "+" },
        { from: "forecast", to: "desired", sign: "+" },
        { from: "forecast", to: "orders", sign: "+" },
        { from: "desired", to: "gap", sign: "+" },
        { from: "inv", to: "gap", sign: "−" },
        { from: "gap", to: "orders", sign: "+" },
        { from: "orders", to: "line", sign: "+", curve: -30 },
        { from: "line", to: "orders", sign: "−", curve: -30 },
        { from: "line", to: "deliv", sign: "+" },
        { from: "deliv", to: "inv", sign: "+" },
      ],
      loops: [
        { type: "B", label: "B1", x: 235, y: 205 },
        { type: "B", label: "B2", x: 470, y: 128 },
      ],
      caption:
        '<span class="chip chipB">B1</span> <b>Inventory control</b>: when inventory falls short, orders rise and deliveries refill it, after the delivery delay. <span class="chip chipB">B2</span> <b>Supply line control</b>: orders already on the way, which arrive after the delivery delay, should reduce new orders. When buyers ignore B2, B1 keeps ordering for a gap that is already being filled, and orders overshoot.',
      size: [690, 300],
    },
    sorting: [
      { name: "Store inventory", kind: "Stock", unit: "pallets" },
      { name: "Supply line", kind: "Stock", unit: "pallets" },
      { name: "Orders placed", kind: "Flow", unit: "pallets/week" },
      { name: "Deliveries", kind: "Flow", unit: "pallets/week" },
      { name: "Shopper sales", kind: "Flow", unit: "pallets/week" },
      { name: "Demand forecast", kind: "Stock", unit: "pallets/week" },
      { name: "Inventory gap", kind: "Auxiliary", unit: "pallets" },
      { name: "Delivery lead time", kind: "Constant", unit: "weeks" },
    ],
    stocks: [
      { name: "Supply line", unit: "pallets", inflows: ["Orders placed"], outflows: ["Deliveries"] },
      { name: "Store inventory", unit: "pallets", inflows: ["Deliveries"], outflows: ["Shopper sales"] },
      { name: "Demand forecast (a smoothed stock)", unit: "pallets/week", inflows: ["Change in forecast"], outflows: [] },
    ],
    equations: [
      "Deliveries = Supply line / Delivery lead time",
      "Change in forecast = (Shopper sales − Demand forecast) / Forecast smoothing time",
      "Desired inventory = Demand forecast × Weeks of cover",
      "Desired supply line = Demand forecast × Delivery lead time",
      "Orders placed = MAX(0, Demand forecast + (Desired inventory − Inventory) / Inventory adjustment time + β × (Desired supply line − Supply line) / Inventory adjustment time)",
      "β is the weight buyers give to the supply line: 1 counts it fully; Sterman (1989) found most people use far less.",
    ],
    policies: [
      { q: "Make the supply line visible to buyers, so β rises from about 0.3 to 1.", hint: "This strengthens B2. Compare the peak order and the depth of the slump." },
      { q: "Share point-of-sale data and the promotion calendar with the factory.", hint: "The forecast no longer has to be inferred from orders. Which variable in your diagram does this change?" },
      { q: "Adjust inventory more slowly (a longer adjustment time).", hint: "Slower correction damps the swing but leaves shelves short for longer. What is the trade-off for a perishable product?" },
    ],
    critique: [
      "Lee, Padmanabhan and Whang (1997) explain the bullwhip with rational causes such as order batching and price changes; this brief puts the cause in the ordering rule. How would you design a study to tell the explanations apart in this chain?",
      "The brief assumes the factory always has capacity. If capacity is tight, deliveries slow when orders surge, the lead time lengthens and buyers order even more. Where would that loop sit in your diagram?",
    ],
    refs: ["sterman1989", "lee1997", "croson2006", "sterman2000"],
    related: [
      { label: "Bullwhip case", hash: "/apps/business/bullwhip" },
      { label: "Stock management molecule", hash: "/m/stockmgmt" },
      { label: "The beer game", hash: "/learn/games/beer" },
    ],
  },
  {
    id: "late-project",
    field: "Projects",
    title: "A software release that keeps slipping",
    brief:
      "A software team promised a new patient-records system for March. In January, 80% of the features were reported done. In March it was 90%, and in June it was still 90%. Managers asked for overtime, then added eight contractors. Testers report a growing list of defects in work that had been signed off. The client is threatening penalties and wants a credible delivery date.",
    voices: [
      { who: "Project manager", said: "We just need more hands. Every extra developer is more features per week." },
      { who: "Lead developer", said: "Half my time goes on showing the new people the codebase, and we keep reopening work we thought was finished." },
      { who: "Client sponsor", said: "You told us 90% done three months ago. How can the last 10% take longer than the first 90?" },
    ],
    evidence: {
      title: "Reported progress and defects found, by month",
      unit: "% of features reported done; open defects",
      x: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      series: [
        { name: "Reported done (%)", values: [35, 52, 68, 80, 86, 90, 90, 91, 90] },
        { name: "Open defects", values: [20, 35, 60, 95, 140, 190, 230, 250, 260] },
        { name: "Developers", values: [20, 20, 20, 20, 24, 28, 28, 28, 28] },
      ],
      note: "Invented teaching data, in the pattern documented by Cooper (1980) and Ford and Sterman (2003).",
    },
    articulate: [
      {
        q: "State the problem as behaviour over time.",
        answer: "Reported progress rose quickly, then stalled near 90% for months while open defects kept rising. The project appears nearly finished long before it is, because undiscovered rework hides inside work counted as done.",
      },
      {
        q: "Whose decision will the model support, and what is its purpose?",
        answer: "The project director's choice of how to finish: more staff, more overtime, a later date or a smaller scope. The purpose is to explain the 90% syndrome and to estimate a credible completion date under each option.",
      },
      {
        q: "Choose a time unit and a time horizon.",
        answer: "Weeks, from the start of the project to at least a year after the original deadline, so the full tail of rework can play out.",
      },
      {
        q: "Sketch the reference mode.",
        answer: "Past: reported progress follows an S-curve that stalls at about 90%, while real progress lags behind it and defects found keep climbing. Feared: the stall continues and staff leave. Hoped: a date that is met, even if it is later than the first promise.",
      },
    ],
    boundary: {
      endogenous: ["Work remaining", "Undiscovered rework", "Schedule pressure", "Overtime", "Fatigue", "Error rate", "Staff and their experience"],
      exogenous: ["Project scope", "Deadline", "Hiring limits and contractor availability"],
      excluded: ["Client requirement changes (a separate brief)", "Individual developer skills", "Budget and penalties beyond their effect on pressure"],
    },
    cldTask: "Draw the structure that keeps the project at 90%. Include the two ways managers try to speed up, and the side effect of each.",
    cld: {
      vars: [
        { id: "remaining", label: "Work remaining", x: 340, y: 170 },
        { id: "pressure", label: "Schedule pressure", x: 340, y: 45 },
        { id: "overtime", label: "Overtime", x: 590, y: 45 },
        { id: "progress", label: "Progress rate", x: 590, y: 170 },
        { id: "fatigue", label: "Fatigue", x: 720, y: 255 },
        { id: "errors", label: "Error rate", x: 590, y: 310 },
        { id: "rework", label: "Rework found", x: 340, y: 310 },
        { id: "staff", label: "Staff", x: 100, y: 45 },
        { id: "exp", label: "Average experience", x: 110, y: 240 },
      ],
      links: [
        { from: "remaining", to: "pressure", sign: "+" },
        { from: "pressure", to: "overtime", sign: "+" },
        { from: "overtime", to: "progress", sign: "+" },
        { from: "progress", to: "remaining", sign: "−" },
        { from: "overtime", to: "fatigue", sign: "+", curve: -40 },
        { from: "fatigue", to: "errors", sign: "+" },
        { from: "errors", to: "rework", sign: "+" },
        { from: "rework", to: "remaining", sign: "+" },
        { from: "pressure", to: "staff", sign: "+" },
        { from: "staff", to: "progress", sign: "+", curve: 60 },
        { from: "staff", to: "exp", sign: "−" },
        { from: "exp", to: "errors", sign: "−", curve: -45 },
      ],
      loops: [
        { type: "B", label: "B1", x: 465, y: 108 },
        { type: "B", label: "B2", x: 230, y: 122 },
        { type: "R", label: "R1", x: 520, y: 240 },
        { type: "R", label: "R2", x: 235, y: 225 },
      ],
      caption:
        '<span class="chip chipB">B1</span> <b>Work harder</b>: pressure brings overtime and faster progress. <span class="chip chipB">B2</span> <b>Add people</b>: pressure brings more staff and more progress. <span class="chip chipR">R1</span> <b>Burnout</b>: overtime breeds fatigue, errors and rework, which adds to the work remaining. <span class="chip chipR">R2</span> <b>Dilution</b>: new staff lower average experience, so errors and rework rise (Brooks\'s law).',
      size: [800, 350],
    },
    sorting: [
      { name: "Work remaining", kind: "Stock", unit: "tasks" },
      { name: "Undiscovered rework", kind: "Stock", unit: "tasks" },
      { name: "Work reported done", kind: "Stock", unit: "tasks" },
      { name: "Progress rate", kind: "Flow", unit: "tasks/week" },
      { name: "Rework discovery", kind: "Flow", unit: "tasks/week" },
      { name: "Schedule pressure", kind: "Auxiliary", unit: "dimensionless" },
      { name: "Error fraction", kind: "Auxiliary", unit: "dimensionless" },
      { name: "Time to discover rework", kind: "Constant", unit: "weeks" },
    ],
    stocks: [
      { name: "Work remaining", unit: "tasks", inflows: ["Rework discovery"], outflows: ["Progress rate"] },
      { name: "Work really done", unit: "tasks", inflows: ["Correct completion"], outflows: [] },
      { name: "Undiscovered rework", unit: "tasks", inflows: ["Flawed completion"], outflows: ["Rework discovery"] },
    ],
    equations: [
      "Progress rate = Staff × Productivity × (1 + Overtime fraction) × Effect of fatigue",
      "Correct completion = Progress rate × (1 − Error fraction)",
      "Flawed completion = Progress rate × Error fraction",
      "Rework discovery = Undiscovered rework / Time to discover rework",
      "Work reported done = Work really done + Undiscovered rework (this is why the reported figure stalls near 90%)",
      "Error fraction = Normal error fraction × f(Fatigue) × g(Average experience)",
    ],
    policies: [
      { q: "Add eight more developers in month five.", hint: "B2 adds capacity, but R2 adds errors and the training load. When does the extra staff pay off, if at all?" },
      { q: "Stop overtime and set a later, realistic date.", hint: "This weakens R1. Compare the final completion date with the overtime policy." },
      { q: "Test earlier, so rework is discovered faster.", hint: "A shorter time to discover rework makes the reported figure honest sooner. Does it shorten the project?" },
    ],
    critique: [
      "Reported progress is itself a model output: what managers see is not what is real. How would you calibrate the error fraction and discovery time when the data you have is the reported figure?",
      "Lyneis and Ford (2007) note that project models are often used after the fact, in disputes. What changes if the model is built at the start of a project instead?",
    ],
    refs: ["cooper1980", "fordSterman2003", "lyneisFord2007", "abdelhamidMadnick1991", "brooks1975"],
    related: [
      { label: "Rework cycle case", hash: "/apps/projects/rework-cycle" },
      { label: "Adding people case", hash: "/apps/projects/adding-people" },
      { label: "Rework cycle molecule", hash: "/m/reworkCycle" },
    ],
  },
  {
    id: "service-erosion",
    field: "Services",
    title: "A claims centre where quality quietly slips",
    brief:
      "An insurer's claims centre has a target of settling claims within ten working days. Two years ago it met the target easily. Since a hiring freeze, the backlog has grown, staff work longer hours and the average time spent on each claim has fallen. Productivity looks better than ever on the dashboard. But complaints, reopened claims and calls from customers asking about their claim have all risen, and leakage (money paid out that should not have been) is up. The operations director wants to know whether the centre is efficient or eroding.",
    voices: [
      { who: "Operations director", said: "Claims per handler per day are at a record. The team has found efficiencies." },
      { who: "Team leader", said: "We skip the checks to get through the queue. Then half of them come back." },
      { who: "Quality auditor", said: "Leakage is up a third. Nobody looks at that number when they set staffing." },
    ],
    evidence: {
      title: "Claims centre indicators, by quarter",
      unit: "claims, hours and %",
      x: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"],
      series: [
        { name: "Backlog (claims)", values: [2100, 2200, 2600, 3100, 3400, 3800, 4300, 4700] },
        { name: "Minutes per claim", values: [95, 94, 86, 78, 72, 68, 64, 61] },
        { name: "Reopened claims (%)", values: [6, 6, 8, 10, 12, 14, 16, 18] },
      ],
      note: "Invented teaching data, in the pattern described by Oliva and Sterman (2001).",
    },
    articulate: [
      {
        q: "State the problem as behaviour over time.",
        answer: "Under steady pressure from a growing backlog, time per claim has drifted down, apparent productivity has risen and quality has fallen. Reopened claims feed the backlog, so the pressure that caused the corner cutting is itself sustained by it.",
      },
      {
        q: "Whose decision will the model support, and what is its purpose?",
        answer: "The operations director's staffing and standards policy. The purpose is to show whether the productivity gain is real or borrowed from quality, and what staffing would hold both service time and quality.",
      },
      {
        q: "Choose a time unit and a time horizon.",
        answer: "Weeks, over two to three years. Erosion is slow: it took eight quarters to show, so a short horizon would miss it.",
      },
      {
        q: "Sketch the reference mode.",
        answer: "Past: backlog rising, time per claim falling, reopened claims rising. Feared: standards keep eroding until a major failure. Hoped: backlog stable with time per claim back near the standard.",
      },
    ],
    boundary: {
      endogenous: ["Backlog", "Work pressure", "Time per claim", "Quality", "Reopened claims", "Overtime", "Fatigue"],
      exogenous: ["New claims arriving", "Number of handlers (frozen)", "The ten-day target"],
      excluded: ["Claim types and complexity", "Customer churn (an extension)", "Fraud"],
    },
    cldTask: "Draw how the centre copes with pressure in the short run, and how each way of coping comes back to bite.",
    cld: {
      vars: [
        { id: "backlog", label: "Claims backlog", x: 360, y: 175 },
        { id: "pressure", label: "Work pressure", x: 360, y: 45 },
        { id: "time", label: "Time per claim", x: 115, y: 110 },
        { id: "done", label: "Claims settled", x: 360, y: 305 },
        { id: "quality", label: "Quality", x: 95, y: 245 },
        { id: "reopen", label: "Reopened claims", x: 195, y: 330 },
        { id: "ot", label: "Overtime", x: 605, y: 110 },
        { id: "fatigue", label: "Fatigue", x: 620, y: 260 },
      ],
      links: [
        { from: "backlog", to: "pressure", sign: "+" },
        { from: "pressure", to: "time", sign: "−" },
        { from: "time", to: "done", sign: "−" },
        { from: "done", to: "backlog", sign: "−" },
        { from: "time", to: "quality", sign: "+" },
        { from: "quality", to: "reopen", sign: "−" },
        { from: "reopen", to: "backlog", sign: "+", curve: 35 },
        { from: "pressure", to: "ot", sign: "+" },
        { from: "ot", to: "done", sign: "+" },
        { from: "ot", to: "fatigue", sign: "+" },
        { from: "fatigue", to: "done", sign: "−" },
      ],
      loops: [
        { type: "B", label: "B1", x: 270, y: 150 },
        { type: "R", label: "R1", x: 215, y: 220 },
        { type: "B", label: "B2", x: 460, y: 150 },
        { type: "R", label: "R2", x: 540, y: 205 },
      ],
      caption:
        '<span class="chip chipB">B1</span> <b>Cut corners</b>: pressure shortens the time per claim, so more claims are settled. <span class="chip chipR">R1</span> <b>Rework</b>: less time per claim lowers quality, more claims come back, and the backlog grows. <span class="chip chipB">B2</span> <b>Work longer</b>: pressure brings overtime and more claims settled. <span class="chip chipR">R2</span> <b>Burnout</b>: overtime breeds fatigue, which slows the work.',
      size: [720, 350],
    },
    sorting: [
      { name: "Claims backlog", kind: "Stock", unit: "claims" },
      { name: "New claims", kind: "Flow", unit: "claims/week" },
      { name: "Claims settled", kind: "Flow", unit: "claims/week" },
      { name: "Reopened claims", kind: "Flow", unit: "claims/week" },
      { name: "Time per claim", kind: "Stock", unit: "hours/claim" },
      { name: "Work pressure", kind: "Auxiliary", unit: "dimensionless" },
      { name: "Fatigue", kind: "Stock", unit: "dimensionless" },
      { name: "Standard time per claim", kind: "Constant", unit: "hours/claim" },
    ],
    stocks: [
      { name: "Claims backlog", unit: "claims", inflows: ["New claims", "Reopened claims"], outflows: ["Claims settled"] },
      { name: "Time per claim (adjusts slowly to pressure)", unit: "hours/claim", inflows: ["Change in time per claim"], outflows: [] },
      { name: "Fatigue (accumulated recent overtime)", unit: "dimensionless", inflows: ["Change in fatigue"], outflows: [] },
    ],
    equations: [
      "Desired completion = Claims backlog / Target settlement time",
      "Work pressure = Desired completion / (Handlers × Standard hours × (1 / Standard time per claim))",
      "Change in time per claim = (Standard time per claim × f(Work pressure) − Time per claim) / Adjustment time, with f falling as pressure rises",
      "Claims settled = MIN(Claims backlog / Minimum processing time, Handlers × Hours worked × Effect of fatigue / Time per claim)",
      "Reopened claims = Claims settled × Reopen fraction(Time per claim / Standard time per claim)",
      "Erosion of standards: in Oliva and Sterman (2001) the standard itself drifts toward recent practice. Add it as a stock if you want to test it.",
    ],
    policies: [
      { q: "Lift the hiring freeze by 10%.", hint: "Relieves pressure, so B1 and B2 relax. Does quality recover as fast as it fell?" },
      { q: "Ban overtime but keep the ten-day target.", hint: "B2 goes; does B1 (corner cutting) take up the slack?" },
      { q: "Report quality and leakage next to productivity on the dashboard.", hint: "This changes what managers see. Which link in your diagram does that affect?" },
    ],
    critique: [
      "The productivity dashboard is a measurement problem as much as a staffing one. How would you show the board that a rising productivity figure can be a symptom of decline?",
      "Oliva and Sterman (2001) add the erosion of the standard itself, which turns a temporary adjustment into a permanent loss. What evidence in this brief would tell you the standard has eroded?",
    ],
    refs: ["olivaSterman2001", "repenningSterman2001", "homer1985", "sterman2000"],
    related: [
      { label: "Service quality case", hash: "/apps/business/service-quality" },
      { label: "Capability trap case", hash: "/apps/business/capability-trap" },
      { label: "Eroding goals archetype", hash: "/learn/draw/arch-eroding-goals" },
    ],
  },
  {
    id: "groundwater",
    field: "Environment",
    title: "Farms drawing down a shared aquifer",
    brief:
      "Farms in a river valley irrigate from a shared aquifer. Over twenty years irrigated area has doubled on the back of high crop prices, and the water table has fallen from 15 to 60 metres below ground. Pumping costs rise with depth, and some shallow wells have run dry, yet new wells are still being drilled. The regional water authority is considering metering and quotas; the farmers' association argues that falling profits will limit pumping on their own.",
    voices: [
      { who: "Farmers' association", said: "Nobody pumps at a loss. When it gets too expensive, pumping will stop by itself." },
      { who: "Water authority hydrologist", said: "By the time it is too expensive, the aquifer will be close to exhausted, and it recharges over decades." },
      { who: "Young farmer", said: "If I don't pump it, my neighbour will." },
    ],
    evidence: {
      title: "Irrigation and the water table, every four years",
      unit: "hectares; metres below ground",
      x: ["Yr 0", "Yr 4", "Yr 8", "Yr 12", "Yr 16", "Yr 20"],
      series: [
        { name: "Irrigated area (hundred ha)", values: [40, 48, 58, 68, 76, 80] },
        { name: "Depth to water (m)", values: [15, 19, 26, 35, 47, 60] },
      ],
      note: "Invented teaching data. Natural recharge is roughly constant and well below current pumping.",
    },
    articulate: [
      {
        q: "State the problem as behaviour over time.",
        answer: "Irrigated area and pumping have grown for twenty years, and the water table has fallen at an accelerating rate. The question is whether rising pumping costs will stop the decline in time, or only after the aquifer is largely used up.",
      },
      {
        q: "Whose decision will the model support, and what is its purpose?",
        answer: "The water authority's choice between doing nothing, metering with prices, and tradable quotas. The purpose is to test whether the cost feedback alone is strong and fast enough, and how each policy changes the path of the water table and farm income.",
      },
      {
        q: "Choose a time unit and a time horizon.",
        answer: "Years, over fifty years at least. Recharge is slow, so the consequences of today's pumping play out over decades.",
      },
      {
        q: "Sketch the reference mode.",
        answer: "Past: area growing, depth increasing ever faster. Feared: overshoot and collapse, as pumping stops only when the aquifer is near exhaustion and farms fail together. Hoped: pumping falls to the recharge rate while the aquifer still holds a useful reserve.",
      },
    ],
    boundary: {
      endogenous: ["Water in the aquifer (depth)", "Pumping", "Pumping cost", "Farm income", "Irrigated area"],
      exogenous: ["Natural recharge", "Crop prices", "Energy prices"],
      excluded: ["Individual farms and their strategies (a possible agent-based extension)", "Water quality", "River flows (assumed unconnected)"],
    },
    cldTask: "Draw the feedback between farming and the aquifer. Which loop drives growth, which loops are meant to stop it, and how strong and fast are they?",
    cld: {
      vars: [
        { id: "area", label: "Irrigated area", x: 120, y: 60 },
        { id: "pump", label: "Pumping", x: 360, y: 60 },
        { id: "aquifer", label: "Water in aquifer", x: 580, y: 160 },
        { id: "cost", label: "Pumping cost", x: 360, y: 260 },
        { id: "income", label: "Farm income", x: 120, y: 260 },
        { id: "recharge", label: "Recharge", x: 580, y: 290 },
      ],
      links: [
        { from: "area", to: "pump", sign: "+" },
        { from: "pump", to: "income", sign: "+" },
        { from: "income", to: "area", sign: "+", note: "delay" },
        { from: "pump", to: "aquifer", sign: "−" },
        { from: "aquifer", to: "cost", sign: "−" },
        { from: "cost", to: "income", sign: "−" },
        { from: "cost", to: "pump", sign: "−" },
        { from: "recharge", to: "aquifer", sign: "+" },
      ],
      loops: [
        { type: "R", label: "R", x: 205, y: 115 },
        { type: "B", label: "B1", x: 455, y: 160 },
        { type: "B", label: "B2", x: 300, y: 190 },
      ],
      caption:
        '<span class="chip chipR">R</span> <b>Expansion</b>: pumping raises income, which pays for more irrigated area and more pumping. <span class="chip chipB">B1</span> <b>Cost of depth</b>: pumping lowers the aquifer, raising the cost of each cubic metre and discouraging pumping. <span class="chip chipB">B2</span> <b>Profit squeeze</b>: higher cost cuts income and the growth of area. Both balancing loops act through a slowly falling stock, so they are weak and late.',
      size: [700, 330],
    },
    sorting: [
      { name: "Water in aquifer", kind: "Stock", unit: "million m³" },
      { name: "Pumping", kind: "Flow", unit: "million m³/year" },
      { name: "Recharge", kind: "Flow", unit: "million m³/year" },
      { name: "Irrigated area", kind: "Stock", unit: "hectares" },
      { name: "Area expansion", kind: "Flow", unit: "hectares/year" },
      { name: "Pumping cost per m³", kind: "Auxiliary", unit: "€/m³" },
      { name: "Water use per hectare", kind: "Constant", unit: "m³/(hectare·year)" },
      { name: "Farm income", kind: "Auxiliary", unit: "€/year" },
    ],
    stocks: [
      { name: "Water in aquifer", unit: "million m³", inflows: ["Recharge"], outflows: ["Pumping"] },
      { name: "Irrigated area", unit: "hectares", inflows: ["Area expansion"], outflows: ["Area abandoned"] },
    ],
    equations: [
      "Pumping = MIN(Irrigated area × Water use per hectare, Water in aquifer / Minimum depletion time)",
      "Depth to water = Aquifer depth at full − Water in aquifer / (Aquifer area × Storage coefficient)",
      "Pumping cost per m³ = Energy price × Depth to water × Energy per m³ per metre",
      "Farm income = Irrigated area × (Crop revenue per hectare − Water use per hectare × Pumping cost per m³ − Other costs per hectare)",
      "Area expansion = MAX(0, Irrigated area × Expansion rate × f(Income per hectare)), with a delay for drilling and planting",
      "Area abandoned = Irrigated area × g(Income per hectare), rising when income per hectare turns negative",
    ],
    policies: [
      { q: "Do nothing and rely on rising costs.", hint: "B1 and B2 work through the falling stock. How deep does the water table get before pumping falls to recharge?" },
      { q: "Charge a resource price per cubic metre, rising with depth.", hint: "This strengthens B1 now, not decades from now. Who loses income, and when?" },
      { q: "Cap total pumping at recharge with tradable quotas.", hint: "This cuts R at its root. Compare farm income over fifty years with the do-nothing run." },
    ],
    critique: [
      "Moxnes (1998) found over-exploitation even with a single owner, because people misjudge the dynamics of the stock. If misperception, not only the commons, drives the decline, what does that imply for the policy?",
      "Ostrom (1990) documents communities that govern shared resources without either privatisation or central control. What would a model need to include to represent that third option?",
    ],
    refs: ["hardin1968", "moxnes1998", "ostrom1990", "madani2009"],
    related: [
      { label: "Groundwater case", hash: "/apps/environment/groundwater" },
      { label: "Fishery case", hash: "/apps/environment/fishery" },
      { label: "Tragedy of the commons archetype", hash: "/learn/draw/arch-tragedy-of-the-commons" },
      { label: "The fishery game", hash: "/learn/games/fishery" },
    ],
  },
  {
    id: "diabetes",
    field: "Public health",
    title: "Diabetes prevalence and the prevention budget",
    brief:
      "A regional health authority has watched the number of adults with diagnosed type 2 diabetes rise every year for a decade, and the cost of treating them rise faster. Each budget round, treatment wins money from the prevention programme because treatment needs are urgent and visible. Public health leads argue that cutting prevention is storing up more cases. The authority wants to know what level of prevention spending would bend the curve, and how long it would take to show.",
    voices: [
      { who: "Finance lead", said: "We cannot leave diagnosed patients without care to fund leaflets and gym passes." },
      { who: "Public health director", said: "Every cut to prevention today becomes a cohort of patients in ten years." },
      { who: "GP", said: "Most of my patients with prediabetes do not know they have it." },
    ],
    evidence: {
      title: "Adult diabetes in the region, every two years",
      unit: "thousand adults; € million",
      x: ["Yr 0", "Yr 2", "Yr 4", "Yr 6", "Yr 8", "Yr 10"],
      series: [
        { name: "Diagnosed diabetes (thousand)", values: [62, 68, 75, 82, 90, 98] },
        { name: "Treatment cost (€m)", values: [210, 240, 275, 315, 360, 410] },
        { name: "Prevention budget (€m)", values: [12, 11, 9, 8, 6, 5] },
      ],
      note: "Invented teaching data, in the pattern modelled by Jones et al. (2006).",
    },
    articulate: [
      {
        q: "State the problem as behaviour over time.",
        answer: "Diagnosed diabetes and treatment costs have risen steadily while the prevention budget has shrunk. The suspicion is that the two trends are linked: cuts to prevention feed the inflow to the stock of people with diabetes, whose costs then drive further cuts.",
      },
      {
        q: "Whose decision will the model support, and what is its purpose?",
        answer: "The health authority's budget split between treatment and prevention. The purpose is to compare the long-run prevalence and cost of different prevention commitments, including how long each takes to show a benefit.",
      },
      {
        q: "Choose a time unit and a time horizon.",
        answer: "Years, over twenty to thirty years. Progression from prediabetes to diabetes takes years, and the benefit of prevention shows only once the cohorts it protects would otherwise have become ill.",
      },
      {
        q: "Sketch the reference mode.",
        answer: "Past: prevalence and cost rising, prevention falling. Feared: an accelerating spiral as cost growth squeezes prevention further. Hoped: prevalence levels off within fifteen years, with costs growing more slowly than now.",
      },
    ],
    boundary: {
      endogenous: ["People with prediabetes", "People with diabetes", "Onset of diabetes", "Treatment costs", "Prevention budget and reach"],
      exogenous: ["Obesity trend in the population", "Population ageing", "Total health budget"],
      excluded: ["Complications as separate stocks (an extension, as in Jones et al. 2006)", "Type 1 diabetes", "Detection and diagnosis rates (named as an important omission)"],
    },
    cldTask: "Draw the population flow from prediabetes to diabetes, the deaths that drain it, and the budget feedback that links prevalence to prevention.",
    cld: {
      vars: [
        { id: "obesity", label: "Obesity", x: 95, y: 300 },
        { id: "pre", label: "Prediabetes", x: 95, y: 175 },
        { id: "onset", label: "Diabetes onset", x: 330, y: 175 },
        { id: "dia", label: "People with diabetes", x: 590, y: 175 },
        { id: "deaths", label: "Deaths", x: 590, y: 300 },
        { id: "cost", label: "Treatment costs", x: 590, y: 50 },
        { id: "budget", label: "Prevention budget", x: 330, y: 50 },
        { id: "reach", label: "Prevention reach", x: 110, y: 50 },
      ],
      links: [
        { from: "obesity", to: "pre", sign: "+" },
        { from: "pre", to: "onset", sign: "+", curve: 28 },
        { from: "onset", to: "pre", sign: "−", curve: 28 },
        { from: "onset", to: "dia", sign: "+" },
        { from: "dia", to: "deaths", sign: "+", curve: 28 },
        { from: "deaths", to: "dia", sign: "−", curve: 28 },
        { from: "dia", to: "cost", sign: "+" },
        { from: "cost", to: "budget", sign: "−" },
        { from: "budget", to: "reach", sign: "+" },
        { from: "reach", to: "onset", sign: "−" },
      ],
      loops: [
        { type: "B", label: "B1", x: 212, y: 222 },
        { type: "B", label: "B2", x: 655, y: 238 },
        { type: "R", label: "R", x: 440, y: 112 },
      ],
      caption:
        '<span class="chip chipB">B1</span> <b>Depletion</b>: onset moves people out of prediabetes, draining the pool it comes from. <span class="chip chipB">B2</span> <b>Mortality</b>: more people with diabetes means more deaths, which drain the stock. <span class="chip chipR">R</span> <b>Crowding out</b>: more people with diabetes raise treatment costs, which squeeze the prevention budget, so fewer people are reached and onset rises.',
      size: [700, 340],
    },
    sorting: [
      { name: "People with prediabetes", kind: "Stock", unit: "people" },
      { name: "People with diabetes", kind: "Stock", unit: "people" },
      { name: "Diabetes onset", kind: "Flow", unit: "people/year" },
      { name: "Deaths of people with diabetes", kind: "Flow", unit: "people/year" },
      { name: "Treatment costs", kind: "Auxiliary", unit: "€/year" },
      { name: "Prevention reach", kind: "Auxiliary", unit: "fraction of people with prediabetes" },
      { name: "Annual cost per patient", kind: "Constant", unit: "€/(person·year)" },
      { name: "Normal progression time", kind: "Constant", unit: "years" },
    ],
    stocks: [
      { name: "People with prediabetes", unit: "people", inflows: ["New prediabetes"], outflows: ["Diabetes onset", "Recovery to normal glucose", "Deaths without diabetes"] },
      { name: "People with diabetes", unit: "people", inflows: ["Diabetes onset"], outflows: ["Deaths of people with diabetes"] },
    ],
    equations: [
      "Diabetes onset = People with prediabetes / Normal progression time × (1 − Prevention reach × Prevention effect)",
      "Prevention effect ≈ 0.58: the Diabetes Prevention Program trial found lifestyle intervention cut incidence by 58% (Knowler et al. 2002)",
      "Deaths of people with diabetes = People with diabetes × Death rate with diabetes",
      "Treatment costs = People with diabetes × Annual cost per patient",
      "Prevention budget = MAX(0, Health budget − Treatment costs − Other spending)",
      "Prevention reach = MIN(1, Prevention budget / (Cost per person reached × People with prediabetes))",
    ],
    policies: [
      { q: "Ring-fence prevention at its year-zero level.", hint: "This breaks the link from cost to budget, so R stops. How many years until prevalence differs from the baseline?" },
      { q: "Double prevention for five years, then return to baseline.", hint: "A temporary boost moves people through a slow stock. Does the benefit last after the money stops?" },
      { q: "Find more people with prediabetes (better detection).", hint: "Detection is outside the boundary as drawn. Where would you add it, and which loop would it strengthen?" },
    ],
    critique: [
      "Jones et al. (2006) found that even strong prevention takes many years to bend prevalence, because the stock of people with diabetes drains slowly. How would you present a policy whose benefit appears after the decision makers have left office?",
      "Lower mortality among people with diabetes, a success of treatment, raises prevalence. How would you stop the model being read as saying that better care is bad?",
    ],
    refs: ["jones2006", "homerHirsch2006", "knowler2002", "sterman2006", "sterman2000"],
    related: [
      { label: "Diabetes case", hash: "/apps/health/diabetes" },
      { label: "Aging chain molecule", hash: "/m/aging" },
      { label: "Fixes that fail archetype", hash: "/learn/draw/arch-fixes-that-fail" },
    ],
  },
];

export const studioById = (id?: string) => STUDIO.find((c) => c.id === id);
