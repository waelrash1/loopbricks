// A study guide to Sterman (2000) Business Dynamics. Everything is written in our own words with page
// references; figures are redrawn as our own diagrams, never copied.
import type { Model } from "@/data/molecules";

export type StudyDiagram =
  // a causal loop diagram drawn with the app's renderer; size defaults to 520×270 and may be enlarged
  | { kind: "cld"; title: string; cld: Model["cld"]; note?: string; pages?: string }
  // a closed cycle: arrows run from each node to the next and back to the first (learning loops, iterative processes)
  | { kind: "cycle"; title: string; nodes: string[]; center?: string; note?: string; pages?: string }
  // ordered steps left to right, with an optional arrow back (a process with iteration)
  | { kind: "sequence"; title: string; steps: { label: string; detail?: string }[]; loopBack?: { from: number; to: number; label: string }; note?: string; pages?: string };

export type Formulation = { name: string; equations: string[]; explain: string; molecule?: string; pages?: string };

export type StudyChapter = {
  id: string; // "ch05", "appA"
  number: string; // "5", "A"
  title: string;
  part: string;
  pages: string; // "137-190"
  summary: string;
  bigIdeas: { title: string; text: string; pages?: string }[];
  diagrams: StudyDiagram[];
  formulations: Formulation[];
  cases: { title: string; text: string; pages?: string }[];
  exercises: { prompt: string; hint?: string; link?: { label: string; hash: string } }[];
  pitfalls: string[];
  molecules: string[]; // LoopBricks molecule keys to practise with
};
