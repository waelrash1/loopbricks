import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import type { Model } from "@/data/molecules";
import { FLOW_META } from "@/data/diagramMeta";
import type { FrameCb } from "@/hooks/useSimulation";
import type { Vars } from "@/sim/engine";
import { endDirs, flowShape, midpoint, shortenQ, valvePath } from "@/lib/flowGeom";

const NS = "http://www.w3.org/2000/svg";
const ACC = "#2545ff";
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// point on a box border in the direction of (tx,ty)
function edgePoint(b: { x: number; y: number; w: number; h: number }, tx: number, ty: number): [number, number] {
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2, dx = tx - cx, dy = ty - cy;
  const sx = dx ? b.w / 2 / Math.abs(dx) : 1e9, sy = dy ? b.h / 2 / Math.abs(dy) : 1e9, s = Math.min(sx, sy);
  return [cx + dx * s, cy + dy * s];
}

// ---- label layout helpers: estimated text boxes and a least-collision pick ----
type Box = { x0: number; y0: number; x1: number; y1: number };
type Anchor = "start" | "middle" | "end";
const FS = { stock: 13, flow: 11, badge: 10.5, param: 10.5, value: 16 };
const LH = { stock: 15, flow: 12.5 };
const tw = (s: string, fs: number, k = 0.55) => s.length * fs * k;
// split a long label at the space nearest its middle
function wrap(s: string, maxChars: number): string[] {
  if (s.length <= maxChars) return [s];
  let at = -1;
  for (let i = 0; i < s.length; i++) if (s[i] === " " && (at < 0 || Math.abs(i - s.length / 2) < Math.abs(at - s.length / 2))) at = i;
  return at < 0 ? [s] : [s.slice(0, at), s.slice(at + 1)];
}
function textBox(x: number, y: number, anchor: Anchor, lines: string[], fs: number, lh: number, k = 0.55): Box {
  const w = Math.max(...lines.map((l) => tw(l, fs, k)));
  const x0 = anchor === "middle" ? x - w / 2 : anchor === "start" ? x : x - w;
  return { x0: x0 - 2, y0: y - fs * 0.8, x1: x0 + w + 2, y1: y + (lines.length - 1) * lh + fs * 0.25 };
}
const cloudBox = (cx: number, cy: number): Box => ({ x0: cx - 27, y0: cy - 22, x1: cx + 27, y1: cy + 22 });
const hit = (a: Box, b: Box) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
// first candidate with the least overlap against the obstacles
function best<C, R>(cands: C[], place: (c: C) => [R, Box], obst: Box[]): R {
  let pick: R | undefined, score = Infinity;
  for (const c of cands) {
    const [r, b] = place(c), s = obst.reduce((a, o) => a + hit(b, o), 0);
    if (s < score - 0.5) [pick, score] = [r, s];
  }
  return pick as R;
}
const union = (bs: Box[]): Box => bs.reduce((a, b) => ({ x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) }), { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
// direction of the pipe segment the valve sits on
function dirAt(pts: [number, number][], x: number, y: number): [number, number] {
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]];
    if (x >= Math.min(a[0], b[0]) - 0.5 && x <= Math.max(a[0], b[0]) + 0.5 && y >= Math.min(a[1], b[1]) - 0.5 && y <= Math.max(a[1], b[1]) + 0.5) return [b[0] - a[0], b[1] - a[1]];
  }
  return [1, 0];
}

// Source / sink cloud (standard SD notation).
const CLOUD_D = "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z";
function Cloud({ cx, cy }: { cx: number; cy: number }) {
  const s = 2.7;
  return <path d={CLOUD_D} transform={`translate(${(cx - 12 * s).toFixed(1)}, ${(cy - 11 * s).toFixed(1)}) scale(${s})`} fill="hsl(var(--card))" stroke="hsl(var(--input))" strokeWidth={0.9} strokeLinejoin="round" />;
}

