import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Hard",
  objectives: [
    "Build a golden dataset from real customer examples",
    "Choose between code-based, model-graded and human evaluation",
    "Run evals in CI and read the results to decide what to ship",
  ],
  tasks: [
    {
      id: "why",
      title: "Why evals come first",
      body: (
        <>
          <p>
            AI output varies and "looks good" does not scale. An <strong>eval</strong> is a repeatable
            test that scores your system on realistic inputs. Without it you cannot tell whether a
            prompt, model or retrieval change helped, and you cannot prove value to the customer.
          </p>
          <Callout tone="tip">
            Write the evals before the clever prompt. They define "done" and give you and the
            customer a shared measure.
          </Callout>
        </>
      ),
    },
    {
      id: "dataset",
      title: "The golden dataset",
      body: (
        <>
          <ol>
            <li>
              <strong>Collect real inputs</strong> from the customer: 50 to 200 to start, covering
              typical, rare and ugly cases.
            </li>
            <li>
              <strong>Label expected outputs</strong> with a domain expert, not only engineers.
            </li>
            <li>
              <strong>Tag slices</strong> such as language, document type and difficulty, to see
              where it fails.
            </li>
            <li>
              <strong>Hold out</strong> a test set you do not tune against.
            </li>
            <li>
              <strong>Grow it</strong> with every production failure, turning each bug into a
              permanent test.
            </li>
          </ol>
          <pre>
            <code>{`{"id": "inv-017", "input": "scan_017.pdf", "expected": {"vendor": "Acme Ltd", "total": 1204.50, "currency": "GBP"}, "tags": ["scanned", "multi-page"]}`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "graders",
      title: "Graders",
      body: (
        <>
          <Table
            head={["Grader", "How", "Use for", "Limits"]}
            rows={[
              ["Code check", "Exact match, regex, schema, numeric tolerance", "Extraction, classification, format", "Cannot judge free text"],
              ["Model-graded", "Another model scores against a rubric", "Summaries, tone, helpfulness", "Needs calibration against humans"],
              ["Human review", "Experts rate samples", "Ground truth, ambiguous cases", "Slow and costly"],
              ["Behavioural", "Did it call the right tool, with right args?", "Agents", "Needs traces"],
            ]}
          />
          <pre>
            <code>{`def score(case, output):
    exp = case["expected"]
    return {
        "vendor_ok": output["vendor"].strip().lower() == exp["vendor"].lower(),
        "total_ok": abs(output["total"] - exp["total"]) < 0.01,
        "valid_json": True,
    }`}</code>
          </pre>
          <Callout tone="warn">
            A model grader can be biased toward longer or confident answers. Check its scores
            against a sample of human ratings before you trust it.
          </Callout>
        </>
      ),
    },
    {
      id: "ci",
      title: "Running evals in CI",
      body: (
        <>
          <ul>
            <li>Run the eval suite on every prompt, model or retrieval change.</li>
            <li>Report per-slice scores, not only one average; averages hide failures.</li>
            <li>Set a threshold that blocks a merge when scores drop.</li>
            <li>Track cost and latency alongside accuracy.</li>
            <li>Sample live traffic for ongoing online evaluation after release.</li>
          </ul>
          <Table
            head={["Result", "Decision"]}
            rows={[
              ["Higher accuracy, same cost", "Ship"],
              ["Slightly higher accuracy, 3x cost", "Discuss with customer; maybe route by difficulty"],
              ["Better average, worse on a critical slice", "Do not ship; fix the slice"],
            ]}
          />
          <p>
            Tools such as DeepEval, RAGAS, Langfuse and promptfoo provide runners, but a small
            script with a dataset and a scoring function is enough to start.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Evals define done and measure every change; build them first.",
    "A golden dataset comes from real customer inputs, expert labels, tagged slices and a held-out set.",
    "Use code graders where possible, calibrated model graders and human review for the rest.",
    "Run evals in CI, report by slice, track cost and latency, and add every failure as a test.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why report scores per slice instead of one average?",
      options: [
        "Averages can hide failures on important subsets",
        "Slices are required by law",
        "It makes tests slower",
        "Averages are always wrong",
      ],
      answer: 0,
      explain: "A strong average can mask poor results on a critical document type or language.",
    },
    {
      kind: "mcq",
      q: "Who should label expected outputs for a medical-claims task?",
      options: ["A domain expert", "A random model only", "Nobody", "The newest intern with no guidance"],
      answer: 0,
      explain: "Correctness depends on domain knowledge.",
    },
    {
      kind: "mcq",
      q: "You find a production failure. What should you do with it?",
      options: [
        "Add it to the eval dataset as a permanent test",
        "Hide it",
        "Delete the logs",
        "Change the thresholds so it passes",
      ],
      answer: 0,
      explain: "Turning failures into test cases prevents regressions.",
    },
  ],
};
