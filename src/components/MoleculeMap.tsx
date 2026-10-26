import { useEffect, useState } from "react";
import { Check, ExternalLink, Pause, Play, Search } from "lucide-react";
import { useSeen } from "@/lib/progress";
import { GROUPS, MODELS } from "@/data/molecules";
import { GROUP_BLURB, search } from "@/data/catalog";
import { PRESETS } from "@/data/presets";
import { useSimulation } from "@/hooks/useSimulation";
import { ShapeIcon, Sparkline } from "@/components/LibraryShapes";
import { BEHAVIOURS, BEHAVIOUR_LABEL, RUN_LENGTH, behaviourRuns, type Behaviour, type BehaviourRun } from "@/data/behaviours";
import StockFlowDiagram from "@/components/StockFlowDiagram";
import TimeSeriesChart from "@/components/TimeSeriesChart";

const DEMO = "stockmgmt";
const DEMO_LENGTH = 60; // weeks: long enough to see the overshoot ring down
// Other apps by the same author, shown under the catalogue.
// ponytail: swap the url for the Vercel address once FAIRE is published
const DEMOS = [
  {
    name: "FAIRE: Ireland supply chain watch",
    blurb: "Maps what Ireland imports and exports, from whom, and how concentrated and exposed each supply chain is.",
    url: "http://localhost:5199/",
  },
].filter((d) => !d.url.includes("localhost") || location.hostname === "localhost"); // a localhost link would be dead on the live site
const slug = (title: string) => "fam-" + title.toLowerCase().replace(/[^a-z]+/g, "-");

// The hero is the product: a real molecule, running. Stock management with the supply line ignored
// overshoots and oscillates, which is the most recognisable behaviour in the whole catalogue.
export function LiveDemo() {
  const model = MODELS[DEMO];
  const sim = useSimulation(model);
  const { applyParams, play, reset, setSpeed, setStopTime, subscribe } = sim;
  useEffect(() => {
    applyParams(PRESETS[DEMO][1].params);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // no looping animation: draw the whole run at once and hold it
      setSpeed(20);
      setStopTime(DEMO_LENGTH);
      play();
      return;
    }
    setSpeed(1);
    play();
    const off = subscribe(({ t }) => {
      if (t < DEMO_LENGTH) return;
      reset();
      play();
    });
    return () => void off();
  }, [applyParams, play, reset, setSpeed, setStopTime, subscribe]);

  return (
    <figure className="sheet min-w-0 relative">
      {/* anything that moves on its own for more than five seconds needs a way to stop it */}
      <button onClick={sim.toggle} aria-label={sim.running ? "Pause the animation" : "Play the animation"} className="brick brick-w absolute right-3 top-3 z-10 grid place-items-center w-11 h-11 sm:w-9 sm:h-9">
        {sim.running ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
      </button>
      <StockFlowDiagram model={model} modelKey={DEMO} subscribe={subscribe} running={sim.running} showInfluences={false} />
      <div className="mt-2 border-t border-border pt-3">
        <TimeSeriesChart model={model} subscribe={subscribe} height={150} minimal />
      </div>
      <figcaption className="mt-3 text-[13px] leading-[1.5] text-muted-foreground">
        Running now:{" "}
        <a href={`#/m/${DEMO}`} className="tlink font-semibold text-foreground">
          Stock Management
        </a>{" "}
        with the supply line ignored. Orders already on the way get ordered again, so inventory overshoots.
      </figcaption>
    </figure>
  );
}

