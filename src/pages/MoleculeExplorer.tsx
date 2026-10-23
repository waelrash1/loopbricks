import { Suspense, lazy, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GROUPS, MODELS } from "@/data/molecules";
import { TOUR, childrenOf, groupOf, parentsOf, useApps, useMethods } from "@/data/catalog";
import { HINTS, PRESETS } from "@/data/presets";
import { LESSONS } from "@/data/lessons";
import { MODULES } from "@/data/learn/modules";
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
import FamilyTree from "@/components/FamilyTree";
import RunsPanel from "@/components/RunsPanel";
import { useShelf } from "@/lib/runs";
import { markSeen } from "@/lib/progress";
// the course, the cases and the methods are large and only some visitors open them, so they load on demand
const LearnRoutes = lazy(() => import("@/components/LearnRoutes"));
const PythonPanel = lazy(() => import("@/components/PythonPanel"));
const LearnPanel = lazy(() => import("@/components/Learn").then((m) => ({ default: m.LearnPanel })));
const AppsIndex = lazy(() => import("@/components/Apps").then((m) => ({ default: m.AppsIndex })));
const CasePage = lazy(() => import("@/components/Apps").then((m) => ({ default: m.CasePage })));
const DomainLibrary = lazy(() => import("@/components/Apps").then((m) => ({ default: m.DomainLibrary })));
const MethodsIndex = lazy(() => import("@/components/Methods").then((m) => ({ default: m.MethodsIndex })));
const MethodsPage = lazy(() => import("@/components/Methods").then((m) => ({ default: m.MethodsPage })));

// The address bar is the source of truth, so Back/Forward and shared links work. Four sections:
//   Learn:   #/learn[/<module>[/<id>]] the course and practice pages, #/tour/<n> the molecule tour, #/methods[/<page>]
//   Library: #/library all molecules, #/m/<key> one molecule, #/tree[/<key>] the family tree
//   Cases:   #/apps[/<field>[/<id>]]
//   Build:   #/build (also #/learn/build)
// #/ is the home page. Every older address still resolves; one that does not says so instead of failing silently.
type Route = ({ view: "home" } | { view: "map"; missing?: string } | { view: "molecule"; key: string } | { view: "learn"; idx: number } | { view: "apps"; domain?: string; id?: string } | { view: "tree"; key?: string } | { view: "methods"; page?: string } | { view: "course"; module?: string; id?: string }) & { note?: string };
const q = (s: string) => `\u201c${decodeURIComponent(s)}\u201d`;
function parseRoute(): Route {
  const [, a, b, c] = window.location.hash.split("/");
  if (!a) return { view: "home" };
  if (a === "library") return { view: "map" };
  if (a === "m" && MODELS[b]) return { view: "molecule", key: b };
  if (a === "tour") return TOUR[Number(b) - 1] ? { view: "learn", idx: Number(b) - 1 } : { view: "learn", idx: 0, note: `There is no tour step called ${q(b ?? "")}. Here is the first one.` };
  if (a === "learn") return { view: "course", module: b || undefined, id: c || undefined };
  if (a === "build") return { view: "course", module: "build" };
  // the old chapter-by-chapter study guide now lives in the course
  if (a === "methods" && b === "book") return { view: "course" };
  // methods and cases are checked once their data has loaded
  if (a === "methods") return { view: "methods", page: b || undefined };
  if (a === "tree") return { view: "tree", key: MODELS[b] ? b : undefined, note: b && !MODELS[b] ? `There is no molecule called ${q(b)}.` : undefined };
  if (a === "apps") return { view: "apps", domain: b || undefined, id: c || undefined };
  // a link to a molecule that doesn't exist lands in the library with a note, not silently
  return a === "m" ? { view: "map", missing: b || undefined } : { view: "home", note: `There is no page called ${q("#/" + a)}. Here is the home page.` };
}
const sectionOf = (r: Route): Section =>
  r.view === "home" ? "home" : r.view === "apps" ? "cases" : r.view === "course" && r.module === "build" ? "build" : r.view === "learn" || r.view === "course" || r.view === "methods" ? "learn" : "library";

