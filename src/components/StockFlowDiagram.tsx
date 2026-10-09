import { useEffect, useMemo, useRef } from "react";
import type { Model } from "@/data/molecules";
import { FLOW_META } from "@/data/diagramMeta";
import type { FrameCb } from "@/hooks/useSimulation";
import type { Vars } from "@/sim/engine";

const NS = "http://www.w3.org/2000/svg";
const ACC = "#2545ff";
const ptsPath = (pts: [number, number][]) => "M" + pts.map((p) => p.join(",")).join(" L");
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// geometric midpoint of a polyline by arc length → where the valve sits
function midpoint(pts: [number, number][]): [number, number] {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  let half = total / 2;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (half <= seg) {
      const t = seg ? half / seg : 0;
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
    }
    half -= seg;
  }
  return pts[pts.length - 1];
}

// point on a box border in the direction of (tx,ty)
function edgePoint(b: { x: number; y: number; w: number; h: number }, tx: number, ty: number): [number, number] {
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2, dx = tx - cx, dy = ty - cy;
  const sx = dx ? b.w / 2 / Math.abs(dx) : 1e9, sy = dy ? b.h / 2 / Math.abs(dy) : 1e9, s = Math.min(sx, sy);
  return [cx + dx * s, cy + dy * s];
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

  // ---- static layout: valves, constant nodes, connectors (recomputed per model) ----
  const layout = useMemo(() => {
    const meta = FLOW_META[modelKey] ?? {};
    const paramIds = new Set(model.params.map((p) => p.id));
    const valves: Record<string, [number, number]> = {};
    model.diagram.flows.forEach((f) => (valves[f.id] = midpoint(f.pts)));

    // constant nodes used by any flow → lay out along the bottom edge
    const usedParams: string[] = [];
    model.diagram.flows.forEach((f) => (meta[f.id]?.in ?? []).forEach((id) => paramIds.has(id) && !usedParams.includes(id) && usedParams.push(id)));
    const nodePos: Record<string, [number, number]> = {};
    const n = usedParams.length;
    usedParams.forEach((id, i) => {
      const x = n === 1 ? 410 : 90 + (i * (640 / Math.max(1, n - 1)));
      nodePos[id] = [x, 286];
    });

    // connectors: param→valve (info) and stock→valve (feedback)
    type Conn = { d: string; kind: "info" | "fb"; loop?: "B" | "R"; bx: number; by: number };
    const conns: Conn[] = [];
    model.diagram.flows.forEach((f) => {
      const m = meta[f.id];
      if (!m) return;
      const [vx, vy] = valves[f.id];
      m.in.forEach((id) => {
        if (paramIds.has(id)) {
          const [px, py] = nodePos[id];
          const my = (py + vy) / 2 - 26;
          conns.push({ d: `M ${px} ${py - 11} Q ${(px + vx) / 2} ${my} ${vx} ${vy + 11}`, kind: "info", bx: (px + vx) / 2, by: my });
        } else {
          const g = model.diagram.stocks[id];
          if (!g) return; // hidden/internal stock — no geometry
          const [sx, sy] = edgePoint(g, vx, vy);
          const mx = (sx + vx) / 2, my = (sy + vy) / 2;
          const nx = -(vy - sy), ny = vx - sx, len = Math.hypot(nx, ny) || 1, bow = 22;
          conns.push({ d: `M ${sx} ${sy} Q ${mx + (nx / len) * bow} ${my + (ny / len) * bow} ${vx} ${vy}`, kind: "fb", loop: typeof m.loop === "string" ? m.loop : m.loop?.[id], bx: mx + (nx / len) * bow, by: my + (ny / len) * bow });
        }
      });
    });
    return { meta, valves, usedParams, nodePos, conns };
  }, [model, modelKey]);

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

  const pLabel = (id: string) => model.params.find((p) => p.id === id)?.label ?? id;

  return (
    <div className="viz-stage overflow-x-auto">
      <svg viewBox="0 0 820 310" role="img" aria-label={`Stock and flow diagram for ${model.name}`} className="w-full min-w-[460px] h-auto block" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="sf-arrow" markerWidth="6" markerHeight="6" refX="4.2" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 Z" fill="hsl(var(--input))" /></marker>
          <marker id="info-arrow" markerWidth="6" markerHeight="6" refX="4.5" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 Z" fill="#6b74a6" /></marker>
          <marker id="fb-arrow" markerWidth="6.5" markerHeight="6.5" refX="4.8" refY="2.1" orient="auto"><path d="M0,0 L4.2,2.1 L0,4.2 Z" fill="#d9480f" /></marker>
        </defs>

        {/* clouds + pipes */}
        {model.diagram.flows.map((fl) => {
          const a0 = fl.pts[0], aN = fl.pts[fl.pts.length - 1];
          return (
            <g key={fl.id}>
              {!fl.from && <Cloud cx={a0[0] - 8} cy={a0[1]} />}
              {!fl.to && <Cloud cx={aN[0] + 8} cy={aN[1]} />}
              <path ref={(el) => (pipes.current[fl.id] = el)} d={ptsPath(fl.pts)} fill="none" stroke={fl.color ?? ACC} strokeOpacity={0.18} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#sf-arrow)" />
              <g ref={(el) => (parts.current[fl.id] = el)} />
            </g>
          );
        })}

        {/* information / feedback connectors */}
        {showInfluences &&
          layout.conns.map((c, i) => (
            <g key={i}>
              <path d={c.d} fill="none" stroke={c.kind === "fb" ? "#d9480f" : "#6b74a6"} strokeWidth={1.3} strokeOpacity={0.75} markerEnd={`url(#${c.kind === "fb" ? "fb" : "info"}-arrow)`} />
              {c.kind === "fb" && c.loop && (
                <g>
                  <circle cx={c.bx} cy={c.by} r={8.5} fill="hsl(var(--card))" stroke={c.loop === "R" ? "#d9480f" : "#2545ff"} strokeWidth={1.2} />
                  <text x={c.bx} y={c.by + 3} textAnchor="middle" fontSize={9} fontWeight={700} fill={c.loop === "R" ? "#d9480f" : "#2545ff"}>{c.loop}</text>
                </g>
              )}
            </g>
          ))}

        {/* stocks */}
        {model.stocks.map((st) => {
          const g = model.diagram.stocks[st.id];
          if (!g) return null;
          return (
            <g key={st.id}>
              <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={8} fill="hsl(var(--card))" stroke="hsl(var(--ink))" strokeWidth={1.5} />
              <path ref={(el) => (liquid.current[st.id] = el)} d="" fill={st.color} fillOpacity={0.42} stroke={st.color} strokeOpacity={0.85} strokeWidth={1.5} />
              <text x={g.x + g.w / 2} y={g.y - 10} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={13} fontWeight={600}>{st.label}</text>
              <text ref={(el) => (vals.current[st.id] = el)} x={g.x + g.w / 2} y={g.y + g.h / 2 + 6} textAnchor="middle" fill="hsl(var(--ink))" fontSize={17} fontWeight={700}>{st.init.toFixed(1)}</text>
            </g>
          );
        })}

        {/* valves + flow names */}
        {model.diagram.flows.map((fl) => {
          const [vx, vy] = layout.valves[fl.id];
          const name = layout.meta[fl.id]?.name ?? fl.id;
          const col = fl.color ?? ACC;
          return (
            <g key={fl.id}>
              <path d={`M ${vx - 9} ${vy - 7} L ${vx - 9} ${vy + 7} L ${vx} ${vy} Z M ${vx + 9} ${vy - 7} L ${vx + 9} ${vy + 7} L ${vx} ${vy} Z`} fill="hsl(var(--card))" stroke={col} strokeWidth={1.3} strokeLinejoin="round" />
              <circle cx={vx} cy={vy} r={2} fill={col} />
              <text x={vx} y={vy - 12} textAnchor="middle" fontSize={10.5} fill="hsl(var(--muted-foreground))" fontStyle="italic">{name}</text>
            </g>
          );
        })}

        {/* constant nodes */}
        {showInfluences &&
          layout.usedParams.map((id) => {
            const [x, y] = layout.nodePos[id];
            const label = pLabel(id);
            const w = Math.max(40, label.length * 5.6 + 12);
            return (
              <g key={id}>
                <rect x={x - w / 2} y={y - 10} width={w} height={20} rx={10} fill="hsl(var(--card))" stroke="hsl(var(--input))" strokeWidth={1} strokeDasharray="2 2" />
                <text x={x} y={y + 3.5} textAnchor="middle" fontSize={9.5} fill="hsl(var(--muted-foreground))">{label}</text>
              </g>
            );
          })}
      </svg>
    </div>
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
