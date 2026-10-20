import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Clock, GraduationCap, X } from "lucide-react";
import { MODELS, type Model } from "@/data/molecules";
import type { StudyDiagram } from "@/data/sterman/types";
import { ARCHETYPES, LEARN_BY_MOLECULE, MODULE_CONTENT, archetypesFor, type ModuleContent } from "@/data/learn";
import type { Archetype, Level, Quiz } from "@/data/learn/types";
import { markSeen, useSeen } from "@/lib/progress";
import CausalLoopDiagram from "@/components/CausalLoopDiagram";
import { cn } from "@/lib/utils";

const wrap = "max-w-[1100px] mx-auto px-4 md:px-8";
const sub = "heading text-[22px] md:text-[24px]";
// a page reference into Sterman (2000), the main source of the topic notes
const pg = (p?: string) =>
  p ? <span className="text-muted-foreground text-[13px]"> (Sterman 2000, {/[-–,]/.test(p) ? "pp." : "p."} {p.replace(/-/g, "–")})</span> : null;
const INK = "hsl(var(--foreground))", EDGE = "hsl(var(--input))", QUIET = "hsl(var(--muted-foreground))";

// split text into lines of at most n characters, on spaces
const wrapText = (t: string, n: number) =>
  t.split(" ").reduce<string[]>((ls, w) => {
    const last = ls[ls.length - 1];
    if (last && (last + " " + w).length <= n) ls[ls.length - 1] = last + " " + w;
    else ls.push(w);
    return ls;
  }, []);

