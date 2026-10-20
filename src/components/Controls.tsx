import { useEffect, useRef } from "react";
import { Pause, Play, RotateCcw, SkipForward, Zap } from "lucide-react";
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

export default function Controls({ model, sim, presets }: { model: Model; sim: Sim; presets: Preset[] }) {
  const row = "flex justify-between items-baseline text-sm mb-2";
  const val = "text-[13px] font-bold";
  const key = "px-1.5 py-0.5 rounded-[5px] bg-white/10 text-[11px] font-semibold text-white";
  // the control box: the one dark surface, so it reads as the thing you operate
  return (
    <div className="rounded-card bg-panel text-white p-5 shadow-[0_3px_0_hsl(216_52%_8%)]">
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
              className="text-xs font-semibold px-2.5 py-1.5 rounded-[7px] bg-white/10 hover:bg-accent hover:text-accent-foreground transition-colors"
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
          <Slider aria-label={pr.label} min={pr.min} max={pr.max} step={pr.step} value={[sim.params[pr.id]]} onValueChange={([v]) => sim.setParam(pr.id, v)} />
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
        <Slider aria-label="Speed" min={1} max={20} step={1} value={[sim.speed]} onValueChange={([v]) => sim.setSpeed(v)} />
      </div>

      <div className="mt-4">
        <div className={row}>
          <span>Stop at</span>
          <span className={val}>{sim.stopTime === 0 ? "Never" : `${sim.stopTime} ${model.timeUnit}`}</span>
        </div>
        <Slider aria-label="Stop at" min={0} max={Math.max(60, sim.stopTime)} step={1} value={[sim.stopTime]} onValueChange={([v]) => sim.setStopTime(v)} />
      </div>

      <Readout model={model} subscribe={sim.subscribe} />

      <p className="mt-4 text-xs leading-[1.9] text-white/65">
        <kbd className={key}>Space</kbd> play, <kbd className={key}>P</kbd> burst, <kbd className={key}>S</kbd> step, <kbd className={key}>R</kbd> reset
      </p>
    </div>
  );
}
