import { useMemo, useState } from "react";
import { Check, Download, Link2, Printer, Search } from "lucide-react";
import { GLOSSARY } from "@/data/learn/glossary";
import { DIAGNOSTIC, DIAGNOSTIC_SOURCES } from "@/data/learn/diagnostic";
import { ASSESSMENT, SYLLABUS } from "@/data/learn/syllabus";
import { PROJECTS } from "@/data/learn/projects";
import { MODULES, moduleById } from "@/data/learn/modules";
import { doneKey } from "@/components/Learn";
import { markSeen, useSeen } from "@/lib/progress";
import { cn } from "@/lib/utils";

const wrap = "max-w-[1100px] mx-auto px-4 md:px-8";
// small per-browser stores; every read and write tolerates blocked storage
const load = <T,>(k: string, d: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : d;
  } catch {
    return d;
  }
};
const save = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* storage blocked: kept for this visit only */
  }
};
function Crumb({ go, here }: { go: (h: string) => void; here: string }) {
  return (
    <p className="text-sm text-muted-foreground mb-6 print:hidden">
      <button onClick={() => go("/learn")} className="hover:text-foreground">
        Learn
      </button>
      <span aria-hidden className="mx-2">/</span>
      <span className="text-foreground font-semibold">{here}</span>
    </p>
  );
}
const Links = ({ items, go }: { items?: { label: string; hash: string }[]; go: (h: string) => void }) =>
  items?.length ? (
    <span className="flex flex-wrap gap-1.5 mt-2">
      {items.map((s) => (
        <button key={s.hash} onClick={() => go(s.hash)} className="rounded-[6px] bg-background border border-border px-2 py-0.5 text-[12.5px] font-semibold hover:bg-muted">
          {s.label}
        </button>
      ))}
    </span>
  ) : null;

