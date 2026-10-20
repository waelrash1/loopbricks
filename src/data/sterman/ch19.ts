import type { StudyChapter } from "@/data/sterman/types";

// Topic notes drawing on Sterman (2000). Written in our own words; page numbers refer to the printed edition.
export const CHAPTER: StudyChapter = {
  id: "ch19",
  number: "19",
  title: "The labor supply chain and the origin of business cycles",
  part: "Part V Instability and oscillation",
  pages: "757-790",
  summary:
    "The manufacturing supply chain models (see the module Oscillation: stock management and supply chains) assumed labour was always available. Here the stock management structure is applied to people: vacancies are the supply line, hiring fills them after a delay, and the firm also needs ways to cancel vacancies and lay people off. Coupling the labour chain to the inventory model makes the firm oscillate with a period of about a year, because the hiring delay sits inside the inventory control loop and the decision rule cannot easily count capacity that is still being recruited. A flexible workweek adds a fast balancing loop that nearly removes the cycle. With parameters typical of the whole economy the same structure produces a cycle of about three years with the leads and lags of the real business cycle, which suggests the business cycle is generated inside the private economy and kept alive by random shocks.",
  bigIdeas: [
    {
      title: "Labour is a stock managed through a supply line of vacancies",
      text: "The workforce is filled by hiring and drained by attrition (and later layoffs). Hiring is the stock of vacancies divided by the time to fill them, so vacancies are the supply line of requests for workers that have been placed but not yet met. Vacancy creation follows the standard rule: replace expected attrition, close the labour gap over a labour adjustment time, and keep enough vacancies open to deliver the desired hiring rate given the expected time to fill them. Note that vacancies are information, not people: nobody flows from the vacancy stock into the workforce.",
      pages: "758-760",
    },
    {
      title: "Small changes in staffing targets put large loads on recruiting",
      text: "With a 100-week average tenure, 8 weeks to fill a post and 1,000 staff, the firm loses 10 people a week and keeps 80 vacancies open in equilibrium. A 50% step in desired labour sends vacancy creation from 10 to a peak of 125 a week, then the workforce settles smoothly, within 2% of the new target after about 32 weeks. The response is identical in form to the capital investment example of the stock management structure (see the module Oscillation: stock management and supply chains); only the time constants differ. If the recruiting function cannot handle that peak, time to fill rises and hire quality may fall.",
      pages: "760-762",
    },
    {
      title: "Test decreases as well as increases: asymmetry reveals missing structure",
      text: "When desired labour falls by half, a no-layoff firm can only shrink by attrition, and because vacancy creation cannot go negative the 80 vacancies already open keep being filled. It takes nearly two years to reach the target. Removing the MAX from vacancy creation would allow negative vacancies, which is impossible. The right fix is a separate outflow for cancellations, and the same pattern gives layoffs: each runs at the lesser of the desired rate and the stock divided by a minimum time.",
      pages: "762-764",
    },
    {
      title: "Cancellations and layoffs as protected outflows",
      text: "Desired cancellations are the size of the desired vacancy creation rate whenever it is negative; actual cancellations cannot exceed vacancies divided by a cancellation time, so vacancies approach zero smoothly but never go below it. Layoffs work the same way, scaled by a <b>willingness to lay off</b> between 0 (no-layoff policy) and 1 (as ready to fire as to hire). With a 2-week cancellation time and an 8-week layoff time, vacancies vanish in about 6 weeks rather than 30 and the workforce balances in about a year rather than two. Separate hiring and layoff adjustment times can capture firms that hire fast and fire slowly, or the reverse.",
      pages: "762-764",
    },
    {
      title: "Coupling labour to inventory makes the firm oscillate",
      text: "Production starts now equal labour × workweek × productivity, and desired labour is desired starts divided by the standard workweek and expected productivity. After a 20% rise in orders, inventory falls further than before because starts can only rise as people are hired; amplification of starts rises from 1.61 to 2.07, and the system rings with a period of about a year, taking roughly 3.5 years to settle. Vacancy creation peaks at nearly seven times its initial rate.",
      pages: "764-771",
    },
    {
      title: "The hidden supply line: capacity being recruited",
      text: "Oscillation needs a delayed negative loop and a decision rule that ignores the pipeline. The production rule in this model counts WIP perfectly, so why does it cycle? Because vacancies and the workforce represent future capacity to produce at a rate, not units of goods on order. They are not measured in widgets and cannot be added to inventory in the scheduling decision, so the corrections already set in motion through hiring are effectively invisible to production planning.",
      pages: "771-773",
    },
    {
      title: "Explain behaviour step by step, not by archetype",
      text: "Saying the model oscillates because it has a delayed negative loop is true but shallow, and confident stories about model behaviour are often wrong or caused by a formulation error. A better explanation is a week-by-week account consistent with every stock and flow (if production exceeds shipments, inventory must be rising), backed by plots of every variable and by sensitivity and extreme-condition tests. A phase plot of actual against desired starts shows the lag directly: instead of moving along the 45° line, the trajectory spirals around the equilibrium.",
      pages: "767-773",
    },
    {
      title: "A fast first-order loop stabilises a slow oscillatory one",
      text: "Letting the workweek respond to schedule pressure (desired starts over standard starts) creates an over/undertime balancing loop with essentially no delay. With the workweek allowed to range from 75% to 125% of standard, amplification of starts falls from 2.07 to 1.52, the cycle is nearly critically damped, no layoffs are needed, and the minimum fill rate improves from 88% to 93%. The general principle: adding or strengthening first-order negative loops that reach the goal without long delays damps oscillation, while adding fast positive loops (for example fatigue raising errors) destabilises it.",
      pages: "774-778",
    },
    {
      title: "Accounting systems hide the costs of instability",
      text: "Standard income statements have no line for losses caused by self-generated cycles, so policies that improve stability show their costs but not their benefits. A model that only reproduces conventional accounts will therefore be biased against stabilising policies. The costs of instability (overtime premiums, hiring and layoff costs, lost sales, excess inventory, lower productivity of new hires) have to be identified and modelled explicitly.",
      pages: "779-780",
    },
    {
      title: "Inventory-workforce interactions are the core of the business cycle",
      text: "With parameters typical of macroeconomic studies and random demand with a 5% standard deviation, the model cycles with a period of about three years. It reproduces the observed timing: vacancies, hiring and the workweek lead output, employment moves with output, and inventories lag. The cycle is strongly damped, so it persists because random shocks keep exciting it, which also explains why each cycle has a different length and amplitude. Shocks trigger the cycle; the feedback structure gives it its shape.",
      pages: "782-785",
    },
    {
      title: "Stabilisation policy and the persistence of cycles",
      text: "Interest rate and tax changes do not alter the inventory-workforce structure, and their own measurement, decision and impact delays are long relative to the cycle, so activist policy can amplify rather than damp it, a point former Federal Reserve vice chairman Alan Blinder illustrated with a hotel thermostat. Lean production, shorter delays and the shift to services should shorten and damp the cycle, but US manufacturing inventory coverage only fell from about 1.7 to 1.4 months by the late 1990s, and service industries such as insurance still have their own long delays and cycles. The cycle has been declared dead many times and has always returned.",
      pages: "785-788",
    },
  ],
  diagrams: [
    {
      kind: "sf",
      title: "The labour supply chain",
      pages: "758-760",
      size: [720, 270],
      stocks: [
        { id: "vac", label: "Vacancies", x: 290, y: 160 },
        { id: "lab", label: "Labour", x: 540, y: 160 },
      ],
      flows: [
        { id: "vc", label: "Vacancy creation", pts: [[70, 160], [230, 160]], to: "vac", labelBelow: true },
        { id: "hire", label: "Hiring", pts: [[350, 160], [480, 160]], from: "vac", to: "lab" },
        { id: "quit", label: "Quits", pts: [[600, 160], [670, 160]], from: "lab" },
      ],
      aux: [
        { id: "dl", label: "Desired labour", x: 80, y: 50, labelAt: "above" },
        { id: "ttf", label: "Time to fill vacancies", x: 480, y: 240, labelAt: "right" },
      ],
      links: [
        { from: "dl", to: "vc", sign: "+" },
        { from: "lab", to: "vc", sign: "−", curve: 130 },
        { from: "vac", to: "vc", sign: "−", curve: 80 },
        { from: "vac", to: "hire", sign: "+", curve: 80 },
        { from: "ttf", to: "hire", sign: "−" },
      ],
      loops: [
        { type: "B", label: "B1", x: 464, y: 124 },
        { type: "B", label: "B2", x: 207, y: 134 },
        { type: "B", label: "B3", x: 372, y: 184 },
      ],
      caption:
        '<span class="chip chipB">B1</span> labour control: a staffing gap opens vacancies, which are filled after the time to fill them and raise the workforce. <span class="chip chipB">B2</span> vacancy control: vacancies already open reduce the need to create new ones, the supply-line correction of the stock management structure. <span class="chip chipB">B3</span> hiring drains the vacancies it fills. Replacement of expected quits is also part of vacancy creation (not drawn).',
    },
    {
      kind: "cld",
      title: "Inventory-workforce interactions with overtime",
      pages: "777-779",
      cld: {
        size: [660, 320],
        vars: [
          { id: "inv", label: "Aggregate inventory", x: 130, y: 160 },
          { id: "dps", label: "Desired starts", x: 360, y: 50 },
          { id: "dl", label: "Desired labour", x: 570, y: 50 },
          { id: "lab", label: "Labour", x: 570, y: 270 },
          { id: "ww", label: "Workweek", x: 360, y: 160 },
          { id: "ps", label: "Production starts", x: 360, y: 270 },
        ],
        links: [
          { from: "inv", to: "dps", sign: "−" },
          { from: "dps", to: "dl", sign: "+" },
          { from: "dl", to: "lab", sign: "+", note: "hiring delay" },
          { from: "lab", to: "ps", sign: "+" },
          { from: "ps", to: "inv", sign: "+" },
          { from: "dps", to: "ww", sign: "+" },
          { from: "ww", to: "ps", sign: "+" },
        ],
        loops: [
          { type: "B", label: "B1", x: 465, y: 105 },
          { type: "B", label: "B2", x: 285, y: 160 },
        ],
        caption:
          '<span class="chip chipB">B1</span> workforce adjustment: an inventory shortfall raises desired starts and desired labour, but labour responds only after the hiring delay, so this loop oscillates. <span class="chip chipB">B2</span> over/undertime: the workweek responds to schedule pressure almost at once, closing much of the gap before hiring catches up. Aggregate inventory is finished goods plus WIP.',
      },
    },
    {
      kind: "sequence",
      title: "Week by week through the inventory-workforce cycle",
      pages: "771-773",
      note: "Our paraphrase of the base run: a 20% step in orders at week 5, constant workweek.",
      steps: [
        { label: "Week 5", detail: "Orders jump to 12,000 a week; production stays at 10,000 and inventory falls." },
        { label: "Vacancies surge", detail: "Desired starts and desired labour rise; vacancy creation peaks near seven times normal." },
        { label: "Weeks 15-23", detail: "New hires lift starts to the order rate, then production catches up; inventory bottoms." },
        { label: "Week 27", detail: "Labour peaks after desired labour has already turned down." },
        { label: "Week 36", detail: "Inventory reaches its target for the first time but output is near its peak, so it overshoots." },
        { label: "Cutbacks", detail: "Layoffs, under way since about week 28, continue and open vacancies are cancelled as excess stock builds; labour bottoms around week 53." },
        { label: "Week 63", detail: "Inventory is below target and falling fast with too few workers: the next cycle starts." },
      ],
      loopBack: { from: 6, to: 1, label: "period of about one year" },
    },
    {
      kind: "cycle",
      title: "Leads and lags of the business cycle",
      pages: "783-785",
      nodes: [
        "A random shock lowers inventory",
        "Vacancies, hiring and workweek rise (lead)",
        "Employment and output rise (coincident)",
        "Inventory overshoots its target (lag)",
        "Hiring stops, hours cut, layoffs",
        "Output falls below demand",
      ],
      center: "damped cycle kept alive by shocks",
      note: "In the macro-parameterised model the period is about three years, close to the observed business cycle.",
    },
  ],
  formulations: [
    {
      name: "Labour and vacancies",
      equations: [
        "Labour(t) = Labour(0) + ∫(Hiring − Attrition − Layoffs) dt",
        "Attrition = Labour / Average duration of employment",
        "Hiring = Vacancies / Time to fill vacancies",
        "Vacancies(t) = Vacancies(0) + ∫(Vacancy creation − Hiring − Cancellations) dt",
      ],
      explain:
        "Two stocks, one physical (people) and one informational (open posts). The hiring flow drains vacancies and fills the workforce at the same rate. Base values: 100-week tenure, 8 weeks to fill.",
      molecule: "workforce",
      pages: "758-760",
    },
    {
      name: "Vacancy creation by stock management",
      equations: [
        "Vacancy creation = MAX(0, Desired vacancy creation)",
        "Desired vacancy creation = Desired hiring + (Desired vacancies − Vacancies) / Time to adjust vacancies",
        "Desired vacancies = MAX(0, Expected time to fill × Desired hiring)",
        "Desired hiring = Expected attrition + (Desired labour − Labour) / Time to adjust labour",
      ],
      explain:
        "The stock management rule (see the module Oscillation: stock management and supply chains) with labour as the stock and vacancies as the supply line. Base values: 4 weeks to adjust vacancies, 13 weeks to adjust labour (reflecting the cost of changing permanent staff).",
      molecule: "desiredWorkforce",
      pages: "759-760",
    },
    {
      name: "Cancellations and layoffs",
      equations: [
        "Cancellations = MIN(MAX(0, −Desired vacancy creation), Vacancies / Cancellation time)",
        "Layoffs = MIN(Willingness to lay off × MAX(0, −Desired hiring), Labour / Average layoff time)",
      ],
      explain:
        "Each outflow runs at the desired rate when it can and at a first-order drain of its stock when it cannot, so neither stock can go negative. Willingness to lay off ranges from 0 to 1.",
      molecule: "protFlow",
      pages: "762-764",
    },
    {
      name: "Production from labour",
      equations: [
        "Production starts = Labour × Workweek × Productivity",
        "Desired labour = Desired production starts / (Standard workweek × Expected productivity)",
      ],
      explain:
        "Labour becomes a factor of production. The test values (40-hour week, 0.25 widgets per person-hour) only set how many people a widget needs; they do not change the dynamics.",
      molecule: "producing",
      pages: "766",
    },
    {
      name: "Flexible workweek",
      equations: [
        "Workweek = Standard workweek × f(Schedule pressure)",
        "Schedule pressure = Desired starts / Standard starts",
        "Standard starts = Labour × Standard workweek × Expected productivity",
      ],
      explain:
        "f must lie between the flat line f = 1 (never vary hours) and the 45° line f = schedule pressure (always hit the target), and it saturates. The example lets the average workweek range from 75% to 125% of standard (30 to 50 hours) with a slope below 1 near normal, a compromise between keeping people busy and hitting the schedule.",
      molecule: "overtime",
      pages: "774-776",
    },
  ],
  cases: [
    {
      title: "Testing the labour chain up and down",
      text: "From 1,000 workers in equilibrium, a 50% rise in desired labour is met smoothly (vacancy creation peaks at 125 a week against a normal 10). A 50% fall reveals the flaws of the first formulation: desired vacancy creation reaches minus 48 a week but actual creation stops at zero, 80 more people are hired into a firm with too many, and the target is reached only after nearly two years. Adding cancellations (2 weeks) and layoffs (8 weeks, full willingness) clears vacancies in about 6 weeks and balances the workforce in about a year.",
      pages: "760-764",
    },
    {
      title: "Inventory-workforce cycles in one firm",
      text: "Using the manufacturing supply chain inventory parameters (see the module Oscillation: stock management and supply chains), with inventory and WIP adjustment times of 12 and 6 weeks, and the labour parameters above, a 20% step in orders produces a lightly damped cycle with a period of about one year, an amplification of starts of 2.07 and a minimum fill rate of 88%. Layoffs begin around week 28 even though demand never fell. The natural period of about a year means such a firm could easily mistake its own cycle for seasonal demand, as Forrester showed a firm can learn spurious seasonality.",
      pages: "766-773, 782",
    },
    {
      title: "Flexible hours as a stabiliser",
      text: "With the over/undertime function, the same shock produces an almost critically damped response: starts amplify 1.52 instead of 2.07, the fill rate never drops below 93%, excess stock is avoided by cutting hours while attrition reduces the workforce, and no layoffs are needed. The phase plot of starts against desired starts hugs the 45° line much more closely.",
      pages: "776-778",
    },
    {
      title: "The business cycle in the model and the economy",
      text: "With macro parameters in the range of Senge and N. Forrester (for example 26 weeks to fill vacancies, a 40-week cycle time, 150-week tenure), random demand produces a cycle of about three years with the observed indicator timing. Real cycles in the US have ranged from 19 months to 8 years. The business cycle sits alongside a 10 to 20 year construction cycle and a 50 to 70 year long wave. Insurance, with no physical inventory, still has an underwriting cycle because of the delays between writing policies, losses and claims, and manufacturing inventory coverage fell less than 20% in the lean 1990s.",
      pages: "782-788",
    },
  ],
  exercises: [
    {
      prompt:
        "Open the Workforce molecule and choose <b>Ramp up</b> (desired 80, 4 years to hire). Note the initial hiring rate and how long the workforce takes to get most of the way. Repeat with time to hire 1 year. Which time constant in the labour model described here (Sterman 2000) corresponds to this slider?",
      hint: "Hiring starts at (80 − 40) / 4 = 10 a year, or 40 a year with a 1-year adjustment. It plays the role of the labour adjustment time.",
      link: { label: "Open workforce", hash: "/m/workforce" },
    },
    {
      prompt:
        "In Desired Workforce from Workflow, run <b>Staff up</b> and then <b>Workload falls</b>. The molecule hires and releases symmetrically. Write the two extra equations you would add to make releases depend on a willingness to lay off, as in the labour model described here.",
      link: { label: "Open desired workforce", hash: "/m/desiredWorkforce" },
    },
    {
      prompt:
        "Open the Overtime molecule. Compare <b>Capped by the limit</b> (10 workers, limit 1.3) with <b>Enough people</b> (15 workers). Then move the overtime limit from 1.0 to 2.0 with 10 workers. Relate what you see to the over/undertime loop B2: how much of a demand gap can hours absorb before hiring must take over?",
      link: { label: "Open overtime", hash: "/m/overtime" },
    },
    {
      prompt:
        "Open the inventory and business cycle case. Run <b>Firms ignore work in progress</b> and <b>Firms track work in progress</b>, then <b>Long lead time (12 months)</b>. Treat the lead time as the combined production and hiring delay: how does lengthening it change the period and size of the swings?",
      link: { label: "Inventory cycle case", hash: "/apps/economics/inventory-cycle" },
    },
    {
      prompt:
        "In the same case, run <b>Gentle inventory correction</b> (8 months). Does slowing the inventory correction stabilise the cycle? Before simulating, predict whether shorter or longer inventory and WIP adjustment times help, then compare your prediction with the result.",
      hint: "In this molecule a slower correction gives a single gentle overshoot instead of a ring. Write your prediction down first.",
      link: { label: "Inventory cycle case", hash: "/apps/economics/inventory-cycle" },
    },
    {
      prompt:
        "Open Aging Chain with PDY and switch from <b>Steady</b> to <b>Rapid hiring (dilution)</b>. Headcount rises but the share of rookies rises too. Explain how this would add a delay and a positive loop to the inventory-workforce model if rookies are less productive and need mentoring.",
      link: { label: "Open aging chain with productivity", hash: "/m/agingPDY" },
    },
    {
      prompt:
        "Pen and paper: write your own week-by-week explanation of the cycle from memory, answering three questions: why is the system not in equilibrium when inventory first returns to target, when starts first equal orders, and when labour first equals desired labour?",
    },
  ],
  pitfalls: [
    "Testing a formulation only with increases; large decreases expose missing outflows such as cancellations and layoffs.",
    "Removing a MAX to allow negative flows instead of modelling the reverse process as its own protected outflow.",
    "Assuming a rule that counts WIP cannot oscillate; capacity being recruited is a supply line too, and it is not measured in units of product.",
    "Explaining behaviour with a slogan (a delayed negative loop) without a step-by-step account consistent with every stock and flow.",
    "Judging stabilising policies with standard accounts, which record their costs but not the hidden costs of instability.",
    "Blaming the business cycle on shocks or central banks; shocks trigger a cycle whose period and phasing come from inventory and hiring structure.",
    "Expecting lean inventories or a service economy to abolish cycles; delays in hiring, claims or capacity remain.",
  ],
  molecules: ["workforce", "desiredWorkforce", "overtime", "stockmgmt", "lowVisPipeline", "producing", "agingPDY"],
};
