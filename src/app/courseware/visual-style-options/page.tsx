import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import options from "@/content/courseware/visual-style-options/generation-plan.json";
import assets from "@/content/courseware/visual-style-options/assets.json";

export const metadata: Metadata = {
  title: "Choose a diagram style · cvam.learn",
  description: "Four landscape diagram styles for GCP PCA and AWS Advanced Networking courseware.",
};

const courses = [
  { id: "gcp-pca", name: "GCP Professional Cloud Architect" },
  { id: "aws-ans-c01", name: "AWS Advanced Networking Specialty" },
];

export default function VisualStyleOptions() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link href="/courseware" className="text-sm text-sky hover:underline">← Courseware</Link>
      <h1 className="mt-5 font-display text-3xl font-bold sm:text-4xl">Choose your diagram style</h1>
      <p className="mt-4 max-w-3xl text-soft">Compare four styles using the same example in each course. These are previews; choose an option for each course before the full set of lesson diagrams is created.</p>
      <nav aria-label="Sample courses" className="mt-6 flex flex-wrap gap-3">
        {courses.map((course) => <a key={course.id} href={`#${course.id}`} className="rounded-lg border border-line px-4 py-2 text-sm text-sky hover:border-sky">{course.name}</a>)}
      </nav>
      {courses.map((course) => (
        <section key={course.id} id={course.id} className="mt-14 scroll-mt-24">
          <h2 className="font-display text-2xl font-bold">{course.name}</h2>
          <nav aria-label={`${course.name} styles`} className="mt-4 flex flex-wrap gap-3">
            {options.filter((option) => option.course === course.id).map((option) => <a key={option.id} href={`#${option.id}`} className="text-sm text-sky underline underline-offset-4">{option.option}. {option.title}</a>)}
          </nav>
          <div className="mt-8 space-y-12">
            {options.filter((option) => option.course === course.id).map((option) => {
              const dimensions = (assets as Record<string, { width: number; height: number }>)[option.id];
              const src = `/images/courseware/style-options/${option.id}.webp`;
              return (
                <article key={option.id} id={option.id} className="scroll-mt-24">
                  <h3 className="font-display text-xl font-bold">Option {option.option} · {option.title}</h3>
                  <p className="mt-2 mb-4 text-soft">{option.description}</p>
                  <figure className="overflow-hidden rounded-xl border border-line bg-white">
                    <a href={src} target="_blank" rel="noopener noreferrer" aria-label={`Open ${course.name} option ${option.option} at full size`}>
                      <Image src={src} alt={`${course.name}, option ${option.option}: ${option.title}. ${option.topic}.`} width={dimensions.width} height={dimensions.height} sizes="(max-width: 1152px) 100vw, 1100px" className="h-auto w-full" />
                    </a>
                    <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-panel px-4 py-3 text-sm text-soft"><span>{option.topic}</span><a href={src} target="_blank" rel="noopener noreferrer" className="text-sky underline underline-offset-4">Open full size ↗</a></figcaption>
                  </figure>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
