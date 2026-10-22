import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { LEARN_REFS, READINGS, refFor } from "@/data/learn/readings";
import { METHOD_REFS } from "@/data/methods";

type MethodRef = { text: string; doi?: string; url?: string };
import { MODULES } from "@/data/learn/modules";
import { STUDIO } from "@/data/learn/studio";
import { ALL_CASES, REFS } from "@/data/apps";
import { DoiLink } from "@/components/Readings";

const wrap = "max-w-[1100px] mx-auto px-4 md:px-8";

type Entry = { key: string; r: MethodRef; where: { label: string; hash: string }[] };

// author surname for sorting and grouping: "Sterman JD (2000). ..." → "Sterman"
const sortKey = (r: MethodRef) => r.text.toLowerCase();
const isBook = (r: MethodRef) => !/\d+\(\d+[^)]*\):|\d+:\d+|:e\d+/.test(r.text);

export function ReferencesPage({ go }: { go: (h: string) => void }) {
  const [q, setQ] = useState("");
  const entries = useMemo(() => {
    const byText = new Map<string, Entry>();
    const add = (key: string, r: MethodRef | undefined, where?: { label: string; hash: string }) => {
      if (!r) return;
      // the same work can be cited in slightly different words in different places: match on DOI, else on authors, year and title start
      const id = (r.doi ?? r.text.replace(/[^a-z0-9]/gi, "").slice(0, 50)).toLowerCase();
      const e = byText.get(id) ?? { key, r, where: [] };
      if (where && !e.where.some((w) => w.hash === where.hash)) e.where.push(where);
      byText.set(id, e);
    };
    MODULES.forEach((m) => {
      const rd = READINGS[m.id];
      rd && [...rd.core, ...rd.further].forEach((x) => add(x.ref, refFor(x.ref), { label: m.title, hash: `/learn/${m.id}` }));
    });
    STUDIO.forEach((c) => c.refs.forEach((k) => add(k, refFor(k), { label: c.title, hash: `/learn/studio/${c.id}` })));
    ALL_CASES.forEach(({ domain, c }) => c.refs.forEach((k) => add(k, REFS[k], { label: c.title, hash: `/apps/${domain.id}/${c.id}` })));
    Object.entries(METHOD_REFS).forEach(([k, r]) => add(k, r));
    Object.entries(LEARN_REFS).forEach(([k, r]) => add(k, r));
    return [...byText.values()].sort((a, b) => sortKey(a.r).localeCompare(sortKey(b.r)));
  }, []);
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = entries.filter((e) => words.every((w) => (e.r.text + " " + e.where.map((x) => x.label).join(" ")).toLowerCase().includes(w)));
  const groups: [string, Entry[]][] = [
    ["Journal articles and chapters", shown.filter((e) => !isBook(e.r))],
    ["Books and reports", shown.filter((e) => isBook(e.r))],
  ];
  const articles = entries.filter((e) => !isBook(e.r)).length;

  return (
    <div className={`${wrap} pt-6 md:pt-8`}>
      <p className="text-sm text-muted-foreground mb-6">
        <button onClick={() => go("/learn")} className="hover:text-foreground">
          Learn
        </button>
        <span aria-hidden className="mx-2">/</span>
        <span className="text-foreground">Reading list</span>
      </p>
      <h1 className="display text-[32px] md:text-[44px]">Reading list</h1>
      <p className="mt-3 text-[16.5px] leading-[1.6] text-foreground/85 max-w-[66ch]">
        Every source cited in the course, the modelling studio, the methods pages and the application cases: {entries.length} in all, {articles} of them journal articles or
        chapters. Journal articles were matched to their Crossref or PubMed records, and each links to its DOI. Under each source you can see where it is used.
      </p>
      <label className="mt-6 relative block max-w-[460px]">
        <span className="sr-only">Search the reading list</span>
        <Search size={16} aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Author, title, journal or topic"
          className="w-full h-11 rounded-[8px] border border-border bg-background pl-9 pr-3 text-[15px] placeholder:text-muted-foreground"
        />
      </label>
      <p role="status" className="mt-2 text-[13px] text-muted-foreground">
        {words.length ? `${shown.length} matching` : `${entries.length} sources`}
      </p>
      {groups.map(([title, list]) =>
        list.length ? (
          <section key={title} className="mt-10">
            <h2 className="heading text-[22px]">
              {title} <span className="text-muted-foreground text-[16px] font-normal tabular-nums">{list.length}</span>
            </h2>
            <ul className="mt-4 grid gap-4">
              {list.map((e, i) => (
                <li key={i} className="max-w-[90ch]">
                  <span className="text-[15px] leading-[1.6]">
                    {e.r.text} <DoiLink r={e.r} />
                  </span>
                  {e.where.length > 0 && (
                    <span className="block mt-1 text-[13px] text-muted-foreground">
                      Used in:{" "}
                      {e.where.slice(0, 4).map((w, i) => (
                        <span key={w.hash}>
                          {i > 0 && ", "}
                          <button onClick={() => go(w.hash)} className="underline underline-offset-2 hover:text-foreground">
                            {w.label}
                          </button>
                        </span>
                      ))}
                      {e.where.length > 4 && ` and ${e.where.length - 4} more`}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null
      )}
      {!shown.length && <p className="mt-10 sheet">No source matches “{q}”. Try an author's surname or a journal name.</p>}
    </div>
  );
}
