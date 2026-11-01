"use client";

import { useSyncExternalStore } from "react";

const KEY = "cvam-learn:v1";
const XP_PER_LESSON = 10;
const XP_PER_CORRECT = 5;
const XP_PER_PROBLEM = 20;
const XP_PER_LEVEL = 50;

export type Progress = {
  done: Record<string, number>;
  quiz: Record<string, { correct: number; total: number }>;
  solved: Record<string, number>;
  activity: Record<string, number>;
};

const EMPTY: Progress = { done: {}, quiz: {}, solved: {}, activity: {} };

let cache: Progress | null = null;
const listeners = new Set<() => void>();

function read(): Progress {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache as Progress;
}

function write(next: Progress) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private windows can refuse storage; progress still lasts for this tab.
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

export function dayKey(date: Date) {
  return date.toLocaleDateString("en-CA");
}

function bump(activity: Progress["activity"]) {
  const today = dayKey(new Date());
  return { ...activity, [today]: (activity[today] ?? 0) + 1 };
}

export function lessonKey(course: string, slug: string) {
  return `${course}/${slug}`;
}

export function completeLesson(key: string) {
  const state = read();
  if (state.done[key]) return;
  write({
    ...state,
    done: { ...state.done, [key]: Date.now() },
    activity: bump(state.activity),
  });
}

export function resetLesson(key: string) {
  const state = read();
  const done = { ...state.done };
  delete done[key];
  write({ ...state, done });
}

/** Only the first attempt scores, so retrying a quiz can't farm XP. */
export function recordQuiz(key: string, correct: number, total: number) {
  const state = read();
  if (state.quiz[key]) return;
  write({
    ...state,
    quiz: { ...state.quiz, [key]: { correct, total } },
    activity: bump(state.activity),
  });
}

export function markSolved(slug: string) {
  const state = read();
  if (state.solved[slug]) return;
  write({
    ...state,
    solved: { ...state.solved, [slug]: Date.now() },
    activity: bump(state.activity),
  });
}

export function useProgress() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function xpOf(progress: Progress) {
  const lessonXp = Object.keys(progress.done).length * XP_PER_LESSON;
  const quizXp = Object.values(progress.quiz).reduce(
    (sum, score) => sum + score.correct * XP_PER_CORRECT,
    0,
  );
  return lessonXp + quizXp + Object.keys(progress.solved).length * XP_PER_PROBLEM;
}

const RANKS = ["Newcomer", "Apprentice", "Operator", "Engineer", "Architect"];

export function levelOf(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  return {
    level,
    rank: RANKS[Math.min(Math.floor((level - 1) / 3), RANKS.length - 1)],
    intoLevel: xp % XP_PER_LEVEL,
    perLevel: XP_PER_LEVEL,
  };
}

export function streakOf(progress: Progress) {
  if (progress === EMPTY) return 0;
  const cursor = new Date();
  if (!progress.activity[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (progress.activity[dayKey(cursor)]) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
