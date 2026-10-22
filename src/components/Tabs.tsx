import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// One row of tabs under a working model. Every panel stays in the page, hidden until chosen,
// so printing still gives the whole worksheet and nothing re-runs when you switch.
export default function Tabs({ label, items }: { label: string; items: [string, string, ReactNode][] }) {
  const [tab, setTab] = useState(items[0][0]);
  const move = (dir: number) => {
    const i = (items.findIndex(([id]) => id === tab) + dir + items.length) % items.length;
    setTab(items[i][0]);
    document.getElementById(`tab-${items[i][0]}`)?.focus();
  };
  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={(e) => (e.key === "ArrowRight" ? move(1) : e.key === "ArrowLeft" ? move(-1) : null)}
        className="print:hidden flex gap-1 overflow-x-auto whitespace-nowrap border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map(([id, name]) => (
          <button
            key={id}
            id={`tab-${id}`}
            role="tab"
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            className={cn("h-11 px-3.5 text-[15px] font-semibold border-b-[3px] -mb-px", tab === id ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            {name}
          </button>
        ))}
      </div>
      {items.map(([id, name, node]) => (
        <div key={id} id={`panel-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} hidden={tab !== id} className="pt-7 min-h-[200px] print:!block print:pt-6">
          <h2 className="hidden print:block heading text-[18px] mb-3">{name}</h2>
          {node}
        </div>
      ))}
    </div>
  );
}
