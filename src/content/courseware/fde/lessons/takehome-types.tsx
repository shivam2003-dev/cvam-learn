import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 16,
  difficulty: "Easy",
  objectives: [
    "Recognise the five common take-home types and what each is testing",
    "Predict the typical traps in each type",
    "Choose a preparation exercise for each",
    "Identify a hybrid assignment and plan for each component",
  ],
  tasks: [
    {
      id: "map",
      title: "Five common shapes",
      body: (
        <>
          <p>
            Take-homes vary, but most fall into a few families. Recognising which one you hold in the
            first ten minutes tells you where the traps are and where to spend your time.
          </p>
          <Figure caption="The five take-home families and the main skill each probes. Hybrid assignments combine two or three.">
            <Graph
              label="Take-home assignment types: data integration, LLM application, analytics and dashboard, debugging and repair, and API service, each with its main skill"
              cellW={206}
              cellH={104}
              nodeW={172}
              nodes={[
                { id: "t", label: "Take-home", col: 1.5, row: 1, tone: "lime", shape: "pill", w: 160 },
                { id: "di", label: "Data integration", sub: "Join and clean messy sources", col: 0, row: 0, tone: "sky" },
                { id: "llm", label: "LLM application", sub: "Prompts, retrieval, evaluation", col: 3, row: 0, tone: "amber" },
                { id: "an", label: "Analytics + dashboard", sub: "Insight and presentation", col: 0, row: 2, tone: "sky" },
                { id: "dbg", label: "Debug and repair", sub: "Find and fix in an unfamiliar repo", col: 1.5, row: 2.2, tone: "rose" },
                { id: "api", label: "API service", sub: "Design and build an interface", col: 3, row: 2, tone: "amber" },
              ]}
              edges={[
                { from: "t", to: "di" },
                { from: "t", to: "llm" },
                { from: "t", to: "an" },
                { from: "t", to: "dbg" },
                { from: "t", to: "api" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "table",
      title: "What each type tests",
      body: (
        <>
          <Table
            head={["Type", "Example brief", "Real skill under test", "Typical traps"]}
            rows={[
              ["Data integration", "Merge three CSV and JSON exports of customers and orders, resolve duplicates, output a clean dataset and a report", "Profiling, cleaning, joining, validation, honest handling of bad data", "Silently dropping rows; wrong join fan-out; no record of what was changed"],
              ["LLM application", "Build an assistant that answers questions over a set of documents, or extracts fields from emails", "Prompting, retrieval, structured output, evaluation, guardrails, cost", "No evaluation; trusting output; hallucinated citations; ignoring cost"],
              ["Analytics and dashboard", "Analyse sales data and present insights to a manager", "Asking the right question, correct aggregation, clear communication", "Fan-out sums; pretty charts with no conclusion; hidden assumptions"],
              ["Debug and repair", "Fix a failing integration script in a provided repo and explain the root cause", "Reading unfamiliar code, hypothesis-driven debugging, minimal safe fixes", "Rewriting everything; fixing symptoms; no regression test"],
              ["API service", "Build a small service exposing cleaned data with authentication and pagination", "Interface design, validation, errors, documentation", "Inconsistent errors; missing pagination; no tests; secrets in code"],
            ]}
          />
          <Callout tone="note" title="Hybrids are common">
            A realistic brief might ask you to ingest messy customer data (integration), enrich it with
            an LLM (application), expose it through an endpoint (API), and write up findings
            (analytics). Break it into components, rank them by importance to the brief, and decide
            which to build fully, which to stub and which to describe.
          </Callout>
        </>
      ),
    },
    {
      id: "prep",
      title: "Practice by type",
      body: (
        <>
          <Table
            head={["Type", "Two-hour practice exercise", "Skill it trains"]}
            rows={[
              ["Data integration", "Download two public datasets with overlapping entities; merge, dedupe, validate; report rows dropped and why", "Honest data handling"],
              ["LLM application", "Build a Q and A over five documents with citations and a 20-question evaluation", "Evaluation habit"],
              ["Analytics", "Answer three business questions from a sales dataset and write a half-page memo", "Insight, not charts"],
              ["Debug and repair", "Take an open-source issue labelled 'good first issue' and fix it with a test", "Reading and minimal change"],
              ["API service", "Expose a CSV through a small authenticated, paginated API with tests", "Interface discipline"],
            ]}
          />
          <Exercise
            title="Classify the brief"
            task={
              <p>
                Brief: &ldquo;Attached are 2,000 support emails and a product FAQ. Build something
                that suggests replies to agents and tells us how well it works. Spend about six
                hours.&rdquo; Which types are involved, and how would you split your six hours?
              </p>
            }
          >
            <p>
              <strong>Types:</strong> primarily an <em>LLM application</em> (reply suggestion with
              retrieval from the FAQ), plus <em>analytics</em> (&ldquo;tells us how well it works&rdquo;
              means evaluation and a report), with light <em>data handling</em> of the emails.
            </p>
            <p>
              <strong>Split:</strong> 0.75 reading, assumptions and data profiling; 2 hours building
              retrieval and reply generation with a simple review interface; 1.5 hours on the
              evaluation (label 40 emails, score replies, analyse failures); 0.75 on guardrails and
              edge cases (personal data, abusive emails, no FAQ match); 1 hour on README, results and
              demo. The evaluation deserves real time because it is the explicit second half of the
              brief.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Common take-home families: data integration, LLM application, analytics and dashboards, debug and repair, and API services.",
    "Each type has a signature skill and a characteristic trap; identify the type in the first ten minutes.",
    "Hybrid briefs need component ranking: build the core fully, stub supporting parts and describe the rest.",
    "Practise each type in short, focused two-hour exercises.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A brief says 'tell us how well it works'. What does this add to your work?",
      options: [
        "An evaluation and a report of results",
        "Nothing extra",
        "A new logo",
        "A larger model",
      ],
      answer: 0,
      explain: "Explicit measurement requests mean evaluation is part of the deliverable.",
    },
    {
      kind: "mcq",
      q: "In a debug-and-repair task, what is the expected approach?",
      options: [
        "Form hypotheses, find the root cause and make a minimal fix with a regression test",
        "Rewrite the whole repo",
        "Fix only the symptoms",
        "Ignore the failing test",
      ],
      answer: 0,
      explain: "Minimal, well-tested fixes show disciplined engineering.",
    },
    {
      kind: "mcq",
      q: "What is the typical trap in data integration tasks?",
      options: [
        "Silently dropping rows or creating duplicates through joins",
        "Using too many comments",
        "Writing a README",
        "Naming files clearly",
      ],
      answer: 0,
      explain: "Reviewers look for honest accounting of what happened to the data.",
    },
    {
      kind: "text",
      q: "For a hybrid brief, what should you do first with the components? (one word)",
      format: "****",
      accept: ["rank", "prioritise", "prioritize", "rank them"],
      explain: "Rank by importance to the brief, then decide what to build, stub or describe.",
    },
  ],
};
