import { gcpPcaExam } from "@/content/exams/gcp-pca/exam";

export type ExamQuestion = {
  id: string;
  section: number;
  topic: string;
  multi: boolean;
  stem: string;
  options: string[];
  /** Indexes into options that are correct. */
  answer: number[];
  explain: string;
  source?: "pdf";
  sourceQuestion?: number;
  updatedAt?: string;
  references?: { title: string; url: string }[];
  diagram?: { src: string; alt: string; caption: string; placement: "question" | "explanation" };
};

export type ExamSection = {
  id: number;
  name: string;
  /** Approximate share of the real exam, in percent. */
  weight: number;
  /** Courseware lesson slugs to revisit when this section is weak. */
  lessons: string[];
};

export type CheatSection = {
  section: number;
  title: string;
  points: string[];
  table?: { head: string[]; rows: string[][] };
};

export type Exam = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  courseSlug: string;
  sections: ExamSection[];
  questions: ExamQuestion[];
  minutesPerQuestion: number;
  /** Practice readiness target, as a percentage. Not an official pass mark. */
  target: number;
  officialFormat: string[];
  cheatsheet: CheatSection[];
};

export const exams: Exam[] = [gcpPcaExam];

export function getExam(slug: string) {
  return exams.find((exam) => exam.slug === slug);
}
