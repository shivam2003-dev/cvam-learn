import { ArchDiagram, ForCloud, ServiceMap, type ServiceRow } from "@/components/CloudArch";
import { Exercise } from "@/components/Diagram";
import { Callout } from "@/components/Lesson";
import { providers, type Provider, type Sheet } from "@/lib/cloud";
import type { Difficulty, Lesson, QuizQuestion } from "@/lib/types";
import { defineArch, usedSvcs, type Arch } from "./builder";
import { catalog, svcName } from "./catalog";

export type LessonSpec = {
  minutes: number;
  difficulty: Difficulty;
  /** Industry or product this architecture is drawn from, shown in a callout. */
  context: string;
  objectives: string[];
  /** The business problem, in two or three short paragraphs. */
  problem: string[];
  arch: Arch;
  diagramTitle: string;
  /** Provider-specific things that bite people, one short paragraph each. */
  notes: Record<Provider, string[]>;
  /** Design rules, trade-offs and failure modes that apply everywhere. */
  decisions: { title: string; text: string }[];
  exercise: { title: string; task: string; answer: string[] };
  takeaways: string[];
  quiz: QuizQuestion[];
};

export function makeLesson(spec: LessonSpec): Lesson & { sheet: Sheet } {
  const specs = defineArch(spec.arch);
  const rows: ServiceRow[] = usedSvcs(spec.arch).map((svc) => ({
    role: catalog[svc].role,
    aws: svcName(svc, "aws"),
    azure: svcName(svc, "azure"),
    gcp: svcName(svc, "gcp"),
    oci: svcName(svc, "oci"),
  }));
  void providers;
  return {
    sheet: { diagramTitle: spec.diagramTitle, specs, takeaways: spec.takeaways },
    minutes: spec.minutes,
    difficulty: spec.difficulty,
    objectives: spec.objectives,
    tasks: [
      {
        id: "problem",
        title: "The problem this architecture solves",
        body: (
          <>
            <Callout tone="note" title="Where you see this">{spec.context}</Callout>
            {spec.problem.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </>
        ),
      },
      {
        id: "names",
        title: "The same building blocks on four clouds",
        body: (
          <>
            <p>Click a provider name to light up its column. The diagram below uses exactly these services.</p>
            <ServiceMap rows={rows} />
          </>
        ),
      },
      {
        id: "build",
        title: "Build it one layer at a time",
        body: (
          <>
            <p>Press <strong>Next</strong> to add each layer. Switch cloud at any step to compare, or use <strong>Full screen</strong> for a bigger view.</p>
            <ArchDiagram specs={specs} title={spec.diagramTitle} />
          </>
        ),
      },
      {
        id: "differences",
        title: "Cloud-specific details to know",
        body: (
          <ForCloud
            aws={spec.notes.aws.map((t) => <p key={t}>{t}</p>)}
            azure={spec.notes.azure.map((t) => <p key={t}>{t}</p>)}
            gcp={spec.notes.gcp.map((t) => <p key={t}>{t}</p>)}
            oci={spec.notes.oci.map((t) => <p key={t}>{t}</p>)}
          />
        ),
      },
      {
        id: "decisions",
        title: "Design decisions and trade-offs",
        body: (
          <>
            <ul>
              {spec.decisions.map((d) => (
                <li key={d.title}>
                  <strong>{d.title}.</strong> {d.text}
                </li>
              ))}
            </ul>
            <Exercise title={spec.exercise.title} task={<p>{spec.exercise.task}</p>}>
              <ol>
                {spec.exercise.answer.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ol>
            </Exercise>
          </>
        ),
      },
    ],
    takeaways: spec.takeaways,
    quiz: spec.quiz,
  };
}
