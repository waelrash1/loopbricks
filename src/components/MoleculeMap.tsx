import { useEffect } from "react";
import { GROUPS, MODELS } from "@/data/molecules";
import { GROUP_BLURB } from "@/data/catalog";
import { PRESETS } from "@/data/presets";
import { useSimulation } from "@/hooks/useSimulation";
import MiniDiagram from "@/components/MiniDiagram";
import StockFlowDiagram from "@/components/StockFlowDiagram";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import { Button } from "@/components/ui/button";

const DEMO = "stockmgmt";
const DEMO_LENGTH = 60; // weeks: long enough to see the overshoot ring down

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
    <figure className="min-w-0">
      <StockFlowDiagram model={model} modelKey={DEMO} subscribe={subscribe} running={sim.running} showInfluences={false} />
      <div className="mt-3">
        <TimeSeriesChart model={model} subscribe={subscribe} height={150} />
      </div>
      <figcaption className="mt-3 text-[13px] leading-[1.5] text-muted-foreground">
        Running now:{" "}
        <button onClick={onOpen} className="tlink text-foreground">
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
    <span className="font-mono text-xs font-medium shrink-0" title={[types.has("B") && "balancing", types.has("R") && "reinforcing"].filter(Boolean).join(" and ") + " feedback"}>
      {types.has("B") && <span style={{ color: "var(--viz-acc)" }}>B</span>}
      {types.has("R") && <span style={{ color: "var(--viz-acc2)" }}>R</span>}
    </span>
  );
}

export default function MoleculeMap({ onSelect, onStartTour }: { onSelect: (k: string) => void; onStartTour: () => void }) {
  const total = Object.keys(MODELS).length;
  return (
    <div className="max-w-[1320px] mx-auto">
      <section className="pb-14 md:pb-20">
        <h1 className="display text-[48px] sm:text-[64px] xl:text-[88px] max-w-[21ch]">Big models are made of small molecules.</h1>
        <div className="mt-8 md:mt-10 grid lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] gap-10 lg:gap-14 items-start">
          <div className="min-w-0">
            <p className="text-[18px] leading-[1.55] text-foreground/80 max-w-[40ch]">
              {total} runnable building blocks for system-dynamics models, from Jim Hines’ <i>Molecules of Structure</i>. Predict what each
              one does, then press play.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" onClick={onStartTour}>
                Start the tour
              </Button>
              <Button size="lg" variant="secondary" onClick={() => onSelect("bathtub")}>
                Open the Bathtub
              </Button>
            </div>
          </div>
          <LiveDemo onOpen={() => onSelect(DEMO)} />
        </div>
      </section>

      {GROUPS.map((group) => (
        <section key={group.title} className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-x-10 gap-y-4 border-t border-foreground pt-5 pb-14">
          <div className="lg:sticky lg:top-5 self-start">
            <h2 className="heading text-[26px]">{group.title}</h2>
            <p className="mt-2 text-sm leading-[1.55] text-muted-foreground max-w-[52ch]">{GROUP_BLURB[group.title]}</p>
          </div>
          {/* a parts tray: cells share their rules instead of each being a card */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 border-l border-t border-border">
            {group.keys.map((k) => {
              const m = MODELS[k];
              return (
                <li key={k} className="border-r border-b border-border">
                  <button onClick={() => onSelect(k)} className="group block h-full w-full text-left p-4 transition-colors hover:bg-card focus-visible:bg-card">
                    <div className="h-[76px] mb-3">
                      <MiniDiagram model={m} />
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-[15px] group-hover:underline underline-offset-4">{m.name}</span>
                      <LoopTag k={k} />
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-[1.5] mt-1 line-clamp-2">{m.lede}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <footer className="border-t border-foreground pt-5 pb-10 text-[13px] leading-[1.6] text-muted-foreground max-w-[70ch]">
        <span className="font-mono font-medium" style={{ color: "var(--viz-acc)" }}>B</span> marks a balancing loop,{" "}
        <span className="font-mono font-medium" style={{ color: "var(--viz-acc2)" }}>R</span> a reinforcing one. Main reference: Jim Hines,{" "}
        <i>Molecules of Structure: Building Blocks for System Dynamics Models</i>, version 2.03 (2015). The molecules and their equations are
        his; the lessons and causal loop diagrams were added for this app. Created by Wael Rashwan.
      </footer>
    </div>
  );
}
