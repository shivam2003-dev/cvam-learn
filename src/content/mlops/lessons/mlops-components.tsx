import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Easy",
  objectives: [
    "Name the building blocks of an MLOps platform",
    "Explain what problem each one solves",
    "Decide what to set up first on a small team",
  ],
  tasks: [
    {
      id: "map",
      title: "The parts of the platform",
      body: (
        <>
          <p>
            An MLOps platform is a set of connected tools. Each solves one question that gets
            painful as a team grows.
          </p>
          <Table
            head={["Component", "Question it answers", "Common tools"]}
            rows={[
              ["Version control", "What changed, and who changed it?", "Git, DVC"],
              ["CI/CD", "Is this safe to release?", "GitHub Actions, Jenkins"],
              ["Orchestration", "What runs next, and what if it fails?", "Airflow, Kubeflow"],
              ["Experiment tracking", "Which run gave the best result?", "MLflow"],
              ["Data lineage", "Where did this data come from?", "Catalog and lineage tools"],
              ["Training & serving", "How do models get trained and exposed?", "Kubernetes, cloud platforms"],
              ["Monitoring", "Is it still working?", "Prometheus, Grafana"],
            ]}
          />
        </>
      ),
    },
    {
      id: "flow",
      title: "How they connect",
      body: (
        <>
          <p>Follow one change through the system:</p>
          <ol>
            <li>An engineer pushes a change to the training code, tracked in version control.</li>
            <li>CI runs tests and validates the data.</li>
            <li>The orchestrator runs the training pipeline.</li>
            <li>Experiment tracking records metrics and saves the model.</li>
            <li>CD deploys it, if it beats the current model.</li>
            <li>Monitoring watches it live, and an alert can trigger retraining.</li>
          </ol>
          <p>
            Lineage ties this together, so you can trace any prediction back through the model to
            its data.
          </p>
        </>
      ),
    },
    {
      id: "registry",
      title: "Two pieces people forget",
      body: (
        <>
          <p>
            A <strong>model registry</strong> is the catalog of trained models, with versions and
            stages such as staging and production. It stops "final_model_v3_really_final.pkl" from
            living on someone's laptop.
          </p>
          <p>
            A <strong>feature store</strong> keeps feature definitions in one place, so training and
            serving compute them the same way. A mismatch between the two is called{" "}
            <strong>training-serving skew</strong>, and it's a classic source of silent bugs.
          </p>
        </>
      ),
    },
    {
      id: "start",
      title: "What to set up first",
      body: (
        <>
          <p>You don't need all of this on day one. A sensible order for a small team:</p>
          <ol>
            <li>Git for code, plus data versioning</li>
            <li>Experiment tracking</li>
            <li>A simple CI pipeline with data checks</li>
            <li>Containerized, repeatable deployment</li>
            <li>Monitoring</li>
            <li>Orchestration and automated retraining, when manual runs start to hurt</li>
          </ol>
          <Callout tone="warn">
            Avoid adopting a giant platform before you have a model in production. Tooling should
            solve a problem you're feeling, not one you expect to have.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Each MLOps component answers one operational question.",
    "A change flows from version control through CI, training, deployment and monitoring.",
    "Model registries and feature stores keep models and features organized.",
    "Training-serving skew causes silent bugs.",
    "Add tooling gradually, as real problems appear.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which component tells you which run gave the best result?",
      options: ["Orchestration", "Experiment tracking", "Load balancer", "Data lake"],
      answer: 1,
      explain: "Tools like MLflow record each run's parameters and metrics.",
    },
    {
      kind: "mcq",
      q: "What's the main problem a feature store solves?",
      options: [
        "Slow websites",
        "Training and serving computing features differently",
        "Git merge conflicts",
        "GPU cooling",
      ],
      answer: 1,
      explain: "Shared definitions prevent training-serving skew.",
    },
    {
      kind: "text",
      q: "What is the catalog of versioned, trained models called? Two words.",
      format: "***** ********",
      accept: ["model registry"],
      explain: "A model registry tracks model versions and their release stages.",
    },
  ],
};
