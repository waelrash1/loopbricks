import type { MouseEvent } from "react";
import { ArrowRight } from "lucide-react";
import { MODELS } from "@/data/molecules";
import { MODULES } from "@/data/learn/modules";
import { useApps } from "@/data/catalog";
import { useSeen } from "@/lib/progress";
import { cn } from "@/lib/utils";
import HomeDemo from "@/components/HomeDemo";
import MiniDiagram from "@/components/MiniDiagram";

// ponytail: same key as doneKey in Learn.tsx, repeated so the home page does not load the whole course
const isDone = (seen: Set<string>, id: string) => seen.has(`done:learn/${id}`);

type Last = { hash: string; label: string; kind: "m" | "learn" | "apps"; key: string };

// What the last visit was about, in words, or nothing if it no longer exists.
function lastVisit(apps: ReturnType<typeof useApps>): Last | null {
  let hash: string | null = null;
  try {
    hash = localStorage.getItem("last");
  } catch {
    return null;
  }
  const [, a, b, c] = (hash ?? "").split("/");
  const label =
    a === "m" ? MODELS[b]?.name : a === "learn" ? MODULES.find((m) => m.id === b)?.title : a === "apps" ? apps?.caseIn(apps.domainById(b), c)?.title : undefined;
  return hash && label ? { hash, label, kind: a as Last["kind"], key: b } : null;
}

// The front door: one running model, where you were, the four places in the app, and the book.
export default function Home({ go }: { go: (hash: string) => void }) {
  const seen = useSeen();
  const done = MODULES.filter((m) => isDone(seen, m.id)).length;
  const next = MODULES.find((m) => !isDone(seen, m.id));
  const total = Object.keys(MODELS).length;
  const apps = useApps();
  const last = lastVisit(apps);
  const link = (hash: string) => ({ href: "#" + hash, onClick: (e: MouseEvent) => (e.preventDefault(), go(hash)) });

  // the course card follows the module last opened, else the next one not yet done
  const lastModule = last?.kind === "learn" ? MODULES.find((m) => m.id === last.key) : undefined;
  const mod = lastModule ?? next;
  const modNo = mod ? MODULES.indexOf(mod) + 1 : 0;
  const started = done > 0 || !!lastModule;
  const other = last && last.kind !== "learn" ? last : null;

  const ways = [
    ["Learn", "/learn", `A course in ${MODULES.length} modules, from your first stock and flow to models you can test against data.`],
    ["Library", "/library", `All ${total} molecules by family, each runnable on its own page with equations and Python.`],
    [
      "Cases",
      "/apps",
      apps ? `${apps.ALL_CASES.length} published studies in ${apps.DOMAINS.length} fields, rebuilt as models that run with their data.` : "Published studies rebuilt as models that run with their data.",
    ],
    ["Build", "/build", "Draw your own stock and flow model, run it, and take it to Python as a notebook."],
  ];

  return (
    <div className="page pb-16 md:pb-20">
      <section className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center pt-10 md:pt-16 pb-12 md:pb-14">
        <div className="min-w-0 flex flex-col gap-5">
          <h1 className="display text-[32px] sm:text-[38px] xl:text-[42px] max-w-[20ch]">Big models are built from small molecules.</h1>
          <p className="text-[17px] leading-[1.55] text-muted-foreground max-w-[50ch]">
            Run, change and combine {total} small feedback models, and see why each behaves as it does.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <a {...link("/learn")} className="brick brick-y h-11 px-[18px] inline-flex items-center text-[15px] font-semibold">
              Start the course
            </a>
            <a {...link("/library")} className="brick brick-w h-11 px-[18px] inline-flex items-center text-[15px] font-semibold">
              Browse the library
            </a>
          </div>
        </div>
        <HomeDemo />
      </section>

      <section aria-labelledby="resume" className="flex flex-wrap gap-5">
        <div className="sheet flex-[2_1_480px] min-w-0 flex flex-wrap items-center justify-between gap-5">
          <div className="grid gap-2 min-w-0">
            <h2 id="resume" className="heading text-[19px]">
              {started ? "Pick up where you left off" : "Where to start"}
            </h2>
            <p className="text-muted-foreground">
              {mod ? `Module ${modNo}: ${mod.title}. ` : "Every module is done. "}
              {started ? `${done} of ${MODULES.length} modules done.` : "Nothing done yet."}
            </p>
            <div role="img" aria-label={`${done} of ${MODULES.length} modules done`} className="flex flex-wrap gap-1">
              {MODULES.map((m) => (
                <span
                  key={m.id}
                  className={cn("w-5 h-2.5 rounded-[3px]", isDone(seen, m.id) ? "bg-accent" : "border-[1.5px] border-muted-foreground/50")}
                />
              ))}
            </div>
          </div>
          <a
            {...link(mod ? `/learn/${mod.id}` : "/learn")}
            className="brick brick-w h-11 px-[18px] inline-flex items-center gap-2 text-[15px] font-semibold !border-foreground"
          >
            {mod ? (started ? `Continue module ${modNo}` : `Start module ${modNo}`) : "Review the course"}
            <ArrowRight size={16} aria-hidden />
          </a>
        </div>
        {other && (
          <a {...link(other.hash)} className="brick brick-w flex-[1_1_300px] min-w-0 rounded-[var(--radius)] px-5 py-4 flex items-center gap-4">
            {other.kind === "m" && (
              <span className="w-24 h-9 shrink-0" aria-hidden>
                <MiniDiagram model={MODELS[other.key]} />
              </span>
            )}
            <span className="grid min-w-0">
              <span className="text-[13px] text-muted-foreground">{other.kind === "m" ? "Last opened molecule" : "Last opened case"}</span>
              <span className="font-semibold">{other.label}</span>
            </span>
          </a>
        )}
      </section>

      <section aria-labelledby="ways" className="mt-16 md:mt-[72px] flex flex-wrap gap-x-12 gap-y-6">
        <h2 id="ways" className="display flex-[1_1_260px] text-[26px] md:text-[30px] max-w-[12ch]">
          Four ways into the same models
        </h2>
        <ul className="flex-[3_1_560px] min-w-0 grid sm:grid-cols-2 gap-x-8">
          {ways.map(([title, hash, text]) => (
            <li key={title}>
              <a {...link(hash)} className="group grid gap-1 pt-[18px] pb-[22px] border-t-2 border-foreground">
                <span className="heading text-[22px] group-hover:underline underline-offset-4">{title}</span>
                <span className="text-muted-foreground">{text}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="book" className="sheet mt-16 md:mt-[72px] !p-6 md:!p-8 flex flex-wrap items-center justify-between gap-6">
        <div className="grid gap-2 max-w-[60ch]">
          <h2 id="book" className="display text-[24px] md:text-[28px]">
            System Dynamics with Python
          </h2>
          <p className="text-muted-foreground">
            The companion book: 11 chapters that build, test and use these models in code, with one running case and notebooks that open in Colab.
          </p>
        </div>
        <a href="./book/" className="brick brick-w h-11 px-[18px] inline-flex items-center text-[15px] font-semibold !border-foreground">
          Read the book
        </a>
      </section>
    </div>
  );
}
