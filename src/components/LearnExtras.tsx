import { useMemo, useState } from "react";
import { Check, RotateCcw, Shuffle, Trash2 } from "lucide-react";
import { MODELS, type Model } from "@/data/molecules";
import { ARCHETYPES, MODULE_CONTENT } from "@/data/learn";
import type { Quiz } from "@/data/learn/types";
import { QuizBlock, doneKey } from "@/components/Learn";
import CausalLoopDiagram from "@/components/CausalLoopDiagram";
import { cldSize, loopsIn, nodeBox } from "@/lib/cldGeometry";
import { markSeen, useSeen } from "@/lib/progress";
import { cn } from "@/lib/utils";

const wrap = "page";
type Cld = Model["cld"];

function Crumb({ onIndex, here }: { onIndex: () => void; here: string }) {
  return (
    <p className="text-sm text-muted-foreground mb-6">
      <button onClick={onIndex} className="hover:text-foreground">
        Learn
      </button>
      <span aria-hidden className="mx-2">/</span>
      <span className="text-foreground font-semibold">{here}</span>
    </p>
  );
}

// ---- mixed review: questions drawn across the modules you have finished ------------------------------------------
export function ReviewPage({ onIndex, onModule }: { onIndex: () => void; onModule: (id: string) => void }) {
  const seen = useSeen();
  const [round, setRound] = useState(0);
  const done = MODULE_CONTENT.filter((m) => seen.has(doneKey(m.def.id)));
  // ponytail: with fewer than two modules done, review the foundations instead
  const pool = (done.length >= 2 ? done : MODULE_CONTENT.filter((m) => m.def.level === "Foundations")).flatMap((m) => m.quiz.map((q) => ({ q, m })));
  const pick = useMemo(() => {
    const a = [...pool];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done.length]);
  return (
    <div className={`${wrap} pt-6 md:pt-8`}>
      <Crumb onIndex={onIndex} here="Review" />
      <h1 className="display text-[32px] md:text-[44px]">Mixed review</h1>
      <p className="mt-3 text-[16.5px] leading-[1.6] text-foreground/85 max-w-[62ch]">
        Eight questions drawn at random from {done.length >= 2 ? `the ${done.length} modules you have finished` : "the foundation modules (finish two modules to review your own)"}. Mixing topics makes you decide which idea applies, which is
        what real problems ask of you.
      </p>
      <button onClick={() => setRound((r) => r + 1)} className="brick brick-w mt-4 h-9 max-sm:min-h-11 px-3.5 text-[13px] font-semibold inline-flex items-center gap-2">
        <Shuffle size={14} aria-hidden /> New set
      </button>
      <QuizBlock key={round} quiz={pick.map((x) => x.q) as Quiz[]} />
      <p className="mt-6 text-[14px] text-muted-foreground">
        Questions came from:{" "}
        {[...new Set(pick.map((x) => x.m.def.id))].map((id, i) => (
          <span key={id}>
            {i > 0 && ", "}
            <button onClick={() => onModule(id)} className="tlink font-semibold text-foreground">
              {MODULE_CONTENT.find((m) => m.def.id === id)?.def.title}
            </button>
          </span>
        ))}
      </p>
    </div>
  );
}

// ---- loop drawing: connect the variables, then check links, signs and loops against a model answer ------------------
type DrawEx = { id: string; title: string; story: string; cld: Cld; group: string };
export const DRAW_EXERCISES: DrawEx[] = [
  ...ARCHETYPES.map((a) => ({ id: `arch-${a.id}`, title: a.name, story: a.story, cld: a.cld, group: "System archetypes" })),
  ...Object.entries(MODELS)
    .filter(([, m]) => m.cld.loops.length >= 1 && m.cld.vars.length >= 3 && m.cld.vars.length <= 7)
    .map(([k, m]) => ({ id: `m-${k}`, title: m.name, story: m.lede, cld: m.cld, group: "Molecules" })),
];
type UL = { from: string; to: string; sign: "+" | "−" };
const key = (l: { from: string; to: string }) => `${l.from}>${l.to}`;

