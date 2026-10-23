import { useEffect, useRef, useState } from "react";
import { ChevronUp, Pause, Play, RotateCcw, SkipForward, Zap } from "lucide-react";
import type { Model } from "@/data/molecules";
import type { Preset } from "@/data/presets";
import type { FrameCb } from "@/hooks/useSimulation";
import type { Vars } from "@/sim/engine";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

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

function Readout({ model, subscribe }: { model: Model; subscribe: (fn: FrameCb) => () => void }) {
  const root = useRef<HTMLDListElement>(null);
  useEffect(() => {
    return subscribe(({ state, t }) => {
      if (!root.current) return;
      const tEl = root.current.querySelector("[data-t]");
      if (tEl) tEl.textContent = `${t.toFixed(1)} ${model.timeUnit}`;
      model.stocks.forEach((st) => {
        const el = root.current!.querySelector(`[data-s="${st.id}"]`);
        if (el) el.textContent = state[st.id].toFixed(1);
      });
    });
  }, [model, subscribe]);
  return (
    <dl ref={root} className="mt-5 rounded-[7px] bg-white/[0.07] px-3.5 py-3 text-sm">
      <div className="flex justify-between py-0.5">
        <dt className="text-white/65">Time</dt>
        <dd className="font-bold" data-t>0.0 {model.timeUnit}</dd>
      </div>
      {model.stocks.filter((st) => !st.hidden).map((st) => (
        <div key={st.id} className="flex justify-between gap-3 py-0.5">
          <dt className="flex items-center gap-2 text-white/65">
            <i className="inline-block w-3 h-3 rounded-[3px] ring-1 ring-white/60" style={{ background: st.color }} />
            {st.label}
          </dt>
          <dd className="font-bold" data-s={st.id}>
            {st.init.toFixed(1)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// "/wk" reads as "per week" to a screen reader
const spoken = (v: number, unit = "") =>
  `${v} ${unit.replace(/\bwk\b/g, "week").replace(/\bmo\b/g, "month").replace(/\byr\b/g, "year").replace(/\bppl\b/g, "people").replace(/·/g, " ").replace(/\//g, " per ")}`.replace(/\s+/g, " ").trim();

function Clock({ model, subscribe }: { model: Model; subscribe: (fn: FrameCb) => () => void }) {
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => subscribe(({ t }) => el.current && (el.current.textContent = `${t.toFixed(1)} ${model.timeUnit}`)), [model, subscribe]);
  return <span ref={el} className="tabular-nums text-[13px] font-semibold text-white/80" />;
}

export default function Controls({ model, sim, presets }: { model: Model; sim: Sim; presets: Preset[] }) {
  // on phones the panel sits below the diagrams: once it scrolls away, a slim play bar takes its place
  const panel = useRef<HTMLDivElement>(null);
  const [panelInView, setPanelInView] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setPanelInView(e.isIntersecting));
    if (panel.current) io.observe(panel.current);
    return () => io.disconnect();
  }, []);
  const row = "flex justify-between items-baseline text-sm mb-2";
  const val = "text-[13px] font-bold";
  const key = "px-1.5 py-0.5 rounded-[5px] bg-white/10 text-[11px] font-semibold text-white";
  // the control box: the one dark surface, so it reads as the thing you operate
  return (
    <div ref={panel} id="controls-panel" tabIndex={-1} aria-label="Controls" role="region" className="focus:outline-none rounded-card bg-panel text-white p-5 shadow-[0_3px_0_hsl(216_52%_8%)] scroll-mt-24">
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
        <div className="flex flex-wrap gap-1.5 mb-5" role="group" aria-label="Scenarios">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                sim.applyParams(p.params);
                sim.reset();
              }}
              className="min-h-11 lg:min-h-0 text-xs font-semibold px-2.5 py-1.5 rounded-[7px] bg-white/10 hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {model.params.map((pr) => (
        <div key={pr.id} className="mt-4">
          <div className={row}>
            <span>{pr.label}</span>
            <span className={val}>
              {sim.params[pr.id]}
              {pr.unit}
            </span>
          </div>
          <Slider aria-label={pr.label} aria-valuetext={spoken(sim.params[pr.id], pr.unit)} min={pr.min} max={pr.max} step={pr.step} value={[sim.params[pr.id]]} onValueChange={([v]) => sim.setParam(pr.id, v)} />
        </div>
      ))}

      <div className="flex gap-2 mt-6">
        <Button className="flex-1" onClick={sim.toggle}>
          {sim.running ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
          {sim.running ? "Pause" : "Play"}
        </Button>
        <Button variant="secondary" size="icon" className="!bg-white/10 !border-white/15 !text-white [--edge-c:hsl(216_52%_8%)]" onClick={sim.pulse} title="Add a burst (P)" aria-label="Add a burst">
          <Zap size={16} aria-hidden />
        </Button>
        <Button variant="secondary" size="icon" className="!bg-white/10 !border-white/15 !text-white [--edge-c:hsl(216_52%_8%)]" onClick={sim.step} title="Step once (S)" aria-label="Step once">
          <SkipForward size={16} aria-hidden />
        </Button>
        <Button variant="secondary" size="icon" className="!bg-white/10 !border-white/15 !text-white [--edge-c:hsl(216_52%_8%)]" onClick={sim.reset} title="Reset (R)" aria-label="Reset">
          <RotateCcw size={16} aria-hidden />
        </Button>
      </div>

      <div className="mt-6">
        <div className={row}>
          <span>Speed</span>
          <span className={val}>{sim.speed}×</span>
        </div>
        <Slider aria-label="Speed" aria-valuetext={`${sim.speed} times`} min={1} max={20} step={1} value={[sim.speed]} onValueChange={([v]) => sim.setSpeed(v)} />
      </div>

      <div className="mt-4">
        <div className={row}>
          <span>Stop at</span>
          <span className={val}>{sim.stopTime === 0 ? "Never" : `${sim.stopTime} ${model.timeUnit}`}</span>
        </div>
        <Slider aria-label="Stop at" aria-valuetext={sim.stopTime === 0 ? "Never" : spoken(sim.stopTime, model.timeUnit)} min={0} max={Math.max(60, sim.stopTime)} step={1} value={[sim.stopTime]} onValueChange={([v]) => sim.setStopTime(v)} />
      </div>

      <Readout model={model} subscribe={sim.subscribe} />

      <p className="mt-4 text-xs leading-[1.9] text-white/65">
        <kbd className={key}>Space</kbd> play, <kbd className={key}>P</kbd> burst, <kbd className={key}>S</kbd> step, <kbd className={key}>R</kbd> reset
      </p>
    </div>
  );
}
