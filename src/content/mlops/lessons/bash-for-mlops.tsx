import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Easy",
  objectives: [
    "Write a Bash script that stops on failure instead of hiding it",
    "Use pipes, redirection and quoting correctly",
    "Inspect GPUs, disks and logs from the command line",
    "Add retries and parallelism to everyday data tasks",
  ],
  tasks: [
    {
      id: "problem",
      title: "The glue around every ML system",
      body: (
        <>
          <p>
            Much of MLOps happens in a terminal on a machine with no graphical interface. You SSH
            into a GPU server to see why training stalled. You copy a model to object storage. A
            container starts with an entrypoint script. A CI step is a few shell commands.
          </p>
          <p>
            <strong>Bash</strong> is the language of that terminal. It's a poor choice for complex
            logic, but it's the best tool for connecting other programs. Think of Python as the
            machinery and Bash as the wiring between machines.
          </p>
          <p>
            A rule of thumb: if a script needs real data structures, or grows past a page or so,
            move it to Python.
          </p>
        </>
      ),
    },
    {
      id: "safe-script",
      title: "A script that fails properly",
      body: (
        <>
          <p>
            By default, Bash carries on after a command fails. For a training pipeline that's
            dangerous: a failed download can be followed by training on stale data, with a happy
            ending. Start every script with safer settings.
          </p>
          <pre>
            <code>{`#!/usr/bin/env bash
set -euo pipefail

RUN_ID="$(date +%Y%m%d-%H%M%S)"
DATA_DIR="/data/churn"
OUT_DIR="/runs/\${RUN_ID}"

mkdir -p "$OUT_DIR"

aws s3 sync "s3://acme-ml/churn/2026-10/" "$DATA_DIR"

python -m churn_model.train --data "$DATA_DIR" --out "$OUT_DIR" \\
  2>&1 | tee "$OUT_DIR/train.log"

echo "Finished: $OUT_DIR"`}</code>
          </pre>
          <Table
            head={["Setting", "Effect"]}
            rows={[
              [<code key="e">set -e</code>, "Exit as soon as a command fails"],
              [<code key="u">set -u</code>, "Treat an unset variable as an error"],
              [<code key="p">set -o pipefail</code>, "A pipeline fails if any command in it fails"],
            ]}
          />
          <p>
            The last one matters here. Without <code>pipefail</code>, a pipeline's exit code is that
            of its last command. <code>tee</code> nearly always succeeds, so a crashed training run
            would look like a success to whatever launched it.
          </p>
          <p>
            Every command returns an <strong>exit code</strong>: 0 means success, anything else
            means failure. You can read the last one with <code>echo $?</code>. CI systems and
            schedulers judge your job with this number alone.
          </p>
          <Callout tone="warn">
            Without <code>set -u</code>, a typo is silently empty. <code>rm -rf "$OUT_DRI/"</code>{" "}
            becomes <code>rm -rf "/"</code>. GNU <code>rm</code> refuses that exact command by
            default, but a longer path built the same way isn't protected.
          </Callout>
        </>
      ),
    },
    {
      id: "plumbing",
      title: "Quoting, pipes and redirection",
      body: (
        <>
          <p>
            <strong>Quote your variables.</strong> Bash splits unquoted values on spaces, so a file
            called <code>train set.csv</code> becomes two arguments. Write <code>"$FILE"</code>, not{" "}
            <code>$FILE</code>. Single quotes keep text literal; double quotes still expand
            variables.
          </p>
          <p>
            Each process has three streams: standard input, standard output (stdout) and standard
            error (stderr). A <strong>pipe</strong> sends one command's stdout into the next
            command's input. <strong>Redirection</strong> sends a stream to a file.
          </p>
          <Table
            head={["Syntax", "Meaning"]}
            rows={[
              [<code key="a">{"cmd > out.log"}</code>, "Write stdout to a file, replacing it"],
              [<code key="b">{"cmd >> out.log"}</code>, "Append stdout to a file"],
              [<code key="c">{"cmd 2> err.log"}</code>, "Write stderr to a file"],
              [<code key="d">{"cmd > all.log 2>&1"}</code>, "Send stdout and stderr to one file"],
              [<code key="e">{"cmd | tee out.log"}</code>, "Show output and save it too"],
            ]}
          />
          <p>Here are commands you'll use every week:</p>
          <pre>
            <code>{`# What are the GPUs doing?
nvidia-smi
nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv
watch -n 2 nvidia-smi

# Why did the run die?
tail -f train.log
grep -c "ERROR" train.log
grep -n -i "out of memory" train.log | tail -5

# Who is using the disk?
df -h
du -sh /data/* | sort -h

# How many data files arrived?
find /data/churn -name '*.parquet' | wc -l`}</code>
          </pre>
          <Callout tone="tip">
            Long jobs die when your SSH connection drops, because the shell sends them a hangup
            signal. Start them inside <code>tmux</code>, or use <code>nohup</code>, so they survive
            a disconnect.
          </Callout>
        </>
      ),
    },
    {
      id: "retry",
      title: "Worked example: retries with backoff",
      body: (
        <>
          <p>
            Network calls fail for short, temporary reasons. Retrying at once often hits the same
            problem, so each wait doubles. This is called <strong>exponential backoff</strong>.
          </p>
          <pre>
            <code>{`retry() {
  local attempt=1 max=5 delay=2

  until "$@"; do
    if (( attempt == max )); then
      echo "Failed after $max attempts: $*" >&2
      return 1
    fi
    echo "Attempt $attempt failed, waiting \${delay}s" >&2
    sleep "$delay"
    delay=$(( delay * 2 ))
    attempt=$(( attempt + 1 ))
  done
}

retry aws s3 cp model.pt s3://acme-ml/models/churn/model.pt`}</code>
          </pre>
          <p>
            Here <code>"$@"</code> stands for all the arguments, kept intact, so <code>retry</code>{" "}
            can wrap any command. Five attempts have four gaps between them:
          </p>
          <Formula>total wait = 2 + 4 + 8 + 16 = 30 seconds</Formula>
          <p>
            So a blip of under 30 seconds is survived, and a real outage fails in a bounded time. The
            messages go to stderr with <code>{">&2"}</code>, which keeps stdout clean for anything
            reading the command's output.
          </p>
        </>
      ),
    },
    {
      id: "parallel",
      title: "Parallelism and scheduling",
      body: (
        <>
          <p>
            Suppose you must convert 240 files at about 30 seconds each. Run one at a time, that's
            240 × 30 = 7,200 seconds, or 2 hours. With <code>xargs</code> you can run 8 at once:
          </p>
          <pre>
            <code>{`find /data/raw -name '*.csv' -print0 \\
  | xargs -0 -P 8 -I{} python convert.py --input {}`}</code>
          </pre>
          <p>
            In the ideal case that takes 7,200 ÷ 8 = 900 seconds, or 15 minutes. These figures are
            illustrative, and real speedup is lower if the disk or network is the bottleneck. The{" "}
            <code>-print0</code> and <code>-0</code> pair keeps filenames with spaces safe.
          </p>
          <p>
            For simple recurring work on one machine, <strong>cron</strong> runs commands on a
            schedule. Its five fields are minute, hour, day of month, month and day of week:
          </p>
          <pre>
            <code>{`# Every day at 02:00, append all output to a log
0 2 * * * /opt/ml/retrain.sh >> /var/log/retrain.log 2>&1`}</code>
          </pre>
          <Callout tone="warn">
            Cron runs with a minimal environment. A script that works in your terminal can fail there
            because <code>PATH</code> is short and your virtual environment isn't active. Use full
            paths. Once you need dependencies between steps or retries with visibility, move to an
            orchestrator such as Airflow.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Start scripts with set -euo pipefail, so failures stop the run.",
    "Exit codes are how schedulers and CI judge a job: 0 means success.",
    "Quote variables, and learn the difference between stdout and stderr.",
    "Use backoff for flaky network calls and xargs -P for simple parallel work.",
    "Move logic to Python when a script grows beyond simple wiring.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A script runs python train.py | tee log.txt without pipefail, and training crashes. What is the pipeline's exit code?",
      options: [
        "The Python error code",
        "0, because tee succeeded",
        "It depends on the log size",
        "Always 127",
      ],
      answer: 1,
      explain: "Without pipefail, a pipeline returns the exit code of its last command.",
    },
    {
      kind: "mcq",
      q: "Why should you write \"$FILE\" and not $FILE?",
      options: [
        "It runs faster",
        "Unquoted values are split on spaces and expanded",
        "Bash requires quotes for all variables",
        "It makes the variable read-only",
      ],
      answer: 1,
      explain: "Quoting keeps a value as one argument, even if it contains spaces.",
    },
    {
      kind: "text",
      q: "A retry loop makes 5 attempts. The first wait is 3 seconds and each wait doubles. What is the total wait in seconds?",
      format: "**",
      accept: ["45", "45s", "45 seconds"],
      explain: "Four gaps: 3 + 6 + 12 + 24 = 45 seconds.",
    },
    {
      kind: "text",
      q: "Which shell option makes a pipeline fail if any command in it fails?",
      format: "********",
      accept: ["pipefail", "set -o pipefail"],
      explain: "pipefail changes a pipeline's exit status so a failure in any stage is reported.",
    },
  ],
};
