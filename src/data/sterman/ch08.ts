import type { StudyChapter } from "@/data/sterman/types";

export const CHAPTER: StudyChapter = {
  id: "ch08",
  number: "8",
  title: "Closing the loop: dynamics of simple structures",
  part: "Part III The dynamics of growth",
  pages: "263-291",
  summary:
    "The simplest feedback system joins feedback to accumulation: one stock whose net flow depends on the stock itself. When the dependence is linear, a reinforcing loop gives pure exponential growth and a balancing loop gives exponential decay toward a goal. Both have exact solutions, and both are characterised by a single time: the doubling time of growth and the half-life (or time constant) of decay, linked by the rule of 70. The phase plot, a graph of net flow against the stock, reveals equilibria, their stability and the dominant loop without calculus. People badly underestimate exponential growth and are overconfident in their estimates. Linear systems can only grow, decay or stay put, so S-shaped growth requires a nonlinear shift in loop dominance. A first-order system can never oscillate.",
  bigIdeas: [
    {
      title: "First-order and linear have precise meanings",
      text: "The order of a system is its number of stocks. A system is linear when every net flow is a weighted sum of the stocks and exogenous inputs with constant coefficients; products of stocks, ratios of stocks or functions such as MAX make it nonlinear. One linear stock is the simplest feedback system that can exist, yet it already produces the two fundamental modes: exponential growth and goal seeking.",
      pages: "263-264",
    },
    {
      title: "Linear positive feedback gives pure exponential growth",
      text: "If the net inflow is a constant fraction g of the stock (interest on a balance, net births in a population), then dS/dt = gS and S(t) = S(0)·exp(gt). The stock grows at a constant fractional rate, so its absolute rate of increase is always proportional to its size: each doubling of the stock doubles its growth. Changing g changes the speed but never the shape of the curve.",
      pages: "264-268",
    },
    {
      title: "The phase plot shows structure as a graph",
      text: "Plot the net rate of change against the stock. Where the curve crosses zero the stock is at equilibrium. Where the curve slopes upward, a small increase in the stock raises its own growth, so disturbances grow: the equilibrium is unstable, like a ball on a hilltop. Where it slopes downward, disturbances shrink and the equilibrium is stable, like an orange in a bowl. Arrows along the axis show the direction of motion, so the time path can be read without solving anything.",
      pages: "266-268",
    },
    {
      title: "Doubling time and the rule of 70",
      text: "Exponential growth doubles in a fixed time whatever the starting size: going from 1 to 2 takes as long as from 1 billion to 2 billion. Solving 2 = exp(g·t_d) gives t_d = ln 2 / g ≈ 0.7/g, or 70 divided by the growth rate in percent per period. Money earning 7% a year doubles in about 10 years; US real GDP growing about 3.4% a year doubles in about 20, which is why 200 years gave roughly 10 doublings and a thousandfold increase. Discrete compounding lengthens the doubling time slightly (7% compounded annually: 10.24 years rather than 9.90).",
      pages: "268-269",
    },
    {
      title: "People extrapolate linearly and so underestimate growth",
      text: "Experiments by Wagenaar and colleagues found that people extend exponential trends as if they added a fixed amount each period. The error is small over short horizons and low growth rates but becomes enormous otherwise, and it is robust: tables versus graphs make no difference, more data make it worse and mathematical training does not help. Over a long horizon an exponential process appears to do nothing until a sudden take-off near the end, tempting observers to look for a change in structure that never happened.",
      pages: "269-272",
    },
    {
      title: "Exponential growth reaches limits suddenly",
      text: "Because the quantity doubles in a fixed interval, it spends most of its history looking small and then covers the remaining distance in a few doublings. A lily that doubles daily and fills its pond on day 30 covers half the pond on day 29 and only 1% on day 23. Waiting until a problem looks large leaves one doubling time to act. As limits approach, nonlinearities must weaken the reinforcing loops and strengthen the balancing ones.",
      pages: "270-272",
    },
    {
      title: "Overconfidence: our ranges are far too narrow",
      text: "Most people not only underestimate exponential growth but place the true answer outside their 95% bounds. Reviews of nearly 15,000 judgements found 98% confidence intervals containing the right answer only 68% of the time. More information raises confidence without raising accuracy, and experts are not immune. Remedies: list reasons you could be wrong, surface hidden assumptions, seek critics with opposing views, distrust claims of certainty, and remember that statistical confidence bounds ignore specification error.",
      pages: "272-274",
    },
    {
      title: "Linear negative feedback gives exponential decay toward a goal",
      text: "With the net flow −dS (deaths, depreciation) the stock decays exponentially to zero, S(t) = S(0)·exp(−dt); 1/d is the average lifetime of a unit in the stock. More generally a balancing loop closes a gap to an explicit goal S* at a rate gap/AT, where AT is the adjustment time. The stock approaches the goal from above or below, fastest at first and ever more slowly, because the corrective action shrinks with the gap. Zero is just the implicit goal of pure decay.",
      pages: "274-278",
    },
    {
      title: "Time constants and half-lives",
      text: "In goal seeking the gap remaining is the initial gap times exp(−t/AT). The half-life is AT·ln 2 ≈ 0.7·AT, the same rule of 70 as doubling. After one AT about 63% of the gap is closed, after two 86%, after three 95% and after four 98%, so adjustment is effectively complete after three to four time constants. It is not complete after one AT, because the initial rate (gap/AT), which would close the gap in exactly one AT, falls as the gap shrinks.",
      pages: "279-280",
    },
    {
      title: "Linear systems cannot change loop dominance",
      text: "With constant fractional birth rate b and death rate d, population follows (b − d)P: it grows forever, stays put or dies out, and which of these is fixed once b and d are chosen. Linear systems obey superposition, so they can be solved by breaking them into parts, but the relative strength of their loops never changes. Real populations grow and then level off, so real systems must contain important nonlinearities. Linear analysis remains useful near an operating point.",
      pages: "282-285",
    },
    {
      title: "S-shaped growth comes from a nonlinear shift in dominance",
      text: "If fractional birth and death rates depend on population relative to carrying capacity, the net birth rate on the phase plot becomes a hump: rising almost linearly while resources are plentiful, peaking, and falling to zero at the carrying capacity. On the rising side the reinforcing loop dominates and growth accelerates; the peak of the hump is the inflection point; on the falling side the balancing loops dominate and the stock settles at a stable equilibrium. A population starting above capacity falls back to it. The logistic model is the special case where the fractional rate falls linearly, putting the inflection at exactly half the capacity.",
      pages: "285-288",
    },
    {
      title: "Formal loop dominance, and why one stock cannot oscillate",
      text: "For one stock, the sign of ∂(dS/dt)/∂S says which polarity dominates: positive means reinforcing, negative means balancing, zero means no net feedback (Richardson's definition). A continuous first-order system cannot oscillate, because to reverse direction its net rate would have to pass through zero, and any such point is an equilibrium where motion stops. Oscillation needs at least two stocks in a loop; discrete-time models can oscillate in one variable only because the time step hides a delay.",
      pages: "288-290",
    },
  ],
  diagrams: [
    {
      kind: "cld",
      title: "First-order reinforcing loop",
      pages: "264-266",
      cld: {
        vars: [
          { id: "s", label: "Stock", x: 130, y: 120 },
          { id: "net", label: "Net inflow", x: 390, y: 120 },
          { id: "g", label: "Fractional growth rate g", x: 390, y: 230 },
        ],
        links: [
          { from: "s", to: "net", sign: "+", curve: 60 },
          { from: "net", to: "s", sign: "+", curve: 60 },
          { from: "g", to: "net", sign: "+" },
        ],
        loops: [{ type: "R", label: "R", x: 262, y: 120 }],
        caption:
          'The larger the <b>stock</b>, the larger the net inflow, which adds still more to the stock <span class="chip chipR">R</span>. With <code>Net inflow = g × Stock</code> the stock grows exponentially and doubles every <code>0.7 ÷ g</code>. Interest on a balance and net births in a population have this structure.',
      },
    },
    {
      kind: "cld",
      title: "First-order balancing loop with an explicit goal",
      pages: "276-278",
      cld: {
        vars: [
          { id: "goal", label: "Goal S*", x: 90, y: 60 },
          { id: "gap", label: "Gap (S* − S)", x: 270, y: 60 },
          { id: "at", label: "Adjustment time", x: 440, y: 60 },
          { id: "net", label: "Net inflow", x: 420, y: 210 },
          { id: "s", label: "Stock S", x: 120, y: 210 },
        ],
        links: [
          { from: "goal", to: "gap", sign: "+" },
          { from: "gap", to: "net", sign: "+" },
          { from: "at", to: "net", sign: "−" },
          { from: "net", to: "s", sign: "+" },
          { from: "s", to: "gap", sign: "−" },
        ],
        loops: [{ type: "B", label: "B", x: 270, y: 160 }],
        caption:
          'The stock moves toward the <b>goal</b> at a rate proportional to the <b>gap</b> <span class="chip chipB">B</span>. A longer <b>adjustment time</b> means gentler correction. The gap halves every <code>0.7 × AT</code>; inventory and workforce adjustment follow this pattern when delays in production or hiring are ignored.',
      },
    },
    {
      kind: "cld",
      title: "Population in a fixed environment",
      pages: "282-288",
      cld: {
        size: [700, 340],
        vars: [
          { id: "pop", label: "Population", x: 90, y: 170 },
          { id: "births", label: "Births", x: 300, y: 55 },
          { id: "deaths", label: "Deaths", x: 300, y: 285 },
          { id: "dens", label: "Density P/C", x: 430, y: 170 },
          { id: "fbr", label: "Fractional birth rate", x: 540, y: 55 },
          { id: "fdr", label: "Fractional death rate", x: 540, y: 285 },
          { id: "cap", label: "Carrying capacity", x: 610, y: 170 },
        ],
        links: [
          { from: "pop", to: "births", sign: "+", curve: 50 },
          { from: "births", to: "pop", sign: "+", curve: 50 },
          { from: "pop", to: "deaths", sign: "+", curve: -50 },
          { from: "deaths", to: "pop", sign: "−", curve: -50 },
          { from: "pop", to: "dens", sign: "+" },
          { from: "cap", to: "dens", sign: "−" },
          { from: "dens", to: "fbr", sign: "−" },
          { from: "fbr", to: "births", sign: "+" },
          { from: "dens", to: "fdr", sign: "+" },
          { from: "fdr", to: "deaths", sign: "+" },
        ],
        loops: [
          { type: "R", label: "R", x: 195, y: 112 },
          { type: "B", label: "B1", x: 195, y: 228 },
          { type: "B", label: "B2", x: 370, y: 110 },
          { type: "B", label: "B3", x: 370, y: 230 },
        ],
        caption:
          'Births drive growth <span class="chip chipR">R</span> and deaths drain the population <span class="chip chipB">B1</span>. As <b>density</b> rises toward the carrying capacity, fertility falls <span class="chip chipB">B2</span> and mortality rises <span class="chip chipB">B3</span>. With constant fractions only R and B1 exist and their balance never changes; the density loops make dominance shift from R to B, producing an S-curve.',
      },
    },
    {
      kind: "sequence",
      title: "Reading behaviour from a phase plot",
      pages: "266-290",
      steps: [
        { label: "Plot net rate against stock", detail: "Net inflow on the vertical axis, stock on the horizontal" },
        { label: "Find the zeros", detail: "Every crossing is an equilibrium" },
        { label: "Check the slope there", detail: "Upward: unstable. Downward: stable" },
        { label: "Draw the arrows", detail: "Right where net rate > 0, left where < 0" },
        { label: "Read dominance", detail: "Rising curve: reinforcing; falling curve: balancing" },
        { label: "Mark the peak", detail: "Maximum net rate = inflection point in time" },
        { label: "Sketch the time path", detail: "Accelerate, inflect, then settle at the stable point" },
      ],
    },
    {
      kind: "cycle",
      title: "Calibrating your confidence",
      pages: "272-274",
      nodes: [
        "Write an estimate and a range",
        "List reasons you could be wrong",
        "Expose hidden assumptions",
        "Ask critics with opposing views",
        "Test sensitivity, including structure",
        "Compare with outcomes and widen ranges",
      ],
      center: "Overconfidence check",
    },
  ],
  formulations: [
    {
      name: "Exponential growth",
      equations: ["dS/dt = g·S", "S(t) = S(0)·exp(g·t)", "Population: g = b − d (fractional birth rate − fractional death rate)"],
      explain:
        "Separating variables gives dS/S = g dt, so ln S = g t + c and the solution above. The fractional growth rate g has units of 1/time. In the Population Growth molecule g is the birth rate minus the death rate: 5% − 2% = 3% per year from 100 gives about 605 after 60 years.",
      molecule: "growth",
      pages: "264-266",
    },
    {
      name: "Doubling time and the rule of 70",
      equations: [
        "t_d = ln 2 / g ≈ 0.693 / g ≈ 70 / (100·g)",
        "Discrete compounding p times per period: S(t) = S(0)(1 + g/p)^(p·t)",
        "t_d (discrete) = ln 2 / (p·ln(1 + g/p))",
      ],
      explain:
        "The doubling time is independent of the starting size. Compounding at discrete intervals lowers the effective yield, so 7% compounded annually doubles in 10.24 years instead of 9.90 continuously; with short intervals the rule of 70 remains a good guide.",
      molecule: "growth",
      pages: "268-269",
    },
    {
      name: "Exponential decay",
      equations: ["dS/dt = −d·S = −S/τ", "S(t) = S(0)·exp(−t/τ)", "Average lifetime τ = 1/d; half-life = 0.7·τ"],
      explain:
        "The outflow is proportional to the stock, so it falls as the stock falls. Depreciation (book value ÷ asset lifetime) and deaths (fractional death rate × population) have this form. In the Decay molecule, τ = 5 years halves the stock in about 3.5 years and leaves 37% after 5.",
      molecule: "decay",
      pages: "274-276",
    },
    {
      name: "The action that would go to zero in time τ",
      equations: ["Action = Stock / τ", "Held constant: Stock reaches 0 at t = τ", "Recomputed continuously: Stock = S(0)·exp(−t/τ), 37% left at t = τ"],
      explain:
        "Dividing a stock by a time gives the rate that would empty it in that time if held constant. Because the rate is recomputed as the stock falls, the stock decays exponentially instead, and the straight line drawn at the initial rate is the tangent that hits zero at τ. The Go To Zero molecule plots both paths side by side.",
      molecule: "goToZero",
      pages: "279-280",
    },
    {
      name: "Goal seeking (closing a gap)",
      equations: [
        "dS/dt = (S* − S) / AT",
        "S(t) = S* − (S* − S(0))·exp(−t/AT)",
        "Gap remaining after 1, 2, 3, 4 AT: 37%, 14%, 5%, 2%",
        "Half-life t_h = AT·ln 2 ≈ 0.7·AT",
      ],
      explain:
        "The term exp(−t/AT) is the fraction of the initial gap still open. For a firm with desired inventory 100 and actual 60, AT = 1 week gives an initial inflow of 40 per week, AT = 2 weeks 20 per week. In the Close Gap molecule (start 20, goal 60, AT 5 weeks) the stock is about 45 after 5 weeks and about 58 after 15. A constant inflow with a first-order outflow, dS/dt = Inflow − S/τ, is the same structure with an implicit goal Inflow × τ (the Residence Time molecule), which is why τ is both the average stay and the time constant.",
      molecule: "closegap",
      pages: "276-280",
    },
    {
      name: "Nonlinear births and deaths; the logistic special case",
      equations: [
        "Net Birth Rate = b(P/C)·P − d(P/C)·P",
        "Logistic: Net Birth Rate = g*(1 − P/C)·P = g*·P − g*·P²/C",
        "Inflection at P = C/2, maximum net rate 0.25·g*·C",
        "P(t) = C / (1 + (C/P(0) − 1)·exp(−g*·t))",
        "Loop dominance: ∂(dP/dt)/∂P > 0 reinforcing, < 0 balancing",
      ],
      explain:
        "The general case allows any downward-sloping fractional net birth rate; the logistic form (see the module S-shaped growth: epidemics and diffusion) makes the fall linear. The first logistic term is the reinforcing loop and the second, quadratic, term is the balancing loop that strengthens as P nears C. The Constrained Growth molecule uses exactly this form: with r = 18%, K = 200 and P(0) = 10, the inflection at 100 comes at t = ln(19)/0.18 ≈ 16 years.",
      molecule: "logistic",
      pages: "285-289, 296-298",
    },
  ],
  cases: [
    {
      title: "Folding a sheet of paper",
      text: "A sheet about 0.1 mm thick doubles with every fold. Most people guess that even 100 folds would give less than a metre. In fact 42 folds would make it about 440,000 km thick, further than the Moon, and 100 folds about 850 trillion times the Earth-Sun distance. Five folds give only 3.2 mm, which is where intuition is formed.",
      pages: "268-270",
    },
    {
      title: "Ten doublings of the US economy",
      text: "Real US GDP grew at about 3.4% a year over the twentieth century. By the rule of 70 that is a doubling roughly every 20 years, so 200 years contain about 10 doublings and a growth factor of about 2¹⁰ ≈ 1000.",
      pages: "269",
    },
    {
      title: "The lily pond and the chessboard",
      text: "Two old stories show how fast doubling meets a limit. The lily covers half the pond the day before it covers all of it, and is still microscopic for most of the month. One grain of rice on the first square of a chessboard, doubled on every square, needs more than a million grains on the 21st square and over a million million in all by the 40th; the whole board would bury modern Iran more than five feet deep. In real systems, nonlinear limits halt the growth long before.",
      pages: "270-272",
    },
    {
      title: "Overconfident experts",
      text: "Studies reviewed by Lichtenstein, Fischhoff and Phillips found 98% confidence ranges right only 68% of the time. Before the Challenger disaster NASA put the chance of catastrophic launch failure at 1 in 100,000. Nordhaus's 1994 survey of climate experts found scientists rating a catastrophic economic loss 20 to 30 times more likely than economists did, while each expert gave ranges so narrow they excluded most others' views; one economist who said the world in a century was unimaginable still gave one of the narrowest ranges.",
      pages: "272-274",
    },
  ],
  exercises: [
    {
      prompt:
        "Rule of 70 before you run. Open Population Growth with birth 5% and death 2% (population 100). Predict the doubling time and the population at year 60. Set Stop at to 60 and run. Then predict how the doubling time changes if the birth rate is raised to 9%, and check.",
      hint: "Net 3%: about 23 years to double, and 100·e^1.8 ≈ 605 at year 60. Net 7%: about 10 years.",
      link: { label: "Population Growth", hash: "/m/growth" },
    },
    {
      prompt:
        "Doublings look the same at every scale. In Population Growth (net 3%), read the time it takes to go from 100 to 200 and from 200 to 400. Then explain, in one sentence, why a forecaster who extends the first 10 years as a straight line will be badly wrong by year 60.",
      hint: "Both take about 23 years. A straight line from the first decade (about +35) predicts roughly 310 at year 60, half the true value.",
      link: { label: "Population Growth", hash: "/m/growth" },
    },
    {
      prompt:
        "Half-life before you run. Open Decay with τ = 5 (stock 100). Predict the time for the stock to halve, and the stock left at t = 5, 10 and 15. Run with Stop at set to each time and check. Then try the Fast decay and Slow decay presets.",
      hint: "Half-life ≈ 3.5 years; about 37, 14 and 5 remain. τ = 2 halves in about 1.4 years, τ = 15 in about 10.",
      link: { label: "Decay", hash: "/m/decay" },
    },
    {
      prompt:
        "The tangent line. Open Go To Zero with Quick (τ = 2) and then Slow (τ = 12). The second line shows what happens if the initial action is held constant. Before running, predict when the constant-action stock hits zero and how much of the real stock is left at that moment. Then choose With replenishment and predict the new equilibrium.",
      hint: "The constant path hits zero at t = τ; the real stock still has 37% left. With replenishment 8 and τ = 5 the stock settles at 8 × 5 = 40.",
      link: { label: "Go To Zero", hash: "/m/goToZero" },
    },
    {
      prompt:
        "Goal seeking. Open Close Gap with Reach goal (actual 20, goal 60, AT 5 weeks). Predict the initial adjustment rate and the level after 5, 10 and 15 weeks. Run and check. Then compare Aggressive (AT 1.5) and Sluggish (AT 15): which closes 95% of the gap first, and roughly when?",
      hint: "Initial rate 40/5 = 8 per week; levels about 45, 55 and 58. Closing 95% takes about 3·AT: about 4.5 weeks versus 45 weeks.",
      link: { label: "Close Gap", hash: "/m/closegap" },
    },
    {
      prompt:
        "Pen and paper: workforce with a moving target. A firm adjusts its workforce to a desired level with AT = 4 weeks. Sketch the workforce and net hiring when the desired workforce steps from 1000 to 1800 at week 4 and back to 1400 at week 12. Repeat with AT = 2. Then sketch the case where the desired level instead rises steadily by 50 per week from week 4: does the workforce ever catch up?",
      hint: "Each step starts a fresh exponential approach; at week 12 the gap is about 13% of 800 for AT = 4. With a ramp, the workforce ends up trailing by a constant 50 × 4 = 200 people and grows at 50 per week.",
    },
    {
      prompt:
        "S-shaped growth and the inflection point. Open Constrained Growth with the S-curve preset (r = 18%, K = 200, P(0) = 10). Predict the population at which growth is fastest and roughly when it occurs, using P(t) = K/(1 + (K/P0 − 1)e^(−rt)). Run to check, then try Fast to cap and Higher capacity and predict how each changes the inflection.",
      hint: "Fastest at K/2 = 100, at t = ln(19)/0.18 ≈ 16 years. Doubling r halves that time; K = 350 moves the inflection to 175 and a little later.",
      link: { label: "Constrained Growth", hash: "/m/logistic" },
    },
    {
      prompt:
        "Draw the phase plot. For Constrained Growth with r = 18% and K = 200, sketch net growth (r·P − r·P²/K) against P from 0 to 250 on paper. Mark both equilibria, say which is stable, mark where the reinforcing loop stops dominating, and explain why a population starting at 300 would fall straight back to 200 without overshooting.",
      hint: "An inverted parabola through 0 and 200 with peak 9 per year at P = 100. One stock cannot overshoot and oscillate.",
      link: { label: "Constrained Growth", hash: "/m/logistic" },
    },
  ],
  pitfalls: [
    "Extrapolating exponential growth as if it added a fixed amount per period, and so being surprised by how fast limits arrive.",
    "Giving confidence ranges that are far too narrow, and trusting statistical intervals that ignore errors in model structure.",
    "Expecting a goal-seeking process to finish in one adjustment time; after one AT only 63% of the gap is closed.",
    "Treating the half-life or doubling time as depending on the size of the stock; for a linear loop it does not.",
    "Building linear models of real systems and so ruling out, by construction, the shifts in loop dominance that produce S-shaped growth.",
    "Leaving the goal of a balancing loop implicit when it is not zero; make desired states explicit.",
    "Expecting oscillation from a single stock in continuous time, or not realising that a discrete time step hides a delay that can create it.",
  ],
  molecules: ["growth", "decay", "goToZero", "closegap", "residence", "logistic", "stockAdjust"],
};
