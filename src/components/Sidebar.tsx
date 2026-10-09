import { useEffect, useRef, useState } from "react";
import { GraduationCap, Map as MapIcon, Search } from "lucide-react";
import { GROUPS, MODELS } from "@/data/molecules";
import { TOUR, groupOf, search } from "@/data/catalog";
import { cn } from "@/lib/utils";
import { THEMES, applyTheme, storedTheme } from "@/lib/theme";

const item = (active: boolean) =>
  cn(
    "flex items-center gap-2.5 w-full text-left rounded-btn px-3 py-2 text-sm transition-colors",
    active ? "bg-accent text-accent-foreground font-medium" : "text-foreground/80 hover:bg-secondary"
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
  const [theme, setTheme] = useState(storedTheme);
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
    <nav
      aria-label="Molecules"
      className="border-b md:border-b-0 md:border-r border-border p-4 md:sticky md:top-0 md:h-screen md:overflow-y-auto"
    >
      <button onClick={showMap} className="block px-3 pt-1 pb-4 text-left text-[18px] font-bold tracking-tight rounded-lg">
        Molecules of Structure
      </button>

      <div className="flex md:flex-col gap-1">
        <button onClick={showMap} aria-current={mapActive ? "page" : undefined} className={item(mapActive)}>
          <MapIcon size={16} aria-hidden />
          Overview map
        </button>
        <button onClick={startTour} aria-current={tourActive ? "page" : undefined} className={item(tourActive)}>
          <GraduationCap size={16} aria-hidden />
          Guided tour
        </button>
      </div>

      <fieldset className="mt-4 px-3">
        <legend className="text-xs font-medium text-muted-foreground mb-2">
          Theme: <span className="text-foreground">{THEMES.find((t) => t.id === theme)?.label}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <label key={t.id} title={t.label} className="cursor-pointer">
              <input
                type="radio"
                name="theme"
                value={t.id}
                checked={theme === t.id}
                onChange={() => {
                  applyTheme(t.id);
                  setTheme(t.id);
                }}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className="block h-6 w-6 rounded-full border border-foreground/25 peer-checked:ring-2 peer-checked:ring-foreground peer-checked:ring-offset-2 peer-checked:ring-offset-background peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-link"
                style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)` }}
              />
              <span className="sr-only">{t.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="relative block mt-5">
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
          className="w-full h-10 rounded-btn border border-input bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground"
        />
      </label>

      <div ref={list} className="mt-2">
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
              className="md:hidden w-full h-11 rounded-card border border-input bg-card px-3 text-sm"
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
                  <summary className="flex cursor-pointer items-baseline justify-between gap-2 rounded-btn px-3 py-2 mt-1 text-[13px] font-medium hover:bg-secondary">
                    {group.title}
                    <span className="text-xs font-normal text-muted-foreground tabular-nums">{group.keys.length}</span>
                  </summary>
                  {group.keys.map((k) => {
                    const active = current === k;
                    return (
                      <button key={k} onClick={() => onSelect(k)} aria-current={active ? "page" : undefined} className={item(active)}>
                        <span className={cn("tabular-nums text-xs w-5 shrink-0", active ? "text-link" : "text-muted-foreground")}>
                          {TOUR.indexOf(k) + 1}
                        </span>
                        {MODELS[k].name}
                      </button>
                    );
                  })}
                </details>
              ))}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
