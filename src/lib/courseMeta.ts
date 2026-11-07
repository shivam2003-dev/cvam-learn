import { ansC01 } from "@/content/courseware/aws-ans-c01/curriculum";
import { fde } from "@/content/courseware/fde/curriculum";
import { gcpPca } from "@/content/courseware/gcp-pca/curriculum";
import type { Course } from "@/lib/types";

/** Curricula only (no lesson bodies), so pages that just need titles stay light. */
const curricula: Course[] = [fde, ansC01, gcpPca];

export function lessonTitles(courseSlug: string): Record<string, string> {
  const titles: Record<string, string> = {};
  const course = curricula.find((c) => c.slug === courseSlug);
  for (const chapter of course?.modules ?? []) {
    for (const lesson of chapter.lessons) titles[lesson.slug] = lesson.title;
  }
  return titles;
}
