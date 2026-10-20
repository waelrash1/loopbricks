// Projects, work and organisations: the rework cycle, schedule pressure, overtime, fatigue and staffing.
// Every reference below was checked against Crossref, OpenAlex or a library catalogue (Oct 2026); findings quote the abstract.
import type { Model } from "@/data/molecules";
import type { AppCase, DataSource, Domain, Ref, Run } from "@/data/apps/types";
import { skins, type Skin } from "@/data/apps/sim";

// ---------- models: Hines molecules under project names ----------
const SKINS: Record<string, Skin> = {
  proj_rework: {
    base: "reworkCycle",
    name: "Rework cycle in a project",
    stocks: {
      workToDo: { label: "Work to do" },
      undiscovered: { label: "Undiscovered rework" },
      workDone: { label: "Work really done" },
    },
    params: {
      capacity: { label: "Team capacity", unit: "tasks/wk" },
      quality: { label: "Share done right first time" },
      discoverTime: { label: "Time to discover rework" },
    },
    flows: {
      correct: ["work done right", "work rate × share done right"],
      rework: ["work done wrong", "work rate × (1 − share done right)"],
      discovering: ["discovering rework", "Undiscovered rework / time to discover"],
    },
  },
  proj_conceal: {
    base: "reworkCycle",
    name: "Reported and real progress",
    stocks: {
      workToDo: { label: "Work to do" },
      undiscovered: { label: "Flawed work reported as done" },
      workDone: { label: "Work really done" },
    },
    params: {
      capacity: { label: "Team capacity", unit: "tasks/wk" },
      quality: { label: "Share done right first time", value: 0.75 },
      discoverTime: { label: "Time before problems are reported" },
    },
    flows: {
      correct: ["work done right", "work rate × share done right"],
      rework: ["flawed work, not reported", "work rate × (1 − share done right)"],
      discovering: ["problems reported", "Flawed work reported as done / time before reporting"],
    },
  },
  proj_scope: {
    base: "estCompletion",
    name: "Change orders and the finish date",
    stocks: { workRemaining: { label: "Work remaining" } },
    params: {
      workRate: { label: "Team work rate", unit: "tasks/wk" },
      scopeCreep: { label: "Changes added", unit: "tasks/wk" },
    },
    flows: {
      in: ["changes added", "change orders per week"],
      accomplishing: ["work completed", "MIN(work rate, Work remaining / 0.5 wk)"],
    },
  },
  proj_deadline: {
    base: "schedulePressure",
    name: "Deadline and schedule pressure",
    stocks: { workRemaining: { label: "Work remaining" } },
    params: {
      scheduled: { label: "Deadline", unit: "wk" },
      baseRate: { label: "Normal work rate", unit: "tasks/wk" },
    },
    flows: { workRate: ["work completed", "normal rate × MIN(2, MAX(0.5, required rate / normal rate))"] },
  },
  proj_crunch: {
    base: "prodFatigue",
    name: "Crunch: overtime and fatigue",
    stocks: { fatigue: { label: "Fatigue" }, relOutput: { label: "Team output (× normal)" } },
    params: {
      overtime: { label: "Hours worked (× normal)" },
      timeToFatigue: { label: "Time to get fatigued" },
      workforce: { label: "Team size", unit: "people" },
      normalPDY: { label: "Tasks per person-week", unit: "tasks" },
    },
    flows: { gettingFatigued: ["getting fatigued", "(hours worked − Fatigue) / time to get fatigued"] },
  },
  proj_burnout: {
    base: "effectFatigue",
    name: "Work limit and productivity",
    stocks: { fatigue: { label: "Fatigue" }, effect: { label: "Productivity per hour (× normal)" } },
    params: {
      overtime: { label: "Hours worked (× normal)" },
      timeToFatigue: { label: "Time to get fatigued" },
      slope: { label: "How much fatigue cuts productivity" },
    },
    flows: {
      gettingFatigued: ["getting fatigued", "MAX(0, (hours − Fatigue) / time to get fatigued)"],
      recovering: ["recovering", "MAX(0, (Fatigue − hours) / time to get fatigued)"],
    },
  },
  proj_experience: {
    base: "coflow",
    name: "Staff and their experience",
    stocks: {
      people: { label: "Staff", init: 48 },
      totExp: { label: "Total years of experience", init: 288 },
      avgExp: { label: "Average experience (yr)", init: 6 },
    },
    params: {
      hire: { label: "Hiring", unit: "people/yr" },
      tenure: { label: "Average time in the firm" },
      hireExp: { label: "Experience of new hires" },
    },
    flows: { hireFlow: ["hiring", "people hired per year"], quitFlow: ["leaving", "Staff / average time in the firm"] },
  },
  proj_team: {
    base: "agingPDY",
    name: "Growing a team",
    timeUnit: "mo",
    stocks: {
      rookies: { label: "New hires (half as productive)", init: 3, scale: 60 },
      experienced: { label: "Experienced staff", init: 25, scale: 80 },
      gray: { label: "Leads (part of their time coaching)", init: 8, scale: 40 },
    },
    params: {
      hiring: { label: "Hiring", min: 0, max: 10, step: 0.5, value: 1, unit: "people/mo" },
      tMature: { label: "Time for a new hire to get up to speed", unit: "mo" },
      tExp: { label: "Time before becoming a lead", unit: "mo" },
      tGray: { label: "Time a lead stays", unit: "mo" },
    },
    flows: {
      hire: ["hiring", "people hired per month"],
      mature: ["getting up to speed", "New hires / time to get up to speed"],
      senior: ["becoming a lead", "Experienced / time before becoming a lead"],
      retire: ["leaving", "Leads / time a lead stays"],
    },
  },
};

const MODELS: Record<string, Model> = skins(SKINS);
const STOP: Record<string, number> = {
  proj_rework: 60, proj_conceal: 60, proj_scope: 60, proj_deadline: 25, proj_crunch: 20,
  proj_burnout: 18, proj_experience: 60, proj_team: 24,
};


