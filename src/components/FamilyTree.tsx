import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { GROUPS, MODELS } from "@/data/molecules";
import { TOUR, childrenOf, groupOf, parentsOf } from "@/data/catalog";
import { useSeen } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Layout: columns are how many building steps a molecule sits above the starting atoms (its longest chain of parents);
// within a column, each brick sits near the average height of its parents, so lines stay short.
const NODE_W = 178, NODE_H = 40, COL_W = 250, GAP = 10, PAD = 24, HEAD = 34;
const STEPS = ["Starting atoms", "One step up", "Two steps up", "Three steps up", "Four steps up", "Five steps up", "Six steps up"];

function layout() {
  const depth: Record<string, number> = {};
  const d = (k: string): number => (k in depth ? depth[k] : (depth[k] = parentsOf(k).length ? 1 + Math.max(...parentsOf(k).map(d)) : 0));
  TOUR.forEach(d);
  const family = (k: string) => GROUPS.findIndex((g) => g.keys.includes(k));
  const cols: string[][] = [];
  TOUR.forEach((k) => (cols[depth[k]] ??= []).push(k));
  const y: Record<string, number> = {};
  cols.forEach((col, c) => {
    const want = (k: string) => (c === 0 ? family(k) * 1000 : parentsOf(k).reduce((s, p) => s + y[p], 0) / parentsOf(k).length);
    col.sort((a, b) => want(a) - want(b) || family(a) - family(b));
    let next = 0;
    col.forEach((k, i) => {
      y[k] = c === 0 ? i * (NODE_H + GAP) : Math.max(want(k), next);
      next = y[k] + NODE_H + GAP;
    });
  });
  const top = Math.min(...TOUR.map((k) => y[k]));
  const pos: Record<string, { x: number; y: number }> = {};
  TOUR.forEach((k) => (pos[k] = { x: PAD + depth[k] * COL_W, y: HEAD + PAD + y[k] - top }));
  const W = PAD * 2 + (cols.length - 1) * COL_W + NODE_W;
  const H = Math.max(...TOUR.map((k) => pos[k].y)) + NODE_H + PAD;
  return { pos, W, H, columns: cols.length };
}

// every ancestor (built from, all the way down) and every descendant (used in, all the way up)
const closure = (k: string, next: (k: string) => string[]) => {
  const out = new Set<string>();
  const walk = (x: string) => next(x).forEach((y) => !out.has(y) && (out.add(y), walk(y)));
  walk(k);
  return out;
};

