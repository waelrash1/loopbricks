import type { StudyChapter } from "@/data/sterman/types";

export const CHAPTER: StudyChapter = {
  id: "ch04",
  number: "4",
  title: "Structure and behavior of dynamic systems",
  part: "Part I Perspective and process",
  pages: "107-133",
  summary:
    "Behaviour comes from structure. Most of the dynamics we observe are variations on a handful of modes, and each mode has a recognisable feedback structure behind it: reinforcing loops produce exponential growth, balancing loops produce goal seeking, and balancing loops with delays produce oscillation. S-shaped growth, growth with overshoot and overshoot and collapse arise when these basic structures interact nonlinearly. It is also useful to separate stasis, random variation and the family of oscillations (damped, limit cycle, chaos), and turns the link between structure and behaviour into a practical heuristic: the shape of a reference mode tells you which kind of loop must have been dominant, and which latent loops you still need to look for.",
  bigIdeas: [
    {
      title: "A small set of modes covers most dynamics",
      text: "Despite the variety of change around us, nearly every time series is an instance of a few patterns: exponential growth, goal seeking, oscillation, S-shaped growth, S-shaped growth with overshoot, and overshoot and collapse. The first three are fundamental, each created by one simple feedback structure. The other three come from nonlinear interactions among those structures. Learning to recognise the mode is the first step in guessing the structure.",
      pages: "108",
    },
    {
      title: "Exponential growth comes from a dominant reinforcing loop",
      text: "When the net increase of a quantity depends on the quantity itself, more produces more: interest earns interest, people have children who have children. Because the increase is proportional to the state, the fractional growth rate is constant and so is the doubling time; it takes as long to go from 1 to 2 as from a million to two million. The same positive loop can run in reverse, producing self-reinforcing decline such as a falling share price that erodes confidence and triggers more selling.",
      pages: "108-109",
    },
    {
      title: "True linear growth is rare",
      text: "A straight line requires the net increase to stay constant while the state changes, which means there is no feedback from the state to its own rate of change. That is uncommon in real systems. Apparent linear growth is often exponential growth viewed over a horizon too short to see the acceleration, so a near-straight segment of data is a prompt to widen the time window rather than proof of no feedback.",
      pages: "109",
    },
    {
      title: "A rate is not always a rate: absolute versus fractional",
      text: "In models, a rate is a flow in units per time period (births in people per year). Everyday speech also uses rate for a ratio or a fractional rate (births per thousand people per year, the interest rate, the unemployment rate). Fractional rates have units of 1/time, so a credit card does not charge 12% but 12% per year, which is 1% per month. Checking units is the quickest way to stop absolute and fractional rates being mixed up in an equation.",
      pages: "109-111",
    },
    {
      title: "Goal seeking comes from a balancing loop with an explicit or implicit goal",
      text: "Every balancing loop compares the state of the system with a goal and takes corrective action in proportion to the gap. Goals can be set by a decision maker (desired inventory), be physiological (the sleep you need), or be physical (room temperature for a cooling cup of coffee). Because large gaps produce large corrections and small gaps small ones, the approach slows as the goal nears. With a linear response the result is exponential decay of the gap, characterised by a constant half-life.",
      pages: "111-112",
    },
    {
      title: "Oscillation is a balancing loop with significant delays",
      text: "If information about the state arrives late, if decisions take time, or if corrective actions take time to change the state, the correction keeps going after the goal has been reached. The system overshoots, reverses, undershoots and repeats. A delay at any one point in the loop (measurement and reporting, decision making, or action) can be enough. Real cycles such as the business cycle are irregular because the system is also bombarded by outside shocks, not because the underlying loop is absent.",
      pages: "114-115",
    },
    {
      title: "S-shaped growth: a reinforcing loop meets a fast, nonlinear limit",
      text: "Growth starts exponentially, then slows and settles at the carrying capacity. As the state grows, resources per unit fall, which lowers the fractional net increase rate until net growth is zero. The inflection point is where loop dominance shifts: before it an extra unit adds more to growth than it subtracts through scarcity; after it the reverse holds. S-shaped growth needs two conditions: the balancing loop must act without significant delay, and the carrying capacity must not be consumed by the growth.",
      pages: "118-121",
    },
    {
      title: "Delay in the limiting loop gives overshoot and oscillation",
      text: "When the balancing loops that constrain growth respond late, the state keeps growing after the carrying capacity has been reached, overshoots it, and then oscillates around it. The structure is the same as for S-shaped growth; what changes is the delay in sensing or responding to resource scarcity. City populations and commodity production booms show this pattern.",
      pages: "121-122",
    },
    {
      title: "Overshoot and collapse: the population erodes its own carrying capacity",
      text: "If the carrying capacity is consumed or degraded by the population, a second balancing loop appears: growth reduces resources per unit and also reduces the total resource. When the population peaks, the resource is being destroyed at its fastest rate, so the decline continues and the population falls. With a non-renewable resource the only equilibrium is zero; regeneration or a renewable supply is needed for a positive equilibrium.",
      pages: "123-125",
    },
    {
      title: "Stasis and randomness are also explained by structure, or by ignorance",
      text: "Constancy arises either because change is too slow to see within your time horizon, or because strong balancing loops hold the state in place despite disturbances. Apparent randomness is mostly a measure of what we do not know about people's decision rules and local conditions. Noise still matters: a stream of small shocks can excite latent oscillatory modes, knock a system off a local optimum, or tip it towards one of several possible paths.",
      pages: "127-128",
    },
    {
      title: "Damped oscillations, limit cycles and chaos share one structure",
      text: "A damped oscillation returns to equilibrium after a disturbance (locally stable). A limit cycle arises when the equilibrium is locally unstable, so swings grow until nonlinearities bound them and the system settles on a closed orbit. Chaos is a bounded, deterministic oscillation that never repeats and shows sensitive dependence on initial conditions, which makes the forecast horizon short even with a perfect model. In a model of the Beer Distribution Game all three come from the same loops; only the parameters of the ordering rule differ.",
      pages: "129-133",
    },
    {
      title: "Use the behaviour to guide the search for structure, then look for latent loops",
      text: "If a variable grows exponentially, at least one reinforcing loop must be dominant; if it oscillates, look for a balancing loop with delays and ask where they are. That heuristic speeds up conceptualisation, but data only reveal loops that have already been active. Immediately after naming the loops behind growth, ask which balancing loops could stop it: latent limits may become dominant later and shift the behaviour and the response to policy.",
      pages: "116-117",
    },
  ],
  diagrams: [
    {
      kind: "cld",
      title: "Exponential growth: one reinforcing loop",
      pages: "108-109",
      cld: {
        size: [540, 270],
        vars: [
          { id: "s", label: "State of the system", x: 140, y: 120 },
          { id: "n", label: "Net increase rate", x: 400, y: 120 },
          { id: "f", label: "Fractional growth rate", x: 400, y: 230 },
        ],
        links: [
          { from: "s", to: "n", sign: "+", curve: -56 },
          { from: "n", to: "s", sign: "+", curve: -56 },
          { from: "f", to: "n", sign: "+" },
        ],
        loops: [{ type: "R", label: "R1", x: 270, y: 120 }],
        caption:
          '<span class="chip chipR">R1</span> The state sets its own net increase, and the increase accumulates back into the state. With a constant <b>fractional growth rate</b> the doubling time is constant, so growth keeps accelerating in absolute terms. Read the loop backwards and the same structure drives a self-reinforcing decline.',
      },
    },
    {
      kind: "cld",
      title: "Goal seeking: a balancing loop closes a gap",
      pages: "111-112",
      cld: {
        vars: [
          { id: "s", label: "State of the system", x: 130, y: 135 },
          { id: "d", label: "Discrepancy", x: 320, y: 50 },
          { id: "g", label: "Desired state", x: 450, y: 135 },
          { id: "a", label: "Corrective action", x: 320, y: 225 },
        ],
        links: [
          { from: "s", to: "d", sign: "−", curve: -30 },
          { from: "g", to: "d", sign: "+", curve: 20 },
          { from: "d", to: "a", sign: "+" },
          { from: "a", to: "s", sign: "+", curve: -30 },
        ],
        loops: [{ type: "B", label: "B1", x: 240, y: 135 }],
        caption:
          '<span class="chip chipB">B1</span> The state is compared with the <b>desired state</b>; the gap drives corrective action, which moves the state towards the goal and shrinks the gap. Big gaps produce big corrections and small gaps small ones, so the approach slows as the goal nears: with a linear response the gap decays exponentially.',
      },
    },
    {
      kind: "cld",
      title: "Oscillation: the same balancing loop with delays",
      pages: "114-115",
      cld: {
        vars: [
          { id: "s", label: "State of the system", x: 120, y: 150 },
          { id: "p", label: "Perceived state", x: 250, y: 45 },
          { id: "d", label: "Discrepancy", x: 420, y: 135 },
          { id: "g", label: "Desired state", x: 440, y: 40 },
          { id: "a", label: "Corrective action", x: 290, y: 235 },
        ],
        links: [
          { from: "s", to: "p", sign: "+", curve: -20, note: "delay" },
          { from: "p", to: "d", sign: "−", curve: -10 },
          { from: "g", to: "d", sign: "+" },
          { from: "d", to: "a", sign: "+", curve: -20, note: "delay" },
          { from: "a", to: "s", sign: "+", curve: -20, note: "delay" },
        ],
        loops: [{ type: "B", label: "B1", x: 280, y: 140 }],
        caption:
          '<span class="chip chipB">B1</span> Delays in perceiving the state, in deciding, and in the action taking effect mean the correction continues after the goal is reached. The state overshoots, reverses and undershoots. A long enough delay at <b>any one</b> of the three points is sufficient for oscillation; every kind of oscillation has this core.',
      },
    },
    {
      kind: "cld",
      title: "S-shaped growth: reinforcing growth meets a fixed limit",
      pages: "118-121",
      cld: {
        size: [600, 280],
        vars: [
          { id: "n", label: "Net increase rate", x: 120, y: 60 },
          { id: "s", label: "State of the system", x: 360, y: 60 },
          { id: "a", label: "Resource adequacy", x: 360, y: 220 },
          { id: "f", label: "Fractional net increase", x: 120, y: 220 },
          { id: "c", label: "Carrying capacity", x: 500, y: 140 },
        ],
        links: [
          { from: "n", to: "s", sign: "+", curve: -40 },
          { from: "s", to: "n", sign: "+", curve: -40 },
          { from: "s", to: "a", sign: "−" },
          { from: "c", to: "a", sign: "+", curve: -16 },
          { from: "a", to: "f", sign: "+" },
          { from: "f", to: "n", sign: "+" },
        ],
        loops: [
          { type: "R", label: "R1", x: 240, y: 60 },
          { type: "B", label: "B1", x: 240, y: 150 },
        ],
        caption:
          '<span class="chip chipR">R1</span> drives early exponential growth. <span class="chip chipB">B1</span> As the state grows, resources per unit fall and the fractional net increase declines. The inflection point marks the shift in loop dominance from R1 to B1. The curve is a smooth S only if B1 acts without delay and the <b>carrying capacity</b> stays fixed.',
      },
    },
    {
      kind: "cld",
      title: "S-shaped growth with overshoot: the limit is felt late",
      pages: "121-122",
      cld: {
        size: [600, 280],
        vars: [
          { id: "n", label: "Net increase rate", x: 120, y: 60 },
          { id: "s", label: "State of the system", x: 360, y: 60 },
          { id: "a", label: "Resource adequacy", x: 360, y: 220 },
          { id: "f", label: "Fractional net increase", x: 120, y: 220 },
          { id: "c", label: "Carrying capacity", x: 500, y: 140 },
        ],
        links: [
          { from: "n", to: "s", sign: "+", curve: -40 },
          { from: "s", to: "n", sign: "+", curve: -40 },
          { from: "s", to: "a", sign: "−" },
          { from: "c", to: "a", sign: "+", curve: -16 },
          { from: "a", to: "f", sign: "+", note: "delay" },
          { from: "f", to: "n", sign: "+" },
        ],
        loops: [
          { type: "R", label: "R1", x: 240, y: 60 },
          { type: "B", label: "B1", x: 240, y: 150 },
        ],
        caption:
          '<span class="chip chipR">R1</span> <span class="chip chipB">B1</span> The same two loops as S-shaped growth, but scarcity reduces the fractional net increase only after a <b>delay</b>. Growth carries on past the carrying capacity, then reverses and oscillates around it, damping out if the delay is moderate.',
      },
    },
    {
      kind: "cld",
      title: "Overshoot and collapse: growth consumes its own carrying capacity",
      pages: "123-125",
      cld: {
        size: [640, 290],
        vars: [
          { id: "n", label: "Net increase rate", x: 110, y: 60 },
          { id: "s", label: "State of the system", x: 320, y: 60 },
          { id: "e", label: "Erosion of capacity", x: 545, y: 60 },
          { id: "a", label: "Resource adequacy", x: 320, y: 235 },
          { id: "f", label: "Fractional net increase", x: 110, y: 235 },
          { id: "c", label: "Carrying capacity", x: 545, y: 160 },
        ],
        links: [
          { from: "n", to: "s", sign: "+", curve: -40 },
          { from: "s", to: "n", sign: "+", curve: -40 },
          { from: "s", to: "a", sign: "−" },
          { from: "s", to: "e", sign: "+" },
          { from: "e", to: "c", sign: "−" },
          { from: "c", to: "a", sign: "+", curve: -16 },
          { from: "a", to: "f", sign: "+" },
          { from: "f", to: "n", sign: "+" },
        ],
        loops: [
          { type: "R", label: "R1", x: 208, y: 60 },
          { type: "B", label: "B1", x: 212, y: 150 },
          { type: "B", label: "B2", x: 430, y: 125 },
        ],
        caption:
          '<span class="chip chipR">R1</span> growth, <span class="chip chipB">B1</span> crowding, and a new <span class="chip chipB">B2</span>: the state consumes or degrades the <b>carrying capacity</b> itself. At the peak the capacity is falling fastest, so resources per unit keep shrinking and the state collapses. With no regeneration the only equilibrium is zero.',
      },
    },
  ],
  formulations: [
    {
      name: "Exponential growth and doubling time",
      equations: ["dS/dt = g · S", "S(t) = S(0) · e^(g·t)", "Doubling time = ln 2 / g ≈ 70 / (g in %/period)"],
      explain:
        "The net increase is proportional to the state, with fractional growth rate g (units 1/time). The solution is exponential and the doubling time does not depend on how large the state already is, which is the signature of a dominant reinforcing loop. The rule of 70 follows because ln 2 ≈ 0.693: at 3.5%/year a quantity doubles in about 20 years, at 1.76%/year in about 40.",
      molecule: "growth",
      pages: "108-110",
    },
    {
      name: "First-order goal seeking and half-life",
      equations: ["dS/dt = (S* − S) / AT", "Gap(t) = Gap(0) · e^(−t/AT)", "Half-life = AT · ln 2 ≈ 0.7 · AT"],
      explain:
        "The corrective action is the gap between the goal S* and the state, divided by an adjustment time AT. Because the correction shrinks with the gap, the gap decays exponentially and halves in a fixed time. A cup of coffee cooling to room temperature follows this law, with the room temperature as the goal.",
      molecule: "closegap",
      pages: "111-112",
    },
    {
      name: "Absolute and fractional rates",
      equations: ["Birth rate (people/yr) = Fractional birth rate (1/yr) × Population (people)", "12%/yr = 0.12/yr ≈ 0.01/month"],
      explain:
        "A flow has units of units per time; a fractional rate has units of 1/time. A city of one million with 20,000 births a year has a fractional birth rate of 2%/year. Writing out the units of every rate stops a ratio from being added to a flow.",
      molecule: "growth",
      pages: "109-111",
    },
    {
      name: "Logistic (S-shaped) growth",
      equations: ["dP/dt = g · P · (1 − P / C)", "Inflection at P = C / 2"],
      explain:
        "The fractional net increase g · (1 − P/C) falls linearly as the population P approaches the carrying capacity C, which stands in for falling resource adequacy. Net growth is largest at half the capacity: that is where dominance shifts from the reinforcing to the balancing loop.",
      molecule: "logistic",
      pages: "118-121",
    },
    {
      name: "Overshoot and collapse with a consumable resource",
      equations: ["dP/dt = P · g(R / P)", "dR/dt = Regeneration − c · P", "g rises with resources per capita R/P and is negative when they are scarce"],
      explain:
        "The population P grows at a fractional rate that depends on resource adequacy, and it also drains the resource R. With no regeneration the resource can only fall, so the population must eventually decline to zero. A renewable inflow to R allows a positive equilibrium, but only if consumption at that equilibrium does not exceed regeneration.",
      pages: "123-125",
    },
    {
      name: "Inventory control with a delay (oscillation)",
      equations: ["Orders = Demand + (Desired inventory − Inventory) / AT", "Inventory gains orders only after an acquisition delay"],
      explain:
        "A balancing loop corrects the inventory gap, but the correction arrives late. If the rule ignores what is already on order, orders keep coming after the gap has closed and inventory overshoots: the same oscillation seen in the Beer Distribution Game supply chain.",
      molecule: "stockmgmt",
      pages: "114-115, 129-130",
    },
  ],
  cases: [
    {
      title: "Exponential growth in very different systems",
      text: "Real US GDP grew at about 3.45%/year (doubling roughly every 20 years). World population grew at 0.86%/year in 1900 to 1950 and 1.76%/year in 1950 to 2000, so the doubling time fell from about 80 to about 40 years. The US prison population grew 3.5%/year from 1926 to 1995 and 6.8%/year from 1970, a doubling time of about 10 years, and microprocessor performance grew about 34%/year, doubling every 2 years. Different mechanisms, same reinforcing signature.",
      pages: "109-110",
    },
    {
      title: "Goal seeking: defects, load factors and road deaths",
      text: "A semiconductor maker's wafer defect rate fell from 1500 to about 150 ppm within 4 years of starting a total quality programme in 1987, and improvement slowed as the defect rate fell. Two Finnish nuclear plants started in 1978 raised their load factor quickly, then more slowly, up to about 94%. Road deaths per 100 million vehicle miles in the US declined roughly exponentially, but total deaths stayed between 30,000 and 50,000 a year because miles driven grew exponentially.",
      pages: "112-113",
    },
    {
      title: "Overshoot and collapse on Easter Island",
      text: "Polynesian settlers reached the 160 km² island between about 400 and 690. Population accelerated after about 1100 as forests were cleared for boats, buildings, rope and fuel; deforestation was nearly complete by about 1400. Soil erosion, drying streams and the loss of wood for fishing boats cut the carrying capacity. Population peaked at roughly 6,000 to 10,000 around 1600, was falling sharply by 1680, and was about 2,000 in 1786. Only 1 of some 25 native bird species still nests there. The structure is the overshoot and collapse loop set: growth eroded the resource base it depended on.",
      pages: "125-127",
    },
    {
      title: "Damped cycle, limit cycle and chaos in one supply chain model",
      text: "Simulations of a Beer Distribution Game model, with ordering rules estimated from real players, show all three oscillation types after a single step in customer demand. One set of parameters gives a damped oscillation that settles after about 70 weeks; a slightly different set gives a self-sustaining limit cycle; a third gives chaos, with factory orders swinging irregularly between 0 and about 50 units per week with an average period near 20 weeks. The feedback structure is identical; only how aggressively players correct inventory gaps differs.",
      pages: "130-133",
    },
  ],
  exercises: [
    {
      prompt:
        "Open Population Growth and run the Growing preset (birth 5%/yr, death 2%/yr). Use the rule of 70 to predict when the population first reaches 200 and 400, then check on the chart. Now set births equal to deaths and then below deaths: what do you see, and is the loop still reinforcing?",
      hint: "Net fractional growth is 3%/yr, so the doubling time is about 70 / 3 ≈ 23 years, and it stays 23 years for every doubling. Decline is the same R loop running downwards.",
      link: { label: "Population Growth", hash: "/m/growth" },
    },
    {
      prompt:
        "Contrast linear and exponential growth. Run the Bathtub with the Filling preset and Population Growth with the Growing preset. Which flow depends on its own stock? Explain why only one of them has a constant doubling time.",
      hint: "In the bathtub the inflow is a fixed number, so there is no loop from the level to its inflow and the level rises in a straight line.",
      link: { label: "Bathtub", hash: "/m/bathtub" },
    },
    {
      prompt:
        "Open Close Gap and run Reach goal (goal 60, adjustment time 5 weeks, starting at 20). Predict when half the 40-unit gap has closed, then check. Repeat with Sluggish (adjustment time 15) and Aggressive (1.5).",
      hint: "Half-life ≈ 0.7 × adjustment time: about 3.5 weeks, 10.4 weeks and 1 week. The state reaches about 40 at the half-life.",
      link: { label: "Close Gap", hash: "/m/closegap" },
    },
    {
      prompt:
        "Turn goal seeking into oscillation. In Stock Management run Stable (sees pipeline), then Oscillation (ignores it). Then raise the acquisition delay from 6 to 12 weeks with the supply-line weight at 0. Where is the delay in the balancing loop, and what happens to the amplitude and period of the swings?",
      hint: "The delay sits between ordering and arrival. Ignoring orders already placed means corrections keep going after the gap is closed.",
      link: { label: "Stock Management", hash: "/m/stockmgmt" },
    },
    {
      prompt:
        "Open Constrained Growth and run S-curve (growth rate 18%/yr, capacity 200, starting at 10). Read off the time at which the curve stops accelerating, and the population at that moment. Then try Higher capacity and Fast to cap. Does the inflection always occur at half the capacity?",
      hint: "For logistic growth the inflection is at C/2 (100 in the S-curve preset), reached after about ln(19)/0.18 ≈ 16 years.",
      link: { label: "Constrained Growth", hash: "/m/logistic" },
    },
    {
      prompt:
        "S-shaped growth with overshoot: open the boom and bust case and compare 'Fast market, ignores capacity on order' with 'Fast market, counts capacity on order', then 'Long construction delay (4 years)'. Which delay lets capacity overshoot what the market can absorb?",
      link: { label: "Boom and bust case", hash: "/apps/business/boom-bust" },
    },
    {
      prompt:
        "Overshoot with an eroding resource: open the fishery case and run 'Open access, strong investment', then 'Catch limit at maximum sustainable yield'. Track the fleet and the fish stock. Which loop lets the fleet keep growing after the fish stock has started to fall, and why does the fleet shrink so slowly?",
      hint: "Boats are bought while the catch per boat beats break-even, but they leave only as they wear out (20-year life).",
      link: { label: "Fishery case", hash: "/apps/environment/fishery" },
    },
    {
      prompt:
        "Pen and paper: pick three time series you know (a company's sales, a waiting list, a commodity price). Classify each by mode, sketch the loop structure that must have been dominant, and then list two latent loops that have not yet shown up in the data but could change the behaviour.",
      link: { label: "Reference modes", hash: "/methods/reference-modes" },
    },
  ],
  pitfalls: [
    "Reading a short, nearly straight segment of data as linear growth, when a longer horizon would show exponential acceleration.",
    "Mixing absolute rates (units per time) with fractional rates (1/time) or ratios such as an unemployment rate; quoting an interest rate without its time unit.",
    "Assuming that observed behaviour reveals all the relevant loops: latent balancing loops (limits) often have left no trace in the data yet.",
    "Expecting real cycles to be as regular as a pendulum; irregularity usually reflects outside shocks acting on an oscillatory structure, not the absence of one.",
    "Treating the carrying capacity as fixed when the population consumes, degrades or expands it; that choice decides between S-shaped growth and overshoot and collapse.",
    "Calling variation random and stopping there; randomness mostly measures what we do not yet know about decision rules and conditions.",
    "Using chaos as a buzzword; it has a precise meaning (bounded, deterministic, non-repeating oscillation with sensitive dependence on initial conditions).",
  ],
  molecules: ["growth", "bathtub", "closegap", "stockmgmt", "logistic", "diffusion", "decay"],
};
