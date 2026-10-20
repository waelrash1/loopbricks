import type { StudyChapter } from "@/data/sterman/types";

export const CHAPTER: StudyChapter = {
  id: "ch03",
  number: "3",
  title: "The modeling process",
  part: "Part I Perspective and process",
  pages: "83-105",
  summary:
    "Modelling is done to solve a real problem for real clients, inside an organisation with its own politics, so the process must be disciplined but cannot be a recipe. Modelling involves five activities (problem articulation, a dynamic hypothesis, a simulation model, testing, and policy design and evaluation) and they form an iterative cycle embedded in the organisation's wider loop of learning and action. The heart of it is problem articulation: a clear purpose decides what to leave out, reference modes and a long enough time horizon turn an event into a pattern, and an endogenous dynamic hypothesis explains that pattern through feedback rather than outside forces. Boundary charts, subsystem diagrams, causal loop diagrams, stock and flow maps and policy structure diagrams make the hypothesis and its limits visible.",
  bigIdeas: [
    {
      title: "Managers are designers as well as pilots",
      text: "Forrester's analogy: the people who matter most for safe flight are the aircraft designers, who make a plane that ordinary pilots can fly when tired or stressed. Managers both fly the organisation (day-to-day decisions) and design it (structures, strategies, decision rules). The design role has the greater leverage but gets the least attention, and unlike aircraft designers most managers still design by trial, anecdote and imitation. Models earn their keep mainly by supporting redesign of policies and structures, not only better piloting.",
      pages: "84",
    },
    {
      title: "The client is whoever must change for the problem to be solved",
      text: "The client is not necessarily the person who brought you in, champions the work or pays for it. Clients are the people whose behaviour must change, from a chief executive to a machine operator, a community or a scientific field. Because they are busy and judged on results, the model must address the problem that worries them, in a form consistent with their skills and goals; if they lose confidence in it, the work has no impact.",
      pages: "84-85",
    },
    {
      title: "Serve the client, but do not be a hired gun",
      text: "Focusing on the clients' problem does not mean giving them whatever result or detail they ask for. A good process challenges their view of the problem, asks them to ground opinions in data, and lets the modelling change everyone's mind, the modeller's included. If clients want a predetermined answer or use the model as a weapon, the modeller has an ethical duty to push back and, if that fails, to walk away.",
      pages: "85, 104-105",
    },
    {
      title: "Five activities, done iteratively",
      text: "Successful modellers articulate the problem, formulate a dynamic hypothesis, build a simulation model, test it, and design and evaluate policies. These are not sequential stages: any step can send you back to any earlier one, and what you learn often changes the purpose itself. Modelling sits inside the organisation's own learning loop, in which virtual-world experiments inform real decisions and real-world feedback improves both the model and people's mental models.",
      pages: "86-89",
    },
    {
      title: "Purpose is the knife that decides what to leave out",
      text: "A model is useful because it simplifies; a map as detailed as the territory is useless. Only a clear purpose gives a basis for refusing to include something. A model of a whole system (an entire economy) can never be finished, fed with data, examined or understood, so confidence in it rests on authority. A model of a problem (stabilising the business cycle, slowing fossil fuel use) can be small enough to have its assumptions inspected and compared with competing theories.",
      pages: "89-90",
    },
    {
      title: "Reference modes describe the problem as a pattern over time",
      text: "A reference mode is a set of graphs, plus other descriptive data, showing how the key variables have developed and might develop. It is named for being referred back to throughout the project. Drawing it moves a group from talking about events to describing behaviour, forces agreement on which variables matter, and gives a target for the model to explain. Where numbers are missing, estimated shapes are still valuable.",
      pages: "90",
    },
    {
      title: "Set the time horizon by the delays, not the calendar",
      text: "The horizon should reach back far enough to show how the problem emerged and forward far enough to capture delayed and indirect effects of policies. People routinely underestimate delays and accept horizons tied to fiscal years or planning cycles. A useful rule is several times the longest delay in the system, then more. Too short a horizon can make a worsening problem look stable or make a harmful policy look good; too long a horizon can make the picture irrelevant to decision makers.",
      pages: "90-94",
    },
    {
      title: "A dynamic hypothesis is a provisional, feedback-based theory",
      text: "It is dynamic because it explains the problem behaviour through the system's feedback and stock and flow structure, and it is a hypothesis because it can always be revised. Early on, client team members bring competing theories; the modeller's job is to capture them all as a facilitator, without filtering, and help the group towards an endogenous explanation that can then be tested.",
      pages: "94-95",
    },
    {
      title: "Endogenous explanations, and why exogenous ones explain little",
      text: "An endogenous theory generates behaviour from the interactions of variables and decision rules inside the boundary, so you can ask how behaviour changes when structure or rules change. Explaining behaviour by exogenous inputs only moves the question to what drove those inputs. Exogenous variables are allowed, but they should be few, and each should be checked for feedback from inside the model; if such feedback matters, the boundary must expand.",
      pages: "95-96",
    },
    {
      title: "A broad boundary matters more than detail",
      text: "The PIES energy model broke national supply, demand and price into dozens of fuels and regions, yet treated the economy as exogenous: energy prices, embargoes and huge energy investment had no effect on growth, interest rates or inflation. That missing feedback made its forecasts consistently too optimistic. Capturing the important loops gives more insight than precise detail within a narrow boundary.",
      pages: "96",
    },
    {
      title: "Boundary charts and subsystem diagrams make scope visible",
      text: "A model boundary chart lists the key variables that are endogenous, exogenous and excluded; the excluded list is a warning label telling users where conclusions may be biased. A subsystem diagram shows the model's architecture: the major sectors or agents and the flows of material, money, orders and information between them, which also reveals the level of aggregation. Both are cheap, rare in practice, and protect against models being reused for purposes they cannot serve.",
      pages: "97-102",
    },
    {
      title: "Formalising and testing begin early and never stop",
      text: "Writing equations exposes vague concepts and contradictions that diagrams hide, because a computer accepts no hand-waving. Testing starts with the first equation: every variable must mean something real, equations must be dimensionally consistent, behaviour must be checked against history and under extreme conditions, and sensitivity to parameter and structural uncertainty must be assessed. Policy design then goes beyond tweaking parameters to new decision rules, information flows and structures, tested for robustness and for interactions between policies.",
      pages: "102-104",
    },
  ],
  diagrams: [
    {
      kind: "sequence",
      title: "The five activities of the modelling process",
      pages: "86-87",
      steps: [
        { label: "Problem articulation", detail: "Theme, key variables, time horizon, reference modes" },
        { label: "Dynamic hypothesis", detail: "Current theories, endogenous focus, maps of causal structure" },
        { label: "Simulation model", detail: "Decision rules, parameters, initial conditions, consistency with purpose" },
        { label: "Testing", detail: "Reference modes, extreme conditions, sensitivity, many more tests" },
        { label: "Policy design and evaluation", detail: "Scenarios, new rules and structures, robustness, policy interactions" },
      ],
      loopBack: { from: 4, to: 0, label: "Insights at any step can revise any earlier step, even the purpose" },
      note: "Any activity can feed back to any earlier one; real projects pass through the cycle many times.",
    },
    {
      kind: "cycle",
      title: "Modelling inside the organisation's learning loop",
      pages: "88-89",
      nodes: [
        "Real world",
        "Information feedback",
        "Mental models of the real world",
        "Strategy, structure, decision rules",
        "Decisions (organisational experiments)",
      ],
      center: "Virtual world: the modelling cycle",
      note: "Simulation draws on mental models and real-world information; what is learned in the model changes mental models and rules, which are tried in the real world, whose feedback improves the model again.",
    },
    {
      kind: "cycle",
      title: "A company and its market as coupled subsystems",
      pages: "99-100",
      nodes: [
        "Company",
        "Product, price, delivery delay, quality",
        "Market",
        "Orders, payment, customer response",
      ],
      center: "Subsystem diagram",
      note: "Our redrawing of the idea behind Forrester's corporate growth model: the two sectors exchange not just orders, goods and money but signals about price, availability and quality, so growth patterns come from the policies inside the loop, not from the industry.",
    },
    {
      kind: "cld",
      title: "Why the time horizon changed the verdict on Sahel policies",
      pages: "94",
      cld: {
        size: [560, 280],
        vars: [
          { id: "n", label: "Net herd growth", x: 130, y: 60 },
          { id: "s", label: "Cattle herd", x: 400, y: 60 },
          { id: "g", label: "Grazing pressure", x: 400, y: 220 },
          { id: "q", label: "Grassland condition", x: 130, y: 220 },
        ],
        links: [
          { from: "n", to: "s", sign: "+", curve: -40 },
          { from: "s", to: "n", sign: "+", curve: -40 },
          { from: "s", to: "g", sign: "+" },
          { from: "g", to: "q", sign: "−", note: "delay" },
          { from: "q", to: "n", sign: "+" },
        ],
        loops: [
          { type: "R", label: "R1", x: 265, y: 60 },
          { type: "B", label: "B1", x: 265, y: 150 },
        ],
        caption:
          '<span class="chip chipR">R1</span> Bore holes and subsidies let the herd grow, and a bigger herd breeds faster. <span class="chip chipB">B1</span> Overgrazing degrades the grassland only after a <b>delay</b>. A run to the year 2000 saw only R1 and judged the policies a success; a longer run showed B1 taking over, with erosion, a crash in cattle numbers and a food deficit.',
      },
    },
    {
      kind: "cld",
      title: "Feedbacks a narrow energy model cut out",
      pages: "96-98",
      cld: {
        size: [600, 290],
        vars: [
          { id: "p", label: "Energy prices", x: 300, y: 160 },
          { id: "g", label: "Economic growth", x: 120, y: 50 },
          { id: "d", label: "Energy demand", x: 120, y: 250 },
          { id: "i", label: "Energy-sector investment", x: 460, y: 50 },
          { id: "s", label: "Energy supply", x: 460, y: 250 },
        ],
        links: [
          { from: "p", to: "g", sign: "−", curve: 14 },
          { from: "g", to: "d", sign: "+" },
          { from: "d", to: "p", sign: "+", curve: 14 },
          { from: "p", to: "i", sign: "+", curve: -14 },
          { from: "i", to: "s", sign: "+", curve: -20, note: "delay" },
          { from: "s", to: "p", sign: "−", curve: -14 },
          { from: "i", to: "g", sign: "−" },
        ],
        loops: [
          { type: "B", label: "B1", x: 160, y: 150 },
          { type: "B", label: "B2", x: 420, y: 150 },
          { type: "B", label: "B3", x: 300, y: 92 },
        ],
        caption:
          '<span class="chip chipB">B1</span> Higher energy prices slow growth and so demand. <span class="chip chipB">B2</span> They also draw investment that raises supply after a delay. <span class="chip chipB">B3</span> That investment competes with the rest of the economy for capital. A model that takes <b>economic growth</b> as exogenous loses B1 and B3 and lets the energy sector have its capital for free.',
      },
    },
  ],
  formulations: [],
  cases: [
    {
      title: "Ten years or 130 years of US oil",
      text: "Seen over 1986 to 1996, US oil looked stable: production drifting down, consumption drifting up, prices mostly between $14 and $23 a barrel. Over 130 years the picture is different. Consumption grew about 4.3%/year from 1920 to 1973; lower-48 production peaked in 1970 and by 1996 was 54% of the peak, and imports had reached 61% of consumption. Hubbert, treating oil as a non-renewable resource, had estimated in 1956 an ultimate recoverable resource of 150 to 200 billion barrels and a production peak between 1966 and 1971, while official estimates of the resource were nearly three times higher. The peak came in 1970. Yet a horizon of thousands of years ('Hubbert's pimple') is too long to guide energy policy.",
      pages: "90-94",
    },
    {
      title: "The Sahel model and a horizon set by a round number",
      text: "A model for a foreign aid agency in the early 1970s tested policies such as drilling bore holes for cattle and subsidising crops. Run to the year 2000, the policies looked beneficial: more output, bigger herds, richer herders. Run a few decades further, the larger herds exceeded the carrying capacity, overgrazing caused erosion and desertification, and cattle numbers and food supply crashed. The short horizon would have favoured policies against the region's long-term interest.",
      pages: "94",
    },
    {
      title: "PIES: detail inside a boundary that was too narrow",
      text: "The Project Independence Evaluation System, used by US energy agencies in the 1970s, combined linear programming, econometrics and input-output analysis and reported dozens of fuels by region. It treated the economy as exogenous, so even a full import embargo or doubled oil price left growth untouched. In 1974 it projected 1985 imports of only 3.3 million barrels a day, 250,000 barrels a day of shale oil and prices near $22 per barrel. Imports actually ran at about 5.5 million barrels a day in the late 1980s and shale oil never appeared.",
      pages: "96",
    },
    {
      title: "Boundary chart for an energy-economy model",
      text: "A long-term energy-economy model built by Sterman (horizon 1950 to 2050) made all the major macroeconomic variables endogenous, so the energy sector had to compete for capital, labour and energy. Population, the general rate of technical progress and the world oil price were exogenous; the last was flagged as questionable because US imports affect the world price. Inventories, most international trade, environmental and non-energy resource constraints, interfuel substitution and income distribution were excluded, and the chart told users which conclusions those omissions would make too optimistic. Forrester's corporate growth model shows the same discipline from the other side: about two years of part-time false starts went into the boundary and aggregation, after which the 200-equation model took eight weeks.",
      pages: "97-100",
    },
  ],
  exercises: [
    {
      prompt:
        "Choose a problem you care about and write a one-sentence purpose that names the problem behaviour and the decision it should inform. Then list five things a client might ask you to include and decide, using only the purpose, which you would leave out.",
      hint: "If the purpose cannot settle the question, it is not yet specific enough: it is describing a system rather than a problem.",
      link: { label: "The modelling process", hash: "/methods/process" },
      answer:
        "A good purpose names a problem behaviour over time and a decision, for example: 'Why has our clinic's waiting list grown for three years despite extra staff, and would changing referral rules or adding capacity shrink it?' Use it as a filter: an item stays only if it could change the answer to that question. For the waiting list, staff numbers, referrals and appointment no-shows stay in; the IT system, building layout or national politics go unless they plausibly feed back on waiting times. If you cannot decide about an item, sharpen the purpose rather than expanding the model.",
    },
    {
      prompt:
        "Sketch a reference mode for your problem: three to five variables on aligned time axes, a stated horizon, and rough scales. Mark which features come from data and which are estimates.",
      link: { label: "Reference modes", hash: "/methods/reference-modes" },
      answer:
        "A good reference mode plots the problem variables against the same time axis, with dates, units and rough scales, over a horizon long enough to show the behaviour and its causes (often several times the longest delay). Include the variable that defines the problem and those you think drive it, for example waiting list, referrals and staff over 10 years. Mark the past from data, and the future as what you fear and what you hope; label estimates clearly as estimates. The pattern it shows (growth, decline, oscillation, overshoot) points to the kinds of feedback you will need to find.",
    },
    {
      prompt:
        "See how the horizon changes the story. Open Constrained Growth with the S-curve preset and look only at the first 10 years: what would you conclude? Now look at the full run. Then open Population Growth (Growing preset) and ask what limit a longer horizon would eventually reveal.",
      hint: "Early S-shaped growth is indistinguishable from exponential growth; the balancing loop has not yet left a trace in the data.",
      link: { label: "Constrained Growth", hash: "/m/logistic" },
      answer:
        "In the S-curve run the population grows from 10 to about 48 in the first 10 years, and crowding deaths are only about 2 per year against 8.6 births, so the curve looks exponential and you would forecast unlimited growth. The full run shows it bending at year 16, when it reaches 100, and levelling off just under 200 by year 40. Population Growth on the Growing preset climbs from 100 to about 2,000 in 100 years without ever bending, because that model has no balancing loop; a longer horizon in the real system would reveal some limit (food, land, crowding) that the model omits. A horizon that is too short hides the balancing loop entirely, so it must be long enough for the slowest feedback to show.",
    },
    {
      prompt:
        "Repeat the Sahel lesson in the fishery case. Run 'Open access, strong investment' and judge the policy on the first 5 years only (catch and fleet), then on the whole run. Which loop does the short horizon hide?",
      link: { label: "Fishery case", hash: "/apps/environment/fishery" },
      answer:
        "Judged on the first 5 years, the policy looks like a triumph: the fleet grows from 10 to about 240 boats and the catch rises from 20 to its peak of about 257 per year. The full run shows the bust: the fleet keeps growing to about 340 boats by year 7, the fish stock collapses from 1,000 to about 9 by year 24, the catch falls to 2 or 3 per year and stays low for decades while the oversized fleet slowly retires; only after year 40 does the stock recover enough to start a second boom. The short horizon hides the balancing loop through the fish stock (more boats, more catch, fewer fish, lower catch per boat), which acts with a long delay because investment responds to profits, not to the stock. As in the Sahel, the early success is what builds the capacity that causes the collapse.",
    },
    {
      prompt:
        "Run an extreme-conditions test in Stock Management. Set demand to its minimum of 2 and desired inventory to 200, then demand to 20 with desired inventory 40. Do orders ever go negative? Does inventory behave as physics requires?",
      hint: "The order rule uses MAX(0, …), so orders cannot become negative, and inventory can only fall through sales.",
      link: { label: "Stock Management", hash: "/m/stockmgmt" },
      answer:
        "Neither test makes orders go negative. Demand 2 with desired inventory 200 starts with orders of 25 per week, and inventory rises smoothly from 60 to 200 while orders fall back to demand. Demand 20 with desired inventory 40 starts with orders of 30 per week (the supply line of 60 is far below the 120 needed) and inventory dips to about 35 before settling at 40, with orders back at 20. To force the MAX(0, …) clamp, try demand 2 and desired inventory 40: the formula asks for −15 per week, orders are held at 0 for about 30 weeks, and inventory drains through sales to just above 40 without ever going below zero. A model that passes such tests respects physical limits for the right reasons, not just because history never pushed it there.",
    },
    {
      prompt:
        "Write a model boundary chart (endogenous, exogenous, excluded) for the market growth case. For each exogenous item, name one feedback from inside the model that might make you bring it inside, and for each excluded item say which conclusion it could bias.",
      link: { label: "Market growth case", hash: "/apps/business/market-growth" },
      answer:
        "Endogenous: sales force, orders, backlog, delivery delay, production capacity and the hiring and capacity decisions that respond to them. Exogenous: the market's potential size, the firm's goals for delivery delay and the delays in hiring and building capacity; each could become endogenous if, say, customers lost to slow delivery shrink the market or the delivery goal drifts with past performance (eroding goals). Excluded: price, competitors, product quality and finance; leaving out competitors could make capacity limits look like the only cause of stalled growth, and leaving out finance hides the possibility that cash, not capacity, stops investment. A good chart lists all three columns and says which conclusions each omission could bias.",
    },
    {
      prompt:
        "Draw a subsystem diagram for an organisation you know with three or four sectors (for example, operations, sales, finance, customers). Label the material, money, order and information flows between them. Which of these flows would you model endogenously?",
      answer:
        "Any good answer has three or four sectors with labelled flows of different kinds: material (goods from operations to customers), money (payments from customers to finance, budgets from finance to operations and sales), orders (from customers to sales, then to operations) and information (delivery times and quality to customers, sales forecasts to operations, cash position to management). Model endogenously the flows that close loops relevant to the problem, for example orders responding to delivery delay or budgets responding to revenue. Flows that only enter the system and are not affected by it, such as a regulator's rules, can be exogenous.",
    },
  ],
  pitfalls: [
    "Modelling a whole system instead of a problem; the effort never ends and nobody can examine the result.",
    "Accepting the client's first framing, or a horizon tied to the fiscal year or the next planning cycle, rather than to the delays in the system.",
    "Treating the steps as a linear recipe and resisting revisions to purpose or boundary once work has started.",
    "Explaining the problem by exogenous trends, which only begs the question of what drives them.",
    "Adding detail inside a narrow boundary (many fuels and regions) while cutting the feedbacks that matter.",
    "Hiding what the model leaves out; without a boundary chart, models get reused for purposes they cannot serve.",
    "Testing only by fitting history; a model can fit the past and still produce output without inputs or negative stocks under extreme conditions.",
    "Letting the modeller's attachment to an elegant model, or the client's wish for a set answer, override the evidence.",
  ],
  molecules: ["logistic", "growth", "stockmgmt", "closegap"],
};
