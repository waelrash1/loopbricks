import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Pause, Play, RotateCcw, SkipForward, Zap } from "lucide-react";
import type { Model } from "@/data/molecules";
import type { Preset } from "@/data/presets";
import type { useSimulation } from "@/hooks/useSimulation";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type Sim = ReturnType<typeof useSimulation>;

const UNIT_WORD: Record<string, [string, string]> = { wk: ["week", "weeks"], mo: ["month", "months"], yr: ["year", "years"], day: ["day", "days"] };
export const timeSpan = (n: number, unit: string) => {
  const w = UNIT_WORD[unit];
  return w ? `${n} ${n === 1 ? w[0] : w[1]}` : `${n} ${unit}`;
};

// "/wk" reads as "per week" to a screen reader
const spoken = (v: number, unit = "") =>
  `${v} ${unit.replace(/\bwk\b/g, "week").replace(/\bmo\b/g, "month").replace(/\byr\b/g, "year").replace(/\bppl\b/g, "people").replace(/·/g, " ").replace(/\//g, " per ")}`.replace(/\s+/g, " ").trim();

const onPanel = "!bg-white/10 hover:!bg-white/20 text-white";

// The navy control box of a case: scenarios as chips, the model's sliders, one Run button and Reset.
// Speed, stop time, step, burst and the live readout stay available under "More controls".
export default function CaseControls({ model, sim, presets, onRun }: { model: Model; sim: Sim; presets: Preset[]; onRun: () => void }) {
  const panel = useRef<HTMLElement>(null);
  const readout = useRef<HTMLDListElement>(null);
  const [panelInView, setPanelInView] = useState(true);
  // where the current run is: not started, paused part way, or finished at the stop time
  const [phase, setPhase] = useState<"start" | "mid" | "done">("start");
  const stop = sim.stopTime;

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setPanelInView(e.isIntersecting));
    if (panel.current) io.observe(panel.current);
    return () => io.disconnect();
  }, []);

  const { subscribe } = sim;
  useEffect(() => {
    const off = subscribe(({ t, state }) => {
        setPhase(t <= 1e-9 ? "start" : stop > 0 && t >= stop - 1e-9 ? "done" : "mid");
        const root = readout.current;
        if (!root) return;
        const tEl = root.querySelector("[data-t]");
        if (tEl) tEl.textContent = `${t.toFixed(1)} ${model.timeUnit}`;
        model.stocks.forEach((st) => {
          const el = root.querySelector(`[data-s="${st.id}"]`);
          if (el && st.id in state) el.textContent = state[st.id].toFixed(1);
        });
    });
    return () => void off();
  }, [subscribe, model, stop]);

  const run = () => {
    if (sim.running) return sim.toggle();
    if (phase === "mid") return sim.toggle();
    if (phase === "done") sim.reset();
    onRun();
    sim.play();
  };
  const runLabel = sim.running ? "Pause" : phase === "mid" ? "Continue" : stop > 0 ? `Run ${timeSpan(stop, model.timeUnit)}` : "Run";
  const RunIcon = sim.running ? Pause : Play;
  const active = (p: Preset) => Object.entries(p.params).every(([k, v]) => sim.params[k] === v);
  const row = "flex justify-between items-baseline gap-3 text-[14px] font-medium";
  const val = "text-[13px] font-bold tabular-nums whitespace-nowrap";

  return (
    <section
      ref={panel}
      id="controls-panel"
      tabIndex={-1}
      aria-label="Controls"
      className="focus:outline-none rounded-[var(--radius)] bg-panel text-white border border-white/10 p-5 shadow-[0_3px_0_hsl(216_52%_8%)] scroll-mt-24 grid gap-5"
    >
      {!panelInView && (
        <div role="toolbar" aria-label="Quick controls" className="lg:hidden print:hidden fixed bottom-0 inset-x-0 z-30 bg-panel text-white px-4 pt-2.5 pb-[max(10px,env(safe-area-inset-bottom))] flex items-center gap-3 shadow-[0_-6px_20px_-8px_hsl(216_52%_8%/0.5)]">
          <button onClick={run} className="brick brick-y inline-flex items-center justify-center gap-1.5 h-11 px-4 text-[14px] font-semibold">
            <RunIcon size={15} aria-hidden />
            {runLabel}
          </button>
          <button onClick={sim.reset} aria-label="Reset" className={cn("grid place-items-center w-11 h-11 rounded-btn", onPanel)}>
            <RotateCcw size={16} aria-hidden />
          </button>
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

      {presets.length > 0 && (
        <div className="grid gap-2">
          <h2 id="case-scenarios" className="text-[14px] font-semibold">
            Scenarios
          </h2>
          <div role="group" aria-labelledby="case-scenarios" className="flex flex-wrap gap-2">
            {presets.map((p) => {
              const on = active(p);
              return (
                <button
                  key={p.label}
                  aria-pressed={on}
                  onClick={() => {
                    sim.applyParams(p.params);
                    sim.reset();
                  }}
                  className={cn(
                    "min-h-11 lg:min-h-10 px-3 rounded-btn border text-[12.5px] font-semibold text-left transition-colors",
                    on ? "bg-accent text-accent-foreground border-[hsl(var(--accent-edge))]" : "bg-transparent text-white border-white/40 hover:border-white/80"
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {model.params.length > 0 && (
        <div className="grid gap-4">
          {model.params.map((pr) => (
            <div key={pr.id} className="grid gap-2">
              <div className={row}>
                <span>{pr.label}</span>
                <output className={val}>
                  {sim.params[pr.id]}
                  {pr.unit}
                </output>
              </div>
              <Slider aria-label={pr.label} aria-valuetext={spoken(sim.params[pr.id], pr.unit)} min={pr.min} max={pr.max} step={pr.step} value={[sim.params[pr.id]]} onValueChange={([v]) => sim.setParam(pr.id, v)} />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={run} className="brick brick-y inline-flex items-center justify-center gap-2 min-h-11 px-5 text-[14px] font-semibold">
          <RunIcon size={16} aria-hidden />
          {runLabel}
        </button>
        <button onClick={sim.reset} className="inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-btn text-[14px] font-semibold text-white hover:bg-white/10">
          <RotateCcw size={15} aria-hidden /> Reset
        </button>
      </div>

      <details className="group border-t border-white/15 pt-3">
        <summary className="cursor-pointer list-none flex items-center justify-between min-h-11 text-[14px] font-semibold text-white/90">
          More controls
          <ChevronDown size={16} aria-hidden className="transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid gap-4 pt-2">
          <div className="flex gap-2">
            <button onClick={sim.step} className={cn("inline-flex items-center gap-1.5 min-h-11 px-3 rounded-btn text-[13px] font-semibold", onPanel)}>
              <SkipForward size={15} aria-hidden /> Step once
            </button>
            <button onClick={sim.pulse} className={cn("inline-flex items-center gap-1.5 min-h-11 px-3 rounded-btn text-[13px] font-semibold", onPanel)}>
              <Zap size={15} aria-hidden /> Add a burst
            </button>
          </div>
          <div className="grid gap-2">
            <div className={row}>
              <span>Speed</span>
              <span className={val}>{sim.speed}×</span>
            </div>
            <Slider aria-label="Speed" aria-valuetext={`${sim.speed} times`} min={1} max={20} step={1} value={[sim.speed]} onValueChange={([v]) => sim.setSpeed(v)} />
          </div>
          <div className="grid gap-2">
            <div className={row}>
              <span>Stop at</span>
              <span className={val}>{stop === 0 ? "Never" : `${stop} ${model.timeUnit}`}</span>
            </div>
            <Slider aria-label="Stop at" aria-valuetext={stop === 0 ? "Never" : spoken(stop, model.timeUnit)} min={0} max={Math.max(60, stop)} step={1} value={[stop]} onValueChange={([v]) => sim.setStopTime(v)} />
          </div>
          <dl ref={readout} className="rounded-[7px] bg-white/[0.07] px-3.5 py-3 text-sm">
            <div className="flex justify-between py-0.5">
              <dt className="text-white/75">Time</dt>
              <dd className="font-bold tabular-nums" data-t>
                0.0 {model.timeUnit}
              </dd>
            </div>
            {model.stocks
              .filter((st) => !st.hidden)
              .map((st) => (
                <div key={st.id} className="flex justify-between gap-3 py-0.5">
                  <dt className="flex items-center gap-2 text-white/75">
                    <i className="inline-block w-3 h-3 rounded-[3px] ring-1 ring-white/60 shrink-0" style={{ background: st.color }} />
                    {st.label}
                  </dt>
                  <dd className="font-bold tabular-nums" data-s={st.id}>
                    {st.init.toFixed(1)}
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      </details>
    </section>
  );
}
