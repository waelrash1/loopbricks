// Environment, climate and energy case library.
// Every reference below was checked against Crossref, the publisher's abstract or the full text (Oct 2026);
// findings quote the abstract or full text. One purpose-built model (the fishery); the rest are molecule skins.
import type { Model } from "@/data/molecules";
import type { FlowMeta } from "@/data/diagramMeta";
import type { AppCase, DataSource, Domain, Ref } from "@/data/apps/types";
import { built, skins, type Skin } from "@/data/apps/sim";

const C = { acc: "var(--viz-acc)", acc2: "var(--viz-acc2)", good: "var(--viz-good)", pink: "var(--viz-pink)" };

export const THEMES = ["Climate and atmosphere", "Renewable resources and water", "Growth and limits", "Energy and transport"] as const;

const REFS: Record<string, Ref> = {
  stermanBoothSweeney2007: { text: "Sterman JD, Booth Sweeney L (2007). Understanding public complacency about climate change: adults' mental models of climate change violate conservation of matter. Climatic Change 80(3-4):213-238.", doi: "10.1007/s10584-006-9107-5" },
  sterman2008: { text: "Sterman JD (2008). Risk communication on climate: mental models and mass balance. Science 322(5901):532-533.", doi: "10.1126/science.1162574" },
  prather2012: { text: "Prather MJ, Holmes CD, Hsu J (2012). Reactive greenhouse gas scenarios: systematic exploration of uncertainties and the role of atmospheric chemistry. Geophysical Research Letters 39(9):L09803.", doi: "10.1029/2012GL051440" },
  sterman2012: { text: "Sterman J, Fiddaman T, Franck T, et al. (2012). Climate interactive: the C-ROADS climate policy model. System Dynamics Review 28(3):295-305.", doi: "10.1002/sdr.1474" },
  moxnes1998: { text: "Moxnes E (1998). Not only the tragedy of the commons: misperceptions of bioeconomics. Management Science 44(9):1234-1248.", doi: "10.1287/mnsc.44.9.1234" },
  moxnes2000: { text: "Moxnes E (2000). Not only the tragedy of the commons: misperceptions of feedback and policies for sustainable development. System Dynamics Review 16(4):325-348.", doi: "10.1002/sdr.201" },
  meadows1972: { text: "Meadows DH, Meadows DL, Randers J, Behrens WW III (1972). The Limits to Growth: A Report for the Club of Rome's Project on the Predicament of Mankind. Universe Books, New York." },
  turner2008: { text: "Turner GM (2008). A comparison of The Limits to Growth with 30 years of reality. Global Environmental Change 18(3):397-411.", doi: "10.1016/j.gloenvcha.2008.05.001" },
  sterman2000: { text: "Sterman JD (2000). Business Dynamics: Systems Thinking and Modeling for a Complex World. Irwin/McGraw-Hill." },
  winz2009: { text: "Winz I, Brierley G, Trowsdale S (2009). The use of system dynamics simulation in water resources management. Water Resources Management 23(7):1301-1323.", doi: "10.1007/s11269-008-9328-7" },
  struben2008: { text: "Struben J, Sterman JD (2008). Transition challenges for alternative fuel vehicle and transportation systems. Environment and Planning B: Planning and Design 35(6):1070-1097.", doi: "10.1068/b33022t" },
  ford1999: { text: "Ford A (1999). Cycles in competitive electricity markets: a simulation study of the western United States. Energy Policy 27(11):637-658.", doi: "10.1016/S0301-4215(99)00050-6" },
};