// Which feedback a molecule contains, one tag per loop in the same letters and colours the diagrams use,
// and how big it is.
function LoopTags({ k }: { k: string }) {
  const m = MODELS[k];
  const loops = m.cld.loops;
  const stocks = m.stocks.filter((x) => !x.derived).length;
  const shown = loops.slice(0, 4);
  return (
    <span className="flex flex-wrap items-center gap-y-1 text-[12.5px] text-muted-foreground">
      {shown.map((l, i) => (
        <span key={i} className={`chip ${l.type === "B" ? "chipB" : "chipR"}`} title={l.type === "B" ? "balancing loop" : "reinforcing loop"}>
          {l.type}
        </span>
      ))}
      <span className={shown.length ? "ml-1" : ""}>
        {stocks} {stocks === 1 ? "stock" : "stocks"}, {loops.length ? `${loops.length} ${loops.length === 1 ? "loop" : "loops"}` : "no feedback loop"}
      </span>
    </span>
  );
}

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// The library: every molecule by family, filtered by name and by the behaviour its default run shows,
// with a switch to the family tree.
export default function MoleculeMap({ onTree, missing }: { onTree: () => void; missing?: string }) {
  const total = Object.keys(MODELS).length;
  const seen = useSeen();
  const [q, setQ] = useState("");
  const [shape, setShape] = useState<Behaviour | null>(null);
  // every molecule's default run, worked out once the page has painted (a few milliseconds, memoised)
  const [runs, setRuns] = useState<Record<string, BehaviourRun> | null>(null);
  useEffect(() => {
    const ric = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 1));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = ric(() => setRuns(behaviourRuns()));
    return () => cancel(id);
  }, []);
  const hits = q.trim() ? new Set(search(q).map((r) => r.key)) : null;
  const fits = (k: string) => (!hits || hits.has(k)) && (!shape || !runs || runs[k].tags.includes(shape));
  const groups = GROUPS.map((g) => ({ ...g, keys: g.keys.filter(fits) })).filter((g) => g.keys.length);
  const counts = runs ? Object.fromEntries(BEHAVIOURS.map((b) => [b, Object.values(runs).filter((r) => r.tags.includes(b)).length])) : null;

  // the family in view, for the left list
  const [current, setCurrent] = useState<string>(GROUPS[0].title);
  const groupKey = groups.map((g) => g.title).join("|");
  useEffect(() => {
    const els = groupKey.split("|").map((t) => document.getElementById(slug(t))).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setCurrent(top.target.getAttribute("data-family") ?? "");
      },
      { rootMargin: "-96px 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [groupKey]);
  // hash routing owns the URL, so family links scroll instead of using #anchors
  const jump = (title: string) => {
    setCurrent(title);
    const el = document.getElementById(slug(title));
    el?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
    el?.querySelector("h2")?.focus({ preventScroll: true });
  };
  const label = (b: Behaviour) => BEHAVIOUR_LABEL[b].toLowerCase();
  const familyLink = (g: { title: string; keys: string[] }, row: boolean) => {
    const on = g.title === current;
    return (
      <button
        key={g.title}
        type="button"
        onClick={() => jump(g.title)}
        aria-current={on ? "true" : undefined}
        className={
          row
            ? `brick brick-w shrink-0 h-11 px-3 text-[13px] font-semibold whitespace-nowrap ${on ? "!border-foreground" : ""}`
            : `flex w-full items-baseline justify-between gap-2 rounded-btn px-2.5 py-[7px] text-left text-[14px] ${on ? "bg-muted font-semibold text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`
        }
      >
        <span>{g.title}</span> <span className={`${row ? "ml-1" : ""} text-muted-foreground font-normal tabular-nums`}>{g.keys.length}</span>
      </button>
    );
  };

  return (
    <div className="page pt-8 md:pt-12">
      {missing && (
        <p role="alert" className="sheet mb-6 text-[15px]">
          There is no molecule called &ldquo;{missing}&rdquo;. Pick one below, or filter by name.
        </p>
      )}
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="max-w-[70ch]">
          <h1 className="display text-[30px] sm:text-[34px] xl:text-[38px]">Library</h1>
          <p className="mt-2.5 text-[16px] sm:text-[17px] leading-[1.55] text-muted-foreground">
            {total} molecules in {GROUPS.length} families, from a single stock to whole projects. Pick one by the behaviour you need to explain, or browse by family.
          </p>
        </div>
        <div role="tablist" aria-label="View" className="inline-flex rounded-btn bg-muted p-1 text-[14px] font-semibold">
          <span role="tab" aria-selected className="rounded-[7px] bg-card px-3.5 py-1.5 shadow-sm">By family</span>
          <button role="tab" aria-selected={false} onClick={onTree} className="rounded-[7px] px-3.5 py-1.5 text-muted-foreground hover:text-foreground">
            Family tree
          </button>
        </div>
      </div>

      <div className="mt-7 grid gap-5">
        <label className="relative w-full sm:w-[300px]">
          <span className="sr-only">Filter molecules by name</span>
          <Search size={16} aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter, e.g. delay or split" className="w-full h-11 sm:h-10 rounded-btn border border-border bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none" />
        </label>
        <div className="grid gap-2.5">
          <span id="by-shape" className="text-[14px] font-semibold">Show molecules that produce</span>
          <div role="group" aria-labelledby="by-shape" className="flex flex-wrap gap-2">
            {BEHAVIOURS.map((b) => {
              const on = shape === b;
              return (
                <button
                  key={b}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setShape(on ? null : b)}
                  className={`brick flex items-center gap-2 h-11 pl-2.5 pr-3.5 text-[13.5px] font-semibold border ${on ? "bg-accent text-accent-foreground border-accent-edge" : "bg-card border-border hover:border-foreground/45"}`}
                >
                  <ShapeIcon b={b} />
                  {BEHAVIOUR_LABEL[b]}
                  {counts && <span className={`font-normal tabular-nums ${on ? "" : "text-muted-foreground"}`}>{counts[b]}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10 lg:items-start">
        {groups.length > 0 && (
          <>
            <nav aria-label="Families" className="hidden lg:grid gap-0.5 sticky top-[88px] max-h-[calc(100vh-104px)] overflow-y-auto">
              <span className="px-2.5 pb-1.5 text-[14px] font-semibold">Families</span>
              {groups.map((g) => familyLink(g, false))}
            </nav>
            <nav aria-label="Families" className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:-mx-8 md:px-8">
              {groups.map((g) => familyLink(g, true))}
            </nav>
          </>
        )}

        <div className="min-w-0 lg:col-start-2">
          <p aria-live="polite" className="text-[14px] text-muted-foreground">
            {shape && groups.length > 0 && (
              <>
                Showing molecules that produce {label(shape)}, read off each one&apos;s default run.{" "}
                <button type="button" onClick={() => setShape(null)} className="tlink font-semibold text-foreground">
                  Clear the filter
                </button>
              </>
            )}
          </p>
          {!groups.length && (
            <div className="sheet mt-4 text-[15px]">
              <p>
                {shape && hits
                  ? <>No molecule matches &ldquo;{q.trim()}&rdquo; and produces {label(shape)} in its default run.</>
                  : shape
                    ? <>No molecule produces {label(shape)} in its default run.</>
                    : <>Nothing matches &ldquo;{q.trim()}&rdquo;. Try a shorter word, like &ldquo;delay&rdquo; or &ldquo;stock&rdquo;.</>}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {shape && <button type="button" onClick={() => setShape(null)} className="brick brick-w h-11 px-4 text-[14px] font-semibold">Clear the filter</button>}
                {hits && <button type="button" onClick={() => setQ("")} className="brick brick-w h-11 px-4 text-[14px] font-semibold">Clear the search</button>}
              </div>
            </div>
          )}

          {groups.map((group, gi) => (
            <section key={group.title} id={slug(group.title)} data-family={group.title} aria-labelledby={slug(group.title) + "-h"} className={gi ? "pt-12" : "pt-4"}>
              <h2 id={slug(group.title) + "-h"} tabIndex={-1} className="heading text-[22px] md:text-[24px] focus:outline-none">{group.title}</h2>
              <p className="mt-1.5 mb-4 text-[15px] leading-[1.55] text-muted-foreground max-w-[60ch]">{GROUP_BLURB[group.title]}</p>
              <ul className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr))]">
                {group.keys.map((k) => {
                  const m = MODELS[k];
                  const run = runs?.[k];
                  const line = run && (run.series.find((x) => shape && x.tag === shape) ?? run.series.find((x) => x.tag) ?? run.series[0]);
                  return (
                    <li key={k} className="min-w-0">
                      <a href={`#/m/${k}`} className="brick brick-w group flex flex-col gap-2.5 h-full w-full text-left !rounded-[var(--radius)] px-[18px] pt-4 pb-[18px]">
                        <Sparkline y={line?.y} />
                        <span className="heading text-[18px]">
                          {m.name}
                          {seen.has(k) && <Check size={14} strokeWidth={3} aria-label="opened before" className="inline ml-1.5 -mt-0.5 text-[var(--viz-good)]" />}
                        </span>
                        <span className="text-[14px] text-muted-foreground leading-[1.5] line-clamp-2">{m.lede}</span>
                        <span className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                          <LoopTags k={k} />
                          {run && run.tags.length > 0 && <span className="text-[12.5px] text-muted-foreground">{run.tags.map((b, i) => (i ? label(b) : BEHAVIOUR_LABEL[b])).join(", ")}</span>}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>

      {DEMOS.length > 0 && (
        <section className="pt-16 md:pt-20">
          <h2 className="heading text-[26px] md:text-[30px]">Other demos</h2>
          <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMOS.map((d) => (
              <li key={d.url}>
                <a href={d.url} target="_blank" rel="noreferrer" className="brick brick-w block h-full p-5">
                  <span className="heading flex items-center justify-between gap-3 text-[18px]">
                    {d.name} <ExternalLink size={16} aria-hidden className="shrink-0 text-muted-foreground" />
                  </span>
                  <span className="block mt-2 text-[14px] leading-[1.5] text-muted-foreground">{d.blurb}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-20 border-t border-border pt-8 text-[13px] leading-[1.6] text-muted-foreground">
        <p className="max-w-[70ch]">
          <span className="chip chipB">B</span>marks a balancing loop, <span className="chip chipR">R</span>a reinforcing one. Most molecules are our own implementations of structures described in Jim Hines,{" "}
          <i>Molecules of Structure: Building Blocks for System Dynamics Models</i>, version 2.03; the two archetype models are our own. The lessons and causal loop diagrams were added for this app.
        </p>
        <p className="mt-3 max-w-[70ch]">
          Behaviour tags and sparklines come from each molecule&apos;s default run over {RUN_LENGTH} time units. A molecule whose lines show none of the six shapes there, such as a straight fill or a single hump, has no tag; try its presets on its own page.
        </p>
      </footer>
    </div>
  );
}
