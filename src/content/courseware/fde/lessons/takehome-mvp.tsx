import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 16,
  difficulty: "Medium",
  objectives: [
    "Define a minimum viable product for a fixed-time assignment",
    "Rank features by value to the user and cost to build",
    "Plan the hours in checkpoints with an explicit cut line",
    "Decide what to stub, what to describe and what to leave out",
    "Keep scope honest as you build",
  ],
  tasks: [
    {
      id: "mvp",
      title: "What an MVP means here",
      body: (
        <>
          <p>
            In a take-home, the <strong>minimum viable product</strong> is the smallest solution that
            lets the stated user complete the stated job, with evidence that it works and honest
            documentation of its limits. It is not the smallest piece of code; it is the smallest
            complete experience.
          </p>
          <p>A test for each candidate feature: <em>if I removed this, could the user still finish the main task?</em> If yes, it is not part of the MVP.</p>
          <Table
            head={["Feature", "Needed for the main task?", "In MVP?"]}
            rows={[
              ["Extract the four invoice fields", "Yes", "Yes"],
              ["Match to purchase orders", "Yes", "Yes"],
              ["Readable result view for a clerk", "Yes", "Yes (simple)"],
              ["Accuracy report on labelled data", "Yes (brief asks 'how well')", "Yes"],
              ["User accounts and login", "No", "No: describe"],
              ["Multi-currency support", "No", "Detect and flag only"],
              ["Handling scans with OCR", "Partly (some inputs)", "Basic fallback with a low-confidence flag"],
              ["Deployment to the cloud", "No", "No: provide a one-command local run"],
            ]}
          />
        </>
      ),
    },
    {
      id: "rank",
      title: "Rank by value and cost",
      body: (
        <>
          <DiagramReference lesson="takehome-mvp" panel={1} />
          <p>
            Then check <strong>risk</strong>. If something might break the whole project (can I read
            these PDFs at all?), test it in the first hour, even if it is not the most valuable item.
          </p>
        </>
      ),
    },
    {
      id: "plan",
      title: "Plan the hours with a cut line",
      body: (
        <>
          <DiagramReference lesson="takehome-mvp" panel={2} />
          <ul>
            <li>Write the <strong>cut line</strong> in advance: &ldquo;If at 3:30 the core is not working, drop OCR and the extra report.&rdquo;</li>
            <li>Commit working states often. A final state you can always return to is your safety net.</li>
            <li>Protect the packaging hour. Candidates who finish building at the deadline and rush the README lose more than the extra feature gains.</li>
          </ul>
          <Callout tone="warn" title="The scope creep checks">
            When you feel the urge to add &ldquo;just one more thing&rdquo;, ask: is it in the
            checklist? Does it improve the evidence the reviewer will see? Is there time left after
            the packaging hour? If not, write it under &ldquo;next steps&rdquo; instead.
          </Callout>
        </>
      ),
    },
    {
      id: "stub",
      title: "Build, stub or describe",
      body: (
        <>
          <Table
            head={["Treatment", "Use for", "Example"]}
            rows={[
              ["Build fully", "Core path and what the brief explicitly names", "Extraction and PO matching with tests"],
              ["Build minimally", "Needed for completeness but not central", "A plain HTML table instead of a polished dashboard"],
              ["Stub behind an interface", "Parts you can swap later and that would take hours to do properly", "A storage layer that writes JSON files, with a note on how to swap in a database"],
              ["Describe only", "Valuable but expensive", "Authentication, deployment, monitoring: a short design paragraph in the README"],
              ["Leave out", "Not relevant to the brief", "Anything decorative"],
            ]}
          />
          <Exercise
            title="Scope this brief"
            task={
              <p>
                &ldquo;Ingest customer feedback from three CSV exports, classify the sentiment and
                theme of each comment with an LLM, and show a product manager the top issues this
                month. Six hours.&rdquo; List what you will build, stub, describe and leave out, and
                name your cut line.
              </p>
            }
          >
            <ul>
              <li><strong>Build:</strong> load and normalise the three CSVs (with a record of dropped or merged rows); LLM classification into sentiment and a fixed theme list with structured output; a summary of top themes this month with example quotes.</li>
              <li><strong>Build minimally:</strong> a single static report page or notebook for the product manager, not a web app.</li>
              <li><strong>Evaluate:</strong> hand-label 40 comments and report agreement.</li>
              <li><strong>Stub:</strong> storage as local files behind a small interface.</li>
              <li><strong>Describe:</strong> scheduled ingestion, dashboards, authentication, cost at 1 million comments.</li>
              <li><strong>Leave out:</strong> UI polish, multi-language support.</li>
              <li><strong>Cut line:</strong> if the classification is not working by hour 3, drop the theme discovery and use a fixed theme list only.</li>
            </ul>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "The MVP is the smallest complete experience for the stated user, with evidence and honest limits.",
    "Rank features by value and cost, and de-risk anything that could break the project in the first hour.",
    "Plan hours with checkpoints and a pre-written cut line; protect the packaging hour.",
    "Build core, build minimally, stub behind interfaces, describe, or leave out; do not half-build.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What test decides if a feature belongs in the MVP?",
      options: [
        "Could the user still finish the main task without it?",
        "Is it interesting to build?",
        "Does it use a new library?",
        "Is it visually attractive?",
      ],
      answer: 0,
      explain: "If the main task can be completed without it, it is not part of the minimum.",
    },
    {
      kind: "mcq",
      q: "What is the purpose of a pre-written cut line?",
      options: [
        "To decide in advance what to drop if you fall behind",
        "To avoid planning",
        "To add more features",
        "To skip testing",
      ],
      answer: 0,
      explain: "Deciding calmly beforehand prevents panicked scope decisions at the end.",
    },
    {
      kind: "mcq",
      q: "Authentication would take hours and is not in the brief. What should you do?",
      options: [
        "Describe a design in the README rather than building it",
        "Build it fully",
        "Hide that it is missing",
        "Remove the README",
      ],
      answer: 0,
      explain: "Describing valuable but expensive features shows awareness without costing time.",
    },
    {
      kind: "text",
      q: "In the six-hour plan, how many minutes are reserved for the final packaging phase (5:15 to 6:00)?",
      format: "**",
      accept: ["45", "45 minutes", "45 min"],
      explain: "6:00 minus 5:15 is 45 minutes.",
    },
  ],
};
