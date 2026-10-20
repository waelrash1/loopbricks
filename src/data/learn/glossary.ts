// The vocabulary a learner meets across the curriculum, in alphabetical order.
// Definitions are in our own words; each `see` points to where the term is taught or can be run.
import type { GlossaryTerm } from "@/data/learn/types";

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "Accumulation",
    def: "The process by which a stock adds up everything that has flowed in and subtracts everything that has flowed out over time. Mathematically it is integration, which is why stocks carry the history of a system.",
    see: [{ label: "Stocks, flows and accumulation", hash: "/learn/stocks-flows" }, { label: "Bathtub", hash: "/m/bathtub" }],
  },
  {
    term: "Adaptive expectations",
    def: "A forecasting rule in which a belief moves part of the way toward the latest observation each period, so the forecast is an exponential smooth of past data. It corrects errors gradually and always lags a trend.",
    see: [{ label: "Bounded rationality and expectations", hash: "/learn/behaviour" }, { label: "Adaptive expectations of inflation", hash: "/apps/economics/expectations" }, { label: "Smoothing", hash: "/m/smooth" }],
  },
  {
    term: "Aging chain",
    def: "A sequence of stocks in which items move from one stage to the next, such as students through school years or equipment from new to old. Each stage has its own outflows, so the chain shows how a population is distributed by age or stage.",
    see: [{ label: "Aging chains and coflows", hash: "/learn/chains" }, { label: "Aging chain", hash: "/m/aging" }, { label: "Training enough doctors and nurses", hash: "/apps/health/workforce-planning" }],
  },
  {
    term: "Amplification",
    def: "The tendency of fluctuations to grow larger as they pass up a chain of stocks and decisions. In supply chains, a small change in customer demand becomes a much larger swing in factory orders.",
    see: [{ label: "Oscillation: stock management and supply chains", hash: "/learn/oscillation" }, { label: "The bullwhip effect", hash: "/apps/business/bullwhip" }],
  },
  {
    term: "Anchoring and adjustment",
    def: "A judgement strategy in which a person starts from a reference value and adjusts it toward other information, usually too little. In models it appears as a weighted average of an anchor and new cues.",
    see: [{ label: "Bounded rationality and expectations", hash: "/learn/behaviour" }, { label: "Univariate anchoring", hash: "/m/univariateAnchor" }, { label: "Price anchoring and drift", hash: "/apps/economics/price-anchoring" }],
  },
  {
    term: "Archetype",
    def: "A recurring feedback structure with a recognisable story and behaviour, such as limits to growth or shifting the burden. Recognising one helps predict how a situation will unfold and where to intervene.",
    see: [{ label: "System archetypes", hash: "/learn/archetypes" }],
  },
  {
    term: "Auxiliary",
    def: "A variable computed from other variables at each moment, with no memory of its own. Auxiliaries break a complicated flow equation into named, understandable pieces.",
    see: [{ label: "Stocks, flows and accumulation", hash: "/learn/stocks-flows" }, { label: "Stocks, flows and units", hash: "/methods/stocks-flows" }],
  },
  {
    term: "Balancing loop",
    def: "A feedback loop that counteracts change and pushes a stock toward a goal or limit. It has an odd number of negative links and produces goal-seeking behaviour, or oscillation when delays are present.",
    see: [{ label: "Feedback loops and causal diagrams", hash: "/learn/loops" }, { label: "Closing a gap", hash: "/m/closegap" }],
  },
  {
    term: "Behaviour mode sensitivity",
    def: "Sensitivity in which changing an uncertain assumption changes the pattern of behaviour, for example from smooth adjustment to oscillation. It matters more than numerical sensitivity because it alters what the model says is happening.",
    see: [{ label: "Sensitivity lab", hash: "/methods/sensitivity" }, { label: "Testing and building confidence", hash: "/learn/testing" }],
  },
  {
    term: "Boundary",
    def: "The line between what a model explains endogenously, what it takes as given from outside, and what it leaves out entirely. A model boundary chart lists all three so others can judge whether important feedback has been omitted.",
    see: [{ label: "The modelling process and problem framing", hash: "/learn/process" }, { label: "The modelling process", hash: "/methods/process" }],
  },
  {
    term: "Bounded rationality",
    def: "The idea that people decide sensibly given limited information, time and computing ability, by using simple rules of thumb rather than full optimisation. Decision rules in system dynamics models are meant to reflect these real rules.",
    see: [{ label: "Bounded rationality and expectations", hash: "/learn/behaviour" }],
  },
  {
    term: "Bullwhip effect",
    def: "The growth in the size of order swings at each step back along a supply chain, from retailer to wholesaler to factory. It arises mainly because managers underweight the orders already in the supply line.",
    see: [{ label: "The bullwhip effect in supply chains", hash: "/apps/business/bullwhip" }, { label: "Oscillation: stock management and supply chains", hash: "/learn/oscillation" }, { label: "Stock management", hash: "/m/stockmgmt" }],
  },
  {
    term: "Calibration",
    def: "Choosing values for uncertain parameters so that the model's output matches historical data as closely as possible. A good fit is useful evidence but does not by itself show that the structure is right.",
    see: [{ label: "Calibration lab", hash: "/methods/calibration" }, { label: "Testing and building confidence", hash: "/learn/testing" }],
  },
  {
    term: "Carrying capacity",
    def: "The largest level a stock can sustain given the resources that support it. As a population nears its carrying capacity, balancing feedback slows net growth to zero.",
    see: [{ label: "S-shaped growth", hash: "/learn/s-shaped" }, { label: "Logistic growth", hash: "/m/logistic" }],
  },
  {
    term: "Causal link",
    def: "An arrow in a causal diagram showing that a change in one variable produces a change in another. It claims a real causal mechanism, not just a correlation in data.",
    see: [{ label: "Feedback loops and causal diagrams", hash: "/learn/loops" }, { label: "Causal loop diagrams", hash: "/methods/causal-loops" }],
  },
  {
    term: "Causal loop diagram",
    def: "A map of variables joined by signed causal links that shows the main feedback loops of a system. It is good for communicating a dynamic hypothesis but does not distinguish stocks from flows.",
    see: [{ label: "Causal loop diagrams", hash: "/methods/causal-loops" }, { label: "Feedback loops and causal diagrams", hash: "/learn/loops" }],
  },
  {
    term: "Cloud",
    def: "The symbol at the start or end of a flow that marks a source or sink outside the model boundary. A cloud says the stock it represents is assumed to be unlimited and is not tracked.",
    see: [{ label: "Stocks, flows and accumulation", hash: "/learn/stocks-flows" }, { label: "Stocks, flows and units", hash: "/methods/stocks-flows" }],
  },
  {
    term: "Coflow",
    def: "A parallel stock structure that tracks an attribute of the items in a main stock, such as the total experience held by a workforce. Each flow of items carries its share of the attribute in or out, so the average attribute can be computed.",
    see: [{ label: "Aging chains and coflows", hash: "/learn/chains" }, { label: "Coflow", hash: "/m/coflow" }, { label: "Hiring and the experience of a workforce", hash: "/apps/projects/experience-dilution" }],
  },
  {
    term: "Constant",
    def: "A parameter that does not change during a simulation run, such as a delay time or a normal fraction. Constants are the inputs a modeller varies in sensitivity tests and policy experiments.",
    see: [{ label: "Stocks, flows and units", hash: "/methods/stocks-flows" }, { label: "Stocks, flows and accumulation", hash: "/learn/stocks-flows" }],
  },
  {
    term: "Delay",
    def: "A process whose output lags behind its input. Every delay contains a stock that holds what has entered but not yet left, and delays inside feedback loops are a main cause of overshoot and oscillation.",
    see: [{ label: "Delays and perception", hash: "/learn/delays" }, { label: "Material delay", hash: "/m/material" }],
  },
  {
    term: "Delay order",
    def: "The number of stocks in series used to represent a delay. A first-order delay responds at once and then tails off, while higher orders hold back the response and release it closer to the average delay time.",
    see: [{ label: "Delays and perception", hash: "/learn/delays" }, { label: "Cascade of stages", hash: "/m/cascade" }, { label: "First and third-order smoothing", hash: "/m/smooth" }],
  },
  {
    term: "Dimensional consistency",
    def: "The requirement that the units on both sides of every equation match, with flows measured in stock units per unit of time. A units error usually signals a mistake in the model's logic, not just in its labels.",
    see: [{ label: "Stocks, flows and units", hash: "/methods/stocks-flows" }, { label: "Testing and building confidence", hash: "/learn/testing" }],
  },
  {
    term: "Double-loop learning",
    def: "Learning in which feedback from the world changes not only our decisions but also the mental models and goals behind them. Single-loop learning only adjusts decisions within an unchanged view of the system.",
    see: [{ label: "Why complex systems surprise us", hash: "/learn/surprise" }],
  },
  {
    term: "Doubling time",
    def: "The time a stock growing at a constant fractional rate takes to double in size. It equals ln 2 divided by the growth rate and stays the same no matter how large the stock already is.",
    see: [{ label: "First-order feedback", hash: "/learn/first-order" }, { label: "Exponential growth", hash: "/m/growth" }],
  },
  {
    term: "Dynamic hypothesis",
    def: "A proposed explanation of a problem's behaviour in terms of the feedback structure that generates it. It is stated so that it can be turned into a simulation model and tested against the reference mode.",
    see: [{ label: "The modelling process and problem framing", hash: "/learn/process" }, { label: "The modelling process", hash: "/methods/process" }],
  },
  {
    term: "Effect function",
    def: "A nonlinear multiplier that scales a normal rate according to a ratio, such as the effect of schedule pressure on productivity. It is normalised so that it equals 1 when the input equals its reference value.",
    see: [{ label: "Formulating decision rules", hash: "/learn/formulation" }, { label: "Effect function", hash: "/m/effectFunction" }],
  },
  {
    term: "Endogenous",
    def: "Generated from within the model by its own feedback structure. System dynamics aims for endogenous explanations, so that behaviour comes from how the system is organised rather than from outside shocks.",
    see: [{ label: "The modelling process and problem framing", hash: "/learn/process" }, { label: "The modelling process", hash: "/methods/process" }],
  },
  {
    term: "Equilibrium",
    def: "A condition in which every stock in a model is unchanging because its inflows and outflows balance. The flows need not be zero; a full bathtub with the tap and drain running at the same rate is in equilibrium.",
    see: [{ label: "Stocks, flows and accumulation", hash: "/learn/stocks-flows" }, { label: "Bathtub", hash: "/m/bathtub" }],
  },
  {
    term: "Eroding goals",
    def: "An archetype in which a gap between goal and performance is closed by lowering the goal instead of improving performance. Repeated over time, standards drift steadily downward.",
    see: [{ label: "System archetypes", hash: "/learn/archetypes" }, { label: "Service quality erosion", hash: "/apps/business/service-quality" }],
  },
  {
    term: "Euler integration",
    def: "The simplest way to simulate a model: each step, add the net flow multiplied by the time step to each stock. It is easy to follow but becomes inaccurate if the time step is large relative to the model's fastest time constant.",
    see: [{ label: "Simulation mechanics", hash: "/learn/mechanics" }],
  },
  {
    term: "Exogenous",
    def: "Determined outside the model and supplied as an input, such as a fixed population forecast or a test signal. Exogenous variables cannot respond to anything in the model, so any feedback through them is lost.",
    see: [{ label: "The modelling process and problem framing", hash: "/learn/process" }],
  },
  {
    term: "Exponential decay",
    def: "Decline in which a stock loses a constant fraction of itself per unit of time, so it falls quickly at first and then ever more slowly. It is the behaviour of a single balancing loop draining a stock toward zero.",
    see: [{ label: "First-order feedback", hash: "/learn/first-order" }, { label: "Exponential decay", hash: "/m/decay" }],
  },
  {
    term: "Exponential growth",
    def: "Growth in which a stock increases by a constant fraction of itself per unit of time, so the absolute increase gets larger every period. It is the behaviour of a single reinforcing loop.",
    see: [{ label: "First-order feedback", hash: "/learn/first-order" }, { label: "Exponential growth", hash: "/m/growth" }, { label: "Debt dynamics", hash: "/apps/economics/debt-snowball" }],
  },
  {
    term: "Extreme-conditions test",
    def: "A test that sets inputs to extreme values, such as zero workforce or infinite demand, and checks that the model still behaves plausibly. It exposes equations that only work in the normal range.",
    see: [{ label: "Validation", hash: "/methods/validation" }, { label: "Testing and building confidence", hash: "/learn/testing" }],
  },
  {
    term: "First-order smooth",
    def: "A single stock that adjusts toward its input by a fraction of the gap each period, producing an exponentially weighted average of past values. It is the standard way to model perception, reporting and expectation delays.",
    see: [{ label: "Delays and perception", hash: "/learn/delays" }, { label: "Smoothing", hash: "/m/smooth" }],
  },
  {
    term: "Fixes that fail",
    def: "An archetype in which a quick fix relieves a symptom but sets off a delayed side effect that makes the problem return or grow. Each new crisis invites the same fix, deepening the trap.",
    see: [{ label: "System archetypes", hash: "/learn/archetypes" }, { label: "Policy resistance", hash: "/apps/social/policy-resistance" }],
  },
  {
    term: "Floating goal",
    def: "A goal that is itself a stock adjusting toward recent performance, rather than a fixed target. Floating goals allow standards to erode under pressure, or to rise after a run of good results.",
    see: [{ label: "Formulating decision rules", hash: "/learn/formulation" }, { label: "Self-adjusting anchor", hash: "/m/seaAnchor" }],
  },
  {
    term: "Flow",
    def: "A rate of change that fills or drains a stock, measured in stock units per unit of time. Flows can change instantly, while stocks can only change through flows.",
    see: [{ label: "Stocks, flows and accumulation", hash: "/learn/stocks-flows" }, { label: "Bathtub", hash: "/m/bathtub" }],
  },
  {
    term: "Goal-seeking",
    def: "Behaviour in which a stock moves toward a target, quickly while the gap is large and more slowly as it closes. It is produced by a balancing loop without significant delays.",
    see: [{ label: "First-order feedback", hash: "/learn/first-order" }, { label: "Closing a gap", hash: "/m/closegap" }],
  },
  {
    term: "Half-life",
    def: "The time a decaying stock takes to fall to half its current value. For first-order decay it equals about 0.7 times the time constant.",
    see: [{ label: "First-order feedback", hash: "/learn/first-order" }, { label: "Exponential decay", hash: "/m/decay" }, { label: "Methane lifetime", hash: "/apps/environment/methane-lifetime" }],
  },
  {
    term: "Information delay",
    def: "A lag in perceiving or reporting a quantity, such as the time to notice a change in sales. Unlike a material delay, nothing physical is held in transit; what accumulates is a belief that slowly catches up.",
    see: [{ label: "Delays and perception", hash: "/learn/delays" }, { label: "Smoothing", hash: "/m/smooth" }],
  },
  {
    term: "Information link",
    def: "A connection that carries the value of a variable to an equation that uses it, without moving any material. Decisions are driven by information links from stocks, which is how feedback closes.",
    see: [{ label: "Stocks, flows and units", hash: "/methods/stocks-flows" }, { label: "Stocks, flows and accumulation", hash: "/learn/stocks-flows" }],
  },
  {
    term: "Integration error",
    def: "The difference between a simulated path and the true solution caused by stepping through time in discrete chunks. Halving the time step and comparing results is the standard check.",
    see: [{ label: "Simulation mechanics", hash: "/learn/mechanics" }],
  },
  {
    term: "Leverage point",
    def: "A place in a system where a small, well-chosen change produces a large, lasting improvement. High-leverage points are often far in time and space from where the symptoms appear.",
    see: [{ label: "System archetypes", hash: "/learn/archetypes" }, { label: "Why complex systems surprise us", hash: "/learn/surprise" }],
  },
  {
    term: "Limits to growth",
    def: "An archetype in which a reinforcing growth process meets a balancing loop that tightens as a limit is approached. Pushing harder on growth does little; the leverage lies in the limiting factor.",
    see: [{ label: "System archetypes", hash: "/learn/archetypes" }, { label: "Limits to growth", hash: "/apps/environment/limits-to-growth" }],
  },
  {
    term: "Link polarity",
    def: "The sign on a causal link. Positive means the effect moves in the same direction as the cause, all else equal; negative means it moves in the opposite direction.",
    see: [{ label: "Feedback loops and causal diagrams", hash: "/learn/loops" }, { label: "Causal loop diagrams", hash: "/methods/causal-loops" }],
  },
  {
    term: "Lock-in",
    def: "A state in which reinforcing feedback has made one option, such as a technology or standard, so dominant that switching away is very costly even if a better option exists. It is the end point of strong path dependence.",
    see: [{ label: "Path dependence and lock-in", hash: "/learn/lock-in" }, { label: "Competing standards and lock-in", hash: "/apps/business/lock-in" }],
  },
  {
    term: "Logistic growth",
    def: "S-shaped growth in which the fractional growth rate falls in a straight line as the stock approaches its carrying capacity. Growth is fastest at half the capacity and is symmetric about that point.",
    see: [{ label: "S-shaped growth", hash: "/learn/s-shaped" }, { label: "Logistic growth", hash: "/m/logistic" }],
  },
  {
    term: "Loop dominance",
    def: "The condition in which one feedback loop has the strongest influence on a stock's behaviour at a given time. The dominant loop determines whether the stock is growing, settling or oscillating.",
    see: [{ label: "First-order feedback", hash: "/learn/first-order" }, { label: "Logistic growth", hash: "/m/logistic" }],
  },
  {
    term: "Loop polarity",
    def: "Whether a feedback loop is reinforcing or balancing. A loop with an even number of negative links, including none, is reinforcing; an odd number makes it balancing.",
    see: [{ label: "Feedback loops and causal diagrams", hash: "/learn/loops" }, { label: "Causal loop diagrams", hash: "/methods/causal-loops" }],
  },
  {
    term: "MAPE",
    def: "Mean absolute percent error: the average size of the gap between simulated and observed values, expressed as a percentage of the observed values. It is easy to read but misleading when the data are close to zero.",
    see: [{ label: "Fit statistics", hash: "/methods/fit" }, { label: "Testing and building confidence", hash: "/learn/testing" }],
  },
  {
    term: "Material delay",
    def: "A delay in the physical movement of things, such as goods in shipping or patients in treatment. The material in transit is conserved and forms a stock, often called the pipeline.",
    see: [{ label: "Delays and perception", hash: "/learn/delays" }, { label: "Material delay", hash: "/m/material" }],
  },
  {
    term: "Mental model",
    def: "The beliefs a person holds about how a system works, including its boundaries, causes and time scales. Mental models are usually simple and static, which is why simulation is needed to infer the dynamics they imply.",
    see: [{ label: "Why complex systems surprise us", hash: "/learn/surprise" }],
  },
  {
    term: "Model purpose",
    def: "The specific problem a model is built to understand and the decisions it should inform. Purpose decides the boundary, the level of detail and the tests that matter, so a model is only useful relative to a purpose.",
    see: [{ label: "The modelling process and problem framing", hash: "/learn/process" }, { label: "The modelling process", hash: "/methods/process" }],
  },
  {
    term: "Net flow",
    def: "The sum of a stock's inflows minus the sum of its outflows at a given moment. The stock rises whenever net flow is positive and falls whenever it is negative, whatever the individual flows are doing.",
    see: [{ label: "Stocks, flows and accumulation", hash: "/learn/stocks-flows" }, { label: "Bathtub", hash: "/m/bathtub" }],
  },
  {
    term: "Numerical sensitivity",
    def: "Sensitivity in which changing an assumption changes the numbers a model produces but not the pattern of behaviour. Almost every model shows it; it matters only if the numbers themselves drive the decision.",
    see: [{ label: "Sensitivity lab", hash: "/methods/sensitivity" }, { label: "Testing and building confidence", hash: "/learn/testing" }],
  },
  {
    term: "Oscillation",
    def: "Repeated swinging of a stock above and below its goal. It arises when a balancing loop contains significant delays, so corrective action keeps arriving after it is needed.",
    see: [{ label: "Oscillation: stock management and supply chains", hash: "/learn/oscillation" }, { label: "Stock management", hash: "/m/stockmgmt" }, { label: "The hog cycle", hash: "/apps/economics/hog-cycle" }],
  },
  {
    term: "Overshoot",
    def: "Going past a goal or limit before turning back. It happens when the information that the goal has been reached arrives late, or when action continues after it should have stopped.",
    see: [{ label: "Patterns of behaviour", hash: "/learn/patterns" }, { label: "Stock management", hash: "/m/stockmgmt" }],
  },
  {
    term: "Overshoot and collapse",
    def: "Growth past a carrying capacity that also degrades the capacity, so the stock falls far below its former level and may not recover. Overfished stocks and depleted aquifers follow this pattern.",
    see: [{ label: "Patterns of behaviour", hash: "/learn/patterns" }, { label: "Fisheries: overinvestment and overfishing", hash: "/apps/environment/fishery" }, { label: "Tragedy of the commons", hash: "/m/tragedyCommons" }],
  },
  {
    term: "Path dependence",
    def: "A property of systems in which small, often random, early events decide which of several possible outcomes the system ends up in. It is produced by reinforcing feedback that amplifies early leads.",
    see: [{ label: "Path dependence and lock-in", hash: "/learn/lock-in" }, { label: "Market share", hash: "/m/marketshare" }],
  },
  {
    term: "Phase lag",
    def: "The time by which one oscillating variable trails another, such as production peaking after orders. Phase lags between stages reveal the delays in a system and help identify which stocks cause a cycle.",
    see: [{ label: "Oscillation: stock management and supply chains", hash: "/learn/oscillation" }, { label: "Cycles in business and commodity markets", hash: "/learn/cycles" }],
  },
  {
    term: "Pink noise",
    def: "Random variation that is correlated over time, so values drift up or down for a while rather than jumping independently each step. It is a more realistic test input than white noise for exciting a model's natural modes.",
    see: [{ label: "Simulation mechanics", hash: "/learn/mechanics" }],
  },
  {
    term: "Pipeline delay",
    def: "A delay in which every item takes exactly the same time to pass through, so the output is the input shifted in time. It is the limit of a material delay as the delay order becomes very high.",
    see: [{ label: "Delays and perception", hash: "/learn/delays" }, { label: "Material delay", hash: "/m/material" }],
  },
  {
    term: "Policy resistance",
    def: "The tendency of interventions to be defeated by the system's response to them. Other actors and balancing loops react to the policy and offset its intended effect.",
    see: [{ label: "Feedback loops and causal diagrams", hash: "/learn/loops" }, { label: "Policy resistance", hash: "/apps/social/policy-resistance" }],
  },
  {
    term: "Policy sensitivity",
    def: "Sensitivity in which changing an uncertain assumption reverses which policy looks best. It is the kind of sensitivity that matters most, because it means the recommendation depends on something we do not know.",
    see: [{ label: "Sensitivity lab", hash: "/methods/sensitivity" }, { label: "Testing and building confidence", hash: "/learn/testing" }],
  },
  {
    term: "Rate",
    def: "Another word for a flow: the quantity per unit of time entering or leaving a stock. The equation for a rate is where decision rules and physical constraints enter a model.",
    see: [{ label: "Stocks, flows and accumulation", hash: "/learn/stocks-flows" }, { label: "Formulating decision rules", hash: "/learn/formulation" }],
  },
  {
    term: "Reference mode",
    def: "A graph over time of the behaviour the model is meant to explain, drawn from data or from the client's descriptions. It sets the time horizon and is the pattern the dynamic hypothesis must reproduce.",
    see: [{ label: "Reference modes", hash: "/methods/reference-modes" }, { label: "Patterns of behaviour", hash: "/learn/patterns" }],
  },
  {
    term: "Reinforcing loop",
    def: "A feedback loop that amplifies change, so growth leads to more growth or decline to more decline. It has an even number of negative links and produces exponential behaviour.",
    see: [{ label: "Feedback loops and causal diagrams", hash: "/learn/loops" }, { label: "Exponential growth", hash: "/m/growth" }],
  },
  {
    term: "Residence time",
    def: "The average time an item spends in a stock. In equilibrium it equals the stock divided by its outflow, which is a quick way to estimate delays from data.",
    see: [{ label: "Residence time", hash: "/m/residence" }, { label: "Carbon dioxide as a bathtub", hash: "/apps/environment/co2-bathtub" }],
  },
  {
    term: "RMSE",
    def: "Root mean square error: the square root of the average squared gap between simulated and observed values, in the units of the data. Squaring makes it sensitive to a few large errors.",
    see: [{ label: "Fit statistics", hash: "/methods/fit" }, { label: "Calibration lab", hash: "/methods/calibration" }],
  },
  {
    term: "Rule of 70",
    def: "A shortcut for doubling time: divide 70 by the growth rate in percent per period. Growth of 7% a year doubles a quantity in about 10 years.",
    see: [{ label: "First-order feedback", hash: "/learn/first-order" }, { label: "Exponential growth", hash: "/m/growth" }],
  },
  {
    term: "S-shaped growth",
    def: "Growth that starts slowly, accelerates, then levels off at a limit. It shows a shift in dominance from a reinforcing loop to a balancing loop as the limit approaches.",
    see: [{ label: "S-shaped growth", hash: "/learn/s-shaped" }, { label: "Diffusion", hash: "/m/diffusion" }, { label: "How a new product spreads", hash: "/apps/business/new-product-diffusion" }],
  },
  {
    term: "Sensitivity analysis",
    def: "Testing how a model's results change when uncertain assumptions are varied across plausible ranges. Sensitivity can be numerical, in behaviour mode, or in policy conclusions, and the last is the one that matters most.",
    see: [{ label: "Sensitivity lab", hash: "/methods/sensitivity" }, { label: "Testing and building confidence", hash: "/learn/testing" }],
  },
  {
    term: "Shifting loop dominance",
    def: "A change over time in which feedback loop controls a stock's behaviour, often caused by nonlinear relationships. It explains why a system can grow fast for years and then stall, or turn from stable to unstable.",
    see: [{ label: "First-order feedback", hash: "/learn/first-order" }, { label: "S-shaped growth", hash: "/learn/s-shaped" }, { label: "Logistic growth", hash: "/m/logistic" }],
  },
  {
    term: "Shifting the burden",
    def: "An archetype in which a symptomatic fix eases a problem and so reduces the pressure to apply a fundamental solution, while its side effects weaken the ability to apply that solution later. The system grows dependent on the fix.",
    see: [{ label: "System archetypes", hash: "/learn/archetypes" }, { label: "Shifting the burden", hash: "/m/shiftingBurden" }, { label: "Capability traps", hash: "/apps/business/capability-trap" }],
  },
  {
    term: "Steady state",
    def: "A condition in which a system's behaviour no longer changes over time. In a stock and flow model it usually means equilibrium, though a system growing at a constant percentage rate is sometimes said to be in a steady state of growth.",
    see: [{ label: "Patterns of behaviour", hash: "/learn/patterns" }, { label: "Bathtub", hash: "/m/bathtub" }],
  },
  {
    term: "Stock",
    def: "An accumulation that describes the state of a system at a moment, such as inventory, population or debt. It changes only through its flows and gives a system memory and inertia.",
    see: [{ label: "Stocks, flows and accumulation", hash: "/learn/stocks-flows" }, { label: "Bathtub", hash: "/m/bathtub" }, { label: "Stocks, flows and units", hash: "/methods/stocks-flows" }],
  },
  {
    term: "Stock management",
    def: "The task of keeping a stock near a desired level by adjusting its inflow, while accounting for losses and for what is already on its way. The standard decision rule replaces expected losses and corrects gaps in both the stock and the supply line.",
    see: [{ label: "Oscillation: stock management and supply chains", hash: "/learn/oscillation" }, { label: "Stock management", hash: "/m/stockmgmt" }, { label: "Stock adjustment", hash: "/m/stockAdjust" }],
  },
  {
    term: "Supply line",
    def: "The stock of items ordered but not yet received. Decision makers who ignore it keep ordering to fill a gap that is already being filled, which causes overshoot and oscillation.",
    see: [{ label: "Oscillation: stock management and supply chains", hash: "/learn/oscillation" }, { label: "Low-visibility pipeline", hash: "/m/lowVisPipeline" }, { label: "Stock management", hash: "/m/stockmgmt" }],
  },
  {
    term: "Table function",
    def: "A relationship defined by a list of points rather than a formula, used to represent nonlinear effects. Good table functions are normalised, pass through a reference point and behave sensibly at both ends.",
    see: [{ label: "Formulating decision rules", hash: "/learn/formulation" }, { label: "Effect function", hash: "/m/effectFunction" }],
  },
  {
    term: "Theil statistics",
    def: "A breakdown of the mean squared error between model and data into three parts: bias, unequal variation and unequal covariation. They show whether the error is systematic, which needs fixing, or mostly noise, which may not.",
    see: [{ label: "Fit statistics", hash: "/methods/fit" }, { label: "Testing and building confidence", hash: "/learn/testing" }],
  },
  {
    term: "Time constant",
    def: "The characteristic time of a first-order process, equal to the stock divided by the rate at which it adjusts. After one time constant a goal-seeking stock has closed about 63% of its gap.",
    see: [{ label: "First-order feedback", hash: "/learn/first-order" }, { label: "Exponential decay", hash: "/m/decay" }],
  },
  {
    term: "Time step",
    def: "The length of time, written dt, between successive calculations in a simulation. It should be well below the shortest time constant in the model, usually a quarter to a tenth of it.",
    see: [{ label: "Simulation mechanics", hash: "/learn/mechanics" }],
  },
  {
    term: "Tipping point",
    def: "A threshold beyond which a reinforcing loop becomes dominant and the system moves to a different state on its own. Below it, the same push dies away.",
    see: [{ label: "S-shaped growth", hash: "/learn/s-shaped" }, { label: "Alternative-fuel vehicles", hash: "/apps/environment/alt-fuel-vehicles" }, { label: "An outbreak", hash: "/apps/health/epidemic" }],
  },
  {
    term: "Tragedy of the commons",
    def: "An archetype in which many users each gain by taking more from a shared resource while the cost of depletion is spread over everyone. Without a way to limit total use, the resource is overused and can collapse.",
    see: [{ label: "System archetypes", hash: "/learn/archetypes" }, { label: "Tragedy of the commons", hash: "/m/tragedyCommons" }, { label: "Groundwater", hash: "/apps/environment/groundwater" }],
  },
  {
    term: "Unintended consequences",
    def: "Effects of an action that its authors did not foresee, usually because they ignored feedback, delays or effects outside the problem as they framed it. Most so-called side effects are just effects we left out of our mental model.",
    see: [{ label: "Why complex systems surprise us", hash: "/learn/surprise" }, { label: "Policy resistance", hash: "/apps/social/policy-resistance" }],
  },
  {
    term: "Validation",
    def: "The process of building justified confidence that a model is fit for its purpose. No model can be proven true, so validation means passing many tests of structure and behaviour, not just matching historical data.",
    see: [{ label: "Validation", hash: "/methods/validation" }, { label: "Testing and building confidence", hash: "/learn/testing" }],
  },
  {
    term: "Worse before better",
    def: "A pattern in which a policy that helps in the long run first makes performance drop, because it diverts resources or takes time to work. The short-term dip often leads people to abandon good policies.",
    see: [{ label: "Capability traps", hash: "/apps/business/capability-trap" }, { label: "System archetypes", hash: "/learn/archetypes" }],
  },
];