export function DrawIndex({ onDraw, onIndex }: { onDraw: (id: string) => void; onIndex: () => void }) {
  const seen = useSeen();
  return (
    <div className={`${wrap} pt-6 md:pt-8`}>
      <Crumb onIndex={onIndex} here="Draw the loops" />
      <h1 className="display text-[32px] md:text-[44px]">Draw the loops</h1>
      <p className="mt-3 text-[16.5px] leading-[1.6] text-foreground/85 max-w-[62ch]">
        Read a short story, connect its variables with causal links and signs, and check your diagram against a model answer. The check tells you which links are right, which signs
        are wrong, what is missing, and which loops your diagram forms.
      </p>
      {["System archetypes", "Molecules"].map((g) => (
        <section key={g} className="mt-10">
          <h2 className="heading text-[22px]">{g}</h2>
          {g === "Molecules" && <p className="mt-1 text-[14.5px] text-muted-foreground max-w-[70ch]">Molecules are the small, reusable model structures in the LoopBricks library, such as a stock that drains away or a loop that closes a gap to a goal.</p>}
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DRAW_EXERCISES.filter((x) => x.group === g).map((x) => (
              <button key={x.id} onClick={() => onDraw(x.id)} className="brick brick-w text-left p-4">
                <span className="heading text-[15.5px] flex justify-between gap-2">
                  {x.title}
                  {seen.has(`done:draw/${x.id}`) && <Check size={16} strokeWidth={3} aria-label="solved" className="shrink-0 text-[var(--viz-good)]" />}
                </span>
                <span className="mt-1 block text-[13px] text-muted-foreground">
                  {x.cld.vars.length} variables, {x.cld.loops.length} loop{x.cld.loops.length > 1 ? "s" : ""}
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function DrawPage({ id, onIndex, onAll }: { id: string; onIndex: () => void; onAll: () => void }) {
  const ex = DRAW_EXERCISES.find((x) => x.id === id);
  if (!ex)
    return (
      <div className={`${wrap} pt-10`}>
        <p className="sheet">
          No exercise called “{id}”.{" "}
          <button onClick={onAll} className="tlink font-semibold">
            See all
          </button>
        </p>
      </div>
    );
  return (
    <div className={`${wrap} pt-6 md:pt-8`}>
      <p className="text-sm text-muted-foreground mb-6">
        <button onClick={onIndex} className="hover:text-foreground">
          Learn
        </button>
        <span aria-hidden className="mx-2">/</span>
        <button onClick={onAll} className="hover:text-foreground">
          Draw the loops
        </button>
      </p>
      <h1 className="display text-[30px] md:text-[40px]">{ex.title}</h1>
      <p className="mt-3 text-[16px] leading-[1.65] max-w-[70ch]" dangerouslySetInnerHTML={{ __html: ex.story }} />
      <DrawBoard cld={ex.cld} title={ex.title} solvedKey={`done:draw/${ex.id}`} />
    </div>
  );
}

// The drawing surface on its own: used by the loop-drawing pages and by the modelling studio practice briefs.
export function DrawBoard({ cld, title, solvedKey, stacked }: { cld: Cld; title: string; solvedKey?: string; stacked?: boolean }) {
  const [links, setLinks] = useState<UL[]>([]);
  const [from, setFrom] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [form, setForm] = useState<UL>({ from: "", to: "", sign: "+" });
  const [W, H] = cldSize(cld);
  const boxes = Object.fromEntries(cld.vars.map((v) => [v.id, nodeBox(v)]));
  const answer = new Map(cld.links.map((l) => [key(l), l.sign]));
  const label = (vid: string) => cld.vars.find((v) => v.id === vid)?.label ?? vid;
  const add = (l: UL) => {
    if (l.from === l.to || links.some((x) => key(x) === key(l))) return;
    setLinks((ls) => [...ls, l]);
    setChecked(false);
  };
  const status = (l: UL) => (!answer.has(key(l)) ? "extra" : answer.get(key(l)) === l.sign ? "right" : "sign");
  const missing = cld.links.filter((l) => !links.some((u) => key(u) === key(l)));
  const right = links.filter((l) => status(l) === "right").length;
  const mine = loopsIn({ ...cld, links: links.map((l) => ({ ...l })) });
  const theirs = loopsIn(cld);
  const allRight = right === cld.links.length && links.length === right;
  const solved = checked && allRight;
  const count = (xs: ("B" | "R")[]) => `${xs.filter((x) => x === "R").length} reinforcing, ${xs.filter((x) => x === "B").length} balancing`;

  // where a link leaves and enters its boxes; a there-and-back pair bows apart so both stay visible
  const geo = (l: UL) => {
    const a = boxes[l.from], b = boxes[l.to];
    const pair = links.some((x) => x.from === l.to && x.to === l.from);
    const dx = b.cx - a.cx, dy = b.cy - a.cy, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, bow = pair ? 22 : 0;
    const cx = (a.cx + b.cx) / 2 + nx * bow, cy = (a.cy + b.cy) / 2 + ny * bow;
    const clip = (bx: typeof a, tx: number, ty: number): [number, number] => {
      const ddx = tx - bx.cx, ddy = ty - bx.cy, s = Math.min(ddx ? bx.w / 2 / Math.abs(ddx) : 1e9, ddy ? bx.h / 2 / Math.abs(ddy) : 1e9);
      return [bx.cx + ddx * s, bx.cy + ddy * s];
    };
    const [sx, sy] = clip(a, cx, cy), [ex2, ey] = clip(b, cx, cy);
    return { d: `M ${sx} ${sy} Q ${cx} ${cy} ${ex2} ${ey}`, mx: (sx + 2 * cx + ex2) / 4 + nx * 10, my: (sy + 2 * cy + ey) / 4 + ny * 10 };
  };
  const TONE = { right: "var(--viz-good)", sign: "hsl(var(--accent-text))", extra: "var(--viz-pink)", fg: "hsl(var(--foreground))" };
  const tone = (l: UL) => (checked ? status(l) : "fg");

  return (
    <>
      <p className="mt-3 text-[14.5px] text-muted-foreground max-w-[70ch]">
        Click a variable, then the variable it affects. Click a sign to switch between + and −. The model answer has {cld.links.length} links.
      </p>

      <div className={cn("mt-5 grid gap-6", !stacked && "lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]")}>
        <div className="sheet">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img" aria-label="Your causal loop diagram">
            <defs>
              {Object.entries(TONE).map(([k, c]) => (
                <marker key={k} id={`dl-${k}`} markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <path d="M0,0 L9,4 L0,8 Z" fill={c} />
                </marker>
              ))}
            </defs>
            {links.map((l) => {
              const g = geo(l), t = tone(l), c = TONE[t];
              return (
                <g key={key(l)}>
                  <path d={g.d} fill="none" stroke={c} strokeWidth={2} strokeDasharray={checked && status(l) === "extra" ? "5 4" : undefined} markerEnd={`url(#dl-${t})`} />
                  <text
                    x={g.mx}
                    y={g.my}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={16}
                    fontWeight={700}
                    fill={c}
                    className="cursor-pointer"
                    onClick={() => (setLinks((ls) => ls.map((x) => (key(x) === key(l) ? { ...x, sign: x.sign === "+" ? "−" : "+" } : x))), setChecked(false))}
                  >
                    {l.sign}
                  </text>
                </g>
              );
            })}
            {cld.vars.map((v) => {
              const b = boxes[v.id];
              return (
                <g key={v.id} className="cursor-pointer" onClick={() => (from === null ? setFrom(v.id) : (add({ from, to: v.id, sign: "+" }), setFrom(null)))}>
                  <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8} fill={from === v.id ? "hsl(var(--accent))" : "hsl(var(--card))"} stroke="hsl(var(--foreground))" strokeWidth={from === v.id ? 2.4 : 1.4} />
                  <text x={b.cx} y={b.cy} textAnchor="middle" dominantBaseline="central" fontSize={13} fill="hsl(var(--foreground))">
                    {v.label}
                  </text>
                </g>
              );
            })}
          </svg>
          {from && <p className="mt-2 text-[13.5px]">From <b>{label(from)}</b>: now click the variable it affects (or click it again to cancel).</p>}
          {/* the same actions without a pointer */}
          <form
            className="mt-3 flex flex-wrap items-end gap-2 text-[13px]"
            onSubmit={(e) => {
              e.preventDefault();
              if (form.from && form.to) add(form);
            }}
          >
            {(["from", "to"] as const).map((f) => (
              <label key={f} className="grid gap-1">
                <span className="font-semibold">{f === "from" ? "From" : "To"}</span>
                <select value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} className="rounded-[6px] border border-border bg-background px-2 py-1.5 max-sm:min-h-11">
                  <option value="">Choose</option>
                  {cld.vars.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label className="grid gap-1">
              <span className="font-semibold">Sign</span>
              <select value={form.sign} onChange={(e) => setForm({ ...form, sign: e.target.value as UL["sign"] })} className="rounded-[6px] border border-border bg-background px-2 py-1.5 max-sm:min-h-11">
                <option value="+">+</option>
                <option value="−">−</option>
              </select>
            </label>
            <button className="brick brick-w h-9 max-sm:min-h-11 px-3 font-semibold">Add link</button>
          </form>
        </div>

        <div className="grid gap-3 content-start">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => (setChecked(true), allRight && solvedKey && markSeen(solvedKey))} disabled={!links.length} className="brick brick-y h-10 max-sm:min-h-11 px-4 text-[14px] font-semibold disabled:opacity-50">
              Check my diagram
            </button>
            <button onClick={() => (setLinks([]), setChecked(false), setReveal(false))} className="brick brick-w h-10 max-sm:min-h-11 px-3 text-[13px] font-semibold inline-flex items-center gap-1.5">
              <RotateCcw size={14} aria-hidden /> Start again
            </button>
          </div>
          {links.length > 0 && (
            <ul className="text-[13.5px] grid gap-1">
              {links.map((l) => (
                <li key={key(l)} className="flex items-center justify-between gap-2">
                  <span className={cn(checked && { right: "text-[var(--viz-good)]", sign: "text-accent-text", extra: "text-[var(--viz-pink)]" }[status(l)])}>
                    {label(l.from)} → {label(l.to)} ({l.sign}){checked && { right: "", sign: ": check the sign", extra: ": not in the model" }[status(l)]}
                  </span>
                  <button aria-label={`Remove ${label(l.from)} to ${label(l.to)}`} onClick={() => (setLinks((ls) => ls.filter((x) => key(x) !== key(l))), setChecked(false))} className="text-muted-foreground hover:text-foreground">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {checked && (
            <div role="status" className={cn("rounded-card px-4 py-3 text-[14px] leading-[1.6]", solved ? "bg-accent/30" : "border border-border")}>
              {solved ? (
                <b>Every link and sign matches the model answer.</b>
              ) : (
                <>
                  <b>
                    {right} of {cld.links.length} links right.
                  </b>{" "}
                  {missing.length > 0 && `${missing.length} missing. `}
                  {links.filter((l) => status(l) === "sign").length > 0 && `${links.filter((l) => status(l) === "sign").length} with the wrong sign. `}
                  {links.filter((l) => status(l) === "extra").length > 0 && `${links.filter((l) => status(l) === "extra").length} not in the model (a different story can justify them, so think about why). `}
                </>
              )}
              <p className="mt-2">
                Your diagram forms {mine.length ? count(mine) : "no"} loop{mine.length === 1 ? "" : "s"}; the model has {count(theirs)}.
              </p>
            </div>
          )}
          <button onClick={() => setReveal((v) => !v)} className="text-left text-[13.5px] font-semibold underline underline-offset-2 max-sm:min-h-11">
            {reveal ? "Hide the model answer" : "Show the model answer"}
          </button>
          {reveal && (
            <div className="sheet">
              <CausalLoopDiagram model={{ name: title, cld: cld } as unknown as Model} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
