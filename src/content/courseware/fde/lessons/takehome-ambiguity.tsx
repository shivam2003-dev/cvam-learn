import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Easy",
  objectives: [
    "Handle unavoidable ambiguity by deciding, recording and moving on",
    "Write an assumptions log that a reviewer can read in one minute",
    "Choose between asking, assuming and building flexibly",
    "Revisit an assumption when evidence contradicts it",
  ],
  tasks: [
    {
      id: "stance",
      title: "A stance toward ambiguity",
      body: (
        <>
          <p>
            Every brief is ambiguous. The reviewer knows this; handling it is part of the test. Weak
            candidates freeze, build a giant system to cover every interpretation, or silently pick
            one. Strong candidates make a visible decision.
          </p>
          <DiagramReference lesson="takehome-ambiguity" panel={1} />
        </>
      ),
    },
    {
      id: "log",
      title: "The assumptions log",
      body: (
        <>
          <p>
            An assumptions log is a short table in your README. It turns hidden decisions into visible
            ones, protects you from being judged on a different interpretation, and shows structured
            thinking.
          </p>
          <Table
            head={["#", "Ambiguity", "Assumption", "Why", "Impact if wrong"]}
            rows={[
              ["A1", "Brief does not say how to handle unmatched invoices", "Flag for review; never auto-reject", "A clerk can resolve; rejecting loses real invoices", "Low: change one rule"],
              ["A2", "Currency not stated", "All amounts are USD; currency field kept for future", "All sample invoices show $", "Medium: needs conversion logic"],
              ["A3", "'How well it works' not defined", "Per-field exact match on the 4 fields, plus invoice-level 'all correct'", "Easy to compute and explain", "Low"],
              ["A4", "Scanned PDFs possible", "OCR fallback for a few; flagged as low confidence", "6 of 40 sample files are scans", "Medium: accuracy lower on scans"],
              ["A5", "Time limit is six hours", "Stopped at about six; list of next steps included", "Respecting the stated budget", "None"],
            ]}
          />
          <ul>
            <li>Keep it to the assumptions that matter. Five to ten rows is plenty.</li>
            <li>Put the assumption log near the top of the README, so the reviewer reads it before judging behaviour.</li>
            <li>Write the &ldquo;impact if wrong&rdquo; column. It shows you know which assumptions are risky.</li>
          </ul>
        </>
      ),
    },
    {
      id: "revisit",
      title: "When reality contradicts an assumption",
      body: (
        <>
          <p>
            You will sometimes discover mid-build that an assumption was wrong. For example, you
            assumed all amounts were USD, then find a handful of invoices in EUR in hour four.
          </p>
          <ol>
            <li><strong>Check the cost of changing</strong> versus the benefit.</li>
            <li><strong>Decide:</strong> handle it fully, handle it minimally (detect and flag), or leave it and document.</li>
            <li><strong>Update the log:</strong> change the row, note the evidence and the decision.</li>
            <li><strong>Mention it in your walk-through</strong> as an example of learning from the data.</li>
          </ol>
          <Callout tone="tip" title="Detect and flag is a powerful default">
            When you cannot handle a case fully, detecting it and routing it to a human is usually
            better than ignoring it or guessing. &ldquo;Currency other than USD: flagged for review,
            not converted&rdquo; is a defensible, honest behaviour.
          </Callout>
          <Exercise
            title="Write three assumptions"
            task={
              <p>
                Brief: &ldquo;Build a dashboard that shows weekly sales performance by region for a
                regional manager.&rdquo; List three ambiguities with an assumption, a reason and the
                impact if wrong.
              </p>
            }
          >
            <ol>
              <li>
                <strong>&ldquo;Sales performance&rdquo; undefined:</strong> assume revenue and units,
                compared with the previous week and the same week last year; reason: the most common
                measures for a regional manager; impact if wrong: medium, metrics are easy to add but
                the headline may differ.
              </li>
              <li>
                <strong>Week boundaries:</strong> assume ISO weeks (Monday to Sunday) in the region&apos;s
                time zone; reason: standard and easy to state; impact: low.
              </li>
              <li>
                <strong>Returns and cancellations:</strong> assume net of returns, with returns shown
                separately; reason: gross sales would overstate performance; impact: medium, since it
                changes the numbers.
              </li>
            </ol>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Handle ambiguity by choosing visibly: ask if cheap and important, assume and record otherwise, build flexibly when both options are cheap.",
    "An assumptions log with the reason and impact if wrong turns hidden decisions into visible reasoning.",
    "When reality contradicts an assumption, weigh cost, decide, update the log and mention it in your walk-through.",
    "Detect and flag is a strong default for cases you cannot fully handle.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "When is it best to ask rather than assume?",
      options: [
        "When asking is cheap and a wrong guess would be costly",
        "Never",
        "Always, for every detail",
        "Only after submitting",
      ],
      answer: 0,
      explain: "Asking is valuable when the cost of being wrong is high and someone can answer.",
    },
    {
      kind: "mcq",
      q: "Why include 'impact if wrong' in the assumptions log?",
      options: [
        "It shows you understand which assumptions are risky",
        "It lengthens the table",
        "It is required by Git",
        "It replaces tests",
      ],
      answer: 0,
      explain: "Risk awareness is part of good judgment.",
    },
    {
      kind: "mcq",
      q: "You find EUR invoices after assuming all USD. A sound response is to:",
      options: [
        "Detect and flag them, update the log and mention it in the walk-through",
        "Silently convert at a guessed rate",
        "Delete them",
        "Ignore it",
      ],
      answer: 0,
      explain: "Detect-and-flag is honest and safe when you cannot fully handle a case.",
    },
    {
      kind: "text",
      q: "Where in the README should the assumptions log appear? (one word)",
      format: "***",
      accept: ["top", "near the top", "the top"],
      explain: "Near the top, so reviewers read it before judging behaviour.",
    },
  ],
};
