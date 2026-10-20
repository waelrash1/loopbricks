// The LoopBricks curriculum: our own sequence of modules for learning system dynamics.
// Content draws on several sources, cited where used; it does not follow any one book's structure.
import type { Model } from "@/data/molecules";

export type Level = "Foundations" | "Core dynamics" | "Modelling practice" | "Advanced";

export type Quiz = { q: string; options: string[]; answer: number; why: string };

// a classic system archetype: a recurring feedback structure with a recognisable story
export type Archetype = {
  id: string;
  name: string;
  story: string; // the pattern in plain words, with an everyday example
  behaviour: string; // what you see over time
  cld: Model["cld"]; // our own drawing of the structure
  trap: string; // why it catches people
  leverage: string; // where to intervene
  molecules: string[]; // molecule keys that run part or all of the structure
  cases: { label: string; hash: string }[]; // app routes where it appears
  sources: string[]; // short citations, for example "Senge 1990"; "Sterman 2000, pp. 10-12"
};

// A module is taught as an ordered series of steps. Each step joins one thought: the idea(s) on the left,
// and beside them the diagram, the equation and a live run that show the same thing.
// Items are referenced by their exact title (ideas, diagrams, examples), name (formulations) or index (exercises).
export type Step = {
  title: string; // a short heading for the step, in our own words
  lead?: string; // one or two sentences that link this step to the previous one
  ideas: string[];
  diagram?: string;
  formulation?: string;
  archetype?: string; // archetype id, for the archetypes module
  run?: { molecule: string; T: number; params?: Record<string, number>; look: string }; // look: what to notice in the run
  example?: string;
  exercises?: number[];
};

// A guided project from problem to policy, built on the app's molecules and cases.
export type Project = {
  id: string;
  field: string; // "Health", "Business", "Environment"
  title: string;
  problem: string; // the situation and the question the client asks
  stages: { title: string; task: string; deliverable: string; tools: { label: string; hash: string }[]; check: string[] }[];
  sources: string[];
};

export type GlossaryTerm = { term: string; def: string; see?: { label: string; hash: string }[] };

// A question in the before-and-after test; skill names the misconception it probes.
export type DiagQuestion = { skill: string; q: string; options: string[]; answer: number; why: string };

export type Week = { week: number; modules: string[]; activity: string };
