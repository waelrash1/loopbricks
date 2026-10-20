// Methods: reference modes, validation, fit to data, and ML/AI with system dynamics.
// Every reference was checked against Crossref, arXiv or a publisher record (Oct 2026).
export type MethodRef = { text: string; short: string; doi?: string; url?: string };
export type MethodSection = {
  heading: string;
  body?: string[];
  list?: string[];
  formula?: string;
  table?: { head: string[]; rows: string[][] };
  cite?: string[];
};
export type MethodPage = { id: string; title: string; summary: string; tryIt?: { text: string; label: string; hash: string }; sections: MethodSection[]; refs: string[] };

export const METHOD_REFS: Record<string, MethodRef> = {
  saeed1998: { short: "Saeed 1998", text: "Saeed K (1998). Defining a problem or constructing a reference mode. Proceedings of the 16th International Conference of the System Dynamics Society.", url: "https://archives.albany.edu/description/catalog/ua435aspace_f73856ed1a9e43d7fd7a3e9ccad2940e" },
  sterman2000: { short: "Sterman 2000", text: "Sterman JD (2000). Business Dynamics: Systems Thinking and Modeling for a Complex World. Irwin/McGraw-Hill. Ch. 3 The modeling process; ch. 4 Structure and behavior of dynamic systems; ch. 21 Truth and beauty: validation and model testing." },
  martinezmoyano2013: { short: "Martinez-Moyano and Richardson 2013", text: "Martinez-Moyano IJ, Richardson GP (2013). Best practices in system dynamics modeling. System Dynamics Review 29(2):102-123.", doi: "10.1002/sdr.1495" },
  forrester1980: { short: "Forrester and Senge 1980", text: "Forrester JW, Senge PM (1980). Tests for building confidence in system dynamics models. In Legasto AA, Forrester JW, Lyneis JM (eds), System Dynamics. TIMS Studies in the Management Sciences 14. North-Holland." },
  barlas1996: { short: "Barlas 1996", text: "Barlas Y (1996). Formal aspects of model validity and validation in system dynamics. System Dynamics Review 12(3):183-210.", doi: "10.1002/(SICI)1099-1727(199623)12:3<183::AID-SDR103>3.0.CO;2-4" },
  barlas1989: { short: "Barlas 1989", text: "Barlas Y (1989). Multiple tests for validation of system dynamics type of simulation models. European Journal of Operational Research 42(1):59-87.", doi: "10.1016/0377-2217(89)90059-3" },
  qudratullah2010: { short: "Qudrat-Ullah and Seong 2010", text: "Qudrat-Ullah H, Seong BS (2010). How to do structural validity of a system dynamics type simulation model: the case of an energy policy model. Energy Policy 38(5):2216-2224.", doi: "10.1016/j.enpol.2009.12.009" },
  oliva2003: { short: "Oliva 2003", text: "Oliva R (2003). Model calibration as a testing strategy for system dynamics models. European Journal of Operational Research 151(3):552-568.", doi: "10.1016/S0377-2217(02)00622-7" },
  sterman2002: { short: "Sterman 2002", text: "Sterman JD (2002). All models are wrong: reflections on becoming a systems scientist. System Dynamics Review 18(4):501-531.", doi: "10.1002/sdr.261" },
  sterman1984: { short: "Sterman 1984", text: "Sterman JD (1984). Appropriate summary statistics for evaluating the historical fit of system dynamics models. Dynamica 10(2):51-66.", url: "https://mitmgmtfaculty.mit.edu/jsterman/online-publications/" },
  theil1966: { short: "Theil 1966", text: "Theil H (1966). Applied Economic Forecasting. North-Holland." },
  andrade2020: { short: "Andrade and Duggan 2020", text: "Andrade J, Duggan J (2020). An evaluation of Hamiltonian Monte Carlo performance to calibrate age-structured compartmental SEIR models to incidence data. Epidemics 33:100415.", doi: "10.1016/j.epidem.2020.100415" },
  rahmandad2015: { short: "Rahmandad, Oliva and Osgood 2015", text: "Rahmandad H, Oliva R, Osgood ND, eds (2015). Analytical Methods for Dynamic Modelers. MIT Press.", doi: "10.7551/mitpress/9927.001.0001" },
  kwakkel2013: { short: "Kwakkel and Pruyt 2013", text: "Kwakkel JH, Pruyt E (2013). Exploratory Modeling and Analysis, an approach for model-based foresight under deep uncertainty. Technological Forecasting and Social Change 80(3):419-431.", doi: "10.1016/j.techfore.2012.10.005" },
  bryant2010: { short: "Bryant and Lempert 2010", text: "Bryant BP, Lempert RJ (2010). Thinking inside the box: a participatory, computer-assisted approach to scenario discovery. Technological Forecasting and Social Change 77(1):34-49.", doi: "10.1016/j.techfore.2009.08.002" },
  pruyt2014: { short: "Pruyt and Kwakkel 2014", text: "Pruyt E, Kwakkel JH (2014). Radicalization under deep uncertainty: a multi-model exploration of activism, extremism, and terrorism. System Dynamics Review 30(1-2):1-28.", doi: "10.1002/sdr.1510" },
  brunton2016: { short: "Brunton, Proctor and Kutz 2016", text: "Brunton SL, Proctor JL, Kutz JN (2016). Discovering governing equations from data by sparse identification of nonlinear dynamical systems. PNAS 113(15):3932-3937.", doi: "10.1073/pnas.1517384113" },
  rackauckas2020: { short: "Rackauckas et al. 2020", text: "Rackauckas C, Ma Y, Martensen J, et al. (2020). Universal differential equations for scientific machine learning. arXiv:2001.04385.", url: "https://arxiv.org/abs/2001.04385" },
  chen2018: { short: "Chen et al. 2018", text: "Chen RTQ, Rubanova Y, Bettencourt J, Duvenaud D (2018). Neural ordinary differential equations. arXiv:1806.07366.", url: "https://arxiv.org/abs/1806.07366" },
  edali2019: { short: "Edali and Yücel 2019", text: "Edali M, Yücel G (2019). Exploring the behavior space of agent-based simulation models using random forest metamodels and sequential sampling. Simulation Modelling Practice and Theory 92:62-81.", doi: "10.1016/j.simpat.2018.12.006" },
  yucel2011: { short: "Yücel and Barlas 2011", text: "Yücel G, Barlas Y (2011). Automated parameter specification in dynamic feedback models based on behavior pattern features. System Dynamics Review 27(2):195-215.", doi: "10.1002/sdr.457" },
  chen2011: { short: "Chen, Tu and Jeng 2011", text: "Chen Y-T, Tu Y-M, Jeng B (2011). A machine learning approach to policy optimization in system dynamics models. Systems Research and Behavioral Science 28(4):369-390.", doi: "10.1002/sres.1089" },
  hosseinichimeh2024: { short: "Hosseinichimeh et al. 2024", text: "Hosseinichimeh N, Majumdar A, Williams R, Ghaffarzadegan N (2024). From text to map: a system dynamics bot for constructing causal loop diagrams. System Dynamics Review 40(3):e1782.", doi: "10.1002/sdr.1782" },
  ghaffarzadegan2024: { short: "Ghaffarzadegan et al. 2024", text: "Ghaffarzadegan N, Majumdar A, Williams R, Hosseinichimeh N (2024). Generative agent-based modeling: an introduction and tutorial. System Dynamics Review 40(1):e1761.", doi: "10.1002/sdr.1761" },
  rahmandad2008rl: { short: "Rahmandad and Fallah-Fini 2008", text: "Rahmandad H, Fallah-Fini S (2008). Learning control policies in system dynamics models. Proceedings of the 26th International Conference of the System Dynamics Society.", url: "https://proceedings.systemdynamics.org/2008/proceed/abstracts/388.html" },
  klu2023: { short: "Klu et al. 2023", text: "Klu E, Sethi S, Passey DJ, Martin D (2023). SDGym: low-code reinforcement learning environments using system dynamics models. arXiv:2310.12494 (preprint).", url: "https://arxiv.org/abs/2310.12494" },
  coyle1985: { short: "Coyle 1985", text: "Coyle RG (1985). The use of optimization methods for policy design in a system dynamics model. System Dynamics Review 1(1):81-91.", doi: "10.1002/sdr.4260010107" },
  rahmandad2008ms: { short: "Rahmandad and Sterman 2008", text: "Rahmandad H, Sterman J (2008). Heterogeneity and network structure in the dynamics of diffusion: comparing agent-based and differential equation models. Management Science 54(5):998-1014.", doi: "10.1287/mnsc.1070.0787" },
  rudin2019: { short: "Rudin 2019", text: "Rudin C (2019). Stop explaining black box machine learning models for high stakes decisions and use interpretable models instead. Nature Machine Intelligence 1(5):206-215.", doi: "10.1038/s42256-019-0048-x" },
};
export const METHOD_PAGES: MethodPage[] = [
  {
    id: "reference-modes",
    title: "Reference modes: start from the behaviour",
    summary: "A model represents a problem, not a whole system. The reference mode is the graph of that problem over time, drawn before any structure.",
    tryIt: {
      text: "Open a molecule, choose Add data in the Runs and data panel, and type a hypothesised pattern as time, value pairs. It is drawn as dots, and every run is compared with it.",
      label: "Draw a reference mode on Smooth",
      hash: "/m/smooth",
    },
    sections: [
      {
        heading: "What a reference mode is",
        body: [
          "A reference mode is a graph of the key variables of the problem over time: what has happened, what you fear will happen, and what you hope will happen. It fixes the purpose of the model and the time horizon before you draw a single stock.",
          "Saeed argues that system dynamics models represent problems, not systems, so no model can exist until a problem is defined. The reference mode is usually based on history, but it is a pattern drawn from a slice of history, not the raw record, and a few archetypal patterns cover many problems.",
          "In the expert survey of modelling practice by Martinez-Moyano and Richardson, problem definition is the first of six stages of the modelling process.",
        ],
        cite: ["saeed1998", "martinezmoyano2013", "sterman2000"],
      },
      {
        heading: "How to draw one",
        list: [
          "Put time on the horizontal axis and choose a horizon long enough to show the dynamics and the delayed effects of policies.",
          "Plot the few variables that define the problem, in real units.",
          "Mark which parts are data and which are hypothesis.",
          "Sketch the feared and the hoped-for futures as separate lines: the gap between them is what policy must change.",
        ],
        cite: ["sterman2000", "saeed1998"],
      },
      {
        heading: "Patterns and the structures behind them",
        body: ["Each basic pattern of behaviour points to a dominant feedback structure, which is where the modelling starts (following Sterman 2000, ch. 4). Every pattern below has a molecule in LoopBricks you can run."],
        table: {
          head: ["Pattern", "Dominant structure", "Molecule to try"],
          rows: [
            ["Exponential growth", "A reinforcing loop", "Population Growth"],
            ["Goal seeking", "A balancing loop", "Close Gap"],
            ["S-shaped growth", "Dominance shifts from a reinforcing to a balancing loop", "Constrained Growth, Diffusion"],
            ["Oscillation", "A balancing loop with a delay", "Stock Management"],
            ["Overshoot and collapse", "Growth that erodes its own carrying capacity", "Fisheries case (Applications)"],
          ],
        },
        cite: ["sterman2000"],
      },
      {
        heading: "Common mistakes",
        list: [
          "Plotting events or single values instead of a pattern over time.",
          "Treating the reference mode as a forecast to hit point by point, rather than a pattern to explain.",
          "Starting to model a whole system with no defined problem.",
          "Choosing a horizon too short to show the delayed consequences of the policies you want to test.",
        ],
        cite: ["saeed1998"],
      },
    ],
    refs: ["saeed1998", "sterman2000", "martinezmoyano2013"],
  },
  {
    id: "validation",
    title: "Validating a system dynamics model",
    summary: "No test proves a model true. Confidence grows as the model passes more tests of its structure, its behaviour and its policy conclusions.",
    tryIt: {
      text: "Every runnable case in Applications carries behaviour checks that run as the page opens. Extreme-condition and integration-error tests are easy to try here: set an inflow to zero, or slow the speed and step through.",
      label: "See validation checks on a case",
      hash: "/apps/health/delayed-discharge",
    },
    sections: [
      {
        heading: "Confidence, not truth",
        body: [
          "Forrester and Senge proposed tests in three groups, of structure, of behaviour and of policy implications, and argued that confidence accumulates as a model passes them; no single test validates a model. Sterman puts it bluntly: all models are wrong.",
          "Barlas orders the work. Test the structure directly first, then structure-oriented behaviour (does the model respond to extreme conditions as the real system would?), and only then compare behaviour patterns with data. For a causal model, the right behaviour for the wrong reasons is a failure. Qudrat-Ullah and Seong work through structural validity on an energy policy model.",
          "Behaviour tests should compare patterns such as trend, period and amplitude, not individual points, because standard statistical significance tests do not suit feedback models. That is not a licence for purely qualitative checks.",
        ],
        cite: ["forrester1980", "sterman2002", "barlas1996", "qudratullah2010", "barlas1989"],
      },
      {
        heading: "Twelve tests",
        body: ["The list follows the twelve tests of Sterman (2000, ch. 21), which condense Forrester and Senge's set. How to run each one is standard practice."],
        table: {
          head: ["Test", "The question", "How to run it"],
          rows: [
            ["Boundary adequacy", "Are the important concepts endogenous?", "List endogenous, exogenous and excluded variables; add an excluded feedback and see whether behaviour or policy conclusions change."],
            ["Structure verification", "Is the structure consistent with what is known about the real system?", "Compare it with the literature, data and expert review, link by link."],
            ["Dimensional consistency", "Does every equation balance in units without fudge factors?", "Check the units of each equation, with a unit checker where the software has one."],
            ["Parameter verification", "Do parameters have real meaning and plausible values?", "Estimate from data, studies or experts, or by calibration."],
            ["Extreme conditions", "Does the model behave sensibly at zero or extreme inputs?", "Set inputs to zero or very large values and check every stock stays meaningful."],
            ["Integration error", "Do results depend on the time step or the method?", "Halve the time step and switch from Euler to Runge-Kutta; results should not change materially."],
            ["Behaviour reproduction", "Does the model reproduce the reference mode and data?", "Compare patterns, and use fit statistics such as RMSE and Theil's shares."],
            ["Behaviour anomaly", "Does removing a relationship produce implausible behaviour?", "Cut a loop and check that the model then misbehaves the way theory says it should."],
            ["Family member", "Can the model reproduce other cases of the same kind of system?", "Re-parameterise it for another instance."],
            ["Surprise behaviour", "Does the model produce unexpected behaviour that turns out to be real?", "Investigate surprises before dismissing them."],
            ["Sensitivity analysis", "Are conclusions robust to uncertain parameters and structure?", "Run numerical, behavioural and policy sensitivity tests, often as Monte Carlo ensembles."],
            ["System improvement", "Did the modelling actually help improve the system?", "Evaluate after implementation."],
          ],
        },
        cite: ["sterman2000", "forrester1980", "barlas1996"],
      },
      {
        heading: "Calibration as a test",
        body: [
          "Fitting a model to history is itself a demanding test of the hypothesis that the structure produces the behaviour. A good fit is necessary but not sufficient; the other tests carry as much weight.",
        ],
        cite: ["oliva2003"],
      },
      {
        heading: "Fit the tests into the process",
        body: ["The 72 practices in Martinez-Moyano and Richardson's expert survey spread testing across the whole modelling process, not a final step after the model is built."],
        cite: ["martinezmoyano2013"],
      },
    ],
    refs: ["forrester1980", "barlas1996", "barlas1989", "qudratullah2010", "oliva2003", "sterman2000", "sterman2002", "martinezmoyano2013"],
  },
  {
    id: "fit",
    title: "Measuring fit to data",
    summary: "How far a run is from the data, and why. Theil's statistics split the error into bias, unequal variation and unequal covariation, so you know what to fix.",
    tryIt: {
      text: "On any molecule or case, add data in the Runs and data panel. The panel computes RMSE, MAPE, R² and Theil's shares for the current run, and Calibrate tunes the sliders you tick to fit the data.",
      label: "Fit Decay to data",
      hash: "/m/decay",
    },
    sections: [
      {
        heading: "Size of the error",
        body: ["With S the simulated values, A the observed values and n points:"],
        formula: "MSE  = (1/n) Σ (S − A)²\nRMSE = √MSE                        (in the variable's units)\nMAPE = (1/n) Σ |S − A| / |A|       (undefined when A = 0)\nR²   = r²                          (r: correlation of S and A; measures co-movement, not bias)",
        cite: ["sterman1984"],
      },
      {
        heading: "Where the error comes from",
        body: [
          "Sterman recommends reporting the root mean square error together with Theil's inequality statistics: they need no formal estimation, are easy to compute, and show which mode of behaviour the error comes from. The decomposition is an identity (the shares sum to one); it holds exactly when the standard deviations divide by n.",
        ],
        formula: "MSE = (S̄ − Ā)² + (sS − sA)² + 2(1 − r)·sS·sA\n\nUm = (S̄ − Ā)² / MSE           bias\nUs = (sS − sA)² / MSE          unequal variation\nUc = 2(1 − r)·sS·sA / MSE      unequal covariation\nUm + Us + Uc = 1",
        cite: ["sterman1984", "theil1966"],
      },
      {
        heading: "Reading the shares",
        list: [
          "Large Um: the run sits systematically above or below the data. Check initial values and constant parameters.",
          "Large Us: the run swings more or less than the data, or the trends differ. Check gains and time constants.",
          "Large Uc: the error is point by point, such as noise or a small phase shift. That is often acceptable when the purpose is the pattern, not each point.",
          "Always read the shares next to the size of the error: a tiny error that is all bias is still a close fit.",
        ],
        cite: ["sterman1984"],
      },
      {
        heading: "Calibration",
        body: [
          "Calibration searches parameter values that minimise the error. Done carefully it is a testing strategy, not just curve fitting. Andrade and Duggan compared Hamiltonian Monte Carlo, which returns a full posterior distribution, with Nelder-Mead optimisation for calibrating age-structured epidemic models to incidence data. LoopBricks uses Nelder-Mead over the sliders you choose; Rahmandad, Oliva and Osgood's textbook covers the wider toolkit.",
        ],
        cite: ["oliva2003", "andrade2020", "rahmandad2015"],
      },
    ],
    refs: ["sterman1984", "theil1966", "oliva2003", "andrade2020", "rahmandad2015"],
  },
  {
    id: "ml-ai",
    title: "Machine learning and AI with system dynamics",
    summary: "Data-driven methods work best inside a feedback model, not instead of it: estimating parameters, exploring uncertainty, learning parts of the structure, and helping people build models faster.",
    tryIt: {
      text: "The Calibrate button in the Runs and data panel is the simplest example of the first approach below: an optimiser learns parameter values from data while the stock-and-flow structure stays fixed.",
      label: "Calibrate a model",
      hash: "/m/decay",
    },
    sections: [
      {
        heading: "Nine ways they combine",
        table: {
          head: ["Approach", "What it does with a system dynamics model", "Examples"],
          rows: [
            ["Calibration and Bayesian estimation", "Learns parameter values, or their full uncertainty, from data; the structure stays fixed.", "Rahmandad, Oliva and Osgood 2015; Andrade and Duggan 2020; Oliva 2003"],
            ["Exploratory modelling and scenario discovery", "Runs large ensembles across deep uncertainty and uses machine learning to find which input combinations lead to outcomes of concern.", "Kwakkel and Pruyt 2013; Bryant and Lempert 2010; Pruyt and Kwakkel 2014"],
            ["Equation discovery", "Sparse regression picks the fewest terms that explain the data, suggesting candidate flow equations for review.", "Brunton, Proctor and Kutz 2016"],
            ["Hybrid models", "A neural network learns one unknown relationship, such as a table function, inside a known stock-and-flow structure.", "Rackauckas et al. 2020; Chen et al. 2018"],
            ["Surrogates", "A fast learned approximation of a slow model, trained on many runs, for searching policies or exploring behaviour space.", "Edali and Yücel 2019 (agent-based models)"],
            ["Pattern recognition", "Searches parameters to match the features of a pattern, such as oscillation period or growth phase, even without a data series.", "Yücel and Barlas 2011"],
            ["Policy optimisation", "Optimisers and learning algorithms search policy designs that perform well in the model.", "Coyle 1985; Chen, Tu and Jeng 2011"],
            ["Reinforcement learning", "An agent learns a control policy by acting in the model as an environment.", "Rahmandad and Fallah-Fini 2008; Klu et al. 2023 (preprint)"],
            ["Generative AI", "Language models draft causal loop diagrams from text, or play the decision makers inside a model.", "Hosseinichimeh et al. 2024; Ghaffarzadegan et al. 2024"],
          ],
        },
        cite: ["rahmandad2015", "kwakkel2013", "brunton2016", "rackauckas2020", "yucel2011", "hosseinichimeh2024"],
      },
      {
        heading: "What the evidence says so far",
        list: [
          "The SD Bot, which drafts causal loop diagrams from text with a language model, recovered about 60% of the links and loops in its two test sets, so the rest needs a modeller's correction.",
          "In generative agent-based models, where a language model represents people's decisions, results were sensitive to the wording of the prompts.",
          "Comparing agent-based and differential equation versions of the same diffusion process, Rahmandad and Sterman found the average agent-based dynamics can differ from the aggregate model, while disaggregation costs computation and limits sensitivity analysis.",
        ],
        cite: ["hosseinichimeh2024", "ghaffarzadegan2024", "rahmandad2008ms"],
      },
      {
        heading: "Cautions",
        list: [
          "A good fit is not a valid structure. Calibration and learned components belong inside the wider set of validation tests.",
          "Correlation is not feedback structure: a model used for policy must give the right behaviour for the right reasons.",
          "For high-stakes decisions, prefer models that are interpretable by design over explaining a black box afterwards. Keeping the stock-and-flow structure and learning only the uncertain parts follows that advice.",
          "Data for social systems are often short and noisy. Pattern-based tests and qualitative reference modes still work when data are scarce.",
          "Anything a language model drafts, from a diagram to a parameter, needs checking by someone who knows the system.",
        ],
        cite: ["oliva2003", "barlas1996", "qudratullah2010", "rudin2019", "barlas1989", "yucel2011", "hosseinichimeh2024"],
      },
    ],
    refs: ["rahmandad2015", "andrade2020", "oliva2003", "kwakkel2013", "bryant2010", "pruyt2014", "brunton2016", "rackauckas2020", "chen2018", "edali2019", "yucel2011", "coyle1985", "chen2011", "rahmandad2008rl", "klu2023", "hosseinichimeh2024", "ghaffarzadegan2024", "rahmandad2008ms", "rudin2019", "barlas1996", "barlas1989", "qudratullah2010"],
  },
];