// The pages inside Learn, grouped so the top row stays short: Practice and Reference open a second row.
type Tab = [label: string, hash: string, on: (r: Route) => boolean, items?: Tab[]];
const inCourse = (...mods: string[]) => (r: Route) => r.view === "course" && mods.includes(r.module ?? "");
const PRACTICE: Tab[] = [
  ["Games", "/learn/games", inCourse("games")],
  ["Draw the loops", "/learn/draw", inCourse("draw")],
  ["Modelling studio", "/learn/studio", inCourse("studio")],
  ["Capstone projects", "/learn/projects", inCourse("projects")],
];
const REFERENCE: Tab[] = [
  ["Methods", "/methods", (r) => r.view === "methods"],
  ["Glossary", "/learn/glossary", inCourse("glossary")],
  ["Reading list", "/learn/references", inCourse("references")],
];
const INSTRUCTORS = ["teach", "progress", "assigned", "review", "check"];
const LEARN_TABS: Tab[] = [
  ["Course", "/learn", (r) => r.view === "course" && ![...PRACTICE, ...REFERENCE].some(([, , on]) => on(r)) && !INSTRUCTORS.includes(r.module ?? "")],
  ["Molecule tour", "/tour/1", (r) => r.view === "learn"],
  ["Practice", PRACTICE[0][1], (r) => PRACTICE.some(([, , on]) => on(r)), PRACTICE],
  ["Reference", REFERENCE[0][1], (r) => REFERENCE.some(([, , on]) => on(r)), REFERENCE],
  ["For instructors", "/learn/teach", inCourse(...INSTRUCTORS)],
];
// on a phone the row scrolls; the fade at the right edge says there is more
const tabRow = "page flex gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,black_85%,transparent)] sm:[mask-image:none]";
function LearnTabs({ route }: { route: Route }) {
  const sub = LEARN_TABS.find(([, , on, items]) => items && on(route))?.[3];
  return (
    <nav aria-label="Learn" className="print:hidden border-b border-border bg-card/60">
      <div className={tabRow}>
        {LEARN_TABS.map(([label, hash, on, items]) => (
          <a key={label} href={"#" + hash} aria-current={on(route) && !items ? "page" : undefined} className={cn("h-11 inline-flex items-center px-3 text-[14px] font-semibold rounded-t-[8px] border-b-2", on(route) ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {label}
          </a>
        ))}
      </div>
      {sub && (
        <div className={cn(tabRow, "gap-2 pb-2")}>
          {sub.map(([label, hash, on]) => (
            <a key={hash} href={"#" + hash} aria-current={on(route) ? "page" : undefined} className={cn("h-11 sm:h-9 inline-flex items-center px-3 text-[13.5px] font-semibold rounded-btn", on(route) ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

const go = (hash: string) => {
  window.location.hash = hash;
};

// While a chunk of the app loads: the shape of a page, not a word.
const Skeleton = ({ small }: { small?: boolean }) => (
  <div role="status" className={small ? "" : "page pt-8 md:pt-12"}>
    <span className="sr-only">Loading</span>
    {!small && (
      <>
        <div className="h-10 md:h-12 w-2/3 max-w-[520px] rounded-[8px] bg-muted animate-pulse" />
        <div className="mt-5 h-4 max-w-[600px] rounded bg-muted animate-pulse" />
        <div className="mt-2.5 h-4 w-4/5 max-w-[480px] rounded bg-muted animate-pulse" />
      </>
    )}
    <div className={cn("grid sm:grid-cols-2 lg:grid-cols-3 gap-4", !small && "mt-10")}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-40 rounded-card bg-muted/70 animate-pulse" />
      ))}
    </div>
  </div>
);
// "There is no ... called ...": a bad link says what went wrong, then shows the nearest real page
const Note = ({ children }: { children: ReactNode }) => (
  <div className="page pt-6 md:pt-8">
    <p role="alert" className="sheet text-[15px]">
      {children}
    </p>
  </div>
);

export default function MoleculeExplorer() {
  const [route, setRoute] = useState(parseRoute);
  const [showInfluences, setShowInfluences] = useState(true);
  useEffect(() => {
    // remember the last thing worth returning to, for "Pick up where you left off" on the home page
    if (route.view === "molecule" || (route.view === "apps" && route.id) || (route.view === "course" && route.module)) {
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

  // data that loads on demand: cases for the case pages and a molecule's "Used in cases", methods for their pages
  const apps = useApps(route.view === "apps" || route.view === "molecule");
  const methods = useMethods(route.view === "methods");
  const domain = route.view === "apps" ? apps?.domainById(route.domain) : undefined;
  const theCase = route.view === "apps" ? apps?.caseIn(domain, route.id) : undefined;
  const method = route.view === "methods" ? methods?.METHOD_PAGES.find((p) => p.id === route.page) : undefined;
  const note =
    route.note ??
    (route.view === "apps" && apps
      ? route.domain && !domain
        ? `There is no field called ${q(route.domain)}. Here are all the cases.`
        : domain && route.id && !theCase
          ? `There is no case called ${q(route.id)} in ${domain.name}. Here are its cases.`
          : undefined
      : route.view === "methods" && methods && route.page && !method
        ? `There is no method called ${q(route.page)}. Here are all the methods.`
        : undefined);

  // every page has its own title, so tabs, history and bookmarks can tell them apart
  useEffect(() => {
    const learnTab = [...LEARN_TABS, ...PRACTICE, ...REFERENCE].find(([, , on, items]) => !items && on(route))?.[0];
    const name =
      route.view === "home" ? "" :
      route.view === "map" ? "Library" :
      route.view === "molecule" ? MODELS[route.key].name :
      route.view === "learn" ? `Molecule tour, step ${route.idx + 1}: ${MODELS[TOUR[route.idx]].name}` :
      route.view === "tree" ? "Family tree" :
      route.view === "methods" ? (method?.title ?? "Methods") :
      route.view === "apps" ? (theCase?.title ?? domain?.name ?? "Cases") :
      route.module === "build" ? "Build" :
      (MODULES.find((m) => m.id === route.module)?.title ?? learnTab ?? "Course");
    document.title = name ? `${name} | LoopBricks` : "LoopBricks: system dynamics, one building block at a time";
  }, [route, method, theCase, domain]);

  // after a route change, focus moves to the new page's heading so a screen reader announces it;
  // lazy pages render a moment later, so look for it for up to a second
  const firstRoute = useRef(true);
  useEffect(() => {
    if (firstRoute.current) return void (firstRoute.current = false);
    let tries = 0;
    const timer = setInterval(() => {
      const h1 = document.querySelector<HTMLElement>("main h1");
      if (!h1 && ++tries < 20) return;
      clearInterval(timer);
      if (h1 && !h1.hasAttribute("tabindex")) h1.tabIndex = -1;
      (h1 ?? document.getElementById("main"))?.focus({ preventScroll: true });
    }, 50);
    return () => clearInterval(timer);
  }, [route]);

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
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || view === "home" || view === "map" || view === "apps" || view === "tree" || view === "methods" || view === "course") return;
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
        <span className={hint}>{HINTS[key] ?? "Press play, or Space"}</span>
      </div>
      <TimeSeriesChart model={model} subscribe={sim.subscribe} onClearPrevious={sim.clearPrevious} shelf={shelf} />
    </section>
  );
  const bench = "grid lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start";
  const wrap = "page";
  const siblings = GROUPS.find((g) => g.keys.includes(key))?.keys ?? [];
  const smallBrick = "brick brick-w inline-flex items-center h-11 sm:h-9 px-3.5 text-[13px] font-semibold whitespace-nowrap";

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
        {note && <Note>{note}</Note>}
        {view === "home" ? (
          <Home go={go} />
        ) : view === "map" ? (
          <MoleculeMap onTree={() => showTree()} missing={route.view === "map" ? route.missing : undefined} />
        ) : route.view === "course" ? (
          <Suspense fallback={<Skeleton />}>
            <LearnRoutes page={route.module} id={route.id} go={go} />
          </Suspense>
        ) : route.view === "methods" ? (
          <Suspense fallback={<Skeleton />}>
            {!methods ? (
              <Skeleton />
            ) : method ? (
              <MethodsPage key={method.id} id={method.id} onPage={(p) => showMethods(p || undefined)} onOpen={(h) => go(h)} />
            ) : (
              <MethodsIndex onPage={showMethods} onBook={() => go("/learn")} />
            )}
          </Suspense>
        ) : route.view === "tree" ? (
          // on a large screen the tree view is exactly one window tall, so the whole map is visible at once
          <div className="px-4 md:px-8 pt-4 pb-4 lg:h-[calc(100dvh-4rem)] flex flex-col gap-3">
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
          <Suspense fallback={<Skeleton />}>
            {!apps ? (
              <Skeleton />
            ) : !domain ? (
              <AppsIndex onDomain={openDomain} onCase={openCase} />
            ) : theCase ? (
              <CasePage key={domain.id + theCase.id} domain={domain} id={theCase.id} onOpen={open} onCase={openCase} onDomain={openDomain} />
            ) : (
              <DomainLibrary key={domain.id} domain={domain} onCase={openCase} />
            )}
          </Suspense>
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
                    <a href={`#/m/${key}`} className="tlink text-[13px] font-semibold">
                      Open the full molecule
                    </a>
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
                <a href="#/library" className="hover:text-foreground">
                  Library
                </a>
                <span aria-hidden className="mx-2">/</span>
                <span className="text-foreground font-semibold">{groupOf(key)}</span>
              </p>
              <nav aria-label="Neighbouring molecules" className="flex items-center gap-2">
                <span className="mr-2">
                  {pos + 1} of {TOUR.length}
                </span>
                {(
                  [
                    [prevKey, "Previous", ChevronLeft],
                    [nextKey, "Next", ChevronRight],
                  ] as const
                ).map(([k, label, Icon]) =>
                  k ? (
                    <a key={label} href={`#/m/${k}`} className="brick brick-w w-11 h-11 sm:w-9 sm:h-9 grid place-items-center text-foreground" aria-label={`${label}: ${MODELS[k].name}`} title={MODELS[k].name}>
                      <Icon size={17} aria-hidden />
                    </a>
                  ) : (
                    <span key={label} aria-hidden className="brick brick-w w-11 h-11 sm:w-9 sm:h-9 grid place-items-center opacity-40">
                      <Icon size={17} />
                    </span>
                  )
                )}
              </nav>
            </div>

            <h1 className="display text-[30px] sm:text-[36px] md:text-[44px] max-w-[26ch] [overflow-wrap:break-word]">{model.title}</h1>
            <p className="mt-3 text-[17px] leading-[1.55] text-foreground/80 max-w-[70ch]">{model.lede}</p>

            <div data-runs-host className="mt-7">
              <div className={bench}>
                <div className="flex flex-col gap-5 min-w-0">
                  <section className="sheet">
                    <div className="sheet-head">
                      <h2 className={h2}>Stock and flow diagram</h2>
                      <label className={`flex items-center gap-2 min-h-11 sm:min-h-0 pr-2 cursor-pointer select-none ${hint}`}>
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
                        <Suspense fallback={<Skeleton small />}>
                          <PythonPanel molecule={key} onOpen={(h) => go(h)} />
                        </Suspense>
                      </div>,
                    ],
                    [
                      "course",
                      "In the course",
                      <div key="c" className={inTab}>
                        <Suspense fallback={<Skeleton small />}>
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
                                <a key={k} href={`#/m/${k}`} className={smallBrick}>
                                  {MODELS[k].name}
                                </a>
                              ))}
                            </dd>
                          </div>
                        )
                    )}
                  </dl>
                  <a href={`#/tree/${key}`} className="tlink inline-block mt-4 text-[13px] font-semibold">
                    See it in the family tree
                  </a>
                </section>
              )}
              {apps && apps.casesUsing(key).length > 0 && (
                <section>
                  <h2 className="heading text-[18px] mb-3">Used in cases</h2>
                  <div className="flex flex-wrap gap-2">
                    {apps.casesUsing(key).map(({ domain, c }) => (
                      <a key={domain.id + c.id} href={`#/apps/${domain.id}/${c.id}`} className="brick brick-w px-3.5 py-2 text-[13px] font-semibold text-left">
                        <span className="block text-[11.5px] font-normal text-muted-foreground">{domain.short}</span>
                        {c.title}
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <nav aria-label="Next and previous molecule" className="mt-12 grid sm:grid-cols-2 gap-4">
              {prevKey ? (
                <a href={`#/m/${prevKey}`} className="brick brick-w text-left px-5 py-4">
                  <span className="flex items-center gap-1 text-[13px] text-muted-foreground"><ChevronLeft size={14} aria-hidden /> Previous</span>
                  <span className="heading block text-[19px] mt-1">{MODELS[prevKey].name}</span>
                </a>
              ) : (
                <span />
              )}
              {nextKey && (
                <a href={`#/m/${nextKey}`} className="brick brick-w text-left sm:text-right px-5 py-4">
                  <span className="flex sm:justify-end items-center gap-1 text-[13px] text-muted-foreground">Next <ChevronRight size={14} aria-hidden /></span>
                  <span className="heading block text-[19px] mt-1">{MODELS[nextKey].name}</span>
                </a>
              )}
            </nav>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
