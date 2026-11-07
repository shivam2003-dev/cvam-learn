import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExamLoader } from "@/components/ExamLoader";
import { TopNav } from "@/components/TopNav";
import { lessonTitles } from "@/lib/courseMeta";
import { exams, getExam } from "@/lib/exams";

type Props = { params: Promise<{ exam: string }> };

export function generateStaticParams() {
  return exams.map((exam) => ({ exam: exam.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { exam } = await params;
  const found = getExam(exam);
  return found ? { title: found.title, description: found.subtitle } : {};
}

export default async function ExamPage({ params }: Props) {
  const { exam: slug } = await params;
  const exam = getExam(slug);
  if (!exam) notFound();

  return (
    <>
      <TopNav />
      <main>
        <section className="grid-bg border-b border-line">
          <div className="mx-auto max-w-5xl px-4 py-8">
            <Link href="/exams" className="font-mono text-sm text-lime">
              {"// practice exams"}
            </Link>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{exam.title}</h1>
            <p className="mt-2 max-w-2xl text-soft">{exam.description}</p>
          </div>
        </section>
        <ExamLoader slug={exam.slug} lessonTitles={lessonTitles(exam.courseSlug)} />
      </main>
    </>
  );
}
