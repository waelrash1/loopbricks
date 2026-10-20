import type { Archetype } from "@/data/learn/types";

// The classic system archetypes (Senge 1990): recurring feedback structures with a story people recognise.
// Diagrams are our own drawings; each one passes lintCld.
export const ARCHETYPES: Archetype[] = [
  {
    id: "limits-to-growth",
    name: "Limits to growth",
    story:
      "A reinforcing loop drives growth, and for a while each success makes the next one easier. The same growth slowly uses up something it depends on, such as untapped customers, space or attention. A balancing loop that was too weak to notice at first grows stronger as that limit comes closer. A new app spreads by word of mouth until most people who might want it already have it, and then sign-ups stall however hard the team pushes.",
    behaviour:
      "Growth starts slowly, speeds up, then slows and levels off in an S-shaped curve. If the limit responds with a delay, or the growth wears the limit down, the stock can overshoot and fall back.",
    cld: {
      vars: [
        { id: "wom", label: "Word of mouth", x: 80, y: 120 },
        { id: "cust", label: "Customers", x: 255, y: 120 },
        { id: "sat", label: "Saturation", x: 430, y: 120 },
        { id: "size", label: "Market size", x: 430, y: 225 },
      ],
      links: [
        { from: "wom", to: "cust", sign: "+", curve: -56 },
        { from: "cust", to: "wom", sign: "+", curve: -56 },
        { from: "cust", to: "sat", sign: "+", curve: -56 },
        { from: "sat", to: "cust", sign: "−", curve: -56 },
        { from: "size", to: "sat", sign: "−" },
      ],
      loops: [
        { type: "R", label: "R", x: 167, y: 120 },
        { type: "B", label: "B", x: 342, y: 120 },
      ],
      caption:
        '<span class="chip chipR">R</span> <b>Word of mouth</b>: more customers tell more people, who become customers in turn. <span class="chip chipB">B</span> <b>Saturation</b>: as customers fill up the <code>Market size</code>, fewer people are left to win, and growth slows. Early on R dominates; near the limit B takes over.',
    },
    trap: "The early, fast growth looks like proof that the strategy works, so when growth slows people push harder on the same engine. Pushing the reinforcing loop only brings the limit closer and makes the balancing loop bite harder.",
    leverage:
      "Find the limiting factor and work on it instead of the growth engine. Ask early what will stop the growth, and raise or move that limit before it binds. Where the limit cannot move, plan for the plateau rather than fight it.",
    molecules: ["logistic", "ceiling", "diffusion"],
    cases: [
      { label: "Limits to growth", hash: "/apps/environment/limits-to-growth" },
      { label: "How a new product spreads: the Bass model", hash: "/apps/business/new-product-diffusion" },
      { label: "An outbreak: who gets infected, and when it turns", hash: "/apps/health/epidemic" },
    ],
    sources: ["Senge 1990", "Sterman 2000, pp. 118-122"],
  },
  {
    id: "balancing-delay",
    name: "Balancing loop with delay",
    story:
      "A balancing loop pushes a stock toward a goal, but each correction takes time to show up. The person in charge sees that the gap is still open and keeps adding correction, without counting what is already on its way. When the delayed corrections arrive, they carry the stock past the goal and the gap opens in the other direction. A shop that reorders every week without counting deliveries still in transit ends up overstocked, then cuts orders too hard and runs short.",
    behaviour:
      "The stock overshoots its goal and then swings above and below it. With a long delay or a strong response the swings can grow before they die out.",
    cld: {
      vars: [
        { id: "gap", label: "Gap", x: 260, y: 60 },
        { id: "ord", label: "Orders", x: 430, y: 135 },
        { id: "del", label: "Deliveries", x: 260, y: 215 },
        { id: "inv", label: "Inventory", x: 90, y: 135 },
        { id: "goal", label: "Desired inventory", x: 90, y: 30 },
      ],
      links: [
        { from: "gap", to: "ord", sign: "+", curve: -25 },
        { from: "ord", to: "del", sign: "+", curve: -25, note: "delay" },
        { from: "del", to: "inv", sign: "+", curve: -25 },
        { from: "inv", to: "gap", sign: "−", curve: -25 },
        { from: "goal", to: "gap", sign: "+" },
      ],
      loops: [{ type: "B", label: "B", x: 260, y: 135 }],
      caption:
        '<span class="chip chipB">B</span> <b>Restocking</b>: when <code>Inventory</code> falls below <code>Desired inventory</code>, the <code>Gap</code> raises orders, and deliveries refill the stock. The <b>delay</b> between orders and deliveries lets orders keep flowing after the gap has closed, so the stock overshoots.',
    },
    trap: "Each decision looks sensible against what you can see today, because the gap really is still open. The cause of the swings is the delay between action and result, which is invisible in the moment, so people blame outside shocks or someone else's mistakes.",
    leverage:
      "Count the corrections already in the pipeline before adding more. Respond more gently to the gap, or shorten the delay if you can. Reacting faster without counting the pipeline usually makes the swings worse.",
    molecules: ["lowVisPipeline", "stockmgmt", "material"],
    cases: [
      { label: "The bullwhip effect in supply chains", hash: "/apps/business/bullwhip" },
      { label: "The hog cycle: why commodity supply swings", hash: "/apps/economics/hog-cycle" },
      { label: "Office building booms and gluts", hash: "/apps/economics/office-cycle" },
    ],
    sources: ["Senge 1990", "Sterman 2000, pp. 114-116"],
  },
  {
    id: "fixes-that-fail",
    name: "Fixes that fail",
    story:
      "A problem appears, and a quick fix makes it go away for now. The fix also sets off a side effect that takes a while to arrive, and the side effect feeds the original problem. When the problem returns, the obvious move is to apply the same fix again, which feeds the side effect further. A team that falls behind schedule works overtime, gets tired, makes more mistakes and falls further behind.",
    behaviour:
      "The problem eases right after each fix and then comes back, often worse than before. Over time the fixes come more often while the underlying problem grows.",
    cld: {
      vars: [
        { id: "late", label: "Work behind schedule", x: 120, y: 135 },
        { id: "ot", label: "Overtime", x: 390, y: 50 },
        { id: "fat", label: "Fatigue and errors", x: 390, y: 220 },
      ],
      links: [
        { from: "late", to: "ot", sign: "+", curve: 28 },
        { from: "ot", to: "late", sign: "−", curve: 90 },
        { from: "ot", to: "fat", sign: "+", curve: -25, note: "delay" },
        { from: "fat", to: "late", sign: "+", curve: -25 },
      ],
      loops: [
        { type: "B", label: "B", x: 250, y: 70 },
        { type: "R", label: "R", x: 320, y: 145 },
      ],
      caption:
        '<span class="chip chipB">B</span> <b>Quick fix</b>: falling behind brings <code>Overtime</code>, which catches up on the work. <span class="chip chipR">R</span> <b>Side effect</b>: overtime builds <code>Fatigue and errors</code> after a <b>delay</b>, which puts more work behind schedule and calls for still more overtime.',
    },
    trap: "The fix works in the short run, so the first evidence people see rewards it. The side effect arrives later and from a different direction, so few people connect it to the fix.",
    leverage:
      "Trace the side effects of the fix and look beyond the first few weeks. Use the fix sparingly, or pair it with action against the side effect, such as capping overtime and protecting rest. Above all, ask what keeps creating the problem in the first place.",
    molecules: ["prodFatigue", "effectFatigue", "overtime"],
    cases: [
      { label: "Crunch: overtime that backfires", hash: "/apps/projects/crunch" },
      { label: "Nurse staffing, overtime and burnout", hash: "/apps/health/nurse-staffing" },
      { label: "Antibiotic prescribing and resistance", hash: "/apps/health/amr" },
    ],
    sources: ["Senge 1990", "Sterman 2000, pp. 59-60"],
  },
  {
    id: "shifting-the-burden",
    name: "Shifting the burden",
    story:
      "A problem can be met in two ways: a quick fix that eases the symptom, or a slower fundamental solution that removes the cause. The quick fix brings relief sooner, so it gets used first and most. Using it also draws time and attention away from the fundamental solution, which grows weaker. A plant that answers every breakdown with heroic firefighting never finds time for the maintenance and process work that would stop the breakdowns.",
    behaviour:
      "The symptom stays under control for a while, but reliance on the quick fix keeps rising while the ability to apply the fundamental solution fades. In the end the system cannot cope without the quick fix.",
    cld: {
      size: [540, 285],
      vars: [
        { id: "gap", label: "Performance gap", x: 140, y: 142 },
        { id: "hard", label: "Working harder", x: 140, y: 32 },
        { id: "imp", label: "Improvement work", x: 140, y: 252 },
        { id: "time", label: "Time to improve", x: 430, y: 142 },
      ],
      links: [
        { from: "gap", to: "hard", sign: "+", curve: 30 },
        { from: "hard", to: "gap", sign: "−", curve: 75 },
        { from: "gap", to: "imp", sign: "+", curve: -30, note: "delay" },
        { from: "imp", to: "gap", sign: "−", curve: -75 },
        { from: "hard", to: "time", sign: "−", curve: -20 },
        { from: "time", to: "imp", sign: "+", curve: -20 },
      ],
      loops: [
        { type: "B", label: "B1", x: 128, y: 87 },
        { type: "B", label: "B2", x: 128, y: 197 },
        { type: "R", label: "R", x: 290, y: 142 },
      ],
      caption:
        '<span class="chip chipB">B1</span> <b>Quick fix</b>: a <code>Performance gap</code> calls for <code>Working harder</code>, which closes the gap fast. <span class="chip chipB">B2</span> <b>Fundamental fix</b>: the gap also prompts <code>Improvement work</code>, which removes the cause, but only after a <b>delay</b>. <span class="chip chipR">R</span> <b>Shifting the burden</b>: working harder eats the <code>Time to improve</code>, so less improvement gets done and the gap keeps coming back.',
    },
    trap: "The quick fix gives fast, visible relief, while the fundamental solution pays off slowly and out of sight. Each use of the quick fix makes the fundamental solution harder to afford next time, so dependence deepens without anyone choosing it.",
    leverage:
      "Protect time and money for the fundamental solution, even while the symptom hurts. Use the quick fix only as a bridge, and say so openly. Make its long-run cost visible, for example by tracking how much effort goes to firefighting and how much to improvement.",
    molecules: ["closegap", "weightedSplit", "decay"],
    cases: [
      { label: "Capability traps in process improvement", hash: "/apps/business/capability-trap" },
      { label: "Firefighting in product development", hash: "/apps/projects/firefighting" },
    ],
    sources: ["Senge 1990"],
  },
  {
    id: "eroding-goals",
    name: "Eroding goals",
    story:
      "When performance falls short of a goal, there are two ways to close the gap: improve performance or lower the goal. Improvement takes effort and time, while lowering the goal is quick and painless. If the goal slides a little each time the gap persists, nothing is left to pull performance up. A firm that misses its delivery target month after month may quietly redefine what counts as on time, and the weaker standard becomes the new normal.",
    behaviour:
      "The goal and actual performance drift down together, step by step, with no single dramatic drop. Years later both sit well below where they started.",
    cld: {
      size: [600, 280],
      vars: [
        { id: "goal", label: "Quality target", x: 120, y: 50 },
        { id: "gap", label: "Quality gap", x: 300, y: 140 },
        { id: "press", label: "Pressure to lower target", x: 478, y: 50 },
        { id: "eff", label: "Improvement effort", x: 478, y: 230 },
        { id: "act", label: "Actual quality", x: 120, y: 230 },
      ],
      links: [
        { from: "goal", to: "gap", sign: "+" },
        { from: "gap", to: "press", sign: "+" },
        { from: "press", to: "goal", sign: "−" },
        { from: "act", to: "gap", sign: "−" },
        { from: "gap", to: "eff", sign: "+" },
        { from: "eff", to: "act", sign: "+", curve: -16, note: "delay" },
      ],
      loops: [
        { type: "B", label: "B2", x: 300, y: 85 },
        { type: "B", label: "B1", x: 300, y: 195 },
      ],
      caption:
        '<span class="chip chipB">B1</span> <b>Improve</b>: a <code>Quality gap</code> drives <code>Improvement effort</code>, which raises <code>Actual quality</code> after a <b>delay</b>. <span class="chip chipB">B2</span> <b>Erode the goal</b>: the same gap builds pressure to lower the <code>Quality target</code>, which closes the gap with no improvement at all. The faster loop tends to win, and B2 is usually faster.',
    },
    trap: "Each small cut to the goal feels realistic rather than like giving up. Because the goal follows recent performance, the gap never looks large, so no alarm goes off.",
    leverage:
      "Anchor the goal to something outside the system's own recent results, such as customer needs, a benchmark or an external standard. Make any change to the goal an explicit, recorded decision. Then put the effort into the improvement loop, not the goal.",
    molecules: ["seaAnchor", "smooth", "protectedSeaAnchor"],
    cases: [
      { label: "Service quality erosion: cutting corners", hash: "/apps/business/service-quality" },
      { label: "Price anchoring and drift", hash: "/apps/economics/price-anchoring" },
    ],
    sources: ["Senge 1990", "Sterman 2000, p. 168", "Sterman 2000, pp. 532-535"],
  },
  {
    id: "escalation",
    name: "Escalation",
    story:
      "Two parties each judge their own position by comparing it with the other's. When one side pulls ahead, the other feels threatened and acts to catch up, which makes the first side feel threatened in turn. Each response is meant to restore balance, yet together the responses carry both sides far beyond what either wanted. Two shops that keep matching and beating each other's discounts can end up selling below cost.",
    behaviour:
      "Both sides' activity climbs in steps of move and counter move, until one side gives up or runs out of resources, or both agree to stop.",
    cld: {
      size: [600, 270],
      vars: [
        { id: "rel", label: "Our sales vs theirs", x: 300, y: 135 },
        { id: "ourCut", label: "Our price cuts", x: 110, y: 45 },
        { id: "ourS", label: "Our sales", x: 110, y: 225 },
        { id: "theirCut", label: "Their price cuts", x: 490, y: 45 },
        { id: "theirS", label: "Their sales", x: 490, y: 225 },
      ],
      links: [
        { from: "rel", to: "ourCut", sign: "−", curve: -20 },
        { from: "ourCut", to: "ourS", sign: "+", curve: -20 },
        { from: "ourS", to: "rel", sign: "+", curve: -20 },
        { from: "rel", to: "theirCut", sign: "+", curve: 20 },
        { from: "theirCut", to: "theirS", sign: "+", curve: 20 },
        { from: "theirS", to: "rel", sign: "−", curve: 20 },
      ],
      loops: [
        { type: "B", label: "B1", x: 160, y: 135 },
        { type: "B", label: "B2", x: 440, y: 135 },
      ],
      caption:
        '<span class="chip chipB">B1</span> <b>Our response</b>: when <code>Our sales vs theirs</code> slips, we cut prices, which lifts our sales. <span class="chip chipB">B2</span> <b>Their response</b>: when our lead grows, they cut prices, which lifts their sales. Each loop balances on its own, but together they form a figure of eight that behaves as a <b>reinforcing</b> spiral: every cut by one side triggers a cut by the other.',
    },
    trap: "Each side sees only its own balancing loop: it is just responding to the other. Neither sees that its own response is the threat the other side reacts to, so each blames the other for starting it.",
    leverage:
      "Look for a way for both sides to win, or for one side to step back on purpose and break the cycle. Judge your position against your own needs rather than against the rival. Agreements that cap the activity on both sides can stop the spiral.",
    molecules: ["closegap", "seaAnchorPricing", "protSeaAnchorPricing"],
    cases: [
      { label: "Bounded rationality module: an unintended price war", hash: "/learn/behaviour" },
    ],
    sources: ["Senge 1990", "Sterman 2000, p. 12", "Sterman 2000, pp. 603-604"],
  },
  {
    id: "success-to-the-successful",
    name: "Success to the successful",
    story:
      "Two people, teams or products compete for the same limited pool of resources. Whoever does a little better early on gets a bigger share, which helps them do better still, while the other gets less and falls further behind. Soon the split reflects past allocations more than real merit. A manager who gives the best projects to whoever shines in the first month can turn that person into the star and the other into a disappointment.",
    behaviour:
      "Small early differences widen until one side takes almost everything and the other withers, even when both started out nearly equal.",
    cld: {
      size: [600, 270],
      vars: [
        { id: "tilt", label: "Budget tilted to team A", x: 300, y: 135 },
        { id: "resA", label: "Resources for A", x: 100, y: 45 },
        { id: "sucA", label: "Success of A", x: 100, y: 225 },
        { id: "resB", label: "Resources for B", x: 500, y: 45 },
        { id: "sucB", label: "Success of B", x: 500, y: 225 },
      ],
      links: [
        { from: "tilt", to: "resA", sign: "+", curve: -20 },
        { from: "resA", to: "sucA", sign: "+", curve: -20 },
        { from: "sucA", to: "tilt", sign: "+", curve: -20 },
        { from: "tilt", to: "resB", sign: "−", curve: 20 },
        { from: "resB", to: "sucB", sign: "+", curve: 20 },
        { from: "sucB", to: "tilt", sign: "−", curve: 20 },
      ],
      loops: [
        { type: "R", label: "R1", x: 150, y: 135 },
        { type: "R", label: "R2", x: 450, y: 135 },
      ],
      caption:
        '<span class="chip chipR">R1</span> <b>A wins</b>: tilting the budget toward team A gives it more <code>Resources for A</code>, its success grows, and that success tilts the budget further. <span class="chip chipR">R2</span> <b>B loses</b>: the same tilt cuts <code>Resources for B</code>, its success falls, and its weaker results tilt the budget further toward A. Both loops push the same way.',
    },
    trap: "The winner's success looks like proof that it deserved the resources, and the loser's decline looks like proof that it did not. Few people notice that the allocation rule itself created the gap.",
    leverage:
      "Judge each side on its own potential rather than on its recent results relative to the other. Decouple the two, for example by giving each its own resources, or set goals that do not depend on winning the shared pool. Watch for lock-in early, while the gap is still small.",
    molecules: ["marketshare", "propSplit", "nonlinearSplit"],
    cases: [
      { label: "Competing standards and lock-in", hash: "/apps/business/lock-in" },
    ],
    sources: ["Senge 1990", "Sterman 2000, pp. 349-358"],
  },
  {
    id: "tragedy-of-the-commons",
    name: "Tragedy of the commons",
    story:
      "Several users share a resource that nobody owns, such as a fishing ground, a pasture or an aquifer. Each user gets the full benefit of using a bit more, while the cost of running the resource down is spread across everyone. So each user keeps expanding, and total use climbs past what the resource can sustain. When the fish stock collapses, every fleet loses, including those that tried to hold back.",
    behaviour:
      "Total use grows for a while and every user does well. Then the yield per user falls, users push harder to protect their income, and the resource can crash, sometimes beyond recovery.",
    cld: {
      size: [760, 340],
      vars: [
        { id: "boatsA", label: "Fleet A boats", x: 120, y: 60 },
        { id: "profA", label: "Profit of fleet A", x: 120, y: 280 },
        { id: "boatsB", label: "Fleet B boats", x: 640, y: 60 },
        { id: "profB", label: "Profit of fleet B", x: 640, y: 280 },
        { id: "catch", label: "Total catch", x: 380, y: 60 },
        { id: "fish", label: "Fish stock", x: 380, y: 170 },
        { id: "cpb", label: "Catch per boat", x: 380, y: 280 },
      ],
      links: [
        { from: "boatsA", to: "profA", sign: "+", curve: 60 },
        { from: "profA", to: "boatsA", sign: "+", curve: 60 },
        { from: "boatsB", to: "profB", sign: "+", curve: 60 },
        { from: "profB", to: "boatsB", sign: "+", curve: 60 },
        { from: "boatsA", to: "catch", sign: "+" },
        { from: "boatsB", to: "catch", sign: "+" },
        { from: "catch", to: "fish", sign: "−", note: "delay" },
        { from: "fish", to: "cpb", sign: "+" },
        { from: "cpb", to: "profA", sign: "+" },
        { from: "cpb", to: "profB", sign: "+" },
      ],
      loops: [
        { type: "R", label: "R1", x: 120, y: 170 },
        { type: "B", label: "B1", x: 260, y: 170 },
        { type: "B", label: "B2", x: 500, y: 170 },
        { type: "R", label: "R2", x: 640, y: 170 },
      ],
      caption:
        '<span class="chip chipR">R1</span> <span class="chip chipR">R2</span> <b>Growth from profit</b>: each fleet reinvests its profit in more boats, and more boats bring more profit. <span class="chip chipB">B1</span> <span class="chip chipB">B2</span> <b>Shared limit</b>: every boat adds to <code>Total catch</code>, which draws down the <code>Fish stock</code> and lowers the <code>Catch per boat</code> that both fleets earn. Each fleet keeps all of its own catch but bears only part of the decline.',
    },
    trap: "For each user, expanding is the rational choice, and the damage shows up slowly and is shared by all. By the time the decline is clear, the fleet or herd has been built, and cutting back hurts everyone at once.",
    leverage:
      "Manage the commons as a whole, through agreed limits, quotas, fees or ownership rules that make each user bear the cost of their own use. Measure the state of the resource directly and act on it before yields fall. Goodwill helps, but rules that change the payoff work more reliably.",
    molecules: ["logistic", "actionFromResource", "growth"],
    cases: [
      { label: "Fisheries: overinvestment and overfishing", hash: "/apps/environment/fishery" },
      { label: "Groundwater: pumping faster than recharge", hash: "/apps/environment/groundwater" },
      { label: "Antibiotic prescribing and resistance", hash: "/apps/health/amr" },
    ],
    sources: ["Senge 1990"],
  },
  {
    id: "growth-and-underinvestment",
    name: "Growth and underinvestment",
    story:
      "A business grows, and growth would continue if capacity kept up with demand. As demand nears capacity, service slips, for example deliveries get slower, and slow service drives some customers away. The firm could add capacity, but it waits for clear proof that demand is real, and it may come to accept slow service as normal. Growth stalls, which seems to confirm that investing would have been a mistake.",
    behaviour:
      "Growth slows or stops long before the market is saturated, often with swings in backlog and delivery delay. Demand and capacity can stagnate together, each holding the other back.",
    cld: {
      size: [760, 340],
      vars: [
        { id: "sales", label: "Sales force", x: 90, y: 200 },
        { id: "ord", label: "Orders", x: 270, y: 200 },
        { id: "dd", label: "Delivery delay", x: 450, y: 200 },
        { id: "std", label: "Acceptable delay", x: 450, y: 55 },
        { id: "press", label: "Pressure to invest", x: 650, y: 110 },
        { id: "cap", label: "Capacity", x: 650, y: 295 },
      ],
      links: [
        { from: "sales", to: "ord", sign: "+", curve: -56 },
        { from: "ord", to: "sales", sign: "+", curve: -56 },
        { from: "ord", to: "dd", sign: "+", curve: -56 },
        { from: "dd", to: "ord", sign: "−", curve: -56 },
        { from: "dd", to: "std", sign: "+" },
        { from: "std", to: "press", sign: "−" },
        { from: "dd", to: "press", sign: "+" },
        { from: "press", to: "cap", sign: "+", curve: -20, note: "delay" },
        { from: "cap", to: "dd", sign: "−", curve: -20 },
      ],
      loops: [
        { type: "R", label: "R1", x: 180, y: 200 },
        { type: "B", label: "B1", x: 360, y: 200 },
        { type: "R", label: "R2", x: 520, y: 105 },
        { type: "B", label: "B2", x: 590, y: 200 },
      ],
      caption:
        '<span class="chip chipR">R1</span> <b>Sales growth</b>: orders pay for a bigger <code>Sales force</code>, which books more orders. <span class="chip chipB">B1</span> <b>Slow delivery</b>: more orders lengthen the <code>Delivery delay</code>, which turns customers away. <span class="chip chipB">B2</span> <b>Investment</b>: long delays create <code>Pressure to invest</code>, and new <code>Capacity</code> shortens the delay, but only after a long <b>delay</b>. <span class="chip chipR">R2</span> <b>Eroding standard</b>: when long delays become normal, the <code>Acceptable delay</code> rises, the pressure to invest fades, and delays stay long.',
    },
    trap: "The limit is self-made, but it looks like a market limit, so holding back investment seems justified by weak demand. Letting the service standard slide makes the shortfall feel acceptable and hides the need to invest.",
    leverage:
      "Invest in capacity ahead of demand when there is real potential for growth. Hold the performance standard firm, set by what customers need rather than by recent performance. Track the demand being turned away, not only the demand being served.",
    molecules: ["capacityUtil", "backlogFlow", "seaAnchor"],
    cases: [
      { label: "Growth stalled by capacity investment", hash: "/apps/business/market-growth" },
    ],
    sources: ["Senge 1990", "Sterman 2000, pp. 605-628"],
  },
  {
    id: "accidental-adversaries",
    name: "Accidental adversaries",
    story:
      "Two partners, such as a supplier and a retailer, work together because each one's success helps the other. Under pressure, each partner takes a local step to improve its own results, like cutting stock or paying invoices late. That step quietly hurts the other partner, who answers with a local fix of its own that hurts the first. Over time the partners come to see each other as the problem, although neither set out to do harm.",
    behaviour:
      "The partnership starts with joint growth, then results stall or decline for both while mistrust rises. Each side's local fixes come more often as joint performance falls.",
    cld: {
      size: [760, 400],
      vars: [
        { id: "sa", label: "A's success", x: 200, y: 200 },
        { id: "sb", label: "B's success", x: 560, y: 200 },
        { id: "fa", label: "A's local fix", x: 200, y: 50 },
        { id: "fb", label: "B's local fix", x: 560, y: 350 },
      ],
      links: [
        { from: "sa", to: "sb", sign: "+", curve: 70 },
        { from: "sb", to: "sa", sign: "+", curve: 70 },
        { from: "sa", to: "fa", sign: "−", curve: 50 },
        { from: "fa", to: "sa", sign: "+", curve: 50 },
        { from: "sb", to: "fb", sign: "−", curve: 50 },
        { from: "fb", to: "sb", sign: "+", curve: 50 },
        { from: "fa", to: "sb", sign: "−", curve: -30 },
        { from: "fb", to: "sa", sign: "−", curve: -30 },
      ],
      loops: [
        { type: "R", label: "R1", x: 335, y: 200 },
        { type: "R", label: "R4", x: 425, y: 200 },
        { type: "B", label: "B1", x: 200, y: 125 },
        { type: "B", label: "B2", x: 560, y: 275 },
        { type: "R", label: "R2", x: 300, y: 115 },
        { type: "R", label: "R3", x: 460, y: 285 },
      ],
      caption:
        '<span class="chip chipR">R1</span> <b>Partnership</b>: each partner\'s success feeds the other\'s. <span class="chip chipB">B1</span> <span class="chip chipB">B2</span> <b>Local fixes</b>: when its own success slips, each partner applies a <code>local fix</code> that restores it. <span class="chip chipR">R2</span> <span class="chip chipR">R3</span> <b>Collateral damage</b>: each fix hurts the other partner, whose weaker results then help the fixer less. <span class="chip chipR">R4</span> <b>Adversaries</b>: the two fixes feed each other through both partners, so each side\'s fix provokes the other\'s.',
    },
    trap: "Each partner sees the benefit of its own fix and the harm done by the other's. The damage from one's own fix comes back through the partner, so it looks like the partner's fault rather than a result of one's own action.",
    leverage:
      "Bring the partners together to map how each one's actions affect the other. Agree on shared measures of joint success and test local fixes against them. Rebuild the original reinforcing loop by investing in actions that help the other side.",
    molecules: ["growth", "closegap"],
    cases: [
      { label: "Evictions, arrears and the low-income rental market", hash: "/apps/social/rental-housing" },
    ],
    sources: ["Senge 1990"],
  },
  {
    id: "policy-resistance",
    name: "Policy resistance",
    story:
      "A policy pushes a system toward a goal, but other actors in the system have goals of their own and respond to the change. Their responses offset the policy, so the system ends up close to where it started, or somewhere worse. Building roads to cut congestion is the classic case. Faster roads attract more drivers and longer trips, until traffic is about as slow as before.",
    behaviour:
      "The policy shows early success, then results drift back toward the old level. Each new round of the same policy costs more and changes less.",
    cld: {
      size: [640, 290],
      vars: [
        { id: "tt", label: "Travel time", x: 320, y: 150 },
        { id: "press", label: "Pressure to build roads", x: 120, y: 55 },
        { id: "cap", label: "Road capacity", x: 140, y: 245 },
        { id: "goal", label: "Desired travel time", x: 345, y: 45 },
        { id: "attr", label: "Attractiveness of driving", x: 520, y: 115 },
        { id: "vol", label: "Traffic volume", x: 520, y: 245 },
      ],
      links: [
        { from: "tt", to: "press", sign: "+", curve: 20 },
        { from: "press", to: "cap", sign: "+", curve: 20, note: "delay" },
        { from: "cap", to: "tt", sign: "−", curve: 20 },
        { from: "goal", to: "press", sign: "−" },
        { from: "tt", to: "attr", sign: "−", curve: -20 },
        { from: "attr", to: "vol", sign: "+", curve: -20 },
        { from: "vol", to: "tt", sign: "+", curve: -20 },
      ],
      loops: [
        { type: "B", label: "B1", x: 190, y: 150 },
        { type: "B", label: "B2", x: 450, y: 180 },
      ],
      caption:
        '<span class="chip chipB">B1</span> <b>Road building</b>: when <code>Travel time</code> exceeds the <code>Desired travel time</code>, pressure builds to add <code>Road capacity</code>, which cuts travel time after a <b>delay</b>. <span class="chip chipB">B2</span> <b>Extra trips</b>: shorter travel time makes driving more attractive, which raises <code>Traffic volume</code> and pushes travel time back up. B2 compensates for B1.',
    },
    trap: "Policy makers see the direct effect of their action, not the feedback it sets off in others. When the problem returns, the natural reaction is to push harder on the same policy, which strengthens the compensating response.",
    leverage:
      "Map the goals of every actor and the ways each one can respond. Look for a goal all parties share, or for policies that change what drives the response, such as pricing road use. Expect compensating feedback, and test a policy in a model before committing to it.",
    molecules: ["closegap", "multivariateAnchor", "effectFunction"],
    cases: [
      { label: "Policy resistance: why obvious fixes backfire", hash: "/apps/social/policy-resistance" },
      { label: "Feedback loops module: traffic and road building", hash: "/learn/loops" },
    ],
    sources: ["Senge 1990", "Sterman 2000, pp. 5-12", "Sterman 2000, pp. 177-190"],
  },
];
