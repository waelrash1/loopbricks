import { useEffect, useState } from "react";
import { Check, ExternalLink, Printer } from "lucide-react";
import { STUDIO, studioById, type Kind, type StudioCase } from "@/data/learn/studio";
import { refFor, refUrl } from "@/data/learn/readings";
import { DrawBoard } from "@/components/LearnExtras";
import { markSeen, useSeen } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { loadModel, saveModel, type BModel } from "@/lib/builder";

const wrap = "page";
const load = <T,>(k: string, d: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : d;
  } catch {
    return d;
  }
};
const save = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* storage blocked: kept for this visit only */
  }
};

// The stages of a practice brief, in the order of the modelling process (Sterman 2000, ch. 3).
const STAGES = [
  ["brief", "The situation", "Read the brief, the people involved and the evidence."],
  ["articulate", "Articulate the problem", "Behaviour over time, purpose, horizon and reference mode: the pattern over time the model must explain."],
  ["boundary", "Set the boundary", "What the model explains, takes as given and leaves out."],
  ["loops", "Draw the feedback", "A causal loop diagram, checked against a model answer."],
  ["stocks", "Map stocks and flows", "Sort the variables, then write the equations."],
  ["policies", "Test policies and critique", "What to try in a model, and where the framing is weakest."],
] as const;

function Crumb({ go, here }: { go: (h: string) => void; here?: string }) {
  return (
    <p className="text-sm text-muted-foreground mb-6 print:hidden">
      <button onClick={() => go("/learn")} className="hover:text-foreground">
        Learn
      </button>
      <span aria-hidden className="mx-2">/</span>
      {here ? (
        <>
          <button onClick={() => go("/learn/studio")} className="hover:text-foreground">
            Modelling studio
          </button>
          <span aria-hidden className="mx-2">/</span>
          <span className="text-foreground">{here}</span>
        </>
      ) : (
        <span className="text-foreground">Modelling studio</span>
      )}
    </p>
  );
}

export function StudioIndex({ go }: { go: (h: string) => void }) {
  const seen = useSeen();
  return (
    <div className={`${wrap} pt-6 md:pt-8`}>
      <Crumb go={go} />
      <h1 className="display text-[32px] md:text-[44px] max-w-[18ch]">Modelling studio</h1>
      <p className="mt-3 text-[16.5px] leading-[1.6] text-foreground/85 max-w-[64ch]">
        Practise the part of modelling that textbooks cover least: turning a messy situation into a clear problem, a defensible boundary and a feedback structure. Each practice brief gives you
        a brief, people who disagree and some data. You work through the first steps of the modelling process and compare your answer with a model answer at every step.
      </p>

      <ol className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 max-w-[980px]">
        {STAGES.map(([, title, what], i) => (
          <li key={title} className="flex gap-3">
            <span className="display text-[22px] leading-none text-accent-text w-6 shrink-0">{i + 1}</span>
            <span>
              <span className="heading block text-[15.5px]">{title}</span>
              <span className="block text-[14px] text-muted-foreground leading-[1.5]">{what}</span>
            </span>
          </li>
        ))}
      </ol>

      <h2 className="heading text-[22px] mt-12">Practice briefs</h2>
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        {STUDIO.map((c) => (
          <button key={c.id} onClick={() => go(`/learn/studio/${c.id}`)} className="brick brick-w text-left p-5 flex flex-col">
            <span className="flex items-center justify-between gap-2 text-[13px] font-semibold text-accent-text">
              {c.field}
              {seen.has(`done:studio/${c.id}`) && <Check size={16} strokeWidth={3} aria-label="done" className="text-[var(--viz-good)]" />}
            </span>
            <span className="heading text-[19px] mt-1">{c.title}</span>
            <span className="mt-2 text-[14.5px] leading-[1.55] text-muted-foreground line-clamp-3">{c.brief}</span>
            <span className="mt-auto pt-3 text-[13px] text-muted-foreground">
              {c.cld.vars.length} variables, {c.cld.loops.length} loops, {c.stocks.length} stocks to map
            </span>
          </button>
        ))}
      </div>
      <p className="mt-6 text-[13.5px] text-muted-foreground max-w-[80ch]">
        The organisations and figures in these briefs are invented for practice. The structures follow published studies, listed at the end of each brief and in the{" "}
        <button onClick={() => go("/learn/references")} className="tlink font-semibold text-foreground">
          reading list
        </button>
        .
      </p>
    </div>
  );
}

