import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Explain why model results belong in the pull request",
    "Post a metrics and plot report using CML",
    "Compare a branch with main using DVC and CML together",
    "Start a cloud GPU runner only when a job needs one",
  ],
  tasks: [
    {
      id: "problem",
      title: "Reviewers can't see what a change did to the model",
      body: (
        <>
          <p>
            A pull request changes one line of feature code. The diff looks harmless. What matters is
            what it did to the model, and the diff can't show that. The reviewer has to dig through CI
            logs, or just trust the author. Important decisions get made without the evidence.
          </p>
          <p>
            <strong>CML</strong> (Continuous Machine Learning) is an open source command-line tool
            from the team behind DVC. It runs inside your CI job and posts results back to the pull
            request as a comment, with metrics, tables and plots. It works with GitHub, GitLab and
            Bitbucket.
          </p>
          <p>
            Think of a lab report attached to a building inspection. The inspector doesn't need to
            redo the tests. The numbers are right there on the form, at the moment of decision.
          </p>
          <p>
            CML doesn't train or decide anything. It's a messenger. CI runs your training, and CML
            carries the outcome to the place where people are already reviewing.
          </p>
        </>
      ),
    },
    {
      id: "first-report",
      title: "Your first report",
      body: (
        <>
          <p>
            Here's a GitHub Actions workflow that trains on a sample, builds a Markdown report and
            posts it. The <code>iterative/setup-cml</code> action installs the <code>cml</code>{" "}
            command.
          </p>
          <pre>
            <code>{`name: model-report

on: pull_request

permissions:
  contents: read
  pull-requests: write

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - uses: iterative/setup-cml@v2

      - name: Train
        run: |
          pip install -e ".[dev]"
          python -m churn_model.train --data data/sample --out out

      - name: Post report
        env:
          REPO_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          echo "## Model report" > report.md
          cat out/metrics.md >> report.md
          echo "![Confusion matrix](./out/confusion.png)" >> report.md
          cml comment create report.md`}</code>
          </pre>
          <p>
            The report is plain Markdown, so anything that can print text can add to it. The useful
            part is the last line. <code>cml comment create</code> posts the file as a comment and
            uploads any local images it references, which is awkward to do by hand.
          </p>
          <p>
            <code>REPO_TOKEN</code> is what CML uses to talk to the platform. The{" "}
            <code>permissions</code> block grants the built-in token the right to comment on pull
            requests.
          </p>
          <Table
            head={["Command", "Use"]}
            rows={[
              [<code key="a">cml comment create</code>, "Add a new comment"],
              [<code key="b">cml comment update</code>, "Replace the last CML comment, to limit noise"],
              [<code key="c">cml pr create</code>, "Open a pull request with files a job produced"],
              [<code key="d">cml runner launch</code>, "Start a runner, including on cloud machines"],
            ]}
          />
          <Callout tone="tip">
            Use <code>cml comment update</code> on busy branches. Otherwise each push adds another
            comment, and reviewers must scroll to find the latest numbers.
          </Callout>
          <Callout tone="warn">
            On pull requests from forks, the built-in token is read-only, so the comment step fails.
            That's a safety feature. Don't work around it by exposing write tokens to untrusted code.
          </Callout>
        </>
      ),
    },
    {
      id: "compare",
      title: "Comparing against main",
      body: (
        <>
          <p>
            A single score means little on its own. Reviewers want to know what changed. DVC can
            produce that comparison directly, and print it as a Markdown table:
          </p>
          <pre>
            <code>{`- uses: actions/checkout@v4
  with:
    fetch-depth: 0          # DVC needs history to read main

- name: Reproduce and report
  env:
    REPO_TOKEN: \${{ secrets.GITHUB_TOKEN }}
    AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
  run: |
    dvc pull
    dvc repro

    echo "## Metrics vs main" > report.md
    dvc metrics diff origin/main --md >> report.md

    echo "## Parameters vs main" >> report.md
    dvc params diff origin/main --md >> report.md

    cml comment create report.md`}</code>
          </pre>
          <p>
            Since <code>dvc repro</code> skips stages whose inputs haven't changed, a pull request that
            touches only docs does little work here. The <code>dvc pull</code> also restores cached
            outputs, as long as they were pushed earlier.
          </p>
          <p>
            For this to work, <code>main</code> must have a committed metrics file, which is what{" "}
            <code>cache: false</code> gave us in the DVC lesson. And the numbers are only comparable if
            both sides used the same evaluation data.
          </p>
        </>
      ),
    },
    {
      id: "reading",
      title: "Worked example: reading a report",
      body: (
        <>
          <p>Suppose the comment shows this illustrative result for a churn model:</p>
          <Table
            head={["Metric", "main", "This PR", "Change"]}
            rows={[
              ["Precision", "0.82", "0.84", "+0.02"],
              ["Recall", "0.71", "0.69", "−0.02"],
            ]}
          />
          <p>
            Precision is the share of flagged customers who really churn. Recall is the share of real
            churners you catch. Is this PR better? F1 combines the two into one number:
          </p>
          <Formula>F1 = 2 × precision × recall ÷ (precision + recall)</Formula>
          <pre>
            <code>{`main:  2 × 0.82 × 0.71 ÷ 1.53 = 1.1644 ÷ 1.53 ≈ 0.761
PR:    2 × 0.84 × 0.69 ÷ 1.53 = 1.1592 ÷ 1.53 ≈ 0.758`}</code>
          </pre>
          <p>
            F1 dropped by about 0.003, which is very small. So the right answer depends on the
            business. If each missed churner is costly, losing recall may be unacceptable. If retention
            offers are expensive, higher precision may win. This is the discussion CML is meant to
            start, and it needs people. A number on its own can't settle it.
          </p>
          <Callout tone="note">
            A report informs. A gate enforces. To block a merge, add a separate required check, such as
            a script that exits non-zero. Treat CML as the explanation of why that check passed or
            failed.
          </Callout>
        </>
      ),
    },
    {
      id: "runners",
      title: "GPU runners on demand",
      body: (
        <>
          <p>
            Standard hosted runners have no GPU. CML can start a cloud machine, register it as a
            runner for the job, then let it shut down when idle. A first job launches the machine, and
            a second one runs on it:
          </p>
          <pre>
            <code>{`jobs:
  launch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: iterative/setup-cml@v2
      - name: Launch runner
        env:
          REPO_TOKEN: \${{ secrets.PERSONAL_ACCESS_TOKEN }}
          AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          cml runner launch \\
            --cloud=aws \\
            --cloud-region=us-west \\
            --cloud-type=g4dn.xlarge \\
            --labels=cml-gpu

  train:
    needs: launch
    runs-on: [self-hosted, cml-gpu]
    timeout-minutes: 120
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/train.sh`}</code>
          </pre>
          <p>
            This needs a personal access token, because the built-in token can't register runners.
            Store it as a secret, and scope it tightly.
          </p>
          <p>
            Here's why it's worth the setup, with illustrative numbers. Say each training run takes 40
            minutes, you have 30 runs a month, and the machine costs $1 per hour. On demand, that's 30
            × 40 = 1,200 minutes, or 20 hours, costing $20. An always-on machine costs 720 × $1 = $720
            a month. Check current prices, and allow for startup time.
          </p>
          <Callout tone="warn">
            Automatic shutdown can fail. Set spending alerts, and check for stray instances when you
            first adopt this. CML's cloud options and flags change between releases, so check them
            against the docs for your version. Also confirm that the project is still actively
            maintained before you build on it.
          </Callout>
          <p>
            The idea outlasts any one tool. If CML doesn't fit, a CI step can post the same Markdown
            with <code>gh pr comment 123 --body-file report.md</code>. Images then need hosting
            somewhere, which is the main thing CML handles for you.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "CML puts model results in the pull request, where decisions are made.",
    "Reports are Markdown files, posted with cml comment create.",
    "Pair CML with dvc metrics diff to show change against main.",
    "A report informs reviewers, while a required check enforces the rules.",
    "CML can launch GPU runners on demand, so you pay only while training.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is CML's main job?",
      options: [
        "Training models faster",
        "Storing large datasets",
        "Posting CI results such as metrics and plots to pull requests",
        "Serving models",
      ],
      answer: 2,
      explain: "CML is a messenger between your CI job and the pull request.",
    },
    {
      kind: "mcq",
      q: "Which DVC command gives a Markdown table of metric changes against main?",
      options: [
        "dvc add --md",
        "dvc metrics diff origin/main --md",
        "dvc push --report",
        "dvc status main",
      ],
      answer: 1,
      explain: "dvc metrics diff compares metrics between revisions, and --md prints Markdown.",
    },
    {
      kind: "text",
      q: "A model has a precision of 0.8 and a recall of 0.6. What is its F1 score, to two decimal places?",
      format: "*.**",
      accept: ["0.69", ".69"],
      explain: "2 × 0.8 × 0.6 ÷ 1.4 = 0.96 ÷ 1.4 ≈ 0.686, which rounds to 0.69.",
    },
    {
      kind: "text",
      q: "Each run takes 30 minutes on a $2 per hour machine. What do 40 runs cost in dollars?",
      format: "**",
      accept: ["40", "$40"],
      explain: "40 × 0.5 hours = 20 hours, and 20 × $2 = $40.",
    },
  ],
};
