import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { MODELS } from "@/data/molecules";
import { PRESETS } from "@/data/presets";
import { DT, freshState, initParams, stepOnce } from "@/sim/engine";

const KEY = "stockmgmt";
const T = 60; // weeks: long enough to see the overshoot ring down
const EVERY = 5; // sample every 0.5 wk
const PLAY_MS = 3500;
const W = 560, H = 200;

// One whole run of the real Stock Management molecule, sampled for the chart.
function run(slw: number) {
  const m = MODELS[KEY];
  // the "ignores it" preset, with only the supply-line weight taken from the slider
  const p = { ...initParams(m), ...PRESETS[KEY][1].params, slw };
  let s = freshState(m, p);
  const inv = [s.inv], sl = [s.sl];
  for (let i = 1; i <= Math.round(T / DT); i++) {
    s = stepOnce(m, s, p, DT).state;
    if (i % EVERY === 0) (inv.push(s.inv), sl.push(s.sl));
  }
  return { inv, sl };
}

const path = (ys: number[], n: number, top: number) =>
  ys
    .slice(0, Math.max(2, n))
    .map((y, i) => `${i ? "L" : "M"}${((i / (ys.length - 1)) * W).toFixed(1)} ${(H - (y / top) * H).toFixed(1)}`)
    .join(" ");

// The hero: a working molecule with one control, so the first thing a visitor does is change a model.
export default function HomeDemo() {
  const [slw, setSlw] = useState(0);
  const data = useMemo(() => run(slw), [slw]);
  const total = data.inv.length;
  const [shown, setShown] = useState(total); // how many samples are drawn; all of them unless playing
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const stop = () => (cancelAnimationFrame(raf.current), setPlaying(false));
  const play = () => {
    if (playing) return (stop(), setShown(total));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setShown(total); // no animation: draw the run at once
    const t0 = performance.now();
    setPlaying(true);
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / PLAY_MS);
      setShown(Math.max(2, Math.round(k * total)));
      if (k < 1) raf.current = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const peak = Math.max(...data.inv);
  const top = Math.ceil(Math.max(peak, ...data.sl) / 25) * 25;
  const desInv = PRESETS[KEY][1].params.desInv;
  const label = `Inventory starts at ${Math.round(data.inv[0])} units, peaks at ${Math.round(peak)} units against a target of ${desInv} units, and ends at ${Math.round(data.inv[total - 1])} units after ${T} weeks.`;

  return (
    <figure className="min-w-0 bg-card border border-border rounded-[var(--radius)] overflow-hidden">
      <div className="px-4 md:px-5 pt-4 pb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="heading text-[19px]">
          <a href={`#/m/${KEY}`} className="hover:underline underline-offset-4">
            {MODELS[KEY].name}
          </a>
        </h2>
        <span className="flex items-center text-[13px] text-muted-foreground">
          <span className="chip chipB">B1</span>
          <span className="chip chipB">B2</span>
          two balancing loops
        </span>
      </div>
      <svg viewBox={`-40 -10 ${W + 50} ${H + 34}`} width="100%" role="img" aria-label={label} className="block px-2 md:px-3">
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="hsl(var(--muted))" strokeWidth={1} />
        ))}
        <line x1={0} x2={W} y1={H - (desInv / top) * H} y2={H - (desInv / top) * H} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4 4" />
        <g className="fill-muted-foreground" fontSize={14} style={{ fontFamily: "var(--font-mono)" }}>
          <text x={-8} y={4} textAnchor="end">{top}</text>
          <text x={-8} y={H - (desInv / top) * H + 4} textAnchor="end">{desInv}</text>
          <text x={-8} y={H + 4} textAnchor="end">0</text>
          <text x={0} y={H + 20}>0</text>
          <text x={W} y={H + 20} textAnchor="end">{T} wk</text>
        </g>
        <path d={path(data.sl, shown, top)} fill="none" stroke="var(--viz-acc2)" strokeWidth={2.5} strokeLinejoin="round" />
        <path d={path(data.inv, shown, top)} fill="none" stroke="var(--viz-acc)" strokeWidth={2.5} strokeLinejoin="round" />
      </svg>
      <div className="px-4 md:px-5 pb-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-4 h-[3px] bg-[var(--viz-acc)]" aria-hidden />Inventory (units)</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-[3px] bg-[var(--viz-acc2)]" aria-hidden />Supply line (units)</span>
        <span className="flex items-center gap-1.5"><span className="w-4 border-t border-dashed border-muted-foreground" aria-hidden />Target</span>
      </div>
      <div className="bg-panel text-white px-4 md:px-5 py-3.5 flex flex-wrap items-center gap-4">
        <label className="flex-[1_1_220px] grid gap-1.5 text-[14px] font-medium">
          <span className="flex justify-between gap-3">
            Weight on the supply line <output className="font-mono text-[13px]">{slw.toFixed(1)}</output>
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={slw}
            onChange={(e) => (stop(), setSlw(+e.target.value), setShown(total))}
            className="w-full h-11 sm:h-6 accent-[hsl(var(--accent))]"
          />
        </label>
        <button type="button" onClick={play} className="brick brick-y h-11 px-[18px] inline-flex items-center gap-2 text-[14px] font-semibold">
          {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
          {playing ? "Stop" : "Play"}
        </button>
      </div>
      <figcaption className="px-4 md:px-5 pt-3 pb-4 text-[13px] leading-[1.5] text-muted-foreground">
        Ignore the supply line and inventory overshoots. Raise the weight to 1 and the swing dies away.
      </figcaption>
    </figure>
  );
}
