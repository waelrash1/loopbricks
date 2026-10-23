import { ArrowUpRight, BookOpen, Boxes, GraduationCap, PencilRuler, Stethoscope } from "lucide-react";
import { MODELS } from "@/data/molecules";
import { MODULES } from "@/data/learn/modules";
import { ALL_CASES, DOMAINS, caseIn, domainById } from "@/data/apps";
import { useSeen } from "@/lib/progress";
import { LiveDemo } from "@/components/MoleculeMap";
import { Button } from "@/components/ui/button";

// ponytail: same key as doneKey in Learn.tsx, repeated so the home page does not load the whole course
const isDone = (seen: Set<string>, id: string) => seen.has(`done:learn/${id}`);

// What the last visit was about, in words, or nothing if it no longer exists.
function lastVisit(): { hash: string; label: string } | null {
  let hash: string | null = null;
  try {
    hash = localStorage.getItem("last");
  } catch {
    return null;
  }
  const [, a, b, c] = (hash ?? "").split("/");
  const label =
    a === "m" ? MODELS[b]?.name : a === "learn" ? MODULES.find((m) => m.id === b)?.title : a === "apps" ? caseIn(domainById(b), c)?.title : undefined;
  return hash && label ? { hash, label } : null;
}

// The front door: one running model, then the four places in the app and the book.
export default function Home({ go }: { go: (hash: string) => void }) {
  const seen = useSeen();
  const done = MODULES.filter((m) => isDone(seen, m.id)).length;
  const next = MODULES.find((m) => !isDone(seen, m.id));
  const total = Object.keys(MODELS).length;
  const last = lastVisit();
  const door = "brick brick-w group text-left p-5 md:p-6 flex flex-col";
  const doorTitle = "heading text-[20px] flex items-center gap-2.5";
  const doorText = "mt-2 text-[14.5px] leading-[1.55] text-muted-foreground";

  return (
    <div className="max-w-[1320px] mx-auto px-4 md:px-8">
      <section className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-10 lg:gap-14 items-center pt-10 md:pt-14 pb-14 md:pb-16">
        <div className="min-w-0">
          <h1 className="display text-[40px] sm:text-[48px] xl:text-[56px] max-w-[14ch]">Big models are built from small molecules.</h1>
          <p className="mt-5 text-[18px] leading-[1.55] text-foreground/80 max-w-[40ch]">
            Run, change and combine {total} small feedback models. Predict what each one does, then press play.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => go(next ? `/learn/${next.id}` : "/learn")}>
              {done ? "Continue learning" : "Start learning"}
            </Button>
            <Button size="lg" variant="secondary" onClick={() => go("/library")}>
              Browse the library
            </Button>
          </div>
        </div>
        <LiveDemo onOpen={() => go("/m/stockmgmt")} />
      </section>

      <h2 className="sr-only">Where to go</h2>
      {last && (
        <p className="mb-4 text-[15px] text-muted-foreground">
          Pick up where you left off:{" "}
          <a href={"#" + last.hash} onClick={(e) => (e.preventDefault(), go(last.hash))} className="tlink font-semibold text-foreground">
            {last.label}
          </a>
        </p>
      )}
      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-4">
        <button onClick={() => go("/learn")} className={`${door} lg:row-span-3`}>
          <span className={doorTitle}>
            <GraduationCap size={22} aria-hidden /> Learn
          </span>
          <span className={doorText}>
            A course in {MODULES.length} modules, from your first stock and flow to models you can test against data. Each module explains, sends you to the simulator, and ends with a self-check.
          </span>
          <span className="mt-6 grid gap-2">
            {MODULES.slice(0, 4).map((m, i) => (
              <span key={m.id} className="flex items-baseline gap-3 text-[14.5px]">
                <span className="w-5 text-right font-semibold text-accent-text">{i + 1}</span>
                <span className={isDone(seen, m.id) ? "line-through text-muted-foreground" : ""}>{m.title}</span>
              </span>
            ))}
            <span className="flex items-baseline gap-3 text-[14.5px] text-muted-foreground">
              <span className="w-5" />
              and {MODULES.length - 4} more
            </span>
          </span>
          <span className="mt-auto pt-6"><span className="brick brick-y inline-flex h-10 items-center px-4 text-[14px] font-semibold">
            {done ? `${done} of ${MODULES.length} done. Next: ${next?.title ?? "review"}` : `Start with ${MODULES[0].title}`}
          </span></span>
        </button>

        <button onClick={() => go("/library")} className={door}>
          <span className={doorTitle}>
            <Boxes size={22} aria-hidden /> Library
          </span>
          <span className={doorText}>All {total} molecules by family, or as a family tree showing which ones are built from which.</span>
        </button>
        <button onClick={() => go("/apps")} className={door}>
          <span className={doorTitle}>
            <Stethoscope size={22} aria-hidden /> Cases
          </span>
          <span className={doorText}>
            {ALL_CASES.length} cases from published studies in {DOMAINS.length} fields, from {DOMAINS[0].short.toLowerCase()} to {DOMAINS[DOMAINS.length - 1].short.toLowerCase()}. Each runs here, with its data.
          </span>
        </button>
        <button onClick={() => go("/build")} className={door}>
          <span className={doorTitle}>
            <PencilRuler size={22} aria-hidden /> Build
          </span>
          <span className={doorText}>Draw your own stock-and-flow model, run it, and take it to Python as a notebook.</span>
        </button>
      </div>

      <a href="./book/" className="brick brick-w mt-4 p-5 md:p-6 grid md:grid-cols-[auto_minmax(0,1fr)_auto] gap-4 items-center">
        <BookOpen size={26} aria-hidden />
        <span>
          <span className="heading block text-[20px]">System Dynamics with Python</span>
          <span className="block mt-1 text-[14.5px] leading-[1.55] text-muted-foreground">
            The companion book: 11 chapters that build, test and use these models in code, with one running case and notebooks that open in Colab.
          </span>
        </span>
        <span className="flex items-center gap-1 text-[14px] font-semibold">
          Read the book <ArrowUpRight size={16} aria-hidden />
        </span>
      </a>
    </div>
  );
}
