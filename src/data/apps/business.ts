// Business, operations and supply-chain case library.
// Every reference below was checked against Crossref, OpenAlex or a publisher or catalogue record (Oct 2026);
// findings quote the abstract or full text.
import type { AppCase, DataSource, Domain, Ref } from "@/data/apps/types";
import type { Model } from "@/data/molecules";
import type { FlowMeta } from "@/data/diagramMeta";
import { built, skins, type Skin } from "@/data/apps/sim";

const C = { acc: "#2545ff", acc2: "#d9480f", good: "#0f8a5f", pink: "#c2255c" };

// ---------------------------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------------------------

// A new durable product: Bass adoption drives first purchases, owners replace their units, and the firm
// sizes production capacity to a short-term forecast of sales through a construction delay.
const PRODUCT_LIFE = 10; // years before an owner replaces the unit
const CAP_LIFE = 15; // years a production line lasts
const CAP_ADJ = 1; // years to close a capacity gap
const FCST = 0.5; // years to update the sales forecast
const boomBust: Model = {
  name: "New-product boom and bust",
  title: "Diffusion of a durable product with a capacity delay",
  timeUnit: "yr",
  unitY: "thousand units",
  lede: "Word of mouth drives sales of a new durable up fast, then saturation brings them down to replacement demand. Capacity ordered at the peak keeps arriving after it.",
  stocks: [
    { id: "pot", label: "Potential buyers", init: 990, scale: 1000, color: C.acc2 },
    { id: "own", label: "Owners", init: 10, scale: 1000, color: C.good },
    { id: "onOrder", label: "Capacity on order", init: 2.3, scale: 400, color: C.pink },
    { id: "cap", label: "Capacity (units/yr)", init: 17, scale: 400, color: C.acc },
    { id: "dem", label: "Forecast sales (units/yr)", init: 17, scale: 400, color: C.acc2 },
  ],
  params: [
    { id: "p", label: "Advertising effect p", min: 0, max: 5, step: 0.1, value: 1, unit: "%/yr" },
    { id: "q", label: "Word of mouth q", min: 0, max: 100, step: 1, value: 60, unit: "%/yr" },
    { id: "acq", label: "Capacity lead time", min: 0.5, max: 5, step: 0.25, value: 2, unit: "yr" },
    { id: "slw", label: "Counts capacity on order", min: 0, max: 1, step: 0.05, value: 0, unit: "" },
  ],
  rates: (s, p) => {
    const N = s.pot + s.own;
    const adopt = (p.p / 100 + (p.q / 100) * (s.own / N)) * s.pot;
    const sales = adopt + s.own / PRODUCT_LIFE;
    const retire = s.cap / CAP_LIFE;
    const order = Math.max(0, retire + (s.dem - s.cap) / CAP_ADJ + ((s.dem / CAP_LIFE) * p.acq - p.slw * s.onOrder) / CAP_ADJ);
    return { adopt, sales, order, arrive: s.onOrder / p.acq, retire };
  },
  derivs: (s, _p, r) => ({ pot: -r.adopt, own: r.adopt, onOrder: r.order - r.arrive, cap: r.arrive - r.retire, dem: (r.sales - s.dem) / FCST }),
  diagram: {
    stocks: {
      pot: { x: 40, y: 80, w: 100, h: 100 },
      own: { x: 230, y: 80, w: 100, h: 100 },
      onOrder: { x: 470, y: 80, w: 100, h: 100 },
      cap: { x: 660, y: 80, w: 100, h: 100 },
    },
    flows: [
      { id: "adopt", pts: [[140, 130], [230, 130]], from: "pot", to: "own", max: 200, color: C.good },
      { id: "order", pts: [[385, 130], [470, 130]], to: "onOrder", max: 300 },
      { id: "arrive", pts: [[570, 130], [660, 130]], from: "onOrder", to: "cap", max: 300 },
      { id: "retire", pts: [[710, 180], [710, 240], [800, 240]], from: "cap", max: 100, color: C.pink },
    ],
  },
  cld: {
    vars: [
      { id: "pot", label: "Potential buyers", x: 80, y: 40 },
      { id: "ad", label: "Adoption", x: 175, y: 135 },
      { id: "own", label: "Owners", x: 80, y: 230 },
      { id: "dem", label: "Sales forecast", x: 330, y: 40 },
      { id: "ord", label: "Capacity orders", x: 400, y: 135 },
      { id: "on", label: "On order", x: 460, y: 230 },
      { id: "cap", label: "Capacity", x: 300, y: 230 },
    ],
    links: [
      { from: "own", to: "ad", sign: "+", curve: -25 },
      { from: "ad", to: "own", sign: "+", curve: -25 },
      { from: "pot", to: "ad", sign: "+", curve: 25 },
      { from: "ad", to: "pot", sign: "−", curve: 25 },
      { from: "ad", to: "dem", sign: "+", curve: -20 },
      { from: "dem", to: "ord", sign: "+", curve: -20 },
      { from: "ord", to: "on", sign: "+", curve: -25 },
      { from: "on", to: "ord", sign: "−", curve: -25 },
      { from: "on", to: "cap", sign: "+", curve: 0 },
      { from: "cap", to: "ord", sign: "−", curve: 0 },
    ],
    loops: [
      { type: "R", label: "R1", x: 90, y: 180 },
      { type: "B", label: "B1", x: 90, y: 95 },
      { type: "B", label: "B2", x: 480, y: 180 },
      { type: "B", label: "B3", x: 380, y: 190 },
    ],
    caption:
      '<span class="chip chipR">R1</span> Owners tell others, so adoption feeds itself. <span class="chip chipB">B1</span> Each adoption uses up a potential buyer, so sales peak and fall back to replacement demand. <span class="chip chipB">B2 B3</span> The firm orders capacity to close the gap between forecast sales and capacity, but new lines take years to arrive. If it does not count what is already <b>on order</b>, capacity keeps arriving after sales have peaked.',
  },
  desc: "",
};

