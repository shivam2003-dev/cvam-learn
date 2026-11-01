"use client";

import Link from "next/link";
import { useState } from "react";
import { DifficultyBadge } from "@/components/Lesson";
import { markSolved, useProgress } from "@/lib/progress";
import type { Problem } from "@/lib/types";

type Tab = "description" | "hints" | "solution";
type Attempt = { value: string; accepted: boolean };

export function ProblemSolver({
  problem,
  course,
  next,
}: {
  problem: Problem;
  course: string;
  next: string | null;
}) {
  const progress = useProgress();
  const [tab, setTab] = useState<Tab>("description");
  const [value, setValue] = useState("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const solved = !!progress.solved[problem.slug];
  const latest = attempts[0];

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const number = Number(value.replace(/,/g, ""));
    if (!value.trim() || Number.isNaN(number)) return;
    const accepted = Math.abs(number - problem.answer) <= problem.tolerance;
    setAttempts((current) => [{ value, accepted }, ...current]);
    if (accepted) markSolved(problem.slug);
  }

  const tabs: { id: Tab; label: string; locked?: boolean }[] = [
    { id: "description", label: "Description" },
    { id: "hints", label: `Hints (${problem.hints.length})` },
    { id: "solution", label: solved ? "Solution" : "Solution (locked)", locked: !solved && attempts.length === 0 },
  ];

  return (
    <div className="grid lg:h-[calc(100dvh-3.5rem)] lg:grid-cols-2">
      <section className="flex min-h-0 flex-col border-line lg:border-r">
        <div role="tablist" className="flex gap-1 border-b border-line bg-panel px-3 py-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              disabled={item.locked}
              title={item.locked ? "Submit an attempt to unlock" : undefined}
              onClick={() => setTab(item.id)}
              className={`rounded-md px-2.5 py-1 text-sm disabled:opacity-50 ${tab === item.id ? "bg-raised text-text" : "text-soft"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {tab === "description" && (
            <>
              <h1 className="font-display text-2xl font-bold">
                {problem.id}. {problem.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <DifficultyBadge value={problem.difficulty} />
                <span className="font-mono text-xs text-faint">{problem.topic}</span>
                {solved && <span className="font-mono text-xs text-lime">Solved</span>}
              </div>
              <div className="mt-5 space-y-3 leading-relaxed text-[#d3dbe4]">
                {problem.statement.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <dl className="mt-5 divide-y divide-line rounded-lg border border-line">
                {problem.given.map((item) => (
                  <div key={item.label} className="flex justify-between gap-4 px-3 py-2 text-sm">
                    <dt className="text-soft">{item.label}</dt>
                    <dd className="font-mono text-lime">{item.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 font-medium">{problem.ask}</p>
              <Link
                href={`/paths/${course}/${problem.lesson}`}
                className="mt-4 inline-block font-mono text-sm text-sky hover:underline"
              >
                Read the related lesson →
              </Link>
            </>
          )}
          {tab === "hints" && (
            <ol className="space-y-3">
              {problem.hints.map((hint, index) => (
                <li key={hint}>
                  <details className="rounded-lg border border-line bg-panel">
                    <summary className="cursor-pointer px-3 py-2 font-mono text-sm text-soft">
                      Hint {index + 1}
                    </summary>
                    <p className="border-t border-line px-3 py-2 text-sm leading-relaxed">{hint}</p>
                  </details>
                </li>
              ))}
            </ol>
          )}
          {tab === "solution" && (
            <ol className="list-decimal space-y-2 pl-5 leading-relaxed">
              {problem.solution.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section className="flex min-h-0 flex-col bg-[#080b0f]">
        <div className="border-b border-line bg-panel px-4 py-2.5 font-mono text-sm text-soft">
          Your answer
        </div>
        <form onSubmit={submit} className="p-5">
          <label htmlFor="answer" className="block text-sm text-soft">
            Enter a number in <span className="font-mono text-text">{problem.unit}</span>
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              id="answer"
              inputMode="decimal"
              autoComplete="off"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-line bg-ink px-3 py-2.5 font-mono text-lg"
            />
            <button
              type="submit"
              className="rounded-lg bg-lime px-5 py-2.5 font-semibold text-ink hover:brightness-110"
            >
              Submit
            </button>
          </div>
        </form>

        <div aria-live="polite" className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          {latest && (
            <div
              className={`rounded-lg border p-4 ${latest.accepted ? "border-lime/60 bg-lime/8" : "border-rose/60 bg-rose/8"}`}
            >
              <p className={`font-display text-xl font-bold ${latest.accepted ? "text-lime" : "text-rose"}`}>
                {latest.accepted ? "Accepted" : "Wrong Answer"}
              </p>
              <p className="mt-1 font-mono text-sm text-soft">
                Your output: {latest.value} {problem.unit}
              </p>
              {latest.accepted && next && (
                <Link href={`/practice/${next}`} className="mt-3 inline-block font-mono text-sm text-sky hover:underline">
                  Next problem →
                </Link>
              )}
            </div>
          )}
          {attempts.length > 0 && (
            <>
              <h2 className="mt-5 font-mono text-xs uppercase tracking-wider text-faint">
                Submissions this session
              </h2>
              <ul className="mt-2 divide-y divide-line font-mono text-sm">
                {attempts.map((attempt, index) => (
                  <li key={attempts.length - index} className="flex justify-between py-1.5">
                    <span className={attempt.accepted ? "text-lime" : "text-rose"}>
                      {attempt.accepted ? "Accepted" : "Wrong Answer"}
                    </span>
                    <span className="text-soft">{attempt.value}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
