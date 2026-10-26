import { useEffect, useRef, useState } from "react";
import { BookmarkPlus, ChevronUp, Pause, Play, RotateCcw, SkipForward, Zap } from "lucide-react";
import type { Model } from "@/data/molecules";
import type { Preset } from "@/data/presets";
import type { FrameCb } from "@/hooks/useSimulation";
import type { History, Vars } from "@/sim/engine";
import { keepRun } from "@/components/RunsPanel";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type Sim = {
  params: Vars;
  setParam: (id: string, v: number) => void;
  applyParams: (obj: Vars) => void;
  pulse: () => void;
  running: boolean;
  toggle: () => void;
  reset: () => void;
  step: () => void;
  speed: number;
  setSpeed: (n: number) => void;
  stopTime: number;
  setStopTime: (n: number) => void;
  subscribe: (fn: FrameCb) => () => void;
};

// Live numbers from the run itself: the clock, and for each stock its value now and the highest and lowest it has
// reached in this run. Updated straight from the simulation frames, so they never re-render React while a run plays.
function Readout({ model, subscribe }: { model: Model; subscribe: (fn: FrameCb) => () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const shown = model.stocks.filter((st) => !st.hidden);
  useEffect(() => {
    // the history object is replaced on reset, so a new one starts the extremes again
    let seen: History | null = null, upto = 0;
    let hi: number[] = [], lo: number[] = [];
    return subscribe(({ state, t, history }) => {
      const el = root.current;
      if (!el) return;
      const set = (sel: string, text: string) => {
        const n = el.querySelector(sel);
        if (n) n.textContent = text;
      };
      set("[data-t]", `${t.toFixed(1)} ${model.timeUnit}`);
      if (history !== seen) (seen = history), (upto = 0), (hi = model.stocks.map(() => -Infinity)), (lo = model.stocks.map(() => Infinity));
      const n = history.times.length;
      model.stocks.forEach((st, i) => {
        const ys = history.series[i] ?? [];
        for (let j = upto; j < ys.length; j++) (hi[i] = Math.max(hi[i], ys[j])), (lo[i] = Math.min(lo[i], ys[j]));
        set(`[data-s="${st.id}"]`, fmt(state[st.id]));
        set(`[data-hi="${st.id}"]`, n > 1 ? fmt(hi[i]) : "-");
        set(`[data-lo="${st.id}"]`, n > 1 ? fmt(lo[i]) : "-");
      });
      upto = n;
    });
  }, [model, subscribe]);
  const th = "font-normal text-white/70 text-right pl-3";
  const td = "font-semibold tabular-nums text-right pl-3 py-0.5";
  return (
    <div ref={root} className="mt-5 border-t border-white/20 pt-3 text-[13.5px]">
      <p className="flex justify-between">
        <span className="text-white/70">Time</span>
        <span className="font-semibold tabular-nums" data-t>
          0.0 {model.timeUnit}
        </span>
      </p>
      <table className="mt-2 w-full">
        <caption className="sr-only">Stocks in this run</caption>
        <thead>
          <tr>
            <th scope="col" className="sr-only">Stock</th>
            <th scope="col" className={th}>Now</th>
            <th scope="col" className={th}>Highest</th>
            <th scope="col" className={th}>Lowest</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((st) => (
            <tr key={st.id}>
              <th scope="row" className="text-left font-normal text-white/85 py-0.5">
                <span className="flex items-center gap-2 min-w-0">
                  <i className="inline-block w-3 h-3 shrink-0 rounded-[3px] ring-1 ring-white/60" style={{ background: st.color }} />
                  <span className="[overflow-wrap:anywhere]">{st.label}</span>
                </span>
              </th>
              <td className={td} data-s={st.id}>
                {fmt(st.init)}
              </td>
              <td className={td} data-hi={st.id}>-</td>
              <td className={td} data-lo={st.id}>-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const fmt = (v: number) => (Number.isFinite(v) ? (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString("en-GB") : v.toFixed(1)) : "-");
// a setting with its unit: "20/wk", "6 wk", "40%", "$5", or the bare number when it has no unit
const decimals = (step: number) => (String(step).split(".")[1] ?? "").length;
export function withUnit(v: number, unit: string, step = 0.01) {
  const n = Number(v.toFixed(Math.min(4, decimals(step))));
  if (!unit || unit === "dmnl") return String(n);
  if (unit === "$") return `$${n}`;
  return /^[/%]/.test(unit) ? `${n}${unit}` : `${n} ${unit}`;
}

// "/wk" reads as "per week" to a screen reader
const spoken = (v: number, unit = "") =>
  `${v} ${unit.replace(/\bwk\b/g, "week").replace(/\bmo\b/g, "month").replace(/\byr\b/g, "year").replace(/\bppl\b/g, "people").replace(/·/g, " ").replace(/\//g, " per ")}`.replace(/\s+/g, " ").trim();

function Clock({ model, subscribe }: { model: Model; subscribe: (fn: FrameCb) => () => void }) {
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => subscribe(({ t }) => el.current && (el.current.textContent = `${t.toFixed(1)} ${model.timeUnit}`)), [model, subscribe]);
  return <span ref={el} className="tabular-nums text-[13px] font-semibold text-white/80" />;
}

// modelKey (optional): the shelf the "Keep this run" button saves to; without it the button is not shown
export default function Controls({ model, sim, presets, modelKey }: { model: Model; sim: Sim; presets: Preset[]; modelKey?: string }) {
  // on phones the panel sits below the diagrams: once it scrolls away, a slim play bar takes its place
  const panel = useRef<HTMLDivElement>(null);
  const [panelInView, setPanelInView] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setPanelInView(e.isIntersecting));
    if (panel.current) io.observe(panel.current);
    return () => io.disconnect();
  }, []);
  // the run so far, for "Keep this run"
  const hist = useRef<History>({ times: [], series: [] });
  const [kept, setKept] = useState("");
  useEffect(() => sim.subscribe(({ history }) => void (hist.current = history)), [sim.subscribe]);
  useEffect(() => setKept(""), [model]);

  const sub = "text-[13px] font-semibold text-white/80";
  const key = "px-1.5 py-0.5 rounded-[5px] bg-white/10 text-[11px] font-semibold text-white";
  const ghost = "!bg-white/10 !border-white/15 !text-white [--edge-c:hsl(216_52%_8%)]";
  const outline = "inline-flex items-center justify-center gap-2 min-h-11 px-3.5 rounded-btn border border-white/35 text-[14px] font-semibold text-white hover:bg-white/10 hover:border-white/60 transition-colors";
  const isOn = (p: Preset) => Object.entries(p.params).every(([id, v]) => Math.abs((sim.params[id] ?? NaN) - v) < 1e-9);
  // the control box: the one dark surface, so it reads as the thing you operate
  return (
    <div ref={panel} id="controls-panel" tabIndex={-1} aria-label="Controls" role="region" className="focus:outline-none rounded-card bg-panel text-white border border-white/10 p-5 shadow-[0_3px_0_hsl(216_52%_8%)] scroll-mt-24">
      {!panelInView && (
        <div role="toolbar" aria-label="Quick controls" className="lg:hidden print:hidden fixed bottom-0 inset-x-0 z-30 bg-panel text-white px-4 pt-2.5 pb-[max(10px,env(safe-area-inset-bottom))] flex items-center gap-3 shadow-[0_-6px_20px_-8px_hsl(216_52%_8%/0.5)]">
          <Button onClick={sim.toggle} className="min-w-[96px] h-11">
            {sim.running ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
            {sim.running ? "Pause" : "Play"}
          </Button>
          <button onClick={sim.reset} aria-label="Reset" className="grid place-items-center w-11 h-11 rounded-[8px] bg-white/10">
            <RotateCcw size={16} aria-hidden />
          </button>
          <Clock model={model} subscribe={sim.subscribe} />
          <button
            aria-controls="controls-panel"
            onClick={() => {
              panel.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
              panel.current?.focus({ preventScroll: true });
            }}
            className="ml-auto inline-flex items-center gap-1 h-11 px-2 text-[13px] font-semibold text-white/85"
          >
            Controls <ChevronUp size={15} aria-hidden />
          </button>
        </div>
      )}
      <h2 className="heading text-[19px] mb-4">Controls</h2>

      {presets.length > 0 && (
        <div className="mb-5">
          <p id="scenarios-label" className={`${sub} mb-2`}>
            Scenarios
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="scenarios-label">
            {presets.map((p) => {
              const on = isOn(p);
              return (
                <button
                  key={p.label}
                  aria-pressed={on}
                  onClick={() => {
                    sim.applyParams(p.params);
                    sim.reset();
                  }}
                  className={
                    on
                      ? "min-h-11 lg:min-h-10 text-[12.5px] font-semibold px-3 rounded-btn border border-accent-edge bg-accent text-accent-foreground"
                      : "min-h-11 lg:min-h-10 text-[12.5px] font-semibold px-3 rounded-btn border border-white/35 text-white hover:border-white/70 hover:bg-white/10 transition-colors"
                  }
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {model.params.map((pr) => (
        <div key={pr.id} className="mt-4">
          <div className="flex justify-between items-baseline gap-3 text-[14px] mb-2">
            <span>{pr.label}</span>
            <output className="text-[13px] font-semibold tabular-nums whitespace-nowrap">{withUnit(sim.params[pr.id], pr.unit, pr.step)}</output>
          </div>
          <Slider aria-label={pr.label} aria-valuetext={spoken(sim.params[pr.id], pr.unit)} min={pr.min} max={pr.max} step={pr.step} value={[sim.params[pr.id]]} onValueChange={([v]) => sim.setParam(pr.id, v)} />
        </div>
      ))}

      <div className="flex gap-2 mt-6">
        <Button className="flex-1 h-11" onClick={sim.toggle}>
          {sim.running ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
          {sim.running ? "Pause" : "Play"}
        </Button>
        <Button variant="secondary" size="icon" className={`${ghost} h-11 w-11`} onClick={sim.pulse} title="Add a burst (P)" aria-label="Add a burst">
          <Zap size={16} aria-hidden />
        </Button>
        <Button variant="secondary" size="icon" className={`${ghost} h-11 w-11`} onClick={sim.step} title="Step once (S)" aria-label="Step once">
          <SkipForward size={16} aria-hidden />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {modelKey && (
          <button type="button" className={`${outline} flex-1`} onClick={() => setKept(keepRun(modelKey, model, hist.current, sim.params).note)}>
            <BookmarkPlus size={16} aria-hidden /> Keep this run
          </button>
        )}
        <button type="button" className={cn(outline, "border-transparent", !modelKey && "flex-1")} onClick={sim.reset} title="Reset (R). The run you leave stays on the chart as the previous run.">
          <RotateCcw size={16} aria-hidden /> Reset
        </button>
      </div>
      {modelKey && (
        <p role="status" className="mt-2 text-[12.5px] leading-[1.5] text-white/80">
          {kept}
        </p>
      )}

      <Readout model={model} subscribe={sim.subscribe} />

      <details className="mt-5 border-t border-white/20 pt-3 group">
        <summary className={`${sub} cursor-pointer min-h-11 lg:min-h-0 flex items-center select-none`}>Speed and stop time</summary>
        <div className="mt-3">
          <div className="flex justify-between items-baseline text-[14px] mb-2">
            <span>Speed</span>
            <output className="text-[13px] font-semibold">{sim.speed}×</output>
          </div>
          <Slider aria-label="Speed" aria-valuetext={`${sim.speed} times`} min={1} max={20} step={1} value={[sim.speed]} onValueChange={([v]) => sim.setSpeed(v)} />
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-baseline text-[14px] mb-2">
            <span>Stop at</span>
            <output className="text-[13px] font-semibold">{sim.stopTime === 0 ? "Never" : `${sim.stopTime} ${model.timeUnit}`}</output>
          </div>
          <Slider aria-label="Stop at" aria-valuetext={sim.stopTime === 0 ? "Never" : spoken(sim.stopTime, model.timeUnit)} min={0} max={Math.max(60, sim.stopTime)} step={1} value={[sim.stopTime]} onValueChange={([v]) => sim.setStopTime(v)} />
        </div>
      </details>

      <p className="mt-4 text-xs leading-[1.9] text-white/70 max-lg:hidden">
        <kbd className={key}>Space</kbd> play, <kbd className={key}>P</kbd> burst, <kbd className={key}>S</kbd> step, <kbd className={key}>R</kbd> reset
      </p>
    </div>
  );
}
