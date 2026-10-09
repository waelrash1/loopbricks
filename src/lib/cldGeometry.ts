// Pure layout for causal loop diagrams, shared by the renderer and scripts/check.ts
// so the clarity lint measures exactly what gets drawn.
import type { CldLink, CldVar, Model } from "@/data/molecules";

export const CLD_W = 520;
export const CLD_H = 270;
export const LOOP_R = 15; // radius of the B/R loop marker

export type Box = { id: string; x: number; y: number; w: number; h: number; cx: number; cy: number };
export type LinkGeo = {
  link: CldLink;
  d: string; // svg path
  sx: number; // where the +/− sign is centred
  sy: number;
  nx: number; // where the optional note is centred (always on the far side of the sign from the curve)
  ny: number;
  pts: [number, number][]; // samples along the drawn curve
};

export const nodeBox = (v: CldVar): Box => {
  const w = Math.max(64, v.label.length * 7.6 + 22);
  return { id: v.id, x: v.x - w / 2, y: v.y - 15, w, h: 30, cx: v.x, cy: v.y };
};

const edgePoint = (b: Box, tx: number, ty: number): [number, number] => {
  const dx = tx - b.cx,
    dy = ty - b.cy;
  const s = Math.min(dx ? b.w / 2 / Math.abs(dx) : 1e9, dy ? b.h / 2 / Math.abs(dy) : 1e9);
  return [b.cx + dx * s, b.cy + dy * s];
};

export const noteWidth = (note?: string) => (note ? note.length * 5.8 : 0);
const MIN_PAIR_BOW = 28; // a there-and-back pair must open into a visible lens
const SIGN_GAP = 11; // distance from the curve to the centre of its sign

export function layoutCld(cld: Model["cld"]): { boxes: Record<string, Box>; links: LinkGeo[] } {
  const boxes: Record<string, Box> = {};
  cld.vars.forEach((v) => (boxes[v.id] = nodeBox(v)));

  const links = cld.links.flatMap((l): LinkGeo[] => {
    const A = boxes[l.from],
      B = boxes[l.to];
    if (!A || !B) return [];
    if (l.self) {
      // hang the loop on the side away from the node's neighbours, so it doesn't fight incoming links
      const others = cld.links.filter((o) => !o.self && (o.from === l.from || o.to === l.from)).map((o) => boxes[o.from === l.from ? o.to : o.from]?.cy ?? A.cy);
      const below = others.length > 0 && others.reduce((t, y) => t + y, 0) / others.length < A.cy - 1;
      const k = below ? -1 : 1; // mirror vertically
      const x = A.cx,
        y = below ? A.y + A.h : A.y;
      return [
        {
          link: l,
          d: `M${x - 16},${y - 2 * k} C${x - 26},${y - 34 * k} ${x + 26},${y - 34 * k} ${x + 16},${y - 2 * k}`,
          sx: x + 32,
          sy: y - 24 * k,
          nx: x + 32,
          ny: y - 24 * k - 15 * k,
          pts: [
            [x - 19, y - 16 * k],
            [x, y - 26 * k],
            [x + 19, y - 16 * k],
          ],
        },
      ];
    }

    // A→B and B→A: the normal flips with direction, so giving both the same signed curve
    // puts them on opposite sides. Follow whichever of the pair is listed first.
    let cv = l.curve || 0;
    const first = cld.links.find((o) => !o.self && ((o.from === l.from && o.to === l.to) || (o.from === l.to && o.to === l.from)));
    const paired = cld.links.some((o) => !o.self && o.from === l.to && o.to === l.from);
    if (paired) cv = ((first?.curve || 0) > 0 ? 1 : -1) * Math.max(Math.abs(cv), MIN_PAIR_BOW);

    const [x1, y1] = edgePoint(A, B.cx, B.cy);
    const [x2, y2] = edgePoint(B, A.cx, A.cy);
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = -(y2 - y1) / len,
      ny = (x2 - x1) / len;
    const mx = (x1 + x2) / 2,
      my = (y1 + y2) / 2;
    const qx = mx + nx * cv,
      qy = my + ny * cv;
    // sign sits just outside the bulge; on a straight link prefer above the line
    const side = cv ? Math.sign(cv) : ny > 0 ? -1 : 1;
    const pts: [number, number][] = [];
    for (let t = 0.06; t < 0.95; t += 0.04) {
      const u = 1 - t;
      pts.push([u * u * x1 + 2 * u * t * qx + t * t * x2, u * u * y1 + 2 * u * t * qy + t * t * y2]);
    }
    const sx = mx + nx * (cv / 2 + side * SIGN_GAP),
      sy = my + ny * (cv / 2 + side * SIGN_GAP);
    // the note steps further out along the same normal; sideways moves also clear half its own width
    const noteW = noteWidth(l.note);
    return [
      {
        link: l,
        d: `M${x1},${y1} Q${qx},${qy} ${x2},${y2}`,
        sx,
        sy,
        nx: sx + nx * side * (10 + noteW / 2),
        ny: sy + ny * side * 15,
        pts,
      },
    ];
  });
  return { boxes, links };
}

