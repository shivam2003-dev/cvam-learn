import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Quadrant } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 22,
  difficulty: "Medium",
  objectives: [
    "Build a small but credible evaluation set and scoring script in a few hours",
    "Choose metrics that match the cost of different errors",
    "Perform error analysis and show what you changed because of it",
    "Add guardrails: validation, abstention, thresholds and a human review path",
    "Present results with appropriate humility about sample size and limits",
  ],
  tasks: [
    {
      id: "set",
      title: "A small evaluation set that still counts",
      body: (
        <>
          <p>
            Nothing separates strong LLM take-homes from weak ones faster than evidence. You do not
            need a thousand examples. You need enough to be informative, labelled honestly, and
            covering the cases that matter.
          </p>
          <Figure caption="Building an evaluation set in about 45 minutes. The mix of cases matters more than the count.">
            <Flow
              numbered
              steps={[
                { title: "Sample", note: "30 to 60 real inputs from the provided data", tone: "sky" },
                { title: "Cover", note: "Include easy, hard, ambiguous, empty and adversarial cases", tone: "sky" },
                { title: "Label", note: "Write the expected output yourself, from the source text, in a file", tone: "lime" },
                { title: "Hold out", note: "Keep 15 to 20 untouched for the final score", tone: "lime" },
                { title: "Script", note: "One command computes metrics and lists failures", tone: "amber" },
              ]}
            />
          </Figure>
          <Table
            head={["Case type", "Share", "Why"]}
            rows={[
              ["Typical", "50%", "The main experience"],
              ["Hard or messy (scans, odd formats, long text)", "25%", "Where models fail"],
              ["Ambiguous or missing information", "10%", "Tests abstention and honesty"],
              ["Adversarial (injection, irrelevant, offensive)", "10%", "Tests guardrails"],
              ["Empty or malformed", "5%", "Tests robustness"],
            ]}
          />
          <Callout tone="warn" title="Say who labelled the data">
            If you labelled the examples yourself, say so, and note that a second labeller would
            strengthen the result. Hiding this is worse than stating a limitation.
          </Callout>
        </>
      ),
    },
    {
      id: "metrics",
      title: "Metrics that match the cost of errors",
      body: (
        <>
          <Table
            head={["Task", "Primary metric", "Also report"]}
            rows={[
              ["Field extraction", "Per-field exact match, and all-fields-correct per document", "Null rate; confident-wrong rate"],
              ["Classification", "Precision and recall per class (not just accuracy)", "Confusion matrix; the costly error"],
              ["Question answering with sources", "Answer correctness; citation validity", "Abstention on unanswerable questions"],
              ["Summaries or drafts", "Rubric scores (accuracy, completeness, tone) by two judges, or an LLM judge calibrated on a few human ratings", "Unsupported claim rate"],
              ["Any pipeline", "Cost and latency per item", "Failure and fallback rates"],
            ]}
          />
          <p>
            <strong>Pick the costly error and report it.</strong> In an urgency classifier, the costly
            error is calling an urgent email normal. Overall accuracy can hide this: with 5% urgent
            emails, a model that never says &ldquo;urgent&rdquo; is 95% accurate and useless.
          </p>
          <Figure caption="Precision and recall trade off as the threshold moves. Choose a threshold from the cost of each error, and show your reasoning.">
            <Quadrant
              label="Operating points showing the trade-off between precision and recall at different thresholds"
              xLabel="Recall (urgent emails caught)"
              yLabel="Precision (flags that were right)"
              corners={["Ideal", "Cautious flagging", "Weak", "Noisy flagging"]}
              items={[
                { label: "High threshold", x: 0.52, y: 0.92, tone: "sky" },
                { label: "Medium threshold", x: 0.76, y: 0.74, tone: "lime" },
                { label: "Low threshold", x: 0.94, y: 0.46, tone: "amber" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "errors",
      title: "Error analysis: the part reviewers remember",
      body: (
        <>
          <p>
            After scoring, read the failures. Group them. Fix the biggest group. Re-score. Show the
            before and after in your README. This loop demonstrates exactly the behaviour FDEs need.
          </p>
          <Table
            head={["Failure group", "Count", "Cause", "Fix tried", "After"]}
            rows={[
              ["Total confused with subtotal", "6", "Prompt said 'total' only", "Added 'amount due, after tax' and an example", "1 left"],
              ["Date day/month swapped", "4", "Ambiguous formats", "Detect locale; ask model to return ISO date and flag ambiguity", "0 left; 2 flagged"],
              ["Invented PO number", "3", "No evidence rule", "Evidence field plus grounding check", "0 left; null returned"],
              ["Scanned page, empty text", "3", "OCR missing", "Fallback OCR; else flag for human", "1 fixed; 2 flagged"],
            ]}
          />
          <pre>
            <code>{`# eval/run_eval.py (sketch)
results = []
for case in load("eval/labels.json"):
    out = extract(case["text"], call_model)
    results.append({"id": case["id"], "expected": case["expected"], "got": out.model_dump(),
                    "correct": {f: out.model_dump()[f] == case["expected"][f] for f in FIELDS}})
per_field = {f: sum(r["correct"][f] for r in results) / len(results) for f in FIELDS}
all_ok = sum(all(r["correct"].values()) for r in results) / len(results)
print(per_field, "all fields:", round(all_ok, 3), "n =", len(results))
json.dump([r for r in results if not all(r["correct"].values())], open("eval/failures.json", "w"), indent=2)`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "guardrails",
      title: "Guardrails and honest reporting",
      body: (
        <>
          <ul>
            <li><strong>Validate output</strong> against a schema, and check meaning (ranges, allowed labels, evidence in source).</li>
            <li><strong>Abstain</strong> with null or &ldquo;needs review&rdquo; when information is missing or confidence is low, and show how often that happens.</li>
            <li><strong>Route to a person</strong> for low-confidence or high-stakes cases, and quantify the workload this creates.</li>
            <li><strong>Test hostile inputs:</strong> text that says &ldquo;ignore your instructions&rdquo;, extremely long inputs, empty inputs, other languages.</li>
            <li><strong>Protect data:</strong> do not send more than needed; mention what is redacted.</li>
          </ul>
          <Callout tone="tip" title="How to state results">
            &ldquo;On 40 hand-labelled invoices, all four fields were correct on 34 (85%). With a sample
            this small the true rate could plausibly be 70 to 93%. The main failures were X and Y. I
            would validate on a larger sample before relying on it.&rdquo; Humility with specifics
            beats a confident single number.
          </Callout>
          <Exercise
            title="Interpret the evaluation"
            task={
              <p>
                Your urgency classifier scores 94% accuracy on 100 emails, of which 6 are urgent. It
                caught 2 urgent emails and missed 4. Is it good? What do you do?
              </p>
            }
          >
            <p>
              No. Recall on the urgent class is 2 of 6, about 33%, and missing urgent emails is the
              costly error. A model that never flagged urgency would score 94% accuracy too.
            </p>
            <p>
              <strong>Actions:</strong> report per-class precision and recall; look at the 4 missed
              emails for patterns (polite phrasing, implicit deadlines); revise the prompt with
              examples of understated urgency; lower the decision threshold or add a rule for
              deadline words; accept more false alarms; add more urgent examples to the evaluation set
              (6 is too few to conclude anything); and re-score. Say in the README that conclusions
              about the urgent class are tentative because of the small count.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "A 30 to 60 case evaluation set, covering typical, hard, ambiguous, adversarial and malformed inputs, is enough to be informative.",
    "Choose metrics for the costly error and report per-class results, not only accuracy.",
    "Read the failures, group them, fix the largest group, re-score and show before and after.",
    "Add validation, abstention, review routing and hostile-input tests, and state results with honest uncertainty.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why can 94% accuracy be misleading for an urgency classifier?",
      options: [
        "Urgent emails are rare, so a model that never flags them can still score high",
        "Accuracy is always wrong",
        "Urgency cannot be measured",
        "Small numbers are always accurate",
      ],
      answer: 0,
      explain: "Class imbalance can hide a failure on the minority class that matters most.",
    },
    {
      kind: "mcq",
      q: "Which step makes error analysis valuable in a README?",
      options: [
        "Showing before and after results for the largest failure group",
        "Hiding the failures",
        "Listing every email",
        "Skipping re-scoring",
      ],
      answer: 0,
      explain: "It demonstrates a disciplined improvement loop.",
    },
    {
      kind: "mcq",
      q: "Who should be named as the labeller of your evaluation data?",
      options: [
        "State honestly who labelled it, e.g. yourself, and note the limitation",
        "Nobody",
        "An imaginary expert",
        "The model",
      ],
      answer: 0,
      explain: "Transparency about labelling builds trust.",
    },
    {
      kind: "mcq",
      q: "What should happen to low-confidence outputs?",
      options: [
        "Be routed to a human review path, with the workload measured",
        "Be shown as confident",
        "Be deleted silently",
        "Be averaged",
      ],
      answer: 0,
      explain: "Abstain and route, and quantify the review burden.",
    },
    {
      kind: "text",
      q: "Recall for the urgent class: 2 caught out of 6 urgent emails. What percentage is that, rounded to the nearest whole number?",
      format: "**%",
      accept: ["33", "33%"],
      explain: "2 / 6 is about 33%.",
    },
  ],
};
