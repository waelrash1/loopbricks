import type { StudyChapter } from "@/data/sterman/types";

export const CHAPTER: StudyChapter = {
  id: "appA",
  number: "A",
  title: "Numerical integration",
  part: "Appendices",
  pages: "903-911",
  summary:
    "System dynamics models are sets of nonlinear differential equations that almost never have analytic solutions, so they are solved step by step on a computer. Euler's method assumes each flow stays constant over a short interval dt and adds flow × dt to each stock. It is the default in DYNAMO, ithink, Powersim and Vensim, and the finite size of dt is all that separates its result from the exact continuous solution. Integration error depends on dt and on the stability of the system. Choosing dt well (a quarter to a tenth of the shortest time constant, a power of 2, dividing evenly into the data interval) matters, as do the limits round-off places on accuracy and knowing when Runge-Kutta or variable step methods are worth using. The practical test is simple: halve dt, or switch method, and see whether anything that matters changes.",
  bigIdeas: [
    {
      title: "Simulation is numerical integration",
      text: "A stock's value tomorrow is its value today plus what flows in less what flows out in between. The flows are only known at the current instant and will change over the interval, so the real task is estimating the average flow over the next step. Every simulation package does this repeatedly: compute the flows from the current stocks, advance the stocks, recompute the flows.",
      pages: "903-904",
    },
    {
      title: "Euler's method assumes the flows stay constant for one step",
      text: "Euler integration sets Stock(t + dt) = Stock(t) + dt × (Inflow(t) − Outflow(t)). The assumption is reasonable when dt is small relative to how fast the system changes. As dt shrinks toward zero the update becomes the exact differential equation, so the only difference between the simulated and the analytic solution is the finite size of dt.",
      pages: "903-904",
    },
    {
      title: "Integration error grows with dt and with the speed of the dynamics",
      text: "Because the flows actually change during each step, every step adds a small error. In a population example from Sterman (2000), with 4% births a year, an 80-year lifetime and so net growth of 2.75% a year, the exact population after 100 years is 15.643 million; Euler with dt = 0.25 years is about 1% low, dt = 1 year about 3.7% low and dt = 5 years about 16% low. For pure growth Euler always undershoots, just as less frequent compounding earns less interest.",
      pages: "905-906",
    },
    {
      title: "Stability decides whether errors grow or fade",
      text: "In a system dominated by positive feedback, a small error is itself compounded, so the gap between simulated and true paths grows exponentially (the model is ill-conditioned). In a system heading to a stable equilibrium, errors die away as the stock settles. Since loop dominance can shift during a run, a time step that is adequate in one phase may be inadequate in another.",
      pages: "906",
    },
    {
      title: "Choose dt from the shortest time constant",
      text: "A common rule of thumb puts dt at a quarter to a tenth of the shortest time constant in the model. In large models the time constants are hard to list, so the rule is a starting point, not a guarantee. The time step must also divide evenly into the reporting interval of any data you compare against: a quarterly series and dt = 0.2 years do not mix.",
      pages: "907",
    },
    {
      title: "The halving test",
      text: "Run the model with your chosen dt, then halve dt and run again. If nothing that matters for the purpose changes, the original dt was fine; if behaviour changes, halve again until it stops changing. Variable step methods automate exactly this comparison at every step.",
      pages: "907, 909",
    },
    {
      title: "Smaller is not always better: round-off error",
      text: "Computers use finite-precision arithmetic, so each step adds a tiny round-off error. Shrinking dt reduces integration error but multiplies the number of steps and hence the accumulated round-off, and runs take longer. Total error is the sum of the two, so past some point a smaller dt makes things worse. Faster computers and higher precision ease the trade-off but do not remove it.",
      pages: "907",
    },
    {
      title: "Use powers of 2 for dt",
      text: "Time itself is accumulated by adding dt each step. A step such as 0.3 or 1/6 has no exact binary representation, so after many steps the model's clock drifts below the true time. Steps such as 1, 0.5, 0.25 and 0.125 are exact in binary. When monthly data force dt = 1/12 year, enter as many digits as possible, or switch the time unit to months and use dt = 1.",
      pages: "907-908",
    },
    {
      title: "Runge-Kutta estimates the average flow better",
      text: "Second-order Runge-Kutta takes a provisional Euler step, recomputes the flows at the end of the step, and uses the average of the start and end flows to make the real step. Fourth-order Runge-Kutta samples flows at several points inside the step. Each step costs more computation, but errors are much smaller and spread more slowly, so a larger dt or higher accuracy is possible. Variable step versions adjust dt automatically to an error tolerance, which suits physical systems with precisely known laws.",
      pages: "908-909",
    },
    {
      title: "Euler is usually good enough for social systems, but beware discontinuities",
      text: "In models of organisations and societies, errors in parameters, initial values, data and above all structure dwarf integration error, so time is better spent improving the model than refining the solver. Check by rerunning with fourth-order Runge-Kutta: if results do not change, Euler is fine. Higher-order methods evaluate flows between time steps, so they can smear step and pulse inputs, random noise and sudden policy switches; check how your software handles them.",
      pages: "908-911",
    },
  ],
  diagrams: [
    {
      kind: "sequence",
      title: "One Euler step",
      pages: "904-905",
      steps: [
        { label: "Stocks at time t", detail: "Initial values on the first pass" },
        { label: "Auxiliaries and flows", detail: "Computed from current stocks, inputs, constants" },
        { label: "Change = dt × net flow", detail: "Flow assumed constant over the step" },
        { label: "Update stocks", detail: "Stock(t + dt) = Stock(t) + change" },
        { label: "Advance the clock", detail: "Time = t + dt" },
      ],
      loopBack: { from: 4, to: 1, label: "repeat until the final time" },
    },
    {
      kind: "sequence",
      title: "Second-order Runge-Kutta step",
      pages: "908",
      steps: [
        { label: "Flows at t", detail: "k₁ = f(S(t))" },
        { label: "Provisional Euler step", detail: "S̃ = S(t) + dt·k₁" },
        { label: "Flows at t + dt", detail: "k₂ = f(S̃)" },
        { label: "Average the flows", detail: "(k₁ + k₂) ÷ 2" },
        { label: "Real step", detail: "S(t + dt) = S(t) + dt·(k₁ + k₂)/2" },
      ],
    },
    {
      kind: "sequence",
      title: "Choosing and testing the time step",
      pages: "907-911",
      steps: [
        { label: "Find the shortest time constant", detail: "Adjustment times, delays, lifetimes" },
        { label: "Take ¼ to ⅒ of it", detail: "A first guess for dt" },
        { label: "Round to a power of 2", detail: "And make it divide the data interval" },
        { label: "Halve dt and rerun", detail: "Does anything that matters change?" },
        { label: "Rerun with Runge-Kutta", detail: "Confirms Euler is adequate" },
      ],
      loopBack: { from: 3, to: 2, label: "if results change, halve again" },
    },
  ],
  formulations: [
    {
      name: "Euler integration",
      equations: [
        "S(t + dt) = S(t) + dt × (I(t) − O(t))",
        "lim dt→0 [S(t + dt) − S(t)] / dt = I(t) − O(t)",
      ],
      explain:
        "The flows are evaluated once, at the start of the step, and held constant over it. LoopBricks itself integrates every molecule this way with dt = 0.1 time units; the Step once button advances exactly one such step, so you can check an Euler update by hand.",
      molecule: "bathtub",
      pages: "903-904",
    },
    {
      name: "Euler on exponential growth is discrete compounding",
      equations: [
        "Exact: P(t) = P(0)·exp(g·t)",
        "Euler: P(t) = P(0)·(1 + g·dt)^(t/dt)",
        "Example: g = 0.04 − 1/80 = 0.0275/yr, P(0) = 1 million: exact P(100) = 15.643 million",
        "dt = 0.25 ⇒ about 1% low; dt = 1 ⇒ about 3.7% low; dt = 5 ⇒ about 16% low",
      ],
      explain:
        "Each Euler step compounds the growth once, so the time step plays the role of the compounding interval; Euler always undershoots pure growth, and the shortfall itself grows exponentially. With the Population Growth molecule's default (3% per year, dt = 0.1) the Euler value at year 60 is about 603 against an exact 605.",
      molecule: "growth",
      pages: "904-906",
    },
    {
      name: "Euler on goal seeking: when the step breaks the model",
      equations: [
        "dS/dt = (S* − S)/AT",
        "Euler: Gap(t + dt) = Gap(t) × (1 − dt/AT)",
        "dt < AT: smooth approach; dt = AT: goal reached in one step",
        "AT < dt < 2·AT: gap flips sign each step and shrinks (spurious oscillation)",
        "dt = 2·AT: constant oscillation; dt > 2·AT: explodes",
      ],
      explain:
        "This is our worked answer to a standard exercise (S* = 100, S(0) = 0, AT = 1). The factor (1 − dt/AT) must be small and positive for the numerical path to resemble the true exponential approach; that is the reasoning behind keeping dt well below the shortest time constant. A first-order system cannot oscillate, so any oscillation here is created by the time step alone.",
      molecule: "closegap",
      pages: "910",
    },
    {
      name: "Runge-Kutta methods",
      equations: [
        "RK2: k₁ = f(S), k₂ = f(S + dt·k₁), S(t + dt) = S + dt·(k₁ + k₂)/2",
        "RK4: k₁ = f(S), k₂ = f(S + dt·k₁/2), k₃ = f(S + dt·k₂/2), k₄ = f(S + dt·k₃)",
        "S(t + dt) = S + dt·(k₁ + 2k₂ + 2k₃ + k₄)/6",
      ],
      explain:
        "Both replace Euler's start-of-step flow with a weighted average of flows sampled across the step. RK2 is the version Sterman (2000) describes in words; RK4 is the standard formula offered by most simulation packages. More evaluations per step buy much smaller error for the same dt.",
      pages: "908",
    },
    {
      name: "Time-step guidelines",
      equations: [
        "dt ≈ (1/4 to 1/10) × smallest time constant",
        "dt ∈ {…, 2, 1, 0.5, 0.25, 0.125, …}",
        "Data interval ÷ dt = whole number",
      ],
      explain:
        "A practical summary of choosing dt. In the Decay molecule with τ = 1 year, the app's dt = 0.1 is exactly one-tenth of the time constant, the edge of the recommended range.",
      molecule: "decay",
      pages: "907, 910-911",
    },
  ],
  cases: [
    {
      title: "A population simulated by hand",
      text: "Sterman (2000) steps through a population of 1 million with a 4% birth fraction and an 80-year average lifetime, using dt = 0.25 years. At t = 0 births are 40,000 a year and deaths 12,500, so 27,500 × 0.25 = 6875 people are added and the population becomes 1,006,875. The new flows are 40,275 and about 12,586, adding about 6922 more, and so on. Comparing the value at 100 years for different steps shows the error rising from about half a percent at dt = 0.125 to about 16% at dt = 5.",
      pages: "904-906",
    },
    {
      title: "A clock that runs slow",
      text: "If dt is 1/6 year and only two digits are kept, three steps add 0.48 rather than 0.5 and six steps reach 0.96 instead of 1 year. Computers keep more digits but face the same problem in binary: a step of 0.3 is stored as a slightly smaller number, so the model's clock lags. Choosing dt as a power of 2, or changing the time unit (months instead of years for monthly data), avoids the drift.",
      pages: "907-908",
    },
  ],
  exercises: [
    {
      prompt:
        "Do one Euler step by hand. Open Go To Zero with Quick (τ = 2), current value 100. Compute the action (100 ÷ 2 = 50 per month) and the value after one step of dt = 0.1. Press Step once and compare. Press it again and repeat the calculation with the new value.",
      hint: "100 − 0.1 × 50 = 95; next 95 − 0.1 × 47.5 = 90.25. Each step multiplies the stock by 1 − dt/τ = 0.95.",
      link: { label: "Go To Zero", hash: "/m/goToZero" },
    },
    {
      prompt:
        "Euler versus exact growth. In Population Growth with birth 5% and death 2%, compute the exact population at year 60 (100·e^1.8) and the Euler value with the app's dt = 0.1 (100·1.003^600). Set Stop at to 60 and read the simulated value. Which is it closer to, and why must Euler undershoot?",
      hint: "Exact ≈ 605.0, Euler ≈ 603.3. Each step compounds once instead of continuously.",
      link: { label: "Population Growth", hash: "/m/growth" },
    },
    {
      prompt:
        "Error in a stable system. Open Decay and set τ = 1 (the shortest allowed), so dt = 0.1 is one-tenth of the time constant. Compute the exact stock at t = 1 and t = 5 (100·e^−t) and the Euler values (100·0.9^(10t)). Is the absolute error growing or shrinking over time? Compare with the growth case.",
      hint: "t = 1: 36.8 exact, 34.9 Euler; t = 5: 0.67 versus 0.52. The absolute error shrinks as the stock settles, unlike in the growth model.",
      link: { label: "Decay", hash: "/m/decay" },
    },
    {
      prompt:
        "Pen and paper: break the goal-seeking model. With goal 100, start 0 and adjustment time 1, carry out Euler by hand for five steps with dt = 0.5, 1, 1.5 and 2.5. Plot the four paths against the exact curve 100(1 − e^−t). Which step sizes produce behaviour a single stock can never really show?",
      hint: "Gap multiplier 1 − dt/AT: 0.5, 0, −0.5, −1.5. dt = 1.5 gives damped spurious oscillation; dt = 2.5 explodes.",
      link: { label: "Close Gap", hash: "/m/closegap" },
    },
    {
      prompt:
        "Choose a time step. List the time constants in the Cascaded Levels molecule at its Fast (τ = 1.5 months) preset. What range of dt would the quarter-to-tenth rule recommend, which power of 2 would you pick, and is the app's dt = 0.1 month inside the range?",
      hint: "Each stage has τ = 1.5, so dt between about 0.15 and 0.375; 0.25 is the power of 2 inside that range. The app's 0.1 is a little smaller still, which costs only run time.",
      link: { label: "Cascaded Levels", hash: "/m/cascade" },
    },
    {
      prompt:
        "Pen and paper: RK2 versus Euler. For dS/dt = −S with S(0) = 100 and dt = 0.5, compute one Euler step and one RK2 step and compare both with the exact value 100·e^−0.5 ≈ 60.65.",
      hint: "Euler: 50. RK2: k₁ = −100, provisional 50, k₂ = −50, step gives 100 − 0.5 × 75 = 62.5, far closer.",
    },
  ],
  pitfalls: [
    "Picking dt by habit rather than from the model's shortest time constant, and never running the halving test.",
    "Mistaking oscillation or explosion produced by too large a time step for real dynamics of the system.",
    "Assuming that a smaller dt is always more accurate; round-off and run time set a lower limit.",
    "Using a dt such as 0.3 or 1/6 that cannot be represented exactly, so the model clock drifts, or one that does not divide the data interval.",
    "Switching to Runge-Kutta without checking how it treats steps, pulses, noise and other discontinuities.",
    "Spending effort refining the solver in a social system model while far larger structural and parameter errors go untested.",
  ],
  molecules: ["bathtub", "growth", "decay", "closegap", "goToZero", "cascade"],
};
