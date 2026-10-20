import { Suspense, lazy, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GROUPS, MODELS } from "@/data/molecules";
import { TOUR, childrenOf, groupOf, parentsOf } from "@/data/catalog";
import { PRESETS } from "@/data/presets";
import { LESSONS } from "@/data/lessons";
import { useSimulation } from "@/hooks/useSimulation";
import TopBar from "@/components/TopBar";
import SidePane from "@/components/SidePane";
import SiteFooter from "@/components/SiteFooter";
import StockFlowDiagram from "@/components/StockFlowDiagram";
import CausalLoopDiagram from "@/components/CausalLoopDiagram";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import EquationsPanel from "@/components/EquationsPanel";
import Controls from "@/components/Controls";
import MoleculeMap from "@/components/MoleculeMap";
import LessonPanel from "@/components/LessonPanel";
import { AppsIndex, CasePage, DomainLibrary } from "@/components/Apps";
import FamilyTree from "@/components/FamilyTree";
import RunsPanel from "@/components/RunsPanel";
import { MethodsIndex, MethodsPage } from "@/components/Methods";
// the study guide is large and only some visitors open it, so it loads on demand
const BookIndex = lazy(() => import("@/components/StudyGuide").then((m) => ({ default: m.BookIndex })));
const ChapterPage = lazy(() => import("@/components/StudyGuide").then((m) => ({ default: m.ChapterPage })));
import { METHOD_PAGES } from "@/data/methods";
import { useShelf } from "@/lib/runs";
import { markSeen } from "@/lib/progress";
import { caseIn, casesUsing, domainById } from "@/data/apps";

// The address bar is the source of truth, so Back/Forward and shared links work:
//   #/            overview map
//   #/m/<key>     one molecule
//   #/tour/<n>    guided tour, lesson n (1-based)
//   #/methods     methods guide; #/methods/<page> one page; #/methods/book[/<chapter>] the Business Dynamics study guide
//   #/tree        family tree; #/tree/<key> with that molecule selected
//   #/apps        applications: #/apps/<field> a field's cases; #/apps/<field>/<id> one case
type Route = { view: "map"; missing?: string } | { view: "molecule"; key: string } | { view: "learn"; idx: number } | { view: "apps"; domain?: string; id?: string } | { view: "tree"; key?: string } | { view: "methods"; page?: string } | { view: "book"; chapter?: string };
function parseRoute(): Route {
  const [, a, b, c] = window.location.hash.split("/");
  if (a === "m" && MODELS[b]) return { view: "molecule", key: b };
  if (a === "tour" && TOUR[Number(b) - 1]) return { view: "learn", idx: Number(b) - 1 };
  if (a === "methods" && b === "book") return { view: "book", chapter: /^(ch\d\d|app[AB])$/.test(c ?? "") ? c : undefined };
  if (a === "methods") return { view: "methods", page: METHOD_PAGES.some((p) => p.id === b) ? b : undefined };
  if (a === "tree") return { view: "tree", key: MODELS[b] ? b : undefined };
  if (a === "apps") {
    const d = domainById(b);
    return { view: "apps", domain: d?.id, id: caseIn(d, c) ? c : undefined };
  }
  // a link to a molecule that doesn't exist lands on the catalogue with a note, not silently
  return { view: "map", missing: a === "m" && b ? b : undefined };
}
const go = (hash: string) => {
  window.location.hash = hash;
};