// ---------- helpers for the behaviour checks ----------
type Vars = Record<string, number>;
// first time (in 0.5 steps) at which a run satisfies cond; Infinity if never within the limit
function firstT(run: Run, p: Record<string, number>, cond: (e: Vars) => boolean, limit: number) {
  for (let t = 0.5; t <= limit; t += 0.5) if (cond(run(p, t).end)) return t;
  return Infinity;
}
const finished = (run: Run, p: Record<string, number>) => firstT(run, p, (e) => e.workDone >= 990, 200);
const reported = (e: Vars) => (e.workDone + e.undiscovered) / 1000;
const longRunOutput = (run: Run, hours: number) => hours * run({ overtime: hours, timeToFatigue: 3, slope: 0.6 }).end.effect;
// agingPDY: rookies produce 0.5, experienced 1.0, veterans 0.8 of a full person
const teamOutput = (e: Vars) => e.rookies * 0.5 + e.experienced + e.gray * 0.8;
const perHead = (e: Vars) => teamOutput(e) / (e.rookies + e.experienced + e.gray);

export const THEMES = ["Rework and quality", "Schedules and estimates", "People, effort and fatigue", "Staffing and skills"] as const;

const REFS: Record<string, Ref> = {
  cooper1980: { text: "Cooper KG (1980). Naval ship production: a claim settled and a framework built. Interfaces 10(6):20-36.", doi: "10.1287/inte.10.6.20" },
  lyneisFord2007: { text: "Lyneis JM, Ford DN (2007). System dynamics applied to project management: a survey, assessment, and directions for future research. System Dynamics Review 23(2-3):157-189.", doi: "10.1002/sdr.377" },
  fordSterman2003syndrome: { text: "Ford DN, Sterman JD (2003). Overcoming the 90% syndrome: iteration management in concurrent development projects. Concurrent Engineering 11(3):177-186.", doi: "10.1177/106329303038031" },
  fordSterman2003liars: { text: "Ford DN, Sterman JD (2003). The liar's club: concealing rework in concurrent development. Concurrent Engineering 11(3):211-219.", doi: "10.1177/106329303038028" },
  abdelhamidMadnick1983: { text: "Abdel-Hamid TK, Madnick SE (1983). The dynamics of software project scheduling. Communications of the ACM 26(5):340-346.", doi: "10.1145/69586.358135" },
  abdelhamidMadnick1989: { text: "Abdel-Hamid TK, Madnick S (1989). Software productivity: potential, actual, and perceived. System Dynamics Review 5(2):93-113.", doi: "10.1002/sdr.4260050202" },
  abdelhamid1989: { text: "Abdel-Hamid TK (1989). The dynamics of software project staffing: a system dynamics based simulation approach. IEEE Transactions on Software Engineering 15(2):109-119.", doi: "10.1109/32.21738" },
  brooks1975: { text: "Brooks FP (1975). The Mythical Man-Month: Essays on Software Engineering. Addison-Wesley." },
  repenning2001: { text: "Repenning NP (2001). Understanding fire fighting in new product development. Journal of Product Innovation Management 18(5):285-300.", doi: "10.1111/1540-5885.1850285" },
  blackRepenning2001: { text: "Black LJ, Repenning NP (2001). Why firefighting is never enough: preserving high-quality product development. System Dynamics Review 17(1):33-62.", doi: "10.1002/sdr.205" },
  taylorFord2006: { text: "Taylor T, Ford DN (2006). Tipping point failure and robustness in single development projects. System Dynamics Review 22(1):51-71.", doi: "10.1002/sdr.330" },
  repenningSterman2002: { text: "Repenning NP, Sterman JD (2002). Capability traps and self-confirming attribution errors in the dynamics of process improvement. Administrative Science Quarterly 47(2):265-295.", doi: "10.2307/3094806" },
  rahmandadRepenning2016: { text: "Rahmandad H, Repenning N (2016). Capability erosion dynamics. Strategic Management Journal 37(4):649-672.", doi: "10.1002/smj.2354" },
  homer1985: { text: "Homer JB (1985). Worker burnout: a dynamic model with implications for prevention and control. System Dynamics Review 1(1):42-62.", doi: "10.1002/sdr.4260010105" },
  olivaSterman2001: { text: "Oliva R, Sterman JD (2001). Cutting corners and working overtime: quality erosion in the service industry. Management Science 47(7):894-914.", doi: "10.1287/mnsc.47.7.894.9807" },
  winch2001: { text: "Winch GW (2001). Management of the 'skills inventory' in times of major change. System Dynamics Review 17(2):151-159.", doi: "10.1002/sdr.208" },
  hafeez2003: { text: "Hafeez K, Abdelmeguid H (2003). Dynamics of human resource and knowledge management. Journal of the Operational Research Society 54(2):153-164.", doi: "10.1057/palgrave.jors.2601513" },
};

