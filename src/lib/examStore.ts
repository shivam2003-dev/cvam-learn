"use client";

import { useSyncExternalStore } from "react";
import type { Exam, ExamQuestion } from "@/lib/exams";

const KEY = "cvam-learn:exams:v1";

export type Mode = "practice" | "exam";

/** An attempt that is still being taken. */
export type Active = {
  id: string;
  mode: Mode;
  seed: number;
  qids: string[];
  index: number;
  answers: Record<string, number[]>;
  flagged: string[];
  /** Questions whose answer has been checked (practice mode). */
  checked: string[];
  spent: Record<string, number>;
  startedAt: number;
  limitSec: number | null;
};

export type Attempt = {
  id: string;
  exam: string;
  mode: Mode;
  seed: number;
  qids: string[];
  answers: Record<string, number[]>;
  flagged: string[];
  spent: Record<string, number>;
  startedAt: number;
  finishedAt: number;
  limitSec: number | null;
};

type Store = {
  attempts: Attempt[];
  active: Record<string, Active>;
};

const EMPTY: Store = { attempts: [], active: {} };
let cache: Store | null = null;
const listeners = new Set<() => void>();

function read(): Store {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache as Store;
}

function write(next: Store) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage can be blocked; the attempt still works for this tab.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useExamStore(): Store {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function saveActive(exam: string, active: Active | null) {
  const current = read();
  const next = { ...current.active };
  if (active) next[exam] = active;
  else delete next[exam];
  write({ ...current, active: next });
}

export function addAttempt(attempt: Attempt) {
  const current = read();
  write({ ...current, attempts: [attempt, ...current.attempts].slice(0, 100) });
}

export function clearHistory(exam: string) {
  const current = read();
  write({ ...current, attempts: current.attempts.filter((a) => a.exam !== exam) });
}

/* --------------------------------------------------------------- scoring */

export function isCorrect(question: ExamQuestion, picked: number[] | undefined) {
  if (!picked || picked.length !== question.answer.length) return false;
  const set = new Set(picked);
  return question.answer.every((index) => set.has(index));
}

export type SectionResult = { section: number; correct: number; total: number; answered: number };
export type TopicResult = { topic: string; section: number; correct: number; total: number };

export type Result = {
  total: number;
  correct: number;
  answered: number;
  percent: number;
  bySection: SectionResult[];
  byTopic: TopicResult[];
  durationSec: number;
};

export function scoreAttempt(exam: Exam, attempt: Attempt | Active, finishedAt?: number): Result {
  const byId = new Map(exam.questions.map((question) => [question.id, question]));
  const sections = new Map<number, SectionResult>();
  const topics = new Map<string, TopicResult>();
  let correct = 0;
  let answered = 0;

  for (const id of attempt.qids) {
    const question = byId.get(id);
    if (!question) continue;
    const picked = attempt.answers[id];
    const ok = isCorrect(question, picked);
    if (picked && picked.length > 0) answered += 1;
    if (ok) correct += 1;

    const section = sections.get(question.section) ?? { section: question.section, correct: 0, total: 0, answered: 0 };
    section.total += 1;
    if (ok) section.correct += 1;
    if (picked && picked.length > 0) section.answered += 1;
    sections.set(question.section, section);

    const topic = topics.get(question.topic) ?? { topic: question.topic, section: question.section, correct: 0, total: 0 };
    topic.total += 1;
    if (ok) topic.correct += 1;
    topics.set(question.topic, topic);
  }

  const total = attempt.qids.length;
  const end = finishedAt ?? ("finishedAt" in attempt ? attempt.finishedAt : Date.now());
  return {
    total,
    correct,
    answered,
    percent: total ? Math.round((correct / total) * 100) : 0,
    bySection: [...sections.values()].sort((a, b) => a.section - b.section),
    byTopic: [...topics.values()],
    durationSec: Math.max(0, Math.round((end - attempt.startedAt) / 1000)),
  };
}

/* ------------------------------------------------------ option shuffling */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function shuffled<T>(items: T[], seed: number): T[] {
  const random = mulberry32(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Display order of option indexes for one question in one attempt. */
export function optionOrder(question: ExamQuestion, seed: number) {
  return shuffled(
    question.options.map((_, index) => index),
    seed ^ hash(question.id),
  );
}
