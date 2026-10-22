import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Play, RotateCcw } from "lucide-react";
import { calibrate } from "@/lib/fit";
import {
  CAL_ADJ,
  CAL_DATA,
  CAL_FIXED,
  CAL_HOLDOUT,
  CAL_MODEL,
  CAL_SLW,
  CAL_TIMES,
  CAL_TRUTH,
  band,
  calFit,
  calGrid,
  calHoldout,
  calRef,
  calRun,
  monteCarlo,
  overshoots,
  policyTest,
} from "@/lib/labs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const INK = "hsl(var(--foreground))", QUIET = "hsl(var(--muted-foreground))", GRID = "hsl(var(--border))";
const BLUE = "var(--viz-acc)", ORANGE = "var(--viz-acc2)", GREEN = "var(--viz-good)";
const f1 = (v: number) => (Math.abs(v) >= 100 || Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1));
const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

// A small line chart in SVG: lines, dots and shaded bands over one time axis.
type Series = { ys: number[]; color: string; dash?: string; width?: number; label?: string };
function Chart({
  times,
  lines = [],
  bands = [],
  dots,
  shadeFrom,
  yLabel,
  xLabel,
  height = 220,
  yMax,
}: {
  times: number[];
  lines?: Series[];
  bands?: { lo: number[]; hi: number[]; color: string; opacity: number }[];
  dots?: { pts: [number, number][]; color: string };
  shadeFrom?: number;
  yLabel: string;
  xLabel: string;
  height?: number;
  yMax?: number;
}) {
  const W = 640, H = height, L = 48, R = 12, T = 10, B = 34;
  const all = [...lines.flatMap((l) => l.ys), ...bands.flatMap((b) => b.hi), ...(dots?.pts.map((p) => p[1]) ?? [])];
  const top = yMax ?? Math.max(1, ...all) * 1.08;
  const t0 = times[0], t1 = times[times.length - 1];
  const X = (t: number) => L + ((t - t0) / (t1 - t0 || 1)) * (W - L - R);
  const Y = (v: number) => T + (1 - v / top) * (H - T - B);
  const path = (ys: number[], ts = times) => ys.map((v, i) => `${i ? "L" : "M"}${X(ts[i]).toFixed(1)} ${Y(v).toFixed(1)}`).join("");
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((q) => top * q);
  const xt = [0, 0.25, 0.5, 0.75, 1].map((q) => t0 + (t1 - t0) * q);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={`${yLabel} over ${xLabel}`}>
      {shadeFrom !== undefined && <rect x={X(shadeFrom)} y={T} width={X(t1) - X(shadeFrom)} height={H - T - B} fill={QUIET} opacity={0.08} />}
      {ticks.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke={GRID} />
          <text x={L - 6} y={Y(v) + 4} textAnchor="end" fontSize="11" fill={QUIET}>
            {f1(v)}
          </text>
        </g>
      ))}
      {xt.map((t) => (
        <text key={t} x={X(t)} y={H - B + 16} textAnchor="middle" fontSize="11" fill={QUIET}>
          {f1(t)}
        </text>
      ))}
      <text x={L + (W - L - R) / 2} y={H - 4} textAnchor="middle" fontSize="11" fill={QUIET}>
        {xLabel}
      </text>
      <text x={12} y={T + (H - T - B) / 2} textAnchor="middle" fontSize="11" fill={QUIET} transform={`rotate(-90 12 ${T + (H - T - B) / 2})`}>
        {yLabel}
      </text>
      {bands.map((b, i) => (
        <path key={i} d={`${path(b.hi)}${b.lo.map((v, j) => `L${X(times[b.lo.length - 1 - j]).toFixed(1)} ${Y(b.lo[b.lo.length - 1 - j]).toFixed(1)}`).join("")}Z`} fill={b.color} opacity={b.opacity} />
      ))}
      {lines.map((l, i) => (
        <path key={i} d={path(l.ys)} fill="none" stroke={l.color} strokeWidth={l.width ?? 2.2} strokeDasharray={l.dash} strokeLinejoin="round" />
      ))}
      {dots?.pts.map(([t, v]) => (
        <circle key={t} cx={X(t)} cy={Y(v)} r={3.6} fill="hsl(var(--card))" stroke={dots.color} strokeWidth={1.8} />
      ))}
    </svg>
  );
}

