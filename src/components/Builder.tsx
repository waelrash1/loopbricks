import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Box,
  ChevronDown,
  Circle,
  ClipboardCopy,
  Code2,
  Copy,
  Download,
  FileText,
  Keyboard,
  Layers,
  Maximize,
  Minimize,
  MoveUpRight,
  Play,
  Plus,
  Redo2,
  Scan,
  Trash2,
  Undo2,
  Upload,
  Workflow,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
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
  type BDim,
  type BFlow,
  type BModel,
  type BStock,
  type BVar,
  type Element,
  type Issue,
  type RunResult,
  series,
} from "@/lib/builder";
import { markdownDoc, notebook, pysdNotebook, pysdScript, pythonScript, requirementsTxt, resultsCsv, slug as slugOf, xmile } from "@/lib/exports";
import { refName } from "@/lib/expr";
import { endDirs, flowShape, midpoint, shortenQ, valvePath } from "@/lib/flowGeom";
import { cn } from "@/lib/utils";

// The model builder: draw stocks, flows and variables, write their equations, check them and run.
// Notation follows SfDiagram: boxes, double-line pipes with a valve and a solid head, clouds at open ends, thin information arrows.
type P = [number, number];
type VB = { x: number; y: number; w: number; h: number }; // the part of model space the canvas shows
const W = 1000, H = 480, BOX_H = 56, CLOUD_GAP = 70, SNAP = 5, HISTORY = 100, MIN_W = 240, MAX_W = 5000;
const HOME: VB = { x: 0, y: 0, w: W, h: H };
const PIPE = "var(--viz-acc)", INFO = "var(--viz-info)", BAD = "var(--viz-pink)", WARN = "hsl(var(--accent-edge))";
const INK = "hsl(var(--foreground))", CARD = "hsl(var(--card))", QUIET = "hsl(var(--muted-foreground))", GRID = "hsl(var(--border))";
const SERIES = ["var(--viz-acc)", "var(--viz-acc2)", "var(--viz-good)", "var(--viz-pink)", "var(--viz-info)", "hsl(var(--accent-edge))"];
const CLOUD_D = "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z";
const wrap = "max-w-[1320px] mx-auto px-4 md:px-8";
const input = "w-full h-9 rounded-[8px] border border-input bg-card px-2.5 text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const mono = "font-mono text-[13px]";
const btn = "brick brick-w h-9 px-3 text-[13px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-50";
const ibtn = "brick brick-w h-9 w-9 inline-flex items-center justify-center disabled:opacity-50";
const summaryCls = "list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none";
const popover = "absolute max-sm:left-0 max-sm:right-0 max-sm:w-auto max-sm:max-w-none z-40 mt-2 rounded-[10px] border border-border bg-card p-2 shadow-[0_8px_24px_hsl(var(--foreground)/0.14)]";
const DIM_RE = /^[\p{L}_][\p{L}\p{N}_]*$/u;

const boxW = (name: string) => Math.max(104, Math.min(230, name.length * 7.6 + 28));
// the name as drawn: an arrayed element shows its dimension, Population[Region]
const labelOf = (e: { name: string; dim?: string }) => (e.name || "(no name)") + (e.dim ? `[${e.dim}]` : "");
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
const errText = (e: unknown) => (e instanceof Error ? e.message : String(e));
const linkKey = (from: string, to: string) => `${from}>${to}`;

type Any = BStock | BFlow | BVar;
const mapAll = (m: BModel, f: (e: Any) => Any): BModel => ({ ...m, stocks: m.stocks.map((s) => f(s) as BStock), flows: m.flows.map((x) => f(x) as BFlow), vars: m.vars.map((v) => f(v) as BVar) });
const dropLinks = (m: BModel, id: string): BModel => (m.links?.some((l) => l.from === id || l.to === id) ? { ...m, links: m.links.filter((l) => l.from !== id && l.to !== id) } : m);

function Cloud({ at }: { at: P }) {
  const s = 2.2;
  return <path d={CLOUD_D} transform={`translate(${at[0] - 12 * s}, ${at[1] - 11 * s}) scale(${s})`} fill={CARD} stroke="hsl(var(--input))" strokeWidth={1} strokeLinejoin="round" />;
}

type LinkG = { key: string; from: string; to: string; d: string; drawn: boolean; used: boolean };
function geometry(m: BModel, refsOf: (id: string) => string[], byKey: Map<string, Element>) {
  const boxes: Record<string, Bx> = Object.fromEntries(m.stocks.map((s) => [s.id, { x: s.x, y: s.y, w: boxW(labelOf(s)), h: BOX_H }]));
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
  // a gently curved arrow from one element to another; its curvature is fixed
  const path = (src: Element, c: Element): string | null => {
    const a: P = [src.x, src.y], b: P = [c.x, c.y];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 1) return null;
    const [ux, uy] = unit(a, b), bend = src.kind === "stock" ? Math.min(40, len * 0.3) : Math.min(28, len * 0.14);
    const cp: P = [(a[0] + b[0]) / 2 - uy * bend, (a[1] + b[1]) / 2 + ux * bend];
    const s = src.kind === "stock" ? edge(boxes[src.id], cp[0], cp[1]) : shortenQ(cp[0], cp[1], a[0], a[1], src.kind === "flow" ? 14 : 9);
    const e = c.kind === "stock" ? edge(boxes[c.id], cp[0], cp[1]) : shortenQ(cp[0], cp[1], b[0], b[1], c.kind === "flow" ? 15 : 10);
    return `M ${s[0]} ${s[1]} Q ${cp[0]} ${cp[1]} ${e[0]} ${e[1]}`;
  };
  const usedBy = (to: string) => new Set(refsOf(to).map((r) => byKey.get(r)?.id));
  // information links: from every name an equation uses to the element that uses it, then the ones the modeller drew
  const links = new Map<string, LinkG>();
  const els = new Map(elements(m).map((e) => [e.id, e]));
  for (const c of els.values()) {
    if (c.kind === "stock") continue;
    for (const r of refsOf(c.id)) {
      const src = byKey.get(r);
      if (!src || src.id === c.id || links.has(linkKey(src.id, c.id))) continue;
      const d = path(src, c);
      if (d) links.set(linkKey(src.id, c.id), { key: linkKey(src.id, c.id), from: src.id, to: c.id, d, drawn: false, used: true });
    }
  }
  for (const l of m.links ?? []) {
    const src = els.get(l.from), c = els.get(l.to), have = links.get(linkKey(l.from, l.to));
    if (!src || !c || src.id === c.id) continue;
    if (have) have.drawn = true;
    else {
      const d = path(src, c);
      if (d) links.set(linkKey(l.from, l.to), { key: linkKey(l.from, l.to), from: l.from, to: l.to, d, drawn: true, used: usedBy(l.to).has(l.from) });
    }
  }
  return { boxes, flows, links: [...links.values()] };
}

