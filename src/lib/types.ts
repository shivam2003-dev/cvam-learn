import type { ReactNode } from "react";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type LessonMeta = {
  slug: string;
  title: string;
  summary: string;
  /** Courseware only: a hands-on project or lab instead of a reading lesson. */
  kind?: "lesson" | "project" | "lab";
};

export type Module = {
  id: string;
  title: string;
  blurb: string;
  lessons: LessonMeta[];
};

export type Course = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  level: string;
  skills: string[];
  modules: Module[];
};

export type McqQuestion = {
  kind: "mcq";
  q: string;
  options: string[];
  answer: number;
  explain: string;
};

/** TryHackMe-style typed answer, compared case-insensitively. */
export type TextQuestion = {
  kind: "text";
  q: string;
  format: string;
  accept: string[];
  explain: string;
};

export type QuizQuestion = McqQuestion | TextQuestion;

export type Reference = {
  type: string;
  title: string;
  url: string;
};

export type Task = {
  id: string;
  title: string;
  body: ReactNode;
};

export type Lesson = {
  minutes: number;
  difficulty: Difficulty;
  objectives: string[];
  tasks: Task[];
  takeaways: string[];
  quiz: QuizQuestion[];
};

/** LeetCode-style numeric problem, graded in the browser. */
export type Problem = {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  lesson: string;
  statement: string[];
  given: { label: string; value: string }[];
  ask: string;
  unit: string;
  answer: number;
  tolerance: number;
  hints: string[];
  solution: string[];
};

/** Plain-data curriculum handed to client components. */
export type NavLesson = LessonMeta & {
  ready: boolean;
  minutes: number | null;
  difficulty: Difficulty | null;
  resources?: Reference[];
};
export type NavModule = Omit<Module, "lessons"> & { lessons: NavLesson[] };
export type NavCourse = {
  slug: string;
  title: string;
  modules: NavModule[];
};
