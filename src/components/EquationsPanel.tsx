import type { Model } from "@/data/molecules";
import { DIAGRAM_EXTRA, FLOW_META } from "@/data/diagramMeta";
import type { Vars } from "@/sim/engine";

function Row({ lhs, rhs }: { lhs: string; rhs: string }) {
  return (
    <div className="flex gap-2 py-1 font-mono text-[13px] leading-snug">
      <span className="font-medium shrink-0">{lhs}</span>
      <span className="text-muted-foreground">=</span>
      <span className="text-foreground/80">{rhs}</span>
    </div>
  );
}

export default function EquationsPanel({ model, modelKey, params }: { model: Model; modelKey: string; params: Vars }) {
  const meta = FLOW_META[modelKey] ?? {};
  const extra = DIAGRAM_EXTRA[modelKey] ?? { stocks: [] };
  const flows = model.diagram.flows.map((f) => meta[f.id]).filter(Boolean);

  return (
    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
      <div>
        <div className="text-xs font-medium text-muted-foreground mb-1.5">Stocks, which accumulate</div>
        {extra.stocks.map(([l, r]) => (
          <Row key={l} lhs={l} rhs={r} />
        ))}
        {extra.aux && extra.aux.length > 0 && (
          <>
            <div className="text-xs font-medium text-muted-foreground mb-1.5 mt-3">Auxiliaries</div>
            {extra.aux.map(([l, r]) => (
              <Row key={l} lhs={l} rhs={r} />
            ))}
          </>
        )}
      </div>
      <div>
        <div className="text-xs font-medium text-muted-foreground mb-1.5">Flows, the rates of change</div>
        {flows.map((f) => (
          <Row key={f!.name} lhs={f!.name} rhs={f!.eq} />
        ))}
        <div className="text-xs font-medium text-muted-foreground mb-1.5 mt-3">Constants, set by the sliders</div>
        {model.params.map((p) => (
          <Row key={p.id} lhs={p.label} rhs={`${params[p.id]}${p.unit}`} />
        ))}
      </div>
    </div>
  );
}
