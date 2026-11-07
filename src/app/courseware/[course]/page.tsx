import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseBar } from "@/components/CourseBar";
import { ContinueButton } from "@/components/CourseOverview";
import { CoursewareToc } from "@/components/CoursewareToc";
import { TopNav } from "@/components/TopNav";
import {
  coursewareReadyLessons,
  coursewareStats,
  coursewares,
  getCourseware,
  toCoursewareNav,
} from "@/lib/courseware";

type Props = { params: Promise<{ course: string }> };

export function generateStaticParams() {
  return coursewares.map((course) => ({ course: course.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course } = await params;
  const entry = getCourseware(course);
  return entry ? { title: entry.course.title, description: entry.course.tagline } : {};
}

export default async function CoursewarePage({ params }: Props) {
  const { course: slug } = await params;
  const entry = getCourseware(slug);
  const nav = toCoursewareNav(slug);
  if (!entry || !nav) notFound();
  const { course } = entry;
  const stats = coursewareStats(slug);

  return (
    <>
      <TopNav />
      <main>
        <section className="grid-bg border-b border-line">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <Link href="/courseware" className="font-mono text-sm text-lime">
              {"// courseware · "}
              {course.level}
            </Link>
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
              <ContinueButton course={nav} base="courseware" />
              {slug === "fde" && <Link href="/courseware/fde/visual-summary" className="text-sm font-semibold text-lime underline underline-offset-4">Explore the chapter recap diagrams →</Link>}
            </div>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm text-faint">
              <div><dt className="inline text-text">{stats.total}</dt> <dd className="inline">lessons</dd></div>
              <div><dt className="inline text-text">{stats.chapters}</dt> <dd className="inline">chapters</dd></div>
              <div><dt className="inline text-text">{stats.projects}</dt> <dd className="inline">projects</dd></div>
              <div><dt className="inline text-text">{stats.labs}</dt> <dd className="inline">cloud lab</dd></div>
              <div><dt className="inline text-text">{stats.quizzes}</dt> <dd className="inline">quiz questions</dd></div>
              <div><dt className="inline text-text">{stats.ready}</dt> <dd className="inline">lessons live</dd></div>
            </dl>
            <div className="mt-3 max-w-md">
              <CourseBar course={slug} slugs={coursewareReadyLessons(slug).map((l) => l.slug)} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-10">
          <h2 className="mb-4 font-display text-2xl font-bold">Learning roadmap</h2>
          <CoursewareToc course={nav} />
        </section>
      </main>
    </>
  );
}
