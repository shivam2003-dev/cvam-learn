import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Easy",
  objectives: [
    "Recognise the twelve most common take-home mistakes before you make them",
    "Rank mistakes by how much damage they do and how easy they are to avoid",
    "Run a ten-minute self-audit on a finished submission",
    "Turn each mistake into a concrete habit",
  ],
  tasks: [
    {
      id: "list",
      title: "The twelve common mistakes",
      body: (
        <>
          <p>
            Reviewers see the same failures again and again. Most come from poor scoping or poor
            communication rather than weak technical skill, which means they are fixable.
          </p>
          <Table
            head={["#", "Mistake", "What it looks like", "The habit that prevents it"]}
            rows={[
              ["1", "Does not run on a clean machine", "Missing dependency, hard-coded path, needs a secret", "Clean-clone test; pinned dependencies; demo mode"],
              ["2", "No README or a vague one", "Reviewer cannot tell what it does", "Lead with what, who and results; three-command quick start"],
              ["3", "Over-engineering", "Microservices for one script", "Smallest design that meets the brief; describe the rest"],
              ["4", "Under-delivering the core", "Fancy extras, but the main task is flaky", "Finish the core path first; cut extras"],
              ["5", "No evidence it works", "'It seems accurate'", "A small labelled evaluation and a failure analysis"],
              ["6", "Silent data handling", "Rows dropped or merged without a record", "Ledger and row reconciliation"],
              ["7", "Hidden assumptions", "A different interpretation of the brief", "Assumptions log near the top"],
              ["8", "Ignoring the user", "Output only an engineer could read", "Design around the user's workflow"],
              ["9", "Secrets or personal data committed", "Keys in history or a real customer file", "Environment variables; search history; synthetic data"],
              ["10", "No tests, or fake tests", "Tests that assert true", "A few meaningful tests on risky logic"],
              ["11", "Overclaiming", "'99% accurate' on ten examples", "Report sample size and uncertainty"],
              ["12", "Rushed or missing walk-through", "Reads the README, runs long, or skipped", "Script, rehearse, five minutes, show value first"],
            ]}
          />
        </>
      ),
    },
    {
      id: "rank",
      title: "Which hurt most",
      body: (
        <>
          <DiagramReference lesson="delivery-mistakes" panel={1} />
          <Callout tone="note" title="A pattern">
            The most damaging mistakes (not running, no README, secrets) are also the easiest to
            avoid with a clean-clone check and a checklist. The harder ones (no evidence, ignoring the
            user) need habits you build in the course exercises.
          </Callout>
        </>
      ),
    },
    {
      id: "audit",
      title: "A ten-minute self-audit",
      body: (
        <>
          <p>
            Before submitting, run this audit as if you were the reviewer. Time yourself.
          </p>
          <Table
            head={["Minute", "Check", "Pass if"]}
            rows={[
              ["0 to 2", "Clone to a new folder; follow only the README", "Runs in three commands; no missing steps"],
              ["2 to 3", "Read the first screen of the README", "A stranger can say what it does and for whom"],
              ["3 to 5", "Run tests and the evaluation", "Pass; numbers match the README"],
              ["5 to 6", "Open the demo or UI with a fresh eye", "Value visible in under a minute; clear states"],
              ["6 to 8", "Search for secrets and personal data (code, history, data files)", "None found"],
              ["8 to 9", "Check assumptions and limitations", "Present, specific, quantified"],
              ["9 to 10", "Open the walk-through link in a private window", "Plays; no secrets visible; under five minutes"],
            ]}
          />
          <Exercise
            title="Audit this submission"
            task={
              <p>
                A submission has: a README with an install command but no description; hard-coded
                absolute file paths; an API key in <code>config.py</code>; 94% accuracy claimed on
                &ldquo;test data&rdquo;; a 12-minute video that reads the README. List the issues in
                priority order with one fix each.
              </p>
            }
          >
            <ol>
              <li><strong>API key in config.py:</strong> revoke and rotate it, move to an environment variable, and clean history. Highest priority: security and credibility.</li>
              <li><strong>Hard-coded absolute paths:</strong> use relative paths from the project root; test on a clean clone. Otherwise it will not run.</li>
              <li><strong>README without description:</strong> add what and why, quick start, results and limits.</li>
              <li><strong>Unsupported accuracy claim:</strong> report sample size, how labelled, per-field results and the main failures; avoid a single headline number.</li>
              <li><strong>12-minute video reading the README:</strong> re-record at five minutes: problem, demo, design, evidence, limits.</li>
            </ol>
            <p>
              Nothing here requires new engineering; each is a habit. That is why these mistakes are
              so costly: they are cheap to avoid.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Most take-home failures come from scoping and communication, not weak coding, so they are fixable.",
    "The most damaging mistakes, such as a project that will not run, a missing README and committed secrets, are also the easiest to prevent.",
    "Harder habits: evidence of correctness, designing for the user and honest data handling.",
    "Run a ten-minute reviewer-style audit on a clean clone before every submission.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which mistake is both severe and easy to avoid?",
      options: [
        "A project that does not run on a clean machine",
        "A slightly imperfect colour scheme",
        "A longer function name",
        "Using tabs",
      ],
      answer: 0,
      explain: "A clean-clone test catches it in minutes, and it can sink a submission.",
    },
    {
      kind: "mcq",
      q: "Claiming 99% accuracy on ten examples is an example of:",
      options: ["Overclaiming", "Good evidence", "Scoping", "Reproducibility"],
      answer: 0,
      explain: "Small samples cannot support strong claims; report size and uncertainty.",
    },
    {
      kind: "mcq",
      q: "An API key is found in your repository. First action?",
      options: [
        "Revoke and rotate it, then clean the history",
        "Delete the file only",
        "Ignore it",
        "Rename the key",
      ],
      answer: 0,
      explain: "Exposed keys must be considered compromised.",
    },
    {
      kind: "text",
      q: "How many minutes does the self-audit take? (a number)",
      format: "**",
      accept: ["10", "ten"],
      explain: "A ten-minute audit as the reviewer would see it.",
    },
  ],
};
