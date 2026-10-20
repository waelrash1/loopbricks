import type { StudyChapter } from "@/data/sterman/types";

// Study guide to Sterman (2000), chapter 9. Our own words and our own diagram layouts; page numbers are printed book pages.
export const CHAPTER: StudyChapter = {
  id: "ch09",
  number: "9",
  title: "S-shaped growth: epidemics, innovation diffusion, and the growth of new products",
  part: "Part III: The dynamics of growth",
  pages: "295-348",
  summary:
    "Growth driven by a reinforcing loop always meets a limit. When the balancing loops that impose the limit act without significant delay, the result is S-shaped growth: accelerating at first, then levelling off as dominance shifts from the reinforcing loop to the balancing ones. The chapter builds a family of models on this idea. It starts with the logistic curve, turns it into the SI and SIR models of infectious disease, derives the tipping point that separates an epidemic from a fizzle, and then reuses the same structure for rumours, new ideas and new products, ending with the Bass diffusion model, fads and repeat purchases. Running through it is a methodological warning: these models fit historical data well, but a good fit says little about whether the structure is right or whether the model will respond correctly to policy.",
  bigIdeas: [
    {
      title: "S-shaped growth is a nonlinear shift in loop dominance",
      text: "Any quantity that grows by positive feedback (adopters, infected people, subscribers) does so inside a niche with a finite carrying capacity. Early on the reinforcing loop dominates and growth looks exponential. As the population approaches the limit, a balancing loop that was weak becomes strong, the fractional growth rate falls to zero, and the stock levels off. A smooth S only appears when that balancing feedback acts quickly. If it is delayed, you get overshoot and oscillation, and if the growth erodes the capacity itself, overshoot and collapse. Read in reverse, any S-shaped history tells you the system switched from reinforcing to balancing dominance.",
      pages: "295-296",
    },
    {
      title: "The logistic model: a fractional growth rate that falls in a straight line",
      text: "The logistic (Verhulst) model assumes the net fractional growth rate declines linearly from its maximum g* when the population is tiny to zero at the carrying capacity C. The net growth rate g*(1 − P/C)P is therefore an inverted parabola. It splits into a linear reinforcing term g*P and a nonlinear balancing term −g*P²/C that grows faster than the population. Because the parabola is symmetric, growth is fastest exactly halfway to the limit, at P = C/2, which is also the inflection point of the S. The model has a closed-form solution and can be made linear in its parameters, which is why it is so widely fitted. It is only one choice, though: the Richards family lets the fractional growth rate fall nonlinearly, the Gompertz curve puts the inflection at about 37% of capacity, and simulation lets you use whatever growth relationship the evidence supports.",
      pages: "296-300",
    },
    {
      title: "The SI epidemic is logistic growth in disguise",
      text: "Split a fixed population into susceptibles S and infectious people I. Susceptibles make c contacts per period, a share I/N of those are with infectious people, and a fraction i (the infectivity) of those transmit the disease, so infections = c·i·S·I/N. Two loops follow: a reinforcing contagion loop (more infectious people, more infections) and a balancing depletion loop (each infection removes a susceptible). Since S = N − I, the infection rate becomes c·i·I(1 − I/N), exactly the logistic with carrying capacity N. The nonlinearity comes from multiplying the two stocks: a new case needs both a susceptible and an infectious person.",
      pages: "300-303",
    },
    {
      title: "SIR: recovery adds a third loop, and the disease can now die out",
      text: "Most diseases are acute: people are infectious for a while and then recover with immunity. Kermack and McKendrick's SIR model adds a recovered stock fed by a first-order recovery rate I/d, where d is the average duration of infectivity. The recovery rate creates a second balancing loop that drains the infectious stock. Unlike the SI model, an introduced infection can now fade away before it spreads, if people recover faster than they pass it on. Sterman warns against the common habit of lumping deaths into a 'removed' stock: the dead leave the population and stop interacting, while the recovered keep mixing, so aggregating them is poor practice.",
      pages: "303-305",
    },
    {
      title: "The tipping point: will each case make more than one new case?",
      text: "An epidemic needs the infection rate to exceed the recovery rate. Rearranging c·i·S·I/N > I/d gives the threshold c·i·d·(S/N) > 1. The product c·i·d, the contact number, counts the infectious contacts one person makes while infectious; multiplied by the susceptible share it becomes the reproduction rate. Below 1 the balancing loops dominate and an arriving case produces at most a few secondary ones. Above 1 the contagion loop dominates and the disease spreads until depletion pulls the reproduction rate back below 1. Sterman's example has c = 6 per day, i = 0.25 and d = 2 days: a contact number of 3, an epidemic that infects nearly all of 10,000 people within three weeks, peaking at over 2,000 new cases a day around day 9. Cutting contacts to 2 per day puts the system exactly at the threshold.",
      pages: "305-309",
    },
    {
      title: "Epidemics stop before everyone is infected, and they are not symmetric",
      text: "In the SIR model the epidemic ends because the susceptible pool falls far enough that each case generates fewer than one replacement, not because the pool is exhausted. Some people therefore escape infection, and the stronger the contagion loop, the fewer escape. The infectious population also rises faster than it falls, unlike the symmetric bell of the logistic. Long-lasting diseases such as HIV can have high contact numbers despite low contact rates and infectivity, simply because d is so long (a median incubation of about 10 years).",
      pages: "306-308",
    },
    {
      title: "Herd immunity and eradication do not need everyone to be immune",
      text: "Because the threshold is a ratio, eradication only requires holding the reproduction rate below 1 so that cases resolve faster than they arise. Vaccinating a fraction of the population lowers S/N and can push the whole community below the tipping point, protecting the unvaccinated too: this is herd immunity. The condition can be lost if contact rates rise, or if new susceptibles accumulate through births, migration or waning immunity. Sterman shows a population challenged by one infected arrival every 50 days while its contact rate creeps up: no epidemic for 500 days, then successive and smaller waves as the system crosses the threshold, depletes susceptibles, and crosses again. Measles cycled roughly every two years before mass vaccination for the same reason, with births refilling the susceptible pool.",
      pages: "309-314",
    },
    {
      title: "Contact rate and infectivity are social, not just biological",
      text: "Where a population sits relative to the tipping point depends on social structure and infrastructure as much as on the pathogen. Urban density raises contact rates; clean water, hand washing and condom use lower infectivity. A change in practice can create a contagion loop that did not exist before. Mad cow disease is the clearest example: feeding cattle meal made from rendered offal opened a transmission pathway and pushed BSE far past its threshold.",
      pages: "314-316",
    },
    {
      title: "Incubation delays blunt quarantine and just-in-time responses",
      text: "Real diseases have a latent period, and people are often infectious before they show symptoms (chicken pox, hepatitis A, HIV). Splitting the infectious stock into asymptomatic and symptomatic stages (an SEIR-like chain) shows why: the infections that matter most are generated by people nobody yet knows are ill. Policies triggered by visible cases, such as quarantining the symptomatic or launching vaccination once cases pass a threshold, act on a lagging indicator, so much of the epidemic is already locked in by the time they start. The UK ban on contaminated cattle feed behaved like this kind of late response.",
      pages: "316-318",
    },
    {
      title: "New ideas and products spread like infections, and the Bass model solves the startup problem",
      text: "Word of mouth, seeing a product in use, keeping up with peers and network effects are all forms of social contagion. Replace susceptibles with potential adopters and infectives with adopters and you have the logistic diffusion model. It has a flaw: zero adopters is an equilibrium, so it cannot explain where the first adopters came from. Bass (1969) added a constant external influence, usually read as advertising, that converts a fixed fraction a of potential adopters each period. Adoption is then a·P + c·i·P·A/N. Early sales come almost entirely from the external channel, word of mouth soon takes over, and the advertising contribution shrinks as the pool empties.",
      pages: "323-334",
    },
    {
      title: "A good historical fit does not validate a model",
      text: "Logistic and Bass curves fit an enormous range of data. But different growth models can fit the same history equally well and still forecast very different futures, and by the time enough data exist to tell them apart the forecast is no longer useful. Worse, fit says nothing about whether the model will respond correctly to policies. If the real growth is driven partly by loops the model omits (such as third-party software for a computer platform), the estimated word-of-mouth strength silently absorbs them, and the model recommends the wrong lever. As Sterman puts it, \"A model may fit the data perfectly for the wrong reasons\" (p. 331). Use data to find flaws, not to defend a model.",
      pages: "328-331",
    },
    {
      title: "Beyond first purchase: fads, discards and repeat sales",
      text: "The Bass model is a first-purchase model in which adopters never stop using the product or stop talking about it. Splitting adopters into active and former users turns it into the product equivalent of SIR, with its own tipping point c·i·d·(P/N), where d is now the duration of active use: a product with genuine word of mouth can still fail if users drop it faster than they recruit others. Letting discarded units send owners back to the potential pool works like waning immunity and keeps sales from falling to zero; separating initial from repeat purchases lets sales settle at a replacement level after the first-purchase boom. Advertising itself is usually funded from revenue, which makes it part of the feedback structure rather than a constant.",
      pages: "339-346",
    },
  ],
  diagrams: [
    {
      kind: "cld",
      title: "The SIR epidemic: contagion against depletion and recovery",
      pages: "301-305",
      cld: {
        size: [680, 300],
        vars: [
          { id: "S", label: "Susceptible", x: 80, y: 200 },
          { id: "IR", label: "Infection rate", x: 270, y: 100 },
          { id: "I", label: "Infectious", x: 360, y: 240 },
          { id: "RR", label: "Recovery rate", x: 500, y: 100 },
          { id: "R", label: "Recovered", x: 610, y: 240 },
          { id: "CI", label: "Contacts × infectivity", x: 110, y: 40 },
          { id: "D", label: "Infectious period", x: 590, y: 35 },
        ],
        links: [
          { from: "S", to: "IR", sign: "+", curve: 55 },
          { from: "IR", to: "S", sign: "−", curve: 55 },
          { from: "IR", to: "I", sign: "+", curve: 55 },
          { from: "I", to: "IR", sign: "+", curve: 55 },
          { from: "I", to: "RR", sign: "+", curve: 55 },
          { from: "RR", to: "I", sign: "−", curve: 55 },
          { from: "RR", to: "R", sign: "+", curve: 0 },
          { from: "CI", to: "IR", sign: "+", curve: 15 },
          { from: "D", to: "RR", sign: "−", curve: 0 },
        ],
        loops: [
          { type: "B", label: "B1", x: 175, y: 150 },
          { type: "R", label: "R1", x: 315, y: 170 },
          { type: "B", label: "B2", x: 430, y: 170 },
        ],
        caption:
          '<span class="chip chipR">R1</span> Contagion: more infectious people generate more infections. <span class="chip chipB">B1</span> Depletion: each infection removes a susceptible, so contagion runs out of people to reach. <span class="chip chipB">B2</span> Recovery: infectious people recover after an average <b>infectious period</b> d. The epidemic takes off only if R1 outweighs B1 and B2 when the disease arrives, that is if <code>c·i·d·(S/N) &gt; 1</code>. Drop the recovery loop and you have the SI model, which is the logistic curve.',
      },
      note: "Our own layout of the structure in Sterman's SI and SIR figures. The two loops on the left are the generic S-shaped growth pair; the recovery loop on the right is what creates a threshold.",
    },
    {
      kind: "cld",
      title: "The Bass diffusion model: an external push and word of mouth",
      pages: "332-334",
      cld: {
        size: [660, 300],
        vars: [
          { id: "P", label: "Potential adopters", x: 100, y: 150 },
          { id: "AR", label: "Adoption rate", x: 320, y: 150 },
          { id: "A", label: "Adopters", x: 560, y: 150 },
          { id: "ADV", label: "Adoption from advertising", x: 320, y: 45 },
          { id: "WOM", label: "Adoption from word of mouth", x: 320, y: 255 },
          { id: "EFF", label: "Ad effectiveness", x: 95, y: 40 },
          { id: "PC", label: "Persuasive contacts", x: 570, y: 255 },
        ],
        links: [
          { from: "P", to: "ADV", sign: "+", curve: 0 },
          { from: "ADV", to: "AR", sign: "+", curve: 0 },
          { from: "AR", to: "P", sign: "−", curve: 0 },
          { from: "AR", to: "A", sign: "+", curve: 0 },
          { from: "P", to: "WOM", sign: "+", curve: 0 },
          { from: "WOM", to: "AR", sign: "+", curve: 0 },
          { from: "A", to: "WOM", sign: "+", curve: 0 },
          { from: "EFF", to: "ADV", sign: "+", curve: 0 },
          { from: "PC", to: "WOM", sign: "+", curve: 0 },
        ],
        loops: [
          { type: "B", label: "B1", x: 250, y: 118 },
          { type: "B", label: "B2", x: 250, y: 185 },
          { type: "R", label: "R1", x: 400, y: 185 },
        ],
        caption:
          '<span class="chip chipB">B1</span> Saturation through advertising: a constant fraction of the remaining pool adopts each period, so this channel is strongest at launch and fades. <span class="chip chipR">R1</span> Word of mouth: adopters persuade potential adopters, so adoption feeds on itself. <span class="chip chipB">B2</span> Market saturation: word of mouth needs potential adopters to talk to. Adoption = <code>a·P + c·i·P·A/N</code>; in the app, <code>p</code> plays the role of a and <code>q</code> of c·i.',
      },
      note: "Without B1 (a = 0) and with no initial adopters, nothing ever happens: the startup problem of the logistic model.",
    },
    {
      kind: "cld",
      title: "Discards return owners to the market",
      pages: "342-345",
      cld: {
        size: [620, 300],
        vars: [
          { id: "P", label: "Potential adopters", x: 110, y: 140 },
          { id: "AR", label: "Adoption rate", x: 300, y: 55 },
          { id: "A", label: "Adopters", x: 490, y: 140 },
          { id: "DR", label: "Discard rate", x: 300, y: 225 },
          { id: "L", label: "Average product life", x: 500, y: 270 },
        ],
        links: [
          { from: "P", to: "AR", sign: "+", curve: 55 },
          { from: "AR", to: "P", sign: "−", curve: 55 },
          { from: "AR", to: "A", sign: "+", curve: 55 },
          { from: "A", to: "AR", sign: "+", curve: 55 },
          { from: "A", to: "DR", sign: "+", curve: 55 },
          { from: "DR", to: "A", sign: "−", curve: 55 },
          { from: "DR", to: "P", sign: "+", curve: 0 },
          { from: "L", to: "DR", sign: "−", curve: 0 },
        ],
        loops: [
          { type: "B", label: "B1", x: 205, y: 98 },
          { type: "R", label: "R1", x: 395, y: 98 },
          { type: "B", label: "B2", x: 395, y: 183 },
          { type: "R", label: "R2", x: 285, y: 145 },
        ],
        caption:
          '<span class="chip chipB">B1</span> Market saturation and <span class="chip chipR">R1</span> word of mouth, as in the Bass model. <span class="chip chipB">B2</span> Discard: the more units in use, the more wear out each period, with an average <b>product life</b>. <span class="chip chipR">R2</span> Replacement: discards refill the pool of potential adopters, which sustains adoption. The same structure, read as epidemiology, is waning immunity: recovered people drift back into the susceptible pool.',
      },
      note: "Sales rise, peak and then settle at a replacement level instead of falling to zero.",
    },
    {
      kind: "sequence",
      title: "One structure, many models: how the chapter builds up",
      pages: "296-346",
      steps: [
        { label: "Logistic", detail: "Fractional growth falls linearly to zero at capacity" },
        { label: "SI", detail: "Contagion meets depletion; carrying capacity is the whole population" },
        { label: "SIR", detail: "A recovery loop creates a tipping point" },
        { label: "Extended SIR", detail: "Incubation, quarantine, vaccination, waning immunity" },
        { label: "Logistic diffusion", detail: "Adopters infect potential adopters by word of mouth" },
        { label: "Bass", detail: "An external channel starts adoption from zero" },
        { label: "Fads and repurchase", detail: "Adopters stop using, discard and buy again" },
      ],
      note: "Each step relaxes one restrictive assumption of the step before. That habit, finding the hidden assumption and reformulating, is the chapter's real lesson in modelling.",
    },
  ],
  formulations: [
    {
      name: "Logistic growth",
      equations: [
        "Net Growth = g*·(1 − P/C)·P = g*·P − g*·P²/C",
        "Inflection (fastest growth) at P = C/2, where Net Growth = g*·C/4",
        "P(t) = C / (1 + exp(−g*·(t − h))),  h = ln(C/P(0) − 1) / g*",
      ],
      explain:
        "g* is the fractional growth rate when the population is small and C the carrying capacity. The first term is a linear reinforcing loop; the second is a balancing loop that strengthens with the square of the population. The closed-form solution is an S centred on time h. The logit transform ln(P/(C − P)) = ln(P(0)/(C − P(0))) + g*·t is linear in time, which is how the model is fitted by ordinary least squares.",
      molecule: "logistic",
      pages: "296-298, 326-327",
    },
    {
      name: "SI and SIR epidemic models",
      equations: [
        "S = INTEGRAL(−IR, N − I0 − R0)",
        "I = INTEGRAL(IR − RR, I0)",
        "R = INTEGRAL(RR, R0)",
        "IR = c·i·S·(I/N)",
        "RR = I / d",
      ],
      explain:
        "c is the contact rate (people contacted per person per period), i the infectivity (probability that a contact with an infectious person transmits the disease) and d the average duration of infectivity. I/N is the chance that a random contact is with an infectious person. Without the recovery flow (the SI model) S + I = N and the infection rate reduces to the logistic c·i·I·(1 − I/N). With recovery the model is second order and can produce either an epidemic or a fizzle. Try it in the health case /apps/health/epidemic, where R₀ = c·i·d is set directly.",
      molecule: "diffusion",
      pages: "300-305",
    },
    {
      name: "Threshold theorem and herd immunity",
      equations: [
        "Epidemic if IR > RR, i.e. c·i·d·(S/N) > 1",
        "Contact number = c·i·d (often written R₀)",
        "Reproduction rate = c·i·d·(S/N)",
        "Immune share needed to block spread ≈ 1 − 1/(c·i·d)",
      ],
      explain:
        "The tipping point is where one infectious person, over their infectious period, generates exactly one new case. Raising contacts or infectivity, or lengthening the infectious period, strengthens the contagion loop relative to the recovery loop. Immunising people lowers S/N directly. With an imperfect vaccine of effectiveness e, the vaccinated share must be (1 − 1/R₀)/e, which can exceed 100% for very contagious diseases.",
      pages: "305-312",
    },
    {
      name: "Adding an incubation stage (SEIR-type chain)",
      equations: [
        "Exposed (asymptomatic) = INTEGRAL(IR − Onset, E0)",
        "Symptomatic = INTEGRAL(Onset − RR, 0)",
        "Onset = Exposed / Incubation time",
        "RR = Symptomatic / Duration of illness",
        "IR = (cE·iE·Exposed + cS·iS·Symptomatic) · S / N",
      ],
      explain:
        "The extension Sterman sets as a challenge splits the infectious population into an asymptomatic stage and a symptomatic stage, each a first-order delay. The two stages can have different contact rates (the sick often stay in bed) and infectivities. When the asymptomatic stage is infectious and long, most transmission happens before anyone looks ill, which weakens quarantine and any vaccination programme triggered by visible cases. Replacing first-order stages with higher-order delays (chapter 11) gives more realistic incubation distributions.",
      molecule: "cascade",
      pages: "316-318",
    },
    {
      name: "Bass diffusion model",
      equations: [
        "A = INTEGRAL(AR, A0),  P = INTEGRAL(−AR, N − A0)",
        "AR = a·P + c·i·P·A/N",
        "In marketing notation: AR = (p + q·A/N)·P with p = a, q = c·i",
        "Peak adoption (with A0 = 0) at t* = ln(q/p) / (p + q)",
      ],
      explain:
        "a (or p) is the fraction of potential adopters converted each period by external sources such as advertising; c·i (or q) is the strength of word of mouth. Only the product c·i can be estimated from sales data. For the DEC VAX 11/750 in Europe Sterman reports a ≈ 0.011 per year and c·i ≈ 1.33 per year with N = 7600 units. When q is much larger than p the curve looks like a logistic; when p dominates, adoption is highest at launch and simply decays.",
      molecule: "diffusion",
      pages: "332-334",
    },
    {
      name: "Fads, discards and repeat purchases",
      equations: [
        "Active adopters = INTEGRAL(AR − Discontinuation, …),  Discontinuation = Active / d",
        "Fad tipping point: c·i·d·(P/N) > 1",
        "Discards = Adopters / Average product life (flow back to Potential adopters)",
        "Sales = Initial purchases + Adopters · Average consumption per adopter",
      ],
      explain:
        "Only active adopters spread word of mouth, so the product inherits the SIR threshold. Discards that return owners to the potential pool mimic waning immunity and give a replacement floor under sales. For consumables it is cleaner to keep adoption and purchasing separate: adopters buy once on adoption and then at a steady consumption rate.",
      pages: "339-345",
    },
  ],
  cases: [
    {
      title: "Smallpox: eradication without universal vaccination",
      text: "Smallpox was highly infectious but had a short infectious period, survivors gained lasting immunity, and the virus had no animal reservoir. That combination meant a broad enough vaccination campaign could hold the reproduction rate below 1 everywhere. Jenner's vaccine dates from 1796, yet smallpox remained a major killer into the 20th century. A WHO campaign of surveillance, vaccination and isolation from the mid-1960s led to the last natural case in Somalia in 1977, a laboratory escape in England caused two cases in 1978, and eradication was declared in 1980. Sterman notes the twist: with vaccination stopped and old immunity fading, much of the world is susceptible again, so stored virus is a serious risk.",
      pages: "309-310",
    },
    {
      title: "Mad cow disease: a cost-cutting change that closed a contagion loop",
      text: "BSE is not thought to pass directly between cattle, so under traditional husbandry there was no contagion loop. Feeding cattle meat and bone meal made from rendered offal, and switching in the late 1970s to a cheaper lower-temperature rendering process, created one: infected carcasses could reach susceptible animals anywhere in the UK through distributed feed. Between 1985 and 1997 about 170,000 cases were confirmed and nearly one million of roughly 11 million cattle were estimated to be infected. BSE was only identified in 1986, the feed ban came years later, and the long incubation kept confirmed cases rising until 1992. By 1998 about two dozen cases of a new variant of CJD in humans had been confirmed.",
      pages: "314-316",
    },
    {
      title: "HIV/AIDS: why constant parameters fail for slow epidemics",
      text: "With a median incubation of about 10 years and, before modern therapy, survival of around 10 to 12 months after diagnosis, HIV unfolds slowly enough for behaviour, research and treatment to change during the epidemic. US AIDS incidence grew until about 1995 and then fell, with mortality falling further once combination therapy (HAART) arrived. Even before that, growth was slower than a pure exponential, because contact rates and infectivity were falling as people learned about the risks. Globally the picture was far worse: WHO estimated that about a quarter of Zimbabwe's population was infected in 1997. Sterman uses the case to argue that long-lived epidemics need endogenous behaviour and treatment feedbacks, not fixed SIR parameters.",
      pages: "319-323",
    },
    {
      title: "VAX minicomputers and cable television: fitting, and over-trusting, diffusion curves",
      text: "Sales of DEC's VAX 11/750 in Europe, introduced in 1981, peaked in mid-1984 and ended around 1989, with about 7,600 units sold. A logistic fit to the logit-transformed installed base is excellent, though it undershoots the first year and a half and overshoots the peak; adding an external influence (the Bass model) fixes both. For US cable television, a logistic fitted to the declining fractional growth rate projects about 74 million subscribing households shortly after 2010, while a Gompertz curve that fits the history about as well projects nearly 150 million by 2020. Same data, forecasts a factor of two apart.",
      pages: "325-334",
    },
  ],
  exercises: [
    {
      prompt:
        "Open the constrained-growth molecule with the S-curve preset (growth rate 18%/yr, capacity 200). Note the time at which the population passes 100 and check that the growth flow is at its maximum there. Then set capacity to 350 and confirm the fastest growth now occurs near 175.",
      hint: "In the logistic model the inflection point is always at half the carrying capacity, because the net growth rate is a symmetric parabola in P.",
      link: { label: "Constrained growth", hash: "/m/logistic" },
    },
    {
      prompt:
        "Reproduce Sterman's base-case epidemic in the outbreak case: set R₀ to 3, the infectious period to 2 days, and contact reduction and vaccination to 0. Record the day of the peak and the number never infected. Then lower R₀ step by step to 1.2, 1.0 and 0.9. At what value does the outbreak stop taking off?",
      hint: "R₀ here is c·i·d. Sterman's example (6 contacts a day, infectivity 0.25, 2 days) gives 3. Around 6% of people should escape infection at R₀ = 3.",
      link: { label: "Epidemic case", hash: "/apps/health/epidemic" },
    },
    {
      prompt:
        "Run the outbreak case at R₀ = 3 with a 7-day infectious period, then at R₀ = 3 with a 14-day period. The threshold is the same, so why does the timing change? Next keep R₀ = 3 and set contact reduction to 67%. Explain what you see in terms of loop dominance.",
      hint: "A 67% cut gives an effective R₀ of about 1: the contagion loop and the recovery loop are nearly balanced.",
      link: { label: "Epidemic case", hash: "/apps/health/epidemic" },
    },
    {
      prompt:
        "Pen and paper, then check in the vaccination case. Suppose disease X has a contact number of 4 and disease Y of 15. What share of the population must be immune to block an epidemic of each? If the vaccine only protects 90% of those who receive it, what share must be vaccinated? Explain why one disease could be eliminated by routine vaccination and the other might persist. Then open the vaccination case with R₀ 4 and compare a slow and a fast campaign.",
      hint: "1 − 1/4 = 75% (83% vaccinated at 90% effectiveness); 1 − 1/15 ≈ 93% (over 100% at 90% effectiveness, which is impossible).",
      link: { label: "Vaccination case", hash: "/apps/health/vaccination" },
    },
    {
      prompt:
        "In the diffusion molecule set innovation p to 0 and imitation q to 18%. Run it: why does nothing happen? Now set p to 0.5%. This is the startup problem of the logistic model and the Bass fix in one experiment.",
      hint: "The run starts with zero adopters, and with p = 0 zero adopters is an equilibrium.",
      link: { label: "Diffusion", hash: "/m/diffusion" },
    },
    {
      prompt:
        "Compare the Ad-driven (p 4%, q 5%) and Viral (p 0.5%, q 35%) presets of the diffusion molecule. Sketch the adoption flow for each. Which one has an inflection point in the adopter curve, and when should the adoption rate peak according to t* = ln(q/p)/(p + q)? Check the formula against the Word-of-mouth preset (p 1%, q 18%).",
      hint: "For p = 1%, q = 18% per week, t* = ln(18)/0.19 ≈ 15 weeks. If p ≥ q the formula gives zero or a negative time: adoption is highest at launch.",
      link: { label: "Diffusion", hash: "/m/diffusion" },
    },
    {
      prompt:
        "Open the Bass case and run the Typical durable preset (p 3%, q 38%), then Strong word of mouth (p 1%, q 40%). Which reaches half the market first? A product manager proposes doubling the advertising budget to triple p. Use the model to say when that would matter most, and what it cannot tell you about whether word of mouth is really the driver.",
      hint: "Think about the chapter's warning on fit: if growth is partly driven by loops the model omits, the fitted q absorbs them.",
      link: { label: "Bass diffusion case", hash: "/apps/business/new-product-diffusion" },
    },
    {
      prompt:
        "Pen and paper: a new app has active users who each make 40 conversations a year with non-users, 5% of which persuade the other person to install it, and the average person stays active for 6 months. Is the app above or below its tipping point at launch? How much longer would people need to stay active for word of mouth alone to sustain growth? Then compare the word-of-mouth and fact-checking presets of the rumour case, which share the same structure.",
      hint: "c·i·d = 40 × 0.05 × 0.5 = 1.0 when nearly everyone is a potential adopter: exactly at the threshold.",
      link: { label: "Rumour case", hash: "/apps/social/rumours" },
    },
  ],
  pitfalls: [
    "Using the logistic, Gompertz or Bass curve as a black-box forecasting tool. These are causal hypotheses about feedback, and any of them can fit a history that a different structure produced.",
    "Treating a close historical fit as evidence that the model is valid or will respond correctly to policy. Fit is a test for finding flaws, not a certificate.",
    "Leaving out positive loops other than word of mouth (complementary software, network effects, falling prices). The fitted word-of-mouth parameter then absorbs them and the model points to the wrong lever.",
    "Starting a logistic or SI model from zero adopters or zero infected and expecting growth. Zero is an equilibrium; something outside the reinforcing loop must seed it.",
    "Aggregating deaths and recoveries into one 'removed' stock. The dead stop interacting and leave the population; the recovered keep mixing.",
    "Believing an epidemic ends only when everyone has been infected, or that eradication needs 100% vaccination. Both are governed by the reproduction rate falling below 1.",
    "Ignoring incubation and reporting delays when judging quarantine or vaccination triggered by visible cases. By the time symptoms are counted, much of the spread has happened.",
    "Using a first-order growth model for something that can decline. Logistic and Bass adopters can never fall, so they cannot show fads, abandonment or boom and bust.",
  ],
  molecules: ["logistic", "diffusion", "growth", "cascade", "decay", "residence"],
};
