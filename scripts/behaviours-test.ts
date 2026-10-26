// Checks the Library's behaviour classifier (src/data/behaviours.ts) on textbook curves and on molecules
// whose default run was checked by hand. Run:
// npx esbuild scripts/behaviours-test.ts --bundle --platform=node --alias:@=./src --log-level=error | node
import { classify, behaviourRuns, type Behaviour } from "@/data/behaviours";

const errs: string[] = [];
const ts = Array.from({ length: 601 }, (_, i) => i / 10);
const curves: [string, number[], boolean, Behaviour | null][] = [
  ["exponential growth", ts.map((t) => 100 * Math.exp(0.03 * t)), true, "growth"],
  ["exponential decay", ts.map((t) => 100 * Math.exp(-0.3 * t)), false, "decay"],
  ["first-order approach", ts.map((t) => 60 - 40 * Math.exp(-0.2 * t)), false, "goal"],
  ["logistic", ts.map((t) => 200 / (1 + 19 * Math.exp(-0.25 * t))), true, "sshape"],
  ["third-order delay", ts.map((t) => 70 - 40 * Math.exp(-0.3 * t) * (1 + 0.3 * t + (0.3 * t) ** 2 / 2)), false, "delay"],
  ["damped oscillation", ts.map((t) => 50 + 30 * Math.exp(-0.05 * t) * Math.sin(0.5 * t)), false, "oscillation"],
  ["flat", ts.map(() => 42), false, null],
  ["straight line", ts.map((t) => 50 + t), false, null],
  ["hump", ts.map((t) => t * Math.exp(-0.2 * t)), false, null],
];
for (const [name, y, hasR, want] of curves) {
  const got = classify(y, hasR);
  if (got !== want) errs.push(`${name}: expected ${want}, got ${got}`);
}

const runs = behaviourRuns();
const molecules: [string, Behaviour[]][] = [
  ["decay", ["decay"]],
  ["closegap", ["goal"]],
  ["growth", ["growth"]],
  ["logistic", ["sshape"]],
  ["diffusion", ["sshape"]],
  ["smooth", ["goal", "delay"]],
  ["tragedyCommons", ["oscillation"]],
  ["bathtub", []],
];
for (const [k, want] of molecules) {
  const got = runs[k].tags;
  if (got.join() !== want.join()) errs.push(`${k}: expected [${want}], got [${got}]`);
}

if (errs.length) {
  console.error(errs.join("\n"));
  process.exit(1);
}
console.log(`behaviours: ${curves.length} curves and ${molecules.length} molecules classified as expected`);
