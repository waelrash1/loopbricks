import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { GROUPS, MODELS } from "@/data/molecules";
import { GROUP_BLURB } from "@/data/catalog";
import { ALL_CASES, DOMAINS } from "@/data/apps";
import { PRESETS } from "@/data/presets";
import { useSimulation } from "@/hooks/useSimulation";
import MiniDiagram from "@/components/MiniDiagram";
import StockFlowDiagram from "@/components/StockFlowDiagram";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import { Button } from "@/components/ui/button";

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
function LiveDemo({ onOpen }: { onOpen: () => void }) {
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
    <figure className="sheet min-w-0 shadow-[0_3px_0_hsl(var(--edge))]">
      <StockFlowDiagram model={model} modelKey={DEMO} subscribe={subscribe} running={sim.running} showInfluences={false} />
      <div className="mt-2 border-t border-border pt-3">
        <TimeSeriesChart model={model} subscribe={subscribe} height={150} />
      </div>
      <figcaption className="mt-3 text-[13px] leading-[1.5] text-muted-foreground">
        Running now:{" "}
        <button onClick={onOpen} className="tlink font-semibold text-foreground">
          Stock Management
        </button>{" "}
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

export default function MoleculeMap({ onSelect, onStartTour, onApps }: { onSelect: (k: string) => void; onStartTour: () => void; onApps: () => void }) {
  const total = Object.keys(MODELS).length;
  // hash routing owns the URL, so family links scroll instead of using #anchors
  const jump = (title: string) => document.getElementById(slug(title))?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

  return (
    <div className="max-w-[1320px] mx-auto px-4 md:px-8">
      <section className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10 lg:gap-14 items-center pt-10 md:pt-16 pb-14 md:pb-20">
        <div className="min-w-0">
          <h1 className="display text-[44px] sm:text-[58px] xl:text-[66px]">Big models are built from small molecules.</h1>
          <p className="mt-6 text-[18px] leading-[1.55] text-foreground/80 max-w-[38ch]">
            {total} runnable building blocks from Jim Hines’ <i>Molecules of Structure</i>. Predict what each one does, then press play.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={onStartTour}>
              Start the tour
            </Button>
            <Button size="lg" variant="secondary" onClick={() => onSelect("bathtub")}>
              Open the Bathtub
            </Button>
          </div>
        </div>
        <LiveDemo onOpen={() => onSelect(DEMO)} />
      </section>

      <nav aria-label="Families" className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {GROUPS.map((g) => (
          <button key={g.title} onClick={() => jump(g.title)} className="brick brick-w shrink-0 h-9 px-3.5 text-[13px] font-semibold whitespace-nowrap">
            {g.title} <span className="ml-1 text-muted-foreground font-normal">{g.keys.length}</span>
          </button>
        ))}
      </nav>

      {GROUPS.map((group) => (
        <section key={group.title} id={slug(group.title)} className="pt-12 md:pt-16">
          <h2 className="heading text-[26px] md:text-[30px]">{group.title}</h2>
          <p className="mt-2 mb-6 text-[15px] leading-[1.55] text-muted-foreground max-w-[60ch]">{GROUP_BLURB[group.title]}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {group.keys.map((k) => {
              const m = MODELS[k];
              return (
                <li key={k} className="min-w-0">
                  <button onClick={() => onSelect(k)} className="brick brick-w group flex flex-col h-full w-full text-left p-3">
                    <div className="h-[84px] w-full rounded-[7px] bg-background p-2">
                      <MiniDiagram model={m} />
                    </div>
                    <div className="mt-3 px-1 flex items-start justify-between gap-2">
                      <span className="font-semibold text-[15px] leading-snug">{m.name}</span>
                      <LoopTag k={k} />
                    </div>
                    <p className="px-1 pb-1 text-[13px] text-muted-foreground leading-[1.5] mt-1 line-clamp-2">{m.lede}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section className="pt-16 md:pt-20">
        <button onClick={onApps} className="brick brick-y w-full text-left p-6 md:p-8 grid md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
          <span>
            <span className="heading block text-[24px] md:text-[28px]">The molecules at work</span>
            <span className="block mt-2 text-[15px] leading-[1.55] max-w-[70ch]">
              {ALL_CASES.length} cases from published studies in {DOMAINS.length} fields, from {DOMAINS.map((d) => d.short.toLowerCase()).join(", ")}. Each runs in the browser, with the data it needs and checks on what it shows.
            </span>
          </span>
          <span className="text-[15px] font-semibold whitespace-nowrap">Open the library</span>
        </button>
      </section>

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

      <footer className="mt-20 border-t border-border py-8 text-[13px] leading-[1.6] text-muted-foreground grid md:grid-cols-[minmax(0,1fr)_auto] gap-6">
        <p className="max-w-[70ch]">
          <span className="chip chipB">B</span>marks a balancing loop, <span className="chip chipR">R</span>a reinforcing one. Main reference: Jim Hines,{" "}
          <i>Molecules of Structure: Building Blocks for System Dynamics Models</i>, version 2.03 (2015). The molecules and their equations are his; the
          lessons and causal loop diagrams were added for this app.
        </p>
        <p>Created by Wael Rashwan</p>
      </footer>
    </div>
  );
}
