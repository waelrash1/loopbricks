// Capstone projects: one problem each, taken through the whole modelling process from the client's
// question to a written recommendation. Every project runs on a case and molecules already in the app,
// and every number quoted below was checked by simulating that case's model (Oct 2026).
import type { Project } from "@/data/learn/types";

export const PROJECTS: Project[] = [
  {
    id: "winter-beds",
    field: "Health",
    title: "Winter pressure: beds, discharge and the emergency department",
    problem:
      "A 500-bed acute hospital admits about 90 emergency patients a day. Patients stay an average of 4.5 days in acute care, and community services can take up to 95 medically fit patients a day. Last winter admissions rose to about 110 a day for two months, and the queue of patients waiting in the emergency department for a bed grew every day until elective surgery was cancelled to make room. The board has money for one major step before next winter: open 100 extra beds, or fund faster discharge and more community placements. Which should it choose, and what would it take to keep the emergency department queue stable through a 110-a-day winter?",
    stages: [
      {
        title: "Articulate the problem and set the boundary",
        task: "Write one sentence that states the purpose of the model as a question about the board's choice, not about the hospital in general. Choose a time unit and horizon: days, over at least 60 days of winter. Make a model boundary chart with three columns: what you will model inside the model (emergency queue, acute beds, patients awaiting discharge), what you will take as given (admissions, number of beds, community placements), and what you will leave out (elective surgery, staffing, individual wards). Read the delayed-discharge case and note which of its stocks match your list.",
        deliverable: "A half-page problem statement with the purpose, time horizon and a three-column boundary chart.",
        tools: [
          { label: "The modelling process", hash: "/methods/process" },
          { label: "Problem framing module", hash: "/learn/process" },
          { label: "Hospital beds and delayed discharge", hash: "/apps/health/delayed-discharge" },
        ],
        check: [
          "Does the purpose name the decision the board has to make?",
          "Is the time horizon long enough to see a whole winter surge?",
          "Did you say what you left out, and why it does not change the choice?",
        ],
      },
      {
        title: "Sketch the reference mode",
        task: "On paper, draw three graphs over a year: emergency admissions per day, bed occupancy, and the number of patients waiting in the emergency department for a bed. Draw what happened last winter, what the board fears will happen next winter, and what it hopes for. Mark the 85% occupancy line, which Bagust and colleagues found to be where bed shortages start to become noticeable. Label every axis with units and say where real data would come from.",
        deliverable: "Three labelled reference-mode graphs with the feared and hoped-for paths marked on each.",
        tools: [
          { label: "Reference modes", hash: "/methods/reference-modes" },
          { label: "Patterns of behaviour module", hash: "/learn/patterns" },
          { label: "Emergency department crowding", hash: "/apps/health/ed-crowding" },
        ],
        check: [
          "Does every axis have a variable name and a unit?",
          "Is the emergency queue drawn as a stock that keeps rising while admissions exceed discharges?",
          "Do the graphs show behaviour over time, not single numbers?",
        ],
      },
      {
        title: "State a dynamic hypothesis as a causal loop diagram",
        task: "Draw a causal loop diagram that links admissions, patients in acute beds, patients awaiting discharge, free beds and the emergency queue. Add the link from free beds to admissions to the ward, and the link from community placements to discharges. Mark the polarity of every link and name each loop. Then write two sentences that explain, in loop terms, why patients waiting to leave the hospital end up causing a queue two steps upstream in the emergency department.",
        deliverable: "A causal loop diagram with link polarities and named loops, plus a two-sentence dynamic hypothesis.",
        tools: [
          { label: "Causal loop diagrams that communicate", hash: "/methods/causal-loops" },
          { label: "Feedback loops module", hash: "/learn/loops" },
          { label: "Loop drawing", hash: "/learn/draw" },
        ],
        check: [
          "Does every link have a sign?",
          "Can you trace a path from community placements to the emergency queue?",
          "Does the hypothesis explain the reference mode, not just describe it?",
        ],
      },
      {
        title: "Formulate the stocks and flows",
        task: "Turn the diagram into three stocks in a chain: waiting in the emergency department, in hospital needing care, and medically fit awaiting discharge. Write an equation for each flow, using the residence time molecule for patients becoming fit (patients in hospital divided by length of stay) and the backlog molecule for discharge, which can never exceed community placements. Check that admission to the ward is limited by free beds, so the stocks can never hold more patients than there are beds. Check the units of every equation, then compare your formulation with the one in the delayed-discharge case.",
        deliverable: "A stock-and-flow diagram with a units-checked equation for every flow.",
        tools: [
          { label: "Backlog protected by flow", hash: "/m/backlogFlow" },
          { label: "Residence time", hash: "/m/residence" },
          { label: "Stocks, flows and units", hash: "/methods/stocks-flows" },
        ],
        check: [
          "Does every stock have units of patients and every flow units of patients per day?",
          "Is every flow out of a stock limited so the stock cannot go negative?",
          "Do patients awaiting discharge still count against the bed total?",
        ],
      },
      {
        title: "Test the model",
        task: "Run the delayed-discharge case with the balanced settings and confirm the emergency queue holds steady at about 18 patients and occupancy is about 90%. Then run two extreme conditions: drop admissions to 50 a day (patients in hospital should settle at 50 × 4.5 = 225) and cut community placements to 50 a day (the queue should grow without limit, reaching about 2,370 by day 60). For sensitivity, run a 110-a-day winter with 115 placements and try lengths of stay of 4.0, 4.1 and 4.2 days; the day-60 queue should be about 220, 350 and 475. Finally, compare the model's steady occupancy with the 85% and 90% thresholds from Bagust and colleagues.",
        deliverable: "A one-page test log listing each test, what you expected, what the model did and whether it passed.",
        tools: [
          { label: "Hospital beds and delayed discharge", hash: "/apps/health/delayed-discharge" },
          { label: "Validating a model", hash: "/methods/validation" },
          { label: "Sensitivity lab", hash: "/methods/sensitivity" },
        ],
        check: [
          "Did you write down what you expected before each run?",
          "Does the model stay sensible when admissions or placements are pushed to their limits?",
          "Did you find which parameter the winter result is most sensitive to?",
        ],
      },
      {
        title: "Design and evaluate policies",
        task: "Start with a discharge shortfall: 90 admissions a day but only 85 placements. Note that the queue starts to climb at about day 8 and reaches about 277 by day 60, then add 100 beds and note that the climb starts about 20 days later but does not stop. Now run a 110-a-day winter and test each single policy alone: 600 beds (queue about 790 by day 60), 115 placements (about 820), and a 3.8-day stay (about 880). Then test pairs: 3.8-day stays with 115 placements, and 600 beds with 115 placements; both should hold the queue near 22. Explain why no single lever works, using the rule that beds must exceed admissions times total time in a bed.",
        deliverable: "A table of at least six policy runs with the day-60 emergency queue and peak occupancy for each.",
        tools: [
          { label: "Emergency department crowding", hash: "/apps/health/ed-crowding" },
          { label: "Hospital beds and delayed discharge", hash: "/apps/health/delayed-discharge" },
          { label: "Level protected by level", hash: "/m/protLevel" },
        ],
        check: [
          "Did you test each policy alone before combining them?",
          "Did you judge policies on more than one measure, such as the queue and occupancy?",
          "Can you explain each result with the structure, not just report it?",
        ],
      },
      {
        title: "Communicate the recommendation",
        task: "Write a two-page briefing for the hospital board. Open with the answer in one sentence, then show the reference mode, the causal loop diagram and one chart comparing 100 beds with a discharge-and-stay package. State the model's main limits: it leaves out elective cancellations, staffing and day-to-day variation, which Wolstenholme and Lane and colleagues show matter. End with what data the hospital should collect this winter to test the recommendation.",
        deliverable: "A two-page board briefing with the recommendation, three figures and a short list of limits.",
        tools: [
          { label: "The modelling process", hash: "/methods/process" },
          { label: "Testing and confidence module", hash: "/learn/testing" },
        ],
        check: [
          "Can a board member find the recommendation in the first sentence?",
          "Is every figure readable without the text?",
          "Did you say plainly what the model cannot tell the board?",
        ],
      },
    ],
    sources: [
      "Wolstenholme E (1999). A patient flow perspective of U.K. health services: exploring the case for new 'intermediate care' initiatives. System Dynamics Review 15(3):253-271.",
      "Bagust A, Place M, Posnett JW (1999). Dynamics of bed use in accommodating emergency admissions: stochastic simulation model. BMJ 319(7203):155-158.",
      "Lane DC, Monefeldt C, Rosenhead JV (2000). Looking in the wrong place for healthcare improvements: a system dynamics study of an accident and emergency department. J Oper Res Soc 51(5):518-531.",
      "Lattimer V, Brailsford S, Turnbull J, et al. (2004). Reviewing emergency care systems I: insights from system dynamics modelling. Emerg Med J 21(6):685-691.",
    ],
  },
  {
    id: "bullwhip-ordering",
    field: "Business",
    title: "Taming the bullwhip: a retailer's ordering rule",
    problem:
      "A retailer sells a steady 10 cases a week of one product line and aims to hold 100 cases in stock. Its supplier takes 6 weeks to deliver, so in normal times about 60 cases are on order. After a stock count found only 60 cases on the shelves, the buyers ordered hard to catch up; within six weeks the orders owed by the supplier had jumped from 60 to almost 90 cases, stock then overshot to 110, and orders fell below normal. Customer demand never changed. The supplier wants a steadier order stream, and the retailer asks: what ordering rule would refill stock without the swing, and how much does it matter if the lead time doubles?",
    stages: [
      {
        title: "Articulate the problem and set the boundary",
        task: "Write the purpose as a question about the ordering rule, not about demand forecasting. Use weeks as the time unit and a horizon of at least 60 weeks, long enough to see the swing settle. Make a boundary chart: inside the model put stock on hand, orders in transit and the ordering decision; take customer demand, target stock and lead time as given; leave out prices, promotions and order batching, and note that Lee and colleagues name these as other causes of the bullwhip. Read the bullwhip case and list its stocks.",
        deliverable: "A half-page problem statement with the purpose, horizon and a three-column boundary chart.",
        tools: [
          { label: "The modelling process", hash: "/methods/process" },
          { label: "The bullwhip effect in supply chains", hash: "/apps/business/bullwhip" },
        ],
        check: [
          "Does the purpose focus on a decision the retailer controls?",
          "Did you list the causes of the bullwhip you chose to leave out?",
          "Is the horizon long enough for stock to return to target?",
        ],
      },
      {
        title: "Sketch the reference mode",
        task: "Draw two graphs over 60 weeks: stock on hand against its target of 100, and orders in transit against their normal level of 60. Sketch the behaviour the client described: a rise in orders in transit, an overshoot in stock, then a dip below normal. On the same axes, draw the path the retailer would like, a smooth climb to 100 with no overshoot. Name the pattern you see and the kind of structure that usually produces it.",
        deliverable: "Two labelled graphs showing the observed and the desired behaviour, with the pattern named.",
        tools: [
          { label: "Reference modes", hash: "/methods/reference-modes" },
          { label: "Patterns of behaviour module", hash: "/learn/patterns" },
        ],
        check: [
          "Does each graph show the target or normal level as a reference line?",
          "Did you name the pattern as damped oscillation or overshoot?",
          "Do the axes have units of cases and weeks?",
        ],
      },
      {
        title: "State a dynamic hypothesis as a causal loop diagram",
        task: "Draw a causal loop diagram with stock on hand, the stock gap, orders, orders in transit and deliveries. Show the balancing loop that refills stock and the delay on the link from orders to deliveries. Add a second balancing loop through the supply-line gap, and mark it as the loop the buyers ignored. Write two sentences explaining why ignoring orders in transit makes the retailer count each shortfall twice and so overshoot.",
        deliverable: "A causal loop diagram with signs, a delay mark and two named balancing loops, plus a two-sentence hypothesis.",
        tools: [
          { label: "Causal loop diagrams that communicate", hash: "/methods/causal-loops" },
          { label: "Oscillation and supply chains module", hash: "/learn/oscillation" },
          { label: "Loop drawing", hash: "/learn/draw" },
        ],
        check: [
          "Is the delay between ordering and delivery marked on the diagram?",
          "Are both balancing loops labelled and their polarity correct?",
          "Does the hypothesis explain the overshoot in the reference mode?",
        ],
      },
      {
        title: "Formulate the stocks and flows",
        task: "Build the structure from two stocks: orders in transit, filled by orders and drained by deliveries, and stock on hand, filled by deliveries and drained by sales. Write deliveries as orders in transit divided by the lead time, the material delay molecule. Write orders using the stock management rule: expected demand plus the stock gap divided by the adjustment time plus a weight times the supply-line gap divided by the adjustment time. Check units, then open the stock management molecule and confirm your equations match its structure.",
        deliverable: "A stock-and-flow diagram with the ordering equation written out and every unit checked.",
        tools: [
          { label: "Stock management", hash: "/m/stockmgmt" },
          { label: "Material delay", hash: "/m/material" },
          { label: "Model builder", hash: "/learn/build" },
        ],
        check: [
          "Does every stock have units of cases and every flow units of cases per week?",
          "Is the weight on the supply line applied to the whole gap, desired minus actual?",
          "Does the desired supply line equal expected demand times the lead time?",
        ],
      },
      {
        title: "Test the model",
        task: "Run the bullwhip case with orders in transit ignored and confirm stock peaks near 110 cases around week 17 and orders in transit peak near 90 around week 6 before dipping to about 52. For extreme conditions, drop demand to its minimum of 2 cases a week and raise target stock to 200, and check that no stock goes negative and stock still settles on target. For sensitivity, keep the weight at zero and try stock adjustment times of 2, 4, 6, 8 and 10 weeks; the peak should fall from about 116 to about 103, but arrive later. Run the ignoring case for 200 weeks and confirm stock ends at 100, so the cost is the swing, not a lasting offset.",
        deliverable: "A test log with the expected and actual result of each extreme, sensitivity and long-run test.",
        tools: [
          { label: "The bullwhip effect in supply chains", hash: "/apps/business/bullwhip" },
          { label: "Validating a model", hash: "/methods/validation" },
          { label: "Sensitivity lab", hash: "/methods/sensitivity" },
        ],
        check: [
          "Did every stock stay at or above zero in the extreme runs?",
          "Did you record both the size and the timing of the overshoot in the sensitivity runs?",
          "Did the model reproduce the pattern in your reference mode?",
        ],
      },
      {
        title: "Design and evaluate policies",
        task: "Compare three policies at the current 6-week lead time: ignore orders in transit (weight 0), count half of them (weight 0.5), and count them all (weight 1). Record peak stock and peak orders in transit for each; with full weight stock never overshoots and orders in transit peak near 78 instead of 90. Then double the lead time to 12 weeks and repeat for weights 0, 0.25, 0.5, 0.75 and 1; the stock peak should fall from about 120 to no overshoot at all. Compare this with the slower-adjustment policy from your tests and say which gives a smoother order stream with the least delay in refilling stock.",
        deliverable: "A policy table comparing weights and lead times on peak stock, peak orders in transit and time to reach target.",
        tools: [
          { label: "The bullwhip effect in supply chains", hash: "/apps/business/bullwhip" },
          { label: "Low-visibility pipeline correction", hash: "/m/lowVisPipeline" },
          { label: "Decision games", hash: "/learn/games" },
        ],
        check: [
          "Did you measure the swing the supplier sees, not only the retailer's stock?",
          "Did you test the policy under a longer lead time as well as the current one?",
          "Did you name the trade-off each policy makes?",
        ],
      },
      {
        title: "Communicate the recommendation",
        task: "Write a one-page memo to the retailer's buying team and a short note for the supplier. Lead with the rule you recommend, then show one chart of stock and one of orders in transit under the old and new rules. Explain the supply-line idea in plain words, using Sterman's Beer Game finding that people tend to ignore orders already placed. Close with the limits: one tier only, constant demand, and no batching or price promotions.",
        deliverable: "A one-page memo with the recommended rule, two comparison charts and a list of limits.",
        tools: [
          { label: "Cycles in business module", hash: "/learn/cycles" },
          { label: "Testing and confidence module", hash: "/learn/testing" },
        ],
        check: [
          "Could a buyer apply the rule from the memo alone?",
          "Do the charts compare the old and new rules on the same axes?",
          "Did you state what the one-tier model leaves out?",
        ],
      },
    ],
    sources: [
      "Sterman JD (1989). Modeling managerial behavior: misperceptions of feedback in a dynamic decision making experiment. Management Science 35(3):321-339.",
      "Lee HL, Padmanabhan V, Whang S (1997). Information distortion in a supply chain: the bullwhip effect. Management Science 43(4):546-558.",
      "Sterman JD (2000). Business Dynamics: Systems Thinking and Modeling for a Complex World. Irwin/McGraw-Hill.",
    ],
  },
  {
    id: "fishery-fleet",
    field: "Environment",
    title: "A fishery without a crash: fleet, catch and regulation",
    problem:
      "A regional fisheries authority manages a newly opened stock of about 1,000 kilotonnes of fish. Scientists estimate the stock regrows at up to 30% a year and grows fastest at half its natural size, so the most it can yield every year is about 75 kt. A boat breaks even when it lands 0.4 kt a year, boats last about 20 years, and owners buy more boats whenever fishing pays. The fleet has just 10 boats today, but the industry expects rapid growth. The authority asks: what will happen to the fish and the fleet without regulation, and which mix of catch limits, licence fees and investment controls keeps both the fish and the fleet healthy?",
    stages: [
      {
        title: "Articulate the problem and set the boundary",
        task: "Write the purpose as a question about the authority's choice of regulation. Use years as the time unit and a horizon of at least 60 years, because boats last 20 years and the stock may take decades to recover. Make a boundary chart: inside the model put the fish stock, the fleet, catch and investment; take regrowth, catchability, boat life and break-even catch as given; leave out prices, weather, other species and rival fleets. Note that Moxnes found overinvestment even without a commons, so leaving out rivals does not remove the problem.",
        deliverable: "A half-page problem statement with the purpose, horizon and a three-column boundary chart.",
        tools: [
          { label: "The modelling process", hash: "/methods/process" },
          { label: "Fisheries: overinvestment and overfishing", hash: "/apps/environment/fishery" },
        ],
        check: [
          "Does the purpose name the regulatory decision?",
          "Is the horizon longer than the life of a boat?",
          "Did you explain why leaving out competing fleets is acceptable here?",
        ],
      },
      {
        title: "Sketch the reference mode",
        task: "Draw two graphs over 60 years: the fish stock and the fleet. Sketch the pattern the authority fears, using what you know of fisheries that boomed and collapsed, and the pattern it hopes for, a fish stock held near 500 kt with a fleet just big enough to land the catch. Mark the 500 kt level that gives the largest sustainable yield. Say where real data would come from, such as FAO catch statistics, stock assessments and fleet registers.",
        deliverable: "Two labelled graphs with feared and hoped-for paths, the 500 kt line and the data sources named.",
        tools: [
          { label: "Reference modes", hash: "/methods/reference-modes" },
          { label: "Patterns of behaviour module", hash: "/learn/patterns" },
        ],
        check: [
          "Did you draw the fleet and the fish on the same time axis so the lag between them shows?",
          "Is the maximum-yield level marked as a reference line?",
          "Did you name at least one real data source for each graph?",
        ],
      },
      {
        title: "State a dynamic hypothesis as a causal loop diagram",
        task: "Draw a causal loop diagram with fish stock, regrowth, catch, catch per boat, profit, investment and fleet. Show the reinforcing loop in regrowth, the balancing loop through catch, and the loop where a bigger fleet lowers catch per boat and so slows investment. Mark the long delay on boat retirement. Write two sentences explaining why the fleet overshoots: profit tells owners about the stock only after the fact, and boats outlive the boom that paid for them.",
        deliverable: "A causal loop diagram with signs, delays and named loops, plus a two-sentence dynamic hypothesis.",
        tools: [
          { label: "Causal loop diagrams that communicate", hash: "/methods/causal-loops" },
          { label: "System archetypes module", hash: "/learn/archetypes" },
          { label: "Loop drawing", hash: "/learn/draw" },
        ],
        check: [
          "Does every link have a sign?",
          "Is the slow exit of boats shown as a delay?",
          "Does the hypothesis explain why the fleet keeps growing after the fish start to fall?",
        ],
      },
      {
        title: "Formulate the stocks and flows",
        task: "Build two stocks: fish, with regrowth in and catch out, and fleet, with investment in and scrapping out. Write regrowth with the constrained growth molecule, growth rate times fish times one minus fish over carrying capacity. Write catch as catchability times fleet times fish, capped by any catch limit, and scrapping as fleet divided by boat life. Write investment so that it replaces scrapped boats and adds more when catch per boat beats break-even; check that it can never be negative, then compare your equations with the fishery case.",
        deliverable: "A stock-and-flow diagram with every equation written out and its units checked.",
        tools: [
          { label: "Constrained growth", hash: "/m/logistic" },
          { label: "Ceiling", hash: "/m/ceiling" },
          { label: "Model builder", hash: "/learn/build" },
        ],
        check: [
          "Do the fish stock and catch have units of kt and kt per year?",
          "Can the fish stock or the fleet ever go negative?",
          "Does the catch limit act as a ceiling on catch rather than on the stock?",
        ],
      },
      {
        title: "Test the model",
        task: "First check the equilibrium by hand: without a limit, fishing stops paying when the stock reaches break-even divided by catchability, 0.4 ÷ 0.002 = 200 kt. Run the cautious investment preset for 200 years and confirm the stock settles near 200 kt and the fleet near 120 boats. For extreme conditions, set the investment response to zero (the fleet should stay at 10 boats and the fish near 930 kt) and cut the regrowth rate to 10% (the stock should collapse to under 1 kt). For sensitivity, compare investment responses of 5% and 20%: the fleet peak should rise from about 160 boats in year 26 to about 340 boats in year 7.",
        deliverable: "A test log showing the hand-calculated equilibrium, the extreme runs and the sensitivity runs, each marked pass or fail.",
        tools: [
          { label: "Fisheries: overinvestment and overfishing", hash: "/apps/environment/fishery" },
          { label: "Validating a model", hash: "/methods/validation" },
          { label: "Sensitivity lab", hash: "/methods/sensitivity" },
        ],
        check: [
          "Did the simulated equilibrium match your hand calculation?",
          "Did the model behave sensibly when investment or regrowth was pushed to an extreme?",
          "Did you note which parameter changes the timing of the crash most?",
        ],
      },
      {
        title: "Design and evaluate policies",
        task: "Run open access with strong investment and record the worst year: the fleet peaks near 340 boats around year 7 and the fish fall to about 9 kt around year 24. Then test a catch limit of 75 kt a year: the fish stay above 500 kt, but the fleet still grows to about 188 boats, far more than needed. Test a licence fee that doubles the break-even catch to 0.8 kt: the stock settles near 400 kt with about 90 boats. Finally combine the 75 kt limit with the fee and record the fish stock and fleet after 60 years, which should be about 550 kt and 94 boats.",
        deliverable: "A policy table with the lowest fish stock, peak fleet and fleet after 60 years for each policy.",
        tools: [
          { label: "Fisheries: overinvestment and overfishing", hash: "/apps/environment/fishery" },
          { label: "First-order stock adjustment", hash: "/m/stockAdjust" },
          { label: "Decision games", hash: "/learn/games" },
        ],
        check: [
          "Did you judge each policy on both the fish and the fleet?",
          "Did you explain why a catch limit alone leaves too many boats?",
          "Is the combined policy better than either part alone on every measure you chose?",
        ],
      },
      {
        title: "Communicate the recommendation",
        task: "Write a two-page policy brief for the fisheries authority. Open with the recommended package, then show one chart of the fish stock and one of the fleet under open access and under your package. Explain in plain words why owners overinvest, citing Moxnes's experiments in which participants, mostly from the fishing sector, built about 60% too much capacity on average even with sole ownership of the stock. List the model's limits, including fixed prices, a single species and a fixed investment rule.",
        deliverable: "A two-page policy brief with the recommendation, two comparison charts and a list of limits.",
        tools: [
          { label: "Testing and confidence module", hash: "/learn/testing" },
          { label: "Where system dynamics is going", hash: "/learn/frontier" },
        ],
        check: [
          "Is the recommendation stated in the first paragraph?",
          "Do the charts show both open access and the recommended package?",
          "Did you say how the authority could check the advice against real catch and fleet data?",
        ],
      },
    ],
    sources: [
      "Moxnes E (1998). Not only the tragedy of the commons: misperceptions of bioeconomics. Management Science 44(9):1234-1248.",
      "Moxnes E (2000). Not only the tragedy of the commons: misperceptions of feedback and policies for sustainable development. System Dynamics Review 16(4):325-348.",
      "Sterman JD (2000). Business Dynamics: Systems Thinking and Modeling for a Complex World. Irwin/McGraw-Hill.",
    ],
  },
];
