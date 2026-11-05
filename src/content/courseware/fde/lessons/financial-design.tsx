import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Graph, Layers, Sequence } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Design the ingestion pipeline for mixed financial documents, including tables",
    "Design retrieval with hybrid search, metadata filters, re-ranking and entitlements",
    "Design generation with citations, abstention and numeric verification",
    "Design the evaluation harness and monitoring for the assistant",
    "Present the full architecture with trade-offs and a rollout plan",
  ],
  tasks: [
    {
      id: "overview",
      title: "Architecture overview",
      body: (
        <>
          <p>
            The design follows the requirements from the decomposition lesson. It has two paths: an
            offline <strong>ingestion path</strong> that prepares documents, and an online{" "}
            <strong>query path</strong> that answers questions. Around both sit evaluation, access
            control and audit.
          </p>
          <Figure caption="Architecture of the financial knowledge assistant. Ingestion builds a permission-aware index; the query path retrieves, generates and verifies before answering.">
            <Graph
              label="Architecture: document sources feed ingestion into an index with access lists; analysts query through an API that retrieves, generates and verifies, with audit logging"
              cellW={196}
              cellH={104}
              nodeW={160}
              nodes={[
                { id: "src", label: "Document sources", sub: "SharePoint, filings, notes", col: 0, row: 0, tone: "sky", shape: "db" },
                { id: "ing", label: "Ingestion", sub: "Parse, chunk, enrich, embed", col: 1, row: 0, tone: "lime" },
                { id: "idx", label: "Index", sub: "Vectors + keywords + ACLs", col: 2, row: 0, tone: "lime", shape: "db" },
                { id: "ana", label: "Analyst", sub: "SSO, web or chat", col: 0, row: 2, tone: "amber", shape: "pill" },
                { id: "api", label: "Query API", sub: "Auth, rewrite, retrieve", col: 1, row: 2, tone: "lime" },
                { id: "gen", label: "Generator + verifier", sub: "Cite, check numbers", col: 2, row: 2, tone: "lime" },
                { id: "aud", label: "Audit log", sub: "Query, sources, answer", col: 3, row: 1, tone: "rose", shape: "db" },
              ]}
              groups={[
                { label: "Offline: ingestion", c1: 0, r1: 0, c2: 2, r2: 0, tone: "sky" },
                { label: "Online: query", c1: 0, r1: 2, c2: 2, r2: 2, tone: "amber" },
              ]}
              edges={[
                { from: "src", to: "ing" },
                { from: "ing", to: "idx" },
                { from: "ana", to: "api" },
                { from: "api", to: "idx", label: "filtered search", bend: 0 },
                { from: "api", to: "gen" },
                { from: "gen", to: "ana", dashed: true, bend: 40, label: "answer + sources" },
                { from: "gen", to: "aud", dashed: true },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "ingestion",
      title: "Ingestion: where quality is won",
      body: (
        <>
          <p>
            Most RAG quality is decided before any question is asked. For financial documents:
          </p>
          <Figure caption="The ingestion pipeline. Each stage preserves structure and attaches the metadata that retrieval and compliance need later.">
            <Flow
              numbered
              steps={[
                { title: "Fetch", note: "Connector with source ACLs and version", tone: "sky" },
                { title: "Parse", note: "Layout-aware; tables as structure; OCR for scans", tone: "sky" },
                { title: "Chunk", note: "By section; tables kept whole with headers", tone: "lime" },
                { title: "Enrich", note: "Company, period, doc type, page, ACL", tone: "lime" },
                { title: "Embed and index", note: "Vector and keyword indexes", tone: "amber" },
                { title: "Validate", note: "Sample checks and counts", tone: "amber" },
              ]}
            />
          </Figure>
          <Table
            head={["Decision", "Choice", "Reason"]}
            rows={[
              ["Parsing tables", "Extract as structured rows with header context; keep a markdown or JSON form per table", "Prevents scrambled figures"],
              ["Chunk size", "Section-sized (around 300 to 800 tokens) with the heading path prepended; tables not split", "Context for the model; keeps meaning intact"],
              ["Metadata", "company, fiscal_period, doc_type, doc_version, page, source_url, acl_groups", "Filters, citations and permissions"],
              ["Versions", "Mark latest per company and period; keep history flagged", "Avoids wrong-year answers"],
              ["Scans", "OCR with confidence; low-confidence pages flagged for review", "Bad OCR produces bad numbers"],
              ["Refresh", "Incremental sync on change events plus a nightly full diff", "Keeps index current and deletions propagated"],
            ]}
          />
          <Callout tone="warn" title="Deletions and permission changes must propagate">
            If a document is withdrawn or access is revoked, its chunks must disappear from the index
            promptly. Treat this as a requirement, test it, and monitor it.
          </Callout>
        </>
      ),
    },
    {
      id: "query",
      title: "The query path",
      body: (
        <>
          <Figure caption="One question end to end. Permission filters are applied inside the search, and numbers are verified before display.">
            <Sequence
              label="Sequence of a query: authenticate, rewrite, filtered hybrid search, re-rank, generate with citations, verify numbers, log and return"
              actors={[
                { id: "user", label: "Analyst" },
                { id: "api", label: "Query API" },
                { id: "idx", label: "Index" },
                { id: "llm", label: "Model" },
              ]}
              messages={[
                { from: "user", to: "api", text: "Question (with SSO identity)" },
                { from: "api", to: "api", text: "Resolve groups; rewrite query; extract company and period" },
                { from: "api", to: "idx", text: "Hybrid search + metadata filters + ACL filter" },
                { from: "idx", to: "api", text: "Top 30 chunks", dashed: true },
                { from: "api", to: "api", text: "Re-rank to top 6; check version freshness" },
                { from: "api", to: "llm", text: "Prompt: answer only from chunks; cite; abstain if absent" },
                { from: "llm", to: "api", text: "Draft answer with citations", dashed: true },
                { from: "api", to: "api", text: "Verify cited numbers appear in cited chunks" },
                { from: "api", to: "user", text: "Answer, sources, confidence; log to audit", dashed: true },
              ]}
            />
          </Figure>
          <ul>
            <li>
              <strong>Hybrid retrieval.</strong> Keyword search catches exact terms such as tickers,
              clause numbers and metric names; vector search catches paraphrase. Combine them.
            </li>
            <li>
              <strong>Query understanding.</strong> Extract company and period from the question and
              apply them as filters, so a vague query does not drift to another year.
            </li>
            <li>
              <strong>Multi-step for comparisons.</strong> For &ldquo;how did X change since last
              year&rdquo;, retrieve for each period separately, then ask the model to compare.
            </li>
            <li>
              <strong>Permission enforcement inside retrieval.</strong> The ACL filter is part of the
              search query, never a post-filter after the model has seen the text.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "generation",
      title: "Generation, verification and abstention",
      body: (
        <>
          <pre>
            <code>{`SYSTEM
You answer analyst questions using ONLY the numbered passages provided.
- Cite every claim with [n] referring to a passage.
- Quote figures exactly as written, with their units and period.
- If the passages do not contain the answer, reply: {"answerable": false}.
- If passages conflict, report both with their sources; do not choose silently.

Return JSON: {"answerable": bool, "answer": str, "citations": [int], "figures": [{"value": str, "passage": int}]}`}</code>
          </pre>
          <p>
            After generation, run <strong>verification in code</strong>:
          </p>
          <ul>
            <li>Every cited index exists and every claim has a citation.</li>
            <li>Each figure the model lists appears verbatim in the cited passage. If not, discard the answer and retry once, or abstain.</li>
            <li>The period in the answer matches the period requested.</li>
            <li>Show the passage text and page number beside the answer so the analyst can check in seconds.</li>
          </ul>
          <Callout tone="tip" title="Trust is built by being checkable">
            Analysts will forgive an occasional &ldquo;I could not find this&rdquo;. They will not
            forgive a wrong number presented with confidence. Make every figure one click from its
            source.
          </Callout>
        </>
      ),
    },
    {
      id: "eval",
      title: "Evaluation, monitoring and rollout",
      body: (
        <>
          <Figure caption="Layers of evaluation. Retrieval is measured separately from generation, because they fail for different reasons.">
            <Layers
              layers={[
                { title: "Online monitoring", note: "Thumbs up or down, abstention rate, latency, cost, share of answers failing numeric verification.", tone: "amber" },
                { title: "Answer quality set", note: "150 labelled questions across lookup, comparison and synthesis; scored for correctness and citation.", tone: "lime" },
                { title: "Retrieval set", note: "For each question, the passages that must be found; measure recall at 5 and 30.", tone: "lime" },
                { title: "Permission test suite", note: "Scripted queries across users and barriers; zero tolerance for leaks, run on every deploy.", tone: "rose" },
                { title: "Ingestion checks", note: "Table fidelity samples, OCR confidence, counts per source, deletion propagation tests.", tone: "sky" },
              ]}
            />
          </Figure>

          <Table
            head={["Choice", "Alternative", "Why we chose this"]}
            rows={[
              ["Hybrid search + re-rank", "Vector only", "Exact terms and numbers need keywords; re-ranking raises precision"],
              ["Numeric verification in code", "Trust the model", "A wrong number is the worst failure; code check is cheap and reliable"],
              ["ACL filter inside the query", "Filter results after retrieval", "Prevents restricted text ever reaching the model"],
              ["Hosted model in customer's region with no retention", "Self-hosted", "Faster for the pilot; self-hosting evaluated if compliance requires"],
              ["Pilot with one team", "Firm-wide launch", "Builds trust and measurements before scale"],
            ]}
          />

          <Exercise
            title="Add a requirement"
            task={
              <p>
                Compliance now says answers may only be shown if the cited documents were published or
                updated in the last 18 months, unless the user explicitly asks for history. Which parts
                of the design change?
              </p>
            }
          >
            <ul>
              <li>
                <strong>Ingestion:</strong> ensure a reliable <code>published_at</code> or
                <code> updated_at</code> metadata field on every chunk (flag documents without one).
              </li>
              <li>
                <strong>Retrieval:</strong> add a default date filter of the last 18 months, with an
                explicit &ldquo;include history&rdquo; option that the query API applies on request.
              </li>
              <li>
                <strong>Verification:</strong> reject citations to out-of-window documents unless
                history was requested, and tell the user when the best answer lies outside the window.
              </li>
              <li>
                <strong>Evaluation:</strong> add labelled questions with expired sources to confirm
                correct behaviour, and log the window used in the audit record.
              </li>
            </ul>
            <p>
              The change is metadata plus a filter and a check; the architecture does not change. That
              is the sign of a design organised around metadata and verification.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Two paths: offline ingestion that preserves structure and metadata, and an online query path that retrieves, generates and verifies.",
    "Ingestion quality decides answer quality: layout-aware parsing, tables kept whole, version flags and rich metadata.",
    "Hybrid search with filters and re-ranking, with permissions enforced inside retrieval.",
    "Generate with citations and abstention, then verify figures and periods in code.",
    "Evaluate retrieval and generation separately, run permission tests on every deploy, and roll out with a pilot team.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why apply the access-control filter inside the search query rather than after retrieval?",
      options: [
        "Restricted text then never reaches the model or the application layer",
        "It is faster for users",
        "Post-filtering is not possible",
        "It reduces storage",
      ],
      answer: 0,
      explain: "Filtering after retrieval risks restricted content being processed or leaked.",
    },
    {
      kind: "mcq",
      q: "What is the purpose of verifying that cited figures appear verbatim in the cited passage?",
      options: [
        "To catch invented or misquoted numbers in code before the answer is shown",
        "To speed up the model",
        "To remove citations",
        "To make answers longer",
      ],
      answer: 0,
      explain: "A programmatic check is a reliable guard against the most damaging failure.",
    },
    {
      kind: "mcq",
      q: "A question compares a company's risk factors across two years. What retrieval approach helps?",
      options: [
        "Retrieve separately for each period, then compare",
        "Only retrieve the newest year",
        "Skip retrieval",
        "Ask the model to guess",
      ],
      answer: 0,
      explain: "Per-period retrieval ensures both sides of the comparison are present.",
    },
    {
      kind: "mcq",
      q: "Why measure retrieval and generation quality separately?",
      options: [
        "They fail for different reasons and need different fixes",
        "It is required by law",
        "It halves the cost",
        "Generation does not matter",
      ],
      answer: 0,
      explain: "If the right passage is not retrieved, prompt changes cannot help; separate metrics locate the problem.",
    },
    {
      kind: "text",
      q: "What search style combines keyword and vector retrieval? (one word)",
      format: "******",
      accept: ["hybrid", "hybrid search"],
      explain: "Hybrid search captures exact terms and semantic similarity together.",
    },
  ],
};
