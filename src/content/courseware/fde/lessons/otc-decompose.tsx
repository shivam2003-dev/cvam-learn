import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Graph, Timeline } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 20,
  difficulty: "Medium",
  objectives: [
    "Map the order-to-cash lifecycle across CRM, ERP, billing and payment systems",
    "Identify the system of record for each piece of data and each state transition",
    "List the consistency problems that arise when systems disagree",
    "Define the requirements: correctness, timeliness, auditability and recoverability",
    "Choose a safe first slice and success measures",
  ],
  tasks: [
    {
      id: "brief",
      title: "The brief",
      body: (
        <>
          <Callout tone="note" title="Customer request">
            &ldquo;We sell industrial equipment. Sales closes deals in the CRM. Finance fulfils and
            invoices in the ERP. Subscriptions and service plans are billed in a separate billing
            platform, and payments arrive through a payment provider. Today people re-key data
            between them. Orders get lost, invoices are wrong, and finance closes the month three
            days late. We want these systems kept in sync.&rdquo;
          </Callout>
          <p>
            This is a pure integration case, with no AI required. It is common in FDE work and
            tests exactly the skills from chapter 7: data movement, idempotency, failure handling,
            contracts and reconciliation. The interesting part is that the data is money, so
            correctness matters more than speed.
          </p>
        </>
      ),
    },
    {
      id: "lifecycle",
      title: "The order-to-cash lifecycle",
      body: (
        <>
          <Figure caption="The lifecycle across four systems. Each stage has an owner system; most problems occur at the hand-offs between them.">
            <Timeline
              phases={[
                { label: "Quote and order", when: "CRM", tone: "sky", items: ["Opportunity won", "Quote accepted", "Order created"] },
                { label: "Fulfil", when: "ERP", tone: "lime", items: ["Order accepted", "Stock reserved", "Shipped, delivery note"] },
                { label: "Invoice", when: "ERP / billing", tone: "amber", items: ["Invoice raised", "Tax and currency applied", "Sent to customer"] },
                { label: "Collect", when: "Payment provider", tone: "amber", items: ["Payment received", "Failed or partial payments", "Refunds"] },
                { label: "Reconcile", when: "ERP / finance", tone: "rose", items: ["Match payments to invoices", "Post to ledger", "Close the period"] },
              ]}
            />
          </Figure>
          <Table
            head={["Data or state", "System of record", "Others hold"]}
            rows={[
              ["Customer and account", "CRM", "ERP and billing keep copies with a CRM ID"],
              ["Quote and order commitment", "CRM until accepted, then ERP", "Billing for subscriptions"],
              ["Inventory, shipment, delivery", "ERP", "CRM shows read-only status"],
              ["Invoice and tax", "ERP (or billing for subscriptions)", "CRM shows status and balance"],
              ["Payment status", "Payment provider, then ERP after posting", "CRM and billing show status"],
              ["Ledger entries", "ERP", "Nobody else writes"],
            ]}
          />
          <p>
            Defining the <strong>system of record</strong> for every item is the most important
            design step. If two systems may both edit the same field, they will eventually
            disagree, and no technology fixes an ownership problem.
          </p>
        </>
      ),
    },
    {
      id: "problems",
      title: "Where it breaks",
      body: (
        <>
          <Figure caption="Typical failure points in the synchronisation chain. Each arrow is a place where events can be lost, duplicated, reordered or misread.">
            <Graph
              label="Four systems connected in sequence, with labelled failure risks on each hand-off"
              cellW={208}
              cellH={108}
              nodeW={162}
              nodes={[
                { id: "crm", label: "CRM", sub: "Orders and accounts", col: 0, row: 0, tone: "sky" },
                { id: "erp", label: "ERP", sub: "Fulfilment, invoices, ledger", col: 1, row: 0, tone: "lime" },
                { id: "bill", label: "Billing platform", sub: "Subscriptions, usage", col: 2, row: 0, tone: "amber" },
                { id: "pay", label: "Payment provider", sub: "Cards, bank transfers", col: 3, row: 0, tone: "amber" },
              ]}
              edges={[
                { from: "crm", to: "erp", label: "duplicates, edits after sync" },
                { from: "erp", to: "bill", label: "out-of-order updates" },
                { from: "bill", to: "pay", label: "partial failures" },
                { from: "pay", to: "erp", label: "payment matching", bend: 52, dashed: true },
              ]}
            />
          </Figure>
          <Table
            head={["Problem", "Example", "Impact"]}
            rows={[
              ["Duplicate events", "Webhook retried; order created twice in the ERP", "Double shipment or invoice"],
              ["Out-of-order events", "Order cancelled event processed before order created", "Cancelled order shipped"],
              ["Edits after sync", "Sales changes quantity after the order reached the ERP", "Invoice does not match what was agreed"],
              ["Partial failure", "Order created in ERP but customer not updated in billing", "Customer invoiced in the wrong system"],
              ["Mismatched data models", "CRM has account hierarchies; ERP has flat customers; currencies and tax codes differ", "Wrong tax, wrong entity, wrong currency"],
              ["Silent loss", "Event dropped during a deploy", "Order never invoiced; revenue leakage"],
              ["Payment matching", "Customer pays two invoices with one transfer, or underpays", "Cash applied wrongly; dunning errors"],
            ]}
          />
        </>
      ),
    },
    {
      id: "requirements",
      title: "Requirements and first slice",
      body: (
        <>
          <Table
            head={["Type", "Requirement", "Measure"]}
            rows={[
              ["Correctness", "Every accepted order exists exactly once in the ERP with matching lines, totals and currency", "Daily reconciliation: zero unexplained differences"],
              ["Timeliness", "New orders appear in the ERP promptly", "95% within 5 minutes"],
              ["Auditability", "Trace any invoice back to the CRM order and the user who approved it", "Lineage retrievable in under a minute"],
              ["Recoverability", "Any failure can be retried or corrected without duplicating data", "No duplicate records after replaying a day of events"],
              ["Operability", "Finance sees failures and can fix them without engineers", "Error queue with reasons, owners and a retry button"],
            ]}
          />
          <p>
            <strong>First slice:</strong> CRM to ERP for new orders from one product line and one
            region, in one currency, with reconciliation and the error queue. Billing and payments
            follow once the order backbone is trusted.
          </p>
          <Flow
            numbered
            steps={[
              { title: "Slice 1", note: "Orders CRM to ERP, one region; reconcile daily", tone: "sky" },
              { title: "Slice 2", note: "Order changes and cancellations; state machine", tone: "lime" },
              { title: "Slice 3", note: "Invoices and statuses back to CRM", tone: "lime" },
              { title: "Slice 4", note: "Billing platform and payments matching", tone: "amber" },
            ]}
          />
          <Exercise
            title="Who owns the field?"
            task={
              <p>
                Sales can edit a customer&apos;s billing address in the CRM, and finance can edit it in
                the ERP. Addresses are drifting apart. Propose a fix.
              </p>
            }
          >
            <p>
              <strong>Pick one system of record</strong> for billing address, likely the ERP because
              invoices and tax depend on it, and make the CRM read-only for that field (or route
              edit requests through a workflow that updates the ERP). Sync ERP changes to the CRM
              through the integration. Then reconcile the two systems to find and resolve the existing
              drift once.
            </p>
            <p>
              If the business insists on two-way editing, you need explicit conflict rules (last write
              wins, or field-level ownership) and an audit trail. That is more complex and error-prone,
              so single ownership should be the recommendation.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Order-to-cash spans CRM, ERP, billing and payments; most failures happen at the hand-offs.",
    "Name one system of record for each piece of data and each state transition; shared ownership causes drift.",
    "Expect duplicates, reordering, edits after sync, partial failures, model mismatches, silent loss and payment matching problems.",
    "Require correctness, timeliness, auditability, recoverability and operability, each measurable.",
    "Start with orders for one region and product line, with reconciliation and an error queue.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the most important design step in a multi-system sync?",
      options: [
        "Defining the system of record for each piece of data",
        "Choosing the fastest message broker",
        "Picking a programming language",
        "Adding a dashboard",
      ],
      answer: 0,
      explain: "Without single ownership, systems inevitably disagree.",
    },
    {
      kind: "mcq",
      q: "An 'order cancelled' event is processed before 'order created'. What kind of problem is this?",
      options: ["Out-of-order events", "Duplicate events", "Silent loss", "Currency mismatch"],
      answer: 0,
      explain: "Event order is not guaranteed unless you design for it.",
    },
    {
      kind: "mcq",
      q: "What should the first slice include besides syncing orders?",
      options: [
        "Reconciliation and an error queue",
        "Every system at once",
        "A marketing site",
        "Nothing else",
      ],
      answer: 0,
      explain: "Reconciliation and visible errors make the backbone trustworthy and operable.",
    },
    {
      kind: "mcq",
      q: "Sales and finance both edit billing addresses and they drift apart. Best fix?",
      options: [
        "Assign a single system of record and make the other read-only or workflow-driven",
        "Let both edit forever",
        "Delete the CRM field",
        "Ignore it",
      ],
      answer: 0,
      explain: "Single ownership avoids conflicting writes.",
    },
    {
      kind: "text",
      q: "Which daily process compares the systems to find missing or mismatched records? (one word)",
      format: "**************",
      accept: ["reconciliation", "reconcile"],
      explain: "Reconciliation makes silent divergence visible and repairable.",
    },
  ],
};
