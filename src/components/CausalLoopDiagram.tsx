import type { Model } from "@/data/molecules";
import { CLD_H, CLD_W, LOOP_R, layoutCld } from "@/lib/cldGeometry";

const POS = "var(--viz-good)";
const NEG = "var(--viz-pink)";

// Static diagram (feedback structure doesn't change over time) → pure render.
export default function CausalLoopDiagram({ model }: { model: Model }) {
  const { boxes, links } = layoutCld(model.cld);

  return (
    <>
      <svg viewBox={`0 0 ${CLD_W} ${CLD_H}`} role="img" aria-label={`Causal loop diagram for ${model.name}`} className="viz-stage w-full h-auto block" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="cld-pos" markerWidth="6.5" markerHeight="6.5" refX="5" refY="2.25" orient="auto">
            <path d="M0,0 L5,2.25 L0,4.5 Z" fill={POS} />
          </marker>
          <marker id="cld-neg" markerWidth="6.5" markerHeight="6.5" refX="5" refY="2.25" orient="auto">
            <path d="M0,0 L5,2.25 L0,4.5 Z" fill={NEG} />
          </marker>
        </defs>

        {links.map(({ link: l, d, sx, sy, nx, ny }, i) => {
          const col = l.sign === "+" ? POS : NEG;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={col} strokeWidth={2} markerEnd={`url(#${l.sign === "+" ? "cld-pos" : "cld-neg"})`} />
              <text x={sx} y={sy} textAnchor="middle" dominantBaseline="central" fill={col} fontWeight={700} fontSize={15}>
                {l.sign}
              </text>
              {l.note && (
                <text x={nx} y={ny} textAnchor="middle" dominantBaseline="central" fill="hsl(var(--muted-foreground))" fontSize={11}>
                  {l.note}
                </text>
              )}
            </g>
          );
        })}

        {model.cld.loops.map((lp, i) => {
          const col = lp.type === "B" ? "var(--viz-acc)" : "var(--viz-acc2)";
          return (
            <g key={i}>
              <circle cx={lp.x} cy={lp.y} r={LOOP_R} fill="hsl(var(--muted))" stroke={col} strokeWidth={1.6} strokeDasharray="3 3" />
              <path d={`M${lp.x + 11},${lp.y - 9} l5,2 l-2,5`} fill="none" stroke={col} strokeWidth={1.6} />
              <text x={lp.x} y={lp.y + 4} textAnchor="middle" fill={col} fontWeight={700} fontSize={12}>
                {lp.label}
              </text>
            </g>
          );
        })}

        {model.cld.vars.map((v) => {
          const b = boxes[v.id];
          return (
            <g key={v.id}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={2} fill="hsl(var(--card))" stroke="hsl(var(--ink))" strokeWidth={1.2} />
              <text x={b.cx} y={b.cy + 4} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={13}>
                {v.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="cld-cap text-[13px] leading-[1.7] text-muted-foreground mt-3 max-w-[80ch]" dangerouslySetInnerHTML={{ __html: model.cld.caption }} />
    </>
  );
}
