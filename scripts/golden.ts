// Reference trajectories for the Python package's tests: every shared spec, at its defaults and each preset,
// sampled every 1 time unit. `npm run golden` rewrites python/tests/golden.json; `npm run check` fails if it is stale.
import { writeFileSync } from "node:fs";
import { goldenData } from "@/lib/golden";

writeFileSync("python/tests/golden.json", JSON.stringify(goldenData(), null, 1) + "\n");
console.log("wrote python/tests/golden.json");
