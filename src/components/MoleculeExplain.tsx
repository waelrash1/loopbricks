import { useEffect, useMemo, useState } from "react";
import type { Model } from "@/data/molecules";
import type { Lesson } from "@/data/lessons";
import type { ModuleDef } from "@/data/learn/modules";
import { MODELS } from "@/data/molecules";
import { childrenOf, parentsOf } from "@/data/catalog";

const FEW = 4;
type CaseRef = { domain: { id: string; short: string }; c: { id: string; title: string } };

// The Explain tab of a molecule page: the write-up, a "Try this" experiment, and where else the molecule appears.
// The "Try this" card is the molecule's own suggestion when its write-up has one; otherwise its predict-then-run
// checkpoint from the tour. "Where it appears" lists only what the course, the cases and the family tree record.
export default function MoleculeExplain({
  modelKey,
  model,
  lesson,
  cases,
  onTry,
}: {
  modelKey: string;
  model: Model;
  lesson?: Lesson;
  cases: CaseRef[];
  onTry: (preset?: Record<string, number>) => void;
}) {
  // the write-up's own "Try this" section becomes a card, in place
  const html = useMemo(() => model.desc.replace(/<h3>Try this<\/h3>\s*([\s\S]*?)(?=<h3|<div class="(?:worked|whenbox)"|$)/, '<div class="trybox"><h3>Try this</h3>$1</div>'), [model.desc]);
  const ownTry = html !== model.desc;
  // a checkpoint card goes before the references, so the reading ends with the sources
  const cut = html.search(/<h3>References<\/h3>/);
  const [body, refs] = cut < 0 ? [html, ""] : [html.slice(0, cut), html.slice(cut)];

  // the course modules that teach this molecule; that index is large, so it loads with this tab's page
  const [modules, setModules] = useState<ModuleDef[] | null>(null);
  useEffect(() => {
    let live = true;
    setModules(null);
    import("@/data/learn").then(({ LEARN_BY_MOLECULE }) => {
      if (!live) return;
      // modules that explain the molecule with an equation first, as in "In the course"
      const all = [...(LEARN_BY_MOLECULE[modelKey] ?? [])].sort((x, y) => y.formulations.length - x.formulations.length);
      setModules(all.map((e) => e.module));
    });
    return () => {
      live = false;
    };
  }, [modelKey]);

  const parents = parentsOf(modelKey);
  const children = childrenOf(modelKey);
  const groups: [string, { href: string; label: string; sub?: string }[]][] = [
    ["In the course", (modules ?? []).slice(0, 3).map((m) => ({ href: `#/learn/${m.id}`, label: m.title, sub: m.level }))],
    ["In cases", cases.map(({ domain, c }) => ({ href: `#/apps/${domain.id}/${c.id}`, label: c.title, sub: domain.short }))],
    ["Built from", parents.map((k) => ({ href: `#/m/${k}`, label: MODELS[k].name }))],
    ["Used in", children.map((k) => ({ href: `#/m/${k}`, label: MODELS[k].name }))],
  ];
  const shown = groups.filter(([, items]) => items.length > 0);
  const moreModules = (modules?.length ?? 0) - 3;

  const proseCls = "prose-sd [&_.trybox]:rounded-[var(--radius)] [&_.trybox]:border [&_.trybox]:border-border [&_.trybox]:border-t-4 [&_.trybox]:border-t-accent [&_.trybox]:bg-card [&_.trybox]:px-[18px] [&_.trybox]:py-[14px] [&_.trybox]:my-[18px] [&_.trybox_h3]:mt-0 [&_.trybox_h3]:mb-1 [&_.trybox_h3]:text-[17px] [&_.trybox_p:last-child]:mb-0";
  const link = (it: { href: string; label: string; sub?: string }) => (
    <li key={it.href}>
      <a href={it.href} className="group flex flex-col justify-center min-h-11 py-1 text-[14.5px] leading-[1.35]">
        <span className="font-semibold underline decoration-border underline-offset-[3px] group-hover:decoration-foreground">{it.label}</span>
        {it.sub && <span className="text-[12.5px] text-muted-foreground">{it.sub}</span>}
      </a>
    </li>
  );
  const card = "rounded-[var(--radius)] border border-border bg-card px-[18px] py-[14px]";
  return (
    <div className="flex flex-wrap gap-x-10 gap-y-8 items-start">
      <div className="flex-[999_1_520px] min-w-0 max-w-[68ch]">
        <div className={proseCls} dangerouslySetInnerHTML={{ __html: body }} />
        {!ownTry && lesson && (
          <section aria-labelledby="try-this" className={`${card} border-t-4 border-t-accent mt-6`}>
            <h3 id="try-this" className="heading text-[17px]">
              Try this
            </h3>
            <p className="mt-1 text-[15.5px] leading-[1.6]">
              Predict first: {lesson.q}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <button type="button" onClick={() => onTry(lesson.preset)} className="brick brick-w inline-flex items-center h-11 sm:h-9 px-3.5 text-[13.5px] font-semibold">
                {lesson.preset ? "Set it up and run" : "Run it"}
              </button>
              <details className="text-[14.5px]">
                <summary className="tlink font-semibold cursor-pointer min-h-11 sm:min-h-0 inline-flex items-center">Check your prediction</summary>
                <p className="mt-2 leading-[1.6]">
                  <b>Answer: {lesson.options[lesson.answer]}.</b> {lesson.explain}
                </p>
              </details>
            </div>
          </section>
        )}
        {refs && <div className={`${proseCls} mt-8`} dangerouslySetInnerHTML={{ __html: refs }} />}
      </div>

      {shown.length > 0 && (
        <aside aria-labelledby="where-it-appears" className="flex-[1_1_240px] min-w-0 lg:max-w-[340px]">
          <h3 id="where-it-appears" className="heading text-[17px]">
            Where it appears
          </h3>
          <dl className="mt-3 grid gap-4">
            {shown.map(([label, items]) => (
              <div key={label}>
                <dt className="text-[12.5px] font-semibold text-muted-foreground">{label}</dt>
                <dd>
                  <ul className="mt-1 grid">
                    {items.slice(0, FEW).map(link)}
                    {items.length > FEW && (
                      <li>
                        <details>
                          <summary className="tlink cursor-pointer min-h-11 inline-flex items-center text-[13px] font-semibold">
                            {items.length - FEW} more {label === "In cases" ? "cases" : "molecules"}
                          </summary>
                          <ul className="grid">{items.slice(FEW).map(link)}</ul>
                        </details>
                      </li>
                    )}
                    {label === "In the course" && moreModules > 0 && (
                      <li className="text-[12.5px] text-muted-foreground py-1">
                        and {moreModules} more under In the course
                      </li>
                    )}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      )}
    </div>
  );
}
