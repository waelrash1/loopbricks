import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, Check, ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { MODELS, type Model } from "@/data/molecules";
import type { StudyDiagram } from "@/data/sterman/types";
import { ARCHETYPES, LEARN_BY_MOLECULE, MODULE_CONTENT, archetypesFor, type ModuleContent } from "@/data/learn";
import type { Archetype, Level, Quiz, Step } from "@/data/learn/types";
import { STEPS } from "@/data/learn/steps";
import { sampleModel } from "@/data/apps/sim";
import { initParams } from "@/sim/engine";
import { markSeen, useSeen } from "@/lib/progress";
import CausalLoopDiagram from "@/components/CausalLoopDiagram";
import SfDiagram from "@/components/SfDiagram";
import { cn } from "@/lib/utils";
import { NotebookLinks } from "@/components/PythonPanel";
import { notebookForModule } from "@/lib/notebook";
import { ModuleReadings } from "@/components/Readings";
import { READINGS } from "@/data/learn/readings";

const wrap = "page";
const sub = "heading text-[22px] md:text-[24px]";
// a page reference into Sterman (2000), the main source of the topic notes
const pg = (p?: string) =>
  p ? <span className="text-muted-foreground text-[13px]"> (Sterman 2000, {/[-,]/.test(p) ? "pp." : "p."} {p})</span> : null;
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
      {/* one column with an arrow between steps, so the direction always reads, at any width */}
      <ol className="grid max-w-[560px]">
        {d.steps.map((s, i) => (
          <li key={s.label}>
            {i > 0 && <ArrowDown aria-hidden size={18} strokeWidth={2.5} className="mx-auto my-1 text-foreground/70" />}
            <div className="rounded-[10px] border border-foreground/70 bg-card px-3.5 py-2.5 grid grid-cols-[22px_minmax(0,1fr)] gap-x-2">
              <span className="text-[13px] font-bold text-accent-text tabular-nums pt-px">{i + 1}</span>
              <span>
                <span className="block heading text-[15px]">{s.label}</span>
                {s.detail && <span className="block mt-1 text-[13px] leading-[1.5] text-foreground/80">{s.detail}</span>}
              </span>
            </div>
          </li>
        ))}
      </ol>
      {d.loopBack && (
        <p className="mt-3 text-[13.5px] text-foreground/80">
          <span aria-hidden className="font-bold text-accent-text">↺ </span>
          From step {d.loopBack.from + 1} back to step {d.loopBack.to + 1}: {d.loopBack.label}
        </p>
      )}
    </div>
  );
}

function DiagramBody({ d }: { d: StudyDiagram }) {
  return (
    <>
      {d.kind === "cld" && (
        <div className="max-w-[760px]">
          <CausalLoopDiagram model={{ name: d.title, cld: d.cld } as unknown as Model} />
        </div>
      )}
      {d.kind === "cycle" && <Cycle d={d} />}
      {d.kind === "sequence" && <Sequence d={d} />}
      {d.kind === "sf" && (
        <>
          <SfDiagram d={d} />
          {d.caption && <p className="mt-3 text-[14px] leading-[1.7] text-foreground/85" dangerouslySetInnerHTML={{ __html: d.caption }} />}
        </>
      )}
      {d.note && <p className="mt-3 text-[14px] leading-[1.6] text-foreground/80 max-w-[75ch]">{d.note}</p>}
    </>
  );
}

const LEVELS: { level: Level; blurb: string }[] = [
  { level: "Foundations", blurb: "How systems behave and how to describe them: stocks, flows, feedback and patterns." },
  { level: "Core dynamics", blurb: "The structures that produce growth, delay, S-curves, lock-in, chains and oscillation, and the archetypes they form." },
  { level: "Modelling practice", blurb: "Turning a problem into a model you can trust: framing, formulation, human decisions, cycles and testing." },
  { level: "Advanced", blurb: "How simulators work underneath, and the open questions of the field." },
];
export const PRACTICE: [string, string, string][] = [
  ["Decision games", "Run a supply chain, a fishery or a firefighting team, week by week, and see what your decisions do.", "/learn/games"],
  ["Draw the loops", "Connect variables with signed links and check your diagram against a model answer.", "/learn/draw"],
  ["Modelling studio", "Practice briefs: turn a messy situation into a problem statement, a boundary, a causal loop diagram and a stock and flow map, with a model answer at each step.", "/learn/studio"],
  ["Build a model", "Lay out stocks and flows, write the equations, and run your own model.", "/learn/build"],
  ["Capstone projects", "Take one problem from client brief to policy advice, stage by stage.", "/learn/projects"],
  ["Mixed review", "Questions drawn across the modules you have finished.", "/learn/review"],
  ["Before and after", "A short test of common misconceptions: take it now, and again at the end.", "/learn/check"],
  ["Glossary", "Every term, defined plainly, with a link to where it is taught.", "/learn/glossary"],
  ["Reading list", "Every source in the course, with DOIs, and where each one is used.", "/learn/references"],
  ["For instructors", "A 12-week syllabus, assessment, assignment links and progress export.", "/learn/teach"],
];
export const doneKey = (id: string) => `done:learn/${id}`;

