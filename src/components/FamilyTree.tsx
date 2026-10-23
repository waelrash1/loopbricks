import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { GROUPS, MODELS } from "@/data/molecules";
import { TOUR, childrenOf, groupOf, parentsOf } from "@/data/catalog";
import { useSeen } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Layout: columns are how many building steps a molecule sits above the starting atoms (its longest chain of parents);
// within a column, each brick sits near the average height of its parents, so lines stay short.
const NODE_W = 172, NODE_H = 32, COL_W = 222, GAP = 5, PAD = 14, HEAD = 24;
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
  if (name.length <= 22) return [name];
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
  // on a large screen the whole tree fits the window; on a phone that would be unreadably small, so it scrolls
  const [fit, setFit] = useState(() => matchMedia("(min-width: 1024px)").matches);
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
    <div className="flex flex-col lg:h-full min-h-0">
      {/* one row: the title, then either a one-line guide or the selected brick's links; no card over the map */}
      <div className="shrink-0 mb-2 flex flex-wrap items-center gap-x-4 gap-y-2 min-h-[40px]">
        <h2 className="heading text-[24px] md:text-[28px]">How the molecules connect</h2>
        {sel ? (
          <dl className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] min-w-0">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Selected</dt>
              <dd className="rounded-[7px] bg-accent text-accent-foreground px-2.5 py-1 font-bold shadow-[0_2px_0_hsl(var(--accent-edge))]" title={MODELS[sel].lede}>
                {MODELS[sel].name}
              </dd>
            </div>
            {(
              [
                ["Built from", parentsOf(sel), "bg-foreground text-background"],
                ["Used in", childrenOf(sel), "bg-accent/35"],
              ] as const
            ).map(([label, keys, tone]) => (
              <div key={label} className="flex flex-wrap items-center gap-1.5">
                <dt className="text-muted-foreground">{label}</dt>
                {keys.length ? (
                  keys.map((k) => (
                    <dd key={k}>
                      <button onClick={() => setSel(k)} className={cn("rounded-[6px] px-2 py-0.5 font-semibold", tone)}>
                        {MODELS[k].name}
                      </button>
                    </dd>
                  ))
                ) : (
                  <dd className="text-muted-foreground">{label === "Built from" ? "nothing, a starting atom" : "nothing yet"}</dd>
                )}
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-[14px] text-foreground/75">
            Each column is one building step up from the atoms. Select a brick to light up what it is built from (navy) and what builds on it (yellow).
          </p>
        )}
      </div>
      <div className="shrink-0 flex items-start gap-3 mb-1">
      <div role="group" aria-label="Highlight a family" className="flex-1 min-w-0 flex gap-2 overflow-x-auto pb-2 -ml-4 pl-4 md:ml-0 md:pl-0 [scrollbar-width:thin]">
        {[undefined, ...GROUPS.map((g) => g.title)].map((t) => (
          <button
            key={t ?? "all"}
            aria-pressed={fam === t}
            onClick={() => (setFam(t), setSel(undefined))}
            className={cn("brick shrink-0 h-8 max-sm:min-h-11 px-3 text-[12.5px] font-semibold whitespace-nowrap", fam === t ? "brick-y" : "brick-w")}
          >
            {t ?? "All families"}
          </button>
        ))}
      </div>
        <div className="shrink-0 flex gap-2">
          {sel && (
            <Button size="sm" onClick={() => onOpen(sel)}>
              Open
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => setFit((f) => !f)} aria-pressed={fit}>
            {fit ? <Minimize2 size={15} aria-hidden /> : <Maximize2 size={15} aria-hidden />}
            {fit ? "Actual size" : "Fit to screen"}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
      <div ref={scroller} className={cn("sheet !p-0 overscroll-contain lg:h-full", fit ? "overflow-hidden" : "overflow-auto max-h-[75dvh] lg:max-h-none")}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={fit ? "100%" : W}
          height={fit ? "100%" : H}
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label={`Family tree of ${TOUR.length} molecules in ${columns} levels`}
          className="block"
          onClick={(e) => e.target === e.currentTarget && setSel(undefined)}
        >
          {STEPS.slice(0, columns).map((s, c) => (
            <text key={s} x={PAD + c * COL_W} y={PAD + 2} fontSize={13} fontWeight={700} fill="hsl(var(--muted-foreground))">
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
            const fill = st === "focus" ? "hsl(var(--accent))" : st === "up" ? "hsl(var(--foreground))" : st === "down" ? "hsl(var(--accent) / 0.35)" : "hsl(var(--card))";
            const ink = st === "up" ? "hsl(var(--background))" : st === "focus" ? "hsl(var(--accent-foreground))" : "hsl(var(--foreground))";
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
                    y={y + NODE_H / 2 + (i - (ls.length - 1) / 2) * 12.5}
                    dominantBaseline="central"
                    fontSize={13}
                    fontWeight={st === "focus" ? 700 : 600}
                    fill={ink}
                  >
                    {l}
                  </text>
                ))}
                {seen.has(k) && (
                  <circle cx={x + NODE_W - 10} cy={y + 10} r={3.5} fill={st === "up" ? "hsl(var(--background))" : "var(--viz-good)"}>
                    <title>Opened before</title>
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      </div>

    </div>
  );
}
