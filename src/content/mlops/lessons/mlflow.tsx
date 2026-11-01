import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Log parameters, metrics and models to an MLflow experiment",
    "Describe the parts of a shared MLflow server",
    "Promote and roll back models with the Model Registry and aliases",
    "Estimate artifact storage and plan cleanup",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem MLflow solves",
      body: (
        <>
          <p>
            A team runs hundreds of experiments. Results live in notebooks, spreadsheets and files
            named <code>model_final_v3_really.pkl</code>. Then someone asks which data trained the
            live model, and nobody can say.
          </p>
          <p>
            <strong>MLflow</strong> is an open-source platform for managing the ML lifecycle. Think
            of it as two things joined together: a lab notebook that writes itself, and a release
            catalog that says which model is approved for use.
          </p>
          <Table
            head={["Part", "What it does"]}
            rows={[
              ["Tracking", "Records each training run and its results"],
              ["Models", "A standard package format for a model and its environment"],
              ["Model Registry", "Named models with versions, aliases and tags"],
            ]}
          />
          <p>A few terms before the code:</p>
          <ul>
            <li><strong>Experiment:</strong> a group of related runs, usually for one problem.</li>
            <li><strong>Run:</strong> one execution of training code.</li>
            <li><strong>Parameter:</strong> an input setting, such as tree depth.</li>
            <li><strong>Metric:</strong> a measured result, such as F1. It can have many values over time.</li>
            <li><strong>Artifact:</strong> an output file, such as a model or a plot.</li>
          </ul>
        </>
      ),
    },
    {
      id: "tracking",
      title: "Tracking a run",
      body: (
        <>
          <pre>
            <code>{`import mlflow
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score

mlflow.set_tracking_uri("http://mlflow.internal:5000")
mlflow.set_experiment("fraud-detection")

params = {"n_estimators": 200, "max_depth": 8}

with mlflow.start_run():
    mlflow.log_params(params)
    mlflow.set_tag("git_commit", git_sha)
    mlflow.set_tag("data_version", data_version)

    model = RandomForestClassifier(**params, random_state=42)
    model.fit(X_train, y_train)

    mlflow.log_metric("f1", f1_score(y_test, model.predict(X_test)))

    mlflow.sklearn.log_model(
        model,
        "model",
        input_example=X_train[:5],
        registered_model_name="fraud-detector",
    )`}</code>
          </pre>
          <p>
            The two tags are the most valuable lines for you. MLflow can't know your data version
            unless you tell it. With both tags, every model traces back to its exact code and data.
          </p>
          <p>
            <code>input_example</code> stores a sample input, and MLflow infers a{" "}
            <strong>signature</strong> from it, which records the expected inputs and outputs. For
            popular libraries, <code>mlflow.sklearn.autolog()</code> and similar calls capture much
            of this for you.
          </p>
          <p>You can also query runs from code, which helps in pipelines:</p>
          <pre>
            <code>{`runs = mlflow.search_runs(
    experiment_names=["fraud-detection"],
    filter_string="metrics.f1 > 0.8",
    order_by=["metrics.f1 DESC"],
    max_results=5,
)`}</code>
          </pre>
          <Callout tone="tip">
            Wrap this in a small shared helper that sets the commit and data tags. Then nobody has
            to remember them, and every run in the company looks the same.
          </Callout>
        </>
      ),
    },
    {
      id: "server",
      title: "Running a shared server",
      body: (
        <>
          <p>
            Out of the box, MLflow writes to the local disk. That's fine for one person. A team
            needs a central server, and this part is usually your job. It has two kinds of storage:
          </p>
          <Table
            head={["Piece", "Stores", "Typical choice"]}
            rows={[
              ["Tracking server", "Serves the API and web UI", "A container on Kubernetes"],
              ["Backend store", "Runs, parameters, metrics, registry data", "PostgreSQL or MySQL"],
              ["Artifact store", "Models and other files", "S3, Azure Blob Storage or Cloud Storage"],
            ]}
          />
          <pre>
            <code>{`mlflow server \\
  --backend-store-uri "postgresql://mlflow:$DB_PASSWORD@db:5432/mlflow" \\
  --artifacts-destination s3://acme-mlflow-artifacts \\
  --host 0.0.0.0 \\
  --port 5000`}</code>
          </pre>
          <p>
            With <code>--artifacts-destination</code>, clients upload files through the server, so
            they need no direct bucket credentials.
          </p>
          <Callout tone="warn">
            Don't expose the server to the internet as it stands. A default install doesn't enforce
            logins, and your models and metrics may be sensitive. Keep it on a private network, and
            put an authenticating proxy in front of it.
          </Callout>
          <p>Artifact storage grows fast, so estimate it. These figures are illustrative:</p>
          <pre>
            <code>{`50 runs per day × 200 MB per run = 10 GB per day
10 GB × 30 days = 300 GB per month
After one year: about 3.6 TB`}</code>
          </pre>
          <p>
            Most runs are failed experiments that nobody will read again. Log full models only when
            they're candidates, and delete old runs on a schedule. Deleted runs are first only
            marked as deleted, and <code>mlflow gc</code> removes them for good.
          </p>
        </>
      ),
    },
    {
      id: "registry",
      title: "The Model Registry",
      body: (
        <>
          <p>
            Tracking records everything. The registry records what matters. Each registered model
            has numbered versions, and each version links back to the run that made it.
          </p>
          <p>
            An <strong>alias</strong> is a movable pointer to a version, such as{" "}
            <code>champion</code>. Serving code asks for the alias rather than a number:
          </p>
          <pre>
            <code>{`import mlflow
from mlflow import MlflowClient

client = MlflowClient()

# Promote version 7
client.set_registered_model_alias("fraud-detector", "champion", 7)

# Serving code loads whatever the alias points to
model = mlflow.pyfunc.load_model("models:/fraud-detector@champion")`}</code>
          </pre>
          <p>
            A rollback becomes a single call: point <code>champion</code> back at version 6, then
            have the service reload the model. The <strong>pyfunc</strong> flavor gives every model
            one <code>predict</code> interface, so serving code needn't know the framework.
          </p>
          <Callout tone="note">
            Older tutorials move models through stages such as Staging and Production. MLflow
            deprecated stages in favor of aliases and tags, so use aliases for new work.
          </Callout>
          <p>MLflow can also serve a model or build it into an image:</p>
          <pre>
            <code>{`mlflow models serve -m "models:/fraud-detector@champion" -p 5001 --env-manager local

mlflow models build-docker -m "models:/fraud-detector/7" -n fraud-detector:7`}</code>
          </pre>
          <p>
            A typical flow: a pipeline trains and registers a new version, evaluation gates compare
            it with the current champion, and on success the pipeline moves the alias or opens a
            pull request. Pin a version number in the image for full traceability. Use an alias
            when you want to swap models without a rebuild.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Tracking records runs, and the registry records which models are approved.",
    "Tag every run with its Git commit and data version.",
    "A team server needs a database for metadata and object storage for artifacts.",
    "Aliases such as champion make promotion and rollback a single step.",
    "Plan for artifact growth, and clean up runs you won't use.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "In MLflow, is max_depth=8 a parameter or a metric, and why?",
      options: [
        "A metric, because it's a number",
        "A parameter, because it's an input setting",
        "An artifact, because it's stored",
        "A tag, because it's a label",
      ],
      answer: 1,
      explain: "Parameters are inputs to a run. Metrics are the results measured from it.",
    },
    {
      kind: "mcq",
      q: "Where should a team's MLflow model files normally live?",
      options: [
        "In the backend database",
        "In an object store such as S3",
        "On one developer's laptop",
        "In Git",
      ],
      answer: 1,
      explain: "The database holds metadata. Large files belong in object storage.",
    },
    {
      kind: "text",
      q: "What movable pointer, such as champion, replaces stages in the Model Registry?",
      format: "*****",
      accept: ["alias", "aliases", "model alias"],
      explain: "An alias points at one model version and can be moved at any time.",
    },
    {
      kind: "text",
      q: "A team logs 20 runs per day at 500 MB per run. How many GB is that per day, where 1 GB is 1,000 MB?",
      format: "**",
      accept: ["10", "10gb", "10 gb"],
      explain: "20 × 500 MB = 10,000 MB, which is 10 GB.",
    },
  ],
};
