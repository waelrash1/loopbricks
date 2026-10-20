import type { StudyChapter } from "@/data/sterman/types";

export const CHAPTER: StudyChapter = {
  id: "ch12",
  number: "12",
  title: "Coflows and aging chains",
  part: "Part IV: Tools for modelling dynamic systems",
  pages: "469-512",
  summary:
    "A stock tells you how many items there are, but not how old they are or what qualities they carry. Two tools close that gap. An <b>aging chain</b> splits a stock into cohorts so that exit rates can depend on age or rank, which is how populations, faculties, fleets of machines and workforces develop momentum, top-heavy hierarchies and learning delays. A <b>coflow</b> runs a parallel stock alongside the main one to track an attribute (experience, labour requirements, cost, interest rate) that enters with each unit and leaves with the average. Together they explain why growth dilutes experience, why population keeps rising after fertility falls, and why modelling an attribute as a simple delay gives the wrong answer whenever the main stock is not in equilibrium.",
  bigIdeas: [
    {
      title: "An aging chain is a material delay with side doors",
      text: "A higher-order material delay conserves what enters it: nothing joins or leaves the intermediate stages. An aging chain relaxes that. Each cohort can have its own inflows (hiring of experienced people, migration) and outflows (deaths, quits), while items also move up the chain by a transition rate. Each cohort is a stock integrating its own inflow, the transition in from the cohort below, its outflow and the transition out to the cohort above. With no side flows it collapses back to an nth-order delay.",
      pages: "470-472",
    },
    {
      title: "Use an aging chain when the exit rate depends on age",
      text: "A single stock with a first-order outflow assumes perfect mixing: the newest item is as likely to leave as the oldest. That is wrong for people (mortality is U-shaped by age), cars, machines since their last overhaul, loans by age, marriages by duration or parolees by time since release. Splitting the stock into cohorts lets each one have its own fractional exit rate. Add cohorts until perfect mixing inside each one is a fair approximation for the purpose.",
      pages: "469-472",
    },
    {
      title: "Two ways to formulate exit from a cohort",
      text: "In one formulation, people leave each cohort at C/YPC (they mature) while deaths drain it continuously at C × FDR, so the average stay is shorter than YPC. In the other, everyone leaves after an average stay of YPC and the exit flow is then split by a survival fraction into those who mature and those who die; this suits up-or-out promotion systems and standard demographic tables. With fixed-length cohorts, the exit can be a pipeline delay of exactly YPC; with variable stays, a first-order exit. A survival fraction and a fractional death rate are linked by SF = exp(−FDR × YPC), so 1%/yr over 10 years leaves 90.5%, not 90%.",
      pages: "477-480",
    },
    {
      title: "Population momentum comes from the age structure",
      text: "A population that has been growing has many more young people than old. If fertility fell to replacement overnight, the large young cohorts would still move into the childbearing years, births would keep exceeding deaths, and population would keep rising for decades. The UN instant-replacement scenario took a world of 6 billion in 1999 to 8.4 billion by 2050. China grew more than 25% between 1980 and 1998 although fertility was below replacement. Because people live a long time and reproduce only decades after birth, a population takes generations to settle after fertility or mortality changes.",
      pages: "480-481",
    },
    {
      title: "The steady-state age mix is set by the growth rate",
      text: "Any population or organisation has an age (or rank) structure that depends on how fast it is growing. Fast growth means each year's intake is large relative to earlier intakes, so the young or junior groups dominate. When growth stops, the structure drifts towards its equilibrium, which for long-tenured top ranks is heavily top-weighted. These shifts arise purely from the change in growth, with no change in any individual's career.",
      pages: "487-490",
    },
    {
      title: "Up-or-out promotion chains turn top-heavy when growth stops",
      text: "In a university with three ranks, 3 years as assistant and 5 as associate, about 35 years as full professor and roughly half promoted at each review, Little's Law gives an equilibrium of about 21% assistant, 18% associate and 61% full. While MIT grew at 3.7%/yr before 1970, full professors were only about 36% of faculty. After growth stopped, tenure got harder, hiring fell, the payroll rose faster than salaries, and by 1993 the mix was close to the equilibrium. A slowdown also cuts promotion chances, which pushes the best people to leave first.",
      pages: "485-490",
    },
    {
      title: "Growth dilutes productivity through the rookie fraction",
      text: "Split the workforce into rookies and experienced staff, with rookies assimilated over an average time and less productive meanwhile. In equilibrium the rookie fraction is (experienced quit fraction × assimilation time) / (1 + the same product). With a 100-week assimilation time, 10-year experienced tenure and rookies at 25% productivity, one employee in six is a rookie and average productivity is 87.5% of the experienced level. Grow the workforce at 50%/yr and the rookie fraction climbs to 54% and productivity to 59%: headcount and payroll rise at once, but potential output barely moves for six months.",
      pages: "490-493",
    },
    {
      title: "Mentoring makes growth hurt in the short run",
      text: "Rookies do not learn for free. Each one absorbs some of an experienced person's time, so effective experienced capacity is the experienced headcount less the time spent training. In equilibrium the cost is modest (87.5% falls to 79% with half an experienced person per rookie). Under 50%/yr growth it is severe: productivity falls to 0.32 instead of 0.59, and potential output dips about 9% below where it started and takes 67 weeks to recover. Growth initially reduces what the firm can produce.",
      pages: "493-495",
    },
    {
      title: "A coflow mirrors the main stock to carry an attribute",
      text: "To track an attribute of a stock, build a second stock of the total attribute with flows that mirror the main ones. Each unit entering adds its marginal attribute (the attribute of new units); each unit leaving removes the average attribute, which is total attribute divided by the stock. One coflow per attribute: labour per machine, energy per machine, defects per design, price per order. The average then changes only as fast as units are actually added and removed.",
      pages: "497-503",
    },
    {
      title: "Modelling an attribute as a delay is a structural error",
      text: "It is tempting to let average labour per machine adjust to the new-machine value through a SMOOTH with the average life of capital. That matches the coflow only in equilibrium. An extreme test exposes it: if the firm stops investing, its machines do not change, yet the smooth still drifts to the new value, as if old machines were converted for free. The coflow ties the attribute to real turnover: with acquisitions growing 10%/yr, the new technology dominates in about 35 years instead of more than 90, and with acquisitions shrinking 10%/yr it never fully arrives.",
      pages: "498-502",
    },
    {
      title: "Nonconserved coflows: attributes that change on their own",
      text: "Some attributes change without any unit entering or leaving: experience accrues week by week on the job, knowledge decays or becomes obsolete, inventory is written down, machines are retrofitted. These need extra flows into or out of the attribute stock with no counterpart in the main stock. Equilibrium average experience is then (fractional attrition rate × new-hire experience + weeks worked per year) / (fractional attrition rate + fractional decay rate), which no longer equals the experience of new hires.",
      pages: "504-507",
    },
    {
      title: "Embodied learning can be lost, unlike cumulative-output learning",
      text: "A standard learning curve ties productivity to cumulative production, which can only rise, so productivity can only improve. Tie it instead to average experience carried by the workforce or the capital stock, with productivity rising by a fixed fraction per doubling of experience, and productivity can fall when experienced people leave or a new architecture makes their knowledge obsolete. Evidence of such forgetting includes rising outage rates in some nuclear fleets after political turmoil and incumbents losing leadership after architectural change. Aging chains and coflows combine in vintage models, where factor requirements are fixed when capital is built (putty-clay) and leave with the oldest vintage.",
      pages: "507-511",
    },
  ],
  diagrams: [
    {
      kind: "sf",
      title: "A population aging chain with reproduction",
      pages: "474-481",
      size: [760, 250],
      stocks: [
        { id: "y", label: "Young", x: 200, y: 150, w: 100 },
        { id: "a", label: "Adults", x: 390, y: 150, w: 100 },
        { id: "e", label: "Elderly", x: 580, y: 150, w: 100 },
      ],
      flows: [
        { id: "b", label: "Births", pts: [[70, 150], [150, 150]], to: "y", labelBelow: true },
        { id: "mat", label: "Maturing", pts: [[250, 150], [340, 150]], from: "y", to: "a" },
        { id: "age", label: "Aging", pts: [[440, 150], [530, 150]], from: "a", to: "e" },
        { id: "d", label: "Deaths", pts: [[630, 150], [705, 150]], from: "e" },
      ],
      aux: [{ id: "f", label: "Fertility", x: 55, y: 80, labelAt: "above" }],
      links: [
        { from: "a", to: "b", sign: "+", curve: 130 },
        { from: "f", to: "b", sign: "+" },
        { from: "y", to: "mat", sign: "+", curve: 80 },
        { from: "a", to: "age", sign: "+", curve: 80 },
        { from: "e", to: "d", sign: "+", curve: 70 },
      ],
      loops: [
        { type: "R", label: "R", x: 205, y: 100 },
        { type: "B", label: "B1", x: 266, y: 175 },
        { type: "B", label: "B2", x: 456, y: 175 },
        { type: "B", label: "B3", x: 646, y: 175 },
      ],
      caption:
        'Each cohort is a stock that drains in proportion to its size, <code>outflow = cohort ÷ average time in it</code>: the young mature, adults age into the elderly and the elderly die <span class="chip chipB">B1</span> <span class="chip chipB">B2</span> <span class="chip chipB">B3</span>. Only adults have children, so the reinforcing loop <span class="chip chipR">R</span> runs the length of the chain: today\'s births become parents decades later. A large young cohort is <b>momentum already in the pipe</b>, which is why population keeps growing after <code>Fertility</code> falls to replacement. Deaths among the young and adults also drain those stocks; they are left out to keep the chain readable.',
    },
    {
      kind: "cld",
      title: "Growth, the rookie fraction and lost talent",
      pages: "485-495",
      cld: {
        size: [640, 330],
        vars: [
          { id: "g", label: "Growth rate", x: 110, y: 165 },
          { id: "pc", label: "Promotion chances", x: 250, y: 55 },
          { id: "tl", label: "Loss of best people", x: 470, y: 55 },
          { id: "mp", label: "Market performance", x: 520, y: 165 },
          { id: "rf", label: "Rookie fraction", x: 150, y: 275 },
          { id: "mt", label: "Mentoring load", x: 330, y: 290 },
          { id: "po", label: "Potential output", x: 510, y: 275 },
        ],
        links: [
          { from: "g", to: "pc", sign: "+", curve: 0 },
          { from: "pc", to: "tl", sign: "−", curve: 0 },
          { from: "tl", to: "mp", sign: "−", curve: 0 },
          { from: "mp", to: "g", sign: "+", curve: 0 },
          { from: "g", to: "rf", sign: "+", curve: 0 },
          { from: "rf", to: "mt", sign: "+", curve: 0 },
          { from: "mt", to: "po", sign: "−", curve: 0 },
          { from: "po", to: "mp", sign: "+", curve: 0 },
        ],
        loops: [
          { type: "R", label: "R1", x: 330, y: 115 },
          { type: "B", label: "B1", x: 330, y: 220 },
        ],
        caption:
          'Growth keeps the hierarchy young and promotion easy, so talented people stay and performance sustains growth <span class="chip chipR">R</span>; when growth slows the same loop runs in reverse and drains the best staff. But growth also raises the share of rookies, whose training absorbs experienced time and holds down output <span class="chip chipB">B</span>. A fast-growing firm meets both at once.',
      },
    },
    {
      kind: "sf",
      title: "Experience coflow: hiring dilutes, tenure rebuilds",
      pages: "497-507",
      size: [760, 350],
      stocks: [
        { id: "w", label: "Workforce", x: 380, y: 70 },
        { id: "te", label: "Total experience", x: 380, y: 260, w: 150, h: 100 },
      ],
      flows: [
        { id: "hire", label: "Hiring", pts: [[150, 70], [320, 70]], to: "w" },
        { id: "att", label: "Attrition", pts: [[440, 70], [700, 70]], from: "w" },
        { id: "eh", label: "Experience from hires", pts: [[60, 230], [305, 230]], to: "te", labelBelow: true },
        { id: "lrn", label: "Learning on the job", pts: [[170, 290], [305, 290]], to: "te", labelBelow: true },
        { id: "lost", label: "Experience lost", pts: [[455, 260], [700, 260]], from: "te", labelBelow: true },
      ],
      aux: [
        { id: "nhe", label: "New-hire experience", x: 140, y: 160, labelAt: "left" },
        { id: "avg", label: "Average experience", x: 500, y: 150, labelAt: "right" },
      ],
      links: [
        { from: "hire", to: "eh", sign: "+" },
        { from: "nhe", to: "eh", sign: "+" },
        { from: "w", to: "lrn", sign: "+", curve: -10 },
        { from: "att", to: "lost", sign: "+", curve: -120 },
        { from: "te", to: "avg", sign: "+" },
        { from: "w", to: "avg", sign: "−" },
        { from: "avg", to: "lost", sign: "+" },
      ],
      loops: [{ type: "B", label: "B", x: 490, y: 232 }],
      caption:
        'A coflow tracks an attribute of the people in a stock. Each hire adds one person to <b>Workforce</b> and their own <b>new-hire experience</b> to <b>Total experience</b>; everyone on the payroll also gains experience by <b>learning on the job</b>, a flow with no counterpart in the workforce. Each leaver takes the <b>average experience</b> with them <span class="chip chipB">B</span>. A hiring surge raises <code>Workforce</code> at once but <code>Total experience</code> only slowly, so the average falls; time on the job rebuilds it. Attrition itself is ordinary first-order drainage of the workforce (its link is not drawn).',
    },
    {
      kind: "sequence",
      title: "Building a coflow, step by step",
      pages: "499-503",
      steps: [
        { label: "Main stock", detail: "Model the units (machines, people, orders) with their real inflows and outflows." },
        { label: "Attribute stock", detail: "Add a stock of the total attribute, in attribute units (workers required, person-weeks, dollars)." },
        { label: "Inflow mirror", detail: "Each inflow adds inflow × marginal attribute of the new units." },
        { label: "Outflow mirror", detail: "Each outflow removes outflow × average attribute (total ÷ stock)." },
        { label: "Nonconserved flows", detail: "Add accrual, decay, retrofit or write-down flows that change the attribute without moving units." },
        { label: "Test", detail: "Start in equilibrium, then try growth, decline and a halt to inflow; the average must stop changing when turnover stops." },
      ],
      note: "The last test is the one that separates a coflow from a delay that only looks right in equilibrium.",
    },
  ],
  formulations: [
    {
      name: "General aging chain",
      equations: [
        "C(i) = ∫ [ I(i) + T(i−1, i) − O(i) − T(i, i+1) ] dt",
        "T(0, 1) = 0,  T(n, n+1) = 0",
        "T(i, i+1) = C(i) / YPC(i)",
        "O(i) = C(i) × FDR(i)",
      ],
      explain:
        "Each cohort C(i) has its own inflow I, outflow O and transitions in and out. A first-order transition with YPC years per cohort assumes perfect mixing within the cohort; chaining n cohorts gives behaviour like an nth-order delay. Deaths or quits drain each cohort in proportion to its size, so the average stay is shorter than YPC.",
      molecule: "aging",
      pages: "470-472",
    },
    {
      name: "Exit split by survival fraction",
      equations: [
        "Exit(i) = C(i) / YPC(i)   or   Exit(i) = DELAYP(inflows to i, YPC(i))",
        "Maturation(i) = Exit(i) × SF(i)",
        "Deaths(i) = Exit(i) × (1 − SF(i))",
        "SF(i) = exp(−FDR(i) × YPC(i))",
      ],
      explain:
        "Everyone leaves the cohort after the residence time and is then split between those who move on and those who drop out. A pipeline delay suits fixed-length age bands; a first-order exit suits ranks where some people move faster than others. The same split describes up-or-out promotion: promotions = reviews × promotion fraction, departures = reviews × (1 − promotion fraction).",
      pages: "477-487",
    },
    {
      name: "Two-level promotion chain with training",
      equations: [
        "Potential output = Experienced × PDY_exp + Rookies × PDY_exp × rookie productivity fraction",
        "Assimilation = Rookies / assimilation time",
        "Rookie hiring = total quits + growth rate × total employees",
        "Rookie fraction (eq, no growth) = (q_exp × AT) / (1 + q_exp × AT)",
        "Effective experienced = Experienced − Rookies × fraction of experienced time for training",
      ],
      explain:
        "A two-stock aging chain models the learning curve of new staff. With no growth, the rookie share depends only on the experienced quit fraction q_exp and the assimilation time AT; the rookie quit rate cancels because quitters are replaced at once. Mentoring subtracts experienced time per rookie, which costs little in equilibrium but a great deal during growth.",
      molecule: "agingPDY",
      pages: "490-495",
    },
    {
      name: "Conserved coflow",
      equations: [
        "Attribute = ∫ ( Σ inflow(i) × marginal attribute(i) − Σ outflow(j) × average attribute ) dt",
        "Average attribute = Attribute / Stock",
        "e.g. Labour requirements += acquisitions × labour per new machine; −= discards × average labour per machine",
      ],
      explain:
        "The attribute stock moves only when units move. When the main stock is in equilibrium, a change in the marginal attribute works through like a first-order adjustment with time constant equal to the stock's residence time; when the main stock grows or shrinks, the adjustment speeds up or stalls, which a delay formulation cannot reproduce.",
      molecule: "coflow",
      pages: "498-503",
    },
    {
      name: "Nonconserved experience coflow",
      equations: [
        "Total experience = ∫ ( hiring × new-hire experience + workforce × weeks worked per year − attrition × average experience − workforce × average experience × decay fraction ) dt",
        "Average experience = Total experience / Workforce",
        "Average experience (eq) = (a × E_new + W) / (a + d)",
        "Productivity = reference PDY × (Average experience / reference experience)^c,  c = log₂(1 + fp)",
      ],
      explain:
        "On-the-job accrual and decay change total experience without moving people. With fractional attrition a and decay d, equilibrium experience is set by both. Productivity rises by fraction fp per doubling of experience, so it can fall when experience leaves or decays, unlike a learning curve driven by cumulative output.",
      molecule: "coflowExperience",
      pages: "504-508",
    },
    {
      name: "Coflow along a chain (vintages)",
      equations: [
        "Attribute(k) = ∫ ( flow(k−1→k) × average attribute(k−1) − flow(k→k+1) × average attribute(k) + value added in k ) dt",
        "Average attribute(k) = Attribute(k) / Stock(k)",
        "Average factor intensity = Σ Attribute(k) / Σ Stock(k)",
      ],
      explain:
        "When the main stock is an aging chain, the coflow mirrors each stage, so the attribute travels with the units instead of being averaged over the whole stock. In a putty-clay vintage model the factor requirements are fixed at construction and leave with the oldest vintage.",
      molecule: "cascadedCoflow",
      pages: "509-511",
    },
  ],
  cases: [
    {
      title: "Urban Dynamics: three aging chains in one city",
      text: "Forrester's urban model divides business structures into new, mature and declining, housing into premium, worker and underemployed, and people into three socio-economic classes. Structures age down the chain; old business buildings are demolished from the last stage, and housing filters down to poorer occupants as it ages. Forrester left out flows such as loft conversions, gentrification and rehabilitation for simplicity. Later work added some of them (Homer's study of insurance redlining included gentrification and rehabilitation), and extensions of the model generally found its policy conclusions robust to changes in boundary and aggregation.",
      pages: "472-474",
    },
    {
      title: "Population momentum and the demographic transition",
      text: "World population passed 6 billion in 1999, growing about 78 million (1.3%) a year. Instant replacement fertility would still lift it to 8.4 billion by 2050. China, below replacement since the late 1970s, grew from 985 million (1980) to 1.237 billion (1998), with a peak above 1.4 billion projected around 2030. The demographic transition (deaths fall first, births later, so growth surges in between) took Sweden 120 years to double, Egypt only 30. Meadows and colleagues tested 1-, 4- and 15-cohort chains and chose four cohorts for World3, modelling fertility and life expectancy endogenously so that the transition is not automatic.",
      pages: "480-485",
    },
    {
      title: "The aging of a university faculty",
      text: "A promotion-chain model of MIT's three faculty ranks (first-order reviews for junior ranks, third-order retirement for full professors) tracked the rank mix from 1930 closely using hiring and promotion fractions set at a few round values. Growth of 3.7%/yr until 1970 kept full professors near 36%; after growth stopped they rose above 63% by 1993, near the equilibrium. Promotion odds and hiring fell, the 1960s hiring surge was followed by lean years, payroll costs climbed, and the institute eventually offered early retirement incentives.",
      pages: "485-490",
    },
    {
      title: "Labour-saving machines and the coflow",
      text: "A firm whose new machines need half the labour sees average labour per machine fall only as old machines are discarded. With constant investment, the adjustment takes more than 90 years for an exponential approach; with acquisitions growing 10%/yr it is essentially complete in about 35; with acquisitions falling 10%/yr the firm is stuck with old, labour-hungry machines. A smooth of new-machine labour would have predicted the same path in all three cases.",
      pages: "498-502",
    },
  ],
  exercises: [
    {
      prompt:
        "Open the aging chain, load the <b>Baby boom</b> preset (births 35/yr) and run it for 200 years. In what order do the cohorts approach their new equilibria, and roughly how long does each take to get within 10% of it? Relate the times to the youth duration (18 yr) and adult duration (45 yr).",
      hint: "The equilibrium of each cohort is births × its duration: 630 young, 1575 adults and 525 elderly. The young get within 10% in about 30 years; the adults and elderly need about a century, because they wait on the youth stage and then drain through the 45-year adult stage.",
      link: { label: "Aging chain", hash: "/m/aging" },
    },
    {
      prompt:
        "Still in the aging chain, compare <b>Longer lives</b> (elder lifespan 28 yr) with the default (15 yr). Births are unchanged, so why does total population rise, and which cohort carries all of the increase? What does that imply for long-term care demand?",
      hint: "Only the elderly stock's outflow changes; its equilibrium becomes 20 × 28 = 560 instead of 300.",
      link: { label: "Aging chain", hash: "/m/aging" },
    },
    {
      prompt:
        "Open Aging Chain with PDY and load <b>Rapid hiring</b> (40/yr). Read the rookie, experienced and veteran stocks after 2, 5 and 20 years and compute the rookie share each time. Repeat with <b>Steady</b> (20/yr, which starts in equilibrium). Why is the rookie share higher under rapid hiring at every reading, and why does the gap close in the long run?",
      hint: "At year 5 rookies are about 13% of staff under rapid hiring against a constant 8% under Steady. In equilibrium every stock is hiring × its residence time (60, 500, 160 or 120, 1000, 320), so the long-run mix is the same; the extra dilution lasts only while the experienced ranks catch up with the larger intake.",
      link: { label: "Aging Chain with PDY", hash: "/m/agingPDY" },
    },
    {
      prompt:
        "In Coflow with Experience, load <b>Steady team</b> (hiring 10, time to quit 8 yr, new hires 0 yr). Note average experience. Switch to <b>Hiring surge (dilution)</b> and watch the average fall, then recover. Finally try <b>Hire veterans</b>. Which slider changes the long-run average and which only changes the path?",
      hint: "With no decay, equilibrium average experience = new-hire experience + average time in the firm.",
      link: { label: "Coflow with Experience", hash: "/m/coflowExperience" },
    },
    {
      prompt:
        "Show why a delay is not a coflow. In the Coflow molecule, set hiring to 0 and watch average experience: it keeps rising by a year every year, because experience accrues while nobody joins. Now imagine the attribute were labour per machine with no accrual: if investment stopped, what should happen to the average, and what would a SMOOTH towards the new-machine value wrongly do?",
      hint: "With no inflow and first-order outflow, leavers remove the average, so the average of a conserved attribute cannot change.",
      link: { label: "Coflow", hash: "/m/coflow" },
    },
    {
      prompt:
        "Open Cascaded Coflow with the <b>Value added</b> preset. Predict the equilibrium average cost in stage 1 and stage 2 before running (input cost 1 $/u, 0.5 $/u·wk added, 4 weeks per stage), then check. What happens to stage-2 cost if you lengthen the stage time to 8 weeks?",
      hint: "Each stage adds value added × stage time on average: 1 + 2 = 3 in stage 1, 3 + 2 = 5 in stage 2.",
      link: { label: "Cascaded Coflow", hash: "/m/cascadedCoflow" },
    },
    {
      prompt:
        "Pen and paper: a professional firm has three ranks with average stays of 2, 6 and 25 years, and 40% are promoted at each review (the rest leave). Use Little's Law to find the equilibrium share in each rank. Then explain in words what happens to promotion odds if the firm's growth falls from 10%/yr to zero.",
      hint: "Per new hire: 2 years at rank 1, 0.4 × 6 at rank 2, 0.16 × 25 at rank 3; divide each by the total.",
    },
    {
      prompt:
        "Explore the health and workforce applications that use these structures: experience dilution in project teams, ageing and long-term care, and training pipelines for doctors and nurses. For each, name the aging chain or coflow and the attribute that matters.",
      link: { label: "Hiring and the experience of a workforce", hash: "/apps/projects/experience-dilution" },
    },
  ],
  pitfalls: [
    "Modelling an embodied attribute (labour or energy per machine, average interest rate, price of orders in backlog) as a SMOOTH towards the value for new units. It only matches the coflow in equilibrium and fails whenever the main stock grows, shrinks or stops turning over.",
    "Using a single first-order stock when exit depends strongly on age, for example letting the youngest full professors retire as often as the oldest, or newborns reproduce.",
    "Treating a population or headcount target as if it responds quickly to fertility or hiring changes: the age structure carries decades of momentum.",
    "Assuming headcount growth gives proportional output growth. Rookies are less productive and absorb mentors' time, so output lags and can even fall at first.",
    "Removing the marginal (new-unit) attribute on the outflow instead of the average attribute, which breaks conservation of the attribute.",
    "Forgetting nonconserved flows such as on-the-job accrual, obsolescence or write-downs, or mixing time units in them (experience in weeks accrued per year of simulated time).",
    "Disaggregating more than the data or the purpose support; Meadows found four cohorts adequate for world population, while a national study used one per year.",
  ],
  molecules: ["aging", "agingPDY", "coflow", "coflowExperience", "cascadedCoflow", "cascade", "material"],
};
