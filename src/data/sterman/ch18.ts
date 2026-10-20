import type { StudyChapter } from "@/data/sterman/types";

// Study guide to Sterman (2000), chapter 18. Written in our own words; page numbers are the printed book pages.
export const CHAPTER: StudyChapter = {
  id: "ch18",
  number: "18",
  title: "The manufacturing supply chain",
  part: "Part V Instability and oscillation",
  pages: "709-756",
  summary:
    "This chapter turns the generic stock management structure into a model of a manufacturing firm and then of a two-firm supply chain. The model is built in stages (order fulfilment, production and work in process, production starts, forecasting, backlogs, raw materials, a linked supplier, and finally lead-time gaming) and each stage is tested before the next is added. The results separate what is inevitable from what is self-inflicted: a drop in inventory, amplification and phase lag follow from the stock and flow structure however smart the managers are, but the large upstream swings and the breakdown of trust between partners come from locally rational policies interacting. The chapter ends with a consulting case in which a fast-growing electronics firm used a system dynamics model to redesign its supply chain.",
  bigIdeas: [
    {
      title: "Build the model in stages and test each one",
      text: "Sterman relaxes one simplifying assumption at a time (no backlog, no materials, no supplier) and studies the behaviour fully before adding the next piece. This makes it possible to say which structure causes which part of the behaviour, for example how much extra amplification the materials stock adds. Building a large model in one go loses that ability to attribute behaviour to structure and usually slows the work down.",
      pages: "709",
    },
    {
      title: "Order fulfilment is a smooth function, not a hard minimum",
      text: "Shipments equal desired shipments times an <b>order fulfilment ratio</b> that depends on the ratio of the maximum shipment rate (inventory divided by the minimum order processing time) to the desired rate. For a single product the rule would be MIN(desired, maximum). But an aggregate inventory hides many stock-keeping units, and some are out of stock even when the total looks adequate, so the ratio falls below 1 before the aggregate limit is reached. The more items aggregated and the less predictable their demand, the lower the curve. Strategic withholding of stock for favoured customers lowers it further.",
      pages: "711-713",
    },
    {
      title: "Production starts follow the stock management rule twice over",
      text: "Desired production equals expected orders plus an inventory adjustment; desired starts equal desired production plus a work-in-process adjustment, with desired WIP set by Little's law as the manufacturing cycle time times desired production. Desired inventory is expected orders times a desired coverage made of the minimum processing time plus safety stock. Because the WIP adjustment accounts for the production pipeline, the rule fully counts its supply line, and the firm on its own does not oscillate.",
      pages: "713-716",
    },
    {
      title: "Initialise models in a balanced equilibrium",
      text: "A balanced equilibrium means every stock is constant and equal to its desired value, so all flows equal their targets. Starting there lets you see the response to a test input without confusing it with the model's own start-up transient. Initial values should be written as expressions of parameters (initial inventory = desired coverage × desired shipments), not numbers, so the model stays in equilibrium when parameters change. Expressions that depend on themselves create simultaneous initial conditions; break them by using variables outside the loop or by solving the equations.",
      pages: "716-720",
    },
    {
      title: "An unexpected rise in demand must first lower inventory",
      text: "When orders jump 20%, production continues at the old rate for a while, so inventory falls just when the firm wants more of it. In the base case coverage drops from 4 to 3.33 weeks immediately and the fulfilment ratio sinks to about 95% some 7 weeks later, losing sales. The fall is a consequence of the production delay, not of bad management.",
      pages: "720-723",
    },
    {
      title: "Amplification and phase lag are unavoidable; oscillation is not",
      text: "To rebuild inventory to a higher target, production must exceed shipments for a while, and starts must exceed production while WIP grows. So starts overshoot orders (by 42% four weeks after the shock, an amplification ratio of 2.12), and the peak lags the demand change because inventory bottoms only when production finally catches up. These features follow from the stock and flow structure under any sensible policy. The single-firm response is smooth and stable, though, so explaining cycles needs more structure.",
      pages: "720-723",
    },
    {
      title: "Every extra stock and delay adds amplification",
      text: "Adding a backlog buffers orders from shipments and slightly reduces amplification (1.97 instead of 2.12). Adding a raw materials inventory managed by its own stock management rule raises the amplification of materials orders to 2.52. Linking a supplier with the same structure raises the producer's materials orders to 4.08, and the supplier's material deliveries swing more than nine times as much as customer orders. Each stage's corrections become the next stage's demand signal.",
      pages: "723-734",
    },
    {
      title: "Supply chains filter fast noise and amplify slow swings",
      text: "Fed with random, autocorrelated customer orders whose standard deviation is under 5%, the two-firm chain produces supplier deliveries with a standard deviation of 37% of the mean, more than seven times larger. The week-to-week noise is absorbed by inventories, but slower variations are progressively magnified, so the chain rings at its own natural period. Oscillation, amplification and phase lag all emerge endogenously although the environment does not oscillate.",
      pages: "734-735",
    },
    {
      title: "Instability erodes trust, and mistrust feeds instability",
      text: "Upstream firms see their customers' orders as erratic; downstream firms find suppliers late and on allocation; forecasts lose credibility inside each firm. When customers update their expected lead time from experience and order further ahead as it lengthens, a reinforcing loop closes: longer lead times raise desired materials on order, which raises orders, which lengthens lead times. If a supplier allocates 80% of each order, customers ask for 125% or more. Each buyer's behaviour is locally rational, because each sees lead time as outside its control, but collectively it worsens the swings for everyone.",
      pages: "735-740",
    },
    {
      title: "Integration policies attack delays and distorted signals",
      text: "Electronic data interchange shortens order processing, efficient customer response and continuous replenishment cut delivery times, sharing point-of-sale data lets suppliers forecast from final demand rather than from amplified orders, and vendor-managed inventory removes a decision layer altogether. Their effects depend on the structure: sharing sales data and cutting delays work through different loops, and who bears the cost and who gains differ between partners, which shapes whether a policy is adopted.",
      pages: "740-742",
    },
    {
      title: "Hot products can end with surplus inventory",
      text: "In the electronics case, excess stock at the end of a product's life appeared not only for slow sellers but also for hits. Scarcity triggers channel partners to order further ahead and hold defensive stock, two reinforcing loops that generate phantom orders. The maker cannot tell real from phantom demand and ramps production through long planning and procurement delays; when supply catches up, partners cancel and liquidate, and the maker is left with a mountain of stock. Cutting delays turns the same loops into virtuous cycles.",
      pages: "746-753",
    },
  ],
  diagrams: [
    {
      kind: "cld",
      title: "Inventory, WIP and stockout loops in one firm",
      pages: "710-716",
      cld: {
        size: [660, 330],
        vars: [
          { id: "co", label: "Customer orders", x: 110, y: 50 },
          { id: "eo", label: "Expected orders", x: 370, y: 50 },
          { id: "ship", label: "Shipments", x: 110, y: 170 },
          { id: "dps", label: "Desired production starts", x: 400, y: 170 },
          { id: "inv", label: "Inventory", x: 110, y: 290 },
          { id: "prod", label: "Production", x: 330, y: 290 },
          { id: "wip", label: "Work in process", x: 560, y: 290 },
        ],
        links: [
          { from: "co", to: "eo", sign: "+" },
          { from: "co", to: "ship", sign: "+" },
          { from: "eo", to: "dps", sign: "+" },
          { from: "inv", to: "ship", sign: "+", curve: -40 },
          { from: "ship", to: "inv", sign: "−", curve: -40 },
          { from: "inv", to: "dps", sign: "−" },
          { from: "dps", to: "wip", sign: "+", curve: 50 },
          { from: "wip", to: "dps", sign: "−", curve: 50 },
          { from: "wip", to: "prod", sign: "+" },
          { from: "prod", to: "inv", sign: "+" },
        ],
        loops: [
          { type: "B", label: "B1", x: 110, y: 230 },
          { type: "B", label: "B2", x: 330, y: 245 },
          { type: "B", label: "B3", x: 480, y: 230 },
        ],
        caption:
          '<span class="chip chipB">B1</span> stockout: low inventory limits shipments. <span class="chip chipB">B2</span> inventory control: a shortfall raises desired starts, which flow through work in process into production and inventory. <span class="chip chipB">B3</span> WIP control: work already in process reduces the starts needed. Desired starts are anchored on <b>expected orders</b>, a smoothed forecast of customer orders.',
      },
    },
    {
      kind: "sequence",
      title: "Building the manufacturing model in stages",
      pages: "720-739",
      note: "Each stage is tested with the same unanticipated 20% step in customer orders. Amplification ratios are peak changes relative to the change in customer orders.",
      steps: [
        { label: "Single firm, lost sales", detail: "Inventory, WIP and starts; starts amplify 2.12 and lag; no cycle." },
        { label: "Add a backlog", detail: "Orders wait instead of being lost; starts amplify 1.97." },
        { label: "Add raw materials", detail: "A second stock management rule; materials orders amplify 2.52." },
        { label: "Link a supplier", detail: "Materials arrive through the supplier's own chain; producer orders amplify 4.08, supplier deliveries more than 9." },
        { label: "Random demand", detail: "Under 5% noise in orders becomes a 37% swing in supplier deliveries." },
        { label: "Lead-time gaming", detail: "Expected lead time follows actual lead time; supplier lead time peaks 23% higher still." },
      ],
    },
    {
      kind: "cld",
      title: "Lead-time gaming between producer and supplier",
      pages: "736-740",
      cld: {
        size: [730, 320],
        vars: [
          { id: "mo", label: "Materials orders", x: 110, y: 60 },
          { id: "sb", label: "Supplier backlog", x: 400, y: 60 },
          { id: "ss", label: "Supplier shipments", x: 640, y: 60 },
          { id: "lt", label: "Supplier lead time", x: 560, y: 175 },
          { id: "elt", label: "Expected lead time", x: 330, y: 175 },
          { id: "dmo", label: "Desired materials on order", x: 150, y: 280 },
        ],
        links: [
          { from: "mo", to: "sb", sign: "+", curve: -45 },
          { from: "sb", to: "mo", sign: "−", curve: -45 },
          { from: "sb", to: "lt", sign: "+" },
          { from: "lt", to: "elt", sign: "+" },
          { from: "elt", to: "dmo", sign: "+" },
          { from: "dmo", to: "mo", sign: "+" },
          { from: "sb", to: "ss", sign: "+", curve: 45 },
          { from: "ss", to: "sb", sign: "−", curve: 45 },
        ],
        loops: [
          { type: "B", label: "B1", x: 255, y: 60 },
          { type: "R", label: "R1", x: 205, y: 165 },
          { type: "B", label: "B2", x: 518, y: 60 },
        ],
        caption:
          '<span class="chip chipB">B1</span> supply-line control: materials already on order (the supplier\'s backlog of this customer\'s orders) reduce new orders. <span class="chip chipB">B2</span> the supplier ships to work off its backlog. <span class="chip chipR">R1</span> lead-time gaming: a longer backlog stretches lead time, the producer expects longer delays, wants more on order and orders more, which lengthens the backlog again.',
      },
    },
    {
      kind: "cld",
      title: "Phantom orders for a hot product",
      pages: "746-749",
      cld: {
        size: [680, 330],
        vars: [
          { id: "co", label: "Channel orders", x: 120, y: 165 },
          { id: "bl", label: "Channel backlog", x: 360, y: 165 },
          { id: "lt", label: "Delivery lead time", x: 360, y: 50 },
          { id: "ahead", label: "Ordering ahead", x: 120, y: 50 },
          { id: "rel", label: "Delivery reliability", x: 360, y: 290 },
          { id: "safety", label: "Defensive safety stock", x: 120, y: 290 },
          { id: "build", label: "Build rate", x: 590, y: 165 },
        ],
        links: [
          { from: "co", to: "bl", sign: "+" },
          { from: "bl", to: "lt", sign: "+" },
          { from: "lt", to: "ahead", sign: "+" },
          { from: "ahead", to: "co", sign: "+" },
          { from: "bl", to: "rel", sign: "−" },
          { from: "rel", to: "safety", sign: "−" },
          { from: "safety", to: "co", sign: "+" },
          { from: "bl", to: "build", sign: "+", curve: 40, note: "delays" },
          { from: "build", to: "bl", sign: "−", curve: 40 },
        ],
        loops: [
          { type: "R", label: "R1", x: 240, y: 105 },
          { type: "R", label: "R2", x: 240, y: 228 },
          { type: "B", label: "B1", x: 475, y: 165 },
        ],
        caption:
          '<span class="chip chipR">R1</span> ordering ahead: longer lead times make partners keep more weeks of sales on order. <span class="chip chipR">R2</span> ordering defensively: falling reliability makes them hold more safety stock. Both swell the backlog with phantom orders. <span class="chip chipB">B1</span> the maker raises its build rate, but only after planning and procurement delays; when supply catches up, R1 and R2 run in reverse and the orders vanish.',
      },
    },
  ],
  formulations: [
    {
      name: "Order fulfilment",
      equations: [
        "Inventory(t) = Inventory(0) + ∫(Production − Shipments) dt",
        "Shipments = Desired shipments × Order fulfilment ratio",
        "Order fulfilment ratio = f(Maximum shipments / Desired shipments)",
        "Maximum shipments = Inventory / Minimum order processing time",
      ],
      explain:
        "The function f lies below both 1 and the 45° line, approaching 1 when inventory is ample. It is a fuzzy MIN that reflects the aggregation of many products. Inventory coverage, Inventory / Shipments, is a useful diagnostic. In the base case a coverage of 4 weeks against a 2-week minimum gives a 100% fill rate.",
      molecule: "backlogLevel",
      pages: "711-713",
    },
    {
      name: "Production as a third-order delay",
      equations: ["WIP(t) = WIP(0) + ∫(Production starts − Production) dt", "Production = DELAY3(Production starts, Manufacturing cycle time)"],
      explain:
        "All stages of manufacturing are lumped into one WIP stock whose outflow is a third-order material delay. The fewer items aggregated, the smaller the spread of cycle times and the higher the order that fits.",
      molecule: "material",
      pages: "713-714",
    },
    {
      name: "Production starts (stock management for inventory and WIP)",
      equations: [
        "Production starts = MAX(0, Desired production starts)",
        "Desired production starts = Desired production + (Desired WIP − WIP) / WIP adjustment time",
        "Desired WIP = Manufacturing cycle time × Desired production",
        "Desired production = MAX(0, Expected orders + (Desired inventory − Inventory) / Inventory adjustment time)",
        "Desired inventory = Desired coverage × Expected orders;  Desired coverage = Minimum processing time + Safety stock coverage",
      ],
      explain:
        "This is the chapter 17 rule with inventory as the stock and WIP as the supply line. Base case values: minimum processing 2 weeks, safety stock 2 weeks, cycle time 8 weeks, inventory adjustment 8 weeks.",
      molecule: "stockmgmt",
      pages: "714-716",
    },
    {
      name: "Demand forecast and order backlog",
      equations: [
        "Expected orders = SMOOTH(Customer orders, Time to average orders)",
        "Backlog(t) = Backlog(0) + ∫(Orders − Order fulfilment) dt",
        "Delivery delay = Backlog / Order fulfilment rate",
        "Desired shipments = Backlog / Target delivery delay;  Backlog(0) = Target delivery delay × Orders",
      ],
      explain:
        "Exponential smoothing is the forecasting rule used in many firms. With a backlog, shipments are pulled by the queue of unfilled orders and the delivery delay follows from Little's law. The backlog is an information stock; shipments are the physical flow, though both are counted in the same units.",
      molecule: "backlogFlow",
      pages: "716, 723-725",
    },
    {
      name: "Materials supply line with a variable expected lead time",
      equations: [
        "Material orders = Desired material deliveries + (Desired materials on order − Materials on order) / Supply line adjustment time",
        "Desired materials on order = Expected delivery delay × Desired material deliveries",
        "Perceived delivery delay = SMOOTH(Supplier delivery delay, Perception time)",
        "Expected delivery delay = Reference delay × f(Perceived delay / Reference delay)",
      ],
      explain:
        "With f flat at 1 the producer plans on a fixed lead time. With f along the 45° line it plans on recent experience, and above that line it hedges further. Any upward slope closes the reinforcing lead-time loop, because the supplier's backlog of this customer's orders is the customer's materials on order.",
      molecule: "lowVisPipeline",
      pages: "731-738",
    },
  ],
  cases: [
    {
      title: "One firm meets a 20% rise in orders",
      text: "Starting from 10,000 widgets a week in balanced equilibrium, orders jump to 12,000. Coverage falls from 4 to 3.33 weeks, the fill rate dips to about 95% after 7 weeks, and the forecast takes about half a year to adjust most of the way. Production starts peak more than 42% above the initial level about 4 weeks after the shock (amplification 2.12), and production does not exceed shipments for over 6 weeks, so inventory keeps falling while its target rises. Production peaks well after the 8-week cycle time would suggest, then settles without a cycle.",
      pages: "720-723",
    },
    {
      title: "A two-stage chain whipsaws its supplier",
      text: "With identical producer and supplier, the same 20% step drives producer materials orders to about 18,000 a week (amplification 4.08) and supplier deliveries to more than 28,000, over nine times the change in customer orders. Supplier lead time rises to 3.5 weeks, 75% above normal, and its shipments show a double dip, a harmonic created by the nonlinear stockout function. The supplier's forecast peaks just as its incoming orders fall, so its production ends up nearly out of phase with its orders.",
      pages: "729-735",
    },
    {
      title: "Lead-time gaming",
      text: "When the producer revises its expected lead time from experience (with a 4-week perception delay), supplier lead time rises about 23% higher than with a fixed expectation. As the backlog clears, the producer cuts its desired supply line and orders collapse, leaving it with surplus materials and the supplier with so much stock that it stops buying materials for nearly a month and its coverage peaks above 6 weeks. The supplier appears to bear the cost, but it returns downstream as higher prices and poorer service.",
      pages: "735-740",
    },
    {
      title: "Reengineering the supply chain at a high-velocity electronics firm",
      text: "A fast-growing computer maker (units shipped up about 50% a year, SKUs up 35-fold in five years) faced product lives of 5 to 9 months but component lead times above 3 months, planning cycles of 2 to 3 months and forecast errors of 50% to 100%. A model of about 500 stocks, built with managers in live workshops, reproduced the histories of a slow seller and a hit without changing parameters and predicted that the hit's backlog would soon flip to surplus, which it did. Policy tests showed forecast accuracy mattered less than cutting delays, that lead-time reductions and build-to-order were synergistic, and that cutting initial materials staging to reduce inventory actually made surplus worse. Within three years order-to-ship time and backorders fell 60%, inventory turns rose from about 4 to 12 a year (16 by 1999) and the project generated about $3 billion in cash.",
      pages: "743-755",
    },
  ],
  exercises: [
    {
      prompt:
        "In Material Delay, run <b>Steady pipeline</b> (inflow 8, delay 9) and read how much material is in transit at equilibrium. Then choose <b>Long transit</b> (delay 16). Use Little's law to predict the new pipeline content before you run it. This is the logic of desired WIP.",
      hint: "In transit = flow × delay: 72 units, then 128.",
      link: { label: "Open material delay", hash: "/m/material" },
    },
    {
      prompt:
        "Open Backlog Protected by Level. Compare <b>Healthy stock</b> with <b>Starve production</b> (production 5). Watch shipping fall away from orders as inventory drops below the full-service level. Which part of this molecule plays the role of the order fulfilment ratio?",
      link: { label: "Open backlog and inventory", hash: "/m/backlogLevel" },
    },
    {
      prompt:
        "In Low-Visibility Pipeline Correction, think of the supplier as a second firm. With <b>Tracks the pipeline</b>, slow the supplier from 6 to 12 weeks. Then set awareness to 0 and repeat. Which change (longer supplier delay or lost awareness) does more damage to inventory stability?",
      hint: "With awareness 1 a longer delay only slows the approach; with awareness 0 it produces large swings.",
      link: { label: "Open low-visibility pipeline", hash: "/m/lowVisPipeline" },
    },
    {
      prompt:
        "Play the bullwhip case with <b>Long lead time, partial view</b> (delay 12, weight 0.3). Then raise the weight to 1 and, separately, cut the delay to 6. Which policy corresponds to sharing better supply-line information and which to lean manufacturing or EDI?",
      link: { label: "Bullwhip case", hash: "/apps/business/bullwhip" },
    },
    {
      prompt:
        "Open the vaccine and medicine supply chain case and run <b>Counts doses on order</b>, <b>Ignores doses on order</b> and <b>Long lead time</b>. Which run gives the largest overshoot of stock? Then name one place in a real medicine chain where ordering ahead or allocation during a shortage could close a reinforcing loop like R1 in the lead-time gaming diagram.",
      link: { label: "Medicine supply case", hash: "/apps/health/medicine-supply" },
    },
    {
      prompt:
        "Pen and paper: write algebraic initial values for inventory, WIP, backlog and expected orders in the single-firm model so that it starts in balanced equilibrium for any parameter values. Then show why setting initial inventory to desired coverage × shipments creates a simultaneous equation.",
      hint: "Use desired shipments or customer orders rather than shipments, which depend on inventory through the fulfilment ratio.",
    },
    {
      prompt:
        "Pen and paper: for each integration policy (shared sales data, EDI, lean cycle times, vendor-managed inventory), name the loop or delay in the diagrams above that it changes and say which partner pays and which gains.",
    },
  ],
  pitfalls: [
    "Using a hard MIN for shipments in an aggregate model; it overstates the fill rate when many products are lumped together.",
    "Initialising stocks with numbers instead of equilibrium expressions, so every parameter change throws the model out of balance and confounds the test.",
    "Reading the initial drop in inventory after a demand rise as poor management; it is forced by the production delay.",
    "Assuming a well-behaved single firm implies a well-behaved chain; locally stable policies can combine into large upstream oscillation.",
    "Treating supplier lead time as exogenous in the customer's mental model when it is driven by the customers' own orders.",
    "Investing in forecast accuracy first; in the electronics case cutting delays had far more leverage.",
    "Fixing bottlenecks one at a time after they bind, in a fast-growing system where the next bottleneck should be anticipated and removed before it chokes growth.",
  ],
  molecules: ["stockmgmt", "lowVisPipeline", "material", "backlogLevel", "backlogFlow", "smooth"],
};
