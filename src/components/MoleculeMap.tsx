import { GROUPS, MODELS } from "@/data/molecules";
import MiniDiagram from "@/components/MiniDiagram";
import { Button } from "@/components/ui/button";
import { GROUP_BLURB, parentsOf } from "@/data/catalog";

// Which feedback a molecule contains, spelled out so no legend is needed.
function loopChip(key: string) {
  const loops = MODELS[key].cld.loops;
  if (!loops.length) return { label: "No loop", cls: "border border-border text-muted-foreground" };
  const hasR = loops.some((l) => l.type === "R");
  const hasB = loops.some((l) => l.type === "B");
  if (hasR && hasB) return { label: "Both loops", cls: "bg-secondary text-foreground" };
  if (hasR) return { label: "Reinforcing", cls: "bg-[#fde8dc] text-[#9a3412]" };
  return { label: "Balancing", cls: "bg-accent text-accent-foreground" };
}

export default function MoleculeMap({ onSelect, onStartTour }: { onSelect: (k: string) => void; onStartTour: () => void }) {
  const total = Object.keys(MODELS).length;
  return (
    <div className="max-w-[1200px]">
      <section className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-10 lg:gap-14 items-center mb-16 md:mb-20">
        <div>
          <h1 className="display text-[44px] md:text-[64px]">
            Big models are made of <em>small molecules</em>.
          </h1>
          <p className="mt-6 text-[17px] leading-[1.6] text-foreground/80 max-w-[56ch]">
            {total} reusable building blocks for system-dynamics models, from Jim Hines’ <i>Molecules of Structure</i>. Each one is
            assembled from simpler ones, and nearly all of them trace back to a single stock with an inflow and an outflow. Open any
            molecule to run it, or take the tour and predict what happens before you press play.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={onStartTour}>
              Start the guided tour
            </Button>
            <Button size="lg" variant="secondary" onClick={() => onSelect("bathtub")}>
              Open the Bathtub
            </Button>
          </div>
        </div>

        <div className="hero-deco">
          <button
            onClick={() => onSelect("bathtub")}
            className="block w-full text-left rounded-card border border-border bg-card shadow-lift p-6 md:p-8 transition-transform hover:-translate-y-0.5"
          >
            <div className="viz-stage aspect-[820/300]">
              <MiniDiagram model={MODELS.bathtub} />
            </div>
            <p className="mt-5 heading text-[20px]">The Bathtub</p>
            <p className="mt-1 text-sm leading-[1.6] text-muted-foreground">{MODELS.bathtub.lede}</p>
          </button>
        </div>
      </section>

      <nav aria-label="Families" className="flex flex-wrap gap-2 mb-12">
        {GROUPS.map((group, i) => (
          <button
            key={group.title}
            onClick={() => document.getElementById(`family-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="rounded-full border border-input bg-card px-3.5 py-1.5 text-[13px] transition-colors hover:border-foreground"
          >
            {group.title} <span className="text-muted-foreground tabular-nums">{group.keys.length}</span>
          </button>
        ))}
      </nav>

      {GROUPS.map((group, i) => (
        <section key={group.title} id={`family-${i}`} className="mb-14 scroll-mt-6">
          <h2 className="heading text-[26px]">{group.title}</h2>
          <p className="text-[15px] leading-[1.6] text-muted-foreground mt-1 mb-5 max-w-[68ch]">{GROUP_BLURB[group.title]}</p>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
            {group.keys.map((k) => {
              const m = MODELS[k];
              const chip = loopChip(k);
              const parents = parentsOf(k);
              return (
                <article
                  key={k}
                  className="rounded-card border border-border bg-card p-4 flex flex-col transition-colors hover:border-ink/50 focus-within:border-ink/50"
                >
                  <button onClick={() => onSelect(k)} className="text-left rounded-lg">
                    <div className="h-[92px] mb-3 rounded-[calc(var(--radius)*0.6)] bg-muted overflow-hidden">
                      <MiniDiagram model={m} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="heading text-[16px]">{m.name}</span>
                      <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${chip.cls}`}>{chip.label}</span>
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-[1.5] mt-1.5 line-clamp-2">{m.lede}</p>
                  </button>
                  {parents.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-auto pt-3">
                      Builds on{" "}
                      {parents.map((p, i) => (
                        <span key={p}>
                          <button onClick={() => onSelect(p)} className="text-link font-medium hover:underline rounded">
                            {MODELS[p]?.name ?? p}
                          </button>
                          {i < parents.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <footer className="border-t border-border pt-6 pb-10 text-[13px] leading-[1.6] text-muted-foreground max-w-[68ch]">
        Main reference: Jim Hines, <i>Molecules of Structure: Building Blocks for System Dynamics Models</i>, version 2.03 (2015).
        The molecules and their equations are his; the lessons and causal loop diagrams were added for this app. Created by Wael
        Rashwan.
      </footer>
    </div>
  );
}
