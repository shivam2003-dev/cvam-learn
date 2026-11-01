import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Package training code so it installs and runs the same way everywhere",
    "Separate declared dependencies from a locked environment",
    "Turn a notebook into a script a scheduler can run and judge",
    "Estimate a job's memory needs before it crashes",
  ],
  tasks: [
    {
      id: "problem",
      title: "From notebook to something a machine can run",
      body: (
        <>
          <p>
            A notebook is good for exploring. It's poor for production. Cells can run out of order,
            paths point at one person's laptop, and nobody can tell which library versions were
            installed. When the author is on holiday, the model can't be rebuilt.
          </p>
          <p>
            An MLOps engineer rarely invents the model. The job is to take that working code and
            make it dependable: installable, configurable, tested and able to report failure to
            whatever launched it. Python is where most of this happens, because the training code,
            the pipeline steps and often the serving layer are all written in it.
          </p>
          <p>Think of it as moving from a home kitchen to a restaurant. The dish may be the same, but now the recipe is written down, the ingredients are specified, and any cook on any shift gets the same result.</p>
          <Table
            head={["Notebook habit", "Production replacement"]}
            rows={[
              ["Hard-coded paths and parameters", "Command-line arguments or a config file"],
              ["Top-to-bottom cells", "Functions in an importable package"],
              ["print() to see progress", "The logging module, with levels"],
              ["Checking results by eye", "Automated tests with pytest"],
              ["pip install whenever needed", "Declared and locked dependencies"],
            ]}
          />
        </>
      ),
    },
    {
      id: "packaging",
      title: "Packaging and environments",
      body: (
        <>
          <p>
            A <strong>virtual environment</strong> is an isolated folder of installed libraries, one
            per project. It stops project A's upgrade from breaking project B. Create one with{" "}
            <code>python -m venv .venv</code> and turn it on with{" "}
            <code>source .venv/bin/activate</code>.
          </p>
          <p>
            A <strong>package</strong> is code that can be installed and imported. Modern Python
            projects describe themselves in one file, <code>pyproject.toml</code>:
          </p>
          <pre>
            <code>{`[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[project]
name = "churn-model"
version = "0.3.0"
requires-python = ">=3.11"
dependencies = [
  "pandas>=2.2,<3",
  "scikit-learn>=1.5,<1.6",
]

[project.optional-dependencies]
dev = ["pytest", "ruff", "mypy"]

[project.scripts]
churn-train = "churn_model.train:main"`}</code>
          </pre>
          <p>
            Put the code in <code>src/churn_model/</code> and run{" "}
            <code>pip install -e ".[dev]"</code>. The <code>-e</code> means editable, so changes to
            the source apply without reinstalling. Imports now work from anywhere, which removes the
            usual <code>sys.path</code> hacks. The <code>project.scripts</code> entry also gives you
            a <code>churn-train</code> command, so a pipeline can call one stable name.
          </p>
          <p>
            That file states what you <em>allow</em>. A <strong>lockfile</strong> records what you
            actually <em>installed</em>, including every indirect dependency, at exact versions.
            You need both. Ranges let you take updates on purpose; the lock makes today's build
            repeatable next year.
          </p>
          <Table
            head={["Tool", "How it locks"]}
            rows={[
              ["pip", <code key="a">pip freeze &gt; requirements.lock</code>],
              ["pip-tools", <code key="b">pip-compile pyproject.toml</code>],
              ["uv", <code key="c">uv lock</code>],
              ["Poetry", <code key="d">poetry lock</code>],
            ]}
          />
          <Callout tone="warn">
            A pickled model is tied to its environment. scikit-learn warns that a model saved under
            one version may fail or behave differently under another. Train and serve from the same
            locked dependencies, and record the versions next to the model.
          </Callout>
        </>
      ),
    },
    {
      id: "script",
      title: "A script that behaves in production",
      body: (
        <>
          <p>
            A scheduler such as Airflow, or a CI job, knows nothing about your code. It starts a
            process, reads its logs and looks at its <strong>exit code</strong>: 0 for success,
            anything else for failure. So a good job takes its settings from outside, logs clearly
            and fails loudly.
          </p>
          <pre>
            <code>{`import argparse
import json
import logging
from pathlib import Path

import pandas as pd

from churn_model.model import fit_and_score

log = logging.getLogger(__name__)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    args = parse_args()

    df = pd.read_parquet(args.data)
    if df.empty:
        raise ValueError(f"No rows found in {args.data}")

    log.info("Training on %d rows, seed=%d", len(df), args.seed)
    metrics = fit_and_score(df, args.out, seed=args.seed)

    (args.out / "metrics.json").write_text(json.dumps(metrics))
    log.info("Done: %s", metrics)


if __name__ == "__main__":
    main()`}</code>
          </pre>
          <p>Notice what this gets right:</p>
          <ul>
            <li>
              <strong>Nothing is hard-coded.</strong> The same script runs on a laptop, in CI and in
              a nightly pipeline.
            </li>
            <li>
              <strong>Bad input stops the run.</strong> An uncaught exception ends Python with exit
              code 1, so the scheduler marks the task failed. Catching every error and carrying on
              would report a false success.
            </li>
            <li>
              <strong>The seed is explicit</strong>, so it can be recorded with the run.
            </li>
            <li>
              <strong>Metrics go to a file</strong>, ready for a later pipeline step to read and
              compare.
            </li>
          </ul>
          <Callout tone="tip">
            Add type hints and run <code>mypy</code> and <code>ruff</code> in CI. Each catches a
            class of bugs in seconds, while the same bug might only appear three hours into a
            training run.
          </Callout>
        </>
      ),
    },
    {
      id: "testing",
      title: "Testing the parts that matter",
      body: (
        <>
          <p>
            You don't need to test that scikit-learn works. Test your own logic, above all feature
            code, because a silent bug there produces a worse model and no error message.
          </p>
          <pre>
            <code>{`import pandas as pd

from churn_model.features import add_tenure_days


def test_tenure_is_zero_on_signup_day():
    df = pd.DataFrame({
        "signup": pd.to_datetime(["2026-01-01"]),
        "as_of": pd.to_datetime(["2026-01-01"]),
    })
    assert add_tenure_days(df)["tenure_days"].iloc[0] == 0


def test_empty_input_returns_empty_frame():
    df = pd.DataFrame({"signup": [], "as_of": []}).astype("datetime64[ns]")
    assert add_tenure_days(df).empty`}</code>
          </pre>
          <p>
            Run these with <code>pytest</code>. Keep them fast, so they can run on every commit. The
            edge cases to try first are empty input, missing values and a single row.
          </p>
        </>
      ),
    },
    {
      id: "memory",
      title: "Memory and concurrency",
      body: (
        <>
          <p>
            Data jobs usually die from running out of memory, not from slow code. You can estimate
            the size of a numeric table before you load it:
          </p>
          <Formula>memory ≈ rows × columns × bytes per value</Formula>
          <p>Take 50 million rows and 40 numeric columns, stored as 64-bit floats (8 bytes each):</p>
          <pre>
            <code>{`50,000,000 × 40 = 2,000,000,000 values
2,000,000,000 × 8 = 16,000,000,000 bytes = 16 GB`}</code>
          </pre>
          <p>
            A container limited to 8 GB can't load it. Switching to 32-bit floats halves it to 8 GB,
            and reading only the 15 columns you need brings that to 50,000,000 × 15 × 4 = 3 GB.
            Parquet makes the second trick easy, because{" "}
            <code>pd.read_parquet(path, columns=[...])</code> reads just those columns. Real usage
            is higher, since text columns and temporary copies add overhead, so leave headroom.
          </p>
          <p>Concurrency has one rule that catches many people:</p>
          <Table
            head={["Work type", "Use", "Why"]}
            rows={[
              ["Waiting on network or disk", "Threads or asyncio", "Tasks mostly wait, so they can share one core"],
              ["CPU-heavy Python code", "Multiple processes", "The global interpreter lock lets one thread run Python bytecode at a time in the standard build"],
              ["Array math in NumPy or PyTorch", "The library itself", "Native code manages its own threads"],
            ]}
          />
          <Callout tone="warn" title="Serving trap">
            In FastAPI, an <code>async def</code> endpoint runs on the event loop. A slow CPU
            prediction inside it blocks every other request. If the work is blocking, declare the
            endpoint with plain <code>def</code>, which FastAPI runs in a thread pool.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Virtual environments isolate projects, and pyproject.toml declares what a project needs.",
    "A lockfile pins the exact environment, so a build can be repeated later.",
    "Production jobs take config from outside, log properly and fail with a non-zero exit code.",
    "Test your own feature logic, starting with empty and missing inputs.",
    "Estimate memory as rows × columns × bytes per value before you load the data.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why keep both version ranges in pyproject.toml and a lockfile?",
      options: [
        "Ranges make installs faster",
        "Ranges state what's allowed; the lock records the exact versions installed",
        "Lockfiles replace virtual environments",
        "PyPI requires both",
      ],
      answer: 1,
      explain: "Ranges let you choose when to upgrade. The lock makes a given build repeatable.",
    },
    {
      kind: "mcq",
      q: "A training script hits corrupt data, catches the exception, logs it and exits normally. What does the scheduler see?",
      options: ["A failed task", "A retry", "A successful task", "A paused task"],
      answer: 2,
      explain: "Exit code 0 means success. Let the failure propagate so the run is marked failed.",
    },
    {
      kind: "text",
      q: "How many GB does a table of 10 million rows and 20 columns of 8-byte floats need? Answer as a number.",
      format: "*.*",
      accept: ["1.6", "1.6 gb", "1.6gb"],
      explain: "10,000,000 × 20 × 8 = 1,600,000,000 bytes, which is 1.6 GB.",
    },
    {
      kind: "text",
      q: "Which file declares a modern Python project's metadata and dependencies?",
      format: "*********.****",
      accept: ["pyproject.toml"],
      explain: "pyproject.toml is the standard project file used by modern Python build tools.",
    },
  ],
};
