import { Suspense, lazy, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GROUPS, MODELS } from "@/data/molecules";
import { TOUR, childrenOf, groupOf, parentsOf } from "@/data/catalog";
import { PRESETS } from "@/data/presets";
import { LESSONS } from "@/data/lessons";
import { useSimulation } from "@/hooks/useSimulation";
import TopBar, { type Section } from "@/components/TopBar";
import Home from "@/components/Home";
import Tabs from "@/components/Tabs";
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
const LearnRoutes = lazy(() => import("@/components/LearnRoutes"));
const PythonPanel = lazy(() => import("@/components/PythonPanel"));
const LearnPanel = lazy(() => import("@/components/Learn").then((m) => ({ default: m.LearnPanel })));
import { METHOD_PAGES } from "@/data/methods";
import { useShelf } from "@/lib/runs";
import { markSeen } from "@/lib/progress";
import { caseIn, casesUsing, domainById } from "@/data/apps";

// The address bar is the source of truth, so Back/Forward and shared links work. Four sections:
//   Learn:   #/learn[/<module>[/<id>]] the course and practice pages, #/tour/<n> the quick tour, #/methods[/<page>]
//   Library: #/library all molecules, #/m/<key> one molecule, #/tree[/<key>] the family tree
//   Cases:   #/apps[/<field>[/<id>]]
//   Build:   #/build (also #/learn/build)
// #/ is the home page. Every older address still resolves.
type Route = { view: "home" } | { view: "map"; missing?: string } | { view: "molecule"; key: string } | { view: "learn"; idx: number } | { view: "apps"; domain?: string; id?: string } | { view: "tree"; key?: string } | { view: "methods"; page?: string } | { view: "curriculum"; module?: string; id?: string };
function parseRoute(): Route {
  const [, a, b, c] = window.location.hash.split("/");
  if (!a) return { view: "home" };
  if (a === "library") return { view: "map" };
  if (a === "m" && MODELS[b]) return { view: "molecule", key: b };
  if (a === "tour" && TOUR[Number(b) - 1]) return { view: "learn", idx: Number(b) - 1 };
  if (a === "learn") return { view: "curriculum", module: b || undefined, id: c || undefined };
  if (a === "build") return { view: "curriculum", module: "build" };
  // the old chapter-by-chapter study guide now lives in the curriculum
  if (a === "methods" && b === "book") return { view: "curriculum" };
  if (a === "methods") return { view: "methods", page: METHOD_PAGES.some((p) => p.id === b) ? b : undefined };
  if (a === "tree") return { view: "tree", key: MODELS[b] ? b : undefined };
  if (a === "apps") {
    const d = domainById(b);
    return { view: "apps", domain: d?.id, id: caseIn(d, c) ? c : undefined };
  }
  // a link to a molecule that doesn't exist lands in the library with a note, not silently
  return a === "m" ? { view: "map", missing: b || undefined } : { view: "home" };
}
const sectionOf = (r: Route): Section =>
  r.view === "home" ? "home" : r.view === "apps" ? "cases" : r.view === "curriculum" && r.module === "build" ? "build" : r.view === "learn" || r.view === "curriculum" || r.view === "methods" ? "learn" : "library";

