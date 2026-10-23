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
// Added later, so a model may already use one of these as an element name (a spec has "Smooth3"): they are functions
// only when called, name( ... ), and are not reserved.
const MORE: Record<string, [number, number]> = {
  LOG: [2, 2],
  POWER: [2, 2],
  INT: [1, 1],
  MODULO: [2, 2],
  SIN: [1, 1],
  COS: [1, 1],
  TAN: [1, 1],
  ARCSIN: [1, 1],
  ARCCOS: [1, 1],
  ARCTAN: [1, 1],
  PI: [0, 0],
  ZIDZ: [2, 2],
  XIDZ: [3, 3],
  TABLE_EXTRAP: [5, 999],
  INITIAL: [1, 1],
  DELAY1: [2, 3],
  DELAY3: [2, 3],
  DELAYN: [3, 4],
  DELAY_FIXED: [3, 3],
  SMOOTH: [2, 3],
  SMOOTH3: [2, 3],
  SMOOTHN: [3, 4],
  TREND: [3, 3],
  FORECAST: [3, 3],
  RANDOM_UNIFORM: [2, 3],
  RANDOM_NORMAL: [4, 5],
  PROD: [1, 1],
};
const ALL_FUNCS = { ...FUNCS, ...MORE };
export const REDUCERS = new Set(["SUM", "MEAN", "VMIN", "VMAX", "PROD"]);
// Functions with memory: each call holds hidden stocks, which the builder adds to the model before a run (see lower in
// builder.ts). The evaluator never sees them.
export const STATEFUL = new Set(["INITIAL", "DELAY1", "DELAY3", "DELAYN", "DELAY_FIXED", "SMOOTH", "SMOOTH3", "SMOOTHN", "TREND", "FORECAST"]);
// the argument that holds a random function's seed
export const SEED_ARG: Record<string, number> = { RANDOM_UNIFORM: 2, RANDOM_NORMAL: 4 };
// The function reference shown in the builder: [name, signature, what it does]. CONTRACT for the builtins being added;
// the engine implements every entry, the exports translate it, the importers map XMILE and Vensim names onto it.
export const FUNCTION_DOCS: [string, string, string][] = [
  ["MIN", "MIN(a, b, ...)", "The smallest of its arguments."],
  ["MAX", "MAX(a, b, ...)", "The largest of its arguments."],
  ["ABS", "ABS(x)", "Absolute value."],
  ["EXP", "EXP(x)", "e to the power x."],
  ["LN", "LN(x)", "Natural logarithm."],
  ["LOG", "LOG(x, base)", "Logarithm to a base."],
  ["SQRT", "SQRT(x)", "Square root."],
  ["POWER", "POWER(a, b)", "a to the power b (same as a ^ b)."],
  ["INT", "INT(x)", "The integer part, dropping the fraction: INT(-2.5) is -2."],
  ["MODULO", "MODULO(a, b)", "The remainder of a divided by b, with the sign of a: a - b * INT(a / b)."],
  ["SIN", "SIN(x)", "Sine of x in radians; also COS, TAN, ARCSIN, ARCCOS, ARCTAN."],
  ["PI", "PI()", "3.14159..."],
  ["ZIDZ", "ZIDZ(a, b)", "a / b, or 0 when b is 0."],
  ["XIDZ", "XIDZ(a, b, x)", "a / b, or x when b is 0."],
  ["IF", "IF(condition, then, else)", "then when the condition holds (is not 0), otherwise else."],
  ["STEP", "STEP(height, time)", "0 before time, height from then on."],
  ["PULSE", "PULSE(height, start, width)", "height from start for width, otherwise 0."],
  ["RAMP", "RAMP(slope, start)", "0 before start, then rises by slope per time unit."],
  ["TABLE", "TABLE(x, x1, y1, x2, y2, ...)", "A lookup: y at x, linear between points, flat beyond the ends."],
  ["TABLE_EXTRAP", "TABLE_EXTRAP(x, x1, y1, ...)", "A lookup that continues the end slopes beyond the ends."],
  ["INITIAL", "INITIAL(x)", "The value x had at the start of the run, held fixed."],
  ["DELAY1", "DELAY1(input, delay time[, initial])", "A first-order material delay of the input."],
  ["DELAY3", "DELAY3(input, delay time[, initial])", "A third-order material delay: the output arrives bunched."],
  ["DELAYN", "DELAYN(input, delay time, order[, initial])", "A material delay of any order."],
  ["DELAY_FIXED", "DELAY_FIXED(input, delay time, initial)", "The input exactly delay time ago (a pipeline)."],
  ["SMOOTH", "SMOOTH(input, smoothing time[, initial])", "First-order exponential smoothing (an information delay)."],
  ["SMOOTH3", "SMOOTH3(input, smoothing time[, initial])", "Third-order smoothing."],
  ["SMOOTHN", "SMOOTHN(input, smoothing time, order[, initial])", "Smoothing of any order."],
  ["TREND", "TREND(input, averaging time, initial trend)", "The fractional rate of change of the input."],
  ["FORECAST", "FORECAST(input, averaging time, horizon)", "The input extrapolated horizon ahead from its trend."],
  ["RANDOM_UNIFORM", "RANDOM_UNIFORM(min, max[, seed])", "A new random number each time step, between min and max; the same seed repeats the run."],
  ["RANDOM_NORMAL", "RANDOM_NORMAL(min, max, mean, sd[, seed])", "Normal noise, cut off at min and max."],
  ["SUM", "SUM(X)", "Adds up an array X over all its elements; also MEAN, VMIN, VMAX, PROD."],
  ["MEAN", "MEAN(X)", "The average over an array."],
  ["VMIN", "VMIN(X)", "The smallest element of an array."],
  ["VMAX", "VMAX(X)", "The largest element of an array."],
  ["PROD", "PROD(X)", "Multiplies an array's elements."],
  ["TIME", "TIME", "The current time."],
  ["DT", "DT", "The time step."],
];
export const FUNCTION_NAMES = Object.keys(ALL_FUNCS);
// names an element may not take
export const RESERVED = new Set(["time", "dt", "integ", ...Object.keys(FUNCS).map((f) => f.toLowerCase())]);
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
        const range = ALL_FUNCS[upper];
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
        if (upper === "TABLE" || upper === "TABLE_EXTRAP") tableArgs(upper, args, t.p);
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
function tableArgs(f: string, args: Node[], p: number) {
  const pts = args.slice(1);
  if (pts.length % 2) throw new ExprError(`${f} needs a y for every x: after the input, give the points as x, y pairs (${at(p)})`, p);
  if (pts.length < 4) throw new ExprError(`${f} needs an input and at least 2 points: ${f}(input, x1, y1, x2, y2, ...) (${at(p)})`, p);
  const nums = pts.map(literal);
  if (nums.some((v) => v === undefined)) throw new ExprError(`${f} points must be plain numbers, not names or formulas (${at(p)})`, p);
  for (let j = 2; j < nums.length; j += 2)
    if (!(nums[j]! > nums[j - 2]!)) throw new ExprError(`${f} x values must increase: ${nums[j]} comes after ${nums[j - 2]} (${at(p)})`, p);
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
// the same, but beyond the ends the first and last segments carry on (TABLE_EXTRAP, and data with extrapolate)
export function tableExtrap(x: number, xs: number[], ys: number[]): number {
  const n = xs.length - 1;
  if (x < xs[0]) return ys[0] + ((ys[1] - ys[0]) / (xs[1] - xs[0])) * (x - xs[0]);
  if (x > xs[n]) return ys[n] + ((ys[n] - ys[n - 1]) / (xs[n] - xs[n - 1])) * (x - xs[n]);
  return table(x, xs, ys);
}

// Vensim's (and PySD's) ZIDZ and XIDZ treat a divisor below 1e-6 in size as zero
export const SMALL = 1e-6;

// A small seeded generator (mulberry32): the same seed gives the same numbers on every run and every machine.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Fn = (s: Scope) => number;
// stream: which element of an array this is, so each element draws its own random numbers
function build(n: Node, stream = 0): Fn {
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
      const a = build(n.a, stream);
      return (s) => -a(s);
    }
    case "bin": {
      const a = build(n.a, stream), b = build(n.b, stream);
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
      const f = n.args.map((a) => build(a, stream));
      const t = (s: Scope) => s.TIME ?? 0;
      switch (n.f) {
        case "MIN": return (s) => Math.min(...f.map((g) => g(s)));
        case "MAX": return (s) => Math.max(...f.map((g) => g(s)));
        case "ABS": return (s) => Math.abs(f[0](s));
        case "EXP": return (s) => Math.exp(f[0](s));
        case "LN": return (s) => Math.log(f[0](s));
        case "SQRT": return (s) => Math.sqrt(f[0](s));
        case "LOG": return (s) => Math.log(f[0](s)) / Math.log(f[1](s));
        case "POWER": return (s) => Math.pow(f[0](s), f[1](s));
        case "INT": return (s) => Math.trunc(f[0](s)); // towards zero, as Vensim's INTEGER and PySD
        case "MODULO": return (s) => f[0](s) % f[1](s); // Vensim's: the sign of a, so MODULO(-7, 3) is -1
        case "SIN": return (s) => Math.sin(f[0](s));
        case "COS": return (s) => Math.cos(f[0](s));
        case "TAN": return (s) => Math.tan(f[0](s));
        case "ARCSIN": return (s) => Math.asin(f[0](s));
        case "ARCCOS": return (s) => Math.acos(f[0](s));
        case "ARCTAN": return (s) => Math.atan(f[0](s));
        case "PI": return () => Math.PI;
        case "ZIDZ": return (s) => {
          const b = f[1](s);
          return Math.abs(b) < SMALL ? 0 : f[0](s) / b;
        };
        case "XIDZ": return (s) => {
          const b = f[1](s);
          return Math.abs(b) < SMALL ? f[2](s) : f[0](s) / b;
        };
        case "RANDOM_UNIFORM": case "RANDOM_NORMAL": {
          // one draw per time step: the value is kept until TIME moves on
          let next: (() => number) | undefined, at = NaN, v = 0;
          const k = SEED_ARG[n.f], normal = n.f === "RANDOM_NORMAL";
          return (s) => {
            const t = s.TIME ?? 0;
            if (t === at) return v;
            next ??= rng(Math.imul((f[k]?.(s) ?? 0) | 0, 0x9e3779b1) ^ Math.imul(stream + 1, 0x85ebca6b));
            at = t;
            const lo = f[0](s), hi = f[1](s);
            if (!normal) return (v = lo + (hi - lo) * next());
            // a normal draw (Box-Muller), drawn again until it lands between min and max: a truncated normal
            const mean = f[2](s), sd = f[3](s);
            for (let i = 0; i < 1000; i++) {
              v = mean + sd * Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next());
              if (v >= lo && v <= hi) return v;
            }
            return (v = Math.min(hi, Math.max(lo, v)));
          };
        }
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
        case "TABLE_EXTRAP": {
          const pts = n.args.slice(1).map((a) => literal(a)!);
          const xs = pts.filter((_, j) => j % 2 === 0), ys = pts.filter((_, j) => j % 2 === 1);
          return (s) => tableExtrap(f[0](s), xs, ys);
        }
        // a single value reduces to itself; arrays are expanded into their elements first (see expand)
        case "SUM": case "MEAN": case "VMIN": case "VMAX": case "PROD": return f[0];
      }
      if (STATEFUL.has(n.f))
        return () => {
          throw new Error(`${n.f} has memory: run it through the builder, which gives it its hidden stocks`);
        };
      throw new Error("unknown function " + n.f);
    }
  }
}

