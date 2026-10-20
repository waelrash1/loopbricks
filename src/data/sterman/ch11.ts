import type { StudyChapter } from "@/data/sterman/types";

export const CHAPTER: StudyChapter = {
  id: "ch11",
  number: "11",
  title: "Delays",
  part: "Part IV: Tools for modeling dynamic systems",
  pages: "409-467",
  summary:
    "Delays are everywhere: in measuring, in deciding and in acting. This chapter opens the box marked delay and shows that every delay is a stock. It separates material delays, where conserved things travel through a pipe, from information delays, where a belief slowly catches up with the facts. It builds a family of formulations (pipeline, first-order, higher-order material delays, and first- and higher-order exponential smoothing), shows how they respond to pulses and steps, explains Little's law, and treats delays whose length changes, including ratchet effects. It then turns to estimation: statistical lag estimation, judgment by decomposition, and walking the line. A field study at the chipmaker Symbios shows how a simple model of design-win delays beat customers' own demand forecasts. The chapter closes with the mathematics: Koyck (geometric) lags and the Erlang family.",
  bigIdeas: [
    {
      title: "Every delay hides a stock",
      text: "A delay is any process whose output lags its input. Because output and input differ during the lag, something must accumulate the difference, so every delay contains at least one stock. Letters between posting and delivery sit in a stock of mail in transit; a forecast that has not yet caught up with demand is a stock of belief. Drawing the stock explicitly is the first step to modelling the delay correctly.",
      pages: "409-411",
    },
    {
      title: "Material delays and information delays are different structures",
      text: "In a material delay, physical units (parts, buildings, design tasks) flow into a stock in transit and flow out again, and nothing is created or destroyed on the way: the flow is conserved. In an information delay, what is delayed is a perception, belief or average; there is no physical inflow, and information is not conserved. The output of a material delay is a flow (the exit rate); the output of an information delay is the stock itself (the perceived value). The two respond identically while the delay time is fixed, but differently when it changes, so you must choose the right one.",
      pages: "411-412, 428, 466",
    },
    {
      title: "Every delay has a length and a shape",
      text: "Two questions specify any delay: how long items take on average (the mean residence time), and how the exits are spread around that average. The pulse response, the output after a sudden one-off injection such as a mass mailing, can be read as the probability that an item leaves at each moment. Its area always equals the amount injected, because the delay conserves material. Mixing of the processing order and random variation in individual processing times widen the spread; strict first-in, first-out processing narrows it.",
      pages: "412-415",
    },
    {
      title: "Pipeline delay: perfect order, no spread",
      text: "In a pipeline (transport) delay every item spends exactly the delay time D in transit and leaves in the order it entered, like car bodies on an assembly line. The outflow is simply the inflow shifted D time units later, so a pulse comes out as an identical pulse. It is the right model only when the order of exit really matches the order of entry and processing times hardly vary; it is the limit of a material delay with infinitely many stages.",
      pages: "415-416",
    },
    {
      title: "First-order material delay: perfect mixing",
      text: "If the contents of the stock in transit are perfectly mixed, every item has the same chance of being next out, however long it has waited. The outflow is then the stock divided by the delay time, a first-order balancing loop: more in transit means more leaving. A pulse produces an immediate jump in outflow, which then decays exponentially; about 63% has left after one delay time, 86% after two and 95% after three. Diffusion processes and well-mixed tanks fit this shape.",
      pages: "415-417",
    },
    {
      title: "Higher-order delays: cascades of first-order stages",
      text: "Many real processes pass through several stages (collection, sorting, transport, delivery), each adding some mixing. Chaining n first-order stages, each with delay D/n, gives an nth-order delay with the same mean D. Its pulse response starts at zero, rises to a peak that comes before the mean, and has a long right tail. The higher the order, the less mixing, the smaller the variance and the smaller the initial response; as n grows without limit the cascade becomes a pipeline. Third order is a common, robust default when output should start slowly.",
      pages: "417-421",
    },
    {
      title: "Little's law: what is in the pipe",
      text: "In equilibrium the stock in transit equals the throughput multiplied by the mean delay, whatever the shape of the exit distribution. A firm ordering 10,000 parts a day with a 5-day lead time has 50,000 on order. Turned around, the average delay is stock divided by throughput. The law explains the inertia of delays: cut orders to zero and everything already in the pipe still arrives. It holds strictly only in steady state; with growth, the stock in transit depends on the shape of the delay as well.",
      pages: "421-425",
    },
    {
      title: "Adaptive expectations are a first-order information delay",
      text: "Beliefs change when they are wrong. In adaptive expectations (exponential smoothing) the perceived value is a stock that moves toward the reported value at a rate equal to the error divided by an adjustment time. This is again a first-order balancing loop, so a step in the input brings an exponential approach to the new value, fastest at first. The perception is a weighted average of all past inputs with weights that fall off exponentially with age, which is why it filters noise but always lags turning points. Smoothing is cheap, self-correcting and, in forecasting competitions, surprisingly accurate.",
      pages: "426-432",
    },
    {
      title: "Higher-order information delays",
      text: "Often a belief does not start moving at once: data must be collected, aggregated, reported, reviewed and only then acted on. Each stage averages what it receives. Cascading n first-order smooths, each with time D/n and each chasing the one before, gives SMOOTHn: the initial response is small, the later rise is steep, and at the limit the perception is the input reported exactly D periods late. A pure reporting lag is the information equivalent of a pipeline delay.",
      pages: "432-434",
    },
    {
      title: "Delay times change, and the two kinds of delay respond differently",
      text: "Delay times vary with the season, with technology and, most importantly, with the state of the system: queues lengthen waits, and a supplier near full capacity quotes longer lead times. Lengthen a material delay and the exit rate drops at once while the stock in transit swells, because the same contents now drain more slowly. Lengthen an information delay and nothing happens immediately; the perception just updates more slowly. Long supplier delays can also feed themselves when customers place extra orders to secure supply, a reinforcing loop that destabilises supply chains.",
      pages: "434-435, 466",
    },
    {
      title: "Ratchets: different speeds up and down",
      text: "All the delays above are linear and respond symmetrically. People are not always symmetric: households adopt higher income expectations quickly but give up a standard of living slowly, and workers lose trust in job security at once after a layoff but regain it over years. A nonlinear smooth with one adjustment time when the input is above the perception and another when it is below captures these ratchet effects. In the process-improvement study the memory of layoffs rose in about a week and faded over about 50 weeks.",
      pages: "436-437",
    },
    {
      title: "Estimating delays: statistics, decomposition and walking the line",
      text: "With time-series data, econometric lag methods (geometric, polynomial and others) can estimate the mean and shape of a delay, but the estimate should then be replaced by the continuous material or information delay it resembles, so that the model is robust to the time step and the delay can later become variable. Without data, people badly underestimate long delays; breaking a delay into its operational stages and estimating each one is far more reliable. And data in information systems must be checked by following real items through the process.",
      pages: "437-449",
    },
  ],
  diagrams: [
    {
      kind: "cld",
      title: "First-order material delay",
      pages: "416-417",
      cld: {
        vars: [
          { id: "in", label: "Inflow rate", x: 85, y: 70 },
          { id: "mit", label: "Material in transit", x: 230, y: 160 },
          { id: "out", label: "Outflow rate", x: 420, y: 70 },
          { id: "dt", label: "Average delay time", x: 420, y: 230 },
        ],
        links: [
          { from: "in", to: "mit", sign: "+", curve: 0 },
          { from: "mit", to: "out", sign: "+", curve: -55 },
          { from: "out", to: "mit", sign: "−", curve: -55 },
          { from: "dt", to: "out", sign: "−", curve: 0 },
        ],
        loops: [{ type: "B", label: "B1", x: 325, y: 115 }],
        caption: `<span class="chip chipB">B</span> The outflow is <code>Material in transit / Average delay time</code>. The fuller the pipe, the faster it drains, so the stock chases the inflow through one <b>balancing loop</b>. Perfect mixing means order of entry is forgotten: a pulse leaves as an exponential decay, fastest at the start.`,
      },
    },
    {
      kind: "cld",
      title: "Third-order material delay as a cascade",
      pages: "418-421",
      cld: {
        size: [760, 300],
        vars: [
          { id: "in", label: "Inflow", x: 60, y: 220 },
          { id: "s1", label: "Stage 1 in transit", x: 190, y: 80 },
          { id: "e1", label: "Exit rate 1", x: 300, y: 220 },
          { id: "s2", label: "Stage 2 in transit", x: 415, y: 80 },
          { id: "e2", label: "Exit rate 2", x: 525, y: 220 },
          { id: "s3", label: "Stage 3 in transit", x: 640, y: 80 },
          { id: "out", label: "Outflow", x: 705, y: 220 },
        ],
        links: [
          { from: "in", to: "s1", sign: "+", curve: 0 },
          { from: "s1", to: "e1", sign: "+", curve: -50 },
          { from: "e1", to: "s1", sign: "−", curve: -50 },
          { from: "e1", to: "s2", sign: "+", curve: 0 },
          { from: "s2", to: "e2", sign: "+", curve: -50 },
          { from: "e2", to: "s2", sign: "−", curve: -50 },
          { from: "e2", to: "s3", sign: "+", curve: 0 },
          { from: "s3", to: "out", sign: "+", curve: -50 },
          { from: "out", to: "s3", sign: "−", curve: -50 },
        ],
        loops: [
          { type: "B", label: "B1", x: 245, y: 150 },
          { type: "B", label: "B2", x: 470, y: 150 },
          { type: "B", label: "B3", x: 673, y: 150 },
        ],
        caption: `<span class="chip chipB">B</span><span class="chip chipB">B</span><span class="chip chipB">B</span> Three first-order stages, each with one third of the total delay, each drained by its own <b>balancing loop</b>. The exit of one stage is the inflow of the next. Material must work its way through all three before it leaves, so the outflow after a pulse starts at zero, peaks before the mean delay and tails off. Total in transit = sum of the three stocks.`,
      },
    },
    {
      kind: "cld",
      title: "Adaptive expectations: belief chases the facts",
      pages: "428-430",
      cld: {
        vars: [
          { id: "rv", label: "Reported value", x: 85, y: 55 },
          { id: "err", label: "Error in belief", x: 290, y: 55 },
          { id: "chg", label: "Change in perceived value", x: 400, y: 150 },
          { id: "pv", label: "Perceived value", x: 170, y: 220 },
          { id: "at", label: "Adjustment time", x: 430, y: 235 },
        ],
        links: [
          { from: "rv", to: "err", sign: "+", curve: 0 },
          { from: "err", to: "chg", sign: "+", curve: -15 },
          { from: "chg", to: "pv", sign: "+", curve: -15 },
          { from: "pv", to: "err", sign: "−", curve: -15 },
          { from: "at", to: "chg", sign: "−", curve: 0 },
        ],
        loops: [{ type: "B", label: "B1", x: 262, y: 140 }],
        caption: `<span class="chip chipB">B</span> The perceived value is a <b>stock</b> (a state of mind). It changes only when it is wrong, at the rate <code>(Reported − Perceived) / Adjustment time</code>. One <b>balancing loop</b> closes the gap gradually: long adjustment times filter noise but lag every turning point. Cascade several of these and you get a higher-order information delay.`,
      },
    },
    {
      kind: "cld",
      title: "When the delay time depends on the backlog",
      pages: "434-435",
      cld: {
        size: [600, 280],
        vars: [
          { id: "bl", label: "Supplier backlog", x: 100, y: 140 },
          { id: "dd", label: "Delivery delay", x: 280, y: 45 },
          { id: "ord", label: "Customer orders", x: 280, y: 235 },
          { id: "sw", label: "Search for other suppliers", x: 480, y: 140 },
        ],
        links: [
          { from: "bl", to: "dd", sign: "+", curve: 25 },
          { from: "dd", to: "ord", sign: "+", curve: 0 },
          { from: "ord", to: "bl", sign: "+", curve: 25 },
          { from: "dd", to: "sw", sign: "+", curve: 20 },
          { from: "sw", to: "ord", sign: "−", curve: 20 },
        ],
        loops: [
          { type: "R", label: "R1", x: 205, y: 140 },
          { type: "B", label: "B1", x: 325, y: 140 },
        ],
        caption: `<span class="chip chipR">R</span> When suppliers fall behind, quoted lead times lengthen and customers order more than they need to secure supply (phantom orders), swelling the backlog further. <span class="chip chipB">B</span> Over a longer horizon, customers look for other suppliers, which relieves the backlog. A delay time that varies endogenously turns a simple lag into a feedback structure of its own.`,
      },
    },
    {
      kind: "sequence",
      title: "Decomposing the hog supply delay",
      pages: "447-448",
      steps: [
        { label: "Form price expectations", detail: "about 6 months to trust that higher prices will last" },
        { label: "Grow the breeding herd", detail: "about 5 months, withholding sows from market" },
        { label: "Gestation", detail: "about 3.8 months, with very little spread" },
        { label: "Maturation", detail: "about 5 months" },
        { label: "Feedlot", detail: "about 2 months to market weight" },
        { label: "Slaughter and supply", detail: "total from price change to supply: roughly 22 months" },
      ],
      note: "Estimating each operational stage separately is far more reliable than guessing the total. The biological stages are near pipeline delays; expectations and herd building are closer to first-order.",
    },
    {
      kind: "sequence",
      title: "Choosing and calibrating a delay",
      pages: "412-415, 437-449",
      steps: [
        { label: "Material or information?", detail: "is something conserved travelling, or is a belief adjusting?" },
        { label: "Estimate the mean", detail: "from data, Little's law (stock ÷ flow) or decomposition" },
        { label: "Estimate the shape", detail: "how fast does output start? how wide is the spread?" },
        { label: "Pick the order", detail: "first-order, third-order, nth-order or pipeline" },
        { label: "Check against reality", detail: "walk the line; compare with pulse-response data" },
        { label: "Ask if the delay varies", detail: "does capacity, a queue or the season change it?" },
      ],
      loopBack: { from: 5, to: 1, label: "revise as the model grows" },
    },
  ],
  formulations: [
    {
      name: "Pipeline delay",
      equations: ["Material in Transit = ∫(Inflow − Outflow) dt", "Outflow(t) = Inflow(t − D)"],
      explain:
        "Each item spends exactly D in transit and leaves in order of entry. A pulse comes out as the same pulse D later; a step comes out as the same step D later. In equilibrium the stock in transit is Inflow × D. Use it only for genuinely first-in, first-out processes with nearly constant processing times.",
      pages: "415-416",
    },
    {
      name: "First-order material delay",
      equations: ["Material in Transit = ∫(Inflow − Outflow) dt", "Outflow = Material in Transit / D", "Pulse response: p(t) = (1/D) · exp(−t/D)"],
      explain:
        "Perfect mixing: the outflow depends only on how much is in transit, not on when it arrived. This is the linear first-order balancing loop of chapter 8, so a pulse decays exponentially (37% left after D, 14% after 2D, 5% after 3D). The mean residence time is exactly D. In discrete time the same exponential weights become the geometric or Koyck lag, with weights (1 − L)·Lⁱ and mean L/(1 − L).",
      molecule: "decay",
      pages: "415-417, 464-465",
    },
    {
      name: "nth-order material delay (DELAYn, DELAY3)",
      equations: [
        "Stage i stock = ∫(Exit(i−1) − Exit(i)) dt, with Exit(0) = Inflow",
        "Exit(i) = Stage i stock / (D/n),  Outflow = Exit(n)",
        "Initial Stage i stock = Inflow × D/n (starts in equilibrium)",
        "Total in transit = Σ Stage i stock",
      ],
      explain:
        "n first-order stages in series, each with a share D/n of the delay. The mean stays D while the variance falls to D²/n, so the output becomes tighter and starts later as n rises. The continuous pulse response is the Erlang distribution of order n (Pascal lag in discrete time). With only a sample mean and variance, the order can be estimated as roughly D² / s².",
      molecule: "material",
      pages: "417-421, 465-466",
    },
    {
      name: "Little's law",
      equations: ["Stock in transit = Throughput × Average delay (in equilibrium)", "Average delay = Stock in transit / Throughput"],
      explain:
        "True for any exit distribution once inflow and outflow are equal. It sizes the work in progress you must finance or store, and gives a quick estimate of a delay when you can count the queue and the flow. It does not hold while the inflow is growing or the system is far from equilibrium.",
      molecule: "residence",
      pages: "421-425",
    },
    {
      name: "First-order information delay (SMOOTH)",
      equations: ["Perceived = ∫ Change in Perceived dt", "Change in Perceived = (Input − Perceived) / D"],
      explain:
        "Adaptive expectations or exponential smoothing. The output is the stock (the belief), not a flow, and nothing is conserved: information about the input enters, not the input itself. With a fixed D it behaves exactly like a first-order material delay, because the net rate can be split into an inflow Input/D and an outflow Perceived/D. Change D and the two diverge.",
      molecule: "smooth",
      pages: "428-431, 466",
    },
    {
      name: "Higher-order smoothing (SMOOTHn) and ratchets",
      equations: [
        "Stage 1: dS₁/dt = (Input − S₁) / (D/n)",
        "Stage i: dSᵢ/dt = (Sᵢ₋₁ − Sᵢ) / (D/n),  Output = Sₙ",
        "Ratchet: D = D_up if Input ≥ Perceived, else D_down",
      ],
      explain:
        "Each stage smooths the one before, so the final perception barely moves at first, then rises steeply. Initialise every stage at the input to start in equilibrium. Letting the adjustment time depend on whether the input is above or below the belief gives asymmetric (ratchet) adjustment, which works for first- or higher-order smooths.",
      molecule: "smoothHigher",
      pages: "432-437",
    },
  ],
  cases: [
    {
      title: "Power plant lead times and the cost of the pipeline",
      text: "Before the mid-1970s a US utility typically built plants in about 5 years and ran them for about 20. A 10 GW utility with flat demand replaces 0.5 GW a year, so by Little's law it carries 2.5 GW under construction; if lead times double to 10 years, that doubles to 5 GW. With demand growing about 7% a year the burden was much larger: roughly 7.2 GW under construction with a 5-year lead time and more than 17 GW with a 10-year lead time. Utilities borrowed heavily, raised rates, saw demand growth fall and were left with excess capacity and debt through the 1980s. Shorter lead-time plants proved more valuable in an uncertain market even though they cost more per kilowatt.",
      pages: "423-424",
    },
    {
      title: "Dioxin in the food chain",
      text: "Dioxins persist in fatty tissue with a half-life of roughly 7 to 11 years, a residence time of about 10 to 16 years. Little's law says the equilibrium body burden equals intake multiplied by residence time, so even tiny daily intakes accumulate to large loads, and each step up the food chain concentrates them further: some fish carry concentrations 100,000 times those in the surrounding water. A rough calculation for humans gives a burden near, though below, measured loads, and reaching equilibrium would take 40 to 64 years, suggesting intake or residence time is underestimated.",
      pages: "425",
    },
    {
      title: "Lags in capital investment and energy supply",
      text: "Naill matched a statistically estimated lag of natural gas supply to price with a third-order delay of 4.5 years, then replaced the aggregate lag by an explicit exploration process. Montgomery's survey of 52,000 US construction projects gave a mean construction time of 16.7 months, well fitted by a second-order delay (low order because many kinds of structures are pooled). Senge estimated the delays in an operational investment function for the System Dynamics National Model: about 2.1 quarters to average shipments (first-order), about 5.4 quarters to perceive changes in capital delivery delay (first-order) and a bell-shaped, roughly third-order lag in growth expectations. His operational formulation fitted better than the neoclassical investment function, which assumes fixed lags and unlimited supplier capacity.",
      pages: "438-445",
    },
    {
      title: "Forecasting semiconductor demand at Symbios",
      text: "Symbios forecast demand by collecting customers' own projections. Those forecasts had mean absolute errors of about 40% (6 months ahead) and 46% (12 months ahead), ran too high, swung out of phase with billings and mostly echoed customers' current orders, amplified by supply chain dynamics. Wallis and colleagues instead modelled the pipeline from design wins through development and prototyping into production, with coflows tracking expected volume and revenue. The estimated delays were very high order (roughly ninth to twentieth): a design win produced no revenue for about a year and peaked around three years later. The model tracked billings better, revealed that future revenue depends heavily on design wins not yet won, and helped raise on-time delivery to customer request dates from about 60% to about 80% while inventories fell.",
      pages: "449-462",
    },
  ],
  exercises: [
    {
      prompt:
        "Open Decay with the default τ = 5 years. Treat the starting stock of 100 as a pulse just injected into a first-order delay. Read off the stock at years 5, 10 and 15 and compare with 37, 14 and 5. Then confirm that the outflow is largest at the very start.",
      hint: "After one time constant about 63% has left, after two about 86%, after three about 95%.",
      link: { label: "Decay", hash: "/m/decay" },
    },
    {
      prompt:
        "Open Cascaded Levels and choose the Pulse through preset (60 units in stage 1, τ = 4 months per stage, so the mean delay is 12 months). When does stage 3 peak? Is the peak before or after 12 months? Now try τ = 1.5 and say what changes and what does not.",
      hint: "For equal stages the third stock peaks at about 2τ, well before the 3τ mean: higher-order delays peak early and have a long tail.",
      link: { label: "Cascaded Levels", hash: "/m/cascade" },
    },
    {
      prompt:
        "Open Material Delay and pick Steady pipeline (inflow 8/wk, delay 9 wk). Add up the three in-transit stocks once arrivals have caught up with the inflow. Check your total against Little's law. Then switch to Long transit (delay 16 wk) and predict the new total before you run it.",
      hint: "8 × 9 = 72 units; 8 × 16 = 128 units. Note how long it takes before arrivals even start to rise.",
      link: { label: "Material Delay", hash: "/m/material" },
    },
    {
      prompt:
        "Open Smooth with the Step up preset (input jumps from 30 to 80, τ = 6 weeks). Compare the first- and third-order perceptions at week 2 and again at week 12. Which responds first, and which arrives first? Repeat with τ = 15 and describe what a manager using each forecast would experience.",
      hint: "At week 2 the first-order smooth has closed about 28% of the gap, the third-order only about 8%. Later the third-order catches up steeply.",
      link: { label: "Smooth", hash: "/m/smooth" },
    },
    {
      prompt:
        "Open Smooth (Higher-Order). Run Equal stages (2, 2, 2), then One long stage (5, 0.5, 0.5). Both have a total delay of 6 years. How do their shapes differ? Explain why splitting a delay evenly across stages gives the most S-shaped response.",
      link: { label: "Smooth (Higher-Order)", hash: "/m/smoothHigher" },
    },
    {
      prompt:
        "Open Trend with Steady growth (6%/month, perception time 4 months). Once the run settles, compute Actual ÷ Perceived and compare with 1 + 0.06 × 4. Then choose Turning point (−4%/month) and note how long the perception keeps overstating reality. What does this imply for anyone smoothing a growing series?",
      hint: "Under steady exponential growth a first-order smooth falls permanently behind by a factor of about 1 + g × D.",
      link: { label: "Trend", hash: "/m/trend" },
    },
    {
      prompt:
        "In the adaptive expectations of inflation case, compare 8% inflation, nowcast with Inflation judged over 10 years. How much further behind the actual price level does the slower perception run, and how would that affect wage or interest-rate decisions?",
      link: { label: "Adaptive expectations of inflation", hash: "/apps/economics/expectations" },
    },
    {
      prompt:
        "Pen and paper. An aircraft parts shop records every lot as taking exactly its scheduled 10 days, but on the shop floor the mean is 22 days with a standard deviation of 9 days. Assuming an Erlang shape, estimate the order of the delay. Next, an insurer holds 50,000 open claims and settles 25,000 a month: what is the average wait? Finally, decompose a delay from your own work into stages and estimate each one.",
      hint: "Order ≈ mean² / variance = 484 / 81 ≈ 6. Waiting time = 50,000 / 25,000 = 2 months (in equilibrium only).",
    },
  ],
  pitfalls: [
    "Using a first-order delay for a process whose output should start slowly (construction, product development); it gives an unrealistically large immediate response.",
    "Modelling a belief or forecast with a material delay structure, or a physical flow with SMOOTH. They agree only while the delay time is fixed and diverge as soon as it changes.",
    "Forgetting to start delays in equilibrium (each stage holding Inflow × D/n, or each smooth at its input), which creates spurious transients at the start of a run.",
    "Applying Little's law to a growing or disturbed system, where the stock in transit also depends on the delay's shape.",
    "Dropping an estimated regression lag straight into a continuous model. Fixed discrete lag weights do not adapt to a smaller time step or a changing delay time, and they do not distinguish material from information.",
    "Treating a capacity-constrained process as a pure delay with a constant delay time, when queues and utilisation actually lengthen it.",
    "Guessing long delays by intuition. People routinely underestimate them; decompose into stages instead.",
    "Trusting cycle times in an information system without walking the line; recorded times may be back-calculated from schedules.",
  ],
  molecules: ["material", "cascade", "decay", "residence", "smooth", "smoothHigher", "trend"],
};