// the area the drawn model covers, roughly, labels and clouds included
function bounds(m: BModel): VB | null {
  const els = elements(m);
  if (!els.length) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (x: number, y: number, rx: number, ry: number) => ((x0 = Math.min(x0, x - rx)), (x1 = Math.max(x1, x + rx)), (y0 = Math.min(y0, y - ry)), (y1 = Math.max(y1, y + ry)));
  for (const e of els) {
    if (e.kind === "stock") add(e.x, e.y, boxW(labelOf(e)) / 2 + 8, BOX_H / 2 + 8);
    else if (e.kind === "flow") add(e.x, e.y, e.from && e.to ? 60 : CLOUD_GAP + 50, e.from && e.to ? 40 : CLOUD_GAP + 30);
    else add(e.x, e.y, Math.max(40, labelOf(e).length * 3.6 + 10), 42);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
// a view of the canvas's shape around a box, never zoomed in past 167%
function fitBox(b: VB | null, pad = 30): VB {
  if (!b) return HOME;
  let w = Math.max(b.w + pad * 2, 600), h = Math.max(b.h + pad * 2, (600 * H) / W);
  if (w / h > W / H) h = (w * H) / W;
  else w = (h * W) / H;
  return { x: b.x + b.w / 2 - w / 2, y: b.y + b.h / 2 - h / 2, w, h };
}
// the home view when the model fits in it, otherwise a view that fits the model
const viewFor = (m: BModel): VB => {
  const b = bounds(m);
  return !b || (b.x >= 0 && b.y >= 0 && b.x + b.w <= W && b.y + b.h <= H) ? HOME : fitBox(b);
};

// a free spot in the visible part of the canvas, near a preferred point if one is given
function freeSpot(m: BModel, vb: VB, prefer?: P): P {
  const taken = elements(m).map((e) => [e.x, e.y] as P);
  const ok = (p: P) => p[0] > vb.x + 60 && p[0] < vb.x + vb.w - 60 && p[1] > vb.y + 50 && p[1] < vb.y + vb.h - 40 && taken.every((t) => Math.hypot(t[0] - p[0], t[1] - p[1]) > 95);
  const cands: P[] = [];
  if (prefer) for (const [dx, dy] of [[0, 0], [0, 110], [0, -110], [140, 0], [-140, 0], [140, 110], [-140, 110]]) cands.push([prefer[0] + dx, prefer[1] + dy]);
  for (let y = vb.y + 100; y < vb.y + vb.h - 40; y += 110) for (let x = vb.x + 140; x < vb.x + vb.w - 60; x += 150) cands.push([x, y]);
  const p = cands.find(ok) ?? [vb.x + vb.w / 2 + (taken.length % 5) * 12, vb.y + vb.h / 2 + (taken.length % 5) * 12];
  return [Math.round(p[0] / SNAP) * SNAP, Math.round(p[1] / SNAP) * SNAP];
}

const KIND_LABEL = { stock: "Stock", flow: "Flow", var: "Variable" } as const;
const kindOf = (e: Element) => (e.kind === "var" ? (isConstant(e) ? "Constant" : "Auxiliary") : KIND_LABEL[e.kind]);

type ExportKind = "py" | "req" | "ipynb" | "python" | "pysd" | "pysdnb" | "json" | "xmile" | "csv" | "md" | "svg";

// ===================================================================================================
export function ModelBuilder({ onOpen }: { onOpen: (hash: string) => void }) {
  const [model, setModel] = useState<BModel>(() => loadModel() ?? template("bathtub"));
  const [sel, setSel] = useState<string | null>(null); // an element id, or "link:from>to"
  const [view, setView] = useState<"diagram" | "equations" | "python">("diagram");
  const [adding, setAdding] = useState<{ from: string; to: string } | null>(null);
  const [linking, setLinking] = useState<{ from: string | null } | null>(null);
  const [rubber, setRubber] = useState<P | null>(null);
  const [run, setRun] = useState<{ model: BModel; res: RunResult } | null>(null);
  const [note, setNote] = useState("");
  const [vb, setVb] = useState<VB>(() => viewFor(model));
  const [full, setFull] = useState<"native" | "overlay" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number; tag: string } | null>(null);
  const pan = useRef<{ cx: number; cy: number; vb: VB; k: number; moved: boolean } | null>(null);
  const spaceRef = useRef(false);

  // undo history: every change goes through update(); edits with the same tag close together (typing, a drag) are one step
  const modelRef = useRef(model);
  modelRef.current = model;
  const hist = useRef<{ past: BModel[]; future: BModel[]; tag?: string; at: number }>({ past: [], future: [], at: 0 });
  const update = (fn: (m: BModel) => BModel, tag?: string) => {
    const m = modelRef.current, next = fn(m);
    if (next === m) return;
    const h = hist.current, now = Date.now();
    const group = tag && tag === h.tag && (tag.startsWith("drag:") || now - h.at < 1200);
    if (!group) h.past = [...h.past, m].slice(-HISTORY);
    h.future = [];
    h.tag = tag;
    h.at = now;
    modelRef.current = next;
    setModel(next);
  };
  const step = (back: boolean) => {
    const h = hist.current, from = back ? h.past : h.future, to = back ? h.future : h.past;
    const m = from.pop();
    if (!m) return;
    to.push(modelRef.current);
    h.tag = undefined;
    modelRef.current = m;
    setModel(m);
    setNote(back ? "Undone." : "Redone.");
  };
  const undo = () => step(true), redo = () => step(false);

  const chk = useMemo(() => validate(model), [model]);
  const errors = chk.issues.filter((i) => i.level === "error");
  const byId = useMemo(() => {
    const out = new Map<string, Issue[]>();
    chk.issues.forEach((i) => i.id && out.set(i.id, [...(out.get(i.id) ?? []), i]));
    return out;
  }, [chk]);
  const geo = useMemo(() => geometry(model, (id) => chk.code.get(id)?.refs ?? [], chk.byKey), [model, chk]);
  const selected = findElement(model, sel);
  const selLink = sel?.startsWith("link:") ? geo.links.find((l) => l.drawn && "link:" + l.key === sel) : undefined;
  const slug = slugOf(model);
  const dims = model.dims ?? [];

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

  const patch = (id: string, p: Partial<BStock & BFlow & BVar>, tag = `patch:${id}:${Object.keys(p).join(",")}`) =>
    update(
      (m) => ({
        ...m,
        stocks: m.stocks.map((s) => (s.id === id ? ({ ...s, ...p } as BStock) : s)),
        flows: m.flows.map((f) => (f.id === id ? ({ ...f, ...p } as BFlow) : f)),
        vars: m.vars.map((v) => (v.id === id ? ({ ...v, ...p } as BVar) : v)),
      }),
      tag,
    );
  const move = (id: string, x: number, y: number, tag = `nudge:${id}`) => {
    const c = (v: number, lo: number, hi: number) => Math.round(Math.min(hi, Math.max(lo, v)) / SNAP) * SNAP;
    const el = findElement(modelRef.current, id), nx = c(x, 10, 4000), ny = c(y, 10, 3000);
    if (el && (el.x !== nx || el.y !== ny)) patch(id, { x: nx, y: ny }, tag);
  };
  const select = (id: string | null) => {
    setSel(id);
    setAdding(null);
    setLinking(null);
    setRubber(null);
  };
  const remove = (id: string) => {
    if (id.startsWith("link:")) {
      const l = geo.links.find((x) => "link:" + x.key === id);
      update((m) => ({ ...m, links: (m.links ?? []).filter((x) => "link:" + linkKey(x.from, x.to) !== id) }));
      setNote(l && l.used ? "Removed the drawn link. The arrow stays while the equation uses that name." : "Removed the link.");
    } else update((m) => dropLinks(removeElement(m, id), id));
    setSel(null);
    boxRef.current?.focus();
  };

  const addStock = () => {
    const id = newId(model, "s"), [x, y] = freeSpot(model, vb);
    update((m) => ({ ...m, stocks: [...m.stocks, { id, name: freshName(m, "Stock"), init: "0", x, y }] }));
    select(id);
    setView("diagram");
  };
  const addVar = () => {
    const id = newId(model, "v"), [x, y] = freeSpot(model, vb, selected ? [selected.x, selected.y + 110] : undefined);
    update((m) => ({ ...m, vars: [...m.vars, { id, name: freshName(m, "Variable"), eq: "", x, y }] }));
    select(id);
    setView("diagram");
  };
  const startFlow = () => {
    const s = selected?.kind === "stock" ? selected.id : model.stocks[0]?.id ?? "";
    select(null);
    setAdding({ from: s, to: "" });
    setView("diagram");
  };
  const addFlow = (from: string, to: string) => {
    const a = model.stocks.find((s) => s.id === from), b = model.stocks.find((s) => s.id === to);
    if (!a && !b) return;
    const v: P = a && b ? midpoint([[a.x, a.y], [b.x, b.y]]) : a ? [a.x + boxW(labelOf(a)) / 2 + 100, a.y] : [b!.x - boxW(labelOf(b!)) / 2 - 100, b!.y];
    const id = newId(model, "f");
    update((m) => ({ ...m, flows: [...m.flows, { id, name: freshName(m, "Flow"), from: from || undefined, to: to || undefined, eq: "", x: Math.max(30, v[0]), y: v[1] }] }));
    select(id);
  };
  const startLink = () => {
    select(null);
    setLinking({ from: null });
    setView("diagram");
  };
  const pickForLink = (id: string) => {
    if (!linking) return;
    if (!linking.from) return setLinking({ from: id });
    if (id === linking.from) return setNote("A link joins two different elements. Click another one, or press Esc.");
    const from = linking.from, a = findElement(model, from), b = findElement(model, id);
    if ((model.links ?? []).some((l) => l.from === from && l.to === id)) setNote("That link is already there.");
    else {
      update((m) => ({ ...m, links: [...(m.links ?? []), { from, to: id }] }));
      setNote(`Linked ${a?.name} to ${b?.name}. Click its chip in the editor to use it in the equation.`);
    }
    setLinking(null);
    setRubber(null);
    setSel(id);
  };
  const duplicate = () => {
    const el = selected;
    if (!el) return;
    const m0 = modelRef.current, { kind, ...rest } = el;
    const id = newId(m0, kind === "stock" ? "s" : kind === "flow" ? "f" : "v"), name = freshName(m0, el.name.trim() || KIND_LABEL[kind]);
    const copy = { ...rest, id, name, x: el.x + 30, y: el.y + 30 };
    update((m) => (kind === "stock" ? { ...m, stocks: [...m.stocks, copy as BStock] } : kind === "flow" ? { ...m, flows: [...m.flows, copy as BFlow] } : { ...m, vars: [...m.vars, copy as BVar] }));
    select(id);
    setNote(`Duplicated as ${name}.`);
  };
  const loadTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id)!;
    if (elements(model).length && !window.confirm(`Replace your current model with the ${t.label} template? You can undo this.`)) return;
    const m = template(id);
    update(() => m);
    setVb(viewFor(m));
    select(null);
    setRun(null);
    setNote(`Loaded the ${t.label} template.`);
  };

  // dimensions (arrays)
  const setDims = (fn: (d: BDim[]) => BDim[]) => update((m) => ({ ...m, dims: fn(m.dims ?? []) }));
  const addDim = () => {
    let n = 1;
    while (dims.some((d) => d.name.toLowerCase() === `dim${n}`)) n++;
    setDims((d) => [...d, { name: `Dim${n}`, elements: ["A", "B", "C"] }]);
  };
  const renameDim = (old: string, name: string) =>
    update((m) => mapAll({ ...m, dims: (m.dims ?? []).map((d) => (d.name === old ? { ...d, name } : d)) }, (e) => (e.dim === old ? { ...e, dim: name } : e)));
  const deleteDim = (name: string) => {
    const n = elements(model).filter((e) => e.dim === name).length;
    if (n && !window.confirm(`${plural(n, "element")} ${n === 1 ? "is" : "are"} arrayed over ${name}. Delete the dimension and make ${n === 1 ? "it a single value" : "them single values"}?`)) return;
    update((m) => mapAll({ ...m, dims: (m.dims ?? []).filter((d) => d.name !== name) }, (e) => (e.dim === name ? { ...e, dim: undefined } : e)));
  };

  // view: zoom and pan move the viewBox, so positions stay in model space
  const toModel = (cx: number, cy: number): P => {
    const svg = svgRef.current!, pt = svg.createSVGPoint();
    pt.x = cx;
    pt.y = cy;
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return [p.x, p.y];
  };
  const toSvg = (e: React.PointerEvent): P => toModel(e.clientX, e.clientY);
  const zoomAt = (f: number, p?: P) =>
    setVb((v) => {
      const nw = Math.min(MAX_W, Math.max(MIN_W, v.w * f)), k = nw / v.w;
      const [px, py] = p ?? [v.x + v.w / 2, v.y + v.h / 2];
      return { x: px - (px - v.x) * k, y: py - (py - v.y) * k, w: nw, h: v.h * k };
    });
  const fit = () => setVb(fitBox(bounds(modelRef.current)));
  const zoomPct = Math.round((W / vb.w) * 100);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const h = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      zoomAt(Math.exp(Math.max(-60, Math.min(60, e.deltaY)) * 0.004), toModel(e.clientX, e.clientY));
    };
    svg.addEventListener("wheel", h, { passive: false });
    return () => svg.removeEventListener("wheel", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);
  const startPan = (e: React.PointerEvent) => {
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) return;
    pan.current = { cx: e.clientX, cy: e.clientY, vb, k: ctm.a, moved: false };
    svgRef.current!.setPointerCapture(e.pointerId);
  };

  // full screen: the browser's Fullscreen API on the workspace, or a fixed overlay where that is not available
  const toggleFull = async () => {
    if (full === "native") return void (await document.exitFullscreen?.().catch(() => {}));
    if (full === "overlay") return setFull(null);
    const el = wsRef.current;
    if (el?.requestFullscreen && document.fullscreenEnabled) {
      try {
        await el.requestFullscreen();
        return;
      } catch {
        /* fall back to the overlay */
      }
    }
    setFull("overlay");
  };
  useEffect(() => {
    const h = () => setFull((f) => (document.fullscreenElement && document.fullscreenElement === wsRef.current ? "native" : f === "native" ? null : f));
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);
  useEffect(() => {
    if (full !== "overlay") return;
    const o = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => void (document.body.style.overflow = o);
  }, [full]);

  // menus are <details>: close them on a click outside or Esc
  const closeMenus = () => {
    const open = document.querySelectorAll<HTMLDetailsElement>("details[data-menu][open]");
    open.forEach((d) => (d.open = false));
    return open.length > 0;
  };
  useEffect(() => {
    const h = (e: PointerEvent) => document.querySelectorAll<HTMLDetailsElement>("details[data-menu][open]").forEach((d) => !d.contains(e.target as Node) && (d.open = false));
    document.addEventListener("pointerdown", h);
    return () => document.removeEventListener("pointerdown", h);
  }, []);

  // keyboard shortcuts, wherever the focus is on the page (except while typing)
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyRef.current = (e) => {
    const typing = isTyping(e.target), mod = e.metaKey || e.ctrlKey, k = e.key.toLowerCase();
    if (e.key === "Escape") {
      if (closeMenus() || typing) return;
      if (linking) return select(null);
      if (adding) return setAdding(null);
      if (sel) return select(null);
      if (full === "overlay") setFull(null);
      return;
    }
    if (typing || e.altKey) return;
    if (mod && k === "z") return e.preventDefault(), e.shiftKey ? redo() : undo();
    if (mod && k === "y") return e.preventDefault(), redo();
    if (mod && k === "d") return selected ? (e.preventDefault(), duplicate()) : undefined;
    if (mod) return;
    if ((e.key === "Delete" || e.key === "Backspace") && sel) return e.preventDefault(), remove(sel);
    if (view !== "diagram") return;
    if (e.key === "+" || e.key === "=") return zoomAt(1 / 1.25);
    if (e.key === "-" || e.key === "_") return zoomAt(1.25);
    if (e.key === "0") return fit();
    if (k === "l") return startLink();
    const t = e.target as HTMLElement;
    if (e.key === " " && !t.closest?.("button, summary, a, [role=button]")) {
      e.preventDefault();
      spaceRef.current = true;
    }
  };
  useEffect(() => {
    const down = (e: KeyboardEvent) => keyRef.current(e);
    const up = (e: KeyboardEvent) => void (e.key === " " && (spaceRef.current = false));
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => (window.removeEventListener("keydown", down), window.removeEventListener("keyup", up));
  }, []);

  const grab = (e: React.PointerEvent, el: Element) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (linking) return pickForLink(el.id);
    if (spaceRef.current) return startPan(e);
    select(el.id);
    const [x, y] = toSvg(e);
    drag.current = { id: el.id, dx: x - el.x, dy: y - el.y, tag: `drag:${el.id}:${Date.now()}` };
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
      if (linking) return pickForLink(el.id);
      select(el.id);
      document.getElementById("bld-name")?.focus();
    }
  };

  const doRun = () => {
    const res = simulate(model);
    setRun({ model, res });
    if (!res.ok && res.issues[0]?.id) setSel(res.issues[0].id);
  };
  const save = (name: string, text: string, mime: string) => {
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  // the canvas as a standalone SVG: colours resolved from the page's CSS variables, editing marks left out
  const diagramSvg = () => {
    const svg = svgRef.current;
    if (!svg) throw new Error("open the Diagram view first.");
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const src = [svg, ...Array.from(svg.querySelectorAll("*"))], dst = [clone, ...Array.from(clone.querySelectorAll("*"))];
    src.forEach((n, i) => {
      const d = dst[i], cs = getComputedStyle(n);
      for (const a of ["fill", "stroke"]) if (n.getAttribute(a)?.includes("var(")) d.setAttribute(a, cs.getPropertyValue(a));
      for (const a of ["tabindex", "role", "aria-label", "aria-pressed", "style", "class"]) d.removeAttribute(a);
    });
    clone.querySelectorAll("[data-skip]").forEach((n) => n.remove());
    const b = bounds(model) ?? HOME, pad = 24, v = { x: b.x - pad, y: b.y - pad, w: b.w + pad * 2, h: b.h + pad * 2 };
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    Object.entries({ x: v.x, y: v.y, width: v.w, height: v.h, fill: "#ffffff" }).forEach(([k, val]) => bg.setAttribute(k, String(val)));
    clone.insertBefore(bg, clone.querySelector("defs")?.nextSibling ?? clone.firstChild);
    clone.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`);
    clone.setAttribute("width", String(Math.round(v.w)));
    clone.setAttribute("height", String(Math.round(v.h)));
    clone.setAttribute("font-family", "Archivo, 'Helvetica Neue', Arial, sans-serif");
    return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}\n`;
  };
  const exportAs = (what: ExportKind) => {
    closeMenus();
    try {
      const py = `${slug}.py`, nb = `${slug}.ipynb`;
      if (what === "py") save(py, pythonScript(model), "text/x-python"), setNote(`Downloaded ${py}. Run it with: pip install -r requirements.txt, then python ${py}`);
      else if (what === "req") save("requirements.txt", requirementsTxt(model), "text/plain"), setNote("Downloaded requirements.txt. Install with: pip install -r requirements.txt");
      else if (what === "ipynb") save(nb, notebook(model), "application/x-ipynb+json"), setNote(`Downloaded ${nb}. Open it in Jupyter, or in Colab (File, Upload notebook).`);
      else if (what === "python") {
        const files: [string, string, string][] = [
          [py, pythonScript(model), "text/x-python"],
          ["requirements.txt", requirementsTxt(model), "text/plain"],
          [nb, notebook(model), "application/x-ipynb+json"],
        ];
        files.forEach(([n, t, mime], i) => window.setTimeout(() => save(n, t, mime), i * 350));
        setNote(`Downloading ${py}, requirements.txt and ${nb}. If your browser asks, allow several downloads.`);
      } else if (what === "pysd") save(`${slug}_pysd.py`, pysdScript(model), "text/x-python"), setNote(`Downloaded ${slug}_pysd.py. Run it with: pip install pysd matplotlib, then python ${slug}_pysd.py`);
      else if (what === "pysdnb") save(`${slug}_pysd.ipynb`, pysdNotebook(model), "application/x-ipynb+json"), setNote(`Downloaded ${slug}_pysd.ipynb. It installs PySD in its first cell; open it in Jupyter or Colab.`);
      else if (what === "json") save(`${slug}.json`, toJSON(model), "application/json"), setNote("Downloaded the model file. Import JSON loads it back.");
      else if (what === "xmile") save(`${slug}.xmile`, xmile(model), "application/xml"), setNote(`Downloaded ${slug}.xmile. Open it in Stella, or import it into Vensim.`);
      else if (what === "csv") {
        if (!run?.res.ok) throw new Error("run the model first.");
        save(`${slug}-results.csv`, resultsCsv(run.model, run.res), "text/csv");
        setNote("Downloaded the results of the last run as CSV.");
      } else if (what === "md") save(`${slug}.md`, markdownDoc(model), "text/markdown"), setNote(`Downloaded ${slug}.md, the equations as a readable document.`);
      else if (what === "svg") {
        if (!svgRef.current) {
          setView("diagram");
          window.setTimeout(() => exportAs("svg"), 60);
          return;
        }
        save(`${slug}.svg`, diagramSvg(), "image/svg+xml");
        setNote(`Downloaded ${slug}.svg, the diagram as an image.`);
      }
    } catch (e) {
      setNote(`That export did not work: ${errText(e)}`);
    }
  };
  const importFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      const m = fromJSON(await f.text());
      update(() => m);
      setVb(viewFor(m));
      select(null);
      setRun(null);
      setNote(`Imported "${m.name}". Undo puts your previous model back.`);
    } catch (e) {
      setNote(`Import failed: ${errText(e)}`);
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
      <g aria-hidden pointerEvents="none" data-skip>
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
    return `${kindOf(el)} ${labelOf(el)}${n ? `, ${n} problem${n > 1 ? "s" : ""}` : ""}${linking ? (linking.from ? ". Press Enter to link to it" : ". Press Enter to link from it") : ""}`;
  };
  const elProps = (el: Element) => ({
    tabIndex: 0,
    role: "button",
    "aria-label": ariaFor(el),
    "aria-pressed": sel === el.id,
    onPointerDown: (e: React.PointerEvent) => grab(e, el),
    onFocus: () => !linking && sel !== el.id && select(el.id),
    onKeyDown: (e: React.KeyboardEvent) => elKeys(e, el),
    style: { touchAction: "none", cursor: linking ? "crosshair" : "grab", outline: "none" } as React.CSSProperties,
  });
  const halo = (id: string) => sel === id || linking?.from === id;
  const stale = run && run.model !== model;
  const hasPast = hist.current.past.length > 0, hasFuture = hist.current.future.length > 0;
  const inputs = selected
    ? (model.links ?? [])
        .filter((l) => l.to === selected.id)
        .map((l) => ({ el: findElement(model, l.from), used: geo.links.find((g) => g.key === linkKey(l.from, l.to))?.used ?? false }))
        .filter((x): x is { el: Element; used: boolean } => !!x.el)
    : [];
  const linkSrc = linking?.from ? findElement(model, linking.from) : undefined;
  const sep = <span className="hidden sm:block w-px h-7 bg-border" aria-hidden />;

  return (
    <div className={`${wrap} pt-6 md:pt-8 pb-16`}>
      <h1 className="heading text-[26px] md:text-[30px]">Build a model</h1>
      <p className="mt-1.5 text-[15px] leading-[1.55] text-muted-foreground max-w-[80ch]">
        Add stocks, flows and variables, write an equation for each, then run it. The builder checks your model as you go and saves it in this browser. Export it as Python, a notebook or XMILE when you are ready.
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
        <button onClick={() => fileRef.current?.click()} className={btn} title="Load a model file (.json) exported from this builder">
          <Upload size={15} aria-hidden /> Import JSON
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-label="Import a model from a JSON file" onChange={(e) => importFile(e.target.files?.[0])} />
        <button onClick={copy} className={btn} title="Copy every equation as plain text">
          <ClipboardCopy size={15} aria-hidden /> Copy equations
        </button>
      </div>

      {/* the workspace: what goes full screen */}
      <div
        ref={wsRef}
        className={cn("mt-4", full && "bg-background overflow-auto p-3 md:p-5", full === "overlay" && "fixed inset-0 z-[100]")}
        aria-label="Builder workspace"
        role="region"
      >
        <div role="toolbar" aria-label="Builder tools" className="relative flex flex-wrap items-center gap-x-3 gap-y-2">
          <div role="group" aria-label="Add" className="flex flex-wrap gap-1.5">
            <button onClick={addStock} className={btn} title="Add a stock: something that accumulates">
              <Box size={15} aria-hidden /> Add stock
            </button>
            <button onClick={startFlow} className={btn} disabled={!model.stocks.length} title={model.stocks.length ? "Add a flow into or out of a stock" : "Add a stock first"}>
              <Workflow size={15} aria-hidden /> Add flow
            </button>
            <button onClick={addVar} className={btn} title="Add a variable: a constant or an auxiliary">
              <Circle size={15} aria-hidden /> Add variable
            </button>
            <button
              onClick={() => (linking ? select(null) : startLink())}
              className={cn(btn, linking && "brick-y border-transparent")}
              aria-pressed={!!linking}
              disabled={elements(model).length < 2}
              title="Add an information link: click the source, then the element that uses it (L)"
              aria-keyshortcuts="L"
            >
              <MoveUpRight size={15} aria-hidden /> Add link
            </button>
          </div>
          {sep}
          <div role="group" aria-label="Edit" className="flex gap-1.5">
            <button onClick={undo} disabled={!hasPast} className={ibtn} aria-label="Undo" title="Undo (Ctrl or Cmd + Z)" aria-keyshortcuts="Control+Z Meta+Z">
              <Undo2 size={16} aria-hidden />
            </button>
            <button onClick={redo} disabled={!hasFuture} className={ibtn} aria-label="Redo" title="Redo (Shift + Ctrl or Cmd + Z, or Ctrl + Y)" aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z Control+Y">
              <Redo2 size={16} aria-hidden />
            </button>
            <button onClick={duplicate} disabled={!selected} className={ibtn} aria-label="Duplicate the selected element" title="Duplicate (Ctrl or Cmd + D)" aria-keyshortcuts="Control+D Meta+D">
              <Copy size={16} aria-hidden />
            </button>
            <button onClick={() => sel && remove(sel)} disabled={!selected && !selLink} className={ibtn} aria-label="Delete the selection" title="Delete the selection (Delete)" aria-keyshortcuts="Delete">
              <Trash2 size={16} aria-hidden />
            </button>
          </div>
          {sep}
          <div role="group" aria-label="Zoom" className="flex gap-1.5">
            <button onClick={() => zoomAt(1.25)} disabled={view !== "diagram" || vb.w >= MAX_W} className={ibtn} aria-label="Zoom out" title="Zoom out (minus key)">
              <ZoomOut size={16} aria-hidden />
            </button>
            <button onClick={() => setVb(HOME)} disabled={view !== "diagram"} className={cn(btn, "w-[62px] justify-center px-0 tabular-nums")} aria-label={`Zoom ${zoomPct}%. Reset to 100%`} title="Reset the view to 100%">
              {zoomPct}%
            </button>
            <button onClick={() => zoomAt(1 / 1.25)} disabled={view !== "diagram" || vb.w <= MIN_W} className={ibtn} aria-label="Zoom in" title="Zoom in (plus key); Ctrl or Cmd + wheel zooms at the pointer">
              <ZoomIn size={16} aria-hidden />
            </button>
            <button onClick={fit} disabled={view !== "diagram" || !elements(model).length} className={ibtn} aria-label="Fit the model in view" title="Fit to model (0)">
              <Scan size={16} aria-hidden />
            </button>
          </div>
          {sep}
          <details data-menu className="sm:relative">
            <summary className={cn(btn, summaryCls)} aria-label="Export menu" title="Download the model as Python, a notebook, XMILE and more">
              <Download size={15} aria-hidden /> Export <ChevronDown size={14} aria-hidden />
            </summary>
            <ExportMenu onPick={exportAs} canCsv={!!run?.res.ok} />
          </details>
          <button onClick={toggleFull} className={btn} aria-pressed={!!full} title={full ? "Exit full screen (Esc)" : "Fill the screen with the canvas, editor and results"}>
            {full ? <Minimize size={15} aria-hidden /> : <Maximize size={15} aria-hidden />} {full ? "Exit full screen" : "Full screen"}
          </button>
          <details data-menu className="sm:relative">
            <summary className={cn(ibtn, summaryCls)} aria-label="Keyboard shortcuts" title="Keyboard shortcuts">
              <Keyboard size={16} aria-hidden />
            </summary>
            <Shortcuts />
          </details>
        </div>
        <p aria-live="polite" className="mt-2 min-h-[20px] text-[13.5px] text-muted-foreground">
          {note}
        </p>

        <div className="mt-1 grid lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
          {/* canvas */}
          <section className="sheet min-w-0" aria-label="Model canvas">
            <div className="relative flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-[13px] font-semibold mr-auto min-w-0">
                <span className="shrink-0">Model name</span>
                <input value={model.name} onChange={(e) => update((m) => ({ ...m, name: e.target.value }), "set:name")} className={cn(input, "w-[200px] max-w-full")} />
              </label>
              <div className="flex rounded-[8px] border border-border p-0.5 bg-background" role="group" aria-label="View">
                {(["diagram", "equations", "python"] as const).map((v) => (
                  <button key={v} aria-pressed={view === v} onClick={() => setView(v)} className={cn("h-8 px-3 rounded-[6px] text-[13px] font-semibold capitalize", view === v ? "bg-card shadow-sm" : "text-muted-foreground")}>
                    {v}
                  </button>
                ))}
              </div>
              <details data-menu className="sm:relative">
                <summary className={cn(btn, summaryCls)} title="Dimensions for arrays: one value per region, product, age group">
                  <Layers size={15} aria-hidden /> Dimensions{dims.length ? ` (${dims.length})` : ""}
                  {chk.issues.some((i) => i.field === "dim" && !i.id) && <AlertCircle size={14} aria-label="has problems" className="text-[var(--viz-pink)]" />}
                  <ChevronDown size={14} aria-hidden />
                </summary>
                <div className={cn(popover, "right-0 w-[340px] max-w-[calc(100vw-40px)] p-3")}>
                  <DimensionsEditor dims={dims} issues={chk.issues.filter((i) => i.field === "dim" && !i.id)} usage={(n) => elements(model).filter((e) => e.dim === n).length} onAdd={addDim} onRename={renameDim} onDelete={deleteDim} onElements={(n, els) => setDims((d) => d.map((x) => (x.name === n ? { ...x, elements: els } : x)))} />
                </div>
              </details>
            </div>

            {linking && (
              <p role="status" className="mt-3 rounded-[8px] border border-accent-edge bg-accent/25 px-3 py-1.5 text-[13px] flex flex-wrap items-center gap-x-2">
                <MoveUpRight size={14} aria-hidden />
                {linkSrc ? (
                  <span>
                    From <b>{linkSrc.name}</b>: now click the element that uses it.
                  </span>
                ) : (
                  <span>Click the element the information comes from.</span>
                )}
                <span className="text-muted-foreground">Esc cancels.</span>
              </p>
            )}

            {view === "diagram" ? (
              <div
                ref={boxRef}
                tabIndex={-1}
                className={cn("mt-3 overflow-auto rounded-card border border-border bg-card focus:outline-none", full ? "h-[calc(100dvh-215px)] min-h-[340px]" : "max-h-[70vh]")}
                aria-label="Diagram. Tab to an element to select it; arrow keys move it; Delete removes it."
                role="region"
              >
                <svg
                  ref={svgRef}
                  viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
                  className={cn("block select-none", full ? "w-full h-full min-w-[640px]" : "w-full min-w-[760px] h-auto")}
                  style={{ cursor: linking ? "crosshair" : undefined }}
                  onPointerMove={(e) => {
                    const d = drag.current, p = pan.current;
                    if (d) {
                      const [x, y] = toSvg(e);
                      move(d.id, x - d.dx, y - d.dy, d.tag);
                    } else if (p) {
                      const dx = e.clientX - p.cx, dy = e.clientY - p.cy;
                      if (Math.abs(dx) + Math.abs(dy) > 3) p.moved = true;
                      if (p.moved) setVb({ ...p.vb, x: p.vb.x - dx / p.k, y: p.vb.y - dy / p.k });
                    }
                    if (linking?.from) setRubber(toSvg(e));
                  }}
                  onPointerUp={() => {
                    if (pan.current && !pan.current.moved && !spaceRef.current) select(null);
                    drag.current = null;
                    pan.current = null;
                  }}
                  onPointerCancel={() => ((drag.current = null), (pan.current = null))}
                >
                  <defs>
                    <marker id="bld-info" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                      <path d="M0,0 L9,4 L0,8 Z" fill={INFO} />
                    </marker>
                    <marker id="bld-info-on" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto">
                      <path d="M0,0 L11,5 L0,10 Z" fill={WARN} />
                    </marker>
                    <pattern id="bld-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="1" cy="1" r="1" fill={GRID} />
                    </pattern>
                  </defs>
                  <rect
                    x={-5000}
                    y={-5000}
                    width={15000}
                    height={13000}
                    fill="url(#bld-grid)"
                    data-skip
                    style={{ cursor: linking ? "crosshair" : "grab" }}
                    onPointerDown={(e) => {
                      if (e.button !== 0) return;
                      if (e.pointerType === "touch") return select(null);
                      startPan(e);
                    }}
                  />
                  {!elements(model).length && (
                    <text x={vb.x + vb.w / 2} y={vb.y + vb.h / 2} textAnchor="middle" fontSize={15} fill={QUIET} data-skip>
                      Empty canvas. Add a stock: what accumulates in your system?
                    </text>
                  )}
                  {geo.links.map((l) => {
                    const on = sel === "link:" + l.key, a = findElement(model, l.from), b = findElement(model, l.to);
                    return (
                      <g key={l.key}>
                        <path d={l.d} fill="none" stroke={on ? WARN : INFO} strokeWidth={on ? 2.4 : 1.4} strokeDasharray={l.used ? undefined : "5 4"} markerEnd={on ? "url(#bld-info-on)" : "url(#bld-info)"} pointerEvents="none" />
                        {l.drawn && (
                          <path
                            d={l.d}
                            fill="none"
                            stroke="transparent"
                            strokeWidth={14}
                            pointerEvents="stroke"
                            data-skip
                            style={{ cursor: "pointer" }}
                            onPointerDown={(e) => {
                              if (e.button !== 0 || linking) return;
                              e.stopPropagation();
                              select("link:" + l.key);
                            }}
                          >
                            <title>{`Link from ${a?.name} to ${b?.name}${l.used ? "" : " (not used by the equation yet)"}`}</title>
                          </path>
                        )}
                      </g>
                    );
                  })}
                  {linkSrc && rubber && <line x1={linkSrc.x} y1={linkSrc.y} x2={rubber[0]} y2={rubber[1]} stroke={WARN} strokeWidth={1.6} strokeDasharray="4 4" pointerEvents="none" data-skip />}
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
                    const b = geo.boxes[s.id], on = halo(s.id), bad = errCount(s.id) > 0;
                    return (
                      <g key={s.id} {...elProps({ ...s, kind: "stock" })}>
                        {on && <rect data-skip x={b.x - b.w / 2 - 5} y={b.y - b.h / 2 - 5} width={b.w + 10 + (s.dim ? 5 : 0)} height={b.h + 10 + (s.dim ? 5 : 0)} rx={8} fill="hsl(var(--accent) / 0.35)" stroke="hsl(var(--accent-edge))" strokeWidth={2} />}
                        {s.dim && <rect x={b.x - b.w / 2 + 5} y={b.y - b.h / 2 + 5} width={b.w} height={b.h} rx={4} fill={CARD} stroke={INK} strokeOpacity={0.5} strokeWidth={1.4} />}
                        <rect x={b.x - b.w / 2} y={b.y - b.h / 2} width={b.w} height={b.h} rx={4} fill={CARD} stroke={bad ? BAD : INK} strokeWidth={1.8} />
                        <text x={b.x} y={b.y} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600} fill={INK}>
                          {labelOf(s)}
                        </text>
                        {badge(s.id, b.x + b.w / 2, b.y - b.h / 2)}
                      </g>
                    );
                  })}
                  {model.flows.map((f) => {
                    const on = halo(f.id);
                    return (
                      <g key={f.id} {...elProps({ ...f, kind: "flow" })}>
                        <circle data-skip={on ? true : undefined} cx={f.x} cy={f.y - 4} r={on ? 20 : 18} fill={on ? "hsl(var(--accent) / 0.35)" : "transparent"} stroke={on ? "hsl(var(--accent-edge))" : "none"} strokeWidth={2} />
                        <path d={`M ${f.x} ${f.y} L ${f.x} ${f.y - 15} M ${f.x - 5} ${f.y - 15} L ${f.x + 5} ${f.y - 15}`} stroke={PIPE} strokeWidth={1.8} strokeLinecap="round" />
                        {f.dim && <path d={valvePath(f.x + 4, f.y + 4, 9)} fill={CARD} stroke={PIPE} strokeOpacity={0.5} strokeWidth={1.4} strokeLinejoin="round" />}
                        <path d={valvePath(f.x, f.y, 9)} fill={CARD} stroke={errCount(f.id) ? BAD : PIPE} strokeWidth={1.8} strokeLinejoin="round" />
                        <text x={f.x} y={f.y - 24} textAnchor="middle" fontSize={12} fontStyle="italic" fill={INK}>
                          {labelOf(f)}
                        </text>
                        {badge(f.id, f.x + 14, f.y - 12)}
                      </g>
                    );
                  })}
                  {model.vars.map((v) => {
                    const on = halo(v.id), k = isConstant(v);
                    return (
                      <g key={v.id} {...elProps({ ...v, kind: "var" })}>
                        <circle data-skip={on ? true : undefined} cx={v.x} cy={v.y + 6} r={on ? 22 : 18} fill={on ? "hsl(var(--accent) / 0.35)" : "transparent"} stroke={on ? "hsl(var(--accent-edge))" : "none"} strokeWidth={2} />
                        {v.dim && <circle cx={v.x + 3.5} cy={v.y + 3.5} r={k ? 4.5 : 6.5} fill={CARD} stroke={INFO} strokeOpacity={0.6} strokeWidth={1.2} />}
                        <circle cx={v.x} cy={v.y} r={k ? 4.5 : 6.5} fill={k ? INFO : CARD} stroke={errCount(v.id) ? BAD : INFO} strokeWidth={1.4} />
                        <text x={v.x} y={v.y + 20} textAnchor="middle" fontSize={11.5} fill={INK}>
                          {labelOf(v)}
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
            ) : view === "equations" ? (
              <EquationsView model={model} onSelect={(id) => (select(id), setView("diagram"))} byId={byId} />
            ) : (
              <PythonView model={model} slug={slug} full={!!full} onExport={exportAs} onNote={setNote} />
            )}
            <p className="mt-2 text-[12.5px] text-muted-foreground">
              Drag to move; drag empty space to pan; Ctrl or Cmd + wheel zooms. Click or Tab to select; arrow keys nudge, Delete removes. Thin arrows are drawn for you from every name an equation uses; Add link draws one yourself, dashed until the equation uses it. A small filled dot is a constant; a doubled outline is an array.
            </p>
            <ChecksList issues={chk.issues} model={model} onSelect={(id) => (select(id), setView("diagram"))} />
          </section>

          {/* side panel */}
          <aside className={cn("sheet min-w-0 lg:sticky", full ? "lg:top-4" : "lg:top-24")} aria-label="Edit the selected element">
            {linking ? (
              <div>
                <h2 className="heading text-[18px]">Add an information link</h2>
                <ol className="mt-2 grid gap-1.5 text-[13.5px] leading-[1.5] list-decimal pl-5">
                  <li className={cn(linkSrc && "text-muted-foreground")}>Click the element the information comes from{linkSrc ? `: ${linkSrc.name}` : "."}</li>
                  <li className={cn(!linkSrc && "text-muted-foreground")}>Click the element whose equation uses it.</li>
                </ol>
                <p className="mt-2 text-[13px] text-muted-foreground">A link into a stock informs its initial value; only flows change a stock. Links never add to a stock's net flow.</p>
                <button onClick={() => select(null)} className={cn(btn, "mt-3")}>
                  Cancel
                </button>
              </div>
            ) : adding ? (
              <AddFlow model={model} value={adding} onChange={setAdding} onAdd={() => addFlow(adding.from, adding.to)} onCancel={() => setAdding(null)} />
            ) : selLink ? (
              <LinkInspector model={model} link={selLink} onSelect={(id) => select(id)} onDelete={() => remove("link:" + selLink.key)} />
            ) : selected ? (
              <Inspector
                key={selected.id}
                el={selected}
                model={model}
                issues={byId.get(selected.id) ?? []}
                inputs={inputs}
                onPatch={(p) => patch(selected.id, p)}
                onRename={(n) => update((m) => renameElement(m, selected.id, n))}
                onDelete={() => remove(selected.id)}
                onDuplicate={duplicate}
                onUnlink={(from) => update((m) => ({ ...m, links: (m.links ?? []).filter((l) => !(l.from === from && l.to === selected.id)) }))}
              />
            ) : (
              <div>
                <h2 className="heading text-[18px]">Nothing selected</h2>
                <p className="mt-2 text-[14px] leading-[1.6] text-foreground/80">Select an element on the canvas to edit its name, equation and units, or add a new one with the buttons above the canvas.</p>
                <p className="mt-3 text-[13.5px] text-muted-foreground">
                  {plural(model.stocks.length, "stock")}, {plural(model.flows.length, "flow")}, {plural(model.vars.length, "variable")}, {plural((model.links ?? []).length, "drawn link")}
                  {dims.length ? `, ${plural(dims.length, "dimension")}` : ""}.
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
                <input type="number" min={0} step="any" value={Number.isFinite(model.T) ? model.T : ""} onChange={(e) => update((m) => ({ ...m, T: e.target.value === "" ? NaN : +e.target.value }), "set:T")} className={cn(input, "mt-1 w-[110px]")} />
              </label>
              <label className="text-[13px] font-semibold flex flex-col">
                Time step (dt)
                <input type="number" min={0} step="any" value={Number.isFinite(model.dt) ? model.dt : ""} onChange={(e) => update((m) => ({ ...m, dt: e.target.value === "" ? NaN : +e.target.value }), "set:dt")} className={cn(input, "mt-1 w-[110px]")} />
              </label>
              <label className="text-[13px] font-semibold flex flex-col">
                Time unit
                <input value={model.timeUnit} onChange={(e) => update((m) => ({ ...m, timeUnit: e.target.value }), "set:timeUnit")} className={cn(input, "mt-1 w-[130px]")} placeholder="week" />
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
                  {stale && <p className="mt-3 text-[13px] rounded-[8px] bg-card border-l-4 border-accent px-3 py-2">You have changed the model since this run. Run again to see the effect.</p>}
                  <Results model={run.model} res={run.res} />
                </>
              )}
              {!run && <p className="mt-4 text-[14px] text-muted-foreground">Press Run to simulate the model. Each stock is plotted over time, one line per element of an array.</p>}
            </div>
          </section>

          <HowTo onOpen={onOpen} />
        </div>
      </div>
    </div>
  );
}

