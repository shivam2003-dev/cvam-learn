import type { Metadata } from "next";
import Link from "next/link";
import { CourseBar } from "@/components/CourseBar";
import { TopNav } from "@/components/TopNav";
import { coursewareReadyLessons, coursewareStats, coursewares } from "@/lib/courseware";

export const metadata: Metadata = { title: "Courseware" };

export default function CoursewareIndex() {
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Courseware</h1>
        <p className="mt-3 mb-8 max-w-2xl text-soft">
          Full-length, chapter-based courses. Each lesson is a detailed reading with diagrams, worked
          examples, exercises and a quiz.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {coursewares.map((course) => {
            const stats = coursewareStats(course.slug);
            return (
              <article
                key={course.slug}
                className="flex flex-col rounded-2xl border border-line bg-panel p-6 transition hover:border-lime"
              >
                <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-faint">
                  <span className="rounded bg-raised px-2 py-1 text-lime">{course.level}</span>
                  <span className="py-1">{stats.chapters} chapters</span>
                  <span className="py-1">
                    {stats.ready} of {stats.total} lessons live
                  </span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-bold">
                  <Link href={`/courseware/${course.slug}`} className="hover:text-lime">
                    {course.title}
                  </Link>
                </h2>
                <p className="mt-2 flex-1 text-soft">{course.tagline}</p>
                <div className="mt-4">
                  <CourseBar
                    course={course.slug}
                    slugs={coursewareReadyLessons(course.slug).map((l) => l.slug)}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </>
  );
}
