import { useMemo } from "react";
import { Check, X } from "lucide-react";
import type { AppCase, Domain, Run } from "@/data/apps/types";
import { runModel } from "@/data/apps/sim";
import type { Vars } from "@/sim/engine";
import { cn } from "@/lib/utils";

// The case's behaviour checks, run against the settings of the latest run rather than only the defaults.
// A claim names its own scenario ("with no new policy", "20% more beds"), so the scenario levers (any
// parameter a preset sets) start from the defaults and the test sets them; every other setting, such as
// demand growth or capacity, comes from the learner's run.
// the settings a check takes from the run: everything except the scenario levers
const contextOf = (c: AppCase, v: Vars) => {
  const levers = new Set((c.presets ?? []).flatMap((p) => Object.keys(p.params)));
  return Object.fromEntries(Object.entries(v).filter(([k]) => !levers.has(k)));
};

export function liveChecks(domain: Domain, c: AppCase, base: Vars) {
  if (!c.sim || !c.checks) return [];
  const model = domain.models[c.sim];
  const context = contextOf(c, base);
  const run: Run = (params = {}, T) => runModel(model, { ...context, ...params }, T ?? domain.stop[c.sim!]);
  return c.checks.map((k) => {
    try {
      return { claim: k.claim, ok: k.test(run) };
    } catch {
      return { claim: k.claim, ok: false };
    }
  });
}

const same = (a: Vars, b: Vars) => Object.keys({ ...a, ...b }).every((k) => a[k] === b[k]);

export default function CaseChecks({ domain, c, checked, current }: { domain: Domain; c: AppCase; checked: Vars; current: Vars }) {
  const results = useMemo(() => liveChecks(domain, c, checked), [domain, c, checked]);
  if (!results.length) return null;
  const passed = results.filter((r) => r.ok).length;
  const stale = !same(contextOf(c, checked), contextOf(c, current));
  return (
    <section aria-labelledby="case-checks" className="mt-8 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] gap-x-12 gap-y-4 break-inside-avoid">
      <div className="grid gap-2 content-start">
        <h2 id="case-checks" className="heading text-[22px] md:text-[24px]">
          Does it behave like the paper?
        </h2>
        <p className="text-[15px] leading-[1.55] text-muted-foreground">Each run is checked against what the study reports. Change the settings, run again, and the checks update. A check that names a scenario sets that scenario itself.</p>
        <p role="status" className="text-[14px] font-semibold">
          {passed} of {results.length} checks pass with {stale ? "the settings of your last run" : "these settings"}.
          {stale && <span className="block font-normal text-muted-foreground print:hidden">Settings changed since then: press Run to check them.</span>}
        </p>
      </div>
      <ul className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))] content-start">
        {results.map((r) => (
          <li
            key={r.claim}
            className={cn("flex gap-2.5 items-start rounded-btn border bg-card px-3.5 py-3 text-[15px] leading-[1.5]", r.ok ? "border-border" : "border-[var(--viz-pink)]")}
          >
            <span aria-hidden className={cn("grid place-items-center w-[22px] h-[22px] rounded-[6px] shrink-0 mt-0.5 text-card", r.ok ? "bg-[var(--viz-good)]" : "bg-[var(--viz-pink)]")}>
              {r.ok ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
            </span>
            <span>
              <strong className="font-semibold">{r.ok ? "Passes." : "Fails with these settings."}</strong> {r.claim.replace(/\.$/, "")}.
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
