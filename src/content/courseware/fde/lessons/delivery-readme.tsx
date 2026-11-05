import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Layers } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 16,
  difficulty: "Easy",
  objectives: [
    "Write a README that lets a reviewer understand, run and judge your work in five minutes",
    "Order sections by what the reader needs first",
    "Include results, assumptions, limitations and next steps honestly",
    "Use a diagram and a short example output effectively",
  ],
  tasks: [
    {
      id: "role",
      title: "The README is the front door",
      body: (
        <>
          <p>
            The reviewer opens your repository and reads the README before anything else. It decides
            whether they approach the rest with confidence or irritation. A good README is the
            deliverable that explains all the others.
          </p>
          <Figure caption="Sections in the order a reviewer needs them. Each answers one question and earns its place by being short.">
            <Layers
              layers={[
                { title: "1. What and why", note: "Two or three sentences: the problem, the user and what this does.", tone: "amber" },
                { title: "2. Quick start", note: "Three commands to run it, with and without an API key (demo mode).", tone: "amber" },
                { title: "3. Demo", note: "A screenshot or short output example, and a link to the walk-through video.", tone: "lime" },
                { title: "4. How it works", note: "One diagram and a short description of the main components and data flow.", tone: "lime" },
                { title: "5. Results", note: "Evaluation numbers, a failure analysis and what changed because of it.", tone: "lime" },
                { title: "6. Assumptions and trade-offs", note: "The assumptions log and the key decisions with reasons.", tone: "sky" },
                { title: "7. Limitations and next steps", note: "Honest limits and what you would build with more time or in production.", tone: "sky" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "template",
      title: "A template you can adapt",
      body: (
        <>
          <pre>
            <code>{`# Invoice Checker

Reads supplier invoices (PDF/CSV), extracts supplier, invoice number, date and total,
and checks each against the purchase-order list so a finance clerk only reviews the
exceptions. On the 40 sample invoices it matched 31 automatically and flagged 9 for review.

## Quick start
    make setup
    make run            # runs on data/sample; opens the review page
    make test && make eval
No API key? Set DEMO=1 to run from recorded model outputs.

## Demo
![review screen](docs/review.png) · [3-minute walk-through](https://example.com/video)

## How it works
![architecture](docs/architecture.png)
1. Extract text (PDF text, OCR fallback for scans).
2. Model extracts fields as JSON with evidence; code validates and grounds them.
3. Rules match to purchase orders; mismatches and low confidence are flagged.
4. A clerk reviews flagged items; decisions are saved to out/decisions.csv.

## Results (n = 40, hand-labelled by me)
| Field | Exact match |
|---|---|
| supplier | 95% |
| invoice number | 90% |
| date | 88% |
| total | 93% |
All four fields correct on 82% of invoices. Main failures: scanned pages (4), ambiguous
dates (2). Fixes tried and effect are in docs/error-analysis.md.

## Assumptions
A1 Unmatched invoices are flagged, never rejected. A2 All amounts USD; other currencies flagged.

## Trade-offs
SQLite-free (files only) to keep setup trivial; swap in a database for concurrent users.
A smaller model for extraction, escalating only low-confidence cases: ~$0.01 per invoice.

## Limitations and next steps
Only 40 labelled examples; one labeller. No authentication. Next: larger evaluation set,
SSO, a queue for bursts, monitoring of accuracy drift.`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "style",
      title: "Writing style that helps",
      body: (
        <>
          <Table
            head={["Do", "Avoid"]}
            rows={[
              ["Short sentences and concrete numbers", "Marketing language ('robust, scalable, cutting-edge')"],
              ["Lead with the result", "Burying results at the bottom"],
              ["Show real output", "Describing output without showing it"],
              ["State limits plainly", "Hiding known failures"],
              ["Use one clear diagram", "Five diagrams with tiny text"],
              ["Link to deeper notes (error analysis, decisions)", "A 2,000-word README"],
              ["Test your commands on a clean clone", "Commands you did not run"],
            ]}
          />
          <Callout tone="tip" title="Write it for the tired reviewer">
            Imagine the person reading it at 6 p.m., after ten other submissions. Make the first
            screen impossible to misunderstand and the quick start impossible to get wrong.
          </Callout>
          <Exercise
            title="Fix the opening"
            task={
              <p>
                A README begins: &ldquo;This is a cutting-edge, scalable AI-powered solution leveraging
                state-of-the-art LLMs to revolutionise invoice processing.&rdquo; Rewrite the first
                two sentences.
              </p>
            }
          >
            <p>
              &ldquo;Invoice Checker reads supplier invoices and checks them against the
              purchase-order list, so a finance clerk only reviews the exceptions. On 40 sample
              invoices it matched 31 automatically and flagged 9 for review, cutting handling time
              from about 8 minutes to under 1 minute for the matched ones.&rdquo;
            </p>
            <p>
              The rewrite names the problem, user, outcome and a number, in plain words. Every claim
              can be checked in the repository.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "The README is the front door: order it by what the reader needs first.",
    "Include what and why, quick start, demo, how it works, results, assumptions, trade-offs, limitations and next steps.",
    "Lead with results and real output, use plain language and numbers, and link to deeper notes.",
    "Test every command on a clean clone and write for a tired reviewer.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What should appear first in a README?",
      options: [
        "What the project does and for whom, with a result",
        "A list of dependencies",
        "Your biography",
        "A long theory section",
      ],
      answer: 0,
      explain: "Reviewers need to understand the purpose within seconds.",
    },
    {
      kind: "mcq",
      q: "Which phrase is best in a README?",
      options: [
        "Matched 31 of 40 invoices automatically and flagged 9 for review",
        "A revolutionary AI-powered platform",
        "Very fast and robust",
        "State-of-the-art accuracy",
      ],
      answer: 0,
      explain: "Concrete, checkable numbers beat marketing language.",
    },
    {
      kind: "mcq",
      q: "Where do honest limitations belong?",
      options: [
        "In a dedicated section, with next steps",
        "Nowhere",
        "Hidden in comments",
        "Only in the video",
      ],
      answer: 0,
      explain: "Stated limits show judgment and build trust.",
    },
    {
      kind: "text",
      q: "How many commands should the quick start ideally need? (a number)",
      format: "*",
      accept: ["3", "three"],
      explain: "Three commands or fewer keeps setup effortless.",
    },
  ],
};
