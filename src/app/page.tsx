import Link from "next/link";
import { ContinueButton } from "@/components/CourseOverview";
import { CourseGrid } from "@/components/CourseGrid";
import { ActivityHeatmap, DailyChallenge, RankCard } from "@/components/Dashboard";
import { ProblemTable } from "@/components/ProblemTable";
import { TopNav } from "@/components/TopNav";
import { problems } from "@/content/inference-engineering/problems";
import { courses, toNavCourse } from "@/lib/courses";

const problemRows = problems.map(({ id, slug, title, difficulty, topic }) => ({
  id,
  slug,
  title,
  difficulty,
  topic,
}));

export default function Home() {
  const featured = courses[0];
  const nav = toNavCourse(featured.slug);

  return (
    <>
      <TopNav />
      <main>
        <section className="grid-bg border-b border-line">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.5fr_1fr] lg:py-20">
            <div>
              <p className="font-mono text-sm text-lime">{"// learn it. map it. prove it."}</p>
              <h1 className="mt-4 font-display text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl">
                Go from reading about systems to running the numbers yourself.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-soft">
                Follow a visual roadmap, work through hands-on lessons, then
                prove it on practice problems. Your XP and streak stay in this
                browser.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                {nav && <ContinueButton course={nav} />}
                <Link
                  href={`/roadmaps/${featured.slug}`}
                  className="font-mono text-sm text-soft hover:text-text"
                >
                  View the roadmap →
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-line bg-panel p-5">
                <RankCard problemCount={problems.length} />
              </div>
              <DailyChallenge problems={problemRows} />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
          <section aria-label="Your activity" className="rounded-2xl border border-line bg-panel p-5">
            <ActivityHeatmap />
          </section>

          <section>
            <h2 className="mb-4 font-display text-2xl font-bold">Learning paths</h2>
            <CourseGrid base="paths" />
          </section>

          <section>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-bold">Practice problems</h2>
              <Link href="/practice" className="font-mono text-sm text-sky hover:underline">
                All problems →
              </Link>
            </div>
            <ProblemTable problems={problemRows.slice(0, 5)} />
          </section>
        </div>
      </main>
    </>
  );
}
