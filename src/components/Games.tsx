// Decision games: management flight simulators where the learner makes the decisions, turn by turn.
// The engines live in src/lib/games.ts; this file is the play screen and the debrief for each game.
import { useEffect, useId, useMemo, useState } from "react";
import { Beer, ChevronLeft, Fish, Flame, Minus, Plus, RotateCcw } from "lucide-react";
import {
  BEER,
  FIRE,
  FISH,
  GOOD,
  STAGES,
  STERMAN,
  beerAdvance,
  beerCost,
  beerDemand,
  beerGoodSeat,
  beerNew,
  beerPeak,
  beerRun,
  fireAdvance,
  fireNew,
  fireRun,
  fireScore,
  fishAdvance,
  fishCatchPerBoat,
  fishNew,
  fishProfit,
  fishRun,
  goodOrder,
  type BeerGame,
  type FireGame,
  type FishGame,
} from "@/lib/games";
import { cn } from "@/lib/utils";

const wrap = "page";
const QUIET = "hsl(var(--muted-foreground))", GRID = "hsl(var(--border))", INK = "hsl(var(--foreground))";
const BLUE = "var(--viz-acc)", ORANGE = "var(--viz-acc2)", GREEN = "var(--viz-good)", PINK = "var(--viz-pink)";
const STAGE_COLORS = [BLUE, ORANGE, GREEN, PINK];
const fmt = (v: number) => (Math.abs(v) >= 100 || Number.isInteger(v) ? Math.round(v).toLocaleString("en-US") : v.toFixed(1));
// dollars to the cent (beer game costs come in halves), millions to one decimal (fishery)
const money = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 })}`;
const millions = (v: number) => `${v < 0 ? "−" : ""}$${Math.abs(v).toLocaleString("en-US", { maximumFractionDigits: Math.abs(v) >= 100 ? 0 : 1 })}m`;

// ---- saved state -----------------------------------------------------------------------------------
const KEY = (id: string) => `loopbricks-game-${id}-v1`;
function load<T>(id: string, ok: (x: T) => boolean): T | null {
  try {
    const raw = localStorage.getItem(KEY(id));
    if (!raw) return null;
    const x = JSON.parse(raw) as T;
    return x && ok(x) ? x : null;
  } catch {
    return null; // storage blocked or corrupt: start fresh
  }
}
function useSaved<T>(id: string, ok: (x: T) => boolean, init: () => T | null) {
  const [state, setState] = useState<T | null>(() => load(id, ok) ?? init());
  useEffect(() => {
    try {
      if (state === null) localStorage.removeItem(KEY(id));
      else localStorage.setItem(KEY(id), JSON.stringify(state));
    } catch {
      // not saved, the game still plays
    }
  }, [id, state]);
  return [state, setState] as const;
}
const okBeer = (g: BeerGame) => Array.isArray(g.stages) && g.stages.length === 4 && typeof g.week === "number" && Array.isArray(g.hist?.incoming);
const okFish = (g: FishGame) => typeof g.year === "number" && !!g.s && Array.isArray(g.hist?.res);
const okFire = (g: FireGame) => typeof g.week === "number" && !!g.s && Array.isArray(g.hist?.prob);

// ---- small pieces ----------------------------------------------------------------------------------
type Line = { ys: number[]; color: string; label: string; dash?: string; width?: number };
// A small line chart in SVG over a fixed x range, so the axis does not jump while a game is played.
function LineChart({ lines, x0, x1, xLabel, yLabel, yMax, height = 200, marker }: { lines: Line[]; x0: number; x1: number; xLabel: string; yLabel: string; yMax?: number; height?: number; marker?: { x: number; label: string } }) {
  const clip = useId().replace(/:/g, "");
  const W = 560, H = height, L = 44, R = 10, T = 10, B = 32;
  const all = lines.flatMap((l) => l.ys);
  const lo = Math.min(0, ...all);
  const hi = yMax ?? Math.max(lo + 1, ...all) * 1.06;
  const X = (x: number) => L + ((x - x0) / (x1 - x0 || 1)) * (W - L - R);
  const Y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const ticks = [0, 0.5, 1].map((q) => lo + (hi - lo) * q);
  if (lo < 0) ticks.push(0);
  const xt = [0, 0.25, 0.5, 0.75, 1].map((q) => Math.round(x0 + (x1 - x0) * q));
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={`${lines.map((l) => l.label).join(", ")}: ${yLabel} by ${xLabel.toLowerCase()}`}>
        <defs>
          <clipPath id={clip}>
            <rect x={L} y={T - 2} width={W - L - R} height={H - T - B + 4} />
          </clipPath>
        </defs>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke={GRID} strokeWidth={v === 0 && lo < 0 ? 1.6 : 1} />
            <text x={L - 6} y={Y(v) + 4} textAnchor="end" fontSize="11" fill={QUIET}>
              {fmt(v)}
            </text>
          </g>
        ))}
        {xt.map((x) => (
          <text key={x} x={X(x)} y={H - B + 15} textAnchor="middle" fontSize="11" fill={QUIET}>
            {x}
          </text>
        ))}
        <text x={L + (W - L - R) / 2} y={H - 3} textAnchor="middle" fontSize="11" fill={QUIET}>
          {xLabel}
        </text>
        {marker && (
          <g>
            <line x1={X(marker.x)} x2={X(marker.x)} y1={T} y2={H - B} stroke={QUIET} strokeDasharray="3 3" />
            <text x={X(marker.x) + 4} y={T + 10} fontSize="11" fill={QUIET}>
              {marker.label}
            </text>
          </g>
        )}
        <g clipPath={`url(#${clip})`}>
          {lines.map((l) =>
            l.ys.length > 1 ? (
              <polyline
                key={l.label}
                fill="none"
                stroke={l.color}
                strokeWidth={l.width ?? 2.2}
                strokeDasharray={l.dash}
                strokeLinejoin="round"
                points={l.ys.map((v, i) => `${X(x0 + i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ")}
              />
            ) : (
              l.ys.length === 1 && <circle key={l.label} cx={X(x0)} cy={Y(l.ys[0])} r={3} fill={l.color} />
            )
          )}
        </g>
      </svg>
      <Legend lines={lines} />
      <p className="sr-only">
        {yLabel}. {lines.map((l) => `${l.label}: last ${fmt(l.ys[l.ys.length - 1] ?? 0)}, highest ${fmt(Math.max(...l.ys))}`).join(". ")}.
      </p>
    </div>
  );
}
const Legend = ({ lines }: { lines: Line[] }) => (
  <div aria-hidden className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
    {lines.map((l) => (
      <span key={l.label} className="flex items-center gap-1.5">
        <svg width="18" height="6" className="shrink-0">
          <line x1="0" x2="18" y1="3" y2="3" stroke={l.color} strokeWidth="3" strokeDasharray={l.dash} />
        </svg>
        {l.label}
      </span>
    ))}
  </div>
);
const Stat = ({ label, value, note }: { label: string; value: string; note?: string }) => (
  <div className="rounded-[8px] bg-background px-3 py-2 min-w-0">
    <dt className="text-[12px] text-muted-foreground">{label}</dt>
    <dd className="text-[19px] font-bold tabular-nums leading-tight">{value}</dd>
    {note && <dd className="text-[11.5px] text-muted-foreground">{note}</dd>}
  </div>
);
// move focus to a debrief's heading when it appears, so keyboard and screen reader users land on the result
const focusOnMount = (el: HTMLElement | null) => el?.focus({ preventScroll: false });
const Para = ({ children }: { children: React.ReactNode }) => <p className="mt-3 text-[15.5px] leading-[1.65] max-w-[72ch]">{children}</p>;
const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="heading text-[21px] md:text-[23px] mt-10">{children}</h2>;

// The turn input: a labelled number, quick − and + buttons, and the button that ends the turn. Enter ends it too.
function TurnForm({ label, value, onValue, min, max, step, quick = step, submit, onSubmit, unit }: { label: string; value: string; onValue: (v: string) => void; min: number; max: number; step: number; quick?: number; submit: string; onSubmit: (v: number) => void; unit?: string }) {
  const id = useId();
  const clamp = (v: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : 0));
  const nudge = (d: number) => onValue(String(clamp((parseFloat(value) || 0) + d)));
  return (
    <form
      className="mt-4"
      onSubmit={(e) => {
        e.preventDefault();
        const v = clamp(Math.round((parseFloat(value) || 0) / step) * step);
        onValue(String(v));
        onSubmit(v);
      }}
    >
      <label htmlFor={id} className="block text-[14px] font-semibold">
        {label}
        {unit && <span className="font-normal text-muted-foreground"> ({unit})</span>}
      </label>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => nudge(-quick)} aria-label={`${quick} less`} className="brick brick-w w-10 h-11 grid place-items-center">
            <Minus size={16} aria-hidden />
          </button>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onValue(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-[92px] h-11 rounded-[var(--radius)] border border-input bg-card px-3 text-[18px] font-bold tabular-nums"
          />
          <button type="button" onClick={() => nudge(quick)} aria-label={`${quick} more`} className="brick brick-w w-10 h-11 grid place-items-center">
            <Plus size={16} aria-hidden />
          </button>
        </div>
        <button type="submit" className="brick brick-y h-11 px-5 text-[15px] font-semibold">
          {submit}
        </button>
      </div>
    </form>
  );
}
function Live({ children }: { children: React.ReactNode }) {
  return (
    <p aria-live="polite" className="mt-3 min-h-[1.5em] text-[14px] leading-[1.5] text-foreground/85">
      {children}
    </p>
  );
}
const Restart = ({ onClick, label = "Start again" }: { onClick: () => void; label?: string }) => (
  <button onClick={onClick} className="brick brick-w h-10 px-4 text-[14px] font-semibold inline-flex items-center gap-2">
    <RotateCcw size={15} aria-hidden /> {label}
  </button>
);
const Links = ({ onOpen, links }: { onOpen: (hash: string) => void; links: [string, string][] }) => (
  <div className="mt-4 flex flex-wrap gap-2">
    {links.map(([label, hash]) => (
      <button key={hash} onClick={() => onOpen(hash)} className="brick brick-w h-9 max-sm:min-h-11 px-3.5 text-[13px] font-semibold">
        {label}
      </button>
    ))}
  </div>
);
function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map(([v, text]) => (
        <button key={v} aria-pressed={value === v} onClick={() => onChange(v)} className={cn("brick h-9 max-sm:min-h-11 px-3.5 text-[13px] font-semibold", value === v ? "brick-y" : "brick-w")}>
          {text}
        </button>
      ))}
    </div>
  );
}
// a small table that stays inside 390px: short labels, numbers right-aligned
function Table({ head, rows, caption }: { head: string[]; rows: (string | number)[][]; caption: string }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-[13.5px] tabular-nums">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="text-left text-muted-foreground">
            {head.map((h, i) => (
              <th key={h} scope="col" className={cn("font-semibold pb-2 pr-2", i > 0 && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r[0])} className="border-t border-border">
              {r.map((c, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="text-left font-normal py-2 pr-2">
                    {c}
                  </th>
                ) : (
                  <td key={i} className="text-right py-2 pr-2 font-semibold">
                    {c}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- the games -------------------------------------------------------------------------------------
type GameDef = { id: string; title: string; icon: typeof Beer; turns: string; blurb: string; lede: string; progress: () => string | null };
const GAMES: GameDef[] = [
  {
    id: "beer",
    title: "The beer game",
    icon: Beer,
    turns: "36 weeks, about 15 min",
    blurb: "Run one stage of a four-stage supply chain. Order beer each week, keep costs down, and find out where the swings come from.",
    lede: "You run one stage of a beer supply chain. Each week you see your own stock and the order that has just arrived, and you decide how much to order. The other three stages are run by the computer.",
    progress: () => {
      const g = load<BeerGame>("beer", okBeer);
      return g ? (g.done ? "Finished: see your debrief" : `In progress: week ${g.week} of ${BEER.weeks}`) : null;
    },
  },
  {
    id: "fishery",
    title: "The fishery",
    icon: Fish,
    turns: "30 years, about 8 min",
    blurb: "Run a fishing fleet on a stock you share with a rival. Build boats or scrap them each year, and try to still have fish at the end.",
    lede: "You run Fleet A. Fleet B fishes the same stock and keeps building boats while its boats pay. Each year you decide how many boats to build or scrap.",
    progress: () => {
      const g = load<FishGame>("fishery", okFish);
      return g ? (g.done ? "Finished: see your debrief" : `In progress: year ${g.year} of ${FISH.years}`) : null;
    },
  },
  {
    id: "firefighting",
    title: "Firefighting",
    icon: Flame,
    turns: "104 weeks, about 6 min",
    blurb: "Lead a team that can patch problems fast or fix them properly. Choose the mix every four weeks and watch what it does to the team.",
    lede: "Your team faces a steady flow of problems. Patching makes a problem go away at once, but it comes back. Fixing it properly is slower and needs the capability you build with whatever time patching leaves.",
    progress: () => {
      const g = load<FireGame>("firefighting", okFire);
      return g ? (g.done ? "Finished: see your debrief" : `In progress: week ${g.week} of ${FIRE.weeks}`) : null;
    },
  },
];

export function GamesIndex({ onGame, onOpen }: { onGame: (id: string) => void; onOpen: (hash: string) => void }) {
  return (
    <div className={`${wrap} pt-10 md:pt-14 pb-16`}>
      <p className="text-[14px] font-semibold text-muted-foreground">Decision games</p>
      <h1 className="display text-[34px] md:text-[50px] max-w-[18ch] mt-2">Make the decisions yourself</h1>
      <p className="mt-5 text-[17px] leading-[1.6] text-foreground/80 max-w-[64ch]">
        Reading that people ignore delays and feedback is easy. Doing it yourself is more convincing. In each game you make one decision per turn with the information a real manager would
        have. The debrief then shows what the structure did with your decisions, and what a better policy would have done.
      </p>
      <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {GAMES.map((g) => {
          const Icon = g.icon;
          const progress = g.progress();
          return (
            <li key={g.id}>
              <button onClick={() => onGame(g.id)} className="brick brick-w w-full h-full text-left p-4 flex flex-col">
                <span className="flex items-center gap-2.5">
                  <span aria-hidden className="w-9 h-9 rounded-[8px] bg-accent/25 grid place-items-center shrink-0">
                    <Icon size={19} />
                  </span>
                  <span className="heading text-[17px]">{g.title}</span>
                </span>
                <span className="mt-2.5 text-[14px] leading-[1.5] text-muted-foreground">{g.blurb}</span>
                <span className="mt-auto pt-3 text-[12.5px] text-muted-foreground">{g.turns}</span>
                {progress && <span className="mt-1 text-[12.5px] font-semibold">{progress}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-10 text-[15px] text-muted-foreground max-w-[70ch]">
        The games build on the oscillation and archetypes modules. You can play them first and read the theory afterwards.
      </p>
      <Links
        onOpen={onOpen}
        links={[
          ["Oscillation module", "/learn/oscillation"],
          ["System archetypes module", "/learn/archetypes"],
        ]}
      />
    </div>
  );
}

export function GamePage({ id, onIndex, onOpen }: { id: string; onIndex: () => void; onOpen: (hash: string) => void }) {
  const def = GAMES.find((g) => g.id === id);
  return (
    <div className={`${wrap} pt-8 md:pt-10 pb-16`}>
      <button onClick={onIndex} className="tlink text-[14px] font-semibold inline-flex items-center gap-1">
        <ChevronLeft size={16} aria-hidden /> All games
      </button>
      {!def ? (
        <p className="sheet text-[15px] mt-6">There is no game called “{id}”.</p>
      ) : (
        <>
          <h1 className="display text-[32px] md:text-[46px] mt-3">{def.title}</h1>
          <p className="mt-4 text-[16.5px] leading-[1.6] text-foreground/80 max-w-[66ch]">{def.lede}</p>
          {id === "beer" && <BeerGamePlay onOpen={onOpen} />}
          {id === "fishery" && <FisheryPlay onOpen={onOpen} />}
          {id === "firefighting" && <FirePlay onOpen={onOpen} />}
        </>
      )}
    </div>
  );
}

// ===================================================================================================
// Beer game
function BeerGamePlay({ onOpen }: { onOpen: (hash: string) => void }) {
  const [g, setG] = useSaved<BeerGame>("beer", okBeer, () => null);
  const [order, setOrder] = useState("4");
  const [note, setNote] = useState("");

  if (!g)
    return (
      <div className="mt-6 sheet">
        <h2 className="heading text-[19px]">Choose your stage</h2>
        <Para>
          Beer flows down the chain from the factory to the customer, and orders flow up. Orders take 2 weeks to reach your supplier, and beer takes 2 more weeks to reach you. Every case
          in stock costs $0.50 a week, and every case you owe a customer (your backlog) costs $1.00 a week. You start with 12 cases, and 4 a week are flowing everywhere.
        </Para>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STAGES.map((s, i) => (
            <button
              key={s}
              onClick={() => {
                setG(beerNew(i));
                setOrder("4");
                setNote(`You are the ${s.toLowerCase()}. Week 1 has begun.`);
              }}
              className="brick brick-y h-12 px-3 text-[15px] font-semibold"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );

  const role = g.role ?? 0;
  const me = g.stages[role];
  const restart = () => (setG(null), setNote(""));
  if (g.done) return <BeerDebrief g={g} onOpen={onOpen} restart={restart} />;

  const net = g.hist.inv[role].map((v, i) => v - g.hist.backlog[role][i]);
  const incoming = g.hist.incoming[role];
  const myCost = g.hist.cost[role].reduce((a, b) => a + b, 0);
  const play = (o: number) => {
    const n = beerAdvance(g, o);
    setG(n);
    if (n.done) setNote(`Week ${BEER.weeks} done. Your debrief is ready.`);
    else {
      const s = n.stages[role];
      setNote(`Week ${n.week}: ${s.received} cases arrived and an order for ${s.incoming} came in. You shipped ${s.shipped}. Inventory ${s.inv}, backlog ${s.backlog}.`);
    }
  };
  return (
    <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
      <section className="sheet" aria-labelledby="beer-turn">
        <div className="sheet-head">
          <h2 id="beer-turn" className="heading text-[19px]">
            Week {g.week} of {BEER.weeks}
          </h2>
          <span className="text-[13.5px] text-muted-foreground">You are the {STAGES[role].toLowerCase()}</span>
        </div>
        <ChainStrip role={role} />
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Stat label="Inventory" value={fmt(me.inv)} note="cases" />
          <Stat label="Backlog" value={fmt(me.backlog)} note="cases owed" />
          <Stat label="Order received" value={fmt(me.incoming)} note={role === 0 ? "from customers" : `from the ${STAGES[role - 1].toLowerCase()}`} />
          <Stat label="Beer received" value={fmt(me.received)} note="this week" />
          <Stat label="On order" value={fmt(me.onOrder)} note="not yet arrived" />
          <Stat label="Your cost so far" value={money(myCost)} />
        </dl>
        <TurnForm label="Your order this week" unit="cases" value={order} onValue={setOrder} min={0} max={99} step={1} submit="Order" onSubmit={play} />
        <Live>{note}</Live>
      </section>
      <section className="sheet" aria-label="Your stage so far">
        <h2 className="heading text-[17px]">Your stage so far</h2>
        <div className="mt-3">
          <LineChart
            x0={1}
            x1={BEER.weeks}
            xLabel="Week"
            yLabel="Cases"
            lines={[
              { ys: incoming, color: ORANGE, label: "Orders received" },
              { ys: g.hist.orders[role], color: BLUE, label: "Your orders" },
              { ys: net, color: GREEN, label: "Inventory minus backlog" },
            ]}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Restart onClick={restart} />
        </div>
      </section>
    </div>
  );
}
function ChainStrip({ role }: { role: number }) {
  const items = ["Customers", ...STAGES];
  return (
    <ol aria-label="The supply chain, from customers to the factory" className="flex flex-wrap items-center gap-1 text-[12.5px]">
      {items.map((s, i) => (
        <li key={s} className="flex items-center gap-1">
          {i > 0 && (
            <span aria-hidden className="text-muted-foreground">
              ←
            </span>
          )}
          <span className={cn("rounded-[6px] px-2 py-0.5", i - 1 === role ? "bg-accent font-semibold text-accent-foreground" : "bg-background text-muted-foreground")}>
            {s}
            {i - 1 === role && <span className="sr-only"> (you)</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

function BeerDebrief({ g, onOpen, restart }: { g: BeerGame; onOpen: (hash: string) => void; restart: () => void }) {
  const role = g.role ?? 0;
  const runs = useMemo(() => ({ you: g, computer: beerRun(), seat: beerGoodSeat(role), good: beerRun(goodOrder) }), [g, role]);
  const [view, setView] = useState<"you" | "computer" | "good">("you");
  const r = runs[view];
  const weeks = BEER.weeks;
  const orderLines: Line[] = [
    ...STAGES.map((s, i) => ({ ys: r.hist.orders[i], color: STAGE_COLORS[i], label: s + (view === "you" && i === role ? " (you)" : ""), width: view === "you" && i === role ? 3.2 : 2 })),
    { ys: r.hist.demand, color: INK, label: "Customer demand", dash: "4 3", width: 1.6 },
  ];
  const invLines: Line[] = STAGES.map((s, i) => ({
    ys: r.hist.inv[i].map((v, k) => v - r.hist.backlog[i][k]),
    color: STAGE_COLORS[i],
    label: s + (view === "you" && i === role ? " (you)" : ""),
    width: view === "you" && i === role ? 3.2 : 2,
  }));
  const mine = beerCost(g, role), comp = beerCost(runs.computer, role), seat = beerCost(runs.seat, role);
  const peaks = STAGES.map((_, i) => beerPeak(r, i));
  return (
    <div className="mt-6">
      <div className="rounded-card bg-card border-l-4 border-accent px-5 py-4">
        <h2 ref={focusOnMount} tabIndex={-1} className="heading text-[20px] outline-none">Game over: your cost was {money(mine)}</h2>
        <p className="mt-2 text-[15px] leading-[1.6] max-w-[70ch]">
          A computer player in your seat, ordering like the average player in Sterman's experiment, ran up {money(comp)}. A manager in your seat who counted the supply line would have
          spent {money(seat)}. The whole chain cost {money(beerCost(g))} in your game, against {money(beerCost(runs.computer))} with four computer players and {money(beerCost(runs.good))} with
          four managers who count the supply line.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Restart onClick={restart} label="Play again" />
        </div>
      </div>

      <H2>What happened along the chain</H2>
      <Para>
        Customer demand rose once, from {BEER.demand0} to {BEER.demand1} cases a week in week {BEER.stepWeek}, and then stayed flat. Look at how much larger the swings in orders become at each
        stage up the chain (amplification), and how each stage peaks later than the one below it (phase lag).
      </Para>
      <div className="mt-4">
        <Segmented
          label="Which run to show"
          value={view}
          onChange={setView}
          options={[
            ["you", "Your game"],
            ["computer", "Four computer players"],
            ["good", "Good policy everywhere"],
          ]}
        />
      </div>
      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <section className="sheet" aria-label="Orders placed by each stage">
          <h3 className="heading text-[16px]">Orders placed (cases a week)</h3>
          <div className="mt-3">
            <LineChart x0={1} x1={weeks} xLabel="Week" yLabel="Orders placed" lines={orderLines} marker={{ x: BEER.stepWeek, label: "demand rises" }} />
          </div>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Peak orders: {STAGES.map((s, i) => `${s.toLowerCase()} ${peaks[i]}`).join(", ")}. Customers never ordered more than {BEER.demand1}.
          </p>
        </section>
        <section className="sheet" aria-label="Inventory minus backlog at each stage">
          <h3 className="heading text-[16px]">Inventory minus backlog (cases)</h3>
          <div className="mt-3">
            <LineChart x0={1} x1={weeks} xLabel="Week" yLabel="Inventory minus backlog" lines={invLines} marker={{ x: BEER.stepWeek, label: "demand rises" }} />
          </div>
          <p className="mt-2 text-[13px] text-muted-foreground">Below zero means a backlog: customers waiting for beer you do not have.</p>
        </section>
      </div>

      <H2>Costs</H2>
      <Table
        caption="Total cost over 36 weeks"
        head={["Run", "Your stage", "Whole chain"]}
        rows={[
          ["Your game", money(mine), money(beerCost(g))],
          ["Computer player in your seat", money(comp), money(beerCost(runs.computer))],
          ["Good policy in your seat", money(seat), money(beerCost(runs.seat))],
          ["Good policy everywhere", money(beerCost(runs.good, role)), money(beerCost(runs.good))],
        ]}
      />

      <H2>Why it happens</H2>
      <Para>
        Almost everyone who plays blames the customers or the other players. But demand changed only once, and in the computer runs every player follows the same simple rule. The swings come
        from the structure: a 4-week lead time and a decision rule that looks at inventory but not at the beer already on its way. When stock runs short, players keep ordering until it
        arrives, then find they have ordered far too much. Each stage passes a bigger swing to the next.
      </Para>
      <Para>
        The computer players use Sterman's anchoring and adjustment rule: order = expected orders + {STERMAN.alpha} × (desired stock − stock − {STERMAN.beta} × supply line), with expected
        orders updated by {STERMAN.theta} of each surprise and a desired stock of {STERMAN.target}. A weight of {STERMAN.beta} on the supply line means two thirds of the beer already ordered is
        ignored. The good policy has the same shape but counts all of it, against a supply line of {GOOD.lead} weeks of expected orders, and closes both gaps over {GOOD.adjust} weeks.
      </Para>
      <Links
        onOpen={onOpen}
        links={[
          ["Oscillation module", "/learn/oscillation"],
          ["Ignoring the supply line (molecule)", "/m/lowVisPipeline"],
          ["Stock management (molecule)", "/m/stockmgmt"],
        ]}
      />
      <p className="mt-8 text-[13px] text-muted-foreground max-w-[80ch]">
        Source: Sterman JD (1989), Modeling managerial behavior: misperceptions of feedback in a dynamic decision making experiment, Management Science 35(3):321-339. Weekly demand for beer
        here is {beerDemand(1)} then {beerDemand(BEER.stepWeek)} cases, as in the classic board game.
      </p>
    </div>
  );
}

// ===================================================================================================
// Fishery
function FisheryPlay({ onOpen }: { onOpen: (hash: string) => void }) {
  const [g, setG] = useSaved<FishGame>("fishery", okFish, () => fishNew());
  const [change, setChange] = useState("0");
  const [note, setNote] = useState("");
  const game = g ?? fishNew();
  const restart = () => (setG(fishNew()), setChange("0"), setNote("A new game has begun. Year 1 is about to start."));
  if (game.done) return <FishDebrief g={game} onOpen={onOpen} restart={restart} />;

  const { a, b } = fishProfit(game);
  const perBoat = fishCatchPerBoat(game.s.res);
  const play = (c: number) => {
    const n = fishAdvance(game, c);
    setG(n);
    const y = n.year, pa = n.hist.profitA[y] - n.hist.profitA[y - 1];
    setNote(
      n.done
        ? `Year ${FISH.years} done. Your debrief is ready.`
        : `Year ${y}: the fleets landed ${fmt(n.hist.catchTotal[y - 1])} kt. Fish stock now ${fmt(n.s.res)} kt. Your profit this year ${millions(pa)}. Fleet B has ${fmt(n.s.fb)} boats.`
    );
    setChange("0");
  };
  return (
    <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
      <section className="sheet" aria-labelledby="fish-turn">
        <div className="sheet-head">
          <h2 id="fish-turn" className="heading text-[19px]">
            Year {game.year + 1} of {FISH.years}
          </h2>
          <span className="text-[13.5px] text-muted-foreground">You run Fleet A</span>
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Stat label="Fish stock" value={fmt(game.s.res)} note="kt, at most 100" />
          <Stat label="Your boats" value={fmt(game.s.fa)} />
          <Stat label="Fleet B's boats" value={fmt(game.s.fb)} />
          <Stat label="Catch per boat" value={perBoat.toFixed(2)} note="kt a year; a boat pays above 0.25" />
          <Stat label="Your profit" value={millions(a)} note="so far" />
          <Stat label="Fleet B's profit" value={millions(b)} note="so far" />
        </dl>
        <p className="mt-3 text-[13px] text-muted-foreground">Fish sell for $1m a kt. A boat costs $0.25m a year to run and $1m to build; a scrapped boat returns nothing.</p>
        <TurnForm
          label="Boats to build (+) or scrap (−)"
          value={change}
          onValue={setChange}
          min={-Math.floor(game.s.fa)}
          max={20}
          step={1}
          submit="Next year"
          onSubmit={play}
        />
        <Live>{note}</Live>
      </section>
      <section className="sheet" aria-label="The fishery so far">
        <h2 className="heading text-[17px]">The fishery so far</h2>
        <div className="mt-3">
          <LineChart
            x0={0}
            x1={FISH.years}
            xLabel="Year"
            yLabel="Fish (kt) and boats"
            lines={[
              { ys: game.hist.res, color: GREEN, label: "Fish stock (kt)" },
              { ys: game.hist.fa, color: BLUE, label: "Your boats" },
              { ys: game.hist.fb, color: ORANGE, label: "Fleet B's boats" },
            ]}
          />
        </div>
        <div className="mt-4">
          <LineChart
            x0={0}
            x1={FISH.years}
            height={160}
            xLabel="Year"
            yLabel="Profit to date ($m)"
            lines={[
              { ys: game.hist.profitA, color: BLUE, label: "Your profit ($m)" },
              { ys: game.hist.profitB, color: ORANGE, label: "Fleet B's profit ($m)" },
            ]}
          />
        </div>
        <div className="mt-4">
          <Restart onClick={restart} />
        </div>
      </section>
    </div>
  );
}

function FishDebrief({ g, onOpen, restart }: { g: FishGame; onOpen: (hash: string) => void; restart: () => void }) {
  const open = useMemo(() => fishRun(0), []);
  const limit = useMemo(() => fishRun(8), []);
  const { a, b } = fishProfit(g);
  const best = FISH.bestProfitPerYear * FISH.years;
  const total = (x: FishGame) => fishProfit(x).a + fishProfit(x).b;
  const landed = (x: FishGame) => x.hist.catchTotal.reduce((s, v) => s + v, 0);
  const end = (x: FishGame) => x.hist.res[x.year];
  return (
    <div className="mt-6">
      <div className="rounded-card bg-card border-l-4 border-accent px-5 py-4">
        <h2 ref={focusOnMount} tabIndex={-1} className="heading text-[20px] outline-none">
          30 years on: you made {millions(a)}, Fleet B made {millions(b)}
        </h2>
        <p className="mt-2 text-[15px] leading-[1.6] max-w-[70ch]">
          Together the two fleets made {millions(a + b)} and left {fmt(end(g))} kt of fish in the sea. The best the fishery could do for ever is {millions(FISH.bestProfitPerYear)} a year
          with {FISH.bestBoats} boats in all and a stock near {fmt(FISH.bestStock)} kt: {millions(best)} over 30 years, or {millions(best / 2)} for each fleet if they shared it.
        </p>
        <div className="mt-4">
          <Restart onClick={restart} label="Play again" />
        </div>
      </div>

      <H2>Your game against two replays</H2>
      <Para>
        In the open access replay both fleets follow Fleet B's rule: build while boats pay. In the catch limit replay they follow the same rule, but the two fleets together may land at
        most 8 kt a year.
      </Para>
      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <section className="sheet" aria-label="Fish stock in each run">
          <h3 className="heading text-[16px]">Fish stock (kt)</h3>
          <div className="mt-3">
            <LineChart
              x0={0}
              x1={FISH.years}
              xLabel="Year"
              yLabel="Fish stock"
              yMax={100}
              lines={[
                { ys: g.hist.res, color: BLUE, label: "Your game", width: 3 },
                { ys: open.hist.res, color: ORANGE, label: "Open access" },
                { ys: limit.hist.res, color: GREEN, label: "Catch limit of 8" },
              ]}
            />
          </div>
        </section>
        <section className="sheet" aria-label="Boats in each run">
          <h3 className="heading text-[16px]">Boats, both fleets together</h3>
          <div className="mt-3">
            <LineChart
              x0={0}
              x1={FISH.years}
              xLabel="Year"
              yLabel="Boats"
              lines={[
                { ys: g.hist.fa.map((v, i) => v + g.hist.fb[i]), color: BLUE, label: "Your game", width: 3 },
                { ys: open.hist.fa.map((v, i) => v + open.hist.fb[i]), color: ORANGE, label: "Open access" },
                { ys: limit.hist.fa.map((v, i) => v + limit.hist.fb[i]), color: GREEN, label: "Catch limit of 8" },
              ]}
            />
          </div>
        </section>
      </div>
      <Table
        caption="Results over 30 years"
        head={["Run", "Profit, both fleets", "Fish landed", "Stock at the end"]}
        rows={[
          ["Your game", millions(a + b), `${fmt(landed(g))} kt`, `${fmt(end(g))} kt`],
          ["Open access", millions(total(open)), `${fmt(landed(open))} kt`, `${fmt(end(open))} kt`],
          ["Catch limit of 8", millions(total(limit)), `${fmt(landed(limit))} kt`, `${fmt(end(limit))} kt`],
          ["Best sustainable", millions(best), `${fmt(FISH.bestCatchPerYear * FISH.years)} kt`, `${fmt(FISH.bestStock)} kt`],
        ]}
      />

      <H2>Why it happens</H2>
      <Para>
        Each fleet keeps the whole of its own catch but bears only part of the damage to the shared stock. So while a boat pays, building one looks right to its owner, even as every extra
        boat lowers everyone's catch. Holding back on your own mostly hands the fish to the other fleet. Fleet B kept building until boats stopped paying, by which time the stock was far
        below the level that gives the largest catch.
      </Para>
      <Para>
        A limit on the total catch protects the fish: in the replay the stock holds above 70 kt. It does not, on its own, stop the race for boats. The fleets still build until each boat only
        just pays, so most of the money goes on boats the fishery does not need. That is why real fisheries pair a limit with a fixed share of it for each fleet, which removes the reason to race.
      </Para>
      <Links
        onOpen={onOpen}
        links={[
          ["System archetypes module", "/learn/archetypes"],
          ["Tragedy of the commons (molecule)", "/m/tragedyCommons"],
        ]}
      />
      <p className="mt-8 text-[13px] text-muted-foreground max-w-[80ch]">
        Model: the tragedy of the commons molecule, run a year at a time. Sources: Hardin G (1968), The tragedy of the commons, Science 162:1243-1248; Moxnes E (1998), Not only the tragedy of
        the commons: misperceptions of bioeconomics, Management Science 44(9):1234-1248.
      </p>
    </div>
  );
}

// ===================================================================================================
// Firefighting
function FirePlay({ onOpen }: { onOpen: (hash: string) => void }) {
  const [g, setG] = useSaved<FireGame>("firefighting", okFire, () => fireNew());
  const [share, setShare] = useState("50");
  const [note, setNote] = useState("");
  const game = g ?? fireNew();
  const restart = () => (setG(fireNew()), setShare("50"), setNote("A new game has begun at week 0."));
  if (game.done) return <FireDebrief g={game} onOpen={onOpen} restart={restart} />;

  const quickNow = Math.min(((parseFloat(share) || 0) / 100) * game.s.prob, 80);
  const play = (pct: number) => {
    const before = game.s.prob;
    const n = fireAdvance(game, pct / 100);
    setG(n);
    setNote(
      n.done
        ? `Week ${FIRE.weeks} done. Your debrief is ready.`
        : `Weeks ${n.week - FIRE.turn + 1} to ${n.week}: open problems ${n.s.prob < before ? "fell" : "rose"} from ${fmt(before)} to ${fmt(n.s.prob)}. Capability is ${fmt(n.s.cap)}.`
    );
  };
  return (
    <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
      <section className="sheet" aria-labelledby="fire-turn">
        <div className="sheet-head">
          <h2 id="fire-turn" className="heading text-[19px]">
            Weeks {game.week + 1} to {game.week + FIRE.turn} of {FIRE.weeks}
          </h2>
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Stat label="Open problems" value={fmt(game.s.prob)} />
          <Stat label="Capability" value={fmt(game.s.cap)} note="out of 100" />
          <Stat label="Patched, may come back" value={fmt(game.s.patched)} />
        </dl>
        <p className="mt-3 text-[13px] text-muted-foreground">
          At this share the team would patch about {fmt(quickNow)} problems a week, {Math.round((quickNow / 80) * 100)}% of its capacity of 80. What is left builds capability.
        </p>
        <TurnForm label="Share of problems patched quickly" unit="%" value={share} onValue={setShare} min={0} max={100} step={5} submit="Next 4 weeks" onSubmit={play} />
        <Live>{note}</Live>
      </section>
      <section className="sheet" aria-label="Your team so far">
        <h2 className="heading text-[17px]">Your team so far</h2>
        <div className="mt-3">
          <LineChart
            x0={0}
            x1={FIRE.weeks}
            xLabel="Week"
            yLabel="Problems and capability"
            lines={[
              { ys: game.hist.prob, color: PINK, label: "Open problems" },
              { ys: game.hist.cap, color: GREEN, label: "Capability" },
            ]}
          />
        </div>
        <div className="mt-4">
          <Restart onClick={restart} />
        </div>
      </section>
    </div>
  );
}

function FireDebrief({ g, onOpen, restart }: { g: FireGame; onOpen: (hash: string) => void; restart: () => void }) {
  const low = useMemo(() => fireRun(0.2), []);
  const high = useMemo(() => fireRun(0.8), []);
  const top = Math.max(150, ...g.hist.prob, ...low.hist.prob) * 1.1;
  const avgShare = g.hist.shares.reduce((a, b) => a + b, 0) / g.hist.shares.length;
  const row = (label: string, x: FireGame): string[] => [label, fmt(fireScore(x)), fmt(x.hist.prob[8]), fmt(x.hist.prob[FIRE.weeks]), fmt(x.hist.cap[FIRE.weeks])];
  return (
    <div className="mt-6">
      <div className="rounded-card bg-card border-l-4 border-accent px-5 py-4">
        <h2 ref={focusOnMount} tabIndex={-1} className="heading text-[20px] outline-none">Two years on: {fmt(fireScore(g))} problems open on an average week</h2>
        <p className="mt-2 text-[15px] leading-[1.6] max-w-[70ch]">
          You patched {Math.round(avgShare * 100)}% of problems on average and ended with {fmt(g.s.prob)} open problems and a capability of {fmt(g.s.cap)}. Always patching 20% averages{" "}
          {fmt(fireScore(low))}; always patching 80% averages {fmt(fireScore(high))}.
        </p>
        <div className="mt-4">
          <Restart onClick={restart} label="Play again" />
        </div>
      </div>

      <H2>Your path against two fixed policies</H2>
      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <section className="sheet" aria-label="Open problems in each run">
          <h3 className="heading text-[16px]">Open problems</h3>
          <div className="mt-3">
            <LineChart
              x0={0}
              x1={FIRE.weeks}
              xLabel="Week"
              yLabel="Open problems"
              yMax={top}
              lines={[
                { ys: g.hist.prob, color: BLUE, label: "You", width: 3 },
                { ys: low.hist.prob, color: GREEN, label: "Always 20%" },
                { ys: high.hist.prob, color: PINK, label: "Always 80%" },
              ]}
            />
          </div>
          {Math.max(...high.hist.prob) > top && (
            <p className="mt-2 text-[13px] text-muted-foreground">Always 80% runs off the top of the chart, reaching {fmt(high.hist.prob[FIRE.weeks])} by week 104.</p>
          )}
        </section>
        <section className="sheet" aria-label="Capability in each run">
          <h3 className="heading text-[16px]">Capability (0 to 100)</h3>
          <div className="mt-3">
            <LineChart
              x0={0}
              x1={FIRE.weeks}
              xLabel="Week"
              yLabel="Capability"
              yMax={100}
              lines={[
                { ys: g.hist.cap, color: BLUE, label: "You", width: 3 },
                { ys: low.hist.cap, color: GREEN, label: "Always 20%" },
                { ys: high.hist.cap, color: PINK, label: "Always 80%" },
              ]}
            />
          </div>
        </section>
      </div>
      <Table
        caption="Results over 104 weeks"
        head={["Run", "Average open", "Week 8", "Week 104", "Capability"]}
        rows={[row("You", g), row("Always 20%", low), row("Always 80%", high)]}
      />

      <H2>Better before worse, worse before better</H2>
      <Para>
        Patching more makes things look better within weeks: always 80% cuts open problems to {fmt(high.hist.prob[8])} by week 8, while always 20% lets them rise to {fmt(low.hist.prob[8])}.
        Judged on the first two months, firefighting wins. But every patch uses team time that would have built capability, and patched problems come back. Capability fades, fewer problems are
        fixed at the source, more need patching, and the team ends up with no time for anything else. Investing in the fix works the other way round: worse at first, then far better.
      </Para>
      <Para>
        This is the shifting the burden archetype. The quick fix is not wrong in itself; the trap is that its benefits arrive at once and its costs arrive later, somewhere else.
      </Para>
      <Links
        onOpen={onOpen}
        links={[
          ["System archetypes module", "/learn/archetypes"],
          ["Shifting the burden (molecule)", "/m/shiftingBurden"],
        ]}
      />
      <p className="mt-8 text-[13px] text-muted-foreground max-w-[80ch]">
        Model: the shifting the burden molecule, four weeks per turn. Sources: Senge PM (1990), The Fifth Discipline, Doubleday; Repenning NP and Sterman JD (2001), Nobody ever gets credit for
        fixing problems that never happened, California Management Review 43(4):64-88.
      </p>
    </div>
  );
}