export default function StockFlowDiagram({
  model,
  modelKey,
  subscribe,
  running,
  showInfluences,
}: {
  model: Model;
  modelKey: string;
  subscribe: (fn: FrameCb) => () => void;
  running: boolean;
  showInfluences: boolean;
}) {
  const liquid = useRef<Record<string, SVGPathElement | null>>({});
  const vals = useRef<Record<string, SVGTextElement | null>>({});
  const pipes = useRef<Record<string, SVGPathElement | null>>({});
  const parts = useRef<Record<string, SVGGElement | null>>({});
  const runningRef = useRef(running);
  runningRef.current = running;
  const live = useRef<{ state: Vars; rates: Vars }>({ state: Object.fromEntries(model.stocks.map((s) => [s.id, s.init])), rates: {} });

  const pLabel = (id: string) => model.params.find((p) => p.id === id)?.label ?? id;

  // ---- static layout: valves, constant nodes, connectors, label and badge placement (recomputed per model) ----
  const layout = useMemo(() => {
    const meta = FLOW_META[modelKey] ?? {};
    const paramIds = new Set(model.params.map((p) => p.id));
    const valves: Record<string, [number, number]> = {};
    model.diagram.flows.forEach((f) => (valves[f.id] = midpoint(f.pts)));

    // everything already drawn, so labels and badges can steer clear of it
    const obst: Box[] = [];
    const titles: Record<string, { lines: string[]; x: number; y: number }> = {};
    for (const st of model.stocks) {
      const g = model.diagram.stocks[st.id];
      if (!g) continue;
      obst.push({ x0: g.x, y0: g.y, x1: g.x + g.w, y1: g.y + g.h });
      const lines = wrap(st.label, Math.max(g.w + 50, 140) / (FS.stock * 0.58));
      const y = g.y - 10 - (lines.length - 1) * LH.stock;
      titles[st.id] = { lines, x: g.x + g.w / 2, y };
      obst.push(textBox(g.x + g.w / 2, y, "middle", lines, FS.stock, LH.stock, 0.58));
    }
    model.diagram.flows.forEach((fl) => {
      const [vx, vy] = valves[fl.id];
      obst.push({ x0: vx - 11, y0: vy - 19, x1: vx + 11, y1: vy + 11 });
      for (let i = 1; i < fl.pts.length; i++) {
        const [a, b] = [fl.pts[i - 1], fl.pts[i]];
        obst.push({ x0: Math.min(a[0], b[0]) - 7, y0: Math.min(a[1], b[1]) - 7, x1: Math.max(a[0], b[0]) + 7, y1: Math.max(a[1], b[1]) + 7 });
      }
      const a0 = fl.pts[0], aN = fl.pts[fl.pts.length - 1], { u0, uN } = endDirs(fl.pts);
      if (!fl.from) obst.push(cloudBox(a0[0] - u0[0] * 8, a0[1] - u0[1] * 8));
      if (!fl.to) obst.push(cloudBox(aN[0] + uN[0] * 8, aN[1] + uN[1] * 8));
    });
    const base = obst.slice(); // for the content bounds
    // flow names, wrapped to two lines when long; badges keep clear of each name's usual spot above its valve
    const names: Record<string, string[]> = {};
    const reserved: Box[] = [];
    model.diagram.flows.forEach((fl) => {
      const [vx, vy] = valves[fl.id];
      const lines = (names[fl.id] = wrap(meta[fl.id]?.name ?? fl.id, 15));
      if (Math.abs(dirAt(fl.pts, vx, vy)[0]) >= Math.abs(dirAt(fl.pts, vx, vy)[1])) reserved.push(textBox(vx, vy - 23 - (lines.length - 1) * LH.flow, "middle", lines, FS.flow, LH.flow));
      // information links from the constants arrive from below
      if (showInfluences && (meta[fl.id]?.in ?? []).some((id) => paramIds.has(id))) obst.push({ x0: vx - 16, y0: vy + 10, x1: vx + 16, y1: vy + 46 });
    });

    // feedback connectors stock→valve; their loop badge goes where it hits least
    type Conn = { d: string; kind: "info" | "fb"; loop?: "B" | "R"; bx: number; by: number };
    const conns: Conn[] = [];
    model.diagram.flows.forEach((f) => {
      const m = meta[f.id];
      if (!m) return;
      const [vx, vy] = valves[f.id];
      m.in.forEach((id) => {
        if (paramIds.has(id)) return;
        const g = model.diagram.stocks[id];
        if (!g) return; // hidden/internal stock: no geometry
        const [sx, sy] = edgePoint(g, vx, vy);
        const mx = (sx + vx) / 2, my = (sy + vy) / 2;
        const nx = -(vy - sy), ny = vx - sx, len = Math.hypot(nx, ny) || 1, bow = 22;
        const cx = mx + (nx / len) * bow, cy = my + (ny / len) * bow;
        const [ex, ey] = shortenQ(cx, cy, vx, vy, 14);
        const loop = showInfluences ? (typeof m.loop === "string" ? m.loop : m.loop?.[id]) : undefined;
        let bx = cx, by = cy;
        if (loop) {
          const q = (t: number, a: number, c: number, e: number) => (1 - t) ** 2 * a + 2 * (1 - t) * t * c + t * t * e;
          [bx, by] = best([0.5, 0.4, 0.6, 0.3, 0.7, 0.2], (t) => {
            const p: [number, number] = [q(t, sx, cx, ex), q(t, sy, cy, ey)];
            return [p, { x0: p[0] - 11, y0: p[1] - 11, x1: p[0] + 11, y1: p[1] + 11 }];
          }, [...obst, ...reserved]);
          obst.push({ x0: bx - 11, y0: by - 11, x1: bx + 11, y1: by + 11 });
        }
        conns.push({ d: `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`, kind: "fb", loop, bx, by });
      });
    });

    // flow names: above/below (or beside, for vertical pipes) by fewest collisions
    const flowLabels: Record<string, { lines: string[]; x: number; y: number; anchor: Anchor }> = {};
    model.diagram.flows.forEach((fl) => {
      const [vx, vy] = valves[fl.id];
      const lines = names[fl.id];
      const n = lines.length, up = (n - 1) * LH.flow;
      const [dx, dy] = dirAt(fl.pts, vx, vy);
      const above = { x: vx, y: vy - 23 - up, anchor: "middle" as Anchor };
      const below = { x: vx, y: vy + 24, anchor: "middle" as Anchor };
      const right = { x: vx + 15, y: vy + 4 - up / 2, anchor: "start" as Anchor };
      const left = { x: vx - 15, y: vy + 4 - up / 2, anchor: "end" as Anchor };
      const w = Math.max(...lines.map((l) => tw(l, FS.flow)));
      const nudge = (c: typeof above, k: number) => ({ ...c, x: c.x + k * w * 0.3 });
      const cands = Math.abs(dx) >= Math.abs(dy) ? [above, below, nudge(above, -1), nudge(above, 1), nudge(below, -1), nudge(below, 1), right, left] : [right, left, above, below];
      const pick = best(cands, (c) => [c, textBox(c.x, c.y, c.anchor, lines, FS.flow, LH.flow)], obst);
      flowLabels[fl.id] = { lines, ...pick };
      obst.push(textBox(pick.x, pick.y, pick.anchor, lines, FS.flow, LH.flow));
    });

    // constant nodes used by any flow, in a row under everything else
    let bb = union([...obst, ...base]);
    const usedParams: string[] = [];
    if (showInfluences) model.diagram.flows.forEach((f) => (meta[f.id]?.in ?? []).forEach((id) => paramIds.has(id) && !usedParams.includes(id) && usedParams.push(id)));
    const nodeW = (id: string) => Math.max(40, tw(pLabel(id), FS.param) + 14);
    const nodePos: Record<string, [number, number]> = {};
    if (usedParams.length) {
      const ws = usedParams.map(nodeW), need = ws.reduce((a, b) => a + b, 0) + 24 * (ws.length - 1);
      const span = Math.max(need, bb.x1 - bb.x0 - 120), mid = (bb.x0 + bb.x1) / 2;
      const gap = ws.length > 1 ? (span - ws.reduce((a, b) => a + b, 0)) / (ws.length - 1) : 0;
      let x = mid - span / 2, y = Math.max(286, bb.y1 + 40);
      if (ws.length === 1) x = mid - ws[0] / 2;
      usedParams.forEach((id, i) => {
        nodePos[id] = [x + ws[i] / 2, y];
        obst.push({ x0: x, y0: y - 10, x1: x + ws[i], y1: y + 10 });
        x += ws[i] + gap;
      });
      model.diagram.flows.forEach((f) => {
        const [vx, vy] = valves[f.id];
        (meta[f.id]?.in ?? []).forEach((id) => {
          if (!paramIds.has(id)) return;
          const [px, py] = nodePos[id];
          const my = (py + vy) / 2 - 26, cx = (px + vx) / 2;
          const [ex, ey] = shortenQ(cx, my, vx, vy, 14);
          conns.push({ d: `M ${px} ${py - 11} Q ${cx} ${my} ${ex} ${ey}`, kind: "info", bx: cx, by: my });
        });
      });
      bb = union(obst);
    }
    const pad = 12;
    const vb = { x: Math.floor(bb.x0 - pad), y: Math.floor(bb.y0 - pad), w: Math.ceil(bb.x1 - bb.x0 + 2 * pad), h: Math.ceil(bb.y1 - bb.y0 + 2 * pad) };
    return { valves, usedParams, nodePos, conns, titles, flowLabels, vb };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, modelKey, showInfluences]);

  useEffect(() => {
    live.current = { state: Object.fromEntries(model.stocks.map((s) => [s.id, s.init])), rates: {} };
    return subscribe(({ state, rates }) => (live.current = { state, rates }));
  }, [model, subscribe]);

  // continuous cosmetic animation (only advances while playing)
  useEffect(() => {
    const flows = model.diagram.flows.map((fl) => {
      const path = pipes.current[fl.id];
      const len = path ? path.getTotalLength() : 0;
      const count = Math.max(2, Math.min(14, Math.round(len / 28)));
      const g = parts.current[fl.id];
      if (g) g.innerHTML = "";
      const circles: SVGCircleElement[] = [];
      for (let i = 0; i < count; i++) {
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("fill", fl.color ?? ACC);
        g?.appendChild(c);
        circles.push(c);
      }
      return { fl, path, len, count, circles, off: Math.random() * len };
    });
    let raf = 0, wave = 0;
    const tick = () => {
      const { state, rates } = live.current;
      const playing = runningRef.current;
      if (playing) wave += 0.07;
      for (const st of model.stocks) {
        const g = model.diagram.stocks[st.id];
        if (!g) continue;
        const lp = liquid.current[st.id];
        if (lp) lp.setAttribute("d", liquidD(g, state[st.id] ?? st.init, st.scale, playing ? wave : 0));
        const v = vals.current[st.id];
        if (v) v.textContent = (state[st.id] ?? st.init).toFixed(1);
      }
      for (const f of flows) {
        if (!f.path) continue;
        const rate = rates[f.fl.id] || 0;
        const frac = Math.min(1, rate / (f.fl.max || 1));
        if (!playing || frac < 0.012) {
          for (const c of f.circles) c.style.opacity = "0";
          continue;
        }
        f.off += 0.5 + frac * 4.5;
        const gap = f.len / f.count;
        for (let i = 0; i < f.circles.length; i++) {
          const c = f.circles[i];
          const d = (f.off + i * gap) % f.len;
          const pt = f.path.getPointAtLength(d);
          c.setAttribute("cx", pt.x.toFixed(1));
          c.setAttribute("cy", pt.y.toFixed(1));
          c.setAttribute("r", (1.7 + frac * 2.2).toFixed(1));
          c.style.opacity = (0.4 + 0.6 * Math.min(1, frac * 2)).toFixed(2);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [model]);

  const { vb } = layout;
  // on phones the SVG keeps a minimum width so its smallest text renders at 11px or more; the stage scrolls sideways
  const minW = Math.ceil((vb.w * 11) / (showInfluences ? FS.badge : FS.flow));
  // in a figure (the small diagram in the home hero) phones get the whole diagram at full width instead of a scroll:
  // flow names are dropped and stock names and values drawn larger so they stay readable
  const big = "[figure_&]:max-md:text-[30px]";
  const lines = (x: number, ls: string[], lh: number) => ls.map((l, i) => <tspan key={i} x={x} dy={i ? lh : 0}>{l}</tspan>);

  return (
    <>
      <div
        className="viz-stage overflow-x-auto rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--ring))] max-lg:scroll-mb-24 [figure>&]:max-md:overflow-visible [figure>&]:max-md:pt-2"
        role="region"
        tabIndex={0}
        aria-label="Stock and flow diagram, scroll sideways"
      >
        <svg
          viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
          role="img"
          aria-label={`Stock and flow diagram for ${model.name}`}
          className="w-full h-auto block max-md:min-w-[var(--sfd-min)] [figure_&]:max-md:min-w-0 [figure_&]:max-md:overflow-visible"
          style={{ "--sfd-min": `${minW}px` } as CSSProperties}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* information arrows: thin line, small fixed-size head */}
            <marker id="info-arrow" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0,0 L9,4 L0,8 Z" fill="#6b74a6" /></marker>
            <marker id="fb-arrow" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0,0 L9,4 L0,8 Z" fill="#d9480f" /></marker>
          </defs>

          {/* clouds + pipes */}
          {model.diagram.flows.map((fl) => {
            const a0 = fl.pts[0], aN = fl.pts[fl.pts.length - 1], { u0, uN } = endDirs(fl.pts);
            const col = fl.color ?? ACC, sh = flowShape(fl.pts, 18, 13, fl.to ? 0 : 14);
            return (
              <g key={fl.id}>
                {!fl.from && <Cloud cx={a0[0] - u0[0] * 8} cy={a0[1] - u0[1] * 8} />}
                {!fl.to && <Cloud cx={aN[0] + uN[0] * 8} cy={aN[1] + uN[1] * 8} />}
                {/* a flow is a hollow pipe (two parallel lines) with a solid head, unlike the thin information arrows */}
                <path ref={(el) => (pipes.current[fl.id] = el)} d={sh.pipe} fill="none" stroke={col} strokeWidth={11} strokeLinejoin="round" />
                <path d={sh.pipe} fill="none" stroke="hsl(var(--card))" strokeWidth={6} strokeLinejoin="round" />
                <path d={sh.head} fill={col} />
                <g ref={(el) => (parts.current[fl.id] = el)} />
              </g>
            );
          })}

          {/* information / feedback connectors */}
          {showInfluences &&
            layout.conns.map((c, i) => (
              <path key={i} d={c.d} fill="none" stroke={c.kind === "fb" ? "#d9480f" : "#6b74a6"} strokeWidth={1.3} strokeOpacity={0.75} markerEnd={`url(#${c.kind === "fb" ? "fb" : "info"}-arrow)`} />
            ))}

          {/* stocks */}
          {model.stocks.map((st) => {
            const g = model.diagram.stocks[st.id], t = layout.titles[st.id];
            if (!g) return null;
            return (
              <g key={st.id}>
                <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={6} fill="hsl(var(--card))" stroke="hsl(var(--ink))" strokeWidth={1.5} />
                <path ref={(el) => (liquid.current[st.id] = el)} d="" fill={st.color} fillOpacity={0.42} stroke={st.color} strokeOpacity={0.85} strokeWidth={1.5} />
                <text x={t.x} y={t.y} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={FS.stock} fontWeight={600} className={big}>{lines(t.x, t.lines, LH.stock)}</text>
                <text ref={(el) => (vals.current[st.id] = el)} x={g.x + g.w / 2} y={g.y + g.h / 2 + 6} textAnchor="middle" fill="hsl(var(--ink))" fontSize={FS.value} fontWeight={700} className={big}>{st.init.toFixed(1)}</text>
              </g>
            );
          })}

          {/* valves + flow names */}
          {model.diagram.flows.map((fl) => {
            const [vx, vy] = layout.valves[fl.id], lb = layout.flowLabels[fl.id];
            const col = fl.color ?? ACC;
            return (
              <g key={fl.id}>
                <path d={`M ${vx} ${vy} L ${vx} ${vy - 17} M ${vx - 6} ${vy - 17} L ${vx + 6} ${vy - 17}`} stroke={col} strokeWidth={2} strokeLinecap="round" />
                <path d={valvePath(vx, vy)} fill="hsl(var(--card))" stroke={col} strokeWidth={2} strokeLinejoin="round" />
                <circle cx={vx} cy={vy} r={2.5} fill={col} />
                <text x={lb.x} y={lb.y} textAnchor={lb.anchor} fontSize={FS.flow} fill="hsl(var(--muted-foreground))" fontStyle="italic" className="[figure_&]:max-md:hidden">{lines(lb.x, lb.lines, LH.flow)}</text>
              </g>
            );
          })}

          {/* loop badges, on top of everything they might cross */}
          {layout.conns.map((c, i) =>
            c.loop ? (
              <g key={i}>
                <circle cx={c.bx} cy={c.by} r={9} fill="hsl(var(--card))" stroke={c.loop === "R" ? "#d9480f" : "#2545ff"} strokeWidth={1.2} />
                <text x={c.bx} y={c.by + 3.6} textAnchor="middle" fontSize={FS.badge} fontWeight={700} fill={c.loop === "R" ? "#d9480f" : "#2545ff"}>{c.loop}</text>
              </g>
            ) : null
          )}

          {/* constant nodes */}
          {layout.usedParams.map((id) => {
            const [x, y] = layout.nodePos[id];
            const label = pLabel(id);
            const w = Math.max(40, tw(label, FS.param) + 14);
            return (
              <g key={id}>
                <rect x={x - w / 2} y={y - 10} width={w} height={20} rx={6} fill="hsl(var(--card))" stroke="hsl(var(--input))" strokeWidth={1} strokeDasharray="2 2" />
                <text x={x} y={y + 3.8} textAnchor="middle" fontSize={FS.param} fill="hsl(var(--muted-foreground))">{label}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="md:hidden [figure_&]:hidden mt-1 text-xs text-muted-foreground" aria-hidden>
        Scroll to see the whole diagram
      </p>
    </>
  );
}

// Wavy liquid surface path.
function liquidD(g: { x: number; y: number; w: number; h: number }, level: number, scale: number, phase: number) {
  const h = g.h * clamp(level / scale, 0, 1);
  const topY = g.y + g.h - h;
  const amp = h > 5 ? 2.6 : 0;
  const segs = 16;
  let d = `M ${g.x} ${g.y + g.h} L ${g.x} ${topY.toFixed(1)}`;
  for (let i = 0; i <= segs; i++) d += ` L ${(g.x + (g.w * i) / segs).toFixed(1)} ${(topY + amp * Math.sin(phase + i * 0.55)).toFixed(1)}`;
  d += ` L ${g.x + g.w} ${g.y + g.h} Z`;
  return d;
}
