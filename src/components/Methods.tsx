import { ExternalLink } from "lucide-react";
import { METHOD_PAGES, METHOD_REFS, type MethodPage } from "@/data/methods";
import { cn } from "@/lib/utils";
import { CalibrationLab, SensitivityLab } from "@/components/Labs";

const wrap = "page";

function Refs({ keys }: { keys: string[] }) {
  return (
    <ul className="mt-3 text-[13.5px] leading-[1.6] text-muted-foreground space-y-1.5">
      {keys.map((k) => {
        const r = METHOD_REFS[k];
        const href = r.doi ? `https://doi.org/${r.doi}` : r.url;
        return (
          <li key={k}>
            {r.text}{" "}
            {href && (
              <a href={href} target="_blank" rel="noreferrer" className="tlink whitespace-nowrap">
                {r.doi ? "DOI" : "Link"}
                <ExternalLink size={11} aria-hidden className="inline ml-0.5 -mt-0.5" />
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function MethodsIndex({ onPage, onBook }: { onPage: (id: string) => void; onBook: () => void }) {
  return (
    <div className={`${wrap} pt-6 md:pt-8`}>
      <p className="text-sm text-muted-foreground mb-6">
        <button onClick={onBook} className="hover:text-foreground">
          Learn
        </button>
        <span aria-hidden className="mx-2">/</span>
        <span className="text-foreground font-semibold">Methods</span>
      </p>
      <h1 className="display text-[38px] md:text-[52px] max-w-[20ch]">Methods for real models</h1>
      <p className="mt-5 text-[18px] leading-[1.55] text-foreground/80 max-w-[60ch]">
        How to frame a problem with a reference mode (a sketch of the behaviour over time you want to explain), test a model until you trust it, measure its fit to data, and where machine learning and AI help.
      </p>
      <p className="mt-4 text-[15px] text-muted-foreground max-w-[70ch]">
        New to system dynamics? Start with the{" "}
        <button onClick={onBook} className="tlink font-semibold text-foreground">
          Course
        </button>
        : modules from foundations to modelling practice, with diagrams, equations, exercises you run here, and self-checks.
      </p>
      <h2 className="heading text-[22px] mt-12">The learning path</h2>
      <ol className="mt-5 grid md:grid-cols-2 gap-4">
        {METHOD_PAGES.map((p, i) => (
          <li key={p.id}>
            <button onClick={() => onPage(p.id)} className="brick brick-w w-full h-full text-left p-6 grid grid-cols-[40px_minmax(0,1fr)] gap-3">
              <span aria-hidden className="display text-[30px] text-accent-text leading-none">
                {i + 1}
              </span>
              <span>
                <span className="heading block text-[21px]">{p.title}</span>
                <span className="block mt-2 text-[14.5px] leading-[1.55] text-muted-foreground">{p.summary}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-[14px] text-muted-foreground max-w-[70ch]">
        The pages build on each other in this order: frame the problem, test the model, check it against data, then decide where data-driven methods add value.
      </p>
    </div>
  );
}

export function MethodsPage({ id, onPage, onOpen }: { id: string; onPage: (id: string) => void; onOpen: (hash: string) => void }) {
  const i = METHOD_PAGES.findIndex((p) => p.id === id);
  const p: MethodPage = METHOD_PAGES[i];
  const [prev, next] = [METHOD_PAGES[i - 1], METHOD_PAGES[i + 1]];
  return (
    <article className={`${wrap} pt-6 md:pt-8`}>
      <p className="text-sm text-muted-foreground mb-6">
        <button onClick={() => onOpen("/learn")} className="hover:text-foreground">
          Learn
        </button>
        <span aria-hidden className="mx-2">/</span>
        <button onClick={() => onPage("")} className="hover:text-foreground">
          Methods
        </button>
        <span aria-hidden className="mx-2">/</span>
        <span className="text-foreground font-semibold">{p.title}</span>
      </p>
      <h1 className="display text-[34px] md:text-[48px] max-w-[22ch]">{p.title}</h1>
      <p className="mt-4 text-[18px] leading-[1.55] text-foreground/80 max-w-[64ch]">{p.summary}</p>

      {p.tryIt && (
        <div className="mt-6 rounded-card bg-card border-l-4 border-accent px-5 py-4 max-w-[75ch]">
          <p className="heading text-[16px]">Try it in LoopBricks</p>
          <p className="mt-1 text-[15px] leading-[1.6]">{p.tryIt.text}</p>
          <button onClick={() => onOpen(p.tryIt!.hash)} className="brick brick-y mt-3 h-9 max-sm:min-h-11 px-4 text-[13.5px] font-semibold">
            {p.tryIt.label}
          </button>
        </div>
      )}

      {p.lab === "calibration" && <CalibrationLab />}
      {p.lab === "sensitivity" && <SensitivityLab />}

      {p.sections.map((s) => (
        <section key={s.heading} className="mt-12 max-w-[75ch]">
          <h2 className="heading text-[24px]">{s.heading}</h2>
          {s.body?.map((para) => (
            <p key={para} className="mt-3 text-[16px] leading-[1.7]">
              {para}
            </p>
          ))}
          {s.list && (
            <ul className="mt-3 space-y-2 text-[16px] leading-[1.6] list-disc pl-5 marker:text-accent-edge">
              {s.list.map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
          )}
          {s.formula && <pre className="mt-4 rounded-[8px] bg-card border border-border px-4 py-3 text-[13.5px] font-mono whitespace-pre-wrap [overflow-wrap:anywhere]">{s.formula}</pre>}
          {s.table && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-[14px] leading-[1.5] border-collapse">
                <thead>
                  <tr className="text-left">
                    {s.table.head.map((h) => (
                      <th key={h} className="py-2 pr-4 font-semibold border-b-2 border-foreground/70 align-bottom">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((r) => (
                    <tr key={r.join("|")} className="border-b border-border align-top">
                      {r.map((c, j) => (
                        <td key={j} className={cn("py-2.5 pr-4", j === 0 && "font-semibold")}>
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {s.example && (
            <div className="mt-5 rounded-card border border-border bg-card px-5 py-4">
              <p className="heading text-[16px]">Worked example: {s.example.title}</p>
              <ol className="mt-2 space-y-2 text-[15px] leading-[1.6] list-decimal pl-5 marker:font-bold">
                {s.example.steps.map((st) => (
                  <li key={st}>{st}</li>
                ))}
              </ol>
              {s.example.data && (
                <div className="mt-3 overflow-x-auto">
                  <table className="text-[13.5px] tabular-nums border-collapse">
                    <thead>
                      <tr>
                        {s.example.data.head.map((h) => (
                          <th key={h} className="text-left font-semibold py-1 pr-5 border-b border-foreground/60">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.example.data.rows.map((r) => (
                        <tr key={r.join()} className="border-b border-border">
                          {r.map((c, j) => (
                            <td key={j} className="py-1 pr-5">
                              {c}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {s.example.link && (
                <button onClick={() => onOpen(s.example!.link!.hash)} className="brick brick-w mt-3 h-9 max-sm:min-h-11 px-4 text-[13px] font-semibold">
                  {s.example.link.label}
                </button>
              )}
            </div>
          )}
          {s.cite && <p className="mt-3 text-[13px] text-muted-foreground">Sources: {s.cite.map((k) => METHOD_REFS[k].short).join("; ")}</p>}
        </section>
      ))}

      <section className="mt-14">
        <h2 className="heading text-[20px]">References</h2>
        <Refs keys={p.refs} />
      </section>

      <nav aria-label="Next and previous method" className="mt-12 grid sm:grid-cols-2 gap-4 print:hidden">
        {prev ? (
          <button onClick={() => onPage(prev.id)} className="brick brick-w text-left px-5 py-4">
            <span className="block text-[13px] text-muted-foreground">Previous</span>
            <span className="heading block text-[18px] mt-1">{prev.title}</span>
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button onClick={() => onPage(next.id)} className="brick brick-w text-left sm:text-right px-5 py-4">
            <span className="block text-[13px]">Next</span>
            <span className="heading block text-[18px] mt-1">{next.title}</span>
          </button>
        )}
      </nav>
    </article>
  );
}
