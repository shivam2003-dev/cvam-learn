import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DiagramSvg } from "@/components/CloudDiagramSvg";
import { PrintButton } from "@/components/PrintButton";
import { coursewareReadyLessons, getCourseware } from "@/lib/courseware";
import { providerMeta, providers, sheetOf, type Provider } from "@/lib/cloud";

type Props = { params: Promise<{ course: string; lesson: string; cloud: string }> };

const COURSE = "cloud-architecture-diagrams";

export function generateStaticParams() {
  return coursewareReadyLessons(COURSE)
    .filter((lesson) => sheetOf(getCourseware(COURSE)?.lessons[lesson.slug]))
    .flatMap((lesson) => providers.map((cloud) => ({ course: COURSE, lesson: lesson.slug, cloud })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course, lesson, cloud } = await params;
  const meta = coursewareReadyLessons(course).find((l) => l.slug === lesson);
  const name = providerMeta[cloud as Provider]?.short ?? "";
  return meta ? { title: `${meta.title} · ${name} study sheet`, robots: { index: false } } : {};
}

export default async function StudySheetPage({ params }: Props) {
  const { course, lesson: slug, cloud } = await params;
  const entry = getCourseware(course);
  const meta = coursewareReadyLessons(course).find((l) => l.slug === slug);
  const lesson = entry?.lessons[slug];
  const sheet = sheetOf(lesson);
  if (course !== COURSE || !entry || !meta || !lesson || !sheet || !(providers as readonly string[]).includes(cloud)) notFound();

  const provider = cloud as Provider;
  const info = providerMeta[provider];
  const spec = sheet.specs[provider];
  const services = [...new Map(spec.nodes.map((node) => [node.label, node])).values()].filter((node) => node.label !== "Users");

  return (
    <div className="min-h-screen bg-white text-slate-900 print:min-h-0">
      <style>{`@page { size: A4 landscape; margin: 10mm; } @media print { .sheet-hide { display: none !important; } .sheet-page { break-inside: avoid; } body { background: #fff !important; } }`}</style>
      <div className="sheet-hide flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-6 py-3">
        <Link href={`/courseware/${course}/${slug}`} className="text-sm font-semibold text-sky-700 underline underline-offset-4">
          ← Back to the lesson
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {providers.map((id) => (
            <Link
              key={id}
              href={`/courseware/${course}/${slug}/study-sheet/${id}`}
              className={`rounded-md border px-3 py-1 font-mono text-xs font-bold ${id === provider ? "text-white" : "border-slate-300 text-slate-600 hover:bg-white"}`}
              style={id === provider ? { background: providerMeta[id].accent, borderColor: providerMeta[id].accent } : undefined}
            >
              {providerMeta[id].short}
            </Link>
          ))}
          <PrintButton />
        </div>
      </div>

      <main className="mx-auto max-w-[1100px] px-6 py-6">
        <header className="flex flex-wrap items-end justify-between gap-2 border-b-2 pb-3" style={{ borderColor: info.accent }}>
          <div>
            <p className="m-0 font-mono text-xs font-bold tracking-wider uppercase" style={{ color: info.accent }}>
              Study sheet · {info.name}
            </p>
            <h1 className="m-0 mt-1 text-3xl leading-tight font-extrabold">{meta.title}</h1>
            <p className="m-0 mt-1 text-sm text-slate-600">{meta.summary}</p>
          </div>
          <p className="m-0 font-mono text-xs text-slate-500">Cloud Architecture Diagrams · cvam.learn</p>
        </header>

        <section className="sheet-page mt-4">
          <h2 className="m-0 mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">{sheet.diagramTitle}</h2>
          <div className="overflow-hidden rounded-lg border border-slate-300">
            <DiagramSvg spec={spec} provider={provider} at={spec.steps.length} idPrefix="sheet" label={`${sheet.diagramTitle} on ${info.name}`} />
          </div>
          <p className="m-0 mt-2 text-xs text-slate-500">Numbered black circles show the request path, in order.</p>
        </section>

        <section className="sheet-page mt-6">
          <h2 className="m-0 mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Services in this diagram</h2>
          <ul className="m-0 grid list-none gap-x-6 gap-y-1 p-0 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {services.map((node) => (
              <li key={node.id} className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={node.icon} alt="" width={20} height={20} />
                <span>
                  <strong>{node.label}</strong>
                  {node.sub ? <span className="text-slate-500"> · {node.sub}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="m-0 mb-3 text-sm font-bold tracking-wider text-slate-500 uppercase">Build order</h2>
          <ol className="m-0 list-none space-y-4 p-0 sm:columns-2 sm:gap-8">
            {spec.steps.map((step, index) => (
              <li key={step.title} className="sheet-page break-inside-avoid">
                <p className="m-0 flex items-start gap-2 font-bold">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs text-white" style={{ background: info.accent }}>
                    {index + 1}
                  </span>
                  {step.title}
                </p>
                <p className="m-0 mt-1 text-sm leading-snug text-slate-700">{step.body}</p>
                <ul className="m-0 mt-1 list-disc pl-5 text-[0.82rem] leading-snug text-slate-600">
                  {step.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <section className="sheet-page mt-6 rounded-lg border border-slate-300 bg-slate-50 p-4">
          <h2 className="m-0 mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Key takeaways</h2>
          <ul className="m-0 list-none space-y-1 p-0 text-sm">
            {sheet.takeaways.map((takeaway) => (
              <li key={takeaway} className="flex gap-2">
                <span aria-hidden="true" style={{ color: info.accent }}>✓</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="sheet-page mt-6">
          <h2 className="m-0 mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Check yourself</h2>
          <ol className="m-0 list-decimal space-y-1 pl-5 text-sm">
            {lesson.quiz.map((question) => (
              <li key={question.q}>{question.q}</li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