// a small line for one series, with its first and last values; each series keeps its own scale
function Spark({ values }: { values: number[] }) {
  const W = 120, H = 32, lo = Math.min(...values), hi = Math.max(...values), span = hi - lo || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * (W - 8) + 4},${H - 4 - ((v - lo) / span) * (H - 8)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden className="block">
      <polyline points={pts} fill="none" stroke="hsl(var(--foreground))" strokeWidth={1.8} strokeLinejoin="round" />
      <circle cx={pts.split(" ").at(-1)!.split(",")[0]} cy={pts.split(" ").at(-1)!.split(",")[1]} r={2.6} fill="hsl(var(--foreground))" />
    </svg>
  );
}

function Evidence({ e }: { e: StudioCase["evidence"] }) {
  return (
    <figure className="sheet">
      <figcaption className="heading text-[15.5px]">{e.title}</figcaption>
      <p className="text-[13px] text-muted-foreground">{e.unit}</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-[13.5px] tabular-nums">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left font-semibold py-1.5 pr-3">Series</th>
              <th className="py-1.5 pr-3 sr-only md:not-sr-only text-left font-semibold">Trend</th>
              {e.x.map((x) => (
                <th key={x} className="text-right font-semibold py-1.5 px-2 whitespace-nowrap">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {e.series.map((s) => (
              <tr key={s.name} className="border-t border-border">
                <th scope="row" className="text-left font-semibold py-2 pr-3 whitespace-nowrap">
                  {s.name}
                </th>
                <td className="py-2 pr-3 hidden md:table-cell">
                  <Spark values={s.values} />
                </td>
                {s.values.map((v, i) => (
                  <td key={i} className="text-right py-2 px-2">
                    {v.toLocaleString("en-GB")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12.5px] text-muted-foreground">{e.note}</p>
    </figure>
  );
}

// a written answer, saved in this browser, with the model answer behind a disclosure
function Answer({ label, value, onChange, model }: { label: string; value: string; onChange: (v: string) => void; model: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <label className="grid gap-1.5">
        <span className="heading text-[16px] leading-snug">{label}</span>
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder="Your answer" className="rounded-[8px] border border-border bg-background px-3 py-2 text-[15px] leading-[1.55] placeholder:text-muted-foreground" />
      </label>
      <details className="group">
        <summary className="cursor-pointer text-[13.5px] font-semibold underline underline-offset-2 w-fit">Compare with a model answer</summary>
        <div className="mt-2 border-l-4 border-accent-edge pl-4 text-[15px] leading-[1.6] max-w-[75ch]">{model}</div>
      </details>
    </div>
  );
}

const KINDS: Kind[] = ["Stock", "Flow", "Auxiliary", "Constant"];

function SortDrill({ c, onSolved }: { c: StudioCase; onSolved: () => void }) {
  const [pick, setPick] = useState<Record<string, Kind | "">>({});
  const [checked, setChecked] = useState(false);
  const right = c.sorting.filter((v) => pick[v.name] === v.kind).length;
  return (
    <div className="sheet">
      <p className="text-[14.5px] leading-[1.6] max-w-[75ch]">
        For each variable, decide what kind it is. A stock is something you could count if time stopped; a flow is a rate that changes a stock; an auxiliary is worked out from
        other variables at each moment; a constant does not change over the horizon. Some answers depend on how you set the model up: the model answer says why.
      </p>
      <ul className="mt-4 grid gap-2">
        {c.sorting.map((v) => {
          const ok = pick[v.name] === v.kind;
          return (
            <li key={v.name} className="grid sm:grid-cols-[minmax(0,1fr)_auto] gap-2 items-center border-t border-border pt-2">
              <span className="text-[15px]">
                {v.name}
                {checked && (
                  <span className={cn("ml-2 text-[13px] font-semibold", ok ? "text-[var(--viz-good)]" : "text-[var(--viz-pink)]")}>
                    {ok ? `Right, in ${v.unit}` : pick[v.name] ? `Not ${pick[v.name].toLowerCase()}` : "Not answered"}
                  </span>
                )}
              </span>
              <span role="radiogroup" aria-label={`Kind of ${v.name}`} className="flex flex-wrap gap-1">
                {KINDS.map((k) => (
                  <button
                    key={k}
                    role="radio"
                    aria-checked={pick[v.name] === k}
                    onClick={() => (setPick({ ...pick, [v.name]: k }), setChecked(false))}
                    className={cn("h-8 max-sm:min-h-11 px-2.5 rounded-[6px] border text-[13px] font-semibold", pick[v.name] === k ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/50")}
                  >
                    {k}
                  </button>
                ))}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            setChecked(true);
            if (right === c.sorting.length) onSolved();
          }}
          className="brick brick-y h-10 max-sm:min-h-11 px-4 text-[14px] font-semibold"
        >
          Check my sorting
        </button>
        {checked && (
          <span role="status" className="text-[14px] font-semibold">
            {right} of {c.sorting.length} right
          </span>
        )}
      </div>
    </div>
  );
}

function StockTable({ c }: { c: StudioCase }) {
  return (
    <div className="grid gap-4">
      <div className="overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-1.5 pr-3 font-semibold">Stock</th>
              <th className="py-1.5 pr-3 font-semibold">Unit</th>
              <th className="py-1.5 pr-3 font-semibold">Inflows</th>
              <th className="py-1.5 font-semibold">Outflows</th>
            </tr>
          </thead>
          <tbody>
            {c.stocks.map((s) => (
              <tr key={s.name} className="border-t border-border align-top">
                <th scope="row" className="py-2 pr-3 text-left font-semibold">
                  {s.name}
                </th>
                <td className="py-2 pr-3 whitespace-nowrap">{s.unit}</td>
                <td className="py-2 pr-3">{s.inflows.join(", ") || "none"}</td>
                <td className="py-2">{s.outflows.join(", ") || "none"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <p className="heading text-[15px]">Equations</p>
        <ul className="mt-2 grid gap-1.5 text-[14.5px] leading-[1.6]">
          {c.equations.map((e) => (
            <li key={e} className="font-mono text-[13.5px] bg-muted/50 rounded-[6px] px-3 py-1.5">
              {e}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


// The case's stocks and flows, laid out and connected, with every equation and starting value left for the learner.
// Names drop their explanations in brackets, which the equation language cannot use.
const plain = (n: string) => n.replace(/\s*\(.*?\)\s*/g, " ").trim();
export function starterModel(c: StudioCase): BModel {
  const n = c.stocks.length;
  const stocks = c.stocks.map((st, i) => ({ id: `s${i + 1}`, name: plain(st.name), init: "", x: n > 1 ? 280 + (i * 520) / (n - 1) : 500, y: 140 + (i % 2) * 200, units: st.unit }));
  const names = [...new Set(c.stocks.flatMap((st) => [...st.inflows, ...st.outflows]))];
  const used: Record<string, number> = {}; // flows already placed beside each stock, so the next one is offset
  const flows = names.map((name, i) => {
    const from = c.stocks.findIndex((st) => st.outflows.includes(name));
    const to = c.stocks.findIndex((st) => st.inflows.includes(name));
    const [a, b] = [stocks[from], stocks[to]];
    const side = a && b ? "mid" : a ? `out${from}` : `in${to}`;
    const k = (used[side] = (used[side] ?? -1) + 1);
    const x = a && b ? (a.x + b.x) / 2 : a ? a.x + 140 : b.x - 140;
    const y = (a && b ? (a.y + b.y) / 2 : (a ?? b).y) + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 70;
    return { id: `f${i + 1}`, name: plain(name), from: a?.id, to: b?.id, eq: "", x: Math.max(40, Math.min(960, x)), y: Math.max(40, Math.min(440, y)) };
  });
  return { name: c.title, timeUnit: "month", T: 60, dt: 0.25, stocks, flows, vars: [] };
}

function BuildIt({ c, go }: { c: StudioCase; go: (h: string) => void }) {
  const open = () => {
    if (loadModel() && !window.confirm("Replace the model in the builder with this brief's stocks and flows? Export yours first if you want to keep it.")) return;
    saveModel(starterModel(c));
    go("/build");
  };
  return (
    <div className="sheet flex flex-wrap items-center justify-between gap-4">
      <p className="text-[15px] leading-[1.6] max-w-[70ch]">
        <b>Build it.</b> Open the builder with this brief&rsquo;s {c.stocks.length} stocks and their flows already laid out and connected. Add the constants, write an equation and a starting value for each element, run it, and compare your run with the reference mode in stage 1.
      </p>
      <button onClick={open} className="brick brick-y h-10 max-sm:min-h-11 px-4 text-[14px] font-semibold whitespace-nowrap">
        Open in the builder
      </button>
    </div>
  );
}

export function Citation({ k }: { k: string }) {
  const r = refFor(k);
  if (!r) return null;
  const url = refUrl(r);
  return (
    <li className="text-[14px] leading-[1.6] max-w-[90ch]">
      {r.text}{" "}
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="tlink font-semibold whitespace-nowrap inline-flex items-center gap-0.5">
          {r.doi ? "DOI" : "Link"}
          <ExternalLink size={12} aria-hidden />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </li>
  );
}

export function StudioPage({ id, go }: { id: string; go: (h: string) => void }) {
  const c = studioById(id);
  const key = `loopbricks-studio:${id}`;
  const [notes, setNotes] = useState<Record<string, string>>(() => load(key, {}));
  const [active, setActive] = useState("brief");
  const seen = useSeen();
  const setNote = (k: string, v: string) => {
    const n = { ...notes, [k]: v };
    setNotes(n);
    save(key, n);
  };
  // light up the stage being read in the rail
  useEffect(() => {
    const els = STAGES.map(([sid]) => document.getElementById(`st-${sid}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id.slice(3))), { rootMargin: "-30% 0px -60% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [id]);
  if (!c)
    return (
      <div className={`${wrap} pt-10`}>
        <p className="sheet">
          No practice brief called “{id}”.{" "}
          <button onClick={() => go("/learn/studio")} className="tlink font-semibold">
            See all practice briefs
          </button>
        </p>
      </div>
    );
  const done = seen.has(`done:studio/${id}`);
  const jump = (sid: string) => document.getElementById(`st-${sid}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <article className={`${wrap} pt-6 md:pt-8`}>
      <Crumb go={go} here={c.title} />
      <p className="text-[13px] font-semibold text-accent-text">{c.field}</p>
      <h1 className="display text-[30px] md:text-[42px] max-w-[24ch]">{c.title}</h1>

      <div className="mt-8 grid lg:grid-cols-[220px_minmax(0,1fr)] gap-8 lg:gap-12">
        <nav aria-label="Stages of this brief" className="hidden lg:block print:hidden">
          <ol className="sticky top-24 grid gap-1 border-l-2 border-border">
            {STAGES.map(([sid, title], i) => (
              <li key={sid}>
                <button
                  onClick={() => jump(sid)}
                  aria-current={active === sid ? "step" : undefined}
                  className={cn("-ml-[2px] border-l-2 pl-4 py-1.5 text-left text-[14px] leading-snug w-full", active === sid ? "border-foreground text-foreground font-semibold" : "border-transparent text-muted-foreground hover:text-foreground")}
                >
                  <span className="tabular-nums mr-1.5">{i + 1}</span>
                  {title}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 grid gap-14">
          <section id="st-brief" className="scroll-mt-24 grid [&>*]:min-w-0 gap-5">
            <h2 className="heading text-[24px]">1. The situation</h2>
            <p className="text-[16.5px] leading-[1.7] max-w-[72ch]">{c.brief}</p>
            <div className="grid md:grid-cols-3 gap-4">
              {c.voices.map((v) => (
                <blockquote key={v.who} className="border-l-4 border-accent pl-4">
                  <p className="text-[15px] leading-[1.55]">“{v.said}”</p>
                  <footer className="mt-1.5 text-[13px] font-semibold text-muted-foreground">{v.who}</footer>
                </blockquote>
              ))}
            </div>
            <Evidence e={c.evidence} />
            <p className="text-[14.5px] text-muted-foreground max-w-[72ch]">
              Before you go on, sketch the evidence by hand as graphs over time. Notice which quantities accumulate and which are rates, and where the people above disagree about
              cause, not about facts.
            </p>
          </section>

          <section id="st-articulate" className="scroll-mt-24 grid [&>*]:min-w-0 gap-6">
            <h2 className="heading text-[24px]">2. Articulate the problem</h2>
            {c.articulate.map((a, i) => (
              <Answer key={a.q} label={a.q} value={notes[`a${i}`] ?? ""} onChange={(v) => setNote(`a${i}`, v)} model={<p>{a.answer}</p>} />
            ))}
          </section>

          <section id="st-boundary" className="scroll-mt-24 grid [&>*]:min-w-0 gap-4">
            <h2 className="heading text-[24px]">3. Set the boundary</h2>
            <Answer
              label="Make a model boundary chart: which variables will the model explain (endogenous), which will it take as given (exogenous), and what will it leave out?"
              value={notes.boundary ?? ""}
              onChange={(v) => setNote("boundary", v)}
              model={
                <div className="grid sm:grid-cols-3 gap-4 text-[14.5px]">
                  {(
                    [
                      ["Endogenous", c.boundary.endogenous],
                      ["Exogenous", c.boundary.exogenous],
                      ["Left out", c.boundary.excluded],
                    ] as const
                  ).map(([h, xs]) => (
                    <div key={h}>
                      <p className="heading text-[14.5px]">{h}</p>
                      <ul className="mt-1 grid gap-1 list-disc pl-4">
                        {xs.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              }
            />
          </section>

          <section id="st-loops" className="scroll-mt-24 grid [&>*]:min-w-0 gap-4">
            <h2 className="heading text-[24px]">4. Draw the feedback</h2>
            <p className="text-[15.5px] leading-[1.65] max-w-[72ch]">{c.cldTask}</p>
            <DrawBoard cld={c.cld} title={c.title} solvedKey={`done:studio-cld/${c.id}`} stacked />
            <Answer
              label="In two or three sentences, state your dynamic hypothesis: which loops produce the reference mode, and which one dominates (drives the behaviour) at each stage?"
              value={notes.hypothesis ?? ""}
              onChange={(v) => setNote("hypothesis", v)}
              model={<p className="cld-cap" dangerouslySetInnerHTML={{ __html: c.cld.caption }} />}
            />
          </section>

          <section id="st-stocks" className="scroll-mt-24 grid [&>*]:min-w-0 gap-4">
            <h2 className="heading text-[24px]">5. Map stocks and flows</h2>
            <SortDrill c={c} onSolved={() => markSeen(`done:studio-sort/${c.id}`)} />
            <Answer
              label="Write the stocks with their inflows and outflows, and an equation for each flow. Check that the units balance."
              value={notes.stocks ?? ""}
              onChange={(v) => setNote("stocks", v)}
              model={<StockTable c={c} />}
            />
            <BuildIt c={c} go={go} />
          </section>

          <section id="st-policies" className="scroll-mt-24 grid [&>*]:min-w-0 gap-6">
            <h2 className="heading text-[24px]">6. Test policies and critique</h2>
            <ol className="grid gap-4">
              {c.policies.map((p, i) => (
                <li key={p.q} className="sheet">
                  <p className="text-[15.5px] leading-[1.6]">
                    <span className="heading mr-2">Policy {i + 1}.</span>
                    {p.q}
                  </p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-[13.5px] font-semibold underline underline-offset-2 w-fit">What to look for</summary>
                    <p className="mt-2 border-l-4 border-accent-edge pl-4 text-[14.5px] leading-[1.6]">{p.hint}</p>
                  </details>
                </li>
              ))}
            </ol>
            <div>
              <h3 className="heading text-[18px]">Take it further</h3>
              <p className="text-[14px] text-muted-foreground">Questions for a seminar or a written critique.</p>
              <ul className="mt-3 grid gap-3 list-disc pl-5 marker:text-accent-edge text-[15px] leading-[1.6] max-w-[75ch]">
                {c.critique.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="heading text-[18px]">Run something similar</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.related.map((r) => (
                  <button key={r.hash} onClick={() => go(r.hash)} className="brick brick-w h-9 max-sm:min-h-11 px-3.5 text-[13px] font-semibold">
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="heading text-[18px]">Sources</h3>
              <ul className="mt-3 grid gap-2">
                {c.refs.map((k) => (
                  <Citation key={k} k={k} />
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-3 print:hidden">
              <button onClick={() => markSeen(`done:studio/${id}`)} disabled={done} className={cn("brick h-11 px-5 text-[15px] font-semibold", done ? "brick-w" : "brick-y")}>
                {done ? "Marked as done" : "Mark this brief as done"}
              </button>
              <button onClick={() => window.print()} className="brick brick-w h-11 px-4 text-[14px] font-semibold inline-flex items-center gap-1.5">
                <Printer size={15} aria-hidden /> Print with my answers
              </button>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