// a closed cycle of steps around a circle
function Cycle({ d }: { d: Extract<StudyDiagram, { kind: "cycle" }> }) {
  const n = d.nodes.length, W = 640, H = 420, cx = W / 2, cy = H / 2, r = 150, bw = 168, bh = 58;
  const pos = d.nodes.map((_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + r * Math.cos(a) * 1.25, cy + r * Math.sin(a)] as const;
  });
  // arrow from the edge of box i towards box i+1, along the chord, stopping short of the target
  const arrow = (i: number) => {
    const [x1, y1] = pos[i], [x2, y2] = pos[(i + 1) % n];
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    const sx = Math.min(bw / 2 / Math.abs(dx || 1e-9), bh / 2 / Math.abs(dy || 1e-9));
    const ux = dx / len, uy = dy / len, cut = sx * len;
    const a = [x1 + ux * (cut + 4), y1 + uy * (cut + 4)], b = [x2 - ux * (cut + 8), y2 - uy * (cut + 8)];
    const mx = (a[0] + b[0]) / 2 + (cx - (a[0] + b[0]) / 2) * -0.12, my = (a[1] + b[1]) / 2 + (cy - (a[1] + b[1]) / 2) * -0.12;
    return `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`;
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[640px] h-auto" role="img" aria-label={d.title}>
      <defs>
        <marker id="cyc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill={QUIET} />
        </marker>
      </defs>
      {d.nodes.map((_, i) => (
        <path key={`a${i}`} d={arrow(i)} fill="none" stroke={QUIET} strokeWidth={1.6} markerEnd="url(#cyc-arrow)" />
      ))}
      {d.center && wrapText(d.center, 22).map((l, j, ls) => (
        <text key={j} x={cx} y={cy + (j - (ls.length - 1) / 2) * 17 + 5} textAnchor="middle" fontSize="14" fontWeight={700} fill="hsl(var(--accent-edge))">
          {l}
        </text>
      ))}
      {d.nodes.map((t, i) => {
        const [x, y] = pos[i], ls = wrapText(t, 22);
        return (
          <g key={t}>
            <rect x={x - bw / 2} y={y - bh / 2} width={bw} height={bh} rx={9} fill="hsl(var(--card))" stroke={INK} strokeWidth={1.4} />
            {ls.map((l, j) => (
              <text key={j} x={x} y={y + (j - (ls.length - 1) / 2) * 16 + 5} textAnchor="middle" fontSize="13.5" fontWeight={600} fill={INK}>
                {l}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ordered steps; on narrow screens they stack vertically
function Sequence({ d }: { d: Extract<StudyDiagram, { kind: "sequence" }> }) {
  return (
    <div>
      <ol className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))` }}>
        {d.steps.map((s, i) => (
          <li key={s.label} className="relative rounded-[10px] border border-foreground/70 bg-card px-3.5 py-3">
            <span className="block text-[12px] font-bold text-accent-edge">Step {i + 1}</span>
            <span className="block heading text-[15px] mt-0.5">{s.label}</span>
            {s.detail && <span className="block mt-1.5 text-[13px] leading-[1.5] text-foreground/80">{s.detail}</span>}
          </li>
        ))}
      </ol>
      {d.loopBack && (
        <p className="mt-3 text-[13.5px] text-foreground/80">
          <span aria-hidden className="font-bold text-accent-edge">↺ </span>
          From step {d.loopBack.from + 1} back to step {d.loopBack.to + 1}: {d.loopBack.label}
        </p>
      )}
    </div>
  );
}

function Diagram({ d }: { d: StudyDiagram }) {
  return (
    <figure className="sheet">
      <figcaption className="heading text-[17px] mb-3">
        {d.title}
        {pg(d.pages)}
      </figcaption>
      {d.kind === "cld" && (
        <div className="max-w-[760px]">
          <CausalLoopDiagram model={{ name: d.title, cld: d.cld } as unknown as Model} />
        </div>
      )}
      {d.kind === "cycle" && <Cycle d={d} />}
      {d.kind === "sequence" && <Sequence d={d} />}
      {d.note && <p className="mt-3 text-[14px] leading-[1.6] text-foreground/80 max-w-[75ch]">{d.note}</p>}
    </figure>
  );
}


const LEVELS: { level: Level; blurb: string }[] = [
  { level: "Foundations", blurb: "How systems behave and how to describe them: stocks, flows, feedback and patterns." },
  { level: "Core dynamics", blurb: "The structures that produce growth, delay, S-curves, lock-in, chains and oscillation, and the archetypes they form." },
  { level: "Modelling practice", blurb: "Turning a problem into a model you can trust: framing, formulation, human decisions, cycles and testing." },
  { level: "Advanced", blurb: "How simulators work underneath, and the open questions of the field." },
];
const doneKey = (id: string) => `done:learn/${id}`;
const byId = (id: string) => MODULE_CONTENT.find((m) => m.def.id === id);

export function CurriculumIndex({ onModule, onOpen }: { onModule: (id: string) => void; onOpen: (hash: string) => void }) {
  const seen = useSeen();
  const done = MODULE_CONTENT.filter((m) => seen.has(doneKey(m.def.id))).length;
  const next = MODULE_CONTENT.find((m) => !seen.has(doneKey(m.def.id)));
  return (
    <div className={`${wrap} pt-10 md:pt-14`}>
      <p className="flex items-center gap-2 text-[14px] font-semibold text-muted-foreground">
        <GraduationCap size={17} aria-hidden /> Learn system dynamics
      </p>
      <h1 className="display text-[36px] md:text-[52px] max-w-[20ch] mt-2">From feedback to models you can trust</h1>
      <p className="mt-5 text-[17px] leading-[1.6] text-foreground/80 max-w-[64ch]">
        {MODULE_CONTENT.length} modules in four levels. Each one sets out what you will be able to do, explains the ideas with diagrams and equations, sends you into the simulator to
        try them, and ends with a short self-check.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {next && (
          <button onClick={() => onModule(next.def.id)} className="brick brick-y h-11 px-5 text-[15px] font-semibold">
            {done ? "Continue" : "Start"}: {next.def.title}
          </button>
        )}
        <span className="text-[14px] text-muted-foreground">
          {done} of {MODULE_CONTENT.length} modules done
        </span>
      </div>

      {LEVELS.map(({ level, blurb }, li) => (
        <section key={level} className="mt-12">
          <div className="flex items-baseline gap-3">
            <span className="display text-[30px] text-accent-edge leading-none">{li + 1}</span>
            <h2 className="heading text-[24px]">{level}</h2>
          </div>
          <p className="mt-1 text-[15px] text-muted-foreground max-w-[70ch]">{blurb}</p>
          <ol className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MODULE_CONTENT.filter((m) => m.def.level === level).map((m) => {
              const isDone = seen.has(doneKey(m.def.id));
              return (
                <li key={m.def.id}>
                  <button onClick={() => onModule(m.def.id)} className={cn("brick w-full h-full text-left p-4 flex flex-col", isDone ? "brick-w bg-accent/15" : "brick-w")}>
                    <span className="heading text-[16px] flex items-start justify-between gap-2">
                      {m.def.title}
                      {isDone && <Check size={16} strokeWidth={3} aria-label="done" className="shrink-0 mt-0.5 text-[var(--viz-good)]" />}
                    </span>
                    <span className="mt-1.5 text-[13.5px] leading-[1.5] text-muted-foreground">{m.def.summary}</span>
                    <span className="mt-auto pt-3 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                      <Clock size={13} aria-hidden /> about {m.minutes} min
                      {m.def.id === "archetypes" ? `, ${ARCHETYPES.length} archetypes` : `, ${m.diagrams.length} diagrams, ${m.exercises.length} exercises`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      <section className="mt-14">
        <h2 className="heading text-[22px]">Hands-on labs and method guides</h2>
        <p className="mt-1 text-[15px] text-muted-foreground max-w-[70ch]">Interactive pages that go deeper into one practice.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["Calibration lab", "/methods/calibration"],
            ["Sensitivity lab", "/methods/sensitivity"],
            ["Measuring fit to data", "/methods/fit"],
            ["Validation tests", "/methods/validation"],
            ["Reference modes", "/methods/reference-modes"],
            ["Machine learning and AI", "/methods/ml-ai"],
          ].map(([label, hash]) => (
            <button key={hash} onClick={() => onOpen(hash)} className="brick brick-w h-9 px-3.5 text-[13px] font-semibold">
              {label}
            </button>
          ))}
        </div>
      </section>
      <p className="mt-12 text-[13px] text-muted-foreground max-w-[80ch]">
        Main sources: Sterman JD (2000), Business Dynamics: Systems Thinking and Modeling for a Complex World, Irwin/McGraw-Hill, cited by page throughout; Senge PM (1990), The Fifth
        Discipline, Doubleday, for the archetypes; and the studies cited in each application case. Text and diagrams are our own.
      </p>
    </div>
  );
}

function QuizBlock({ quiz }: { quiz: Quiz[] }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const answered = Object.keys(picked).length, right = quiz.filter((q, i) => picked[i] === q.answer).length;
  return (
    <div className="mt-4 grid gap-4 max-w-[85ch]">
      {quiz.map((q, i) => (
        <fieldset key={q.q} className="sheet">
          <legend className="sr-only">Question {i + 1}</legend>
          <p className="text-[15.5px] leading-[1.6] font-semibold">
            {i + 1}. {q.q}
          </p>
          <div className="mt-3 grid gap-2">
            {q.options.map((o, j) => {
              const shown = picked[i] !== undefined, isPick = picked[i] === j, isRight = j === q.answer;
              return (
                <button
                  key={o}
                  disabled={shown}
                  onClick={() => setPicked((p) => ({ ...p, [i]: j }))}
                  className={cn(
                    "brick brick-w text-left px-3.5 py-2.5 text-[14.5px] flex items-center gap-2.5",
                    shown && isRight && "is-right",
                    shown && isPick && !isRight && "is-wrong",
                    shown && !isPick && !isRight && "text-muted-foreground"
                  )}
                >
                  <span className="grid place-items-center w-6 h-6 rounded-[6px] bg-foreground/10 text-[12px] font-bold shrink-0">{String.fromCharCode(65 + j)}</span>
                  <span className="flex-1">{o}</span>
                  {shown && isRight && <Check size={16} aria-label="correct answer" />}
                  {shown && isPick && !isRight && <X size={16} aria-label="your answer" />}
                </button>
              );
            })}
          </div>
          {picked[i] !== undefined && (
            <p role="status" className="mt-3 text-[14.5px] leading-[1.6]">
              <b>{picked[i] === q.answer ? "Correct. " : "Not quite. "}</b>
              {q.why}
            </p>
          )}
        </fieldset>
      ))}
      {answered === quiz.length && quiz.length > 0 && (
        <p className="text-[15px] font-semibold">
          You got {right} of {quiz.length}.{right < quiz.length && " Reread the big ideas behind the ones you missed, then try the exercises."}
        </p>
      )}
    </div>
  );
}

function ArchetypeCard({ a, onOpen }: { a: Archetype; onOpen: (hash: string) => void }) {
  return (
    <article id={`arch-${a.id}`} className="sheet scroll-mt-24">
      <h3 className="heading text-[20px]">{a.name}</h3>
      <p className="mt-2 text-[15.5px] leading-[1.65] max-w-[80ch]">{a.story}</p>
      <div className="mt-4 max-w-[760px]">
        <CausalLoopDiagram model={{ name: a.name, cld: a.cld } as unknown as Model} />
      </div>
      <dl className="mt-4 grid md:grid-cols-3 gap-4 text-[14.5px] leading-[1.6]">
        <div>
          <dt className="heading text-[14px]">What you see</dt>
          <dd className="mt-1">{a.behaviour}</dd>
        </div>
        <div>
          <dt className="heading text-[14px]">Why it traps people</dt>
          <dd className="mt-1">{a.trap}</dd>
        </div>
        <div>
          <dt className="heading text-[14px]">Where to intervene</dt>
          <dd className="mt-1">{a.leverage}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        {a.molecules.filter((k) => MODELS[k]).map((k) => (
          <button key={k} onClick={() => onOpen(`/m/${k}`)} className="brick brick-y h-9 px-3.5 text-[13px] font-semibold">
            Run it: {MODELS[k].name}
          </button>
        ))}
        {a.cases.map((c) => (
          <button key={c.hash} onClick={() => onOpen(c.hash)} className="brick brick-w h-9 px-3.5 text-[13px] font-semibold">
            {c.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[12.5px] text-muted-foreground">Sources: {a.sources.join("; ")}</p>
    </article>
  );
}

export function ModulePage({ id, onModule, onIndex, onOpen }: { id: string; onModule: (id: string) => void; onIndex: () => void; onOpen: (hash: string) => void }) {
  const seen = useSeen();
  const m = byId(id);
  const i = MODULE_CONTENT.findIndex((x) => x.def.id === id);
  if (!m)
    return (
      <div className={`${wrap} pt-10`}>
        <p className="sheet text-[15px]">
          There is no module called “{id}”.{" "}
          <button onClick={onIndex} className="tlink font-semibold">
            See all modules
          </button>
        </p>
      </div>
    );
  const [prev, next] = [MODULE_CONTENT[i - 1], MODULE_CONTENT[i + 1]];
  const isDone = seen.has(doneKey(id));
  const isArch = id === "archetypes";
  const sections = [
    ["ideas", "Big ideas", m.bigIdeas.length],
    ["archetypes", "Archetypes", isArch ? ARCHETYPES.length : 0],
    ["diagrams", "Diagrams", m.diagrams.length],
    ["formulations", "Equations", m.formulations.length],
    ["examples", "Examples", m.examples.length],
    ["exercises", "Try it", m.exercises.length],
    ["pitfalls", "Mistakes", m.pitfalls.length],
    ["quiz", "Self-check", m.quiz.length],
  ].filter((s) => s[2]) as [string, string, number][];
  const go = (k: string) => document.getElementById(`lm-${k}`)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

  return (
    <article className={`${wrap} pt-6 md:pt-8`}>
      <p className="text-sm text-muted-foreground mb-6">
        <button onClick={onIndex} className="hover:text-foreground">
          Learn
        </button>
        <span aria-hidden className="mx-2">/</span>
        <span className="text-foreground font-semibold">{m.def.level}</span>
      </p>
      <p className="text-[13px] font-semibold text-muted-foreground flex items-center gap-1.5">
        Module {i + 1} of {MODULE_CONTENT.length}
        <span aria-hidden>·</span>
        <Clock size={13} aria-hidden /> about {m.minutes} min
      </p>
      <h1 className="display text-[32px] md:text-[46px] max-w-[24ch] mt-2 hyphens-auto">{m.def.title}</h1>
      <p className="mt-4 text-[18px] leading-[1.6] text-foreground/85 max-w-[66ch]">{m.def.summary}</p>

      <div className="mt-6 grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4">
        {m.objectives.length > 0 && (
          <div className="rounded-card bg-accent/25 px-5 py-4">
            <p className="heading text-[16px]">By the end you will be able to</p>
            <ul className="mt-2 space-y-1.5 text-[15px] leading-[1.55] list-disc pl-5 marker:text-accent-edge">
              {m.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="rounded-card bg-card border border-border px-5 py-4 text-[14.5px]">
          {m.def.prereqs.length > 0 && (
            <>
              <p className="heading text-[15px]">Best after</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {m.def.prereqs.map((p) => (
                  <button key={p} onClick={() => onModule(p)} className="brick brick-w px-3 py-1.5 text-[13px] font-semibold text-left">
                    {seen.has(doneKey(p)) && <Check size={13} strokeWidth={3} aria-label="done" className="inline mr-1 -mt-0.5 text-[var(--viz-good)]" />}
                    {byId(p)?.def.title}
                  </button>
                ))}
              </div>
            </>
          )}
          {m.molecules.length > 0 && (
            <>
              <p className="heading text-[15px] mt-3">Molecules you will run</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {m.molecules.filter((k) => MODELS[k]).map((k) => (
                  <button key={k} onClick={() => onOpen(`/m/${k}`)} className="rounded-[6px] bg-background px-2 py-1 text-[12.5px] font-semibold hover:bg-muted">
                    {MODELS[k].name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <nav aria-label="In this module" className="mt-6 flex flex-wrap gap-2 print:hidden">
        {sections.map(([k, label]) => (
          <button key={k} onClick={() => go(k)} className="brick brick-w h-8 px-3 text-[13px] font-semibold">
            {label}
          </button>
        ))}
      </nav>

      {m.bigIdeas.length > 0 && (
        <section id="lm-ideas" className="mt-12 scroll-mt-24">
          <h2 className={sub}>Big ideas</h2>
          <ol className="mt-4 grid md:grid-cols-2 gap-x-8 gap-y-6">
            {m.bigIdeas.map((b, k) => (
              <li key={b.title} className="grid grid-cols-[30px_minmax(0,1fr)] gap-2">
                <span className="display text-[22px] text-accent-edge leading-none">{k + 1}</span>
                <div>
                  <h3 className="heading text-[16.5px]">{b.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-[1.65]">
                    {b.text}
                    {pg(b.pages)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {isArch && (
        <section id="lm-archetypes" className="mt-12 scroll-mt-24">
          <h2 className={sub}>The archetypes</h2>
          <p className="mt-2 text-[15.5px] leading-[1.6] max-w-[75ch]">
            Archetypes are feedback structures that recur across fields. Learning to recognise them lets you see a familiar story in a new situation and know where the leverage usually
            lies. Each one below is drawn as a causal loop diagram and linked to a molecule that runs it.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ARCHETYPES.map((a) => (
              <button key={a.id} onClick={() => document.getElementById(`arch-${a.id}`)?.scrollIntoView({ behavior: "smooth" })} className="rounded-[6px] bg-card border border-border px-2.5 py-1 text-[13px] font-semibold hover:bg-muted">
                {a.name}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-5">
            {ARCHETYPES.map((a) => (
              <ArchetypeCard key={a.id} a={a} onOpen={onOpen} />
            ))}
          </div>
        </section>
      )}

      {m.diagrams.length > 0 && (
        <section id="lm-diagrams" className="mt-14 scroll-mt-24">
          <h2 className={sub}>Diagrams</h2>
          <div className="mt-4 grid gap-5">
            {m.diagrams.map((d) => (
              <Diagram key={d.title} d={d} />
            ))}
          </div>
        </section>
      )}

      {m.formulations.length > 0 && (
        <section id="lm-formulations" className="mt-14 scroll-mt-24">
          <h2 className={sub}>Equations</h2>
          <div className="mt-4 grid gap-4">
            {m.formulations.map((f) => (
              <div key={f.name} className="sheet">
                <h3 className="heading text-[16.5px]">
                  {f.name}
                  {pg(f.pages)}
                </h3>
                <pre className="mt-3 rounded-[8px] bg-background px-4 py-3 text-[13.5px] font-mono whitespace-pre-wrap [overflow-wrap:anywhere]">{f.equations.join("\n")}</pre>
                <p className="mt-3 text-[15px] leading-[1.6] max-w-[75ch]">{f.explain}</p>
                {f.molecule && MODELS[f.molecule] && (
                  <button onClick={() => onOpen(`/m/${f.molecule}`)} className="brick brick-y mt-3 h-9 px-3.5 text-[13px] font-semibold">
                    Run it: {MODELS[f.molecule].name}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {m.examples.length > 0 && (
        <section id="lm-examples" className="mt-14 scroll-mt-24">
          <h2 className={sub}>Examples from practice</h2>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            {m.examples.map((x) => (
              <div key={x.title} className="rounded-card bg-card border border-border px-5 py-4">
                <h3 className="heading text-[16px]">
                  {x.title}
                  {pg(x.pages)}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.6]">{x.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {m.exercises.length > 0 && (
        <section id="lm-exercises" className="mt-14 scroll-mt-24">
          <h2 className={sub}>Try it</h2>
          <ol className="mt-4 grid gap-3 max-w-[85ch]">
            {m.exercises.map((x, k) => (
              <li key={x.prompt} className="rounded-card bg-accent/20 px-5 py-4">
                <p className="text-[15.5px] leading-[1.6]">
                  <b>{k + 1}. </b>
                  {x.prompt}
                </p>
                {x.hint && (
                  <details className="mt-2 text-[14px]">
                    <summary className="cursor-pointer font-semibold text-foreground/80">Hint</summary>
                    <p className="mt-1 leading-[1.6] text-foreground/85">{x.hint}</p>
                  </details>
                )}
                {x.link && (
                  <button onClick={() => onOpen(x.link!.hash)} className="brick brick-w mt-3 h-9 px-3.5 text-[13px] font-semibold">
                    {x.link.label}
                  </button>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {m.pitfalls.length > 0 && (
        <section id="lm-pitfalls" className="mt-14 scroll-mt-24">
          <h2 className={sub}>Mistakes to avoid</h2>
          <ul className="mt-3 space-y-2 text-[15.5px] leading-[1.6] list-disc pl-5 marker:text-accent-edge max-w-[80ch]">
            {m.pitfalls.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      )}

      {m.quiz.length > 0 && (
        <section id="lm-quiz" className="mt-14 scroll-mt-24">
          <h2 className={sub}>Check your understanding</h2>
          <QuizBlock key={id} quiz={m.quiz} />
        </section>
      )}

      {m.def.deeper && (
        <section className="mt-10">
          <h2 className="heading text-[17px]">Go deeper</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {m.def.deeper.map((d) => (
              <button key={d.hash} onClick={() => onOpen(d.hash)} className="brick brick-w h-9 px-3.5 text-[13px] font-semibold">
                {d.label}
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-3 print:hidden">
        <button onClick={() => markSeen(doneKey(id))} disabled={isDone} className={cn("brick h-11 px-5 text-[15px] font-semibold", isDone ? "brick-w" : "brick-y")}>
          {isDone ? (
            <>
              <Check size={16} strokeWidth={3} aria-hidden className="inline mr-1.5 -mt-0.5 text-[var(--viz-good)]" />
              Marked as done
            </>
          ) : (
            "Mark this module as done"
          )}
        </button>
      </div>

      <nav aria-label="Next and previous module" className="mt-8 grid sm:grid-cols-2 gap-4 print:hidden">
        {prev ? (
          <button onClick={() => onModule(prev.def.id)} className="brick brick-w text-left px-5 py-4">
            <span className="flex items-center gap-1 text-[13px] text-muted-foreground">
              <ChevronLeft size={14} aria-hidden /> Previous module
            </span>
            <span className="heading block text-[17px] mt-1">{prev.def.title}</span>
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button onClick={() => onModule(next.def.id)} className="brick brick-y text-left sm:text-right px-5 py-4">
            <span className="flex sm:justify-end items-center gap-1 text-[13px]">
              Next module <ChevronRight size={14} aria-hidden />
            </span>
            <span className="heading block text-[17px] mt-1">{next.def.title}</span>
          </button>
        )}
      </nav>
    </article>
  );
}

// On a molecule page: the modules that teach the concept this molecule embodies, and the explanation itself.
export function LearnPanel({ molecule, onModule }: { molecule: string; onModule: (id: string, anchor?: string) => void }) {
  // modules that explain this molecule with an equation come first; the rest follow in curriculum order, top three shown
  const all = useMemo(() => [...(LEARN_BY_MOLECULE[molecule] ?? [])].sort((x, y) => y.formulations.length - x.formulations.length), [molecule]);
  const entries = all.slice(0, 3), more = all.slice(3);
  const arch = archetypesFor(molecule);
  if (!entries.length) return null;
  return (
    <section className="mt-16 grid lg:grid-cols-[260px_minmax(0,1fr)] gap-x-10 gap-y-4">
      <h2 className="heading text-[26px]">Learn the concept</h2>
      <div className="grid gap-4 max-w-[80ch]">
        {arch.length > 0 && (
          <div className="rounded-card bg-accent/25 px-5 py-4">
            <p className="heading text-[16px]">Archetype{arch.length > 1 ? "s" : ""} this molecule runs</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {arch.map((a) => (
                <button key={a.id} onClick={() => onModule("archetypes", `arch-${a.id}`)} className="brick brick-w h-9 px-3.5 text-[13px] font-semibold">
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {entries.map(({ module, formulations }) => (
          <div key={module.id} className="sheet">
            <p className="text-[12.5px] font-semibold text-muted-foreground">{module.level}</p>
            <button onClick={() => onModule(module.id)} className="heading text-[17px] tlink text-left">
              {module.title}
            </button>
            <p className="mt-1 text-[14.5px] leading-[1.55] text-foreground/85">{module.summary}</p>
            {formulations.map((f) => (
              <div key={f.name} className="mt-3 border-t border-border pt-3">
                <p className="heading text-[14.5px]">{f.name}</p>
                <pre className="mt-2 rounded-[8px] bg-background px-3 py-2 text-[12.5px] font-mono whitespace-pre-wrap [overflow-wrap:anywhere]">{f.equations.join("\n")}</pre>
                <p className="mt-2 text-[14.5px] leading-[1.6]">{f.explain}</p>
              </div>
            ))}
          </div>
        ))}
        {more.length > 0 && (
          <p className="text-[14px] text-muted-foreground">
            Also used in:{" "}
            {more.map(({ module }, i) => (
              <span key={module.id}>
                {i > 0 && ", "}
                <button onClick={() => onModule(module.id)} className="tlink font-semibold text-foreground">
                  {module.title}
                </button>
              </span>
            ))}
          </p>
        )}
      </div>
    </section>
  );
}
