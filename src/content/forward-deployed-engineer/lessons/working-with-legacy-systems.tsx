import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Hard",
  objectives: [
    "Investigate an undocumented system without breaking it",
    "Pick an integration approach: API, database, file drop, message queue or screen automation",
    "Use the strangler fig pattern to migrate in safe steps",
    "Protect the legacy system from load and from your mistakes",
  ],
  tasks: [
    {
      id: "explore",
      title: "Learn the system before touching it",
      body: (
        <>
          <p>
            Legacy systems run the business and nobody fully understands them. Documentation is
            missing, the author left, and downtime is expensive. Your first job is to learn safely.
          </p>
          <ol>
            <li>
              <strong>Find the people.</strong> The long-tenured operator knows the odd cases and
              the unwritten rules.
            </li>
            <li>
              <strong>Draw the data flow.</strong> What goes in, what comes out, who consumes it,
              and on what schedule.
            </li>
            <li>
              <strong>Observe, don't change.</strong> Read logs, watch traffic, query a read replica
              or a copy.
            </li>
            <li>
              <strong>Capture behaviour with tests.</strong> Record real inputs and outputs
              (characterisation tests) so you notice if behaviour changes.
            </li>
            <li>
              <strong>Note the quirks.</strong> Fixed-width files, odd encodings, magic values,
              batch windows at 2 a.m.
            </li>
          </ol>
          <Callout tone="warn">
            Never test against production writes. Use a copy, a staging environment, or read-only
            access until you understand what an operation does.
          </Callout>
        </>
      ),
    },
    {
      id: "approaches",
      title: "Ways to integrate",
      body: (
        <>
          <Table
            head={["Approach", "How", "Watch out for"]}
            rows={[
              ["Official API", "REST, SOAP, RPC", "Best option; check rate limits and auth"],
              ["File exchange", "CSV, XML, fixed-width via SFTP", "Encodings, partial files, reprocessing"],
              ["Message queue / events", "MQ, Kafka, webhooks", "Ordering, duplicates, dead letters"],
              ["Database access", "Read from tables or views, CDC", "Bypasses business rules; schema changes; prefer read-only replica"],
              ["Screen automation (RPA)", "Drive the UI or terminal", "Fragile; last resort"],
            ]}
          />
          <p>
            Prefer the highest rung that exists: API, then events, then files, then database reads,
            then UI automation. Never write directly into a legacy database unless you fully
            understand the application logic that normally guards it.
          </p>
        </>
      ),
    },
    {
      id: "protect",
      title: "An anti-corruption layer",
      body: (
        <>
          <p>
            Put a small adapter between the legacy system and your new code. It translates odd
            formats into clean models and hides the quirks from everything else.
          </p>
          <pre>
            <code>{`# adapter: legacy fixed-width record -> clean object
def parse_record(line: str) -> Order:
    return Order(
        id=line[0:10].strip(),
        customer=line[10:40].strip(),
        total_cents=int(line[40:50]),        # legacy stores cents, zero padded
        date=datetime.strptime(line[50:58], "%Y%m%d").date(),
    )`}</code>
          </pre>
          <ul>
            <li>Throttle calls so you do not overload an old server.</li>
            <li>Cache reads that rarely change.</li>
            <li>Make writes idempotent, with retries and a dead-letter queue for failures.</li>
            <li>Alert when the legacy system is slow or down, and degrade gracefully.</li>
          </ul>
        </>
      ),
    },
    {
      id: "strangler",
      title: "Migrate with the strangler fig",
      body: (
        <>
          <p>
            Big-bang rewrites fail. The <strong>strangler fig</strong> pattern replaces a system
            piece by piece: put a facade in front, route one capability at a time to the new
            implementation, and retire the old part when nothing uses it.
          </p>
          <ol>
            <li>Place a proxy or API gateway in front of the legacy system.</li>
            <li>Pick one low-risk capability and build it in the new system.</li>
            <li>Run both in parallel and compare outputs (shadow mode).</li>
            <li>Switch traffic gradually, with a quick rollback.</li>
            <li>Decommission the old part and repeat.</li>
          </ol>
          <Callout tone="tip">
            Often the best FDE move is not to replace the legacy system at all. Wrap it, add the new
            capability beside it, and deliver value in weeks.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Learn legacy systems by talking to long-tenured people, drawing data flow and observing safely.",
    "Prefer API, then events, then files, then read-only database access, and automate the UI last.",
    "Use an adapter layer, throttling, idempotent writes and alerts to protect the old system.",
    "Migrate incrementally with the strangler fig pattern instead of a big-bang rewrite.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "You must read data from an old system with no API. Which is generally the best of these options?",
      options: [
        "Write directly into its database",
        "Read from a read-only replica or a regular file export",
        "Automate its screen with a bot as the first choice",
        "Rewrite it overnight",
      ],
      answer: 1,
      explain: "Read-only access or exports avoid corrupting data and bypassing business rules.",
    },
    {
      kind: "mcq",
      q: "What is the key idea of the strangler fig pattern?",
      options: [
        "Replace everything in one weekend",
        "Route capabilities gradually to a new system behind a facade",
        "Never change anything",
        "Delete the old database first",
      ],
      answer: 1,
      explain: "Incremental replacement reduces risk and keeps a rollback path.",
    },
    {
      kind: "mcq",
      q: "Why write characterisation tests for legacy code?",
      options: [
        "To record current behaviour so unintended changes are detected",
        "To prove the code is perfect",
        "To make the code shorter",
        "They are required by law",
      ],
      answer: 0,
      explain: "They capture what the system actually does, even when the spec is lost.",
    },
  ],
};
