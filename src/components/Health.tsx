import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Search } from "lucide-react";
import { MODELS } from "@/data/molecules";
import { HEALTH_MODELS, SIM_STOP, isBuilt } from "@/data/health/models";
import { CASES, DATA_SOURCES, PRACTICE, REFS, THEMES, caseById, searchCases, shortCite, type HealthCase, type Theme } from "@/data/health/cases";
import { useSimulation } from "@/hooks/useSimulation";
import StockFlowDiagram from "@/components/StockFlowDiagram";
import CausalLoopDiagram from "@/components/CausalLoopDiagram";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import EquationsPanel from "@/components/EquationsPanel";
import Controls from "@/components/Controls";
import { cn } from "@/lib/utils";

const wrap = "max-w-[1320px] mx-auto px-4 md:px-8";
const h2 = "heading text-[26px] md:text-[30px]";
const sub = "heading text-[19px]";
const hint = "text-[13px] text-muted-foreground";
const smallBrick = "brick brick-w h-9 px-3.5 text-[13px] font-semibold whitespace-nowrap";
const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

function RefLink({ k }: { k: string }) {
  const r = REFS[k];
  const href = r.doi ? `https://doi.org/${r.doi}` : r.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/` : r.url;
  return (
    <li>
      {r.text}{" "}
      {href && (
        <a href={href} target="_blank" rel="noreferrer" className="tlink whitespace-nowrap">
          {r.doi ? "DOI" : "PubMed"}
          <ExternalLink size={11} aria-hidden className="inline ml-0.5 -mt-0.5" />
        </a>
      )}
      {r.doi && r.pmid && (
        <>
          {" · "}
          <a href={`https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`} target="_blank" rel="noreferrer" className="tlink">
            PubMed
          </a>
        </>
      )}
    </li>
  );
}

const levelTone: Record<HealthCase["level"], string> = { Starter: "bg-accent/40", Intermediate: "bg-muted", Advanced: "bg-foreground text-white" };
const Level = ({ l }: { l: HealthCase["level"] }) => <span className={cn("inline-block rounded-[5px] px-1.5 py-0.5 text-[11px] font-bold", levelTone[l])}>{l}</span>;

export function HealthLibrary({ onOpen }: { onOpen: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<Theme | undefined>();
  const results = searchCases(query, theme);

  return (
    <div className={wrap}>
      <section className="pt-10 md:pt-14 pb-10 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-10 items-end">
        <div>
          <h1 className="display text-[40px] sm:text-[52px] xl:text-[60px]">Healthcare and population health</h1>
          <p className="mt-5 text-[18px] leading-[1.55] text-foreground/80 max-w-[52ch]">
            {CASES.length} cases from published system dynamics work, from outbreaks to hospital beds. Each one runs in the browser, maps the model to the real system, and lists the
            data you would need and the studies behind it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button onClick={() => scrollTo("hc-practice")} className={smallBrick}>
            How to build a health model
          </button>
          <button onClick={() => scrollTo("hc-data")} className={smallBrick}>
            Where to find data
          </button>
        </div>
      </section>

      <div className="sheet !p-3 md:!p-4 flex flex-col gap-3">
        <label className="relative block">
          <span className="sr-only">Search healthcare applications</span>
          <Search size={17} aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by condition, setting or method: diabetes, beds, vaccine, workforce…"
            className="w-full h-12 rounded-btn border border-border bg-background pl-10 pr-3 text-[15px] placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </label>
        <div role="group" aria-label="Filter by theme" className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 md:flex-wrap">
          {[undefined, ...THEMES].map((t) => (
            <button
              key={t ?? "all"}
              aria-pressed={theme === t}
              onClick={() => setTheme(t)}
              className={cn("brick shrink-0 h-8 px-3 text-[13px] font-semibold whitespace-nowrap", theme === t ? "brick-y" : "brick-w")}
            >
              {t ?? "All themes"}
            </button>
          ))}
        </div>
      </div>

      <p role="status" className={`${hint} mt-4`}>
        {results.length === CASES.length ? `All ${CASES.length} cases` : `${results.length} of ${CASES.length} cases`}
      </p>
      {results.length ? (
        <ul className="mt-3 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map((c) => (
            <li key={c.id} className="min-w-0">
              <button onClick={() => onOpen(c.id)} className="brick brick-w flex flex-col h-full w-full text-left p-5">
                <span className="flex items-center justify-between gap-3 text-[12px] font-semibold text-muted-foreground">
                  {c.theme} <Level l={c.level} />
                </span>
                <span className="heading text-[19px] mt-2">{c.title}</span>
                <span className="mt-2 text-[14px] leading-[1.5] text-muted-foreground">{c.summary}</span>
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
      ) : (
        <p className="sheet mt-3 text-[15px]">
          No case matches “{query.trim()}”{theme ? ` in ${theme}` : ""}. Try a broader word such as “hospital”, “infection” or “prevention”
          {theme ? ", or clear the theme filter" : ""}.
        </p>
      )}

      <section id="hc-practice" className="pt-20">
        <h2 className={h2}>How to build a health model</h2>
        <p className="mt-2 mb-8 text-[15px] leading-[1.55] text-muted-foreground max-w-[64ch]">
          Twelve habits drawn from the system dynamics and health-services literature. They apply whether you are modelling a ward or a nation.
        </p>
        <ol className="grid md:grid-cols-2 gap-x-10 gap-y-7">
          {PRACTICE.map((p, i) => (
            <li key={p.step} className="grid grid-cols-[36px_minmax(0,1fr)] gap-3">
              <span aria-hidden className="display text-[28px] text-accent-edge leading-none">
                {i + 1}
              </span>
              <div>
                <h3 className="heading text-[17px]">{p.step}</h3>
                <p className="mt-1.5 text-[15px] leading-[1.6]">{p.detail}</p>
                <p className={`${hint} mt-1.5`}>
                  {p.refs.map(shortCite).join("; ")}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="hc-data" className="pt-20">
        <h2 className={h2}>Where to find data</h2>
        <p className="mt-2 mb-8 text-[15px] leading-[1.55] text-muted-foreground max-w-[64ch]">
          Free, official sources most often used to parameterise and calibrate health models. Each case lists the specific series it needs.
        </p>
        {(["Population health", "Health services"] as const).map((scope) => (
          <div key={scope} className="mb-8">
            <h3 className={sub}>{scope}</h3>
            <ul className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DATA_SOURCES.filter((d) => d.scope === scope).map((d) => (
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

      <section className="pt-12">
        <h2 className={sub}>Reviews to read next</h2>
        <ul className="mt-3 text-[13.5px] leading-[1.6] text-muted-foreground space-y-1.5 max-w-[90ch]">
          {["homerHirsch2006", "darabi2020", "davahli2020", "atkinson2015", "marshall2015", "sterman2006"].map((k) => (
            <RefLink key={k} k={k} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function CaseSim({ c }: { c: HealthCase & { sim: string } }) {
  const model = HEALTH_MODELS[c.sim];
  const sim = useSimulation(model);
  const built = isBuilt(c.sim);
  const { setStopTime } = sim;
  useEffect(() => setStopTime(SIM_STOP[c.sim] ?? 0), [c.sim, setStopTime]);
  return (
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
            <span className={hint}>Pick a scenario, then press play</span>
          </div>
          <TimeSeriesChart model={model} subscribe={sim.subscribe} />
        </section>
        {built && (
          <>
            <section className="sheet">
              <div className="sheet-head">
                <h2 className={sub}>Causal loop diagram</h2>
              </div>
              <CausalLoopDiagram model={model} />
            </section>
            <section className="sheet">
              <div className="sheet-head">
                <h2 className={sub}>Equations</h2>
              </div>
              <EquationsPanel model={model} modelKey={c.sim} params={sim.params} />
            </section>
          </>
        )}
      </div>
      <aside className="lg:sticky lg:top-[88px]">
        <Controls model={model} sim={sim} presets={c.presets ?? []} />
      </aside>
    </div>
  );
}

export function HealthCasePage({ id, onOpen, onCase, onLibrary }: { id: string; onOpen: (k: string) => void; onCase: (id: string) => void; onLibrary: () => void }) {
  const c = caseById(id)!;
  const i = CASES.indexOf(c);
  const [prev, next] = [CASES[i - 1], CASES[i + 1]];
  const tableRow = "grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-6 gap-y-0.5 py-2.5 border-t border-border first:border-t-0";

  return (
    <div className={`${wrap} pt-6 md:pt-8`}>
      <p className="text-sm text-muted-foreground mb-6">
        <button onClick={onLibrary} className="hover:text-foreground">
          Healthcare
        </button>
        <span aria-hidden className="mx-2">/</span>
        <span className="text-foreground font-semibold">{c.theme}</span>
      </p>
      <div className="flex items-center gap-3 mb-3">
        <Level l={c.level} />
      </div>
      <h1 className="display text-[36px] md:text-[54px] max-w-[24ch]">{c.title}</h1>
      <p className="mt-4 text-[18px] leading-[1.55] text-foreground/80 max-w-[62ch]">{c.summary}</p>
      <p className="mt-6 max-w-[70ch] rounded-card bg-accent/25 px-5 py-4 text-[16px] leading-[1.55]">
        <b>The question: </b>
        {c.question}
      </p>

      <div className="mt-10">
        {c.sim ? (
          <CaseSim key={c.id} c={c as HealthCase & { sim: string }} />
        ) : (
          <p className="sheet text-[15px] leading-[1.6] max-w-[75ch]">
            No small model does this case justice, so there is no simulator here. Use the molecules below as building blocks and the structure table as your plan.
          </p>
        )}
      </div>

      <div className="mt-14 grid lg:grid-cols-2 gap-x-12 gap-y-12">
        <section>
          <h2 className={sub}>How the model maps to the real system</h2>
          <dl className="mt-3 text-[15px] leading-[1.5]">
            {c.map.map(([a, b]) => (
              <div key={a} className={tableRow}>
                <dt className="font-semibold">{a}</dt>
                <dd className="text-foreground/85">{b}</dd>
              </div>
            ))}
          </dl>
          <h3 className="mt-6 text-[13px] text-muted-foreground mb-2">Built from these molecules</h3>
          <div className="flex flex-wrap gap-2">
            {c.molecules.map((k) => (
              <button key={k} onClick={() => onOpen(k)} className={smallBrick}>
                {MODELS[k].name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className={sub}>What the studies found</h2>
          <ul className="mt-3 space-y-3 text-[15px] leading-[1.6] list-disc pl-5 marker:text-accent-edge">
            {c.evidence.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="mt-6 rounded-card bg-card border border-border px-5 py-4 text-[15.5px] leading-[1.6]">
            <b className="heading block text-[16px] mb-1">The dynamic lesson</b>
            {c.insight}
          </p>
        </section>

        <section>
          <h2 className={sub}>Try this</h2>
          <ol className="mt-3 space-y-2.5 text-[15px] leading-[1.6] list-decimal pl-5 marker:font-bold">
            {c.tryThis.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className={sub}>Modelling advice</h2>
          <ul className="mt-3 space-y-2.5 text-[15px] leading-[1.6] list-disc pl-5 marker:text-accent-edge">
            {c.practice.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-12">
        <h2 className={sub}>Data you would need</h2>
        <dl className="mt-3 text-[15px] leading-[1.5] max-w-[110ch]">
          {c.data.map(([a, b]) => (
            <div key={a} className={tableRow}>
              <dt className="font-semibold">{a}</dt>
              <dd className="text-foreground/85">{b}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12">
        <h2 className={sub}>References</h2>
        <ul className="mt-3 text-[13.5px] leading-[1.6] text-muted-foreground space-y-1.5 max-w-[95ch]">
          {c.refs.map((k) => (
            <RefLink key={k} k={k} />
          ))}
        </ul>
      </section>

      <nav aria-label="Next and previous case" className="mt-12 grid sm:grid-cols-2 gap-4">
        {prev ? (
          <button onClick={() => onCase(prev.id)} className="brick brick-w text-left px-5 py-4">
            <span className="flex items-center gap-1 text-[13px] text-muted-foreground">
              <ChevronLeft size={14} aria-hidden /> Previous case
            </span>
            <span className="heading block text-[18px] mt-1">{prev.title}</span>
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button onClick={() => onCase(next.id)} className="brick brick-y text-left sm:text-right px-5 py-4">
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
