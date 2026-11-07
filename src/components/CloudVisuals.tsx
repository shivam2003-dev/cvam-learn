import Image from "next/image";
import Link from "next/link";
import gcpAssets from "@/content/courseware/gcp-pca/visuals/assets.json";
import awsAssets from "@/content/courseware/aws-ans-c01/visuals/assets.json";
import gcpNotes from "@/content/courseware/gcp-pca/visuals/diagram-notes.json";
import awsNotes from "@/content/courseware/aws-ans-c01/visuals/diagram-notes.json";
import { gcpPca } from "@/content/courseware/gcp-pca/curriculum";
import { ansC01 } from "@/content/courseware/aws-ans-c01/curriculum";

type CloudCourse = "gcp-pca" | "aws-ans-c01";
type Dimensions = Record<string, { width: number; height: number }>;
type Notes = Record<string, { lesson: string; section: string; caption: string; notes: string[] }>;
const courses = { "gcp-pca": gcpPca, "aws-ans-c01": ansC01 };
const assets: Record<CloudCourse, Dimensions> = { "gcp-pca": gcpAssets, "aws-ans-c01": awsAssets };
const notes: Record<CloudCourse, Notes> = { "gcp-pca": gcpNotes, "aws-ans-c01": awsNotes };

export function hasCloudVisuals(course: string): course is CloudCourse {
  return course === "gcp-pca" || course === "aws-ans-c01";
}

function VisualImage({ course, id, alt, caption }: { course: CloudCourse; id: string; alt: string; caption: string }) {
  const size = assets[course][id];
  if (!size) throw new Error(`Missing course diagram: ${course}/${id}`);
  const src = `/images/courseware/${course}/${id}.webp`;
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-white">
      <a href={src} target="_blank" rel="noopener noreferrer" className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime" aria-label={`Open full-size diagram: ${caption}`}>
        <Image src={src} alt={alt} width={size.width} height={size.height} sizes="(max-width: 768px) 100vw, 768px" className="h-auto w-full" />
      </a>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-panel px-4 py-3 text-sm leading-relaxed text-soft">
        <span>{caption}</span><a href={src} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky underline underline-offset-4">Open full size ↗</a>
      </figcaption>
    </figure>
  );
}

export function CloudDiagram({ course, id }: { course: CloudCourse; id: string }) {
  const data = notes[course][id];
  if (!data) throw new Error(`Missing diagram notes: ${course}/${id}`);
  return (
    <div id={id} data-course-diagram={id} className="scroll-mt-20 space-y-3">
      <VisualImage course={course} id={id} alt={`${data.section}. ${data.caption} Detailed text notes follow.`} caption={data.caption} />
      <details className="rounded-xl border border-line bg-panel p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky">Read the diagram notes</summary>
        <ul className="mt-3 space-y-2 text-sm text-soft">{data.notes.map((note, i) => <li key={i}>{note}</li>)}</ul>
      </details>
    </div>
  );
}

export function CloudChapterVisual({ course, chapterId }: { course: CloudCourse; chapterId: string }) {
  const index = courses[course].modules.findIndex(chapter => chapter.id === chapterId);
  const chapter = courses[course].modules[index];
  if (!chapter) return null;
  return (
    <section id={`recap-${chapter.id}`} data-chapter-recap={chapter.id} className="mt-12 scroll-mt-24">
      <p className="text-sm font-semibold text-lime">Chapter {index + 1} · visual recap</p>
      <h2 className="mt-2 mb-4 font-display text-2xl font-bold">{chapter.title}</h2>
      <VisualImage course={course} id={`${chapter.id}-summary`} alt={`Chapter ${index + 1} recap: ${chapter.lessons.map(l => l.title).join('; ')}. Text summary follows.`} caption={`Chapter ${index + 1} · ${chapter.title}`} />
      <details className="mt-4 rounded-xl border border-line bg-panel p-4">
        <summary className="cursor-pointer font-semibold text-sky">Read the chapter summary</summary>
        <ul className="mt-3 space-y-3 text-sm text-soft">
          {chapter.lessons.map(lesson => <li key={lesson.slug}><Link href={`/courseware/${course}/${lesson.slug}`} className="font-semibold text-text underline decoration-line underline-offset-4">{lesson.title}</Link><p className="mt-1">{lesson.summary}</p></li>)}
        </ul>
      </details>
    </section>
  );
}
