import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Graph, Quadrant } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 20,
  difficulty: "Medium",
  objectives: [
    "Read a vague request for a document assistant and extract the real problem",
    "Write discovery questions specific to regulated financial content",
    "Turn the request into functional, quality and compliance requirements",
    "Identify what makes this RAG problem hard and rank the risks",
    "Choose a first slice and success metrics",
  ],
  tasks: [
    {
      id: "brief",
      title: "The brief",
      body: (
        <>
          <p>
            Each case study in this course follows the same arc: decompose the problem, design the
            system, then rehearse interview questions. Here is the first brief, as a customer might
            actually describe it.
          </p>
          <Callout tone="note" title="Customer request">
            &ldquo;We are a mid-sized asset manager. Our analysts spend hours searching annual
            reports, regulatory filings, internal research notes and policy manuals. We want a
            knowledge assistant that answers their questions from our documents, like ChatGPT but
            for our own material. Compliance is nervous. We would like a pilot in eight
            weeks.&rdquo;
          </Callout>
          <p>
            This is a classic retrieval-augmented generation (RAG) request. The surface problem is
            &ldquo;search and answer&rdquo;. The real work is deciding what &ldquo;correct&rdquo;
            means in finance, who may see which document, and how an analyst will trust an answer
            enough to use it.
          </p>
        </>
      ),
    },
    {
      id: "discovery",
      title: "Discovery questions that matter here",
      body: (
        <>
          <Table
            head={["Area", "Questions", "Why it changes the design"]}
            rows={[
              ["Users and tasks", "Who asks, how often, and what was the last hard question they had? What did they do?", "Defines query types: lookup of a figure, comparison across years, summarising a filing"],
              ["Document corpus", "How many documents, what formats (PDF, tables, spreadsheets, scans), how often do they change, how far back?", "Drives parsing, chunking and refresh"],
              ["Correctness", "What happens if an answer quotes the wrong number? Is any answer used externally?", "Sets accuracy bar, citation and review requirements"],
              ["Access control", "Who may see which documents? Are there information barriers (chinese walls) between teams?", "Permissions must be enforced at retrieval"],
              ["Compliance", "Which regulations apply? Is record-keeping of queries and answers required? Are communications supervised?", "Audit logging and retention"],
              ["Systems", "Where do documents live (SharePoint, a research portal, a data vendor)? Licensing limits on reuse?", "Connectors and legal limits on indexing licensed content"],
              ["Success", "How will you know it helped? Time saved per query, fewer escalations, analyst satisfaction?", "Baseline and pilot metrics"],
            ]}
          />
          <p>
            A shadowing session usually reveals the real pattern. Suppose you learn that analysts
            ask three kinds of question: <em>fact lookups</em> (&ldquo;What was the 2025 operating
            margin of Company X?&rdquo;), <em>comparisons</em> (&ldquo;How did their risk factors
            change since last year?&rdquo;) and <em>synthesis</em> (&ldquo;Summarise the regulatory
            outlook for our European holdings&rdquo;). These need different retrieval strategies.
          </p>
        </>
      ),
    },
    {
      id: "requirements",
      title: "From wish to requirements",
      body: (
        <>
          <Figure caption="The request decomposed into three requirement groups. The compliance group is what turns a demo into something a financial firm can use.">
            <Graph
              label="Requirements decomposition: functional, quality and compliance requirements branching from the knowledge assistant request"
              cellW={196}
              cellH={104}
              nodeW={164}
              nodes={[
                { id: "r", label: "Knowledge assistant", sub: "Answer analyst questions from documents", col: 1.5, row: 0, tone: "lime", w: 190 },
                { id: "f", label: "Functional", sub: "Ask, answer, cite, filter by company or date", col: 0, row: 1.4, tone: "sky" },
                { id: "q", label: "Quality", sub: "Accurate figures, no invented claims, fast", col: 1.5, row: 1.4, tone: "amber" },
                { id: "c", label: "Compliance", sub: "Permissions, audit trail, retention, no leakage", col: 3, row: 1.4, tone: "rose" },
              ]}
              edges={[
                { from: "r", to: "f" },
                { from: "r", to: "q" },
                { from: "r", to: "c" },
              ]}
            />
          </Figure>

          <Table
            head={["Type", "Requirement", "Measure"]}
            rows={[
              ["Functional", "Answer questions with the source document, page and quoted passage shown", "100% of answers cite at least one source"],
              ["Functional", "Filter by company, document type and date range", "Filters respected in 100% of test queries"],
              ["Quality", "Numeric facts match the source", "At least 98% exact match on a labelled set of figure questions"],
              ["Quality", "Say 'not found' rather than guess", "Fewer than 2% unsupported claims; abstains on 90% of unanswerable test questions"],
              ["Quality", "Response time", "95% under 8 seconds"],
              ["Compliance", "Respect document entitlements", "Zero leaks in an adversarial permission test"],
              ["Compliance", "Retain queries and answers per policy", "Searchable audit log with the retention agreed with compliance"],
              ["Cost", "Run cost within budget", "Under an agreed amount per query at pilot volume"],
            ]}
          />
        </>
      ),
    },
    {
      id: "hard",
      title: "What makes this hard",
      body: (
        <>
          <p>
            RAG demos are easy; finance RAG is hard for specific reasons. Naming them shows judgment.
          </p>
          <ul>
            <li>
              <strong>Tables and numbers.</strong> Financial statements are tables. Naive text
              extraction scrambles rows and columns, and a model will confidently quote the wrong
              cell. Table-aware parsing and exact numeric checks matter.
            </li>
            <li>
              <strong>Near-duplicate documents.</strong> The same company&apos;s reports differ by
              year and version. A question about &ldquo;the latest&rdquo; must pick the right one;
              wrong-year answers are plausible and dangerous.
            </li>
            <li>
              <strong>Multi-document reasoning.</strong> Comparisons across years or companies
              require retrieving several passages and reasoning across them, which single-shot
              retrieval handles poorly.
            </li>
            <li>
              <strong>Entitlements and information barriers.</strong> A leak across barriers can be a
              regulatory event.
            </li>
            <li>
              <strong>Licensed data.</strong> Vendor content may forbid indexing or redistribution.
            </li>
            <li>
              <strong>Trust.</strong> Analysts will not use a tool that is wrong once on a number
              they know.
            </li>
          </ul>

          <Figure caption="Risks ranked by likelihood and impact. Start work with the high-impact items, which here are numbers and permissions.">
            <Quadrant
              label="Project risks plotted by likelihood and impact"
              xLabel="Likelihood"
              yLabel="Impact"
              corners={["Watch", "Fix first", "Accept", "Mitigate cheaply"]}
              items={[
                { label: "Wrong figure quoted", x: 0.8, y: 0.9, tone: "rose" },
                { label: "Permission leak", x: 0.32, y: 0.94, tone: "rose" },
                { label: "Wrong year or version", x: 0.7, y: 0.66, tone: "amber" },
                { label: "Poor table parsing", x: 0.84, y: 0.56, tone: "amber" },
                { label: "Slow answers", x: 0.5, y: 0.3, tone: "sky" },
                { label: "Licensing limits", x: 0.22, y: 0.5, tone: "sky" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "slice",
      title: "Choose the first slice",
      body: (
        <>
          <p>
            Eight weeks is short. Resist indexing everything. Choose a slice that exercises the
            hardest parts with the lowest compliance risk.
          </p>
          <Figure caption="Proposed pilot sequence. Each step adds one hard problem, and a measurement gates the next.">
            <Flow
              numbered
              steps={[
                { title: "Weeks 1 to 2", note: "100 internal policy manuals; fact lookups; baseline and test set", tone: "sky" },
                { title: "Weeks 3 to 4", note: "Add annual reports for 20 companies; table-aware parsing; numeric checks", tone: "lime" },
                { title: "Weeks 5 to 6", note: "Add permissions and audit log; adversarial access tests", tone: "amber" },
                { title: "Weeks 7 to 8", note: "Pilot with 15 analysts; measure time saved and accuracy", tone: "lime" },
              ]}
            />
          </Figure>
          <p>
            Policy manuals first because they are text-heavy, have little licensing concern, and let
            you build the evaluation harness before the harder numeric content. Reports come next to
            tackle tables. Permissions arrive before any restricted content is indexed, so there is no
            window in which data could leak.
          </p>

          <Exercise
            title="Write the success metrics"
            task={
              <p>
                Propose three metrics for the pilot: one for answer quality, one for user value, one
                for safety. Include a target and how it would be measured.
              </p>
            }
          >
            <ul>
              <li>
                <strong>Quality:</strong> at least 95% of 150 labelled questions answered correctly
                with a correct citation, judged by two analysts, with disagreements resolved by a
                third.
              </li>
              <li>
                <strong>User value:</strong> median time to answer a lookup question drops from about
                25 minutes (measured by shadowing before the pilot) to under 5 minutes, measured from
                logs and a short weekly survey.
              </li>
              <li>
                <strong>Safety:</strong> zero entitlement violations across a scripted test of 200
                cross-permission queries, and fewer than 2% answers containing an unsupported claim in
                a sampled review.
              </li>
            </ul>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Decompose a RAG request into the real problem, then functional, quality and compliance requirements.",
    "Discovery for finance covers query types, corpus, correctness stakes, access control, regulation, systems and success.",
    "The hard parts are tables and numbers, versions, multi-document reasoning, entitlements, licensing and trust.",
    "Rank risks by likelihood and impact, and start with wrong numbers and permission leaks.",
    "Pick a first slice that builds evaluation early and adds one hard problem at a time.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why are financial tables a particular RAG risk?",
      options: [
        "Naive text extraction scrambles rows and columns, so the model may quote the wrong figure",
        "Tables are too small to index",
        "Models cannot read numbers",
        "Tables are always scanned images",
      ],
      answer: 0,
      explain: "Table structure is lost by simple extraction, causing confident but wrong numbers.",
    },
    {
      kind: "mcq",
      q: "Which requirement most distinguishes a compliant system from a demo?",
      options: [
        "Enforcing document entitlements and keeping an audit trail",
        "A nicer user interface",
        "A longer prompt",
        "Using a bigger model",
      ],
      answer: 0,
      explain: "Permissions and auditability are what regulated firms require before use.",
    },
    {
      kind: "mcq",
      q: "Why index policy manuals before annual reports in the pilot?",
      options: [
        "They are text-heavy and low-risk, letting you build evaluation before tackling tables",
        "They are more valuable",
        "Reports cannot be indexed",
        "It avoids permissions entirely",
      ],
      answer: 0,
      explain: "Start with the easier content to build the harness, then add harder document types.",
    },
    {
      kind: "mcq",
      q: "What should the assistant do when it cannot find an answer in the documents?",
      options: [
        "Say it was not found rather than guess",
        "Make a plausible estimate",
        "Use its general knowledge silently",
        "Ask the user to rephrase forever",
      ],
      answer: 0,
      explain: "Abstaining is safer than inventing, especially for figures that may be acted upon.",
    },
    {
      kind: "text",
      q: "A baseline lookup takes 25 minutes and the target is under 5. By what percentage is time cut at exactly 5 minutes?",
      format: "**%",
      accept: ["80", "80%", "0.8"],
      explain: "(25 - 5) / 25 = 0.8, an 80% reduction.",
    },
  ],
};
