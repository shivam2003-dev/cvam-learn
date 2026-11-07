import Image from "next/image";
import Link from "next/link";
import assets from "@/content/courseware/fde/visuals/assets.json";
import diagramNotes from "@/content/courseware/fde/visuals/diagram-notes.json";
import panelBoxes from "@/content/courseware/fde/visuals/panels.json";
import { fde } from "@/content/courseware/fde/curriculum";

type Box = { x: number; y: number; w: number; h: number };
const panels = panelBoxes as Record<string, Box[]>;

/** One numbered panel of a lesson's study sheet, shown where the original diagram used to sit. */
function PanelImage({ lesson, panel, alt }: { lesson: string; panel: number; alt: string }) {
  const box = panels[lesson]?.[panel - 1];
  const size = (assets as Record<string, { width: number; height: number }>)[lesson] ?? { width: 1536, height: 1024 };
  if (!box) return null;
  const src = `/images/courseware/fde/${lesson}.webp`;
  const ratio = (box.w * size.width) / (box.h * size.height);
  const scale = 100 / box.w;
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-[#fffdf6]">
      <a href={src} target="_blank" rel="noopener noreferrer" aria-label={`Open the full study sheet for diagram ${panel}`} className="relative block w-full overflow-hidden" style={{ aspectRatio: ratio }}>
        <Image
          src={src}
          alt={alt}
          width={size.width}
          height={size.height}
          sizes={`(max-width: 768px) ${Math.round(scale)}vw, ${Math.round(768 * (scale / 100))}px`}
          className="absolute h-auto max-w-none"
          style={{ width: `${scale}%`, left: `${(-box.x / box.w) * 100}%`, top: `${(-box.y / box.h) * 100}%` }}
        />
      </a>
    </figure>
  );
}

const notebooks: Record<string, { title: string; panels: { section: string; caption: string; notes: string[] }[] }> = diagramNotes;

function StudyImage({ id, alt, caption }: { id: string; alt: string; caption: string }) {
  const dimensions = (assets as Record<string, { width: number; height: number }>)[id] ?? { width: 1536, height: 1024 };
  const src = `/images/courseware/fde/${id}.webp`;
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-[#fffdf6]">
      <a href={src} target="_blank" rel="noopener noreferrer" className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime" aria-label={`Open full-size diagram: ${caption}`}>
        <Image src={src} alt={alt} width={dimensions.width} height={dimensions.height} sizes="(max-width: 768px) 100vw, 768px" className="h-auto w-full" />
      </a>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-[#d8d6ca] bg-[#f5f1e5] px-4 py-3 text-sm text-[#26364a]">
        <span>{caption}</span>
        <a href={src} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">Open full size ↗</a>
      </figcaption>
    </figure>
  );
}

export function LessonVisual({ slug }: { slug: string }) {
  const notebook = notebooks[slug];
  if (!notebook) return null;
  return (
    <section id="visual-guide" className="mt-10 scroll-mt-20">
      <h2 className="font-display text-2xl font-bold">The lesson, drawn out</h2>
      <p className="mt-2 mb-4 text-soft">Follow the numbered panels as you read. Open the sheet at full size to explore the details.</p>
      <StudyImage id={slug} alt={`Handwritten diagrams for ${notebook.title}. ${notebook.panels.map((p, i) => `Panel ${i + 1}: ${p.section}.`).join(" ")} Detailed text notes accompany each diagram in the lesson below.`} caption={`${notebook.title} · visual study sheet`} />
      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {notebook.panels.map((panel, i) => (
          <li key={i}>
            <a href={`#diagram-${i + 1}`} className="flex gap-2 rounded-lg border border-line px-3 py-2 text-sm text-soft hover:border-lime/50 hover:text-text">
              <span className="font-semibold text-lime">{i + 1}.</span>{panel.section}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Exact source labels remain available beside the corresponding lesson text. */
export function DiagramReference({ lesson, panel }: { lesson: string; panel: number }) {
  const data = notebooks[lesson]?.panels[panel - 1];
  if (!data) return null;
  const hasCrop = !!panels[lesson]?.[panel - 1];
  return (
    <div id={`diagram-${panel}`} className="scroll-mt-20 space-y-3">
      {hasCrop && <PanelImage lesson={lesson} panel={panel} alt={`Diagram ${panel}: ${data.section}. ${data.caption}`} />}
      <aside className="rounded-xl border border-line bg-panel p-4">
        <p className="m-0 text-sm leading-relaxed text-soft">
          <a href="#visual-guide" className="font-semibold text-lime">Diagram {panel} ↗</a> · {data.caption}
        </p>
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-semibold text-sky">Read the diagram notes</summary>
          <ol className="mt-3 space-y-2 text-sm text-soft">
            {data.notes.map((note, i) => <li key={i}>{note}</li>)}
          </ol>
        </details>
      </aside>
    </div>
  );
}

export function ChapterVisual({ chapterId }: { chapterId: string }) {
  const index = fde.modules.findIndex((m) => m.id === chapterId);
  const chapter = fde.modules[index];
  if (!chapter) return null;
  return (
    <section id={`recap-${chapterId}`} className="mt-12 scroll-mt-20">
      <p className="text-sm font-semibold text-lime">Chapter {index + 1} · visual recap</p>
      <h2 className="mt-2 mb-4 font-display text-2xl font-bold">{chapter.title}</h2>
      <StudyImage id={`${chapterId}-summary`} alt={`Handwritten chapter summary connecting ${chapter.lessons.map((l) => l.title).join("; ")}. Text summary follows.`} caption={`Chapter ${index + 1} · ${chapter.title}`} />
      <details className="mt-4 rounded-xl border border-line bg-panel p-4">
        <summary className="cursor-pointer font-semibold text-sky">Read the chapter summary</summary>
        <ul className="mt-3 space-y-3 text-sm text-soft">
          {chapter.lessons.map((lesson) => (
            <li key={lesson.slug}><Link href={`/courseware/fde/${lesson.slug}`} className="font-semibold text-text underline decoration-line underline-offset-4">{lesson.title}</Link><p className="mt-1">{lesson.summary}</p></li>
          ))}
        </ul>
      </details>
    </section>
  );
}

