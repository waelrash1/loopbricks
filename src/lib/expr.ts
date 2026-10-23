// A small, safe expression language for model equations: parsed by hand, evaluated by walking closures.
// No eval and no new Function. Names are case-insensitive; spaces in a name are written as underscores
// (birth_fraction) or the whole name is quoted ("birth fraction").

export class ExprError extends Error {
  // pos is 0-based; messages count characters from 1, as people do
  constructor(message: string, public pos: number) {
    super(message);
    this.name = "ExprError";
  }
}

export type Scope = Record<string, number>; // keys from nameKey(); TIME and DT live under the upper-case keys
export type Node =
  | { k: "num"; v: number }
  | { k: "name"; key: string; raw: string; p: number }
  | { k: "time" }
  | { k: "dt" }
  | { k: "neg"; a: Node }
  | { k: "bin"; op: string; a: Node; b: Node }
  | { k: "call"; f: string; args: Node[] };
export type Compiled = { src: string; ast: Node; refs: string[]; usesTime: boolean; eval: (scope: Scope) => number };

type Tok = { t: "num"; v: number; p: number } | { t: "name"; v: string; raw: string; p: number; end: number; quoted: boolean } | { t: "op"; v: string; p: number } | { t: "end"; p: number };

// the key an element is looked up by: lower case, runs of spaces as one underscore
export const nameKey = (name: string) => name.trim().toLowerCase().replace(/[\s_]+/g, "_");
// how to write a name inside an equation
export const refName = (name: string) => name.trim().replace(/\s+/g, "_");

const FUNCS: Record<string, [number, number]> = {
  MIN: [2, 99],
  MAX: [2, 99],
  ABS: [1, 1],
  EXP: [1, 1],
  LN: [1, 1],
  SQRT: [1, 1],
  IF: [3, 3],
  STEP: [2, 2],
  PULSE: [3, 3],
  RAMP: [2, 2],
  TABLE: [5, 999], // TABLE(x, x1, y1, x2, y2, ...): checked further in tableArgs
  TIME: [0, 0],
  // reducers: an arrayed element to one number, SUM(Population); the argument must be a name
  SUM: [1, 1],
  MEAN: [1, 1],
  VMIN: [1, 1],
  VMAX: [1, 1],
};
export const REDUCERS = new Set(["SUM", "MEAN", "VMIN", "VMAX"]);
export const FUNCTION_NAMES = Object.keys(FUNCS);
// names an element may not take
export const RESERVED = new Set(["time", "dt", "integ", ...FUNCTION_NAMES.map((f) => f.toLowerCase())]);
export const NAME_RE = /^[\p{L}_][\p{L}\p{N}_ ]*$/u;

const OPS: Record<string, string> = { "+": "+", "-": "-", "−": "-", "–": "-", "*": "*", "×": "*", "·": "*", "/": "/", "÷": "/", "^": "^", "(": "(", ")": ")", ",": ",", "<": "<", ">": ">", "=": "=", "≤": "<=", "≥": ">=", "≠": "<>" };
const show = (t: Tok) => (t.t === "end" ? "the end" : t.t === "num" ? `"${t.v}"` : t.t === "name" ? `"${t.raw}"` : `"${t.v}"`);
const at = (p: number) => `at character ${p + 1}`;

export function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    const rest = src.slice(i);
    const num = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(rest);
    if (num) {
      out.push({ t: "num", v: parseFloat(num[0]), p: i });
      i += num[0].length;
      if (/^[\p{L}_]/u.test(src.slice(i))) throw new ExprError(`A number runs into a name ${at(i)}; put * between them`, i);
      continue;
    }
    const id = /^[\p{L}_][\p{L}\p{N}_]*/u.exec(rest);
    if (id) {
      out.push({ t: "name", v: nameKey(id[0]), raw: id[0], p: i, end: i + id[0].length, quoted: false });
      i += id[0].length;
      continue;
    }
    if (c === '"') {
      const close = src.indexOf('"', i + 1);
      if (close < 0) throw new ExprError(`Missing closing quote for the name that starts ${at(i)}`, i);
      const raw = src.slice(i + 1, close);
      if (!raw.trim()) throw new ExprError(`Empty quoted name ${at(i)}`, i);
      out.push({ t: "name", v: nameKey(raw), raw, p: i, end: close + 1, quoted: true });
      i = close + 1;
      continue;
    }
    const two = src.slice(i, i + 2);
    if (two === "<=" || two === ">=" || two === "<>" || two === "!=") {
      out.push({ t: "op", v: two === "!=" ? "<>" : two, p: i });
      i += 2;
      continue;
    }
    if (OPS[c]) {
      out.push({ t: "op", v: OPS[c], p: i });
      i++;
      continue;
    }
    throw new ExprError(`Unexpected character "${c}" ${at(i)}`, i);
  }
  out.push({ t: "end", p: src.length });
  return out;
}