const flowMeta: Record<string, Record<string, FlowMeta>> = {
  biz_boomBust: {
    adopt: { name: "adoption", eq: "(p + q × Owners / N) × Potential buyers", in: ["pot", "own", "p", "q"], loop: { pot: "B", own: "R" } },
    order: { name: "capacity orders", eq: "MAX(0, retirements + (forecast − Capacity) / 1 yr + (forecast / 15 yr × lead time − w × On order) / 1 yr)", in: ["cap", "onOrder", "acq", "slw"], loop: "B" },
    arrive: { name: "capacity arriving", eq: "Capacity on order / lead time", in: ["onOrder", "acq"], loop: "B" },
    retire: { name: "retirements", eq: "Capacity / 15 yr", in: ["cap"], loop: "B" },
  },
};
const extra = {
  biz_boomBust: {
    stocks: [
      ["Potential buyers", "INTEG(− adoption, 990)"],
      ["Owners", "INTEG(adoption, 10)"],
      ["Capacity on order", "INTEG(capacity orders − capacity arriving, 2.3)"],
      ["Capacity", "INTEG(capacity arriving − retirements, 17)"],
      ["Forecast sales", "INTEG((sales − Forecast sales) / 0.5 yr, 17)"],
    ] as [string, string][],
    aux: [
      ["sales", "adoption + Owners / 10 yr (first purchases plus replacements)"],
      ["N", "Potential buyers + Owners"],
    ] as [string, string][],
  },
};

const SKINS: Record<string, Skin> = {
  biz_bass: {
    base: "diffusion",
    name: "New-product adoption (Bass)",
    timeUnit: "yr",
    unitY: "thousand households",
    stocks: { pot: { label: "Households yet to buy" }, adopt: { label: "Households that own one" } },
    params: {
      p: { label: "Innovation p (advertising, outside influence)", unit: "%/yr", value: 3 },
      q: { label: "Imitation q (word of mouth)", unit: "%/yr", value: 38 },
    },
    flows: { adoption: ["first purchases", "(p + q × Owners / N) × Yet to buy"] },
  },
  biz_bullwhip: {
    base: "stockmgmt",
    name: "Retailer ordering and the bullwhip",
    unitY: "cases",
    stocks: { sl: { label: "Orders placed, not yet received" }, inv: { label: "Stock on hand" } },
    params: {
      demand: { label: "Customer demand", unit: "cases/wk" },
      desInv: { label: "Target stock" },
      adj: { label: "Stock adjustment time" },
      acq: { label: "Supplier lead time" },
      slw: { label: "Counts orders in transit" },
    },
    flows: {
      orders: ["orders to supplier", "demand + stock gap / τ + pipeline gap / τ"],
      acquisition: ["deliveries", "In transit / lead time"],
      sales: ["sales", "customer demand"],
    },
  },
  biz_serviceStandard: {
    base: "protectedSeaAnchor",
    name: "Eroding service standards",
    timeUnit: "wk",
    unitY: "minutes per order",
    stocks: { anchor: { label: "Service standard (min/order)", init: 100, scale: 140 }, valueDisp: { label: "Time actually spent (min/order)", init: 100, scale: 140 } },
    params: {
      pressure: { label: "Time spent ÷ standard (below 1 = cutting corners)", min: 0.5, max: 1.2, value: 0.8 },
      fundamental: { label: "External benchmark", unit: "min/order" },
      protection: { label: "Weight on the benchmark", value: 0 },
      timeToChange: { label: "Time for the standard to adjust", unit: "wk", value: 8 },
    },
    flows: { changeAnchor: ["revising the standard", "(target − Standard) / adjustment time, target = (1 − w) × time spent + w × benchmark"] },
  },
  biz_marketShare: {
    base: "marketshare",
    name: "Competing standards and lock-in",
    unitY: "thousand users",
    stocks: { a: { label: "Users of format A" }, b: { label: "Users of format B" } },
    params: {
      inflow: { label: "New users entering the market", unit: "k/mo" },
      network: { label: "Increasing returns to adoption" },
      churn: { label: "Average time a user stays", unit: "mo" },
    },
    flows: {
      toA: ["new users → A", "new users × share A"],
      toB: ["new users → B", "new users × (1 − share A)"],
      outA: ["leaving A", "A / time a user stays"],
      outB: ["leaving B", "B / time a user stays"],
    },
  },
  biz_customers: {
    base: "residence",
    name: "Customer base and churn",
    unitY: "thousand customers",
    stocks: { q: { label: "Active customers", scale: 600 } },
    params: {
      inflow: { label: "New customers acquired", unit: "k/mo" },
      tau: { label: "Average customer lifetime", min: 3, max: 60, step: 1, value: 20, unit: "mo" },
    },
    flows: { in: ["acquisition", "new customers per month"], out: ["churn", "Active customers / average lifetime"] },
  },
};

const BIZ_MODELS: Record<string, Model> = {
  biz_boomBust: built("biz_boomBust", boomBust, flowMeta.biz_boomBust, extra.biz_boomBust),
  ...skins(SKINS),
};
// where each run should stop so the interesting part fills the chart (in the model's own time unit)
const BIZ_STOP: Record<string, number> = { biz_bass: 20, biz_bullwhip: 60, biz_boomBust: 25, biz_serviceStandard: 52, biz_marketShare: 120, biz_customers: 120 };

// ---------------------------------------------------------------------------------------------
// References, cases and data
// ---------------------------------------------------------------------------------------------

const THEMES = ["Growth and markets", "Supply chains and inventory", "Capacity and investment", "Quality and improvement", "Customers and competition"] as const;

