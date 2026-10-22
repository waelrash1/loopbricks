import type { StudyChapter } from "@/data/sterman/types";

// Topic notes on forecasts and fudge factors, drawing on Sterman (2000). Paraphrased, with page references.
export const CHAPTER: StudyChapter = {
  id: "ch16",
  number: "16",
  title: "Forecasts and fudge factors: modeling expectation formation",
  part: "Part IV Tools for modeling dynamic systems",
  pages: "631-660",
  summary:
    "Decisions run on expectations, so models must represent how people actually form them. The evidence shows that most forecasts, however elaborate their methods, behave like adaptive expectations: smooth the recent past and extrapolate its trend. The TREND function is a boundedly rational model of growth expectations built from three first-order smooths. It is unbiased in steady state, and Sterman (2000) fits it to forecasts of US energy use, cattle prices and inflation, where it reproduces the professional forecasts closely. Anchoring on a slowly moving belief improves the fit further. Because sophisticated models have exogenous inputs that forecasters tune until the answer looks reasonable, those inputs work as fudge factors. The lessons for forecast users: expect missed turning points and overconfidence, and design policies that are robust to forecast error.",
  bigIdeas: [
    {
      title: "Expectations must be modelled, not assumed",
      text: "Every decision rests on beliefs about the future, so a model must say how those beliefs are formed and updated from information the actors have. That process must obey the same principles as any other decision rule: no knowledge of the future, perceptions that lag reality, and grounding in observation of how forecasts are really made. Whether a firm owns a large econometric model matters less than whether its managers actually use it or follow their gut.",
      pages: "631-632",
    },
    {
      title: "Forecasting is a social and political activity",
      text: "Surveys of US corporations found that judgmental methods (managers' opinion, executive juries, sales force composites) dominate, and that quantitative forecasts are routinely adjusted by judgment. In a survey of corporate forecasting staff, nearly half reported that management asked for revisions toward more favourable outcomes, over a third reported backcasts produced to justify answers chosen in advance, and others reported information withheld between departments or forecasts simply ignored. Heuristics, incentives and politics therefore shape forecasts and can make their errors systematic.",
      pages: "632-633",
    },
    {
      title: "Adaptive expectations, and why smoothing lags a trend",
      text: "The standard representation is exponential smoothing, dX*/dt = (X − X*)/D, which is also common in economics and outperforms many methods over longer horizons. Its weakness is growth: when the input rises steadily the expectation never catches up. For linear growth at r units per period it trails by r·D; for exponential growth at fractional rate g the expectation settles at Input/(1 + gD). A forecast that ignores trends therefore under-predicts throughout a boom.",
      pages: "632-633, 658-659",
    },
    {
      title: "Three problems every trend estimate faces",
      text: "Estimating a growth rate means comparing recent values with older ones, and three choices arise. Data arrive late, so the present must be inferred from out-of-date figures. Data are noisy, so short-term fluctuations must be filtered out, and faster but rougher data (monthly rather than audited annual figures) trade timeliness for reliability. And the forecaster must choose how far back to look: a short horizon reacts quickly to genuine change but also to noise, a long one is stable but slow.",
      pages: "633-634",
    },
    {
      title: "The TREND function",
      text: "TREND turns any input into an expected fractional growth rate using three first-order smooths. The Perceived Present Condition smooths the input over TPPC, the time to measure, report and filter it. The Reference Condition smooths the perceived present over THRC, the historical horizon used as a baseline. The indicated trend is (PPC − RC)/(RC × THRC), and the Perceived Trend adjusts to it over TPT, the time for a new trend to be believed and acted on. It is a behavioural theory of how people judge growth, not just a calculation.",
      pages: "634-636",
    },
    {
      title: "What the parameters mean",
      text: "TPPC can be no shorter than the reporting delay and is longer if people average out noise; monthly US consumer price inflation had a standard deviation of more than its mean between 1947 and 1986, so smoothing is essential. THRC should grow with the forecast horizon but also reflects personal memory: forecasters trained in the fast growth of the 1950s and 1960s kept expecting it long after 1973. TPT includes organisational inertia, since a new trend may need to become conventional wisdom, or even wait for managers to be replaced, before it is acted on.",
      pages: "636-637",
    },
    {
      title: "Unbiased in steady state, late in transients",
      text: "If the input grows exponentially at g, each smooth grows at g with a constant proportional lag, and the indicated trend then equals g exactly, so TREND converges to the true growth rate. During a change it is late: when an input that had been flat starts growing at 5% a year, the perceived trend stays flat at first and then climbs gradually, more slowly the longer THRC and TPT are. To avoid start-up transients, initialise PPC = Input/(1 + g₀·TPPC) and RC = PPC/(1 + g₀·THRC).",
      pages: "638, 658-660",
    },
    {
      title: "From growth rate to forecast",
      text: "A forecast for a future date first corrects the perceived present for the growth expected during the reporting lag, multiplying by (1 + TREND·TPPC), then compounds the perceived trend over the horizon: FC = PPC·(1 + TREND·TPPC)·exp(TREND·(FY − t)). This is unbiased under steady exponential growth, so its errors come entirely from changes in the trend: it overshoots after growth slows and misses turning points.",
      pages: "640, 644",
    },
    {
      title: "Forecasts become fudge factors",
      text: "Complex energy and economic models still need judgmental inputs such as GDP growth, prices, elasticities and technology, for which theory gives little guidance. Forecasters adjust these free parameters, or add 'add factors' directly to the output, until the forecast matches their intuition and what is politically acceptable; and intuition is anchored on recent trends and last year's forecasts. That is why elaborate forecasts look like simple extrapolation. Herding adds a reinforcing pull toward the consensus, since being wrong alone is costlier than being wrong together.",
      pages: "642-643, 654",
    },
    {
      title: "Anchoring: fixed anchor and sea anchor",
      text: "Forecasts can be modelled as a weighted blend of the extrapolated trend and an anchor. A fixed anchor at zero inflation, with weight 0.2, removes most of the bias in the Livingston inflation forecasts but implies people never learn, under-predicting even a hyperinflation forever. A sea anchor, itself a TREND with long time constants, represents people's deep sense of the inflation environment: it drags short-term forecasts and keeps them high after inflation falls, yet slowly learns, so steady conditions eventually yield unbiased forecasts.",
      pages: "649-653",
    },
    {
      title: "Lessons for forecast consumers",
      text: "Forecasts are most accurate when the dynamics are stable and least accurate at turning points and trend breaks, exactly when they are wanted. Most miss turning points, are dominated by smoothing and extrapolation of the variable itself, and understate uncertainty. Users should challenge assumptions, demand documented data, methods and assumptions, refuse add factoring, and consider smoothing and extrapolating the data themselves at far lower cost. Above all they should build decision rules that are robust to forecast error: as Sterman (2000, p. 656) puts it, modellers should be \"designers, not diviners\".",
      pages: "655-656",
    },
    {
      title: "Extrapolation can destabilise",
      text: "Expectations change system stability. In a product life cycle with capacity built on forecasts, pure smoothing leaves capacity short throughout the growth phase, while extrapolating recent growth closes that gap but carries the boom past saturation and leaves excess capacity when sales peak. There is a trade-off between tracking growth and anticipating the turn. In experiments, people with business experience forecast too timidly in the growth phase and still overshot at saturation.",
      pages: "656-658",
    },
  ],
  diagrams: [
    {
      kind: "cld",
      title: "Structure of the TREND function",
      cld: {
        size: [700, 280],
        vars: [
          { id: "in", label: "Input", x: 55, y: 140 },
          { id: "ppc", label: "Perceived present condition", x: 230, y: 55 },
          { id: "rc", label: "Reference condition", x: 230, y: 225 },
          { id: "it", label: "Indicated trend", x: 420, y: 140 },
          { id: "pt", label: "Perceived trend", x: 615, y: 140 },
        ],
        links: [
          { from: "in", to: "ppc", sign: "+", curve: 0 },
          { from: "ppc", to: "rc", sign: "+", curve: 0 },
          { from: "ppc", to: "it", sign: "+", curve: 0 },
          { from: "rc", to: "it", sign: "−", curve: 0 },
          { from: "it", to: "pt", sign: "+", curve: 0 },
          { from: "ppc", to: "ppc", sign: "−", self: true },
          { from: "rc", to: "rc", sign: "−", self: true },
          { from: "pt", to: "pt", sign: "−", self: true },
        ],
        loops: [
          { type: "B", label: "B1", x: 375, y: 28 },
          { type: "B", label: "B2", x: 345, y: 255 },
          { type: "B", label: "B3", x: 668, y: 75 },
        ],
        caption:
          '<span class="chip chipB">B</span> Each balancing loop is a first-order smooth closing its own gap: B1 perceives the present over <code>TPPC</code>, B2 forms the historical reference over <code>THRC</code>, B3 lets belief in the trend catch up over <code>TPT</code>. Indicated trend = (PPC − RC) / (RC · THRC). There is no loop through the input: TREND only reads the world, and becomes part of a larger loop only when a decision uses its output.',
      },
      pages: "634-637",
    },
    {
      kind: "cld",
      title: "How forecasts become fudge factors",
      cld: {
        size: [640, 280],
        vars: [
          { id: "tr", label: "Recent trend in the data", x: 140, y: 45 },
          { id: "cons", label: "Consensus forecast", x: 140, y: 235 },
          { id: "int", label: "Intuitive expectation", x: 300, y: 140 },
          { id: "add", label: "Add factor", x: 500, y: 60 },
          { id: "out", label: "Model forecast", x: 500, y: 220 },
        ],
        links: [
          { from: "tr", to: "int", sign: "+", curve: 0 },
          { from: "cons", to: "int", sign: "+", curve: 0 },
          { from: "int", to: "add", sign: "+", curve: 0 },
          { from: "out", to: "add", sign: "−", curve: -30 },
          { from: "add", to: "out", sign: "+", curve: -30 },
          { from: "out", to: "cons", sign: "+", curve: 0 },
        ],
        loops: [
          { type: "B", label: "B1", x: 600, y: 140 },
          { type: "R", label: "R1", x: 395, y: 190 },
        ],
        caption:
          '<span class="chip chipB">B</span> B1 Tuning: forecasters adjust add factors and exogenous assumptions until the model\'s output matches their intuition. <span class="chip chipR">R</span> R1 Herding: each published forecast moves the consensus, which shapes everyone\'s intuition next time. Intuition is anchored on the recent trend, so the most sophisticated model ends up close to smoothing and extrapolation.',
      },
      pages: "642-643, 654-655",
    },
    {
      kind: "sequence",
      title: "Making a trend-extrapolation forecast",
      steps: [
        { label: "Measure", detail: "Data arrive after a reporting delay" },
        { label: "Perceive the present", detail: "Smooth the input over TPPC" },
        { label: "Set a baseline", detail: "Smooth the perceived present over THRC" },
        { label: "Indicated trend", detail: "(PPC − RC) / (RC · THRC)" },
        { label: "Believe the trend", detail: "Perceived trend adjusts over TPT" },
        { label: "Correct for lag", detail: "PPC · (1 + TREND · TPPC) estimates today" },
        { label: "Extrapolate", detail: "Compound at TREND to the forecast horizon" },
      ],
      note: "The structure fitted to energy, cattle-price and inflation forecasts (Sterman 2000).",
      pages: "634-640",
    },
    {
      kind: "cycle",
      title: "Adaptive expectations as error correction",
      nodes: [
        "Expectation formed from past data",
        "Decision taken on the expectation",
        "Outcome observed after a delay",
        "Forecast error noticed",
        "Expectation revised part of the way",
      ],
      center: "Learning, but late",
      note: "Errors are corrected over time, but every revision is partial and delayed, so turning points are missed and trends overshot.",
      pages: "632-633, 655",
    },
  ],
  formulations: [
    {
      name: "Adaptive expectations and their steady-state error",
      equations: [
        "dX*/dt = (X − X*) / D",
        "Linear growth X = r·t:  X − X* → r · D",
        "Exponential growth at g:  X* → X / (1 + g · D)",
      ],
      explain:
        "First-order smoothing is the workhorse model of how beliefs update. It filters noise and corrects errors, but under growth it settles at a constant lag, so expectations of a growing variable are always too low by a predictable amount.",
      molecule: "smooth",
      pages: "632-633, 659",
    },
    {
      name: "The TREND function",
      equations: [
        "PPC = SMOOTH(Input, TPPC)",
        "RC = SMOOTH(PPC, THRC)",
        "Indicated trend = ((PPC − RC) / RC) / THRC",
        "TREND = SMOOTH(Indicated trend, TPT)",
        "Initial values: PPC₀ = Input₀ / (1 + TREND₀ · TPPC),  RC₀ = PPC₀ / (1 + TREND₀ · THRC)",
      ],
      explain:
        "Output is a fractional growth rate (1/time). Although the indicated trend looks like a simple linear rate, because RC is an exponential smooth it yields the continuously compounded growth rate and is unbiased in steady state. The initial values start the function in equilibrium at an assumed growth rate.",
      molecule: "trend",
      pages: "634-636, 658-660",
    },
    {
      name: "Extrapolated forecast",
      equations: [
        "Forecast(t, FY) = PPC(t) · (1 + TREND(t) · TPPC) · exp(TREND(t) · (FY − t))",
        "One period ahead: P* = PPC · (1 + TPPC · g*) · exp(FH · g*),  g* = TREND(P; TPPC, THRC, TPT)",
      ],
      explain:
        "The first factor brings the stale perceived value up to today; the second compounds the believed trend over the horizon. Fitted parameters were about 1.2, 5.4 and 3.2 years for energy forecasts and 0.60, 6.0 and 0.56 years for cattle prices.",
      molecule: "extrapolation",
      pages: "640, 644",
    },
    {
      name: "Anchored and sea-anchored expectations",
      equations: [
        "Expected inflation = (1 − w) · TREND(CPI; 2, 12, 2 months) + w · Anchor",
        "Fixed anchor: Anchor = 0, w = 0.20",
        "Sea anchor: Anchor = TREND(CPI; 1, 10, 3 years), Anchor₀ = −3%/year, w = 0.25",
      ],
      explain:
        "The anchor stands for a deep belief about the inflation environment. Held fixed, it biases forecasts forever; as a slow TREND it drifts with long experience, damping forecasts on the way up and holding them high on the way down while still allowing eventual learning.",
      molecule: "seaAnchor",
      pages: "649-651",
    },
    {
      name: "Forecast-driven capacity",
      equations: [
        "Recent sales = SMOOTH(Sales, Sales perception time)",
        "Projected sales = Recent sales · (1 + Expected growth · Forecast horizon)",
        "Expected growth = TREND(Sales; Sales perception time, Historical horizon, Time to perceive growth)",
        "Desired capacity = Projected sales / Normal utilisation;  Capacity = SMOOTH3(Desired capacity, Acquisition lag)",
      ],
      explain:
        "A way to explore how the expectation rule affects a system's stability. Setting expected growth to zero gives myopic adaptive expectations, short of capacity during growth; extrapolation reduces that shortfall but overshoots at saturation.",
      molecule: "trend",
      pages: "656-658",
    },
  ],
  cases: [
    {
      title: "Forecasts of US energy use in 1985",
      text: "Forecasts made in the early 1970s put US energy consumption in 1985 at about 130 quadrillion BTU a year; actual use was under 74, an overestimate of about 75%. A TREND model driven only by actual consumption, with estimated TPPC 1.2, THRC 5.4 and TPT 3.2 years, tracked the median forecast closely, rising from about 70 in the early 1950s to about 125 by 1973 and then falling. With those parameters the expected growth rate adjusts only a quarter of the way to a new trend in 5 years and needs two decades to get 95% of the way. Utility electricity forecasts behaved similarly, with a smoothing time of about 5 years. Forecasts for the year 2000 fell by half between 1972 and 1983, yet the ranking of industry, government and environmentalists stayed the same.",
      pages: "638-643",
    },
    {
      title: "Cattle price forecasts",
      text: "Glenn Grimes's one-quarter-ahead forecasts of cattle prices, 1972 to 1986, beat the futures market, yet they missed turning points and kept predicting rises after prices fell at the end of the 1970s. Smoothing plus trend extrapolation of past prices alone, with TPPC 0.60, THRC 6.0 and TPT 0.56 years, reproduced them with a mean absolute percent error of about 4.5% and R² of 0.95. Grimes reported following fundamentals closely, such as feedlot numbers, breeding herds and diet trends, but those cues explained only a small residual; past prices were the dominant anchor.",
      pages: "643-645",
    },
    {
      title: "The Livingston inflation survey",
      text: "Professional forecasters' 6-month inflation forecasts from 1947 showed bias (under-prediction while inflation accelerated, over-prediction after it fell), phase lag and attenuation. TREND with judgmental parameters of 2, 12 and 2 months reproduced these features, with mean absolute error 0.014 and 40% of the squared error due to bias, and actually forecast better than the panel. A fixed zero anchor with weight 0.2 cut the error by 29%; a sea anchor (weight 0.25, long time constants, starting at −3% a year to reflect fear of post-war deflation) cut it by a further 11% and, with the original parameters, still tracked the forecasts through 1997. The panel's forecasts were also nearly identical to those of a major econometric forecasting firm.",
      pages: "645-654",
    },
    {
      title: "Forecasting capacity over a product life cycle",
      text: "Adding forecast-driven capacity to the Bass-type product life cycle model (see the module S-shaped growth: epidemics and diffusion) shows the trade-off. Smoothed sales leave capacity chronically short while demand grows; extrapolating recent growth over the capacity lead time tracks the boom better but keeps building after the market saturates. In experimental product life cycle markets, participants, many with business experience, did not forecast aggressively enough during growth, failed to anticipate saturation and ended with large excess capacity.",
      pages: "656-658",
    },
  ],
  exercises: [
    {
      prompt:
        "Open Trend and run 'Steady growth' (6% per month, perception time 4 months). Once the start-up transient has passed, compute Perceived ÷ Actual and compare it with 1/(1 + g·τ).",
      hint: "1/(1 + 0.06 × 4) = 1/1.24 ≈ 0.81: the perception settles about 19% below the truth and stays there for as long as growth continues.",
      answer:
        "After the first 15 or so months the ratio settles at about 0.81: at month 40 the perceived value is about 883 against an actual 1094, and at month 60 about 2920 against 3621. That matches 1/(1 + g·τ) = 1/(1 + 0.06 × 4) = 1/1.24 ≈ 0.81. First-order smoothing of a growing signal lags it by the perception time, and with exponential growth a 4-month lag means being about 24% behind in growth terms, a constant 19% shortfall that never closes while growth continues. Any decision based on the smoothed value under-estimates a growing quantity.",
      link: { label: "Trend", hash: "/m/trend" },
    },
    {
      prompt:
        "Still in Trend, run 'Turning point' (−4% per month). Is the perceived value now above or below actual, and by how much in steady state? What does this imply for a firm using smoothed sales to set capacity in a declining market?",
      hint: "1/(1 − 0.16) ≈ 1.19: perception stays about 19% too high, so capacity is overbuilt during the decline.",
      answer:
        "In decline the perception sits above actual: about 24.0 against 20.1 at month 40, a ratio of about 1.19, matching 1/(1 − 0.04 × 4) = 1/0.84. The same perception lag that makes a smoothed estimate trail growth makes it trail decline from above. A firm that sizes capacity from smoothed sales in a shrinking market will keep perceiving about 19% more demand than exists, so it overbuilds and carries excess capacity throughout the decline. It needs a trend correction, or direct indicators of decline, not just a smoother.",
      link: { label: "Trend", hash: "/m/trend" },
    },
    {
      prompt:
        "Open Extrapolation and run 'Nowcast (horizon 0)'. After the transient, does the extrapolated quantity match the actual quantity? Then run '5-year forecast' and compare the forecast with the actual value five years later.",
      hint: "The nowcast multiplies the perceived value by (1 + trend × perception time), which removes the perception lag, so it converges to the actual value. The molecule extrapolates linearly, so at 3% a year over 5 years it slightly under-shoots compound growth (about 1.14 versus 1.16 times today's value).",
      answer:
        "Yes. With horizon 0 the extrapolated quantity starts below actual (about 114 against 116 at year 5) because the trend estimate starts at zero, then converges: by year 20 both are at about 182 and they stay together. Multiplying the perceived value by (1 + trend × perception time) removes the perception lag. With the 5-year forecast, at year 20 the forecast is about 208 while the actual value at year 25 turns out to be about 212: the forecast is 1 + 0.03 × 5 = 1.15 times the current perceived level, about 1.14 times today's actual, against compound growth of e^(0.15) ≈ 1.16. Linear extrapolation of a compounding process under-predicts slightly, and more so for long horizons.",
      link: { label: "Extrapolation", hash: "/m/extrapolation" },
    },
    {
      prompt:
        "In Extrapolation, start from '5-year forecast' and change 'Duration over which to calculate trend' from 3 to 10 years. How long does the forecast take to stop under-predicting after the run starts? Relate this to the energy forecasters, whose estimated historical horizon was about 5 years.",
      hint: "All stocks start equal, so the perceived trend starts at zero and must build up. A longer horizon is steadier but much slower to accept a new growth rate.",
      answer:
        "Everything starts in equilibrium, so the perceived growth rate starts at 0 and has to build up. With a 3-year trend duration it reaches 95% of the true 3% (about 2.85%) after about 11 years; with 10 years it takes about 27 years, and the forecast under-predicts much more in the meantime (at year 20 the forecast is about 203 instead of about 208). A longer trend horizon filters out noise but makes forecasters very slow to accept a new growth rate. With a historical horizon of about 5 years, energy forecasters kept projecting old growth rates for years after the real rate changed, which is exactly the lag this run shows.",
      link: { label: "Extrapolation", hash: "/m/extrapolation" },
    },
    {
      prompt:
        "Open the inflation expectations application and compare '8% inflation, nowcast' with 'Inflation judged over 10 years', then 'Falling prices (−3%)'. Which features of the Livingston forecasts (bias, lag, attenuation) can you reproduce?",
      answer:
        "With 8% inflation and a nowcast, expected inflation builds slowly: the perceived rate is about 5.2% after 5 years and 7.5% after 10, so the expected price level stays below actual for a decade (bias and lag). Judging inflation over 10 years makes it much slower: about 2.4% perceived at year 5 and 5.1% at year 10 (stronger attenuation). With falling prices (−3%) the perceived rate reaches only about −1.8% after 5 years, so forecasts stay too high. The model reproduces the three Livingston features: forecasts are biased toward past inflation, they lag turning points, and they react less than one for one to changes in actual inflation.",
      link: { label: "Adaptive expectations of inflation", hash: "/apps/economics/expectations" },
    },
    {
      prompt:
        "Anchoring a forecast. In Weighted Average, treat Source A as the trend-extrapolated forecast and Source B as the anchor. Set A = 80, B = 40 and the weight on A to 0.75 (an anchor weight of 0.25, as in the sea-anchor model). How far below the extrapolation does the anchored forecast settle? What happens if the anchor itself slowly moves toward A?",
      hint: "0.75 × 80 + 0.25 × 40 = 70, an under-prediction of w × (A − B) = 10. A sea anchor that drifts toward experience shrinks this bias over time; a fixed anchor never does.",
      answer:
        "The anchored forecast settles at 0.75 × 80 + 0.25 × 40 = 70, which the run confirms, so it is 10 below the extrapolation, that is w × (A − B) with w = 0.25 on the anchor. If the anchor itself drifts toward A, say as a smooth of recent forecasts, the gap A − B shrinks and the bias decays toward zero over a few anchor time constants. A fixed anchor gives a permanent under-prediction; a moving anchor gives a bias that is temporary but slow, which is what forecasters who anchor on past values show.",
      link: { label: "Weighted Average", hash: "/m/weightedAvg" },
    },
    {
      prompt:
        "Self-fulfilling expectations. Run Sea Anchor & Adjustment with 'Runaway drift', then Protected Sea Anchor with 'Unprotected (drifts)' and 'Protected (stable)'. Explain how an expectation that feeds the very variable it predicts can drift without limit, and why tying it partly to a fundamental stops the drift.",
      answer:
        "In Runaway drift the value is 1.2 × anchor and the anchor follows the value, so the anchor grows about 3.3% a month without limit (about 222 at month 24 and 736 at month 60); Unprotected (drifts) does exactly the same. Protected (stable) puts half the weight on a fixed fundamental of 100, so the anchor settles where Anchor = 0.6 × Anchor + 50, at 125, with the value at 150. An expectation that feeds the variable it predicts (expected prices raising actual prices) is a reinforcing loop with gain above 1 whenever there is constant pressure, so it drifts like a speculative bubble. Tying part of the expectation to a fundamental lowers the loop gain below 1 and turns the drift into a new, finite equilibrium.",
      link: { label: "Protected Sea Anchor", hash: "/m/protectedSeaAnchor" },
    },
    {
      prompt:
        "Pen and paper: a utility smooths electricity demand over 2 years and extrapolates the trend. Demand has grown at 7% a year for decades and then growth suddenly falls to 2%. Sketch actual demand, the perceived present condition and a 10-year-ahead forecast over the following 15 years. Mark where the forecast overshoots, then propose a capacity policy that stays sound whatever the growth rate turns out to be.",
      hint: "Before the break, perceived demand trails by about 1/(1 + 0.07 × 2) ≈ 0.88. After the break, the believed trend falls only gradually, so the 10-year forecast stays far too high for years. Robust policies keep options open: shorter lead times, modular capacity, triggers based on observed utilisation.",
      answer:
        "Before the break, perceived demand trails actual by about 1/(1 + 0.07 × 2) ≈ 0.88 and the believed trend is 7%. After growth falls to 2%, actual demand bends at once; perceived demand bends a couple of years later; the believed trend takes several more years to fall from 7% toward 2%, so the 10-year forecast (perceived × (1 + trend × 10)) keeps assuming about 7% growth and lies far above the eventual actual demand for most of the 15 years, overshooting by tens of percent at its worst. Your sketch should show three curves: actual with a kink, perceived lagging it, and the forecast running above both and only slowly bending toward actual. A sound policy does not depend on knowing the growth rate: build in small modular units with short lead times, trigger new capacity from observed utilisation and reserve margins rather than long forecasts, keep options (sites, permits) ready, and review forecasts against outcomes.",
    },
  ],
  pitfalls: [
    "Giving model agents rational expectations or the true future path instead of a rule that forms forecasts from past, delayed data.",
    "Using plain exponential smoothing for a growing variable and not recognising the built-in steady-state lag.",
    "Initialising TREND's stocks at the current input, which starts the model with a spurious transient instead of in equilibrium.",
    "Choosing TREND parameters shorter than the real reporting delay, or ignoring the organisational inertia in accepting a new trend.",
    "Trusting a sophisticated forecast because of its method, when its exogenous inputs and add factors have been tuned to match intuition and consensus.",
    "Presenting single-number forecasts without ranges, scenarios or the assumptions they depend on (overconfidence).",
    "Designing policies that work only if the forecast is right, instead of policies robust to the turning points forecasts habitually miss.",
  ],
  molecules: ["smooth", "trend", "extrapolation", "seaAnchor", "protectedSeaAnchor", "weightedAvg", "smoothHigher"],
};
