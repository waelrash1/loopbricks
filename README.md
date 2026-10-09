# LoopBricks

Run, poke and predict the 71 building blocks of system-dynamics models. Every
molecule has a live stock-and-flow diagram, a causal loop diagram, its
equations, and a short lesson that asks you to guess the behaviour before you
press play.

## Main reference

This app is an interactive companion to:

> Jim Hines, *Molecules of Structure: Building Blocks for System Dynamics
> Models*, Version 2.03. Copyright © 1996, 1997, 2004, 2005, 2015 Jim Hines.

The molecules, their names, their family tree ("immediate parents") and their
equations come from that book. The causal loop diagrams, default parameter
values, lessons and the small wrapper stocks used to animate stockless
molecules are additions made for this app, and any mistakes in them are ours,
not the book's. The book itself is not included in this repository.

## Acknowledgements

Created and directed by **Wael Rashwan**, who conceived the app, chose the
design directions and reviewed every molecule against the book.
Thanks to Jim Hines and the many modellers he credits for the molecules.
Built with the help of Claude Code.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build to dist/
npm run check      # verifies every molecule simulates and every diagram is readable
```

## Add a molecule

Everything is data-driven. Append an entry to `MODELS` in
`src/data/molecules.ts` (or a file in `src/data/extra/`): `stocks`, `params`,
`rates()`, `derivs()`, the `diagram` geometry, the `cld` spec and the `desc`
HTML. Add it to a group in `GROUPS`, then run `npm run check`.

## Layout

- `src/sim/engine.ts`: Euler integrator.
- `src/data/`: molecule definitions, lessons, presets, family tree.
- `src/components/`: diagrams, chart, controls, sidebar, overview map.
- `src/lib/cldGeometry.ts`: causal loop layout and the clarity lint.
- `src/themes.css`: the seven switchable themes.
