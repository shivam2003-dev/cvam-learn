import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 9,
  difficulty: "Easy",
  objectives: [
    "Pick Python and TypeScript as the default pair for FDE work",
    "Know when Java, Scala, Go, Rust or C++ will be the customer's reality",
    "Choose a language for a task using fit, not preference",
  ],
  tasks: [
    {
      id: "defaults",
      title: "Your default pair: Python and TypeScript",
      body: (
        <>
          <p>
            You will rarely choose the customer's stack, but you do choose the glue you write. Two
            languages cover most of it.
          </p>
          <ul>
            <li>
              <strong>Python</strong> for data work, scripts, AI and ML libraries, pipelines and
              quick integrations. Nearly every model SDK ships Python first.
            </li>
            <li>
              <strong>TypeScript</strong> for web apps, internal tools, API servers and anything
              with a UI. Types catch many mistakes before a demo.
            </li>
          </ul>
          <pre>
            <code>{`# Python: pull rows from an API and write a CSV in ten lines
import csv, requests

rows = requests.get("https://api.example.com/orders", timeout=10).json()
with open("orders.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["id", "status", "total"])
    writer.writeheader()
    writer.writerows({k: r[k] for k in ("id", "status", "total")} for r in rows)`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "others",
      title: "The languages you will meet",
      body: (
        <>
          <Table
            head={["Language", "Where it appears", "What to be able to do"]}
            rows={[
              ["Java / Scala", "Enterprise back offices, Spark jobs, banks", "Read code, run builds, call or wrap services"],
              ["Go", "Infrastructure, CLIs, high-throughput services", "Read and make small changes, build a simple service"],
              ["Rust", "Performance-critical or safety-critical components", "Read, call through bindings, rarely write"],
              ["C++", "Embedded, trading, legacy native code", "Read and build, wrap behind a clean interface"],
              ["SQL", "Everywhere data lives", "Write confident queries (own lesson later)"],
            ]}
          />
          <Callout tone="note">
            The target is not mastery of all of them. It is being able to read unfamiliar code,
            run it, and find the right place to make a small, safe change.
          </Callout>
        </>
      ),
    },
    {
      id: "choose",
      title: "Choosing for the task",
      body: (
        <>
          <ol>
            <li>
              <strong>Follow the customer's runtime.</strong> If they run the JVM and have no
              Python approved, a Java or Kotlin service is the path of least resistance.
            </li>
            <li>
              <strong>Follow the library.</strong> If the work is mostly calling a model or
              transforming tabular data, Python usually wins.
            </li>
            <li>
              <strong>Follow who will maintain it.</strong> Choose what their team can read.
            </li>
            <li>
              <strong>Wrap, don't rewrite.</strong> Put old native code behind an API or a CLI
              rather than rewriting it.
            </li>
          </ol>
          <p>
            A quick way to learn a new language on the job: read a small, well-written program,
            change one behaviour, run the tests, then write a tiny feature. Repeat.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Python and TypeScript cover most FDE glue code, data and AI work, and UI.",
    "Be able to read and safely modify Java, Scala, Go, Rust and C++ when the customer uses them.",
    "Choose by the customer's runtime, library fit and who will maintain it.",
    "Wrap legacy native code instead of rewriting it.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A customer allows only the JVM in production. What is the sensible default?",
      options: [
        "Write the service in a JVM language they already run",
        "Ask them to install a new runtime",
        "Rewrite their stack",
        "Skip the project",
      ],
      answer: 0,
      explain: "Following the customer's approved runtime avoids approvals and makes the code maintainable by them.",
    },
    {
      kind: "mcq",
      q: "Which language is most often first-class for model SDKs and data libraries?",
      options: ["Python", "COBOL", "Perl", "Fortran"],
      answer: 0,
      explain: "Python has the broadest ecosystem for data, ML and AI APIs.",
    },
    {
      kind: "mcq",
      q: "You find a 20-year-old C++ library that does a needed calculation. Best approach?",
      options: [
        "Rewrite it in Python immediately",
        "Wrap it behind an API or CLI and call it",
        "Ignore the calculation",
        "Copy the code into a spreadsheet",
      ],
      answer: 1,
      explain: "Wrapping preserves proven behaviour and is much faster and safer than rewriting.",
    },
  ],
};
