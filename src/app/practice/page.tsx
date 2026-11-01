import type { Metadata } from "next";
import { ProblemTable } from "@/components/ProblemTable";
import { TopNav } from "@/components/TopNav";
import { problems } from "@/content/inference-engineering/problems";

export const metadata: Metadata = { title: "Practice" };

export default function PracticePage() {
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Practice</h1>
        <p className="mt-3 mb-8 max-w-2xl text-soft">
          Real capacity and cost calculations. Work the number, submit it, and
          the grader tells you if it holds.
        </p>
        <ProblemTable
          problems={problems.map(({ id, slug, title, difficulty, topic }) => ({
            id,
            slug,
            title,
            difficulty,
            topic,
          }))}
        />
      </main>
    </>
  );
}
