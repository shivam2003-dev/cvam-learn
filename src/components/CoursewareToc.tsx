"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { lessonKey, useProgress } from "@/lib/progress";
import type { NavCourse } from "@/lib/types";

const kindLabel = { project: "Project", lab: "Cloud lab", lesson: "" } as const;

export function CoursewareToc({ course }: { course: NavCourse }) {
  const progress = useProgress();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(course.modules.filter((m) => m.lessons.some((l) => l.ready)).map((m) => m.id)),
  );
  const needle = query.trim().toLowerCase();

  const chapters = useMemo(
    () =>
      course.modules
        .map((module, index) => ({
          module,
          index,
          lessons: needle
            ? module.lessons.filter((l) => `${l.title} ${l.summary}`.toLowerCase().includes(needle))
            : module.lessons,
        }))
        .filter((c) => c.lessons.length > 0),
    [course, needle],
  );

  const allOpen = open.size === course.modules.length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search lessons"
          aria-label="Search lessons"
          className="min-w-0 flex-1 rounded-lg border border-line bg-panel px-3 py-2 text-sm placeholder:text-faint"
        />
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(course.modules.map((m) => m.id)))}
          className="rounded-lg border border-line px-3 py-2 font-mono text-xs text-soft hover:text-text"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {chapters.length === 0 && <p className="text-soft">No lessons match &ldquo;{query}&rdquo;.</p>}

      <ol className="space-y-3">
        {chapters.map(({ module, index, lessons }) => {
          const finished = module.lessons.filter((l) => progress.done[lessonKey(course.slug, l.slug)]).length;
          const isOpen = needle ? true : open.has(module.id);
          return (
            <li key={module.id} className="rounded-xl border border-line bg-panel">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpen((current) => {
                    const next = new Set(current);
                    if (!next.delete(module.id)) next.add(module.id);
                    return next;
                  })
                }
                className="flex w-full items-start gap-4 px-5 py-4 text-left"
              >
                <span className="font-mono text-sm text-lime">{String(index + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-semibold">{module.title}</span>
                  <span className="block text-sm text-soft">{module.blurb}</span>
                </span>
                <span className="font-mono text-xs whitespace-nowrap text-faint">
                  {finished}/{module.lessons.length}
                </span>
              </button>
              {isOpen && (
                <ol className="border-t border-line py-1.5">
                  {lessons.map((lesson) => {
                    const done = progress.done[lessonKey(course.slug, lesson.slug)];
                    const tag = lesson.kind ? kindLabel[lesson.kind] : "";
                    const row = (
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
                        {tag && (
                          <span className="rounded border border-amber/40 px-1.5 py-0.5 font-mono text-[11px] text-amber">
                            {tag}
                          </span>
                        )}
                        <span className="font-mono text-xs whitespace-nowrap text-faint">
                          {lesson.ready ? `${lesson.minutes} min` : "soon"}
                        </span>
                      </>
                    );
                    return (
                      <li key={lesson.slug}>
                        {lesson.ready ? (
                          <Link
                            href={`/courseware/${course.slug}/${lesson.slug}`}
                            className="flex items-center gap-3 px-5 py-2.5 hover:bg-raised"
                          >
                            {row}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 px-5 py-2.5 opacity-55">{row}</div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
