import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 15,
  difficulty: "Hard",
  objectives: [
    "Describe what Kubeflow contains and how Kubeflow Pipelines runs",
    "Build a pipeline from components with typed artifacts",
    "Use caching without training on stale data",
    "Choose between Kubeflow and Airflow, and debug a stuck step",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Your data scientists have a training script that works on a laptop. Moving it to a
            shared cluster raises many questions. How does each step get the right libraries and a
            GPU? Where do outputs go? Can a teammate rerun last Tuesday's experiment? Why rerun a
            40-minute data step when only one parameter changed?
          </p>
          <p>
            <strong>Kubeflow</strong> is a set of open source tools for running ML on Kubernetes.
            Its best-known part, <strong>Kubeflow Pipelines</strong> (KFP), turns an ML workflow
            into a graph of containers. Think of a professional kitchen. Each station has its own
            tools and passes a labeled dish to the next one. The head chef's ticket records exactly
            what was made, and a sauce that's already prepared isn't cooked again.
          </p>
          <p>
            It assumes you already have Kubernetes, the system that schedules containers across
            machines. A <strong>pod</strong> is its basic unit: one or more containers running
            together.
          </p>
          <Table
            head={["Part", "What it does"]}
            rows={[
              ["Kubeflow Pipelines", "Defines, runs and tracks ML workflows"],
              ["Notebooks", "Hosted notebook servers on the cluster"],
              ["Katib", "Hyperparameter tuning"],
              ["Kubeflow Trainer", "Distributed training jobs, such as multi-GPU PyTorch"],
              ["Model Registry", "Tracks model versions and their metadata"],
              ["KServe", "Model serving, which is often used alongside Kubeflow"],
            ]}
          />
          <p>
            You don't have to install everything. KFP can be deployed on its own, and that's a
            sensible starting point.
          </p>
        </>
      ),
    },
    {
      id: "pipeline",
      title: "Writing a pipeline",
      body: (
        <>
          <p>
            A <strong>component</strong> is one step: a function that runs in its own container.
            A <strong>pipeline</strong> wires components together. Inputs and outputs have types.
            Plain values such as strings are <strong>parameters</strong>. Files such as datasets
            and models are <strong>artifacts</strong>, stored in object storage, and KFP gives your
            code a local path for each one.
          </p>
          <pre>
            <code>{`from kfp import compiler, dsl
from kfp.dsl import Dataset, Input, Metrics, Model, Output

@dsl.component(
    base_image="python:3.11",
    packages_to_install=["pandas", "pyarrow", "s3fs"],
)
def prepare(source_uri: str, train_set: Output[Dataset]):
    import pandas as pd

    df = pd.read_parquet(source_uri)
    df.dropna().to_parquet(train_set.path)

@dsl.component(
    base_image="python:3.11",
    packages_to_install=["pandas", "pyarrow", "scikit-learn", "joblib"],
)
def train(
    train_set: Input[Dataset],
    n_estimators: int,
    model: Output[Model],
    metrics: Output[Metrics],
):
    import joblib
    import pandas as pd
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.metrics import roc_auc_score
    from sklearn.model_selection import train_test_split

    df = pd.read_parquet(train_set.path)
    X, y = df.drop(columns="churned"), df["churned"]
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)

    clf = RandomForestClassifier(n_estimators=n_estimators).fit(X_tr, y_tr)
    auc = roc_auc_score(y_te, clf.predict_proba(X_te)[:, 1])

    metrics.log_metric("auc", auc)
    joblib.dump(clf, model.path)

@dsl.pipeline(name="churn-training")
def churn_pipeline(source_uri: str, n_estimators: int = 200):
    data = prepare(source_uri=source_uri)
    step = train(train_set=data.outputs["train_set"], n_estimators=n_estimators)
    step.set_cpu_limit("4").set_memory_limit("16G")

compiler.Compiler().compile(churn_pipeline, "churn_pipeline.yaml")`}</code>
          </pre>
          <p>
            A GPU step would add{" "}
            <code>.set_accelerator_type("nvidia.com/gpu").set_accelerator_limit(1)</code>.
            Compiling produces a YAML file, a portable definition you can keep in Git and promote
            between environments. To run it:
          </p>
          <pre>
            <code>{`from kfp import Client

client = Client(host="http://localhost:8080")  # e.g. through a port-forward
client.create_run_from_pipeline_package(
    "churn_pipeline.yaml",
    arguments={"source_uri": "s3://lake/training/churn/ds=2026-03-14/"},
    experiment_name="churn",
)`}</code>
          </pre>
          <p>
            Each step becomes a pod, and on most installs Argo Workflows runs the graph. KFP
            records every run's parameters, artifacts and metrics, and that lineage lets you trace
            a model back to the dataset that produced it.
          </p>
          <Callout tone="tip">
            <code>packages_to_install</code> is handy for learning, but it installs packages when
            each step starts, which is slow and may change over time. For production, build an
            image with pinned versions, and set <code>base_image</code> to its exact tag.
          </Callout>
        </>
      ),
    },
    {
      id: "caching",
      title: "Caching",
      body: (
        <>
          <p>
            If a step's definition and inputs match a past successful run, KFP can reuse the
            earlier outputs and skip the step. Caching is on by default. It's what makes
            hyperparameter sweeps affordable.
          </p>
          <p>
            Here's an illustrative pipeline: prepare takes 40 minutes, train 60 and evaluate 10.
            You run it with 5 values of <code>n_estimators</code>. Prepare's inputs don't change,
            so only the first run does that work.
          </p>
          <Formula>total = first full run + (runs − 1) × uncached time</Formula>
          <pre>
            <code>{`Without caching:  5 × 110             = 550 minutes
With caching:     110 + 4 × (60 + 10) = 390 minutes
Saved:            550 − 390           = 160 minutes`}</code>
          </pre>
          <Callout tone="warn">
            Caching compares the inputs you pass, not the contents behind them. If your pipeline
            reads <code>s3://lake/churn/latest/</code> and the files there change, the URI is the
            same, so KFP may reuse last week's output. You'd train on stale data with no error.
            Put a date or version in the URI, as in the example above, or disable caching for that
            step with <code>data.set_caching_options(False)</code>.
          </Callout>
        </>
      ),
    },
    {
      id: "operations",
      title: "Running it for real",
      body: (
        <>
          <p>
            Most KFP problems are Kubernetes problems. A common one is a step that never starts.
            Check its pod:
          </p>
          <pre>
            <code>{`kubectl get pods -n kubeflow
kubectl describe pod <pod-name> -n kubeflow   # read the Events section
kubectl logs <pod-name> -n kubeflow`}</code>
          </pre>
          <Table
            head={["Pod status", "Usual cause"]}
            rows={[
              ["Pending", "No node has the free GPUs, CPU or memory requested"],
              ["ImagePullBackOff", "Wrong image tag, or missing registry credentials"],
              ["OOMKilled", "The container exceeded its memory limit"],
              ["CrashLoopBackOff or Error", "Your code failed, so read the logs"],
            ]}
          />
          <p>
            GPU capacity limits parallel runs. Say you have 3 nodes with 4 GPUs each, so 12 GPUs.
            A sweep starts 8 runs that need 2 GPUs each, 16 in total. Only 12 ÷ 2 = 6 can run at
            once, and the other 2 stay Pending until GPUs free up. Pods can only request GPUs if
            the nodes run the NVIDIA device plugin, so check that first when no GPU pod ever
            schedules.
          </p>
          <p>Now for the choice most teams face:</p>
          <Table
            head={["", "Airflow", "Kubeflow Pipelines"]}
            rows={[
              ["Built for", "General workflow scheduling", "ML workflows on Kubernetes"],
              ["Each step", "A task, in many possible runtimes", "A container in a pod"],
              ["Artifacts and lineage", "You add them yourself", "Built in"],
              ["Caching", "You build it yourself", "Built in"],
              ["Needs Kubernetes", "No", "Yes"],
            ]}
          />
          <p>
            They can work together. Airflow can own the company-wide data schedule and trigger a
            KFP run when features are ready, while KFP handles the ML steps.
          </p>
          <Callout tone="warn">
            Kubeflow is a platform, not a library. A full install brings many services to upgrade
            and secure, and you need Kubernetes skills on the team. If a few scheduled training
            jobs are all you run, a simpler tool may serve you better. Managed services based on
            KFP, such as Google's Vertex AI Pipelines, remove some of that work.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Kubeflow is a set of ML tools for Kubernetes, and you can adopt Pipelines alone.",
    "Each component runs in its own container, with typed parameters and artifacts.",
    "Caching skips unchanged steps, but it compares input values, not the data behind a URI.",
    "Debug stuck steps with kubectl. Pending usually means there aren't enough resources.",
    "Airflow suits general scheduling, KFP suits ML lineage, and they can work together.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "How does each step of a Kubeflow pipeline run?",
      options: [
        "As a thread in one Python process",
        "As a container in a Kubernetes pod",
        "As a SQL query",
        "On the data scientist's laptop",
      ],
      answer: 1,
      explain: "Isolating steps in containers gives each one its own dependencies and resources.",
    },
    {
      kind: "mcq",
      q: "A pipeline reads from a fixed path whose files are replaced weekly. Caching is on. What's the risk?",
      options: [
        "The step fails with an error",
        "The pipeline can't compile",
        "KFP reuses an old result, so the model trains on stale data",
        "All the GPUs are released",
      ],
      answer: 2,
      explain: "The input string is unchanged, so the cache matches. Put a date or version in the URI.",
    },
    {
      kind: "mcq",
      q: "In KFP, what is a trained model file passed between steps?",
      options: ["A parameter", "An artifact", "A label", "A namespace"],
      answer: 1,
      explain: "Files are artifacts, stored in object storage. Parameters are small plain values.",
    },
    {
      kind: "text",
      q: "Prepare takes 30 minutes and train takes 50. You do 4 runs with new hyperparameters, and prepare is cached after the first. What's the total, in minutes?",
      format: "***",
      accept: ["230", "230 min", "230 minutes"],
      explain: "80 + 3 × 50 = 230 minutes.",
    },
    {
      kind: "text",
      q: "A GPU pod can't be scheduled because no node has a free GPU. What status does it show?",
      format: "*******",
      accept: ["pending"],
      explain: "Pending means the pod is waiting. kubectl describe pod shows why.",
    },
  ],
};
