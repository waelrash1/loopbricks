import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MODELS } from "@/data/molecules";
import { TOUR, childrenOf, groupOf, parentsOf } from "@/data/catalog";
import { Button } from "@/components/ui/button";
import { PRESETS } from "@/data/presets";
import { LESSONS } from "@/data/lessons";
import { useSimulation } from "@/hooks/useSimulation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const controls = (
    <Card className="p-6 lg:sticky lg:top-6">
      <Controls model={model} sim={sim} presets={PRESETS[key] ?? []} />
    </Card>
  );
  const behavior = (
    <Card>
      <CardHeader>
        <CardTitle>Behavior over time</CardTitle>
      </CardHeader>
      <CardContent>
        <TimeSeriesChart model={model} subscribe={sim.subscribe} />
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen grid md:grid-cols-[264px_minmax(0,1fr)]">
      <Sidebar
        current={view === "molecule" ? key : ""}
        onSelect={open}
        showMap={showMap}
        mapActive={view === "map"}
        startTour={startTour}
        tourActive={view === "learn"}
      />

      <main className="min-w-0 px-5 py-8 md:px-10 md:py-12">
        {view === "map" ? (
          <MoleculeMap onSelect={open} onStartTour={startTour} />
        ) : view === "learn" ? (
          <div className="max-w-[1200px]">
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
            <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
              <div className="flex flex-col gap-6 min-w-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Stock and flow diagram</CardTitle>
                    <button onClick={() => open(key)} className="text-[13px] font-medium text-link hover:underline rounded">
                      Open the full molecule
                    </button>
                  </CardHeader>
                  <CardContent>
                    <StockFlowDiagram model={model} modelKey={key} subscribe={sim.subscribe} running={sim.running} showInfluences={false} />
                  </CardContent>
                </Card>
                {behavior}
              </div>
              {controls}
            </div>
          </div>
        ) : (
          <div className="max-w-[1200px]">
            <p className="text-sm text-muted-foreground mb-2">
              <button onClick={showMap} className="hover:text-foreground hover:underline rounded">
                {groupOf(key)}
              </button>
              , molecule {pos + 1} of {TOUR.length}
            </p>
            <h1 className="display text-[40px] md:text-[48px]">{model.title}</h1>
            <p className="mt-3 text-[17px] leading-[1.6] text-foreground/80 max-w-[68ch]">{model.lede}</p>

            {(parents.length > 0 || children.length > 0) && (
              <dl className="mt-5 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_minmax(0,1fr)] items-baseline">
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
                        <dd className="flex flex-wrap gap-1.5">
                          {keys.map((k) => (
                            <button
                              key={k}
                              onClick={() => open(k)}
                              className="rounded-full border border-input bg-card px-3 py-1 text-[13px] transition-colors hover:border-foreground"
                            >
                              {MODELS[k].name}
                            </button>
                          ))}
                        </dd>
                      </div>
                    )
                )}
              </dl>
            )}
            <div className="mb-8" />

            <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
              <div className="flex flex-col gap-6 min-w-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Stock and flow diagram</CardTitle>
                    <label className={`flex items-center gap-2 cursor-pointer select-none ${hint}`}>
                      <input type="checkbox" checked={showInfluences} onChange={(e) => setShowInfluences(e.target.checked)} className="accent-[hsl(var(--link))]" />
                      Show influences and feedback
                    </label>
                  </CardHeader>
                  <CardContent>
                    <StockFlowDiagram model={model} modelKey={key} subscribe={sim.subscribe} running={sim.running} showInfluences={showInfluences} />
                    <div className={`flex flex-wrap gap-x-5 gap-y-1 mt-3 ${hint}`}>
                      <span><span className="text-ink">⧓</span> valve on a flow</span>
                      <span><span style={{ color: "var(--viz-info)" }}>→</span> constant or information link</span>
                      <span><span style={{ color: "var(--viz-acc2)" }}>→</span> feedback from a stock to a flow</span>
                      <span><b style={{ color: "var(--viz-acc)" }}>B</b> balancing loop</span>
                      <span><b style={{ color: "var(--viz-acc2)" }}>R</b> reinforcing loop</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Equations</CardTitle>
                    <span className={hint}>Constants update as you move the sliders</span>
                  </CardHeader>
                  <CardContent>
                    <EquationsPanel model={model} modelKey={key} params={sim.params} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Causal loop diagram</CardTitle>
                    <span className={hint}>The sign on each link is its polarity</span>
                  </CardHeader>
                  <CardContent>
                    <CausalLoopDiagram model={model} />
                  </CardContent>
                </Card>

                {behavior}
              </div>

              {controls}
            </div>

            <Card className="mt-6 p-6 md:p-10">
              <div className="prose-sd" dangerouslySetInnerHTML={{ __html: model.desc }} />
            </Card>

            <nav aria-label="Neighbouring molecules" className="mt-6 flex flex-wrap justify-between gap-3">
              {prevKey ? (
                <Button variant="secondary" onClick={() => open(prevKey)}>
                  <ChevronLeft size={16} aria-hidden /> {MODELS[prevKey].name}
                </Button>
              ) : (
                <span />
              )}
              {nextKey && (
                <Button variant="secondary" onClick={() => open(nextKey)}>
                  {MODELS[nextKey].name} <ChevronRight size={16} aria-hidden />
                </Button>
              )}
            </nav>
          </div>
        )}
      </main>
    </div>
  );
}
