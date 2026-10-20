import type { StudyChapter } from "@/data/sterman/types";

export const CHAPTER: StudyChapter = {
  id: "ch10",
  number: "10",
  title: "Path dependence and positive feedback",
  part: "Part III: The dynamics of growth",
  pages: "349-406",
  summary:
    "Why do whole markets, technologies and conventions end up locked in to one option, even when every option looked equally good at the start? Path dependence is a signature of systems dominated by reinforcing feedback. Small, often unobservable events early on are amplified until one outcome dominates, and the accumulated installed base, skills and complementary assets then make switching prohibitively costly. The idea builds from the Polya urn (linear and nonlinear) to the VHS versus Betamax battle, a survey of more than three dozen reinforcing loops that drive corporate growth (Sterman 2000), the question of whether economies lock in to inferior technologies and what breaks lock-in, and finally a continuous-time model of standards formation in which the network effect grows stronger as the market grows.",
  bigIdeas: [
    {
      title: "Path dependence: history, not just structure, picks the outcome",
      text: "A system is path dependent when its final equilibrium depends on its starting point and on random shocks along the way, so that small, early, unpredictable events decide where it ends up. Even when all end states are equally attractive at the outset, noise breaks the symmetry and reinforcing loops magnify the difference until it is large and lasting. Railway gauges, the side of the road people drive on, QWERTY and the handedness of the amino acids in living things are all examples. The claim here is that this is not exotic: it appears wherever reinforcing feedback dominates.",
      pages: "349-353",
    },
    {
      title: "Stable versus unstable equilibria: the bowl and the upturned bowl",
      text: "A marble in a bowl returns to the bottom wherever it starts, because the restoring force grows with displacement: negative feedback gives an attractor with a basin of attraction, and the end state does not depend on the path. Turn the bowl over and the top is still an equilibrium, but any nudge creates a force that pushes the marble further away, so it is a repellor governed by positive feedback. Which way the marble rolls depends entirely on the first tiny disturbance. Path dependence is therefore a property of locally unstable equilibria, even though the system as a whole stays globally bounded.",
      pages: "351-352",
    },
    {
      title: "Lock-in: early choices are cheap, later reversals are very expensive",
      text: "At the top of the upturned bowl a breath of air decides the outcome; once the marble is rolling, pushing it back takes far more effort, and the effort grows with distance and speed. In social systems the equivalent is the switching cost that grows with the installed base, infrastructure and habits built around one choice. Sweden could switch from left- to right-hand driving overnight in 1967 because its car population was small and most growth lay ahead; Japan, with far more cars per square mile, is firmly locked in. The window for changing a path-dependent outcome closes as the stocks behind it accumulate.",
      pages: "352-353",
    },
    {
      title: "The Polya urn: one reinforcing and one balancing loop per colour",
      text: "Add one stone per period to a jar, choosing black with probability equal to the current fraction of black stones. More black stones raise the chance of adding black (reinforcing), but more stones in total dilute the effect of each new one (balancing). Early on each stone moves the proportion a lot and the reinforcing loop dominates; as the jar fills, the balancing dilution catches up and the proportion freezes. Polya proved the proportion always converges, and that for one stone per period starting from one of each colour every final proportion between 0 and 1 is equally likely. The lock comes from accumulation: reversing a 2:1 lead with three stones takes three white draws in a row (about a 10% chance), but reversing 200:100 would take 300 in a row, so the system settles wherever its early history left it.",
      pages: "354-356",
    },
    {
      title: "Nonlinear Polya processes: winner takes all",
      text: "In the linear urn the probability of adding a colour equals its share, so every point on the 45 degree line is an equilibrium with neutral stability. If instead the probability rises more than proportionately above one-half and falls more than proportionately below it, only three equilibria remain: 0, 0.5 and 1. The middle one is unstable and the extremes are strong attractors, so runs quickly head for all-black or all-white. Lock-in becomes faster and more complete, yet which colour wins is still decided by chance early on; a run of draws can even reverse an early lead.",
      pages: "357-359",
    },
    {
      title: "Reading stability from a phase plot",
      text: "Plot the probability of adding a colour (or a firm's market share) against its current share of the stock. Equilibria are where the curve crosses the 45 degree line. Where the curve lies above the line the share of the stock rises; below it, it falls. An equilibrium is unstable when the curve's slope there exceeds 1 (positive feedback dominates) and stable when the slope is below 1 (negative feedback dominates), so changes in slope mark shifts in loop dominance.",
      pages: "357-358, 399-400",
    },
    {
      title: "Random shocks stand for what the model leaves out",
      text: "Consumers did not toss coins to choose VCR formats. In a path-dependent model the noise represents events outside the model boundary, for which we have no causal theory. Calling Betamax's defeat bad luck is therefore unsatisfying; the modeller's job is to widen the boundary so more of the variation is explained by structure, such as licensing strategy, production scale and the supply of prerecorded tapes.",
      pages: "363",
    },
    {
      title: "Positive feedback is the engine of corporate growth",
      text: "Sterman (2000) catalogues more than three dozen reinforcing loops that can make a firm grow: awareness through advertising, sales effort, word of mouth and media; spreading fixed development costs over expected volume; scale and scope economies; learning curves and process improvement; network and complementary-goods effects; differentiation and new products; market power; acquisitions; workforce quality; cost of capital; influence over the rules; and stretch goals. Most of them act twice, once by enlarging the total market and once by raising the firm's share of it. Their delays differ greatly: advertising responds quickly, while sales forces, experience and reputation take years to build and can be lost fast.",
      pages: "364-382",
    },
    {
      title: "Expectations can be self-fulfilling when unit costs fall with volume",
      text: "When most costs are incurred before the first unit is sold, fixed cost per unit depends on the volume the firm expects to sell. A firm that expects to dominate prices low, wins share, and so lowers its costs further; a cautious rival sells less and confirms its own caution. Both firms see their beliefs confirmed. The same logic applies to third parties deciding which platform to write software or make tapes for, which is why firms try to shape expectations of who will win.",
      pages: "367-368, 370-371",
    },
    {
      title: "Synergy, conflict and shifting loop dominance",
      text: "The most successful firms, the growth tigers, ran many reinforcing loops together rather than relying on one. But some loops conflict: charging a premium for differentiation works against pricing low to drive volume, learning and network effects. Sony's premium, proprietary strategy suited markets with settled standards but not one where installed base and tape availability decided attractiveness. Mainframe and minicomputer makers fell because the loops that had made them strong (service, differentiation) weakened as computers became cheap and compatibility mattered more, and their capabilities no longer matched the dominant loops.",
      pages: "382-385, 390-391",
    },
    {
      title: "Inferior lock-in and the limits to lock-in",
      text: "The stronger the loops that favour the leader regardless of product merit (network, compatibility, development cost, market power, influence over the rules), the more likely the winner is not the best technology, as is often argued for QWERTY. But technologies keep evolving and tastes coevolve with them, so judging a winner inferior is harder than it looks. Lock-in is not forever either: mass extinctions, depressions and changes in technological architecture can empty the urn and reopen the contest, as the shift from the coal, steam, rail and telegraph ensemble to oil, cars and electricity after the 1930s shows.",
      pages: "387-391",
    },
    {
      title: "In the standards model the network effect strengthens as the market grows",
      text: "Unlike the Polya urn, where only proportions matter, the standards model makes attractiveness depend on the absolute size of each installed base relative to a threshold. When few people own any machine, compatibility hardly matters, the 50% split is stable and a late entrant with a better product can catch up. As the total base grows, the slope of the phase plot at 50% passes 1, the split becomes unstable, and the leader pulls away. The window of opportunity for a challenger therefore closes as the market grows, which is how VHS overtook Betamax just before compatibility became decisive.",
      pages: "391-403",
    },
  ],
  diagrams: [
    {
      kind: "cld",
      title: "Network and complementary-goods effects lock in a standard",
      cld: {
        size: [720, 360],
        vars: [
          { id: "salesA", label: "Sales of A", x: 110, y: 60 },
          { id: "baseA", label: "Installed base of A", x: 120, y: 230 },
          { id: "comp", label: "Complements made for A", x: 300, y: 320 },
          { id: "attA", label: "Attractiveness of A", x: 330, y: 160 },
          { id: "share", label: "A's market share", x: 380, y: 60 },
          { id: "salesB", label: "Sales of B", x: 620, y: 60 },
          { id: "baseB", label: "Installed base of B", x: 600, y: 230 },
          { id: "attB", label: "Attractiveness of B", x: 520, y: 320 },
        ],
        links: [
          { from: "salesA", to: "baseA", sign: "+", curve: 0 },
          { from: "baseA", to: "attA", sign: "+", curve: 0 },
          { from: "attA", to: "share", sign: "+", curve: 0 },
          { from: "share", to: "salesA", sign: "+", curve: 0 },
          { from: "baseA", to: "comp", sign: "+", curve: 0 },
          { from: "comp", to: "attA", sign: "+", curve: 0 },
          { from: "share", to: "salesB", sign: "−", curve: 0 },
          { from: "salesB", to: "baseB", sign: "+", curve: 0 },
          { from: "baseB", to: "attB", sign: "+", curve: 0 },
          { from: "attB", to: "share", sign: "−", curve: 0 },
        ],
        loops: [
          { type: "R", label: "R1", x: 230, y: 130 },
          { type: "R", label: "R2", x: 255, y: 240 },
          { type: "R", label: "R3", x: 520, y: 150 },
        ],
        caption:
          '<span class="chip chipR">R1</span> network effect: a larger installed base makes A more useful to the next buyer, raising its share and its sales. <span class="chip chipR">R2</span> complementary goods: third parties make tapes or software for the larger base, which raises attractiveness again. <span class="chip chipR">R3</span> the same advantage starves the rival: B sells less, its base and appeal fall behind, and A\'s share rises further. With no limiting loop in the picture, the only stable outcomes are dominance or extinction.',
      },
      pages: "360-362, 370-371, 392-394",
    },
    {
      kind: "cld",
      title: "Polya urn: amplification and dilution",
      cld: {
        vars: [
          { id: "black", label: "Black stones", x: 110, y: 135 },
          { id: "added", label: "Black stones added", x: 260, y: 40 },
          { id: "prop", label: "Proportion black", x: 410, y: 135 },
          { id: "total", label: "Total stones", x: 260, y: 230 },
          { id: "white", label: "White stones", x: 450, y: 230 },
        ],
        links: [
          { from: "black", to: "prop", sign: "+", curve: 0 },
          { from: "prop", to: "added", sign: "+", curve: 0 },
          { from: "added", to: "black", sign: "+", curve: 0 },
          { from: "black", to: "total", sign: "+", curve: 0 },
          { from: "total", to: "prop", sign: "−", curve: 0 },
          { from: "white", to: "total", sign: "+", curve: 0 },
        ],
        loops: [
          { type: "R", label: "R1", x: 260, y: 100 },
          { type: "B", label: "B1", x: 260, y: 170 },
        ],
        caption:
          '<span class="chip chipR">R1</span> the more black stones, the likelier the next stone is black. <span class="chip chipB">B1</span> every stone added also enlarges the jar, so each new stone shifts the proportion less. Early on R1 dominates and chance events matter a lot; as stones accumulate B1 catches up and the proportion freezes wherever history left it. The white side has the same pair of loops (not drawn).',
      },
      pages: "354-356",
    },
    {
      kind: "cld",
      title: "Engines of corporate growth and a limit",
      cld: {
        size: [760, 400],
        vars: [
          { id: "sales", label: "Sales", x: 380, y: 200 },
          { id: "attr", label: "Product attractiveness", x: 140, y: 200 },
          { id: "exp", label: "Cumulative experience", x: 600, y: 70 },
          { id: "cost", label: "Unit cost", x: 380, y: 40 },
          { id: "price", label: "Price", x: 150, y: 60 },
          { id: "diff", label: "Investment in differentiation", x: 230, y: 360 },
          { id: "base", label: "Installed base", x: 620, y: 290 },
          { id: "wom", label: "Word of mouth", x: 640, y: 190 },
          { id: "pot", label: "Potential customers", x: 450, y: 370 },
        ],
        links: [
          { from: "sales", to: "exp", sign: "+", curve: 0 },
          { from: "exp", to: "cost", sign: "−", curve: 0 },
          { from: "cost", to: "price", sign: "+", curve: 0 },
          { from: "price", to: "attr", sign: "−", curve: 0 },
          { from: "attr", to: "sales", sign: "+", curve: 0 },
          { from: "sales", to: "diff", sign: "+", curve: 0 },
          { from: "diff", to: "attr", sign: "+", curve: 0 },
          { from: "sales", to: "base", sign: "+", curve: 0 },
          { from: "base", to: "wom", sign: "+", curve: 0 },
          { from: "wom", to: "sales", sign: "+", curve: 0 },
          { from: "base", to: "pot", sign: "−", curve: 0 },
          { from: "pot", to: "sales", sign: "+", curve: 0 },
        ],
        loops: [
          { type: "R", label: "R1", x: 300, y: 120 },
          { type: "R", label: "R2", x: 250, y: 270 },
          { type: "R", label: "R3", x: 560, y: 230 },
          { type: "B", label: "B1", x: 500, y: 300 },
        ],
        caption:
          '<span class="chip chipR">R1</span> learning curve: more sales build experience, cut unit costs and allow lower prices. <span class="chip chipR">R2</span> differentiation: revenue funds features, quality and service that raise attractiveness. <span class="chip chipR">R3</span> word of mouth from a growing installed base. Each reinforcing loop could equally run as a vicious cycle. <span class="chip chipB">B1</span> sales use up the pool of potential customers: every growth engine eventually meets limits like this one.',
      },
      pages: "364-385",
    },
    {
      kind: "sequence",
      title: "How a standards battle tips",
      steps: [
        { label: "Level field", detail: "Rival formats are equally attractive; total installed base is tiny" },
        { label: "Noise and strategy", detail: "Small differences in price, features, licensing or luck move shares a little" },
        { label: "Weak network loop", detail: "Compatibility barely matters, so the 50% split is self-correcting" },
        { label: "Base grows", detail: "The network loop strengthens; the phase-plot slope at 50% rises towards 1" },
        { label: "Tipping", detail: "The 50% split becomes unstable and the share distribution splits in two" },
        { label: "Lock-in", detail: "The leader approaches 100%; switching costs make reversal prohibitive" },
      ],
      note: "A late entrant can still win before the tipping step, when product attributes dominate choice. VHS took the lead just as prerecorded tapes made compatibility decisive.",
      pages: "396-403",
    },
    {
      kind: "cycle",
      title: "Lock-in and its undoing",
      nodes: [
        "Several equally viable options",
        "Chance events break the symmetry",
        "Reinforcing loops amplify the lead",
        "A dominant standard locks in",
        "Inertia, sunk skills and switching costs",
        "Shock or architectural shift empties the urn",
      ],
      center: "Path dependence",
      note: "Depressions, wars, mass extinctions or new product architectures can sweep away the stocks that held a standard in place and reopen the contest.",
      pages: "387-391",
    },
  ],
  formulations: [
    {
      name: "Linear Polya process",
      equations: [
        "Proportion Black = Black Stones / (Black Stones + White Stones)",
        "Black Stones Added per Period = 1 if Random Draw < Proportion Black, else 0",
        "White Stones Added per Period = 1 − Black Stones Added per Period",
        "Black Stones(t+1) = Black Stones(t) + Black Stones Added per Period",
      ],
      explain:
        "Random Draw is uniform on [0, 1]. The probability of adding a colour equals its current share, so every proportion is an equilibrium (neutral stability). The proportion converges, but to a value set by the early random draws; starting from one stone of each colour, the limiting proportion is uniformly distributed between 0 and 1.",
      pages: "354-356",
    },
    {
      name: "Nonlinear Polya process and its equilibria",
      equations: [
        "P(add black) = f(Proportion Black), with f(0) = 0, f(0.5) = 0.5, f(1) = 1",
        "Equilibrium: f(x*) = x*",
        "Stable if f′(x*) < 1; unstable if f′(x*) > 1",
      ],
      explain:
        "When f is S-shaped (above the 45 degree line for x > 0.5, below it for x < 0.5) the interior equilibrium at one-half is unstable and the two extremes are stable attractors. Runs head for all-black or all-white, so lock-in is faster and stronger than in the linear urn, while the winner is still chosen by early chance.",
      pages: "357-359",
    },
    {
      name: "Installed base and sales in the standards model",
      equations: [
        "Installed Base_i = INTEGRAL(Sales_i, Initial Installed Base_i)",
        "Sales_i = Total Demand × Market Share_i",
      ],
      explain:
        "Each product's installed base accumulates its sales; the simple model has no discards or repeat purchases and holds total demand constant, so all the action is in how the market is shared. Adding a discard outflow (base divided by product lifetime) and replacement demand is a suggested extension. The LoopBricks Market Share molecule keeps the same pair of stocks but includes churn.",
      molecule: "marketshare",
      pages: "392",
    },
    {
      name: "Logit market share driven by attractiveness",
      equations: [
        "Market Share_i = Attractiveness_i / Σ_j Attractiveness_j",
        "Attractiveness_i = Effect of Compatibility_i × Effect of Other Factors_i",
        "Effect of Compatibility_i = EXP(Sensitivity × Installed Base_i / Threshold for Compatibility Effects)",
        "Effect of Other Factors_i = NORMAL(1, σ, seed_i)",
      ],
      explain:
        "Shares rise with own attractiveness, fall with rivals', stay between 0 and 1 and always sum to 1 for any number of firms. With exponential attractiveness this is the logit model, which can be estimated by regression. With sensitivity 2, bases of 0.2 and 0.1 times the threshold give the leader only 55%, but bases of 2 and 1 give it 88%: the same 2:1 ratio matters far more once the market is large. In the Market Share molecule attractiveness is instead the installed base raised to a power above 1, which depends only on the ratio of the bases, like the Polya urn.",
      molecule: "marketshare",
      pages: "392-396",
    },
    {
      name: "Phase plot of the network model",
      equations: [
        "B_i = Installed Base_i / Threshold;   R = B_1 / (B_1 + B_2)",
        "MS_1 = exp(s·B_2·R/(1 − R)) / [exp(s·B_2·R/(1 − R)) + exp(s·B_2)]",
      ],
      explain:
        "How firm 1's share of new sales depends on its share R of the installed base, for a given competitor base B_2. For B_2 = 0.1 the 50% point is stable and firm 1 would need about 90% of the base to tip the market; around B_2 = 0.5 the slope at 50% reaches 1; for B_2 = 1 the 50% point is unstable, with stable equilibria near 20% and at 100%. The growing total base shifts loop dominance from balancing to reinforcing.",
      pages: "399-402",
    },
    {
      name: "Learning curve",
      equations: [
        "Unit Cost = Initial Unit Cost × (Cumulative Production / Initial Cumulative Production)^(−c)",
        "c = −log2(1 − fractional cost reduction per doubling)",
      ],
      explain:
        "Unit costs fall by a fixed fraction each time cumulative experience doubles; 10 to 30% per doubling is typical. Lower costs permit lower prices, which raise both share and total demand, adding experience faster still. Because experience is a stock, the advantage builds slowly and also decays slowly if sales fall, unlike scale economies, which vanish as soon as volume drops.",
      pages: "369-370",
    },
  ],
  cases: [
    {
      title: "Railway gauge, driving side and the Swedish switch",
      text: "Early railways used many gauges, but as networks joined up, incompatible lines faced costly transshipment, so small lines converted to the gauge of the biggest networks and that gauge became more attractive still. By the 1860s the odd standard of 1.44 m (4 ft 8.5 in) was locked in. Driving side followed a similar course. Sweden drove on the left until 5 a.m. on 3 September 1967, when the whole country switched to the right. It worked partly because Sweden had under 8 million people and about 2 million cars (roughly 46 people and 12 cars per square mile); Japan in the mid 1990s had about 126 million people and 40 million cars on a smaller area, so a switch there would cost far more than it could return.",
      pages: "350-353",
    },
    {
      title: "VHS versus Betamax",
      text: "Sony's Betamax reached the market about 18 months before VHS and led on share until about 1980, yet by 1988 Sony had given up and began making VHS machines. US VCR ownership reached about 85% of households by 1994, and prerecorded tape sales passed 80 million a year, so compatibility of tapes became the main source of attractiveness. Price does not explain the reversal (VHS was about 7% cheaper in 1978 but dearer for the next three years). Longer play time helped, but the decisive differences were strategic: Matsushita and JVC licensed VHS widely and cheaply and built machines for other brands, gaining scale and distribution, while RCA gave away free tapes and encouraged VHS tape production; Betamax tape production lagged by about a year. VHS's share of tapes ran ahead of its share of the installed base, reinforcing its lead just as the network loop became strong.",
      pages: "359-363, 402-403",
    },
    {
      title: "Growth tigers and Microsoft",
      text: "A study of more than 1200 US firms found 97 growth tigers: firms growing sales at three times the S&P 500 average over 10 years and beating it on shareholder return over 5. Only 8% of the sample, they produced 15% of sales growth, 28% of job growth and 47% of profit growth, and they combined many reinforcing loops rather than relying on one. Microsoft is the paradigm: up-front development costs, scope, learning, acquisitions, market power, workforce and cost-of-capital loops, and above all network and complementary-goods effects. Its sales grew from $140 million in 1985 to $11.36 billion in 1997, a continuously compounded rate of about 37% a year (about 44% a year compounded annually); extrapolating that against nominal US GDP growth of about 5.5% a year on the same basis, Microsoft's sales would overtake GDP in about 21 years, which shows that balancing loops must eventually take over.",
      pages: "382-385",
    },
    {
      title: "Persistent profit differences and the computer industry",
      text: "If markets were dominated by balancing loops, unusually high or low profits would drift back to average. Studies of large US and UK firms found the opposite: profitability differences persist for decades, and firms near the average tend to drift towards either high or low profit, consistent with reinforcing loops acting as virtuous or vicious cycles. The computer industry shows how loop dominance can shift: IBM and Digital prospered on service and differentiation loops, but as computers became cheap and compatibility and software mattered more, those loops weakened and the same structures became death spirals for firms that did not adapt.",
      pages: "382, 390-391",
    },
  ],
  exercises: [
    {
      prompt:
        "Open the Market Share molecule and choose the No network effect preset (network effect 0). A starts with 105 customers and B with 95, a 52.5% share for A. Run it and watch A's share of the total. Explain why it neither grows nor shrinks, and which version of the Polya urn this corresponds to.",
      hint: "With network effect 0, each product wins new customers in proportion to its current base, exactly like drawing stones in proportion to their colour. Every split is an equilibrium (neutral stability).",
      link: { label: "Market Share molecule", hash: "/m/marketshare" },
    },
    {
      prompt:
        "Now run the Lock-in preset (network effect 0.7) and then Winner takes all (1.0). For each, note roughly when A's share first passes 90%. Then try network effect 0.3. How does the strength of increasing returns change the speed of lock-in, and does it change who wins?",
      hint: "In a quick check A passed 90% after about 44 months at 0.7, about 34 at 1.0 and about 94 at 0.3. A wins every time, because its tiny head start is the only asymmetry: this is the nonlinear urn with no noise.",
      link: { label: "Market Share molecule", hash: "/m/marketshare" },
    },
    {
      prompt:
        "Keep network effect 0.7 and compare churn time 6, 18 and 36 months. Does faster turnover of the installed base speed lock-in up or slow it down? Explain using the gap between market share and share of the installed base.",
      hint: "When customers leave and are replaced quickly, the installed base soon reflects recent market share, so the reinforcing loop closes faster. With slow churn, old purchases dilute the effect of each month's share, much like stones piling up in the urn.",
      link: { label: "Market Share molecule", hash: "/m/marketshare" },
    },
    {
      prompt:
        "In the Market Share molecule, attractiveness depends only on the ratio of the two bases. Compare new customers of 5 and 40 a month (default 20, network effect 0.7). Does the outcome change? Then explain, in a few sentences, why the standards model of Sterman (2000) would behave differently when the whole market is small, and what that implies for a late entrant.",
      hint: "In the molecule A still wins; only the speed changes (A passes 90% of the base after about 68 months with 5 new customers a month and about 34 with 40), because the starting bases are large or small relative to the market's eventual size. In the standards model attractiveness depends on each base relative to a fixed threshold, so when the total base is small compatibility hardly matters and the 50% split is stable. A late entrant can win only before the market grows.",
      link: { label: "Market Share molecule", hash: "/m/marketshare" },
    },
    {
      prompt:
        "Work through the competing standards case. Run Strong increasing returns, then Users switch often (6 months). Answer the case's first try-this question (when does B's user base peak and start to shrink?), and say what a firm in B's position would need to do, and by when, to reverse the outcome.",
      link: { label: "Competing standards and lock-in", hash: "/apps/business/lock-in" },
    },
    {
      prompt:
        "Pen and paper: using the logit formulation with sensitivity s = 2, confirm that bases of 0.2 and 0.1 times the threshold give the leader about 55% of sales and bases of 2 and 1 give about 88%. Then repeat with s = 4. What does a stronger network effect do to the value of an early lead?",
      hint: "Share = e^(s·B1) / (e^(s·B1) + e^(s·B2)). With s = 4 you should get about 60% and 98%.",
    },
    {
      prompt:
        "Open the alternative-fuel vehicles case. Sketch the loop linking the number of alternative vehicles, the number of fuelling stations and the attractiveness of the vehicles, and mark its polarity. Then explain why an incumbent fuel can stay locked in even if the newcomer is better, and which policies could tip the balance.",
      hint: "This is the complementary-goods loop: infrastructure follows the fleet and the fleet follows the infrastructure. Seeding both sides at once is one way to move the system off the incumbent's attractor.",
      link: { label: "Alternative-fuel vehicles", hash: "/apps/environment/alt-fuel-vehicles" },
    },
    {
      prompt:
        "Pen and paper: pick a platform market you know (an app store, a payment network, a messaging service). Draw a causal loop diagram with at least three of the growth loops described here and one balancing limit. Identify one pair of loops whose strategies conflict, as differentiation and low-price volume did for Sony.",
    },
  ],
  pitfalls: [
    "Treating the random shocks in a path-dependent model as the explanation. They stand for events outside the model boundary; the aim is to widen the boundary until more of the outcome is explained by structure.",
    "Assuming the first mover always wins. Early on the network loop is weak, so a later entrant with better attributes, lower prices or wider licensing can overtake, as VHS did.",
    "Assuming the winner must be the best product. When network, compatibility and market-power loops dominate, the winner may be chosen by early luck and strategy rather than merit.",
    "Treating lock-in as permanent. Architectural shifts, depressions and other shocks can remove the accumulated stocks that held a standard in place.",
    "Letting decision rules use information real actors lack: buyers do not know each format's exact installed base, and a pure ratio formulation implies 20 versus 10 machines matters as much as 20 million versus 10 million.",
    "Drawing a fresh random number every time step for noise. Real shocks are serially correlated, so pink noise is better and results then do not depend on the time step.",
    "Lumping complementary goods into the network effect. The two loops involve different actors and different delays and deserve separate structure.",
    "Pursuing loops that conflict, such as a price premium for differentiation alongside a low-price push for volume, or failing to notice that the dominant loops in your market have shifted.",
  ],
  molecules: ["marketshare", "split", "growth", "diffusion", "residence", "effectFunction"],
};
