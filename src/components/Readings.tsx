import { ExternalLink } from "lucide-react";
import { READINGS, refFor, refUrl, type Reading } from "@/data/learn/readings";

export function DoiLink({ r }: { r: { text: string; doi?: string; url?: string } }) {
  const url = refUrl(r);
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="tlink font-semibold whitespace-nowrap inline-flex items-center gap-0.5">
      {r.doi ? "DOI" : "Link"}
      <ExternalLink size={12} aria-hidden />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function ReadingItem({ x }: { x: Reading }) {
  const r = refFor(x.ref);
  if (!r) return null;
  return (
    <li className="grid gap-0.5">
      <span className="text-[14.5px] leading-[1.55]">
        {r.text}
        <DoiLink r={r} />
        {x.where && <span className="font-semibold"> Read {x.where}.</span>}
      </span>
      <span className="text-[14px] leading-[1.5] text-muted-foreground">{x.why}</span>
    </li>
  );
}

// On a module page: what to read, why, and what to argue about afterwards.
export function ModuleReadings({ id, go }: { id: string; go: (h: string) => void }) {
  const r = READINGS[id];
  if (!r) return null;
  return (
    <section className="mt-14" aria-labelledby="rd-head">
      <h2 id="rd-head" className="heading text-[22px] md:text-[24px]">
        Read and discuss
      </h2>
      <div className="mt-4 grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-8">
        <div className="grid gap-6">
          <div>
            <h3 className="heading text-[16px]">Core reading</h3>
            <ul className="mt-2 grid gap-3">
              {r.core.map((x) => (
                <ReadingItem key={x.ref + (x.where ?? "")} x={x} />
              ))}
            </ul>
          </div>
          {r.further.length > 0 && (
            <div>
              <h3 className="heading text-[16px]">Further reading</h3>
              <ul className="mt-2 grid gap-3">
                {r.further.map((x) => (
                  <ReadingItem key={x.ref + (x.where ?? "")} x={x} />
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="rounded-card bg-card border-l-4 border-accent px-5 py-4 self-start">
          <h3 className="heading text-[16px]">Seminar questions</h3>
          <ol className="mt-2 grid gap-3 list-decimal pl-5 text-[15px] leading-[1.6]">
            {r.seminar.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </div>
      </div>
      <p className="mt-4 text-[13.5px] text-muted-foreground">
        Every source in the course is on the{" "}
        <button onClick={() => go("/learn/references")} className="tlink font-semibold text-foreground">
          reading list
        </button>
        .
      </p>
    </section>
  );
}