// ===================================================================================================
function ExportMenu({ onPick, canCsv }: { onPick: (k: ExportKind) => void; canCsv: boolean }) {
  const items: { k: ExportKind; label: string; hint: string; off?: boolean }[] = [
    { k: "py", label: "Python script (.py)", hint: "Commented code with numpy and matplotlib" },
    { k: "req", label: "requirements.txt", hint: "The packages the script needs" },
    { k: "ipynb", label: "Jupyter notebook (.ipynb)", hint: "Explanation, code and a plot; opens in Colab" },
    { k: "python", label: "Everything for Python", hint: "The script, requirements.txt and the notebook" },
    { k: "pysd", label: "PySD script (.py)", hint: "Runs the model with PySD, the open Python engine for Vensim and Stella models" },
    { k: "pysdnb", label: "PySD notebook (.ipynb)", hint: "The same with PySD, explained step by step" },
    { k: "json", label: "Model file (.json)", hint: "Load it back with Import JSON" },
    { k: "xmile", label: "XMILE for Stella or Vensim (.xmile)", hint: "The open standard for system dynamics" },
    { k: "csv", label: "Results (.csv)", hint: canCsv ? "Every value from the last run" : "Run the model first", off: !canCsv },
    { k: "md", label: "Equations document (.md)", hint: "Every element with its equation, units and notes" },
    { k: "svg", label: "Diagram image (.svg)", hint: "The canvas as a picture for slides or documents" },
  ];
  return (
    <ul className={cn(popover, "right-0 w-[300px] max-w-[calc(100vw-40px)] grid gap-0.5")} aria-label="Export formats">
      {items.map((i) => (
        <li key={i.k}>
          <button onClick={() => onPick(i.k)} disabled={i.off} className="w-full text-left rounded-[6px] px-2.5 py-1.5 hover:bg-background focus-visible:bg-background disabled:opacity-50 disabled:hover:bg-transparent">
            <span className="block text-[13.5px] font-semibold">{i.label}</span>
            <span className="block text-[12px] text-muted-foreground">{i.hint}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Shortcuts() {
  const rows: [string, string][] = [
    ["Ctrl or Cmd + Z", "Undo"],
    ["Shift + Ctrl or Cmd + Z, Ctrl + Y", "Redo"],
    ["Ctrl or Cmd + D", "Duplicate the selection"],
    ["Delete or Backspace", "Delete the selection"],
    ["L", "Add a link: click the source, then the target"],
    ["Esc", "Cancel, close a menu, deselect, leave the overlay"],
    ["Arrow keys", "Nudge (with Shift: 1 unit)"],
    ["+ and -", "Zoom in and out"],
    ["0", "Fit the model in view"],
    ["Ctrl or Cmd + wheel", "Zoom at the pointer"],
    ["Drag empty space, or Space + drag", "Pan"],
  ];
  return (
    <div className={cn(popover, "right-0 w-[330px] max-w-[calc(100vw-40px)] p-3")}>
      <h2 className="heading text-[15px]">Keyboard shortcuts</h2>
      <dl className="mt-2 grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-x-3 gap-y-1.5 text-[12.5px]">
        {rows.map(([k, d]) => (
          <div key={k} className="contents">
            <dt>
              <kbd className="font-mono text-[11.5px] rounded-[4px] border border-border bg-background px-1 py-px">{k}</kbd>
            </dt>
            <dd className="text-foreground/80">{d}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-[12px] text-muted-foreground">Shortcuts work when you are not typing in a field.</p>
    </div>
  );
}

function DimensionsEditor({
  dims,
  issues,
  usage,
  onAdd,
  onRename,
  onDelete,
  onElements,
}: {
  dims: BDim[];
  issues: Issue[];
  usage: (name: string) => number;
  onAdd: () => void;
  onRename: (old: string, name: string) => void;
  onDelete: (name: string) => void;
  onElements: (name: string, els: string[]) => void;
}) {
  return (
    <div>
      <h2 className="heading text-[15px]">Dimensions</h2>
      <p className="mt-1 text-[12.5px] leading-[1.5] text-muted-foreground">A dimension lists the elements of an array, such as regions. Then choose Array over in an element's editor to give it one value per element.</p>
      <ul className="mt-2 grid gap-3">
        {dims.map((d) => (
          <DimRow key={d.name} dim={d} used={usage(d.name)} taken={(n) => dims.some((x) => x !== d && x.name.toLowerCase() === n.toLowerCase())} onRename={(n) => onRename(d.name, n)} onDelete={() => onDelete(d.name)} onElements={(e) => onElements(d.name, e)} />
        ))}
      </ul>
      {issues.length > 0 && (
        <ul className="mt-2 grid gap-1" aria-live="polite">
          {issues.map((i, k) => (
            <li key={k} className="flex gap-1.5 text-[12.5px] leading-[1.45]">
              <AlertCircle size={14} aria-hidden className="shrink-0 mt-0.5 text-[var(--viz-pink)]" />
              {i.msg}
            </li>
          ))}
        </ul>
      )}
      <button onClick={onAdd} className={cn(btn, "mt-3")}>
        <Plus size={15} aria-hidden /> Add dimension
      </button>
    </div>
  );
}

function DimRow({ dim, used, taken, onRename, onDelete, onElements }: { dim: BDim; used: number; taken: (n: string) => boolean; onRename: (n: string) => void; onDelete: () => void; onElements: (e: string[]) => void }) {
  const joined = dim.elements.join(", ");
  const [name, setName] = useState(dim.name), [els, setEls] = useState(joined);
  useEffect(() => setName(dim.name), [dim.name]);
  useEffect(() => setEls(joined), [joined]);
  const n = name.trim();
  const nameErr = !DIM_RE.test(n) ? "Letters, digits and underscores, starting with a letter." : taken(n) ? "Another dimension has that name." : "";
  const commitName = () => (nameErr ? setName(dim.name) : n !== dim.name && onRename(n));
  const commitEls = () => {
    const list = [...new Set(els.split(",").map((s) => s.trim()).filter(Boolean))];
    if (list.length) list.join(", ") !== joined && onElements(list);
    else setEls(joined);
  };
  return (
    <li className="rounded-[8px] border border-border p-2.5">
      <div className="flex items-end gap-2">
        <label className="flex-1 min-w-0 text-[12.5px] font-semibold">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} onBlur={commitName} onKeyDown={(e) => e.key === "Enter" && commitName()} aria-invalid={!!nameErr} className={cn(input, "mt-1 h-8", nameErr && "border-[var(--viz-pink)]")} />
        </label>
        <button onClick={onDelete} className={cn(ibtn, "h-8 w-8")} aria-label={`Delete the dimension ${dim.name}`} title="Delete this dimension">
          <Trash2 size={15} aria-hidden />
        </button>
      </div>
      {nameErr && <p className="mt-1 text-[12px] text-[var(--viz-pink)]">{nameErr}</p>}
      <label className="block mt-2 text-[12.5px] font-semibold">
        Elements, separated by commas
        <input value={els} onChange={(e) => setEls(e.target.value)} onBlur={commitEls} onKeyDown={(e) => e.key === "Enter" && commitEls()} className={cn(input, "mt-1 h-8 font-mono text-[13px]")} placeholder="North, South, East" />
      </label>
      <p className="mt-1 text-[12px] text-muted-foreground">
        {plural(dim.elements.length, "element")}; {used ? `${plural(used, "model element")} arrayed over it` : "not used yet"}.
      </p>
    </li>
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

const chip = "rounded-[6px] border border-border bg-background px-1.5 py-0.5 text-[12px] font-mono hover:border-foreground/40";

function Inspector({
  el,
  model,
  issues,
  inputs,
  onPatch,
  onRename,
  onDelete,
  onDuplicate,
  onUnlink,
}: {
  el: Element;
  model: BModel;
  issues: Issue[];
  inputs: { el: Element; used: boolean }[];
  onPatch: (p: Partial<BStock & BFlow & BVar>) => void;
  onRename: (n: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onUnlink: (from: string) => void;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const touched = useRef(false); // until the field has had the caret, insert at the end
  const has = (f: string) => issues.some((i) => i.field === f && i.level === "error");
  const exprField = el.kind === "stock" ? "init" : "eq";
  const exprVal = el.kind === "stock" ? el.init : el.eq;
  const linked = new Set(inputs.map((i) => i.el.id));
  const others = elements(model).filter((e) => e.id !== el.id && e.name.trim() && !linked.has(e.id));
  const dims = model.dims ?? [];
  const dim = dims.find((d) => d.name === el.dim);
  const stockOpts = model.stocks.map((s) => (
    <option key={s.id} value={s.id}>
      {s.name || "(no name)"}
    </option>
  ));
  const stockUnits = (id?: string) => model.stocks.find((s) => s.id === id)?.units;
  const unitHint = el.kind === "flow" ? stockUnits(el.to) ?? stockUnits(el.from) : undefined;
  const net = el.kind === "stock" ? [...inflows(model, el.id).map((f) => refName(f.name)), ...outflows(model, el.id).map((f) => "- " + refName(f.name))].join(" + ").replace(/\+ - /g, "- ") : "";
  // put a name in the equation where the caret is, with spaces around it where needed
  const insert = (name: string) => {
    const ta = taRef.current, v = exprVal;
    const s = touched.current && ta ? ta.selectionStart : v.length, e = touched.current && ta ? ta.selectionEnd : v.length;
    const before = v.slice(0, s), after = v.slice(e);
    const pre = before && !/[\s(,]$/.test(before) ? " " : "", post = after && !/^[\s),]/.test(after) ? " " : "";
    onPatch({ [exprField]: before + pre + name + post + after });
    const caret = (before + pre + name).length;
    requestAnimationFrame(() => {
      ta?.focus();
      ta?.setSelectionRange(caret, caret);
    });
  };
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            {kindOf(el)}
            {el.dim ? ", array" : ""}
          </p>
          <h2 className="heading text-[18px] break-words">{labelOf(el)}</h2>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button onClick={onDuplicate} className={ibtn} aria-label={`Duplicate ${el.name}`} title="Duplicate (Ctrl or Cmd + D)">
            <Copy size={15} aria-hidden />
          </button>
          <button onClick={onDelete} className={btn} aria-label={`Delete ${el.name}`}>
            <Trash2 size={15} aria-hidden /> Delete
          </button>
        </div>
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
            ref={taRef}
            value={exprVal}
            rows={el.kind === "stock" ? 1 : 3}
            spellCheck={false}
            onChange={(e) => onPatch({ [exprField]: e.target.value })}
            onSelect={() => (touched.current = true)}
            aria-invalid={has(exprField)}
            aria-describedby="bld-el-issues"
            className={cn(input, mono, "mt-1 h-auto py-2 leading-[1.5] resize-y", has(exprField) && "border-[var(--viz-pink)]")}
          />
        </label>
        {dim && <p className="-mt-1.5 text-[12px] text-muted-foreground">One expression for every element of {dim.name}, or a comma list with one value each, in order: {dim.elements.join(", ")}.</p>}
        {inputs.length > 0 && (
          <div>
            <p className="text-[12px] text-muted-foreground">Linked inputs: click one to put it in the {el.kind === "stock" ? "initial value" : "equation"}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {inputs.map(({ el: o, used }) => (
                <span key={o.id} className={cn("inline-flex items-stretch rounded-[6px] border bg-background", used ? "border-[var(--viz-info)]" : "border-dashed border-accent-edge")}>
                  <button onClick={() => insert(refName(o.name))} className="px-1.5 py-0.5 text-[12px] font-mono hover:underline" title={used ? "Used by the equation" : "Not used by the equation yet"}>
                    {refName(o.name)}
                    {!used && <span className="sr-only"> (not used yet)</span>}
                  </button>
                  <button onClick={() => onUnlink(o.id)} className="px-1 border-l border-border text-muted-foreground hover:text-foreground" aria-label={`Remove the link from ${o.name}`} title="Remove this link">
                    <X size={12} aria-hidden />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        {others.length > 0 && (
          <div>
            <p className="text-[12px] text-muted-foreground">Insert a name</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {others.map((o) => (
                <button key={o.id} onClick={() => insert(refName(o.name))} className={chip}>
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
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-[13px] font-semibold min-w-0">
            Units
            <input
              value={el.units ?? ""}
              onChange={(e) => onPatch({ units: e.target.value || undefined })}
              placeholder={el.kind === "flow" && unitHint && model.timeUnit ? `${unitHint}/${model.timeUnit}` : el.kind === "stock" ? "people, litres" : "optional"}
              className={cn(input, "mt-1")}
            />
          </label>
          <label className="block text-[13px] font-semibold min-w-0">
            Array over
            <select value={el.dim ?? ""} onChange={(e) => onPatch({ dim: e.target.value || undefined })} aria-invalid={has("dim")} className={cn(input, "mt-1", has("dim") && "border-[var(--viz-pink)]")} title={dims.length ? "Give it one value per element of a dimension" : "Add a dimension first, with Dimensions above the canvas"}>
              <option value="">None</option>
              {dims.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name} ({d.elements.length})
                </option>
              ))}
              {el.dim && !dim && <option value={el.dim}>{el.dim} (missing)</option>}
            </select>
          </label>
        </div>
        {issues
          .filter((i) => i.field === "dim")
          .map((i, k) => (
            <p key={k} className="-mt-1.5 text-[12px] text-[var(--viz-pink)]">
              {i.msg}
            </p>
          ))}
        {!dims.length && <p className="-mt-1.5 text-[12px] text-muted-foreground">To make an array, add a dimension with Dimensions above the canvas.</p>}
        <label className="block text-[13px] font-semibold">
          Notes
          <textarea value={el.note ?? ""} rows={2} onChange={(e) => onPatch({ note: e.target.value || undefined })} placeholder="What it means, where the number comes from" className={cn(input, "mt-1 h-auto py-2 leading-[1.5] resize-y font-normal")} />
        </label>
        <div id="bld-el-issues" aria-live="polite">
          {issues.some((i) => i.field !== "dim") && <IssueItems issues={issues.filter((i) => i.field !== "dim")} model={model} onSelect={() => {}} />}
        </div>
      </div>
    </div>
  );
}

function LinkInspector({ model, link, onSelect, onDelete }: { model: BModel; link: LinkG; onSelect: (id: string) => void; onDelete: () => void }) {
  const a = findElement(model, link.from), b = findElement(model, link.to);
  if (!a || !b) return null;
  const what = b.kind === "stock" ? "initial value" : "equation";
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Information link</p>
          <h2 className="heading text-[18px] break-words">
            {a.name} → {b.name}
          </h2>
        </div>
        <button onClick={onDelete} className={btn} aria-label={`Delete the link from ${a.name} to ${b.name}`}>
          <Trash2 size={15} aria-hidden /> Delete
        </button>
      </div>
      <p className="mt-3 text-[14px] leading-[1.6] text-foreground/80">
        {link.used ? (
          <>
            The {what} of {b.name} uses <code className={mono}>{refName(a.name)}</code>, so the link is solid.
          </>
        ) : (
          <>
            The {what} of {b.name} does not use <code className={mono}>{refName(a.name)}</code> yet, so the link is dashed. Write it into the {what}, or delete the link.
          </>
        )}
      </p>
      {b.kind === "stock" && <p className="mt-2 text-[13px] text-muted-foreground">A link into a stock informs only its initial value. Flows are what change a stock.</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => onSelect(b.id)} className={btn}>
          Edit {b.name}
        </button>
        <button onClick={() => onSelect(a.id)} className={btn}>
          Edit {a.name}
        </button>
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

function PythonView({ model, slug, full, onExport, onNote }: { model: BModel; slug: string; full: boolean; onExport: (k: ExportKind) => void; onNote: (n: string) => void }) {
  const code = useMemo(() => {
    try {
      return { ok: true as const, text: pythonScript(model) };
    } catch (e) {
      return { ok: false as const, msg: errText(e) };
    }
  }, [model]);
  const copyCode = async () => {
    if (!code.ok) return;
    try {
      await navigator.clipboard.writeText(code.text);
      onNote("Copied the Python script.");
    } catch {
      onNote("Copying is blocked here; select the code and copy it, or download the .py file.");
    }
  };
  return (
    <div className="mt-3 rounded-card border border-border bg-card p-4 min-w-0">
      <p className="text-[13px] text-muted-foreground flex flex-wrap items-center gap-1.5">
        <Code2 size={14} aria-hidden /> A standalone, commented script that simulates this model. To run it: <code className={mono}>pip install -r requirements.txt</code> then <code className={mono}>python {slug}.py</code>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={copyCode} disabled={!code.ok} className={btn}>
          <ClipboardCopy size={15} aria-hidden /> Copy
        </button>
        <button onClick={() => onExport("py")} disabled={!code.ok} className={btn}>
          <Download size={15} aria-hidden /> Download .py
        </button>
        <button onClick={() => onExport("req")} className={btn}>
          <Download size={15} aria-hidden /> requirements.txt
        </button>
        <button onClick={() => onExport("ipynb")} className={btn} title="Download it as a Jupyter notebook, with explanations; opens in Colab">
          <Download size={15} aria-hidden /> Open as notebook
        </button>
      </div>
      {code.ok ? (
        <pre tabIndex={0} aria-label="Python script" className={cn("mt-3 overflow-auto rounded-[8px] border border-border bg-background p-3 font-mono text-[12.5px] leading-[1.55] whitespace-pre", full ? "max-h-[calc(100dvh-330px)]" : "max-h-[60vh]")}>
          <code>{code.text}</code>
        </pre>
      ) : (
        <p className="mt-3 rounded-[8px] border-l-4 border-accent bg-background px-3 py-2 text-[13.5px]">The Python export is not available yet ({code.msg}). The Equations view and the model file (.json) still work.</p>
      )}
    </div>
  );
}

// ===================================================================================================
const MAX_SERIES = 24, MAX_LEGEND = 12, MAX_COLS = 6;
function Results({ model, res }: { model: BModel; res: RunResult }) {
  // one series per stock, or per element of an arrayed stock (values keyed "id[element]")
  const all = model.stocks
    .flatMap((s) => series(model, s).map((x) => ({ ...x, units: s.units, ys: res.values[x.key] })))
    .filter((l) => l.ys?.length)
    .map((l, i) => ({ ...l, color: SERIES[i % SERIES.length], dash: i >= SERIES.length ? "6 3" : undefined }));
  if (!all.length) return <p className="mt-4 text-[14px] text-muted-foreground">The run worked, but there are no stocks to plot. Add a stock.</p>;
  const lines = all.slice(0, MAX_SERIES), cols = all.slice(0, MAX_COLS);
  const vals = lines.flatMap((l) => l.ys);
  const lo = Math.min(0, ...vals), hi = Math.max(...vals, lo + 1e-9);
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
        <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full h-auto" role="img" aria-label={`${model.name}: ${lines.map((l) => l.label).join(", ")} over ${t1} ${model.timeUnit}`}>
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
          {lines.map(({ key, ys, color, dash }) => (
            <polyline key={key} fill="none" stroke={color} strokeWidth="2.25" strokeDasharray={dash} strokeLinejoin="round" points={ys.map((v, j) => `${x(res.times[j]).toFixed(1)},${y(v).toFixed(1)}`).join(" ")} />
          ))}
        </svg>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
          {lines.slice(0, MAX_LEGEND).map(({ key, label, units, color, dash }) => (
            <span key={key} className="flex items-center gap-1.5">
              <svg width="16" height="4" aria-hidden className="shrink-0">
                <line x1="0" x2="16" y1="2" y2="2" stroke={color} strokeWidth="3" strokeDasharray={dash ? "4 2" : undefined} />
              </svg>
              {label}
              {units ? <span className="text-muted-foreground">({units})</span> : null}
            </span>
          ))}
          {all.length > MAX_LEGEND && (
            <span className="text-muted-foreground">
              and {all.length - MAX_LEGEND} more{all.length > MAX_SERIES ? ` (${MAX_SERIES} plotted; export the results as CSV for all)` : ""}
            </span>
          )}
        </div>
      </div>
      <div className="overflow-x-auto min-w-0">
        <table className="w-full text-[13px] tabular-nums">
          <caption className="text-left text-[12.5px] text-muted-foreground pb-1">
            Stock values at five times{all.length > MAX_COLS ? ` (first ${MAX_COLS} of ${all.length} series)` : ""}
          </caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="text-left font-semibold py-1 pr-3">
                Time
              </th>
              {cols.map(({ key, label }) => (
                <th key={key} scope="col" className="text-right font-semibold py-1 pl-3">
                  {label}
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
                {cols.map(({ key, ys }) => (
                  <td key={key} className="text-right py-1 pl-3">
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
    ["Write the equations", "Refer to other elements by name, with underscores for spaces. The arrows appear as you type; Add link lets you draw one first and fill in the equation after."],
    ["Check and run", "Fix the errors, look at the unit warnings, then run. Does the behaviour match what you expected, and why?"],
    ["Take it further", "Arrays repeat a structure over a dimension such as regions. Export as Python or a notebook to keep experimenting in code."],
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
        Functions: MIN, MAX, ABS, EXP, LN, SQRT, IF(condition, then, else), STEP(height, time), PULSE(height, start, width), RAMP(slope, start), TABLE(input, x1, y1, x2, y2, ...) for a lookup through points (straight lines between them, flat beyond the ends) and TIME. For arrays, SUM, MEAN, VMIN and VMAX take a name: SUM(Population). Compare with &lt; &lt;= &gt; &gt;= = &lt;&gt;.
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
