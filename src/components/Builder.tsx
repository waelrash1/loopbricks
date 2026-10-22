import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, AlertTriangle, Box, Circle, ClipboardCopy, Code2, Download, FileText, Hammer, Play, Plus, Trash2, Upload, Workflow } from "lucide-react";
import { notebookFor } from "@/lib/notebook";
import {
  TEMPLATES,
  elements,
  equationGroups,
  equationsText,
  findElement,
  freshName,
  fromJSON,
  inflows,
  isConstant,
  loadModel,
  newId,
  outflows,
  removeElement,
  renameElement,
  saveModel,
  simulate,
  template,
  toJSON,
  validate,
  type BFlow,
  type BModel,
  type BStock,
  type BVar,
  type Element,
  type Issue,
  type RunResult,
} from "@/lib/builder";
import { refName } from "@/lib/expr";
import { endDirs, flowShape, midpoint, shortenQ, valvePath } from "@/lib/flowGeom";
import { cn } from "@/lib/utils";

// The model builder: draw stocks, flows and variables, write their equations, check them and run.
// Notation follows SfDiagram: boxes, double-line pipes with a valve and a solid head, clouds at open ends, thin information arrows.
type P = [number, number];
const W = 1000, H = 480, BOX_H = 56, CLOUD_GAP = 70, SNAP = 5;
const PIPE = "var(--viz-acc)", INFO = "var(--viz-info)", BAD = "var(--viz-pink)", WARN = "hsl(var(--accent-edge))";
const INK = "hsl(var(--foreground))", CARD = "hsl(var(--card))", QUIET = "hsl(var(--muted-foreground))", GRID = "hsl(var(--border))";
const SERIES = ["var(--viz-acc)", "var(--viz-acc2)", "var(--viz-good)", "var(--viz-pink)", "var(--viz-info)", "hsl(var(--accent-edge))"];
const CLOUD_D = "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z";
const wrap = "max-w-[1320px] mx-auto px-4 md:px-8";
const input = "w-full h-9 rounded-[8px] border border-input bg-card px-2.5 text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const mono = "font-mono text-[13px]";
const btn = "brick brick-w h-9 px-3 text-[13px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-50";

const boxW = (name: string) => Math.max(104, Math.min(210, name.length * 7.6 + 28));
const unit = (a: P, b: P): P => {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
};
type Bx = { x: number; y: number; w: number; h: number };
// where a line from a box's centre towards (tx, ty) leaves the box
function edge(b: Bx, tx: number, ty: number): P {
  const dx = tx - b.x, dy = ty - b.y;
  const s = Math.min(dx ? b.w / 2 / Math.abs(dx) : 1e9, dy ? b.h / 2 / Math.abs(dy) : 1e9, 1);
  return [b.x + dx * s, b.y + dy * s];
}
const fmt = (v: number) => {
  if (!Number.isFinite(v)) return String(v);
  if (Math.abs(v) >= 1000) return Math.round(v).toLocaleString("en");
  return String(+v.toPrecision(4));
};
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
const isTyping = (t: EventTarget | null) => t instanceof HTMLElement && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);

function Cloud({ at }: { at: P }) {
  const s = 2.2;
  return <path d={CLOUD_D} transform={`translate(${at[0] - 12 * s}, ${at[1] - 11 * s}) scale(${s})`} fill={CARD} stroke="hsl(var(--input))" strokeWidth={1} strokeLinejoin="round" />;
}

function geometry(m: BModel, refsOf: (id: string) => string[], byKey: Map<string, Element>) {
  const boxes: Record<string, Bx> = Object.fromEntries(m.stocks.map((s) => [s.id, { x: s.x, y: s.y, w: boxW(s.name), h: BOX_H }]));
  const flows = m.flows.map((f) => {
    const v: P = [f.x, f.y];
    const fb = f.from ? boxes[f.from] : undefined, tb = f.to ? boxes[f.to] : undefined;
    let start: P | null = fb ? edge(fb, v[0], v[1]) : null;
    let end: P | null = tb ? edge(tb, v[0], v[1]) : null;
    if (!start) {
      const u: P = end ? unit(v, end) : [1, 0];
      start = [v[0] - u[0] * CLOUD_GAP, v[1] - u[1] * CLOUD_GAP];
    }
    if (!end) {
      const u = unit(start, v);
      end = [v[0] + u[0] * CLOUD_GAP, v[1] + u[1] * CLOUD_GAP];
    }
    const pts: P[] = [start, v, end];
    const { u0, uN } = endDirs(pts);
    return {
      f,
      shape: flowShape(pts, 16, 11, tb ? 0 : 6),
      fromCloud: fb ? null : ([start[0] - u0[0] * 20, start[1] - u0[1] * 20] as P),
      toCloud: tb ? null : ([end[0] + uN[0] * 20, end[1] + uN[1] * 20] as P),
    };
  });
  // information links: from every name an equation uses to the element that uses it
  const links: { key: string; d: string }[] = [];
  for (const c of [...m.flows.map((f) => ({ ...f, kind: "flow" as const })), ...m.vars.map((v) => ({ ...v, kind: "var" as const }))]) {
    for (const r of refsOf(c.id)) {
      const src = byKey.get(r);
      if (!src || src.id === c.id) continue;
      const a: P = [src.x, src.y], b: P = [c.x, c.y];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 1) continue;
      const [ux, uy] = unit(a, b), bend = src.kind === "stock" ? Math.min(40, len * 0.3) : Math.min(28, len * 0.14);
      const cp: P = [(a[0] + b[0]) / 2 - uy * bend, (a[1] + b[1]) / 2 + ux * bend];
      const s = src.kind === "stock" ? edge(boxes[src.id], cp[0], cp[1]) : shortenQ(cp[0], cp[1], a[0], a[1], src.kind === "flow" ? 14 : 9);
      const e = shortenQ(cp[0], cp[1], b[0], b[1], c.kind === "flow" ? 15 : 10);
      links.push({ key: `${src.id}>${c.id}`, d: `M ${s[0]} ${s[1]} Q ${cp[0]} ${cp[1]} ${e[0]} ${e[1]}` });
    }
  }
  return { boxes, flows, links };
}

