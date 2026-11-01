"use client";

import Link from "next/link";
import { useState } from "react";
import { DifficultyBadge } from "@/components/Lesson";
import { useProgress } from "@/lib/progress";
import type { Difficulty, Problem } from "@/lib/types";

type Row = Pick<Problem, "id" | "slug" | "title" | "difficulty" | "topic">;

const filters: ("All" | Difficulty)[] = ["All", "Easy", "Medium", "Hard"];

export function ProblemTable({ problems }: { problems: Row[] }) {
  const progress = useProgress();
  const [difficulty, setDifficulty] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();
  const rows = problems.filter(
    (p) =>
      (difficulty === "All" || p.difficulty === difficulty) &&
      `${p.title} ${p.topic}`.toLowerCase().includes(needle),
  );

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search problems"
          aria-label="Search problems"
          className="min-w-0 flex-1 rounded-lg border border-line bg-panel px-3 py-2 text-sm placeholder:text-faint sm:max-w-xs"
        />
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            aria-pressed={difficulty === filter}
            onClick={() => setDifficulty(filter)}
            className={`rounded-md px-2.5 py-1.5 font-mono text-xs ${difficulty === filter ? "bg-lime text-ink" : "bg-raised text-soft"}`}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[34rem] text-sm">
          <thead className="bg-raised text-left font-mono text-xs text-soft">
            <tr>
              <th scope="col" className="w-16 px-4 py-2.5 font-normal">Status</th>
              <th scope="col" className="px-4 py-2.5 font-normal">Title</th>
              <th scope="col" className="px-4 py-2.5 font-normal">Topic</th>
              <th scope="col" className="px-4 py-2.5 font-normal">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((problem) => (
              <tr key={problem.slug} className="border-t border-line odd:bg-panel hover:bg-raised">
                <td className="px-4 py-3 text-lime">
                  {progress.solved[problem.slug] ? <span aria-label="Solved">✓</span> : ""}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/practice/${problem.slug}`} className="hover:text-lime">
                    {problem.id}. {problem.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-soft">{problem.topic}</td>
                <td className="px-4 py-3"><DifficultyBadge value={problem.difficulty} /></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-faint">
                  No problems match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
