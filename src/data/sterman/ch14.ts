import type { StudyChapter } from "@/data/sterman/types";

// Topic notes on formulating nonlinear relationships, drawing on Sterman (2000). Paraphrased, with page references.
export const CHAPTER: StudyChapter = {
  id: "ch14",
  number: "14",
  title: "Formulating nonlinear relationships",
  part: "Part IV Tools for modeling dynamic systems",
  pages: "551-595",
  summary:
    "Robust decision rules need nonlinear relationships, and in system dynamics these are usually table (lookup) functions. A disciplined procedure for building them runs as follows: normalise input and output, fix the points that hold by definition, draw reference policies and extreme conditions that fence in the feasible region, choose a shape you can justify, then test the function inside the running model and check how much the results depend on it. Worked examples cover capacity utilisation in a capacitated delay, overtime versus corner cutting in a service centre (with Oliva's estimates from a UK bank), fatigue and the burnout loop, and common errors such as the wrong input, the wrong normalising reference and hump-shaped curves. A workshop method helps elicit such relationships from experts.",
  bigIdeas: [
    {
      title: "Nonlinearity is required, not optional",
      text: "Shipments follow the desired rate until inventory runs short; health care raises life expectancy only up to a point; demand must fall toward zero as availability vanishes however cheap the product. Linear relationships cannot respect such limits, so a model that must behave sensibly in extreme conditions will contain nonlinear functions. Simulation is what makes them practical to include.",
      pages: "551",
    },
    {
      title: "Table functions: points joined by straight lines",
      text: "A table function specifies Y = f(X) as a list of (x, y) pairs with linear interpolation between them. Most software holds the end value constant if the input leaves the specified range and issues a warning, which is a useful sign that the model is operating somewhere you did not intend. Tables are piecewise linear, so their slope jumps at each point; specify enough points for the smoothness the purpose needs.",
      pages: "552",
    },
    {
      title: "Normalise, then fix the reference point",
      text: "Write Y = Y*·f(X/X*) so both the input and the effect are dimensionless ratios. Then the relationship survives changes in scale: Shipments = Capacity × Utilisation(Desired production / Capacity) still works if capacity doubles, whereas Shipments = f(Desired production) holds only for today's plant. Normalisation creates points that hold by definition, usually (1, 1). The choice of reference is arbitrary but must be consistent: define capacity as normal output and utilisation passes through (1, 1); define it as maximum output and the curve passes through (1, normal utilisation) and saturates at 1.",
      pages: "553-555",
    },
    {
      title: "Reference policies fence in the feasible region",
      text: "Draw lines for standard or extreme policies before drawing the curve. A horizontal line at 1 means the input has no effect; the 45 degree line means the output changes one for one, for example utilisation varied exactly enough to produce the desired rate. Other policies give further bounds: producing as fast as physically possible gives the line CU = s_max·SP, where s_max = target delivery delay / minimum delivery delay. A firm should neither overshoot the desired rate when under pressure nor cut back more than needed when idle, which leaves a narrow region for the true function.",
      pages: "553, 555-556",
    },
    {
      title: "Extreme conditions and the input domain",
      text: "Ask what the function must do at zero, at very large values and, where possible, below zero. Utilisation must be zero when there is no backlog, or the backlog could go negative, and it must saturate at a maximum when pressure is very high. Specify the table over the whole plausible range of the input, not just the range seen in historical data, so the model never runs off the end of a table in the scenarios it will be used for. Where several effects multiply, check joint extremes as well as each one alone.",
      pages: "553, 555-556",
    },
    {
      title: "Choose the shape from qualitative knowledge, then check increments",
      text: "Within the feasible region, pick the shape the evidence supports and justify any inflection. In the capacity example managers prefer to keep plants busy and let backlog fall, so the slope at the normal point is below 1; normal utilisation of about 80% of the maximum fixes the ceiling at 1/0.8 = 1.25; and delivery can never be faster than about 75% of normal. Two such facts already pin the curve down. Tabulating the increments between successive points reveals unjustified kinks: they should change smoothly.",
      pages: "556-557",
    },
    {
      title: "Feedback makes results less sensitive than intuition expects",
      text: "When the utilisation curve was made twice as steep or twice as flat, open-loop reasoning predicts a near doubling or halving of the swing in utilisation. In the closed loop the swing changed by only about 35%, because a more responsive plant drains the backlog faster and so lowers the very schedule pressure that drives it. Negative loops exist precisely to buffer such variation. The caveats are important: positive-loop systems and a few high-leverage parameters can be very sensitive, nonlinear systems can be sensitive in one regime and not another, and what counts as significant depends on purpose (numerical, behaviour-mode or policy sensitivity).",
      pages: "558-562",
    },
    {
      title: "Table functions or analytic functions?",
      text: "Analytic forms such as x^a, arctan or the logistic curve are smooth and defined everywhere, but few have enough free parameters to satisfy all the reference points, slopes and limits at once; a saturating curve through (1, 1) may imply an impossibly short minimum delivery delay, for example. They also hide their shape from clients. A table can be redrawn by a client in a minute and rerun immediately, which keeps the modelling conversation on the problem and builds ownership.",
      pages: "562-563",
    },
    {
      title: "Overtime versus corner cutting",
      text: "When a backlog grows, an organisation can only turn work away, add people, work longer, or spend less time per task; in the short run only the last two are available. Workweek = Standard workweek × f(Schedule pressure) creates the balancing Midnight Oil loop, and Time per task = Standard time × f(Schedule pressure) the balancing Corner Cutting loop. For the workweek the 45 degree line is the 'exactly meet the target' policy; for time per task the same policy is the hyperbola 1/SP, and time per task must stay between a minimum and a maximum. Which loop dominates decides whether pressure shows up as tired staff or as poorer work.",
      pages: "563-569",
    },
    {
      title: "Use the right input and the right normalising reference",
      text: "If the reference policy for a function is a hyperbola, the table will be steep near zero and badly approximated by straight segments; invert the input (or the effect) so the policy becomes the 45 degree line. Normalise by the reference that actually governs the effect: customer satisfaction with service time should be normalised by the customer's standard, not management's standard time per task, and fatigue by a physiological norm such as 40 hours, not the standard workweek. Otherwise a policy change such as cutting standard time would wrongly have no effect on quality.",
      pages: "573-577, 580",
    },
    {
      title: "Avoid hump-shaped functions: split the causal paths",
      text: "A curve that rises then falls means the link's polarity depends on its input, which signals two or more causal pathways lumped together. The inverted-U of the Yerkes-Dodson law (stress raises then lowers performance) should be built as a quick, positive overtime effect plus a delayed, negative fatigue effect driven by the recent workweek. Done that way, the equilibrium output curve is still hump shaped: with the values reported by Sterman (2000), output peaks at about 60 hours a week and falls below the 40-hour level above about 72 hours, but each piece has its own delay, cost and policy lever.",
      pages: "577-583",
    },
    {
      title: "Eliciting relationships from experts",
      text: "Numerical data rarely span extreme conditions, so relationships often have to come from people who know the process. A structured workshop has three phases: positioning (purpose, variables, units, worked examples from another setting), individual description (visualise the process, write a walk-through, record anchor points with reasons, then draw the curve against reference policies), and group discussion that compares the curves without forcing consensus. Moving from image to words to points to graph reduces the cognitive load of each step, and disagreements both set ranges for sensitivity tests and expose conflicting mental models.",
      pages: "585-587, 594-595",
    },
  ],
  diagrams: [
    {
      kind: "sequence",
      title: "Building a table function",
      steps: [
        { label: "Normalise", detail: "Y = Y* · f(X / X*): dimensionless in and out" },
        { label: "Reference points", detail: "Points fixed by definition, usually (1, 1)" },
        { label: "Reference policies", detail: "No-effect line, 45 degree line, physical limits" },
        { label: "Extremes and domain", detail: "Values at 0 and very large X; cover the full range" },
        { label: "Plausible shape", detail: "Justify slopes, saturation and any inflection" },
        { label: "Specify values", detail: "Check the increments for kinks you cannot defend" },
        { label: "Test in the model", detail: "Is the input operating where you expect?" },
        { label: "Sensitivity", detail: "Vary the curve widely; refine only what matters" },
      ],
      loopBack: { from: 7, to: 4, label: "gather data where results are sensitive" },
      note: "Our compression of nine formulation guidelines (Sterman 2000) into eight steps.",
      pages: "553",
    },
    {
      kind: "sf",
      title: "Capacitated delay",
      size: [700, 300],
      stocks: [{ id: "bl", label: "Backlog", x: 280, y: 80 }],
      flows: [
        { id: "ord", label: "Orders", pts: [[60, 80], [220, 80]], to: "bl" },
        { id: "sh", label: "Shipments", pts: [[340, 80], [620, 80]], from: "bl" },
      ],
      aux: [
        { id: "dp", label: "Desired production", x: 300, y: 190, labelAt: "left" },
        { id: "cap", label: "Capacity", x: 430, y: 160, labelAt: "left" },
        { id: "sp", label: "Schedule pressure", x: 430, y: 250 },
        { id: "cu", label: "Capacity utilisation", x: 560, y: 190, labelAt: "right" },
      ],
      links: [
        { from: "bl", to: "dp", sign: "+" },
        { from: "dp", to: "sp", sign: "+" },
        { from: "cap", to: "sp", sign: "−" },
        { from: "sp", to: "cu", sign: "+" },
        { from: "cu", to: "sh", sign: "+" },
        { from: "cap", to: "sh", sign: "+" },
      ],
      loops: [{ type: "B", label: "B", x: 375, y: 122 }],
      caption:
        'A growing <b>backlog</b> raises desired production and schedule pressure, the plant runs harder and <b>shipments</b> drain the backlog <span class="chip chipB">B</span>. Utilisation is a table function of <code>Desired production / Capacity</code>, and <code>Shipments = Capacity × Utilisation</code>, so capacity enters twice: it scales pressure down and output up. Because this loop compensates, the behaviour is much less sensitive to the slope of the utilisation curve than open-loop reasoning predicts.',
      pages: "552-562",
    },
    {
      kind: "cld",
      title: "Midnight oil, corner cutting and burnout",
      cld: {
        size: [620, 320],
        vars: [
          { id: "bl", label: "Backlog", x: 85, y: 165 },
          { id: "sp", label: "Schedule pressure", x: 280, y: 50 },
          { id: "ww", label: "Workweek", x: 520, y: 50 },
          { id: "tpt", label: "Time per task", x: 280, y: 165 },
          { id: "fat", label: "Fatigue", x: 555, y: 175 },
          { id: "cr", label: "Completion rate", x: 380, y: 280 },
        ],
        links: [
          { from: "bl", to: "sp", sign: "+", curve: 0 },
          { from: "sp", to: "ww", sign: "+", curve: 0 },
          { from: "ww", to: "cr", sign: "+", curve: 0 },
          { from: "sp", to: "tpt", sign: "−", curve: 0 },
          { from: "tpt", to: "cr", sign: "−", curve: 0 },
          { from: "ww", to: "fat", sign: "+", curve: 0 },
          { from: "fat", to: "cr", sign: "−", curve: 0 },
          { from: "cr", to: "bl", sign: "−", curve: 0 },
        ],
        loops: [
          { type: "B", label: "B1", x: 390, y: 130 },
          { type: "B", label: "B2", x: 195, y: 175 },
          { type: "R", label: "R1", x: 490, y: 170 },
        ],
        caption:
          '<span class="chip chipB">B</span> B1 Midnight Oil: pressure lengthens the workweek and lifts output. <span class="chip chipB">B</span> B2 Corner Cutting: pressure cuts the time spent on each task, lifting output at the expense of quality. <span class="chip chipR">R</span> R1 Burnout: sustained long hours build fatigue (a delayed effect of the recent workweek) that lowers productivity, so the backlog and pressure rise further. Keeping these as three separate monotonic effects, each with its own delay, replaces a single hump-shaped curve.',
      },
      pages: "563-565, 577-583",
    },
    {
      kind: "sequence",
      title: "Eliciting a relationship from experts",
      steps: [
        { label: "Position", detail: "Purpose, variables, units; worked example from another setting" },
        { label: "Visualise", detail: "Each expert pictures the process alone" },
        { label: "Describe", detail: "Write a walk-through of how it works" },
        { label: "Anchor points", detail: "Values fixed by constraints, convention or confidence, with reasons" },
        { label: "Graph", detail: "Plot anchors on axes with reference policies, then sketch the shape" },
        { label: "Discuss", detail: "Compare curves side by side; explore why they differ" },
      ],
      loopBack: { from: 5, to: 4, label: "revise the curve after discussion" },
      note: "After the protocol of Ford and Sterman; consensus is not forced, and differences feed sensitivity ranges.",
      pages: "585-587",
    },
  ],
  formulations: [
    {
      name: "Normalised table function",
      equations: [
        "Y = Y* · Effect of X on Y",
        "Effect of X on Y = Table(X / X*)",
        "Table = (x1, y1), (x2, y2), …, (xn, yn), with f(1) = 1",
      ],
      explain:
        "The reference value Y* carries the units and the normal level; the table carries only the shape of the response to deviations. Values between points are linearly interpolated and the end values are usually held if the input leaves the range.",
      molecule: "effectFunction",
      pages: "552-553",
    },
    {
      name: "Capacitated delay with a utilisation curve",
      equations: [
        "Backlog = ∫(Orders − Shipments) dt",
        "Desired production = Backlog / Target delivery delay",
        "Schedule pressure SP = Desired production / Capacity",
        "Shipments = Capacity · CU(SP),  CU(0) = 0, CU(1) = 1, CU(∞) = CU_max",
        "Fastest-delivery policy: CU = s_max · SP,  s_max = Target delivery delay / Minimum delivery delay",
      ],
      explain:
        "Utilisation must lie under both the maximum and the fastest-delivery line, above the desired-rate line when SP < 1 and below it when SP > 1. In the worked example the table rises 0, 0.33, 0.62, 0.85, 1.00, 1.10, 1.17, 1.22, 1.25 in steps of 0.25 of SP and then stays at 1.25.",
      molecule: "capacityUtil",
      pages: "552-557",
    },
    {
      name: "Labour-capacitated process: overtime and corner cutting",
      equations: [
        "Completion rate = MIN(Backlog / Minimum delivery delay, Potential completion rate)",
        "Potential completion rate = Net labour · Workweek / Time per task",
        "Workweek = Standard workweek · f_ww(SP);  Time per task = Standard time per task · f_tpt(SP)",
        "SP = Desired completion rate / Standard completion rate",
        "Exact-target policies: f_ww(SP) = SP;  f_tpt(SP) = 1 / SP",
      ],
      explain:
        "The MIN term is the work-availability loop that keeps the backlog non-negative. Overtime and corner cutting are two separate table functions of the same schedule pressure, so their strengths, limits and side effects can be studied and changed independently.",
      molecule: "overtime",
      pages: "564-568",
    },
    {
      name: "Power-law estimate near the operating point (Oliva)",
      equations: [
        "f_ww(SP) ≈ SP^s_ww,  f_tpt(SP) ≈ SP^s_tpt",
        "Potential completion rate = SCR · SP^(s_ww − s_tpt)",
        "Estimated s_ww ≈ 0.63, s_tpt ≈ −0.36, so s_ww − s_tpt ≈ 1 and PCR ≈ SCR · SP = Desired completion rate",
      ],
      explain:
        "Log-linear regression on a narrow band of data estimates the slopes at the normal point; saturation limits must come from other evidence. The joint check that the two exponents sum to about one confirms independently that staff did just enough to hit the target delivery delay.",
      pages: "570-572",
    },
    {
      name: "Fatigue as a separate, delayed effect",
      equations: [
        "Potential completion rate = Net labour · Workweek · Effect of fatigue on productivity / Time per task",
        "Effect of fatigue on productivity = f(Recent workweek), f(40 h) = 1",
        "Recent workweek = SMOOTH(Workweek, Fatigue onset time)",
      ],
      explain:
        "Normalise fatigue on a physiological norm, not the organisation's standard workweek. In equilibrium output is Workweek × f(Workweek), which reproduces the hump of the Yerkes-Dodson law without a hump-shaped table, while letting the overtime gain arrive at once and the fatigue loss arrive weeks later.",
      molecule: "prodFatigue",
      pages: "579-583",
    },
  ],
  cases: [
    {
      title: "Sensitivity of a capacitated delay",
      text: "With capacity of 100 units per month, a one-month target delivery delay and orders swinging ±20% over a 12-month cycle, schedule pressure ranged from 0.76 to 1.33 while utilisation ranged only from 0.86 to 1.12, because the curve's slope near normal is below one; average delivery delay settled slightly above target (about 1.04) since the saturating curve responds less to high pressure than low. Doubling or halving the curve's responsiveness, and widening its limits far beyond the experts' range, changed the utilisation range by only about ±35% instead of the 85% increase or 50% fall that open-loop reasoning predicts. The judgmental estimate was therefore good enough for the model's purpose.",
      pages: "557-562",
    },
    {
      title: "Loan officers at a UK bank (Oliva)",
      text: "In a retail lending centre where salaried officers had to clear each day's loan requests, interviews and observation showed they preferred cutting corners to working late, and that tasks could not be done in less than about 60% of standard time. Over a year schedule pressure ranged from 0.88 to 1.14, enough to estimate slopes but not limits. The estimated workweek exponent was about 0.63 and the time-per-task exponent about −0.36; limits were about ±25% on the workweek and ±40% on time per task, giving total throughput between about 0.54 and 2.08 times standard. Because extra work was absorbed mostly by shorter customer interactions, management saw rising throughput per person rather than a need for staff, which fed a self-reinforcing erosion of service quality.",
      pages: "569-573",
    },
    {
      title: "Intensity of cultivation in the Tsembaga model",
      text: "A model of a Papua New Guinea tribe's slash-and-burn farming made cultivation intensity a function of potential food relative to food needed, whose reference policy (produce exactly what is needed) is the hyperbola 1/x. The table, defined only every 4 units, approximated the hyperbola poorly where the dynamics mattered (ratios below one), let production exceed need over part of its range, and kept producing about 4% of capacity with no people at all. Inverting the input to food needed / potential food turned the reference policy into the 45 degree line, and Kampmann's revised table removed all three faults.",
      pages: "573-575",
    },
    {
      title: "Precedence relationships in chip development (Ford and Sterman)",
      text: "For a product development model of an application-specific chip, seven workshops of about 45 minutes, each with a different set of experts (who averaged over ten years of chip development experience) elicited how much work a phase can do given what another phase has released. Design engineers' curve for their own phase showed a flat start, because about 20% of the code blocks had to be nearly finished before others could begin; the agreed curve came from discussion, not averaging. For the link from product definition to design, marketers thought design could start on vague specifications while designers thought about half the specifications were needed, a gap of more than half the design scope that explained long-running conflict, iteration and delay.",
      pages: "587-594",
    },
  ],
  exercises: [
    {
      prompt:
        "Open Effect Function and run 'At reference (1×)'. The result settles where inflow equals drain: Result = Normal flow × effect × Drain time. Confirm the reference value (15 × 1 × 8 = 120). Then run 'Input high (2×)' and 'Input low' and back out the table value f(Input/Reference) from each equilibrium.",
      hint: "Divide the equilibrium result by 120. You are reading the table function point by point, which is how you would check a lookup inside a larger model.",
      link: { label: "Effect Function", hash: "/m/effectFunction" },
    },
    {
      prompt:
        "Still in Effect Function, set Input 200 and Reference 200. The equilibrium matches the 'At reference' run. Now explain, using the fatigue example, when normalising by a reference that moves with policy (such as the standard workweek) gives the wrong answer.",
      hint: "Only the ratio matters to the effect. If the reference is a management target, raising the target cancels the effect even though the physical cause (hours worked) has risen.",
      link: { label: "Effect Function", hash: "/m/effectFunction" },
    },
    {
      prompt:
        "Open Capacity Utilization and run 'Demand > capacity' (capacity 15, demand 25), then set capacity to 40 with demand 25. This molecule uses utilisation = 1 − exp(−1.3 × desired/capacity), so capacity is defined as maximum output. Where does the curve pass when desired output equals capacity, and where does inventory settle in the second run? Relate this to the point that the reference point depends on how you define capacity.",
      hint: "At desired = capacity, utilisation is 1 − e^−1.3 ≈ 0.73, not 1: the reference point is (1, normal utilisation). With capacity 15 production creeps toward 15 and inventory keeps falling. With capacity 40, production equals 25 only when desired output is about 30, so inventory settles near 84, below its target of 100.",
      link: { label: "Capacity Utilization", hash: "/m/capacityUtil" },
    },
    {
      prompt:
        "Open Productivity & Fatigue. Run 'Normal hours', then 'Crunch (backfires)' (overtime 1.4, time to fatigue 4 weeks), then overtime 1.2 and 1.6. Note how output first jumps by the overtime and then sinks as fatigue builds. Compare the long-run output with the fatigue relationship reported by Sterman (2000), where sustained overtime still pays up to about 72 hours a week (1.8 × 40).",
      hint: "In the molecule fatigue tracks overtime, and the fatigue effect is about 2 − fatigue, so equilibrium output is roughly overtime × (2 − overtime): 0.96 at 1.2 and 0.84 at 1.4. Any sustained overtime loses in this simpler curve. The shape of the fatigue table decides where crunch stops paying, which is why it deserves a sensitivity test.",
      link: { label: "Productivity & Fatigue", hash: "/m/prodFatigue" },
    },
    {
      prompt:
        "Open Overtime and compare 'Capped by the limit' with 'Enough people'. Which reference policy does the overtime limit represent, and why must any workweek function saturate?",
      hint: "There is a maximum sustainable workweek (about 50 hours, 1.25 × 40, in the example values). Beyond that the only remaining short-run response is corner cutting.",
      link: { label: "Overtime", hash: "/m/overtime" },
    },
    {
      prompt:
        "Explore the corner-cutting side in the service-quality application: when the workload rises, which loop absorbs it in that model, and what happens to quality and to management's view of staffing needs?",
      link: { label: "Service quality erosion", hash: "/apps/business/service-quality" },
    },
    {
      prompt:
        "Pen and paper: formulate 'Effect of stock coverage on order fill rate' for a distributor, where coverage = Inventory / (Desired shipments × Minimum fulfilment time). Draw the axes, the no-effect line and the 45 degree line, mark the extreme values at coverage 0 and very large coverage, sketch the curve and list eight table values with their increments.",
      hint: "Fill rate must be 0 at zero coverage, equal 1 for large coverage and never exceed the 45 degree line (you cannot ship more than coverage allows). A fuzzy MIN shape.",
    },
    {
      prompt:
        "Pen and paper: a colleague proposes 'Effect of team size on output' as a hump peaking at 12 people. Replace it with two monotonic effects (one rising, one falling), name each causal pathway, give each its own delay, and draw the resulting loops.",
      hint: "For example, more hands (immediate, positive) and coordination overhead or training load on veterans (slower, negative). See also the 'Adding people' application.",
      link: { label: "Adding people and Brooks's law", hash: "/apps/projects/adding-people" },
    },
  ],
  pitfalls: [
    "Leaving a relationship unnormalised (Y = f(X) in raw units), so it silently breaks when capacity, workforce or scale changes.",
    "Specifying a table only over the range seen in the data, so extreme scenarios run off the end where the function is simply held flat.",
    "Choosing an input whose reference policy is a hyperbola, which straight-line segments approximate badly near zero; invert the input instead.",
    "Normalising by a management goal (standard time per task, standard workweek) when the effect depends on a customer or physiological standard.",
    "Drawing a hump-shaped or U-shaped table, which hides two causal paths with different delays and makes polarity ambiguous.",
    "Ignoring joint extremes when several nonlinear effects multiply, so combinations produce impossible values even though each table is sensible alone.",
    "Assuming results will scale with the steepness of a curve; feedback often compensates, so test sensitivity in the closed-loop model before spending effort on more data.",
    "Fitting analytic functions whose few parameters cannot honour all the reference points, slopes and limits at once.",
  ],
  molecules: ["effectFunction", "capacityUtil", "overtime", "prodFatigue", "effectFatigue", "schedulePressure", "nonlinearSplit"],
};
