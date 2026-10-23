import { useEffect, useRef, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { MODELS } from "@/data/molecules";
import { groupOf, search, useApps } from "@/data/catalog";
import { cn } from "@/lib/utils";

// two studs on a brick
export const BrickMark = ({ size = 26 }: { size?: number }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
    <rect x="6" y="4" width="7" height="6" rx="1.5" fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth="2" />
    <rect x="19" y="4" width="7" height="6" rx="1.5" fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth="2" />
    <rect x="2" y="10" width="28" height="18" rx="3" fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth="2" />
  </svg>
);

export type Section = "home" | "learn" | "library" | "cases" | "build";
// Four places, named for what you do there; the book is the fifth, outside the app.
const NAV: [Section, string, string][] = [
  ["learn", "Learn", "/learn"],
  ["library", "Library", "/library"],
  ["cases", "Cases", "/apps"],
  ["build", "Build", "/build"],
];

const navLink = (active: boolean) =>
  cn(
    "relative h-16 inline-flex items-center text-[14px] sm:text-[15px] font-semibold",
    active ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-t after:bg-accent" : "text-muted-foreground hover:text-foreground"
  );

export default function TopBar({ section, go, onSelect, onCase }: { section: Section; go: (hash: string) => void; onSelect: (k: string) => void; onCase: (domain: string, id: string) => void }) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  // on a phone the box folds into an icon so the header stays one row
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLInputElement>(null);
  const apps = useApps(open || !!query);
  // molecules first, then healthcare cases; each knows how to open itself
  const results = query.trim()
    ? [
        ...search(query).map(({ key, via }) => ({ id: "m:" + key, label: MODELS[key].name, sub: via ? `Covers ${via}` : groupOf(key), go: () => onSelect(key) })),
        ...(apps?.searchApps(query) ?? []).map(({ domain, c }) => ({ id: `c:${domain.id}/${c.id}`, label: c.title, sub: `${domain.short}: ${c.theme}`, go: () => onCase(domain.id, c.id) })),
      ].slice(0, 9)
    : [];

  // "/" or Cmd+K jumps to search from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const cmdK = e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey);
      if (!cmdK && (e.key !== "/" || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT")) return;
      e.preventDefault();
      setOpen(true);
      box.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (open) box.current?.focus();
  }, [open]);

  const pick = (r: (typeof results)[number]) => {
    setQuery("");
    box.current?.blur();
    r.go();
  };

  return (
    <header className="print:hidden sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border">
      <div className="page flex flex-wrap sm:flex-nowrap items-center gap-x-2 sm:gap-x-6 xl:gap-x-8">
        <a href="#/" onClick={(e) => (e.preventDefault(), go("/"))} className="h-16 flex items-center gap-2.5 rounded-btn shrink-0" aria-label="LoopBricks home">
          <BrickMark />
          <span className="heading text-[19px] hidden md:inline">LoopBricks</span>
        </a>
        <nav aria-label="Main" className="flex gap-3 sm:gap-6 min-w-0 flex-1 sm:flex-none overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV.map(([id, label, hash]) => (
            <a key={id} href={"#" + hash} onClick={(e) => (e.preventDefault(), go(hash))} aria-current={section === id ? "page" : undefined} className={navLink(section === id)}>
              {label}
            </a>
          ))}
          <a href="./book/" className={cn(navLink(false), "gap-1.5")}>
            <BookOpen size={16} aria-hidden className="hidden sm:block" /> Book
          </a>
        </nav>

        <button onClick={() => setOpen(true)} aria-label="Search molecules and cases" aria-expanded={open} className={cn("sm:hidden ml-auto grid place-items-center w-11 h-11 rounded-btn shrink-0", open && "hidden")}>
          <Search size={19} aria-hidden />
        </button>
        <div className={cn("relative ml-auto w-full sm:w-[220px] xl:w-[280px] pb-3 sm:pb-0 sm:block", !open && "hidden")}>
          <label>
            <span className="sr-only">Search molecules and cases</span>
            <Search size={16} aria-hidden className="absolute left-3 top-[20px] sm:top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              ref={box}
              type="search"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls="search-results"
              aria-autocomplete="list"
              aria-activedescendant={results[cursor] ? `search-opt-${cursor}` : undefined}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCursor(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") (e.preventDefault(), setCursor((c) => Math.min(c + 1, results.length - 1)));
                if (e.key === "ArrowUp") (e.preventDefault(), setCursor((c) => Math.max(c - 1, 0)));
                if (e.key === "Enter" && results[cursor]) pick(results[cursor]);
                if (e.key === "Escape") setQuery("");
              }}
              onBlur={() => (setQuery(""), setOpen(false))}
              placeholder="Search molecules and cases"
              className="w-full h-10 rounded-btn border border-border bg-card pl-9 pr-9 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            />
            <kbd aria-hidden className="hidden sm:grid absolute right-2.5 top-1/2 -translate-y-1/2 place-items-center w-5 h-5 rounded-[5px] bg-muted text-[11px] font-semibold text-muted-foreground">
              /
            </kbd>
          </label>
          {query.trim() && (
            <div id="search-results" role="listbox" className="absolute right-0 left-0 sm:left-auto sm:w-[360px] top-full mt-2 sheet !p-1.5 shadow-[0_12px_32px_-12px_hsl(var(--foreground)/0.35)]">
              {results.length ? (
                results.map((r, i) => (
                  <button
                    key={r.id}
                    id={`search-opt-${i}`}
                    tabIndex={-1}
                    role="option"
                    aria-selected={i === cursor}
                    onMouseEnter={() => setCursor(i)}
                    onMouseDown={(e) => e.preventDefault()} // keep focus so the blur doesn't close the list first
                    onClick={() => pick(r)}
                    className={cn("w-full text-left rounded-[7px] px-3 py-2", i === cursor && "bg-accent/35")}
                  >
                    <span className="block text-sm font-semibold">{r.label}</span>
                    <span className="block text-xs text-muted-foreground">{r.sub}</span>
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
