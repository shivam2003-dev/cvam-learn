import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 18,
  difficulty: "Medium",
  objectives: [
    "Explain why feeding field learning back to product is the main leverage of the FDE model",
    "Capture field signals in a consistent, evidence-backed format",
    "Decide what should become product and what should stay custom",
    "Write a product request that a product team will act on",
    "Close the loop with customers and the field team",
  ],
  tasks: [
    {
      id: "leverage",
      title: "The leverage in the model",
      body: (
        <>
          <p>
            Deploying engineers to customers is expensive. A company can only justify it if the work
            makes the product better for everyone. The mechanism that creates this leverage is the{" "}
            <strong>field feedback loop</strong>: what FDEs learn in customer environments flows back
            into the product, so the next customer needs less custom work.
          </p>
          <p>
            Without the loop, the model degrades into a services business. Every customer needs a
            fresh round of custom integration, headcount grows with revenue, and the product stays
            the same. With the loop, repeated custom work becomes product, and the FDE&apos;s effort
            shifts to new problems.
          </p>

          <DiagramReference lesson="field-feedback-loop" panel={1} />
        </>
      ),
    },
    {
      id: "capture",
      title: "Capture signals as you go",
      body: (
        <>
          <p>
            Valuable observations vanish unless they are recorded when they happen. Keep a lightweight
            field log and write an entry whenever one of these occurs:
          </p>
          <ul>
            <li>You build the same workaround or integration for the second time.</li>
            <li>A customer asks for something the product does not do, and you build it.</li>
            <li>A user gets stuck or misunderstands a feature.</li>
            <li>The product fails on a data format, scale or environment it should support.</li>
            <li>A customer compares you with a competitor on a specific point.</li>
          </ul>
          <p>Use a consistent shape so entries can be searched and compared:</p>
          <pre>
            <code>{`FIELD NOTE  2026-04-02  Customer: Borealis Health  FDE: A. Person

What happened:  Policy PDFs were scans; text extraction returned empty strings for
                ~30% of documents. I wrote a custom OCR step to continue.
Impact:         6 hours/week of manual work avoided; pilot would have failed without it.
Workaround:     OCR step in repo borealis-ocr (2 days to build).
Frequency:      3rd customer this quarter (Acme, Cobalt, Borealis).
Evidence:       Support tickets #118, #131; recording of the failing run.
Idea:           Native OCR in the ingestion pipeline, with a confidence score.`}</code>
          </pre>
          <p>
            The &ldquo;Frequency&rdquo; line is the most important one. A single request is an
            anecdote; three customers in a quarter is a pattern.
          </p>
        </>
      ),
    },
    {
      id: "decide",
      title: "What becomes product, and what stays custom",
      body: (
        <>
          <p>
            Not every customer request belongs in the product. Adding every one produces a bloated,
            confusing product. Treat each signal as a candidate and judge it on two things: how many
            customers need it, and how well it fits the product&apos;s direction.
          </p>

          <DiagramReference lesson="field-feedback-loop" panel={2} />

          <Table
            head={["Signal", "Typical home", "Why"]}
            rows={[
              ["Needed by many customers, fits strategy", "Product feature", "Pays off across the whole base"],
              ["Needed by a few, close to strategy", "Product extension or plugin", "Reusable without bloating the core"],
              ["Specific to one customer's systems", "Customer configuration or private integration", "Not reusable; keep it isolated"],
              ["Frequently requested but off-strategy", "Escalate to product leadership", "May expose a strategy gap, or a good reason to say no"],
            ]}
          />

          <Callout tone="warn" title="Avoid the customer fork">
            The easy path is to copy the product repository for each customer and change it. Within a
            few months nobody can upgrade it. Keep customer-specific logic in configuration, plugins
            or a separate integration layer, and keep the core code common.
          </Callout>
        </>
      ),
    },
    {
      id: "request",
      title: "Write a request product will act on",
      body: (
        <>
          <p>
            Product managers receive far more requests than they can build. The ones that get acted on
            describe a problem, show evidence, and make prioritisation easy. Compare:
          </p>
          <Table
            head={["Weak request", "Strong request"]}
            rows={[
              ["We need better OCR.", "Scanned PDFs make up ~30% of policy documents at 3 of our last 4 customers; extraction returns empty text; each needed 2 days of custom work."],
              ["Customers are unhappy with search.", "In pilots at Acme and Cobalt, 18% of queries returned no useful passage; failures cluster on tables and numbered lists (examples attached)."],
              ["Please add SSO.", "SSO was a blocker for security approval at 5 of 6 enterprise pilots; each lost 2 to 4 weeks. Two renewals depend on it."],
            ]}
          />
          <p>A structure that works:</p>
          <DiagramReference lesson="field-feedback-loop" panel={3} />
          <p>
            Share your workaround code. It is often the best first draft of the feature, and it proves
            the need is real. State your proposal as a suggestion; the product team knows constraints
            you do not.
          </p>
        </>
      ),
    },
    {
      id: "close",
      title: "Close the loop",
      body: (
        <>
          <p>
            A feedback loop is only a loop if the signal returns. Two groups need to hear back:
          </p>
          <ul>
            <li>
              <strong>The customer.</strong> When their request ships, tell them: &ldquo;You asked for
              this in April; it is in the release this week.&rdquo; It builds loyalty and encourages
              more candid feedback.
            </li>
            <li>
              <strong>Your own field team.</strong> Share what the product team decided and why,
              including a &ldquo;no&rdquo;, so people stop building things the product will soon
              replace, and know which workarounds to retire.
            </li>
          </ul>
          <p>
            Make the loop part of a regular rhythm: a weekly or fortnightly field review where FDEs
            share notes, a monthly session with the product team to review top patterns, and a
            quarterly look at how much custom work per customer is falling.
          </p>

          <Exercise
            title="Product or custom?"
            task={
              <p>
                In one quarter, four customers each asked an FDE to add a &ldquo;confidence score&rdquo;
                beside every AI answer. Another customer asked for the answers to be printed in their
                brand colours. Which should be pushed to product, and how would you argue it?
              </p>
            }
          >
            <p>
              The confidence score is a product candidate: four customers in a quarter, it supports
              trust and review workflows (probably on-strategy), and each FDE probably rebuilt it with
              a slightly different method. Argue with the evidence: the number of customers, the effort
              repeated, and what the lack of it cost (users distrusting answers). Propose one
              consistent definition.
            </p>
            <p>
              The brand colours request is one customer, cosmetic, and is best handled as
              configuration (a theme setting) or left to that customer. It does not justify engineering
              in the core.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "The feedback loop is what turns FDE work into product leverage instead of a services business.",
    "Record field notes with what happened, impact, workaround, frequency and evidence.",
    "Judge candidates by how many customers need them and how well they fit product strategy.",
    "Write requests with problem, evidence, impact, workaround and a loosely held proposal.",
    "Keep customer-specific logic out of forks, and close the loop with customers and the field team.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does the feedback loop prevent?",
      options: [
        "The FDE model becoming a services business with a fresh custom build for every customer",
        "Customers using the product",
        "Product updates",
        "Security reviews",
      ],
      answer: 0,
      explain: "Without the loop, repeated custom work never becomes product and cost grows with every customer.",
    },
    {
      kind: "mcq",
      q: "Which line in a field note best shows that something should become product?",
      options: [
        "Frequency: third customer this quarter",
        "Customer name",
        "Date",
        "The FDE's name",
      ],
      answer: 0,
      explain: "A pattern across several customers justifies building it once for everyone.",
    },
    {
      kind: "mcq",
      q: "Why avoid forking the product for each customer?",
      options: [
        "Forks drift and become impossible to upgrade",
        "Forks are always faster",
        "Customers dislike forks",
        "Git forbids it",
      ],
      answer: 0,
      explain: "Customer-specific copies diverge from the core and cannot receive fixes and upgrades.",
    },
    {
      kind: "mcq",
      q: "Which is the strongest product request?",
      options: [
        "Scans make up 30% of documents at 3 of 4 recent customers; each needed 2 days of custom OCR; workaround linked",
        "Please improve OCR",
        "Customers are unhappy",
        "We should do AI better",
      ],
      answer: 0,
      explain: "It states the problem with evidence, frequency, impact and a workaround, so it is easy to prioritise.",
    },
    {
      kind: "text",
      q: "What term describes a request that is needed by only one customer's systems and is best handled as isolated configuration or integration code?",
      format: "******** ********",
      accept: ["customer specific", "customer-specific", "custom", "custom work", "customer specific work"],
      explain: "Customer-specific logic should live in configuration or a separate integration, not in the core product.",
    },
  ],
};
