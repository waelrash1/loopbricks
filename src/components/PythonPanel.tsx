import { Code2, Download, ExternalLink } from "lucide-react";
import { SPECS } from "@/lib/spec";
import { colabUrl, notebooksFor, rawUrl } from "@/lib/notebook";

// On a molecule page: the same model in Python, with the notebooks that use it.
export default function PythonPanel({ molecule }: { molecule: string }) {
  const spec = SPECS[molecule];
  const nbs = notebooksFor(molecule);
  if (!spec && !nbs.length) return null;
  return (
    <section className="mt-16 grid lg:grid-cols-[260px_minmax(0,1fr)] gap-x-10 gap-y-4">
      <h2 className="heading text-[26px] flex items-center gap-2">
        <Code2 size={22} aria-hidden /> In Python
      </h2>
      <div className="grid gap-4 max-w-[80ch]">
        {spec && (
          <div className="sheet">
            <p className="text-[15px] leading-[1.6]">
              The <code>loopbricks</code> Python package runs this molecule from the same model file as the app, and gives the same numbers.
            </p>
            <pre className="mt-3 rounded-[8px] bg-background px-4 py-3 text-[13px] font-mono whitespace-pre-wrap [overflow-wrap:anywhere]">
              {`import loopbricks as lb\nm = lb.molecule("${molecule}")\ndf = m.run(${spec.presets[1] ? `preset="${spec.presets[1].label}"` : ""})\nm.plot(df)`}
            </pre>
          </div>
        )}
        {nbs.map((n) => (
          <div key={n.file} className="rounded-card bg-accent/25 px-5 py-4">
            <p className="heading text-[16px]">{n.title}</p>
            <p className="mt-1 text-[14px] text-foreground/80">A notebook that builds this model step by step, with exercises and worked answers.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={colabUrl(n.file)} target="_blank" rel="noreferrer" className="brick brick-y h-9 px-3.5 text-[13px] font-semibold inline-flex items-center gap-1.5">
                <ExternalLink size={14} aria-hidden /> Open in Colab
              </a>
              <a href={rawUrl(n.file)} download={n.file} className="brick brick-w h-9 px-3.5 text-[13px] font-semibold inline-flex items-center gap-1.5">
                <Download size={14} aria-hidden /> Download the notebook
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