// a free spot on the canvas, near a preferred point if one is given
function freeSpot(m: BModel, prefer?: P): P {
  const taken = elements(m).map((e) => [e.x, e.y] as P);
  const ok = (p: P) => p[0] > 60 && p[0] < W - 60 && p[1] > 50 && p[1] < H - 40 && taken.every((t) => Math.hypot(t[0] - p[0], t[1] - p[1]) > 95);
  const cands: P[] = [];
  if (prefer) for (const [dx, dy] of [[0, 0], [0, 110], [0, -110], [140, 0], [-140, 0], [140, 110], [-140, 110]]) cands.push([prefer[0] + dx, prefer[1] + dy]);
  for (let y = 100; y < H - 40; y += 110) for (let x = 140; x < W - 60; x += 150) cands.push([x, y]);
  return cands.find(ok) ?? [W / 2 + (taken.length % 5) * 12, H / 2 + (taken.length % 5) * 12];
}

const KIND_LABEL = { stock: "Stock", flow: "Flow", var: "Variable" } as const;
const kindOf = (e: Element) => (e.kind === "var" ? (isConstant(e) ? "Constant" : "Auxiliary") : KIND_LABEL[e.kind]);

// ===================================================================================================
export function ModelBuilder({ onOpen }: { onOpen: (hash: string) => void }) {
  const [model, setModel] = useState<BModel>(() => loadModel() ?? template("bathtub"));
  const [sel, setSel] = useState<string | null>(null);
  const [view, setView] = useState<"diagram" | "equations">("diagram");
  const [adding, setAdding] = useState<{ from: string; to: string } | null>(null);
  const [run, setRun] = useState<{ model: BModel; res: RunResult } | null>(null);
  const [note, setNote] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  const chk = useMemo(() => validate(model), [model]);
  const errors = chk.issues.filter((i) => i.level === "error");
  const byId = useMemo(() => {
    const out = new Map<string, Issue[]>();
    chk.issues.forEach((i) => i.id && out.set(i.id, [...(out.get(i.id) ?? []), i]));
    return out;
  }, [chk]);
  const geo = useMemo(() => geometry(model, (id) => chk.code.get(id)?.refs ?? [], chk.byKey), [model, chk]);
  const selected = findElement(model, sel);

  // save as you go, a moment after the last change
  useEffect(() => {
    const t = window.setTimeout(() => saveModel(model), 300);
    return () => window.clearTimeout(t);
  }, [model]);
  useEffect(() => {
    if (!note) return;
    const t = window.setTimeout(() => setNote(""), 5000);
    return () => window.clearTimeout(t);
  }, [note]);

  const patch = (id: string, p: Partial<BStock & BFlow & BVar>) =>
    setModel((m) => ({
      ...m,
      stocks: m.stocks.map((s) => (s.id === id ? ({ ...s, ...p } as BStock) : s)),
      flows: m.flows.map((f) => (f.id === id ? ({ ...f, ...p } as BFlow) : f)),
      vars: m.vars.map((v) => (v.id === id ? ({ ...v, ...p } as BVar) : v)),
    }));
  const move = (id: string, x: number, y: number) => {
    const c = (v: number, lo: number, hi: number) => Math.round(Math.min(hi, Math.max(lo, v)) / SNAP) * SNAP;
    patch(id, { x: c(x, 30, W - 30), y: c(y, 30, H - 20) });
  };
  const remove = (id: string) => {
    setModel((m) => removeElement(m, id));
    setSel(null);
    boxRef.current?.focus();
  };
  const select = (id: string | null) => {
    setSel(id);
    setAdding(null);
  };

  const addStock = () => {
    const id = newId(model, "s"), [x, y] = freeSpot(model);
    setModel((m) => ({ ...m, stocks: [...m.stocks, { id, name: freshName(m, "Stock"), init: "0", x, y }] }));
    select(id);
    setView("diagram");
  };
  const addVar = () => {
    const id = newId(model, "v"), [x, y] = freeSpot(model, selected ? [selected.x, selected.y + 110] : undefined);
    setModel((m) => ({ ...m, vars: [...m.vars, { id, name: freshName(m, "Variable"), eq: "", x, y }] }));
    select(id);
    setView("diagram");
  };
  const startFlow = () => {
    const s = selected?.kind === "stock" ? selected.id : model.stocks[0]?.id ?? "";
    setAdding({ from: s, to: "" });
    setSel(null);
    setView("diagram");
  };
  const addFlow = (from: string, to: string) => {
    const a = model.stocks.find((s) => s.id === from), b = model.stocks.find((s) => s.id === to);
    if (!a && !b) return;
    const v: P = a && b ? midpoint([[a.x, a.y], [b.x, b.y]]) : a ? [a.x + boxW(a.name) / 2 + 100, a.y] : [b!.x - boxW(b!.name) / 2 - 100, b!.y];
    const id = newId(model, "f");
    setModel((m) => ({ ...m, flows: [...m.flows, { id, name: freshName(m, "Flow"), from: from || undefined, to: to || undefined, eq: "", x: Math.min(W - 30, Math.max(30, v[0])), y: v[1] }] }));
    select(id);
  };
  const loadTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id)!;
    if (elements(model).length && !window.confirm(`Replace your current model with the ${t.label} template? Export it first if you want to keep it.`)) return;
    setModel(template(id));
    setSel(null);
    setAdding(null);
    setRun(null);
    setNote(`Loaded the ${t.label} template.`);
  };

  const toSvg = (e: React.PointerEvent): P => {
    const svg = svgRef.current!, pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return [p.x, p.y];
  };
  const grab = (e: React.PointerEvent, el: Element) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    select(el.id);
    const [x, y] = toSvg(e);
    drag.current = { id: el.id, dx: x - el.x, dy: y - el.y };
    svgRef.current?.setPointerCapture(e.pointerId);
  };
  const elKeys = (e: React.KeyboardEvent, el: Element) => {
    const step = e.shiftKey ? 1 : 10;
    const d: Record<string, P> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (d[e.key]) {
      e.preventDefault();
      move(el.id, el.x + d[e.key][0], el.y + d[e.key][1]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(el.id);
      document.getElementById("bld-name")?.focus();
    }
  };
  const onRootKey = (e: React.KeyboardEvent) => {
    if ((e.key === "Delete" || e.key === "Backspace") && sel && !isTyping(e.target)) {
      e.preventDefault();
      remove(sel);
    } else if (e.key === "Escape" && !isTyping(e.target)) {
      select(null);
    }
  };

  const doRun = () => {
    const res = simulate(model);
    setRun({ model, res });
    if (!res.ok && res.issues[0]?.id) setSel(res.issues[0].id);
  };
  const download = () => {
    try {
      const url = URL.createObjectURL(new Blob([toJSON(model)], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(model.name || "model").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNote("Downloaded the model as JSON.");
    } catch {
      setNote("The download did not start. Copy the equations instead.");
    }
  };
  const exportNotebook = () => {
    try {
      const url = URL.createObjectURL(new Blob([notebookFor(model)], { type: "application/x-ipynb+json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(model.name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "model"}.ipynb`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNote("Downloaded a Python notebook. Open it in Colab (File, Upload notebook) or Jupyter.");
    } catch {
      setNote("The download did not start. Export JSON instead and load it with loopbricks.Model.from_file.");
    }
  };
  const importFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      const m = fromJSON(await f.text());
      setModel(m);
      setSel(null);
      setRun(null);
      setNote(`Imported "${m.name}".`);
    } catch (e) {
      setNote(`Import failed: ${e instanceof Error ? e.message : String(e)}`);
    }
    if (fileRef.current) fileRef.current.value = "";
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(equationsText(model));
      setNote("Copied the equations as text.");
    } catch {
      setView("equations");
      setNote("Copying is blocked here; the Equations view is open so you can select the text.");
    }
  };

  const errCount = (id: string) => (byId.get(id) ?? []).filter((i) => i.level === "error").length;
  const badge = (id: string, x: number, y: number) => {
    const list = byId.get(id);
    if (!list?.length) return null;
    const isErr = list.some((i) => i.level === "error");
    return (
      <g aria-hidden pointerEvents="none">
        <title>{list.map((i) => i.msg).join("\n")}</title>
        <circle cx={x} cy={y} r={8} fill={isErr ? BAD : WARN} stroke={CARD} strokeWidth={1.5} />
        <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff">
          !
        </text>
      </g>
    );
  };
  const ariaFor = (el: Element) => {
    const n = (byId.get(el.id) ?? []).length;
    return `${kindOf(el)} ${el.name || "without a name"}${n ? `, ${n} problem${n > 1 ? "s" : ""}` : ""}`;
  };
  const elProps = (el: Element) => ({
    tabIndex: 0,
    role: "button",
    "aria-label": ariaFor(el),
    "aria-pressed": sel === el.id,
    onPointerDown: (e: React.PointerEvent) => grab(e, el),
    onFocus: () => sel !== el.id && select(el.id),
    onKeyDown: (e: React.KeyboardEvent) => elKeys(e, el),
    style: { touchAction: "none", cursor: "grab", outline: "none" } as React.CSSProperties,
  });
  const stale = run && run.model !== model;

  return (
    <div className={`${wrap} pt-10 md:pt-14 pb-16`} onKeyDown={onRootKey}>
      <p className="flex items-center gap-2 text-[14px] font-semibold text-muted-foreground">
        <Hammer size={17} aria-hidden /> Model builder
      </p>
      <h1 className="display text-[36px] md:text-[52px] max-w-[22ch] mt-2">Build your own stock-and-flow model</h1>
      <p className="mt-5 text-[17px] leading-[1.6] text-foreground/80 max-w-[68ch]">
        Draw the stocks, connect them with flows, add the variables that set the rates, and write an equation for each. The builder checks your model as you go and runs it with Euler
        integration. Your work is saved in this browser.
      </p>

      {/* templates and files */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-[14px] font-semibold mr-1">Start from</span>
        {TEMPLATES.map((t) => (
          <button key={t.id} onClick={() => loadTemplate(t.id)} title={t.blurb} className={btn}>
            {t.label}
          </button>
        ))}
        <span className="hidden sm:block w-px h-7 bg-border mx-1" aria-hidden />
        <button onClick={download} className={btn}>
          <Download size={15} aria-hidden /> Export JSON
        </button>
        <button onClick={exportNotebook} className={btn}>
          <Code2 size={15} aria-hidden /> Export Python notebook
        </button>
        <button onClick={() => fileRef.current?.click()} className={btn}>
          <Upload size={15} aria-hidden /> Import JSON
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-label="Import a model from a JSON file" onChange={(e) => importFile(e.target.files?.[0])} />
        <button onClick={copy} className={btn}>
          <ClipboardCopy size={15} aria-hidden /> Copy equations
        </button>
      </div>
      <p aria-live="polite" className="mt-2 min-h-[20px] text-[13.5px] text-muted-foreground">
        {note}
      </p>

      <div className="mt-2 grid lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
        {/* canvas */}
        <section className="sheet min-w-0" aria-label="Model canvas">
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-[13px] font-semibold mr-auto min-w-0">
              <span className="shrink-0">Model name</span>
              <input value={model.name} onChange={(e) => setModel((m) => ({ ...m, name: e.target.value }))} className={cn(input, "w-[200px] max-w-full")} />
            </label>
            <div className="flex rounded-[8px] border border-border p-0.5 bg-background" role="group" aria-label="View">
              {(["diagram", "equations"] as const).map((v) => (
                <button key={v} aria-pressed={view === v} onClick={() => setView(v)} className={cn("h-8 px-3 rounded-[6px] text-[13px] font-semibold capitalize", view === v ? "bg-card shadow-sm" : "text-muted-foreground")}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={addStock} className={btn}>
              <Box size={15} aria-hidden /> Add stock
            </button>
            <button onClick={startFlow} className={btn} disabled={!model.stocks.length} title={model.stocks.length ? undefined : "Add a stock first"}>
              <Workflow size={15} aria-hidden /> Add flow
            </button>
            <button onClick={addVar} className={btn}>
              <Circle size={15} aria-hidden /> Add variable
            </button>
            <button onClick={() => sel && remove(sel)} className={btn} disabled={!sel} aria-keyshortcuts="Delete">
              <Trash2 size={15} aria-hidden /> Delete
            </button>
          </div>

          {view === "diagram" ? (
            <div
              ref={boxRef}
              tabIndex={-1}
              className="mt-3 overflow-auto rounded-card border border-border bg-card max-h-[70vh] focus:outline-none"
              aria-label="Diagram. Tab to an element to select it; arrow keys move it; Delete removes it."
              role="region"
            >
              <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                className="block w-full min-w-[760px] h-auto select-none"
                onPointerMove={(e) => {
                  const d = drag.current;
                  if (!d) return;
                  const [x, y] = toSvg(e);
                  move(d.id, x - d.dx, y - d.dy);
                }}
                onPointerUp={() => (drag.current = null)}
                onPointerCancel={() => (drag.current = null)}
              >
                <defs>
                  <marker id="bld-info" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                    <path d="M0,0 L9,4 L0,8 Z" fill={INFO} />
                  </marker>
                  <pattern id="bld-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill={GRID} />
                  </pattern>
                </defs>
                <rect width={W} height={H} fill="url(#bld-grid)" onPointerDown={() => select(null)} />
                {!elements(model).length && (
                  <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={15} fill={QUIET}>
                    Empty canvas. Add a stock: what accumulates in your system?
                  </text>
                )}
                {geo.links.map((l) => (
                  <path key={l.key} d={l.d} fill="none" stroke={INFO} strokeWidth={1.4} markerEnd="url(#bld-info)" pointerEvents="none" />
                ))}
                {geo.flows.map(({ f, shape, fromCloud, toCloud }) => (
                  <g key={f.id} pointerEvents="none">
                    {fromCloud && <Cloud at={fromCloud} />}
                    {toCloud && <Cloud at={toCloud} />}
                    <path d={shape.pipe} fill="none" stroke={PIPE} strokeWidth={10} strokeLinejoin="round" />
                    <path d={shape.pipe} fill="none" stroke={CARD} strokeWidth={5} strokeLinejoin="round" />
                    <path d={shape.head} fill={PIPE} />
                  </g>
                ))}
                {model.stocks.map((s) => {
                  const b = geo.boxes[s.id], on = sel === s.id, bad = errCount(s.id) > 0;
                  return (
                    <g key={s.id} {...elProps({ ...s, kind: "stock" })}>
                      {on && <rect x={b.x - b.w / 2 - 5} y={b.y - b.h / 2 - 5} width={b.w + 10} height={b.h + 10} rx={8} fill="hsl(var(--accent) / 0.35)" stroke="hsl(var(--accent-edge))" strokeWidth={2} />}
                      <rect x={b.x - b.w / 2} y={b.y - b.h / 2} width={b.w} height={b.h} rx={4} fill={CARD} stroke={bad ? BAD : INK} strokeWidth={1.8} />
                      <text x={b.x} y={b.y} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600} fill={INK}>
                        {s.name || "(no name)"}
                      </text>
                      {badge(s.id, b.x + b.w / 2, b.y - b.h / 2)}
                    </g>
                  );
                })}
                {model.flows.map((f) => {
                  const on = sel === f.id;
                  return (
                    <g key={f.id} {...elProps({ ...f, kind: "flow" })}>
                      <circle cx={f.x} cy={f.y - 4} r={on ? 20 : 18} fill={on ? "hsl(var(--accent) / 0.35)" : "transparent"} stroke={on ? "hsl(var(--accent-edge))" : "none"} strokeWidth={2} />
                      <path d={`M ${f.x} ${f.y} L ${f.x} ${f.y - 15} M ${f.x - 5} ${f.y - 15} L ${f.x + 5} ${f.y - 15}`} stroke={PIPE} strokeWidth={1.8} strokeLinecap="round" />
                      <path d={valvePath(f.x, f.y, 9)} fill={CARD} stroke={errCount(f.id) ? BAD : PIPE} strokeWidth={1.8} strokeLinejoin="round" />
                      <text x={f.x} y={f.y - 24} textAnchor="middle" fontSize={12} fontStyle="italic" fill={INK}>
                        {f.name || "(no name)"}
                      </text>
                      {badge(f.id, f.x + 14, f.y - 12)}
                    </g>
                  );
                })}
                {model.vars.map((v) => {
                  const on = sel === v.id, k = isConstant(v);
                  return (
                    <g key={v.id} {...elProps({ ...v, kind: "var" })}>
                      <circle cx={v.x} cy={v.y + 6} r={on ? 22 : 18} fill={on ? "hsl(var(--accent) / 0.35)" : "transparent"} stroke={on ? "hsl(var(--accent-edge))" : "none"} strokeWidth={2} />
                      <circle cx={v.x} cy={v.y} r={k ? 4.5 : 6.5} fill={k ? INFO : CARD} stroke={errCount(v.id) ? BAD : INFO} strokeWidth={1.4} />
                      <text x={v.x} y={v.y + 20} textAnchor="middle" fontSize={11.5} fill={INK}>
                        {v.name || "(no name)"}
                      </text>
                      {k && (
                        <text x={v.x} y={v.y + 33} textAnchor="middle" fontSize={10.5} fill={QUIET}>
                          = {v.eq.trim()}
                        </text>
                      )}
                      {badge(v.id, v.x + 10, v.y - 9)}
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <EquationsView model={model} onSelect={(id) => (select(id), setView("diagram"))} byId={byId} />
          )}
          <p className="mt-2 text-[12.5px] text-muted-foreground">
            Drag to move. Click or Tab to select; arrow keys nudge, Delete removes. Thin arrows are drawn for you from every name an equation uses. A small filled dot is a constant.
          </p>
          <ChecksList issues={chk.issues} model={model} onSelect={(id) => (select(id), setView("diagram"))} />
        </section>

        {/* side panel */}
        <aside className="sheet min-w-0 lg:sticky lg:top-24" aria-label="Edit the selected element">
          {adding ? (
            <AddFlow model={model} value={adding} onChange={setAdding} onAdd={() => addFlow(adding.from, adding.to)} onCancel={() => setAdding(null)} />
          ) : selected ? (
            <Inspector key={selected.id} el={selected} model={model} issues={byId.get(selected.id) ?? []} onPatch={(p) => patch(selected.id, p)} onRename={(n) => setModel((m) => renameElement(m, selected.id, n))} onDelete={() => remove(selected.id)} />
          ) : (
            <div>
              <h2 className="heading text-[18px]">Nothing selected</h2>
              <p className="mt-2 text-[14px] leading-[1.6] text-foreground/80">Select an element on the canvas to edit its name, equation and units, or add a new one with the buttons above the canvas.</p>
              <p className="mt-3 text-[13.5px] text-muted-foreground">
                {plural(model.stocks.length, "stock")}, {plural(model.flows.length, "flow")}, {plural(model.vars.length, "variable")}.
              </p>
            </div>
          )}
        </aside>
      </div>

      <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
        {/* run */}
        <section className="sheet min-w-0" aria-labelledby="bld-run">
          <h2 id="bld-run" className="heading text-[20px]">
            Run
          </h2>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="text-[13px] font-semibold flex flex-col">
              Stop time
              <input type="number" min={0} step="any" value={Number.isFinite(model.T) ? model.T : ""} onChange={(e) => setModel((m) => ({ ...m, T: e.target.value === "" ? NaN : +e.target.value }))} className={cn(input, "mt-1 w-[110px]")} />
            </label>
            <label className="text-[13px] font-semibold flex flex-col">
              Time step (dt)
              <input type="number" min={0} step="any" value={Number.isFinite(model.dt) ? model.dt : ""} onChange={(e) => setModel((m) => ({ ...m, dt: e.target.value === "" ? NaN : +e.target.value }))} className={cn(input, "mt-1 w-[110px]")} />
            </label>
            <label className="text-[13px] font-semibold flex flex-col">
              Time unit
              <input value={model.timeUnit} onChange={(e) => setModel((m) => ({ ...m, timeUnit: e.target.value }))} className={cn(input, "mt-1 w-[130px]")} placeholder="week" />
            </label>
            <button onClick={doRun} className="brick brick-y h-10 px-5 text-[14px] font-semibold inline-flex items-center gap-2" aria-describedby="bld-run-state">
              <Play size={16} aria-hidden /> Run
            </button>
            <span id="bld-run-state" className="text-[13px] text-muted-foreground pb-2">
              {errors.length ? `${errors.length} problem${errors.length > 1 ? "s" : ""} to fix before it can run` : "Ready to run"}
            </span>
          </div>
          <div aria-live="polite">
            {run && !run.res.ok && (
              <div className="mt-4 rounded-[8px] border border-[var(--viz-pink)] bg-[color-mix(in_srgb,var(--viz-pink)_7%,transparent)] px-4 py-3">
                <p className="font-semibold text-[14px] flex items-center gap-2">
                  <AlertCircle size={16} aria-hidden className="text-[var(--viz-pink)]" />
                  {run.res.issues.length === 1 && run.res.issues[0].msg.includes("gave") ? "The run stopped part way" : `Not ready to run yet: fix ${run.res.issues.length === 1 ? "this problem" : `these ${run.res.issues.length} problems`} first`}
                </p>
                <IssueItems issues={run.res.issues} model={run.model} onSelect={(id) => (select(id), setView("diagram"))} />
              </div>
            )}
            {run?.res.ok && (
              <>
                {stale && <p className="mt-3 text-[13px] rounded-[8px] bg-accent/25 px-3 py-2">You have changed the model since this run. Run again to see the effect.</p>}
                <Results model={run.model} res={run.res} />
              </>
            )}
            {!run && <p className="mt-4 text-[14px] text-muted-foreground">Press Run to simulate the model. Each stock is plotted over time.</p>}
          </div>
        </section>

        <HowTo onOpen={onOpen} />
      </div>
    </div>
  );
}

// ===================================================================================================
function IssueItems({ issues, model, onSelect }: { issues: Issue[]; model: BModel; onSelect: (id: string) => void }) {
  return (
    <ul className="mt-2 grid gap-1.5">
      {issues.map((i, k) => {
        const el = findElement(model, i.id);
        const Icon = i.level === "error" ? AlertCircle : AlertTriangle;
        const body = (
          <>
            <Icon size={15} aria-hidden className={cn("shrink-0 mt-0.5", i.level === "error" ? "text-[var(--viz-pink)]" : "text-accent-edge")} />
            <span>
              {el ? <b>{el.name || `(unnamed ${KIND_LABEL[el.kind].toLowerCase()})`}: </b> : i.field === "settings" ? <b>Settings: </b> : null}
              {i.msg}
            </span>
          </>
        );
        return (
          <li key={k}>
            {el ? (
              <button onClick={() => onSelect(el.id)} className="flex gap-2 text-left text-[13.5px] leading-[1.45] hover:underline">
                {body}
              </button>
            ) : (
              <span className="flex gap-2 text-[13.5px] leading-[1.45]">{body}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ChecksList({ issues, model, onSelect }: { issues: Issue[]; model: BModel; onSelect: (id: string) => void }) {
  const sorted = [...issues].sort((a, b) => (a.level === b.level ? 0 : a.level === "error" ? -1 : 1));
  const ne = issues.filter((i) => i.level === "error").length, nw = issues.length - ne;
  return (
    <div className="mt-4 border-t border-border pt-3" aria-live="polite">
      <h3 className="heading text-[15px]">
        Checks{" "}
        <span className="font-normal text-[13px] text-muted-foreground">
          {issues.length ? `${ne} error${ne === 1 ? "" : "s"}, ${nw} warning${nw === 1 ? "" : "s"}` : "no problems found"}
        </span>
      </h3>
      {issues.length > 0 && <IssueItems issues={sorted} model={model} onSelect={onSelect} />}
    </div>
  );
}

// ===================================================================================================
function NameField({ el, onRename, invalid }: { el: Element; onRename: (n: string) => void; invalid: boolean }) {
  const [draft, setDraft] = useState(el.name);
  useEffect(() => setDraft(el.name), [el.name]);
  const commit = () => draft !== el.name && onRename(draft);
  return (
    <label className="block text-[13px] font-semibold">
      Name
      <input
        id="bld-name"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        aria-invalid={invalid}
        aria-describedby="bld-el-issues"
        className={cn(input, "mt-1", invalid && "border-[var(--viz-pink)]")}
      />
      <span className="block mt-1 font-normal text-[12px] text-muted-foreground">
        In equations write <code className={mono}>{refName(el.name || "name")}</code>. Renaming updates the equations that use it.
      </span>
    </label>
  );
}

function Inspector({
  el,
  model,
  issues,
  onPatch,
  onRename,
  onDelete,
}: {
  el: Element;
  model: BModel;
  issues: Issue[];
  onPatch: (p: Partial<BStock & BFlow & BVar>) => void;
  onRename: (n: string) => void;
  onDelete: () => void;
}) {
  const has = (f: string) => issues.some((i) => i.field === f && i.level === "error");
  const exprField = el.kind === "stock" ? "init" : "eq";
  const exprVal = el.kind === "stock" ? el.init : el.eq;
  const others = elements(model).filter((e) => e.id !== el.id && e.name.trim());
  const stockOpts = model.stocks.map((s) => (
    <option key={s.id} value={s.id}>
      {s.name || "(no name)"}
    </option>
  ));
  const stockUnits = (id?: string) => model.stocks.find((s) => s.id === id)?.units;
  const unitHint = el.kind === "flow" ? stockUnits(el.to) ?? stockUnits(el.from) : undefined;
  const net = el.kind === "stock" ? [...inflows(model, el.id).map((f) => refName(f.name)), ...outflows(model, el.id).map((f) => "- " + refName(f.name))].join(" + ").replace(/\+ - /g, "- ") : "";
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">{kindOf(el)}</p>
          <h2 className="heading text-[18px] break-words">{el.name || "(no name)"}</h2>
        </div>
        <button onClick={onDelete} className={btn} aria-label={`Delete ${el.name}`}>
          <Trash2 size={15} aria-hidden /> Delete
        </button>
      </div>
      <div className="mt-3 grid gap-3">
        <NameField el={el} onRename={onRename} invalid={has("name")} />
        {el.kind === "flow" && (
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[13px] font-semibold min-w-0">
              From
              <select value={el.from ?? ""} onChange={(e) => onPatch({ from: e.target.value || undefined })} className={cn(input, "mt-1")} aria-invalid={has("from")}>
                <option value="">Cloud (outside)</option>
                {stockOpts}
              </select>
            </label>
            <label className="text-[13px] font-semibold min-w-0">
              To
              <select value={el.to ?? ""} onChange={(e) => onPatch({ to: e.target.value || undefined })} className={cn(input, "mt-1")} aria-invalid={has("to")}>
                <option value="">Cloud (outside)</option>
                {stockOpts}
              </select>
            </label>
          </div>
        )}
        <label className="block text-[13px] font-semibold">
          {el.kind === "stock" ? "Initial value" : el.kind === "flow" ? "Equation (a rate per time unit)" : "Equation, or a number for a constant"}
          <textarea
            value={exprVal}
            rows={el.kind === "stock" ? 1 : 3}
            spellCheck={false}
            onChange={(e) => onPatch({ [exprField]: e.target.value })}
            aria-invalid={has(exprField)}
            aria-describedby="bld-el-issues"
            className={cn(input, mono, "mt-1 h-auto py-2 leading-[1.5] resize-y", has(exprField) && "border-[var(--viz-pink)]")}
          />
        </label>
        {others.length > 0 && (
          <div>
            <p className="text-[12px] text-muted-foreground">Insert a name</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {others.map((o) => (
                <button
                  key={o.id}
                  onClick={() => onPatch({ [exprField]: (exprVal.trim() ? exprVal.replace(/\s*$/, " ") : "") + refName(o.name) })}
                  className="rounded-[6px] border border-border bg-background px-1.5 py-0.5 text-[12px] font-mono hover:border-foreground/40"
                >
                  {refName(o.name)}
                </button>
              ))}
            </div>
          </div>
        )}
        {el.kind === "stock" && (
          <p className="rounded-[8px] bg-background px-3 py-2 text-[13px] leading-[1.5]">
            <code className={mono}>
              {refName(el.name)} = INTEG({net || "0"}, {el.init.trim() || "?"})
            </code>
            <span className="block mt-1 text-muted-foreground">A stock changes only through its flows: each time step it adds dt × (inflows − outflows).</span>
          </p>
        )}
        <label className="block text-[13px] font-semibold">
          Units
          <input
            value={el.units ?? ""}
            onChange={(e) => onPatch({ units: e.target.value || undefined })}
            placeholder={el.kind === "flow" && unitHint && model.timeUnit ? `${unitHint}/${model.timeUnit}` : el.kind === "stock" ? "people, litres, units" : "optional"}
            className={cn(input, "mt-1")}
          />
        </label>
        <div id="bld-el-issues" aria-live="polite">
          {issues.length > 0 && <IssueItems issues={issues} model={model} onSelect={() => {}} />}
        </div>
      </div>
    </div>
  );
}

function AddFlow({ model, value, onChange, onAdd, onCancel }: { model: BModel; value: { from: string; to: string }; onChange: (v: { from: string; to: string }) => void; onAdd: () => void; onCancel: () => void }) {
  const problem = !value.from && !value.to ? "Pick a stock for at least one end. A cloud is allowed at one end, not both." : value.from === value.to ? "Choose two different ends." : "";
  const opts = (
    <>
      <option value="">Cloud (outside the model)</option>
      {model.stocks.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name || "(no name)"}
        </option>
      ))}
    </>
  );
  return (
    <div>
      <h2 className="heading text-[18px]">Add a flow</h2>
      <p className="mt-1 text-[13.5px] text-foreground/80">A flow drains the stock it comes from and fills the one it goes to. A cloud stands for a source or sink outside the model.</p>
      <div className="mt-3 grid gap-3">
        <label className="text-[13px] font-semibold">
          From
          <select autoFocus value={value.from} onChange={(e) => onChange({ ...value, from: e.target.value })} className={cn(input, "mt-1")}>
            {opts}
          </select>
        </label>
        <label className="text-[13px] font-semibold">
          To
          <select value={value.to} onChange={(e) => onChange({ ...value, to: e.target.value })} className={cn(input, "mt-1")}>
            {opts}
          </select>
        </label>
        {problem && <p className="text-[13px] text-[var(--viz-pink)]">{problem}</p>}
        <div className="flex gap-2">
          <button onClick={onAdd} disabled={!!problem} className="brick brick-y h-9 px-4 text-[13px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-50">
            <Plus size={15} aria-hidden /> Add flow
          </button>
          <button onClick={onCancel} className={btn}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================================================================================================
function EquationsView({ model, onSelect, byId }: { model: BModel; onSelect: (id: string) => void; byId: Map<string, Issue[]> }) {
  const groups = equationGroups(model);
  const ids = [model.stocks.map((s) => s.id), model.flows.map((f) => f.id), model.vars.map((v) => v.id), []];
  const titles = ["Stocks", "Flows", "Auxiliaries and constants", "Settings"];
  return (
    <div className="mt-3 rounded-card border border-border bg-card p-4 overflow-x-auto">
      <p className="text-[13px] text-muted-foreground flex items-center gap-1.5">
        <FileText size={14} aria-hidden /> Every equation, with stocks in INTEG form: INTEG(net flow, initial value). Names with spaces are written with underscores.
      </p>
      {groups.map((g) => {
        const gi = titles.indexOf(g.title);
        return (
          <div key={g.title} className="mt-4">
            <h3 className="heading text-[14px]">{g.title}</h3>
            <ul className="mt-1.5 grid gap-1">
              {g.lines.map((l, k) => {
                const id = ids[gi]?.[k];
                const bad = id && (byId.get(id) ?? []).some((i) => i.level === "error");
                return (
                  <li key={k} className={cn(mono, "whitespace-pre-wrap break-words leading-[1.6]")}>
                    {id ? (
                      <button onClick={() => onSelect(id)} className={cn("text-left hover:underline", bad && "text-[var(--viz-pink)]")}>
                        {l}
                        {bad && <span className="sr-only"> (has an error)</span>}
                      </button>
                    ) : (
                      l
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// ===================================================================================================
function Results({ model, res }: { model: BModel; res: RunResult }) {
  const lines = model.stocks.map((s, i) => ({ s, ys: res.values[s.id], color: SERIES[i % SERIES.length] }));
  if (!lines.length) return <p className="mt-4 text-[14px] text-muted-foreground">The run worked, but there are no stocks to plot. Add a stock.</p>;
  const all = lines.flatMap((l) => l.ys);
  const lo = Math.min(0, ...all), hi = Math.max(...all, lo + 1e-9);
  const CW = 560, CH = 240, L = 48, B = 24;
  const t0 = res.times[0], t1 = res.times[res.times.length - 1];
  const x = (t: number) => L + ((t - t0) / (t1 - t0 || 1)) * (CW - L - 10);
  const y = (v: number) => 8 + (1 - (v - lo) / (hi - lo)) * (CH - B - 8);
  const rows = [0, 0.25, 0.5, 0.75, 1].map((q) => {
    const target = t0 + (t1 - t0) * q;
    let best = 0;
    res.times.forEach((t, j) => Math.abs(t - target) < Math.abs(res.times[best] - target) && (best = j));
    return best;
  });
  return (
    <div className="mt-4 grid xl:grid-cols-[minmax(0,1fr)_minmax(0,300px)] gap-5 items-start">
      <div className="min-w-0">
        <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full h-auto" role="img" aria-label={`${model.name}: ${lines.map((l) => l.s.name).join(", ")} over ${t1} ${model.timeUnit}`}>
          {[lo, (lo + hi) / 2, hi].map((v) => (
            <g key={v}>
              <line x1={L} x2={CW - 10} y1={y(v)} y2={y(v)} stroke={GRID} />
              <text x={L - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill={QUIET}>
                {fmt(v)}
              </text>
            </g>
          ))}
          {[t0, (t0 + t1) / 2, t1].map((t, k) => (
            <text key={k} x={x(t)} y={CH - 6} textAnchor={k === 0 ? "start" : k === 2 ? "end" : "middle"} fontSize="11" fill={QUIET}>
              {fmt(t)}
              {k === 2 ? ` ${model.timeUnit}` : ""}
            </text>
          ))}
          {lines.map(({ s, ys, color }) => (
            <polyline key={s.id} fill="none" stroke={color} strokeWidth="2.25" strokeLinejoin="round" points={ys.map((v, j) => `${x(res.times[j]).toFixed(1)},${y(v).toFixed(1)}`).join(" ")} />
          ))}
        </svg>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
          {lines.map(({ s, color }) => (
            <span key={s.id} className="flex items-center gap-1.5">
              <span aria-hidden className="inline-block w-4 h-[3px] rounded" style={{ background: color }} />
              {s.name}
              {s.units ? <span className="text-muted-foreground">({s.units})</span> : null}
            </span>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto min-w-0">
        <table className="w-full text-[13px] tabular-nums">
          <caption className="text-left text-[12.5px] text-muted-foreground pb-1">Stock values at five times</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="text-left font-semibold py-1 pr-3">
                Time
              </th>
              {lines.map(({ s }) => (
                <th key={s.id} scope="col" className="text-right font-semibold py-1 pl-3">
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((j) => (
              <tr key={j} className="border-b border-border/60">
                <th scope="row" className="text-left font-normal py-1 pr-3">
                  {fmt(res.times[j])}
                </th>
                {lines.map(({ s, ys }) => (
                  <td key={s.id} className="text-right py-1 pl-3">
                    {fmt(ys[j])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===================================================================================================
function HowTo({ onOpen }: { onOpen: (hash: string) => void }) {
  const steps: [string, string][] = [
    ["Find the stocks", "What accumulates? Inventory, people, water, money. Each is a box, measured at a point in time."],
    ["Add the flows", "What fills and drains each stock? A flow is a rate per time unit. Use a cloud where it comes from or goes to outside the model."],
    ["Add the variables", "Constants (a number) and auxiliaries (a rule, such as Water / drain_time) set the rates."],
    ["Write the equations", "Refer to other elements by name, with underscores for spaces. The arrows appear as you type."],
    ["Check and run", "Fix the errors, look at the unit warnings, then run. Does the behaviour match what you expected, and why?"],
  ];
  return (
    <aside className="sheet min-w-0" aria-labelledby="bld-how">
      <h2 id="bld-how" className="heading text-[18px]">
        How to build a model
      </h2>
      <ol className="mt-3 grid gap-3">
        {steps.map(([t, d], i) => (
          <li key={t} className="grid grid-cols-[22px_minmax(0,1fr)] gap-x-2">
            <span className="text-[13px] font-bold text-accent-edge tabular-nums">{i + 1}</span>
            <span>
              <span className="block heading text-[14.5px]">{t}</span>
              <span className="block mt-0.5 text-[13px] leading-[1.5] text-foreground/80">{d}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[12.5px] text-muted-foreground leading-[1.5]">
        Functions: MIN, MAX, ABS, EXP, LN, SQRT, IF(condition, then, else), STEP(height, time), PULSE(height, start, width), RAMP(slope, start), TABLE(input, x1, y1, x2, y2, ...) for a lookup through points (straight lines between them, flat beyond the ends) and TIME. Compare with &lt; &lt;= &gt; &gt;= = &lt;&gt;.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => onOpen("/learn/stocks-flows")} className={btn}>
          Learn: stocks and flows
        </button>
        <button onClick={() => onOpen("/methods/stocks-flows")} className={btn}>
          Method guide
        </button>
      </div>
    </aside>
  );
}
