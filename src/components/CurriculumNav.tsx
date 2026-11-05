"use client";

import Link from "next/link";
import { useState } from "react";
import { lessonKey, useProgress } from "@/lib/progress";
import type { NavCourse } from "@/lib/types";

export function CurriculumNav({
  course,
  activeSlug,
  base = "paths",
  groupLabel = "Module",
}: {
  course: NavCourse;
  activeSlug: string;
  base?: string;
  groupLabel?: string;
}) {
  const progress = useProgress();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openModules, setOpenModules] = useState(
    () =>
      new Set(
        course.modules
          .filter((m) => m.lessons.some((l) => l.slug === activeSlug))
          .map((m) => m.id),
      ),
  );

  function toggle(id: string) {
    setOpenModules((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  return (
    <div className="lg:contents">
      <button
        type="button"
        onClick={() => setDrawerOpen((open) => !open)}
        aria-expanded={drawerOpen}
        aria-controls="curriculum"
        className="m-4 mb-0 rounded-lg border border-line bg-panel px-3 py-2 font-mono text-sm text-soft lg:hidden"
      >
        {drawerOpen ? "Hide curriculum" : "Show curriculum"}
      </button>
      <nav
        id="curriculum"
        aria-label={`${groupLabel} list`}
        className={`${drawerOpen ? "block" : "hidden"} mt-4 border-y border-line bg-panel lg:sticky lg:top-14 lg:mt-0 lg:block lg:h-[calc(100dvh-3.5rem)] lg:w-80 lg:shrink-0 lg:overflow-y-auto lg:border-y-0 lg:border-r`}
      >
        <ol>
          {course.modules.map((module, moduleIndex) => {
            const finished = module.lessons.filter(
              (l) => progress.done[lessonKey(course.slug, l.slug)],
            ).length;
            const open = openModules.has(module.id);
            return (
              <li key={module.id} className="border-b border-line">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggle(module.id)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-raised"
                >
                  <span className="mt-0.5 font-mono text-xs text-faint">
                    {String(moduleIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {module.title}
                    </span>
                    <span className="font-mono text-xs text-faint">
                      {finished}/{module.lessons.length} done
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-faint">
                    {open ? "−" : "+"}
                  </span>
                </button>
                {open && (
                  <ol className="pb-2">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.slug}>
                        <LessonRow
                          base={base}
                          course={course.slug}
                          title={lesson.title}
                          slug={lesson.slug}
                          ready={lesson.ready}
                          active={lesson.slug === activeSlug}
                          done={
                            !!progress.done[lessonKey(course.slug, lesson.slug)]
                          }
                        />
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

function LessonRow({
  base,
  course,
  slug,
  title,
  ready,
  active,
  done,
}: {
  base: string;
  course: string;
  slug: string;
  title: string;
  ready: boolean;
  active: boolean;
  done: boolean;
}) {
  if (!ready) {
    return (
      <span className="flex items-center gap-3 px-4 py-1.5 pl-[3.35rem] text-sm text-faint">
        <span className="min-w-0 flex-1">{title}</span>
        <span className="font-mono text-[10px] uppercase">soon</span>
      </span>
    );
  }

  return (
    <Link
      href={`/${base}/${course}/${slug}`}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 border-l-2 px-4 py-1.5 pl-[1.6rem] text-sm hover:bg-raised ${active ? "border-lime bg-raised text-text" : "border-transparent text-soft"}`}
    >
      {done ? (
        <span className="grid size-4 shrink-0 place-items-center rounded-full bg-lime text-[10px] font-bold text-ink">
          ✓
        </span>
      ) : (
        <span
          className={`size-4 shrink-0 rounded-full border ${active ? "border-lime" : "border-faint"}`}
        />
      )}
      <span className="min-w-0 flex-1">{title}</span>
    </Link>
  );
}
