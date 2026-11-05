import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Layers } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Easy",
  objectives: [
    "Choose a stack you can finish with, not the one that sounds most impressive",
    "Apply a short decision rule for language, framework, storage and interface",
    "Lay out a repository so a reviewer can navigate it in a minute",
    "Make setup reproducible with pinned dependencies and one-command run",
  ],
  tasks: [
    {
      id: "choose",
      title: "Choose boring tools you can finish with",
      body: (
        <>
          <p>
            A take-home is not the place to learn a new framework. Pick tools you can use fluently,
            because speed and clarity are being measured. The reviewer does not reward novelty; they
            reward a working, readable solution.
          </p>
          <Figure caption="A decision path for the stack. Each question favours familiarity and simplicity.">
            <Flow
              direction="col"
              numbered
              steps={[
                { title: "Does the brief name a language or tool?", note: "Use it, unless it blocks you badly.", tone: "sky" },
                { title: "Which language are you fastest and clearest in?", note: "For data and AI work that is usually Python.", tone: "lime" },
                { title: "Do you need a database?", note: "Often files or SQLite are enough for the time and data size.", tone: "lime" },
                { title: "Does a user need an interface?", note: "A simple page or notebook can beat a hand-built web app.", tone: "amber" },
                { title: "Can a stranger run it in one command?", note: "If not, simplify the stack.", tone: "rose" },
              ]}
            />
          </Figure>
          <Table
            head={["Need", "Good default", "Why"]}
            rows={[
              ["Language", "Python (data, APIs, LLM) or TypeScript (web-heavy)", "Wide library support and readable"],
              ["Web service", "FastAPI or Flask (Python); Express (Node)", "Small, well-known, fast to write"],
              ["Storage", "SQLite or files (CSV, JSON) behind a small interface", "No setup for the reviewer; mention a production alternative"],
              ["UI", "Streamlit, Gradio or a simple static HTML page; a CLI if the user is technical", "Minutes, not hours"],
              ["LLM access", "The provider SDK or a thin wrapper, with the key in an environment variable", "Easy to read; avoid heavy frameworks unless the brief asks"],
              ["Testing", "pytest or the built-in test runner", "Standard and familiar"],
              ["Packaging", "requirements.txt or lock file; optionally a Dockerfile", "Reproducible setup"],
            ]}
          />
          <Callout tone="tip" title="Frameworks are a cost, not a credential">
            Adding a large agent framework to a task that needs two model calls makes the code harder
            to read and slower to build. Use plain functions unless the framework removes real work.
          </Callout>
        </>
      ),
    },
    {
      id: "structure",
      title: "A repository a reviewer can read in a minute",
      body: (
        <>
          <pre>
            <code>{`invoice-checker/
  README.md                 # what, how to run, assumptions, results, trade-offs, next steps
  requirements.txt          # pinned versions
  .env.example              # variable names only, never real keys
  Makefile                  # make setup / make run / make test / make eval
  data/
    sample/                 # provided or generated sample data
  src/invoice_checker/
    __init__.py
    config.py               # settings from environment
    extract.py              # reading files, extraction logic
    match.py                # PO matching rules
    llm.py                  # one thin place that calls the model
    models.py               # data classes / schemas
    cli.py                  # or app.py for the UI
  tests/
    test_match.py
    test_extract.py
  eval/
    labels.csv              # hand-labelled ground truth
    run_eval.py             # prints accuracy and writes a failures report
  docs/
    architecture.png        # one simple diagram`}</code>
          </pre>
          <Figure caption="Layering inside the repository. Keep the model call, the business rules and the interface separate so each can be tested and replaced.">
            <Layers
              layers={[
                { title: "Interface (cli.py or app.py)", note: "Parses input, prints or displays output. No business logic.", tone: "amber" },
                { title: "Business rules (match.py)", note: "Deterministic logic with unit tests. Where correctness lives.", tone: "lime" },
                { title: "Extraction and model calls (extract.py, llm.py)", note: "The only place that touches files or the model API. Easy to mock.", tone: "lime" },
                { title: "Schemas and config (models.py, config.py)", note: "Types and settings; one source of truth.", tone: "sky" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "repro",
      title: "One-command reproducibility",
      body: (
        <>
          <pre>
            <code>{`# Makefile
.PHONY: setup run test eval
setup:
	python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
run:
	. .venv/bin/activate && python -m invoice_checker.cli data/sample
test:
	. .venv/bin/activate && pytest -q
eval:
	. .venv/bin/activate && python eval/run_eval.py`}</code>
          </pre>
          <ul>
            <li><strong>Pin versions</strong> in <code>requirements.txt</code> (for example <code>pandas==2.2.2</code>) so the reviewer gets the same behaviour.</li>
            <li><strong>Provide <code>.env.example</code></strong> and never commit a key. Explain how to obtain one, or provide a recorded-response mode so the code runs without a key.</li>
            <li><strong>Make the app work offline from sample data</strong> if possible, so a missing key does not block the reviewer.</li>
            <li><strong>Test on a clean clone:</strong> clone into a new folder, follow only your README, and fix whatever breaks.</li>
          </ul>
          <Exercise
            title="Pick the stack"
            task={
              <p>
                Brief: a data-integration take-home with three exports, a requirement to
                &ldquo;surface duplicates for review&rdquo;, and a non-technical operations manager
                as the user. Pick language, storage, interface and testing, with one sentence each.
              </p>
            }
          >
            <ul>
              <li><strong>Language:</strong> Python with pandas, for the quickest, clearest data handling.</li>
              <li><strong>Storage:</strong> read inputs from files, write the cleaned dataset and a duplicates report as CSV and JSON; no database needed at this size.</li>
              <li><strong>Interface:</strong> a Streamlit page (or a single HTML report) where the manager sees duplicate groups and can mark merge or keep; the CLI exists for batch runs.</li>
              <li><strong>Testing:</strong> pytest for normalisation and duplicate-detection rules using small crafted examples, plus a check that row counts reconcile (input equals output plus rejected plus merged).</li>
            </ul>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Choose tools you are fluent in; novelty is not rewarded, working and readable is.",
    "Use boring defaults: Python or TypeScript, files or SQLite, a simple UI, pytest and pinned dependencies.",
    "Separate interface, business rules, model calls and schemas in a small, navigable repository.",
    "Make setup one command, keep keys out of Git, support offline sample runs, and test on a clean clone.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which storage choice is usually best for a six-hour take-home?",
      options: [
        "Files or SQLite, with a note on production alternatives",
        "A multi-node database cluster",
        "A custom storage engine",
        "No storage and no output",
      ],
      answer: 0,
      explain: "Simple storage keeps setup trivial for the reviewer and saves time.",
    },
    {
      kind: "mcq",
      q: "Why keep model calls in one thin module?",
      options: [
        "It is easy to mock, test and replace",
        "It hides the code",
        "Models require it",
        "It avoids tests",
      ],
      answer: 0,
      explain: "A single seam around the model simplifies testing and change.",
    },
    {
      kind: "mcq",
      q: "What should an .env.example contain?",
      options: [
        "Variable names with placeholder values, never real keys",
        "Real API keys",
        "Passwords",
        "Nothing",
      ],
      answer: 0,
      explain: "It documents required settings without exposing secrets.",
    },
    {
      kind: "text",
      q: "Which test confirms your README setup works for others? (three words: clean ...)",
      format: "***** ***** ***",
      accept: ["clean clone run", "clean-clone run", "clean clone", "clean checkout", "test on a clean clone"],
      explain: "Cloning into a fresh folder and following only the README exposes setup problems.",
    },
  ],
};
