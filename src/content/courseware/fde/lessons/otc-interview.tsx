import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 18,
  difficulty: "Hard",
  objectives: [
    "Answer integration interview questions about consistency, idempotency and ordering",
    "Explain trade-offs between real-time and batch, and between exactly-once and at-least-once",
    "Describe how you would debug and fix a live sync problem",
    "Communicate integration risk to finance stakeholders",
  ],
  tasks: [
    {
      id: "q1",
      title: "Question 1: Design from scratch",
      body: (
        <>
          <Exercise
            title="Question"
            task={<p>&ldquo;Orders are closed in the CRM and must appear in the ERP. How would you design the sync?&rdquo;</p>}
          >
            <p>
              <strong>Clarify first:</strong> volumes, how quickly orders must appear, which system
              is the source of truth for each field, whether orders can change after sync, and what
              APIs and rate limits exist.
            </p>
            <p>
              <strong>Design:</strong> a webhook from the CRM into a receiver that stores and
              acknowledges quickly; a durable queue partitioned by order ID; an order service that
              maps fields, applies a state machine and writes to the ERP with an idempotency key; an
              error queue with reasons; and a nightly reconciliation comparing both systems.
            </p>
            <p>
              <strong>Trade-off:</strong> at-least-once delivery with idempotent writes rather than
              seeking exactly-once. <strong>Rollout:</strong> one region first, shadow mode comparing
              against manual entry, then writes with daily reconciliation.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "q2",
      title: "Question 2: Duplicates",
      body: (
        <>
          <Exercise
            title="Question"
            task={<p>&ldquo;The CRM sometimes sends the same order twice. How do you prevent double orders in the ERP?&rdquo;</p>}
          >
            <p>
              Three defences, layered: first, an idempotency key derived from the order ID and
              version, stored with a unique constraint, so the second event is recognised and ignored.
              Second, the ERP call itself carries the key if the ERP supports it, or the service
              first checks whether the ERP already has the CRM order ID in an external-reference
              field. Third, reconciliation catches anything that slips through. I would add a
              uniqueness rule on the external reference in the ERP if possible, since a database
              constraint is the final guard.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "q3",
      title: "Questions 3 to 6",
      body: (
        <>
          <Exercise
            title="Question 3: Edits after sync"
            task={<p>&ldquo;A salesperson changes the quantity after the order was created in the ERP. What happens?&rdquo;</p>}
          >
            <p>
              First establish policy with the business: after a defined state (for example, once
              fulfilment starts) edits must go through a change process. In the integration, an update
              event carries a version; if the order is in a state that permits changes, apply it to
              the ERP with the new version; if not, reject it into the error queue with a clear
              reason, and notify sales to use the amendment workflow. The state machine makes this
              rule explicit and testable instead of buried in code paths.
            </p>
          </Exercise>
          <Exercise
            title="Question 4: Real time or batch"
            task={<p>&ldquo;Finance wants orders in the ERP in real time. Is that necessary?&rdquo;</p>}
          >
            <p>
              I would ask what decision depends on speed. If warehouse picking starts within an hour
              of order, near-real-time (within minutes) via webhook and queue is justified. If finance
              only invoices at the end of the day, a batch every 15 minutes is simpler and cheaper.
              Real time adds operational burden (queues, ordering, monitoring). I would choose the
              slowest option that meets the business need, and keep a reconciliation job either way.
            </p>
          </Exercise>
          <Exercise
            title="Question 5: Debugging"
            task={<p>&ldquo;Finance says 40 orders from last Tuesday are missing in the ERP. How do you investigate?&rdquo;</p>}
          >
            <DiagramReference lesson="otc-interview" panel={1} />
            <p>
              A time cluster suggests a deployment or outage window; a product cluster suggests a
              mapping error. After fixing, replay the affected events (safe because processing is
              idempotent), verify with reconciliation, write a short incident note, and add a
              monitor, such as a daily count comparison, that would have caught it within hours.
            </p>
          </Exercise>
          <Exercise
            title="Question 6: Explain it to finance"
            task={<p>&ldquo;The CFO asks: how do I know no order is ever lost?&rdquo;</p>}
          >
            <p>
              &ldquo;Three safety nets. Every order event is stored before we acknowledge it, so we
              can replay it. If something cannot be processed, it goes to a visible queue with a
              reason, never silently dropped. And every night we compare the CRM and ERP order by
              order and report any difference, and repair the simple ones automatically. You will
              see a daily report with the numbers, and an alert if a difference appears.&rdquo;
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "probes",
      title: "More probes to prepare for",
      body: (
        <>
          <Table
            head={["Probe", "Strong direction"]}
            rows={[
              ["Why not call the ERP directly from the CRM?", "Tight coupling: ERP downtime blocks sales; no retry, ordering or audit; use a queue and an integration layer"],
              ["Exactly-once?", "Not practically achievable across independent systems; use at-least-once plus idempotent processing"],
              ["Multi-currency and tax?", "Store currency with every amount, never convert silently; tax computed by the ERP as system of record; test with edge cases"],
              ["ERP rate limit of 10 calls a minute?", "Queue and throttle; batch where the API allows; prioritise; monitor lag; negotiate higher limits or bulk endpoints"],
              ["Two-way sync?", "Avoid unless needed; assign field-level ownership; define conflict rules; audit all changes"],
              ["What would you monitor?", "Queue depth and oldest age, error rate by reason, reconciliation differences, end-to-end canary, ERP latency"],
            ]}
          />
          <Callout tone="tip" title="The one sentence to remember">
            &ldquo;At-least-once delivery, idempotent consumers, a state machine for validity, and
            reconciliation as the safety net.&rdquo; Most integration design answers can be organised
            around those four ideas.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Organise integration answers around at-least-once delivery, idempotency, state machines and reconciliation.",
    "Prevent duplicates with idempotency keys, external-reference checks and database constraints.",
    "Decide real-time versus batch by the decision that depends on speed, choosing the slowest option that works.",
    "Debug missing records by walking from the source forward and replaying idempotently after a fix.",
    "Explain safety to finance in plain terms: stored events, visible errors and nightly reconciliation.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why avoid calling the ERP directly from the CRM?",
      options: [
        "It couples availability and gives no retry, ordering or audit; an integration layer with a queue is safer",
        "ERPs cannot be called",
        "It is always slower",
        "It removes duplicates automatically",
      ],
      answer: 0,
      explain: "Direct coupling makes ERP downtime block sales and offers no safety mechanisms.",
    },
    {
      kind: "mcq",
      q: "40 orders from one time window are missing. What does the clustering suggest?",
      options: [
        "A deployment or outage in that window",
        "Random chance only",
        "Customers cancelled them",
        "A colour mismatch",
      ],
      answer: 0,
      explain: "Time-clustered failures often coincide with deploys or downstream outages.",
    },
    {
      kind: "mcq",
      q: "The CFO asks how you know no order is lost. Which is the best evidence?",
      options: [
        "Stored events with replay, a visible error queue and nightly reconciliation reports",
        "Trust me",
        "The ERP is reliable",
        "We have never checked",
      ],
      answer: 0,
      explain: "Three independent mechanisms and a visible report create confidence.",
    },
    {
      kind: "mcq",
      q: "The ERP allows 10 calls per minute. What is a good response?",
      options: [
        "Queue and throttle, batch where possible and monitor lag",
        "Ignore the limit",
        "Retry in a tight loop",
        "Drop orders over the limit",
      ],
      answer: 0,
      explain: "Throttling with a queue respects the limit without losing work.",
    },
    {
      kind: "text",
      q: "What word describes a final database guard that rejects a second row with the same external reference? (one word, 'unique ...')",
      format: "**********",
      accept: ["constraint", "unique constraint", "index", "unique index"],
      explain: "A unique constraint is the last line of defence against duplicates.",
    },
  ],
};
