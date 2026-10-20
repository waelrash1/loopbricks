import type { StudyChapter } from "@/data/sterman/types";

const M = "−";

export const CHAPTER: StudyChapter = {
  id: "ch22",
  number: "22",
  title: "Challenges for the future",
  part: "Part VII: Commencement",
  pages: "895-902",
  summary:
    "The closing chapter is a short research agenda rather than a new method. Sterman names five areas where system dynamics must develop: theory (nonlinear dynamics, agent-based models, how people decide and learn, organisational evolution), technology (software that automates sensitivity analysis, testing, calibration and loop dominance, and links behaviour back to structure), implementation (communicating insight, group modelling, speed, integration with other methods, practice fields and honest assessment), education (systems thinking from school onwards and sustained learning inside organisations) and applications (the many fields still dominated by event-oriented, static theories). Its recurring warning is that more computer power is only useful if it produces more understanding.",
  bigIdeas: [
    {
      title: "Open questions in the theory of nonlinear dynamics",
      text: "Much is now known about local and global behaviour of nonlinear systems, but basic questions remain open. When do systems self-organise into coherent patterns in time and space? When is behaviour self-similar across scales, and what sets those scaling laws? What entrains many individual units, such as firms, into one aggregate rhythm such as a business cycle? And what generic structures produce the same dynamics in different domains? The last question is the one a molecule library like LoopBricks is built around.",
      pages: "895-896",
    },
    {
      title: "Agent-based models and the choice of aggregation",
      text: "Agent-based models represent individuals explicitly, so heterogeneity in attributes and decision rules can be included. They range from cellular automata to disaggregated system dynamics models. The open methodological questions are when to use them, how to trade the number of agents against the richness of each agent, and what rationality, interaction rules and learning to give the agents. Aggregation is a modelling choice to be justified, not a default in either direction.",
      pages: "896",
    },
    {
      title: "Mental models, decision making and learning remain poorly understood",
      text: "Experiments and fieldwork have documented the misperceptions of feedback described in chapter 1, but we still do not know which mental models people use in dynamically complex settings, how sensitive their decision rules are to the environment, or whether the misperceptions are innate or learned. The practical questions are which experiences, education, incentives, information systems and organisational structures would help people learn, and how to represent such learning inside models.",
      pages: "896",
    },
    {
      title: "Organisations may learn through evolution, or fail to",
      text: "Even if individuals learn slowly, organisations could improve as better performers grow and are copied while poor ones disappear. Modelling this needs answers to awkward questions: what the unit of selection and the 'genes' of an organisation are, how long a generation lasts, what reproductive success means, and when selection rewards dysfunctional behaviour and keeps poor performance alive.",
      pages: "896",
    },
    {
      title: "Software that explores the model for you",
      text: "Learning about a model used to proceed one simulation at a time, guided by intuition. Sterman foresaw tools that would map behaviour across parameter space at the press of a button, rank parameters and policies by influence, run user-defined extreme-condition 'reality checks' automatically, calibrate and optimise interactively, and identify which loops dominate behaviour as a run unfolds. Several of these now exist (including in this app's calibration and sensitivity labs), which makes the question of how to use them well more pressing.",
      pages: "896-897",
    },
    {
      title: "Automated help and linking behaviour to structure",
      text: "A modelling tutor could check each equation as it is typed for dimensional consistency and robustness, suggest standard formulations and plausible parameters, and propose tests. Sterman's example is a customer-defection outflow that does not depend on the customer stock and so lets customers go negative. Displays should also connect behaviour to structure, for example by colouring loops and stocks by their dominance or sensitivity as a simulation runs, and data should flow into models from live sources with inconsistencies flagged.",
      pages: "897-898",
    },
    {
      title: "More computer power must not mean bigger, less useful models",
      text: "Computing power grows exponentially, but human capacity to absorb information does not. The temptation is to use the extra power to build ever larger and more detailed models in the belief that more detail is better. The likely result is less understanding, fewer insights and less implementation. The aim of new technology should be faster learning about the dynamics, not larger models.",
      pages: "898",
    },
    {
      title: "Implementation remains an art",
      text: "Better theory and software do not by themselves get clients to act; they still need deep understanding and confidence. Open issues include communicating insight when models are complex and when the client is a whole society reached through the media, running group model building with large groups and in adversarial settings, deciding whether faster modelling is desirable at all (reflection has value), integrating system dynamics with decision analysis, market research and other methods, and building managerial practice fields. Research shows people learn poorly from games and simulators unless the setting is designed for reflection.",
      pages: "899",
    },
    {
      title: "Share failures as well as successes",
      text: "Many organisations still hide their modelling experience, from outsiders and even from their own staff, because of confidentiality, the short-run cost of documentation and follow-up, or embarrassment. Without rigorous follow-up of what worked and what did not, the field cannot learn about its own methods. Creating incentives for honest assessment is part of the agenda.",
      pages: "899-900",
    },
    {
      title: "Education for systems thinking, at school and at work",
      text: "System dynamics is now taught in primary and secondary schools, but curricula, teaching methods and ways to measure long-run impact are still young. Inside organisations the usual pattern is the quick fix: a short course, a check after a few months and a move to the next fashionable programme, which breeds cynicism. A manager's comparison with learning calculus makes the point that deep skills take years, and Forrester proposed devoting about a quarter of working time to preparing for future roles, with time for study protected from short-term pressure.",
      pages: "900-901",
    },
    {
      title: "Keep specialist rigour, add systemic breadth",
      text: "Real problems do not arrive labelled as marketing, finance or personnel problems; the categories are ours. Boundaries are necessary, but ignoring what lies outside them cuts feedback loops and breeds overconfidence about controlling nature and other people. The aim is not to replace specialised, reductionist study with vague talk about interconnection, but to combine it with rigorous methods for complexity and for working across disciplines.",
      pages: "901",
    },
    {
      title: "Applications: many fields still use event-oriented, static theories",
      text: "Despite applications from physiology to climate, many important problems are still explained with theories that are exogenous, event-oriented and static rather than endogenous, structural and dynamic. Sterman links this to continued policy resistance and to a widespread sense of helplessness. The invitation is to bring the feedback view, and simulation, to those problems.",
      pages: "901-902",
    },
  ],
  diagrams: [
    {
      kind: "cycle",
      title: "Five areas of future development",
      pages: "895-902",
      nodes: ["Theory", "Technology", "Implementation", "Education", "Applications"],
      center: "Each area raises questions for the next",
      note: "Our framing as a cycle: applications expose gaps in theory, theory guides tools, tools support implementation, implementation depends on education, and educated practitioners take the method to new applications.",
    },
    {
      kind: "sequence",
      title: "An automated testing toolkit",
      pages: "897-898",
      steps: [
        { label: "Map behaviour", detail: "Sweep parameters and initial conditions" },
        { label: "Rank sensitivities", detail: "Which parameters and policies matter most" },
        { label: "Reality checks", detail: "Extreme conditions run automatically" },
        { label: "Calibrate and optimise", detail: "Interactive fitting and policy search" },
        { label: "Find dominant loops", detail: "Which feedback drives each phase" },
        { label: "Show it on the structure", detail: "Colour loops and stocks by influence" },
      ],
      loopBack: { from: 5, to: 0, label: "new questions, new sweeps" },
      note: "Our ordering of the software capabilities Sterman anticipated. The goal throughout is understanding, not output volume.",
    },
    {
      kind: "cld",
      title: "The flavour-of-the-month trap",
      pages: "900",
      cld: {
        size: [680, 320],
        vars: [
          { id: "p", label: "Pressure for quick results", x: 340, y: 35 },
          { id: "a", label: "Programmes dropped early", x: 545, y: 135 },
          { id: "c", label: "Cynicism about new initiatives", x: 470, y: 280 },
          { id: "l", label: "Commitment to learning", x: 170, y: 280 },
          { id: "k", label: "Capability built", x: 115, y: 135 },
          { id: "t", label: "Time protected for study", x: 330, y: 200 },
        ],
        links: [
          { from: "p", to: "a", sign: "+" },
          { from: "a", to: "c", sign: "+" },
          { from: "c", to: "l", sign: M },
          { from: "l", to: "k", sign: "+" },
          { from: "k", to: "p", sign: M },
          { from: "t", to: "l", sign: "+" },
        ],
        loops: [{ type: "R", label: "R1", x: 330, y: 125 }],
        caption:
          '<span class="chip chipR">R</span> Programmes judged after a few months are dropped before they can pay off; each abandoned initiative deepens <b>cynicism</b>, weakens commitment to the next one, and leaves capability unbuilt, which keeps the pressure for quick results high. <b>Protected study time</b> is an outside lever that can turn the loop the other way.',
      },
      note: "Our sketch of the dynamic the chapter describes, which Sterman notes has been modelled formally elsewhere (Sterman and Wittenberg 1999; Keating et al. 1999).",
    },
    {
      kind: "cld",
      title: "The detail trap",
      pages: "898",
      cld: {
        size: [680, 320],
        vars: [
          { id: "s", label: "Client scepticism", x: 340, y: 35 },
          { id: "d", label: "Requests for more detail", x: 545, y: 135 },
          { id: "z", label: "Model size", x: 480, y: 280 },
          { id: "t", label: "Model transparency", x: 190, y: 280 },
          { id: "u", label: "Client understanding", x: 125, y: 135 },
          { id: "cp", label: "Computing power", x: 340, y: 200 },
        ],
        links: [
          { from: "s", to: "d", sign: "+" },
          { from: "d", to: "z", sign: "+" },
          { from: "z", to: "t", sign: M },
          { from: "t", to: "u", sign: "+" },
          { from: "u", to: "s", sign: M },
          { from: "cp", to: "z", sign: "+" },
        ],
        loops: [{ type: "R", label: "R1", x: 340, y: 120 }],
        caption:
          '<span class="chip chipR">R</span> Sceptical clients ask for more detail; bigger models are harder to inspect, so understanding falls and scepticism rises again. Cheap <b>computing power</b> removes the natural brake on model size. The way out is the one chapter 2 recommends: a broad boundary, little detail and clients who build and test the model themselves.',
      },
      note: "Our own illustration of the chapter's warning that bigger models may bring less understanding and less implementation.",
    },
  ],
  formulations: [],
  cases: [
    {
      title: "Learning calculus in a three-day course",
      text: "A manager at a US carmaker, after several years of working with system dynamics, compared it with first-year calculus: months of confusion, competence after about a year, full integration after about four. Organisations, he observed, would teach calculus as a crash course, check for results after three months, find little, and move on to the next programme. The story (from Kim and Senge 1994) captures why sustained learning is rare in organisations that judge every initiative on a short horizon.",
      pages: "900",
    },
    {
      title: "Forrester's 25 per cent rule",
      text: "In 'A New Corporate Design' (1965) Forrester proposed that about a quarter of everyone's working time should go to preparing for the role they will hold some five years ahead, covering subjects from psychology and law to industrial dynamics and policy design. Education would be part of normal corporate life rather than an occasional course elsewhere, and company policy would protect that time from short-term pressures.",
      pages: "900-901",
    },
    {
      title: "The model tutor that catches a negative stock",
      text: "Sterman's illustration of automated help: while you build a marketing model, the software notices that your outflow of customers defecting to rivals does not depend on the current customer stock, so the stock can go below zero. It proposes a first-order formulation instead and helps you choose parameters and nonlinear relationships, then suggests tests to run. The same check is exactly what the 'protected level' molecules teach.",
      pages: "897-898",
    },
  ],
  exercises: [
    {
      prompt:
        "Act as the automated tutor. Open Reducing Backlog by Doing Work, choose the Double the workers preset and run it to the end. Note what happens to Work to do and the Overdrawn stock once the backlog is gone. Then open Level Protected by Flow with the Drain to limit preset and explain in one sentence why its outflow cannot overdraw the stock.",
      hint: "The first outflow ignores the stock it drains; the second is capped at Level ÷ fastest draining time.",
      link: { label: "Reducing Backlog", hash: "/m/reducingBacklog" },
    },
    {
      prompt:
        "Run a reality check by hand. In Stock Management choose the Oscillation preset, then set demand to its minimum (2) and desired inventory to its maximum (200). Does the order rate ever go negative? Does inventory? Write down two more extreme-condition tests you would want software to run automatically for this molecule.",
      link: { label: "Stock Management", hash: "/m/stockmgmt" },
    },
    {
      prompt:
        "Try an automated sensitivity analysis. Work through the sensitivity lab's behaviour-mode experiment and record what share of runs oscillate. Then state which kind of sensitivity (numerical, behaviour mode or policy) would matter most to a manager deciding whether to count the supply line.",
      link: { label: "Sensitivity lab", hash: "/methods/sensitivity" },
    },
    {
      prompt:
        "Try interactive calibration. In the calibration lab fit by hand first, then let the optimiser search, then hold back the later data. Compare the in-sample and held-back errors for the right and the wrong structure, and explain why automated fitting does not remove the need for structural judgement.",
      link: { label: "Calibration lab", hash: "/methods/calibration" },
    },
    {
      prompt:
        "Generic structures across domains. In the family tree pick one molecule (for example Stock Management or Rework Cycle) and find two application cases from different fields that use it. Write a paragraph on what the shared structure predicts about both, which is the theory question the chapter raises about similar dynamics in different domains.",
      link: { label: "Family tree", hash: "/tree" },
    },
    {
      prompt:
        "Read the machine learning and AI methods page and sort Sterman's predicted tools (parameter maps, automated sensitivity, reality checks, calibration, loop dominance, automated tutoring, live data links) into those that exist routinely today, those that exist in research, and those still missing.",
      link: { label: "Machine learning and AI with system dynamics", hash: "/methods/ml-ai" },
    },
    {
      prompt:
        "Pen and paper: recall an initiative in your organisation that was dropped within a year. Draw it on the flavour-of-the-month loop, estimate the delay between starting the programme and its first visible benefit, and compare that delay with the time before it was judged. What would have had to be protected for the loop to run the other way?",
    },
  ],
  pitfalls: [
    "Using growing computer power to build ever bigger models, on the assumption that more detail must mean a better model.",
    "Treating automated calibration, optimisation or sensitivity tools as a substitute for judgement about boundary, aggregation and decision rules.",
    "Expecting a management flight simulator to teach by itself, without a learning environment that demands hypotheses and reflection.",
    "Judging a learning programme after a few months and moving on, which produces cynicism and guarantees that deep skills are never built.",
    "Publicising only modelling successes, so neither the organisation nor the field learns from what failed.",
    "Abandoning specialised, rigorous study in favour of vague claims that everything is connected, instead of combining the two.",
  ],
  molecules: ["stockmgmt", "reducingBacklog", "protFlow", "reworkCycle", "smooth"],
};
