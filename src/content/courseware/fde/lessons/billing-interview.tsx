import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 20,
  difficulty: "Hard",
  objectives: [
    "Answer interview questions on when to fine-tune versus prompt or retrieve",
    "Explain data preparation, evaluation and deployment decisions for a tuned model",
    "Discuss privacy, bias and update strategy for a regulated domain",
    "Challenge a customer's chosen technique respectfully with evidence",
  ],
  tasks: [
    {
      id: "q1",
      title: "Question 1: Should we fine-tune?",
      body: (
        <>
          <Exercise
            title="Question"
            task={<p>&ldquo;A hospital group has five years of coded notes and wants to fine-tune a model for medical coding. Do you agree?&rdquo;</p>}
          >
            <p>
              <strong>Position:</strong> &ldquo;Probably yes for part of the system, but I would prove
              it against simpler baselines first.&rdquo;
            </p>
            <ul>
              <li><strong>Why it may fit:</strong> narrow, repetitive task; abundant hospital-specific labels; the gap is learned behaviour (how this hospital codes), not missing knowledge.</li>
              <li><strong>What I would not tune for:</strong> the code set itself and the rules. They change yearly and must be exact, so keep them as versioned data and code, with retrieval and rule validation.</li>
              <li><strong>Plan:</strong> build a prompted-model baseline and a classical classifier on the same split. Fine-tune only if it clearly beats them by a margin that justifies the cost, then compare on cost per chart and latency.</li>
            </ul>
            <p>
              <strong>Risks:</strong> label noise from historical errors, privacy, and drift. I would
              audit labels using denial and audit outcomes before training.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "q2",
      title: "Question 2: Preparing the data",
      body: (
        <>
          <Exercise
            title="Question"
            task={<p>&ldquo;Walk me through preparing the training data. What goes wrong?&rdquo;</p>}
          >
            <ol>
              <li><strong>Security first:</strong> do the work in the hospital&apos;s approved environment; restrict access; de-identify direct identifiers where the task allows.</li>
              <li><strong>Label cleaning:</strong> remove retired codes, map renamed ones, and examine claims later denied or audited, since those labels are suspect.</li>
              <li><strong>Splits:</strong> by patient and by time, so notes from one patient never appear in both train and test, and the test reflects future data.</li>
              <li><strong>Coverage analysis:</strong> count examples per code; decide how to handle the long tail (hierarchy, retrieval, leave to coders).</li>
              <li><strong>Leakage checks:</strong> make sure inputs do not contain the answer, for example a billing summary section that already lists codes.</li>
            </ol>
            <p>
              <strong>What commonly goes wrong:</strong> random splits that inflate scores, training on
              codes produced by an earlier automated tool, and ignoring template changes between
              years.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "q3",
      title: "Questions 3 to 6",
      body: (
        <>
          <Exercise
            title="Question 3: Evaluation"
            task={<p>&ldquo;Overall accuracy is 92%. Is that good enough to launch?&rdquo;</p>}
          >
            <p>
              Not by itself. I would ask what 92% measures and for whom. For multi-label coding I
              want per-code precision and recall, macro and micro F1, calibration, and the
              high-confidence error rate. I would slice by specialty, clinic and code group, since an
              average hides weak areas. Then I would run a blind study with coders using and not using
              suggestions on the same charts to measure accuracy and time. The launch decision should
              rest on thresholds agreed with compliance and revenue teams beforehand, such as precision
              on high-risk codes and coder acceptance.
            </p>
          </Exercise>
          <Exercise
            title="Question 4: Privacy"
            task={<p>&ldquo;How do you handle patient privacy when training and serving?&rdquo;</p>}
          >
            <p>
              Keep training and inference inside the hospital&apos;s secure environment, with no note
              text sent to external services. De-identify where possible, apply least-privilege access
              to data and model artefacts (a tuned model can memorise), log access, and test for
              memorisation. Define retention for prompts, outputs and logs with the privacy team, and
              make sure suggestions and audit records carry the same protection as the chart.
            </p>
          </Exercise>
          <Exercise
            title="Question 5: The yearly update"
            task={<p>&ldquo;Code sets change every year. How does your design cope?&rdquo;</p>}
          >
            <p>
              The code set and rules are versioned data feeding the candidate generator and rule
              engine, so most of the update is a data release. Then I evaluate the existing model on
              recent charts and the new codes. Only if performance drops do I retrain the adapter with
              new labels. Every suggestion logs model, code-set and rules versions, and a rollback to
              the previous set is ready before the effective date.
            </p>
          </Exercise>
          <Exercise
            title="Question 6: Customer insists on a generative model"
            task={<p>&ldquo;The CIO saw a demo where a chatbot output codes directly and wants that.&rdquo;</p>}
          >
            <p>
              &ldquo;That demo is a good test of what is possible, so I would include it as a baseline
              and measure it fairly on your data. My concern is that free-text generation can invent
              plausible but invalid codes and gives no calibrated confidence. Constraining the model to
              score valid candidates gives auditability and thresholds. Let us run both on 500 held-out
              charts and decide on results.&rdquo; This respects the idea, uses evidence, and keeps the
              decision with the customer.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "map",
      title: "The answer map",
      body: (
        <>
          <DiagramReference lesson="billing-interview" panel={1} />
          <Table
            head={["Follow-up", "Good direction"]}
            rows={[
              ["Why not just use a bigger general model?", "Cost and latency at 2 million claims, privacy (data cannot leave), no calibrated confidence, and weaker on hospital-specific patterns; but include it as a baseline"],
              ["How do you stop the model from memorising patients?", "De-identify, limit access to artefacts, regularise, test with extraction probes, keep the model inside the environment"],
              ["What if coders disagree with each other?", "Measure inter-coder agreement; it caps achievable accuracy; use adjudicated labels for evaluation"],
              ["How do you handle bias?", "Slice metrics across demographics and specialties; investigate gaps; involve compliance; document limitations"],
              ["When would you not fine-tune?", "Little data, fast-changing knowledge, or a baseline already meets the target"],
            ]}
          />
          <Callout tone="tip" title="Challenge with evidence, not ego">
            When you disagree with a customer&apos;s technique, propose a fair test and a decision
            date. People accept &ldquo;let us measure&rdquo; far more readily than &ldquo;you are
            wrong&rdquo;.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Say yes to fine-tuning for learned behaviour, but keep code sets and rules as data and prove it against baselines.",
    "Prepare data with security, label cleaning, patient-and-time splits, coverage analysis and leakage checks.",
    "A single overall accuracy is not a launch criterion; use per-code, sliced and coder-in-the-loop evaluation.",
    "Handle privacy with secure environments, access control and memorisation testing.",
    "Handle customer pushback by proposing a fair, measured comparison.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the best response when a CIO wants a chatbot to output codes directly?",
      options: [
        "Include it as a baseline and compare fairly on held-out charts",
        "Refuse to try it",
        "Agree without testing",
        "Remove coders",
      ],
      answer: 0,
      explain: "A measured comparison respects the idea and lets evidence decide.",
    },
    {
      kind: "mcq",
      q: "Why audit labels using denied and audited claims?",
      options: [
        "Historical codes that led to denials may be wrong and would teach wrong habits",
        "Denials are always correct",
        "It reduces dataset size for fun",
        "It is unrelated to training",
      ],
      answer: 0,
      explain: "Noisy labels limit and distort learning.",
    },
    {
      kind: "mcq",
      q: "Overall accuracy is 92%. Why is that not enough to launch?",
      options: [
        "Averages hide weak slices and do not reflect unequal error costs",
        "92% is too high",
        "Accuracy is never measured",
        "Launch needs no evidence",
      ],
      answer: 0,
      explain: "Per-code, per-slice and business measures are needed.",
    },
    {
      kind: "mcq",
      q: "Coders disagree with each other on some charts. What does this imply?",
      options: [
        "Inter-coder agreement limits achievable accuracy and labels need adjudication",
        "The model must be wrong",
        "Nothing",
        "Coders should be removed",
      ],
      answer: 0,
      explain: "If humans disagree, model labels are ambiguous; use adjudicated ground truth for evaluation.",
    },
    {
      kind: "text",
      q: "What word describes inputs that accidentally contain the answer, inflating test scores? (one word)",
      format: "*******",
      accept: ["leakage", "leak", "data leakage"],
      explain: "Leakage gives the model information it would not have at prediction time.",
    },
  ],
};
