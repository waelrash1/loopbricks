import type { Behaviour } from "@/data/behaviours";

// Tiny textbook curves for the behaviour filter chips: an icon of the shape, not data.
const ICON: Record<Behaviour, string> = {
  growth: "M0 38 L25 36 L50 33 L70 29 L90 22 L105 14 L120 2",
  decay: "M0 2 L15 15 L30 23 L50 30 L75 34 L120 37",
  goal: "M0 36 L15 24 L30 17 L50 12 L75 8 L120 7",
  sshape: "M0 38 L30 36 L45 30 L60 20 L75 10 L90 5 L120 3",
  oscillation: "M0 20 L15 7 L30 18 L45 29 L60 22 L75 14 L90 18 L105 24 L120 22",
  delay: "M0 36 L35 36 L45 24 L60 14 L80 8 L120 4",
};

export function ShapeIcon({ b }: { b: Behaviour }) {
  return (
    <svg viewBox="0 0 120 40" width="36" height="12" aria-hidden className="shrink-0">
      <path d={ICON[b]} fill="none" stroke="currentColor" strokeWidth={5} strokeLinejoin="round" />
    </svg>
  );
}

// A molecule's own default run, drawn as a line: y is the raw series, scaled to fill the box.
export function Sparkline({ y }: { y?: number[] }) {
  if (!y) return <div className="h-14 w-full" aria-hidden />;
  const step = Math.max(1, Math.floor(y.length / 60));
  const pts = y.filter((_, i) => i % step === 0 || i === y.length - 1);
  const lo = Math.min(...pts);
  const hi = Math.max(...pts);
  const span = hi - lo > 1e-2 * Math.max(Math.abs(hi), Math.abs(lo), 1e-9) ? hi - lo : 0;
  const d = pts
    .map((v, i) => `${i ? "L" : "M"}${((i / (pts.length - 1)) * 120).toFixed(2)} ${(span ? 37 - ((v - lo) / span) * 34 : 20).toFixed(2)}`)
    .join(" ");
  return (
    <svg viewBox="0 0 120 40" preserveAspectRatio="none" aria-hidden className="h-14 w-full">
      <path d={d} fill="none" stroke="var(--viz-acc)" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
