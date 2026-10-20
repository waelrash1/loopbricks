import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, Search, X } from "lucide-react";
import { GROUPS, MODELS } from "@/data/molecules";
import { DOMAINS } from "@/data/apps";
import { cn } from "@/lib/utils";
import { forgetAll, useSeen } from "@/lib/progress";

type Mode = "molecules" | "apps";
type Item = { key: string; label: string; hint?: React.ReactNode };
type Group = { id: string; title: string; items: Item[] };

// B / R tags in the diagrams' own colours, so the list teaches as you scan it
function Loops({ k }: { k: string }) {
  const t = new Set(MODELS[k].cld.loops.map((l) => l.type));
  return (
    <span className="ml-auto flex gap-0.5 shrink-0" aria-hidden>
      {t.has("B") && <span className="chip chipB !mr-0 !h-4 !min-w-4 !text-[9.5px]">B</span>}
      {t.has("R") && <span className="chip chipR !mr-0 !h-4 !min-w-4 !text-[9.5px]">R</span>}
    </span>
  );
}

const MOLECULE_GROUPS: Group[] = GROUPS.map((g) => ({
  id: g.title,
  title: g.title,
  items: g.keys.map((k) => ({ key: k, label: MODELS[k].name, hint: <Loops k={k} /> })),
}));
// application items are keyed "<field>/<case>", which is also their address under #/apps/
const APP_GROUPS: Group[] = DOMAINS.map((d) => ({
  id: d.id,
  title: d.name,
  items: d.cases.map((c) => ({
    key: `${d.id}/${c.id}`,
    label: c.title,
    hint: !c.sim && <span className="ml-auto shrink-0 text-[10.5px] font-semibold text-muted-foreground">build</span>,
  })),
}));

