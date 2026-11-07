import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Design a hybrid system: candidate generation, a fine-tuned ranker and rule validation",
    "Plan the training pipeline: data preparation, de-identification, tuning and evaluation",
    "Choose a fine-tuning method and model size with cost and update cadence in mind",
    "Design deployment, monitoring, retraining triggers and audit trail",
    "Handle yearly code set changes and drift without breaking the service",
  ],
  tasks: [
    {
      id: "arch",
      title: "System architecture",
      body: (
        <>
          <p>
            The decomposition pointed to a hybrid. Candidate generation limits the space; a fine-tuned
            model scores candidates in the context of the note; rules check validity; coders decide.
          </p>
          <DiagramReference lesson="billing-design" panel={1} />
          <ul>
            <li>
              <strong>Evidence spans.</strong> For each suggested code the workbench highlights the
              sentences in the note that support it. Coders verify in seconds, and auditors see the
              basis.
            </li>
            <li>
              <strong>Everything stays inside the secure environment.</strong> No note text is sent to
              an external service.
            </li>
            <li>
              <strong>Code sets are data,</strong> not model weights, so a yearly update is a data
              release.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "training",
      title: "The training pipeline",
      body: (
        <>
          <DiagramReference lesson="billing-design" panel={2} />
          <Table
            head={["Decision", "Options", "Recommendation and reason"]}
            rows={[
              ["Base model", "Large general model; small open model; domain-pretrained clinical model", "Start with a small or mid-size model, possibly domain-pretrained: lower cost and latency, can run inside the hospital, enough capacity for a narrow task"],
              ["Tuning method", "Full fine-tune; parameter-efficient (adapters or LoRA-style)", "Parameter-efficient tuning: cheaper, faster to retrain, smaller artefacts per version"],
              ["Formulation", "Generate codes as text; score candidate codes (ranking)", "Score candidates: constrained to valid codes, calibratable confidence, easier to audit"],
              ["Long tail", "Ignore rare codes; hierarchical codes; retrieval for rare ones", "Use code hierarchy and retrieval of definitions for rare codes; leave the rarest to coders"],
              ["Baselines", "Prompted model; classical classifier", "Always build both first; the tuned model must clearly beat them to justify its cost"],
              ["Calibration", "Raw scores; calibrated probabilities", "Calibrate on validation data so 90% confidence really means about 90% correct"],
            ]}
          />
          <Callout tone="warn" title="Memorisation and privacy">
            Models can memorise rare training text. Use de-identified data where possible, restrict
            model access as you would the data, test for memorisation, and never expose raw model
            outputs outside the secured environment.
          </Callout>
        </>
      ),
    },
    {
      id: "eval",
      title: "Evaluation that matches the business",
      body: (
        <>
          <DiagramReference lesson="billing-design" panel={3} />
          <p>
            Report per-slice results to the customer, not only an average. A model that is excellent
            overall but poor on, say, oncology notes needs a different rollout plan for that
            specialty.
          </p>
        </>
      ),
    },
    {
      id: "ops",
      title: "Deployment, drift and yearly updates",
      body: (
        <>
          <DiagramReference lesson="billing-design" panel={4} />
          <ul>
            <li><strong>Version everything:</strong> model, code set, rules, prompts and thresholds, and log the versions used for every suggestion.</li>
            <li><strong>Monitor:</strong> acceptance rate by code group, share of low-confidence suggestions, distribution of note types, denial rate. Sudden shifts trigger review.</li>
            <li><strong>Retrain triggers:</strong> a fixed schedule, a drop in acceptance or precision beyond a threshold, or a new specialty or template.</li>
            <li><strong>Rollback:</strong> keep the previous model and rules deployable in minutes.</li>
            <li><strong>Feedback loop:</strong> coder edits are valuable labels; capture them, review for quality, and feed them back, never training automatically on unreviewed corrections.</li>
          </ul>
          <Exercise
            title="The model drifted"
            task={
              <p>
                Three months after launch, acceptance of suggestions in the cardiology clinic falls
                from 82% to 61%. Overall accuracy on the held-out set is unchanged. What do you
                investigate?
              </p>
            }
          >
            <ol>
              <li><strong>What changed in cardiology:</strong> a new note template, a new EHR field order, a new procedure or device, or a new coding guideline.</li>
              <li><strong>Slice metrics:</strong> compare precision and recall for cardiology codes on recent charts against the held-out set, which predates the change and so cannot reveal it.</li>
              <li><strong>Coder feedback:</strong> sample rejected suggestions with coders to see the pattern.</li>
            </ol>
            <p>
              The unchanged held-out score is the clue: the evaluation set no longer represents
              current data. Refresh it with recent, labelled cardiology charts, and then adjust
              preprocessing, thresholds or retrain on the new pattern.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Use a hybrid: candidate generation, a fine-tuned ranker, rule validation and coder review, with code sets kept as data.",
    "Training pipeline gates: label cleaning, de-identification, leakage-free splits, tuning, sliced evaluation and sign-off.",
    "Prefer a small or mid-size model with parameter-efficient tuning, scored against candidates and calibrated.",
    "Evaluate against baselines, by slice, with coder studies and business outcomes, not only an average score.",
    "Version everything, monitor drift, plan yearly updates and keep a rollback.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why keep the code set and rules as data instead of baking them into the model?",
      options: [
        "A yearly update becomes a data release rather than a full retraining",
        "Models cannot store codes",
        "It is cheaper to forget them",
        "It avoids evaluation",
      ],
      answer: 0,
      explain: "Separating changing knowledge from learned behaviour makes updates fast and auditable.",
    },
    {
      kind: "mcq",
      q: "Why show evidence spans beside each suggested code?",
      options: [
        "Coders verify quickly and auditors can see the basis for each code",
        "To lengthen the screen",
        "To avoid logging",
        "To hide the model",
      ],
      answer: 0,
      explain: "Evidence builds trust, speeds review and supports audit.",
    },
    {
      kind: "mcq",
      q: "Acceptance falls in one clinic while the held-out score is unchanged. What is the likely explanation?",
      options: [
        "The held-out set predates a change in that clinic's data, so it no longer represents current notes",
        "The held-out set is always wrong",
        "Coders dislike all models",
        "The network is slow",
      ],
      answer: 0,
      explain: "Stale evaluation data can hide drift; refresh it with recent labelled examples.",
    },
    {
      kind: "mcq",
      q: "Why prefer parameter-efficient tuning here?",
      options: [
        "Cheaper and faster retraining with small artefacts per version",
        "It needs no data",
        "It guarantees correctness",
        "It removes privacy concerns",
      ],
      answer: 0,
      explain: "Yearly and drift-triggered retraining are easier and cheaper with adapter-style tuning.",
    },
    {
      kind: "text",
      q: "A model that says '90% confident' is right about 90% of the time. What property is this? (one word)",
      format: "***********",
      accept: ["calibration", "calibrated"],
      explain: "Calibration means stated confidence matches observed accuracy.",
    },
  ],
};