// ---- glossary ---------------------------------------------------------------------------------------------------
export function GlossaryPage({ go }: { go: (h: string) => void }) {
  const [q, setQ] = useState("");
  const hits = GLOSSARY.filter((t) => (t.term + " " + t.def).toLowerCase().includes(q.trim().toLowerCase()));
  const letters = [...new Set(hits.map((t) => t.term[0].toUpperCase()))];
  return (
    <div className={`${wrap} pt-6 md:pt-8`}>
      <Crumb go={go} here="Glossary" />
      <h1 className="display text-[32px] md:text-[44px]">Glossary</h1>
      <p className="mt-3 text-[16.5px] leading-[1.6] text-foreground/85 max-w-[62ch]">{GLOSSARY.length} terms of system dynamics, each with a link to where it is taught or can be run.</p>
      <label className="mt-5 flex items-center gap-2 max-w-[420px] rounded-[10px] border border-border bg-card px-3 h-11">
        <Search size={16} aria-hidden className="text-muted-foreground" />
        <span className="sr-only">Search the glossary</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search terms" className="flex-1 bg-transparent outline-none text-[15px]" />
      </label>
      {!hits.length && <p className="mt-6 text-[15px]">No term matches “{q}”. Try a shorter word.</p>}
      {letters.map((L) => (
        <section key={L} className="mt-8">
          <h2 className="display text-[26px] text-accent-edge">{L}</h2>
          <dl className="mt-2 grid md:grid-cols-2 gap-x-10 gap-y-5">
            {hits
              .filter((t) => t.term[0].toUpperCase() === L)
              .map((t) => (
                <div key={t.term} id={`g-${t.term.toLowerCase().replace(/\W+/g, "-")}`}>
                  <dt className="heading text-[16px]">{t.term}</dt>
                  <dd className="mt-1 text-[15px] leading-[1.6]">
                    {t.def}
                    <Links items={t.see} go={go} />
                  </dd>
                </div>
              ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

// ---- before-and-after test ------------------------------------------------------------------------------------------
type Attempt = { score: number; answers: number[]; date: string };
const CHECK_KEY = "loopbricks-check";
export function CheckPage({ go }: { go: (h: string) => void }) {
  const [rec, setRec] = useState<{ before?: Attempt; after?: Attempt }>(() => load(CHECK_KEY, {}));
  const [taking, setTaking] = useState(false);
  const [ans, setAns] = useState<number[]>([]);
  const [shown, setShown] = useState<Attempt | null>(null);
  const which: "before" | "after" = rec.before ? "after" : "before";
  const submit = () => {
    const a: Attempt = { score: DIAGNOSTIC.filter((q, i) => ans[i] === q.answer).length, answers: ans, date: new Date().toISOString().slice(0, 10) };
    const next = { ...rec, [which]: a };
    setRec(next);
    save(CHECK_KEY, next);
    setShown(a);
    setTaking(false);
  };
  const skills = [...new Set(DIAGNOSTIC.map((q) => q.skill))];
  const bySkill = (a?: Attempt) => Object.fromEntries(skills.map((s) => [s, DIAGNOSTIC.map((q, i) => [q, i] as const).filter(([q]) => q.skill === s).map(([q, i]) => +(a?.answers[i] === q.answer))]));
  const b = bySkill(rec.before), f = bySkill(rec.after);
  return (
    <div className={`${wrap} pt-6 md:pt-8`}>
      <Crumb go={go} here="Before and after" />
      <h1 className="display text-[32px] md:text-[44px]">Before and after</h1>
      <p className="mt-3 text-[16.5px] leading-[1.6] text-foreground/85 max-w-[64ch]">
        {DIAGNOSTIC.length} questions on mistakes that even well-educated adults make about stocks, flows, delays and feedback. Take it before you start and again when you finish:
        the difference is what you learned. Answers are shown only after you submit.
      </p>
      {!taking && (
        <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-[640px]">
          {(["before", "after"] as const).map((k) => (
            <div key={k} className="sheet">
              <p className="heading text-[16px]">{k === "before" ? "Before" : "After"}</p>
              <p className="mt-1 display text-[34px]">{rec[k] ? `${rec[k]!.score} / ${DIAGNOSTIC.length}` : "Not taken"}</p>
              {rec[k] && <p className="text-[13px] text-muted-foreground">on {rec[k]!.date}</p>}
            </div>
          ))}
        </div>
      )}
      {!taking && (
        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => (setAns([]), setShown(null), setTaking(true))} className="brick brick-y h-11 px-5 text-[15px] font-semibold">
            {rec.after ? "Take it again" : rec.before ? "Take the after test" : "Take the before test"}
          </button>
          {rec.before && (
            <button onClick={() => (setRec({}), save(CHECK_KEY, {}), setShown(null))} className="brick brick-w h-11 px-4 text-[14px] font-semibold">
              Clear my results
            </button>
          )}
        </div>
      )}
      {!taking && rec.before && rec.after && (
        <div className="mt-8">
          <h2 className="heading text-[20px]">By misconception</h2>
          <table className="mt-3 text-[14.5px] w-full max-w-[640px]">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-1 font-semibold">Skill</th>
                <th className="font-semibold">Before</th>
                <th className="font-semibold">After</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <tr key={s} className="border-t border-border">
                  <td className="py-1.5">{s}</td>
                  <td>
                    {b[s].reduce((x, y) => x + y, 0)} / {b[s].length}
                  </td>
                  <td>
                    {f[s].reduce((x, y) => x + y, 0)} / {f[s].length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(taking || shown) && (
        <ol className="mt-8 grid gap-4 max-w-[85ch]">
          {DIAGNOSTIC.map((q, i) => {
            const picked = taking ? ans[i] : shown!.answers[i];
            return (
              <li key={q.q}>
                <fieldset className="sheet">
                  <legend className="sr-only">Question {i + 1}</legend>
                  <p className="text-[15.5px] leading-[1.6] font-semibold">
                    {i + 1}. {q.q}
                  </p>
                  <div className="mt-3 grid gap-2">
                    {q.options.map((o, j) => (
                      <label
                        key={o}
                        className={cn(
                          "flex items-start gap-2.5 rounded-[8px] border border-border px-3 py-2 text-[14.5px]",
                          taking && "cursor-pointer hover:bg-muted",
                          !taking && j === q.answer && "border-[var(--viz-good)] bg-[var(--viz-good)]/10",
                          !taking && j === picked && j !== q.answer && "border-[#c2255c] bg-[#c2255c]/10"
                        )}
                      >
                        <input type="radio" name={`d${i}`} disabled={!taking} checked={picked === j} onChange={() => setAns((a) => Object.assign([...a], { [i]: j }))} className="mt-1" />
                        {o}
                      </label>
                    ))}
                  </div>
                  {!taking && (
                    <p className="mt-3 text-[14.5px] leading-[1.6]">
                      <b>{picked === q.answer ? "Correct. " : "The answer is " + String.fromCharCode(65 + q.answer) + ". "}</b>
                      {q.why}
                    </p>
                  )}
                </fieldset>
              </li>
            );
          })}
        </ol>
      )}
      {taking && (
        <div className="mt-5 flex items-center gap-3">
          <button onClick={submit} disabled={ans.filter((x) => x !== undefined).length < DIAGNOSTIC.length} className="brick brick-y h-11 px-5 text-[15px] font-semibold disabled:opacity-50">
            Submit my answers
          </button>
          <span className="text-[14px] text-muted-foreground">
            {ans.filter((x) => x !== undefined).length} of {DIAGNOSTIC.length} answered
          </span>
        </div>
      )}
      <p className="mt-10 text-[13px] text-muted-foreground max-w-[90ch]">Based on: {DIAGNOSTIC_SOURCES.join("; ")}</p>
    </div>
  );
}

// ---- instructors -----------------------------------------------------------------------------------------------------
const PROGRESS_KEYS = ["loopbricks-progress", CHECK_KEY, "loopbricks-track"];
export function TeachPage({ go }: { go: (h: string) => void }) {
  const [pick, setPick] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const base = `${location.origin}${location.pathname}#/learn/assigned/`;
  const link = base + pick.join("+");
  return (
    <div className={`${wrap} pt-6 md:pt-8`}>
      <Crumb go={go} here="For instructors" />
      <h1 className="display text-[32px] md:text-[44px]">For instructors</h1>
      <p className="mt-3 text-[16.5px] leading-[1.6] text-foreground/85 max-w-[64ch]">
        A suggested 12-week course built on the modules, labs, games and projects here, with an assessment scheme, links to assign modules, and a way for students to hand in their
        progress. Everything runs in the browser; nothing is sent to a server.
      </p>

      <h2 className="heading text-[22px] mt-10">Suggested 12-week course</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-[14.5px] min-w-[560px]">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-1.5 pr-3 font-semibold w-[60px]">Week</th>
              <th className="pr-3 font-semibold">Modules</th>
              <th className="font-semibold">In class</th>
            </tr>
          </thead>
          <tbody>
            {SYLLABUS.map((w) => (
              <tr key={w.week} className="border-t border-border align-top">
                <td className="py-2 pr-3 font-semibold tabular-nums">{w.week}</td>
                <td className="py-2 pr-3">
                  {w.modules.map((id) => (
                    <button key={id} onClick={() => go(`/learn/${id}`)} className="tlink block text-left">
                      {moduleById(id)?.title ?? id}
                    </button>
                  ))}
                </td>
                <td className="py-2 leading-[1.55]">{w.activity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="heading text-[22px] mt-10">Assessment</h2>
      <ul className="mt-3 grid gap-2 max-w-[80ch]">
        {ASSESSMENT.map((a) => (
          <li key={a.item} className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 text-[14.5px]">
            <span className="display text-[20px] text-accent-edge">{a.weight}%</span>
            <span>
              <b>{a.item}.</b> {a.detail}
            </span>
          </li>
        ))}
      </ul>

      <h2 className="heading text-[22px] mt-10">Assign modules</h2>
      <p className="mt-1 text-[15px] text-muted-foreground max-w-[70ch]">Tick modules and share the link. Students see just those modules with their own progress.</p>
      <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5 text-[14px]">
        {MODULES.map((m) => (
          <label key={m.id} className="flex items-start gap-2">
            <input type="checkbox" checked={pick.includes(m.id)} onChange={(e) => setPick((p) => (e.target.checked ? [...p, m.id] : p.filter((x) => x !== m.id)))} className="mt-1" />
            {m.title}
          </label>
        ))}
      </div>
      {pick.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <code className="rounded-[6px] bg-card border border-border px-2 py-1.5 text-[12.5px] [overflow-wrap:anywhere]">{link}</code>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(link).then(() => setCopied(true), () => setCopied(false));
            }}
            className="brick brick-w h-9 px-3 text-[13px] font-semibold inline-flex items-center gap-1.5"
          >
            <Link2 size={14} aria-hidden /> {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      )}

      <h2 className="heading text-[22px] mt-10">Collecting progress</h2>
      <p className="mt-1 text-[15px] leading-[1.6] max-w-[70ch]">
        Progress is stored in each student's browser. Students can download it from <button onClick={() => go("/learn/progress")} className="tlink font-semibold">their progress page</button> and
        hand in the file; it lists modules done, loop exercises solved, and before-and-after scores.
      </p>
    </div>
  );
}

// ---- assigned modules (from an instructor's link) -----------------------------------------------------------------------
export function AssignedPage({ ids, go }: { ids: string[]; go: (h: string) => void }) {
  const seen = useSeen();
  const mods = ids.map(moduleById).filter(Boolean) as typeof MODULES;
  const done = mods.filter((m) => seen.has(doneKey(m.id))).length;
  return (
    <div className={`${wrap} pt-6 md:pt-8`}>
      <Crumb go={go} here="Assigned to you" />
      <h1 className="display text-[32px] md:text-[44px]">Assigned to you</h1>
      <p className="mt-3 text-[16px] text-foreground/85">
        {done} of {mods.length} done.
      </p>
      <ol className="mt-5 grid gap-3 max-w-[720px]">
        {mods.map((m, i) => (
          <li key={m.id}>
            <button onClick={() => go(`/learn/${m.id}`)} className="brick brick-w w-full text-left p-4 flex gap-3 items-start">
              <span className="display text-[22px] text-accent-edge leading-none w-6">{i + 1}</span>
              <span className="flex-1">
                <span className="heading text-[16px] flex justify-between gap-2">
                  {m.title}
                  {seen.has(doneKey(m.id)) && <Check size={16} strokeWidth={3} aria-label="done" className="text-[var(--viz-good)]" />}
                </span>
                <span className="block mt-1 text-[13.5px] text-muted-foreground">{m.summary}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---- a student's own progress, to download and hand in ----------------------------------------------------------------
export function ProgressPage({ go }: { go: (h: string) => void }) {
  const seen = useSeen();
  const [name, setName] = useState("");
  const mods = MODULES.filter((m) => seen.has(doneKey(m.id)));
  const draws = [...seen].filter((k) => k.startsWith("done:draw/")).length;
  const check = load<{ before?: Attempt; after?: Attempt }>(CHECK_KEY, {});
  const download = () => {
    const data = {
      name,
      exported: new Date().toISOString(),
      modulesDone: mods.map((m) => m.id),
      loopExercisesSolved: draws,
      beforeAfter: { before: check.before?.score ?? null, after: check.after?.score ?? null, outOf: DIAGNOSTIC.length },
      raw: Object.fromEntries(PROGRESS_KEYS.map((k) => [k, load(k, null)])),
    };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    a.download = `loopbricks-progress${name ? "-" + name.trim().replace(/\s+/g, "-").toLowerCase() : ""}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className={`${wrap} pt-6 md:pt-8`}>
      <Crumb go={go} here="My progress" />
      <h1 className="display text-[32px] md:text-[44px]">My progress</h1>
      <ul className="mt-5 grid gap-1.5 text-[15.5px]">
        <li>
          <b>{mods.length}</b> of {MODULES.length} modules done
        </li>
        <li>
          <b>{draws}</b> loop-drawing exercises solved
        </li>
        <li>
          Before and after test: <b>{check.before ? `${check.before.score} / ${DIAGNOSTIC.length}` : "not taken"}</b> before, <b>{check.after ? `${check.after.score} / ${DIAGNOSTIC.length}` : "not taken"}</b> after
        </li>
      </ul>
      <label className="mt-6 grid gap-1.5 max-w-[360px] text-[14px]">
        <span className="font-semibold">Your name (goes in the file)</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-[8px] border border-border bg-background px-3 h-10" />
      </label>
      <button onClick={download} className="brick brick-y mt-4 h-11 px-5 text-[15px] font-semibold inline-flex items-center gap-2">
        <Download size={16} aria-hidden /> Download my progress
      </button>
      <p className="mt-3 text-[13.5px] text-muted-foreground max-w-[60ch]">Progress lives in this browser only. Clearing site data or switching device starts again.</p>
    </div>
  );
}

// ---- capstone projects -------------------------------------------------------------------------------------------------
export function ProjectsIndex({ go }: { go: (h: string) => void }) {
  return (
    <div className={`${wrap} pt-6 md:pt-8`}>
      <Crumb go={go} here="Capstone projects" />
      <h1 className="display text-[32px] md:text-[44px]">Capstone projects</h1>
      <p className="mt-3 text-[16.5px] leading-[1.6] text-foreground/85 max-w-[64ch]">
        Take one problem through the whole modelling process, from a client's question to policy advice. Each stage says what to do, what to hand in, and how to check your own work.
        Your notes and ticks are saved in this browser.
      </p>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {PROJECTS.map((p) => (
          <button key={p.id} onClick={() => go(`/learn/projects/${p.id}`)} className="brick brick-w text-left p-5 flex flex-col">
            <span className="text-[13px] font-semibold text-accent-edge">{p.field}</span>
            <span className="heading text-[18px] mt-1">{p.title}</span>
            <span className="mt-2 text-[14px] leading-[1.55] text-muted-foreground line-clamp-4">{p.problem}</span>
            <span className="mt-auto pt-3 text-[13px] text-muted-foreground">{p.stages.length} stages</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProjectPage({ id, go }: { id: string; go: (h: string) => void }) {
  const p = PROJECTS.find((x) => x.id === id);
  const key = `loopbricks-project:${id}`;
  const [st, setSt] = useState<{ ticks: Record<string, boolean>; notes: Record<number, string> }>(() => load(key, { ticks: {}, notes: {} }));
  const update = (n: typeof st) => {
    setSt(n);
    save(key, n);
    if (p && Object.values(n.ticks).filter(Boolean).length === p.stages.reduce((a, s) => a + s.check.length, 0)) markSeen(`done:project/${id}`);
  };
  const total = useMemo(() => p?.stages.reduce((a, s) => a + s.check.length, 0) ?? 0, [p]);
  if (!p)
    return (
      <div className={`${wrap} pt-10`}>
        <p className="sheet">
          No project called “{id}”.{" "}
          <button onClick={() => go("/learn/projects")} className="tlink font-semibold">
            See all projects
          </button>
        </p>
      </div>
    );
  const ticked = Object.values(st.ticks).filter(Boolean).length;
  return (
    <article className={`${wrap} pt-6 md:pt-8`}>
      <p className="text-sm text-muted-foreground mb-6 print:hidden">
        <button onClick={() => go("/learn")} className="hover:text-foreground">
          Learn
        </button>
        <span aria-hidden className="mx-2">/</span>
        <button onClick={() => go("/learn/projects")} className="hover:text-foreground">
          Capstone projects
        </button>
      </p>
      <p className="text-[13px] font-semibold text-accent-edge">{p.field}</p>
      <h1 className="display text-[30px] md:text-[42px] max-w-[24ch]">{p.title}</h1>
      <div className="mt-5 rounded-card bg-card border-l-4 border-accent px-5 py-4 max-w-[80ch]">
        <p className="heading text-[15px]">The brief</p>
        <p className="mt-1.5 text-[15.5px] leading-[1.65]">{p.problem}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 print:hidden">
        <span className="text-[14px] text-muted-foreground">
          {ticked} of {total} checks ticked
        </span>
        <button onClick={() => window.print()} className="brick brick-w h-9 px-3 text-[13px] font-semibold inline-flex items-center gap-1.5">
          <Printer size={14} aria-hidden /> Print or save as PDF
        </button>
      </div>
      <ol className="mt-8 grid gap-6">
        {p.stages.map((s, i) => (
          <li key={s.title} className="sheet break-inside-avoid">
            <h2 className="heading text-[19px] flex gap-3">
              <span className="display text-[22px] text-accent-edge leading-none">{i + 1}</span>
              {s.title}
            </h2>
            <p className="mt-2 text-[15.5px] leading-[1.65] max-w-[80ch]">{s.task}</p>
            <p className="mt-2 text-[14.5px]">
              <b>Hand in:</b> {s.deliverable}
            </p>
            <Links items={s.tools} go={go} />
            <div className="mt-4 grid gap-1.5">
              {s.check.map((c) => (
                <label key={c} className="flex items-start gap-2 text-[14.5px]">
                  <input type="checkbox" checked={!!st.ticks[`${i}:${c}`]} onChange={(e) => update({ ...st, ticks: { ...st.ticks, [`${i}:${c}`]: e.target.checked } })} className="mt-1" />
                  {c}
                </label>
              ))}
            </div>
            <label className="mt-4 grid gap-1.5 text-[13.5px]">
              <span className="font-semibold">Your notes for this stage</span>
              <textarea
                value={st.notes[i] ?? ""}
                onChange={(e) => update({ ...st, notes: { ...st.notes, [i]: e.target.value } })}
                rows={3}
                className="rounded-[8px] border border-border bg-background px-3 py-2 text-[14.5px] leading-[1.55]"
              />
            </label>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-[13px] text-muted-foreground">Sources: {p.sources.join("; ")}</p>
    </article>
  );
}
