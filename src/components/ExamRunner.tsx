"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Exam, ExamQuestion } from "@/lib/exams";
import {
  addAttempt,
  clearHistory,
  isCorrect,
  optionOrder,
  saveActive,
  scoreAttempt,
  shuffled,
  useExamStore,
  type Active,
  type Attempt,
  type Mode,
} from "@/lib/examStore";

const LETTERS = "ABCDEFGH";

type View =
  | { name: "home" }
  | { name: "run" }
  | { name: "result"; id: string }
  | { name: "review"; id: string };

export function fmt(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`
    : `${m}:${String(r).padStart(2, "0")}`;
}

export function ExamRunner({
  exam,
  lessonTitles,
}: {
  exam: Exam;
  lessonTitles: Record<string, string>;
}) {
  const store = useExamStore();
  const [view, setView] = useState<View>({ name: "home" });
  const active = store.active[exam.slug];
  const history = useMemo(() => store.attempts.filter((a) => a.exam === exam.slug), [store.attempts, exam.slug]);
  const byId = useMemo(() => new Map(exam.questions.map((q) => [q.id, q])), [exam.questions]);

  function start(mode: Mode, count: number, sections: number[]) {
    const pool = exam.questions.filter((q) => sections.includes(q.section));
    const seed = Math.floor(Math.random() * 2 ** 31);
    const picked = shuffled(pool, seed).slice(0, Math.min(count, pool.length));
    const run: Active = {
      id: `${Date.now()}`,
      mode,
      seed,
      qids: picked.map((q) => q.id),
      index: 0,
      answers: {},
      flagged: [],
      checked: [],
      spent: {},
      startedAt: Date.now(),
      limitSec: mode === "exam" ? picked.length * exam.minutesPerQuestion * 60 : null,
    };
    saveActive(exam.slug, run);
    setView({ name: "run" });
  }

  function finish(run: Active, spent: Record<string, number>) {
    const attempt: Attempt = {
      id: run.id,
      exam: exam.slug,
      mode: run.mode,
      seed: run.seed,
      qids: run.qids,
      answers: run.answers,
      flagged: run.flagged,
      spent,
      startedAt: run.startedAt,
      finishedAt: Date.now(),
      limitSec: run.limitSec,
    };
    addAttempt(attempt);
    saveActive(exam.slug, null);
    setView({ name: "result", id: attempt.id });
  }

  if (view.name === "run" && active) {
    return <Run key={active.id} exam={exam} byId={byId} active={active} onFinish={finish} onExit={() => setView({ name: "home" })} />;
  }
  if (view.name === "result" || view.name === "review") {
    const attempt = history.find((a) => a.id === view.id);
    if (attempt) {
      return view.name === "result" ? (
        <Results
          exam={exam}
          attempt={attempt}
          history={history}
          lessonTitles={lessonTitles}
          onReview={() => setView({ name: "review", id: attempt.id })}
          onHome={() => setView({ name: "home" })}
        />
      ) : (
        <Review exam={exam} byId={byId} attempt={attempt} onBack={() => setView({ name: "result", id: attempt.id })} />
      );
    }
  }

  return (
    <Home
      exam={exam}
      active={active}
      history={history}
      onStart={start}
      onResume={() => setView({ name: "run" })}
      onOpen={(id) => setView({ name: "result", id })}
    />
  );
}

/* ------------------------------------------------------------------ Home */

function Home({
  exam,
  active,
  history,
  onStart,
  onResume,
  onOpen,
}: {
  exam: Exam;
  active: Active | undefined;
  history: Attempt[];
  onStart: (mode: Mode, count: number, sections: number[]) => void;
  onResume: () => void;
  onOpen: (id: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("exam");
  const [count, setCount] = useState(Math.min(40, exam.questions.length));
  const [sections, setSections] = useState<number[]>(exam.sections.map((s) => s.id));
  const pool = exam.questions.filter((q) => sections.includes(q.section)).length;
  const effective = Math.min(count, pool);
  const counts = [20, 40, exam.questions.length].filter((n, i, arr) => arr.indexOf(n) === i && n <= exam.questions.length);

  function toggleSection(id: number) {
    setSections((current) => (current.includes(id) ? current.filter((s) => s !== id) : [...current, id]));
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        {active && (
          <div className="rounded-2xl border border-amber/50 bg-amber/10 p-5">
            <p className="font-mono text-xs tracking-wider text-amber uppercase">Attempt in progress</p>
            <p className="mt-2 text-soft">
              {active.qids.length} questions · {active.mode === "exam" ? "exam mode" : "practice mode"} ·{" "}
              {Object.values(active.answers).filter((a) => a.length > 0).length} answered
            </p>
            <button type="button" onClick={onResume} className="mt-3 rounded-lg bg-amber px-4 py-2 font-semibold text-ink">
              Resume attempt
            </button>
          </div>
        )}

        <section className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="font-display text-xl font-bold">Start a new attempt</h2>

          <fieldset className="mt-4">
            <legend className="font-mono text-xs tracking-wider text-faint uppercase">Mode</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["exam", "Exam simulation", `Timed (${exam.minutesPerQuestion} min per question). No feedback until you submit. Flag and review.`],
                  ["practice", "Practice", "Untimed. Check each answer and read the explanation straight away."],
                ] as const
              ).map(([id, title, text]) => (
                <label
                  key={id}
                  className={`cursor-pointer rounded-xl border p-3 ${mode === id ? "border-lime bg-lime/10" : "border-line bg-raised"}`}
                >
                  <input type="radio" name="mode" className="sr-only" checked={mode === id} onChange={() => setMode(id)} />
                  <span className="font-semibold">{title}</span>
                  <span className="mt-1 block text-sm text-soft">{text}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="font-mono text-xs tracking-wider text-faint uppercase">Questions</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {counts.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={`rounded-lg border px-3 py-1.5 font-mono text-sm ${count === n ? "border-lime bg-lime/10 text-lime" : "border-line text-soft hover:text-text"}`}
                >
                  {n === exam.questions.length ? `All ${n}` : n}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="font-mono text-xs tracking-wider text-faint uppercase">Sections (focus on weak areas)</legend>
            <div className="mt-2 grid gap-1.5">
              {exam.sections.map((section) => (
                <label key={section.id} className="flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={sections.includes(section.id)}
                    onChange={() => toggleSection(section.id)}
                    className="mt-1 accent-[#c6f24e]"
                  />
                  <span>
                    <span className="text-text">
                      {section.id}. {section.name}
                    </span>{" "}
                    <span className="font-mono text-xs text-faint">
                      ~{section.weight}% · {exam.questions.filter((q) => q.section === section.id).length} q
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={effective === 0}
              onClick={() => onStart(mode, count, sections)}
              className="rounded-lg bg-lime px-5 py-2.5 font-semibold text-ink disabled:opacity-40"
            >
              Start {effective} question{effective === 1 ? "" : "s"}
            </button>
            {mode === "exam" && effective > 0 && (
              <span className="font-mono text-xs text-faint">Time limit {effective * exam.minutesPerQuestion} min</span>
            )}
          </div>
          <p className="mt-3 text-xs text-faint">Starting a new attempt replaces any attempt in progress.</p>
        </section>

        <section className="rounded-2xl border border-line bg-panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Your history</h2>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Delete all attempts for this exam from this browser?")) clearHistory(exam.slug);
                }}
                className="font-mono text-xs text-faint hover:text-rose"
              >
                clear
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="mt-3 text-soft">No attempts yet. Your scores and reviews are saved in this browser.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {history.slice(0, 10).map((attempt) => {
                const result = scoreAttempt(exam, attempt);
                return (
                  <li key={attempt.id} className="flex flex-wrap items-center gap-3 py-2.5">
                    <span className={`w-14 font-mono text-lg font-bold ${result.percent >= exam.target ? "text-lime" : "text-amber"}`}>
                      {result.percent}%
                    </span>
                    <span className="flex-1 text-sm text-soft">
                      {new Date(attempt.finishedAt).toLocaleString()} · {attempt.mode === "exam" ? "exam" : "practice"} ·{" "}
                      {result.correct}/{result.total} · {fmt(result.durationSec)}
                    </span>
                    <button type="button" onClick={() => onOpen(attempt.id)} className="font-mono text-xs text-lime hover:underline">
                      report →
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-line bg-panel p-5">
          <h3 className="font-mono text-xs tracking-wider text-faint uppercase">About this exam</h3>
          <ul className="mt-3 space-y-2 text-sm text-soft">
            {exam.officialFormat.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden="true" className="text-lime">→</span>
                {line}
              </li>
            ))}
          </ul>
        </div>
        <Link
          href={`/exams/${exam.slug}/cheatsheet`}
          className="block rounded-2xl border border-line bg-panel p-5 hover:border-lime"
        >
          <span className="font-display text-lg font-bold">Cheat sheet →</span>
          <span className="mt-1 block text-sm text-soft">One-page review of services, limits and decision rules. Printable.</span>
        </Link>
        <Link
          href={`/courseware/${exam.courseSlug}`}
          className="block rounded-2xl border border-line bg-panel p-5 hover:border-lime"
        >
          <span className="font-display text-lg font-bold">Study the course →</span>
          <span className="mt-1 block text-sm text-soft">Full lessons, diagrams and quizzes for every section.</span>
        </Link>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------- Run */

function Run({
  exam,
  byId,
  active,
  onFinish,
  onExit,
}: {
  exam: Exam;
  byId: Map<string, ExamQuestion>;
  active: Active;
  onFinish: (run: Active, spent: Record<string, number>) => void;
  onExit: () => void;
}) {
  const spentRef = useRef<Record<string, number>>({ ...active.spent });
  const activeRef = useRef(active);
  const [now, setNow] = useState(() => Date.now());
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const exam_mode = active.mode === "exam";
  const qid = active.qids[active.index];
  const question = byId.get(qid)!;
  const order = useMemo(() => optionOrder(question, active.seed), [question, active.seed]);
  const picked = active.answers[qid] ?? [];
  const checked = active.checked.includes(qid);
  const flagged = active.flagged.includes(qid);
  const need = question.answer.length;
  const remaining = active.limitSec === null ? null : active.limitSec - Math.floor((now - active.startedAt) / 1000);

  function update(patch: Partial<Active>) {
    saveActive(exam.slug, { ...activeRef.current, ...patch, spent: { ...spentRef.current } });
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = activeRef.current;
      const id = current.qids[current.index];
      spentRef.current[id] = (spentRef.current[id] ?? 0) + 1;
      setNow(Date.now());
      if (current.limitSec !== null && Date.now() - current.startedAt >= current.limitSec * 1000) {
        window.clearInterval(timer);
        onFinish(current, { ...spentRef.current });
      }
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(optionIndex: number) {
    if (checked) return;
    const next = question.multi
      ? picked.includes(optionIndex)
        ? picked.filter((i) => i !== optionIndex)
        : [...picked, optionIndex]
      : [optionIndex];
    update({ answers: { ...active.answers, [qid]: next } });
  }

  function go(index: number) {
    if (index < 0 || index >= active.qids.length) return;
    update({ index });
  }

  function toggleFlag() {
    update({ flagged: flagged ? active.flagged.filter((id) => id !== qid) : [...active.flagged, qid] });
  }

  function check() {
    if (picked.length === 0 || checked) return;
    update({ checked: [...active.checked, qid] });
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      const current = activeRef.current;
      if (event.key === "ArrowRight") update({ index: Math.min(current.index + 1, current.qids.length - 1) });
      else if (event.key === "ArrowLeft") update({ index: Math.max(current.index - 1, 0) });
      else if (event.key.toLowerCase() === "f") toggleFlagKey();
      else if (/^[1-8]$/.test(event.key)) toggleKey(Number(event.key) - 1);
    }
    function toggleFlagKey() {
      const current = activeRef.current;
      const id = current.qids[current.index];
      update({ flagged: current.flagged.includes(id) ? current.flagged.filter((x) => x !== id) : [...current.flagged, id] });
    }
    function toggleKey(position: number) {
      const current = activeRef.current;
      const id = current.qids[current.index];
      const q = byId.get(id)!;
      if (current.checked.includes(id)) return;
      const optionIndex = optionOrder(q, current.seed)[position];
      if (optionIndex === undefined) return;
      const cur = current.answers[id] ?? [];
      const next = q.multi ? (cur.includes(optionIndex) ? cur.filter((i) => i !== optionIndex) : [...cur, optionIndex]) : [optionIndex];
      update({ answers: { ...current.answers, [id]: next } });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answeredCount = active.qids.filter((id) => (active.answers[id] ?? []).length > 0).length;
  const unanswered = active.qids.length - answeredCount;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-panel px-4 py-2.5">
        <span className="font-mono text-sm text-soft">
          Question {active.index + 1} / {active.qids.length}
        </span>
        <span className="font-mono text-xs text-faint">
          Section {question.section} · {question.topic}
        </span>
        <span className="ml-auto flex items-center gap-3">
          {remaining !== null && (
            <span className={`font-mono text-lg font-bold ${remaining < 300 ? "text-rose" : "text-lime"}`}>{fmt(remaining)}</span>
          )}
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-lg bg-lime px-4 py-1.5 text-sm font-semibold text-ink"
          >
            Submit
          </button>
          <button type="button" onClick={onExit} className="font-mono text-xs text-faint hover:text-text">
            save & exit
          </button>
        </span>
      </div>

      {confirming && (
        <div role="alertdialog" aria-label="Submit attempt" className="mb-4 rounded-xl border border-amber/50 bg-amber/10 p-4">
          <p className="font-semibold">Submit this attempt?</p>
          <p className="mt-1 text-sm text-soft">
            {answeredCount} answered, {unanswered} unanswered, {active.flagged.length} flagged. Unanswered questions score zero.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onFinish(activeRef.current, { ...spentRef.current })}
              className="rounded-lg bg-lime px-4 py-1.5 text-sm font-semibold text-ink"
            >
              Yes, submit
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="rounded-lg border border-line px-4 py-1.5 text-sm">
              Keep working
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
        <section className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
          <p className="text-[1.05rem] leading-relaxed">{question.stem}</p>
          <p className="mt-2 font-mono text-xs text-faint">
            {question.multi ? `Select ${need} answers.` : "Select one answer."}
          </p>

          <ul className="mt-4 space-y-2">
            {order.map((optionIndex, position) => {
              const isPicked = picked.includes(optionIndex);
              const isAnswer = question.answer.includes(optionIndex);
              let style = isPicked ? "border-sky bg-sky/10" : "border-line bg-raised hover:border-faint";
              if (checked) {
                if (isAnswer) style = "border-lime bg-lime/10";
                else if (isPicked) style = "border-rose bg-rose/10";
                else style = "border-line bg-raised opacity-70";
              }
              return (
                <li key={optionIndex}>
                  <button
                    type="button"
                    onClick={() => toggle(optionIndex)}
                    aria-pressed={isPicked}
                    className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left ${style}`}
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full border border-current font-mono text-xs">
                      {question.multi ? (isPicked ? "✓" : LETTERS[position]) : LETTERS[position]}
                    </span>
                    <span className="leading-relaxed">{question.options[optionIndex]}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {!exam_mode && (
            <div className="mt-4">
              {!checked ? (
                <button
                  type="button"
                  onClick={check}
                  disabled={picked.length === 0}
                  className="rounded-lg bg-lime px-4 py-2 font-semibold text-ink disabled:opacity-40"
                >
                  Check answer
                </button>
              ) : (
                <div
                  className={`rounded-xl border p-4 ${isCorrect(question, picked) ? "border-lime/50 bg-lime/10" : "border-rose/50 bg-rose/10"}`}
                >
                  <p className={`font-semibold ${isCorrect(question, picked) ? "text-lime" : "text-rose"}`}>
                    {isCorrect(question, picked) ? "Correct" : "Not quite"}
                  </p>
                  <p className="mt-1 leading-relaxed text-soft">{question.explain}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => go(active.index - 1)}
              disabled={active.index === 0}
              className="rounded-lg border border-line px-3 py-1.5 text-sm disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={() => go(active.index + 1)}
              disabled={active.index === active.qids.length - 1}
              className="rounded-lg border border-line px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Next →
            </button>
            <button
              type="button"
              onClick={toggleFlag}
              aria-pressed={flagged}
              className={`ml-auto rounded-lg border px-3 py-1.5 text-sm ${flagged ? "border-amber bg-amber/10 text-amber" : "border-line text-soft"}`}
            >
              {flagged ? "⚑ Flagged" : "⚐ Flag for review"}
            </button>
          </div>
          <p className="mt-3 font-mono text-[11px] text-faint">Keys: 1–5 choose · ← → navigate · F flag</p>
        </section>

        <aside className="rounded-2xl border border-line bg-panel p-4">
          <h3 className="font-mono text-xs tracking-wider text-faint uppercase">Question palette</h3>
          <div className="mt-3 grid grid-cols-6 gap-1.5 lg:grid-cols-5">
            {active.qids.map((id, i) => {
              const has = (active.answers[id] ?? []).length > 0;
              const isCurrent = i === active.index;
              const isFlagged = active.flagged.includes(id);
              let style = "border-line bg-raised text-soft";
              if (has) style = "border-sky bg-sky/20 text-text";
              if (!exam_mode && active.checked.includes(id)) {
                const q = byId.get(id)!;
                style = isCorrect(q, active.answers[id]) ? "border-lime bg-lime/20 text-lime" : "border-rose bg-rose/20 text-rose";
              }
              if (isCurrent) style = "border-lime bg-lime text-ink";
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Question ${i + 1}${has ? ", answered" : ""}${isFlagged ? ", flagged" : ""}`}
                  className={`relative aspect-square rounded-md border font-mono text-xs ${style}`}
                >
                  {i + 1}
                  {isFlagged && <span className="absolute -top-1 -right-1 size-2 rounded-full bg-amber" />}
                </button>
              );
            })}
          </div>
          <dl className="mt-4 space-y-1 font-mono text-xs text-faint">
            <div className="flex justify-between"><dt>Answered</dt><dd className="text-text">{answeredCount}</dd></div>
            <div className="flex justify-between"><dt>Unanswered</dt><dd className="text-text">{unanswered}</dd></div>
            <div className="flex justify-between"><dt>Flagged</dt><dd className="text-amber">{active.flagged.length}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Results */

function verdict(percent: number, target: number) {
  if (percent >= 85) return { label: "Strong", tone: "text-lime", note: "You are consistently above the target. Keep timing yourself and review the case studies." };
  if (percent >= target) return { label: "Ready", tone: "text-lime", note: "You are at or above the practice target. Close the remaining weak topics and repeat a full timed run." };
  if (percent >= target - 10) return { label: "Almost there", tone: "text-amber", note: "You are close. Focus on the sections below target and re-test them." };
  return { label: "Keep studying", tone: "text-rose", note: "Revisit the lessons for your weakest sections, then try practice mode before another timed run." };
}

function Results({
  exam,
  attempt,
  history,
  lessonTitles,
  onReview,
  onHome,
}: {
  exam: Exam;
  attempt: Attempt;
  history: Attempt[];
  lessonTitles: Record<string, string>;
  onReview: () => void;
  onHome: () => void;
}) {
  const result = scoreAttempt(exam, attempt);
  const v = verdict(result.percent, exam.target);
  const unanswered = result.total - result.answered;
  const avg = result.total ? Math.round(result.durationSec / result.total) : 0;
  const weakSections = result.bySection
    .filter((s) => Math.round((s.correct / s.total) * 100) < exam.target)
    .sort((a, b) => a.correct / a.total - b.correct / b.total);
  const weakTopics = result.byTopic
    .filter((t) => t.correct < t.total)
    .sort((a, b) => a.correct / a.total - b.correct / b.total)
    .slice(0, 8);
  const trend = history.slice(0, 8).reverse().map((a) => ({ id: a.id, percent: scoreAttempt(exam, a).percent }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-start gap-6 rounded-2xl border border-line bg-panel p-6">
        <div className="grid size-32 shrink-0 place-items-center rounded-full border-8 border-line" style={{ borderColor: result.percent >= exam.target ? "#c6f24e" : "#ffc25c" }}>
          <div className="text-center">
            <div className="font-display text-4xl font-extrabold">{result.percent}%</div>
            <div className="font-mono text-xs text-faint">
              {result.correct}/{result.total}
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs tracking-wider text-faint uppercase">
            {attempt.mode === "exam" ? "Exam simulation" : "Practice"} · {new Date(attempt.finishedAt).toLocaleString()}
          </p>
          <h2 className={`mt-1 font-display text-3xl font-extrabold ${v.tone}`}>{v.label}</h2>
          <p className="mt-2 text-soft">{v.note}</p>
          <p className="mt-2 text-xs text-faint">Practice target {exam.target}%. This is not an official pass mark; Google does not publish one.</p>
          <div className="mt-4 flex flex-wrap gap-2 print:hidden">
            <button type="button" onClick={onReview} className="rounded-lg bg-lime px-4 py-2 font-semibold text-ink">
              Review answers
            </button>
            <button type="button" onClick={onHome} className="rounded-lg border border-line px-4 py-2">
              New attempt
            </button>
            <button type="button" onClick={() => window.print()} className="rounded-lg border border-line px-4 py-2">
              Print report
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {[
          ["Correct", `${result.correct}`],
          ["Unanswered", `${unanswered}`],
          ["Time used", fmt(result.durationSec)],
          ["Avg per question", `${avg}s`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line bg-panel p-4">
            <div className="font-mono text-xs text-faint">{label}</div>
            <div className="mt-1 font-display text-2xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-panel p-6">
        <h3 className="font-display text-xl font-bold">Performance by section</h3>
        <div className="mt-4 space-y-4">
          {result.bySection.map((s) => {
            const info = exam.sections.find((x) => x.id === s.section)!;
            const pct = Math.round((s.correct / s.total) * 100);
            return (
              <div key={s.section}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span>
                    {s.section}. {info.name} <span className="font-mono text-xs text-faint">(~{info.weight}% of exam)</span>
                  </span>
                  <span className="font-mono">
                    {s.correct}/{s.total} · <span className={pct >= exam.target ? "text-lime" : "text-amber"}>{pct}%</span>
                  </span>
                </div>
                <div className="relative mt-1.5 h-3 overflow-hidden rounded-full bg-raised" role="img" aria-label={`${pct} percent`}>
                  <div className={`h-full ${pct >= exam.target ? "bg-lime" : "bg-amber"}`} style={{ width: `${pct}%` }} />
                  <div className="absolute inset-y-0 w-px bg-text/60" style={{ left: `${exam.target}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 font-mono text-xs text-faint">White tick marks the {exam.target}% target.</p>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-line bg-panel p-6">
          <h3 className="font-display text-xl font-bold">Topics to revisit</h3>
          {weakTopics.length === 0 ? (
            <p className="mt-3 text-soft">No missed topics in this attempt.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {weakTopics.map((t) => (
                <li key={t.topic} className="flex items-center justify-between gap-3 text-sm">
                  <span>
                    {t.topic} <span className="font-mono text-xs text-faint">S{t.section}</span>
                  </span>
                  <span className="font-mono text-xs text-rose">
                    {t.correct}/{t.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-panel p-6">
          <h3 className="font-display text-xl font-bold">Recommended lessons</h3>
          {weakSections.length === 0 ? (
            <p className="mt-3 text-soft">Every section is at or above target. Repeat a full timed run to confirm.</p>
          ) : (
            <ul className="mt-3 space-y-3 text-sm">
              {weakSections.map((s) => {
                const info = exam.sections.find((x) => x.id === s.section)!;
                return (
                  <li key={s.section}>
                    <p className="font-semibold">Section {s.section}</p>
                    <ul className="mt-1 space-y-1">
                      {info.lessons.slice(0, 4).map((slug) => (
                        <li key={slug}>
                          <Link href={`/courseware/${exam.courseSlug}/${slug}`} className="text-lime hover:underline">
                            {lessonTitles[slug] ?? slug}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
          <Link href={`/exams/${exam.slug}/cheatsheet`} className="mt-4 inline-block text-sm text-sky hover:underline print:hidden">
            Open the cheat sheet →
          </Link>
        </section>
      </div>

      {trend.length > 1 && (
        <section className="mt-6 rounded-2xl border border-line bg-panel p-6">
          <h3 className="font-display text-xl font-bold">Score trend</h3>
          <div className="mt-4 flex h-32 items-end gap-2" role="img" aria-label="Score trend over recent attempts">
            {trend.map((point) => (
              <div key={point.id} className="flex flex-1 flex-col items-center gap-1">
                <span className="font-mono text-xs text-soft">{point.percent}</span>
                <div
                  className={`w-full rounded-t ${point.id === attempt.id ? "bg-lime" : "bg-sky/60"}`}
                  style={{ height: `${Math.max(4, point.percent)}%` }}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Review */

function Review({
  exam,
  byId,
  attempt,
  onBack,
}: {
  exam: Exam;
  byId: Map<string, ExamQuestion>;
  attempt: Attempt;
  onBack: () => void;
}) {
  type Filter = "all" | "incorrect" | "unanswered" | "flagged";
  const [filter, setFilter] = useState<Filter>("incorrect");
  const items = attempt.qids.map((id, index) => ({ id, index, question: byId.get(id)! })).filter((x) => x.question);

  const status = (id: string, question: ExamQuestion) => {
    const picked = attempt.answers[id];
    if (!picked || picked.length === 0) return "unanswered" as const;
    return isCorrect(question, picked) ? ("correct" as const) : ("incorrect" as const);
  };

  const shown = items.filter(({ id, question }) => {
    if (filter === "all") return true;
    if (filter === "flagged") return attempt.flagged.includes(id);
    const s = status(id, question);
    return filter === "incorrect" ? s === "incorrect" : s === "unanswered";
  });

  const counts = {
    all: items.length,
    incorrect: items.filter((x) => status(x.id, x.question) === "incorrect").length,
    unanswered: items.filter((x) => status(x.id, x.question) === "unanswered").length,
    flagged: attempt.flagged.length,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onBack} className="font-mono text-sm text-lime">
          ← Report
        </button>
        <h2 className="font-display text-2xl font-bold">Answer review</h2>
        <button type="button" onClick={() => window.print()} className="ml-auto rounded-lg border border-line px-3 py-1.5 text-sm print:hidden">
          Print
        </button>
      </div>

      <div role="tablist" className="mt-4 flex flex-wrap gap-2 print:hidden">
        {(["incorrect", "unanswered", "flagged", "all"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${filter === f ? "border-lime bg-lime/10 text-lime" : "border-line text-soft"}`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      <ol className="mt-5 space-y-5">
        {shown.length === 0 && <li className="text-soft">Nothing in this filter.</li>}
        {shown.map(({ id, index, question }) => {
          const picked = attempt.answers[id] ?? [];
          const s = status(id, question);
          const order = optionOrder(question, attempt.seed);
          return (
            <li key={id} className="rounded-2xl border border-line bg-panel p-5">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="text-faint">Q{index + 1}</span>
                <span className="text-faint">· S{question.section} · {question.topic}</span>
                <span className={s === "correct" ? "text-lime" : s === "incorrect" ? "text-rose" : "text-amber"}>
                  · {s}
                </span>
                {attempt.flagged.includes(id) && <span className="text-amber">· flagged</span>}
                {attempt.spent[id] !== undefined && <span className="ml-auto text-faint">{attempt.spent[id]}s</span>}
              </div>
              <p className="mt-2 leading-relaxed">{question.stem}</p>
              <ul className="mt-3 space-y-1.5">
                {order.map((optionIndex, position) => {
                  const isPicked = picked.includes(optionIndex);
                  const isAnswer = question.answer.includes(optionIndex);
                  let style = "border-line bg-raised";
                  if (isAnswer) style = "border-lime bg-lime/10";
                  else if (isPicked) style = "border-rose bg-rose/10";
                  return (
                    <li key={optionIndex} className={`flex gap-3 rounded-lg border px-3 py-2 text-sm ${style}`}>
                      <span className="font-mono">{LETTERS[position]}</span>
                      <span className="flex-1">{question.options[optionIndex]}</span>
                      <span className="font-mono text-xs">
                        {isAnswer ? "✓ correct" : ""}
                        {isPicked ? (isAnswer ? " · your pick" : "✗ your pick") : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 rounded-lg bg-raised p-3 text-sm leading-relaxed text-soft">
                <span className="font-semibold text-text">Why: </span>
                {question.explain}
              </p>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 text-xs text-faint">{exam.officialFormat[exam.officialFormat.length - 1]}</p>
    </div>
  );
}
