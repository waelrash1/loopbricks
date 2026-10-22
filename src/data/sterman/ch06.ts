import type { StudyChapter } from "@/data/sterman/types";

export const CHAPTER: StudyChapter = {
  id: "ch06",
  number: "6",
  title: "Stocks and flows",
  part: "Part II Tools for systems thinking",
  pages: "191-230",
  summary:
    "Causal loop diagrams show feedback but hide accumulation. Stocks and flows supply the missing half of system dynamics: stocks, which hold the state of a system, and flows, which are the only things that can change them. This topic covers the notation (boxes, pipes, valves and clouds), shows that a stock and flow map is exactly an integral equation, and gives practical tests for telling stocks from flows: the snapshot test and units of measure. It then turns to mapping practice: why auxiliaries keep one idea per equation, why information links can never point straight into a stock, how far to aggregate serial and parallel processes, and why every cloud on a map is a boundary assumption that must be challenged. Two consulting cases, a pulp and paper mill construction project and US automobile recycling, show these choices made for real.",
  bigIdeas: [
    {
      title: "Stocks and flows are the second pillar of dynamics, beside feedback",
      text: "A causal loop diagram can say that more customers waiting leads to more service, but it cannot say what accumulates or what is conserved. Stocks are accumulations; flows are the rates that fill and drain them. Feedback loops close only through stocks: information about a stock drives a flow, and the flow changes the stock. Without the stock and flow layer you cannot tell whether a variable will rise or fall, only which way it is pushed.",
      pages: "191-192",
    },
    {
      title: "A stock and flow map is an integral equation in pictures",
      text: "The bathtub, the box-and-pipe diagram, the integral Stock(t) = Stock(t₀) + ∫(Inflow − Outflow) ds and the differential equation d(Stock)/dt = Inflow − Outflow carry exactly the same information. The accumulation is written as INTEGRAL(Inflow − Outflow, Stock₀), which reads as: keep a running total of the net flow, starting from a given initial value. Because the four forms are interchangeable, a manager who understands bathtubs already understands the mathematics; the modeller must still understand it rigorously.",
      pages: "193-195",
    },
    {
      title: "Stocks do four jobs in a system",
      text: "First, they describe the state of the system and so are what decision makers act on: a pilot needs altitude and fuel, a firm needs its backlog and inventory. Second, they give inertia and memory: once lead paint or ozone-destroying chlorine has accumulated, it persists long after the inflow stops. Third, every delay contains a stock, the material or information in transit between input and output. Fourth, stocks decouple inflows from outflows, so the two can be set by different people and differ for long periods; disequilibrium is normal, and equilibrium must be explained rather than assumed.",
      pages: "195-197",
    },
    {
      title: "The snapshot test identifies stocks",
      text: "Freeze time and ask what you could still count or measure in the photograph. The water in a reservoir, the balance in an account, the inventory in a warehouse, a posted price and even a manager's current belief about demand all survive the snapshot, so they are stocks. How fast any of them is changing cannot be read from a single frame, so rates are flows. The test works for intangible states too: expectations, morale and perceptions are stocks because they persist until something updates them.",
      pages: "199-200",
    },
    {
      title: "Units of measure separate stocks from flows",
      text: "If a stock is measured in units, every flow into or out of it must be measured in units per time period. The choice of time unit is free but must be consistent: 1200 widgets per day and 8400 widgets per week describe the same instantaneous rate. A belief about the order rate (widgets per week) is updated by a flow measured in widgets per week per week. Checking units is the fastest way to catch a variable placed in the wrong role.",
      pages: "198-200",
    },
    {
      title: "Material is conserved; information is not",
      text: "Whatever enters a stock stays there until it leaves through an outflow, and when it moves from one stock to another the first loses exactly what the second gains. Accounts receivable are information, yet still conserved: an invoice leaves only when it is paid or written off. Information about the stock, by contrast, can be copied to everyone who needs it without depleting it. Keeping the conserved network of flows distinct from the information links that close the loops is one of the main strengths of the notation.",
      pages: "201-202",
    },
    {
      title: "Systems are state-determined",
      text: "In the state-variable view, stocks change only through their flows, and flows are functions of the stocks (plus constants and exogenous inputs): dS/dt = f(S, U, C). Constants are stocks that change too slowly to matter over the time horizon; exogenous variables are stocks deliberately left outside the boundary. This is why the whole model can always be written using only stocks and rates, and why every loop must pass through at least one stock.",
      pages: "202-204",
    },
    {
      title: "Auxiliaries keep one idea per equation",
      text: "Auxiliary variables are neither stocks nor flows but intermediate functions of them, such as food per capita or a fractional birth rate. They can always be substituted away, but the reduced equation hides structure: when population appears in both numerator and denominator of a single expression, the sign of the link from population to births becomes ambiguous and the reinforcing and balancing loops can no longer be told apart. Separate auxiliaries make each equation readable, checkable and easy to change when a client disputes one assumption.",
      pages: "202-205",
    },
    {
      title: "No causal arrow can point directly into a stock",
      text: "People often draw staff or workweek as directly reducing a queue of waiting customers. The only way customers leave the queue is through the departure rate, so staff, productivity and hours must act on that outflow. With the correct map every information link is positive, and the balancing effect comes from the fact that the departure rate is an outflow. Drawing links into stocks hides the accumulation and leads to errors about timing.",
      pages: "204-206",
    },
    {
      title: "Flows are instantaneous; we only ever measure averages",
      text: "System dynamics treats time as continuous, and a flow is its value at an instant. No one can observe that value: GDP and quarterly sales are averages over a past interval, and even a speedometer averages over a short lag. When reporting delays are long relative to how fast the rate changes, the gap between the measured and the true rate can destabilise decisions. Most flows are also quantised (whole tankers, whole people), but treating them as continuous is usually harmless compared with parameter uncertainty; the purpose of the model decides.",
      pages: "206-208",
    },
    {
      title: "Aggregate by residence time and by decision rule",
      text: "Serial stages can be merged when items spend little time in them relative to the dynamics of interest: refinery and retail petroleum stocks hold only months of supply and can be dropped from a decades-long energy model, but they are central to a model of spot prices. Parallel activities can be merged when they follow similar decision rules and have similar residence times, which is why parts are often lumped but plant and equipment often are not. Start aggregate and add detail only as the purpose demands.",
      pages: "213-217",
    },
    {
      title: "Clouds are boundary assumptions to be challenged",
      text: "A source or sink cloud says the stock beyond it is infinite and can never constrain the flow. Real suppliers run out and real sinks fill: parts shortages throttle car production, and dealer lots and cars already on the road limit new sales. Barry Richmond's advice to \"challenge the clouds\" (p. 222) means asking, at each cloud, whether that upstream stock could empty or that downstream stock could back up, and extending the boundary when the answer matters for the policy question.",
      pages: "222-225",
    },
  ],
  diagrams: [
    {
      kind: "sf",
      title: "Staff and hours act on the departure rate, not on the queue",
      pages: "204-206",
      size: [680, 290],
      stocks: [{ id: "q", label: "Customers waiting", x: 290, y: 70, w: 160 }],
      flows: [
        { id: "arr", label: "Arrival rate", pts: [[60, 70], [210, 70]], to: "q" },
        { id: "dep", label: "Departure rate", pts: [[370, 70], [610, 70]], from: "q" },
      ],
      aux: [
        { id: "ww", label: "Workweek", x: 390, y: 145 },
        { id: "st", label: "Service staff", x: 420, y: 235 },
        { id: "pr", label: "Productivity", x: 600, y: 185 },
      ],
      links: [
        { from: "q", to: "ww", sign: "+" },
        { from: "ww", to: "dep", sign: "+" },
        { from: "q", to: "st", sign: "+" },
        { from: "st", to: "dep", sign: "+" },
        { from: "pr", to: "dep", sign: "+" },
      ],
      loops: [
        { type: "B", label: "B1", x: 405, y: 98 },
        { type: "B", label: "B2", x: 412, y: 195 },
      ],
      caption:
        'Customers join the queue through the <b>arrival rate</b> and leave it only through the <b>departure rate</b>. A longer queue stretches the <b>workweek</b> within days <span class="chip chipB">B1</span> and, over months, brings in more <b>service staff</b> <span class="chip chipB">B2</span>. Staff, hours and productivity all act on the departure rate, never on the queue itself, so every information link is positive: the stock falls because the outflow it feeds drains it.',
    },
    {
      kind: "sf",
      title: "Auxiliaries separate the loops around population",
      pages: "202-205",
      size: [680, 280],
      stocks: [{ id: "pop", label: "Population", x: 340, y: 70 }],
      flows: [
        { id: "b", label: "Births", pts: [[60, 70], [280, 70]], to: "pop" },
        { id: "d", label: "Deaths", pts: [[400, 70], [620, 70]], from: "pop" },
      ],
      aux: [
        { id: "fbr", label: "Fractional birth rate", x: 120, y: 220 },
        { id: "fpc", label: "Food per capita", x: 270, y: 220 },
        { id: "food", label: "Food", x: 400, y: 220 },
        { id: "life", label: "Average lifetime", x: 600, y: 175 },
      ],
      links: [
        { from: "pop", to: "b", sign: "+", curve: -90 },
        { from: "pop", to: "fpc", sign: "−" },
        { from: "food", to: "fpc", sign: "+" },
        { from: "fpc", to: "fbr", sign: "+" },
        { from: "fbr", to: "b", sign: "+" },
        { from: "pop", to: "d", sign: "+", curve: 90 },
        { from: "life", to: "d", sign: "−" },
      ],
      loops: [
        { type: "R", label: "R", x: 222, y: 90 },
        { type: "B", label: "B1", x: 205, y: 175 },
        { type: "B", label: "B2", x: 458, y: 90 },
      ],
      caption:
        'Births add to the population and deaths drain it. More people bring more births <span class="chip chipR">R</span> and more deaths <span class="chip chipB">B2</span>. More people also share the same <b>food</b>, so <b>food per capita</b> falls and pulls the <b>fractional birth rate</b> down <span class="chip chipB">B1</span>. Each auxiliary carries one idea. Substitute them away into <code>Births = Population × f(Food ÷ Population)</code> and R and B1 collapse into a single link whose sign depends on how much food there is.',
    },
    {
      kind: "sf",
      title: "A sketch answer to the 1979 gasoline shortage",
      pages: "212-213",
      note: "Our own sketch of one plausible structure; other answers are possible.",
      size: [740, 250],
      stocks: [
        { id: "st", label: "Gasoline at stations", x: 230, y: 70, w: 170 },
        { id: "ct", label: "Gasoline in car tanks", x: 530, y: 70, w: 170 },
      ],
      flows: [
        { id: "del", label: "Deliveries", pts: [[60, 70], [145, 70]], to: "st" },
        { id: "pur", label: "Purchases", pts: [[315, 70], [445, 70]], from: "st", to: "ct" },
        { id: "con", label: "Consumption", pts: [[615, 70], [690, 70]], from: "ct" },
      ],
      aux: [
        { id: "fear", label: "Fear of shortage", x: 300, y: 190 },
        { id: "drv", label: "Driving", x: 652, y: 175 },
      ],
      links: [
        { from: "st", to: "fear", sign: "−" },
        { from: "fear", to: "pur", sign: "+" },
        { from: "ct", to: "pur", sign: "−", curve: -110 },
        { from: "drv", to: "con", sign: "+" },
      ],
      loops: [
        { type: "R", label: "R", x: 318, y: 120 },
        { type: "B", label: "B", x: 428, y: 96 },
      ],
      caption:
        'Deliveries held steady, so the shortage was a shift between two stocks. Drivers who saw empty pumps grew afraid and topped off their tanks, so <b>purchases</b> moved gasoline from station tanks into car tanks; emptier stations fed the fear <span class="chip chipR">R</span>. Fuller car tanks eventually limit how much more anyone can buy <span class="chip chipB">B</span>. The gasoline did not vanish: it sat in millions of tanks. Purchase caps and odd-even days made drivers fill up more often and so strengthened the hoarding loop.',
    },
    {
      kind: "sf",
      title: "Mapping the stocks and flows of a system",
      pages: "199-225",
      size: [760, 240],
      stocks: [
        { id: "hiv", label: "HIV positive", x: 250, y: 70 },
        { id: "aids", label: "People with AIDS", x: 520, y: 70, w: 140 },
      ],
      flows: [
        { id: "inf", label: "New infections", pts: [[60, 70], [190, 70]], to: "hiv" },
        { id: "onset", label: "Onset of AIDS", pts: [[310, 70], [450, 70]], from: "hiv", to: "aids" },
        { id: "dth", label: "Deaths", pts: [[590, 70], [700, 70]], from: "aids" },
      ],
      aux: [
        { id: "risk", label: "Infections per carrier", x: 110, y: 180 },
        { id: "inc", label: "Incubation time", x: 440, y: 180 },
        { id: "surv", label: "Survival time", x: 690, y: 180 },
      ],
      links: [
        { from: "hiv", to: "inf", sign: "+", curve: -100 },
        { from: "risk", to: "inf", sign: "+" },
        { from: "hiv", to: "onset", sign: "+", curve: 100 },
        { from: "inc", to: "onset", sign: "−" },
        { from: "aids", to: "dth", sign: "+", curve: 100 },
        { from: "surv", to: "dth", sign: "−" },
      ],
      loops: [
        { type: "R", label: "R", x: 172, y: 97 },
        { type: "B", label: "B1", x: 329, y: 97 },
        { type: "B", label: "B2", x: 608, y: 97 },
      ],
      caption:
        'A small map built with the mapping steps. <b>Stocks</b>: people living with HIV and people with AIDS pass the snapshot test, since you could count both at an instant. <b>Units</b>: both are people, so every flow is people per year. <b>Flows</b>: new infections, onset of AIDS and deaths are the only ways in or out. <b>Boundary</b>: the uninfected population and the dead are clouds; challenge the first, because the pool of people at risk can shrink. <b>Information</b>: carriers drive new infections <span class="chip chipR">R</span>, and each stock drains through an average residence time <span class="chip chipB">B1</span> <span class="chip chipB">B2</span>. Prevalence is a stock; incidence is the flow that fills it.',
    },
  ],
  formulations: [
    {
      name: "Accumulation: the four equivalent forms",
      equations: [
        "Stock(t) = Stock(t₀) + ∫[t₀→t] (Inflow(s) − Outflow(s)) ds",
        "d(Stock)/dt = Inflow(t) − Outflow(t)",
        "Stock = INTEGRAL(Inflow − Outflow, Stock₀)",
      ],
      explain:
        "The stock at any time is its initial value plus everything that has flowed in less everything that has flowed out. The derivative form says the same thing at an instant: the net flow is the slope of the stock. The INTEGRAL() notation is the one used in simulation software and throughout these notes. The initial value is a separate piece of information; it cannot be recovered from the flows.",
      molecule: "bathtub",
      pages: "193-195",
    },
    {
      name: "State-determined system",
      equations: ["dS/dt = f(S, U, C)", "S: vector of stocks; U: exogenous inputs; C: constants"],
      explain:
        "The rates of change of the stocks are functions of the stocks themselves, any exogenous inputs and constants. Information feeds back from the stocks to the flows, closing every loop. Constants are stocks that change too slowly to matter, and exogenous inputs are stocks outside the boundary, so in principle everything is a stock or a flow.",
      molecule: "decay",
      pages: "202-204",
    },
    {
      name: "Population with auxiliaries versus reduced form",
      equations: [
        "Population = INTEGRAL(Net Birth Rate, Population₀)",
        "Net Birth Rate = Population × Fractional Birth Rate",
        "Fractional Birth Rate = f(Food per Capita)",
        "Food per Capita = Food ÷ Population",
        "Reduced: Net Birth Rate = Population × f(Food ÷ Population)",
      ],
      explain:
        "The first four lines say one thing each, so the reinforcing loop (population to births) and the balancing loop (population to food per capita to fertility) are visible and every link has a clear sign. The reduced line is mathematically identical but merges the loops. The Population Growth molecule is the special case with a constant fractional rate, before any food constraint is added.",
      molecule: "growth",
      pages: "202-205",
    },
    {
      name: "Units consistency",
      equations: [
        "[Flow] = [Stock] ÷ [Time]",
        "Inventory (widgets) ← Production (widgets/week)",
        "Expected Order Rate (widgets/week) ← Change in Expected Order Rate ((widgets/week)/week)",
      ],
      explain:
        "Every flow attached to a stock is measured in the stock's units per time period. A stock that is itself a rate, such as a belief about the order rate, is changed by a flow measured in rate per time. A units mismatch is a sign that a variable is in the wrong role or a conversion factor is missing.",
      pages: "198-200",
    },
    {
      name: "Average residence time (for aggregation)",
      equations: ["Residence time ≈ Stock ÷ Outflow (in equilibrium)", "Outflow = Stock ÷ τ  ⇒  Stock* = Inflow × τ"],
      explain:
        "The average time an item spends in a stock is its content divided by its throughput. Stocks whose residence time is short compared with the time scale of the problem can be merged into neighbours or dropped; stocks whose residence time is comparable to the horizon must be kept. With a first-order outflow the equilibrium stock is the inflow multiplied by the residence time, which the Residence Time molecule shows directly.",
      molecule: "residence",
      pages: "216-217",
    },
  ],
  cases: [
    {
      title: "Prevalence and incidence of HIV/AIDS",
      text: "Epidemiology already uses the stock and flow distinction: prevalence is a stock and incidence a flow. For December 1998 the UN AIDS programme estimated 33.4 million people living with HIV/AIDS (the stock), new infections of 5.8 million per year (about 16,000 per day) and AIDS deaths of 2.5 million per year. The stock was therefore growing by roughly 3.3 million people per year, the inflow less the outflow.",
      pages: "198",
    },
    {
      title: "The 1979 US gasoline shortage",
      text: "After the Iranian revolution, long queues and empty stations suggested that supply had collapsed. Yet imports from the Persian Gulf fell by about 500,000 barrels per day while imports from elsewhere rose by about 640,000, so total imports rose by about 140,000; domestic output fell by about 150,000 barrels per day, leaving supply essentially flat, while consumption fell by about 330,000 barrels per day (around 2%). The puzzle of where the gas went is a mapping exercise (Sterman 2000): the answer lies in a stock that the news coverage ignored, the fuel in the tanks of cars, filled by anxious drivers topping off.",
      pages: "212-213",
    },
    {
      title: "Pulp and paper mill construction (Homer et al. 1993)",
      text: "A leading builder of pulp and paper mills wanted to shorten the cycle from contract to working mill without raising cost. One client manager wanted every drawing and purchase order in the model; others already had detailed scheduling tools and needed one that captured the dynamic interactions instead. The team settled on two main chains (process and equipment, and construction), split equipment into reactor vessels, major and minor items because their durations and costs differed, and built a generic phase module with rework and internal precedence constraints. Calibrated against data from a live project, the model was judged credible by the client and helped identify policies that cut delivery times by at least 30% within a few years, including some that had been hotly debated.",
      pages: "218-221",
    },
    {
      title: "Automobile recycling (Zamudio-Ramirez 1996)",
      text: "Starting from a car-industry map with clouds at both ends, the analysis extends the boundary to suppliers, dealers (who aim for about 40 to 60 days of stock) and cars on the road, then to scrapping. North America scraps some 10 to 12 million vehicles a year; about 94% are shredded by roughly 200 shredders. The recycling model showed that design for disassembly would do nothing for years, because new cars take about a decade to reach the scrapyard, and could then create a glut of used parts that depressed prices and pushed recovery back down. Lighter cars with more plastic could cut shredder revenue per hulk and even raise abandonment and landfilled fluff. Collecting recyclable material is not the same as recycling it.",
      pages: "222-229",
    },
  ],
  exercises: [
    {
      prompt:
        "Snapshot test on paper. Classify each item as a stock or a flow and give its units: beds occupied in a hospital, admissions, the posted price of fuel, the inflation rate, a manager's forecast of demand, staff morale, the government deficit, the national debt, rainfall, the level of a reservoir.",
      hint: "If it survives a frozen photograph it is a stock. A rate of change (inflation, deficit, admissions, rainfall) is a flow; the price and the forecast are stocks even though they are not physical.",
      answer:
        "Stocks: beds occupied (patients), the posted price of fuel (dollars per litre), a manager's forecast of demand (units per week), staff morale (an index), the national debt (dollars), the level of a reservoir (cubic metres). Flows: admissions (patients per day), the inflation rate (percent per year, the rate of change of the price level), the government deficit (dollars per year, the flow into the debt), rainfall (millimetres or cubic metres per day). The test is the snapshot: if time froze, beds, debt, prices, forecasts, morale and water levels would still have a value, but admissions, inflation, deficits and rainfall only exist as rates over a period. Prices, forecasts and morale are stocks even though they are not physical, because they persist and change only through their own rate of adjustment.",
      link: { label: "Stocks, flows and units", hash: "/methods/stocks-flows" },
    },
    {
      prompt:
        "Bathtub: choose the Filling preset (inflow 14, outflow 6, level 50). Before running, write down the level you expect at year 10. Set Stop at to 10 and run. Then choose Draining (inflow 3, outflow 12) and predict when the tub empties and what the outflow does afterwards.",
      hint: "Filling: 50 + (14 − 6) × 10 = 130. Draining: at the full net outflow of 9 a year the tub would empty in 50 ÷ 9 ≈ 5.6 years; near empty the drain can take only what the tub holds over its minimum draining time, plus what flows in.",
      answer:
        "Filling: the level rises by 14 − 6 = 8 units a year, so at year 10 it is 50 + 8 × 10 = 130, which the run confirms. Draining: the level falls by 12 − 3 = 9 a year, which would empty it at about 50 ÷ 9 ≈ 5.6 years. In the app it falls in a straight line until only about 2 is left, near year 5.3; then the outflow is limited to the level over the minimum draining time (0.25 years) plus the inflow, so it eases down towards the inflow of 3 a year and the level slides towards zero, below 0.01 by about year 6.4, without ever going negative. The lesson: a stock changes at the rate of net flow, and an outflow drawn from a stock is limited by what the stock contains.",
      link: { label: "Bathtub", hash: "/m/bathtub" },
    },
    {
      prompt:
        "Bathtub: choose Steady state (8 in, 8 out). Now move both sliders to 20 and run again. Does the level look any different? Compute the average time a unit of water spends in the tub in each case, and explain why a snapshot of the level alone cannot tell you the throughput.",
      hint: "Both are dynamic equilibria at 50. Average residence time is 50 ÷ 8 ≈ 6.3 years versus 50 ÷ 20 = 2.5 years.",
      answer:
        "The level stays at 50 in both runs, so the two charts look identical. Average residence time is the stock divided by the flow through it: 50 ÷ 8 ≈ 6.3 years with 8 in and 8 out, and 50 ÷ 20 = 2.5 years with 20 in and 20 out. Both are dynamic equilibria in which the stock is constant because inflow equals outflow, but the throughput differs by a factor of 2.5. A snapshot shows only the stock, so you need the flows (or the residence time) to know how busy the system is.",
      link: { label: "Bathtub", hash: "/m/bathtub" },
    },
    {
      prompt:
        "Aggregation by residence time. Open Residence Time with inflow 8 and compare Short stay (τ = 2) with Long stay (τ = 10). Predict each equilibrium stock and roughly how long it takes to get there. If your model's horizon were five years and its decisions monthly, which of the two stocks could you safely lump into a neighbouring stock?",
      hint: "Equilibria are 8 × 2 = 16 and 8 × 10 = 80; settling takes about three to four τ. Only the short-lived stock is a candidate for lumping.",
      answer:
        "Short stay settles at 8 × 2 = 16 and Long stay at 8 × 10 = 80, because at equilibrium the outflow Stock/τ must equal the inflow of 8. Short stay reaches 95% of its equilibrium at about 6 months (3τ) and Long stay at about 30 months (also 3τ); after one τ each stock has covered about 63% of the way (about 10 and 51). With a five-year horizon and monthly decisions, the short-stay stock adjusts within about half a year, fast compared with the dynamics you care about, so it can be lumped into a neighbouring stock or treated as a delay. The long-stay stock takes years to settle and must stay as its own stock.",
      link: { label: "Residence Time", hash: "/m/residence" },
    },
    {
      prompt:
        "Serial disaggregation. Open Cascaded Levels with Pulse through (60 units in stage 1, τ = 4 months). Before running, sketch all three stages: which peaks first, when does stage 3 peak, and what is the total in the three stages plus what has left? Then run to check your sketch.",
      hint: "Material is conserved: what is in the stages plus what has left always equals 60. With three equal first-order stages, stage 3 peaks at about 2τ = 8 months.",
      answer:
        "Stage 1 starts at 60 and only falls, so it is highest at month 0. Stage 2 peaks at about 22 at month 4 (τ) and stage 3 peaks at about 16 at month 8 (2τ), each later and lower than the one before, because each stage drains into the next at a rate set by its own content. Material is conserved: at month 8 the three stages hold about 41 and about 19 has left, and at month 20 the stages hold about 7 and about 53 has left, always totalling 60. Chaining stages turns a sharp pulse into a delayed, spread-out output, which is why a cascade of first-order stages represents a higher-order material delay.",
      link: { label: "Cascaded Levels", hash: "/m/cascade" },
    },
    {
      prompt:
        "Challenge the clouds. Open the carbon dioxide bathtub case and list every cloud in its map. For each, name the real stock beyond it (fossil reserves, ocean, biosphere) and say whether it could plausibly constrain the flow within a century. Which cloud would you remove first?",
      hint: "The fossil source is effectively unlimited on a century scale; the ocean and land sinks are not, because their uptake slows as they fill.",
      answer:
        "The map has two clouds. The source of emissions stands for fossil fuel reserves (plus forests and soils cut for land use): those reserves are large enough that they would not constrain emissions within a century. The sink of net removal stands for the oceans and the land biosphere: these are real stocks that fill up, and as the ocean surface warms and becomes more acidic and forests mature, their uptake slows, so the sink can constrain removal within decades. Remove the sink cloud first: model the ocean and biosphere carbon stocks so that net removal depends on how full they are. In the simple model, emissions of 10 against removal of 5 raise the stock from 250 to 500 over 50 years, and a 30% cut still raises it to 350; with a sink that saturates, removal would fall and the rise would be faster still.",
      link: { label: "CO₂ as a bathtub", hash: "/apps/environment/co2-bathtub" },
    },
    {
      prompt:
        "Draw it yourself. Map the stocks and flows of gasoline from delivery to service stations through station tanks, car tanks and combustion. Add the information links drivers use when they hear of shortages. Using your map, judge whether a purchase cap per visit and odd-even days ease or worsen the shortage, and propose a better policy.",
      hint: "Ask which stock grows when drivers keep their tanks fuller, and what a cap per visit does to the number of visits.",
      answer:
        "Model answer: a chain of stocks, refinery and terminal stocks → deliveries → gasoline in station tanks → sales → gasoline in car tanks → combustion (driving) → exhaust (sink). The information links: news of shortages → drivers' fear of running out → desired fuel in their tanks → topping off more often and buying when the tank is still half full. That raises the stock in car tanks, which across millions of cars absorbs a large one-off volume, so station tanks run dry and queues form, which confirms the fear: a reinforcing loop. A purchase cap per visit makes it worse, because drivers make more visits to fill up and spend more time with partly full tanks. Odd-even days force drivers who can buy to fill up completely, so they also keep tanks fuller. Better policies leave car tanks alone: credible public information that total supply is adequate, a minimum purchase or allowing prices to rise briefly, so that the panic loop is not fed.",
    },
    {
      prompt:
        "Auxiliaries. Open Population Growth and set the Stable preset (birth = death = 3%). Confirm that any starting population stays put. Then, on paper, add auxiliaries so that the birth fraction falls as food per person falls. Mark the new loop's polarity and explain why you would not write it as one long equation.",
      hint: "Population → food per capita (−) → fractional birth rate (+) → births (+) → population (+): one negative link, so balancing.",
      answer:
        "With births and deaths both at 3% the net rate is zero, so the population stays at 100, and it would stay at any other starting value too, since births exactly equal deaths whatever the stock (it stays at 250 if started there). On paper: Population → (−) Food per capita (food divided by people); Food per capita → (+) Fractional birth rate; Fractional birth rate → (+) Births; Births → (+) Population. One negative link makes it a balancing loop that limits growth. Keeping food per capita and the fractional birth rate as separate auxiliaries keeps each causal link visible with its own polarity and units, lets you check and change the relationship (for example, a nonlinear effect of food on births) and lets you see the loop on the diagram. A single long equation for births would hide a link with a negative effect inside one with a positive effect, so the loop could not be identified.",
      link: { label: "Population Growth", hash: "/m/growth" },
    },
  ],
  pitfalls: [
    "Confusing a stock with its flow, for example treating the deficit and the debt as the same thing, which leads to underestimating delays and expecting stocks to follow their inflows.",
    "Drawing causal arrows straight into a stock (staff reduces the queue) instead of into the flow that actually changes it.",
    "Mixing time units across flows in one model, or giving a flow the units of its stock.",
    "Collapsing auxiliaries into long equations so that one link carries two opposite effects and the loops cannot be identified.",
    "Treating sources and sinks as harmless drawing conventions rather than as claims that the stocks beyond them are infinite.",
    "Starting with a highly detailed process map: it is expensive, quickly obsolete and rarely needed for the dynamics. Begin aggregate and add detail only for a reason.",
    "Giving clients either too much mathematics or diagrams they find patronising; know the audience, but never hide the model from a curious client.",
  ],
  molecules: ["bathtub", "residence", "cascade", "conversion", "split", "growth"],
};
