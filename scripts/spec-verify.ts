// npm run spec-verify -- key1 key2 …   (no keys: every JSON file). Reads the files directly, so it needs no index.
import { readFileSync, readdirSync } from "node:fs";
import { verifySpec } from "@/lib/specVerify";
import type { Spec } from "@/lib/spec";

const dir = "python/loopbricks/spec";
const keys = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
let bad = 0;
for (const k of keys) {
  let spec: Spec;
  try {
    spec = JSON.parse(readFileSync(`${dir}/${k}.json`, "utf8"));
  } catch (err) {
    console.log(`${k}: cannot read: ${(err as Error).message}`);
    bad++;
    continue;
  }
  const errs = spec.key === k ? verifySpec(spec) : [`"key" is "${spec.key}" but the file is ${k}.json`];
  console.log(errs.length ? `${k}: ${errs.length} problem(s)\n  - ${errs.join("\n  - ")}` : `${k}: ok`);
  bad += +(errs.length > 0);
}
process.exit(bad ? 1 : 0);
