import type { Metadata } from "next";
import { CourseGrid } from "@/components/CourseGrid";
import { TopNav } from "@/components/TopNav";

export const metadata: Metadata = { title: "Roadmaps" };

export default function RoadmapsPage() {
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Roadmaps</h1>
        <p className="mt-3 mb-8 max-w-2xl text-soft">
          See a whole field at once, then click any topic to dive in.
        </p>
        <CourseGrid base="roadmaps" />
      </main>
    </>
  );
}
