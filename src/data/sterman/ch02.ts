import type { StudyChapter } from "@/data/sterman/types";

const M = "−";

export const CHAPTER: StudyChapter = {
  id: "ch02",
  number: "2",
  title: "System dynamics in action",
  part: "Part I: Perspective and process",
  pages: "41-81",
  summary:
    "Three field cases show the method solving high-stakes problems in very different ways. At General Motors a small model, built overnight and refined in 20 days into a management flight simulator, showed that short-term leasing was creating the glut of nearly new cars that fed the used-car superstores, and led GM to move to longer leases before the 1997 collapse in used prices. At Ingalls Shipbuilding a large project model quantified how Navy design changes rippled through overtime, hiring and rework, and became the basis of a $447 million settlement. At Du Pont a maintenance model explained why the company spent more and got less, and was turned into a role-play game that let thousands of people experience the worse-before-better path out of reactive maintenance. The cases point to a set of principles for successful modelling practice.",
  bigIdeas: [
    {
      title: "Change comes from clients discovering the insight themselves",
      text: "The largest gains come from changing deeply held mental models, but the more basic the belief being challenged, the more defensive people become. The way out is to involve the clients in the modelling so that they find the insight on their own. The three cases used very different formats (a quick small model and flight simulator, a huge calibrated model in a lawsuit, a board game) but each made the clients partners in the inquiry.",
      pages: "41-42",
    },
    {
      title: "Widening the boundary turned an outside threat into a self-made one",
      text: "The industry's mental model held that new and used car markets were separate, because owners kept cars for more than six years. Adding late-model used cars as a stock that trade-ins flow into, instead of letting them vanish, raised a simple stock-and-flow question: where did the superstores get their supply of clean, nearly new cars? The answer was the carmakers' own short leases, which returned high-quality vehicles to the market after two to four years. Superstores were a symptom, an endogenous consequence of manufacturers' leasing policy.",
      pages: "42-47",
    },
    {
      title: "Short-run success that teaches the wrong lesson",
      text: "Leasing boosted sales at once through the lease incentive and shorter trade-in cycles, while the loops that would undo the gain (used car prices, used car quality and the purchase option) operated only after a delay of about one lease term. Early-1990s experience therefore taught carmakers that leasing works, and they put still more money into subvention and shorter terms. Rising used prices and buyout rates seemed to confirm the view, and spreadsheets that projected those trends forward cut every feedback between the two markets.",
      pages: "46-48, 53",
    },
    {
      title: "The 'all else equal' fallacy",
      text: "Switching every buyer to three-year leases would halve the trade-in cycle and, if nothing else changed, double new car sales. But nearly new off-lease cars are close substitutes for new ones, so a flood of them depresses used prices, pulls buyers away from new cars, raises the average trade-in time across the whole population and lowers the share of lessees who buy their car at lease end. A reinforcing loop through the purchase option can then drive used prices down further. Policy analysis showed that four-year terms beat two- and three-year terms across most scenarios.",
      pages: "46-52",
    },
    {
      title: "Competitive traps and robust policies",
      text: "Profits without leasing were negative in every scenario: once competitors lease, stopping alone hands them the market, a prisoner's dilemma. The modelling team therefore searched for the best lease policy in each cell of a matrix of competitor strategies and economic scenarios, rather than one optimum. Longer terms won almost everywhere, and they also reduced the vulnerability of earnings in a downturn. A recommendation that is best across many scenarios is far more persuasive than one that is best only in the base case.",
      pages: "51-52",
    },
    {
      title: "A bathtub can carry the insight to executives",
      text: "To explain why short leases increase exposure to recessions, the team drew the late-model car stock as a bathtub filled by production and by returning lease cars and drained by sales. In a recession sales fall, so carmakers cut prices and production, but the inflow from leases written during the preceding boom cannot be shut off, and more lessees hand their cars back as used prices fall. The simple picture, backed by the formal analysis, did more to shift managers' thinking than the full loop diagram.",
      pages: "52",
    },
    {
      title: "Projects run late because of the rework cycle",
      text: "Work in a project phase flows from work to be done into either work really done or undiscovered rework, depending on quality. Undiscovered rework looks finished, so it is counted as progress until testing or a downstream phase finds the errors, often months later. Customer changes act like errors: they make correct work obsolete and push it back into the queue. In the sample studied by Cooper and Mullen only 68% of commercial and 34% of defence work was done right first time, and errors took around 9 months to discover.",
      pages: "56-59",
    },
    {
      title: "Corrective actions have side effects that multiply disruption",
      text: "A project behind schedule can work overtime, hire, or compress the schedule. Each is a balancing loop meant to restore progress. Each also triggers reinforcing side effects: overtime causes fatigue and burnout that cut productivity and quality and raise attrition; rapid hiring dilutes experience and lowers recruiting standards; schedule compression forces out-of-sequence work, congestion and morale problems. Lower quality feeds the rework cycle, so small customer changes can snowball into delays many times their direct cost.",
      pages: "59-61",
    },
    {
      title: "Building confidence: reasonableness limits, shock tests and alternative models",
      text: "The Ingalls team set explicit limits of reasonableness for every parameter before calibration and never broke them to improve the fit, required parameters in different sections to be mutually consistent, subjected the model to extreme 'shock' tests and tried alternative plausible formulations. Comparing model output with history was used to find flaws, not to prove the model right, and it led to three major and many minor revisions. Fitting data is easy; reproducing it for reasons the clients understand and accept is what builds confidence.",
      pages: "61-62",
    },
    {
      title: "Counterfactual comparison and an open model",
      text: "The cost of the Navy's changes was estimated as the difference between an as-built simulation, with all the changes, and a would-have simulation without them; sensitivity analysis put bounds on the difference. Ingalls handed the model to the Navy, whose experts critiqued it. When the modellers incorporated the critics' changes, the share of the overrun attributed to the Navy went up, not down, showing that the result had not been engineered. The opposing side's understanding of the model became a shared framework for settling the dispute.",
      pages: "62-64",
    },
    {
      title: "Defects are a stock: the physics of the reactive maintenance trap",
      text: "The Du Pont model replaced the view of maintenance as repairing failures at minimum cost with the physics of breakdowns: equipment fails when enough latent defects accumulate. Defects are drained by reactive repair and by planned maintenance, two balancing loops that look symmetrical. But breakdowns cause collateral damage, pull mechanics off planned work and lower uptime so operators refuse to take equipment down for planned work. Cost pressure then cuts part quality, training, design improvements and planning. These reinforcing loops can lock a plant into high breakdowns, low uptime and a culture that sees unreliability as normal.",
      pages: "67-72",
    },
    {
      title: "Reinvest the gains, and expect worse before better",
      text: "Proactive policies used to cut headcount (the cost-minimisation mindset) only made reactive work more efficient. The same policies with the freed mechanics reinvested in planned work turned the vicious cycles into virtuous ones and produced far larger gains than the sum of the separate policies. The transition is worse before better: planned work takes equipment off line and adds cost before the stock of defects falls. Managers who do not expect the dip read it as proof the policy has failed and abandon it.",
      pages: "72-73",
    },
    {
      title: "Implementation needs an experience, not a report",
      text: "Du Pont's white paper and presentations changed nothing, because the people who had to act numbered in the thousands and had not been through the modelling. The team converted the model into the Manufacturing Game, a role-play in which operations, maintenance and stores managers live through rising defects, breakdowns and the worse-before-better transition in a few hours. Repeated two-day learning labs, trained local facilitators and word of mouth then spread the policies. The model gave the insight; the game made it felt.",
      pages: "74-76",
    },
    {
      title: "Principles for successful modelling",
      text: "Model a problem, not a system, and focus on the client's purpose. Start early, ask honestly whether system dynamics is the right tool, combine it with other methods and plan for implementation from the first day. Work as a joint inquiry, avoid black boxes and let clients run and criticise the model. Treat validation as continuous, get a simple working simulation early and add detail only when needed, prefer a broad boundary to fine detail, use experienced modellers and expect implementation to continue long after the project.",
      pages: "79-81",
    },
  ],
  diagrams: [
    {
      kind: "cld",
      title: "Leasing couples the new and used car markets",
      pages: "44-47",
      cld: {
        size: [760, 420],
        vars: [
          { id: "p", label: "Production", x: 620, y: 50 },
          { id: "i", label: "New car inventory", x: 380, y: 50 },
          { id: "pr", label: "New car prices", x: 250, y: 185 },
          { id: "sv", label: "Lease subvention", x: 520, y: 185 },
          { id: "s", label: "New car sales", x: 380, y: 300 },
          { id: "u", label: "Off-lease used supply", x: 345, y: 392 },
          { id: "up", label: "Used car prices", x: 100, y: 245 },
          { id: "rf", label: "Lease buyout rate", x: 95, y: 375 },
        ],
        links: [
          { from: "p", to: "i", sign: "+", curve: -45 },
          { from: "i", to: "p", sign: M, curve: 45 },
          { from: "i", to: "pr", sign: M },
          { from: "pr", to: "s", sign: M },
          { from: "i", to: "sv", sign: "+" },
          { from: "sv", to: "s", sign: "+" },
          { from: "s", to: "i", sign: M },
          { from: "s", to: "u", sign: "+" },
          { from: "u", to: "up", sign: M },
          { from: "up", to: "s", sign: "+" },
          { from: "up", to: "rf", sign: "+", curve: 20 },
          { from: "rf", to: "u", sign: M },
        ],
        loops: [
          { type: "B", label: "B1", x: 513, y: 50 },
          { type: "B", label: "B2", x: 330, y: 190 },
          { type: "B", label: "B3", x: 430, y: 190 },
          { type: "B", label: "B4", x: 270, y: 318 },
          { type: "R", label: "R1", x: 175, y: 340 },
        ],
        caption:
          'The industry saw only the top: <span class="chip chipB">B1</span> production control, <span class="chip chipB">B2</span> price cuts and <span class="chip chipB">B3</span> lease subvention, all draining excess inventory. Leases return cars after about one <b>lease term</b>, so sales also feed <b>off-lease used supply</b>. More supply lowers used prices, which draws buyers away from new cars (<span class="chip chipB">B4</span>) and makes fewer lessees buy their car at lease end, adding still more supply (<span class="chip chipR">R1</span>).',
      },
      note: "Our simplified redrawing. The original diagram (Sterman 2000) also has separate loops for lease term and used car quality, which act like B4 here.",
    },
    {
      kind: "cycle",
      title: "The rework cycle in one project phase",
      pages: "57-59",
      nodes: [
        "Work to be done",
        "Work being done at some quality",
        "Errors hide as undiscovered rework",
        "Testing or a later phase finds them",
        "Known rework rejoins work to be done",
      ],
      center: "Customer changes also push finished work back",
      note: "Correctly done tasks leave the cycle as work really done. Because hidden errors look complete, reported progress runs ahead of real progress until the discoveries arrive.",
    },
    {
      kind: "cld",
      title: "How design changes ripple through a shipyard project",
      pages: "59-61",
      cld: {
        size: [760, 420],
        vars: [
          { id: "sp", label: "Schedule pressure", x: 380, y: 40 },
          { id: "wr", label: "Work remaining", x: 380, y: 190 },
          { id: "prog", label: "Net progress", x: 380, y: 300 },
          { id: "pq", label: "Productivity and quality", x: 380, y: 395 },
          { id: "ot", label: "Overtime", x: 150, y: 110 },
          { id: "hire", label: "Hiring", x: 610, y: 110 },
          { id: "fat", label: "Fatigue and burnout", x: 130, y: 265 },
          { id: "skill", label: "Average experience", x: 630, y: 265 },
          { id: "cc", label: "Customer changes", x: 100, y: 35 },
        ],
        links: [
          { from: "cc", to: "wr", sign: "+" },
          { from: "wr", to: "sp", sign: "+" },
          { from: "sp", to: "ot", sign: "+" },
          { from: "sp", to: "hire", sign: "+" },
          { from: "ot", to: "prog", sign: "+" },
          { from: "hire", to: "prog", sign: "+" },
          { from: "prog", to: "wr", sign: M },
          { from: "ot", to: "fat", sign: "+" },
          { from: "fat", to: "pq", sign: M },
          { from: "hire", to: "skill", sign: M },
          { from: "skill", to: "pq", sign: "+" },
          { from: "pq", to: "prog", sign: "+" },
        ],
        loops: [
          { type: "B", label: "B1", x: 325, y: 118 },
          { type: "B", label: "B2", x: 440, y: 118 },
          { type: "R", label: "R1", x: 250, y: 280 },
          { type: "R", label: "R2", x: 510, y: 280 },
        ],
        caption:
          'Changes add to <b>work remaining</b>. Management responds with overtime (<span class="chip chipB">B1</span>) and hiring (<span class="chip chipB">B2</span>). But sustained overtime brings fatigue (<span class="chip chipR">R1</span>) and fast hiring dilutes experience (<span class="chip chipR">R2</span>), both lowering productivity and quality. <b>Net progress</b> counts work done right: low quality sends tasks into the rework cycle, so the vicious loops can outrun the corrections.',
      },
      note: "A simplified version in our own layout; the real model also had schedule compression, congestion, morale and spill-overs between phases and between the two ship programmes.",
    },
    {
      kind: "cld",
      title: "The reactive maintenance trap",
      pages: "67-72",
      cld: {
        size: [760, 420],
        vars: [
          { id: "pm", label: "Planned maintenance", x: 110, y: 210 },
          { id: "def", label: "Equipment defects", x: 380, y: 210 },
          { id: "brk", label: "Breakdowns", x: 640, y: 210 },
          { id: "rm", label: "Reactive repairs", x: 510, y: 345 },
          { id: "up", label: "Plant uptime", x: 215, y: 60 },
          { id: "cost", label: "Cost pressure", x: 680, y: 110 },
          { id: "cap", label: "Maintenance capability", x: 405, y: 55 },
        ],
        links: [
          { from: "def", to: "brk", sign: "+", curve: -45 },
          { from: "brk", to: "def", sign: "+", curve: 45 },
          { from: "brk", to: "rm", sign: "+" },
          { from: "rm", to: "def", sign: M },
          { from: "def", to: "pm", sign: "+", curve: 45 },
          { from: "pm", to: "def", sign: M, curve: 45 },
          { from: "rm", to: "pm", sign: M, curve: -30 },
          { from: "brk", to: "up", sign: M },
          { from: "up", to: "pm", sign: "+", curve: 40 },
          { from: "pm", to: "up", sign: M, curve: 40 },
          { from: "brk", to: "cost", sign: "+" },
          { from: "cost", to: "cap", sign: M },
          { from: "cap", to: "def", sign: M },
        ],
        loops: [
          { type: "R", label: "R1", x: 523, y: 210 },
          { type: "B", label: "B1", x: 515, y: 280 },
          { type: "B", label: "B2", x: 248, y: 210 },
          { type: "R", label: "R2", x: 380, y: 262 },
          { type: "R", label: "R3", x: 290, y: 150 },
          { type: "B", label: "B3", x: 160, y: 135 },
          { type: "R", label: "R4", x: 540, y: 128 },
        ],
        caption:
          'Defects are removed by repair after failure (<span class="chip chipB">B1</span>) and by planned work before it (<span class="chip chipB">B2</span>). Breakdowns also cause collateral damage (<span class="chip chipR">R1</span>), pull mechanics to repairs (<span class="chip chipR">R2</span>) and cut uptime, so operators refuse takedowns (<span class="chip chipR">R3</span>); planned work itself costs uptime (<span class="chip chipB">B3</span>). Breakdown costs raise cost pressure, which cuts parts, training and planning (<span class="chip chipR">R4</span>). Run backwards, every R loop becomes a virtuous cycle.',
      },
      note: "Our condensation of the Du Pont dynamic hypothesis. The original distinguishes ten reinforcing loops, including revenue and reputation erosion and a reactive culture.",
    },
    {
      kind: "sequence",
      title: "GM's dialogue decision process",
      pages: "43",
      steps: [
        { label: "Frame the problem", detail: "Core team and decision board agree what is being decided" },
        { label: "Develop alternatives", detail: "Policies such as lease terms, subvention and residuals" },
        { label: "Conduct the analysis", detail: "Model, data and flight simulator" },
        { label: "Establish connection", detail: "Link results to the decision and its implementation" },
      ],
      note: "After each stage the core team (those who must implement) meets the decision review board (those who allocate resources). Modelling sat inside this process rather than beside it.",
    },
  ],
  formulations: [
    {
      name: "The rework cycle",
      equations: [
        "Work rate = Workforce × Productivity",
        "Correct work = Work rate × Quality",
        "Rework generation = Work rate × (1 − Quality)",
        "Rework discovery = Undiscovered rework / Discovery time",
        "Work to do(t) = Work to do(0) + ∫(Rework discovery + Customer changes − Work rate) dt",
      ],
      explain:
        "Quality splits the work flow into tasks really done and tasks that only look done. The hidden stock drains back into work to do after the discovery time. With low quality and long discovery delays the project shows rapid early progress and a long tail, the classic '90% done' pattern.",
      molecule: "reworkCycle",
      pages: "57-59",
    },
    {
      name: "Sales from a stock of cars on the road",
      equations: ["Trade-ins = Cars on the road / Average trade-in time", "Cars on the road(t) = Cars(0) + ∫(Sales − Trade-ins − Scrapping) dt"],
      explain:
        "Replacement demand is a first-order outflow. Halving the trade-in time doubles the outflow at first, which is the basis of the claim that three-year leases would double sales. But the flow drains the stock faster, and the cars traded in do not disappear: they become a supply of used cars that competes with new ones.",
      molecule: "decay",
      pages: "44-46",
    },
    {
      name: "Off-lease returns as a delayed inflow",
      equations: ["Lease returns(t) = Leases written(t − Lease term) × (1 − Buyout fraction)", "Late-model supply(t) = ∫(Production + Lease returns − Sales) dt"],
      explain:
        "A bathtub view of the late-model used-car market. Returns are a delayed echo of past sales and cannot be cut when demand falls. When used prices drop below contract residuals the buyout fraction falls, so returns rise just when the market can least absorb them.",
      molecule: "material",
      pages: "52-53",
    },
    {
      name: "The stock of equipment defects",
      equations: [
        "Defects(t) = Defects(0) + ∫(Defect creation − Repair − Planned elimination) dt",
        "Breakdowns = f(Defects per unit of equipment)",
        "Equilibrium defects ≈ Defect creation × Average time a defect persists",
      ],
      explain:
        "Like any stock with a steady inflow and an outflow proportional to the stock, defects settle where creation equals removal. Planned maintenance shortens the average life of a defect, so the equilibrium stock falls in proportion, but only after a transition that takes several defect lifetimes.",
      molecule: "residence",
      pages: "67-69",
    },
  ],
  cases: [
    {
      title: "General Motors: leasing and the used car superstores (1995-1998)",
      text: "Superstore sales grew from nothing in 1992 to more than $13 billion in 1998, and leasing rose from 4.1% of new car sales in 1990 to over 22% in 1997. A model built overnight, then refined over 20 days into a flight simulator, showed that short leases were creating the supply of nearly new cars and that their full effect took up to 5 years to play out. GM moved to 36-48 month terms, dropped two-year leases and did not raise residuals. When off-lease cars flooded the market in 1997, the share of returned leases rose from 29% to 39% in 1998 and the average loss per returned car reached $1878. Ford Credit's profit fell $410 million (28%) in 1997, while GMAC's automotive financing income fell only $36 million.",
      pages: "42-55",
    },
    {
      title: "Ingalls Shipbuilding and the Navy claim (1970s)",
      text: "Ingalls won fixed-price contracts for 9 LHA assault ships (1969) and 30 destroyers (1970), doubled its workforce to over 20,000, and by the mid-1970s faced overruns above $500 million on sales of $500-800 million a year. The Navy accepted only the direct cost of its thousands of design changes. A Pugh-Roberts system dynamics model of every phase of both programmes quantified the indirect delay and disruption, survived critique by the Navy's own experts and became the sole technical basis for that part of the claim. The parties settled in June 1978 for $447 million, of which the model was credited with $170-350 million, roughly two years after modelling began.",
      pages: "55-64",
    },
    {
      title: "Du Pont: spending more on maintenance and getting less",
      text: "Benchmarking in 1991 showed Du Pont spent 10-30% more on maintenance per dollar of plant than industry leaders while uptime was 10-15% lower. A typical plant was worth $400 million, employed about 90 mechanics and ran at 83.5% uptime. Simulations showed that better scheduling alone kept uptime with 82 mechanics, and a full proactive suite kept it with 61, but the same suite without downsizing raised uptime above 93% and added about $9 million a year in profit. Plants adopting the programme saw pump MTBF improve 12% per doubling of experience and costs fall 20%, against 5% and a 7% cost rise in 23 comparison plants.",
      pages: "66-76",
    },
    {
      title: "BP's Lima refinery",
      text: "A run-down refinery that BP planned to sell or close adopted the maintenance game in 1994 and put 80% of its staff through it. Maintenance costs rose about 30% in the first six months, as expected. Pump MTBF rose from 12 to 58 months and pump failures fell from over 640 (1991) to 131 (1998); new value was put at $43 million a year against a cost of $320,000. The refinery was sold in 1998 for $215 million and kept running. One team eliminated butane flaring in two weeks for $5000, saving $1.5 million a year, a fix they had known about for 8 years.",
      pages: "77-79",
    },
  ],
  exercises: [
    {
      prompt:
        "Feel the 90% syndrome. In Rework Cycle run the High quality preset (quality 0.95) and the Low quality preset (0.6). For each, note the week when Work done passes 900 of the 1000 tasks. Then keep quality at 0.6 and raise the rework discovery time from 5 to 16 weeks. What happens to apparent progress early on, and to the finish date?",
      hint: "Long discovery times make the project look further along than it is, then stretch the tail.",
      link: { label: "Rework Cycle", hash: "/m/reworkCycle" },
    },
    {
      prompt:
        "Replicate the claim logic with an as-built and a would-have run. In Rework Cycle set capacity 90 and discovery time 8. Treat quality 0.85 as the would-have case and quality 0.65 (the disruption from design changes) as the as-built case. Record the week each run reaches 950 tasks done; the difference is the delay attributable to the disruption.",
      link: { label: "Rework Cycle", hash: "/m/reworkCycle" },
    },
    {
      prompt:
        "Overtime as a corrective action with a side effect. In Productivity & Fatigue compare Normal hours with the Crunch preset (overtime 1.4). Find the week at which crunch output falls back to normal and what it settles at. Relate this to the shipyard's R1 loop.",
      link: { label: "Productivity & Fatigue", hash: "/m/prodFatigue" },
    },
    {
      prompt:
        "Experience dilution. In Coflow with Experience run Steady team and then Hiring surge (dilution). How far does average experience fall, and how many years does it take to recover? Then try Hire veterans. Ingalls doubled its workforce to over 20,000 in a few years: what would that do to productivity and quality?",
      link: { label: "Coflow with Experience", hash: "/m/coflowExperience" },
    },
    {
      prompt:
        "The 'all else equal' leasing argument. In Decay set the stock as cars on the road and compare decay time 6 years (owners keep cars) with 3 years (three-year leases). Compare the outflow (trade-ins) in the first year and after 10 years. Why is the doubling of replacement sales only temporary unless the stock is refilled, and where do the traded-in cars go in the real market?",
      hint: "Initial outflow is 100/6 ≈ 17 versus 100/3 ≈ 33 per year, but the faster outflow empties the stock sooner.",
      link: { label: "Decay", hash: "/m/decay" },
    },
    {
      prompt:
        "Lease returns as a delayed echo. In Material Delay run Pulse through with a transit delay of 9 weeks, treating the inflow as leases written in a boom and the arrivals as cars coming back. Then set the delay to 16. Note when arrivals peak in each case and explain why returns keep arriving after demand has fallen.",
      link: { label: "Material Delay", hash: "/m/material" },
    },
    {
      prompt:
        "Defects as a stock. In Residence Time treat the inflow (8 per month) as defect creation and τ as the average time a defect survives. Compare Long stay (τ = 10) with Short stay (τ = 2): how large is the equilibrium stock in each, and how long does each run take to get close to it? Connect that adjustment time (about three τ) to the length of the worse-before-better dip after planned maintenance starts.",
      hint: "Equilibrium stock = inflow × τ: 80 versus 16.",
      link: { label: "Residence Time", hash: "/m/residence" },
    },
    {
      prompt:
        "Pen and paper: compare the Du Pont loops with the capability trap case. Sketch the work-harder and work-smarter loops, then mark which of the maintenance loops (R1 to R4 in our diagram) correspond to each. Which loop would you break first, and what short-run cost would you have to accept?",
      link: { label: "Capability trap case", hash: "/apps/business/capability-trap" },
    },
  ],
  pitfalls: [
    "Reasoning 'all else equal' about a policy whose main effects come through feedback (shorter leases double sales) and ignoring the stocks it fills elsewhere.",
    "Projecting recent favourable trends in spreadsheets that cut the feedbacks between markets, as brand managers did with used car prices and buyout rates.",
    "Counting only the direct cost of a change and treating knock-on effects as a small percentage, when rework and side effects of corrective action can multiply it.",
    "Calibrating to history by bending parameters outside plausible limits. A good fit for the wrong reasons will not survive critique or change anyone's mind.",
    "Harvesting productivity gains as headcount cuts, which keeps the organisation in the reactive regime instead of reinvesting in prevention.",
    "Abandoning a high-leverage policy during its worse-before-better dip because nobody anticipated the dip or its length.",
    "Building the model out of the clients' sight and presenting results: black-box models do not change mental models, so they do not change behaviour.",
    "Disaggregating too early (every brand, every segment) and delaying a working model, instead of starting simple and adding detail only where sensitivity analysis shows it matters.",
  ],
  molecules: ["reworkCycle", "prodFatigue", "coflowExperience", "decay", "material", "residence", "bathtub"],
};
