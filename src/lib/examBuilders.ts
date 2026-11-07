import type { ExamQuestion } from "@/lib/exams";

/** Builders used by question banks. The first options passed are the correct ones. */
export function single(
  id: string,
  section: number,
  topic: string,
  stem: string,
  correct: string,
  wrong: string[],
  explain: string,
): ExamQuestion {
  return { id, section, topic, multi: false, stem, options: [correct, ...wrong], answer: [0], explain };
}

export function multi(
  id: string,
  section: number,
  topic: string,
  stem: string,
  correct: string[],
  wrong: string[],
  explain: string,
): ExamQuestion {
  return {
    id,
    section,
    topic,
    multi: true,
    stem,
    options: [...correct, ...wrong],
    answer: correct.map((_, index) => index),
    explain,
  };
}
