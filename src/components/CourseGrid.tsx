import Link from "next/link";
import { CourseBar } from "@/components/CourseBar";
import { courses, courseStats, readyLessons } from "@/lib/courses";

export function CourseGrid({ base }: { base: "paths" | "roadmaps" }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {courses.map((course) => {
        const stats = courseStats(course.slug);
        return (
          <article key={course.slug} className="flex flex-col rounded-2xl border border-line bg-panel p-6 transition hover:border-lime">
            <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-faint">
              <span className="rounded bg-raised px-2 py-1 text-lime">{course.level}</span>
              <span className="py-1">{stats.modules} modules</span>
              <span className="py-1">{stats.ready} of {stats.lessons} lessons live</span>
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold">
              <Link href={`/${base}/${course.slug}`} className="hover:text-lime">
                {course.title}
              </Link>
            </h3>
            <p className="mt-2 flex-1 text-soft">{course.tagline}</p>
            {base === "paths" && (
              <Link
                href={`/roadmaps/${course.slug}`}
                className="mt-3 font-mono text-sm text-soft hover:text-text"
              >
                View as roadmap →
              </Link>
            )}
            <div className="mt-4">
              <CourseBar course={course.slug} slugs={readyLessons(course.slug).map((l) => l.slug)} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
