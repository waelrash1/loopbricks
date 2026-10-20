import type { Model } from "@/data/molecules";
import { flowShape, midpoint, valvePath } from "@/lib/flowGeom";

// Static, animation-free skeleton of a model's stock-flow diagram for the map cards.

export default function MiniDiagram({ model }: { model: Model }) {
  return (
    <svg viewBox="0 0 820 300" className="w-full h-full block" preserveAspectRatio="xMidYMid meet">
      {model.diagram.flows.map((fl) => {
        const a0 = fl.pts[0];
        const aN = fl.pts[fl.pts.length - 1];
        const col = fl.color ?? "#2545ff", sh = flowShape(fl.pts, 30, 22, fl.to ? 0 : 16);
        const [vx, vy] = midpoint(fl.pts);
        return (
          <g key={fl.id}>
            {!fl.from && <ellipse cx={a0[0] - 8} cy={a0[1]} rx={22} ry={15} fill="hsl(var(--card))" stroke="hsl(var(--input))" strokeWidth={3} />}
            {!fl.to && <ellipse cx={aN[0] + 8} cy={aN[1]} rx={22} ry={15} fill="hsl(var(--card))" stroke="hsl(var(--input))" strokeWidth={3} />}
            <path d={sh.pipe} fill="none" stroke={col} strokeWidth={16} strokeLinejoin="round" />
            <path d={sh.pipe} fill="none" stroke="hsl(var(--card))" strokeWidth={8} strokeLinejoin="round" />
            <path d={sh.head} fill={col} />
            <path d={valvePath(vx, vy, 16)} fill="hsl(var(--card))" stroke={col} strokeWidth={4} strokeLinejoin="round" />
          </g>
        );
      })}
      {model.stocks.map((st) => {
        const g = model.diagram.stocks[st.id];
        if (!g) return null;
        return <rect key={st.id} x={g.x} y={g.y} width={g.w} height={g.h} rx={14} fill={st.color} fillOpacity={0.28} stroke={st.color} strokeOpacity={0.8} strokeWidth={3} />;
      })}
    </svg>
  );
}
