import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseBar } from "@/components/CourseBar";
import { CurriculumNav } from "@/components/CurriculumNav";
import { DifficultyBadge } from "@/components/Lesson";
import { LessonTail } from "@/components/LessonTail";
import { OnThisPage } from "@/components/OnThisPage";
import { References } from "@/components/References";
import { TopNav } from "@/components/TopNav";
import { courses, getCourse, readyLessons, toNavCourse } from "@/lib/courses";

type Props = { params: Promise<{ course: string; lesson: string }> };

export function generateStaticParams() {
  return courses.flatMap((course) =>
    readyLessons(course.slug).map((lesson) => ({
      course: course.slug,
      lesson: lesson.slug,
    })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course, lesson } = await params;
  const meta = readyLessons(course).find((l) => l.slug === lesson);
  return meta ? { title: meta.title, description: meta.summary } : {};
}

export default async function LessonPage({ params }: Props) {
  const { course: courseSlug, lesson: slug } = await params;
  const entry = getCourse(courseSlug);
  const nav = toNavCourse(courseSlug);
  const lesson = entry?.lessons[slug];
  const ordered = readyLessons(courseSlug);
  const position = ordered.findIndex((l) => l.slug === slug);
  if (!entry || !nav || !lesson || position < 0) notFound();

  const meta = ordered[position];
  const prev = ordered[position - 1] ?? null;
  const next = ordered[position + 1] ?? null;
  const tocItems = [
    { id: "goals", title: "What you'll learn" },
    ...lesson.tasks.map(({ id, title }) => ({ id, title })),
    { id: "takeaways", title: "Key takeaways" },
    { id: "check", title: "Questions" },
  ];

  return (
    <>
      <TopNav />
      <div className="lg:flex">
        <CurriculumNav course={nav} activeSlug={slug} />

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
          <article className="mx-auto max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-wider text-lime">
              Module {meta.moduleIndex + 1} · {meta.module.title}
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
              {meta.title}
            </h1>
            <p className="mt-3 text-lg text-soft">{meta.summary}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <DifficultyBadge value={lesson.difficulty} />
              <span className="font-mono text-xs text-faint">
                {lesson.minutes} min · {lesson.tasks.length} tasks · {lesson.quiz.length} questions
              </span>
            </div>
            <div className="mt-4 max-w-xs">
              <CourseBar course={courseSlug} slugs={ordered.map((l) => l.slug)} />
            </div>

            <section
              id="goals"
              className="mt-7 scroll-mt-20 rounded-2xl border border-line bg-panel p-5"
            >
              <h2 className="font-mono text-xs uppercase tracking-wider text-faint">
                What you&apos;ll learn
              </h2>
              <ul className="mt-3 space-y-2">
                {lesson.objectives.map((objective) => (
                  <li key={objective} className="flex gap-2.5">
                    <span aria-hidden="true" className="text-lime">→</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </section>

            {lesson.tasks.map((task, index) => (
              <section
                key={task.id}
                id={task.id}
                aria-labelledby={`${task.id}-title`}
                className="mt-5 scroll-mt-20 rounded-2xl border border-line"
              >
                <header className="flex items-center gap-3 rounded-t-2xl border-b border-line bg-panel px-5 py-3">
                  <span className="rounded bg-lime px-2 py-0.5 font-mono text-xs font-bold text-ink">
                    Task {index + 1}
                  </span>
                  <h2 id={`${task.id}-title`} className="font-display text-xl font-bold">
                    {task.title}
                  </h2>
                </header>
                <div className="lesson-copy px-5 py-5">{task.body}</div>
              </section>
            ))}

            <section
              id="takeaways"
              className="mt-8 scroll-mt-20 rounded-2xl border border-lime/40 bg-lime/5 p-5"
            >
              <h2 className="font-display text-xl font-bold">Key takeaways</h2>
              <ul className="mt-3 space-y-2">
                {lesson.takeaways.map((takeaway) => (
                  <li key={takeaway} className="flex gap-2.5">
                    <span aria-hidden="true" className="text-lime">✓</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </section>

            <LessonTail
              course={courseSlug}
              slug={slug}
              quiz={lesson.quiz}
              prev={prev && { slug: prev.slug, title: prev.title }}
              next={next && { slug: next.slug, title: next.title }}
            />

            <References
              items={entry.references[slug] ?? []}
              roadmapUrl={`https://roadmap.sh/${courseSlug}`}
            />
          </article>
        </main>

        <OnThisPage items={tocItems} />
      </div>
    </>
  );
}
