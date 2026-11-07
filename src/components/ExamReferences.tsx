import { LinkCard } from "@/components/ResourceCards";
import type { Reference } from "@/lib/types";

/** Collapsed-by-default reference list, styled like the References card on the learning-path pages. */
export function ExamReferences({ items }: { items: Reference[] }) {
  if (items.length === 0) return null;
  return (
    <details className="group mt-3 rounded-xl border border-line bg-panel">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5">
        <span className="font-display text-sm font-bold">References</span>
        <span className="font-mono text-xs text-faint">
          {items.length} {items.length === 1 ? "link" : "links"}
          <span aria-hidden="true" className="ml-2 inline-block group-open:rotate-45">
            +
          </span>
        </span>
      </summary>
      <div className="border-t border-line p-4">
        <h3 className="mb-3 font-mono text-xs tracking-wider text-faint uppercase">Read and explore · {items.length}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <LinkCard key={item.url} item={item} />
          ))}
        </div>
      </div>
    </details>
  );
}
