export default function ExamLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12" aria-busy="true">
      <p role="status" className="font-mono text-sm text-lime">Loading your exam workspace…</p>
      <div className="mt-5 h-40 animate-pulse rounded-2xl border border-line bg-panel" />
    </main>
  );
}
