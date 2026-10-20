import type { StudyChapter } from "@/data/sterman/types";

// Topic notes on bounded rationality versus rational expectations, drawing on Sterman (2000). Paraphrased, with page references.
export const CHAPTER: StudyChapter = {
  id: "ch15",
  number: "15",
  title: "Modeling human behavior: bounded rationality or rational expectations?",
  part: "Part IV Tools for modeling dynamic systems",
  pages: "597-629",
  summary:
    "Simulation models must describe decisions as people actually make them. The evidence says human rationality is bounded: limited attention, memory and inference force people to rely on habits, rules of thumb, goals and the decomposition of problems into local subgoals. Such rules are usually intendedly rational: they would work well if the world were as simple as the decision maker assumes. That can be tested with partial model tests, isolating each decision function and challenging it with exogenous inputs, and Forrester's market growth model then shows how order fulfilment, capacity acquisition and sales functions that are each sensible on their own interact to produce slow growth and repeated boom and bust that managers then blame on people.",
  bigIdeas: [
    {
      title: "Descriptive, not normative",
      text: "A simulation model is meant to mimic how real decisions are made, mistakes included, so that policies can then be designed to improve them. Building in optimal behaviour or perfect foresight would describe a world that does not exist and would hide exactly the errors that cause the dynamics of interest. Simon's verdict is that the rational-choice assumptions of economics do not describe how people decide in complex situations at all.",
      pages: "597-599",
    },
    {
      title: "Why rationality is bounded",
      text: "Optimal capital investment, for example, would need the true cost and demand functions, a perfect model of how competitors, suppliers and customers will respond, the ability to solve a huge stochastic dynamic optimisation, and the time to do so. None of these holds; even economists must assume away most of the problem to solve it. Bounded rationality comes from limits on knowledge, computation and time, plus emotion and habit. Simple rules using a few cues often outperform experts' holistic judgments in prediction tasks.",
      pages: "598-599",
    },
    {
      title: "Cognitive limits: selective attention and a few salient cues",
      text: "People attend to a small fraction of the available information, and under stress information overload can make even critical cues invisible, as in aircraft crises. Working memory holds roughly seven chunks. People favour cues that are concrete, certain and readily available, and underweight uncertain or remote ones even when they are diagnostic. Mental models steer attention, and because people judge causality poorly, they can attend to the wrong cues. Behavioural decision theory documents the resulting heuristics and their persistent, systematic errors.",
      pages: "599-600",
    },
    {
      title: "Habits, routines and rules of thumb",
      text: "Organisations cope with complexity through routines, standard operating procedures that run with little deliberation, and rules of thumb that give a decent decision quickly from simple, certain information. Marking up wholesale cost by a traditional percentage, and holding a sale for slow movers, is a rule of thumb: not optimal, but good enough, and paired with other rules that correct its errors. These rules, not optimisation, are what a model's decision functions should represent.",
      pages: "601",
    },
    {
      title: "Managing attention, satisficing and adaptive goals",
      text: "Because attention is scarce, controlling what people see (reporting lines, agendas, information systems, gatekeepers) is a source of power. People also set concrete goals and stop searching once performance is satisfactory, which Simon called satisficing: students ease off once the target grades arrive, buyers stop at an acceptable price, employers hire the first adequate candidate. Goals themselves adapt to experience: sales quotas follow recent sales plus a margin, and target markups drift toward realised markups. These are floating goals in model form.",
      pages: "601-602",
    },
    {
      title: "Problem decomposition and the 'givens'",
      text: "Limited capacity forces large problems to be split into subgoals assigned to departments and then to individuals, until each person's actions and goals are clearly linked. Each decision maker then treats the rest of the system as fixed premises: a firm cuts price assuming rivals will not respond, a developer builds assuming today's rents will last, an operator defers maintenance to hit the daily quota. Decentralisation assumes that meeting every subgoal achieves the overall goal, an assumption that feedback often breaks.",
      pages: "602-603",
    },
    {
      title: "Intended rationality",
      text: "A rule is intendedly (locally) rational if it would produce sensible results were the environment as simple as the decision maker believes. Cutting price to fill idle capacity makes sense if competitors' prices are fixed. But rivals follow the same logic, so each firm's cut lowers the others' utilisation and prompts their cuts, closing a reinforcing loop that turns a demand dip into a price war nobody intended. The modeller's job is to uncover the premises that make behaviour sensible from inside, rather than labelling it irrational.",
      pages: "603-604",
    },
    {
      title: "Partial model tests",
      text: "To test intended rationality, isolate one decision function, make its environment match the decision maker's mental model (cut the loops they ignore, make their 'givens' exogenous) and challenge it with steps or pulses. Does inventory policy handle a jump in demand? Does investment reach the right capacity without wild swings? If each piece behaves sensibly in isolation, any dysfunction in the full model must come from their interaction, which is the insight to communicate. Partial tests also catch formulation errors early.",
      pages: "605, 629",
    },
    {
      title: "The market growth model's three functions",
      text: "Forrester's model splits a high-tech firm into order fulfilment, capacity acquisition and sales, coupled to a market, with deliberately unlimited potential so that any failure is self-inflicted. Order fulfilment ships Capacity × Utilisation(Backlog / Normal delivery delay / Capacity). Senior managers distrust forecasts and expand capacity only when the delivery delay they perceive (with a 3-month lag) exceeds their goal, anchoring desired capacity on current capacity and adjusting cautiously; capacity follows with an 18-month third-order delay. The sales budget is a fixed 20% of smoothed revenue, and customers respond to perceived delivery delay with a 12-month lag.",
      pages: "605-621",
    },
    {
      title: "Hill climbing finds the right capacity without knowing it",
      text: "Anchoring desired capacity on current capacity and adjusting by delivery pressure is the hill-climbing structure (see the module Formulating decision rules and nonlinear effects). Held in a world where delivery delay is fixed (the loop cut), capacity keeps rising as long as pressure persists; with the loop closed, a 20% rise in orders produces a smooth climb to exactly the new required capacity over a few years, with no forecast and no optimisation. The cautious slope slows expansion near the summit, reducing overshoot. Likewise the sales rules grow the firm whenever a dollar of revenue buys more than a dollar of new bookings and shrink it otherwise.",
      pages: "612-619",
    },
    {
      title: "Locally rational parts, dysfunctional whole",
      text: "With all functions connected, growth is far below potential and the firm suffers repeated slumps with orders falling by up to half. Sales grow until capacity binds; delivery delay rises; cautious managers wait, then invest; capacity lags; customers learn of long lead times and defect just as new capacity arrives; excess capacity then halts investment while orders recover. Orders and capacity cycle out of phase. Each manager treats the others' outputs as exogenous givens, though they are shaped by his own decisions.",
      pages: "621-623",
    },
    {
      title: "Attribution error closes the trap",
      text: "Seeing orders slump while the sales force grows, senior managers conclude that sales effectiveness has fallen and blame the sales VP, lazy representatives or competitors, attributing outcomes to people rather than structure. They fire the VP, run motivation programmes or cut prices; sales recover for systemic reasons, which seems to confirm the diagnosis and keeps attention away from the real lever, the conservative capacity policy and its delays.",
      pages: "623-624",
    },
  ],
  diagrams: [
    {
      kind: "cld",
      title: "An intendedly rational price war",
      cld: {
        size: [700, 330],
        vars: [
          { id: "fp", label: "Firm price", x: 230, y: 55 },
          { id: "fd", label: "Firm demand", x: 230, y: 275 },
          { id: "fu", label: "Firm utilization", x: 85, y: 165 },
          { id: "cp", label: "Rival price", x: 460, y: 55 },
          { id: "cd", label: "Rival demand", x: 460, y: 275 },
          { id: "cu", label: "Rival utilization", x: 605, y: 165 },
        ],
        links: [
          { from: "fp", to: "fd", sign: "−", curve: 0 },
          { from: "fd", to: "fu", sign: "+", curve: 0 },
          { from: "fu", to: "fp", sign: "+", curve: 0 },
          { from: "cp", to: "cd", sign: "−", curve: 0 },
          { from: "cd", to: "cu", sign: "+", curve: 0 },
          { from: "cu", to: "cp", sign: "+", curve: 0 },
          { from: "fp", to: "cd", sign: "+", curve: 30 },
          { from: "cp", to: "fd", sign: "+", curve: 30 },
        ],
        loops: [
          { type: "B", label: "B1", x: 190, y: 165 },
          { type: "B", label: "B2", x: 497, y: 165 },
          { type: "R", label: "R1", x: 345, y: 95 },
        ],
        caption:
          '<span class="chip chipB">B</span> B1 Fill the line: with idle capacity the firm cuts price to win demand, which is sensible if the rival price is a given. <span class="chip chipB">B</span> B2: the rival runs the same rule. <span class="chip chipR">R</span> R1: each cut takes demand from the other, lowering its utilisation and prompting its own cut, so a dip in industry demand becomes a price war. A partial model test that freezes the rival price shows B1 working as managers intend.',
      },
      pages: "603-605",
    },
    {
      kind: "cld",
      title: "Market growth: sales, availability and capacity",
      cld: {
        size: [640, 320],
        vars: [
          { id: "sf", label: "Sales force", x: 90, y: 60 },
          { id: "or", label: "Orders", x: 300, y: 60 },
          { id: "bl", label: "Backlog", x: 520, y: 60 },
          { id: "dd", label: "Delivery delay", x: 520, y: 175 },
          { id: "cap", label: "Capacity", x: 520, y: 285 },
          { id: "rev", label: "Revenue", x: 300, y: 260 },
        ],
        links: [
          { from: "sf", to: "or", sign: "+", curve: 0 },
          { from: "or", to: "bl", sign: "+", curve: 0 },
          { from: "bl", to: "rev", sign: "+", curve: 0 },
          { from: "rev", to: "sf", sign: "+", curve: 0 },
          { from: "bl", to: "dd", sign: "+", curve: 0 },
          { from: "dd", to: "or", sign: "−", curve: 0 },
          { from: "dd", to: "cap", sign: "+", curve: -30 },
          { from: "cap", to: "dd", sign: "−", curve: -30 },
        ],
        loops: [
          { type: "R", label: "R1", x: 230, y: 150 },
          { type: "B", label: "B1", x: 400, y: 84 },
          { type: "B", label: "B2", x: 590, y: 230 },
        ],
        caption:
          '<span class="chip chipR">R</span> R1 Sales growth: bookings become revenue, a fixed share funds more salespeople, who book more orders. <span class="chip chipB">B</span> B1 Availability: a rising backlog lengthens delivery delay and, after the market\'s 12-month lag, customers go elsewhere. <span class="chip chipB">B</span> B2 Capacity expansion: managers add capacity when perceived delay exceeds the goal, but slowly. Revenue is drawn from the backlog for simplicity; in the model it is price × shipments, which capacity also limits.',
      },
      pages: "606-621",
    },
    {
      kind: "sequence",
      title: "Running a partial model test",
      steps: [
        { label: "Pick one decision function", detail: "e.g. capacity acquisition or sales budgeting" },
        { label: "State its premises", detail: "What does the actor treat as given?" },
        { label: "Cut the ignored loops", detail: "Make those givens exogenous inputs" },
        { label: "Challenge it", detail: "Steps and pulses in its inputs" },
        { label: "Judge intended rationality", detail: "Smooth, stable, reaching a sensible level?" },
        { label: "Reconnect the system", detail: "Run the full model with every function closed" },
        { label: "Explain the gap", detail: "Dysfunction now comes from the interactions" },
      ],
      loopBack: { from: 4, to: 0, label: "repair the rule if it fails in isolation" },
      pages: "605, 607-621",
    },
    {
      kind: "cycle",
      title: "A boundedly rational decision loop",
      nodes: [
        "A few salient cues selected from many",
        "Rule of thumb or routine applied",
        "Action judged against a satisficing goal",
        "Action changes the system",
        "Delayed, noisy, local feedback",
        "Goal drifts toward recent experience",
      ],
      center: "Bounded rationality",
      note: "Each step simplifies: attention, heuristics, satisficing, decomposition and adaptive goals.",
      pages: "599-603",
    },
  ],
  formulations: [
    {
      name: "Order fulfilment",
      equations: [
        "Backlog = ∫(Order rate − Shipment rate) dt",
        "Delivery delay = Backlog / Shipment rate",
        "Desired production = Backlog / Normal delivery delay",
        "Shipment rate = Capacity · f(Desired production / Capacity),  f(0) = 0, f(1) = 1, f_max = 1.25",
      ],
      explain:
        "Capacity is a given for operations managers, who flex utilisation instead; below normal they cut back less than proportionately, preferring to run the backlog down. With flexible capacity the rule reduces to a first-order material delay that always delivers in the normal time; with capacity fixed at 500 per month and orders stepped from 500 to 600, utilisation settles at 120% and delivery delay at about 2.7 months. The molecule uses the hard-MIN cousin of this curve.",
      molecule: "backlogFlow",
      pages: "607-609",
    },
    {
      name: "Capacity acquisition by anchoring and adjustment",
      equations: [
        "Capacity = SMOOTH3(Desired capacity, Capacity acquisition delay = 18 months)",
        "Desired capacity = Capacity · f(Pressure to expand capacity),  f(1) = 1, slope < 1, saturating",
        "Pressure to expand capacity = Delivery delay perceived by company / Company goal for delivery delay",
        "Delivery delay perceived by company = SMOOTH(Delivery delay, 3 months)",
      ],
      explain:
        "No forecasts are used: senior managers trust only missed delivery dates. The goal is anchored on current capacity, so the rule climbs until delivery pressure disappears, a hill-climbing search. The weak slope encodes caution about expensive, irreversible investment.",
      molecule: "univariateAnchor",
      pages: "609-615",
    },
    {
      name: "Sales force and the open-loop gain of growth",
      equations: [
        "Order rate = Sales force · Sales effectiveness",
        "Target sales force = Fraction of revenue to sales · Recent revenue / Cost per representative",
        "Recent revenue = SMOOTH(Price · Shipment rate, 3 months)",
        "Net hiring = (Target sales force − Sales force) / Sales force adjustment time",
        "OLSSG = Sales effectiveness · Price · Fraction to sales / Cost per representative",
      ],
      explain:
        "Budgeting is a traditional share of recent revenue, not an optimisation. The firm grows when the open-loop steady-state gain of the sales loop exceeds 1. With price $10,000, a 20% share and $8,000 per representative per month, that needs sales effectiveness above 4 units per person per month; the delays only set how fast.",
      molecule: "workforceFromBudget",
      pages: "615-619",
    },
    {
      name: "Market response to availability",
      equations: [
        "Sales effectiveness = Normal sales effectiveness · f(Delivery delay perceived by market / Market target delivery delay)",
        "Delivery delay perceived by market = SMOOTH(Delivery delay perceived by company, 12 months)",
      ],
      explain:
        "Applying the Baker criterion, customers know only the firm's delivery quotes and their own experience, and switching suppliers takes time, so the market reacts with a long lag. The effect falls ever faster as delays rise until only the most loyal customers remain.",
      molecule: "effectFunction",
      pages: "619-621",
    },
    {
      name: "Floating, biased goal for delivery delay",
      equations: [
        "Company goal = W · Traditional delivery delay + (1 − W) · Fixed goal",
        "Traditional delivery delay = SMOOTH(Delivery delay perceived by company, 24 months)",
        "Pressure to expand capacity = (Perceived delivery delay − Delivery delay bias) / Company goal",
      ],
      explain:
        "Forrester found that managers' acceptable delivery delay drifted toward what they had recently experienced and that they believed delays were shorter than customers did, because they relied on optimistic quotes. Both weaken the investment signal. W = 0 and zero bias recover the original rule.",
      molecule: "weightedAvg",
      pages: "625-626",
    },
  ],
  cases: [
    {
      title: "Partial tests of order fulfilment and capacity",
      text: "With capacity fixed at 500 units per month, a 2-month normal delivery delay and a 1,000-unit backlog, orders step from 500 to 600 per month. Utilisation rises to 120% and delivery delay to about 2.7 months, and shipments settle smoothly at 600: the rule does as well as the fixed capacity allows. Testing capacity acquisition with perceived delivery delay held 25% high for two years and then 25% low shows capacity climbing and falling as pressure lasts, ending at a different level from where it began because the response is nonlinear. With the loop closed, a 20% order increase brings capacity smoothly to the new requirement over several years; shipments overshoot orders only because the excess backlog must be cleared.",
      pages: "609-614",
    },
    {
      title: "Partial test of the sales organisation",
      text: "With capacity perfectly flexible, cost $8,000 per representative per month, a 20% budget share and a $10,000 price, a sales effectiveness of 10 units per person per month makes the sales loop strongly reinforcing and the firm grows exponentially. When effectiveness drops to a quarter of that in month 60, orders fall at once, the sales force keeps growing briefly on backlog revenue and budget delays, then shrinks exponentially. The rules involve no optimisation, yet they expand the firm exactly when selling pays and contract it when it does not.",
      pages: "617-619",
    },
    {
      title: "The full market growth model",
      text: "Coupling the three functions to the market produces revenue far below the potential path and repeated slumps in which orders fall by as much as 50%, severe enough that senior managers would probably be replaced. After about three years capacity starts to bind, delivery delay climbs, cautious investment lags, and customers drift away just as new capacity arrives; excess capacity then stalls investment as orders recover. The slow growth and the cycles are entirely self-inflicted, because the market was assumed to be unlimited.",
      pages: "621-623",
    },
    {
      title: "Simple rules versus experts",
      text: "Studies cited by Sterman (2000, p. 599) found that simple decision rules using a few inputs often beat expert judgment at predicting outcomes as varied as student performance, cancer patients' survival, business failures and stock returns. The point is not that rules are clever but that holistic expert judgment combines many cues poorly, which supports modelling decisions as simple, cue-limited rules.",
      pages: "599",
    },
  ],
  exercises: [
    {
      prompt:
        "Read the market growth application and sketch its loops yourself before looking at the diagram above. Then explain, step by step, why orders and capacity end up cycling out of phase rather than growing together.",
      hint: "Trace the timing: capacity binds, delivery delay rises, managers wait for persistent evidence, capacity arrives 18 months later, customers have already defected after a 12-month lag.",
      answer:
        "Model loops: R1 (sales growth): salespeople → orders → revenue → sales budget → salespeople, all positive. B1 (delivery delay): orders → backlog → delivery delay → attractiveness → orders. B2 (capacity expansion): delivery delay → capacity orders → capacity (after about 18 months) → shipments → backlog → delivery delay. Step by step: the sales force grows orders faster than capacity, so the backlog and delivery delay rise; managers wait for the delay to persist before ordering capacity; customers react to the longer delay after about 12 months and orders fall; when the new capacity finally arrives, orders have already dropped, so delivery delay falls and investment stops just as the sales force pushes orders up again. Because capacity reacts to a delayed, smoothed signal and customers react to a different delay, the two move out of phase, and growth stalls in a cycle. Your sketch should contain all three loops and mark both delays.",
      link: { label: "Growth stalled by capacity investment", hash: "/apps/business/market-growth" },
    },
    {
      prompt:
        "Partial test of order fulfilment. Open Backlog Protected by Flow and run 'Service-bound (settles)' (orders 12, desired ship time 3, capacity 20), then 'Capacity-bound (grows)' (capacity 10). In each case, is the shipping rule intendedly rational?",
      hint: "With spare capacity the backlog settles at 12 × 3 = 36 and delivery takes the normal 3 months. With capacity below orders the backlog grows without limit, yet shipping at capacity is still the best operations can do: the failure lies elsewhere.",
      answer:
        "Service-bound settles: with capacity 20 the shipping rule MIN(Backlog / 3, 20) uses the desired ship time, so shipping falls from 20 to 12 and the backlog settles at 12 × 3 = 36, a 3-month delivery delay. Capacity-bound grows: shipping is stuck at 10, below orders of 12, so the backlog grows by 2 a month without limit (140 by month 40) and delivery delay keeps rising. In both cases the rule is intendedly rational: ship what you can at the normal pace, and never more than capacity allows. The partial test shows the order fulfilment rule is sound, so the stalled growth must come from somewhere else, namely the capacity investment decision.",
      link: { label: "Backlog Protected by Flow", hash: "/m/backlogFlow" },
    },
    {
      prompt:
        "Cautious versus proportional expansion. In Univariate Anchoring and Adjustment, treat the anchor as current capacity and the current/normal ratio as delivery pressure. Compare 'Under-adjust (√)' with 'Proportional'. Which corresponds to the base-case capacity policy of the market growth model, and what would you expect from the more aggressive one in the full model?",
      hint: "Strength 0.5 sets desired capacity to 100 × 1.5^0.5 ≈ 122 when pressure is 1.5; strength 1 sets it to 150. The aggressive policy expands faster but invites overshoot through the 18-month delay.",
      answer:
        "Under-adjust (strength 0.5) sets the value to 100 × 1.5^0.5 ≈ 122.5 when pressure is 1.5; Proportional (strength 1) sets it to 150, and both reach their targets within about 5 weeks. The cautious √ response matches the base-case capacity policy, which expands less than in proportion to the delivery pressure. The aggressive policy closes more of the gap per decision, but because new capacity arrives only after the 18-month delay it keeps ordering while pressure remains high, so in the full model it is likely to overshoot and produce bigger swings in delivery delay and orders. Faster response is not the same as better control when there is a long pipeline.",
      link: { label: "Univariate Anchoring", hash: "/m/univariateAnchor" },
    },
    {
      prompt:
        "Cutting a loop. Open Sea Anchor & Adjustment and run 'Runaway drift' (pressure 1.2). The pressure never falls because nothing in the molecule feeds back to it, just as the capacity test held delivery delay high. Now open Protected Sea Anchor, run 'Protected (stable)', and explain what the fundamental plays the part of.",
      hint: "In the full model, extra capacity lowers delivery delay and removes the pressure; here a credible fundamental does the job of closing the loop.",
      answer:
        "In Runaway drift the value is always 1.2 × anchor, so the anchor grows about 3.3% a month without limit (about 222 by month 24 and 736 by month 60): the pressure is fixed, nothing feeds back to it. Protected (stable) moves the anchor toward a mix of half the current value and half a fundamental of 100, so it settles where Anchor = 0.5 × 1.2 × Anchor + 50, that is 125, with the value at 150. The fundamental plays the part of the balancing loop that was cut in the partial test: in the full model, added capacity lowers delivery delay and removes the pressure; here an outside reference stops the drift.",
      link: { label: "Sea Anchor & Adjustment", hash: "/m/seaAnchor" },
    },
    {
      prompt:
        "Budget-driven staffing. Open Workforce from Budget and run 'Can afford 50', then 'Budget cut'. The target headcount is budget / wage, the same rule as the sales force in the market growth model. Where does the reinforcing loop come from in the full model, given that this molecule shows only a balancing adjustment?",
      hint: "In the market growth model the budget is a share of recent revenue, and revenue depends on the sales force through orders: close that link and growth becomes reinforcing.",
      answer:
        "Can afford 50: the target is 3000 / 60 = 50 people and the workforce rises from 20 to about 46 by year 4 and 50 after that. Budget cut: the target is 900 / 60 = 15 and the workforce falls to about 15. On its own this is one balancing loop: workforce closes the gap to a fixed target. In the market growth model the budget is a share of recent revenue, and revenue depends on orders booked by the sales force, so more salespeople → more orders → more revenue → bigger budget → more salespeople. Closing that link turns the balancing adjustment into a reinforcing growth engine, which grows whenever the loop gain exceeds 1.",
      link: { label: "Workforce from Budget", hash: "/m/workforceFromBudget" },
    },
    {
      prompt:
        "Pen and paper: compute the sales loop's open-loop steady-state gain for the base case (price $10,000, fraction of revenue to sales 0.20, cost $8,000 per representative per month). What sales effectiveness is needed for growth? How does the threshold change if the budget share rises to 25%, or the price falls to $8,000?",
      hint: "Growth needs Effectiveness × Price × Share / Cost > 1: above 4 units per person per month in the base case, 3.2 with a 25% share, and 5 at the lower price.",
      answer:
        "Each salesperson books E units a month, which bring E × $10,000 of revenue, of which 20% goes to sales, enough to fund E × 2000 / 8000 = 0.25 E new salespeople. The loop gain is E × P × share / cost, and growth needs it above 1: E > 8000 / (10,000 × 0.2) = 4 units per person per month. With a 25% share the threshold is 8000 / 2500 = 3.2, and at a price of $8,000 it is 8000 / 1600 = 5. Raising the budget share or the price lowers the bar for growth; anything that cuts sales effectiveness (such as long delivery delays) can push the gain below 1 and stop growth.",
    },
    {
      prompt:
        "Flexible goals. In Weighted Average, let Source A stand for a fixed goal for delivery delay (set it to 30) and Source B for the delay recently experienced (set it to 70), in any common unit. Move the weight on A from 1 to 0. What happens to the goal, and how would this weaken the pressure to expand capacity?",
      hint: "As weight shifts to experience, the goal rises toward the delays actually suffered, so the same delivery delay produces less expansion pressure: goal erosion.",
      answer:
        "With weight 1 on A the goal settles at 30 (the fixed goal); with weight 0.5 it sits at 50; with weight 0 it rises to 70, the delay actually experienced. Shifting weight from the fixed goal to recent experience lets the goal drift toward the delays the firm has been suffering. Since capacity expansion responds to delivery delay minus the goal, an eroding goal makes the same 70-unit delay look acceptable and removes the pressure to invest. This is the eroding goals archetype: the firm stops growing not because demand ran out but because it learned to tolerate poor delivery.",
      link: { label: "Weighted Average", hash: "/m/weightedAvg" },
    },
    {
      prompt:
        "Attribution. Use the policy resistance application to discuss why managers facing the first sales slump are likely to fire the sales VP. What evidence would point them to the capacity policy instead, and why does the VP's replacement appear to work?",
      answer:
        "When sales slump, the visible symptom is falling orders, and the obvious explanation is the person in charge of selling, so managers blame the sales VP. The actual cause is lagging capacity: delivery delay rose months earlier and customers turned away. Evidence for this: delivery delay or backlog per unit of shipments rising before orders fall, lost-order reports citing late delivery, and capacity orders lagging behind bookings. A new VP appears to work because the slump itself lowers the backlog and delivery delay, so orders recover on their own whatever the VP does; the firm learns the wrong lesson, which is classic policy resistance.",
      link: { label: "Policy resistance", hash: "/apps/social/policy-resistance" },
    },
  ],
  pitfalls: [
    "Endowing agents with perfect foresight, full knowledge of production or demand functions, or optimal solutions they could not compute.",
    "Dismissing observed behaviour as irrational instead of uncovering the premises that make it sensible from the actor's point of view.",
    "Skipping partial model tests, so a formulation error inside one decision function is mistaken for an emergent systemic insight.",
    "Replacing a simple observed heuristic with a sophisticated optimiser (simulated annealing, genetic algorithms) without field evidence that people behave that way.",
    "Using cues the actors do not trust or do not see, such as marketing forecasts that senior management ignores.",
    "Treating each department's inputs as exogenous in the full model, which hides the loops that make locally sensible policies collide.",
    "Assuming that if every subunit meets its subgoal, the organisation meets its overall goal.",
  ],
  molecules: ["backlogFlow", "capacityUtil", "univariateAnchor", "seaAnchor", "protectedSeaAnchor", "workforceFromBudget", "effectFunction", "weightedAvg"],
};
