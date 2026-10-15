import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { MODELS } from "@/data/molecules";
import { groupOf, search } from "@/data/catalog";
import { cn } from "@/lib/utils";

// two studs on a brick
export const BrickMark = ({ size = 26 }: { size?: number }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
    <rect x="6" y="4" width="7" height="6" rx="1.5" fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth="2" />
    <rect x="19" y="4" width="7" height="6" rx="1.5" fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth="2" />
    <rect x="2" y="10" width="28" height="18" rx="3" fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth="2" />
  </svg>
);

const navLink = (active: boolean) =>
  cn(
    "relative h-11 sm:h-16 inline-flex items-center text-[15px] font-semibold",
    active ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-t after:bg-accent" : "text-muted-foreground hover:text-foreground"
  );

export default function TopBar({
  onSelect,
  showMap,
  mapActive,
  startTour,
  tourActive,
}: {
  onSelect: (k: string) => void;
  showMap: () => void;
  mapActive: boolean;
  startTour: () => void;
  tourActive: boolean;
}) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const box = useRef<HTMLInputElement>(null);
  const results = query.trim() ? search(query).slice(0, 8) : [];

  // "/" jumps to search from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key !== "/" || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      box.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pick = (k: string) => {
    setQuery("");
    box.current?.blur();
    onSelect(k);
  };

  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border">
      <div className="max-w-[1320px] mx-auto px-4 md:px-8 flex flex-wrap items-center gap-x-7">
        <button onClick={showMap} className="h-16 flex items-center gap-2.5 rounded-btn" aria-label="LoopBricks, all molecules">
          <BrickMark />
          <span className="heading text-[20px]">LoopBricks</span>
        </button>
        <nav aria-label="Main" className="flex gap-6 order-3 sm:order-none">
          <button onClick={showMap} aria-current={mapActive ? "page" : undefined} className={navLink(mapActive)}>
            Molecules
          </button>
          <button onClick={startTour} aria-current={tourActive ? "page" : undefined} className={navLink(tourActive)}>
            Guided tour
          </button>
        </nav>

        <div className="relative ml-auto w-full sm:w-[300px] order-4 sm:order-none pb-3 sm:pb-0">
          <label>
            <span className="sr-only">Find a molecule</span>
            <Search size={16} aria-hidden className="absolute left-3 top-[20px] sm:top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              ref={box}
              type="search"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls="search-results"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCursor(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") (e.preventDefault(), setCursor((c) => Math.min(c + 1, results.length - 1)));
                if (e.key === "ArrowUp") (e.preventDefault(), setCursor((c) => Math.max(c - 1, 0)));
                if (e.key === "Enter" && results[cursor]) pick(results[cursor].key);
                if (e.key === "Escape") setQuery("");
              }}
              onBlur={() => setQuery("")}
              placeholder="Find a molecule"
              className="w-full h-10 rounded-btn border border-border bg-card pl-9 pr-9 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            />
            <kbd aria-hidden className="hidden sm:grid absolute right-2.5 top-1/2 -translate-y-1/2 place-items-center w-5 h-5 rounded-[5px] bg-muted text-[11px] font-semibold text-muted-foreground">
              /
            </kbd>
          </label>
          {query.trim() && (
            <div id="search-results" role="listbox" className="absolute right-0 left-0 sm:left-auto sm:w-[360px] top-full mt-2 sheet !p-1.5 shadow-[0_12px_32px_-12px_hsl(var(--foreground)/0.35)]">
              {results.length ? (
                results.map(({ key, via }, i) => (
                  <button
                    key={key}
                    role="option"
                    aria-selected={i === cursor}
                    onMouseEnter={() => setCursor(i)}
                    onMouseDown={(e) => e.preventDefault()} // keep focus so the blur doesn't close the list first
                    onClick={() => pick(key)}
                    className={cn("w-full text-left rounded-[7px] px-3 py-2", i === cursor && "bg-accent/35")}
                  >
                    <span className="block text-sm font-semibold">{MODELS[key].name}</span>
                    <span className="block text-xs text-muted-foreground">{via ? `Covers ${via}` : groupOf(key)}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-muted-foreground">Nothing matches “{query.trim()}”. Try a shorter word, like “delay” or “split”.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
