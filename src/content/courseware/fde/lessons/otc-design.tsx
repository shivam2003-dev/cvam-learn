import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Design an event-driven sync with durable queues, idempotent consumers and per-entity ordering",
    "Model the order lifecycle as a state machine and reject invalid transitions",
    "Handle multi-step operations with sagas and compensation instead of distributed transactions",
    "Design reconciliation and an operational error queue finance can use",
    "Explain how the design scales to billing and payments",
  ],
  tasks: [
    {
      id: "arch",
      title: "Architecture",
      body: (
        <>
          <DiagramReference lesson="otc-design" panel={1} />
          <ul>
            <li><strong>Receiver acknowledges quickly</strong> after durably storing the event, so the CRM does not time out and retry.</li>
            <li><strong>Queue partitioned by order ID</strong> keeps events for one order in sequence while allowing parallelism across orders.</li>
            <li><strong>The order service is the only writer to the ERP,</strong> so rules and idempotency live in one place.</li>
          </ul>
        </>
      ),
    },
    {
      id: "state",
      title: "Order lifecycle as a state machine",
      body: (
        <>
          <p>
            Rather than applying events blindly, model allowed states and transitions. An event that
            implies an invalid transition is held or rejected, not applied.
          </p>
          <DiagramReference lesson="otc-design" panel={2} />
          <Table
            head={["Current state", "Event", "Action"]}
            rows={[
              ["Received", "Order updated (version 3)", "Apply if newer than stored version; otherwise ignore"],
              ["Created in ERP", "Order cancelled", "Cancel in ERP if not yet fulfilled; record outcome"],
              ["Fulfilled", "Order cancelled", "Reject; send to error queue with 'use returns process'"],
              ["(none)", "Order cancelled arrives before created", "Hold for a short window, then apply once created; if it never arrives, flag for review"],
              ["Any", "Duplicate event ID", "Ignore, log as duplicate"],
            ]}
          />
          <pre>
            <code>{`ALLOWED = {
  "received":  {"validated", "cancelled"},
  "validated": {"created", "cancelled"},
  "created":   {"fulfilled", "cancelled"},
  "fulfilled": {"invoiced"},
  "invoiced":  {"paid", "credited"},
}

def apply(order, event):
    if event.id in order.seen_event_ids:           # idempotency
        return "duplicate"
    if event.version <= order.version:             # stale
        return "stale"
    if event.target_state not in ALLOWED.get(order.state, set()):
        return park_or_error(order, event)         # invalid transition: hold or escalate
    perform_side_effects(order, event)             # ERP calls, with idempotency key = order.id + event.version
    order.state, order.version = event.target_state, event.version
    order.seen_event_ids.add(event.id)
    return "applied"`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "saga",
      title: "Multi-step operations without distributed transactions",
      body: (
        <>
          <p>
            Creating an order may involve several systems: create in the ERP, update the customer in
            billing, reserve stock. There is no transaction spanning independent vendors. Use a{" "}
            <strong>saga</strong>: a sequence of local steps, each with a defined compensating action
            to undo it if a later step fails.
          </p>
          <DiagramReference lesson="otc-design" panel={3} />
          <ul>
            <li>Every step and compensation must be idempotent, because they may be retried.</li>
            <li>Persist the saga&apos;s progress so a crash resumes mid-way.</li>
            <li>Some actions cannot be undone (an email was sent, goods shipped). Order steps so irreversible ones come last, or add a manual review before them.</li>
          </ul>
        </>
      ),
    },
    {
      id: "ops",
      title: "Reconciliation and the finance-friendly error queue",
      body: (
        <>
          <DiagramReference lesson="otc-design" panel={4} />
          <Table
            head={["Reconciliation check", "Frequency", "On mismatch"]}
            rows={[
              ["Order counts and totals by day", "Nightly", "Alert; list missing and extra; auto-create missing if safe"],
              ["Line-level comparison for open orders", "Hourly", "Flag differing quantities or prices for review"],
              ["Status agreement", "Hourly", "Repair status in the non-owner system"],
              ["Payments vs invoices", "Daily", "Queue unmatched payments for finance"],
            ]}
          />
          <Callout tone="tip" title="Design the tool finance will actually use">
            If every failure needs an engineer, finance will stop trusting the integration. The error
            queue is part of the product, not an afterthought. Involve finance users in its design.
          </Callout>
          <Exercise
            title="Add billing and payments"
            task={
              <p>
                The customer now wants subscription billing and payment status in sync. How does the
                design extend without a rewrite?
              </p>
            }
          >
            <ul>
              <li><strong>New consumers on the same backbone:</strong> billing and payment events enter the same queue and order service pattern, partitioned by account or invoice ID.</li>
              <li><strong>Extend the state machine:</strong> invoiced, partially paid, paid, failed, refunded, with allowed transitions.</li>
              <li><strong>Payment matching service:</strong> an idempotent component that applies payments to invoices using reference numbers and amount rules, queuing ambiguous cases for finance.</li>
              <li><strong>Reconciliation additions:</strong> payments versus invoices and billing versus ERP balances.</li>
              <li><strong>Same operational tools:</strong> the error queue, audit log and alerts cover the new flows.</li>
            </ul>
            <p>
              Because idempotency, ordering, state machines, error handling and reconciliation were
              built as general capabilities, adding flows is configuration and new mappings, not a
              redesign.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Use a receiver that stores then acknowledges, a queue partitioned by order ID, and a single order service writing to the ERP.",
    "Model order lifecycle as a state machine; drop duplicates and stale events and park or escalate invalid transitions.",
    "Use sagas with idempotent compensation instead of cross-vendor transactions; put irreversible steps last.",
    "Build reconciliation, a finance-friendly error queue, alerts, audit and runbooks as part of the product.",
    "General mechanisms let billing and payments extend the same backbone.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why partition the queue by order ID?",
      options: [
        "Events for the same order stay in sequence while different orders run in parallel",
        "To store more orders",
        "To avoid IDs",
        "To slow the system",
      ],
      answer: 0,
      explain: "Per-entity ordering is what the state machine needs; global ordering is unnecessary and costly.",
    },
    {
      kind: "mcq",
      q: "What does a saga's compensating action do?",
      options: [
        "Undoes an earlier step when a later step fails",
        "Speeds up the next step",
        "Deletes the audit log",
        "Doubles the order",
      ],
      answer: 0,
      explain: "Compensation restores consistency across systems without a distributed transaction.",
    },
    {
      kind: "mcq",
      q: "A cancel event arrives for an order already fulfilled. The design should:",
      options: [
        "Reject it into the error queue with a note to use the returns process",
        "Cancel the shipped goods automatically",
        "Ignore silently",
        "Delete the order",
      ],
      answer: 0,
      explain: "The state machine forbids the transition and makes the exception visible to finance.",
    },
    {
      kind: "mcq",
      q: "Why must saga steps be idempotent?",
      options: [
        "They may be retried after crashes or timeouts",
        "To reduce logging",
        "They run once only",
        "To skip compensation",
      ],
      answer: 0,
      explain: "Retries are normal in distributed systems, so repeated execution must be safe.",
    },
    {
      kind: "text",
      q: "What pattern coordinates multi-system steps using compensating actions? (one word)",
      format: "****",
      accept: ["saga"],
      explain: "A saga is a sequence of local steps with compensations for rollback.",
    },
  ],
};
