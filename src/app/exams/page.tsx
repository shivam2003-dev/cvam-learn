import type { Metadata } from "next";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { exams } from "@/lib/exams";

export const metadata: Metadata = { title: "Practice Exams" };

export default function ExamsIndex() {
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Practice exams</h1>
        <p className="mt-3 mb-8 max-w-2xl text-soft">
          Timed exam simulations and untimed practice with instant explanations. Every attempt gives you a
          score, a breakdown by exam section and topic, and lessons to revisit. Questions are original and
          mapped to the official exam guides.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map((exam) => (
            <article key={exam.slug} className="flex flex-col rounded-2xl border border-line bg-panel p-6 hover:border-lime">
              <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-faint">
                <span className="rounded bg-raised px-2 py-1 text-lime">{exam.questions.length} questions</span>
                <span className="py-1">{exam.sections.length} sections</span>
                <span className="py-1">
                  {exam.minutesPerQuestion} min per question
                </span>
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold">
                <Link href={`/exams/${exam.slug}`} className="hover:text-lime">
                  {exam.title}
                </Link>
              </h2>
              <p className="mt-2 flex-1 text-soft">{exam.subtitle}</p>
              <div className="mt-4 flex gap-4 text-sm">
                <Link href={`/exams/${exam.slug}`} className="font-semibold text-lime">
                  Start practising →
                </Link>
                <Link href={`/exams/${exam.slug}/cheatsheet`} className="text-soft hover:text-text">
                  Cheat sheet
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
