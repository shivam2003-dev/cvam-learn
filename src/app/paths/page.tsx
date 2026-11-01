import type { Metadata } from "next";
import { CourseGrid } from "@/components/CourseGrid";
import { TopNav } from "@/components/TopNav";

export const metadata: Metadata = { title: "Learning paths" };

export default function PathsPage() {
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Learning paths</h1>
        <p className="mt-3 mb-8 max-w-2xl text-soft">
          Pick a path and work through it in order, one lesson at a time.
        </p>
        <CourseGrid base="paths" />
      </main>
    </>
  );
}
