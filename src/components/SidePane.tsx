import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { GROUPS, MODELS } from "@/data/molecules";
import { CASES, THEMES } from "@/data/health/cases";
import { cn } from "@/lib/utils";

// Every molecule by family (or, on healthcare pages, every case by theme), beside the page. On large screens it sits in the layout;
// below that it slides over the page and closes after a pick.
export default function SidePane({ health, current, onSelect, onClose }: { health: boolean; current?: string; onSelect: (k: string) => void; onClose: () => void }) {
  const sections = health
    ? THEMES.map((t) => ({ title: t, items: CASES.filter((c) => c.theme === t).map((c) => [c.id, c.title]) }))
    : GROUPS.map((g) => ({ title: g.title, items: g.keys.map((k) => [k, MODELS[k].name]) }));
  const list = useRef<HTMLElement>(null);
  const narrow = () => !matchMedia("(min-width: 1024px)").matches;

  useEffect(() => {
    list.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
  }, [current]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && narrow() && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div aria-hidden onClick={onClose} className="lg:hidden fixed inset-0 z-30 bg-foreground/30" />
      <nav
        ref={list}
        aria-label={health ? "All healthcare cases" : "All molecules"}
        className="fixed lg:sticky z-40 lg:z-auto left-0 top-0 lg:top-16 h-[100dvh] lg:h-[calc(100dvh-4rem)] w-[280px] lg:w-[260px] shrink-0 overflow-y-auto border-r border-border bg-background px-3 pt-4 pb-10"
      >
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="heading text-[15px]">{health ? "Healthcare cases" : "All molecules"}</span>
          <button onClick={onClose} aria-label="Hide this list" className="grid place-items-center w-8 h-8 rounded-[7px] text-muted-foreground hover:bg-muted hover:text-foreground">
            <X size={16} aria-hidden />
          </button>
        </div>
        {sections.map((g) => (
          <section key={g.title} className="mt-4">
            <h2 className="px-2 mb-1 text-[12px] font-bold text-muted-foreground">{g.title}</h2>
            <ul>
              {g.items.map(([k, label]) => (
                <li key={k}>
                  <button
                    onClick={() => {
                      onSelect(k);
                      if (narrow()) onClose();
                    }}
                    aria-current={k === current ? "page" : undefined}
                    className={cn(
                      "w-full text-left rounded-[7px] px-2 py-1.5 text-[13.5px] leading-snug",
                      k === current ? "bg-accent font-semibold shadow-[0_2px_0_hsl(var(--accent-edge))]" : "text-foreground/85 hover:bg-muted"
                    )}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </>
  );
}
