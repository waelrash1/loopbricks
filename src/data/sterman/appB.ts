import type { StudyChapter } from "@/data/sterman/types";

export const CHAPTER: StudyChapter = {
  id: "appB",
  number: "B",
  title: "Noise",
  part: "Appendices",
  pages: "913-924",
  summary:
    "Real variables wobble, and the part of a flow that a model's decision rules do not explain is called noise. Random variation has to be added to a model with care. Independent random draws each time step (white noise) change far too fast and spread their power over every frequency, while real disturbances have inertia because they come from stocks. Pink noise, made by smoothing white noise with a correlation time, captures that persistence. The difference matters because feedback systems filter noise: they ignore fast wobbles but resonate with disturbances near their natural period. Correlated noise therefore excites a model's latent modes, such as the business cycle in an inventory and workforce model, while white noise of the same size barely moves it.",
  bigIdeas: [
    {
      title: "One person's noise is another's signal",
      text: "Whether a movement counts as systematic behaviour or as noise depends on the purpose. For a study of long-run growth, the business cycle in industrial production is noise; for a business-cycle model it is the behaviour to explain, and only the month-to-month jitter is noise; a still more detailed model might explain that jitter too. Deciding what is noise is therefore part of setting the model boundary.",
      pages: "913",
    },
    {
      title: "Noise measures our ignorance",
      text: "Rate equations capture the average decision or physical process, so actual flows scatter around what the model computes. A worker sleeps badly, another finds a faster method, a machine fails: productivity on any day differs from its average for reasons the model cannot represent. Noise is the label for that unexplained part of the decision stream. It stands in for variables and states we cannot capture or choose to omit, so it should be formulated as carefully as any other structure.",
      pages: "913-914",
    },
    {
      title: "Understand the deterministic model first",
      text: "Even when noise matters, first learn how the model responds to idealised test inputs: the step, pulse, ramp and sine wave. These show the system's modes (how it adjusts, overshoots or oscillates) without the confusion of random inputs. Only then add noise, to see which of those modes realistic disturbances bring out.",
      pages: "914, 923",
    },
    {
      title: "Formulate random effects multiplicatively, and keep them physical",
      text: "A clean formulation separates the average from the random variation: productivity equals average productivity times a random effect whose mean is 1. With data showing productivity normally distributed around 0.25 widgets per person-hour with a standard deviation of about 5%, the random effect is drawn with mean 1 and standard deviation 0.05. Because a normal distribution has no lower bound, the effect could occasionally go negative; truncate it with a MAX function or use a lognormal distribution so productivity never falls below zero.",
      pages: "914",
    },
    {
      title: "White noise changes too fast and contains every frequency",
      text: "A random number function draws a fresh, independent value every time step, so the series has no memory: the last value says nothing about the next. With a time step of 0.125 weeks, productivity gets eight unrelated values a week, giving the right mean and spread but jumping far faster than any real record. Such independent noise is called white because, like the din of a crowded party, it mixes all frequencies in equal strength; equal power up to infinite frequency would mean infinite power, which nothing real has. Real quantities have inertia because they arise from stocks (temperature changes slowly because heat accumulates, and a broken machine keeps productivity low until it is repaired), so real noise loses strength above some frequency.",
      pages: "915-917",
    },
    {
      title: "Pink noise: white noise passed through a first-order smooth",
      text: "Noise with persistence is called pink noise because, compared with white, it keeps the low (red) frequencies and loses the high (blue) ones. Since inertia implies a stock, the simplest pink noise is first-order exponential smoothing of a white noise stream, with the smoothing time called the correlation time. The smoothed value is a weighted average of all past draws, so successive values are correlated. In first-order pink noise the correlation between values a lag apart decays exponentially, with time constant equal to the correlation time. Several smooths in series give higher-order noise, though that is rarely needed.",
      pages: "917-919",
    },
    {
      title: "Scale the white noise so the pink noise has the right spread",
      text: "Smoothing is a low-pass filter: it lets slow variation through and suppresses cycles near or shorter than the correlation time. So the longer the correlation time, the larger the white noise must be to leave the specified standard deviation after smoothing. Conversely, a longer time step needs smaller white noise, because sampling less often concentrates its power at lower frequencies that the smooth does not remove. The formulation in Sterman (2000) multiplies a uniform draw by the square root of 24 × correlation time / dt; an alternative uses a normal draw with its own factor. Both assume Euler integration, since higher-order methods distort the noise's spectrum.",
      pages: "918-919",
    },
    {
      title: "Systems are filters and resonators",
      text: "A dynamic system attenuates some frequencies and amplifies others. If its input noise has power near the system's natural frequency, the system resonates and can fluctuate violently. The Tacoma Narrows bridge, opened in 1940, swung even in light winds and on 7 November tore itself apart in winds of about 40 miles an hour, because its span resonated near the frequency of the vortices shed by the wind. Supply chains do the same: small random variations in orders produce large swings in production near each system's natural period.",
      pages: "919",
    },
    {
      title: "Models need correlated noise to excite their modes",
      text: "Driven by white noise in productivity with a 5% standard deviation, the inventory and workforce model reported by Sterman (2000) hardly moves: inventory absorbs the day-to-day ups and downs and there is no reason to hire or fire. Driven by pink noise of the same size with a 4-week correlation time, low output persists for weeks, inventory falls, the firm hires, and the system's roughly one-year oscillation appears. Production starts then vary by 7.6% of their mean, more than the 5% input, and hiring varies about six times as much as under white noise, around 13 times the variation in productivity. Without realistic noise, a model with a latent oscillatory mode may never show it.",
      pages: "919-921",
    },
    {
      title: "Estimate noise parameters from data, or by judgement and sensitivity tests",
      text: "Where there is enough data, compute the autocorrelation function of a variable and read off the correlation time. Oliva did this for a bank's loan office: absenteeism persisted with a correlation time of about 2 weeks, customer orders about 1 week, and the two were independent, so each became its own pink noise source. When several noise sources are correlated, model each as a weighted sum of its own noise and the shared one; but a complicated web of cross-correlations usually signals feedback structure that should be modelled explicitly. A good model generates the observed variances and correlations without being forced by many exogenous inputs.",
      pages: "921-922",
    },
    {
      title: "Small noise can trigger large, self-reinforcing change",
      text: "Without noise, Oliva's model of the loan office sat in equilibrium with constant quality. With small, realistic variations in demand and absenteeism, occasional shortfalls led staff to spend less time per customer, and those shortcuts became the new norm. Managers read the change as productivity gains, while lower service quality cut the value of loans and revenue, which brought staff cuts and more pressure: a potential death spiral. The noise did not cause the problem; it revealed a latent reinforcing structure in the bank's policies.",
      pages: "921-922",
    },
    {
      title: "Guidelines for using noise",
      text: "Add noise only where a parameter is both variable in reality and influential in the model, but test random variation even if you expect it not to matter. Never use white noise; use pink noise with distribution, standard deviation and correlation time estimated from data or judgement. Keep the time step small relative to every time constant, correlation times included. Fix the noise seed when comparing policies, so any difference comes from the policy rather than the random draws. Run long enough, or many enough times, to report distributions rather than one realisation, and test sensitivity to the noise assumptions themselves.",
      pages: "923-924",
    },
  ],
  diagrams: [
    {
      kind: "cld",
      title: "First-order pink noise",
      cld: {
        vars: [
          { id: "white", label: "White noise", x: 90, y: 80 },
          { id: "chg", label: "Change in pink noise", x: 290, y: 80 },
          { id: "pink", label: "Pink noise", x: 420, y: 200 },
          { id: "tc", label: "Correlation time", x: 140, y: 210 },
        ],
        links: [
          { from: "white", to: "chg", sign: "+", curve: 0 },
          { from: "chg", to: "pink", sign: "+", curve: 45 },
          { from: "pink", to: "chg", sign: "−", curve: 45 },
          { from: "tc", to: "chg", sign: "−", curve: 0 },
        ],
        loops: [{ type: "B", label: "B1", x: 355, y: 140 }],
        caption:
          "Pink noise is a stock that chases a stream of independent random draws. <span class=\"chip chipB\">B</span>1 closes the gap between <b>Pink noise</b> and the latest <b>White noise</b> over the <b>Correlation time</b>, so fast jumps are averaged away and the output keeps a memory of recent values. A longer correlation time means slower, more persistent noise.",
      },
      note: "Our redrawing of the idea in causal form. The same structure is a first-order information smooth, as in the Smooth molecule.",
      pages: "917-918",
    },
    {
      kind: "cld",
      title: "Noise exciting the inventory and workforce cycle",
      cld: {
        size: [580, 300],
        vars: [
          { id: "noise", label: "Productivity noise", x: 95, y: 40 },
          { id: "prod", label: "Production", x: 300, y: 60 },
          { id: "inv", label: "Inventory", x: 480, y: 130 },
          { id: "deslab", label: "Desired labour", x: 440, y: 245 },
          { id: "hire", label: "Hiring", x: 240, y: 260 },
          { id: "lab", label: "Labour", x: 110, y: 170 },
        ],
        links: [
          { from: "noise", to: "prod", sign: "+", curve: 0 },
          { from: "lab", to: "prod", sign: "+", curve: 20 },
          { from: "prod", to: "inv", sign: "+", curve: 20 },
          { from: "inv", to: "deslab", sign: "−", curve: 20 },
          { from: "deslab", to: "hire", sign: "+", curve: 20 },
          { from: "hire", to: "lab", sign: "+", curve: 20 },
        ],
        loops: [{ type: "B", label: "B1", x: 300, y: 160 }],
        caption:
          "<span class=\"chip chipB\">B</span>1 is a balancing loop with two stocks (Inventory and Labour) and hiring delays, so it has a natural period of oscillation, about a year in the model reported by Sterman (2000). Fast <b>Productivity noise</b> is soaked up by inventory before the loop reacts. Noise that persists for weeks gets through, pushes the loop near its natural period and sets off cycles larger than the noise itself.",
      },
      note: "A simplified causal view of the inventory and workforce model used here; shipments and expected productivity are left out.",
      pages: "919-921",
    },
    {
      kind: "cld",
      title: "Random shocks and eroding service norms",
      cld: {
        size: [700, 340],
        vars: [
          { id: "shocks", label: "Random demand and absence", x: 118, y: 40 },
          { id: "wp", label: "Work pressure", x: 118, y: 165 },
          { id: "tpc", label: "Time per customer", x: 360, y: 165 },
          { id: "norm", label: "Norm for time per customer", x: 360, y: 40 },
          { id: "sq", label: "Service quality", x: 580, y: 165 },
          { id: "rev", label: "Loan revenue", x: 580, y: 300 },
          { id: "staff", label: "Staff", x: 140, y: 300 },
        ],
        links: [
          { from: "shocks", to: "wp", sign: "+", curve: 0 },
          { from: "wp", to: "tpc", sign: "−", curve: 0 },
          { from: "tpc", to: "norm", sign: "+", curve: 35 },
          { from: "norm", to: "tpc", sign: "+", curve: 35 },
          { from: "tpc", to: "sq", sign: "+", curve: 0 },
          { from: "sq", to: "rev", sign: "+", curve: 0 },
          { from: "rev", to: "staff", sign: "+", curve: 0 },
          { from: "staff", to: "wp", sign: "−", curve: 0 },
        ],
        loops: [
          { type: "R", label: "R1", x: 360, y: 103 },
          { type: "R", label: "R2", x: 360, y: 235 },
        ],
        caption:
          "Small random shortfalls raise <b>Work pressure</b>, and staff cut <b>Time per customer</b>. <span class=\"chip chipR\">R</span>1: the norm drifts down to match what people actually do, and in Oliva's data it never drifted back up. <span class=\"chip chipR\">R</span>2: lower service quality cuts loan revenue, which leads to fewer staff and still more pressure. Noise reveals these latent reinforcing loops.",
      },
      note: "Our sketch of Oliva's retail bank findings as reported by Sterman (2000); see also the module Testing and building confidence in models.",
      pages: "921-922",
    },
    {
      kind: "sequence",
      title: "Adding noise to a model, step by step",
      steps: [
        { label: "Deterministic first", detail: "Learn the modes with step, pulse, ramp and sine inputs." },
        { label: "Does randomness matter?", detail: "Ask, then test it anyway." },
        { label: "Pick the points", detail: "Parameters that really vary and that the behaviour is sensitive to." },
        { label: "Estimate the noise", detail: "Distribution, standard deviation and correlation time from data or judgement; check cross-correlations." },
        { label: "Build pink noise", detail: "Smooth scaled white noise over the correlation time; keep it physically bounded." },
        { label: "Check the time step", detail: "dt small relative to every time constant, including correlation times." },
        { label: "Fix the seed for comparisons", detail: "Same random sequence in every policy run." },
        { label: "Report distributions", detail: "Long runs or many seeds; then sensitivity to the noise assumptions." },
      ],
      note: "Our ordering of these guidelines into a working procedure.",
      pages: "914, 923-924",
    },
  ],
  formulations: [
    {
      name: "Multiplicative random effect",
      equations: [
        "Productivity = Average Productivity × Random Effect on Productivity",
        "Random Effect on Productivity = MAX(0, NORMAL(1, Standard Deviation))",
      ],
      explain:
        "The average may itself be endogenous; the random effect has mean 1 so it leaves the average unchanged. With a standard deviation of 0.05 and an average of 0.25, productivity varies by about 0.0125. The MAX keeps the effect non-negative, since a normal draw can be any size. As written this is still white noise: a new independent value every time step. Replace the NORMAL draw with the pink noise structure below to give it realistic persistence.",
      pages: "914",
    },
    {
      name: "First-order pink noise",
      equations: [
        "Pink Noise = INTEG(Change in Pink Noise, Mean)",
        "Change in Pink Noise = (White Noise − Pink Noise) / Correlation Time",
        "White Noise = Mean + Standard Deviation × √(24 × Correlation Time / dt) × UNIFORM(−0.5, 0.5, Noise Seed)",
      ],
      explain:
        "Pink noise is the first-order smooth of a white noise stream, so it starts at the mean and chases each new draw over the correlation time. The uniform draw on [−0.5, 0.5] has variance 1/12. A first-order smooth under Euler integration cuts the variance of independent input by roughly dt / (2 × correlation time). Multiplying the draw by √(24 × Tc / dt) undoes both effects (√12 × √(2 Tc / dt)), so the output has the standard deviation you asked for. The output is close to normally distributed even though the draws are uniform. The structure is the same as the Smooth molecule's first-order smooth.",
      molecule: "smooth",
      pages: "917-918",
    },
    {
      name: "Gaussian pink noise (alternative)",
      equations: [
        "White Noise = M + S × √((2 − dt/Tc) / (dt/Tc)) × NORMAL(0, 1, Noise Seed)",
        "Pink Noise = INTEG((White Noise − Pink Noise) / Tc, M)",
      ],
      explain:
        "M is the mean, S the desired standard deviation and Tc the correlation time. Smoothing a normal rather than uniform stream gives pink noise that is exactly Gaussian. The scaling factor comes from writing the Euler-integrated smooth as a weighted sum of past draws and summing the variances. In practice the data rarely distinguish this from the uniform version, so use it only if you have strong evidence the noise is Gaussian.",
      pages: "918",
    },
    {
      name: "Autocorrelation and the highest frequency",
      equations: [
        "Correlation(Pink(t), Pink(t − lag)) ≈ exp(−lag / Correlation Time)",
        "Shortest cycle a simulation can represent: period = 2 × dt",
      ],
      explain:
        "The first equation is how you estimate the correlation time: compute the autocorrelation function from data and find the lag at which it has fallen to about 0.37 (e⁻¹). If it does not decay exponentially, cascade several smooths for higher-order noise, after first asking whether missing feedback structure explains the pattern. The second explains why white noise in a simulation depends on dt: one up-and-down cycle needs at least two steps, so dt sets the highest frequency the noise can contain.",
      pages: "918-919, 921",
    },
  ],
  cases: [
    {
      title: "White versus pink noise in the inventory and workforce model",
      text: "Sterman (2000) drove the inventory and workforce model from the module Cycles in business, labour and commodity markets, with expected productivity smoothed over 13 weeks, using productivity noise of the same 5% standard deviation and the same distribution, once as white noise and once as pink noise with a 4-week correlation time, time step 0.125 weeks. Under white noise the system damped nearly everything: inventory varied by less than 2% of its mean, and production, inventory and labour all varied far less than productivity; only the hiring rate amplified the input. Under pink noise, inventory, labour and other key variables all varied by more than productivity did, production starts by 7.6%, and the standard deviation of hiring was about six times that under white noise and 13 times that of productivity. The noise had power near the system's natural period of about a year, so the system resonated.",
      pages: "919-921",
    },
    {
      title: "Oliva's retail bank: realistic noise reveals quality erosion",
      text: "Oliva estimated autocorrelation functions for a bank loan office's inputs. Customer demand and absenteeism varied by less than 4% of their means; absenteeism had a correlation time of about 2 weeks and orders about 1 week, and the two were independent. In the deterministic model the office stayed in equilibrium. With these small pink noise inputs added, capacity was occasionally short, staff cut time per customer, the cuts became norms, and management mistook them for productivity gains. Lower time per customer reduced the value of loans issued and so revenue, opening the way to staff cuts and further erosion.",
      pages: "921-922",
    },
    {
      title: "The Tacoma Narrows bridge",
      text: "Opened in 1940, the bridge swung noticeably even in light winds. On 7 November, in winds of about 40 miles an hour, it went into huge oscillations and collapsed within hours. Its suspension span had a strong resonance close to the frequencies of the vortices the wind created around it. The replacement span, built on the same towers, was stiffened so its resonance was smaller and far from the wind's frequencies. The general lesson: what matters is not only how big a disturbance is but how much of its power lies near the system's natural frequency.",
      pages: "919",
    },
  ],
  exercises: [
    {
      prompt:
        "Noise depends on purpose (pen and paper). Sketch a monthly industrial production series with a rising trend, a cycle of a few years and month-to-month jitter. For each of three purposes (long-run growth, the business cycle, monthly production scheduling), mark which component is the behaviour to explain and which is noise.",
      hint: "The same wiggle moves from 'noise' to 'signal' as the purpose becomes more detailed.",
      answer:
        "Purpose 1, long-run growth: the rising trend is the behaviour to explain; the business cycle and the monthly jitter are both noise to be averaged out. Purpose 2, the business cycle: the cycle of a few years is the behaviour; the trend is context (often removed by detrending) and the monthly jitter is noise. Purpose 3, monthly production scheduling: the month-to-month movements are the signal to anticipate, while the trend and cycle are slow background conditions that can be treated as given. A good sketch labels the same series three times. The lesson: noise is not a property of the data but of the question; what is noise for one purpose is signal for another.",
    },
    {
      prompt:
        "Smoothing as a filter. Open Smooth and compare the Snappy preset (τ = 2 weeks) with Slow (τ = 15 weeks) after the step. Then reason about a one-week blip in the input: a first-order smooth passes about 1 − e^(−1/τ) of it in that week, about 39% when τ = 2 but only about 6.5% when τ = 15. Explain why a long correlation time in the pink noise formula needs a larger white noise amplitude.",
      hint: "The smooth that makes pink noise is the same structure: long τ removes more of the fast variation, so more must go in to leave the required spread.",
      answer:
        "After the step from 30 to 80, Snappy (τ = 2) covers about 63% of the change in 2 weeks (about 61 at week 2) and is essentially at 80 by week 10; Slow (τ = 15) is only at about 62 after 15 weeks and 73 after 30. For a one-week blip, a first-order smooth passes about 1 − e^(−1/τ): 39% when τ = 2 and 6.5% when τ = 15 (the app shows about 37% and 6% in the first week after its step, close to the formula). Pink noise is white noise passed through exactly this kind of smooth with the correlation time as τ. A long correlation time filters out most of each random shock, so to keep the pink noise at the required standard deviation the white noise feeding it must be much larger: its amplitude scales with √(Tc / dt).",
      link: { label: "Open Smooth", hash: "/m/smooth" },
    },
    {
      prompt:
        "Find the mode noise would excite. Open Stock Management with the Oscillation preset (supply-line weight 0) and measure the time between inventory peaks: about 33 weeks. Set the acquisition delay to 12 weeks and measure again (about 45 weeks). Then switch to the Stable preset (weight 1). For each case, say whether pink noise with a correlation time of 4 weeks would be likely to produce visible cycles, and why white noise with the app's step of 0.1 weeks would not.",
      hint: "Noise can only amplify a mode that exists. With weight 1 the system has no strong oscillatory mode to resonate.",
      answer:
        "Oscillation (weight 0, delay 6): inventory peaks at about 110 at week 17, then 101 at week 50, 33 weeks apart, a lightly damped oscillatory mode. With a 12-week delay the peaks are about 45 weeks apart and larger. Stable (weight 1): inventory rises smoothly with no overshoot, so there is no oscillatory mode. Pink noise with a 4-week correlation time has a lot of power at periods of a few weeks to several months, enough to keep exciting a 33 or 45 week mode, so both weight-0 cases would show visible, irregular cycles; the stable case would only jiggle around 100. White noise at dt = 0.1 weeks spreads its power over extremely high frequencies, changes every step and averages out within the inventory stock and the 4-week correction, so very little energy reaches the slow mode. Noise can only amplify a mode the structure already has.",
      link: { label: "Open Stock Management", hash: "/m/stockmgmt" },
    },
    {
      prompt:
        "Scaling factor by hand. With correlation time 4 weeks and dt 0.125 weeks, compute √(24 × Tc / dt). Using a 5% standard deviation, find the range of the white noise multiplier (mean 1). Then halve dt and recompute. What happens to the white noise range, and why does the pink noise's standard deviation stay the same?",
      hint: "√768 ≈ 27.7, so the white noise spans about 1 ± 0.69. Halving dt multiplies the factor by √2.",
      answer:
        "√(24 × 4 / 0.125) = √768 ≈ 27.7. With a 5% standard deviation the white noise term is 0.05 × 27.7 ≈ 1.39 times a uniform draw on [−0.5, 0.5], so the multiplier ranges over about 1 ± 0.69, that is from about 0.31 to 1.69. Halving dt to 0.0625 gives √1536 ≈ 39.2, so the range becomes about 1 ± 0.98, wider by √2. The pink noise keeps the same standard deviation because the smoothing averages over more, smaller steps: with twice as many independent draws per correlation time, each must be √2 larger to leave the same variance after averaging. The scaling factor is chosen exactly to make the pink noise's spread independent of dt.",
    },
    {
      prompt:
        "Build white and pink noise in a spreadsheet. Make 3,200 rows (400 weeks at dt = 0.125). Column A: a uniform draw on [−0.5, 0.5]. Column B: white noise = 1 + 0.05 × √(24 × 4 / 0.125) × A. Column C: pink noise, starting at 1, each row = previous + (B − previous) × dt / 4. Plot B and C, compute their standard deviations, and compute the correlation of C with itself 32 rows (4 weeks) earlier.",
      hint: "Column C should have a standard deviation near 0.05 and a 4-week autocorrelation near e⁻¹ ≈ 0.37. Column B has a much larger spread but no memory.",
      answer:
        "Column B (white noise) has a standard deviation of about 0.05 × 27.7 / √12 ≈ 0.40 (a uniform draw on [−0.5, 0.5] has standard deviation 1/√12 ≈ 0.29), with no memory: its correlation with the row 32 earlier is near 0. Column C (pink noise) should have a standard deviation near 0.05 and a 4-week autocorrelation near e⁻¹ ≈ 0.37. Your numbers will differ a little from run to run, more so for the autocorrelation, because 400 weeks hold only about 100 correlation times. If the standard deviation of C is far from 0.05, check the scaling factor (√(24 × Tc / dt)) and that each row uses dt / Tc = 0.125 / 4.",
    },
    {
      prompt:
        "Noise in fit statistics. In the calibration lab, fit the data by hand until the error is close to the measurement noise. Note how much of the remaining error is in the timing share UC. Explain, using these ideas about noise, why a model should not be blamed for missing the random component of data, and why point-by-point error can be large even for a perfect model of a noise-driven system.",
      answer:
        "Fitting the calibration data by hand with the right structure, the best error is about 1.6, close to the measurement noise of about 1.7, and about 86% of what remains is in the timing share UC, with only about 2% in bias (UM). That remaining error is the random component in the data: a model that reproduces the underlying path cannot also reproduce the random draws, so it should not be blamed for them. For a system driven by noise, even a perfect model run with its own random inputs will not match the realised series point by point; its errors will be large and mostly in UC, so judge it by whether it reproduces the statistical features (mean, variance, typical periods, autocorrelation) rather than each data point.",
      link: { label: "Open the calibration lab", hash: "/methods/calibration" },
    },
    {
      prompt:
        "One realisation is not enough. In the sensitivity lab, set simulations per experiment to 50 and note the share of stock-management runs that overshoot; then raise it to 400. How much does the share move? Relate this to the advice to run noisy models long enough, or many times, and to fix the seed when comparing policies.",
      hint: "The lab uses a fixed random seed, so the same settings always give the same runs; more runs make the estimate steadier.",
      answer:
        "With 50 runs about 32% of stock-management runs overshoot; with 100, 31%; with 200, 36%; with 400, 37%. The share moves by about 5 points between 50 and 400 runs and steadies as the number of runs grows, because a share estimated from n random runs has sampling error of roughly √(p(1 − p)/n), about 7 points at 50 runs and 2 points at 400. The lab uses a fixed random seed, so the same settings always reproduce the same runs. That is the advice for noisy models: run them long enough or many times to see the distribution of outcomes, and fix the seed (common random numbers) when comparing policies, so that differences come from the policy and not from different noise.",
      link: { label: "Open the sensitivity lab", hash: "/methods/sensitivity" },
    },
  ],
  pitfalls: [
    "Using white noise (an independent random draw each time step). It changes unrealistically fast, depends on the time step, and puts most of its power at frequencies the system filters out.",
    "Adding noise before understanding the deterministic model. Learn the modes with step, pulse, ramp and sine inputs first.",
    "Matching only the distribution of the data. Pink and white noise can share a mean, standard deviation and histogram and still drive the system completely differently.",
    "Letting a normally distributed random effect make a physical quantity negative. Truncate it or use a lognormal distribution.",
    "Comparing policies with different random sequences, or drawing conclusions from a single noisy run. Fix the seed and look at distributions over long runs or many seeds.",
    "Using a time step that is large relative to the correlation time, or a higher-order integration method that distorts the noise spectrum.",
    "Explaining complex cross-correlations with ever more exogenous noise sources instead of modelling the feedback structure that produces them.",
  ],
  molecules: ["smooth", "smoothHigher", "stockmgmt", "workforce", "productivity", "doingWork"],
};
