import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseBar } from "@/components/CourseBar";
import { ContinueButton, ModuleList } from "@/components/CourseOverview";
import { TopNav } from "@/components/TopNav";
import {
  courses,
  courseStats,
  getCourse,
  readyLessons,
  toNavCourse,
} from "@/lib/courses";

type Props = { params: Promise<{ course: string }> };

export function generateStaticParams() {
  return courses.map((course) => ({ course: course.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course } = await params;
  const entry = getCourse(course);
  return entry
    ? { title: entry.course.title, description: entry.course.tagline }
    : {};
}

export default async function CoursePage({ params }: Props) {
  const { course: slug } = await params;
  const entry = getCourse(slug);
  const nav = toNavCourse(slug);
  if (!entry || !nav) notFound();
  const { course } = entry;
  const stats = courseStats(slug);

  return (
    <>
      <TopNav />
      <main>
        <section className="grid-bg border-b border-line">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <p className="font-mono text-sm text-lime">{"// learning path · "}{course.level}</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              {course.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-soft">{course.description}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {course.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-md border border-line bg-panel px-2 py-1 font-mono text-xs text-soft"
                >
                  {skill}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <ContinueButton course={nav} />
              <Link href={`/roadmaps/${slug}`} className="font-mono text-sm text-soft hover:text-text">
                View as roadmap →
              </Link>
              <Link href={`/paths/${slug}/certificate`} className="font-mono text-sm text-soft hover:text-text">
                Certificate →
              </Link>
            </div>
            <p className="mt-5 font-mono text-sm text-faint">
              {stats.modules} modules · {stats.ready} of {stats.lessons} lessons live
            </p>
            <div className="mt-3 max-w-md">
              <CourseBar course={slug} slugs={readyLessons(slug).map((l) => l.slug)} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-10">
          <h2 className="mb-4 font-display text-2xl font-bold">Curriculum</h2>
          <ModuleList course={nav} />
          <p className="mt-8 text-sm text-faint">
            Topic coverage follows the{" "}
            <a
              href={`https://roadmap.sh/${slug}`}
              className="text-sky underline underline-offset-2"
            >
              roadmap.sh {course.title} roadmap
            </a>
            . Lessons, order and exercises are written for this path.
          </p>
        </section>
      </main>
    </>
  );
}
