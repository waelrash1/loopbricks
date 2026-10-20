import type { SfDiagram as Sf } from "@/data/sterman/types";
import { flowShape, midpoint, shortenQ, valvePath } from "@/lib/flowGeom";

// A static stock-and-flow diagram in standard notation, for teaching pages.
// Same pipes, valves and clouds as the live simulator; information links are thin arrows.
const PIPE = "#2545ff", INFO = "#6b74a6";
const CLOUD_D = "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z";
const BOX = { w: 120, h: 64 };
type P = [number, number];

const unit = (a: P, b: P): P => {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
};
function Cloud({ x, y }: { x: number; y: number }) {
  const s = 2.2;
  return <path d={CLOUD_D} transform={`translate(${x - 12 * s}, ${y - 11 * s}) scale(${s})`} fill="hsl(var(--card))" stroke="hsl(var(--input))" strokeWidth={1} strokeLinejoin="round" />;
}
// where a line from a box's centre towards (tx, ty) leaves the box
function edge(b: { x: number; y: number; w: number; h: number }, tx: number, ty: number): P {
  const dx = tx - b.x, dy = ty - b.y;
  const s = Math.min(dx ? b.w / 2 / Math.abs(dx) : 1e9, dy ? b.h / 2 / Math.abs(dy) : 1e9);
  return [b.x + dx * s, b.y + dy * s];
}

export function sfGeometry(d: Sf) {
  const boxes = Object.fromEntries(d.stocks.map((s) => [s.id, { x: s.x, y: s.y, w: s.w ?? BOX.w, h: s.h ?? BOX.h }]));
  const valves = Object.fromEntries(d.flows.map((f) => [f.id, midpoint(f.pts)]));
  const aux = Object.fromEntries((d.aux ?? []).map((a) => [a.id, a]));
  const centre = (id: string): P | null => (boxes[id] ? [boxes[id].x, boxes[id].y] : valves[id] ?? (aux[id] ? [aux[id].x, aux[id].y] : null));
  const links = (d.links ?? []).map((l) => {
    const a = centre(l.from), b = centre(l.to);
    if (!a || !b) return null;
    const [ux, uy] = unit(a, b), len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const c: P = [(a[0] + b[0]) / 2 - uy * (l.curve ?? 0), (a[1] + b[1]) / 2 + ux * (l.curve ?? 0)];
    const start = boxes[l.from] ? edge(boxes[l.from], c[0], c[1]) : shortenQ(c[0], c[1], a[0], a[1], valves[l.from] ? 14 : 9);
    const end = boxes[l.to] ? edge(boxes[l.to], c[0], c[1]) : shortenQ(c[0], c[1], b[0], b[1], valves[l.to] ? 15 : 10);
    // the sign sits near the arrowhead, just off the curve
    const t = 0.8, q = (i: 0 | 1) => (1 - t) ** 2 * start[i] + 2 * (1 - t) * t * c[i] + t * t * end[i];
    const side = (l.curve ?? 0) >= 0 ? 1 : -1;
    return { l, path: `M ${start[0]} ${start[1]} Q ${c[0]} ${c[1]} ${end[0]} ${end[1]}`, sx: q(0) - uy * 10 * side, sy: q(1) + ux * 10 * side, len };
  });
  return { boxes, valves, links };
}

export default function SfDiagram({ d }: { d: Sf }) {
  const [W, H] = d.size ?? [640, 300];
  const g = sfGeometry(d);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Stock and flow diagram: ${d.title}`} className="w-full h-auto block">
      <defs>
        <marker id="sfd-info" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <path d="M0,0 L9,4 L0,8 Z" fill={INFO} />
        </marker>
      </defs>
      {d.flows.map((f) => {
        const p0 = f.pts[0], pN = f.pts[f.pts.length - 1];
        const u0 = unit(p0, f.pts[1]), uN = unit(f.pts[f.pts.length - 2], pN);
        const sh = flowShape(f.pts, 16, 11, f.to ? 0 : 6);
        return (
          <g key={f.id}>
            {!f.from && <Cloud x={p0[0] - u0[0] * 20} y={p0[1] - u0[1] * 20} />}
            {!f.to && <Cloud x={pN[0] + uN[0] * 20} y={pN[1] + uN[1] * 20} />}
            <path d={sh.pipe} fill="none" stroke={PIPE} strokeWidth={10} strokeLinejoin="round" />
            <path d={sh.pipe} fill="none" stroke="hsl(var(--card))" strokeWidth={5} strokeLinejoin="round" />
            <path d={sh.head} fill={PIPE} />
          </g>
        );
      })}
      {g.links.map((x, i) =>
        x ? (
          <g key={i}>
            <path d={x.path} fill="none" stroke={INFO} strokeWidth={1.4} markerEnd="url(#sfd-info)" />
            {x.l.sign && (
              <text x={x.sx} y={x.sy} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700} fill={x.l.sign === "+" ? "#0f8a5f" : "#c2255c"}>
                {x.l.sign}
              </text>
            )}
          </g>
        ) : null
      )}
      {d.stocks.map((s) => {
        const b = g.boxes[s.id];
        return (
          <g key={s.id}>
            <rect x={b.x - b.w / 2} y={b.y - b.h / 2} width={b.w} height={b.h} rx={4} fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth={1.8} />
            <text x={b.x} y={b.y} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600} fill="hsl(var(--foreground))">
              {s.label}
            </text>
          </g>
        );
      })}
      {d.flows.map((f) => {
        const [vx, vy] = g.valves[f.id];
        return (
          <g key={f.id}>
            <path d={`M ${vx} ${vy} L ${vx} ${vy - 15} M ${vx - 5} ${vy - 15} L ${vx + 5} ${vy - 15}`} stroke={PIPE} strokeWidth={1.8} strokeLinecap="round" />
            <path d={valvePath(vx, vy, 9)} fill="hsl(var(--card))" stroke={PIPE} strokeWidth={1.8} strokeLinejoin="round" />
            <text x={vx} y={f.labelBelow ? vy + 24 : vy - 22} textAnchor="middle" fontSize={11.5} fontStyle="italic" fill="hsl(var(--foreground))">
              {f.label}
            </text>
          </g>
        );
      })}
      {(d.aux ?? []).map((a) => (
        <g key={a.id}>
          <circle cx={a.x} cy={a.y} r={6} fill="hsl(var(--card))" stroke={INFO} strokeWidth={1.4} />
          <text
            x={a.labelAt === "left" ? a.x - 11 : a.labelAt === "right" ? a.x + 11 : a.x}
            y={a.labelAt === "above" ? a.y - 11 : a.labelAt ? a.y + 4 : a.y + 19}
            textAnchor={a.labelAt === "left" ? "end" : a.labelAt === "right" ? "start" : "middle"}
            fontSize={11}
            fill="hsl(var(--muted-foreground))"
          >
            {a.label}
          </text>
        </g>
      ))}
      {(d.loops ?? []).map((l) => (
        <g key={l.label}>
          <circle cx={l.x} cy={l.y} r={10} fill="hsl(var(--card))" stroke={l.type === "R" ? "#d9480f" : "#2545ff"} strokeWidth={1.3} />
          <text x={l.x} y={l.y + 3.5} textAnchor="middle" fontSize={10} fontWeight={700} fill={l.type === "R" ? "#d9480f" : "#2545ff"}>
            {l.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
