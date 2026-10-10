import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MODELS } from "@/data/molecules";
import { TOUR, childrenOf, groupOf, parentsOf } from "@/data/catalog";
import { PRESETS } from "@/data/presets";
import { LESSONS } from "@/data/lessons";
import { useSimulation } from "@/hooks/useSimulation";
import Sidebar from "@/components/Sidebar";
import StockFlowDiagram from "@/components/StockFlowDiagram";
import CausalLoopDiagram from "@/components/CausalLoopDiagram";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import EquationsPanel from "@/components/EquationsPanel";
import Controls from "@/components/Controls";
import MoleculeMap from "@/components/MoleculeMap";
import LessonPanel from "@/components/LessonPanel";

// The address bar is the source of truth, so Back/Forward and shared links work:
//   #/            overview map
//   #/m/<key>     one molecule
//   #/tour/<n>    guided tour, lesson n (1-based)
type Route = { view: "map" } | { view: "molecule"; key: string } | { view: "learn"; idx: number };
function parseRoute(): Route {
  const [, a, b] = window.location.hash.split("/");
  if (a === "m" && MODELS[b]) return { view: "molecule", key: b };
  if (a === "tour" && TOUR[Number(b) - 1]) return { view: "learn", idx: Number(b) - 1 };
  return { view: "map" };
}
const go = (hash: string) => {
  window.location.hash = hash;
};

