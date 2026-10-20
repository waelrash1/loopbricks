// A study guide to Sterman (2000) Business Dynamics. Everything is written in our own words with page
// references; figures are redrawn as our own diagrams, never copied.
import type { Model } from "@/data/molecules";

export type StudyDiagram =
  // a causal loop diagram drawn with the app's renderer; size defaults to 520×270 and may be enlarged
  | { kind: "cld"; title: string; cld: Model["cld"]; note?: string; pages?: string }
  // a closed cycle: arrows run from each node to the next and back to the first (learning loops, iterative processes)
  | { kind: "cycle"; title: string; nodes: string[]; center?: string; note?: string; pages?: string }
  // ordered steps left to right, with an optional arrow back (a process with iteration)
  | SfDiagram
  | { kind: "sequence"; title: string; steps: { label: string; detail?: string }[]; loopBack?: { from: number; to: number; label: string }; note?: string; pages?: string };

// A stock-and-flow diagram in standard notation: stocks are boxes, flows are pipes with valves that start or end in a
// cloud when they cross the boundary, and information links are thin arrows. Coordinates are centres on a W×H canvas.
export type SfDiagram = {
  kind: "sf";
  title: string;
  size?: [number, number]; // default 640×300
  stocks: { id: string; label: string; x: number; y: number; w?: number; h?: number }[]; // default box 120×64
  // a flow runs along pts (first point to last); omit from/to for a cloud at that end. Label sits by the valve.
  flows: { id: string; label: string; pts: [number, number][]; from?: string; to?: string; labelBelow?: boolean }[];
  aux?: { id: string; label: string; x: number; y: number; labelAt?: "above" | "left" | "right" }[]; // auxiliaries and constants: a small circle and a name (below it unless labelAt says otherwise)
  // information links: from a stock, aux or flow (its valve) to a flow (its valve) or an aux; curve bends the arc in px
  links?: { from: string; to: string; curve?: number; sign?: "+" | "−" }[];
  loops?: { type: "B" | "R"; label: string; x: number; y: number }[];
  caption?: string; // HTML, like CLD captions
  note?: string;
  pages?: string;
};

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
