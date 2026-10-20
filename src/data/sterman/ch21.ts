import type { StudyChapter } from "@/data/sterman/types";

export const CHAPTER: StudyChapter = {
  id: "ch21",
  number: "21",
  title: "Truth and beauty: validation and model testing",
  part: "Part VI Model testing",
  pages: "845-891",
  summary:
    "No model can be validated or verified, because every model is a simplification and therefore wrong in some respect. The useful questions are whether a model is fit for a stated purpose and whether its flaws matter to that purpose. Sterman sets out the questions model users should ask, the practical and political conditions of trustworthy modelling (all kinds of data, full documentation, replicability, and a reflective rather than protective stance), and twelve tests that together build confidence: boundary adequacy, structure assessment, dimensional consistency, parameter assessment, extreme conditions, integration error, behaviour reproduction, behaviour anomaly, family member, surprise behaviour, sensitivity analysis and system improvement. Each test is meant to uncover errors, not to prove the model right, and testing runs through the whole project rather than coming at the end.",
  bigIdeas: [
    {
      title: "Validation and verification are impossible",
      text: "To verify or validate is to establish truth, and the only statements that can be shown true are analytic ones, deduced inside a closed logical system, which say nothing about the world. Every model of a real system, mental or formal, is a simplification that differs from reality in countless ways, so no model can be true in that sense. This is not special to computer models: verbal and mathematical theories rest on the same imperfect data, aggregation and abstraction, and differ from simulations only in degree. The honest goal is therefore confidence that a model is useful for a purpose, built from many points of contact with reality.",
      pages: "846-847",
    },
    {
      title: "Falsification does not rescue validation",
      text: "Popper argued that although a theory can never be proved, it can be refuted by a single contrary observation. Since all models are wrong, every model can be refuted by some test, which leaves no basis for choosing among them. Worse, any test examines a theory jointly with auxiliary assumptions about instruments and conditions, so a favoured theory can always be saved by blaming an auxiliary (the Quine-Duhem thesis). Sometimes that is wise (Neptune was found because astronomers kept Newton's law and posited an unseen planet); more often it shields a theory from evidence, as Ptolemaic epicycles did. The decision to abandon a theory is a human choice, not one forced by data.",
      pages: "847-850",
    },
    {
      title: "Testing is social and judged against a purpose",
      text: "Because evidence never forces acceptance or rejection, model evaluation is a process of communication and persuasion among modellers, clients and other stakeholders, each judging by their own criteria. That does not make every test equally good, nor excuse ignoring evidence. A leader never chooses whether to use a model, only which one, and delaying action in search of a perfect model is itself a decision with consequences. Good modellers seek many tests across many data sources, treat building and testing as one iterative loop, and point clients to the model's limitations so it is improved and not misused.",
      pages: "850",
    },
    {
      title: "Questions model users should ask",
      text: "Sterman lists questions that users should put to any model, grouped in four areas. Purpose, suitability and boundary: what is the purpose, what is endogenous, exogenous or left out (and is anything omitted only for lack of numbers), is the time horizon and aggregation right? Physical and decision-making structure: are conservation laws respected and units consistent, are stocks and flows explicit, are delays and constraints included, do simulated decisions use information real decision makers have? Robustness: does the model behave plausibly under extreme inputs, and do recommendations survive plausible changes in parameters, aggregation and boundary? Pragmatics and politics: is it documented, can you run it yourself, what data were used, who reviewed it, are results reproducible or add-factored, what does a run cost, and what are the modellers' and clients' biases?",
      pages: "851-852",
    },
    {
      title: "Boundary first: narrow models breed policy resistance",
      text: "The boundary decides which variables are endogenous, which are exogenous and which are excluded. Making a concept exogenous, or omitting it, cuts every feedback that runs through it, so the model cannot show how the system will respond to a policy and the client discovers those responses later as side effects. Narrow boundaries are the single largest source of policy resistance. Practical matters also shape reliability: if a model is expensive or slow to run, adequate sensitivity analysis has almost certainly not been done, and modellers who cannot revise quickly tend to become defensive about flaws.",
      pages: "851-853",
    },
    {
      title: "Three kinds of data, and the cost of leaving soft variables out",
      text: "Forrester distinguishes numerical data (time series and cross sections), written data (procedures, organisation charts, reports, emails) and mental data (what people know, believe and do, reached only through interviews and observation). The numerical record holds a tiny fraction of what is known, and many decision-critical variables, such as perceived quality, trust or morale, have no numerical series. Leaving such variables out because they lack data assumes their effect is zero; in Forrester's words, \"To omit such variables is equivalent to saying they have zero effect\" (p. 854), which is almost certainly wrong. The opposite error, dismissing statistics and numerical data because insight is what matters, is just as serious: where data exist, use proper estimation, and use sensitivity analysis to decide where extra data gathering is worth the cost.",
      pages: "853-855",
    },
    {
      title: "Documentation and replication are the scientific core",
      text: "Without documentation others cannot understand, replicate, criticise or extend a model, and its author soon cannot either. Document while building: state assumptions, boundary, parameter sources and rationale; organise by subsystem with a diagram and the equations in a logical order; use descriptive variable names and give units for everything; and prepare a successor to run the model. Replication is rare in the social sciences: one review of more than 2,700 economics and finance papers found a single pure replication, and a journal project found errors or failures to replicate in many of the data sets it obtained (69 instances across 54 data sets), while a third of authors never supplied data. Do not accept a result from a model you cannot replicate.",
      pages: "855-858",
    },
    {
      title: "Add-factoring hides the model behind the modeller",
      text: "An add factor is an adjustment to model output so that it agrees with the modeller's intuition. It lets the modeller sell a mental model, with all its hidden assumptions, under the authority of a formal one. When the US General Accounting Office re-ran three leading econometric forecasting models for Congress, one firm had reported interest rates of 7% a year after a decade of constant money supply, but its model actually produced 34% a year; the firm had simply adjusted the output down. Full documentation and independent replication are the defence.",
      pages: "857",
    },
    {
      title: "Protective versus reflective modelling",
      text: "Protective modelling uses a model to prove a point: assumptions stay hidden, data are chosen selectively, preselected answers are supported and the modeller acts as an oracle. It seals everyone off from learning and in the end destroys the model's credibility and any chance of implementation. Reflective modelling uses the model to promote inquiry: it exposes assumptions, seeks the widest range of tests, challenges preconceptions, welcomes several viewpoints and involves the widest community. Paradoxically, testing designed to find errors is what builds lasting confidence.",
      pages: "858",
    },
    {
      title: "Test 1. Boundary adequacy",
      text: "Ask whether the concepts that matter for the problem are endogenous, and whether behaviour or policy conclusions change when the boundary is widened. How to run it: draw (or reconstruct from the equations) a model boundary chart listing endogenous, exogenous and excluded variables; remember every constant is exogenous and may really vary over the horizon; use interviews, literature and archives to find omitted feedbacks; write a dynamic hypothesis for how each might matter; then add it and repeat the base run, sensitivity and policy tests. Keep the new structure if it changes conclusions; otherwise you may drop it for simplicity or keep it to build confidence. Example: of 19 models of NAFTA reviewed by the Congressional Budget Office, 14 ignored investment flows and 4 of the remaining 5 assumed no effect on US investment; the one that made investment endogenous found a large shift of capital and jobs to Mexico.",
      pages: "861-863",
    },
    {
      title: "Test 2. Structure assessment",
      text: "Ask whether the structure agrees with what is known about the real system: the level of aggregation, conformance to physical laws such as conservation, and the realism of decision rules. How to run it: inspect stock and flow maps, policy structure diagrams and equations; look for free lunches (activity that needs resources the model does not require), inconsistencies and missing costs; check that every real stock that cannot go negative has a first-order negative loop forcing its outflows to zero as it empties; run partial model tests of each decision rule's intended rationality; use laboratory experiments to see how people really decide; and build a disaggregated submodel to check an aggregate formulation. Examples: a river model used in a water-rights lawsuit needed water to flow upstream to balance its mass; a linear programming model of the leather market beat real traders because, in downturns, it turned leather back into cows.",
      pages: "863-866",
    },
    {
      title: "Test 3. Dimensional consistency",
      text: "Every equation must balance in units without scaling factors that have no real-world meaning. How to run it: specify units for every variable and parameter as you build, not afterwards; run the software's unit checker; then inspect the equations yourself, because a clean unit check can still hide fudge factors. Be suspicious of parameters with meaningless names, strange units such as widgets² per dollar per month³, or dimensioned parameters whose value happens to be exactly 1. A units error is sometimes a typing slip, an inverted ratio or a missing time constant, but often reveals a misunderstanding of the structure or the decision process. This should be among the very first tests.",
      pages: "866",
    },
    {
      title: "Test 4. Parameter assessment",
      text: "Ask whether every parameter has a real-world meaning and a value consistent with numerical and descriptive knowledge. How to run it: combine formal estimation (knowing why ordinary least squares fails with collinearity, autocorrelation from feedback and changing variance, and when maximum likelihood, generalised least squares or Kalman filtering suit better) with judgemental estimation from interviews, workshops, archives and experience; use partial model estimation, driving one decision rule with historical inputs and fitting its output; and build detailed submodels to derive aggregate relationships. Statistical significance shows correlation, not causation, and an insignificant estimate may reflect too few data rather than no effect. Examples: Oliva's estimates for a bank found quality norms for time per customer fell quickly under pressure but never recovered; Homer's queueing submodel of field service technicians confirmed an aggregate formulation and gave the shape of its cross-training effect.",
      pages: "866-869",
    },
    {
      title: "Test 5. Extreme conditions",
      text: "A model must behave realistically however extreme its inputs or policies: inventory cannot go negative whatever the demand, demand must fall to zero at a high enough price, and nothing is produced without materials, labour and equipment. How to run it: inspect each rate equation and ask whether its output is feasible when each input, and all inputs together, take their maximum and minimum values; then simulate extreme shocks and policies with switches, steps and pulses (remove all workers, raise price a billionfold) and trace any implausible result to its formulation. Example: asked what would happen to US output if every energy source disappeared overnight, a well-regarded macroeconomic model reported that output rose, because oil imports fell and so net exports increased. A good historical fit does not excuse failing this test, since policy aims to move the system outside past experience.",
      pages: "869-871",
    },
    {
      title: "Test 6. Integration error",
      text: "Results must not depend on the time step or the integration method, because the step is an artefact of the numerical solution, not a feature of reality. How to run it: halve the time step and rerun, repeating until results stop changing in ways that matter; then switch integration method (Euler to Runge-Kutta) and compare. Run this before any other simulation test, since failure makes every other result meaningless. Example: a model of the Tsembaga people's cycle of pig festivals and warfare used a one-year step. With a smaller step the intense war followed by a long truce became a continuous small skirmish: the step had been acting as a behavioural parameter controlling war length. Kampmann made duration and lethality explicit parameters, and the festival cycle reappeared in the corrected model.",
      pages: "872-874",
    },
    {
      title: "Test 7. Behaviour reproduction",
      text: "Ask whether the model reproduces the behaviour of interest, qualitatively and quantitatively, and generates the symptoms that motivated the study. How to run it: plot model and data together; compute point-by-point statistics (MAE, MAPE, MAE over the mean, RMSE, and R² if the audience expects it); decompose the mean square error with Theil's statistics into bias, unequal variation and unequal covariation; where noise drives the system, compare modes, amplitudes, periods and phase relationships using autocorrelation, cross-correlation or spectral methods. The proper use is to find discrepancies and decide with the client which matter for the purpose, without adding fudge factors or exogenous variables whose only role is to improve the fit. Example: regressions of the deterrent effect of capital punishment gave anything from 29 murders prevented to more than 12 extra murders per execution, depending on which control variables were included.",
      pages: "874-880",
    },
    {
      title: "A perfect model can fit the data badly",
      text: "Systems such as supply chains amplify certain frequencies in the random shocks that perturb them, and no model can reproduce every shock. Sterman ran the same inventory and workforce model twice with productivity noise (standard deviation 5%, correlation time 4 weeks), identical in every respect until week 200, when the random sequences diverged. Within a few weeks the two runs bore no point-by-point resemblance, although one is a perfect replica of the other. In noise-driven or path-dependent systems, the right test is whether the model produces the same modes, frequencies, amplitudes and phase relationships as the data, not whether it matches each point. The more a model is forced by exogenous historical inputs, the closer its point-by-point fit should be.",
      pages: "877-879",
    },
    {
      title: "A good fit does not confirm a model",
      text: "Arguing that a model must be right because it fits history commits the fallacy of affirming the consequent. For any data set there are infinitely many models that fit as closely as you like, and they diverge outside the range of the data, which is exactly where policy analysis operates. Instead of showing clients how well the model fits, show them every place it does not, and treat each discrepancy as a lead to a wrong parameter or assumption.",
      pages: "879",
    },
    {
      title: "Test 8. Behaviour anomaly",
      text: "Where data cannot establish whether a relationship matters, delete or alter it and see whether the behaviour becomes anomalous; if it does, that is evidence the relationship belongs. How to run it (loop knockout): in a rule such as corrective action = (desired state − state) / adjustment time, set the adjustment time very large; set information delay times to infinity; set a nonlinear effect y = f(x) to 1 for all x; or replace a disequilibrium structure with an equilibrium assumption by removing perception and material delays. Knockouts are most revealing combined with extreme conditions, because some loops are dormant normally and dominant only in unusual circumstances. Example: Senge showed that assuming firms invest only on forecast orders, with inventories and backlogs always in equilibrium, produced implausible investment behaviour under both historical and extreme conditions.",
      pages: "880-881",
    },
    {
      title: "Test 9. Family member",
      text: "A good model should reproduce other instances of the same class of system when given their parameters: a corporate growth model should explain firms that grow steadily, that grow in fits and starts, that stagnate and that fail; a commodity model should produce the distinct cycles of pulp, copper, cocoa and, with livestock structure, hogs and cattle. How to run it: calibrate the model to the widest range of related systems and compare their characteristic behaviours. Be wary of a model that can show only one mode, such as a diffusion model that can only produce S-shaped growth when real innovations also fail or cycle in and out of fashion. Example: Homer's model of medical technology diffusion reproduced a success (the cardiac pacemaker), failures, and an antibiotic whose sales rose and fell as side effects and new uses were found.",
      pages: "881-882",
    },
    {
      title: "Test 10. Surprise behaviour",
      text: "When a model behaves unexpectedly, either the formal model or the mental model is wrong. The test is passed when the model shows a behaviour no one had recognised and it then turns out to be present in the real system. How to run it: examine every variable, not only the headline ones; track every anomaly to its source; keep a dated laboratory notebook; and record the client team's mental models before modelling begins, so hindsight cannot later make the lessons look obvious. Example: Forrester's model of an automotive components maker showed market share falling faster in recessions than booms, the reverse of what managers believed. The firm cut production so hard in downturns that its product was scarcer then; the data confirmed it, and production policy changed.",
      pages: "882-883",
    },
    {
      title: "Test 11. Sensitivity analysis",
      text: "Ask whether conclusions change in ways that matter when assumptions vary over their plausible range. Numerical sensitivity (the numbers change) is universal; behaviour mode sensitivity (the pattern changes, say from smooth adjustment to oscillation) and policy sensitivity (a policy's impact or desirability reverses) are what usually matter. Vary not only parameters but the boundary, the aggregation and the decision rules, to which results are often more sensitive. Test over a range at least twice as wide as judgement or regression confidence bounds suggest, because people are overconfident and standard errors ignore measurement and specification error. Tools include univariate and multivariate tests, best and worst case scenarios, Monte Carlo runs giving dynamic confidence bands, and automated searches for parameters that break the model or reverse a policy. Example: in a diffusion model, Monte Carlo bands were widest during growth, where word of mouth compounds small parameter differences, and narrowed once the market saturated.",
      pages: "883-887",
    },
    {
      title: "Test 12. System improvement",
      text: "The final test is whether modelling helped change the system for the better: policies identified, implemented, and performance actually improved. This is hard to judge, because adoption is partial and slow, many other things change at once, and a worse outcome might have been worse still without the policy. How to run it: plan evaluation prospectively from the start, with agreed success measures and a budget; measure changes in mental models, behaviour, formal policies and performance with interview protocols and surveys; and use experimental designs where possible (treatment and control groups, natural experiments, neutral academic partners). Example: an evaluation of a celebrated intervention in an insurer's claims unit confirmed changes in managers' mental models and policies but could not show better business performance, because the original project had not collected the data needed to rule out rival explanations.",
      pages: "887-889",
    },
    {
      title: "Test early, test often, and test with clients",
      text: "Models rarely fail because of the wrong regression technique or a slightly poor fit. They fail because basic questions about purpose are not asked, physical laws are violated, a narrow boundary cuts critical feedbacks, assumptions are hidden, or stakeholders are excluded. Testing is iterative and multidimensional and starts on day one: units and extreme conditions as each equation is written, integration error before the first serious run, sensitivity throughout. Open the process to as many people as possible, because implementation depends on changing the clients' mental models, and that happens when clients help find the model's limitations themselves.",
      pages: "890-891",
    },
  ],
  diagrams: [
    {
      kind: "sequence",
      title: "Tests of structure: mostly by inspection",
      steps: [
        { label: "1 Boundary adequacy", detail: "Are key concepts endogenous? Boundary chart, interviews, add an omitted loop and rerun policy tests." },
        { label: "2 Structure assessment", detail: "Conservation, first-order control of outflows, no free lunches, realistic decision rules, aggregation checked with a submodel." },
        { label: "3 Dimensional consistency", detail: "Units on every term, no meaningless scaling constants. Do it while writing equations." },
        { label: "4 Parameter assessment", detail: "Real-world meaning for every constant; statistical, judgemental and partial-model estimates." },
        { label: "5 Extreme conditions", detail: "Each rate at zero and huge inputs; whole-model shocks such as no workers or no energy." },
        { label: "6 Integration error", detail: "Halve the time step, change the method. The first simulation test of all." },
      ],
      note: "The first six tests ask whether the model is built right for its purpose. Most can be run by reading equations and diagrams, before any comparison with data.",
      pages: "859-874",
    },
    {
      kind: "sequence",
      title: "Tests of behaviour and consequences",
      steps: [
        { label: "7 Behaviour reproduction", detail: "Plot against data; RMSE, MAPE, Theil shares; modes, periods and phases where noise drives the system." },
        { label: "8 Behaviour anomaly", detail: "Knock out a loop or an effect; anomalous results show the structure matters." },
        { label: "9 Family member", detail: "Recalibrate to other members of the class; one structure, many behaviours." },
        { label: "10 Surprise behaviour", detail: "Chase every unexpected result; record mental models beforehand." },
        { label: "11 Sensitivity analysis", detail: "Numerical, behaviour mode and policy sensitivity to parameters, boundary and aggregation." },
        { label: "12 System improvement", detail: "Did the system get better? Plan the evaluation at the start." },
      ],
      loopBack: { from: 5, to: 0, label: "every flaw found sends you back to revise structure" },
      note: "The last six tests ask whether the model behaves right for the right reasons and whether its conclusions survive what you do not know. A failure at any point leads back into the model, not to a fudge factor.",
      pages: "874-889",
    },
    {
      kind: "cycle",
      title: "The reflective testing loop",
      nodes: [
        "Record purpose and clients' mental models",
        "Build or revise the model",
        "Run a wide battery of tests",
        "Find discrepancies and hidden flaws",
        "Show clients the model's limitations",
        "Revise formal and mental models together",
      ],
      center: "Confidence, not proof",
      note: "Building and testing form one loop. Each pass is designed to uncover errors, and each limitation the clients help find improves both the formal model and their understanding.",
      pages: "850, 890-891",
    },
    {
      kind: "cld",
      title: "Why reflective testing builds confidence",
      cld: {
        size: [680, 300],
        vars: [
          { id: "open", label: "Openness of assumptions", x: 380, y: 45 },
          { id: "flaws", label: "Flaws found early", x: 575, y: 150 },
          { id: "qual", label: "Model quality", x: 380, y: 255 },
          { id: "trust", label: "Client confidence", x: 220, y: 150 },
          { id: "def", label: "Defensiveness", x: 80, y: 45 },
          { id: "cost", label: "Time to revise model", x: 100, y: 255 },
        ],
        links: [
          { from: "open", to: "flaws", sign: "+", curve: 20 },
          { from: "flaws", to: "qual", sign: "+", curve: 20 },
          { from: "qual", to: "trust", sign: "+", curve: 20 },
          { from: "trust", to: "open", sign: "+", curve: 20 },
          { from: "def", to: "open", sign: "−", curve: 0 },
          { from: "def", to: "trust", sign: "−", curve: 0 },
          { from: "cost", to: "def", sign: "+", curve: 0 },
        ],
        loops: [{ type: "R", label: "R1", x: 390, y: 150 }],
        caption:
          "<span class=\"chip chipR\">R</span> <b>Reflective modelling</b>: exposing assumptions brings flaws to light early, fixing them raises quality, and clients who see this trust the process and open up further. A model that is slow or costly to revise breeds <b>defensiveness</b>, which weakens the loop at two points and can run it in reverse.",
      },
      note: "Our sketch of Sterman's argument about protective and reflective uses of models, and of his warning that slow, costly models make modellers resist change.",
      pages: "852-853, 858",
    },
    {
      kind: "cld",
      title: "Negative stocks: the missing first-order loop",
      cld: {
        size: [580, 300],
        vars: [
          { id: "inv", label: "Inventory", x: 110, y: 165 },
          { id: "max", label: "Maximum shipment rate", x: 125, y: 40 },
          { id: "ship", label: "Shipment rate", x: 360, y: 60 },
          { id: "cust", label: "Customers", x: 490, y: 165 },
          { id: "def", label: "Customer defection", x: 310, y: 265 },
        ],
        links: [
          { from: "inv", to: "max", sign: "+", curve: 0 },
          { from: "max", to: "ship", sign: "+", curve: 0 },
          { from: "cust", to: "ship", sign: "+", curve: 20 },
          { from: "ship", to: "inv", sign: "−", curve: 0 },
          { from: "inv", to: "def", sign: "−", curve: 20 },
          { from: "def", to: "cust", sign: "−", curve: 20 },
        ],
        loops: [
          { type: "B", label: "B1", x: 170, y: 95 },
          { type: "B", label: "B2", x: 330, y: 170 },
        ],
        caption:
          "In the flawed model, shipments depend only on <b>Customers</b>, so the only brake is <span class=\"chip chipB\">B</span>2: low inventory drives customers away, which slowly cuts shipments. Because Customers is a stock, inventory can fall below zero first. The fix adds <span class=\"chip chipB\">B</span>1, a first-order loop with no delay: shipments can never exceed what inventory allows, so they reach zero when inventory does.",
      },
      note: "Structure assessment and extreme conditions test, in our own layout: if a fire destroyed all inventory overnight, the flawed model would keep shipping the next morning.",
      pages: "863-865",
    },
    {
      kind: "cld",
      title: "What a fixed-capital boundary leaves out",
      cld: {
        size: [580, 300],
        vars: [
          { id: "gap", label: "US-Mexico wage gap", x: 300, y: 45 },
          { id: "invm", label: "Capital moved to Mexico", x: 300, y: 260 },
          { id: "mexw", label: "Mexican wages", x: 480, y: 150 },
          { id: "usj", label: "US factory jobs", x: 90, y: 195 },
          { id: "usw", label: "US wages", x: 90, y: 95 },
        ],
        links: [
          { from: "gap", to: "invm", sign: "+", curve: 0 },
          { from: "invm", to: "mexw", sign: "+", curve: 25 },
          { from: "mexw", to: "gap", sign: "−", curve: 25 },
          { from: "invm", to: "usj", sign: "−", curve: 20 },
          { from: "usj", to: "usw", sign: "+", curve: -10 },
          { from: "usw", to: "gap", sign: "+", curve: -25 },
        ],
        loops: [
          { type: "B", label: "B1", x: 385, y: 150 },
          { type: "B", label: "B2", x: 195, y: 150 },
        ],
        caption:
          "When capital can move, a wage gap draws investment south. The gap can close by Mexican wages rising (<span class=\"chip chipB\">B</span>1, catch-up) or by US jobs and wages falling (<span class=\"chip chipB\">B</span>2, the race to the bottom feared by critics). Assuming <b>capital is immobile</b>, as most NAFTA models did, deletes both loops at once.",
      },
      note: "A boundary adequacy sketch of the NAFTA debate. It does not say which loop dominated, only that the models could not tell, because the loops were outside their boundary.",
      pages: "862-863",
    },
  ],
  formulations: [
    {
      name: "First-order control of an outflow",
      equations: [
        "Flawed: Shipment Rate = Customers × Average Sales per Customer",
        "Fixed:  Shipment Rate = MIN(Desired Shipment Rate, Inventory / Minimum Time to Ship)",
        "Inventory(t) = Inventory(0) + ∫(Production Rate − Shipment Rate) dt",
      ],
      explain:
        "Any stock that cannot be negative needs every outflow to approach zero as the stock approaches zero, and the loop that does it must be first order: a delay anywhere in it lets the flow continue after the stock is empty. Check by inspection that each outflow depends directly on its own stock. In the flawed formulation (from a published model of a firm) the outflow depends on a different stock, Customers, so inventory can be driven below zero. The protected-flow molecule implements the fixed form.",
      molecule: "protFlow",
      pages: "863-865",
    },
    {
      name: "Loop knockout",
      equations: [
        "Corrective Action = (Desired State − State) / Adjustment Time",
        "Knockout: Adjustment Time → very large (so Corrective Action → 0)",
        "Other knockouts: Information Delay Time → very large;  Effect f(x) → 1 for all x",
      ],
      explain:
        "To see whether a loop matters, switch it off and look for anomalous behaviour, ideally under extreme conditions too. A goal-seeking correction is cut by making its adjustment time huge; a perception loop by freezing the perceived value; a nonlinear effect by flattening it to 1. In the stock-management molecule, setting the supply-line weight to 0 knocks out the loop that counts orders already on the way.",
      molecule: "stockmgmt",
      pages: "880-881",
    },
    {
      name: "Integration error check",
      equations: [
        "Euler: Stock(t + dt) = Stock(t) + dt × Net Flow(t)",
        "Test: run with dt, dt/2, dt/4 … until results stop changing in ways that matter",
        "Rule of thumb: dt well below the shortest time constant in the model",
      ],
      explain:
        "Continuous-time models are solved by stepping forward in time. If dt is too long relative to a time constant, Euler integration overshoots, and with a step twice the time constant a goal-seeking stock oscillates for ever. Results that change when dt is halved are artefacts. Change the integration method as well, and make sure no decision rule secretly depends on dt (appendix A covers methods).",
      molecule: "closegap",
      pages: "872-874",
    },
    {
      name: "Point-by-point fit statistics",
      equations: [
        "MAE = (1/n) Σ |Xm − Xd|",
        "MAPE = (1/n) Σ |Xm − Xd| / |Xd|        (avoid when data near zero)",
        "MAE/Mean = MAE / mean(Xd)",
        "MSE = (1/n) Σ (Xm − Xd)²,  RMSE = √MSE",
        "R² = r²,  r = correlation of Xm and Xd",
      ],
      explain:
        "Xm is the model and Xd the data. MAE and RMSE are in the variable's own units; RMSE weights large errors more, though there is rarely a strong reason to prefer it. MAPE and MAE/Mean are dimensionless and easy to read, with MAE/Mean robust when data approach zero. R² is widely expected but weak: two series growing together at a faster rate give a higher R² for exactly the same absolute error. Always plot model and data together as well.",
      pages: "874-875",
    },
    {
      name: "Theil's inequality statistics",
      equations: [
        "MSE = (mean(Xm) − mean(Xd))² + (Sm − Sd)² + 2(1 − r)·Sm·Sd",
        "UM = bias term / MSE;  US = unequal variation term / MSE;  UC = unequal covariation term / MSE",
        "UM + US + UC = 1",
      ],
      explain:
        "Splitting the mean square error shows where it comes from. A large UM (bias) is systematic and usually a parameter error. A large US (unequal variation) means different trends or amplitudes, also systematic. A large UC means the model matches mean and trend and differs point by point, typically noise or a small phase shift, which a model should not be blamed for. Whether a component counts as systematic depends on the purpose: an unmodelled business cycle is a serious error in a cycle model and harmless noise in a long-run growth model.",
      pages: "875-877",
    },
    {
      name: "Monte Carlo sensitivity",
      equations: [
        "For run k = 1 … N:  draw each uncertain parameter pᵢ ~ its distribution (e.g. normal, sd 25% of base)",
        "Simulate; store trajectory X_k(t)",
        "Dynamic confidence band at each t: percentiles of {X_k(t)} (e.g. 50%, 75%, 95%)",
        "Test range ≥ 2 × the range judgement or regression suggests",
      ],
      explain:
        "Multivariate Monte Carlo runs show how uncertainty in several parameters at once spreads into behaviour over time. The bands are envelopes, not trajectories: no single run follows the upper bound. Independent sampling is convenient but unrealistic when the model has been calibrated, because combinations that ruin the historical fit are less likely than independence implies. Latin hypercube sampling cuts the number of runs in large models.",
      molecule: "diffusion",
      pages: "884-887",
    },
  ],
  cases: [
    {
      title: "Energy shortages that raised national output",
      text: "In 1979 Sterman evaluated a respected macroeconomic forecasting model offered to the US Department of Energy for studying oil embargoes. His first test removed every energy source at once; real output should have collapsed as soon as inventories ran out. In the model GNP rose. Output was driven by aggregate demand alone and needed no energy, so the only effect of the embargo was that oil imports fell and net exports therefore rose. The developers objected that such conditions could never occur and that the model fitted history well, but a model in which production needs no energy cannot answer questions about physical shortages, however good its fit.",
      pages: "870-871",
    },
    {
      title: "The Tsembaga model and the time step",
      text: "Shantzis and Behrens modelled the Tsembaga of Papua New Guinea, whose pig festivals every 12 to 15 years were followed by wars that killed about 10% of the population. The model reproduced the cycle and supported the anthropologist Rappaport's view that it kept people and pigs within the land's carrying capacity, and suggested that banning war and improving health care could push population past that capacity. Kampmann found the fully documented model failed the integration error test: with a shorter step than one year, war became a constant low-level skirmish. After he made war duration and lethality explicit parameters and fixed other errors, the cycle returned and the original conclusions were strengthened.",
      pages: "872-874",
    },
    {
      title: "Economic recovery from nuclear war",
      text: "A Cold War input-output model claimed the US economy would regain 80% of its pre-attack output within 9 years of a 500-megaton attack, and that after a 250-megaton attack on the petroleum sector output would fall to 22% but recover to 61% within a year and 94% within 5 years. Boundary and structure tests by Sastry, Romm and Tsipis showed why: the economy was assumed always in equilibrium, stocks of materials and energy were absent, and capital was rebuilt to its optimum in 2 years regardless of fuel, materials, skilled labour or civil order. A system dynamics model without these free lunches showed that small attacks on refineries could cascade through fuel shortages into economic collapse and famine.",
      pages: "865-866",
    },
    {
      title: "NAFTA models and the investment boundary",
      text: "During the early-1990s debate over NAFTA, most of the many econometric models used predicted gains for all three countries. The Congressional Budget Office reviewed 19 of them: 14 ignored investment flows altogether, and 4 of the other 5 assumed no effect on US investment. The single model that treated investment endogenously estimated a transfer of about $2.5 billion a year from the US to Mexico and roughly 375,000 lost US jobs over 5 years. Sterman's point is not that NAFTA was wrong but that the results hinged on unstated boundary assumptions such as immobile capital, and that both sides picked models that suited them rather than testing them.",
      pages: "862-863",
    },
  ],
  exercises: [
    {
      prompt:
        "Questions users should ask. Open the bullwhip case and answer, in writing, the boundary questions from this chapter: what is the purpose, which variables are endogenous, which are exogenous, what is left out, and is anything left out only because it has no numerical data? Then name one excluded feedback that could change the policy conclusion.",
      hint: "Customer demand is usually exogenous in supply-chain models. Ask what would happen if long delivery delays drove customers away.",
      link: { label: "Open the bullwhip case", hash: "/apps/business/bullwhip" },
    },
    {
      prompt:
        "Test 1, boundary adequacy. Run Population Growth with the Growing preset (births 5%, deaths 2%) for 60 years and note the conclusion it gives about long-run population. Then open Constrained Growth with growth rate 3% and carrying capacity 200, where crowding is inside the boundary. Write one sentence on how moving crowding from outside to inside the boundary changes the answer to 'how large will the population be?'.",
      hint: "In the first model the only limit is outside the boundary, so it never acts. In the second the limit is endogenous.",
      link: { label: "Open Population Growth", hash: "/m/growth" },
    },
    {
      prompt:
        "Test 2, structure assessment. Open Backlog Protected by Level, choose Starve production (production 5 a month) and run it. Confirm from the equations that shipping is multiplied by MIN(1, Inventory / full-service inventory), the first-order loop that keeps inventory non-negative. Then look for a free lunch: what does production need in the real world that this molecule does not require?",
      hint: "Production here arrives at a fixed rate with no labour, materials or capacity behind it. That is acceptable for some purposes and not others.",
      link: { label: "Open Backlog Protected by Level", hash: "/m/backlogLevel" },
    },
    {
      prompt:
        "Test 3, dimensional consistency. Open Stock Management and write the units of every term in the order rate: demand, (desired inventory − inventory) / adjustment time, and (desired supply line − weight × supply line) / adjustment time. Check that each is in units per week, and say what unit the supply-line weight must have for the equation to balance.",
      hint: "Inventory is in units and the adjustment time in weeks, so the gap term is units per week. The weight must be dimensionless.",
      link: { label: "Open Stock Management", hash: "/m/stockmgmt" },
    },
    {
      prompt:
        "Test 4, parameter assessment. In the calibration lab, three parameters (demand, target inventory and delivery delay) are known from records, as judgemental or archival estimates would be, and two must be estimated. Fit the two by hand, then let the search run from your guess. Compare your values with the hidden truth at the end. Which parameter is pinned down more tightly by the data, judging by the error landscape?",
      hint: "A long, narrow valley in the error map means many combinations fit almost equally well: the model is close to underidentified in that direction.",
      link: { label: "Open the calibration lab", hash: "/methods/calibration" },
    },
    {
      prompt:
        "Test 5, extreme conditions. Open Reducing Backlog by Doing Work and set workers to 30 and productivity to 10 (300 tasks a month against 1,200 tasks). Run 60 months and watch the 'Overdrawn (below zero)' stock: work to do empties at month 4, after which the molecule would keep 'completing' work that does not exist, about 16,800 tasks by month 60. Repeat on Level Protected by PDY with 20 workers and normal productivity 10, and confirm the remaining work stops at zero.",
      hint: "The first molecule lacks first-order control of its outflow; the second lets productivity fall as the work runs out.",
      link: { label: "Open Reducing Backlog", hash: "/m/reducingBacklog" },
    },
    {
      prompt:
        "Test 6, integration error (pen and paper). Take Close Gap with goal 60, starting value 20 and adjustment time 1 week. Simulate by hand with Euler steps of dt = 2, 1 and 0.5 weeks for 6 weeks. With dt = 2 the value jumps 20, 100, 20, 100 for ever; with dt = 1 it lands on 60 in one step; with dt = 0.5 it rises 20, 40, 50, 55. Which run is closest to the true exponential approach? Then open the molecule with the Aggressive preset (adjustment time 1.5) to see the smooth path the app computes with its much shorter step.",
      hint: "The exact solution covers 63% of the gap in one adjustment time. A step should be a small fraction of the shortest time constant.",
      link: { label: "Open Close Gap", hash: "/m/closegap" },
    },
    {
      prompt:
        "Test 7, behaviour reproduction. Work through the fit page's worked example, then go to the calibration lab and fit the data by hand. Watch RMSE, MAPE and the Theil shares as you move the sliders. Stop when the error is near the size of the measurement noise (about 1.7) and most of what remains is in the timing share UC. Explain why you should not try to drive the error lower still.",
      hint: "Once UC dominates, the leftover error is the noise in the dots; chasing it would mean fitting the noise.",
      link: { label: "Open Measuring fit to data", hash: "/methods/fit" },
    },
    {
      prompt:
        "Test 8, behaviour anomaly. Open Stock Management with the Stable preset (supply-line weight 1) and run it: inventory rises smoothly to 100. Knock out the supply-line loop by setting the weight to 0: inventory peaks near 185 around week 17 and oscillates. Then restore the weight to 0 but also weaken the inventory loop by setting the adjustment time to 12 weeks. What do the two knockouts tell you about which loops matter for stability?",
      hint: "With adjustment time 12 the peak falls to about 164 but arrives much later, around week 37.",
      link: { label: "Open Stock Management", hash: "/m/stockmgmt" },
    },
    {
      prompt:
        "Test 9, family member. Using the Oscillation preset of Stock Management (weight 0), note the time between inventory peaks (about 33 weeks). Now set the acquisition delay to 12 weeks, as a slower industry might have: the peak rises to about 290 and peaks come roughly every 47 weeks. Then open the hog cycle case and identify which parameter there plays the role of the acquisition delay.",
      hint: "One structure, re-parameterised, produces a family of cycles. In livestock the delay is gestation and growing time.",
      link: { label: "Open the hog cycle case", hash: "/apps/economics/hog-cycle" },
    },
    {
      prompt:
        "Test 10, surprise behaviour. Before running anything, write down where you expect inventory to settle in Stock Management if managers ignore the supply line (weight 0) with target inventory 100, demand 10 and acquisition delay 6. Then run the Oscillation preset for 100 weeks. It settles at 160, not 100. Use the order equation to explain why, and say whether you would trust this as a real-world finding or treat it as a formulation flaw.",
      hint: "In equilibrium orders equal demand, so the two correction terms must cancel. With weight 0, the desired supply line of 60 units is never offset by the actual supply line.",
      link: { label: "Open Stock Management", hash: "/m/stockmgmt" },
    },
    {
      prompt:
        "Test 11, sensitivity analysis. In the sensitivity lab, set the uncertainty to ±25% and then ±50%, and note how the diffusion bands widen during growth and narrow as the market saturates. Then read the behaviour mode experiment (the share of runs that overshoot) and the policy experiment. Classify each result as numerical, behaviour mode or policy sensitivity, and say which policy you would recommend and why.",
      hint: "Counting the supply line helps whatever the delays turn out to be; reacting faster depends on an assumption we are unsure of.",
      link: { label: "Open the sensitivity lab", hash: "/methods/sensitivity" },
    },
    {
      prompt:
        "Best and worst cases. On New-Product Diffusion, run a cautious case (innovation 0.8%, imitation 13%) and a hot case (innovation 2%, imitation 27%). Adoption peaks at about 37 a week near week 20 in the first and about 78 a week near week 9 in the second. If you were sizing production capacity, how would these bounds change your plan, and what would a Monte Carlo run add?",
      hint: "Best and worst cases bound the outcome but are not likely outcomes themselves; Monte Carlo bands show how likely each region is.",
      link: { label: "Open New-Product Diffusion", hash: "/m/diffusion" },
    },
    {
      prompt:
        "Test 12, system improvement (planning). Choose the delayed discharge case and write a one-page evaluation plan for a model-based intervention in a hospital: the success measures agreed at the start, the data on mental models, behaviour, policies and performance you would collect before and after, and a comparison group (another ward or hospital) to rule out rival explanations.",
      hint: "Plan it prospectively. After the event, the data you need will not have been collected and memories will be coloured by hindsight.",
      link: { label: "Open the delayed discharge case", hash: "/apps/health/delayed-discharge" },
    },
    {
      prompt:
        "A whole testing plan. Read the validation page, then pick any molecule you know well and write a short test log in the reflective style: for each of the twelve tests, one line saying whether it applies, what you did, what you found and what you changed. Finish with a list of the model's limitations for its purpose, written for a client.",
      link: { label: "Open Validating a model", hash: "/methods/validation" },
    },
  ],
  pitfalls: [
    "Claiming a model is 'validated' or 'verified'. No model can be; say which tests it has passed, for what purpose.",
    "Treating a good historical fit as proof. Many models fit the same data and differ outside it, and a perfect model of a noise-driven system can fit poorly point by point.",
    "Adding fudge factors, add factors or exogenous series whose only job is to improve the fit. They hide the flaws the discrepancies were pointing to.",
    "Leaving out soft variables because there are no numbers. That assumes an effect of zero, which is almost certainly wrong; estimate them judgementally and test sensitivity.",
    "Dismissing extreme condition tests on the grounds that such conditions will never occur. Policies are meant to move the system outside past experience, where missing physical constraints bite.",
    "Running sensitivity only on parameters, and only over the range you feel confident about. Vary the boundary, aggregation and decision rules too, over at least twice the plausible range.",
    "Leaving testing until the model is finished, or documenting at the end. Errors found late are expensive, and undocumented reasoning is soon forgotten.",
    "Using a model protectively: hiding assumptions, choosing data selectively and defending against critics. It destroys the credibility it seeks to protect.",
  ],
  molecules: ["stockmgmt", "reducingBacklog", "protByPDY", "protFlow", "backlogLevel", "closegap", "diffusion", "logistic"],
};
