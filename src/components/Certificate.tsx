"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount } from "@/lib/account";
import { lessonKey, useProgress } from "@/lib/progress";

export function Certificate({
  course,
  title,
  slugs,
  moduleCount,
}: {
  course: string;
  title: string;
  slugs: string[];
  moduleCount: number;
}) {
  const progress = useProgress();
  const { user } = useAccount();
  const [typedName, setTypedName] = useState<string | null>(null);

  const stamps = slugs
    .map((slug) => progress.done[lessonKey(course, slug)])
    .filter(Boolean);
  const earned = slugs.length > 0 && stamps.length === slugs.length;
  const name = typedName ?? (user?.user_metadata?.full_name as string | undefined) ?? "";
  const date = earned
    ? new Date(Math.max(...stamps)).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date of completion";

  return (
    <>
      <div className="mb-6 print:hidden">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          Certificate of Completion
        </h1>
        {earned ? (
          <>
            <p className="mt-3 text-soft">
              You finished every lesson in {title}. Add your name, then save it as a PDF.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                aria-label="Name on certificate"
                value={name}
                onChange={(event) => setTypedName(event.target.value)}
                placeholder="Your full name"
                maxLength={60}
                className="min-w-0 flex-1 rounded-lg border border-line bg-panel px-3 py-2 sm:max-w-sm"
              />
              <button
                type="button"
                disabled={!name.trim()}
                onClick={() => window.print()}
                className="rounded-lg bg-lime px-4 py-2 font-semibold text-ink disabled:cursor-not-allowed disabled:bg-raised disabled:text-faint"
              >
                Download PDF
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-soft">
              Finish all {slugs.length} lessons to unlock yours. You&apos;ve completed{" "}
              <strong className="text-text">{stamps.length}</strong> so far.
            </p>
            <Link
              href={`/paths/${course}`}
              className="mt-3 inline-block font-mono text-sm text-sky hover:underline"
            >
              ← Back to the path
            </Link>
          </>
        )}
      </div>

      <div className="overflow-x-auto print:overflow-visible">
        <article
          aria-label={earned ? "Your certificate" : "Sample certificate"}
          className="certificate relative mx-auto aspect-[297/210] w-[56rem] overflow-hidden bg-[#0b0f14] p-5 text-[#e7ecf2]"
        >
          <div className="flex h-full flex-col items-center justify-between border border-[#c6f24e]/60 px-16 py-10 text-center outline-1 -outline-offset-8 outline-[#c6f24e]/25">
            <p className="font-display text-xl font-bold tracking-tight">
              cvam<span className="text-[#c6f24e]">.learn</span>
            </p>

            <div>
              <p className="font-mono text-sm tracking-[0.3em] text-[#c6f24e] uppercase">
                Certificate of Completion
              </p>
              <p className="mt-7 text-[#a3afbd]">This certifies that</p>
              <p className="mt-2 min-h-[3.5rem] font-display text-5xl font-extrabold tracking-tight">
                {earned ? name || "Your Name" : "Your Name"}
              </p>
              <p className="mt-5 text-[#a3afbd]">has completed the learning path</p>
              <p className="mt-2 font-display text-3xl font-bold text-[#c6f24e]">{title}</p>
              <p className="mt-3 font-mono text-sm text-[#a3afbd]">
                {moduleCount} modules · {slugs.length} lessons
              </p>
            </div>

            <div className="flex w-full items-end justify-between font-mono text-xs text-[#a3afbd]">
              <div className="w-48 border-t border-[#8592a1] pt-2 text-left">
                <p className="text-sm text-[#e7ecf2]">{date}</p>
                <p>Date</p>
              </div>
              <div className="w-48 border-t border-[#8592a1] pt-2 text-right">
                <p className="text-sm text-[#e7ecf2]">cvam.learn</p>
                <p>learn.shivam2003.com</p>
              </div>
            </div>
          </div>

          {!earned && (
            <p
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 grid -rotate-12 place-items-center font-display text-[9rem] font-extrabold tracking-widest text-white/7"
            >
              SAMPLE
            </p>
          )}
        </article>
      </div>
    </>
  );
}