// split a long name onto two lines at the space nearest the middle
const lines = (name: string) => {
  if (name.length <= 21) return [name];
  const mid = name.length / 2;
  let best = -1;
  for (let i = 0; i < name.length; i++) if (name[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return best < 0 ? [name] : [name.slice(0, best), name.slice(best + 1)];
};

export default function FamilyTree({ initial, onOpen }: { initial?: string; onOpen: (k: string) => void }) {
  const { pos, W, H, columns } = useMemo(layout, []);
  const [sel, setSel] = useState<string | undefined>(initial);
  const [hover, setHover] = useState<string>();
  const [fam, setFam] = useState<string>();
  const [fit, setFit] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const seen = useSeen();
  const focus = hover ?? sel;
  const up = useMemo(() => (focus ? closure(focus, parentsOf) : new Set<string>()), [focus]);
  const down = useMemo(() => (focus ? closure(focus, childrenOf) : new Set<string>()), [focus]);

  // a link from a molecule page lands with that brick selected and in view
  useEffect(() => {
    setSel(initial);
    if (!initial || !scroller.current) return;
    // scroll only the tree's own box, so the page (and the detail card above) stays put
    const p = pos[initial], box = scroller.current;
    box.scrollTo({ left: p.x - box.clientWidth / 2 + NODE_W / 2, top: p.y - box.clientHeight / 2 + NODE_H / 2 });
  }, [initial, pos]);

  const state = (k: string) =>
    focus ? (k === focus ? "focus" : up.has(k) ? "up" : down.has(k) ? "down" : "dim") : fam && groupOf(k) !== fam ? "dim" : "plain";

  return (
    <div>
      <div className="sheet !p-4 md:!p-5 mb-4 grid md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-start min-h-[112px]">
        {sel ? (
          <div className="min-w-0">
            <p className="text-[12.5px] text-muted-foreground">{groupOf(sel)}</p>
            <h2 className="heading text-[22px]">{MODELS[sel].name}</h2>
            <p className="mt-1 text-[14px] leading-[1.5] text-foreground/80 max-w-[70ch]">{MODELS[sel].lede}</p>
            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
              {(
                [
                  ["Built from", parentsOf(sel), "bg-foreground text-white"],
                  ["Used in", childrenOf(sel), "bg-accent/45"],
                ] as const
              ).map(([label, keys, tone]) => (
                <div key={label} className="flex flex-wrap items-center gap-1.5">
                  <dt className="text-muted-foreground mr-1">{label}</dt>
                  {keys.length ? (
                    keys.map((k) => (
                      <dd key={k}>
                        <button onClick={() => setSel(k)} className={cn("rounded-[6px] px-2 py-0.5 font-semibold", tone)}>
                          {MODELS[k].name}
                        </button>
                      </dd>
                    ))
                  ) : (
                    <dd className="text-muted-foreground">{label === "Built from" ? "nothing: it is a starting atom" : "nothing yet: a finished brick"}</dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <p className="text-[15px] leading-[1.55] text-foreground/80 max-w-[60ch] self-center">
            Every molecule is built from simpler ones. Select a brick to light up everything it is built from, in navy, and everything that builds on it, in yellow.
          </p>
        )}
        <div className="flex gap-2 md:flex-col md:items-stretch">
          {sel && <Button onClick={() => onOpen(sel)}>Open {MODELS[sel].name.length > 18 ? "molecule" : MODELS[sel].name}</Button>}
          <Button variant="secondary" onClick={() => setFit((f) => !f)} aria-pressed={fit}>
            {fit ? <Minimize2 size={15} aria-hidden /> : <Maximize2 size={15} aria-hidden />}
            {fit ? "Actual size" : "Fit to screen"}
          </Button>
        </div>
      </div>

      <div role="group" aria-label="Highlight a family" className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {[undefined, ...GROUPS.map((g) => g.title)].map((t) => (
          <button
            key={t ?? "all"}
            aria-pressed={fam === t}
            onClick={() => (setFam(t), setSel(undefined))}
            className={cn("brick shrink-0 h-8 px-3 text-[12.5px] font-semibold whitespace-nowrap", fam === t ? "brick-y" : "brick-w")}
          >
            {t ?? "All families"}
          </button>
        ))}
      </div>

      <div ref={scroller} className="sheet !p-0 overflow-auto max-h-[78dvh] overscroll-contain">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={fit ? "100%" : W}
          height={fit ? undefined : H}
          role="group"
          aria-label={`Family tree of ${TOUR.length} molecules in ${columns} levels`}
          className="block"
          onClick={(e) => e.target === e.currentTarget && setSel(undefined)}
        >
          {STEPS.slice(0, columns).map((s, c) => (
            <text key={s} x={PAD + c * COL_W} y={PAD + 8} fontSize={12.5} fontWeight={700} fill="hsl(var(--muted-foreground))">
              {s}
            </text>
          ))}
          <g fill="none">
            {TOUR.flatMap((k) =>
              parentsOf(k).map((p) => {
                const a = pos[p], b = pos[k];
                const x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2, x2 = b.x, y2 = b.y + NODE_H / 2;
                // on the chain below the focus (ancestors) or above it (descendants)
                const lit = !!focus && (((k === focus || up.has(k)) && up.has(p)) || ((p === focus || down.has(p)) && down.has(k)));
                const dim = (focus && !lit) || (!focus && fam && (groupOf(k) !== fam || groupOf(p) !== fam));
                return (
                  <path
                    key={p + k}
                    d={`M${x1},${y1} C${x1 + 50},${y1} ${x2 - 50},${y2} ${x2},${y2}`}
                    stroke={lit ? "hsl(var(--foreground))" : "hsl(var(--edge))"}
                    strokeWidth={lit ? 2 : 1.2}
                    opacity={dim ? 0.18 : 1}
                  />
                );
              })
            )}
          </g>
          {TOUR.map((k) => {
            const { x, y } = pos[k];
            const st = state(k);
            const ls = lines(MODELS[k].name);
            const fill = st === "focus" ? "hsl(var(--accent))" : st === "up" ? "hsl(var(--foreground))" : st === "down" ? "#fbe7a1" : "hsl(var(--card))";
            const ink = st === "up" ? "#fff" : "hsl(var(--foreground))";
            return (
              <g
                key={k}
                id={`tree-${k}`}
                role="button"
                tabIndex={0}
                aria-label={`${MODELS[k].name}, ${groupOf(k)}${seen.has(k) ? ", opened before" : ""}`}
                aria-pressed={sel === k}
                className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[3px]"
                opacity={st === "dim" ? 0.3 : 1}
                onMouseEnter={() => setHover(k)}
                onMouseLeave={() => setHover(undefined)}
                onFocus={() => setHover(k)}
                onBlur={() => setHover(undefined)}
                onClick={() => setSel(k)}
                onDoubleClick={() => onOpen(k)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onOpen(k);
                  if (e.key === " ") (e.preventDefault(), setSel(k));
                }}
              >
                <rect x={x} y={y + 3} width={NODE_W} height={NODE_H} rx={8} fill={st === "focus" ? "hsl(var(--accent-edge))" : "hsl(var(--edge))"} />
                <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={8} fill={fill} stroke="hsl(var(--foreground))" strokeWidth={st === "plain" || st === "dim" ? 0 : 1.5} />
                {ls.map((l, i) => (
                  <text
                    key={i}
                    x={x + 12}
                    y={y + NODE_H / 2 + (i - (ls.length - 1) / 2) * 14}
                    dominantBaseline="central"
                    fontSize={12.5}
                    fontWeight={st === "focus" ? 700 : 600}
                    fill={ink}
                  >
                    {l}
                  </text>
                ))}
                {seen.has(k) && (
                  <circle cx={x + NODE_W - 10} cy={y + 10} r={3.5} fill={st === "up" ? "#fff" : "var(--viz-good)"}>
                    <title>Opened before</title>
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-3 text-[13px] text-muted-foreground">
        Click a brick to select it, double-click or press Enter to open it. A green dot marks molecules you have opened before. Lineage follows Hines' “immediate parents”.
      </p>
    </div>
  );
}
