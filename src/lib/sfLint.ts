// Checks a teaching stock-and-flow diagram: references resolve, everything fits the canvas, boxes do not overlap,
// flows meet the stocks they name, and labels are not left floating. Returns readable errors.
import type { SfDiagram } from "@/data/sterman/types";
import { midpoint } from "@/lib/flowGeom";

export function lintSf(d: SfDiagram): string[] {
  const e: string[] = [];
  const [W, H] = d.size ?? [640, 300];
  const box = (s: SfDiagram["stocks"][number]) => ({ x0: s.x - (s.w ?? 120) / 2, x1: s.x + (s.w ?? 120) / 2, y0: s.y - (s.h ?? 64) / 2, y1: s.y + (s.h ?? 64) / 2 });
  const ids = new Set([...d.stocks.map((s) => s.id), ...d.flows.map((f) => f.id), ...(d.aux ?? []).map((a) => a.id)]);
  const stocks = Object.fromEntries(d.stocks.map((s) => [s.id, box(s)]));
  if (ids.size !== d.stocks.length + d.flows.length + (d.aux?.length ?? 0)) e.push("duplicate id");
  const inside = (x: number, y: number, m = 4) => x >= m && x <= W - m && y >= m && y <= H - m;
  d.stocks.forEach((s) => {
    const b = stocks[s.id];
    if (!inside(b.x0, b.y0) || !inside(b.x1, b.y1)) e.push(`stock ${s.id} is off the canvas`);
    if (s.label.length * 7.4 > b.x1 - b.x0 - 8) e.push(`stock ${s.id}: label "${s.label}" is wider than its box (set w)`);
  });
  for (let i = 0; i < d.stocks.length; i++)
    for (let j = i + 1; j < d.stocks.length; j++) {
      const a = stocks[d.stocks[i].id], b = stocks[d.stocks[j].id];
      if (a.x0 < b.x1 + 10 && b.x0 < a.x1 + 10 && a.y0 < b.y1 + 10 && b.y0 < a.y1 + 10) e.push(`stocks ${d.stocks[i].id} and ${d.stocks[j].id} overlap`);
    }
  const near = (p: [number, number], id: string) => {
    const b = stocks[id];
    const dx = Math.max(b.x0 - p[0], 0, p[0] - b.x1), dy = Math.max(b.y0 - p[1], 0, p[1] - b.y1);
    return Math.hypot(dx, dy) <= 3 && !(p[0] > b.x0 + 3 && p[0] < b.x1 - 3 && p[1] > b.y0 + 3 && p[1] < b.y1 - 3);
  };
  d.flows.forEach((f) => {
    if (f.pts.length < 2) return e.push(`flow ${f.id} needs two points`);
    f.pts.forEach((p) => !inside(p[0], p[1]) && e.push(`flow ${f.id} runs off the canvas`));
    if (f.from && !stocks[f.from]) e.push(`flow ${f.id}: unknown stock ${f.from}`);
    if (f.to && !stocks[f.to]) e.push(`flow ${f.id}: unknown stock ${f.to}`);
    if (f.from && stocks[f.from] && !near(f.pts[0], f.from)) e.push(`flow ${f.id} should start on the edge of ${f.from}`);
    if (f.to && stocks[f.to] && !near(f.pts[f.pts.length - 1], f.to)) e.push(`flow ${f.id} should end on the edge of ${f.to}`);
    // clouds sit 20px beyond an open end and need room
    if (!f.from && !inside(f.pts[0][0], f.pts[0][1], 24)) e.push(`flow ${f.id}: no room for its source cloud`);
    if (!f.to && !inside(f.pts[f.pts.length - 1][0], f.pts[f.pts.length - 1][1], 24)) e.push(`flow ${f.id}: no room for its sink cloud`);
    const [vx, vy] = midpoint(f.pts);
    Object.entries(stocks).forEach(([id, b]) => vx > b.x0 - 10 && vx < b.x1 + 10 && vy > b.y0 - 10 && vy < b.y1 + 10 && e.push(`flow ${f.id}: valve sits on stock ${id}`));
  });
  (d.links ?? []).forEach((l) => {
    if (!ids.has(l.from)) e.push(`link from unknown ${l.from}`);
    if (!ids.has(l.to)) e.push(`link to unknown ${l.to}`);
    if (stocks[l.to]) e.push(`link into stock ${l.to}: only flows change a stock`);
  });
  (d.aux ?? []).forEach((a) => {
    const half = a.label.length * 3.1, side = a.labelAt === "left" ? -1 : a.labelAt === "right" ? 1 : 0;
    const ends: [number, number][] = side ? [[a.x + side * (11 + 2 * half), a.y]] : [[a.x - half, a.labelAt === "above" ? a.y - 20 : a.y + 22], [a.x + half, a.y]];
    if (ends.some(([x, y]) => !inside(x, y))) e.push(`aux ${a.id} or its label is off the canvas`);
  });
  (d.loops ?? []).forEach((l) => !inside(l.x, l.y, 10) && e.push(`loop ${l.label} is off the canvas`));
  if (!d.caption && !d.note) e.push("needs a caption or note");
  return e;
}
