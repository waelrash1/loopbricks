import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, ExternalLink, Printer, Search, X } from "lucide-react";
import { MODELS } from "@/data/molecules";
import type { AppCase, Domain, Level } from "@/data/apps/types";
import { isBuilt } from "@/data/apps/sim";
import { ALL_CASES, DOMAINS, GUIDE, REFS, caseIn, checkResults, fieldSketch, searchApps, shortCite, type Hit } from "@/data/apps";
import { useSeen } from "@/lib/progress";
import { useSimulation } from "@/hooks/useSimulation";
import StockFlowDiagram from "@/components/StockFlowDiagram";
import CausalLoopDiagram from "@/components/CausalLoopDiagram";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import EquationsPanel from "@/components/EquationsPanel";
import Controls from "@/components/Controls";
import RunsPanel from "@/components/RunsPanel";
import { useShelf } from "@/lib/runs";
import { cn } from "@/lib/utils";
import Tabs from "@/components/Tabs";

type Nav = { onDomain: (d: string) => void; onCase: (d: string, c: string) => void };

const wrap = "page";
const h2 = "heading text-[26px] md:text-[30px]";
const sub = "heading text-[19px]";
const hint = "text-[13px] text-muted-foreground";
const smallBrick = "brick brick-w h-9 max-sm:min-h-11 px-3.5 text-[13px] font-semibold whitespace-nowrap";
const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

function RefLink({ k }: { k: string }) {
  const r = REFS[k];
  const pubmed = r.pmid && `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`;
  return (
    <li>
      {r.text}{" "}
      {(r.doi || r.url) && (
        <a href={r.doi ? `https://doi.org/${r.doi}` : r.url} target="_blank" rel="noreferrer" className="tlink whitespace-nowrap">
          {r.doi ? "DOI" : "Link"}
          <ExternalLink size={11} aria-hidden className="inline ml-0.5 -mt-0.5" />
        </a>
      )}
      {pubmed && (
        <>
          {" "}
          <a href={pubmed} target="_blank" rel="noreferrer" className="tlink">
            PubMed
          </a>
        </>
      )}
    </li>
  );
}

const levelTone: Record<Level, string> = { Starter: "bg-accent/40", Intermediate: "bg-muted", Advanced: "bg-foreground text-background" };
const LevelTag = ({ l }: { l: Level }) => <span className={cn("inline-block rounded-[5px] px-1.5 py-0.5 text-[11px] font-bold", levelTone[l])}>{l}</span>;

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block">
      <span className="sr-only">{placeholder}</span>
      <Search size={17} aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 rounded-btn border border-border bg-background pl-10 pr-3 text-[15px] placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
      />
    </label>
  );
}

// what backs a case, in one line: its model checks and how many verified sources it cites
function Backing({ domain, c }: { domain: Domain; c: AppCase }) {
  const r = checkResults(domain, c);
  const ok = r.filter((x) => x.ok).length;
  return (
    <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
      {r.length > 0 && (
        <span className={cn("inline-flex items-center gap-1 font-semibold", ok === r.length ? "text-[var(--good-ink)]" : "text-[var(--viz-pink)]")}>
          <Check size={13} strokeWidth={3} aria-hidden />
          {ok} of {r.length} checks pass
        </span>
      )}
      {r.length > 0 && <span aria-hidden>,</span>}
      <span>
        {c.refs.length} verified {c.refs.length === 1 ? "source" : "sources"}
      </span>
    </span>
  );
}