const REFS: Record<string, Ref> = {
  bass1969: { text: "Bass FM (1969). A new product growth for model consumer durables. Management Science 15(5):215-227.", doi: "10.1287/mnsc.15.5.215" },
  sterman2000: { text: "Sterman JD (2000). Business Dynamics: Systems Thinking and Modeling for a Complex World. Irwin/McGraw-Hill." },
  sterman1989: { text: "Sterman JD (1989). Modeling managerial behavior: misperceptions of feedback in a dynamic decision making experiment. Management Science 35(3):321-339.", doi: "10.1287/mnsc.35.3.321" },
  lee1997: { text: "Lee HL, Padmanabhan V, Whang S (1997). Information distortion in a supply chain: the bullwhip effect. Management Science 43(4):546-558.", doi: "10.1287/mnsc.43.4.546" },
  paich1993: { text: "Paich M, Sterman JD (1993). Boom, bust, and failures to learn in experimental markets. Management Science 39(12):1439-1458.", doi: "10.1287/mnsc.39.12.1439" },
  stermanGBF2007: { text: "Sterman JD, Henderson R, Beinhocker ED, Newman LI (2007). Getting big too fast: strategic dynamics with increasing returns and bounded rationality. Management Science 53(4):683-696.", doi: "10.1287/mnsc.1060.0673" },
  forrester1968: { text: "Forrester JW (1968). Market growth as influenced by capital investment. Industrial Management Review 9(2):83-105." },
  oliva2001: { text: "Oliva R, Sterman JD (2001). Cutting corners and working overtime: quality erosion in the service industry. Management Science 47(7):894-914.", doi: "10.1287/mnsc.47.7.894.9807" },
  repenning2002: { text: "Repenning NP, Sterman JD (2002). Capability traps and self-confirming attribution errors in the dynamics of process improvement. Administrative Science Quarterly 47(2):265-295.", doi: "10.2307/3094806" },
  repenningSterman2001: { text: "Repenning NP, Sterman JD (2001). Nobody ever gets credit for fixing problems that never happened: creating and sustaining process improvement. California Management Review 43(4):64-88.", doi: "10.2307/41166101" },
  arthur1989: { text: "Arthur WB (1989). Competing technologies, increasing returns, and lock-in by historical events. The Economic Journal 99(394):116-131.", doi: "10.2307/2234208" },
  gupta2004: { text: "Gupta S, Lehmann DR, Stuart JA (2004). Valuing customers. Journal of Marketing Research 41(1):7-18.", doi: "10.1509/jmkr.41.1.7.25084" },
};

