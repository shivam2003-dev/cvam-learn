"use client";

import { useEffect, useState } from "react";
import { ExamRunner } from "@/components/ExamRunner";
import type { Exam } from "@/lib/exams";

/** The question bank is large, so it loads as its own cached chunk after the page paints. */
const loaders: Record<string, () => Promise<Exam>> = {
  "gcp-pca": () => import("@/content/exams/gcp-pca/exam").then((m) => m.gcpPcaExam),
};

export function ExamLoader({ slug, lessonTitles }: { slug: string; lessonTitles: Record<string, string> }) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loaders[slug]?.()
      .then((loaded) => {
        if (!cancelled) setExam(loaded);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (failed) {
    return (
      <div role="alert" className="mx-auto max-w-5xl px-4 py-12 text-soft">
        Could not load the questions. Check your connection and{" "}
        <button type="button" onClick={() => window.location.reload()} className="text-lime underline">
          reload the page
        </button>
        .
      </div>
    );
  }

  if (!exam) {
    return (
      <div role="status" aria-busy="true" className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-5 flex items-center gap-3 font-mono text-sm text-soft">
          <span className="nav-spinner size-4 rounded-full border-2 border-lime/30 border-t-lime" aria-hidden="true" />
          Loading questions…
        </div>
        <div className="skeleton h-48 rounded-2xl border border-line bg-panel" />
      </div>
    );
  }

  return <ExamRunner exam={exam} lessonTitles={lessonTitles} />;
}
