import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Graph, Layers, Sequence } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Design the orchestration of a bounded multi-agent system with deterministic scaffolding",
    "Define tool contracts, permissions and structured hand-offs between agents",
    "Place human approval, limits and idempotency around write actions",
    "Handle partial failure, stale data and conflicting information",
    "Test the system with simulation and replay before it touches real bookings",
  ],
  tasks: [
    {
      id: "arch",
      title: "Architecture",
      body: (
        <>
          <p>
            The design wraps two bounded agents in an ordinary workflow engine. The workflow, not an
            agent, decides what happens next. Agents are called as steps and return structured
            results.
          </p>
          <Figure caption="The orchestrated design. A durable workflow coordinates deterministic steps, two agents and a human approval, with state persisted at every step.">
            <Graph
              label="Workflow engine coordinating impact rules, a search agent with carrier tools, a cost engine, a ranking agent, an approval step and an executor, with a state store and audit log"
              cellW={200}
              cellH={104}
              nodeW={162}
              nodes={[
                { id: "wf", label: "Workflow engine", sub: "Durable state, retries, timeouts", col: 1.5, row: 0, tone: "lime", w: 190 },
                { id: "state", label: "State store + audit", sub: "Every step and decision", col: 3, row: 0, tone: "rose", shape: "db" },
                { id: "rules", label: "Impact rules", sub: "Code", col: 0, row: 1, tone: "plain" },
                { id: "search", label: "Search agent", sub: "Read-only carrier tools", col: 1, row: 1, tone: "lime" },
                { id: "cost", label: "Cost engine", sub: "Code: rates, time, penalties", col: 2, row: 1, tone: "plain" },
                { id: "rank", label: "Ranking agent", sub: "Contracts + cost, no write", col: 3, row: 1, tone: "lime" },
                { id: "appr", label: "Planner approval", sub: "Review UI", col: 1.5, row: 2, tone: "amber", shape: "pill" },
                { id: "exec", label: "Executor", sub: "Booking APIs, idempotent", col: 3, row: 2, tone: "rose" },
              ]}
              edges={[
                { from: "wf", to: "state", both: true },
                { from: "wf", to: "rules", dashed: true },
                { from: "wf", to: "search", dashed: true },
                { from: "wf", to: "cost", dashed: true },
                { from: "wf", to: "rank", dashed: true },
                { from: "wf", to: "appr", dashed: true },
                { from: "appr", to: "exec", label: "approved plan" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "flow",
      title: "One disruption end to end",
      body: (
        <>
          <Figure caption="Sequence for one delayed shipment. Note where code, agents and a person each act, and that the executor only ever receives an approved plan.">
            <Sequence
              label="Sequence: carrier alert triggers workflow; rules compute impact; search agent queries carriers in parallel; cost engine prices options; ranking agent recommends; planner approves; executor books and drafts customer notice"
              actors={[
                { id: "wf", label: "Workflow" },
                { id: "sa", label: "Search agent" },
                { id: "ce", label: "Cost engine" },
                { id: "ra", label: "Ranking agent" },
                { id: "pl", label: "Planner" },
              ]}
              gap={150}
              messages={[
                { from: "wf", to: "wf", text: "Alert received; load shipment; compute impact" },
                { from: "wf", to: "sa", text: "Find routes (constraints, deadline)" },
                { from: "sa", to: "wf", text: "Structured options with evidence", dashed: true },
                { from: "wf", to: "ce", text: "Price each option" },
                { from: "ce", to: "wf", text: "Cost, time, penalty exposure", dashed: true },
                { from: "wf", to: "ra", text: "Options + contracts + costs" },
                { from: "ra", to: "wf", text: "Ranked list with reasons", dashed: true },
                { from: "wf", to: "pl", text: "Request approval" },
                { from: "pl", to: "wf", text: "Approve option 2 (edited note)", dashed: true },
                { note: "Executor books idempotently, then drafts the customer notice for human review.", over: ["wf", "pl"] },
              ]}
            />
          </Figure>
          <p>
            The hand-off between agents is a validated structure, never free text. The search agent
            returns:
          </p>
          <pre>
            <code>{`{
  "shipment_id": "S-77213",
  "options": [
    {
      "option_id": "o1",
      "mode": "air", "carrier": "CarrierA", "departs": "2026-03-14T06:10Z", "arrives": "2026-03-15T09:00Z",
      "capacity_confirmed": true, "evidence": {"source": "carrier_api", "fetched_at": "2026-03-13T14:02Z"},
      "constraints_ok": {"dangerous_goods": true, "temperature": true, "customs": "pending"}
    }
  ],
  "unexplored": ["CarrierC: API timeout"]
}`}</code>
          </pre>
          <ul>
            <li>The <code>evidence</code> and <code>fetched_at</code> fields let the ranker and the planner judge freshness.</li>
            <li><code>unexplored</code> makes gaps visible, so the plan does not look more complete than it is.</li>
            <li>Constraint flags are computed by code from authoritative data, and options failing a hard constraint are removed before ranking.</li>
          </ul>
        </>
      ),
    },
    {
      id: "safety",
      title: "Safety around write actions",
      body: (
        <>
          <Figure caption="Safety layers around write actions, from approval through to audit.">
            <Layers
              layers={[
                { title: "Approval", note: "No write without an approved plan tied to a specific option ID, planner and timestamp.", tone: "rose" },
                { title: "Limits", note: "Cost ceiling and cargo-value ceiling per plan; rebooking only on lanes enabled for automation.", tone: "rose" },
                { title: "Idempotent execution", note: "Booking requests carry an idempotency key from the plan ID, so retries cannot double-book.", tone: "amber" },
                { title: "Re-validation before execution", note: "Recheck capacity and price just before booking; if changed beyond a tolerance, return to the planner.", tone: "amber" },
                { title: "Compensation", note: "A defined cancel-and-restore path if a later step fails after an earlier booking succeeded.", tone: "lime" },
                { title: "Audit", note: "Immutable record of inputs, options, reasoning, approval and actions.", tone: "sky" },
              ]}
            />
          </Figure>
          <Callout tone="warn" title="Untrusted text in carrier data">
            Carrier responses and customer emails can contain text that looks like instructions. The
            search agent has no write tools, and the executor consumes only validated structured
            fields, so injected instructions cannot trigger a booking. Test this explicitly.
          </Callout>
        </>
      ),
    },
    {
      id: "failures",
      title: "Failure, staleness and conflict",
      body: (
        <>
          <Table
            head={["Situation", "Design response"]}
            rows={[
              ["A carrier API times out", "Retry with backoff; continue with other carriers; list it under 'unexplored' so the planner knows"],
              ["Rates or schedules are stale", "Show fetched_at; re-fetch the chosen option before execution; reject if it changed beyond tolerance"],
              ["Two sources disagree on capacity", "Prefer the carrier's live API; flag the conflict; do not rank on unverified capacity"],
              ["The agent returns invalid structure", "Schema-validate; retry once with the error; then fall back to manual search for the planner"],
              ["No feasible option exists", "Say so with the reasons and nearest alternatives; escalate to a human planner immediately"],
              ["Step fails after a partial booking", "Run the compensation path, notify the planner, keep the workflow state for inspection"],
              ["Spike of events from a regional outage", "Queue with priority by customer tier and deadline; rate limit carrier calls; batch similar shipments"],
            ]}
          />
          <Figure caption="State of one disruption workflow. Persisting state at every step makes the process resumable and auditable.">
            <Flow
              steps={[
                { title: "Detected", tone: "sky" },
                { title: "Assessed", tone: "sky" },
                { title: "Options found", tone: "lime" },
                { title: "Ranked", tone: "lime" },
                { title: "Awaiting approval", tone: "amber" },
                { title: "Executing", tone: "rose" },
                { title: "Closed", tone: "plain" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "test",
      title: "Testing before touching real bookings",
      body: (
        <>
          <ul>
            <li>
              <strong>Replay.</strong> Feed historical disruptions, with the planners&apos; actual
              decisions, through the system and compare recommendations. Measure agreement and cost
              difference.
            </li>
            <li>
              <strong>Simulation.</strong> A simulated carrier environment with controllable delays,
              outages and bad data allows testing failure paths safely.
            </li>
            <li>
              <strong>Constraint tests.</strong> A suite of cases where the obvious cheapest option
              violates a hard constraint; the system must never present it.
            </li>
            <li>
              <strong>Adversarial tests.</strong> Carrier responses containing injected instructions.
            </li>
            <li>
              <strong>Shadow mode.</strong> Run live alongside planners, with recommendations hidden
              until after they decide, then compare.
            </li>
          </ul>
          <Exercise
            title="Add a requirement"
            task={
              <p>
                The customer now says high-value cargo (over $250,000) must always be approved by two
                planners. Which parts of the design change?
              </p>
            }
          >
            <ul>
              <li><strong>Workflow:</strong> add a branch after ranking that checks cargo value and requires two distinct approvals before the executor step.</li>
              <li><strong>Approval UI and records:</strong> show approval count and prevent one person approving twice; record both approvers.</li>
              <li><strong>Executor:</strong> verify the approval count in code against the same threshold, as a second defence, not only in the UI.</li>
              <li><strong>Tests:</strong> add cases where a single approval must be rejected for high-value cargo, and audit entries must list both approvers.</li>
            </ul>
            <p>
              Because the policy lives in the workflow and executor, not in an agent&apos;s prompt, the
              change is small and reliably enforced.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Wrap bounded agents in a durable workflow; the workflow decides the sequence and persists state at each step.",
    "Pass validated structured hand-offs with evidence, freshness and explicit gaps.",
    "Layer approval, limits, idempotency, re-validation, compensation and audit around every write.",
    "Design responses for timeouts, stale data, conflicts, invalid output, no feasible option and partial bookings.",
    "Test with replay, simulation, constraint and adversarial suites, then shadow mode, before any live action.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Who decides the order of steps in this design?",
      options: [
        "The workflow engine",
        "The ranking agent",
        "The carrier",
        "The customer",
      ],
      answer: 0,
      explain: "A durable workflow orchestrates agents as steps, keeping control predictable and auditable.",
    },
    {
      kind: "mcq",
      q: "Why re-validate price and capacity just before booking?",
      options: [
        "Data may have changed since options were fetched",
        "To slow the process",
        "Booking requires it by law everywhere",
        "To avoid approvals",
      ],
      answer: 0,
      explain: "Stale data could produce a booking that is no longer feasible or affordable.",
    },
    {
      kind: "mcq",
      q: "How does the design protect against injected instructions in carrier text?",
      options: [
        "The reading agent has no write tools and the executor accepts only validated structured fields",
        "It trusts all text",
        "It uses longer prompts",
        "It hides carrier data",
      ],
      answer: 0,
      explain: "Separating capabilities and validating structure removes the path from injected text to action.",
    },
    {
      kind: "mcq",
      q: "A booking succeeded but the notification step failed. What should the design provide?",
      options: [
        "A defined compensation or retry path and visible state for the planner",
        "Silent failure",
        "A random retry forever",
        "Deletion of the audit log",
      ],
      answer: 0,
      explain: "Partial completion must be recoverable and visible, not silently ignored.",
    },
    {
      kind: "text",
      q: "What term describes a request that can be retried safely without double-booking? (one word)",
      format: "**********",
      accept: ["idempotent", "idempotency"],
      explain: "Idempotent operations produce the same result when repeated.",
    },
  ],
};
