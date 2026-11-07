import { TopNav } from "@/components/TopNav";

/** Shown instantly while the next page renders, so a click always gives feedback. */
export default function Loading() {
  return (
    <>
      <TopNav />
      <main aria-busy="true" aria-live="polite" className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 flex items-center gap-3 font-mono text-sm text-soft">
          <span className="nav-spinner size-4 rounded-full border-2 border-lime/30 border-t-lime" aria-hidden="true" />
          Loading…
        </div>
        <div className="skeleton h-9 w-2/3 rounded-lg bg-raised" />
        <div className="skeleton mt-4 h-4 w-full max-w-xl rounded bg-raised" />
        <div className="skeleton mt-2 h-4 w-5/6 max-w-lg rounded bg-raised" />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-36 rounded-2xl border border-line bg-panel" />
          ))}
        </div>
      </main>
    </>
  );
}
