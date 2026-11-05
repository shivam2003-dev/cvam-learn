import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseBar } from "@/components/CourseBar";
import { RoadmapMap } from "@/components/RoadmapMap";
import { courses, getCourse, readyLessons, toNavCourse } from "@/lib/courses";

type Props = { params: Promise<{ course: string }> };

export function generateStaticParams() {
  return courses.map((course) => ({ course: course.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course } = await params;
  const entry = getCourse(course);
  return entry ? { title: `${entry.course.title} roadmap` } : {};
}

export default async function RoadmapPage({ params }: Props) {
  const { course: slug } = await params;
  const entry = getCourse(slug);
  const nav = toNavCourse(slug, { withResources: true });
  if (!entry || !nav) notFound();

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Link
          href={`/paths/${slug}`}
          className="inline-flex items-center gap-2 font-mono text-sm text-soft hover:text-text"
        >
          <span aria-hidden="true">←</span> Back to {entry.course.title} path
        </Link>
        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight">
          {entry.course.title} roadmap
        </h1>
        <p className="mt-3 max-w-2xl text-soft">
          Every topic, in order. Click a node for details. Your finished lessons
          light up.
        </p>
        <div className="mt-5 mb-8 max-w-md">
          <CourseBar course={slug} slugs={readyLessons(slug).map((l) => l.slug)} />
        </div>
        <RoadmapMap course={nav} />
      </main>
    </>
  );
}