function CaseGrid({ hits, showDomain, onCase }: { hits: Hit[]; showDomain: boolean; onCase: Nav["onCase"] }) {
  const seen = useSeen();
  return (
    <ul className="mt-3 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {hits.map(({ domain, c }) => (
        <li key={domain.id + c.id} className="min-w-0">
          <button onClick={() => onCase(domain.id, c.id)} className="brick brick-w flex flex-col h-full w-full text-left p-5">
            <span className="flex items-center justify-between gap-3 text-[12px] font-semibold text-muted-foreground">
              {showDomain ? `${domain.short}: ${c.theme}` : c.theme} <LevelTag l={c.level} />
            </span>
            <span className="heading text-[19px] mt-2">
              {c.title}
              {seen.has(`${domain.id}/${c.id}`) && <Check size={15} strokeWidth={3} aria-label="opened before" className="inline ml-1.5 -mt-1 text-[var(--viz-good)]" />}
            </span>
            <span className="mt-2 text-[14px] leading-[1.5] text-muted-foreground">{c.summary}</span>
            <span className="mt-3">
              <Backing domain={domain} c={c} />
            </span>
            <span className="mt-auto pt-4 flex flex-wrap gap-1.5">
              {c.molecules.slice(0, 3).map((k) => (
                <span key={k} className="rounded-[5px] bg-background px-1.5 py-0.5 text-[11.5px] font-semibold">
                  {MODELS[k].name}
                </span>
              ))}
              {!c.sim && <span className="rounded-[5px] px-1.5 py-0.5 text-[11.5px] text-muted-foreground">Build-it-yourself</span>}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

const NoMatch = ({ query, extra }: { query: string; extra?: string }) => (
  <p className="sheet mt-3 text-[15px]">
    No case matches “{query.trim()}”{extra}. Try a broader word, such as the subject (“water”, “debt”, “hospital”) or a behaviour (“oscillation”, “growth”).
  </p>
);

// a field's signature behaviour, drawn from its own first model: real dynamics instead of decoration
function Sketch({ d }: { d: Domain }) {
  const s = useMemo(() => fieldSketch(d), [d]);
  if (!s) return null;
  const max = Math.max(1e-9, ...s.lines.flatMap((l) => l.ys));
  const n = s.lines[0].ys.length;
  return (
    <svg viewBox="0 0 200 64" className="w-full h-16 rounded-[7px] bg-background" role="img" aria-label={`Sketch of a run: ${s.title}`} preserveAspectRatio="none">
      {s.lines.map((l, i) => (
        <polyline
          key={i}
          points={l.ys.map((y, j) => `${(j / (n - 1)) * 196 + 2},${60 - (y / max) * 54}`).join(" ")}
          fill="none"
          stroke={l.color}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

export function AppsIndex({ onDomain, onCase }: Nav) {
  const [query, setQuery] = useState("");
  const hits = query.trim() ? searchApps(query) : [];
  const checks = ALL_CASES.reduce((n, { c }) => n + (c.checks?.length ?? 0), 0);

  return (
    <div className={wrap}>
      <section className="pt-10 md:pt-14 pb-8">
        <h1 className="display text-[36px] md:text-[48px]">Cases</h1>
        <p className="mt-3 text-[16px] leading-[1.55] text-foreground/80 max-w-[62ch]">
          {ALL_CASES.length} problems from published system dynamics studies, in {DOMAINS.length} fields. Each one runs here
          {checks > 0 ? ", with checks that its small model shows the lesson it claims." : "."}
        </p>
      </section>

      <div className="max-w-[640px]">
        <SearchBox value={query} onChange={setQuery} placeholder="Search all cases: epidemic, fisheries, inventory, housing" />
      </div>
      {query.trim() && (
        <>
          <p role="status" className={`${hint} mt-4`}>
            {hits.length} of {ALL_CASES.length} cases
          </p>
          {hits.length ? <CaseGrid hits={hits} showDomain onCase={onCase} /> : <NoMatch query={query} />}
        </>
      )}

      <section className="pt-10">
        <h2 className="sr-only">Fields</h2>
        <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOMAINS.map((d) => (
            <li key={d.id}>
              <button onClick={() => onDomain(d.id)} className="brick brick-w flex flex-col h-full w-full text-left p-5">
                <Sketch d={d} />
                <span className="heading text-[21px] mt-4">{d.name}</span>
                <span className="mt-2 text-[14.5px] leading-[1.5] text-muted-foreground">{d.blurb}</span>
                <span className="mt-auto pt-4 text-[13px] font-semibold">{d.cases.length} cases</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <details id="apps-guide" className="mt-16 sheet group">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
          <span>
            <span className="heading block text-[19px]">How to build a model for a real decision</span>
            <span className="block mt-1 text-[14.5px] text-muted-foreground">Twelve habits from the literature that apply to every case here.</span>
          </span>
          <ChevronRight size={20} aria-hidden className="shrink-0 transition-transform group-open:rotate-90" />
        </summary>
        <div className="mt-8">
        <ol className="grid md:grid-cols-2 gap-x-10 gap-y-7">
          {GUIDE.map((p, i) => (
            <li key={p.step} className="grid grid-cols-[36px_minmax(0,1fr)] gap-3">
              <span aria-hidden className="display text-[28px] text-accent-text leading-none">
                {i + 1}
              </span>
              <div>
                <h3 className="heading text-[17px]">{p.step}</h3>
                <p className="mt-1.5 text-[15px] leading-[1.6]">{p.detail}</p>
                <p className={`${hint} mt-1.5`}>{p.refs.map(shortCite).join("; ")}</p>
              </div>
            </li>
          ))}
        </ol>
        </div>
      </details>

      <details className="mt-4 sheet group">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
          <span>
            <span className="heading block text-[19px]">How the cases are checked</span>
            <span className="block mt-1 text-[14.5px] text-muted-foreground">Where the sources come from, what the behaviour checks test, and what they cannot prove.</span>
          </span>
          <ChevronRight size={20} aria-hidden className="shrink-0 transition-transform group-open:rotate-90" />
        </summary>
        <div className="mt-6 text-[15.5px] leading-[1.65] max-w-[70ch] space-y-3">
          <p>
            <b>The sources.</b> Every reference was matched to its PubMed or Crossref record, and every number quoted comes from the paper's abstract or full text. Each case says
            how the published study tested its own model, or that the abstract reports no test.
          </p>
          <p>
            <b>The small models.</b> Each runnable case carries behaviour checks: statements such as “ignoring the supply line overshoots more”, tested by running the model. They
            run on the case page as you open it and in the project's test script, so a case cannot claim a lesson its model does not show.
          </p>
          <p>
            <b>What the checks do not prove.</b> A small teaching model reproduces the <i>shape</i> of a published result, not its numbers. Before using any structure for a real
            decision, calibrate it to your own data and run the confidence tests in the guide above.
          </p>
        </div>
      </details>
    </div>
  );
}

export function DomainLibrary({ domain, onCase }: { domain: Domain; onCase: Nav["onCase"] }) {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<string | undefined>();
  const hits = searchApps(query, domain, theme);
  const scopes = [...new Set(domain.dataSources.map((d) => d.scope))];

  return (
    <div className={wrap}>
      <section className="pt-10 md:pt-14 pb-10 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-10 items-end">
        <div>
          <h1 className="display text-[40px] sm:text-[52px] xl:text-[60px]">{domain.name}</h1>
          <p className="mt-5 text-[18px] leading-[1.55] text-foreground/80 max-w-[52ch]">
            {domain.cases.length} cases. {domain.blurb}
          </p>
        </div>
        {domain.dataSources.length > 0 && (
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <button onClick={() => scrollTo("domain-data")} className={smallBrick}>
              Where to find data
            </button>
          </div>
        )}
      </section>

      <div className="sheet !p-3 md:!p-4 flex flex-col gap-3">
        <SearchBox value={query} onChange={setQuery} placeholder={`Search ${domain.short.toLowerCase()} cases by subject, setting or method`} />
        <div role="group" aria-label="Filter by theme" className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 md:flex-wrap">
          {[undefined, ...domain.themes].map((t) => (
            <button
              key={t ?? "all"}
              aria-pressed={theme === t}
              onClick={() => setTheme(t)}
              className={cn("brick shrink-0 h-8 max-sm:min-h-11 px-3 text-[13px] font-semibold whitespace-nowrap", theme === t ? "brick-y" : "brick-w")}
            >
              {t ?? "All themes"}
            </button>
          ))}
        </div>
      </div>

      <p role="status" className={`${hint} mt-4`}>
        {hits.length === domain.cases.length ? `All ${hits.length} cases` : `${hits.length} of ${domain.cases.length} cases`}
      </p>
      {hits.length ? <CaseGrid hits={hits} showDomain={false} onCase={onCase} /> : <NoMatch query={query} extra={theme ? ` in ${theme}; try clearing the theme filter` : ""} />}

      {domain.dataSources.length > 0 && (
        <section id="domain-data" className="pt-20">
          <h2 className={h2}>Where to find data</h2>
          <p className="mt-2 mb-8 text-[15px] leading-[1.55] text-muted-foreground max-w-[64ch]">
            Free, official sources often used to parameterise and calibrate models in this field. Each case lists the specific series it needs.
          </p>
          {scopes.map((scope) => (
            <div key={scope} className="mb-8">
              <h3 className={sub}>{scope}</h3>
              <ul className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {domain.dataSources
                  .filter((d) => d.scope === scope)
                  .map((d) => (
                    <li key={d.url}>
                      <a href={d.url} target="_blank" rel="noreferrer" className="brick brick-w block h-full p-4">
                        <span className="flex items-start justify-between gap-2 font-semibold text-[14.5px]">
                          {d.name} <ExternalLink size={14} aria-hidden className="shrink-0 mt-0.5 text-muted-foreground" />
                        </span>
                        <span className="block mt-1 text-[13px] leading-[1.5] text-muted-foreground">{d.what}</span>
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function CaseSim({ domain, c, tabs }: { domain: Domain; c: AppCase & { sim: string }; tabs: [string, string, ReactNode][] }) {
  const model = domain.models[c.sim];
  const sim = useSimulation(model);
  const shelf = useShelf(c.sim);
  const { setStopTime } = sim;
  useEffect(() => setStopTime(domain.stop[c.sim] ?? 0), [domain, c.sim, setStopTime]);
  const built = isBuilt(c.sim);
  const simTabs: [string, string, ReactNode][] = [
    ...(built
      ? ([
          [
            "loops",
            "Loops",
            <section key="l" className="sheet max-w-[900px]">
              <CausalLoopDiagram model={model} />
            </section>,
          ],
          [
            "equations",
            "Equations",
            <section key="e" className="sheet">
              <EquationsPanel model={model} modelKey={c.sim} params={sim.params} />
            </section>,
          ],
        ] as [string, string, ReactNode][])
      : []),
    ["runs", "Runs and data", <RunsPanel key="r" modelKey={c.sim} model={model} sim={sim} />],
  ];
  return (
    <div data-runs-host>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
        <div className="flex flex-col gap-5 min-w-0">
          <section className="sheet">
            <div className="sheet-head">
              <h2 className={sub}>Stock and flow diagram</h2>
              <span className={hint}>{model.name}</span>
            </div>
            <StockFlowDiagram model={model} modelKey={c.sim} subscribe={sim.subscribe} running={sim.running} showInfluences />
          </section>
          <section className="sheet">
            <div className="sheet-head">
              <h2 className={sub}>Behaviour over time</h2>
              <span className={`${hint} print:hidden`}>Pick a scenario, then press play</span>
            </div>
            <TimeSeriesChart model={model} subscribe={sim.subscribe} onClearPrevious={sim.clearPrevious} shelf={shelf} />
          </section>
        </div>
        <aside className="lg:sticky lg:top-[88px] print:hidden">
          <Controls model={model} sim={sim} presets={c.presets ?? []} />
        </aside>
      </div>
      <div className="mt-10">
        <Tabs label="About this case" items={[...tabs.slice(0, 2), ...simTabs, ...tabs.slice(2)]} />
      </div>
    </div>
  );
}

// Runs the case's behaviour checks in the page, so the claim and the proof sit side by side.
function ModelChecks({ domain, c }: { domain: Domain; c: AppCase }) {
  const results = useMemo(() => checkResults(domain, c), [domain, c]);
  if (!results.length) return null;
  const passed = results.filter((r) => r.ok).length;
  return (
    <div className="mt-5">
      <h3 className="heading text-[16px]">
        Checks on this model: {passed} of {results.length} pass
      </h3>
      <ul className="mt-2 space-y-2 text-[15px] leading-[1.5]">
        {results.map((r) => (
          <li key={r.claim} className="flex gap-2.5 items-start">
            <span className={cn("grid place-items-center w-5 h-5 rounded-[5px] shrink-0 mt-0.5 text-card", r.ok ? "bg-[var(--viz-good)]" : "bg-[var(--viz-pink)]")}>
              {r.ok ? <Check size={13} aria-label="Passes" /> : <X size={13} aria-label="Fails" />}
            </span>
            {r.claim}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Section links for a long case page; the one in view is marked

export function CasePage({ domain, id, onOpen, onCase, onDomain }: { domain: Domain; id: string; onOpen: (k: string) => void } & Nav) {
  const c = caseIn(domain, id)!;
  const i = domain.cases.indexOf(c);
  const [prev, next] = [domain.cases[i - 1], domain.cases[i + 1]];
  const tableRow = "grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-6 gap-y-0.5 py-2.5 border-t border-border first:border-t-0";
  const bullets = "mt-3 space-y-2.5 text-[15px] leading-[1.6] list-disc pl-5 marker:text-accent-edge";

  const tabs: [string, string, ReactNode][] = [
    [
      "try",
      "Try this",
      <div key="t" className="grid lg:grid-cols-2 gap-x-12 gap-y-8">
        <ol className="space-y-2.5 text-[15px] leading-[1.6] list-decimal pl-5 marker:font-bold max-w-[70ch]">
          {c.tryThis.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
        <p className="h-fit rounded-card bg-card border border-border px-5 py-4 text-[15.5px] leading-[1.6]">
          <b className="heading block text-[16px] mb-1">The dynamic lesson</b>
          {c.insight}
        </p>
      </div>,
    ],
    [
      "structure",
      "Structure",
      <div key="s" className="max-w-[900px]">
        <dl className="text-[15px] leading-[1.5]">
          {c.map.map(([a, b]) => (
            <div key={a} className={tableRow}>
              <dt className="font-semibold">{a}</dt>
              <dd className="text-foreground/85">{b}</dd>
            </div>
          ))}
        </dl>
        <h3 className="mt-6 text-[13px] text-muted-foreground mb-2">Built from these molecules (small reusable structures from the library)</h3>
        <div className="flex flex-wrap gap-2">
          {c.molecules.map((k) => (
            <button key={k} onClick={() => onOpen(k)} className={smallBrick}>
              {MODELS[k].name}
            </button>
          ))}
        </div>
      </div>,
    ],
    [
      "evidence",
      "Evidence",
      <div key="v" className="grid lg:grid-cols-2 gap-x-12 gap-y-8">
        <section>
          <h3 className="heading text-[16px]">What the studies found</h3>
          <ul className={bullets}>
            {c.evidence.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="heading text-[16px]">How it was validated</h3>
          <p className="mt-3 text-[15px] leading-[1.6]">{c.validation}</p>
          <ModelChecks domain={domain} c={c} />
        </section>
      </div>,
    ],
    [
      "data",
      "Data and advice",
      <div key="d" className="grid lg:grid-cols-2 gap-x-12 gap-y-8">
        <section>
          <h3 className="heading text-[16px]">Data you would need</h3>
          <dl className="mt-3 text-[15px] leading-[1.5]">
            {c.data.map(([a, b]) => (
              <div key={a} className={tableRow}>
                <dt className="font-semibold">{a}</dt>
                <dd className="text-foreground/85">{b}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section>
          <h3 className="heading text-[16px]">Modelling advice</h3>
          <ul className={bullets}>
            {c.practice.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      </div>,
    ],
    [
      "refs",
      `References (${c.refs.length})`,
      <ul key="r" className="text-[13.5px] leading-[1.6] text-muted-foreground space-y-1.5 max-w-[95ch]">
        {c.refs.map((k) => (
          <RefLink key={k} k={k} />
        ))}
      </ul>,
    ],
  ];

  return (
    <div className={`${wrap} pt-6 md:pt-8`}>
      <p className="text-sm text-muted-foreground mb-6">
        <a href="#/apps" className="hover:text-foreground">
          Cases
        </a>
        <span aria-hidden className="mx-2">/</span>
        <button onClick={() => onDomain(domain.id)} className="hover:text-foreground">
          {domain.short}
        </button>
        <span aria-hidden className="mx-2">/</span>
        <span className="text-foreground font-semibold">{c.theme}</span>
      </p>
      <div className="flex items-center justify-between gap-4">
        <LevelTag l={c.level} />
        <button onClick={() => window.print()} className="print:hidden inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground">
          <Printer size={15} aria-hidden /> Print as a worksheet
        </button>
      </div>
      <h1 className="display text-[30px] md:text-[44px] max-w-[30ch] mt-3 [overflow-wrap:anywhere]">{c.title}</h1>
      <p className="mt-4 text-[18px] leading-[1.55] text-foreground/80 max-w-[62ch]">{c.summary}</p>
      <p className="mt-6 max-w-[70ch] rounded-card bg-card border-l-4 border-accent px-5 py-4 text-[16px] leading-[1.55]">
        <b>The question: </b>
        {c.question}
      </p>

      {c.sim ? (
        <div className="mt-8">
          <CaseSim key={c.id} domain={domain} c={c as AppCase & { sim: string }} tabs={tabs} />
        </div>
      ) : (
        <>
          <p className="mt-8 sheet text-[15px] leading-[1.6] max-w-[75ch]">
            No small model does this case justice, so there is no simulator here. Use the molecules in Structure as building blocks and the table as your plan.
          </p>
          <div className="mt-10">
            <Tabs label="About this case" items={tabs} />
          </div>
        </>
      )}

      <nav aria-label="Next and previous case" className="mt-12 grid sm:grid-cols-2 gap-4 print:hidden">
        {prev ? (
          <button onClick={() => onCase(domain.id, prev.id)} className="brick brick-w text-left px-5 py-4">
            <span className="flex items-center gap-1 text-[13px] text-muted-foreground">
              <ChevronLeft size={14} aria-hidden /> Previous case
            </span>
            <span className="heading block text-[18px] mt-1">{prev.title}</span>
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button onClick={() => onCase(domain.id, next.id)} className="brick brick-w text-left sm:text-right px-5 py-4">
            <span className="flex sm:justify-end items-center gap-1 text-[13px]">
              Next case <ChevronRight size={14} aria-hidden />
            </span>
            <span className="heading block text-[18px] mt-1">{next.title}</span>
          </button>
        )}
      </nav>
    </div>
  );
}