// ---------------------------------------------------------------- purpose-built: fishery with a fleet
// Logistic fish stock (carrying capacity 1,000 kt) harvested by a fleet that invests while boats are profitable.
// ponytail: carrying capacity, catchability and fleet lifetime are fixed; sliders cover the levers the case is about.
const K = 1000, CATCH = 0.002, LIFE = 20;
const fishery: Model = {
  name: "Fishery and fleet",
  title: "A renewable fish stock and the fleet that harvests it",
  timeUnit: "yr",
  unitY: "kt of fish / boats",
  lede: "Fish regrow fastest at half the carrying capacity. Boats are bought while fishing pays, and leave only as they wear out.",
  stocks: [
    { id: "fish", label: "Fish stock (kt)", init: K, scale: K, color: C.acc , floor: true },
    { id: "fleet", label: "Fleet (boats)", init: 10, scale: 500, color: C.acc2 , floor: true },
  ],
  params: [
    { id: "r", label: "Fish regrowth rate", min: 10, max: 60, step: 1, value: 30, unit: "%/yr" },
    { id: "s", label: "Investment response to profit", min: 0, max: 60, step: 1, value: 20, unit: "%/yr" },
    { id: "quota", label: "Catch limit", min: 20, max: 300, step: 5, value: 300, unit: "kt/yr" },
    { id: "cost", label: "Break-even catch per boat", min: 0.1, max: 1.5, step: 0.05, value: 0.4, unit: "kt/yr" },
  ],
  rates: (s, p) => {
    const landed = Math.min(CATCH * s.fleet * s.fish, p.quota);
    const perBoat = landed / Math.max(s.fleet, 1e-9);
    return {
      regrow: (p.r / 100) * s.fish * (1 - s.fish / K),
      harvest: landed,
      invest: Math.max(0, s.fleet * (1 / LIFE + (p.s / 100) * ((perBoat - p.cost) / p.cost))),
      scrap: s.fleet / LIFE,
    };
  },
  derivs: (_s, _p, r) => ({ fish: r.regrow - r.harvest, fleet: r.invest - r.scrap }),
  diagram: {
    stocks: {
      fish: { x: 140, y: 80, w: 110, h: 100 },
      fleet: { x: 560, y: 80, w: 110, h: 100 },
    },
    flows: [
      { id: "regrow", pts: [[30, 130], [140, 130]], to: "fish", max: 100, color: C.good },
      { id: "harvest", pts: [[250, 130], [370, 130]], from: "fish", max: 300, color: C.pink },
      { id: "invest", pts: [[450, 130], [560, 130]], to: "fleet", max: 100 },
      { id: "scrap", pts: [[670, 130], [790, 130]], from: "fleet", max: 50 },
    ],
  },
  cld: {
    vars: [
      { id: "f", label: "Fish stock", x: 90, y: 135 },
      { id: "g", label: "Regrowth", x: 90, y: 240 },
      { id: "c", label: "Catch", x: 270, y: 45 },
      { id: "b", label: "Fleet", x: 440, y: 135 },
      { id: "p", label: "Profit per boat", x: 280, y: 225 },
    ],
    links: [
      { from: "f", to: "g", sign: "+", curve: 50 },
      { from: "g", to: "f", sign: "+", curve: 50 },
      { from: "f", to: "c", sign: "+", curve: -30 },
      { from: "c", to: "f", sign: "−", curve: -30 },
      { from: "f", to: "p", sign: "+", curve: -20 },
      { from: "p", to: "b", sign: "+", curve: -20 },
      { from: "b", to: "c", sign: "+", curve: 20 },
    ],
    loops: [
      { type: "R", label: "R1", x: 90, y: 188 },
      { type: "B", label: "B1", x: 130, y: 70 },
      { type: "B", label: "B2", x: 300, y: 135 },
    ],
    caption:
      '<span class="chip chipR">R1</span> More fish spawn more fish (until crowding near the carrying capacity slows regrowth). <span class="chip chipB">B1</span> Catch depletes the stock. <span class="chip chipB">B2</span> A rich stock makes boats profitable, so the fleet grows and catches more, until the stock no longer pays. B2 works through two delays, investment and the fleet\'s long life, so the fleet <b>overshoots</b> and the stock is fished down further than it would be with an instant response.',
  },
  desc: "",
};
const fisheryFlows: Record<string, FlowMeta> = {
  regrow: { name: "regrowth", eq: "r × Fish × (1 − Fish / 1,000)", in: ["fish", "r"], loop: "R" },
  harvest: { name: "catch", eq: "MIN(0.002 × Fleet × Fish, catch limit)", in: ["fish", "fleet", "quota"], loop: "B" },
  invest: { name: "investment", eq: "Fleet × (1/20 yr + response × (catch per boat − break-even) / break-even), never below 0", in: ["fleet", "fish", "s", "cost", "quota"], loop: "B" },
  scrap: { name: "scrapping", eq: "Fleet / 20 yr", in: ["fleet"], loop: "B" },
};
const fisheryEq = {
  stocks: [
    ["Fish stock", "INTEG(regrowth − catch, 1,000)"],
    ["Fleet", "INTEG(investment − scrapping, 10)"],
  ] as [string, string][],
  aux: [
    ["catch per boat", "catch / Fleet"],
    ["stock where a boat just breaks even", "break-even catch / 0.002"],
    ["stock giving the maximum sustainable yield", "1,000 / 2 = 500 kt; yield r × 1,000 / 4"],
  ] as [string, string][],
};

const SKINS: Record<string, Skin> = {
  env_co2Bathtub: {
    base: "bathtub",
    name: "Carbon dioxide bathtub",
    title: "Atmospheric carbon: emissions in, net removal out",
    unitY: "GtC",
    stocks: { level: { label: "Extra carbon in the atmosphere (GtC)", init: 250, scale: 600 } },
    params: {
      inflow: { label: "Emissions", unit: "GtC/yr", value: 10 },
      outflow: { label: "Net removal by oceans and land", unit: "GtC/yr", value: 5 },
    },
    flows: { in: ["emissions", "emissions per year"], out: ["net removal", "net removal by oceans and biomass per year"] },
  },
  env_methane: {
    base: "residence",
    name: "Methane in the atmosphere",
    timeUnit: "yr",
    unitY: "Tg CH₄",
    stocks: { q: { label: "Methane in the atmosphere (Tg)", init: 5000, scale: 6000 } },
    params: {
      inflow: { label: "Methane emissions", min: 0, max: 800, step: 10, value: 550, unit: "Tg/yr" },
      tau: { label: "Atmospheric lifetime", min: 1, max: 150, step: 0.1, value: 9.1, unit: "yr" },
    },
    flows: { in: ["emissions", "natural + human emissions"], out: ["chemical removal", "Methane / lifetime"] },
  },
  env_limits: {
    base: "logistic",
    name: "Growth against a fixed limit",
    unitY: "index",
    stocks: { pop: { label: "Scale of the economy (index)" } },
    params: {
      r: { label: "Growth rate" },
      K: { label: "Limit the environment supports" },
    },
    flows: { births: ["growth", "r × Scale"], crowding: ["resistance from the limit", "r × Scale × (Scale / limit)"] },
  },
  env_aquifer: {
    base: "protFlow",
    name: "Groundwater aquifer",
    timeUnit: "yr",
    unitY: "million m³",
    stocks: { level: { label: "Groundwater in storage (million m³)", init: 500, scale: 600 } },
    params: {
      inflow: { label: "Recharge", min: 0, max: 60, step: 1, value: 20, unit: "M m³/yr" },
      desiredOut: { label: "Pumping demand", min: 0, max: 60, step: 1, value: 30, unit: "M m³/yr" },
      fastest: { label: "Fastest time to pump out what is left", unit: "yr" },
    },
    flows: { in: ["recharge", "recharge per year"], out: ["pumping", "MIN(demand, Storage / fastest time)"] },
  },
  env_altFuel: {
    base: "diffusion",
    name: "Alternative-fuel vehicle adoption",
    timeUnit: "yr",
    unitY: "thousand drivers",
    stocks: { pot: { label: "Drivers who might switch" }, adopt: { label: "Alternative-fuel drivers" } },
    params: {
      p: { label: "Marketing and subsidies p" },
      q: { label: "Word of mouth q" },
    },
    flows: { adoption: ["switching", "(p + q · Adopters / N) × Might switch"] },
  },
  env_powerPlants: {
    base: "stockmgmt",
    name: "Power plant construction",
    timeUnit: "yr",
    unitY: "GW",
    stocks: { sl: { label: "Plants under construction (GW)", init: 16, scale: 120 }, inv: { label: "Generating capacity (GW)", init: 80, scale: 200 } },
    params: {
      demand: { label: "Retirements", value: 4, unit: "GW/yr" },
      desInv: { label: "Capacity needed (peak + reserve)", unit: "GW" },
      adj: { label: "Time to close the gap", value: 2, unit: "yr" },
      acq: { label: "Construction time", value: 4, unit: "yr" },
      slw: { label: "Counts plants under construction" },
    },
    flows: {
      orders: ["new projects", "retirements + capacity gap / τ + construction gap / τ"],
      acquisition: ["plants completed", "Under construction / construction time"],
      sales: ["retirements", "retirements per year"],
    },
  },
};