// two ways through the curriculum: modellers see everything; managers can skip the equations and the most technical modules
export type Track = "modeller" | "manager";
const TRACK_KEY = "loopbricks-track";
const readTrack = (): Track => {
  try {
    return localStorage.getItem(TRACK_KEY) === "manager" ? "manager" : "modeller";
  } catch {
    return "modeller";
  }
};
const trackSubs = new Set<(t: Track) => void>();
export function useTrack(): [Track, (t: Track) => void] {
  const [t, setT] = useState<Track>(readTrack);
  useEffect(() => {
    trackSubs.add(setT);
    return () => void trackSubs.delete(setT);
  }, []);
  const set = (v: Track) => {
    try {
      localStorage.setItem(TRACK_KEY, v);
    } catch {
      /* not stored: applies to this page only */
    }
    trackSubs.forEach((f) => f(v));
  };
  return [t, set];
}
function TrackSwitch() {
  const [t, set] = useTrack();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div role="radiogroup" aria-label="Your track" className="inline-flex rounded-[10px] border border-border p-1 bg-card">
        {(
          [
            ["modeller", "Modeller"],
            ["manager", "Manager"],
          ] as const
        ).map(([k, label]) => (
          <button key={k} role="radio" aria-checked={t === k} onClick={() => set(k)} className={cn("h-8 max-sm:min-h-11 px-3.5 rounded-[7px] text-[13px] font-semibold", t === k ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted")}>
            {label}
          </button>
        ))}
      </div>
      <span className="text-[13.5px] text-muted-foreground max-w-[52ch]">
        {t === "manager" ? "Concepts, diagrams and runs; equations hidden, and the two most technical modules optional." : "Everything, including the equations and how to formulate them."}
      </span>
    </div>
  );
}
const byId = (id: string) => MODULE_CONTENT.find((m) => m.def.id === id);

export function CurriculumIndex({ onModule, onOpen }: { onModule: (id: string) => void; onOpen: (hash: string) => void }) {
  const seen = useSeen();
  const [track] = useTrack();
  const done = MODULE_CONTENT.filter((m) => seen.has(doneKey(m.def.id))).length;
  const next = MODULE_CONTENT.find((m) => !seen.has(doneKey(m.def.id)));
  return (
    <div className={`${wrap} pt-10 md:pt-14`}>
      <h1 className="display text-[36px] md:text-[40px] max-w-[20ch]">From feedback to models you can trust</h1>
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
      <div className="mt-6">
        <TrackSwitch />
      </div>

      {LEVELS.map(({ level, blurb }, li) => (
        <section key={level} className="mt-12">
          <div className="flex items-baseline gap-3">
            <span className="display text-[30px] text-accent-text leading-none">{li + 1}</span>
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
                    {track === "manager" && m.def.managerOptional && <span className="mt-1 text-[12.5px] font-semibold text-accent-text">Optional on the manager track</span>}
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
        <h2 className="heading text-[24px]">Practise</h2>
        <p className="mt-1 text-[15px] text-muted-foreground max-w-[70ch]">Reading and running are not enough: decide, draw and build, then check yourself.</p>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRACTICE.map(([title, text, hash]) => (
            <button key={hash} onClick={() => onOpen(hash)} className="brick brick-w text-left p-4">
              <span className="heading text-[16px]">{title}</span>
              <span className="mt-1.5 block text-[13.5px] leading-[1.5] text-muted-foreground">{text}</span>
            </button>
          ))}
        </div>
      </section>

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
            <button key={hash} onClick={() => onOpen(hash)} className="brick brick-w h-9 max-sm:min-h-11 px-3.5 text-[13px] font-semibold">
              {label}
            </button>
          ))}
        </div>
      </section>
      <p className="mt-12 text-[13px] text-muted-foreground max-w-[80ch]">
        Main sources: Sterman JD (2000), Business Dynamics: Systems Thinking and Modeling for a Complex World, Irwin/McGraw-Hill, cited by page throughout; Senge PM (1990), The Fifth
        Discipline, Doubleday, for the archetypes; and the journal articles listed under each module and case. Text and diagrams are our own. The{" "}
        <button onClick={() => onOpen("/learn/references")} className="tlink font-semibold text-foreground">
          reading list
        </button>{" "}
        gathers every source in one place.
      </p>
    </div>
  );
}