const CASES: AppCase[] = [
  {
    id: "rework-cycle",
    title: "The rework cycle: why projects run long",
    theme: "Rework and quality",
    level: "Starter",
    summary: "Some work is done wrong, looks finished, and comes back later to be redone, so a project takes far longer than work divided by capacity.",
    question: "How much does first-time quality, and how quickly errors are found, change when a project really finishes?",
    sim: "proj_rework",
    presets: [
      { label: "Done right first time", params: { capacity: 90, quality: 1, discoverTime: 5 } },
      { label: "80% right, found in 5 weeks", params: { capacity: 90, quality: 0.8, discoverTime: 5 } },
      { label: "80% right, found in 12 weeks", params: { capacity: 90, quality: 0.8, discoverTime: 12 } },
      { label: "60% right, found in 5 weeks", params: { capacity: 90, quality: 0.6, discoverTime: 5 } },
    ],
    map: [
      ["Stock: Work to do", "Tasks not yet attempted, plus rework that has been found"],
      ["Stock: Undiscovered rework", "Tasks believed complete that contain errors nobody has found yet"],
      ["Stock: Work really done", "Tasks done correctly"],
      ["Share done right first time", "Quality of the work as it is done"],
      ["Time to discover rework", "How long errors stay hidden: testing, reviews, integration"],
      ["Loop R (rework)", "Work done wrong returns to the work to do, which is worked again, partly wrong again"],
    ],
    molecules: ["reworkCycle", "doingWork", "quality"],
    evidence: [
      "Cooper (1980) built a simulation model to resolve a $500 million shipbuilder claim against the US Navy. It diagnosed the causes of cost and schedule overruns on two multibillion-dollar shipbuilding programmes; in June 1978 the Navy agreed out of court to pay $447 million, and the model was the basis for at least $200-300 million of the settlement.",
      "Lyneis and Ford (2007) review the field and describe project management as one of the most successful applications of system dynamics, measured by new theory, model structures, applications, practitioners and value to clients. The rework cycle is the structure at its centre.",
    ],
    validation:
      "Cooper (1980) reports that the model was used to diagnose overruns on two real shipbuilding programmes and that each phase of several programmes can be accurately simulated; the abstract gives no fit statistics. Lyneis and Ford (2007) is a review, not a model test. The small model here is checked against simple arithmetic: with no rework, 1,000 tasks at 90 a week take about 11 weeks.",
    insight:
      "Errors that hide make a project look further along than it is, and every hidden error is a task that must be done again. Quality and the speed of finding errors both set the finish date, so cutting quality to go faster usually makes a project later.",
    tryThis: [
      "Run Done right first time, then 80% right. How many weeks does 20% rework add?",
      "Keep 80% right and move the time to discover rework from 5 to 12 weeks. Why does finding errors later cost so much time, even though the team works no slower?",
      "Find a share done right that finishes in under 20 weeks with discovery at 5 weeks.",
    ],
    data: [
      ["Planned scope and work completed", "Project plans, earned-value reports, task trackers"],
      ["Rework fraction", "Defect logs, change records, inspection and test reports"],
      ["Time to discover errors", "Dates defects were introduced and found, from defect tracking"],
      ["Staff and productivity", "Timesheets and staffing plans"],
    ],
    practice: [
      "Measure the rework fraction directly from defect or change records; teams usually underestimate it.",
      "In real projects quality falls under schedule pressure, fatigue and inexperience. This small model holds quality fixed; connect it to the Quality molecule to close those loops.",
      "Calibrate to the shape of progress over time, not just the end date: the long tail is the signature of rework.",
    ],
    checks: [
      { claim: "With no rework, 1,000 tasks at 90 a week are done in under 12 weeks (1,000 ÷ 90 ≈ 11)", test: (run) => finished(run, { capacity: 90, quality: 1, discoverTime: 5 }) <= 12 },
      { claim: "At 80% right first time, the same project takes more than twice as long", test: (run) => finished(run, { capacity: 90, quality: 0.8, discoverTime: 5 }) > 2 * finished(run, { capacity: 90, quality: 1, discoverTime: 5 }) },
      { claim: "Finding errors in 12 weeks instead of 5 makes the project more than half as long again, at the same capacity and quality", test: (run) => finished(run, { capacity: 90, quality: 0.8, discoverTime: 12 }) > 1.5 * finished(run, { capacity: 90, quality: 0.8, discoverTime: 5 }) },
      { claim: "No work is lost: work really done eventually reaches all 1,000 tasks", test: (run) => run({ capacity: 90, quality: 0.8, discoverTime: 5 }, 120).end.workDone > 999 },
    ],
    refs: ["cooper1980", "lyneisFord2007"],
    tags: ["rework", "quality", "overrun", "project management", "shipbuilding", "defects", "earned value", "claims"],
  },
  {
    id: "ninety-percent",
    title: "The 90% syndrome and the liar's club",
    theme: "Schedules and estimates",
    level: "Intermediate",
    summary: "Reported progress races to 90% and then stalls, because work with known problems is reported as done until the problems come out.",
    question: "Why do projects look on schedule until late, and what does hiding problems cost?",
    sim: "proj_conceal",
    presets: [
      { label: "Problems reported in 2 weeks", params: { capacity: 90, quality: 0.75, discoverTime: 2 } },
      { label: "Reported in 5 weeks", params: { capacity: 90, quality: 0.75, discoverTime: 5 } },
      { label: "Concealed for 10 weeks", params: { capacity: 90, quality: 0.75, discoverTime: 10 } },
      { label: "Concealed for 16 weeks", params: { capacity: 90, quality: 0.75, discoverTime: 16 } },
    ],
    map: [
      ["Reported progress", "Work really done + flawed work reported as done (not a stock; add the two)"],
      ["Real progress", "Work really done"],
      ["Stock: Flawed work reported as done", "Rework that engineers know about, or will find, but has not been reported"],
      ["Time before problems are reported", "Concealment: how long known problems stay off the status report"],
    ],
    molecules: ["reworkCycle", "estCompletion", "estProductivity"],
    evidence: [
      "Ford and Sterman (2003, Concurrent Engineering 11:177-186) model the causes of the 90% syndrome, a common form of schedule failure. Increasing concurrence and common managerial responses to schedule pressure make the syndrome worse and degrade schedule performance and project quality.",
      "Ford and Sterman (2003, Concurrent Engineering 11:211-219) show that a liar's club, in which known rework is concealed from managers and colleagues, can aggravate the 90% syndrome and disproportionately degrade schedule performance and quality.",
      "Abdel-Hamid and Madnick (1989) separate potential, actual and perceived productivity. Early in a software project, managers' perception of productivity differs from what it actually is, which weakens managerial control.",
    ],
    validation:
      "The two Ford and Sterman abstracts describe simulation experiments with a dynamic project model and report no calibration statistics. Abdel-Hamid and Madnick (1989) is a conceptual analysis built on their software project model; the abstract reports no fit statistics.",
    insight:
      "Reported progress is real progress plus hidden problems, so early reports look the same whether problems are hidden or not. The longer problems stay hidden, the longer the project sits at 'nearly done' and the later it really finishes.",
    tryThis: [
      "Run Problems reported in 2 weeks and Concealed for 16 weeks. Add work really done and flawed work reported as done at week 12. Do the two status reports differ?",
      "Compare when work really done reaches 990 in each preset.",
      "Raise the share done right to 0.95 with 16 weeks of concealment. Does better quality make concealment matter less?",
    ],
    data: [
      ["Reported percent complete", "Status reports and earned-value data"],
      ["Actual completion", "Accepted, tested deliverables"],
      ["Time from discovering a problem to reporting it", "Issue trackers: compare creation dates with escalation dates"],
    ],
    practice: [
      "Measure progress by tested, accepted work, not by work attempted.",
      "The incentive to conceal comes from schedule pressure. This small model holds concealment fixed; a fuller model makes reporting delay depend on pressure, which closes a reinforcing loop.",
      "Here one delay stands for both finding and reporting problems. Real projects separate them, because finding is a technical delay and reporting is a behavioural one.",
    ],
    checks: [
      { claim: "Reported progress passes 90% by week 13 whether problems are reported in 2 weeks or concealed for 16", test: (run) => [2, 16].every((d) => reported(run({ capacity: 90, quality: 0.75, discoverTime: d }, 13).end) >= 0.9) },
      { claim: "At week 13, real progress is lower when problems are concealed for 16 weeks than when reported in 2", test: (run) => run({ capacity: 90, quality: 0.75, discoverTime: 16 }, 13).end.workDone < run({ capacity: 90, quality: 0.75, discoverTime: 2 }, 13).end.workDone },
      { claim: "Concealing problems for 16 weeks instead of 2 makes the project more than three times as long", test: (run) => finished(run, { capacity: 90, quality: 0.75, discoverTime: 16 }) > 3 * finished(run, { capacity: 90, quality: 0.75, discoverTime: 2 }) },
    ],
    refs: ["fordSterman2003syndrome", "fordSterman2003liars", "abdelhamidMadnick1989"],
    tags: ["90% syndrome", "liar's club", "progress reporting", "concealment", "status report", "percent complete", "concurrent engineering"],
  },
  {
    id: "scope-changes",
    title: "Change orders and a finish date that recedes",
    theme: "Schedules and estimates",
    level: "Starter",
    summary: "Dividing work remaining by the work rate gives a finish date, but changes added along the way push it back week after week.",
    question: "How much later does a project finish when the client keeps adding changes, and why does the estimate keep slipping?",
    sim: "proj_scope",
    presets: [
      { label: "Fixed scope", params: { workRate: 30, scopeCreep: 0 } },
      { label: "10 tasks a week of changes", params: { workRate: 30, scopeCreep: 10 } },
      { label: "20 tasks a week of changes", params: { workRate: 30, scopeCreep: 20 } },
      { label: "Changes as fast as the work", params: { workRate: 30, scopeCreep: 30 } },
    ],
    map: [
      ["Stock: Work remaining", "Tasks still to do, including added changes"],
      ["Flow: changes added", "Change orders, new requirements, design changes"],
      ["Estimated time to finish", "Work remaining ÷ work rate (not drawn; compute it from the stock)"],
    ],
    molecules: ["estCompletion", "estRemaining", "doingWork"],
    evidence: [
      "Cooper (1980): Ingalls Shipbuilding used its model to quantify the costs of disruption from Navy-responsible delays and design changes on two multibillion-dollar programmes; the Navy settled for $447 million of a $500 million claim.",
      "Lyneis and Ford (2007) review how project models represent the structures behind adverse dynamics, including changes in scope, and synthesise the policy lessons.",
    ],
    validation:
      "Cooper's model was accepted as the basis for at least $200-300 million of a legal settlement, a demanding real-world test; the abstract gives no fit statistics. The small model here is checked against exact arithmetic: net progress equals work rate minus changes added.",
    insight:
      "The naive estimate (work remaining ÷ work rate) ignores the inflow of changes, so it is always too early. Net progress is the work rate minus the change rate, and when the two are close the finish date recedes as fast as the team advances.",
    tryThis: [
      "With fixed scope, the estimate is 500 ÷ 30 ≈ 17 weeks. Run 20 tasks a week of changes. How much work is left at week 17?",
      "Work out the real finish for 10 tasks a week of changes (500 ÷ (30 − 10)) and check it on the chart.",
      "Set changes to 28 a week. How long would the project take?",
    ],
    data: [
      ["Baseline scope", "Contract, work breakdown structure"],
      ["Change orders over time", "Change control logs with dates and size estimates"],
      ["Work rate", "Earned-value or task completion data"],
    ],
    practice: [
      "Changes in a real project also cause rework in work already done and disrupt the team. Cooper's claim rested on these knock-on effects, which this small model leaves out.",
      "Estimate completion from the net rate (work rate minus change rate), and track the change rate as closely as the work rate.",
    ],
    checks: [
      { claim: "With fixed scope, 500 tasks at 30 a week are finished within 18 weeks (500 ÷ 30 ≈ 16.7)", test: (run) => run({ workRate: 30, scopeCreep: 0 }, 18).end.workRemaining < 1 },
      { claim: "With 20 tasks a week of changes, two-thirds of the work is still left at week 16.7, when the naive estimate said it would be done", test: (run) => Math.abs(run({ workRate: 30, scopeCreep: 20 }, 16.7).end.workRemaining - 333) < 3 },
      { claim: "Net progress is work rate minus changes: with 10 a week of changes, 100 tasks remain at week 20 (500 − 20 × 20)", test: (run) => Math.abs(run({ workRate: 30, scopeCreep: 10 }, 20).end.workRemaining - 100) < 1 },
      { claim: "When changes arrive as fast as the work rate, work remaining never falls", test: (run) => Math.abs(run({ workRate: 30, scopeCreep: 30 }).end.workRemaining - 500) < 0.5 },
    ],
    refs: ["cooper1980", "lyneisFord2007"],
    tags: ["scope creep", "change orders", "estimate", "completion date", "requirements churn", "forecast", "delay claims"],
  },
  {
    id: "deadline-pressure",
    title: "Deadlines and schedule pressure",
    theme: "Schedules and estimates",
    level: "Intermediate",
    summary: "Teams speed up when the deadline is tight and slow down when it is loose, so a deadline shapes how fast the work goes.",
    question: "What happens when the deadline is set tighter, or looser, than the work needs?",
    sim: "proj_deadline",
    presets: [
      { label: "Realistic deadline (15 weeks)", params: { scheduled: 15, baseRate: 25 } },
      { label: "Tight deadline (5 weeks)", params: { scheduled: 5, baseRate: 25 } },
      { label: "Generous deadline (30 weeks)", params: { scheduled: 30, baseRate: 25 } },
    ],
    map: [
      ["Stock: Work remaining", "Tasks left before the deadline"],
      ["Schedule pressure", "Required rate (work remaining ÷ time left) ÷ normal rate"],
      ["Work rate", "Normal rate × pressure, between 0.5 and 2 times normal"],
      ["Loop B (pacing)", "More work left → more pressure → faster work → less work left"],
    ],
    molecules: ["schedulePressure", "overtime", "estRemaining"],
    evidence: [
      "Abdel-Hamid and Madnick (1983) use a system dynamics approach to analyse dynamic issues in software project scheduling that quantitative estimation methods leave unresolved.",
      "Ford and Sterman (2003, 90% syndrome) find that common managerial responses to schedule pressure aggravate the 90% syndrome and degrade schedule performance and project quality.",
      "Oliva and Sterman (2001) find that temporary imbalances between capacity and demand interact with decision rules for effort, overtime and quality aspirations to yield permanent erosion of service standards.",
    ],
    validation:
      "Oliva and Sterman (2001) calibrated their model for a consumer-lending service centre in a major UK bank using econometric estimation, interviews, observations and archival data. The Abdel-Hamid and Madnick (1983) and Ford and Sterman (2003) abstracts report no calibration statistics.",
    insight:
      "Pressure paces a team to the deadline it is given. Below twice the normal pace the deadline is met; beyond it the date slips. A loose deadline slows the team just as surely, so the deadline itself is a policy lever, not only a forecast.",
    tryThis: [
      "Run the realistic deadline. Does the team finish close to week 15?",
      "Set the deadline to 5 weeks. How many tasks are left at week 5, and when does the work actually finish?",
      "Set the deadline to 30 weeks. At normal pace the work would take 16 weeks. When does it finish now?",
    ],
    data: [
      ["Planned and revised deadlines", "Project schedules and baseline history"],
      ["Work rate over time", "Task completion or earned-value data"],
      ["Overtime and effort", "Timesheets"],
    ],
    practice: [
      "This small model lets pressure raise output for free. In reality the extra pace comes from overtime and cutting corners, which bring fatigue and rework; add the Crunch and Rework cycle cases before trusting a tight deadline.",
      "The effect of pressure on the work rate (here a straight line capped between 0.5 and 2 times normal) is an assumption. Estimate it from your own records of pace near deadlines.",
    ],
    checks: [
      { claim: "A deadline that needs no more than twice the normal pace is met within a week", test: (run) => run({ scheduled: 12, baseRate: 25 }, 13).end.workRemaining < 1 },
      { claim: "A deadline that needs more than twice the normal pace slips: with 5 weeks set, about 150 tasks are left at the deadline (400 − 5 × 50)", test: (run) => { const w = run({ scheduled: 5, baseRate: 25 }, 5).end.workRemaining; return w > 140 && w < 160; } },
      { claim: "A generous deadline slows the team: with 30 weeks set, more than 150 tasks are left at week 16, when normal pace would have finished", test: (run) => run({ scheduled: 30, baseRate: 25 }, 16).end.workRemaining > 150 },
    ],
    refs: ["abdelhamidMadnick1983", "fordSterman2003syndrome", "olivaSterman2001"],
    tags: ["deadline", "schedule pressure", "Parkinson's law", "pace", "software scheduling", "estimate"],
  },
  {
    id: "crunch",
    title: "Crunch: overtime that backfires",
    theme: "People, effort and fatigue",
    level: "Starter",
    summary: "Longer hours lift output at once, but fatigue builds over the following weeks and pulls output back down, sometimes below normal.",
    question: "Does sustained overtime get more work done, and for how long?",
    sim: "proj_crunch",
    presets: [
      { label: "Normal hours", params: { overtime: 1, timeToFatigue: 4 } },
      { label: "20% overtime", params: { overtime: 1.2, timeToFatigue: 4 } },
      { label: "40% overtime", params: { overtime: 1.4, timeToFatigue: 4 } },
      { label: "60% overtime", params: { overtime: 1.6, timeToFatigue: 4 } },
    ],
    map: [
      ["Hours worked (× normal)", "Overtime: 1.4 means 40% more hours"],
      ["Stock: Fatigue", "A smooth of recent hours: it moves towards the hours worked over the time to get fatigued"],
      ["Team output (× normal)", "Hours × effect of fatigue on productivity"],
      ["Loop B (fatigue)", "More hours → more fatigue → lower productivity, with a delay"],
    ],
    molecules: ["prodFatigue", "effectFatigue", "overtime"],
    evidence: [
      "Oliva and Sterman (2001), a calibrated model of a UK bank's lending service centre: temporary imbalances between capacity and demand interact with decision rules for effort, capacity, overtime and quality aspirations to yield permanent erosion of service standards and loss of revenue. The American Customer Satisfaction Index for services fell to 69.4% in 2000, 5 points below 1994.",
      "Homer (1985) shows with a small model that working beyond a sustainable level leads to exhaustion and lower productivity, and that limiting the workweek can raise overall productivity.",
    ],
    validation:
      "Oliva and Sterman (2001) calibrated their model with econometric estimation, interviews, observations and archival data from the bank. Homer (1985) reproduced the author's own two-year experience qualitatively; the abstract reports no statistical fit.",
    insight:
      "Overtime is a quick fix with a delayed side effect. Output jumps the day hours go up, so crunch feels productive; fatigue arrives weeks later, and with enough overtime the team ends up producing less than at normal hours.",
    tryThis: [
      "Run 40% overtime. When does output peak, and where does it settle?",
      "Find the most overtime that still leaves output at or above normal after 20 weeks.",
      "Make the time to get fatigued 8 weeks. Does a slower slide change where output ends up, or only when it gets there?",
    ],
    data: [
      ["Hours worked and overtime", "Timesheets, payroll; BLS Current Employment Statistics for industry averages"],
      ["Output per person over time", "Task completion, tickets closed, units produced"],
      ["Fatigue or burnout signals", "Sick leave, errors, staff surveys"],
    ],
    practice: [
      "This small model uses a straight-line effect of fatigue (output effect = 2 − fatigue, kept between 0.3 and 1.1). Estimate the real effect from your own data on output per hour after long periods of overtime.",
      "Fatigue also lowers quality, which feeds the rework cycle. Connecting the two shows why crunch near a deadline often makes the project later.",
    ],
    checks: [
      { claim: "40% overtime lifts output at once to about 1.4 times normal", test: (run) => run({ overtime: 1.4, timeToFatigue: 4 }).max.relOutput > 1.35 },
      { claim: "Held for 20 weeks, 40% overtime leaves output below normal, at about 0.84 (1.4 × (2 − 1.4))", test: (run) => { const e = run({ overtime: 1.4, timeToFatigue: 4 }).end.relOutput; return e > 0.8 && e < 0.88; } },
      { claim: "The more overtime, the lower output ends up", test: (run) => { const [a, b, c] = [1, 1.2, 1.6].map((o) => run({ overtime: o, timeToFatigue: 4 }).end.relOutput); return c < b && b < a; } },
    ],
    refs: ["olivaSterman2001", "homer1985"],
    tags: ["overtime", "crunch", "fatigue", "productivity", "hours", "service quality", "work pressure"],
  },
  {
    id: "burnout",
    title: "Burnout and the best work limit",
    theme: "People, effort and fatigue",
    level: "Intermediate",
    summary: "Each extra hour adds work but lowers output per hour, so there is a work limit that gives the most output over the long run.",
    question: "What work limit gives the most output per person over months, and what happens beyond it?",
    sim: "proj_burnout",
    presets: [
      { label: "Normal hours", params: { overtime: 1, timeToFatigue: 3, slope: 0.6 } },
      { label: "About the best limit (1.35×)", params: { overtime: 1.35, timeToFatigue: 3, slope: 0.6 } },
      { label: "Long hours (1.8×)", params: { overtime: 1.8, timeToFatigue: 3, slope: 0.6 } },
      { label: "Short weeks (0.7×)", params: { overtime: 0.7, timeToFatigue: 3, slope: 0.6 } },
    ],
    map: [
      ["Hours worked (× normal)", "The work limit a person or team actually keeps to"],
      ["Stock: Fatigue", "Builds towards the hours worked over the time to get fatigued"],
      ["Productivity per hour", "1 − strength × (fatigue − 1)"],
      ["Long-run output", "Hours × productivity per hour (multiply the two after fatigue has settled)"],
    ],
    molecules: ["effectFatigue", "prodFatigue", "smooth"],
    evidence: [
      "Homer (1985) reproduces repeated cycles of burnout, in which a hard-working person becomes exhausted, frustrated and unproductive, with a small system dynamics model of workaholism. Techniques that reduce work stress or enhance relaxation stabilise the cycle and raise overall productivity.",
      "Homer (1985) also shows an optimal work limit at which overall productivity peaks, inside a region of stability where burnout is avoided.",
    ],
    validation:
      "Homer (1985) reports that the model qualitatively reproduces the author's own two-year experience with repeated burnout cycles, and tests policies by simulation; the abstract reports no statistical calibration. The small model here is checked against its own analytical optimum.",
    insight:
      "With a straight-line fatigue effect, long-run output is hours × (1 − s × (hours − 1)), a curve with a peak. Below the peak extra hours pay; above it they cost more productivity than they add, and the loss arrives months after the hours.",
    tryThis: [
      "Run each preset and multiply hours by productivity per hour at month 18. Which gives the most output?",
      "Set the strength of the effect to 0.3. Where is the best work limit now? (Hint: it is (1 + s) ÷ 2s.)",
      "Make the time to get fatigued 10 months with long hours. Why might a manager looking at the first two months conclude that long hours work?",
    ],
    data: [
      ["Hours worked", "Timesheets; ILOSTAT and Eurostat for national working-time statistics"],
      ["Output per hour over time", "Productivity records"],
      ["Exhaustion and burnout", "Validated burnout surveys; sick leave records"],
    ],
    practice: [
      "Homer's model produces repeated cycles because the person's hours respond to their own energy and stress. This small model fixes the hours, so it shows the best work limit but not the burnout cycle. Add a loop from fatigue back to hours to reproduce it.",
      "The strength of the fatigue effect sets the best limit. It differs between kinds of work, so estimate it before recommending a limit.",
    ],
    checks: [
      { claim: "Long-run output peaks near 1.33 times normal hours, at about 1.07 times normal output (1.6 ÷ 1.2 and 1.6² ÷ 2.4 for strength 0.6)", test: (run) => Math.abs(longRunOutput(run, 1.35) - 1.6 ** 2 / 2.4) < 0.01 },
      { claim: "Working 1.35 times normal hours gives more long-run output than both normal hours and 1.8 times normal", test: (run) => longRunOutput(run, 1.35) > longRunOutput(run, 1) && longRunOutput(run, 1.35) > longRunOutput(run, 1.8) },
      { claim: "Double hours end with less output than normal hours: 2 × (1 − 0.6 × 1) = 0.8", test: (run) => Math.abs(longRunOutput(run, 2) - 0.8) < 0.01 },
      { claim: "Fatigue builds gradually: after one time constant productivity per hour has covered only about 63% of its fall (0.81, not 0.70)", test: (run) => Math.abs(run({ overtime: 1.5, timeToFatigue: 3, slope: 0.6 }, 3).end.effect - 0.81) < 0.01 },
    ],
    refs: ["homer1985"],
    tags: ["burnout", "workaholism", "work limit", "fatigue", "working hours", "wellbeing", "productivity"],
  },
  {
    id: "firefighting",
    title: "Firefighting in product development",
    theme: "Rework and quality",
    level: "Advanced",
    summary: "When late problems pull people off early design work, the next project starts with more errors, and an organisation can tip into permanent firefighting.",
    question: "Why does firefighting persist from project to project, and what breaks the cycle?",
    map: [
      ["Stocks", "Work and undiscovered errors in each project phase, for two or more overlapping projects"],
      ["Resource allocation", "Engineers split between early-phase work on the next project and fixing the current one"],
      ["Loop R (firefighting)", "Late problems → engineers pulled from early work → more errors in the next project → more late problems"],
      ["Tipping point", "The workload above which the reinforcing loop takes over"],
    ],
    molecules: ["reworkCycle", "doingWork", "schedulePressure", "workforce"],
    evidence: [
      "Repenning (2001) develops a formal model of fire fighting, the unplanned allocation of resources to fix problems discovered late in development. Fire fighting can be self-reinforcing, and multiproject development systems are far more susceptible than is appreciated.",
      "Black and Repenning (2001), with data from a field site: under-allocating resources to the early phases of a project can create a vicious cycle of rising error rates, overworked engineers and declining performance in all future projects. Policies the organisation was considering offered relatively low leverage.",
      "Taylor and Ford (2006) show that the same tipping-point structure works within a single project: rework can overwhelm progress, trap a project in a deteriorating mode and cause it to fail.",
      "Repenning and Sterman (2002) and Rahmandad and Repenning (2016) find related traps: managers who attribute poor performance to workers, or who search locally for the best workload, can overload the organisation so that improvement stalls and capabilities erode.",
    ],
    validation:
      "Black and Repenning (2001) built their model from data collected at a product development site. Rahmandad and Repenning (2016) built a simulation-based theory from two software organisations. Repenning and Sterman (2002) rest on an inductive field study of one firm. Taylor and Ford (2006) quantified robustness with sensitivity analysis. Repenning (2001) reports no calibration in the abstract.",
    insight:
      "Firefighting is a reinforcing loop with a tipping point. Below it, extra work is absorbed; above it, each project's late problems steal effort from the next project's early work, so the organisation gets steadily worse while everyone works harder.",
    tryThis: [
      "Open Rework Cycle and sketch two copies, one for the current project and one for the next, sharing one pool of engineers.",
      "Mark the link from late problems to early-phase effort, and name the loop it closes.",
      "Which policy would you test first: more people, fewer projects, or protecting early-phase work? Why might adding people help least?",
    ],
    data: [
      ["Engineering hours by project and phase", "Timesheets and resource plans"],
      ["Problems found by phase", "Defect and change tracking"],
      ["Projects in progress and launch dates", "Portfolio plans"],
    ],
    practice: [
      "Model at least two overlapping projects; a single project hides the loop that carries firefighting from one project to the next.",
      "Find the tipping point by raising the workload in small steps and watching for a sudden change in behaviour.",
      "Test policies that limit the number of projects started, not only ones that add capacity; Black and Repenning found common policies had low leverage.",
    ],
    refs: ["repenning2001", "blackRepenning2001", "taylorFord2006", "repenningSterman2002", "rahmandadRepenning2016"],
    tags: ["firefighting", "product development", "multiproject", "tipping point", "capability trap", "resource allocation", "early phase"],
  },
  {
    id: "experience-dilution",
    title: "Hiring and the experience of a workforce",
    theme: "Staffing and skills",
    level: "Intermediate",
    summary: "Experience rides along with people as they join, stay and leave, so a hiring surge dilutes the average and hiring experienced people lifts it.",
    question: "How do the hiring rate, staff tenure and the experience of new hires set the average experience of a workforce?",
    sim: "proj_experience",
    presets: [
      { label: "Steady team", params: { hire: 8, tenure: 6, hireExp: 0 } },
      { label: "Hiring surge", params: { hire: 18, tenure: 6, hireExp: 0 } },
      { label: "Hire experienced people", params: { hire: 8, tenure: 6, hireExp: 5 } },
      { label: "High turnover", params: { hire: 8, tenure: 3, hireExp: 0 } },
    ],
    map: [
      ["Stock: Staff", "Headcount"],
      ["Stock: Total years of experience", "The coflow: experience carried by the staff"],
      ["Average experience", "Total experience ÷ staff"],
      ["Experience of new hires", "0 for graduates; higher when skills are bought in"],
    ],
    molecules: ["coflow", "workforce", "agingPDY"],
    evidence: [
      "Winch (2001): in case studies of companies facing major change, firms that relied only on existing managers and internal promotion fared worse than those able to recruit new managers to key posts. A simple skills-inventory model shows that retaining staff matters most in stable times, but when change makes existing skills obsolete, importing skills with new recruits may be the only way to raise the skill base.",
      "Hafeez and Abdelmeguid (2003) use system dynamics to relate recruitment, training, skills and knowledge, and develop human resource strategies by time-based dynamic analysis.",
    ],
    validation:
      "Winch (2001) draws on case studies of companies that had faced major change and uses a simple model to explain the pattern; the abstract reports no calibration. Hafeez and Abdelmeguid (2003) present causal loop and simulation analysis without reported calibration. The small model here is checked against an exact steady state: average experience = average time in the firm + experience of new hires.",
    insight:
      "Average experience settles at the average time people stay plus the experience they arrive with. Hiring faster dilutes it only for a while; tenure and the experience of new hires set where it ends up.",
    tryThis: [
      "Run the hiring surge. How low does average experience fall, and how long does it take to recover?",
      "Run Hire experienced people. Check that the average settles at 6 + 5 = 11 years.",
      "Halve the average time in the firm. Can hiring experienced people make up for high turnover?",
    ],
    data: [
      ["Headcount, hires and leavers", "HR records; BLS JOLTS for industry hire and quit rates"],
      ["Tenure", "HR records; Eurostat Labour Force Survey for national job tenure"],
      ["Experience of new hires", "Recruitment records, CVs"],
    ],
    practice: [
      "Experience here grows by one year per year for everyone. In fast-changing work, skills also become obsolete; Winch's model adds an obsolescence outflow, which is what makes buying in skills worthwhile.",
      "Leavers take the average experience with them in this model. In practice experienced people often leave at different rates from new ones; split the stock into an aging chain if that matters.",
    ],
    checks: [
      { claim: "A steady team keeps an average of 6 years: average time in the firm (6) plus new-hire experience (0)", test: (run) => Math.abs(run({ hire: 8, tenure: 6, hireExp: 0 }).end.avgExp - 6) < 0.05 },
      { claim: "A hiring surge pulls average experience below 5 years before it recovers towards 6", test: (run) => { const r = run({ hire: 18, tenure: 6, hireExp: 0 }); return r.min.avgExp < 5 && r.end.avgExp > 5.8; } },
      { claim: "Hiring people with 5 years of experience lifts the average to 11 years (6 + 5)", test: (run) => Math.abs(run({ hire: 8, tenure: 6, hireExp: 5 }).end.avgExp - 11) < 0.1 },
      { claim: "High turnover (3 years) lowers the average to about 3 years", test: (run) => Math.abs(run({ hire: 8, tenure: 3, hireExp: 0 }).end.avgExp - 3) < 0.1 },
    ],
    refs: ["winch2001", "hafeez2003"],
    tags: ["hiring", "experience", "skills", "turnover", "tenure", "dilution", "recruitment", "knowledge"],
  },
  {
    id: "adding-people",
    title: "Adding people to a team, and Brooks's law",
    theme: "Staffing and skills",
    level: "Intermediate",
    summary: "New hires produce less while they get up to speed, so a hiring surge raises headcount faster than output.",
    question: "If a project is late, how much does hiring help, and how soon?",
    sim: "proj_team",
    presets: [
      { label: "Steady hiring (1 a month)", params: { hiring: 1, tMature: 3 } },
      { label: "Hiring surge (6 a month)", params: { hiring: 6, tMature: 3 } },
      { label: "Big surge (10 a month)", params: { hiring: 10, tMature: 3 } },
      { label: "Surge with fast onboarding", params: { hiring: 6, tMature: 1.5 } },
    ],
    map: [
      ["Stock: New hires", "People still getting up to speed; each produces half a full person's output"],
      ["Stock: Experienced staff", "Fully productive"],
      ["Stock: Leads", "Senior staff who spend part of their time coaching and coordinating (0.8 of a full person)"],
      ["Team output", "0.5 × new hires + experienced + 0.8 × leads (compute it from the stocks)"],
      ["Time to get up to speed", "Assimilation time for a new hire"],
    ],
    molecules: ["agingPDY", "workforce", "doingWork", "coflow"],
    evidence: [
      "Brooks (1975) states that adding manpower to a late software project makes it later, because new people must be trained and every added person adds communication.",
      "Abdel-Hamid (1989) uses a comprehensive system dynamics model of software development to simulate the staffing practices of an actual software project, and tests how far people and months are interchangeable on that project.",
      "Hafeez and Abdelmeguid (2003) model how recruitment and training feed the skills and knowledge of a workforce.",
    ],
    validation:
      "Abdel-Hamid (1989) applied the model in a case study of an actual software project; the abstract reports no fit statistics. Brooks (1975) is based on the author's experience managing large software projects, not on a simulation. Hafeez and Abdelmeguid (2003) report no calibration.",
    insight:
      "Hiring adds heads at once but output only as people get up to speed, so output per head dips after every surge. Brooks's stronger claim, that hiring can make a late project later, needs two more costs this small model leaves out: experienced people's time spent training, and communication that grows with team size.",
    tryThis: [
      "Run the hiring surge. Compute output per head at months 0, 3 and 24.",
      "Compare a surge with fast onboarding. How much of the dip does faster onboarding remove?",
      "Sketch the missing link: new hires → training time taken from experienced staff → less output. With that link, could a surge lower total output for a while?",
    ],
    data: [
      ["Hires by month", "HR and recruitment records"],
      ["Time to full productivity", "Onboarding records, manager estimates, first-task completion times"],
      ["Output by person or team", "Task trackers, version control, earned value"],
    ],
    practice: [
      "The productivity weights (0.5, 1.0, 0.8) are fixed in this molecule. Replace them with your own estimates.",
      "To test Brooks's law, take training time out of experienced staff output and add a communication overhead that grows with team size. Abdel-Hamid's model includes such effects.",
      "Ask when the extra output arrives relative to the deadline. Hiring helps a long project more than a late one.",
    ],
    checks: [
      { claim: "A hiring surge of 6 a month lowers output per head after 3 months, below the steady team's 0.91", test: (run) => perHead(run({ hiring: 6, tMature: 3 }, 3).end) < 0.86 && perHead(run({ hiring: 1, tMature: 3 }, 3).end) > 0.9 },
      { claim: "Output per head recovers as new hires get up to speed", test: (run) => perHead(run({ hiring: 6, tMature: 3 }, 24).end) > perHead(run({ hiring: 6, tMature: 3 }, 3).end) },
      { claim: "Faster onboarding softens the dip", test: (run) => perHead(run({ hiring: 6, tMature: 1.5 }, 3).end) > perHead(run({ hiring: 6, tMature: 3 }, 3).end) },
      { claim: "In this small model total output still rises with hiring, because nothing charges experienced staff for training or coordination", test: (run) => teamOutput(run({ hiring: 6, tMature: 3 }, 3).end) > teamOutput(run({ hiring: 1, tMature: 3 }, 3).end) },
    ],
    refs: ["brooks1975", "abdelhamid1989", "hafeez2003"],
    tags: ["Brooks's law", "staffing", "hiring", "onboarding", "late project", "software", "man-month", "team size"],
  },
];

