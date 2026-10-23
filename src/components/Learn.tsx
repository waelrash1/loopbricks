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
          <button key={k} role="radio" aria-checked={t === k} onClick={() => set(k)} className={cn("h-8 max-sm:min-h-11 px-3.5 rounded-[7px] text-[13px] font-semibold", t === k ? "bg-accent" : "text-muted-foreground hover:bg-muted")}>
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
      <h1 className="display text-[36px] md:text-[48px] max-w-[20ch]">From feedback to models you can trust</h1>
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
        <div className="mb-2 rounded-[8px] bg-card border-l-4 border-accent px-3 py-2 text-[13.5px] leading-[1.5]">
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
        className={cn("w-full h-auto select-none", phase === "predict" && "cursor-crosshair touch-none")}
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
      {phase === "predict" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => setPhase("shown")} disabled={sketch.length < 3} className="brick brick-y h-9 max-sm:min-h-11 px-3.5 text-[13px] font-semibold disabled:opacity-50">
            Run and compare
          </button>
          {sketch.length > 0 && (
            <button onClick={() => setSketch([])} className="brick brick-w h-9 max-sm:min-h-11 px-3.5 text-[13px] font-semibold">
              Clear sketch
            </button>
          )}
          <button
            onClick={() => {
              setPredict(false);
              setPhase("shown");
            }}
            className="h-9 px-2 text-[13px] text-muted-foreground underline underline-offset-2"
          >
            Skip predictions
          </button>
        </div>
      ) : (
        <>
          {/* what to notice comes after the learner has committed to a prediction */}
          <p className="mt-2 rounded-[8px] bg-card border-l-4 border-accent px-3 py-2 text-[13.5px] leading-[1.5]">
            <b>Look for: </b>
            {run.look}
          </p>
          {cmp && (
            <div role="status" className="mt-2 rounded-[8px] border border-border px-3 py-2 text-[13.5px] leading-[1.55]">
              <b>Your prediction matched {cmp.score}%</b> of the way{cmp.covered < 0.8 ? " over the part you drew" : ""}. {cmp.notes.join(" ")}
            </div>
          )}
          <div className="mt-3 grid sm:grid-cols-2 gap-x-5 gap-y-2">
            {m.params.map((d) => (
              <label key={d.id} className="text-[12.5px]">
                <span className="flex justify-between gap-2">
                  <span className="truncate">{d.label}</span>
                  <b className="tabular-nums">
                    {p[d.id]} {d.unit}
                  </b>
                </span>
                <input type="range" min={d.min} max={d.max} step={d.step} value={p[d.id]} onChange={(e) => setP((q) => ({ ...q, [d.id]: +e.target.value }))} className="w-full accent-[hsl(var(--accent-edge))]" />
              </label>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {changed && (
              <button onClick={() => setP(base)} className="brick brick-w h-8 max-sm:min-h-11 px-3 text-[12.5px] font-semibold">
                Reset
              </button>
            )}
            <button onClick={() => (setSketch([]), setP(base), setPhase("predict"), setPredict(true))} className="brick brick-w h-8 max-sm:min-h-11 px-3 text-[12.5px] font-semibold">
              Predict again
            </button>
            <button onClick={() => onOpen(`/m/${run.molecule}`)} className="brick brick-w h-8 max-sm:min-h-11 px-3 text-[12.5px] font-semibold">
              Open {m.name} in the simulator
            </button>
          </div>
        </>
      )}
    </div>
  );
}

type Resolved = { step: Step; diagram?: StudyDiagram; formulation?: ModuleContent["formulations"][number]; archetype?: Archetype };
type Tab = "all" | "diagram" | "equation" | "run";

