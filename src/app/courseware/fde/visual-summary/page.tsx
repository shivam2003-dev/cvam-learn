import type { Metadata } from "next";
import Link from "next/link";
import { ChapterVisual } from "@/components/FdeVisuals";
import { TopNav } from "@/components/TopNav";
import { fde } from "@/content/courseware/fde/curriculum";

export const metadata: Metadata = {
  title: "FDE Courseware · All 17 Chapters in Diagrams",
  description: "A handwritten visual recap of every chapter in the Forward Deployed Engineering courseware, from customer discovery to production and interview preparation.",
};

export default function FdeVisualSummaryPage() {
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
        <Link href="/courseware/fde" className="text-sm font-semibold text-lime">← Forward Deployed Engineering</Link>
        <p className="mt-8 text-sm font-semibold text-lime">The course notebook</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">17 chapters.<br />One visual refresher.</h1>
        <p className="mt-4 max-w-2xl text-lg text-soft">Revisit the whole course through handwritten landscape diagrams. Choose a chapter, open its sheet at full size, and follow the lesson links whenever you need a deeper explanation.</p>
        <nav aria-label="Chapter recap index" className="mt-8 grid gap-2 sm:grid-cols-2">
          {fde.modules.map((chapter, index) => <a key={chapter.id} href={`#recap-${chapter.id}`} className="rounded-xl border border-line bg-panel px-4 py-3 text-sm text-soft hover:border-lime/50 hover:text-text"><span className="mr-2 font-semibold text-lime">{String(index + 1).padStart(2, "0")}</span>{chapter.title}</a>)}
        </nav>
        {fde.modules.map((chapter) => <ChapterVisual key={chapter.id} chapterId={chapter.id} />)}
        <Link href="/courseware/fde" className="mt-10 inline-block font-semibold text-lime">Back to the course roadmap →</Link>
      </main>
    </>
  );
}
