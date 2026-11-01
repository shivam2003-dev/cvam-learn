import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Choose between deterministic, model-based and human evaluation for a task",
    "Compute precision, recall and F1 from counts",
    "Write a judge prompt that is specific enough to be reliable",
    "Judge whether a score difference is real or just noise",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: how do you know it got better?",
      body: (
        <>
          <p>
            You change a prompt and the three examples you tried look better. Ship it? Maybe it
            fixed those three and broke thirty others. Because model output is open-ended text and
            varies from run to run, eyeballing a handful of cases is not evidence.
          </p>
          <p>
            An <strong>evaluation</strong> (an eval) turns quality into a number. You collect
            inputs, define what a good output looks like, run your system, and score the results.
            Now a change is either an improvement or it is not, and you can show it. Think of it
            as the test suite for behaviour that cannot be checked with a simple equality
            assertion.
          </p>
        </>
      ),
    },
    {
      id: "types",
      title: "Three kinds of eval",
      body: (
        <>
          <Table
            head={["Kind", "How it scores", "Good for", "Weakness"]}
            rows={[
              ["Deterministic", "Code checks the output: exact match, regex, valid JSON, unit tests", "Classification, extraction, code, format rules", "Cannot judge open-ended quality"],
              ["Model-based", "Another model grades against a rubric (LLM-as-judge)", "Summaries, tone, helpfulness, faithfulness", "Judge has its own biases and costs money"],
              ["Human", "People rate or compare outputs", "Final truth, subtle quality, calibrating the judge", "Slow, costly, inconsistent between raters"],
            ]}
          />
          <p>
            Use the cheapest method that can actually measure what you care about. If the task is
            to extract an invoice total, compare the number to the correct one in code. Do not ask
            a model to grade it. Reserve model graders for qualities that code cannot see, and keep
            a small human-labelled set to check that the grader agrees with people.
          </p>
          <pre>
            <code>{`# Deterministic eval: extraction must match the labelled answer exactly
cases = [
    {"input": "Total due: $1,250.00", "expected": "1250.00"},
    {"input": "Amount payable 99.5 USD", "expected": "99.50"},
]

def score(cases, extract):
    correct = sum(extract(c["input"]) == c["expected"] for c in cases)
    return correct / len(cases)`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "metrics",
      title: "The metrics behind the scores",
      body: (
        <>
          <p>
            Accuracy (the share of correct answers) is the first number people reach for, and it
            can mislead. If 95 percent of emails are not spam, a model that always says not spam
            scores 95 percent accuracy and catches nothing. For tasks with a rare class, use
            precision and recall.
          </p>
          <Formula>precision = TP ÷ (TP + FP)      recall = TP ÷ (TP + FN)</Formula>
          <p>
            Here TP is true positives (correctly flagged), FP is false positives (flagged by
            mistake) and FN is false negatives (missed). Precision asks: of what I flagged, how much
            was right? Recall asks: of what was there to find, how much did I find? The F1 score
            combines them so one number reflects both.
          </p>
          <Formula>F1 = 2 × precision × recall ÷ (precision + recall) = 2·TP ÷ (2·TP + FP + FN)</Formula>
          <pre>
            <code>{`A classifier finds policy violations in support chats (illustrative):
TP = 40   FP = 10   FN = 20

precision = 40 / (40 + 10) = 0.80
recall    = 40 / (40 + 20) = 0.667
F1        = 2 × 40 / (2 × 40 + 10 + 20) = 80 / 110 = 0.727`}</code>
          </pre>
          <p>
            Other metrics you will meet: exact match and token-level overlap for short answers, and
            pass rate on unit tests for generated code. Some evals report pass@k, which counts a
            problem as solved if any of k sampled attempts passes. For retrieval, see the lesson on
            regression testing.
          </p>
        </>
      ),
    },
    {
      id: "judge",
      title: "LLM-as-judge, done carefully",
      body: (
        <>
          <p>
            A judge model reads the question, the answer and a rubric, then returns a grade. It
            scales far better than people, but it is only as good as its instructions. Vague
            rubrics such as rate quality from 1 to 10 give noisy, inflated scores. Specific,
            checkable rubrics work better.
          </p>
          <pre>
            <code>{`JUDGE_PROMPT = """You are grading a customer-support answer.

Question: {question}
Reference facts: {facts}
Answer: {answer}

Score each item as 1 (yes) or 0 (no):
1. Every claim in the answer is supported by the reference facts.
2. The answer addresses the question that was asked.
3. The answer contains no promises the company cannot keep.

Reply with JSON only: {{"supported": 0, "relevant": 0, "no_promises": 0, "reason": "short"}}"""`}</code>
          </pre>
          <p>Known weak spots of model judges, and how to reduce them:</p>
          <ul>
            <li>
              <strong>Position bias:</strong> when comparing two answers, judges can favour the
              first. Run both orders and keep only consistent verdicts.
            </li>
            <li>
              <strong>Length bias:</strong> longer answers can score higher. Penalise padding in
              the rubric.
            </li>
            <li>
              <strong>Self-preference:</strong> a model may favour its own style. Use a different
              model as the judge when you can.
            </li>
          </ul>
          <Callout tone="tip">
            Label 50 to 100 examples by hand, run the judge on them, and compute agreement. If the
            judge matches your labels 85 times in 100, you know what you are trusting. If it
            matches 60 times in 100, fix the rubric before you rely on it.
          </Callout>
        </>
      ),
    },
    {
      id: "noise",
      title: "Is the difference real?",
      body: (
        <>
          <p>
            Your new prompt scores 82 percent and the old one scored 78 percent. Improvement? It
            depends on how many cases you ran. A pass rate measured on n cases has a standard error
            of roughly:
          </p>
          <Formula>standard error ≈ sqrt( p × (1 − p) ÷ n )</Formula>
          <pre>
            <code>{`p = 0.80, n = 100  ->  sqrt(0.8 × 0.2 / 100) = sqrt(0.0016) = 0.04
95% range is about ±1.96 × 0.04 = ±0.078, so roughly 72% to 88%

p = 0.80, n = 1,600 -> sqrt(0.16 / 1600) = 0.01  ->  about ±2 points`}</code>
          </pre>
          <p>
            With 100 cases, a 4-point gap sits well inside the noise. With 1,600 cases the same
            gap becomes meaningful. So grow your dataset, run the old and new versions on the same
            cases and compare them case by case, and fix sampling randomness where the API allows.
            When the sample is small, trust a pattern in the failures you read, not the headline
            number.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "An eval turns quality into a number so changes can be judged by evidence, not a few examples.",
    "Use deterministic checks when you can, model judges for open-ended quality, and humans to calibrate.",
    "Accuracy misleads on rare classes. Precision, recall and F1 describe the errors that matter.",
    "Give judges specific rubrics, swap answer order, and measure their agreement with human labels.",
    "Small datasets are noisy: a few points of difference on 100 cases may be nothing.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "An email filter always predicts not spam, and 95 percent of emails are not spam. What does its 95 percent accuracy tell you?",
      options: [
        "It is a near-perfect filter",
        "Little: it never catches spam, so recall for spam is zero",
        "Its precision is 95 percent",
        "It must be using an LLM judge",
      ],
      answer: 1,
      explain: "On a rare class, accuracy hides total failure. Recall for spam is zero because every spam email is missed.",
    },
    {
      kind: "mcq",
      q: "Which task is best graded with a deterministic eval?",
      options: [
        "Is this poem moving?",
        "How friendly is this reply?",
        "Does the extracted invoice number equal the labelled one?",
        "Is this summary well written?",
      ],
      answer: 2,
      explain: "A single correct value can be compared in code. The others need judgement.",
    },
    {
      kind: "mcq",
      q: "A judge model keeps preferring whichever answer is shown first. What is this called, and what is a fix?",
      options: [
        "Position bias, so run both orders and keep consistent verdicts",
        "Length bias, so shorten the prompt",
        "Temperature drift, so raise the temperature",
        "Recall loss, so add more data",
      ],
      answer: 0,
      explain: "Favouring the first answer is position bias. Evaluating both orders cancels it out.",
    },
    {
      kind: "text",
      q: "A detector has TP = 30, FP = 10 and FN = 20. What is its recall as a decimal?",
      format: "***",
      accept: ["0.6", ".6", "0.60"],
      explain: "Recall = TP ÷ (TP + FN) = 30 / 50 = 0.6.",
    },
    {
      kind: "text",
      q: "A pass rate of 0.5 is measured on n = 100 cases. Using standard error ≈ sqrt(p × (1 − p) ÷ n), what is the standard error as a decimal?",
      format: "****",
      accept: ["0.05", ".05"],
      explain: "sqrt(0.5 × 0.5 / 100) = sqrt(0.0025) = 0.05, or 5 percentage points.",
    },
  ],
};
