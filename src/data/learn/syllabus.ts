// A 12-week university course built on the 18 LoopBricks modules, taught in an order that respects their prerequisites.
import type { Week } from "@/data/learn/types";

export const SYLLABUS: Week[] = [
  {
    week: 1,
    modules: ["surprise"],
    activity: "Students take the before-and-after test at /learn/check, then play the beer game at /learn/games cold. The debrief collects their explanations of what went wrong, which we revisit in week 8.",
  },
  {
    week: 2,
    modules: ["stocks-flows"],
    activity: "Bathtub drills with the bathtub molecule, sketching stocks from given flows before running them. Small groups then explain the carbon dioxide bathtub case to each other.",
  },
  {
    week: 3,
    modules: ["loops"],
    activity: "Loop-drawing exercises: students draw causal loop diagrams for two short stories, label link and loop polarity, and swap them for peer review. We close with the policy resistance case. Seminar: Richardson (1986) on problems with causal loop diagrams. For homework, students complete one practice brief in the modelling studio at /learn/studio up to the causal loop diagram.",
  },
  {
    week: 4,
    modules: ["patterns", "archetypes"],
    activity: "Play the fishery game at /learn/games and match the fleet's behaviour to a reference mode and an archetype. A short in-class quiz matches six behaviour graphs described in words to their structures.",
  },
  {
    week: 5,
    modules: ["first-order", "mechanics"],
    activity: "In the model builder at /learn/build, students build growth and decay models and check doubling times and half-lives against the exact solutions. They then halve the time step to see integration error shrink.",
  },
  {
    week: 6,
    modules: ["s-shaped", "lock-in"],
    activity: "Lab assignment on the epidemic and new product diffusion cases: find the tipping point and explain the shift in loop dominance. A short in-class discussion of the competing standards case follows.",
  },
  {
    week: 7,
    modules: ["delays", "chains"],
    activity: "Compare first-order and higher-order delays in the smoothing and material delay molecules, then use the workforce planning case to test a training intake policy. Lab assignment due.",
  },
  {
    week: 8,
    modules: ["oscillation"],
    activity: "Replay the beer game at /learn/games with the supply line made visible, and compare the results with week 1. Students write a one-page reflection on the bullwhip effect using the stock management molecule.",
  },
  {
    week: 9,
    modules: ["process"],
    activity: "Studio workshop: in pairs, students work a second practice brief from brief to stock and flow map and compare their boundary charts. Seminar: the Coyle (2000) and Homer and Oliva (2001) exchange on qualitative and quantitative modelling. Capstone kickoff at /learn/projects: teams choose a project, draw the reference mode and write a model boundary chart. Proposals are due at the end of the week.",
  },
  {
    week: 10,
    modules: ["formulation", "behaviour"],
    activity: "Play the firefighting game at /learn/games and discuss the decision rules players used. Teams then build the first version of their capstone model in /learn/build, with table functions that pass extreme-conditions checks.",
  },
  {
    week: 11,
    modules: ["cycles", "testing"],
    activity: "Teams run their capstone models through the validation, calibration and sensitivity labs and report which tests they passed. A short discussion of the hog cycle case shows how fit and structure tests differ.",
  },
  {
    week: 12,
    modules: ["frontier"],
    activity: "Capstone presentations with peer questions on boundary, tests and policy sensitivity. Students retake the test at /learn/check and compare their before and after scores.",
  },
];

export const ASSESSMENT: { item: string; weight: number; detail: string }[] = [
  { item: "Before-and-after test", weight: 5, detail: "Completing both sittings of the test at /learn/check earns the marks; the score itself is not graded." },
  { item: "Diagram exercises and practice briefs", weight: 15, detail: "Loop-drawing and stock and flow exercises from weeks 2 and 3, and two modelling studio practice briefs written up from brief to stock and flow map, marked for a clear purpose, a defensible boundary, correct polarities and units." },
  { item: "Decision game reflections", weight: 15, detail: "Short written debriefs after the beer, fishery and firefighting games, explaining the outcome through feedback structure." },
  { item: "Modelling labs", weight: 25, detail: "Two lab assignments in the model builder and case simulators, from first-order dynamics to delays and diffusion." },
  { item: "Capstone project", weight: 40, detail: "A team project from /learn/projects: proposal (10), model with documented tests (15), and final presentation and report (15)." },
];
