import type { Lesson } from "@/lib/types";
import { lesson as mlopsComponents } from "./mlops-components";
import { lesson as mlopsPrinciples } from "./mlops-principles";
import { lesson as whatIsMlops } from "./what-is-mlops";

export const lessons: Record<string, Lesson> = {
  "what-is-mlops": whatIsMlops,
  "mlops-principles": mlopsPrinciples,
  "mlops-components": mlopsComponents,
};