const Step = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <section className="mt-12 grid md:grid-cols-[40px_minmax(0,1fr)] gap-x-4">
    <span aria-hidden className="display text-[30px] text-accent-edge leading-none">
      {n}
    </span>
    <div className="min-w-0">
      <h2 className="heading text-[22px]">{title}</h2>
      {children}
    </div>
  </section>
);
const Para = ({ children }: { children: React.ReactNode }) => <p className="mt-3 text-[16px] leading-[1.7] max-w-[72ch]">{children}</p>;
const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="rounded-[8px] bg-background px-3 py-2" title={hint}>
    <div className="text-[11.5px] text-muted-foreground">{label}</div>
    <div className="text-[17px] font-bold tabular-nums">{value}</div>
  </div>
);

// ===================================================================================================
// Calibration lab: estimate two decision parameters of a hidden manager from noisy inventory data.
export function CalibrationLab() {
  const [guess, setGuess] = useState({ adj: 9, slw: 0.9 });
  const [trace, setTrace] = useState<{ adj: number; slw: number }[]>([]);
  const [shown, setShown] = useState(0); // how much of the trace has been drawn
  const [searchNote, setSearchNote] = useState("");
  const [holdout, setHoldout] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [wrong, setWrong] = useState(false); // showing the wrong-structure model from step 5
  const grid = useMemo(calGrid, []);
  const wrongFit = useMemo(() => calHoldout(true), []);
  const sim = calRun(guess, wrong);
  const fitAll = calFit(guess, 0, 40, wrong);
  const fitIn = calFit(guess, 0, CAL_HOLDOUT, wrong), fitOut = calFit(guess, CAL_HOLDOUT + 0.01, 40, wrong);
  const timer = useRef<number>();

  // draw the search path a step at a time, so learners can watch it move
  useEffect(() => {
    if (shown >= trace.length) return;
    timer.current = window.setTimeout(() => setShown((s) => s + 1), 70);
    return () => window.clearTimeout(timer.current);
  }, [shown, trace]);

  const search = () => {
    const pts = holdout ? CAL_DATA.filter(([t]) => t <= CAL_HOLDOUT) : CAL_DATA;
    const res = calibrate(CAL_MODEL, { ...CAL_FIXED, ...guess }, ["adj", "slw"], [calRef(pts)]);
    const path = res.trace.map((t) => ({ adj: t.params.adj, slw: t.params.slw }));
    setTrace(path);
    setShown(reduced() ? path.length : 1);
    setWrong(false);
    setGuess({ adj: res.params.adj, slw: res.params.slw });
    setSearchNote(`The search tried ${res.evals} settings, starting from your guess, and settled on adjustment time ${res.params.adj} weeks and weight ${res.params.slw.toFixed(2)}.`);
  };

  // error landscape geometry
  const cw = 22, ch = 14, gx = 54, gy = 8;
  const flat = grid.flat(), lo = Math.log(Math.min(...flat)), hi = Math.log(Math.max(...flat));
  const shade = (v: number) => 1 - (Math.log(v) - lo) / (hi - lo);
  const cx = (adj: number) => gx + ((adj - 1) / 0.5) * cw + cw / 2;
  const cy = (slw: number) => gy + (20 - slw / 0.05) * ch + ch / 2;
  const best = flat.indexOf(Math.min(...flat));
  const bestAdj = CAL_ADJ[Math.floor(best / CAL_SLW.length)], bestSlw = CAL_SLW[best % CAL_SLW.length];

  return (
    <div>
      <Step n={1} title="Look at the data">
        <Para>
          A manager orders stock every week. We have 21 observations of their inventory over 40 weeks, with measurement noise. We know the structure they follow (the
          stock-management rule) and three facts: demand is 10 per week, the target is 100, and deliveries take 6 weeks. Two things we do not know are how they decide: how quickly
          they correct a gap in inventory (the <b>stock adjustment time</b>), and how much of the stock already on order they take into account (the <b>weight on the supply line</b>
          , between 0 and 1).
        </Para>
        <Para>Calibration means finding the values of those two unknowns that make the model reproduce the data.</Para>
      </Step>

      <Step n={2} title="Fit it by hand">
        <Para>Move the two sliders until the line runs through the dots. Watch the error: it is one number summarising how far the line is from all 21 dots.</Para>
        <div className="mt-4 sheet">
          <Chart
            times={CAL_TIMES}
            lines={[{ ys: sim, color: BLUE }]}
            dots={{ pts: CAL_DATA, color: ORANGE }}
            shadeFrom={holdout ? CAL_HOLDOUT : undefined}
            yLabel="Inventory"
            xLabel="Week"
          />
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block w-3 h-[3px]" style={{ background: BLUE }} /> {wrong ? "Wrong-structure model, fitted" : "Model with your guess"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: ORANGE }} /> Observed inventory
            </span>
            {holdout && <span>Shaded weeks are held back from fitting</span>}
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-4">
            {(
              [
                ["adj", "Stock adjustment time", 1, 12, 0.5, "weeks"],
                ["slw", "Weight on the supply line", 0, 1, 0.05, ""],
              ] as const
            ).map(([id, label, min, max, step, unit]) => (
              <div key={id}>
                <div className="flex justify-between text-[14px] mb-2">
                  <span>{label}</span>
                  <b className="tabular-nums">
                    {id === "slw" ? guess.slw.toFixed(2) : guess.adj} {unit}
                  </b>
                </div>
                <Slider aria-label={label} min={min} max={max} step={step} value={[guess[id]]} onValueChange={([v]) => (setWrong(false), setGuess((g) => ({ ...g, [id]: v })))} />
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label="Error (RMSE)" value={f1(fitAll.rmse)} hint="Root mean square error, in units of inventory" />
            <Stat label="Average miss (MAPE)" value={`${((fitAll.mape ?? 0) * 100).toFixed(1)}%`} />
            <Stat label="Bias share (Um)" value={fitAll.um.toFixed(2)} hint="Share of squared error due to the run sitting above or below the data" />
            <Stat label="Timing share (Uc)" value={fitAll.uc.toFixed(2)} hint="Share due to point-by-point differences such as noise" />
          </div>
        </div>
        <Para>
          A good fit leaves only noise: a small error, and most of what remains in the timing share (Uc), since the dots wobble randomly around the true path. The computer does exactly what
          you just did, only systematically.
        </Para>
      </Step>

      <Step n={3} title="See the error landscape">
        <Para>
          Every combination of the two unknowns has an error. Colouring each one gives a map; calibration is a search for its lowest point. The dark outline marks the lowest cell, and the
          navy dot is your current guess.
        </Para>
        <div className="mt-4 sheet overflow-x-auto">
          <svg viewBox={`0 0 ${gx + CAL_ADJ.length * cw + 12} ${gy + CAL_SLW.length * ch + 40}`} className="w-full min-w-[420px] h-auto" role="img" aria-label="Error for every combination of adjustment time and weight on the supply line">
            {grid.map((col, i) =>
              col.map((v, j) => (
                <rect key={`${i}-${j}`} x={gx + i * cw} y={gy + (20 - j) * ch} width={cw} height={ch} fill="hsl(var(--accent))" opacity={0.06 + 0.94 * shade(v) ** 1.3} />
              ))
            )}
            <rect x={cx(bestAdj) - cw / 2} y={cy(bestSlw) - ch / 2} width={cw} height={ch} fill="none" stroke={INK} strokeWidth={2} />
            {trace.slice(0, shown).map((p, k, a) =>
              k ? <line key={k} x1={cx(a[k - 1].adj)} y1={cy(a[k - 1].slw)} x2={cx(p.adj)} y2={cy(p.slw)} stroke={ORANGE} strokeWidth={1.4} opacity={0.8} /> : null
            )}
            {trace.slice(0, shown).map((p, k) => (
              <circle key={`p${k}`} cx={cx(p.adj)} cy={cy(p.slw)} r={2.4} fill={ORANGE} />
            ))}
            <circle cx={cx(guess.adj)} cy={cy(guess.slw)} r={5} fill={INK} stroke="hsl(var(--card))" strokeWidth={1.5} />
            {[0, 0.5, 1].map((w) => (
              <text key={w} x={gx - 6} y={cy(w) + 4} textAnchor="end" fontSize="11" fill={QUIET}>
                {w}
              </text>
            ))}
            {[1, 4, 8, 12].map((a) => (
              <text key={a} x={cx(a)} y={gy + CAL_SLW.length * ch + 14} textAnchor="middle" fontSize="11" fill={QUIET}>
                {a}
              </text>
            ))}
            <text x={gx + (CAL_ADJ.length * cw) / 2} y={gy + CAL_SLW.length * ch + 32} textAnchor="middle" fontSize="11" fill={QUIET}>
              Stock adjustment time (weeks)
            </text>
            <text x={12} y={gy + (CAL_SLW.length * ch) / 2} textAnchor="middle" fontSize="11" fill={QUIET} transform={`rotate(-90 12 ${gy + (CAL_SLW.length * ch) / 2})`}>
              Weight on supply line
            </text>
          </svg>
          <p className="mt-2 text-[13px] text-muted-foreground">Brighter yellow means a smaller error. The scale is logarithmic so the valley floor is visible.</p>
        </div>
        <Para>
          Notice the bright valley runs diagonally: a slower adjustment time with a lower weight fits almost as well as the true pair. When several combinations fit nearly equally well,
          the parameters are poorly <b>identified</b> by the data. Sterman warns that large models are often underidentified, and that judgement grounded in knowledge of the system must
          then choose among them (Sterman 2000, p. 867).
        </Para>
      </Step>

      <Step n={4} title="Let the computer search">
        <Para>
          The app uses the Nelder-Mead method. It keeps a small triangle of guesses on this map, and at every step it replaces the worst corner. It tries a point mirrored through the
          other two, stretches further if that works, and shrinks the triangle if it does not. Each guess is a full simulation compared with the data. The orange path shows every guess.
        </Para>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={search}>
            <Play size={15} aria-hidden /> Search from my guess
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setGuess({ adj: 9, slw: 0.9 });
              setWrong(false);
              setTrace([]);
              setShown(0);
              setSearchNote("");
            }}
          >
            <RotateCcw size={15} aria-hidden /> Start again
          </Button>
          <label className="inline-flex items-center gap-2 text-[14px] cursor-pointer">
            <input type="checkbox" checked={holdout} onChange={(e) => setHoldout(e.target.checked)} className="w-4 h-4 accent-[hsl(var(--foreground))]" />
            Fit only weeks 0 to {CAL_HOLDOUT} (hold the rest back)
          </label>
        </div>
        {searchNote && (
          <p role="status" className="mt-3 text-[15px] leading-[1.6]">
            {searchNote}
          </p>
        )}
        <Para>
          It is a local search: it walks downhill from where it starts. On a landscape with several valleys it can stop in the wrong one, which is why careful modellers start it from
          several places and compare.
        </Para>
      </Step>

      <Step n={5} title="Test on data the fit has not seen">
        <Para>
          Tick the box above and search again. The model is then fitted to the first {CAL_HOLDOUT} weeks only, and the shaded weeks become a test it has not seen.
        </Para>
        <div className="mt-4 grid grid-cols-2 gap-2 max-w-[420px]">
          <Stat label={`Error on weeks 0 to ${CAL_HOLDOUT}`} value={f1(fitIn.rmse)} />
          <Stat label={`Error on weeks ${CAL_HOLDOUT + 2} to 40`} value={f1(fitOut.rmse)} />
        </div>
        <Para>
          With the right structure, both errors stay close to the size of the measurement noise (about 1.7 here): the model has learned the structure, so it carries on fitting. Now try a
          model with the wrong structure. It has the same two unknowns, but its ordering rule applies the weight only to the supply line the manager sees, not to the pipeline they
          want: (desired supply line − weight × supply line) / adjustment time. With any weight below 1 that rule keeps asking for pipeline it never counts.
        </Para>
        <div className="mt-3">
          <Button
            variant="secondary"
            onClick={() => {
              setHoldout(true);
              setTrace([]);
              setShown(0);
              setWrong(true);
              setGuess(wrongFit.guess);
              setSearchNote(
                `Fitted the wrong model to weeks 0 to ${CAL_HOLDOUT}: best adjustment time ${wrongFit.guess.adj} weeks and weight ${wrongFit.guess.slw.toFixed(2)}. Compare the two errors above, and look at the shaded weeks in the chart. Moving a slider switches back to the right structure.`
              );
            }}
          >
            Fit a model with the wrong structure
          </Button>
        </div>
        <Para>
          It fits the early weeks almost as well as the right model (error {f1(wrongFit.inErr)}), but on the held-back weeks its error jumps to {f1(wrongFit.outErr)}: it keeps inventory
          rising past the target to {f1(calRun(wrongFit.guess, true)[CAL_TIMES.length - 1])} by week 40, while the real manager settled near 100. The early rise looked right for the wrong reason. A hold-out test does not prove a structure right, but a large
          jump in error on unseen data is a strong sign it is wrong.
        </Para>
      </Step>

      <Step n={6} title="Compare with the hidden truth">
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => setRevealed(true)} disabled={revealed}>
            <Eye size={15} aria-hidden /> Reveal the hidden values
          </Button>
          {revealed && (
            <p className="text-[15px]">
              The data were made with adjustment time <b>{CAL_TRUTH.adj} weeks</b> and weight <b>{CAL_TRUTH.slw}</b>. Your current estimate is {guess.adj} weeks and{" "}
              {guess.slw.toFixed(2)}.
            </p>
          )}
        </div>
        <Para>
          In real work there is no reveal button. That is why calibration is only one test among many. A fit, however good, cannot show that the structure is right, because many models
          can fit the same data (Sterman 2000, p. 879).
        </Para>
      </Step>

      <div className="mt-12 rounded-card bg-card border-l-4 border-accent px-5 py-4 max-w-[78ch]">
        <p className="heading text-[17px]">What Sterman found with real players</p>
        <p className="mt-2 text-[15.5px] leading-[1.65]">
          Sterman fitted this same stock-management rule to the orders of 44 people playing the beer game (Sterman 1989; 2000, pp. 693-694). The simple rule explained 71% of the variance in
          their orders. On average, players gave the supply line a weight of only 0.34. Only a quarter counted more than half of it. For a third, the weight could not be told apart from
          zero. One factory player had a stock adjustment time of 1.25 weeks and a weight of 0. Correcting gaps that fast while ignoring orders in transit made orders swing wildly. The
          hidden manager in this lab is set close to the players' averages.
        </p>
      </div>
    </div>
  );
}