// The workbench: the diagram, equation and live run for one step, side by side with its text.
function Bench({ r, onOpen, sticky }: { r: Resolved; onOpen: (hash: string) => void; sticky?: boolean }) {
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
    <div className={cn("rounded-card bg-card border border-border flex flex-col", sticky && "h-full")}>
      <div role="tablist" aria-label="Show" className="flex flex-wrap gap-1 p-2 border-b border-border">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={t === k}
            onClick={() => setTab(k)}
            className={cn("h-8 max-sm:min-h-11 px-3 rounded-[8px] text-[13px] font-semibold", t === k ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-muted")}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className={cn("p-4 md:p-5", sticky && "flex-1 overflow-y-auto")}>
        {(t === "diagram" || t === "all") && r.archetype && (
          <>
            <p className="heading text-[15px] mb-2">{r.archetype.name}</p>
            <CausalLoopDiagram model={{ name: r.archetype.name, cld: r.archetype.cld } as unknown as Model} />
          </>
        )}
        {(t === "diagram" || t === "all") && r.diagram && !r.archetype && (
          <>
            <p className="heading text-[15px] mb-2">
              {r.diagram.title}
              {pg(r.diagram.pages)}
            </p>
            <DiagramBody d={r.diagram} />
          </>
        )}
        {(t === "equation" || t === "all") && r.formulation && (
          <div className={cn(t === "all" && (r.diagram || r.archetype) && "mt-6 pt-5 border-t border-border")}>
            <p className="heading text-[15px]">
              {r.formulation.name}
              {pg(r.formulation.pages)}
            </p>
            <pre className="mt-3 rounded-[8px] bg-background px-4 py-3 text-[13.5px] font-mono whitespace-pre-wrap [overflow-wrap:anywhere]">{r.formulation.equations.join("\n")}</pre>
            <p className="mt-3 text-[14.5px] leading-[1.6]">{r.formulation.explain}</p>
          </div>
        )}
        {(t === "run" || t === "all") && r.step.run && MODELS[r.step.run.molecule] && (
          <div className={cn(t === "all" && tabs.length > 2 && "mt-6 pt-5 border-t border-border")}>
            {t === "all" && <p className="heading text-[15px] mb-2">Run it: {MODELS[r.step.run.molecule].name}</p>}
            <MiniRun run={r.step.run} onOpen={onOpen} />
          </div>
        )}
      </div>
    </div>
  );
}

// ponytail: modules without authored steps get one step per idea, with diagrams and equations dealt out in order
function fallbackSteps(m: ModuleContent): Step[] {
  return m.bigIdeas.map((b, i) => ({ title: b.title, ideas: [b.title], diagram: m.diagrams[i]?.title, formulation: m.formulations[i]?.name }));
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
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    // the step crossing the reading line (40% down the screen) drives the workbench
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(+(e.target as HTMLElement).dataset.step!)),
      { rootMargin: "-40% 0px -59% 0px" }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [steps]);

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
  const stepKey = (k: number) => `done:step/${id}/${k}`;
  const isDone = seen.has(doneKey(id));
  const used = new Set(steps.flatMap((s) => s.step.exercises ?? []));
  const usedEx = new Set(steps.map((s) => s.step.example));
  const restEx = m.exercises.map((x, k) => [x, k] as const).filter(([, k]) => !used.has(k));
  const restExamples = m.examples.filter((x) => !usedEx.has(x.title));
  // the workbench keeps showing the last step that had something to show
  let shown = active;
  while (shown > 0 && !(steps[shown].diagram || steps[shown].formulation || steps[shown].archetype || steps[shown].step.run)) shown--;
  const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const goStep = (k: number) => refs.current[k]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const exNo = new Map<number, number>();
  let n = 0;
  steps.forEach((s) => s.step.exercises?.forEach((k) => exNo.set(k, ++n)));
  restEx.forEach(([, k]) => exNo.set(k, ++n));

  const exercise = (k: number) => {
    const x = m.exercises[k];
    if (!x) return null;
    return (
      <div key={k} className="rounded-card bg-card border-l-4 border-accent px-4 py-3.5">
        <p className="text-[12.5px] font-semibold text-muted-foreground">Try it {exNo.get(k)}</p>
        <p className="mt-1 text-[15px] leading-[1.6]">{x.prompt}</p>
        {x.hint && (
          <details className="mt-2 text-[14px]">
            <summary className="cursor-pointer font-semibold text-foreground/80">Hint</summary>
            <p className="mt-1 leading-[1.6] text-foreground/85">{x.hint}</p>
          </details>
        )}
        {x.answer && (
          <details className="mt-2 text-[14px]">
            <summary className="cursor-pointer font-semibold text-foreground/80">Show a worked answer</summary>
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

  // jump to any step, or step through; the same control sits on the workbench and, on phones, at the bottom
  const stepper = (
    <div className="flex items-center gap-2">
      <button aria-label="Previous step" disabled={active === 0} onClick={() => goStep(active - 1)} className="brick brick-w w-9 max-sm:min-w-11 h-9 max-sm:min-h-11 grid place-items-center shrink-0 text-foreground disabled:opacity-40">
        <ChevronLeft size={16} />
      </button>
      <label className="flex-1 min-w-0">
        <span className="sr-only">Go to step</span>
        <select value={active} onChange={(e) => goStep(+e.target.value)} className="w-full h-9 max-sm:min-h-11 rounded-btn border border-border bg-card px-2.5 text-[13.5px] font-semibold text-foreground truncate">
          {steps.map((s, k) => (
            <option key={s.step.title} value={k}>
              Step {k + 1} of {steps.length}: {s.step.title}
              {seen.has(stepKey(k)) ? " (done)" : ""}
            </option>
          ))}
        </select>
      </label>
      <button aria-label="Next step" disabled={active >= steps.length - 1} onClick={() => goStep(active + 1)} className="brick brick-w w-9 max-sm:min-w-11 h-9 max-sm:min-h-11 grid place-items-center shrink-0 text-foreground disabled:opacity-40">
        <ChevronRight size={16} />
      </button>
    </div>
  );

  return (
    <article className="page pt-6 md:pt-8">
      <p className="text-sm text-muted-foreground mb-6">
        <button onClick={onIndex} className="hover:text-foreground">
          Learn
        </button>
        <span aria-hidden className="mx-2">/</span>
        <span className="text-foreground font-semibold">{m.def.level}</span>
      </p>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] gap-x-12 gap-y-6">
        <header>
          <p className="text-[13px] font-semibold text-muted-foreground flex items-center gap-1.5">
            Module {i + 1} of {MODULE_CONTENT.length}, about {m.minutes} min
            <Clock size={13} aria-hidden />
          </p>
          <h1 className="display text-[32px] md:text-[46px] max-w-[20ch] mt-2">{m.def.title}</h1>
          <p className="mt-4 text-[18px] leading-[1.6] text-foreground/85 max-w-[60ch]">{m.def.summary}</p>
          {m.def.prereqs.length > 0 && (
            <p className="mt-5 text-[14px] text-muted-foreground">
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
          <nav aria-label="Steps in this module" className="mt-8 border-t border-border pt-5 print:hidden max-w-[60ch]">
            <p className="heading text-[16px]">
              The module in {steps.length} steps
              <span className="ml-2 text-[13px] font-normal text-muted-foreground">{steps.filter((_, k) => seen.has(stepKey(k))).length} done</span>
            </p>
            <ol className="mt-2 grid gap-y-1 text-[14.5px]">
              {steps.map((s, k) => (
                <li key={s.step.title}>
                  <a
                    href={`#/learn/${id}`}
                    onClick={(e) => (e.preventDefault(), goStep(k))}
                    className="inline-flex gap-2 py-0.5 text-foreground/85 hover:text-foreground hover:underline underline-offset-2"
                  >
                    <span className="tabular-nums font-semibold text-accent-text w-5 shrink-0">{k + 1}</span>
                    {s.step.title}
                    {seen.has(stepKey(k)) && <Check size={14} strokeWidth={3} aria-label="done" className="shrink-0 mt-1 text-[var(--viz-good)]" />}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </header>
        <div className="grid gap-4 content-start">
          {m.objectives.length > 0 && (
            <div className="rounded-card bg-card border-l-4 border-accent px-5 py-4">
              <p className="heading text-[16px]">By the end you will be able to</p>
              <ul className="mt-2 space-y-1.5 text-[15px] leading-[1.55] list-disc pl-5 marker:text-accent-edge">
                {m.objectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-14 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] gap-x-12">
        <ol className="relative min-w-0">
          {/* the spine: one line through every step, with the current one lit */}
          <span aria-hidden className="absolute left-[17px] top-2 bottom-2 w-[2px] bg-border" />
          {steps.map((s, k) => {
            const a = s.archetype;
            const ideas = s.step.ideas.map((t) => m.bigIdeas.find((b) => b.title === t)).filter(Boolean) as ModuleContent["bigIdeas"];
            const example = m.examples.find((x) => x.title === s.step.example);
            return (
              <li key={s.step.title} ref={(el) => (refs.current[k] = el)} data-step={k} className="relative pl-14 pb-14 scroll-mt-24 min-h-[40vh] lg:min-h-[62vh]">
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-0 grid place-items-center w-9 h-9 rounded-[9px] text-[15px] font-bold tabular-nums border-2 transition-colors",
                    k === active ? "bg-accent border-accent-edge" : "bg-background border-border text-muted-foreground"
                  )}
                >
                  {k + 1}
                </span>
                {a && <span id={`arch-${a.id}`} className="absolute -top-24" />}
                <h2 className="heading text-[22px] md:text-[25px] leading-tight pt-1">{s.step.title}</h2>
                {s.step.lead && <p className="mt-2 text-[16.5px] leading-[1.6] text-foreground/75 max-w-[62ch]">{s.step.lead}</p>}
                {ideas.map((b) => (
                  <div key={b.title} className="mt-5 max-w-[62ch]">
                    {b.title !== s.step.title && <h3 className="heading text-[16px]">{b.title}</h3>}
                    <p className="mt-1.5 text-[15.5px] leading-[1.7]">
                      {b.text}
                      {pg(b.pages)}
                    </p>
                  </div>
                ))}
                {a && (
                  <div className="mt-4 max-w-[62ch] text-[15.5px] leading-[1.7]">
                    <p>{a.story}</p>
                    <dl className="mt-4 grid gap-3 text-[14.5px] leading-[1.6]">
                      {(
                        [
                          ["What you see", a.behaviour],
                          ["Why it traps people", a.trap],
                          ["Where to intervene", a.leverage],
                        ] as const
                      ).map(([dt, dd]) => (
                        <div key={dt} className="grid sm:grid-cols-[150px_minmax(0,1fr)] gap-x-4">
                          <dt className="heading text-[14px]">{dt}</dt>
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
                {example && (
                  <div className="mt-5 max-w-[62ch] border-l-4 border-accent-edge pl-4">
                    <p className="text-[12.5px] font-semibold text-muted-foreground">From practice</p>
                    <h3 className="heading text-[15.5px] mt-0.5">
                      {example.title}
                      {pg(example.pages)}
                    </h3>
                    <p className="mt-1 text-[15px] leading-[1.6]">{example.text}</p>
                  </div>
                )}
                {/* on narrow screens the workbench sits inside each step */}
                <div className="lg:hidden mt-5">
                  <Bench r={s} onOpen={onOpen} />
                </div>
                {s.step.exercises?.length ? (
                  <div className="mt-5 grid gap-3 max-w-[62ch]">
                    {s.step.exercises.map(exercise)}
                  </div>
                ) : null}
                <button
                  onClick={() => markSeen(stepKey(k))}
                  disabled={seen.has(stepKey(k))}
                  className="brick brick-w mt-6 h-9 max-sm:min-h-11 px-3.5 text-[13px] font-semibold inline-flex items-center gap-1.5 print:hidden"
                >
                  {seen.has(stepKey(k)) ? (
                    <>
                      <Check size={14} strokeWidth={3} aria-hidden className="text-[var(--viz-good)]" /> Step {k + 1} done
                    </>
                  ) : (
                    `Mark step ${k + 1} as done`
                  )}
                </button>
              </li>
            );
          })}
        </ol>
        <aside className="hidden lg:block" aria-label="Workbench for the current step">
          <div className="sticky top-[84px] h-[calc(100dvh-108px)] flex flex-col gap-2">
            {stepper}
            <div className="flex-1 min-h-0">{steps[shown] && <Bench key={shown} r={steps[shown]} onOpen={onOpen} sticky />}</div>
          </div>
        </aside>
      </div>
      <div className="lg:hidden print:hidden sticky bottom-0 z-20 -mx-4 px-4 py-2.5 bg-background/95 backdrop-blur border-t border-border">{stepper}</div>

      <div className="max-w-[1100px]">
        {(restEx.length > 0 || restExamples.length > 0) && (
          <section className="mt-6">
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
            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {restEx.map(([, k]) => exercise(k))}
            </div>
          </section>
        )}

        <ModuleReadings id={id} go={onOpen} />

        {m.pitfalls.length > 0 && (
          <section className="mt-14">
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

        {notebookForModule(id) && (
          <section className="mt-10 print:hidden">
            <h2 className="heading text-[17px]">In Python</h2>
            <p className="mt-1 text-[14px] text-muted-foreground max-w-[70ch]">
              The same models in a Jupyter notebook: run them in code, change them, and work the exercises. It is also{" "}
              <a href={`./book/${notebookForModule(id)!.file.replace(".ipynb", ".html")}`} className="tlink font-semibold">a chapter of the book</a>, with every plot already drawn.
            </p>
            <div className="mt-3"><NotebookLinks file={notebookForModule(id)!.file} title={`${m.def.title} in Python`} /></div>
          </section>
        )}

        {m.def.deeper && (
          <section className="mt-10">
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
            <button onClick={() => onModule(next.def.id)} className="brick brick-w text-left sm:text-right px-5 py-4">
              <span className="flex sm:justify-end items-center gap-1 text-[13px]">
                Next module <ChevronRight size={14} aria-hidden />
              </span>
              <span className="heading block text-[17px] mt-1">{next.def.title}</span>
            </button>
          )}
        </nav>
      </div>
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
          <div className="rounded-card bg-card border-l-4 border-accent px-5 py-4">
            <p className="heading text-[16px]">Archetype{arch.length > 1 ? "s" : ""} this molecule runs</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {arch.map((a) => (
                <button key={a.id} onClick={() => onModule("archetypes", `arch-${a.id}`)} className="brick brick-w h-9 max-sm:min-h-11 px-3.5 text-[13px] font-semibold">
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
