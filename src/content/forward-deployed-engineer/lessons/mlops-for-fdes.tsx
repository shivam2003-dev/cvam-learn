import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Describe the lifecycle from experiment to monitored production model",
    "Version data, code, prompts and models so results are reproducible",
    "Detect drift and decide when to retrain, re-prompt or roll back",
  ],
  tasks: [
    {
      id: "lifecycle",
      title: "From notebook to production",
      body: (
        <>
          <p>
            <strong>MLOps</strong> applies DevOps habits to machine learning and AI systems. A
            notebook that works once is not a service. The gap is data, deployment, monitoring and
            change.
          </p>
          <Table
            head={["Stage", "Question it answers"]}
            rows={[
              ["Data", "Where does it come from, who owns it, is it versioned and validated?"],
              ["Experiment", "Which model or prompt works best, measured how?"],
              ["Package", "Can it run identically elsewhere (container, pinned dependencies)?"],
              ["Deploy", "Batch job, real-time API, or embedded; how do we roll back?"],
              ["Monitor", "Is it healthy, fast, accurate and cost-effective today?"],
              ["Improve", "When do we retrain, update the prompt, or change the model?"],
            ]}
          />
          <Callout tone="note">
            With hosted LLMs you rarely train models. The same lifecycle still applies to prompts,
            retrieval indexes, tools and evaluation sets.
          </Callout>
        </>
      ),
    },
    {
      id: "versioning",
      title: "Version everything that affects output",
      body: (
        <>
          <ul>
            <li>
              <strong>Code</strong> in Git with tags per release.
            </li>
            <li>
              <strong>Data</strong> snapshots or table versions, plus a record of schema and
              filters.
            </li>
            <li>
              <strong>Models</strong> in a registry with metrics, lineage and a stage (staging,
              production).
            </li>
            <li>
              <strong>Prompts and configs</strong> as versioned files.
            </li>
            <li>
              <strong>Environments</strong> via lock files and container images.
            </li>
          </ul>
          <pre>
            <code>{`# Log what produced a result so it can be reproduced
mlflow.log_params({"model": "gpt-class-v3", "prompt_version": "2026-10-14", "top_k": 5})
mlflow.log_metric("exact_match", 0.87)
mlflow.log_artifact("eval_report.json")`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "monitor",
      title: "Monitoring and drift",
      body: (
        <>
          <p>
            Models decay silently because the world changes. Monitor at three levels:
          </p>
          <ul>
            <li>
              <strong>System.</strong> Latency, errors, throughput, cost, GPU or token usage.
            </li>
            <li>
              <strong>Data.</strong> <em>Data drift</em>: the input distribution shifts (new
              product lines, new document formats). Check missing values and ranges.
            </li>
            <li>
              <strong>Quality.</strong> <em>Concept drift</em>: the right answer changes. Track
              sampled human review, user corrections and eval scores on fresh data.
            </li>
          </ul>
          <Table
            head={["Signal", "Likely response"]}
            rows={[
              ["Input distribution moved", "Check pipeline, update examples or retrain"],
              ["Quality dropped after provider change", "Roll back version, re-run evals"],
              ["Cost spiked", "Cache, shorten context, route to a smaller model"],
              ["Latency rose", "Check provider status, batch, stream, optimise retrieval"],
            ]}
          />
          <Callout tone="tip">
            Always keep a one-step rollback to the previous model, prompt and index. Test it before
            you need it.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "MLOps covers data, experiments, packaging, deployment, monitoring and improvement.",
    "Version code, data, models, prompts and environments so results are reproducible.",
    "Watch system, data and quality signals; know the response for each kind of drift.",
    "Keep a tested, one-step rollback.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Input documents suddenly use a new format and extraction quality drops. This is mainly:",
      options: ["Data drift", "A CPU problem", "A Git merge conflict", "A DNS issue"],
      answer: 0,
      explain: "The input distribution changed from what the system was built and tested on.",
    },
    {
      kind: "mcq",
      q: "Why log the prompt version and parameters alongside each result?",
      options: [
        "To reproduce and compare results later",
        "To slow the system",
        "For decoration",
        "To remove monitoring",
      ],
      answer: 0,
      explain: "Without lineage you cannot explain or reproduce a past output.",
    },
    {
      kind: "mcq",
      q: "Quality dropped right after a provider's model update. Best first response?",
      options: [
        "Roll back to the pinned previous version and re-run evals",
        "Ignore it",
        "Delete monitoring",
        "Retrain from scratch immediately",
      ],
      answer: 0,
      explain: "Rollback restores service quickly; then evaluate the new version before adopting it.",
    },
  ],
};
