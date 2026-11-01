import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Certificate } from "@/components/Certificate";
import { TopNav } from "@/components/TopNav";
import { courses, getCourse } from "@/lib/courses";

type Props = { params: Promise<{ course: string }> };

export function generateStaticParams() {
  return courses.map((course) => ({ course: course.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course } = await params;
  const entry = getCourse(course);
  return entry ? { title: `${entry.course.title} certificate` } : {};
}

export default async function CertificatePage({ params }: Props) {
  const { course: slug } = await params;
  const entry = getCourse(slug);
  if (!entry) notFound();
  const { course } = entry;

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-5xl px-4 py-10 print:m-0 print:max-w-none print:p-0">
        <Certificate
          course={slug}
          title={course.title}
          slugs={course.modules.flatMap((m) => m.lessons.map((l) => l.slug))}
          moduleCount={course.modules.length}
        />
      </main>
    </>
  );
}
