import type { StudyChapter } from "@/data/sterman/types";

export const CHAPTER: StudyChapter = {
  id: "ch05",
  number: "5",
  title: "Causal loop diagrams",
  part: "Part II Tools for systems thinking",
  pages: "137-190",
  summary:
    "Causal loop diagrams (CLDs) map the feedback structure behind a problem: variables joined by signed causal links, with the important loops labelled as reinforcing or balancing. They are quick to draw, good for eliciting a group's mental models, and good for explaining a dynamic hypothesis to people who will never read the equations. Link and loop polarity need precise definitions (including why polarity describes structure, not behaviour), and there are practical guidelines on causation, signs, naming loops, delays, variable names, layout, aggregation, explicit goals and perceived versus actual conditions. Three extended applications show the method at work: a student's workload, Adam Smith's invisible hand and the feedback structure of markets (with market failure through adverse selection), and traffic congestion, where compensating feedback defeats road building and a death spiral drains public transit.",
  bigIdeas: [
    {
      title: "Link polarity is a conditional statement about structure",
      text: "A positive link X → Y means that if X rises, Y ends up higher than it would otherwise have been (and lower if X falls); a negative link means the opposite. Mathematically, ∂Y/∂X > 0 or < 0. The qualifier \"than it would otherwise have been\" (p. 139) matters because Y usually has other causes, so it may fall even as X rises. Polarity says what would happen if something changed, not what actually happens; for that you need to know all the inputs, and usually a simulation.",
      pages: "138-140",
    },
    {
      title: "Polarity into a stock means 'adds to' or 'subtracts from'",
      text: "CLDs do not distinguish stocks from flows, which is why reading a link as same-direction movement fails. A fall in births does not reduce the population; births can only add to it. The correct reading of Births → (+) Population is that births add to the stock, so lower births leave the population lower than it would have been, even if it is still rising. Likewise Deaths → (−) Population means deaths subtract from it. This is also why the s/o ('same'/'opposite') notation is misleading and + and − are preferred.",
      pages: "139-141",
    },
    {
      title: "Only causal links belong in the diagram, never correlations",
      text: "Models must imitate the structure of the real system so that they respond correctly to new policies and conditions. Correlations summarise past behaviour and can break down when dormant loops become dominant. Ice cream sales and murders rise together because both follow temperature; a direct link would suggest absurd policies. Strong statistical fit is no proof of causation, especially among time series that move with the economy; correlations should emerge from simulating a causal structure.",
      pages: "141-142",
    },
    {
      title: "Determine loop polarity the right way: trace a change around the loop",
      text: "The quick method counts negative links: an even number makes a reinforcing loop, an odd number a balancing loop, because each negative link reverses the signal. It is easy to miscount or to have mislabelled a link, though. The reliable method is to imagine a small change in one variable and follow it all the way round: if it comes back reinforcing the original change the loop is positive, if it opposes it the loop is negative. Formally, loop polarity is the sign of the open-loop gain, the product of the signs of the links.",
      pages: "143-146",
    },
    {
      title: "An ambiguous link hides more than one causal pathway",
      text: "If a link seems positive in some conditions and negative in others, there is usually more than one path between the variables. Price and revenue are the classic case: price raises revenue per unit sold but lowers the number of units sold. Drawing both paths makes every polarity unambiguous; the price elasticity decides which path dominates, and each path can carry its own delay (sales respond to price slowly, revenue per unit instantly).",
      pages: "146-147",
    },
    {
      title: "Number and name the important loops",
      text: "Labels such as R1 and B2 let an audience find each loop, and short memorable names stand for whole chunks of structure. In a workshop on late design work, engineers named the loops Midnight Oil, Burnout, Corner Cutting and Haste Makes Waste. The names carried their reasoning to managers, replaced personal blame with discussion of nonlinear relationships between pressure, overtime, fatigue and errors, and gradually entered everyday decision making.",
      pages: "148-149",
    },
    {
      title: "Show the delays that matter",
      text: "Delays create inertia, oscillation, and trade-offs between short- and long-run effects, so mark any delay that is important to the hypothesis or long relative to the horizon. Gasoline demand responds to price weakly at first and strongly over a decade or more, as cars are replaced and settlement patterns change. Making these delays explicit shows why spending on fuel rises before it falls after a price increase, a worse-before-better pattern that makes fuel taxes politically difficult.",
      pages: "150-152",
    },
    {
      title: "Variable names: nouns, with a clear and positive direction",
      text: "Verbs belong in the links, not the variables: 'Costs' and 'Price', not 'Costs rise' and 'Price rises', which presume one direction of change. Each name must say what more and less mean ('Praise from the boss' rather than 'Feedback from the boss'). Prefer names whose normal sense is positive, 'Profit' rather than 'Losses' and 'Happiness' rather than 'Unhappiness', to avoid double negatives.",
      pages: "152-153",
    },
    {
      title: "Layout, aggregation and size decide whether a diagram communicates",
      text: "Use curved lines for feedback, make important loops circular, minimise crossings, avoid decorative symbols around variables, and expect to redraw many times. Add intermediate variables when a link is not self-evident (market share raises cumulative production, which builds experience and lowers unit costs), then chunk them again once understood. Because short-term memory holds only about seven chunks, build a story through a sequence of small diagrams rather than one wall-sized map.",
      pages: "153-155",
    },
    {
      title: "Make the goals of balancing loops explicit, and separate perceived from actual",
      text: "Every balancing loop compares a state with a goal. Drawing the goal ('Desired product quality', or room temperature for a cooling coffee) prompts the question of where the goal comes from and whether it drifts. Decay processes such as deaths or depreciation are exceptions with an implicit goal of zero. Likewise, show perceived conditions separately from actual ones: reporting delays and biases (filtered complaints, executives driving well-serviced cars) can leave management with a grossly flattering view of quality.",
      pages: "155-157",
    },
    {
      title: "Building CLDs from interviews",
      text: "Semi-structured interviews give rich data on decision processes, but each person sees only part of the system and may invent rationales, so interview widely and triangulate with other sources. Use the speaker's own words for variables while keeping to the naming rules, and support each link with a passage. If the aim is to represent a person's mental model, add no links they did not state; if the aim is a good model of the problem, complete the loops from all available knowledge and justify the additions.",
      pages: "157-159",
    },
    {
      title: "Policy resistance comes from compensating feedback",
      text: "Policies aimed at a symptom fail because other actors, pursuing their own goals, respond to the change in a way that offsets it. Each compensating loop may be weak, but together they can cancel the intervention, like squeezing a balloon. We keep treating symptoms because everyday experience is with simple systems where cause and effect are close and one balancing loop dominates; in complex systems causes lie in structure and policies, often far away in time and space.",
      pages: "189-190",
    },
  ],
  diagrams: [
    {
      kind: "cld",
      title: "Notation: a population with a birth loop and a death loop",
      pages: "137-140",
      cld: {
        vars: [
          { id: "b", label: "Birth rate", x: 100, y: 120 },
          { id: "p", label: "Population", x: 260, y: 120 },
          { id: "d", label: "Death rate", x: 420, y: 120 },
          { id: "fb", label: "Fractional birth rate", x: 110, y: 230 },
          { id: "lt", label: "Average lifetime", x: 410, y: 230 },
        ],
        links: [
          { from: "p", to: "b", sign: "+", curve: -50 },
          { from: "b", to: "p", sign: "+", curve: -50 },
          { from: "p", to: "d", sign: "+", curve: -50 },
          { from: "d", to: "p", sign: "−", curve: -50 },
          { from: "fb", to: "b", sign: "+" },
          { from: "lt", to: "d", sign: "−" },
        ],
        loops: [
          { type: "R", label: "R1", x: 180, y: 120 },
          { type: "B", label: "B1", x: 340, y: 120 },
        ],
        caption:
          '<span class="chip chipR">R1</span> More people mean more births, and births add to the population. <span class="chip chipB">B1</span> More people mean more deaths, and deaths subtract from it. Every link carries a sign; a longer <b>average lifetime</b> lowers the death rate below what it would have been. Which loop dominates decides whether the population grows or declines.',
      },
    },
    {
      kind: "cld",
      title: "Workload: Midnight Oil, Corner Cutting, Burnout and the deadline",
      pages: "163-167",
      cld: {
        size: [760, 420],
        vars: [
          { id: "cr", label: "Completion rate", x: 300, y: 50 },
          { id: "bl", label: "Assignment backlog", x: 520, y: 50 },
          { id: "ar", label: "Assignment rate", x: 680, y: 140 },
          { id: "ef", label: "Effort per task", x: 400, y: 150 },
          { id: "wp", label: "Work pressure", x: 520, y: 240 },
          { id: "tr", label: "Time remaining", x: 680, y: 240 },
          { id: "dd", label: "Due date", x: 690, y: 370 },
          { id: "ex", label: "Requests for extensions", x: 470, y: 370 },
          { id: "ww", label: "Workweek", x: 300, y: 300 },
          { id: "en", label: "Energy level", x: 100, y: 300 },
          { id: "pr", label: "Productivity", x: 100, y: 150 },
        ],
        links: [
          { from: "ar", to: "bl", sign: "+" },
          { from: "cr", to: "bl", sign: "−" },
          { from: "bl", to: "wp", sign: "+" },
          { from: "tr", to: "wp", sign: "−" },
          { from: "wp", to: "ww", sign: "+" },
          { from: "ww", to: "cr", sign: "+" },
          { from: "wp", to: "ef", sign: "−" },
          { from: "ef", to: "cr", sign: "−" },
          { from: "ww", to: "en", sign: "−", note: "delay" },
          { from: "en", to: "pr", sign: "+" },
          { from: "pr", to: "cr", sign: "+" },
          { from: "wp", to: "ex", sign: "+" },
          { from: "ex", to: "dd", sign: "+" },
          { from: "dd", to: "tr", sign: "+" },
        ],
        loops: [
          { type: "B", label: "B1", x: 380, y: 240 },
          { type: "B", label: "B2", x: 470, y: 110 },
          { type: "R", label: "R1", x: 190, y: 200 },
          { type: "B", label: "B4", x: 600, y: 310 },
        ],
        caption:
          '<span class="chip chipB">B1</span> Midnight Oil: pressure lengthens the workweek, work gets done, the backlog falls. <span class="chip chipB">B2</span> Corner Cutting: less effort per task raises the completion rate. <span class="chip chipR">R1</span> Burnout: long weeks drain energy and productivity after a delay, so pressure rises further. <span class="chip chipB">B4</span> My Dog Ate My Homework: a weak loop in which extensions move the due date and ease pressure, the root of Parkinson\'s law.',
      },
    },
    {
      kind: "cld",
      title: "Workload: Quality Control, Too Tired to Think and goal erosion",
      pages: "164-168",
      cld: {
        size: [760, 420],
        vars: [
          { id: "cr", label: "Completion rate", x: 130, y: 50 },
          { id: "bl", label: "Assignment backlog", x: 400, y: 50 },
          { id: "wp", label: "Work pressure", x: 400, y: 180 },
          { id: "ef", label: "Effort per task", x: 130, y: 180 },
          { id: "ww", label: "Workweek", x: 690, y: 180 },
          { id: "en", label: "Energy level", x: 690, y: 370 },
          { id: "q", label: "Quality of work", x: 130, y: 300 },
          { id: "gr", label: "Grades", x: 330, y: 370 },
          { id: "sat", label: "Satisfaction with grades", x: 360, y: 280 },
          { id: "dg", label: "Desired grades", x: 600, y: 280 },
        ],
        links: [
          { from: "cr", to: "bl", sign: "−" },
          { from: "bl", to: "wp", sign: "+" },
          { from: "wp", to: "ef", sign: "−" },
          { from: "ef", to: "cr", sign: "−" },
          { from: "wp", to: "ww", sign: "+" },
          { from: "ww", to: "en", sign: "−", curve: -20, note: "delay" },
          { from: "en", to: "gr", sign: "+" },
          { from: "ef", to: "q", sign: "+" },
          { from: "q", to: "gr", sign: "+" },
          { from: "gr", to: "sat", sign: "+" },
          { from: "sat", to: "ef", sign: "−" },
          { from: "dg", to: "sat", sign: "−", curve: -46 },
          { from: "sat", to: "dg", sign: "+", curve: -46 },
        ],
        loops: [
          { type: "B", label: "B2", x: 265, y: 115 },
          { type: "B", label: "B3", x: 215, y: 280 },
          { type: "R", label: "R2", x: 560, y: 220 },
          { type: "B", label: "B5", x: 499, y: 280 },
        ],
        caption:
          '<span class="chip chipB">B2</span> Corner Cutting, as before. <span class="chip chipB">B3</span> Quality Control: when grades disappoint, effort per task goes back up. <span class="chip chipR">R2</span> Too Tired to Think: tiredness lowers grades, extra effort slows completion, pressure and hours rise, energy falls further. <span class="chip chipB">B5</span> Goal erosion: persistent dissatisfaction lowers <b>desired grades</b>, which can relieve stress or entrench underachievement. (Midnight Oil and Burnout are hidden here for clarity.)',
      },
    },
    {
      kind: "cld",
      title: "The invisible hand: two balancing loops regulate a market",
      pages: "169-171",
      cld: {
        size: [600, 300],
        vars: [
          { id: "sub", label: "Price of substitutes", x: 140, y: 30 },
          { id: "rv", label: "Relative value", x: 140, y: 100 },
          { id: "dm", label: "Demand", x: 140, y: 260 },
          { id: "p", label: "Price", x: 300, y: 180 },
          { id: "pf", label: "Profits", x: 460, y: 100 },
          { id: "cost", label: "Cost of production", x: 460, y: 30 },
          { id: "sp", label: "Supply", x: 460, y: 260 },
        ],
        links: [
          { from: "p", to: "rv", sign: "−", curve: 10 },
          { from: "rv", to: "dm", sign: "+" },
          { from: "dm", to: "p", sign: "+", curve: 10 },
          { from: "p", to: "pf", sign: "+", curve: -10 },
          { from: "pf", to: "sp", sign: "+", curve: -20, note: "delay" },
          { from: "sp", to: "p", sign: "−", curve: -10 },
          { from: "sub", to: "rv", sign: "+" },
          { from: "cost", to: "pf", sign: "−" },
        ],
        loops: [
          { type: "B", label: "B1", x: 200, y: 180 },
          { type: "B", label: "B2", x: 400, y: 180 },
        ],
        caption:
          '<span class="chip chipB">B1</span> Demand: a higher price lowers value relative to substitutes, demand falls and the price is bid down. <span class="chip chipB">B2</span> Supply: a higher price raises profits, producers expand after a <b>delay</b>, and extra supply bids the price down. Substitute prices and production costs set the natural price; long delays or weak responses make the market prone to cycles.',
      },
    },
    {
      kind: "cld",
      title: "Traffic congestion: road building and the compensating feedbacks",
      pages: "179-184",
      cld: {
        size: [760, 420],
        vars: [
          { id: "dtt", label: "Desired travel time", x: 110, y: 150 },
          { id: "pr", label: "Pressure to build roads", x: 210, y: 50 },
          { id: "hc", label: "Highway capacity", x: 560, y: 50 },
          { id: "tt", label: "Travel time", x: 380, y: 150 },
          { id: "sz", label: "Size of reachable region", x: 640, y: 150 },
          { id: "at", label: "Attractiveness of driving", x: 150, y: 260 },
          { id: "tp", label: "Trips per day", x: 400, y: 230 },
          { id: "tl", label: "Average trip length", x: 410, y: 320 },
          { id: "tv", label: "Traffic volume", x: 570, y: 255 },
          { id: "cp", label: "Cars per person", x: 200, y: 370 },
          { id: "cars", label: "Cars in region", x: 540, y: 380 },
          { id: "pop", label: "Population of region", x: 660, y: 300 },
        ],
        links: [
          { from: "tv", to: "tt", sign: "+" },
          { from: "hc", to: "tt", sign: "−" },
          { from: "tt", to: "pr", sign: "+" },
          { from: "dtt", to: "pr", sign: "−" },
          { from: "pr", to: "hc", sign: "+", note: "delay" },
          { from: "tt", to: "at", sign: "−" },
          { from: "at", to: "tp", sign: "+" },
          { from: "tp", to: "tv", sign: "+" },
          { from: "at", to: "tl", sign: "+" },
          { from: "tl", to: "tv", sign: "+" },
          { from: "at", to: "cp", sign: "+" },
          { from: "cp", to: "cars", sign: "+" },
          { from: "cars", to: "tv", sign: "+" },
          { from: "tt", to: "sz", sign: "−" },
          { from: "hc", to: "sz", sign: "+" },
          { from: "sz", to: "pop", sign: "+" },
          { from: "pop", to: "cars", sign: "+" },
        ],
        loops: [
          { type: "B", label: "B1", x: 380, y: 85 },
          { type: "B", label: "B2", x: 390, y: 190 },
          { type: "B", label: "B3", x: 312, y: 262 },
          { type: "B", label: "B4", x: 260, y: 330 },
          { type: "B", label: "B5", x: 560, y: 190 },
          { type: "R", label: "R1", x: 520, y: 110 },
        ],
        caption:
          '<span class="chip chipB">B1</span> Capacity expansion: congestion creates pressure, roads are built, travel time falls. Then the system pushes back: <span class="chip chipB">B2</span> more discretionary trips, <span class="chip chipB">B3</span> longer trips, <span class="chip chipB">B4</span> people give up the bus and buy cars, <span class="chip chipB">B5</span> people move to the newly reachable suburbs. <span class="chip chipR">R1</span> Open the hinterlands: each round of roads widens the commuting region and so feeds the next round of congestion.',
      },
    },
    {
      kind: "cld",
      title: "The mass transit death spiral",
      pages: "185-187",
      cld: {
        size: [700, 330],
        vars: [
          { id: "tt", label: "Travel time", x: 80, y: 80 },
          { id: "tv", label: "Traffic volume", x: 90, y: 250 },
          { id: "at", label: "Attractiveness of driving", x: 280, y: 165 },
          { id: "adq", label: "Adequacy of public transit", x: 340, y: 50 },
          { id: "cut", label: "Service cuts", x: 620, y: 70 },
          { id: "def", label: "Transit deficit", x: 620, y: 200 },
          { id: "fare", label: "Fare", x: 470, y: 190 },
          { id: "rid", label: "Transit ridership", x: 300, y: 290 },
          { id: "rev", label: "Transit revenue", x: 520, y: 295 },
        ],
        links: [
          { from: "at", to: "tv", sign: "+" },
          { from: "tv", to: "tt", sign: "+" },
          { from: "tt", to: "at", sign: "−" },
          { from: "at", to: "rid", sign: "−" },
          { from: "rid", to: "rev", sign: "+" },
          { from: "rev", to: "def", sign: "−" },
          { from: "def", to: "fare", sign: "+" },
          { from: "fare", to: "at", sign: "+" },
          { from: "def", to: "cut", sign: "+", curve: -46 },
          { from: "cut", to: "def", sign: "−", curve: -46 },
          { from: "cut", to: "adq", sign: "−" },
          { from: "adq", to: "at", sign: "−" },
        ],
        loops: [
          { type: "B", label: "B4", x: 125, y: 165 },
          { type: "R", label: "R2", x: 470, y: 115 },
          { type: "R", label: "R3", x: 420, y: 250 },
          { type: "B", label: "B6", x: 620, y: 135 },
        ],
        caption:
          '<span class="chip chipB">B6</span> Cost cutting narrows the deficit, but <span class="chip chipR">R2</span> cutting routes and frequency makes transit less adequate, driving more attractive, and ridership and revenue lower, widening the deficit. <span class="chip chipR">R3</span> Raising fares chokes off ridership the same way. Transit costs are mostly fixed, so these vicious cycles are strong. <span class="chip chipB">B4</span> links the spiral back to road traffic: more drivers, more congestion.',
      },
    },
  ],
  formulations: [
    {
      name: "Link polarity",
      equations: [
        "X → (+) Y: ∂Y/∂X > 0; for a flow into a stock, Y = ∫(X + …) ds + Y(t0)",
        "X → (−) Y: ∂Y/∂X < 0; for a flow out of a stock, Y = ∫(−X + …) ds + Y(t0)",
      ],
      explain:
        "Polarity is the sign of a partial derivative, all else held equal. For accumulations the sign says whether the flow adds to or subtracts from the stock, which is why a fall in an inflow leaves the stock lower than it would have been rather than making it fall.",
      molecule: "growth",
      pages: "139",
    },
    {
      name: "Loop polarity as the sign of the open-loop gain",
      equations: [
        "Polarity = SGN(∂x₁ᵒ / ∂x₁ⁱ)",
        "= SGN(∂x₁ⁱ/∂xₙ) · SGN(∂xₙ/∂xₙ₋₁) · … · SGN(∂x₂/∂x₁ⁱ)",
      ],
      explain:
        "Break the loop at any variable x₁, push a small change into the input side and see how it returns at the output side. By the chain rule the gain is the product of the link gains, so its sign is the product of the link signs. An odd number of negative links gives a negative (balancing) loop; tracing the change by hand is the same calculation, done in a way that exposes mislabelled links.",
      pages: "145-146",
    },
    {
      name: "Splitting an ambiguous link",
      equations: ["Revenue = Price × Sales", "Sales = f(Price), with f decreasing"],
      explain:
        "Price affects revenue through two paths of opposite sign. If demand is inelastic (elasticity below one) the direct path dominates and a price rise increases revenue; if it is elastic the sales path dominates and revenue falls.",
      pages: "146-147",
    },
    {
      name: "Traffic volume from its physical components",
      equations: ["Traffic volume (vehicle-miles/day) = Vehicles × Trips per vehicle per day × Miles per trip", "Vehicles = Population × Vehicles per person"],
      explain:
        "Writing the units first shows which variables congestion can move: trips per day and trip length respond within months, vehicles per person over years, and population over decades as the reachable region grows. Each factor closes a compensating loop around travel time.",
      pages: "180-181",
    },
  ],
  cases: [
    {
      title: "Managing your workload: the ant and the grasshopper",
      text: "A student over a 13-week semester can work steadily as work is assigned (the ant) or defer it (the grasshopper). The reference modes show the ant's backlog staying small, hours and energy steady and grades rising, while the grasshopper's backlog builds until about week 10, when completions overtake assignments, then falls but is still positive when the term ends, with long hours, collapsing energy and falling grades. The causal map adds six loops: Midnight Oil and Corner Cutting (balancing), Burnout and Too Tired to Think (reinforcing), Quality Control and a weak My Dog Ate My Homework loop (balancing). Making the goal explicit adds goal erosion, in which aspirations drift to past achievement.",
      pages: "159-168",
    },
    {
      title: "Market failure and the Medigap death spiral",
      text: "Akerlof showed that when sellers know quality and buyers do not, adverse selection can destroy a market. In Massachusetts, Medex (Blue Cross/Blue Shield's supplementary insurance for seniors) covered about a third of seniors in 1987 at about $50 a month. As health costs rose, premiums rose; healthier seniors moved to cheaper plans, leaving a sicker and costlier pool, which pushed premiums higher still. Subscribers fell from nearly 300,000 in 1988 to about 158,000 in 1997 (the unlimited-drug Gold plan from about 250,000 to 65,000), premiums reached $228 a month, and half a dozen insurers shrank to one.",
      pages: "174-177",
    },
    {
      title: "Traffic: why more roads bring more traffic",
      text: "In 1990 about 87% of US workers commuted by motor vehicle (85% of them alone) and only 5% by public transport; since 1970 registered vehicles had grown 70% and vehicle-miles 90%. An econometric study found an elasticity of traffic with respect to highway capacity of 0.9 within 5 years. Boston's Route 128 was widened from four to eight lanes and filled again, and a second ring road further out opened another round of suburban growth. London's M25, meant for through traffic, became one of the busiest roads in Europe, and congestion on a widened section rose. Carpool lanes, intelligent highways and similar technical fixes feed the same loops.",
      pages: "177-189",
    },
    {
      title: "Speculative bubbles and the thoroughbred market",
      text: "Not every market is held in check by balancing loops alone. In speculation, expectations of rising prices lead dealers to buy, which raises the price and attracts more buyers, a reinforcing loop that runs until the rise stalls and selling cascades. Prices of top US yearling thoroughbreds rose nearly tenfold in nominal terms from 1974 to 1984 (to about $450,000; more than fourfold in real terms), then fell by nearly half in real terms in four years.",
      pages: "173-174",
    },
  ],
  exercises: [
    {
      prompt:
        "Practise reading polarity. Open Population Growth and run Growing, then lower the birth rate from 5% to 4%. The population is still rising. Explain, using the precise definition of link polarity, why Births → (+) Population is still correct.",
      answer:
        "With births at 4% and deaths at 2% the population still rises (about 122 at year 10 instead of about 135 with births at 5%). The link Births → (+) Population is defined by what the stock does compared with what it would otherwise have been: a positive link into a stock means the inflow adds to it, so more births make the population higher than it would have been, and fewer births make it lower than it would have been. It does not say the population falls when births fall; the population keeps growing as long as births exceed deaths. Polarity describes the structure of the link, not the behaviour of the variables.",
      link: { label: "Population Growth", hash: "/m/growth" },
    },
    {
      prompt:
        "Trace loop polarity the right way. For each loop in the workload diagrams, start with a small increase in Work pressure and follow it around. Then start from a different variable in the same loop and check you get the same answer. Which link signs are easiest to get wrong?",
      answer:
        "Starting from a small increase in Work pressure, follow each link and keep track of whether each variable ends up higher or lower than it would otherwise have been. Midnight Oil: more pressure → more overtime → more work completed → less work remaining → less pressure, so it is balancing. Corner Cutting: more pressure → less time per task → faster completion → less work remaining → less pressure, also balancing. Burnout: more overtime → more fatigue (with a delay) → lower productivity → less work completed → more work remaining → more pressure, so it is reinforcing. Haste Makes Waste: less time per task → more errors → more rework → more work remaining → more pressure, also reinforcing. Starting from a different variable in the same loop must give the same polarity. The links easiest to get wrong are those through outflows and inverse effects (work completed lowers work remaining; less time per task raises errors), so trace each one in words rather than counting minus signs.",
      link: { label: "Causal loop diagrams", hash: "/methods/causal-loops" },
    },
    {
      prompt:
        "Feel Burnout dominate Midnight Oil. Open the crunch case and compare 'Normal hours', '20% overtime' and '40% overtime'. After a few months, is more overtime still producing more output? Where is the delay in the loop?",
      hint: "Fatigue builds over the 'time to fatigue'; the extra hours pay off at first and then productivity falls.",
      answer:
        "Output jumps at once to 1.2, 1.4 or 1.6 times normal, then falls as fatigue builds over the 4-week time to get fatigued. With 40% overtime output drops below normal at about week 5 and ends at about 0.84 times normal at week 20; with 20% it ends at about 0.96, so after a few months more overtime produces less, not more. Over the 20 weeks 40% overtime produced slightly less in total than normal hours (about 19.0 against 20 weeks of normal output), and 60% produced about 16.6. The delay is the build-up of fatigue between hours worked and productivity. Because the gain is immediate and the cost delayed, the Midnight Oil loop dominates at first and the Burnout loop dominates later, which is why crunch feels productive while it is starting to backfire.",
      link: { label: "Crunch case", hash: "/apps/projects/crunch" },
    },
    {
      prompt:
        "Schedule pressure as a balancing loop. In the deadline case compare 'Realistic deadline (15 weeks)' with 'Tight deadline (5 weeks)'. Which of the workload loops (Midnight Oil, Corner Cutting) does the model represent, and what would you have to add to show Burnout or Haste Makes Waste?",
      answer:
        "With the realistic 15-week deadline the work finishes at about week 15; with the tight 5-week deadline about 150 tasks are still left at week 5 and the work ends at about week 8.3, because the pace cannot rise above twice normal. The model has one balancing loop in which schedule pressure raises the work rate: it stands for Midnight Oil and Corner Cutting lumped together, since both raise the completion rate when the gap grows, and it gives that extra pace for free. To show Burnout you would add a fatigue stock fed by hours worked that lowers productivity after a delay (as in the crunch case); to show Haste Makes Waste you would add an error fraction that rises with pressure and a rework stock that feeds undiscovered errors back into work remaining. Those are the reinforcing side effects that make tight deadlines backfire.",
      link: { label: "Deadline pressure case", hash: "/apps/projects/deadline-pressure" },
    },
    {
      prompt:
        "The invisible hand with a delay. Open Smooth Pricing and run Demand shock, then Sticky (slow). Which part of the market structure does the price adjustment time stand for, and how would the long delays in the supply loop change how quickly the market reaches its natural price?",
      answer:
        "The demand shock sets the indicated price 40% above the reference, so the price moves from 10 towards 14. With a 4-year adjustment time it closes 63% of the gap by year 4 and 95% by about year 12; with the sticky 10-year setting it takes 10 and about 30 years. The price adjustment time stands for the delays in the price-setting loop: how slowly sellers notice the imbalance and revise list prices and contracts. It is only one of the delays in a real market: supply responds through investment, capacity construction and learning, which take years, and demand adjusts as people change habits and equipment. With those long delays the balancing loops act on old information, so the market approaches its natural price slowly and often overshoots it rather than settling smoothly as this first-order model does.",
      link: { label: "Smooth Pricing", hash: "/m/smoothPricing" },
    },
    {
      prompt:
        "A supply loop with long delays. In the hog cycle case run 'Producers ignore the pipeline', then 'Short lag (5 months)'. Relate the result to the point that markets with weak short-run and strong long-run responses are prone to persistent disequilibrium.",
      answer:
        "When producers ignore hogs on the way, inventory starts at 60, peaks at about 114 at month 21, and keeps cycling with a period of about 42 months, slowly damping (102, then 100). With a 5-month lag the first peak is only about 109 at month 15.5, the period shortens to about 31 months and the cycle dies out much faster. The strong supply response comes only after the biological lag, while producers keep responding to today's gap, so by the time the hogs arrive the market has already been corrected and prices swing the other way. Markets with a weak short-run response (supply fixed until the hogs mature) and a strong long-run response (many producers add sows) are therefore prone to persistent disequilibrium, and counting the pipeline (the 'count hogs on the way' preset) removes the overshoot.",
      link: { label: "Hog cycle case", hash: "/apps/economics/hog-cycle" },
    },
    {
      prompt:
        "Pen and paper: draw a CLD for the Medigap death spiral with premiums, the average health of subscribers, the number of subscribers, insurer losses and the number of insurers. Mark every link and loop polarity and the main delays, then use it to judge a state subsidy for premiums and a rule that all insurers must accept every applicant.",
      hint: "The core is a reinforcing loop: higher premium, healthier people leave, average cost per subscriber rises, higher premium.",
      answer:
        "Model answer: Premium → (+) Healthy subscribers leaving (a link to the outflow); fewer healthy subscribers → average health of subscribers falls (−); worse average health → (+) claims per subscriber → (+) insurer losses → (+) premium, with a delay of a year or more because premiums are reset annually from last year's claims. That is the core reinforcing loop, the death spiral. A second reinforcing loop runs through the number of insurers: higher losses → (−) insurers in the market → less competition and a smaller pool → higher premiums. Balancing loops are weak here: higher premiums raise revenue per subscriber, but the healthy leave faster than revenue rises. A premium subsidy weakens the first link and slows healthy people leaving, but it treats the symptom and its cost grows if the spiral continues. Forcing insurers to accept every applicant does not stop the healthy leaving and can strengthen the spiral, unless it is paired with something that keeps the healthy in the pool (a mandate, a single pool or risk adjustment).",
    },
    {
      prompt:
        "Policy resistance: add a carpool (HOV) lane to the traffic diagram. Trace what happens to trips per day, travel time and attractiveness of driving, and decide which compensating loops absorb the gain. Then compare with a congestion toll and with lower speed limits.",
      answer:
        "Model answer: an HOV lane adds road capacity, so travel time falls at first; shorter travel time raises the attractiveness of driving, which raises trips per day and car use (people switch from transit, travel at peak hours, or move further out), and the extra traffic pushes travel time back up. Those compensating balancing loops, acting with delays of months for trips and years for where people live and work, absorb most of the gain, which is the classic example of policy resistance. A congestion toll acts on the attractiveness of driving directly: it cuts trips instead of adding capacity that new trips fill, so the same loops work for the policy rather than against it. Lower speed limits raise travel time and reduce the attractiveness of driving, but also cut capacity, so they may shift demand rather than solve congestion. The key point is to look for the actors who respond to the change in travel time, not only the cars on the road today.",
      link: { label: "Policy resistance case", hash: "/apps/social/policy-resistance" },
    },
  ],
  pitfalls: [
    "Reading a positive link as saying that X and Y move together; with multiple causes and with stocks, the correct reading compares Y with what it would have been without the change in X.",
    "Drawing correlations as causal links (ice cream sales cause murders) or trusting a high R² as evidence of causation.",
    "Leaving links unsigned, or declaring a link 'either positive or negative' instead of separating the causal pathways.",
    "Determining loop polarity only by counting negative signs, which hides miscounts and mislabelled links.",
    "Naming variables with verbs ('costs rise'), without a clear direction ('mental attitude'), or with negatives ('unhappiness', 'losses').",
    "Putting every loop into one huge diagram; build the story in small diagrams and chunk them afterwards.",
    "Leaving the goals of balancing loops implicit, and confusing perceived conditions with actual ones.",
    "Adding links to a diagram of someone's mental model that the person never stated.",
  ],
  molecules: ["growth", "decay", "schedulePressure", "prodFatigue", "smoothPricing", "stockmgmt", "closegap"],
};