const MODELS: Record<string, Model> = {
  env_fishery: built("env_fishery", fishery, fisheryFlows, fisheryEq),
  ...skins(SKINS),
};

const STOP: Record<string, number> = {
  env_co2Bathtub: 50, env_methane: 60, env_fishery: 60, env_limits: 50, env_aquifer: 100, env_altFuel: 40, env_powerPlants: 40,
};

const CASES: AppCase[] = [
  {
    id: "co2-bathtub",
    title: "Carbon dioxide as a bathtub",
    theme: "Climate and atmosphere",
    level: "Starter",
    summary: "Atmospheric carbon rises whenever emissions exceed net removal, so stabilising it needs emissions to fall to the removal rate, not just to stop growing.",
    question: "How far must emissions fall before the concentration of carbon dioxide stops rising?",
    sim: "env_co2Bathtub",
    presets: [
      { label: "Today: emissions double removal", params: { inflow: 10, outflow: 5 } },
      { label: "Emissions cut by 30%", params: { inflow: 7, outflow: 5 } },
      { label: "Emissions equal removal", params: { inflow: 5, outflow: 5 } },
      { label: "Emissions below removal", params: { inflow: 3, outflow: 5 } },
    ],
    map: [
      ["Stock: Extra carbon in the atmosphere", "Carbon dioxide above the pre-industrial level, in gigatonnes of carbon (illustrative starting value)"],
      ["Inflow: emissions", "Human emissions from fossil fuels, cement and land use"],
      ["Outflow: net removal", "Net uptake by the oceans and the biosphere"],
      ["Water level", "The concentration; it rises while the tap runs faster than the drain"],
    ],
    molecules: ["bathtub", "residence", "decay"],
    evidence: [
      "Sterman (2008): 212 MIT graduate students were told that emissions were roughly double net removal and asked to sketch the emissions path that would stabilise atmospheric CO₂. 84% drew patterns that violated the principles of accumulation, and nearly two-thirds asserted that greenhouse gases can stabilise even though emissions continuously exceed removal.",
      "In the same paper, three-fifths of the participants had degrees in science, technology, engineering or mathematics: training in science did not prevent the errors.",
      "Sterman and Booth Sweeney (2007) argue that most people believe concentrations can stabilise while emissions still exceed removal, which supports 'wait-and-see' policies; low public support for mitigation may rest more on misconceptions of climate dynamics than on uncertainty about the risks.",
    ],
    validation: "These are experiments on people's reasoning, not simulation models; the correct answer follows from conservation of matter. The small model here is checked against the bathtub's exact arithmetic: the stock changes by (emissions − removal) × time.",
    insight:
      "A stock rises as long as its inflow exceeds its outflow, however much the inflow has been cut. Stopping the growth of emissions does not stop the growth of the concentration; it keeps rising until emissions fall to the rate of removal.",
    tryThis: [
      "Run Today. How much does the stock grow over 50 years?",
      "Cut emissions by 30%. Does the concentration stop rising? What has changed?",
      "Find the emissions level at which the stock stops rising. Then go below it: what has to happen for the concentration to fall?",
    ],
    data: [
      ["Atmospheric CO₂ concentration", "NOAA Global Monitoring Laboratory (Mauna Loa and global records)"],
      ["Emissions by source", "Global Carbon Budget"],
      ["Ocean and land uptake", "Global Carbon Budget"],
    ],
    practice: [
      "This small model holds net removal fixed. In reality removal depends on the concentration and on how saturated the ocean and land sinks are; a full carbon-cycle model makes removal a function of the stocks.",
      "Plot the flows and the stock on separate charts: most of the confusion Sterman documents comes from reading a stock as if it followed its inflow.",
      "Watch the units: emissions are often reported in tonnes of CO₂, which weigh 44/12 (about 3.67) times their carbon content.",
    ],
    checks: [
      { claim: "With emissions double removal (10 against 5 GtC/yr), the stock grows by exactly (10 − 5) × 50 = 250 GtC in 50 years", test: (run) => Math.abs(run({ inflow: 10, outflow: 5 }, 50).end.level - 500) < 0.5 },
      { claim: "Cutting emissions by 30% still leaves the concentration rising", test: (run) => run({ inflow: 7, outflow: 5 }).end.level > 250 + 90 },
      { claim: "Only when emissions equal removal does the stock stop changing", test: (run) => Math.abs(run({ inflow: 5, outflow: 5 }).end.level - 250) < 0.01 },
      { claim: "The concentration falls only when emissions drop below removal", test: (run) => run({ inflow: 3, outflow: 5 }).end.level < 250 },
    ],
    refs: ["sterman2008", "stermanBoothSweeney2007"],
    tags: ["carbon dioxide", "CO2", "climate change", "bathtub", "accumulation", "emissions", "stock and flow", "net zero", "mental models"],
  },
  {
    id: "methane-lifetime",
    title: "Methane: a pollutant with a short lifetime",
    theme: "Climate and atmosphere",
    level: "Starter",
    summary: "Methane is removed in proportion to how much is in the air, so its stock settles at emissions × lifetime and responds within about a decade.",
    question: "If human methane emissions were cut, how much would the atmospheric burden fall, and how fast?",
    sim: "env_methane",
    presets: [
      { label: "Present emissions, lifetime 9.1 yr", params: { inflow: 550, tau: 9.1 } },
      { label: "Human emissions removed", params: { inflow: 198, tau: 9.1 } },
      { label: "All emissions stopped", params: { inflow: 0, tau: 9.1 } },
      { label: "A 131-year gas, emissions stopped", params: { inflow: 0, tau: 131 } },
    ],
    map: [
      ["Stock: Methane in the atmosphere", "Global atmospheric burden, in teragrams"],
      ["Inflow: emissions", "Natural plus human emissions. Prather et al. put the human part at 352 Tg/yr, 64% of the total, which implies a total of about 550"],
      ["Outflow: chemical removal", "Mainly oxidation; modelled as burden ÷ lifetime"],
      ["Lifetime", "9.1 years for methane (Prather et al. 2012); 131 years for nitrous oxide"],
    ],
    molecules: ["residence", "decay"],
    evidence: [
      "Prather, Holmes and Hsu (2012) derive a present-day atmospheric lifetime for methane of 9.1 ± 0.9 years and anthropogenic emissions of 352 ± 45 Tg/yr, 64% of total emissions.",
      "For nitrous oxide the same study gives a lifetime of 131 ± 10 years and anthropogenic emissions of 6.5 ± 1.3 TgN/yr (41% of total); for HFC-134a, a lifetime of 14.2 ± 1.5 years.",
    ],
    validation: "Prather et al. (2012) estimate emissions from observed changes in abundance together with lifetimes, and carry the uncertainty of each key variable into their projections. The small model is checked against two exact results: the steady state equals inflow × lifetime, and the gap to a new steady state halves every lifetime × ln 2.",
    insight:
      "For a first-order stock, the steady state is inflow × residence time and the adjustment takes a few residence times. A short-lived gas like methane answers a cut within one or two decades; a gas with a lifetime of more than a century barely moves in the same time.",
    tryThis: [
      "Run the present-emissions preset. Is the burden near steady state? Compare it with emissions × lifetime.",
      "Remove the human emissions. When has the burden fallen halfway to its new level?",
      "Compare the two 'emissions stopped' presets after 20 years. What share of the stock is gone in each?",
    ],
    data: [
      ["Global methane concentration", "NOAA Global Monitoring Laboratory methane trends"],
      ["Emissions by sector", "Global Carbon Project methane budget; national inventories"],
      ["Lifetimes", "IPCC assessment reports; Prather et al. (2012)"],
    ],
    practice: [
      "This small model uses a fixed lifetime. In reality methane's lifetime depends on hydroxyl radicals, which methane itself consumes, so more methane lengthens its own lifetime: a feedback the model leaves out.",
      "Separate natural and human emissions: policy acts only on the human part.",
      "Do not reuse this structure for carbon dioxide. CO₂ has no single lifetime because it is shared between the atmosphere, oceans and land, which is why the CO₂ case uses a bathtub instead.",
    ],
    checks: [
      { claim: "The burden settles at emissions × lifetime: 550 × 9.1 ≈ 5,005 Tg", test: (run) => Math.abs(run({ inflow: 550, tau: 9.1 }, 150).end.q - 5005) < 10 },
      { claim: "After human emissions are removed, half the gap to the new level closes in about lifetime × ln 2 ≈ 6.3 years", test: (run) => { const target = 198 * 9.1, x = run({ inflow: 198, tau: 9.1 }, 6.3).end.q; const frac = (5000 - x) / (5000 - target); return frac > 0.47 && frac < 0.53; } },
      { claim: "If emissions stop, methane loses about 90% of its burden in 20 years; a gas with a 131-year lifetime loses only about 14%", test: (run) => run({ inflow: 0, tau: 9.1 }, 20).end.q < 0.15 * 5000 && run({ inflow: 0, tau: 131 }, 20).end.q > 0.84 * 5000 },
    ],
    refs: ["prather2012", "sterman2008"],
    tags: ["methane", "CH4", "residence time", "lifetime", "pollutant", "greenhouse gas", "nitrous oxide", "short-lived climate pollutant"],
  },
  {
    id: "c-roads",
    title: "Climate policy simulators for negotiators",
    theme: "Climate and atmosphere",
    level: "Advanced",
    summary: "C-ROADS links emissions, carbon stocks and warming in a model fast enough to use during international negotiations.",
    question: "Do the emissions pledges on the table add up to the temperature goal, and what would?",
    map: [
      ["Stocks", "Carbon in the atmosphere, the oceans and the biosphere; heat in the climate system"],
      ["Flows", "Emissions by country or bloc; ocean and land uptake; heating driven by the extra carbon"],
      ["Policy inputs", "Each party's emissions pledge over time"],
    ],
    molecules: ["bathtub", "cascade", "decay", "smooth"],
    evidence: [
      "Sterman et al. (2012) describe C-ROADS (Climate Rapid Overview And Decision Support), a transparent policy simulator grounded in the best available science that runs on an ordinary laptop in seconds.",
      "The paper describes its use by key UNFCCC parties, including the United States, China and the United Nations, and notes that the voluntary pledges made after the 2009 Copenhagen conference fall significantly short of what is needed to limit warming to 2 °C.",
    ],
    validation: "Sterman et al. (2012) describe the model's calibration to historical data; the abstract gives no fit statistics, so see the paper for them.",
    insight:
      "The accumulation error the bathtub case shows also appears at the negotiating table: pledges that slow the growth of emissions look like progress but leave the concentration rising. A simulator people can run themselves lets them discover this instead of being told.",
    tryThis: [
      "Open Bathtub and Cascade. Sketch the atmosphere and the ocean as linked stocks, with emissions as the inflow to the atmosphere.",
      "Add a second stock, heat, whose inflow depends on the carbon stock. Why does warming lag behind carbon?",
    ],
    data: [
      ["Emissions by country", "Global Carbon Budget; UNFCCC national inventories"],
      ["Pledges (NDCs)", "UNFCCC NDC registry"],
      ["Temperature record", "NASA GISTEMP, HadCRUT, NOAA"],
    ],
    practice: [
      "Calibrate each sub-model (carbon cycle, temperature) to history before testing policy.",
      "Keep the model fast and transparent: in a negotiation, a result people can reproduce in seconds is worth more than a precise one they must take on trust.",
    ],
    refs: ["sterman2012", "sterman2008"],
    tags: ["C-ROADS", "climate policy", "UNFCCC", "Paris", "pledges", "negotiation", "simulator", "2 degrees"],
  },
  {
    id: "fishery",
    title: "Fisheries: overinvestment and overfishing",
    theme: "Renewable resources and water",
    level: "Intermediate",
    summary: "A fleet that keeps investing while fishing pays overshoots, fishes the stock far below its most productive level, and is slow to shrink.",
    question: "Why do fisheries end up with too many boats and too few fish, even when nobody competes for the resource?",
    sim: "env_fishery",
    presets: [
      { label: "Open access, strong investment", params: { r: 30, s: 20, quota: 300, cost: 0.4 } },
      { label: "Cautious investment", params: { r: 30, s: 5, quota: 300, cost: 0.4 } },
      { label: "Catch limit at maximum sustainable yield", params: { r: 30, s: 20, quota: 75, cost: 0.4 } },
      { label: "Fishing costs doubled", params: { r: 30, s: 20, quota: 300, cost: 0.8 } },
    ],
    map: [
      ["Stock: Fish", "Biomass of the target stock; it regrows fastest at half its carrying capacity of 1,000 kt"],
      ["Stock: Fleet", "Boats; they leave only as they wear out (20-year life)"],
      ["Flow: catch", "0.002 × Fleet × Fish, capped by any catch limit"],
      ["Investment response", "How strongly owners buy boats when the catch per boat beats the break-even level"],
      ["Break-even catch per boat", "Sets the stock where fishing stops paying: break-even ÷ 0.002"],
    ],
    molecules: ["logistic", "stockAdjust", "ceiling"],
    evidence: [
      "Moxnes (1998): 83 subjects, mostly from the Norwegian fisheries sector, each managed the same simulated virgin fish stock with exclusive property rights, ruling out the commons problem. They consistently overinvested, with an average overcapacity of 60%, and reduced the resource on average 15% below its optimal level.",
      "Moxnes (2000) summarises four laboratory experiments on renewable resources. With the commons problem designed out, participants still overinvested and overutilised their resources. The explanation offered is misperception of stocks, flows and nonlinearities; reframing the task around net growth rates is suggested as a remedy.",
    ],
    validation: "Moxnes ran controlled laboratory experiments in which people managed a simulated fishery; the evidence is how they behaved compared with the optimal policy for the same model. The small model here is checked against its exact open-access equilibrium (stock = break-even catch ÷ catchability).",
    insight:
      "Profit tells owners about the fish stock only after the fact, and boats outlive the boom that paid for them. Investment therefore overshoots, and the fleet holds the stock down long after it has stopped paying. A catch limit protects the fish but not the investors: the fleet still grows until the limit is shared among too many boats.",
    tryThis: [
      "Run Open access. When does the fleet peak, and how low does the fish stock fall?",
      "Compare Cautious investment. Is the worst year better? Run both for longer: where does the stock settle?",
      "Set the catch limit to 75 kt/yr, the maximum sustainable yield. The fish are safe; how many boats does the fleet end up with, and how many would it need?",
    ],
    data: [
      ["Catch and landings by species and area", "FAO FishStat"],
      ["Stock assessments (biomass, fishing mortality)", "RAM Legacy Stock Assessment Database; national assessments"],
      ["Fleet size and capacity", "National fleet registers"],
      ["Costs and prices", "Fisheries economic surveys"],
    ],
    practice: [
      "This small model uses a fixed carrying capacity and catchability, and a fixed investment rule; in Moxnes's experiments people made the investment decisions themselves.",
      "Model the fleet as its own stock with a long life: exit is slower than entry, and that asymmetry drives the overcapacity.",
      "Report the stock relative to the level that gives the maximum sustainable yield, not relative to last year: a slowly falling stock looks normal year to year.",
    ],
    checks: [
      { claim: "Without a catch limit the stock settles where a boat just breaks even: 0.4 ÷ 0.002 = 200 kt, far below the 500 kt that gives the maximum sustainable yield", test: (run) => Math.abs(run({ s: 5, quota: 300, cost: 0.4 }, 200).end.fish - 200) < 5 },
      { claim: "Strong investment makes the fleet overshoot its long-run size of 120 boats by more than double, and fishes the stock far lower on the way", test: (run) => { const a = run({ s: 20 }), b = run({ s: 5 }); return a.max.fleet > 2 * 120 && a.min.fish < 0.5 * b.min.fish; } },
      { claim: "A catch limit of 75 kt/yr keeps the stock above 500 kt, yet the fleet still grows to limit ÷ break-even = 187.5 boats, about 2.5 times the 75 needed to land it at that stock", test: (run) => { const r = run({ s: 20, quota: 75 }); return r.min.fish > 500 && Math.abs(r.end.fleet - 187.5) < 2; } },
    ],
    refs: ["moxnes1998", "moxnes2000"],
    tags: ["fisheries", "fish", "overfishing", "renewable resource", "tragedy of the commons", "fleet", "overcapacity", "quota", "maximum sustainable yield"],
  },
  {
    id: "groundwater",
    title: "Groundwater: pumping faster than recharge",
    theme: "Renewable resources and water",
    level: "Starter",
    summary: "An aquifer pumped faster than it recharges falls steadily, until pumping is forced down to the recharge rate.",
    question: "How long can pumping exceed recharge, and what level of use can last?",
    sim: "env_aquifer",
    presets: [
      { label: "Pumping 50% above recharge", params: { inflow: 20, desiredOut: 30, fastest: 2 } },
      { label: "Pumping equals recharge", params: { inflow: 20, desiredOut: 20, fastest: 2 } },
      { label: "Drought: recharge halves", params: { inflow: 10, desiredOut: 30, fastest: 2 } },
    ],
    map: [
      ["Stock: Groundwater in storage", "Usable water in the aquifer"],
      ["Inflow: recharge", "Infiltration from rain and rivers"],
      ["Outflow: pumping", "Abstraction, limited by demand and by how fast the remaining water can be drawn"],
      ["Fastest time to pump out what is left", "Stands in for falling well yields as the water table drops"],
    ],
    molecules: ["protFlow", "bathtub", "floor"],
    evidence: [
      "Winz, Brierley and Trowsdale (2009) review 50 years of system dynamics in water resources: regional planning, river basin management, urban water, flooding and irrigation. These problems have important short- and long-term effects and are often contentious, and the authors argue that system dynamics combined with stakeholder involvement is an appropriate way to address them.",
      "The review draws best practices and common pitfalls from the literature and selected case studies; its abstract reports no quantitative result.",
    ],
    validation: "Winz et al. (2009) is a literature review; its abstract reports no model validation of its own. The small model is checked against two exact results: storage falls by (pumping − recharge) each year while wells keep up, and in the end pumping can only equal recharge.",
    insight:
      "Sustainable use is set by the flow (recharge), not by the size of the stock. A large aquifer only delays the day when pumping has to fall to recharge, and the longer the overdraft lasts, the less water is left as a buffer for droughts.",
    tryThis: [
      "Run Pumping 50% above recharge. How fast does storage fall, and when does pumping start to drop?",
      "Run the drought preset. How many years sooner does pumping start to fall?",
      "Find the highest pumping demand that never runs the aquifer down.",
    ],
    data: [
      ["Water levels in observation wells", "National groundwater monitoring networks (for the US, USGS Water Data for the Nation)"],
      ["Abstraction by sector", "FAO AQUASTAT; licensing records"],
      ["Recharge estimates", "Hydrological surveys; water-balance models"],
    ],
    practice: [
      "This small model gives recharge as a fixed number; in reality it varies with rainfall, land use and the water table, and pumping often reduces river flows that depended on the aquifer.",
      "Make pumping respond to cost: deeper water costs more to lift, which is a balancing loop that slows depletion before wells fail.",
      "Build the model with the people who use the water. Winz et al. stress stakeholder involvement because water allocation is contentious.",
    ],
    checks: [
      { claim: "While wells keep up, storage falls by exactly pumping − recharge each year: 500 − 10 × 20 = 300 after 20 years", test: (run) => Math.abs(run({ inflow: 20, desiredOut: 30, fastest: 2 }, 20).end.level - 300) < 0.5 },
      { claim: "In the end pumping can only equal recharge, and storage settles at recharge × the fastest pumping time (20 × 2 = 40)", test: (run) => Math.abs(run({ inflow: 20, desiredOut: 30, fastest: 2 }, 150).end.level - 40) < 1 },
      { claim: "When pumping does not exceed recharge, storage never falls", test: (run) => run({ inflow: 20, desiredOut: 20, fastest: 2 }).min.level >= 499.99 },
    ],
    refs: ["winz2009"],
    tags: ["groundwater", "aquifer", "water", "depletion", "recharge", "pumping", "irrigation", "drought", "overdraft"],
  },
  {
    id: "limits-to-growth",
    title: "Limits to growth",
    theme: "Growth and limits",
    level: "Intermediate",
    summary: "Exponential growth meets a limit; whether it levels off smoothly or overshoots depends on how fast and how firmly the limit pushes back.",
    question: "Does growth approach its limits smoothly, or overshoot and collapse?",
    sim: "env_limits",
    presets: [
      { label: "Steady growth to a limit", params: { r: 18, K: 200 } },
      { label: "Faster growth", params: { r: 35, K: 200 } },
      { label: "Limit raised by technology", params: { r: 18, K: 350 } },
    ],
    map: [
      ["Stock: Scale of the economy", "Population and industrial output, as one index"],
      ["Limit", "What the environment supports: resources, land, capacity to absorb pollution"],
      ["Loop R", "Growth breeds more growth"],
      ["Loop B", "Pressure from the limit slows growth as the stock approaches it"],
    ],
    molecules: ["logistic", "growth", "ceiling"],
    evidence: [
      "Meadows et al. (1972) used World3, a system dynamics model of population, food production, industrial production, pollution and non-renewable resources, to explore scenarios for the world system.",
      "Turner (2008) compared historical data for 1970-2000 with the scenarios: the data compare favourably with key features of the business-as-usual 'standard run', which results in collapse of the global system midway through the 21st century. They do not compare well with scenarios involving comprehensive use of technology or stabilising behaviour and policies.",
      "Turner also notes that, contrary to popular belief, the 1972 scenarios did not predict collapse by the end of the 20th century, and that the results show the particular importance of understanding and controlling global pollution.",
    ],
    validation: "Turner (2008) compared eight World3 output variables (population, birth and death rates, services, food and industrial output per capita, non-renewable resources and persistent pollution) with observed data for 1970-2000, judging approximate magnitudes and trends rather than fitting the model.",
    insight:
      "A limit that pushes back at once and never erodes gives a smooth S-curve. In World3 the limits act through long delays and can be eroded by overuse, which is how the standard run overshoots and collapses. Delay plus erosion turns an S-curve into overshoot and collapse.",
    tryThis: [
      "Run Steady growth. When is growth fastest, and how big is the stock then?",
      "Raise the limit with technology. Does it change the first ten years at all?",
      "Sketch what you would add to get overshoot: a delay between the stock and the pressure, and a limit that shrinks when exceeded.",
    ],
    data: [
      ["Population", "UN World Population Prospects"],
      ["Industrial output and food per capita", "World Bank World Development Indicators; FAO FAOSTAT"],
      ["Resource extraction", "UN Environment Programme Global Material Flows Database"],
      ["Pollution indicators", "NOAA CO₂ records; national emissions inventories"],
    ],
    practice: [
      "This small model cannot overshoot: its limit is fixed and acts at once. It shows the S-curve the standard run departs from. To reproduce overshoot, add a delay on the balancing loop and let the limit erode.",
      "Compare scenarios on behaviour modes, not point forecasts; Meadows et al. described their graphs as indications of the system's behavioural tendencies, not predictions.",
      "Aggregation is a choice: one index for 'the economy' hides who hits which limit first.",
    ],
    checks: [
      { claim: "Growth approaches the limit but never overshoots it", test: (run) => { const r = run({ r: 18, K: 200 }, 80); return r.max.pop <= 200 && r.end.pop > 195; } },
      { claim: "The curve is S-shaped: the stock reaches half the limit, where growth is fastest, after ln(19) ÷ r ≈ 16 years", test: (run) => { const x = run({ r: 18, K: 200 }, 16.4).end.pop; return x > 90 && x < 110; } },
      { claim: "Raising the limit by 75% changes the first ten years by less than 15%", test: (run) => { const a = run({ r: 18, K: 200 }, 10).end.pop, b = run({ r: 18, K: 350 }, 10).end.pop; return b > a && (b - a) / a < 0.15; } },
    ],
    refs: ["meadows1972", "turner2008", "sterman2000"],
    tags: ["limits to growth", "World3", "Club of Rome", "carrying capacity", "overshoot", "collapse", "sustainability", "S-curve", "population"],
  },
  {
    id: "alt-fuel-vehicles",
    title: "Alternative-fuel vehicles: getting adoption to take off",
    theme: "Energy and transport",
    level: "Intermediate",
    summary: "New vehicle technologies spread through marketing and word of mouth, and adoption cannot start unless something seeds it.",
    question: "How long must marketing and subsidies last before adoption of alternative-fuel vehicles becomes self-sustaining?",
    sim: "env_altFuel",
    presets: [
      { label: "No marketing, no early adopters", params: { p: 0, q: 18 } },
      { label: "Light marketing, strong word of mouth", params: { p: 0.5, q: 30 } },
      { label: "Heavy marketing, weak word of mouth", params: { p: 4, q: 5 } },
    ],
    map: [
      ["Stock: Drivers who might switch", "Drivers of conventional vehicles who could adopt"],
      ["Stock: Alternative-fuel drivers", "Drivers of hydrogen, battery-electric or other alternative vehicles"],
      ["p (marketing and subsidies)", "Adoption driven from outside: advertising, incentives, policy"],
      ["q (word of mouth)", "Adoption driven by contact with people who already drive one"],
    ],
    molecules: ["diffusion", "smooth", "marketshare"],
    evidence: [
      "Struben and Sterman (2008) model the diffusion of alternative-fuel vehicles, including coevolution of the fleet, driver behaviour and complementary resources such as fuelling infrastructure. They demonstrate a critical threshold for sustained adoption and show how it depends on economic and behavioural parameters.",
      "In the same study, word of mouth from people not driving an alternative vehicle is important in stimulating diffusion, and marketing programmes and subsidies must remain in place for long periods for diffusion to become self-sustaining.",
    ],
    validation: "The abstract of Struben and Sterman (2008) reports no calibration statistics; it presents a dynamic model and scenario analysis of the conditions for successful diffusion.",
    insight:
      "Word of mouth can only spread what already exists, so a new technology needs an outside push to start. In Struben and Sterman's model awareness also fades, so the push has to last until the reinforcing loops are strong enough to carry adoption on their own.",
    tryThis: [
      "Run No marketing. Why does nothing happen even though word of mouth is strong?",
      "Compare light marketing with strong word of mouth against heavy marketing with weak word of mouth. Which leads at year 5, and which at year 15?",
      "Sketch the missing loop: more alternative vehicles → more fuelling stations → more attractive vehicles. Is it reinforcing or balancing?",
    ],
    data: [
      ["Vehicle sales and stock by fuel type", "IEA Global EV Outlook; national vehicle registrations"],
      ["Fuelling and charging infrastructure", "IEA Global EV Outlook; national charging-point registers"],
      ["Incentives and their timing", "Government policy records"],
    ],
    practice: [
      "This diffusion skin has no threshold: any positive marketing eventually reaches everyone. Struben and Sterman's threshold comes from awareness that decays and from infrastructure that must grow with the fleet; add both before drawing policy conclusions.",
      "Model infrastructure as its own stock that investors build in response to the fleet: the chicken-and-egg loop is the core of the transition problem.",
      "Separate awareness from adoption: people must first consider a technology before price and convenience matter.",
    ],
    checks: [
      { claim: "With no marketing and no early adopters, word of mouth has nothing to spread: nobody ever switches", test: (run) => run({ p: 0, q: 18 }).end.adopt === 0 },
      { claim: "Light marketing with strong word of mouth starts slowly and then accelerates: years 5 to 10 add more drivers than years 0 to 5", test: (run) => { const a = run({ p: 0.5, q: 30 }, 5).end.adopt, b = run({ p: 0.5, q: 30 }, 10).end.adopt; return b - a > a; } },
      { claim: "Heavy marketing gets more drivers early, but strong word of mouth overtakes it by year 15", test: (run) => run({ p: 4, q: 5 }, 3).end.adopt > run({ p: 0.5, q: 30 }, 3).end.adopt && run({ p: 0.5, q: 30 }, 15).end.adopt > run({ p: 4, q: 5 }, 15).end.adopt },
    ],
    refs: ["struben2008", "sterman2000"],
    tags: ["electric vehicles", "EV", "hydrogen", "fuel cell", "alternative fuel", "infrastructure", "chicken and egg", "diffusion", "word of mouth", "transition"],
  },
  {
    id: "power-plant-cycles",
    title: "Boom and bust in power plant construction",
    theme: "Energy and transport",
    level: "Intermediate",
    summary: "Investors who respond to today's shortage but ignore what is already under construction build in waves of over- and under-supply.",
    question: "Will a competitive electricity market build capacity smoothly, or in waves with price spikes between them?",
    sim: "env_powerPlants",
    presets: [
      { label: "Investors count plants under construction", params: { demand: 4, desInv: 100, adj: 2, acq: 4, slw: 1 } },
      { label: "Investors ignore the construction pipeline", params: { demand: 4, desInv: 100, adj: 2, acq: 4, slw: 0 } },
      { label: "Longer construction time", params: { demand: 4, desInv: 100, adj: 2, acq: 8, slw: 0 } },
    ],
    map: [
      ["Stock: Plants under construction", "The supply line of committed projects"],
      ["Stock: Generating capacity", "Plants in service"],
      ["Capacity needed", "Peak demand plus a reserve margin"],
      ["Counts plants under construction", "How far investors allow for capacity already being built"],
    ],
    molecules: ["stockmgmt", "material", "smoothPricing"],
    evidence: [
      "Ford (1999) uses computer simulation to show that power plant construction could appear in waves, causing alternating periods of over- and under-supply and major swings in market prices, if the western US states adopt the market rules used in California.",
      "The same study finds the cycles are not inevitable: a constant capacity payment alongside the market-clearing price for energy could dampen them substantially. Wholesale consumers would pay more in the short run, but lower energy prices would nullify the impact of capacity payments in the long run.",
    ],
    validation: "The abstract of Ford (1999) reports no calibration statistics; the study uses simulation of the western US market to compare market rules.",
    insight:
      "When construction takes years and each investor sees only today's shortage, everyone builds for the same gap. The plants arrive together, the surplus stops building, and the next shortage is already forming. Counting the pipeline, or paying for capacity steadily, damps the cycle.",
    tryThis: [
      "Compare the first two presets. How far does capacity overshoot what is needed when the pipeline is ignored?",
      "Double the construction time. What happens to the size and the length of the swings?",
      "Set the weight on plants under construction to 0.5. Is partly counting the pipeline enough?",
    ],
    data: [
      ["Generating capacity, additions and retirements", "US EIA electricity data; Ember"],
      ["Projects under construction", "Grid operators' interconnection queues; national planning reports"],
      ["Peak demand and reserve margins", "Grid operators' reliability assessments"],
      ["Wholesale prices", "Market operators"],
    ],
    practice: [
      "This small model has no price: investment responds directly to the capacity gap. Ford's model works through market prices; add a price that rises steeply as reserves shrink to see the spikes.",
      "A capacity payment can be tested by making part of the investment signal steady rather than tied to the current shortage.",
      "Split capacity by technology when construction times differ: gas plants and wind farms arrive on different timescales.",
    ],
    checks: [
      { claim: "Investors who ignore the construction pipeline overshoot the capacity needed by more", test: (run) => run({ slw: 0 }).max.inv > run({ slw: 1 }).max.inv + 5 },
      { claim: "Counting the pipeline brings capacity up with almost no overshoot", test: (run) => run({ slw: 1 }).max.inv < 103 },
      { claim: "A longer construction time makes the swing bigger", test: (run) => run({ acq: 8, slw: 0 }).max.inv > run({ acq: 4, slw: 0 }).max.inv },
    ],
    refs: ["ford1999", "sterman2000"],
    tags: ["electricity", "power plants", "investment cycle", "boom and bust", "capacity", "deregulation", "reserve margin", "capacity payment", "energy markets"],
  },
];

