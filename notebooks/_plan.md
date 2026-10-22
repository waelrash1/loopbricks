# Authoring plan for the book

Internal guide for writing the chapters (Quarto ignores files that start with `_`). It records what the editorial review agreed; change it here first, then in the chapters.

## The book

**System Dynamics with Python: Building, Testing and Using Feedback Models for Decisions**

A hands-on book that teaches analysts to build, test and use system dynamics models in Python, so they can answer the questions decision makers ask: why is this happening, what if we act, and how sure are we?

- **Reader:** the analytical modeller. Postgraduate students and early-career analysts who code or are learning to; data scientists; researchers. Experienced system dynamicists read on a fast path.
- **Beneficiaries:** decision and policy makers. They do not read the code; the reader learns to produce what they need.
- **Stands alone.** The LoopBricks app is a companion, never a prerequisite. Chapters do not open with "the Python companion to".
- **Running case:** one hospital waiting list, built up chapter by chapter, using Irish waiting-list data (NTPF via data.gov.ie, CC BY; monthly counts by time band, 2014 to March 2021; no additions or removals are published, so the flows must be inferred).

## Structure

| Part | Chapter | Running case step | Home molecules (explained here first; elsewhere only used and referenced) | Draws on old notebooks |
|---|---|---|---|---|
| I Getting started | 1 Why systems push back | The waiting list as a bathtub; the first model in fifty lines | bathtub, conversion, split, broken | 01, 02, 17 (Euler) |
| | 2 From story to diagram | Interviews to a causal loop diagram; reference mode from the data; boundary chart; dynamic hypothesis | (none; qualitative) | 03, 04, 12 |
| II How structure drives behaviour | 3 Loops that grow, settle and tip | Referrals that grow; a target that pulls the list down | growth, decay, goToZero, closegap, residence, logistic, diffusion, ceiling, floor, marketshare | 05, 07, 08, 04 |
| | 4 Delays, pipelines and memory | Referral backlog in stages; perceived waiting time | material, cascade, smooth, smoothHigher, trend, extrapolation, aging, agingPDY, coflow, coflowExperience, cascadedCoflow, weightedAvg | 06, 09, 14 |
| | 5 Decisions inside the model | Staffing and treatment rules; productivity; nonlinear effects | stockAdjust, effectFunction, capacityUtil, univariateAnchor, multivariateAnchor, seaAnchor, protectedSeaAnchor, presentValue, propSplit, weightedSplit, multiSplit, nonlinearSplit, protLevel, protFlow, backlogFlow, backlogLevel, actionFromResource, resourcesFromAction, abilityFromAction, financialFlow, workforceFromBudget, doingWork, producing, productivity, estProductivity | 13, 14 |
| | 6 Why things swing | Hiring to a moving target; swings in staff and list | stockmgmt, lowVisPipeline, workforce, desiredWorkforce, buildingInventory, smoothPricing, seaAnchorPricing, protSeaAnchorPricing | 10, 15 |
| | 7 Patterns that repeat | Outsourcing as shifting the burden; overtime that backfires | tragedyCommons, shiftingBurden, prodFatigue, effectFatigue, overtime, quality, reworkCycle, schedulePressure | 11, 01 |
| III Evidence | 8 Testing your model | Verify and build confidence in the waiting-list model | protByPDY, doingWorkCascade, cascadeProtByPDY, reducingBacklog | 16 |
| | 9 Data, calibration and uncertainty | Calibrate to the NTPF series; held-out years; uncertainty | (none new) | 16, 18 |
| IV Models in use | 10 From model to decision | Policy design, robustness, a one-page brief, an interactive simulator; plus a published-model replication | estRemaining, estCompletion | 12, 18 |
| | 11 Models that learn | ML forecasting contest under a policy change; hybrid curves; structure discovery; LLM-drafted diagrams | (none new) | 18 |

Appendices: A Python in a hurry; B The package and equation language; C The molecule catalogue (all 73, each credited to Hines, with its home chapter); D Glossary; E From Vensim and Stella to Python (PySD, XMILE); F Thesis and project toolkit.

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
15. Credit Hines on every molecule we use: "after Hines, Molecules of Structure", noting where ours differs.

## Rules that do not change

- Our own words throughout. Sterman and others are cited as sources, never followed as a frame, quoted at length or paraphrased closely.
- Every number in the text comes from running the code; the notebook test suite runs every chapter.
- Notebooks are committed without outputs (`npm run check` enforces it); `npm run book` renders and clears.