export const evaluator = (n: Node, stream = 0) => build(n, stream);

// An arrayed equation as plain scalar equations, for one element of the array. at(key) gives the element of an arrayed
// name to read here ("North" or, for several dimensions, "North,Young"), or undefined for a single value, which is left
// alone and so broadcasts. all(key) lists every element of an arrayed name, for SUM(X) and friends, which become
// arithmetic over X's elements (over all its dimensions at once).
export const slotKey = (key: string, element: string) => `${key}[${nameKey(element)}]`;
export function expand(n: Node, at: (key: string) => string | undefined, all: (key: string) => string[] | undefined): Node {
  const ex = (x: Node) => expand(x, at, all);
  switch (n.k) {
    case "name": {
      const e = at(n.key);
      return e !== undefined ? { ...n, key: slotKey(n.key, e), raw: `${n.raw}[${e}]` } : n;
    }
    case "neg": return { k: "neg", a: ex(n.a) };
    case "bin": return { ...n, a: ex(n.a), b: ex(n.b) };
    case "call": {
      const a = n.args[0], es = a?.k === "name" && REDUCERS.has(n.f) ? all(a.key) : undefined;
      if (!es || a.k !== "name") return { ...n, args: n.args.map(ex) };
      const parts: Node[] = es.map((e) => ({ ...a, key: slotKey(a.key, e), raw: `${a.raw}[${e}]` }));
      const chain = (op: string) => parts.reduce((x, y) => ({ k: "bin", op, a: x, b: y }));
      if (n.f === "SUM") return chain("+");
      if (n.f === "PROD") return chain("*");
      if (n.f === "MEAN") return { k: "bin", op: "/", a: chain("+"), b: { k: "num", v: parts.length } };
      return parts.length === 1 ? parts[0] : { k: "call", f: n.f === "VMIN" ? "MIN" : "MAX", args: parts };
    }
  }
  return n;
}

// A parse tree back as equation text, with only the brackets it needs (the builder writes hidden elements this way).
export function unparse(n: Node): string {
  return shown(n)[0];
}
function shown(n: Node): [string, number] {
  const w = (c: Node, min: number) => {
    const [s, p] = shown(c);
    return p < min ? `(${s})` : s;
  };
  switch (n.k) {
    case "num": return [String(n.v), 6];
    case "name": return [refName(n.raw), 6];
    case "time": return ["TIME", 6];
    case "dt": return ["DT", 6];
    case "neg": return ["-" + w(n.a, 4), 4];
    case "bin":
      if (n.op === "+" || n.op === "-") return [`${w(n.a, 2)} ${n.op} ${w(n.b, 3)}`, 2];
      if (n.op === "*" || n.op === "/") return [`${w(n.a, 3)} ${n.op} ${w(n.b, 4)}`, 3];
      if (n.op === "^") return [`${w(n.a, 6)} ^ ${w(n.b, 4)}`, 5];
      return [`${w(n.a, 2)} ${n.op} ${w(n.b, 2)}`, 1];
    case "call": return [`${n.f}(${n.args.map((a) => w(a, 0)).join(", ")})`, 6];
  }
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
