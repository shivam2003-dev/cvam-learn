import { inferenceEngineering } from "@/content/inference-engineering/curriculum";
import { lessons as inferenceLessons } from "@/content/inference-engineering/lessons";
import inferenceReferences from "@/content/inference-engineering/references.json";
import { mlops } from "@/content/mlops/curriculum";
import { lessons as mlopsLessons } from "@/content/mlops/lessons";
import mlopsReferences from "@/content/mlops/references.json";
import type { Course, Lesson, NavCourse, Reference } from "@/lib/types";

const registry: {
  course: Course;
  lessons: Record<string, Lesson>;
  references: Record<string, Reference[]>;
}[] = [
  { course: inferenceEngineering, lessons: inferenceLessons, references: inferenceReferences },
  { course: mlops, lessons: mlopsLessons, references: mlopsReferences },
];

export const courses = registry.map((entry) => entry.course);

export function getCourse(slug: string) {
  return registry.find((entry) => entry.course.slug === slug);
}

export function toNavCourse(slug: string): NavCourse | undefined {
  const entry = getCourse(slug);
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

export function readyLessons(slug: string) {
  const entry = getCourse(slug);
  if (!entry) return [];
  return entry.course.modules.flatMap((module, moduleIndex) =>
    module.lessons
      .filter((lesson) => lesson.slug in entry.lessons)
      .map((lesson) => ({ ...lesson, module, moduleIndex })),
  );
}

export function courseStats(slug: string) {
  const entry = getCourse(slug);
  if (!entry) return { modules: 0, lessons: 0, ready: 0 };
  return {
    modules: entry.course.modules.length,
    lessons: entry.course.modules.reduce((sum, m) => sum + m.lessons.length, 0),
    ready: Object.keys(entry.lessons).length,
  };
}
