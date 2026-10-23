// Opening models made elsewhere: XMILE (Stella, iThink, and the builder's own XMILE export) and Vensim .mdl.
// CONTRACT shared with the builder UI. Each importer returns the model plus plain-English warnings for anything it could
// not bring across (a function the builder lacks, a complex macro, a module), so the learner knows what changed. Simple
// macros are expanded where they are called.
// Both importers read equations into a small syntax tree, rewrite names and functions onto the builder's language
// (expr.ts FUNCTION_DOCS), then share one assembly step: stocks, flows wired from/to, dimensions, positions, arrows.
import type { BDim, BFlow, BLink, BModel, BStock, BVar } from "@/lib/builder";
import { RESERVED, nameKey, refName } from "@/lib/expr";

export type Imported = { model: BModel; warnings: string[] };

// ---------------------------------------------------------------------------------------------------
// a small XML reader, enough for XMILE: elements, attributes, text and CDATA; namespace prefixes are dropped
type X = { n: string; a: Record<string, string>; c: X[]; t: string };
const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const unent = (s: string) => s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e: string) => (e[0] !== "#" ? ENT[e] ?? m : String.fromCodePoint(/x/i.test(e[1]) ? parseInt(e.slice(2), 16) : +e.slice(1))));
const local = (n: string) => n.replace(/^.*:/, "");
function parseXml(src: string): X {
  const root: X = { n: "", a: {}, c: [], t: "" };
  const stack = [root];
  // ponytail: no DTDs and no ">" inside attribute values; XMILE has neither
  const re = /<!--[\s\S]*?-->|<!\[CDATA\[([\s\S]*?)\]\]>|<[?!][^>]*>|<\/([^\s>]+)\s*>|<([^\s/>]+)([^>]*?)(\/?)>|([^<]+)/g;
  for (const m of src.matchAll(re)) {
    const top = stack[stack.length - 1];
    if (m[1] !== undefined) top.t += m[1];
    else if (m[2]) {
      const i = stack.map((x) => x.n).lastIndexOf(local(m[2]));
      if (i > 0) stack.length = i;
    } else if (m[3]) {
      const x: X = { n: local(m[3]), a: {}, c: [], t: "" };
      for (const a of m[4].matchAll(/([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) x.a[local(a[1])] = unent(a[2] ?? a[3]);
      top.c.push(x);
      if (!m[5]) stack.push(x);
    } else if (m[6]) top.t += unent(m[6]);
  }
  return root;
}
const kid = (x: X | undefined, n: string) => x?.c.find((c) => c.n === n);
const kids = (x: X | undefined, n: string) => x?.c.filter((c) => c.n === n) ?? [];
const txt = (x: X | undefined) => x?.t.trim() ?? "";

// ---------------------------------------------------------------------------------------------------
// names: both tools match names ignoring case, with spaces and underscores alike; XMILE writes a line break as \n
const keyOf = (s: string) => nameKey(s.replace(/\\n/g, " ").replace(/^\s*"|"\s*$/g, ""));
// ponytail: only what the engine reserves today; a name that later becomes a function is flagged by validate
const RES = RESERVED;
// a name the builder accepts (expr.ts NAME_RE): letters, digits, spaces and underscores, starting with a letter or _
export const safeName = (raw: string) => {
  const s = raw.replace(/\\n/g, " ").replace(/^\s*"|"\s*$/g, "").replace(/[^\p{L}\p{N}_ ]+/gu, " ").replace(/\s+/g, " ").trim() || "unnamed";
  return /^[\p{L}_]/u.test(s) ? s : "_" + s;
};
class Names {
  map = new Map<string, string>(); // original key -> builder name
  used = new Set<string>();
  constructor(private warn?: (s: string) => void, private reserved = true) {}
  add(raw: string): string {
    const k = keyOf(raw);
    if (this.map.has(k)) return this.map.get(k)!;
    const base = safeName(raw);
    let s = base, n = 2;
    while ((this.reserved && RES.has(nameKey(s))) || this.used.has(nameKey(s))) s = `${base} ${n++}`;
    if (nameKey(s) !== k) this.warn?.(`Renamed "${raw.replace(/\\n/g, " ").trim()}" to "${s}": builder names use letters, digits, spaces and underscores, and must be unique.`);
    this.used.add(nameKey(s));
    this.map.set(k, s);
    return s;
  }
}

// ---------------------------------------------------------------------------------------------------
// equations, in either tool's syntax, as a tree
type E =
  | { k: "num"; v: number }
  | { k: "id"; key: string; raw: string; sub?: string[] } // sub: subscripts as written; "Region!" marks a Vensim sum over Region
  | { k: "call"; f: string; raw: string; args: E[]; pts?: Gf }
  | { k: "un"; op: string; a: E }
  | { k: "bin"; op: string; a: E; b: E };
type Gf = { xs: number[]; ys: number[]; extrap?: boolean };
type Tok = { t: "num" | "id" | "op" | "end"; v: string; p: number };

const XKW = new Set(["IF", "THEN", "ELSE", "AND", "OR", "NOT", "MOD"]);
function lex(src: string, vensim: boolean): Tok[] {
  // Vensim names may hold spaces (Teacup Temperature); XMILE names use underscores and may hold a module dot
  const id = vensim ? String.raw`[\p{L}_$][\p{L}\p{N}_$' ]*` : String.raw`[\p{L}_$][\p{L}\p{N}_$.]*`;
  const re = new RegExp(String.raw`(\s+)|((?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)|("(?:[^"\\]|\\.)*")|(${id})|(:[A-Za-z]+:|<=|>=|<>|!=|==|[-+*/^(),[\]<>=!;])`, "uy");
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    re.lastIndex = i;
    const m = re.exec(src);
    if (!m) throw new Error(`unexpected "${src[i]}" at character ${i + 1}`);
    if (m[2]) out.push({ t: "num", v: m[2], p: i });
    else if (m[3]) out.push({ t: "id", v: m[3].slice(1, -1), p: i });
    else if (m[4]) {
      const v = m[4].trim();
      // MOD is also written as a function, MOD(a, b)
      out.push(!vensim && XKW.has(v.toUpperCase()) && !(v.toUpperCase() === "MOD" && /^\s*\(/.test(src.slice(i + m[4].length))) ? { t: "op", v: v.toUpperCase(), p: i } : { t: "id", v, p: i });
    } else if (m[5]) {
      const v = m[5].toUpperCase();
      if (v === ":NA:") out.push({ t: "num", v: String(-(2 ** 109)), p: i });
      else out.push({ t: "op", v: v.startsWith(":") ? v.slice(1, -1) : v, p: i });
    }
    i = re.lastIndex;
  }
  out.push({ t: "end", v: "", p: src.length });
  return out;
}

function parseExpr(src: string, vensim: boolean): E {
  const toks = lex(src, vensim);
  let i = 0;
  const peek = () => toks[i];
  const is = (v: string) => peek().t === "op" && peek().v === v;
  const take = (v: string) => {
    if (!is(v)) throw new Error(`expected "${v}" at character ${peek().p + 1}`);
    i++;
  };
  const bin = (next: () => E, ops: string[]) => (): E => {
    let a = next();
    while (peek().t === "op" && ops.includes(peek().v)) {
      const op = toks[i++].v;
      a = { k: "bin", op, a, b: next() };
    }
    return a;
  };
  function unary(): E {
    if (is("-") || is("+")) {
      const op = toks[i++].v;
      return { k: "un", op, a: unary() };
    }
    const a = primary();
    if (is("^")) return i++, { k: "bin", op: "^", a, b: unary() };
    return a;
  }
  const mul = bin(unary, ["*", "/", "MOD"]);
  const add = bin(mul, ["+", "-"]);
  const cmp = bin(add, ["=", "==", "<>", "!=", "<", ">", "<=", ">="]);
  const not = (): E => (is("NOT") ? (i++, { k: "un", op: "NOT", a: not() }) : cmp());
  const and = bin(not, ["AND"]);
  const or = bin(and, ["OR"]);
  function primary(): E {
    const t = toks[i++];
    if (t.t === "num") return { k: "num", v: +t.v };
    if (t.t === "op" && t.v === "(") {
      const e = or();
      take(")");
      return e;
    }
    if (t.t === "op" && t.v === "IF") {
      const c = or();
      take("THEN");
      const a = or();
      take("ELSE");
      return { k: "call", f: "IF", raw: "IF", args: [c, a, or()] };
    }
    if (t.t === "id" && is("(")) {
      i++;
      const f = t.v.toUpperCase().replace(/\s+/g, "_");
      const args: E[] = [];
      if (f === "WITH_LOOKUP") {
        // WITH LOOKUP(input, ([(xmin,ymin)-(xmax,ymax)], (x1,y1), ...)): the table is read as text
        args.push(or());
        take(",");
        let j = i, d = 1;
        while (toks[j].t !== "end" && d) d += toks[j].v === "(" ? 1 : toks[j].v === ")" ? -1 : 0, j++;
        const pts = lookupPts(src.slice(peek().p, toks[j - 1].p));
        i = j;
        return { k: "call", f, raw: t.v, args, pts };
      }
      if (!is(")")) {
        args.push(or());
        while (is(",")) i++, args.push(or());
      }
      take(")");
      return { k: "call", f, raw: t.v, args };
    }
    if (t.t === "id") {
      const e: E = { k: "id", key: keyOf(t.v), raw: t.v };
      if (is("[")) {
        i++;
        const sub: string[] = [];
        while (!is("]")) {
          const s = toks[i++];
          if (s.t === "end") throw new Error(`missing "]" after ${t.v}`);
          if (s.v === "!" && sub.length) sub[sub.length - 1] += "!";
          else if (s.v !== ",") sub.push(s.v);
        }
        i++;
        e.sub = sub;
      }
      return e;
    }
    throw new Error(t.t === "end" ? "the equation ends too early" : `unexpected "${t.v}" at character ${t.p + 1}`);
  }
  const e = or();
  if (peek().t !== "end") throw new Error(`unexpected "${peek().v}" at character ${peek().p + 1}`);
  return e;
}

// a Vensim lookup's points: an optional [(xmin,ymin)-(xmax,ymax)] range, then (x,y) pairs, or all xs then all ys
function lookupPts(s: string): Gf {
  s = s.replace(/\[[^\]]*\]/g, "").replace(/([-+])\s+(?=[\d.])/g, "$1");
  const pairs = [...s.matchAll(/\(\s*([^(),]+?)\s*,\s*([^(),]+?)\s*\)/g)];
  if (pairs.length) return { xs: pairs.map((p) => +p[1]), ys: pairs.map((p) => +p[2]) };
  const n = s.replace(/[()]/g, " ").split(/[\s,]+/).filter(Boolean).map(Number);
  return { xs: n.slice(0, n.length / 2), ys: n.slice(n.length / 2) };
}

// ---------------------------------------------------------------------------------------------------
// the tree as a builder equation
type Ctx = {
  names: Map<string, string>; // original key -> builder name
  lookups: Map<string, Gf>; // tables callable as name(x)
  inline: Map<string, { input: E; gf: Gf }>; // the builder's own exported lookup helpers, put back inline
  dimKeys: Set<string>;
  dimName: Map<string, string>; // dimension key -> builder dimension name
  elems: Map<string, string>; // element key -> builder element name
  macros: Map<string, { params: string[]; body: E }>; // XMILE macros that are one expression, put in where called
  depth: number;
  cell: Set<string>; // element keys of the element being written, in a per-element equation
  time: { start: number; stop: number; dt: number; save: number };
  vensim: boolean;
  warn: (s: string) => void;
  who: string;
};
const fmt = (v: number) => String(v);
const CMP = new Set(["=", "<>", "<", ">", "<=", ">="]);
const isNum = (s: string) => /^-?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s.trim());

// [text, precedence]: 1 comparison, 2 + -, 3 * /, 4 unary minus, 5 ^, 6 a name, number or call
function tr(e: E, c: Ctx): [string, number] {
  const w = (x: E, min: number) => {
    const [s, p] = tr(x, c);
    return p < min ? `(${s})` : s;
  };
  // a condition as 1 or 0
  const bool = (x: E) => (x.k === "bin" && CMP.has(x.op === "==" ? "=" : x.op === "!=" ? "<>" : x.op) ? `(${tr(x, c)[0]})` : x.k === "un" && x.op === "NOT" ? `(${tr(x, c)[0]})` : `(${w(x, 2)} <> 0)`);
  switch (e.k) {
    case "num":
      return [fmt(e.v), e.v < 0 ? 4 : 6];
    case "un":
      if (e.op === "NOT") return [`${bool(e.a)} = 0`, 1];
      return e.op === "-" ? ["-" + w(e.a, 4), 4] : tr(e.a, c);
    case "bin": {
      const op = e.op === "==" ? "=" : e.op === "!=" ? "<>" : e.op;
      if (op === "AND") return [`${bool(e.a)} * ${bool(e.b)}`, 3];
      if (op === "OR") return [`MAX(${bool(e.a)}, ${bool(e.b)})`, 6];
      if (op === "MOD") return [`MODULO(${tr(e.a, c)[0]}, ${tr(e.b, c)[0]})`, 6];
      if (CMP.has(op)) return [`${w(e.a, 2)} ${op} ${w(e.b, 2)}`, 1];
      if (op === "+" || op === "-") return [`${w(e.a, 2)} ${op} ${w(e.b, 3)}`, 2];
      if (op === "*" || op === "/") return [`${w(e.a, 3)} ${op} ${w(e.b, 4)}`, 3];
      return [`${w(e.a, 6)} ^ ${w(e.b, 4)}`, 5];
    }
    case "id": {
      const k = e.key, il = c.inline.get(k);
      if (il) return [table(tr(il.input, c)[0], il.gf, c), 6];
      if (c.names.has(k)) return [refName(c.names.get(k)!) + subs(e, c), 6];
      if (k === "time") return ["TIME", 6];
      if (k === "dt" || k === "time_step") return ["DT", 6];
      if (k === "starttime" || k === "initial_time") return [fmt(c.time.start), 6];
      if (k === "stoptime" || k === "final_time") return [fmt(c.time.stop), 6];
      if (k === "saveper") return [fmt(c.time.save), 6];
      if (k === "pi") return ["PI()", 6];
      c.warn(`${c.who}: "${e.raw}" is not defined in the model.`);
      return [refName(safeName(e.raw)), 6];
    }
    case "call":
      return call(e, c);
  }
}

// subscripts: whole dimensions (or the element being written) are implied, since the builder works element by element;
// otherwise single elements by name, and a dimension as itself (the builder reads it as this element)
function subs(e: { raw: string; sub?: string[] }, c: Ctx): string {
  const key = (s: string) => keyOf(s.replace(/!$/, ""));
  if ((e.sub ?? []).every((s) => s === "*" || c.dimKeys.has(key(s)) || c.cell.has(key(s)))) return "";
  return `[${e.sub!.map((s) => refName(c.elems.get(key(s)) ?? c.dimName.get(key(s)) ?? s)).join(", ")}]`;
}

// a lookup with clean points: x must increase, and TABLE needs two points
function table(input: string, g: Gf, c: Ctx): string {
  const xs: number[] = [], ys: number[] = [];
  g.xs.forEach((x, j) => {
    if (Number.isFinite(x) && Number.isFinite(g.ys[j]) && (!xs.length || x > xs[xs.length - 1])) xs.push(x), ys.push(g.ys[j]);
  });
  if (xs.length < g.xs.length) c.warn(`${c.who}: a lookup's x values do not all increase; the out-of-order points were dropped.`);
  if (xs.length < 2) return fmt(ys[0] ?? 0);
  return `TABLE${g.extrap ? "_EXTRAP" : ""}(${input}, ${xs.map((x, j) => `${fmt(x)}, ${fmt(ys[j])}`).join(", ")})`;
}

const SAME = new Set("ABS EXP LN SQRT SIN COS TAN ARCSIN ARCCOS ARCTAN SINH COSH TANH INT POWER ZIDZ XIDZ MODULO QUANTUM STEP PULSE_TRAIN INITIAL SMOOTH SMOOTH3 DELAY1 DELAY3 DELAYN DELAY_FIXED LOG RANDOM_UNIFORM RANDOM_NORMAL FORECAST SAMPLE_IF_TRUE".split(" "));
// an XMILE macro's body with its parameters replaced by the call's arguments
const substitute = (x: E, ps: Map<string, E>): E =>
  x.k === "id" ? (!x.sub && ps.get(x.key)) || x : x.k === "call" ? { ...x, args: x.args.map((a) => substitute(a, ps)) } : x.k === "un" ? { ...x, a: substitute(x.a, ps) } : x.k === "bin" ? { ...x, a: substitute(x.a, ps), b: substitute(x.b, ps) } : x;
function call(e: Extract<E, { k: "call" }>, c: Ctx): [string, number] {
  const mac = c.macros.get(keyOf(e.raw));
  if (mac && c.depth < 20) {
    c.depth++;
    const r = tr(substitute(mac.body, new Map(mac.params.map((p, j) => [p, e.args[j] ?? { k: "num", v: 0 }]))), c);
    c.depth--;
    return r;
  }
  if (e.f === "ELMCOUNT") {
    const a = e.args[0], d = a?.k === "id" ? c.dimName.get(a.key) : undefined;
    if (d) return [`ELMCOUNT(${refName(d)})`, 6];
  }
  const A = e.args.map((x) => tr(x, c)[0]);
  const n = A.length, f = e.f, all = A.join(", ");
  const w = (j: number, min: number) => {
    const [s, p] = tr(e.args[j], c);
    return p < min ? `(${s})` : s;
  };
  const note = (s: string) => c.warn(`${c.who}: ${s}`);
  const lk = c.lookups.get(keyOf(e.raw));
  if (lk && n === 1) return [table(A[0], lk, c), 6];
  // an arrayed element reduced to one number: SUM(x[Region!]) and SUM(x[*]) are SUM(x)
  const reduce = (F: string): [string, number] => {
    const a = e.args[0];
    if (a?.k !== "id" || !c.names.has(a.key)) return note(`${e.raw} needs the name of an arrayed element; kept as written.`), [`${F}(${all})`, 6];
    if (a.sub?.some((s) => !s.endsWith("!") && s !== "*")) note(`${e.raw}(${a.raw}[${a.sub.join(", ")}]) adds up over some dimensions only; the builder's ${F} reduces over every element.`);
    return [`${F}(${refName(c.names.get(a.key)!)})`, 6];
  };
  const tbl = (j: number, input: string, extrap: boolean): [string, number] => {
    const a = e.args[j], g = a?.k === "id" ? c.lookups.get(a.key) : undefined;
    if (!g) return note(`${e.raw} needs the name of a lookup; kept as written.`), [`${f}(${all})`, 6];
    return [table(input, { ...g, extrap }, c), 6];
  };
  if (SAME.has(f)) return [`${f}(${all})`, 6];
  switch (f) {
    case "IF":
    case "IF_THEN_ELSE":
      return [`IF(${all})`, 6];
    case "MIN":
    case "MAX":
      return n === 1 ? reduce("V" + f) : [`${f}(${all})`, 6];
    case "MEAN":
      return n > 1 ? [`(${A.join(" + ")}) / ${n}`, 3] : reduce(f);
    case "SUM":
    case "PROD":
    case "VMIN":
    case "VMAX":
      return reduce(f);
    case "INTEGER": // Vensim truncates towards zero; INT rounds down
      return [`IF(${w(0, 2)} < 0, -INT(-${w(0, 4)}), INT(${A[0]}))`, 6];
    case "ROUND":
      return [`INT(${w(0, 2)} + 0.5)`, 6];
    case "MOD":
      return [`MODULO(${all})`, 6];
    case "LOG10":
      return [`LOG(${A[0]}, 10)`, 6];
    case "PI":
      return ["PI()", 6];
    case "SAFEDIV":
      return [n > 2 ? `XIDZ(${all})` : `ZIDZ(${all})`, 6];
    case "INIT":
      return [`INITIAL(${all})`, 6];
    case "ACTIVE_INITIAL":
      note(`ACTIVE INITIAL(${A.join(", ")}) became its active part, ${A[0]}; the builder starts it from that equation too.`);
      return tr(e.args[0], c);
    case "SMTH1":
    case "SMOOTHI":
      return [`SMOOTH(${all})`, 6];
    case "SMTH3":
    case "SMOOTH3I":
      return [`SMOOTH3(${all})`, 6];
    case "SMTHN":
      return [`SMOOTHN(${all})`, 6];
    case "SMOOTH_N": // Vensim: (input, time, initial, order)
      return [`SMOOTHN(${A[0]}, ${A[1]}, ${A[3]}, ${A[2]})`, 6];
    case "DELAY1I":
      return [`DELAY1(${all})`, 6];
    case "DELAY3I":
      return [`DELAY3(${all})`, 6];
    case "DELAY_N":
      return [`DELAYN(${A[0]}, ${A[1]}, ${A[3]}, ${A[2]})`, 6];
    case "DELAY": // XMILE: a pipeline delay
      return [`DELAY_FIXED(${A[0]}, ${A[1]}, ${A[2] ?? A[0]})`, 6];
    case "TREND":
      return [`TREND(${A[0]}, ${A[1]}, ${A[2] ?? "0"})`, 6];
    case "FORCST":
      if (n > 3) note(`FORCST's initial value (${A[3]}) was dropped; FORECAST starts from the input's own trend.`);
      return [`FORECAST(${A.slice(0, 3).join(", ")})`, 6];
    case "RANDOM":
      return [`RANDOM_UNIFORM(${all})`, 6];
    case "NORMAL": // XMILE: (mean, sd[, seed[, min, max]])
      return [`RANDOM_NORMAL(${A[3] ?? "-1e38"}, ${A[4] ?? "1e38"}, ${A[0]}, ${A[1]}${n > 2 ? `, ${A[2]}` : ""})`, 6];
    case "PULSE":
      if (c.vensim) return [`PULSE(1, ${A[0]}, ${A[1] ?? "0"})`, 6];
      // XMILE: magnitude spread over one dt at the first time; an interval repeats it
      if (n > 2 && !(e.args[2].k === "num" && e.args[2].v === 0)) note(`PULSE repeats every ${A[2]}; only the first pulse was kept.`);
      return [`PULSE(${w(0, 3)} / DT, ${A[1] ?? fmt(c.time.start)}, 0)`, 6];
    case "RAMP": {
      if (n < 3) return [`RAMP(${all})`, 6];
      const end = e.args[2];
      if (end.k === "num" && end.v >= c.time.stop) return [`RAMP(${A[0]}, ${A[1]})`, 6];
      note(`RAMP with an end time became RAMP(slope, start) - RAMP(slope, end), which levels off at the end.`);
      return [`RAMP(${A[0]}, ${A[1]}) - RAMP(${A[0]}, ${A[2]})`, 2];
    }
    case "WITH_LOOKUP":
      return [table(A[0], e.pts!, c), 6];
    case "LOOKUP": // XMILE: LOOKUP(table, x)
      return tbl(0, A[1], false);
    case "LOOKUP_EXTRAPOLATE":
      return tbl(0, A[1], true);
    case "TIME":
      return ["TIME", 6];
  }
  note(`${e.raw} has no equivalent in the builder; it is kept as written, so the equation needs rewriting.`);
  return [`${f}(${all})`, 6];
}

// ---------------------------------------------------------------------------------------------------
// shared assembly
type Dim = { name: string; key: string; els: string[]; names: string[] }; // els: element keys, names: builder names
type Eqs = { eq: string; eqs?: Record<string, string> }; // a general equation, and any per element
type Item = Eqs & { kind: "stock" | "flow" | "var"; key: string; name: string; dim?: string; units?: string; note?: string; nonNegative?: boolean; ins?: string[]; outs?: string[]; rate?: Eqs };
type Parts = { name: string; timeUnit: string; time: Ctx["time"]; dims: Dim[]; items: Item[]; names: Names; pos: Map<string, [number, number]>; arrows: [string, string][]; warn: (s: string) => void };

// every combination of elements, row-major (last dimension fastest), as the builder lists values
const combos = (lists: string[][]): string[][] => lists.reduce<string[][]>((acc, l) => acc.flatMap((a) => l.map((x) => [...a, x])), [[]]);

// one equation from per-element ones: the same text, a list of numbers, or the most common one with the others as
// per-element equations
function settle(who: string, grid: Dim[], cells: Map<string, string>, warn: (s: string) => void): Eqs {
  if (!grid.length) return { eq: cells.get("") ?? "0" };
  const v = combos(grid.map((d) => d.els)).map((k) => cells.get(k.join("|")));
  if (v.some((x) => x === undefined)) warn(`${who} is not defined for every element; the missing ones are 0.`);
  const s = v.map((x) => x ?? "0");
  if (s.every((x) => x === s[0])) return { eq: s[0] };
  if (s.every(isNum)) return { eq: s.join(", ") };
  const n = new Map<string, number>();
  s.forEach((x) => n.set(x, (n.get(x) ?? 0) + 1));
  const eq = [...n].sort((a, b) => b[1] - a[1])[0][0], names = combos(grid.map((d) => d.names));
  return { eq, eqs: Object.fromEntries(s.flatMap((x, j) => (x === eq ? [] : [[names[j].join(","), x]]))) };
}

function assemble(p: Parts): BModel {
  const { items, names, warn } = p;
  const byKey = new Map(items.map((it) => [it.key, it]));
  const to = new Map<string, string>(), from = new Map<string, string>(); // flow key -> stock key
  const out: Item[] = [...items];
  for (const s of items.filter((i) => i.kind === "stock")) {
    const terms = [...(s.ins ?? []).map((k) => [k, to] as const), ...(s.outs ?? []).map((k) => [k, from] as const)];
    const ok =
      s.ins && new Set(terms.map((t) => t[0])).size === terms.length &&
      terms.every(([k, end]) => {
        const f = byKey.get(k);
        return f && f.kind !== "stock" && !end.has(k) && nameKey(f.dim ?? "") === nameKey(s.dim ?? "");
      });
    if (ok) for (const [k, end] of terms) end.set(k, s.key), (byKey.get(k)!.kind = "flow");
    else if (s.rate && (s.rate.eq !== "0" || s.rate.eqs)) {
      const nf: Item = { kind: "flow", key: `\0${s.key}`, name: names.add(`${s.name} net flow`), ...s.rate, dim: s.dim, note: `The net rate of change of ${s.name}, brought in as one flow.` };
      out.push(nf), to.set(nf.key, s.key);
    }
  }
  for (const it of out)
    if (it.kind === "flow" && !to.has(it.key) && !from.has(it.key)) {
      warn(`${it.name} is a flow that fills or drains no stock, so it became an auxiliary.`);
      it.kind = "var";
    }

  // ids, then positions: the source's own, scaled into the canvas, or a simple layout
  const ids = new Map<string, string>(), n = { stock: 0, flow: 0, var: 0 };
  for (const it of out) ids.set(it.key, `${it.kind[0]}${++n[it.kind]}`);
  const xy = new Map<string, [number, number]>();
  const placed = out.filter((it) => p.pos.has(it.key));
  if (placed.length) {
    const ps = placed.map((it) => p.pos.get(it.key)!);
    const x0 = Math.min(...ps.map((q) => q[0])), y0 = Math.min(...ps.map((q) => q[1]));
    const wd = Math.max(...ps.map((q) => q[0])) - x0, ht = Math.max(...ps.map((q) => q[1])) - y0;
    const s = Math.min(840 / (wd || 1), 340 / (ht || 1), 2);
    for (const it of placed) {
      const [x, y] = p.pos.get(it.key)!;
      xy.set(it.key, [Math.round(80 + (840 - wd * s) / 2 + (x - x0) * s), Math.round(70 + (340 - ht * s) / 2 + (y - y0) * s)]);
    }
  }
  const auto = !xy.size;
  let g = 0, h = 0;
  for (const kind of ["stock", "flow", "var"] as const)
    for (const it of out.filter((i) => i.kind === kind && !xy.has(i.key))) {
      const st = xy.get(to.get(it.key) ?? from.get(it.key) ?? "");
      if (kind === "stock" && auto) xy.set(it.key, [180 + (h % 4) * 220, 180 + Math.floor(h / 4) * 140]), h++;
      else if (st) xy.set(it.key, [st[0] + (to.has(it.key) ? -110 : 110), st[1]]);
      else xy.set(it.key, [80 + (g % 8) * 115, (auto ? 180 + Math.ceil(h / 4) * 140 : 470) + Math.floor(g / 8) * 60]), g++;
    }

  const opt = (it: Item) => ({ ...(it.units ? { units: it.units } : {}), ...(it.dim ? { dim: it.dim } : {}), ...(it.note ? { note: it.note } : {}), ...(it.eqs ? { eqs: it.eqs } : {}) });
  const at = (it: Item) => ({ id: ids.get(it.key)!, name: it.name, x: xy.get(it.key)![0], y: xy.get(it.key)![1] });
  const stocks: BStock[] = out.filter((i) => i.kind === "stock").map((it) => ({ ...at(it), init: it.eq, ...opt(it), ...(it.nonNegative ? { nonNegative: true } : {}) }));
  const flows: BFlow[] = out
    .filter((i) => i.kind === "flow")
    .map((it) => ({ ...at(it), ...(from.has(it.key) ? { from: ids.get(from.get(it.key)!) } : {}), ...(to.has(it.key) ? { to: ids.get(to.get(it.key)!) } : {}), eq: it.eq, ...opt(it) }));
  const vars: BVar[] = out.filter((i) => i.kind === "var").map((it) => ({ ...at(it), eq: it.eq, ...opt(it) }));
  const links: BLink[] = [];
  for (const [a, b] of p.arrows) {
    const l = { from: ids.get(a)!, to: ids.get(b)! };
    if (l.from && l.to && l.from !== l.to && !links.some((x) => x.from === l.from && x.to === l.to)) links.push(l);
  }
  // a dimension whose elements all belong to a larger one is a subrange of it
  const dims: BDim[] = p.dims.map((d) => {
    const of = p.dims.filter((o) => o !== d && o.els.length > d.els.length && d.els.every((x) => o.els.includes(x))).sort((a, b) => a.els.length - b.els.length)[0];
    return { name: d.name, elements: d.names, ...(of ? { of: of.name } : {}) };
  });
  const { start, stop, dt } = p.time;
  let save = p.time.save;
  if (Math.abs(save / dt - Math.round(save / dt)) > 1e-9) (save = Math.max(1, Math.round(save / dt)) * dt), warn(`Results were saved every ${p.time.save}; the builder saves every whole number of time steps, so every ${save}.`);
  return {
    name: p.name,
    timeUnit: p.timeUnit,
    T: stop,
    dt,
    ...(start ? { start } : {}),
    ...(save && Math.abs(save - dt) > 1e-12 ? { saveEvery: save } : {}),
    stocks,
    flows,
    vars,
    ...(dims.length ? { dims } : {}),
    ...(links.length ? { links } : {}),
  };
}

// a dimension with builder-safe names; element keys stay as written so subscripts in equations still match
function makeDim(raw: string, els: string[], dimNames: Names, warn: (s: string) => void): Dim {
  const en = new Names(undefined, false);
  const names = els.map((e) => en.add(e));
  if (names.some((x, j) => nameKey(x) !== keyOf(els[j]))) warn(`Dimension ${raw}: some element names were changed to ones the builder accepts (${names.slice(0, 3).join(", ")}...).`);
  return { name: dimNames.add(raw), key: keyOf(raw), els: els.map(keyOf), names };
}

const CTRL = new Set(["initial_time", "final_time", "time_step", "saveper"]);
const finish = (p: Parts, warnings: string[]): Imported => ({ model: assemble(p), warnings: [...new Set(warnings)] });
function baseCtx(p: Omit<Parts, "items" | "pos" | "arrows" | "name" | "timeUnit">, vensim: boolean): Ctx {
  const elems = new Map<string, string>();
  p.dims.forEach((d) => d.els.forEach((k, j) => elems.set(k, d.names[j])));
  const dimName = new Map(p.dims.map((d) => [d.key, d.name]));
  return { names: p.names.map, lookups: new Map(), inline: new Map(), dimKeys: new Set(dimName.keys()), dimName, elems, macros: new Map(), depth: 0, cell: new Set(), time: p.time, vensim, warn: p.warn, who: "" };
}
function translate(src: string, c: Ctx): string {
  try {
    return tr(parseExpr(src, c.vensim), c)[0];
  } catch (e) {
    c.warn(`${c.who}: could not read the equation "${src.trim()}" (${(e as Error).message}); it is kept as written.`);
    return src.trim().replace(/\s+/g, " ");
  }
}

// ---------------------------------------------------------------------------------------------------
// XMILE

export function importXmile(text: string): Imported {
  const warnings: string[] = [];
  const warn = (s: string) => void warnings.push(s);
  const root = kid(parseXml(text), "xmile");
  if (!root) throw new Error("This is not an XMILE file: it has no <xmile> element.");
  const specs = kid(root, "sim_specs");
  const num = (x: X | undefined, d: number) => {
    const s = txt(x), m = /^([^/]+)\/(.+)$/.exec(s);
    let v = m ? +m[1] / +m[2] : s ? +s : NaN;
    if (x?.a.reciprocal === "true") v = 1 / v;
    return Number.isFinite(v) ? v : d;
  };
  const dt = num(kid(specs, "dt"), 1);
  const time = { start: num(kid(specs, "start"), 0), stop: num(kid(specs, "stop"), 100), dt, save: +(specs?.a.save_interval ?? dt) || dt };
  const method = specs?.a.method;
  if (method && !/^euler$/i.test(method)) warn(`The model uses ${method} integration; the builder uses Euler, so results can differ a little (a smaller dt brings them closer).`);
  const dimNames = new Names(warn, false);
  const dims = kids(kid(root, "dimensions"), "dim").map((d) => {
    const els = kids(d, "elem").map((e) => e.a.name);
    return makeDim(d.a.name, els.length ? els : Array.from({ length: +d.a.size || 0 }, (_, j) => String(j + 1)), dimNames, warn);
  });
  const models = kids(root, "model");
  const main = models.find((m) => !m.a.name) ?? models[0];
  models.filter((m) => m !== main).forEach((m) => warn(`Skipped the module model ${m.a.name}: the builder has no modules.`));
  const names = new Names(warn);
  const c = baseCtx({ dims, names, time, warn }, false);
  // a macro that is one expression of its parameters is put in wherever it is called
  for (const m of kids(root, "macro")) {
    let body: E | undefined;
    try {
      body = kid(m, "variables") ? undefined : parseExpr(txt(kid(m, "eqn")).replace(/\{[^}]*\}/g, " "), false);
    } catch {
      body = undefined;
    }
    if (body) c.macros.set(keyOf(m.a.name ?? ""), { params: kids(m, "parm").map((x) => keyOf(txt(x))), body });
    else warn(`Skipped the macro ${m.a.name}: it is more than one expression, so equations that use it need rewriting.`);
  }
  const vars = kid(main, "variables")?.c ?? [];
  const gfOf = (g: X): Gf => {
    const list = (x?: X) => txt(x).split(x?.a.sep || ",").filter((s) => s.trim()).map(Number);
    const ys = list(kid(g, "ypts")), sc = kid(g, "xscale");
    let xs = list(kid(g, "xpts"));
    if (!xs.length) xs = ys.map((_, j) => +(sc?.a.min ?? 0) + (j * (+(sc?.a.max ?? ys.length - 1) - +(sc?.a.min ?? 0))) / Math.max(1, ys.length - 1));
    if (g.a.type === "discrete") warn(`${g.a.name ?? "A graphical function"} is a discrete (stepped) lookup; the builder interpolates between its points.`);
    return { xs, ys, extrap: g.a.type === "extrapolate" };
  };
  // non-negative: per element, or for all stocks or flows in <behavior>; <non_negative>false</non_negative> opts out
  const beh = kid(root, "behavior");
  const nn = (x: X | undefined, kind: string) => {
    const own = kid(x, "non_negative") ?? kid(kid(beh, kind), "non_negative") ?? kid(beh, "non_negative");
    return !!own && !/^false$/i.test(txt(own));
  };
  const eqText = (x: X | undefined) => txt(kid(x, "eqn")).replace(/\{[^}]*\}/g, " ").replace(/\\n/g, "_").trim();
  const MARK = "Lookup table from the builder's TABLE function.";

  // first the names, lookups and the builder's own helper lookups, so equations can refer forward
  const defs: X[] = [];
  for (const v of vars) {
    const k = keyOf(v.a.name ?? "");
    if (v.n === "module") warn(`Skipped the module ${v.a.name}: the builder has no modules.`);
    if (v.n === "gf") c.lookups.set(k, gfOf(v));
    if (!["stock", "flow", "aux"].includes(v.n) || !v.a.name || (v.n === "aux" && CTRL.has(k))) continue;
    const g = kid(v, "gf");
    if (g) c.lookups.set(k, gfOf(g));
    if (g && txt(kid(v, "doc")) === MARK) {
      c.inline.set(k, { input: parseExpr(eqText(v) || "TIME", false), gf: gfOf(g) });
      continue;
    }
    names.add(v.a.name);
    defs.push(v);
  }
  const items: Item[] = defs.map((v) => {
    const key = keyOf(v.a.name), name = names.map.get(key)!;
    const grid = kids(kid(v, "dimensions"), "dim").map((d) => dims.find((x) => x.key === keyOf(d.a.name))).filter((d): d is Dim => !!d);
    c.who = name;
    const one = (x: X, cell: string[]) => {
      c.cell = new Set(cell);
      const src = eqText(x) || eqText(v), g = kid(x, "gf") ?? kid(v, "gf");
      const s = src ? translate(src, c) : g ? "TIME" : (warn(`${name} has no equation; it is 0 for now.`), "0");
      return g ? table(s, gfOf(g), c) : s;
    };
    const els = kids(v, "element");
    let eq: Eqs;
    if (els.length) {
      const cells = new Map(els.map((x) => [(x.a.subscript ?? "").split(",").map(keyOf), x] as const).map(([k, x]) => [k.join("|"), one(x, k)]));
      eq = settle(name, grid, cells, warn);
    } else eq = { eq: one(v, []) };
    const it: Item = { kind: v.n === "stock" ? "stock" : v.n === "flow" ? "flow" : "var", key, name, ...eq, dim: grid.map((d) => d.name).join(", ") || undefined, units: txt(kid(v, "units")) || undefined, note: txt(kid(v, "doc")).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || undefined };
    if (v.n === "stock") {
      it.ins = kids(v, "inflow").map((x) => keyOf(txt(x)));
      it.outs = kids(v, "outflow").map((x) => keyOf(txt(x)));
      it.rate = { eq: [...it.ins.map((k) => refName(names.map.get(k) ?? k)), ...it.outs.map((k) => "- " + refName(names.map.get(k) ?? k))].join(" + ").replace(/\+ - /g, "- ") || "0" };
      if (nn(v, "stock")) it.nonNegative = true;
      if (kid(v, "conveyor") || kid(v, "queue")) warn(`${name} is a conveyor or queue in the original; it came across as a plain stock.`);
    }
    if (v.n === "flow" && nn(v, "flow")) {
      // a uniflow never runs backwards
      it.eq = `MAX(0, ${it.eq})`;
      if (it.eqs) it.eqs = Object.fromEntries(Object.entries(it.eqs).map(([k, x]) => [k, `MAX(0, ${x})`]));
    }
    return it;
  });

  const pos = new Map<string, [number, number]>(), arrows: [string, string][] = [];
  for (const view of kids(kid(main, "views"), "view"))
    for (const x of view.c) {
      if (x.a.name && x.a.x && ["stock", "flow", "aux"].includes(x.n) && !pos.has(keyOf(x.a.name))) pos.set(keyOf(x.a.name), [+x.a.x, +x.a.y]);
      if (x.n === "connector" && txt(kid(x, "from")) && txt(kid(x, "to"))) arrows.push([keyOf(txt(kid(x, "from"))), keyOf(txt(kid(x, "to")))]);
    }
  const name = txt(kid(kid(root, "header"), "name")) || "Imported model";
  return finish({ name, timeUnit: specs?.a.time_units || "time", time, dims, items, names, pos, arrows, warn }, warnings);
}

