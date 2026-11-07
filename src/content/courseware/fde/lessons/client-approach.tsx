import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Apply the six-step CLIENT approach to any customer-facing design prompt",
    "Ask the right clarifying questions in each step",
    "Allocate time across the steps in a 45-minute round",
    "Produce a short, structured design that covers integration, failure, security and rollout",
    "Adapt the approach when requirements change mid-round",
  ],
  tasks: [
    {
      id: "framework",
      title: "A repeatable structure",
      body: (
        <>
          <p>
            A design prompt can feel overwhelming because there are endless things you could say. A
            framework gives you a path, so you spend your attention on the problem rather than on what
            to do next. This course uses <strong>CLIENT</strong>, six steps whose initials spell the
            thing you are designing for. It is a teaching device, not an industry standard, so adapt
            it to your own style.
          </p>

          <DiagramReference lesson="client-approach" panel={1} />

          <Table
            head={["Step", "Core question", "Output on the board"]}
            rows={[
              ["C: Context", "Who is this for and what outcome do they want?", "One-line goal, success metric, key users"],
              ["L: Landscape", "What systems and data exist, and what can we not change?", "Boxes for existing systems with owners and constraints"],
              ["I: Integration design", "How does data and control flow end to end?", "Main architecture diagram with arrows labelled by mechanism"],
              ["E: Edge cases", "What breaks, and how do we know and recover?", "Failure paths, retries, reconciliation, human fallback"],
              ["N: Non-functionals", "What about security, scale, latency and where it runs?", "Trust boundaries, auth, deployment model, targets"],
              ["T: Trade-offs and rollout", "What did we choose, what did we reject, and how do we start?", "Decision notes, phased plan, metrics, rollback"],
            ]}
          />
        </>
      ),
    },
    {
      id: "c-l",
      title: "C and L: understand before you draw",
      body: (
        <>
          <p>
            Spend about a fifth of the round here. Most weak answers skip it.
          </p>
          <h3>Context questions</h3>
          <ul>
            <li>Who are the users, how many, and what do they do today?</li>
            <li>What outcome does the customer want, and how will they measure it?</li>
            <li>What is the timeline and the first milestone?</li>
            <li>Who approves, and who can block?</li>
          </ul>
          <h3>Landscape questions</h3>
          <ul>
            <li>Which systems hold the data (CRM, ERP, ticketing, documents)? Which are systems of record?</li>
            <li>Do they have APIs? What authentication, rate limits and versions?</li>
            <li>How big and how clean is the data? Any known quality problems?</li>
            <li>What can we change, and what is off-limits?</li>
          </ul>

          <DiagramReference lesson="client-approach" panel={2} />

          <Callout tone="tip" title="State your assumptions">
            When the interviewer says &ldquo;you decide&rdquo;, say your assumption and move on:
            &ldquo;I will assume about 5,000 orders a day, REST APIs on both systems, and SSO
            available. Tell me if any of those is wrong.&rdquo; It saves time and shows control.
          </Callout>
        </>
      ),
    },
    {
      id: "i-e",
      title: "I and E: design the flow, then break it",
      body: (
        <>
          <p>
            Draw the main path end to end, then immediately walk a failure. Doing both before any
            deep dive shows you design for reality.
          </p>
          <h3>Integration design</h3>
          <ul>
            <li>Choose how data moves for each link (events, polling, batch, API call) and why.</li>
            <li>Name the components you add: connector, queue, transformation, store, orchestrator.</li>
            <li>Label arrows with mechanism and data, not just direction.</li>
            <li>Identify the system of record for each kind of data.</li>
          </ul>

          <DiagramReference lesson="client-approach" panel={3} />

          <h3>Edge cases to walk</h3>
          <ul>
            <li>The target system is down or slow. (Queue, retry with backoff, circuit breaker.)</li>
            <li>The same event arrives twice or out of order. (Idempotency key, versioning.)</li>
            <li>A record is invalid or unmapped. (Validate, dead-letter, alert a human.)</li>
            <li>A bug silently drops events. (Reconciliation job and counts monitored.)</li>
            <li>For AI: the model is wrong. (Validation, confidence, human review, fallback.)</li>
          </ul>
        </>
      ),
    },
    {
      id: "n-t",
      title: "N and T: constraints, trade-offs and rollout",
      body: (
        <>
          <h3>Non-functionals, briefly and concretely</h3>
          <Table
            head={["Area", "Say something like"]}
            rows={[
              ["Security", "Service identity per connector, least privilege, secrets in a vault, TLS, audit log of every write"],
              ["Scale", "5,000 orders a day is about one every 17 seconds on average; a single worker with a queue is plenty, so no sharding"],
              ["Latency", "Events processed within a minute; nightly reconciliation catches anything missed"],
              ["Deployment", "Runs in the customer's cloud account in an approved region; no outbound internet except to the ERP"],
              ["Observability", "Dashboards for queue depth, error rate and age of the oldest message; alert on thresholds"],
            ]}
          />
          <h3>Trade-offs and phased rollout</h3>
          <p>
            Close by stating one or two decisions you made and what would change them. Then propose a
            phased plan that starts small.
          </p>

          <DiagramReference lesson="client-approach" panel={4} />

          <Callout tone="note" title="A sample trade-off statement">
            &ldquo;I chose a queue with at-least-once delivery plus idempotent writes over exactly-once
            semantics, because exactly-once across two external systems is not achievable cheaply. If
            order volume grew a hundredfold, I would revisit partitioning and consider streaming.&rdquo;
          </Callout>
        </>
      ),
    },
    {
      id: "time",
      title: "Time allocation and adapting",
      body: (
        <>
          <Table
            head={["Step", "Minutes (45-minute round)", "Share"]}
            rows={[
              ["C and L: context and landscape", "8 to 10", "20%"],
              ["I: integration design", "12 to 15", "30%"],
              ["E: edge cases", "7 to 8", "17%"],
              ["N: non-functionals", "5 to 6", "13%"],
              ["T: trade-offs and rollout", "5 to 6", "13%"],
              ["Questions and wrap-up", "3 to 4", "7%"],
            ]}
          />
          <p>
            Treat these as guides. If the interviewer is most interested in failure handling, spend
            longer there. Follow their curiosity, and return to the structure afterwards.
          </p>
          <p>
            When a requirement changes mid-round, name the impact: &ldquo;If the ERP can only be
            reached through a nightly file drop, then my webhook and queue still apply on the CRM
            side, but the transformer must batch and the latency target becomes next day. I would
            reconcile by file row counts.&rdquo;
          </p>

          <Exercise
            title="Apply CLIENT"
            task={
              <p>
                Prompt: &ldquo;A university wants staff to ask questions about its 2,000 policy
                documents.&rdquo; Write two questions for each of C and L, one risk for E, one
                constraint for N, and a first phase for T.
              </p>
            }
          >
            <ul>
              <li>
                <strong>C:</strong> &ldquo;Who are the staff and what questions do they ask most
                often?&rdquo; &ldquo;How will you know it helped: fewer emails to HR, faster
                answers?&rdquo;
              </li>
              <li>
                <strong>L:</strong> &ldquo;Where do the documents live and in what formats (PDF, Word,
                scans)?&rdquo; &ldquo;How are access rights managed today, and by which system?&rdquo;
              </li>
              <li>
                <strong>E:</strong> Outdated or conflicting policies produce wrong answers; mitigate
                with last-updated dates, citations and a feedback button.
              </li>
              <li>
                <strong>N:</strong> Document permissions must be enforced at retrieval so staff only
                see what they are allowed to; SSO required.
              </li>
              <li>
                <strong>T:</strong> Phase 1: the HR policy set (about 200 documents) for 20 pilot
                staff, measured against 100 labelled questions, before adding more collections.
              </li>
            </ul>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "CLIENT: Context, Landscape, Integration design, Edge cases, Non-functionals, Trade-offs and rollout.",
    "Spend the first fifth of the round on context and landscape, and state assumptions out loud.",
    "Draw the main flow with labelled mechanisms, then immediately walk through failures.",
    "Cover security, scale, deployment and observability concretely, with numbers where possible.",
    "End with trade-offs and a phased rollout starting small, and adapt calmly when requirements change.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does the L in CLIENT stand for in this course?",
      options: ["Landscape of existing systems and data", "Latency", "Load balancer", "Licensing"],
      answer: 0,
      explain: "L is Landscape: mapping existing systems, data and constraints before designing.",
    },
    {
      kind: "mcq",
      q: "When should you walk through a failure scenario?",
      options: [
        "Soon after the main flow is drawn, without waiting to be asked",
        "Only if the interviewer asks twice",
        "Never; it distracts from the design",
        "After the interview ends",
      ],
      answer: 0,
      explain: "Showing failure thinking early signals you design for reality.",
    },
    {
      kind: "mcq",
      q: "The interviewer changes the ERP to a nightly file drop. What is the best response?",
      options: [
        "State the impact on latency and design, and adapt the connector and reconciliation",
        "Restart the whole design silently",
        "Insist it must be real time",
        "Ignore the change",
      ],
      answer: 0,
      explain: "Naming the impact and adapting calmly shows good judgment under changing requirements.",
    },
    {
      kind: "mcq",
      q: "Why propose a shadow-mode first phase?",
      options: [
        "It lets you compare outputs with the existing process without risk",
        "It avoids testing",
        "It hides the project",
        "It is cheaper than any monitoring",
      ],
      answer: 0,
      explain: "Shadow mode validates behaviour on real data before the system makes any real change.",
    },
    {
      kind: "text",
      q: "5,000 orders a day is roughly how many orders per hour on average (round to nearest whole number)?",
      format: "***",
      accept: ["208", "208.3", "about 208", "~208"],
      explain: "5,000 / 24 is about 208 per hour.",
    },
  ],
};
