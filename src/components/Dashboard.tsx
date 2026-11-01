"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { dayKey, levelOf, streakOf, useProgress, xpOf } from "@/lib/progress";

const WEEKS = 26;

/** Date-driven UI waits for the browser: the build's "today" is not the reader's. */
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function heatTone(count: number) {
  if (count >= 5) return "bg-lime";
  if (count >= 3) return "bg-lime/65";
  if (count >= 1) return "bg-lime/35";
  return "bg-raised";
}

export function ActivityHeatmap() {
  const progress = useProgress();
  const mounted = useMounted();
  const weeks: { key: string; count: number }[][] = [];
  const today = mounted ? new Date() : null;
  const start = today ? new Date(today) : null;
  if (start) start.setDate(start.getDate() - (WEEKS * 7 - 1) - start.getDay());
  for (let week = 0; today && start && week < WEEKS + 1; week++) {
    const days = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(start);
      date.setDate(start.getDate() + week * 7 + day);
      if (date > today) break;
      const key = dayKey(date);
      days.push({ key, count: progress.activity[key] ?? 0 });
    }
    weeks.push(days);
  }
  const total = Object.values(progress.activity).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-bold">Activity</h2>
        <p className="font-mono text-xs text-faint">{total} actions, last 6 months</p>
      </div>
      <div className="mt-3 flex min-h-[6.3rem] gap-[3px] overflow-x-auto pb-1" role="img" aria-label={`${total} learning actions in the last six months`}>
        {weeks.map((days, index) => (
          <div key={index} className="grid shrink-0 grid-rows-7 gap-[3px]">
            {days.map((day) => (
              <span
                key={day.key}
                title={`${day.key}: ${day.count}`}
                className={`size-3 rounded-[2px] ${heatTone(day.count)}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function RankCard({ problemCount }: { problemCount: number }) {
  const progress = useProgress();
  const xp = xpOf(progress);
  const { level, rank, intoLevel, perLevel } = levelOf(xp);
  const stats = [
    { label: "Streak", value: `${streakOf(progress)}d` },
    { label: "Lessons", value: Object.keys(progress.done).length },
    { label: "Solved", value: `${Object.keys(progress.solved).length}/${problemCount}` },
  ];

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-faint">Your rank</p>
      <p className="mt-1 font-display text-2xl font-bold text-lime">{rank}</p>
      <p className="font-mono text-sm text-soft">Level {level} · {xp} XP</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-raised">
        <div className="h-full bg-lime" style={{ width: `${(intoLevel / perLevel) * 100}%` }} />
      </div>
      <p className="mt-1 font-mono text-xs text-faint">{perLevel - intoLevel} XP to level {level + 1}</p>
      <dl className="mt-4 grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg bg-raised px-2 py-2 text-center">
            <dd className="font-display text-lg font-bold">{stat.value}</dd>
            <dt className="font-mono text-[10px] uppercase text-faint">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Rotates through unsolved problems by calendar day. */
export function DailyChallenge({
  problems,
}: {
  problems: { slug: string; title: string; difficulty: string; topic: string }[];
}) {
  const progress = useProgress();
  const mounted = useMounted();
  const dayNumber = mounted
    ? Math.floor(new Date(`${dayKey(new Date())}T00:00:00Z`).getTime() / 86400000)
    : 0;
  const problem = problems[dayNumber % problems.length];
  const solved = !!progress.solved[problem.slug];

  return (
    <Link
      href={`/practice/${problem.slug}`}
      className="block rounded-2xl border border-amber/50 bg-amber/8 p-5 transition hover:border-amber"
    >
      <p className="font-mono text-xs uppercase tracking-wider text-amber">
        Daily challenge {solved ? "· solved" : ""}
      </p>
      <p className="mt-2 font-display text-xl font-bold">{problem.title}</p>
      <p className="mt-1 font-mono text-xs text-soft">
        {problem.difficulty} · {problem.topic}
      </p>
    </Link>
  );
}
