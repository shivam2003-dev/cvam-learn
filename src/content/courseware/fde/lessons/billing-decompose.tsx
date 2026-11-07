import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 20,
  difficulty: "Hard",
  objectives: [
    "Frame a medical coding problem and its financial and compliance stakes",
    "Decide whether fine-tuning is the right tool by comparing it with prompting, retrieval and classical models",
    "Identify the data, labels and quality issues that decide feasibility",
    "Define metrics that reflect cost of different error types",
    "Plan the human-in-the-loop role and a staged rollout",
  ],
  tasks: [
    {
      id: "brief",
      title: "The brief",
      body: (
        <>
          <Callout tone="note" title="Customer request">
            &ldquo;We are a hospital group billing about 2 million claims a year. Coders read
            clinical notes and assign diagnosis and procedure codes. Mistakes cause denials and
            audits, and we are always behind. A vendor demo of a general chatbot assigned codes
            confidently but got many wrong. We have 5 years of coded notes. Can you fine-tune a model
            to do better?&rdquo;
          </Callout>
          <p>
            This case differs from the previous two. The customer has already proposed a technique
            (fine-tuning) and has a lot of labelled data. An FDE&apos;s job is to test whether the
            technique fits, not to accept it. It also touches regulated health data, so privacy and
            auditability shape the design from the first day.
          </p>
          <Callout tone="warn" title="Scope note">
            This course lesson discusses system design, not medical or billing advice. Coding rules
            are specialised and change yearly; the customer&apos;s certified coders and compliance
            team own correctness and policy.
          </Callout>
        </>
      ),
    },
    {
      id: "understand",
      title: "Understand the task",
      body: (
        <>
          <p>
            In medical coding, a coder reads a clinical note and assigns standardised codes (for
            example diagnosis codes and procedure codes) that justify the charges on a claim. Key
            facts that shape the ML problem:
          </p>
          <ul>
            <li>
              <strong>Large label space.</strong> Tens of thousands of possible codes, with a long
              tail where most codes are rare.
            </li>
            <li>
              <strong>Multi-label.</strong> A note usually needs several codes, not one.
            </li>
            <li>
              <strong>Rules matter.</strong> Specificity, sequencing and payer-specific rules decide
              the right code, not only the text.
            </li>
            <li>
              <strong>Code sets change</strong> every year, so any model must be updated regularly.
            </li>
            <li>
              <strong>Unequal costs.</strong> An unsupported code risks a compliance problem;
              a missed code loses revenue; a wrong specificity may cause a denial.
            </li>
          </ul>
          <DiagramReference lesson="billing-decompose" panel={1} />
        </>
      ),
    },
    {
      id: "options",
      title: "Is fine-tuning the right tool?",
      body: (
        <>
          <p>
            Compare the options honestly. The customer&apos;s instinct may be right, but we should
            know why.
          </p>
          <Table
            head={["Approach", "How it works here", "Strengths", "Weaknesses"]}
            rows={[
              ["Prompting a general model", "Give the note and ask for codes", "No training; fast to try", "Confident but wrong; no knowledge of this hospital's habits; weak on code specifics"],
              ["Prompting + retrieval of code descriptions", "Retrieve candidate codes and guidelines, then choose", "Grounds answers in the code set; easy to update yearly", "Retrieval misses; the model still guesses on subtle rules"],
              ["Classical multi-label classifier", "Train on note text features", "Cheap, fast, explainable per-code scores", "Weaker language understanding; needs careful handling of the long tail"],
              ["Fine-tuned language model", "Train a model on notes labelled with codes", "Learns the hospital's note style and coding patterns; can be small and cheap to run", "Needs clean data; retraining as code sets change; harder to audit; risk of memorising patient data"],
              ["Hybrid", "Retrieve candidates, then a fine-tuned or classical ranker picks and scores them", "Combines coverage with learned judgment; keeps rules in code", "More components to build and maintain"],
            ]}
          />
          <p>
            A reasonable hypothesis: <strong>a hybrid, with a fine-tuned or classical model for ranking
            candidate codes and rules enforced in code</strong>. Fine-tuning is likely part of the
            answer because the customer has abundant, hospital-specific labelled data and the task is
            narrow and repetitive, which is the sweet spot for tuning. But it should be proven
            against simpler baselines first.
          </p>

          <DiagramReference lesson="billing-decompose" panel={2} />
        </>
      ),
    },
    {
      id: "data",
      title: "Data, privacy and metrics",
      body: (
        <>
          <p>
            Five years of coded notes sound like a gift. Interrogate it:
          </p>
          <DiagramReference lesson="billing-decompose" panel={3} />
          <Table
            head={["Metric", "Why it matters here"]}
            rows={[
              ["Precision per code (and micro-averaged)", "Of codes suggested, how many were right? Low precision creates unsupported-code risk and wastes coder time"],
              ["Recall per code", "Of codes needed, how many were found? Low recall loses revenue"],
              ["F1 (micro and macro)", "Micro weights frequent codes; macro treats rare codes equally and exposes long-tail weakness"],
              ["Acceptance rate by coders", "Share of suggestions accepted without edit; the operational measure of usefulness"],
              ["High-confidence error rate", "Wrong suggestions the model was sure about; the most dangerous kind"],
              ["Coder time per chart", "The business outcome: minutes saved at equal or better accuracy"],
            ]}
          />
          <Exercise
            title="Define the trade-off"
            task={
              <p>
                Compliance prefers never suggesting an unsupported code. Revenue cycle prefers never
                missing a billable code. How do you turn this disagreement into a design decision?
              </p>
            }
          >
            <p>
              Make the trade-off explicit with a <strong>confidence threshold</strong> and an
              <strong> error-cost table</strong>. Estimate the cost of a false positive (audit risk,
              rework) and a false negative (lost revenue) with each team. Then set the threshold per
              code group: high-risk codes get a high threshold and always require coder confirmation;
              low-risk, high-volume codes can be pre-filled at a lower threshold.
            </p>
            <p>
              Suggestions below the threshold are shown as &ldquo;consider&rdquo; hints, not
              pre-filled. This lets compliance veto auto-filling without losing the recall benefit,
              and the thresholds can be tuned later from measured coder behaviour.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "rollout",
      title: "Human in the loop and rollout",
      body: (
        <>
          <p>
            The target is not to replace coders. It is to give them ranked suggestions so they spend
            time on judgment, not typing. Plan three stages:
          </p>
          <DiagramReference lesson="billing-decompose" panel={4} />
          <p>
            Success criteria for moving between stages should be agreed in advance: for example,
            precision on high-risk codes above a threshold, acceptance rate above a target, and no
            increase in audit findings in a sampled review.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Test the customer's proposed technique rather than accepting it; compare prompting, retrieval, classical ML and fine-tuning.",
    "Fine-tuning fits narrow, repetitive behaviour with abundant clean labels; retrieval handles changing knowledge.",
    "Interrogate the data: privacy, label quality, code-set drift, long-tail coverage and leakage-free splits.",
    "Use metrics that reflect unequal error costs, including per-code precision and recall and high-confidence errors.",
    "Keep coders in the loop and roll out shadow, assist, then selective automation with agreed criteria.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "When is fine-tuning most appropriate?",
      options: [
        "When the gap is learned behaviour and you have abundant, clean labelled data",
        "When the model needs the current day's news",
        "When you have no data",
        "When you want to avoid evaluation",
      ],
      answer: 0,
      explain: "Fine-tuning shapes behaviour and patterns. Changing knowledge is better served by retrieval.",
    },
    {
      kind: "mcq",
      q: "Why split data by patient or by time rather than randomly by note?",
      options: [
        "To avoid leakage and measure realistic performance on new patients",
        "To make the dataset smaller",
        "To increase accuracy artificially",
        "Random splits are always best",
      ],
      answer: 0,
      explain: "Notes from the same patient are related, so random splits overstate performance.",
    },
    {
      kind: "mcq",
      q: "Which error is described as most dangerous?",
      options: [
        "A wrong suggestion made with high confidence",
        "A low-confidence suggestion",
        "An abstention",
        "A slow response",
      ],
      answer: 0,
      explain: "Confident errors are likely to be accepted without scrutiny.",
    },
    {
      kind: "mcq",
      q: "Compliance and revenue teams disagree on suggestion strictness. What resolves it?",
      options: [
        "Explicit thresholds per code group based on an agreed error-cost table",
        "Choosing one team's preference silently",
        "Removing the model",
        "Suggesting every possible code",
      ],
      answer: 0,
      explain: "Make the trade-off visible and tunable instead of implicit.",
    },
    {
      kind: "text",
      q: "Which averaging of F1 treats every code equally and so exposes long-tail weakness? (one word)",
      format: "*****",
      accept: ["macro", "macro-averaged", "macro f1"],
      explain: "Macro averaging gives rare codes the same weight as frequent ones.",
    },
  ],
};
