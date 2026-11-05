import { fde } from "@/content/courseware/fde/curriculum";
import { lessons as fdeLessons } from "@/content/courseware/fde/lessons";
import type { Course, Lesson, NavCourse } from "@/lib/types";

/**
 * Courseware is the long-form, chapter-based format: each lesson is a full
 * reading with diagrams, worked examples and exercises. Course slugs here must
 * not collide with learning-path slugs, because progress is keyed by slug.
 */
const registry: { course: Course; lessons: Record<string, Lesson> }[] = [
  { course: fde, lessons: fdeLessons },
];

export const coursewares = registry.map((entry) => entry.course);

export function getCourseware(slug: string) {
  return registry.find((entry) => entry.course.slug === slug);
}

export function toCoursewareNav(slug: string): NavCourse | undefined {
  const entry = getCourseware(slug);
  if (!entry) return undefined;
  return {
    slug,
    title: entry.course.title,
    modules: entry.course.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        ready: lesson.slug in entry.lessons,
        minutes: entry.lessons[lesson.slug]?.minutes ?? null,
        difficulty: entry.lessons[lesson.slug]?.difficulty ?? null,
      })),
    })),
  };
}

export function coursewareReadyLessons(slug: string) {
  const entry = getCourseware(slug);
  if (!entry) return [];
  return entry.course.modules.flatMap((module, moduleIndex) =>
    module.lessons
      .filter((lesson) => lesson.slug in entry.lessons)
      .map((lesson) => ({ ...lesson, module, moduleIndex })),
  );
}

export function coursewareStats(slug: string) {
  const entry = getCourseware(slug);
  const all = entry?.course.modules.flatMap((m) => m.lessons) ?? [];
  const ready = all.filter((l) => entry && l.slug in entry.lessons);
  const minutes = ready.reduce((sum, l) => sum + (entry?.lessons[l.slug]?.minutes ?? 0), 0);
  return {
    chapters: entry?.course.modules.length ?? 0,
    total: all.length,
    ready: ready.length,
    projects: all.filter((l) => l.kind === "project").length,
    labs: all.filter((l) => l.kind === "lab").length,
    quizzes: ready.reduce((sum, l) => sum + (entry?.lessons[l.slug]?.quiz.length ?? 0), 0),
    minutes,
  };
}
