import type { StudyChapter } from "@/data/sterman/types";

const M = "−";

export const CHAPTER: StudyChapter = {
  id: "ch01",
  number: "1",
  title: "Learning in and about complex systems",
  part: "Part I: Perspective and process",
  pages: "3-39",
  summary:
    "A puzzle comes first: well-meant policies are routinely delayed, diluted or defeated by the system they act on. Sterman (2000) traces this policy resistance to the way people learn. Learning is itself a feedback loop between decisions, the real world and information, and every link in that loop can fail: the world is dynamically complex, information is filtered and late, our causal maps leave out feedback, we cannot mentally simulate even simple loops, we reason unscientifically and we protect ourselves in groups. The case is then made that formal models used as virtual worlds, built with the people who must act, are the practical way to speed up both single-loop and double-loop learning, and that simulation is essential because intuition cannot work out what our own maps imply.",
  bigIdeas: [
    {
      title: "Policy resistance: interventions are undone by the system's response",
      text: "Policy resistance is the tendency of an intervention to be delayed, diluted or defeated by the reactions it provokes. It happens because a policy changes the state of the system, and other actors (and nature) have their own goals and react to restore the balance the policy upset. The policy maker sees the first-round effect and plans for it, but the compensating reactions sit outside the boundary of their mental model. Romania's 1966 abortion ban and the Nixon wage and price controls both produced a short-lived improvement followed by a return to the earlier trajectory.",
      pages: "5-9",
    },
    {
      title: "The event-oriented view versus the feedback view",
      text: "We are trained to explain the world as chains of events: a goal, a gap, a decision, a result, problem solved. That open-loop picture omits the fact that our results become the situation we face next and that other people respond to what we do. In the feedback view our decisions alter the environment, which alters our next decisions and also triggers delayed reactions, goal changes and interventions by others. Policy resistance arises when we act on the open-loop view while living in the closed-loop world.",
      pages: "10-11",
    },
    {
      title: "There are no side effects, only effects",
      text: "Calling an outcome a side effect is a statement about our understanding, not about reality. The effects we anticipated or liked we call intended; the ones we missed, or that fed back to undercut us, we call side effects. They appear because we assume cause and effect are close in time and space, while in complex systems they are often far apart. The electric car example shows how a narrow boundary moves emissions to the power station and out of sight instead of removing them.",
      pages: "11-12",
    },
    {
      title: "All dynamics come from two kinds of loop",
      text: "Complex behaviour usually arises from the interactions among components rather than from the complexity of the components. Positive (reinforcing) loops amplify whatever is happening: arms races, price wars, the lock-in of a dominant standard. Negative (balancing) loops oppose change and seek a goal: smokers of low-nicotine cigarettes smoke more, attractive cities attract migrants until they are no longer attractive. In system dynamics 'positive' and 'negative' describe polarity, not praise or criticism, and a loop of either kind helps or harms according to the direction it is pushing.",
      pages: "12-14",
    },
    {
      title: "Learning is a feedback process",
      text: "Learning works like any balancing loop: we make decisions that change the real world, receive information about the result, compare it with our goals and revise the next decision. Even a poor first decision can converge if the loop is cycled often enough, as when a driver keeps correcting the steering. The same loop appears as Dewey's cycle of invention, observation, reflection and action and as the plan-do-check-act cycle in quality management. Whether it converges depends on the delays and other dynamic complexity in the loop.",
      pages: "14-15",
    },
    {
      title: "Single-loop learning keeps the rules; double-loop learning changes them",
      text: "Decisions come from applying decision rules to perceived information, and those rules are set by strategy, structure and culture, which in turn rest on mental models. In single-loop learning (Argyris) feedback adjusts decisions while the mental model, its boundary, its time horizon and its goals stay fixed. In double-loop learning the same feedback also revises the mental model, producing new rules and goals, so the same information now yields a different decision. Developing systems thinking is a double-loop process: replacing a narrow, short-run, static view with a broad, long-run, dynamic one.",
      pages: "16-19",
    },
    {
      title: "Mental models are active, invisible and often wrong",
      text: "Perception is constructed, not recorded: the Kanizsa triangle shows the brain inventing edges that are not there. Higher-level mental models work the same way and are just as invisible to their owners. A team trying to halve a 182-day supply-chain cycle drew order fulfilment (22 days) as more than half the timeline, while manufacturing (75 days, 70 of them at suppliers) and customer acceptance (85 days) were shrunk. Their picture reflected who was in the room, and even an instant order fulfilment could not have met the goal.",
      pages: "16-18",
    },
    {
      title: "Dynamic complexity is not detail complexity",
      text: "Detail (combinatorial) complexity is the number of parts and options, as in scheduling an airline's crews. Dynamic complexity arises from interactions over time, and can be high in a system whose rules take minutes to explain, such as the Beer Distribution Game. Systems are dynamically complex because they are constantly changing, tightly coupled, governed by feedback, nonlinear, history-dependent, self-organising, adaptive, counterintuitive, full of trade-offs between short and long run, and policy resistant. High-leverage policies often show worse-before-better behaviour while low-leverage ones give a brief improvement before things get worse.",
      pages: "21-22",
    },
    {
      title: "Delays slow learning and destabilise control",
      text: "A delay between action and result cuts the number of times we can cycle around the learning loop, so improvement half-lives stretch from months in simple processes to years in product development. Delays also confound cause and effect, because many things change while we wait. Inside a balancing loop a delay makes decision makers keep correcting after enough correction is already in the pipeline, which produces overshoot and oscillation: stop-and-go traffic, hog cycles, office building booms. A first-order loop without delay cannot oscillate; adding stocks in the loop is what makes oscillation possible.",
      pages: "21-23",
    },
    {
      title: "Limited and filtered information: seeing is believing, and believing is seeing",
      text: "We never observe the true state of a system, only sampled, averaged, delayed and biased measurements, and measurement is always a choice of what to look at. Expectations and perceptions reinforce each other: in Bruner and Postman's experiment people took about four times as long to identify anomalous playing cards, and many never did. The same loop can blind organisations: NASA's software discarded very low ozone readings as instrument error, delaying recognition of the ozone hole by up to 7 years. Information systems are part of the feedback structure, and they encode yesterday's mental models.",
      pages: "23-25",
    },
    {
      title: "Bounded rationality and the misperceptions of feedback",
      text: "Even with good information, people use simplified mental models and rules of thumb because the problem exceeds their cognitive capacity (Simon's bounded rationality). Experiments show two distinct failures. Cognitive maps omit feedback, delays, stocks and flows and nonlinearities, and attribute behaviour to people rather than to the structure they are in (the fundamental attribution error). And even with a complete, correct map, people cannot infer its dynamics: they extrapolate exponential growth linearly, and in the Beer Game they generate costs more than ten times the optimum. Both bounds must be overcome for learning to happen.",
      pages: "26-29",
    },
    {
      title: "Unscientific reasoning, defensive routines and implementation failure",
      text: "People seek evidence that confirms their beliefs rather than tests them: in Wason's card task fewer than 4% choose the cards that could falsify the rule. In groups, defensive routines (saving face, easing in, making issues undiscussable) keep mental models hidden and untested, and can grow into groupthink. Decisions that are agreed are then implemented imperfectly through local incentives and game playing, so managers may misread the results of a policy they never actually ran. The need to perform today also suppresses experiments that would teach us something.",
      pages: "30-33",
    },
    {
      title: "Virtual worlds speed learning, but only if used reflectively",
      text: "A virtual world (a formal model, simulation or role-play) compresses time and space, allows repeated and controlled experiments, permits actions that would be dangerous or unethical in reality and gives complete, immediate feedback, so the learning loop can be cycled many times in an afternoon. It does not by itself make people reason scientifically: players fall into the video game syndrome, running many trials and reflecting on few. Effective use requires explicit hypotheses, records of predictions, an open box whose assumptions can be inspected and changed, and decision makers who help build the model rather than only play it.",
      pages: "34-37",
    },
    {
      title: "Why simulation is essential",
      text: "Mapping mental models with causal diagrams and other problem-structuring tools improves them, but the result is still only a set of untested causal hypotheses. Those maps are far too large to simulate in our heads, so without formal simulation the only test is the slow, ambiguous feedback of the real world. Formalising a qualitative map and simulating it frequently overturns assumptions about boundary, time horizon and the dynamic hypothesis itself. Systems thinking education improves intuition, but just as physics training does not let us predict a hurricane's track by intuition, it cannot replace simulation for complex human systems.",
      pages: "37-38",
    },
  ],
  diagrams: [
    {
      kind: "cld",
      title: "Learning as a balancing feedback loop",
      pages: "14-15",
      cld: {
        vars: [
          { id: "w", label: "State of the real world", x: 260, y: 232 },
          { id: "p", label: "Perceived state", x: 95, y: 135 },
          { id: "g", label: "Perceived gap", x: 260, y: 40 },
          { id: "d", label: "Decisions", x: 430, y: 135 },
          { id: "goal", label: "Goals", x: 450, y: 40 },
        ],
        links: [
          { from: "w", to: "p", sign: "+", curve: -25 },
          { from: "p", to: "g", sign: M, curve: -25 },
          { from: "g", to: "d", sign: "+", curve: -25 },
          { from: "d", to: "w", sign: "+", curve: -25 },
          { from: "goal", to: "g", sign: "+" },
        ],
        loops: [{ type: "B", label: "B1", x: 260, y: 135 }],
        caption:
          '<span class="chip chipB">B</span> The basic learning loop is goal-seeking. Information about the world is perceived, compared with <b>goals</b>, and the gap drives <b>decisions</b> that move the world toward the goal. Every link takes time and can distort, which is why the loop can converge slowly, overshoot or fail altogether.',
      },
      note: "Our layout of the idea that learning is negative feedback; the barriers to learning are failures of particular links in this loop.",
    },
    {
      kind: "cycle",
      title: "Single-loop learning",
      pages: "16",
      nodes: ["Decisions", "Real world", "Information feedback", "Compare with goals using existing rules"],
      center: "Mental models, strategy and rules stay fixed",
      note: "Feedback adjusts what we decide, but not how we decide. Goals, boundary and time horizon are untouched.",
    },
    {
      kind: "cycle",
      title: "Double-loop learning",
      pages: "18-19",
      nodes: ["Decisions", "Real world", "Information feedback", "Mental models revised", "New goals, strategy and decision rules"],
      center: "Feedback also reshapes the rules",
      note: "The same information, run through a reframed mental model and new decision rules, now produces different decisions and, through new structure, different behaviour.",
    },
    {
      kind: "cycle",
      title: "Where each link of the learning loop breaks",
      pages: "19-33",
      nodes: [
        "World: dynamic complexity, long delays",
        "Feedback: missing, late, filtered, ambiguous",
        "Mental maps: open-loop, no stocks or delays",
        "Inference: cannot simulate loops mentally",
        "Groups: confirmation bias, defensiveness",
        "Action: implementation failure, gaming",
      ],
      center: "Barriers to learning",
      note: "A summary in our own wording of the main impediments to learning. Any one broken link is enough to stall learning; most real settings have several.",
    },
    {
      kind: "cld",
      title: "Policy resistance: compensating feedback and side effects",
      pages: "5-12",
      cld: {
        size: [700, 380],
        vars: [
          { id: "og", label: "Our goal", x: 75, y: 60 },
          { id: "gap", label: "Perceived gap", x: 250, y: 60 },
          { id: "act", label: "Our policy action", x: 520, y: 60 },
          { id: "st", label: "State of the system", x: 320, y: 200 },
          { id: "se", label: "Side effects", x: 600, y: 200 },
          { id: "ogap", label: "Others' perceived gap", x: 140, y: 330 },
          { id: "oact", label: "Others' compensating action", x: 500, y: 330 },
        ],
        links: [
          { from: "og", to: "gap", sign: "+" },
          { from: "st", to: "gap", sign: M, curve: 20 },
          { from: "gap", to: "act", sign: "+" },
          { from: "act", to: "st", sign: "+" },
          { from: "act", to: "se", sign: "+" },
          { from: "se", to: "st", sign: M },
          { from: "st", to: "ogap", sign: "+" },
          { from: "ogap", to: "oact", sign: "+" },
          { from: "oact", to: "st", sign: M },
        ],
        loops: [
          { type: "B", label: "B1", x: 360, y: 105 },
          { type: "R", label: "R1", x: 505, y: 160 },
          { type: "B", label: "B2", x: 320, y: 285 },
        ],
        caption:
          '<span class="chip chipB">B1</span> is the loop the policy maker sees: act to close the gap. <span class="chip chipB">B2</span> is everyone else: the change pushes the system away from <i>their</i> goals and they act to restore it (Romanian families evading the abortion ban). <span class="chip chipR">R1</span> is the unanticipated effect: the action itself damages the state, widening the gap and calling for still more action.',
      },
      note: "A generic structure in our own layout. The more effort the policy maker applies, the harder B2 and R1 push back.",
    },
    {
      kind: "cycle",
      title: "Learning through a virtual world",
      pages: "34-37",
      nodes: [
        "Mental models",
        "Formal model: a virtual world",
        "Controlled experiments in simulation",
        "Complete, immediate feedback",
        "Revised policies and decision rules",
        "Decisions tested in the real world",
      ],
      center: "Fast loop through the model, slow loop through reality",
      note: "The virtual world adds a fast learning loop with known structure and controllable complexity. Results from the real world still feed back to correct both the formal model and the mental models.",
    },
  ],
  formulations: [
    {
      name: "Goal-seeking (the learning loop as negative feedback)",
      equations: ["Decision rate = (Goal − Perceived state) / Adjustment time", "State(t) = State(0) + ∫ Decision rate dt"],
      explain:
        "The simplest balancing loop. Each period we correct a fraction of the perceived gap, so the state approaches the goal exponentially with time constant equal to the adjustment time. Without delays this loop cannot overshoot; it only converges, faster or slower.",
      molecule: "closegap",
      pages: "14-15",
    },
    {
      name: "First-order positive loop (the loop people cannot simulate in their heads)",
      equations: ["dx/dt = g · x", "x(t) = x(0) · exp(g · t)", "Doubling time ≈ 70 / (g in %/period)"],
      explain:
        "Growth proportional to the stock gives pure exponential growth. The doubling time is ln 2 / g, about 0.7 / g, which gives the rule of 70 when g is in percent. Experiments cited by Sterman (2000) show people extrapolate such series linearly and badly underestimate them, even with graphs and mathematical training.",
      molecule: "growth",
      pages: "29",
    },
    {
      name: "Perception lags reality",
      equations: ["Perceived state = SMOOTH(Actual state, Perception time)", "d(Perceived)/dt = (Actual − Perceived) / Perception time"],
      explain:
        "Measurement samples, averages and delays the true state. A first-order smooth is the standard way to represent this: the perceived value moves a fraction of the way toward the actual value each period, so a sudden change is noticed only gradually. Longer perception times mean decisions are made on older information.",
      molecule: "smooth",
      pages: "23",
    },
    {
      name: "A delay inside a balancing loop produces oscillation",
      equations: ["Orders = Expected demand + (Desired stock − Stock) / Adjustment time", "Arrivals = Orders delayed by the acquisition lag", "Stock(t) = Stock(0) + ∫(Arrivals − Usage) dt"],
      explain:
        "When the correction takes time to arrive and the decision maker ignores what is already on its way, they keep ordering after the gap has effectively been closed. The stock then overshoots and oscillates. Technically, the delay adds state variables to the loop, which allows the oscillatory (complex) roots that a first-order loop cannot have.",
      molecule: "lowVisPipeline",
      pages: "23",
    },
  ],
  cases: [
    {
      title: "Romania's population policy, 1966",
      text: "With the birth rate near 15 per thousand, the regime banned contraceptive imports and, in October 1966, banned abortion. Births jumped to nearly 40 per thousand, then fell within months; by 1970 the rate was below 20 and by 1989 about 16, back where it started. People found ways around the policy (smuggled contraceptives, illegal abortions), deaths from botched abortions nearly tripled between 1965 and 1967 and neonatal deaths rose by more than 300% from 1966 to 1967. The policy also fed resentment that surfaced in the violent revolution of 1989, and the orphanage system it filled became a lasting tragedy.",
      pages: "6-7",
    },
    {
      title: "A supply chain seen through one function's eyes",
      text: "A company aiming to halve its 182-day supply-chain cycle time presented a timeline in which order fulfilment (22 days) took up more than half of the drawing, manufacturing (75 days, of which 70 were at suppliers) about a quarter, and customer acceptance (85 days) about an eighth. Everyone in the room worked in order fulfilment; nobody from procurement, suppliers, accounting or customers was present. Once the distortion was pointed out, the team could see that even infinitely fast fulfilment would leave them far short of the 50% goal: a clear case of a hidden mental model setting the problem boundary.",
      pages: "17-18",
    },
    {
      title: "Scurvy: 264 years from evidence to policy",
      text: "In 1601 Lancaster gave one East India Company ship three teaspoons of lemon juice a day; by the time the fleet reached the Cape of Good Hope 110 of 278 sailors had died, most of them from scurvy, while the crew given lemon juice stayed largely healthy. Lind's controlled trial in 1747 confirmed citrus as a cure. The Royal Navy adopted citrus only in 1795 and the merchant marine in 1865. The case shows how slowly the learning loop can turn even with decisive experiments and an enormous problem.",
      pages: "19-20",
    },
    {
      title: "The ozone hole that the software would not see",
      text: "Papers showing that CFCs could destroy stratospheric ozone appeared in 1974, but production stayed high. A deep Antarctic ozone hole was reported in 1985 from ground measurements. NASA then found that the Nimbus 7 satellite, measuring since 1978, had never flagged it because its processing rejected very low readings as instrument errors. The raw data had been kept and confirmed the decline. A measurement system built on the expectation that low readings were impossible delayed recognition by as much as 7 years.",
      pages: "24-25",
    },
  ],
  exercises: [
    {
      prompt:
        "Test your intuition about exponential growth. Open Population Growth and choose the Growing preset (birth 5%/yr, death 2%/yr, so net growth is 3%/yr from 100). Before pressing run, write down your guess for the population at years 23, 46 and 69. Then run and read the values off the chart.",
      hint: "Rule of 70: doubling time ≈ 70 / 3 ≈ 23 years, so roughly 200, 400 and 800. Most people guess something close to a straight line.",
      link: { label: "Population Growth", hash: "/m/growth" },
      answer:
        "The app gives about 199 at year 23, 397 at year 46 and 790 at year 69: the population doubles every 23 years, so each doubling adds twice as many people as the one before. The reinforcing loop (more people, more births, more people) makes the rate of increase proportional to the population, so the curve bends upward. If you guessed a straight line, near 300 at year 69, you extrapolated the first few years at a constant rate, which is the most common error with exponential growth. Use the rule of 70 (70 divided by the growth rate in percent) to check any compound-growth claim.",
    },
    {
      prompt:
        "Treat Close Gap as the learning loop. Run the three presets (Reach goal, Aggressive with adjustment time 1.5, Sluggish with 15) and note how long each takes to get within 5 units of the goal of 60. Then explain in two sentences why a long delay in the learning loop has the same effect as a sluggish adjustment time.",
      hint: "The gap starts at 40, so getting within 5 means closing 87.5% of it, which takes about 2.1 adjustment times (ln 8).",
      link: { label: "Close Gap", hash: "/m/closegap" },
      answer:
        "In the app the level first reaches 55 (within 5 of the goal) at about week 3.1 with Aggressive (AT 1.5), week 10.3 with Reach goal (AT 5) and week 31.1 with Sluggish (AT 15), each about 2.1 adjustment times, as ln 8 predicts. The balancing loop closes a fixed fraction of the remaining gap per unit time, so the time to converge scales directly with the adjustment time. A learning loop works the same way: if feedback on the results of our decisions arrives late, we correct our mental models only slowly, so the gap between what we believe and how the world works lingers just as it would with a long adjustment time. Either way, slow feedback means slow learning.",
    },
    {
      prompt:
        "See how a delay inside a balancing loop creates oscillation. In Low-Visibility Pipeline Correction run the Tracks the pipeline preset, then Ignores the pipeline (awareness 0). Finally keep awareness at 0 and raise the supplier delay from 6 to 12 weeks. Record the peak inventory in each run and relate the result to the point about drivers, drinkers and hog farmers who keep correcting after enough correction is already on the way.",
      hint: "Tracking the pipeline, inventory rises to the goal of 100 without overshooting. Ignoring it, inventory peaks near 117; with the 12-week delay it peaks near 130 and keeps swinging.",
      link: { label: "Low-Visibility Pipeline Correction", hash: "/m/lowVisPipeline" },
      answer:
        "Tracking the pipeline, inventory climbs from 60 to the goal of 100 and never overshoots. Ignoring the pipeline (awareness 0), it peaks at about 117 around week 16, dips to about 92 and then settles. With awareness 0 and a 12-week supplier delay, it peaks near 130 at week 24, drops to about 74 by week 46 and is still swinging after 120 weeks. The balancing loop keeps ordering while the gap persists, but its corrections take a supplier delay to arrive, and a manager who ignores the orders already on the way keeps adding more; the longer the delay, the more surplus piles up before inventory responds. Like the driver who keeps turning the hot tap or the drinker who has another before the first one hits, the cure is to account for the correction already in the pipeline.",
    },
    {
      prompt:
        "Limited information in action. In Smooth, run the Snappy preset (τ = 2) and then the Slow preset (τ = 15), and compare the 1st-order smooth with the input in each. If a manager acts only when the perceived value has moved 90% of the way to the new level, how much later does the τ = 15 manager act?",
      hint: "A first-order smooth closes 90% of a step in about 2.3 τ: roughly 5 weeks versus 35 weeks.",
      link: { label: "Smooth", hash: "/m/smooth" },
      answer:
        "The input steps from 30 to 80 at the start. With τ = 2 the 1st-order smooth reaches 75 (90% of the way) at about week 4.6; with τ = 15 it takes until about week 34.6, so the slower manager acts roughly 30 weeks later. A first-order smooth closes 1 − e^(−t/τ) of a step, so 90% takes ln 10 ≈ 2.3 τ (4.6 versus 34.5 weeks). Perceptions built by averaging noisy information are always late, and the lag is proportional to the averaging time: smoothing more protects you from noise at the price of reacting slowly to real change.",
    },
    {
      prompt:
        "Avoid the video game syndrome. In Low-Visibility Pipeline Correction choose the Boom and bust (slow supplier) preset. Before each run, write a one-line hypothesis and a numerical prediction (for example the peak inventory). Run, record the discrepancy and propose one change to a single slider that would test your explanation. Do at least three cycles and keep the notes as a lab notebook.",
      link: { label: "Low-Visibility Pipeline Correction", hash: "/m/lowVisPipeline" },
      answer:
        "There is no single right notebook, but each entry needs a hypothesis, a number predicted before the run, the result and the gap between them. The baseline gives a peak inventory of about 151 at week 20, a trough near 60 around week 40 and cycles of roughly 39 weeks whose peaks creep higher each time. Good single-slider tests: awareness 1 cuts the peak to about 104 with almost no undershoot (testing whether ignoring the supply line drives the boom); a 6-week supplier delay cuts it to about 132 (testing the role of the delay); a 6-week inventory correction time cuts it to about 122 (testing how aggressive the correction is). The lesson is that a simulation teaches you only when you commit to a prediction first and then explain each surprise.",
    },
    {
      prompt:
        "Pen and paper: a warehouse rule says 'if a box is marked fragile, it must be on the bottom shelf'. Four boxes show only one face: 'fragile', 'not fragile', 'bottom shelf', 'top shelf'. Which boxes must you turn over to check the rule? Then explain which choice only confirms and which can falsify.",
      hint: "Check 'fragile' (it must be on the bottom) and 'top shelf' (it must not be fragile). Turning 'bottom shelf' can never refute the rule.",
      answer:
        "Turn over 'fragile' and 'top shelf'. A fragile box breaks the rule if its hidden face says top shelf, and a top-shelf box breaks it if its hidden face says fragile. 'Not fragile' can be on any shelf, so it is irrelevant, and 'bottom shelf' can only confirm: whatever is on the other side, the rule survives. Most people pick 'fragile' and 'bottom shelf', looking for confirming cases; good testing means looking for the case that could prove you wrong.",
    },
    {
      prompt:
        "Pick a recent policy you know (in your organisation or in the news) that improved things briefly and then faded. Draw it on the generic policy-resistance structure: name our goal, the action, the state, the others whose goals were disturbed, their compensating action and any side effect. Mark each loop B or R and estimate the delay in each.",
      link: { label: "Policy resistance case", hash: "/apps/social/policy-resistance" },
      answer:
        "Answers will differ, but a good one names six elements and links them in a loop. Our goal and the gap between it and the state of the system drive our action (B loop); the action moves the state, which also moves others away from their goals; their compensating action pushes the state back (a second B loop that fights ours); and side effects of our action often feed back on the state or on our goal. For example, building roads to cut congestion (action) improves travel time (state), which draws more people to drive (others' response), which restores congestion over several years. Estimate each delay: the compensating loop is usually slower than our action, which is why the policy works at first and then fades.",
    },
    {
      prompt:
        "Add a balancing loop to a reinforcing one. Open Constrained Growth with the S-curve preset (growth 18%/yr, capacity 200). Note the year when growth is fastest and the population at that moment. Then raise capacity to 350 and see whether the timing of the peak growth changes. Relate this to the claim that dynamics arise from the interaction of loops, not from either loop alone.",
      hint: "In the logistic model the fastest growth happens at half the carrying capacity.",
      link: { label: "Constrained Growth", hash: "/m/logistic" },
      answer:
        "With growth 18%/yr and capacity 200, net growth is fastest at about year 16.4, when the population is about 100, half the capacity, growing by 9 per year. With capacity 350 the peak moves later, to about year 19.7 at a population of about 175, again half the capacity. The reinforcing birth loop dominates while the population is small; the balancing crowding loop grows with the square of the population and takes over at the halfway point, so the inflection point is set by both loops together (time = ln(K/P0 − 1) / r). Neither loop alone produces an S-curve: the reinforcing loop alone gives explosive growth and the balancing loop alone gives nothing to balance.",
    },
  ],
  pitfalls: [
    "Explaining behaviour as a chain of events (sales fell because a competitor cut prices) instead of looking for the feedback structure that keeps producing such events.",
    "Calling unwelcome consequences 'side effects', as if they were outside the system, rather than treating them as evidence that the model boundary is too narrow.",
    "Using 'positive feedback' to mean praise and 'negative feedback' to mean criticism. In system dynamics they mean reinforcing and balancing loops, and either can be desirable.",
    "Equating complexity with the number of parts. Dynamic complexity comes from feedback, delays, stocks and nonlinearity and can be severe in a small system.",
    "Blaming the people in a system (the fundamental attribution error) when different people in the same structure would behave the same way.",
    "Searching only for confirming evidence, and building information systems that filter out the anomalies that would challenge the current model.",
    "Running a simulation over and over without stating hypotheses or reflecting on surprises (the video game syndrome).",
    "Believing that a causal map, once drawn, is understood. Without simulation, even a correct map does not tell you how the system will behave.",
  ],
  molecules: ["closegap", "growth", "logistic", "smooth", "lowVisPipeline", "stockmgmt", "decay"],
};