const DATA_SOURCES: DataSource[] = [
  { name: "UK Government Major Projects Portfolio data", url: "https://www.gov.uk/government/collections/major-projects-data", what: "Annual delivery confidence ratings, budgets and schedules for large UK government projects", scope: "Project performance" },
  { name: "US GAO Weapon Systems Annual Assessment (2025)", url: "https://www.gao.gov/products/gao-25-107569", what: "Cost growth and schedule delays across major US defence acquisition programmes", scope: "Project performance" },
  { name: "ISBSG software project repository", url: "https://www.isbsg.org/", what: "Effort, size, duration and defect data from completed software projects (licensed)", scope: "Project performance" },
  { name: "PMI Pulse of the Profession", url: "https://www.pmi.org/learning/thought-leadership/pulse", what: "Annual practitioner survey on project success, overruns and practices", scope: "Project performance" },
  { name: "BLS Job Openings and Labor Turnover Survey (JOLTS)", url: "https://www.bls.gov/jlt/", what: "US hires, quits, layoffs and openings by industry", scope: "Work and staffing" },
  { name: "BLS Current Employment Statistics", url: "https://www.bls.gov/ces/", what: "US employment, average weekly hours and overtime hours by industry", scope: "Work and staffing" },
  { name: "Eurostat Labour Force Survey", url: "https://ec.europa.eu/eurostat/web/lfs", what: "EU employment, hours worked and job tenure", scope: "Work and staffing" },
  { name: "ILOSTAT working time statistics", url: "https://ilostat.ilo.org/topics/working-time/", what: "Hours actually worked and long working hours by country, sex and occupation", scope: "Work and staffing" },
];

export const PROJECTS: Domain = {
  id: "projects",
  name: "Projects, work and organisations",
  short: "Projects",
  blurb: "Rework, schedule pressure, overtime and fatigue, and the staffing decisions that make projects late.",
  themes: THEMES,
  cases: CASES,
  refs: REFS,
  models: MODELS,
  stop: STOP,
  dataSources: DATA_SOURCES,
};
