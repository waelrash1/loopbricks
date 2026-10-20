// Assembles each curriculum module from its topic notes, in teaching order, and indexes which modules
// explain each molecule. Loaded on demand with the Learn pages.
import { BOOK_TOC } from "@/data/sterman";
import type { Formulation, StudyChapter, StudyDiagram } from "@/data/sterman/types";
import { MODULES, type ModuleDef } from "@/data/learn/modules";
import { ARCHETYPES } from "@/data/learn/archetypes";
import { OBJECTIVES, QUIZ } from "@/data/learn/quiz";

export type ModuleContent = {
  def: ModuleDef;
  bigIdeas: StudyChapter["bigIdeas"];
  diagrams: StudyDiagram[];
  formulations: Formulation[];
  examples: StudyChapter["cases"];
  exercises: StudyChapter["exercises"];
  pitfalls: string[];
  molecules: string[];
  objectives: string[];
  quiz: (typeof QUIZ)[string];
  minutes: number;
};

const notes = (id: string) => BOOK_TOC.find((c) => c.id === id)?.chapter ?? null;
const words = (s: string) => s.split(/\s+/).length;

export function moduleContent(def: ModuleDef): ModuleContent {
  const src = def.from.map(notes).filter((c): c is StudyChapter => !!c);
  const uniq = <T,>(xs: T[], key: (x: T) => string) => xs.filter((x, i) => xs.findIndex((y) => key(y) === key(x)) === i);
  const c: ModuleContent = {
    def,
    bigIdeas: uniq(src.flatMap((s) => s.bigIdeas), (b) => b.title),
    diagrams: uniq(src.flatMap((s) => s.diagrams), (d) => d.title),
    formulations: uniq(src.flatMap((s) => s.formulations), (f) => f.name),
    examples: uniq(src.flatMap((s) => s.cases), (x) => x.title),
    exercises: uniq(src.flatMap((s) => s.exercises), (x) => x.prompt),
    pitfalls: uniq(src.flatMap((s) => s.pitfalls), (x) => x),
    molecules: [...new Set([...src.flatMap((s) => s.molecules), ...(def.id === "archetypes" ? ARCHETYPES.flatMap((a) => a.molecules) : [])])],
    objectives: OBJECTIVES[def.id] ?? [],
    quiz: QUIZ[def.id] ?? [],
    minutes: 0,
  };
  // reading at about 200 words a minute, plus a few minutes for each exercise and diagram
  const text = [...c.bigIdeas.map((b) => b.text), ...c.examples.map((x) => x.text), ...c.formulations.map((f) => f.explain)].join(" ");
  const arch = def.id === "archetypes" ? ARCHETYPES.reduce((n, a) => n + words(a.story + a.trap + a.leverage), 0) : 0;
  c.minutes = Math.max(15, Math.round((words(text) + arch) / 200 + c.exercises.length * 4 + (c.diagrams.length + (def.id === "archetypes" ? ARCHETYPES.length : 0)) * 2));
  return c;
}

export const MODULE_CONTENT: ModuleContent[] = MODULES.map(moduleContent);

// molecule key → the modules that use it, with any formulation that explains the molecule directly
export const LEARN_BY_MOLECULE: Record<string, { module: ModuleDef; formulations: Formulation[] }[]> = {};
for (const m of MODULE_CONTENT)
  for (const k of m.molecules) (LEARN_BY_MOLECULE[k] ??= []).push({ module: m.def, formulations: m.formulations.filter((f) => f.molecule === k) });
for (const a of ARCHETYPES)
  for (const k of a.molecules) {
    const list = (LEARN_BY_MOLECULE[k] ??= []);
    if (!list.some((x) => x.module.id === "archetypes")) list.push({ module: MODULES.find((m) => m.id === "archetypes")!, formulations: [] });
  }

export const archetypesFor = (molecule: string) => ARCHETYPES.filter((a) => a.molecules.includes(molecule));
export { MODULES, ARCHETYPES };
