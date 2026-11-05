import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 20,
  difficulty: "Medium",
  objectives: [
    "Answer the most likely interview questions about a RAG assistant for regulated documents",
    "Structure answers to include trade-offs, failure handling and measurement",
    "Handle follow-up probes on evaluation, permissions and cost",
    "Spot and avoid weak answers",
  ],
  tasks: [
    {
      id: "how",
      title: "How to use this lesson",
      body: (
        <>
          <p>
            Each question below is followed by a model answer outline, not a script. Read the
            question, answer aloud for two minutes, then compare. The aim is to cover the same ground
            in your own words, with your own examples.
          </p>
          <Figure caption="A reliable shape for answering any design follow-up. It keeps answers short while still showing judgment.">
            <Flow
              numbered
              steps={[
                { title: "Restate", note: "Show you understood", tone: "sky" },
                { title: "Position", note: "Give your answer first", tone: "lime" },
                { title: "Reason", note: "Why, with a trade-off", tone: "lime" },
                { title: "Risk", note: "What could go wrong", tone: "amber" },
                { title: "Measure", note: "How you would know", tone: "amber" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "q1",
      title: "Question 1: Walk me through the architecture",
      body: (
        <>
          <Exercise
            title="Question"
            task={<p>&ldquo;An asset manager wants analysts to ask questions over filings, research notes and policies. Walk me through how you would build it.&rdquo;</p>}
          >
            <p>
              <strong>Open with discovery,</strong> then the design: &ldquo;First I would confirm who
              asks what, how wrong an answer can be, and who may see which documents. Assuming
              analysts need cited answers and there are information barriers, I would build two
              paths.&rdquo;
            </p>
            <ul>
              <li><strong>Ingestion:</strong> connectors preserving source permissions; layout-aware parsing with tables kept whole; section chunks with heading and metadata (company, period, version, ACL); hybrid index.</li>
              <li><strong>Query:</strong> authenticate with SSO; extract company and period as filters; hybrid search with ACL filter inside the query; re-rank; generate with citations; verify figures in code; log everything.</li>
              <li><strong>Around it:</strong> an evaluation set for retrieval and answers, permission tests per deploy, and monitoring of abstention and failed verification rates.</li>
            </ul>
            <p>
              <strong>Close with rollout:</strong> pilot one team on low-risk documents, add reports,
              then restricted content after permission tests pass.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "q2",
      title: "Question 2: How do you stop wrong numbers?",
      body: (
        <>
          <Exercise
            title="Question"
            task={<p>&ldquo;A model quoted the wrong operating margin from a table. How do you prevent that class of error?&rdquo;</p>}
          >
            <p>
              <strong>Position:</strong> &ldquo;Prevent at three points: parsing, generation and
              verification.&rdquo;
            </p>
            <ol>
              <li><strong>Parsing:</strong> extract tables as structured rows with headers, keep each table intact in a chunk, and sample-check fidelity against the PDF.</li>
              <li><strong>Generation:</strong> instruct the model to quote figures exactly with units and period, and return them in a structured field with the passage ID.</li>
              <li><strong>Verification:</strong> in code, confirm each figure appears verbatim in the cited passage and that the period matches the question; if not, retry or abstain.</li>
            </ol>
            <p>
              <strong>Measure:</strong> a labelled set of figure questions with an exact-match target,
              plus a monitor on the verification failure rate. <strong>Trade-off:</strong> some correct
              answers will be rejected when formatting differs; I would normalise numbers (commas,
              units) before comparing and accept that cost for safety.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "q3",
      title: "Questions 3 to 5: permissions, evaluation and cost",
      body: (
        <>
          <Exercise
            title="Question 3"
            task={<p>&ldquo;How do you ensure an analyst never sees a document they are not entitled to?&rdquo;</p>}
          >
            <p>
              Carry the source system&apos;s access control list with every chunk at ingestion, and
              apply the user&apos;s group memberships as a filter <em>inside</em> the search query so
              restricted text never enters the prompt. Refresh entitlements frequently and propagate
              revocations and deletions. Test it with a scripted suite of cross-permission queries run
              on every deploy, with zero tolerance. Log which documents were retrieved for audit.
              Trade-off: stricter filtering can reduce recall; accept it, because a leak across an
              information barrier is far worse than a missed answer.
            </p>
          </Exercise>
          <Exercise
            title="Question 4"
            task={<p>&ldquo;How would you know it is good enough to launch to more users?&rdquo;</p>}
          >
            <p>
              Agree thresholds with the customer beforehand: for example at least 95% correct with a
              correct citation on 150 labelled questions, under 2% unsupported claims, zero permission
              leaks, and a median time-to-answer improvement versus baseline. Evaluate retrieval
              (recall at 5) separately from generation. After launch, sample answers weekly, track
              thumbs-down and abstention rates, and re-run the set on every prompt, model or index
              change. Without agreed thresholds the launch decision becomes opinion.
            </p>
          </Exercise>
          <Exercise
            title="Question 5"
            task={<p>&ldquo;The pilot works, but finance says the cost per query is too high. What do you do?&rdquo;</p>}
          >
            <p>
              Measure first: break cost into embedding, retrieval, re-ranking and generation tokens.
              Typical levers: retrieve fewer, better chunks and shorten the prompt; cache repeated
              questions and stable prompt prefixes; route simple lookups to a smaller model and escalate
              low-confidence cases; batch ingestion work. Re-run the evaluation set after each change
              to confirm quality held. Present the customer a cost-quality table so they choose the
              trade-off.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "followups",
      title: "Follow-ups to expect",
      body: (
        <>
          <Table
            head={["Follow-up", "What they probe", "Strong direction"]}
            rows={[
              ["Why not fine-tune a model on the documents?", "Understanding of RAG versus fine-tuning", "Knowledge changes and needs citations and permissions; fine-tuning bakes knowledge in and cannot enforce per-user access"],
              ["What if two documents conflict?", "Handling ambiguity", "Surface both with sources and dates; prefer the latest authoritative version; never choose silently"],
              ["What if the PDF is a bad scan?", "Data quality", "OCR with confidence scores; flag low-confidence pages; exclude or route for manual review"],
              ["How do you handle a question about something not in the corpus?", "Abstention", "Detect low retrieval scores or no supporting passage; say it was not found and suggest where to look"],
              ["How do you keep the index fresh?", "Operations", "Change events plus nightly diff; version flags; deletion propagation tested"],
              ["What would you change at 100x the documents?", "Scale", "Partition the index, tune approximate search, add caching; keep metadata filters selective"],
              ["The customer insists on a larger model for everything", "Pushback", "Present measured quality and cost differences and let them decide with data"],
            ]}
          />
          <Callout tone="warn" title="Weak answers to avoid">
            &ldquo;We will use the best model and a vector database&rdquo; with no evaluation,
            permissions or failure handling. &ldquo;It should be fine&rdquo; about numbers. Describing
            technology without tying it to the customer&apos;s risk. Each of these signals a candidate
            who has built demos but not deployed systems.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Answer design questions in a consistent shape: restate, position, reason, risk, measure.",
    "For wrong numbers, prevent at parsing, generation and code-level verification, and measure it.",
    "Enforce permissions inside retrieval, test them on every deploy and accept lower recall over a leak.",
    "Agree launch thresholds with the customer before the pilot and track quality after launch.",
    "Address cost with measurement, fewer tokens, caching and routing, then present the trade-off.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why is fine-tuning a poor way to give an assistant per-user document access?",
      options: [
        "Knowledge baked into weights cannot enforce per-user permissions or be cited",
        "Fine-tuning is free",
        "Models cannot be fine-tuned",
        "It always improves permissions",
      ],
      answer: 0,
      explain: "RAG can filter by entitlement and cite sources. Fine-tuned knowledge cannot.",
    },
    {
      kind: "mcq",
      q: "Two documents give different figures for the same metric. What should the assistant do?",
      options: [
        "Report both with sources and dates instead of choosing silently",
        "Pick one at random",
        "Average them",
        "Refuse every question",
      ],
      answer: 0,
      explain: "Transparency lets the analyst decide and avoids hidden errors.",
    },
    {
      kind: "mcq",
      q: "Which answer shape does the lesson recommend for follow-ups?",
      options: [
        "Restate, position, reason, risk, measure",
        "Long monologue with no structure",
        "Only a technology list",
        "Ask the interviewer to answer",
      ],
      answer: 0,
      explain: "A consistent structure keeps answers concise and shows judgment.",
    },
    {
      kind: "mcq",
      q: "The customer wants a bigger model for all queries to maximise quality. What is a strong response?",
      options: [
        "Show measured quality and cost differences and let them choose with data",
        "Agree without discussion",
        "Refuse",
        "Hide the cost",
      ],
      answer: 0,
      explain: "Data turns opinion into a decision and respects the customer's priorities.",
    },
    {
      kind: "text",
      q: "Which metric measures whether the right passage appears in the top results? (two words)",
      format: "****** ** *",
      accept: ["recall at 5", "recall@5", "recall at k", "recall@k", "recall"],
      explain: "Recall at k measures how often the needed passage appears in the top k retrieved results.",
    },
  ],
};
