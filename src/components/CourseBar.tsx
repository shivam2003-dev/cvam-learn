"use client";

import { lessonKey, useProgress } from "@/lib/progress";

export function CourseBar({
  course,
  slugs,
}: {
  course: string;
  slugs: string[];
}) {
  const progress = useProgress();
  const done = slugs.filter((s) => progress.done[lessonKey(course, s)]).length;
  const percent = slugs.length ? Math.round((done / slugs.length) * 100) : 0;

  return (
    <div className="flex items-center gap-2">
      <div
        role="progressbar"
        aria-label="Course progress"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 w-full overflow-hidden rounded-full bg-raised"
      >
        <div
          className="h-full rounded-full bg-lime transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="font-mono text-xs text-soft">{percent}%</span>
    </div>
  );
}
