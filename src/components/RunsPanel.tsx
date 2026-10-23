import { useEffect, useRef, useState } from "react";
import { Download, Eye, EyeOff, FileUp, Sliders, Trash2, Wand2 } from "lucide-react";
import type { Model } from "@/data/molecules";
import type { FrameCb } from "@/hooks/useSimulation";
import type { History, Vars } from "@/sim/engine";
import { MAX_RUNS, at, download, newId, parsePoints, setShelf, thin, useShelf, type RefData, type SavedRun, type Shelf } from "@/lib/runs";
import { calibrate, fitStats, type Fit } from "@/lib/fit";
import { RUN_DASH } from "@/components/TimeSeriesChart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Sim = {
  params: Vars;
  applyParams: (p: Vars) => void;
  reset: () => void;
  play: () => void;
  setStopTime: (n: number) => void;
  subscribe: (fn: FrameCb) => () => void;
};

const field = "h-9 rounded-[8px] border border-border bg-card px-2.5 text-[13px] focus:border-foreground focus:outline-none";
const iconBtn = "grid place-items-center w-8 h-8 rounded-[7px] text-muted-foreground hover:bg-muted hover:text-foreground";
const f2 = (v: number) => (Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 1 ? v.toFixed(2) : v.toPrecision(2));

// What the Theil shares say, in plain words (Sterman 1984): where most of the error comes from
function diagnose(f: Fit) {
  // the shares always sum to 1, so on a near-perfect fit they describe a tiny error; say that first
  if (f.r2 > 0.98 && f.mape != null && f.mape < 0.03) return `A close fit: within ${(f.mape * 100).toFixed(1)}% of the data on average.`;
  if (f.um >= 0.5) return "Most of the error is bias: the run sits above or below the data. Check initial values and constant levels.";
  if (f.us >= 0.5) return "Most of the error is unequal variation: the run swings more or less than the data. Check gains and time constants.";
  if (f.uc >= 0.5) return "Most of the error is unequal covariation: the run follows the trend but not every wiggle. Often that is noise the model should not chase.";
  return "The error is spread across bias, variation and timing.";
}

