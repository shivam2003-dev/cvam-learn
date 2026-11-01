import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain DAGs, tasks and Airflow's main components",
    "Write a retraining DAG with the TaskFlow API",
    "Set retries, catchup and pools with their costs in mind",
    "Run heavy training outside Airflow's own workers",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Your retraining flow began as three cron jobs: extract at 1:00, train at 2:00, deploy at
            6:00. One night the extract ran late. Training started anyway on stale data, and a worse
            model shipped. Nobody was told, because each cron job knew nothing about the others.
          </p>
          <p>
            An <strong>orchestrator</strong> runs steps in the right order, waits for each one to
            finish, retries failures and shows you what happened. <strong>Apache Airflow</strong>{" "}
            is one of the most widely used. Think of an airport's air traffic control. It doesn't
            fly any planes. It decides what goes when, keeps them from colliding, and knows where
            each one is.
          </p>
          <p>
            That analogy holds for good practice too: Airflow should coordinate work, not do the
            heavy lifting itself. Spark clusters and GPU pods do the work, and Airflow tracks them.
          </p>
        </>
      ),
    },
    {
      id: "concepts",
      title: "DAGs and components",
      body: (
        <>
          <p>
            A <strong>DAG</strong> (directed acyclic graph) is a set of tasks joined by
            dependencies. Directed means each link has a direction. Acyclic means there are no
            loops, so the flow always ends. In Airflow, you define a DAG in a Python file. Each
            scheduled execution is a <strong>DAG run</strong>.
          </p>
          <Table
            head={["Component", "Job"]}
            rows={[
              ["Scheduler", "Decides which tasks are ready and queues them"],
              ["DAG processor", "Parses your Python files into DAG definitions"],
              ["Executor", "Sets how and where tasks run, such as Celery or Kubernetes"],
              ["Workers", "Run the tasks"],
              ["Metadata database", "Stores runs, states and history"],
              ["Web UI", "Shows run history, logs and task status"],
            ]}
          />
          <Callout tone="warn">
            The processor parses DAG files again and again. Code at the top level of a file, such
            as a database query or a slow import, runs on each parse and can slow down the whole
            system. Keep that work inside tasks.
          </Callout>
        </>
      ),
    },
    {
      id: "dag",
      title: "A retraining DAG",
      body: (
        <>
          <p>
            The <strong>TaskFlow API</strong> turns Python functions into tasks with decorators.
            This DAG builds a data snapshot, validates it, trains, and registers the model only if
            it beats production. It uses Airflow 3 imports. On Airflow 2, import from{" "}
            <code>airflow.decorators</code> instead.
          </p>
          <pre>
            <code>{`from datetime import datetime, timedelta

from airflow.sdk import dag, task

@dag(
    schedule="0 3 * * *",            # every day at 03:00 UTC
    start_date=datetime(2026, 1, 1),
    catchup=False,
    max_active_runs=1,
    default_args={"retries": 2, "retry_delay": timedelta(minutes=10)},
    tags=["ml", "churn"],
)
def churn_retrain():

    @task
    def build_snapshot(ds=None) -> str:
        path = f"s3://lake/training/churn/ds={ds}/"
        write_training_snapshot(ds, path)
        return path

    @task
    def validate(path: str) -> str:
        check_row_counts_and_nulls(path)  # raises an error on failure
        return path

    @task
    def train(path: str) -> str:
        return run_training(path)         # returns an MLflow run ID

    @task.short_circuit
    def beats_production(run_id: str) -> bool:
        return new_auc(run_id) > production_auc()

    @task
    def register(run_id: str) -> None:
        register_model(run_id)

    run_id = train(validate(build_snapshot()))
    beats_production(run_id) >> register(run_id)

churn_retrain()`}</code>
          </pre>
          <p>
            Calling one task with another's output sets the dependency. <code>{">>"}</code> sets one
            explicitly. If <code>validate</code> raises an error, later tasks don't run, and if{" "}
            <code>beats_production</code> returns False, <code>register</code> is skipped.
            That's the failure from the opening story, handled.
          </p>
          <p>
            Return values travel through <strong>XCom</strong>, a small message store in the
            metadata database. Pass references like paths and run IDs, never datasets. A DataFrame
            in XCom bloats the database that the whole system depends on.
          </p>
          <p>
            Test without the scheduler by running{" "}
            <code>airflow dags test churn_retrain 2026-03-14</code>, or one task with{" "}
            <code>airflow tasks test churn_retrain validate 2026-03-14</code>.
          </p>
          <Callout tone="warn" title="Check what the date means">
            <code>ds</code> is the run's logical date, and its meaning varies. By default in
            Airflow 2, a daily run carries the start of the period it covers, so the run that
            fires on 15 March has <code>ds</code> of 14 March. Airflow 3 changed the default for
            cron schedules so that the logical date is the time of the trigger. Print it once in a
            test run before relying on it, or a feature job can silently use the wrong day.
          </Callout>
        </>
      ),
    },
    {
      id: "reliability",
      title: "Retries, catchup and pools",
      body: (
        <>
          <p>
            <strong>Retries</strong> absorb temporary failures. They also affect your timing. Each
            retry is another full attempt, so:
          </p>
          <Formula>worst case = (retries + 1) × task time + retries × retry delay</Formula>
          <p>
            With a 30-minute task, 2 retries and a 10-minute delay, that's 3 × 30 + 2 × 10 = 110
            minutes before the task finally fails. If a downstream deadline is 90 minutes away,
            your alert will arrive too late. Airflow can also call a function on failure through{" "}
            <code>on_failure_callback</code>, which is a common way to page someone.
          </p>
          <p>
            Retries are only safe if your tasks are idempotent, as covered in the Data Pipelines
            lesson. Overwrite outputs at a path keyed by date, as <code>build_snapshot</code> does.
          </p>
          <p>
            <strong>Catchup</strong> decides what happens to missed runs. With{" "}
            <code>catchup=True</code>, Airflow creates a run for each schedule since{" "}
            <code>start_date</code> that hasn't run yet. That's useful for a data pipeline that
            fills daily partitions. For retraining, it's a trap: turning on a DAG with a start date
            90 days ago could queue 90 training runs. Use <code>catchup=False</code> there, and
            start backfills on purpose.
          </p>
          <p>
            <strong>Pools</strong> limit how many tasks can use a shared resource. If you have 4
            GPUs, create a pool with <code>airflow pools set gpu 4 "GPU slots"</code> and pass{" "}
            <code>pool="gpu"</code> to those tasks. Ten 1-hour training tasks then need 3 rounds (4
            + 4 + 2), or about 3 hours, with no fight over GPUs.
          </p>
        </>
      ),
    },
    {
      id: "heavy-work",
      title: "Send heavy work elsewhere",
      body: (
        <>
          <p>
            Running training inside an Airflow worker is a bad fit. Workers share Python
            dependencies, and they usually don't have GPUs. A common pattern is to start a container
            on Kubernetes for each heavy step:
          </p>
          <pre>
            <code>{`from airflow.providers.cncf.kubernetes.operators.pod import KubernetesPodOperator
from kubernetes.client import models as k8s

train = KubernetesPodOperator(
    task_id="train",
    name="churn-train",
    namespace="ml",
    image="registry.acme.io/churn-train:1.4.2",
    arguments=["--snapshot", "{{ ti.xcom_pull(task_ids='validate') }}"],
    container_resources=k8s.V1ResourceRequirements(
        limits={"nvidia.com/gpu": "1"},
    ),
    pool="gpu",
)`}</code>
          </pre>
          <p>
            An <strong>operator</strong> is a template for one kind of task, and provider packages
            add them for Spark, cloud services and more. Now each step has its own image, its
            exact dependencies and its own GPU. Airflow only waits and records the result.
          </p>
          <Table
            head={["Good fit", "Weaker fit"]}
            rows={[
              ["Scheduled batch pipelines", "Sub-second event processing"],
              ["Workflows across many systems", "Streaming (use Flink or similar)"],
              ["Daily or hourly retraining", "Passing large data between tasks"],
            ]}
          />
          <Callout tone="tip">
            Treat DAG files as production code. Keep them in Git, and add a CI test that imports
            each one, since a broken import stops that DAG from loading. Airflow can also start a
            DAG when an upstream dataset updates, rather than at a fixed time, through its{" "}
            <strong>Assets</strong> feature (called Datasets in Airflow 2).
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Orchestrators run steps in order, retry failures and show what happened.",
    "A DAG is a set of tasks with dependencies and no loops.",
    "Pass paths and IDs through XCom, never datasets.",
    "Use catchup=False for retraining, and keep tasks idempotent so that retries are safe.",
    "Keep Airflow as the coordinator, and run heavy work on Spark or Kubernetes.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A team stores a 2 GB DataFrame in XCom. What's the problem?",
      options: [
        "XCom only stores integers",
        "It bloats the metadata database, so pass a path instead",
        "Tasks can't return values",
        "It disables retries",
      ],
      answer: 1,
      explain: "XCom is for small references. Store the data in object storage and pass its path.",
    },
    {
      kind: "mcq",
      q: "A retraining DAG with a start date 60 days ago has catchup=True. What happens when you turn it on?",
      options: [
        "It runs once",
        "It deletes old runs",
        "Airflow may queue a run for each missed schedule",
        "It waits until tomorrow",
      ],
      answer: 2,
      explain: "Catchup fills all missed schedules, which is rarely what you want for training.",
    },
    {
      kind: "mcq",
      q: "Why should you avoid database calls at the top level of a DAG file?",
      options: [
        "Python doesn't allow them",
        "They run whenever the file is parsed, which happens repeatedly",
        "They only run once a year",
        "They disable the web UI",
      ],
      answer: 1,
      explain: "Parsing runs often, so top-level work can slow the whole system.",
    },
    {
      kind: "text",
      q: "A task takes 20 minutes and has 3 retries with a 5-minute delay. What is the worst-case time, in minutes, before it finally fails?",
      format: "**",
      accept: ["95", "95 min", "95 minutes"],
      explain: "4 attempts × 20 + 3 delays × 5 = 80 + 15 = 95 minutes.",
    },
    {
      kind: "text",
      q: "What is the three-letter term for the graph of tasks that Airflow runs?",
      format: "***",
      accept: ["dag"],
      explain: "DAG stands for directed acyclic graph.",
    },
  ],
};
