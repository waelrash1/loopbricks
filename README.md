# System Dynamics · Molecules of Structure

Interactive simulator + causal-loop explainer. Vite + React + TypeScript + Tailwind + shadcn/ui.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build to dist/
npm run typecheck  # tsc --noEmit
```

## Get it into Lovable

This is already Lovable's stack. Either:
- **Push to GitHub** and use Lovable's "Import from GitHub", or
- Paste files into a new Lovable project — paths and aliases (`@/`) already match.

## Add a molecule

Everything is data-driven. To add one, append an entry to `MODELS` in
`src/data/molecules.ts`: define `stocks`, `params`, `rates()`, `derivs()`,
the `diagram` geometry, the `cld` (causal loop) spec, and the `desc` HTML.
No component changes needed — the engine, diagram, CLD and chart all read it.

## Layout

- `src/sim/engine.ts` — pure Euler integrator (`stepOnce`, history).
- `src/hooks/useSimulation.ts` — rAF loop; drives animation via a subscriber
  pattern so React never re-renders at 60fps.
- `src/components/` — `StockFlowDiagram`, `CausalLoopDiagram`, `TimeSeriesChart`,
  `Controls`, `Sidebar`.
- `src/data/molecules.ts` — all model definitions + prose.
- `src/pages/MoleculeExplorer.tsx` — the page.
