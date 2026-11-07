import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 16,
  difficulty: "Easy",
  objectives: [
    "Explain how reviewers typically read and score a take-home submission",
    "Distinguish what earns points from what only looks impressive",
    "Allocate your limited hours across understanding, building, testing and communication",
    "Avoid the common pattern of polished code with no evidence it works",
  ],
  tasks: [
    {
      id: "reader",
      title: "Imagine the reviewer",
      body: (
        <>
          <p>
            A take-home is read by a busy engineer with a stack of submissions. They have 20 to 40
            minutes per candidate, a scorecard, and a question in mind: <em>would I trust this person
            to own a customer deployment?</em> They are looking for evidence, quickly.
          </p>
          <DiagramReference lesson="takehome-scoring" panel={1} />
          <p>
            Two consequences follow. A submission that fails to run in the first five minutes loses
            most of its credibility, however good the code. And a clear README and a short demo are
            not extras; they are the interface through which all your work is judged.
          </p>
        </>
      ),
    },
    {
      id: "scorecard",
      title: "What the scorecard rewards",
      body: (
        <>
          <p>
            Scorecards differ, but they usually weigh these areas. The weights below are typical
            rather than official:
          </p>
          <Table
            head={["Area", "Typical weight", "What earns a high score"]}
            rows={[
              ["Problem understanding", "15%", "Requirements correctly read; assumptions stated; the user's workflow in mind"],
              ["Working solution", "25%", "It runs, handles the main path and some edge cases, and produces correct output"],
              ["Engineering quality", "20%", "Clear structure, sensible error handling, tests for the important parts, reproducible setup"],
              ["Judgment and scope", "15%", "Sensible MVP; stated trade-offs; no gold-plating; honest about limits"],
              ["Data and AI handling", "10%", "Messy data handled; LLM use evaluated and guarded; cost aware"],
              ["Communication", "15%", "README, diagram, walk-through and defence of decisions"],
            ]}
          />
          <DiagramReference lesson="takehome-scoring" panel={2} />
        </>
      ),
    },
    {
      id: "impress",
      title: "What impresses, and what only seems to",
      body: (
        <>
          <Table
            head={["Looks impressive but scores low", "Quietly scores high"]}
            rows={[
              ["Many features, none finished", "One workflow finished end to end with edge cases handled"],
              ["A complex architecture for a small problem", "A simple structure with a note on what would change at scale"],
              ["The newest framework everywhere", "Boring, reliable tools you can explain"],
              ["Long README with marketing language", "Short README: what, how to run, how it works, limits"],
              ["Silent assumptions", "An assumptions list with reasons"],
              ["No tests, or tests that only assert 'true'", "A few meaningful tests on the riskiest logic"],
              ["Claiming the LLM output is accurate", "A small evaluation with results and failure cases"],
            ]}
          />
          <Callout tone="warn" title="Do not over-engineer">
            A common failure is to spend 12 hours on a design suitable for a company-wide platform.
            Reviewers read this as poor scoping, which is exactly what FDEs must avoid. Build what
            the brief needs, and describe the rest.
          </Callout>
        </>
      ),
    },
    {
      id: "time",
      title: "Budgeting your hours",
      body: (
        <>
          <p>
            Most take-homes suggest 4 to 8 hours and many candidates quietly spend more. Respect the
            stated limit; some companies check, and a tight, well-scoped solution is a positive
            signal. A reasonable split for a 6-hour budget:
          </p>
          <Table
            head={["Activity", "Hours", "Share"]}
            rows={[
              ["Read the brief, ask questions, write assumptions, plan", "0.75", "12%"],
              ["Set up repo, environment, data loading", "0.75", "12%"],
              ["Core build of the main workflow", "2.0", "33%"],
              ["Edge cases, validation, error handling", "0.75", "12%"],
              ["Tests and evaluation", "0.75", "12%"],
              ["README, trade-offs, diagram, demo recording", "1.0", "17%"],
            ]}
          />
          <Exercise
            title="Triage a time crunch"
            task={
              <p>
                You have 90 minutes left. The core works, but you have no tests, no README, and two
                unfinished features. What do you do?
              </p>
            }
          >
            <p>
              Cut the unfinished features and remove half-working code, since broken features hurt
              more than absent ones. Spend 30 minutes on tests for the riskiest logic and the main
              path, 30 minutes on a README (what it does, how to run, assumptions, limitations) and
              the list of what you would build next, and 20 minutes recording a short demo and
              verifying the setup on a clean checkout. Keep 10 minutes in reserve.
            </p>
            <p>
              The unfinished features go into the README as &ldquo;next steps&rdquo; with an
              explanation of how you would approach them. That earns more credit than half-built code.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Reviewers form views fast: README, run, demo, code and tests, then trade-offs.",
    "Scorecards reward understanding, a working solution, engineering quality, judgment, data and AI handling, and communication.",
    "Finished and simple beats ambitious and unfinished; do not over-engineer.",
    "Budget hours deliberately, respect the stated limit, and protect time for README, tests and demo.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What forms a reviewer's first and strongest impression?",
      options: [
        "Whether the README is clear and the project runs quickly",
        "The number of files",
        "The commit count",
        "The framework name",
      ],
      answer: 0,
      explain: "If it does not run or explain itself in minutes, everything else is overshadowed.",
    },
    {
      kind: "mcq",
      q: "You run out of time with two half-built features. What should you do?",
      options: [
        "Remove the half-built code and describe the features as next steps",
        "Leave broken code in",
        "Submit late with no README",
        "Delete the tests",
      ],
      answer: 0,
      explain: "Half-working features hurt more than honest, well-described omissions.",
    },
    {
      kind: "mcq",
      q: "Which signals good judgment in a take-home?",
      options: [
        "A simple design with stated trade-offs and assumptions",
        "The most complex architecture possible",
        "No documentation",
        "Using every new library",
      ],
      answer: 0,
      explain: "Scope discipline and explicit reasoning are what FDEs need.",
    },
    {
      kind: "text",
      q: "In a 6-hour budget, 2 hours go to the core build. What percentage of the total is that?",
      format: "**%",
      accept: ["33", "33%", "33.3", "33.3%"],
      explain: "2 / 6 is about 33%.",
    },
  ],
};
