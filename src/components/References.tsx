import { LinkCard, splitVideos, VideoCard } from "@/components/ResourceCards";
import type { Reference } from "@/lib/types";

export function References({
  items,
  roadmapUrl,
}: {
  items: Reference[];
  roadmapUrl: string;
}) {
  if (items.length === 0) return null;

  const { videos, rest: reading } = splitVideos(items);

  return (
    <details className="group mt-8 rounded-2xl border border-line bg-panel">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3.5">
        <span className="font-display font-bold">References</span>
        <span className="font-mono text-xs text-faint">
          {items.length} links
          <span aria-hidden="true" className="ml-2 inline-block group-open:rotate-45">
            +
          </span>
        </span>
      </summary>
      <div className="space-y-6 border-t border-line p-5">
        {videos.length > 0 && (
          <section>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-faint">
              Watch · {videos.length}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map(({ item, id }) => (
                <VideoCard key={item.url} item={item} id={id} />
              ))}
            </div>
          </section>
        )}
        {reading.length > 0 && (
          <section>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-faint">
              Read and explore · {reading.length}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {reading.map((item) => (
                <LinkCard key={item.url} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
      <p className="border-t border-line px-5 py-3 text-xs text-faint">
        Curated picks plus links from the{" "}
        <a href={roadmapUrl} className="underline underline-offset-2 hover:text-soft">
          roadmap.sh
        </a>{" "}
        community roadmap.
      </p>
    </details>
  );
}