export default function MoleculeExplorer() {
  const [route, setRoute] = useState(parseRoute);
  const [showInfluences, setShowInfluences] = useState(true);
  // open by default on wide screens, where the choice is remembered
  const [paneOpen, setPaneOpen] = useState(() => {
    if (!matchMedia("(min-width: 1024px)").matches) return false;
    try {
      return localStorage.getItem("pane") !== "closed";
    } catch {
      return true;
    }
  });
  const togglePane = (open = !paneOpen) => {
    setPaneOpen(open);
    try {
      if (matchMedia("(min-width: 1024px)").matches) localStorage.setItem("pane", open ? "open" : "closed");
    } catch {
      // storage blocked: the pane just won't remember
    }
  };
  useEffect(() => {
    if (route.view === "molecule") markSeen(route.key);
    if (route.view === "apps" && route.id) markSeen(`${route.domain}/${route.id}`);
  }, [route]);
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
  const shelf = useShelf(key);
  const open = (k: string) => go(`/m/${k}`);
  const showMap = () => go("/");
  const startTour = () => go("/tour/1");
  const showApps = () => go("/apps");
  const showTree = (k?: string) => go(k ? `/tree/${k}` : "/tree");
  const showMethods = (p?: string) => go(p ? `/methods/${p}` : "/methods");
  const openDomain = (d: string) => go(`/apps/${d}`);
  const openCase = (d: string, c: string) => go(`/apps/${d}/${c}`);
  const gotoLesson = (i: number) => go(`/tour/${Math.max(0, Math.min(TOUR.length - 1, i)) + 1}`);

  const pos = TOUR.indexOf(key);
  const prevKey = TOUR[pos - 1];
  const nextKey = TOUR[pos + 1];
  const parents = parentsOf(key);
  const children = childrenOf(key);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || view === "map" || view === "apps" || view === "tree" || view === "methods" || view === "book") return;
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
  const h2 = "heading text-[19px]";
  const controls = (
    <aside className="lg:sticky lg:top-[88px] print:hidden">
      <Controls model={model} sim={sim} presets={PRESETS[key] ?? []} />
    </aside>
  );
  const behavior = (
    <section className="sheet">
      <div className="sheet-head">
        <h2 className={h2}>Behaviour over time</h2>
        <span className={hint}>Press play, or Space</span>
      </div>
      <TimeSeriesChart model={model} subscribe={sim.subscribe} onClearPrevious={sim.clearPrevious} shelf={shelf} />
    </section>
  );
  const bench = "grid lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start";
  const wrap = "max-w-[1320px] mx-auto px-4 md:px-8";
  const siblings = GROUPS.find((g) => g.keys.includes(key))?.keys ?? [];
  const smallBrick = "brick brick-w h-9 px-3.5 text-[13px] font-semibold whitespace-nowrap";

  return (
    <div className="min-h-[100dvh]">
      <a href="#main" onClick={(e) => (e.preventDefault(), document.getElementById("main")?.focus())} className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-40 brick brick-y px-4 py-2 text-sm font-semibold">
        Skip to content
      </a>
      <TopBar onSelect={open} onCase={openCase} showMap={showMap} mapActive={view === "map"} startTour={startTour} tourActive={view === "learn"} showApps={showApps} appsActive={view === "apps"} showTree={() => showTree()} treeActive={view === "tree"} showMethods={() => showMethods()} methodsActive={view === "methods" || view === "book"} paneOpen={paneOpen} togglePane={() => togglePane()} />

      <div className="flex">
        {paneOpen && (
          <SidePane
            initialMode={view === "apps" ? "apps" : "molecules"}
            current={route.view === "apps" ? `${route.domain}/${route.id}` : route.view === "tree" ? route.key : view === "molecule" || view === "learn" ? key : undefined}
            onMolecule={open}
            onCase={(k) => go(`/apps/${k}`)}
            onClose={() => togglePane(false)}
          />
        )}
        <main id="main" tabIndex={-1} className="flex-1 min-w-0 focus:outline-none">
        {view === "map" ? (
          <>
            {route.view === "map" && route.missing && (
              <p role="alert" className="max-w-[1320px] mx-auto px-4 md:px-8 pt-6">
                <span className="sheet block text-[15px]">
                  There is no molecule called “{route.missing}”. Pick one from the catalogue below, or search for it at the top.
                </span>
              </p>
            )}
            <MoleculeMap onSelect={open} onStartTour={startTour} onApps={showApps} onTree={() => showTree()} />
          </>
        ) : route.view === "book" ? (
          <Suspense fallback={<p className="max-w-[1100px] mx-auto px-4 md:px-8 pt-10 text-muted-foreground">Loading the study guide…</p>}>
            {route.chapter ? (
              <ChapterPage key={route.chapter} id={route.chapter} onChapter={(id) => go(`/methods/book/${id}`)} onBook={() => go("/methods/book")} onOpen={(h) => go(h)} />
            ) : (
              <BookIndex onChapter={(id) => go(`/methods/book/${id}`)} />
            )}
          </Suspense>
        ) : route.view === "methods" ? (
          route.page ? (
            <MethodsPage key={route.page} id={route.page} onPage={(p) => showMethods(p || undefined)} onOpen={(h) => go(h)} />
          ) : (
            <MethodsIndex onPage={showMethods} onBook={() => go("/methods/book")} />
          )
        ) : route.view === "tree" ? (
          // on a large screen the tree view is exactly one window tall, so the whole map is visible at once
          <div className="px-4 md:px-6 pt-5 pb-4 lg:h-[calc(100dvh-4rem)] flex flex-col">
            <div className="flex-1 min-h-0">
              <FamilyTree initial={route.key} onOpen={open} />
            </div>
          </div>
        ) : route.view === "apps" ? (
          !route.domain ? (
            <AppsIndex onDomain={openDomain} onCase={openCase} />
          ) : route.id ? (
            <CasePage key={route.domain + route.id} domain={domainById(route.domain)!} id={route.id} onOpen={open} onCase={openCase} onDomain={openDomain} />
          ) : (
            <DomainLibrary key={route.domain} domain={domainById(route.domain)!} onCase={openCase} />
          )
        ) : view === "learn" ? (
          <div className={`${wrap} pt-8 md:pt-10`}>
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
              <div className="flex flex-col gap-5 min-w-0">
                <section className="sheet">
                  <div className="sheet-head">
                    <h2 className={h2}>Stock and flow diagram</h2>
                    <button onClick={() => open(key)} className="tlink text-[13px] font-semibold">
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
          <div className={`${wrap} pt-6 md:pt-8`}>
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm text-muted-foreground mb-6">
              <p>
                <button onClick={showMap} className="hover:text-foreground">
                  Molecules
                </button>
                <span aria-hidden className="mx-2">/</span>
                <span className="text-foreground font-semibold">{groupOf(key)}</span>
              </p>
              <nav aria-label="Neighbouring molecules" className="flex items-center gap-2">
                <span className="mr-2">
                  {pos + 1} of {TOUR.length}
                </span>
                <button disabled={!prevKey} onClick={() => open(prevKey)} className="brick brick-w w-9 h-9 grid place-items-center text-foreground disabled:opacity-40" aria-label={prevKey ? `Previous: ${MODELS[prevKey].name}` : "No previous molecule"} title={prevKey && MODELS[prevKey].name}>
                  <ChevronLeft size={17} aria-hidden />
                </button>
                <button disabled={!nextKey} onClick={() => open(nextKey)} className="brick brick-w w-9 h-9 grid place-items-center text-foreground disabled:opacity-40" aria-label={nextKey ? `Next: ${MODELS[nextKey].name}` : "No next molecule"} title={nextKey && MODELS[nextKey].name}>
                  <ChevronRight size={17} aria-hidden />
                </button>
              </nav>
            </div>

            <h1 className="display text-[34px] sm:text-[40px] md:text-[60px] max-w-[22ch] hyphens-auto [overflow-wrap:anywhere]">{model.title}</h1>
            <p className="mt-4 text-[18px] leading-[1.55] text-foreground/80 max-w-[62ch]">{model.lede}</p>

            {(parents.length > 0 || children.length > 0) && (
              <dl className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
                {(
                  [
                    ["Built from", parents],
                    ["Used in", children],
                  ] as const
                ).map(
                  ([label, keys]) =>
                    keys.length > 0 && (
                      <div key={label}>
                        <dt className="text-[13px] text-muted-foreground mb-2">{label}</dt>
                        <dd className="flex flex-wrap gap-2">
                          {keys.map((k) => (
                            <button key={k} onClick={() => open(k)} className={smallBrick}>
                              {MODELS[k].name}
                            </button>
                          ))}
                        </dd>
                      </div>
                    )
                )}
                <div>
                  <button onClick={() => showTree(key)} className="tlink text-[13px] font-semibold">
                    See it in the family tree
                  </button>
                </div>
              </dl>
            )}

            <div className={`${bench} mt-10`}>
              <div className="flex flex-col gap-5 min-w-0">
                <section className="sheet">
                  <div className="sheet-head">
                    <h2 className={h2}>Stock and flow diagram</h2>
                    <label className={`flex items-center gap-2 cursor-pointer select-none ${hint}`}>
                      <input type="checkbox" checked={showInfluences} onChange={(e) => setShowInfluences(e.target.checked)} className="w-4 h-4 accent-[hsl(var(--foreground))]" />
                      Show influences and feedback
                    </label>
                  </div>
                  <StockFlowDiagram model={model} modelKey={key} subscribe={sim.subscribe} running={sim.running} showInfluences={showInfluences} />
                  <div className={`flex flex-wrap gap-x-5 gap-y-1.5 mt-3 pt-3 border-t border-border ${hint}`}>
                    <span><span className="text-foreground">⧓</span> valve on a flow</span>
                    <span><span style={{ color: "var(--viz-info)" }}>→</span> constant or information link</span>
                    <span><span style={{ color: "var(--viz-acc2)" }}>→</span> feedback from a stock to a flow</span>
                    <span><span className="chip chipB">B</span>balancing loop</span>
                    <span><span className="chip chipR">R</span>reinforcing loop</span>
                  </div>
                </section>

                <div data-runs-host className="flex flex-col gap-5">
                  {behavior}
                  <RunsPanel modelKey={key} model={model} sim={sim} />
                </div>

                <section className="sheet">
                  <div className="sheet-head">
                    <h2 className={h2}>Causal loop diagram</h2>
                    <span className={hint}>The sign on each link is its polarity</span>
                  </div>
                  <CausalLoopDiagram model={model} />
                </section>

                <section className="sheet">
                  <div className="sheet-head">
                    <h2 className={h2}>Equations</h2>
                    <span className={hint}>Constants update as you move the sliders</span>
                  </div>
                  <EquationsPanel model={model} modelKey={key} params={sim.params} />
                </section>
              </div>

              {controls}
            </div>

            <section className="mt-16 grid lg:grid-cols-[260px_minmax(0,1fr)] gap-x-10 gap-y-4">
              <h2 className="heading text-[26px]">What it is and when to use it</h2>
              <div className="prose-sd" dangerouslySetInnerHTML={{ __html: model.desc }} />
            </section>

            {casesUsing(key).length > 0 && (
              <section className="mt-16">
                <h2 className="heading text-[20px] mb-1">At work in the applications</h2>
                <p className="text-[14px] text-muted-foreground mb-4">Published cases whose structure uses this molecule.</p>
                <div className="flex flex-wrap gap-2">
                  {casesUsing(key).map(({ domain, c }) => (
                    <button key={domain.id + c.id} onClick={() => openCase(domain.id, c.id)} className="brick brick-w px-3.5 py-2 text-[13px] font-semibold text-left">
                      <span className="block text-[11.5px] font-normal text-muted-foreground">{domain.short}</span>
                      {c.title}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {siblings.length > 1 && (
              <section className="mt-16">
                <h2 className="heading text-[20px] mb-4">More in {groupOf(key)}</h2>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
                  {siblings.map((k) =>
                    k === key ? (
                      <span key={k} aria-current="page" className="brick brick-y h-9 px-3.5 text-[13px] font-semibold whitespace-nowrap inline-flex items-center shrink-0">
                        {MODELS[k].name}
                      </span>
                    ) : (
                      <button key={k} onClick={() => open(k)} className={`${smallBrick} shrink-0`}>
                        {MODELS[k].name}
                      </button>
                    )
                  )}
                </div>
              </section>
            )}

            <nav aria-label="Next and previous molecule" className="mt-10 grid sm:grid-cols-2 gap-4">
              {prevKey ? (
                <button onClick={() => open(prevKey)} className="brick brick-w text-left px-5 py-4">
                  <span className="flex items-center gap-1 text-[13px] text-muted-foreground"><ChevronLeft size={14} aria-hidden /> Previous</span>
                  <span className="heading block text-[20px] mt-1">{MODELS[prevKey].name}</span>
                </button>
              ) : (
                <span />
              )}
              {nextKey && (
                <button onClick={() => open(nextKey)} className="brick brick-y text-left sm:text-right px-5 py-4">
                  <span className="flex sm:justify-end items-center gap-1 text-[13px]">Next <ChevronRight size={14} aria-hidden /></span>
                  <span className="heading block text-[20px] mt-1">{MODELS[nextKey].name}</span>
                </button>
              )}
            </nav>
          </div>
        )}
          <SiteFooter />
        </main>
      </div>
    </div>
  );
}
