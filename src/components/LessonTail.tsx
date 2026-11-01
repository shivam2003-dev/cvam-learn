"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  completeLesson,
  lessonKey,
  recordQuiz,
  resetLesson,
  useProgress,
} from "@/lib/progress";
import type { McqQuestion, QuizQuestion, TextQuestion } from "@/lib/types";

type Neighbor = { slug: string; title: string } | null;
type Outcome = "correct" | "wrong" | null;

export function LessonTail({
  course,
  slug,
  quiz,
  prev,
  next,
}: {
  course: string;
  slug: string;
  quiz: QuizQuestion[];
  prev: Neighbor;
  next: Neighbor;
}) {
  const key = lessonKey(course, slug);
  const router = useRouter();
  const progress = useProgress();
  const [outcomes, setOutcomes] = useState<Outcome[]>(() => quiz.map(() => null));
  const [round, setRound] = useState(0);
  const done = !!progress.done[key];
  const answered = outcomes.filter(Boolean).length;
  const allAnswered = answered === quiz.length;
  const correct = outcomes.filter((o) => o === "correct").length;
  const firstScore = progress.quiz[key];

  function settle(index: number, outcome: Exclude<Outcome, null>) {
    const updated = outcomes.map((o, i) => (i === index ? outcome : o));
    setOutcomes(updated);
    if (updated.every(Boolean)) {
      recordQuiz(key, updated.filter((o) => o === "correct").length, quiz.length);
    }
  }

  function finish() {
    completeLesson(key);
    router.push(next ? `/paths/${course}/${next.slug}` : `/paths/${course}`);
  }

  return (
    <>
      <section
        id="check"
        aria-labelledby="check-title"
        className="mt-8 scroll-mt-20 rounded-2xl border border-line bg-panel"
      >
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
          <h2 id="check-title" className="font-display text-xl font-bold">
            Answer the questions below
          </h2>
          <span aria-live="polite" className="font-mono text-xs text-soft">
            {answered}/{quiz.length} answered
          </span>
        </header>
        <ol className="divide-y divide-line">
          {quiz.map((question, index) => (
            <li key={`${round}-${question.q}`} className="px-5 py-5">
              <p className="font-medium">
                <span className="mr-2 font-mono text-sm text-lime">Q{index + 1}</span>
                {question.q}
              </p>
              {question.kind === "mcq" ? (
                <Mcq question={question} onSettle={(o) => settle(index, o)} />
              ) : (
                <TextAnswer question={question} onSettle={(o) => settle(index, o)} />
              )}
            </li>
          ))}
        </ol>
        {allAnswered && (
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
            <p className="text-sm text-soft">
              You got <strong className="text-text">{correct}</strong> of {quiz.length}{" "}
              this round.
              {firstScore &&
                ` First-try score counted for XP: ${firstScore.correct}/${firstScore.total}.`}
            </p>
            <button
              type="button"
              onClick={() => {
                setOutcomes(quiz.map(() => null));
                setRound((r) => r + 1);
              }}
              className="font-mono text-sm text-sky hover:underline"
            >
              Retry questions
            </button>
          </footer>
        )}
      </section>

      <div className="mt-6 rounded-2xl border border-line bg-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-soft">
            {done
              ? "Lesson complete."
              : allAnswered
                ? "Nice. Lock it in and keep moving."
                : "Answer every question to finish this lesson."}
          </p>
          <div className="flex items-center gap-3">
            {done && (
              <button
                type="button"
                onClick={() => resetLesson(key)}
                className="font-mono text-xs text-faint hover:text-soft"
              >
                Mark incomplete
              </button>
            )}
            <button
              type="button"
              disabled={!done && !allAnswered}
              onClick={finish}
              className="rounded-lg bg-lime px-4 py-2 font-semibold text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-raised disabled:text-faint"
            >
              {done ? (next ? "Continue" : "Back to path") : "Complete & continue"}
            </button>
          </div>
        </div>
      </div>

      <nav
        aria-label="Lesson navigation"
        className="mt-6 flex justify-between gap-4 font-mono text-sm"
      >
        {prev ? (
          <Link href={`/paths/${course}/${prev.slug}`} className="text-soft hover:text-text">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/paths/${course}/${next.slug}`}
            className="text-right text-soft hover:text-text"
          >
            {next.title} →
          </Link>
        )}
      </nav>
    </>
  );
}

const PINNED_LAST = /^(all|none) of (the|these|them)|^neither|^both/i;

/**
 * Lessons are written with the answer in a few fixed slots, so options are
 * reordered per question. The seed is the question text, which keeps the
 * order identical between server and client.
 */
function shuffled(question: McqQuestion) {
  let seed = 2166136261;
  for (const char of question.q) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  const next = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const entries = question.options.map((text, original) => ({ text, original }));
  const movable = entries.filter((entry) => !PINNED_LAST.test(entry.text));
  const pinned = entries.filter((entry) => PINNED_LAST.test(entry.text));
  for (let i = movable.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [movable[i], movable[j]] = [movable[j], movable[i]];
  }
  return [...movable, ...pinned];
}

function Mcq({
  question,
  onSettle,
}: {
  question: McqQuestion;
  onSettle: (outcome: "correct" | "wrong") => void;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const locked = chosen !== null;
  const ordered = shuffled(question);

  return (
    <>
      <div className="mt-3 grid gap-2">
        {ordered.map(({ text: option, original }, index) => {
          const isAnswer = original === question.answer;
          const isChosen = original === chosen;
          let tone = "border-line hover:border-soft";
          if (locked && isAnswer) tone = "border-lime bg-lime/10";
          else if (locked && isChosen) tone = "border-rose bg-rose/10";
          else if (locked) tone = "border-line opacity-60";
          return (
            <button
              key={option}
              type="button"
              disabled={locked}
              onClick={() => {
                setChosen(original);
                onSettle(isAnswer ? "correct" : "wrong");
              }}
              className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-left text-[0.95rem] ${tone}`}
            >
              <span className="font-mono text-xs leading-6 text-faint">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="min-w-0 flex-1">{option}</span>
              {locked && isAnswer && (
                <span className="font-mono text-xs leading-6 text-lime">correct</span>
              )}
              {locked && isChosen && !isAnswer && (
                <span className="font-mono text-xs leading-6 text-rose">your pick</span>
              )}
            </button>
          );
        })}
      </div>
      {locked && (
        <p className="mt-3 text-sm leading-relaxed text-soft">{question.explain}</p>
      )}
    </>
  );
}

