import type { Reference } from "@/lib/types";

export function References({
  items,
  roadmapUrl,
}: {
  items: Reference[];
  roadmapUrl: string;
}) {
  if (items.length === 0) return null;

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
      <ul className="divide-y divide-line border-t border-line">
        {items.map((item) => (
          <li key={item.url} className="flex items-baseline gap-3 px-5 py-2.5 text-sm">
            <span className="w-16 shrink-0 font-mono text-xs text-faint capitalize">
              {item.type}
            </span>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 text-sky hover:underline"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
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
