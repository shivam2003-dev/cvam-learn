import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain what ML adds to CI/CD and why",
    "Design a pipeline that keeps slow work out of the fast feedback path",
    "Write a quality gate that compares a new model with production",
    "Release a model gradually and roll it back",
  ],
  tasks: [
    {
      id: "problem",
      title: "What changes when data and models are involved",
      body: (
        <>
          <p>
            In ordinary software, the code defines the behavior. If tests pass, you can be fairly
            confident. <strong>Continuous integration</strong> (CI) merges and tests every change.{" "}
            <strong>Continuous delivery</strong> (CD) keeps the result ready to release, automatically.
          </p>
          <p>
            ML breaks that assumption. A model's behavior comes from code <em>and</em> data. All your
            unit tests can pass while the model gets worse. It can even get worse with no change at
            all, because the world moved on. And an ML system ships a large trained artifact, which
            takes hours to produce, not seconds.
          </p>
          <p>
            Think of a bakery. Software CI checks the recipe. ML CI must also check the flour, since
            a perfect recipe with bad flour still gives you bad bread. And you must taste the loaf
            before it leaves the shop.
          </p>
          <Table
            head={["", "Software CI/CD", "ML CI/CD"]}
            rows={[
              ["Changes come from", "Code", "Code, data, parameters and the outside world"],
              ["Tests", "Mostly pass or fail", "Also metrics compared with thresholds"],
              ["Build output", "Binary or image", "Model, plus the image that serves it"],
              ["Build time", "Minutes", "Minutes to many hours"],
              ["Hardware", "Standard runners", "Often GPUs"],
              ["After release", "Watch for errors", "Also watch for silent quality decay"],
            ]}
          />
          <p>
            This adds a third practice, <strong>continuous training</strong> (CT): a system retrains
            and validates models automatically when a trigger fires.
          </p>
        </>
      ),
    },
    {
      id: "triggers",
      title: "Two pipelines, not one",
      body: (
        <>
          <p>
            The key design decision is to separate fast checks from expensive work. If every pull
            request ran a full 6-hour training job, nobody would wait for it, and your GPU bill would
            suffer. So split the system.
          </p>
          <Table
            head={["Event", "What runs", "Target time"]}
            rows={[
              ["Pull request", "Lint, unit tests, data checks, smoke training", "Minutes"],
              ["Merge to main", "Build images, full or partial training", "Up to hours"],
              ["New data or a schedule", "The training pipeline", "Up to hours"],
              ["Drift alert", "Training pipeline, plus a human look", "Up to hours"],
              ["Model approved", "Staged deployment", "Minutes to days"],
            ]}
          />
          <p>
            <strong>Smoke training</strong> is a short run on a small sample, perhaps a few hundred
            rows and one epoch. It won't produce a useful model. It proves the pipeline runs from
            start to finish, that loss is a real number and that the output can be saved and loaded.
          </p>
          <p>Budget your PR pipeline like this illustrative example:</p>
          <Table
            head={["PR stage", "Minutes"]}
            rows={[
              ["Lint and type checks", "1"],
              ["Unit tests", "3"],
              ["Data validation on a sample", "2"],
              ["Smoke training and load test", "4"],
              ["Total", "10"],
            ]}
          />
          <Callout tone="tip">
            Put the cheapest checks first, and let a failure stop the pipeline. There's no reason to
            spend four minutes training when a lint error would have failed in one.
          </Callout>
        </>
      ),
    },
    {
      id: "testing",
      title: "What to test",
      body: (
        <>
          <p>Each layer catches a problem the others miss:</p>
          <Table
            head={["Layer", "Example", "Runs"]}
            rows={[
              ["Code", "Feature function handles missing values", "Every PR"],
              ["Data", "Schema matches, null rate within limits", "Every PR and training run"],
              ["Pipeline", "Smoke training finishes", "Every PR"],
              ["Model quality", "Beats production on the test set", "Every full training"],
              ["Slices", "No key customer group gets much worse", "Every full training"],
              ["Serving", "Container starts, responds within its latency budget", "Before deployment"],
            ]}
          />
          <p>
            Great Expectations and Pandera are common choices for data checks, though a few assertions
            in Python are a fine start. Serving tests should use the real container, because this is
            where a missing library or a different preprocessing step finally shows itself.
          </p>
        </>
      ),
    },
    {
      id: "gate",
      title: "Worked example: a quality gate",
      body: (
        <>
          <p>
            A <strong>quality gate</strong> is an automated check that decides if a model may move
            on. A simple gate has one rule for improvement and one for operating limits:
          </p>
          <Formula>promote if new ≥ production + minimum gain, and latency ≤ budget</Formula>
          <p>
            The minimum gain stops you from shipping noise. Tiny differences on a test set may be
            chance, and each release has its own risk and cost.
          </p>
          <p>
            Take this illustrative case. Production AUC is 0.864 and the new model scores 0.871. AUC
            measures how well a model ranks positives above negatives, where 1.0 is perfect. The
            minimum gain is 0.005, and the latency budget is 80 ms at p95, meaning 95% of requests
            finish within that time.
          </p>
          <pre>
            <code>{`gain = 0.871 − 0.864 = 0.007
0.007 ≥ 0.005  → passes
measured p95 = 72 ms, budget = 80 ms → passes`}</code>
          </pre>
          <p>In code, the gate just reads metrics and sets an exit code, which CI understands:</p>
          <pre>
            <code>{`import json
import sys
from pathlib import Path

MIN_GAIN = 0.005
MAX_P95_MS = 80

new = json.loads(Path("out/metrics.json").read_text())
prod = json.loads(Path("prod/metrics.json").read_text())

gain = new["auc"] - prod["auc"]
errors = []

if gain < MIN_GAIN:
    errors.append(f"AUC gain {gain:.3f} is below {MIN_GAIN}")
if new["p95_ms"] > MAX_P95_MS:
    errors.append(f"p95 {new['p95_ms']} ms is over {MAX_P95_MS} ms")

if errors:
    print("\\n".join(errors))
    sys.exit(1)

print(f"Gate passed: AUC gain {gain:.3f}")`}</code>
          </pre>
          <Callout tone="warn">
            A comparison is only fair if both models are scored on the same test data. If production's
            score came from an older test set, re-evaluate it first. And a fixed threshold can't catch
            everything, so high-risk models often need a person to approve them too.
          </Callout>
        </>
      ),
    },
    {
      id: "release",
      title: "Releasing and rolling back",
      body: (
        <>
          <p>
            A model that passes offline can still fail on live traffic. So release it in stages, and
            keep the old one ready.
          </p>
          <ul>
            <li>
              <strong>Shadow:</strong> the new model receives a copy of live requests, but its answers
              are discarded. You learn about latency and output with no customer risk.
            </li>
            <li>
              <strong>Canary:</strong> a small share of traffic goes to the new model. With 2,000
              requests per second, a 5% canary serves 2,000 × 0.05 = 100 requests per second.
            </li>
            <li>
              <strong>Full rollout:</strong> widen the share in steps, for example 5%, 25%, 50% and
              100%, while watching error rates and prediction distributions.
            </li>
          </ul>
          <p>
            Two rules make this reliable. <strong>Build once, promote the same artifact.</strong>{" "}
            Don't retrain or rebuild for production, or what you tested isn't what you ship.{" "}
            <strong>Keep rollback boring.</strong> A model registry such as MLflow's holds every
            version, so rollback means pointing serving at the previous version instead of running a
            new pipeline.
          </p>
          <Callout tone="note">
            Labels often arrive late. A fraud model may not learn the truth for weeks. So early canary
            decisions rely on latency, errors and prediction distributions, and true quality metrics
            follow later.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "ML behavior depends on code and data, so passing unit tests isn't enough.",
    "Keep pull request checks fast, and move full training to its own pipeline.",
    "Continuous training adds triggers such as new data, schedules and drift.",
    "Quality gates compare new models with production on the same data.",
    "Promote the same tested artifact, release in stages and keep rollback simple.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the purpose of smoke training in a pull request?",
      options: [
        "Producing the production model",
        "Proving the pipeline runs end to end, cheaply",
        "Finding the best hyperparameters",
        "Replacing unit tests",
      ],
      answer: 1,
      explain: "A short run on a small sample catches broken pipelines without the cost of full training.",
    },
    {
      kind: "mcq",
      q: "In a shadow deployment, what happens to the new model's predictions?",
      options: [
        "They replace the old model's",
        "They go to 5% of users",
        "They're recorded for analysis but not returned to users",
        "They're used for training",
      ],
      answer: 2,
      explain: "Shadow mode tests the model on live traffic with no effect on customers.",
    },
    {
      kind: "text",
      q: "Production AUC is 0.902, and the new model scores 0.906. The minimum gain is 0.005. Does the model pass? Answer yes or no.",
      format: "**",
      accept: ["no"],
      explain: "The gain is 0.004, which is below the 0.005 minimum.",
    },
    {
      kind: "text",
      q: "A service handles 4,000 requests per second. How many go to a 10% canary each second?",
      format: "***",
      accept: ["400"],
      explain: "4,000 × 0.10 = 400 requests per second.",
    },
    {
      kind: "text",
      q: "What does CT stand for in ML pipelines? Two words.",
      format: "********** ********",
      accept: ["continuous training"],
      explain: "Continuous training retrains and validates models automatically.",
    },
  ],
};
