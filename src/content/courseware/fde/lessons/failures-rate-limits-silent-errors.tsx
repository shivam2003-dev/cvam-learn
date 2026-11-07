import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Formula, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Hard",
  objectives: [
    "Classify failures as transient, permanent, partial or silent and respond to each",
    "Implement retries with exponential backoff and jitter, and know when not to retry",
    "Respect rate limits with throttling, queues and backpressure",
    "Use circuit breakers, dead-letter queues and idempotency to contain failures",
    "Detect silent errors with invariants, counts, reconciliation and monitoring",
  ],
  tasks: [
    {
      id: "kinds",
      title: "Four kinds of failure",
      body: (
        <>
          <p>
            Integrations fail constantly in small ways. The skill is classifying a failure quickly so
            you apply the right response. Retrying a permanent failure wastes time; giving up on a
            transient one loses data.
          </p>
          <Table
            head={["Kind", "Example", "Right response"]}
            rows={[
              ["Transient", "Timeout, 503, brief network blip, 429 rate limit", "Retry with backoff and jitter; honour Retry-After"],
              ["Permanent", "400 invalid data, 404 missing record, 401 revoked credential", "Do not retry; route to a dead-letter queue; alert a human"],
              ["Partial", "Batch of 100: 97 succeed, 3 fail; a multi-step write stops halfway", "Per-item results; make steps idempotent so re-running is safe; compensate if needed"],
              ["Silent", "A field is mapped wrongly; events are dropped; a job runs but processes zero rows", "Invariants, counts, reconciliation and alerts on absence of data"],
            ]}
          />
          <Callout tone="note" title="Silent failures are the dangerous ones">
            A loud failure pages someone. A silent one produces plausible but wrong data for weeks.
            Most of this lesson&apos;s design effort goes into making silent failures visible.
          </Callout>
        </>
      ),
    },
    {
      id: "retry",
      title: "Retries done properly",
      body: (
        <>
          <p>
            Retry only operations that are safe to repeat (idempotent), only for failures that can
            succeed later, and never in a tight loop. Use <strong>exponential backoff with
            jitter</strong>: wait longer after each failure, with a random component so many clients
            do not retry in lockstep and overwhelm a recovering service.
          </p>
          <Formula>delay = random(0, min(cap, base x 2 ^ attempt))</Formula>
          <pre>
            <code>{`import random, time

TRANSIENT = {408, 425, 429, 500, 502, 503, 504}

def call_with_retry(fn, max_attempts=5, base=0.5, cap=30):
    for attempt in range(max_attempts):
        try:
            resp = fn()
        except (TimeoutError, ConnectionError):
            resp = None
        if resp is not None and resp.status_code not in TRANSIENT:
            return resp                                   # success or permanent failure
        if attempt == max_attempts - 1:
            raise RuntimeError("giving up")               # hand to dead-letter handling
        wait = random.uniform(0, min(cap, base * 2 ** attempt))   # full jitter
        if resp is not None and "Retry-After" in resp.headers:
            wait = max(wait, float(resp.headers["Retry-After"]))
        time.sleep(wait)`}</code>
          </pre>
          <ul>
            <li>Set a <strong>timeout</strong> on every network call. A call without one can hang forever.</li>
            <li>Cap the total retry time so a task cannot stall the whole pipeline.</li>
            <li>Make the operation idempotent with an <strong>idempotency key</strong>, so a retry after an unclear failure (timeout after the server did the work) is safe.</li>
            <li>Log every retry so you can see unhealthy dependencies.</li>
          </ul>
        </>
      ),
    },
    {
      id: "limits",
      title: "Rate limits and backpressure",
      body: (
        <>
          <p>
            Customer systems often limit how fast you may call them, sometimes severely: ten requests a
            minute is not unusual for an old ERP. Exceeding the limit gets you throttled or blocked,
            and can slow the customer&apos;s own users. Design for the limit instead of discovering it
            in production.
          </p>

          <DiagramReference lesson="failures-rate-limits-silent-errors" panel={1} />

          <ul>
            <li>
              <strong>Throttle on the client side</strong> with a token bucket so you stay below the
              limit rather than bouncing off it.
            </li>
            <li>
              <strong>Use a queue</strong> as a shock absorber; bursts then wait instead of failing.
            </li>
            <li>
              <strong>Apply backpressure.</strong> When the queue grows beyond a threshold, slow or
              pause producers, or shed low-priority work, instead of letting memory fill.
            </li>
            <li>
              <strong>Batch</strong> when the API supports bulk operations; one call for 100 records
              uses one unit of the limit.
            </li>
            <li>
              <strong>Prioritise.</strong> User-triggered work should jump ahead of backfills.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "contain",
      title: "Containing failures",
      body: (
        <>
          <Table
            head={["Tool", "What it does", "When"]}
            rows={[
              ["Circuit breaker", "After repeated failures, stop calling a dependency for a while and fail fast; test occasionally to recover", "A downstream system is down or very slow"],
              ["Dead-letter queue (DLQ)", "Park messages that cannot be processed after retries, with the error, for inspection and replay", "Permanent or poison messages"],
              ["Bulkhead", "Separate resource pools so one slow dependency cannot starve others", "Several integrations in one service"],
              ["Fallback or graceful degradation", "Serve cached or partial results, or route to a human", "Non-critical features; AI services unavailable"],
              ["Timeout and deadline", "Bound the time spent on any call or task", "Always"],
            ]}
          />
          <DiagramReference lesson="failures-rate-limits-silent-errors" panel={2} />
        </>
      ),
    },
    {
      id: "silent",
      title: "Making silent errors visible",
      body: (
        <>
          <p>
            Silent errors need active detection. Build several independent checks, since each catches
            a different class of problem.
          </p>
          <DiagramReference lesson="failures-rate-limits-silent-errors" panel={3} />

          <Exercise
            title="Find the silent failure"
            task={
              <p>
                A nightly job syncs invoices to the ERP. It reports &ldquo;success&rdquo; every night.
                A month later finance finds 3% of invoices are missing. List three checks that would
                have caught it earlier.
              </p>
            }
          >
            <ol>
              <li>
                <strong>Reconciliation:</strong> nightly comparison of invoice counts and totals
                between source and ERP by day, alerting on any difference.
              </li>
              <li>
                <strong>Rows-processed monitor:</strong> alert if the job&apos;s processed count is
                below a threshold or differs from the source count, instead of trusting an exit
                status.
              </li>
              <li>
                <strong>Per-record outcome tracking:</strong> record each invoice as succeeded or
                failed, with failures going to a dead-letter queue and an alert, so failures cannot
                be swallowed.
              </li>
            </ol>
            <p>
              The root cause is that &ldquo;the job finished&rdquo; was treated as &ldquo;the data is
              correct&rdquo;. Measure outcomes, not completion.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Classify failures as transient, permanent, partial or silent, and respond differently to each.",
    "Retry only idempotent operations, with timeouts, exponential backoff, jitter and a cap.",
    "Respect rate limits with client-side throttling, queues, batching and backpressure.",
    "Contain failures with circuit breakers, dead-letter queues, bulkheads and fallbacks.",
    "Detect silent errors with reconciliation, invariants, volume monitors, validation and canaries.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A call returns HTTP 400 because a field is invalid. What should you do?",
      options: [
        "Do not retry; send it to a dead-letter queue and alert",
        "Retry forever",
        "Retry in a tight loop",
        "Ignore it",
      ],
      answer: 0,
      explain: "A 400 is a permanent failure; retrying will not fix invalid data.",
    },
    {
      kind: "mcq",
      q: "Why add jitter to backoff?",
      options: [
        "So many clients do not retry at the same moment and overwhelm a recovering service",
        "To make delays predictable",
        "To avoid timeouts",
        "To reduce logging",
      ],
      answer: 0,
      explain: "Random spread prevents synchronised retry storms.",
    },
    {
      kind: "mcq",
      q: "A job reports success but processed zero rows. What kind of failure is this?",
      options: ["Silent", "Transient", "Loud", "Rate limit"],
      answer: 0,
      explain: "It completed without error but did not do the work, so nothing alerts anyone unless you monitor outcomes.",
    },
    {
      kind: "mcq",
      q: "What does a circuit breaker do after repeated failures?",
      options: [
        "Fails fast for a cool-down instead of calling the broken dependency",
        "Doubles the retries",
        "Deletes the queue",
        "Restarts the database",
      ],
      answer: 0,
      explain: "It protects both your system and the struggling dependency, then tests for recovery.",
    },
    {
      kind: "text",
      q: "What is the name of the queue that holds messages that cannot be processed after retries? (three words, hyphenated first two)",
      format: "****-****** *****",
      accept: ["dead-letter queue", "dead letter queue", "dlq"],
      explain: "A dead-letter queue parks failed messages for inspection and replay.",
    },
  ],
};
