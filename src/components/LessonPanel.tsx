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
    <section className="mb-10">
      {/* every step of the tour, like the step strip in a building-set booklet: click one to jump */}
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-3">
        <p className="text-sm text-muted-foreground">
          Step {idx + 1} of {total}
        </p>
        <button onClick={onExit} className="h-11 -mr-2 px-2 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-btn">
          <X size={14} aria-hidden /> Exit tour
        </button>
      </div>
      <ol aria-label="Tour steps" className="hidden sm:flex flex-wrap gap-[3px] mb-10">
        {lessons.map((name, i) => (
          <li key={i}>
            <button
              onClick={() => onJump(i)}
              title={`${i + 1}. ${name}`}
              aria-label={`Step ${i + 1}: ${name}`}
              aria-current={i === idx ? "step" : undefined}
              className={cn(
                "block w-[11px] h-[14px] rounded-[3px] transition-colors",
                i === idx ? "bg-foreground" : i < idx ? "bg-accent hover:bg-accent-edge" : "bg-muted hover:bg-input"
              )}
            />
          </li>
        ))}
      </ol>

      <div className="grid sm:grid-cols-[auto_minmax(0,1fr)] gap-x-8 gap-y-2 items-start">
        <span aria-hidden className="display text-[72px] md:text-[104px] leading-[0.85] text-accent [-webkit-text-stroke:2px_hsl(var(--foreground))]">
          {idx + 1}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-muted-foreground mb-2">{title}</p>
          <h1 className="heading text-[21px] md:text-[26px] max-w-[48ch] mb-6">{lesson.q}</h1>

          <div className="grid md:grid-cols-2 gap-3 mb-6">
            {lesson.options.map((opt, i) => {
              const isAnswer = i === lesson.answer;
              const isPicked = i === picked;
              let cls = "brick-w";
              if (revealed) {
                if (isAnswer) cls = "brick-w is-right";
                else if (isPicked) cls = "brick-w is-wrong";
                else cls = "brick-w text-muted-foreground";
              } else if (isPicked) cls = "brick-y border border-transparent";
              return (
                <button
                  key={i}
                  disabled={revealed}
                  aria-pressed={isPicked}
                  onClick={() => setPicked(i)}
                  className={cn("brick text-left text-[15px] px-4 py-3 flex items-center gap-3", cls)}
                >
                  <span className="grid place-items-center w-6 h-6 rounded-[6px] bg-foreground/10 text-[12px] font-bold shrink-0">{String.fromCharCode(65 + i)}</span>
                  <span className="flex-1">{opt}</span>
                  {revealed && isAnswer && (
                    <span className="inline-flex items-center gap-1 text-[13px] font-bold">
                      <Check size={18} aria-hidden /> {isPicked ? "Right" : "The answer"}
                    </span>
                  )}
                  {revealed && isPicked && !isAnswer && (
                    <span className="inline-flex items-center gap-1 text-[13px] font-bold">
                      <X size={18} aria-hidden /> Not quite
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {revealed && (
            <p role="status" className="sheet mb-6 text-[16px] leading-[1.6] max-w-[70ch]">
              <b>{correct ? "Right. " : "Not quite. "}</b>
              {lesson.explain} Watch it play out in the diagram below.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
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
                Next step <ChevronRight size={16} aria-hidden />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