const CASES: AppCase[] = [
  {
    id: "new-product-diffusion",
    title: "How a new product spreads: the Bass model",
    theme: "Growth and markets",
    level: "Starter",
    summary: "First purchases of a new durable come from advertising and from word of mouth, and the mix sets the shape and timing of the sales peak.",
    question: "When will sales of a new product peak, how high, and what does advertising buy compared with word of mouth?",
    sim: "biz_bass",
    presets: [
      { label: "Typical durable (p 3%, q 38%)", params: { p: 3, q: 38 } },
      { label: "Advertising only (q 0)", params: { p: 3, q: 0 } },
      { label: "Strong word of mouth (p 1%, q 40%)", params: { p: 1, q: 40 } },
      { label: "No outside push (p 0)", params: { p: 0, q: 38 } },
    ],
    map: [
      ["Stock: Households yet to buy", "The remaining market potential"],
      ["Stock: Households that own one", "Cumulative first purchases"],
      ["Flow: first purchases", "(p + q × owners / market size) × households yet to buy"],
      ["Parameter p", "Adoption driven from outside the market: advertising, media, retailers"],
      ["Parameter q", "Adoption driven by contact with owners: word of mouth, seeing the product in use"],
      ["Loop R (word of mouth)", "More owners → more first purchases → more owners"],
      ["Loop B (saturation)", "Each purchase removes a household from the remaining market"],
    ],
    molecules: ["diffusion", "logistic", "growth"],
    evidence: [
      "Bass (1969) assumes the timing of a consumer's first purchase depends on the number of previous buyers, split into innovative and imitative behaviour. Tested against data for eleven consumer durables, the model gave good predictions of the sales peak and its timing, and was used for a long-range forecast of colour television sales.",
      "Sterman (2000, ch. 9) shows that product diffusion and epidemics share one structure: a reinforcing word-of-mouth loop that hands over to a balancing saturation loop.",
    ],
    validation: "Bass (1969) fitted the model to historical sales of eleven consumer durables and reports that it predicted the sales peak and its timing well. The abstract gives no fit statistics. The small model here is checked against two exact Bass results: pure external adoption follows 1 − e^(−pt), and first purchases peak when the share of owners reaches (q − p) / 2q.",
    insight:
      "Sales peak when about half the market has bought, well before saturation, so a firm that extrapolates the steep early growth overestimates what comes next. Word of mouth makes the rise steeper and the fall sharper; advertising mostly matters at the start, before there are owners to talk.",
    tryThis: [
      "Run the typical durable. First purchases peak at about year 6, when owners reach about 460 thousand, not when the market is full.",
      "Set q to 0. Adoption now slows from the first year instead of accelerating. Compare owners at year 20 with the typical case.",
      "Set p to 0. Why does nothing happen, however strong word of mouth is?",
    ],
    data: [
      ["Market size (households or firms that could buy)", "Census household counts; industry associations; survey of purchase intent"],
      ["First-purchase sales by year", "Industry shipment data; company reports; retail panels"],
      ["Replacement and repeat sales", "Product life studies; warranty and service records"],
      ["Estimates of p and q for analogous products", "Published Bass-model meta-analyses; earlier products in the same category"],
    ],
    practice: [
      "Separate first purchases from replacements and repeat sales. The Bass model describes first purchases only, so fitting it to total sales of a product that has been on the market for years overstates the market.",
      "Estimate p and q from analogous products when a product is new. Early data alone cannot separate the two parameters well.",
      "This small model holds the market size fixed. In practice, price falls and product improvements grow the market over time.",
    ],
    checks: [
      { claim: "With no word of mouth, owners follow 1 − e^(−pt): about 451 thousand after 20 years at p = 3%", test: (run) => Math.abs(run({ p: 3, q: 0 }).end.adopt - 1000 * (1 - Math.exp(-0.6))) < 5 },
      {
        claim: "First purchases peak at t* = ln(q/p) / (p + q), when the owner share is (q − p) / 2q: about 460 thousand at year 6.2 for p 3%, q 38%",
        test: (run) => Math.abs(run({ p: 3, q: 38 }, Math.log(38 / 3) / 0.41).end.adopt - (1000 * 35) / 76) < 0.02 * 460,
      },
      { claim: "Word of mouth alone cannot start a market: with p = 0 nobody ever buys", test: (run) => run({ p: 0, q: 38 }).end.adopt < 0.001 },
    ],
    refs: ["bass1969", "sterman2000"],
    tags: ["Bass model", "diffusion", "new product", "adoption", "word of mouth", "advertising", "forecasting", "S-curve", "product launch"],
  },
  {
    id: "bullwhip",
    title: "The bullwhip effect in supply chains",
    theme: "Supply chains and inventory",
    level: "Starter",
    summary: "A retailer that reorders without counting what is already on its way overshoots its target stock and sends its supplier a swing far larger than any change in customer demand.",
    question: "Why do orders swing more the further upstream you look, and what ordering rule calms them?",
    sim: "biz_bullwhip",
    presets: [
      { label: "Counts orders in transit", params: { demand: 10, desInv: 100, adj: 4, acq: 6, slw: 1 } },
      { label: "Ignores orders in transit", params: { demand: 10, desInv: 100, adj: 4, acq: 6, slw: 0 } },
      { label: "Long lead time, partial view", params: { demand: 10, desInv: 100, adj: 4, acq: 12, slw: 0.3 } },
    ],
    map: [
      ["Stock: Orders placed, not yet received", "The supply line: what the supplier owes the retailer"],
      ["Stock: Stock on hand", "Inventory available to sell"],
      ["Flow: orders to supplier", "Expected demand + stock gap / adjustment time + pipeline gap / adjustment time"],
      ["Counts orders in transit", "How much of the supply line the ordering rule takes into account (1 = all of it)"],
      ["Upstream amplification", "The supply line is orders waiting for delivery, so its swings are the swings the supplier sees"],
    ],
    molecules: ["stockmgmt", "lowVisPipeline", "material", "smooth"],
    evidence: [
      "Sterman (1989), the Beer Game: subjects managing a simulated four-stage distribution chain produced oscillation and amplification. An anchoring-and-adjustment ordering rule explained their decisions well, and the estimates showed they were insensitive to the feedback from their own orders, especially the supply line.",
      "Lee, Padmanabhan and Whang (1997) show that orders passed up a supply chain distort demand information: the variance of orders can exceed that of sales, and the distortion grows as one moves upstream. They analyse four causes: demand signal processing, rationing games, order batching and price variations.",
    ],
    validation: "Sterman (1989) ran a laboratory experiment and estimated the ordering rule econometrically; the rule explained subjects' behaviour well. Lee et al. (1997) is an analytical study of the four causes; the abstract reports no empirical test.",
    insight:
      "Ignoring what is already on order is the same as counting each shortfall twice, so the retailer over-orders, overshoots and then cuts orders sharply. The supplier sees a swing several times larger than the retailer's own problem, even though customer demand never changed.",
    tryThis: [
      "Compare the first two presets. How far above the target of 100 does stock go when orders in transit are ignored?",
      "With orders in transit ignored, raise the stock adjustment time from 4 to 10 weeks. The peak is lower, but where does stock end up, and why?",
      "Try the long lead time preset. Then move the weight on orders in transit up to 1 and watch the swing disappear.",
    ],
    data: [
      ["Point-of-sale demand", "Retail scanner data; company sales records"],
      ["Orders placed at each tier", "Purchase order history; EDI records"],
      ["Lead times and their spread", "Supplier delivery records"],
      ["Inventory at each tier", "Warehouse and store stock records; US Census Manufacturing and Trade Inventories and Sales"],
    ],
    practice: [
      "Model each tier as its own stock management structure, with its own supply line. The bullwhip grows tier by tier.",
      "This small model starts the retailer 40 cases below target with steady demand. Lee et al. stress other causes too, such as batching and price promotions, which this model leaves out.",
      "Measure amplification as the ratio of the variance of orders to the variance of sales at each tier.",
      "In this molecule the weight scales only the supply line the rule sees, not the pipeline it wants. With the weight at 0 the rule keeps asking for a full pipeline that it never sees arrive, so stock settles above target by the normal pipeline (demand × lead time = 60 cases), on top of the overshoot.",
    ],
    checks: [
      { claim: "Ignoring orders in transit drives stock more than 50% above target, while counting them never overshoots by more than 1%", test: (run) => run({ slw: 0 }).max.inv > 150 && run({ slw: 1 }).max.inv < 101 },
      { claim: "When the rule counts orders in transit, stock settles on the target of 100", test: (run) => Math.abs(run({ slw: 1 }).end.inv - 100) < 1 },
      { claim: "Ignoring orders in transit leaves stock settled at target + demand × lead time = 160 cases", test: (run) => Math.abs(run({ slw: 0 }, 200).end.inv - 160) < 1 },
      { claim: "Ignoring orders in transit makes the supply line rise more than three times as far above its normal level of 60", test: (run) => run({ slw: 0 }).max.sl - 60 > 3 * (run({ slw: 1 }).max.sl - 60) },
    ],
    refs: ["sterman1989", "lee1997"],
    tags: ["bullwhip", "supply chain", "beer game", "inventory", "ordering", "supply line", "oscillation", "retail", "distribution"],
  },
  {
    id: "boom-bust",
    title: "Boom and bust when capacity lags demand",
    theme: "Capacity and investment",
    level: "Intermediate",
    summary: "Fast word of mouth sends sales of a new durable up quickly, the firm orders capacity to match, and the new lines arrive after sales have already peaked.",
    question: "How much capacity should a firm build for a fast-growing new product, and how does the speed of the market change the answer?",
    sim: "biz_boomBust",
    presets: [
      { label: "Fast market, ignores capacity on order", params: { p: 1, q: 60, acq: 2, slw: 0 } },
      { label: "Fast market, counts capacity on order", params: { p: 1, q: 60, acq: 2, slw: 1 } },
      { label: "Slow market (q 20%)", params: { p: 1, q: 20, acq: 2, slw: 0 } },
      { label: "Long construction delay (4 years)", params: { p: 1, q: 60, acq: 4, slw: 0 } },
    ],
    map: [
      ["Stocks: Potential buyers, Owners", "Bass diffusion of first purchases"],
      ["Sales", "First purchases + replacements (owners replace every 10 years)"],
      ["Stock: Forecast sales", "Sales smoothed over half a year, used to size capacity"],
      ["Stock: Capacity on order", "Production lines ordered but not yet running"],
      ["Stock: Capacity", "Production lines in use; each lasts 15 years"],
      ["Counts capacity on order", "How much of the construction pipeline the investment rule takes into account"],
    ],
    molecules: ["diffusion", "stockmgmt", "smooth", "capacityUtil"],
    evidence: [
      "Paich and Sterman (1993) ran a management flight simulator of a new-product market. Word of mouth, marketing and learning-curve effects fuelled rapid growth that often ended in overcapacity. Performance was poor relative to potential and much worse when feedback complexity was high. Repeated trials improved average performance, but did not reduce the harm from feedback complexity or teach subjects the dynamics.",
      "Sterman, Henderson, Beinhocker and Newman (2007) simulated a duopoly with increasing returns. When the industry moves slowly compared with capacity adjustment delays, boundedly rational firms reach the equilibria standard models predict. When market dynamics are fast relative to capacity adjustment, forecasting errors lead to excess capacity that can overwhelm the advantage of getting big fast.",
    ],
    validation: "Paich and Sterman (1993) used a controlled experiment with repeated trials and estimated models of subjects' decision rules from their choices. Sterman et al. (2007) is a simulation study of a duopoly; the abstract reports no calibration to industry data.",
    insight:
      "Sales of a durable peak when about half the market owns one and then fall to replacement demand. A firm that orders capacity to match current sales, through a delay, is still adding lines when sales turn down. The faster the market, the bigger the overshoot, because the peak arrives within the construction delay.",
    tryThis: [
      "Run the fast market preset. When does capacity peak compared with forecast sales, and how much of it is idle at year 25?",
      "Set Counts capacity on order to 1. The peak falls, but is there still excess capacity after the boom?",
      "Run the slow market preset. Why is the overshoot smaller in proportion, even though the investment rule is the same?",
    ],
    data: [
      ["Market potential and early adoption", "Market research; diffusion of analogous products"],
      ["Capacity under construction and lead times", "Capital project records; industry capacity surveys"],
      ["Capacity and utilisation", "Federal Reserve G.17 Industrial Production and Capacity Utilization; company reports"],
      ["Product life and replacement rates", "Warranty and service data; household surveys"],
    ],
    practice: [
      "Forecast first purchases and replacements separately. The fall from the first-purchase peak to replacement demand is what strands capacity.",
      "This model sizes capacity to recent sales with no price response and no competitors. Paich and Sterman's market also had pricing and learning-curve effects, and Sterman et al. model two firms; both add more ways to overshoot.",
      "Even with the supply line counted, a rule that chases current sales will overbuild for a product whose sales are about to fall. Test investment rules that look at the remaining market, not only at current sales.",
    ],
    checks: [
      { claim: "In a fast market, ignoring capacity on order builds peak capacity more than 25% above peak forecast sales", test: (run) => { const r = run({ q: 60, acq: 2, slw: 0 }); return r.max.cap > 1.25 * r.max.dem; } },
      { claim: "Capacity peaks more than two years after forecast sales do", test: (run) => { const r = run({ q: 60, acq: 2, slw: 0 }); return r.tMax.cap > r.tMax.dem + 2; } },
      {
        claim: "A slower market overshoots less in proportion with the same investment rule",
        test: (run) => { const fast = run({ q: 60, slw: 0 }), slow = run({ q: 20, slw: 0 }); return slow.max.cap / slow.max.dem < fast.max.cap / fast.max.dem; },
      },
      { claim: "Counting capacity on order lowers peak capacity", test: (run) => run({ slw: 1 }).max.cap < run({ slw: 0 }).max.cap },
    ],
    refs: ["paich1993", "stermanGBF2007"],
    tags: ["boom and bust", "capacity", "investment", "new product", "overcapacity", "forecasting", "management flight simulator", "get big fast"],
  },
  {
    id: "market-growth",
    title: "Growth stalled by capacity investment",
    theme: "Capacity and investment",
    level: "Advanced",
    summary: "A firm whose sales force sells faster than it adds capacity lets delivery delay rise, which slows sales and makes further investment look unnecessary.",
    question: "Why does a firm's growth level off while demand in its market keeps rising?",
    map: [
      ["Stock: Salespeople", "Hired from the revenue that bookings bring in: a reinforcing growth loop"],
      ["Stock: Order backlog", "Orders booked and not yet delivered"],
      ["Stock: Production capacity", "Added through a long acquisition delay, when the firm judges delivery delay too long"],
      ["Delivery delay", "Backlog / shipments; customers order less when it rises"],
      ["Loop B (delivery delay)", "More orders → longer delivery delay → less attractive product → fewer orders"],
      ["Capacity decision", "Expansion is triggered when delivery delay exceeds the firm's goal for it"],
    ],
    molecules: ["backlogFlow", "stockmgmt", "workforce", "effectFunction", "seaAnchor"],
    evidence: [
      "Forrester (1968) models a firm with a sales force, customers who react to delivery delay, and expansion of production capacity. It addresses the common pattern in which early sales grow rapidly and then level off while market demand continues to rise, and locates one cause in the firm's own capital investment policy.",
    ],
    validation: "Forrester (1968) is a theoretical simulation study; we could not access its full text to report any comparison with company data.",
    insight:
      "The limit to growth sits inside the firm. Delivery delay rises when capacity falls behind, customers turn away, and the drop in orders makes the delay look acceptable again, so the signal to invest can stay too weak to restart growth.",
    tryThis: [
      "Open Backlog Protected by Flow and set the order rate above shipping capacity. Watch delivery delay (backlog / shipping) rise.",
      "Sketch the causal loop diagram: salespeople → orders → backlog → delivery delay → orders, and delivery delay → capacity orders → capacity → shipments. Mark each loop B or R.",
      "Which loop dominates if the firm judges delivery delay against a goal that drifts toward what it has recently achieved?",
    ],
    data: [
      ["Bookings, backlog and shipments", "Order management systems; US Census Manufacturers' Shipments, Inventories and Orders"],
      ["Delivery or lead time quoted and achieved", "Sales operations records; customer surveys"],
      ["Capacity and capital spending", "Fixed asset registers; capital budgets"],
      ["Sales force size and productivity", "HR and CRM records"],
    ],
    practice: [
      "Measure delivery delay as backlog divided by shipments and check that it moves before orders do.",
      "Model the capacity goal explicitly. A goal anchored on past performance is the usual reason the firm never invests.",
      "Combine the Backlog Protected by Flow, Stock Management and Sea Anchor molecules: each supplies one of the loops in Forrester's model.",
    ],
    refs: ["forrester1968"],
    tags: ["market growth", "capacity", "investment", "delivery delay", "backlog", "sales force", "limits to growth", "Forrester"],
  },
  {
    id: "service-quality",
    title: "Service quality erosion: cutting corners",
    theme: "Quality and improvement",
    level: "Intermediate",
    summary: "Staff under pressure spend less time per customer, the standard drifts down to match what they actually do, and a temporary squeeze becomes a permanent drop in service.",
    question: "Why does service quality fall and stay down after a busy period, and what holds the standard in place?",
    sim: "biz_serviceStandard",
    presets: [
      { label: "Cutting corners, no external benchmark", params: { pressure: 0.8, fundamental: 100, protection: 0, timeToChange: 8 } },
      { label: "Held half to an external benchmark", params: { pressure: 0.8, fundamental: 100, protection: 0.5, timeToChange: 8 } },
      { label: "Enough time to serve properly", params: { pressure: 1, fundamental: 100, protection: 0, timeToChange: 8 } },
      { label: "Mild pressure, slow drift", params: { pressure: 0.95, fundamental: 100, protection: 0, timeToChange: 16 } },
    ],
    map: [
      ["Stock: Service standard", "Minutes the organisation considers right for one customer order"],
      ["Time actually spent", "Standard × (time spent ÷ standard); below the standard when staff cut corners"],
      ["Flow: revising the standard", "The standard moves toward recent practice, and toward the external benchmark in proportion to its weight"],
      ["Weight on the benchmark", "How strongly the standard is tied to something outside recent performance: customer research, audits, a published service level"],
      ["Loop R (eroding goals)", "Less time spent → lower standard → less time spent"],
    ],
    molecules: ["protectedSeaAnchor", "seaAnchor", "backlogFlow", "overtime"],
    evidence: [
      "Oliva and Sterman (2001) note that the American Customer Satisfaction Index for services fell to 69.4% in 2000, 5 percentage points below 1994. Their model of a UK bank's consumer-lending service centre shows that temporary imbalances between capacity and demand interact with decision rules for effort, capacity, overtime and quality aspirations to produce permanent erosion of service standards and lost revenue.",
    ],
    validation: "Oliva and Sterman (2001) calibrated their model for one consumer-lending service centre using econometric estimation, interviews, observations and archival data.",
    insight:
      "When the standard is set by looking at what staff have recently done, every period of cutting corners lowers the bar for the next. Tying the standard to something outside recent performance stops the slide; restoring capacity alone does not bring the old standard back.",
    tryThis: [
      "Run the first preset for 52 weeks, then set time spent ÷ standard back to 1. Does the standard recover?",
      "Run the benchmark preset. Where does the standard settle, and how does that compare with the formula 0.5 × 100 / (1 − 0.5 × 0.8)?",
      "Run mild pressure, slow drift. A 5% shortfall seems small; how far has the standard fallen after a year?",
    ],
    data: [
      ["Time spent per transaction", "Workflow and case management systems; time-and-motion samples"],
      ["Service standards and how they were set", "Operations manuals; interviews with managers"],
      ["Customer satisfaction", "American Customer Satisfaction Index; company surveys"],
      ["Workload, staffing and overtime", "Rosters; HR records; US BLS Job Openings and Labor Turnover Survey for sector turnover"],
    ],
    practice: [
      "This small model fixes the pressure to cut corners. In Oliva and Sterman's model it comes from the backlog, and overtime and staffing decisions feed back on it; build that with the Backlog and Overtime molecules.",
      "Ask how the service standard is set. If managers revise it from recent averages, the eroding-goals loop is present.",
      "Treat quality as hard to observe. Throughput is measured daily; quality often only shows up later in complaints and lost customers, which is why the bias toward cutting corners persists.",
    ],
    checks: [
      { claim: "With no external benchmark, a year of spending 20% less time lets the standard fall below half its starting level", test: (run) => run({ pressure: 0.8, protection: 0 }).end.anchor < 50 },
      {
        claim: "Held half to a benchmark of 100, the standard settles at 0.5 × 100 / (1 − 0.5 × 0.8) ≈ 83 minutes",
        test: (run) => Math.abs(run({ pressure: 0.8, protection: 0.5, fundamental: 100 }, 150).end.anchor - 50 / 0.6) < 0.5,
      },
      { claim: "When staff have time to serve properly the standard does not move", test: (run) => Math.abs(run({ pressure: 1, protection: 0 }).end.anchor - 100) < 0.01 },
    ],
    refs: ["oliva2001"],
    tags: ["service quality", "eroding goals", "cutting corners", "overtime", "bank", "call centre", "service standards", "customer satisfaction"],
  },
  {
    id: "capability-trap",
    title: "Capability traps in process improvement",
    theme: "Quality and improvement",
    level: "Advanced",
    summary: "Managers who meet a performance gap by having people work harder take time from improvement, so capability erodes and the gap grows.",
    question: "Why do most process improvement programmes fail to last, even when the tools work?",
    map: [
      ["Stock: Process capability", "Built by time spent on improvement, eroded steadily if nobody maintains it"],
      ["Work harder (balancing loop)", "Performance gap → more pressure to produce → more output now"],
      ["Work smarter (balancing loop)", "Performance gap → time for improvement → capability → output, after a long delay"],
      ["Reinforcing trap", "Time pulled into production → capability erodes → bigger gap → more time pulled into production"],
      ["Attribution", "Managers who see the gap as a people problem push harder; workers' cutting back on improvement then appears to confirm it"],
    ],
    molecules: ["decay", "propSplit", "smooth", "effectFunction"],
    evidence: [
      "Repenning and Sterman (2002), an inductive study of one firm's attempt to improve two core processes: success depended on how managers' attributions about the cause of poor performance interacted with the physical structure of work, especially the delay between investing in improvement and seeing the rewards. Their model shows how these can coevolve into conflict, mistrust and control structures that prevent useful change.",
      "Repenning and Sterman (2001) argue that the failure of most improvement efforts (lean production, TQM, stage-gate development and others) has little to do with the technique, and much to do with how the effort interacts with the physical, economic, social and psychological structures where it is implemented.",
    ],
    validation: "Repenning and Sterman (2002) built their model from an inductive field study of one firm; the abstract reports no calibration statistics. The 2001 article illustrates its framework with case studies of successful improvement.",
    insight:
      "Working harder pays off at once and working smarter pays off later, so under pressure the short loop wins every time. The better-before-worse response of improvement, and the worse-before-better response of pressure, make the wrong choice look right.",
    tryThis: [
      "Open Decay and treat the stock as process capability. With no maintenance, how long until half of it is gone?",
      "Open Proportional Split and treat the three task types as production, maintenance and improvement. What happens to improvement work when resources are short?",
      "Sketch the work-harder and work-smarter loops, and mark which acts within weeks and which within months.",
    ],
    data: [
      ["Time spent on improvement versus production", "Timesheets; project records; interviews"],
      ["Process capability measures", "Defect rates, cycle times, first-pass yield"],
      ["Performance targets and gaps", "Operations reports; management dashboards"],
      ["Managers' beliefs about causes of poor performance", "Interviews; surveys; meeting records"],
    ],
    practice: [
      "Model capability as a stock that erodes unless maintained; that is what makes cutting improvement time costly later.",
      "Make the delay between improvement effort and payoff explicit and estimate it; it sets how long the worse-before-better dip lasts.",
      "Include how managers interpret the gap. The trap is behavioural as well as physical.",
    ],
    refs: ["repenning2002", "repenningSterman2001"],
    tags: ["process improvement", "capability trap", "work harder", "work smarter", "TQM", "lean", "attribution", "firefighting"],
  },
  {
    id: "lock-in",
    title: "Competing standards and lock-in",
    theme: "Customers and competition",
    level: "Intermediate",
    summary: "When each product becomes more attractive the more people use it, a small early lead grows until one product holds almost the whole market.",
    question: "Can an early lead in users decide which of two competing products wins, regardless of which is better?",
    sim: "biz_marketShare",
    presets: [
      { label: "Strong increasing returns", params: { inflow: 20, network: 0.7, churn: 18 } },
      { label: "No increasing returns", params: { inflow: 20, network: 0, churn: 18 } },
      { label: "Winner takes all", params: { inflow: 20, network: 1, churn: 18 } },
      { label: "Users switch often (6 months)", params: { inflow: 20, network: 0.7, churn: 6 } },
    ],
    map: [
      ["Stocks: Users of format A, Users of format B", "Installed bases; A starts with 105 thousand, B with 95 thousand"],
      ["Flows: new users → A, → B", "New users split by relative attractiveness"],
      ["Increasing returns", "Attractiveness grows with installed base: network effects, complementary products, learning"],
      ["Flows: leaving A, B", "Installed base / average time a user stays"],
      ["Loop R (success to the successful)", "More users → more attractive → bigger share of new users → more users"],
    ],
    molecules: ["marketshare", "split", "residence"],
    evidence: [
      "Arthur (1989) models adopters choosing between technologies that improve as they are adopted. Under increasing returns, small chance events can lock the economy into one technology, on a path that need not be efficient, cannot be predicted from usual supply and demand knowledge, and is hard to change through standard tax or subsidy policy.",
      "Sterman et al. (2007) show that the get-big-fast strategy that exploits such positive feedback depends on capacity keeping pace: when the market moves fast relative to capacity adjustment, excess capacity can overwhelm the advantage.",
    ],
    validation: "Arthur (1989) is an analytical model with no empirical test reported in the abstract. Sterman et al. (2007) is a simulation study; the abstract reports no calibration to industry data.",
    insight:
      "With increasing returns, the winner is decided early and by small differences, not by which product is better at the end. Without them, the market keeps whatever split it started with. The total market is set by how many users arrive and how long they stay, whoever wins it.",
    tryThis: [
      "Run strong increasing returns. When does B's user base peak and start to shrink?",
      "Set increasing returns to 0. Does A's head start grow, shrink or stay the same?",
      "Shorten the time users stay to 6 months. Does faster switching speed up lock-in or slow it down?",
    ],
    data: [
      ["Installed base by product", "Company filings (SEC EDGAR); industry trackers"],
      ["New users and churn", "Subscriber and activation data; company disclosures"],
      ["Strength of network effects", "Studies of complementary goods and switching costs; usage data"],
    ],
    practice: [
      "This small model uses one fixed head start and no price or quality differences. Real lock-in cases need product quality, prices and switching costs as well.",
      "Estimate how attractiveness depends on installed base from data where possible; the strength of that effect decides whether lock-in happens at all.",
      "Watch the time users stay: it sets both the size of the market and how fast a lead can be overturned.",
    ],
    checks: [
      { claim: "With strong increasing returns, A's 52.5% starting share grows to over 95% within ten years", test: (run) => { const r = run({ network: 0.7 }); return r.end.a / (r.end.a + r.end.b) > 0.95; } },
      { claim: "Without increasing returns, the split stays at its starting 52.5%", test: (run) => { const r = run({ network: 0 }); return Math.abs(r.end.a / (r.end.a + r.end.b) - 0.525) < 0.005; } },
      {
        claim: "Either way the total market settles at new users × time users stay: 20 × 18 = 360 thousand",
        test: (run) => [0, 0.7].every((n) => { const r = run({ network: n, inflow: 20, churn: 18 }); return Math.abs(r.end.a + r.end.b - 360) < 3.6; }),
      },
    ],
    refs: ["arthur1989", "stermanGBF2007"],
    tags: ["market share", "lock-in", "network effects", "increasing returns", "standards", "competition", "platforms", "QWERTY", "success to the successful"],
  },
  {
    id: "customer-base",
    title: "Customer base, churn and customer lifetime",
    theme: "Customers and competition",
    level: "Starter",
    summary: "Active customers settle where acquisition balances churn, at new customers per month times the average customer lifetime.",
    question: "Is it worth more to win customers faster or to keep them longer, and how long until either shows up in the customer base?",
    sim: "biz_customers",
    presets: [
      { label: "20-month lifetime", params: { inflow: 8, tau: 20 } },
      { label: "Double the lifetime (40 months)", params: { inflow: 8, tau: 40 } },
      { label: "Double acquisition", params: { inflow: 16, tau: 20 } },
    ],
    map: [
      ["Stock: Active customers", "Customers with a current account, subscription or contract"],
      ["Flow: acquisition", "New customers per month"],
      ["Flow: churn", "Active customers / average lifetime"],
      ["Average customer lifetime", "1 / monthly churn rate: a 5% monthly churn rate means a 20-month lifetime"],
    ],
    molecules: ["residence", "bathtub", "presentValue"],
    evidence: [
      "Gupta, Lehmann and Stuart (2004) value customers as the expected sum of discounted future earnings and apply the method to five firms using public data. A 1% improvement in retention, margin or acquisition cost improved firm value by 5%, 1% and 0.1% respectively, and a 1% improvement in retention had almost five times the effect of a 1% change in the discount rate.",
    ],
    validation: "Gupta et al. (2004) demonstrate their valuation method on publicly available data for five firms. The small model here is checked against the exact steady state (customers = acquisition × lifetime) and the first-order response time.",
    insight:
      "The customer base is a bathtub: it settles at acquisition × lifetime, so doubling either doubles the base. Longer lifetimes also slow the response, so a retention gain takes several lifetimes to show in full.",
    tryThis: [
      "Run the 20-month lifetime. Check that the base settles at 8 × 20 = 160 thousand.",
      "Double the lifetime and double acquisition in turn. Both reach 320 thousand, but which gets there sooner?",
      "Set acquisition to 0 after the base has settled. How long until half the customers are gone?",
    ],
    data: [
      ["New customers per period", "CRM systems; company filings"],
      ["Churn or retention rates", "Billing and subscription records; company filings"],
      ["Margin per customer and acquisition cost", "Management accounts; segment reporting"],
      ["Discount rate", "Company cost of capital"],
    ],
    practice: [
      "This small model uses one average lifetime. Churn is usually highest in the first months, so split new and established customers into an aging chain if the data show that.",
      "Count customers, not revenue, in the stock; put margin per customer in a coflow if value matters.",
      "Check the steady state first: if acquisition × lifetime does not match the customer count you see, one of the rates is wrong.",
    ],
    checks: [
      { claim: "The base settles at acquisition × lifetime: 8 × 20 = 160 thousand", test: (run) => Math.abs(run({ inflow: 8, tau: 20 }).end.q - 160) < 1.6 },
      { claim: "After one lifetime the base has closed 1 − 1/e ≈ 63% of the gap", test: (run) => Math.abs(run({ inflow: 8, tau: 20 }, 20).end.q / 160 - (1 - Math.exp(-1))) < 0.02 },
      {
        claim: "Doubling the lifetime doubles the base in the long run, but more slowly than doubling acquisition",
        test: (run) => Math.abs(run({ inflow: 8, tau: 40 }, 300).end.q - 320) < 3.2 && run({ inflow: 8, tau: 40 }, 40).end.q < run({ inflow: 16, tau: 20 }, 40).end.q,
      },
    ],
    refs: ["gupta2004"],
    tags: ["customers", "churn", "retention", "customer lifetime value", "subscription", "acquisition", "Little's law", "marketing"],
  },
];