// ---------------------------------------------------------------------------------------------------
// Vensim .mdl

const csv = (l: string) => {
  const f: string[] = [];
  let cur = "", q = false;
  for (const ch of l) {
    if (ch === '"') q = !q;
    else if (ch === "," && !q) f.push(cur), (cur = "");
    else cur += ch;
  }
  return [...f, cur];
};

// exc: the elements an :EXCEPT: leaves out, one subscript list each; ast: the equation already read (a macro expanded)
type Entry = { raw: string; key: string; sub: string[]; op: string; rhs: string; units: string; doc: string; exc: string[][]; ast?: E };

export function importMdl(text: string): Imported {
  const warnings: string[] = [];
  const warn = (s: string) => void warnings.push(s);
  let src = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const cut = src.indexOf("\\\\\\---///");
  const sketch = cut < 0 ? "" : src.slice(cut);
  src = (cut < 0 ? src : src.slice(0, cut)).replace(/^\s*\{UTF-8\}/, "").replace(/\\[ \t]*\n/g, " ");
  // macros: set aside here, expanded where they are called (see expandMacro)
  const macros = new Map<string, { raw: string; key: string; params: string[]; body: Entry[] }>();
  src = src.replace(/:MACRO:\s*([^(\n]*)(?:\(([^)]*)\))?([\s\S]*?):END OF MACRO:/gi, (_, name: string, params: string | undefined, body: string) => {
    const raw = name.trim(), entries = readEntries(body);
    for (const e of entries)
      try {
        e.ast = ["=", "=="].includes(e.op) ? parseExpr(e.rhs, true) : undefined;
      } catch {
        e.ast = undefined;
      }
    // ponytail: one output, and equations only; Vensim's extra outputs (after a colon) need more than substitution
    if (params === undefined || params.includes(":") || !entries.some((e) => e.key === keyOf(raw)) || entries.some((e) => !e.ast || e.sub.length))
      warn(`Skipped the macro ${raw}: it has more than one output or something other than equations, so equations that use it need rewriting.`);
    else macros.set(keyOf(raw), { raw, key: keyOf(raw), params: params.split(",").map((x) => keyOf(x)), body: entries });
    return "";
  });
  const entries: Entry[] = [];
  readEntries(src).forEach((e) => expandMacro(e, 0));

  // entries: definition ~ units ~ comment |  (comments may hold stray quotes, so only the definition tracks them)
  function readEntries(src: string) {
    const entries: Entry[] = [];
    for (let i = 0; i < src.length; ) {
      let j = i, q = false;
      while (j < src.length && (q || (src[j] !== "~" && src[j] !== "|"))) (q = src[j] === '"' ? !q : q), j++;
      // :INTERPOLATE: and friends mark a data variable read from outside the model
      const raw0 = src.slice(i, j).trim(), def = raw0.replace(/:(INTERPOLATE|RAW|HOLD BACKWARD|LOOK FORWARD):/gi, "").trim();
      let units = "", doc = "";
      if (src[j] === "~") {
        const t = src.indexOf("~", j + 1), b = src.indexOf("|", j + 1) < 0 ? src.length : src.indexOf("|", j + 1);
        units = src.slice(j + 1, t >= 0 && t < b ? t : b);
        doc = t >= 0 && t < b ? src.slice(t + 1, b) : "";
        j = b;
      }
      i = j + 1;
      if (!def || def.startsWith("*")) continue;
      if (def !== raw0 && !/(:=|=)/.test(def)) {
        entries.push({ raw: def.replace(/\[[\s\S]*$/, "").trim(), key: keyOf(def.replace(/\[[\s\S]*$/, "")), sub: /\[([^\]]*)\]/.exec(def)?.[1].split(",").map((s) => s.trim()) ?? [], op: "", rhs: "", units: "", doc: "", exc: [] });
        continue;
      }
      const m = /^("(?:[^"\\]|\\.)*"|[^"[\](=:<]+?)\s*(?:\[([^\]]*)\])?\s*(:EXCEPT:[^=]*)?\s*(:=|==|=|\(|<->|:)([\s\S]*)$/i.exec(def) ?? /^("(?:[^"\\]|\\.)*"|[^"[\](=:<]+?)\s*(?:\[([^\]]*)\])?()()()\s*$/.exec(def);
      if (!m) {
        warn(`Could not read the definition "${def.slice(0, 60)}"; it was skipped.`);
        continue;
      }
      const raw = m[1].trim().replace(/^"|"$/g, "");
      const exc = [...(m[3] ?? "").matchAll(/\[([^\]]*)\]/g)].map((x) => x[1].split(",").map((s) => s.trim()));
      entries.push({ raw, key: keyOf(raw), sub: m[2] ? m[2].split(",").map((s) => s.trim()) : [], op: m[4], rhs: m[5].trim(), units: units.replace(/\[[\s\S]*$/, "").trim(), doc: doc.replace(/:SUPPLEMENTARY/gi, "").replace(/\s+/g, " ").trim(), exc });
    }
    return entries;
  }

  // A macro call becomes the macro's equations as new variables named after the caller ("macro output EXPRESSION
  // MACRO", "... intermediate"), with the call's arguments for the parameters; the call reads the output. Each call in
  // an equation gets its own set, shared by the caller's per-element definitions so they stay one array.
  function expandMacro(e: Entry, depth: number): void {
    let ast = e.ast;
    if (macros.size && !ast && ["=", "=="].includes(e.op))
      try {
        ast = parseExpr(e.rhs, true);
      } catch {
        ast = undefined;
      }
    if (!ast) return void entries.push(e);
    let n = 0;
    const go = (x: E): E => {
      if (x.k === "un") return { ...x, a: go(x.a) };
      if (x.k === "bin") return { ...x, a: go(x.a), b: go(x.b) };
      if (x.k !== "call") return x;
      const args = x.args.map(go), mac = macros.get(keyOf(x.raw));
      if (!mac || depth > 8) return { ...x, args };
      const prefix = `${e.raw} ${mac.raw}${++n > 1 ? ` ${n}` : ""}`; // n > 0: a macro was called
      const local = new Map(mac.body.map((b) => [b.key, b.key === mac.key ? prefix : `${prefix} ${b.raw}`]));
      const ps = new Map(mac.params.map((p, j) => [p, args[j] ?? ({ k: "num", v: 0 } as E)]));
      const rw = (y: E): E =>
        y.k === "id" ? (y.sub ? y : ps.get(y.key) ?? (local.has(y.key) ? { k: "id", key: keyOf(local.get(y.key)!), raw: local.get(y.key)! } : y)) : y.k === "call" ? { ...y, args: y.args.map(rw) } : y.k === "un" ? { ...y, a: rw(y.a) } : y.k === "bin" ? { ...y, a: rw(y.a), b: rw(y.b) } : y;
      for (const b of mac.body) expandMacro({ ...b, raw: local.get(b.key)!, key: keyOf(local.get(b.key)!), sub: e.sub, exc: e.exc, ast: rw(b.ast!) }, depth + 1);
      return { k: "id", key: keyOf(prefix), raw: prefix };
    };
    const out = go(ast);
    entries.push(n ? { ...e, ast: out } : e);
  }

  // dimensions (subscript ranges), equivalences after
  const dimNames = new Names(warn, false);
  const dims: Dim[] = [];
  const dimBy = (k: string) => dims.find((d) => d.key === k);
  for (const e of [...entries.filter((x) => x.op === ":"), ...entries.filter((x) => x.op === "<->")]) {
    let rhs = e.rhs;
    if (/->/.test(rhs)) (warn(`Dimension ${e.raw} maps onto another dimension (->); the mapping was dropped.`), (rhs = rhs.replace(/->[\s\S]*$/, "")));
    if (/^\s*GET\s/i.test(rhs)) {
      warn(`Dimension ${e.raw} reads its elements from a file; it was skipped.`);
      continue;
    }
    const els =
      e.op === "<->"
        ? [...(dimBy(keyOf(rhs))?.els ?? [])]
        : rhs.split(",").flatMap((s) => {
            s = s.trim();
            const r = /^\((\D*?)(\d+)\s*-\s*\D*?(\d+)\)$/.exec(s);
            if (r) return Array.from({ length: +r[3] - +r[2] + 1 }, (_, j) => r[1] + (+r[2] + j));
            return dimBy(keyOf(s))?.names ?? (s ? [s] : []);
          });
    dims.push(makeDim(e.raw, els, dimNames, warn));
  }

  // simulation control
  const ctrlRaw = new Map(entries.filter((e) => CTRL.has(e.key)).map((e) => [e.key, e]));
  const ctrl = (k: string, d: number, seen = 0): number => {
    const r = ctrlRaw.get(k)?.rhs ?? "";
    return isNum(r) ? +r : ctrlRaw.has(keyOf(r)) && seen < 4 ? ctrl(keyOf(r), d, seen + 1) : d;
  };
  const dt = ctrl("time_step", 1);
  const time = { start: ctrl("initial_time", 0), stop: ctrl("final_time", 100), dt, save: ctrl("saveper", dt) };
  const timeUnit = ctrlRaw.get("time_step")?.units || ctrlRaw.get("final_time")?.units || "time";

  const names = new Names(warn);
  const c = baseCtx({ dims, names, time, warn }, true);
  for (const e of entries.filter((x) => x.op === "(")) {
    if (e.sub.length && c.lookups.has(e.key)) continue;
    if (e.sub.length) warn(`The lookup ${e.raw} differs by element; the builder uses the first table for all.`);
    c.lookups.set(e.key, lookupPts(e.rhs.slice(0, e.rhs.lastIndexOf(")"))));
  }
  const groups = new Map<string, Entry[]>();
  for (const e of entries) if (["=", "==", ":=", ""].includes(e.op) && !CTRL.has(e.key)) groups.set(e.key, [...(groups.get(e.key) ?? []), e]);
  groups.forEach((g) => names.add(g[0].raw));

  // a subscript's elements: a dimension's, or one element
  const expandSub = (s: string) => dimBy(keyOf(s))?.els ?? [keyOf(s)];
  const items: Item[] = [];
  for (const [key, group] of groups) {
    const name = names.map.get(key)!;
    c.who = name;
    // each position's dimension: the smallest that holds every element the definitions cover
    const grid: Dim[] = group[0].sub.map((_, p) => {
      const cover = new Set(group.flatMap((e) => (e.sub[p] ? expandSub(e.sub[p]) : [])));
      const fits = dims.filter((d) => [...cover].every((x) => d.els.includes(x))).sort((a, b) => a.els.length - b.els.length || +(b.key === keyOf(group[0].sub[p])) - +(a.key === keyOf(group[0].sub[p])));
      if (!fits.length) warn(`${name}: could not find the dimension of [${group[0].sub.join(", ")}].`);
      return fits[0];
    }).filter((d): d is Dim => !!d);
    const cells = new Map<string, string>(), inits = new Map<string, string>(), rates = new Map<string, string>();
    let rate: E | undefined, stock = false;
    for (const e of group) {
      // the elements it defines, less any an :EXCEPT: leaves out; a definition for all elements but some does not
      // overwrite one for a single element
      const own = combos(e.sub.map(expandSub)).filter((k) => !e.exc.some((x) => x.length === k.length && x.every((s, p) => expandSub(s).includes(k[p])))).map((k) => k.join("|"));
      const set = (m: Map<string, string>, k: string, v: string) => (!e.exc.length || !m.has(k)) && m.set(k, v);
      const rhs = e.ast ? "" : e.rhs.replace(/^TABBED ARRAY\s*\(([\s\S]*)\)\s*$/i, (_, b: string) => b.trim().split(/\s+/).join(","));
      if (e.op === ":=" || !e.op || /^GET\s+(XLS|DIRECT|DATA|123|VDF)/i.test(rhs) || /^A FUNCTION OF\b/i.test(rhs)) {
        warn(/^A FUNCTION OF/i.test(rhs) ? `${name} has no equation yet (A FUNCTION OF); it is 0 for now.` : `${name} reads data from outside the model; it is a constant ${isNum(rhs) ? rhs : 0} for now. Give it data in the builder.`);
        own.forEach((k) => set(cells, k, isNum(rhs) ? rhs : "0"));
        continue;
      }
      const nums = rhs.split(/[\s,;]+/).filter(Boolean);
      if (nums.length && nums.every(isNum)) {
        if (nums.length > 1 && nums.length !== own.length) warn(`${name}: ${nums.length} values are given for ${own.length} elements.`);
        own.forEach((k, j) => set(cells, k, fmt(+(nums.length > 1 ? nums[j] ?? 0 : nums[0]))));
        continue;
      }
      let ast = e.ast;
      if (!ast)
        try {
          ast = parseExpr(rhs, true);
        } catch (err) {
          warn(`${name}: could not read the equation "${rhs.slice(0, 80)}" (${(err as Error).message}); it is kept as written.`);
        }
      own.forEach((k) => {
        c.cell = new Set(k.split("|"));
        if (ast?.k === "call" && ast.f === "INTEG") {
          stock = true;
          rate ??= ast.args[0];
          set(rates, k, tr(ast.args[0], c)[0]);
          set(inits, k, ast.args[1] ? tr(ast.args[1], c)[0] : "0");
        } else set(cells, k, ast ? tr(ast, c)[0] : rhs.replace(/\s+/g, " "));
      });
    }
    const last = group[group.length - 1];
    const it: Item = { kind: stock ? "stock" : "var", key, name, ...settle(name, grid, stock ? inits : cells, warn), dim: grid.map((d) => d.name).join(", ") || undefined, units: group.map((e) => e.units).find(Boolean) || undefined, note: last.doc || undefined };
    if (stock && rate) {
      // a sum and difference of other variables' names: those become the stock's flows
      const terms: [E, number][] = [];
      const flat = (x: E, s: number): void =>
        x.k === "bin" && (x.op === "+" || x.op === "-") ? (flat(x.a, s), flat(x.b, x.op === "-" ? -s : s)) : x.k === "un" && x.op !== "NOT" ? flat(x.a, x.op === "-" ? -s : s) : void terms.push([x, s]);
      flat(rate, 1);
      c.cell = new Set();
      if (new Set(rates.values()).size === 1 && terms.every(([x]) => x.k === "id" && groups.has(x.key) && !(x.sub ?? []).some((s) => !dimBy(keyOf(s))))) {
        it.ins = terms.filter((t) => t[1] > 0).map((t) => (t[0] as { key: string }).key);
        it.outs = terms.filter((t) => t[1] < 0).map((t) => (t[0] as { key: string }).key);
      }
      it.rate = settle(name, grid, rates, () => {});
    }
    items.push(it);
  }

  // the sketch: "10,id,name,x,y,..." places a variable; "11" is a valve, named by the variable line after it;
  // "1,id,from,to,..." is an arrow, from a valve when it is a pipe. Views are stacked one below the other.
  const pos = new Map<string, [number, number]>(), arrows: [string, string][] = [];
  let ids = new Map<string, string>(), valves = new Set<string>(), raw: [string, string][] = [], valve = "", yOff = 0, maxY = 0;
  const flush = () => raw.forEach(([a, b]) => !valves.has(a) && ids.has(a) && ids.has(b) && arrows.push([ids.get(a)!, ids.get(b)!]));
  for (const line of sketch.split("\n")) {
    if (line.startsWith("*")) (flush(), (ids = new Map()), (valves = new Set()), (raw = []), (yOff = maxY + 100));
    const f = csv(line);
    if (f[0] === "10" && f.length > 4) {
      const k = keyOf(f[2]);
      ids.set(f[1], k);
      if (valve) ids.set(valve, k);
      const y = +f[4] + yOff;
      maxY = Math.max(maxY, y);
      if (!pos.has(k) && Number.isFinite(+f[3]) && Number.isFinite(y)) pos.set(k, [+f[3], y]);
    }
    if (f[0] === "1") raw.push([f[2], f[3]]);
    valve = f[0] === "11" ? f[1] : "";
    if (valve) valves.add(valve);
  }
  flush();
  return finish({ name: "Imported model", timeUnit, time, dims, items, names, pos, arrows, warn }, warnings);
}

// ---------------------------------------------------------------------------------------------------

// Picks the importer from the file name (.xmile, .stmx, .itmx, .xml, .mdl) or, failing that, the content.
export function importModel(fileName: string, text: string): Imported {
  const ext = /\.([^.]+)$/.exec(fileName)?.[1]?.toLowerCase() ?? "";
  const xml = ["xmile", "stmx", "itmx", "xml"].includes(ext) || (ext !== "mdl" && text.trimStart().startsWith("<"));
  const r = xml ? importXmile(text) : importMdl(text);
  const base = fileName.replace(/^.*[\\/]/, "").replace(/\.[^.]+$/, "");
  if (r.model.name === "Imported model" && base) r.model.name = base;
  return r;
}
