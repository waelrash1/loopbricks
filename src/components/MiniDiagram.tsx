import type { Model } from "@/data/molecules";

// Static, animation-free skeleton of a model's stock-flow diagram for the map cards.
const ptsPath = (pts: [number, number][]) => "M" + pts.map((p) => p.join(",")).join(" L");

export default function MiniDiagram({ model }: { model: Model }) {
  return (
    <svg viewBox="0 0 820 300" className="w-full h-full block" preserveAspectRatio="xMidYMid meet">
      <defs>
        <marker id="mini-arrow" markerWidth="6" markerHeight="6" refX="4" refY="2" orient="auto">
          <path d="M0,0 L4,2 L0,4 Z" fill="hsl(var(--input))" />
        </marker>
      </defs>
      {model.diagram.flows.map((fl) => {
        const a0 = fl.pts[0];
        const aN = fl.pts[fl.pts.length - 1];
        return (
          <g key={fl.id}>
            {!fl.from && <ellipse cx={a0[0] - 8} cy={a0[1]} rx={22} ry={15} fill="hsl(var(--card))" stroke="hsl(var(--input))" strokeWidth={3} />}
            {!fl.to && <ellipse cx={aN[0] + 8} cy={aN[1]} rx={22} ry={15} fill="hsl(var(--card))" stroke="hsl(var(--input))" strokeWidth={3} />}
            <path d={ptsPath(fl.pts)} fill="none" stroke={fl.color ?? "#2545ff"} strokeOpacity={0.55} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#mini-arrow)" />
          </g>
        );
      })}
      {model.stocks.map((st) => {
        const g = model.diagram.stocks[st.id];
        if (!g) return null;
        return <rect key={st.id} x={g.x} y={g.y} width={g.w} height={g.h} rx={3} fill={st.color} fillOpacity={0.28} stroke={st.color} strokeOpacity={0.8} strokeWidth={3} />;
      })}
    </svg>
  );
}
