import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 16,
  difficulty: "Easy",
  objectives: [
    "Extract goals, deliverables, constraints and hidden expectations from a brief",
    "Separate must-haves from nice-to-haves and from things that are simply context",
    "Convert the brief into a checklist you can verify against before submitting",
    "Decide what to ask the company, and how to ask it",
  ],
  tasks: [
    {
      id: "method",
      title: "Read it three times",
      body: (
        <>
          <p>
            Many candidates read a brief once, start coding, and discover in hour five that they
            missed a requirement. A disciplined reading takes twenty minutes and saves hours.
          </p>
          <DiagramReference lesson="takehome-reading-brief" panel={1} />
        </>
      ),
    },
    {
      id: "example",
      title: "A worked example",
      body: (
        <>
          <pre>
            <code>{`BRIEF
Northwind Freight receives supplier invoices as PDFs and CSV exports. Finance wants a
tool that extracts the supplier, invoice number, date and total from each invoice and
checks it against the purchase-order list. Build a small solution that a finance clerk
could use, and tell us how well it works. Spend around six hours. You may use any
language and any public LLM API. Do not use real customer data. Submit a repository
with a README and a short video walk-through.

Data: /invoices (40 PDFs), purchase_orders.csv`}</code>
          </pre>
          <Table
            head={["Extracted item", "Type", "Notes"]}
            rows={[
              ["Extract supplier, invoice number, date, total", "Must", "Core function; four named fields"],
              ["Check against purchase-order list", "Must", "Matching logic; define what 'matches' means"],
              ["Usable by a finance clerk", "Must (implied)", "Needs a simple interface or at least readable output; not raw logs"],
              ["Tell us how well it works", "Must", "An evaluation: ground truth, accuracy, failure analysis"],
              ["About six hours", "Constraint", "Scope accordingly; do not exceed by much"],
              ["Any language, any public LLM API", "Freedom", "Choose what you can finish with; note cost"],
              ["No real customer data", "Constraint", "Use provided data only; do not paste into unapproved tools beyond the allowed API"],
              ["README and short video", "Deliverables", "Plan time for both"],
              ["PDFs, some may be scanned", "Hidden", "Likely mixed quality: check; plan fallback and flag low-confidence"],
            ]}
          />
          <p>
            The last row is a <strong>hidden expectation</strong>: the brief did not say the PDFs vary
            in quality, but real invoices always do. Spending ten minutes opening all 40 files before
            designing anything is exactly the kind of discovery the role requires.
          </p>
        </>
      ),
    },
    {
      id: "questions",
      title: "Deciding what to ask",
      body: (
        <>
          <p>
            Some companies allow questions to a recruiter or engineer; some do not. If allowed, ask a
            few high-value questions, early, in one message. If not, write your assumption instead.
          </p>
          <Table
            head={["Good question", "Weak question"]}
            rows={[
              ["'Should unmatched invoices be rejected, or flagged for the clerk to review?'", "'What should I build?'"],
              ["'Is accuracy on the four fields judged per field or per invoice?'", "'Can you tell me the best approach?'"],
              ["'Are scanned invoices in scope, or should I focus on text PDFs?'", "'Is the LLM allowed?' (the brief already says so)"],
              ["'May I assume one currency?'", "A long message with ten questions"],
            ]}
          />
          <Callout tone="tip" title="Ask with a default">
            Phrase questions as &ldquo;I plan to do X unless you prefer Y.&rdquo; It shows you can
            move without waiting, and it makes it easy for the reader to reply with a one-word answer.
          </Callout>
          <Exercise
            title="Extract the checklist"
            task={
              <p>
                Brief excerpt: &ldquo;Our field engineers send photos of damaged equipment with a
                short note. Build a service that classifies the damage severity (minor, moderate,
                severe), suggests a repair category, and stores the result so supervisors can review.
                It should handle a few hundred reports a day. Provide documentation.&rdquo; Write the
                checklist and one hidden expectation.
              </p>
            }
          >
            <ul>
              <li><strong>Must:</strong> classify severity into three classes; suggest a repair category; store results; supervisor review access; documentation.</li>
              <li><strong>Should:</strong> handle a few hundred reports a day (so, simple batch or queue; no need for heavy scale); basic validation of photos and notes.</li>
              <li><strong>Hidden expectations:</strong> a way to measure correctness (labelled examples), handling of low-quality photos or empty notes, and a confidence or &ldquo;needs human&rdquo; path for borderline cases, since severity decisions affect safety and cost.</li>
              <li><strong>Ask:</strong> &ldquo;Are labelled examples provided? If not, I will label 30 myself and say so.&rdquo;</li>
            </ul>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Read the brief three times: understand, extract, interrogate.",
    "Turn the brief into a must, should and could checklist and verify against it before submitting.",
    "Look for hidden expectations such as data quality, usability for the stated user and an evaluation.",
    "If you may ask questions, ask a few high-value ones with a default; otherwise record assumptions.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A brief says 'a finance clerk could use it'. What does that imply?",
      options: [
        "A usable interface or readable output, not only code",
        "No interface is needed",
        "Clerks write the code",
        "It must be mobile",
      ],
      answer: 0,
      explain: "The named user defines the usability bar.",
    },
    {
      kind: "mcq",
      q: "What is the best way to phrase a clarifying question?",
      options: [
        "State a default and ask whether they prefer otherwise",
        "Ask an open question with no default",
        "Send ten questions at once",
        "Avoid asking",
      ],
      answer: 0,
      explain: "Defaults show initiative and make replies easy.",
    },
    {
      kind: "mcq",
      q: "Which is a hidden expectation in an invoice extraction brief?",
      options: [
        "Invoices will vary in format and quality",
        "The invoices are perfect",
        "No evaluation is needed",
        "Only one invoice exists",
      ],
      answer: 0,
      explain: "Real documents vary, and good candidates look at the data before designing.",
    },
    {
      kind: "text",
      q: "How many passes through the brief does the lesson recommend? (a number)",
      format: "*",
      accept: ["3", "three"],
      explain: "Understand, extract, interrogate.",
    },
  ],
};
