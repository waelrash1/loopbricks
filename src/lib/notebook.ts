// Python notebooks that go with the app: where they live, how to open them in Colab, and how to turn a model from
// the builder into a notebook. The module notebooks run the `loopbricks` Python package on the same model files as the app.
import type { BModel } from "@/lib/builder";
import { notebook } from "@/lib/exports";

const REPO = "waelrash1/loopbricks", BRANCH = "main";
export const INSTALL = `loopbricks @ git+https://github.com/${REPO}.git@${BRANCH}#subdirectory=python`;
export const colabUrl = (file: string) => `https://colab.research.google.com/github/${REPO}/blob/${BRANCH}/notebooks/${file}`;
export const rawUrl = (file: string) => `https://raw.githubusercontent.com/${REPO}/${BRANCH}/notebooks/${file}`;

// One notebook per Learn module, numbered in curriculum order; each is also a chapter of the Quarto book (notebooks/_quarto.yml).
const NB: [string, string, string][] = [
  ["01", "surprise", "prodFatigue lowVisPipeline smooth"],
  ["02", "stocks-flows", "bathtub closegap stockmgmt"],
  ["03", "loops", "growth closegap schedulePressure"],
  ["04", "patterns", "growth closegap lowVisPipeline decay logistic diffusion bathtub"],
  ["05", "first-order", "growth goToZero residence stockAdjust logistic"],
  ["06", "delays", "residence decay cascade material smooth"],
  ["07", "s-shaped", "logistic growth diffusion"],
  ["08", "lock-in", "growth split marketshare"],
  ["09", "chains", "aging agingPDY coflow coflowExperience"],
  ["10", "oscillation", "stockAdjust stockmgmt lowVisPipeline"],
  ["11", "archetypes", "logistic shiftingBurden tragedyCommons seaAnchor protectedSeaAnchor"],
  ["12", "process", "reworkCycle logistic prodFatigue"],
  ["13", "formulation", "protFlow stockAdjust effectFunction schedulePressure"],
  ["14", "behaviour", "smooth trend extrapolation univariateAnchor"],
  ["15", "cycles", "workforce desiredWorkforce lowVisPipeline overtime smoothPricing seaAnchorPricing"],
  ["16", "testing", "reducingBacklog protFlow backlogLevel closegap stockmgmt diffusion"],
  ["17", "mechanics", "decay growth closegap stockmgmt"],
  ["18", "frontier", "reworkCycle reducingBacklog doingWork protFlow backlogLevel stockmgmt"],
];
export const NOTEBOOKS = NB.map(([n, module, mol]) => ({ file: `${n}-${module}.ipynb`, module, molecules: mol.split(" ") }));
export const notebooksFor = (key: string) => NOTEBOOKS.filter((n) => n.molecules.includes(key));
export const notebookForModule = (module: string) => NOTEBOOKS.find((n) => n.module === module);

// The notebook the builder exports: plain numpy and pandas, explained cell by cell (see exports.ts).
export const notebookFor = (m: BModel): string => notebook(m);
