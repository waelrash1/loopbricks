// The shape every application domain fills in. A domain is a library of cases; a case pairs a real-world
// question with a runnable model, the published evidence, how that evidence was validated, and
// behaviour checks that prove the small model shows the lesson the case claims.
import type { Model } from "@/data/molecules";
import type { Preset } from "@/data/presets";
import type { Vars } from "@/sim/engine";

export type Level = "Starter" | "Intermediate" | "Advanced";
export type Ref = { text: string; doi?: string; pmid?: string; url?: string };
export type DataSource = { name: string; url: string; what: string; scope: string };
export type Practice = { step: string; detail: string; refs: string[] };

// One simulation run: final values, peaks and troughs per stock, and when each peak happened.
export type RunResult = { end: Vars; max: Vars; min: Vars; tMax: Vars };
// params are applied on top of the model's defaults; T defaults to the domain's stop time for that model
export type Run = (params?: Record<string, number>, T?: number) => RunResult;
export type Check = { claim: string; test: (run: Run) => boolean };

export type AppCase = {
  id: string;
  title: string;
  theme: string;
  level: Level;
  summary: string;
  question: string; // the decision a model informs
  sim?: string; // key in the domain's models; absent when no small model does the case justice
  presets?: Preset[];
  map: [string, string][]; // model element → what it is in the real system
  molecules: string[]; // catalogue molecules the structure is built from
  evidence: string[]; // what published models found, with numbers where the source gives them
  validation: string; // how the published work validated its model (or that the abstract reports none)
  insight: string; // the dynamic lesson
  tryThis: string[];
  data: [string, string][]; // what you need → where it usually comes from
  practice: string[]; // case-specific modelling advice and pitfalls
  refs: string[]; // keys into the domain's refs
  tags: string[];
  checks?: Check[]; // behaviour tests on the simulator; required when sim is set
};

export type Domain = {
  id: string; // used in the URL: #/apps/<id>
  name: string;
  short: string; // tab-sized name
  blurb: string;
  themes: readonly string[];
  cases: AppCase[];
  refs: Record<string, Ref>;
  models: Record<string, Model>;
  stop: Record<string, number>; // per model: where a run stops so the interesting part fills the chart
  dataSources: DataSource[];
  practice?: Practice[]; // domain-specific modelling guidance
};