// Every simple feedback loop in the link graph, with its polarity (odd number of − links = balancing).
export function loopsIn(cld: Model["cld"]): ("B" | "R")[] {
  const ids = cld.vars.map((v) => v.id);
  const found: ("B" | "R")[] = [];
  const walk = (start: string, node: string, seen: string[], negs: number) => {
    for (const l of cld.links) {
      if (l.from !== node) continue;
      const n = negs + (l.sign === "+" ? 0 : 1);
      if (l.to === start) found.push(n % 2 ? "B" : "R");
      else if (!seen.includes(l.to) && ids.indexOf(l.to) > ids.indexOf(start)) walk(start, l.to, [...seen, l.to], n);
    }
  };
  ids.forEach((s) => walk(s, s, [s], 0));
  return found;
}

// Human-readable clarity problems for one diagram; empty means clean.
export function lintCld(cld: Model["cld"]): string[] {
  const { boxes, links } = layoutCld(cld);
  const B = Object.values(boxes);
  const p: string[] = [];
  const inBox = (x: number, y: number, b: Box, pad = 0) => x > b.x - pad && x < b.x + b.w + pad && y > b.y - pad && y < b.y + b.h + pad;
  const name = (g: LinkGeo) => `${g.link.from}→${g.link.to}`;

  B.forEach((b) => (b.x < 2 || b.y < 2 || b.x + b.w > CLD_W - 2 || b.y + b.h > CLD_H - 2) && p.push(`node "${b.id}" is outside the canvas`));
  B.forEach((a, i) =>
    B.slice(i + 1).forEach((b) => a.x < b.x + b.w + 6 && b.x < a.x + a.w + 6 && a.y < b.y + b.h + 6 && b.y < a.y + a.h + 6 && p.push(`nodes "${a.id}" and "${b.id}" touch`))
  );
  cld.links.forEach((l) => (!boxes[l.from] || !boxes[l.to]) && p.push(`link ${l.from}→${l.to} names an unknown node`));
  const used = new Set(cld.links.flatMap((l) => [l.from, l.to]));
  cld.vars.forEach((v) => !used.has(v.id) && p.push(`node "${v.id}" has no links`));

  for (const g of links) {
    if (g.sx < 8 || g.sx > CLD_W - 8 || g.sy < 8 || g.sy > CLD_H - 8) p.push(`sign of ${name(g)} is outside the canvas`);
    if (g.pts.some(([x, y]) => x < 3 || x > CLD_W - 3 || y < 3 || y > CLD_H - 3)) p.push(`link ${name(g)} leaves the canvas`);
    B.forEach((b) => inBox(g.sx, g.sy, b, 5) && p.push(`sign of ${name(g)} sits on node "${b.id}"`));
    if (g.link.self) continue;
    const [a, z] = [g.pts[0], g.pts[g.pts.length - 1]];
    if (Math.hypot(z[0] - a[0], z[1] - a[1]) < 30) p.push(`link ${name(g)} is too short to read`);
    B.forEach((b) => b.id !== g.link.from && b.id !== g.link.to && g.pts.some(([x, y]) => inBox(x, y, b, 2)) && p.push(`link ${name(g)} runs through node "${b.id}"`));
    if (g.link.note) {
      const w = noteWidth(g.link.note);
      const hit = (x: number, y: number, pad: number) => x > g.nx - w / 2 - pad && x < g.nx + w / 2 + pad && y > g.ny - 7 - pad && y < g.ny + 7 + pad;
      if (g.nx - w / 2 < 2 || g.nx + w / 2 > CLD_W - 2 || g.ny < 9 || g.ny > CLD_H - 9) p.push(`note "${g.link.note}" is clipped`);
      B.forEach((b) => g.nx - w / 2 < b.x + b.w && b.x < g.nx + w / 2 && g.ny - 7 < b.y + b.h && b.y < g.ny + 7 && p.push(`note "${g.link.note}" overlaps node "${b.id}"`));
      links.forEach((o) => o.pts.some(([x, y]) => hit(x, y, 1)) && p.push(`note "${g.link.note}" crosses link ${name(o)}`));
      links.forEach((o) => o !== g && hit(o.sx, o.sy, 5) && p.push(`note "${g.link.note}" collides with the sign of ${name(o)}`));
      cld.loops.forEach((lp) => hit(lp.x, lp.y, LOOP_R) && p.push(`note "${g.link.note}" collides with loop marker ${lp.label}`));
    }
  }
  links.forEach((a, i) =>
    links.slice(i + 1).forEach((b) => {
      if (Math.hypot(a.sx - b.sx, a.sy - b.sy) < 13) p.push(`signs of ${name(a)} and ${name(b)} collide`);
      // other links' signs should not sit on this curve
      if (b.pts.some(([x, y]) => Math.hypot(x - a.sx, y - a.sy) < 6)) p.push(`sign of ${name(a)} sits on link ${name(b)}`);
      if (a.pts.some(([x, y]) => Math.hypot(x - b.sx, y - b.sy) < 6)) p.push(`sign of ${name(b)} sits on link ${name(a)}`);
    })
  );

  for (const lp of cld.loops) {
    if (lp.x < LOOP_R + 4 || lp.x > CLD_W - LOOP_R - 4 || lp.y < LOOP_R + 4 || lp.y > CLD_H - LOOP_R - 4) p.push(`loop marker ${lp.label} is outside the canvas`);
    B.forEach((b) => inBox(lp.x, lp.y, b, LOOP_R) && p.push(`loop marker ${lp.label} overlaps node "${b.id}"`));
    links.forEach((g) => {
      if (g.pts.some(([x, y]) => Math.hypot(x - lp.x, y - lp.y) < LOOP_R + 2)) p.push(`loop marker ${lp.label} sits on link ${name(g)}`);
      if (Math.hypot(g.sx - lp.x, g.sy - lp.y) < LOOP_R + 7) p.push(`loop marker ${lp.label} collides with the sign of ${name(g)}`);
    });
  }
  cld.loops.forEach((a, i) => cld.loops.slice(i + 1).forEach((b) => Math.hypot(a.x - b.x, a.y - b.y) < 2 * LOOP_R + 4 && p.push(`loop markers ${a.label} and ${b.label} overlap`)));

  const real = loopsIn(cld);
  const count = (xs: string[], t: string) => xs.filter((x) => x === t).length;
  const marked = cld.loops.map((l) => l.type as string);
  if (count(real, "B") !== count(marked, "B") || count(real, "R") !== count(marked, "R"))
    p.push(`links form ${count(real, "B")} balancing and ${count(real, "R")} reinforcing loops, but ${count(marked, "B")} B and ${count(marked, "R")} R are marked`);
  if (!cld.caption) p.push("no caption");
  return [...new Set(p)];
}
