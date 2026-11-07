import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CloudChapterVisual, hasCloudVisuals } from "@/components/CloudVisuals";
import { TopNav } from "@/components/TopNav";
import { gcpPca } from "@/content/courseware/gcp-pca/curriculum";
import { ansC01 } from "@/content/courseware/aws-ans-c01/curriculum";

const courses = { "gcp-pca": gcpPca, "aws-ans-c01": ansC01 };
type Props = { params: Promise<{ course: string }> };

export function generateStaticParams() {
  return Object.keys(courses).map(course => ({ course }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course } = await params;
  return hasCloudVisuals(course) ? { title: `${courses[course].title} · Chapter diagrams`, description: "A clean landscape visual recap of every chapter." } : {};
}

export default async function CloudVisualSummary({ params }: Props) {
  const { course } = await params;
  if (!hasCloudVisuals(course)) notFound();
  const curriculum = courses[course];
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
        <Link href={`/courseware/${course}`} className="text-sm font-semibold text-lime">← {curriculum.title}</Link>
        <p className="mt-8 text-sm font-semibold text-lime">The visual refresher</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Every chapter in diagrams</h1>
        <p className="mt-4 max-w-2xl text-lg text-soft">Revisit all {curriculum.modules.length} chapters through clean landscape diagrams. Open any image at full size, or follow the lesson links to review the details.</p>
        <nav aria-label="Chapter recap index" className="mt-8 grid gap-2 sm:grid-cols-2">
          {curriculum.modules.map((chapter, index) => <a key={chapter.id} href={`#recap-${chapter.id}`} className="rounded-xl border border-line bg-panel px-4 py-3 text-sm text-soft hover:border-lime/50 hover:text-text"><span className="mr-2 font-semibold text-lime">{String(index + 1).padStart(2, "0")}</span>{chapter.title}</a>)}
        </nav>
        {curriculum.modules.map(chapter => <CloudChapterVisual key={chapter.id} course={course} chapterId={chapter.id} />)}
        <Link href={`/courseware/${course}`} className="mt-10 inline-block font-semibold text-lime">Back to the course roadmap →</Link>
      </main>
    </>
  );
}