function TextAnswer({
  question,
  onSettle,
}: {
  question: TextQuestion;
  onSettle: (outcome: "correct" | "wrong") => void;
}) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "correct" | "wrong" | "revealed">("idle");
  const finished = state === "correct" || state === "revealed";
  const normalize = (text: string) => text.trim().toLowerCase().replace(/\s+/g, " ");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (finished || !value.trim()) return;
    const correct = question.accept.some((a) => normalize(a) === normalize(value));
    if (correct) {
      // A miss before this keeps the score honest: only a clean first try counts.
      onSettle(state === "wrong" ? "wrong" : "correct");
      setState("correct");
    } else {
      setState("wrong");
    }
  }

  return (
    <>
      <form onSubmit={submit} className="mt-3 flex flex-wrap gap-2">
        <input
          aria-label="Your answer"
          value={value}
          disabled={finished}
          onChange={(event) => setValue(event.target.value)}
          placeholder={`Answer format: ${question.format}`}
          autoComplete="off"
          spellCheck={false}
          className={`min-w-0 flex-1 rounded-lg border bg-ink px-3 py-2 font-mono text-sm placeholder:text-faint ${state === "wrong" ? "border-rose" : state === "correct" ? "border-lime" : "border-line"}`}
        />
        <button
          type="submit"
          disabled={finished}
          className="rounded-lg bg-raised px-4 py-2 text-sm font-semibold text-lime disabled:opacity-60"
        >
          {state === "correct" ? "Correct" : "Submit"}
        </button>
        {state === "wrong" && (
          <button
            type="button"
            onClick={() => {
              setValue(question.accept[0]);
              setState("revealed");
              onSettle("wrong");
            }}
            className="px-2 font-mono text-xs text-faint hover:text-soft"
          >
            Show answer
          </button>
        )}
      </form>
      {state === "wrong" && (
        <p role="status" className="mt-2 font-mono text-sm text-rose">
          Not quite. Try again.
        </p>
      )}
      {finished && (
        <p className="mt-3 text-sm leading-relaxed text-soft">{question.explain}</p>
      )}
    </>
  );
}
