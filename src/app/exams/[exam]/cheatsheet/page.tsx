import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { Table } from "@/components/Lesson";
import { exams, getExam } from "@/lib/exams";
import { PrintButton } from "@/components/PrintButton";

type Props = { params: Promise<{ exam: string }> };

export function generateStaticParams() {
  return exams.map((exam) => ({ exam: exam.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { exam } = await params;
  const found = getExam(exam);
  return found ? { title: `${found.title} cheat sheet` } : {};
}

export default async function CheatSheetPage({ params }: Props) {
  const { exam: slug } = await params;
  const exam = getExam(slug);
  if (!exam) notFound();

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <Link href={`/exams/${exam.slug}`} className="font-mono text-sm text-lime">
            ← Practice exam
          </Link>
          <PrintButton />
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">Cheat sheet: {exam.title.replace(" Practice Exam", "")}</h1>
        <p className="mt-2 text-soft">
          Decision rules, limits and patterns by exam section. Learn the reasoning in the course lessons; use this for
          last-week review.
        </p>

        <div className="mt-6 space-y-6">
          {exam.cheatsheet.map((block) => {
            const section = exam.sections.find((s) => s.id === block.section);
            return (
              <section key={block.title} className="break-inside-avoid rounded-2xl border border-line bg-panel p-5">
                <p className="font-mono text-xs tracking-wider text-lime uppercase">
                  Section {block.section} · ~{section?.weight}%
                </p>
                <h2 className="mt-1 font-display text-xl font-bold">{block.title}</h2>
                <ul className="mt-3 space-y-2">
                  {block.points.map((point) => (
                    <li key={point} className="flex gap-2 text-[0.97rem] leading-relaxed">
                      <span aria-hidden="true" className="text-lime">→</span>
                      {point}
                    </li>
                  ))}
                </ul>
                {block.table && (
                  <div className="mt-4">
                    <Table head={block.table.head} rows={block.table.rows} />
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}
