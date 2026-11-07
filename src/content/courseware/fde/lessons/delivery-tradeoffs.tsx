import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Document design decisions as choice, alternative, reason and revisit condition",
    "Write limitations that build credibility instead of undermining it",
    "Distinguish a limitation from a bug",
    "Describe a path from the take-home to production without overbuilding",
  ],
  tasks: [
    {
      id: "why",
      title: "Why trade-offs are scored",
      body: (
        <>
          <p>
            In a fixed-time assignment, everyone makes compromises. Reviewers want to see that yours
            were deliberate. A trade-off section turns shortcuts into evidence of judgment: you knew
            what you were giving up, why, and what would change your mind.
          </p>
          <DiagramReference lesson="delivery-tradeoffs" panel={1} />
        </>
      ),
    },
    {
      id: "examples",
      title: "Worked examples",
      body: (
        <>
          <Table
            head={["Choice", "Alternative", "Reason", "Revisit when"]}
            rows={[
              ["Store results as JSON files", "A relational database", "Zero setup for the reviewer; data is small", "Multiple users edit concurrently, or volume exceeds a few thousand records"],
              ["Smaller model for extraction; larger for low-confidence cases", "Always the largest model", "Cuts cost roughly fivefold with similar accuracy on the evaluation set", "Accuracy on a larger sample drops, or provider pricing changes"],
              ["Flag mismatches for review", "Auto-reject mismatches", "Rejecting loses real invoices; a clerk can resolve cheaply", "Review workload becomes the bottleneck"],
              ["Keyword search over documents", "Embeddings and a vector index", "Corpus is 12 short documents; keyword search scored 18/20 on my questions", "Corpus grows beyond hundreds of documents or paraphrase queries dominate"],
              ["Synchronous processing in a script", "A queue and workers", "40 files finish in under a minute", "Throughput requirements exceed a few hundred documents per run"],
            ]}
          />
          <DiagramReference lesson="delivery-tradeoffs" panel={2} />
        </>
      ),
    },
    {
      id: "limits",
      title: "Limitations that build credibility",
      body: (
        <>
          <p>
            A limitation is a known boundary of what you built. A bug is something that does not do
            what you claim. Reviewers forgive limitations that are stated and quantified; they punish
            hidden bugs and exaggerated claims.
          </p>
          <Table
            head={["Weak", "Strong"]}
            rows={[
              ["'May not work on all documents.'", "'Fails on 4 of 6 scanned invoices (OCR fallback is basic); these are flagged with low confidence.'"],
              ["'Evaluation is limited.'", "'40 examples labelled by me; the 95% interval on 85% accuracy is roughly 70 to 93%.'"],
              ["'Not production ready.'", "'No authentication, no rate limiting, files on local disk; see the production path below.'"],
              ["(nothing about cost)", "'About $0.01 per invoice at current prices; a full evaluation run costs about $0.40.'"],
              ["(nothing about data)", "'Invoices are synthetic; real data would need the privacy review described in the notes.'"],
            ]}
          />
          <Callout tone="warn" title="Do not bury a real bug in the limitations">
            If you know the code produces wrong output in a common case, fix it or flag it prominently
            in the product behaviour (for example by marking those cases for review). Listing it only
            under &ldquo;limitations&rdquo; reads as an excuse.
          </Callout>
        </>
      ),
    },
    {
      id: "prod",
      title: "The path to production, briefly",
      body: (
        <>
          <p>
            End with a short, prioritised list of what production would require. It shows you can
            think beyond the assignment without building it.
          </p>
          <ol>
            <li><strong>Security and access:</strong> SSO, least-privilege data access, secrets management, audit log.</li>
            <li><strong>Reliability:</strong> a queue for bursts, retries and a dead-letter queue, idempotent processing.</li>
            <li><strong>Evaluation at scale:</strong> a larger expert-labelled set, drift monitoring, regression tests in CI.</li>
            <li><strong>Operations:</strong> deployment, monitoring, alerting, runbook and cost tracking.</li>
            <li><strong>Product:</strong> user feedback capture, a review workflow for edits, and a pilot plan with success measures.</li>
          </ol>
          <Exercise
            title="Write one trade-off"
            task={
              <p>
                You used a single large prompt to do extraction and classification together, instead of
                two separate calls. Write the trade-off entry.
              </p>
            }
          >
            <p>
              <strong>Choice:</strong> one combined prompt returning extraction and category in one
              JSON object. <strong>Alternative:</strong> two calls, one for extraction and one for
              classification. <strong>Reason:</strong> halves cost and latency, and on my 40-example
              set accuracy was equal (90% vs 91%); it also keeps the code simpler for a six-hour
              scope. <strong>Revisit when:</strong> prompts grow long enough that one task degrades
              the other, when classification needs a different model or different permissions, or when
              I need to evaluate and improve the two tasks independently.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Document each decision as choice, alternative, reason and revisit condition.",
    "Quantify limitations; a stated, measured limit builds credibility, while a hidden bug destroys it.",
    "Distinguish limitations from bugs, and fix or flag known bad behaviour in the product itself.",
    "End with a short, prioritised path to production covering security, reliability, evaluation, operations and product.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which part of a trade-off entry do candidates most often omit?",
      options: [
        "The condition that would make them revisit the choice",
        "The choice itself",
        "The date",
        "The author",
      ],
      answer: 0,
      explain: "Revisit conditions show you understand when the decision stops being right.",
    },
    {
      kind: "mcq",
      q: "Which limitation statement is strongest?",
      options: [
        "Fails on 4 of 6 scanned invoices; these are flagged for review",
        "May not work everywhere",
        "Could be better",
        "Not perfect",
      ],
      answer: 0,
      explain: "Specific, measured limits with mitigation are credible.",
    },
    {
      kind: "mcq",
      q: "You know the code mislabels a common case. What should you do?",
      options: [
        "Fix it, or flag those cases prominently in the behaviour, not only in a footnote",
        "List it in limitations and move on",
        "Hide it",
        "Remove the tests",
      ],
      answer: 0,
      explain: "Known wrong output is a bug, not a limitation.",
    },
    {
      kind: "text",
      q: "A full evaluation run costs $0.40 for 40 invoices. What is the cost per invoice in cents?",
      format: "*",
      accept: ["1", "1 cent", "1c", "one"],
      explain: "$0.40 / 40 = $0.01, which is 1 cent.",
    },
  ],
};