export function QuizBlock({ quiz }: { quiz: Quiz[] }) {
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
                  {shown && isRight && (
                    <span className="inline-flex items-center gap-1 text-[13px] font-bold">
                      <Check size={16} aria-hidden /> {isPick ? "Right" : "The answer"}
                    </span>
                  )}
                  {shown && isPick && !isRight && (
                    <span className="inline-flex items-center gap-1 text-[13px] font-bold">
                      <X size={16} aria-hidden /> Not quite
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {picked[i] !== undefined && (
            <p role="status" className="mt-3 text-[14.5px] leading-[1.6]">
              <b>{picked[i] === q.answer ? "Right. " : "Not quite. "}</b>
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

// learners predict before they run: on by default, remembered per browser
const PREDICT_KEY = "loopbricks-predict-first";
const predictFirst = () => {
  try {
    return localStorage.getItem(PREDICT_KEY) !== "0";
  } catch {
    return true;
  }
};
type Pt = { t: number; v: number };
// value of a sketch at time t, by straight lines between the drawn points; null outside what was drawn
const sketchAt = (pts: Pt[], t: number) => {
  if (pts.length < 2 || t < pts[0].t || t > pts[pts.length - 1].t) return null;
  const k = pts.findIndex((p) => p.t >= t);
  if (k <= 0) return pts[0].v;
  const a = pts[k - 1], b = pts[k];
  return a.v + ((b.v - a.v) * (t - a.t)) / (b.t - a.t || 1);
};
// compare a sketch with the run: average gap, end value and overshoot, in words a learner can act on
export function compareSketch(pts: Pt[], ys: number[], T: number) {
  const ts = ys.map((_, j) => (j * T) / (ys.length - 1));
  const span = Math.max(...ys) - Math.min(...ys) || Math.abs(ys[0]) || 1;
  const pairs = ts.map((t, j) => [sketchAt(pts, t), ys[j]] as const).filter(([s]) => s !== null) as [number, number][];
  if (pairs.length < 5) return null;
  const gap = pairs.reduce((a, [s, y]) => a + Math.abs(s - y), 0) / pairs.length / span;
  const end = ys[ys.length - 1], sEnd = pts[pts.length - 1].v;
  const over = (v: number[], e: number, s0: number) => (e >= s0 ? Math.max(...v) - e : e - Math.min(...v)) > 0.08 * span;
  const runOver = over(ys, end, ys[0]), sketchOver = over(pts.map((p) => p.v), sEnd, pts[0].v);
  const notes: string[] = [];
  notes.push(`You expected it to end near ${fmtNum(sEnd)}; the run ends near ${fmtNum(end)}.`);
  if (runOver && !sketchOver) notes.push("The run overshoots and comes back; your sketch did not. Look for a delay inside a balancing loop.");
  if (!runOver && sketchOver) notes.push("Your sketch overshoots, but the run approaches its final value without passing it.");
  return { score: Math.max(0, Math.round(100 * (1 - gap))), notes, covered: pairs.length / ys.length };
}
const fmtNum = (v: number) => (Math.abs(v) >= 100 ? Math.round(v).toString() : +v.toFixed(1) + "");

// A live run of one molecule beside the text: predict the curve, then sliders and a chart that redraws as they move.
function MiniRun({ run, onOpen }: { run: NonNullable<Step["run"]>; onOpen: (hash: string) => void }) {
  const m = MODELS[run.molecule];
  const base = useMemo(() => ({ ...initParams(m), ...run.params }), [m, run.params]);
  const [p, setP] = useState(base);
  useEffect(() => setP(base), [base]);
  const series = useMemo(() => sampleModel(m, p, run.T, 121), [m, p, run.T]);
  const lines = m.stocks.map((st, i) => ({ st, ys: series[i] })).filter((l) => !l.st.hidden && !l.st.chartHidden);
  const [phase, setPhase] = useState<"predict" | "shown">(() => (predictFirst() ? "predict" : "shown"));
  const [target, setTarget] = useState(lines[0]?.st.id);
  const [sketch, setSketch] = useState<Pt[]>([]);
  const drawing = useRef(false);
  const svg = useRef<SVGSVGElement>(null);
  const tLine = lines.find((l) => l.st.id === target) ?? lines[0];
  const all = lines.flatMap((l) => l.ys);
  // while predicting, the axis comes from the stock's fixed display scale, so it does not give the answer away
  const lo = phase === "predict" ? Math.min(0, tLine.ys[0]) : Math.min(0, ...all, ...sketch.map((s) => s.v));
  const hi = phase === "predict" ? Math.max(tLine.st.scale, tLine.ys[0] * 1.5, 1) : Math.max(...all, ...sketch.map((s) => s.v), lo + 1e-9);
  const W = 520, H = 230, L = 40, B = 22, R = 8;
  const xt = (t: number) => L + (t / run.T) * (W - L - R);
  const x = (j: number, n: number) => xt((j / Math.max(1, n - 1)) * run.T);
  const y = (v: number) => 8 + (1 - (v - lo) / (hi - lo)) * (H - B - 8);
  const changed = m.params.some((d) => p[d.id] !== base[d.id]);
  const cmp = phase === "shown" && sketch.length > 1 ? compareSketch(sketch, tLine.ys, run.T) : null;

  const toData = (e: React.PointerEvent): Pt | null => {
    const s = svg.current, ctm = s?.getScreenCTM();
    if (!s || !ctm) return null;
    const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const t = Math.min(run.T, Math.max(0, ((q.x - L) / (W - L - R)) * run.T));
    const v = lo + (1 - (q.y - 8) / (H - B - 8)) * (hi - lo);
    return { t, v };
  };
  const add = (pt: Pt | null) => pt && setSketch((s) => [...s.filter((q) => q.t < pt.t), pt]); // drawing back over a part redraws it
  const setPredict = (on: boolean) => {
    try {
      localStorage.setItem(PREDICT_KEY, on ? "1" : "0");
    } catch {
      /* private mode: the choice lasts for this page only */
    }
  };

  return (
    <div>
      {phase === "predict" && (
        <div className="mb-2 rounded-[8px] bg-background border-l-4 border-accent px-3 py-2 text-[13.5px] leading-[1.5]">
          <b>Predict first.</b> Draw how you expect <b>{tLine.st.label}</b> to move over {run.T} {m.timeUnit}, starting from the dot. Then run it and compare.
          {lines.length > 1 && (
            <label className="mt-2 flex items-center gap-2">
              <span>Sketch</span>
              <select value={tLine.st.id} onChange={(e) => (setTarget(e.target.value), setSketch([]))} className="rounded-[6px] border border-border bg-background px-2 py-1">
                {lines.map((l) => (
                  <option key={l.st.id} value={l.st.id}>
                    {l.st.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className={cn("w-full h-auto max-h-[340px] select-none", phase === "predict" && "cursor-crosshair touch-none")}
        role="img"
        aria-label={phase === "predict" ? `Drawing area: sketch ${tLine.st.label} over time` : `${m.name}: ${lines.map((l) => l.st.label).join(", ")} over ${run.T} ${m.timeUnit}`}
        onPointerDown={(e) => {
          if (phase !== "predict") return;
          drawing.current = true;
          (e.target as Element).setPointerCapture?.(e.pointerId);
          const pt = toData(e);
          setSketch(pt ? [{ t: 0, v: tLine.ys[0] }, ...(pt.t > 0 ? [pt] : [])] : []);
        }}
        onPointerMove={(e) => phase === "predict" && drawing.current && add(toData(e))}
        onPointerUp={() => (drawing.current = false)}
      >
        {[lo, (lo + hi) / 2, hi].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="hsl(var(--border))" />
            <text x={L - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="hsl(var(--muted-foreground))">
              {fmtNum(v)}
            </text>
          </g>
        ))}
        <text x={L} y={H - 4} fontSize="11" fill="hsl(var(--muted-foreground))">0</text>
        <text x={W - R} y={H - 4} textAnchor="end" fontSize="11" fill="hsl(var(--muted-foreground))">
          {run.T} {m.timeUnit}
        </text>
        {phase === "shown" &&
          lines.map(({ st, ys }) => (
            <polyline key={st.id} fill="none" stroke={st.color} strokeWidth="2.25" strokeLinejoin="round" points={ys.map((v, j) => `${x(j, ys.length)},${y(v)}`).join(" ")} />
          ))}
        {sketch.length > 1 && (
          <polyline fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" points={sketch.map((s) => `${xt(s.t)},${y(s.v)}`).join(" ")} />
        )}
        {phase === "predict" && <circle cx={xt(0)} cy={y(tLine.ys[0])} r={5} fill={tLine.st.color} />}
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
        {phase === "shown" &&
          lines.map(({ st }) => (
            <span key={st.id} className="flex items-center gap-1.5">
              <span aria-hidden className="inline-block w-4 h-[3px] rounded" style={{ background: st.color }} />
              {st.label}
            </span>
          ))}
        {sketch.length > 1 && (
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="inline-block w-4 border-t-2 border-dashed border-foreground" />
            Your prediction
          </span>
        )}
      </div>
      {phase === "shown" && (
        <>
          {/* what to notice comes after the learner has committed to a prediction */}
          <p className="mt-2 rounded-[8px] bg-background border-l-4 border-accent px-3 py-2 text-[13.5px] leading-[1.5]">
            <b>Look for: </b>
            {run.look}
          </p>
          {cmp && (
            <div role="status" className="mt-2 rounded-[8px] border border-border px-3 py-2 text-[13.5px] leading-[1.55]">
              <b>Your prediction matched {cmp.score}%</b> of the way{cmp.covered < 0.8 ? " over the part you drew" : ""}. {cmp.notes.join(" ")}
            </div>
          )}
        </>
      )}
      {/* the navy control strip: full width along the foot of the card */}
      <div className="-mx-4 md:-mx-5 -mb-4 md:-mb-5 mt-4 bg-panel text-white px-4 md:px-5 py-3.5">
        {phase === "predict" ? (
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setPhase("shown")} disabled={sketch.length < 3} className="brick brick-y h-10 max-sm:min-h-11 px-4 text-[14px] font-semibold disabled:opacity-50">
              Run and compare
            </button>
            {sketch.length > 0 && (
              <button onClick={() => setSketch([])} className="brick brick-w text-foreground h-10 max-sm:min-h-11 px-3.5 text-[13px] font-semibold">
                Clear sketch
              </button>
            )}
            <button
              onClick={() => {
                setPredict(false);
                setPhase("shown");
              }}
              className="h-10 max-sm:min-h-11 px-2 text-[13px] text-white/85 hover:text-white underline underline-offset-2"
            >
              Skip predictions
            </button>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-x-5 gap-y-2.5">
              {m.params.map((d) => (
                <label key={d.id} className="text-[13px] font-medium">
                  <span className="flex justify-between gap-2">
                    <span className="truncate">{d.label}</span>
                    <output className="font-mono text-[12.5px] tabular-nums">
                      {p[d.id]} {d.unit}
                    </output>
                  </span>
                  <input type="range" min={d.min} max={d.max} step={d.step} value={p[d.id]} onChange={(e) => setP((q) => ({ ...q, [d.id]: +e.target.value }))} className="w-full max-sm:h-8 accent-[hsl(var(--accent))]" />
                </label>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {changed && (
                <button onClick={() => setP(base)} className="brick brick-w text-foreground h-9 max-sm:min-h-11 px-3 text-[13px] font-semibold">
                  Reset
                </button>
              )}
              <button onClick={() => (setSketch([]), setP(base), setPhase("predict"), setPredict(true))} className="brick brick-w text-foreground h-9 max-sm:min-h-11 px-3 text-[13px] font-semibold">
                Predict again
              </button>
              <button onClick={() => onOpen(`/m/${run.molecule}`)} className="brick brick-w text-foreground h-9 max-sm:min-h-11 px-3 text-[13px] font-semibold">
                Open {m.name} in the simulator
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type Resolved = { step: Step; diagram?: StudyDiagram; formulation?: ModuleContent["formulations"][number]; archetype?: Archetype };
type Tab = "all" | "diagram" | "equation" | "run";

// The workbench: the diagram, equation and live run for one step, on one card with the controls along its foot.
function Bench({ r, onOpen }: { r: Resolved; onOpen: (hash: string) => void }) {
  const [track] = useTrack();
  if (track === "manager") r = { ...r, formulation: undefined };
  const tabs = [
    (r.diagram || r.archetype) && (["diagram", "Diagram"] as const),
    r.formulation && (["equation", "Equation"] as const),
    r.step.run && MODELS[r.step.run.molecule] && (["run", "Run it"] as const),
  ].filter(Boolean) as (readonly [Tab, string])[];
  // more than one view: show them all together by default, one under the other
  if (tabs.length > 1) tabs.unshift(["all", "All together"]);
  const [tab, setTab] = useState<Tab | undefined>(tabs[0]?.[0]);
  if (!tabs.length) return null;
  const t = tabs.find((x) => x[0] === tab) ? tab : tabs[0][0];
  return (
    <figure className="rounded-[var(--radius)] bg-card border border-border overflow-hidden">
      {tabs.length > 1 && (
        <div role="tablist" aria-label="Show" className="flex flex-wrap gap-1 p-2 border-b border-border">
          {tabs.map(([k, label]) => (
            <button
              key={k}
              role="tab"
              aria-selected={t === k}
              onClick={() => setTab(k)}
              className={cn("h-8 max-sm:min-h-11 px-3 rounded-btn text-[13px] font-semibold", t === k ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted")}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div role={tabs.length > 1 ? "tabpanel" : undefined} className="p-4 md:p-5">
        {(t === "diagram" || t === "all") && r.archetype && (
          <>
            <figcaption className="heading text-[17px] mb-2">{r.archetype.name}</figcaption>
            <CausalLoopDiagram model={{ name: r.archetype.name, cld: r.archetype.cld } as unknown as Model} />
          </>
        )}
        {(t === "diagram" || t === "all") && r.diagram && !r.archetype && (
          <>
            <figcaption className="heading text-[17px] mb-2">
              {r.diagram.title}
              {pg(r.diagram.pages)}
            </figcaption>
            <DiagramBody d={r.diagram} />
          </>
        )}
        {(t === "equation" || t === "all") && r.formulation && (
          <div className={cn(t === "all" && (r.diagram || r.archetype) && "mt-6 pt-5 border-t border-border")}>
            <p className="heading text-[17px]">
              {r.formulation.name}
              {pg(r.formulation.pages)}
            </p>
            <pre className="mt-3 rounded-btn bg-background px-4 py-3 text-[13.5px] font-mono whitespace-pre-wrap [overflow-wrap:anywhere]">{r.formulation.equations.join("\n")}</pre>
            <p className="mt-3 text-[14.5px] leading-[1.6]">{r.formulation.explain}</p>
          </div>
        )}
        {(t === "run" || t === "all") && r.step.run && MODELS[r.step.run.molecule] && (
          <div className={cn(t === "all" && tabs.length > 2 && "mt-6 pt-5 border-t border-border")}>
            <p className="heading text-[17px] mb-2">Run it: {MODELS[r.step.run.molecule].name}</p>
            <MiniRun run={r.step.run} onOpen={onOpen} />
          </div>
        )}
      </div>
    </figure>
  );
}

// ponytail: modules without authored steps get one step per idea, with diagrams and equations dealt out in order
function fallbackSteps(m: ModuleContent): Step[] {
  return m.bigIdeas.map((b, i) => ({ title: b.title, ideas: [b.title], diagram: m.diagrams[i]?.title, formulation: m.formulations[i]?.name }));
}

// the step lives in the address, #/learn/<module>/<n>, so each step can be linked, bookmarked and reached with Back
const stepFromHash = () => {
  const n = Number(window.location.hash.split("/")[3]);
  return Number.isInteger(n) && n >= 1 ? n - 1 : 0;
};
function useHashStep() {
  const [s, setS] = useState(stepFromHash);
  useEffect(() => {
    const f = () => setS(stepFromHash());
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return s;
}
// the step number of an archetype in the archetypes module, for links from a molecule page
export const archetypeStep = (archId: string) => {
  const k = (STEPS.archetypes ?? []).findIndex((s) => s.archetype === archId);
  return k >= 0 ? k + 1 : undefined;
};

// a step in the module: an authored step, or one of the two that close every module
type Item = { title: string; lead?: string } & ({ kind: "step"; r: Resolved; k: number } | { kind: "check" } | { kind: "more" });

function StepMark({ n, done, current }: { n: number; done: boolean; current: boolean }) {
  if (done)
    return (
      <span aria-hidden className="grid place-items-center w-[22px] h-[22px] shrink-0 rounded-[6px] bg-accent text-accent-foreground">
        <Check size={14} strokeWidth={3} />
      </span>
    );
  return (
    <span
      aria-hidden
      className={cn(
        "grid place-items-center w-[22px] h-[22px] shrink-0 rounded-[6px] font-mono text-[12px]",
        current ? "border-2 border-foreground text-foreground" : "border-[1.5px] border-border text-muted-foreground"
      )}
    >
      {n}
    </span>
  );
}

export function ModulePage({ id, onModule, onIndex, onOpen }: { id: string; onModule: (id: string) => void; onIndex: () => void; onOpen: (hash: string) => void }) {
  const seen = useSeen();
  const m = byId(id);
  const i = MODULE_CONTENT.findIndex((x) => x.def.id === id);
  const steps = useMemo<Resolved[]>(() => {
    if (!m) return [];
    return (STEPS[id]?.length ? STEPS[id] : fallbackSteps(m)).map((step) => ({
      step,
      diagram: m.diagrams.find((d) => d.title === step.diagram),
      formulation: m.formulations.find((f) => f.name === step.formulation),
      archetype: ARCHETYPES.find((a) => a.id === step.archetype),
    }));
  }, [m, id]);
  const want = useHashStep();

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
  const [prevMod, nextMod] = [MODULE_CONTENT[i - 1], MODULE_CONTENT[i + 1]];
  const stepKey = (k: number) => `done:step/${id}/${k}`;
  const isDone = seen.has(doneKey(id));
  const used = new Set(steps.flatMap((s) => s.step.exercises ?? []));
  const usedEx = new Set(steps.map((s) => s.step.example));
  const restEx = m.exercises.map((x, k) => [x, k] as const).filter(([, k]) => !used.has(k));
  const restExamples = m.examples.filter((x) => !usedEx.has(x.title));
  const nb = notebookForModule(id);
  const exNo = new Map<number, number>();
  let n = 0;
  steps.forEach((s) => s.step.exercises?.forEach((k) => exNo.set(k, ++n)));
  restEx.forEach(([, k]) => exNo.set(k, ++n));

  const items: Item[] = [
    ...steps.map((r, k) => ({ kind: "step" as const, r, k, title: r.step.title, lead: r.step.lead })),
    ...(m.quiz.length || m.pitfalls.length
      ? [{ kind: "check" as const, title: m.quiz.length ? "Check your understanding" : "Mistakes to avoid", lead: "Test the ideas from this module before you move on." }]
      : []),
    ...(restEx.length || restExamples.length || READINGS[id] || nb || m.def.deeper
      ? [{ kind: "more" as const, title: "Practice and reading", lead: "More worked examples and exercises, the readings for this module, and where to go next." }]
      : []),
  ];
  const cur = Math.min(want, items.length - 1);
  const it = items[cur];
  const last = cur === items.length - 1;
  const itemDone = (x: Item) => (x.kind === "step" ? seen.has(stepKey(x.k)) : isDone);
  const href = (k: number) => `#/learn/${id}${k > 0 ? `/${k + 1}` : ""}`;
  const goStep = (k: number) => onOpen(`/learn/${id}${k > 0 ? `/${k + 1}` : ""}`);
  const markCur = () => it.kind === "step" && markSeen(stepKey(it.k));

  const exercise = (k: number) => {
    const x = m.exercises[k];
    if (!x) return null;
    return (
      <div key={k} className="rounded-[var(--radius)] bg-card border border-border border-l-4 border-l-accent px-4 py-3.5">
        <p className="text-[12.5px] font-semibold text-muted-foreground">Try it {exNo.get(k)}</p>
        <p className="mt-1 text-[15px] leading-[1.6]">{x.prompt}</p>
        {x.hint && (
          <details className="mt-2 text-[14px]">
            <summary className="cursor-pointer font-semibold text-foreground/80 py-1">Hint</summary>
            <p className="mt-1 leading-[1.6] text-foreground/85">{x.hint}</p>
          </details>
        )}
        {x.answer && (
          <details className="mt-2 text-[14px]">
            <summary className="cursor-pointer font-semibold text-foreground/80 py-1">Show a worked answer</summary>
            <p className="mt-1 leading-[1.6] text-foreground/85">{x.answer}</p>
          </details>
        )}
        {x.link && (
          <button onClick={() => onOpen(x.link!.hash)} className="brick brick-w mt-3 h-9 max-sm:min-h-11 px-3.5 text-[13px] font-semibold">
            {x.link.label}
          </button>
        )}
      </div>
    );
  };

  // on phones the same control sits at the foot of the screen: jump to any step, or step through
  const stepper = (
    <div className="flex items-center gap-2">
      <button aria-label="Previous step" disabled={cur === 0} onClick={() => goStep(cur - 1)} className="brick brick-w min-w-11 min-h-11 grid place-items-center shrink-0 text-foreground disabled:opacity-40">
        <ChevronLeft size={16} />
      </button>
      <label className="flex-1 min-w-0">
        <span className="sr-only">Go to step</span>
        <select value={cur} onChange={(e) => goStep(+e.target.value)} className="w-full min-h-11 rounded-btn border border-border bg-card px-2.5 text-[13.5px] font-semibold text-foreground truncate">
          {items.map((x, k) => (
            <option key={x.title} value={k}>
              Step {k + 1} of {items.length}: {x.title}
              {itemDone(x) ? " (done)" : ""}
            </option>
          ))}
        </select>
      </label>
      <button
        aria-label="Next step"
        disabled={last}
        onClick={() => (markCur(), goStep(cur + 1))}
        className="brick brick-w min-w-11 min-h-11 grid place-items-center shrink-0 text-foreground disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );

  const prose = "max-w-[68ch] text-[16px] leading-[1.65]";
  let body: React.ReactNode = null;
  if (it.kind === "step") {
    const s = it.r, a = s.archetype;
    const ideas = s.step.ideas.map((t) => m.bigIdeas.find((b) => b.title === t)).filter(Boolean) as ModuleContent["bigIdeas"];
    const example = m.examples.find((x) => x.title === s.step.example);
    body = (
      <>
        {it.k === 0 && (m.objectives.length > 0 || m.def.prereqs.length > 0) && (
          <div className="max-w-[68ch] rounded-[var(--radius)] bg-card border border-border px-5 py-4">
            {m.objectives.length > 0 && (
              <>
                <p className="heading text-[16px]">By the end of this module you will be able to</p>
                <ul className="mt-2 space-y-1.5 text-[15px] leading-[1.55] list-disc pl-5 marker:text-accent-edge">
                  {m.objectives.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </>
            )}
            {m.def.prereqs.length > 0 && (
              <p className={cn("text-[14px] text-muted-foreground", m.objectives.length > 0 && "mt-3 pt-3 border-t border-border")}>
                Best after{" "}
                {m.def.prereqs.map((p, k) => (
                  <span key={p}>
                    {k > 0 && " and "}
                    <button onClick={() => onModule(p)} className="tlink font-semibold text-foreground">
                      {byId(p)?.def.title}
                    </button>
                    {seen.has(doneKey(p)) && <Check size={13} strokeWidth={3} aria-label="done" className="inline ml-1 -mt-0.5 text-[var(--viz-good)]" />}
                  </span>
                ))}
              </p>
            )}
          </div>
        )}
        {ideas.length > 0 && (
          <div className={cn(prose, "grid gap-4")}>
            {ideas.map((b) => (
              <div key={b.title}>
                {b.title !== s.step.title && <h2 className="heading text-[18px] mb-1.5">{b.title}</h2>}
                <p>
                  {b.text}
                  {pg(b.pages)}
                </p>
              </div>
            ))}
          </div>
        )}
        {a && (
          <div className={prose}>
            <p>{a.story}</p>
            <dl className="mt-4 grid gap-3 text-[15px] leading-[1.6]">
              {(
                [
                  ["What you see", a.behaviour],
                  ["Why it traps people", a.trap],
                  ["Where to intervene", a.leverage],
                ] as const
              ).map(([dt, dd]) => (
                <div key={dt} className="grid sm:grid-cols-[150px_minmax(0,1fr)] gap-x-4">
                  <dt className="heading text-[14.5px]">{dt}</dt>
                  <dd>{dd}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {a.cases.map((c) => (
                <button key={c.hash} onClick={() => onOpen(c.hash)} className="brick brick-w h-9 max-sm:min-h-11 px-3.5 text-[13px] font-semibold">
                  {c.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[12.5px] text-muted-foreground">Sources: {a.sources.join("; ")}</p>
          </div>
        )}
        <Bench key={cur} r={s} onOpen={onOpen} />
        {example && (
          <div className="max-w-[68ch] border-l-4 border-accent-edge pl-4">
            <p className="text-[12.5px] font-semibold text-muted-foreground">From practice</p>
            <h2 className="heading text-[16px] mt-0.5">
              {example.title}
              {pg(example.pages)}
            </h2>
            <p className="mt-1 text-[15px] leading-[1.6]">{example.text}</p>
          </div>
        )}
        {s.step.exercises?.length ? <div className="grid gap-3 max-w-[68ch]">{s.step.exercises.map(exercise)}</div> : null}
        <div className="print:hidden">
          <button
            onClick={() => markSeen(stepKey(it.k))}
            disabled={seen.has(stepKey(it.k))}
            className="brick brick-w h-9 max-sm:min-h-11 px-3.5 text-[13px] font-semibold inline-flex items-center gap-1.5"
          >
            {seen.has(stepKey(it.k)) ? (
              <>
                <Check size={14} strokeWidth={3} aria-hidden className="text-[var(--viz-good)]" /> Step {cur + 1} done
              </>
            ) : (
              `Mark step ${cur + 1} as done`
            )}
          </button>
        </div>
      </>
    );
  } else if (it.kind === "check") {
    body = (
      <>
        {m.pitfalls.length > 0 && (
          <section className="max-w-[68ch]">
            {m.quiz.length > 0 && <h2 className={sub}>Mistakes to avoid</h2>}
            <ul className="mt-3 space-y-2 text-[15.5px] leading-[1.6] list-disc pl-5 marker:text-accent-edge">
              {m.pitfalls.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        )}
        {m.quiz.length > 0 && (
          <section className="max-w-[68ch]">
            {m.pitfalls.length > 0 && <h2 className={sub}>Questions</h2>}
            <QuizBlock key={id} quiz={m.quiz} />
          </section>
        )}
      </>
    );
  } else {
    body = (
      <>
        {(restEx.length > 0 || restExamples.length > 0) && (
          <section>
            <h2 className={sub}>More practice</h2>
            {restExamples.length > 0 && (
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                {restExamples.map((x) => (
                  <div key={x.title} className="border-l-4 border-accent-edge pl-4">
                    <h3 className="heading text-[15.5px]">
                      {x.title}
                      {pg(x.pages)}
                    </h3>
                    <p className="mt-1 text-[15px] leading-[1.6]">{x.text}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 grid md:grid-cols-2 gap-3">{restEx.map(([, k]) => exercise(k))}</div>
          </section>
        )}
        <div className="-mt-14 empty:hidden">
          <ModuleReadings id={id} go={onOpen} />
        </div>
        {nb && (
          <section className="print:hidden">
            <h2 className="heading text-[17px]">In Python</h2>
            <p className="mt-1 text-[14px] text-muted-foreground max-w-[68ch]">
              The same models in a Jupyter notebook: run them in code, change them, and work the exercises. It is also{" "}
              <a href={`./book/${nb.file.replace(".ipynb", ".html")}`} className="tlink font-semibold">
                a chapter of the book
              </a>
              , with every plot already drawn.
            </p>
            <div className="mt-3">
              <NotebookLinks file={nb.file} title={`${m.def.title} in Python`} />
            </div>
          </section>
        )}
        {m.def.deeper && (
          <section>
            <h2 className="heading text-[17px]">Go deeper</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {m.def.deeper.map((d) => (
                <button key={d.hash} onClick={() => onOpen(d.hash)} className="brick brick-w h-9 max-sm:min-h-11 px-3.5 text-[13px] font-semibold">
                  {d.label}
                </button>
              ))}
            </div>
          </section>
        )}
      </>
    );
  }

  // back and next: a quiet link back, the one yellow brick forward; at the ends of the module they lead on to the neighbouring module
  const back =
    cur > 0
      ? { href: href(cur - 1), label: `Back: ${items[cur - 1].title}` }
      : prevMod
        ? { href: `#/learn/${prevMod.def.id}`, label: `Back: ${prevMod.def.title}` }
        : { href: "#/learn", label: "Back: all modules" };
  const fwd = !last
    ? { href: href(cur + 1), label: `Next: ${items[cur + 1].title}` }
    : nextMod
      ? { href: `#/learn/${nextMod.def.id}`, label: `Next module: ${nextMod.def.title}` }
      : { href: "#/learn", label: "Next: all modules" };

  return (
    <div className="page pt-6 md:pt-8 pb-10 lg:pb-16 grid lg:grid-cols-[minmax(220px,264px)_minmax(0,1fr)] gap-x-10 xl:gap-x-14 items-start">
      <nav aria-label="Steps in this module" className="hidden lg:grid gap-3.5 sticky top-[84px] max-h-[calc(100dvh-108px)] overflow-y-auto print:hidden pr-1">
        <a href="#/learn" onClick={(e) => (e.preventDefault(), onIndex())} className="text-[13px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline w-fit">
          All modules
        </a>
        <div className="grid gap-1.5">
          <span className="text-[13px] text-muted-foreground flex items-center gap-1.5">
            Module {i + 1} of {MODULE_CONTENT.length}, about {m.minutes} min
          </span>
          <span className="heading text-[20px]">{m.def.title}</span>
          <span className="text-[13px] text-muted-foreground">
            {items.filter(itemDone).length} of {items.length} steps done
          </span>
        </div>
        <ol className="grid gap-0.5 text-[14px]">
          {items.map((x, k) => {
            const here = k === cur, done = itemDone(x);
            return (
              <li key={x.title}>
                <a
                  href={href(k)}
                  aria-current={here ? "step" : undefined}
                  className={cn(
                    "flex gap-2.5 items-center px-2.5 py-2 rounded-btn border",
                    here ? "bg-card border-border text-foreground font-semibold" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-card/60"
                  )}
                >
                  <StepMark n={k + 1} done={done} current={here} />
                  <span className="min-w-0">{x.title}</span>
                  {done && <span className="sr-only">, done</span>}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <article className="min-w-0 max-w-[880px] grid gap-6">
        {/* phones and tablets: the module in one line above the step */}
        <div className="lg:hidden grid gap-1">
          <a href="#/learn" onClick={(e) => (e.preventDefault(), onIndex())} className="text-[13px] text-muted-foreground hover:text-foreground w-fit py-1">
            All modules
          </a>
          <p className="text-[13px] text-muted-foreground">
            Module {i + 1} of {MODULE_CONTENT.length}: <span className="font-semibold text-foreground">{m.def.title}</span>
          </p>
        </div>
        <header className="grid gap-2.5 max-w-[68ch]">
          <p className="text-[13px] font-semibold text-accent-text">
            Step {cur + 1} of {items.length}
          </p>
          <h1 className="display text-[30px] sm:text-[34px] xl:text-[38px]">{it.title}</h1>
          {it.lead && <p className="text-[17px] leading-[1.55] text-muted-foreground">{it.lead}</p>}
        </header>

        {body}

        {last && (
          <div className="print:hidden">
            <button onClick={() => markSeen(doneKey(id))} disabled={isDone} className="brick brick-w h-11 px-5 text-[15px] font-semibold inline-flex items-center gap-1.5">
              {isDone ? (
                <>
                  <Check size={16} strokeWidth={3} aria-hidden className="text-[var(--viz-good)]" />
                  Module marked as done
                </>
              ) : (
                "Mark this module as done"
              )}
            </button>
          </div>
        )}

        <nav aria-label="Back and next" className="max-w-[68ch] mt-2 pt-5 border-t border-border flex flex-wrap justify-between gap-3 print:hidden">
          <a href={back.href} className="inline-flex items-center gap-1.5 min-h-11 px-3 -ml-3 rounded-btn font-semibold text-foreground hover:bg-card max-w-full">
            <ChevronLeft size={16} aria-hidden className="shrink-0" />
            <span>{back.label}</span>
          </a>
          <a href={fwd.href} onClick={markCur} className="brick brick-y inline-flex items-center gap-1.5 min-h-11 px-[18px] py-2 font-semibold max-w-full">
            <span>{fwd.label}</span>
            <ChevronRight size={16} aria-hidden className="shrink-0" />
          </a>
        </nav>
      </article>

      <div className="lg:hidden print:hidden sticky bottom-0 z-20 -mx-4 px-4 py-2.5 mt-6 bg-background/95 backdrop-blur border-t border-border">{stepper}</div>
    </div>
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
          <div className="rounded-card bg-card border-l-4 border-accent px-5 py-4">
            <p className="heading text-[16px]">Archetype{arch.length > 1 ? "s" : ""} this molecule runs</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {arch.map((a) => (
                <button key={a.id} onClick={() => onModule(archetypeStep(a.id) ? `archetypes/${archetypeStep(a.id)}` : "archetypes")} className="brick brick-w h-9 max-sm:min-h-11 px-3.5 text-[13px] font-semibold">
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
