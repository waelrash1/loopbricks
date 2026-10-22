import type { StudyChapter } from "@/data/sterman/types";

// Topic notes drawing on Sterman (2000). Written in our own words; page numbers refer to the printed edition.
export const CHAPTER: StudyChapter = {
  id: "ch20",
  number: "20",
  title: "The invisible hand sometimes shakes: commodity cycles",
  part: "Part V Instability and oscillation",
  pages: "791-842",
  summary:
    "Commodity markets add prices and profits to the supply chain models. Price sits at the centre of several balancing loops (substitution in demand, capacity utilisation and capacity acquisition on the supply side) that are supposed to clear the market, but each works through long perception, decision and construction delays. A generic commodity model can be built sector by sector, including a robust price-setting formulation in which price is anchored on traders' beliefs about the market-clearing price and that anchor drifts toward actual prices. Applied to pulp and paper with no structural changes, the model generates both a short cycle of about four years from the utilisation loop and a long cycle of 12 to 20 years from the capacity loop, much as the data show.",
  bigIdeas: [
    {
      title: "Commodity cycles are endogenous",
      text: "Hogs cycle about every 4 years, cattle every 10 to 12, copper every 8 to 10, commercial aircraft about every 10, oil tanker capacity about every 20, and metals show 10 to 14 year cycles. These periods differ between industries and many are not tied to the business cycle, so they cannot all be caused by swings in general demand. The diversity points to feedback structure inside each industry, chiefly the delays with which supply and demand respond to price.",
      pages: "792-798",
    },
    {
      title: "Many industries show two cycles at once",
      text: "Paper has a cycle of about 4 years most visible in inventories, production and price, and a 10 to 15 year cycle most visible in capacity. Tanker rates fluctuate every few years but capacity follows a cycle of about 20 years, and short-run price volatility is high when the fleet is fully used and low when capacity is in surplus. A good model must explain both modes: the short one from adjusting the use of existing capacity, the long one from building new capacity.",
      pages: "796-798",
    },
    {
      title: "The cobweb model gets the loop right but the structure wrong",
      text: "The textbook cobweb model, with demand reacting to price at once and supply a period later, does oscillate, with a period of twice the production lag. But hogs take about 11 months from breeding to market while the hog cycle lasts about 4 years, and buildings take about 3 years while property cycles last 10 to 20. The cobweb has no inventories, WIP or capacity stocks, runs in discrete time, ties its period to an arbitrary step, and cannot separate utilisation from capacity, so it cannot explain the observed periods.",
      pages: "798",
    },
    {
      title: "Four loops balance a commodity market, all with delays",
      text: "Higher prices cut demand as buyers substitute (B1), raise the utilisation of existing capacity (B2), and if they persist, attract investment in new capacity (B3). An availability loop (B0) also limits shipments when stocks run out, which matters wherever prices adjust slowly or fairness norms cap them. Utilisation responds to expected operating margins over variable costs; investment responds to long-run expected prices against total costs. Both loops contain physical delays (production, construction) and information delays (forming expectations, planning), so each can generate its own cycle.",
      pages: "798-800",
    },
    {
      title: "Industry utilisation is a smooth curve because producers differ",
      text: "For one machine the rule is binary: run if price exceeds variable cost, otherwise stop. Aggregated over plants with different costs and owners with different expectations, utilisation rises gradually with the expected markup, is above zero even below a markup of 1, and saturates at 100%. In capital-intensive industries (paper, chemicals, semiconductors) the normal markup is high and utilisation sits near the flat top of the curve; where most costs are variable, the industry runs on the steep shoulder and utilisation swings more. Utilisation adjusts with a delay, modelled by smoothing.",
      pages: "802-805",
    },
    {
      title: "Desired capacity floats with expected profit: a hill-climbing rule",
      text: "No producer knows the equilibrium capital stock for the whole market, so assuming firms compute it violates the Baker criterion. Instead, desired capital is current capital multiplied by an increasing function of the expected profitability of new investment (long-run expected price minus expected unit cost, relative to price). This creates a reinforcing capacity goal adjustment loop: as long as new capacity looks profitable the goal keeps moving up, and it moves down while profits are below normal. The slope reflects risk appetite, access to finance, barriers to entry and the spread of costs and beliefs.",
      pages: "807-810",
    },
    {
      title: "Price discovery: anchor on traders' expected price, adjust for pressures",
      text: "Formulating price as a fixed equilibrium price times a demand/supply effect fails as soon as costs shift or inflation runs, and it assumes traders know the market-clearing price. A more robust formulation (Sterman 2000) anchors price on <b>traders' expected price</b> and multiplies it by effects of inventory coverage and of costs. The anchor then adjusts to actual price (but never below expected variable cost), so price keeps rising while stocks are short and falling while they are in surplus. Traders thus find the clearing price without knowing the supply and demand curves.",
      pages: "813-817",
    },
    {
      title: "Measure the demand/supply balance with a robust indicator",
      text: "Prices respond to perceived inventory coverage relative to a reference, through a power function with a negative exponent. Utilisation and delivery delay are poor measures: utilisation saturates at its maximum, so it cannot distinguish 5% from 500% excess demand, and delivery delay cannot fall below the minimum processing time, so it cannot tell double from tenfold surplus inventory. In a firm, schedule pressure (desired production over capacity) or a queue of orders plays the role of coverage.",
      pages: "816-817",
    },
    {
      title: "Price behaviour depends on which loop dominates",
      text: "If inventory is normal, price and its anchor converge on expected cost with time constant T/S (adjustment time over sensitivity to costs): with 1 year and 0.5, two years. If costs are ignored, any shortage keeps pulling the anchor upward and price grows exponentially until the shortage ends, after which it stays at the new level. With both effects, small shortages are offset by the cost pressure loop and price settles higher; a large enough shortage overwhelms it and price runs away, the pattern of speculative episodes such as the late-1970s silver bubble. In control terms, the inventory effect is integral control and the cost effect proportional control.",
      pages: "818-822",
    },
    {
      title: "Evidence supports adaptive price anchors",
      text: "Hog prices respond both to the supply balance and to the hog/corn ratio. In experimental double auctions, traders' expectations adapted to past prices and rejected rational expectations, and foreign exchange expectations mixed adaptation to recent rates with slow regression to fundamentals. Hines applied the same formulation to interest rates from 1959 to 1980, estimating a sensitivity to free reserves of about −4 and a 1.4-year time constant for the expected equilibrium rate.",
      pages: "822-824",
    },
    {
      title: "Why arbitrage and learning do not remove cycles",
      text: "If cycles were obvious, investors could buy in troughs and sell in peaks until the cycle disappeared. Yet cycles in copper, cattle, rubber and real estate have lasted a century or more. Long capacity delays, many competing producers who each treat the market as given, incentives that reward short-term results, the difficulty of separating signal from noise, and generations of managers who have never seen a full cycle all slow learning. Prices balance supply and demand through negative loops, and delayed negative loops oscillate.",
      pages: "840-841",
    },
  ],
  diagrams: [
    {
      kind: "cld",
      title: "Price balances a commodity market through delayed loops",
      pages: "798-800",
      cld: {
        size: [700, 345],
        vars: [
          { id: "dem", label: "Demand", x: 90, y: 60 },
          { id: "cov", label: "Inventory coverage", x: 330, y: 60 },
          { id: "prod", label: "Production", x: 570, y: 60 },
          { id: "pr", label: "Price", x: 250, y: 175 },
          { id: "util", label: "Capacity utilisation", x: 440, y: 175 },
          { id: "dcap", label: "Desired capacity", x: 330, y: 290 },
          { id: "cap", label: "Capacity", x: 620, y: 290 },
        ],
        links: [
          { from: "pr", to: "dem", sign: "−" },
          { from: "dem", to: "cov", sign: "−" },
          { from: "cov", to: "pr", sign: "−" },
          { from: "pr", to: "util", sign: "+" },
          { from: "util", to: "prod", sign: "+" },
          { from: "prod", to: "cov", sign: "+" },
          { from: "pr", to: "dcap", sign: "+" },
          { from: "dcap", to: "cap", sign: "+", curve: -45, note: "long delay" },
          { from: "cap", to: "dcap", sign: "+", curve: -45 },
          { from: "cap", to: "prod", sign: "+" },
        ],
        loops: [
          { type: "B", label: "B1", x: 215, y: 95 },
          { type: "B", label: "B2", x: 400, y: 118 },
          { type: "B", label: "B3", x: 425, y: 232 },
          { type: "R", label: "R1", x: 490, y: 290 },
        ],
        caption:
          '<span class="chip chipB">B1</span> substitution: high prices cut demand. <span class="chip chipB">B2</span> utilisation: high prices bring idle capacity into use. <span class="chip chipB">B3</span> capacity acquisition: sustained high prices raise desired capacity, which is built after years. <span class="chip chipR">R1</span> capacity goal adjustment: desired capital is anchored on current capital, so it keeps climbing while investment looks profitable. Price itself rises when coverage is low; expectations of price and cost sit on the links into utilisation and desired capacity.',
      },
    },
    {
      kind: "cld",
      title: "Price setting by anchoring and adjustment",
      pages: "815-822",
      cld: {
        size: [620, 300],
        vars: [
          { id: "tep", label: "Traders' expected price", x: 170, y: 160 },
          { id: "pr", label: "Price", x: 470, y: 160 },
          { id: "cov", label: "Perceived inventory coverage", x: 470, y: 45 },
          { id: "ec", label: "Effect of costs on price", x: 400, y: 265 },
          { id: "cost", label: "Expected production costs", x: 130, y: 265 },
        ],
        links: [
          { from: "tep", to: "pr", sign: "+", curve: -50 },
          { from: "pr", to: "tep", sign: "+", curve: -50 },
          { from: "tep", to: "ec", sign: "−" },
          { from: "ec", to: "pr", sign: "+" },
          { from: "cost", to: "ec", sign: "+" },
          { from: "cov", to: "pr", sign: "−" },
        ],
        loops: [
          { type: "R", label: "R1", x: 320, y: 160 },
          { type: "B", label: "B1", x: 390, y: 215 },
        ],
        caption:
          '<span class="chip chipR">R1</span> price adjustment: price is set relative to the anchor, and the anchor drifts toward price, so a persistent shortage ratchets both upward. <span class="chip chipB">B1</span> cost pressure: as the anchor rises above expected costs, the cost effect pulls price back. Low <b>perceived inventory coverage</b> pushes price above the anchor. The anchor cannot fall below expected variable cost.',
      },
    },
    {
      kind: "sequence",
      title: "Building the generic commodity model",
      pages: "801-817",
      steps: [
        { label: "Production and inventory", detail: "WIP and finished stock; shipments through an order fulfilment ratio." },
        { label: "Capacity utilisation", detail: "Smoothed response to the expected markup over variable cost." },
        { label: "Production capacity", detail: "Stock management with capital on order, a third-order construction delay and first-order discards." },
        { label: "Desired capacity", detail: "Current capital times an effect of expected profitability of new investment." },
        { label: "Demand", detail: "A linear demand curve set by an elasticity, reached after an adjustment delay." },
        { label: "Price setting", detail: "Traders' expected price times effects of coverage and costs, with an adaptive anchor." },
      ],
      note: "Each sector is tested in isolation (partial model tests) before the sectors are joined.",
    },
    {
      kind: "cycle",
      title: "The hog cycle and the breeding herd",
      pages: "836-840",
      nodes: [
        "Hog prices high relative to corn",
        "Farmers hold back sows to expand herds",
        "Fewer hogs to market: prices rise further",
        "Larger litters reach market about a year on",
        "Prices fall and herds are cut",
        "Sows sold off: brief glut, then shortage",
      ],
      center: "cycle of about 4 years",
      note: "As the saying quoted by Sterman (2000, p. 838) goes, \"it takes hogs to make hogs\": breeding stock comes from the same animals that would be sold, so the first response of supply to a price rise is a fall.",
    },
  ],
  formulations: [
    {
      name: "Production from capacity and utilisation",
      equations: [
        "Production starts = Production capacity × Capacity utilisation",
        "Capacity utilisation = SMOOTH(f(Expected markup), Utilisation adjustment time)",
        "Expected markup = Short-run expected price / Expected variable cost",
        "Short-run expected price = SMOOTH(Price, Time to adjust short-run expectations)",
      ],
      explain:
        "f is an S-shaped aggregate short-run supply curve that saturates at full utilisation. Only variable costs enter, because capacity is sunk for the operating decision (though the sunk cost fallacy keeps some plants running at a loss). The smoothing times should be longer the longer the production pipeline and the noisier the price.",
      molecule: "capacityUtil",
      pages: "801-805",
    },
    {
      name: "Capacity acquisition",
      equations: [
        "Capital on order(t) = ∫(Order rate − Acquisition rate) dt;  Acquisition = DELAY3(Order rate, Acquisition delay)",
        "Order rate = MAX(0, Desired acquisition + (Desired supply line − Capital on order) / Supply line adjustment time)",
        "Desired acquisition = Discards + (Desired capacity − Capacity) / Capacity adjustment time",
        "Desired supply line = Expected acquisition delay × Desired acquisition",
      ],
      explain:
        "The stock management structure (see the module Oscillation: stock management and supply chains) applied to mills, mines or ships. Discards are first order with the average life of capacity. Cancellations can be added as a separate outflow, as in the labour model earlier in this module.",
      molecule: "stockmgmt",
      pages: "805-807",
    },
    {
      name: "Desired capacity by hill climbing",
      equations: [
        "Desired capital = Capital × f(Expected profitability of new investment)",
        "Expected profitability = (Expected long-run price − Expected production costs) / Expected long-run price",
        "Expected long-run price = SMOOTH(Price, Time to adjust long-run expectations)",
      ],
      explain:
        "f equals 1 at normal profit, rises with expected profit and saturates at a maximum set by finance and the capacity to absorb new projects. Long-run expectations adjust more slowly than short-run ones, because investors must believe a price change will last until new capacity arrives.",
      pages: "807-810",
    },
    {
      name: "Demand with a lagged response to price",
      equations: [
        "Customer orders = Industry demand × Other factors",
        "Industry demand = SMOOTH(Indicated demand, Demand adjustment delay)",
        "Indicated demand = MIN(Max consumption, MAX(0, Reference demand + Slope × (Price − Reference price)))",
        "Slope = Elasticity × Reference demand / Reference price",
      ],
      explain:
        "A linear demand curve normalised by the elasticity at the reference point. Unlike a constant-elasticity curve it gives finite demand at zero price and zero demand at very high prices, so it is robust. Other factors carry noise or the business cycle.",
      molecule: "smooth",
      pages: "811-813",
    },
    {
      name: "Price setting",
      equations: [
        "Price = Traders' expected price × Effect of inventory coverage × Effect of costs",
        "Effect of inventory coverage = (Perceived coverage / Reference coverage) ^ Sensitivity   (sensitivity < 0)",
        "Effect of costs = 1 + Sensitivity to costs × (Expected costs / Traders' expected price − 1)",
        "d(Traders' expected price)/dt = (MAX(Price, Minimum price) − Traders' expected price) / Adjustment time",
      ],
      explain:
        "The anchor is a sea anchor that follows actual price. A sensitivity to costs of 0 ignores costs; 1 anchors price entirely on costs. With normal coverage the anchor approaches expected costs with time constant adjustment time / sensitivity to costs. The minimum price, expected variable cost, keeps the anchor from collapsing to zero in a glut.",
      molecule: "seaAnchorPricing",
      pages: "815-821",
    },
  ],
  cases: [
    {
      title: "Commodity cycles from aircraft to zinc",
      text: "Hog slaughter and prices cycle about every 4 years; cattle stocks every 10 to 12 years; copper prices, documented back to 1840, every 8 to 10 years around their trend. Commercial aircraft orders swing in a cycle of about 10 years, tanker spot rates every few years over a 20-year capacity cycle, and insurance underwriting has its own cycle. Spectral analysis found 10 to 14 year cycles in aluminium, copper, iron, lead, silver, tin and zinc prices alongside business cycle frequencies.",
      pages: "792-798",
    },
    {
      title: "Partial model tests of the price formulation",
      text: "With coverage at normal and expected costs doubling, price immediately rises half the cost change (sensitivity 0.5) and converges with a two-year time constant. With costs ignored, a fall in coverage to 0.8 of normal raises price 25% at once, and the anchor then climbs exponentially (past 160 from 100) until coverage recovers; a 40% surplus cuts price 29% and starts an exponential decline to the variable-cost floor. With both effects, coverage at 75% makes price settle at about double, but coverage at 48% overwhelms the cost effect and price grows without limit.",
      pages: "818-822",
    },
    {
      title: "Cycles in the pulp and paper industry",
      text: "Paper prices swing about 40% either side of their trend over a 3 to 5 year cycle, while utilisation averages about 90% and moves only between roughly 85% and 95%; detrended capacity peaked in 1975 and 1992, a Kuznets-type cycle of about 17 years. The generic model, set with a demand elasticity of about −0.5 and a 6-month demand delay, a 4-year capacity acquisition delay, a 20-year capacity life and fixed costs about 60% of the total, responds to a 25% demand pulse with a cycle of about 3.6 years in price, inventory and utilisation and about 14 years in capacity. With random demand it shows 3 to 5 and 12 to 20 year cycles; inventory and prices range from about 60% to 150% of equilibrium and capacity orders from 30% to nearly 200%, matching the relative amplitudes in the data.",
      pages: "824-828",
    },
    {
      title: "Livestock: when the capital stock is the product",
      text: "In hogs and cattle, production starts are births, which depend on the breeding herd, and the herd can only grow by keeping back animals that would otherwise be sold. So a rise in expected profit first cuts supply, a short-run positive feedback that strengthens the cycle. Typical parameters: hogs have litters of 8 twice a year, about 0.31 years of gestation and 0.42 years of maturation; cattle have one calf a year, 0.83 years of gestation and 1.67 years of maturation, which helps explain why the cattle cycle is much longer than the hog cycle.",
      pages: "836-840",
    },
  ],
  exercises: [
    {
      prompt:
        "Open Capacity Utilization and compare <b>Demand &lt; capacity</b> with <b>Demand &gt; capacity</b>. In the second, read the production rate the curve allows and what happens to inventory. Why is utilisation a poor signal for price?",
      hint: "With capacity 15 and demand 25, production saturates just under 15 and inventory falls to the little that can be shipped, whatever the size of the gap.",
      answer:
        "With demand 15 and capacity 25, production settles at 15 and inventory near 92, with spare capacity. With demand 25 and capacity 15, production saturates at about 14.9, just under capacity, and inventory falls to about 15 by week 5 and stays there, so sales are held to production and about 10 units a week of demand go unmet. Utilisation tops out near its maximum whether demand is 16 or 40: once the plant is flat out, utilisation stops changing and carries no information about how large the excess demand is. Inventory coverage, backlog or delivery delay keep moving with the size of the gap, so they are the signals that should drive price.",
      link: { label: "Open capacity utilisation", hash: "/m/capacityUtil" },
    },
    {
      prompt:
        "In Sea Anchor Pricing, run <b>Shortage (price climbs)</b>, <b>Neutral</b> and <b>Glut (decays toward 0)</b>. Then repeat the shortage with time to change the underlying price set to 12 years. Which loop from the price-setting diagram is acting alone here, and what is missing that would stop the climb?",
      hint: "Only the reinforcing price adjustment loop is present; there is no cost pressure, so the shortage keeps pushing the anchor up (to about 20 after 20 years at 4 years, about 13 at 12 years).",
      answer:
        "Shortage (inventory 75 of 100) lifts price above the anchor, the anchor follows, and the underlying price climbs without limit: about 14.3 after 10 years and 20.4 after 20. Neutral stays at 10. Glut decays toward 0: about 6.1 after 10 years and 3.7 after 20. With a 12-year anchor time the shortage still drives price up, only more slowly, to about 11.3 at year 10 and 12.7 at year 20. Only the reinforcing price adjustment loop (price → anchor → price, the inventory effect acting as integral control) is present. What is missing is the balancing feedback that would stop the climb: higher prices cutting demand and raising supply until inventory returns to target, and the cost effect pulling price back toward expected costs.",
      link: { label: "Open sea anchor pricing", hash: "/m/seaAnchorPricing" },
    },
    {
      prompt:
        "Open Protected Sea Anchor Pricing and compare <b>Glut with $6 floor</b> and <b>Glut, no floor</b>. Relate the floor to the minimum price (expected variable cost) in the formulation of Sterman (2000).",
      answer:
        "Glut with $6 floor: the underlying price falls from 10 to about 6.9 by year 10 and settles at the $6 floor, so the posted price (0.8 × the anchor under the glut) settles at 4.80. Glut, no floor: the anchor keeps falling, to about 4.5 by year 20 and 2.0 by year 40. The floor plays the role of the minimum price in Sterman's formulation, where the anchor cannot fall below expected variable cost: no producer will keep selling for long below the cost of making the next unit. It is a protective first-order limit that stops the sea anchor drifting to zero, just as costs, not inventory, set the long-run floor under prices.",
      link: { label: "Open protected sea anchor", hash: "/m/protSeaAnchorPricing" },
    },
    {
      prompt:
        "In Smooth Pricing, run <b>Demand shock</b> (pressure 1.4, adjustment time 4) and then <b>Sticky (slow)</b>. How long does price take to cover about two thirds of the move in each? Compare this goal-seeking adjustment with the open-ended drift of the sea anchor.",
      answer:
        "Demand shock (adjustment time 4) moves price from 10 toward 14; it covers two thirds of the move (to about 12.7) after about 4 years and is near 14 by year 12. Sticky (adjustment time 10) covers the same two thirds only after about 10 years. In both cases this is goal seeking: price closes about 63% of the gap in one adjustment time and then settles at a fixed new level, 14, because the indicated price does not move with price. The sea anchor is different: there the target is a multiple of the anchor itself, so a constant pressure keeps the price drifting without limit. Proportional adjustment settles; an anchor that chases its own adjusted value never does.",
      link: { label: "Open smooth pricing", hash: "/m/smoothPricing" },
    },
    {
      prompt:
        "Play the hog cycle case. Compare <b>Producers ignore the pipeline</b> with <b>Producers count hogs on the way</b>, then try <b>Longer biological lag (12 months)</b> and <b>Short lag (5 months)</b>. How does the lag change the period? Why is the real hog cycle (about 4 years) so much longer than twice the 11-month breeding lag?",
      answer:
        "Producers ignore the pipeline (10-month breeding and fattening lag): hogs ready for market peak at about 114 at month 21, then near 102 at month 63, a cycle of about 42 months. Counting hogs on the way removes the cycle: supply rises smoothly to 100. With a 12-month lag the peak is about 116 and the period about 45 months; with a 5-month lag the peak is about 109 and the period about 31 months. A longer lag means a longer period and bigger swings. The cycle is much longer than twice the lag because the period depends on all the delays in the loop, not only the biological one: producers also take months to perceive prices and adjust breeding herds (the 4-month response time here), and ignoring the pipeline makes them keep adding for a long time, so a 10 to 11 month lag yields a cycle of roughly three and a half to four years.",
      link: { label: "Hog cycle case", hash: "/apps/economics/hog-cycle" },
    },
    {
      prompt:
        "Open the power plant boom and bust case and run <b>Investors ignore the construction pipeline</b> and <b>Longer construction time</b>. Which loop of the commodity market diagram does this case isolate, and which cycle in pulp and paper (short or long) does it correspond to?",
      answer:
        "Investors ignore the construction pipeline: capacity overshoots to about 106.5 GW around year 9 and the cycle has a period of roughly 19 years, with a dip to about 98 near year 19. Longer construction time (8 years): capacity overshoots to about 109 near year 13, with an even longer period. This case isolates the capacity acquisition loop of the commodity market diagram, the loop through investment, capacity under construction and capacity coming on line, without the short-run utilisation and inventory loop. It corresponds to the long cycle in pulp and paper, the 12 to 20 year capacity cycle, not the roughly four-year utilisation cycle.",
      link: { label: "Power plant cycles", hash: "/apps/environment/power-plant-cycles" },
    },
    {
      prompt:
        "Explore the price anchoring and the sticky prices cases. For each, decide whether it behaves more like the inventory effect (integral control: keeps moving while the gap lasts) or the cost effect (proportional control: settles at a new level).",
      answer:
        "Price anchoring behaves like the inventory effect (integral control): with a shortage of inventory 75 of 100, the anchor keeps rising as long as the gap lasts, from 10 to about 14.3 after 10 years and 20.4 after 20, and a glut keeps pushing it down. Sticky prices behaves like the cost effect (proportional control): a 40% cost shock moves price from 10 to a new level of 14 (about 12.5 after 6 months and 13.9 after 24), and a demand slump moves it to a new level of 7. The test is simple: integral control keeps moving while any gap remains and only stops when the gap is closed; proportional control settles at a new level determined by the size of the pressure.",
      link: { label: "Price anchoring case", hash: "/apps/economics/price-anchoring" },
    },
    {
      prompt:
        "Pen and paper: rank coffee, commercial real estate, copper, hog farming, oil, pulp and paper and shipbuilding by how strongly you think desired capacity responds to expected profit. Justify each with information, finance, entry barriers and the spread of producer costs.",
      answer:
        "There is no single correct ranking. A defensible one, from strongest to weakest response of desired capacity to expected profit: commercial real estate and hog farming (many small, easily financed entrants, low entry barriers, fast reaction to profit signals and poor information about others' plans), then shipbuilding and coffee (shipping profits drive orders strongly, coffee planting responds to prices but trees take years and growers are many and dispersed), then pulp and paper and copper (large, lumpy, capital-intensive plants, concentrated producers with more information, but still strong investment waves), then oil (very high costs and long lead times, plus cartel and government control that blunt the response). Justify each with four factors: how good information on industry-wide capacity is, how easy finance is, how high entry barriers are, and how wide the spread of producer costs is (a wide spread means price falls drive out high-cost producers and mute the response).",
    },
  ],
  pitfalls: [
    "Blaming commodity cycles on cyclical demand when the periods differ by industry and are not tied to the business cycle.",
    "Using the cobweb model for policy: it lacks stocks and capacity, runs in discrete time and gets the period wrong.",
    "Assuming producers know the equilibrium capacity or the market-clearing price; model how they search for it.",
    "Setting price as a fixed equilibrium price times a pressure effect, which cannot follow cost changes or inflation.",
    "Measuring the demand/supply balance with utilisation or delivery delay, both of which saturate.",
    "Using a constant-elasticity demand curve, which gives infinite demand at zero price.",
    "Expecting arbitrage and learning to eliminate cycles quickly when delays are long and each producer treats the market as given.",
  ],
  molecules: ["capacityUtil", "smoothPricing", "seaAnchorPricing", "protSeaAnchorPricing", "stockmgmt", "smooth", "material"],
};
