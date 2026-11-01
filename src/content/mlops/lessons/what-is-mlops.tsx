import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Easy",
  objectives: [
    "Explain what MLOps is and the problem it solves",
    "Describe how ML systems differ from ordinary software",
    "Walk through the ML lifecycle and its automation levels",
  ],
  tasks: [
    {
      id: "gap",
      title: "The gap between a notebook and a product",
      body: (
        <>
          <p>
            A data scientist trains a model in a notebook and it scores well. Everyone is happy.
            Six months later it still isn't in production, or it shipped and nobody knows if it
            still works. This is the most common way ML projects fail, and the model usually
            isn't the reason.
          </p>
          <p>
            <strong>MLOps</strong> is the set of practices that closes this gap. It applies the
            ideas of DevOps, such as automation, testing and monitoring, to machine learning, so
            models get to production reliably and stay healthy once they're there.
          </p>
          <p>
            A well-known Google paper made the point with a diagram: in a real ML system, the
            model code is a small box surrounded by much larger boxes of data collection,
            feature extraction, serving infrastructure and monitoring. MLOps is about all of the
            boxes.
          </p>
        </>
      ),
    },
    {
      id: "different",
      title: "Why ML is harder than normal software",
      body: (
        <>
          <p>
            A traditional program's behavior comes from its code. An ML system's behavior comes
            from code, data and a trained model. All three can change, and each change can break
            things.
          </p>
          <Table
            head={["", "Traditional software", "ML system"]}
            rows={[
              ["What you version", "Code", "Code, data and models"],
              ["How it fails", "Usually loudly: errors, crashes", "Often silently: bad predictions"],
              ["Testing", "Is the logic correct?", "Also: is the data valid, is the model good?"],
              ["After launch", "Stable until you change it", "Decays as the world changes"],
              ["Team", "Software engineers", "Data, ML and platform engineers"],
            ]}
          />
          <Callout tone="warn" title="Silent failure">
            When user behavior shifts, a model keeps returning confident answers that are
            increasingly wrong. No error appears on any dashboard unless you built something to
            catch it. That's why monitoring is central to MLOps.
          </Callout>
        </>
      ),
    },
    {
      id: "lifecycle",
      title: "The ML lifecycle",
      body: (
        <>
          <p>An ML system moves through a loop rather than a straight line:</p>
          <ol>
            <li><strong>Collect and prepare data.</strong> Ingest, validate and clean it.</li>
            <li><strong>Train and experiment.</strong> Try features and models, and track each run.</li>
            <li><strong>Validate.</strong> Check quality, fairness and performance against a baseline.</li>
            <li><strong>Deploy.</strong> Package the model and release it safely.</li>
            <li><strong>Monitor.</strong> Watch data, predictions and business outcomes.</li>
            <li><strong>Retrain.</strong> New data or decay sends you back to the start.</li>
          </ol>
        </>
      ),
    },
    {
      id: "maturity",
      title: "How automated are you?",
      body: (
        <>
          <p>A common way to describe maturity has three levels:</p>
          <Table
            head={["Level", "How it works", "Signs"]}
            rows={[
              ["0: Manual", "Notebooks and hand-offs", "Rare releases, no monitoring"],
              ["1: Pipeline automation", "Training runs as an automated pipeline", "Retraining happens on a schedule or trigger"],
              ["2: CI/CD for pipelines", "Pipeline code itself is tested and deployed automatically", "Frequent, safe changes"],
            ]}
          />
          <Callout tone="tip">
            Don't try to jump straight to level 2. Start by making one model reproducible, then
            automate one step at a time. This path follows the same order.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "MLOps applies DevOps ideas to machine learning systems.",
    "ML behavior depends on code, data and models, so all three need versioning.",
    "Models often fail silently, which makes monitoring essential.",
    "The ML lifecycle is a loop, ending in retraining.",
    "Mature teams automate pipelines, then automate changes to the pipelines.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What makes ML systems different from traditional software?",
      options: [
        "They can't be tested",
        "Behavior depends on data and models as well as code",
        "They never need deployment",
        "They only run in notebooks",
      ],
      answer: 1,
      explain: "Code, data and model all shape behavior, and any of them can change.",
    },
    {
      kind: "mcq",
      q: "A model's accuracy slowly falls with no errors logged. What's the likely cause?",
      options: ["A syntax error", "A silent decay as real-world data shifts", "An expired domain", "A missing README"],
      answer: 1,
      explain: "Model decay shows no errors, so you need monitoring to detect it.",
    },
    {
      kind: "text",
      q: "Which step in the lifecycle comes after Monitor and closes the loop?",
      format: "*******",
      accept: ["retrain", "retraining"],
      explain: "Monitoring reveals decay, and retraining restores the model.",
    },
  ],
};
