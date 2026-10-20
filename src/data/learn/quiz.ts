import type { Quiz } from "@/data/learn/types";

// per module: what a learner should be able to do, and a short self-check
export const OBJECTIVES: Record<string, string[]> = {
  surprise: [
    "Explain why policies that ignore feedback are often delayed, diluted or defeated by the reactions they provoke.",
    "Distinguish single-loop learning from double-loop learning and give an example of each.",
    "Identify the barriers to learning in complex systems, including delays, filtered information and the search for confirming evidence.",
    "Describe why a causal map alone cannot tell you how a system will behave, and what simulation adds.",
  ],
  "stocks-flows": [
    "Classify variables as stocks or flows with the snapshot test and give them consistent units.",
    "Sketch a stock's path from graphs of its inflow and outflow by graphical integration.",
    "Infer the net flow at any moment from the slope of a stock's trajectory.",
    "Explain why a constant level can hide a large throughput and why a stock does not return to its old value when its inflow does.",
    "Calculate the equilibrium level and residence time of a stock with a first-order outflow.",
  ],
  loops: [
    "Assign polarity to causal links, including links into stocks, by comparing with what would otherwise have happened.",
    "Determine loop polarity by tracing a change around the loop, and check it by counting negative links.",
    "Split an ambiguous link into separate causal pathways whose signs are clear.",
    "Draw causal loop diagrams with noun variable names, explicit goals, important delays and numbered loops.",
    "Explain how compensating feedback produces policy resistance.",
  ],
  patterns: [
    "Recognise the six common modes of behaviour in a time series.",
    "Link each fundamental mode to its structure: a reinforcing loop, a balancing loop, or a balancing loop with delay.",
    "Explain what separates S-shaped growth, overshoot and oscillation, and overshoot and collapse.",
    "Identify latent balancing loops that have not yet shown up in the data but could change the behaviour.",
  ],
  "first-order": [
    "Calculate doubling times with the rule of 70 and half-lives as about 0.7 times the time constant.",
    "Predict how much of a gap a goal-seeking stock has closed after one, two and three time constants.",
    "Read equilibria and their stability from a phase plot of net flow against the stock.",
    "Explain why a continuous first-order system cannot oscillate and why S-shaped growth needs a nonlinear shift in loop dominance.",
  ],
  delays: [
    "Distinguish material delays from information delays and choose the right one for a process.",
    "Predict the output of pipeline, first-order and higher-order delays after a pulse or a step.",
    "Calculate the contents of a delay in equilibrium with Little's law.",
    "Explain how exponential smoothing forms perceptions and why it lags a growing input.",
  ],
  "s-shaped": [
    "Explain S-shaped growth as a shift in dominance from a reinforcing loop to a balancing loop.",
    "Calculate the inflection point and the maximum growth rate of the logistic model.",
    "Calculate the contact number of an epidemic and the immune share needed for herd immunity.",
    "Explain how the external influence in the Bass model solves the startup problem of logistic diffusion.",
    "Explain why a good historical fit does not validate a diffusion model.",
  ],
  "lock-in": [
    "Explain path dependence in terms of locally unstable equilibria and reinforcing feedback.",
    "Read stable and unstable equilibria from a phase plot of sales share against share of the installed base.",
    "Explain why reversing a path-dependent outcome gets more expensive as the stocks behind it accumulate.",
    "Calculate market shares from a logit attractiveness formulation and show how a network effect strengthens as the market grows.",
    "Identify the reinforcing growth engines of a firm and the conflicts between them.",
  ],
  chains: [
    "Build an aging chain and explain when cohorts are needed instead of a single well-mixed stock.",
    "Calculate steady-state cohort sizes and shares with Little's law.",
    "Explain population momentum and how the growth rate shapes an age or rank structure.",
    "Formulate a coflow that adds the marginal attribute on inflows and removes the average attribute on outflows.",
    "Explain why modelling an embodied attribute as a smooth is a structural error.",
  ],
  oscillation: [
    "Formulate a stock management rule that replaces expected losses, corrects the stock gap and corrects the supply line gap.",
    "Calculate the steady-state error of a rule without loss replacement and the desired supply line from Little's law.",
    "Explain why oscillation needs both a delay and a decision rule that underweights the supply line.",
    "Calculate the amplification created by stock adjustment and explain why it grows upstream in a supply chain.",
    "Evaluate supply chain policies such as sharing sales data and cutting delays.",
  ],
  archetypes: [
    "Identify the classic system archetypes from a story or a causal loop diagram.",
    "Explain the loop structure behind each archetype and the behaviour it produces over time.",
    "Distinguish archetypes that look alike, such as fixes that fail and shifting the burden.",
    "Propose leverage points for each archetype and explain why the obvious fix often backfires.",
    "Run a molecule that reproduces part of an archetype and relate its behaviour to the story.",
  ],
  process: [
    "Write a model purpose that names the problem behaviour and the decision it should inform.",
    "Sketch reference modes and choose a time horizon from the delays in the system.",
    "Formulate an endogenous dynamic hypothesis and record the model boundary in a boundary chart.",
    "Explain why a broad boundary matters more than fine detail, using the leasing and maintenance cases.",
    "Describe how involving clients and anticipating worse-before-better behaviour affect implementation.",
  ],
  formulation: [
    "Apply the Baker criterion so that every decision rule uses only information the real actors have.",
    "Choose standard rate formulations and explain the steady-state error of a pure gap rule.",
    "Formulate nonlinear effects as normalised table functions, combined multiplicatively and checked at extreme conditions.",
    "Protect stocks from going negative with first-order control of their outflows rather than IF-THEN-ELSE logic.",
    "Explain how floating goals erode performance and how hill climbing finds a goal no one can calculate.",
  ],
  behaviour: [
    "Explain bounded rationality and why decision rules should describe how people actually decide.",
    "Use partial model tests to check whether a decision rule is intendedly rational.",
    "Calculate the open-loop gain of a growth loop and the steady-state lag of adaptive expectations.",
    "Explain how the TREND function forms a perceived growth rate and why it misses turning points.",
    "Describe how locally rational policies can combine into a dysfunctional whole, and how attribution error hides the cause.",
  ],
  cycles: [
    "Explain how vacancies act as the supply line for labour and calculate equilibrium vacancies with Little's law.",
    "Explain why a production rule that counts work in process can still oscillate when labour has to be recruited.",
    "Predict how a flexible workweek changes the stability of the inventory-workforce system.",
    "Identify the loops that balance a commodity market and explain why commodity cycles last far longer than the production lag.",
    "Distinguish the integral control of price by inventory from the proportional control of price by costs.",
  ],
  testing: [
    "Explain why no model can be validated and what building justified confidence means instead.",
    "Apply the core tests: boundary adequacy, structure assessment, dimensional consistency, extreme conditions and integration error.",
    "Interpret fit statistics, including the Theil decomposition of mean square error.",
    "Use loop knockout and sensitivity analysis to find which assumptions change behaviour or policy conclusions.",
    "Distinguish reflective from protective uses of a model.",
  ],
  mechanics: [
    "Carry out Euler integration by hand and explain why it undershoots exponential growth.",
    "Choose a time step from the shortest time constant and check it with the halving test.",
    "Recognise spurious oscillation created by a time step that is too large.",
    "Explain why pink noise rather than white noise should drive a model, and estimate a correlation time from an autocorrelation function.",
    "Explain how a system filters and amplifies noise so that its own modes appear.",
  ],
  frontier: [
    "Describe open questions in nonlinear dynamics, agent-based modelling and the study of decision making.",
    "Explain why more computing power should speed learning rather than produce bigger models.",
    "Evaluate what automated tools such as calibration, sensitivity analysis and loop-dominance displays can and cannot do.",
    "Explain why implementation, education and honest reporting of failures remain central challenges.",
  ],
};

