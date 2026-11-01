import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProblemSolver } from "@/components/ProblemSolver";
import { TopNav } from "@/components/TopNav";
import { problems } from "@/content/inference-engineering/problems";

type Props = { params: Promise<{ problem: string }> };

export function generateStaticParams() {
  return problems.map((problem) => ({ problem: problem.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { problem: slug } = await params;
  const problem = problems.find((p) => p.slug === slug);
  return problem ? { title: problem.title } : {};
}

export default async function ProblemPage({ params }: Props) {
  const { problem: slug } = await params;
  const index = problems.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();

  return (
    <>
      <TopNav />
      <main>
        <ProblemSolver
          problem={problems[index]}
          course="inference-engineering"
          next={problems[index + 1]?.slug ?? null}
        />
      </main>
    </>
  );
}