// Every molecule by family, or every application case by field. On large screens it sits beside the page;
// below that it slides over the page and closes after a pick.
export default function SidePane({
  initialMode,
  current,
  onMolecule,
  onCase,
  onClose,
}: {
  initialMode: Mode;
  current?: string; // a molecule key, or "<field>/<case>"
  onMolecule: (k: string) => void;
  onCase: (key: string) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const list = useRef<HTMLDivElement>(null);
  const seen = useSeen();
  const narrow = () => !matchMedia("(min-width: 1024px)").matches;
  // following the page into the other list starts it unfiltered
  useEffect(() => {
    setMode(initialMode);
    setFilter("");
  }, [initialMode]);

  const groups = mode === "molecules" ? MOLECULE_GROUPS : APP_GROUPS;
  const q = filter.trim().toLowerCase();
  const shown = useMemo(
    // a match on the group's own name keeps the whole group ("delay" brings up Delays & decays)
    () => (q ? groups.map((g) => (g.title.toLowerCase().includes(q) ? g : { ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q)) })).filter((g) => g.items.length) : groups),
    [groups, q]
  );
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const opened = groups.reduce((n, g) => n + g.items.filter((i) => seen.has(i.key)).length, 0);

  // the group holding the current page opens itself, and its item scrolls into view
  useEffect(() => {
    const g = groups.find((x) => x.items.some((i) => i.key === current));
    if (g) setOpen((s) => (s.has(g.id) ? s : new Set(s).add(g.id)));
    requestAnimationFrame(() => list.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" }));
  }, [current, groups]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && narrow() && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const allOpen = shown.every((g) => open.has(g.id));
  const pick = (key: string) => {
    (mode === "molecules" ? onMolecule : onCase)(key);
    if (narrow()) onClose();
  };

  return (
    <>
      <div aria-hidden onClick={onClose} className="pane-fade print:hidden lg:hidden fixed inset-0 z-30 bg-foreground/30" />
      <nav
        aria-label="Browse"
        className="pane-in print:hidden fixed lg:sticky z-40 lg:z-auto left-0 top-0 lg:top-16 h-[100dvh] lg:h-[calc(100dvh-4rem)] w-[300px] lg:w-[272px] shrink-0 flex flex-col border-r border-border bg-background shadow-[8px_0_24px_-16px_hsl(var(--foreground)/0.35)] lg:shadow-none"
      >
        <div className="px-3 pt-3 pb-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <div role="tablist" aria-label="What to list" className="grid grid-cols-2 flex-1 rounded-[9px] bg-muted p-[3px]">
              {(["molecules", "apps"] as const).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => {
                    setMode(m);
                    setFilter("");
                  }}
                  className={cn(
                    "h-8 rounded-[7px] text-[13px] font-semibold transition-colors",
                    mode === m ? "bg-card text-foreground shadow-[0_1px_0_hsl(var(--edge))]" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m === "molecules" ? "Molecules" : "Applications"}
                </button>
              ))}
            </div>
            <button onClick={onClose} aria-label="Hide this list" title="Hide this list" className="grid place-items-center w-8 h-8 rounded-[7px] text-muted-foreground hover:bg-muted hover:text-foreground">
              <X size={16} aria-hidden />
            </button>
          </div>
          <label className="relative block mt-2.5">
            <span className="sr-only">Filter {mode === "molecules" ? "molecules" : "cases"}</span>
            <Search size={14} aria-hidden className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={`Filter ${total} ${mode === "molecules" ? "molecules" : "cases"}`}
              className="w-full h-9 rounded-[8px] border border-border bg-card pl-8 pr-2 text-[13px] placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            />
          </label>
        </div>

        <div ref={list} className="flex-1 overflow-y-auto overscroll-contain px-2 py-2">
          {!q && (
            <div className="flex items-center justify-between gap-2 px-1 pb-1 text-[12px]">
              <span className="text-muted-foreground">
                {opened ? (
                  <>
                    {opened} of {total} opened{" "}
                    <button onClick={() => confirm("Forget which molecules and cases you have opened?") && forgetAll()} className="tlink font-semibold">
                      Reset
                    </button>
                  </>
                ) : (
                  "Ticks mark pages you open"
                )}
              </span>
              <button
                onClick={() => setOpen(allOpen ? new Set() : new Set(groups.map((g) => g.id)))}
                className="shrink-0 whitespace-nowrap text-[12px] font-semibold text-muted-foreground hover:text-foreground rounded-[5px] px-1"
              >
                {allOpen ? "Collapse all" : "Expand all"}
              </button>
            </div>
          )}
          {shown.length === 0 && (
            <p className="px-3 py-6 text-[13px] text-muted-foreground">
              Nothing matches “{filter.trim()}”. Try a shorter word, or switch to {mode === "molecules" ? "Applications" : "Molecules"}.
            </p>
          )}
          {shown.map((g) => {
            const expanded = q !== "" || open.has(g.id);
            const hasCurrent = g.items.some((i) => i.key === current);
            return (
              <section key={g.id} className="mb-0.5">
                <h2>
                  <button
                    onClick={() => toggle(g.id)}
                    aria-expanded={expanded}
                    disabled={q !== ""}
                    className="group w-full flex items-center gap-2 rounded-[7px] px-2 py-1.5 text-left hover:bg-muted disabled:hover:bg-transparent"
                  >
                    <ChevronRight size={14} aria-hidden className={cn("shrink-0 text-muted-foreground transition-transform duration-200", expanded && "rotate-90")} />
                    <span className={cn("flex-1 text-[13px] font-bold leading-snug", hasCurrent ? "text-foreground" : "text-foreground/80")}>{g.title}</span>
                    <span className="shrink-0 rounded-[5px] bg-muted px-1.5 text-[11px] font-semibold tabular-nums text-muted-foreground group-hover:bg-card">
                      {(() => {
                        const n = g.items.filter((i) => seen.has(i.key)).length;
                        return n ? `${n}/${g.items.length}` : g.items.length;
                      })()}
                    </span>
                  </button>
                </h2>
                {/* grid-rows 0fr→1fr animates the height without measuring it */}
                <div className={cn("grid transition-[grid-template-rows] duration-200 ease-out", expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <ul className="overflow-hidden" {...(!expanded && { inert: "" })}>
                    <li className="h-0.5" aria-hidden />
                    {g.items.map((i) => {
                      const active = i.key === current;
                      return (
                        <li key={i.key} className="relative pl-[19px]">
                          <span aria-hidden className={cn("absolute left-[14px] top-0 bottom-0 w-px", active ? "bg-accent-edge" : "bg-border")} />
                          <button
                            onClick={() => pick(i.key)}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "w-full flex items-center gap-2 rounded-[7px] px-2.5 py-[5px] text-left text-[13px] leading-snug",
                              active ? "bg-accent font-semibold text-accent-foreground shadow-[0_2px_0_hsl(var(--accent-edge))]" : "text-foreground/80 hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <span className="min-w-0">{i.label}</span>
                            {seen.has(i.key) && !active && <Check size={13} strokeWidth={3} aria-label="opened" className="shrink-0 text-[var(--viz-good)]" />}
                            {i.hint}
                          </button>
                        </li>
                      );
                    })}
                    <li className="h-1.5" aria-hidden />
                  </ul>
                </div>
              </section>
            );
          })}
        </div>
      </nav>
    </>
  );
}
