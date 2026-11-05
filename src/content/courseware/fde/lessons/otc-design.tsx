import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Graph, Layers, Sequence } from "@/components/Diagram";
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
          <Figure caption="The order backbone. Each system talks only to the integration layer, which owns queues, mapping, idempotency and the audit trail.">
            <Graph
              label="Integration layer between CRM and ERP: webhook receiver, queue, mapper, order service with state machine and idempotency store, ERP adapter, error queue, reconciler and audit log"
              cellW={196}
              cellH={104}
              nodeW={160}
              nodes={[
                { id: "crm", label: "CRM", sub: "Webhooks + API", col: 0, row: 1, tone: "sky" },
                { id: "rcv", label: "Receiver", sub: "Verify, store, ack fast", col: 1, row: 0, tone: "lime" },
                { id: "q", label: "Durable queue", sub: "Partitioned by order ID", col: 2, row: 0, tone: "lime", shape: "db" },
                { id: "svc", label: "Order service", sub: "Map, state machine, idempotency", col: 2, row: 1, tone: "lime" },
                { id: "erp", label: "ERP", sub: "System of record", col: 3, row: 1, tone: "sky" },
                { id: "err", label: "Error queue", sub: "Reason, owner, retry", col: 3, row: 2, tone: "rose", shape: "db" },
                { id: "rec", label: "Reconciler", sub: "Nightly diff and repair", col: 1, row: 2, tone: "amber" },
                { id: "aud", label: "Audit log", sub: "Every event and decision", col: 2, row: 2, tone: "rose", shape: "db" },
              ]}
              edges={[
                { from: "crm", to: "rcv", label: "webhook" },
                { from: "rcv", to: "q" },
                { from: "q", to: "svc" },
                { from: "svc", to: "erp", label: "idempotent write" },
                { from: "svc", to: "err", dashed: true },
                { from: "svc", to: "aud", dashed: true },
                { from: "rec", to: "crm", dashed: true },
                { from: "rec", to: "erp", dashed: true },
              ]}
            />
          </Figure>
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
          <Figure caption="Order states in the integration layer. Cancelling after shipment is not allowed; it becomes a return process.">
            <Flow
              steps={[
                { title: "Received", tone: "sky" },
                { title: "Validated", tone: "sky" },
                { title: "Created in ERP", tone: "lime" },
                { title: "Fulfilled", tone: "lime" },
                { title: "Invoiced", tone: "amber" },
                { title: "Paid", tone: "amber" },
              ]}
            />
          </Figure>
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
          <Figure caption="A saga for order creation with compensation. If billing fails after the ERP succeeds, the ERP order is cancelled and the failure is recorded.">
            <Sequence
              label="Saga sequence: create ERP order, create billing account, on failure compensate by cancelling the ERP order and raising an error"
              actors={[
                { id: "svc", label: "Order service" },
                { id: "erp", label: "ERP" },
                { id: "bill", label: "Billing" },
                { id: "err", label: "Error queue" },
              ]}
              messages={[
                { from: "svc", to: "erp", text: "Step 1: create order (idempotency key)" },
                { from: "erp", to: "svc", text: "ERP order ID", dashed: true },
                { from: "svc", to: "bill", text: "Step 2: create subscription" },
                { from: "bill", to: "svc", text: "Failure: account blocked", dashed: true },
                { from: "svc", to: "erp", text: "Compensate: cancel ERP order" },
                { from: "svc", to: "err", text: "Record failure with reason for finance" },
              ]}
            />
          </Figure>
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
          <Figure caption="Operational layers around the sync: error queue, reconciliation, alerts, audit and runbooks.">
            <Layers
              layers={[
                { title: "Finance error queue", note: "Each failed event shows order, reason in plain words, suggested fix, owner, age; buttons to retry, edit and retry, or dismiss with a note.", tone: "amber" },
                { title: "Reconciliation", note: "Nightly comparison of CRM and ERP by order ID, total, line count and status; differences listed and, for safe categories, auto-repaired.", tone: "amber" },
                { title: "Alerts", note: "Queue depth, age of oldest event, error rate, and a canary order that should flow through daily.", tone: "lime" },
                { title: "Audit trail", note: "For any invoice, the chain from CRM order to ERP order, with timestamps and the user or process involved.", tone: "lime" },
                { title: "Runbooks", note: "Procedures for ERP downtime, a bad deploy and replay of a day of events.", tone: "sky" },
              ]}
            />
          </Figure>
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
