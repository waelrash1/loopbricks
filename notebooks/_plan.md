# Authoring plan for the book

Internal guide for writing the chapters (Quarto ignores files that start with `_`). It records what the editorial review agreed; change it here first, then in the chapters.

## This edition (branch `book-ai`): organised by the modelling process, with AI at every stage

The `book` branch groups chapters by topic. This edition groups them by the **stage of the modelling process** they serve, and gives every stage a chapter on how generative AI, reasoning models and agents help at that stage, and how to check them. The stage names are ours; the process itself is common to the field [@richardson1981; @sterman2000; @martinezmoyano2013].

| Part | Stage question | Chapters | New AI chapter |
|---|---|---|---|
| I Foundations | What is a feedback model, and what can an AI partner do? | 1 Why systems push back | 2 Modelling with AI partners (c17) |
| II Stage 1. Conceptualise | What is the problem, over time, and which feedback could explain it? | 3 From story to diagram | 4 AI for the problem and the hypothesis (c18) |
| III Stage 2. Formulate | What exactly is the structure, in equations and decision rules? | 5 to 9 (loops, delays, decisions, swings, patterns) | 10 AI for formulation (c19) |
| IV Stage 3. Test | Is the model right for the right reasons, and how sure are we? | 11 Learning from data, 12 Testing, 13 Calibration | 14 AI for testing and calibration (c20) |
| V Stage 4. Decide | Which policy, how robust, and how do we say so? | 15 From model to decision | 16 AI for policy and decisions (c21) |
| VI Applications | The whole process, start to finish | 17 to 20 (supply chain, epidemic, project, fishery) | (each case: section 7, an "AI pass" through all four stages) |

The old chapter 12 (Models that learn) is dissolved into the stage AI chapters: its section 1 (drafting a diagram with an LLM) goes to c18, section 2 (structure discovery) to c19, sections 3, 4 and 6 (hybrid models, the forecasting contest, overfitting and leakage) to c20, and section 5 (surrogates) to c21. Machine learning stays where it was useful; it is now beside the language-model material for the same stage.

File names no longer give the order; `_quarto.yml` does. Cross-references use labels (`@sec-...`), and prose says "chapter N" only through those labels or numbers that match `_quarto.yml`.

### Three kinds of AI, used on purpose

- **Generative AI** drafts: variable lists, diagrams, equations, briefs, interface code. Drafts are cheap and often wrong in fluent ways.
- **Reasoning models** think before they answer (`reasoning=True`). Use them to critique: is this problem dynamic, is this polarity right, why did this test fail, what would break this policy.
- **Agents** act: a model chooses tools (Python functions we write: simulate, check units, run a test, fit) in a loop, and reads the results. The tools compute every number; the model never supplies one.

### The contract, in every AI section

1. **The modeller owns the model.** AI drafts and critiques; a person decides, and says so in the record.
2. **Check by code, not by eye.** Every AI output meets a check: quotes found in the source, a spec that loads, units that balance, numbers in a brief that match the run.
3. **Numbers come from tools.** An agent's answer may quote only numbers a tool returned; a check enforces it.
4. **Record what was asked.** Prompt, model, date and replay key are kept with the output, as for any source.
5. **Protect people's data.** No confidential interview or patient data goes to an external service without consent and an agreement.

### Replay: how the chapters run offline

All model calls go through `loopbricks.ai` (`ask`, `ask_json`, `agent`, `show`). Each reply is stored in `data/ai/<chapter>.json`, keyed by a hash of the whole request, so chapters run anywhere, free and identically; a changed prompt or tool result raises `MissingReply`. With `LB_AI_LIVE=1` and `ANTHROPIC_API_KEY`, missing replies come from a live model and are recorded. Every record says how it was made (`how`): a live call, or written for the book. Text that shows a reply written for the book says so, as the old chapter 12 did; never present one as a live model's output. Authors without a key use `ai.author(run, replies, replay=..., how=...)`.

