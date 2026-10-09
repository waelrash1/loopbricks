import { useEffect, useRef } from "react";
import type { Model } from "@/data/molecules";
import type { FrameCb, FrameCtx } from "@/hooks/useSimulation";
import type { History } from "@/sim/engine";

const niceMax = (v: number) => {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return m * p;
};
const cssVar = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const hexA = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16),
    g = parseInt(h.slice(2, 4), 16),
    b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

export default function TimeSeriesChart({
  model,
  subscribe,
}: {
  model: Model;
  subscribe: (fn: FrameCb) => () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    let W = 900,
      H = 240;
    let last: FrameCtx | null = null;

    const draw: FrameCb = (frame) => {
      last = frame;
      const grid = `hsl(${cssVar("--input")} / 0.3)`;
      const axis = `hsl(${cssVar("--input")})`;
      const muted = `hsl(${cssVar("--muted-foreground")})`;
      const paper = `hsl(${cssVar("--card")})`;
      const history: History = frame.history;
      const L = 46,
        R = 14,
        T = 12,
        B = 30;
      const pw = W - L - R,
        ph = H - T - B;
      ctx.clearRect(0, 0, W, H);
      let max = 1e-6;
      history.series.forEach((h) => h.forEach((v) => v > max && (max = v)));
      max = niceMax(max * 1.05);
      const tmax = history.times.length ? history.times[history.times.length - 1] : 10;
      const tmin = history.times.length ? history.times[0] : 0;
      const span = Math.max(tmax - tmin, 1e-6);
      const X = (t: number) => L + ((t - tmin) / span) * pw;
      const Y = (v: number) => T + ph - (v / max) * ph;
      const base = T + ph;

      // grid + y labels
      ctx.font = `11px ${cssVar("--font-sans")}`;
      ctx.textBaseline = "middle";
      for (let i = 0; i <= 4; i++) {
        const v = (max * i) / 4,
          y = Y(v);
        ctx.strokeStyle = grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(L, y);
        ctx.lineTo(W - R, y);
        ctx.stroke();
        ctx.fillStyle = muted;
        ctx.textAlign = "right";
        ctx.fillText(v.toFixed(v < 10 ? 1 : 0), L - 6, y);
      }
      // x ticks
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let i = 0; i <= 5; i++) {
        const t = tmin + (span * i) / 5,
          x = X(t);
        ctx.strokeStyle = grid;
        ctx.beginPath();
        ctx.moveTo(x, T);
        ctx.lineTo(x, base);
        ctx.stroke();
        ctx.fillStyle = muted;
        ctx.fillText(t.toFixed(span < 5 ? 1 : 0), x, base + 6);
      }
      // axis titles
      ctx.fillStyle = muted;
      ctx.textAlign = "center";
      ctx.fillText("Time (" + model.timeUnit + ")", L + pw / 2, H - 12);
      ctx.save();
      ctx.translate(13, T + ph / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textBaseline = "middle";
      ctx.fillText(model.unitY, 0, 0);
      ctx.restore();
      // axes
      ctx.strokeStyle = axis;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(L, T);
      ctx.lineTo(L, base);
      ctx.lineTo(W - R, base);
      ctx.stroke();

      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      history.series.forEach((h, i) => {
        if (h.length < 2 || model.stocks[i].hidden || model.stocks[i].chartHidden) return;
        const color = model.stocks[i].color;
        const lastX = X(history.times[h.length - 1]);
        const lastY = Y(h[h.length - 1]);
        // area fill
        const grad = ctx.createLinearGradient(0, T, 0, base);
        grad.addColorStop(0, hexA(color, 0.16));
        grad.addColorStop(1, hexA(color, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(X(history.times[0]), base);
        h.forEach((v, j) => ctx.lineTo(X(history.times[j]), Y(v)));
        ctx.lineTo(lastX, base);
        ctx.closePath();
        ctx.fill();
        // line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        h.forEach((v, j) => {
          const x = X(history.times[j]),
            y = Y(v);
          j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.stroke();
        // leading dot, ringed in white so it reads over other series
        ctx.fillStyle = color;
        ctx.strokeStyle = paper;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    };
    // keep the bitmap matched to the CSS box × device pixel ratio so text stays crisp and undistorted
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      W = c.clientWidth;
      H = c.clientHeight;
      c.width = W * dpr;
      c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (last) draw(last);
    });
    ro.observe(c);
    const themeWatch = new MutationObserver(() => last && draw(last));
    themeWatch.observe(document.documentElement, { attributeFilter: ["data-theme"] });
    const unsubscribe = subscribe(draw);
    return () => {
      ro.disconnect();
      themeWatch.disconnect();
      unsubscribe();
    };
  }, [model, subscribe]);

  return (
    <>
      <div className="flex gap-4 flex-wrap text-[13px] text-muted-foreground mb-3">
        {model.stocks.filter((st) => !st.hidden && !st.chartHidden).map((st) => (
          <span key={st.id} className="inline-flex items-center gap-1.5">
            <i className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: st.color }} />
            {st.label}
          </span>
        ))}
      </div>
      <canvas ref={canvas} role="img" aria-label={`Stock levels over time for ${model.name}`} className="w-full h-[240px] block" />
    </>
  );
}
