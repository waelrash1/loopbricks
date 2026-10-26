import { useEffect, useRef, useState } from "react";
import type { Model } from "@/data/molecules";
import type { FrameCb, FrameCtx } from "@/hooks/useSimulation";
import type { History } from "@/sim/engine";
import type { Shelf } from "@/lib/runs";

// each saved run gets its own dash, so runs stay apart while colour keeps meaning the stock
export const RUN_DASH = [[7, 4], [2, 3], [12, 3, 2, 3], [1, 5], [9, 2], [5, 2, 1, 2]];

const niceMax = (v: number) => {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  // finer steps than 1-2-5, so a chart rarely wastes more than a fifth of its height
  return ([1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((m) => n <= m) ?? 10) * p;
};
const cssVar = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
// series colours are CSS variables ("var(--viz-acc)") so they follow the theme; a canvas needs the hex behind them
const ink = (c: string) => (c.startsWith("var(") ? cssVar(c.slice(4, -1)) : c);
const hexA = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16),
    g = parseInt(h.slice(2, 4), 16),
    b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

// A run described in words, for screen readers and for anyone who wants the numbers:
// where each stock started, where it is now, and its highest point.
function describe(model: Model, h: History) {
  if (h.times.length < 2) return "Nothing has run yet. Press play to start.";
  const t0 = h.times[0], t1 = h.times[h.times.length - 1];
  const f = (v: number) => (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1));
  const parts = model.stocks.flatMap((st, i) => {
    if (st.hidden || st.chartHidden) return [];
    const ys = h.series[i];
    const a = ys[0], b = ys[ys.length - 1];
    let k = 0;
    ys.forEach((v, j) => v > ys[k] && (k = j));
    const peak = ys[k] > Math.max(a, b) * 1.01 ? `, peaking at ${f(ys[k])} at ${h.times[k].toFixed(1)} ${model.timeUnit}` : "";
    const verb = Math.abs(b - a) < Math.max(1e-6, Math.abs(a) * 0.01) ? "stayed near" : b > a ? "rose from" : "fell from";
    return [`${st.label} ${verb} ${f(a)}${verb === "stayed near" ? "" : ` to ${f(b)}`}${peak}.`];
  });
  return `From ${t0.toFixed(1)} to ${t1.toFixed(1)} ${model.timeUnit}: ${parts.join(" ")}`;
}