export default function MoleculeExplorer() {
  const [route, setRoute] = useState(parseRoute);
  const [showInfluences, setShowInfluences] = useState(true);
  useEffect(() => {
    const onHash = () => {
      setRoute(parseRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const view = route.view;
  const lessonIdx = route.view === "learn" ? route.idx : 0;
  const key = route.view === "molecule" ? route.key : route.view === "learn" ? TOUR[route.idx] : TOUR[0];
  const model = MODELS[key];
  const sim = useSimulation(model);
  const open = (k: string) => go(`/m/${k}`);
  const showMap = () => go("/");
  const startTour = () => go("/tour/1");
  const gotoLesson = (i: number) => go(`/tour/${Math.max(0, Math.min(TOUR.length - 1, i)) + 1}`);

  const pos = TOUR.indexOf(key);
  const prevKey = TOUR[pos - 1];
  const nextKey = TOUR[pos + 1];
  const parents = parentsOf(key);
  const children = childrenOf(key);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || view === "map") return;
      if (e.key === " ") {
        e.preventDefault();
        sim.toggle();
      } else if (e.key === "r" || e.key === "R") sim.reset();
      else if (e.key === "s" || e.key === "S") sim.step();
      else if (e.key === "p" || e.key === "P") sim.pulse();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sim, view]);

  const hint = "text-[13px] text-muted-foreground";
  const h2 = "heading text-[20px]";
  // sits beside the workbench on wide screens, with a rule instead of a box
  const controls = (
    <aside className="lg:sticky lg:top-6 lg:border-l lg:border-border lg:pl-8 border-t border-foreground pt-4 lg:border-t-0 lg:pt-0">
      <Controls model={model} sim={sim} presets={PRESETS[key] ?? []} />
    </aside>
  );
  const behavior = (
    <section className="bench">
      <div className="bench-head">
        <h2 className={h2}>Behaviour over time</h2>
        <span className={hint}>Press play, or Space</span>
      </div>
      <TimeSeriesChart model={model} subscribe={sim.subscribe} />
    </section>
  );
  const bench = "grid lg:grid-cols-[minmax(0,1fr)_300px] gap-x-8 gap-y-10 items-start";

  return (
    <div className="min-h-[100dvh] grid md:grid-cols-[256px_minmax(0,1fr)]">
      <Sidebar
        current={view === "molecule" ? key : ""}
        onSelect={open}
        showMap={showMap}
        mapActive={view === "map"}
        startTour={startTour}
        tourActive={view === "learn"}
      />

      <main className="min-w-0 px-4 py-8 md:px-10 md:py-10">
        {view === "map" ? (
          <MoleculeMap onSelect={open} onStartTour={startTour} />
        ) : view === "learn" ? (
          <div className="max-w-[1240px] mx-auto">
            <LessonPanel
              key={lessonIdx}
              lesson={LESSONS[key]}
              title={model.title}
              idx={lessonIdx}
              total={TOUR.length}
              onPrev={() => gotoLesson(lessonIdx - 1)}
              onNext={() => gotoLesson(lessonIdx + 1)}
              onJump={gotoLesson}
              lessons={TOUR.map((k) => MODELS[k].name)}
              onExit={showMap}
              onReveal={(preset) => {
                if (preset) sim.applyParams(preset);
                sim.reset();
                sim.play();
              }}
            />
            <div className={bench}>
              <div className="flex flex-col gap-10 min-w-0">
                <section className="bench">
                  <div className="bench-head">
                    <h2 className={h2}>Stock and flow diagram</h2>
                    <button onClick={() => open(key)} className="tlink text-[13px]">
                      Open the full molecule
                    </button>
                  </div>
                  <StockFlowDiagram model={model} modelKey={key} subscribe={sim.subscribe} running={sim.running} showInfluences={false} />
                </section>
                {behavior}
              </div>
              {controls}
            </div>
          </div>
        ) : (
          <div className="max-w-[1240px] mx-auto">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm text-muted-foreground mb-4">
              <p>
                <button onClick={showMap} className="tlink">
                  {groupOf(key)}
                </button>
                <span className="font-mono text-[12px] ml-3">
                  {pos + 1}/{TOUR.length}
                </span>
              </p>
              <nav aria-label="Neighbouring molecules" className="flex gap-5">
                {prevKey && (
                  <button onClick={() => open(prevKey)} className="inline-flex items-center gap-1 hover:text-foreground rounded-btn">
                    <ChevronLeft size={15} aria-hidden /> {MODELS[prevKey].name}
                  </button>
                )}
                {nextKey && (
                  <button onClick={() => open(nextKey)} className="inline-flex items-center gap-1 hover:text-foreground rounded-btn">
                    {MODELS[nextKey].name} <ChevronRight size={15} aria-hidden />
                  </button>
                )}
              </nav>
            </div>

            <h1 className="display text-[44px] md:text-[60px]">{model.title}</h1>
            <p className="mt-4 text-[18px] leading-[1.55] text-foreground/80 max-w-[62ch]">{model.lede}</p>

            {(parents.length > 0 || children.length > 0) && (
              <dl className="mt-5 grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[auto_minmax(0,1fr)] items-baseline">
                {(
                  [
                    ["Builds on", parents],
                    ["Used by", children],
                  ] as const
                ).map(
                  ([label, keys]) =>
                    keys.length > 0 && (
                      <div key={label} className="contents">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="flex flex-wrap gap-x-4 gap-y-1">
                          {keys.map((k) => (
                            <button key={k} onClick={() => open(k)} className="tlink">
                              {MODELS[k].name}
                            </button>
                          ))}
                        </dd>
                      </div>
                    )
                )}
              </dl>
            )}

            <div className={`${bench} mt-10`}>
              <div className="flex flex-col gap-10 min-w-0">
                <section className="bench">
                  <div className="bench-head">
                    <h2 className={h2}>Stock and flow diagram</h2>
                    <label className={`flex items-center gap-2 cursor-pointer select-none ${hint}`}>
                      <input type="checkbox" checked={showInfluences} onChange={(e) => setShowInfluences(e.target.checked)} className="accent-[hsl(var(--foreground))]" />
                      Show influences and feedback
                    </label>
                  </div>
                  <StockFlowDiagram model={model} modelKey={key} subscribe={sim.subscribe} running={sim.running} showInfluences={showInfluences} />
                  <div className={`flex flex-wrap gap-x-5 gap-y-1 mt-3 ${hint}`}>
                    <span><span className="text-foreground">⧓</span> valve on a flow</span>
                    <span><span style={{ color: "var(--viz-info)" }}>→</span> constant or information link</span>
                    <span><span style={{ color: "var(--viz-acc2)" }}>→</span> feedback from a stock to a flow</span>
                    <span><b className="font-mono font-medium" style={{ color: "var(--viz-acc)" }}>B</b> balancing loop</span>
                    <span><b className="font-mono font-medium" style={{ color: "var(--viz-acc2)" }}>R</b> reinforcing loop</span>
                  </div>
                </section>

                {behavior}

                <section className="bench">
                  <div className="bench-head">
                    <h2 className={h2}>Causal loop diagram</h2>
                    <span className={hint}>The sign on each link is its polarity</span>
                  </div>
                  <CausalLoopDiagram model={model} />
                </section>

                <section className="bench">
                  <div className="bench-head">
                    <h2 className={h2}>Equations</h2>
                    <span className={hint}>Constants update as you move the sliders</span>
                  </div>
                  <EquationsPanel model={model} modelKey={key} params={sim.params} />
                </section>
              </div>

              {controls}
            </div>

            <section className="bench mt-14">
              <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-x-10 gap-y-4">
                <h2 className="heading text-[26px]">What it is and when to use it</h2>
                <div className="prose-sd" dangerouslySetInnerHTML={{ __html: model.desc }} />
              </div>
            </section>

            <nav aria-label="Next and previous molecule" className="mt-14 grid sm:grid-cols-2 border-t border-foreground">
              {prevKey ? (
                <button onClick={() => open(prevKey)} className="group text-left py-5 pr-6 hover:bg-card">
                  <span className="text-[13px] text-muted-foreground">Previous</span>
                  <span className="heading block text-[22px] mt-1 group-hover:underline underline-offset-4">{MODELS[prevKey].name}</span>
                </button>
              ) : (
                <span />
              )}
              {nextKey && (
                <button onClick={() => open(nextKey)} className="group text-left sm:text-right py-5 sm:pl-6 sm:border-l border-border hover:bg-card">
                  <span className="text-[13px] text-muted-foreground">Next</span>
                  <span className="heading block text-[22px] mt-1 group-hover:underline underline-offset-4">{MODELS[nextKey].name}</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </main>
    </div>
  );
}
