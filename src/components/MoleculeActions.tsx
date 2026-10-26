import { useEffect, useState } from "react";
import { Download, Hammer } from "lucide-react";
import type { Vars } from "@/sim/engine";

// The two ways out of a molecule page: into the model builder, or to a Python script.
// Both work from the molecule's shared model file, with the sliders as they are now.
// The model files and the exporter are large, so they load only on a molecule page.
type SpecMod = typeof import("@/lib/spec");

const btn = "brick brick-w inline-flex items-center gap-2 h-11 px-4 text-[14px] font-semibold whitespace-nowrap";

export default function MoleculeActions({ modelKey, params, onOpen }: { modelKey: string; params: Vars; onOpen: (hash: string) => void }) {
  const [specs, setSpecs] = useState<SpecMod | null>(null);
  const [note, setNote] = useState("");
  useEffect(() => {
    let live = true;
    import("@/lib/spec").then((m) => live && setSpecs(m));
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => setNote(""), [modelKey]);
  const spec = specs?.SPECS[modelKey];
  if (!specs || !spec) return null;

  const toBuilder = async () => {
    const { loadModel, saveModel } = await import("@/lib/builder");
    const had = loadModel();
    // the builder keeps one model; ask before replacing work that is there
    if (had && (had.stocks.length || had.flows.length) && !window.confirm(`Replace the model in the builder (“${had.name}”) with ${spec.model.name}? Export it first if you want to keep it.`)) return;
    if (!saveModel(specs.withParams(spec, params))) return setNote("Your browser would not store the model (storage full or private mode), so the builder cannot open it.");
    onOpen("/learn/build");
  };
  const toPython = async () => {
    const [{ pythonScript, slug }, { download }] = await Promise.all([import("@/lib/exports"), import("@/lib/runs")]);
    const m = specs.withParams(spec, params);
    const file = `${slug(m)}.py`;
    download(file, pythonScript(m), "text/x-python");
    setNote(`Downloaded ${file} with the current settings. It needs numpy, pandas and matplotlib.`);
  };

  return (
    <div className="flex flex-col items-start lg:items-end gap-2">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={toBuilder} className={btn} title="Opens with the current slider settings">
          <Hammer size={15} aria-hidden /> Open in the builder
        </button>
        <button type="button" onClick={toPython} className={btn} title="A Python script with the current slider settings">
          <Download size={15} aria-hidden /> Export Python
        </button>
      </div>
      <p role="status" className="text-[13px] text-muted-foreground max-w-[44ch] lg:text-right">
        {note}
      </p>
    </div>
  );
}