const DATA_SOURCES: DataSource[] = [
  { name: "NOAA Global Monitoring Laboratory: CO₂ trends", url: "https://gml.noaa.gov/ccgg/trends/", what: "Monthly atmospheric CO₂ at Mauna Loa and global averages", scope: "Climate and atmosphere" },
  { name: "NOAA Global Monitoring Laboratory: methane trends", url: "https://gml.noaa.gov/ccgg/trends_ch4/", what: "Global monthly atmospheric methane", scope: "Climate and atmosphere" },
  { name: "Global Carbon Budget", url: "https://globalcarbonbudget.org/", what: "Annual CO₂ emissions by country and source, and ocean and land sinks", scope: "Climate and atmosphere" },
  { name: "FAO FishStat", url: "https://www.fao.org/fishery/en/fishstat", what: "Global capture and aquaculture production by species and area", scope: "Resources and water" },
  { name: "RAM Legacy Stock Assessment Database", url: "https://www.ramlegacy.org/", what: "Stock assessment time series: biomass, catch and fishing mortality", scope: "Resources and water" },
  { name: "FAO AQUASTAT", url: "https://www.fao.org/aquastat/en/", what: "Water resources and withdrawals by country and sector", scope: "Resources and water" },
  { name: "USGS Water Data for the Nation", url: "https://waterdata.usgs.gov/", what: "US groundwater levels, streamflow and water quality", scope: "Resources and water" },
  { name: "US EIA electricity data", url: "https://www.eia.gov/electricity/data.php", what: "US generating capacity, additions, retirements, generation and prices", scope: "Energy" },
  { name: "Ember electricity data", url: "https://ember-energy.org/data/", what: "Electricity generation and capacity by country and fuel", scope: "Energy" },
  { name: "IEA Global EV Outlook 2025", url: "https://www.iea.org/reports/global-ev-outlook-2025", what: "Electric vehicle sales, stock and charging infrastructure by country", scope: "Energy" },
];

export const ENVIRONMENT: Domain = {
  id: "environment",
  name: "Environment, climate and energy",
  short: "Environment",
  blurb: "Carbon and methane in the atmosphere, fisheries, groundwater, limits to growth, vehicle transitions and power plant cycles.",
  themes: THEMES,
  cases: CASES,
  refs: REFS,
  models: MODELS,
  stop: STOP,
  dataSources: DATA_SOURCES,
};
