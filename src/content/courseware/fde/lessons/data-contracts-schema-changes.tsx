import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 22,
  difficulty: "Hard",
  objectives: [
    "Define a data contract and what it should specify",
    "Validate data at the boundary and quarantine what fails",
    "Classify schema changes as compatible or breaking and handle each safely",
    "Migrate a schema with the expand and contract pattern",
    "Detect drift early with contract tests and monitoring",
  ],
  tasks: [
    {
      id: "contract",
      title: "What a data contract is",
      body: (
        <>
          <p>
            Two systems that exchange data have an agreement, whether or not anyone wrote it down: the
            fields, their types, what they mean, when they arrive, and what happens when something is
            missing. A <strong>data contract</strong> makes that agreement explicit, owned and
            testable.
          </p>
          <p>
            Without one, integrations break in the most irritating way: a field is renamed upstream on
            a Tuesday, nobody tells you, and on Wednesday the finance dashboard is wrong. A contract
            turns this into a visible, discussed change.
          </p>

          <DiagramReference lesson="data-contracts-schema-changes" panel={1} />

          <pre>
            <code>{`# orders.contract.yaml (excerpt)
dataset: orders
owner: erp-team@customer.com
version: 2.3.0
delivery: {mechanism: webhook, max_delay: 5m, ordering: per_order_id}
fields:
  order_id:   {type: string, required: true, unique: true, pattern: "^A-[0-9]{6}$"}
  status:     {type: string, required: true, enum: [open, shipped, delivered, cancelled]}
  total:      {type: decimal(12,2), required: true, min: 0, currency: ISO-4217 in 'currency'}
  currency:   {type: string, required: true, pattern: "^[A-Z]{3}$"}
  updated_at: {type: timestamp, required: true, timezone: UTC}
quality:
  freshness: "newest record < 10 minutes old during business hours"
  null_rate: {shipped_at: "< 5% for status in (shipped, delivered)"}
change_policy: "30 days notice for breaking changes"`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "validate",
      title: "Validate at the boundary",
      body: (
        <>
          <p>
            Treat every inbound record as untrusted until validated. Validate at the edge of your
            system, where the error is cheap to understand, and decide explicitly what to do with
            failures.
          </p>
          <DiagramReference lesson="data-contracts-schema-changes" panel={2} />
          <pre>
            <code>{`from pydantic import BaseModel, field_validator
from decimal import Decimal
from datetime import datetime

class Order(BaseModel):
    order_id: str
    status: str
    total: Decimal
    currency: str
    updated_at: datetime

    @field_validator("status")
    def known_status(cls, v):
        if v not in {"open", "shipped", "delivered", "cancelled"}:
            raise ValueError(f"unknown status {v!r}")      # unknown value: do not guess
        return v

    @field_validator("total")
    def non_negative(cls, v):
        if v < 0:
            raise ValueError("negative total")
        return v

def ingest(raw_records):
    good, bad = [], []
    for r in raw_records:
        try:
            good.append(Order(**r))
        except Exception as e:
            bad.append({"record": r, "error": str(e)})     # quarantine with the reason
    return good, bad`}</code>
          </pre>
          <ul>
            <li>Keep the <strong>raw</strong> record so a fix can be replayed.</li>
            <li>Fail on <strong>unknown enum values</strong> rather than mapping them to a default; unknown means the contract changed.</li>
            <li>Set a <strong>threshold</strong>: if more than, say, 2% of a batch is invalid, stop and alert, since it likely signals an upstream change.</li>
          </ul>
        </>
      ),
    },
    {
      id: "change",
      title: "Schema changes: compatible or breaking",
      body: (
        <>
          <p>
            Schemas change. What matters is whether a change breaks consumers that have not yet been
            updated.
          </p>
          <Table
            head={["Change", "Compatibility", "Why"]}
            rows={[
              ["Add an optional field", "Compatible", "Old consumers ignore it"],
              ["Add a new enum value", "Risky", "Consumers with strict enums may fail; announce it"],
              ["Remove a field", "Breaking", "Consumers reading it will fail or get nulls"],
              ["Rename a field", "Breaking", "Equivalent to remove plus add"],
              ["Change a type or unit (string to int, dollars to cents)", "Breaking, and often silent", "Values parse but mean something else"],
              ["Make an optional field required", "Breaking for producers", "Old producers omit it"],
              ["Change meaning without changing shape", "Breaking, and the hardest to spot", "Status 'complete' now means something different"],
            ]}
          />
          <Callout tone="warn" title="Semantic changes are the dangerous ones">
            Schema validation will not catch a field that keeps its name and type but changes meaning,
            such as an amount moving from tax-inclusive to tax-exclusive. Only conversation,
            documented semantics and value-level monitoring (for example, average order value
            suddenly shifting) catch these.
          </Callout>
        </>
      ),
    },
    {
      id: "migrate",
      title: "Migrating safely: expand and contract",
      body: (
        <>
          <p>
            To make a breaking change without breaking anyone, split it into compatible steps. The
            <strong> expand and contract</strong> pattern (also called parallel change) does this.
          </p>

          <DiagramReference lesson="data-contracts-schema-changes" panel={3} />

          <ul>
            <li>Announce changes with the notice period in the contract, and track which consumers have moved.</li>
            <li>Version the contract and, where possible, the API (<code>/v1/</code>, <code>/v2/</code>) so both can run.</li>
            <li>For database migrations, apply the same idea: add the column, backfill, switch reads, then drop the old column.</li>
            <li>Keep a rollback path at every step.</li>
          </ul>
        </>
      ),
    },
    {
      id: "monitor",
      title: "Detecting drift",
      body: (
        <>
          <p>
            Do not rely on people remembering to tell you about changes. Detect them.
          </p>
          <ul>
            <li>
              <strong>Contract tests.</strong> Run automated tests that validate real or sample
              payloads from the producer against the contract in CI, for both sides.
            </li>
            <li>
              <strong>Schema-change alerts.</strong> Compare the observed set of fields and types each
              day with the previous one; alert on new, missing or retyped fields.
            </li>
            <li>
              <strong>Distribution monitors.</strong> Track null rates, value ranges and category
              frequencies; a sudden shift is an early warning of a semantic change.
            </li>
            <li>
              <strong>Quarantine rate.</strong> A rising share of invalid records usually means an
              upstream change.
            </li>
          </ul>

          <Exercise
            title="Plan the change"
            task={
              <p>
                The ERP team announces that the <code>total</code> field will change from dollars to
                cents next month. Three consumers use it: your sync, a finance dashboard and a
                partner export. Describe your plan.
              </p>
            }
          >
            <ol>
              <li>
                <strong>Push for expand and contract:</strong> ask the ERP team to add{" "}
                <code>total_cents</code> alongside <code>total</code> instead of changing{" "}
                <code>total</code>&apos;s meaning in place.
              </li>
              <li>
                <strong>Inventory consumers</strong> and agree a migration window and owners for each.
              </li>
              <li>
                <strong>Update your sync</strong> to read the new field, with a contract test and a
                value-range monitor on order totals.
              </li>
              <li>
                <strong>Run old and new in parallel</strong> and compare totals before switching.
              </li>
              <li>
                <strong>Remove the old field</strong> only when all consumers have moved.
              </li>
            </ol>
            <p>
              If the ERP team insists on an in-place change, you must at minimum coordinate the
              cutover date and add a unit check that rejects implausible values (a $50 order suddenly
              reading 5000).
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "A data contract makes schema, semantics, quality, delivery and ownership explicit and testable.",
    "Validate every inbound record at the boundary, keep the raw data, quarantine failures and alert on thresholds.",
    "Adding optional fields is compatible; removing, renaming, retyping and semantic changes are breaking.",
    "Use expand and contract to make breaking changes safely, with versions and a tracked migration window.",
    "Detect drift with contract tests, schema diffs, distribution monitors and quarantine rates.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which schema change is most likely to be dangerous and silent?",
      options: [
        "Changing a field's unit from dollars to cents while keeping its name and type",
        "Adding an optional field",
        "Adding a comment",
        "Adding a new index",
      ],
      answer: 0,
      explain: "Values still parse, but they mean something different, so validation does not catch it.",
    },
    {
      kind: "mcq",
      q: "What is the first step of expand and contract?",
      options: [
        "Add the new field alongside the old one",
        "Delete the old field",
        "Tell nobody",
        "Rename the old field in place",
      ],
      answer: 0,
      explain: "Expanding first keeps old consumers working while new ones adopt the new field.",
    },
    {
      kind: "mcq",
      q: "A batch has 12% invalid records, up from 0.5% yesterday. What does this most likely indicate?",
      options: [
        "An upstream change that should be investigated before loading further",
        "Normal behaviour",
        "A faster network",
        "A cached result",
      ],
      answer: 0,
      explain: "A jump in invalid rates usually means the producer changed something. Stop and alert.",
    },
    {
      kind: "mcq",
      q: "Why keep the raw record before validation?",
      options: [
        "So you can replay it after fixing a bug or mapping",
        "To use more storage",
        "To avoid validating",
        "To hide errors",
      ],
      answer: 0,
      explain: "Raw data makes fixes replayable without re-requesting from the source.",
    },
    {
      kind: "text",
      q: "Name the pattern: add the new alongside the old, migrate consumers, then remove the old. (three words joined by 'and')",
      format: "****** *** ********",
      accept: ["expand and contract", "parallel change", "expand-and-contract"],
      explain: "Expand and contract (parallel change) makes breaking changes in compatible steps.",
    },
  ],
};