export function parse(src: string): Node {
  if (!src.trim()) throw new ExprError("The equation is empty", 0);
  const toks = tokenize(src);
  let i = 0;
  const peek = () => toks[i];
  const isOp = (v: string) => peek().t === "op" && (peek() as { v: string }).v === v;
  const expect = (v: string, open?: Tok) => {
    if (isOp(v)) return void i++;
    const t = peek();
    if (v === ")" && open) throw new ExprError(`Missing ")" to close the "(" ${at(open.p)}; found ${show(t)} ${at(t.p)}`, t.p);
    throw new ExprError(`Expected "${v}" but found ${show(t)} ${at(t.p)}`, t.p);
  };

  const CMP = ["<", "<=", ">", ">=", "=", "<>"];
  function cmp(): Node {
    let a = add();
    while (peek().t === "op" && CMP.includes((peek() as { v: string }).v)) {
      const op = (toks[i++] as { v: string }).v;
      a = { k: "bin", op, a, b: add() };
    }
    return a;
  }
  function add(): Node {
    let a = mul();
    while (isOp("+") || isOp("-")) {
      const op = (toks[i++] as { v: string }).v;
      a = { k: "bin", op, a, b: mul() };
    }
    return a;
  }
  function mul(): Node {
    let a = unary();
    while (isOp("*") || isOp("/")) {
      const op = (toks[i++] as { v: string }).v;
      a = { k: "bin", op, a, b: unary() };
    }
    return a;
  }
  // -2^2 is -(2^2), and 2^-1 works: unary sits below power, and the exponent is itself unary (right-associative)
  function unary(): Node {
    if (isOp("-")) {
      i++;
      return { k: "neg", a: unary() };
    }
    if (isOp("+")) {
      i++;
      return unary();
    }
    return pow();
  }
  function pow(): Node {
    const a = primary();
    if (isOp("^")) {
      i++;
      return { k: "bin", op: "^", a, b: unary() };
    }
    return a;
  }
  function primary(): Node {
    const t = peek();
    if (t.t === "num") {
      i++;
      return { k: "num", v: t.v };
    }
    if (t.t === "op" && t.v === "(") {
      i++;
      const e = cmp();
      expect(")", t);
      return e;
    }
    if (t.t === "name") {
      i++;
      const upper = t.raw.toUpperCase();
      if (!t.quoted && isOp("(")) {
        const open = toks[i++];
        const range = FUNCS[upper];
        if (!range) throw new ExprError(`Unknown function "${t.raw}" ${at(t.p)}. Functions: ${FUNCTION_NAMES.join(", ")}`, t.p);
        const args: Node[] = [];
        if (!isOp(")")) {
          args.push(cmp());
          while (isOp(",")) {
            i++;
            args.push(cmp());
          }
        }
        expect(")", open);
        if (upper === "TABLE") tableArgs(args, t.p);
        const [lo, hi] = range;
        if (args.length < lo || args.length > hi) {
          const want = lo === hi ? `${lo}` : hi > 10 ? `at least ${lo}` : `${lo} to ${hi}`;
          throw new ExprError(`${upper} takes ${want} argument${lo === 1 && hi === 1 ? "" : "s"}, not ${args.length} (${at(t.p)})`, t.p);
        }
        if (upper === "TIME") return { k: "time" };
        if (REDUCERS.has(upper) && args[0].k !== "name") throw new ExprError(`${upper} takes the name of an arrayed element, such as ${upper}(Population) (${at(t.p)})`, t.p);
        return { k: "call", f: upper, args };
      }
      if (!t.quoted && upper === "TIME") return { k: "time" };
      if (!t.quoted && upper === "DT") return { k: "dt" };
      if (!t.quoted && FUNCS[upper]) throw new ExprError(`${upper} is a function: write ${upper}(...) ${at(t.p)}`, t.p);
      return { k: "name", key: t.v, raw: t.raw, p: t.p };
    }
    if (t.t === "end") throw new ExprError(`The equation ends too early: expected a number, a name or "(" ${at(t.p)}`, t.p);
    throw new ExprError(`Unexpected ${show(t)} ${at(t.p)}`, t.p);
  }

  const e = cmp();
  const t = peek();
  if (t.t !== "end") {
    if (t.t === "op" && t.v === ")") throw new ExprError(`Unexpected ")" ${at(t.p)}: there is no "(" to match it`, t.p);
    throw new ExprError(`Unexpected ${show(t)} ${at(t.p)}; is an operator missing?`, t.p);
  }
  return e;
}

