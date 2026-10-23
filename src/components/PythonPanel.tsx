import { Code2, Download, ExternalLink, Hammer } from "lucide-react";
import { loadModel, saveModel } from "@/lib/builder";
import { SPECS } from "@/lib/spec";
import { colabUrl, notebooksFor, rawUrl } from "@/lib/notebook";
import { moduleById } from "@/data/learn/modules";

const moduleTitle = (id: string) => `${moduleById(id)?.title ?? id} in Python`;

// Browsers ignore `download` on another site's link, so fetch the file and save it; if that fails, the link opens it.
async function download(e: React.MouseEvent, file: string) {
  e.preventDefault();
  try {
    const res = await fetch(rawUrl(file));
    if (!res.ok) throw new Error(String(res.status));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(await res.blob());
    a.download = file;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  } catch {
    window.open(rawUrl(file), "_blank", "noopener");
  }
}

// A notebook's title with its two ways in: Colab, or download and run locally.
export function NotebookLinks({ file, title }: { file: string; title: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[14px] font-semibold mr-1">{title}</span>
      <a href={colabUrl(file)} target="_blank" rel="noreferrer" className="brick brick-y h-8 max-sm:min-h-11 px-3 text-[12px] font-semibold inline-flex items-center gap-1.5">
        <ExternalLink size={13} aria-hidden /> Open in Colab
      </a>
      <a href={rawUrl(file)} download={file} onClick={(e) => download(e, file)} className="brick brick-w h-8 max-sm:min-h-11 px-3 text-[12px] font-semibold inline-flex items-center gap-1.5">
        <Download size={13} aria-hidden /> Download
      </a>
    </div>
  );
}

// On a molecule page: the same model in Python, with the notebooks that use it.
export default function PythonPanel({ molecule, onOpen }: { molecule: string; onOpen: (hash: string) => void }) {
  const spec = SPECS[molecule];
  const nbs = notebooksFor(molecule);
  if (!spec && !nbs.length) return null;
  // the builder keeps one model; ask before replacing work that is there
  const toBuilder = () => {
    const had = loadModel();
    if (had && (had.stocks.length || had.flows.length) && !window.confirm(`Replace the model in the builder (“${had.name}”) with ${spec!.model.name}? Export it first if you want to keep it.`)) return;
    saveModel(JSON.parse(JSON.stringify(spec!.model)));
    onOpen("/learn/build");
  };
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
            <button onClick={toBuilder} className="brick brick-w mt-3 h-9 px-3.5 text-[13px] font-semibold inline-flex items-center gap-1.5">
              <Hammer size={14} aria-hidden /> Open in the model builder
            </button>
          </div>
        )}
        {nbs.length > 0 && (
          <div className="rounded-card bg-card border-l-4 border-accent px-5 py-4">
            <p className="heading text-[16px]">Notebooks that use it</p>
            <p className="mt-1 text-[14px] text-foreground/80">Python companions to the Learn modules, with exercises and worked answers.</p>
            <ul className="mt-3 space-y-2">
              {nbs.map((n) => (
                <li key={n.file}><NotebookLinks file={n.file} title={moduleTitle(n.module)} /></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
