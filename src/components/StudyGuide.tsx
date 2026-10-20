import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { MODELS, type Model } from "@/data/molecules";
import { BOOK_REF, BOOK_TOC, chapterById } from "@/data/sterman";
import type { StudyChapter, StudyDiagram } from "@/data/sterman/types";
import CausalLoopDiagram from "@/components/CausalLoopDiagram";

const wrap = "max-w-[1100px] mx-auto px-4 md:px-8";
const sub = "heading text-[22px] md:text-[24px]";
// "p. 12" for one page, "pp. 12–15" for a range or a list
const pg = (p?: string) => (p ? <span className="text-muted-foreground text-[13px] whitespace-nowrap"> ({/[-–,]/.test(p) ? "pp." : "p."} {p.replace(/-/g, "–")})</span> : null);
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

export function BookIndex({ onChapter }: { onChapter: (id: string) => void }) {
  const parts = [...new Set(BOOK_TOC.map((c) => c.part))];
  const written = BOOK_TOC.filter((c) => c.chapter).length;
  return (
    <div className={`${wrap} pt-10 md:pt-14`}>
      <p className="flex items-center gap-2 text-[14px] font-semibold text-muted-foreground">
        <BookOpen size={16} aria-hidden /> Study guide
      </p>
      <h1 className="display text-[36px] md:text-[50px] max-w-[22ch] mt-2">Business Dynamics, chapter by chapter</h1>
      <p className="mt-5 text-[17px] leading-[1.6] text-foreground/80 max-w-[64ch]">
        The big ideas, structures and formulations of John Sterman's textbook, explained in our own words with page references, redrawn as diagrams, and linked to molecules you can run.
        Read it beside the book, not instead of it. {written < BOOK_TOC.length && `${written} of ${BOOK_TOC.length} chapters are ready.`}
      </p>
      {parts.map((part) => (
        <section key={part} className="mt-10">
          <h2 className="heading text-[20px]">{part}</h2>
          <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BOOK_TOC.filter((c) => c.part === part).map((c) => (
              <li key={c.id}>
                <button
                  disabled={!c.chapter}
                  onClick={() => onChapter(c.id)}
                  className="brick brick-w w-full h-full text-left p-4 grid grid-cols-[34px_minmax(0,1fr)] gap-2 disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  <span className="display text-[24px] text-accent-edge leading-none">{c.number}</span>
                  <span>
                    <span className="heading block text-[15.5px]">{c.title}</span>
                    <span className="block mt-1 text-[12.5px] text-muted-foreground">
                      {c.chapter ? `${c.chapter.bigIdeas.length} ideas, ${c.chapter.diagrams.length} diagrams, ${c.chapter.exercises.length} exercises` : "Coming"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="mt-12 text-[13px] text-muted-foreground max-w-[80ch]">
        Source: {BOOK_REF} Page numbers refer to that edition. Diagrams are redrawn, not reproduced, and text is paraphrased.
      </p>
    </div>
  );
}

export function ChapterPage({ id, onChapter, onBook, onOpen }: { id: string; onChapter: (id: string) => void; onBook: () => void; onOpen: (hash: string) => void }) {
  const entry = chapterById(id);
  if (!entry?.chapter)
    return (
      <div className={`${wrap} pt-10`}>
        <p className="sheet text-[15px]">
          That chapter is not in the study guide yet.{" "}
          <button onClick={onBook} className="tlink font-semibold">
            See the chapters that are ready
          </button>
        </p>
      </div>
    );
  const c = entry.chapter as StudyChapter;
  const ready = BOOK_TOC.filter((x) => x.chapter);
  const i = ready.findIndex((x) => x.id === id);
  const [prev, next] = [ready[i - 1], ready[i + 1]];
  const sections = [
    ["big-ideas", "Big ideas"],
    ["diagrams", "Diagrams"],
    ["formulations", "Formulations"],
    ["cases", "Cases"],
    ["exercises", "Exercises"],
    ["pitfalls", "Mistakes to avoid"],
  ].filter(([k]) => (k === "formulations" ? c.formulations.length : k === "cases" ? c.cases.length : true));
  const go = (k: string) => document.getElementById(`sg-${k}`)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

  return (
    <article className={`${wrap} pt-6 md:pt-8`}>
      <p className="text-sm text-muted-foreground mb-6">
        <button onClick={onBook} className="hover:text-foreground">
          Business Dynamics study guide
        </button>
        <span aria-hidden className="mx-2">/</span>
        <span className="text-foreground font-semibold">{c.part}</span>
      </p>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 items-start">
        <span aria-hidden className="display text-[64px] md:text-[88px] leading-[0.85] text-accent [-webkit-text-stroke:2px_hsl(var(--foreground))]">
          {c.number}
        </span>
        <div>
          <h1 className="display text-[30px] md:text-[44px] max-w-[24ch] hyphens-auto">{c.title}</h1>
          <p className="mt-2 text-[14px] text-muted-foreground">Sterman (2000), pp. {c.pages}</p>
        </div>
      </div>
      <p className="mt-6 text-[18px] leading-[1.6] text-foreground/85 max-w-[66ch]">{c.summary}</p>

      <nav aria-label="In this chapter" className="mt-6 flex flex-wrap gap-2 print:hidden">
        {sections.map(([k, label]) => (
          <button key={k} onClick={() => go(k)} className="brick brick-w h-8 px-3 text-[13px] font-semibold">
            {label}
          </button>
        ))}
      </nav>

      <section id="sg-big-ideas" className="mt-12 scroll-mt-24">
        <h2 className={sub}>Big ideas</h2>
        <ol className="mt-4 grid md:grid-cols-2 gap-x-8 gap-y-6">
          {c.bigIdeas.map((b, k) => (
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

      <section id="sg-diagrams" className="mt-14 scroll-mt-24">
        <h2 className={sub}>Diagrams</h2>
        <div className="mt-4 grid gap-5">
          {c.diagrams.map((d) => (
            <Diagram key={d.title} d={d} />
          ))}
        </div>
      </section>

      {c.formulations.length > 0 && (
        <section id="sg-formulations" className="mt-14 scroll-mt-24">
          <h2 className={sub}>Formulations</h2>
          <div className="mt-4 grid gap-4">
            {c.formulations.map((f) => (
              <div key={f.name} className="sheet">
                <h3 className="heading text-[16.5px]">
                  {f.name}
                  {pg(f.pages)}
                </h3>
                <pre className="mt-3 rounded-[8px] bg-background px-4 py-3 text-[13.5px] font-mono whitespace-pre-wrap [overflow-wrap:anywhere]">{f.equations.join("\n")}</pre>
                <p className="mt-3 text-[15px] leading-[1.6] max-w-[75ch]">{f.explain}</p>
                {f.molecule && MODELS[f.molecule] && (
                  <button onClick={() => onOpen(`/m/${f.molecule}`)} className="brick brick-w mt-3 h-9 px-3.5 text-[13px] font-semibold">
                    Run it: {MODELS[f.molecule].name}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {c.cases.length > 0 && (
        <section id="sg-cases" className="mt-14 scroll-mt-24">
          <h2 className={sub}>Cases from the chapter</h2>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            {c.cases.map((x) => (
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

      <section id="sg-exercises" className="mt-14 scroll-mt-24">
        <h2 className={sub}>Exercises</h2>
        <ol className="mt-4 grid gap-3 max-w-[85ch]">
          {c.exercises.map((x, k) => (
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

      <section id="sg-pitfalls" className="mt-14 scroll-mt-24">
        <h2 className={sub}>Mistakes to avoid</h2>
        <ul className="mt-3 space-y-2 text-[15.5px] leading-[1.6] list-disc pl-5 marker:text-accent-edge max-w-[80ch]">
          {c.pitfalls.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      {c.molecules.length > 0 && (
        <section className="mt-10">
          <h2 className="heading text-[17px]">Practise with these molecules</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {c.molecules.filter((k) => MODELS[k]).map((k) => (
              <button key={k} onClick={() => onOpen(`/m/${k}`)} className="brick brick-w h-9 px-3.5 text-[13px] font-semibold">
                {MODELS[k].name}
              </button>
            ))}
          </div>
        </section>
      )}

      <p className="mt-10 text-[13px] text-muted-foreground">Source: {BOOK_REF} Paraphrased, with diagrams redrawn.</p>

      <nav aria-label="Next and previous chapter" className="mt-8 grid sm:grid-cols-2 gap-4 print:hidden">
        {prev ? (
          <button onClick={() => onChapter(prev.id)} className="brick brick-w text-left px-5 py-4">
            <span className="flex items-center gap-1 text-[13px] text-muted-foreground">
              <ChevronLeft size={14} aria-hidden /> Chapter {prev.number}
            </span>
            <span className="heading block text-[17px] mt-1">{prev.title}</span>
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button onClick={() => onChapter(next.id)} className="brick brick-y text-left sm:text-right px-5 py-4">
            <span className="flex sm:justify-end items-center gap-1 text-[13px]">
              Chapter {next.number} <ChevronRight size={14} aria-hidden />
            </span>
            <span className="heading block text-[17px] mt-1">{next.title}</span>
          </button>
        )}
      </nav>
    </article>
  );
}
