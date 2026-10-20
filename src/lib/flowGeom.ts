// Stock-flow notation: a flow is a hollow pipe ending in a solid arrowhead, distinct from thin information arrows.
type P = [number, number];

// the pipe stops where the head begins; the head's tip sits exactly on the flow's end point
// gap: stop the tip short of the end point (a sink cloud sits there)
export function flowShape(pts: P[], len = 18, half = 13, gap = 0) {
  const [ax, ay] = pts[pts.length - 2], [ex, ey] = pts[pts.length - 1];
  const d = Math.hypot(ex - ax, ey - ay) || 1, ux = (ex - ax) / d, uy = (ey - ay) / d;
  const bx = ex - ux * gap, by = ey - uy * gap;
  const base: P = [bx - ux * len, by - uy * len];
  const pipe = [...pts.slice(0, -1), [base[0] + ux * 2, base[1] + uy * 2] as P]; // 2px overlap hides the seam
  const head = `M ${bx} ${by} L ${base[0] - uy * half} ${base[1] + ux * half} L ${base[0] + uy * half} ${base[1] - ux * half} Z`;
  return { pipe: "M" + pipe.map((p) => p.join(",")).join(" L"), head };
}

// a valve: a bowtie across the pipe with a handle on top, drawn at (x, y)
export const valvePath = (x: number, y: number, r = 10) =>
  `M ${x - r} ${y - r} L ${x - r} ${y + r} L ${x} ${y} Z M ${x + r} ${y - r} L ${x + r} ${y + r} L ${x} ${y} Z`;

// end a curve short of the valve so its arrowhead stays visible: back off `gap` along the incoming tangent
export function shortenQ(cx: number, cy: number, x: number, y: number, gap = 13): P {
  const d = Math.hypot(x - cx, y - cy) || 1;
  return [x - ((x - cx) / d) * gap, y - ((y - cy) / d) * gap];
}

// geometric midpoint of a polyline by arc length → where the valve sits
export function midpoint(pts: [number, number][]): [number, number] {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  let half = total / 2;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (half <= seg) {
      const t = seg ? half / seg : 0;
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
    }
    half -= seg;
  }
  return pts[pts.length - 1];
}


// unit directions of a flow's first and last segments, to place source and sink clouds in line with the flow
export function endDirs(pts: [number, number][]) {
  const u = (a: P, b: P): P => {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
  };
  return { u0: u(pts[0], pts[1]), uN: u(pts[pts.length - 2], pts[pts.length - 1]) };
}
