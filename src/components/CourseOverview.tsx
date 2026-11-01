"use client";

import Link from "next/link";
import { DifficultyBadge } from "@/components/Lesson";
import { lessonKey, useProgress } from "@/lib/progress";
import type { NavCourse } from "@/lib/types";

export function ContinueButton({ course }: { course: NavCourse }) {
  const progress = useProgress();
  const ready = course.modules.flatMap((m) => m.lessons.filter((l) => l.ready));
  const next = ready.find((l) => !progress.done[lessonKey(course.slug, l.slug)]);
  const started = ready.some((l) => progress.done[lessonKey(course.slug, l.slug)]);
  const target = next ?? ready[0];
  if (!target) return null;

  return (
    <Link
      href={`/paths/${course.slug}/${target.slug}`}
      className="inline-block rounded-lg bg-lime px-5 py-2.5 font-semibold text-ink transition hover:brightness-110"
    >
      {next ? (started ? `Continue: ${next.title}` : "Start learning") : "Review from the start"}
    </Link>
  );
}

export function ModuleList({ course }: { course: NavCourse }) {
  const progress = useProgress();

  return (
    <ol className="space-y-3">
      {course.modules.map((module, moduleIndex) => {
        const finished = module.lessons.filter(
          (l) => progress.done[lessonKey(course.slug, l.slug)],
        ).length;
        const total = module.lessons.length;
        return (
          <li key={module.id}>
            <details
              open={module.lessons.some((l) => l.ready)}
              className="rounded-xl border border-line bg-panel"
            >
              <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4">
                <span className="font-mono text-sm text-lime">
                  {String(moduleIndex + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-semibold">
                    {module.title}
                  </span>
                  <span className="block text-sm text-soft">{module.blurb}</span>
                </span>
                <span className="font-mono text-xs whitespace-nowrap text-faint">
                  {finished}/{total}
                </span>
              </summary>
              <ol className="border-t border-line py-2">
                {module.lessons.map((lesson) => {
                  const done = progress.done[lessonKey(course.slug, lesson.slug)];
                  const content = (
                    <>
                      <span
                        aria-hidden="true"
                        className={`grid size-5 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${done ? "border-lime bg-lime text-ink" : "border-faint"}`}
                      >
                        {done ? "✓" : ""}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{lesson.title}</span>
                        <span className="block text-sm text-faint">{lesson.summary}</span>
                      </span>
                      {lesson.difficulty && <DifficultyBadge value={lesson.difficulty} />}
                      <span className="font-mono text-xs whitespace-nowrap text-faint">
                        {lesson.ready ? `${lesson.minutes} min` : "soon"}
                      </span>
                    </>
                  );
                  return (
                    <li key={lesson.slug}>
                      {lesson.ready ? (
                        <Link
                          href={`/paths/${course.slug}/${lesson.slug}`}
                          className="flex items-center gap-3 px-5 py-2.5 hover:bg-raised"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 px-5 py-2.5 opacity-60">
                          {content}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </details>
          </li>
        );
      })}
    </ol>
  );
}
