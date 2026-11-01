import type { Lesson } from "@/lib/types";
import { lesson as whatIsMlops } from "./what-is-mlops";

export const lessons: Record<string, Lesson> = {
  "what-is-mlops": whatIsMlops,
};
