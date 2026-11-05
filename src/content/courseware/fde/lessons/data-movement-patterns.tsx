import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Graph, Quadrant } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Compare request/response, polling, webhooks, event streams, file batches and change data capture",
    "Choose a data movement pattern from freshness, volume, coupling and reliability needs",
    "Explain delivery guarantees and why idempotency matters",
    "Design ordering and deduplication for synchronised systems",
    "Justify the pattern you choose in an interview or a customer meeting",
  ],
  tasks: [
    {
      id: "menu",
      title: "Six ways to move data",
      body: (
        <>
          <p>
            Most integration problems reduce to one question: when something changes in system A, how
            does system B find out and get the data? There are six common answers, each with a
            different balance of freshness, effort and risk.
          </p>
          <Table
            head={["Pattern", "How it works", "Freshness", "Good when", "Weakness"]}
            rows={[
              ["Request/response (API call)", "B calls A when it needs data", "Real time, on demand", "Lookups, small queries, user-triggered actions", "Couples availability: if A is down, B fails"],
              ["Polling", "B asks A for changes on a schedule", "Minutes", "A has an API but no push; modest volume", "Wasteful; misses changes between polls without a cursor"],
              ["Webhooks", "A calls B when something changes", "Seconds", "A supports callbacks; events are small", "Delivery can fail; needs retries and signature checks"],
              ["Event stream / queue", "A publishes to a broker; consumers subscribe", "Seconds", "Many consumers, decoupling, replay", "More infrastructure; ordering and duplicates to manage"],
              ["File batch (SFTP, bulk export)", "A drops files on a schedule", "Hours to a day", "Legacy systems, large volumes, nightly processes", "Stale data; partial or corrupt files; schema drift"],
              ["Change data capture (CDC)", "Read the database's change log", "Seconds", "You need every change from a database without touching the app", "Needs database access; schema coupling; operational care"],
            ]}
          />
        </>
      ),
    },
    {
      id: "diagrams",
      title: "How each looks in practice",
      body: (
        <>
          <Figure caption="Pull versus push. Polling puts the effort on the consumer and risks gaps; webhooks push events but need a reliable receiver.">
            <Graph
              label="Polling: consumer repeatedly asks the source. Webhook: the source pushes events to the consumer through a queue."
              cellW={190}
              cellH={96}
              nodeW={150}
              nodes={[
                { id: "pa", label: "Source A", col: 0, row: 0, tone: "sky", shape: "db" },
                { id: "pb", label: "Consumer B", sub: "Polls every minute", col: 2, row: 0, tone: "lime" },
                { id: "wa", label: "Source A", col: 0, row: 1, tone: "sky", shape: "db" },
                { id: "wq", label: "Receiver + queue", sub: "Verify, enqueue, ack fast", col: 1, row: 1, tone: "amber" },
                { id: "wb", label: "Consumer B", sub: "Processes at its own pace", col: 2, row: 1, tone: "lime" },
              ]}
              groups={[
                { label: "Polling (pull)", c1: 0, r1: 0, c2: 2, r2: 0, tone: "plain" },
                { label: "Webhook (push)", c1: 0, r1: 1, c2: 2, r2: 1, tone: "plain" },
              ]}
              edges={[
                { from: "pb", to: "pa", label: "GET changes since cursor" },
                { from: "wa", to: "wq", label: "POST event" },
                { from: "wq", to: "wb" },
              ]}
            />
          </Figure>

          <Figure caption="Change data capture and file batches. CDC reads the database log for every change; batch drops a file on a schedule.">
            <Graph
              label="CDC reads a database log into a stream; batch moves a nightly file through SFTP to a loader"
              cellW={190}
              cellH={96}
              nodeW={150}
              nodes={[
                { id: "db", label: "Source DB", sub: "Write-ahead log", col: 0, row: 0, tone: "sky", shape: "db" },
                { id: "cdc", label: "CDC reader", sub: "Row changes as events", col: 1, row: 0, tone: "amber" },
                { id: "st", label: "Stream", sub: "Ordered per key", col: 2, row: 0, tone: "lime", shape: "db" },
                { id: "legacy", label: "Legacy system", sub: "Nightly export", col: 0, row: 1, tone: "sky" },
                { id: "sftp", label: "SFTP drop", sub: "orders_20260312.csv", col: 1, row: 1, tone: "amber", shape: "db" },
                { id: "load", label: "Batch loader", sub: "Validate, load, archive", col: 2, row: 1, tone: "lime" },
              ]}
              groups={[
                { label: "Change data capture", c1: 0, r1: 0, c2: 2, r2: 0, tone: "plain" },
                { label: "File batch", c1: 0, r1: 1, c2: 2, r2: 1, tone: "plain" },
              ]}
              edges={[
                { from: "db", to: "cdc" },
                { from: "cdc", to: "st" },
                { from: "legacy", to: "sftp", label: "02:00" },
                { from: "sftp", to: "load" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "choose",
      title: "Choosing the pattern",
      body: (
        <>
          <p>
            Choose by asking four things in order: how fresh must the data be, how much changes, what
            can the source system actually do, and how much can you afford to operate.
          </p>

          <Figure caption="A map of patterns by freshness need and operational complexity. Pick the simplest one that meets the freshness requirement.">
            <Quadrant
              label="Data movement patterns plotted by operational complexity and freshness they provide"
              xLabel="Operational complexity"
              yLabel="Freshness"
              corners={["Fast and simple: use if available", "Fast, but heavy", "Slow and simple", "Avoid: slow and complex"]}
              items={[
                { label: "Webhook", x: 0.36, y: 0.8, tone: "lime" },
                { label: "Event stream", x: 0.7, y: 0.86, tone: "sky" },
                { label: "CDC", x: 0.84, y: 0.7, tone: "sky" },
                { label: "Polling", x: 0.2, y: 0.5, tone: "amber" },
                { label: "File batch", x: 0.3, y: 0.18, tone: "plain" },
                { label: "Direct API call", x: 0.1, y: 0.92, tone: "lime" },
              ]}
            />
          </Figure>

          <Flow
            direction="col"
            numbered
            steps={[
              { title: "Does B need the data only at the moment a user acts?", note: "Call the API on demand; cache if needed.", tone: "lime" },
              { title: "Is a day-old copy acceptable?", note: "Use a nightly batch. It is the simplest and most robust.", tone: "lime" },
              { title: "Does A support webhooks or events?", note: "Use them, with a queue in front and a reconciliation job behind.", tone: "amber" },
              { title: "Only an API with no push?", note: "Poll with a change cursor or updated-since filter.", tone: "amber" },
              { title: "No API but database access is allowed?", note: "Consider CDC, with the owner's approval and care for schema changes.", tone: "rose" },
            ]}
          />

          <Callout tone="tip" title="Real time is expensive">
            Customers say &ldquo;real time&rdquo; when they mean &ldquo;not a day old&rdquo;. Ask what
            decision depends on freshness. If the answer is a weekly report, a nightly job is
            correct and far cheaper than a streaming platform.
          </Callout>
        </>
      ),
    },
    {
      id: "delivery",
      title: "Delivery guarantees, duplicates and ordering",
      body: (
        <>
          <p>
            Between systems, messages can be lost, repeated or reordered. Messaging systems describe
            their behaviour with three guarantees:
          </p>
          <Table
            head={["Guarantee", "Meaning", "Consequence"]}
            rows={[
              ["At most once", "Never repeated, but may be lost", "Risk of missing data; fine for non-critical telemetry"],
              ["At least once", "Never lost, but may be repeated", "Standard choice; consumers must tolerate duplicates"],
              ["Exactly once", "Neither lost nor repeated", "Hard across independent systems; usually achieved as at-least-once plus idempotent processing"],
            ]}
          />
          <p>
            The practical design is <strong>at-least-once delivery plus idempotent processing</strong>.
            An operation is idempotent if doing it twice has the same effect as doing it once.
          </p>
          <pre>
            <code>{`def handle(event):
    key = f"{event['order_id']}:{event['version']}"      # idempotency key
    if already_processed(key):                          # stored in a table with a unique index
        return                                          # duplicate: ignore
    with transaction():
        upsert_order(event)                             # insert or update, not blind insert
        mark_processed(key)

# Out-of-order protection: only apply an event if it is newer than what we hold.
def upsert_order(e):
    cur = get_order(e["order_id"])
    if cur and cur.version >= e["version"]:
        return                                          # stale event
    save(e)`}</code>
          </pre>
          <ul>
            <li>Include a <strong>stable ID</strong> and a <strong>version or timestamp</strong> in every event.</li>
            <li>Partition queues by entity (for example order ID) so events for one order stay in order.</li>
            <li>Use a <strong>unique constraint</strong> in the database as the final duplicate guard.</li>
            <li>Prefer <strong>upserts</strong> to inserts, and <strong>set</strong> operations to <strong>increment</strong> operations.</li>
          </ul>
        </>
      ),
    },
    {
      id: "reconcile",
      title: "Reconciliation: trust but verify",
      body: (
        <>
          <p>
            Even with a good design, events get lost: a bug, a deploy at the wrong moment, a vendor
            outage. The safety net is a <strong>reconciliation job</strong> that periodically compares
            the two systems and repairs differences. It turns silent divergence into a visible,
            fixable report.
          </p>
          <pre>
            <code>{`# nightly: compare counts and checksums by day, then drill into differing days
for day in last_n_days(7):
    a = source.summary(day)     # {"count": 1204, "total": 88231.50}
    b = target.summary(day)
    if a != b:
        diffs = compare_ids(source.ids(day), target.ids(day))
        alert(day, missing_in_target=diffs.missing, extra_in_target=diffs.extra)
        enqueue_repair(diffs.missing)`}</code>
          </pre>

          <Exercise
            title="Choose and defend"
            task={
              <p>
                A customer has a CRM with webhooks and an old ERP that exposes only a nightly CSV
                export and a REST API limited to 10 calls a minute. They want invoices from the ERP
                visible in the CRM &ldquo;as soon as possible&rdquo;. Choose a pattern for the ERP
                to CRM direction and say what you would ask first.
              </p>
            }
          >
            <p>
              <strong>First question:</strong> &ldquo;What decision or action needs the invoice sooner
              than tomorrow?&rdquo; If a sales rep checks status before a call, a few hours may be
              fine.
            </p>
            <p>
              <strong>Likely answer:</strong> use the nightly CSV as the backbone (complete,
              reliable, cheap), plus a rate-limited poll of the REST API for invoices created or
              updated in the last hour to improve freshness. Both feed the same idempotent upsert
              keyed by invoice ID and version. Webhooks are unavailable on the ERP side, and CDC would
              need database access the customer may not grant. Reconcile against the nightly file to
              repair anything the poll missed.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Six patterns: API call, polling, webhooks, event streams, file batches and CDC, each with its own freshness and cost.",
    "Pick the simplest pattern that meets the real freshness need; ask what decision depends on speed.",
    "Use at-least-once delivery with idempotent processing, stable IDs, versions and entity-level ordering.",
    "Always add reconciliation to turn silent drift into a visible, repairable report.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A source system has an API but no push mechanism and changes are modest. What is a sensible pattern?",
      options: [
        "Polling with an updated-since cursor",
        "A streaming platform",
        "CDC on their production database",
        "Manual copy and paste",
      ],
      answer: 0,
      explain: "Polling with a change cursor suits modest volume when no push is available.",
    },
    {
      kind: "mcq",
      q: "How do you usually achieve effectively-exactly-once behaviour across two systems?",
      options: [
        "At-least-once delivery plus idempotent processing",
        "At-most-once delivery",
        "Ignoring duplicates",
        "Sending everything twice",
      ],
      answer: 0,
      explain: "Duplicates are tolerated because processing the same event twice has no extra effect.",
    },
    {
      kind: "mcq",
      q: "Why add a reconciliation job even when events are reliable?",
      options: [
        "It detects and repairs silent divergence from lost or misapplied events",
        "It makes events faster",
        "It replaces monitoring",
        "It removes the need for IDs",
      ],
      answer: 0,
      explain: "Bugs and outages happen; reconciliation is the safety net that makes drift visible.",
    },
    {
      kind: "mcq",
      q: "Which is the best first question when a customer asks for 'real time' sync?",
      options: [
        "What decision depends on data being that fresh?",
        "Which streaming product do you prefer?",
        "How many engineers do you have?",
        "Can we skip testing?",
      ],
      answer: 0,
      explain: "Real time is costly; the underlying decision often tolerates minutes or hours.",
    },
    {
      kind: "text",
      q: "What word describes an operation that has the same effect whether run once or many times?",
      format: "**********",
      accept: ["idempotent", "idempotency"],
      explain: "An idempotent operation can be safely retried.",
    },
  ],
};
