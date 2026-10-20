import type { StudyChapter } from "@/data/sterman/types";

// Topic notes on stock management, drawing on Sterman (2000). Written in our own words, with page references.
export const CHAPTER: StudyChapter = {
  id: "ch17",
  number: "17",
  title: "Supply chains and the origin of oscillations",
  part: "Part V Instability and oscillation",
  pages: "663-708",
  summary:
    "One structure sits under every supply chain: a stock that managers try to hold at a target by ordering through a delay. The <b>stock management structure</b> is built step by step, first without an acquisition delay and then with a <b>supply line</b> of orders placed but not yet received. Amplification and phase lag follow from the physics of stocks and flows, while oscillation needs one more ingredient: decision makers who give too little weight to the supply line. The Beer Distribution Game supplies the evidence (44 players, an average supply-line weight of only 0.34), and a case study of commercial real estate shows the same error driving decade-long boom and bust.",
  bigIdeas: [
    {
      title: "Supply chains show oscillation, amplification and phase lag",
      text: "A supply chain is the set of stocks and flows through which inputs are acquired, converted and delivered, plus the policies that govern those flows. Data from industry show three regularities: output swings around its trend, the swings get larger as you move upstream from the consumer (drilling swings about three times more than oil production, machine tool orders far more than car sales), and each upstream stage peaks later than the stage below it. These are not features of one industry; they recur wherever stocks are managed through delays, which suggests a common structural cause.",
      pages: "664-666",
    },
    {
      title: "Every stock management rule has two parts: replace losses, then correct the gap",
      text: "Managers cannot change a stock directly; they can only set its inflow. A robust rule anchors the desired acquisition rate on the <b>expected loss rate</b> (what is flowing out) and adjusts it by the gap between desired and actual stock divided by a <b>stock adjustment time</b>. This is anchoring and adjustment in Tversky and Kahneman's sense: the anchor keeps the stock where it is, the adjustment moves it toward the goal. Expected rather than actual losses are used because no one can observe an instantaneous rate; flows are always measured as averages over some interval.",
      pages: "668-671",
    },
    {
      title: "Leaving out loss replacement creates a steady-state error",
      text: "If a firm produces only in proportion to its inventory shortfall, production is zero whenever inventory equals the target, so shipments drain inventory and open a gap. The shortfall widens until it is big enough to make production match shipments. In equilibrium the stock therefore sits below its goal by shipments times the adjustment time, even though a balancing loop is working the whole time. Adding expected losses to the rule removes the error, and the evidence shows people do replace losses when loss information is available.",
      pages: "671-672",
    },
    {
      title: "Stock adjustment amplifies, even with no delay",
      text: "When the desired stock steps up, the acquisition rate must rise above the loss rate long enough to fill the gap, then fall back. In a capital example from Sterman (2000) (8-year life, 3-year adjustment time) a 20% rise in desired capital lifts acquisitions by about 53% at the peak, an amplification ratio of 2.65. A longer adjustment time lowers the peak but slows the response. The surge is temporary: in the long run a 1% rise in the goal gives a 1% rise in throughput, but suppliers see a much larger, transient swing first.",
      pages: "672-673",
    },
    {
      title: "The supply line: orders placed but not yet received",
      text: "Once there is a delay between ordering and receiving, a second stock appears: the supply line, increased by orders and drained by acquisitions. A sensible manager keeps it at a desired level, which by Little's law is the expected acquisition lag times the throughput wanted (6 weeks of delay at 1,000 units a week needs 6,000 on order). The supply-line adjustment forms a second balancing loop that stops ordering once enough is already on the way and also compensates automatically if the lead time stretches. Desired supply line can be based on the full desired acquisition rate or, as experiments suggest people more often do, on expected losses alone.",
      pages: "675-679",
    },
    {
      title: "Delays raise amplification; they do not by themselves cause oscillation",
      text: "Adding a 1.5-year acquisition delay to the capital example, with a supply-line adjustment time of 0.75 years, barely changes how fast capital reaches its new goal but raises the amplification of orders from 2.65 to 8.00. The longer the delay, or the more aggressively the supply line is corrected, the larger the swing in orders. Yet the response is still a single overshoot of orders, not a cycle, because the rule fully counts what is already on order.",
      pages: "680-684",
    },
    {
      title: "Oscillation needs a delay and a decision maker who ignores it",
      text: "Negative loops without delays cannot oscillate, but not every delayed negative loop does either. A cycle appears only when managers keep correcting a perceived gap after enough corrections are already in the pipeline to close it. In a worked example from Sterman (2000) (desired inventory 400, delivery delay 3 weeks), a manager who ignores the supply line keeps ordering 200 a week for a 100-unit shortfall, swells the pipeline to 600, overshoots to 700 units, cuts orders to zero, empties the pipeline and then overshoots again with a growing amplitude. The same shock with the supply line fully counted is absorbed in four weeks with no cycle.",
      pages: "684-692",
    },
    {
      title: "The weight on the supply line turns a delayed loop into a first-order one",
      text: "Write the supply-line weight as WSL = SAT / SLAT. The order rule then becomes expected losses plus the gap in an <b>effective total stock</b>, S + WSL × SL, divided by SAT. With WSL = 1 the manager is controlling the true total of stock on hand and on order, which is a first-order negative loop and cannot oscillate whatever the delay. With WSL = 0 the delay is invisible to the decision rule and the loop rings. Between the two, the closer WSL is to 1, the more damped the response.",
      pages: "693",
    },
    {
      title: "Beer game players give the supply line about a third of its weight",
      text: "Fitting the stock management rule to the orders of 44 Beer Game players explained 71% of the variance in their decisions. The average estimated weight on the supply line was only 0.34, only a quarter of players counted more than half of it, and for a third the weight could not be told apart from zero. The average fitted parameters (forecast smoothing 1.82 weeks, inventory adjustment 3.85 weeks) reproduce the game's characteristic pattern so closely that one of the published game histories is in fact a simulation. Simple rules capture human ordering far better than players expect.",
      pages: "693-694",
    },
    {
      title: "Why people ignore the supply line",
      text: "Everyday versions of the error are familiar: the scalding hotel shower, the burnt dinner on an electric ring, repeated mouse clicks, drinking faster than alcohol reaches the blood. We learn to wait in settings with fast, vivid feedback, but business and economic systems are slow, ambiguous and outlast a manager's tenure, and short-term incentives can make aggressive ordering rational for the individual. Firms also treat the market as exogenous and do not see the supply lines of their competitors, so each one keeps investing while the industry pipeline is already more than enough to create a glut.",
      pages: "695-698",
    },
    {
      title: "Stock management is a general structure, far beyond business",
      text: "The same structure describes hiring through vacancies, capital through construction, loans through applications, livestock through breeding, crops through planting, and even blood sugar through digestion. Wherever someone sets an inflow to keep a stock near a target and the inflow arrives through a pipeline, the analysis applies, and most of these systems show cycles of some kind. Cancellations and returns should be modelled as separate outflows with their own rules, never as negative orders.",
      pages: "669, 677-678",
    },
  ],
  diagrams: [
    {
      kind: "sf",
      title: "The stock management structure",
      pages: "675-679",
      size: [760, 360],
      stocks: [
        { id: "sl", label: "Supply line", x: 310, y: 290 },
        { id: "stk", label: "Stock", x: 570, y: 290 },
      ],
      flows: [
        { id: "ord", label: "Order rate", pts: [[80, 290], [250, 290]], to: "sl", labelBelow: true },
        { id: "acq", label: "Acquisition rate", pts: [[370, 290], [510, 290]], from: "sl", to: "stk" },
        { id: "loss", label: "Loss rate", pts: [[630, 290], [705, 290]], from: "stk", labelBelow: true },
      ],
      aux: [
        { id: "el", label: "Expected losses", x: 100, y: 70, labelAt: "above" },
        { id: "dsl", label: "Desired supply line", x: 215, y: 150, labelAt: "right" },
        { id: "ds", label: "Desired stock", x: 55, y: 200, labelAt: "above" },
      ],
      links: [
        { from: "stk", to: "ord", sign: "−", curve: 200 },
        { from: "sl", to: "ord", sign: "−", curve: 80 },
        { from: "sl", to: "acq", sign: "+", curve: 80 },
        { from: "loss", to: "el", sign: "+", curve: 130 },
        { from: "el", to: "ord", sign: "+" },
        { from: "el", to: "dsl", sign: "+" },
        { from: "dsl", to: "ord", sign: "+" },
        { from: "ds", to: "ord", sign: "+" },
      ],
      loops: [
        { type: "B", label: "B1", x: 400, y: 215 },
        { type: "B", label: "B2", x: 215, y: 268 },
        { type: "B", label: "B3", x: 386, y: 312 },
      ],
      caption:
        'Orders flow into the <b>supply line</b> and arrive in the <b>stock</b> after the acquisition delay. <span class="chip chipB">B1</span> stock control: a shortfall below the desired stock raises orders, which later refill the stock. <span class="chip chipB">B2</span> supply-line control: orders already on the way reduce further orders. <span class="chip chipB">B3</span> the supply line drains as goods arrive. Orders are anchored on <b>expected losses</b>, and the <b>desired supply line</b> is expected losses times the acquisition delay (Little\'s law). Weaken B2 and the structure oscillates.',
    },
    {
      kind: "sequence",
      title: "How ignoring the supply line produces a cycle",
      pages: "689-690",
      note: "Our retelling of the discrete-time example: desired inventory 400 units, demand 100 a week, delivery delay 3 weeks, 100 units lost in week 1, supply line ignored completely.",
      steps: [
        { label: "Shock", detail: "Inventory drops to 300; the manager orders 200 (100 to replace sales, 100 for the gap)." },
        { label: "Still short", detail: "Nothing has arrived, so the same gap is seen again and another 200 is ordered each week." },
        { label: "Pipeline swells", detail: "The supply line climbs to 600 although only 100 extra units were ever needed." },
        { label: "Overshoot", detail: "Deliveries keep landing; inventory reaches 700 even after orders are cut to zero." },
        { label: "Drain", detail: "With no cancellations, the surplus lasts until the pipeline is empty." },
        { label: "Starve", detail: "Orders restart only when inventory is back at 400, so nothing arrives for weeks and inventory falls to 100." },
        { label: "Bigger swing", detail: "The manager orders 400 a week, the pipeline reaches 1,100 and inventory peaks near 1,200." },
      ],
      loopBack: { from: 6, to: 1, label: "the cycle repeats with growing amplitude" },
    },
    {
      kind: "cld",
      title: "Boom and bust in commercial real estate",
      pages: "698-701",
      cld: {
        size: [660, 380],
        vars: [
          { id: "dem", label: "Space demanded", x: 110, y: 115 },
          { id: "vac", label: "Vacancy rate", x: 330, y: 115 },
          { id: "rent", label: "Rents and values", x: 550, y: 115 },
          { id: "prof", label: "Development profit", x: 550, y: 215 },
          { id: "starts", label: "Construction starts", x: 560, y: 320 },
          { id: "uc", label: "Space under construction", x: 250, y: 320 },
          { id: "space", label: "Completed space", x: 110, y: 215 },
        ],
        links: [
          { from: "dem", to: "vac", sign: "−" },
          { from: "vac", to: "rent", sign: "−" },
          { from: "rent", to: "dem", sign: "−", curve: 130 },
          { from: "rent", to: "prof", sign: "+" },
          { from: "prof", to: "starts", sign: "+" },
          { from: "starts", to: "uc", sign: "+", curve: 50 },
          { from: "uc", to: "starts", sign: "−", curve: 50 },
          { from: "uc", to: "space", sign: "+" },
          { from: "space", to: "vac", sign: "+" },
        ],
        loops: [
          { type: "B", label: "B1", x: 330, y: 72 },
          { type: "B", label: "B2", x: 390, y: 225 },
          { type: "B", label: "B3", x: 415, y: 320 },
        ],
        caption:
          '<span class="chip chipB">B1</span> demand response: high rents make firms economise on space, but weakly and slowly. <span class="chip chipB">B2</span> supply response: high rents and values make development profitable, and two to five years later new space raises vacancies and pulls rents down. <span class="chip chipB">B3</span> supply-line control: space already under construction should damp new starts. Interviews showed developers rarely counted it, so starts keep rising after the market has turned.',
      },
    },
    {
      kind: "sequence",
      title: "The characteristic Beer Game pattern",
      pages: "686-688",
      note: "Customer orders step once from 4 to 8 cases a week and then stay flat; everything else is generated inside the chain.",
      steps: [
        { label: "Inventories fall", detail: "Starting at the retailer, stocks drain and most players run a backlog." },
        { label: "Orders surge", detail: "A wave of orders moves upstream, larger at each stage." },
        { label: "Factory booms", detail: "Production peaks about 15 weeks after the change, around four times the change in customer orders." },
        { label: "Overshoot", detail: "Inventory climbs far above the cost-minimising level near zero." },
        { label: "Orders slashed", detail: "Players cut orders, often to zero for weeks, while surplus slowly drains." },
      ],
      loopBack: { from: 4, to: 0, label: "period of roughly 20-25 weeks" },
    },
  ],
  formulations: [
    {
      name: "Stock management without an acquisition delay",
      equations: [
        "S(t) = S(0) + ∫(AR − LR) dt",
        "AR = MAX(0, DAR)",
        "DAR = EL + AS",
        "AS = (S* − S) / SAT",
      ],
      explain:
        "The stock S is filled by the acquisition rate AR and drained by losses LR. The desired acquisition rate replaces expected losses EL and closes a fraction 1/SAT of the gap each period. The MAX keeps the inflow non-negative; returns or disposals would be a separate outflow. If EL equals LR, the net change is just (S* − S)/SAT, a first-order goal-seeking loop that reaches about 95% of a step after three adjustment times.",
      molecule: "stockAdjust",
      pages: "668-672",
    },
    {
      name: "Steady-state error when losses are not replaced",
      equations: ["Production = (Desired inventory − Inventory) / IAT", "Equilibrium: Production = Shipments", "⇒ Inventory = Desired inventory − Shipments × IAT"],
      explain:
        "With no loss replacement, equilibrium requires a permanent gap large enough to make production equal shipments. With shipments of 10 a period and IAT = 4, inventory settles 40 units below target. Adding expected losses (for example average orders) to the rule removes the error.",
      molecule: "stockAdjust",
      pages: "671-672",
    },
    {
      name: "Stock management with a supply line",
      equations: [
        "SL(t) = SL(0) + ∫(OR − AR) dt",
        "AR = L(SL, AL)   (a material delay of the supply line)",
        "OR = MAX(0, EL + (S* − S)/SAT + (SL* − SL)/SLAT)",
        "SL* = EAL × DAR   or, more often in practice, SL* = EAL × EL",
      ],
      explain:
        "Orders OR are now the decision. They replace expected losses, correct the stock gap and correct the supply-line gap. The desired supply line follows Little's law: the expected acquisition lag EAL times the throughput the manager wants. EAL may lag the true lag if delivery times are only noticed when promises are missed.",
      molecule: "stockmgmt",
      pages: "675-679",
    },
    {
      name: "Weight on the supply line and effective total stock",
      equations: [
        "WSL = SAT / SLAT",
        "ETS = S + WSL × SL,   ETS* = S* + WSL × SL*",
        "OR = MAX(0, EL + (ETS* − ETS) / SAT)",
      ],
      explain:
        "Rewriting the rule shows that the manager is controlling a weighted sum of stock on hand and on order. WSL = 1 means the true total is controlled and the system behaves like a first-order loop. WSL = 0 means the supply line is invisible and the delayed loop can oscillate. The weight is the parameter to estimate from decisions, and the one to change by policy.",
      molecule: "stockmgmt",
      pages: "693",
    },
    {
      name: "The rule estimated from Beer Game decisions",
      equations: [
        "EL(t) = SMOOTH(incoming orders, TEO)",
        "OR = MAX(0, EL + (ETS* − (S + WSL × SL)) / SAT + noise)",
        "Mean estimates: TEO = 1.82 wk, ETS* = 17 units, SAT = 3.85 wk, WSL = 0.34",
      ],
      explain:
        "Players' forecasts were modelled by exponential smoothing and the desired total stock was treated as a constant. With the average parameters and a little noise, the rule generates the same oscillation, amplification and phase lag as real teams.",
      molecule: "lowVisPipeline",
      pages: "693-694",
    },
  ],
  cases: [
    {
      title: "Amplification in industry data",
      text: "US industrial production grows about 3.4% a year with a business cycle of roughly 3 to 5 years around the trend. Materials production swings more than consumer goods and peaks later. In petroleum, production fluctuates more than consumption and drilling about three times more than production. Recessions keep old cars on the road, so vehicle sales swing more than the economy and machine tool orders, driven by car makers' capital plans, swing more again. Semiconductors, far upstream of computers, fluctuate much more than industrial production as a whole.",
      pages: "664-666",
    },
    {
      title: "Capital investment: from 2.65 to 8.00",
      text: "With capital lasting 8 years and a 3-year stock adjustment time, a 20% step in desired capital produces a single overshoot of acquisitions with an amplification ratio of 2.65. Adding a 1.5-year construction delay (close to an estimated 17-month average) and a 0.75-year supply-line adjustment time leaves the capital path almost unchanged but raises the amplification of orders to 8.00, about what is seen in oil and machine tools. The system still does not cycle, because the rule counts capital on order.",
      pages: "672-682",
    },
    {
      title: "The Beer Distribution Game",
      text: "Four players (retailer, wholesaler, distributor, factory) each manage one stage of a beer supply chain with order and shipping delays, paying $0.50 per case per week for inventory and $1.00 for backlog. Customer demand steps once from 4 to 8 cases a week. First-time players typically run up costs about ten times the optimum. Orders and inventories oscillate with a period of 20 to 25 weeks, factory production swings about four times as much as customer orders and peaks about 15 weeks after the change. One factory player's fitted rule had SAT = 1.25 weeks and WSL = 0, so in effect ordered three times what each shortfall required.",
      pages: "684-694",
    },
    {
      title: "Real estate booms and busts",
      text: "Chicago land values from 1830 to 1932 swung roughly 50% around trend while construction ranged from 60% below average to more than double it, in cycles far longer than the business cycle. In the late 1980s US office vacancy rose from under 5% in 1981 to over 19%, yet banks kept increasing construction lending. Interviews with developers found almost none mentioned cycles, delays or the pipeline unprompted; pro formas extrapolated rents and relied on capital gains. In Bakken's flight-simulator experiments, professional developers did no better than MBA students and far worse than a simple rule that counted the supply line.",
      pages: "698-706",
    },
  ],
  exercises: [
    {
      prompt:
        "Open First-Order Stock Adjustment and choose <b>No replacement ordering</b> (outflow 10, desired 100, adjustment time 4, replacement 0). Where does the level settle? Now set the adjustment time to 8. Predict the new resting level before you run it, then switch replacement back to 1.",
      hint: "Equilibrium needs (100 − level)/4 = 10, so the level rests at 60; with 8 months it rests at 20. Replacing losses removes the gap.",
      link: { label: "Open stock adjustment", hash: "/m/stockAdjust" },
    },
    {
      prompt:
        "In Stock Management, run <b>Stable (sees pipeline)</b> (weight 1), then <b>Oscillation (ignores it)</b> (weight 0). Compare the supply line peaks (about 78 against 90) and the inventory peaks (100 against about 110). Explain the difference in terms of loop B2.",
      hint: "Without B2 the rule keeps ordering for a gap that orders already in the pipeline will close, so the supply line overfills, inventory overshoots and the supply line then drops below its normal 60 as orders are cut. Both runs end at 100; only the path differs.",
      link: { label: "Open stock management", hash: "/m/stockmgmt" },
    },
    {
      prompt:
        "Still in Stock Management with weight 0, change only the inventory adjustment time: 2 weeks, then 8 weeks. Which setting gives the larger overshoot and more ringing, and why does reacting faster make things worse when the pipeline is ignored?",
      hint: "At 2 weeks inventory peaks near 116 at week 11 and swings several times; at 8 weeks it creeps up to a gentle peak of about 104 near week 27.",
      link: { label: "Open stock management", hash: "/m/stockmgmt" },
    },
    {
      prompt:
        "In Low-Visibility Pipeline Correction, set the awareness of the pipeline to 0.34, the Beer Game average, keeping the other defaults. Then keep 0.34 and slow the supplier to 12 weeks. How much does the longer delay raise the peak inventory? Relate this to the claim that longer delays strengthen amplification.",
      hint: "With a 6-week supplier inventory peaks at about 106; with 12 weeks at about 118, and orders not received overshoot to about 200. This molecule weights the desired pipeline too, as in the effective total stock formulation, so inventory still settles at 100.",
      link: { label: "Open low-visibility pipeline", hash: "/m/lowVisPipeline" },
    },
    {
      prompt:
        "In Low-Visibility Pipeline Correction, compare <b>Tracks the pipeline</b> with <b>Ignores the pipeline</b>, then run <b>Boom and bust (slow supplier)</b>. Count the inventory peaks in each run and note how big the orders-not-received stock gets in the last one.",
      hint: "Ignoring the pipeline gives a damped cycle around 100; the slow supplier with a 2-week inventory correction swells orders not received to roughly 280 and inventory swings from about 45 to 185.",
      link: { label: "Open low-visibility pipeline", hash: "/m/lowVisPipeline" },
    },
    {
      prompt:
        "Play the bullwhip case and compare <b>Counts orders in transit</b> with <b>Ignores orders in transit</b>. Write two sentences explaining, without equations, why the stage that ignores its pipeline swings more than its customer.",
      link: { label: "Bullwhip case", hash: "/apps/business/bullwhip" },
    },
    {
      prompt:
        "Open the office building case. Run <b>Developers ignore the pipeline</b>, then <b>Half the pipeline counted</b> and <b>Developers count space under construction</b>. Relate the three runs to the developer interviews: what would it take, institutionally, for developers to raise their supply-line weight?",
      link: { label: "Office cycle case", hash: "/apps/economics/office-cycle" },
    },
    {
      prompt:
        "Pen and paper: pick a stock you manage (cash, a reading list, a freezer, a team's backlog). Name the inflow you control, the delay, what sits in the supply line, and whether you normally count it. Sketch the stock management CLD for it and mark the loop you tend to neglect.",
    },
  ],
  pitfalls: [
    "Blaming oscillation on the delay alone. Delays create amplification; the cycle comes from decision rules that underweight the supply line.",
    "Modelling the order decision as the stock gap only, which builds in a steady-state error. Anchor on expected losses first.",
    "Letting orders go negative to represent cancellations. Model cancellations or returns as their own outflow with their own rule.",
    "Assuming managers know the true acquisition delay. Expected lead time usually lags the actual one, and changes in it shift the desired supply line.",
    "Treating amplification as a forecasting failure. Even with a perfect forecast, raising a stock requires the inflow to overshoot for a while.",
    "Believing a fast inventory correction is always responsive. Short adjustment times with a weak supply-line weight are the recipe for violent cycles.",
    "Thinking market discipline will weed out bad ordering rules quickly. Slow, ambiguous feedback and short-term incentives keep the error alive for decades.",
  ],
  molecules: ["stockmgmt", "lowVisPipeline", "stockAdjust", "material", "closegap", "smooth"],
};