export const QUIZ: Record<string, Quiz[]> = {
  surprise: [
    {
      q: "A city widens a congested highway. Traffic flows freely for a year, then congestion returns to its old level. Which explanation best fits the feedback view?",
      options: [
        "The new lanes were badly built, so capacity fell back during the year.",
        "Congestion is essentially random and happened to return.",
        "Shorter travel times made driving more attractive, so more and longer trips refilled the road.",
        "The project was too small; twice as many lanes would have fixed congestion for good.",
      ],
      answer: 2,
      why: "Faster travel draws extra trips, longer commutes and more cars, compensating loops that restore congestion: policy resistance. A bigger dose of the same policy feeds the same loops, so it usually meets the same response.",
    },
    {
      q: "Which of these is double-loop learning?",
      options: [
        "After repeated stockouts, a retailer rethinks how supplier lead times respond to its own orders and rewrites its ordering rule.",
        "A thermostat switches the heating on when the room falls below the set point.",
        "A sales manager raises next month's order after this month's shortfall, using the same rule as always.",
        "A driver corrects the steering a little each time the car drifts toward the edge of the lane.",
      ],
      answer: 0,
      why: "Double-loop learning revises the mental model and so the decision rule itself. The other cases adjust decisions within an unchanged rule, which is single-loop learning however sensible each correction is.",
    },
    {
      q: "Rule to test: every invoice over $1,000 carries a manager's signature. Four invoices each show only one side: '$1,500', '$400', 'signed' and 'unsigned'. Which must you turn over?",
      options: [
        "'$1,500' and 'signed'",
        "'$1,500' only",
        "'signed' and 'unsigned'",
        "'$1,500' and 'unsigned'",
      ],
      answer: 3,
      why: "Only the $1,500 invoice and the unsigned invoice could break the rule. Turning over 'signed' is the tempting choice, but it can only confirm, since the rule says nothing about signed invoices under $1,000.",
    },
    {
      q: "A team runs a management flight simulator twenty times in an afternoon, moving sliders until the results look good, and writes nothing down. What is the main risk?",
      options: [
        "They will tune their decisions to the simulator's random seed.",
        "They fall into the video game syndrome: many trials and little reflection, so their mental models barely change.",
        "The simulator compresses time, so nothing learned in it can transfer to the real world.",
        "Running more trials always slows learning because of information overload.",
      ],
      answer: 1,
      why: "Virtual worlds speed learning only when people state hypotheses, record predictions and reflect on surprises. Compressing time is the simulator's strength, not the problem.",
    },
  ],

  "stocks-flows": [
    {
      q: "A reservoir's inflow falls steadily from 50 to 30 units a day while its outflow stays at 20 units a day. During this period the level…",
      options: [
        "falls, because the inflow is falling.",
        "keeps rising, but more slowly.",
        "holds steady until the inflow drops below the outflow.",
        "rises at first, then returns to where it started.",
      ],
      answer: 1,
      why: "A stock rises whenever inflow exceeds outflow; a falling inflow only slows the rise. Expecting the level to fall assumes the stock follows its inflow, the classic confusion of a stock with its flow.",
    },
    {
      q: "Apply the snapshot test. Which of these is a flow?",
      options: [
        "A manager's current forecast of demand",
        "The national debt",
        "Staff morale",
        "The government deficit",
      ],
      answer: 3,
      why: "The deficit is the rate at which debt accumulates, in money per year, and cannot be read from a single frozen moment. A forecast and morale are intangible but persist until something updates them, so they are stocks.",
    },
    {
      q: "Patients are admitted at 8 a month and leave at (patients ÷ 10 months). What is the equilibrium number of patients, and if admissions stop, roughly how long until that number halves?",
      options: [
        "80 patients; about 7 months",
        "80 patients; 10 months",
        "18 patients; about 7 months",
        "0.8 patients; about 5 months",
      ],
      answer: 0,
      why: "The equilibrium stock is inflow times residence time, 8 × 10 = 80, and a first-order drain halves in about 0.7 × 10 = 7 months. After a full 10 months about 37% remains, not half.",
    },
    {
      q: "The net flow into a stock swings up and down around zero with a 12-month period. When does the stock reach its peak?",
      options: [
        "At the same moment the net flow peaks.",
        "Six months after the net flow peaks, when the net flow is at its lowest.",
        "Three months after the net flow peaks, when the net flow falls to zero.",
        "Never: integration smooths the cycle away completely.",
      ],
      answer: 2,
      why: "The stock keeps rising while the net flow is positive, so it peaks when the net flow crosses zero, a quarter cycle after the flow's peak. Integration shrinks fast cycles but does not remove them.",
    },
  ],

  loops: [
    {
      q: "In a population model, Births → (+) Population. The birth rate is cut from 5% to 4% a year, yet the population keeps rising. Is the positive link still correct?",
      options: [
        "No, the link is now negative because births fell while population rose.",
        "No, the link is ambiguous and should be left unsigned.",
        "Yes: births add to the population, so fewer births leave it lower than it would otherwise have been.",
        "Yes, but only once the population starts to fall.",
      ],
      answer: 2,
      why: "Polarity compares Y with what it would have been without the change in X, and an inflow always adds to its stock. Reading a positive link as 'they move together' fails whenever stocks or other causes are involved.",
    },
    {
      q: "A loop runs Inventory → (−) Price → (−) Customer demand → (−) Inventory. What is its polarity?",
      options: [
        "Balancing: a rise in inventory lowers price, raises demand and so pulls inventory back down.",
        "Reinforcing, because negative links outnumber positive ones.",
        "Reinforcing, because two of the negative signs cancel and leave a positive.",
        "It cannot be determined without a simulation.",
      ],
      answer: 0,
      why: "Three negative links is an odd number, so the loop is balancing, and tracing a rise in inventory round the loop confirms it comes back opposed. Cancelling only two of the three negatives is the miscount that tracing guards against.",
    },
    {
      q: "A colleague says the link from price to revenue is 'sometimes positive, sometimes negative'. What is the best fix?",
      options: [
        "Mark the link with a question mark and move on.",
        "Use whichever sign last year's data showed.",
        "Replace the link with a correlation coefficient.",
        "Draw two paths: price raises revenue per unit (+), and price lowers units sold (−), each with its own delay.",
      ],
      answer: 3,
      why: "An ambiguous link usually hides more than one causal pathway; separating them makes every sign clear and lets the price elasticity decide which dominates. Last year's data record one outcome, not the structure, and can flip when conditions change.",
    },
    {
      q: "Which variable name best follows the guidelines for causal loop diagrams?",
      options: [
        "Costs rise",
        "Customer satisfaction",
        "Unhappiness of staff",
        "Feedback from the boss",
      ],
      answer: 1,
      why: "Good names are nouns with a clear, positively framed direction. 'Costs rise' builds a direction into the name, 'unhappiness' invites double negatives, and 'feedback from the boss' does not say what more of it means.",
    },
  ],

  patterns: [
    {
      q: "A variable repeatedly overshoots and undershoots its goal. Which structure should you look for first?",
      options: [
        "A single reinforcing loop with a large gain",
        "Two reinforcing loops competing with each other",
        "A balancing loop with no delays and a very short adjustment time",
        "A balancing loop with a significant delay in perception, decision or action",
      ],
      answer: 3,
      why: "Oscillation arises when corrective action continues after the goal is reached, which needs delay inside a balancing loop. A balancing loop without delay, however fast, only approaches its goal.",
    },
    {
      q: "A fishing fleet grows, the fish stock declines, and then both collapse. What separates this overshoot and collapse from S-shaped growth?",
      options: [
        "The growing fleet consumes the resource that sets its own limit.",
        "The reinforcing investment loop is stronger.",
        "The limiting loop acts with no delay.",
        "Random shocks push the system past its limit.",
      ],
      answer: 0,
      why: "When growth erodes the carrying capacity itself, a second balancing loop removes the limit and the population must fall. A stronger reinforcing loop only speeds the approach; with a fixed, fast limit the result is still an S.",
    },
    {
      q: "A firm's sales look like a straight line over the past four years. What is the soundest interpretation?",
      options: [
        "Sales are driven by a constant inflow with no feedback, so they will keep growing in a straight line.",
        "It may be part of an accelerating or a slowing curve; widen the time window before concluding anything.",
        "Linear growth is the most common mode in business data, so a linear forecast is safe.",
        "A straight line shows a balancing loop close to its equilibrium.",
      ],
      answer: 1,
      why: "True linear growth requires a net increase that does not depend on the state, which is rare; a short window often hides acceleration or an approaching limit. Concluding that there is no feedback because the line looks straight is the trap.",
    },
    {
      q: "A population reaches its carrying capacity smoothly in an S-curve. What change to the structure would turn this into overshoot and oscillation around the capacity?",
      options: [
        "A higher carrying capacity",
        "A smaller starting population",
        "A delay before the limiting loop responds to scarcity",
        "Removing the reinforcing loop",
      ],
      answer: 2,
      why: "With the same loops, a late response to scarcity lets the state keep growing past capacity and then swing around it. Raising the capacity moves the plateau but leaves the shape unchanged.",
    },
  ],

  "first-order": [
    {
      q: "A population of 1 million grows at a constant net 3.5% a year. About how long until it reaches 8 million?",
      options: [
        "About 20 years",
        "About 60 years",
        "About 140 years",
        "About 200 years",
      ],
      answer: 1,
      why: "The doubling time is 70 ÷ 3.5 = 20 years, and 1 to 8 million is three doublings, so about 60 years. 200 years is the linear extrapolation trap: adding the first year's 35,000 every year.",
    },
    {
      q: "In Close Gap the level starts at 20, the goal is 60 and the adjustment time is 5 weeks. Roughly where is the level after 5 weeks?",
      options: [
        "60, because the initial rate of 8 a week closes the 40-unit gap in 5 weeks",
        "40, exactly halfway",
        "About 45",
        "About 58",
      ],
      answer: 2,
      why: "After one adjustment time about 63% of the gap is closed, so the level is about 20 + 0.63 × 40 ≈ 45. The initial rate would finish in 5 weeks only if it stayed constant, but it shrinks with the gap; about 58 takes three adjustment times.",
    },
    {
      q: "On a phase plot of net flow against stock, the curve crosses zero at two points. At A the curve slopes upward; at B it slopes downward. What follows?",
      options: [
        "A is an unstable equilibrium and B is a stable one.",
        "A is stable and B is unstable.",
        "Both are stable, because the net flow is zero at each.",
        "Stability cannot be read from a phase plot; you must simulate.",
      ],
      answer: 0,
      why: "Where net flow rises with the stock, a small displacement increases its own growth and moves the stock further away, so A is unstable; at B displacements shrink. Zero net flow makes a point an equilibrium but says nothing about its stability.",
    },
    {
      q: "Why can a single stock in continuous time never oscillate?",
      options: [
        "Its time constant is always too short.",
        "A single stock can only be part of a reinforcing loop.",
        "Linear systems cannot oscillate.",
        "To reverse direction its net flow must pass through zero, and any such point is an equilibrium where motion stops.",
      ],
      answer: 3,
      why: "A single continuous stock cannot reach zero net flow and then carry on in the other direction, so it cannot turn around. Linear systems with two or more stocks can oscillate, so linearity is not the reason.",
    },
  ],

  delays: [
    {
      q: "An insurer holds 50,000 open claims and settles 25,000 a month, and the system is in steady state. What is the average time to settle a claim?",
      options: [
        "0.5 months",
        "1 month",
        "2 months",
        "It cannot be known without the shape of the delay",
      ],
      answer: 2,
      why: "By Little's law the average delay equals the stock in transit divided by throughput, 50,000 ÷ 25,000 = 2 months, whatever the exit distribution. The shape matters for when individual claims leave, not for this steady-state average.",
    },
    {
      q: "A pulse of material enters a third-order delay with a mean delay of 12 months. What does the outflow look like?",
      options: [
        "It starts near zero, peaks before 12 months and has a long tail after it.",
        "It jumps at once and then decays exponentially.",
        "It comes out as an identical pulse exactly 12 months later.",
        "It peaks exactly at 12 months and is symmetric around that point.",
      ],
      answer: 0,
      why: "Each of the three stages mixes its contents, so the output starts slowly, peaks before the mean and trails off afterwards. An immediate jump is the first-order shape, and an identical pulse is the pipeline delay, the limit of infinitely many stages.",
    },
    {
      q: "A delay time doubles suddenly. What happens at that moment to a first-order material delay and to a first-order information delay (a smooth)?",
      options: [
        "Both outputs drop by half at once.",
        "Neither responds, because delay times matter only in equilibrium.",
        "The smooth's output drops at once; the material delay is unaffected.",
        "The material delay's exit rate drops at once; the smooth's output does not jump, it just updates more slowly.",
      ],
      answer: 3,
      why: "A material delay's outflow is its stock divided by the delay time, so it falls immediately while material piles up in transit. A smooth's output is the stock itself, which cannot jump, so only its speed of adjustment changes.",
    },
    {
      q: "Sales grow steadily at 5% a month. A manager perceives sales through an exponential smooth with a 4-month smoothing time. Once start-up effects have passed, perceived sales are…",
      options: [
        "equal to actual sales.",
        "about 17% below actual sales, and stay that far behind while growth continues.",
        "about 20% above actual sales.",
        "below actual at first, then caught up after about three smoothing times.",
      ],
      answer: 1,
      why: "Under steady exponential growth a first-order smooth settles at Input ÷ (1 + gD) = 1 ÷ 1.2, about 83% of actual. It never catches up, because the input keeps growing; the three-time-constant rule applies to a step, not to growth.",
    },
  ],

  "s-shaped": [
    {
      q: "A logistic population has a maximum fractional growth rate of 18% a year and a carrying capacity of 200. At what population is growth fastest, and how fast is it there?",
      options: [
        "200; 36 a year",
        "100; 18 a year",
        "150; 9 a year",
        "100; 9 a year",
      ],
      answer: 3,
      why: "Logistic growth peaks at half the capacity, 100, where net growth is r × K ÷ 4 = 0.18 × 200 ÷ 4 = 9 a year. 18 a year is r × P with the crowding term left out.",
    },
    {
      q: "In an SIR epidemic, people make 6 contacts a day, each contact with an infectious person transmits with probability 0.25, and people stay infectious for 2 days. What is the contact number, and what share must be immune to block an epidemic?",
      options: [
        "1.5; about 33%",
        "3; about 67%",
        "3; 100%",
        "12; about 92%",
      ],
      answer: 1,
      why: "The contact number is c × i × d = 6 × 0.25 × 2 = 3, and spread stops once the susceptible share is below 1 ÷ 3, so about 67% must be immune. Eradication does not need everyone immune, only fewer than one new case per case.",
    },
    {
      q: "A logistic diffusion model starts with zero adopters and nothing happens, however strong word of mouth is. Why, and what fixes it?",
      options: [
        "Zero adopters is an equilibrium of word of mouth; an external influence such as advertising converts some potential adopters regardless.",
        "The market is too small; raising its size starts growth.",
        "Word of mouth is too weak; doubling the imitation coefficient starts growth.",
        "The time step is too large to register the first adopter.",
      ],
      answer: 0,
      why: "With no adopters, word of mouth generates no adoption at any strength, so the model cannot explain where the first adopters came from. The Bass term adds adoption that does not depend on existing adopters.",
    },
    {
      q: "A logistic curve and a Gompertz curve fit eight years of a product's sales equally well. What follows?",
      options: [
        "Either can be used for policy, since both fit.",
        "The one with the slightly higher R² is the true structure.",
        "Their forecasts may still diverge widely, and the fit does not show which responds correctly to policy.",
        "The data prove that the inflection point lies at half the market.",
      ],
      answer: 2,
      why: "Different structures can match the same history and part ways later, often after it is too late to act on the forecast. A marginally higher R² says nothing about which loops really drive growth.",
    },
  ],

  "lock-in": [
    {
      q: "On a phase plot of a product's share of sales against its share of the installed base, the curve crosses the 45 degree line at 50% with a slope of 1.6. What does this tell you?",
      options: [
        "The 50% split is unstable: a small lead grows until one product dominates.",
        "The 50% split is stable, because the curve crosses the 45 degree line there.",
        "The market will settle at 60% for the leader.",
        "Nothing, because a slope above 1 is impossible for shares.",
      ],
      answer: 0,
      why: "An equilibrium is unstable when the slope exceeds 1, because a small gain in base share brings a larger gain in sales share. Crossing the 45 degree line makes the point an equilibrium; the slope decides whether it is stable.",
    },
    {
      q: "Market share is exp(2 × B) divided by the sum of exp(2 × B) over both firms, where B is each installed base relative to a compatibility threshold. The leader always has twice the rival's base. What is its share when the bases are 0.2 and 0.1, and when they are 2 and 1?",
      options: [
        "67% in both cases, since the ratio is the same",
        "About 55% and about 67%",
        "About 55% and about 88%",
        "About 88% and about 55%",
      ],
      answer: 2,
      why: "exp(0.4) ÷ (exp(0.4) + exp(0.2)) ≈ 0.55, while exp(4) ÷ (exp(4) + exp(2)) ≈ 0.88, so the same 2:1 lead counts far more once the market is large. A pure ratio formulation would give the same share in both cases.",
    },
    {
      q: "Two video formats launch with similar quality. Format X wins a few large retail deals early, and five years later it has 90% of sales. A consultant says this proves X is the better format. What is the best response?",
      options: [
        "Agree: in competitive markets the better product wins.",
        "Agree, because a lead that lasts five years must reflect quality.",
        "Disagree, because the first mover always wins regardless of quality.",
        "Disagree: when network and complementary-goods loops dominate, early luck and strategy can pick the winner regardless of merit.",
      ],
      answer: 3,
      why: "Reinforcing loops that favour whoever leads amplify small early advantages, so a lasting lead says little about quality. Nor does the first mover always win: early on the network loop is weak, and a better late entrant can overtake.",
    },
    {
      q: "Unit costs fall 20% with each doubling of cumulative production. Starting from a unit cost of 100, what is the cost once cumulative production has quadrupled?",
      options: [
        "60",
        "64",
        "80",
        "40",
      ],
      answer: 1,
      why: "Quadrupling is two doublings, so cost is 100 × 0.8 × 0.8 = 64. Subtracting 20 points per doubling gives 60, which treats a proportional reduction as a fixed amount.",
    },
  ],

  chains: [
    {
      q: "An aging chain has 20 births a year, 18 years as youth, 45 years as working adults and 15 years as elderly, with no other exits. What is the equilibrium total population?",
      options: [
        "78",
        "300",
        "1,300",
        "1,560",
      ],
      answer: 3,
      why: "In equilibrium every cohort passes on 20 people a year, so each holds 20 times its residence time: 360 + 900 + 300 = 1,560. 1,300 is the molecule's starting population, which is not an equilibrium.",
    },
    {
      q: "A firm has three ranks with average stays of 2, 6 and 25 years. At each review 40% of the lower two ranks are promoted and the rest leave. The firm is not growing. Roughly what share of staff is in the top rank?",
      options: [
        "About 48%",
        "About 76%",
        "33%, one third in each rank",
        "About 16%",
      ],
      answer: 0,
      why: "With H hires a year the ranks hold 2H, 0.4H × 6 = 2.4H and 0.16H × 25 = 4H, so the top rank is 4 ÷ 8.4 ≈ 48%. About 76% comes from weighting the stays alone and forgetting that only 40% move up at each review.",
    },
    {
      q: "A single-stock coflow tracks the labour needed to run a stock of machines. At what rate should discards remove labour requirements?",
      options: [
        "At the labour per new machine, since that is the current technology",
        "At the average labour per machine: total labour requirements divided by the number of machines",
        "At zero, because labour leaves with workers, not with machines",
        "At the target labour per machine set by management",
      ],
      answer: 1,
      why: "Units leaving a well-mixed stock carry its average attribute, which keeps the attribute conserved. Removing the new-machine value on the outflow is the classic error that breaks conservation.",
    },
    {
      q: "A population that has grown quickly for decades sees fertility fall to replacement level overnight. What happens next?",
      options: [
        "Population stops growing at once.",
        "Population starts falling at once, because births fall.",
        "Population keeps growing for decades as large young cohorts move into the childbearing years.",
        "Population oscillates around its current level.",
      ],
      answer: 2,
      why: "A growing population is young, so the number of parents keeps rising and births exceed deaths for decades even at replacement fertility. Expecting an immediate stop treats the population as one well-mixed stock with no age structure.",
    },
  ],

  oscillation: [
    {
      q: "A firm loses 10 units a month and orders only (100 − Level) ÷ 4 months, with no allowance for replacing losses. Where does the level settle?",
      options: [
        "100",
        "60",
        "90",
        "It never settles and falls to zero",
      ],
      answer: 1,
      why: "In equilibrium ordering must equal the 10-unit loss, which needs a gap of 10 × 4 = 40, so the level settles at 60. Expecting 100 forgets that a pure gap rule orders nothing when there is no gap, so it cannot replace losses.",
    },
    {
      q: "Two managers use the same ordering rule, except that A counts orders already placed (supply-line weight 1) and B ignores them (weight 0). Deliveries take 6 weeks. After demand steps up, what is most likely?",
      options: [
        "Both oscillate equally, because the delay is the same.",
        "A oscillates and B does not, because B reacts only to stock on hand.",
        "Neither oscillates, because delays only create amplification.",
        "B overshoots and oscillates, while A adjusts without a cycle.",
      ],
      answer: 3,
      why: "With full weight on the supply line, A controls stock on hand plus on order, a first-order loop that cannot oscillate whatever the delay. Blaming the delay alone misses that the cycle comes from a rule that keeps ordering after enough is already on its way.",
    },
    {
      q: "Machines last 10 years on average and the firm closes any capital gap over 2 years, replacing discards as it goes. Desired capital suddenly rises by 10% and there is no acquisition delay. By how much do acquisitions jump?",
      options: [
        "10%",
        "20%",
        "50%",
        "100%",
      ],
      answer: 2,
      why: "Acquisitions replace discards of K ÷ 10 and add the gap 0.1K ÷ 2, so they jump from 0.10K to 0.15K a year, a 50% rise from a 10% change in the goal. 10% is the long-run change in throughput, reached only once the stock has caught up.",
    },
    {
      q: "In a four-stage supply chain, customer orders vary by less than 5%, yet the factory's material deliveries swing by more than 30%. Which explanation fits the stock and flow structure best?",
      options: [
        "Each stage's inventory and supply-line corrections become the next stage's demand signal, so slow swings grow upstream.",
        "Upstream stages serve more volatile final customers.",
        "Every stage adds its own random noise, which is never filtered out.",
        "Upstream managers forecast badly; perfect forecasts would remove the amplification.",
      ],
      answer: 0,
      why: "Amplification comes from stock adjustment itself, and each stage passes its corrections upstream as orders. Even a perfect forecast cannot remove it, because raising a stock requires the inflow to overshoot for a while.",
    },
  ],

  archetypes: [
    {
      q: "Two project teams draw on one pool of engineers. Team A starts slightly ahead, so managers give it more engineers; its results improve and it gets still more, while team B falls behind and loses staff. Which archetype is this?",
      options: [
        "Escalation",
        "Success to the successful",
        "Shifting the burden",
        "Limits to growth",
      ],
      answer: 1,
      why: "Allocating a shared resource by past success links two reinforcing loops, so a small initial edge grows until one side is starved. Escalation also involves two parties, but there each reacts to the other's threat rather than competing for one pool.",
    },
    {
      q: "A manager keeps solving urgent customer problems personally, and the team never learns to handle them. What makes this shifting the burden rather than fixes that fail?",
      options: [
        "There is no delay anywhere in the structure.",
        "The symptom never improves, even briefly.",
        "Two parties are each reacting to the other's actions.",
        "The quick fix also weakens the capability for the fundamental solution, so reliance on the fix grows.",
      ],
      answer: 3,
      why: "In shifting the burden, a side effect erodes the fundamental solution (here, the team's skills), deepening dependence on the symptomatic fix. In fixes that fail, the side effect worsens the problem itself rather than the alternative solution.",
    },
    {
      q: "A hospital misses its 4-hour waiting target month after month. The board relaxes the target to 6 hours, and waits slowly lengthen. Which archetype is this, and where is the leverage?",
      options: [
        "Eroding goals; hold the standard fixed or anchor it externally, and close the gap by changing capacity or process.",
        "Escalation; negotiate a truce with competing hospitals.",
        "Success to the successful; give more resources to the busiest department.",
        "Tragedy of the commons; charge patients for each visit.",
      ],
      answer: 0,
      why: "Lowering the goal closes the gap by reducing ambition, and a goal that floats toward performance lets both drift down together. Anchoring the goal on an external standard breaks that loop; the other options describe different stories.",
    },
    {
      q: "Several firms fish one stock that regenerates slowly. Each firm's catch grows with its own fleet, and each keeps investing while its own catch per boat is profitable. What is the most likely outcome?",
      options: [
        "The fish stock settles at maximum sustainable yield, because firms compete.",
        "The first firm to invest wins, the others leave, and the fish stock is unaffected.",
        "Total catch rises, then the fish stock and everyone's catch per boat collapse, often after fleets have overbuilt.",
        "Each fleet stops growing as soon as the fish stock starts to fall.",
      ],
      answer: 2,
      why: "Each firm keeps the full gain from its own expansion but shares the cost of depletion, and scarcity is felt late, so total effort overshoots the resource. Competition alone does not steer the stock to sustainable yield without a rule that limits total use.",
    },
  ],

  process: [
    {
      q: "The longest delay in a hospital staffing problem is the five-year training pipeline for specialists. Which time horizon is most defensible?",
      options: [
        "One year, to match the budget cycle",
        "Five years, exactly the longest delay",
        "Two decades or more: several times the longest delay, reaching back far enough to show how the problem arose",
        "As long as possible, since a longer horizon is always more accurate",
      ],
      answer: 2,
      why: "The horizon should be several times the longest delay so that the delayed effects of policies can play out. A fiscal-year horizon can make a harmful policy look good, while an unlimited one can lose relevance for decision makers.",
    },
    {
      q: "A model explains a firm's falling market share with an exogenous time series for 'competitor strength'. What is its main weakness?",
      options: [
        "It moves the question to what drives competitor strength, and cuts any feedback from the firm's own actions to its rivals.",
        "Exogenous variables are not allowed in system dynamics models.",
        "It will fit the historical data poorly.",
        "It makes the model too large to understand.",
      ],
      answer: 0,
      why: "An exogenous driver does not explain why it changed and hides loops through which the firm's own policies may provoke its rivals. Exogenous inputs are allowed but should be few and checked for feedback, and such a model can fit history very well.",
    },
    {
      q: "Shorter leases halve the average time before cars are traded in. A planner concludes that new car sales will double. What does a stock and flow view add?",
      options: [
        "Nothing: halving the residence time doubles the outflow, so the conclusion holds.",
        "Sales will triple, because leases also raise the purchase option.",
        "Sales will fall at once, because leases replace purchases.",
        "Off-lease cars return as nearly new used cars that compete with new ones, so the gain is smaller and fades.",
      ],
      answer: 3,
      why: "Traded-in cars do not vanish; they fill a stock of late-model used cars that substitutes for new ones, closing loops the all-else-equal argument cuts. A shorter residence time also raises the outflow only until the stock has been drawn down.",
    },
    {
      q: "A plant moves mechanics from emergency repairs to planned maintenance. For several months breakdowns and costs rise. What is the best reading?",
      options: [
        "The policy has failed and should be reversed.",
        "It may be the expected worse-before-better dip: planned work takes equipment off line before the stock of defects has fallen.",
        "The defect data must be wrong.",
        "Planned maintenance cannot reduce defects, because operators create them.",
      ],
      answer: 1,
      why: "Defects are a stock that falls only over several defect lifetimes, while planned work costs uptime at once, so things get worse before they get better. Reading the dip as failure is how high-leverage policies get abandoned.",
    },
  ],

  formulation: [
    {
      q: "A model writes Births = Normal births + Effect of food + Effect of health care. What is wrong with it?",
      options: [
        "Nothing, as long as each effect is a table function.",
        "Its units cannot balance, so the unit checker will reject it.",
        "It runs more slowly than a multiplicative form.",
        "Births cannot fall to zero when food runs out unless the other effects also vanish; a multiplicative form lets one extreme input dominate.",
      ],
      answer: 3,
      why: "Added effects act independently, so good health care can keep births positive with no food at all. Writing Births = Normal births × f1 × f2 lets any one effect at zero shut the flow; an additive equation can balance its units and still fail this extreme test.",
    },
    {
      q: "In an oil exploration model, which input to the drilling decision breaks the Baker criterion?",
      options: [
        "The true amount of undiscovered oil in the basin",
        "Recent discoveries per well drilled",
        "The oil price smoothed over the past two years",
        "Geologists' current estimate of remaining reserves",
      ],
      answer: 0,
      why: "A decision rule may use only information the decision makers actually have; the true resource can sit in the model but not as a drilling cue. The geologists' estimate is a perception, which is legitimate even when it is wrong.",
    },
    {
      q: "A team's quality goal adjusts toward its recent quality over six months. A one-off disruption lowers quality for a quarter. What happens afterwards?",
      options: [
        "Quality returns to its old level, because the goal pulls it back.",
        "Quality and the goal both settle lower than before, because the goal drifted down during the disruption.",
        "Quality overshoots above its old level.",
        "The goal stays where it was, so the disruption leaves no trace.",
      ],
      answer: 1,
      why: "A goal anchored on performance follows it down, so after the shock there is less pressure to recover and the system settles at a new, lower level. A fixed external goal would pull quality back, which is why floating goals make a system path dependent.",
    },
    {
      q: "A colleague draws 'Effect of weekly hours on output' as a hump that peaks at 60 hours. What is the better formulation?",
      options: [
        "Keep the hump but add more points so it is smooth.",
        "Replace it with a straight line through the reference point.",
        "Split it into a quick positive effect of hours and a delayed negative effect of fatigue driven by recent hours.",
        "Use an IF-THEN-ELSE that switches direction at 60 hours.",
      ],
      answer: 2,
      why: "A hump hides two causal paths with different delays, so the link's polarity depends on its input. Two monotonic effects keep each sign clear, let overtime help at once and fatigue hurt later, and still produce a hump in equilibrium.",
    },
  ],

  behaviour: [
    {
      q: "A firm spends 20% of revenue on its sales force. Each unit sells for $10,000 and a sales representative costs $8,000 a month. Above what sales effectiveness (units per representative per month) does the sales loop grow the firm?",
      options: [
        "4",
        "0.25",
        "1",
        "16",
      ],
      answer: 0,
      why: "Each unit sold funds 0.2 × $10,000 = $2,000 of sales budget, so a representative must sell more than 8,000 ÷ 2,000 = 4 units a month to fund more than their own cost. 0.25 is the loop gain per unit of effectiveness, not the threshold.",
    },
    {
      q: "Demand rises in a straight line by 50 units a month. A manager forecasts it with an exponential smooth with a 6-month smoothing time. Once settled, the forecast is…",
      options: [
        "equal to actual demand.",
        "6 units below actual demand.",
        "300 units below actual demand, and stays that far behind.",
        "300 units above actual demand.",
      ],
      answer: 2,
      why: "Under linear growth at r a first-order smooth trails by r × D = 50 × 6 = 300 units and never catches up. A smooth always lags a rising input, so it cannot sit above it.",
    },
    {
      q: "Every firm in an industry cuts price whenever its own utilisation is low, assuming rivals will hold their prices. What is the likely result when demand dips?",
      options: [
        "Each firm fills its capacity and prices recover quickly.",
        "Nothing much, because the rule is locally rational.",
        "Customers wait for further cuts, so demand falls to zero.",
        "Rivals follow the same logic, each cut lowers the others' utilisation, and a reinforcing price war develops.",
      ],
      answer: 3,
      why: "The rule makes sense if rivals' prices are fixed, but they are not: each cut provokes others, closing a reinforcing loop nobody intended. Intended rationality in each part does not guarantee sensible behaviour of the whole.",
    },
    {
      q: "A utility extrapolates a smoothed trend to forecast demand. Demand grew at 7% a year for decades and then suddenly grows at only 2%. Over the next few years the forecast will…",
      options: [
        "switch to 2% growth straight away.",
        "keep overshooting actual demand, because the perceived trend adjusts only gradually.",
        "undershoot actual demand, because smoothing always lags.",
        "oscillate around actual demand.",
      ],
      answer: 1,
      why: "The perceived trend is built from smoothed past data, so it keeps reporting growth near 7% after the break and the extrapolation overshoots. Undershooting is what plain smoothing without a trend does during steady growth, not what trend extrapolation does after growth slows.",
    },
  ],

  cycles: [
    {
      q: "A firm employs 1,000 people with an average tenure of 100 weeks, and it takes 8 weeks to fill a vacancy. How many vacancies are open in equilibrium?",
      options: [
        "8",
        "10",
        "80",
        "125",
      ],
      answer: 2,
      why: "Attrition is 1,000 ÷ 100 = 10 a week, so hiring must be 10 a week, and by Little's law open vacancies equal 10 × 8 = 80. 10 is the flow, not the stock in the supply line.",
    },
    {
      q: "In an inventory-workforce model that oscillates, the firm is allowed to vary the workweek quickly with schedule pressure, within limits. What is the most likely effect?",
      options: [
        "The cycle gets worse, because another loop has been added.",
        "The cycle is damped, because a fast balancing loop closes much of the gap before hiring responds.",
        "The period lengthens but the amplitude stays the same.",
        "No effect, because hours do not change the number of workers.",
      ],
      answer: 1,
      why: "A first-order balancing loop with little delay meets much of the shortfall without waiting for recruitment, which damps the oscillation. Extra loops are not destabilising in themselves; fast reinforcing ones, such as fatigue raising errors, would be.",
    },
    {
      q: "Hogs take about 11 months from breeding to market, yet the hog cycle lasts about 4 years. Why does the cobweb model's prediction of a 22-month cycle fall short?",
      options: [
        "Hog demand follows the business cycle, which happens to last about 4 years.",
        "Farmers behave irrationally.",
        "The cobweb model is right, but noisy data hide the true period.",
        "It leaves out the breeding stock and the delays in forming price expectations and expanding herds, which lengthen the loop.",
      ],
      answer: 3,
      why: "The cobweb has no stocks or expectation delays and ties its period to its time step. Commodity cycles differ in length between industries and are not tied to the business cycle, which points to structure inside each industry.",
    },
    {
      q: "Price equals traders' expected price times an effect of inventory coverage, and the expected price adjusts toward the actual price. Costs are ignored. A small shortage persists. What does price do?",
      options: [
        "It keeps rising as long as the shortage lasts, then stays at the new level.",
        "It rises by a fixed percentage and stops, even while the shortage continues.",
        "It falls, because traders expect a glut to follow.",
        "It oscillates around the old price.",
      ],
      answer: 0,
      why: "Because the anchor chases the actual price, any shortage keeps pulling both upward, like integral control, until the shortage ends. A cost effect acts like proportional control and would settle price at a new level while the gap remained.",
    },
  ],

  testing: [
    {
      q: "A model's fit to sales data gives Theil statistics UM = 0.05, US = 0.10 and UC = 0.85. What does this suggest?",
      options: [
        "A large systematic bias: a key parameter is probably wrong.",
        "Most of the error is unsystematic, point-by-point noise or a small phase shift, with mean and trend matched.",
        "The model's trend or amplitude differs from the data.",
        "The model has been validated.",
      ],
      answer: 1,
      why: "A large UC means the model tracks the mean and the variation and differs only point by point, which is what noise produces. A large UM would point to bias, and no fit statistic validates a model.",
    },
    {
      q: "A stock management model orders demand + (100 − inventory) ÷ 4 + (60 − weight × supply line) ÷ 4, with demand 10 and a 6-week delay. With the supply-line weight set to 0, inventory settles at 160 instead of 100. What explains it?",
      options: [
        "Integration error from too large a time step.",
        "A real effect: ignoring the pipeline always raises inventory by 60%.",
        "Random noise in demand.",
        "The supply-line term stays at 60 ÷ 4 = 15 a week, so equilibrium needs an inventory gap of -60; the desired supply line should be weighted too.",
      ],
      answer: 3,
      why: "In equilibrium orders equal demand, so (100 − inventory) ÷ 4 must cancel the constant 15, giving 160. It is a formulation artefact to fix, not a behavioural finding, which is what tracing surprise behaviour is meant to catch.",
    },
    {
      q: "A published model sets Shipments = Customers × Average purchase per customer. Which test exposes its flaw most directly?",
      options: [
        "An extreme-conditions test: with inventory at zero, shipments continue and inventory goes negative.",
        "A historical fit test, because the model will fit sales poorly.",
        "A dimensional consistency test, because the units cannot balance.",
        "A sensitivity test on average purchase per customer.",
      ],
      answer: 0,
      why: "The outflow does not depend on its own stock, so nothing stops it when inventory runs out; an extreme test reveals this at once. The units balance perfectly and the model may fit history well, which is why those tests miss it.",
    },
    {
      q: "Halving the time step turns a model's long wars followed by long truces into continuous small skirmishes. What should you conclude?",
      options: [
        "The smaller step is less accurate because of round-off error.",
        "The behaviour is chaotic, so both runs are equally valid.",
        "The original step was acting as a hidden behavioural parameter; results are artefacts until they stop changing when dt is halved.",
        "Nothing: time steps affect numerical precision, not behaviour.",
      ],
      answer: 2,
      why: "Results that change when dt is halved are artefacts of the numerical method, which is why this test comes before any other simulation test. Round-off error matters only at far smaller steps than those that change behaviour so drastically.",
    },
  ],

  mechanics: [
    {
      q: "A goal-seeking stock starts at 0 with a goal of 100 and an adjustment time of 1. You integrate it by hand with Euler and dt = 1.5. What path do you get?",
      options: [
        "0, 60, 85, 95: a smooth approach",
        "0, 100, 100, 100: the goal in one step",
        "0, 150, 0, 150: a constant oscillation",
        "0, 150, 75, 112.5: an oscillation that shrinks",
      ],
      answer: 3,
      why: "Each Euler step multiplies the gap by (1 − dt ÷ AT) = -0.5, so the gap flips sign and halves. A single stock cannot really oscillate, so the swings come from the step; a constant oscillation would need dt = 2 × AT.",
    },
    {
      q: "The shortest time constant in a model is 1.5 months. Which time step is the best choice?",
      options: [
        "0.25 months",
        "1 month",
        "0.3 months",
        "0.0001 months",
      ],
      answer: 0,
      why: "A quarter to a tenth of 1.5 months is 0.15 to 0.375, and 0.25 is the power of 2 in that range, so the model clock stays exact. 0.3 is in range but has no exact binary form, and a tiny step adds round-off error and run time for no gain.",
    },
    {
      q: "A population of 100 grows at 3% a year. The exact value after 60 years is 100 × e^1.8 ≈ 605. What does Euler integration with dt = 0.1 give?",
      options: [
        "About 605, the same",
        "About 603, slightly lower",
        "About 607, slightly higher",
        "About 280, far lower",
      ],
      answer: 1,
      why: "Euler compounds growth once per step, like interest paid at intervals, so it always undershoots pure growth: 100 × 1.003^600 ≈ 603. 280 is linear extrapolation of the first year's growth, a different error altogether.",
    },
    {
      q: "An inventory-workforce model barely moves when productivity is driven by white noise with a 5% standard deviation, but it cycles clearly with pink noise of the same standard deviation and a 4-week correlation time. Why?",
      options: [
        "Pink noise ends up with a larger standard deviation after smoothing.",
        "The integration method filters out white noise.",
        "Pink noise persists for weeks, so shortfalls drain inventory and trigger hiring, exciting the natural oscillation; white noise averages out within days.",
        "White noise contains no low frequencies at all.",
      ],
      answer: 2,
      why: "Correlated noise keeps its power at the slow frequencies a system amplifies, while fast independent draws are absorbed by inventory. Both inputs were scaled to the same standard deviation, and white noise does contain low frequencies, just spread thinly across all of them.",
    },
  ],

  frontier: [
    {
      q: "A modelling team gains a hundredfold increase in computing power. Which use best fits the lessons of the field?",
      options: [
        "Run broad sensitivity and policy experiments faster on a model small enough to understand.",
        "Add every product, region and customer segment, since more detail means a better model.",
        "Replace the modellers' judgement about the boundary with automated calibration.",
        "Shrink the time step until the results become exact.",
      ],
      answer: 0,
      why: "People's capacity to absorb information does not grow with computing power, so the aim is faster learning, not bigger models. Detail added for its own sake tends to reduce understanding and implementation.",
    },
    {
      q: "An optimiser fits two rival model structures to the same history equally well. What can automated calibration not tell you?",
      options: [
        "The parameter values that minimise the error for each structure",
        "How much error remains within the sample",
        "Which structure is right for the policy question; that still needs judgement about boundary, decision rules and tests beyond fit",
        "Whether the search has converged",
      ],
      answer: 2,
      why: "Calibration finds parameters for a given structure but cannot choose the boundary or the decision rules. Equal fit is common for structures that diverge sharply under new policies.",
    },
    {
      q: "A company sends managers on a two-day systems thinking course, checks results three months later, sees little change and moves on to a new programme. What does this illustrate?",
      options: [
        "Systems thinking cannot be taught to managers.",
        "The quick-fix pattern: judging a slow capability-building effort before its delay has passed, which breeds cynicism.",
        "Proof that simulation games teach better than courses.",
        "That three months is the right time to evaluate learning.",
      ],
      answer: 1,
      why: "Deep skills take years to build, so judging after a few months guarantees disappointment and the next fashionable programme. The failure lies in the evaluation horizon, not in whether the subject can be learned.",
    },
    {
      q: "When should a modeller prefer an agent-based model to an aggregate stock and flow model?",
      options: [
        "Always, because individuals are more realistic than averages.",
        "Never, because system dynamics requires aggregation.",
        "Whenever the computer is fast enough to run it.",
        "When differences in attributes, rules or interactions between individuals matter for the purpose; the level of aggregation is a choice to justify either way.",
      ],
      answer: 3,
      why: "Agent-based models capture heterogeneity at the cost of more assumptions about each agent, so the right level depends on the purpose. Treating either approach as the default is the error the open question warns against.",
    },
  ],
};
