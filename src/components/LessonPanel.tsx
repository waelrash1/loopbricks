import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Lesson } from "@/data/lessons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LessonPanel({
  lesson,
  title,
  idx,
  total,
  onPrev,
  onNext,
  onJump,
  lessons,
  onReveal,
  onExit,
}: {
  lesson: Lesson;
  title: string;
  idx: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (i: number) => void;
  lessons: string[];
  onReveal: (preset?: Record<string, number>) => void;
  onExit: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const correct = picked === lesson.answer;
  const last = idx === total - 1;

  return (
    <section className="rounded-card border-[1.5px] border-link bg-card p-6 md:p-8 mb-6">
      <div className="flex items-center gap-4 mb-5">
        <label className="text-sm text-muted-foreground tabular-nums shrink-0">
          Lesson{" "}
          <select
            value={idx}
            onChange={(e) => onJump(Number(e.target.value))}
            className="rounded-btn border border-input bg-card text-foreground px-2 py-1 max-w-[12rem]"
          >
            {lessons.map((name, i) => (
              <option key={i} value={i}>
                {i + 1}. {name}
              </option>
            ))}
          </select>{" "}
          of {total}
        </label>
        <div
          role="progressbar"
          aria-label="Tour progress"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={idx + 1}
          className="h-1 flex-1 rounded-full bg-secondary overflow-hidden"
        >
          <div className="h-full bg-link transition-[width]" style={{ width: `${((idx + 1) / total) * 100}%` }} />
        </div>
        <button onClick={onExit} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 rounded shrink-0">
          <X size={14} aria-hidden /> Exit tour
        </button>
      </div>

      <h1 className="display text-[32px] md:text-[40px]">{title}</h1>
      <p className="mt-3 mb-5 text-[17px] leading-[1.6] max-w-[68ch]">{lesson.q}</p>

      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        {lesson.options.map((opt, i) => {
          const isAnswer = i === lesson.answer;
          const isPicked = i === picked;
          let cls = "border-input hover:border-foreground";
          if (revealed) {
            if (isAnswer) cls = "is-right";
            else if (isPicked) cls = "is-wrong";
            else cls = "border-border text-muted-foreground";
          } else if (isPicked) cls = "border-link bg-accent text-accent-foreground";
          return (
            <button
              key={i}
              disabled={revealed}
              aria-pressed={isPicked}
              onClick={() => setPicked(i)}
              className={cn("text-left text-[15px] rounded-card border px-4 py-3 transition-colors flex items-center gap-3", cls)}
            >
              <span className="font-medium text-sm w-4 opacity-60">{String.fromCharCode(65 + i)}</span>
              <span className="flex-1">{opt}</span>
              {revealed && isAnswer && <Check size={16} aria-label="Correct answer" />}
              {revealed && isPicked && !isAnswer && <X size={16} aria-label="Your answer" />}
            </button>
          );
        })}
      </div>

      {revealed && (
        <p role="status" className="rounded-card bg-accent text-accent-foreground px-5 py-4 mb-5 text-[15px] leading-[1.6] max-w-[80ch]">
          <b>{correct ? "Correct. " : "Not quite. "}</b>
          {lesson.explain} Watch it play out in the diagram below.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={onPrev} disabled={idx === 0}>
          <ChevronLeft size={16} aria-hidden /> Previous
        </Button>
        {!revealed ? (
          <>
            <Button
              disabled={picked === null}
              onClick={() => {
                setRevealed(true);
                onReveal(lesson.preset);
              }}
            >
              Reveal and run
            </Button>
            <Button variant="ghost" onClick={onNext} disabled={last} className="ml-auto">
              Skip <ChevronRight size={16} aria-hidden />
            </Button>
          </>
        ) : last ? (
          <Button onClick={onExit}>Finish the tour</Button>
        ) : (
          <Button onClick={onNext}>
            Next lesson <ChevronRight size={16} aria-hidden />
          </Button>
        )}
      </div>
    </section>
  );
}