// a plain number, or a minus sign and a number
export const literal = (n: Node): number | undefined => (n.k === "num" ? n.v : n.k === "neg" && n.a.k === "num" ? -n.a.v : undefined);

// TABLE's points must be numbers, in pairs, at least two, with x increasing
function tableArgs(args: Node[], p: number) {
  const pts = args.slice(1);
  if (pts.length % 2) throw new ExprError(`TABLE needs a y for every x: after the input, give the points as x, y pairs (${at(p)})`, p);
  if (pts.length < 4) throw new ExprError(`TABLE needs an input and at least 2 points: TABLE(input, x1, y1, x2, y2, ...) (${at(p)})`, p);
  const nums = pts.map(literal);
  if (nums.some((v) => v === undefined)) throw new ExprError(`TABLE points must be plain numbers, not names or formulas (${at(p)})`, p);
  for (let j = 2; j < nums.length; j += 2)
    if (!(nums[j]! > nums[j - 2]!)) throw new ExprError(`TABLE x values must increase: ${nums[j]} comes after ${nums[j - 2]} (${at(p)})`, p);
}

// piecewise linear between the points, flat beyond the ends (as Vensim lookups behave)
export function table(x: number, xs: number[], ys: number[]): number {
  if (Number.isNaN(x)) return NaN;
  const n = xs.length - 1;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n]) return ys[n];
  let i = 0;
  while (x >= xs[i + 1]) i++;
  return ys[i] + ((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i])) * (x - xs[i]);
}

type Fn = (s: Scope) => number;
function build(n: Node): Fn {
  switch (n.k) {
    case "num": {
      const v = n.v;
      return () => v;
    }
    case "time":
      return (s) => s.TIME ?? 0;
    case "dt":
      return (s) => s.DT ?? 1;
    case "name": {
      const { key, raw, p } = n;
      return (s) => {
        const v = s[key];
        if (v === undefined) throw new ExprError(`Unknown name "${raw}"`, p);
        return v;
      };
    }
    case "neg": {
      const a = build(n.a);
      return (s) => -a(s);
    }
    case "bin": {
      const a = build(n.a), b = build(n.b);
      switch (n.op) {
        case "+": return (s) => a(s) + b(s);
        case "-": return (s) => a(s) - b(s);
        case "*": return (s) => a(s) * b(s);
        case "/": return (s) => a(s) / b(s);
        case "^": return (s) => Math.pow(a(s), b(s));
        case "<": return (s) => +(a(s) < b(s));
        case "<=": return (s) => +(a(s) <= b(s));
        case ">": return (s) => +(a(s) > b(s));
        case ">=": return (s) => +(a(s) >= b(s));
        case "=": return (s) => +(a(s) === b(s));
        case "<>": return (s) => +(a(s) !== b(s));
      }
      throw new Error("unknown operator " + n.op);
    }
    case "call": {
      const f = n.args.map(build);
      const t = (s: Scope) => s.TIME ?? 0;
      switch (n.f) {
        case "MIN": return (s) => Math.min(...f.map((g) => g(s)));
        case "MAX": return (s) => Math.max(...f.map((g) => g(s)));
        case "ABS": return (s) => Math.abs(f[0](s));
        case "EXP": return (s) => Math.exp(f[0](s));
        case "LN": return (s) => Math.log(f[0](s));
        case "SQRT": return (s) => Math.sqrt(f[0](s));
        case "IF": return (s) => (f[0](s) !== 0 ? f[1](s) : f[2](s)); // only the chosen branch is evaluated
        case "STEP": return (s) => (t(s) >= f[1](s) - 1e-9 ? f[0](s) : 0);
        case "PULSE":
          return (s) => {
            const start = f[1](s), w = f[2](s) > 0 ? f[2](s) : s.DT ?? 1; // a zero width lasts one time step
            return t(s) >= start - 1e-9 && t(s) < start + w - 1e-9 ? f[0](s) : 0;
          };
        case "RAMP": return (s) => (t(s) > f[1](s) ? f[0](s) * (t(s) - f[1](s)) : 0);
        case "TABLE": {
          const pts = n.args.slice(1).map((a) => literal(a)!);
          const xs = pts.filter((_, j) => j % 2 === 0), ys = pts.filter((_, j) => j % 2 === 1);
          return (s) => table(f[0](s), xs, ys);
        }
        // a single value reduces to itself; arrays are expanded into their elements first (see expand)
        case "SUM": case "MEAN": case "VMIN": case "VMAX": return f[0];
      }
      throw new Error("unknown function " + n.f);
    }
  }
}