export default function RunsPanel({ modelKey, model, sim }: { modelKey: string; model: Model; sim: Sim }) {
  const shelf = useShelf(modelKey);
  const hist = useRef<History>({ times: [], series: [] });
  const [tick, setTick] = useState(0); // refreshes the fit table while a run plays, at most twice a second
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [adding, setAdding] = useState(false);
  const [calIds, setCalIds] = useState<string[]>([]);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let last = 0;
    return sim.subscribe(({ history }) => {
      hist.current = history;
      const now = performance.now();
      if (now - last > 500) (last = now), setTick((t) => t + 1);
    });
  }, [sim.subscribe]);

  const update = (next: Shelf) => {
    if (!setShelf(modelKey, next)) setNote("Your browser would not store this (storage full or private mode). It stays until you leave the page; export it to keep it.");
  };
  const shown = model.stocks.filter((s) => !s.hidden);

  const save = () => {
    const h = hist.current;
    if (h.times.length < 3) return setNote("Run the model first, then save the run.");
    if (shelf.runs.length >= MAX_RUNS) return setNote(`You can keep ${MAX_RUNS} runs per model. Delete one to save another.`);
    const t = thin(h.times, h.series);
    const run: SavedRun = {
      id: newId(),
      name: name.trim() || `Run ${shelf.runs.length + 1}`,
      params: { ...sim.params },
      times: t.times,
      series: Object.fromEntries(model.stocks.map((s, i) => [s.id, t.series[i]])),
      visible: true,
      saved: new Date().toISOString(),
    };
    update({ ...shelf, runs: [...shelf.runs, run] });
    setName("");
    setNote(`Saved “${run.name}”. It is drawn dashed on the chart.`);
  };

  const patchRun = (id: string, p: Partial<SavedRun>) => update({ ...shelf, runs: shelf.runs.map((r) => (r.id === id ? { ...r, ...p } : r)) });
  const patchRef = (id: string, p: Partial<RefData>) => update({ ...shelf, refs: shelf.refs.map((r) => (r.id === id ? { ...r, ...p } : r)) });

  // tidy CSV: one row per run and time, every stock and every setting as a column, so it opens straight in Excel or R
  const exportCsv = () => {
    const h = hist.current;
    const params = model.params.map((p) => p.id);
    const head = ["run", "time", ...shown.map((s) => s.label), ...model.params.map((p) => `${p.label} (${p.unit || "setting"})`)];
    const rows: (string | number)[][] = [];
    const cur = thin(h.times, h.series, 2000);
    cur.times.forEach((t, j) => rows.push(["current run", t, ...shown.map((s) => cur.series[model.stocks.indexOf(s)][j]), ...params.map((id) => sim.params[id])]));
    shelf.runs.filter((r) => r.visible).forEach((r) => r.times.forEach((t, j) => rows.push([r.name, t, ...shown.map((s) => r.series[s.id]?.[j] ?? ""), ...params.map((id) => r.params[id] ?? "")])));
    const q = (v: string | number) => (typeof v === "string" && /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : String(v));
    download(`${modelKey}-runs.csv`, [head, ...rows].map((r) => r.map(q).join(",")).join("\n"), "text/csv");
  };

  // the chart as a picture, on its own paper colour so the axis text stays readable
  const exportPng = (btn: HTMLElement) => {
    const c = btn.closest("[data-runs-host]")?.querySelector("canvas");
    if (!c) return;
    const out = document.createElement("canvas");
    out.width = c.width;
    out.height = c.height;
    const g = out.getContext("2d")!;
    g.fillStyle = `hsl(${getComputedStyle(c).getPropertyValue("--card")})`;
    g.fillRect(0, 0, out.width, out.height);
    g.drawImage(c, 0, 0);
    out.toBlob((b) => b && download(`${modelKey}-chart.png`, b, "image/png"));
  };

  const exportScenario = () =>
    download(`${modelKey}-scenario.json`, JSON.stringify({ app: "LoopBricks", model: modelKey, version: 1, settings: sim.params, ...shelf }, null, 2), "application/json");

  const importFile = async (f: File) => {
    const text = await f.text();
    if (f.name.endsWith(".json")) {
      try {
        const j = JSON.parse(text);
        if (j.app !== "LoopBricks") throw new Error("not a LoopBricks file");
        if (j.model !== modelKey) return setNote(`That file is for “${j.model}”, not this model. Open that model to import it.`);
        const runs = [...shelf.runs, ...(j.runs ?? []).map((r: SavedRun) => ({ ...r, id: newId() }))].slice(0, MAX_RUNS);
        update({ runs, refs: [...shelf.refs, ...(j.refs ?? []).map((r: RefData) => ({ ...r, id: newId() }))] });
        if (j.settings) sim.applyParams(j.settings);
        setNote(`Imported ${j.runs?.length ?? 0} runs and ${j.refs?.length ?? 0} data sets.`);
      } catch {
        setNote("That file could not be read. Import a scenario saved from LoopBricks, or add data as time,value pairs.");
      }
    } else addRef(f.name.replace(/\.[^.]+$/, ""), shown[0].id, text);
  };

  const addRef = (refName: string, stock: string, text: string) => {
    const points = parsePoints(text);
    if (points.length < 2) return setNote("Add at least two rows of time and value, for example “0, 120” on one line and “5, 180” on the next.");
    update({ ...shelf, refs: [...shelf.refs, { id: newId(), name: refName || "Data", stock, points, visible: true }] });
    setAdding(false);
    setNote(`Added ${points.length} data points. They are drawn as dots; run the model to see the fit.`);
  };

  // fit of the current run to each reference set, read at the data times the run has reached
  const fits = shelf.refs.map((r) => {
    const h = hist.current, i = model.stocks.findIndex((s) => s.id === r.stock);
    const pairs = i < 0 ? [] : r.points.map(([t, v]) => [at(h.times, h.series[i] ?? [], t), v] as const).filter(([s]) => s !== undefined);
    return { r, covered: pairs.length, fit: fitStats(pairs.map((p) => p[0]!), pairs.map((p) => p[1])) };
  });
  void tick;

  const runCalibration = () => {
    const refs = shelf.refs.filter((r) => r.visible);
    if (!refs.length || !calIds.length) return;
    const res = calibrate(model, sim.params, calIds, refs);
    sim.applyParams(res.params);
    sim.setStopTime(Math.ceil(Math.max(...refs.flatMap((r) => r.points.map((p) => p[0])))));
    sim.reset();
    sim.play();
    const changed = calIds.map((id) => `${model.params.find((p) => p.id === id)!.label} ${f2(sim.params[id])} → ${f2(res.params[id])}`).join("; ");
    setNote(`Calibrated in ${res.evals} runs. Error fell from ${f2(res.before)} to ${f2(res.after)}. ${changed}. A good fit is not proof the structure is right.`);
  };

  return (
    <section className="sheet print:hidden" aria-label="Runs and data">
      <div className="sheet-head">
        <h2 className="heading text-[19px]">Runs and data</h2>
        <span className="text-[13px] text-muted-foreground">Kept in this browser only. Export to keep or share.</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <label className="flex-1 min-w-[180px]">
          <span className="sr-only">Name this run</span>
          <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} placeholder={`Name this run (Run ${shelf.runs.length + 1})`} className={cn(field, "w-full")} />
        </label>
        <Button size="sm" onClick={save}>
          Save run
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setAdding((a) => !a)} aria-expanded={adding}>
          Add data
        </Button>
      </div>

      {adding && <AddData stocks={shown.map((s) => ({ id: s.id, label: s.label }))} onAdd={addRef} onCancel={() => setAdding(false)} />}

      {note && (
        <p role="status" className="mt-3 text-[13px] leading-[1.5] text-foreground/80">
          {note}
        </p>
      )}

      {shelf.runs.length > 0 && (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {shelf.runs.map((r, k) => (
            <li key={r.id} className="flex items-center gap-2 py-1.5">
              <svg width="26" height="8" aria-hidden className="shrink-0 text-foreground">
                <line x1="0" y1="4" x2="26" y2="4" stroke="currentColor" strokeWidth="2" strokeDasharray={RUN_DASH[k % RUN_DASH.length].join(" ")} />
              </svg>
              <input
                defaultValue={r.name}
                aria-label="Run name"
                onBlur={(e) => e.target.value.trim() && e.target.value !== r.name && patchRun(r.id, { name: e.target.value.trim() })}
                className="flex-1 min-w-0 bg-transparent text-[13.5px] font-semibold rounded-[5px] px-1 hover:bg-muted focus:bg-card focus:outline-none"
                title={model.params.map((p) => `${p.label}: ${r.params[p.id]}${p.unit}`).join("\n")}
              />
              <button className={iconBtn} onClick={() => patchRun(r.id, { visible: !r.visible })} aria-label={r.visible ? "Hide from chart" : "Show on chart"} title={r.visible ? "Hide from chart" : "Show on chart"}>
                {r.visible ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button
                className={iconBtn}
                onClick={() => {
                  sim.applyParams(r.params);
                  sim.reset();
                  setNote(`Settings of “${r.name}” loaded. Press play to run them again.`);
                }}
                aria-label="Use these settings"
                title="Use these settings"
              >
                <Sliders size={15} />
              </button>
              <button className={iconBtn} onClick={() => update({ ...shelf, runs: shelf.runs.filter((x) => x.id !== r.id) })} aria-label={`Delete ${r.name}`} title="Delete">
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {fits.length > 0 && (
        <div className="mt-5">
          <h3 className="heading text-[15px]">Fit to data</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-[12.5px] tabular-nums">
              <thead className="text-muted-foreground">
                <tr className="text-left">
                  <th className="font-semibold py-1 pr-3">Data</th>
                  <th className="font-semibold py-1 px-2" title="Root mean square error, in the stock's units">RMSE</th>
                  <th className="font-semibold py-1 px-2" title="Mean absolute percentage error">MAPE</th>
                  <th className="font-semibold py-1 px-2" title="Squared correlation between run and data">R²</th>
                  <th className="font-semibold py-1 px-2" title="Theil: share of the squared error due to bias, unequal variation, unequal covariation">Um / Us / Uc</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {fits.map(({ r, covered, fit }) => (
                  <tr key={r.id} className="border-t border-border align-top">
                    <td className="py-1.5 pr-3">
                      <span className="inline-flex items-center gap-1.5 font-semibold">
                        <i className="inline-block w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: model.stocks.find((s) => s.id === r.stock)?.color }} />
                        {r.name}
                      </span>
                      <span className="block text-muted-foreground">
                        {model.stocks.find((s) => s.id === r.stock)?.label}, {covered} of {r.points.length} points reached
                      </span>
                      {fit && <span className="block text-foreground/75 max-w-[46ch] mt-0.5">{diagnose(fit)}</span>}
                    </td>
                    <td className="py-1.5 px-2">{fit ? f2(fit.rmse) : "-"}</td>
                    <td className="py-1.5 px-2">{fit?.mape != null ? `${(fit.mape * 100).toFixed(1)}%` : "-"}</td>
                    <td className="py-1.5 px-2">{fit ? fit.r2.toFixed(2) : "-"}</td>
                    <td className="py-1.5 px-2 whitespace-nowrap">{fit ? `${fit.um.toFixed(2)} / ${fit.us.toFixed(2)} / ${fit.uc.toFixed(2)}` : "run the model"}</td>
                    <td className="py-1.5 text-right whitespace-nowrap">
                      <button className={iconBtn} onClick={() => patchRef(r.id, { visible: !r.visible })} aria-label={r.visible ? "Hide data" : "Show data"}>
                        {r.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button className={iconBtn} onClick={() => update({ ...shelf, refs: shelf.refs.filter((x) => x.id !== r.id) })} aria-label={`Delete ${r.name}`}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-[8px] bg-background p-3">
            <p className="text-[13px] font-semibold">Calibrate: let the computer tune sliders to fit the visible data</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              It runs the model many times, changing the ticked sliders to make the error as small as possible.{" "}
              <a href="#/methods/calibration" className="tlink font-semibold text-foreground">
                How calibration works
              </a>
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px]">
              {model.params.map((p) => (
                <label key={p.id} className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calIds.includes(p.id)}
                    onChange={(e) => setCalIds((ids) => (e.target.checked ? [...ids, p.id] : ids.filter((x) => x !== p.id)))}
                    className="w-4 h-4 accent-[hsl(var(--foreground))]"
                  />
                  {p.label}
                </label>
              ))}
            </div>
            <Button size="sm" className="mt-3" onClick={runCalibration} disabled={!calIds.length || !shelf.refs.some((r) => r.visible)}>
              <Wand2 size={15} aria-hidden /> Calibrate {calIds.length ? `${calIds.length} setting${calIds.length > 1 ? "s" : ""}` : ""}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2" data-export>
        <span className="text-[13px] text-muted-foreground mr-1">Export</span>
        <Button size="sm" variant="secondary" onClick={exportCsv}>
          <Download size={14} aria-hidden /> Data (CSV)
        </Button>
        <Button size="sm" variant="secondary" onClick={(e) => exportPng(e.currentTarget)}>
          <Download size={14} aria-hidden /> Chart (PNG)
        </Button>
        <Button size="sm" variant="secondary" onClick={exportScenario}>
          <Download size={14} aria-hidden /> Scenario file
        </Button>
        <Button size="sm" variant="ghost" onClick={() => file.current?.click()}>
          <FileUp size={14} aria-hidden /> Import
        </Button>
        <input
          ref={file}
          type="file"
          accept=".json,.csv,.txt"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </section>
  );
}

function AddData({ stocks, onAdd, onCancel }: { stocks: { id: string; label: string }[]; onAdd: (name: string, stock: string, text: string) => void; onCancel: () => void }) {
  const [n, setN] = useState("");
  const [stock, setStock] = useState(stocks[0]?.id ?? "");
  const [text, setText] = useState("");
  return (
    <div className="mt-3 rounded-[8px] bg-background p-3 grid gap-2.5">
      <p className="text-[13px] leading-[1.5] text-foreground/80">
        Paste observed data or a hypothesised reference mode as <b>time, value</b> pairs, one per line, in the model's time unit. You can also import a CSV file with the Import button.
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        <label className="grid gap-1 text-[12.5px] font-semibold">
          Name
          <input value={n} onChange={(e) => setN(e.target.value)} placeholder="Observed 2010-2020" className={field} />
        </label>
        <label className="grid gap-1 text-[12.5px] font-semibold">
          Which stock it describes
          <select value={stock} onChange={(e) => setStock(e.target.value)} className={field}>
            {stocks.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="grid gap-1 text-[12.5px] font-semibold">
        Data
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder={"0, 120\n5, 180\n10, 260"} className={cn(field, "h-auto py-2 font-mono")} />
      </label>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onAdd(n.trim(), stock, text)}>
          Add data
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

