import { useEffect, useState } from "react";
import { Check, ExternalLink, Pause, Play, Search } from "lucide-react";
import { useSeen } from "@/lib/progress";
import { GROUPS, MODELS } from "@/data/molecules";
import { GROUP_BLURB, search } from "@/data/catalog";
import { PRESETS } from "@/data/presets";
import { useSimulation } from "@/hooks/useSimulation";
import MiniDiagram from "@/components/MiniDiagram";
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
    <figure className="sheet min-w-0 shadow-[0_3px_0_hsl(var(--edge))] relative">
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

// Which feedback a molecule contains, in the same letters and colours the diagrams use.
function LoopTag({ k }: { k: string }) {
  const types = new Set(MODELS[k].cld.loops.map((l) => l.type));
  if (!types.size) return null;
  return (
    <span className="shrink-0" title={[types.has("B") && "balancing", types.has("R") && "reinforcing"].filter(Boolean).join(" and ") + " feedback"}>
      {types.has("B") && <span className="chip chipB">B</span>}
      {types.has("R") && <span className="chip chipR !mr-0">R</span>}
    </span>
  );
}

// The library: every molecule by family, with a filter and a switch to the family tree.
export default function MoleculeMap({ onTree, missing }: { onTree: () => void; missing?: string }) {
  const total = Object.keys(MODELS).length;
  const seen = useSeen();
  const [q, setQ] = useState("");
  const hits = q.trim() ? new Set(search(q).map((r) => r.key)) : null;
  const groups = GROUPS.map((g) => ({ ...g, keys: hits ? g.keys.filter((k) => hits.has(k)) : g.keys })).filter((g) => g.keys.length);
  // hash routing owns the URL, so family links scroll instead of using #anchors
  const jump = (title: string) => document.getElementById(slug(title))?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

  return (
    <div className="page pt-8 md:pt-12">
      {missing && (
        <p role="alert" className="sheet mb-6 text-[15px]">
          There is no molecule called &ldquo;{missing}&rdquo;. Pick one below, or filter by name.
        </p>
      )}
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h1 className="display text-[36px] md:text-[48px]">Library</h1>
          <p className="mt-3 text-[16px] leading-[1.55] text-foreground/80 max-w-[56ch]">
            {total} molecules in {GROUPS.length} families, from a single stock to whole projects. Open one to run it.
          </p>
        </div>
        <div role="tablist" aria-label="View" className="inline-flex rounded-btn bg-muted p-1 text-[14px] font-semibold">
          <span role="tab" aria-selected className="rounded-[7px] bg-card px-3.5 py-1.5 shadow-sm">By family</span>
          <button role="tab" aria-selected={false} onClick={onTree} className="rounded-[7px] px-3.5 py-1.5 text-muted-foreground hover:text-foreground">
            Family tree
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col md:flex-row md:items-start gap-3">
        <label className="relative md:w-[280px] shrink-0">
          <span className="sr-only">Filter molecules</span>
          <Search size={16} aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter, e.g. delay or split" className="w-full h-10 rounded-btn border border-border bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none" />
        </label>
        <nav aria-label="Families" className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          {groups.map((g) => (
            <button key={g.title} onClick={() => jump(g.title)} className="brick brick-w shrink-0 h-9 px-3 text-[13px] font-semibold whitespace-nowrap">
              {g.title} <span className="ml-1 text-muted-foreground font-normal">{g.keys.length}</span>
            </button>
          ))}
        </nav>
      </div>
      {hits && !groups.length && <p className="mt-10 text-[15px] text-muted-foreground">Nothing matches &ldquo;{q.trim()}&rdquo;. Try a shorter word, like &ldquo;delay&rdquo; or &ldquo;stock&rdquo;.</p>}

      {groups.map((group) => (
        <section key={group.title} id={slug(group.title)} className="pt-12 md:pt-16">
          <h2 className="heading text-[26px] md:text-[30px]">{group.title}</h2>
          <p className="mt-2 mb-6 text-[15px] leading-[1.55] text-muted-foreground max-w-[60ch]">{GROUP_BLURB[group.title]}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {group.keys.map((k) => {
              const m = MODELS[k];
              return (
                <li key={k} className="min-w-0">
                  <a href={`#/m/${k}`} className="brick brick-w group flex flex-col h-full w-full text-left p-3">
                    <div className="h-[84px] w-full rounded-[7px] bg-background p-2">
                      <MiniDiagram model={m} />
                    </div>
                    <div className="mt-3 px-1 flex items-start justify-between gap-2">
                      <span className="font-semibold text-[15px] leading-snug">
                        {m.name}
                        {seen.has(k) && <Check size={14} strokeWidth={3} aria-label="opened before" className="inline ml-1.5 -mt-0.5 text-[var(--viz-good)]" />}
                      </span>
                      <LoopTag k={k} />
                    </div>
                    <p className="px-1 text-[13px] text-muted-foreground leading-[1.5] mt-1 line-clamp-2">{m.lede}</p>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

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
      </footer>
    </div>
  );
}
