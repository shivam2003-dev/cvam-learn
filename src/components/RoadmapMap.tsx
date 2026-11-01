"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { lessonKey, useProgress } from "@/lib/progress";
import type { NavCourse, NavLesson } from "@/lib/types";

export function RoadmapMap({ course }: { course: NavCourse }) {
  const progress = useProgress();
  const [selected, setSelected] = useState<NavLesson | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const node = (lesson: NavLesson) => {
    const done = progress.done[lessonKey(course.slug, lesson.slug)];
    let tone = "border-line bg-panel text-faint";
    if (done) tone = "border-lime bg-lime text-ink";
    else if (lesson.ready) tone = "border-amber/70 bg-amber/15 text-text hover:bg-amber/25";
    return (
      <button
        key={lesson.slug}
        type="button"
        onClick={() => setSelected(lesson)}
        className={`rounded-md border px-3 py-1.5 text-left text-sm ${tone}`}
      >
        {done ? "✓ " : ""}
        {lesson.title}
      </button>
    );
  };

  return (
    <>
      <ul className="mb-8 flex flex-wrap gap-4 font-mono text-xs text-soft">
        <li><span className="mr-1.5 inline-block size-2.5 rounded-sm bg-lime" />Done</li>
        <li><span className="mr-1.5 inline-block size-2.5 rounded-sm bg-amber" />Ready to learn</li>
        <li><span className="mr-1.5 inline-block size-2.5 rounded-sm border border-faint" />Coming soon</li>
      </ul>

      <ol>
        {course.modules.map((module, moduleIndex) => {
          const left = module.lessons.filter((_, i) => i % 2 === 0);
          const right = module.lessons.filter((_, i) => i % 2 === 1);
          return (
            <li key={module.id} className="map-row mb-8 min-[900px]:mb-0">
              <div className="map-side left order-2 grid gap-2 min-[900px]:order-none min-[900px]:justify-items-end">
                {left.map(node)}
              </div>
              <div className="relative z-1 order-1 rounded-lg border-2 border-lime bg-ink px-4 py-3 text-center font-display font-bold min-[900px]:order-none">
                <span className="mr-2 font-mono text-xs font-normal text-lime">
                  {String(moduleIndex + 1).padStart(2, "0")}
                </span>
                {module.title}
              </div>
              <div className="map-side right order-3 grid gap-2 min-[900px]:order-none min-[900px]:justify-items-start">
                {right.map(node)}
              </div>
            </li>
          );
        })}
      </ol>

      {selected && (
        <>
          <button
            type="button"
            aria-label="Close topic details"
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-30 bg-black/60"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            className="fixed inset-y-0 right-0 z-40 w-full max-w-md overflow-y-auto border-l border-line bg-panel p-6"
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              autoFocus
              className="font-mono text-sm text-soft hover:text-text"
            >
              Close
            </button>
            <h2 className="mt-5 font-display text-2xl font-bold">{selected.title}</h2>
            <p className="mt-3 text-soft">{selected.summary}</p>
            {selected.ready ? (
              <Link
                href={`/paths/${course.slug}/${selected.slug}`}
                className="mt-6 inline-block rounded-lg bg-lime px-4 py-2 font-semibold text-ink"
              >
                Open lesson · {selected.minutes} min
              </Link>
            ) : (
              <p className="mt-6 rounded-lg border border-line p-3 font-mono text-sm text-faint">
                This lesson is being written.
              </p>
            )}
          </aside>
        </>
      )}
    </>
  );
}