// ===================================================================================================
// Sensitivity lab: Sterman's three kinds of sensitivity, each shown with a Monte Carlo experiment.
export function SensitivityLab() {
  const [spread, setSpread] = useState(0.5);
  const [runs, setRuns] = useState(200);

  // numerical sensitivity: new-product diffusion with uncertain innovation and imitation
  const diff = useMemo(() => monteCarlo("diffusion", { p: 1, q: 18 }, ["p", "q"], spread, "adopt", 52, runs), [spread, runs]);
  const dys = diff.runs.map((r) => r.ys);
  const base = useMemo(() => monteCarlo("diffusion", { p: 1, q: 18 }, [], 0, "adopt", 52, 1).runs[0].ys, []);

  // behaviour mode sensitivity: stock management with uncertain decision and delay parameters
  const stock = useMemo(() => monteCarlo("stockmgmt", { slw: 0.5, acq: 6, adj: 4 }, ["slw", "acq", "adj"], 1, "inv", 80, runs, 13), [runs]);
  const over = stock.runs.filter((r) => overshoots(r.ys));
  const smooth = stock.runs.filter((r) => !overshoots(r.ys));

  // policy sensitivity: does reacting faster cut the glut? depends on the weight on the supply line
  const policy = useMemo(() => policyTest(runs), [runs]);
  const pct = (x: number) => `${Math.round(x * 100)}%`;

  return (
    <div>
      <div className="sheet mt-2 grid sm:grid-cols-2 gap-x-8 gap-y-4 max-w-[760px]">
        <div>
          <div className="flex justify-between text-[14px] mb-2">
            <span>Uncertainty in each parameter</span>
            <b>±{Math.round(spread * 100)}%</b>
          </div>
          <Slider aria-label="Uncertainty in each parameter" min={0.1} max={1} step={0.05} value={[spread]} onValueChange={([v]) => setSpread(v)} />
        </div>
        <div>
          <div className="flex justify-between text-[14px] mb-2">
            <span>Simulations per experiment</span>
            <b>{runs}</b>
          </div>
          <Slider aria-label="Simulations per experiment" min={50} max={400} step={50} value={[runs]} onValueChange={([v]) => setRuns(v)} />
        </div>
        <p className="sm:col-span-2 text-[13px] text-muted-foreground">
          Each simulation draws every uncertain parameter at random within the range, then runs the model. The uncertainty slider applies to the first experiment; the others vary their
          parameters across most of the sliders' range.
        </p>
      </div>

      <Step n={1} title="Numerical sensitivity: the numbers change, the pattern does not">
        <Para>
          New-product diffusion, with the innovation and imitation rates uncertain by ±{Math.round(spread * 100)}%. The bands show where 50% and 90% of the {runs} runs fall. Every run
          is still an S-curve; only its timing moves. All models show numerical sensitivity, and for most policy questions it matters little (Sterman 2000, p. 883).
        </Para>
        <div className="mt-4 sheet">
          <Chart
            times={diff.times}
            bands={[
              { lo: band(dys, 0.05), hi: band(dys, 0.95), color: BLUE, opacity: 0.14 },
              { lo: band(dys, 0.25), hi: band(dys, 0.75), color: BLUE, opacity: 0.22 },
            ]}
            lines={[{ ys: base, color: BLUE, label: "Base case" }]}
            yLabel="Adopters"
            xLabel="Week"
            yMax={1000}
          />
          <p className="mt-2 text-[13px] text-muted-foreground">
            Line: base case. Dark band: middle 50% of runs. Light band: middle 90%. At week 26 the 90% range runs from {f1(band(dys, 0.05)[30])} to {f1(band(dys, 0.95)[30])} adopters.
          </p>
        </div>
      </Step>

      <Step n={2} title="Behaviour mode sensitivity: the pattern itself changes">
        <Para>
          Stock management, with the weight on the supply line, the delivery delay and the adjustment time all uncertain across most of their range. In {pct(over.length / runs)} of the{" "}
          {runs} runs inventory overshoots its final level; in the rest it settles smoothly. When plausible assumptions change the mode of behaviour, the model needs better evidence
          about those assumptions before it is used (Sterman 2000, p. 883).
        </Para>
        <div className="mt-4 sheet">
          <Chart
            times={stock.times}
            lines={[
              ...smooth.slice(0, 40).map((r) => ({ ys: r.ys, color: GREEN, width: 1, dash: undefined })),
              ...over.slice(0, 40).map((r) => ({ ys: r.ys, color: ORANGE, width: 1 })),
            ]}
            yLabel="Inventory"
            xLabel="Week"
          />
          <p className="mt-2 text-[13px] text-muted-foreground">
            Up to 40 runs of each kind. <span style={{ color: ORANGE }}>Orange</span>: overshoots. <span style={{ color: GREEN }}>Green</span>: settles smoothly.
          </p>
        </div>
      </Step>

      <Step n={3} title="Policy sensitivity: the best policy depends on what you do not know">
        <Para>
          Two policies tested in {policy.n} plausible worlds, with the weight on the supply line and the delivery delay drawn across their ranges. Each is scored by the glut: how far
          inventory rises above its target of 100 at worst. Excess stock ties up money and, for perishable goods, ends up thrown away.
        </Para>
        <div className="mt-4 grid sm:grid-cols-2 gap-4 max-w-[760px]">
          <div className="sheet">
            <p className="heading text-[16px]">React faster to inventory gaps</p>
            <p className="mt-1 text-[14px] text-muted-foreground">Adjustment time 2 weeks instead of 8</p>
            <p className="mt-3 text-[28px] font-bold tabular-nums">{pct(policy.faster)}</p>
            <p className="text-[14px]">of worlds where it helps</p>
            <p className="mt-2 text-[14px] leading-[1.55]">
              It helps in {pct(policy.fasterHi)} of worlds where managers count at least half the supply line, but only {pct(policy.fasterLo)} where they count less.
            </p>
          </div>
          <div className="sheet">
            <p className="heading text-[16px]">Count orders already on the way</p>
            <p className="mt-1 text-[14px] text-muted-foreground">Weight on the supply line 1 instead of 0</p>
            <p className="mt-3 text-[28px] font-bold tabular-nums">{pct(policy.pipeline)}</p>
            <p className="text-[14px]">of worlds where it helps or does no harm</p>
            <p className="mt-2 text-[14px] leading-[1.55]">A robust policy: inventory never overshoots, whatever the delivery delay and the managers' own weight turn out to be.</p>
          </div>
        </div>
        <Para>
          Whether the first policy helps depends on an assumption we are unsure of; the second does not. For most policy work, that difference is what sensitivity analysis is for: behaviour mode
          and especially policy sensitivity are what count (Sterman 2000, pp. 883-884).
        </Para>
        <Para>
          The score is an assumption too. Judged by the average distance from the target over the 80 weeks instead, reacting faster helps in {pct(policy.fasterGap)} of worlds and
          counting orders on the way in only {pct(policy.pipelineGap)}, because a manager who counts the pipeline recovers more slowly even though they never overshoot. Say which cost
          matters before you rank policies.
        </Para>
      </Step>

      <div className="mt-12 rounded-card bg-card border border-border px-5 py-4 max-w-[78ch]">
        <p className="heading text-[17px]">Good practice from Sterman</p>
        <ul className="mt-2 space-y-2 text-[15px] leading-[1.6] list-disc pl-5 marker:text-accent-edge">
          <li>Test over a range at least twice as wide as statistics or judgement suggest, because people are overconfident and confidence intervals miss specification error (p. 884).</li>
          <li>Vary more than parameters: models are usually more sensitive to boundary, aggregation and decision-rule assumptions than to numbers (p. 884).</li>
          <li>Focus effort on parameters that are both uncertain and influential; one with little effect need not be tested even if uncertain (pp. 884-885).</li>
          <li>Best and worst cases bound the outcomes; Monte Carlo runs give dynamic confidence bands like the ones above (pp. 885-886).</li>
        </ul>
      </div>
    </div>
  );
}
