import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { GROUPS, MODELS } from "@/data/molecules";
import { TOUR, groupOf, search } from "@/data/catalog";
import { cn } from "@/lib/utils";

const item = (active: boolean) =>
  cn(
    "flex items-baseline gap-2.5 w-full text-left rounded-btn px-3 py-1.5 text-sm transition-colors",
    active ? "bg-accent text-accent-foreground font-medium" : "text-foreground/85 hover:bg-muted"
  );

// two studs on a brick
export const BrickMark = () => (
  <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden>
    <path d="M7 5h6v5H7zM19 5h6v5h-6z" fill="hsl(var(--foreground))" />
    <path d="M3 10h26v17H3z" fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth="2" />
  </svg>
);

export default function Sidebar({
  current,
  onSelect,
  showMap,
  mapActive,
  startTour,
  tourActive,
}: {
  current: string;
  onSelect: (k: string) => void;
  showMap: () => void;
  mapActive: boolean;
  startTour: () => void;
  tourActive: boolean;
}) {
  const [query, setQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set([GROUPS[0].title]));
  const searchBox = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const results = search(query);

  // keep the current molecule's group open and the item in view
  useEffect(() => {
    if (!current) return;
    setOpenGroups((s) => new Set(s).add(groupOf(current)));
    requestAnimationFrame(() => list.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" }));
  }, [current]);

  // "/" jumps to search from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key !== "/" || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      searchBox.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pick = (k: string) => {
    setQuery("");
    onSelect(k);
  };

  return (
    <nav aria-label="Molecules" className="border-b md:border-b-0 md:border-r border-border px-3 py-4 md:sticky md:top-0 md:h-[100dvh] md:overflow-y-auto">
      <button onClick={showMap} className="flex items-center gap-2.5 px-3 pb-4 rounded-btn">
        <BrickMark />
        <span className="heading text-[21px]">LoopBricks</span>
      </button>

      <div className="flex md:flex-col gap-0.5">
        <button onClick={showMap} aria-current={mapActive ? "page" : undefined} className={item(mapActive)}>
          All molecules
        </button>
        <button onClick={startTour} aria-current={tourActive ? "page" : undefined} className={item(tourActive)}>
          Guided tour
        </button>
      </div>

      <label className="relative block mt-4">
        <span className="sr-only">Find a molecule</span>
        <Search size={15} aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={searchBox}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) pick(results[0].key);
            if (e.key === "Escape") setQuery("");
          }}
          placeholder="Find a molecule"
          className="w-full h-10 rounded-btn border border-input bg-card pl-9 pr-9 text-sm placeholder:text-muted-foreground focus:border-foreground"
        />
        <kbd aria-hidden className="hidden md:block absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[11px] text-muted-foreground border border-border rounded-btn px-1.5">
          /
        </kbd>
      </label>

      <div ref={list} className="mt-3">
        {query.trim() ? (
          results.length ? (
            results.map(({ key, via }) => (
              <button key={key} onClick={() => pick(key)} className={item(current === key)}>
                <span>
                  {MODELS[key].name}
                  {via && <span className="block text-xs text-muted-foreground">covers {via}</span>}
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-muted-foreground">No molecule matches “{query.trim()}”. Try a shorter word, like “split” or “delay”.</p>
          )
        ) : (
          <>
            {/* small screens: a native picker instead of a long list */}
            <select
              aria-label="Open a molecule"
              value={current}
              onChange={(e) => onSelect(e.target.value)}
              className="md:hidden w-full h-11 rounded-btn border border-input bg-card px-3 text-sm"
            >
              <option value="" disabled>
                Open a molecule…
              </option>
              {GROUPS.map((group) => (
                <optgroup key={group.title} label={group.title}>
                  {group.keys.map((k) => (
                    <option key={k} value={k}>
                      {MODELS[k].name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <div className="hidden md:block">
              {GROUPS.map((group) => (
                <details
                  key={group.title}
                  open={openGroups.has(group.title)}
                  className="border-t border-border first:border-t-0"
                  onToggle={(e) => {
                    const isOpen = e.currentTarget.open;
                    setOpenGroups((s) => {
                      if (s.has(group.title) === isOpen) return s;
                      const next = new Set(s);
                      if (isOpen) next.add(group.title);
                      else next.delete(group.title);
                      return next;
                    });
                  }}
                >
                  <summary className="flex cursor-pointer items-baseline justify-between gap-2 rounded-btn px-3 py-2.5 text-[13px] font-semibold hover:bg-muted">
                    {group.title}
                    <span className="font-mono text-[11px] font-normal text-muted-foreground">{group.keys.length}</span>
                  </summary>
                  <div className="pb-2">
                    {group.keys.map((k) => {
                      const active = current === k;
                      return (
                        <button key={k} onClick={() => onSelect(k)} aria-current={active ? "page" : undefined} className={item(active)}>
                          <span className={cn("font-mono text-[11px] w-5 shrink-0", !active && "text-muted-foreground")}>{TOUR.indexOf(k) + 1}</span>
                          {MODELS[k].name}
                        </button>
                      );
                    })}
                  </div>
                </details>
              ))}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