### AI chapter template (c17 to c21)

The usual chapter template, plus: each section names the stage task, the kind of AI (generative, reasoning, agent), the prompt or tools, the replayed reply, the **check by code**, and **what stays human**. Each AI chapter ends with a **Failure gallery** (the ways this stage's AI goes wrong, each shown or tested) alongside Check it, Running case, Tell the decision maker, Going further, Mini-project and Further reading.

## The book

**System Dynamics with Python: Building, Testing and Using Feedback Models for Decisions**

A hands-on book that teaches analysts to build, test and use system dynamics models in Python, so they can answer the questions decision makers ask: why is this happening, what if we act, and how sure are we?

- **Reader:** the analytical modeller. Postgraduate students and early-career analysts who code or are learning to; data scientists; researchers. Experienced system dynamicists read on a fast path.
- **Beneficiaries:** decision and policy makers. They do not read the code; the reader learns to produce what they need.
- **Stands alone.** The LoopBricks app is a companion, never a prerequisite. Chapters do not open with "the Python companion to".
- **Running case:** one outpatient waiting list, built up chapter by chapter, from `data/waiting_list.csv`: synthetic monthly counts by time band (2014 to 2023), shaped like published Irish NTPF series (whose reuse licence is unconfirmed); no additions or removals, so the flows must be inferred. Swap in the real series (same columns) once the licence is confirmed.

## Structure (the `book` branch, by topic; kept for the content of each chapter)

| Part | Chapter | Running case step | Home molecules (explained here first; elsewhere only used and referenced) | Draws on old notebooks |
|---|---|---|---|---|
| I Getting started | 1 Why systems push back | The waiting list as a bathtub; the first model in fifty lines | bathtub, conversion, split, broken | 01, 02, 17 (Euler) |
| | 2 From story to diagram | Interviews to a causal loop diagram; reference mode from the data; boundary chart; dynamic hypothesis | (none; qualitative) | 03, 04, 12 |
| II How structure drives behaviour | 3 Loops that grow, settle and tip | Referrals that grow; a target that pulls the list down | growth, decay, goToZero, closegap, residence, logistic, diffusion, ceiling, floor, marketshare | 05, 07, 08, 04 |
| | 4 Delays, pipelines and memory | Referral backlog in stages; perceived waiting time | material, cascade, smooth, smoothHigher, trend, extrapolation, aging, agingPDY, coflow, coflowExperience, cascadedCoflow, weightedAvg | 06, 09, 14 |
| | 5 Decisions inside the model | Staffing and treatment rules; productivity; nonlinear effects | stockAdjust, effectFunction, capacityUtil, univariateAnchor, multivariateAnchor, seaAnchor, protectedSeaAnchor, presentValue, propSplit, weightedSplit, multiSplit, nonlinearSplit, protLevel, protFlow, backlogFlow, backlogLevel, actionFromResource, resourcesFromAction, abilityFromAction, financialFlow, workforceFromBudget, doingWork, producing, productivity, estProductivity | 13, 14 |
| | 6 Why things swing | Hiring to a moving target; swings in staff and list | stockmgmt, lowVisPipeline, workforce, desiredWorkforce, buildingInventory, smoothPricing, seaAnchorPricing, protSeaAnchorPricing | 10, 15 |
| | 7 Patterns that repeat | Outsourcing as shifting the burden; overtime that backfires | tragedyCommons, shiftingBurden, prodFatigue, effectFatigue, overtime, quality, reworkCycle, schedulePressure | 11, 01 |
| III Evidence | 8 Learning from data: statistics and machine learning | Variation, intervals and the bootstrap, correlation under feedback, least squares, error measures, train and test, and when learned models fail a policy change | (none; foundations) | (new) |
| | 9 Testing your model | Verify and build confidence in the waiting-list model | protByPDY, doingWorkCascade, cascadeProtByPDY, reducingBacklog | 16 |
| | 10 Data, calibration and uncertainty | Calibrate to the NTPF series; held-out years; uncertainty | (none new) | 16, 18 |
| IV Models in use | 11 From model to decision | Policy design, robustness, a one-page brief, an interactive simulator; plus a published-model replication | estRemaining, estCompletion | 12, 18 |
| | 12 Models that learn | ML forecasting contest under a policy change; hybrid curves; structure discovery; LLM-drafted diagrams | (none new) | 18 |
| V Applications | 13 Case study: a supply chain that amplifies demand | (own case) Bullwhip across three stages; supply line, shared demand, lead times | (uses stockmgmt, lowVisPipeline) | (new) |
| | 14 Case study: an epidemic and the hospital beds it needs | (own case) SEIR with bed demand; early calibration; timing of measures | (uses diffusion, cascade) | (new) |
| | 15 Case study: a project that runs late | (own case) Rework cycle, staffing, overtime; Brooks's law | (uses reworkCycle, schedulePressure, overtime, quality, workforce) | (new) |
| | 16 Case study: a fishery and its fleet | (own case) Overshoot and collapse; quotas, entry limits, harvest rules | (uses tragedyCommons, logistic) | (new) |

Appendices (A to F all written; the 18 module notebooks are no longer in the book): A Python in a hurry; B The package and equation language; C The molecule catalogue (all 73 with their home chapters; 71 after Hines, while Tragedy of the Commons and Shifting the Burden are our own archetype models); D Glossary; E From Vensim and Stella to Python (PySD, XMILE); F Thesis and project toolkit.

## Chapter template

1. Opening: the problem in two or three sentences, with a drawn stock-and-flow diagram. Who it is for, who can skip, prerequisites, about how long.
2. Learning outcomes, as assessable verbs (build, diagnose, justify), each tied to an exercise.
3. Sections, each: idea in plain words, short code, a sentence that reads the result, a **Try it** (tiered: check, apply, extend) with a **Worked answer** in a `<details>` block.
4. **Check it**: a short verification habit (units, extreme conditions, halving dt).
5. **Running case**: this chapter's increment.
6. **Tell the decision maker** (only where a policy is at stake) and **Going further** (advanced methods, optional libraries).
7. Mini-project (an extension of the running case), further reading.

## Style sheet

1. British spelling (-ise, behaviour, modelling, labour); "towards".
2. Sentence case for chapter, section and figure titles; no question mark before a colon.
3. Molecule names capitalised in prose, with the code key in code font on first use; "and", not "&".
4. Variables in code font exactly as the API spells them; display names in plain text.
5. Thousands separator in prose from 1,000; none in code.
6. Percent in prose as "18%"; say whether a parameter is a fraction or a percent.
7. A unit on first mention of every quantity and on every axis label.
8. Define every term before use, in bold at first definition. One word for one idea: "adjustment time" for the time to close a gap, "delay time" for a delay, "smoothing time" for perception.
9. Equations in display LaTeX; inline code only for code.
10. Author-date citations from one `references.bib`; every reference checked to exist (Crossref) before use.
11. Code lines of 79 characters or fewer; one setup cell; one `SEED` per chapter.
12. Every figure with a caption and alt text, a colour-blind-safe palette and distinct line styles, readable in greyscale.
13. Sentences of about 25 words or fewer; no em or en dashes.
14. Varied, international examples; data sources with licence and credit lines.
15. Credit Hines on every molecule taken from him: "after Hines, Molecules of Structure", noting where ours differs. Tragedy of the Commons and Shifting the Burden are our own models of archetypes and say so.

## Rules that do not change

- Our own words throughout. Sterman and others are cited as sources, never followed as a frame, quoted at length or paraphrased closely.
- Every number in the text comes from running the code; the notebook test suite runs every chapter.
- Notebooks are committed without outputs (`npm run check` enforces it); `npm run book` renders and clears.