// The pages inside Learn, one row of tabs so nothing is more than one click away.
const LEARN_TABS: [string, string, (r: Route) => boolean][] = [
  ["Course", "/learn", (r) => r.view === "curriculum" && (!r.module || !["games", "draw", "studio", "references", "projects", "glossary", "teach", "review", "check", "progress", "assigned"].includes(r.module))],
  ["Quick tour", "/tour/1", (r) => r.view === "learn"],
  ["Games", "/learn/games", (r) => r.view === "curriculum" && r.module === "games"],
  ["Draw the loops", "/learn/draw", (r) => r.view === "curriculum" && r.module === "draw"],
  ["Modelling studio", "/learn/studio", (r) => r.view === "curriculum" && r.module === "studio"],
  ["Projects", "/learn/projects", (r) => r.view === "curriculum" && r.module === "projects"],
  ["Methods", "/methods", (r) => r.view === "methods"],
  ["Glossary", "/learn/glossary", (r) => r.view === "curriculum" && r.module === "glossary"],
  ["Reading list", "/learn/references", (r) => r.view === "curriculum" && r.module === "references"],
  ["For instructors", "/learn/teach", (r) => r.view === "curriculum" && ["teach", "progress", "assigned", "review", "check"].includes(r.module ?? "")],
];
function LearnTabs({ route }: { route: Route }) {
  return (
    <nav aria-label="Learn" className="print:hidden border-b border-border bg-card/60">
      <div className="max-w-[1320px] mx-auto px-4 md:px-8 flex gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {LEARN_TABS.map(([label, hash, on]) => (
          <a key={hash} href={"#" + hash} onClick={(e) => (e.preventDefault(), go(hash))} aria-current={on(route) ? "page" : undefined} className={cn("h-11 inline-flex items-center px-3 text-[14px] font-semibold rounded-t-[8px] border-b-2", on(route) ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}

const go = (hash: string) => {
  window.location.hash = hash;
};

export default function MoleculeExplorer() {
  const [route, setRoute] = useState(parseRoute);
  const [showInfluences, setShowInfluences] = useState(true);
  useEffect(() => {
    // remember the last thing worth returning to, for "Pick up where you left off" on the home page
    if (route.view === "molecule" || (route.view === "apps" && route.id) || (route.view === "curriculum" && route.module)) {
      try {
        localStorage.setItem("last", window.location.hash.slice(1));
      } catch {
        // storage blocked: the home page just won't offer it
      }
    }
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
  const showMap = () => go("/library");
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
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || view === "home" || view === "map" || view === "apps" || view === "tree" || view === "methods" || view === "curriculum") return;
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

  const section = sectionOf(route);
  // the panels below were written as page sections; inside a tab they lose their own heading and top margin
  const inTab = "[&>section]:mt-0 [&>section]:block [&>section>h2]:sr-only";

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <a href="#main" onClick={(e) => (e.preventDefault(), document.getElementById("main")?.focus())} className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-40 brick brick-y px-4 py-2 text-sm font-semibold">
        Skip to content
      </a>
      <TopBar section={section} go={go} onSelect={open} onCase={openCase} />
      {section === "learn" && <LearnTabs route={route} />}

      <main id="main" tabIndex={-1} className="flex-1 min-w-0 focus:outline-none">
        {view === "home" ? (
          <Home go={go} />
        ) : view === "map" ? (
          <MoleculeMap onSelect={open} onTree={() => showTree()} missing={route.view === "map" ? route.missing : undefined} />
        ) : route.view === "curriculum" ? (
          <Suspense fallback={<p className="max-w-[1100px] mx-auto px-4 md:px-8 pt-10 text-muted-foreground">Loading…</p>}>
            <LearnRoutes page={route.module} id={route.id} go={go} />
          </Suspense>
        ) : route.view === "methods" ? (
          route.page ? (
            <MethodsPage key={route.page} id={route.page} onPage={(p) => showMethods(p || undefined)} onOpen={(h) => go(h)} />
          ) : (
            <MethodsIndex onPage={showMethods} onBook={() => go("/learn")} />
          )
        ) : route.view === "tree" ? (
          // on a large screen the tree view is exactly one window tall, so the whole map is visible at once
          <div className="px-4 md:px-6 pt-4 pb-4 lg:h-[calc(100dvh-4rem)] flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <h1 className="heading text-[22px]">Family tree</h1>
              <div role="tablist" aria-label="View" className="inline-flex rounded-btn bg-muted p-1 text-[14px] font-semibold">
                <button role="tab" aria-selected={false} onClick={showMap} className="rounded-[7px] px-3.5 py-1.5 text-muted-foreground hover:text-foreground">
                  By family
                </button>
                <span role="tab" aria-selected className="rounded-[7px] bg-card px-3.5 py-1.5 shadow-sm">Family tree</span>
              </div>
            </div>
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
              onExit={() => go("/learn")}
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
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm text-muted-foreground mb-4">
              <p>
                <button onClick={showMap} className="hover:text-foreground">
                  Library
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

            <h1 className="display text-[30px] sm:text-[36px] md:text-[44px] max-w-[26ch] hyphens-auto [overflow-wrap:anywhere]">{model.title}</h1>
            <p className="mt-3 text-[17px] leading-[1.55] text-foreground/80 max-w-[70ch]">{model.lede}</p>

            <div data-runs-host className="mt-7">
              <div className={bench}>
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
                  {behavior}
                </div>
                {controls}
              </div>

              <div className="mt-10">
                <Tabs
                  label="About this molecule"
                  items={[
                    ["explain", "Explain", <div key="x" className="prose-sd" dangerouslySetInnerHTML={{ __html: model.desc }} />],
                    [
                      "loops",
                      "Loops",
                      <section key="l" className="sheet max-w-[900px]">
                        <p className={`${hint} mb-3`}>The sign on each link is its polarity.</p>
                        <CausalLoopDiagram model={model} />
                      </section>,
                    ],
                    [
                      "equations",
                      "Equations",
                      <section key="e" className="sheet">
                        <p className={`${hint} mb-3`}>Constants update as you move the sliders.</p>
                        <EquationsPanel model={model} modelKey={key} params={sim.params} />
                      </section>,
                    ],
                    ["runs", "Runs and data", <RunsPanel key="r" modelKey={key} model={model} sim={sim} />],
                    [
                      "python",
                      "Python",
                      <div key="p" className={inTab}>
                        <Suspense fallback={<p className={hint}>Loading…</p>}>
                          <PythonPanel molecule={key} onOpen={(h) => go(h)} />
                        </Suspense>
                      </div>,
                    ],
                    [
                      "course",
                      "In the course",
                      <div key="c" className={inTab}>
                        <Suspense fallback={<p className={hint}>Loading…</p>}>
                          <LearnPanel
                            molecule={key}
                            onModule={(id, anchor) => {
                              go(`/learn/${id}`);
                              if (anchor) setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ block: "start" }), 400);
                            }}
                          />
                        </Suspense>
                      </div>,
                    ],
                  ]}
                />
              </div>
            </div>

            <div className="mt-14 grid md:grid-cols-2 gap-x-10 gap-y-10">
              {(parents.length > 0 || children.length > 0 || siblings.length > 1) && (
                <section>
                  <h2 className="heading text-[18px] mb-3">Related molecules</h2>
                  <dl className="grid gap-4">
                    {(
                      [
                        ["Built from", parents],
                        ["Used in", children],
                        [`Also in ${groupOf(key)}`, siblings.filter((k) => k !== key)],
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
                  </dl>
                  <button onClick={() => showTree(key)} className="tlink mt-4 text-[13px] font-semibold">
                    See it in the family tree
                  </button>
                </section>
              )}
              {casesUsing(key).length > 0 && (
                <section>
                  <h2 className="heading text-[18px] mb-3">Used in cases</h2>
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
            </div>

            <nav aria-label="Next and previous molecule" className="mt-12 grid sm:grid-cols-2 gap-4">
              {prevKey ? (
                <button onClick={() => open(prevKey)} className="brick brick-w text-left px-5 py-4">
                  <span className="flex items-center gap-1 text-[13px] text-muted-foreground"><ChevronLeft size={14} aria-hidden /> Previous</span>
                  <span className="heading block text-[19px] mt-1">{MODELS[prevKey].name}</span>
                </button>
              ) : (
                <span />
              )}
              {nextKey && (
                <button onClick={() => open(nextKey)} className="brick brick-w text-left sm:text-right px-5 py-4">
                  <span className="flex sm:justify-end items-center gap-1 text-[13px] text-muted-foreground">Next <ChevronRight size={14} aria-hidden /></span>
                  <span className="heading block text-[19px] mt-1">{MODELS[nextKey].name}</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
