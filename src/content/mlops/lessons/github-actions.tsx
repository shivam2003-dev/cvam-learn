import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 15,
  difficulty: "Medium",
  objectives: [
    "Read and write a GitHub Actions workflow file",
    "Build a pipeline that tests, trains a small model and applies a gate",
    "Pass files between jobs, and handle secrets safely",
    "Choose between hosted and self-hosted runners for ML",
  ],
  tasks: [
    {
      id: "problem",
      title: "Automation that lives with your code",
      body: (
        <>
          <p>
            You've agreed that each change should be tested and each model checked. Doing that by
            hand won't last a month. <strong>GitHub Actions</strong> is GitHub's built-in automation
            service. You commit a YAML file, and GitHub runs it when something happens in the
            repository.
          </p>
          <p>
            Because the workflow is stored in the repository, it's versioned and reviewed like any
            other code. It's like a recipe card kept with the ingredients: anyone who has the project
            has the instructions as well.
          </p>
          <Table
            head={["Term", "Meaning"]}
            rows={[
              ["Workflow", "One automated process, in a YAML file under .github/workflows/"],
              ["Event", "What starts it, such as a pull request or a schedule"],
              ["Job", "A set of steps that runs on one machine"],
              ["Step", "A single shell command or action"],
              ["Action", "A reusable, packaged step, such as checking out code"],
              ["Runner", "The machine that runs a job"],
            ]}
          />
          <p>
            By default, jobs run in parallel, each on a <strong>fresh machine</strong>. Nothing on
            disk survives from one job to the next unless you save it. That single fact explains a
            lot of early confusion.
          </p>
        </>
      ),
    },
    {
      id: "workflow",
      title: "Your first ML workflow",
      body: (
        <>
          <p>
            This workflow runs on pull requests that touch code, parameters or data pointers. It tests
            the code, trains on a small sample, and fails if the result is too weak. Save it as{" "}
            <code>.github/workflows/ml-ci.yml</code>.
          </p>
          <pre>
            <code>{`name: ml-ci

on:
  pull_request:
    paths:
      - "src/**"
      - "tests/**"
      - "params.yaml"
      - "data/*.dvc"
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip
          cache-dependency-path: pyproject.toml
      - run: pip install -e ".[dev]"
      - run: ruff check src tests
      - run: pytest -q

  train-sample:
    needs: test
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip
          cache-dependency-path: pyproject.toml
      - run: pip install -e ".[dev]"
      - name: Pull sample data
        env:
          AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: dvc pull data/sample.dvc
      - name: Train
        run: python -m churn_model.train --data data/sample --out out
      - uses: actions/upload-artifact@v4
        with:
          name: model-\${{ github.sha }}
          path: out/

  gate:
    needs: train-sample
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: model-\${{ github.sha }}
          path: out
      - run: python scripts/check_metrics.py out/metrics.json`}</code>
          </pre>
          <p>Here's how to read it:</p>
          <ul>
            <li>
              <code>on</code> sets the events. <code>paths</code> skips the run when only docs change.{" "}
              <code>workflow_dispatch</code> adds a manual Run button.
            </li>
            <li>
              <code>needs</code> creates order: <code>test</code>, then <code>train-sample</code>, then{" "}
              <code>gate</code>. If one fails, those after it are skipped.
            </li>
            <li>
              <code>uses</code> runs a published action, while <code>run</code> runs a shell command.
            </li>
            <li>
              <code>timeout-minutes</code> stops a hung job. The default limit is 6 hours, which is a
              lot of wasted runner time.
            </li>
            <li>
              Expressions in <code>{"${{ }}"}</code> are filled in by GitHub before the step runs.
            </li>
          </ul>
          <p>
            A step fails if its command exits with a non-zero code, so{" "}
            <code>check_metrics.py</code> needs only <code>sys.exit(1)</code> to block the merge.
            Each job also checks out the repository again, because of those fresh machines. The
            artifact upload and download pair is how <code>gate</code> receives the training output.
          </p>
          <Callout tone="note">
            A full-history checkout isn't needed for most jobs. <code>actions/checkout</code> fetches
            a single commit by default, which keeps it quick. Set <code>fetch-depth: 0</code> only for
            tools that compare against other branches.
          </Callout>
        </>
      ),
    },
    {
      id: "secrets",
      title: "Secrets and access",
      body: (
        <>
          <p>
            Add secrets in the repository settings, then read them with{" "}
            <code>{"${{ secrets.NAME }}"}</code>. GitHub masks their values in logs. Pass each one
            only to the step that needs it, as shown above with <code>env</code>.
          </p>
          <p>
            Stored cloud keys are long-lived, and they're a risk if leaked. A safer option is{" "}
            <strong>OIDC</strong>: the job proves its identity to your cloud provider and receives
            short-lived credentials, so no key is stored at all.
          </p>
          <pre>
            <code>{`permissions:
  id-token: write
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/ml-ci
      aws-region: us-east-1`}</code>
          </pre>
          <Callout tone="warn">
            Secrets aren't passed to workflows triggered by pull requests from forks, which protects
            them from outside code. Be careful with the <code>pull_request_target</code> event: it runs
            with access to secrets, so running a fork's code in it can expose them. Also pin
            third-party actions to a full commit hash, because a tag can be moved.
          </Callout>
        </>
      ),
    },
    {
      id: "patterns",
      title: "Patterns for ML",
      body: (
        <>
          <p>
            <strong>Scheduled retraining.</strong> The <code>schedule</code> event runs on the default
            branch, using cron syntax in UTC. Start times aren't exact, so don't rely on them to the
            minute.
          </p>
          <pre>
            <code>{`on:
  schedule:
    - cron: "0 3 * * 1"   # 03:00 UTC every Monday`}</code>
          </pre>
          <p>
            <strong>Matrix builds.</strong> A matrix runs one job across many combinations:
          </p>
          <pre>
            <code>{`jobs:
  test:
    strategy:
      matrix:
        python: ["3.10", "3.11", "3.12"]
        os: [ubuntu-latest, macos-latest]
    runs-on: \${{ matrix.os }}`}</code>
          </pre>
          <Formula>runner minutes = combinations × minutes per job × runs</Formula>
          <p>
            That's 3 × 2 = 6 jobs. At an illustrative 4 minutes per job and 100 runs a month, it uses
            6 × 4 × 100 = 2,400 runner minutes. On private repositories, minutes may be billed, and
            rates depend on the operating system, so check current pricing.
          </p>
          <p>
            <strong>Job summaries.</strong> Writing to a special file shows Markdown on the run's page,
            which makes metrics easy to find:
          </p>
          <pre>
            <code>{`- run: cat out/metrics.md >> "$GITHUB_STEP_SUMMARY"`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "runners",
      title: "Runners and GPUs",
      body: (
        <>
          <p>
            Standard GitHub-hosted runners have no GPU and limited memory. That's fine for tests and
            smoke training, but not for real training. You have three options:
          </p>
          <Table
            head={["Option", "Good for", "Watch out for"]}
            rows={[
              ["Hosted runner", "Tests, linting, small models", "No GPU on the standard machines"],
              ["Self-hosted runner", "GPUs and private network access", "You maintain it, and idle machines cost money"],
              ["Trigger an external job", "Long training on a cloud service", "CI must wait for or poll the result"],
            ]}
          />
          <p>
            The third option is often the cleanest. The workflow submits a training job to a platform
            such as SageMaker, or to Kubernetes, then finishes or waits. Training doesn't tie up a CI
            runner, and it can outlive the job limit.
          </p>
          <p>A self-hosted runner is selected by labels:</p>
          <pre>
            <code>{`runs-on: [self-hosted, linux, gpu]`}</code>
          </pre>
          <Callout tone="warn">
            Don't run self-hosted runners for public repositories. A pull request could run hostile
            code on your machine, and it may stay there for later jobs. Prefer ephemeral runners that
            are destroyed after each job.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Workflows are YAML files in .github/workflows, made of jobs and steps.",
    "Each job gets a fresh machine, so share outputs through artifacts.",
    "Use needs to order jobs, and exit codes to block merges.",
    "Prefer OIDC to stored keys, and keep secrets scoped to the steps that need them.",
    "Use hosted runners for fast checks, and GPUs or external jobs for real training.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A training job saves model.pkl to disk. The next job can't find it. Why?",
      options: [
        "YAML can't handle binary files",
        "Each job runs on a fresh machine, so the file must be passed as an artifact",
        "pip removed it",
        "Files are only visible on the main branch",
      ],
      answer: 1,
      explain: "Upload the file as an artifact, then download it in the job that needs it.",
    },
    {
      kind: "mcq",
      q: "Which keyword makes one job wait for another?",
      options: ["uses", "with", "needs", "run"],
      answer: 2,
      explain: "needs creates a dependency and sets the order of jobs.",
    },
    {
      kind: "text",
      q: "A matrix has 4 Python versions and 3 operating systems. How many jobs does it create?",
      format: "**",
      accept: ["12"],
      explain: "4 × 3 = 12 combinations.",
    },
    {
      kind: "text",
      q: "Which event adds a manual Run button to a workflow?",
      format: "*****************",
      accept: ["workflow_dispatch"],
      explain: "workflow_dispatch lets you start a workflow by hand.",
    },
  ],
};
