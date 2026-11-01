"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { lessonKey, useProgress } from "@/lib/progress";
import type { NavCourse, NavLesson, NavModule, Reference } from "@/lib/types";

const GROUPS = [
  { type: "book", label: "Books" },
  { type: "official", label: "Official docs" },
  { type: "paper", label: "Papers" },
  { type: "article", label: "Articles" },
  { type: "video", label: "Videos" },
  { type: "course", label: "Courses" },
  { type: "opensource", label: "Open source" },
  { type: "roadmap", label: "Related roadmaps" },
];

type Selection = { lesson: NavLesson } | { module: NavModule };

function unique(items: Reference[]) {
  return items.filter((item, i) => items.findIndex((o) => o.url === item.url) === i);
}

export function RoadmapMap({ course }: { course: NavCourse }) {
  const progress = useProgress();
  const [selected, setSelected] = useState<Selection | null>(null);

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
    let tone = "border-line bg-panel text-soft hover:border-soft hover:text-text";
    if (done) tone = "border-lime bg-lime text-ink";
    else if (lesson.ready) tone = "border-amber/70 bg-amber/15 text-text hover:bg-amber/25";
    return (
      <button
        key={lesson.slug}
        type="button"
        onClick={() => setSelected({ lesson })}
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
              <button
                type="button"
                onClick={() => setSelected({ module })}
                className="relative z-1 order-1 rounded-lg border-2 border-lime bg-ink px-4 py-3 text-center font-display font-bold transition hover:bg-lime/10 min-[900px]:order-none"
              >
                <span className="mr-2 font-mono text-xs font-normal text-lime">
                  {String(moduleIndex + 1).padStart(2, "0")}
                </span>
                {module.title}
              </button>
              <div className="map-side right order-3 grid gap-2 min-[900px]:order-none min-[900px]:justify-items-start">
                {right.map(node)}
              </div>
            </li>
          );
        })}
      </ol>

      {selected && (
        <TopicDrawer
          course={course.slug}
          selection={selected}
          onClose={() => setSelected(null)}
          onOpenLesson={(lesson) => setSelected({ lesson })}
        />
      )}
    </>
  );
}

function TopicDrawer({
  course,
  selection,
  onClose,
  onOpenLesson,
}: {
  course: string;
  selection: Selection;
  onClose: () => void;
  onOpenLesson: (lesson: NavLesson) => void;
}) {
  const lesson = "lesson" in selection ? selection.lesson : null;
  const group = "module" in selection ? selection.module : null;
  const title = lesson?.title ?? group?.title ?? "";
  const resources = lesson
    ? (lesson.resources ?? [])
    : unique((group?.lessons ?? []).flatMap((l) => l.resources ?? []));
  const known = new Set(GROUPS.map((group) => group.type));
  const groups = [
    ...GROUPS,
    ...[...new Set(resources.map((r) => r.type))]
      .filter((type) => !known.has(type))
      .map((type) => ({ type, label: type })),
  ];

  return (
    <>
      <button
        type="button"
        aria-label="Close topic details"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-black/60"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-y-0 right-0 z-40 w-full max-w-lg overflow-y-auto border-l border-line bg-panel p-6"
      >
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="font-mono text-sm text-soft hover:text-text"
        >
          Close
        </button>
        <h2 className="mt-5 font-display text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-soft">{lesson?.summary ?? group?.blurb}</p>

        {lesson &&
          (lesson.ready ? (
            <Link
              href={`/paths/${course}/${lesson.slug}`}
              className="mt-5 inline-block rounded-lg bg-lime px-4 py-2 font-semibold text-ink"
            >
              Open lesson · {lesson.minutes} min
            </Link>
          ) : (
            <p className="mt-5 rounded-lg border border-line p-3 font-mono text-sm text-faint">
              Lesson coming soon. Start with the resources below.
            </p>
          ))}

        {group && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {group.lessons.map((item) => (
              <li key={item.slug}>
                <button
                  type="button"
                  onClick={() => onOpenLesson(item)}
                  className="rounded-md border border-line bg-raised px-2.5 py-1 text-sm text-soft hover:text-text"
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        )}

        {groups.map(({ type, label }) => {
          const items = resources.filter((resource) => resource.type === type);
          if (items.length === 0) return null;
          return (
            <section key={type} className="mt-6">
              <h3 className="font-mono text-xs uppercase tracking-wider text-faint">
                {label} · {items.length}
              </h3>
              <ul className="mt-2 divide-y divide-line">
                {items.map((item) => (
                  <li key={item.url}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block py-2 text-sm text-sky hover:underline"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <p className="mt-6 text-xs text-faint">
          Curated picks plus links from the{" "}
          <a href={`https://roadmap.sh/${course}`} className="underline underline-offset-2">
            roadmap.sh
          </a>{" "}
          community roadmap.
        </p>
      </aside>
    </>
  );
}