const DATA_SOURCES: DataSource[] = [
  { name: "US Census Bureau Manufacturing and Trade Inventories and Sales", url: "https://www.census.gov/mtis/index.html", what: "Monthly sales, inventories and inventory-to-sales ratios for manufacturers, wholesalers and retailers", scope: "Demand, sales and inventories" },
  { name: "US Census Bureau Monthly Retail Trade", url: "https://www.census.gov/retail/index.html", what: "Monthly and annual retail sales and inventories by kind of business", scope: "Demand, sales and inventories" },
  { name: "US Census Bureau economic indicators", url: "https://www.census.gov/econ/currentdata/", what: "Time series for manufacturers' shipments, inventories and orders, construction and trade", scope: "Demand, sales and inventories" },
  { name: "Eurostat short-term business statistics", url: "https://ec.europa.eu/eurostat/web/short-term-business-statistics", what: "EU production, turnover, orders and prices by industry", scope: "Demand, sales and inventories" },
  { name: "Federal Reserve G.17 Industrial Production and Capacity Utilization", url: "https://www.federalreserve.gov/releases/g17/current/default.htm", what: "Monthly US output, capacity and utilisation by industry", scope: "Capacity and supply chains" },
  { name: "Federal Reserve Bank of New York Global Supply Chain Pressure Index", url: "https://www.newyorkfed.org/research/policy/gscpi", what: "Monthly index of global supply chain conditions from transport costs and survey data", scope: "Capacity and supply chains" },
  { name: "ISM Report on Business", url: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-report-on-business/", what: "Monthly purchasing managers' survey: new orders, backlogs, supplier deliveries and inventories", scope: "Capacity and supply chains" },
  { name: "American Customer Satisfaction Index", url: "https://theacsi.org/", what: "Customer satisfaction scores by industry and company over time", scope: "Customers and firms" },
  { name: "US BLS Job Openings and Labor Turnover Survey", url: "https://www.bls.gov/jlt/", what: "Monthly hires, quits and separations by industry", scope: "Customers and firms" },
  { name: "SEC EDGAR company filings", url: "https://www.sec.gov/edgar/search/", what: "US company annual and quarterly reports, including customer counts, churn and segment data where disclosed", scope: "Customers and firms" },
];

export const BUSINESS: Domain = {
  id: "business",
  name: "Business, operations and supply chains",
  short: "Business",
  blurb: "New-product growth, supply chains, capacity, service quality, process improvement and customers.",
  themes: THEMES,
  cases: CASES,
  refs: REFS,
  models: BIZ_MODELS,
  stop: BIZ_STOP,
  dataSources: DATA_SOURCES,
};
