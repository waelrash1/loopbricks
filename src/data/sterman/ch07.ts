import type { StudyChapter } from "@/data/sterman/types";

export const CHAPTER: StudyChapter = {
  id: "ch07",
  number: "7",
  title: "Dynamics of stocks and flows",
  part: "Part II Tools for systems thinking",
  pages: "231-262",
  summary:
    "Given the flows, what must the stock do? Given the stock, what must the flows have been? These are integration and differentiation, and both can be learned without formulas. The amount added to a stock over any interval is the area under its net flow; the net flow at any moment is the slope of the stock. With these two rules a modeller can sketch the behaviour of any stock from a graph of its flows, and see how accumulation smooths, delays and remembers. Two policy cases show the payoff before any feedback is considered: the climate keeps warming after emissions stop, and survey data claiming the number of people who had ever used cocaine was falling were physically impossible.",
  bigIdeas: [
    {
      title: "Static and dynamic equilibrium",
      text: "A stock is in equilibrium when its net flow is zero. If inflow and outflow are equal but non-zero, the level is constant while its contents turn over: dynamic equilibrium, like the 100 seats of the US Senate since 1959. If both flows are zero, the very same contents stay put: static equilibrium, like the stock of known Bach cantatas. A constant level says nothing about how much is flowing through.",
      pages: "232",
    },
    {
      title: "The amount added to a stock is the area under the net flow",
      text: "Split any interval into slices of length dt short enough that the net flow is nearly constant in each. The quantity added in a slice is the net flow times dt, the area of a thin rectangle, with units of (units/time) × time = units. Summing the rectangles gives the change in the stock, and the approximation improves as dt shrinks. This is exactly what simulation software does (Euler's method), and in the limit it is the integral.",
      pages: "232-234",
    },
    {
      title: "The slope of the stock is the net flow",
      text: "Graphical differentiation reverses integration: draw a tangent to the stock's trajectory, and its slope is the net rate at that instant. A straight falling segment means a constant negative net flow; a kink in the stock means a jump in the flow; a peak or trough means the net flow is crossing zero. Reading flows off a stock is the skill needed to infer what policies or decisions must have been operating from a recorded history.",
      pages: "239-241",
    },
    {
      title: "A set of rules for sketching a stock from its flows",
      text: "Draw the flows and the stock on separate, aligned axes, because their units differ. Mark the initial stock, which cannot be inferred from the flows. Break time into segments where the net flow behaves simply, add the area of each segment, and shape the curve between: positive and rising net flow means the stock accelerates upward; positive but falling means it still rises, more slowly; negative flows mirror these. Wherever the net flow is zero the stock is flat, and where it changes sign the stock has a peak or a trough.",
      pages: "235-236",
    },
    {
      title: "Accumulation creates memory and smoothness",
      text: "When an inflow steps up for a while and then steps back down, the stock rises during the step and then stays at its new, higher level: it does not return when the flow does. Only a negative net flow can bring it down. The input had two sudden jumps; the stock is continuous. Stocks therefore filter abrupt changes into gradual ones and preserve a record of everything that has happened.",
      pages: "234-235",
    },
    {
      title: "Accumulation creates delay: a quarter-cycle lag",
      text: "If the net flow oscillates, the stock oscillates with the same period but peaks a quarter cycle later, because the stock keeps rising until the net flow falls to zero. For a net flow of amplitude A and period T, the stock swings with amplitude A·T/2π. In an example from Sterman (2000), a 12-month cycle of ±50 units/month, gives stock swings of about ±96 units, peaking three months after the flow. Integration alone, with no feedback at all, is enough to create lags.",
      pages: "237-238",
    },
    {
      title: "Net flow hides the individual flows",
      text: "Differentiating a stock reveals only its net rate of change. A firm's cash is flat whether revenue and spending are both $1 million a year or both $1 billion. To separate the inflows from the outflows you need more information than the stock's history provides, which is why models often need independent data on the flows themselves.",
      pages: "240-241",
    },
    {
      title: "Calculus intuition matters more than calculus technique",
      text: "Most realistic models are high-order and nonlinear and have no analytic solution, so formal techniques rarely help directly. What modellers need, whatever their mathematical training, is the ability to relate stocks and flows by eye. Graphical integration and differentiation make that intuition explicit and checkable.",
      pages: "231-232",
    },
    {
      title: "Stabilising emissions does not stabilise the climate",
      text: "Atmospheric CO₂ is a stock filled by emissions and drained by uptake into the oceans and biomass; surface temperature reflects a stock of heat filled by net radiative forcing. In Fiddaman's model, if emissions fall to zero in 2000 the CO₂ stock peaks and declines only slowly, yet temperature keeps rising for about three decades because forcing remains positive until the surface warms enough. Holding emissions at 1995 rates leaves CO₂ rising for centuries, more than doubling by 2300 with about 3°C of warming. Correlating emissions with temperature cannot prove or disprove warming; the stocks make the relationship lagged and cumulative.",
      pages: "241-249",
    },
    {
      title: "A stock can only fall as fast as its outflow allows",
      text: "The number of people who have ever used cocaine has one inflow (first use) and one outflow (death). Survey data showed that number falling by 3.2% between 1982 and 1988, which would require deaths among past users to exceed new initiates. Mortality is far too low for that, even if no one had tried the drug after 1985. Checking a data series against the stock and flow structure it must obey is a powerful and cheap test of the data.",
      pages: "255-257",
    },
    {
      title: "Fast reinforcing loops and slow balancing loops give boom and bust",
      text: "Cocaine use spread by word of mouth and by a market that grew more efficient with scale (reinforcing loops), and was eventually checked by people seeing its health and legal harms (balancing loops). Because compulsive use, crime and deaths lag casual use, and public perception lags those harms, the balancing loops act late, so the epidemic peaks later and higher than it otherwise would. The same pattern recurs for many drugs, and the knowledge of harm that ends one wave fades before the next.",
      pages: "253-262",
    },
  ],
  diagrams: [
    {
      kind: "sequence",
      title: "Graphical integration, step by step",
      pages: "235-236",
      steps: [
        { label: "Sum the flows", detail: "Total inflow and total outflow" },
        { label: "Net flow", detail: "Inflow minus outflow, plotted against time" },
        { label: "Separate axes", detail: "Stock graph under the flow graph, time aligned" },
        { label: "Initial stock", detail: "Must be given; flows cannot tell you" },
        { label: "Area per segment", detail: "Rectangles and triangles under the net flow" },
        { label: "Shape the curve", detail: "Sign and trend of net flow set slope and curvature" },
        { label: "Zero means flat", detail: "Sign changes in net flow mark peaks and troughs" },
      ],
      loopBack: { from: 6, to: 4, label: "next segment" },
    },
    {
      kind: "sequence",
      title: "Why warming outlasts emissions",
      pages: "244-249",
      steps: [
        { label: "Emissions stop", detail: "Inflow to atmospheric CO₂ falls below uptake" },
        { label: "CO₂ peaks, falls slowly", detail: "Ocean and biomass uptake weakens as CO₂ falls" },
        { label: "Forcing still positive", detail: "Heat in exceeds heat radiated to space" },
        { label: "Temperature keeps rising", detail: "At a diminishing rate, for decades" },
        { label: "Net heat flow reaches zero", detail: "Temperature peaks" },
        { label: "Slow cooling", detail: "Heat stored in the deep ocean flows back up" },
      ],
    },
    {
      kind: "cld",
      title: "Carbon and heat: the main loops",
      pages: "244-248",
      cld: {
        size: [760, 420],
        vars: [
          { id: "em", label: "CO₂ emissions", x: 90, y: 150 },
          { id: "up", label: "Carbon uptake", x: 300, y: 45 },
          { id: "co2", label: "Atmospheric CO₂", x: 300, y: 150 },
          { id: "rad", label: "Radiation to space", x: 570, y: 55 },
          { id: "temp", label: "Surface temperature", x: 570, y: 215 },
          { id: "deep", label: "Heat to deep ocean", x: 650, y: 375 },
          { id: "ice", label: "Ice and snow cover", x: 260, y: 290 },
          { id: "sun", label: "Sunlight absorbed", x: 410, y: 380 },
        ],
        links: [
          { from: "em", to: "co2", sign: "+" },
          { from: "co2", to: "up", sign: "+", curve: 50 },
          { from: "up", to: "co2", sign: "−", curve: 50 },
          { from: "co2", to: "temp", sign: "+" },
          { from: "temp", to: "rad", sign: "+", curve: 50 },
          { from: "rad", to: "temp", sign: "−", curve: 50 },
          { from: "temp", to: "deep", sign: "+", curve: 50 },
          { from: "deep", to: "temp", sign: "−", curve: 50 },
          { from: "temp", to: "ice", sign: "−" },
          { from: "ice", to: "sun", sign: "−" },
          { from: "sun", to: "temp", sign: "+" },
        ],
        loops: [
          { type: "B", label: "B1", x: 300, y: 97 },
          { type: "B", label: "B2", x: 570, y: 135 },
          { type: "B", label: "B3", x: 610, y: 295 },
          { type: "R", label: "R", x: 410, y: 290 },
        ],
        caption:
          'Emissions fill the <b>atmospheric CO₂</b> stock; uptake by oceans and plants drains it faster as it rises <span class="chip chipB">B1</span>. CO₂ traps heat, so the surface warms until <b>radiation to space</b> <span class="chip chipB">B2</span> and transfer to the <b>deep ocean</b> <span class="chip chipB">B3</span> rebalance it. Melting ice and snow expose darker surfaces that absorb more sunlight <span class="chip chipR">R</span>. Each balancing loop runs through a slow stock, which is why the climate has so much inertia.',
      },
    },
    {
      kind: "cld",
      title: "The cocaine epidemic: fast growth, late limits",
      pages: "253-261",
      cld: {
        size: [760, 420],
        vars: [
          { id: "init", label: "Initiation rate", x: 120, y: 210 },
          { id: "users", label: "Active users", x: 630, y: 210 },
          { id: "expo", label: "Social exposure", x: 375, y: 45 },
          { id: "mkt", label: "Market efficiency", x: 375, y: 130 },
          { id: "harm", label: "Health harms", x: 520, y: 300 },
          { id: "arrest", label: "Arrests", x: 560, y: 385 },
          { id: "risk", label: "Perceived risk", x: 250, y: 345 },
        ],
        links: [
          { from: "init", to: "users", sign: "+" },
          { from: "users", to: "expo", sign: "+", curve: 30 },
          { from: "expo", to: "init", sign: "+", curve: 30 },
          { from: "users", to: "mkt", sign: "+" },
          { from: "mkt", to: "init", sign: "+" },
          { from: "users", to: "harm", sign: "+" },
          { from: "harm", to: "risk", sign: "+" },
          { from: "users", to: "arrest", sign: "+", curve: -20 },
          { from: "arrest", to: "risk", sign: "+" },
          { from: "risk", to: "init", sign: "−" },
        ],
        loops: [
          { type: "R", label: "R1", x: 375, y: 90 },
          { type: "R", label: "R2", x: 470, y: 184 },
          { type: "B", label: "B1", x: 360, y: 270 },
          { type: "B", label: "B2", x: 470, y: 340 },
        ],
        caption:
          'Users bring friends into contact with the drug <span class="chip chipR">R1</span>, and a bigger market cuts price and raises purity <span class="chip chipR">R2</span>. Only later do visible <b>health harms</b> <span class="chip chipB">B1</span> and fear of <b>arrest</b> <span class="chip chipB">B2</span> raise perceived risk enough to choke off new use. Because harms lag use and perceptions lag harms, the balancing loops arrive late and the peak is higher.',
      },
    },
    {
      kind: "sequence",
      title: "Pathways of cocaine users",
      pages: "252-253",
      steps: [
        { label: "Never used", detail: "Population aged 12 and over" },
        { label: "Active casual", detail: "Used in the past month, not addicted" },
        { label: "Active compulsive", detail: "Escalated, less likely to quit" },
        { label: "Transitional", detail: "Used in the past year, not the past month" },
        { label: "Ex-user", detail: "No use for over a year" },
      ],
      loopBack: { from: 4, to: 1, label: "relapse" },
      note: "Deaths drain every stock. Past-month users = active stocks; past-year adds transitional; ever-used adds ex-users, so ever-used can fall only through death.",
    },
  ],
  formulations: [
    {
      name: "Accumulation as a sum of rectangles (Euler)",
      equations: [
        "ΔStock over dt ≈ NetFlow(t) × dt",
        "Stock(t + dt) = Stock(t) + dt × (Inflow(t) − Outflow(t))",
        "As dt → 0 the sum becomes ∫ NetFlow dt",
      ],
      explain:
        "Each slice adds a rectangle of height equal to the net flow and width dt. If the flow is rising during the slice, the rectangle undershoots the true area; smaller slices reduce the error. Every simulation package integrates this way by default (see the module Simulation mechanics: integration and noise). In the Bathtub molecule both flows are constant, so the rectangles are exact and the level changes in straight lines.",
      molecule: "bathtub",
      pages: "233-234",
    },
    {
      name: "Graphical integration of simple shapes",
      equations: [
        "Constant net flow R over Δt: ΔS = R × Δt  (stock is a straight line)",
        "Net flow ramping from R₁ to R₂ over Δt: ΔS = ½(R₁ + R₂) × Δt  (stock is a parabola)",
        "Net flow zero: ΔS = 0  (stock is flat)",
      ],
      explain:
        "Most hand sketches need only rectangles and trapezoids. A constant flow gives a straight-line stock; a linearly changing flow gives a curved stock whose slope tracks the flow. Add the areas segment by segment, starting from the given initial value.",
      molecule: "bathtub",
      pages: "235-236",
    },
    {
      name: "Integrating a fluctuating flow",
      equations: [
        "NetFlow(t) = A cos(2πt/T)",
        "S(t) = S₀ + A(T/2π) sin(2πt/T) = S₀ + A(T/2π) cos(2πt/T − π/2)",
        "Example: A = 50 units/month, T = 12 months ⇒ amplitude ≈ 96 units, lag = 3 months",
      ],
      explain:
        "The stock follows the same cycle as the flow, shifted a quarter period later and scaled by T/2π. Long-period fluctuations in a flow therefore produce large swings in the stock, and short, fast fluctuations are largely absorbed.",
      pages: "237-238",
    },
    {
      name: "Equilibrium of a stock",
      equations: [
        "Equilibrium ⇔ Inflow = Outflow (net flow = 0)",
        "Dynamic: Inflow = Outflow > 0; static: Inflow = Outflow = 0",
        "With Outflow = Stock/τ and constant Inflow: Stock* = Inflow × τ",
      ],
      explain:
        "Equilibrium is a property of the flows, not the level. When the outflow depends on the stock, the stock moves until the outflow matches the inflow, which defines its equilibrium. The Residence Time molecule shows a dynamic equilibrium at inflow × τ.",
      molecule: "residence",
      pages: "232",
    },
    {
      name: "The ever-used population constraint",
      equations: [
        "EverUsed = INTEGRAL(Initiation − Deaths of ever-users, EverUsed₀)",
        "d(EverUsed)/dt < 0 only if Deaths of ever-users > Initiation",
        "Lower bound on the stock: EverUsed(t) ≥ EverUsed(t₀) × exp(−m(t − t₀)) when initiation ≥ 0 (m = fractional death rate)",
      ],
      explain:
        "With only one outflow, even if initiation dropped to zero the stock could fall no faster than the death rate of past users. A survey series that falls faster than this bound must be wrong, whatever its sampling design. The same check applies to any 'ever' stock: ever-married, ever-employed, ever-infected.",
      molecule: "bathtub",
      pages: "255-257",
    },
  ],
  cases: [
    {
      title: "Global warming: inertia in the carbon cycle and heat balance",
      text: "Fiddaman's (1997) climate-economy model, built to respect conservation of carbon (he notes that the widely cited DICE model lets part of emissions vanish into a sink outside the model), includes atmospheric CO₂, biomass, soil humus and a ten-layer ocean, plus surface and deep-ocean heat stocks. In an extreme test, emissions fall to zero after 2000: CO₂ is back only to its 1990 level 50 years later, and mean surface temperature keeps rising until around 2030 before falling very slowly. Stabilising emissions at 1995 rates instead leaves CO₂ more than doubling by 2300 and warming of about 3°C. Positive feedbacks such as ice albedo and permafrost methane could add to these figures.",
      pages: "241-249",
    },
    {
      title: "The war on drugs and the impossible survey",
      text: "In the late 1980s US surveys reported past-month cocaine use falling from 3% of the population in 1985 to under 1% in 1990, while arrests, emergency visits and deaths rose exponentially and street prices fell as purity rose. Homer's (1993, 1997) model, built for the National Institute of Justice, disaggregated users into stocks matching the survey questions. The survey's ever-used fraction peaked at about 12% in 1982 and fell to about 10% by 1988, a 3.2% drop in the number of ever-users that deaths could not produce. The model attributed the fall to heavy users being missed and to growing numbers of past users denying use as legal risks rose; its estimate of the true ever-used population kept rising, more slowly.",
      pages: "250-258",
    },
    {
      title: "Why the epidemic ended, and an earlier one",
      text: "Interdiction did not end the 1980s epidemic: cocaine stayed available, pure and cheap. Homer's model, using data only to 1989, anticipated the turning point of the 1990s; net cocaine on the streets in 1995 was estimated at about three-quarters of the 1989 level. Use was checked by people learning of the drug's health and legal harms, loops that act with long lags. A similar wave ran from the 1880s, when cocaine was praised as a remedy, to the 1920s, when importation of coca was banned after communities struggled with compulsive users. Sterman (2000) warns that fitting history should not be bought with ad hoc exogenous inputs.",
      pages: "258-262",
    },
  ],
  exercises: [
    {
      prompt:
        "Graphical integration in the Bathtub. Choose Steady state (inflow 8, outflow 8, level 50). First sketch, on paper, the level over 40 years if the inflow is raised to 18 from year 10 to year 20 and then returned to 8. Then do it: set Stop at to 10 and run; move the inflow to 18, set Stop at to 20 and run; move it back to 8, set Stop at to 40 and run.",
      hint: "Flat at 50, a straight rise of 10 per year to 150, then flat at 150. The stock does not come back down when the flow does.",
      link: { label: "Bathtub", hash: "/m/bathtub" },
    },
    {
      prompt:
        "Graphical differentiation. Open Decay with the default τ = 5 and initial stock 100. Before running, estimate the slope of the stock at t = 0, 5 and 10 years, and sketch the outflow. Run and compare your sketch with the outflow shown on the diagram.",
      hint: "Outflow = stock ÷ 5: about 20, 7.4 and 2.7 units per year. The stock's slope is the negative of the outflow.",
      link: { label: "Decay", hash: "/m/decay" },
    },
    {
      prompt:
        "Same net flow, different flows. In the Bathtub, run inflow 10 and outflow 8, then Reset and run inflow 25 and outflow 23. Compare the two stock trajectories (the previous run is drawn dashed). What could you infer about the flows from the stock alone?",
      hint: "Identical stocks: only the net flow (+2) is recoverable from the trajectory.",
      link: { label: "Bathtub", hash: "/m/bathtub" },
    },
    {
      prompt:
        "Stop the inflow. In Residence Time, run with inflow 8 and τ = 10 until the stock settles near 80. Before touching anything, predict what happens to the outflow and the stock if the inflow is set to 0 now, and how long it takes for the stock to halve. Then set the inflow to 0 and watch. Relate this to atmospheric CO₂ after emissions stop.",
      hint: "The outflow starts at 8 and falls with the stock; the half-life is about 0.7 × τ ≈ 7 months.",
      link: { label: "Residence Time", hash: "/m/residence" },
    },
    {
      prompt:
        "Carbon dioxide bathtub. Before running, sketch the concentration under each preset: Today (emissions double removal), Emissions cut by 30%, Emissions equal removal, Emissions below removal. Then run them. Which preset first stops the rise, and what does that tell you about policies that merely stabilise emissions?",
      hint: "The stock rises until emissions fall to the removal rate; cutting by 30% only slows the rise.",
      link: { label: "CO₂ as a bathtub", hash: "/apps/environment/co2-bathtub" },
    },
    {
      prompt:
        "Pen and paper: a fluctuating inflow. A warehouse ships a constant 100 units per week, and receives deliveries that swing between 70 and 130 units per week on an 8-week cycle, peaking at week 0. Predict when the stock peaks and its peak-to-trough range, without simulating.",
      hint: "Peak a quarter-cycle later, at week 2. Amplitude = 30 × 8 ÷ 2π ≈ 38, so the range is about 76 units.",
    },
    {
      prompt:
        "Check a data series with a stock bound (hypothetical numbers). A survey says 20 million people have ever used a drug, falling to 19.5 million six years later. Past users die at about 0.3% per year and around 1 million try the drug each year. Is the survey plausible? What is the smallest the stock could be after six years even if no one ever tried the drug again?",
      hint: "With no initiation the stock falls at most to 20 × 0.997⁶ ≈ 19.64 million, so 19.5 million is impossible; with initiation it should be rising by close to a million a year.",
    },
    {
      prompt:
        "Cocaine case. Run New use stops and note when casual and compulsive users peak. Then compare Steady new use with More users escalate. Use graphical integration to explain why compulsive use keeps rising after initiation has stopped.",
      hint: "Compulsive users rise as long as escalation (an inflow fed by casual users) exceeds their own exits.",
      link: { label: "Cocaine prevalence", hash: "/apps/social/cocaine" },
    },
  ],
  pitfalls: [
    "Assuming a stock follows its inflow: that the level falls as soon as the inflow falls, or returns to its old value when the inflow does.",
    "Plotting a stock and its flows on the same axis, as if they had the same units.",
    "Forgetting that the initial stock must be supplied; the flows alone fix only the change.",
    "Reading a constant level as a sign that nothing is flowing; dynamic equilibrium hides large throughputs.",
    "Trying to recover individual inflows and outflows from a stock's history, which reveals only the net.",
    "Judging causation by correlating a flow with a stock (emissions with temperature) when accumulation makes the relationship lagged and cumulative.",
    "Accepting data that violate the stock and flow structure they must obey, such as an ever-used population falling faster than deaths allow.",
    "Adding exogenous inputs purely to improve historical fit, or feeding in as data a variable that sits inside an important feedback loop.",
  ],
  molecules: ["bathtub", "decay", "residence", "cascade", "broken", "diffusion"],
};