export const evaluator = (n: Node) => build(n);

// An arrayed equation as plain scalar equations: for element `at`, a reference to an arrayed name reads that name's
// value for the element (scope key "population[north]"), and SUM(X) and friends become arithmetic over X's elements.
// elementsOf gives an arrayed name's elements; scalar names are left alone, so they broadcast.
export const slotKey = (key: string, element: string) => `${key}[${nameKey(element)}]`;
export function expand(n: Node, at: string | undefined, elementsOf: (key: string) => string[] | undefined): Node {
  const ex = (x: Node) => expand(x, at, elementsOf);
  switch (n.k) {
    case "name": {
      const es = elementsOf(n.key);
      return es && at !== undefined ? { ...n, key: slotKey(n.key, at), raw: `${n.raw}[${at}]` } : n;
    }
    case "neg": return { k: "neg", a: ex(n.a) };
    case "bin": return { ...n, a: ex(n.a), b: ex(n.b) };
    case "call": {
      const a = n.args[0], es = a?.k === "name" && REDUCERS.has(n.f) ? elementsOf(a.key) : undefined;
      if (!es || a.k !== "name") return { ...n, args: n.args.map(ex) };
      const parts: Node[] = es.map((e) => ({ ...a, key: slotKey(a.key, e), raw: `${a.raw}[${e}]` }));
      const sum = parts.reduce((x, y) => ({ k: "bin", op: "+", a: x, b: y }));
      if (n.f === "SUM") return sum;
      if (n.f === "MEAN") return { k: "bin", op: "/", a: sum, b: { k: "num", v: parts.length } };
      return parts.length === 1 ? parts[0] : { k: "call", f: n.f === "VMIN" ? "MIN" : "MAX", args: parts };
    }
  }
  return n;
}

export function walk(n: Node, visit: (n: Node) => void) {
  visit(n);
  if (n.k === "neg") walk(n.a, visit);
  else if (n.k === "bin") (walk(n.a, visit), walk(n.b, visit));
  else if (n.k === "call") n.args.forEach((a) => walk(a, visit));
}

export function compile(src: string): Compiled {
  const ast = parse(src);
  const refs: string[] = [];
  let usesTime = false;
  walk(ast, (n) => {
    if (n.k === "name" && !refs.includes(n.key)) refs.push(n.key);
    if (n.k === "time" || (n.k === "call" && ["STEP", "PULSE", "RAMP"].includes(n.f))) usesTime = true;
  });
  return { src, ast, refs, usesTime, eval: build(ast) };
}

const cache = new Map<string, Compiled | ExprError>();
// compile, remembering results; parse errors come back as values rather than thrown
export function tryCompile(src: string): { ok: true; c: Compiled } | { ok: false; error: ExprError } {
  let r = cache.get(src);
  if (!r) {
    try {
      r = compile(src);
    } catch (e) {
      r = e instanceof ExprError ? e : new ExprError(String(e), 0);
    }
    if (cache.size > 2000) cache.clear();
    cache.set(src, r);
  }
  return r instanceof ExprError ? { ok: false, error: r } : { ok: true, c: r };
}

// rewrite every reference to oldKey as newName, leaving the rest of the text alone
export function renameRefs(src: string, oldKey: string, newName: string): string {
  let toks: Tok[];
  try {
    toks = tokenize(src);
  } catch {
    return src;
  }
  let out = "", last = 0;
  for (let j = 0; j < toks.length; j++) {
    const t = toks[j];
    if (t.t !== "name" || t.v !== oldKey) continue;
    const nx = toks[j + 1];
    if (!t.quoted && nx?.t === "op" && nx.v === "(") continue; // a function call, not a name
    out += src.slice(last, t.p) + refName(newName);
    last = t.end;
  }
  return out + src.slice(last);
}