function RunAsText({ model, subscribe }: { model: Model; subscribe: (fn: FrameCb) => () => void }) {
  const [open, setOpen] = useState(false);
  const [h, setH] = useState<History | null>(null);
  // refresh at most twice a second while open; closed, it costs nothing
  useEffect(() => {
    if (!open) return;
    let last = 0;
    return subscribe(({ history }) => {
      const now = performance.now();
      if (now - last < 500) return;
      last = now;
      setH({ times: [...history.times], series: history.series.map((x) => [...x]) });
    });
  }, [open, subscribe]);
  const rows = h && h.times.length > 1 ? Array.from({ length: 11 }, (_, i) => Math.round((i / 10) * (h.times.length - 1))) : [];
  const shown = model.stocks.map((st, i) => [st, i] as const).filter(([st]) => !st.hidden && !st.chartHidden);
  return (
    <details className="mt-3 text-[13px]" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="cursor-pointer text-muted-foreground hover:text-foreground font-semibold w-fit">Describe this run in words and numbers</summary>
      {h && (
        <div className="mt-2">
          <p aria-live="polite" className="leading-[1.6] max-w-[75ch]">
            {describe(model, h)}
          </p>
          {rows.length > 0 && (
            <div className="mt-2 overflow-x-auto">
              <table className="text-[12.5px] tabular-nums border-collapse">
                <thead>
                  <tr>
                    <th className="text-left font-semibold pr-4 py-1">Time ({model.timeUnit})</th>
                    {shown.map(([st]) => (
                      <th key={st.id} className="text-right font-semibold px-3 py-1">
                        {st.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((j) => (
                    <tr key={j} className="border-t border-border">
                      <td className="pr-4 py-1">{h.times[j].toFixed(1)}</td>
                      {shown.map(([st, i]) => (
                        <td key={st.id} className="text-right px-3 py-1">
                          {h.series[i][j].toFixed(1)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </details>
  );
}

// The engine holds physical stocks at zero; say so when it happens, since it means an outflow was not protected
function ClipNotice({ model, subscribe }: { model: Model; subscribe: (fn: FrameCb) => () => void }) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => subscribe(({ clipped }) => setIds((prev) => (prev.length === clipped.length ? prev : clipped))), [subscribe]);
  if (!ids.length) return null;
  const names = ids.map((id) => model.stocks.find((s) => s.id === id)?.label || id);
  return (
    <p role="status" className="mt-2 text-[13px] text-muted-foreground">
      <b className="text-foreground">{names.join(", ")}</b> hit zero and {names.length > 1 ? "were" : "was"} held there: an outflow asked for more than the stock held.
    </p>
  );
}

export default function TimeSeriesChart({
  model,
  subscribe,
  height = 240,
  onClearPrevious,
  minimal = false,
  shelf,
}: {
  shelf?: Shelf; // saved runs (dashed) and reference data (dots) drawn under the live run
  minimal?: boolean; // the looping home-page demo: no comparison, no description
  height?: number;
  model: Model;
  subscribe: (fn: FrameCb) => () => void;
  onClearPrevious?: () => void; // shown when there is an earlier run to compare against
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [hasPrevious, setHasPrevious] = useState(false);
  const shelfRef = useRef(shelf);
  const redraw = useRef<() => void>(() => {});
  useEffect(() => {
    shelfRef.current = shelf;
    redraw.current();
  }, [shelf]);

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
      const prev = minimal ? null : frame.previous;
      setHasPrevious(!!prev); // React skips the render when the value is unchanged
      const L = 46,
        R = 14,
        T = 12,
        B = 30;
      const pw = W - L - R,
        ph = H - T - B;
      ctx.clearRect(0, 0, W, H);
      let max = 1e-6;
      history.series.forEach((h) => h.forEach((v) => v > max && (max = v)));
      prev?.series.forEach((h, i) => !model.stocks[i]?.hidden && !model.stocks[i]?.chartHidden && h.forEach((v) => v > max && (max = v)));
      const runs = minimal ? [] : (shelfRef.current?.runs ?? []).map((r, k) => ({ r, dash: RUN_DASH[k % RUN_DASH.length] })).filter(({ r }) => r.visible);
      const refs = minimal ? [] : (shelfRef.current?.refs ?? []).filter((r) => r.visible);
      runs.forEach(({ r }) => Object.values(r.series).forEach((ys) => ys.forEach((v) => v > max && (max = v))));
      refs.forEach((r) => r.points.forEach(([, v]) => v > max && (max = v)));
      max = niceMax(max * 1.05);
      // the axis spans both runs, so the comparison lines up in time
      const ends = [history.times, prev?.times ?? [], ...runs.map(({ r }) => r.times), ...refs.map((r) => r.points.map((p) => p[0]))].filter((t) => t.length);
      const tmax = ends.length ? Math.max(...ends.map((t) => t[t.length - 1])) : 10;
      const tmin = ends.length ? Math.min(...ends.map((t) => t[0])) : 0;
      // before the first step there is one point in time: give the axis a real range and say how to start
      const empty = tmax - tmin < 1e-9;
      const span = empty ? 10 : tmax - tmin;
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
      if (empty && !minimal) {
        ctx.fillStyle = muted;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `13px ${cssVar("--font-sans")}`;
        ctx.fillText("Run the model to draw it here", L + pw / 2, T + ph / 2);
        ctx.font = `11px ${cssVar("--font-sans")}`;
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
      // saved runs: each its own dash pattern, in the stocks' colours
      runs.forEach(({ r, dash }) => {
        model.stocks.forEach((st) => {
          const ys = r.series[st.id];
          if (!ys || st.hidden || st.chartHidden) return;
          ctx.strokeStyle = hexA(ink(st.color), 0.8);
          ctx.lineWidth = 1.8;
          ctx.setLineDash(dash);
          ctx.beginPath();
          ys.forEach((v, j) => (j ? ctx.lineTo(X(r.times[j]), Y(v)) : ctx.moveTo(X(r.times[j]), Y(v))));
          ctx.stroke();
        });
        ctx.setLineDash([]);
      });
      // reference data: hollow dots in the colour of the stock they describe
      refs.forEach((r) => {
        const st = model.stocks.find((x) => x.id === r.stock);
        ctx.strokeStyle = st ? ink(st.color) : muted;
        ctx.fillStyle = paper;
        ctx.lineWidth = 1.8;
        r.points.forEach(([t, v]) => {
          ctx.beginPath();
          ctx.arc(X(t), Y(v), 3.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      });
      // the previous run, dashed and faint, under the current one
      prev?.series.forEach((h, i) => {
        if (h.length < 2 || model.stocks[i]?.hidden || model.stocks[i]?.chartHidden) return;
        ctx.strokeStyle = hexA(ink(model.stocks[i].color), 0.55);
        ctx.lineWidth = 1.6;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        h.forEach((v, j) => (j ? ctx.lineTo(X(prev.times[j]), Y(v)) : ctx.moveTo(X(prev.times[j]), Y(v))));
        ctx.stroke();
        ctx.setLineDash([]);
      });
      history.series.forEach((h, i) => {
        if (h.length < 2 || model.stocks[i].hidden || model.stocks[i].chartHidden) return;
        const color = ink(model.stocks[i].color);
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
        // leading dot, ringed in the paper colour so it reads over other series
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
    redraw.current = () => last && draw(last);
    // the theme lives in CSS, so repaint when it changes: a pick in the footer or the system setting
    const repaint = () => redraw.current();
    const mo = new MutationObserver(repaint);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", repaint);
    const unsubscribe = subscribe(draw);
    return () => {
      ro.disconnect();
      mo.disconnect();
      mq.removeEventListener("change", repaint);
      unsubscribe();
    };
  }, [model, subscribe, minimal]);

  return (
    <>
      <div className="flex gap-4 flex-wrap text-[13px] text-muted-foreground mb-3">
        {model.stocks.filter((st) => !st.hidden && !st.chartHidden).map((st) => (
          <span key={st.id} className="inline-flex items-center gap-1.5">
            <i className="inline-block w-3 h-[3px]" style={{ background: st.color }} />
            {st.label}
          </span>
        ))}
        {!minimal &&
          shelf?.runs.map(
            (r, k) =>
              r.visible && (
                <span key={r.id} className="inline-flex items-center gap-1.5">
                  <svg width="22" height="6" aria-hidden>
                    <line x1="0" y1="3" x2="22" y2="3" stroke="currentColor" strokeWidth="2" strokeDasharray={RUN_DASH[k % RUN_DASH.length].join(" ")} />
                  </svg>
                  {r.name}
                </span>
              )
          )}
        {!minimal &&
          shelf?.refs.map(
            (r) =>
              r.visible && (
                <span key={r.id} className="inline-flex items-center gap-1.5">
                  <i className="inline-block w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: model.stocks.find((x) => x.id === r.stock)?.color }} />
                  {r.name}
                </span>
              )
          )}
        {hasPrevious && (
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block w-4 border-t-2 border-dashed border-muted-foreground" />
            Previous run
            {onClearPrevious && (
              <button onClick={onClearPrevious} className="tlink font-semibold text-foreground ml-1">
                Clear
              </button>
            )}
          </span>
        )}
      </div>
      <canvas ref={canvas} role="img" aria-label={`Stock levels over time for ${model.name}. A description in words follows.`} className="w-full block" style={{ height }} />
      {!minimal && <ClipNotice model={model} subscribe={subscribe} />}
      {!minimal && <RunAsText model={model} subscribe={subscribe} />}
    </>
  );
}
